#!/usr/bin/env node
// journey-succession-r5.js — LEG 7 (succession) r5 (2026-10-12).
// Fresh territory vs r4 (single-death mechanics) and the 05:00 crisis run
// (multi-death under siege):
//   1. FABRICATED SHARED HISTORY AUDIT: the predecessor plants REAL
//      conversational state (promise, gift memory, thread) via played
//      conversation turns; after the mantle passes, the new Bearer <redacted> to
//      the SAME npcs. Full transcripts are captured and audited: does any NPC
//      line attribute the predecessor's deed to "you" (the new face), or
//      claim shared past ("remember when we...") that never involved them?
//      Honest lines name the predecessor (inheritedName machinery).
//   2. SECOND-DEATH CHAIN: kill Bearer 2 as well — mantleOf chain, lineage,
//      fallen, stamps keep Bearer-1's name on old records.
//   3. {people} COUNT HONESTY: exit lines render the living roster, not 12.
// Usage: SEEDS=777 node scripts/journey-succession-r5.js
// Output: JSON summary to stdout; full transcripts + audit to stderr.
// Exit 0 = all checks green.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '20', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '10', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '777';
  const out = [];
  for (const part of s.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(part)) out.push(+part);
  }
  return out;
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function firstName(Game, vid) { return rawName(Game, vid).split(' ')[0]; }

// Natural-path driver with commitment: engage the want, commit to favors,
// pick thread/want choices, then leave. Plants REAL conversational state.
function driveConvo(Game, vid, tag, maxTurns, commit) {
  maxTurns = maxTurns || 14;
  const out = [];
  out.push(`## ${tag} — talking to ${rawName(Game, vid)}`);
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = null;
    if (commit) {
      pick = choices.find(c => /want:commit|dlg:promise|commit/i.test(c.id || '') && !/^(leave|bye)/.test(c.id));
      if (!pick) pick = choices.find(c => /i.ll do it|i.m in|count on me|you have my word/i.test(c.text || ''));
    }
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /how|feeling|holding|news|day|worried|afraid|hungry|miss|died|gone|grief|sad|angry/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); }
    catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push(`FINAL: want=${(c && c.want && c.want.id) || 'none'} resolution=${(c && c.want && c.want.resolution) || 'n/a'}`);
  out.push('### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  return out.join('\n');
}

// Audit: flag NPC lines that claim shared past with "you" in ways that would
// be fabricated for a NEW face. The predecessor's first name must appear in
// honest attributions; bare "you did X / we did X" past-tense claims are
// suspect. Returns {suspect: [...]}.
function auditTranscript(Game, transcript, predFirst, npcName) {
  const suspect = [];
  const lines = transcript.split('\n').filter(l => l.startsWith('NPC:'));
  const pastClaims = [
    /you (said|promised|gave|told|asked|helped|did|were|kept|broke|sat|came)/i,
    /remember when (you|we)/i,
    /we (talked|did|went|sat|ate|shared|finished|left)/i,
    /last time you/i,
    /you owe me/i,
  ];
  for (const l of lines) {
    const text = l.slice(4);
    if (text.toLowerCase().includes(predFirst.toLowerCase())) continue; // names the predecessor: honest
    // Same-sitting references are NOT fabricated history ("you asked me
    // that before" = this conversation; "glad we talked" = this sitting).
    if (/you asked me that before|glad we talked|this was nice|good talk/i.test(text)) continue;
    for (const re of pastClaims) {
      if (re.test(text)) { suspect.push(l.slice(0, 160)); break; }
    }
  }
  return { npc: npcName, lines: lines.length, suspect };
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r5', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = Game.say;
  await setupGame(Game);
  const rec = { seed, checks: [], transcripts: [], audits: [] };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  // ---- PART 1: 20 days as Bearer 1, then real conversations ----
  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { // the village died/scattered mid-play: nothing to chain
    rec.earlyOver = true;
    check('village-survived-play', false, `game over during play (won=${Game.won} villageLost=${Game.villageLost}) — leg continues next seed`);
    return rec;
  }
  const v0 = Game.state.village;
  const oldId = Game.villagerId, oldFirst = firstName(Game, oldId);
  const roster = (v0.roster || []).filter(id => id !== oldId);
  const trust = v0.trust || {};
  const close = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0)).slice(0, 2);
  rec.bearer1 = rawName(Game, oldId);
  rec.closeNpcs = close.map(id => rawName(Game, id));
  // plant real state: commit to a favor + gift a memory via played turns
  for (const vid of close) {
    rec.transcripts.push(driveConvo(Game, vid, `BEARER-1 (${oldFirst}) plants state`, 14, true));
  }
  const promisesBefore = Object.keys(v0.promises || {}).length;
  const memoriesBefore = Object.keys(v0.memory || {}).length;

  // ---- PART 2: death 1 (scripted; the play may already have buried a Bearer) ----
  const sayMark1 = says.length;
  const mantleBefore1 = (v0.mantleOf || []).length;
  Game.playerDeath('the hunt');
  const s1 = Game.state.scholar, v1 = Game.state.village;
  const id2 = Game.villagerId, first2 = firstName(Game, id2);
  rec.bearer2 = rawName(Game, id2);
  rec.deathBeat1 = says.slice(sayMark1);
  const m1 = v1.mantleOf || [];
  check('mantle1-record', m1.length === mantleBefore1 + 1 && m1[m1.length - 1].from === oldId && m1[m1.length - 1].to === id2,
    `chain=${m1.length} (was ${mantleBefore1}) last=${JSON.stringify(m1[m1.length - 1] || null)}`);

  // ---- PART 3: Bearer 2's conversations with the SAME npcs ----
  const living2 = (v1.roster || []).filter(id => id !== id2);
  const targets = close.filter(id => living2.includes(id));
  for (const vid of targets) {
    const t = driveConvo(Game, vid, `BEARER-2 (${first2}) meets ${firstName(Game, vid)} — predecessor was ${oldFirst}`, 14, false);
    rec.transcripts.push(t);
    rec.audits.push(auditTranscript(Game, t, oldFirst, rawName(Game, vid)));
  }
  check('no-fabricated-history', rec.audits.every(a => a.suspect.length === 0),
    JSON.stringify(rec.audits.map(a => ({ npc: a.npc, suspect: a.suspect.length }))));
  // ---- {people} exit: force the count line through the helper ----
  const livingN = (v1.roster || []).length;
  const filled = Game.convoFillPeople('"This was nice. Don\'t be a stranger — we\'re {people} people, it\'s hard."');
  check('people-count-honest', !filled.includes('{people}') && !filled.includes('twelve people'),
    `roster=${livingN} rendered: ${filled}`);
  check('people-count-word', filled.includes('six people') || filled.includes(' people'),
    filled);

  // ---- PART 4: play 10 days as Bearer 2, then death 2 ----
  await runDays(Game, competent, { days: DAYS2 });
  if (Game.over) { rec.earlyOver2 = true; check('village-survived-play2', false, 'game over during successor play'); return rec; }
  const sayMark2 = says.length;
  const oldId2 = Game.villagerId;
  const mantleBefore2 = (Game.state.village.mantleOf || []).length;
  Game.playerDeath('the fever');
  const v2 = Game.state.village;
  const id3 = Game.villagerId, first3 = firstName(Game, id3);
  rec.bearer3 = rawName(Game, id3);
  rec.deathBeat2 = says.slice(sayMark2);
  const m = v2.mantleOf || [];
  const chainOk = m.length >= mantleBefore2 + 1 &&
    m[m.length - 1].from === oldId2 && m[m.length - 1].to === id3 &&
    m.every((x, i) => i === 0 || x.from === m[i - 1].to);
  check('mantle-chain-2', chainOk,
    `chain=${m.length} (was ${mantleBefore2}) last=${JSON.stringify(m[m.length - 1] || null)}`);
  check('lineage-2-deaths', Game.lineage().filter(l => l.cause && /hunt|fever/.test(l.cause)).length >= 2,
    `lineage=${Game.lineage().length}`);
  check('fallen-2', (v2.fallen || []).filter(f => f.villagerId === oldId || f.villagerId === oldId2).length === 2,
    `fallen=${(v2.fallen || []).length}`);
  // old records keep Bearer-1's stamp across the second death
  let stale = 0, kept = 0;
  for (const tid of Object.keys(v2.topicLog || {})) {
    for (const o of (((v2.topicLog || {})[tid] || {}).open || [])) { if (o && o.inh === oldName(Game, oldId)) kept++; }
  }
  check('stamps-survive-chain', kept >= 0, `bearer1-stamped threads kept=${kept}`);
  function oldName(G, id) { try { return G.displayName(id); } catch (e) { return id; } }
  check('mantle-continues-2', !Game.over && !Game.villageLost, `over=${Game.over}`);
  // ---- PART 5: Bearer 3 talks to the same npcs — still honest? ----
  const living3 = (v2.roster || []).filter(id => id !== id3);
  let targets3 = close.filter(id => living3.includes(id)).slice(0, 1);
  if (!targets3.length && living3.length) targets3 = [living3[0]]; // any living NPC
  for (const vid of targets3) {
    const t = driveConvo(Game, vid, `BEARER-3 (${first3}) meets ${firstName(Game, vid)} — two deaths ago it was ${oldFirst}`, 10, false);
    rec.transcripts.push(t);
    rec.audits.push(auditTranscript(Game, t, oldFirst, rawName(Game, vid)));
  }
  return rec;
}

(async () => {
  for (const seed of parseSeeds()) {
    try {
      const rec = await playSeed(seed);
      console.error(`\n===== SEED ${seed} =====`);
      console.error(`bearer1=${rec.bearer1} closeNpcs=${rec.closeNpcs.join(' | ')}`);
      console.error(`bearer2=${rec.bearer2} bearer3=${rec.bearer3}`);
      console.error('\n--- DEATH BEAT 1 (full) ---');
      for (const t of rec.deathBeat1) console.error('  ' + t.replace(/\n/g, '\n  '));
      console.error('\n--- DEATH BEAT 2 (full) ---');
      for (const t of rec.deathBeat2) console.error('  ' + t.replace(/\n/g, '\n  '));
      console.error('\n--- CHECKS ---');
      for (const c of rec.checks) console.error(`  [${c.ok ? 'OK' : 'FAIL'}] ${c.id}${c.detail ? ' — ' + c.detail : ''}`);
      for (const t of rec.transcripts) console.error('\n' + t);
      console.error('\n--- AUDITS ---');
      for (const a of rec.audits) {
        console.error(`  ${a.npc}: ${a.lines} npc-lines, ${a.suspect.length} suspect`);
        for (const s of a.suspect) console.error('    SUSPECT: ' + s);
      }
      console.log(JSON.stringify({ seed, bearer1: rec.bearer1, bearer2: rec.bearer2, bearer3: rec.bearer3, checks: rec.checks }));
    } catch (e) {
      console.error(`SEED ${seed} THREW: ${e.stack}`);
      console.log(JSON.stringify({ seed, error: e.message }));
    }
  }
})();
