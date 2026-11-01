'use strict';
const fs=require('fs'),assert=require('assert/strict'),cp=require('child_process'),K=require('./lib');
const T=K.reporter('Physical charge lane commitment');
const child=process.argv.includes('--child'),remove=process.argv.includes('--remove-lock');
async function load(){
  const read=fs.readFileSync;
  if(remove)fs.readFileSync=function(file,...args){
    let value=read.call(this,file,...args);
    if(String(file).replace(/\\/g,'/').endsWith('/src/js/game.js')){
      const source=String(value),changed=source.replace(" && ptype !== 'charge'",'');
      assert.notEqual(changed,source,'Rejecting control must remove the actual charge lock');
      value=typeof value==='string'?changed:Buffer.from(changed);
    }
    return value;
  };
  try{return await K.load({seed:7,narration:true});}finally{fs.readFileSync=read;}
}
(async()=>{
  const G=await load();
  for(const id of ['rut_king','dustboar'])for(const dodge of [false,true]){
    K.newRun(G);
    const m=K.fight(G,id,{px:5,py:4,mx:1,my:4,hp:500}),p=G.tbFighter('p');
    // Explicit prepared open floor isolates aim from cover and path collision.
    const floor=G.genDetail(G.map.px,G.map.py);
    for(let y=0;y<9;y++)for(let x=0;x<9;x++)floor[y][x]='hall';
    m.telegraph=null;
    for(let i=0;i<6&&!m.telegraph;i++)assert.equal(G.tbPlayerWait(),true,'public Wait advances the prepared fight');
    const active=m.telegraph,label=id+(dodge?' sidestep':' stationary');
    T.ok(label+': actual authored charge declared',active?.pattern?.type==='charge'&&active.turnsLeft===2);
    const cells=structuredClone(active.cells),hp=p.hp;
    if(dodge)assert.equal(G.tbPlayerMove(5,1),true,'public movement spends the actual three-square budget');
    T.ok(label+': chosen position has the intended relation to displayed lane',cells.some(c=>c.cx===p.mx&&c.cy===p.my)===!dodge);
    // Stop at this declaration's resolution, even if the same call declares
    // the next attack. Following attack names would count multiple charges.
    for(let i=0;i<4&&m.telegraph===active;i++)assert.equal(G.tbPlayerWait(),true,'public Wait resolves the declared attack');
    T.ok(label+': declaration actually resolved',m.telegraph!==active);
    T.ok(label+(dodge?': outside declared charge lane takes no charge hit':': staying in declared charge lane still takes damage'),dodge?p.hp===hp:p.hp<hp,JSON.stringify({before:hp,after:p.hp}));
  }
  if(!child){
    const rejected=cp.spawnSync(process.execPath,[__filename,'--child','--remove-lock'],{encoding:'utf8'});
    T.ok('removing the actual resolver lock rejects the proof',rejected.status!==0);
    T.ok('removed-hook control fails both actual public sidesteps',rejected.stdout.includes('FAIL rut_king sidestep: outside declared charge lane')&&rejected.stdout.includes('FAIL dustboar sidestep: outside declared charge lane'),rejected.stderr);
  }
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
