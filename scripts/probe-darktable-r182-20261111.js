#!/usr/bin/env node
// probe-darktable-r182-20261111.js — journey-endgame r182 (lane B, 2026-11-11).
// Prepared-state dark-table probe: the feared/DARK walk end to end.
// The natural pilot (r135 reproduction) never reaches a dark sitting —
// every pilot sitting so far won light/mercy — so the dark twist, the
// trial by combat, the dark final, the conscript and the seat-taker guard
// have never been played end-to-end in a journey run. This probe plays
// them in prepared state, on the table-sense test's lesserSeat pattern
// (no new engine calls; the walk uses only chooseTableOption +
// the harness driveFights, the same driver the pilot uses for fights).
// The trial fight is the REAL Finale, blow-by-blow, via startCombat
// inside tableTrialByCombat — nothing is stubbed, nothing is skipped.
// Prepared-state rig (honest endgame gear, not god-mode): the 'apex'
// bearer carries the Apex Bow (loot tier 4, +95, range 9) with 200
// arrows and the real 100-HP pool; the 'apex-tank' bearer carries the
// same bow with a 5000-HP pool, which tests whether the WIN branch
// works mechanically at all. A fresh bearer (basic gear) is the loss
// control. scholar.day is set to 90 except V5: the table does not
// price a win before ninety dawns (the win-day floor), so a day-1
// walk must end in THE TABLE WAITS, not a recorded win.
// Exit 0 = all variants ran to a recorded end (a binding failure is a
// FINDING in the JSON, not a crash); exit 1 = instrument failure.
// Usage: node scripts/probe-darktable-r182-20261111.js
//   writes evidence/2026-11-11/perseed-endgame-r182-dark/<variant>.{json,txt}
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, driveFights } = require('./sim-harness');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-endgame-r182-dark');
fs.mkdirSync(OUTDIR, { recursive: true });

// Dark ledger: killed 12 vs protected 2, betrayed 2, hoarded 8 vs shared 1.
// tableBranch math (table.js): dark = killed>protected +2, betrayed +2,
// hoarded>shared +1, feared killed>protected*2 +2 = 7; light = 0.
const DARK_LEDGER = { might: 8, brokerage: 2, showmanship: 2, embrace: 0, defiance: 6, exposed: 2, unified: 2, fractured: 1, foodShared: 1, foodHoarded: 8, protected: 2, killed: 12, betrayed: 2 };

function lesserSeat(Game) {
  Game.state.systemArrived = true; Game.state.scholar.integration = 55;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
  Game.progState().ledger = DARK_LEDGER;
  Game.state.village.trust = {};
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 3) % 30; });
  Game.state.village.viewership = 20;
}

function gearUp(Game, kind) {
  // The 'p' fighter spawns with scholar.health (game.js fighter spawn:
  // maxHp = Math.max(100, hp)), so the pool must be set BEFORE the
  // fight starts — setting the fighter's hp mid-fight gets re-synced
  // from the scholar (r147 smoke lesson).
  if (kind === 'fresh') return;
  const s = Game.state.scholar;
  s.equipped = s.equipped || {};
  s.equipped.ranged = { itemId: 'apex_bow', name: 'Apex Bow' };
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'arrow', material: 'arrow', units: 200, name: 'Arrows' });
  if (kind === 'apex-tank') s.health = 5000;
}

function teleEvents(Game, type) {
  const t = (Game.state && Game.state.telemetry) || [];
  const arr = Array.isArray(t) ? t : (t.events || []);
  return arr.filter(e => e && (e.type === type || e.t === type));
}

async function runVariant(name, setup) {
  const lines = [];
  const steps = [];
  const step = (id, ok, detail) => { steps.push({ id, ok: !!ok, detail: detail || '' }); console.log(`  [${name}] ${ok ? 'ok  ' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`); };
  let Game;
  try {
    ({ Game } = await loadGame({ seed: 777 }));
    await setupGame(Game, 'Columbus, Ohio');
  } catch (e) {
    console.error(`[${name}] SETUP FAILED: ${e && e.message}`);
    return { variant: name, setupFailed: String(e && e.message), steps };
  }
  // Capture every say/sysSay line (table-sense test pattern).
  const origSay = Game.say, origSys = Game.sysSay;
  Game.say = function (t) { lines.push(String(t)); try { return origSay.apply(this, arguments); } catch (e) {} };
  Game.sysSay = function (t) { lines.push('SYS:' + String(t)); try { return origSys.apply(this, arguments); } catch (e) {} };
  const T = () => Game.tableState();
  const offered = () => { const tc = Game.state.scholar.tableChoices; return tc ? (tc.options || []).map(o => o.id) : []; };
  const hasLine = (re) => lines.some(l => re.test(l));
  try {
    lesserSeat(Game);
    const rec = setup(Game, { step, T, offered, hasLine, lines });
    const won = teleEvents(Game, 'table_won');
    const entered = teleEvents(Game, 'table_entered');
    const out = {
      variant: name, steps,
      branch: T().branch, meters: T().meters, weakened: T().weakened | 0,
      phase: T().phase, path: T().path,
      bearerBefore: rec && rec.bearerBefore, bearerAfter: Game.villagerId,
      mantlePassed: !!(rec && rec.bearerBefore && rec.bearerBefore !== Game.villagerId),
      gameOver: !!Game.over, gameWon: !!Game.won,
      tableEntered: entered.length, tableWon: won.map(w => ({ ending: w.ending, endingKind: w.endingKind, endingLevel: w.endingLevel, moral: w.moral, track: w.track, titanFinale: w.titanFinale })),
      pgTable: (() => { try { const p = Game.progState().table || {}; return { tableDone: !!Game.progState().tableDone, endingKey: p.endingKey || null, doors: (p.doors || []).length }; } catch (e) { return { err: String(e && e.message) }; } })(),
    };
    fs.writeFileSync(path.join(OUTDIR, `${name}.json`), JSON.stringify(out, null, 1));
    fs.writeFileSync(path.join(OUTDIR, `${name}-transcript.txt`), lines.join('\n') + '\n');
    console.log(`[${name}] done: ${steps.filter(s => s.ok).length}/${steps.length} steps ok, transcript ${lines.length} lines`);
    return out;
  } catch (e) {
    console.error(`[${name}] WALK THREW: ${e && e.stack || e}`);
    fs.writeFileSync(path.join(OUTDIR, `${name}.json`), JSON.stringify({ variant: name, steps, threw: String(e && e.stack || e) }, null, 1));
    fs.writeFileSync(path.join(OUTDIR, `${name}-transcript.txt`), lines.join('\n') + '\n');
    return { variant: name, steps, threw: String(e && e.message) };
  } finally {
    try { Game.say = origSay; Game.sysSay = origSys; } catch (e) {}
  }
}

function driveTrial(Game) {
  // The default driver (no policy fight hook): strike nearest monster,
  // wait out the turn — never flees, never uses abilities. Loop the
  // driver until no live fight remains (tbEnd clears tbfight, so
  // "over" is !live, not tbfight.over — r147 smoke lesson).
  const ctx = { policyId: 'darktable-default', notes: [] };
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < 12) {
    driveFights(Game, {}, ctx);
  }
  const live = !!(Game.tbfight && !Game.tbfight.over);
  return { calls, over: !live, notes: ctx.notes || [] };
}

function driveToFinal(Game, o) {
  // Generic walk driver for the downgrade path: pick the first offered
  // option at each phase until the walk ends (done/paths) or stalls.
  const { step, T, offered } = o;
  let guard = 0;
  while (guard++ < 20) {
    const ph = T().phase;
    if (ph === 'done' || ph === 'paths' || !ph) return { ended: ph, steps: guard };
    const opts = offered();
    if (!opts.length) return { ended: 'no-options:' + ph, steps: guard };
    const pick = opts[0];
    step('downgrade-drive:' + ph + ':' + pick, true, 'phase=' + ph);
    Game.chooseTableOption(pick);
  }
  return { ended: 'guard:' + T().phase, steps: guard };
}

function walkFearedDark(Game, o, opts) {
  opts = opts || {};
  const { step, T, offered, hasLine } = o;
  const bearerBefore = Game.villagerId;
  const beat1 = opts.beat1 || 'mercy';
  if (opts.sitter) {
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const sid = roster[0];
    const sperson = (Game.data.villagers || []).find(v => v.id === sid) || {};
    Game.tableState().seatTaker = { id: sid, name: sperson.name || 'the Sitter', self: false };
    step('V3-sitter-set', !!sid, 'sitter=' + (sperson.name || sid));
  }
  if (opts.day) Game.state.scholar.day = opts.day;
  gearUp(Game, opts.gear || 'fresh');
  Game.tableScene();
  step('audit-said', hasLine(/THE AUDIT/), 'phase=' + T().phase);
  step('seat-lesser', (Game.tableSeat() || {}).seat === 'lesser', 'seat=' + ((Game.tableSeat() || {}).seat));
  if (opts.sitter) step('V3-seat-line', hasLine(/sits at the ring, not the Bearer/), 'sitter named aloud');
  const branch = Game.tableBranch('feared');
  step('D1-branch-dark', branch.branch === 'dark', `branch=${branch.branch} dark=${branch.dark} light=${branch.light}`);
  Game.chooseTableOption('path:feared');
  step('path-started', T().path === 'feared' && T().phase !== 'paths', 'phase=' + T().phase);
  // THE CONSCRIPT GATE (smoke lesson 2): every dark walk at day > 7
  // opens with the pods offer BEFORE the challenge beats — V4 tests it
  // explicitly; the other day-90 walks refuse it as a matter of course.
  if (T().phase === 'conscript' && !opts.conscript) {
    step('conscript-gate-refused', offered().includes('conscript:no'), 'dark walks at day>7 always open with the pods offer; refusing');
    Game.chooseTableOption('conscript:no');
    step('conscript-refusal-resumed', T().phase === 'challenge' && T().beat === 0, 'phase=' + T().phase);
  }
  if (opts.conscript) {
    step('V4-conscript-phase', T().phase === 'conscript', 'phase=' + T().phase);
    step('V4-conscript-offered', offered().includes('conscript:yes') && offered().includes('conscript:no'), offered().join(','));
    Game.chooseTableOption('conscript:no');
    step('V4-refusal-voiced', hasLine(/mourners exhale/i), 'refusal line present');
    step('V4-challenge-resumed', T().phase === 'challenge' && T().beat === 0, 'phase=' + T().phase + ' beat=' + T().beat);
  }
  // Beat 1 — footage. 'kill' pushes horror +2; 'mercy' spends it -2.
  // The curdle guard fires at horror 5, so kill-then-name (2+3) always
  // curdles by design — the walk must spend horror down between pushes.
  // (Labels are modal text, never said aloud — check the effect say.)
  const beat1Say = { kill: /The deer\. The cleanest kill/, mercy: /The time you stayed your hand/, fire: /The fire you ate from/ }[beat1];
  step('beat1-offered', offered().includes('beat:' + beat1), offered().join(','));
  Game.chooseTableOption('beat:' + beat1);
  step('beat1-said', hasLine(beat1Say), 'beat1 effect line present');
  step('beat-advanced-1', T().beat === 1, 'beat=' + T().beat);
  // Beat 2 — calibration: trial, hold, or (V3) withheld trial.
  if (opts.trial) {
    const trialOffered = offered().includes('beat:trial');
    step('trial-offered', trialOffered, offered().join(','));
    Game.chooseTableOption('beat:trial');
    if (opts.sitter) {
      step('V3-trial-withheld', hasLine(/TRIAL WITHHELD/), 'guard line present');
      step('V3-door-shut', !offered().includes('beat:trial'), 'beat re-run without trial: ' + offered().join(','));
      step('V3-still-beat2', T().beat === 1, 'beat=' + T().beat);
      Game.chooseTableOption('beat:hold');
      step('V3-hold-advances', T().beat === 2, 'beat=' + T().beat);
    } else {
      const fightLive = !!(Game.tbfight && !Game.tbfight.over);
      step('D3-trial-fight-live', fightLive, 'tbfight=' + (Game.tbfight ? Game.tbfight.id : 'none'));
      if (fightLive) {
        const fin = Game.tbfight.fighters.find(f => f.kind === 'monster');
        step('trial-finale-present', !!fin, `finale hp=${fin ? fin.hp : null} kind=${fin && fin.kind} id=${fin && fin.monsterId}`);
        const d = driveTrial(Game);
        step('D3-trial-resolved', d.over, `drive calls=${d.calls} over=${d.over} notes=${(d.notes || []).join(';')}`);
        step('D3-resume-fired', hasLine(/TRIAL (WON|LOST)/), 'resume line present');
        const wonTrial = hasLine(/TRIAL WON/);
        step('D3-loss-branch-voiced', wonTrial || hasLine(/mantle passes mid-table/) || hasLine(/you live, diminished/), wonTrial ? 'win branch (no loss line expected)' : 'loss branch voiced');
        if (wonTrial) step('D3-win-terror-max', (T().meters.terror | 0) >= 10, 'terror=' + (T().meters.terror | 0));
      }
      step('trial-beat-advanced', T().beat === 2, 'beat=' + T().beat + ' phase=' + T().phase);
    }
  } else {
    step('trial-skipped-hold', offered().includes('beat:hold'), offered().join(','));
    Game.chooseTableOption('beat:hold');
    step('hold-advances', T().beat === 2, 'beat=' + T().beat);
  }
  // Beat 3 — dark twist: name / refuse.
  step('D1-twist-offered', offered().includes('beat:name') && offered().includes('beat:refuse'), offered().join(','));
  const metersBefore = Object.assign({}, T().meters || {});
  Game.chooseTableOption('beat:name');
  const curdled = T().phase === 'downgrade';
  step('D2-twist-fired', hasLine(/You name it\. The table feeds/), curdled ? 'curdled instead (see curdle step)' : 'Exemplum say line present');
  if (curdled) {
    step('curdle-documented', hasLine(/THE TABLE FALTERS/), 'curdle line present; horror hit 5');
    step('downgrade-offered', offered().includes('downgrade:assimilated'), offered().join(','));
    const drv = driveToFinal(Game, o);
    step('downgrade-walk-ended', drv.ended === 'done' || drv.ended === 'paths', 'ended=' + drv.ended);
  } else {
    step('D2-meters-moved', (T().meters.terror | 0) > (metersBefore.terror | 0) && (T().meters.horror | 0) > (metersBefore.horror | 0), `terror ${metersBefore.terror | 0}->${T().meters.terror | 0}, horror ${metersBefore.horror | 0}->${T().meters.horror | 0}`);
    step('finals-reached', T().phase === 'finals', 'phase=' + T().phase);
    step('final-offered', offered().includes('final:example'), offered().join(','));
    Game.chooseTableOption('final:example');
    step('D4-final-resolved', hasLine(/Deterrence holds for a century/) || hasLine(/Fear pays/), 'dark final outcome present');
  }
  const won = teleEvents(Game, 'table_won');
  if (opts.expectFloor) {
    step('D4-floor-voiced', hasLine(/Ninety days\. We do not price a life half-lived/), 'TABLE WAITS line present');
    step('D4-floor-withholds-win', won.length === 0 && T().phase === 'paths', `table_won=${won.length} phase=${T().phase}`);
  } else {
    step('D4-ending-recorded', won.length > 0, `table_won events=${won.length}`);
  }
  // S1-SITTER-CODA (r156 re-verify of the r138 fix 858d47dc2): the
  // walk-out line names the sitter, not the bearer. The sitter name
  // comes from the live seatTaker record; the bearer name from the
  // pre-walk bearer id. Both are read from state, never hardcoded.
  if (opts.sitter) {
    const stName = (Game.tableState().seatTaker || {}).name || 'the Sitter';
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const bearerRec = (Game.data.villagers || []).find(v => v.id === bearerBefore) || {};
    const bearerName = bearerRec.name || '';
    step('S1-sitter-coda', hasLine(new RegExp(esc(stName) + ' walks out of the light')), 'walk-out names the sitter: ' + stName);
    if (bearerName && bearerName !== stName) step('S1-no-bearer-coda', !hasLine(new RegExp(esc(bearerName) + ' walks out of the light')), 'bearer not named in walk-out: ' + bearerName);
  }
  return { bearerBefore };
}

(async () => {
  const results = [];
  // V1a: dark walk, kill opening, trial, fresh gear — the bearer dies,
  // the mantle passes, name curdles, the walk downgrades.
  results.push(await runVariant('v1a-loss', (Game, o) => walkFearedDark(Game, o, { trial: true, beat1: 'kill', gear: 'fresh', day: 90 })));
  // V1b: dark walk, mercy opening, trial, apex bow + honest 100-HP pool —
  // can an honestly geared endgame bearer win the trial?
  results.push(await runVariant('v1b-honest', (Game, o) => walkFearedDark(Game, o, { trial: true, beat1: 'mercy', gear: 'apex', day: 90 })));
  // V1c: dark walk, mercy opening, trial, apex bow + 5000-HP pool — does
  // the WIN branch work mechanically at all?
  results.push(await runVariant('v1c-tank', (Game, o) => walkFearedDark(Game, o, { trial: true, beat1: 'mercy', gear: 'apex-tank', day: 90 })));
  // V2: dark walk, trial skipped (hold) — the door not taken.
  results.push(await runVariant('v2-notrial', (Game, o) => walkFearedDark(Game, o, { trial: false, beat1: 'mercy', gear: 'fresh', day: 90 })));
  // V3: dark walk, villager sitter — the seat-taker guard withholds the trial.
  results.push(await runVariant('v3-sitter', (Game, o) => walkFearedDark(Game, o, { trial: true, beat1: 'mercy', gear: 'fresh', day: 90, sitter: true })));
  // V4: dark walk, day 90 — the dark conscript is offered and refused.
  results.push(await runVariant('v4-conscript', (Game, o) => walkFearedDark(Game, o, { trial: false, beat1: 'mercy', gear: 'fresh', day: 90, conscript: true })));
  // V5: dark walk, day 1 — the win-day floor withholds the win.
  results.push(await runVariant('v5-dayfloor', (Game, o) => walkFearedDark(Game, o, { trial: false, beat1: 'mercy', gear: 'fresh', expectFloor: true })));
  const fails = results.flatMap(r => (r.steps || []).filter(s => !s.ok).map(s => r.variant + ':' + s.id));
  console.log(`\nDARK PROBE: ${results.length} variants, failed steps: ${fails.length ? fails.join(', ') : 'none'}`);
  // D5 sense is a human read of the transcripts, not a count — recorded
  // in the run note, not asserted here.
  process.exit(0);
})();
