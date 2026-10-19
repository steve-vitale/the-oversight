// policies/snareteach.js — TEACH-DRIVE policy arm (lever loop B,
// 2026-10-19, food-economy axis). Answers the trapline chicken-and-egg
// finding (sim-findings.md 2026-10-13): the scholar's snare on-ramp is the
// EXISTING teach channel — a knower's witnessed TRAPS return teaches
// recipe L1 once the scholar has earned the teacher's regard (trust 15+,
// villager-objectives.js TRAP TEACHING beat). The base policy never works
// that gate deliberately: it talks to random villagers and never gives
// food with intent.
//
// The drive plays a scholar who courts the trapper: while the snare recipe
// sits at L0 and an unspent knower lives in the cast, the scholar seeks
// their company and shares food — the engine's honest trust verb
// (Game.giveFood: "the fastest way to earn trust. sharing is the social
// contract."). When the regard gate is met, the scholar asks for the wire
// lesson through the REAL conversation channel (convoSkillChoices ->
// "Teach me Wire Snares?" -> convoSkillLesson -> teachSkill, the one
// teaching mechanic, Steve 2026-10-14) — which itself bumps trust +1
// ('taught you Wire Snares'). The witnessed-return beat then fires on the
// next trap return instead of waiting on the knower's own slow deed drip.
//
// Engine-honesty: this layer only calls verbs the engine exposes to the
// player (Game.giveFood, Game.talkTo, Game.convoSkillChoices,
// Game.convoTurn, Game.endConvo) and only steers the SCHOLAR's own
// behavior. It never moves trust directly, never grants knowledge, never
// touches NPC agency. The teach itself stays the engine's.
//
// Opt-in: SNARETEACH=1. Default OFF — courtTrapper returns null immediately
// when the flag is unset, so default behavior is byte-identical.
'use strict';

function on() { return process.env.SNARETEACH === '1'; }

// TRUST_GATE mirrors the engine's regard gate (villager-objectives.js TRAP
// TEACHING beat, skill-teaching.js TRUST_GATE): strangers don't hand over
// their craft below 15. The drive gifts while trust is under the gate +
// margin, then stops — generosity past the gate is out of scope.
const TRUST_GATE = 15;
const GIFT_UNDER = 20;

function snareLevel(Game) {
  try { return (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0; }
  catch (e) { return 0; }
}

function trustOf(Game, vid) {
  try {
    const t = (Game.state.village.trust || {})[vid];
    return t === undefined ? 10 : t;
  } catch (e) { return 10; }
}

function alive(Game, vid) {
  try {
    if (!vid || vid === Game.villagerId) return false;
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    return !!(p && !p.dead);
  } catch (e) { return false; }
}

// knowers: living cast members who know the wire and haven't spent their
// once-only player lesson (vp.taughtSnare — the TRAP TEACHING beat's flag).
function knowers(Game) {
  const out = [];
  try {
    const roster = ((Game.state.village || {}).roster || []);
    for (const vid of roster) {
      if (!alive(Game, vid)) continue;
      let vp = null;
      try { vp = Game.vpOf(vid); } catch (e) {}
      if (vp && vp.knowsSnare && !vp.taughtSnare) out.push(vid);
    }
  } catch (e) {}
  return out;
}

// canAffordGift: the scholar shares from surplus, never from hunger. Same
// edible definition as the engine's edibleCount (giveFood's own gate).
function canAffordGift(Game) {
  try {
    const s = Game.state.scholar;
    if (!s || Game.over) return false;
    if ((s.kcal || 0) < Game.kcalCap() * 0.55) return false;
    let edibles = 0;
    for (const i of (s.inventory || [])) {
      if ((i.kcalEach || 0) > 0 && (i.units || 0) > 0 && !i.bonded &&
          !(Game.isSpoiled && Game.isSpoiled(i))) edibles++;
      if (edibles >= 2) return true;
    }
    return false;
  } catch (e) { return false; }
}

const TALK_STRUCTURAL = { leave: 1, goon: 1, subject: 1, 'dlg:subject': 1, deflect_q: 1, honest_pass: 1 };

// pickLessonTurn: the wire lesson first (the ask the drive exists for),
// then courtesy — answer their question, then ask on. Never structural.
function pickLessonTurn(choices, seen) {
  try {
    const live = (choices || []).filter(c =>
      c && c.id && !TALK_STRUCTURAL[String(c.id)] && !(seen && seen[String(c.id)]));
    if (!live.length) return null;
    const wire = live.find(c => String(c.id) === 'skill_learn:snare_wire');
    if (wire) return wire;
    const ans = live.find(c => String(c.id).indexOf('ans:') === 0);
    if (ans) return ans;
    const ask = live.find(c => String(c.id) === 'ask');
    if (ask) return ask;
    return live[0];
  } catch (e) { return null; }
}

// seekLesson: one held sitting with the trapper. Opens a real conversation,
// takes the wire lesson when offered (the engine's convoSkillLesson —
// narrated, recorded, trust +1), a few courteous turns otherwise, honest
// goodbye. The talkTo/endConvo('left') shape is the talkRound-proven path.
function seekLesson(Game, ctx, vid) {
  if (!Game.talkTo || !Game.endConvo) return false;
  let sat = false;
  try {
    Game.talkTo(vid);
    sat = true;
    ctx.snareteachSits = (ctx.snareteachSits || 0) + 1;
    const seen = {};
    // one lesson-offer check up front: the menu only offers skill_learn
    // while its gates hold (trust 15+, shared language, once/day).
    try {
      const offered = Game.convoSkillChoices ? Game.convoSkillChoices(vid) : [];
      ctx.snareteachWireOffered = (ctx.snareteachWireOffered || 0) +
        (offered.some(c => c && String(c.id) === 'skill_learn:snare_wire') ? 1 : 0);
    } catch (e) {}
    for (let turn = 0; turn < 4; turn++) {
      let c = null, choices = [];
      try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
      if (!c || !c.active) break;
      try { choices = Game.convoChoices ? Game.convoChoices(vid) : []; } catch (e) {}
      const pick = pickLessonTurn(choices, seen);
      if (!pick) break;
      seen[String(pick.id)] = 1;
      if (String(pick.id) === 'skill_learn:snare_wire') ctx.snareteachWireAsked = (ctx.snareteachWireAsked || 0) + 1;
      try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
      ctx.snareteachTurns = (ctx.snareteachTurns || 0) + 1;
      try {
        const c2 = Game.convoGet ? Game.convoGet(vid) : null;
        if (!c2 || !c2.active || c2.over) break;
      } catch (e) { break; }
    }
  } catch (e) {
    // fall through to the honest close
  } finally {
    try { if (sat) Game.endConvo(vid, 'left'); } catch (e) {}
  }
  return sat;
}

// courtTrapper: the daily drive. Returns the target vid when it engaged,
// null when the gate is off or there's nothing to court. Idempotent and
// side-effect-free unless on() and all honest gates hold.
function courtTrapper(Game, ctx) {
  if (!on()) return null;
  try {
    const s = Game.state.scholar;
    if (!s || Game.over) return null;
    if ((Game.tbfight && !Game.tbfight.over)) return null;
    if (snareLevel(Game) >= 1) return null; // the wire is learned — drive off
    const ks = knowers(Game);
    if (!ks.length) return null; // dead cast: nothing to court (documented)
    // the closest unspent teacher: highest trust wins (nearest the gate).
    let target = ks[0], best = -1;
    for (const vid of ks) {
      const t = trustOf(Game, vid);
      if (t > best) { best = t; target = vid; }
    }
    const day = s.day || 0;
    // the gift: share a meal with the trapper while regard is still
    // unearned. Once a day, from surplus only.
    if (best < GIFT_UNDER && (ctx._snareteachGiftDay || 0) !== day && canAffordGift(Game)) {
      try {
        Game.giveFood(target);
        ctx._snareteachGiftDay = day;
        ctx.snareteachGifts = (ctx.snareteachGifts || 0) + 1;
      } catch (e) {}
    }
    // the company: sit with them. The wire lesson fires through the menu
    // when its gates hold; otherwise it's just a visit.
    if ((ctx._snareteachSitDay || 0) !== day) {
      ctx._snareteachSitDay = day;
      seekLesson(Game, ctx, target);
    }
    return target;
  } catch (e) { return null; }
}

module.exports = { on, snareLevel, knowers, courtTrapper, TRUST_GATE };
