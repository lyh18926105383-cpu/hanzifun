const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash, createHmac } = require('node:crypto');

let worker;

test.before(async () => {
    worker = await import('../worker.mjs');
});

test('服务端使用 CREEM 测试 API 创建月订阅 Checkout，且不向浏览器暴露 API Key', async () => {
    const env = {
        CREEM_API_KEY: 'creem_test_server_only',
        CREEM_PRODUCT_ID: 'prod_monthly123',
    };
    let outbound;
    const mockFetch = async (url, init) => {
        outbound = { url: String(url), init };
        return Response.json({
            id: 'ch_test123',
            checkout_url: 'https://checkout.creem.io/ch_test123',
            status: 'pending',
        });
    };
    const request = new Request('https://hanzifun.online/api/creem/checkout', {
        method: 'POST',
        headers: { origin: 'https://hanzifun.online' },
    });

    const response = await worker.handleRequest(request, env, {}, mockFetch);
    const result = await response.json();
    const payload = JSON.parse(outbound.init.body);

    assert.equal(response.status, 200);
    assert.equal(outbound.url, 'https://test-api.creem.io/v1/checkouts');
    assert.equal(outbound.init.headers['x-api-key'], env.CREEM_API_KEY);
    assert.equal(payload.product_id, env.CREEM_PRODUCT_ID);
    assert.equal(payload.success_url, 'https://hanzifun.online/payment-success.html');
    assert.match(payload.request_id, /^hanzifun_/);
    assert.equal(result.checkoutUrl, 'https://checkout.creem.io/ch_test123');
    assert.equal(JSON.stringify(result).includes(env.CREEM_API_KEY), false);
});

test('Checkout API 拒绝跨站创建请求', async () => {
    const request = new Request('https://hanzifun.online/api/creem/checkout', {
        method: 'POST',
        headers: { origin: 'https://example.com' },
    });
    const response = await worker.handleRequest(request, {
        CREEM_API_KEY: 'creem_test_server_only',
        CREEM_PRODUCT_ID: 'prod_monthly123',
    }, {}, async () => {
        throw new Error('不应请求 CREEM');
    });

    assert.equal(response.status, 403);
});

test('远程开发模式可以显式允许 localhost 来源', async () => {
    const request = new Request('https://temporary-preview.workers.dev/api/creem/checkout', {
        method: 'POST',
        headers: { origin: 'http://localhost:8787' },
    });
    const response = await worker.handleRequest(request, {
        CREEM_API_KEY: 'creem_test_server_only',
        CREEM_PRODUCT_ID: 'prod_monthly123',
        CREEM_ALLOW_LOCAL_ORIGIN: 'true',
    }, {}, async () => Response.json({
        id: 'ch_remote123',
        checkout_url: 'https://creem.io/test/checkout/ch_remote123',
        status: 'pending',
    }));

    assert.equal(response.status, 200);
    assert.equal((await response.json()).checkoutId, 'ch_remote123');
});

test('成功页回跳签名有效时由服务端查询并确认订阅状态', async () => {
    const apiKey = 'creem_test_signature_key';
    const productId = 'prod_monthly123';
    const canonical = [
        'request_id=hanzifun_order123',
        'checkout_id=ch_test123',
        'customer_id=cust_test123',
        'subscription_id=sub_test123',
        `product_id=${productId}`,
        `salt=${apiKey}`,
    ].join('|');
    const signature = createHash('sha256').update(canonical).digest('hex');
    const query = new URLSearchParams([
        ['request_id', 'hanzifun_order123'],
        ['checkout_id', 'ch_test123'],
        ['customer_id', 'cust_test123'],
        ['subscription_id', 'sub_test123'],
        ['product_id', productId],
        ['signature', signature],
    ]);
    let requestedUrl;
    const mockFetch = async url => {
        requestedUrl = new URL(url);
        return Response.json({
            id: 'sub_test123',
            status: 'active',
            product: { id: productId },
            current_period_end_date: '2026-08-25T00:00:00.000Z',
            customer: { email: 'private@example.com' },
        });
    };
    const request = new Request(`https://hanzifun.online/api/creem/verify-success?${query}`);
    const response = await worker.handleRequest(request, {
        CREEM_API_KEY: apiKey,
        CREEM_PRODUCT_ID: productId,
    }, {}, mockFetch);
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.equal(requestedUrl.origin, 'https://test-api.creem.io');
    assert.equal(requestedUrl.pathname, '/v1/subscriptions');
    assert.equal(requestedUrl.searchParams.get('subscription_id'), 'sub_test123');
    assert.deepEqual(result.subscription, {
        id: 'sub_test123',
        status: 'active',
        hasAccess: true,
        currentPeriodEndDate: '2026-08-25T00:00:00.000Z',
    });
    assert.equal(JSON.stringify(result).includes('private@example.com'), false);
});

test('成功页拒绝伪造的 CREEM 回跳参数', async () => {
    const request = new Request(
        'https://hanzifun.online/api/creem/verify-success'
        + '?checkout_id=ch_fake&subscription_id=sub_fake&product_id=prod_monthly123&signature='
        + '0'.repeat(64),
    );
    const response = await worker.handleRequest(request, {
        CREEM_API_KEY: 'creem_test_signature_key',
        CREEM_PRODUCT_ID: 'prod_monthly123',
    }, {}, async () => {
        throw new Error('不应请求 CREEM');
    });

    assert.equal(response.status, 401);
});

test('Webhook 预留端点验证 creem-signature 后确认接收', async () => {
    const secret = 'whsec_test123';
    const rawBody = JSON.stringify({
        id: 'evt_test123',
        eventType: 'subscription.active',
        object: { id: 'sub_test123' },
    });
    const signature = createHmac('sha256', secret).update(rawBody).digest('hex');
    const request = new Request('https://hanzifun.online/api/creem/webhook', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'creem-signature': signature,
        },
        body: rawBody,
    });

    const response = await worker.handleRequest(request, {
        CREEM_WEBHOOK_SECRET: secret,
    }, {});

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { received: true });
});

test('没有配置 Webhook secret 时端点保持禁用', async () => {
    const request = new Request('https://hanzifun.online/api/creem/webhook', {
        method: 'POST',
        body: '{}',
    });
    const response = await worker.handleRequest(request, {}, {});

    assert.equal(response.status, 503);
});
