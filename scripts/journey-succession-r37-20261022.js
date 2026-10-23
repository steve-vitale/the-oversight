#!/usr/bin/env node
// journey-succession-r37-20261022.js — SUCCESSION LEG r37: "THE FUNERAL"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md §§9-12, 14): when the player
// character dies, does the death->funeral->handoff arc land as a coherent,
// MEANINGFUL sequence in the wild — the death beat, the village bringing the
// body home, the grave by the fire, the vouching at the grave, the
// successor's burial act — and does the village socially echo the dead bearer
// by true name? Or are there silent steps, dead buttons, missing voices?
//
// PROFILE: competent policy. Phase A 9 days, scripted kill via the REAL
// playerDeath ('a hushwolf') ~d10. Post-death: 14 days of REAL competent play
// as the successor. Death-aware: dead/scattered village stops (+10d tail).
// Funeral arc is observed in the wild; the burial act is script-driven at
// d+3 (proves completable via the player-facing API) AFTER recording whether
// the competent policy did it organically.
//
// BINDING METRICS (§14):
//   M1 (funeral arc): >=3/4 deaths produce (a) the death beat naming the
//       bearer (🕯️ line), (b) recoverBearer within 2 days (grave dug, body
//       brought home — say line + pendingBurials cleared + corpse recovered
//       at the fire), (c) the burial act completable: payRespects + buryCorpse
//       succeed on the recovered corpse (no 'Nothing to honor here').
//       Kill rule: >=2/4 deaths with NO recoverBearer -> SUBSTRATE-MISSING.
//   M2 (social echo): on >=3/4 seeds, >=2 true-name mentions of the dead
//       bearer in villager conversation lines (sayLog NPC + driven convos)
//       within 7 days of death.
//   M3 (machinery): 4/4 scripted mantles clean (linOk + moOk).
//   M4 (people check): 0 identity failures across sense-read death/funeral
//       transcripts (manual verdict, SENSE-TESTING LAW).
//
// INTERESTING-FINDING CRITERIA:
//   (a) any funeral-arc step that never fires in the wild -> REAL blank
//       (fix if small, else file);
//   (b) the System's voice at the death — it is big brother + chilling
//       benefactor, genuinely believing it helps: does it speak at the
//       bearer's death, and does it read as designed? -> sense note;
//   (c) vouch-at-the-grave coverage: who speaks for whom, and does a
//       voiceless succession read hollow? -> note.
// SEEDS: 10001-10004 (fresh; r34/r35 re-used 99xx trajectories).
// HORIZON: phase A d1-9, kill ~d10, post-death +14d (~d24).
// Usage: SEED=10001 node scripts/journey-succession-r37-20261022.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '10001', 10);
const KILL_CAUSE = 'a hushwolf';
const POST_DAYS = 14;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-22');
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

// Honest convo driver (r26-r35, verbatim): sense-read only.
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
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r37', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });
  const rec = {
    seed: SEED, mode: 'succession-r37', notes: [], anomalies: [],
    convoReads: [], convoLines: [], identityTrips: [],
    funeral: {}, organicBurial: { respects: false, bury: false },
  };

  const sayLog = [];
  const _say = Game.say;
  let capturing = true;
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) {
      sayLog.push({ day: dayOf(Game), text: s.slice(0, 800) });
      if (sayLog.length > SAY_CAP) sayLog.shift();
    }
    return _say ? _say.call(this, t) : undefined;
  };
  // Organic-burial detector: wrap the player-facing rites before the bot plays.
  const _bury = Game.buryCorpse && Game.buryCorpse.bind(Game);
  const _respects = Game.payRespects && Game.payRespects.bind(Game);
  Game.buryCorpse = function (id) { rec.organicBurial.bury = true; return _bury ? _bury(id) : null; };
  Game.payRespects = function (id) { rec.organicBurial.respects = true; return _respects ? _respects(id) : null; };

  // ---- phase A: 9 competent days ----
  for (let d = 1; d <= 9; d++) {
    if (Game.over) break;
    await runDays(Game, competent, { days: 1 });
    if (Game.villagerId == null) break;
  }
  if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before the kill — seed skipped`); finish(); return; }

  // ---- scripted kill via the REAL playerDeath ----
  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const handoffStart = sayLog.length;
  const killDay = dayOf(Game);
  Game.playerDeath(KILL_CAUSE);
  const newId = Game.villagerId;
  const newName = rawName(Game, newId);
  const newFirst = firstName(newName);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  const deathDay = dayOf(Game);
  rec.death = {
    day: deathDay, cause: KILL_CAUSE, oldFirst, newFirst, passed,
    linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
    moOk: lastMo.from === oldId && lastMo.to === newId,
    newTrust: Math.round(trustOf(Game, newId)),
    alive: livingRoster(Game).length,
    fallen: ((Game.state.village || {}).fallen || []).length,
  };
  E(`\nDEATH d${deathDay} (${KILL_CAUSE}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mo=${rec.death.moOk} trust=${rec.death.newTrust}`);
  if (!passed) { rec.notes.push('mantle FAILED — seed skipped'); finish(); return; }

  const deathWindow = () => sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 2);
  const findLine = (re, win) => (win || sayLog).filter(h => re.test(h.text)).map(h => `d${h.day}: ${h.text.slice(0, 260)}`);

  // ---- post-death: 14 days of competent play as the successor ----
  let buriedBy = null; // 'organic' | 'scripted' | null
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    await runDays(Game, competent, { days: 1 });
    if (Game.over) break;
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;

    // Script-driven burial at d+3 (after recoverBearer should have fired d+1):
    // proves the player-facing rite is completable; organic attempt recorded first.
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
          const fn = path.join(EVID_DIR, `journey-succession-r37-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
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
  const endDay = dayOf(Game);

  // ---- funeral arc evidence ----
  const win = deathWindow();
  const f = rec.funeral;
  f.deathBeat = findLine(/🕯️|is dead/, win);
  f.recoverHome = findLine(/bring .* home|grave is dug|dug by the fire/i, win);
  f.vouch = findLine(/At the grave, .* speak/, win);
  f.systemVoice = findLine(/◈ SYSTEM|SYSTEM:/, win);
  f.burialWindowSay = findLine(/bury|grave|ashes|words for/i, sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 4));
  // pendingBurials state + corpse state at end
  const pend = ((Game.state.village || {}).pendingBurials || []).length;
  const cEnd = bearerCorpse(Game, oldId);
  f.pendingBurialsLeft = pend;
  f.corpseEnd = cEnd ? { recovered: !!cEnd.recovered, buried: !!cEnd.buried, looted: !!cEnd.looted } : 'gone';
  // Fallen ledger entry for the bearer
  const fallen = ((Game.state.village || {}).fallen || []);
  const fEntry = fallen.find(x => x && (x.villagerId === oldId || (x.name && String(x.name).split(' ')[0] === oldFirst)));
  f.fallenEntry = fEntry ? { day: fEntry.day, cause: fEntry.cause, name: fEntry.name } : null;
  // Social echo: true-name mentions of the dead bearer in VILLAGER TALK within
  // 7d — conversation NPC lines + villager-speech say lines (Overheard/quoted),
  // EXCLUDING the funeral arc's own system beats (death line, recover line,
  // burial lines, Codex/mantle transfers). Say-log funeral beats are the
  // MACHINERY (M1), not the social echo (M2).
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
  E(`\nFUNERAL: deathBeat=${f.deathBeat.length} recover=${f.recoverHome.length} vouch=${f.vouch.length} systemVoice=${f.systemVoice.length} fallen=${!!f.fallenEntry} echo=${f.echoMentions} organicBurial=${JSON.stringify(rec.organicBurial)} corpseEnd=${JSON.stringify(f.corpseEnd)}`);

  finish();

  function finish() {
    try { Game.say = _say; } catch (e) {}
    try { Game.buryCorpse = _bury; Game.payRespects = _respects; } catch (e) {}
    capturing = false;
    const f = rec.funeral;
    // M1: arc complete = death beat + recover within 2d + burial completable
    const arcOk = f.deathBeat && f.deathBeat.length > 0
      && f.recoverHome && f.recoverHome.length > 0
      && f.scriptedBurial && f.scriptedBurial.found && f.scriptedBurial.respectsOk && f.scriptedBurial.buryOk;
    rec.m1 = !!arcOk;
    rec.m1detail = `deathBeat=${(f.deathBeat || []).length} recover=${(f.recoverHome || []).length} burial=${f.scriptedBurial ? JSON.stringify({ found: f.scriptedBurial.found, respects: f.scriptedBurial.respectsOk, bury: f.scriptedBurial.buryOk }) : 'n/a'}`;
    if (!(f.recoverHome && f.recoverHome.length)) rec.noRecover = true;
    rec.m2 = (f.echoMentions || 0) >= 2;
    rec.m2detail = `echoMentions=${f.echoMentions} (convo=${f.echoConvo}, say=${f.echoSay}) — villager talk only, funeral-arc beats excluded`;
    rec.m3 = !!(rec.death && rec.death.passed && rec.death.linOk && rec.death.moOk);
    rec.m4 = 'manual';
    // identity tripwire: anyone addressing the dead bearer as if alive
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
    E(`METRICS: m1=${rec.m1}(${rec.m1detail}) m2=${rec.m2}(${rec.m2detail}) m3=${rec.m3} m4=${rec.m4} | endDay=${endDay} alive=${livingRoster(Game).length} over=${!!Game.over}`);
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
