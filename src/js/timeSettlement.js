// @ontology
// system: timeSettlement
// description: Commit saves only after complete time/sleep/dawn settlement or public combat input; preserve the last durable checkpoint after a thrown settlement.
// provides:
//   - init() (wrap: installs after all engine initialization)
//   - installTimeSettlement(game) (wrap: complete public actions, clocks, Sleep and barrier settlement)
//   - deferSettlementSave(state)
//   - captureTravelCheckpoint()
//   - commitTravelCheckpoint(before)
//   - runCombatInput(action)
// rules:
//   - whole_settlement: nested save requests sync runtime normally but do not write partial payloads; the outer successful public input/clock/Sleep call commits the complete result (code: installTimeSettlement)
//   - paid_input: complete doAction/cellInteract/examineCell inputs request a checkpoint when their own bearer's clock advances, including work shorter than a clock batch (code: installTimeSettlement)
//   - ability_input: complete legacy and composite activations commit their effect, costs, practice and cooldown together; nested activations defer and unchanged refusals request nothing (code: installTimeSettlement)
//   - earned_choice: consuming an enhancement, ability, knack or declined level-up offer commits the complete initialized choice; invalid or blocked picks create no checkpoint (code: installTimeSettlement)
//   - application_decision: accepted/refused applications commit their complete membership, reputation and journal consequences without adding a clock cost; missing applications create no checkpoint (code: installTimeSettlement)
//   - failed_settlement: an exception preserves the prior durable checkpoint and prevents later saves of that partial state until reload/new run (code: installTimeSettlement)
//   - honest_status: deferred work never reports durable success; ordinary quota/stale/tombstone results are retained (code: deferSettlementSave)
//   - travel_checkpoint: completed UI node crossings save after all payment; refusals, stale scene tokens and replacement actors create no checkpoint (code: commitTravelCheckpoint)
//   - combat_checkpoint: the complete synchronous input and its wrappers commit once; async announcements retain pendingTurnKey and resolved actors do not replay (code: runCombatInput/installTimeSettlement)
// consumes:
//   - Game.init()
//   - Game.syncRun()
//   - Game.tbBarrierExit(dx, dy)
//   - Game.tbAdvanceOneAsync(gen)
//   - state.save(state)
(function () {
  'use strict';
  const S=globalThis.Scattering,G=S.Game;
  G.captureTravelCheckpoint=function(){return{state:this.state,bearer:this.villagerId,key:this.state.runKey,x:this.map.px,y:this.map.py};};
  G.commitTravelCheckpoint=function(before){
    if(!before||this.over||this.state!==before.state||this.villagerId!==before.bearer||this.state.runKey!==before.key||(this.map.px===before.x&&this.map.py===before.y))return null;
    // UI callers finish the entire crossing (including a swim toll) first.
    // No new checkpoint for a refusal, stale animation or replacement bearer.
    try{return this.save();}catch(error){console.warn('[travel checkpoint] save failed',error);return false;}
  };
  let installed=false,active=null;
  const failed=new WeakSet();
  function settledCall(game,name,original,args,receipt){
    if(failed.has(game.state)){
      game.say('Time could not finish safely. Reload and Continue from your last saved checkpoint.');
      if(receipt){receipt.value=false;receipt.save='settlement_failed';return receipt;}
      return game.status();
    }
    const outer=!active,transaction=active||(active={state:game.state,requested:false,save:null});
    let complete=false;
    try{
      const result=original.apply(game,args);complete=true;return result;
    }catch(error){
      if(!failed.has(transaction.state)){
        failed.add(transaction.state);
        console.warn('[timeSettlement] '+name+' failed; keeping the last durable checkpoint',error);
      }
      throw error;
    }finally{
      if(outer){
        active=null;
        if(complete&&!failed.has(transaction.state)&&transaction.requested&&game.state===transaction.state&&!game.over){
          const ticks=game.state.scholar.dayTicks;
          if(!Number.isInteger(game.dayPart)||game.dayPart<0||game.dayPart>3||!Number.isFinite(ticks)||ticks<0||ticks>=game.TIME.TICKS_PER_DAY){
            failed.add(transaction.state);
            console.warn('[timeSettlement] incomplete clock; keeping the last durable checkpoint');
          }else{
            try{transaction.save=game.save();}catch(error){
              if(!receipt)throw error;
              transaction.save=false;console.warn('[combat checkpoint] save failed',error);
            }
          }
        }
      }
      if(receipt)receipt.save=failed.has(transaction.state)?'settlement_failed':outer?transaction.save:transaction.requested?'deferred':null;
    }
  }
  // UI callers pass the entire synchronous verb, including its outer wrappers.
  // Nested engine saves stay deferred until every cost/deed/hit has settled.
  G.runCombatInput=function(action){
    if(typeof action!=='function')throw new TypeError('Combat input requires an action');
    if(failed.has(this.state))return settledCall(this,'combat input',action,[],{value:false,save:'settlement_failed'});
    if(!this.tbfight||this.tbfight.over)return{value:action(),save:null};
    if(!installed)throw new Error('Combat input requires initialized settlement');
    const before={state:this.state,bearer:this.villagerId,key:this.state.runKey},receipt={value:null,save:null};
    settledCall(this,'combat input',function(){
      receipt.value=action();
      if(receipt.value&&typeof receipt.value.then==='function')throw new TypeError('Combat input must finish synchronously');
      if(receipt.value!==false&&!this.over&&this.state===before.state&&this.villagerId===before.bearer&&this.state.runKey===before.key)this.save();
      return receipt;
    },[],receipt);
    if(receipt.save!==null&&receipt.save!=='deferred'&&typeof window!=='undefined'){
      try{window.dispatchEvent(new CustomEvent('combat-checkpoint',{detail:{result:receipt.save}}));}
      catch(error){console.warn('[combat checkpoint] status presentation failed',error);}
    }
    return receipt;
  };
  function installTimeSettlement(game){
    if(installed)return;installed=true;
    const save=S.state.save;
    S.state.save=function deferSettlementSave(state){
      if(failed.has(state))return 'settlement_failed';
      if(active&&active.state===state){active.requested=true;return 'deferred';}
      return save.apply(this,arguments);
    };
    for(const name of ['doAction','cellInteract','examineCell','craft','tickAction','advancePart','endDay','sleep','tbBarrierExit','performForageFavor','donateToPantry']){
      const original=game[name];
      if(['doAction','cellInteract','examineCell','craft'].includes(name)){
        game[name]=function(...args){return settledCall(this,name,function(...input){
          const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey,day=body.day,ticks=body.dayTicks;
          const result=original.apply(this,input);
          // A short paid action may not cross a clock batch, so none of its
          // clock hooks requests a save. Cell interaction also adds its own
          // final tick after delegated forage. Save the complete public verb,
          // never just the inner harvest or a partial turn.
          if(this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over&&(body.day!==day||body.dayTicks!==ticks))this.save();
          return result;
        },args);};
      }else game[name]=function(...args){return settledCall(this,name,original,args);};
    }
    // Admission decisions are free on the clock, but are still consequential
    // public inputs. Enclose the initialized chain, including reputation and
    // journal tails. Preserve boolean returns used by autonomous recruitment.
    for(const name of ['acceptApplication','refuseApplication']){
      const original=game[name];
      game[name]=function(id,...args){
        const receipt={save:null};
        try{return settledCall(this,name,function(){
          const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey;
          const membership=this.mshipState(),application=membership.applications.find(a=>a.id===id);
          const result=original.call(this,id,...args);
          if(result&&typeof result.then==='function')throw new TypeError('Application decision must finish synchronously');
          if(result===true&&application&&!membership.applications.includes(application)&&this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over)this.save();
          return result;
        },[],receipt);}finally{
          if(receipt.save!==null&&receipt.save!=='deferred'&&typeof window!=='undefined'){
            try{window.dispatchEvent(new CustomEvent('decision-checkpoint',{detail:{result:receipt.save}}));}
            catch(error){console.warn('[application checkpoint] status presentation failed',error);}
          }
        }
      };
    }
    // Ability costs and practice can settle after their last tick (and some
    // useful powers cost food without time). Enclose the final initialized
    // wrappers, not just tickAction or the inner implementation. Both public
    // routes are needed: Garden calls useAbility directly; the bar calls
    // activateAbility, which may delegate to useAbility.
    for(const name of ['activateAbility','useAbility']){
      const original=game[name];
      game[name]=function(...args){return settledCall(this,name,function(...input){
        const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey;
        const before=[body.day,body.dayTicks,body.kcal,body.health];
        const result=original.apply(this,input);
        if(result&&typeof result.then==='function')throw new TypeError('Ability input must finish synchronously');
        if(this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over){
          const paid=[body.day,body.dayTicks,body.kcal,body.health].some((value,i)=>value!==before[i]);
          if(result!==false||paid)this.save();
        }
        return result;
      },args);};
    }
    // A fetch hand-in has no clock cost. Commit the entire public verb,
    // including consumed goods, completion ledger and the actual reward.
    // Short/missing hand-ins preserve their existing checkpoint.
    const handIn=game.handInAidQuest;
    game.handInAidQuest=function(...args){return settledCall(this,'aid hand-in',function(...input){
      const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey,quest=state.activeAidQuest;
      const result=handIn.apply(this,input);
      if(result&&typeof result.then==='function')throw new TypeError('Aid hand-in must finish synchronously');
      if(quest&&state.activeAidQuest!==quest&&this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over)this.save();
      return result;
    },args);};
    // Free earned choices also change the run. Their null return does not
    // distinguish a valid pick from refusal; observe consumption of the
    // actual offer, including a replacement sheet opened by pumpLevelUps.
    for(const [name,field]of [['chooseRelicEnhancement','relicChoices'],['chooseAbility','abilityChoices'],['chooseKnack','knackChoices'],['keepAbilities','abilityChoices'],['chooseEvolution','evolutionChoices']]){
      const original=game[name];
      game[name]=function(...args){return settledCall(this,name,function(...input){
        const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey,offer=body[field],deferred=body.evolutionDeferred;
        const result=original.apply(this,input);
        if(result&&typeof result.then==='function')throw new TypeError('Earned choice must finish synchronously');
        const consumed=offer&&((body[field]!==offer&&(name!=='chooseKnack'||body[field]===null))||(name==='chooseEvolution'&&deferred!==body.evolutionDeferred));
        if(consumed&&this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over)this.save();
        return result;
      },args);};
    }
    // Walk home is a complete public movement input. Its node steps are
    // free on the player clock, but arrivals pool food/stage carcasses and
    // run party/favor hooks. Save after the final message and all wrappers;
    // individual travelTo remains under its existing caller checkpoint.
    const walkHome=game.walkHome;
    game.walkHome=function(...args){
      const receipt={save:null};
      const result=settledCall(this,'walk home',function(...input){
        const before=this.captureTravelCheckpoint();
        const result=walkHome.apply(this,input);
        if(result&&typeof result.then==='function')throw new TypeError('Walk home must finish synchronously');
        this.commitTravelCheckpoint(before);
        return result;
      },args,receipt);
      return result&&typeof result==='object'?{...result,travelSave:receipt.save}:result;
    };
    // A paid opening must include the complete initialized conversation,
    // not only the tiny clock debit before its questions are constructed.
    const beginConversation=game.startConvo;
    game.startConvo=function(...args){
      const receipt={save:null};
      const result=settledCall(this,'conversation opening',function(...input){
        const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey;
        const before=[body.day,body.dayTicks,body.kcal,body.health];
        const result=beginConversation.apply(this,input);
        if(result&&typeof result.then==='function')throw new TypeError('Conversation opening must finish synchronously');
        const paid=[body.day,body.dayTicks,body.kcal,body.health].some((value,i)=>value!==before[i]);
        if((paid||(result?.ended===false&&!result.refused))&&this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over)this.save();
        return result;
      },args,receipt);
      return result&&typeof result==='object'?{...result,conversationSave:receipt.save}:result;
    };
    // Finish request replies, physical favor verbs and actual chat closures
    // after every wrapper/codex/deed callback. endConvo itself remains usable
    // by load's walk-away normalization without saving a partial restoration.
    const turn=game.convoTurn;
    game.convoTurn=function(vid,choice,...rest){
      const favor=this.state.village.favorLedger?.[vid];
      const physicalFavor=favor&&['water_haul','forage_help','stay_close'].includes(favor.kind)&&['dlg:commit','dlg:favor_action','dlg:favor_cancel','dlg:forage_unload_end','dlg:forage_talk'].includes(choice);
      const requestInput=String(choice).startsWith('request:')||(['leave','silence'].includes(choice)&&this.activeTalkRequest?.(vid));
      const prior=this.state.village.promises?.[vid],conversation=this.state.village.conv?.[vid],wasActive=!!conversation?.active;
      const receipt={save:null};
      const result=settledCall(this,'conversation reply',function(){
        const state=this.state,body=state.scholar,bearer=this.villagerId,key=state.runKey;
        const result=turn.call(this,vid,choice,...rest);
        if(result&&typeof result.then==='function')throw new TypeError('Conversation reply must finish synchronously');
        const ended=wasActive&&this.state.village.conv?.[vid]===conversation&&!conversation.active;
        const committed=physicalFavor&&choice==='dlg:commit'&&this.state.village.promises?.[vid]!==prior;
        if((result?.requestDecision||ended||committed)&&this.state===state&&state.scholar===body&&this.villagerId===bearer&&state.runKey===key&&!this.over)this.save();
        return result;
      },[],receipt);
      return result&&typeof result==='object'?{...result,
        ...(requestInput?{requestSave:receipt.save}:{}),...(physicalFavor?{favorSave:receipt.save}:{}),
        ...(receipt.save!==null?{conversationSave:receipt.save}:{})}:result;
    };
    // Announced actors and player arrival are distinct durable phases. Keep
    // pendingTurnKey intact so Continue never skips an announced attack.
    const advance=game.tbAdvanceOneAsync;
    game.tbAdvanceOneAsync=function(...args){return this.runCombatInput(()=>advance.apply(this,args)).value;};
  }
  // Deferred module installers (notably Journal) finish before init's data
  // fetches settle. Wrap the final engine chain, including all dawn hooks.
  const init=G.init;
  G.init=async function(...args){const result=await init.apply(this,args);installTimeSettlement(this);return result;};
})();
