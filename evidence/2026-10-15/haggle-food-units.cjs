// Prepared economic scenarios, not natural acquisition or campaign survival.
// node evidence/2026-10-15/haggle-food-units.cjs <root> > <output.json>
const path=require('path'),fs=require('fs'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||'.'),K=require(path.join(root,'scripts/godpath/lib'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  const G=await K.load({seed:7}),rows=[];
  for(const kcalEach of [100,500])for(const preserved of [false,true])for(const haggle of [false,true]){
    K.newRun(G);G.tbfight=null;G.over=false;
    const s=G.state.scholar,v=G.state.village;
    s.day=85;s.dayTicks=80;s.kcal=2400;s.abilities=[];G.state.systemArrived=true;
    if(haggle)K.giveAbility(G,'haggle');
    s.inventory=[{itemId:'unit_probe_food',name:preserved?'Smoked beans':'Cooked beans',foodKind:'plant',foodState:preserved?'preserved':'cooked',prep:preserved?'smoked':'cooked',edible:true,units:10,kcalEach,kg:.1,spoilDay:200}];
    const vis={id:'units_trader',name:'Nora',type:'trader',entrepreneurial:true,trading:true,credit:0,wares:[{kind:'tool',itemId:'stone_knife',name:'Stone knife',price:800,blurb:'A working blade.'}]};v.visitors=[vis];
    const quote=G.goodsTradePrice?G.goodsTradePrice(800):800;
    const bought=!!G.visitorBuyWare(vis.id,0),left=s.inventory.find(i=>i.itemId==='unit_probe_food')?.units||0;
    rows.push({kcalEach,preserved,haggle,basePrice:800,quote,bought,unitsSpent:10-left,physicalKcalSpent:(10-left)*kcalEach,toolDelivered:s.inventory.some(i=>i.itemId==='stone_knife')});
  }
  const sources=Object.fromEntries(['src/js/betrayal.js','src/js/conversation.js','src/data/abilities.json','scripts/godpath/lib.js','scripts/sim-harness.js'].map(n=>[n,sha(fs.readFileSync(path.join(root,n),'utf8').replace(/\r\n/g,'\n'))]));
  console.log(JSON.stringify({prepared:true,seed:7,node:process.version,root,sources,probeSha256:sha(fs.readFileSync(__filename)),rows},null,2));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
