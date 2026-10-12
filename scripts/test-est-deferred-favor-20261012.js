#!/usr/bin/env node
// Journey ESTABLISHMENT r3 blank — DEFERRED FAVOR OPENER proof test (2026-10-12).
//
// Bug: when the resume opener preempts the want's opener in startConvo (an
// unfinished thread resurfaces instead of the want's ask), an ask_favor want
// is selected on a real need but its favor is never built or stated. The
// want menu still runs the full arc on nothing:
//   - "How can I help?" -> hollow fallback ("Honestly? I'm alright right
//     now." / "Nothing I can name.") — the real need is never asked
//   - "I'll do it." -> hollow "Thank you. Seriously — thank you." ->
//     resolution 'promised' with NO favor obligation created
//   - endConvo plants a phantom repay seed {wantId:'repay', note:'what you
//     promised'} with no favorId — an obligation owed for nothing
// (Observed live in journey-establishment r3 transcripts: 424242-day15 with
// Luz, 424242-day25 with Luz, 20261011-day20 with Marcus.)
//
// Fix (src/js/convo-wants.js, ask_favor):
//   1. engageBeat: when no favor was stated, run the deferred want opener —
//      engaging the want states the real ask instead of the hollow fallback.
//   2. menuOptions: at stage >= 2 with no favor, offer engagement, never
//      commit/deflect — nothing committable exists.
//   3. resolve('promised'): with no favor, plant nothing — never the
//      contentless repay seed.
//
// RED on pristine (PRISTINE=1): the hollow fallback is spoken, no favor is
//   built, 'promised' resolves with no obligation, phantom repay seed planted.
// GREEN fixed: the real favor is asked, committed to a tracked obligation,
//   and the repay seed carries the favorId.
//
// Usage: node scripts/test-est-deferred-favor-20261012.js
//        PRISTINE=1 node scripts/test-est-deferred-favor-20261012.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let _s = 424242;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [];
for (const line of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n')) {
  const m = /src\/js\/[^"]*\.js/.exec(line);
  if (m && !/app\.js|tile-scenes\.js|move-anim\.js|drama\.js|sprites\.js/.test(m[0])) files.push(m[0]);
}
const PRISTINE = process.env.PRISTINE === '1';
for (const f of files) {
  let src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (PRISTINE && f === 'src/js/convo-wants.js') {
    src = execSync('git show HEAD:src/js/convo-wants.js', { cwd: ROOT }).toString('utf8');
  }
  eval(src);
}
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

const HOLLOW = /alright right now|Nothing I can name|Company's enough/i;

async function main() {
  console.log((PRISTINE ? 'PRISTINE (expect RED)' : 'FIXED (expect GREEN)') + ' — deferred favor opener');
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster.find(id => { try { return Game.npcComm(id).level === 'full'; } catch (e) { return false; } }) || roster[0];

  // Give them a real, acute need: a wound -> heal_help favor (urgency 4).
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[vid] = 40;

  // Select an ask_favor want deterministically (urgency 4 dominates; retry
  // through the jitter).
  let wantSel = null;
  for (let i = 0; i < 40 && !(wantSel && wantSel.id === 'ask_favor'); i++) {
    try { wantSel = Game.convoSelectWant(vid); } catch (e) {}
  }
  ok(wantSel && wantSel.id === 'ask_favor', 'ask_favor selected on the wound (got ' + (wantSel && wantSel.id) + ')');
  if (!wantSel || wantSel.id !== 'ask_favor') { console.log('RESULT: ' + fail + ' failed (setup)'); process.exit(2); }

  // Force the resume-preempt path: the want is selected, but an unfinished
  // thread resurfaces INSTEAD of the want's opener.
  const RESUME_LINE = '"We never finished talking about that question — we got cut off."';
  Game.convoSelectWant = () => wantSel;
  Game.convoResumeOpener = () => ({ line: RESUME_LINE, thread: 'question' });

  const r0 = Game.startConvo(vid);
  const w0 = Game.convoGet(vid).want || {};
  ok(r0.line && r0.line.indexOf('never finished talking') !== -1, 'opener is the resume beat, not the favor ask');
  ok(w0.id === 'ask_favor' && (w0.stage || 0) === 0, 'want selected and waiting at stage 0');
  ok(!w0.favor && !Game.convoGetFavor(vid), 'no favor stated yet (opener was preempted)');

  const hasEngage = (r0.choices || []).some(ch => ch && (ch.id === 'dlg:help' || ch.id === 'alive:want:ask_favor'));
  ok(hasEngage, 'menu offers a way to engage the want (dlg:help or alive:want:ask_favor)');

  // 1. Engage the want directly ("How can I help?") — the path the r3
  // transcripts took. The deferred ask must be stated, not the hollow fallback.
  const r1 = Game.convoTurn(vid, 'dlg:help');
  const w1 = Game.convoGet(vid).want || {};
  const favor = w1.favor || Game.convoGetFavor(vid);
  ok(!HOLLOW.test(r1.line || ''), 'no hollow fallback ("I\'m alright right now" / "Nothing I can name")');
  ok(!!favor && !!favor.id && !!favor.task, 'a real favor was built and stated (task: ' + (favor && favor.task) + ')');
  ok(!!favor && ((r1.line || '') === favor.line || (r1.line || '').indexOf(favor.line) !== -1),
    'the spoken line IS the favor ask (got: ' + (r1.line || '').slice(0, 80) + ')');

  // 2. Commit to the stated favor — a real, tracked obligation.
  const r2 = Game.convoTurn(vid, 'dlg:commit');
  const w2 = Game.convoGet(vid).want || {};
  ok(w2.resolution === 'promised', 'resolution is promised (got ' + w2.resolution + ')');
  const p = ((Game.state.village.promises || {})[vid]) || {};
  ok(!!p.favorId && favor && p.favorId === favor.id, 'a TRACKED obligation exists with the favor id');

  // 3. The follow-up seed names the real favor — never a contentless repay.
  Game.endConvo(vid, 'done');
  const seed = ((Game.state.village.convoSeeds || {})[vid]) || {};
  ok(seed.wantId === 'repay' && !!seed.favorId && favor && seed.favorId === favor.id,
    'repay seed carries the favor id (got ' + JSON.stringify(seed) + ')');
  ok(!(seed.note === 'what you promised' && !seed.favorId), 'no phantom "what you promised" seed without a favor');

  console.log(fail === 0 ? 'RESULT: ALL GREEN (' + pass + '/' + pass + ')' : 'RESULT: ' + fail + ' FAILED, ' + pass + ' passed');
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
