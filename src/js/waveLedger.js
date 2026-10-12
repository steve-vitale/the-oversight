// @ontology
// system: waves
// description: The Wave Ledger — wave unlocks run on KILLS ONLY. Per wave, per village, per run, cumulative across player deaths (lives on state, not the scholar).
// provides:
//   - waveLedgerCfg()
//   - ledgerState()
//   - monsterCounterKnown(monsterId)
//   - scoreLedgerKill(monsterId)
//   - waveLedgerPoints(wave)
//   - ledgerProgressLine()
// rules:
//   - ledger_kills_only: true (code: waveLedger.js — scoreLedgerKill is fed ONLY by recordWaveKill; engagements/flees/evades score nothing)
//   - ledger_counter_convention: true (code: waveLedger.js — monsterCounterKnown: state.monsterCounters[id]===true AND the monster def carries a `counter` field; wave 1-2 defs all carry counter data, so the mastery bonus is LIVE since 2026-10-10 — a kill never scores less than 1)
//   - ledger_per_type_cap: 2 (code: waveLedger.js — perTypeCap; breadth over farming)
//   - ledger_announce_idempotent: true (code: waveLedger.js — 50%/full beats fire once per wave via state._ledgerAnn50/_ledgerAnnFull)
//   - ledger_survives_scholar: true (code: waveLedger.js — ledgerState lives on this.state, not this.state.scholar)
//   - ledger_reverses_8730921c: true (code: game.js — unlockedWave is ledger-only; engagement lanes removed 2026-10-10, Steve's call; the endgame deed gate is untouched)
// NOTE: self-attaching module (Object.assign(Game, methods)). Load AFTER
// game.js (recordWaveKill calls scoreLedgerKill) and progression.js (the deed
// feed it is deliberately separate from). Index order: after progression.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const methods = {
    // waveLedgerCfg: the levers, from src/data/wave-ledger.json. Defensive —
    // the ship loop may run a tree without the file; defaults match the JSON.
    // WAVE_EXTRA_CAP (env, default 0 = legacy): separate per-type allowance
    // for counter-kill extras, OUTSIDE the shared perTypeCap. 0 keeps the
    // canon breadth-not-throughput behavior (extras share the cap); >0 lets
    // the mastery pat keep paying after a type's base cap fills.
    // EXPERIMENT (longsim wave lever r5, 2026-10-12): unlanded unless pacing
    // stays sane and breadth definitions hold — see evidence file.
    waveLedgerCfg() {
      try {
        const d = (this.data && this.data.waveLedger) || {};
        let extraCap = 0;
        try {
          if (typeof process !== 'undefined' && process.env && process.env.WAVE_EXTRA_CAP != null) {
            extraCap = Math.max(0, parseInt(process.env.WAVE_EXTRA_CAP, 10) || 0);
          }
        } catch (e) {}
        return {
          pointsPerKill: d.pointsPerKill != null ? d.pointsPerKill : 1,
          pointsPerCounterKill: d.pointsPerCounterKill != null ? d.pointsPerCounterKill : 2,
          perTypeCap: d.perTypeCap != null ? d.perTypeCap : 2,
          extraPerTypeCap: extraCap,
          barsPerWave: Object.assign({ 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 }, d.barsPerWave || {}),
          dayFloor: d.dayFloor != null ? d.dayFloor : 25,
          wave2DayFloor: d.wave2DayFloor != null ? d.wave2DayFloor : 8,
          counterBonusEnabled: Object.assign({ 1: true, 2: true, 3: true, 4: true, 5: true }, d.counterBonusEnabled || {}),
        };
      } catch (e) {
        return { pointsPerKill: 1, pointsPerCounterKill: 2, perTypeCap: 2, extraPerTypeCap: 0, barsPerWave: { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 }, dayFloor: 25, wave2DayFloor: 8, counterBonusEnabled: { 1: true, 2: true, 3: true, 4: true, 5: true } };
      }
    },
    // ledgerState: defensive init of the ledger. Lives on this.state (the
    // village+run), NOT this.state.scholar — a new adventurer inherits the
    // village's ledger. {1:{points:0,perType:{}},...} for waves 1..5.
    ledgerState() {
      try {
        const st = this.state || {};
        if (!st.waveLedger || typeof st.waveLedger !== 'object') st.waveLedger = {};
        for (let w = 1; w <= 5; w++) {
          const e = st.waveLedger[w];
          if (!e || typeof e !== 'object') st.waveLedger[w] = { points: 0, perType: {}, perTypeX: {} };
          else {
            if (typeof e.points !== 'number') e.points = 0;
            if (!e.perType || typeof e.perType !== 'object') e.perType = {};
            // perTypeX: counter-kill extras scored OUTSIDE the shared cap
            // (WAVE_EXTRA_CAP experiment, 2026-10-12). Legacy runs never
            // write it; init defensively so old saves load clean.
            if (!e.perTypeX || typeof e.perTypeX !== 'object') e.perTypeX = {};
          }
        }
        return st.waveLedger;
      } catch (e) { return { 1: { points: 0, perType: {} } }; }
    },
    // monsterCounterKnown(monsterId): THE CONVENTION for the parallel
    // signature-mechanics loop (2026-10-10). The mastery bonus fires only when
    // BOTH hold: the player/village has discovered the counter
    // (state.monsterCounters[id] === true — set by Game.discoverMonsterCounter
    // when the trick is PERFORMED in combat, or TAUGHT at Haven via the
    // askAbout 'beasttricks' topic; 2026-10-10, structural Worker C) AND the
    // monster def carries a `counter` field describing it. Wave 1-2 defs all
    // carry counter data (2026-10-10) — the bonus is LIVE. A kill never scores
    // less than pointsPerKill; nothing is ever punished for not knowing.
    monsterCounterKnown(monsterId) {
      try {
        const known = (this.state && this.state.monsterCounters && this.state.monsterCounters[monsterId]) === true;
        if (!known) return false;
        const mdef = (this.data && this.data.monsters || []).find(m => m.id === monsterId);
        return !!(mdef && mdef.counter);
      } catch (e) { return false; }
    },
    // scoreLedgerKill(monsterId): the ledger feed choke point's scorer.
    // Called ONLY from recordWaveKill (game.js) — every kill path (player TB
    // kills, villager field-fight kills) flows through recordWaveKill, so the
    // ledger sees them all. Engagements (faced/fled/evaded) never call
    // recordWaveKill and score NOTHING.
    // Legacy: points = counterKnown && counterBonusEnabled[wave] ? pointsPerCounterKill : pointsPerKill
    //   capped by perTypeCap per monster id (breadth, not throughput).
    // WAVE_EXTRA_CAP experiment (2026-10-12): when cfg.extraPerTypeCap > 0,
    // the counter extra (pointsPerCounterKill - pointsPerKill) scores into a
    // SEPARATE per-type allowance (perTypeX), outside the shared cap — the
    // mastery pat keeps paying after a type's base cap fills, while blind
    // farming still caps at perTypeCap/type. Kill points never score below
    // pointsPerKill; nothing is punished for not knowing.
    scoreLedgerKill(monsterId) {
      try {
        if (!monsterId) return 0;
        const cfg = this.waveLedgerCfg();
        const mdef = (this.data && this.data.monsters || []).find(m => m.id === monsterId);
        if (!mdef) return 0;
        const wave = mdef.wave || 1;
        const L = this.ledgerState();
        const entry = L[wave];
        const counterKnown = this.monsterCounterKnown(monsterId);
        const bonusOn = !!(cfg.counterBonusEnabled && cfg.counterBonusEnabled[wave]);
        const extra = (counterKnown && bonusOn) ? Math.max(0, (cfg.pointsPerCounterKill | 0) - (cfg.pointsPerKill | 0)) : 0;
        const base = cfg.pointsPerKill | 0;
        let add = 0;
        if ((cfg.extraPerTypeCap | 0) > 0) {
          // EXPERIMENT PATH: base and extras capped separately.
          entry.perTypeX = entry.perTypeX || {};
          const roomBase = Math.max(0, (cfg.perTypeCap | 0) - ((entry.perType[monsterId] | 0)));
          const baseAdd = Math.min(base, roomBase);
          const roomX = Math.max(0, (cfg.extraPerTypeCap | 0) - ((entry.perTypeX[monsterId] | 0)));
          const extraAdd = Math.min(extra, roomX);
          if (baseAdd > 0) entry.perType[monsterId] = (entry.perType[monsterId] | 0) + baseAdd;
          if (extraAdd > 0) entry.perTypeX[monsterId] = (entry.perTypeX[monsterId] | 0) + extraAdd;
          add = baseAdd + extraAdd;
        } else {
          // LEGACY PATH: everything shares the one per-type cap.
          const points = extra > 0 ? (base + extra) : base;
          const room = Math.max(0, cfg.perTypeCap - ((entry.perType[monsterId] | 0)));
          add = Math.min(points, room);
          if (add > 0) entry.perType[monsterId] = (entry.perType[monsterId] | 0) + add;
        }
        if (add > 0) {
          entry.points += add;
          this._ledgerAnnounce(wave, entry.points, cfg);
        }
        return add;
      } catch (e) { return 0; }
    },
    // waveLedgerPoints(wave): the ledger's point total for that wave.
    waveLedgerPoints(wave) {
      try { return ((this.ledgerState()[wave] || {}).points | 0); } catch (e) { return 0; }
    },
    // _ledgerAnnounce: idempotent System beats at 50% and 100% of each wave's
    // bar. Televised, honest copy ("kills only — not near-misses"). The 100%
    // beat names the REAL next gate, per wave — the gates differ (day floor
    // for waves 2-3, scale floor for 4-5, nothing for 5), and the old generic
    // "the day and scale floors" line was wrong for every wave and an
    // outright lie for wave 5 (there is no wave 6). (sense-fix, longsim wave
    // lever r3 2026-10-11)
    _ledgerAnnounce(wave, points, cfg) {
      try {
        const st = this.state || {};
        st._ledgerAnn50 = st._ledgerAnn50 || {};
        st._ledgerAnnFull = st._ledgerAnnFull || {};
        const bar = (cfg.barsPerWave || {})[wave] || 1;
        if (bar <= 0) return;
        if (points >= bar && !st._ledgerAnnFull[wave]) {
          st._ledgerAnnFull[wave] = true;
          st._ledgerAnn50[wave] = true;
          const d2 = cfg.wave2DayFloor != null ? cfg.wave2DayFloor : 8;
          const dN = cfg.dayFloor != null ? cfg.dayFloor : 25;
          // SCALE-AWARE GATES (beats 4+5, SCALE-DISCOVERY.md 2026-10-12): when
          // the scale floor is the binding constraint, the forward pointer
          // (checkScalePointers, producer voice) carries the message — the
          // ledger just reports the bar, no mechanics-voice gate sentence.
          // When the floor is already met, say what's actually next.
          // DAY-AWARE GATES (beats 1+2, longsim wave lever r6 2026-10-12):
          // the day floors are usually ALREADY past when the bar fills
          // (measured: w1-bar median fill day ~20 vs floor 8; w2-bar ~49
          // vs floor 25) — and the unlock beat fires in the same call stack
          // right after this line. Saying "Wave 3 opens once day 25 passes"
          // in the same breath as the release is a contradiction. Name the
          // day gate only when it's still in the future.
          const day = ((this.state && this.state.scholar) || {}).day || 1;
          const rankNow = (typeof this.scaleRank === 'function' ? this.scaleRank() : 'regional');
          const atLeast = (need) => { try { return this.scaleAtLeast(rankNow, need); } catch (e) { return false; } };
          const gate =
            wave === 1 ? (day >= d2 ? null : `Wave 2 opens once day ${d2} passes.`) :
            wave === 2 ? (day >= dN ? null : `Wave 3 opens once day ${dN} passes.`) :
            wave === 3 ? (atLeast('regional') ? `Wave 4's talent is cleared for release — watch the treeline.` : null) :
            wave === 4 ? (atLeast('national') ? `The Producers are cleared for release — watch the sky.` : null) :
            `That's the whole ledger — the village has bloodied the Producers themselves. No further casting directives. You're the show now.`;
          this.sysSay(`📺 WAVE LEDGER — wave ${wave}'s bar is full (${bar}/${bar} — kills only, not near-misses).` + (gate ? ` ${gate}` : ''));
        } else if (points >= bar / 2 && !st._ledgerAnn50[wave]) {
          st._ledgerAnn50[wave] = true;
          this.sysSay(`📺 WAVE LEDGER — wave ${wave} is halfway there (${points}/${bar} kills — the ledger counts kills only, not near-misses).`);
        }
      } catch (e) {}
    },
    // ledgerProgressLine: the persistent UI line for beatsRowHTML (app.js).
    // Shows the FIRST unfilled wave bar ("kills only", honest labels).
    // Returns '' when every bar is full or the ledger is unavailable.
    ledgerProgressLine() {
      try {
        const cfg = this.waveLedgerCfg();
        for (let w = 1; w <= 5; w++) {
          const bar = (cfg.barsPerWave || {})[w];
          if (!bar) continue;
          const pts = this.waveLedgerPoints(w);
          if (pts < bar) {
            const bonusOn = !!(cfg.counterBonusEnabled && cfg.counterBonusEnabled[w]);
            const ck = bonusOn ? '; counter kills +1' : '';
            return `📺 WAVE LEDGER — wave ${w}: ${pts}/${bar} kills (kills only${ck})`;
          }
        }
        return '';
      } catch (e) { return ''; }
    },
  };
  Object.assign(Game, methods);
})();
