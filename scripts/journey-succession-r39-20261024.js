#!/usr/bin/env node
// journey-succession-r39-20261024.js — SUCCESSION LEG r39: "THE FIX IN THE WILD"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md secs 9-12, 14): r38 closed the
// vouch thread and documented the trust-trap regime (d10 death -> trust 16
// -> 13 half-ration nights, trust 16->16, no self-heal). SINCE THEN Steve
// ruled (2026-10-23, DECISIONS.md): the trust-gated half-ration in
// villageMeal is for NEW villagers ONLY — a taken-over existing villager
// eats full at any trust. Fix c8d7c787d is on this base.
// This run asks: does the ruling hold in the wild?
//   (a) MEAL CONTRACT: a successor with trust<30 at the mantle pass must
//       never see "Half ration — they don't trust you yet". One line = bug.
//   (b) TRUST CLIMB: with the trap gone, does successor trust climb under
//       competent play (was 16->16 over 14d in r38)?
//   (c) BURIAL PROBE (instrument/policy, NOT a game change): the competent
//       bot never buried the bearer organically (0/4, r37/r38 standing gap).
//       This run the policy is burial-seeking: when the corpse is recovered
//       home and unburied at d+1/d+2, the player (policy) pays respects +
//       buries through the REAL player-facing API — the same calls r38 did
//       script-driven at d+3, but as a chosen act. If it completes, the
//       "burial never happens organically" finding is a POLICY gap, not a
//       game-side blank; the rite is proven reachable in the wild.
//   (d) REGRESSION: vouch contract (r38 M2a), social echo (r38 M3 bar),
//       funeral arc machinery (r38 M1), mantle machinery (r38 M4).
//
// PROFILE: competent policy, burial-seeking (see above). Phase A: real
// competent play to ~d40. Scripted kill via the REAL playerDeath ('a
// hushwolf') at the first day >= 40 after phase A completes. Post-death:
// 14 days of REAL competent play as the successor. Death-aware:
// dead/scattered village stops (+10d tail). Funeral arc observed in the
// wild; scripted burial at d+3 is now a FALLBACK (fires only if the nudge
// didn't already bury).
//
// BINDING METRICS (sec 14):
//   M1 (funeral arc): >=3/4 deaths produce (a) the death beat naming the
//       bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable
//       (nudge, organic, or scripted — any real completion counts).
//       Kill rule: >=2/4 deaths with NO recoverBearer <redacted>> SUBSTRATE-MISSING.
//   M2a (meal contract): on EVERY seed where the successor's trust at the
//       mantle pass < 30, ZERO "Half ration" lines in the 7 days after
//       death. A single line for the successor's body = REAL BUG (fix
//       misfiring). Newcomer arrivals (isNewcomer) are the only allowed
//       exception — recorded, and every half-ration line must be explainable
//       by one.
//   M2b (trust climb): on >=3/4 seeds, successor trust at +14d strictly
//       greater than trust at the mantle pass.
//   M1b (burial probe): on >=3/4 seeds the burial-seeking policy completes
//       the burial rite (respects + bury) organically — no scripted
//       fallback needed.
//   M3 (social echo, r37/r38 bar stands): on >=3/4 seeds, >=2 true-name
//       mentions of the dead bearer <redacted> VILLAGER TALK within 7 days of death.
//   M4 (machinery): 4/4 mantles clean (linOk + moOk).
//   M5 (people check): 0 identity failures across sense-read transcripts.
//
// SEEDS: 21001-21004 (fresh). HORIZON: phase A to ~d40, kill via REAL
// playerDeath, successor +14d.
// Usage: SEED=21001 node scripts/journey-succession-r39-20261024.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '21001', 10);
const KILL_CAUSE = 'a hushwolf';
// EARLY_KILL (r39): on one seed the kill happens at the first day >=
// EARLY_KILL after phase A — the short-life regime (trust<30 successor)
// that exposed the trust trap in r38-20004. Default 40 (long life).
const KILL_DAY_MIN = parseInt(process.env.EARLY_KILL || '40', 10);
const PHASE_A_DAYS = 40;
const POST_DAYS = 14;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-24');
const SAY_CAP = 15000;
const CONVO_DAYS = [3, 7, 14];

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; } }
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function corpses(Game) {
  try { return (typeof Game.corpses === 'function' ? Game.corpses() : Game.corpses) || []; } catch (e) { return []; }
}
function bearerCorpse(Game, oldId) {
  return corpses(Game).find(c => c && c.villagerId === oldId) || null;
}

// Honest convo driver (r26-r38, verbatim): sense-read only.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false;
  const picked = [];
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    return { text: out.join('\n') + '\n(convo refused or never opened)', refused, flags: { want: (c0 && c0.want && c0.want.id) || 'none' } };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const c = Game.convoGet(vid);
    let pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) {
      const fb = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
      if (fb) { pick = fb; }
      else pick = choices.find(x => x.id === 'dlg:cant') || null;
    }
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 110)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const cf = Game.convoGet(vid);
  const lines = [];
  for (const e2 of ((cf && cf.transcript) || [])) {
    lines.push(`${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 500)}`);
  }
  const txt = lines.join('\n');
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  return { text: out.join('\n'), refused: false, flags: { want: (cf && cf.want && cf.want.id) || 'none' }, fullText: txt };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r39', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });
  const rec = {
    seed: SEED, mode: 'succession-r39', notes: [], anomalies: [],
    convoReads: [], convoLines: [], identityTrips: [],
    funeral: {}, organicBurial: { respects: false, bury: false },
  };

  const sayLog = [];
  const _say = Game.say;
  let capturing = true;
  let endDay = null; // set at the end of the post-death loop; finish() may run early
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) {
      sayLog.push({ day: dayOf(Game), text: s.slice(0, 800) });
      if (sayLog.length > SAY_CAP) sayLog.shift();
    }
    return _say ? _say.call(this, t) : undefined;
  };
  const _bury = Game.buryCorpse && Game.buryCorpse.bind(Game);
  const _respects = Game.payRespects && Game.payRespects.bind(Game);
  Game.buryCorpse = function (id) { rec.organicBurial.bury = true; return _bury ? _bury(id) : null; };
  Game.payRespects = function (id) { rec.organicBurial.respects = true; return _respects ? _respects(id) : null; };

  // ---- phase A: real competent play to the kill day (death-aware stop) ----
  // KILL_DAY_MIN=40 -> ~d40 long-life regime; EARLY_KILL=12 -> short-life
  // regime (the r38-20004 trust-trap regime).
  let organic = null; // { day, deadId, newId } if the mantle passed organically in phase A
  for (let d = 1; d <= PHASE_A_DAYS; d++) {
    if (Game.over) break;
    const beforeId = Game.villagerId;
    await runDays(Game, competent, { days: 1 });
    if (Game.over || Game.villagerId == null) break;
    if (Game.villagerId !== beforeId) {
      organic = { day: dayOf(Game), deadId: beforeId, newId: Game.villagerId };
      rec.notes.push(`organic mantle during phase A: ${firstName(rawName(Game, beforeId))} -> ${firstName(rawName(Game, Game.villagerId))} d${organic.day}`);
      break;
    }
    if (dayOf(Game) >= KILL_DAY_MIN) break; // reached the kill day: stop phase A
  }
  if (Game.over || Game.villagerId == null) {
    rec.notes.push(`village over at d${dayOf(Game)} before any kill — seed skipped (death-aware stop)`);
    finish(); return;
  }

  // ---- the leg's death: organic (already passed in phase A) or scripted via the REAL playerDeath ----
  let handoffStart = sayLog.length;
  let deathCause, scripted, oldId, killDay;
  if (organic) {
    // The mantle already passed through the REAL death machinery in phase A.
    // Record the handoff from the pre-death state; no second kill.
    oldId = organic.deadId;
    deathCause = 'organic (phase A)';
    scripted = false;
    killDay = organic.day;
    handoffStart = 0; // death machinery already ran inside phase A; scan the whole log
    // Trust snapshot for the record (post-death; others' trust entries unchanged by the handoff).
    const livePost0 = livingRoster(Game);
    const trustSnap0 = livePost0.map(id => ({ id: firstName(rawName(Game, id)), t: Math.round(trustOf(Game, id)) }))
      .sort((a, b) => b.t - a.t);
    rec.preDeath = { day: organic.day, topTrust: trustSnap0.slice(0, 6), roster: livePost0.length, note: 'post-organic-death state' };
    E(`\nORGANIC DEATH d${organic.day}: ${firstName(rawName(Game, organic.deadId))} -> ${firstName(rawName(Game, organic.newId))}, topTrust=${JSON.stringify(trustSnap0.slice(0, 4))}`);
  } else {
    oldId = Game.villagerId;
    // Pre-death trust snapshot: voucher eligibility for the vouch contract.
    const livePre = livingRoster(Game);
    const trustSnap = livePre.map(id => ({ id: firstName(rawName(Game, id)), t: Math.round(trustOf(Game, id)) }))
      .sort((a, b) => b.t - a.t);
    rec.preDeath = { day: dayOf(Game), topTrust: trustSnap.slice(0, 6), roster: livePre.length };
    E(`\nPRE-DEATH d${dayOf(Game)}: bearer <redacted>, topTrust=${JSON.stringify(trustSnap.slice(0, 4))}, roster=${livePre.length}`);
    killDay = dayOf(Game);
    deathCause = KILL_CAUSE;
    scripted = true;
    Game.playerDeath(KILL_CAUSE);
  }
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const newId = organic ? organic.newId : Game.villagerId;
  const newName = rawName(Game, newId);
  const newFirst = firstName(newName);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  const deathDay = dayOf(Game);
  // Voucher eligibility at the funeral (ledger.js rule: trust[id] >= 60,
  // living, not the successor).
  const livePost = livingRoster(Game);
  const vouchers = livePost.filter(id => id !== newId && trustOf(Game, id) >= 60);
  rec.death = {
    day: deathDay, cause: deathCause, scripted, oldFirst, newFirst, passed,
    linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
    moOk: lastMo.from === oldId && lastMo.to === newId,
    newTrust: Math.round(trustOf(Game, newId)),
    alive: livePost.length,
    fallen: ((Game.state.village || {}).fallen || []).length,
    vouchersEligible: vouchers.map(id => firstName(rawName(Game, id))),
    vouchersN: vouchers.length,
  };
  E(`DEATH d${deathDay} (${deathCause}${scripted ? ', scripted' : ''}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mo=${rec.death.moOk} trust=${rec.death.newTrust} vouchers=${vouchers.length}`);
  if (!passed) { rec.notes.push('mantle FAILED — seed skipped'); finish(); return; }

  const deathWindow = () => sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 2);
  const findLine = (re, win) => (win || sayLog).filter(h => re.test(h.text)).map(h => `d${h.day}: ${h.text.slice(0, 300)}`);

  // ---- post-death: 14 days of competent play as the successor ----
  let buriedBy = null;
  let deaths = 1; // bearer deaths total (scripted + any successor chains)
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    const beforeId = Game.villagerId;
    await runDays(Game, competent, { days: 1 });
    if (Game.over || Game.villagerId == null) break;
    if (Game.villagerId !== beforeId) { deaths++; rec.notes.push(`chain mantle: new bearer <redacted> d${dayOf(Game)}`); }
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;

    // BURIAL NUDGE (r39 policy probe, NOT a game change): at d+1/d+2, if the
    // bearer's corpse is recovered home and unburied, the player (policy)
    // pays respects + buries through the REAL player-facing API — the same
    // calls r38 made script-driven at d+3, but as a chosen act. Proves
    // whether the rite is reachable in the wild.
    if (daysSince >= 1 && daysSince <= 2 && buriedBy == null && !rec.organicBurial.bury) {
      const c = bearerCorpse(Game, oldId);
      if (c && c.recovered && !c.buried) {
        const r1 = _respects(c.id);
        const r2 = _bury(c.id);
        buriedBy = 'nudge';
        rec.funeral.nudgeBurial = {
          day: daysSince, respectsOk: r1 === true, buryOk: r2 === true,
          buried: !!(bearerCorpse(Game, oldId) || {}).buried,
        };
        E(`  BURIAL-NUDGE d+${daysSince}: respects=${r1 === true} bury=${r2 === true}`);
      }
    }
    if (daysSince === 3 && buriedBy == null) {
      const c = bearerCorpse(Game, oldId);
      if (c) {
        const r1 = _respects(c.id);
        const r2 = _bury(c.id);
        buriedBy = 'scripted';
        rec.funeral.scriptedBurial = {
          found: true, respectsOk: r1 === true, buryOk: r2 === true,
          buried: !!(bearerCorpse(Game, oldId) || {}).buried,
        };
        E(`  BURIAL d+${daysSince}: corpse found=${!!c} respects=${r1 === true} bury=${r2 === true}`);
      } else {
        rec.funeral.scriptedBurial = { found: false };
        rec.anomalies.push(`d+3: no corpse for ${oldFirst} — nothing to bury (funeral arc gap)`);
        E(`  BURIAL d+${daysSince}: NO CORPSE for ${oldFirst} — arc gap`);
        buriedBy = 'missing';
      }
    }
    if (rec.organicBurial.bury && buriedBy == null) buriedBy = 'organic';
    if (daysSince === 7 || daysSince === 14 || d === POST_DAYS) {
      rec.ledger = rec.ledger || [];
      rec.ledger.push({ dplus: daysSince, day: curDay, bearer: firstName(rawName(Game, Game.villagerId)),
        alive: livingRoster(Game).length, fallen: ((Game.state.village || {}).fallen || []).length });
    }
    if (CONVO_DAYS.includes(daysSince) && !Game.over) {
      const v = Game.state.village || {};
      const self = Game.villagerId;
      const byTrust = (v.roster || []).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
      for (const vid of byTrust.slice(0, 2)) {
        try {
          const r = driveConvo(Game, vid, `funeral-echo d+${daysSince}`, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r39-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          fs.writeFileSync(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSince, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  CONVO d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused})`);
        } catch (e) { rec.anomalies.push(`funeral convo d+${daysSince} threw: ` + e.message); }
      }
    }
  }
  if (endDay == null) endDay = dayOf(Game);

  // ---- funeral arc evidence ----
  const win = deathWindow();
  const f = rec.funeral;
  f.deathBeat = findLine(/🕯️|is dead/, win);
  f.recoverHome = findLine(/bring .* home|grave is dug|dug by the fire/i, win);
  f.vouch = findLine(/At the grave, .* speak/, win);
  f.systemVoice = findLine(/◈ SYSTEM|SYSTEM:/, win);
  f.burialWindowSay = findLine(/bury|grave|ashes|words for/i, sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 4));
  const pend = ((Game.state.village || {}).pendingBurials || []).length;
  const cEnd = bearerCorpse(Game, oldId);
  f.pendingBurialsLeft = pend;
  f.corpseEnd = cEnd ? { recovered: !!cEnd.recovered, buried: !!cEnd.buried, looted: !!cEnd.looted } : 'gone';
  const fallen = ((Game.state.village || {}).fallen || []);
  const fEntry = fallen.find(x => x && (x.villagerId === oldId || (x.name && String(x.name).split(' ')[0] === oldFirst)));
  f.fallenEntry = fEntry ? { day: fEntry.day, cause: fEntry.cause, name: fEntry.name } : null;
  // Social echo (r37 method, verbatim): true-name mentions in villager talk,
  // funeral-arc system beats excluded.
  const nameRe = new RegExp(`\\b${oldFirst}\\b`, 'i');
  const funeralArcRe = /bring .* home|grave|bury|words for|🕯️|Codex turns|mantle passes|MANTLE TRANSFER|starts digging|brought home/i;
  const villagerTalkRe = /Overheard|^[A-Z][a-z]+ (says|said|tells|asks|murmurs|whispers)|^\s*"[A-Z]/;
  const convoEcho = rec.convoLines.filter(l => l.day > deathDay && l.day <= deathDay + 7 && nameRe.test(l.text));
  const sayEcho = sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7
    && nameRe.test(h.text) && !funeralArcRe.test(h.text) && villagerTalkRe.test(h.text));
  const mentions = convoEcho.concat(sayEcho.map(h => ({ day: h.day, text: h.text })));
  f.echoMentions = mentions.length;
  f.echoConvo = convoEcho.length;
  f.echoSay = sayEcho.length;
  f.echoSample = mentions.slice(0, 6).map(h => `d${h.day}: ${h.text.slice(0, 220)}`);
  // Trust-trap observation (Steve's call — document only): half-ration lines
  // after the death + successor trust at end.
  // The meal-gate line is exactly: "Village meal: +N kcal from the communal
  // pantry. (Half ration — they don't trust you yet.)" — the regex keys on
  // the trust phrase so crisis-triage "half rations till it passes" lines
  // (a policy choice, not the trust gate) don't false-positive.
  f.halfRationLines = sayLog.filter(h => h.day > deathDay && /don't trust you yet/i.test(h.text))
    .map(h => `d${h.day}: ${h.text.slice(0, 160)}`);
  f.successorTrustEnd = Math.round(trustOf(Game, newId));
  f.deathsTotal = deaths;
  E(`\nFUNERAL: deathBeat=${f.deathBeat.length} recover=${f.recoverHome.length} vouch=${f.vouch.length} (eligible=${vouchers.length}) echo=${f.echoMentions} organicBurial=${JSON.stringify(rec.organicBurial)} halfRation=${f.halfRationLines.length}`);

  // Telemetry-baseline fields (same contract as telemetry-baselines/succession.json)
  rec.tele = {
    'deaths.bearer': deaths,
    'census.alive': livingRoster(Game).length,
    'census.fallen': ((Game.state.village || {}).fallen || []).length,
    'census.integrationStage': (function () { try { return (typeof Game.integrationStage === 'function') ? Game.integrationStage() : 0; } catch (e) { return 0; } })(),
    'week2.deadBearerMentions': sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7 && nameRe.test(h.text)).length,
  };
  try {
    fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r39-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  } catch (e) { E('tele write failed: ' + e.message); }

  finish();

  function finish() {
    try { Game.say = _say; } catch (e) {}
    try { Game.buryCorpse = _bury; Game.payRespects = _respects; } catch (e) {}
    capturing = false;
    const f = rec.funeral;
    const burialDone = (f.scriptedBurial && f.scriptedBurial.found && f.scriptedBurial.respectsOk && f.scriptedBurial.buryOk)
      || (f.nudgeBurial && f.nudgeBurial.respectsOk && f.nudgeBurial.buryOk)
      || (rec.organicBurial && rec.organicBurial.bury);
    const arcOk = f.deathBeat && f.deathBeat.length > 0
      && f.recoverHome && f.recoverHome.length > 0
      && burialDone;
    rec.m1 = !!arcOk;
    rec.m1_detail = `buriedBy=${buriedBy}`;
    // Vouch contract (r38 regression): eligible -> must fire.
    rec.vouch_contract = vouchers.length === 0 ? 'n/a (none eligible)' : (f.vouch.length > 0);
    rec.vouch_detail = `vouchersEligible=${JSON.stringify(rec.death.vouchersEligible)} vouchLines=${(f.vouch || []).length}`;
    // M2a MEAL CONTRACT (Steve 2026-10-23 ruling): successor with trust<30
    // at the mantle pass must see ZERO "Half ration" lines in 7d. The only
    // allowed exception: a newcomer (isNewcomer) arriving in the window,
    // whose half-ration gate is legitimately still trust-gated.
    const newcomersInWindow = [];
    try {
      for (const id of livingRoster(Game)) {
        if (typeof Game.isNewcomer === 'function' && Game.isNewcomer(id)) newcomersInWindow.push(firstName(rawName(Game, id)));
      }
    } catch (e) {}
    const trustAtPass = rec.death.newTrust;
    const halfLines = (f.halfRationLines || []).filter(l => { const m = /^d(\d+)/.exec(l); return m && (+m[1] - deathDay) <= 7; });
    let m2a, m2aDetail;
    if (trustAtPass >= 30) { m2a = 'n/a (trust>=30 at pass)'; m2aDetail = `trustAtPass=${trustAtPass}`; }
    else if (halfLines.length === 0) { m2a = true; m2aDetail = `trustAtPass=${trustAtPass}, 0 half-ration lines in 7d — fix HOLDS`; }
    else if (newcomersInWindow.length > 0) { m2a = 'explained'; m2aDetail = `trustAtPass=${trustAtPass}, ${halfLines.length} half-ration line(s) with newcomer(s) in window: ${newcomersInWindow.join(',')}`; }
    else { m2a = false; m2aDetail = `trustAtPass=${trustAtPass}, ${halfLines.length} half-ration line(s), NO newcomer — FIX MISFIRE`; rec.anomalies.push('MEAL-FIX MISFIRE: half-ration lines for a trust<30 taken-over successor'); }
    rec.m2a = m2a; rec.m2a_detail = m2aDetail;
    rec.newcomersInWindow = newcomersInWindow;
    // M2b TRUST CLIMB: successor trust at +14d > trust at the mantle pass.
    rec.m2b = f.successorTrustEnd > trustAtPass;
    rec.m2b_detail = `trustAtPass=${trustAtPass} -> end=${f.successorTrustEnd}`;
    // M1b BURIAL PROBE: burial-seeking policy completed the rite itself.
    rec.m1b = buriedBy === 'nudge' || buriedBy === 'organic';
    rec.m1b_detail = `buriedBy=${buriedBy}`;
    rec.m3 = (f.echoMentions || 0) >= 2;
    rec.m3detail = `echoMentions=${f.echoMentions} (convo=${f.echoConvo}, say=${f.echoSay})`;
    rec.m4 = !!(rec.death && rec.death.passed && rec.death.linOk && rec.death.moOk);
    rec.m5 = 'manual';
    const post = sayLog.slice(handoffStart);
    const src = post.concat(rec.convoLines.filter(l => l.day >= (rec.death ? rec.death.day : 0)).map(l => ({ day: l.day, text: l.text })));
    const trips = [];
    if (oldFirst) {
      const addrRe = new RegExp(`\\b${oldFirst}\\b.*(you|your)|you.*\\b${oldFirst}\\b`, 'i');
      for (const h of src) {
        if (addrRe.test(h.text) && !/is dead|died|'s gone|was |buried|bury|grave|mourn|miss |take .* from|not the office, the person|keep expecting|ashes|words for|say a few words/i.test(h.text)) {
          trips.push({ day: h.day, text: h.text.slice(0, 200) });
        }
      }
    }
    rec.identityTrips = trips.slice(0, 10);
    E(`\nIDENTITY TRIPS: ${trips.length}`);
    E(`METRICS: m1=${rec.m1}(${rec.m1_detail}) m2a=${JSON.stringify(rec.m2a)} m2b=${rec.m2b}(${rec.m2b_detail}) m1b=${rec.m1b}(${rec.m1b_detail}) vouch=${JSON.stringify(rec.vouch_contract)} m3=${rec.m3}(${rec.m3detail}) m4=${rec.m4} m5=${rec.m5} | endDay=${endDay} alive=${livingRoster(Game).length} over=${!!Game.over}`);
    E(`anomalies: ${rec.anomalies.length}`); for (const a of rec.anomalies.slice(0, 8)) E('  ANOMALY: ' + a);
    if (process.env.DUMP_SAY) {
      try {
        fs.writeFileSync(process.env.DUMP_SAY, sayLog.map(h => `d${h.day}: ${h.text}`).join('\n') + '\n');
        E(`say dump -> ${process.env.DUMP_SAY}`);
      } catch (e) { E('say dump failed: ' + e.message); }
    }
    console.log(JSON.stringify(rec, null, 1));
  }
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
