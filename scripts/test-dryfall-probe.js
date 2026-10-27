#!/usr/bin/env node
// test-dryfall-probe.js -- MECHANISM PROBE for triage B7 (dry-fallback frequency).
// No game change. Two parts:
//  A) Controlled sayLine test: villager A speaks a synthetic generic line,
//     villager B attempts the SAME line -> run-ledger block -> dry line?
//  B) Natural walk: talk to the first 6 living villagers, up to 12 turns
//     each, preferring topic/ask choices; wrap sayLine to classify every
//     emission as run-blocked / self-blocked / unblocked, and count
//     deflection lines in transcripts. Reports which lines block, and
//     whether blocked lines were already spoken by ANOTHER villager.
// Usage: node scripts/test-dryfall-probe.js [seed]
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { offers } = require('./lib/conversation-playtest');

function safe(fn, d) { try { return fn(); } catch (e) { return d; } }

async function main() {
  const seed = parseInt(process.argv[2] || '777001', 10);
  const { Game } = await loadGame({ seed, mode: 'dryfall-probe' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  console.log('seed', seed, 'roster', roster.length, 'bearer', Game.displayName(sid));

  // ---------- Part A: controlled cross-villager repeat ----------
  const A = roster[0], B = roster[1];
  const LINE = '"The village is holding up, I suppose."';
  safe(() => Game.startConvo(A), null);
  const aFirst = safe(() => Game.sayLine(A, LINE), null);
  console.log('A sayLine:', JSON.stringify(aFirst));
  safe(() => { try { Game.convoTurn(A, 'leave'); } catch (e) {} }, null);
  safe(() => Game.startConvo(B), null);
  const ledgerBefore = (safe(() => Game.convoRunLedger(), []) || []).slice(-5);
  const would = safe(() => Game.convoWouldBlock(B, LINE), '?');
  const bFirst = safe(() => Game.sayLine(B, LINE), null);
  console.log('B wouldBlock before:', would, 'ledgerTail:', JSON.stringify(ledgerBefore));
  console.log('B sayLine (same line):', JSON.stringify(bFirst));
  const dryLines = safe(() => Game.convoDeflectionLines(), []);
  console.log('B result is dry-pool line?', dryLines.includes(bFirst), '| is train line?', bFirst === dryLines[0]);
  safe(() => { try { Game.convoTurn(B, 'leave'); } catch (e) {} }, null);

  // ---------- Part B: natural walk with sayLine wrapper ----------
  const origSay = Game.sayLine.bind(Game);
  const events = []; // {vid, pick, inputFirst, blockedKind, returned, spokenByOtherBefore}
  const spokenBy = new Map(); // first-chunk -> first villager name who spoke it (unblocked)
  let curPick = null;
  Game.sayLine = function (vid, line, opts) {
    const t = String(line == null ? '' : line);
    let first = '';
    try { first = (Game.convoSplitBeats(t)[0] || '').trim(); } catch (e) { first = t; }
    let kind = 'unblocked';
    try {
      const c = Game.convoGet(vid);
      const inConvo = c && (c.saidLinesConvo || []).indexOf(first) !== -1;
      const inRun = (Game.convoRunLedger() || []).indexOf(first) !== -1;
      const exempt = !!(opts && (opts.inviteBeat || opts.diegeticAct || opts.structural));
      if (!exempt && inConvo) kind = 'self-block';
      else if (!exempt && inRun) kind = 'run-block';
    } catch (e) {}
    const ret = origSay(vid, line, opts);
    const otherBefore = spokenBy.has(first) && spokenBy.get(first) !== vid ? spokenBy.get(first) : null;
    events.push({ vid, pick: curPick, input: first.slice(0, 110), kind, returned: ret ? String(ret).slice(0, 110) : ret, otherBefore });
    if (kind === 'unblocked' && ret && !spokenBy.has(first)) spokenBy.set(first, vid);
    return ret;
  };

  const DRY = new Set(dryLines.map(d => d.replace(/^"+|"+$/g, '')));
  const isDry = (txt) => txt && DRY.has(String(txt).trim().replace(/^"+|"+$/g, ''));
  let convos = 0, turns = 0, dryTurns = 0, endOnDry = 0, stallConvos = 0;
  const blockedInputs = {};
  const blockedTextCount = {};
  const pickCount = {};
  const ROUNDS = parseInt(process.env.ROUNDS || '4', 10);
  for (let round = 0; round < ROUNDS; round++) {
  for (const vid of roster.slice(0, 6)) {
    safe(() => Game.startConvo(vid), null);
    const c = Game.convoGet(vid);
    if (!c || !c.active) continue;
    convos++;
    let convoDry = 0, lastWasDry = false, convoHadDry = false;
    for (let n = 0; n < 12; n++) {
      const ui = safe(() => Game.convoUI(vid), null);
      if (!ui || !ui.active) break;
      const list = offers(Game, vid);
      // r60-like order: gossip, answers, others, fresh asks, asks, reacts
      const seenHere = [];
      let pick = list.find(x => x.id === 'ask:gossip')
        || list.find(x => /^ans:/.test(x.id))
        || list.find(x => x.id === 'ask:others')
        || list.find(x => /^ask:/.test(x.id))
        || list.find(x => x.id === 'more')
        || list.find(x => x.id === 'agree')
        || list.find(x => x.id === 'silence')
        || list.find(x => x.id !== 'leave');
      if (!pick) break;
      curPick = pick.id;
      pickCount[pick.id] = (pickCount[pick.id] || 0) + 1;
      const before = events.length;
      safe(() => Game.convoTurn(vid, pick.id), null);
      turns++;
      const newEv = events.slice(before);
      const gotDry = newEv.some(e => isDry(e.returned));
      const tr = (Game.convoGet(vid).transcript || []).slice(-3).map(e => e.text);
      const tailDry = tr.some(isDry);
      if (gotDry || tailDry) { dryTurns++; convoDry++; lastWasDry = true; convoHadDry = true; } else lastWasDry = false;
      for (const e of newEv) {
        if (e.kind !== 'unblocked') {
          const k = e.kind + '|' + (e.otherBefore ? 'cross-villager' : 'same-villager') + '|' + e.pick;
          blockedInputs[k] = (blockedInputs[k] || 0) + 1;
          blockedTextCount[e.input] = (blockedTextCount[e.input] || 0) + 1;
        }
      }
      if (!Game.convoGet(vid).active) break;
    }
    if (lastWasDry) endOnDry++;
    if (convoHadDry) stallConvos++;
    safe(() => { try { if (Game.convoGet(vid).active) Game.convoTurn(vid, 'leave'); } catch (e) {} }, null);
    console.log('walk round', round, Game.displayName(vid), 'dryTurns-in-convo', convoDry);
  }
  }
  Game.sayLine = origSay;

  const byKind = {};
  for (const e of events) byKind[e.kind] = (byKind[e.kind] || 0) + 1;
  console.log('--- PART B SUMMARY ---');
  console.log('convos', convos, 'turns', turns, 'sayLine events', events.length, 'byKind', JSON.stringify(byKind));
  console.log('dryTurns', dryTurns, 'dryTurns/turn', turns ? (dryTurns / turns).toFixed(3) : '-', 'convos ending on dry', endOnDry, '/', convos, 'convos with >=1 dry', stallConvos, '/', convos, 'dryTurns/convo', convos ? (dryTurns / convos).toFixed(3) : '-');
  console.log('pick distribution', JSON.stringify(pickCount));
  console.log('blocked breakdown (kind|cross?|pick):', JSON.stringify(blockedInputs, null, 1));
  console.log('blocked input texts (count x text):');
  for (const [t, n] of Object.entries(blockedTextCount).sort((a, b) => b[1] - a[1])) console.log(' ', n, JSON.stringify(t));
  const runBlocked = events.filter(e => e.kind === 'run-block');
  console.log('run-blocked inputs (first 25):');
  for (const e of runBlocked.slice(0, 25)) console.log('  pick=', e.pick, 'otherBefore=', e.otherBefore ? Game.displayName(e.otherBefore) : null, 'input=', JSON.stringify(e.input), '->', JSON.stringify(e.returned));
  const selfBlocked = events.filter(e => e.kind === 'self-block');
  console.log('self-blocked count', selfBlocked.length, 'sample:');
  for (const e of selfBlocked.slice(0, 10)) console.log('  pick=', e.pick, 'input=', JSON.stringify(e.input));
  // Distinct-line census: how many distinct unblocked lines, how many repeated across villagers
  const unblocked = events.filter(e => e.kind === 'unblocked');
  const distinct = new Set(unblocked.map(e => e.input));
  console.log('unblocked events', unblocked.length, 'distinct first-chunks', distinct.size);
  // ---------- Proof assertions (RED pre-fix, GREEN post-fix on seed 777001) ----------
  const CLOSING = new Set([
    '"Good talk. I feel like I know you a little better now."',
    '"Alright. Catch you later."', '"Anyway — I should get going."',
    '"I should get back to it."', '"Right. Well." That\'s the whole goodbye.',
    '"And... scene. Good talk."', '"Rest when you can. We\'ll talk again soon."',
    '"Okay — I need to move. But I\'m glad we talked."',
    '"Anyway — I should get back to it."', '"This was good." They mean it.',
    'They nod, already turning away.', 'They\'re smiling as you go. "Come back anytime."',
  ]);
  let fails = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS: ' : 'FAIL: ') + name); if (!cond) fails++; };
  check('P5 pool still works: forced cross-villager content repeat draws the train line', bFirst === dryLines[0]);
  const blockedClosing = events.filter(e => e.kind !== 'unblocked' && CLOSING.has(e.input));
  check('closing beats are never ledger-blocked (was 19 run-blocks pre-fix)', blockedClosing.length === 0);
  check('dry turns per conversation below 0.25 (was 1.208 pre-fix)', convos ? (dryTurns / convos) <= 0.25 : false);
  check('no conversation ends on a dry line (was 17/24 pre-fix)', endOnDry === 0);
  check('conversations still happen (24 sittings)', convos === 24);
  if (fails) { console.log('PROOF RESULT: FAIL (' + fails + ')'); process.exit(1); }
  console.log('PROOF RESULT: PASS');
}
main().catch(e => { console.error('PROBE ERROR', e && e.stack || e); process.exit(1); });
