#!/usr/bin/env node
// analyze-seatblow-20261017.js — attribution + verdict over the per-seed
// seatblow JSONs (no sims). Exit 0 on PRIMARY GO, 1 on diagnostic MISS.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-seatblow');
const NUM_KEYS = ['seed', 'days', 'gameDays', 'maxRank', 'national', 'table', 'wins', 'maxWave',
  'seatEver', 'inviteEver', 'tableDone', 'seatTakenByDriver', 'arcMax', 'feastSurgeUsedEnd',
  'sentimentTaughtEnd', 'buffGrants', 'noteCalls', 'noteMarked', 'unmarkedCalls', 'upliftN',
  'instrumentErrors'];
const DAY_NULL_KEYS = ['seatDay', 'inviteDay', 'seatTakenDay']; // day number or null
const STR_NULL_KEYS = ['seatKind', 'pathTaken', 'branchTaken', 'phaseEnd', 'endReason'];

function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
  if (!files.length) { console.error('NO PER-SEED FILES in ' + DIR); process.exit(2); }
  const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

  // --- schema check: numeric keys numeric, no NaN/undefined leaks ---
  let schemaBad = 0;
  for (const r of recs) {
    for (const k of NUM_KEYS) {
      if (typeof r[k] !== 'number' || !Number.isFinite(r[k])) { console.error(`SCHEMA BAD ${r.policyId}-s${r.seed}: ${k}=${JSON.stringify(r[k])}`); schemaBad++; }
    }
    for (const k of DAY_NULL_KEYS) {
      if (r[k] !== null && (typeof r[k] !== 'number' || !Number.isFinite(r[k]))) { console.error(`SCHEMA BAD ${r.policyId}-s${r.seed}: ${k}=${JSON.stringify(r[k])}`); schemaBad++; }
    }
    for (const k of STR_NULL_KEYS) {
      if (r[k] !== null && typeof r[k] !== 'string') { console.error(`SCHEMA BAD ${r.policyId}-s${r.seed}: ${k}=${JSON.stringify(r[k])}`); schemaBad++; }
    }
    if (!r.actorSplit || typeof r.actorSplit !== 'object') { console.error(`SCHEMA BAD ${r.policyId}-s${r.seed}: actorSplit missing`); schemaBad++; }
    if (!Array.isArray(r.markedEvents)) { console.error(`SCHEMA BAD ${r.policyId}-s${r.seed}: markedEvents missing`); schemaBad++; }
  }

  // --- PRIMARY: every crediting (marked) event fully attributed ---
  const marked = [];
  for (const r of recs) for (const e of (r.markedEvents || [])) marked.push(Object.assign({ policyId: r.policyId, seed: r.seed }, e));
  const unattributed = marked.filter(e => e.actor === 'unknown' || e.via === 'unframed' || !e.feasted);
  const actors = {};
  const vias = {};
  for (const e of marked) {
    actors[e.actor] = (actors[e.actor] || 0) + 1;
    vias[e.via] = (vias[e.via] || 0) + 1;
  }

  console.log(`runs=${recs.length} markedEvents=${marked.length} unattributed=${unattributed.length} schemaBad=${schemaBad}`);
  console.log(`actorSplit: ${Object.entries(actors).map(([k, v]) => k + '=' + v).join(', ') || '(none)'}`);
  console.log(`viaSplit: ${Object.entries(vias).map(([k, v]) => k + '=' + v).join(', ') || '(none)'}`);
  for (const e of unattributed) {
    console.log(`  UNATTRIBUTED: ${e.policyId}-s${e.seed} day=${e.day} via=${e.via} actor=${e.actor} feasted=${e.feasted}`);
  }

  // --- per-run seat chain ---
  console.log('\nrun | nat tbl win | seat(kind@day) invite | path/branch | marked actors');
  for (const r of recs) {
    const act = Object.entries(r.actorSplit || {}).map(([k, v]) => k + ':' + v).join(',');
    console.log(`${r.policyId}-s${r.seed} | ${r.national} ${r.table} ${r.wins} | ${r.seatEver ? r.seatKind + '@' + r.seatDay : 'no-seat'} inv=${r.inviteEver ? 'y@' + r.inviteDay : 'n'} | ${r.pathTaken || '-'}${r.branchTaken ? '/' + r.branchTaken : ''} | marked=${r.noteMarked} [${act || 'none'}]`);
  }

  // --- consistency: seat requires feastSurgeUsed; uplift split; grants vs marks ---
  const seatNoMark = recs.filter(r => r.seatEver && !(r.markedEvents || []).length && !r.feastSurgeUsedEnd);
  if (seatNoMark.length) console.log(`\nINCONSISTENT (seat without any marked event): ${seatNoMark.map(r => r.policyId + '-s' + r.seed).join(', ')}`);
  const upliftActors = {};
  for (const r of recs) for (const [k, v] of Object.entries(r.upliftByActor || {})) upliftActors[k] = (upliftActors[k] || 0) + v;
  const grants = recs.reduce((a, r) => a + r.noteMarked, 0);
  const buffs = recs.reduce((a, r) => a + r.buffGrants, 0);
  console.log(`\nbuffGrants=${buffs} markedEvents=${grants} upliftEvents actorSplit: ${Object.entries(upliftActors).map(([k, v]) => k + '=' + v).join(', ') || '(none)'}`);
  console.log(`wall: national=${recs.filter(r => r.national).length}/${recs.length} table=${recs.filter(r => r.table).length}/${recs.length} wins=${recs.filter(r => r.wins).length}/${recs.length} seat=${recs.filter(r => r.seatEver).length}/${recs.length}`);
  const instErr = recs.reduce((a, r) => a + r.instrumentErrors, 0);
  console.log(`instrumentErrors(total)=${instErr}`);

  const go = unattributed.length === 0 && schemaBad === 0;
  console.log(`\nPRIMARY (100% attribution of ${marked.length} crediting events): ${go ? 'GO' : 'MISS — NO-GO'}`);
  process.exit(go ? 0 : 1);
}

main();
