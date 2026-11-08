// Alien expansion proof (Steve 2026-11-07): roster 8 -> 12 meddlers.
// Proves, on the shared kit (scripts/godpath/lib.js — never copied eval
// boilerplate, never hardcoded absolute paths):
//   1. All 12 personas load, schema-complete, with the 4 new ones carrying
//      the approved dispositions / wealth / combat flag / signature lines.
//   2. Each new persona has meddler moves (data) and they fire live through
//      the existing interference path (apContestInterference) — verdict-only,
//      one per contest, never for the player killing-blow path, never dead.
//   3. No contest code builds an alien-player fighter (grep-assert on
//      contests.js / contestEngine.js) — meddling only, per Steve's ruling.
//   4. The new dispositions don't break encounter weighting (live roll loop)
//      or the disposition-keyed paths (activation weights, factions, beams).
//
// Run: node scripts/test-alien-expansion-20261107.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-alien-expansion-20261107');

const personas = K.readJSON('src/data/alienPlayers.json');
const apSrc = K.readSrc('src/js/alienPlayers.js');
const contestsSrc = K.readSrc('src/js/contests.js');
const contestEngineSrc = K.readSrc('src/js/contestEngine.js');
const abilities = K.readJSON('src/data/abilities.json');
const abilityIds = new Set(abilities.map(function (a) { return a.id; }));

const DISPOSITIONS = ['sadistic', 'neutral', 'benevolent', 'meddling', 'dutiful', 'raging', 'spoiled'];
const NEW_IDS = ['quill', 'kess', 'howl', 'bibi'];
const OLD_IDS = ['vex_marlowe', 'countess_sable', 'rax_dentist', 'pip_quindle', 'sarge', 'dr_fenwick', 'wren', 'old_tam'];
const SIGNATURE_LINES = {
  quill: 'Your supplies were misfiled. I fixed it. You\'re welcome. They\'re in the river now.',
  kess: 'Warrant seven-one-nine. I\'m sorry. It\'s nothing personal. It never is.',
  howl: 'STOP LOOKING AT ME LIKE THAT— no wait, look, LOOK, I want you to see this part—',
  bibi: 'Daddy bought me this planet. Well, the playing rights. Same thing. You\'re my toy now. Don\'t break.',
};
const EXPECTED = {
  quill: { disposition: 'meddling', wealth: 'comfortable', combat: true, experience: 'veteran' },
  kess: { disposition: 'dutiful', wealth: 'comfortable', combat: true, experience: 'veteran' },
  howl: { disposition: 'raging', wealth: 'broke', combat: true, experience: 'veteran' },
  bibi: { disposition: 'spoiled', wealth: 'rich', combat: true, experience: 'rookie' },
};

function byId(id) {
  for (var i = 0; i < personas.length; i++) if (personas[i].id === id) return personas[i];
  return null;
}
function nonEmptyStr(p, field) {
  return typeof p[field] === 'string' && p[field].length > 0;
}
function nonEmptyLines(p, field, min) {
  return Array.isArray(p[field]) && p[field].length >= (min || 1)
    && p[field].every(function (l) { return typeof l === 'string' && l.length > 0; });
}

// ---------- 1. Roster + schema ----------
T.section('1. Roster: 12 personas, 7 dispositions');
T.ok('12 personas load', personas.length === 12, 'got ' + personas.length);
var ids = personas.map(function (p) { return p.id; });
T.ok('ids unique', new Set(ids).size === 12);
var dispCount = {};
personas.forEach(function (p) { dispCount[p.disposition] = (dispCount[p.disposition] || 0) + 1; });
T.ok('3 sadistic', dispCount.sadistic === 3, JSON.stringify(dispCount));
T.ok('3 neutral', dispCount.neutral === 3, JSON.stringify(dispCount));
T.ok('2 benevolent', dispCount.benevolent === 2, JSON.stringify(dispCount));
T.ok('1 meddling', dispCount.meddling === 1, JSON.stringify(dispCount));
T.ok('1 dutiful', dispCount.dutiful === 1, JSON.stringify(dispCount));
T.ok('1 raging', dispCount.raging === 1, JSON.stringify(dispCount));
T.ok('1 spoiled', dispCount.spoiled === 1, JSON.stringify(dispCount));
T.ok('all dispositions known', personas.every(function (p) { return DISPOSITIONS.indexOf(p.disposition) >= 0; }));

T.section('2. Schema: every entry complete (Wren exempt where non-combat)');
personas.forEach(function (p) {
  var tag = p.id + ': ';
  T.ok(tag + 'identity fields', nonEmptyStr(p, 'name') && nonEmptyStr(p, 'title')
    && nonEmptyStr(p, 'species') && nonEmptyStr(p, 'backstory') && p.backstory.length > 50
    && nonEmptyStr(p, 'motivation') && p.motivation.length > 20
    && nonEmptyStr(p, 'voice') && nonEmptyStr(p, 'signature') && nonEmptyStr(p, 'rivalry'));
  T.ok(tag + 'wealth/experience/combat typed', ['broke', 'comfortable', 'rich'].indexOf(p.wealth) >= 0
    && ['veteran', 'rookie'].indexOf(p.experience) >= 0 && typeof p.combat === 'boolean');
  if (p.combat) {
    T.ok(tag + 'combat lines complete', nonEmptyLines(p, 'introLines')
      && nonEmptyLines(p, 'escalationLines') && nonEmptyLines(p, 'defeatLines')
      && nonEmptyLines(p, 'victoryLines') && nonEmptyLines(p, 'taunts', 2)
      && p.combatLines && ['onHit', 'onHurt', 'onWinning', 'onLosing', 'unhinged'].every(function (k) {
        return Array.isArray(p.combatLines[k]) && p.combatLines[k].length >= 2;
      }));
    T.ok(tag + 'abilityKit: 6 real abilities', Array.isArray(p.abilityKit) && p.abilityKit.length === 6
      && p.abilityKit.every(function (id) { return abilityIds.has(id); }), (p.abilityKit || []).join(','));
    T.ok(tag + 'alienTech: 0-2 pieces with id/name/desc', Array.isArray(p.alienTech) && p.alienTech.length <= 2
      && p.alienTech.every(function (t) { return t.id && t.name && t.desc; }));
  } else {
    T.ok(tag + 'non-combat persona has no combat kit', p.id === 'wren' && p.abilityKit.length === 0);
  }
});

// ---------- 2. The four new personas ----------
T.section('3. The four new personas (Steve 2026-11-07)');
NEW_IDS.forEach(function (id) {
  var p = byId(id);
  var exp = EXPECTED[id];
  T.ok(id + ' present', !!p);
  if (!p) return;
  T.ok(id + ' disposition=' + exp.disposition, p.disposition === exp.disposition);
  T.ok(id + ' wealth=' + exp.wealth, p.wealth === exp.wealth);
  T.ok(id + ' combat=true', p.combat === true);
  T.ok(id + ' experience=' + exp.experience, p.experience === exp.experience);
  T.ok(id + ' signature line is introLines[0]', p.introLines[0].indexOf(SIGNATURE_LINES[id]) >= 0,
    'got ' + p.introLines[0]);
  T.ok(id + ' signature line also in unhinged combat lines',
    p.combatLines.unhinged.indexOf(SIGNATURE_LINES[id]) >= 0);
});
var bibi = byId('bibi');
T.ok('bibi rivalry names Vex Marlowe / Third Dynasty',
  /Vex Marlowe/.test(bibi.rivalry) && /Third Dynasty/.test(bibi.rivalry)
  && /Vex Marlowe/.test(bibi.backstory) && /Ninth Dynasty/.test(bibi.backstory));
T.ok('bibi motivation names Vex Marlowe', /Vex Marlowe/.test(bibi.motivation));

// ---------- 3. Meddler moves (data) ----------
T.section('4. Meddler moves in the data');
NEW_IDS.forEach(function (id) {
  var p = byId(id);
  var moves = p.meddlerMoves;
  T.ok(id + ' has >=2 meddlerMoves', Array.isArray(moves) && moves.length >= 2);
  if (!Array.isArray(moves)) return;
  var moveIds = new Set();
  moves.forEach(function (mv) {
    T.ok(id + '.' + (mv.id || '?') + ' move shape', typeof mv.id === 'string' && mv.id.length > 0
      && typeof mv.name === 'string' && mv.name.length > 0
      && typeof mv.lean === 'number' && mv.lean >= -0.1 && mv.lean <= 0.1
      && typeof mv.line === 'string' && mv.line.length > 0);
    moveIds.add(mv.id);
  });
  T.ok(id + ' move ids unique', moveIds.size === moves.length);
});
OLD_IDS.forEach(function (id) {
  var p = byId(id);
  T.ok(id + ' has no meddlerMoves (not forced into the new set)', !p.meddlerMoves);
});

// ---------- 4. Contests: meddling only, never fighters ----------
T.section('5. Contests: no alien-player fighter construction');
T.ok('contests.js has no apBuildFighter', contestsSrc.indexOf('apBuildFighter') < 0);
T.ok('contestEngine.js has no apBuildFighter', contestEngineSrc.indexOf('apBuildFighter') < 0);
T.ok('contests.js has no alienPid fighter', contestsSrc.indexOf('alienPid') < 0);
T.ok('contestEngine.js has no alienPid fighter', contestEngineSrc.indexOf('alienPid') < 0);
T.ok('contests.js still calls apContestInterference (the meddle path)',
  contestsSrc.indexOf('apContestInterference') >= 0);
T.ok('alienPlayers.js wires meddlerMoves into apContestInterference',
  apSrc.indexOf('apMeddlerMoves') >= 0 && apSrc.indexOf('meddle-pick:') >= 0
  && apSrc.indexOf('lastMeddleDay') >= 0);
T.ok('alienPlayers.js handles all 7 dispositions in the weight helpers',
  DISPOSITIONS.every(function (d) { return apSrc.indexOf("'" + d + "'") >= 0; }));

// ---------- 5. Live: load the game ----------
(async () => {
  var Game;
  try {
    Game = await K.load({ seed: 20261107 });
  } catch (e) {
    T.ok('game loads', false, String(e && e.message));
    T.done();
    return;
  }
  T.section('6. Live: roster, weights, fighters');
  K.newRun(Game); // fresh run first: apState/apBuildFighter need live state
  T.ok('apPersonas() returns 12', Game.apPersonas().length === 12);
  var expW = { sadistic: 4, neutral: 4.5, benevolent: 1.5, meddling: 4, dutiful: 3, raging: 4.5, spoiled: 3 };
  DISPOSITIONS.forEach(function (d) {
    T.ok('apDispositionWeight(' + d + ')=' + expW[d], Game.apDispositionWeight(d) === expW[d]);
  });
  T.ok('apDispositionWeight(unknown) defaults to 1.5', Game.apDispositionWeight('mystery') === 1.5);
  var expA = { sadistic: 3, neutral: 2, benevolent: 1, meddling: 3, dutiful: 2, raging: 3, spoiled: 2 };
  DISPOSITIONS.forEach(function (d) {
    T.ok('apActivationWeight(' + d + ')=' + expA[d], Game.apActivationWeight(d) === expA[d]);
  });
  NEW_IDS.forEach(function (id) {
    T.ok('apMeddlerMoves(' + id + ') returns 2', Game.apMeddlerMoves(id).length === 2);
  });
  T.ok('apMeddlerMoves(vex_marlowe) returns []', Game.apMeddlerMoves('vex_marlowe').length === 0);
  // Fighters: HP carries the character (Howl +10, Bibi -10, Quill/Kess par).
  var hpExpect = { quill: 80, kess: 80, howl: 90, bibi: 70 };
  NEW_IDS.forEach(function (id) {
    var f = Game.apBuildFighter(id, 4, 4);
    T.ok('apBuildFighter(' + id + ') hostile person', !!f && f.kind === 'hostile' && f.alienPid === id);
    T.ok('apBuildFighter(' + id + ') hp=' + hpExpect[id], !!f && f.hp === hpExpect[id], 'got ' + (f && f.hp));
    T.ok('apBuildFighter(' + id + ') starts as Stranger pre-reveal', !!f && f.name === 'Stranger');
    T.ok('apBuildFighter(' + id + ') progressive kit starts at 3', !!f && f.abilities.length === 3);
    T.ok('apBuildFighter(' + id + ') carries its tech', !!f && f.alienTech.length === byId(id).alienTech.length);
  });

  // Eligibility setup (wave 2: day 8+ AND 5 wave-1 ledger points; readiness
  // >= 100: 2 allies + day 30+ + System integration — see apReadinessCheck).
  Game.state.systemArrived = true;
  Game.state.systemIntegration = 2;
  Game.state.scholar.day = 45;
  Game.state.scholar.kcal = 3000;
  Game.state.scholar.health = 100;
  try { Game.ledgerState()[1].points = 5; } catch (e) {}
  Game.isSafeTile = function () { return false; };
  Game.state.party = [{ id: 'a' }, { id: 'b' }];
  T.ok('apEligible() true (System arrived, wave 2)', Game.apEligible() === true
    && Game.unlockedWave() >= 2, 'wave=' + Game.unlockedWave());

  T.section('7. Live: encounter weighting covers the new dispositions');
  var picks = {};
  var bad = 0;
  var combatIds = {};
  Game.apPersonas().forEach(function (p) { if (Game.apIsCombat(p.id)) combatIds[p.id] = true; });
  for (var i = 0; i < 3000; i++) {
    var r = Game.apRollEncounter();
    if (r === null) continue;
    if (!combatIds[r]) { bad++; continue; }
    picks[r] = (picks[r] || 0) + 1;
  }
  T.ok('roll loop: no invalid picks', bad === 0, bad + ' bad');
  var totalPicks = Object.keys(picks).reduce(function (s, k) { return s + picks[k]; }, 0);
  T.ok('roll loop: picks happen (>50 in 3000)', totalPicks > 50, 'got ' + totalPicks);
  NEW_IDS.forEach(function (id) {
    T.ok('roll loop: ' + id + ' gets picked', (picks[id] || 0) >= 1, 'got ' + (picks[id] || 0));
  });

  T.section('8. Live: meddler moves fire through apContestInterference');
  function resetMeddle(pid, dead) {
    var ap = Game.apState();
    ap.met = {};
    ap.met[pid] = { encounters: 2, bond: 0 };
    if (dead) ap.met[pid].dead = true;
    ap.lastMeddleDay = -999;
    ap.lastRigDay = -999;
    ap.lastLifelineDay = -999;
  }
  NEW_IDS.forEach(function (id) {
    resetMeddle(id, false);
    var fired = null;
    for (var j = 0; j < 40; j++) {
      var res = Game.apContestInterference({ participants: ['villagerA'], contestId: 'meddle-' + id + '-' + j });
      if (res && res.note) { fired = res; break; }
    }
    T.ok(id + ' meddles at least once in 40 contests', !!fired);
    if (fired) {
      var lines = byId(id).meddlerMoves.map(function (mv) { return mv.line; });
      var hit = lines.filter(function (ln) { return fired.note.indexOf(ln) >= 0; })[0];
      T.ok(id + ' note carries its own move line', !!hit);
      var mv = byId(id).meddlerMoves.filter(function (m) { return m.line === hit; })[0];
      T.ok(id + ' winMod equals the move lean (' + (mv && mv.lean) + ')',
        !!mv && fired.winMod === mv.lean, 'got ' + fired.winMod);
      T.ok(id + ' note stays anonymous pre-reveal', fired.note.indexOf('Someone in the judging booth') >= 0);
      T.ok(id + ' meddle does not death-save', fired.deathSave === false);
    }
    // The forPlayer killing-blow path must never meddle.
    resetMeddle(id, false);
    var meddledForPlayer = false;
    for (var k = 0; k < 20; k++) {
      var rp = Game.apContestInterference({ participants: ['player'], contestId: 'fp-' + id + '-' + k }, { forPlayer: true });
      if (rp && (rp.note || rp.winMod !== 0)) meddledForPlayer = true;
    }
    T.ok(id + ' never meddles on the forPlayer path', !meddledForPlayer);
  });

  T.section('9. Live: dead meddlers meddle nothing; sadistic rig still works');
  resetMeddle('quill', true);
  var deadFired = false;
  for (var d = 0; d < 40; d++) {
    var rd = Game.apContestInterference({ participants: ['villagerA'], contestId: 'dead-quill-' + d });
    if (rd && (rd.note || rd.winMod !== 0)) deadFired = true;
  }
  T.ok('dead quill never meddles', !deadFired);
  resetMeddle('vex_marlowe', false);
  var rigged = false;
  for (var v = 0; v < 40; v++) {
    Game.apState().lastRigDay = -999;
    var rv = Game.apContestInterference({ participants: ['villagerA'], contestId: 'rig-vex-' + v });
    if (rv && rv.note && /judging booth/.test(rv.note)) { rigged = true; break; }
  }
  T.ok('vex rig still fires (no regression)', rigged);

  T.section('10. Live: disposition paths — factions, playground, packages');
  var threw = 0;
  try {
    var everTrue = false;
    for (var f = 0; f < 200; f++) if (Game.apFactionAligned('quill', 'howl')) { everTrue = true; break; }
    T.ok('quill+howl can align (meddling+raging 0.15)', everTrue);
  } catch (e) { threw++; T.ok('quill+howl faction check runs', false, String(e && e.message)); }
  try {
    var neverTrue = true;
    for (var g = 0; g < 50; g++) {
      if (Game.apFactionAligned('howl', 'bibi')) neverTrue = false;
      if (Game.apFactionAligned('howl', 'sarge')) neverTrue = false;
    }
    T.ok('howl never aligns with bibi/sarge (explicit never)', neverTrue);
  } catch (e) { threw++; T.ok('howl faction checks run', false, String(e && e.message)); }
  NEW_IDS.forEach(function (id) {
    try {
      for (var n = 0; n < 5; n++) Game.apPlaygroundAction(id);
      T.ok('apPlaygroundAction(' + id + ') runs without throwing', true);
    } catch (e) {
      threw++;
      T.ok('apPlaygroundAction(' + id + ') runs without throwing', false, String(e && e.message));
    }
  });
  NEW_IDS.forEach(function (id) {
    try {
      var ap2 = Game.apState();
      ap2.met = {};
      ap2.met[id] = { encounters: 2, bond: 0 };
      ap2.lastPersonaPackageDay = -999;
      Game.apPersonaPackage();
      T.ok('apPersonaPackage(' + id + ') runs without throwing', true);
    } catch (e) {
      threw++;
      T.ok('apPersonaPackage(' + id + ') runs without throwing', false, String(e && e.message));
    }
  });
  T.ok('no throws in the disposition-path smoke checks', threw === 0, threw + ' throws');

  T.done();
})().catch(function (e) {
  console.error('test-alien-expansion-20261107 crashed: ' + (e && e.stack || e));
  process.exitCode = 1;
});
