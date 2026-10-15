// scripts/feastscav-instrument-20261015.js — sim-feastscav instrument
// (flesh-out loop B, 2026-10-15, food-economy axis, sim-findings #227).
//
// HARNESS-SIDE ONLY: zero game-code changes. Wraps, on the loaded Game
// object, the feast verb's scavenger-draw event chain and combat
// deaths/exposure after it, then attributes post-feast combat deaths to
// proximity windows. Call-through wrappers: zero trajectory delta
// (pinned by the det-gate: 16/16 or 32/32 bit-identical with the
// instrument installed).
//
// Events logged (day = state.scholar.day at call time):
//   feast  { day, armed, quality, refreshed, granted }
//   draw   { day, drawn, why, monsterId, veteran, wave }
//   faced  { day, monsterId, ok }
//   driven { day, ok }
//   combat { day, monsterId?, drawPending, participants }
//   death  { day, cause, kind, who, player }
//
// Windows (built after the run, or incrementally):
//   For every armed feast grant day F (armed = devotion-gated fresh
//   grant — only armed grants can draw, canon src/data/feast-surge.json):
//     draw fired (drawn=true):
//       fought   -> 'draw-fought'  [drawDay, drawDay+2] (the draw's
//                   monster FOUGHT — via faceFeastDraw or the night's
//                   sleep-wake on the pending encounter; the fight is the
//                   exposure either way)
//       driven   -> 'draw-driven'  [drawDay, drawDay+2] (rigged/gated roads)
//       unfought -> 'draw-unfought'[drawDay, drawDay+2]
//     no draw -> 'feast-nodraw' [F, F+2]
//   Unarmed grants (refused before the draw line): 'feast-unarmed' [F, F+2].
//   No window: 'baseline'.
// Priority on overlap: draw-fought > draw-driven > draw-unfought >
// feast-nodraw > feast-unarmed (earliest start wins within a tier).
// The 2-day window matches the buff's live window (durationNights=2:
// a dusk feast buys the night plus the full next day).
//
// Combat-family (causes seen in sweeps): /combat|monster/i — 'combat',
// 'patrol combat', 'villager combat', 'monster'.
// HARM = combat-family deaths of PEOPLE (kind 'villager'/'person').
// Monster deaths (kind 'monster'/'animal') are the village WINNING fights —
// tracked separately as the exposure companion (the draw fight really
// happens), never counted as harm.
//
// API:
//   const I = require('./feastscav-instrument-20261015');
//   const inst = I.installFeastScav(Game);   // installs wraps, returns inst
//   ... runDays ...
//   const rep = inst.report();              // windows + attribution + rates
//   inst.uninstall();                        // restores originals
'use strict';

const COMBAT_FAMILY = /combat|monster/i;
const PERSON_KIND = /^(villager|person)$/i;

function dayOf(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}

function waveOf(Game, mid) {
  try {
    const md = ((Game.data || {}).monsters || []).find(m => m.id === mid);
    return (md && md.wave) || null;
  } catch (e) { return null; }
}

function partyOf(Game) {
  // Participants exposed: who would fight if this combat starts.
  // Defensive — log what the engine exposes, never invent.
  try {
    const out = [];
    const tb = Game.tbfight;
    if (tb && Array.isArray(tb.fighters)) {
      for (const f of tb.fighters) out.push(String((f && (f.villagerId || f.id || f.name)) || '?'));
    }
    if (!out.length) {
      const v = Game.state.village || {};
      const roster = v.roster || [];
      const sid = Game.villagerId;
      out.push('scholar:' + String(sid).slice(0, 8));
      out.push('roster:' + roster.length);
    }
    return out;
  } catch (e) { return ['?']; }
}

function installFeastScav(Game) {
  const inst = {
    feasts: [], draws: [], faced: [], driven: [], combats: [], deaths: [],
    _orig: {},
  };
  const wrap = (name, fn) => {
    const orig = Game[name];
    inst._orig[name] = orig;
    if (typeof orig !== 'function') return; // honest: nothing to wrap
    Game[name] = function (...a) {
      const r = orig.apply(this, a);
      try { fn.call(this, r, a); } catch (e) {}
      return r;
    };
  };

  wrap('grantFeastBuff', (r) => {
    try {
      inst.feasts.push({
        day: dayOf(Game),
        granted: !!(r && r.granted),
        armed: !!(r && r.granted && !r.refreshed),
        refreshed: !!(r && r.refreshed),
        quality: (r && r.quality != null) ? r.quality : null,
        why: (r && r.why) ? String(r.why).slice(0, 60) : null,
      });
    } catch (e) {}
  });

  wrap('drawFeastScavenger', (r) => {
    try {
      inst.draws.push({
        day: dayOf(Game),
        drawn: !!(r && r.drawn),
        why: (r && r.why) ? String(r.why) : null,
        monsterId: (r && r.monsterId) || null,
        veteran: !!(r && r.veteran),
        wave: (r && r.monsterId) ? waveOf(Game, r.monsterId) : null,
      });
    } catch (e) {}
  });

  wrap('faceFeastDraw', (r) => {
    try {
      inst.faced.push({ day: dayOf(Game), ok: !!(r && r.ok), monsterId: (r && r.monsterId) || null });
    } catch (e) {}
  });

  wrap('driveOffFeastDraw', (r) => {
    try {
      inst.driven.push({ day: dayOf(Game), ok: !!(r && r.ok), drivenOff: !!(r && r.drivenOff) });
    } catch (e) {}
  });

  // startCombat: snapshot the pending state BEFORE the call —
  // startCombat clears pendingEncounter internally (game.js) before any
  // post-call logging could read it. The snapshot is PURE READS ONLY:
  // never call Game.feastDrawPending() here — it self-cleans (deletes
  // s.feastDraw) and can trigger clearFeastBuff (which clears a still-
  // pending draw when the buff expired), changing the fight startCombat
  // is about to resolve. A method call in the snapshot is a behavior
  // change; raw property reads are not.
  {
    const orig = Game.startCombat;
    inst._orig.startCombat = orig;
    if (typeof orig === 'function') {
      Game.startCombat = function (...a) {
        let preDrawMid = null, prePend = false, preMid = null;
        try {
          const s = Game.state.scholar || {};
          const d = s.feastDraw;
          preDrawMid = (d && d.monsterId) ? String(d.monsterId) : null;
          prePend = !!Game.pendingEncounter;
          preMid = Game.pendingMonsterId ? String(Game.pendingMonsterId) : null;
        } catch (e) {}
        const r = orig.apply(this, a);
        try {
          const eff = (a && a[0] != null) ? String(a[0]) : null;
          inst.combats.push({
            day: dayOf(Game),
            monsterId: eff,
            // EFFECTIVE MONSTER: startCombat() with no id resolves to the
            // pending encounter's monster (game.js: the wanderer-contact
            // path) — the feast draw is fought this way via the night's
            // sleep-wake.
            effMonsterId: eff || preMid,
            drawPending: prePend && preDrawMid != null && preMid === preDrawMid,
            drawMonsterId: preDrawMid,
            pendingEncounter: prePend,
            participants: partyOf(Game),
          });
        } catch (e) {}
        return r;
      };
    }
  }

  wrap('registerDeath', (r, a) => {
    try {
      const o = (a && a[0]) || {};
      inst.deaths.push({
        day: dayOf(Game),
        cause: String(o.cause || '?'),
        kind: String(o.kind || '?'),
        who: String(o.villagerId || o.monsterId || o.name || '?').slice(0, 40),
        player: !!o.player,
      });
    } catch (e) {}
  });

  inst.uninstall = () => {
    for (const name of Object.keys(inst._orig)) {
      try { Game[name] = inst._orig[name]; } catch (e) {}
    }
  };

  // buildWindows: ordered channel windows from the event logs.
  // Draw-resolved channels (the draw wrapper FIRED on the feast's day):
  //   draw-fought   — the draw's monster was actually FOUGHT within the
  //                   window (via faceFeastDraw OR the night's sleep-wake
  //                   on the pending encounter — startCombat resolves the
  //                   pending id; the fight is the exposure either way).
  //   draw-driven   — the watch drove it off (no fight).
  //   draw-unfought — draw fired, no linked combat (died with the buff,
  //                   resolved elsewhere).
  //   feast-nodraw  — draw wrapper fired, drawn=false (smoke carried
  //                   clear, already pending, no cast).
  // 'feast-nodraw-unverified': armed feast with NO draw event at all — a
  // log gap; combat deaths here count as UNATTRIBUTED (coverage gate).
  inst.buildWindows = () => {
    const wins = [];
    const drivenDays = new Set(inst.driven.filter(d => d.ok).map(d => d.day));
    const drawsByDay = {};
    for (const d of inst.draws) (drawsByDay[d.day] = drawsByDay[d.day] || []).push(d);
    // drawFight: the combat that consumed a draw — same monster, within
    // the window, started while an encounter was pending (or the draw was
    // the live pending marker). One combat links to at most one draw
    // (first-draw-wins; cadence 7d makes collisions rare).
    // drawFight: the combat that consumed a draw. Candidate: same
    // monster, within the window, s.feastDraw still present at combat
    // start (raw snapshot — no method calls). Disambiguation:
    //   - face/sleep path: the pending encounter was LIVE at combat start
    //     (prePend && preMid === mid) — faceFeastDraw / sleep-wake.
    //   - harness path: the harness day-loop clears pendingEncounter +
    //     pendingMonsterId immediately before startCombat(mid)
    //     (sim-harness.js) — prePend=false, but the explicit id is the
    //     draw's monster and the marker is still present.
    // A wild same-species fight BEFORE the draw resolves has prePend=true
    // with preMid===mid too — indistinguishable from the face path in the
    // snapshot, but it comes first; the draw fight follows. Prefer the
    // live-pending candidate; else the first cleared-pending candidate
    // (the harness resolves at tick end, after driveFights).
    // One combat links to at most one draw (first-draw-wins; 7d cadence
    // keeps same-species draws out of each other's windows).
    // drawFight: the combat that consumed a draw. Candidate: same
    // monster, within the window, s.feastDraw still present at combat
    // start (raw snapshot — no method calls). The draw fight is the LAST
    // candidate in tick order: the harness day-loop resolves the pending
    // encounter at tick end (sim-harness.js), after driveFights — a wild
    // same-species fight earlier in the tick is a candidate too, but the
    // draw's own fight comes after it. (The face/sleep path, where the
    // pending is still live at combat start, is likewise last: after
    // faceFeastDraw the marker is deleted, so later wild fights aren't
    // candidates.)
    // One combat links to at most one draw (first-draw-wins; 7d cadence
    // keeps same-species draws out of each other's windows).
    const linked = new Set();
    const drawFight = (draw) => {
      let pick = null;
      for (let i = 0; i < inst.combats.length; i++) {
        if (linked.has(i)) continue;
        const c = inst.combats[i];
        if (c.day < draw.day || c.day > draw.day + 2) continue;
        if (c.drawMonsterId !== draw.monsterId) continue;
        if (c.effMonsterId !== draw.monsterId) continue;
        pick = i; // keep the last
      }
      if (pick == null) return null;
      linked.add(pick);
      return inst.combats[pick];
    };
    for (const f of inst.feasts) {
      if (!f.granted) continue;
      const dayDraws = drawsByDay[f.day] || [];
      const draw = dayDraws.find(d => d.drawn);
      if (f.armed && draw) {
        const fight = drawFight(draw);
        const ch = fight ? 'draw-fought'
          : drivenDays.has(draw.day) ? 'draw-driven' : 'draw-unfought';
        wins.push({ ch, start: draw.day, end: draw.day + 2, monsterId: draw.monsterId, veteran: draw.veteran, wave: draw.wave,
          fightDay: fight ? fight.day : null, viaFace: inst.faced.some(x => x.ok && x.day === draw.day) });
      } else if (f.armed && dayDraws.length) {
        wins.push({ ch: 'feast-nodraw', start: f.day, end: f.day + 2, why: (dayDraws[0] || {}).why || null });
      } else if (f.armed) {
        wins.push({ ch: 'feast-nodraw-unverified', start: f.day, end: f.day + 2 });
      } else {
        wins.push({ ch: 'feast-unarmed', start: f.day, end: f.day + 2 });
      }
    }
    return wins;
  };

  const PRIORITY = { 'draw-fought': 0, 'draw-driven': 1, 'draw-unfought': 2, 'feast-nodraw': 3, 'feast-nodraw-unverified': 3, 'feast-unarmed': 4 };
  // Draw-resolved channels (count as ATTRIBUTED for the coverage gate).
  const RESOLVED = { 'draw-fought': 1, 'draw-driven': 1, 'draw-unfought': 1, 'feast-nodraw': 1 };
  inst.attribute = (day, wins) => {
    const ws = wins || inst.buildWindows();
    let best = null;
    for (const w of ws) {
      if (day >= w.start && day <= w.end) {
        if (!best || PRIORITY[w.ch] < PRIORITY[best.ch] ||
            (PRIORITY[w.ch] === PRIORITY[best.ch] && w.start < best.start)) best = w;
      }
    }
    return best ? best.ch : 'baseline';
  };

  inst.report = () => {
    const wins = inst.buildWindows();
    const chDays = {}; const chCombatDeaths = {}; const chCombatStarts = {}; const chAnyDeaths = {};
    for (const w of wins) chDays[w.ch] = (chDays[w.ch] || 0) + (w.end - w.start + 1);
    let totalDays = 0;
    try { totalDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
    let totalCombat = 0, postFeastCombat = 0, attributed = 0, baselineCombat = 0;
    let monsterKills = 0; const chMonsterKills = {};
    const deathRows = [];
    for (const d of inst.deaths) {
      const ch = inst.attribute(d.day, wins);
      const isCombat = COMBAT_FAMILY.test(d.cause);
      const isPerson = PERSON_KIND.test(d.kind);
      const isHarm = isCombat && isPerson;
      const row = Object.assign({ ch, combatFamily: isCombat, person: isPerson }, d);
      deathRows.push(row);
      if (isCombat && !isPerson) {
        monsterKills++;
        chMonsterKills[ch] = (chMonsterKills[ch] || 0) + 1; // exposure companion, not harm
      }
      if (isHarm) {
        totalCombat++;
        chCombatDeaths[ch] = (chCombatDeaths[ch] || 0) + 1;
        if (ch === 'baseline' || ch === 'feast-unarmed') {
          baselineCombat++;
        } else {
          postFeastCombat++;
          if (RESOLVED[ch]) attributed++;
        }
      }
      if (ch !== 'baseline') chAnyDeaths[ch] = (chAnyDeaths[ch] || 0) + 1;
    }
    // COVERAGE GATE (pre-registered GO threshold): of combat-family deaths
    // inside armed-feast windows, the fraction in a DRAW-RESOLVED channel
    // (draw-faced/draw-driven/draw-unfaced/feast-nodraw). 'feast-nodraw-
    // unverified' = the instrument missed the draw event on an armed feast
    // — a log gap; it counts as UNATTRIBUTED. >= 0.80 required.
    const coverage = postFeastCombat > 0 ? attributed / postFeastCombat : 1;
    const rates = {};
    for (const ch of Object.keys(chCombatDeaths)) {
      const days = chDays[ch] || 1;
      rates[ch] = { deaths: chCombatDeaths[ch], days, perDay: chCombatDeaths[ch] / days };
    }
    const baselineDays = Math.max(0, totalDays - Object.keys(chDays).reduce((t, k) => t + chDays[k], 0));
    rates.baseline = { deaths: baselineCombat, days: baselineDays, perDay: baselineDays > 0 ? baselineCombat / baselineDays : 0 };
    for (const c of inst.combats) {
      const ch = inst.attribute(c.day, wins);
      chCombatStarts[ch] = (chCombatStarts[ch] || 0) + 1;
    }
    return {
      feasts: inst.feasts.length, armedFeasts: inst.feasts.filter(f => f.armed).length,
      draws: inst.draws.filter(d => d.drawn).length, drawNoFire: inst.draws.filter(d => !d.drawn).length,
      faced: inst.faced.filter(f => f.ok).length, driven: inst.driven.filter(d => d.ok).length,
      combats: inst.combats.length, deaths: inst.deaths.length,
      windows: wins.length, chDays, rates, chCombatStarts, chAnyDeaths,
      chMonsterKills, monsterKills,
      totalCombatDeaths: totalCombat, postFeastCombatDeaths: postFeastCombat,
      attributionCoverage: coverage, deathRows,
    };
  };

  return inst;
}

module.exports = { installFeastScav, COMBAT_FAMILY, PERSON_KIND };
