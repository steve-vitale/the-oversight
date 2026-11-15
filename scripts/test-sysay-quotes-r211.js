#!/usr/bin/env node
// Proof: sysSay quote fix (journey-endgame r211 2026-11-15).
// The r198 finding (c), recurred r203: transcripts rendered
// `📺 SYSTEM: ""...""` — sysSay wrapped text in quotes while nearly
// every call site already passed quoted text, and some passed their own
// "SYSTEM: " prefix. The fix (game.js sysSay, display only) strips one
// leading 📺, one leading "SYSTEM: " and one redundant quote at EACH
// edge, then wraps in exactly one pair. The voice lookup still receives
// the ORIGINAL text, so pre-generated MP3 matching is unchanged (and the
// lookup normalizes quote styles away in any case).
// v2 (same run): the v1 rule stripped only a quote PAIR (both ends at
// once), but pass A v1 still showed 27 doubled lines — 18 quote-open-only
// ("THE PARTY WINS!!" The crowd...) and 9 quote-close-only
// (...flickers: "A stranger...") — so each edge is stripped
// independently now.
//
// Legs: (1) direct sysSay cases on a fixture game; (2) the LIVE showbiz
// feed line, driven through apFeedMessage with the showbiz lane at 30;
// (3) a source pin on the fixed alienPlayers.js line.
//
// RED (pre-fix): case 1 renders 📺 SYSTEM: ""Ooh...""; case 4 renders
// 📺 SYSTEM: "SYSTEM: "VIEWERSHIP...""; case 6 renders the showbiz line
// with doubled quotes and nested "most watchable human".

const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}

(async () => {
  // ---- leg 1: direct sysSay cases (seed 61, same as the r10 prefix test) ----
  const { Game } = await loadGame({ seed: 61, narration: true });
  await setupGame(Game);
  Game.state.systemArrived = true;

  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); };
  const voiceSeen = [];
  const _vid = Game.systemVoiceIdFor ? Game.systemVoiceIdFor.bind(Game) : null;
  Game.systemVoiceIdFor = function (t) { voiceSeen.push(String(t)); return _vid ? _vid(t) : null; };

  Game.sysSay('"Ooh. A DELEGATOR! No leading emoji here."');
  Game.sysSay('COMBAT! DEER! The gamblers lean in. ROUND 1 — FIGHT!');
  Game.sysSay('📺 SYSTEM: "UNIT BIG UGLY — the cameras kept finding it. It mattered to you on the floor."');
  Game.sysSay('SYSTEM: "VIEWERSHIP RECORD. More of them are watching than ever. (+5 integration)"');
  Game.sysSay('"Your showbiz fans voted you \'most watchable human\' three weeks running. The trophy is a small moon."');
  // v2 shapes (pass A v1 left these doubled): quote-open-only and
  // quote-close-only call-site strings.
  Game.sysSay('"THE PARTY WINS!!" The crowd goes WILD! Team merch is already selling!');
  Game.sysSay('◈ The System feed flickers: "A stranger has entered the game. The feed just got a lot more interesting."');

  Game.say = _say;
  if (_vid) Game.systemVoiceIdFor = _vid;

  check('1. already-quoted renders a single pair',
    said[0] === '📺 SYSTEM: "Ooh. A DELEGATOR! No leading emoji here."', said[0]);
  check('1b. no doubled quotes anywhere in the quoted render', !/"" /.test(said[0]) && said[0].indexOf('""') === -1, said[0]);
  check('2. unquoted input still gets exactly one pair (unchanged)',
    said[1] === '📺 SYSTEM: "COMBAT! DEER! The gamblers lean in. ROUND 1 — FIGHT!"', said[1]);
  check('3. 📺-prefixed + SYSTEM:-prefixed + quoted collapses to one wrapper',
    said[2] === '📺 SYSTEM: "UNIT BIG UGLY — the cameras kept finding it. It mattered to you on the floor."', said[2]);
  check('4. SYSTEM:-prefixed + quoted collapses to one wrapper',
    said[3] === '📺 SYSTEM: "VIEWERSHIP RECORD. More of them are watching than ever. (+5 integration)"', said[3]);
  check('5. showbiz line renders with single inner quotes',
    said[4] === '📺 SYSTEM: "Your showbiz fans voted you \'most watchable human\' three weeks running. The trophy is a small moon."', said[4]);
  check('6. quote-open-only renders with no doubled open quote',
    said[5] === '📺 SYSTEM: "THE PARTY WINS!!" The crowd goes WILD! Team merch is already selling!"', said[5]);
  check('6b. no doubled quotes in the open-only render', said[5].indexOf('""') === -1, said[5]);
  check('7. quote-close-only renders with no doubled close quote',
    said[6] === '📺 SYSTEM: "◈ The System feed flickers: "A stranger has entered the game. The feed just got a lot more interesting."', said[6]);
  check('7b. no doubled quotes in the close-only render', said[6].indexOf('""') === -1, said[6]);
  check('voice lookup still receives the ORIGINAL text (all 7)',
    voiceSeen[0] === '"Ooh. A DELEGATOR! No leading emoji here."' &&
    voiceSeen[1] === 'COMBAT! DEER! The gamblers lean in. ROUND 1 — FIGHT!' &&
    voiceSeen[2] === '📺 SYSTEM: "UNIT BIG UGLY — the cameras kept finding it. It mattered to you on the floor."' &&
    voiceSeen[3] === 'SYSTEM: "VIEWERSHIP RECORD. More of them are watching than ever. (+5 integration)"' &&
    voiceSeen[4] === '"Your showbiz fans voted you \'most watchable human\' three weeks running. The trophy is a small moon."' &&
    voiceSeen[5] === '"THE PARTY WINS!!" The crowd goes WILD! Team merch is already selling!' &&
    voiceSeen[6] === '◈ The System feed flickers: "A stranger has entered the game. The feed just got a lot more interesting."',
    JSON.stringify(voiceSeen.map(s => s.slice(0, 30))));

  // ---- leg 2: the LIVE showbiz feed line through apFeedMessage ----
  // Same game (one harness per process — never two loadGame calls here):
  // the showbiz lane is boosted to 30, then days are advanced one per
  // try (apFeedMessage fires at most once per day, 40% roll) until the
  // showbiz line fires. The real sysSay is live (narration: true).
  Game.apAdjustFavor(30, 'fixture boost', 'showbiz');
  check('live: showbiz lane at 30 (feed gate 25)', Game.apFanLane('showbiz') === 30, 'lane=' + Game.apFanLane('showbiz'));

  const liveSaid = [];
  Game.say = function (t) { liveSaid.push(String(t)); };
  let showbizLine = null;
  let attempts = 0;
  for (let i = 0; i < 200 && !showbizLine; i++) {
    // apFeedMessage fires at most once per day — advance the day each try.
    Game.state.scholar.day = ((Game.state.scholar || {}).day || 1) + 1;
    attempts++;
    if (Game.apFeedMessage()) {
      const hit = liveSaid.filter(s => /most watchable human/.test(s));
      if (hit.length) showbizLine = hit[hit.length - 1];
    }
  }
  Game.say = _say;
  check('live: showbiz feed line fires within 200 day-advanced tries', !!showbizLine, 'attempts=' + attempts);
  if (showbizLine) {
    check('live: showbiz line renders with ONE quote pair, single inner quotes',
      showbizLine === '📺 SYSTEM: "Your showbiz fans voted you \'most watchable human\' three weeks running. The trophy is a small moon."',
      showbizLine);
    check('live: no doubled quotes in the fired line', showbizLine.indexOf('""') === -1, showbizLine);
  }

  // ---- leg 3: source pin — the fixed line really changed ----
  // (The source uses \'...\' escapes: the JS string is single-quoted and
  // the inner quotes are literal single quotes, escaped in the file.)
  const apSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'alienPlayers.js'), 'utf8');
  const showbizSrc = apSrc.split('\n').filter(l => /most watchable human/.test(l));
  check('source: exactly one showbiz line in alienPlayers.js', showbizSrc.length === 1, 'found=' + showbizSrc.length);
  if (showbizSrc.length === 1) {
    check('source: inner quotes are single, not double',
      showbizSrc[0].includes("\\'most watchable human\\'") && !showbizSrc[0].includes('"most watchable human"'),
      showbizSrc[0].trim().slice(0, 120));
  }
  const boringSrc = apSrc.split('\n').filter(l => /BORING,/.test(l) && /restless/.test(l));
  check('source: BORING line uses single inner quotes too',
    boringSrc.length === 1 && boringSrc[0].includes("\\'BORING,\\'"), boringSrc.length ? boringSrc[0].trim().slice(0, 100) : 'missing');
  const gossipSrc = apSrc.split('\n').filter(l => /still interesting/.test(l));
  check('source: rival-gossip line uses single inner quotes too',
    gossipSrc.length === 1 && gossipSrc[0].includes("\\'still interesting. For now.\\'"), gossipSrc.length ? gossipSrc[0].trim().slice(0, 100) : 'missing');

  // ---- leg 4: a real synergies.json discovery string through sysSay ----
  // The 6 leftover doubled lines on pass A v2 were synergy discoveries:
  // the JSON values already carry quotes, and the discovery site wrapped
  // them by hand instead of going through sysSay. The site now routes
  // through sysSay; prove the real data renders single here.
  const syns = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'synergies.json'), 'utf8'));
  const impaling = syns.find(s => s && s.id === 'impaling_scream') || syns.find(s => /IMPALING SCREAM/.test(s.discovery || ''));
  check('synergy: IMPALING SCREAM entry exists in synergies.json', !!impaling, impaling ? impaling.id : 'missing');
  if (impaling) {
    const disc = impaling.discovery;
    check('synergy: discovery value carries its own quotes (the trap)',
      typeof disc === 'string' && disc.startsWith('"') && disc.endsWith('"'), disc.slice(0, 40));
    const synSaid = [];
    Game.say = function (t) { synSaid.push(String(t)); };
    Game.sysSay(disc);
    Game.say = _say;
    check('synergy: discovery renders with ONE quote pair via sysSay',
      synSaid.length === 1 && synSaid[0] === '📺 SYSTEM: "The SCREAM! And the SPEAR! TOGETHER?! You freeze it mid-breath and the spear just... FINDS the heart! The drama division is taking notes! IMPALING SCREAM!"',
      synSaid[0] ? synSaid[0].slice(0, 80) : 'missing');
    check('synergy: no doubled quotes in the discovery render', synSaid.length === 1 && synSaid[0].indexOf('""') === -1, synSaid[0] || '');
  }
  // Source pin: the discovery site routes through sysSay now.
  const gameSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
  check('source: synergy discovery site calls sysSay, not a hand-built wrapper',
    /this\.sysSay\(discovery\)/.test(gameSrc) && !/this\.say\(`📺 SYSTEM: "\$\{discovery\}"`\)/.test(gameSrc),
    'sysSay(discovery) present=' + /this\.sysSay\(discovery\)/.test(gameSrc));

  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
