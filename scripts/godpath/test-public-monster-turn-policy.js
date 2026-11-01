'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),K=require('./lib'),T=K.reporter('Public monster-policy turn finishing');
const probe=path.join(K.ROOT,'evidence/2026-10-23/monster-public-turn-probe-r1.cjs');
for(const policy of['competent','capable']){
 for(const moves of[3,0]){const r=cp.spawnSync(process.execPath,[probe,'--child',policy,String(moves)],{encoding:'utf8',maxBuffer:8*1024*1024});if(r.status!==0)throw Error(r.stderr||r.stdout.slice(-2000));const p=JSON.parse(r.stdout.split('@@PROBE@@').pop()),label=policy+' '+moves+' movement/1 action';
  T.ok(label+': never uses a private actor-budget finisher',p.privateTurns.length===0,p.privateTurns.join(';'));
  T.ok(label+': spends only the original turn',p.after.round-p.before.round===1,JSON.stringify({before:p.before,after:p.after}));
  T.ok(label+': public Wait ends remaining movement but never a fresh turn',p.calls.filter(c=>c.name==='tbPlayerWait').length===(moves===0?0:1),JSON.stringify(p.calls));
 }
 const source=fs.readFileSync(path.join(K.ROOT,'scripts/policies/'+policy+'.js'),'utf8');
 T.ok(policy+': source cannot bypass player verbs with private turn calls or fighter-budget writes',!/\.tbAfterPlayerAction\s*\(/.test(source)&&! /\b(?:p|q)\.(?:moveLeft|acted)\s*=/.test(source));
}
T.done();
