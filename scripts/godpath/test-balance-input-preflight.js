'use strict';
// The real failed comparison is an independent oracle for the cheap preflight;
// it must reject the same complete policy manifest, including unselected files.
const K=require('./lib'),T=K.reporter('Balanced input preflight'),P=require('../balance-input-preflight'),S=require('../lib/balance-scorecard'),fs=require('fs'),z=require('zlib'),{spawnSync}=require('child_process');
const panel=side=>JSON.parse(z.gunzipSync(fs.readFileSync(K.ROOT+'/evidence/2026-10-27/forage-public3cc-'+side+'-r1/panel.json.gz'))),before=panel('before'),after=panel('after'),original=JSON.stringify({before:before.sources,after:after.sources});
const judged=S.comparePanels(before,after,{historical:true}),result=P.compareSources(before.sources,after.sources),paths=result.harnessChanges.map(r=>r.file).sort();
T.ok('retained real comparison is invalid and preflight rejects exactly its nine policy paths',judged.decision==='invalid'&&!result.ok&&paths.length===9&&JSON.stringify(paths)===JSON.stringify(judged.errors.map(s=>s.replace('Policy/harness changed: ','')).sort()));
T.ok('modified and newly added diagnostic controllers both count',result.harnessChanges.some(r=>r.file==='scripts/policies/fullseat-diag.js'&&r.before&&r.after)&&result.harnessChanges.some(r=>r.before===null&&r.after));
const reverse=P.compareSources(after.sources,before.sources);
T.ok('missing controller files are rejected in either direction',!reverse.ok&&JSON.stringify(reverse.harnessChanges.map(r=>r.file).sort())===JSON.stringify(paths));
const common={...before.sources};for(const file of Object.keys(after.sources))if(file.startsWith('scripts/'))common[file]=after.sources[file];
const ready=P.compareSources(common,after.sources);
T.ok('common controllers permit the actual recorded Game changes',ready.ok&&ready.harnessChanges.length===0&&ready.gameChanges.includes('src/js/progression.js')&&ready.gameChanges.includes('src/js/table.js'));
T.ok('queries never alter either retained source identity',JSON.stringify({before:before.sources,after:after.sources})===original);
const cli=spawnSync(process.execPath,[K.ROOT+'/scripts/balance-input-preflight.js'],{encoding:'utf8'});
T.ok('missing root arguments fail explicitly before a campaign',cli.status===1&&/Usage:/.test(cli.stderr));
T.done();
