// @ontology
// system: gardenCultivation
// description: Haven-sized beds, crop profiles, saved crop cycles and food-powered cultivation shared by player and NPC gardeners.
// provides:
//   - gardenCapacity()
//   - gardenCapacityHint()
//   - gardenProfile(pid, form)
//   - gardenCropProfile(plot)
//   - gardenPlant(plot, pid, day)
//   - gardenGrowthLeft(plot, day)
//   - gardenHarvestUnits(plot)
//   - gardenHarvestTaken(plot, day)
//   - gardenWorkGate()
//   - gardenSlot(index)
//   - gardenMakeGate()
//   - gardenMaintain(vid)
//   - reclaimGarden(vid)
//   - gardenMagicPlan(vid)
//   - gardenMagicGate(vid)
//   - cultivateGarden(vid)
//   - gardenKeeperReady(vid)
//   - setGardenKeeper(vid)
//   - gardenKeeperTurn()
// rules:
//   - owned_magic: cultivation uses the actual player's or resident's own held abilities and food; per-bed daily limits survive replanting (code: gardenMagicPlan, gardenMagicGate, cultivateGarden)
//   - saved_cycles: planted legacy crops retain their timing; new crop profiles and growth magic persist on the actual Haven plots (code: gardenCropProfile, gardenPlant, gardenHarvestTaken)
// consumes:
//   - state.village
//   - state.scholar
//   - gardenPlots()
//   - useAbility(abilityId, actionId, target)
(function () {
  'use strict';
  const G = globalThis.Scattering.Game;
  const day = () => G.state.scholar.day || 0;
  const rules = () => G.data.gardening;
  let paidPlayerDispatch = false;
  const methods = {
    gardenCapacity() {
      return rules().capacityByTier[Math.max(0, Math.min(3, this.havenTier()))];
    },
    gardenCapacityHint() {
      const cap = this.gardenCapacity(), tier = this.havenTier();
      return tier < 3 ? `${cap} beds available; the next Haven upgrade unlocks ${rules().capacityByTier[tier + 1]}.`
        : `${cap} beds available at the granary. Existing beds are kept if Haven changes.`;
    },
    gardenProfile(pid, form) {
      const plant = this.data.plants.find(p => p.id === pid);
      const woody = plant?.form !== 'roots' && (plant?.taxon || []).some(t => ['tree','shrub','vine','palm'].includes(t));
      return rules().plants[pid] || rules().profiles[woody ? 'woody' : (plant?.form || form)] || rules().profiles.shoots;
    },
    gardenCropProfile(plot) {
      if (plot.cultivation?.version === 1) return plot.cultivation;
      // Preserve planted old-save crops and their earned maturity. New sowing
      // always adopts an authored profile; no save is silently replanted.
      const plant = this.data.plants.find(p => p.id === plot.pid);
      return { legacy:true, maturityDays:({shoots:7,berries:12,roots:14}[plant?.form] || 10), regrowDays:3, singleHarvest:false };
    },
    gardenPlant(plot, pid, plantedDay) {
      Object.assign(plot, { pid, plantedDay, lastTend:plantedDay, lastHarvest:0, weeds:0, dead:false,
        cultivation:{version:1,...this.gardenProfile(pid)}, magicGrowth:0, magicYield:1 });
      // magicDay deliberately survives harvest/replant/reclamation: one bed
      // cannot take multiple casts today by changing its crop or caretaker.
    },
    gardenGrowthLeft(plot, atDay = day()) {
      if (!plot?.pid || plot.dead) return Infinity;
      const profile = this.gardenCropProfile(plot);
      const anchor = plot.lastHarvest || plot.plantedDay || 0;
      const needed = plot.lastHarvest ? profile.regrowDays : profile.maturityDays;
      return Math.max(0, needed - (atDay - anchor) - (plot.magicGrowth || 0));
    },
    gardenHarvestUnits(plot) {
      if (!plot?.pid || plot.dead) return 0;
      const plant = this.data.plants.find(p => p.id === plot.pid), profile = this.gardenCropProfile(plot);
      const level = Math.max(1, this.state.codex?.plants?.[plot.pid]?.level || 1);
      const base = profile.legacy ? (plant?.caloriesPerUnit > 0 ? 5000 / plant.caloriesPerUnit : this.gardenProfile(plot.pid).units) : profile.units;
      return Math.max(0, Math.round(base * (1 + .25 * (level - 1)) * ((plot.weeds || 0) >= 3 ? .5 : 1) * (plot.magicYield || 1)));
    },
    gardenHarvestTaken(plot, harvestedDay) {
      const profile = this.gardenCropProfile(plot);
      plot.lastHarvest = harvestedDay;
      plot.magicGrowth = 0; plot.magicYield = 1;
      if (profile.singleHarvest) { plot.pid = null; plot.cultivation = null; }
    },
    gardenWorkGate() {
      if (this.over) return {ok:false, short:'run ended', reason:'This expedition has ended.'};
      if (this.inCombat()) return {ok:false, short:'in combat', reason:'Finish the fight before working the garden.'};
      if (this.playerTile()?.type !== 'haven' || this.map.px !== 4 || this.map.py !== 4)
        return {ok:false, short:'at Haven', reason:'The garden is on the Haven grounds.'};
      if (this.state.scholar.insideHaven) return {ok:false, short:'step outside', reason:'Step outside the hall to work the garden.'};
      return {ok:true};
    },
    gardenSlot(index) {
      return index < 6 ? {x:3 + index % 3,y:1 + Math.floor(index / 3)} : {x:3 + index - 6,y:0};
    },
    gardenMakeGate() {
      if (this.gardenPlots().length >= this.gardenCapacity()) return {ok:false,short:'Haven capacity',reason:this.gardenCapacityHint()};
      const {x,y} = this.gardenSlot(this.gardenPlots().length), t = this.playerTile();
      const cells = t.groundsDetail || this.genDetail(4,4);
      if (this.cellProps(cells[y][x]).blocks || cells[y][x] === 'fire' || t.secrets?.[x+','+y]?.yours || t.traps?.some(p => p.mx === x && p.my === y))
        return {ok:false,short:'ground occupied',reason:`Bed ${this.gardenPlots().length + 1} is occupied. Move its structure or trap before breaking ground.`};
      if (this.state.scholar.kcal < 120) return {ok:false,short:'120 kcal',reason:'Breaking ground needs 120 kcal.'};
      return {ok:true};
    },
    gardenMaintain(vid) {
      if(vid!=null&&vid!==this.villagerId&&(!(this.state.village.roster||[]).includes(vid)||!this.getPerson(vid)||this.getPerson(vid).dead))return 0;
      const live = this.gardenPlots().filter(p => p.pid && !p.dead);
      const changed = live.filter(p => p.lastTend !== day() || p.weeds > 0).length;
      for (const plot of live) { plot.lastTend = day(); plot.weeds = 0; }
      return changed;
    },
    gardenKeeperReady(vid) {
      const v=this.state.village,person=this.getPerson(vid);
      if(vid===this.villagerId||!(v.roster||[]).includes(vid)||!person||person.dead)return false;
      if(this.waterFavorCompanions?.().includes(vid))return false;
      if(this.companyFavorHolding?.(vid))return false;
      const node=this.npcNode(vid);
      return node?.nx===4&&node?.ny===4&&(v.health?.[vid]??100)>=40&&!this.isSheltered?.(vid);
    },
    setGardenKeeper(vid) {
      if(this.over||this.inCombat()||this.playerTile()?.type!=='haven')return false;
      if(vid!=null&&!this.gardenKeeperReady(vid)){this.say('Choose a living resident who can work at Haven.');return false;}
      this.state.village.gardenKeeper=vid;
      this.say(vid?`${this.displayName(vid)} will work the garden once each day while at Haven. Other orders take priority.`:'The garden has no standing caretaker.');
      this.tickAction(16);this.save();return true;
    },
    gardenKeeperTurn() {
      const v=this.state.village,vid=v.gardenKeeper;
      if(this.over||this.inCombat())return;
      if(!vid||v.gardenKeeperDay===day()||!this.gardenKeeperReady(vid))return;
      if(Object.entries(v.taskLeads||{}).some(([task,id])=>id===vid&&task!=='garden'))return;
      if(v.assignments?.[vid]&&v.assignments[vid].task!=='garden')return;
      if(!this.gardenPlots().length)return;
      v.gardenKeeperDay=day();
      // One real assignment, not a second free harvest. Explicit garden
      // orders are consumed here so the normal resolver cannot double work.
      if(v.assignments?.[vid]?.task==='garden')delete v.assignments[vid];
      this.resolveOneAssignment(vid,{task:'garden'});
    },
    reclaimGarden(vid) {
      const npc = vid != null && vid !== this.villagerId;
      if (!npc) { const gate=this.gardenWorkGate(); if(!gate.ok){this.say(gate.reason);return false;} }
      const plot = this.gardenPlots().find(p => p.dead);
      if (!plot) { if(!npc)this.say('No dead bed needs clearing.'); return false; }
      if (!npc && this.state.scholar.kcal < 40) { this.say('Clearing a dead bed needs 40 kcal.'); return false; }
      if (npc && (!(this.state.village.roster || []).includes(vid) || !this.getPerson(vid) || this.getPerson(vid).dead)) return false;
      Object.assign(plot,{pid:null,dead:false,weeds:0,plantedDay:0,lastHarvest:0,lastTend:day(),cultivation:null,magicGrowth:0,magicYield:1});
      if (npc) {
        const needs=this.npcNeeds(vid);if(needs)needs.hunger=Math.min(100,(needs.hunger||0)+40/25);
        this.say(`${this.displayName(vid)} clears a dead bed. The soil is ready for new seed.`);
      } else {
        this.state.scholar.kcal -= 40;
        this.say('You clear a dead bed. Sow fresh seed to start a new crop. (40 kcal.)');
        this.tickAction(32); this.save();
      }
      return true;
    },
    gardenMagicPlan(vid = this.villagerId) {
      const abilities = vid === this.villagerId ? this.state.scholar.abilities || [] : this.state.village.npcAbilities?.[vid] || [];
      const level = id => Math.max(0,...abilities.filter(a=>a.id===id).map(a=>Math.min(3,a.level||1)));
      const thumb=level('green_thumb'),whisper=level('green_whisper'),corn=level('cornucopia'),magic=rules().magic;
      if (!thumb && !whisper) return null;
      const source=thumb >= whisper ? 'green_thumb' : 'green_whisper';
      const cost=this.abilityActionDef(source,'cultivate')?.action?.cost?.kcal;
      if(!Number.isFinite(cost)||cost<=0)return null;
      return {source,costKcal:cost,growth:magic.growthByLevel[Math.max(thumb,whisper)] + (thumb && whisper ? magic.whisperSynergyByLevel[whisper] : 0),
        yield:magic.thumbYieldByLevel[thumb] * magic.cornucopiaYieldByLevel[corn]};
    },
    gardenMagicGate(vid = this.villagerId) {
      if (vid === this.villagerId) { const gate=this.gardenWorkGate(); if(!gate.ok)return{ok:false,why:gate.reason}; }
      else if (!(this.state.village.roster || []).includes(vid) || !this.getPerson(vid) || this.getPerson(vid).dead)
        return {ok:false,why:'Only a living resident can tend these beds.'};
      const plan=this.gardenMagicPlan(vid);
      if (!plan) return {ok:false,why:'Cultivation magic needs your own Green Thumb or Green Whisper.'};
      if (!this.gardenPlots().some(p=>p.pid&&!p.dead&&p.magicDay!==day()&&!this.plotRipe(p,day())))
        return {ok:false,why:'No growing bed can take more magic today. Harvest ripe crops or return tomorrow.'};
      if (vid === this.villagerId) {
        const gate=this.foodPowerGate(); if(!gate.ok)return gate;
        if(this.state.scholar.kcal<plan.costKcal)return{ok:false,why:`Cultivation needs ${plan.costKcal} kcal.`};
      } else {
        const needs=this.npcNeeds(vid);
        if(!needs || (needs.hunger||0)+plan.costKcal/25>=rules().magic.npcHungerLimit)return{ok:false,why:'Too hungry to burn food on garden magic.'};
      }
      return {ok:true};
    },
    cultivateGarden(vid = this.villagerId) {
      if(vid===this.villagerId&&!paidPlayerDispatch){
        const plan=this.gardenMagicPlan();
        if(!plan){this.say('Cultivation magic needs Green Thumb or Green Whisper.');return false;}
        return this.useAbility(plan.source,'cultivate');
      }
      const gate=vid===this.villagerId?this.gardenWorkGate():this.gardenMagicGate(vid);
      if(!gate.ok){if(vid===this.villagerId)this.say(gate.reason||gate.why);return false;}
      const plan=this.gardenMagicPlan(vid),npc=vid!==this.villagerId;
      // Player cost is paid by useAbility before dispatch. NPCs use their own
      // belly, at the same kcal-to-hunger conversion as other NPC spell casts.
      if(npc)this.npcNeeds(vid).hunger=Math.min(100,(this.npcNeeds(vid).hunger||0)+plan.costKcal/25);
      let n=0;
      for(const plot of this.gardenPlots()){
        if(!plot.pid||plot.dead||plot.magicDay===day()||this.plotRipe(plot,day()))continue;
        plot.magicGrowth=(plot.magicGrowth||0)+plan.growth;plot.magicYield=Math.max(plot.magicYield||1,plan.yield);
        plot.magicDay=day();plot.magicOwner=vid;plot.lastTend=day();plot.weeds=0;n++;
      }
      if(npc){
        const held=this.state.village.npcAbilities[vid].find(a=>a.id===plan.source);
        if(this.advanceAbilityPractice(held,2))this.say(`${this.displayName(vid)}'s ${plan.source.replace(/_/g,' ')} deepens to level ${held.level}.`);
        if(this.map.px===4&&this.map.py===4&&!this.state.scholar.insideHaven)this.noteVillagerAbilityUse(vid,plan.source);
      }
      this.say(`${npc?this.displayName(vid):'You'} coax ${n} growing bed${n===1?'':'s'} forward by ${plan.growth} days. The next harvest carries the growth magic.`);
      if(!npc){this.tickAction(16);this.save();}
      return true;
    }
  };
  Object.assign(G,methods);
  for(const source of ['green_thumb','green_whisper']){
    globalThis.AbilityActionPrechecks[source+'.cultivate']=game=>game.gardenMagicGate();
    globalThis.AbilityActionImpls[source+'.cultivate']=game=>{
      paidPlayerDispatch=true;
      try{return game.cultivateGarden();}finally{paidPlayerDispatch=false;}
    };
  }
  const useAbility=G.useAbility;
  G.useAbility=function(ability,action,target){
    const result=useAbility.call(this,ability,action,target);
    if(action==='cultivate'&&['green_thumb','green_whisper'].includes(ability)&&result!==false)this.save();
    return result;
  };
})();
