#!/usr/bin/env node
// convo-probe-table-r11-20261014.js — journey-endgame r11 people check.
// RED/verify: the table fires (unanswered) and the village should talk
// about it first. Run leadfeast to DAY (default 70; s84's scene fires d65),
// have conversations with N villagers, report whether anyone mentions the
// table. TOOLING ONLY — no game balance changes.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-14');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
const SEED = parseInt(process.env.SEED || '84', 10);
const DAY = parseInt(process.env.DAY || '70', 10);
const NV = parseInt(process.env.NV || '2', 10);
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id === 'ans:0' || (x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1));
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react'); if (react && turn < 6) return react;
  const yn = list.find(x => x && x.id === 'gq:yn:unsure') || list.find(x => x && x.id === 'gq:yn:yes') || list.find(x => x && x.id === 'gq:yn:no');
  if (yn) return yn;
  const bdec = list.find(x => x && x.id === 'betrayal:decline'); if (bdec) return bdec;
  const nv = list.find(x => x && x.id === 'nv:listen') || list.find(x => x && x.id === 'nv:nod') || list.find(x => x && x.id && x.id.indexOf('nv:') === 0);
  if (nv) return nv;
  return list.find(x => x && x.id === 'leave') || list[0] || null;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'endgame-r11-tableprobe' });
  await setupGame(Game);
  await runDays(Game, leadfeast, { days: DAY, sampleEvery: 30 });
  const gday = (Game.state.scholar || {}).day || 0;
  const pg = (Game.progState && Game.progState()) || {};
  const T = (Game.tableState && Game.tableState()) || {};
  console.log(`[probe] seed ${SEED} day ${gday}: tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} phase=${T.phase || 'idle'} winDeferred=${!!T.winDeferred}`);
  const roster = (Game.state.village.roster || []).filter(id => {
    try { const p = Game.getPerson(id) || {}; return !p.dead; } catch (e) { return false; }
  });
  // Verbal villagers only, via the same gate startConvo uses (commLevel) —
  // without opening conversations (a pre-screen startConvo would consume
  // the table opener via the once-per-sitting mark).
  const vids = [];
  for (const vid of roster) {
    if (vids.length >= NV) break;
    try {
      const comm = Game.commLevel ? Game.commLevel(vid) : { level: 'full' };
      if (comm && comm.level === 'none') continue;
      vids.push(vid);
    } catch (e) { vids.push(vid); }
  }
  let mentioned = 0, convos = 0;
  for (const vid of vids) {
    const L = [];
    let nm = vid; try { nm = Game.displayName(vid) || vid; } catch (e) {}
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    L.push(`=== seed ${SEED} day ${gday} — conversation with ${nm} (${vid}) ===`);
    L.push(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''}) thread=${(c && c.thread) || '?'}`);
    L.push(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      const pk = pickChoice(choices, turn);
      if (!pk) { L.push('YOU: (no usable choice; ending)'); break; }
      if (pk.id === 'leave') { L.push('YOU: (leave)'); break; }
      L.push(`YOU: [${pk.id}] ${pk.label || ''}`);
      try { r = Game.convoTurn(vid, pk.id); } catch (e) { L.push('(choose threw: ' + e.message + ')'); break; }
      if (r.line) L.push(`THEM: ${r.line}`);
      const w = (Game.convoGet(vid).want) || {};
      L.push(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { L.push('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { L.push('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) L.push(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    L.push(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const text = L.join('\n');
    const hit = /table|ring of pale light|seven doors|the table sits/i.test(text);
    if (hit) mentioned++;
    convos++;
    L.push(`\n[probe] table-mentioned: ${hit}`);
    fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r11-tableprobe-s${SEED}-day${gday}-${vid}.txt`), text);
    console.log(`[probe] ${nm}: table-mentioned=${hit}`);
  }
  console.log(`[probe] RESULT: ${mentioned}/${convos} conversations mentioned the table`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
