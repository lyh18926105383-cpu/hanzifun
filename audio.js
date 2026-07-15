(function(root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.HanziFunAudio = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    const EMPTY_MANIFEST = Object.freeze({ version: 'none', cards: {} });

    function normalizeManifest(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_MANIFEST;
        return {
            version: typeof value.version === 'string' ? value.version : 'unknown',
            voice: typeof value.voice === 'string' ? value.voice : '',
            cards: value.cards && typeof value.cards === 'object' && !Array.isArray(value.cards)
                ? value.cards
                : {},
        };
    }

    function getManifestEntry(manifest, card) {
        if (!card || !card.char) return null;
        const entry = normalizeManifest(manifest).cards[card.char];
        if (!entry || typeof entry.url !== 'string' || entry.url.length === 0) return null;
        return entry;
    }

    function createAudioController(options = {}) {
        const environment = options.environment || (
            typeof globalThis !== 'undefined' ? globalThis : {}
        );
        const manifestUrl = options.manifestUrl || 'audio-manifest.json';
        const fetchImpl = options.fetch || environment.fetch?.bind(environment);
        const AudioConstructor = options.Audio || environment.Audio;
        const corpusApi = options.corpusApi || environment.HanziFunTtsCorpus;
        const speechSynthesis = options.speechSynthesis || environment.speechSynthesis;
        const Utterance = options.SpeechSynthesisUtterance || environment.SpeechSynthesisUtterance;

        let enabled = options.enabled !== false;
        let manifestPromise = null;
        let activeAudio = null;
        const preloaded = new Map();

        function loadManifest() {
            if (manifestPromise) return manifestPromise;
            if (!fetchImpl) {
                manifestPromise = Promise.resolve(EMPTY_MANIFEST);
                return manifestPromise;
            }

            manifestPromise = fetchImpl(manifestUrl, { cache: 'no-cache' })
                .then(response => response.ok ? response.json() : EMPTY_MANIFEST)
                .then(normalizeManifest)
                .catch(() => EMPTY_MANIFEST);
            return manifestPromise;
        }

        function stop() {
            if (activeAudio) {
                activeAudio.pause();
                activeAudio.currentTime = 0;
                activeAudio = null;
            }
            speechSynthesis?.cancel();
        }

        function speakFallback(card) {
            if (!enabled || !speechSynthesis || !Utterance || !card) {
                return { mode: enabled ? 'unavailable' : 'disabled' };
            }
            const text = corpusApi?.buildSpeechText
                ? corpusApi.buildSpeechText(card)
                : `${card.char}，${card.hint}。`;
            const utterance = new Utterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.82;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
            return { mode: 'speech-synthesis', text };
        }

        async function getOrCreateAudio(card) {
            const manifest = await loadManifest();
            const entry = getManifestEntry(manifest, card);
            if (!entry || !AudioConstructor) return null;
            if (preloaded.has(card.char)) return preloaded.get(card.char);

            const audio = new AudioConstructor(entry.url);
            audio.preload = 'auto';
            audio.load?.();
            preloaded.set(card.char, audio);
            return audio;
        }

        async function preload(card) {
            if (!enabled || !card) return false;
            return Boolean(await getOrCreateAudio(card));
        }

        async function play(card) {
            stop();
            if (!enabled) return { mode: 'disabled' };

            const audio = await getOrCreateAudio(card);
            if (!audio) return speakFallback(card);

            try {
                activeAudio = audio;
                audio.currentTime = 0;
                await audio.play();
                return { mode: 'static-audio' };
            } catch (error) {
                preloaded.delete(card.char);
                activeAudio = null;
                return speakFallback(card);
            }
        }

        function setEnabled(nextEnabled) {
            enabled = Boolean(nextEnabled);
            if (!enabled) stop();
            return enabled;
        }

        function isEnabled() {
            return enabled;
        }

        return { loadManifest, preload, play, stop, setEnabled, isEnabled };
    }

    return { EMPTY_MANIFEST, normalizeManifest, getManifestEntry, createAudioController };
});
