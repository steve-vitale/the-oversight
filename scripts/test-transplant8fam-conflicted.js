// test-transplant8fam-conflicted.js — targeted before/after proof for
// the four CONFLICTED PR #22 hunks, theirs-resolved (arm
// sim-transplant8fam-a).
//
// The 8fam subject carries ONLY the four conflicted hunks (no 8b
// methods, no 8c dlg:more hunk, no test file). Every
// convoHasLiveUnfinished / convoUnfinishedEngageLine reference sits
// behind a typeof guard (inert on this substrate), so the live
// effects are the ones that do NOT need the 8b methods:
//
//   Case H-settled (control — no change expected): want ask_favor,
//     settled favor, NO unfinished outing, NO deferred resume.
//     BOTH far end and subject answer "It's already handled."
//   Case H-unfinished (hunk 2 discriminator): want ask_favor,
//     settled favor, PLUS a live unfinished water outing.
//     FAR END (control): "It's already handled" (the unguarded
//     settled check fires). SUBJECT: falls through — no "already
//     handled" line (the !unfinishedOuting guard blocks it).
//   Case B-fellback (hunk 4 discriminator): dlg:help with the favor
//     line ledger-blocked AND the dry pool exhausted (c.dryLines = 9),
//     so sayLine returns null with _sayFellBack set. FAR END
//     (control): falls through to the dup repeat ("I just said…"
//     line spoken). SUBJECT: fell-back early return — r.line === null,
//     no second line emitted.
//   Case L-secret (hunk 1 discriminator): secret:promise answer with
//     the react line poisoned into the run ledger. FAR END (control):
//     the react is delivered (diegetic act — the ledger block is
//     exempted, _sayFellBack stays false). SUBJECT: the react dries
//     (no secretOutcome exemption — _sayFellBack true, a dry line in
//     the transcript).
//
// Staging mirrors the dialog-audit #4 proof and the 8c dlgmore
// script: seed 1 (B/L) / seed 7 (H, same seed as the #4 proof's
// resume shape), a live villager, trust 40. Cases B and L need the
// composed line's exact text to poison it, so each runs a PROBE pass
// first (fresh process — never two harnesses in one node process,
// per AGENTS.md) whose captured line is fed to the TEST pass.
//
// Usage: node scripts/test-transplant8fam-conflicted.js [--case h-settled|h-unfinished|b|l]
//   Parent (no --child): spawns one child process per case/pass and
//   aggregates. Exit 0 iff the SUBJECT behaviors hold for all four
//   cases. EXPECTED: non-zero on the far end (the pre-fix control),
//   0 on the 8fam subject. Exit 2 if any case is UNSTAGEABLE (probe
//   produced no line to poison, or the turn threw before the
//   discriminator ran) — recorded as a documented gap, never a pass.
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const DRY = /lost my train of thought|Never mind — go on|Actually, forget it|Where was I\? Gone|clean out of my head|slipped away from me|Wasn'?t important\. Probably/i;
const HANDLED = /already handled/i;
const safe = (fn, d) => { try { return fn(); } catch (e) { console.error(e && e.stack); return d; } };

function lastThem(Game, vid) {
  const them = (Game.convoGet(vid).transcript || []).filter(t => t && t.who === 'them');
  return them.length ? String(them[them.length - 1].text || '') : '';
}
function countThem(Game, vid) {
  return (Game.convoGet(vid).transcript || []).filter(t => t && t.who === 'them').length;
}
function poisonLines(Game, lines) {
  for (const line of lines) {
    if (!line) continue;
    for (const chunk of Game.convoSplitBeats(line)) {
      Game.convoRunLedger().push(chunk.trim());
    }
  }
}

async function stage(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'transplant8fam-conflicted' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 40;
  Game.startConvo(vid);
  return { Game, vid };
}

// ---- Case H-settled / H-unfinished (dlg:help, favor settlement) ----
async function caseHelp(unfinished) {
  const { Game, vid } = await stage(7);
  const c = Game.convoGet(vid);
  const favor = unfinished
    ? { state: 'fulfilled', kind: 'water_haul', waterRun: { returned: false } }
    : { state: 'fulfilled' };
  c.want = { id: 'ask_favor', favor: favor };
  const r = safe(() => Game.convoTurn(vid, 'dlg:help'), null);
  const them = lastThem(Game, vid);
  const line = r && r.line != null ? String(r.line) : null;
  const handled = HANDLED.test(them) || (line !== null && HANDLED.test(line));
  console.log(JSON.stringify({
    case: unfinished ? 'H-unfinished' : 'H-settled',
    handled: handled, line: line, them: them,
  }, null, 2));
  // H-settled: handled must be TRUE on both trees (no-change control).
  // H-unfinished: handled must be FALSE (subject falls through).
  return unfinished ? !handled : handled;
}

// ---- Case B probe: capture the favorLine as actually composed ----
async function caseBProbe() {
  const { Game, vid } = await stage(1);
  const c = Game.convoGet(vid);
  c.want = null;
  const r = safe(() => Game.convoTurn(vid, 'dlg:help'), null);
  const line = r && r.line != null ? String(r.line) : null;
  console.log(JSON.stringify({ case: 'B-probe', line: line, them: lastThem(Game, vid) }, null, 2));
  if (!line || line.trim().length < 8) throw new Error('B probe produced no favor line to poison');
  return line;
}

// ---- Case B test: blocked favor line, dry pool exhausted ----
async function caseBTest(poison) {
  const { Game, vid } = await stage(1);
  const c = Game.convoGet(vid);
  c.want = null;
  poisonLines(Game, poison);
  c.dryLines = 9;
  const before = countThem(Game, vid);
  const r = safe(() => Game.convoTurn(vid, 'dlg:help'), null);
  const after = countThem(Game, vid);
  const line = r && r.line != null ? String(r.line) : null;
  const checks = {
    fellBack: c._sayFellBack === true,
    returnedNull: r !== null && r.line === null,
    noSecondLine: after === before,
  };
  // Subject behavior: early return, null line, nothing more spoken.
  // (The far-end control speaks the dup repeat instead: line is a
  // string and after === before + 1.)
  const pass = checks.fellBack && checks.returnedNull && checks.noSecondLine;
  console.log(JSON.stringify({ case: 'B-test', pass: pass, checks: checks, line: line, them: lastThem(Game, vid), before: before, after: after }, null, 2));
  return pass;
}

// ---- Case L probe: capture the secret:promise react as spoken ----
async function caseLProbe() {
  const { Game, vid } = await stage(1);
  const r = safe(() => Game.convoTurn(vid, 'secret:promise'), null);
  const them = lastThem(Game, vid);
  console.log(JSON.stringify({ case: 'L-probe', line: r && r.line != null ? String(r.line) : null, them: them }, null, 2));
  if (!them || them.trim().length < 8) throw new Error('L probe produced no spoken react to poison');
  return them;
}

// ---- Case L test: poisoned secret react ----
async function caseLTest(poison) {
  const { Game, vid } = await stage(1);
  const c = Game.convoGet(vid);
  poisonLines(Game, poison);
  const r = safe(() => Game.convoTurn(vid, 'secret:promise'), null);
  const them = lastThem(Game, vid);
  const line = r && r.line != null ? String(r.line) : null;
  const checks = {
    fellBack: c._sayFellBack === true,
    drySpoken: DRY.test(them),
    returnedDry: line !== null && DRY.test(line),
  };
  // Subject behavior: the react dries (no secretOutcome exemption).
  // (The far-end control delivers the react with fellBack false.)
  const pass = checks.fellBack && checks.drySpoken;
  console.log(JSON.stringify({ case: 'L-test', pass: pass, checks: checks, line: line, them: them }, null, 2));
  return pass;
}

async function childMain() {
  const shape = process.argv[process.argv.indexOf('--child') + 1];
  let result;
  if (shape === 'h-settled') result = { case: 'H-settled', pass: await caseHelp(false) };
  else if (shape === 'h-unfinished') result = { case: 'H-unfinished', pass: await caseHelp(true) };
  else if (shape === 'b-probe') result = { case: 'B-probe', line: await caseBProbe() };
  else if (shape === 'b-test') {
    const poison = JSON.parse(Buffer.from(process.env.TRANSPLANT8FAM_POISON || '', 'base64').toString('utf8') || '[]');
    result = { case: 'B-test', pass: await caseBTest(poison) };
  } else if (shape === 'l-probe') result = { case: 'L-probe', line: await caseLProbe() };
  else if (shape === 'l-test') {
    const poison = JSON.parse(Buffer.from(process.env.TRANSPLANT8FAM_POISON || '', 'base64').toString('utf8') || '[]');
    result = { case: 'L-test', pass: await caseLTest(poison) };
  } else throw new Error('unknown shape ' + shape);
  console.log('RESULT ' + JSON.stringify(result));
}

async function parentMain() {
  const only = process.argv[2] === '--case' ? process.argv[3] : null;
  let fails = 0;
  let unstageable = 0;
  const runChild = (shape, poison) => {
    const env = Object.assign({}, process.env);
    if (poison) env.TRANSPLANT8FAM_POISON = Buffer.from(JSON.stringify(poison)).toString('base64');
    const r = spawnSync(process.execPath, [__filename, '--child', shape], { encoding: 'utf8', env: env });
    process.stdout.write(r.stdout || '');
    process.stderr.write(r.stderr || '');
    if (r.status === 2) { unstageable++; return null; }
    if (r.status !== 0) { fails++; return null; }
    const m = (r.stdout || '').match(/^RESULT (\{.*\})$/m);
    return m ? JSON.parse(m[1]) : null;
  };
  const want = (c) => !only || only === c;
  if (want('h-settled')) {
    const res = runChild('h-settled');
    if (!res) { /* status already counted */ }
    else if (!res.pass) { console.log('FAIL: H-settled control broke (expected "already handled" on both trees)'); fails++; }
    else console.log('H-settled: PASS (control — "already handled" on this tree)');
  }
  if (want('h-unfinished')) {
    const res = runChild('h-unfinished');
    if (res && !res.pass) { console.log('H-unfinished: control behavior (settled favor answered "already handled")'); fails++; }
    else if (res) console.log('H-unfinished: PASS (subject falls through — no "already handled")');
  }
  if (want('b')) {
    const probe = runChild('b-probe');
    if (probe && probe.line) {
      const poison = [probe.line,
        '"Honestly? I\'m alright right now. Just good to talk."',
        '"Nothing I can name. Company\'s enough."',
        '"Honestly? I\'m alright right now."'];
      const res = runChild('b-test', poison);
      if (res && !res.pass) { console.log('B-fellback: control behavior (dup repeat spoken instead of early return)'); fails++; }
      else if (res) console.log('B-fellback: PASS (fell-back early return, null line, nothing more spoken)');
    }
  }
  if (want('l')) {
    const probe = runChild('l-probe');
    if (probe && probe.line) {
      const poison = [probe.line,
        '"Thank you. ...I needed someone to know, and I needed it to stop there."'];
      const res = runChild('l-test', poison);
      if (res && !res.pass) { console.log('L-secret: control behavior (react delivered, diegetic)'); fails++; }
      else if (res) console.log('L-secret: PASS (react dried — no secretOutcome exemption)');
    }
  }
  if (unstageable) {
    console.log('TRANSPLANT8FAM CONFLICTED: UNSTAGEABLE (' + unstageable + ' case(s) could not be staged — see above)');
    process.exit(2);
  }
  console.log(fails
    ? 'TRANSPLANT8FAM CONFLICTED: FAIL (' + fails + ' case(s) show pre-fix/control behavior)'
    : 'TRANSPLANT8FAM CONFLICTED: PASS (8fam behavior holds)');
  process.exit(fails ? 1 : 0);
}

(async () => {
  if (!process.argv.includes('--child')) await parentMain();
  else {
    try { await childMain(); process.exit(0); }
    catch (e) {
      console.error('UNSTAGEABLE ' + (e && e.message));
      process.exit(2);
    }
  }
})().catch(function (e) { console.error('HARNESS ERROR', e && e.stack); process.exit(2); });
