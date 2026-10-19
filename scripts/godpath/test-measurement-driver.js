'use strict';
const path=require('path'),cp=require('child_process'),K=require('./lib'),T=K.reporter('measurement driver configuration'),S=require('../sweep-compare');
(async()=>{
 if(process.argv.includes('--invalid')){let refused=false;try{await S.runComparison({seeds:[7],policies:['zero'],days:1,region:'not_a_playable_region'});}catch(e){refused=/Region is not playable/.test(e.message);}if(!refused)process.exitCode=1;return;}
 let seen;
 S.POLICY_REGISTRY['measurement-config-proof']={id:'measurement-config-proof',setup(G){seen={region:G.state.region,origin:G.homeRegion,knackChosen:G.state.scholar.knackChosen};},daily(){}};
 await require('../sim-harness').quietLog(()=>S.runComparison({seeds:[7],policies:['measurement-config-proof'],days:1,origin:'Paris, France',region:'eu_temperate'}));
 T.ok('explicit region reaches the actual newly started expedition',seen.region==='eu_temperate');
 T.ok('explicit origin reaches the actual expedition home origin',seen.origin==='Paris, France');
 T.ok('driver setup does not choose the idle controller opening',seen.knackChosen!==true);
 T.ok('configuration support is declared for external collectors',S.comparisonCapabilities?.origin&&S.comparisonCapabilities?.region);
 const bad=cp.spawnSync(process.execPath,[__filename,'--invalid'],{cwd:path.resolve(__dirname,'../..'),encoding:'utf8',timeout:15000});T.ok('a separate actual startup rejects an unplayable region',bad.status===0);
 const dashboard=path.resolve(__dirname,'../sweep-dashboard.js'),script='require('+JSON.stringify(dashboard)+');console.log("NO_DRIVER_LOAD");',imported=cp.spawnSync(process.execPath,['-e',script],{encoding:'utf8',timeout:10000});
 T.ok('importing the seed-list module does not start a simulation',imported.status===0&&imported.stdout.trim()==='NO_DRIVER_LOAD'&&!imported.stderr.trim());T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
