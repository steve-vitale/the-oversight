'use strict';
const K=require('./lib'),T=K.reporter('succession encounter location');
(async()=>{
 const G=await K.load({seed:181030});K.newRun(G);
 let origin;
 for(let y=0;y<9&&!origin;y++)for(let x=0;x<9&&!origin;x++)if(G.tileAt(x,y).type==='creek')origin={x,y,tile:G.tileAt(x,y)};
 if(!origin)throw Error('No creek in generated region');
 const s=G.state.scholar;s.insideHaven=false;G.map.px=origin.x;G.map.py=origin.y;
 const fish={id:'creek_chub',mx:4,my:2};s.animal=fish;const old=G.villagerId;
 G.playerDeath('prepared encounter-location death');
 T.ok('real succession changes the bearer and wakes inside Haven',G.villagerId!==old&&s.insideHaven&&G.playerTile().type==='haven');
 T.ok('successor has no remote animal alias',s.animal===null);
 T.ok('the live animal remains on its actual origin tile',origin.tile.animal===fish);
 G.syncRun();const saved=JSON.parse(JSON.stringify(G.state));
 T.ok('saved successor cannot bring the animal back into the hall',saved.scholar.animal===null);
 G.map=saved.run.map;s.insideHaven=false;
 const wasParked=!!G.tileAt(origin.x,origin.y).animal;
 // Prepared neighboring start: travelTo honestly rejects nonadjacent nodes.
 G.map.px=origin.x;G.map.py=origin.y===8?7:origin.y+1;
 const travel=G.travelTo(origin.x,origin.y,true);
 T.ok('ordinary return adopts the parked animal once',wasParked&&s.animal?.id===fish.id&&!G.playerTile().animal,JSON.stringify({origin:[origin.x,origin.y],now:[G.map.px,G.map.py],wasParked,animal:s.animal,parked:G.playerTile().animal,travel,log:G.log.slice(-2).map(String)}));
 K.newRun(G);const hall=G.playerTile();G.state.scholar.animal={id:'creek_chub',mx:4,my:2};
 G.playerDeath('prepared legacy hall alias');
 T.ok('a legacy hall alias is cleared without parking a fish indoors',G.state.scholar.animal===null&&!hall.animal);
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
