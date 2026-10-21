// @ontology
// system: timeSettlement
// description: Commit saves only after complete time/sleep/dawn settlement; preserve the last durable checkpoint after a thrown settlement.
// provides:
//   - init() (wrap: installs after all engine initialization)
//   - installTimeSettlement(game)
//   - deferSettlementSave(state)
// rules:
//   - whole_settlement: nested save requests sync runtime normally but do not write partial payloads; the outer successful tickAction/advancePart/endDay/sleep call commits the complete result (code: installTimeSettlement)
//   - failed_settlement: an exception preserves the prior durable checkpoint and prevents later saves of that partial state until reload/new run (code: installTimeSettlement)
//   - honest_status: deferred work never reports durable success; ordinary quota/stale/tombstone results are retained (code: deferSettlementSave)
// consumes:
//   - Game.init()
//   - Game.syncRun()
//   - state.save(state)
(function () {
  'use strict';
  const S=globalThis.Scattering,G=S.Game;
  let installed=false,active=null;
  const failed=new WeakSet();
  function installTimeSettlement(game){
    if(installed)return;installed=true;
    const save=S.state.save;
    S.state.save=function deferSettlementSave(state){
      if(failed.has(state))return 'settlement_failed';
      if(active&&active.state===state){active.requested=true;return 'deferred';}
      return save.apply(this,arguments);
    };
    for(const name of ['tickAction','advancePart','endDay','sleep']){
      const original=game[name];
      game[name]=function(...args){
        if(failed.has(this.state)){
          this.say('Time could not finish safely. Reload and Continue from your last saved checkpoint.');
          return this.status();
        }
        const outer=!active,transaction=active||(active={state:this.state,requested:false});
        let complete=false;
        try{
          const result=original.apply(this,args);complete=true;return result;
        }catch(error){
          if(!failed.has(transaction.state)){
            failed.add(transaction.state);
            console.warn('[timeSettlement] '+name+' failed; keeping the last durable checkpoint',error);
          }
          throw error;
        }finally{
          if(outer){
            active=null;
            if(complete&&!failed.has(transaction.state)&&transaction.requested&&this.state===transaction.state&&!this.over){
              const ticks=this.state.scholar.dayTicks;
              if(!Number.isInteger(this.dayPart)||this.dayPart<0||this.dayPart>3||!Number.isFinite(ticks)||ticks<0||ticks>=this.TIME.TICKS_PER_DAY){
                failed.add(transaction.state);
                console.warn('[timeSettlement] incomplete clock; keeping the last durable checkpoint');
              }else this.save();
            }
          }
        }
      };
    }
  }
  // Deferred module installers (notably Journal) finish before init's data
  // fetches settle. Wrap the final engine chain, including all dawn hooks.
  const init=G.init;
  G.init=async function(...args){const result=await init.apply(this,args);installTimeSettlement(this);return result;};
})();
