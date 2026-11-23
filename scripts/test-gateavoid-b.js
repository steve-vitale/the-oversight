// test-gateavoid-b.js — proof test, arm sim-gateavoid-b
// (finding #2695: GATE-AVOID NOTES UNDERCOUNT FIRES — the
// leaderproj NO-GO, METRIC-BROKEN: the projection gate fired 8x
// but the end-of-run census saw 9 fires as 1 note, because
// gate-avoid notes live on the leader's expedition record and
// expeditionReturn deletes it (villager-agency.js:1097; death
// path :1011), and avoided meetings write no v4encounters row.
// This arm builds the durable gate-avoid log: each gate fire
// (HPGATE 'hold', LEADERHPGATE 'lead', LEADERPROJ 'proj')
// appends one record to st.gateAvoids at fire time, on the
// agency state that survives expeditionReturn — so the
// end-of-run census can attribute every fire to its door.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §0 the log append lives inside each of the three gate-fire
//     blocks (and nowhere else — agencyState() never creates the
//     key), carries day/vid/mid/kind/name/hp/projHp2/note, and
//     draws no RNG.
//   §1 HPGATE fire (leader 21) appends a 'hold' entry (hp 21,
//     mid congregation, day a number, projHp2 null) AND the entry
//     survives expeditionReturn (the exped record is gone, the
//     log entry is still there); the expedition note is still
//     pushed (narrative unchanged).
//   §2 LEADERHPGATE fire (leader 21) appends a 'lead' entry and
//     it survives expeditionReturn the same way.
//   §3 LEADERPROJ fire (leader 64) appends a 'proj' entry
//     (hp 64, projHp2 14) and it survives expeditionReturn AND
//     the death path (direct delete st.exped[vid]).
//   §4 OFF-MODE IDENTITY: with all three flags off, no
//     gateAvoids key exists after a hurt-leader door or a healthy
//     door (the key is never created); with all flags on and a
//     healthy leader (no fire) no entry is written either; and
//     the healthy door fight is identical flag-on vs flag-off
//     (outcome/rounds/dealt/vTaken equal — the log draws no RNG
//     and changes nothing when no gate fires).
//   §5 ACCUMULATION: two projection fires on one run append two
//     entries in fire order, counters 2.
//   §6 DRIVER SMOKE: the pinquaddoor driver runs one 30d armed
//     seed, exit 0, 0 instrument errors, corpus carries
//     gateAvoidLog as an array, and its length equals the total
//     gate fires (durability on a real run).
//   §7 BASE GATES: test-hpgate-b.js re-runs green (43/43) and
//     test-leaderproj-b.js re-runs green (55/55) on this tip.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged
// party is a geared wave-4 hunting party — hide_armor +
// hunting_spear, leader at 100 HP unless the section stages a
// hurt member — never a fresh un-geared scholar. The meeting is
// staged through expeditionMonster itself (the gates' home),
// with the wave pool forced to the section's wave so the meeting
// is a door monster; the monster pick is deterministic per
// staging seed (seed 11 is always the congregation on the
// wave-4 pool).
// Usage: node scripts/test-gateavoid-b.js
// Exit 0 = all checks pass.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const agSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');

(function section0() {
  function gateBlock(kind, marker) {
    const g = agSrc.indexOf(marker);
    if (g === -1) return null;
    const gEnd = agSrc.indexOf('var rec = this.fieldFight(vid, m, null,', g);
    if (gEnd === -1) return null;
    return agSrc.slice(g, gEnd);
  }
  const hg = gateBlock('hold', '// HPGATE (sim-hpgate-b, finding #2619): HP-gate door parties.');
  const lh = gateBlock('lead', '// LEADERHPGATE (sim-leaderhpgate-b, finding #2619): the');
  const lp = gateBlock('proj', '// LEADERPROJ (sim-leaderproj-b, finding #2619): the');
  check('§0 the HPGATE fire block appends a durable log entry (kind hold)',
    !!hg && /gateAvoids/.test(hg) && /kind: 'hold'/.test(hg), hg ? hg.slice(0, 200) : null);
  check('§0 the LEADERHPGATE fire block appends a durable log entry (kind lead)',
    !!lh && /gateAvoids/.test(lh) && /kind: 'lead'/.test(lh), lh ? lh.slice(0, 200) : null);
  check('§0 the LEADERPROJ fire block appends a durable log entry (kind proj, projHp2)',
    !!lp && /gateAvoids/.test(lp) && /kind: 'proj'/.test(lp) && /projHp2/.test(lp), lp ? lp.slice(0, 200) : null);
  check('§0 the log array is created lazily ONLY inside gate-fire blocks (agencyState() never creates the gateAvoids key)',
    (function () {
      const g = agSrc.indexOf('agencyState() {');
      const gEnd = agSrc.indexOf('agencyOf(vid) {', g);
      if (g === -1 || gEnd === -1) return false;
      return agSrc.slice(g, gEnd).indexOf('gateAvoids') === -1;
    })());
  check('§0 the log entry carries day/vid/mid/kind/name/hp/projHp2/note',
    /gateAvoids/.test(agSrc) && /day: _\w+Day/.test(agSrc) && /vid: vid/.test(agSrc) && /mid: m\.id/.test(agSrc) &&
    /name: _\w+Nm/.test(agSrc) && /hp: _\w+/.test(agSrc) && /note: _\w+Note/.test(agSrc));
  check('§0 the log append draws no RNG (no RR() in any of the three fire blocks)',
    [hg, lh, lp].every(function (b) { return !!b && b.indexOf('RR(') === -1; }));
})();

// ================= STAGING HELPERS (same pickQuad/gearUp as test-leaderproj-b.js) =================
function pickQuad(Game) {
  const v = Game.state.village || {};
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  let elig = [];
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
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
function readLog(Game) {
  try { const a = Game.agencyState ? Game.agencyState() : null; return (a && a.gateAvoids) || null; } catch (e) { return null; }
}
// Stage one geared pinned quad and call expeditionMonster directly —
// the gates' home. wave: the monster pool wave (4 = door monsters).
// leaderHp / ally3Hp set the staged HPs (other allies 100). pin:
// whether to pin the quad. Caller sets the env first. Returns the
// meeting: fieldFight calls, all three gate counters, the expedition
// notes, the durable log, and the Game (so the section can call
// expeditionReturn / expeditionMonster again on the same run).
async function stageMeeting(wave, leaderHp, ally3Hp, seed, pin) {
  const { Game } = await loadGame({ seed: (seed == null ? 11 : seed), mode: 'pinquaddoor', fullTelemetry: false });
  await setupGame(Game);
  const pool = (Game.data.monsters || []).filter(function (m) { return m.wave === wave; });
  Game.monsterWavePool = function () { return pool; };
  const q = pickQuad(Game);
  if (!q.ok) return { ok: false, why: q.why || q };
  gearUp(Game, [q.holder, q.c1, q.c2, q.c3]);
  [q.holder, q.c1, q.c2, q.c3].forEach(function (id) {
    Game.startExpedition(id, q.hx, q.hy, false, { tx: 6, ty: 6, duration: 20 });
  });
  let pinned = false;
  if (pin) pinned = Game.pinQuadParty(q.holder, [q.c1, q.c2, q.c3]);
  const v = Game.state.village;
  v.health[q.holder] = leaderHp; v.health[q.c1] = 100; v.health[q.c2] = 100; v.health[q.c3] = ally3Hp;
  let ffCalls = [];
  let rec = null;
  const origFF = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    ffCalls.push({ mid: mdef && mdef.id, wave: mdef && mdef.wave, allyFromStart: !!(opts && opts.allyFromStart), allyVids: ((opts && opts.allyVids) || []).slice() });
    rec = origFF.apply(this, arguments);
    return rec;
  };
  Game.expeditionMonster(q.holder, 3, false);
  let fires = 0, hpFires = 0, projFires = 0;
  try { const _ag = Game.agencyState() || {}; fires = (_ag.leaderhpgateFires | 0); hpFires = (_ag.hpgateFires | 0); projFires = (_ag.leaderprojFires | 0); } catch (e) {}
  let notes = [];
  try { notes = (((Game.agencyState() || {}).exped || {})[q.holder] || {}).encounters || []; } catch (e) {}
  return { ok: true, Game: Game, q: q, pinned: pinned, ffCalls: ffCalls, fires: fires, hpFires: hpFires, projFires: projFires, notes: notes, log: readLog(Game), rec: rec };
}

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1';
  process.env.LAUNCHSURVIVE = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  process.env.HYPOFLOOR = '1'; process.env.HPGATE = '1';
  delete process.env.LEADERHPGATE; delete process.env.LEADERPROJ; // §1 isolates HPGATE.

  // ---------- §1 HPGATE FIRE → 'hold' LOG ENTRY, SURVIVES expeditionReturn ----------
  const g1 = await stageMeeting(4, 21, 100, 11, true);
  check('§1 staging: whole-party-gate load stages (pinned quad, leader 21, seed 11)', g1.ok, g1.why || g1);
  if (g1.ok) {
    console.log('  [§1] ffCalls=' + JSON.stringify(g1.ffCalls) + ' hpFires=' + g1.hpFires + ' log=' + JSON.stringify(g1.log));
    check('§1 the whole-party gate fires (no fight, hpgateFires 1, other counters 0)',
      g1.ffCalls.length === 0 && g1.hpFires === 1 && g1.fires === 0 && g1.projFires === 0,
      { ff: g1.ffCalls, hpFires: g1.hpFires, fires: g1.fires, projFires: g1.projFires });
    const e1 = (g1.log || [])[0];
    check('§1 the fire appends one durable hold entry (kind hold, hp 21, mid congregation, day a number, projHp2 null, note the avoid text)',
      Array.isArray(g1.log) && g1.log.length === 1 && e1 && e1.kind === 'hold' && e1.hp === 21 && e1.mid === 'congregation' &&
      typeof e1.day === 'number' && e1.projHp2 === null && typeof e1.name === 'string' && e1.name.length > 0 &&
      typeof e1.note === 'string' && /too hurt to hold a door \(21 HP\)/.test(e1.note), g1.log);
    check('§1 the expedition note is still pushed (narrative unchanged — the log adds, it does not replace)',
      g1.notes.some(function (n) { return /gave congregation room/.test(n) && /too hurt to hold a door \(21 HP\)/.test(n); }), g1.notes);
    let retErr = null, expedGone = false;
    try { g1.Game.expeditionReturn(g1.q.holder, false); } catch (e) { retErr = String(e && e.message || e); }
    try { expedGone = !(((g1.Game.agencyState() || {}).exped || {})[g1.q.holder]); } catch (e) {}
    const logAfter = readLog(g1.Game);
    check('§1 the log entry SURVIVES expeditionReturn (exped record deleted, log still holds the hold entry)',
      retErr === null && expedGone === true && Array.isArray(logAfter) && logAfter.length === 1 && logAfter[0].kind === 'hold' && logAfter[0].hp === 21,
      { retErr: retErr, expedGone: expedGone, logAfter: logAfter });
  }

  // ---------- §2 LEADERHPGATE FIRE → 'lead' LOG ENTRY, SURVIVES expeditionReturn ----------
  delete process.env.HPGATE; process.env.LEADERHPGATE = '1';
  const g2 = await stageMeeting(4, 21, 100, 11, true);
  check('§2 staging: leader-gate load stages (pinned quad, leader 21, seed 11)', g2.ok, g2.why || g2);
  if (g2.ok) {
    console.log('  [§2] ffCalls=' + JSON.stringify(g2.ffCalls) + ' leaderFires=' + g2.fires + ' log=' + JSON.stringify(g2.log));
    check('§2 the leader gate fires (no fight, leaderhpgateFires 1, other counters 0)',
      g2.ffCalls.length === 0 && g2.fires === 1 && g2.hpFires === 0 && g2.projFires === 0,
      { ff: g2.ffCalls, fires: g2.fires, hpFires: g2.hpFires, projFires: g2.projFires });
    const e2 = (g2.log || [])[0];
    check('§2 the fire appends one durable lead entry (kind lead, hp 21, mid congregation, day a number, projHp2 null)',
      Array.isArray(g2.log) && g2.log.length === 1 && e2 && e2.kind === 'lead' && e2.hp === 21 && e2.mid === 'congregation' &&
      typeof e2.day === 'number' && e2.projHp2 === null, g2.log);
    let retErr = null, expedGone = false;
    try { g2.Game.expeditionReturn(g2.q.holder, false); } catch (e) { retErr = String(e && e.message || e); }
    try { expedGone = !(((g2.Game.agencyState() || {}).exped || {})[g2.q.holder]); } catch (e) {}
    const logAfter = readLog(g2.Game);
    check('§2 the log entry SURVIVES expeditionReturn (exped record deleted, log still holds the lead entry)',
      retErr === null && expedGone === true && Array.isArray(logAfter) && logAfter.length === 1 && logAfter[0].kind === 'lead' && logAfter[0].hp === 21,
      { retErr: retErr, expedGone: expedGone, logAfter: logAfter });
  }

  // ---------- §3 LEADERPROJ FIRE → 'proj' LOG ENTRY, SURVIVES RETURN + DEATH PATH ----------
  delete process.env.LEADERHPGATE; process.env.LEADERPROJ = '1';
  const g3 = await stageMeeting(4, 64, 100, 11, true);
  check('§3 staging: projection-gate load stages (pinned quad, leader 64, seed 11)', g3.ok, g3.why || g3);
  if (g3.ok) {
    console.log('  [§3] ffCalls=' + JSON.stringify(g3.ffCalls) + ' projFires=' + g3.projFires + ' log=' + JSON.stringify(g3.log));
    check('§3 the projection gate fires (no fight, leaderprojFires 1, other counters 0)',
      g3.ffCalls.length === 0 && g3.projFires === 1 && g3.fires === 0 && g3.hpFires === 0,
      { ff: g3.ffCalls, projFires: g3.projFires, fires: g3.fires, hpFires: g3.hpFires });
    const e3 = (g3.log || [])[0];
    check('§3 the fire appends one durable proj entry (kind proj, hp 64, projHp2 14, mid congregation, note the projection)',
      Array.isArray(g3.log) && g3.log.length === 1 && e3 && e3.kind === 'proj' && e3.hp === 64 && e3.projHp2 === 14 && e3.mid === 'congregation' &&
      typeof e3.day === 'number' && /too hurt to lead a door \(projected 64 HP, 14 HP in two rounds\)/.test(e3.note || ''), g3.log);
    let retErr = null, expedGone = false;
    try { g3.Game.expeditionReturn(g3.q.holder, false); } catch (e) { retErr = String(e && e.message || e); }
    try { expedGone = !(((g3.Game.agencyState() || {}).exped || {})[g3.q.holder]); } catch (e) {}
    const logAfterRet = readLog(g3.Game);
    check('§3 the log entry SURVIVES expeditionReturn (exped record deleted, log still holds the proj entry)',
      retErr === null && expedGone === true && Array.isArray(logAfterRet) && logAfterRet.length === 1 && logAfterRet[0].kind === 'proj' && logAfterRet[0].projHp2 === 14,
      { retErr: retErr, expedGone: expedGone, logAfterRet: logAfterRet });
    // Death path: expedDeath deletes st.exped[vid] the same way
    // (villager-agency.js:1011) — simulate it directly.
    try { delete (g3.Game.agencyState() || {}).exped[g3.q.holder]; } catch (e) {}
    const logAfterDeath = readLog(g3.Game);
    check('§3 the log entry SURVIVES the death path too (st.exped[vid] deleted, log still holds the proj entry)',
      Array.isArray(logAfterDeath) && logAfterDeath.length === 1 && logAfterDeath[0].kind === 'proj' && logAfterDeath[0].hp === 64,
      logAfterDeath);
  }

  // ---------- §4 OFF-MODE IDENTITY (all flags off: no key; flags on + healthy: no entry; fight identical) ----------
  delete process.env.HPGATE; delete process.env.LEADERHPGATE; delete process.env.LEADERPROJ;
  const o1 = await stageMeeting(4, 64, 100, 11, true);
  check('§4 staging: flag-off hurt load stages', o1.ok, o1.why || o1);
  if (o1.ok) {
    check('§4 with all flags off the hurt leader fights and NO log key exists (gateAvoids undefined — the key is never created)',
      o1.ffCalls.length === 1 && o1.hpFires === 0 && o1.fires === 0 && o1.projFires === 0 && o1.log === null,
      { ff: o1.ffCalls, log: o1.log });
  }
  const o2 = await stageMeeting(4, 100, 100, 11, true);
  check('§4 staging: flag-off healthy load stages', o2.ok, o2.why || o2);
  if (o2.ok) {
    check('§4 with all flags off the healthy door fights and NO log key exists either',
      o2.ffCalls.length === 1 && o2.log === null, { ff: o2.ffCalls, log: o2.log });
  }
  process.env.HPGATE = '1'; process.env.LEADERHPGATE = '1'; process.env.LEADERPROJ = '1';
  const o3 = await stageMeeting(4, 100, 100, 11, true);
  check('§4 staging: flag-on healthy load stages', o3.ok, o3.why || o3);
  if (o3.ok) {
    check('§4 with all flags on and a healthy leader (no gate fires) NO entry is written (gateAvoids still null)',
      o3.ffCalls.length === 1 && o3.hpFires === 0 && o3.fires === 0 && o3.projFires === 0 && o3.log === null,
      { ff: o3.ffCalls, log: o3.log });
  }
  if (o2.ok && o3.ok && o2.rec && o3.rec) {
    const so = { outcome: o2.rec.outcome, rounds: o2.rec.rounds, mDealt: o2.rec.mDealt, vTaken: o2.rec.vTaken };
    const sa = { outcome: o3.rec.outcome, rounds: o3.rec.rounds, mDealt: o3.rec.mDealt, vTaken: o3.rec.vTaken };
    console.log('  [§4] flag-off healthy=' + JSON.stringify(so) + ' flag-on healthy=' + JSON.stringify(sa));
    check('§4 the healthy door fight is identical with all flags on vs off (outcome/rounds/dealt/vTaken equal — the log draws no RNG, changes nothing when no gate fires)',
      eq(so, sa), { off: so, on: sa });
  }

  // ---------- §5 ACCUMULATION (two projection fires, one run) ----------
  delete process.env.HPGATE; delete process.env.LEADERHPGATE; process.env.LEADERPROJ = '1';
  const g5 = await stageMeeting(4, 64, 100, 11, true);
  check('§5 staging: accumulation load stages (pinned quad, leader 64, seed 11)', g5.ok, g5.why || g5);
  if (g5.ok) {
    // Fire a second time on the same run: the avoid returns before
    // fieldFight, so the leader's expedition record (and pin) are
    // still live — reset the leader's HP and meet again.
    g5.Game.state.village.health[g5.q.holder] = 64;
    g5.Game.expeditionMonster(g5.q.holder, 3, false);
    let fires5 = 0;
    try { fires5 = (g5.Game.agencyState() || {}).leaderprojFires | 0; } catch (e) {}
    const log5 = readLog(g5.Game);
    console.log('  [§5] projFires=' + fires5 + ' log=' + JSON.stringify(log5));
    check('§5 two projection fires append two entries in fire order (counter 2, log length 2, both kind proj)',
      fires5 === 2 && Array.isArray(log5) && log5.length === 2 && log5[0].kind === 'proj' && log5[1].kind === 'proj',
      { fires5: fires5, log5: log5 });
    check('§5 the second entry is a fresh record (its own day/mid/note — not a duplicate object of the first)',
      log5 && log5.length === 2 && log5[0] !== log5[1] && typeof log5[1].day === 'number' && typeof log5[1].mid === 'string',
      log5);
  }

  // ---------- §6 DRIVER SMOKE (armed leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1'; process.env.HYPOFLOOR = '1'; process.env.HPGATE = '1'; process.env.LEADERPROJ = '1';
  delete process.env.LEADERHPGATE;
  const smokeDir = 'perseed-gateavoid-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-23', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1', DMGPIN: '1', DOORFLEE2: '1', HYPOFLOOR: '1', HPGATE: '1', LEADERPROJ: '1',
    MODE: 'pinquaddoor', DAYS: '30', EVIDENCE_DATE: '2026-11-23', CORPUS_PREFIX: 'gateavoid-b',
    SEEDS: '106251', RUN: 'gateavoid-b-smoke', OUTDIR: smokeDir });
  const r6 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§6 driver smoke (direct, armed): exit 0 on one 30d seed', r6.status === 0, (r6.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'gateavoid-b-s106251-gateavoid-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§6 driver smoke: corpus file written, gateAvoidLog is an array and gateAvoidNotes is an array',
    !!dd && Array.isArray(dd.gateAvoidLog) && Array.isArray(dd.gateAvoidNotes),
    dd && { gateAvoidLog: dd.gateAvoidLog, gateAvoidNotes: dd.gateAvoidNotes });
  if (dd) {
    const totalFires = (dd.hpgateFires | 0) + (dd.leaderhpgateFires | 0) + (dd.leaderprojFires | 0);
    check('§6 driver smoke: the durable log is complete on a real run (gateAvoidLog length == total gate fires)',
      dd.gateAvoidLog.length === totalFires, { logLen: dd.gateAvoidLog.length, totalFires: totalFires, hpgateFires: dd.hpgateFires, leaderhpgateFires: dd.leaderhpgateFires, leaderprojFires: dd.leaderprojFires });
    check('§6 driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  // ---------- §7 BASE GATES ----------
  const subEnv = Object.assign({}, process.env);
  delete subEnv.LEADERPROJ;
  const r7a = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-hpgate-b.js')],
    { cwd: REPO, env: subEnv, encoding: 'utf8', timeout: 1500000 });
  check('§7 whole-party gate re-runs green (test-hpgate-b.js 43/43)',
    r7a.status === 0 && /43 passed, 0 failed/.test(r7a.stdout || ''), (r7a.stdout || '').split('\n').slice(-2).join(' / '));
  const r7b = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-leaderproj-b.js')],
    { cwd: REPO, env: subEnv, encoding: 'utf8', timeout: 1500000 });
  check('§7 projection gate re-runs green (test-leaderproj-b.js 55/55)',
    r7b.status === 0 && /55 passed, 0 failed/.test(r7b.stdout || ''), (r7b.stdout || '').split('\n').slice(-2).join(' / '));

  console.log('test-gateavoid-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-gateavoid-b FATAL', e && e.stack || e); process.exit(1); });
