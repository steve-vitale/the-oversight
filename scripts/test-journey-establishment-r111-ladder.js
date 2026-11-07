// Proof test for establishment r111 Q1 specialist ladder + Q2 menu:more
// fix (scripts/journey-establishment-r111-20261107.js driver,
// scripts/analyze-journey-establishment-r111-20261107.py, and the
// convoNextMenu fix in src/js/conversation.js):
//   Q1: the ladder is measured on the panel, but SHUT vs UNEXERCISED is
//   decided HERE, on live code: specialistSkill() gates its +1 on
//   occupation skill > 0, so a 0-skill villager can never gain specialist
//   skill no matter how much foodXp they hold; and foodXp accrues only in
//   askSpecialist, which the competent bot never calls.
//   Q2: convoNextMenu returned {navigation:true} with NO line — the inline
//   dialogue box blanks the NPC's line on a pagination tap (app.js
//   personAct sets view.line = st.line unconditionally). The fix returns
//   the current line (last 'them' transcript text, the convoUI
//   computation) on both branches.
// Runs the REAL analyzer on synthetic corpora (r51 pattern: temp dirs
// under os.tmpdir, removed after), plus LIVE checks on one harness-loaded
// Game (single loadGame per process — shared state) and a LIVE det-gate:
// the r111 driver on 5d seed 1502 (HUNTSTAFF=2) must reproduce the
// committed r110 after-panel seed-1502 funnel keys at day 6. No repo
// writes except the det-gate's temp dir (removed after).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ANALYZER = path.join(__dirname, 'analyze-journey-establishment-r111-20261107.py');
const DRIVER = path.join(__dirname, 'journey-establishment-r111-20261107.js');
const R110_REF = path.join(ROOT, 'evidence', '2026-11-07', 'journey-establishment-r110-seed1502.json');
const driver = fs.readFileSync(DRIVER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

check('A driver-practice-snapshot-fn', /function practiceSnapshot\(Game\)/.test(driver));
check('B driver-practice-d1-d14-d28-dEnd', /practiceD1 = \{ day: nowDay\(Game\), snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practiceD14 = \{ day: nd, snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practiceD28 = \{ day: nd, snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practiceDEnd = \{ day: nowDay\(Game\), snap: practiceSnapshot\(Game\) \}/.test(driver) &&
  /practice: \{ d1: practiceD1, d14: practiceD14, d28: practiceD28, dEnd: practiceDEnd \}/.test(driver));
check('C driver-snapshot-first-day-gte', /if \(nd >= 14 && !practiceD14\)/.test(driver) &&
  /if \(nd >= 28 && !practiceD28\)/.test(driver));
check('D driver-practice-tasks-match-practicemove', /'hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'/.test(driver));
check('E driver-practice-specs-match', /'butcher', 'cook', 'preserver', 'spotter', 'builder'/.test(driver));
check('F driver-navigation-logging', /menu page turned/.test(driver) && /r\.navigation/.test(driver));

const TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend'];
const SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder'];
function villager(id, name, occ, comp, prac, spec, food, skills, alive) {
  const c = {}, p = {}, s = {}, f = {};
  for (const t of TASKS) { c[t] = comp[t] != null ? comp[t] : 1.0; p[t] = (prac && prac[t]) || 0; }
  for (const t of SPECS) { s[t] = (spec && spec[t] != null) ? spec[t] : 0; f[t] = (food && food[t]) || 0; }
  return { id, name, alive: alive !== false, occ, competence: c, practice: p, specialist: s, foodXp: f, npcSkills: (skills || []).slice() };
}
function snap(day, villagers) { return villagers ? { day, snap: villagers } : null; }
function dailyRows() {
  const rows = [];
  for (let d = 2; d <= 43; d++) rows.push({ day: d, alive: 8, roster: 12, pantryKcal: 20000, over: false, wave: 1, ledger2: 0 });
  return rows;
}
function baseSeed(seed, practice, teleAll) {
  return { seed, run: 'r111', days: 42, endDay: 43, gameOver: false, startCensus: [],
    holdingsStart: [], holdingsEnd: [], practice: practice || { d1: null, d14: null, d28: null, dEnd: null },
    playerAbilitiesEnd: [], aliveAt40: 8, aliveEnd: 8, waveReached: 1, pantryKcalEnd: 20000,
    deaths: [{ day: 20, who: 'X', cause: 'monster', kind: 'monster', player: false }],
    census: [], daily: dailyRows(), matTrace: [], craftLog: [], npcCraftLog: [],
    huntLog: [], careLog: [], healerLog: [], treatLog: [], cookLog: [],
    huntStaff: { layerOn: true, prepOn: true, assignments: 0, assignLog: [], refusalLog: [], woundLog: [], prepLog: [] },
    huntEligEnd: [], huntEligEver: [], leanTrace: [],
    guardrails: { deaths: 1, popAlive: 8, pantryKcal: 20000 }, c3: { starvationDeaths: 0 },
    playerPackArmor: [], playerEquipped: [], playerRecipes: {},
    contestTele: [], contestCounts: {}, waveSysLines: [], teleTypes: {}, skillRows: [],
    skillCounts: {}, teachDays: [], teleAll: teleAll || [], playerCodexSkills: {}, avCraftEnd: {} };
}
function convoTxt() {
  return '=== r111 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\n(ended by engine)\nclosing: goodbye\n';
}
function corpusSeed(dir, tag, seed, practice, teleAll, convo) {
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-seed${seed}.json`),
    JSON.stringify(baseSeed(seed, practice, teleAll)));
  fs.writeFileSync(path.join(dir, `journey-establishment-${tag}-convo-seed${seed}.txt`), convo !== undefined ? convo : convoTxt());
}
function corpus(dir, seeds, mkPractice, mkTele, mkConvo) {
  // Both tags get identical funnel keys (the r110 reference is the
  // trajectory the r111 driver must reproduce); only the r111 files carry
  // the practice snapshots under test. Convo bodies are compared with
  // navigation turns normalized (r110 logs THEM: (null) after menu:more;
  // r111 logs (menu page turned)).
  for (const seed of seeds) {
    const practice = mkPractice(seed);
    corpusSeed(dir, 'r110', seed, { d1: null, d14: null, d28: null, dEnd: null }, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r110') : undefined);
    corpusSeed(dir, 'r111', seed, practice, mkTele ? mkTele(seed) : [], mkConvo ? mkConvo(seed, 'r111') : undefined);
  }
}
function runAnalyzer(dir) {
  return execFileSync('python3', [ANALYZER, dir], { encoding: 'utf8' });
}
function withDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r111-ladder-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
}
const SEEDS4 = [1502, 1504, 1603, 1604];

// (a) Ladder GO: foodXp 0->positive on 3/4 seeds -> Q1 GO, funnel reproduced.
withDir((dir) => {
  const mk = (seed) => {
    if (seed === 1604) {
      const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
      return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
    }
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, {}, { cook: 3 }, []);
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('G ladder-GO-three-seeds', /Q1 verdict: GO \(seeds with >=1 ladder move: 3\/4\)/.test(out), out);
  check('H funnel-repro', /FUNNEL-REPRO verdict: REPRODUCED/.test(out), out);
  check('I ladder-per-seed-line', /ladder seed 1502: spec0pos=0 foodXp0pos=1 foodXpEnd=3/.test(out), out);
});

// (b) Zero ladder movement -> Q1 NO-GO (shut + unexercised diagnosis lines).
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('J zero-ladder-NO-GO', /Q1 verdict: NO-GO \(0 ladder moves on 4\/4 seeds\)/.test(out), out);
  check('K zero-foodXp-detail', /Q1 ladder detail: foodXpEnd total=0 plus1pool=0 stepped=0 wastedXp=0/.test(out), out);
});

// (c) +1-rung pool: a holder at xp>=5 whose skill stepped up is counted.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 2 }, { butcher: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 3 }, { butcher: 6 }, []);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('L plus1pool-stepped-counted', /ladder seed 1502: spec0pos=0 foodXp0pos=1 foodXpEnd=6 plus1pool=1 stepped=1 wastedXp=0/.test(out), out);
});

// (d) Wasted XP: a 0-skill villager holding foodXp is the gate's shadow.
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { butcher: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { butcher: 7 }, []);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('M wastedXp-counted', /ladder seed 1502: spec0pos=0 foodXp0pos=1 foodXpEnd=7 plus1pool=0 stepped=0 wastedXp=1/.test(out), out);
});

// (e) Specialist 0->positive move counts as a ladder move (not just foodXp).
withDir((dir) => {
  const mk = (seed) => {
    const v1 = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 0 }, { butcher: 0 }, []);
    const v1e = villager('v1', 'Ana', 'forager', {}, {}, { butcher: 1 }, { butcher: 0 }, []);
    if (seed === 1502) return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1e]) };
    return { d1: snap(1, [v1]), d14: snap(14, [v1]), d28: snap(28, [v1]), dEnd: snap(43, [v1]) };
  };
  corpus(dir, SEEDS4, mk);
  const out = runAnalyzer(dir);
  check('N spec0pos-counts', /ladder seed 1502: spec0pos=1 foodXp0pos=0/.test(out), out);
});

// (f) Navigation-turn normalization: r110's THEM: (null) after menu:more
// and r111's (menu page turned) compare as the SAME body (funnel repro).
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const mkConvo = (seed, tag) => {
    const nav = tag === 'r110' ? 'THEM: (null)' : 'THEM: (menu page turned)';
    return `=== ${tag} PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\n${nav}\n(ended by engine)\nclosing: goodbye\n`;
  };
  corpus(dir, SEEDS4, mk, null, mkConvo);
  const out = runAnalyzer(dir);
  check('O nav-normalized-repro', /FUNNEL-REPRO verdict: REPRODUCED/.test(out), out);
});

// (g) A REAL navigation difference still diverges (normalization is not a
// blanket pass): r111 body with an extra line must NOT reproduce.
withDir((dir) => {
  const mk = () => {
    const v = villager('v1', 'Ana', 'forager', {}, {}, {}, {}, []);
    return { d1: snap(1, [v]), d14: snap(14, [v]), d28: snap(28, [v]), dEnd: snap(43, [v]) };
  };
  const mkConvo = (seed, tag) => {
    if (tag === 'r111') {
      return '=== r111 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\nTHEM: (menu page turned)\nTHEM: an extra line that was never said\n(ended by engine)\nclosing: goodbye\n';
    }
    return '=== r110 PEOPLE CHECK (4 held convos, end of run) ===\n\n-- Ana (v1) occ=forager --\nOPENING: hello\nYOU: [menu:more] More things to say (1/2)\nTHEM: (null)\n(ended by engine)\nclosing: goodbye\n';
  };
  corpus(dir, SEEDS4, mk, null, mkConvo);
  const out = runAnalyzer(dir);
  check('P real-diff-still-diverges', /FUNNEL-REPRO verdict: DIVERGED/.test(out), out);
});

// (h) Missing snapshots reported, not crashed.
withDir((dir) => {
  corpus(dir, SEEDS4, () => ({ d1: null, d14: null, d28: null, dEnd: null }));
  const out = runAnalyzer(dir);
  check('Q missing-snapshots-reported', /MISSING SNAPSHOTS \(instrument gap\)/.test(out), out);
});

// (LIVE) gate proof + menu:more proof on one harness-loaded Game.
(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  let Game;
  try {
    ({ Game } = await loadGame({ seed: 1502, mode: 'mvc', fullTelemetry: false }));
    await setupGame(Game);
  } catch (e) {
    check('R live-game-loads', false, 'loadGame/setupGame: ' + (e && e.message));
    finish();
    return;
  }
  check('R live-game-loads', !!Game && typeof Game.specialistSkill === 'function');

  // Q1 GATE PROOF (live code, synthetic persons — no state writes):
  // the +1 rung exists for holders; the bottom rung is missing by
  // construction (100 XP cannot buy skill 1 from 0).
  try {
    const fish5 = Game.specialistSkill({ formerOccupation: 'fisherman', _src: { foodXp: { butcher: 5 } } }, 'butcher');
    check('S gate-holder-xp5-steps-up', fish5 === 3, `fisherman butcher xp5 -> ${fish5} (want 3)`);
    const fish4 = Game.specialistSkill({ formerOccupation: 'fisherman', _src: { foodXp: { butcher: 4 } } }, 'butcher');
    check('T gate-holder-xp4-holds', fish4 === 2, `fisherman butcher xp4 -> ${fish4} (want 2)`);
    const forg100 = Game.specialistSkill({ formerOccupation: 'forager', _src: { foodXp: { butcher: 100 } } }, 'butcher');
    check('U gate-zero-skill-never-gains', forg100 === 0, `forager butcher xp100 -> ${forg100} (want 0)`);
    const bake5 = Game.specialistSkill({ formerOccupation: 'baker', _src: { foodXp: { cook: 5 } } }, 'cook');
    check('V gate-baker-cook-xp5-steps-up', bake5 === 3, `baker cook xp5 -> ${bake5} (want 3)`);
    const bee5 = Game.specialistSkill({ formerOccupation: 'beekeeper', _src: { foodXp: { preserver: 5 } } }, 'preserver');
    check('W gate-beekeeper-preserver-xp5-steps-up', bee5 === 2, `beekeeper preserver xp5 -> ${bee5} (want 2)`);
  } catch (e) {
    check('S gate-holder-xp5-steps-up', false, 'specialistSkill threw: ' + (e && e.message));
  }

  // Q2 menu:more PROOF (live convo, real transcript):
  // (i) ignored branch, fully natural: the opening menu is short
  // (menuPages 1), so menu:more is ignored — but must still carry the
  // current line, not undefined.
  // (ii) paging branch, forced pagination state on the real convo object
  // (the pagination path itself is exercised, not stubbed): menu:more
  // must return navigation:true AND line === the last 'them' line.
  try {
    const roster = ((Game.state.village || {}).roster || []).filter(id => String(id) !== String(Game.villagerId));
    let vid = null, r0 = null;
    for (const id of roster) {
      try { if (((Game.getPerson(id) || {}).dead)) continue; } catch (e) { continue; }
      try {
        const r = Game.startConvo(id);
        if (r && typeof r.line === 'string' && r.line.length > 0) { vid = id; r0 = r; break; }
        try { Game.endConvo(id, 'done'); } catch (e2) {}
      } catch (e) { /* try the next villager */ }
      if (vid) break;
    }
    if (!vid) { check('X menumore-live-villager', false, 'no living non-player villager opened a convo'); }
    else {
      // r0 is the opening return from the successful startConvo above.
      const openLine = r0 && r0.line;
      check('X menumore-opening-line', typeof openLine === 'string' && openLine.length > 0, `opening line: ${String(openLine).slice(0, 80)}`);
      const currentLine = (() => { try { const ui = Game.convoUI ? Game.convoUI(vid) : null; return ui ? ui.line : null; } catch (e) { return null; } })();
      check('Y menumore-current-line-known', typeof currentLine === 'string' && currentLine.length > 0, `convoUI line: ${String(currentLine).slice(0, 80)}`);
      // (i) ignored branch (natural short menu).
      const rIgn = Game.convoTurn(vid, 'menu:more');
      check('Z menumore-ignored-carries-line', !!(rIgn && rIgn.ignored && rIgn.navigation && typeof rIgn.line === 'string' && rIgn.line.length > 0 && rIgn.line === currentLine),
        `ignored return: ${JSON.stringify(rIgn && { ignored: rIgn.ignored, navigation: rIgn.navigation, line: rIgn.line }).slice(0, 200)}`);
      // (ii) paging branch (forced pagination state on the real convo).
      const c = Game.convoGet ? Game.convoGet(vid) : null;
      if (!c || typeof c !== 'object') {
        check('AA menumore-paging-carries-line', false, 'convoGet unavailable');
      } else {
        c.menuPages = 2; c.menuPage = 0;
        const rPage = Game.convoTurn(vid, 'menu:more');
        const lastThem = (() => {
          try {
            const tr = (Game.convoGet(vid).transcript || []).filter(e => e && e.who === 'them');
            return tr.length ? tr[tr.length - 1].text : null;
          } catch (e) { return null; }
        })();
        check('AA menumore-paging-carries-line', !!(rPage && rPage.navigation && !rPage.ignored && typeof rPage.line === 'string' && rPage.line.length > 0 && rPage.line === lastThem),
          `paging return line: ${String(rPage && rPage.line).slice(0, 160)} vs lastThem: ${String(lastThem).slice(0, 160)}`);
        check('AB menumore-paging-advances-page', !!(rPage && rPage.choices && rPage.choices.length > 0), `choices after page: ${(rPage && rPage.choices || []).length}`);
      }
      try { Game.endConvo(vid, 'done'); } catch (e) {}
    }
  } catch (e) {
    check('X menumore-live-villager', false, 'menu:more live check threw: ' + (e && e.message) + '\n' + (e && e.stack || ''));
  }

  // (LIVE) det-gate: r111 driver 5d seed 1502 (HUNTSTAFF=2) reproduces the
  // committed r110 after-panel funnel keys at day 6.
  (function detGate() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r111-detgate-'));
    try {
      const env = Object.assign({}, process.env, { SEEDS: '1502', DAYS: '5', TAG: 'r111-detgate', EVID: dir, HUNTSTAFF: '2' });
      let stdout = '';
      try {
        stdout = execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
      } catch (e) {
        check('AC det-gate-driver-runs', false, 'driver exit/timeout: ' + (e && e.message));
        return;
      }
      const got = JSON.parse(fs.readFileSync(path.join(dir, 'journey-establishment-r111-detgate-seed1502.json'), 'utf8'));
      const ref = JSON.parse(fs.readFileSync(R110_REF, 'utf8'));
      const day6got = (got.daily || []).find(r => r.day === 6);
      const day6ref = (ref.daily || []).find(r => r.day === 6);
      check('AC det-gate-driver-runs', /SEED 1502: endDay=6/.test(stdout) && new RegExp('practiceSnaps=d1:' + (ref.startCensus || []).length).test(stdout), stdout.slice(0, 400));
      check('AD det-gate-endDay', got.endDay === 6 && got.endDay === ref.daily[4].day, `got endDay=${got.endDay}`);
      check('AE det-gate-day6-alive-pantry', !!day6got && !!day6ref && day6got.alive === day6ref.alive && day6got.pantryKcal === day6ref.pantryKcal,
        `got day6=${JSON.stringify(day6got)} ref day6=${JSON.stringify(day6ref)}`);
      const deathsGot = (got.deaths || []).filter(d => d.day <= 6).map(d => [d.day, d.cause, d.kind, d.player]);
      const deathsRef = (ref.deaths || []).filter(d => d.day <= 6).map(d => [d.day, d.cause, d.kind, d.player]);
      check('AF det-gate-deaths-to-d6', JSON.stringify(deathsGot) === JSON.stringify(deathsRef),
        `got=${JSON.stringify(deathsGot)} ref=${JSON.stringify(deathsRef)}`);
      const skillsGot = (got.skillRows || []).filter(r => r.day <= 6).length;
      const skillsRef = (ref.skillRows || []).filter(r => r.day <= 6).length;
      check('AG det-gate-skillRows-to-d6', skillsGot === skillsRef, `got=${skillsGot} ref=${skillsRef}`);
      check('AH det-gate-snapshots-present', !!got.practice && !!got.practice.d1 && got.practice.d1.snap.length > 0 &&
        !!got.practice.dEnd && got.practice.d14 === null && got.practice.d28 === null,
        `practice=${JSON.stringify(got.practice || {}).slice(0, 200)}`);
    } finally {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    }
  })();

  finish();
})();

function finish() {
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
