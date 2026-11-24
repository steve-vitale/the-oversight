// test-departname-a.js — proof test, arm sim-departname-a.
// Proves the departure-beat naming fix (tracker blank #4; sim-findings
// line 2710): a departure beat named a companion by a generated
// physical description instead of a name — seed 107423 d7, "Sean sets
// out with A person, maybe 40s, with deep-set eyes — the fire marks
// the trail."
//
// ROOT CAUSE: the fireside beats in win-plan.js (departLaunchBeat,
// reseedBeat, expiryBeat, reseedLaunchBeat — plus the homebody
// handoff line in winPlanHomebodyHandoff, a fifth site found while
// staging the proof test) resolved holder/companion names through
// `self.disp` — no such Game method exists, so the check always
// falls through — to `self.displayName(vid)`. displayName is the SCHOLAR's knowledge
// gate: pre-System, or when the scholar has not learned the name, it
// returns personDescriptor(vid) ("A person, maybe 40s, with deep-set
// eyes"). The beats are the VILLAGE's fireside voice announcing its
// own people setting out together — the holder chose these companions
// by name at dawn — so they must name people as the village knows
// them: the true first name (npcName), never the stranger descriptor.
// The fix is one shared module helper, beatName(self, vid), used by
// all four beats; text-only (say() consumes no RNG, writes no state).
//
//   §A code pins (read-only greps).
//   §B staged fixtures — pre-System, holder known / companion unknown
//       (the exact repro shape), holder unknown, trio, post-System
//       control, re-seed launch, dead-target re-seed commit, expiry,
//       calledName preference, nameless record.
//   §C OLD-CODE CONTROL: the same B1 fixture against the pre-change
//       win-plan.js (git show of the branch base tip) must speak the
//       DESCRIPTOR line (fail on old, pass on new).
//   §D negative/compat cases: disp-only ctx (the old departbeat
//       fixture shape) still speaks; no naming function at all falls
//       back to 'Someone', never throws, never 'undefined'.
// Usage: node scripts/test-departname-a.js
//        node scripts/test-departname-a.js --old-code <win-plan.js path>
//        (child mode: runs only the §B1 fixture against the given
//        win-plan.js and prints one JSON line; used by §C.)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
globalThis.Scattering.equipment = {
  armorOf: function (person) { return (person && person._armorP) || 0; },
  weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
};

const OLD_CODE_PATH = (function () {
  const i = process.argv.indexOf('--old-code');
  return i !== -1 ? process.argv[i + 1] : null;
})();
require(OLD_CODE_PATH || path.join(REPO, 'src', 'js', 'win-plan.js'));
if (!OLD_CODE_PATH) require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
const Game = globalThis.Scattering.Game;

const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const RESEED_LAUNCH_RE = /is hunting .* now — the fire found a new trail\./;
const DESCRIPTOR_RE = /A (person|man|woman), maybe \d0s/;
const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'buffering', wave: 3 },
  { id: 'reunion', wave: 4 }, { id: 'editor', wave: 5 }, { id: 'eater', wave: 4 },
  { id: 'audit', wave: 4 }, { id: 'suburb', wave: 4 }, { id: 'bulldozer', wave: 1 },
];
function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : id; }

// People for the repro: Sean (holder, known to the scholar) and Mara
// (companion, unknown pre-System — the repro descriptor is hers
// verbatim) plus Emmett (second companion, unknown). Descriptors are
// the canned personDescriptor strings, exactly as game.js builds them.
function makePeople() {
  return {
    sean_mercer: { id: 'sean_mercer', name: 'Sean Mercer', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A person, maybe 40s, with a gap-toothed grin' },
    mara_voss: { id: 'mara_voss', name: 'Mara Voss', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A person, maybe 40s, with deep-set eyes' },
    emmett_okafor: { id: 'emmett_okafor', name: 'Emmett Okafor', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A man, maybe 20s, with calloused knuckles' },
    ash_kim: { id: 'ash_kim', name: 'Ashley Kim', calledName: 'Ash River', dead: false,
      _armorP: 10, _weaponB: 5, items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A woman, maybe 30s' },
    noname: { id: 'noname', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5], descriptor: 'A person, maybe 50s' },
    // Apostrophe name from nameCultures.json: the sim's band leg
    // surfaced one (seed 107425 d5, holder Chepng'etich). The
    // analyzer's name pattern had to learn this shape; pin it here.
    chepng_korir: { id: 'chepng_korir', name: "Chepng'etich Korir", dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A person, maybe 40s, with a gap-toothed grin' },
  };
}

// beatCtx: the ordinary departure shape (holder Sean, live Herald
// plan, companion Mara), with the REAL naming funnel instead of the
// departbeat test's disp stub: no `disp` property (real Game has
// none), npcName / nameKnown / displayName / personDescriptor
// mirroring game.js. opts: holder (default sean_mercer), known (ids
// the scholar knows — default holder only), systemArrived, target,
// needWave, companion2, slain, killLog, seen, fought, sightings,
// refuse, expired, maxDist (vid -> npcMaxDist).
function beatCtx(o) {
  const opts = o || {};
  const holder = opts.holder || 'sean_mercer';
  const people = makePeople();
  const exped = {};
  const says = [];
  const known = {};
  (opts.known || ['sean_mercer']).forEach(function (id) { known[id] = true; });
  const plan = { stage: (opts.stage || 'party'),
    target: (opts.target === undefined ? 'herald' : opts.target),
    needWave: (opts.needWave == null ? 4 : opts.needWave),
    node: null, party: [], sinceDay: 6, holdSinceDay: -1 };
  if (opts.expired) plan.reseedExpiryDay = 6;
  if (opts.reseedStamp) plan.reseedLaunchBeat = opts.reseedStamp;
  const roster = ['sean_mercer', 'mara_voss', 'emmett_okafor', 'ash_kim', 'noname'];
  const winPlan = {};
  winPlan[holder] = plan;
  const know = {};
  know[holder] = { fought: (opts.fought || []) };
  const sightings = {};
  sightings[holder] = (opts.sightings || []);
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 7 },
      _standingDeferBeat: {},
      villageSlain: (opts.slain == null ? {} : opts.slain),
      waveKillLog: (opts.killLog === undefined ? [] : opts.killLog),
      villageLastSeenDay: (opts.seen === undefined ? { herald: 6 } : opts.seen),
      village: {
        px: 5, py: 5,
        roster: roster,
        trust: { mara_voss: 20, emmett_okafor: 20 },
        away: (opts.away || {}), sick: {}, health: { sean_mercer: 100, mara_voss: 100, emmett_okafor: 100 },
        winPlan: winPlan,
        winPlanStats: null,
        monsterSightings: sightings,
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    // npcName mirrors game.js: bestowed calledName preferred (first
    // token), else the true name's first token, else 'Someone'.
    npcName: function (rid) {
      const vp = people[rid] || null;
      if (vp && vp.calledName) return String(vp.calledName).split(' ')[0];
      return (vp && vp.name) ? String(vp.name).split(' ')[0] : 'Someone';
    },
    nameKnown: function (vid) { return !!known[vid]; },
    personDescriptor: function (vid) {
      const vp = people[vid] || null;
      return (vp && vp.descriptor) ? vp.descriptor : 'A person, maybe 30s';
    },
    // displayName mirrors game.js: own name always; the true name
    // once the System has arrived or the name is known; else the
    // stranger descriptor.
    displayName: function (vid) {
      if (vid && vid === this.villagerId) return this.npcName(vid);
      if (this.state.systemArrived || this.nameKnown(vid)) return this.npcName(vid);
      return this.personDescriptor(vid);
    },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function () { return 'wanderer'; },
    isEngaged: function () { return false; },
    npcMaxDist: function (vid) {
      if (opts.maxDist && opts.maxDist[vid] != null) return opts.maxDist[vid];
      return 3;
    },
    agencyState: function () { return { exped: exped, know: know }; },
    companionRank: function (asker, ids) {
      return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    },
    villagerGearUp: function () { return true; },
    tableActive: function () { return false; },
    waveUnlockReady: function () { return { ready: true, short: [] }; },
    villageKnowsTrick: function () { return true; },
    villagerFightAllies: function () { return []; },
    startExpedition: function (vid, hx, hy, announce, o2) {
      if ((opts.refuse || []).indexOf(vid) !== -1) return;
      exped[vid] = { tx: o2.tx, ty: o2.ty, duration: o2.duration };
    },
    say: function (line) { says.push(String(line)); },
    monsterNoun: function (id) { return cap(id); },
    articlePhrase: function (n) { return n; },
  };
  if (opts.systemArrived) ctx.state.systemArrived = true;
  ctx.winPlanOf = function (vid) { return Game.winPlanOf.call(ctx, vid); };
  ctx.winPlanDepart = function (vid, hx, hy, announce) { return Game.winPlanDepart.call(ctx, vid, hx, hy, announce); };
  ctx.winPlanCommitDeadTarget = function (vid) { return Game.winPlanCommitDeadTarget.call(ctx, vid); };
  if (typeof Game.winPlanReseedLaunchBeat === 'function') {
    ctx.winPlanReseedLaunchBeat = function (vid) { return Game.winPlanReseedLaunchBeat.call(ctx, vid); };
  }
  if (typeof Game.winPlanDepartLaunchBeat === 'function') {
    ctx.winPlanDepartLaunchBeat = function (vid, launched) { return Game.winPlanDepartLaunchBeat.call(ctx, vid, launched); };
  }
  if (typeof Game.winPlanHomebodyHandoff === 'function') {
    ctx.winPlanHomebodyHandoff = function (vid, hx, hy, announce, o2, c, fill) { return Game.winPlanHomebodyHandoff.call(ctx, vid, hx, hy, announce, o2, c, fill); };
  }
  if (typeof Game.vbrainExecuteDepart === 'function') {
    ctx.vbrainCommit = function () {
      return { day: 7, kind: 'EXPEDITION', winPlanAction: 'party_launch',
        companion: 'mara_voss', companion2: (opts.companion2 || null), companion3: null };
    };
    ctx.vbrainExecuteDepart = function (vid, hx, hy, announce) { return Game.vbrainExecuteDepart.call(ctx, vid, hx, hy, announce); };
  }
  return { ctx: ctx, plan: plan, exped: exped, says: says, people: people };
}
function statsOf(ctx) {
  try { return Game.winPlanStats.call(ctx) || {}; } catch (e) { return {}; }
}
function armEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
  delete process.env.DEPARTBEAT;
}
function disarmEnv() { delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2; delete process.env.VETREENGAGE; delete process.env.DEPARTBEAT; }
function departBeatLines(says) { return says.filter(function (l) { return DEPART_BEAT_RE.test(l); }); }

// ---- OLD-CODE CHILD MODE (used by §C) ----
// Runs only the §B1 fixture against the given win-plan.js and prints
// one JSON line: the exact beat line the old code speaks for the
// repro shape (holder known, companion unknown, pre-System).
if (OLD_CODE_PATH) {
  armEnv();
  const f = beatCtx({});
  const spoke = Game.winPlanDepartLaunchBeat.call(f.ctx, 'sean_mercer', ['mara_voss']);
  disarmEnv();
  console.log(JSON.stringify({ spoke: spoke, says: f.says }));
  process.exit(0);
}

// ---- §A CODE PINS (read-only greps) ----
(function sectionA() {
  const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  function fnBody(src, start, end) {
    const a = src.indexOf(start);
    if (a === -1) return null;
    const b = end ? src.indexOf(end, a + start.length) : src.length;
    return b === -1 ? null : src.slice(a, b);
  }
  const helper = fnBody(wpSrc, 'function beatName(self, vid) {', '\n  // reseedBeat');
  check('§A beatName helper exists and prefers the true name (npcName) over the knowledge-gated displayName',
    helper != null && helper.indexOf('npcName') !== -1 &&
    helper.indexOf('npcName') < helper.indexOf('displayName'), null);
  check('§A beatName falls back to displayName, then \'Someone\' (never undefined, never throws)',
    helper != null && helper.indexOf("'Someone'") !== -1 && helper.indexOf('displayName') !== -1, null);
  check('§A beatName is total by construction (try/catch around every resolution)',
    helper != null && (helper.match(/try \{/g) || []).length >= 2, null);
  const depart = fnBody(wpSrc, 'function departLaunchBeat(self, vid, launched, target) {', '\n  // Shared extra-companion scan');
  check('§A departLaunchBeat names holder + companions via beatName (no disp/displayName call left for people)',
    depart != null && depart.indexOf('beatName(self, vid)') !== -1 &&
    depart.indexOf('beatName(self, list[i])') !== -1 &&
    depart.indexOf('self.disp') === -1 && depart.indexOf('displayName') === -1, null);
  const reseed = fnBody(wpSrc, 'function reseedBeat(self, vid, oldType, newType) {', '\n  // expiryBeat');
  check('§A reseedBeat names the holder via beatName',
    reseed != null && reseed.indexOf('beatName(self, vid)') !== -1 &&
    reseed.indexOf('self.disp') === -1 && reseed.indexOf('displayName') === -1, null);
  const expiry = fnBody(wpSrc, 'function expiryBeat(self, vid, oldType) {', '\n  // reseedLaunchBeat');
  check('§A expiryBeat names the holder via beatName',
    expiry != null && expiry.indexOf('beatName(self, vid)') !== -1 &&
    expiry.indexOf('self.disp') === -1 && expiry.indexOf('displayName') === -1, null);
  const rlaunch = fnBody(wpSrc, 'function reseedLaunchBeat(self, vid, newType) {', '\n  // departLaunchBeat');
  check('§A reseedLaunchBeat names the holder via beatName',
    rlaunch != null && rlaunch.indexOf('beatName(self, vid)') !== -1 &&
    rlaunch.indexOf('self.disp') === -1 && rlaunch.indexOf('displayName') === -1, null);
  const handoff = fnBody(wpSrc, 'winPlanHomebodyHandoff(vid, hx, hy, announce, opts, c, fill) {', '\n    // Departure gate for agencyTick.');
  check('§A homebody-handoff line names holder + leader via beatName (fifth site, same defect class)',
    handoff != null && handoff.indexOf('beatName(self, vid)') !== -1 &&
    handoff.indexOf('beatName(self, leader)') !== -1 &&
    handoff.indexOf('self.disp') === -1 && handoff.indexOf('displayName') === -1, null);
  check('§A disp survives only inside beatName (typeof-check + call in the fallback, not one per beat)',
    (wpSrc.match(/self\.disp(?![a-z])/g) || []).length === 2 && helper != null &&
    (helper.match(/self\.disp(?![a-z])/g) || []).length === 2, null);
  check('§A beats stay deterministic (no Math.random in any of the four beat bodies)',
    [depart, reseed, expiry, rlaunch].every(function (b) { return b != null && b.indexOf('Math.random') === -1; }), null);
})();

// ---- §B STAGED NAMING FIXTURES (pre-System, day 7) ----
(function sectionB() {
  // B1: THE REPRO — holder Sean known, companion Mara unknown,
  // pre-System. Old code: "Sean sets out with A person, maybe 40s,
  // with deep-set eyes — the fire marks the trail." Fixed: Mara.
  armEnv();
  const f = beatCtx({});
  const spoke = Game.winPlanDepartLaunchBeat.call(f.ctx, 'sean_mercer', ['mara_voss']);
  const db = departBeatLines(f.says);
  check('§B B1 repro: unknown companion is named Mara, not her descriptor (one line, frozen wording)',
    spoke === true && db.length === 1 &&
    db[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.',
    f.says);
  check('§B B1 repro: no descriptor anywhere in the beat line',
    db.length === 1 && !DESCRIPTOR_RE.test(db[0]), f.says);
  disarmEnv();

  // B2: holder unknown too — the beat names BOTH by true name.
  armEnv();
  const h = beatCtx({ known: [] });
  Game.winPlanDepartLaunchBeat.call(h.ctx, 'sean_mercer', ['mara_voss']);
  const db2 = departBeatLines(h.says);
  check('§B B2 unknown holder is named too (both people, no descriptors)',
    db2.length === 1 && db2[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.' &&
    !DESCRIPTOR_RE.test(db2[0]), h.says);
  disarmEnv();

  // B3: trio — both companions unknown, both named.
  armEnv();
  const t = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(t.ctx, 'sean_mercer', ['mara_voss', 'emmett_okafor']);
  const db3 = departBeatLines(t.says);
  check('§B B3 trio: both unknown companions named (Mara and Emmett, one line)',
    db3.length === 1 && db3[0] === 'Sean sets out with Mara and Emmett after Herald — the fire marks the trail.',
    t.says);
  disarmEnv();

  // B4: post-System control — the names were already shown; the fix
  // changes nothing about the line (SYSTEM prefix included).
  armEnv();
  const k = beatCtx({ systemArrived: true, known: [] });
  Game.winPlanDepartLaunchBeat.call(k.ctx, 'sean_mercer', ['mara_voss']);
  const db4 = departBeatLines(k.says);
  check('§B B4 post-System control: identical line (fix is a no-op once names are known)',
    db4.length === 1 && db4[0] === '📺 SYSTEM: "Sean sets out with Mara after Herald — the fire marks the trail."',
    k.says);
  disarmEnv();

  // B5: re-seed launch beat — stamped plan, holder unknown.
  armEnv();
  const r = beatCtx({ known: [], target: 'eater', reseedStamp: 'eater', seen: { eater: 6 } });
  const spoke5 = Game.winPlanReseedLaunchBeat.call(r.ctx, 'sean_mercer');
  const rb5 = r.says.filter(function (l) { return RESEED_LAUNCH_RE.test(l); });
  check('§B B5 re-seed launch names the unknown holder (Sean is hunting Eater now)',
    spoke5 === true && rb5.length === 1 &&
    rb5[0] === 'Sean is hunting Eater now — the fire found a new trail.' &&
    !DESCRIPTOR_RE.test(rb5[0]), r.says);
  disarmEnv();

  // B6: dead-target re-seed commit — holder unknown, pool has Eater.
  // The commit beat must name the holder, not his descriptor.
  armEnv();
  const c = beatCtx({ known: [], target: 'herald', needWave: 4,
    slain: { herald: 1 },
    killLog: [{ by: 'mara_voss', w: 4, d: 6, mid: 'herald', via: 'agency' }],
    fought: ['eater'], seen: { eater: 6 } });
  const res6 = Game.winPlanCommitDeadTarget.call(c.ctx, 'sean_mercer');
  check('§B B6 dead-target re-seed commit names the unknown holder (Sean was ready to hunt Herald…)',
    res6 === 'reseeded' && c.plan.target === 'eater' && c.says.length === 1 &&
    c.says[0] === 'Sean was ready to hunt Herald — but the fire says that kind is already put down. The hunt turns to Eater instead.' &&
    !DESCRIPTOR_RE.test(c.says[0]), JSON.stringify({ res: res6, target: c.plan.target, says: c.says }));
  disarmEnv();

  // B7: expiry — holder unknown, no rumors anywhere. The expiry
  // beat must name the holder, not his descriptor.
  armEnv();
  const x = beatCtx({ known: [], target: 'herald', needWave: 4,
    slain: { herald: 1 },
    killLog: [{ by: 'mara_voss', w: 4, d: 6, mid: 'herald', via: 'agency' }],
    fought: [], sightings: [], seen: {} });
  const res7 = Game.winPlanCommitDeadTarget.call(x.ctx, 'sean_mercer');
  check('§B B7 expiry names the unknown holder (Sean was ready… called off, no descriptor)',
    res7 === 'expired' && x.plan.target === null && x.says.length === 1 &&
    x.says[0] === 'Sean was ready to hunt Herald — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off.' &&
    !DESCRIPTOR_RE.test(x.says[0]), JSON.stringify({ res: res7, target: x.plan.target, says: x.says }));
  disarmEnv();

  // B8: calledName preference — the beat uses the bestowed use-name,
  // exactly as npcName does (it adds identity, never replaces). The
  // plan is keyed under the holder Ash here, not Sean.
  armEnv();
  const a = beatCtx({ holder: 'ash_kim', known: [] });
  Game.winPlanDepartLaunchBeat.call(a.ctx, 'ash_kim', ['mara_voss']);
  const db8 = departBeatLines(a.says);
  check('§B B8 calledName preferred (Ash, not Ashley) for the holder',
    db8.length === 1 && db8[0] === 'Ash sets out with Mara after Herald — the fire marks the trail.',
    a.says);
  disarmEnv();

  // B9: nameless record — never throws, never renders "undefined".
  armEnv();
  const n = beatCtx({ holder: 'noname', known: [] });
  let threw = false;
  try { Game.winPlanDepartLaunchBeat.call(n.ctx, 'noname', ['mara_voss']); } catch (e) { threw = true; }
  const db9 = departBeatLines(n.says);
  check('§B B9 nameless holder reads as Someone (no throw, no undefined)',
    threw === false && db9.length === 1 &&
    db9[0] === 'Someone sets out with Mara after Herald — the fire marks the trail.',
    JSON.stringify({ threw: threw, says: n.says }));
  disarmEnv();

  // B10: the REAL launch path — winPlanDepart, pre-System, companion
  // unknown. The launch speaks the fixed line once. (The companion
  // pick is Emmett: companionRank orders by id, emmett < mara.)
  armEnv();
  const p = beatCtx({});
  const res10 = Game.winPlanDepart.call(p.ctx, 'sean_mercer', 5, 5, false);
  const db10 = departBeatLines(p.says);
  check('§B B10 real launch path speaks the fixed line (launch, stage hunt, one line, Emmett named)',
    res10 === 'launch' && p.plan.stage === 'hunt' && !!p.exped.emmett_okafor &&
    db10.length === 1 && db10[0] === 'Sean sets out with Emmett after Herald — the fire marks the trail.',
    JSON.stringify({ res: res10, stage: p.plan.stage, says: p.says }));
  disarmEnv();

  // B11: the homebody handoff — a range-0 holder's plan moves to a
  // walkable companion. The handoff line AND the departure beat
  // that follows must name both people, not their descriptors.
  armEnv();
  const hb = beatCtx({ known: [], maxDist: { sean_mercer: 0 } });
  const res11 = Game.winPlanHomebodyHandoff.call(hb.ctx, 'sean_mercer', 5, 5, false,
    { tx: 4, ty: 5, duration: 5 },
    { companion: 'mara_voss', companion2: 'emmett_okafor', companion3: null }, false);
  const db11 = departBeatLines(hb.says);
  check('§B B11 homebody handoff names holder + leader + companion (launch, plan moved, two lines, no descriptors)',
    res11 === 'launch' && hb.says.length === 2 &&
    hb.says[0] === 'Sean never leaves Haven — Mara takes the plan and leads the party.' &&
    db11.length === 1 && db11[0] === 'Mara sets out with Emmett after Herald — the fire marks the trail.' &&
    !DESCRIPTOR_RE.test(hb.says.join(' ')),
    JSON.stringify({ res: res11, says: hb.says }));
  disarmEnv();

  // B12: apostrophe name — a companion whose true first name
  // carries an apostrophe (Chepng'etich, from nameCultures.json)
  // is spoken whole, not truncated and not descriptor-named.
  armEnv();
  const ap = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(ap.ctx, 'sean_mercer', ['chepng_korir']);
  const db12 = departBeatLines(ap.says);
  check('§B B12 apostrophe name spoken whole (Sean sets out with Chepng\'etich, no descriptor)',
    db12.length === 1 && db12[0] === 'Sean sets out with Chepng\'etich after Herald — the fire marks the trail.' &&
    !DESCRIPTOR_RE.test(db12[0]), ap.says);
  disarmEnv();
})();

// ---- §C OLD-CODE CONTROL (fail on old, pass on new) ----
(function sectionC() {
  const { spawnSync, execSync } = require('child_process');
  const os = require('os');
  const tmp = path.join(os.tmpdir(), 'departname-old-win-plan-' + process.pid + '.js');
  try {
    // Pinned to the pre-change commit (the branch base tip):
    // HEAD moves as this arm commits, so HEAD would stop being
    // "old code".
    const oldSrc = execSync('git show 7344d8a56:src/js/win-plan.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(tmp, oldSrc);
  } catch (e) {
    check('§C old-code control: git show 7344d8a56:src/js/win-plan.js readable', false, String(e).slice(0, 200));
    return;
  }
  const r = spawnSync(process.execPath, [__filename, '--old-code', tmp],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  let out = null;
  try { out = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) {}
  check('§C old code speaks the B1 fixture (launch hook fires, one line)',
    !!out && out.spoke === true && (out.says || []).length === 1, out);
  check('§C old code names the companion by her descriptor — the bug this arm fixes (RED on old)',
    !!out && (out.says || []).length === 1 &&
    out.says[0] === 'Sean sets out with A person, maybe 40s, with deep-set eyes after Herald — the fire marks the trail.',
    out ? out.says : r.stdout);
  check('§C new code speaks the same fixture with her name (the §B1 line — the control contrasts, it does not re-run §B)',
    true, null);
  try { fs.rmSync(tmp, { force: true }); } catch (e) {}
})();

// ---- §D NEGATIVE / COMPAT CASES ----
(function sectionD() {
  // D1: disp-only ctx (the old departbeat fixture shape: no npcName,
  // disp stub returns names) — the beat still speaks through the
  // disp fallback, so the older tests keep their exact lines.
  armEnv();
  const f = beatCtx({});
  delete f.ctx.npcName;
  delete f.ctx.displayName;
  delete f.ctx.nameKnown;
  delete f.ctx.personDescriptor;
  f.ctx.disp = function (vid) { return vid === 'sean_mercer' ? 'Sean' : (vid === 'mara_voss' ? 'Mara' : vid); };
  Game.winPlanDepartLaunchBeat.call(f.ctx, 'sean_mercer', ['mara_voss']);
  const db = departBeatLines(f.says);
  check('§D D1 disp-only ctx (no npcName) still speaks via the disp fallback (older fixture shape kept)',
    db.length === 1 && db[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.',
    f.says);
  disarmEnv();

  // D2: no naming function at all — 'Someone', never a throw, never
  // 'undefined'. (Both holder and companion read Someone: with no
  // naming funnel at all, no true name is reachable.)
  armEnv();
  const g = beatCtx({});
  delete g.ctx.npcName;
  delete g.ctx.displayName;
  delete g.ctx.nameKnown;
  delete g.ctx.personDescriptor;
  let threw = false;
  try { Game.winPlanDepartLaunchBeat.call(g.ctx, 'sean_mercer', ['mara_voss']); } catch (e) { threw = true; }
  const db2 = departBeatLines(g.says);
  check('§D D2 no naming function: Someone, no throw, no undefined',
    threw === false && db2.length === 1 &&
    db2[0] === 'Someone sets out with Someone after Herald — the fire marks the trail.' &&
    g.says.join(' ').indexOf('undefined') === -1, JSON.stringify({ threw: threw, says: g.says }));
  disarmEnv();

  // D3: determinism — the same fixture twice speaks byte-identical
  // lines (the beats take no RNG).
  armEnv();
  const h1 = beatCtx({}); Game.winPlanDepartLaunchBeat.call(h1.ctx, 'sean_mercer', ['mara_voss']);
  const h2 = beatCtx({}); Game.winPlanDepartLaunchBeat.call(h2.ctx, 'sean_mercer', ['mara_voss']);
  check('§D D3 same fixture twice: byte-identical lines (no RNG in the beats)',
    h1.says.length === 1 && h1.says[0] === h2.says[0], JSON.stringify({ a: h1.says, b: h2.says }));
  disarmEnv();
})();

console.log('test-departname-a: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
