'use strict';
// This retained fixture is historical; current collectors remain strict.
const historicalOld = report => { const {measurementIdentity,...result}=Old.summarize(report,{historical:true}); if(measurementIdentity.mode!=='historical')throw Error('Expected historical analysis identity'); return result; };
const historical = report => S.summarize(report,{historical:true});
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),K=require('./lib'),S=require('../summarize-garden-daystart'),Old=require('../summarize-garden-scheduling'),T=K.reporter('Garden day-start summary');
const read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-21/'+f)))),report=read('garden-daystart-long-r1.json.gz'),result=historical(report);
T.ok('actual native policy IDs retain all23 screen and extended metrics',result.contrasts.length===2&&result.contrasts.every(c=>c.screen.length===23&&c.extended.length===23)&&result.arms.every(a=>a.screenCases===16&&a.extendedCases===2));
T.ok('uninstrumented late-control session counts remain unknown',result.arms.filter(a=>!a.id.endsWith('-daystart')).every(a=>a.sessions===null&&a.dawnSessions===null));
const{input,...old}=JSON.parse(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-21/garden-scheduling-summary-r1.json')));T.ok('shared timing summary preserves the earlier cohort result exactly',JSON.stringify(historicalOld(read('garden-scheduling-long-r1.json.gz')))===JSON.stringify(old));
function faulty(edit){const r=structuredClone(report),row=r.results.find(r=>r.job.observe&&r.job.seed!==1&&r.job.policy.endsWith('-daystart')&&r.row.policyDiagnostics.daystart.receipts.some(q=>q.phase==='dawn'&&q.reason==='session'));edit(row,row.row.policyDiagnostics.daystart.receipts.find(q=>q.phase==='dawn'&&q.reason==='session'));const{job,transportDigest,...payload}=row;row.transportDigest=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');return r;}
function rejects(edit,re){try{historical(faulty(edit));return false;}catch(e){return re.test(e.message);}}
T.ok('valid transport with a part1 session cannot claim dawn',rejects((r,q)=>q.before.part=1,/actual dawn/));
T.ok('valid transport with replacement-body work is rejected',rejects((r,q)=>q.initial.bearer='prepared-other-body',/replacement actor/));
T.ok('unknown watchdog coverage cannot establish completion',rejects(r=>{delete r.terminal.watchdogRoutes;},/Unknown recovery coverage/));
T.ok('dropped dawn receipts cannot establish timing coverage',rejects(r=>r.row.policyDiagnostics.daystart.dropped=1,/Expected values to be strictly equal/));
T.done();
