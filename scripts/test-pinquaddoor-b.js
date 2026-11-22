// test-pinquaddoor-b.js — proof test, arm sim-pinquaddoor-b (finding #2619:
// PIN THE QUAD + OPEN THE DOOR — the lever that follows the sense3 GO).
// Port gate (test-allyslot3-b.js 18/18) is the Step-1 gate; this test proves
// Step 2, the PINQUAD lever, on the ported base.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1 LAUNCH: a real brain-path quad launch (vbrainExecuteDepart,
//     party_launch commit) writes pinnedParty onto all four expedition
//     records — the launch sites are wired, not just the helper.
//   §2 CHURN: after a companion's expedition is retargeted (the
//     overnight churn that dissolved the fresh band's quads), the sense
//     still returns the pinned trio; a dead pinned companion drops out.
//   §3 DOOR, ARMED: a pinned quad's expeditionMonster fight opens at
//     the door (allyFromStart, three door lines, ally3Vid set), and the
//     live-shape wave-4 fight (audit, fighter entry HP 84, geared)
//     deals real third-ally damage (ally3Dealt > 0).
//   §4 DOOR, CONTROL: with PINQUAD unset (slot on) the same staging
//     does NOT open the door (allyFromStart false) and no pin is written.
//   §5 INERT: PINQUAD without ALLYSLOT3 opens nothing (sense caps at 2).
//   §6 DRIVER SMOKE: the pinquaddoor driver runs one 30d armed seed,
//     exit 0, 0 instrument errors, slotPresent + pinPresent + flags.
//   §7 FROZEN-CORPUS CROSS-CHECK: the pinquaddoor analyzer re-reads
//     the sense3 corpus exactly (143 encounters, 0 three-vid, 6 vKill).
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party is
// a geared wave-4 hunting party — hide_armor + hunting_spear, armor P
// measured back in the live 8–30 range — never a fresh un-geared scholar.
// Usage: node scripts/test-pinquaddoor-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const A = require(path.join(REPO, 'scripts', 'analyze-pinquaddoor-b'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function hasLine(rec, re) { return (rec.log || []).some(function (s) { return re.test(s); }); }

const agencySrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
const winPlanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');

(function section0() {
  check('§0 villager-agency.js carries the pin (pinQuadParty + pinnedQuadAllies + PINQUAD)',
    /pinQuadParty/.test(agencySrc) && /pinnedQuadAllies/.test(agencySrc) && /PINQUAD/.test(agencySrc));
  check('§0 party-wiring.js reads the pin (pinnedQuadAllies + PINQUAD)',
    /pinnedQuadAllies/.test(wiringSrc) && /PINQUAD/.test(wiringSrc));
  check('§0 both launch sites pin a quad (win-plan.js + villager-brain.js call pinQuadParty)',
    /pinQuadParty\(vid, launched\.slice\(\)\)/.test(winPlanSrc) && /pinQuadParty\(vid, launched\.slice\(\)\)/.test(brainSrc));
  check('§0 the ported slot is still present (ally3Vid in fieldFights.js)',
    /ally3Vid/.test(ffSrc) && /shouts a third time!/.test(ffSrc));
  // The port gate is the Step-1 gate — re-run it here so this file is
  // self-contained proof of the base it stands on.
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-allyslot3-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 300000 });
  check('§0 port gate re-runs green (test-allyslot3-b.js 18/18)',
    r.status === 0 && /18 passed, 0 failed/.test(r.stdout || ''), (r.stdout || '').split('\n').slice(-2).join(' / '));
})();

// ================= STAGING HELPERS =================
function pickQuad(Game) {
  // Four Haven-idle villagers with ranging profiles (wanderer/explorer),
  // trust 50, full health, not sick — the launchable pool. If the fresh
  // village is short, agency potential tops the score up (+2).
  const v = Game.state.village || {};
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  let elig = [];
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    // Agency potential is +2 on the profile score (wanderer needs
    // >= 2), and npcRangeProfile CACHES the result in a.profiles —
    // so potential must be set BEFORE the first profile read, and
    // any cached profile cleared, or the top-up never lands.
    if (a) {
      a.potential = a.potential || {};
      roster.forEach(function (id) { try { a.potential[id] = true; } catch (e) {} });
      if (a.profiles) roster.forEach(function (id) { try { delete a.profiles[id]; } catch (e) {} });
    }
    elig = roster.filter(function (id) {
      try {
        const prof = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
        return prof === 'wanderer' || prof === 'explorer';
      } catch (e) { return false; }
    });
  } catch (e) {}
  if (elig.length < 4) return { ok: false, why: 'only ' + elig.length + ' ranging villagers', hx: hx, hy: hy };
  const q = elig.slice(0, 4);
  v.trust = v.trust || {};
  v.health = v.health || {};
  v.sick = v.sick || {};
  q.forEach(function (id) {
    v.trust[id] = 50; v.health[id] = 100; delete v.sick[id];
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
  });
  return { ok: true, holder: q[0], c1: q[1], c2: q[2], c3: q[3], hx: hx, hy: hy };
}
function gearUp(Game, ids) {
  const kit = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  ids.forEach(function (id) {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) p.equipped = JSON.parse(JSON.stringify(kit));
  });
}
function measuredArmorP(Game, ids) {
  const S = globalThis.Scattering || {};
  return ids.map(function (id) {
    const ap = (Game.data.villagers || []).find(function (x) { return x.id === id; }) ||
      (Game.data.background_survivors || []).find(function (x) { return x.id === id; });
    return S.equipment.armorOf(ap, Game.data.items);
  });
}

(async () => {
  // ---------- §1 REAL QUAD LAUNCH PINS ALL FOUR ----------
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.LAUNCHSURVIVE = '1';
  const { Game } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game);
  const q = pickQuad(Game);
  check('§1 staging: four launchable villagers found', q.ok, q.why || q);
  if (!q.ok) { console.log('test-pinquaddoor-b: ' + passed + ' passed, ' + failed + ' failed'); process.exit(1); }
  gearUp(Game, [q.holder, q.c1, q.c2, q.c3]);
  const ps = measuredArmorP(Game, [q.holder, q.c1, q.c2, q.c3]);
  check('§1 staged gear measures inside the live quad-gate range (armor P 8–30, all four)',
    ps.every(function (p) { return p >= 8 && p <= 30; }), ps);
  // Stage a dawn party_launch commit for today, exactly the shape the
  // dawn scorer writes (vbrainCommit store: state.village.vbrain.commit).
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 0;
  v.vbrain = v.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  v.vbrain.commit[q.holder] = { day: day, kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: q.c1, companion2: q.c2, companion3: q.c3 };
  const dep = Game.vbrainExecuteDepart(q.holder, q.hx, q.hy, false);
  check('§1 real brain-path quad launch departs (vbrainExecuteDepart returns launch)',
    dep === 'launch', dep);
  const st = Game.agencyState ? Game.agencyState() : null;
  const pin = [q.holder, q.c1, q.c2, q.c3];
  const pinsOk = st && st.exped && [q.holder, q.c1, q.c2, q.c3].every(function (id) {
    return st.exped[id] && eq(st.exped[id].pinnedParty || null, pin);
  });
  check('§1 all four expedition records carry pinnedParty = [holder, c1, c2, c3]',
    !!pinsOk, st && [q.holder, q.c1, q.c2, q.c3].map(function (id) { return (st.exped[id] || {}).pinnedParty || null; }));
  let quads = 0;
  try { quads = (Game.winPlanStats ? Game.winPlanStats().partyQuads : 0) || 0; } catch (e) {}
  check('§1 the launch counts as a quad (partyQuads bumped)', quads >= 1, quads);

  // ---------- §2 CHURN PROOF ----------
  // Retarget the third companion's expedition (the overnight churn: a
  // re-launch elsewhere). The same-target scan would now exclude them;
  // the pin must still return the trio, in pinned order.
  st.exped[q.c3].tx = 7; st.exped[q.c3].ty = 7;
  const sensed = Game.villagerFightAllies(q.holder) || [];
  check('§2 churn: sense returns the pinned trio even after the third companion is retargeted',
    eq(sensed, [q.c1, q.c2, q.c3]), sensed);
  // Minus anyone dead: kill the second companion in the person record;
  // the sense drops them and keeps the living two.
  let p2 = null;
  try { p2 = Game.getPerson ? Game.getPerson(q.c2) : Game.vpOf(q.c2); if (p2) p2.dead = true; } catch (e) {}
  const sensedDead = Game.villagerFightAllies(q.holder) || [];
  check('§2 dead pinned companion drops out of the sense (minus anyone dead)',
    eq(sensedDead, [q.c1, q.c3]), sensedDead);
  try { if (p2) p2.dead = false; } catch (e) {}
  const sensedBack = Game.villagerFightAllies(q.holder) || [];
  check('§2 sense is whole again once the companion lives (trio restored)',
    eq(sensedBack, [q.c1, q.c2, q.c3]), sensedBack);

  // ---------- §3 DOOR PROOF, ARMED ----------
  // (a) The expeditionMonster decision: wrap fieldFight (observe only —
  // the driver's own pattern) and call the real expeditionMonster until
  // a fight is captured. The holder is on a pinned expedition; the
  // fight must open at the door with all three companions in it.
  const origFF = Game.fieldFight;
  let captured = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    const rec = origFF.apply(this, arguments);
    if (!captured) captured = { opts: JSON.parse(JSON.stringify(opts || {})), rec: rec, mid: mdef && mdef.id };
    return rec;
  };
  let tries = 0;
  while (!captured && tries < 30) {
    tries++;
    try { Game.expeditionMonster(q.holder, 8, false); } catch (e) { /* a leg with no fight is not an error */ }
  }
  Game.fieldFight = origFF;
  check('§3a expeditionMonster produced a fight to judge', !!captured, { tries: tries });
  if (captured) {
    console.log('  [§3a door] mid=' + captured.mid + ' outcome=' + captured.rec.outcome + ' rounds=' + captured.rec.rounds +
      ' allyFromStart=' + captured.opts.allyFromStart + ' ally3Vid=' + captured.rec.ally3Vid + ' ally3Dealt=' + captured.rec.ally3Dealt);
    check('§3a armed: the pinned fight opens at the door (allyFromStart true in the fieldFight opts)',
      captured.opts.allyFromStart === true, captured.opts);
    check('§3a armed: all three pinned companions are in the fight (allyVid/ally2Vid/ally3Vid set)',
      !!captured.rec.allyVid && !!captured.rec.ally2Vid && !!captured.rec.ally3Vid,
      { allyVid: captured.rec.allyVid, ally2Vid: captured.rec.ally2Vid, ally3Vid: captured.rec.ally3Vid });
    check('§3a armed: third door line in the log',
      hasLine(captured.rec, /already at the door too/), (captured.rec.log || []).filter(function (x) { return /door/.test(x); }));
  }
  // (b) Live-shape wave-4 fight: fresh load, geared quad, fighter at the
  // live median entry HP 84, vs the wave-4 audit, with exactly the opts
  // expeditionMonster passes for a pinned trio. The door block must
  // deliver real third-ally damage against wave-4 HP.
  const { Game: Game3 } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game3);
  const q3 = pickQuad(Game3);
  check('§3b staging: four launchable villagers found (fresh load)', q3.ok, q3.why || q3);
  if (q3.ok) {
    gearUp(Game3, [q3.holder, q3.c1, q3.c2, q3.c3]);
    const st3 = Game3.agencyState ? Game3.agencyState() : null;
    [q3.holder, q3.c1, q3.c2, q3.c3].forEach(function (id) {
      Game3.startExpedition(id, q3.hx, q3.hy, false, { tx: 6, ty: 6, duration: 20 });
    });
    const pinned = Game3.pinQuadParty(q3.holder, [q3.c1, q3.c2, q3.c3]);
    check('§3b pinQuadParty records the pin (returns true, all four records carry it)',
      pinned === true && [q3.holder, q3.c1, q3.c2, q3.c3].every(function (id) { return st3.exped[id] && eq(st3.exped[id].pinnedParty, [q3.holder, q3.c1, q3.c2, q3.c3]); }),
      { pinned: pinned });
    const v3 = Game3.state.village;
    v3.health[q3.holder] = 84; v3.health[q3.c1] = 100; v3.health[q3.c2] = 100; v3.health[q3.c3] = 100;
    const mdef3 = (Game3.data.monsters || []).find(function (m) { return m.id === 'audit'; }) || {};
    const rec3 = Game3.fieldFight(q3.holder, mdef3, null, { allies: 3, allyVids: [q3.c1, q3.c2, q3.c3], allyFromStart: true });
    console.log('  [§3b live-shape] outcome=' + rec3.outcome + ' rounds=' + rec3.rounds +
      ' mDealt=' + rec3.mDealt + ' allyDealt=' + rec3.allyDealt + ' ally3Dealt=' + rec3.ally3Dealt);
    check('§3b live-shape: third ally joins at the door vs wave-4 (ally3Vid set)',
      !!rec3.ally3Vid, rec3.ally3Vid);
    check('§3b live-shape: third ally deals real damage vs wave-4 (ally3Dealt > 0)',
      (rec3.ally3Dealt || 0) > 0, rec3.ally3Dealt);
  }

  // ---------- §4 DOOR PROOF, CONTROL (PINQUAD unset, slot on) ----------
  delete process.env.PINQUAD;
  const { Game: Game4 } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game4);
  const q4 = pickQuad(Game4);
  check('§4 staging: four launchable villagers found (control load)', q4.ok, q4.why || q4);
  if (q4.ok) {
    gearUp(Game4, [q4.holder, q4.c1, q4.c2, q4.c3]);
    [q4.holder, q4.c1, q4.c2, q4.c3].forEach(function (id) {
      Game4.startExpedition(id, q4.hx, q4.hy, false, { tx: 6, ty: 6, duration: 20 });
    });
    const pinnedOff = Game4.pinQuadParty(q4.holder, [q4.c1, q4.c2, q4.c3]);
    const st4 = Game4.agencyState ? Game4.agencyState() : null;
    check('§4 control: pinQuadParty writes nothing with PINQUAD unset (returns false, no pinnedParty field)',
      pinnedOff === false && [q4.holder, q4.c1, q4.c2, q4.c3].every(function (id) { return st4.exped[id] && !('pinnedParty' in st4.exped[id]); }),
      { pinnedOff: pinnedOff });
    const origFF4 = Game4.fieldFight;
    let captured4 = null;
    Game4.fieldFight = function (vid, mdef, m, opts) {
      const rec = origFF4.apply(this, arguments);
      if (!captured4) captured4 = { opts: JSON.parse(JSON.stringify(opts || {})), rec: rec, mid: mdef && mdef.id };
      return rec;
    };
    let tries4 = 0;
    while (!captured4 && tries4 < 30) {
      tries4++;
      try { Game4.expeditionMonster(q4.holder, 8, false); } catch (e) {}
    }
    Game4.fieldFight = origFF4;
    check('§4 control: expeditionMonster produced a fight to judge', !!captured4, { tries: tries4 });
    if (captured4) {
      console.log('  [§4 control] mid=' + captured4.mid + ' outcome=' + captured4.rec.outcome + ' rounds=' + captured4.rec.rounds +
        ' allyFromStart=' + captured4.opts.allyFromStart + ' ally3Vid=' + captured4.rec.ally3Vid);
      check('§4 control: the door stays closed without the pin (allyFromStart false)',
        captured4.opts.allyFromStart === false, captured4.opts);
    }
  }

  // ---------- §5 PINQUAD WITHOUT ALLYSLOT3 IS INERT ----------
  delete process.env.ALLYSLOT3;
  process.env.PINQUAD = '1';
  const { Game: Game5 } = await loadGame({ seed: 424242, mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game5);
  const q5 = pickQuad(Game5);
  check('§5 staging: four launchable villagers found (no-slot load)', q5.ok, q5.why || q5);
  if (q5.ok) {
    [q5.holder, q5.c1, q5.c2, q5.c3].forEach(function (id) {
      Game5.startExpedition(id, q5.hx, q5.hy, false, { tx: 6, ty: 6, duration: 20 });
    });
    const pinned5 = Game5.pinQuadParty(q5.holder, [q5.c1, q5.c2, q5.c3]);
    check('§5 the pin still records with PINQUAD=1 (the record is not the seat)',
      pinned5 === true, pinned5);
    const sensed5 = Game5.villagerFightAllies(q5.holder) || [];
    check('§5 sense caps at 2 without the slot (PINQUAD alone opens no third seat)',
      sensed5.length <= 2, sensed5);
  }

  // ---------- §6 DRIVER SMOKE (armed leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1';
  const smokeDir = 'perseed-pinquaddoor-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-20', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1',
    MODE: 'pinquaddoor', DAYS: '30',
    SEEDS: '106251', RUN: 'pinquaddoor-b-smoke', OUTDIR: smokeDir });
  const r6 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§6 driver smoke (direct, armed): exit 0 on one 30d seed', r6.status === 0, (r6.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'pinquaddoor-wide-b-s106251-pinquaddoor-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§6 driver smoke: corpus file written, slotPresent + pinPresent true, pinquadFlag 1',
    !!dd && dd.slotPresent === true && dd.pinPresent === true && dd.pinquadFlag === '1',
    dd && { slotPresent: dd.slotPresent, pinPresent: dd.pinPresent, pinquadFlag: dd.pinquadFlag });
  if (dd) {
    check('§6 driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§6 driver smoke: encounter rows carry pinned + pinnedAllies',
      (dd.v4encounters || []).every(function (e) { return ('pinned' in e) && ('pinnedAllies' in e); }),
      (dd.v4encounters || []).length);
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  // ---------- §7 FROZEN-CORPUS CROSS-CHECK ----------
  const dir = path.join(REPO, 'evidence', '2026-11-20', 'perseed-sense3-b');
  if (!fs.existsSync(dir)) { console.log('SKIP §7: sense3 corpus not present'); }
  else {
    const a = A.analyzeDir(dir);
    check('§7 frozen sense3 corpus re-reads exactly (143 encounters, 0 three-vid, 6 vKill, 4 launches / 3 quads)',
      a.files === 8 && a.encounters === 143 && a.threeVid === 0 && a.kills === 6 && a.launches === 4 && a.quadLaunches === 3,
      { files: a.files, encounters: a.encounters, threeVid: a.threeVid, kills: a.kills, launches: a.launches, quadLaunches: a.quadLaunches });
    check('§7 frozen corpus: 0 pinned fights, 0 ally3Vid (the instrument reads the old corpus as unpinned)',
      a.pinnedFights === 0 && a.ally3Vid === 0, { pinnedFights: a.pinnedFights, ally3Vid: a.ally3Vid });
  }

  // ---------- §1 ANALYZER SELFTEST (in-process) ----------
  const selfOk = (function () {
    try { return A.selftest(); } catch (e) { console.log('selftest threw: ' + (e && e.stack || e)); return false; }
  })();
  check('§1 analyzer selftest passes (26/26 incl. pin census + armed driver smoke + wide secondaries)', selfOk === true, selfOk);

  console.log('test-pinquaddoor-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-pinquaddoor-b FATAL', e && e.stack || e); process.exit(1); });
