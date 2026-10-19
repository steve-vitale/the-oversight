# Browser boundary proof

Node campaigns load through `scripts/sim-harness.js`; they deliberately exclude
app.js, sprites, tile scenes, movement animation and drama. Passing a campaign or
backend helper does not prove a clickable, readable mobile flow. The Highbeam
Deer report demonstrated this with a replaced combat button handler; the Market
choice pilot demonstrated it again with a missing inline card wrapper. Both had
passing underlying action logic.

For an input, menu, combat-turn, save/Continue or layout change, retain browser
evidence of the changed flow before calling it done. Use the actual application
scripts and CSS. A prepared holder/fight is useful for reaching a rare scene;
label preparation explicitly and perform the interaction being proved with the
normal controls. Never call a prepared public-action button normal UI coverage.

1. Start a local repository server on an unused loopback port. Use a fresh
   browser origin/profile for disposable saves. Do not clear another player's
   saves. The dated proof server/fixture can be replayed directly, for example
   `node evidence/2026-10-18/market-choice-server.cjs`, then `/proof` on port8747.
2. Test at390×844 (and a larger viewport when layout changes). Follow the actual
   controls through quote/confirm or move/action/end-turn, then inspect the DOM
   state **and the rendered screenshot**. A visible label in a DOM tree does not
   establish readable text, stacking, hit targets or an unobstructed button.
3. Exercise cancellation/refusal, a successful paid action, a changed context or
   replaced control, repeat-use limits, and Continue where relevant. Check real
   inventory, food, debt, turn cursor and saved state, not just success narration.
   Read the committed save before reload where possible: unload autosave can
   conceal missing immediate persistence. Do not invoke save from a read helper.
4. Retain fixture/configuration, source manifest, text captures, screenshots,
   console warnings/errors and exact observed payment/action results in dated
   evidence. Keep failed pilots and identify which artifacts supersede them.
5. Close owned test tabs/servers and reset temporary viewport overrides. Leave
   player saves and other agents' servers untouched.

Market choice cases: an equipped Searcaster must not disable named armor; quote
known bark armor840 kcal and cancel at unchanged food/debt/daily use; reject an
unknown exact name; confirm through the normal ability card and inspect the
saved delivery; show relic40 fuel plus two markers and the impending Audit;
change bearer/balance after a quote and require review before spending. The
automatic no-upgrade response must still allow a named item. Suggestions contain
only carried/worn/prep item names and learned recipe names; exact names entered
by the player do not enumerate the hidden catalog.

These are prepared mechanic/UI checks. They do not establish natural attainment,
NPC use, pacifist viability, reward balance or full campaign coverage. Use the
balanced workflow in SIMULATING.md for those questions, with actual opportunity
denominators, matched policies/observer and independent holdouts for small claims.
