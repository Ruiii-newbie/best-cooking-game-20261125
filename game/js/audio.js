// Sizzle & Serve — tiny WebAudio bleeps. No audio files, no network:
// every sound is a short oscillator envelope built at run time.
// Silently inert when the browser has no AudioContext (headless shots).

const Sfx = (function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      gain.gain.setValueAtTime(vol || 0.12, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + dur);
    } catch (e) { /* audio is garnish, never a crash */ }
  }

  return {
    pickup: function () { tone(660, 0.06, 'triangle', 0.10); },
    place: function () { tone(440, 0.07, 'triangle', 0.10); },
    chop: function () { tone(190, 0.08, 'square', 0.07, 120); },
    chopDone: function () { tone(520, 0.08, 'triangle', 0.10, 780); },
    grillDone: function () { tone(880, 0.12, 'sine', 0.10, 1320); },
    serve: function () {
      tone(523, 0.10, 'triangle', 0.11);
      setTimeout(function () { tone(659, 0.10, 'triangle', 0.11); }, 90);
      setTimeout(function () { tone(784, 0.16, 'triangle', 0.12); }, 180);
    },
    fail: function () { tone(220, 0.30, 'sawtooth', 0.08, 110); },
    levelUp: function () {
      tone(392, 0.10, 'triangle', 0.11);
      setTimeout(function () { tone(523, 0.10, 'triangle', 0.11); }, 100);
      setTimeout(function () { tone(659, 0.18, 'triangle', 0.12); }, 200);
    },
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
  };
})();
