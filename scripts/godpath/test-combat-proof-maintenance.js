'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),K=require('./lib'),R=require('../refresh-combat-turn-proof'),T=K.reporter('Combat proof maintenance'),revision='combat-unit-'+process.pid,out='evidence/2026-10-26/'+revision,absolute=path.join(K.ROOT,out),pointer=path.join(K.ROOT,'scripts/combat-turn-proof.json'),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{const before=sha(pointer),r=cp.spawnSync(process.execPath,['scripts/refresh-combat-turn-proof.js',revision,out],{cwd:K.ROOT,encoding:'utf8'}),p=JSON.parse(r.stdout);
 T.ok('default CLI plans without starting a browser or creating evidence',r.status===0&&p.action==='plan only'&&!fs.existsSync(absolute));
 T.ok('plan preserves all three real recipes and the real updater/gate',p.steps.length===5&&p.steps.slice(0,3).map(s=>s.id).join(',')==='play,resume,reader'&&p.steps[3].script==='scripts/combat-turn-proof-update.js'&&p.steps[4].script==='scripts/godpath/test-combat-turn-proof.js');
 function rejects(label,fn){let failed=false;try{fn();}catch(e){failed=!!e.message;}T.ok(label,failed);}
 rejects('an escaping revision is refused',()=>R.plan(K.ROOT,'../../escape',out));
 rejects('an external output is refused',()=>R.plan(K.ROOT,revision,path.resolve(K.ROOT,'../outside-'+revision)));
 rejects('an existing evidence directory cannot be adopted',()=>R.plan(K.ROOT,revision,'evidence/2026-10-26'));
 const plan=R.plan(K.ROOT,revision,out);plan.source.workflow['scripts/refresh-combat-turn-proof.js']='stale';let failed=false;try{await R.run(plan);}catch(e){failed=/inputs changed/.test(e.message);}
 T.ok('stale plan fails before claiming output or starting preview',failed&&!fs.existsSync(absolute));
 T.ok('a rejected plan cannot replace the prior combat pointer',sha(pointer)===before);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
