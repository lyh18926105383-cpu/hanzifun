(function() {
    const button = document.getElementById('subscribeButton');
    const message = document.getElementById('checkoutMessage');
    if (!button || !message) return;

    button.addEventListener('click', async function() {
        button.disabled = true;
        button.classList.add('is-loading');
        button.querySelector('.button-label').textContent = '正在打开安全支付页…';
        message.textContent = '';

        try {
            const response = await fetch('/api/creem/checkout', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                },
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.checkoutUrl) {
                throw new Error(result.error || '暂时无法创建支付页面');
            }

            window.location.assign(result.checkoutUrl);
        } catch (error) {
            message.textContent = error.message || '暂时无法创建支付页面，请稍后再试。';
            button.disabled = false;
            button.classList.remove('is-loading');
            button.querySelector('.button-label').textContent = '订阅 US$1/月';
        }
    });
})();
