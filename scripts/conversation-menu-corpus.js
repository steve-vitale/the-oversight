'use strict';
// API conversation sampling. One shared harness per child; the caller supplies
// a fresh output path. Prepared dispositions are coverage, not natural access.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const [rootArg,seedArg,output]=process.argv.slice(2),root=path.resolve(rootArg||'.'),seed=Number(seedArg);assert(output&&Number.isSafeInteger(seed)&&!fs.existsSync(output));const K=require(path.join(root,'scripts/godpath/lib')),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),origins=['Chicago, Illinois','Portland, Oregon','Tokyo, Japan','Mumbai, India','Lagos, Nigeria','Berlin, Germany','São Paulo, Brazil','Sydney, Australia'];
(async()=>{const G=await K.load({seed}),rows=[],errors=[];for(const origin of origins)for(const disposition of[-1,0,1]){
 K.newRun(G,origin);G.state.scholar.disposition=disposition;const village=G.state.village,people=new Map();for(const p of[...(G.data.villagers||[]),...Object.values(village.rosterChars||{}),...(G.data.background_survivors||[])])if(p?.id&&!people.has(p.id))people.set(p.id,p);
 const eligible=[...new Set(village.roster||[])].filter(id=>id!==G.villagerId&&people.has(id)&&!people.get(id).dead).slice(0,4);
 for(const vid of eligible){const person=people.get(vid),opened=G.startConvo(vid);if(opened?.refused){rows.push({origin,disposition,vid,refused:true});continue;}
  for(let turn=0;turn<6;turn++){const c=G.convoGet(vid);if(!c.active)break;const menu=G.convoChoices(vid),again=G.convoChoices(vid),signature=m=>m.map(ch=>({id:ch.id,label:ch.label})),answer=menu.filter(ch=>/^(ans:|react:|gq:)/.test(ch.id)).sort((a,b)=>a.id.localeCompare(b.id)),choice=answer[0]||menu.find(ch=>ch.id==='goon')||menu.find(ch=>ch.id==='ask:skills')||menu.find(ch=>ch.id==='dlg:subject')||menu.find(ch=>ch.id==='nv:listen')||menu.find(ch=>ch.id==='leave')||menu.filter(ch=>ch.id!=='recap').sort((a,b)=>a.id.localeCompare(b.id))[0];
   rows.push({origin,disposition,vid,name:person.name,occupation:person.formerOccupation,turn,thread:c.thread,question:!!(c.pendingQ||c.reactiveQ||c.genericQ),held:c.heldBeats?.length||0,spoken:c.spokenBeat?.line||c.transcript?.filter(t=>t.who!=='you').at(-1)?.text,choices:signature(menu),repeatedChoices:signature(again),selected:choice?.id,resources:{day:G.state.scholar.day,tick:G.state.scholar.dayTicks,food:G.state.scholar.kcal,hp:G.state.scholar.health}});
   if(!choice){errors.push({origin,disposition,vid,turn,error:'No available reply'});break;}
   // Passive follow-through evidence: inspect already-loaded fields without
   // another Game read/action or RNG call. Old schema1 samples stay historical.
   const heldBefore=structuredClone(c.heldBeats||[]),start=c.transcript?.length||0;
   const answersQuestion=!!(c.pendingQ||c.reactiveQ||c.genericQ)&&/^(ans:|react:|gq:)/.test(choice.id);
   G.convoTurn(vid,choice.id);
   const after=G.state.village.conv[vid];
   rows[rows.length-1].followthrough={answersQuestion,heldBefore,heldAfter:structuredClone(after.heldBeats||[]),spokenAfter:(after.transcript||[]).slice(start).filter(t=>t.who==='them').map(t=>t.text)};
  }if(G.convoGet(vid).active)G.endConvo(vid);
 }
}const sources=require(path.join(process.cwd(),'scripts/phone-frame-proof-update')).expectedInputs(root);fs.writeFileSync(output,z.gzipSync(JSON.stringify({schemaVersion:2,seed,sources,recipeSha256:hash(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n')),scope:'Generated living-resident API conversations across eight origins and three prepared dispositions; direct API access does not prove phone adjacency, natural personality development or all dialogue meaning. Selection uses stable semantic IDs rather than first menu position. Schema2 passively retains before/after held beats and actual speech for question-answer delivery audits.',rows,errors})),{flag:'wx'});console.log(JSON.stringify({seed,menus:rows.filter(r=>r.choices).length,refusals:rows.filter(r=>r.refused).length,errors:errors.length}));if(errors.length)process.exitCode=1;})().catch(e=>{console.error(e.stack);process.exitCode=1;});
