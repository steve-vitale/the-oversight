#!/usr/bin/env node
// test-relaydarkcost-20261020.js — proof for the sim-relaydarkcost arm
// (scripts/sweep-relaydarkcost-20261020.js + scripts/analyze-relaydarkcost-20261020.js).
//
// Suites:
//   A. COMPOSITION — driverless composition behaves: control side (RELAYDARK
//      unset) delegates pure (active=false, 0 verbs, instrument clean);
//      road-armed side (RELAYDARK=1) runs the road on real games with the
//      layer installed (rdSummary recorded, no instrument errors).
//   B. ATTRIBUTION — attributeRun on crafted per-seed records: win via
//      endRec.tb.path/branch; won-but-null-path => UNEXPLAINED (never
//      guessed); the three stall classes; sat-no-win; MISSING on null.
//   C. DELTAS — deltaClass over every (control, armed) attribution pair:
//      BREAK / FIX / PATH-CHANGE / BOTH-WIN / SAME-LOSS / LOSS-CHANGE.
//   D. ROAD-BUNDLE — roadBundle reads the armed run's road state
//      (claimDay, verbs, done, stoppedTable, grounding at end).
//
// Usage (substrate env; SIDE per suite is set internally):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/test-relaydarkcost-20261020.js
'use strict';

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
  WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', NODEWITNESS: '1', KILLDISC: '1' };
function loadSweep(side) {
  for (const k of Object.keys(SUBSTRATE)) process.env[k] = SUBSTRATE[k];
  process.env.SIDE = side;
  if (side === 'roadarmed') process.env.RELAYDARK = '1'; else delete process.env.RELAYDARK;
  delete process.env.TABLEPATHDRIVER; delete process.env.DET; delete process.env.SMOKE;
  delete process.env.FIDELITY; delete process.env.SEEDS; delete process.env.ONLY; delete process.env.DAYS;
  const fp = require.resolve('./sweep-relaydarkcost-20261020.js');
  delete require.cache[fp];
  return require(fp);
}
function loadAnalyzer() {
  const fp = require.resolve('./analyze-relaydarkcost-20261020.js');
  delete require.cache[fp];
  return require(fp);
}

function craftRun(over) {
  return Object.assign({
    seed: 64201, policyId: 'leadfeast', substrate: 'relaydarkcost-judged', side: 'control',
    days: 180, gameDays: 180, endReason: 'survived',
    won: true, wins: true, national: true, table: true, exiled: false,
    maxRank: 3, nationalDay: 78, maxWave: 3, wave45: 0, wave5: 0,
    tableDay: 154, tableDayFloorOk: true, satEver: true, sittingDay: 154,
    seatAtSit: 'lesser', tableDoneDay: 155, tableActiveDays: 1,
    phaseTrace: ['paths', 'challenge', 'finals', 'done'],
    tpAssigned: null, relayAtSit: { held: false }, relayAtEnd: { held: false },
    tpdSummary: null, rdSummary: { active: false },
    instrumentErrors: 0, kdErrors: 0, kdKills: 0,
    deaths: {}, deathsAttributed: { attributed: [], attributedCount: 0, unverifiableCount: 0 },
    fightStarts: [], recs: [],
    endRec: { d: 180, tb: { waiting: false, done: true, path: 'feared', branch: 'light', phase: 'done' } },
    hashes: ['1:x'],
  }, over || {});
}

async function main() {
  // ——— A. COMPOSITION (real short sims) ———
  {
    const SW = loadSweep('control');
    const out = await SW.runOne(64201, 'leadfeast', { days: 30, noWrite: true });
    check('A1 control: run completes with records', out.recs.length > 0 && out.hashes.length > 0,
      `recs=${out.recs.length} hashes=${out.hashes.length}`);
    check('A1 control: layer never installs (pure delegation)', (out.rdSummary || {}).active === false,
      JSON.stringify(out.rdSummary));
    check('A1 control: instrument clean', (out.instrumentErrors | 0) === 0 && (out.kdErrors | 0) === 0,
      `ierr=${out.instrumentErrors} kdErr=${out.kdErrors}`);
    check('A1 control: deaths attributed cleanly', (out.deathsAttributed.unattributedCount | 0) === 0,
      `unattrib=${out.deathsAttributed.unattributedCount}`);
  }
  {
    const SW = loadSweep('roadarmed');
    const out = await SW.runOne(64201, 'belongfeast', { days: 30, noWrite: true });
    const rd = out.rdSummary || {};
    check('A2 armed: run completes', out.recs.length > 0, `recs=${out.recs.length}`);
    check('A2 armed: layer installed', rd.active === true, `active=${rd.active}`);
    check('A2 armed: no layer errors', (rd.rdError | 0) === 0 && (rd.verbError | 0) === 0,
      `rdErr=${rd.rdError} verbErr=${rd.verbError}`);
    check('A2 armed: instrument clean', (out.instrumentErrors | 0) === 0,
      `ierr=${out.instrumentErrors}`);
  }

  // ——— B. ATTRIBUTION (offline, crafted) ———
  {
    const AZ = loadAnalyzer();
    const win = AZ.attributeRun(craftRun());
    check('B1 win attributed via endRec.tb', win.cls === 'win' && win.path === 'feared' && win.branch === 'light',
      `${win.cls} ${win.why}`);
    const unexp = AZ.attributeRun(craftRun({ endRec: { d: 180, tb: { done: true, path: null, branch: null } } }));
    check('B2 won-but-null-path is UNEXPLAINED, never guessed', unexp.cls === 'UNEXPLAINED', unexp.cls);
    const pre = AZ.attributeRun(craftRun({ won: false, wins: false, gameDays: 38, endReason: 'village-lost',
      tableDay: null, satEver: false, table: false }));
    check('B3 pre-table-collapse', pre.cls === 'pre-table-collapse', pre.cls);
    const win2 = AZ.attributeRun(craftRun({ won: false, wins: false, gameDays: 69, endReason: 'village-lost',
      tableDay: 45, satEver: false, table: true }));
    check('B4 invitation-window-collapse', win2.cls === 'invitation-window-collapse', win2.cls);
    const stall = AZ.attributeRun(craftRun({ won: false, wins: false, gameDays: 180, endReason: 'survived',
      tableDay: null, satEver: false, table: false, national: true, maxWave: 3 }));
    check('B5 no-invitation-stall', stall.cls === 'no-invitation-stall', stall.cls);
    const satnw = AZ.attributeRun(craftRun({ won: false, wins: false, gameDays: 100, satEver: true, sittingDay: 90 }));
    check('B6 sat-no-win', satnw.cls === 'sat-no-win', satnw.cls);
    const miss = AZ.attributeRun(null);
    check('B7 MISSING on null record', miss.cls === 'MISSING', miss.cls);
  }

  // ——— C. DELTAS ———
  {
    const AZ = loadAnalyzer();
    const w = { cls: 'win', path: 'feared', branch: 'light' };
    const w2 = { cls: 'win', path: 'relay', branch: 'dark' };
    const p = { cls: 'pre-table-collapse' };
    const i = { cls: 'invitation-window-collapse' };
    check('C1 BREAK', AZ.deltaClass(w, p) === 'BREAK', AZ.deltaClass(w, p));
    check('C2 FIX', AZ.deltaClass(p, w) === 'FIX', AZ.deltaClass(p, w));
    check('C3 PATH-CHANGE', AZ.deltaClass(w, w2) === 'PATH-CHANGE', AZ.deltaClass(w, w2));
    check('C4 BOTH-WIN', AZ.deltaClass(w, w) === 'BOTH-WIN', AZ.deltaClass(w, w));
    check('C5 SAME-LOSS', AZ.deltaClass(p, p) === 'SAME-LOSS', AZ.deltaClass(p, p));
    check('C6 LOSS-CHANGE', AZ.deltaClass(p, i) === 'LOSS-CHANGE', AZ.deltaClass(p, i));
  }

  // ——— D. ROAD-BUNDLE ———
  {
    const AZ = loadAnalyzer();
    const r = craftRun({ side: 'roadarmed',
      rdSummary: { active: true, claimed: 1, claimDay: 41, deepens: 2, efficients: 12, rewrites: 4, skims: 4,
        done: 1, doneDay: 60, floorStop: 0, stoppedTable: 0, rdError: 0, verbError: 0, nullVerbs: 0 },
      relayAtEnd: { held: true, lean: -52, grounding: 44, darkUses: 8, bond: 2 } });
    const b = AZ.roadBundle(r);
    check('D1 claimDay read', b.claimDay === 41, `got ${b.claimDay}`);
    check('D2 verb counts summed', b.verbs === 22 && b.deepens === 2 && b.skims === 4, `verbs=${b.verbs}`);
    check('D3 done + end state', b.done === true && b.groundingEnd === 44 && b.leanEnd === -52,
      `done=${b.done} g=${b.groundingEnd} lean=${b.leanEnd}`);
    check('D4 no errors', b.rdError === 0 && b.verbError === 0 && b.nullVerbs === 0);
  }

  console.log(`\ntest-relaydarkcost-20261020: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(1); });
