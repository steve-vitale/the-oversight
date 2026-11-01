'use strict';
// This retained fixture is historical; current collectors remain strict.
const historical = report => S.summarize(report,{historical:true});
// Validate actual retained named cohorts and explicit unknown coverage.
const fs=require('fs'),path=require('path'),z=require('zlib'),assert=require('assert/strict'),S=require('../summarize-public-travel');
const panel=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-21/public-grid-screen-r1.json.gz')))),original=JSON.stringify(panel),summary=historical(panel);
assert.equal(summary.contrasts.length,4);assert(summary.contrasts.every(c=>c.cases===16&&c.metrics.length===23));assert.equal(JSON.stringify(panel),original,'named contrast must never rewrite source rows/IDs');
for(const mutate of [p=>p.rows.pop(),p=>p.validity.neutrality.pop(),p=>p.observerDigest='stale',p=>delete p.rows[0].metrics.lowWater]){const copy=structuredClone(panel);mutate(copy);assert.throws(()=>historical(copy));}
const unknown=structuredClone(panel),sample=unknown.rows.find(r=>r.row.policy==='grid-maker');sample.metrics.classAccess=null;
const m=historical(unknown).contrasts.find(c=>c.base==='maker').metrics.find(m=>m.id==='classAccess');assert.equal(m.pairs,15);assert.equal(m.eligibleAfter,15);assert(m.coverageChanged);assert.equal(m.status,'coverage_changed');
console.log('Public grid summary: actual128 rows/four named contrasts/all23, immutable IDs, missing inputs rejected, unknown coverage retained');
