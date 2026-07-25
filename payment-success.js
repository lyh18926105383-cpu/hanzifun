(function() {
    const title = document.getElementById('successTitle');
    const message = document.getElementById('successMessage');
    const eyebrow = document.getElementById('statusEyebrow');
    const icon = document.getElementById('statusIcon');
    const details = document.getElementById('subscriptionDetails');
    const subscriptionId = document.getElementById('subscriptionId');
    const subscriptionStatus = document.getElementById('subscriptionStatus');
    const subscriptionPeriodEnd = document.getElementById('subscriptionPeriodEnd');

    const STATUS_LABELS = {
        active: '已生效',
        trialing: '试用中',
        scheduled_cancel: '将在本期结束后取消',
        paused: '已暂停',
        canceled: '已取消',
        unpaid: '待付款',
        past_due: '付款逾期',
        expired: '已过期',
    };

    function formatDate(value) {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function showError(errorMessage) {
        icon.textContent = '!';
        icon.className = 'status-icon is-error';
        eyebrow.textContent = '尚未确认';
        title.textContent = '暂时无法确认订阅';
        message.textContent = errorMessage || '请返回定价页重试；如已完成测试支付，可稍后刷新本页。';
    }

    async function verify() {
        if (!window.location.search) {
            showError('这个页面缺少 CREEM 支付回跳信息，请从定价页重新发起测试订阅。');
            return;
        }

        try {
            const response = await fetch(`/api/creem/verify-success${window.location.search}`, {
                headers: { accept: 'application/json' },
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.verified || !result.subscription) {
                throw new Error(result.error || 'CREEM 订阅状态核验失败。');
            }

            const subscription = result.subscription;
            icon.textContent = subscription.hasAccess ? '✓' : 'i';
            icon.className = subscription.hasAccess
                ? 'status-icon is-success'
                : 'status-icon is-pending';
            eyebrow.textContent = subscription.hasAccess ? '订阅已确认' : '支付结果已确认';
            title.textContent = subscription.hasAccess ? '月度订阅成功！' : '订阅状态需要留意';
            message.textContent = subscription.hasAccess
                ? '测试支付和订阅状态均已通过服务端核验，可以返回汉字饭继续学习。'
                : `CREEM 返回的当前状态是“${STATUS_LABELS[subscription.status] || subscription.status}”，暂未开放会员权限。`;
            subscriptionId.textContent = subscription.id;
            subscriptionStatus.textContent = STATUS_LABELS[subscription.status] || subscription.status;
            subscriptionPeriodEnd.textContent = formatDate(subscription.currentPeriodEndDate);
            details.hidden = false;
        } catch (error) {
            showError(error.message);
        }
    }

    verify();
})();
