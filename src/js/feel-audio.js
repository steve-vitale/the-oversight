// @ontology
// system: feel-audio
// description: Synth voices for presentation pass A (2026-10-14, Steve: "Address all graphic and sound survey gaps."). Registers on Game.audio (app.js CombatAudio) through its port(): same buses, same mute, same compressor, zero assets. Grounded pre-System cues (human, earthy), the payoff stings (ascension, class, level-up, keepsake, feast, titans, the Table), one cue per god-path verb, the day-7 arrival bed + sting, and real synths for the placeholder signatures that only had rendered MP3s (fiCrewQuiet, fiOpeningSting, auditTax). Browser-only: without Game.audio (node) it attaches nothing.
// provides:
//   - groundedHurt
//   - groundedMiss
//   - groundedFlee
//   - weatherRain
//   - weatherCold
//   - ascensionRise
//   - classChime
//   - levelUpFlourish
//   - flashbackWarm
//   - keepsakeGlow
//   - feastFire
//   - titanEntrySting
//   - titanPhaseSting
//   - titanFallSting
//   - tableEnterSting
//   - tableLockIn
//   - tableBeatPulse
//   - tableWinSting
//   - tableLoseSting
//   - verbCue(d) -> one recipe per god-path verb cue (feel.js FEEL_VERBS.cue)
//   - arrivalSting
//   - arrivalBed(d) -> the day-7 bed, root climbs per tapped beat
//   - arrivalStop
//   - fiCrewQuiet
//   - fiOpeningSting
//   - auditTax
// rules:
//   - one_graph: every voice routes through CombatAudio.port() (sfx/music buses -> master -> compressor); muted or no context = silent no-op (code: feel-audio.js)
//   - no_persistent_loops: the arrival bed is one held voice stopped by arrivalStop or its own 150s ceiling (code: arrivalBed)
// consumes:
//   - Game.audio.port
(function () {
  'use strict';
  const S = globalThis.Scattering || {};
  const Game = S.Game;
  if (!Game || !Game.audio || typeof Game.audio.port !== 'function') return;
  const A = Game.audio;

  // ---- tiny synth kit on the port ----
  function tone(P, o) {
    const { ctx } = P;
    const t = ctx.currentTime + (o.at || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + (o.glide || o.dur));
    if (o.detune) osc.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.peak || 0.1), t + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let out = g;
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; g.connect(f); out = f; }
    osc.connect(g); out.connect(o.bus || P.sfx);
    osc.start(t); osc.stop(t + o.dur + 0.05);
    return osc;
  }
  function hiss(P, o) {
    const { ctx } = P;
    const t = ctx.currentTime + (o.at || 0);
    const src = P.noise(o.dur + 0.1); if (!src) return;
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.Q || 1;
    f.frequency.setValueAtTime(o.f0 || 800, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.peak || 0.08), t + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(o.bus || P.sfx);
    src.start(t); src.stop(t + o.dur + 0.05);
  }
  function chord(P, freqs, o) {
    freqs.forEach((f, i) => tone(P, Object.assign({}, o, { f0: f, at: (o.at || 0) + i * (o.stagger || 0) })));
  }
  function port() { try { return A.port(); } catch (e) { console.warn('[feel-audio] port', e && e.message); return null; } }
  // play(fn): every voice is guarded — a broken voice warns once, never throws.
  const _bad = {};
  function voice(name, fn) {
    return function (d) {
      const P = port(); if (!P) return;
      try { fn(P, d || {}); } catch (e) { if (!_bad[name]) { _bad[name] = 1; console.warn('[feel-audio] ' + name, e && e.message); } }
    };
  }

  // ---- VERB CUE RECIPES (feel.js FEEL_VERBS.cue) ----
  const VERB_CUES = {
    wall: (P) => { hiss(P, { filter: 'lowpass', f0: 180, dur: 0.6, peak: 0.22, attack: 0.05 }); tone(P, { f0: 70, f1: 45, dur: 0.4, peak: 0.25 }); },
    pull: (P) => { tone(P, { f0: 900, f1: 110, dur: 0.6, peak: 0.12, type: 'triangle' }); tone(P, { f0: 55, dur: 0.6, peak: 0.12, attack: 0.2 }); },
    push: (P) => { hiss(P, { filter: 'lowpass', f0: 600, f1: 120, dur: 0.45, peak: 0.24 }); tone(P, { f0: 85, f1: 40, dur: 0.5, peak: 0.28 }); },
    pack: (P) => { [0, 0.11, 0.22].forEach(at => hiss(P, { at, filter: 'lowpass', f0: 500, dur: 0.07, peak: 0.16 })); tone(P, { at: 0.3, f0: 260, f1: 180, dur: 0.25, peak: 0.06, type: 'sawtooth', lp: 900 }); },
    heal: (P) => { tone(P, { f0: 440, f1: 880, dur: 0.7, peak: 0.1, attack: 0.15 }); tone(P, { at: 0.35, f0: 1320, dur: 0.6, peak: 0.05 }); },
    blink: (P) => { tone(P, { f0: 300, f1: 3200, dur: 0.18, peak: 0.1 }); hiss(P, { at: 0.12, filter: 'highpass', f0: 4000, dur: 0.15, peak: 0.05 }); },
    swap: (P) => { tone(P, { f0: 400, f1: 1200, dur: 0.3, peak: 0.08, type: 'triangle' }); tone(P, { f0: 1200, f1: 400, dur: 0.3, peak: 0.08, type: 'triangle' }); },
    foresee: (P) => { const o = tone(P, { f0: 1500, dur: 0.9, peak: 0.06, attack: 0.2 }); if (o) o.detune.setValueAtTime(30, P.ctx.currentTime + 0.4); tone(P, { f0: 750, dur: 0.9, peak: 0.04, attack: 0.3 }); },
    broadcast: (P) => { tone(P, { f0: 1000, dur: 0.09, peak: 0.08, type: 'square', lp: 2400 }); tone(P, { at: 0.14, f0: 1000, dur: 0.09, peak: 0.08, type: 'square', lp: 2400 }); hiss(P, { at: 0.25, f0: 2000, dur: 0.3, peak: 0.04 }); },
    command: (P) => { tone(P, { f0: 220, f1: 330, dur: 0.35, peak: 0.1, type: 'sawtooth', lp: 1400 }); tone(P, { at: 0.12, f0: 330, dur: 0.3, peak: 0.08, type: 'sawtooth', lp: 1600 }); },
    stoke: (P) => { hiss(P, { f0: 300, f1: 2400, dur: 0.6, peak: 0.16, attack: 0.15 }); for (let i = 0; i < 5; i++) hiss(P, { at: 0.2 + i * 0.07, filter: 'highpass', f0: 3000, dur: 0.03, peak: 0.08 }); },
    coins: (P) => { [0, 0.09, 0.2].forEach((at, i) => { tone(P, { at, f0: 2400 + i * 300, dur: 0.18, peak: 0.07 }); tone(P, { at, f0: 3500 + i * 200, dur: 0.12, peak: 0.04 }); }); },
    feed: (P) => { hiss(P, { filter: 'lowpass', f0: 700, dur: 0.08, peak: 0.14 }); tone(P, { at: 0.08, f0: 196, dur: 0.8, peak: 0.08, attack: 0.1, type: 'triangle' }); tone(P, { at: 0.2, f0: 294, dur: 0.7, peak: 0.06, attack: 0.1, type: 'triangle' }); },
    thread: (P) => { tone(P, { f0: 1100, f1: 1400, dur: 0.8, peak: 0.06, attack: 0.1 }); tone(P, { f0: 550, dur: 0.8, peak: 0.04, attack: 0.2 }); },
    keepsake: (P) => { chord(P, [330, 415], { dur: 1.1, peak: 0.06, attack: 0.3 }); },
    echo: (P) => { tone(P, { f0: 600, f1: 900, dur: 0.9, peak: 0.06, attack: 0.6 }); hiss(P, { f0: 1500, dur: 0.9, peak: 0.03, attack: 0.6 }); },
    aura: (P) => { chord(P, [262, 392, 523], { dur: 1, peak: 0.05, attack: 0.25, stagger: 0.04 }); },
  };

  // ---- the arrival bed (one held voice) ----
  let bed = null;
  function stopBed(P, fade) {
    if (!bed) return;
    const b = bed; bed = null;
    try {
      const t = P ? P.ctx.currentTime : 0;
      b.g.gain.cancelScheduledValues(t);
      b.g.gain.setValueAtTime(Math.max(0.0001, b.g.gain.value), t);
      b.g.gain.exponentialRampToValueAtTime(0.0001, t + (fade || 0.8));
      b.oscs.forEach(o => o.stop(t + (fade || 0.8) + 0.1));
    } catch (e) { console.warn('[feel-audio] bed stop', e && e.message); }
    clearTimeout(b.ceiling);
  }
  const BED_ROOTS = [55, 58.27, 61.74, 65.41, 73.42, 82.41, 98, 110];

  Object.assign(A, {
    // ---------- GROUNDED (pre-System: a body, not a broadcast) ----------
    'groundedHurt': voice('groundedHurt', (P) => {
      tone(P, { f0: 130, f1: 52, dur: 0.22, peak: 0.3 });
      hiss(P, { at: 0.04, f0: 700, f1: 380, Q: 2, dur: 0.3, peak: 0.09, attack: 0.03 });
    }),
    'groundedMiss': voice('groundedMiss', (P) => { hiss(P, { f0: 400, f1: 2200, Q: 1.4, dur: 0.24, peak: 0.1, attack: 0.08 }); }),
    'groundedFlee': voice('groundedFlee', (P) => {
      for (let i = 0; i < 5; i++) hiss(P, { at: i * 0.09, filter: 'lowpass', f0: 900, dur: 0.06, peak: 0.13 * (1 - i * 0.15) });
      hiss(P, { at: 0.1, f0: 600, dur: 0.5, peak: 0.05, attack: 0.1 });
    }),
    'weatherRain': voice('weatherRain', (P) => {
      hiss(P, { filter: 'highpass', f0: 2800, dur: 2.2, peak: 0.06, attack: 0.7 });
      for (let i = 0; i < 8; i++) tone(P, { at: 0.2 + i * 0.23 + Math.random() * 0.1, f0: 1800 + Math.random() * 900, dur: 0.05, peak: 0.03 });
    }),
    'weatherCold': voice('weatherCold', (P) => { hiss(P, { f0: 380, f1: 900, Q: 3, dur: 1.8, peak: 0.08, attack: 0.6 }); }),

    // ---------- SYSTEM-ERA PAYOFFS ----------
    'ascensionRise': voice('ascensionRise', (P) => {
      // stillness: a drone holds; the witnesses: it widens; the System:
      // a clean shimmer; the change: a major chord blooms; the price: a
      // tritone underneath that never resolves.
      tone(P, { f0: 110, dur: 5.6, peak: 0.12, attack: 1.2, bus: P.music });
      tone(P, { f0: 165, dur: 5.2, peak: 0.07, attack: 1.6, at: 0.9, bus: P.music });
      tone(P, { at: 1.8, f0: 1760, f1: 2637, dur: 1.4, peak: 0.03, attack: 0.6 });
      chord(P, [440, 554.37, 659.25, 880], { at: 2.5, dur: 2.6, peak: 0.07, attack: 0.25, stagger: 0.07 });
      tone(P, { at: 2.5, f0: 1318.5, dur: 1.8, peak: 0.04 });
      tone(P, { at: 4.4, f0: 155.56, dur: 1.6, peak: 0.08, attack: 0.4, type: 'triangle' });
      if (P.duck) P.duck();
    }),
    'classChime': voice('classChime', (P) => {
      tone(P, { f0: 1318.5, dur: 0.5, peak: 0.07, type: 'square', lp: 3000 });
      tone(P, { at: 0.16, f0: 1975.5, dur: 0.7, peak: 0.06, type: 'square', lp: 3200 });
      tone(P, { f0: 196, dur: 1.4, peak: 0.06, attack: 0.3 });
    }),
    'levelUpFlourish': voice('levelUpFlourish', (P) => {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(P, { at: i * 0.06, f0: f, dur: 0.5, peak: 0.08, type: 'triangle' }));
      hiss(P, { at: 0.2, filter: 'highpass', f0: 5000, dur: 0.5, peak: 0.03, attack: 0.1 });
      if (P.duck) P.duck();
    }),

    // ---------- WARM HUMAN PAYOFFS (never System) ----------
    'flashbackWarm': voice('flashbackWarm', (P) => {
      hiss(P, { filter: 'lowpass', f0: 1200, dur: 3, peak: 0.02, attack: 0.8 }); // tape hiss of memory
      [392, 493.88, 587.33, 493.88].forEach((f, i) => tone(P, { at: 0.2 + i * 0.42, f0: f, dur: 1.4, peak: 0.07 }));
      tone(P, { at: 0.2, f0: 98, dur: 2.6, peak: 0.05, attack: 0.6, bus: P.music });
    }),
    'keepsakeGlow': voice('keepsakeGlow', (P) => { chord(P, [329.63, 415.3, 493.88], { dur: 1.5, peak: 0.05, attack: 0.4, stagger: 0.06 }); }),
    'feastFire': voice('feastFire', (P) => {
      for (let i = 0; i < 14; i++) hiss(P, { at: Math.random() * 1.8, filter: 'highpass', f0: 2000 + Math.random() * 3000, dur: 0.03 + Math.random() * 0.04, peak: 0.05 + Math.random() * 0.05 });
      tone(P, { f0: 110, dur: 2.2, peak: 0.06, attack: 0.5, bus: P.music });
      [392, 493.88, 587.33].forEach((f, i) => tone(P, { at: 0.3 + i * 0.18, f0: f, dur: 0.9, peak: 0.06, type: 'triangle' }));
    }),

    // ---------- TITANS ----------
    'titanEntrySting': voice('titanEntrySting', (P) => {
      tone(P, { f0: 55, dur: 2.2, peak: 0.22, type: 'sawtooth', lp: 500, attack: 0.08 });
      tone(P, { f0: 82.4, dur: 2, peak: 0.14, type: 'sawtooth', lp: 700, attack: 0.15 });
      tone(P, { f0: 77.8, dur: 2, peak: 0.1, type: 'sawtooth', lp: 600, attack: 0.3 }); // the wrong note
      tone(P, { f0: 45, f1: 28, dur: 1.2, peak: 0.3 });
      if (P.duck) P.duck();
    }),
    'titanPhaseSting': voice('titanPhaseSting', (P) => {
      hiss(P, { filter: 'highpass', f0: 2500, dur: 0.18, peak: 0.16 });
      tone(P, { f0: 420, f1: 110, dur: 0.6, peak: 0.12, type: 'sawtooth', lp: 1500 });
    }),
    'titanFallSting': voice('titanFallSting', (P) => {
      tone(P, { f0: 60, f1: 30, dur: 2.4, peak: 0.3 });
      hiss(P, { filter: 'lowpass', f0: 800, f1: 100, dur: 2, peak: 0.18, attack: 0.05 });
      chord(P, [261.63, 329.63, 392, 523.25], { at: 1.1, dur: 2.4, peak: 0.06, attack: 0.5, stagger: 0.1 });
    }),

    // ---------- THE TABLE ----------
    'tableEnterSting': voice('tableEnterSting', (P) => {
      tone(P, { f0: 55, dur: 3.2, peak: 0.1, attack: 1, bus: P.music });
      chord(P, [1760, 2217.5, 2637], { dur: 3, peak: 0.025, attack: 1.2, stagger: 0.3 });
    }),
    'tableLockIn': voice('tableLockIn', (P) => {
      tone(P, { f0: 880, f1: 440, dur: 0.15, peak: 0.08, type: 'square', lp: 2000 });
      tone(P, { at: 0.05, f0: 90, f1: 60, dur: 0.3, peak: 0.2 });
    }),
    'tableBeatPulse': voice('tableBeatPulse', (P) => { tone(P, { f0: 220, dur: 0.5, peak: 0.06, attack: 0.08 }); }),
    'tableWinSting': voice('tableWinSting', (P) => {
      chord(P, [130.81, 261.63, 329.63, 392, 523.25], { dur: 3.2, peak: 0.07, attack: 0.6, stagger: 0.12 });
      tone(P, { at: 1.2, f0: 1046.5, dur: 2, peak: 0.04, attack: 0.3 });
      if (P.duck) P.duck();
    }),
    'tableLoseSting': voice('tableLoseSting', (P) => {
      chord(P, [311.13, 329.63], { dur: 2, peak: 0.07, attack: 0.05, type: 'triangle' });
      tone(P, { at: 0.3, f0: 330, f1: 80, glide: 1.6, dur: 1.8, peak: 0.08, type: 'sawtooth', lp: 900 });
      hiss(P, { filter: 'highpass', f0: 3000, dur: 0.4, peak: 0.1 }); // the ring shatters
    }),

    // ---------- GOD-PATH VERBS ----------
    'verbCue': voice('verbCue', (P, d) => { const r = VERB_CUES[d.cue] || VERB_CUES.aura; r(P); }),

    // ---------- DAY 7: THE ARRIVAL ----------
    'arrivalSting': voice('arrivalSting', (P) => {
      // the sky glitches: stepped square bursts, a dropout, then the cold tone
      for (let i = 0; i < 7; i++) tone(P, { at: i * 0.07, f0: 200 + ((i * 397) % 1800), dur: 0.05, peak: 0.07, type: 'square', lp: 4000 });
      hiss(P, { at: 0.5, filter: 'highpass', f0: 6000, dur: 0.12, peak: 0.08 });
      tone(P, { at: 0.75, f0: 1975.5, dur: 1.6, peak: 0.05, attack: 0.02 });
      tone(P, { at: 0.75, f0: 41.2, dur: 2, peak: 0.24 });
      if (P.duck) P.duck();
    }),
    // arrivalBed({beat}): a held two-sine pad whose root climbs with each
    // tapped beat, under the System's voice. One voice; the next beat
    // crossfades it; arrivalStop ends it. 150s ceiling, never a loop.
    'arrivalBed': voice('arrivalBed', (P, d) => {
      stopBed(P, 0.6);
      const { ctx } = P, t = ctx.currentTime;
      const root = BED_ROOTS[Math.max(0, Math.min(BED_ROOTS.length - 1, d.beat || 0))];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 1.2);
      g.connect(P.music);
      const oscs = [root, root * 1.5, root * 4.02].map((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const og = ctx.createGain(); og.gain.value = [1, 0.5, 0.12][i];
        o.connect(og); og.connect(g); o.start(t); return o;
      });
      const b = { g, oscs };
      b.ceiling = setTimeout(() => { if (bed === b) stopBed(port(), 2); }, 150000);
      bed = b;
    }),
    arrivalStop() { stopBed(port(), 1.2); },

    // ---------- PLACEHOLDER SIGNATURES -> LIVE SYNTH ----------
    // (audio-registry.js placeholder:true; game.js audioEvent now prefers a
    // registered synth over a placeholder render.)
    'fiCrewQuiet': voice('fiCrewQuiet', (P) => {
      // the crew rolls: a hush falls, a clapper, then the dead air
      hiss(P, { filter: 'lowpass', f0: 2400, f1: 300, dur: 1.4, peak: 0.12, attack: 0.3 });
      hiss(P, { at: 1.0, filter: 'highpass', f0: 2500, dur: 0.04, peak: 0.2 });
      tone(P, { at: 1.0, f0: 900, dur: 0.06, peak: 0.08, type: 'square', lp: 2500 });
    }),
    'fiOpeningSting': voice('fiOpeningSting', (P) => {
      // the theme you were promised, ending flat — it's about you now
      [[392, 0], [523.25, 0.18], [659.25, 0.36], [739.99, 0.6]].forEach(([f, at], i) =>
        tone(P, { at, f0: f, dur: i === 3 ? 1.2 : 0.3, peak: 0.1, type: 'sawtooth', lp: 1800, attack: 0.02 }));
      tone(P, { at: 0.6, f0: 98, dur: 1.2, peak: 0.12, type: 'sawtooth', lp: 400 });
    }),
    'auditTax': voice('auditTax', (P) => {
      // the stamp: a rubber thunk, a paper slap, a flat bureaucratic tone
      tone(P, { f0: 140, f1: 70, dur: 0.18, peak: 0.28 });
      hiss(P, { filter: 'bandpass', f0: 1800, Q: 0.8, dur: 0.09, peak: 0.16 });
      tone(P, { at: 0.2, f0: 233, dur: 0.5, peak: 0.07, type: 'square', lp: 1200 });
    }),
  });
})();
