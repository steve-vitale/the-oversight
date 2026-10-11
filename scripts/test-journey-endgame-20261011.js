#!/usr/bin/env node
// Journey leg: ENDGAME (days 140+) — deed-seeking player playthrough.
//
// Full games day 1->180 as a competent player chasing the table. Extends the
// competent policy (scripts/policies/competent.js) with deed-seeking leg
// behaviors:
//  - DEED-SEEKING fights: take wave fights to fill the 5/5/4/3/2 deed bars
//    (fleeing a fight still counts as fought — MONSTER-WAVES.md); flee
//    honest deaths (hp<0.5 or hopelessly outmatched). When FEASTED (surge
//    armed + feast held), stay in wave-4 fights for real KILLS — the wave-5
//    unlock needs 3 w4 ledger points (kills only).
//  - sentiment: channel a keepsake daily once taught (devotion lane:
//    surgeResonance>=35 arms the feast surge via focused practice).
//  - feast: hold a feast when the surge is armed + pantry rich + at haven,
//    then fight while feasted (feastSurgeUsed marks on real combat use).
//  - scale-courtship: same regionalPlay as the scale leg (national is the
//    deed bar). Answer every contest/crisis/beat aloud.
//  - the final live choice: when scholar.tableChoices is set, choose option
//    0 and record frame + choice (a real player makes the choice).
//
// Text capture ON. Evidence: /tmp/journey-endgame-*.{json,txt}.
//
// Usage: node scripts/test-journey-endgame-20261011.js
//   env: SEEDS=20261011,777 DAYCAP=180 CONVODAYS=100,120,140,160

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242, 99]);
const DAYCAP = parseInt(process.env.DAYCAP || '180', 10);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

const { competent } = require('./policies/competent.js');
const { driveFights, driveContests } = require('./sim-harness.js');

// ---- text-stream capture ----
let capture = [];
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}
(function wrapStream() {
  const _emit = Game.emit, _say = Game.say;
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  if (typeof _say === 'function') {
    Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  }
})();

// ---- helpers ----
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }
function pantryKcal() {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function waveOf(mid) {
  try {
    const d = (Game.data.monsters || []).find(m => m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}
function monsterDisplay(mid) {
  try {
    const d = (Game.data.monsters || []).find(m => m.id === mid);
    return (d && (d.displayName || d.name)) || mid;
  } catch (e) { return mid; }
}

// wave-4/5 signature-mechanic markers: telegraph phrases + cue words from
// the data. A "hit" means the narration SAID it; absence of any hit means
// the monster fought as bare stats (copy-only debt). DO NOT FIX.
function buildSigMarkers() {
  const marks = {};
  try {
    for (const m of (Game.data.monsters || [])) {
      if (m.wave !== 4 && m.wave !== 5) continue;
      const words = [];
      const add = (txt) => {
        if (!txt) return;
        // pick distinctive words (len>=5, not stopwords) from telegraphs/cues
        for (const w of String(txt).toLowerCase().split(/[^a-z]+/)) {
          if (w.length >= 5 && !['there', 'their', 'which', 'about', 'would', 'could', 'should', 'thing', 'things', 'while', 'before', 'after', 'every', 'fight', 'round'].includes(w)) words.push(w);
        }
      };
      add(m.attack && m.attack.telegraph);
      const cues = m.cues || {};
      for (const k of Object.keys(cues)) (cues[k] || []).forEach(add);
      if (m.encounter && m.encounter.phases) m.encounter.phases.forEach(add);
      add(m.vibe);
      marks[m.id] = { name: m.name, words: words.slice(0, 24) };
    }
  } catch (e) {}
  return marks;
}
const SIG4_5 = buildSigMarkers();

// GO INSIDE (deepening fix 2026-10-11)
function goInside(Game) {
  try {
    const t = Game.playerTile ? Game.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = Game.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && Game.enterBuilding) Game.enterBuilding();
    }
  } catch (e) {}
}

// ---- leg extensions ----
function gearUp(Game, ctx) {
  try {
    if ((ctx._gearDay || 0) === gday()) return;
    ctx._gearDay = gday();
    const inv = Game.state.scholar.inventory || [];
    const defs = Game.data.items || [];
    const defOf = (it) => defs.find(d => d.id === (it.itemId || it.id));
    let best = -1, bestBonus = -999, bestSlot = 'melee';
    inv.forEach((it, i) => {
      const d = defOf(it); if (!d || d.class !== 'weapon') return;
      const w = d.weapon || {};
      const b = w.bonus || 0;
      if (b > bestBonus) { bestBonus = b; best = i; bestSlot = (w.range > 1 || /bow|sling/i.test(w.type || '')) ? 'ranged' : 'melee'; }
    });
    if (best >= 0) {
      const eq = Game.state.scholar.equipped || {};
      const cur = eq[bestSlot];
      const curId = cur && (cur.itemId || cur.id);
      const it = inv[best];
      const bestId = it.itemId || it.id;
      if (curId !== bestId) {
        try { Game.equip(best, bestSlot); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
      }
    }
    try { Game.craft('fire_hardened_spear'); } catch (e) {}
    try {
      const worn = new Set(Object.values(Game.state.scholar.equipped || {}).map(e => e && (e.itemId || e.id)));
      for (let i = 0; i < inv.length; i++) {
        const d = defOf(inv[i]); if (!d || !d.armor) continue;
        const id = inv[i].itemId || inv[i].id;
        if (worn.has(id)) continue;
        try { Game.equip(i, 'armor'); ctx.armored = (ctx.armored || 0) + 1; break; } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}
}

// regionalPlay — identical courtship logic to the scale leg (national is the
// deed bar). Copied forward; behavior unchanged.
function regionalPlay(Game, ctx) {
  const day = gday();
  const reg = ctx.regionalLog;
  const note = (ev) => reg.push(Object.assign({ day }, ev));
  try {
    const st = Game.state;
    if (st.pendingCounter) {
      const rich = pantryKcal() > 25000;
      const how = rich ? 'sweeten' : 'accept';
      try { Game.answerCounter(how); note({ ev: 'counter', how }); } catch (e) { note({ ev: 'counter', how, err: String(e && e.message) }); }
    }
    if (st.pendingAccord) {
      try { Game.answerAccord('gift'); note({ ev: 'accord', how: 'gift', scale: Game.scaleRank() }); } catch (e) { note({ ev: 'accord', how: 'gift', err: String(e && e.message) }); }
    }
    if (st.pendingNational) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { Game.answerNationalChoice(pick); note({ ev: 'national', shape, how: pick, scale: Game.scaleRank() }); } catch (e) { note({ ev: 'national', shape, how: pick, err: String(e && e.message) }); }
    }
    if (st.pendingGlobal) {
      try { Game.answerGlobalChoice('feast'); note({ ev: 'global', how: 'feast', scale: Game.scaleRank() }); } catch (e) { note({ ev: 'global', how: 'feast', err: String(e && e.message) }); }
    }
    if (st.pendingSwitchboard) {
      try {
        const cands = Game.switchboardCandidates ? Game.switchboardCandidates() : [];
        if (cands.length && Game.appointSwitchboard) { Game.appointSwitchboard(cands[0].id); note({ ev: 'switchboard', who: cands[0].id }); }
      } catch (e) { note({ ev: 'switchboard', err: String(e && e.message) }); }
    }
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      const lid = link.id;
      if (link.pendingDefenseCall) {
        const canSend = popAlive() >= 5;
        try {
          if (Game.answerDefenseCall) Game.answerDefenseCall(lid, canSend ? 'send' : 'refuse');
          note({ ev: 'defenseCall', link: lid, how: canSend ? 'send' : 'refuse' });
        } catch (e) { note({ ev: 'defenseCall', link: lid, err: String(e && e.message) }); }
      }
      if (link.pendingTradeCall) {
        const canSend = pantryKcal() > 10000;
        try {
          if (Game.answerTradeCall) Game.answerTradeCall(lid, canSend ? 'send' : 'refuse');
          note({ ev: 'tradeCall', link: lid, how: canSend ? 'send' : 'refuse' });
        } catch (e) { note({ ev: 'tradeCall', link: lid, err: String(e && e.message) }); }
      }
      if (link.subordinate !== 'haven') continue;
      if (link.pendingDemand) {
        const rich = pantryKcal() > 12000;
        try { Game.answerDemand(link.id, rich); note({ ev: 'demand', link: link.id, how: rich ? 'honor' : 'refuse' }); }
        catch (e) { note({ ev: 'demand', link: link.id, err: String(e && e.message) }); }
      }
      const week = (Game._week ? Game._week() : 0);
      if (link.tributePaidWeek !== week && pantryKcal() > 15000) {
        try { const paid = Game.payTribute(link.id); note({ ev: 'tribute', link: link.id, paid }); }
        catch (e) { note({ ev: 'tribute', link: link.id, err: String(e && e.message) }); }
      }
    }
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && !st.pendingNational && pantryKcal() > 12000) {
      const active = links.filter(l => l && l.status === 'active');
      const covN = active.filter(l => l.kind === 'covenant').length;
      const trN = active.filter(l => l.kind === 'trade').length;
      ctx._propCool = ctx._propCool || {};
      const coolOk = (vid, kind) => ((ctx._propCool[vid + ':' + kind] || 0) + 7 <= day);
      const markCool = (vid, kind) => { ctx._propCool[vid + ':' + kind] = day; };
      const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage(v) && !Game.linkWith(v.id));
      if (!cands.length) { if ((ctx._noVillageDay || 0) + 10 <= day) { ctx._noVillageDay = day; note({ ev: 'propose', result: 'no-known-villages' }); } return; }
      if (!active.length) {
        const t = cands.find(v => coolOk(v.id, 'link')) || null;
        if (t) {
          markCool(t.id, 'link');
          try {
            const r = Game.proposeLink(t.id);
            note({ ev: 'propose', target: t.id, name: t.name, result: r == null ? 'declined' : (r === 'counter' ? 'counter' : 'linked') });
          } catch (e) { note({ ev: 'propose', target: t.id, err: String(e && e.message) }); }
        }
        return;
      }
      if (covN < 3 || trN < 3) {
        for (const t of cands) {
          const kind = covN < 3 && coolOk(t.id, 'covenant') ? 'covenant' : (trN < 3 && coolOk(t.id, 'trade') ? 'trade' : null);
          if (!kind) continue;
          markCool(t.id, kind);
          try {
            const r = kind === 'covenant' ? Game.proposeCovenant(t.id) : Game.proposeTrade(t.id);
            note({ ev: 'proposePeer', target: t.id, name: t.name, kind, result: r == null ? 'declined' : (r === 'counter' ? 'counter' : 'linked') });
          } catch (e) { note({ ev: 'proposePeer', target: t.id, kind, err: String(e && e.message) }); }
          break;
        }
      }
    }
  } catch (e) {}
}

function knowledgePlay(Game, ctx) {
  const day = gday();
  if ((ctx._btDay || 0) === day) return;
  ctx._btDay = day;
  if (day % 5 !== 0) return;
  try {
    const slain = Game.state.villageSlain || {};
    const known = Game.state.monsterCounters || {};
    for (const type of Object.keys(slain)) {
      if ((slain[type] || 0) >= 2 && !known[type]) {
        const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
        const vid = roster.find(id => { try { return !Game.getPerson(id).dead; } catch (e) { return false; } });
        if (vid) {
          const r = Game.askAbout(vid, 'beasttricks');
          ctx.beasttricksTaught = (ctx.beasttricksTaught || 0) + ((r && r.taught) ? 1 : 0);
          ctx.beasttricksAsked = (ctx.beasttricksAsked || 0) + 1;
          break;
        }
      }
    }
  } catch (e) {}
}

// ENDGAME daily: sentiment channeling (devotion lane) + feast hosting.
// A deed-seeking player arms the feast surge: channel a keepsake every day
// once taught (focused practice -> surgeResonance), then hold a feast when
// armed and rich, then fight while feasted.
function endgameDaily(Game, ctx) {
  const day = gday();
  try {
    if ((ctx._sentDay || 0) !== day) {
      ctx._sentDay = day;
      // channel a keepsake: the System's demo showed how; a competent
      // player practices. Drives the devotion lane (surgeResonance>=35)
      // and the mastery lane (focused practice XP).
      if (Game.sentimentTaught && Game.sentimentTaught() && Game.channelReadyKeepsakes && Game.channelSentiment) {
        try {
          const ready = Game.channelReadyKeepsakes();
          if (ready && ready.length) {
            Game.channelSentiment(ready[0]);
            ctx.channeled = (ctx.channeled || 0) + 1;
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  try {
    // hold a feast when the surge is armed, the pantry is rich, at haven,
    // not already feasted, and no feast in the last 7 days (feasts are
    // expensive: 1500+ kcal + an evening).
    const s = Game.state.scholar, pg = Game.progState ? Game.progState() : {};
    const armed = !!(s && s.prog && s.prog.feastSurge);
    const feasted = Game.feastedActive ? Game.feastedActive() : false;
    if (armed && !feasted && pantryKcal() > 25000 && day - (ctx._feastDay || 0) >= 7 && Game.hostFeast) {
      let atHaven = true;
      try { atHaven = Game.playerAtHaven ? Game.playerAtHaven() : true; } catch (e) {}
      if (atHaven) {
        try {
          Game.hostFeast();
          ctx._feastDay = day;
          ctx.feasts = (ctx.feasts || 0) + 1;
        } catch (e) {}
      }
    }
  } catch (e) {}
}

function finalizeFight(ctx) {
  const rec = ctx._fr;
  ctx._fr = null;
  if (!rec) return;
  try {
    const f = rec.obj;
    rec.rounds = f.round;
    rec.result = f.result;
    rec.over = !!f.over;
    rec.endHp = (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, mid: x.monsterId || null, hp: Math.round(x.hp || 0), fled: !!x.fled }));
    const slice = capture.slice(rec.capStart).join('\n');
    rec.dmgLines = (slice.match(/\(\d+ damage\)/g) || []).length;
    rec.lines = slice.split('\n').filter(l => /damage|STRIKE|strikes|hits|miss|dodge|flee|funeral|phase|heresy/i.test(l)).slice(0, 60);
    // signature-mechanic markers for wave-4/5 monsters: which telegraph/cue
    // words from the DATA actually appeared in the narration. A hit = the
    // narration SAID it. Absence = fought as bare stats (copy-only debt).
    rec.sigHits = {};
    for (const m of rec.monsters) {
      const marks = SIG4_5[m.mid];
      if (!marks) continue;
      const low = slice.toLowerCase();
      const hits = marks.words.filter(w => low.indexOf(w) >= 0);
      if (hits.length) rec.sigHits[m.mid] = { name: marks.name, words: hits.slice(0, 8) };
    }
    ctx.fightsLog.push(rec);
  } catch (e) {
    ctx.fightsLog.push({ id: rec.id, err: String(e && e.message), monsters: rec.monsters });
  }
}

const policy = Object.create(competent);
policy.setup = function (G, ctx) {
  competent.setup(G, ctx);
  ctx.fightsLog = [];
  ctx.regionalLog = [];
  ctx._fr = null;
};
policy.upkeep = function (G, ctx) {
  goInside(G);
  competent.upkeep(G, ctx);
};
policy.daily = function (G, ctx) {
  goInside(G);
  competent.daily(G, ctx);
  gearUp(G, ctx);
  regionalPlay(G, ctx);
  knowledgePlay(G, ctx);
  endgameDaily(G, ctx);
};

// DEED-SEEKING fight. The table needs the 5/5/4/3/2 deed bars — fought,
// not necessarily killed (fleeing counts, MONSTER-WAVES.md). But the wave-5
// unlock needs wave-4 KILLS (3 ledger points). So:
//  - w1/w2/w3: fight while hp>=0.5, flee below (wave-3 braver when feasted).
//  - w4/w5: fight a few rounds for the deed bar (flee with dignity), unless
//    FEASTED — then stay for the kill (ledger points). Never an honest
//    death: flee at hp<0.5 or when hopelessly outmatched.
policy.fight = function (G, ctx) {
  try {
    const f = G.tbfight;
    if (ctx._fr && (!f || f.id !== ctx._fr.id)) finalizeFight(ctx);
    if (!f || f.over || !G.tbIsPlayerTurn()) return false;
    if (!ctx._fr || ctx._fr.id !== f.id) {
      const mons = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      ctx._fr = {
        id: f.id, obj: f, day: gday(), capStart: capture.length, roundsSeen: 0,
        monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), name: monsterDisplay(m.monsterId), hp0: m.maxHp || m.hp })),
      };
      ctx.fightsStarted = (ctx.fightsStarted || 0) + 1;
    }
    const p = G.tbFighter('p');
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    ctx._fr.roundsSeen = Math.max(ctx._fr.roundsSeen, f.round || 0);
    const endTurn = () => {
      try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
    };
    const flee = (why) => {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const tx = px <= 4 ? 0 : 8;
        try { G.tbPlayerMove(tx, py); ctx.fled = (ctx.fled || 0) + 1; ctx['fled_' + (why || 'x')] = (ctx['fled_' + (why || 'x')] || 0) + 1; } catch (e) {}
      } catch (e) {}
      endTurn();
      return true;
    };
    if (ctx._fightObjE !== f) {
      ctx._fightObjE = f;
      try {
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let totalMhp = 0, maxWave = 1;
        for (const m of monsters) {
          totalMhp += m.maxHp || m.hp || 0;
          maxWave = Math.max(maxWave, waveOf(m.monsterId));
        }
        const pmax = p.maxHp || 100;
        const feasted = G.feastedActive ? G.feastedActive() : false;
        let outmatched = false;
        if (maxWave <= 3) {
          // waves 1-3: competent bravery. Wave 3 braver when feasted (ledger kills).
          outmatched = (maxWave >= 2 && totalMhp > 3 * pmax && !feasted) ||
            (maxWave >= 2 && hpPct < 0.7 && !feasted) ||
            (maxWave < 2 && totalMhp > 3.5 * pmax) ||
            hpPct < 0.5;
        } else {
          // wave 4/5: deed-seeking. Fought (then flee) fills the deed bar;
          // only fight to KILL when feasted. Never die honestly.
          outmatched = totalMhp > 8 * pmax || hpPct < 0.5 || (monsters.length > 2 && hpPct < 0.85);
          if (!outmatched && !feasted) {
            // deed dip: 3 rounds of real fighting, then leave alive.
            if ((f.round || 0) >= 4) { return flee('deed-dip'); }
          }
        }
        ctx._outE = { maxWave, outmatched, feasted };
        if (outmatched && monsters.length) {
          return flee('outmatched');
        }
      } catch (e) {}
    }
    if (hpPct < 0.5) return flee('hurt');
    // wave-4/5 deed-dip check on later turns too (round counter moves)
    if (ctx._outE && ctx._outE.maxWave >= 4 && !ctx._outE.feasted) {
      const feastedNow = G.feastedActive ? G.feastedActive() : false;
      if (!feastedNow && (f.round || 0) >= 4) return flee('deed-dip');
    }
    const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
    if (!alive.length) return false;
    alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    const tgt = alive[0];
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    try {
      const w = (G.equippedWeapon && G.equippedWeapon()) || { range: 1 };
      const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
      if (d0 > (w.range || 1)) {
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tmx + dx, cy = tmy + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) { try { G.tbPlayerMove(bx, by); } catch (e) {} ctx.closed = (ctx.closed || 0) + 1; }
        endTurn();
        return true;
      }
    } catch (e) {}
    try { G.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
    endTurn();
    return true;
  } catch (e) { return false; }
};

// ---- conversation driver (scale leg's engage-first, kept) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}

function runConversation(seed, day, vid) {
  const fp = `/tmp/journey-endgame-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = Game.npcMood ? Game.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log(`opening menu (${(r0.choices || []).length} choices):`);
    for (const ch of (r0.choices || [])) log(`  [${ch.id}] ${String(ch.label || '').slice(0, 120)}`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      log('');
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = Game.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    log('');
    log('--- END ---');
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    log(`transcript entries: ${t.length}`);
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
    const allText = themLines.join('\n');
    if (/\(last time\)/i.test(allText)) log('!! leaked "(last time)" internal note');
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

// ---- telemetry helpers ----
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function contestEvents() {
  try {
    return (Game.state.telemetry || []).filter(e => e && (e.type === 'contest_fired' || e.type === 'contest_end' || e.type === 'show_aired'));
  } catch (e) { return []; }
}
function popAlive() {
  try { return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length; } catch (e) { return null; }
}
function waveNow() { try { return Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { return null; } }
function scaleNow() { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } }
function knownCounts() {
  try {
    return {
      plants: Object.keys((Game.state.codex || {}).plants || {}).length,
      skills: Object.keys((Game.state.codex || {}).skills || {}).length,
      monsters: Object.keys((Game.state.codex || {}).monsters || {}).length,
      counters: Object.keys((Game.state.monsterCounters || {})).length,
    };
  } catch (e) { return null; }
}
function linksSummary() {
  try {
    const links = Game.hierarchyState() || [];
    return links.map(l => ({ id: l.id, other: l.primary === 'haven' ? l.subordinate : l.primary, status: l.status, trust: l.trust, kind: l.kind }));
  } catch (e) { return null; }
}
function scholarGear() {
  try {
    const w = Game.equippedWeapon ? Game.equippedWeapon() : {};
    const ab = Object.keys((Game.state.scholar || {}).abilities || {});
    const slots = Object.keys((Game.state.scholar || {}).abilitySlots || {});
    return { weapon: w.name || '?', unarmed: !!w.unarmed, abilities: ab, slots: slots.length };
  } catch (e) { return null; }
}
function deedBreakdown() {
  try { return Game.deedGateReady ? Game.deedGateReady() : null; } catch (e) { return null; }
}
function wavesFacedCounts() {
  try {
    const faced = (Game.deedState ? Game.deedState() : {}).wavesFaced || {};
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const mid of Object.keys(faced)) { const w = faced[mid] | 0; if (c[w] !== undefined) c[w]++; }
    return c;
  } catch (e) { return null; }
}
function endgameFlags() {
  try {
    const pg = Game.progState ? Game.progState() : {};
    const s = Game.state.scholar || {};
    return {
      arc: pg.arc, sentimentTaught: !!pg.sentimentTaught,
      feastSurgeUsed: !!(s.prog && s.prog.feastSurgeUsed),
      feastSurgeArmed: !!(s.prog && s.prog.feastSurge),
      surgeResonance: pg.surgeResonance || 0,
      stage: Game.integrationStage ? Game.integrationStage() : null,
      crises: Object.keys(pg.crises || {}),
      tableWaiting: !!pg.tableWaiting, tableDone: !!pg.tableDone,
      tableChoices: !!s.tableChoices,
      endingFrame: Game.endingFrame ? Game.endingFrame() : null,
      viewership: Game.state.viewership != null ? Game.state.viewership : null,
    };
  } catch (e) { return null; }
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    let mood = null;
    try { mood = Game.npcMood ? Game.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

const CONVO_DAYS = (process.env.CONVODAYS ? process.env.CONVODAYS.split(',').map(s => parseInt(s, 10)) : [100, 120, 140, 160]);

async function runSeed(seed) {
  resetRng(seed);
  capture = [];
  const ctx = {};
  console.log(`\n########## SEED ${seed} ##########`);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (policy.setup) { try { policy.setup(Game, ctx); } catch (e) {} }

  const pid = Game.villagerId;
  const pp = person(pid);
  console.log('SPAWN: ' + JSON.stringify({
    seed, scholarName: vname(pid), occupation: pp.occupation || null,
    temperament: pp.temperament || null,
    rosterCount: (Game.state.village.roster || []).length,
  }));

  const series = [];
  const transcriptFiles = [];
  const contestLog = [];
  const waveLog = [];
  const scaleLog = [];
  let lastContestCount = 0;
  let lastWave = null;
  let lastScale = null;
  let overAt = null;
  let maxGameDay = 0;
  let tableOutcome = null;
  let lastDeedOk = false;

  for (let day = 1; day <= DAYCAP; day++) {
    const gd = gday();
    maxGameDay = Math.max(maxGameDay, gd);

    const w = waveNow();
    if (w !== lastWave) {
      waveLog.push({ day: gd, wave: w, ledger: JSON.stringify(Game.state.waveLedger || {}), villageSlain: JSON.stringify(Game.state.villageSlain || {}) });
      console.log(`*** day ${gd}: WAVE -> ${w} (ledger: ${JSON.stringify(Game.state.waveLedger || {})})`);
      lastWave = w;
    }
    const sc = scaleNow();
    if (sc !== lastScale) {
      scaleLog.push({ day: gd, scale: sc, wave: waveNow(), links: linksSummary() });
      console.log(`*** day ${gd}: SCALE -> ${sc} (wave ${waveNow()})`);
      lastScale = sc;
    }

    // final live choice: a real player makes it. Choose option 0, record.
    try {
      const tc = Game.state.scholar && Game.state.scholar.tableChoices;
      if (tc && !tableOutcome) {
        const opt = (tc.options || [])[0];
        const frame = tc.frame || (Game.endingFrame ? Game.endingFrame() : '?');
        if (opt) {
          Game.chooseTableOption(opt.id);
          tableOutcome = { day: gd, frame, choice: opt.id, label: opt.label };
          console.log(`*** day ${gd}: TABLE CHOICE made — frame=${frame} choice=${opt.id} ("${opt.label}")`);
        }
      }
    } catch (e) { console.log('table-choice ERROR: ' + (e && e.message)); }
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }

    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) { console.log('villager-pick ERROR: ' + (e && e.message)); }
      if (vid) {
        try {
          const fp = runConversation(seed, gd, vid);
          transcriptFiles.push(fp);
          console.log(`day ${gd}: convo with ${vname(vid)} -> ${fp}`);
        } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
      }
    }

    // three day-parts
    for (let p = 0; p < 3; p++) {
      try { if (policy.upkeep) policy.upkeep(Game, ctx); } catch (e) {}
      driveFights(Game, policy, ctx);
      driveContests(Game, policy, ctx);
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (ctx._fr) finalizeFight(ctx);
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }

    try { if (policy.daily) policy.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, policy, ctx);

    const ce = contestEvents();
    if (ce.length > lastContestCount) {
      for (const ev of ce.slice(lastContestCount)) {
        contestLog.push({ day: gd, type: ev.type, id: ev.id, who: ev.who, outcome: ev.outcome, why: ev.why });
        console.log(`*** day ${gd}: ${ev.type} id=${ev.id || '?'} who=${ev.who || '?'} outcome=${ev.outcome || '?'}`);
      }
      lastContestCount = ce.length;
    }

    const deed = deedBreakdown();
    if (deed && deed.ok && !lastDeedOk) {
      console.log(`*** day ${gd}: DEED GATE OK (w ${deed.w1}/${deed.w2}/${deed.w3}/${deed.w4}/${deed.w5} contests ${deed.contestsN} crises ${deed.crisesN} rank ${deed.rank})`);
      lastDeedOk = true;
    }

    series.push({
      day: gd, pantryKcal: pantryKcal(),
      pop: popAlive(), wave: waveNow(), scale: scaleNow(),
      deaths: deathsSoFar().length,
      scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
      scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
      known: knownCounts(),
      gear: scholarGear(),
      deed: deed ? { ok: deed.ok, w1: deed.w1, w2: deed.w2, w3: deed.w3, w4: deed.w4, w5: deed.w5, contests: deed.contestsN, crises: deed.crisesN, rank: deed.rank } : null,
      faced: wavesFacedCounts(),
      flags: endgameFlags(),
    });
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const census = buildCensus();
  const censusPath = `/tmp/journey-endgame-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, maxGameDay, transcriptFiles, series, census, contestLog, waveLog, scaleLog, overAt, tableOutcome,
    regionalLog: ctx.regionalLog || [],
    fights: (ctx.fightsLog || []).map(f => ({
      day: f.day, rounds: f.rounds, result: f.result, over: f.over,
      monsters: f.monsters, endHp: f.endHp, dmgLines: f.dmgLines, sigHits: f.sigHits,
      sample: (f.lines || []).slice(0, 24),
    })),
    known: knownCounts(),
    scale: scaleNow(),
    links: linksSummary(),
    foreignPolities: (function () { try { return Game.foreignPolities(); } catch (e) { return null; } })(),
    otherVillages: (function () { try { return (Game.state.otherVillages || []).map(v => ({ id: v.id, name: v.name, known: Game.knowsVillage(v), opinion: v.opinion, link: !!Game.linkWith(v.id) })); } catch (e) { return null; } })(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    waveKills: (function () { try { return Object.assign({}, Game.state.waveKills); } catch (e) { return null; } })(),
    waveLedger: (function () { try { return Object.assign({}, Game.state.waveLedger); } catch (e) { return null; } })(),
    villageSlain: (function () { try { return Object.assign({}, Game.state.villageSlain); } catch (e) { return null; } })(),
    monsterCounters: (function () { try { return Object.assign({}, Game.state.monsterCounters); } catch (e) { return null; } })(),
    deed: deedBreakdown(),
    flags: endgameFlags(),
    gear: scholarGear(),
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fled_outmatched: ctx.fled_outmatched || 0,
      fled_deedDip: ctx['fled_deed-dip'] || 0, fled_hurt: ctx.fled_hurt || 0,
      fightsStarted: ctx.fightsStarted || 0, geared: ctx.geared || 0, armored: ctx.armored || 0,
      choseAbility: ctx.choseAbility || 0, looted: ctx.looted || 0, donated: ctx.donated || 0,
      beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
      talked: ctx.talked || 0, taught: ctx.taught || 0,
      channeled: ctx.channeled || 0, feasts: ctx.feasts || 0,
    },
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | maxDay=${maxGameDay} | over=${overAt || 'no'} | table=${tableOutcome ? tableOutcome.frame + '/' + tableOutcome.choice : 'no'} | contests=${contestLog.length} | fights=${(ctx.fightsLog || []).length} | transcripts=${transcriptFiles.length} | scale=${scaleNow()} wave=${waveNow()}`);
  return { seed, censusPath, transcriptFiles, series, contestLog, overAt, maxGameDay, tableOutcome };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const r of results) {
    console.log(`seed ${r.seed}: maxDay=${r.maxGameDay} | over=${r.overAt || 'no'} | table=${r.tableOutcome ? r.tableOutcome.frame + '/' + r.tableOutcome.choice : 'no'} | contests=${(r.contestLog || []).length} | census=${r.censusPath} ${r.fatal ? '| FATAL: ' + r.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
