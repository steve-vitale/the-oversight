#!/usr/bin/env node
// probe-freshcontest-20261015.js — r17 follow-up: does talk carry a FRESH contest?
// Replays 888 to d28 (1 day after Lie Detector d27 took Martyna while sick),
// then drives full transcripts with Martyna (participant) and Dante (bystander).
// SENSE-TESTING: read for meaning — does the grab surface in talk?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const SEED = 888;
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } });
}
function isSick(Game, vid) {
  try { const s = (Game.state.village.sick || {})[vid]; return s && (s.daysLeft || 0) > 0 && Game.vpOf(vid) && !Game.vpOf(vid).dead; } catch (e) { return false; }
}
const E = (s) => console.error(s);

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 10;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} (sick=${isSick(Game, vid)})`];
  let lk = 'unknown';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; lk = ev ? ev.kind : 'none'; } catch (e) {}
  out.push(`[latelyKind=${lk}]`);
  try { Game.startConvo(vid); } catch (e) { return { lines: out }; }
  for (let t = 0; t < maxTurns; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) break;
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /lately|happening|news/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> [${pick.id}] ${pick.text}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push('(threw)'); break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.push('(ended)'); break; }
    for (const e of (c.transcript || []).slice(-2)) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 350)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  let full = [];
  try { const c = Game.convoGet(vid); full = (c && c.transcript) || []; } catch (e) {}
  out.push('### FULL');
  for (const e of full) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 500)}`);
  return { lines: out };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'freshcontest', fullTelemetry: true });
  await setupGame(Game);
  let grabDay = -1, grabName = '', took = [];
  const _f = Game.fireContest;
  Game.fireContest = function (c) {
    const r = _f.call(this, c);
    try {
      const pc = (this.state || {}).pendingContest;
      // first contest AFTER the outbreak staging (d25): the fresh-crisis grab
      if (grabDay < 0 && dayOf(Game) >= 25 && pc) {
        grabDay = dayOf(Game);
        grabName = (c || {}).name || (c || {}).id || '?';
        took = (pc.participants || []).map(p => firstName(rawName(Game, p)));
        E(`[GRAB] d${grabDay} "${grabName}" took ${took.join(', ')}`);
      }
    } catch (e) {}
    return r;
  };
  await runDays(Game, oracleV2, { days: 20 });
  Game.pantryAdd = function () { return false; };
  Game.stockPantry = function () { return undefined; };
  while (dayOf(Game) < 25 && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  const v = Game.state.village; v.sick = v.sick || {};
  for (const id of livingRoster(Game).filter(id => id !== Game.villagerId).slice(0, 5))
    v.sick[id] = { name: 'gut rot', daysLeft: 14, severity: 3 };
  while (grabDay < 0 && dayOf(Game) < 45 && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  if (grabDay < 0) { E('no contest fired d25-45 — abort'); return; }
  while (dayOf(Game) < grabDay + 2 && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  E(`[TALK] d${dayOf(Game)}, ${dayOf(Game) - grabDay}d after "${grabName}"`);
  const roster = livingRoster(Game);
  // participants may include the player ("Someone"); talk to a villager participant
  let partId = null, partName = null;
  for (const nm of took) {
    if (/someone|you/i.test(nm)) continue;
    const id = roster.find(id => firstName(rawName(Game, id)) === nm);
    if (id) { partId = id; partName = nm; break; }
  }
  const bystander = roster.find(id => id !== Game.villagerId && id !== partId && !isSick(Game, id) &&
    (() => { try { const rc = (Game.state.village.rosterChars || {})[id]; return (rc.languages || []).includes('English') || !rc.languages; } catch (e) { return true; } })());
  if (partId) E(driveConvo(Game, partId, 'PARTICIPANT-' + partName, 10).lines.join('\n'));
  else E('[NOTE] no villager participant found to interview (took: ' + took.join(', ') + ')');
  if (bystander) E(driveConvo(Game, bystander, 'BYSTANDER-' + firstName(rawName(Game, bystander)), 10).lines.join('\n'));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
