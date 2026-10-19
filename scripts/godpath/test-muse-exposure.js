'use strict';
// Integration proof: one shared-harness load per child, including the actual
// day's-end hook. Never skip the fire case because a random liar is absent.
const assert=require('assert'),cp=require('child_process'),K=require('./lib');
const mode=process.argv[2];
if(!mode){
  const T=K.reporter('Muse exposure integration');
  for(const name of ['earned','fire','off']){
    const r=cp.spawnSync(process.execPath,[__filename,name],{encoding:'utf8',env:{...process.env,EXPOSURE:name==='off'?'0':'1'},maxBuffer:4*1024*1024});
    T.ok('isolated real-runtime '+name,r.status===0);
    if(r.status!==0)console.error(r.stdout+r.stderr);
  }
  T.done();
}else (async()=>{
  const G=await K.load({seed:mode==='fire'?4244:4242});K.newRun(G);
  const ids=G.state.village.roster.filter(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  assert(ids.length>=3,'real living residents required');
  const records=G.exposureRecord();
  if(mode==='off'){
    const before=JSON.stringify(G.state);
    assert.equal(G.recordExposure({kind:'lie',accuser:ids[0],accused:ids[1],charge:'test'}),null);
    assert.equal(G.exposureFireTick(),null);assert.equal(JSON.stringify(G.state),before);
    return;
  }
  if(mode==='earned'){
    const initial=G.ledger().exposed||0;
    for(const bad of [{},{kind:'lie'},{kind:'lie',accused:ids[0]}])assert.equal(G.recordExposure(bad),null);
    assert.equal(G.ledger().exposed||0,initial);
    const ev={kind:'lie',accuser:ids[0],accused:ids[1],charge:'lied about where they came from'};
    const first=G.recordExposure(ev);assert(first&&first.accuser===ids[0]&&first.accused===ids[1]);
    assert.equal(G.recordExposure({...ev,accuser:ids[2]}),null);
    assert.equal(G.ledger().exposed,initial+1);
    G.recordExposure({...ev,accused:ids[2],charge:'lied about their trade'});
    const seat=G.tableSeat;G.tableSeat=()=>({seat:'lesser',detail:{}});
    try{
      assert.equal(G.tableEarnedPaths().find(p=>p.id==='witness').earned,false,'two actual exposures do not unlock witness');
      G.recordExposure({...ev,charge:'a distinct wrong'});
      assert.equal(G.tableEarnedPaths().find(p=>p.id==='witness').earned,true,'third actual exposure earns the witness door');
      assert.equal(G.tableEarnedPaths().find(p=>p.id==='witness').strength,49);
    }finally{G.tableSeat=seat;}
    const lines=G.exposureChargeLines(3).join('\n');
    assert(lines.includes(G.getPerson(ids[1]).name.split(' ')[0])&&lines.includes(ev.charge));
    assert.equal(records.length,3);
    return;
  }
  assert.equal(mode,'fire');
  // Read actual seeded lies before installing the narrow outcome tape. This
  // fixture controls a rare beat, not character generation or a campaign.
  assert(ids.some(id=>Object.values(G.npcLies(id)||{}).some(l=>l&&!l.confessed)),'seeded resident has an actual unconfessed lie');
  for(const id of ids)G.npcLies(id);
  const rng=Math.random,say=G.say,spoken=[];
  let rec;
  try{
    Math.random=()=>0.01;
    G.say=function(line){spoken.push(String(line));return say.apply(this,arguments);};
    rec=G.exposureFireTick();
  }finally{Math.random=rng;G.say=say;}
  assert(rec&&rec.kind==='lie'&&ids.includes(rec.accuser)&&ids.includes(rec.accused)&&rec.accuser!==rec.accused);
  assert(spoken.some(s=>s.includes('🔥')),'actual fire accusation is narrated');
  assert(records.some(r=>r.kind==='confession'),'named resident answers with an actual confession');
  const hook=G.exposureFireTick;let ticks=0;
  G.exposureFireTick=function(){ticks++;return hook.apply(this,arguments);};
  const day=G.state.scholar.day;
  try{G.endDay();}finally{G.exposureFireTick=hook;}
  assert.equal(G.state.scholar.day,day+1,'actual day advances');
  assert.equal(ticks,1,'actual endDay invokes the exposure hook once');
})().catch(e=>{console.error(e);process.exitCode=1;});
