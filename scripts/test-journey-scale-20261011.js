#!/usr/bin/env node
// Journey leg: SCALE (days 80-140) — competent-player playthrough.
// Full games day 1->140 (most honest); assessment focuses on days 80-140:
// the scale ladder (regional -> national -> global), foreign polities,
// wave 3-4 fights (fought blow-by-blow, signature-mechanic markers), and
// whether a competent player can REACH scale content at all.
// Extends the competent policy (scripts/policies/competent.js) with leg
// behaviors:
//  - SURVIVAL-FIRST fights: wave 2+ fights taken only with overwhelming
//    advantage; a competent player avoids deadly fights and feeds the
//    village (deepening already proved wave-2 fights are real).
//  - gear-up (craft/equip best-effort),
//  - scale-courtship play: first link (regional accord), then peer links
//    (covenant / trade) to every known village — the national bar is 3
//    same-kind peers. Answer counters (sweeten when affordable), pay tribute,
//    answer demands, answer national/global beats (pact/sign; feast), answer
//    defense/trade calls aloud.
//  - knowledge-economy play (beasttricks askAbout when teachable).
//
// Text capture ON so transcripts, fight narration, and scale beats are
// readable. Evidence: /tmp/journey-scale-*.{json,txt}.
//
// Usage: node scripts/test-journey-scale-20261011.js   (seeds 20261011, 777, 424242, 99)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242, 99]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
// ROAD: which national road the courtship strategy pushes. 'covenant' (default,
// prior runs) or 'trade' (r2: the charter beat answered 'bargain', 1 covenant
// link kept for a played covenant crisis).
const ROAD = (process.env.ROAD || 'covenant').toLowerCase();

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

// wave-3 signature-mechanic markers to look for in fight narration
const SIG_MARKERS = {
  spool: ['reel', '🎞', 'RECORD', 'REPLAY'],
  terms_of_service: ['clause', '§', 'fine print'],
  redactor: ['REDACT', 'redact'],
  callback: ['funeral', 'NOT ', 'goodbye'],
  buffering: ['afterimage', 'past', 'will step'],
  ad_break: ['ad break', 'SKIP', 'sponsor'],
  chorus_line: ['downbeat', 'beat', '💃'],
  focus_group: ['LOVED', 'HATED', 'murmur'],
  gavel: ['trial', 'verdict', 'ACCUS', 'OBJECT'],
};

// GO INSIDE (deepening fix 2026-10-11): travelTo leaves the scholar OUTSIDE
// the hall (on the grounds); havenStoresAccess() is 'none' until the player
// taps the lodge (enterBuilding). The first deepening pass never went inside,
// so takeFromPantry/donateToPantry refused all run ("The pantry is in the
// hall. Your hands are not.") and the bearer starved next to a full pantry.
// A competent player goes inside. Idempotent: refuses honestly when inside.
function goInside(Game) {
  try {
    const t = Game.playerTile ? Game.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = Game.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && Game.enterBuilding) Game.enterBuilding();
    }
  } catch (e) {}
}

// ---- leg extensions to the competent policy ----
// SPEAR CRAFT (journey-scale r3 2026-10-11): weapon/armor equipping now lives
// in the shared competent policy's ammo-aware gearUp (runs 3x/day via
// upkeep). This hook keeps the harness's one unique contribution: best-effort
// spear crafting (knowledge-gated; honest fail is fine).
function gearUp(Game, ctx) {
  try {
    if ((ctx._spearDay || 0) === gday()) return;
    ctx._spearDay = gday();
    try { Game.craft('fire_hardened_spear'); } catch (e) {}
  } catch (e) {}
}

function regionalPlay(Game, ctx) {
  const day = gday();
  const reg = ctx.regionalLog;
  const note = (ev) => reg.push(Object.assign({ day }, ev));
  try {
    const st = Game.state;
    // answer pending offers/beats — a competent player answers, never leaves mail unread
    if (st.pendingCounter) {
      const rich = pantryKcal() > 25000;
      const how = rich ? 'sweeten' : 'accept';
      try { Game.answerCounter(how); note({ ev: 'counter', how }); } catch (e) { note({ ev: 'counter', how, err: String(e && e.message) }); }
    }
    if (st.pendingAccord) {
      const cap0 = capture.length;
      try { Game.answerAccord('gift'); note({ ev: 'accord', how: 'gift', scale: Game.scaleRank() }); } catch (e) { note({ ev: 'accord', how: 'gift', err: String(e && e.message) }); }
      note({ ev: 'accord-text', lines: capture.slice(cap0, cap0 + 6) });
    }
    if (st.pendingNational) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: (ROAD === 'trade' ? 'bargain' : 'sign') }[shape] || 'feast';
      const cap0 = capture.length;
      try { Game.answerNationalChoice(pick); note({ ev: 'national', shape, how: pick, scale: Game.scaleRank(), lines: capture.slice(cap0, cap0 + 8) }); } catch (e) { note({ ev: 'national', shape, how: pick, err: String(e && e.message) }); }
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
    // demands + tribute + defense/trade calls on all active links
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active') continue;
      const lid = link.id;
      if (link.pendingDefense) {
        const canSend = popAlive() >= 5;
        try {
          if (Game.answerDefenseCall) Game.answerDefenseCall(lid, canSend ? 'send' : 'refuse');
          note({ ev: 'defenseCall', link: lid, how: canSend ? 'send' : 'refuse' });
        } catch (e) { note({ ev: 'defenseCall', link: lid, err: String(e && e.message) }); }
      }
      if (link.pendingTradeCall) {
        const canSend = pantryKcal() > 10000;
        const capT = capture.length;
        try {
          if (Game.answerTradeCall) Game.answerTradeCall(lid, canSend ? 'send' : 'refuse');
          note({ ev: 'tradeCall', link: lid, how: canSend ? 'send' : 'refuse', lines: capture.slice(capT, capT + 4) });
        } catch (e) { note({ ev: 'tradeCall', link: lid, err: String(e && e.message) }); }
      }
      // covenant/charter crisis — answered 'concede' (buys the league aloud)
      if (link.pendingCovenantCrisis) {
        const capC = capture.length;
        try {
          const r = Game.answerCovenantCrisis ? Game.answerCovenantCrisis(lid, 'concede') : null;
          note({ ev: 'crisis', link: lid, kind: link.kind, how: 'concede', result: r, lines: capture.slice(capC, capC + 6) });
          ctx._crisisPlayed = true;
        } catch (e) { note({ ev: 'crisis', link: lid, err: String(e && e.message) }); }
      }
      // HARNESS-DRIVEN (trade road): if no crisis has fired naturally by day
      // 95 on the covenant link, trigger one so the beat is played, not
      // skipped. Logged as harness-triggered.
      if (!ctx._crisisPlayed && day >= 95 && link.kind === 'covenant' && !link.pendingCovenantCrisis) {
        try {
          const r = Game.covenantCrisis ? Game.covenantCrisis(lid, 'strain') : null;
          if (r && r !== 'pending') note({ ev: 'crisis-trigger', link: lid, how: 'harness', result: r });
        } catch (e) { note({ ev: 'crisis-trigger', link: lid, err: String(e && e.message) }); }
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
    // SCALE COURTSHIP (scale leg): the national bar is 3 same-kind peer
    // links (covenant or trade). ROAD selects the pushed road: 'covenant'
    // (mutual defense first, then trade) or 'trade' (charter first, then
    // exactly 1 covenant link — kept so a covenant crisis can be played).
    // Strategy:
    //  1. day>=25: first link via proposeLink (regional accord) — the courtship climb.
    //  2. once ANY link is active: propose peer links toward the road's bar.
    //  COOLDOWN: a declined village isn't re-asked for 7 days.
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
        // step 1: first link — courtship climb
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
      // step 2: peer-link push toward national (road first, then the other
      // kind — the trade road keeps exactly 1 covenant link for a crisis)
      const roadKind = ROAD === 'trade' ? 'trade' : 'covenant';
      const otherKind = ROAD === 'trade' ? 'covenant' : 'trade';
      const roadN = roadKind === 'trade' ? trN : covN;
      const otherN = roadKind === 'trade' ? covN : trN;
      const otherTarget = roadKind === 'trade' ? 1 : 3;
      if (roadN < 3 || otherN < otherTarget) {
        for (const t of cands) {
          const kind = roadN < 3 && coolOk(t.id, roadKind) ? roadKind : (otherN < otherTarget && coolOk(t.id, otherKind) ? otherKind : null);
          if (!kind) continue;
          markCool(t.id, kind);
          try {
            const r = kind === 'covenant' ? Game.proposeCovenant(t.id) : Game.proposeTrade(t.id);
            note({ ev: 'proposePeer', target: t.id, name: t.name, kind, result: r == null ? 'declined' : (r === 'counter' ? 'counter' : 'linked') });
          } catch (e) { note({ ev: 'proposePeer', target: t.id, kind, err: String(e && e.message) }); }
          break; // one proposal per day — courtship takes time
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
    rec.lines = slice.split('\n').filter(l => /damage|STRIKE|strikes|hits|miss|dodge|flee/i.test(l)).slice(0, 60);
    // signature-mechanic markers for wave-3 monsters
    rec.sigHits = {};
    for (const m of rec.monsters) {
      const marks = SIG_MARKERS[m.mid] || [];
      const hits = marks.filter(mk => slice.toLowerCase().indexOf(mk.toLowerCase()) >= 0);
      if (hits.length) rec.sigHits[m.mid] = hits;
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
};
// DEEPENING fight: a mid-game competent player takes wave 2-3 fights that are
// winnable (healthy, decent odds) — verifying they're fought blow-by-blow —
// and still walks away from bad ones. Flee logic is relaxed vs competent:
// flee only when truly outmatched or hurt.
policy.fight = function (G, ctx) {
  const TR = process.env.FIGHTTRACE ? (m) => { try { console.error('[FIGHTTRACE] ' + m); } catch (e) {} } : null;
  if (TR) { try { const _f = G.tbfight; TR('enter: fight=' + (_f ? _f.id + ' round=' + _f.round : 'none') + ' turn=' + (G.tbIsPlayerTurn ? G.tbIsPlayerTurn() : '?')); } catch (e) {} }
  try {
    const f = G.tbfight;
    if (ctx._fr && (!f || f.id !== ctx._fr.id)) finalizeFight(ctx);
    if (!f || f.over || !G.tbIsPlayerTurn()) { if (TR) TR('early-false: no fight/over/not-turn'); return false; }
    if (!ctx._fr || ctx._fr.id !== f.id) {
      const mons = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      ctx._fr = {
        id: f.id, obj: f, day: gday(), capStart: capture.length,
        monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), name: monsterDisplay(m.monsterId), hp0: m.maxHp || m.hp })),
      };
      ctx.fightsStarted = (ctx.fightsStarted || 0) + 1;
    }
    const p = G.tbFighter('p');
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    const endTurn = () => {
      try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
    };
    // FLEE IS A TWO-STEP VERB (break-it turtle 2026-10-08): reach the grid
    // edge step by step, then push through it with tbBarrierExit. The old
    // policy tried a single 4-tile teleport to the edge: when moveLeft
    // couldn't cover the path the move refused silently every turn, and a
    // 0.22-HP player stood 2 tiles from a turtle that can't chase for
    // 113k rounds (journey-scale r2 2026-10-11). Walk, then push.
    // fled counts successful edge-ward moves; barrierExits counts actual
    // push-throughs.
    const flee = () => {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const distL = px, distR = 8 - px, distU = py, distD = 8 - py;
        const m = Math.min(distL, distR, distU, distD);
        let sx = px, sy = py;
        if (m === distL && px > 0) sx = px - 1; else if (m === distR && px < 8) sx = px + 1;
        else if (m === distU && py > 0) sy = py - 1; else if (m === distD && py < 8) sy = py + 1;
        try { if (G.tbPlayerMove(sx, sy)) ctx.fled = (ctx.fled || 0) + 1; } catch (e) {}
        try {
          const q = G.tbFighter('p');
          if (q && G.tbIsPlayerTurn && G.tbIsPlayerTurn()) {
            if (q.mx === 0) { if (G.tbBarrierExit(-1, 0)) ctx.barrierExits = (ctx.barrierExits || 0) + 1; }
            else if (q.mx === 8) { if (G.tbBarrierExit(1, 0)) ctx.barrierExits = (ctx.barrierExits || 0) + 1; }
            else if (q.my === 0) { if (G.tbBarrierExit(0, -1)) ctx.barrierExits = (ctx.barrierExits || 0) + 1; }
            else if (q.my === 8) { if (G.tbBarrierExit(0, 1)) ctx.barrierExits = (ctx.barrierExits || 0) + 1; }
          }
        } catch (e) {}
      } catch (e) {}
      try {
        if (G.tbfight && !G.tbfight.over && G.tbIsPlayerTurn && G.tbIsPlayerTurn()) endTurn();
      } catch (e) {}
      return true;
    };
    // NEW-FIGHT ASSESSMENT (scale leg): survival first. A competent
    // player at this stage avoids deadly fights and feeds the village —
    // deepening already proved wave-2 fights are fought blow-by-blow.
    // Take wave 1 at decent odds, wave 2-3 only with overwhelming advantage,
    // wave 4+ never (walk away from bad ones).
    if (ctx._fightObjD !== f) {
      ctx._fightObjD = f;
      try {
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let totalMhp = 0, maxWave = 1;
        for (const m of monsters) {
          totalMhp += m.maxHp || m.hp || 0;
          maxWave = Math.max(maxWave, waveOf(m.monsterId));
        }
        const pmax = p.maxHp || 100;
        const outmatched = maxWave >= 4 ||
          (maxWave >= 2 && totalMhp > 1.5 * pmax) ||
          (maxWave >= 2 && hpPct < 0.75) ||
          (maxWave < 2 && totalMhp > 3 * pmax) ||
          hpPct < 0.5;
        if (outmatched && monsters.length) {
          ctx.fledDeepening = (ctx.fledDeepening || 0) + 1;
          return flee();
        }
      } catch (e) {}
    }
    if (hpPct < 0.45) return flee();
    // TELEGRAPH DODGE (journey-scale r3 2026-10-11): the grid IS the
    // telegraph — Game.cellWarned reads the highlighted danger cells. The
    // Highbeam Deer's whole counter is MOVE ("the freeze is the whole
    // tell"); the old policy stood on warned cells for 34 rounds eating a
    // full 6-tick beam. A competent player steps off the lit squares.
    try {
      const px0 = p.mx != null ? p.mx : 4, py0 = p.my != null ? p.my : 4;
      if (G.cellWarned && G.cellWarned(px0, py0)) {
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null;
        for (let r = 1; r <= 2 && bx == null; r++) {
          for (let dx = -r; dx <= r && bx == null; dx++) for (let dy = -r; dy <= r; dy++) {
            if (!dx && !dy) continue;
            const cx = px0 + dx, cy = py0 + dy;
            if (cx < 1 || cx > 7 || cy < 1 || cy > 7) continue; // interior: edges are the flee barrier
            if (occupied.has(cx + ',' + cy)) continue;
            if (G.cellWarned(cx, cy)) continue;
            bx = cx; by = cy;
          }
        }
        if (bx != null) {
          try { if (G.tbPlayerMove(bx, by)) ctx.dodged = (ctx.dodged || 0) + 1; } catch (e) {}
          endTurn();
          return true;
        }
      }
    } catch (e) {}
    // FUTILITY FLEE (journey-scale r3 2026-10-11): a competent player does
    // not stand in a fight dealing nothing — the dry-bow deer (34 rounds,
    // 0 damage, "No arrow left" every round) is the exhibit. Scan this
    // fight's narration: the player's strike line is "You STRIKE ... for N".
    // After 8 rounds with <10 damage dealt, or the first "No X left" dry
    // line, walk to the edge. (Daily gearUp should prevent the dry case;
    // this is the safety net for flyers/afterimages/immunities.)
    try {
      if (!ctx._fr.round0) ctx._fr.round0 = f.round || 1;
      let dealt = 0, dryFire = false;
      for (let i = ctx._fr.capStart; i < capture.length; i++) {
        const l = capture[i] || '';
        const m = /You STRIKE[^.]*?for (\d+)/.exec(l);
        if (m) dealt += parseInt(m[1], 10);
        if (/No \w+ left\. Your .* (stick|useless)/i.test(l)) dryFire = true;
      }
      if (dryFire || ((f.round || 1) - ctx._fr.round0 >= 8 && dealt < 10)) {
        ctx.futilityFlees = (ctx.futilityFlees || 0) + 1;
        if (TR) TR(`futility-flee round=${f.round} dealt=${dealt} dryFire=${dryFire}`);
        return flee();
      }
      if (TR && (f.round % 5 === 0)) TR(`round=${f.round} dealt=${dealt} dryFire=${dryFire} hpPct=${hpPct.toFixed(2)}`);
    } catch (e) { if (TR) TR('futility-block threw: ' + (e && e.message)); }
    // MODERATOR MUTE (journey-scale r2 2026-10-11): muted verbs spend the
    // turn as violations (+3/Notice each). The counter is WAIT — never
    // muted, and five quiet rounds clear the verb window so the mute LIFTS
    // ("it loses the thread", announced plainly) — or stepping out of the
    // field. A strike-only policy strikes into the mute forever (seed
    // 271828: 102 unfinished moderator fights, 281k rounds) because muted
    // attempts never enter the verb window, so the mute never flips on its
    // own — and one wait is not enough, since the scan finds no mute
    // message on quiet turns and the policy would strike again on round 2
    // of 5. So: once muted, stay quiet for 6 full rounds; the lift
    // announcement breaks the quiet early. Never strike into a mute twice.
    try {
      const fr = ctx._fr;
      const since = fr._muteCk != null ? fr._muteCk : fr.capStart;
      let muted = false, lifted = false;
      for (let i = since; i < capture.length; i++) {
        const l = capture[i] || '';
        if (/IS MUTED inside the suppression field/.test(l)) muted = true;
        if (/The mute LIFTS/.test(l)) lifted = true;
      }
      fr._muteCk = capture.length;
      if (lifted) fr._muteWait = 0;
      else if (muted) fr._muteWait = 6;
      else if (fr._muteWait == null) fr._muteWait = 0;
      if (fr._muteWait > 0) {
        fr._muteWait--;
        try { G.tbPlayerWait(); } catch (e) {}
        if (G.tbfight && !G.tbfight.over && G.tbIsPlayerTurn && G.tbIsPlayerTurn()) endTurn();
        return true;
      }
    } catch (e) {}
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
        if (TR) TR(`close-in round=${f.round} d0=${d0} range=${w.range || 1} px=${px},${py} tgt=${tmx},${tmy}`);
        endTurn();
        return true;
      }
    } catch (e) {}
    try { G.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; if (TR) TR(`strike round=${f.round} tgt=${tgt.key}`); } catch (e) { if (TR) TR('strike threw: ' + (e && e.message)); }
    endTurn();
    return true;
  } catch (e) { if (TR) TR('OUTER threw: ' + (e && e.message) + ' ' + (e && e.stack || '').split('\n')[1]); return false; }
};

// ---- conversation driver (same as establishment, engage-first) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
// DEEP (deepening leg): second-priority picks that keep a good conversation
// going instead of leaving after 2 exchanges — "tell me more", gossip,
// lately/personal, mourning check-ins.
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
  const fp = `/tmp/journey-scale-transcript-${seed}-day${day}.txt`;
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
    let skills = [];
    try { skills = (Game.state.codex && Game.state.codex.skills && Game.state.codex.skills[id]) || []; } catch (e) {}
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

const CONVO_DAYS = (process.env.CONVODAYS ? process.env.CONVODAYS.split(',').map(s => parseInt(s, 10)) : [85, 92, 100, 108, 115, 122, 130, 138]);
// SCOREPROBE (journey-scale r2): when set, prints the full courtship score
// components + band distribution at day 30 for the first seed, then exits.
// Real policy, real history — tuning data for the longsim lever rotation.
const SCOREPROBE = !!process.env.SCOREPROBE;

async function runSeed(seed) {
  resetRng(seed);
  capture = [];
  const ctx = {};
  console.log(`\n########## SEED ${seed} ##########`);
  await Game.init();
  // DEATH-CAUSE TELEMETRY (journey-scale r3 2026-10-11): playerDeath(cause)
  // is the funnel for every player death; record the first cause so the
  // census can say WHY the run ended. The census recorded everyone's death
  // but the player's — the one that ends the journey.
  ctx.deathCause = null;
  if (typeof Game.playerDeath === 'function') {
    const _pd = Game.playerDeath.bind(Game);
    Game.playerDeath = function (cause) { if (!ctx.deathCause) ctx.deathCause = cause; return _pd(cause); };
  }
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
  const fightSnapshots = [];
  let lastContestCount = 0;
  let lastWave = null;
  let lastScale = null;
  let overAt = null;
  let maxGameDay = 0;

  for (let day = 1; day <= DAYCAP; day++) {
    const gd = gday();
    maxGameDay = Math.max(maxGameDay, gd);

    if (SCOREPROBE && gd >= 30) {
      try {
        const cands = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage(v));
        const rep = Game.representative ? Game.representative() : null;
        let repS = 0; try { repS = rep ? Game.linkStanding(rep.id) : 0; } catch (e) {}
        let ourS = 0; try { ourS = Game.regionalStanding(); } catch (e) {}
        console.log(`SCOREPROBE day ${gd}: repStanding=${repS} ourRegionalStanding=${ourS} pantry=${pantryKcal()}`);
        for (const t of cands.slice(0, 4)) {
          let theirS = 0; try { theirS = Game.villageStandingOf(t.id); } catch (e) {}
          const jl = [], jp = [];
          for (let i = 0; i < 60; i++) { jl.push(Game.judgeLink(t.id).score); jp.push(Game._judgePeer(t.id).score); }
          const bands = (xs) => xs.map(x => x >= 55 ? 'A' : (x >= 35 ? 'C' : 'D')).join('');
          const med = (xs) => xs.slice().sort((a, b) => a - b)[30];
          console.log(`  ${t.name}: opinion=${t.opinion ?? 0} theirStanding=${theirS} | judgeLink med=${med(jl)} bands=${bands(jl)} | _judgePeer med=${med(jp)} bands=${bands(jp)}`);
        }
      } catch (e) { console.log('SCOREPROBE ERROR: ' + (e && e.message)); }
      return { seed, scoreProbe: true };
    }

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

    // conversation on scheduled leg days
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
      const capBefore = capture.length;
      driveFights(Game, policy, ctx);
      driveContests(Game, policy, ctx);
      // snapshot any contest that was active this part
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

    if (gd >= 40) {
      const ps = (function () {
        try {
          const p = (Game.state.village && Game.state.village.pantry) || [];
          let kcal = 0, preserved = 0;
          for (const i of p) {
            const k = (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0);
            kcal += k;
            const fs = (i.foodState || '').toLowerCase();
            if (/smok|render|pemmican|dried|preserv/.test(fs)) preserved += k;
          }
          return { kcal: Math.round(kcal), preserved: Math.round(preserved), items: p.length };
        } catch (e) { return { kcal: null, preserved: null, items: null }; }
      })();
      series.push({
        day: gd, pantryKcal: ps.kcal, preservedKcal: ps.preserved, pantryItems: ps.items,
        pop: popAlive(), wave: waveNow(), scale: scaleNow(),
        links: linksSummary(),
        deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
        scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
        scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
        known: knownCounts(),
        gear: scholarGear(),
        scholarAlive: !!Game.state.scholar && !Game.over,
      });
    }
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const census = buildCensus();
  const censusPath = `/tmp/journey-scale-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, maxGameDay, transcriptFiles, series, census, contestLog, waveLog, scaleLog, overAt,
    deathCause: ctx.deathCause || null,
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
    gear: scholarGear(),
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledDeepening: ctx.fledDeepening || 0,
      fightsStarted: ctx.fightsStarted || 0, geared: ctx.geared || 0, armored: ctx.armored || 0,
      choseAbility: ctx.choseAbility || 0, looted: ctx.looted || 0, donated: ctx.donated || 0,
      beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
      talked: ctx.talked || 0, taught: ctx.taught || 0,
      dodged: ctx.dodged || 0, futilityFlees: ctx.futilityFlees || 0,
      arrowCraft: ctx.arrowCraft || 0, dryWeaponDays: ctx.dryWeaponDays || 0,
    },
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | maxDay=${maxGameDay} | over=${overAt || 'no'}${ctx.deathCause ? ' cause=' + ctx.deathCause : ''} | contests=${contestLog.length} | fights=${(ctx.fightsLog || []).length} | transcripts=${transcriptFiles.length} | scale=${scaleNow()} wave=${waveNow()} | scaleLog=${JSON.stringify(scaleLog)}`);
  return { seed, censusPath, transcriptFiles, series, contestLog, overAt, maxGameDay };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const r of results) {
    console.log(`seed ${r.seed}: maxDay=${r.maxGameDay} | over=${r.overAt || 'no'} | contests=${(r.contestLog || []).length} | census=${r.censusPath} ${r.fatal ? '| FATAL: ' + r.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
