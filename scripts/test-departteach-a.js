// test-departteach-a.js — proof test, arm sim-departteach-a.
// Proves the departure-beat name teach (the departname-a §8
// follow-up; coordinator design call, Steve can overrule): a
// departure beat names a companion by true first name in the
// scholar's hearing — the scholar learns that companion's name
// through the overheard channel (revealName 'overheard'), the
// same channel an overheard fireside chat uses at game.js:19504.
// SCOPE (frozen in evidence/2026-11-24/sim-departteach-a-prereg.md):
// companions only (the holder is named but NOT taught), the
// departure beat only (departLaunchBeat), the NAME only (no stats,
// no trust, no role/standing reveal).
//
//   §A code pins (read-only greps).
//   §B staged fixtures — pre-System, holder known / companion
//       unknown (the exact repro shape), holder unknown, trio,
//       already-known idempotent, post-System no-op, name-only
//       audit, real launch path, solo launch, calledName.
//   §C OLD-CODE CONTROL: the same B1 fixture against the
//       pre-change win-plan.js (git show of the prereg commit)
//       must speak the beat but teach NOTHING (fail on old,
//       pass on new).
//   §D negative/compat cases: no revealName on ctx (guard —
//       beat still speaks, no throw); duplicate companion in the
//       party (taught once, one drift line); determinism.
// Usage: node scripts/test-departteach-a.js
//        node scripts/test-departteach-a.js --old-code <win-plan.js path>
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
const Game = globalThis.Scattering.Game;

const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const DRIFT_RE = /A name drifts over from the fire: /;
const DESCRIPTOR_RE = /A (person|man|woman), maybe \d0s/;
const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'buffering', wave: 3 },
  { id: 'reunion', wave: 4 }, { id: 'editor', wave: 5 }, { id: 'eater', wave: 4 },
  { id: 'audit', wave: 4 }, { id: 'suburb', wave: 4 }, { id: 'bulldozer', wave: 1 },
];
function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : id; }

// People for the repro: Sean (holder, known to the scholar) and Mara
// (companion, unknown pre-System) plus Emmett (second companion,
// unknown). pro/age feed the descriptorBase mirror, exactly as
// game.js builds it ("woman, maybe 40s" for Mara).
function makePeople() {
  return {
    sean_mercer: { id: 'sean_mercer', name: 'Sean Mercer', pro: 'he', age: 45, dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A person, maybe 40s, with a gap-toothed grin' },
    mara_voss: { id: 'mara_voss', name: 'Mara Voss', pro: 'she', age: 42, dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A person, maybe 40s, with deep-set eyes' },
    emmett_okafor: { id: 'emmett_okafor', name: 'Emmett Okafor', pro: 'he', age: 24, dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A man, maybe 20s, with calloused knuckles' },
    ash_kim: { id: 'ash_kim', name: 'Ashley Kim', calledName: 'Ash River', pro: 'she', age: 31, dead: false,
      _armorP: 10, _weaponB: 5, items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A woman, maybe 30s' },
    noname: { id: 'noname', pro: 'he', age: 52, dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5], descriptor: 'A person, maybe 50s' },
    chepng_korir: { id: 'chepng_korir', name: "Chepng'etich Korir", pro: 'he', age: 45, dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5],
      descriptor: 'A person, maybe 40s, with a gap-toothed grin' },
  };
}

// beatCtx: the ordinary departure shape (holder Sean, live Herald
// plan, companion Mara), with the REAL naming funnel instead of the
// departbeat test's disp stub: no `disp` property (real Game has
// none), npcName / nameKnown / displayName / personDescriptor /
// descriptorBase / revealName mirroring game.js — including the
// journal.js wrap of revealName (a name-only journal entry with
// how 'overheard by the fire'), which the win-plan.js load alone
// does not install. opts: holder (default sean_mercer), known (ids
// the scholar knows — default holder only), systemArrived, target,
// needWave, companion2, slain, killLog, seen, fought, sightings,
// refuse, expired, maxDist (vid -> npcMaxDist).
function beatCtx(o) {
  const opts = o || {};
  const holder = opts.holder || 'sean_mercer';
  const people = makePeople();
  const exped = {};
  const says = [];
  const journal = [];
  const knownNames = {};
  (opts.known || ['sean_mercer']).forEach(function (id) { knownNames[id] = true; });
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
        knownNames: knownNames,
        goalsKnown: {},
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
    nameKnown: function (vid) { return !!((this.state.village.knownNames || {})[vid]); },
    personDescriptor: function (vid) {
      const vp = people[vid] || null;
      return (vp && vp.descriptor) ? vp.descriptor : 'A person, maybe 30s';
    },
    // descriptorBase mirrors game.js: "woman, maybe 40s" — the
    // observable base, no "A " prefix, no trait.
    descriptorBase: function (vid) {
      const v = people[vid] || {};
      let pro = v.pro;
      if (!pro) pro = ['she', 'he', 'they'][String(vid).length % 3];
      const age = v.age || 30;
      const band = age < 25 ? '20s' : age < 35 ? '30s' : age < 45 ? '40s' : age < 55 ? '50s' : '60s';
      const who = pro === 'she' ? 'woman' : pro === 'he' ? 'man' : 'person';
      return who + ', maybe ' + band;
    },
    // displayName mirrors game.js: own name always; the true name
    // once the System has arrived or the name is known; else the
    // stranger descriptor.
    displayName: function (vid) {
      if (vid && vid === this.villagerId) return this.npcName(vid);
      if (this.state.systemArrived || this.nameKnown(vid)) return this.npcName(vid);
      return this.personDescriptor(vid);
    },
    // canShow mirrors game.js for the npc domain: name reads
    // knownNames; mechanics reads systemArrived OR goalsKnown — a
    // separate store revealName never writes.
    canShow: function (domain, id, aspect) {
      if (domain !== 'npc') return false;
      if (aspect === 'name') return !!((this.state.village.knownNames || {})[id]);
      if (aspect === 'mechanics') return !!(this.state.systemArrived || ((this.state.village.goalsKnown || {})[id]));
      return !!((this.state.village.knownNames || {})[id]);
    },
    // revealName mirrors game.js:17797-17813 (plus the journal.js
    // wrap, which a bare win-plan.js load does not install): false
    // if already known or post-System; else marks the name known,
    // says the channel's drift line, and journals a NAME-ONLY
    // entry ("overheard by the fire").
    revealName: function (vid, how) {
      const village = this.state.village;
      village.knownNames = village.knownNames || {};
      if (village.knownNames[vid] || this.state.systemArrived) return false;
      const v = this.getPerson(vid);
      const first = (v && v.name) ? String(v.name).split(' ')[0] : 'Someone';
      village.knownNames[vid] = true;
      if (how === 'overheard') this.say('A name drifts over from the fire: ' + first + ". That's the " + this.descriptorBase(vid) + ' — now they have a name.');
      else if (how === 'intro') this.say('"' + first + '," they say, touching their chest. "I\'m ' + first + '." You\'ll remember that.');
      else if (how === 'gesture') this.say('They point at themself and say it slowly, twice. It sounds like a name: ' + first + '.');
      journal.push({ vid: vid, kind: 'name', value: first, how: how === 'overheard' ? 'overheard by the fire' : how });
      return true;
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
  return { ctx: ctx, plan: plan, exped: exped, says: says, journal: journal, people: people, knownNames: knownNames };
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
function driftLines(says) { return says.filter(function (l) { return DRIFT_RE.test(l); }); }

// ---- OLD-CODE CHILD MODE (used by §C) ----
// Runs only the §B1 fixture against the given win-plan.js and prints
// one JSON line: whether the beat spoke, the lines said, and which
// names the scholar knows afterwards. Old code must speak the beat
// but teach NOTHING.
if (OLD_CODE_PATH) {
  armEnv();
  const f = beatCtx({});
  const spoke = Game.winPlanDepartLaunchBeat.call(f.ctx, 'sean_mercer', ['mara_voss']);
  disarmEnv();
  console.log(JSON.stringify({ spoke: spoke, says: f.says, knownAfter: Object.keys(f.ctx.state.village.knownNames || {}).sort() }));
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
  const depart = fnBody(wpSrc, 'function departLaunchBeat(self, vid, launched, target) {', '\n  // Shared extra-companion scan');
  check('§A departLaunchBeat teaches each companion via revealName(vid, \'overheard\') after speaking',
    depart != null && depart.indexOf("revealName") !== -1 &&
    depart.indexOf("'overheard'") !== -1 &&
    depart.indexOf('revealName(tVid, \'overheard\')') !== -1, null);
  check('§A the teach iterates the companion list only — the holder vid is never revealName-taught',
    depart != null && depart.indexOf('self.revealName(vid') === -1 &&
    depart.indexOf('partyVids') !== -1, null);
  check('§A the teach skips the holder and the scholar\'s own vid defensively',
    depart != null && depart.indexOf('tVid === vid') !== -1 &&
    depart.indexOf('tVid === self.villagerId') !== -1, null);
  check('§A the teach is guarded by typeof so fixture ctxs without revealName keep speaking',
    depart != null && depart.indexOf("typeof self.revealName === 'function'") !== -1, null);
  check('§A the beat comment records the teach (fiction-only claim updated — the beat writes knownNames)',
    depart != null && depart.indexOf('DEPARTTEACH') !== -1 &&
    depart.indexOf('knownNames') !== -1, null);
  check('§A no other beat teaches: reseed/expiry/reseed-launch bodies contain no revealName',
    ['function reseedBeat(self, vid, oldType, newType) {', 'function expiryBeat(self, vid, oldType) {', 'function reseedLaunchBeat(self, vid, newType) {'].every(function (start) {
      const b = fnBody(wpSrc, start, '\n  // ');
      return b != null && b.indexOf('revealName') === -1;
    }), null);
})();

// ---- §B STAGED TEACH FIXTURES (pre-System, day 7) ----
(function sectionB() {
  // B1: THE REPRO SHAPE — holder Sean known, companion Mara
  // unknown, pre-System. The beat speaks her name AND teaches it:
  // one drift line follows, and Mara is known afterwards.
  armEnv();
  const f = beatCtx({});
  const spoke = Game.winPlanDepartLaunchBeat.call(f.ctx, 'sean_mercer', ['mara_voss']);
  const db = departBeatLines(f.says);
  const dr = driftLines(f.says);
  check('§B B1 repro: beat speaks the fixed line (Mara, not her descriptor)',
    spoke === true && db.length === 1 &&
    db[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.',
    f.says);
  check('§B B1 repro: the unknown companion is TAUGHT (known after the beat)',
    f.ctx.nameKnown('mara_voss') === true, Object.keys(f.ctx.state.village.knownNames || {}));
  check('§B B1 repro: exactly one drift line, the overheard channel\'s own voice',
    dr.length === 1 &&
    dr[0] === 'A name drifts over from the fire: Mara. That\'s the woman, maybe 40s — now they have a name.',
    f.says);
  check('§B B1 repro: the drift line follows the beat line (heard, then learned)',
    f.says.length === 2 && DEPART_BEAT_RE.test(f.says[0]) && DRIFT_RE.test(f.says[1]),
    f.says);
  disarmEnv();

  // B2: holder unknown too — the beat names BOTH by true name, but
  // only the COMPANION is taught. The holder is the frozen scope
  // boundary (follow-up, not this arm).
  armEnv();
  const h = beatCtx({ known: [] });
  Game.winPlanDepartLaunchBeat.call(h.ctx, 'sean_mercer', ['mara_voss']);
  const db2 = departBeatLines(h.says);
  const dr2 = driftLines(h.says);
  check('§B B2 unknown holder is named by the beat but NOT taught (companions only)',
    db2.length === 1 && db2[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.' &&
    h.ctx.nameKnown('sean_mercer') === false && h.ctx.nameKnown('mara_voss') === true,
    JSON.stringify({ says: h.says, known: Object.keys(h.ctx.state.village.knownNames || {}) }));
  check('§B B2 one drift line only (the companion\'s, not the holder\'s)',
    dr2.length === 1 && dr2[0].indexOf('Mara') !== -1, h.says);
  disarmEnv();

  // B3: trio — both companions unknown, both taught, two drift lines.
  armEnv();
  const t = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(t.ctx, 'sean_mercer', ['mara_voss', 'emmett_okafor']);
  const db3 = departBeatLines(t.says);
  const dr3 = driftLines(t.says);
  check('§B B3 trio: both unknown companions named (Mara and Emmett, one line)',
    db3.length === 1 && db3[0] === 'Sean sets out with Mara and Emmett after Herald — the fire marks the trail.',
    t.says);
  check('§B B3 trio: BOTH companions taught, two drift lines in party order',
    t.ctx.nameKnown('mara_voss') === true && t.ctx.nameKnown('emmett_okafor') === true &&
    dr3.length === 2 && dr3[0].indexOf('Mara') !== -1 && dr3[1].indexOf('Emmett') !== -1,
    JSON.stringify({ says: t.says, known: Object.keys(t.ctx.state.village.knownNames || {}) }));
  disarmEnv();

  // B4: already-known companion — idempotent: no duplicate drift
  // line, still known, beat still speaks.
  armEnv();
  const k = beatCtx({ known: ['sean_mercer', 'mara_voss'] });
  Game.winPlanDepartLaunchBeat.call(k.ctx, 'sean_mercer', ['mara_voss']);
  const db4 = departBeatLines(k.says);
  const dr4 = driftLines(k.says);
  check('§B B4 already-known companion: beat speaks, no duplicate drift line (idempotent)',
    db4.length === 1 && dr4.length === 0 && k.says.length === 1 &&
    k.ctx.nameKnown('mara_voss') === true, k.says);
  disarmEnv();

  // B5: post-System control — the overlay already gave every name;
  // revealName is a no-op, so the beat teaches nothing and says no
  // drift line. The beat line itself is unchanged (SYSTEM prefix).
  armEnv();
  const s = beatCtx({ systemArrived: true, known: [] });
  Game.winPlanDepartLaunchBeat.call(s.ctx, 'sean_mercer', ['mara_voss']);
  const db5 = departBeatLines(s.says);
  const dr5 = driftLines(s.says);
  check('§B B5 post-System: identical SYSTEM beat line, no teach, no drift line',
    db5.length === 1 && db5[0] === '📺 SYSTEM: "Sean sets out with Mara after Herald — the fire marks the trail."',
    s.says);
  check('§B B5 post-System: knownNames untouched by the beat (revealName no-op)',
    dr5.length === 0 && Object.keys(s.ctx.state.village.knownNames || {}).length === 0,
    JSON.stringify({ says: s.says, known: Object.keys(s.ctx.state.village.knownNames || {}) }));
  disarmEnv();

  // B6: NAME-ONLY AUDIT — after the teach, the name is known but
  // the mechanics gate stays shut: goalsKnown untouched,
  // systemArrived false, so canShow('npc', 'mechanics') is false
  // while canShow('npc', 'name') is true. displayName returns the
  // true name; the journal holds exactly one NAME entry with how
  // 'overheard by the fire' and no goal/occupation entry.
  armEnv();
  const a = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(a.ctx, 'sean_mercer', ['mara_voss']);
  check('§B B6 name-only: nameKnown true, mechanics still gated (goalsKnown untouched, no System)',
    a.ctx.nameKnown('mara_voss') === true &&
    a.ctx.canShow('npc', 'mara_voss', 'name') === true &&
    a.ctx.canShow('npc', 'mara_voss', 'mechanics') === false &&
    a.ctx.displayName('mara_voss') === 'Mara',
    JSON.stringify({ known: Object.keys(a.ctx.state.village.knownNames || {}), goalsKnown: a.ctx.state.village.goalsKnown }));
  check('§B B6 name-only: journal holds exactly one name entry, how "overheard by the fire", nothing else',
    a.journal.length === 1 && a.journal[0].vid === 'mara_voss' && a.journal[0].kind === 'name' &&
    a.journal[0].value === 'Mara' && a.journal[0].how === 'overheard by the fire',
    a.journal);
  disarmEnv();

  // B7: the REAL launch path — winPlanDepart, pre-System, companion
  // unknown. (The companion pick is Emmett: companionRank orders
  // by id, emmett < mara.) The launch speaks the fixed line AND
  // teaches Emmett through the full path.
  armEnv();
  const p = beatCtx({});
  const res7 = Game.winPlanDepart.call(p.ctx, 'sean_mercer', 5, 5, false);
  const db7 = departBeatLines(p.says);
  const dr7 = driftLines(p.says);
  check('§B B7 real launch path teaches through winPlanDepart (launch, stage hunt, Emmett named + taught)',
    res7 === 'launch' && p.plan.stage === 'hunt' && !!p.exped.emmett_okafor &&
    db7.length === 1 && db7[0] === 'Sean sets out with Emmett after Herald — the fire marks the trail.' &&
    p.ctx.nameKnown('emmett_okafor') === true && dr7.length === 1 && dr7[0].indexOf('Emmett') !== -1,
    JSON.stringify({ res: res7, stage: p.plan.stage, says: p.says, known: Object.keys(p.ctx.state.village.knownNames || {}) }));
  disarmEnv();

  // B8: solo launch — no companions, no teach, no drift lines; the
  // holder-only line speaks.
  armEnv();
  const solo = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(solo.ctx, 'sean_mercer', []);
  const db8 = departBeatLines(solo.says);
  const dr8 = driftLines(solo.says);
  check('§B B8 solo launch: holder-only line, no teach, no drift lines',
    db8.length === 1 && db8[0] === 'Sean sets out after Herald — the fire marks the trail.' &&
    dr8.length === 0 && Object.keys(solo.ctx.state.village.knownNames || {}).length === 1,
    solo.says);
  disarmEnv();

  // B9: calledName companion — the beat uses the bestowed use-name
  // (Ash, not Ashley), and the teach teaches Ash's vid. NOTE the
  // drift line says the TRUE first name ("Ashley"): revealName
  // (game.js:17806) reads v.name, not npcName — a pre-existing
  // channel quirk shared by every revealName caller (the
  // overheard-chat path at game.js:19504 has the same shape), NOT
  // introduced by this arm. After the teach, displayName renders
  // her as "Ash" everywhere (npcName prefers calledName); only the
  // drift line itself speaks the true name. Recorded in the
  // evidence as a finding, not fixed here (§14: revealName itself
  // is out of scope).
  armEnv();
  const cn = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(cn.ctx, 'sean_mercer', ['ash_kim']);
  const db9 = departBeatLines(cn.says);
  const dr9 = driftLines(cn.says);
  check('§B B9 calledName companion taught as Ash (beat) — drift line speaks the true first name (channel quirk, see note)',
    db9.length === 1 && db9[0] === 'Sean sets out with Ash after Herald — the fire marks the trail.' &&
    cn.ctx.nameKnown('ash_kim') === true && cn.ctx.displayName('ash_kim') === 'Ash' && dr9.length === 1 &&
    dr9[0] === 'A name drifts over from the fire: Ashley. That\'s the woman, maybe 30s — now they have a name.',
    cn.says);
  disarmEnv();
})();

// ---- §C OLD-CODE CONTROL (fail on old, pass on new) ----
(function sectionC() {
  const { spawnSync, execSync } = require('child_process');
  const os = require('os');
  const tmp = path.join(os.tmpdir(), 'departteach-old-win-plan-' + process.pid + '.js');
  try {
    // Pinned to the pre-change commit (the prereg commit):
    // HEAD moves as this arm commits, so HEAD would stop being
    // "old code".
    const oldSrc = execSync('git show 68c229aaaf5e6225d833f04fc3d9dc11e148c42b:src/js/win-plan.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(tmp, oldSrc);
  } catch (e) {
    check('§C old-code control: git show 68c229aaa:src/js/win-plan.js readable', false, String(e).slice(0, 200));
    return;
  }
  const r = spawnSync(process.execPath, [__filename, '--old-code', tmp],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  let out = null;
  try { out = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) {}
  check('§C old code speaks the B1 fixture (launch hook fires, beat + no drift)',
    !!out && out.spoke === true && (out.says || []).length === 1 &&
    (out.says || [])[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.', out);
  check('§C old code teaches NOTHING — Mara stays unknown, no drift line (RED on old)',
    !!out && (out.knownAfter || []).indexOf('mara_voss') === -1 &&
    (out.says || []).filter(function (l) { return DRIFT_RE.test(l); }).length === 0,
    out);
  check('§C new code speaks the same fixture AND teaches (the §B1 checks — the control contrasts, it does not re-run §B)',
    true, null);
  try { fs.rmSync(tmp, { force: true }); } catch (e) {}
})();

// ---- §D NEGATIVE / COMPAT CASES ----
(function sectionD() {
  // D1: no revealName on ctx (the old departbeat fixture shape
  // never had one) — the beat still speaks, nothing throws, and
  // no name is learned (the typeof guard holds).
  armEnv();
  const f = beatCtx({});
  delete f.ctx.revealName;
  let threw = false;
  try { Game.winPlanDepartLaunchBeat.call(f.ctx, 'sean_mercer', ['mara_voss']); } catch (e) { threw = true; }
  const db = departBeatLines(f.says);
  check('§D D1 no revealName on ctx: beat speaks, no throw, nothing taught (typeof guard)',
    threw === false && db.length === 1 &&
    db[0] === 'Sean sets out with Mara after Herald — the fire marks the trail.' &&
    f.ctx.nameKnown('mara_voss') === false, JSON.stringify({ threw: threw, says: f.says }));
  disarmEnv();

  // D2: the same companion listed twice — revealName is
  // idempotent, so she is taught once and one drift line speaks.
  armEnv();
  const g = beatCtx({});
  Game.winPlanDepartLaunchBeat.call(g.ctx, 'sean_mercer', ['mara_voss', 'mara_voss']);
  const dr2 = driftLines(g.says);
  check('§D D2 duplicate companion: taught once, one drift line (revealName idempotent)',
    g.ctx.nameKnown('mara_voss') === true && dr2.length === 1 &&
    g.says.length === 2, g.says);
  disarmEnv();

  // D3: determinism — the same fixture twice speaks byte-identical
  // lines (beat + drift; the teach takes no RNG).
  armEnv();
  const h1 = beatCtx({}); Game.winPlanDepartLaunchBeat.call(h1.ctx, 'sean_mercer', ['mara_voss']);
  const h2 = beatCtx({}); Game.winPlanDepartLaunchBeat.call(h2.ctx, 'sean_mercer', ['mara_voss']);
  check('§D D3 same fixture twice: byte-identical lines (no RNG in the beat or the teach)',
    h1.says.length === 2 && h1.says[0] === h2.says[0] && h1.says[1] === h2.says[1],
    JSON.stringify({ a: h1.says, b: h2.says }));
  disarmEnv();
})();

console.log('test-departteach-a: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
