// compdamage-diag-20261022.js — DIAGNOSTIC (re-analysis only, NO new sims).
//
// Axis scale-onramp, lever 1/2 lens: companion damage output vs wave-4
// bands (dmg 35-95, HP 850-1500). Two corpora, both frozen:
//
//  A) armorydrive-confirm corpus (master, evidence/2026-10-22/
//     perseed-armorydrive-confirm/): 64 configs (32 control + 32 armed),
//     wave-4 fight damage tables (w4FightDmg: scholar/companion/other per
//     fight) + kill rows (w4killRows: dmgScholar/dmgCompanion/dmgOther per
//     kill). 8 kill-time villager wave-4 kills on the armed side.
//  B) stagemuster corpus (master@b73e4751e, evidence/2026-10-22/
//     perseed-stagemuster/; this worktree's base predates its landing, so
//     the script reads it from --stagedir): 32 configs (16 control + 16
//     armed), 76 armed wave-4 TB fights, ZERO armed villager kills. NO
//     per-fight damage tables were recorded by that sweep — only kill rows
//     (with damage) and staged rows. That gap is reported, not filled.
//
// Delivers:
//  (1) per-fight companion-vs-scholar damage tables for corpus A,
//      kill fights vs non-kill fights, with a stated numeric separation
//      bar (damage-majority as classifier);
//  (2) the damage-majority attribution variant from sim-splitkill.md's
//      metric review (>=50% of kill damage from non-scholar sources,
//      alongside kill-time credit) re-scoring the armorydrive-confirm
//      veterans-bar verdict (8 kill-time kills -> how many dmg-majority?
//      does the verdict change?).
//
// Canon: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 = The Mirror
// Draft; bands damage 35-95, HP 850-1500; VETERANS = kill records in
// state.waveKillLog; VILLAGER XP LAW). No canon doc covers armor/
// equipment — stated, not invented.
//
// Usage: node scripts/compdamage-diag-20261022.js [--stagedir <path>]
// Output: JSON report on stdout (deterministic key order, no timestamps).
'use strict';
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ADIR = path.join(HERE, '..', 'evidence', '2026-10-22', 'perseed-armorydrive-confirm');
let SDIR = path.join(HERE, '..', 'evidence', '2026-10-22', 'perseed-stagemuster');
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--stagedir' && process.argv[i + 1]) SDIR = process.argv[i + 1];
}

function loadDir(dir, tag) {
  const out = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.push({ file: f, tag, seed: d.seed, policy: d.policy, arm: d.arm, d });
  }
  return out;
}
const aCorp = loadDir(ADIR, 'armorydrive-confirm');
const sCorp = fs.existsSync(SDIR) ? loadDir(SDIR, 'stagemuster') : [];

// killdisc v2 kill-time villager kills: by != bearerAtKill && by != 'player'
function killTimeVillagerKills(r) {
  return (r.w4killsDetail || []).filter(e => e.by && e.by !== 'player' && e.by !== e.bearerAtKill);
}
function findKillRow(r, e) {
  const cands = ((r.d || {}).w4killRows || []).filter(k => k.day === e.d && k.mid === e.mid && k.by === e.by);
  return cands[0] || null;
}
function share(k) {
  const tot = (k.dmgScholar | 0) + (k.dmgCompanion | 0) + (k.dmgOther | 0);
  if (tot <= 0) return null;
  return ((k.dmgCompanion | 0) + (k.dmgOther | 0)) / tot;
}
function med(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(a) { return a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0; }

// ---------------- (1) per-fight damage tables, corpus A ----------------
const fights = []; // {pol, seed, day, mid, scholar, companion, other, isKill}
for (const r of aCorp) {
  const pol = r.arm === 'armorydrive' ? 'armed' : 'control';
  const killKeys = new Set((r.d.w4killRows || []).map(k => k.day + '|' + k.mid));
  for (const f of r.d.w4FightDmg || []) {
    fights.push({
      pol, seed: r.seed, day: f.day, mid: f.mid,
      scholar: f.scholar | 0, companion: f.companion | 0, other: f.other | 0,
      isKill: killKeys.has(f.day + '|' + f.mid),
    });
  }
}
const byPol = pol => fights.filter(f => f.pol === pol);
function compStats(list) {
  const abs = list.map(f => f.companion);
  const tot = list.map(f => f.scholar + f.companion + f.other);
  const sh = list.map((f, i) => tot[i] > 0 ? f.companion / tot[i] : 0);
  return {
    n: list.length,
    companionAbs: { median: med(abs), mean: Math.round(mean(abs) * 10) / 10, max: Math.max(...abs) },
    companionShare: { median: Math.round(med(sh) * 100) / 100, mean: Math.round(mean(sh) * 100) / 100 },
    scholarAbsMedian: med(list.map(f => f.scholar)),
  };
}
// classifier: damage-majority (companion share >= 0.5) predicts kill/no-kill
function classifier(fightsList) {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (const f of fightsList) {
    const tot = f.scholar + f.companion + f.other;
    const predKill = tot > 0 && f.companion / tot >= 0.5;
    if (predKill && f.isKill) tp++;
    else if (predKill && !f.isKill) fp++;
    else if (!predKill && f.isKill) fn++;
    else tn++;
  }
  const n = tp + tn + fp + fn;
  return {
    n, tp, tn, fp, fn,
    accuracy: n ? Math.round(((tp + tn) / n) * 1000) / 10 : 0,
    killRateDmgMaj: (tp + fp) ? Math.round((tp / (tp + fp)) * 1000) / 10 : 0,
    killRateScholarMaj: (fn + tn) ? Math.round((fn / (fn + tn)) * 1000) / 10 : 0,
  };
}
const perPol = {};
for (const pol of ['control', 'armed']) {
  const fs = byPol(pol);
  const kills = fs.filter(f => f.isKill), nonkills = fs.filter(f => !f.isKill);
  perPol[pol] = {
    fights: fs.length,
    killFights: compStats(kills),
    nonKillFights: compStats(nonkills),
    classifier: classifier(fs),
  };
}
// wave-4 HP bands per mid (src/data/monsters.json, [lo,hi]); relate
// per-fight companion damage to band midpoints.
const mons = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'src', 'data', 'monsters.json'), 'utf8'));
const w4hp = {};
for (const m of mons) if (m.wave === 4 && Array.isArray(m.hp)) w4hp[m.id] = { lo: m.hp[0], hi: m.hp[1], mid: (m.hp[0] + m.hp[1]) / 2 };
function bandRelation(fightsList) {
  const frac = [];
  for (const f of fightsList) {
    const b = w4hp[f.mid];
    if (b) frac.push(f.companion / b.mid);
  }
  frac.sort((x, y) => x - y);
  return {
    n: frac.length,
    companionAsFracOfBandMid: {
      median: Math.round(med(frac) * 100) / 100,
      p90: frac.length ? Math.round(frac[Math.floor(frac.length * 0.9)] * 100) / 100 : 0,
    },
    fightsCompanionGEHalfBand: frac.filter(x => x >= 0.5).length,
  };
}
const band = { control: bandRelation(byPol('control')), armed: bandRelation(byPol('armed')) };

// ---------------- (2) damage-majority re-score ----------------
function rescore(corp, armedTag) {
  const rows = [];
  for (const r of corp) {
    const pol = r.arm === armedTag ? 'armed' : 'control';
    for (const e of killTimeVillagerKills(r.d)) {
      const k = findKillRow(r, e);
      const s = k ? share(k) : null;
      rows.push({
        pol, seed: r.seed, day: e.d, mid: e.mid, by: e.by, byName: e.byName,
        dmgScholar: k ? k.dmgScholar : null, dmgCompanion: k ? k.dmgCompanion : null,
        dmgOther: k ? k.dmgOther : null,
        nonScholarShare: s == null ? null : Math.round(s * 100) / 100,
        dmgMaj: s != null && s >= 0.5,
        joined: !!k,
      });
    }
  }
  const dmgMaj = rows.filter(r => r.dmgMaj);
  return {
    killTime: {
      armed: rows.filter(r => r.pol === 'armed').length,
      control: rows.filter(r => r.pol === 'control').length,
      armedSeeds: [...new Set(rows.filter(r => r.pol === 'armed').map(r => r.seed))].sort(),
    },
    dmgMaj: {
      armed: dmgMaj.filter(r => r.pol === 'armed').length,
      control: dmgMaj.filter(r => r.pol === 'control').length,
      armedSeeds: [...new Set(dmgMaj.filter(r => r.pol === 'armed').map(r => r.seed))].sort(),
      unjoined: rows.filter(r => !r.joined).length,
    },
    rows,
  };
}
const aRescore = rescore(aCorp, 'armorydrive');
// confirm bar (from sim-armorydrive-confirm.md pre-reg): armed >= control+2
// AND >=4/16 armed seeds with >=1 — recomputed under dmgMaj.
const barCount = aRescore.dmgMaj.armed >= aRescore.dmgMaj.control + 2;
const barSeeds = aRescore.dmgMaj.armedSeeds.length >= 4;

// ---------------- stagemuster corpus ----------------
const st = { files: sCorp.length };
if (sCorp.length) {
  const armed = sCorp.filter(r => (r.policy || '').includes('stagemuster'));
  const control = sCorp.filter(r => !((r.policy || '').includes('stagemuster')));
  st.armed = {
    configs: armed.length,
    tbFights: armed.reduce((t, r) => t + (r.d.nW4TbFights != null ? r.d.nW4TbFights : (r.d.w4StagedRows || []).length), 0),
    stagedFights: armed.reduce((t, r) => t + (r.d.w4StagedRows || []).length, 0),
  };
  const sRescore = rescore(sCorp, 'stagemuster');
  st.armedKillTime = sRescore.killTime.armed;
  st.armedDmgMaj = sRescore.dmgMaj.armed;
  st.controlKillTime = sRescore.killTime.control;
  st.controlDmgMaj = sRescore.dmgMaj.control;
  st.killRowsTotal = sCorp.reduce((t, r) => t + (r.d.w4killRows || []).length, 0);
  st.killRowsDmgMaj = sCorp.reduce((t, r) => t + (r.d.w4killRows || []).filter(k => {
    const tot = (k.dmgScholar | 0) + (k.dmgCompanion | 0) + (k.dmgOther | 0);
    return tot > 0 && ((k.dmgCompanion | 0) + (k.dmgOther | 0)) / tot >= 0.5;
  }).length, 0);
}

const report = {
  instrument: 'compdamage-diag-20261022',
  corpora: {
    armorydriveConfirm: { files: aCorp.length, control: aCorp.filter(r => r.arm !== 'armorydrive').length, armed: aCorp.filter(r => r.arm === 'armorydrive').length },
    stagemuster: st,
  },
  perFight: {
    note: 'isKill = fight (day,mid) matched >=1 w4killRows entry. w4FightDmg exists only in the armorydrive-confirm corpus.',
    control: perPol.control,
    armed: perPol.armed,
  },
  band: { note: 'wave-4 HP bands from src/data/monsters.json: 850-1500 (see MONSTER-WAVES.md)', w4hp, perPol: band },
  rescore: {
    note: 'damage-majority variant from sim-splitkill.md metric review: >=50% of kill damage from non-scholar sources (dmgCompanion+dmgOther), alongside killdisc-v2 kill-time credit',
    armorydriveConfirm: {
      killTimeArmed: aRescore.killTime.armed, killTimeControl: aRescore.killTime.control,
      killTimeArmedSeeds: aRescore.killTime.armedSeeds,
      dmgMajArmed: aRescore.dmgMaj.armed, dmgMajControl: aRescore.dmgMaj.control,
      dmgMajArmedSeeds: aRescore.dmgMaj.armedSeeds,
      unjoinedRows: aRescore.dmgMaj.unjoined,
      detail: aRescore.rows.filter(r => r.pol === 'armed').map(r => ({
        seed: r.seed, day: r.day, mid: r.mid, byName: r.byName,
        dmgScholar: r.dmgScholar, dmgCompanion: r.dmgCompanion,
        nonScholarShare: r.nonScholarShare, dmgMaj: r.dmgMaj,
      })),
      barOnDmgMaj: { count: barCount, seeds: barSeeds, verdict: barCount && barSeeds ? 'GO' : 'NO-GO' },
    },
  },
};
process.stdout.write(JSON.stringify(report, null, 1) + '\n');
