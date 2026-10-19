'use strict';
const K = require('./lib'), T = K.reporter('god-support-player');
(async () => {
  const G = await K.load({seed:Number(process.env.SEED || 7)});
  let s,v,f,p,m,a,b;
  function fresh(god='one_person_army') {
    G.tbfight=null; G.over=false; K.newRun(G);
    s=G.state.scholar; v=G.state.village; G.state.systemArrived=true;
    s.day=85; s.kcal=1200; s.health=100; s.abilities=[]; s.inventory=[];
    const roster=v.roster.slice(), id=roster.find(x=>x!==G.villagerId);
    v.npcAbilities={[id]:[]}; v.npcSkills={[id]:[]};
    v.npcGodhood={[id]:{active:[god],recognized:{[god]:85}}};
    m=K.fight(G,'review_drone',{px:3,py:4,mx:4,my:4,hp:100}); v.roster=roster;
    f=G.tbfight; m.hp=m.maxHp=10000; p=G.tbFighter('p'); p.acted=false; p.stunned=0;
    a={key:'v_holder',kind:'villager',villagerId:id,name:'Prepared Holder',hp:60,maxHp:100,mx:2,my:4,alive:true,fled:false,ai:'brave'};
    b={...a,key:'v_friend',villagerId:roster.find(x=>x!==id&&x!==G.villagerId),name:'Prepared Friend',mx:2,my:3,hp:100};
    f.fighters.push(a,b); f.order=['p',a.key,b.key,m.key]; f.turnIdx=0; delete f._gv;
  }
  const hit=()=>G.tbDamage(a.key,20,'prepared physical hit',m.key,{undodgeable:true});
  const fixed=fn=>{const r=Math.random;Math.random=()=>0.5;try{return fn();}finally{Math.random=r;}};
  fresh(); hit();
  T.ok('actual wounded NPC brawler hit rallies the nearby living player',p.rallyBuff===3&&p.rallied===3);
  T.ok('the same hit rallies the fellow NPC and excludes the holder',b.rallyBuff===3&&!a.rallyBuff);
  p.rallyBuff=1; hit(); T.ok('a second wound cannot refresh the once-per-fight rally',p.rallyBuff===1);
  fresh(); a.hp=80; hit(); T.ok('above-half-health hit does not rally',!p.rallyBuff);
  fresh(); p.mx=8; p.my=8; hit(); T.ok('distant player gets no rally',!p.rallyBuff);
  fresh(); p.fled=true; hit(); T.ok('fled player gets no rally',!p.rallyBuff);
  fresh(); p.alive=false; hit(); T.ok('dead player gets no rally',!p.rallyBuff);
  fresh(); a.villagerId=G.villagerId; v.npcGodhood[G.villagerId]={active:['one_person_army']}; hit();
  T.ok('canonical self alias cannot rally its own player body',!p.rallyBuff);
  function damage(key,label,source,n=20) { const hp=G.tbFighter(key).hp; G.tbDamage(key,n,label,source,{undodgeable:true}); return hp-G.tbFighter(key).hp; }
  fresh(); const plain=damage(m.key,'you',null); p.rallyBuff=3;
  T.ok('legacy player melee source receives existing raw +4 rally',damage(m.key,'you',null)===plain+4);
  T.ok('explicit player ability source receives existing raw +4 rally',damage(m.key,'prepared ability','p')===plain+4);
  T.ok('unattributed environmental damage gets no player rally',damage(m.key,'environment',null)===plain);
  T.ok('an explicit empty source key is not normalized into player melee',damage(m.key,'you','')===plain);
  T.ok('zero damage does not become a hit',damage(m.key,'you',null,0)===0);
  p.alive=false; T.ok('dead player cannot source rally damage',damage(m.key,'you',null)===plain);
  p.alive=true; p.fled=true; T.ok('fled player cannot source rally damage',damage(m.key,'prepared ability','p')===plain); p.fled=false;
  // Isolate the raw rally from the striker's own food overcharge; the
  // original fixed-seed fixture sometimes generated a topped-up NPC.
  G.npcNeeds(a.villagerId).hunger=50;
  a.rallyBuff=3; T.ok('existing NPC source retains its raw +4',damage(m.key,'prepared ally',a.key)===plain+4);
  const friend=damage(b.key,'your gristlefit','p'); p.rallyBuff=0;
  T.ok('rally does not amplify player friendly backlash',damage(b.key,'your gristlefit','p')===friend);
  fresh(); const advance=G.tbAdvance; G.tbAdvance=()=>{};
  let ordinary,rallied;
  try {
    let hp=m.hp; fixed(()=>G.tbPlayerStrike(m.key)); ordinary=hp-m.hp;
    p.acted=false; p.rallyBuff=3; hp=m.hp; fixed(()=>G.tbPlayerStrike(m.key)); rallied=hp-m.hp;
  } finally {G.tbAdvance=advance;}
  T.ok('real player Strike consumes the source convention and lands +4',ordinary>0&&rallied===ordinary+4,JSON.stringify({ordinary,rallied}));
  fresh(); p.rallyBuff=p.rallied=3;
  const ticks=[]; for(let i=0;i<3;i++){f.turnIdx=0;G.tbBeginTurn();ticks.push([p.rallyBuff,p.rallied]);}
  T.ok('actual player turn entry expires both rally flags in three own turns',JSON.stringify(ticks)==='[[2,2],[1,1],[0,0]]');
  T.ok('expired rally restores ordinary damage',damage(m.key,'you',null)===plain);
  fresh('voice_of_the_relay'); p.rallyBuff=3; b.rallyBuff=3;
  G.tbDamage(a.key,999,'prepared fatal hit',m.key,{undodgeable:true});
  T.ok('actual NPC Voice death stuns the player for a full action and clears rally',p.stunned===1&&p.stunFull===1&&p.rallyBuff===0);
  T.ok('the existing fellow NPC death weakness remains',b.stunned===1&&b.rallyBuff===0);
  // Let the real entry routine request its normal scheduler advance, then
  // inspect before other actors change the scene. No player action is chosen.
  let advances=0; G.tbAdvance=()=>{advances++;};
  try {f.turnIdx=0;G.tbBeginTurn();} finally {G.tbAdvance=advance;}
  T.ok('player turn entry consumes the stun and requests exactly one skip',advances===1&&p.acted&&p.stunned===0&&p.stunFull===0);
  f.turnIdx=0; G.tbBeginTurn();
  T.ok('the following player turn restores choice and movement',!p.acted&&p.moveLeft>0);
  fresh('voice_of_the_relay');
  G.tbDamage(a.key,999,'prepared fatal hit',m.key,{undodgeable:true});
  p.hp=p.maxHp=s.health=10000;
  let playerEntries=0; const begin=G.tbBeginTurn;
  G.tbBeginTurn=function(...args){if(this.tbCurrent()?.kind==='player')playerEntries++;return begin.apply(this,args);};
  try {f.turnIdx=f.order.length-1;G.tbAdvance();} finally {G.tbBeginTurn=begin;}
  T.ok('real scheduler passes the lost turn and returns control on the next round',playerEntries===2&&G.tbCurrent()===p&&!p.acted&&!p.stunned&&!p.stunFull,JSON.stringify({playerEntries,current:G.tbCurrent()?.key,acted:p.acted}));
  fresh('voice_of_the_relay'); p.fled=true; G.tbDamage(a.key,999,'prepared fatal hit',m.key,{undodgeable:true});
  T.ok('a fled player is not stunned by Voice collapse',!p.stunned&&!p.stunFull);
  fresh('voice_of_the_relay'); a.villagerId=G.villagerId; v.npcGodhood[G.villagerId]={active:['voice_of_the_relay']};
  G.tbDamage(a.key,999,'prepared fatal hit',m.key,{undodgeable:true});
  T.ok('canonical self alias cannot impose its own ally collapse on the player',!p.stunned&&!p.stunFull);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
