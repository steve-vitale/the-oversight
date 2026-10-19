'use strict';
const fs=require('fs'),cp=require('child_process'),path=require('path'),crypto=require('crypto');
const root=process.cwd(),dir=__dirname,read=n=>JSON.parse(fs.readFileSync(path.join(dir,n))),prior=read('release-final-history-inventory-r1.json'),old=read('release-primary-proof-dispositions-r7.json');
const git=args=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:10e6}).trim(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const oldBy=new Map(old.rows.map(r=>[r.file,r.currentResolution]));const list=f=>fs.readFileSync(f,'utf8').split('\n').map(l=>l.replace(/#.*/,'').trim().split(/\s/)[0]).filter(Boolean),quarantine=new Set(list('scripts/green-list-quarantine.txt'));
const automatic=new Set([...fs.readdirSync('scripts/godpath').filter(f=>/^test-.*\.js$/.test(f)).map(f=>'scripts/godpath/'+f),...list('scripts/green-list.txt').filter(f=>!quarantine.has(f))]);
const rows=[];
for(const c of prior.commits){
 const files=git(['diff-tree','--no-commit-id','--name-only','-r',c.sha]).split('\n').filter(Boolean),runtime=files.filter(f=>f.startsWith('src/')||['index.html','sw.js','manifest.json','version.json'].includes(f));
 const tests=files.filter(f=>/^scripts\/(?:godpath\/)?test-.*\.js$/.test(f)).map(file=>({file,present:fs.existsSync(file),automatic:automatic.has(file),...(fs.existsSync(file)?{currentNormalizedSha256:sha(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'))}:{}),priorDisposition:oldBy.get(file)||null}));
 rows.push({...c,changedFiles:files,runtimeFiles:runtime,tests,reviewClass:runtime.length?'runtime_behavior_requires_explicit_mapping':'tooling_or_records_requires_scope_mapping'});
}
const report={head:git(['rev-parse','HEAD']),scope:'193 divergent branch commits, including the primary149. Changed-file/test census only: no inferred behavior clearance from ancestry, literal lines, test presence or full-suite green. Explicit mappings/exclusions must be read separately.',rows,counts:{commits:rows.length,runtime:rows.filter(r=>r.runtimeFiles.length).length,noRuntime:rows.filter(r=>!r.runtimeFiles.length).length,uniqueOriginalTests:new Set(rows.flatMap(r=>r.tests.map(t=>t.file))).size,missingOriginalTests:[...new Set(rows.flatMap(r=>r.tests.filter(t=>!t.present).map(t=>t.file)))]}};
fs.writeFileSync(path.join(dir,'release-inclusion-contract-census-r1.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report.counts));
