'use strict';
// Prepared mechanism boundaries, not acquisition, mobile or difficulty proof.
const assert=require('assert/strict'),K=require('./lib'),T=K.reporter('Ad Break feedback');
(async()=>{
 const G=await K.load({seed:73,narration:true});K.newRun(G);
 const m=K.fight(G,'ad_break',{px:4,mx:6}),p=G.tbFighter('p'),lines=[],say=G.say;
 G.say=function(text){lines.push(String(text));return say.apply(this,arguments);};
 const turn=()=>{lines.length=0;G.tbMonsterTurn(m);return lines.join(' ');};
 try{
  m.adCd=1;const start=turn();assert(m.adActive);assert(m.adSponsorKey);
  T.ok('Real monster dispatch starts the commercial and creates its rider',true);
  const speech=G.voiceCleanText(start,true);assert(speech.length>0);assert(!speech.includes('AD '));assert(start.length>speech.length);
  T.ok('Quoted sponsor speech excludes the surrounding stage direction',true);
  m.hp=m.maxHp-1;const capped=turn();assert.equal(m.hp,m.maxHp);assert(capped.includes('(+1 HP)'));
  T.ok('Recovery near full health reports only the actual restored HP',true);
  const full=turn();assert.equal(m.hp,m.maxHp);assert(!/\(\+\d+ HP\)/.test(full));
  T.ok('A full-health screen does not claim another heal',true);
  m.adActive={progress:0,total:4,skipAt:3,skipOffered:false};m.hp=m.maxHp-100;p.adLookAway=1;
  const hp=m.hp,away=turn();assert.equal(m.adActive.progress,0.5);assert.equal(m.hp-hp,Math.round(m.maxHp*0.03*0.5));assert(away.includes('(+'+(m.hp-hp)+' HP)'));
  T.ok('Averted recovery retains the real half-heal and slower progress',true);
  G.tbfight.turnIdx=G.tbfight.order.indexOf('p');p.acted=false;p.moveLeft=2;
  assert.equal(G.tbPlayerSkipAd(),false);assert.equal(p.acted,false);assert(m.adActive);
  T.ok('Unavailable skip refuses without spending the action',true);
  m.adActive.progress=m.adActive.skipAt;p.adLookAway=0;
  assert.equal(G.tbPlayerSkipAd(),true);assert.equal(p.acted,true);assert.equal(m.adActive,null);assert.equal(m.adCd,4);
  T.ok('Available skip spends the action and ends the actual break',true);
  const lead={hp:300,maxHp:300},field=[];
  G.sigW3cFieldRound(m.mdef,p.vid||G.villagerId,4,{log:field}, {},{members:[lead],vName:'Prepared resident',RR:()=>0.5,lroll:r=>r[0]});
  assert.equal(lead.hp,300);assert(!field.some(s=>/\+\d+ HP/.test(s)));
  T.ok('Field recovery also avoids inventing a heal above maximum HP',true);
 }finally{G.say=say;}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
