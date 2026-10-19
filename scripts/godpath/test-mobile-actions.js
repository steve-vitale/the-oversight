'use strict';
const K=require('./lib'),T=K.reporter('mobile action routing'),source=K.readSrc('src/js/app.js').replace(/\r\n/g,'\n');
// Execute the actual UI dispatcher against the shared full Game. Do not copy
// routes or substitute a Game stub: a passing helper alone missed this bug.
const start=source.indexOf('  function doContextAction('),end=source.indexOf('\n  // GARDEN TAP',start),factory=new Function('Game',source.slice(start,end)+'\nreturn doContextAction;');
(async()=>{const G=await K.load({seed:7,narration:true}),route=factory(G);
function field(){const s=K.newRun(G,'Berlin, Germany');s.insideHaven=false;for(let y=0;y<9;y++)for(let x=0;x<9;x++){if(G.tileAt(x,y).type==='haven')continue;const d=G.genDetail(x,y);for(let cy=1;cy<8;cy++)for(let cx=1;cx<8;cx++)if(d[cy][cx]==='plant'||d[cy][cx]==='bush'){G.map.px=x;G.map.py=y;s.mx=cx;s.my=cy;return{cx,cy};}}throw Error('No real generated plant fixture');}
let p=field(),s=G.state.scholar,inventory=JSON.stringify(s.inventory),ticks=s.dayTicks;route(p.cx,p.cy,'Examine');
T.ok('visible Examine never harvests or changes carried inventory',JSON.stringify(s.inventory)===inventory);
T.ok('visible Examine uses the existing cheap two-tick action',s.dayTicks-ticks===2);
T.ok('visible Examine records examination memory through the real recognition system',Object.values(G.state.codex.observations||{}).some(o=>o.via.includes('examine')));
p=field();s=G.state.scholar;inventory=JSON.stringify(s.inventory);route(p.cx,p.cy,'Forage');
T.ok('Forage still harvests through the actual interaction entry point',JSON.stringify(s.inventory)!==inventory);
// A tiny DOM event adapter only; action availability, targets and execution all
// come from the real Game and actual UI functions, not hand-authored options.
const ns=source.indexOf('  function nearbyActionItems()'),ne=source.indexOf('\n  // surroundHTML',ns),nearby=new Function('Game',source.slice(ns,ne)+'\nreturn nearbyActionItems;')(G);
field();let pair=null;for(let y=0;y<9&&!pair;y++)for(let x=0;x<9&&!pair;x++){if(G.tileAt(x,y).type==='haven')continue;G.map.px=x;G.map.py=y;const detail=G.genDetail(x,y),seen=new Map();for(let cy=0;cy<9&&!pair;cy++)for(let cx=0;cx<9&&!pair;cx++){if(G.cellProps(detail[cy][cx]).blocks)continue;G.state.scholar.mx=cx;G.state.scholar.my=cy;const items=nearby(),i=items.findIndex(it=>it.label==='Examine');if(i<0)continue;const key=JSON.stringify(items.map(it=>[it.label,Math.sign(it.cx-cx),Math.sign(it.cy-cy)])),a=seen.get(key),b={cx,cy,items,i};if(a&&(a.items[i].cx!==items[i].cx||a.items[i].cy!==items[i].cy))pair={a,b};else seen.set(key,b);}}
T.ok('real generated field supplies identical context labels with a changed target',!!pair);
if(pair){const ws=source.indexOf('  function wireContextBar()'),we=source.indexOf('\n  // selfBarHTML',ws),button={dataset:{ctx:String(pair.a.i)}},bar={querySelectorAll:()=>[button]},doc={querySelector:()=>bar},wire=new Function('document','nearbyActionItems','actAndRefresh','doContextAction',source.slice(ws,we)+'\nreturn wireContextBar;')(doc,nearby,fn=>fn(),route),sch=G.state.scholar;sch.mx=pair.a.cx;sch.my=pair.a.cy;wire();sch.mx=pair.b.cx;sch.my=pair.b.cy;const original=G.examineCell;let target;G.examineCell=function(cx,cy){target=[cx,cy];return original.call(this,cx,cy);};try{button.onclick();}finally{G.examineCell=original;}const expected=pair.b.items[pair.b.i];T.ok('cached context callback resolves the current real target after movement',JSON.stringify(target)===JSON.stringify([expected.cx,expected.cy]));}
// Reset the ordinary fixture before checking the live death guard.
field();s=G.state.scholar;
G.over=true;inventory=JSON.stringify(s.inventory);ticks=s.dayTicks;route(p.cx,p.cy,'Examine');
T.ok('Examine preserves the live post-death action guard',JSON.stringify(s.inventory)===inventory&&s.dayTicks===ticks);T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
