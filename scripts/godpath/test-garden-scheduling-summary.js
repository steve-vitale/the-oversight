'use strict';
// This retained fixture is historical; current collectors remain strict.
const historical = report => S.summarize(report,{historical:true});
const fs=require('fs'),z=require('zlib'),path=require('path'),crypto=require('crypto'),K=require('./lib'),S=require('../summarize-garden-scheduling'),T=K.reporter('Garden scheduling summary');
const report=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-21/garden-scheduling-long-r1.json.gz')))),result=historical(report);
T.ok('two declared timing contrasts retain all23 screen and extended metrics',result.contrasts.length===2&&result.contrasts.every(c=>c.screen.length===23&&c.extended.length===23));
T.ok('unobserved old-schedule session counts remain unknown',result.arms.filter(a=>!a.id.endsWith('-early')).every(a=>a.sessions===null&&a.earlySessions===null));
function faulty(edit){const r=structuredClone(report),row=r.results.find(r=>r.job.observe&&r.job.seed!==1&&r.job.policy.endsWith('-early')&&r.row.policyDiagnostics.scheduling.receipts.some(x=>x.phase==='early'&&x.reason==='session'));edit(row);const{job,transportDigest,...payload}=row;row.transportDigest=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');return r;}
function rejects(edit,pattern){try{historical(faulty(edit));return false;}catch(e){return pattern.test(e.message);}}
T.ok('valid transport with unknown watchdog coverage cannot prove completion',rejects(r=>{delete r.terminal.watchdogRoutes;},/Unknown recovery coverage/));
T.ok('valid transport with dropped timing receipts is rejected',rejects(r=>{r.row.policyDiagnostics.scheduling.dropped=1;},/Expected values to be strictly equal/));
T.ok('a duplicate actual session for an early-worked day is rejected',rejects(r=>{const xs=r.row.policyDiagnostics.scheduling.receipts,x=xs.find(x=>x.phase==='early'&&x.reason==='session');xs.push(structuredClone(x));},/Repeated garden session/));
T.done();
