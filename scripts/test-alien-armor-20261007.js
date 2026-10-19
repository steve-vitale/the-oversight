'use strict';
// Real shared-runtime beam/readiness proof; replaces copied damage/scoring math.
const K=require('./godpath/lib'),T=K.reporter('alien-armor-transition');
(async()=>{const G=await K.load({seed:7}),items=G.data.items;
 const classic=['alien_helm','alien_carapace','alien_greaves','alien_gauntlets','alien_boots'];
 T.ok('all five alien armor pieces remain resistant tier4 gear',classic.every(id=>{const d=items.find(d=>d.id===id);return d?.armor?.beamResist&&d.tier===4;}));
 const advanced=['commanders_coat','worldroot_plate','bloodplate','farstrider_boots','lifebound_vestments','second_skin_suit','adaptive_dermis','conquerors_plate'];
 T.ok('all eight restored advanced armor pieces resist beams',advanced.every(id=>{const d=items.find(d=>d.id===id);return d?.armor?.beamResist&&d.lootTier===4;}));
 function fresh(){G.tbfight=null;G.over=false;G.won=false;K.newRun(G);const s=G.state.scholar;s.abilities=[];s.backgroundAbilities=[];s.equipped={};s.inventory=[];s.health=100;s.kcal=5000;return s;}
 let s=fresh();s.inventory=[{itemId:'alien_helm',units:1}];s.equipped.acc1={itemId:'locket',bonded:true,bond:100};T.ok('carried armor and bonded sentimental accessories are not beam armor',G.apBeamResistPieces().length===0);
 for(const id of advanced){s=fresh();const def=items.find(d=>d.id===id),slot=globalThis.Scattering.equipment.slotForItem(def);s.inventory=[{itemId:id,units:1}];G.equip(0,slot);T.ok('actual Wear makes '+id+' protect its wearer',G.apBeamResistPieces().some(p=>p.itemId===id));}
 const sets=[{}, {head:{itemId:'alien_helm'}}, {head:{itemId:'alien_helm'},torso:{itemId:'alien_carapace'}}, {head:{itemId:'alien_helm'},torso:{itemId:'alien_carapace'},legs:{itemId:'alien_greaves'},hands:{itemId:'alien_gauntlets'},shoes:{itemId:'alien_boots'}}];
 const hits=[];
 for(let i=0;i<sets.length;i++){s=fresh();K.fight(G,'hushwolf');const p=G.tbFighter('p');p.hp=100;p.maxHp=100;p.alive=true;s.health=100;s.equipped=sets[i];const pieces=G.apBeamResistPieces().length,random=Math.random;let hit;Math.random=()=>.5;try{hit=G.apBeamHit('p',0,'prepared beam');}finally{Math.random=random;}hits.push(hit);T.ok('real beam hits the actual player with '+pieces+' resistant pieces',p.hp<100&&hit>0);}
 T.ok('unprotected beam remains lethal rather than a free whiff',hits[0]>=90);
 T.ok('one resistant piece leaves severe injury',hits[1]>=60&&hits[1]<=80);
 T.ok('two pieces still hurt',hits[2]>=40&&hits[2]<=60);
 T.ok('five pieces soften the same real beam without immunity',hits[3]>=10&&hits[3]<=25);
 s=fresh();s.day=10;s.integration=100;G.state.systemArrived=true;G.state.party=[];const threat=G.threatRating;try{G.threatRating=()=>30;T.ok('actual readiness rejects an early unprotected solo bearer',!G.apReadinessCheck().ready);s.day=30;G.state.party=G.state.village.roster.filter(id=>id!==G.villagerId).slice(0,2);G.threatRating=()=>60;T.ok('actual readiness accepts an experienced supported bearer',G.apReadinessCheck().ready);G.state.party=[];s.equipped={head:{itemId:'alien_helm'},torso:{itemId:'alien_carapace'},legs:{itemId:'alien_greaves'}};T.ok('actual readiness recognizes resistant solo equipment',G.apReadinessCheck().ready);}finally{G.threatRating=threat;}
 T.done();})().catch(e=>{console.error(e.stack);process.exitCode=1;});
