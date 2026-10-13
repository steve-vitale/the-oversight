// convo-probe-20261013.js — standalone conversation probe for the endgame leg.
// Load -> run to day X with a pinned policy -> have ONE conversation ->
// write the transcript -> exit. Never runs a convo inside a day loop
// (that wedges the loop; see journey-endgame-r8 note).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-13');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
const SEED = parseInt(process.env.SEED || '22', 10);
const DAY = parseInt(process.env.DAY || '60', 10);
const PID = process.env.POLICY || 'belongseek';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const POLICY_REGISTRY = { belongseek };
const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
// ---- conversation driver (from journey-scale-r1-20261013.js) ----
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
  const yn = list.find(x => x && x.id === 'gq:yn:unsure') || list.find(x => x && x.id === 'gq:yn:yes') || list.find(x => x && x.id === 'gq:yn:no');
  if (yn) return yn;
  const bdec = list.find(x => x && x.id === 'betrayal:decline');
  if (bdec) return bdec;
  const nv = list.find(x => x && x.id === 'nv:listen') || list.find(x => x && x.id === 'nv:nod') || list.find(x => x && x.id && x.id.indexOf('nv:') === 0);
  if (nv) return nv;
  return list.find(x => x && x.id === 'leave') || list[0] || null;
}
let _G = null, _seed = null, _pol = null;
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function runConversation(gday, vid, tag) {
  const fp = path.join(EVIDIR, `journey-endgame-r9-transcript-${_pol}-s${_seed}-day${gday}-${tag}.txt`);
  const L = [];
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    L.push(`=== seed ${_seed} policy ${_pol} day ${gday} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    L.push(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    L.push(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    L.push('');
    L.push(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick) { L.push('YOU: (no usable choice; ending)'); break; }
      if (pick.id === 'leave') { L.push('YOU: (leave)'); break; }
      L.push(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) L.push(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      L.push(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { L.push('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { L.push('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) L.push(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    L.push(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) L.push(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    L.push('CONVO ERROR: ' + (e && e.stack || e));
  }
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}
function pickConvoVillager() {
  try {
    const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
    const alive = roster.filter(id => !person(id).dead);
    const scored = alive.map(id => {
      let cnt = 999;
      try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
      let commOk = true;
      try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; commOk = comm.level !== 'none'; } catch (e) {}
      return { id, cnt, commOk };
    }).filter(x => x.commOk).sort((a, b) => a.cnt - b.cnt);
    return scored.length ? scored[0].id : null;
  } catch (e) { return null; }
}


async function main() {
  const base = POLICY_REGISTRY[PID];
  if (!base) throw new Error('unknown policy: ' + PID);
  _seed = SEED; _pol = PID;
  const { Game } = await loadGame({ seed: SEED, mode: 'convo-probe-' + PID });
  _G = Game;
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  await runDays(Game, policy, { days: DAY, sampleEvery: 10 });
  const vid = pickConvoVillager();
  if (!vid) { console.log('no conversable villager alive at day ' + day(Game)); process.exit(0); }
  const fp = runConversation(day(Game), vid, 'probe');
  console.log('transcript: ' + fp);
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
