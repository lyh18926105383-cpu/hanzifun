(function(root, factory) {
    const helpers = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = helpers;
    }
    root.HanziFunLearning = helpers;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    function getActiveIndices(cardCount, reviewQueue, isReviewMode) {
        if (isReviewMode) return [...reviewQueue];
        return Array.from({ length: cardCount }, (_, index) => index);
    }

    function getProgress(statuses, activeIndices) {
        const total = activeIndices.length;
        const completed = activeIndices.filter(index => statuses[index] !== null).length;

        return {
            total,
            completed,
            remaining: total - completed,
            percent: total === 0 ? 0 : (completed / total) * 100,
            familiar: statuses.filter(status => status === true).length,
            unfamiliar: statuses.filter(status => status === false).length,
        };
    }

    function findNextUnassessed(activeIndices, currentIndex, statuses) {
        const currentPosition = activeIndices.indexOf(currentIndex);
        const laterUnassessed = activeIndices
            .slice(currentPosition + 1)
            .find(index => statuses[index] === null);

        return laterUnassessed !== undefined
            ? laterUnassessed
            : activeIndices.find(index => statuses[index] === null);
    }

    function buildReviewQueue(statuses) {
        return statuses.reduce((queue, status, index) => {
            if (status === false || status === null) queue.push(index);
            return queue;
        }, []);
    }

    return { getActiveIndices, getProgress, findNextUnassessed, buildReviewQueue };
});

(function() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const {
        getActiveIndices,
        getProgress,
        findNextUnassessed,
        buildReviewQueue,
    } = window.HanziFunLearning;

    function positionHeader() {
        var header = document.querySelector('.site-header');
        var startScreen = document.querySelector('.start-screen');
        if (!header || !startScreen) return;
        var learningActive = startScreen.classList.contains('hidden');
        header.classList.toggle('learning-hidden', learningActive);
        if (learningActive) return;
        var startTop = startScreen.getBoundingClientRect().top;
        var headerHeight = header.offsetHeight;
        header.style.top = Math.max(0, (startTop - headerHeight) / 2) + 'px';
    }
    window.addEventListener('load', positionHeader);
    window.addEventListener('resize', positionHeader);

    const fullLibrary = window.HANZI_LIBRARY;
    const storageApi = window.HanziFunStorage;

    if (!Array.isArray(fullLibrary) || !storageApi) {
        throw new Error('汉字饭资源加载失败');
    }

    function getBrowserStorage() {
        try {
            return window.localStorage;
        } catch (error) {
            return null;
        }
    }

    const learningStore = storageApi.createStore(getBrowserStorage());

    // ============ DOM元素 ============
    const startScreen = document.getElementById('startScreen');
    const learnScreen = document.getElementById('learnScreen');
    const cardContainer = document.getElementById('cardContainer');
    const card = document.getElementById('card');
    const hanziDisplay = document.getElementById('hanziDisplay');
    const imageDisplay = document.getElementById('imageDisplay');
    const wordLabel = document.getElementById('wordLabel');
    const hintText = document.getElementById('hintText');
    const typeBadge = document.getElementById('typeBadge');
    const btnFamiliar = document.getElementById('btnFamiliar');
    const btnUnfamiliar = document.getElementById('btnUnfamiliar');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const familiarCountEl = document.getElementById('familiarCount');
    const unfamiliarCountEl = document.getElementById('unfamiliarCount');
    const remainingCountEl = document.getElementById('remainingCount');
    const summaryOverlay = document.getElementById('summaryOverlay');
    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryTitle = document.getElementById('summaryTitle');
    const summaryFamiliar = document.getElementById('summaryFamiliar');
    const summaryUnfamiliar = document.getElementById('summaryUnfamiliar');
    const btnReview = document.getElementById('btnReview');
    const btnRestart = document.getElementById('btnRestart');
    const btnCloseSummary = document.getElementById('btnCloseSummary');
    const btnBackStartFromSummary = document.getElementById('btnBackStartFromSummary');
    const btnBackToStart = document.getElementById('btnBackToStart');
    const toast = document.getElementById('toast');
    const customInputArea = document.getElementById('customInputArea');
    const customCountInput = document.getElementById('customCount');
    const btnCustomToggle = document.getElementById('btnCustomToggle');
    const btnCustomGo = document.getElementById('btnCustomGo');
    const btnOpenHistory = document.getElementById('btnOpenHistory');
    const historyOpenSummary = document.getElementById('historyOpenSummary');
    const historyOverlay = document.getElementById('historyOverlay');
    const btnCloseHistory = document.getElementById('btnCloseHistory');
    const btnClearHistory = document.getElementById('btnClearHistory');
    const historyClearConfirm = document.getElementById('historyClearConfirm');
    const btnCancelClearHistory = document.getElementById('btnCancelClearHistory');
    const btnConfirmClearHistory = document.getElementById('btnConfirmClearHistory');
    const historyRoundCount = document.getElementById('historyRoundCount');
    const historyCharacterCount = document.getElementById('historyCharacterCount');
    const historyWeakCount = document.getElementById('historyWeakCount');
    const weakCharactersEl = document.getElementById('weakCharacters');
    const recentSessionsEl = document.getElementById('recentSessions');

    // ============ 状态 ============
    let currentCards = []; // 当前轮次的卡片数据
    let currentIndex = 0;
    let isFlipped = false;
    let isAnimating = false;
    let familiarStatus = []; // null=未标记, true=熟悉, false=不熟悉
    let reviewQueue = [];
    let isReviewMode = false;
    let hasSavedCurrentPass = false;
    let toastTimer = null;
    let totalSelectedCount = 5;

    function formatSessionTime(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }

    function renderLearningHistory() {
        const dashboard = learningStore.getDashboard();
        historyRoundCount.textContent = dashboard.learningRounds;
        historyCharacterCount.textContent = dashboard.learnedCharacters;
        historyWeakCount.textContent = dashboard.weakCharacters.length;
        historyOpenSummary.textContent = dashboard.learningRounds === 0
            ? '尚无记录'
            : `${dashboard.learningRounds}轮 · 薄弱${dashboard.weakCharacters.length}字`;
        weakCharactersEl.textContent = dashboard.weakCharacters.length === 0
            ? '目前没有薄弱字'
            : dashboard.weakCharacters.map(item => item.char).join(' · ');

        recentSessionsEl.replaceChildren();
        if (dashboard.recentSessions.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'history-empty';
            empty.textContent = '完成一轮学习后会显示记录';
            recentSessionsEl.appendChild(empty);
            return;
        }

        dashboard.recentSessions.forEach(session => {
            const row = document.createElement('div');
            row.className = 'recent-session-row';

            const main = document.createElement('div');
            main.className = 'session-main';
            main.textContent = `${session.kind === 'review' ? '复习' : '学习'} ${session.total} 个字`;

            const time = document.createElement('time');
            time.className = 'session-time';
            time.dateTime = new Date(session.completedAt).toISOString();
            time.textContent = formatSessionTime(session.completedAt);

            const result = document.createElement('div');
            result.className = 'session-result';
            result.textContent = `熟悉 ${session.familiar} · 不熟悉 ${session.unfamiliar}`;

            row.append(main, time, result);
            recentSessionsEl.appendChild(row);
        });
    }

    function openLearningHistory() {
        renderLearningHistory();
        historyClearConfirm.hidden = true;
        historyOverlay.classList.add('show');
        historyOverlay.setAttribute('aria-hidden', 'false');
        btnCloseHistory.focus();
    }

    function closeLearningHistory() {
        historyClearConfirm.hidden = true;
        historyOverlay.classList.remove('show');
        historyOverlay.setAttribute('aria-hidden', 'true');
    }

    function clearLearningHistory() {
        const dashboard = learningStore.getDashboard();
        if (dashboard.recentSessions.length === 0) {
            showToast('当前设备还没有学习记录', '📊');
            return;
        }

        historyClearConfirm.hidden = false;
        btnConfirmClearHistory.focus();
    }

    function confirmClearLearningHistory() {
        const cleared = learningStore.clear();
        historyClearConfirm.hidden = true;
        renderLearningHistory();
        showToast(cleared ? '学习记录已清空' : '浏览器未允许清空记录', cleared ? '✅' : '💡');
    }

    function saveCurrentPass() {
        if (hasSavedCurrentPass || currentCards.length === 0) return;
        const activeIndices = getActiveIndices(currentCards.length, reviewQueue, isReviewMode);
        const statuses = activeIndices.map(index => familiarStatus[index]);
        if (statuses.some(status => typeof status !== 'boolean')) return;

        const outcome = learningStore.record({
            kind: isReviewMode ? 'review' : 'learning',
            cards: activeIndices.map(index => currentCards[index]),
            statuses,
        });
        hasSavedCurrentPass = true;
        renderLearningHistory();
        if (!outcome.saved) {
            console.warn('学习记录仅在当前页面暂存，浏览器未允许本机存储。');
        }
    }

    // ============ Fisher-Yates洗牌 ============
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ============ 选取卡片 ============
    function selectCards(count) {
        const shuffled = shuffle(fullLibrary);
        return shuffled.slice(0, Math.min(count, fullLibrary.length));
    }

    // ============ 更新卡片内容 ============
    function updateCardContent() {
        if (currentCards.length === 0) return;
        const data = currentCards[currentIndex];
        hanziDisplay.textContent = data.char;
        imageDisplay.textContent = data.emoji;
        wordLabel.textContent = data.word;
        hintText.textContent = data.hint;
        typeBadge.textContent = data.type === 'noun' ? '名词' : '动词→名词';
        typeBadge.className = 'type-badge ' + (data.type === 'noun' ? 'noun' : 'verb');
    }

    function updateProgress() {
        if (currentCards.length === 0) return;
        const activeIndices = getActiveIndices(currentCards.length, reviewQueue, isReviewMode);
        const progress = getProgress(familiarStatus, activeIndices);
        const progressPercent = Math.min(100, Math.max(0, progress.percent));
        progressBar.style.width = progressPercent + '%';
        progressText.textContent = progress.completed + ' / ' + progress.total;
        familiarCountEl.textContent = progress.familiar;
        unfamiliarCountEl.textContent = progress.unfamiliar;
        remainingCountEl.textContent = progress.remaining;
    }

    function updateButtonLabels() {
        if (isFlipped) {
            btnFamiliar.innerHTML = '✅ 记住了';
            btnUnfamiliar.innerHTML = '➡️ 下一个';
        } else {
            btnFamiliar.innerHTML = '✅ 熟悉';
            btnUnfamiliar.innerHTML = '🔍 不熟悉';
        }
    }

    function setAnimating(animating) {
        isAnimating = animating;
        btnFamiliar.disabled = animating;
        btnUnfamiliar.disabled = animating;
        cardContainer.style.pointerEvents = animating ? 'none' : 'auto';
        cardContainer.style.cursor = animating ? 'default' : 'pointer';
    }

    function speakCard() {
        if (!window.speechSynthesis) return;
        if (currentCards.length === 0) return;
        const data = currentCards[currentIndex];
        window.speechSynthesis.cancel();
        var utterChar = new SpeechSynthesisUtterance(data.char);
        utterChar.lang = 'zh-CN';
        utterChar.rate = 0.85;
        var utterHint = new SpeechSynthesisUtterance(data.hint);
        utterHint.lang = 'zh-CN';
        utterHint.rate = 0.8;
        utterChar.onend = function() {
            setTimeout(function() {
                window.speechSynthesis.speak(utterHint);
            }, 400);
        };
        window.speechSynthesis.speak(utterChar);
    }

    function flipCard() {
        if (isAnimating) return;
        setAnimating(true);
        isFlipped = !isFlipped;
        card.classList.toggle('flipped', isFlipped);
        updateButtonLabels();
        if (navigator.vibrate) navigator.vibrate(8);
        setTimeout(() => setAnimating(false), 520);
    }

    function markAsFamiliar() {
        familiarStatus[currentIndex] = true;
        updateProgress();
    }

    function markAsUnfamiliar() {
        familiarStatus[currentIndex] = false;
        updateProgress();
    }

    function goToNextCard() {
        if (isAnimating) return;
        if (currentCards.length === 0) return;

        const activeIndices = getActiveIndices(currentCards.length, reviewQueue, isReviewMode);
        const nextIndex = findNextUnassessed(activeIndices, currentIndex, familiarStatus);

        if (nextIndex === undefined) {
            showSummary();
            return;
        }

        if (isFlipped) {
            setAnimating(true);
            isFlipped = false;
            card.classList.remove('flipped');
            updateButtonLabels();
            setTimeout(() => {
                currentIndex = nextIndex;
                updateCardContent();
                updateProgress();
            }, 200);
            setTimeout(() => setAnimating(false), 520);
        } else {
            setAnimating(true);
            cardContainer.classList.add('shake');
            setTimeout(() => {
                currentIndex = nextIndex;
                updateCardContent();
                updateProgress();
                cardContainer.classList.remove('shake');
                setAnimating(false);
            }, 180);
            setTimeout(() => {
                if (isAnimating) {
                    cardContainer.classList.remove('shake');
                    setAnimating(false);
                }
            }, 550);
        }
    }

    function showToast(message, emoji = '💡') {
        if (toastTimer) clearTimeout(toastTimer);
        toast.textContent = emoji + ' ' + message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toastTimer = null;
        }, 2000);
    }

    function showSummary() {
        const totalFamiliar = familiarStatus.filter(s => s === true).length;
        const totalUnfamiliar = familiarStatus.filter(s => s === false).length;
        const totalNull = familiarStatus.filter(s => s === null).length;
        saveCurrentPass();
        summaryFamiliar.textContent = totalFamiliar;
        summaryUnfamiliar.textContent = totalUnfamiliar + totalNull;
        if (totalUnfamiliar + totalNull === 0) {
            summaryEmoji.textContent = '🎉';
            summaryTitle.textContent = '太棒了！全部认识！';
            btnReview.style.display = 'none';
        } else if (totalFamiliar >= currentCards.length * 0.7) {
            summaryEmoji.textContent = '🌟';
            summaryTitle.textContent = '非常不错！';
            btnReview.style.display = 'inline-block';
        } else {
            summaryEmoji.textContent = '💪';
            summaryTitle.textContent = '继续加油哦！';
            btnReview.style.display = 'inline-block';
        }
        reviewQueue = buildReviewQueue(familiarStatus);
        if (reviewQueue.length === 0) btnReview.style.display = 'none';
        summaryOverlay.classList.add('show');
        spawnConfetti();
    }

    function hideSummary() {
        summaryOverlay.classList.remove('show');
    }

    function resetLearnState() {
        currentIndex = 0;
        isFlipped = false;
        isAnimating = false;
        familiarStatus = new Array(currentCards.length).fill(null);
        reviewQueue = [];
        isReviewMode = false;
        hasSavedCurrentPass = false;
        card.classList.remove('flipped');
        cardContainer.classList.remove('shake');
        updateButtonLabels();
        updateProgress();
        hideSummary();
        setAnimating(false);
        cardContainer.style.pointerEvents = 'auto';
        cardContainer.style.cursor = 'pointer';
        btnFamiliar.disabled = false;
        btnUnfamiliar.disabled = false;
    }

    function startLearning(count) {
        totalSelectedCount = count;
        currentCards = selectCards(count);
        resetLearnState();
        closeLearningHistory();
        updateCardContent();
        updateProgress();
        startScreen.classList.add('hidden');
        learnScreen.classList.add('active');
        hideSummary();
        positionHeader();
        showToast('开始学习 ' + count + ' 个汉字！', '📚');
    }

    function restartLearning() {
        window.speechSynthesis && window.speechSynthesis.cancel();
        currentCards = selectCards(totalSelectedCount);
        resetLearnState();
        updateCardContent();
        updateProgress();
        hideSummary();
        showToast('重新学习 ' + totalSelectedCount + ' 个字！', '🔄');
    }

    function startReview() {
        if (reviewQueue.length === 0) {
            showToast('没有需要复习的字哦~', '🎉');
            return;
        }
        isReviewMode = true;
        hasSavedCurrentPass = false;
        reviewQueue.forEach(idx => { familiarStatus[idx] = null; });
        currentIndex = reviewQueue[0];
        isFlipped = false;
        card.classList.remove('flipped');
        updateCardContent();
        updateButtonLabels();
        updateProgress();
        hideSummary();
        setAnimating(false);
        cardContainer.classList.remove('shake');
        cardContainer.style.pointerEvents = 'auto';
        cardContainer.style.cursor = 'pointer';
        btnFamiliar.disabled = false;
        btnUnfamiliar.disabled = false;
        showToast('复习模式：' + reviewQueue.length + ' 个字', '📖');
    }

    function goBackToStart() {
        window.speechSynthesis && window.speechSynthesis.cancel();
        hideSummary();
        learnScreen.classList.remove('active');
        startScreen.classList.remove('hidden');
        resetLearnState();
        currentCards = [];
        positionHeader();
        familiarStatus = [];
        reviewQueue = [];
        isReviewMode = false;
    }

    function spawnConfetti() {
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#f8a5b0', '#7ec8e3',
            '#fce38a', '#a8d8b9', '#c8a0f0'
        ];
        const container = document.createElement('div');
        container.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:300;';
        document.body.appendChild(container);
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 12 + 6;
            confetti.style.cssText =
                `position:absolute;top:-30px;left:${Math.random()*100}%;width:${size}px;height:${size*(Math.random()*0.6+0.7)}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};animation:confettiFall ${Math.random()*1.5+1.8}s ease-in ${Math.random()*0.8}s forwards;opacity:0;`;
            container.appendChild(confetti);
        }
        if (!document.getElementById('confettiStyle')) {
            const style = document.createElement('style');
            style.id = 'confettiStyle';
            style.textContent =
                '@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1}30%{opacity:1}100%{transform:translateY(105vh) rotate(720deg) scale(0.3);opacity:0}}';
            document.head.appendChild(style);
        }
        setTimeout(() => container.remove(), 3000);
    }

    // ============ 事件监听 ============
    // 开始页面按钮
    document.querySelectorAll('.start-btn[data-count]').forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.getAttribute('data-count'));
            startLearning(count);
        });
    });

    // 自定义按钮切换
    btnCustomToggle.addEventListener('click', () => {
        customInputArea.classList.toggle('show');
        if (customInputArea.classList.contains('show')) {
            customCountInput.focus();
        }
    });

    // 自定义确认
    btnCustomGo.addEventListener('click', () => {
        let count = parseInt(customCountInput.value);
        if (isNaN(count) || count < 1) count = 1;
        if (count > 200) count = 200;
        customCountInput.value = count;
        customInputArea.classList.remove('show');
        startLearning(count);
    });
    customCountInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnCustomGo.click();
        }
    });

    // 返回首页
    btnBackToStart.addEventListener('click', goBackToStart);
    btnBackStartFromSummary.addEventListener('click', goBackToStart);
    btnOpenHistory.addEventListener('click', openLearningHistory);
    btnCloseHistory.addEventListener('click', closeLearningHistory);
    btnClearHistory.addEventListener('click', clearLearningHistory);
    btnCancelClearHistory.addEventListener('click', () => {
        historyClearConfirm.hidden = true;
        btnClearHistory.focus();
    });
    btnConfirmClearHistory.addEventListener('click', confirmClearLearningHistory);
    historyOverlay.addEventListener('click', (e) => {
        if (e.target === historyOverlay) closeLearningHistory();
    });

    // 卡片翻转
    cardContainer.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (isAnimating) return;
        flipCard();
    });

    // 熟悉按钮
    btnFamiliar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (currentCards.length === 0) return;
        window.speechSynthesis && window.speechSynthesis.cancel();
        if (isFlipped) {
            markAsFamiliar();
            goToNextCard();
        } else {
            markAsFamiliar();
            goToNextCard();
        }
        if (navigator.vibrate) navigator.vibrate(12);
    });

    // 不熟悉按钮
    btnUnfamiliar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        if (currentCards.length === 0) return;
        if (isFlipped) {
            window.speechSynthesis && window.speechSynthesis.cancel();
            goToNextCard();
        } else {
            markAsUnfamiliar();
            flipCard();
            setTimeout(speakCard, 550);
        }
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    });

    // 总结面板按钮
    btnRestart.addEventListener('click', restartLearning);
    btnReview.addEventListener('click', startReview);
    btnCloseSummary.addEventListener('click', hideSummary);
    summaryOverlay.addEventListener('click', (e) => {
        if (e.target === summaryOverlay) hideSummary();
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (historyOverlay.classList.contains('show')) {
            if (e.key === 'Escape') closeLearningHistory();
            return;
        }
        if (summaryOverlay.classList.contains('show')) {
            if (e.key === 'Escape') hideSummary();
            if (e.key === 'r' || e.key === 'R') restartLearning();
            return;
        }
        if (learnScreen.classList.contains('active') === false) return;
        if (isAnimating) return;
        if (currentCards.length === 0) return;
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            markAsFamiliar();
            goToNextCard();
        }
        if (e.key === 'ArrowDown' || e.key === 'f') {
            e.preventDefault();
            if (!isFlipped) {
                markAsUnfamiliar();
                flipCard();
            }
        }
        if (e.key === 'ArrowUp' && isFlipped) {
            e.preventDefault();
            flipCard();
        }
        if (e.key === 'Escape') {
            goBackToStart();
        }
    });

    // 触摸滑动
    let touchStartX = 0,
        touchStartY = 0;
    cardContainer.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    cardContainer.addEventListener('touchend', (e) => {
        if (e.target.closest('button')) return;
        if (isAnimating) return;
        if (currentCards.length === 0) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            if (dx < 0 && !isFlipped) { markAsUnfamiliar();
                flipCard(); } else if (dx > 0 && isFlipped) { flipCard(); }
        }
        if (dy > 60 && Math.abs(dy) > Math.abs(dx) * 1.5) {
            if (!isFlipped) { markAsFamiliar();
                goToNextCard(); } else { markAsFamiliar();
                goToNextCard(); }
        }
    });

    // ============ 初始化 ============
    function init() {
        startScreen.classList.remove('hidden');
        learnScreen.classList.remove('active');
        hideSummary();
        customInputArea.classList.remove('show');
        positionHeader();
        customCountInput.value = 8;
        currentCards = [];
        familiarStatus = [];
        reviewQueue = [];
        isReviewMode = false;
        hasSavedCurrentPass = false;
        currentIndex = 0;
        isFlipped = false;
        isAnimating = false;
        card.classList.remove('flipped');
        cardContainer.classList.remove('shake');
        setAnimating(false);
        cardContainer.style.pointerEvents = 'auto';
        cardContainer.style.cursor = 'pointer';
        btnFamiliar.disabled = false;
        btnUnfamiliar.disabled = false;
        updateButtonLabels();
        progressBar.style.width = '0%';
        progressText.textContent = '0 / 0';
        familiarCountEl.textContent = '0';
        unfamiliarCountEl.textContent = '0';
        remainingCountEl.textContent = '0';
        closeLearningHistory();
        renderLearningHistory();
    }
    init();
    setTimeout(() => showToast('请选择学习字数开始吧！', '👆'), 500);
    console.log('🌈 汉字启蒙卡片已就绪！字库共 ' + fullLibrary.length + ' 个汉字');
    console.log('💡 点击卡片翻转 | 键盘 ←→ 切换 | 空格键熟悉 | Esc返回首页');
})();
