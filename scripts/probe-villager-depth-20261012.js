#!/usr/bin/env node
// probe-villager-depth-20261012.js — DEEP behavioral playtest of villagers.
// Steve 2026-10-12: "How often do villagers trickle in from other villages?
// Are they being properly strategic in combat as well as fight selecting?
// Look deeper than just a couple shallow levers and playtest all."
//
// A. IMMIGRATION: applications generated/accepted, arrivals (profiled),
//    visitor invites, births; newcomer integration (trust, survival).
//    NOTE: acceptApplication is UI-only in prod — the harness auto-accepts
//    via the real acceptApplication() so we measure the full pipeline.
// B. VILLAGER COMBAT: every fieldFight rec (outcome/rounds/vTaken/mDealt/
//    everWinning/everHopeless/calledHelp/fleeHpFrac/minHpFrac) + vid profile
//    (temperament, bravery, abilities) + death linkage + transcripts.
//
// Usage: SEEDS="11,22,33,44" DAYS=150 OUT=/tmp/vdepth.json node scripts/probe-villager-depth-20261012.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const policyMod = require('./policies/competent');
const basePolicy = policyMod.competent || policyMod;

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const OUT = process.env.OUT || '/tmp/vdepth.json';

function monWave(Game, mid) {
  try { const md = (Game.data.monsters || []).find(m => m.id === mid); return md ? (md.wave || 1) : 1; }
  catch (e) { return 1; }
}
function vName(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return String(rc.name).split(' ')[0];
    const bg = (Game.data.background_survivors || []).find(b => b.id === vid);
    if (bg && bg.name) return String(bg.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 18);
}

(async () => {
  const runs = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);
    const run = {
      seed, days: 0, endReason: '',
      immigration: {
        applications: 0, accepted: 0, refused: 0,
        arrivals: [],        // {day, name, occ, fromVillageName, reputation}
        visitorInvites: 0, visitorSpawns: { trader: 0, scout: 0, curious: 0, fleeing: 0 },
        births: 0,
        rosterSnapshots: [], // {day, size}
      },
      fights: [],            // villager fieldFight recs
      deaths: [],            // {day, who, vid, player}
      transcripts: {},       // key -> lines
    };

    // ---- policy wrap: auto-accept applications via the REAL path ----
    const policy = Object.create(basePolicy);
    const baseDaily = basePolicy.daily ? basePolicy.daily.bind(basePolicy) : null;
    let lastSnap = -99;
    policy.daily = function (G, ctx) {
      if (baseDaily) baseDaily(G, ctx);
      try {
        const m = G.mshipState ? G.mshipState() : null;
        const apps = (m && m.applications) || [];
        for (const app of apps.slice()) {
          const r = G.acceptApplication ? G.acceptApplication(app.id) : null;
          if (r) run.immigration.accepted++;
          else run.immigration.refused++;
        }
        // roster snapshot every 15 days (births/trickle/deaths net)
        const day = (G.state.scholar || {}).day || 0;
        if (day - lastSnap >= 15) {
          lastSnap = day;
          const v = G.state.village || {};
          const alive = (v.roster || []).filter(id => {
            const rc = (v.rosterChars || {})[id];
            return !rc || rc.alive !== false;
          });
          run.immigration.rosterSnapshots.push({ day, size: alive.length });
        }
      } catch (e) {}
    };

    // ---- say capture (arrival narration, visitor invites) ----
    const origSay = Game.say;
    let curT = null;
    const keepT = (key) => {
      if (run.transcripts[key]) return false;
      if (Object.keys(run.transcripts).length >= 30) return false;
      run.transcripts[key] = [];
      return true;
    };
    Game.say = function (msg) {
      try {
        if (typeof msg === 'string') {
          if (/Haven grows by one/.test(msg) && !msg.includes('walks in')) {
            run.immigration.visitorInvites++;
          }
          // visitor spawn lines (betrayal.js considerStrangers)
          if (msg.includes('Riders on the ridge')) run.immigration.visitorSpawns.trader++;
          else if (msg.includes('stranger at the tree line')) run.immigration.visitorSpawns.scout++;
          else if (msg.includes('walks in like they belong here')) run.immigration.visitorSpawns.curious++;
          else if (msg.includes('They come fast and scared')) run.immigration.visitorSpawns.fleeing++;
          if (curT && curT.lines.length < 300) curT.lines.push(msg.slice(0, 300));
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };

    // ---- immigration instrumentation ----
    const oGenApp = Game.genApplicant;
    if (typeof oGenApp === 'function') {
      Game.genApplicant = function () {
        const app = oGenApp.apply(this, arguments);
        try {
          if (app) {
            run.immigration.applications++;
            run.immigration.appProfiles = run.immigration.appProfiles || {};
            run.immigration.appProfiles[app.id] = {
              name: app.name, occ: app.formerOccupation,
              fromVillageName: app.fromVillageName || null,
              reputation: app.reputation || null,
              nid: app.charId || app.id,
            };
          }
        } catch (e) {}
        return app;
      };
    }
    const oArrTick = Game.arrivalTick;
    if (typeof oArrTick === 'function') {
      Game.arrivalTick = function () {
        let before = [];
        try { before = ((Game.mshipState() || {}).arrivals || []).map(a => a.id); } catch (e) {}
        const r = oArrTick.apply(this, arguments);
        try {
          const after = ((Game.mshipState() || {}).arrivals || []).map(a => a.id);
          const arrivedIds = before.filter(id => after.indexOf(id) < 0);
          const day = (Game.state.scholar || {}).day || 0;
          for (const id of arrivedIds) {
            // find profile from the application record
            const prof = (run.immigration.appProfiles || {})[id] || {};
            run.immigration.arrivals.push({
              day, id: String(id).slice(0, 24),
              nid: String(prof.nid || id).slice(0, 24),
              name: prof.name || null, occ: prof.occ || null,
              fromVillageName: prof.fromVillageName || null,
              reputation: prof.reputation || null,
            });
          }
        } catch (e) {}
        return r;
      };
    }

    // ---- combat instrumentation ----
    const oFF = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      const day = (Game.state.scholar || {}).day || 0;
      const wave = monWave(Game, mdef && mdef.id);
      let prof = {};
      try {
        const ag = Game.agencyOf ? Game.agencyOf(vid) : null;
        prof = {
          bravery: ((ag || {}).xp || {})[vid] ? ((((ag || {}).xp || {})[vid] || {}).bravery || 0) : 0,
        };
      } catch (e) {}
      try {
        const sch = Game.state.scholar || {};
        const va = ((Game.state.village || {}).villagerAbilities || {})[vid] || [];
        prof.abilCount = va.length;
      } catch (e) {}
      let rec = null;
      const key = `vf-${seed}-${run.fights.length}`;
      const wantT = run.fights.length < 4; // first few fights per run
      const alliesIn = (opts && opts.allies) || 0;
      if (wantT && keepT(key)) { curT = { key, lines: run.transcripts[key] }; }
      try { rec = oFF.apply(this, arguments); }
      finally {
        try {
          if (rec) {
            const fr = {
              day, vid: String(vid).slice(0, 24), name: vName(Game, vid),
              monsterId: mdef && mdef.id, wave,
              outcome: rec.outcome, rounds: rec.rounds,
              vTaken: rec.vTaken, mDealt: rec.mDealt,
              everWinning: !!rec.everWinning, everHopeless: !!rec.everHopeless,
              calledHelp: !!rec.calledHelp,
              fleeHpFrac: rec.fleeHpFrac, minHpFrac: rec.minHpFrac,
              vHpLeft: rec.vHpLeft,
              bravery: prof.bravery, abilCount: prof.abilCount,
              alliesIn: alliesIn, awareness: !!(opts && opts.awareness),
            };
            run.fights.push(fr);
            // death fights + winning->death always get transcripts
            if ((rec.outcome === 'vDie' || (rec.everWinning && rec.outcome === 'vDie')) && keepT(`vdie-${seed}-${run.fights.length}`)) {
              const k2 = `vdie-${seed}-${run.fights.length}`;
              run.transcripts[k2] = (rec.log || []).slice(0, 80).map(l => String(l).slice(0, 200));
              run.transcripts[k2].push(`= ${fr.name} vs ${fr.monsterId} w${wave}: ${rec.outcome}, everWinning=${fr.everWinning} =`);
            }
            if (curT) {
              for (const l of (rec.log || []).slice(0, 50)) curT.lines.push(String(l).slice(0, 200));
              curT.lines.push(`= outcome: ${rec.outcome}, rounds ${rec.rounds}, vTaken ${rec.vTaken}, mDealt ${rec.mDealt} =`);
              curT = null;
            }
          }
        } catch (e) {}
      }
      return rec;
    };

    // ---- death linkage ----
    const oRegDeath = Game.registerDeath;
    if (typeof oRegDeath === 'function') {
      Game.registerDeath = function (who, cause) {
        try {
          const isPlayer = who && Game.state.scholar && (who.id === Game.state.scholar.villagerId || who === Game.state.scholar);
          run.deaths.push({
            day: (Game.state.scholar || {}).day || 0,
            who: vName(Game, who && (who.id || who.villagerId || who)),
            vid: String((who && (who.id || who.villagerId)) || '?').slice(0, 24),
            player: !!isPlayer, cause: String(cause || '').slice(0, 60),
          });
        } catch (e) {}
        return oRegDeath.apply(this, arguments);
      };
    }

    // (roster snapshots now handled inside policy.daily)

    // ---- run ----
    const res = await runDays(Game, policy, {
      days: DAYS,
      stopWhen: () => {
        try {
          const v = Game.state.village || {};
          const alive = (v.roster || []).filter(id => {
            const rc = (v.rosterChars || {})[id];
            return !rc || rc.alive !== false;
          });
          return alive.length === 0 || Game.state.gameOver;
        } catch (e) { return false; }
      },
    });
    run.days = (Game.state.scholar || {}).day || 0;
    run.endReason = (res && res.stopped) ? 'stopped' : 'horizon';
    // newcomer integration: trust + survival of arrivals
    try {
      const v = Game.state.village || {};
      run.immigration.newcomerFates = run.immigration.arrivals.map(a => {
        const nid = a.nid || a.id;
        const rc = (v.rosterChars || {})[nid];
        return {
          id: a.id, nid: nid, day: a.day, name: a.name,
          alive: !rc || rc.alive !== false,
          trust: (v.trust || {})[nid],
          onRoster: (v.roster || []).indexOf(nid) >= 0,
        };
      });
    } catch (e) {}
    runs.push(run);
    console.log(`seed ${seed}: ${run.days}d, apps ${run.immigration.applications} acc ${run.immigration.accepted}, arrivals ${run.immigration.arrivals.length}, invites ${run.immigration.visitorInvites}, fights ${run.fights.length}, deaths ${run.deaths.length}`);
  }
  fs.writeFileSync(OUT, JSON.stringify(runs, null, 1));
  console.log('wrote ' + OUT);
})();
