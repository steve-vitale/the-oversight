'use strict';
// Prepared council contrasts through the real shared dispatch and real engine.
const K = require('./lib'), T = K.reporter('shared community road');
const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict');
const removed=process.argv.includes('--removed-dispatch');
if(removed){
 const read=fs.readFileSync;
 fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);
  if(String(file).replace(/\\/g,'/').endsWith('/policies/leadcourt.js')){
   const text=String(value),next=text.replace('if (community.peerCouncil(Game, ctx, links, road)) return;','/* real peer dispatch removed */');
   assert.notEqual(next,text);value=typeof value==='string'?next:Buffer.from(next);
  }return value;
 };
}
const {leadCourtship} = require('../policies/leadcourt');
const planner = require('../policies/community-road');
(async () => {
 const G = await K.load({seed:7});
 function fresh(profile='merchant') {
   G.over=false;G.tbfight=null;K.newRun(G);
   const s=G.state.scholar;
   s.day=35;s.dayTicks=128;s.health=100;s.kcal=2400;
   G.map.px=4;G.map.py=4;
   G.state.village.pantry=[{itemId:'prepared-grain',units:100,kcalEach:300}];
   G.hierarchyState().length=0;
   const villages=G.state.otherVillages;
   for(const v of villages){
     v.opinion=80;v.rumored=true;G.genVillageRoster(v);
     // The queued rumor flag alone is not heard knowledge. Prepare an
     // actual delivered rumor through the current public delivery path.
     s.rumors=s.rumors||[];
     s.rumors.push({type:'village',villageId:v.id,text:'Prepared traveler reports '+v.name,day:s.day,delivered:false});
     G.deliverVillageRumors();
   }
   return {ctx:{communityProfile:profile},villages,s};
 }
 let c=fresh();
 leadCourtship(G,c.ctx);
 T.ok('merchant shared dispatch chooses trade before leadership',c.ctx.communityRoad==='trade');
 let links=G.hierarchyState();
 T.ok('real proposal forms a charter instead of consuming a subordinate slot',links.length===1&&links[0].kind==='trade'&&links[0].primary===null);
 T.ok('receipt distinguishes actual proposal and actual accepted link',c.ctx.communityDecisions?.[0]?.action==='proposeTrade'&&c.ctx.communityDecisions[0].linked===true);
 leadCourtship(G,c.ctx);
 T.ok('no second proposal on the same day',G.hierarchyState().length===1);
 c.s.day++;
 leadCourtship(G,c.ctx);
 T.ok('next eligible day can pursue another actual partner',G.hierarchyState().filter(l=>l.kind==='trade').length===2);
 c=fresh('maker');c.villages.forEach(v=>v.opinion=0);
 leadCourtship(G,c.ctx);
 T.ok('below-bar relationships remain an explicit prerequisite blocker',c.ctx.communityBlocked==='courtship-needs-visit'&&!G.hierarchyState().length);
 T.ok('unattempted plans do not burn proposal cooldowns',!c.ctx.communityAskDay&&!Object.keys(c.ctx.communityAskDays||{}).length);
 c=fresh();c.s.kcal=500;
 leadCourtship(G,c.ctx);
 T.ok('urgent body needs block new peer commitments',c.ctx.communityBlocked==='body-needs'&&!G.hierarchyState().length);
 c=fresh();G.map.px=0;G.map.py=0;c.s.insideHaven=false;
 leadCourtship(G,c.ctx);
 T.ok('away actor cannot make a remote proposal',c.ctx.communityBlocked==='return-to-haven'&&!G.hierarchyState().length);
 c=fresh();c.s.exiled=true;
 leadCourtship(G,c.ctx);
 T.ok('exile does not spend a proposal cooldown',c.ctx.communityBlocked==='not-haven-member'&&!c.ctx.communityAskDay);
 c=fresh('caregiver');
 G.state.village.roster=G.state.village.roster.slice(0,2);
 leadCourtship(G,c.ctx);
 T.ok('small caregiver community avoids promising mutual defense',c.ctx.communityRoad==='trade'&&G.hierarchyState()[0]?.kind==='trade');
 c=fresh('caregiver');
 T.ok('prepared caregiver fixture has a real defense bench',planner.living(G)>=5);
 leadCourtship(G,c.ctx);
 T.ok('supported caregiver community can form a real covenant',c.ctx.communityRoad==='covenant'&&G.hierarchyState()[0]?.kind==='covenant');
 const fixed=c.ctx.communityRoad;
 G.state.village.roster=G.state.village.roster.slice(0,2);
 c.ctx.communityProfile='merchant';
 T.ok('chosen road persists across later profile/body changes',planner.intent(G,c.ctx,G.hierarchyState())===fixed);
 c=fresh();G.proposeCovenant(c.villages[0].id);
 leadCourtship(G,c.ctx);
 T.ok('preexisting covenant takes precedence over merchant preference',c.ctx.communityRoad==='covenant');
 c=fresh();leadCourtship(G,c.ctx);links=G.hierarchyState();
 const link=links[0];
 G.covenantCrisis(link.id,'strain');
 const rate=link.tariffRate;
 leadCourtship(G,c.ctx);
 T.ok('actual existing crisis is answered before another proposal',!link.pendingCovenantCrisis&&link.tariffRate<rate&&G.hierarchyState().length===1);
 T.ok('paid concession remains visible in decision receipt',c.ctx.communityDecisions.at(-1)?.result==='conceded');
 T.ok('no controller errors swallowed',!(c.ctx.capErrors||[]).length);
 c=fresh();
 const env=process.env.COMMUNITY_PLANNER;
 process.env.COMMUNITY_PLANNER='legacy';
 try {leadCourtship(G,c.ctx);} finally {if(env===undefined)delete process.env.COMMUNITY_PLANNER;else process.env.COMMUNITY_PLANNER=env;}
 T.ok('declared legacy control uses real original leadership proposal',!c.ctx.communityRoad&&G.hierarchyState().some(l=>l.primary==='haven'&&l.kind!=='trade'));
 if(!removed){
  const child=cp.spawnSync(process.execPath,[__filename,'--removed-dispatch'],{encoding:'utf8',timeout:30000,windowsHide:true});
  T.ok('removing actual shared dispatch rejects merchant engine outcome',child.status!==0&&child.stdout.includes('FAIL real proposal forms a charter'));
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
