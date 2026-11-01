'use strict';
const assert=require('assert/strict'),cp=require('child_process'),K=require('./lib'),P=require('../lib/conversation-probe'),{chooseConversationChoice}=require('../policies/conversation-pages');
async function sample(on){const G=await K.load({seed:7,narration:true});K.newRun(G);const probe=on?P.install(G):null,vid=G.state.village.roster.find(id=>id!==G.villagerId),results=[];results.push(G.startConvo(vid));for(let i=0;i<12&&G.convoGet(vid).active;i++){const pick=chooseConversationChoice(G,vid,c=>c.find(x=>/^(ans:|gq:|react:)/.test(x.id))||c.find(x=>x.id==='goon')||c.find(x=>x.id==='dlg:more')||c.find(x=>x.id==='dlg:subject')||c.find(x=>!['leave','recap'].includes(x.id)));if(!pick)break;results.push(G.convoTurn(vid,pick.id));}if(G.convoGet(vid).active)results.push(G.endConvo(vid,'left'));probe?.restore();return{state:G.state,log:G.log,results,rngTail:[Math.random(),Math.random()],probe:probe?{rows:probe.rows,errors:probe.errors,coverage:probe.coverage}:null};}
if(process.argv[2]==='--sample')sample(process.argv[3]==='on').then(r=>process.stdout.write(JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('passive conversation capture'),run=mode=>{const p=cp.spawnSync(process.execPath,[__filename,'--sample',mode],{encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);},off=run('off'),on=run('on');
 for(const k of ['state','log','results','rngTail'])assert.deepEqual(on[k],off[k],k+' neutral');assert.deepEqual(on.probe.errors,[]);assert(on.probe.rows.some(r=>r.method==='convoTurn'));
 T.ok('Actual shared Game journey retains identical complete state, logs, return values and RNG tail',true);
 for(const r of on.probe.rows.filter(r=>r.method==='convoTurn'&&r.args[0]!=='menu:more')){const said=r.added.find(e=>e.who==='you'),offered=r.before?.conversation?.offeredReplies?.[r.args[0]];if(said&&offered)assert.equal(said.text,offered);}
 T.ok('Existing selected words and actual added transcript are retained without another menu query',true);
 const error=Error('actual original error'),g={state:{scholar:{},village:{}},startConvo(){throw error;},convoTurn(){return false;},endConvo(){return null;}},original=g.convoTurn,probe=P.install(g);assert.throws(()=>g.startConvo('p'),e=>e===error);assert.equal(g.convoTurn('p','x'),false);assert.equal(g.endConvo('p'),null);probe.restore();probe.restore();assert.equal(g.convoTurn,original);assert(probe.rows.some(r=>r.error===error.message));
 T.ok('False/null results, exact thrown errors, method descriptors and idempotent restoration are preserved',true);
 let getters=0;const access={state:{scholar:{},village:{}}};Object.defineProperty(access,'startConvo',{configurable:true,get(){getters++;return()=>{};}});const skipped=P.install(access);assert.equal(getters,0);assert(skipped.coverage.missingMethods.includes('startConvo'));skipped.restore();assert.equal(getters,0);
 T.ok('Accessor and missing methods are recorded as unknown coverage without evaluating them',true);
 const circular={};circular.self=circular;const exotic={state:{scholar:{},village:{}},convoTurn(){return circular;}};const fault=P.install(exotic);assert.equal(exotic.convoTurn('p','x'),circular);assert(fault.errors.length);fault.restore();
 T.ok('A recording failure cannot replace an original return value',true);
 const nonError={state:{scholar:{},village:{}},convoTurn(){throw null;}},ne=P.install(nonError);let caught='not thrown';try{nonError.convoTurn('p','x');}catch(e){caught=e;}assert.equal(caught,null);assert.equal(ne.rows[0].thrown,true);assert.equal(ne.rows[0].error,'null');ne.restore();
 const value={toJSON(){throw null;}},badCopy={state:{scholar:{},village:{}},convoTurn(){return value;}},bc=P.install(badCopy);assert.equal(badCopy.convoTurn('p','x'),value);assert(bc.errors.includes('null'));bc.restore();
 T.ok('Non-Error throws remain exact and recording a null throw cannot break the original call',true);

 const bounded=P.install(g,{limit:1});g.convoTurn('p','x');g.convoTurn('p','y');assert.equal(bounded.rows.length,1);assert(bounded.errors.some(e=>e.includes('row limit')));bounded.restore();
 T.ok('Overflow is explicit rather than silently presenting a truncated census',true);T.done();
}
