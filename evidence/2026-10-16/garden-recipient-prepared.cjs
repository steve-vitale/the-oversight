'use strict';
// Prepared diagnosis, not a campaign or a passing implementation contract.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),root=path.resolve(process.argv[2]||path.join(__dirname,'../..')),K=require(path.join(root,'scripts/godpath/lib')),B=require(path.join(root,'scripts/balance-panel')),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=x=>JSON.parse(JSON.stringify(x));
(async()=>{const G=await K.load({seed:7}),S=globalThis.Scattering,cases=[],warnings=[];const warn=console.warn;console.warn=(...a)=>{warnings.push(a.map(String).join(' '));warn.apply(console,a);};let s,v,caster,other,events=[];
function fresh(){G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;v=G.state.village;G.tbfight=null;s.day=85;s.health=100;s.kcal=300;s.godhood={active:[],recognized:{}};s.abilities=[];s.backgroundAbilities=[];G.state.systemArrived=true;v.harvestDay=-1;v.npcGodhood={};[caster,other]=v.roster.filter(id=>id!==G.villagerId);if(!caster||!other)throw Error('Need two real other residents');v.roster=[G.villagerId,caster,other];v.pantry=[{name:'Prepared stores',units:100,kcalEach:500,safe:true,spoilDay:9999}];for(const id of v.roster)G.npcNeeds(id).hunger=60;G.npcNeeds(caster).hunger=20;events=[];}
const tele=G.tele;G.tele=function(ev,data){if(ev==='god_verb'&&data?.verb==='feed_multitude')events.push(clone(data));return tele?.apply(this,arguments);};
function snap(){return{day:s.day,player:G.villagerId,roster:v.roster.slice(),caster,other,kcal:s.kcal,fullLine:G.fullLine(),cap:G.kcalCap(),harvestDay:v.harvestDay,dead:!!G.vpOf(caster)?.dead,needs:clone(v.needs||v.npcNeeds||{}),hunger:Object.fromEntries([...new Set(v.roster)].map(id=>[id,G.npcNeeds(id).hunger])),events:clone(events)};}
function record(name,action){const before=snap();action();cases.push({name,before,after:snap()});}
function npc(){v.npcGodhood[caster]={active:['living_garden'],recognized:{living_garden:85}};}
fresh();s.kcal=1200;s.godhood={active:['living_garden'],recognized:{living_garden:85}};record('player holder, public paid action',()=>G.useAbility('god','feed_multitude'));
fresh();npc();record('living NPC holder, same daily verb',()=>S.GodVerbs.godDaily(G));record('same day repeated daily hook',()=>S.GodVerbs.godDaily(G));
fresh();npc();G.vpOf(caster).dead=true;record('stale dead holder still on roster',()=>S.GodVerbs.godDaily(G));
fresh();npc();v.roster.push(other);record('duplicate recipient roster entry',()=>S.GodVerbs.godDaily(G));
fresh();npc();v.roster=[caster];G.npcNeeds(caster).hunger=60;record('only hungry caster remains',()=>S.GodVerbs.godDaily(G));
fresh();npc();G.npcNeeds(caster).hunger=72;record('unaffordable caster belly',()=>S.GodVerbs.godDaily(G));
fresh();npc();v.roster=v.roster.filter(id=>id!==caster);record('departed holder outside roster',()=>S.GodVerbs.godDaily(G));
console.warn=warn;const sources=B.manifest(root),out={prepared:true,seed:7,sourceDigest:sha(JSON.stringify(sources)),sources,warnings,cases};process.stdout.write(JSON.stringify(out,null,2)+'\n');})().catch(e=>{console.error(e.stack);process.exitCode=1;});
