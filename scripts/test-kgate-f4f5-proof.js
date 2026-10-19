#!/usr/bin/env node
'use strict';
// F4/F5: real shared runtime, deterministic tree studies and truthful/lying
// People Codex contrasts. A job prefix such as ER is not a word in person.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),K=require('./godpath/lib');
const seed=Number(process.env.SEED||20261006);let checks=0;
function check(name,condition){assert(condition,name);checks++;console.log('PASS '+name);}
(async()=>{
 const G=await K.load({seed,narration:true});G.debugRegion='na_eastern_woodlands';K.newRun(G,'Columbus, Ohio');
 check('explicit landing retains unknown pine',G.state.region==='na_eastern_woodlands'&&G.treeLevel('pine')===0);
 if(G.state.scholar.insideHaven)G.exitBuilding();
 const s=G.state.scholar,tile=G.playerTile(),detail=G.genDetail(G.map.px,G.map.py);
 s.mx=4;s.my=4;s.inventory=[];tile.type='forest_floor';
 for(let y=2;y<=6;y++)for(let x=2;x<=6;x++)detail[y][x]='grass';
 detail[4][5]='tree';tile.modifiers=tile.modifiers||{};tile.secrets=tile.secrets||{};
 const mod={species:'pine',health:'healthy',ivy:false,known:true};tile.modifiers['5,4']=mod;
 tile.secrets['5,4']={yield:3,known:false};G.state.codex.examined={};G.state.codex.treeStudy={};
 const beforeF4=`${mod.species}, ${mod.health}.`;
 check('F4 old expression demonstrates actual species leak',/\bpine\b/.test(beforeF4));
 const app=fs.readFileSync(path.join(__dirname,'../src/js/app.js'),'utf8');
 const prints=app.split('\n').filter(l=>l.includes('mod.species'));
 check('F4 panel routes every mod.species print through treeName',prints.length>0&&prints.every(l=>l.includes('treeName')));
 check('F4 examined flag alone does not name unknown pine',(G.treeName(mod.species)||'tree')==='tree');
 const surface=G.cellInteract(5,4); // Public surface inspection; no harvest.
 check('F4 actual surface inspection remains unnamed',!G.treeName('pine')&&s.inventory.length===0);
 G.examineCell(5,4);check('F4 first Examine establishes inspection before deep study',!G.treeName('pine'));
 for(let study=1;study<=2;study++){G.examineCell(5,4);check('F4 deep study '+study+' retains unknown species',!G.treeName('pine'));}
 G.examineCell(5,4);
 check('F4 third actual study opens species label',G.treeLevel('pine')===1&&G.treeName(mod.species)==='pine');
 check('F4 actual studies do not harvest',s.inventory.length===0&&tile.secrets['5,4'].yield===3);
 const persons=G.npcIds().slice(0,4);check('four real NPC subjects exist',persons.length===4);
 G.state.systemArrived=false;
 const receipts=[];
 for(const [i,occupation] of ['ER nurse','artist','bus driver (retired)','mortician'].entries()){
  const vid=persons[i],person=G.data.villagers.find(v=>v.id===vid);assert(person);
  Object.assign(person,{formerOccupation:occupation,pro:'they',age:40});
  const vp=G.vpOf(vid);vp.lies=vp.lies||{};delete vp.lies.occupation;
  G.state.village.knownNames=G.state.village.knownNames||{};delete G.state.village.knownNames[vid];
  const jp=G.journalPerson(vid);jp.name=null;jp.occupation=null;
  check('F5 '+occupation+': name and occupation initially unknown',!G.nameKnown(vid)&&!jp.occupation);
  const role=occupation.toLowerCase().replace(/\s*\(.*?\)/g,'').trim(),before=', the '+role,pre=G.whoTag(vid);
  check('F5 '+occupation+': historical expression exposes full role',before===', the '+role);
  check('F5 '+occupation+': actual unknown tag has observable identity',/^the person in their 40s/.test(pre));
  check('F5 '+occupation+': actual unknown tag contains no occupation role',!pre.includes(', the '));
  if(i===0)check('F5 old ER substring matcher reproduces false alarm',pre.toLowerCase().includes('er')&&!pre.toLowerCase().includes('er nurse'));
  const learned=G.journalLearn(vid,'occupation',occupation,{sure:true,via:'talk'}),post=G.whoTag(vid);
  check('F5 '+occupation+': actual journal learns occupation',!!learned&&G.journalPerson(vid).occupation.value===occupation);
  check('F5 '+occupation+': full role appears only after learning',post===pre+', the '+role);
  receipts.push({occupation,pre,post});
 }
 // Liar's mask: a claim is heard fiction, not permission to print the truth.
 const vid=persons[0],jp=G.journalPerson(vid),vp=G.vpOf(vid);jp.occupation=null;
 vp.lies.occupation={told:'florist',confessed:false};
 const claimed=G.whoTag(vid);
 check('F5 active lie prints only the told occupation',claimed.endsWith(', the florist')&&!claimed.includes('er nurse'));
 G.journalLearn(vid,'occupation','ER nurse',{sure:true,via:'talk'});
 check('F5 unconfessed mask still controls the descriptor',G.whoTag(vid)===claimed);
 vp.lies.occupation.confessed=true;
 check('F5 confessed mask uses actual journal truth',G.whoTag(vid).endsWith(', the er nurse'));
 console.log('KGATE_FIXTURE_RESULT '+JSON.stringify({seed,checks,treeLevel:G.treeLevel('pine'),receipts,claimed,confessed:G.whoTag(vid)}));
 delete G.debugRegion;console.log(`kgate-f4f5-proof: ${checks} pass, 0 fail`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
