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

    function getEqualSceneIndex(sceneCount, currentTime, duration) {
        if (!Number.isInteger(sceneCount) || sceneCount <= 0) return -1;
        if (!Number.isFinite(duration) || duration <= 0) return 0;
        const progress = Math.max(0, Math.min(0.999999, Number(currentTime) / duration));
        return Math.min(sceneCount - 1, Math.floor(progress * sceneCount));
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

    function prefersStaticSceneMedia(matchMedia, connection) {
        const reduceMotion = typeof matchMedia === 'function'
            && Boolean(matchMedia('(prefers-reduced-motion: reduce)')?.matches);
        return reduceMotion || Boolean(connection?.saveData);
    }

    function getSceneVideoVolume(scene, soundEnabled = true) {
        if (!soundEnabled) return 0;
        const configuredVolume = Number(scene?.videoVolume);
        if (!Number.isFinite(configuredVolume)) return 0;
        return Math.max(0, Math.min(1, configuredVolume));
    }

    function selectLesson(lessons, search = '') {
        if (!Array.isArray(lessons) || lessons.length === 0) return null;
        const lessonId = new URLSearchParams(search).get('lesson');
        return lessons.find(lesson => lesson.id === lessonId) || lessons[0];
    }

    function shuffleChoices(choices, random = Math.random) {
        const shuffled = Array.isArray(choices) ? [...choices] : [];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
    }

    function getActiveKeywordAtTime(keywordCues, seconds) {
        if (!Array.isArray(keywordCues)) return '';
        const currentTime = Number(seconds);
        for (let index = keywordCues.length - 1; index >= 0; index -= 1) {
            const item = keywordCues[index];
            const startAt = Number(item.startAt);
            const duration = Number(item.duration) || 0.6;
            if (currentTime >= startAt && currentTime < startAt + duration) return item.char || '';
        }
        return '';
    }

    function getStoryTailDelay(videoDuration, videoCurrentTime, fallbackDuration, narrationDuration) {
        const videoRemaining = Number(videoDuration) - Number(videoCurrentTime);
        const lessonRemaining = Number(fallbackDuration) - Number(narrationDuration);
        const hasVideoTiming = Number.isFinite(Number(videoDuration))
            && Number.isFinite(Number(videoCurrentTime));
        const hasLessonTiming = Number.isFinite(Number(fallbackDuration))
            && Number.isFinite(Number(narrationDuration));
        if ((hasVideoTiming && videoRemaining <= 0) || (hasLessonTiming && lessonRemaining <= 0)) return 0;
        const candidates = [videoRemaining, lessonRemaining]
            .filter(value => Number.isFinite(value) && value > 0);
        return candidates.length > 0 ? Math.min(...candidates) : 0;
    }

    return {
        STORY_STORAGE_KEY,
        getSceneIndexAtTime,
        getEqualSceneIndex,
        prefersStaticSceneMedia,
        getSceneVideoVolume,
        saveStoryResult,
        selectLesson,
        shuffleChoices,
        getActiveKeywordAtTime,
        getStoryTailDelay,
    };
});

(function() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const lessons = window.HANZI_STORY_LESSONS;
    const helpers = window.HanziFunStory;
    const lesson = helpers.selectLesson(lessons, window.location.search);
    if (!lesson) throw new Error('故事课资源加载失败');

    const panels = {
        intro: document.getElementById('introPanel'),
        story: document.getElementById('storyPanel'),
        practice: document.getElementById('practicePanel'),
        quiz: document.getElementById('quizPanel'),
        result: document.getElementById('resultPanel'),
    };
    const stepNames = ['intro', 'story', 'practice', 'quiz'];
    const storySentence = document.getElementById('storySentence');
    const sceneImages = document.getElementById('sceneImages');
    const sceneFallback = document.getElementById('sceneFallback');
    const sceneCaption = document.getElementById('sceneCaption');
    const focusRow = document.getElementById('focusRow');
    const startPracticeButton = document.getElementById('startPracticeButton');
    const replayQuizButton = document.getElementById('replayQuizButton');
    const soundButton = document.getElementById('soundButton');
    const toast = document.getElementById('storyToast');
    const voicePlayer = document.getElementById('voicePlayer');
    const staticSceneMedia = helpers.prefersStaticSceneMedia(
        window.matchMedia?.bind(window),
        window.navigator?.connection
    );
    let soundEnabled = true;
    let activeAudio = null;
    let animationFrame = null;
    let cueTimers = [];
    let currentSceneIndex = -1;
    let currentCueKey = '';
    let currentKeywordHighlightKey = '';
    let practiceIndex = 0;
    let quizIndex = 0;
    let correctAnswers = 0;
    let storyComplete = false;
    let lessonStartedAt = Date.now();
    const initialSceneLayers = Array.from(sceneImages.querySelectorAll('.scene-image'));
    const sceneLayers = lesson.scenes.map((scene, index) => {
        const image = initialSceneLayers[index] || document.createElement('img');
        image.className = 'scene-image';
        image.alt = scene.alt;
        image.decoding = 'async';
        image.dataset.sceneIndex = String(index);
        image.addEventListener('load', () => {
            image.dataset.ready = 'true';
            updateSceneFallback(index);
        });
        image.addEventListener('error', () => {
            image.dataset.ready = 'false';
            updateSceneFallback(index);
        });
        if (image.getAttribute('src') !== scene.image) image.src = scene.image;
        if (!image.parentElement) sceneImages.appendChild(image);
        return image;
    });
    const sceneVideos = lesson.scenes.map((scene, index) => {
        if (!scene.video || staticSceneMedia) return null;
        const video = document.createElement('video');
        video.className = 'scene-video';
        video.dataset.sceneIndex = String(index);
        video.poster = scene.image;
        video.preload = 'metadata';
        const videoVolume = helpers.getSceneVideoVolume(scene, soundEnabled);
        video.muted = videoVolume === 0;
        video.defaultMuted = videoVolume === 0;
        video.volume = videoVolume;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.addEventListener('playing', () => {
            if (currentSceneIndex !== index) return;
            video.classList.add('active');
            updateSceneFallback(index);
        });
        video.addEventListener('error', () => {
            video.dataset.failed = 'true';
            video.classList.remove('active');
            updateSceneFallback(index);
        });
        video.src = scene.video;
        sceneImages.appendChild(video);
        return video;
    });

    function updateSceneVideoVolumes() {
        sceneVideos.forEach((video, index) => {
            if (!video) return;
            const videoVolume = helpers.getSceneVideoVolume(lesson.scenes[index], soundEnabled);
            video.muted = videoVolume === 0;
            video.volume = videoVolume;
        });
    }

    function updateSceneFallback(index) {
        if (currentSceneIndex !== index) return;
        const image = sceneLayers[index];
        const video = sceneVideos[index];
        const imageReady = image.dataset.ready === 'true'
            || (image.complete && image.naturalWidth > 0);
        const videoReady = Boolean(video?.classList.contains('active'));
        sceneFallback.hidden = imageReady || videoReady;
    }

    function resetSceneVideos() {
        sceneVideos.forEach(video => {
            if (!video) return;
            video.pause();
            video.classList.remove('active');
            try {
                video.currentTime = 0;
            } catch (error) {
                // 视频元数据尚未载入时无需重置播放位置。
            }
        });
    }

    function playSceneVideo(index) {
        const video = sceneVideos[index];
        if (!video || video.dataset.failed === 'true') return;
        video.play().then(() => {
            if (currentSceneIndex === index) return;
            video.pause();
            video.classList.remove('active');
        }).catch(() => {
            video.classList.remove('active');
            updateSceneFallback(index);
        });
    }

    function renderTargets(container, focusedChars = []) {
        container.replaceChildren();
        lesson.targetChars.forEach(char => {
            const item = document.createElement('span');
            item.className = `target-chip${focusedChars.includes(char) ? ' focused' : ''}`;
            item.textContent = char;
            container.appendChild(item);
        });
    }

    function renderSentence(focusedChars = [], text = lesson.storyText) {
        storySentence.replaceChildren();
        Array.from(text).forEach(char => {
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

    function stopVoice() {
        if (activeAudio) {
            activeAudio.onended = null;
            activeAudio.onerror = null;
            activeAudio.pause();
            try {
                activeAudio.currentTime = 0;
            } catch (error) {
                // 音频尚未载入时无需重置播放位置。
            }
            activeAudio = null;
        }
        window.speechSynthesis?.cancel();
    }

    function stopNarration() {
        stopVoice();
        resetSceneVideos();
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        cueTimers.forEach(clearTimeout);
        cueTimers = [];
    }

    function renderCue(scene, sceneIndex, playbackTime) {
        const cues = Array.isArray(scene.cues) && scene.cues.length > 0
            ? scene.cues
            : [{
                startAt: 0,
                text: scene.narrationText || scene.caption,
                focusChars: scene.focusChars,
            }];
        const relativeTime = Math.max(0, playbackTime - Number(scene.startAt || 0));
        const cueIndex = helpers.getSceneIndexAtTime(cues, relativeTime);
        const cueKey = `${sceneIndex}:${cueIndex}`;
        if (cueKey === currentCueKey) return;
        currentCueKey = cueKey;
        const cue = cues[cueIndex];
        const focusedChars = Array.isArray(cue.focusChars) ? cue.focusChars : [];
        sceneCaption.textContent = cue.text || '';
        focusRow.replaceChildren();
        focusedChars.forEach(char => {
            const item = document.createElement('span');
            item.className = 'focus-char';
            item.textContent = char;
            focusRow.appendChild(item);
        });
        renderSentence(focusedChars, cue.text || '');
    }

    function renderKeywordHighlight(scene, sceneIndex, playbackTime) {
        const relativeTime = Math.max(0, playbackTime - Number(scene.startAt || 0));
        const activeChar = helpers.getActiveKeywordAtTime(scene.keywordCues, relativeTime);
        const highlightKey = `${sceneIndex}:${activeChar}`;
        if (highlightKey === currentKeywordHighlightKey) return;
        currentKeywordHighlightKey = highlightKey;
        focusRow.querySelectorAll('.focus-char').forEach(item => {
            item.classList.toggle('speaking', item.textContent === activeChar);
        });
    }

    function renderScene(index, playbackTime = 0) {
        if (index < 0 || index >= lesson.scenes.length) return;
        const scene = lesson.scenes[index];
        if (index !== currentSceneIndex) {
            currentSceneIndex = index;
            sceneLayers.forEach((image, layerIndex) => {
                image.classList.toggle('active', layerIndex === index);
            });
            sceneVideos.forEach((video, layerIndex) => {
                if (!video) return;
                video.pause();
                video.classList.remove('active');
                if (layerIndex !== index) {
                    try {
                        video.currentTime = 0;
                    } catch (error) {
                        // 视频元数据尚未载入时无需重置播放位置。
                    }
                }
            });
            sceneFallback.textContent = scene.fallbackEmoji;
            updateSceneFallback(index);
            playSceneVideo(index);
        }
        renderCue(scene, index, playbackTime);
        renderKeywordHighlight(scene, index, playbackTime);
    }

    function finishStory() {
        activeAudio = null;
        sceneVideos.forEach(video => video?.pause());
        storyComplete = true;
        startPracticeButton.disabled = false;
        startPracticeButton.textContent = '跟着读一读 →';
        showToast('故事听完啦！');
    }

    function finishStoryAfterVideoTail() {
        const narrationDuration = activeAudio?.duration;
        const activeVideo = sceneVideos[currentSceneIndex];
        const tailDelay = helpers.getStoryTailDelay(
            activeVideo?.duration,
            activeVideo?.currentTime,
            lesson.fallbackDuration,
            narrationDuration
        );
        activeAudio = null;
        if (!activeVideo || activeVideo.paused || activeVideo.ended || tailDelay <= 0.05) {
            finishStory();
            return;
        }

        let finished = false;
        const completeTail = () => {
            if (finished) return;
            finished = true;
            activeVideo.removeEventListener('ended', completeTail);
            finishStory();
        };
        activeVideo.addEventListener('ended', completeTail, { once: true });
        cueTimers.push(setTimeout(completeTail, (tailDelay + 0.35) * 1000));
    }

    function monitorAudio() {
        if (!activeAudio) return;
        const sceneIndex = helpers.getEqualSceneIndex(
            lesson.scenes.length,
            activeAudio.currentTime,
            activeAudio.duration
        );
        renderScene(sceneIndex, activeAudio.currentTime);
        if (!activeAudio.paused && !activeAudio.ended) animationFrame = requestAnimationFrame(monitorAudio);
    }

    function scheduleStoryTimeline() {
        lesson.scenes.forEach((scene, index) => {
            cueTimers.push(setTimeout(
                () => renderScene(index, scene.startAt),
                scene.startAt * 1000
            ));
            (scene.cues || []).slice(1).forEach(cue => {
                const cueTime = scene.startAt + cue.startAt;
                cueTimers.push(setTimeout(
                    () => renderScene(index, cueTime),
                    cueTime * 1000
                ));
            });
            (scene.keywordCues || []).forEach(keywordCue => {
                const cueTime = scene.startAt + keywordCue.startAt;
                const cueEndTime = cueTime + (keywordCue.duration || 0.6);
                cueTimers.push(setTimeout(
                    () => renderScene(index, cueTime),
                    cueTime * 1000
                ));
                cueTimers.push(setTimeout(
                    () => renderScene(index, cueEndTime),
                    cueEndTime * 1000
                ));
            });
        });
    }

    function playSilentTimeline() {
        scheduleStoryTimeline();
        cueTimers.push(setTimeout(finishStory, lesson.fallbackDuration * 1000));
    }

    function playSpeechFallback() {
        if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
            playSilentTimeline();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(lesson.storyText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.78;
        const finishSpeechFallback = () => {
            cueTimers.forEach(clearTimeout);
            cueTimers = [];
            renderScene(lesson.scenes.length - 1, lesson.fallbackDuration);
            finishStory();
        };
        utterance.onend = finishSpeechFallback;
        utterance.onerror = () => {
            cueTimers.forEach(clearTimeout);
            cueTimers = [];
            currentSceneIndex = -1;
            renderScene(0, 0);
            playSilentTimeline();
        };
        scheduleStoryTimeline();
        window.speechSynthesis.speak(utterance);
    }

    function playStory() {
        stopNarration();
        storyComplete = false;
        currentSceneIndex = -1;
        currentCueKey = '';
        currentKeywordHighlightKey = '';
        startPracticeButton.disabled = true;
        startPracticeButton.textContent = '正在听故事…';
        renderScene(0, 0);
        if (!soundEnabled) {
            playSilentTimeline();
            return;
        }
        if (!lesson.narrationAudio) {
            playSpeechFallback();
            return;
        }
        voicePlayer.src = lesson.narrationAudio;
        activeAudio = voicePlayer;
        voicePlayer.onended = finishStoryAfterVideoTail;
        voicePlayer.onerror = () => {
            activeAudio = null;
            playSpeechFallback();
        };
        voicePlayer.play().then(monitorAudio).catch(() => {
            activeAudio = null;
            playSpeechFallback();
        });
    }

    function speakFallback(text, onEnded) {
        if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
            onEnded?.();
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.75;
        utterance.onend = () => onEnded?.();
        utterance.onerror = () => onEnded?.();
        window.speechSynthesis.speak(utterance);
    }

    function speak(text, audioUrl = '', onEnded) {
        if (!soundEnabled) {
            onEnded?.();
            return;
        }
        stopVoice();
        if (!audioUrl) {
            speakFallback(text, onEnded);
            return;
        }
        let fallbackStarted = false;
        const startFallback = () => {
            if (fallbackStarted) return;
            fallbackStarted = true;
            activeAudio = null;
            speakFallback(text, onEnded);
        };
        voicePlayer.src = audioUrl;
        activeAudio = voicePlayer;
        voicePlayer.onended = () => {
            activeAudio = null;
            onEnded?.();
        };
        voicePlayer.onerror = startFallback;
        voicePlayer.play().catch(startFallback);
    }

    function renderPractice() {
        const item = lesson.practice[practiceIndex];
        document.getElementById('practiceProgress').textContent = `第 ${practiceIndex + 1} 个 / 共 ${lesson.practice.length} 个`;
        document.getElementById('practiceEmoji').textContent = item.emoji;
        document.getElementById('practiceChar').textContent = item.char;
        document.getElementById('practiceWord').textContent = item.word;
        speak(item.char, item.audio);
    }

    function renderQuiz() {
        const item = lesson.quiz[quizIndex];
        document.getElementById('quizProgress').textContent = `第 ${quizIndex + 1} 题 / 共 ${lesson.quiz.length} 题`;
        document.getElementById('quizEmoji').textContent = item.emoji;
        document.getElementById('quizTitle').textContent = item.prompt;
        document.getElementById('quizFeedback').textContent = '';
        const choices = document.getElementById('quizChoices');
        choices.replaceChildren();
        helpers.shuffleChoices(item.choices).forEach(choice => {
            const button = document.createElement('button');
            button.className = 'quiz-choice';
            button.type = 'button';
            button.textContent = choice;
            button.addEventListener('click', () => answerQuestion(button, choice));
            choices.appendChild(button);
        });
        speak(item.prompt, item.audio);
    }

    function answerQuestion(button, choice) {
        const item = lesson.quiz[quizIndex];
        if (choice !== item.answer) {
            button.classList.remove('wrong');
            void button.offsetWidth;
            button.classList.add('wrong');
            document.getElementById('quizFeedback').textContent = '再找一找，故事里见过它哦！';
            speak(
                lesson.feedback.tryAgainText,
                lesson.feedback.tryAgainAudio
            );
            return;
        }
        correctAnswers += 1;
        button.classList.add('correct');
        document.querySelectorAll('.quiz-choice').forEach(itemButton => itemButton.disabled = true);
        document.getElementById('quizFeedback').textContent = '答对啦！';
        speak(item.correctText, item.correctAudio, () => {
            quizIndex += 1;
            if (quizIndex < lesson.quiz.length) renderQuiz();
            else completeLesson();
        });
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
        speak(
            lesson.feedback.completeText,
            lesson.feedback.completeAudio
        );
    }

    function resetLesson() {
        stopNarration();
        practiceIndex = 0;
        quizIndex = 0;
        correctAnswers = 0;
        storyComplete = false;
        currentSceneIndex = -1;
        currentCueKey = '';
        currentKeywordHighlightKey = '';
        lessonStartedAt = Date.now();
        setStep('intro');
    }

    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonTheme').textContent = lesson.theme;
    document.getElementById('coverEmoji').textContent = lesson.coverEmoji;
    document.getElementById('introTitle').textContent = `今天认识 ${lesson.targetChars.length} 个字`;
    document.getElementById('resultSummary').textContent =
        `你听完了故事，也跟读了 ${lesson.practice.length} 个汉字。`;
    document.title = `${lesson.title}｜汉字饭故事课`;
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
    document.getElementById('hearAgainButton').addEventListener('click', () => {
        const item = lesson.practice[practiceIndex];
        speak(item.char, item.audio);
    });
    replayQuizButton.addEventListener('click', () => {
        const item = lesson.quiz[quizIndex];
        speak(item.prompt, item.audio);
    });
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
        updateSceneVideoVolumes();
        if (!panels.story.hidden && !storyComplete) playStory();
        else if (!soundEnabled) stopNarration();
        showToast(soundEnabled ? '声音已打开' : '声音已关闭');
    });
    window.addEventListener('pagehide', stopNarration);
})();
