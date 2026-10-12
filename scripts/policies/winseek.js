// policies/winseek.js — WIN-SEEKING policy (Worker E, 2026-10-10).
// Actively pursues the galactic-table deed gate (Steve's order: "run games
// that SEEK to complete the game"). Built on the competent survival base,
// but every passive instinct is inverted into a pursuing one:
//
//  1. WAVE DEED BARS (5/5/4/3/2 distinct fought) — SEEK encounters (hunting
//     patrols to far wild tiles), ENGAGE every fight (never flee at start;
//     flee only near-death). Facing counts — you stood on the grid.
//  2. 3 CONTESTS SURVIVED — boost notability/viewership (arena deeds), always
//     PARTICIPATE when grabbed, play to survive (never refuse).
//  3. NATIONAL+ SCALE — court villages actively: proposeLink as subordinate
//     (Steve: joining as a valued subordinate is legitimate), accept
//     counter-offers, answer the national beat (never refuse/walk).
//  4. 3 CRISES — weather them: respond to raids, feed through famine,
//     treat disease. Don't dodge the beat.
//  5. SENTIMENT TAUGHT (auto at integ 60) + FEAST SURGE USED — channel
//     keepsakes daily, host feasts weekly, channel at surge, use feastburn.
//  6. INTEGRATION ≥3 (stage 3) — system quests, trials, teaching, naming,
//     books. Play-weighted integration is the engine.
//
// Every road is best-effort and try/catch-guarded: a hostile Game API must
// never kill a run.
'use strict';
const { competent, forageTripSeedFirst, sortHaul, donateHaul } = require('./competent');
const idle = require('./idle');

function rosterOf(Game) {
  try {
    return ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  } catch (e) { return []; }
}

// ---------- ROAD 1: HUNT — seek encounters, engage fights ----------

// Hunting patrol: travel to far wild tiles to trigger checkEncounter rolls.
// ~3x/week (day % 7 in [1,3,5]) — every fight is death risk, so patrols are
// deliberate, not daily. More tile entries = more spawn rolls (pity clock
// makes sustained travel ~16%/entry effective).
function huntPatrol(Game, ctx) {
  try {
    const s = Game.state.scholar;
    const day = s.day || 1;
    // FEASTED (longsim winpath r3 2026-10-12): while the feast buff is live
    // and unused, hunt EVERY day — the buff is the point. Otherwise 3x/week.
    let feasted = false;
    try {
      feasted = Game.feastedActive && Game.feastedActive() && !((s.feastBuff || {}).used);
    } catch (e) {}
    if (!feasted && ![1, 3, 5].includes(day % 7)) return;
    if (ctx._patrolDay === day && !feasted) return; // once per day (upkeep runs 3x/day)
    ctx._patrolDay = day;
    if ((s.kcal || 0) < (Game.kcalCap ? Game.kcalCap() * 0.4 : 800)) return; // don't hunt starving
    // EAT FIRST, HUNT SECOND (journey-endgame r3 2026-10-11): a deed-seeker
    // who lives off the pantry is a freeloader — the village exiles them
    // (measured: 20k takes / 0 gives by day 22, exiled day 17, which blocks
    // the feast road and the table). If we're a net drain on the commons,
    // the day is for food, not patrols. The village is watching.
    try {
      const v = Game.state.village || {};
      const me = Game.villagerId;
      const drain = ((v.takes || {})[me] || 0) - ((v.gives || {})[me] || 0);
      if (drain > 3000) return; // in the red: forage, don't patrol
    } catch (e) {}
    // WAVE-TARGETED: only patrol if some unlocked wave's deed bar is unfilled.
    // No deed value = no death risk. EXCEPT while FEASTED: the buff is the
    // deed (feastSurgeUsed), and it expires. Hunt anyway.
    try {
      const g = Game.deedGateReady ? Game.deedGateReady() : null;
      if (g && !feasted) {
        const bars = [g.w1 >= 5, g.w2 >= 5, g.w3 >= 4, g.w4 >= 3, g.w5 >= 2];
        const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
        let need = false;
        for (let w = 1; w <= uw; w++) if (!bars[w - 1]) { need = true; break; }
        if (!need) return;
      }
    } catch (e) {}
    const hx = Game.map.px, hy = Game.map.py;
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven') continue;
      let blocked = false;
      try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d });
    }
    // prefer FAR tiles (more entries en route? no — travelTo is direct;
    // far tiles are simply different ground, more rolls across the patrol)
    cands.sort((a, b) => b.d - a.d);
    let visited = 0;
    for (const c of cands.slice(0, 4)) {
      if (Game.over) break;
      try { Game.travelTo(c.x, c.y); } catch (e) { break; }
      if (Game.over || Game.tbfight) break;
      if (Game.map.px !== c.x || Game.map.py !== c.y) continue;
      visited++;
      // look around: perception may surface the monster; forage the patch too
      try { Game.doAction('forage', {}); } catch (e) {}
      if (Game.over || Game.tbfight) break;
    }
    if (visited) {
      ctx.patrols = (ctx.patrols || 0) + 1;
      try { Game.travelTo(hx, hy); } catch (e) {}
    }
  } catch (e) {}
}

// Fight handler: ENGAGE. Strike the weakest monster; flee only near death.
// (competent flees bad matchups at fight start — win-seeking needs the
// deed bars filled, and facing counts. A dead scholar respawns as another
// villager; a fled fight still records.)
function winseekFight(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    const endTurn = () => {
      try {
        const q = Game.tbFighter('p');
        q.moveLeft = 0; q.acted = true;
        Game.tbAfterPlayerAction();
      } catch (e) {}
    };
    const flee = () => {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const tx = px <= 4 ? 0 : 8;
        try { Game.tbPlayerMove(tx, py); ctx.fled = (ctx.fled || 0) + 1; } catch (e) {}
      } catch (e) {}
      endTurn();
      return true;
    };
    // FIGHT-START (runs once per fight): snapshot faced-before (startCombat
    // records the deed immediately, so by handler time EVERYTHING looks
    // faced — we flee only if it was faced BEFORE this fight), then assess.
    // LONGSIM WINPATH R4: while the feast buff is live and UNUSED, the buff
    // is the point — the deed (feastSurgeUsed) needs a real combat use, and
    // the ×2+ multiplier is the equalizer the outmatched math doesn't see.
    // Don't flee for deed-value reasons (outmatched / wave-filled /
    // already-faced). Near-death (below) still flees — dying is worse than
    // missing the deed.
    let feastedDeed = false;
    try {
      feastedDeed = !!(Game.feastedActive && Game.feastedActive() && !(((Game.state || {}).scholar || {}).feastBuff || {}).used);
    } catch (e) {}
    if (ctx._fightObj !== f) {
      ctx._fightObj = f;
      ctx._fledThisFight = false;
      try {
        const faced = (Game.deedState ? Game.deedState().wavesFaced : {}) || {};
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        // Remove this fight's monsters from the snapshot (they were just added)
        ctx._facedBefore = Object.assign({}, faced);
        for (const m of monsters) delete ctx._facedBefore[m.monsterId];
      } catch (e) { ctx._facedBefore = {}; }
      // NEW-FIGHT ASSESSMENT (the deed records at startCombat even if we
      // flee on turn 1): don't bleed in fights we can't win. Win-seeking is
      // BOLDER than competent: engage up to 3.5x HP.
      try {
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let totalMhp = 0, maxWave = 1;
        for (const m of monsters) {
          totalMhp += m.maxHp || m.hp || 0;
          const md = ((Game.data || {}).monsters || []).find(d => d.id === m.monsterId);
          if (md && md.wave) maxWave = Math.max(maxWave, md.wave);
        }
        const pmax = p.maxHp || 100;
        const outmatched = totalMhp > 3.5 * pmax ||
          (maxWave >= 2 && hpPct < 0.6) ||
          hpPct < 0.5;
        if (outmatched && monsters.length && !feastedDeed) {
          ctx.fledBad = (ctx.fledBad || 0) + 1;
          return flee();
        }
      } catch (e) {}
    }
    // WAVE-TARGETED: only risk death for waves with unfilled deed bars.
    // The bars are 5/5/4/3/2 — once a wave's bar is filled, its monsters are
    // just death risk with no deed value. Flee those.
    try {
      const g = Game.deedGateReady ? Game.deedGateReady() : null;
      if (g) {
        const bars = [0, 5, 5, 4, 3, 2]; // index by wave
        const counts = [0, g.w1, g.w2, g.w3, g.w4, g.w5];
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        const allFilled = monsters.length && monsters.every(m => {
          const md = ((Game.data || {}).monsters || []).find(d => d.id === m.monsterId);
          const w = (md && md.wave) || 1;
          return (counts[w] || 0) >= (bars[w] || 99);
        });
        if (allFilled && !feastedDeed) {
          ctx.fledFilled = (ctx.fledFilled || 0) + 1;
          return flee();
        }
      }
    } catch (e) {}
    // ALREADY-FACED: a skilled player recognizes beasts from the Monster
    // Codex — no reason to risk death re-fighting a known quantity.
    try {
      const facedBefore = ctx._facedBefore || {};
      const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      if (monsters.length && monsters.every(m => facedBefore[m.monsterId]) && !feastedDeed) {
        ctx.fledKnown = (ctx.fledKnown || 0) + 1;
        return flee();
      }
    } catch (e) {}
    // Near-death: walk to the edge (flee-by-barrier). The deed recorded at
    // fight start; staying is just a death.
    if (hpPct < 0.3) return flee();
    const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
    if (!alive.length) return false;
    alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    const tgt = alive[0];
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    // Close the distance first (striking out of range is a no-op).
    try {
      const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
      const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
      if (d0 > (w.range || 1)) {
        const occupied = new Set(
          f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tmx + dx, cy = tmy + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) { try { Game.tbPlayerMove(bx, by); } catch (e) {} }
        endTurn();
        return true;
      }
    } catch (e) {}
    try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
    endTurn();
    return true;
  } catch (e) { return false; }
}

// ---------- ROAD 2: CONTESTS — always participate, play to survive ----------
// The harness's driveContests picks choice 0; the choice phase is
// [Participate, Refuse], so 0 = participate. We just make sure never to
// refuse and track participation.
function contestRoad(Game, ctx) {
  try {
    const ac = Game.state.activeContest;
    if (!ac) return;
    ctx.sawContest = (ctx.sawContest || 0) + 1;
  } catch (e) {}
}

// ---------- ROAD 3: SCALE — court villages actively ----------

// The climb: build opinion through lived contact. Cheapest reliable lever
// the policy can pull repeatedly: study their codex (honoring knowledge)
// and deeds on the broadcast happen via contests. Joining them is expensive
// (leaves Haven). We do what we can from home.
function courtshipClimb(Game, ctx) {
  try {
    const ovs = Game.state.otherVillages || [];
    for (const ov of ovs) {
      if (!ov || ov.id === 'haven') continue;
      if (!Game.knowsVillage || !Game.knowsVillage(ov)) continue;
      if (Game.linkWith && Game.linkWith(ov.id)) continue; // already linked
      if ((ov.opinion || 0) >= 25) continue; // courted enough
      // Study their book: honoring their knowledge moves opinion.
      try {
        if (Game.studyVillageCodex) { Game.studyVillageCodex(ov.id); ctx.climb = (ctx.climb || 0) + 1; }
      } catch (e) {}
    }
  } catch (e) {}
}

// ---------- SIM INSTRUMENT ONLY (travel longsim r5 2026-10-12) ----------
// FED SURVIVAL FLOOR. This is NOT game code and is NEVER shipped as such:
// a controlled experimental instrument that removes the food wall so the
// long-run sim can measure the UPPER ladder's honesty end to end. If the
// ladder climbs when fed, travel's machinery is honest and the food wall is
// confirmed THE binding constraint. If something still doesn't reach even
// when fed — that's travel's real blank.
// HOW IT WORKS: once a day, stock the pantry up to 3 days of village food
// (real pieces via Game.stockPantry — eaten honestly through villageEats,
// tribute paid from it is real food). Nothing else is touched: villagers
// still forage, still hunt, still die in fights; disease, raids, tribute
// demands, trust, gossip all run. The only thing removed is starvation.
// The stocked food is MARKED in the item name so transcripts read honestly.
function fedFloorRoad(Game, ctx) {
  try {
    const v = Game.state && Game.state.village;
    if (!v) return;
    const pop = (((v.roster || []).length || 1)) + 0;
    const perDay = 2000;
    let cur = 0;
    try { cur = Game.pantryKcalLive ? Game.pantryKcalLive(v) : 0; } catch (e) {}
    const target = pop * perDay * 3;
    const add = target - cur;
    if (add > 500 && Game.stockPantry) {
      Game.stockPantry(add, 'fed-floor grain (SIM INSTRUMENT r5 — removes the food wall; not game food)');
      ctx.fedKcal = (ctx.fedKcal || 0) + Math.round(add);
      ctx.fedDays = (ctx.fedDays || 0) + 1;
    }
  } catch (e) {}
}
// -----------------------------------------------------------------------

// Answer the first gesture (pendingAccord): the designed regional moment —
// Haven's first impression on the other fire (gift 2,000 kcal / the
// representative's three days / cold ink). A sim policy that never answers it
// leaves the beat unplayed and the rep-loan path unmeasured. Gift when the
// pantry can spare it, visit when a rep can walk, cold otherwise — a played
// choice, never silence. (travel longsim r4 2026-10-12: the gesture was the
// one regional beat the sims never played.)
function accordRoad(Game, ctx) {
  try {
    const pa = Game.state.pendingAccord;
    if (!pa || !Game.answerAccord) return;
    let pan = 0;
    try { pan = Game.pantryKcalLive ? Game.pantryKcalLive() : 0; } catch (e) {}
    let how = 'cold';
    if (pan > 8000) how = 'gift';
    else {
      let rep = null;
      try { rep = Game._availableRepresentative ? Game._availableRepresentative() : null; } catch (e) {}
      if (rep) how = 'visit';
    }
    try {
      if (Game.answerAccord(how)) ctx.accordAnswered = (ctx.accordAnswered || 0) + 1;
    } catch (e) {}
  } catch (e) {}
}

// Propose links: as subordinate (legitimate road — valued subordinate) with
// generous tribute. Accept counter-offers. Try peer roads too.
function diplomacyRoad(Game, ctx) {
  try {
    // Answer the first gesture FIRST — the other fire is watching what
    // Haven does first, and the gesture stages at link formation.
    accordRoad(Game, ctx);
    // Answer a pending counter-offer FIRST — the table is set.
    if (Game.state.pendingCounter && Game.answerCounter) {
      try {
        Game.answerCounter('accept');
        ctx.counterAccepted = (ctx.counterAccepted || 0) + 1;
      } catch (e) {}
    }
    // Tend live links: answer young-link renegotiation beats and primary
    // demands. The beats are the designed recovery path (gift +8 / visit +5,
    // and the deferred leverage never lands); ignoring them is how links
    // die. (travel longsim 2026-10-11: the policy predated the grace beat.)
    try {
      const links = Game.hierarchyState ? Game.hierarchyState() : [];
      for (const l of links) {
        if (!l || l.status !== 'active') continue;
        if (l.pendingRenegotiation && Game.answerRenegotiation) {
          let pan = 0;
          try { pan = Game.pantryKcalLive ? Game.pantryKcalLive() : 0; } catch (e) {}
          try {
            Game.answerRenegotiation(l.id, pan > 8000 ? 'gift' : 'visit');
            ctx.beatsAnswered = (ctx.beatsAnswered || 0) + 1;
          } catch (e) {}
        }
        if (l.pendingDemand && Game.answerDemand) {
          try {
            Game.answerDemand(l.id, true);
            ctx.demandsAnswered = (ctx.demandsAnswered || 0) + 1;
          } catch (e) {}
        }
      }
    } catch (e) {}
    // Answer the national beat — never refuse, never walk. Pick the
    // first non-refuse option the shape offers.
    if (Game.state.pendingNational && Game.answerNationalChoice) {
      try {
        const shape = Game.state.pendingNational.shape;
        const pick = shape === 'lead' ? 'feast'
          : shape === 'conquest' ? 'mercy'
          : shape === 'belong' ? 'swear'
          : shape === 'covenant' ? 'pact'
          : shape === 'trade' ? 'sign' : 'feast';
        // count only real answers — a blocked/refused call (exiled scholar,
        // dissolved realm) returns null and is not an answer.
        if (Game.answerNationalChoice(pick)) ctx.nationalAnswered = (ctx.nationalAnswered || 0) + 1;
      } catch (e) {}
    }
    // Answer the Watchers beat (pendingGlobal) — never decline. 'feast' is
    // the played choice (5,000 kcal of theater); champion is a 7-day
    // speaker absence the policy saves for real need. (r5: the beat never
    // staged organically, so no policy had a reason to answer it — the fed
    // instrument changes that.)
    if (Game.state.pendingGlobal && Game.answerGlobalChoice) {
      try {
        if (Game.answerGlobalChoice('feast')) ctx.globalAnswered = (ctx.globalAnswered || 0) + 1;
      } catch (e) {}
    }
    const ovs = Game.state.otherVillages || [];
    let proposals = 0;
    // POINTER-HEEDING (sim-completion r1): when the wave-4 pointer is live
    // ("get me a network"), lower the courtship bar and knock more doors.
    const courtship = !!ctx._pointerCourtship;
    const subBar = courtship ? 25 : 35;
    const peerBar = courtship ? 15 : 20;
    const propCap = courtship ? 3 : 2;
    for (const ov of ovs) {
      if (proposals >= propCap) break; // don't spam; one or two a day (three when the pointer says grow)
      if (!ov || ov.id === 'haven') continue;
      if (!Game.knowsVillage || !Game.knowsVillage(ov)) continue;
      if (Game.linkWith && Game.linkWith(ov.id)) continue;
      if (Game.state.pendingCounter) break; // answer it first (next day)
      if ((ov.opinion || 0) <= -20) continue; // closed door
      const score = (() => { try { return Game.judgeLink(ov.id, { asSubordinate: true, tributeKcalPerWeek: 4000 }).score; } catch (e) { return 0; } })();
      try {
        if (score >= subBar) {
          // Propose as subordinate — the BELONG road. Generous tribute.
          Game.proposeLink(ov.id, { asSubordinate: true, tributeKcalPerWeek: 5000 });
          ctx.proposed = (ctx.proposed || 0) + 1;
          proposals++;
        } else if (score >= peerBar && Game.proposeCovenant) {
          // Peer road fallback: covenant of equals.
          Game.proposeCovenant(ov.id);
          ctx.proposedPeer = (ctx.proposedPeer || 0) + 1;
          proposals++;
        }
      } catch (e) {}
    }
    // Pay tribute on subordinate links: +3 trust/week, no arrears. The
    // BELONG road needs trust >= 50, no arrears, 14+ days (r4 tuning).
    try {
      const links = Game.hierarchyState ? Game.hierarchyState() : [];
      for (const l of links) {
        if (!l || l.status !== 'active' || l.subordinate !== 'haven') continue;
        if (Game.payTribute) {
          try { Game.payTribute(l.id); ctx.tributePaid = (ctx.tributePaid || 0) + 1; } catch (e) {}
        }
      }
    } catch (e) {}
  } catch (e) {}
}

// POINTER-GATED COURTSHIP (sim-completion r1 2026-10-12): when
// POINTER_GATED=1, the policy does NOT court villages unconditionally —
// diplomacyRoad and courtshipClimb are skipped until the wave-4 pointer
// has been heard. This is the honest test of the scale discoverability
// beats: can the pointer ALONE bootstrap the climb? (SCALE-DISCOVERY.md
// verification plan: "a curiosity-following policy... should climb to
// regional on the signals alone. If it can't, the signals failed.")
const POINTER_GATED = String(process.env.POINTER_GATED || '') === '1';

// ---------- ROAD 3c: POINTER-HEEDING — act on the scale discoverability beats ----------
// (sim-completion r1 2026-10-12, Steve: "do more testing sims that try to
// finish the game.") The game now TELLS a capped player to grow (beats 4+5,
// commit 5e06dcc9: _scalePtrW4 when wave-3 bar banked but village-scale,
// _scalePtrW5 when wave-4 bar banked but regional). A completion-attempt sim
// must HEED them — not just court unconditionally, but respond to the
// pointer: lower courtship standards when told to get a network, and climb
// for primacy when told finales need a nation. Scripts-only; the game is
// untouched. ctx.pointerHeard = {w4: day, w5: day} for the report.
function pointerRoad(Game, ctx) {
  try {
    const st = Game.state || {};
    const day = ((st.scholar || {}).day) || 1;
    // Detect pointer firings (once-only flags on state).
    if (st._scalePtrW4 && !ctx.pointerHeardW4) {
      ctx.pointerHeardW4 = day;
      ctx.pointerHeard = ctx.pointerHeard || {};
      ctx.pointerHeard.w4 = day;
    }
    if (st._scalePtrW5 && !ctx.pointerHeardW5) {
      ctx.pointerHeardW5 = day;
      ctx.pointerHeard = ctx.pointerHeard || {};
      ctx.pointerHeard.w5 = day;
    }
    const rank = (typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village');
    const atLeast = (need) => {
      try { return Game.scaleAtLeast ? Game.scaleAtLeast(rank, need) : rank === need; }
      catch (e) { return false; }
    };
    // W4 pointer live (heard, still village-scale): GET A NETWORK. Lower the
    // courtship bar and court harder — knock on doors we'd have waited on.
    // diplomacyRoad reads ctx._pointerCourtship for lowered thresholds.
    if (ctx.pointerHeardW4 && !atLeast('regional')) {
      ctx._pointerCourtship = true;
      ctx.pointerCourtDays = (ctx.pointerCourtDays || 0) + 1;
      // Also climb opinion directly: study every known village's codex, not
      // just the low-opinion ones (courtshipClimb caps at opinion<25).
      try {
        const ovs = Game.state.otherVillages || [];
        for (const ov of ovs) {
          if (!ov || ov.id === 'haven') continue;
          if (!Game.knowsVillage || !Game.knowsVillage(ov)) continue;
          if (Game.linkWith && Game.linkWith(ov.id)) continue;
          try { if (Game.studyVillageCodex) { Game.studyVillageCodex(ov.id); ctx.pointerClimb = (ctx.pointerClimb || 0) + 1; } } catch (e) {}
        }
      } catch (e) {}
    } else {
      ctx._pointerCourtship = false;
    }
    // W5 pointer live (heard, regional but not national): FINALES NEED A
    // NATION. Tend every link, and bid for primacy where the LEAD road is
    // open (standing >= 90% of theirs, trust >= 60 — the played climb).
    if (ctx.pointerHeardW5 && atLeast('regional') && !atLeast('national')) {
      ctx.pointerNationDays = (ctx.pointerNationDays || 0) + 1;
      try {
        const links = Game.hierarchyState ? Game.hierarchyState() : [];
        for (const l of links) {
          if (!l || l.status !== 'active') continue;
          // Bid for primacy on subordinate links we're strong in.
          if (l.subordinate === 'haven' && Game.bidForPrimacy) {
            const trust = l.trust || 0;
            let standing = 0;
            try { standing = Game.linkStanding ? Game.linkStanding(l.id) : 0; } catch (e) {}
            if (trust >= 60 && standing >= 90) {
              try { if (Game.bidForPrimacy(l.id)) ctx.primacyBids = (ctx.primacyBids || 0) + 1; } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

// ---------- ROAD 4: CRISES — weather them, don't dodge ----------
// Crises fire reactively; the policy's job is to SURVIVE them well.
// The competent base already handles food/water/shelter; here we just
// track which crises have fired (for the report) and ensure we don't
// flee the village during a breach (the fight handler engages).
function crisisRoad(Game, ctx) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    const crises = Object.keys(pg.crises || {});
    ctx.crisesSeen = crises.length;
  } catch (e) {}
}

// ---------- ROAD 5: SENTIMENT + FEAST SURGE ----------

function sentimentRoad(Game, ctx) {
  try {
    if (!(Game.sentimentTaught && Game.sentimentTaught())) return;
    const idxs = (Game.channelReadyKeepsakes && Game.channelReadyKeepsakes()) || [];
    let n = 0;
    for (const idx of idxs) {
      try { Game.channelSentiment(idx); n++; } catch (e) {}
      if (n >= 6) break;
    }
    if (n) ctx.channels = (ctx.channels || 0) + n;
  } catch (e) {}
}

// Host a feast weekly-ish (pantry permitting), then use feastburn in fights.
// feastSurgeUsed is set when the surge actually burns in combat.
function feastRoad(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const day = s.day || 1;
    const pg = s.prog || {};
    if (pg.feastSurgeUsed) return; // deed done
    if ((day - (ctx._lastFeastDay || 0)) < 7) return;
    if (Game.playerAtHaven && !Game.playerAtHaven()) return;
    // EAT FIRST, FEAST SECOND (journey-endgame r3 2026-10-11): a feast
    // spends the COMMONS' food. Hosting from the pantry while a net drain
    // is freeloading with extra steps — the village notices who throws
    // parties with their food. Contribute first.
    try {
      const vv = Game.state.village || {};
      const me = Game.villagerId;
      const drain = ((vv.takes || {})[me] || 0) - ((vv.gives || {})[me] || 0);
      if (drain > 3000) return;
    } catch (e) {}
    const v = Game.state.village || {};
    const have = (() => {
      try { return Game.pantryKcalLive ? Game.pantryKcalLive(v) : 0; } catch (e) { return 0; }
    })();
    const present = ((v.roster || []).filter(id => id !== Game.villagerId)).length;
    const cost = Math.max(1500, 400 * (present + 1));
    if (have < cost * 1.5) return; // keep a buffer — don't feast into famine
    try {
      const r = Game.hostFeast();
      // hostFeast returns {ok, why:'The feast is held.', ...} — not a string.
      // (The old string check never matched, so _lastFeastDay never set and
      // the policy feasted DAILY, draining the pantry. Journey-endgame r3.)
      if (r && r.ok) {
        ctx._lastFeastDay = day;
        ctx.feasts = (ctx.feasts || 0) + 1;
        // THE FEAST WAS THE WEAPON: if the buff granted, fight while feasted.
        // The window decays at dawn — a feast that warms no blades marks
        // nothing. Seek a fight NOW, before sleep.
        try {
          if (r.buffGranted && Game.feastedActive && Game.feastedActive()) {
            ctx._feastFightDay = day;
          }
        } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}
}

// ---------- FEAST-FIGHT COORDINATION ----------
// After a feast grants the buff, seek a fight WHILE FEASTED. The window
// decays at dawn — the policy must warm the blades the same evening.
// (Journey-endgame r3 2026-10-11: 5 granted buffs, 0 used — the policy
// feasted then slept, and the buff expired untouched.)
// (Longsim winpath r3 2026-10-12): patrol on ANY day the buff is live and
// unused — not just the feast day. If the window ever lengthens past one
// dawn (data lever), the next morning's hunt counts too. A real player who
// feasts at night hunts at first light.
function feastFight(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const day = s.day || 1;
    if (!Game.feastedActive || !Game.feastedActive()) { ctx._feastFightDay = 0; return; }
    // already used it in combat? nothing to do (noteFeastedCombatUse spent it)
    try {
      const b = (s.feastBuff) || null;
      if (b && b.used) { ctx._feastFightDay = 0; return; }
    } catch (e) {}
    if (ctx._feastFightDay === day && ctx._feastFightSweeps >= 3) return; // tried today
    if (Game.over || Game.tbfight) return;
    // quick patrol: nearest tiles, seek an encounter
    const hx = Game.map.px, hy = Game.map.py;
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven') continue;
      let blocked = false;
      try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d });
    }
    cands.sort((a, b) => b.d - a.d); // far tiles, like huntPatrol — monsters live out there
    // PERSIST: keep patrolling while feasted and no fight yet. The buff is
    // the point — a single 4-tile sweep is a coin flip. (Journey-endgame r3.)
    let sweeps = 0;
    while (!Game.over && !Game.tbfight && Game.feastedActive && Game.feastedActive() && sweeps < 3) {
      sweeps++;
      for (const c of cands.slice(0, 4)) {
        if (Game.over || Game.tbfight) break;
        if (!Game.feastedActive || !Game.feastedActive()) break;
        try { Game.travelTo(c.x, c.y); } catch (e) { break; }
        if (Game.over || Game.tbfight) break;
        if (Game.map.px !== c.x || Game.map.py !== c.y) continue;
        // look around: perception may surface the monster; forage the patch too
        try { Game.doAction('forage', {}); } catch (e) {}
        if (Game.over || Game.tbfight) break;
      }
    }
    if (!Game.tbfight) { try { Game.travelTo(hx, hy); } catch (e) {} }
    if (ctx._feastFightDay === day) ctx._feastFightSweeps = (ctx._feastFightSweeps || 0) + sweeps;
    else { ctx._feastFightDay = day; ctx._feastFightSweeps = sweeps; }
  } catch (e) {}
}
// LONGSIM WINPATH R4 (2026-10-12): the cookfire's smoke draws scavengers —
// a feast that grants the surge may leave a beast circling the haven. The
// policy is deed-seeking: face it WHILE FEASTED (the deed is the point).
// Never drive it off — a real player might, but the policy wants the deed.
function feastDrawRoad(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    if (Game.over || Game.tbfight) return;
    if (!(Game.feastDrawPending && Game.feastDrawPending())) return;
    if (!(Game.feastedActive && Game.feastedActive())) return; // the deed needs the buff live
    const b = s.feastBuff || null;
    if (b && b.used) return; // already marked — nothing to gain
    if (Game.faceFeastDraw) Game.faceFeastDraw();
    ctx.facedDraw = (ctx.facedDraw || 0) + 1;
  } catch (e) {}
}
// Play-weighted: system quests, trials, teaching, naming, books.

// ---------- ROAD 6: INTEGRATION (stage ≥ 3 needs integ ≥ 80) ----------
// Play-weighted: system quests, trials, teaching, naming, books.

function integrationRoad(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    if ((s.integration || 0) >= 80) return;
    // System quests: answer/complete the active one; ask for a new one.
    try {
      const q = s.activeQuest;
      if (q && q.type === 'system_teach' && Game.checkQuest) {
        Game.checkQuest('teach');
        ctx.sq = (ctx.sq || 0) + 1;
      }
    } catch (e) {}
    try {
      if (Game.offerSystemQuest && !s.activeQuest) {
        Game.offerSystemQuest('event');
        ctx.sqOffered = (ctx.sqOffered || 0) + 1;
      }
    } catch (e) {}
    // Trials: complete when offered.
    try {
      const pg = s.prog || {};
      if (pg.trial && Game.completeTrial) {
        Game.completeTrial();
        ctx.trials = (ctx.trials || 0) + 1;
      }
    } catch (e) {}
    // Teach a villager something (taught = +2 integration).
    try {
      const roster = rosterOf(Game).slice(0, 2);
      for (const vid of roster) {
        if (Game.teachVillager) { Game.teachVillager(vid); ctx.taught = (ctx.taught || 0) + 1; break; }
      }
    } catch (e) {}
    // Name beasts: monster named = +5 integration (also codex breadth).
    try {
      const roster = rosterOf(Game);
      if (roster.length && Game.askAbout) {
        const r = Game.askAbout(roster[0], 'namebeast');
        if (r && r.ok && r.naming && r.naming.mid && Game.backMonsterName) {
          try { Game.backMonsterName(r.naming.mid, r.naming.mid); } catch (e2) {}
          ctx.named = (ctx.named || 0) + 1;
        }
      }
    } catch (e) {}
  } catch (e) {}
}

// ---------- ROAD 0: CONTRIBUTE — the commons come first ----------
// A deed-seeker who drains the pantry gets EXILED (freeload pipeline:
// sustained net drain > max(1500, 3x expected) over 12 days), and the feast
// road refuses a drained host (drain > 3000 gate). Fighting burns ~1.2k
// kcal/day, and the base policy's every-3-days forage cadence can't cover a
// fighter's appetite (measured longsim winpath r3 2026-10-12: 4/8 seeds
// exiled or drain-blocked, armed 15 -> granted 1 -> used 0). So after the
// base food run, top up: forage and donate until the village ledger is
// non-negative. A real table-seeker feeds their village — the table prices
// the moral ledger, not the kill count.
function contributeRoad(Game, ctx) {
  try {
    const v = Game.state.village || {};
    const me = Game.villagerId;
    // DONATE THE DAY'S KILLS FIRST: competent.daily loots corpses AFTER its
    // donateHaul, so meat sits in the pack until the player eats it. A hunter
    // feeds the village — the table prices the moral ledger, not the pack.
    try { donateHaul(Game, ctx); } catch (e) {}
    const drainOf = () => (((v.takes || {})[me] || 0) - ((v.gives || {})[me] || 0));
    // Not aggressive: the exile needs SUSTAINED drain, and a good stretch
    // (effort>=0.7) resets its counter. Trigger at 2000 — below the 3000
    // feast/hunt gate, above the 1500 exile-draining line. Forage trips are
    // dangerous; don't die feeding the village. (Longsim winpath r3: a 500
    // threshold sent the policy into the wild daily and it died earlier.)
    if (drainOf() <= 2000) return;
    if (Game.playerAtHaven && !Game.playerAtHaven()) return;
    if (s_exiled(Game)) return;
    // Only when healthy — a hurt player foraging is a dead player.
    try {
      const s = Game.state.scholar || {};
      if ((s.health || 100) < 60) return;
    } catch (e) {}
    let guard = 0;
    while (guard++ < 2 && drainOf() > 2000 && !Game.over) {
      const got = forageTripSeedFirst(Game, ctx);
      sortHaul(Game, ctx);
      donateHaul(Game, ctx);
      ctx._contribTrips = (ctx._contribTrips || 0) + 1;
      if (!got) break; // the land is bare — nothing more honest to do today
    }
  } catch (e) {}
}

function s_exiled(Game) {
  try { return !!(((Game.state || {}).scholar || {}).exiled); } catch (e) { return false; }
}

// ---------- TABLE ----------

function tableRoad(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const tc = s.tableChoices;
    if (tc && tc.options && tc.options.length && Game.chooseTableOption) {
      Game.chooseTableOption(tc.options[0].id);
      ctx.answeredTable = true;
    }
  } catch (e) {}
}

const winseek = {
  id: 'winseek',
  desc: 'win-seeking: hunts monsters, courts villages, plays contests, drives integration/feast/sentiment toward the table',
  setup(Game, ctx) { if (competent.setup) competent.setup(Game, ctx); },
  upkeep(Game, ctx) {
    if (competent.upkeep) competent.upkeep(Game, ctx);
    huntPatrol(Game, ctx); // road 1: seek encounters (upkeep, so the harness
                           // drives any fights via driveFights/driveContests).
                           // While FEASTED, hunts every day — the buff is the point.
    contestRoad(Game, ctx);
  },
  daily(Game, ctx) {
    if (competent.daily) competent.daily(Game, ctx);
    contributeRoad(Game, ctx);  // road 0: feed the village first — no exile, no drain-blocked feasts
    // POINTER-GATED (sim-completion r1): when POINTER_GATED=1, courtship is
    // earned, not default — the policy only knocks after the System tells it
    // to grow. pointerRoad detects the hearing; the gates below read it.
    const mayCourt = !POINTER_GATED || !!ctx.pointerHeardW4;
    if (mayCourt) courtshipClimb(Game, ctx);   // road 3a: the climb
    if (mayCourt) diplomacyRoad(Game, ctx);    // road 3b: propose/answer
    pointerRoad(Game, ctx);      // road 3c: heed the scale pointers (get a network / finales need a nation)
    crisisRoad(Game, ctx);       // road 4: weather
    sentimentRoad(Game, ctx);    // road 5a: channel keepsakes
    feastRoad(Game, ctx);        // road 5b: feast weekly (evening)
    feastDrawRoad(Game, ctx);    // road 5c: face the feast's scavenger while feasted
    feastFight(Game, ctx);       // road 5d: fight while feasted (buff decays at dawn)
    integrationRoad(Game, ctx);  // road 6: integ → 80
    tableRoad(Game, ctx);        // answer the table
    // road counters for the report
    try {
      const pg = Game.progState ? Game.progState() : {};
      ctx._sq = pg.systemQuests || 0;
      ctx._integ = (Game.state.scholar || {}).integration || 0;
    } catch (e) {}
  },
  fight(Game, ctx) {
    try { if (winseekFight(Game, ctx)) return true; } catch (e) {}
    return false;
  },
  contest(Game, ctx) {
    // Always participate (choice 0). Never refuse.
    return false; // let the harness default pick choice 0 = Participate
  },
};

// ---------- FED ARM (travel longsim r5) ----------
// fedseek = winseek + the fedFloorRoad sim instrument (see above). Same
// policy, same choices, same beats answered — the ONLY difference is the
// pantry never drops below 3 days of village food, so starvation deaths
// can't bind. Before/after comparisons (fed vs unfed on identical seeds)
// therefore measure exactly the food wall's contribution to reachability.
// The stockPantry food is marked in the item name; ctx.fedKcal counts it.
const fedseek = Object.assign({}, winseek, {
  id: 'fedseek',
  desc: 'win-seeking + fed survival floor (SIM INSTRUMENT r5): starvation removed, everything else identical',
  daily(Game, ctx) {
    fedFloorRoad(Game, ctx);
    if (winseek.daily) winseek.daily(Game, ctx);
  },
});

module.exports = { winseek, accordRoad, fedseek };
