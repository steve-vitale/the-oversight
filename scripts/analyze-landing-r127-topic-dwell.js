// R127 TOPIC-DWELL analyzer (journey-landing r127, Q2 SERVING-RATE) —
// answers WHY grief/cheer/past/secret serve 0-1x per 100 sittings while
// personal serves 23x. A bridge pool serves only when the player changes
// subject FROM that topic (convo-beats.js:555: fromTopic = c.thread ||
// lastBeat.topic || 'small'), so the serving rate IS the topic-dwell rate
// at subject-change time. This analyzer reads the transcript files and,
// for each sitting, counts:
//   dwell[topic]    — PROBE-ONLY turns where the R55 WD GATE line names
//                     thread=<topic> (only ~10/102 sittings carry WD GATE
//                     lines, so this is a small-sample read, labelled so)
//   subjFrom[topic] — PROBE-ONLY dlg:subject picks whose most recent
//                     preceding WD GATE thread is <topic> (the serving
//                     opportunity: the bridge that pick draws comes from
//                     this pool)
//   servings[pool]  — substring servings of that pool's bridge lines over
//                     ALL transcripts (same extraction as the r126
//                     bridge-pools analyzer; the ground truth for the pool)
//   askPicks[id]    — ALL-transcript counts of the player's topic-ask
//                     picks (YOU: [ask:<id>]) — which topics the player
//                     actually opens. Code fact (conversation.js:376):
//                     TOPIC_THREADS = village, past, goal, plans, gossip,
//                     personal — grief/cheer/secret have NO ask: item, so
//                     no player-askable topic ever sets thread to them;
//                     they can only arrive via lastBeat.topic when the NPC
//                     asks a grief/cheer/secret question (conversation.js
//                     ~3363/3406/3522/3529).
// The verdict line: a pool whose subjFrom is 0-1 across the whole corpus
// cannot repeat in a sitting no matter its size — expanding it changes
// nothing the player hears. The dwell table then says whether the topic
// itself is starved (low dwell everywhere) or merely never left (decent
// dwell, ~0 subject changes from it).
// Usage:
//   node scripts/analyze-landing-r127-topic-dwell.js <beforeDir> [afterDir]
//   node scripts/analyze-landing-r127-topic-dwell.js <dir>   (single corpus)
'use strict';
const fs = require('fs');
const path = require('path');

// All BRIDGES pools incl. personal + want (6 lines since r124/r125),
// lines copied verbatim from src/js/convo-beats.js BRIDGES.
const POOLS = {
  grief: ['"Sorry — I got lost in it for a second. What did you want to ask?"', '"...Anyway. Sorry. What\'s on your mind?"'],
  cheer: ['"Ha — sorry, I\'m rambling. What\'s up?"', '"Good times. What did you want to talk about?"'],
  goal: ['"Anyway — that\'s my cross to carry. What\'s on your mind?"', '"Right. Sorry, I go on about it. What did you want?"'],
  past: ['"Ancient history. What\'s on your mind?"', '"...That was a lifetime ago. What did you want to ask?"'],
  village: ['"That\'s the state of things. What\'s up?"', '"Anyway — people stuff. What did you want?"'],
  plans: ['"That\'s the plan, anyway. What\'s on your mind?"', '"We\'ll see how it goes. What did you want?"'],
  gossip: ['"That\'s what I heard, anyway. What\'s up?"', '"Take it with salt. What did you want to ask?"'],
  personal: ['"That\'s me, I guess. What\'s on your mind?"', '"Anyway. What did you want?"',
    '"Enough about me — you\'ve got something on your mind, I can tell."',
    '"That\'s my story, anyway. What\'s yours today?"',
    '"I could go on about myself all day. Better if I don\'t — what do you need?"',
    '"Right. Me, me, me. Your turn — what\'s up?"'],
  want: ['"Sorry — I shouldn\'t load that on you. What\'s up?"', '"Forget I said anything. What did you want?"',
    '"...Never mind me. What were you going to say?"',
    '"That can wait — it isn\'t going anywhere. What\'s on your mind?"',
    '"Look, forget it. You wanted something?"',
    '"Anyway — that\'s my problem, not yours. What did you want?"'],
  secret: ['"Don\'t tell anyone I told you. What\'s on your mind?"', '"...Anyway. What did you want to ask?"'],
  small: ['"Sure — what\'s on your mind?"', '"Yeah? What\'s up?"'],
};
const TOPICS = Object.keys(POOLS);

function analyzeDir(dir) {
  const out = { dir, sittings: 0, probeSittings: 0, subjPicks: 0, dwell: {}, subjFrom: {}, servings: {}, askPicks: {}, unknownThread: 0 };
  for (const t of TOPICS) { out.dwell[t] = 0; out.subjFrom[t] = 0; out.servings[t] = 0; }
  if (!dir || !fs.existsSync(dir)) { out.missing = true; return out; }
  const files = fs.readdirSync(dir)
    .filter(f => /^journey-landing-r62-transcript-\d+-day\d+\.txt$/.test(f)).sort();
  for (const f of files) {
    let text;
    try { text = fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { continue; }
    out.sittings++;
    if (text.indexOf('WD GATE') >= 0) out.probeSittings++;
    // Servings per pool (substring match, r126 method).
    for (const [name, lines] of Object.entries(POOLS)) {
      for (const line of lines) {
        let n = 0, idx = 0;
        while ((idx = text.indexOf(line, idx)) !== -1) { n++; idx += line.length; }
        out.servings[name] += n;
      }
    }
    // Walk lines in order: track the latest thread= value from WD GATE
    // lines; each dlg:subject pick attributes to that thread. Also count
    // the player's topic-ask picks (all transcripts, not probe-only).
    const lines = text.split('\n');
    let curThread = null;
    for (const ln of lines) {
      const m = ln.match(/thread=([a-z_]+)/);
      if (m) {
        curThread = m[1];
        if (TOPICS.indexOf(curThread) >= 0) out.dwell[curThread]++;
      }
      const am = ln.match(/YOU: \[ask:([a-z_]+)\]/);
      if (am) out.askPicks[am[1]] = (out.askPicks[am[1]] || 0) + 1;
      if (ln.indexOf('YOU: [dlg:subject]') >= 0) {
        out.subjPicks++;
        if (curThread && TOPICS.indexOf(curThread) >= 0) out.subjFrom[curThread]++;
        else out.unknownThread++;
      }
    }
  }
  return out;
}

function printSide(label, r) {
  console.log(`=== ${label} ===`);
  if (r.missing) { console.log('MISSING DIR: ' + r.dir); return; }
  console.log(`sittings=${r.sittings} probeSittings=${r.probeSittings} subjPicks=${r.subjPicks} unknownThread=${r.unknownThread} (dwell/subjFrom are PROBE-ONLY)`);
  console.log('topic: dwellTurns(probe) subjFrom(probe) servings(all)');
  for (const t of TOPICS) {
    console.log(`  ${t}: dwell=${r.dwell[t]} subjFrom=${r.subjFrom[t]} servings=${r.servings[t]}`);
  }
  const asks = Object.entries(r.askPicks).sort((a, b) => b[1] - a[1]);
  console.log('askPicks (all transcripts): ' + asks.map(([k, v]) => k + '=' + v).join(' '));
  const noAsk = ['grief', 'cheer', 'secret'].filter(t => !r.askPicks[t]);
  console.log('BRIDGES topics with NO ask: pick in corpus: ' + (noAsk.join(', ') || 'none'));
  const starved = TOPICS.filter(t => r.subjFrom[t] <= 1);
  console.log('STARVED (subjFrom<=1, cannot repeat in a sitting): ' + (starved.join(', ') || 'none'));
  const trigger = TOPICS.filter(t => r.subjFrom[t] >= 3);
  console.log('TRIGGER-CAPABLE (subjFrom>=3 in corpus): ' + (trigger.join(', ') || 'none'));
}

const args = process.argv.slice(2);
if (!args.length) { console.log('usage: node scripts/analyze-landing-r127-topic-dwell.js <dir> [dir2]'); process.exit(1); }
if (args.length === 1) printSide('CORPUS', analyzeDir(args[0]));
else { printSide('BEFORE', analyzeDir(args[0])); printSide('AFTER', analyzeDir(args[1])); }
