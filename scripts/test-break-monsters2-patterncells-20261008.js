'use strict';
// Same-tile legacy geometry, one shared seeded runtime per child encounter.
// No reuse of a dead bearer, private end-turn input, or fighter resurrection.
const K=require('./godpath/lib'),a=require('assert/strict'),cp=require('child_process'),T=K.reporter('Same-tile attack geometry');
async function encounter(id,seed,limit,mode){
 const G=await K.load({seed,narration:true});K.newRun(G);
 const m=K.fight(G,id,{px:4,py:4,mx:4,my:4}),f=G.tbfight,p=G.tbFighter('p');a(m&&p&&!f.over);
 if(mode==='declared-beam'){
  // Prepared legacy declaration boundary, separate from normal AI range choice.
  const attack=G.tbDeclareAs(m,'Home Movies');a.equal(attack.pattern.type,'beam');
  G.encSetPhase(m,'spell');m.mpWatch=0;m.mpDeclared=true;m.mpTx=p.mx;m.mpTy=p.my;
  G.encDeclareBeam(m,{f:p,dist:0},attack.telegraph);
  a.equal(m.telegraph.pattern.type,'beam');
 }
 const bearer=G.villagerId,hits=[];let dmg=0,coverLies=0,rounds=0,turnAttack=null;
 const damage=G.tbDamage,say=G.say,monsterTurn=G.tbMonsterTurn;
 G.tbMonsterTurn=function(actor,...args){const previous=turnAttack,t=actor.telegraph;turnAttack=t?{name:t.attackName,pattern:t.pattern?.type}:null;try{return monsterTurn.call(this,actor,...args);}finally{turnAttack=previous;}};
 G.tbDamage=function(key,...args){const prior=p.hp,r=damage.call(this,key,...args);if(key==='p'){const debit=Math.max(0,prior-p.hp);dmg+=debit;if(debit)hits.push({...turnAttack,damage:debit});}return r;};
 G.say=function(message,...args){if(String(message).includes('dies against the trees'))coverLies++;return say.call(this,message,...args);};
 while(G.tbfight===f&&!f.over&&!G.over&&p.alive&&G.villagerId===bearer&&rounds<limit){
  rounds++;m.mx=p.mx;m.my=p.my;G.tbPlayerWait();
 }
 return{id,seed,mode,hits,dmg,coverLies,rounds,bearer,finalBearer:G.villagerId,hp:p.hp,over:f.over,result:f.result,phases:{phase:m.beamPhase,telegraph:m.telegraph},lines:G.log.slice(-10).map(String)};
}
if(process.argv[2]==='--child')encounter(process.argv[3],Number(process.argv[4]),Number(process.argv[5]),process.argv[6]).then(r=>console.log('GEOMETRY_RESULT '+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else(async()=>{const G=await K.load({seed:4242}),C=globalThis.Scattering.combat;
 for(const type of ['beam','line','charge']){const cells=C.patternCells({type,length:6,width:1},4,4,4,4);T.ok(type+' same tile covers exactly that tile',cells.length===1&&cells[0].cx===4&&cells[0].cy===4);}
 T.ok('ordinary charge still reaches adjacent target',C.patternCells({type:'charge',length:6,width:1},4,4,4,6).some(c=>c.cx===4&&c.cy===6));
 const burst=C.patternCells({type:'burst',radius:2},4,4,4,4);T.ok('burst remains its radius-two square',burst.length===25&&burst.some(c=>c.cx===4&&c.cy===4));
 for(const[id,seed,limit,mode]of [['mirror_stag',7001,12],['review_drone',7002,12],['memory_projector',7003,14],['white_noise_heron',7004,10],['memory_projector',7003,6,'declared-beam']]){const child=cp.spawnSync(process.execPath,[__filename,'--child',id,String(seed),String(limit),mode||'natural'],{cwd:K.ROOT,encoding:'utf8',maxBuffer:8*1024*1024});a.equal(child.status,0,child.stderr);const markers=child.stdout.split('\n').filter(s=>s.startsWith('GEOMETRY_RESULT '));a.equal(markers.length,1);const r=JSON.parse(markers[0].slice(16));console.log(JSON.stringify(r));T.ok(id+' '+(mode||'natural')+' actually debits the actual player body',r.dmg>0);if(id==='memory_projector')T.ok(mode?'actual named Home Movies beam lands at the legacy declaration boundary':'natural close-range projector uses its authored Blooper Reel',r.hits.some(h=>mode?h.name==='Home Movies'&&h.pattern==='beam':h.name==='Blooper Reel'&&h.pattern==='single'));if(['review_drone','white_noise_heron'].includes(id))T.ok(id+' never invents zero-range cover',r.coverLies===0);}
 T.done();})().catch(e=>{console.error(e.stack);process.exitCode=1;});
