// sample-villager-sense.js — villager-voice excerpt sampler for the personhood sense audit.
// Usage: node scripts/sample-villager-sense.js [out.md]
// Reads the committed 2026-10-20 transcript corpora and stratifies villager-voiced
// lines (quoted NPC speech, mutters, want-lines, death/win/contest/raid reactions,
// routine narrations) across files x categories. Output is a READING AID only — the
// assessor reads and judges every excerpt; all quotes are byte-verbatim from source.
// Instrument-only: reads evidence/, writes nothing to src/.
// @ontology: instrument/tooling
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.dirname(__dirname);

const CORPUS = [
  'evidence/2026-10-20/windowseat-transcripts/belongfeast-s66006.txt',
  'evidence/2026-10-20/windowseat-transcripts/leadfeast-s66004.txt',
  'evidence/2026-10-20/windowseat-transcripts/leadfeast-s66005.txt',
  'evidence/2026-10-20/vgearseat-transcripts/vgear-leadfeast-s64304.txt',
  'evidence/2026-10-20/indispensablediag-transcripts/leadfeast-s64202.txt',
  'evidence/2026-10-20/glutprobe-sense.txt',
  'evidence/2026-10-20/glutcurvecheck-sense.txt',
];

function journeyFiles() {
  const dir = path.join(ROOT, 'evidence/2026-10-20');
  return fs.readdirSync(dir)
    .filter(f => f.startsWith('journey-deepening-r22-transcript-competent-') && f.endsWith('.txt'))
    .sort()
    .map(f => 'evidence/2026-10-20/' + f);
}

const FILES = CORPUS.concat(journeyFiles());

// category regexes over the raw line (villager-voice only; System lines excluded)
const CATS = [
  ['speech', /(💬|THEM:| says:| mutters:| whispers:| replied| said, | says, |"—|calls out|shouted|groans|laughs)/],
  ['routine', /(heads out|returns with|is back|checks the pantry|hauls back|turns to the wood run|sets off|goes to|brings in|dragged back|Elif returns|Jorge is back)/],
  ['reaction', /(died of|succumbed|Nobody's talking|fire feels smaller|Back at the haven|Word gets around|everyone's talking|the village is \d+|A funeral|laid to rest|grief|weeps|They'll fight it out|weigh in|argument starts)/],
  ['gossip', /(👀|Word with the traders|Word travels|WORD TRAVELS|whispers:|mutters:|Don't ask me how I know|Wren won't admit|They say|talk of Haven|calling it ")/],
  ['event', /(contest|CONTEST|raid|RAID|table|TABLE|WINNER|national|National|court|Court)/],
];

function classify(line) {
  // exclude System voice and player-voice lines
  if (/📺|SYSTEM:|LEVEL UP|TRIAL RECOGNIZED|📊 THE STANDINGS|📖 Codex|💧 You|You (set|work|strike|chew|drink|wait|travel|clutch)/i.test(line)) return null;
  if (/^--- d\d+/.test(line)) return null;
  for (const [name, re] of CATS) if (re.test(line)) return name;
  return null;
}

function dayOf(line) {
  const m = line.match(/^\[d(\d+)\]/);
  if (m) return +m[1];
  return null;
}

function main() {
  const seen = new Map(); // dedupe key -> count, for the repeats section
  const perFile = {};
  const out = [];
  let n = 0;
  for (const rel of FILES) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) { console.error('MISSING ' + rel); continue; }
    const lines = fs.readFileSync(full, 'utf8').split('\n');
    const short = rel.split('/').pop();
    const buckets = { speech: [], routine: [], reaction: [], gossip: [], event: [] };
    const counts = {};
    let curDay = null;
    for (const raw of lines) {
      const dHead = raw.match(/--- d(\d+)/);
      if (dHead) curDay = +dHead[1];
      const cat = classify(raw);
      if (!cat) continue;
      const day = dayOf(raw) ?? curDay;
      const text = raw.trim().slice(0, 600);
      if (text.length < 12) continue;
      const key = text.replace(/^\[d\d+\]\s*(SAY:\s*)?/, '').slice(0, 140);
      counts[key] = (counts[key] || 0) + 1;
      if (seen.has(key)) continue;
      seen.set(key, 1);
      if (buckets[cat].length < 6) buckets[cat].push({ day, text, file: short });
    }
    perFile[short] = { totalLines: lines.length, counts };
    for (const cat of Object.keys(buckets)) {
      for (const ex of buckets[cat]) {
        n++;
        out.push({ n, file: ex.file, day: ex.day, category: cat, text: ex.text });
      }
    }
  }
  // repeats: villager-voice keys repeated >= 5x in a file
  const repeats = [];
  for (const [short, info] of Object.entries(perFile)) {
    for (const [k, c] of Object.entries(info.counts)) {
      if (c >= 5) repeats.push({ file: short, count: c, text: k.slice(0, 200) });
    }
  }
  repeats.sort((a, b) => b.count - a.count);
  const report = [
    '# villager-sense sampled excerpts (reading aid — all quotes byte-verbatim)',
    `# sampled: ${out.length} excerpts across ${Object.keys(perFile).length} files`,
    '',
    '## repeat-ledger (villager-voice lines repeated >= 5x within one file)',
    ...repeats.map(r => `- [${r.file}] x${r.count}: ${r.text}`),
    '',
    '## excerpts',
    ...out.map(e => `### #${e.n} [${e.file}] d${e.day} — ${e.category}\n> ${e.text}\n`),
  ].join('\n');
  const target = process.argv[2] || '/tmp/villager-sense-samples.md';
  fs.writeFileSync(target, report);
  console.log(`wrote ${out.length} excerpts, ${repeats.length} repeat-ledger lines -> ${target}`);
}

main();
