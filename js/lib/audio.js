/* ============ BrainForge – Audio ============
   Winzige Sound-Engine mit WebAudio (keine Dateien nötig). */
(function () {
  let ctx = null;
  let muted = localStorage.getItem('bf_muted') === '1';
  const get = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return ctx; };
  function tone(freq, dur = 0.12, type = 'sine', gain = 0.08, when = 0) {
    const c = get(); if (!c || muted) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.02);
  }
  const A = {
    correct() { tone(660, .1, 'triangle', .07); tone(880, .14, 'triangle', .07, .08); },
    streak(n) { [660, 880, 1100, 1320].slice(0, Math.min(4, 1 + n)).forEach((f, i) => tone(f, .12, 'triangle', .06, i * .06)); },
    wrong() { tone(180, .25, 'sawtooth', .06); tone(140, .3, 'sawtooth', .05, .08); },
    click() { tone(520, .05, 'square', .03); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'triangle', .08, i * .12)); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, .3, 'sawtooth', .05, i * .18)); },
    toggle() { muted = !muted; localStorage.setItem('bf_muted', muted ? '1' : '0'); return muted; },
    isMuted: () => muted,
  };
  window.BFAudio = A;
})();
