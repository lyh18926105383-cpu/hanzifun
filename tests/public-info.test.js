const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const publicPages = [
    'index.html',
    'story.html',
    'pricing.html',
    'privacy.html',
    'terms.html',
    'payment-success.html',
];

test('全站公开页面都有可点击的价格、隐私、条款和客服入口', () => {
    for (const page of publicPages) {
        const html = read(page);
        assert.match(html, /href="pricing\.html"/, `${page} 缺少价格页链接`);
        assert.match(html, /href="privacy\.html"/, `${page} 缺少隐私政策链接`);
        assert.match(html, /href="terms\.html"/, `${page} 缺少服务条款链接`);
        assert.match(
            html,
            /href="mailto:lyh18926105383@gmail\.com"/,
            `${page} 缺少客服邮箱链接`,
        );
    }
});

test('价格页公开显示免费内容、正式价格和关键订阅规则', () => {
    const html = read('pricing.html');
    assert.match(html, /US\$0/);
    assert.match(html, /US\$1/);
    assert.match(html, /每个计费周期为 1 个月/);
    assert.match(html, /按月自动续费/);
    assert.match(html, /随时取消/);
    assert.match(html, /付款由 Creem 处理/);
});

test('隐私政策和服务条款包含 Creem 与儿童使用说明', () => {
    const privacy = read('privacy.html');
    const terms = read('terms.html');

    assert.match(privacy, /付款由 Creem 处理/);
    assert.match(privacy, /本机学习记录/);
    assert.match(privacy, /怎样查看、删除或更正/);
    assert.match(terms, /儿童识字|认识汉字/);
    assert.match(terms, /家长或监护人/);
    assert.match(terms, /自动续费/);
    assert.match(terms, /退款规则/);
    assert.match(terms, /内容和版权/);
    assert.match(terms, /服务更新、中断和终止/);
});
