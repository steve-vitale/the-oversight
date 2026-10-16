'use strict';
// Separate declared strategy: keep actual processed counter food for a known
// army plan when the same ordinary village reserve permits retention. The
// published preparer and every default remain unchanged in behavior.
const P=require('./campaign-preparer'),R=require('./campaign-rations'),base=require('./campaigner')['campaigner-rations'];
function prepareForArmy(G,ctx){P.preparePack(G,ctx,{retainKcal:R.reserve(G,ctx,0)});}
const quartermaster={...base,id:'campaigner-quartermaster',desc:'campaigner-preparer with native whole-batch pickup toward the current known army ration, subject to the ordinary village reserve'};
for(const hook of ['daily','upkeep'])quartermaster[hook]=(G,ctx)=>{prepareForArmy(G,ctx);return base[hook]?.(G,ctx);};
module.exports={quartermaster,prepareForArmy};
