'use strict';
// test-tellinghook-20261106.js — proof for the narrated-telling hook
// (evidence/2026-11-06/sim-durablepair-a-prereg.md, part b). The hook is
// a BRANCH PATCH, not a landing: the drive's telling site
// (objTellHuntSite, src/js/villager-objectives.js) exists only on the
// drive branch, so the patch lives in evidence and is proven on a
// throwaway copy of that branch. Run:
//   node scripts/test-tellinghook-20261106.js
// Sections:
//   T1 patch hygiene — the patch touches exactly one file
//      (src/js/villager-objectives.js, inside objTellHuntSite), names
//      the beast through the knowledge-gated noun and the teller, fires
//      only on a genuinely-new heard record (toldBefore/toldAfter), and
//      applies cleanly to a pristine copy of the drive-branch file
//      (extracted via git archive; SKIPPED with a clear line if the
//      drive branch is absent from this checkout).
//   T2 recorded probe outputs — the unpatched re-run of seed 99866 on
//      the drive branch has ZERO telling lines; the patched re-run has
//      >= 1 telling line, each naming a teller and a beast; driveSeek
//      counters, kills and killer death days are identical between the
//      two (narration-only: no trajectory change).
//   T3 probe-instrument fidelity — the unpatched probe reproduces the
//      committed drive64 transcript values for seed 99866 exactly
//      (told 27 / seeks 5 / scoutSeen 0 / scoutEmpty 5 / 2 wave-4 kills
//      / pair second kill d104), so the before/after comparison is
//      anchored on the published run, not on the probe itself.
// No game code is touched on this branch; the patch file is evidence.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repo = path.join(__dirname, '..');
const evDir = path.join(repo, 'evidence', '2026-11-06');
const corpusDir = path.join(evDir, 'durablepair-corpus');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}

const patchPath = path.join(evDir, 'sim-durablepair-a-telling-hook.patch');
const patch = fs.readFileSync(patchPath, 'utf8');

// ---- T1: patch hygiene + applies cleanly ----
{
  const files = [...patch.matchAll(/^diff --git a\/(\S+) b\/(\S+)/gm)].map(m => m[1]);
  check('T1 patch touches exactly one file', files.length === 1, 'got ' + JSON.stringify(files));
  check('T1 that file is src/js/villager-objectives.js', files[0] === 'src/js/villager-objectives.js', 'got ' + files[0]);
  check('T1 patch is inside objTellHuntSite', /objTellHuntSite/.test(patch));
  check('T1 hook uses the haven-news relay', /sayHavenNews\(/.test(patch));
  check('T1 beast named via knowledge-gated display name (never true name)', /monsterDisplayName\(site\.mid\)/.test(patch));
  check('T1 teller named via firstRef', /firstRef\(vid\)/.test(patch));
  check('T1 fires only on a genuinely-new heard record', /toldBefore/.test(patch) && /toldAfter > toldBefore/.test(patch));
  check('T1 line names beast + teller', /tells the hall: going after/.test(patch));
  check('T1 no RNG, no state write besides the SAY', !/Math\.random/.test(patch) && !/driveSeek\[[^\]]+\] =/.test(patch.replace(/toldBefore = 0/g, '').replace(/toldAfter = 0/g, '')));

  const branch = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'sim-drive64-measure'], { cwd: repo, encoding: 'utf8' });
  if (branch.status !== 0) {
    console.log('SKIP T1 apply check — drive branch sim-drive64-measure absent from this checkout (patch + probe outputs remain the record)');
  } else {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tellinghook-apply-'));
    try {
      fs.mkdirSync(path.join(tmp, 'src', 'js'), { recursive: true });
      const arc = spawnSync('git', ['archive', 'sim-drive64-measure', 'src/js/villager-objectives.js'], { cwd: repo, encoding: 'buffer' });
      check('T1 git archive of the drive-branch file succeeds', arc.status === 0 && arc.stdout && arc.stdout.length > 0);
      if (arc.status === 0) {
        const tar = spawnSync('tar', ['-x', '-C', tmp], { input: arc.stdout, encoding: 'buffer' });
        check('T1 archive extracts', tar.status === 0, 'tar status=' + tar.status);
        const chk = spawnSync('git', ['apply', '--check', patchPath], { cwd: tmp, encoding: 'utf8' });
        check('T1 patch applies cleanly to pristine drive-branch file', chk.status === 0, (chk.stderr || '').slice(0, 300));
        if (chk.status === 0) {
          const app = spawnSync('git', ['apply', patchPath], { cwd: tmp, encoding: 'utf8' });
          check('T1 patch applies', app.status === 0);
          const applied = fs.readFileSync(path.join(tmp, 'src', 'js', 'villager-objectives.js'), 'utf8');
          check('T1 applied file carries the hook', /tells the hall: going after/.test(applied) && /toldAfter > toldBefore/.test(applied));
        }
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
}

// ---- T2 + T3: recorded probe outputs ----
{
  const un = JSON.parse(fs.readFileSync(path.join(evDir, 'tellinghook-probe-99866-unpatched.json'), 'utf8'));
  const pa = JSON.parse(fs.readFileSync(path.join(evDir, 'tellinghook-probe-99866-patched.json'), 'utf8'));
  const tx = JSON.parse(fs.readFileSync(path.join(corpusDir, 'drive64-transcript-99866.json'), 'utf8'));

  check('T3 unpatched probe reproduces committed told=27', (un.driveSeek.told || 0) === 27, 'got ' + (un.driveSeek.told || 0));
  check('T3 unpatched probe reproduces committed seeks=5', (un.driveSeek.seeks || 0) === 5);
  check('T3 unpatched probe reproduces committed scoutSeen=0', (un.driveSeek.scoutSeen || 0) === 0);
  check('T3 unpatched probe reproduces committed scoutEmpty=5', (un.driveSeek.scoutEmpty || 0) === 5);
  check('T3 unpatched probe reproduces committed 2 wave-4 kills', un.kills.length === 2, 'got ' + un.kills.length);
  check('T3 unpatched probe reproduces committed transcript kills',
    JSON.stringify(un.kills.map(k => [k.day, k.by])) === JSON.stringify(tx.kills.map(k => [k.day, k.by])),
    JSON.stringify(un.kills.map(k => [k.day, k.by])));

  check('T2 unpatched run has ZERO telling lines', un.tellingCount === 0, 'got ' + un.tellingCount);
  check('T2 patched run has >= 1 telling line', pa.tellingCount >= 1, 'got ' + pa.tellingCount);
  check('T2 every telling line names a teller + a beast',
    pa.tellingLines.length === pa.tellingCount &&
    pa.tellingLines.every(l => /tells the hall: going after .+\./.test(l)),
    JSON.stringify(pa.tellingLines.slice(0, 2)));
  check('T2 telling lines name a real beast descriptor, not "something"',
    pa.tellingLines.every(l => !/going after something\./.test(l)),
    JSON.stringify(pa.tellingLines.slice(0, 2)));
  check('T2 driveSeek counters identical unpatched vs patched',
    JSON.stringify(un.driveSeek) === JSON.stringify(pa.driveSeek),
    JSON.stringify(un.driveSeek) + ' vs ' + JSON.stringify(pa.driveSeek));
  check('T2 kills identical unpatched vs patched',
    JSON.stringify(un.kills) === JSON.stringify(pa.kills));
  check('T2 killer death days identical unpatched vs patched',
    JSON.stringify(un.killersDeathDay) === JSON.stringify(pa.killersDeathDay));
  check('T2 run length identical (days)', un.days === pa.days, un.days + ' vs ' + pa.days);
}

console.log(failures === 0 ? 'ALL TELLINGHOOK PROOF CHECKS PASS' : failures + ' TELLINGHOOK PROOF CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);
