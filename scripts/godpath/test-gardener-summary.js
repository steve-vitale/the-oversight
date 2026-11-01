'use strict';
// This retained fixture is historical; current collectors remain strict.
const historical = report => S.summarize(report,{historical:true});
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),K=require('./lib'),S=require('../summarize-gardener-intent'),T=K.reporter('Gardener summary');
const report=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-21/gardener-intent-long-r1.json.gz'))));
const result=historical(report);
T.ok('all four real cohorts retain16 paired screen seeds and23 metrics',result.arms.length===4&&result.contrasts.every(c=>c.pairs===16&&c.metrics.length===23));
T.ok('raw recovered win remains counted but is never a clean completion',result.watchdogCases.length===1&&result.watchdogCases[0].job.seed===9&&result.arms.find(a=>a.id==='garden-invest').screenRecovered===1&&result.arms.find(a=>a.id==='garden-invest').cleanScreenEndings===15);
function faulty(edit){const r=structuredClone(report),row=r.results.find(r=>r.job.observe);edit(row);const{job,transportDigest,...payload}=row;row.transportDigest=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');return r;}
let unknown=false;try{historical(faulty(r=>{delete r.terminal.watchdogRoutes;}));}catch(e){unknown=/Unknown watchdog coverage/.test(e.message);}
T.ok('a valid transport frame with unknown recovery coverage is rejected',unknown);
let dropped=false;try{historical(faulty(r=>{r.row.policyDiagnostics.gardener.plansDropped=1;}));}catch(e){dropped=true;}
T.ok('a valid frame with dropped planning evidence cannot pass the cohort summary',dropped);T.done();
