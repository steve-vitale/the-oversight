// @ontology
// system: presentation
// description: The presentation ladder (DECISIONS.md 2026-10-03, Steve: "Start simple, but it would be cool if as you progress, the game graphics and interface keep getting better and better."). Stage 0 terminal -> 1 annotated -> 2 pixel entities -> 3 arrival vignettes -> 4 full tileset. A stage is earned on Codex depth AND days survived (src/data/presentation.json), never on a timer, and is never taken back within a run. app.js renders it as body.stage-N; tile-scenes.js blends the map palette from earthy (stage 0) to rich (stage 4). Also owns the alien-script glyph generator and the glitch rate limit for the System overlay (no DOM here: app.js applies them).
// provides:
//   - presentationStage() -> 0..4, the current ladder stage (monotonic per run)
//   - presentationInfo() -> {stage, id, label, codexDepth, days, next} for debug and tests
//   - codexDepth() -> knowledge depth across every codex section (plant/tree/skill/animal/ability levels; one per beast, recipe, terrain)
//   - alienScript(n, seed) -> n glyphs of untranslated System script (generated, zero assets)
//   - glitchDue(now) -> true when an alien-script glitch may play now (rate-limited by presentation.json glitch)
// consumes:
//   - Game.data.presentation (src/data/presentation.json)
//   - state.codex, state.scholar.day, state.presentation
// rules:
//   - earned_not_timed: a stage needs BOTH its codexDepth and its days; days alone never advance it (code: presentationStage)
//   - never_taken_back: the reached stage is kept on state.presentation.maxStage; the interface is a reward (code: presentationStage)
//   - glitch_is_occasional: at most one glitch per glitch.minGapMs, and only on a chance roll (code: glitchDue)
//   - zero_assets: the alien script is generated from fixed unicode ranges, no font or image (code: alienScript)
(function () {
  const S = globalThis.Scattering = globalThis.Scattering || {};
  const Game = S.Game;
  if (!Game) return;

  let _warned = {};
  function warn(msg, e) {
    // Reported, never swallowed (AGENTS.md rule 6); once per message.
    const k = String(msg);
    if (_warned[k]) return;
    _warned[k] = true;
    console.warn('[presentation] ' + msg + (e ? ': ' + (e && e.message || e) : ''));
  }

  // Fallback mirrors src/data/presentation.json so a harness without the
  // file still answers the same ladder.
  const FALLBACK = {
    stages: [
      { stage: 0, id: 'terminal', label: 'Terminal', codexDepth: 0, days: 0 },
      { stage: 1, id: 'annotated', label: 'Annotated', codexDepth: 4, days: 3 },
      { stage: 2, id: 'pixel', label: 'Pixel entities', codexDepth: 12, days: 7 },
      { stage: 3, id: 'vignettes', label: 'Arrival vignettes', codexDepth: 25, days: 14 },
      { stage: 4, id: 'tileset', label: 'Full tileset', codexDepth: 45, days: 28 },
    ],
    glitch: { minGapMs: 40000, chance: 0.3, durationMs: 450 },
  };
  const cfg = () => {
    const d = Game.data && Game.data.presentation;
    return (d && Array.isArray(d.stages) && d.stages.length) ? d : FALLBACK;
  };

  // Alien script: glyphs from blocks no human language on the device uses
  // as running text here (Ol Chiki, Tifinagh, Canadian Syllabics, Runic,
  // geometric shapes). Picked so they read as WRITING, not as symbols.
  const GLYPH_RANGES = [[0x1C5A, 0x1C7D], [0x2D30, 0x2D67], [0x1401, 0x1430], [0x16A0, 0x16DA], [0x2B1F, 0x2B2F]];

  const methods = {
    codexDepth() {
      try {
        const cx = (this.state && this.state.codex) || {};
        let depth = 0;
        const levelled = ['plants', 'trees', 'skills', 'animals', 'abilities'];
        for (const sec of levelled) {
          for (const e of Object.values(cx[sec] || {})) {
            const lv = (e && typeof e === 'object') ? (e.level == null ? 1 : Number(e.level) || 0) : 1;
            if (lv >= 1) depth += Math.min(lv, 4);
          }
        }
        for (const sec of ['monsters', 'recipes', 'terrain']) {
          const v = cx[sec];
          if (v && typeof v === 'object') depth += Object.keys(v).length;
        }
        return depth;
      } catch (e) { warn('codexDepth', e); return 0; }
    },

    presentationInfo() {
      const C = cfg();
      const depth = this.codexDepth();
      const days = Number(((this.state && this.state.scholar) || {}).day) || 0;
      let earned = 0;
      for (const row of C.stages) {
        if (depth >= (row.codexDepth || 0) && days >= (row.days || 0)) earned = Math.max(earned, row.stage | 0);
      }
      let stage = earned;
      try {
        const st = this.state;
        if (st) {
          const p = st.presentation = st.presentation || { maxStage: 0 };
          if (earned > (p.maxStage || 0)) p.maxStage = earned;
          stage = Math.max(earned, p.maxStage || 0);
        }
      } catch (e) { warn('presentation state', e); }
      if (typeof this.debugPresentationStage === 'number') stage = this.debugPresentationStage;
      stage = Math.max(0, Math.min(4, stage | 0));
      const row = C.stages.find(r => r.stage === stage) || C.stages[0];
      const next = C.stages.find(r => r.stage === stage + 1) || null;
      return { stage, id: row.id, label: row.label, codexDepth: depth, days, next: next ? { stage: next.stage, codexDepth: next.codexDepth, days: next.days } : null };
    },

    presentationStage() {
      try { return this.presentationInfo().stage; } catch (e) { warn('presentationStage', e); return 0; }
    },

    alienScript(n, seed) {
      let s = (Number(seed) >>> 0) || 0x9e3779b9;
      const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      let out = '';
      const len = Math.max(1, Math.min(400, n | 0));
      for (let i = 0; i < len; i++) {
        if (i && rnd() < 0.16) { out += ' '; continue; }
        const r = GLYPH_RANGES[Math.floor(rnd() * GLYPH_RANGES.length)];
        out += String.fromCodePoint(r[0] + Math.floor(rnd() * (r[1] - r[0] + 1)));
      }
      return out;
    },

    glitchDue(now) {
      try {
        const g = cfg().glitch || FALLBACK.glitch;
        const t = Number(now) || 0;
        if (this._lastGlitchAt != null && t - this._lastGlitchAt < (g.minGapMs || 40000)) return false;
        if (Math.random() >= (g.chance == null ? 0.3 : g.chance)) return false;
        this._lastGlitchAt = t;
        return true;
      } catch (e) { warn('glitchDue', e); return false; }
    },
  };

  Object.assign(Game, methods);
})();
