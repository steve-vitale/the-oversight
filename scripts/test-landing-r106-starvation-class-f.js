// Proof test for the r106 landing finding / R106-STARVATION-CLASS-F
// analyzer fix (instrument, zero src/js):
//   r106 seed 891: Chloe (d23) and Xiaoli (d24) died of starvation while
//   the pantry held 1000–1800 kcal for 10–11 people. The analyzer labeled
//   both CAUSE CLASS E ("at Haven, pantry held food — DOORSTEP"), borrowing
//   the SCHOLAR's location (the scholar was at Haven, fed by her separate
//   meal) for two villagers who were not the scholar. A nonzero pantry is
//   famine, not a doorstep failure, when it cannot feed the village — and
//   the deceased's own location was never recorded. The fix: a starvation
//   death whose who is not the mantle holder on that day classifies F
//   (NPC starvation — scholar-scoped series cannot adjudicate location or
//   feeding), and the scholar's own starvation deaths still classify A–E.
// Usage: node scripts/test-landing-r106-starvation-class-f.js
//   Exits 0 with PASS lines on the fixed analyzer; exits 1 (FAIL) on the
//   pre-fix analyzer, which labels both NPC deaths E — the before/after
//   proof. Reads the r106 panel corpus (goal hidden_files) and runs the
//   analyzer on temp copies; the temp dirs are removed afterwards.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const HOME = process.env.HOME || '/home/hatch';
const CORPUS = path.join(HOME, 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-05/landing-r106');
const ANALYZER = path.join(__dirname, 'analyze-landing-r104-20261105.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
if (!fs.existsSync(path.join(CORPUS, 'journey-landing-r62-census-891.json'))) {
  console.error('FAIL: r106 corpus missing: ' + CORPUS + ' (run the r106 panel first)');
  process.exit(2);
}
const runAnalyzer = (dir) => {
  try { return execFileSync('node', [ANALYZER, dir], { encoding: 'utf8', timeout: 120000 }); }
  catch (e) { console.log('analyzer run failed: ' + (e && e.message)); if (e && e.stdout) console.log(String(e.stdout).slice(-2000)); return null; }
};
// The class line follows its STARVATION line; pair them by order.
const classAfter = (out, whoDayRe) => {
  const lines = String(out || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (whoDayRe.test(lines[i])) {
      for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
        const m = /CAUSE CLASS ([A-F])/.exec(lines[j]);
        if (m) return m[1];
      }
    }
  }
  return null;
};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r106-classf-'));
try {
  // Case NPC: the unmutated 891 census — both starvation deaths are
  // villagers who never held the mantle (Layla held it throughout).
  const npcDir = path.join(tmp, 'npc');
  fs.mkdirSync(npcDir);
  fs.copyFileSync(path.join(CORPUS, 'journey-landing-r62-census-891.json'), path.join(npcDir, 'journey-landing-r62-census-891.json'));
  const npcOut = runAnalyzer(npcDir);
  check('analyzer ran on the NPC corpus', !!npcOut);
  check('Chloe d23 (NPC) classifies F, not E', classAfter(npcOut, /STARVATION d23 Chloe/) === 'F', 'class=' + classAfter(npcOut, /STARVATION d23 Chloe/));
  check('Xiaoli d24 (NPC) classifies F, not E', classAfter(npcOut, /STARVATION d24 Xiaoli/) === 'F', 'class=' + classAfter(npcOut, /STARVATION d24 Xiaoli/));
  check('no CAUSE CLASS E in the NPC run', !/CAUSE CLASS E/.test(npcOut || ''));
  // Case SCHOLAR: the same census with the death rewritten as the scholar
  // (Layla, gen_xlofkda — series[0].journalHolder, no mantle pass) dying
  // of starvation at Haven with food in the pantry. Guards against
  // overcorrection: scholar deaths must still classify E.
  const schDir = path.join(tmp, 'scholar');
  fs.mkdirSync(schDir);
  const d = JSON.parse(fs.readFileSync(path.join(CORPUS, 'journey-landing-r62-census-891.json'), 'utf8'));
  d.deaths = [{ day: 23, who: 'gen_xlofkda', cause: 'starvation', kind: 'villager' }];
  d.starvAutopsies = [{ who: 'gen_xlofkda', day: 23, cause: 'starvation', loc: 'haven', scholarKcal: 1165, packKcal: 0, pantryEdible: 1800, pop: 11, seriesTail: [] }];
  fs.writeFileSync(path.join(schDir, 'journey-landing-r62-census-900.json'), JSON.stringify(d));
  const schOut = runAnalyzer(schDir);
  check('analyzer ran on the scholar corpus', !!schOut);
  check('Layla d23 (scholar) still classifies E', classAfter(schOut, /STARVATION d23 Layla/) === 'E', 'class=' + classAfter(schOut, /STARVATION d23 Layla/));
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { console.log('temp cleanup note: ' + (e && e.message)); }
}
console.log(fail === 0 ? 'STARVATION-CLASS-F: PASS' : 'STARVATION-CLASS-F: FAIL');
process.exit(fail === 0 ? 0 : 1);
