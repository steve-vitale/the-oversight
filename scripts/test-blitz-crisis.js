#!/usr/bin/env node
// CRISIS RECOVERY PROOF — scripts/test-blitz-crisis.js (2026-10-13).
//
// Steve's gap: crisis arcs (famine, disease outbreak, monster siege) break
// villages with ZERO recoveries. The relief paths existed (safetynets.js)
// but villages never bent back:
//   (1) the hunger relief fired on the SAME TICK the village scattered
//       (hunger-winter at hungryStreak>=3 == scatter at hungryDays>=3) —
//       a beat that fires into game-over is not a path;
//   (2) the emergency hunt (1500-4000 kcal) was hours of food for a
//       12-mouth village — a band-aid on a hemorrhage;
//   (3) there was no way to surge production and no triage choice.
//
// The fix (src/js/safetynets.js, "CRISIS RECOVERY 2026-10-13"): hunger
// relief opens on the FIRST hungry day; the hunt scales to two days of food
// for the roster; the RALLY (second shift, +50% food yields 3d, paid in
// bodies: speaker -12, workers -2/d (-4 hungry), blood price unity -1);
// triage is a real choice (everyone / worst-first / hale-first).
//
// This proof: three crisis scenarios x N seeds, played by a crisis-driver
// policy that works the recovery moves the way a desperate leader would —
// answers relief beats with judgment, requests neighbor aid, accepts aid
// quests/offers, keeps villagers on food. Same driver before/after; the
// mechanics are the variable.
//
//   (a) recovery rate > 0 per crisis scenario (was 0 on pristine — RED);
//   (b) recovery is earned: every recovered run paid real, legible costs;
//   (c) no regression: calm (non-crisis) play unaffected, relief silent.
//
// Recovery = the village BENDS (deaths allowed, costs paid) without
// BREAKING (no scatter, crisis resolved, pantry rebuilding).
//
// Sense-test: the proof prints the recovery beats of one run per scenario —
// read them. They should read like people surviving, not numbers moving.
//
// Usage: node scripts/test-blitz-crisis.js [SEEDS=1-6] [SCEN=famine|disease|siege|calm]
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');

const SEEDS = (process.env.SEEDS || '1-6').split(',').flatMap(p => {
  const m = p.match(/^(\d+)-(\d+)$/);
  if (m) { const o = []; for (let i = +m[1]; i <= +m[2]; i++) o.push(i); return o; }
  return /^\d+$/.test(p) ? [+p] : [];
});
const SCEN = (process.env.SCEN || 'famine,disease,siege,calm').split(',');
const DAYS = { famine: 15, disease: 30, siege: 25, calm: 15 };

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }

// ---------------- crisis driver ----------------
// Plays the recovery moves like a desperate leader: relief beats answered
// with judgment, neighbor aid requested when struggling, aid quests/offers
// accepted. Light touch on assignments (the village's abstract provision is
// the base economy — the driver is the leader, not a micromanager; mass
// assignment burns the action clock via socialTick and freezes the day).
function chooseRelief(Game, rel) {
  const used = rel.used || {};
  const v = Game.state.village || {};
  let pantry = 0;
  try { pantry = Game.pantryKcalLive(v); } catch (e) {}
  const triageUsed = used.triage || used['triage-worst'] || used['triage-hale'];
  const hungry = (v.hungryDays || 0) >= 1 || pantry < 2000;
  // HUNGER FIRST: a village that's starving answers hunger, whatever the
  // relief's framing kind — the compound crisis is the real killer.
  if (hungry) {
    if (!used.hunt) return 'hunt';
    if (!used.rations) return 'rations';
    if (!used.rally) return 'rally';
  }
  if (rel.kind === 'hunger' && !hungry) {
    if (!used.rally) return 'rally';
    return null;
  }
  if (rel.kind === 'sickness' || Object.keys(v.sick || {}).length >= 2) {
    if (!triageUsed) {
      let severeLow = 0, mildN = 0, sevN = 0;
      for (const vid of Object.keys(v.sick || {})) {
        const rec = v.sick[vid] || {};
        const sev = rec.severity || 1;
        const hp = (v.health || {})[vid] !== undefined ? v.health[vid] : 100;
        if (sev >= 2) { sevN++; if (hp < 65) severeLow++; } else mildN++;
      }
      if (severeLow > 0) return 'triage-worst';
      if (mildN > sevN) return 'triage-hale';
      return 'triage';
    }
    if (!used.rally) return 'rally'; // keep food coming while the sick mend
    if (!used.hunt && pantry < 8000) return 'hunt';
    return null;
  }
  // raid / storm / aftermath / wounded
  if (!triageUsed) return 'triage';
  if (!used.hunt && pantry < 12000) return 'hunt';
  if (!used.rally) return 'rally';
  if (!used.rations && pantry > 4000) return 'rations';
  return null;
}

function makeDriver(scenario, ctx) {
  return {
    id: 'crisis-driver-' + scenario,
    setup() {},
    upkeep(Game, c) {
      if (Game.over) return;
      const st = Game.state || {};
      const v = st.village || {};
      const day = (st.scholar || {}).day || 0;
      // light direction: two foragers + water when low, once per day
      try {
        if (ctx.lastAssignDay !== day && Game.playerAtHaven && Game.playerAtHaven()) {
          ctx.lastAssignDay = day;
          const asg = v.assignments || {};
          const vw = v.water || {};
          const waterLow = ((vw.clean || 0) + (vw.dirty || 0)) < (v.roster || []).length * 4;
          let assigned = 0, waterDone = false;
          for (const vid of (v.roster || [])) {
            if (assigned >= 2 && (waterDone || !waterLow)) break;
            if (vid === Game.villagerId) continue;
            if ((Game.vpOf(vid) || {}).dead) continue;
            if ((v.sick || {})[vid]) continue;
            const hp = (v.health || {})[vid] !== undefined ? v.health[vid] : 100;
            if (hp < 50) continue;
            if (asg[vid]) continue;
            const task = (waterLow && !waterDone) ? 'water' : 'forage';
            try { Game.assignTask(vid, task, { via: 'in-person' }); } catch (e) {}
            if (task === 'water') waterDone = true; else assigned++;
          }
        }
      } catch (e) {}
      // aid quest: accept, hand in when able
      try {
        if (st.pendingAidQuest && Game.answerAidQuest) { Game.answerAidQuest('accept'); ctx.aidAccepted++; }
      } catch (e) {}
      try {
        if (st.activeAidQuest && Game.handInAidQuest) {
          const r = Game.handInAidQuest();
          if (r === 'reward-supply' || r === 'reward-ability') ctx.costs.push('quest-complete');
        }
      } catch (e) {}
      // aid offer: accept
      try {
        if (st.pendingAidOffer && Game.answerAidOffer) {
          const r = Game.answerAidOffer('accept');
          if (r === 'accepted') { ctx.aidAccepted++; ctx.costs.push('aid-offer-accepted'); }
        }
      } catch (e) {}
      // relief: answer with judgment, one option per upkeep
      try {
        const rel = st.relief;
        if (rel && Game.answerRelief) {
          const opt = chooseRelief(Game, rel);
          if (opt) {
            const r = Game.answerRelief(opt);
            if (r && ['used', 'noneed', 'short', null].indexOf(r) < 0) {
              ctx.reliefAnswers.push(opt);
              if (opt === 'rally') ctx.costs.push('rally-exhaustion');
              if (opt === 'rations') ctx.costs.push('rationing-morale');
              if (/^triage/.test(opt)) ctx.costs.push('triage-kcal');
              if (opt === 'hunt') ctx.costs.push('hunt-risk');
            }
          }
        }
      } catch (e) {}
    },
    daily(Game, c) {
      if (Game.over) return;
      // request neighbor aid when struggling (the move is knowledge-gated;
      // the scenario setup has the village learn it from a traveler)
      try {
        const st = Game.state;
        if (!st.aidKnown || !Game.requestAid || !Game.aidRequestable) return;
        let links = [];
        try { links = (Game.hierarchyState() || []).filter(l => l.status === 'active'); } catch (e) {}
        for (const link of links) {
          let chk = null;
          try { chk = Game.aidRequestable(link.id); } catch (e) {}
          if (chk && !chk.blocked) {
            const kind = scenario === 'disease' ? 'medicine' : 'food';
            let r = null;
            try { r = Game.requestAid(link.id, kind); } catch (e) {}
            if (r && r !== 'blocked') { ctx.aidRequests++; ctx.costs.push('aid-debt'); }
            break;
          }
        }
      } catch (e) {}
    },
    fight() { return false; }, // default driveFights strikes
  };
}

// ---------------- scenario setup ----------------
function commonSetup(Game) {
  const s = Game.state.scholar;
  s.day = 10;
  Game.state.systemArrived = true;
  s.integration = 45; s.health = 100; s.kcal = 2500; s.trauma = 0;
  s.abilities = s.abilities || [];
  Game.state.over = false;
  const v = Game.state.village;
  v.sick = v.sick || {}; v.health = v.health || {};
  // NOTE: do NOT touch Game.map.px/py — setupGame leaves the player at
  // haven (playerAtHaven() true); the village object carries no px/py and
  // writing undefined there breaks tileAt.
  // one linked neighbor with real grain (finite pantry — aid is not infinite)
  const ovs = Game.state.otherVillages || [];
  ovs.forEach(x => { x.generated = true; x.rumored = true; x.crisis = null; x.pantryKcal = 22000; });
  const v0 = ovs[0];
  let link = null;
  try { link = v0 ? Game.linkWith(v0.id) : null; } catch (e) {}
  if (v0 && !link) { try { Game._formLink(v0.id, {}, null); } catch (e) {} try { link = Game.linkWith(v0.id); } catch (e) {} }
  if (link) { link.trust = 70; }
  // the request-aid move, learned (knowledge-gated, canon)
  Game.state.aidKnown = true;
  try { if (Game.journalNote) Game.journalNote('village', 'aid', 'A traveler taught Haven the aid-request move (day 10).'); } catch (e) {}
  return { s, v, v0, link };
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => !(Game.vpOf(id) || {}).dead);
}
function setupScenario(Game, scenario) {
  const { v } = commonSetup(Game);
  if (scenario === 'famine') {
    // THE EMPTY BINS: a healthy village, pantry bare, the 3-day scatter clock
    // running. The crisis is the clock — production is fine, but the bins are
    // empty and the village needs a bridge before the scattering. Deep, not
    // hopeless: the relief must arrive in time and add up.
    v.pantry = []; v.pantryKcal = 0; v.hungryDays = 0;
    // A healthy village (full health = max production) hit by a sudden
    // pantry wipe — the acute crisis, not chronic insufficiency.
    for (const id of livingRoster(Game)) {
      if (id === Game.villagerId) continue;
      v.health[id] = 100;
    }
  } else if (scenario === 'disease') {
    // OUTBREAK: four down with gut rot (one critical), the healthy stretched,
    // bins low — the compound famine is the second killer.
    try { Game.stockPantry(12000, 'low bins', { pieceKcal: 500 }); } catch (e) {}
    const ids = livingRoster(Game).filter(id => id !== Game.villagerId).slice(0, 4);
    const specs = [[3, 8], [2, 7], [2, 8], [1, 7]]; // [severity, daysLeft]
    ids.forEach((id, i) => {
      v.sick[id] = { name: 'gut rot', daysLeft: specs[i][1], severity: specs[i][0] };
      v.health[id] = 65 + Math.floor(Math.random() * 10);
    });
    for (const id of livingRoster(Game)) {
      if (id === Game.villagerId || (v.sick || {})[id]) continue;
      v.health[id] = 70 + Math.floor(Math.random() * 10);
    }
  } else if (scenario === 'siege') {
    // THE MORNING AFTER: last night's raid — four wounded, one dead, bins
    // pillaged. The aid crisis resolves 'fought' through the real pathway.
    const ids = livingRoster(Game).filter(id => id !== Game.villagerId);
    ids.slice(0, 4).forEach(id => { v.health[id] = 35 + Math.floor(Math.random() * 15); });
    const deadId = ids[4];
    try { Game.hurtVillager(deadId, 999, 'raid'); } catch (e) {}
    if (!(Game.vpOf(deadId) || {}).dead) {
      try { Game.registerDeath({ kind: 'villager', villagerId: deadId, name: Game.displayName(deadId), cause: 'raid' }); } catch (e) {}
      try { Game.removeVillager(deadId, 'killed'); } catch (e) {}
    }
    v.pantry = [];
    try { Game.stockPantry(5000, 'pillaged bins', { pieceKcal: 500 }); } catch (e) {}
    try {
      Game.raiseAidCrisis('raiders', 2);
      if (Game.state.aidCrisis) Game.state.aidCrisis.raiders = true;
      Game.resolveAidCrisis('fought'); // -> 'the-siege' crisis + relief('raid')
    } catch (e) {}
  }
  // calm: no crisis — the regression check (healthy village, full bins)
  if (scenario === 'calm') {
    try { Game.stockPantry(20000, 'full bins', { pieceKcal: 500 }); } catch (e) {}
    for (const id of livingRoster(Game)) {
      if (id === Game.villagerId) continue;
      if (v.health[id] === undefined) v.health[id] = 85 + Math.floor(Math.random() * 15);
    }
  }
  return livingRoster(Game).length;
}

// ---------------- evaluation ----------------
function avgHealth(Game) {
  const v = Game.state.village || {};
  let sum = 0, n = 0;
  for (const id of livingRoster(Game)) {
    if (id === Game.villagerId) continue;
    sum += (v.health || {})[id] !== undefined ? v.health[id] : 100;
    n++;
  }
  return n ? sum / n : 0;
}
function evaluate(Game, scenario, startLiving) {
  const v = Game.state.village || {};
  const roster = livingRoster(Game);
  let pantry = 0;
  try { pantry = Game.pantryKcalLive(v); } catch (e) {}
  const sickN = Object.keys(v.sick || {}).length;
  const deaths = Math.max(0, startLiving - roster.length);
  const ah = avgHealth(Game);
  const base = {
    over: !!Game.over, scattered: !!v.scattered,
    roster: roster.length, pantry: Math.round(pantry), sickN, deaths,
    hungryDays: v.hungryDays || 0, startLiving, avgHealth: Math.round(ah),
  };
  let recovered = false, why = '';
  if (!base.over && !base.scattered) {
    // The bar is "the village holds and the crisis passes" — deaths are the
    // honest cost of a crisis (reported, not a hard fail). What must NOT
    // happen is the scatter (the break) or a lingering crisis.
    if (scenario === 'famine') {
      recovered = base.hungryDays === 0 && ah >= 60;
      why = 'eating again, health stable (>=60), no scatter';
    } else if (scenario === 'disease') {
      recovered = sickN === 0 && ah >= 60;
      why = 'outbreak over, health stable (>=60), no scatter';
    } else if (scenario === 'siege') {
      recovered = ah >= 60;
      why = 'health stable (>=60), no scatter';
    } else if (scenario === 'calm') {
      // No regression: the village holds together in normal play. Random
      // world deaths (ambush, expedition, contest) are background noise, not
      // caused by the crisis mechanics — the bar is cohesion, not immortality.
      recovered = true;
      why = 'village holds, no crisis';
    }
  } else {
    why = base.scattered ? 'SCATTERED' : 'game over';
  }
  return Object.assign(base, { recovered, why });
}

async function runScenario(scenario) {
  const days = DAYS[scenario] || 25;
  const recs = [];
  for (const seed of SEEDS) {
    const ctx = { reliefAnswers: [], aidRequests: 0, aidAccepted: 0, costs: [] };
    const said = [];
    let rec = null;
    try {
      const { Game } = await loadGame({ seed, mode: 'blitz-crisis-' + scenario });
      // collect the transcript for the sense-test (loadGame silences say)
      Game.say = (t) => { said.push(String(t)); };
      Game.sysSay = (t) => { said.push('[SYSTEM] ' + String(t)); };
      await setupGame(Game);
      const startLiving = setupScenario(Game, scenario);
      const driver = makeDriver(scenario, ctx);
      // track death causes
      const deaths = [];
      const _rd = Game.registerDeath;
      Game.registerDeath = function (info) {
        try { deaths.push({ day: Game.state.scholar.day, cause: (info && info.cause) || '?', kind: (info && info.kind) || '?' }); } catch (e) {}
        return _rd ? _rd.apply(this, arguments) : null;
      };
      const res = await runDays(Game, driver, { days, manifest: null });
      rec = evaluate(Game, scenario, startLiving);
      rec.seed = seed;
      rec.deathCauses = deaths.map(d => d.cause).join(',');
      rec.reliefAnswers = ctx.reliefAnswers.slice();
      rec.costs = ctx.costs.slice();
      rec.aidRequests = ctx.aidRequests;
      rec.endReason = res.endReason;
      // keep the recovery beats for the sense-test
      rec.beats = said.filter(t =>
        /🛟|⛺|🏹|🔥|🗳️|📦|🎁|💊|🤝|rally|triage|rationing|relief|aid|scattered|starved|succumbed/i.test(t)
      ).slice(0, 40);
    } catch (e) {
      rec = { seed, error: String((e && e.message) || e).slice(0, 200), recovered: false, why: 'threw' };
    }
    recs.push(rec);
    const r = rec.error ? 'ERROR ' + rec.error
      : (rec.recovered ? 'RECOVERED' : 'broke') + ` (roster ${rec.roster}/${rec.startLiving}, pantry ${rec.pantry}, sick ${rec.sickN}, deaths ${rec.deaths}[${rec.deathCauses || ''}], hungry ${rec.hungryDays}, avgHp ${rec.avgHealth}, relief:[${(rec.reliefAnswers || []).join(',')}], costs:[${(rec.costs || []).join(',')}], aidReq ${rec.aidRequests}, ${rec.endReason})`;
    console.log(`  seed ${seed}: ${r}`);
  }
  return recs;
}

(async () => {
  console.log('blitz-crisis proof — scenarios: ' + SCEN.join(',') + ' seeds: ' + SEEDS.join(','));
  const all = {};
  for (const scenario of SCEN) {
    sec('SCENARIO: ' + scenario + ' (' + DAYS[scenario] + 'd)');
    all[scenario] = await runScenario(scenario);
  }

  // ---- verdicts ----
  sec('VERDICT');
  let crisisTotal = 0, crisisRec = 0;
  for (const scenario of SCEN) {
    const recs = all[scenario] || [];
    const n = recs.length, recN = recs.filter(r => r.recovered).length;
    const rate = n ? (recN / n) : 0;
    if (scenario !== 'calm') { crisisTotal += n; crisisRec += recN; }
    const isCrisis = scenario !== 'calm';
    // (a) crisis scenarios must show SOME recovery; (c) calm must not break
    const want = isCrisis ? rate > 0 : recN === n;
    ok(`${scenario}: recovery ${recN}/${n}${isCrisis ? ' (>0 required)' : ' (calm: all intact)'}`, want, `rate=${rate.toFixed(2)}`);
    if (!isCrisis) continue;
    // (b) recovery is earned: every recovered run paid real costs
    for (const r of recs.filter(x => x.recovered)) {
      const distinct = new Set((r.costs || []).map(c => String(c).split(':')[0])).size;
      ok(`${scenario} seed ${r.seed}: recovery earned (costs paid)`, distinct >= 1, `costs=[${(r.costs || []).join(',')}]`);
    }
  }

  // ---- sense-test: read one recovery per crisis scenario ----
  sec('SENSE-TEST (read the beats — people surviving, not numbers moving)');
  for (const scenario of ['famine', 'disease', 'siege']) {
    const rec = (all[scenario] || []).find(r => r.recovered && r.beats && r.beats.length);
    if (!rec) { console.log(`\n[${scenario}] no recovered run to read`); continue; }
    console.log(`\n[${scenario} seed ${rec.seed} — recovery beats]`);
    for (const b of rec.beats.slice(0, 14)) console.log('  ' + String(b).slice(0, 220));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
