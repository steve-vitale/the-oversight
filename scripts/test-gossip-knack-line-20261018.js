#!/usr/bin/env node
// Proof test: share_news gossip must render the knack fiction, not the raw id.
// RED (before fix): convoWantNews -> gossipNews -> gossipLine forced the
//   non-occupation template: "Okay, so — Naran. They're not from where they
//   said — they're from beast_calm. Don't say I told you." (raw trait id).
// GREEN (after fix): the gossip's own rendered line is used:
//   "Okay, so — Naran. that stray dog — the one that bit two people — lets
//   Naran touch it. Don't say I told you." — no raw ids, no nested quotes.
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 4242 });
  await setupGame(Game);

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const teller = roster[0], target = roster[1];
  // find a real knack gossip object (the exact shape the game produces)
  let g = null;
  for (let i = 0; i < 60 && !g; i++) {
    try {
      const cand = Game.knackGossipLine(teller, target);
      if (cand && cand.field === 'knack') g = cand;
    } catch (e) {}
  }
  if (!g) { console.log('SKIP: no knack gossip fired in 60 tries'); process.exit(0); }
  console.log('gossip object:', JSON.stringify(g).slice(0, 160));

  // drive the REAL share_news opener path with this exact gossip
  const _gossip = Game.npcGossipAbout.bind(Game);
  const _late = Game.t2LatelyEvent ? Game.t2LatelyEvent.bind(Game) : null;
  Game.npcGossipAbout = function () { return g; };           // always this gossip
  if (_late) Game.t2LatelyEvent = function () { return null; }; // skip event news
  let news = null;
  try { news = Game.convoWantNews(teller); } catch (e) { console.log('convoWantNews ERROR: ' + e.message); }
  Game.npcGossipAbout = _gossip;
  if (_late) Game.t2LatelyEvent = _late;

  console.log('news line:', JSON.stringify(news));
  const rawId = String(g.truth);
  const fiction = String(g.line).replace(/^"|"$/g, '');
  const hasRawId = !!news && news.includes(rawId);
  const hasFiction = !!news && fiction.length > 10 && news.includes(fiction.slice(0, 40));
  const nestedQuotes = !!news && /"[^"]*"[^"]*"[^"]*"/.test(news.replace(/^"|"$/g, ''));
  console.log('raw id leaked:', hasRawId, '| fiction present:', hasFiction, '| nested quotes:', nestedQuotes);

  const ok = !!news && !hasRawId && hasFiction;
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('ERROR', e); process.exit(2); });
