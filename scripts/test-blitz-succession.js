#!/usr/bin/env node
// Proof: blitz-succession (2026-10-13) — three social-systems changes.
//
//   TASK 1 — mantle trust inheritance: late-chain bearers inherited ~zero
//     trust (0.6x compounded every death). New mechanism: the village
//     remembers the OFFICE through three earned channels — office residue
//     (40% of the dead bearer's trust entry), elders' vouching (living
//     villagers with trust >= 60 vouch +4 each, capped +16), and the
//     successor's own record (their trust entry as a villager, 40%).
//     Floor 10 (a hearing); the person earns the rest. (code: ledger.js
//     playerDeath, MANTLE TRUST INHERITANCE)
//   TASK 2 — promise decay (Steve's exact spec): the broken-promise refusal
//     never decayed. Now it lifts after D = clamp(round(20*trustAtBreak/50),
//     7, 60) days, where trustAtBreak is the trust level at the break.
//     Amends still reopen immediately (unchanged). (code: game.js
//     promiseDecayDays / checkPromises / promiseHelp)
//   TASK 3 — moot quorum (Steve's exact spec): binding moots need MORE THAN
//     HALF of living villagers present. Below quorum the moot meets and
//     talks, but verdicts are advisory only — no binding exile/conviction.
//     (code: betrayal.js mootQuorum / conductTrial / finishTrial)
//
// RED-VERIFIED: PRISTINE=1 loads the three touched files from HEAD (git show)
//   instead of the worktree — every assertion below must FAIL there and PASS
//   on the worktree. Run: node scripts/test-blitz-succession.js
//          PRISTINE=1 node scripts/test-blitz-succession.js   (SEED override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PRISTINE = process.env.PRISTINE === '1';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- seeded RNG (modules capture Math.random at load) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '20261013', 10);
Math.random = mulberry32(SEED);

// ---------- boot the full engine ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
const PRISTINE_FILES = new Set(['src/js/game.js', 'src/js/ledger.js', 'src/js/betrayal.js']);
function readSrc(f) {
  if (PRISTINE && PRISTINE_FILES.has(f)) return execSync('git show HEAD:' + f, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();
  return fs.readFileSync(path.join(ROOT, f), 'utf8');
}
global.window = global; // stub for eval; deleted before play (sync combat path)
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
// in-memory localStorage: Game.save runs for real, never stubbed.
global.localStorage = {
  _s: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._s, k) ? this._s[k] : null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; },
};
order.forEach(f => { eval(readSrc(f)); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
console.log((PRISTINE ? '[PRISTINE run — HEAD versions of game.js/ledger.js/betrayal.js]' : '[worktree run]') + ' seed ' + SEED + ', ' + order.length + ' modules');

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const said = [];
  Game.say = (m) => { said.push(String(m)); };
  const S = () => Game.state.scholar;
  const V = () => Game.state.village;

  // ================= TASK 1: mantle trust inheritance =================
  console.log('\n[mantle] late-chain bearer inherits non-zero trust via the three channels');
  {
    const v = V();
    const me = Game.villagerId;
    const npcs = Game.npcIds();
    // simulate a late chain: the office's own entry decayed to 0, but the
    // villagers' trust in the office survives (their entries are untouched
    // by succession). Old rule: newId gets round(0 * 0.6) = 0 — bankrupt.
    v.trust = v.trust || {};
    v.trust[me] = 0;
    for (const id of npcs) v.trust[id] = 70;
    Game.playerDeath('the test wilds');
    const newId = Game.villagerId;
    const voucherCount = Game.npcIds().filter(id => (v.trust[id] || 0) >= 60).length;
    const expected = Math.max(10, Math.min(100, Math.round(0 * 0.4 + 70 * 0.4 + Math.min(16, voucherCount * 4))));
    ok(newId !== me, 'mantle passed to a new bearer');
    ok(v.trust[newId] > 0, 'new bearer inherits non-zero trust (late chain)', 'got ' + v.trust[newId]);
    ok(v.trust[newId] === expected, 'inheritance equals the three-channel formula', 'got ' + v.trust[newId] + ', expected ' + expected);
    // the floor: nobody trusts anyone — the office still gets a hearing
    v.trust[newId] = 0;
    for (const id of Game.npcIds()) v.trust[id] = 0;
    const me2 = Game.villagerId;
    Game.playerDeath('the test wilds again');
    ok(V().trust[Game.villagerId] >= 10, 'floor: a hearing even when the village trusts no one', 'got ' + V().trust[Game.villagerId]);
    ok(Game.villagerId !== me2, 'mantle passed again');
  }

  // ================= TASK 2: promise decay =================
  console.log('\n[promise] decay formula — Steve\'s exact spec: D = clamp(round(20*t/50), 7, 60)');
  {
    const d = (t) => (typeof Game.promiseDecayDays === 'function') ? Game.promiseDecayDays(t) : NaN;
    ok(d(10) === 7, 'trustAtBreak 10 -> 7 days (low clamp edge)');
    ok(d(0) === 7, 'trustAtBreak 0 -> 7 days (low clamp holds)');
    ok(d(50) === 20, 'trustAtBreak 50 -> 20 days');
    ok(d(100) === 40, 'trustAtBreak 100 -> 40 days');
    ok(d(150) === 60, 'trustAtBreak 150 -> 60 days (high clamp edge)');
    ok(d(null) === 7, 'missing trustAtBreak (legacy memory) -> 7 days');
  }
  console.log('\n[promise] refusal decays after exactly D days; amends reopen immediately');
  {
    const v = V();
    const vid = Game.npcIds()[0];
    // keepable goal, set on the data record itself: npcGoal reads data first,
    // bgGoals only as a fallback — the data goal must be the keepable one.
    Game.data.villagers.find(x => x.id === vid).goal = 'feed'; // kind 'food'
    v.trust = v.trust || {};
    const day0 = S().day;
    const p1 = Game.promiseHelp(vid);
    ok(p1 && p1.ok, 'promise made (keepable goal)');
    // pin the pre-break trust: the spec's trustAtBreak is the standing at the
    // moment of the break, whatever the promise's own +6 did before it.
    v.trust[vid] = 50;
    // break it: 8 days pass, a non-matching keep kind rots it
    S().day = day0 + 8;
    Game.checkPromises('fight', null); // 'feed' keeps on 'food'; 'fight' lets it rot
    const mem = (v.memory[vid] || []).filter(m => m.t === 'promise_broken').pop();
    ok(!!mem, 'promise broke after 8 days ignored');
    ok(mem && mem.trustAtBreak === 50, 'trustAtBreak stamped at the break (50)', 'got ' + (mem && mem.trustAtBreak));
    const D = 20, breakDay = mem ? mem.day : day0 + 8;
    // refusal holds at D-1
    S().day = breakDay + D - 1;
    const r1 = Game.promiseHelp(vid);
    ok(r1 === null, 'refusal still holds at D-1 days (' + (D - 1) + ' of ' + D + ')');
    // lifts at exactly D
    S().day = breakDay + D;
    const r2 = Game.promiseHelp(vid);
    ok(r2 && r2.ok, 'refusal lifts at exactly D days (' + D + ')');
    // amends reopen immediately: break the new promise, make amends, promise again same day
    S().day = breakDay + D + 8;
    Game.checkPromises('fight', null);
    v.rep = v.rep || {};
    v.rep[vid] = { generous: -20, brave: 0, honest: 0, competent: 0 };
    const am = Game.makeAmends(vid);
    ok(am && am.ok, 'amends made for real');
    const r3 = Game.promiseHelp(vid);
    ok(r3 && r3.ok, 'amends reopen the promise path immediately (same day)');
  }

  // ================= TASK 3: moot quorum =================
  console.log('\n[moot] quorum: >50% present binds; below quorum is advisory only');
  {
    const v = V();
    const haveQ = typeof Game.mootQuorum === 'function';
    ok(haveQ, 'mootQuorum helper exists');
    const mkCase = (id, accusedId, presentIds, guiltyVotes) => {
      const c = {
        id, charge: 'murder', day: S().day,
        accused: [accusedId], target: null, accuser: Game.npcIds().find(x => x !== accusedId),
        belief: {}, evidence: [], bribes: [], exposedBribes: [],
        status: 'open', flipped: null,
      };
      for (const x of Game.npcIds()) if (x !== accusedId) c.belief[x] = -50; // guilty
      c.trial = { present: presentIds, votes: [], guilty: guiltyVotes, playerVoter: false, day: S().day };
      Game.betrayalState().cases.push(c);
      return c;
    };
    if (!haveQ) {
      ok(false, 'below-quorum convicted moot renders advisory (skipped: no helper)');
      ok(false, 'no binding exile fires below quorum (skipped: no helper)');
      ok(false, 'quorate convicted moot renders a binding verdict (skipped: no helper)');
    } else {
      // --- below quorum: convicted -> advisory only, no exile ---
      const accused = Game.npcIds()[0];
      const few = Game.npcIds().filter(id => id !== accused).slice(0, 2);
      const c1 = mkCase('q_case_1', accused, few, 99);
      const q1 = Game.mootQuorum(c1);
      ok(!q1.quorum, 'thin moot is below quorum', 'present ' + q1.present + ' of ' + q1.living + ' living');
      const saidBefore = said.length;
      const res1 = Game.finishTrial(c1, 0);
      ok(res1 && res1.advisory === true, 'below-quorum verdict returns advisory');
      ok(c1.status === 'advisory' && c1.resolution === 'advisory_guilty', 'verdict marked advisory_guilty, not resolved', c1.status + '/' + c1.resolution);
      ok(v.roster.includes(accused), 'no binding exile fired below quorum (accused still in roster)');
      ok(said.slice(saidBefore).join('\n').includes('ADVISORY'), 'fiction marks the verdict advisory');
      // --- quorate: convicted -> binding verdict (exile carried out) ---
      const accused2 = Game.npcIds().find(id => id !== accused);
      const many = Game.npcIds().filter(id => id !== accused2);
      const c2 = mkCase('q_case_2', accused2, many, 99);
      const q2 = Game.mootQuorum(c2);
      ok(q2.quorum, 'full moot has quorum', 'present ' + q2.present + ' of ' + q2.living + ' living');
      Game.finishTrial(c2, 0);
      ok(c2.resolution === 'exile', 'quorate guilty verdict binds: exile sentenced', 'got ' + c2.resolution);
      ok(!v.roster.includes(accused2), 'binding exile carried out (accused removed from roster)');
      // --- below-quorum acquittal is advisory too, not a clearing ---
      const accused3 = Game.npcIds().find(id => id !== accused && id !== accused2);
      const c3 = mkCase('q_case_3', accused3, few, 0);
      for (const x of Game.npcIds()) if (x !== accused3) c3.belief[x] = 50; // acquit
      const q3 = Game.mootQuorum(c3);
      ok(!q3.quorum, 'thin moot (acquit) is below quorum');
      const res3 = Game.finishTrial(c3, 0);
      ok(res3 && res3.advisory === true && c3.resolution === 'advisory_acquit', 'below-quorum acquittal is advisory, not a clearing', c3.resolution);
      ok(v.roster.includes(accused3), 'advisory acquittal binds nothing (accused untouched)');
    }
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed' + (PRISTINE ? ' [PRISTINE]' : ''));
  if (failures.length) { console.log('failures:'); for (const f of failures) console.log('  - ' + f); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
