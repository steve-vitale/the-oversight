'use strict';
// Repay false settlement (journey crisis r240 2026-11-18): a broken favor
// is not a settled debt. Seed 14525: Amanda's wound favor was promised d18,
// rotted d19 while the scholar was blocked from tending (door-side + wound
// at 73 HP), and she was mauled again d38 — the same morning the repay
// sitting called the wound "done", "square", "settled". The need was live;
// the promise was dead. The settled lines must not fire while the need is
// live. Control cases prove the honest-settlement path is unchanged when
// the need really is gone.
const K = require('./lib'), P = require('../lib/conversation-playtest'),
  T = K.reporter('Repay broken favor with a live need');
(async () => {
  const G = await K.load({ seed: 7001 });
  const SETTLED = /it's done now|we'?re square|that one'?s settled/i;
  const LIVE = /still open/i;
  function scene() {
    // Amanda's shape: a heal_help favor, wound below 70 so the need is
    // live at build time; each case then moves health/state as needed.
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    const vid = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead);
    G.map.px = v.px ?? 4; G.map.py = v.py ?? 4; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.nodePos = { ...v.nodePos, [vid]: { nx: G.map.px, ny: G.map.py } };
    v.positions = { ...v.positions, [vid]: { mx: 4, my: 5 } };
    v.npcInside = { ...v.npcInside, [vid]: false }; v.away = {};
    v.promises = {}; v.health = v.health || {}; v.health[vid] = 40; v.sick = {};
    Object.assign(G.npcNeeds(vid), { hunger: 90, fear: 90, energy: 20 });
    const favor = G.convoBuildFavor(vid, { kind: 'heal_help', hunger: 90, health: 40, severity: 2, water: 0 });
    G.convoStoreFavor(favor);
    return { v, vid, favor };
  }
  {
    // A — the transcript reproduction: broken favor, wound live (40 HP).
    const { v, vid, favor } = scene();
    favor.state = 'broken';
    T.ok('A: the wound need is live', G.convoFavorNeedLive(favor));
    const opening = G.startConvo(vid);
    T.ok('A: opener names the live need, not a settlement', LIVE.test(opening.line) && !SETTLED.test(opening.line), opening.line);
    T.ok('A: opener does not settle a broken favor with a live need', favor.state === 'broken', favor.state);
    const def = G.convoGet(vid).want.def;
    const beat = def.engageBeat.call(G, vid);
    T.ok('A: engageBeat names the live need, not "we\'re square"', LIVE.test(beat) && !SETTLED.test(beat), beat);
    const stale = def.staleOpener.call(G, vid);
    T.ok('A: staleOpener names the live need, not "it\'s done now"', LIVE.test(stale) && !SETTLED.test(stale), stale);
    const cant = P.choose(G, vid, 'dlg:cant');
    T.ok('A: deflectBeat takes the unpaid pool, not the settled pool', /unpaid/.test(cant.line) && !SETTLED.test(cant.line), cant.line);
    const follow = G.convoFavorFollowup(vid, favor);
    T.ok('A: follow-up names the live need, not a settlement', LIVE.test(follow) && !SETTLED.test(follow), follow);
    T.ok('A: favor still broken after the sitting', favor.state === 'broken', favor.state);
    void v;
  }
  {
    // B — control: broken favor, wound healed (90 HP). Old behavior kept.
    // r250: the SETTLE is unchanged (favor -> 'acknowledged'), but the
    // WORDING changed on purpose — "It's done now. Forget it." voids the
    // promise with no account of how the need resolved (journey-scale
    // r250, seed 106261: d128 "still open... need isn't [dead]" -> d129
    // "It's done now. Forget it."). The dead-need opener now names the
    // resolution as outside the player (convoFavorResolvedWithoutYou);
    // a wound favor has no outing, so this is the "handled, not by you"
    // line. The control still pins: dead need -> settled, honestly.
    const { v, vid, favor } = scene();
    favor.state = 'broken';
    v.health[vid] = 90;
    T.ok('B: the wound need is gone', !G.convoFavorNeedLive(favor));
    const opening = G.startConvo(vid);
    T.ok('B: opener still calls a dead need done', /handled now, not by you/i.test(opening.line), opening.line);
    T.ok('B: opener settles a broken favor whose need is gone', favor.state === 'acknowledged', favor.state);
    const def = G.convoGet(vid).want.def;
    const beat = def.engageBeat.call(G, vid);
    T.ok('B: engageBeat still says "we\'re square" when nothing is owed', /we\'re square/.test(beat), beat);
    const cant = P.choose(G, vid, 'dlg:cant');
    T.ok('B: deflectBeat still takes the settled pool when the need is gone', /settled|It\'s done now/.test(cant.line) && !/unpaid/.test(cant.line), cant.line);
    void v;
  }
  {
    // C — re-wounded after a legitimate settle: acknowledged + live need.
    const { v, vid, favor } = scene();
    favor.state = 'broken';
    v.health[vid] = 90;
    G.startConvo(vid);
    T.ok('C: settled while the need was gone', favor.state === 'acknowledged', favor.state);
    v.health[vid] = 40; // mauled again, same as Amanda d38
    T.ok('C: the wound need is live again', G.convoFavorNeedLive(favor));
    const def = G.convoGet(vid).want.def;
    const beat = def.engageBeat.call(G, vid);
    T.ok('C: engageBeat does not say "we\'re square" for a live need', LIVE.test(beat) && !SETTLED.test(beat), beat);
    const cant = P.choose(G, vid, 'dlg:cant');
    T.ok('C: deflectBeat leaves the settled pool for a live need', /unpaid/.test(cant.line) && !SETTLED.test(cant.line), cant.line);
    void v;
  }
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
