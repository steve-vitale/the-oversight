#!/usr/bin/env node
// deathcensus-instrument-20261021.js — autopsy-grade death census instrument
// for sim-deathcensus-b (flesh-out loop B, run fleshout-loop-b-20261021T1856Z).
//
// DIAGNOSTIC ONLY. Pure reads + call-through wraps, zero game-state writes,
// zero RNG draws, zero src/js changes, zero policy changes. Built to answer
// sim-findings #760: "AUTOPSY-GRADE SWEEPS MUST PERSIST DEATH ROWS" — the
// s64847 autopsy failed because the sweep writer kept only cause-count
// aggregates. This instrument persists, per run:
//
//   1. DEATH ROWS (one JSON object per death, captured live at registerDeath
//      post-call): {day, who, vid, kind, cause, player, monsterId,
//      monsterName, wave, occupationId, occupation}. Reuses the registerDeath
//      wrap pattern of scripts/villdeath-census-20261013.js; the tele('death')
//      record's player-flag repair (corpses.js TELEFLAG) is mirrored: a
//      no-op'd double registration carrying player:true repairs the already
//      captured row instead of adding one.
//   2. DAILY VILLAGE SERIES (dawn, in the Game.sleep wrap AFTER the engine's
//      call returns — same phase as the dissolvetax dawn sensor): {day, pop,
//      pantryKcal, feastKcalOut, trimKcal, tributeKcal, linkTrust, nationalLive,
//      nationalShape, waveUnlocked}. linkTrust/nationalLive come from the
//      REQUIRED dissolvetax instrument (K.census rows); the rest is read here.
//        - feastKcalOut: rep.spent on Game.hostFeast's ok report (engine's
//          own real-drawn kcal, game.js hostFeast return).
//        - trimKcal: the engine's own SURPLUSFEED trim telemetry
//          (v._surplusFeed.days[day].kcal, game.js surplusFeedGovernor) —
//          pure read; 0 on substrates where the governor is off.
//        - tributeKcal: real kcal from Game.payTribute / Game.tendLink
//          return values, accumulated per game day (same read as
//          feastscale's trackTribute — call-through double-wrap is safe).
//   3. THE VILLAGE-LOST TRIGGER BEAT, verbatim: the say corpus (all lines,
//      with day) plus the mechanical trigger site, read at finalize:
//        - v.scattered            -> scattering path (game.js, hungry-days limit)
//        - v.extinct              -> extinction path (game.js, no living persons)
//        - lineage outcome
//          'village-lost'         -> succession path (ledger.js, no successor)
//        The beat line is SELECTED from the engine's own say strings (loose
//      patterns); the file stores the verbatim line, never a template.
//   4. classifyDeath(row, monsterIndex): EVERY death to a named proximate
//      cause. Taxonomy (brief-bound):
//        starvation | dehydration | combat-<monsterId> | sickness-<disease> |
//        wound | raid | contest | other:<raw-cause>
//      'unexplained' is reserved for instrument failure (missing fields or a
//      classification crash) and must be 0. combat-<monsterId> resolves via
//      (a) monsterId/monsterName captured on the registerDeath opts, (b) the
//      tb fight's monster fighters scanned read-only at death time (the scan
//      runs even on ENDED fights — tbEnd('lost') precedes ledger.js
//      playerDeath -> registerDeath), (c) the cause string matched against
//      the monster roster (villager-agency passes the monster's display name
//      AS the cause). A combat-family cause with no resolvable monster is
//      'combat-unknown' (named, not unexplained). The death venue
//      (state.arenaContest/activeContest -> 'contest') separates arena
//      deaths arriving as playerDeath('combat') (game.js:42703) from wild
//      fights.
//      Cause families are code-grounded (see the vocabulary comment below).
//   5. attributeVillageLost(K2): {site, sayDay, beat} for the run's loss.
//
// CAUSE VOCABULARY (code-grounded, from registerDeath call sites, 2026-10-21):
//   starvation family: 'starvation', 'hunger' (game.js nonviolent list)
//   dehydration family: 'thirst' (game.js:29768 villager), 'dehydration'
//     (corpus-observed; kept — the classifier must handle what the corpus
//     actually contains, not just what today's grep finds)
//   wound family: 'a wound that wouldn't close' (game.js:26818),
//     'injuries' (game.js:7695 default), 'festering' (corpus-observed wound-fever)
//   sickness family: disease names routed through hurtVillager lethal
//     (game.js:29960 'DEATH-CAUSE HONESTY': 'sickness' or the named disease),
//     'the trembles', 'lockjaw' (statusEffects playerDeath), gutrot/
//     wound_fever/trichinosis/tick fever/gut rot (convoTopics.js:516 census
//     regex — the same vocabulary the game's own census uses)
//   combat family with monster identity: monster NAME as cause
//     (villager-agency.js:468 expedDeath), 'split-fight: <mname>'
//     (party-formal.js:565)
//   combat family without monster identity: 'combat' (tbDamage game.js:36025+,
//     statusEffects.js:377), 'villager combat' (game.js:19192 — MONSTER kind,
//     excluded from person rows), 'patrol combat'/'sortie combat' (MONSTER
//     kind), 'expedition' (villager-mapmem — MONSTER kind), 'monster'
//   raid family: 'raid' (hierarchy.js:3455), 'raid-defense'
//     (villageAgency.js:1274)
//   alien/other: 'alien', 'alien_beam' (alienPlayers.js), 'the phoenix link'
//     (+ broken/released/ash variants, game.js:43469+) — alien artifact,
//     classified 'other: alien-<...>'
//   contest family: no registerDeath call sites in contestEngine.js/contests.js
//     on current master — the class exists in the taxonomy for the corpus;
//     expected 0; contest-arena deaths arrive via 'combat' with the fight
//     venue (honest: classified combat-<monster> with a contest note when the
//     day's fight census says arena — NOT wired here; see honest-scope note).
//   player vessel: ledger.js playerDeath -> registerDeath kind 'villager'
//     with player:true, cause 'the wild' default or the real cause.
//   NOTE on kind: 'monster'/'animal' registerDeath records are MONSTER deaths
//     (game.js:7507/19192/42279, havenGrowth.js:759, villager-mapmem.js:219,
//     app.js:19778) — they are NOT village deaths. The instrument records
//     them (kind preserved) for the harness-reconcile, but classifyDeath and
//     the census analyzer only attribute person kinds ('person','villager').
//
// DET-GATE: all wraps are call-through with pure reads in the gaps — the
// instrumented trajectory must be byte-identical to pristine (proven by
// scripts/test-deathcensus-b.js).
//
// Usage (same env as the sweep):
//   const DC = require('./deathcensus-instrument-20261021');
//   const { K, uninstall } = DC.install(Game);
//   ... runDays ...
//   const out = DC.finalize(Game, K); uninstall();
//   DC.classifyDeath(row, DC.monsterIndex(Game))
'use strict';

var DT = require('./dissolvetax-instrument-20261021');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pantryKcal(Game) {
  try {
    return (((Game.state || {}).village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

// Living population — the engine's own extinction-check filter (game.js),
// read-only: canonical people, matching identity, not dead.
function livingPop(Game) {
  try {
    var v = (Game.state || {}).village || {};
    var roster = v.roster || [];
    var n = 0;
    for (var i = 0; i < roster.length; i++) {
      var id = roster[i]; if (!id) continue;
      var c = null;
      try { c = Game.vpOf ? Game.vpOf(id) : null; } catch (e) {}
      if (c && c.id === id && !c.dead && c.alive !== false) n++;
    }
    return n;
  } catch (e) { return -1; }
}

function occupationOf(Game, vid) {
  var out = { occupationId: null, occupation: null };
  if (!vid) return out;
  try {
    var p = null;
    try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
    if (!p) { try { p = Game.vpOf ? Game.vpOf(vid) : null; } catch (e2) {} }
    if (!p) return out;
    var oid = p.occupationId || p.occupation || null;
    out.occupationId = oid;
    if (oid) {
      try {
        var occs = (((Game.data || {}).characterGen || {}).occupations) || [];
        for (var i = 0; i < occs.length; i++) {
          if (occs[i] && (occs[i].id === oid || occs[i].name === oid)) { out.occupation = occs[i].name || oid; break; }
        }
        if (!out.occupation) out.occupation = String(oid);
      } catch (e) { out.occupation = String(oid); }
    }
    return out;
  } catch (e) { return out; }
}

function trimKcalDay(Game, day) {
  // The engine's own SURPLUSFEED trim telemetry (game.js surplusFeedGovernor):
  // vv._surplusFeed.days[day] = {trim, kcal}. Pure read; 0 when off/unset.
  try {
    var vv = ((Game.state || {}).village) || {};
    var sf = vv._surplusFeed;
    if (sf && sf.days && sf.days[day]) return Math.round(sf.days[day].kcal || 0);
    return 0;
  } catch (e) { return 0; }
}

function liveFightMonster(Game) {
  // Read-only scan of the tb fight's monster fighters. NOTE: tbEnd('lost')
  // runs BEFORE ledger.js playerDeath -> registerDeath (game.js tbEndCheck),
  // so at death time the fight is usually OVER — the fighters array (with
  // mdefs) still persists. Scan regardless of f.over; prefer a live monster,
  // fall back to any monster fighter that was in the fight.
  try {
    var f = Game.tbfight;
    if (!f || !f.fighters) return null;
    var fallback = null;
    for (var i = 0; i < f.fighters.length; i++) {
      var t = f.fighters[i];
      if (!t) continue;
      if (t.kind !== 'monster' && t.kind !== 'hostile') continue;
      var mid = (t.mdef && t.mdef.id) || t.monsterId || null;
      var mname = (t.mdef && (t.mdef.name || t.mdef.id)) || t.name || null;
      if (!mid && !mname) continue;
      var wave = (t.mdef && t.mdef.wave) || null;
      var rec = { id: mid, name: mname, wave: wave };
      if (t.alive && !t.fled) return rec;
      if (!fallback) fallback = rec;
    }
    return fallback;
  } catch (e) { return null; }
}

function deathVenue(Game) {
  // 'contest' when the death lands inside an arena/contest routing
  // (game.js:42703 arena deaths arrive as playerDeath('combat') with
  // state.arenaContest set). Pure read.
  try {
    var st = Game.state || {};
    if (st.arenaContest || st.activeContest) return 'contest';
    return null;
  } catch (e) { return null; }
}

function monsterIndex(Game) {
  // id -> {id,name,wave}; nameLower -> id. Covers data ids + data names +
  // villageNames (the names villagers actually use — codex-people) +
  // unknown descriptors (knowledge-gated display strings that can arrive as
  // a death cause, e.g. 'stripes flowing where no wind blows'). The census
  // is the analyst's instrument, not the player's UI — resolving the true
  // monster is honest attribution; descriptor matches are flagged in the
  // detail so the knowledge gap stays visible.
  var byId = {}, byName = {};
  try {
    var ms = (Game.data || {}).monsters || [];
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i]; if (!m || !m.id) continue;
      byId[m.id] = { id: m.id, name: m.name || m.id, wave: m.wave || null, unknown: m.unknown || null };
      if (m.name) byName[String(m.name).toLowerCase()] = m.id;
      byName[String(m.id).toLowerCase()] = m.id;
      var vn = m.villageNames || [];
      for (var vi = 0; vi < vn.length; vi++) if (vn[vi]) byName[String(vn[vi]).toLowerCase()] = m.id;
      if (m.unknown) byName[String(m.unknown).toLowerCase()] = m.id;
    }
  } catch (e) {}
  return { byId: byId, byName: byName };
}

function sayText(msg) {
  try { return String((msg && (msg.text || msg.msg || msg.message)) || msg || ''); }
  catch (e) { return ''; }
}

// Village-lost trigger beat patterns (loose — the verbatim line is stored,
// never a template). The three mechanical sites (game.js x2, ledger.js x1).
var TRIGGER_RE = [
  { site: 'scattering', re: /scattering, again/i },
  { site: 'extinction', re: /Nobody is left\. Not scattered/i },
  { site: 'succession', re: /No one is left to pick up the Codex/i },
];

function pushErr(K, msg) {
  try { K.instrumentErrors.push(String(msg).slice(0, 200)); } catch (e) {}
}

function install(Game) {
  var K = {
    deaths: [],        // post-call registerDeath rows (person + monster kinds)
    daily: [],         // dawn rows: {d, pop, pantry, feast, trim, tribute, wave}
    sayLines: [],      // {d, line} — the sense corpus (bounded)
    triggerBeats: [],  // {d, line} — village-lost beat candidates, NEVER capped
    instrumentErrors: [],
    _seenDays: {},
    _vlDay: null,      // first dawn with Game.villageLost true
    _feastToday: 0,
    _tributeToday: 0,
    _dt: null,
  };
  var wrapped = [];
  function wrap(name, fn) {
    try {
      var o = Game[name];
      if (typeof o !== 'function') return;
      var bound = o.bind(Game);
      Game[name] = fn(bound);
      wrapped.push([name, bound]);
    } catch (e) { pushErr(K, 'install:' + name + ': ' + String((e && e.message) || e)); }
  }

  // 0. The realm census — REQUIRED, reused (extend, don't duplicate).
  //    K._dt.census: daily {d, nat, shape, shapes, links, fps, villages}.
  try { K._dt = DT.install(Game); }
  catch (e) { pushErr(K, 'dt-install: ' + String((e && e.message) || e)); }

  // 1. Death rows — post-call (only real registrations; the double-death
  //    guard's null return means no tele fired, so no row).
  wrap('registerDeath', function (oRD) {
    return function (opts) {
      var r = oRD.apply(this, arguments);
      try {
        opts = opts || {};
        if (r === null || r === undefined) {
          // Double-death guard no-op: mirror the TELEFLAG player repair —
          // no new death, but a player:true repair may have landed.
          if (opts.player && opts.villagerId) {
            for (var i = K.deaths.length - 1; i >= 0; i--) {
              if (String(K.deaths[i].vid) === String(opts.villagerId)) { K.deaths[i].player = true; break; }
            }
          }
          return r;
        }
        var d = dayOf(Game);
        var vid = opts.villagerId != null ? String(opts.villagerId) : null;
        var mon = null;
        if (!opts.monsterId) {
          var c0 = String(opts.cause || '').toLowerCase();
          if (/combat|arena|gauntlet|wild|fight|slain|killed/i.test(c0)) mon = liveFightMonster(Game);
        }
        var venue = deathVenue(Game);
        var occ = occupationOf(Game, vid);
        var row = {
          day: d,
          who: String(opts.name || (vid ? Game.displayName ? Game.displayName(vid) : vid : '?')),
          vid: vid,
          kind: String(opts.kind || '?'),
          cause: String(opts.cause || '?'),
          player: !!opts.player,
          monsterId: opts.monsterId || (mon && mon.id) || null,
          monsterName: opts.monsterName || opts.descriptor || (mon && mon.name) || null,
          wave: mon ? mon.wave : null,
          venue: venue,
          occupationId: occ.occupationId,
          occupation: occ.occupation,
        };
        K.deaths.push(row);
      } catch (e) { pushErr(K, 'deathrow: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 2. Dawn daily series — AFTER the engine's sleep (same phase as DT's
  //    dawn sensor). Dedupe: sleep may fire twice per game day. try/finally:
  //    the loss night's sleep can throw AFTER endDay sets the flags (the
  //    dawn happened; the census must record it).
  wrap('sleep', function (oSleep) {
    return function () {
      var r, threw = null;
      try { r = oSleep.apply(this, arguments); }
      catch (e) { threw = e; }
      try {
        var d = dayOf(Game);
        if (!K._seenDays[d]) {
          K._seenDays[d] = true;
          var wave = 1;
          try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
          K.daily.push({
            d: d,
            pop: livingPop(Game),
            pantry: Math.round(pantryKcal(Game)),
            feast: K._feastToday,
            trim: trimKcalDay(Game, d),
            tribute: K._tributeToday,
            wave: wave,
          });
          K._feastToday = 0;
          K._tributeToday = 0;
        }
        if (Game.villageLost && K._vlDay === null) K._vlDay = d;
      } catch (e) { pushErr(K, 'daily: ' + String((e && e.message) || e)); }
      if (threw) throw threw;
      return r;
    };
  });

  // 3. Feast outflow — the engine's own ok-report spent kcal (game.js
  //    hostFeast returns {ok:true, spent, ...}; spent = real pantry draw).
  wrap('hostFeast', function (oHF) {
    return function () {
      var rep = oHF.apply(this, arguments);
      try {
        if (rep && rep.ok) K._feastToday += Math.round(rep.spent || 0);
      } catch (e) { pushErr(K, 'feast: ' + String((e && e.message) || e)); }
      return rep;
    };
  });

  // 4. Tribute/tend outflow — real kcal from the engine's return values
  //    (same read as feastscale's trackTribute; call-through, RNG-clean).
  function tributeWrap(name) {
    wrap(name, function (oFn) {
      return function () {
        var r = oFn.apply(this, arguments);
        try { if (typeof r === 'number' && r > 0) K._tributeToday += Math.round(r); }
        catch (e) { pushErr(K, 'tribute: ' + String((e && e.message) || e)); }
        return r;
      };
    });
  }
  tributeWrap('payTribute');
  tributeWrap('tendLink');

  // 5. Say corpus — every line, with day. TRIGGER-BEAT CANDIDATES (the
  //    village-lost beats) are NEVER dropped: the general corpus can cap
  //    out mid-run (5000 lines by ~d52 observed), but the beats the
  //    instrument exists to capture must survive.
  wrap('say', function (oSay) {
    return function (msg) {
      try {
        var s = sayText(msg);
        if (s) {
          var isTrig = false;
          for (var i = 0; i < TRIGGER_RE.length; i++) {
            if (TRIGGER_RE[i].re.test(s)) { isTrig = true; break; }
          }
          if (isTrig) K.triggerBeats.push({ d: dayOf(Game), line: s });
          else if (K.sayLines.length < 20000) K.sayLines.push({ d: dayOf(Game), line: s });
        }
      } catch (e) { /* never */ }
      return oSay.apply(this, arguments);
    };
  });

  function uninstall() {
    for (var i = wrapped.length - 1; i >= 0; i--) {
      try { Game[wrapped[i][0]] = wrapped[i][1]; } catch (e) {}
    }
    wrapped.length = 0;
    try { if (K._dt) K._dt.uninstall(); } catch (e) {}
  }

  return { K: K, uninstall: uninstall };
}

// ---------- proximate-cause classifier ----------

var SICK_RE = /sick|gutrot|wound_fever|trembles|trichinosis|lockjaw|tick[ -]?fever|gut[ -]?rot|disease|plague|cough|consumption|howlbelly|croakbelly|shellgut|gristlefit|lemons/i;
var WOUND_RE = /wound|injur|festering|lacerat|gash/i;
var COMBAT_FAMILY_RE = /combat|arena|gauntlet|expedition|ambush(ed)?|sortie|patrol|monster\b|the wild|split-fight/i;
var RAID_RE = /^raid(-defense)?$/i;

function classifyDeath(row, mIdx) {
  // row: {day, who, vid, kind, cause, player, monsterId, monsterName, wave, ...}
  // Returns {class, detail}. class is one of the brief's named causes;
  // 'unexplained' only on instrument failure.
  try {
    if (!row || row.cause == null) return { class: 'unexplained', detail: 'missing cause' };
    var raw = String(row.cause);
    var c = raw.toLowerCase().trim();
    var kind = String(row.kind || '').toLowerCase();
    var isPerson = (kind === 'person' || kind === 'villager');

    // 0. Monster/animal deaths are not village deaths — out of taxonomy,
    //    honestly labeled so the analyzer never mixes them in.
    if (!isPerson) return { class: 'monster:' + kind, detail: raw };

    // 1. Starvation / dehydration — exact engine strings first.
    if (/starv|hunger/.test(c)) return { class: 'starvation', detail: raw };
    if (/thirst|dehydrat/.test(c)) return { class: 'dehydration', detail: raw };

    // 2. Combat with a resolvable monster -> combat-<id>.
    //    (a) captured monster identity (opts or live-fight scan)
    var mid = row.monsterId || null;
    var mname = row.monsterName || null;
    //    (b) 'split-fight: <name>' prefix
    var nm = c.replace(/^split-fight:\s*/, '');
    //    (c) cause string against the roster (villager-agency passes the
    //    monster's display name AS the cause)
    if (!mid && mIdx) {
      if (mIdx.byName[nm]) mid = mIdx.byName[nm];
      else if (mname && mIdx.byName[String(mname).toLowerCase()]) mid = mIdx.byName[String(mname).toLowerCase()];
      else if (row.monsterId && mIdx.byId[row.monsterId]) mid = row.monsterId;
    }
    if (mid) {
      var det2 = raw + (mname ? ' (' + mname + ')' : '') + (row.venue === 'contest' ? ' [contest venue]' : '');
      try {
        var un = mIdx && mIdx.byId[mid] ? mIdx.byId[mid].unknown : null;
        if (un && String(un).toLowerCase() === nm) det2 += ' [unknown descriptor — the village never named it]';
      } catch (e) {}
      return { class: 'combat-' + mid, detail: det2 };
    }

    // 3. Alien family BEFORE combat-family: 'alien_beam' contains 'beam'
    //    (the combat regex) but is an alien-player kill, not a fight.
    if (/phoenix|alien/.test(c)) return { class: 'other: alien-' + c.replace(/\s+/g, '-'), detail: raw };

    // 3b. Contest venue without a resolvable monster (arena deaths arrive as
    //    playerDeath('combat') with state.arenaContest set — game.js:42703).
    if (row.venue === 'contest' && (COMBAT_FAMILY_RE.test(c) || /the arena/i.test(c))) {
      return { class: 'contest', detail: raw + ' [arena routing]' };
    }

    // 4. Combat-family cause, monster unresolvable -> combat-unknown (named).
    if (COMBAT_FAMILY_RE.test(c) || /fight|slain|killed|mauled|torn|claw|bite|beam/i.test(c)) {
      // 'ambush' is the betrayal villager-on-villager kill (betrayal.js:835)
      if (/^ambush/.test(c)) return { class: 'other: ambush (villager-on-villager)', detail: raw };
      return { class: 'combat-unknown', detail: raw };
    }

    // 5. Raid family.
    if (RAID_RE.test(c)) return { class: 'raid', detail: raw };

    // 6. Wound family.
    if (WOUND_RE.test(c)) return { class: 'wound', detail: raw };

    // 7. Sickness family — names the disease when the cause does.
    if (SICK_RE.test(c)) {
      var dn = c.replace(/^(died of |death by |the )/i, '').trim() || c;
      return { class: 'sickness-' + dn, detail: raw };
    }

    // 8. Contest family (no call sites on current master; kept for corpus).
    if (/contest|show\b|gauntlet/i.test(c)) return { class: 'contest', detail: raw };

    // 8b. The cautious food-testing protocol (game.js:17924/17961 —
    // hurtVillager(tester, 10/15, 'experiment')): villagers dying for the
    // village's food knowledge. A named class, not a residual.
    if (c === 'experiment') return { class: 'other: experiment (food-testing)', detail: raw };

    // 9. Residual — named with the raw cause; NOT unexplained.
    return { class: 'other: ' + raw.slice(0, 80), detail: raw };
  } catch (e) {
    return { class: 'unexplained', detail: 'classifier crash: ' + String((e && e.message) || e) };
  }
}

// ---------- village-lost attribution ----------

function attributeVillageLost(Game, K) {
  // Returns {lost: bool, day, site, beat}. site: scattering|extinction|
  // succession|unknown. beat: the verbatim engine say line.
  var out = { lost: false, day: null, site: 'none', beat: null };
  try {
    if (!Game.villageLost) return out;
    out.lost = true;
    var v = (Game.state || {}).village || {};
    if (v.scattered) out.site = 'scattering';
    else if (v.extinct) out.site = 'extinction';
    else {
      var lin = [];
      try { lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || []; } catch (e) {}
      var vl = lin.filter(function (l) { return l && l.outcome === 'village-lost'; });
      if (vl.length) out.site = 'succession';
      else out.site = 'unknown';
    }
    // The verbatim beat: last matching say line (the engine's own string).
    // Trigger-beat candidates are kept uncapped; fall back to the general
    // corpus (older runs / text drift).
    var want = TRIGGER_RE.filter(function (t) { return t.site === out.site; });
    if (!want.length) want = TRIGGER_RE;
    var best = null;
    var pools = [K.triggerBeats || [], K.sayLines || []];
    for (var p = 0; p < pools.length && !best; p++) {
      var pool = pools[p];
      for (var i = 0; i < pool.length; i++) {
        var sl = pool[i];
        for (var j = 0; j < want.length; j++) {
          if (want[j].re.test(sl.line)) { best = sl; break; }
        }
      }
    }
    if (best) { out.day = best.d; out.beat = best.line; }
    else if (K._vlDay != null) { out.day = K._vlDay; }
    return out;
  } catch (e) {
    out.site = 'unknown';
    return out;
  }
}

// ---------- finalize ----------

function finalize(Game, K) {
  var mIdx = monsterIndex(Game);
  var rows = (K.deaths || []).map(function (r) {
    var a = classifyDeath(r, mIdx);
    return { day: r.day, who: r.who, vid: r.vid, kind: r.kind, cause: r.cause,
      player: r.player, monsterId: r.monsterId, monsterName: r.monsterName,
      wave: r.wave, venue: r.venue, occupationId: r.occupationId, occupation: r.occupation,
      pclass: a.class, detail: a.detail };
  });
  var vl = attributeVillageLost(Game, K);
  // Realm census join: per-day {nat, shape, links[]} from the dissolvetax K.
  var realmByDay = {};
  try {
    var cen = (K._dt && K._dt.K && K._dt.K.census) || [];
    for (var i = 0; i < cen.length; i++) {
      var cr = cen[i];
      if (cr && cr.d != null && realmByDay[cr.d] === undefined) realmByDay[cr.d] = cr;
    }
  } catch (e) {}
  var daily = (K.daily || []).map(function (dr) {
    var rc = realmByDay[dr.d] || null;
    return {
      day: dr.d, pop: dr.pop, pantryKcal: dr.pantry,
      feastKcalOut: dr.feast, trimKcal: dr.trim, tributeKcal: dr.tribute,
      waveUnlocked: dr.wave,
      nationalLive: rc ? !!rc.nat : null,
      nationalShape: rc ? (rc.shape || '') : '',
      linkTrust: rc ? (rc.links || []).map(function (l) {
        return { other: l.other, kind: l.kind, dir: l.dir, st: l.st, trust: l.trust, arr: l.arr, age: l.age };
      }) : [],
    };
  });
  var personRows = rows.filter(function (r) { return r.kind === 'person' || r.kind === 'villager'; });
  var unexplained = personRows.filter(function (r) { return r.pclass === 'unexplained'; });
  // SENSE CORPUS: say lines from days with >=1 person death (bounded), plus
  // the village-lost day's lines — the sense-testing read needs the beats,
  // not just the counts.
  var deathDays = {};
  for (var di = 0; di < personRows.length; di++) deathDays[personRows[di].day] = true;
  var deathDayLines = [];
  var lossDayLines = [];
  // trigger beats join the loss-day corpus even if the general say corpus
  // capped out before the loss.
  var allSay = (K.triggerBeats || []).concat(K.sayLines || []);
  for (var si = 0; si < allSay.length; si++) {
    var sl = allSay[si];
    if (deathDays[sl.d] && deathDayLines.length < 600) deathDayLines.push(sl);
    if (vl.day != null && Math.abs(sl.d - vl.day) <= 1 && lossDayLines.length < 200) lossDayLines.push(sl);
  }
  return {
    deaths: rows,
    personDeaths: personRows.length,
    unexplained: unexplained.length,
    unexplainedRows: unexplained,
    daily: daily,
    realmNatEvents: (function () { try { return (K._dt.K.natEvents || []).map(function (e) { return { d: e.d, kind: e.kind, shape: e.shape }; }); } catch (e2) { return []; } })(),
    villageLost: vl,
    sayLineCount: (K.sayLines || []).length,
    deathDayLines: deathDayLines,
    lossDayLines: lossDayLines,
    instrumentErrors: K.instrumentErrors || [],
  };
}

module.exports = {
  install: install,
  finalize: finalize,
  classifyDeath: classifyDeath,
  attributeVillageLost: attributeVillageLost,
  monsterIndex: monsterIndex,
  dayOf: dayOf,
  pantryKcal: pantryKcal,
  livingPop: livingPop,
  TRIGGER_RE: TRIGGER_RE,
};
