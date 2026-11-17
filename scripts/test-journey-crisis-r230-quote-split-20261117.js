// journey-crisis r230 (2026-11-17): quote-aware pagination.
// Defect (transcript-caught TWICE in the wild): the resume opener's quoted
// memory ('Quinn is gone and the world just... continues. That's the part
// I can't stand.') is two sentences, and convoSplitBeats split it at the
// sentence boundary inside the quote — so the second transcript entry read
// as a new utterance starting mid-quote:
//   r229 14494 d28: 'Halfway to the tree line, Naomi freezes... You do. / NPC: The wild...'
//   r230 14503 d85: 'Quinn is gone and the world just... continues. / NPC: That's the part I can't stand.'
// Fix: convoSplitBeats never splits at a sentence boundary inside a
// single-quoted span (apostrophes — don't, Sara's — don't count as
// delimiters). A chunk may run over MAX rather than break a quote.
// Cases: (1) wild r230 line — quote intact in one chunk; (2) wild r229
// line — same; (3) unquoted long line still splits (pagination kept);
// (4) apostrophes don't fool the tracker; (5) emission path — the wild
// line through sayLine lands with the quote in a single transcript entry;
// (6) emission path — an unquoted long line still paginates.
// Run: node scripts/test-journey-crisis-r230-quote-split-20261117.js
// Exit 0 = all pass. Verifies RED on base (git stash the src change).
const K = require('./godpath/lib');
const F = [];
const t = (name, fn) => { try { fn(); console.log('PASS', name); } catch (e) { F.push(name + ': ' + e.message); console.log('FAIL', name, '-', e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); };
const ok = (c, m) => { if (!c) throw new Error(m); };

// Wild line, seed 14503 d85 (Gianna) — reconstructed verbatim from the
// transcript: opener framing + the two-sentence quoted memory + nod.
const WILD_R230 = "Sara and I never finished talking about what's been happening — we wandered off it, 3 days back. You're wearing Sara's shoes now — want to pick it up? 'Quinn is gone and the world just... continues. That's the part I can't stand.' We still owe grief a proper ending, too.";
const QUOTE_R230 = "'Quinn is gone and the world just... continues. That's the part I can't stand.'";
// Wild line, seed 14494 d28 (Naomi, r229) — clipSnippet-clipped memory.
const WILD_R229 = "Naomi and I never finished talking about grief — we wandered off it, 2 days back. You're wearing Naomi's shoes now — want to pick it up? 'Halfway to the tree line, Naomi freezes… You do. The wild…' We still owe grief a proper ending, too.";
const QUOTE_R229 = "'Halfway to the tree line, Naomi freezes… You do. The wild…'";

async function main() {
  const Game = await K.load({ seed: 14503 });
  K.newRun(Game);
  const G = Game;

  t('unit: wild r230 line keeps the quoted memory in one chunk', () => {
    const chunks = G.convoSplitBeats(WILD_R230);
    ok(chunks.length >= 2, 'line should still paginate, got ' + chunks.length + ' chunk(s)');
    const holders = chunks.filter(c => c.includes(QUOTE_R230));
    eq(holders.length, 1, 'the full quote must appear whole in exactly one chunk');
    ok(!chunks.some(c => c.trim().startsWith("That's the part")), 'no chunk may start mid-quote');
    ok(!chunks.some(c => c.trim().startsWith('continues.')), 'no chunk may start mid-quote (2nd sentence)');
  });
  t('unit: wild r229 line keeps the clipped memory in one chunk', () => {
    const chunks = G.convoSplitBeats(WILD_R229);
    const holders = chunks.filter(c => c.includes(QUOTE_R229));
    eq(holders.length, 1, 'the full quote must appear whole in exactly one chunk');
    ok(!chunks.some(c => c.trim().startsWith('The wild')), 'no chunk may start mid-quote');
  });
  t('unit: unquoted long line still splits at sentence boundaries', () => {
    const line = 'We walked the ridge all morning and the wind cut straight through us. Then the rain came in sideways and the path turned to mud under our boots. By evening we were back at the fire, tired and soaked, and nobody said much of anything at all. And the fire was still going when we woke, which was the only good thing about that whole miserable day.';
    const chunks = G.convoSplitBeats(line);
    ok(chunks.length >= 2, 'unquoted line must still paginate, got ' + chunks.length);
    ok(chunks.every(c => c.length <= 260), 'no chunk may exceed MAX when no quote is involved');
  });
  t('unit: apostrophes do not count as quote delimiters', () => {
    const line = "Sara's brother can't stop talking about the day don't you know we lost the trail. He says we don't go back there, and I can't blame him one bit for that. 'Quinn is gone and the world just... continues. That's the part I can't stand.' We still owe grief a proper ending, too.";
    const chunks = G.convoSplitBeats(line);
    const holders = chunks.filter(c => c.includes(QUOTE_R230));
    eq(holders.length, 1, 'quote must stay whole even with apostrophes around it');
    ok(!chunks.some(c => c.trim().startsWith("That's the part")), 'no chunk may start mid-quote');
  });
  t('emission: wild r230 line through sayLine keeps the quote in one entry', () => {
    const st = Game.state;
    const vid = st.village.villagers[0].id;
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const base = c.transcript.length;
    Game.sayLine(vid, WILD_R230, { structural: true });
    const entries = c.transcript.slice(base).map(e => (e && e.text) || e);
    ok(entries.length >= 2, 'line should still paginate into entries, got ' + entries.length);
    const holders = entries.filter(e => String(e).includes(QUOTE_R230));
    eq(holders.length, 1, 'the full quote must sit in exactly one transcript entry');
    ok(!entries.some(e => String(e).trim().startsWith("That's the part")), 'no entry may start mid-quote');
    Game.endConvo(vid);
  });
  t('emission: unquoted long line still paginates through sayLine', () => {
    const st = Game.state;
    const vid = st.village.villagers[1].id;
    const line = 'We walked the ridge all morning and the wind cut straight through us. Then the rain came in sideways and the path turned to mud under our boots. By evening we were back at the fire, tired and soaked, and nobody said much of anything at all. And the fire was still going when we woke, which was the only good thing about that whole miserable day.';
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const base = c.transcript.length;
    Game.sayLine(vid, line, { structural: true });
    const entries = c.transcript.slice(base);
    ok(entries.length >= 2, 'unquoted line must paginate, got ' + entries.length);
    Game.endConvo(vid);
  });

  if (F.length) { console.log('FAILURES:', F.length); F.forEach(f => console.log(' -', f)); process.exit(1); }
  console.log('ALL PASS (6/6)');
}
main().catch(e => { console.log('FATAL', e && e.stack || e); process.exit(1); });
