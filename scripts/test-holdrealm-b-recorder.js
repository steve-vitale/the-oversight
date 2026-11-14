// test-holdrealm-b-recorder.js — the dissolution-episode capture
// (scripts/linklines-capture.js) keeps late realm-dissolution lines that the
// general link-line cap would otherwise swallow.
//
// sim-holdrealm-b, 2026-11-14. Run: node scripts/test-holdrealm-b-recorder.js
'use strict';
const { createLinkCapture, EPISODE_RE } = require('./linklines-capture');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('ok: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// The exact lines the answercourt confirm corpus lost to the 600-line cap.
const DISSOLVE = '◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again. National no longer describes this village. The climb starts over.';
const FEED_QUIET = '📡 The world feed goes quiet — the summons dies with the realm that earned it. The galaxy watched a fire that is out.';
const DRIFT = "⚠️ Emberhold's fire is drifting from ours — their speaker doesn't linger at the gate the way they used to, and nobody over there says why. Bonds don't mend themselves; a tended fire remembers who fed it.";
const FUNERAL = '🕯️ Arjun is dead — and the dead hold no treaties. Every link Haven has shakes.';
const MANTLE = "The Codex doesn't pause for grief. Marco blinks — and it's already there, overlaying everything, syncing. No pen. No paper. The mantle just... transfers.";
const TRIBUTE = '🌾 Tribute from Emberhold arrives — 1,688 kcal of grain into the pantry. Their fields, our fire.';
const CHATTER = '💛 You hold Carpenter\'s square. Your first solo frame, checked and found true.';

// 1. An episode line is recognised.
t('EPISODE_RE matches the dissolution line', EPISODE_RE.test(DISSOLVE));
t('EPISODE_RE matches the feed-quiet line', EPISODE_RE.test(FEED_QUIET));
t('EPISODE_RE matches the drift warning', EPISODE_RE.test(DRIFT));
t('EPISODE_RE matches the funeral line', EPISODE_RE.test(FUNERAL));
t('EPISODE_RE matches the mantle transfer', EPISODE_RE.test(MANTLE));
t('EPISODE_RE does NOT match ordinary tribute chatter', !EPISODE_RE.test(TRIBUTE));
t('EPISODE_RE does NOT match keepsake chatter', !EPISODE_RE.test(CHATTER));

// 2. The instrument case: 600 general lines fill the cap, THEN the realm
// dissolves on day 142 — the dissolution line must still be captured.
(function () {
  const cap = createLinkCapture({ cap: 150, episodeCap: 60 });
  for (let i = 0; i < 200; i++) cap.push(1 + Math.floor(i / 3), TRIBUTE + ' #' + i);
  cap.push(142, DISSOLVE);
  cap.push(142, FEED_QUIET);
  cap.push(100, FUNERAL); // a funeral that arrived while the cap was already full
  t('general buffer caps at 150', cap.linkLines.length === 150, 'got ' + cap.linkLines.length);
  t('dissolution line survives the full cap', cap.episodeLines.some(l => l.day === 142 && l.line === DISSOLVE));
  t('feed-quiet line survives the full cap', cap.episodeLines.some(l => l.day === 142 && l.line === FEED_QUIET));
  t('late funeral line survives the full cap', cap.episodeLines.some(l => l.day === 100 && l.line === FUNERAL));
  t('general buffer does NOT hold the late dissolution line', !cap.linkLines.some(l => l.line === DISSOLVE));
  t('tribute chatter is NOT in the episode buffer', !cap.episodeLines.some(l => l.line.indexOf('Tribute from') === 0));
})();

// 3. Before the cap, an episode line lands in BOTH buffers (no behaviour
// change for early-horizon arms).
(function () {
  const cap = createLinkCapture({ cap: 150, episodeCap: 60 });
  cap.push(89, DISSOLVE);
  t('early dissolution line is in the general buffer', cap.linkLines.some(l => l.line === DISSOLVE));
  t('early dissolution line is in the episode buffer', cap.episodeLines.some(l => l.line === DISSOLVE));
})();

// 4. The episode ring is bounded and keeps the LATEST episodes.
(function () {
  const cap = createLinkCapture({ cap: 150, episodeCap: 60 });
  for (let i = 0; i < 100; i++) cap.push(i, DRIFT + ' #' + i);
  t('episode ring caps at 60', cap.episodeLines.length === 60, 'got ' + cap.episodeLines.length);
  t('episode ring keeps the latest', cap.episodeLines[59].line.indexOf('#99') !== -1);
  t('episode ring drops the earliest', cap.episodeLines[0].line.indexOf('#40') !== -1);
})();

// 5. Non-string input never throws, and a bare day-0 push works.
(function () {
  const cap = createLinkCapture({ cap: 150, episodeCap: 60 });
  cap.push(5, null); cap.push(5, undefined); cap.push(5, 42);
  t('non-string lines are ignored without throwing', cap.linkLines.length === 0 && cap.episodeLines.length === 0);
})();

console.log(`\ntest-holdrealm-b-recorder: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
