// test-journey-social-r154-recap.js — proof test for the r154 M9 recap-cap fix.
//
// DEFECT (r153 open, M9 FAIL): the recap cap does not fire in the wild —
// 7 conversations pressed 'recap' 6 times, 196 total presses on seed
// 42302. Root cause: convoRecapLine spends 'recap' only when the SAME raw
// recap line has been repeated 5 times (_recapReframes >= 5). But the raw
// line is derived from the last two thread-log entries, which change as
// the conversation moves — and every recap press itself appends a
// thread-log entry (convoTurn's tail calls convoNoteBeat), so the next
// press re-anchors to a new arc. A fresh re-anchor never increments the
// reframe counter, so the choice never spends. (And even on an
// unchanging thread the spend lands on the 6th press, not after the 5th
// as the r27/r31 design says — off by one on both paths.)
//
// FIX (src/js/conversation.js): per-sitting press counter c._recapPresses
// (reset in startConvo); after serving the 5th press, spend 'recap' via
// convoSpendChoice whatever the line was. The r27/r31 reframe/escalation
// line-content machinery is untouched.
//
// Run: node scripts/test-journey-social-r154-recap.js  (exit 0 = PASS)
// RED on unfixed code (6th press served, spent.recap unset); GREEN after.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const ROTATE = ['goal', 'past', 'plans', 'village', 'gossip', 'personal'];

(async () => {
  const { Game } = await loadGame({ seed: 42601, mode: 'test-r154-recap', fullTelemetry: false, narration: false });
  await setupGame(Game);
  const village = Game.state.village || {};
  const roster = (village.roster || []).filter(v => v !== Game.villagerId);
  check('setup: roster has villagers', roster.length >= 2, 'roster=' + roster.length);
  try { for (const v of roster) ((Game.state.village || {}).trust || {})[v] = 60; } catch (e) {}
  const vidA = roster[0];
  const vidB = roster[1];

  // Drive the conversation along (never pressing 'recap') until 'recap'
  // first appears in the menu. Returns false if the sitting ends first.
  function driveToRecap(vid) {
    for (let t = 0; t < 14; t++) {
      const c = Game.convoGet(vid);
      if (!c || !c.active) return false;
      const ch = Game.convoChoices(vid) || [];
      if (ch.some(x => x && x.id === 'recap')) return true;
      const more = ch.find(x => x && x.id === 'dlg:more');
      const subj = ch.find(x => x && x.id === 'dlg:subject');
      const topicGoal = ch.find(x => x && /goal/i.test(String(x.id || '')));
      const pick = ch.find(x => x && /^gq:/.test(String(x.id || '')))
        || more || topicGoal || subj
        || ch.find(x => x && !/^(leave|bye|goodbye|recap)/.test(String(x.id || '')))
        || ch.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) return false;
      Game.convoTurn(vid, pick.id);
    }
    return false;
  }

  // Press 'recap' whenever offered, up to 6 attempts. advance=true appends
  // a fresh thread-log entry after each press, forcing a new raw line.
  function pressRecapLoop(vid, advance) {
    const served = [];
    let presses = 0;
    for (let i = 0; i < 6; i++) {
      const cc = Game.convoGet(vid);
      if (!cc || !cc.active) break;
      const menu = (Game.convoChoices(vid) || []).map(x => x && x.id);
      if (menu.indexOf('recap') === -1) break;
      Game.convoTurn(vid, 'recap');
      presses++;
      const them = (Game.convoGet(vid).transcript || []).filter(e => e.who === 'them');
      served.push(them.length ? String(them[them.length - 1].text || '') : '');
      if (advance) {
        Game.convoGet(vid).threadLog.push({ thread: ROTATE[(i + 2) % ROTATE.length], snippet: 'moved on', ex: i + 1 });
      }
    }
    const after = Game.convoGet(vid);
    const liveMenu = (Game.convoChoices(vid) || []).map(x => x && x.id);
    return {
      presses, served,
      spentAfter: !!(after && after.spent && after.spent.recap),
      pressesCounted: (after && after._recapPresses) || 0,
      liveMenu,
    };
  }

  // ---------- SITTING A: fresh line every press (the wild condition) ----------
  Game.startConvo(vidA);
  Game.convoGet(vidA).budget = 99; // isolate the cap from the winddown machinery
  Game.convoGet(vidA).threadLog = [
    { thread: 'goal', snippet: 'wants', ex: 0 },
    { thread: 'past', snippet: 'old life', ex: 0 },
  ];
  const reachedA = driveToRecap(vidA);
  check('fresh-line: conversation reaches a recap offer', reachedA === true, 'drive-along never offered recap');
  let a = null;
  if (reachedA) {
    a = pressRecapLoop(vidA, true);
    console.log('sittingA(fresh-line): presses=' + a.presses + ' spent=' + a.spentAfter + ' counted=' + a.pressesCounted + ' served=' + JSON.stringify(a.served));
    check('fresh-line: exactly 5 recap presses served (6th never offered)', a.presses === 5, 'presses=' + a.presses);
    check('fresh-line: recap spent after the 5th press', a.spentAfter === true, 'spent.recap=' + a.spentAfter);
    check('fresh-line: press counter reads 5', a.pressesCounted === 5, '_recapPresses=' + a.pressesCounted);
    const distinctA = new Set(a.served).size;
    check('fresh-line: the 5 served lines are all distinct (fresh re-anchors)', distinctA === 5, 'distinct=' + distinctA + ' served=' + JSON.stringify(a.served));
    check('fresh-line: recap absent from the live menu after the cap', a.liveMenu.indexOf('recap') === -1, 'menu=' + JSON.stringify(a.liveMenu));
    check('fresh-line: menu still live (not a winddown/empty menu hiding recap)', a.liveMenu.length >= 2, 'menu=' + JSON.stringify(a.liveMenu));
  }
  try { Game.endConvo(vidA, 'left'); } catch (e) {}

  // ---------- SITTING B: same line every press (r27/r31 path, direct calls) ----------
  // The turn tail appends a thread-log entry on every press, so the
  // reframe path cannot be reached through convoTurn — it is exercised
  // here by calling convoRecapLine directly on a fixed thread log, which
  // is exactly the unit the r27/r31 machinery owns.
  Game.startConvo(vidB);
  const cB = Game.convoGet(vidB);
  cB.budget = 99;
  cB.threadLog = [
    { thread: 'goal', snippet: 'wants', ex: 0 },
    { thread: 'past', snippet: 'old life', ex: 0 },
  ];
  const servedB = [];
  for (let i = 0; i < 6; i++) {
    if (cB.spent && cB.spent.recap) break; // the fix spends after the 5th
    servedB.push(String(Game.convoRecapLine(vidB) || ''));
    if (i === 4) break; // never attempt a 6th serve once 5 are served
  }
  console.log('sittingB(same-line, direct): served=' + JSON.stringify(servedB) + ' spent=' + !!(cB.spent && cB.spent.recap) + ' counted=' + (cB._recapPresses || 0));
  check('same-line: exactly 5 recap lines served', servedB.length === 5, 'served=' + servedB.length);
  check('same-line: recap spent after the 5th press', !!(cB.spent && cB.spent.recap), 'spent.recap=' + !!(cB.spent && cB.spent.recap));
  check('same-line: press counter reads 5', (cB._recapPresses || 0) === 5, '_recapPresses=' + cB._recapPresses);
  const reframeHit = servedB.some(s => /as i said|like i said|still where we are/i.test(s));
  check('same-line: a reframe line served ("as I said" family)', reframeHit, 'served=' + JSON.stringify(servedB));
  const escHit = servedB.some(s => /three times/i.test(s));
  check('same-line: the 5th press escalates honestly ("three times")', escHit, 'served=' + JSON.stringify(servedB));
  try { Game.endConvo(vidB, 'left'); } catch (e) {}

  // ---------- SITTING C: a fresh sitting gets fresh patience ----------
  Game.startConvo(vidA);
  const cC = Game.convoGet(vidA);
  check('fresh-sitting: press counter reset by startConvo', (cC._recapPresses || 0) === 0, '_recapPresses=' + cC._recapPresses);
  check('fresh-sitting: spent ledger reset by startConvo', !(cC.spent && cC.spent.recap), 'spent=' + JSON.stringify(cC.spent));
  try { Game.endConvo(vidA, 'left'); } catch (e) {}

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('test crashed: ' + (e && e.stack || e)); process.exit(2); });
