'use strict';
// This retained fixture is historical; current collectors remain strict.
const historical = report => S.summarize(report,{historical:true});
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),K=require('./lib'),S=require('../summarize-local-search');
// A retained historical pilot is a transport/schema fixture, not certification
// of the final policy. No output files or new harness are created here.
const report=JSON.parse(z.gunzipSync(fs.readFileSync(require('path').join(__dirname,'../../evidence/2026-10-21/local-search-long-r1.json.gz')))),T=K.reporter('local-search-report');
const summary=historical(report);
T.ok('keeps all four separate policy contrasts and all23',summary.contrasts.length===4&&summary.contrasts.every(c=>c.screen.length===23&&c.extended.length===23));
T.ok('screen and extended seeds remain separate',summary.contrasts.every(c=>c.screen.every(m=>m.totalPairs===16)&&c.extended.every(m=>m.totalPairs===2)));
T.ok('does not promote the controller on more wins',summary.decision==='review_required');
assert.throws(()=>historical({...report,results:report.results.slice(1)}));T.ok('rejects an omitted case',true);
assert.throws(()=>historical({...report,controls:report.controls.map((c,i)=>i?c:{...c,match:false})}));T.ok('rejects a failed real passive control',true);
assert.throws(()=>historical({...report,plan:{...report.plan,sources:{...report.plan.sources,'declared-corruption':'wrong'}}}));T.ok('rejects a changed source identity',true);
T.done();
