#!/usr/bin/env node
// Perception probe — VILLAGER-BRAIN seam 4 / game-gaps item 2.
// One heard-filtered danger read (Game.objDangerBelief) feeds the door
// (objDanger), the rally (objRallyFreshRaid / AskCompanion), and the
// safety drive (vgoalGate 'safety' via dangerHeard).
//
// Cases (fresh loadGame each, seed 5151 + offset):
//   hearer:    raid gossip with this villager in heard → threat, door heat,
//              rally true, safety gate 1.
//   unhearing: same raid, heard list names someone else → no threat, no door
//              heat from the raid, rally false, safety stays baseline.
//   rally:     protect volunteer who heard guards a bold principal's 'go'
//              trip; an unhearing protect volunteer stays home.
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function stage(seedOff) {
  const { Game } = await loadGame({ seed: 5151 + seedOff });
  await Game.init();
  Game.genRoster('Breaker');
  const rid = Game.generatedRoster[0].id;
  Game.newGame('Breaker', null, rid);
  Game.depart();
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    try {
      const n = Game.npcNeeds(id);
      n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10;
    } catch (e) {}
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    try { const vp = Game.vpOf(id); if (vp) vp.hp = 100; } catch (e) {}
  }
  const day = (Game.state.scholar || {}).day || 0;
  return { Game, v, hx, hy, ids, day };
}

function setGoal(Game, vid, goal) {
  try {
    const dv = (Game.data.villagers || []).find(x => x.id === vid);
    if (dv) { dv.goal = goal; return; }
  } catch (e) {}
  try {
    const gr = (Game.generatedRoster || []).find(x => x.id === vid);
    if (gr) { gr.goal = goal; return; }
  } catch (e) {}
  Game.state.village.bgGoals = Game.state.village.bgGoals || {};
  Game.state.village.bgGoals[vid] = goal;
}

function setTemper(Game, vid, t) {
  const vp = (Game.data.villagers || []).find(x => x.id === vid)
    || (Game.data.background_survivors || []).find(x => x.id === vid)
    || (Game.generatedRoster || []).find(x => x.id === vid);
  if (!vp) return;
  vp.personality = vp.personality || {};
  vp.personality.temperament = t;
}

function setObjective(Game, vid, hx, hy) {
  const o = Game.objOf(vid);
  o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready';
  o.indoor = false; o.tx = hx + 1; o.ty = hy; o.tightness = 1;
  o.partsLeft = 3; o.targetVid = null; o.companion = null; o.solo = false;
  return o;
}

(async () => {
  // ---- belief + door + safety: hearer vs unhearing ----
  console.log('== belief / door / safety ==');
  {
    const { Game, v, hx, hy, ids, day } = await stage(0);
    check('objDangerBelief present', typeof Game.objDangerBelief === 'function');
    const hearer = ids[0];
    const other = ids[1] || ids[0];
    check('roster has a probe villager', !!hearer);

    // baseline: no gossip
    Game.state.weather = 'clear';
    setTemper(Game, hearer, 'steady');
    const baseBelief = Game.objDangerBelief(hearer);
    const baseDoor = Game.objDanger(hearer, hx + 1, hy, hx, hy);
    const baseSafe = Game.vgoalGate(hearer, 'safety');
    check('baseline belief score 0', baseBelief.score === 0 && !baseBelief.threat && !baseBelief.freshRaid,
      JSON.stringify(baseBelief));
    check('baseline safety 0.3', baseSafe === 0.3, 'gate=' + baseSafe);

    // raid heard only by `hearer`
    v.gossip = [{ action: 'raid', day: day, heard: [hearer], village: 'probe-raid' }];
    const heardBelief = Game.objDangerBelief(hearer);
    const heardDoor = Game.objDanger(hearer, hx + 1, hy, hx, hy);
    const heardSafe = Game.vgoalGate(hearer, 'safety');
    const heardRally = Game.objRallyFreshRaid(hearer);
    const heardVillage = Game.objVillageDanger(hearer);
    check('hearer: belief threat + freshRaid', !!(heardBelief.threat && heardBelief.freshRaid && heardBelief.score >= 2),
      JSON.stringify(heardBelief));
    check('hearer: door hotter by raid weight', heardDoor.score === baseDoor.score + 2,
      'base=' + baseDoor.score + ' heard=' + heardDoor.score);
    check('hearer: safety gate 1', heardSafe === 1, 'gate=' + heardSafe);
    check('hearer: rally fresh', heardRally === true);
    check('hearer: village danger includes raid', heardVillage >= 2, 'vd=' + heardVillage);

    if (other !== hearer) {
      const muteBelief = Game.objDangerBelief(other);
      setTemper(Game, other, 'steady');
      const muteBaseDoor = (() => {
        const saved = v.gossip;
        v.gossip = [];
        const d = Game.objDanger(other, hx + 1, hy, hx, hy);
        v.gossip = saved;
        return d;
      })();
      const muteDoor = Game.objDanger(other, hx + 1, hy, hx, hy);
      const muteSafe = Game.vgoalGate(other, 'safety');
      const muteRally = Game.objRallyFreshRaid(other);
      const muteVillage = Game.objVillageDanger(other);
      check('unhearing: belief ignores raid', muteBelief.score === 0 && !muteBelief.threat && !muteBelief.freshRaid,
        JSON.stringify(muteBelief));
      check('unhearing: door matches no-raid door', muteDoor.score === muteBaseDoor.score,
        'mute=' + muteDoor.score + ' base=' + muteBaseDoor.score);
      check('unhearing: safety stays 0.3', muteSafe === 0.3, 'gate=' + muteSafe);
      check('unhearing: rally false', muteRally === false);
      check('unhearing: village danger ignores raid', muteVillage === (Game.state.weather === 'rain' ? 1 : 0),
        'vd=' + muteVillage);

      // FAILING CONTROL: strip the heard filter. An unhearing villager must
      // then react to the same raid — if this contrast ever stops flipping,
      // the production filter is gone or no longer load-bearing.
      const realBelief = Game.objDangerBelief.bind(Game);
      Game.objDangerBelief = function (vid) {
        var score = 0, threat = false, freshRaid = false;
        var dayNow = 0;
        try { dayNow = this.state.scholar.day; } catch (e) {}
        try {
          var g = (this.state.village.gossip || []);
          for (var i = 0; i < g.length; i++) {
            var entry = g[i];
            if (dayNow - (entry.day || 0) > 3) continue;
            var a = entry.action;
            if (a === 'attack' || a === 'murder' || a === 'raid') {
              score += 2; threat = true;
              if (a === 'raid') freshRaid = true;
            } else if (a === 'death') {
              score += 1;
            }
          }
          if (score > 4) score = 4;
        } catch (e) {}
        return { score: score, threat: threat, freshRaid: freshRaid };
      };
      try {
        const bareBelief = Game.objDangerBelief(other);
        const bareDoor = Game.objDanger(other, hx + 1, hy, hx, hy);
        const bareSafe = Game.vgoalGate(other, 'safety');
        const bareRally = Game.objRallyFreshRaid(other);
        check('control (filter removed): unhearing belief sees raid',
          !!(bareBelief.threat && bareBelief.freshRaid && bareBelief.score >= 2),
          JSON.stringify(bareBelief));
        check('control (filter removed): unhearing door heats',
          bareDoor.score === muteBaseDoor.score + 2,
          'bare=' + bareDoor.score + ' base=' + muteBaseDoor.score);
        check('control (filter removed): unhearing safety 1', bareSafe === 1, 'gate=' + bareSafe);
        check('control (filter removed): unhearing rally true', bareRally === true);
      } finally {
        Game.objDangerBelief = realBelief;
      }
      // Restored filter still protects the unhearing villager.
      check('control restored: unhearing belief ignores raid again',
        Game.objDangerBelief(other).score === 0 && !Game.objDangerBelief(other).threat,
        JSON.stringify(Game.objDangerBelief(other)));
    }
  }

  // ---- rally act: hearing protect volunteers; unhearing stay home ----
  console.log('== rally act ==');
  {
    const { Game, v, hx, hy, ids, day } = await stage(1);
    let principal = null;
    for (const id of ids) {
      let t = 'steady';
      try { t = Game.npcTemper(id); } catch (e) {}
      if (t === 'bold' || t === 'restless') { principal = id; break; }
    }
    if (!principal) {
      principal = ids[0];
      setTemper(Game, principal, 'bold');
    }
    const volunteer = ids.find(id => id !== principal);
    check('rally: principal + volunteer', !!(principal && volunteer));
    setGoal(Game, volunteer, 'protect');
    setObjective(Game, volunteer, hx, hy); // score > 0 for AskCompanion
    // Only the volunteer heard — principal did not (go verdict stays go for bold).
    v.gossip = [{ action: 'raid', day: day, heard: [volunteer], village: 'probe-raid' }];
    Game.state.weather = 'clear';
    const o = setObjective(Game, principal, hx, hy);
    const dg = Game.objDanger(principal, o.tx, o.ty, hx, hy);
    check('rally: principal (unhearing, bold) still go', dg.verdict === 'go',
      'verdict=' + dg.verdict + ' score=' + dg.score);
    Game.objMaybeDepart(principal, Game.npcNode(principal), true, hx, hy);
    const awayP = (v.away || {})[principal];
    const cid = Game.objOf(principal).companion;
    check('rally: principal departs', !!awayP);
    check('rally: hearing protect volunteer guards', !!cid && cid === volunteer,
      'companion=' + cid);
    const awayV = cid ? (v.away || {})[cid] : null;
    check('rally: guard purpose', !!(awayV && awayV.purpose === 'guard'),
      JSON.stringify(awayV));
  }
  {
    const { Game, v, hx, hy, ids, day } = await stage(2);
    let principal = null;
    for (const id of ids) {
      let t = 'steady';
      try { t = Game.npcTemper(id); } catch (e) {}
      if (t === 'bold' || t === 'restless') { principal = id; break; }
    }
    if (!principal) {
      principal = ids[0];
      setTemper(Game, principal, 'bold');
    }
    const volunteer = ids.find(id => id !== principal);
    const stranger = ids.find(id => id !== principal && id !== volunteer) || principal;
    setGoal(Game, volunteer, 'protect');
    setObjective(Game, volunteer, hx, hy);
    // Raid heard only by a third party (or principal) — volunteer did not hear.
    v.gossip = [{ action: 'raid', day: day, heard: [stranger], village: 'probe-raid' }];
    Game.state.weather = 'clear';
    setObjective(Game, principal, hx, hy);
    Game.objMaybeDepart(principal, Game.npcNode(principal), true, hx, hy);
    const awayP = (v.away || {})[principal];
    const awayV = (v.away || {})[volunteer];
    const cid = Game.objOf(principal).companion;
    check('unhearing rally: principal still departs', !!awayP);
    check('unhearing rally: protect volunteer stays home', !awayV && !cid,
      'companion=' + cid + ' volunteerAway=' + JSON.stringify(awayV));
  }

  console.log(`\nraid-danger-heard: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('raid-danger-heard harness error', e); process.exit(1); });
