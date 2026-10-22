// test-compdamage-20261022.js — proof gates for the compdamage DIAG instrument.
// Re-analysis only: no sims, no game code touched. Gates are green/red on the
// INSTRUMENT's determinism and correct reading of the two frozen corpora —
// never assertions about what the game SHOULD do.
//
// Usage: node scripts/test-compdamage-20261022.js [--stagedir <path>]
// Exit 0 = all green.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const HERE = __dirname;
const DIAG = path.join(HERE, 'compdamage-diag-20261022.js');
const ADIR = path.join(HERE, '..', 'evidence', '2026-10-22', 'perseed-armorydrive-confirm');
let SDIR = path.join(HERE, '..', 'evidence', '2026-10-22', 'perseed-stagemuster');
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--stagedir' && process.argv[i + 1]) SDIR = process.argv[i + 1];
}

let pass = 0, fail = 0;
const results = [];
function gate(id, ok, detail) {
  if (ok) pass++; else fail++;
  results.push(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`);
}

function runDiag() {
  const out = execSync(`node "${DIAG}" --stagedir "${SDIR}"`, { cwd: HERE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out);
}

// G0: corpora present with expected counts.
const aFiles = fs.readdirSync(ADIR).filter(f => f.endsWith('.json'));
gate('G0a-armorydrive-files', aFiles.length === 64, `${aFiles.length} files (32 control + 32 armed)`);
const sFiles = fs.existsSync(SDIR) ? fs.readdirSync(SDIR).filter(f => f.endsWith('.json')) : [];
gate('G0b-stagemuster-files', sFiles.length === 32, `${sFiles.length} files (16 control + 16 armed)`);

// G1: w4FightDmg schema — every row numeric scholar/companion/other.
let bad = 0, nFights = 0;
for (const f of aFiles) {
  const d = JSON.parse(fs.readFileSync(path.join(ADIR, f), 'utf8'));
  for (const row of d.w4FightDmg || []) {
    nFights++;
    if (typeof row.scholar !== 'number' || typeof row.companion !== 'number' || typeof row.other !== 'number') bad++;
  }
}
gate('G1-fightdmg-schema', bad === 0 && nFights === 283, `${nFights} rows, ${bad} bad`);

// G2: killRows damage fields present wherever the instrument joins a
// kill-time villager kill (join = day+mid+by against w4killsDetail).
let joined = 0, missing = 0;
for (const f of aFiles) {
  const d = JSON.parse(fs.readFileSync(path.join(ADIR, f), 'utf8'));
  for (const e of d.w4killsDetail || []) {
    if (!(e.by && e.by !== 'player' && e.by !== e.bearerAtKill)) continue;
    const k = (d.w4killRows || []).find(k2 => k2.day === e.d && k2.mid === e.mid && k2.by === e.by);
    if (k && typeof k.dmgScholar === 'number' && typeof k.dmgCompanion === 'number') joined++;
    else missing++;
  }
}
gate('G2-killrow-join', missing === 0 && joined === 8, `joined ${joined}, missing ${missing}`);

// G3: determinism — two runs, byte-identical report.
const r1 = runDiag();
const h1 = crypto.createHash('sha256').update(JSON.stringify(r1)).digest('hex');
const r2 = runDiag();
const h2 = crypto.createHash('sha256').update(JSON.stringify(r2)).digest('hex');
gate('G3-deterministic', h1 === h2, `sha256 ${h1.slice(0, 12)}`);

// G4: known answers on the frozen armorydrive-confirm corpus (re-analysis,
// not game claims): the 8 kill-time villager kills and their shares.
const expect = {
  '65475|110|algorithm|sigrun_eiriksdottir': ['Sigrun', 0.59, true],
  '65477|98|influencer|saleh_kano': ['Saleh', 0.49, false],
  '65477|107|congregation|shuting_zhao': ['Shuting', 0.41, false],
  '65477|107|suburb|shuting_zhao': ['Shuting', 0.55, true],
  '65477|127|strike|nadia_khoury': ['Nadia', 0.16, false],
  '65478|93|audit|giulia_ferrari': ['Giulia', 0.29, false],
  '65484|158|reunion|victor_okafor': ['Victor', 0.32, false],
  '65486|95|congregation|meera_nair': ['Meera', 0.35, false],
};
const detail = r1.rescore.armorydriveConfirm.detail;
// match each expectation by (seed, day, mid, byName); Shuting's two kills
// share seed/day but differ by mid (congregation vs suburb), so the key is
// the full tuple.
let ok4 = detail.length === 8;
for (const [k, v] of Object.entries(expect)) {
  const [seed, day, mid] = k.split('|');
  const dd = detail.find(x => x.seed === +seed && x.day === +day && x.mid === mid && x.byName === v[0]);
  if (!dd || dd.nonScholarShare !== v[1] || dd.dmgMaj !== v[2]) { ok4 = false; break; }
}
gate('G4-known-answers', ok4, `${detail.length} kill-time kills match frozen expectations`);

// G5: damage-majority re-score counts: armed=2, control=0 (Sigrun + Shuting's suburb).
const rs = r1.rescore.armorydriveConfirm;
gate('G5-rescore-counts', rs.dmgMajArmed === 2 && rs.dmgMajControl === 0,
  `armed=${rs.dmgMajArmed} control=${rs.dmgMajControl}; bar verdict=${rs.barOnDmgMaj.verdict}`);

// G6: stagemuster corpus reads: 76 armed TB fights, 71 staged, 0 armed
// villager kills (kill-time AND dmg-maj), 6/1 on control.
const st = r1.corpora.stagemuster;
gate('G6-stagemuster', st.files === 32 && st.armed.tbFights === 76 && st.armed.stagedFights === 71 &&
  st.armedKillTime === 0 && st.armedDmgMaj === 0 && st.controlKillTime === 6 && st.controlDmgMaj === 1,
  JSON.stringify({ tb: st.armed.tbFights, staged: st.armed.stagedFights, aKT: st.armedKillTime, aDM: st.armedDmgMaj, cKT: st.controlKillTime, cDM: st.controlDmgMaj }));

// G7: separation table present and numeric for both policies; the stated bar
// (armed kill vs non-kill companion damage) is computed, not empty.
const pf = r1.perFight;
const barOk = pf.armed.killFights.n > 0 && pf.armed.nonKillFights.n > 0 &&
  typeof pf.armed.killFights.companionAbs.median === 'number' &&
  typeof pf.armed.classifier.accuracy === 'number';
gate('G7-separation-bar', barOk,
  `armed kill n=${pf.armed.killFights.n} compAbsMed=${pf.armed.killFights.companionAbs.median} vs nokill n=${pf.armed.nonKillFights.n} compAbsMed=${pf.armed.nonKillFights.companionAbs.median}; classifier acc=${pf.armed.classifier.accuracy}%`);

// G8: wave-4 HP bands read from data: 10 wave-4 entries; 9 in the 850-1500
// band (herald 700-900 is the wave-6 herald scaffold, MONSTER-WAVES.md).
const hp = r1.band.w4hp;
const bands = Object.values(hp);
const inBand = bands.filter(b => b.lo >= 850 && b.hi <= 1500);
gate('G8-wave4-bands', bands.length === 10 && inBand.length === 9,
  `${bands.length} wave-4 entries, ${inBand.length} in the 850-1500 band`);

console.log(results.join('\n'));
console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
