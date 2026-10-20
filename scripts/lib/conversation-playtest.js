'use strict';
// Real public-menu navigation for prepared dialogue regressions. No state
// clearing, outcome grants or direct calls to unoffered content handlers.
function offers(G,vid){
 let page=G.convoChoices(vid)||[],out=page.slice(),count=G.convoGet(vid).menuPages||1;
 for(let n=1;n<count;n++){page=G.convoNextMenu(vid).choices||[];for(const ch of page)if(!out.some(x=>x.id===ch.id))out.push(ch);}
 return out;
}
function choose(G,vid,id){
 const count=G.convoGet(vid).menuPages||1;
 for(let n=0;n<=count;n++){const list=G.convoChoices(vid)||[];if(list.some(x=>x.id===id))return G.convoTurn(vid,id);if(n<count)G.convoNextMenu(vid);}
 throw Error('Never offered '+id);
}
function reach(G,vid,ids,limit=20){
 for(let n=0;n<limit&&G.convoGet(vid).active;n++){
  const list=offers(G,vid),wanted=list.find(x=>ids.includes(x.id));if(wanted)return wanted;
  const question=list.find(x=>/^(ans:|gq:|react:)/.test(x.id));
  const step=question||list.find(x=>x.id==='dlg:cant')||list.find(x=>x.id==='goon')||list.find(x=>['dlg:subject','subject'].includes(x.id));
  if(!step)return null;choose(G,vid,step.id);
 }
 return null;
}
function openInvite(G,vid){
 const opening=G.startConvo(vid);
 if(!G.pendingInvite(vid))return opening;
 if(!reach(G,vid,['betrayal:accept','betrayal:decline']))throw Error('Pending invitation never became reachable');
 const c=G.convoGet(vid);
 return {...opening,choices:offers(G,vid),transcript:c.transcript.slice()};
}
module.exports={offers,choose,reach,openInvite};
