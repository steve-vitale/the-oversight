'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('One conversation farewell');
(async()=>{const G=await K.load({seed:7,narration:true}),raw=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-26/silent-proximity-curious-r8-pilot-r1/736-failed.json.gz')))),entry=raw.trace.find(t=>t.label==='actual answer settled');
 for(const mood of[-3,-1,0,1,3]){
  G.state=structuredClone(entry.state);const r=G.state.run;G.villagerId=r.villagerId;G.map=r.map;G.location=r.location;G.homeRegion=r.homeRegion;G.departed=r.departed;G.log=G.normalizeLogEntries(r.log);
  const vid=Object.keys(G.state.village.conv).find(id=>G.state.village.conv[id].active),c=G.state.village.conv[vid];
  T.ok(mood+' uses an actual active answered question and canonical bearer',!!vid&&G.villagerId===entry.bearer&&c.want.id==='curious'&&!c.pendingQ);
  // Explicit mood-band unit contrast; no health/food/gear or answer grant.
  c.mood=mood;const n=c.transcript.length,kcal=G.state.scholar.kcal,tick=G.state.scholar.dayTicks,convos=G.state.codex.people[vid].depth.convos;
  G.convoTurn(vid,'leave');const added=c.transcript.slice(n).filter(e=>e.who==='them'),spoken=added.map(e=>G.voiceCleanText(e.voiceLine,true)).filter(Boolean).join(' '),first=/["“]([^"”]+)["”]/.exec(added.map(e=>e.text).join(' '));
  T.ok(mood+' emits one complete farewell beat',added.length===1,JSON.stringify(added));
  T.ok(mood+' voices only its single farewell, not another mood goodbye',!!first&&spoken===first[1],JSON.stringify({spoken,first:first?.[1]}));
  T.ok(mood+' retains gesture-only mood information',mood===0||mood===1||added.some(e=>/smil|shoulders|nod|turn|look away/.test(e.text)));
  T.ok(mood+' closes and resolves the actual question seed',!c.active&&!G.state.village.convoSeeds?.[vid]);
  T.ok(mood+' does not alter food or time',G.state.scholar.kcal===kcal&&G.state.scholar.dayTicks===tick);
  T.ok(mood+' counts one actual ended sitting toward relationship depth',G.state.codex.people[vid].depth.convos===convos+1);
  const state=JSON.stringify(G.state),log=JSON.stringify(G.log);G.endConvo(vid,'left');
  const changes=[];function diff(x,y,p){if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))diff(x[k],y[k],p+'.'+k);}else changes.push({path:p,before:x,after:y});}diff(JSON.parse(state),JSON.parse(JSON.stringify(G.state)),'state');
  T.ok(mood+' repeated end is state/log neutral',state===JSON.stringify(G.state)&&log===JSON.stringify(G.log),JSON.stringify({changes:changes.slice(0,8),logChanged:log!==JSON.stringify(G.log)}));
 }
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
