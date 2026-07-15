(function(root, factory) {
    const helpers = factory();
    if (typeof module === 'object' && module.exports) module.exports = helpers;
    root.HanziFunStory = helpers;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    const STORY_STORAGE_KEY = 'hanzifun.story.v1';

    function getSceneIndexAtTime(scenes, seconds) {
        if (!Array.isArray(scenes) || scenes.length === 0) return -1;
        let result = 0;
        scenes.forEach((scene, index) => {
            if (Number(scene.startAt) <= seconds) result = index;
        });
        return result;
    }

    function saveStoryResult(storage, result) {
        if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') return false;
        try {
            const raw = storage.getItem(STORY_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : { sessions: [] };
            const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
            sessions.unshift(result);
            storage.setItem(STORY_STORAGE_KEY, JSON.stringify({ sessions: sessions.slice(0, 50) }));
            return true;
        } catch (error) {
            return false;
        }
    }

    return { STORY_STORAGE_KEY, getSceneIndexAtTime, saveStoryResult };
});

(function() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const lessons = window.HANZI_STORY_LESSONS;
    const lesson = Array.isArray(lessons) ? lessons[0] : null;
    if (!lesson) throw new Error('故事课资源加载失败');

    const helpers = window.HanziFunStory;
    const panels = {
        intro: document.getElementById('introPanel'),
        story: document.getElementById('storyPanel'),
        practice: document.getElementById('practicePanel'),
        quiz: document.getElementById('quizPanel'),
        result: document.getElementById('resultPanel'),
    };
    const stepNames = ['intro', 'story', 'practice', 'quiz'];
    const storySentence = document.getElementById('storySentence');
    const sceneImage = document.getElementById('sceneImage');
    const sceneFallback = document.getElementById('sceneFallback');
    const sceneCaption = document.getElementById('sceneCaption');
    const focusRow = document.getElementById('focusRow');
    const startPracticeButton = document.getElementById('startPracticeButton');
    const soundButton = document.getElementById('soundButton');
    const toast = document.getElementById('storyToast');
    let soundEnabled = true;
    let activeAudio = null;
    let animationFrame = null;
    let cueTimers = [];
    let currentSceneIndex = -1;
    let practiceIndex = 0;
    let quizIndex = 0;
    let correctAnswers = 0;
    let storyComplete = false;
    let lessonStartedAt = Date.now();

    function renderTargets(container, focusedChars = []) {
        container.replaceChildren();
        lesson.targetChars.forEach(char => {
            const item = document.createElement('span');
            item.className = `target-chip${focusedChars.includes(char) ? ' focused' : ''}`;
            item.textContent = char;
            container.appendChild(item);
        });
    }

    function renderSentence(focusedChars = []) {
        storySentence.replaceChildren();
        Array.from(lesson.storyText).forEach(char => {
            if (focusedChars.includes(char)) {
                const mark = document.createElement('mark');
                mark.textContent = char;
                storySentence.appendChild(mark);
            } else {
                storySentence.append(char);
            }
        });
    }

    function setStep(name) {
        Object.entries(panels).forEach(([panelName, panel]) => {
            const active = panelName === name;
            panel.hidden = !active;
            panel.classList.toggle('active', active);
        });
        const currentStepIndex = stepNames.indexOf(name);
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index === currentStepIndex);
            step.classList.toggle('completed', currentStepIndex > index || name === 'result');
        });
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        window.setTimeout(() => toast.classList.remove('show'), 1600);
    }

    function stopNarration() {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio = null;
        }
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        cueTimers.forEach(clearTimeout);
        cueTimers = [];
        window.speechSynthesis?.cancel();
    }

    function renderScene(index) {
        if (index < 0 || index >= lesson.scenes.length || index === currentSceneIndex) return;
        currentSceneIndex = index;
        const scene = lesson.scenes[index];
        sceneImage.classList.remove('loaded');
        sceneImage.alt = scene.alt;
        sceneImage.src = scene.image;
        sceneFallback.textContent = scene.fallbackEmoji;
        sceneFallback.hidden = false;
        sceneImage.onload = () => {
            sceneImage.classList.add('loaded');
            sceneFallback.hidden = true;
        };
        sceneImage.onerror = () => {
            sceneImage.removeAttribute('src');
            sceneImage.classList.remove('loaded');
            sceneFallback.hidden = false;
        };
        sceneCaption.textContent = scene.caption;
        focusRow.replaceChildren();
        scene.focusChars.forEach(char => {
            const item = document.createElement('span');
            item.className = 'focus-char';
            item.textContent = char;
            focusRow.appendChild(item);
        });
        renderSentence(scene.focusChars);
    }

    function finishStory() {
        storyComplete = true;
        startPracticeButton.disabled = false;
        startPracticeButton.textContent = '跟着读一读 →';
        showToast('故事听完啦！');
    }

    function monitorAudio() {
        if (!activeAudio) return;
        renderScene(helpers.getSceneIndexAtTime(lesson.scenes, activeAudio.currentTime));
        if (!activeAudio.paused && !activeAudio.ended) animationFrame = requestAnimationFrame(monitorAudio);
    }

    function playSpeechFallback() {
        if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
            lesson.scenes.forEach((scene, index) => cueTimers.push(setTimeout(() => renderScene(index), scene.startAt * 1000)));
            cueTimers.push(setTimeout(finishStory, lesson.fallbackDuration * 1000));
            return;
        }
        const utterance = new SpeechSynthesisUtterance(lesson.storyText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.78;
        const finishSpeechFallback = () => {
            cueTimers.forEach(clearTimeout);
            cueTimers = [];
            renderScene(lesson.scenes.length - 1);
            finishStory();
        };
        utterance.onend = finishSpeechFallback;
        utterance.onerror = finishSpeechFallback;
        lesson.scenes.forEach((scene, index) => cueTimers.push(setTimeout(() => renderScene(index), scene.startAt * 1000)));
        window.speechSynthesis.speak(utterance);
    }

    function playStory() {
        stopNarration();
        storyComplete = false;
        currentSceneIndex = -1;
        startPracticeButton.disabled = true;
        startPracticeButton.textContent = '正在听故事…';
        renderScene(0);
        if (!soundEnabled) {
            lesson.scenes.forEach((scene, index) => cueTimers.push(setTimeout(() => renderScene(index), scene.startAt * 1000)));
            cueTimers.push(setTimeout(finishStory, lesson.fallbackDuration * 1000));
            return;
        }
        if (!lesson.narrationAudio) {
            playSpeechFallback();
            return;
        }
        const audio = new Audio(lesson.narrationAudio);
        activeAudio = audio;
        audio.onended = finishStory;
        audio.onerror = playSpeechFallback;
        audio.play().then(monitorAudio).catch(playSpeechFallback);
    }

    function speak(text) {
        if (!soundEnabled || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.75;
        window.speechSynthesis.speak(utterance);
    }

    function renderPractice() {
        const item = lesson.practice[practiceIndex];
        document.getElementById('practiceProgress').textContent = `第 ${practiceIndex + 1} 个 / 共 ${lesson.practice.length} 个`;
        document.getElementById('practiceEmoji').textContent = item.emoji;
        document.getElementById('practiceChar').textContent = item.char;
        document.getElementById('practiceWord').textContent = item.word;
        speak(item.char);
    }

    function renderQuiz() {
        const item = lesson.quiz[quizIndex];
        document.getElementById('quizProgress').textContent = `第 ${quizIndex + 1} 题 / 共 ${lesson.quiz.length} 题`;
        document.getElementById('quizEmoji').textContent = item.emoji;
        document.getElementById('quizTitle').textContent = item.prompt;
        document.getElementById('quizFeedback').textContent = '';
        const choices = document.getElementById('quizChoices');
        choices.replaceChildren();
        item.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'quiz-choice';
            button.type = 'button';
            button.textContent = choice;
            button.addEventListener('click', () => answerQuestion(button, choice));
            choices.appendChild(button);
        });
    }

    function answerQuestion(button, choice) {
        const item = lesson.quiz[quizIndex];
        if (choice !== item.answer) {
            button.classList.remove('wrong');
            void button.offsetWidth;
            button.classList.add('wrong');
            document.getElementById('quizFeedback').textContent = '再找一找，故事里见过它哦！';
            speak('再找一找');
            return;
        }
        correctAnswers += 1;
        button.classList.add('correct');
        document.querySelectorAll('.quiz-choice').forEach(itemButton => itemButton.disabled = true);
        document.getElementById('quizFeedback').textContent = '答对啦！';
        speak(`${choice}，答对了`);
        window.setTimeout(() => {
            quizIndex += 1;
            if (quizIndex < lesson.quiz.length) renderQuiz();
            else completeLesson();
        }, 900);
    }

    function completeLesson() {
        setStep('result');
        document.getElementById('resultScore').textContent = correctAnswers;
        renderTargets(document.getElementById('resultTargets'));
        helpers.saveStoryResult(window.localStorage, {
            id: `${Date.now()}-${lesson.id}`,
            lessonId: lesson.id,
            completedAt: Date.now(),
            durationSeconds: Math.max(1, Math.round((Date.now() - lessonStartedAt) / 1000)),
            practicedChars: lesson.targetChars,
            quizCorrect: correctAnswers,
            quizTotal: lesson.quiz.length,
        });
        speak('太棒了，故事课完成啦');
    }

    function resetLesson() {
        stopNarration();
        practiceIndex = 0;
        quizIndex = 0;
        correctAnswers = 0;
        storyComplete = false;
        currentSceneIndex = -1;
        lessonStartedAt = Date.now();
        setStep('intro');
    }

    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonTheme').textContent = lesson.theme;
    document.getElementById('coverEmoji').textContent = lesson.coverEmoji;
    renderTargets(document.getElementById('introTargets'));
    renderSentence();

    document.getElementById('startStoryButton').addEventListener('click', () => {
        setStep('story');
        playStory();
    });
    document.getElementById('replayStoryButton').addEventListener('click', playStory);
    startPracticeButton.addEventListener('click', () => {
        stopNarration();
        setStep('practice');
        practiceIndex = 0;
        renderPractice();
    });
    document.getElementById('hearAgainButton').addEventListener('click', () => speak(lesson.practice[practiceIndex].char));
    document.getElementById('practiceDoneButton').addEventListener('click', () => {
        practiceIndex += 1;
        if (practiceIndex < lesson.practice.length) renderPractice();
        else {
            setStep('quiz');
            renderQuiz();
        }
    });
    document.getElementById('restartLessonButton').addEventListener('click', resetLesson);
    soundButton.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? '🔊' : '🔇';
        soundButton.setAttribute('aria-label', soundEnabled ? '关闭声音' : '打开声音');
        if (!soundEnabled && !panels.story.hidden && !storyComplete) playStory();
        else if (!soundEnabled) stopNarration();
        showToast(soundEnabled ? '声音已打开' : '声音已关闭');
    });
    window.addEventListener('pagehide', stopNarration);
})();
