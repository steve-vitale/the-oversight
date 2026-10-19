'use strict';
const K=require('./lib'),T=K.reporter('garden player flow');
(async()=>{
 const G=await K.load({seed:181028});K.newRun(G);
 G.map.px=4;G.map.py=4;G.state.scholar.insideHaven=false;
 T.ok('unrelated Haven ground does not offer plot creation',!G.cellActions(0,0).includes('Make a garden plot'));
 T.ok('fixed garden patch offers its own interaction',G.cellActions(3,1).includes('Garden'));
 T.ok('garden has a grid marker consumer',typeof G.gardenMarkerAt==='function');
 G.makePlot();
 if(G.gardenMarkerAt){
  T.ok('real plot creation paints an empty numbered plot',/Plot 1.*empty/.test(G.gardenMarkerAt(3,1)));
  T.ok('plots do not paint across unrelated ground',G.gardenMarkerAt(0,0)==='');
  G.state.scholar.insideHaven=true;
  T.ok('garden is outside, never painted in the hall',G.gardenMarkerAt(3,1)==='');
  G.state.scholar.insideHaven=false;
 }
 const strip=G.gardenStripHtml();
 T.ok('empty plot gives a persistent seed next step',/Nothing grows|Sow 2 units/i.test(strip));
 const crop=G.data.plants.find(p=>p.id==='dandelion');
 G.state.codex.plants[crop.id]={level:1};G.state.scholar.inventory.push({plantId:crop.id,units:3});
 const before=JSON.stringify(G.state);const choices=G.gardenStripHtml({sowOpen:true});
 T.ok('seed choices are wired inline rather than hidden behind another screen',choices.includes('data-garden-seed="dandelion"'));
 T.ok('rendering seed choices consumes nothing',JSON.stringify(G.state)===before);
 G.sowPlot(crop.id);
 T.ok('actual sow consumes exactly two units',G.state.scholar.inventory.find(i=>i.plantId===crop.id).units===1);
 T.ok('actual sow persists a growing crop',G.gardenPlots()[0].pid===crop.id&&G.gardenStatus().live===1);
 if(G.gardenMarkerAt)T.ok('growing marker names only known crop',/Dandelion/.test(G.gardenMarkerAt(3,1)));
 const s=G.state.scholar;s.day+=G.gardenGrowthDays(crop.form);G.gardenPlots()[0].lastTend=s.day;
 T.ok('mature crop exposes real harvest',G.gardenGate('harvest').ok);
 const kcal=G.plotYieldKcal(G.gardenPlots()[0]);G.harvestGarden();
 T.ok('harvest delivers food using the existing yield',G.state.scholar.inventory.filter(i=>i.plantId===crop.id).reduce((n,i)=>n+i.units,0)===1+Math.max(1,Math.round(kcal/crop.caloriesPerUnit)));
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
