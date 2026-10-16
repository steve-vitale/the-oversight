'use strict';
// Opt-in public-action strategies. They preserve each base's work, offers,
// hunts/avoidance and Table choices. No game method or NPC brain is replaced.
const {capable}=require('./capable'),livelihood=require('./livelihood');
const count=(ctx,key)=>{const b=ctx.voicePreparation||(ctx.voicePreparation={});b[key]=(b[key]||0)+1;};
function decide(G,action,reason){
 if(!action||action.id!=='god.be_heard'||!action.available||action.combat)return {ok:false,why:'unavailable'};
 if(G.over||G.won||G.inCombat()||G.state.activeContest)return {ok:false,why:'busy'};
 const s=G.state.scholar,v=G.state.village;
 const cost=action.cost?.kcal,cap=G.kcalCap();
 if(!Number.isFinite(cost)||cost<0||!Number.isFinite(cap)||cap<=0||!Number.isFinite(s.kcal)||s.kcal-cost<Math.max(500,cap*0.4))return {ok:false,why:'food'};
 // The offered god's known price and the bearer's own humanity meter.
 // Keep full food conversion after paying; unknown prices are not free.
 const god=Object.values(G.data.godpaths.paths).map(p=>p.god).find(g=>g?.id===action.god);
 const humanityCost=god?.play?.grounding,humanity=G.grounding();
 if(!Number.isFinite(humanityCost)||humanityCost<0||!Number.isFinite(humanity)||humanity-humanityCost<75)return {ok:false,why:'humanity'};
 if(reason==='encounter')return {ok:true,why:'encounter'};
 if(reason!=='social')return {ok:false,why:'unknown-goal'};
 const gain=god?.play?.trust;
 if(!Number.isFinite(gain)||gain<=0)return {ok:false,why:'unknown-social-effect'};
 // Public progressive-trust bands: ordinary acts stop at90. Only a known
 // extraordinary effect (base5+) can justify the last ten points.
 const ceiling=gain>=5?100:90;
 const need=[...new Set(v.roster||[])].some(id=>{if(id===G.villagerId)return false;const p=G.getPerson(id);return p&&!p.dead&&Number.isFinite(v.trust?.[id])&&v.trust[id]<ceiling;});
 return {ok:need,why:need?'social':'no-social-need'};
}
function prepare(G,ctx,request){
 if(!['deed','raid'].includes(request?.kind)||G.over||G.won||G.inCombat()||G.state.activeContest)return false;
 const a=G.godActivatables().find(a=>a.id==='god.be_heard'),d=decide(G,a,'encounter');count(ctx,'encounter-'+d.why);
 if(!d.ok)return false;const ok=G.useAbility('god',a.actionId)===true;count(ctx,ok?'encounter-paid':'encounter-refused');return ok;
}
function policy(base){return {...base,id:base.id+'-voice-ready',desc:base.desc+'; known encounter/social Voice preparation, paid food and humanity reserves',setup(G,ctx){const r=base.setup(G,ctx);ctx.beforeKnownFight=(g,request)=>prepare(g,ctx,request);ctx.godDayIntent=(g,a)=>{if(a.id!=='god.be_heard')return true;const d=decide(g,a,'social');count(ctx,'daily-'+d.why);return d.ok;};return r;}};}
module.exports={decide,prepare};for(const base of [capable,livelihood.maker,livelihood.merchant,livelihood.caregiver])module.exports[base.id+'-voice-ready']=policy(base);
