#!/usr/bin/env node
// table-answer-probe-r12-20261015.js — ENDGAME leg r12: ANSWER the table in-harness, then probe conversations.
// r10's scenes sat unanswered (sanctity froze the world); this run drives the
// natural scene to completion as a competent player would: pick the preferred
// earned path (PATH_PREF, e.g. relay — never answered end-to-end) or the
// strongest earned path, play its challenge beats, take the opt-in
// trial-by-combat when offered (it's legible and real), refuse the dark
// conscript, then keep the run going to see the aftermath. Seat-none runs: the withdrawal beat plays.
// SEED env: s48 = full-seat answer candidate (r12 pilot). PATH_PREF=relay,beloved,... PROBE=1: after the run, hold post-table conversations.
// TOOLING ONLY — no game balance changes.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-15');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
const SEED = parseInt(process.env.SEED || '84', 10);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const { loadGame, setupGame, runDays, driveFights } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const LINES = [];
function hookSay(G) {
  const osay = G.say, osys = G.sysSay;
  G.say = function (t) { try { LINES.push('[say] ' + String(t)); } catch (e) {} return osay.call(this, t); };
  G.sysSay = function (t) { try { LINES.push('[sys] ' + String(t)); } catch (e) {} return osys.call(this, t); };
}
function choicesOf(G) {
  try { return (G.state.scholar.tableChoices || {}).options || []; } catch (e) { return []; }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'endgame-r12-answer' });
  await setupGame(Game);
  hookSay(Game);
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  let answered = false, answerDay = null, auditMark = 0, lastSig = null, reoffers = 0;
  let seenDeferred = false; // the win-day-floor deferral re-arms the table
  policy.daily = (G, ctx) => {
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  // We need the answer to happen right after the scene fires at dawn. The
  // daily hook runs once per day; the scene fires inside the day tick. Check
  // post-tick state each day: tableDone && phase == 'paths' with choices.
  const checkDaily = (G) => {
    try {
      const pg = (G.progState && G.progState()) || {};
      const T = G.tableState ? G.tableState() : {};
      const opts = choicesOf(G);
      if (T && T.winDeferred) seenDeferred = true;
      if (T && T.phase === 'paths' && opts.length > 0 && pg.tableDone) {
        // Re-offer (win-day-floor deferral) can carry an IDENTICAL option-id
        // signature to the first offer (r12: s48 beloved re-offer sat 90 days
        // unanswered because sig matched). The deferral flag disambiguates:
        // a seen deferral since the last answer means this is a new offer.
        const sig = opts.map(o => o.id).join(',') + '|deferred:' + (seenDeferred ? '1' : '0');
        if (sig === lastSig) return;
        lastSig = sig; seenDeferred = false;
        if (!answered) { answerDay = day(G); auditMark = LINES.length; }
        else { reoffers++; LINES.push(`[driver] re-offer day ${day(G)} — answering again`); }
        answered = true;
        answerScene(G);
      } else if (T && T.phase === 'paths' && pg.tableWaiting && !pg.tableDone && !T.winDeferred) {
        // withdrawal beat fired silently? the scene only fires at dawn;
        // seat-none withdraws inside tableScene — capture it once. (Deferral
        // windows also sit with phase='paths' — those are NOT withdrawals.)
        if (pg._r12withdrew == null) { pg._r12withdrew = day(G); }
      }
    } catch (e) {}
  };
  const wrapped = Object.assign({}, policy, { daily: (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } checkDaily(G); } });
  const result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 30 });
  const pg = Game.progState();
  const out = {
    label: 'journey-endgame-r12-answer', seed: SEED, days: result.days, endReason: result.endReason,
    answerDay, withdrawalDay: pg._r12withdrew != null ? pg._r12withdrew : null,
    reoffers,
    won: !!Game.won, over: !!Game.over,
    tableFinalPhase: (Game.tableState && Game.tableState().phase) || null,
    tableFinalPath: (Game.tableState && Game.tableState().path) || null,
    bearer: (Game.state.scholar || {}).name || null,
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r12-answer-s${SEED}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r12-answer-s${SEED}.txt`), LINES.join('\n'));
  console.log(`[answer s${SEED}] d=${out.days} ${out.endReason} answerDay=${out.answerDay} withdrawalDay=${out.withdrawalDay} phase=${out.tableFinalPhase} path=${out.tableFinalPath} won=${out.won} over=${out.over} bearer=${out.bearer}`);
  if (process.env.PROBE === '1') await probePostTable(Game);
}

// ---- post-answer people check (PROBE=1): conversations AFTER the table
// resolved, in the same Game. r12: does the village acknowledge the won
// table? (convo-probe-table-r12-20261015.js pickChoice logic, inlined.)
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
  const yn = list.find(x => x && x.id === 'gq:yn:unsure') || list.find(x => x.id === 'gq:yn:yes') || list.find(x => x.id === 'gq:yn:no');
  if (yn) return yn;
  const bdec = list.find(x => x.id === 'betrayal:decline'); if (bdec) return bdec;
  const nv = list.find(x => x && x.id === 'nv:listen') || list.find(x => x.id === 'nv:nod') || list.find(x => x.id && x.id.indexOf('nv:') === 0);
  if (nv) return nv;
  return list.find(x => x && x.id === 'leave') || list[0] || null;
}
async function probePostTable(Game) {
  const gday = (Game.state.scholar || {}).day || 0;
  const pg = (Game.progState && Game.progState()) || {};
  const T = (Game.tableState && Game.tableState()) || {};
  console.log(`[probe] seed ${SEED} day ${gday} POST-TABLE: won=${!!Game.won} over=${!!Game.over} phase=${T.phase || 'idle'}`);
  const roster = (Game.state.village.roster || []).filter(id => {
    try { const p = Game.getPerson(id) || {}; return !p.dead; } catch (e) { return false; }
  });
  const NV = parseInt(process.env.NV || '2', 10);
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
    let r0;
    try { r0 = Game.startConvo(vid); } catch (e) { L.push('startConvo threw: ' + e.message); }
    if (!r0) { console.log(`[probe] ${nm}: could not start convo (post-win state)`); continue; }
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    L.push(`=== seed ${SEED} day ${gday} POST-WIN — conversation with ${nm} (${vid}) ===`);
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
    const text = L.join('\n');
    const hit = /table|ring of pale light|seven doors|the table sits|both-hands|both hands/i.test(text);
    if (hit) mentioned++;
    convos++;
    L.push(`\n[probe] post-win table-mentioned: ${hit}`);
    fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r12-postwin-s${SEED}-day${gday}-${vid}.txt`), text);
    console.log(`[probe] ${nm}: post-win table-mentioned=${hit}`);
  }
  console.log(`[probe] POST-WIN RESULT: ${mentioned}/${convos} conversations mentioned the table`);
}

const PATH_PREF = (process.env.PATH_PREF || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean); // e.g. PATH_PREF=relay,beloved,defiant
function answerScene(G) {
  const LOG = [];
  try {
    const paths = (G.tableEarnedPaths && G.tableEarnedPaths()) || [];
    const earned = paths.filter(p => p.earned).sort((a, b) => (b.strength | 0) - (a.strength | 0));
    LINES.push(`[driver] earned: ${earned.map(p => p.id + '(' + p.strength + ')').join(', ') || 'none'}; unearned: ${paths.filter(p => !p.earned).map(p => p.id).join(', ')}`);
    if (!earned.length) { LINES.push('[driver] no earned paths — nothing to answer with'); return; }
    // r12: PATH_PREF (comma-separated preference list) lets the run walk a
    // NON-STRONGEST earned path (e.g. relay — never answered end-to-end).
    // Preference-list order wins: the first LISTED id that is earned is
    // walked. Falls back to strongest earned when nothing listed is earned.
    let pref = null;
    for (const pid of PATH_PREF) { pref = earned.find(p => String(p.id).toLowerCase() === pid); if (pref) break; }
    const pick = pref || earned[0];
    LINES.push(`[driver] competent player walks the path of ${pick.id} (${pref ? 'PATH_PREF first-listed-earned, strength ' + pick.strength : 'strongest earned, strength ' + pick.strength})`);
    G.chooseTableOption('path:' + pick.id);
    let steps = 0, fails = 0;
    const seen = {};
    while (steps++ < 100) {
      const T = G.tableState();
      const phase = T.phase;
      if (phase === 'done') { LINES.push(`[driver] resolved: done after ${steps} steps, won=${!!G.won} over=${!!G.over}`); break; }
      if (T.trialPending && G.tbfight && !G.tbfight.over) {
        LINES.push('[driver] trial-by-combat offered — a competent player takes it (opt-in, legible, real)');
        try { driveFights(G, require('./policies/feastscale').leadfeast, {}); } catch (e) { LINES.push('[driver] driveFights threw: ' + (e && e.message)); }
        LINES.push(`[driver] trial exit: tbfight=${G.tbfight ? 'still up' : 'none'}, phase=${G.tableState().phase}`);
        continue;
      }
      const opts = choicesOf(G);
      if (!opts.length) { LINES.push(`[driver] DEAD BEAT: phase=${phase} beat=${T.beat} — no options`); break; }
      const sig = phase + '|' + T.beat + '|' + opts.map(o => o.id).join(',');
      seen[sig] = (seen[sig] || 0) + 1;
      if (seen[sig] > 3) { LINES.push(`[driver] DEAD BEAT: choice loop at ${sig}`); break; }
      let c = null;
      if (phase === 'challenge') c = opts[0];           // play the beats honestly
      else if (phase === 'finals') c = opts[0];
      else if (phase === 'downgrade') { fails++; c = opts[0]; LINES.push(`[driver] downgrade: taking ${c.id}`); }
      else if (phase === 'demand-price') c = opts[0];
      else if (phase === 'conscript') { c = opts.find(o => o.id === 'conscript:no') || opts[0]; LINES.push(`[driver] conscript refused (${c.id})`); }
      else c = opts[0];
      LINES.push(`[driver] [${phase} beat ${T.beat}] -> ${c.id} "${String(c.label).slice(0, 70)}"`);
      try { G.chooseTableOption(c.id); } catch (e) { LINES.push(`[driver] chooseTableOption(${c.id}) THREW: ` + (e && e.message)); break; }
      if (fails > 2) { LINES.push('[driver] too many downgrades — stopping'); break; }
    }
  } catch (e) { LINES.push('[driver] FATAL: ' + (e && e.stack || e)); }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
