'use strict';
const path=require('path');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../..'));
const K=require(path.join(root,'scripts/godpath/lib')),T=K.reporter('fraying-trust');
(async()=>{
 const store=new Map();global.localStorage={getItem:k=>store.get(String(k))??null,setItem:(k,v)=>store.set(String(k),String(v)),removeItem:k=>store.delete(String(k)),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:Number(process.env.SEED||7)});let s,v,id,other,self;
 function fresh(){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;v=G.state.village;self=G.villagerId;[id,other]=v.roster.filter(x=>x!==self);s.day=85;s.kcal=1200;s.grounding=80;s.godhood={active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}};for(const x of v.roster)v.trust[x]=60;}
 function reload(){const key=G.state.runKey,ok=G.load(key);s=G.state.scholar;v=G.state.village;return ok;}
 fresh();for(const x of v.roster)v.trust[x]=90;const start={...v.trust};
 T.ok('actual daily word at80 pays to75 without fraying',G.useAbility('god','be_heard')===true&&s.kcal===1050&&s.grounding===75&&v.roster.every(x=>v.trust[x]===start[x]));
 s.day++;T.ok('next real paid word crosses75→70',G.useAbility('god','be_heard')===true&&s.grounding===70&&s.kcal===900);
 T.ok('fraying charges distinct living other residents two actual trust',v.roster.filter(x=>x!==self).every(x=>v.trust[x]===88));
 T.ok('bearer own standing is not another person reaction',v.trust[self]===90);
 T.ok('no phantom null person is created',!Object.hasOwn(v.trust,'null'));
 const paid={...v.trust};T.ok('same-day refused word cannot repeat social cost',G.useAbility('god','be_heard')===false&&JSON.stringify(v.trust)===JSON.stringify(paid));
 T.ok('paid word save retains real trust and humanity',reload()&&G.grounding()===70&&v.trust[id]===88&&!Object.hasOwn(v.trust,'null'));
 G.addGrounding(-1,'same band');T.ok('remaining in fraying is not an ongoing tax',v.trust[id]===88);
 G.addGrounding(6,'human recovery');T.ok('recovery crosses back to75 without trust reward',G.grounding()===75&&v.trust[id]===88);
 G.addGrounding(-1,'another crossing');T.ok('a later downward crossing has the existing price again',v.trust[id]===86);
 G.addGrounding(-25,'estranged');T.ok('other tier reactions do not invent extra fraying charges',v.trust[id]===86&&G.groundingTier()==='estranged');
 fresh();s.grounding=75;v.roster.push(id,id,'missing_person');v.trust.missing_person=90;v.trust.former_resident=72;v.roster=v.roster.filter(x=>x!==other);v.trust[other]=67;
 G.addGrounding(-1,'eligibility');T.ok('duplicate roster charges a real person once',v.trust[id]===58);
 T.ok('unknown and former residents retain their stored standing',v.trust.missing_person===90&&v.trust.former_resident===72&&v.trust[other]===67);
 fresh();s.grounding=75;const person=G.getPerson(id);person.dead=true;G.addGrounding(-1,'dead exclusion');T.ok('dead roster member is not a living reactor',v.trust[id]===60);person.dead=false;
 fresh();s.grounding=75;v.trust[id]=0;G.addGrounding(-1,'floor');T.ok('real zero remains zero and cannot underflow',v.trust[id]===0);
 fresh();s.grounding=75;delete v.trust[id];G.addGrounding(-1,'unset');T.ok('unset living trust uses existing ten default',v.trust[id]===8);
 fresh();const snapshot=JSON.stringify(v.trust);for(const bad of [null,undefined,''])G.bumpTrust(bad,-2,'invalid recipient');T.ok('invalid identifiers cannot create phantom trust',JSON.stringify(v.trust)===snapshot);
 fresh();const before=JSON.stringify(v.trust);G.addGrounding(-26,'NPC crossing',id);T.ok('NPC own humanity has no invented player-standing tax',G.grounding(id)===74&&G.grounding()===80&&JSON.stringify(v.trust)===before);
 fresh();v.trust.null=2;v.trust[other]=0;v.trust.former_resident=87;const expected={...v.trust};delete expected.null;G.save();
 T.ok('real legacy load removes only reserved null phantom',reload()&&!Object.hasOwn(v.trust,'null')&&JSON.stringify(v.trust)===JSON.stringify(expected));
 T.ok('legacy cleanup does not retroactively charge residents',v.trust[id]===60&&v.trust[other]===0&&v.trust.former_resident===87);
 const vals=Object.values(expected);T.ok('event trust mean no longer includes phantom on load',G._evAvgTrust()===vals.reduce((a,b)=>a+b,0)/vals.length);
 G.save();T.ok('cleanup survives subsequent actual save/load',reload()&&!Object.hasOwn(v.trust,'null')&&v.trust[other]===0);
 fresh();s.grounding=50;v.trust.null=8;G.save();T.ok('already-fraying legacy bearer is not recharged on load',reload()&&s.grounding===50&&v.trust[id]===60&&!Object.hasOwn(v.trust,'null'));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
