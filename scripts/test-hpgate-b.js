// test-hpgate-b.js — proof test, arm sim-hpgate-b (finding #2619:
// HP-GATE DOOR PARTIES — the next input from the doorflee2/hypofloor
// line. The evidence: doorflee-b §6 S7 — a third ally entered a door
// at 3 HP (9 HP armed); doorflee2-b §6 S7 — leaders at 26 HP (died
// the next day) and 25 HP (fled round 1); hypofloor-b §4 — a leader
// at 21 HP dying next round while the monster hits 22-25 a round.
// The HPGATE lever refuses a pinned door when any member of the quad
// (leader + all three pinned allies) is below 25 HP — one round of
// focused wave-4 damage — read live at the door-open decision in
// expeditionMonster. When it fires the party gives the monster room
// (the existing avoid verb: no fight, no flee, no death) and the
// agency counter records it for the driver census. The pin gate
// (test-pinquaddoor-b.js 35/35) + damage gate (test-dmgpin-b.js
// 29/29) + staying gate (test-doorflee2-b.js 49/49) + floor gate
// (test-hypofloor-b.js 48/48) are the base gates; this test proves
// the HPGATE avoid on the pinned + damage + hold + floor base.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1a GATE FIRES, HURT LEADER: the same staged geared quad vs a
//     wave-4 monster, leader at 21 HP, staging seed 11 — the party
//     gives the congregation room, fieldFight is NEVER called, the
//     agency counter reads 1, and the expedition note says the
//     leader "is too hurt to hold a door (21 HP)".
//   §1b GATE FIRES, HURT ALLY: leader 100, third ally at 3 HP, seed
//     11 — same avoid, counter 1, note "(3 HP)". The gate covers the
//     WHOLE party, not just the leader — the 3-HP exhibit is an ally.
//   §1c BOUNDARY: leader at 24 HP refuses (counter 1, no fight);
//     leader at exactly 25 HP proceeds (fieldFight called once, the
//     door opens). The floor is strict < 25, as frozen.
//   §2 HEALTHY PROCEEDS: leader 100, allies 100, seed 11 — the door
//     opens (fieldFight called once, allyFromStart true, the pinned
//     trio as allies), counter 0, no gate note. The gate only bites
//     below the floor.
//   §3 INERT WITHOUT THE PIN: PINQUAD unset, hurt leader 21 — the
//     fight proceeds (fieldFight called, counter 0). No pin, no door,
//     no gate.
//   §4 WAVE GATE: wave-1 monster pool, hurt leader 21 — the fight
//     proceeds (counter 0). The gate is a wave-4+ door gate.
//   §5 FLAG OFF: HPGATE unset, hurt leader 21 — the fight proceeds
//     (counter 0, no gate note); and the healthy door fight is
//     byte-identical with the flag on vs off (outcome/rounds/dealt/
//     vTaken equal exactly — the gate draws no RNG and changes
//     nothing when nobody is below the floor).
//   §6 DRIVER SMOKE: the pinquaddoor driver runs one 30d armed seed
//     with HPGATE=1 + HYPOFLOOR=1 + DOORFLEE2=1 + DMGPIN=1, exit 0,
//     0 instrument errors, hpgateFlag '1' + hypofloorFlag '1' +
//     doorflee2Flag '1' + dmgpinFlag '1' + pinquadFlag '1' on the
//     corpus file, hpgateFires a number, and every v4 row carries a
//     numeric doorHold.
//   §7 BASE GATES: test-dmgpin-b.js re-runs green (29/29) and
//     test-downedtwice-b.js re-runs green on this tip.
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party
// is a geared wave-4 hunting party — hide_armor + hunting_spear,
// leader at 100 HP unless the section stages a hurt member — never
// a fresh un-geared scholar. The meeting is staged through
// expeditionMonster itself (the gate's home), with the wave pool
// forced to the section's wave so the meeting is a door monster;
// the monster pick is deterministic per staging seed (seed 11 is
// always the congregation on the wave-4 pool).
// Usage: node scripts/test-hpgate-b.js
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
  check('§0 villager-agency.js carries the HPGATE gate (HPGATE env + _pinDoor + wave >= 4 + pinnedQuadAllies party read)',
    /HPGATE/.test(agSrc) && /_pinDoor/.test(agSrc) && /process\.env\.HPGATE === '1'/.test(agSrc) &&
    /\(m\.wave \| 0\) >= 4/.test(agSrc) && /pinnedQuadAllies\(vid\)/.test(agSrc));
  check('§0 the floor is 25 HP, strict, over the whole party (leader + pinned trio, missing health defaults 100)',
    /if \(_hgHp < 25\)/.test(agSrc) && /\[vid\]\.concat\(this\.pinnedQuadAllies\(vid\) \|\| \[\]\)/.test(agSrc) &&
    /\(_hgHealth\[_hgId\] !== undefined\) \? _hgHealth\[_hgId\] : 100/.test(agSrc));
  check('§0 the gate counts itself (st.hpgateFires increments) and narrates the avoid (encounters note, "too hurt to hold a door")',
    /st\.hpgateFires = \(st\.hpgateFires \| 0\) \+ 1/.test(agSrc) &&
    /is too hurt to hold a door/.test(agSrc) && /encounters\.push\('gave ' /.test(agSrc));
  check('§0 the gate draws no RNG (no RR() inside the HPGATE block)',
    (function () {
      const g = agSrc.indexOf('// HPGATE (sim-hpgate-b, finding #2619): HP-gate door parties.');
      const gEnd = agSrc.indexOf('var rec = this.fieldFight(vid, m, null,', g);
      if (g === -1 || gEnd === -1) return false;
      return agSrc.slice(g, gEnd).indexOf('RR(') === -1;
    })());
  check('§0 off-mode is byte-identical by construction (the whole block needs HPGATE=1 AND a pinned door; _pinDoor is false without PINQUAD)',
    /process\.env\.HPGATE === '1'/.test(agSrc) && /_pinDoor && m &&/.test(agSrc));
})();

// ================= STAGING HELPERS (same pickQuad/gearUp as test-hypofloor-b.js) =================
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
// Stage one geared pinned quad and call expeditionMonster directly —
// the gate's home. wave: the monster pool wave (4 = door monsters,
// 1 = the wave gate). leaderHp / ally3Hp set the staged HPs (other
// allies 100). pin: whether to pin the quad (false = the §3 no-pin
// case; caller unsets PINQUAD first). Caller sets the env first.
// Returns the meeting: fieldFight calls, the gate counter, the
// expedition notes, and the fight record when one happened.
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
  let fires = 0;
  try { fires = (Game.agencyState() || {}).hpgateFires | 0; } catch (e) {}
  let notes = [];
  try { notes = (((Game.agencyState() || {}).exped || {})[q.holder] || {}).encounters || []; } catch (e) {}
  return { ok: true, Game: Game, q: q, pinned: pinned, ffCalls: ffCalls, fires: fires, notes: notes, rec: rec };
}

(async () => {
  process.env.SENSEEXPED = '1'; process.env.PARTYSIZE4 = '1'; process.env.VETREENGAGE = '1';
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1';
  process.env.LAUNCHSURVIVE = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1';
  process.env.HYPOFLOOR = '1'; process.env.HPGATE = '1';

  // ---------- §1a GATE FIRES, HURT LEADER (wave-4, leader 21, seed 11) ----------
  const g1 = await stageMeeting(4, 21, 100, 11, true);
  check('§1a staging: hurt-leader load stages (pinned quad, leader 21, seed 11)', g1.ok, g1.why || g1);
  if (g1.ok) {
    console.log('  [§1a] ffCalls=' + JSON.stringify(g1.ffCalls) + ' fires=' + g1.fires + ' notes=' + JSON.stringify(g1.notes));
    check('§1a the quad pins (pinQuadParty true)', g1.pinned === true, g1.pinned);
    check('§1a the hurt leader never fights (fieldFight never called)', g1.ffCalls.length === 0, g1.ffCalls);
    check('§1a the gate counts itself (hpgateFires 1)', g1.fires === 1, g1.fires);
    check('§1a the avoid is narrated (note names the hurt leader and 21 HP)',
      g1.notes.some(function (n) { return /gave congregation room/.test(n) && /too hurt to hold a door \(21 HP\)/.test(n); }), g1.notes);
  }

  // ---------- §1b GATE FIRES, HURT ALLY (leader 100, ally3 3, seed 11) ----------
  const g2 = await stageMeeting(4, 100, 3, 11, true);
  check('§1b staging: hurt-ally load stages (pinned quad, ally3 3 HP, seed 11)', g2.ok, g2.why || g2);
  if (g2.ok) {
    console.log('  [§1b] ffCalls=' + JSON.stringify(g2.ffCalls) + ' fires=' + g2.fires + ' notes=' + JSON.stringify(g2.notes));
    check('§1b the quad pins (pinQuadParty true)', g2.pinned === true, g2.pinned);
    check('§1b the hurt ally never fights (fieldFight never called)', g2.ffCalls.length === 0, g2.ffCalls);
    check('§1b the gate counts itself (hpgateFires 1)', g2.fires === 1, g2.fires);
    check('§1b the avoid is narrated (note names 3 HP — the gate covers the whole party, not just the leader)',
      g2.notes.some(function (n) { return /gave congregation room/.test(n) && /too hurt to hold a door \(3 HP\)/.test(n); }), g2.notes);
  }

  // ---------- §1c BOUNDARY (leader 24 refuses, leader 25 proceeds) ----------
  const g3 = await stageMeeting(4, 24, 100, 11, true);
  check('§1c staging: leader-24 load stages', g3.ok, g3.why || g3);
  if (g3.ok) {
    check('§1c leader at 24 HP refuses (no fight, counter 1)',
      g3.ffCalls.length === 0 && g3.fires === 1, { ff: g3.ffCalls, fires: g3.fires });
  }
  const g4 = await stageMeeting(4, 25, 100, 11, true);
  check('§1c staging: leader-25 load stages', g4.ok, g4.why || g4);
  if (g4.ok) {
    console.log('  [§1c] leader-25 ffCalls=' + JSON.stringify(g4.ffCalls) + ' fires=' + g4.fires);
    check('§1c leader at exactly 25 HP proceeds (fieldFight called once, counter 0)',
      g4.ffCalls.length === 1 && g4.fires === 0, { ff: g4.ffCalls, fires: g4.fires });
    check('§1c the 25-HP door opens as a door (allyFromStart true, the pinned trio as allies)',
      g4.ffCalls[0] && g4.ffCalls[0].allyFromStart === true && g4.ffCalls[0].allyVids.length === 3, g4.ffCalls[0]);
  }

  // ---------- §2 HEALTHY PROCEEDS (leader 100, seed 11) ----------
  const h1 = await stageMeeting(4, 100, 100, 11, true);
  check('§2 staging: healthy load stages', h1.ok, h1.why || h1);
  if (h1.ok) {
    console.log('  [§2] ffCalls=' + JSON.stringify(h1.ffCalls) + ' fires=' + h1.fires + ' outcome=' + (h1.rec && h1.rec.outcome) + ' rounds=' + (h1.rec && h1.rec.rounds));
    check('§2 the healthy door opens (fieldFight called once, allyFromStart true, pinned trio as allies)',
      h1.ffCalls.length === 1 && h1.ffCalls[0].allyFromStart === true && h1.ffCalls[0].allyVids.length === 3, h1.ffCalls);
    check('§2 the healthy door is the congregation (same monster as the hurt loads — the pick is deterministic per seed)',
      h1.ffCalls[0] && h1.ffCalls[0].mid === 'congregation' && h1.ffCalls[0].wave === 4, h1.ffCalls[0]);
    check('§2 the gate never fires healthy (counter 0, no gate note)',
      h1.fires === 0 && !h1.notes.some(function (n) { return /too hurt to hold a door/.test(n); }), { fires: h1.fires, notes: h1.notes });
  }

  // ---------- §3 INERT WITHOUT THE PIN (PINQUAD unset, hurt leader 21) ----------
  delete process.env.PINQUAD;
  const np = await stageMeeting(4, 21, 100, 11, false);
  check('§3 staging: no-pin load stages (PINQUAD unset)', np.ok, np.why || np);
  if (np.ok) {
    console.log('  [§3] ffCalls=' + JSON.stringify(np.ffCalls) + ' fires=' + np.fires);
    check('§3 pinQuadParty writes nothing with PINQUAD unset (returns false)', np.pinned === false, np.pinned);
    check('§3 without the pin the hurt leader still fights (fieldFight called, counter 0 — no door, no gate)',
      np.ffCalls.length === 1 && np.fires === 0, { ff: np.ffCalls, fires: np.fires });
  }
  process.env.PINQUAD = '1';

  // ---------- §4 WAVE GATE (wave-1 pool, hurt leader 21) ----------
  process.env.HPGATE = '1';
  const w1 = await stageMeeting(1, 21, 100, 11, true);
  check('§4 staging: wave-1 load stages', w1.ok, w1.why || w1);
  if (w1.ok) {
    console.log('  [§4] ffCalls=' + JSON.stringify(w1.ffCalls) + ' fires=' + w1.fires);
    check('§4 the quad pins even at wave 1', w1.pinned === true, w1.pinned);
    check('§4 the wave-1 monster really is wave 1', w1.ffCalls[0] && (w1.ffCalls[0].wave | 0) === 1, w1.ffCalls[0]);
    check('§4 HPGATE holds nothing at wave 1 (fieldFight called, counter 0)',
      w1.ffCalls.length === 1 && w1.fires === 0, { ff: w1.ffCalls, fires: w1.fires });
  }

  // ---------- §5 FLAG OFF (HPGATE unset, hurt leader 21; healthy identity) ----------
  delete process.env.HPGATE;
  const off = await stageMeeting(4, 21, 100, 11, true);
  check('§5 staging: flag-off hurt load stages', off.ok, off.why || off);
  if (off.ok) {
    check('§5 with the flag off the hurt leader fights (fieldFight called, counter 0, no gate note)',
      off.ffCalls.length === 1 && off.fires === 0 && !off.notes.some(function (n) { return /too hurt to hold a door/.test(n); }),
      { ff: off.ffCalls, fires: off.fires, notes: off.notes });
  }
  const offHealthy = await stageMeeting(4, 100, 100, 11, true);
  check('§5 staging: flag-off healthy load stages', offHealthy.ok, offHealthy.why || offHealthy);
  process.env.HPGATE = '1';
  const onHealthy = await stageMeeting(4, 100, 100, 11, true);
  check('§5 staging: flag-on healthy load stages', onHealthy.ok, onHealthy.why || onHealthy);
  if (offHealthy.ok && onHealthy.ok && offHealthy.rec && onHealthy.rec) {
    const so = { outcome: offHealthy.rec.outcome, rounds: offHealthy.rec.rounds, mDealt: offHealthy.rec.mDealt, vTaken: offHealthy.rec.vTaken };
    const sa = { outcome: onHealthy.rec.outcome, rounds: onHealthy.rec.rounds, mDealt: onHealthy.rec.mDealt, vTaken: onHealthy.rec.vTaken };
    console.log('  [§5] flag-off healthy=' + JSON.stringify(so) + ' flag-on healthy=' + JSON.stringify(sa));
    check('§5 the healthy door fight is identical with the flag on vs off (outcome/rounds/dealt/vTaken equal — no RNG drawn, nothing changed)',
      eq(so, sa), { off: so, on: sa });
  }

  // ---------- §6 DRIVER SMOKE (armed leg, direct) ----------
  process.env.ALLYSLOT3 = '1'; process.env.PINQUAD = '1'; process.env.DMGPIN = '1'; process.env.DOORFLEE2 = '1'; process.env.HYPOFLOOR = '1'; process.env.HPGATE = '1';
  const smokeDir = 'perseed-hpgate-b-smoke';
  const smokePath = path.join(REPO, 'evidence', '2026-11-22', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, {
    SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1',
    FIGHTALLY2: '1', LAUNCHSURVIVE: '1', ALLYSLOT3: '1', PINQUAD: '1', DMGPIN: '1', DOORFLEE2: '1', HYPOFLOOR: '1', HPGATE: '1',
    MODE: 'pinquaddoor', DAYS: '30', EVIDENCE_DATE: '2026-11-22', CORPUS_PREFIX: 'hpgate-b',
    SEEDS: '106251', RUN: 'hpgate-b-smoke', OUTDIR: smokeDir });
  const r6 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'pinquaddoor-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§6 driver smoke (direct, armed): exit 0 on one 30d seed', r6.status === 0, (r6.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'hpgate-b-s106251-hpgate-b-smoke-pinquaddoor.json'), 'utf8')); } catch (e) {}
  check('§6 driver smoke: corpus file written, hpgateFlag 1 + hypofloorFlag 1 + doorflee2Flag 1 + dmgpinFlag 1 + pinquadFlag 1 + slotPresent true',
    !!dd && dd.hpgateFlag === '1' && dd.hypofloorFlag === '1' && dd.doorflee2Flag === '1' && dd.dmgpinFlag === '1' && dd.pinquadFlag === '1' && dd.slotPresent === true,
    dd && { hpgateFlag: dd.hpgateFlag, hypofloorFlag: dd.hypofloorFlag, doorflee2Flag: dd.doorflee2Flag, dmgpinFlag: dd.dmgpinFlag, pinquadFlag: dd.pinquadFlag, slotPresent: dd.slotPresent });
  if (dd) {
    check('§6 driver smoke: hpgateFires is a number on the corpus file', typeof dd.hpgateFires === 'number', dd.hpgateFires);
    check('§6 driver smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    const rows = (dd.v4encounters || []);
    check('§6 driver smoke: every v4 row carries a numeric doorHold',
      rows.every(function (r) { return typeof r.doorHold === 'number'; }), { rows: rows.length });
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}

  // ---------- §7 BASE GATES ----------
  const r7a = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-dmgpin-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 600000 });
  check('§7 damage gate re-runs green (test-dmgpin-b.js 29/29)',
    r7a.status === 0 && /29 passed, 0 failed/.test(r7a.stdout || ''), (r7a.stdout || '').split('\n').slice(-2).join(' / '));
  const r7b = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'test-downedtwice-b.js')],
    { cwd: REPO, env: process.env, encoding: 'utf8', timeout: 600000 });
  check('§7 downedtwice regression re-runs green (test-downedtwice-b.js, exit 0)',
    r7b.status === 0, (r7b.stdout || '').split('\n').slice(-3).join(' / ') + ' / ' + (r7b.stderr || '').slice(0, 200));

  console.log('test-hpgate-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('test-hpgate-b FATAL', e && e.stack || e); process.exit(1); });
