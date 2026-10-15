#!/usr/bin/env node
'use strict';
// Entry is through the real offered Table choice. Terminal outcomes below
// are explicit resolution fixtures, not evidence of combat win probability.
const K = require('./godpath/lib'), T = K.reporter('table-campaign-isolation');
(async () => {
  const G = await K.load({ seed: 7 });
  function prepare(nearbyId = 'herald') {
    K.newRun(G);
    const links = G.hierarchyState(); links.length = 0;
    for (const v of G.state.otherVillages) {
      G.genVillageRoster(v); v.opinion = 30;
      links.push({ primary: 'haven', subordinate: v.id, status: 'active', trust: 90, arrears: 0, theirSpeaker: { id: v.roster.find(r => r.age >= 18).id, name: 'Speaker' } });
    }
    G.state.titans = { omens: { finale: { stage: 2 } }, musters: {}, slain: { herald: true, nielsen: true }, campaigns: { finale: { started: true, crew: true, opening: true } }, cast: null };
    G.soundTitanCall('finale');
    const nearby = G.spawnWorldMonster(nearbyId, G.map.px, G.map.py, { mx: 5, my: 4, titan: true, veteran: true, beamPhase: 'grounded', gwGrounded: 3 });
    const table = G.tableState(); Object.assign(table, { path: 'feared', branch: 'light', phase: 'challenge', beat: 1, strength: 10, meters: { terror: 4, horror: 0 } });
    G.tableRunBeat();
    return { table, nearby, titans: JSON.stringify(G.state.titans), roster: JSON.stringify(G.state.otherVillages), crises: JSON.stringify(G.progState().crises) };
  }
  for (const result of ['won', 'fled', 'lost']) {
    const p = prepare(), s = G.state.scholar;
    T.ok(result + ': trial is genuinely offered', (s.tableChoices.options || []).some(c => c.id === 'beat:trial'));
    G.chooseTableOption('beat:trial');
    const f = G.tbfight;
    T.ok(result + ': real choice starts marked single-champion trial', !!f && f.tableTrial && f.fighters.filter(m => m.kind === 'monster').length === 1 && G.tableTrialFight());
    T.ok(result + ': actual titan arena is preserved without unrelated veteran status', f.gridSize === 12 && !f.fighters.find(m => m.kind === 'monster').veteran);
    T.ok(result + ': world monster remains on its real tile', G.worldMonsters().includes(p.nearby) && !f.worldOrigin);
    T.ok(result + ': campaign setup and musters are untouched on entry', JSON.stringify(G.state.titans) === p.titans && !f.fiCrewSpoils && !G.finaleCampaignButtons());
    T.ok(result + ': summoned champion creates no Haven breach', JSON.stringify(G.progState().crises) === p.crises);
    // Emulate an old saved trial containing leaked tools: no button or
    // action may turn that saved corruption into usable campaign rewards.
    f.fiCrewSpoils = { redpen: 1, script: 1, badnote: 1 };
    T.ok(result + ': legacy unearned spoil cannot be displayed or spent', !G.finaleCampaignButtons() && G.tbFiBadNote() === false && f.fiCrewSpoils.badnote === 1);
    // Exercise both result branches without pretending this rig won a fight.
    G.tbEnd(result);
    T.ok(result + ': world titan state survives resolution', JSON.stringify(G.state.titans) === p.titans);
    T.ok(result + ': foreign rosters and nearby monster survive resolution', JSON.stringify(G.state.otherVillages) === p.roster && G.worldMonsters().includes(p.nearby));
    T.ok(result + ': Table resumes once at next beat', !p.table.trialPending && p.table.beat === 2);
    T.ok(result + ': Table applies its own outcome', result === 'won' ? p.table.meters.terror === 10 : p.table.weakened === 1 && p.table.meters.terror === 1);
    if (result === 'lost') T.ok('lost: actual terminal loss passes the mantle', G.villagerId !== p.table.trialBearer);
    T.ok(result + ': temporary direct flag is cleared', G._tableTrialDirect === false && !G.tbfight);
  }
  // Compatibility for callers which used the original temporary flag.
  prepare(); G._tableTrialDirect = true; G.startCombat('finale');
  T.ok('legacy flag becomes explicit trial context and gives no crew tools', G.tbfight.tableTrial && !G.tbfight.fiCrewSpoils && G._tableTrialDirect === false);
  // A pending saved trial predates the explicit fight context property.
  delete G.tbfight.tableTrial; G.tableState().trialPending = true;
  const snapshot = JSON.stringify(G.state);
  T.ok('legacy pending Finale trial is recognized without mutating state', !!G.tableTrialFight && G.tableTrialFight() && snapshot === JSON.stringify(G.state));
  G.state.titans._fight = { titan: 'finale', campaign: 'finale_heart', day: 1 };
  const legacyMuster = JSON.stringify(G.state.titans.musters), legacyProgress = JSON.stringify(G.state.titans.campaigns);
  G.tbEnd('fled');
  T.ok('legacy leaked trial mark is retired without breaking the world army', !G.state.titans._fight && JSON.stringify(G.state.titans.musters) === legacyMuster && JSON.stringify(G.state.titans.campaigns) === legacyProgress && !G.state.titans.slain.finale);
  // Real campaign entry must still receive earned heart tools and its mark.
  const p = prepare('finale'); G.tableState().trialPending = false;
  const m = G.titanMusterState('finale');
  // Some regenerated worlds have fewer volunteers. This is a prepared
  // progressed campaign; the heart's survivor floor is ten, not twenty.
  T.ok('prepared progressed campaign has actual survivor floor', m.allies.length >= 10);
  G.startCombat('finale');
  T.ok('world campaign still has its real heart context and earned tools', G.tbfight && !G.tbfight.tableTrial && G.state.titans._fight.campaign === 'finale_heart' && G.tbfight.fiCrewSpoils.badnote === 1 && G.finaleCampaignButtons().includes('tbFiBadNote'));
  T.ok('world encounter still lifts its matching nearby origin and veteran status', !G.worldMonsters().includes(p.nearby) && G.tbfight.worldOrigin === p.nearby && G.tbfight.fighters.find(m => m.kind === 'monster').veteran);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
