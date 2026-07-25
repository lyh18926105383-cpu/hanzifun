const CREEM_TEST_API_BASE = 'https://test-api.creem.io';
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'scheduled_cancel']);
const CREEM_REDIRECT_FIELDS = new Set([
    'request_id',
    'checkout_id',
    'order_id',
    'customer_id',
    'subscription_id',
    'product_id',
]);

function jsonResponse(body, status = 200, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            ...headers,
        },
    });
}

function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}

function requireCreemConfiguration(env) {
    if (!env.CREEM_API_KEY || !env.CREEM_PRODUCT_ID) {
        throw new Error('CREEM_NOT_CONFIGURED');
    }
}

function isSameOriginRequest(request, env) {
    const origin = request.headers.get('origin');
    if (!origin) return true;

    try {
        const originUrl = new URL(origin);
        if (originUrl.origin === new URL(request.url).origin) return true;

        const isLocalDevelopmentOrigin = originUrl.hostname === 'localhost'
            || originUrl.hostname === '127.0.0.1'
            || originUrl.hostname === '[::1]';
        return env.CREEM_ALLOW_LOCAL_ORIGIN === 'true' && isLocalDevelopmentOrigin;
    } catch {
        return false;
    }
}

async function readCreemResponse(response) {
    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        const traceId = data && typeof data.trace_id === 'string' ? data.trace_id : null;
        console.error('CREEM API request failed', {
            status: response.status,
            traceId,
        });
        throw new Error('CREEM_API_ERROR');
    }

    return data;
}

export async function createCheckout(request, env, fetchImpl = fetch) {
    requireCreemConfiguration(env);

    const requestUrl = new URL(request.url);
    const successUrl = new URL('/payment-success.html', requestUrl.origin);
    const requestId = `hanzifun_${crypto.randomUUID()}`;
    const response = await fetchImpl(`${CREEM_TEST_API_BASE}/v1/checkouts`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': env.CREEM_API_KEY,
        },
        body: JSON.stringify({
            product_id: env.CREEM_PRODUCT_ID,
            request_id: requestId,
            success_url: successUrl.toString(),
            metadata: {
                source: 'hanzifun_pricing',
                plan: 'monthly',
            },
        }),
    });
    const checkout = await readCreemResponse(response);

    if (!checkout || typeof checkout.checkout_url !== 'string') {
        throw new Error('CREEM_INVALID_RESPONSE');
    }

    const checkoutUrl = new URL(checkout.checkout_url);
    if (checkoutUrl.protocol !== 'https:') {
        throw new Error('CREEM_INVALID_RESPONSE');
    }

    return {
        checkoutUrl: checkoutUrl.toString(),
        checkoutId: typeof checkout.id === 'string' ? checkout.id : null,
    };
}

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left, right) {
    if (left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index += 1) {
        difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }
    return difference === 0;
}

export async function verifyRedirectSignature(searchParams, apiKey) {
    const signature = searchParams.get('signature') || '';
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

    const parts = [];
    for (const [key, value] of searchParams.entries()) {
        if (key === 'signature') continue;
        if (!CREEM_REDIRECT_FIELDS.has(key)) return false;
        if (!value || value === 'null') continue;
        parts.push(`${key}=${value}`);
    }
    parts.push(`salt=${apiKey}`);

    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(parts.join('|')),
    );
    const expected = bytesToHex(new Uint8Array(digest));
    return constantTimeEqual(expected, signature.toLowerCase());
}

export async function retrieveSubscription(subscriptionId, env, fetchImpl = fetch) {
    const endpoint = new URL(`${CREEM_TEST_API_BASE}/v1/subscriptions`);
    endpoint.searchParams.set('subscription_id', subscriptionId);
    const response = await fetchImpl(endpoint, {
        headers: {
            'x-api-key': env.CREEM_API_KEY,
        },
    });
    return readCreemResponse(response);
}

export async function verifySuccessfulCheckout(request, env, fetchImpl = fetch) {
    requireCreemConfiguration(env);

    const url = new URL(request.url);
    const isValid = await verifyRedirectSignature(url.searchParams, env.CREEM_API_KEY);
    if (!isValid) return errorResponse('支付回跳签名无效', 401);

    const productId = url.searchParams.get('product_id');
    const subscriptionId = url.searchParams.get('subscription_id');
    const checkoutId = url.searchParams.get('checkout_id');

    if (productId !== env.CREEM_PRODUCT_ID) {
        return errorResponse('支付产品不匹配', 403);
    }
    if (!subscriptionId || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
        return errorResponse('没有找到月订阅信息', 422);
    }

    const subscription = await retrieveSubscription(subscriptionId, env, fetchImpl);
    if (!subscription || subscription.id !== subscriptionId) {
        return errorResponse('订阅信息校验失败', 502);
    }

    const subscriptionProductId = typeof subscription.product === 'string'
        ? subscription.product
        : subscription.product && subscription.product.id;
    if (subscriptionProductId && subscriptionProductId !== env.CREEM_PRODUCT_ID) {
        return errorResponse('订阅产品不匹配', 403);
    }

    const status = typeof subscription.status === 'string' ? subscription.status : 'unknown';
    return jsonResponse({
        verified: true,
        checkoutId,
        subscription: {
            id: subscription.id,
            status,
            hasAccess: ACTIVE_SUBSCRIPTION_STATUSES.has(status),
            currentPeriodEndDate: subscription.current_period_end_date || null,
        },
    });
}

async function computeWebhookSignature(rawBody, secret) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(rawBody),
    );
    return bytesToHex(new Uint8Array(signature));
}

export async function handleWebhook(request, env) {
    if (!env.CREEM_WEBHOOK_SECRET) {
        return errorResponse('Webhook 尚未配置', 503);
    }

    const signature = request.headers.get('creem-signature') || '';
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
        return errorResponse('缺少有效的 Webhook 签名', 401);
    }

    const rawBody = await request.text();
    const expected = await computeWebhookSignature(rawBody, env.CREEM_WEBHOOK_SECRET);
    if (!constantTimeEqual(expected, signature.toLowerCase())) {
        return errorResponse('Webhook 签名无效', 401);
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return errorResponse('Webhook 内容不是有效 JSON', 400);
    }
    if (!event || typeof event.id !== 'string' || typeof event.eventType !== 'string') {
        return errorResponse('Webhook 事件格式无效', 400);
    }

    // 预留点：接入账户与数据库后，在这里按 event.id 做幂等去重，并同步订阅权限。
    // CREEM 可能重试事件，因此在持久化完成前不要把这里当作授权依据。
    console.log('Verified CREEM webhook event', {
        id: event.id,
        type: event.eventType,
        objectId: event.object && event.object.id,
    });
    return jsonResponse({ received: true });
}

async function handleApiRequest(request, env, fetchImpl) {
    const url = new URL(request.url);

    if (url.pathname === '/api/creem/checkout') {
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
        if (!isSameOriginRequest(request, env)) return errorResponse('跨站请求已拒绝', 403);

        try {
            return jsonResponse(await createCheckout(request, env, fetchImpl));
        } catch (error) {
            if (error.message === 'CREEM_NOT_CONFIGURED') {
                return errorResponse('支付服务尚未配置', 503);
            }
            console.error('Unable to create CREEM checkout', error);
            return errorResponse('暂时无法创建支付页面，请稍后再试', 502);
        }
    }

    if (url.pathname === '/api/creem/verify-success') {
        if (request.method !== 'GET') return errorResponse('Method not allowed', 405);
        try {
            return await verifySuccessfulCheckout(request, env, fetchImpl);
        } catch (error) {
            if (error.message === 'CREEM_NOT_CONFIGURED') {
                return errorResponse('支付服务尚未配置', 503);
            }
            console.error('Unable to verify CREEM checkout', error);
            return errorResponse('暂时无法核验订阅状态，请稍后再试', 502);
        }
    }

    if (url.pathname === '/api/creem/webhook') {
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
        return handleWebhook(request, env);
    }

    return errorResponse('Not found', 404);
}

export async function handleRequest(request, env, context, fetchImpl = fetch) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
        return handleApiRequest(request, env, fetchImpl);
    }
    if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
        return new Response('Static assets binding is unavailable', { status: 500 });
    }
    return env.ASSETS.fetch(request);
}

export default {
    fetch(request, env, context) {
        return handleRequest(request, env, context);
    },
};
