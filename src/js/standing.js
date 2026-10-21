// @ontology
// system: standing
// description: The village's Standing with the System — one bar, three sources (war, diplomacy, plenty). Waves 4-5 unlock on Standing, not on the old two-rung kill+scale gate: the System escalates its attention as the village proves itself. Steve 2026-10-13: the flexible route — several paths or hybrid paths to victory; no win before day 90; every wave must have an impact.
// provides:
//   - standingCfg()
//   - villageStanding()
//   - villageStandingTotal()
//   - standingLine()
//   - _linkRegionalPlus()
//   - waveUnlockReady()
//   - waveCombatReadiness()
//   - _readinessBarLine()
//   - standingDeferral()
//   - standingPlentyCappedTotal()
//   - _standingPeakWave()
//   - _standingHoldBeat()
//   - _standingReleaseBeat()
// rules:
//   - standing_village_level: true (code: standing.js — computed from village state: the ledger, the link roll, the feast log. Never the scholar alone; a new adventurer inherits the village's standing, like the ledger.)
//   - standing_no_new_tracking: true (code: standing.js — reads waveLedgerPoints(), _linkSeasoned(), _linkRegionalPlus() (which itself reads only polityOf/_covenantPolity/_tradePolity), state.feastLog (written by hostFeast). No parallel counters.)
//   - standing_sim_tuning: true (code: standing.js — point values and thresholds are sim starting points per the 2026-10-13 spec, not canon; tune on measured evidence.)
//   - standing_villager_kills_count: true (code: standing.js — the war source reads waveLedgerPoints, which scores player AND villager kills (recordWaveKill). A mayor whose villagers do the killing earns war standing.)
//   - standing_regional_plus: true (code: standing.js — the diplomacy source counts only SEASONED REGIONAL+ links: a link participates in a regional-scale polity (LEAD realm via polityOf('haven'), BELONG realm via polityOf(primary), seasoned covenant/trade league). A lone seasoned bond with a splinter village is courtship, not regional power — it scores 0. 2026-10-14 design call, Steve can overrule.)
//   - standing_readiness_gate: true (code: standing.js — villageStandingTotal() gates the unlock number: (1) COMBAT-READINESS DEFERRAL (design call #4, 2026-10-16) — waveUnlockReady() reads waveCombatReadiness(): four named bars from LIVE village state — armor WORN (S.equipment.armorOf / armorBonus for the scholar), weapons TO HAND (meleeWeaponOf/rangedWeaponOf equipped or a weapon item carried), counters KNOWN (the monsterCounterKnown convention), VETERANS alive (living roster members with a wave-(w-1)+ kill in state.waveKillLog). The old faced-experience bar (distinct wave-(w-1) types faced, fleeing counted) measured EXPOSURE, not capability — a village could flee its way into a war it can't fight — so it was replaced, not stacked (Steve's 2026-10-10 reversal of 8730921c already said engagements don't unlock waves). Demands live in standingCfg().readyDemand — sim starting points, not canon; Steve can overrule. (2) plenty cap — plenty counts at most plentyCapT5 toward the T5 bar, else held at t5-1; (3) monotonic peak ratchet — _standingPeakWave floors the total at the released wave's threshold forever.)
//   - standing_no_silent_gates: true (code: standing.js — every hold/cap is named: standingLine() appends HELD/capped notes, _standingHoldBeat() fires the System beat (initial + 7-day reminders for deferrals, one-time for the cap), _standingReleaseBeat() announces the opening.)
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const methods = {
    // standingCfg: the levers. Sim starting points (2026-10-13 spec), not
    // canon — tune on measured evidence (wave-4 organic unlocks on
    // ~30-50% of day-80+ runs; earliest T4 >= ~day 60).
    standingCfg() {
      return {
        warPerKill: 25,       // +25 per wave-3+ ledger kill point (per-type cap 2 lives in the ledger)
        diplomacyPerLink: 34, // +34 per seasoned link (30+ days, trust 40+)
        plentyPerFeast: 20,   // +20 per major feast (quality>=1: fine or legendary)
        t4: 100,              // wave 4 unlocks: 4 kills | 3 links | 5 feasts | hybrid
        t5: 200,              // wave 5 unlocks (+ wave-4 faced)
        feastQualityMin: 1,
        feastLogCap: 60,
        // COMBAT READINESS (design call #4, 2026-10-16 — sim starting
        // points, not canon; Steve can overrule). The demand each new
        // draft makes of the village's real fighting strength:
        // armored = living roster fighters with armor WORN at P>=armorP
        //   (S.equipment.armorOf; scholar via armorBonus)
        // armed   = living roster fighters with a weapon TO HAND
        //   (equipped melee/ranged, or a weapon item carried)
        // tricks  = counters known (the monsterCounterKnown convention)
        // veterans= living roster members with a recorded kill of a
        //   wave-(w-1)+ monster in state.waveKillLog (survivors of combat —
        //   fleeing records nothing here)
        // RECALIBRATED 2026-10-18 (Steve: "fix readiness bar" — design calls
        // mine, his to overrule). The 2026-10-16 starting points collapsed
        // wave-4 unlocks 14/16 -> 0/16 on the named seeds: veterans bound
        // 98.5-100% of deferral days (median village maxes at 1 living
        // wave-3 killer vs demand 2) and armor co-bound ~60% (median 2 @
        // P>=15 vs demand 4; armor is mortality-selected — 34/47 armored
        // died in the draft they unlocked). The combat-readiness SHAPE is
        // kept (Steve's intent stands: fleeing is not readiness, the bread
        // road must not open a war draft) — only the numbers move, to what
        // a competent combat-invested village can actually field.
        readyDemand: {
          4: { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 },
          5: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 },
        },
        plentyCapT5: 100,     // plenty counts at most this toward the T5 bar
      };
    },
    // _linkRegionalPlus: a seasoned link counts toward diplomacy only when it
    // is a REGIONAL+ link — i.e. it participates in a regional-scale polity.
    // Steve's 2026-10-13 spec says "+34 per seasoned regional+ link"; a lone
    // bond with a splinter village (no polity behind it) is courtship, not
    // regional power, and doesn't move the System. Design call 2026-10-14
    // (Steve can overrule), determined from the link/scale code:
    //   LEAD   — one of Haven's seasoned subordinate links AND
    //            polityOf('haven') exists (>=3 seasoned subordinates: a
    //            realm — four fires under one head). Keeps the spec's
    //            "3 links = 102: the pure DIPLOMACY path" honest.
    //   BELONG — Haven is subordinate AND polityOf(primary) exists (the
    //            primary's realm holds >=4 villages).
    //   LEAGUE — a seasoned covenant/trade peer link inside its league
    //            polity (_covenantPolity()/_tradePolity() non-null, this
    //            link among its member links).
    // Reads only existing APIs — no new tracking. Fail-closed: missing
    // APIs or any error read as not-regional+ (never unlocks by accident).
    _linkRegionalPlus(l) {
      try {
        if (!l || l.status !== 'active') return false;
        const HOME = 'haven';
        const isSub = (l.primary === HOME && l.subordinate !== HOME);
        const isBelong = (l.subordinate === HOME && l.primary !== HOME);
        const isPeer = (l.kind === 'covenant' || l.kind === 'trade');
        if (isSub && typeof this.polityOf === 'function') {
          return !!this.polityOf(HOME);
        }
        if (isBelong && typeof this.polityOf === 'function') {
          return !!this.polityOf(l.primary);
        }
        if (isPeer) {
          if (typeof this._linkSeasoned !== 'function' || !this._linkSeasoned(l)) return false;
          if (l.kind === 'covenant' && typeof this._covenantPolity === 'function') {
            const cp = this._covenantPolity();
            if (cp && cp.links) for (let i = 0; i < cp.links.length; i++) if (cp.links[i] === l) return true;
          }
          if (l.kind === 'trade' && typeof this._tradePolity === 'function') {
            const tp = this._tradePolity();
            if (tp && tp.links) for (let i = 0; i < tp.links.length; i++) if (tp.links[i] === l) return true;
          }
          return false;
        }
        return false;
      } catch (e) { return false; }
    },
    // villageStanding: the full breakdown, honestly. Reads only existing
    // state — the ledger (waveLedgerPoints), the link roll (_linkSeasoned +
    // the regional+ filter), the feast log (hostFeast writes state.feastLog).
    villageStanding() {
      const cfg = this.standingCfg();
      let warPts = 0;
      try {
        for (const w of [3, 4, 5]) {
          warPts += (typeof this.waveLedgerPoints === 'function') ? (this.waveLedgerPoints(w) | 0) : 0;
        }
      } catch (e) {}
      let links = 0;
      try {
        const ls = (typeof this.hierarchyState === 'function') ? this.hierarchyState() : [];
        for (const l of ls) {
          const seasoned = (typeof this._linkSeasoned === 'function')
            ? this._linkSeasoned(l, !!l.conquered)
            : false;
          // REGIONAL+ FILTER (2026-10-14): seasoned alone is not enough —
          // the link must participate in a regional-scale polity.
          if (seasoned && this._linkRegionalPlus(l)) links++;
        }
      } catch (e) {}
      let feasts = 0;
      try {
        const log = (this.state && this.state.feastLog) || [];
        for (const f of log) if (((f && f.quality) | 0) >= cfg.feastQualityMin) feasts++;
      } catch (e) {}
      const war = warPts * cfg.warPerKill;
      const diplomacy = links * cfg.diplomacyPerLink;
      const plenty = feasts * cfg.plentyPerFeast;
      return { total: war + diplomacy + plenty, war, diplomacy, plenty, warPts, links, feasts };
    },
    // villageStandingTotal: the GATED number the unlock gate reads.
    // Missing module/data reads as 0 — never unlocks by accident.
    //
    // READINESS GATE (design call #4, 2026-10-16):
    // three layers on the honest breakdown, all in this function so
    // unlockedWave() in game.js stays untouched (it is the only engine
    // reader):
    //   1. PLENTY CAP — plenty counts at most plentyCapT5 toward the T5
    //      bar: raw >= t5 but capped < t5 holds the total at t5-1
    //      (one-time System beat). Bread alone cannot buy the fifth draft.
    //   2. COMBAT-READINESS DEFERRAL — wave 4 releases only when the
    //      village's real fighting strength meets the draft's demand
    //      (waveCombatReadiness: armored/armed/tricks/veterans bars read
    //      from live village state). While deferred the total holds at
    //      t4-1 / t5-1, with the hold beat + weekly reminders naming the
    //      short bars. The old faced-experience bar is retired: fleeing
    //      three monsters is exposure, not readiness. No silent gates.
    //   3. MONOTONIC PEAK RATCHET — once the gated total releases wave w,
    //      _standingPeakWave records it and the effective total never
    //      drops below that wave's threshold again: a broken link can't
    //      re-lock an opened draft (the deferral beat promises it "opens").
    // The tightest applicable hold is the binding one — that's the message
    // the player hears.
    villageStandingTotal() {
      try {
        const cfg = this.standingCfg();
        const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
        const s = this.villageStanding();
        const raw = (s.total | 0) || 0;
        const cap = (cfg.plentyCapT5 | 0) || 100;
        const capped = ((s.war | 0) + (s.diplomacy | 0) + Math.min((s.plenty | 0), cap)) | 0;
        let peak = this._standingPeakWave();
        const rd4 = this.waveUnlockReady(4), rd5 = this.waveUnlockReady(5);
        const holds = [];
        if (raw >= t5 && capped < t5 && peak < 5) holds.push({ bound: t5 - 1, kind: 'cap' });
        if (raw >= t4 && !rd4.ready && peak < 4) holds.push({ bound: t4 - 1, kind: 'defer4', rd: rd4 });
        if (capped >= t5 && !rd5.ready && peak < 5) holds.push({ bound: t5 - 1, kind: 'defer5', rd: rd5 });
        let gated = raw;
        for (const h of holds) if (h.bound < gated) gated = h.bound;
        let minBound = Infinity;
        for (const h of holds) if (h.bound < minBound) minBound = h.bound;
        const binding = (minBound < raw) ? holds.filter(h => h.bound === minBound) : [];
        // release: the gated total opens a new wave — record the peak (one-way)
        if (gated >= t5 && peak < 5) {
          peak = 5; this.state._standingPeakWave = 5; this._standingReleaseBeat(5);
        } else if (gated >= t4 && peak < 4) {
          peak = 4; this.state._standingPeakWave = 4; this._standingReleaseBeat(4);
        }
        for (const h of binding) this._standingHoldBeat(h);
        const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
        return Math.max(gated, floor);
      } catch (e) {
        try { return (this.villageStanding().total | 0) || 0; } catch (e2) { return 0; }
      }
    },
    // waveCombatReadiness(w): the real combat-readiness representation
    // (design call #4, 2026-10-16). Standing opens the wave door; this
    // decides whether the village walks through. Four named bars, all read
    // from LIVE village state — never a policy lever, never a fake number.
    // Fail-closed: any read error returns not-ready (never unlocks by
    // accident). Waves 1-3 are never gated.
    waveCombatReadiness(w) {
      const unready = (short) => ({ wave: w, ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short });
      try {
        if (w === 1 || w === 2 || w === 3) return { wave: w, ready: true, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: [] };
        const cfg = this.standingCfg();
        const dem = (cfg.readyDemand && cfg.readyDemand[w]) || null;
        if (!dem || (w !== 4 && w !== 5)) return unready(['unknown-wave']);
        const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
        const eq = S.equipment || null;
        const itemDefs = (this.data && this.data.items) || [];
        const roster = ((this.state && this.state.village && this.state.village.roster) || []);
        const scholarId = this.villagerId;
        const vpCache = {};
        const vpOfId = (vid) => {
          if (vid === scholarId) return null;
          if (!(vid in vpCache)) {
            let vp = null;
            try { vp = (typeof this.vpOf === 'function') ? this.vpOf(vid) : null; } catch (e) { vp = null; }
            vpCache[vid] = vp;
          }
          return vpCache[vid];
        };
        const isLiving = (vid) => {
          if (vid === scholarId) return true; // the scholar is the current adventurer
          const vp = vpOfId(vid);
          return !!(vp && !vp.dead);
        };
        const carriesWeapon = (items) => {
          for (const e of (items || [])) {
            const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
            if (!iid) continue;
            const def = itemDefs.find(d => d && d.id === iid);
            if (def && def.weapon) return true;
          }
          return false;
        };
        let armored = 0, armed = 0;
        for (const vid of roster) {
          if (!isLiving(vid)) continue;
          if (vid === scholarId) {
            // Scholar: the player-facing readers (state.scholar.equipped /
            // inventory, not the vp record).
            let ap = 0, wp = false;
            try { ap = (typeof this.armorBonus === 'function') ? (this.armorBonus() | 0) : 0; } catch (e) { ap = 0; }
            try { const ew = (typeof this.equippedWeapon === 'function') ? this.equippedWeapon() : null; wp = !!(ew && !ew.unarmed); } catch (e) { wp = false; }
            if (!wp) { try { wp = carriesWeapon((this.state && this.state.scholar && this.state.scholar.inventory) || []); } catch (e) { wp = false; } }
            if (ap >= (dem.armorP | 0)) armored++;
            if (wp) armed++;
            continue;
          }
          const vp = vpOfId(vid);
          if (!vp) continue;
          let ap = 0;
          try { ap = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) || 0) : 0; } catch (e) { ap = 0; }
          if (ap >= (dem.armorP | 0)) armored++;
          let wp = false;
          try { wp = !!(eq && ((typeof eq.meleeWeaponOf === 'function' && eq.meleeWeaponOf(vp)) || (typeof eq.rangedWeaponOf === 'function' && eq.rangedWeaponOf(vp)))); } catch (e) { wp = false; }
          if (!wp) { try { wp = carriesWeapon(vp.items); } catch (e) { wp = false; } }
          if (wp) armed++;
        }
        let tricks = 0;
        try {
          const mc = (this.state && this.state.monsterCounters) || {};
          for (const mid of Object.keys(mc)) {
            if (typeof this.monsterCounterKnown === 'function' && this.monsterCounterKnown(mid)) tricks++;
          }
        } catch (e) { tricks = 0; }
        let veterans = 0;
        try {
          const log = (this.state && this.state.waveKillLog) || [];
          const seen = new Set();
          // VETSHAPE instrument (sim-vetshape, 2026-10-17, scale-onramp):
          // default OFF. OFF = pristine behavior (living killers only) —
          // byte-identical; the det-gate in scripts/test-vetshape-20261017.js
          // pins that. ON (VETSHAPE=1) = the "bar changes shape" instrument
          // for Steve's #427 readiness-gate call (named next from
          // evidence/2026-10-17/sim-wave4census.md): count DISTINCT KILLER
          // VIDS with wave-(w-1)+ kills in the same waveKillLog the gate
          // already reads, living-OR-DEAD. Demand now 1 for wave 4, 2 for
          // wave 5 (2026-10-18 recalibration). NOT a game change: the
          // default stays living-veterans until Steve rules.
          const killShape = ((typeof process !== 'undefined' && process.env && process.env.VETSHAPE) === '1');
          for (const e of log) {
            if (!e || !e.by || ((e.w | 0) < (w - 1))) continue;
            if (!killShape && !isLiving(e.by)) continue;
            seen.add(e.by);
          }
          veterans = seen.size;
        } catch (e) { veterans = 0; }
        const short = [];
        if (armored < (dem.armored | 0)) short.push('armor');
        if (armed < (dem.armed | 0)) short.push('weapons');
        if (tricks < (dem.tricks | 0)) short.push('tricks');
        if (veterans < (dem.veterans | 0)) short.push('veterans');
        return { wave: w, ready: short.length === 0, armored, armed, tricks, veterans, demand: dem, short };
      } catch (e) {
        try { console.warn('[waveCombatReadiness] read failed, failing closed:', e && e.message); } catch (e2) {}
        return unready(['read-error']);
      }
    },
    // _readinessBarLine(rd): the honest bar readout for hold beats and the
    // standing line — names exactly what the village lacks, in the village's
    // own terms. Knowledge-gated: the wave's TITLE is never named here
    // (that's waveUnlockBeat's job when the draft actually lands); the BAR
    // is the fiction — the village knows it's not ready, the scouts report
    // the horde.
    _readinessBarLine(rd) {
      try {
        const dem = (rd && rd.demand) || {};
        const bits = [];
        if ((rd.short || []).includes('armor')) bits.push(`armor the village (${rd.armored | 0} of ${dem.armored | 0} fighters armored)`);
        if ((rd.short || []).includes('weapons')) bits.push(`put weapons in hands (${rd.armed | 0} of ${dem.armed | 0} armed)`);
        if ((rd.short || []).includes('tricks')) bits.push(`learn their tricks (${rd.tricks | 0} of ${dem.tricks | 0} known)`);
        if ((rd.short || []).includes('veterans')) bits.push(`blood your fighters (${rd.veterans | 0} of ${dem.veterans | 0} veterans)`);
        return bits.length ? bits.join('; ') : 'the village stands ready';
      } catch (e) { return 'the village is not ready'; }
    },
    // waveUnlockReady(w): the readiness bar the deferral layers read.
    // Design call #4 (2026-10-16) rebuilt it on combat CAPABILITY
    // (waveCombatReadiness). The old faced-experience bar (distinct
    // wave-(w-1) types faced, fleeing counted) measured exposure, not
    // readiness — a village could flee its way into a war it can't fight.
    // Waves 1-3 are unchanged (never gated); unknown waves fail closed.
    waveUnlockReady(w) {
      try {
        if (w === 1 || w === 2 || w === 3) {
          return { wave: w, ready: true, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: [] };
        }
        if (w !== 4 && w !== 5) return { wave: w, ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: ['unknown-wave'] };
        const r = this.waveCombatReadiness(w);
        return { wave: w, ready: !!r.ready, armored: r.armored | 0, armed: r.armed | 0, tricks: r.tricks | 0, veterans: r.veterans | 0, demand: r.demand || null, short: r.short || [] };
      } catch (e) {
        try { console.warn('[waveUnlockReady] failed, failing closed:', e && e.message); } catch (e2) {}
        return { wave: w, ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: ['read-error'] };
      }
    },
    // standingPlentyCappedTotal(): plenty counts at most plentyCapT5 toward
    // the T5 bar. The honest capped number — the gate's T5 trigger.
    standingPlentyCappedTotal() {
      try {
        const cfg = this.standingCfg(), s = this.villageStanding();
        const cap = (cfg.plentyCapT5 | 0) || 100;
        return (((s.war | 0) + (s.diplomacy | 0) + Math.min((s.plenty | 0), cap)) | 0) || 0;
      } catch (e) { return 0; }
    },
    // standingDeferral(w): is wave w's Standing unlock currently deferred?
    // grandfathered: the peak ratchet already released this wave — the
    // deferral no longer applies (monotonic unlocks).
    standingDeferral(w) {
      const none = { wave: w, deferred: false, grandfathered: false };
      try {
        const cfg = this.standingCfg();
        const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
        if (w !== 4 && w !== 5) return none;
        const peak = this._standingPeakWave();
        if (peak >= w) return { wave: w, deferred: false, grandfathered: true, peak };
        const s = this.villageStanding(), raw = (s.total | 0) || 0;
        const barsOf = (rd) => ({ armored: rd.armored | 0, armed: rd.armed | 0, tricks: rd.tricks | 0, veterans: rd.veterans | 0, short: rd.short || [], demand: rd.demand || null });
        if (w === 4) {
          const rd = this.waveUnlockReady(4);
          return { wave: 4, deferred: raw >= t4 && !rd.ready, ready: rd.ready, bars: barsOf(rd), raw, threshold: t4, grandfathered: false };
        }
        const capped = this.standingPlentyCappedTotal(), rd = this.waveUnlockReady(5);
        return { wave: 5, deferred: capped >= t5 && !rd.ready, ready: rd.ready, bars: barsOf(rd), raw, capped, threshold: t5, grandfathered: false };
      } catch (e) { return none; }
    },
    // _standingPeakWave(): highest wave the gated total has released.
    // The monotonic ratchet's memory — village-level, survives in state.
    _standingPeakWave() {
      try { return ((this.state && this.state._standingPeakWave) | 0) || 0; } catch (e) { return 0; }
    },
    // _standingHoldBeat(h): the System names the hold aloud — never silent.
    // Deferral holds: initial beat + weekly reminders (the hold must stay
    // legible while it bites). Plenty-cap: one-time.
    _standingHoldBeat(h) {
      try {
        const day = (this.state && this.state.scholar && this.state.scholar.day) || 0;
        const say = (t) => { try { if (typeof this.sysSay === 'function') this.sysSay(t); } catch (e) {} };
        if (h.kind === 'cap') {
          if (this.state._standingPlentyCapBeat != null) return;
          this.state._standingPlentyCapBeat = day;
          say('📡 The fifth draft is not bought with bread alone. Bread counts a hundred toward it and not a crumb more — bring blood or bonds for the rest.');
          return;
        }
        const key = h.kind === 'defer4' ? 4 : 5;
        this.state._standingDeferBeat = this.state._standingDeferBeat || {};
        const last = this.state._standingDeferBeat[key];
        if (last != null && day - last < 7) return;
        this.state._standingDeferBeat[key] = day;
        const first = (last == null);
        const bars = this._readinessBarLine(h.rd);
        if (h.kind === 'defer4') {
          // KNOWLEDGE GATE (2026-10-15): this hold can bite before wave 3
          // unlocks (bread road: standing hits t4 early), so the wave-4
          // title is never named here — the name isn't earned until wave 4
          // lands ("the next act" discipline, matching the scale-pointer
          // beats). Wave 3's title is used only when wave 3 itself is
          // earned (day floor + wave-2 bar, read directly — unlockedWave()
          // recurses through villageStandingTotal()). Mechanics untouched.
          let w3 = false;
          try {
            const wl = (typeof this.waveLedgerCfg === 'function') ? this.waveLedgerCfg() : {};
            const barsCfg = (wl && wl.barsPerWave) || {};
            const dN = wl.dayFloor != null ? wl.dayFloor : 25;
            const need2 = (barsCfg[2] | 0) || 4;
            const pts2 = (typeof this.waveLedgerPoints === 'function') ? (this.waveLedgerPoints(2) | 0) : 0;
            w3 = day >= dN && pts2 >= need2;
          } catch (e) {}
          say(first
            ? (w3
              ? `📡 The next act is not for strangers. The village must be ready to FIGHT the Final Draft — ${bars}.`
              : `📡 The next act is not for strangers. The village must be ready to FIGHT it — ${bars}.`)
            : (w3
              ? `📡 The next act is still waiting — ${bars}.`
              : `📡 The next act is still waiting. Stand ready to fight it — ${bars}.`));
        } else {
          // KNOWLEDGE GATE (2026-10-21, backlog #734): the wave-5 TITLE
          // ("The Producers") is never named in the hold — it isn't earned
          // until wave 5 lands (_standingReleaseBeat(5)'s job; matches the
          // defer4 discipline above and _readinessBarLine's comment:
          // numbered drafts are fine, titles are not).
          say(first
            ? `📡 The fifth draft stays in the wings. It wants a village that can fight — ${bars}.`
            : `📡 The fifth draft stays in the wings — ${bars}.`);
        }
      } catch (e) {}
    },
    // _standingReleaseBeat(w): the draft opens — the world responds when
    // the village is ready, never before.
    _standingReleaseBeat(w) {
      try {
        const say = (t) => { try { if (typeof this.sysSay === 'function') this.sysSay(t); } catch (e) {} };
        if (w === 4) say('📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens.');
        else if (w === 5) say('📡 RATINGS ARE UP... the Producers have greenlit the fifth draft. Wave 5 talent has been released.');
      } catch (e) {}
    },
    // standingLine: the honest one-line readout for beats/debug — names
    // every hold and cap, no silent gates.
    standingLine() {
      try {
        const s = this.villageStanding(), cfg = this.standingCfg();
        let line = `Standing ${s.total} (war ${s.war} · bonds ${s.diplomacy} · bread ${s.plenty}) — wave 4 at ${cfg.t4}, wave 5 at ${cfg.t5}`;
        const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
        const raw = (s.total | 0) || 0;
        const capped = this.standingPlentyCappedTotal();
        const peak = this._standingPeakWave();
        const notes = [];
        if (raw >= t5 && capped < t5 && peak < 5) notes.push(`bread capped at ${(cfg.plentyCapT5 | 0) || 100} toward wave 5`);
        if (raw >= t4 && !this.waveUnlockReady(4).ready && peak < 4) {
          const rd = this.waveUnlockReady(4);
          notes.push(`HELD at wave 3: not ready to fight the next draft (${this._readinessBarLine(rd)})`);
        }
        if (capped >= t5 && !this.waveUnlockReady(5).ready && peak < 5) {
          const rd = this.waveUnlockReady(5);
          notes.push(`HELD at wave 4: the fifth draft waits (${this._readinessBarLine(rd)})`);
        }
        if (peak >= 4 && raw < (peak >= 5 ? t5 : t4)) notes.push(`wave ${peak} held open (standing floor)`);
        if (notes.length) line += ' — ' + notes.join('; ');
        return line;
      } catch (e) { return 'Standing —'; }
    },
  };
  Object.assign(Game, methods);
})();
