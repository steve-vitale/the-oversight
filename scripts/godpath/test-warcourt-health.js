'use strict';
// Policy guard proof using the real scholar schema and capacity method.
// Daily chores/force and muster outcomes are isolated here; real raid prices
// and consequences remain covered by test-raid-strike-20261017.js.
const assert=require('assert');
const {loadGame,setupGame}=require('../sim-harness');
const {competent}=require('../policies/competent');
const {warcourt}=require('../policies/warcourt');
async function main(){
 const {Game:G}=await loadGame({seed:8601,mode:'warcourt-health-guard'});await setupGame(G);
 const original={daily:competent.daily,maxHealth:G.maxHealth,regionalStanding:G.regionalStanding,villageStandingOf:G.villageStandingOf,raidVillage:G.raidVillage,answerRaid:G.answerRaid};
 const env=process.env.WARCOURT_RAID,warning=console.warn;let checks=0;
 try{
  process.env.WARCOURT_RAID='1';competent.daily=()=>{};
  G.state.scholar.day=40;G.state.scholar.exiled=false;G.over=false;
  G.state.pendingNational=null;G.state.nationalLive=null;
  G.state.village.pantry=[{units:1,kcalEach:50000}];
  assert(G.state.village.roster.filter(id=>!G.getPerson(id).dead).length>=4,'real living roster');
  // KNOWER LEDGER (2026-10-29): a bare rumored flag no longer counts as
  // known (a roll queued but never read opens nothing) — the test needs
  // known raid targets, so mark them visited (player legacy), not rumored.
  for(const v of G.state.otherVillages)v.generated=true;
  assert(G.state.otherVillages.some(v=>v.id!=='haven'&&G.knowsVillage(v)),'real known target');
  G.regionalStanding=()=>1000;G.villageStandingOf=()=>10;
  let attempts=0,answers=[],warnings=[];
  G.raidVillage=()=>{attempts++;return null;};
  G.answerRaid=answer=>{answers.push(answer);if(answer!=='terms')G.state.pendingRaid=null;return answer==='terms'?'refused':true;};
  console.warn=(...a)=>warnings.push(a.join(' '));
  const prepare=(health,max)=>{G.state.scholar.health=health;delete G.state.scholar.hp;delete G.state.scholar.maxHp;G.maxHealth=()=>max;G.state.pendingRaid=null;attempts=0;answers=[];warnings=[];};
  const check=(name,fn)=>{fn();checks++;console.log('ok '+name);};
  prepare(20,100);warcourt.daily(G,{});check('wounded scholar never attempts a raid',()=>assert.equal(attempts,0));
  prepare(70,100);warcourt.daily(G,{});check('70 percent health can attempt a raid',()=>assert.equal(attempts,1));
  prepare(100,200);warcourt.daily(G,{});check('larger capacity changes the actual health fraction',()=>assert.equal(attempts,0));
  prepare(140,200);warcourt.daily(G,{});check('70 percent of larger capacity can raid',()=>assert.equal(attempts,1));
  prepare(0,100);warcourt.daily(G,{});check('zero health is not default full health',()=>assert.equal(attempts,0));
  prepare(undefined,100);G.state.scholar.hp=100;warcourt.daily(G,{});check('legacy hp cannot replace unknown actual health',()=>assert.equal(attempts,0));
  prepare(100,NaN);warcourt.daily(G,{});check('invalid capacity cannot authorize a raid',()=>assert.equal(attempts,0));
  prepare(100,100);G.maxHealth=()=>{throw Error('capacity probe fault');};warcourt.daily(G,{});
  check('failed health read is reported and does not authorize a raid',()=>{assert.equal(attempts,0);assert(warnings.some(s=>s.includes('capacity probe fault')));});
  for(const [health,max,answer]of [[20,100,'withdraw'],[70,100,'strike'],[100,200,'withdraw']]){
   prepare(health,max);G.state.pendingRaid={target:G.state.otherVillages[0].id};warcourt.daily(G,{});
   check('pending refused terms '+health+'/'+max+' selects '+answer,()=>assert.deepEqual(answers,['terms',answer]));
  }
  console.log('warcourt-health: '+checks+' passed, 0 failed');
 }finally{
  competent.daily=original.daily;for(const k of Object.keys(original).filter(k=>k!=='daily'))G[k]=original[k];
  console.warn=warning;if(env===undefined)delete process.env.WARCOURT_RAID;else process.env.WARCOURT_RAID=env;
 }
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
