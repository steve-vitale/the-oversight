'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update'),same=require('util').isDeepStrictEqual;
const dir='evidence/2026-10-29/evolved-garden-r1',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function read(root){return JSON.parse(z.gunzipSync(fs.readFileSync(path.join(root,dir,'native-r1-report.json.gz'))));}
function verify(root,r){
 const errors=[],check=(v,m)=>{if(!v)errors.push(m);},source=F.expectedInputs(root),raw=fs.readFileSync(path.join(root,dir,'actual-day13-evolved-profile.json.gz')),profile=JSON.parse(z.gunzipSync(raw)),initial=JSON.parse(profile.origins[0].localStorage.find(e=>e.name.startsWith('scattering-save-v1-')).value),rules=require(path.join(root,'src/data/gardening.json')),ability=require(path.join(root,'src/data/abilities.json')).find(a=>a.id==='green_thumb'),cost=ability.actions.find(a=>a.id==='cultivate').cost.kcal,seen=new Map();
 check(r.schemaVersion===1&&same(r.source,source),'stale runtime');check(r.fixtureSha256===sha(raw),'changed actual fixture');check(r.recipeSha256===sha(fs.readFileSync(path.join(root,dir,'replay.cjs'),'utf8').replace(/\r\n/g,'\n')),'changed recipe');check(initial.scholar.abilities.some(a=>a.evolvedFrom==='green_thumb'&&a.level===3),'actual evolved mastery');check(r.rows?.length===4,'four scenes required');
 for(const row of r.rows||[]){
  const id=row.height+':'+row.stage,f=row.final,c=row.recovery;check(!seen.has(id)&&[736,844].includes(row.height)&&['cast','cold'].includes(row.stage),'duplicate/unknown scene');seen.set(id,row);
  check(f?.ok&&f.sourceStable&&f.classification==='prepared-replay','failed or unclassified journey');check(f?.wholeScholarEqual&&f?.wholeCodexEqual,'immediate whole durable state');check(same(c?.responses,source)&&same(c?.expected,source),'loaded response bytes');check(same(c?.saved?.scholar,c?.restored?.scholar)&&same(c?.saved?.codex,c?.restored?.codex),'whole cold recovery');
  check(f?.touches?.length>0&&f.touches.every(t=>t.trusted&&t.type==='touch'),'trusted input');check(f?.controls?.length>0&&f.controls.every(v=>v.box&&v.box.x>=0&&v.box.y>=0&&v.box.x+v.box.width<=390&&v.box.y+v.box.height<=row.height),'visible controls');check(f?.errors?.length===0,'browser errors');
  const s=f?.saved;if(!s){check(false,'missing actual save');continue;}
  check(s.scholar.kcal===initial.scholar.kcal-cost&&s.scholar.dayTicks===initial.scholar.dayTicks+16,'one authored payment and time');check(same(s.scholar.inventory,initial.scholar.inventory),'inventory conservation');
  const before=initial.run.map.tiles[4][4].plots,after=s.run.map.tiles[4][4].plots;check(after.length===before.length,'bed conservation');let changed=0;
  before.forEach((p,i)=>{const q=after[i];if(p.pid&&!p.dead){changed++;check(q?.magicGrowth===(p.magicGrowth||0)+rules.magic.growthByLevel[3]&&q.magicYield===Math.max(p.magicYield||1,rules.magic.thumbYieldByLevel[3])&&q.magicDay===s.scholar.day&&q.magicOwner===s.villagerId,'actual owned growth and daily limit');}else check(same(q,p),'empty bed unchanged');});check(changed===3,'three actual growing beds');
 }
 for(const h of [736,844]){const a=seen.get(h+':cast')?.final.saved,b=seen.get(h+':cold')?.final.saved;check(!!a&&!!b&&same(a.scholar,b.scholar)&&same(a.codex,b.codex)&&same(a.run.map.tiles[4][4].plots,b.run.map.tiles[4][4].plots),'paid-to-cold continuity');}
 return{ok:errors.length===0,errors};
}
module.exports={read,verify};
if(require.main===module)require('./retain-phone-report').runCLI(dir+'/native-r1-report.json.gz',verify);
