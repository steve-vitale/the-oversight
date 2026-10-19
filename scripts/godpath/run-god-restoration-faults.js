'use strict';
// Isolated nonshipping faults. Never mutate the working or frozen Game.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];};
const root=path.resolve(arg('root',path.join(__dirname,'../..'))),out=arg('out');if(!out)throw Error('--out required');
const cases=[
 {id:'missing-public-god-bridge',file:'src/js/abilityActions.js',a:"if (abilityId === 'god' && typeof this.godActionDef === 'function') return this.godActionDef(actionId);",b:'/* injected missing public god bridge */',suite:'test-god-restoration-integrity.js'},
 {id:'lost-fight-use-on-continue',file:'src/js/game.js',a:'godVerbs: f._gv || null,',b:'godVerbs: null,',suite:'test-god-restoration-integrity.js'},
 {id:'ward-body-without-persistent-wound',file:'src/js/godverbs.js',a:'game.tbSyncHumanHealth(w);',b:'/* injected missing wound mirror */',suite:'test-god-restoration-integrity.js'},
 {id:'missing-field-beam-metadata',file:'src/js/fieldFights.js',a:'beamDamage: beamDamage',b:'beamDamage: 0',suite:'test-god-field-light.js'},
 {id:'missing-world-phoenix-before-death',file:'src/js/game.js',a:'if (S.GodVerbs?.phoenixVillagerWorld(this, vid, cause))',b:'if (false)',suite:'test-god-restoration-integrity.js'}
];
const base=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-god-faults-')),rows=[];
for(const fault of cases){const dir=path.join(base,fault.id);fs.mkdirSync(dir);for(const name of ['src','scripts','index.html'])fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});const file=path.join(dir,fault.file),s=fs.readFileSync(file,'utf8');if(s.split(fault.a).length!==2)throw Error('Fault anchor is not unique: '+fault.id);fs.writeFileSync(file,s.replace(fault.a,fault.b));const r=cp.spawnSync(process.execPath,[path.join(dir,'scripts/godpath',fault.suite)],{cwd:dir,encoding:'utf8',timeout:120000,env:{...process.env,SEED:'7'},maxBuffer:8*1024*1024});const rejected=r.status!==0&&/ FAIL /.test(r.stdout||'');rows.push({...fault,exit:r.status,rejected,stdout:r.stdout,stderr:r.stderr,error:r.error?.message||null});console.log(fault.id+': '+(rejected?'rejected':'NOT REJECTED'));}
const report={schemaVersion:1,scope:'Nonshipping isolated faults; actual shared-harness caller assertions must fail',root,temporaryRoot:base,rejected:rows.filter(r=>r.rejected).length,rows};fs.writeFileSync(out,z.gzipSync(JSON.stringify(report)));if(rows.some(r=>!r.rejected))process.exitCode=1;

