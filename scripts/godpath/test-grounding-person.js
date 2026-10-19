'use strict';
// Prepared people, meals and arenas; actual costs, lessons, saves and mantle.
const K = require('./lib'), T = K.reporter('grounding-person');
(async () => {
  const saves = new Map();
  global.localStorage = { getItem:k=>saves.get(String(k))??null, setItem:(k,v)=>saves.set(String(k),String(v)), removeItem:k=>saves.delete(String(k)), key:i=>[...saves.keys()][i]??null, get length(){return saves.size;} };
  const G = await K.load({seed:Number(process.env.SEED || 7)}); let s,v,id,other,f,p,a,m;
  function fresh() {
    G.tbfight=null; G.over=false; K.newRun(G); s=G.state.scholar; v=G.state.village;
    s.day=85;s.kcal=1200;s.health=100;s.abilities=[];s.inventory=[];s.grounding=80;G.state.systemArrived=true;
    [id,other]=v.roster.filter(x=>x!==G.villagerId); delete G.state.groundingByPerson;
  }
  function arena(npc=true) {
    fresh();const roster=v.roster.slice();v.npcGodhood=npc?{[id]:{active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}}}:{};
    v.npcAbilities={[id]:[]};v.npcSkills={[id]:[]};v.pantry=[];G.stockPantry(G.villageDailyNeed()*5,'Prepared stores');G.npcNeeds(id).hunger=10;
    m=K.fight(G,'review_drone',{px:3,py:4,mx:4,my:4,hp:100});v.roster=roster;
    f=G.tbfight;p=G.tbFighter('p');m.hp=m.maxHp=10000;p.acted=false;p.moveLeft=3;p.stunned=0;
    a={key:'v_voice',kind:'villager',villagerId:id,name:G.displayName(id),hp:100,maxHp:100,mx:2,my:4,alive:true,fled:false,ai:'brave'};
    f.fighters.push(a);f.order=['p',a.key,m.key];f.turnIdx=0;f.round=1;delete f._gv;
  }
  function reload() { const key=G.state.runKey;const ok=G.load(key);s=G.state.scholar;v=G.state.village;f=G.tbfight;p=f&&G.tbFighter('p');return ok; }
  function feast() {
    fresh();s.insideHaven=true;G.map.px=v.px??4;G.map.py=v.py??4;
    v.pantry=[{name:'Harvest',units:40,kcalEach:500,spoilDay:9999,kg:0.1,safe:true}];v.sick={};v.health={};v.away={};
    for(const x of v.roster.filter(x=>x!==G.villagerId)){v.trust[x]=80;G.npcNeeds(x).hunger=60;}
    s.grounding=50;G.state.groundingByPerson={[id]:40,[other]:30};
  }
  fresh();T.ok('legacy player value and unrecorded NPC default use separate sources',G.grounding()===80&&G.grounding(id)===100&&!G.state.groundingByPerson);
  const clock=Date.now,last=G.state.telemetry.at(-1)?.t??0;let reads=0;Date.now=()=>{reads++;return clock();};
  try{G.addGrounding(-1,'receipt clock',id,{save:false});}finally{Date.now=clock;}
  T.ok('grounding receipt never advances the generated-ID clock',reads===0&&G.state.telemetry.at(-1).t===last&&G.state.telemetry.at(-1).person===id);
  delete G.state.groundingByPerson;
  G.addGrounding(-5,'test cost',id);T.ok('NPC cost changes only its owner',G.grounding(id)===95&&G.grounding()===80);
  G.state.groundingByPerson[G.villagerId]=1;T.ok('current bearer canonical id always reads scholar',G.grounding(G.villagerId)===80);
  G.addGrounding(-1000,'floor',id);T.ok('zero remains a real personal value',G.grounding(id)===0);
  G.addGrounding(1000,'ceiling',id);T.ok('recovery clamps at100',G.grounding(id)===100);
  G.addGrounding(-37,'history',id);const village=v;G.state.village={};T.ok('person history survives village replacement',G.grounding(id)===63);G.state.village=village;
  G.save();T.ok('real state save/load retains NPC history',reload()&&G.grounding(id)===63);
  arena();G.tbPlayerWait();
  T.ok('actual NPC Voice pays own five grounding plus existing food',G.grounding(id)===95&&G.grounding()===80&&G.npcNeeds(id).hunger===15&&f._gv.uses[a.key+':rally_cry']===1);
  T.ok('last action autosave restores paid bonus without an extra save',reload()&&G.grounding(id)===95&&G.npcNeeds(id).hunger===15&&!!f.playerCommandReturn&&G.tbCurrent()===p);
  G.tbPlayerWait();G.tbPlayerWait();T.ok('spent Voice cannot charge again',G.grounding(id)===95&&f._gv.uses['v_voice:rally_cry']===1);
  arena();G.npcNeeds(id).hunger=79;G.tbPlayerWait();T.ok('unfunded cast pays no grounding',G.grounding(id)===100&&!f.playerCommandReturn);
  arena(false);s.godhood={active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}};s.grounding=76;
  T.ok('player actual Rally Cry pays120 and five grounding',G.useAbility('god','rally_cry')===true&&s.kcal===1080&&s.grounding===71&&p.acted);
  T.ok('last player action autosave retains cost and use gate',reload()&&s.kcal===1080&&s.grounding===71&&p.acted&&f._gv.uses['p:rally_cry']===1);
  const paid=s.kcal;T.ok('reload cannot buy another once-per-fight cast',G.useAbility('god','rally_cry')===false&&s.kcal===paid&&s.grounding===71);
  fresh();s.godhood={active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}};
  T.ok('daily Voice actually pays its existing150 and five grounding',G.useAbility('god','be_heard')===true&&s.kcal===1050&&s.grounding===75);
  T.ok('daily paid stamp survives its last autosave',reload()&&s.kcal===1050&&s.grounding===75&&G.useAbility('god','be_heard')===false&&s.kcal===1050);
  arena(false);s.godhood={active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}};a.villagerId=G.villagerId;
  T.ok('self alias cannot pass precheck or consume food/humanity',G.useAbility('god','rally_cry')===false&&s.kcal===1200&&s.grounding===80&&!f._gv?.uses?.['p:rally_cry']);
  for(const incoming of [0,63,null]) {
    fresh();const old=G.villagerId;s.grounding=29;s.integration=81;v.roster=[old,id];v.trust[id]=100;
    if(incoming!==null)G.state.groundingByPerson={[id]:incoming};G.playerDeath('prepared succession');s=G.state.scholar;
    T.ok('real death inherits successor humanity '+incoming,!G.over&&G.villagerId===id&&G.grounding()===(incoming??100)&&G.state.groundingByPerson[old]===29&&G.state.groundingByPerson[id]===undefined&&s.integration===81);
  }
  feast();G.hostFeast({guests:[id]});T.ok('paid shared feast restores exactly three per actual human diner',s.grounding===53&&G.grounding(id)===43&&G.grounding(other)===30);
  G.hostFeast({guests:[id]});T.ok('same-day retry grants no recovery',s.grounding===53&&G.grounding(id)===43);
  T.ok('feast recovery survives the real final save',reload()&&s.grounding===53&&G.grounding(id)===43);
  feast();v.pantry[0].units=1;G.hostFeast({guests:[id]});T.ok('unfunded meal grants no humanity',s.grounding===50&&G.grounding(id)===40);
  feast();v.health[id]=10;G.hostFeast({guests:[id]});T.ok('absent guests grant no humanity',s.grounding===50&&G.grounding(id)===40);
  feast();K.giveAbility(G,'fusion_reactor');s.fusionReactor={installed:true,online:true};G.hostFeast({guests:[id]});T.ok('reactor host and lone human guest are not two human diners',s.grounding===50&&G.grounding(id)===40);
  feast();K.giveAbility(G,'fusion_reactor');s.fusionReactor={installed:true,online:true};G.hostFeast({guests:[id,other]});T.ok('two human guests can recover together beside a reactor host',s.grounding===50&&G.grounding(id)===43&&G.grounding(other)===33);
  fresh();G.state.groundingByPerson={[id]:50};const st=G.agencyState();st.know[id]={plants:0,monsters:0,places:[],fought:[]};st.teachable[id]=[{topic:'plants',day:85}];
  const known=JSON.stringify(G.state.codex.plants);G.agencyTurn(id,'agency:ask_expedition');
  T.ok('actual finite plant lesson restores teacher humanity',G.grounding(id)===52&&JSON.stringify(G.state.codex.plants)!==known&&st.teachable[id].length===0&&s.grounding===80);
  T.ok('earned lesson recovery is saved without a caller save',reload()&&G.grounding(id)===52);
  G.agencyTurn(id,'agency:ask_expedition');T.ok('exhausted lesson grants no recovery',G.grounding(id)===52);
  G.agencyState().know[id].places=['Prepared ridge'];G.agencyTurn(id,'agency:ask_expedition');T.ok('place promise without knowledge transfer grants no recovery',G.grounding(id)===52);
  fresh();const plants=G.data.plants.filter(x=>G.plantKnown(x.id));
  T.ok('fixture has real player plant knowledge',plants.length>0);
  for(const x of plants)G.villagerLearnsPlant(id,x.id,'prepared known');
  const g=s.grounding;T.ok('already-known Table lesson grants neither recovery nor facade credit',G.tableFacilitate('teach',id)===false&&s.grounding===g&&!G.tableState().facilitated[id]?.acts.includes('teach'));
  T.ok('phantom and self cannot receive teaching credit',G.tableFacilitate('teach','missing-person')===false&&G.tableFacilitate('teach',G.villagerId)===false&&s.grounding===g);
  fresh();const lesson=G.data.plants.find(x=>G.plantKnown(x.id));
  for(const store of ['familiar','taught','plantKnowledge']){v[store]=v[store]||{};v[store][id]=[];}
  G.tableFacilitate('teach',id);
  T.ok('real Table transfer earns teacher recovery and facilitation credit',G.plantKnownBy(id,lesson.id)&&s.grounding===82&&G.tableState().facilitated[id].acts.includes('teach'));
  T.ok('real Table teaching recovery is included in final save',reload()&&s.grounding===82&&G.plantKnownBy(id,lesson.id));
  const lessonPaid=s.grounding;G.tableFacilitate('teach',id);T.ok('completed Table lesson cannot farm humanity',s.grounding===lessonPaid);
  fresh();v.away[id]={days:2};T.ok('away teacher target is refused',G.tableFacilitate('teach',id)===false&&s.grounding===80);
  fresh();s.grounding=0;s.kcal=G.kcalCap();T.ok('humanity does not create an unapproved blanket overcharge nerf',G.overcharged()&&G.abilityPowerMult()===1.25&&G.groundingMult()===0.6);
  fresh();s.grounding=76;G.state.groundingByPerson={[id]:76};const trust=v.trust[id],lines=K.captureSays(G);
  G.addGrounding(-5,'the voice',id);lines.restore();
  T.ok('NPC tier warning never charges the current bearer trust',G.grounding(id)===71&&s.grounding===76&&v.trust[id]===trust);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
