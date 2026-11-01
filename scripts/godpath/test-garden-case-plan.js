'use strict';
const K=require('./lib'),A=require('../garden-longplay-audit'),T=K.reporter('Selected garden case plans');
(async()=>{
const registry={a:{},b:{}},input=[{policy:'a',seed:6,days:3000},{policy:'b',seed:9,days:3000}],before=JSON.stringify(input),jobs=A.caseJobs(input,registry);
T.ok('each selected campaign gets its own exact off/on control',jobs.length===4&&input.every(c=>[0,1].every(observe=>jobs.some(j=>j.policy===c.policy&&j.seed===c.seed&&j.days===c.days&&j.observe===observe))));
T.ok('input plans are preserved',JSON.stringify(input)===before);
for(const [name,cases]of [['empty',[]],['unknown policy',[{policy:'missing',seed:1,days:3000}]],['duplicate',[input[0],input[0]]],['fractional seed',[{policy:'a',seed:.5,days:3000}]],['missing cap',[{policy:'a',seed:1}]],['zero cap',[{policy:'a',seed:1,days:0}]],['unsupported hidden grant',[{policy:'a',seed:1,days:3000,grant:'green_thumb'}]]]){
 let rejected=false;try{A.caseJobs(cases,registry);}catch(e){rejected=!!e.message;}T.ok(name+' cannot silently change coverage',rejected);
}
T.ok('default cohort keeps existing comparison options',JSON.stringify(A.cohortOptions())===JSON.stringify({origin:'Columbus, Ohio'}));
T.ok('named region and origin reach comparison options together',JSON.stringify(A.cohortOptions('Dakar, Senegal','africa_sahel_savanna'))===JSON.stringify({origin:'Dakar, Senegal',region:'africa_sahel_savanna'}));
for(const [name,origin,region]of [['blank origin',' ',null],['invalid region syntax','Dakar','bad region'],['non-string region','Dakar',{}]]){let rejected=false;try{A.cohortOptions(origin,region);}catch(e){rejected=!!e.message;}T.ok(name+' is rejected',rejected);}
const args=[require('path').resolve(__dirname,'../garden-longplay-audit.js'),'--child','--root',K.ROOT,'--policy','garden-diplomacy-water-safe','--seed','1','--days','1','--observe','0','--origin','Dakar, Senegal','--region','africa_sahel_savanna'];
const actual=await A.readChild(args,K.ROOT);T.ok('a real shared-harness child starts in the requested Sahel cohort',actual.cohort.origin==='Dakar, Senegal'&&actual.cohort.region==='africa_sahel_savanna'&&!actual.warnings.length);
const job={policy:'garden-diplomacy-water-safe',seed:1,days:1,observe:0},sources=require('../balance-panel').manifest(K.ROOT),result={job,...actual};
T.ok('the actual cohort is validated with the cached payload identity',A.validateResult(result,job,sources,A.cohortOptions('Dakar, Senegal','africa_sahel_savanna')));
let wrongCohort=false;try{A.validateResult(result,job,sources,A.cohortOptions('Columbus, Ohio'));}catch(e){wrongCohort=!!e.message;}T.ok('the same policy/seed/cap from another cohort cannot pass cache validation',wrongCohort);
let rejected=false;try{await A.readChild([...args.slice(0,-1),'not_a_real_region'],K.ROOT);}catch(e){rejected=!!e.message;}T.ok('an unknown region cannot silently become Ohio',rejected);
T.done();})().catch(e=>{console.error(e.stack);process.exitCode=1;});
