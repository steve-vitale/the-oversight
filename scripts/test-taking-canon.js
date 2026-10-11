// TAKING CANON proof (2026-10-11) — docs/KIN.md: the Taking happened at the
// Scattering (day zero), not after week one. The 'watched' beat in
// systemArrivalBeats() was rewritten; sys-day7-05.mp3 regenerated; the sweep
// must find zero remaining "after a week" taking claims.
// Usage: node scripts/test-taking-canon.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/audio/system/manifest.json'), 'utf8'));

// 1. The watched beat's taking line: START timing, no week timing.
const beatRe = /id: 'watched'[\s\S]*?lines: \[([\s\S]*?)\n        \},/;
const beatM = gameSrc.match(beatRe);
ok(!!beatM, 'watched beat found in systemArrivalBeats()');
const beatLines = beatM ? beatM[1] : '';
const sysMatches = [...beatLines.matchAll(/\{ who: 'sys', text: '((?:[^'\\]|\\.)*)' \}/g)];
const takingLine = sysMatches[1] ? sysMatches[1][1] : '';
ok(/Right at the START/.test(takingLine), 'taking line says RIGHT AT THE START');
ok(!/all week/i.test(takingLine), 'taking line has no "all week" timing');
ok(!/removed them/i.test(takingLine), 'old "removed them" phrasing gone');
ok(/boring half/i.test(takingLine), 'taking line names the boring half');
ok(/NAPPING/i.test(takingLine), 'taking line mentions the napping kids');
ok(/SAFE! Somewhere BORING/i.test(takingLine), 'taking line keeps fate cheerfully vague');

// 2. Manifest sys-day7-05 matches the beat (modulo emoji, which TTS text drops).
const entry = manifest.find(x => x.id === 'sys-day7-05');
ok(!!entry, 'manifest has sys-day7-05');
const beatPlain = takingLine.replace(/\\'/g, "'").replace(/ 🎉$/, '');
ok(entry.text === beatPlain, 'manifest text matches beat text (emoji stripped)');
ok(entry.chars === entry.text.length, 'manifest chars matches text length');

// 3. Sweep: zero remaining "after a week" taking claims in src/js + docs.
const sweepDirs = [path.join(ROOT, 'src/js'), path.join(ROOT, 'docs')];
const badPatterns = [/sat\? all week/i, /removed them\. poor sportsmanship/i, /after the first week/i];
let hits = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== '_archive') walk(p); continue; }
    if (!/\.(js|md|json)$/.test(f) || f === 'manifest.json') continue;
    const s = fs.readFileSync(p, 'utf8');
    for (const re of badPatterns) {
      const m = s.match(re);
      if (m) hits.push(p.replace(ROOT + '/', '') + ': ' + m[0].slice(0, 50));
    }
  }
}
sweepDirs.forEach(walk);
// docs/KIN.md legitimately discusses the corrected canon — filter it out.
hits = hits.filter(h => !h.startsWith('docs/KIN.md'));
ok(hits.length === 0, 'sweep finds zero competing taking claims' + (hits.length ? ' -> ' + hits.join('; ') : ''));

// 4. MP3 valid.
try {
  const out = execSync('ffprobe -v error -show_entries format=duration -of csv=p=0 ' +
    path.join(ROOT, 'src/audio/system/sys-day7-05.mp3'), { encoding: 'utf8' }).trim();
  ok(parseFloat(out) > 5, 'sys-day7-05.mp3 valid (' + out + 's)');
} catch (e) { ok(false, 'sys-day7-05.mp3 ffprobe failed'); }

// 5. KIN.md exists and is registered in CANON.md.
ok(fs.existsSync(path.join(ROOT, 'docs/KIN.md')), 'docs/KIN.md exists');
const canon = fs.readFileSync(path.join(ROOT, 'docs/CANON.md'), 'utf8');
ok(canon.includes('docs/KIN.md'), 'CANON.md registers KIN.md');
const kin = fs.readFileSync(path.join(ROOT, 'docs/KIN.md'), 'utf8');
ok(/day zero/i.test(kin), 'KIN.md states day-zero timing');
ok(/good galactic table path/i.test(kin), 'KIN.md reserves kids return for good table path');
ok(/never confirm/i.test(kin), 'KIN.md keeps taken fate unconfirmed');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
