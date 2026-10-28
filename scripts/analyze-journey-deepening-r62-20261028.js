// analyze-journey-deepening-r62-20261028.js -- panel summary for the R61 run.
// Reads r62 seed JSONs + transcripts from the goal evidence dir (2026-10-28)
// and prints, per seed: survival/wave/fights/deaths, invite-decision counts
// with distinct pairs, betrayal-plot formation (ever-seen ids + checkpoint
// snapshots), pantry monster-meat snapshots + test-call counts, and the
// r59-style transcript betrayal-only stats. R61 IS the baseline this run compares against (descriptive only): no
// pass/fail is scored here against r55-r60 aggregates; values are printed
// for the run note to adopt as the baseline. R62 ADDS favor-census +
// outing-arm sections per seed.
// Usage: node scripts/analyze-journey-deepening-r62-20261028.js
// Reads only; writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-28');
let totalInv = 0, totalAcc = 0, totalPlots = 0, totalTests = 0, totalFormations = 0, totalSafe = 0, cookedMismatch = 0;
let totalFavorTrans = 0, totalOutingAttempts = 0, totalOutingKept = 0;
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r62-seed${seed}.json`);
  if (!fs.existsSync(fp)) { console.log(`=== ${seed}: SEED JSON MISSING`); continue; }
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = (a.matflow || {}).intraday || {};
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const made = (ca.made && ca.made.bark_armor) || 0;
  const inv = d.inviteDecisions || [];
  totalInv += inv.length; totalAcc += inv.filter(x => x.accept).length;
  const byKind = {};
  const pairs = new Set();
  for (const x of inv) {
    const k = x.kind || '?';
    byKind[k] = byKind[k] || { n: 0, acc: 0 };
    byKind[k].n++; if (x.accept) byKind[k].acc++;
    pairs.add(`${x.inviter}->${x.invitee}`);
  }
  const plotsEver = d.plotIdsEver || [];
  totalPlots += plotsEver.length;
  const tests = d.meatTestCalls || [];
  totalTests += tests.length;
  const safes = d.meatSafeCalls || [];
  totalSafe += safes.length;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  fightsTotal=${d.fightsTotal} deaths=${(d.deaths || []).length} vineGainCalls=${mf.forageVineGainCalls} madeBark=${made}`);
  console.log(`  inviteDecisions: n=${inv.length} accept=${inv.filter(x => x.accept).length} pairs=${pairs.size} byKind=${JSON.stringify(byKind)}`);
  for (const x of inv) console.log(`    invite d${x.day} kind=${x.kind} ${x.inviter} -> ${x.invitee} chance=${x.chance} accept=${x.accept} reasons=${JSON.stringify(x.reasons)}`);
  console.log(`  plotsEver: n=${plotsEver.length} ${plotsEver.map(p => `${p.id}(d${p.day} ${p.inviter}->${p.target})`).join(' ')}`);
  const formations = d.plotFormations || [];
  totalFormations += formations.length;
  console.log(`  plotFormations: n=${formations.length} ${formations.map(f => `${f.id}(d${f.day} ${f.leader}->${f.target})`).join(' ')}`);
  for (const s of (d.plotSnaps || [])) console.log(`    plotSnap d${s.day}: total=${s.total} active=${s.active} sprung=${s.sprung} resolved=${s.resolved}`);
  console.log(`  meatTestCalls: n=${tests.length} ${tests.map(t => `d${t.day}`).join(' ')}`);
  console.log(`  meatSafeCalls: n=${safes.length} ${safes.map(t => `d${t.day}:${t.mid}(${t.how})`).join(' ')}`);
  const codex = d.codexMeatSnaps || [];
  const codexDays = [...new Set(codex.filter(c => (c.n || 0) > 0).map(c => c.day))];
  console.log(`  codexMeat: snaps=${codex.length} daysWithVerdict=${codexDays.length} [${codexDays.join(',')}]`);
  for (const c of codex.filter(c => (c.n || 0) > 0)) {
    // print only when the entry set changes vs previous verdict snap
    const idx = codex.indexOf(c);
    const prev = codex.slice(0, idx).filter(x => (x.n || 0) > 0).pop();
    if (!prev || JSON.stringify(prev.entries) !== JSON.stringify(c.entries)) console.log(`    codexMeat d${c.day}(${c.phase}): ${JSON.stringify(c.entries)}`);
  }
  const meatSnaps = d.meatPantrySnaps || [];
  const meatDays = [...new Set(meatSnaps.filter(s => (s.units || 0) > 0).map(s => s.day))];
  const maxMeatUnits = meatSnaps.reduce((m, s) => Math.max(m, s.units || 0), 0);
  console.log(`  meatPantry: snaps=${meatSnaps.length} daysWithMeat=${meatDays.length} [${meatDays.join(',')}] maxUnits=${maxMeatUnits}`);
  for (const s of meatSnaps.filter(s => (s.units || 0) > 0)) {
    const states = {};
    for (const r of (s.rows || [])) { const k = r.foodState || '?'; states[k] = (states[k] || 0) + (r.units || 0); }
    const expectCooked = states['cooked'] || 0;
    if ((s.cookedUnits || 0) !== expectCooked) { cookedMismatch++; console.log(`    COOKED-MISMATCH d${s.day}(${s.phase}): cookedUnits=${s.cookedUnits} foodStateCooked=${expectCooked}`); }
    console.log(`    meatPantry d${s.day}(${s.phase}): rows=${s.n} units=${s.units} cookedUnits=${s.cookedUnits} states=${JSON.stringify(states)} ids=${(s.rows || []).map(r => r.id || r.plantId).join(',')}`);
  }
  // MEAT-ATTR: cooked+edible transitions across dawn snaps vs mark/codex evidence
  {
    const dawns = meatSnaps.filter(s => s.phase === 'dawn').sort((a, b) => a.day - b.day);
    let prevById = new Map();
    for (const s of dawns) {
      const cur = new Map();
      for (const r of (s.rows || [])) cur.set(r.id || r.plantId, r);
      for (const [id, r] of cur) {
        const prev = prevById.get(id);
        if (r.foodState === 'cooked' && r.edible && !(prev && prev.foodState === 'cooked' && prev.edible)) {
          const marks = safes.filter(m => m.day <= s.day && (m.mid === id.replace(/^meat_/, '') || id.includes(m.mid)));
          const cx = (d.codexMeatSnaps || []).filter(c => c.day <= s.day).flatMap(c => c.entries || []).filter(e => id.includes(e.mid) || e.mid === id.replace(/^meat_/, ''));
          console.log(`    COOKED-TRANSITION d${s.day} ${id} units=${r.units} kcalEach=${r.kcalEach} marks<=day=${marks.map(m => `d${m.day}:${m.mid}`).join(',') || 'NONE'} codex<=day=${cx.length ? JSON.stringify(cx.slice(-1)) : 'NONE'}`);
        }
      }
      prevById = cur;
    }
  }
  const fc = d.favorCensus || {};
  const ftrans = fc.transitions || [];
  totalFavorTrans += ftrans.length;
  console.log(`  favorCensus: transitions=${ftrans.length} snaps=${(fc.snaps || []).length} errors=${(fc.errors || []).length}`);
  for (const t of ftrans) console.log(`    favor d${t.day}(${t.tag}) ${t.vid} ${t.from || 'none'} -> ${t.to} asked=${t.row.askedDay} promised=${t.row.promisedDay} meet=${t.row.meetDay} run=${t.row.forageRun ? JSON.stringify(t.row.forageRun) : 'none'} kept=${t.row.promiseKept} broken=${t.row.promiseBroken}`);
  const finals = ((fc.snaps || []).slice(-1)[0] || {}).favors || [];
  for (const f of finals) console.log(`    favorFinal ${f.vid} state=${f.state} asked=${f.askedDay} promised=${f.promisedDay} meet=${f.meetDay} run=${f.forageRun ? JSON.stringify(f.forageRun) : 'none'} kept=${f.promiseKept} broken=${f.promiseBroken}`);
  const oa = d.outingArm || [];
  totalOutingAttempts += oa.length;
  totalOutingKept += oa.filter(o => o.outcome === 'delivered-promise-kept').length;
  console.log(`  outingArm: attempts=${oa.length} errors=${(d.outingArmErrors || []).length}`);
  for (const o of oa) {
    console.log(`    outing d${o.day} ${o.name || o.vid} favor=${o.favorId} outcome=${o.outcome} blocker=${o.blocker || ''} door=${o.door ? JSON.stringify(o.door) : ''} travelHome=${o.travelHome ? JSON.stringify(o.travelHome) : ''} steps=${o.steps ?? ''} final=${o.final ? JSON.stringify(o.final) : ''}`);
    if (o.diagFirst) console.log(`      diagFirst: ${JSON.stringify(o.diagFirst)}`);
    if (o.diagAfterPosition) console.log(`      diagAfterPosition: ${JSON.stringify(o.diagAfterPosition)}`);
    if (o.posRounds) console.log(`      posRounds: ${JSON.stringify(o.posRounds)}`);
    for (const st of (o.stages || [])) console.log(`      stage ${st.stage}: ready=${st.ready} ok=${st.ok} action=${st.action || ''} reason=${st.reason || ''} blocker=${st.blocker || ''} line=${st.line ? String(st.line).slice(0, 160) : ''}`);
  }
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r62-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const betrayalTurns = offered.filter(m => /,betrayal:accept(,|$)/.test(',' + m[1] + ',')).length;
    const betrayalOnly = offered.filter(m => {
      const ids = m[1].split(',').filter(Boolean);
      return ids.includes('betrayal:accept') && ids.every(id => /^betrayal:|^leave$|^silence$/.test(id));
    }).length;
    const youBetrayal = (txt.match(/YOU: \[betrayal:/g) || []).length;
    const steers = (txt.match(/\(STEER58: gated\)/g) || []).length;
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} betrayalAcceptTurns=${betrayalTurns} betrayalOnlyTurns=${betrayalOnly} youBetrayalPicks=${youBetrayal} steers=${steers}`);
  }
}
console.log(`TOTAL inviteDecisions=${totalInv} accept=${totalAcc} plotsEver=${totalPlots} plotFormations=${totalFormations} meatTestCalls=${totalTests} meatSafeCalls=${totalSafe} cookedMismatch=${cookedMismatch} favorTransitions=${totalFavorTrans} outingAttempts=${totalOutingAttempts} outingKept=${totalOutingKept}`);
