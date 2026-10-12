#!/usr/bin/env node
// probe-combat-r8-20261012.js — lever-1 (combat & death share) baseline.
// Measures on CURRENT master: death-cause shares (player + villagers),
// decomposed by wave and by situation (feast-draw / contest / wild / field);
// median/max survival; wave reach; armor acquisition vs the r=P/(P+20)
// curve; counter discovery/kills; combatWitnessReact firing; fight
// transcripts for sense-testing.
//
// Usage: SEEDS="11,22,33" DAYS=200 OUT=/tmp/combat-r8.json node scripts/probe-combat-r8-20261012.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88,99,111,222,333').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/combat-r8.json';

function monsterWave(Game, mid) {
  try {
    const md = (Game.data.monsters || []).find(m => m.id === mid);
    return md ? (md.wave || 1) : 1;
  } catch (e) { return 1; }
}

(async () => {
  const runs = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);

    // ---- instrumentation ----
    const run = {
      seed, days: 0, endReason: '',
      deaths: [],        // {day, kind, who, player, cause, situation, monsterId, wave}
      fights: [],        // {day, kind, monsterId, wave, situation}
      counters: [],      // {day, id, via}
      witness: { start: 0, kill: 0, hurt: 0, flee: 0, avail: 0, partAvail: 0, lines: 0, checked: 0 },
      armor: [],         // every-10-day snapshots {day, playerP, playerArmor[], villagerArmored, barkWearers}
      monsterKills: {},  // "wave:situation" -> count
      transcripts: {},   // key -> lines (first fights per kind + person-death fights)
      waveKills: {}, maxWave: 1,
    };

    const fightStack = [];
    const monWave = (mid) => monsterWave(Game, mid);

    // say capture: harness no-op'd say; re-wrap to record silently.
    const origSay = Game.say, origSysSay = Game.sysSay;
    let curTranscript = null;
    const keepTranscript = (key) => {
      if (run.transcripts[key]) return false;
      if (Object.keys(run.transcripts).length >= 24) return false;
      run.transcripts[key] = [];
      return true;
    };
    Game.say = function (m) {
      try {
        if (typeof m === 'string' && curTranscript) {
          if (curTranscript.lines.length < 400) curTranscript.lines.push(m.slice(0, 400));
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
    Game.sysSay = function (m) {
      try {
        if (typeof m === 'string' && curTranscript) {
          if (curTranscript.lines.length < 400) curTranscript.lines.push('[sys] ' + m.slice(0, 400));
        }
      } catch (e) {}
      return origSysSay.apply(this, arguments);
    };

    const pushFight = (kind, monsterId, situation) => {
      const day = (Game.state.scholar || {}).day || 0;
      const wave = monWave(monsterId);
      let php = null, pmax = null;
      try { php = Game.state.scholar.health; pmax = Game.state.scholar.maxHealth || 100; } catch (e) {}
      const ctx = { day, kind, monsterId, wave, situation, php, pmax };
      fightStack.push(ctx);
      Game.__fightCtx = ctx; // current/last fight; cleared at tbEnd / superseded
      run.fights.push({ day, kind, monsterId, wave, situation, php, pmax });
      // start a transcript for: first fight of each situation+wave kind, capped
      const key = `fight-${situation}-w${wave}-${seed}`;
      if (keepTranscript(key)) {
        curTranscript = { key, lines: [], ctx, seed };
        curTranscript.lines.push(`--- ${situation} wave${wave} fight, day ${day}, seed ${seed} ---`);
        run.transcripts[key] = curTranscript.lines;
      }
      return ctx;
    };
    const endTranscript = (why) => {
      if (curTranscript) {
        curTranscript.lines.push(`--- fight over (${why}) ---`);
        curTranscript = null;
      }
    };

    // startCombat: player's fights. Contest arena sets state.arenaContest.
    // NOTE: startCombat only OPENS the fight — the fight plays out over many
    // turns after it returns. The ctx clears at tbEnd, not here.
    const oStart = Game.startCombat;
    Game.startCombat = function (mid) {
      let situation = 'wild';
      try {
        if (Game.state.arenaContest) situation = 'contest';
        else if (Game.__feastDrawPendingFlag) situation = 'feast-draw';
      } catch (e) {}
      const refused = this.tbfight && !this.tbfight.over;
      if (!refused) pushFight('player', mid, situation);
      return oStart.apply(this, arguments);
    };

    // tbEnd: the fight is truly over — clear the current-fight pointer and
    // close the transcript.
    const oTbEnd = Game.tbEnd;
    if (typeof oTbEnd === 'function') {
      Game.tbEnd = function () {
        try { return oTbEnd.apply(this, arguments); }
        finally {
          Game.__fightCtx = null;
          endTranscript('tbEnd');
        }
      };
    }

    // fieldFight: villager-vs-monster, SYNCHRONOUS — but the caller processes
    // the death (hurtVillager -> registerDeath) AFTER fieldFight returns, so
    // the ctx must survive the return. It is superseded by the next fight.
    const oFF = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      const situation = Game.__inContestResolve ? 'contest' : 'field';
      const ctx = pushFight('villager', mdef && mdef.id, situation);
      let rec = null;
      try { rec = oFF.apply(this, arguments); }
      finally {
        try {
          if (rec && rec.log && rec.log.length && curTranscript) {
            for (const l of rec.log.slice(0, 60)) curTranscript.lines.push(String(l).slice(0, 200));
            curTranscript.lines.push(`= outcome: ${rec.outcome}, rounds: ${rec.rounds}, vTaken: ${rec.vTaken}, mDealt: ${rec.mDealt} =`);
          }
          // keep the log on the fight record for analysis
          const fr = run.fights[run.fights.length - 1];
          if (fr && rec) { fr.outcome = rec.outcome; fr.rounds = rec.rounds; fr.vTaken = rec.vTaken; }
        } catch (e) {}
        endTranscript('fieldFight');
      }
      return rec;
    };

    // feast draw entry: faceFeastDraw -> startCombat.
    const oFace = Game.faceFeastDraw;
    if (typeof oFace === 'function') {
      Game.faceFeastDraw = function () {
        Game.__feastDrawPendingFlag = true;
        try { return oFace.apply(this, arguments); }
        finally { Game.__feastDrawPendingFlag = false; }
      };
    }

    // villager contest resolution (off-screen field fights).
    const oCRG = Game.contestResolveGroup;
    if (typeof oCRG === 'function') {
      Game.contestResolveGroup = function () {
        Game.__inContestResolve = true;
        try { return oCRG.apply(this, arguments); }
        finally { Game.__inContestResolve = false; }
      };
    }

    // counter discovery.
    const oDisc = Game.discoverMonsterCounter;
    if (typeof oDisc === 'function') {
      Game.discoverMonsterCounter = function (mid, via) {
        try {
          run.counters.push({ day: (Game.state.scholar || {}).day || 0, id: mid, via: String(via || '') });
        } catch (e) {}
        return oDisc.apply(this, arguments);
      };
    }

    // combatWitnessReact: count fires + availability (bystanders vs participants).
    const oWR = Game.combatWitnessReact;
    if (typeof oWR === 'function') {
      Game.combatWitnessReact = function (moment) {
        try {
          run.witness.checked++;
          const wit = Game.witnesses ? (Game.witnesses(6) || []) : [];
          if (wit.length) run.witness.avail++;
          // participant pool (mirrors the game change): alive villager fighters
          let part = 0;
          try {
            const f = Game.tbfight;
            if (f && f.fighters) {
              for (const o of f.fighters) {
                if (o && o.kind === 'villager' && o.alive && o.villagerId && !wit.includes(o.villagerId)) part++;
              }
            }
          } catch (e) {}
          if (part > 0) run.witness.partAvail++;
          if ((moment === 'kill' || moment === 'hurt') && (wit.length + part) > 0) run.witness.lines++;
          else if ((moment === 'start' || moment === 'flee') && wit.length > 0) run.witness.lines++;
          if (moment in run.witness) run.witness[moment]++;
        } catch (e) {}
        return oWR.apply(this, arguments);
      };
    }

    // hurtVillager: villager field-fight deaths are processed by the CALLER
    // after fieldFight returns (game.js hurtVillager(vid, rec.vTaken,
    // 'monster')). Stash the ctx so the synchronous registerDeath inside
    // sees the fight it came from.
    const oHurtV = Game.hurtVillager;
    if (typeof oHurtV === 'function') {
      Game.hurtVillager = function (vid, dmg, cause) {
        if (Game.__fightCtx && /monster|combat/i.test(String(cause || ''))) {
          Game.__pendingDeathCtx = Game.__fightCtx;
        }
        try { return oHurtV.apply(this, arguments); }
        finally { Game.__pendingDeathCtx = null; }
      };
    }

    // registerDeath: attribute deaths to the live fight context.
    // Priority: pendingDeathCtx (deferred hurtVillager) -> __fightCtx
    // (same-day, unless the cause is a known non-combat killer) -> 'none'.
    // Non-combat killers: starvation/thirst/disease/wounds — everything else
    // with a same-day fight ctx came from that fight (expedDeath registers
    // with cause = the monster's display name, e.g. 'Choir Toad').
    const NON_COMBAT_CAUSES = /^(starvation|thirst|sickness|wound_fever|bad belly|a wound that wouldn.t close|lockjaw|injuries|the phoenix link.*|drowned|froze|burned)$/i;
    const oReg = Game.registerDeath;
    if (typeof oReg === 'function') {
      Game.registerDeath = function (opts) {
        try {
          opts = opts || {};
          const day = (Game.state.scholar || {}).day || 0;
          let ctx = Game.__pendingDeathCtx || null;
          if (!ctx && Game.__fightCtx && Game.__fightCtx.day === day &&
              !NON_COMBAT_CAUSES.test(String(opts.cause || ''))) {
            ctx = Game.__fightCtx;
          }
          // Delayed wound deaths: the fight ended (tbEnd cleared the ctx)
          // but the wounds it dealt killed hours/a day later. Attribute to
          // the most recent fight within 1 day — the cause is honest.
          let delayed = false;
          if (!ctx && /^(combat|villager combat|monster)$/i.test(String(opts.cause || ''))) {
            for (let i = run.fights.length - 1; i >= 0; i--) {
              const f = run.fights[i];
              if (day - f.day <= 1 && day - f.day >= 0) { ctx = f; delayed = true; break; }
              if (day - f.day > 1) break;
            }
          }
          // Contest deaths without a live fight ctx still came from a contest.
          const contestDeath = /^contest$/i.test(String(opts.cause || ''));
          const kind = opts.kind || '?';
          if (kind === 'person' || kind === 'villager') {
            const isPlayer = opts.villagerId && opts.villagerId === Game.villagerId;
            const rec = {
              day: (Game.state.scholar || {}).day || 0,
              kind, who: opts.name || opts.villagerId || '?',
              player: !!isPlayer,
              cause: opts.cause || '?',
              situation: ctx ? ctx.situation + (delayed ? ' (delayed)' : '') : (contestDeath ? 'contest' : 'none'),
              monsterId: ctx ? ctx.monsterId : null,
              wave: ctx ? ctx.wave : null,
              delayed: delayed,
            };
            run.deaths.push(rec);
            // keep a transcript for any fight where a person dies
            if (curTranscript) {
              const key = `death-${isPlayer ? 'player' : 'villager'}-d${rec.day}-s${seed}`;
              if (!run.transcripts[key] && Object.keys(run.transcripts).length < 24) {
                run.transcripts[key] = curTranscript.lines.slice();
                run.transcripts[key].push(`*** ${rec.who} died (${rec.cause}) in ${rec.situation} fight ***`);
              }
            }
          } else if (kind === 'monster' || kind === 'animal') {
            const k = `${ctx ? ctx.wave : monWave(opts.monsterId)}:${ctx ? ctx.situation : 'none'}`;
            run.monsterKills[k] = (run.monsterKills[k] || 0) + 1;
          }
        } catch (e) {}
        return oReg.apply(this, arguments);
      };
    }

    // armor snapshots every 10 days via policy.daily wrap
    const base = competent;
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      try {
        const day = (G.state.scholar || {}).day || 0;
        if (day % 10 === 0 && !run.armor.some(a => a.day === day)) {
          let playerP = 0, playerArmor = [];
          try { playerP = G.armorBonus ? G.armorBonus() : 0; } catch (e) {}
          try {
            const eq = (G.state.scholar || {}).equipped || {};
            for (const slot of Object.keys(eq)) {
              const it = eq[slot];
              const id = it && (it.itemId || it.id);
              if (id) playerArmor.push(id);
            }
          } catch (e) {}
          let villagerArmored = 0, barkWearers = 0, villagerP = [];
          try {
            const S = globalThis.Scattering || {};
            const ros = (G.state.village || {}).roster || [];
            for (const vid of ros) {
              let person = null;
              try { person = G.getPerson ? G.getPerson(vid) : null; } catch (e) {}
              if (!person) continue;
              let ap = 0;
              try { ap = (S.equipment && S.equipment.armorOf) ? S.equipment.armorOf(person, G.data.items) || 0 : 0; } catch (e) {}
              if (ap > 0) { villagerArmored++; villagerP.push(ap); }
              const eq = person.equipped || {};
              const ids = Object.values(eq).map(x => x && (x.itemId || x.id || x)).join(',');
              if (/bark_armor/.test(ids)) barkWearers++;
            }
          } catch (e) {}
          if (/bark_armor/.test(playerArmor.join(','))) barkWearers++;
          run.armor.push({ day, playerP, playerArmor, villagerArmored, villagerP, barkWearers });
        }
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };

    const result = await runDays(Game, policy, { days: DAYS });
    run.days = result.days;
    run.endReason = result.endReason;
    try { run.waveKills = Object.assign({}, Game.state.waveKills || {}); } catch (e) {}
    try { run.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
    try { run.counterState = Object.assign({}, Game.state.monsterCounters || {}); } catch (e) {}
    // final armor snapshot
    try {
      let playerP = 0;
      try { playerP = Game.armorBonus ? Game.armorBonus() : 0; } catch (e) {}
      run.finalArmor = { playerP };
    } catch (e) {}

    runs.push(run);
    const pd = run.deaths.filter(d => d.player);
    const vd = run.deaths.filter(d => !d.player);
    console.log(`done: seed=${seed} days=${run.days} end=${run.endReason} playerDeaths=${pd.length} villagerDeaths=${vd.length} monsterKills=${Object.values(run.monsterKills).reduce((a,b)=>a+b,0)} witnessFires=${run.witness.start + run.witness.kill + run.witness.hurt + run.witness.flee} counters=${run.counters.length}`);
  }

  fs.writeFileSync(OUT, JSON.stringify({ meta: { seeds: SEEDS, days: DAYS, date: new Date().toISOString().slice(0, 10) }, runs }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
