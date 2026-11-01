'use strict';
const K=require('./lib'),T=K.reporter('Strike demand payment');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:52});
 function setup(inventory=[]){K.newRun(G);G.state.scholar.day=20;G.state.scholar.inventory=inventory;K.fight(G,'strike',{px:4,py:4,mx:5,my:4});G.tbPlayerWait();return G.tbfight.fighters.find(m=>m.kind==='monster');}
 function options(){return G.tbStrikeDemandOptions?G.tbStrikeDemandOptions():[];}
 let m=setup();const health=G.state.scholar.health,kcal=G.state.scholar.kcal,fight=G.tbfight;
 const accepted=G.tbStrikeMeet('still');
 T.ok('accepting stillness starts a real three-turn commitment instead of dismissing the rat',accepted&&G.tbfight===fight&&m.alive&&!m.fled&&m.sigStrike?.still?.remaining===2);
 T.ok('the pending visible demand reports the unpaid rounds',options().some(x=>x.id==='still'&&x.pending&&x.remaining===2));
 if(G.tbfight)G.tbPlayerWait();T.ok('one more wait is not three paid turns',G.tbfight&&m.sigStrike?.still?.remaining===1&&!m.fled);
 if(G.tbfight)G.tbPlayerWait();T.ok('the third paid still turn resolves the actual encounter nonviolently',m.fled&&!G.tbfight);
 T.ok('stillness does not fake food payment or harm the player',G.state.scholar.health===health&&G.state.scholar.kcal===kcal);

 m=setup();G.tbStrikeMeet('still');let moved=false;
 if(G.tbfight){const p=G.tbFighter('p');for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]]){const x=p.mx+dx,y=p.my+dy;if(G.tbCanOccupy(p,x,y)){moved=!!G.tbPlayerMove(x,y);break;}}if(G.tbfight)G.tbPlayerWait();}
 T.ok('real movement breaks the sequence and restarts three consecutive still rounds',moved&&!m.fled&&m.sigStrike?.still?.remaining===3);
 if(G.tbfight)G.tbPlayerWait();if(G.tbfight)G.tbPlayerWait();T.ok('two waits after moving still leave one round to pay',G.tbfight&&!m.fled&&m.sigStrike?.still?.remaining===1);
 if(G.tbfight)G.tbPlayerWait();T.ok('three new still turns after moving pay the demand',m.fled&&!G.tbfight);

 m=setup();G.tbStrikeMeet('still');G.save();const key=G.state.runKey;
 const loaded=G.load(key),saved=G.tbfight?.fighters.find(x=>x.kind==='monster');
 T.ok('actual save and Continue preserve the unfinished cost',loaded&&saved?.sigStrike?.still?.remaining===2&&!saved.fled);
 if(G.tbfight)G.tbPlayerWait();if(G.tbfight)G.tbPlayerWait();T.ok('Continue cannot skip or repeat the remaining two paid turns',saved?.fled&&!G.tbfight);

 m=setup([{kind:'ration',name:'Prepared ration',units:4,kcalEach:600,kg:0.2}]);const before=G.playerPackKcal();
 T.ok('food demand is backed by real inventory, not the obsolete pack scalar',options().some(x=>x.id==='kcal'&&x.available)&&!G.state.scholar.packKcal);
 const foodPaid=G.tbStrikeMeet('kcal');T.ok('food counter consumes real whole portions before ending the fight',foodPaid&&m.fled&&before-G.playerPackKcal()===2400);
 m=setup();G.state.scholar.packKcal=5000;const p=G.tbFighter('p'),round=G.tbfight.round;
 const refused=G.tbStrikeMeet('kcal');T.ok('phantom food cannot pay or consume an action',!refused&&!m.fled&&!p.acted&&G.tbfight.round===round&&G.playerPackKcal()===0);

 m=setup([{kind:'gear',itemId:'stone_knife',name:'Stone knife',units:2,kg:0.15},{kind:'ration',name:'Ration',units:1,kcalEach:1000,kg:0.2}]);
 const toolPaid=G.tbStrikeMeet('tool');T.ok('tool demand removes one actual carried tool and preserves unrelated food',toolPaid&&m.fled&&G.state.scholar.inventory.find(i=>i.itemId==='stone_knife')?.units===1&&G.playerPackKcal()===1000);
 m=setup([{kind:'gear',itemId:'stone_knife',name:'Bonded knife',units:1,bonded:true,kg:0.15}]);
 T.ok('bonded items cannot become an offered tool payment',!options().some(x=>x.id==='tool'));
 m=setup();G.tbStrikeMeet('still');const remaining=m.sigStrike?.still?.remaining,repeatRound=G.tbfight?.round;
 const repeated=G.tbStrikeMeet('still');T.ok('repeated acceptance cannot reset or instantly pay a pending commitment',!repeated&&m.sigStrike?.still?.remaining===remaining&&G.tbfight?.round===repeatRound);
 if(G.tbfight){const p=G.tbFighter('p'),x=p.mx,y=p.my;if(G.tbCanOccupy(p,x,y+1)){G.tbPlayerMove(x,y+1);G.tbPlayerMove(x,y);}if(G.tbfight)G.tbPlayerWait();}
 T.ok('moving away and back still breaks stillness',!m.fled&&m.sigStrike?.still?.remaining===3);
 m=setup([{kind:'ration',name:'Ration',units:2,kcalEach:1000,kg:0.2}]);G.state.scholar.inventory=[];
 const fp=G.tbFighter('p'),fr=G.tbfight.round;const stale=G.tbStrikeMeet('kcal');
 T.ok('losing posted payment disables the offer and refuses before spending the turn',!stale&&!m.fled&&!fp.acted&&G.tbfight.round===fr&&options().some(x=>x.id==='kcal'&&!x.available));
 const state=JSON.stringify(G.state),fightState=JSON.stringify(G.tbfight);options();options();
 T.ok('reading visible demand choices never initializes or changes gameplay state',JSON.stringify(G.state)===state&&JSON.stringify(G.tbfight)===fightState);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
