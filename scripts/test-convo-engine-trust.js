#!/usr/bin/env node
// Convo dramatic engine rebuild — PROOF (Worker A, 2026-10-11).
// Conversation (c): HIGH-TRUST. At trust 60+, the conversation still opens
// with a want (not empty small talk), the menu engages/deflects it, beats
// never repeat verbatim, and the ending resolves/plants/owes. Also proves
// the seed loop: an unfinished want resurfaces next conversation.
//
// Shared seeded runtime, one load per process, full production module order.
//
// Usage: node scripts/test-convo-engine-trust.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261013', 10);

const H=require('./sim-harness');let Game;



let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}
function vname(vid) {
  try { return Game.villagerName(vid) || vid; } catch (e) { return vid; }
}

const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy'];
function pickChoice(choices, turn) {
  for (const id of ENGAGE) {
    const c = (choices || []).find(x => x && x.id === id);
    if (c) return c;
  }
  const ans = (choices || []).find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  const gq = (choices || []).find(x => x && x.id && x.id.indexOf('gq:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (gq) return gq;
  const react = (choices || []).find(x => x && x.id === 'dlg:react');
  if (react && turn < 7) return react;
  return (choices || []).find(x => x && x.id === 'leave') || null;
}

function runConversation(vid, maxTurns, label) {
  const lines = [];
  const r0 = Game.startConvo(vid);
  if (r0.line) lines.push({ who: 'THEM', text: String(r0.line) });
  let r = r0, advanced = false;
  for (let turn = 0; turn < maxTurns; turn++) {
    const choices = r.choices && r.choices.length ? r.choices : Game.convoChoices(vid);
    const pick = pickChoice(choices, turn);
    if (!pick || pick.id === 'leave') break;
    const before = (Game.convoGet(vid).want || {}).stage || 0;
    lines.push({ who: 'YOU', text: String(pick.label) });
    r = Game.convoTurn(vid, pick.id);
    const after = (Game.convoGet(vid).want || {}).stage || 0;
    if (after > before) advanced = true;
    if (r.line) lines.push({ who: 'THEM', text: String(r.line) });
    if (r.ended) break;
  }
  return { lines, advanced, opener: r0.line, openerChoices: r0.choices };
}

async function main() {
  Game=(await H.loadGame({seed:SEED,mode:'convo-probe',narration:true})).Game;
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = npcs.filter(id => { try { return Game.npcComm(id).level !== 'none'; } catch (e) { return true; } })[0];
  // High trust: earned standing.
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 65;
  console.log(`=== Convo Engine Proof (c): high-trust conversation (seed ${SEED}) === day=20, trust=65`);
  console.log(`Talking to: ${vname(vid)}`);

  // Conversation 1: engage the want, then LEAVE mid-arc (unfinished business).
  console.log(`\n--- CONVERSATION 1 (leave the want hanging) ---`);
  const c1 = runConversation(vid, 0, 'c1');
  for (const l of c1.lines) console.log(`${l.who}: ${l.text}`);
  const w1 = Game.convoGet(vid).want || {};
  console.log(`want after c1: ${w1.id} stage=${w1.stage} resolution=${w1.resolution}`);
  const pendingQuestion=Game.convoGet(vid).pendingQ?.id;
  ok('first sitting actually leaves a voiced question unanswered', !!pendingQuestion && w1.stage === 1);
  const beforeEnd = Game.convoGet(vid).transcript.length;
  Game.endConvo(vid, 'left');
  const closing1 = Game.convoGet(vid).transcript.slice(beforeEnd).filter(e => e.who === 'them').map(e => e.text);
  for (const l of closing1) console.log(`THEM: ${l}`);
  const seed = ((Game.state.village.convoSeeds || {})[vid]) || null;
  console.log(`seed planted: ${seed ? seed.wantId + ' — "' + seed.note + '"' : 'none'}`);

  ok('high-trust opener carries a want (not empty small talk)',
    !!(w1.id && w1.def), `want=${w1.id}`);
  const menuOk = c1.openerChoices.some(x => x && /dlg:help|dlg:commit|dlg:heed|dlg:stay|dlg:cant|dlg:details|dlg:comfort/.test(x.id)) ||
                 c1.openerChoices.some(x => x && x.id && x.id.indexOf('ans:') === 0);
  ok('high-trust menu engages/deflects the want', menuOk,
    c1.openerChoices.map(x => x && x.id).join(','));

  // Conversation 2 (next day): the unfinished want resurfaces.
  Game.state.scholar.day = 21;
  console.log(`\n--- CONVERSATION 2 (next day — unfinished business resurfaces) ---`);
  const r2 = Game.startConvo(vid);
  const w2 = Game.convoGet(vid).want || {};
  console.log(`THEM: ${r2.line}`);
  console.log(`want: ${w2.id} stage=${w2.stage} fromSeed=${w2.fromSeed}`);
  ok('unfinished curiosity resumes the exact question rather than another topic', w2.qid === pendingQuestion, JSON.stringify({pendingQuestion,resumed:w2.qid}));
  const resumed = w2.fromSeed === true || /about .* —/i.test(String(r2.line));
  // Finish it honestly this time: commit or deflect, then end.
  const lines2 = [{ who: 'THEM', text: String(r2.line) }];
  let r = r2;
  for (let turn = 0; turn < 6; turn++) {
    const choices = r.choices && r.choices.length ? r.choices : Game.convoChoices(vid);
    const commit = (choices || []).find(x => x && x.id === 'dlg:commit');
    const heed = (choices || []).find(x => x && x.id === 'dlg:heed');
    const cant = (choices || []).find(x => x && x.id === 'dlg:cant');
    const pick = commit || heed || cant || pickChoice(choices, turn);
    if (!pick || pick.id === 'leave') break;
    lines2.push({ who: 'YOU', text: String(pick.label) });
    console.log(`YOU:  ${pick.label}`);
    r = Game.convoTurn(vid, pick.id);
    if (r.line) { lines2.push({ who: 'THEM', text: String(r.line) }); console.log(`THEM: ${r.line}`); }
    if (r.ended) break;
  }
  const beforeEnd2 = Game.convoGet(vid).transcript.length;
  Game.endConvo(vid, 'left');
  const closing2 = Game.convoGet(vid).transcript.slice(beforeEnd2).filter(e => e.who === 'them').map(e => e.text);
  ok('answered curiosity ends with one normal farewell, not an extra summary', closing2.length === 1);
  console.log('--- CLOSING ---');
  for (const l of closing2) console.log(`THEM: ${l}`);
  const w2end = Game.convoGet(vid).want || {};

  ok('answered question is not replanted just because the player leaves', !Game.state.village.convoSeeds[vid]);
  // Zero verbatim repeats across BOTH conversations.
  const allThem = c1.lines.concat(lines2).filter(l => l.who === 'THEM').map(l => l.text)
    .concat(closing1, closing2);
  const dupes = allThem.filter((t, i) => allThem.indexOf(t) !== i);
  ok('zero verbatim NPC repeats across both conversations', dupes.length === 0,
    dupes.slice(0, 2).join(' | ').slice(0, 160));

  ok('unfinished want resurfaced next conversation (seed -> opener)', resumed,
    `fromSeed=${w2.fromSeed}`);
  ok('second conversation ended resolved (resolution recorded)',
    (w2end.stage || 0) >= 3 && !!w2end.resolution,
    `stage=${w2end.stage} resolution=${w2end.resolution}`);
  ok('a normal closing is spoken after the answered question', closing2.length >= 1,
    `${closing2.length} closing beats`);
  ok('no leaked "(last time)" internal note',
    !/\(last time\)/i.test(allThem.join('\n')));

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
