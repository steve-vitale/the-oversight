# Victory-gating ladder, LEG 2 — PRE-REGISTRATION (written BEFORE any proof run)

Build: seat surgery + feast bundle (brief
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/victory-gating-build-brief-draft.md`,
§§(b.4), (b.5), (b.9), (c), (d), (f) + main-session calls on (f)).
Steve approved the build 2026-11-07 19:28 CST. Coordinator: parent
(coord-victory-gating). Leg 2 builder (attempt #2; attempt #1 produced
nothing — transport SIGTERM at startup, verified by the coordinator).

## Recovery (attempt #2)

- Master at build start: `32c47d41eb9832e08b5c8050ce0d1ff29e42591d`
  (verified `cat .git/refs/heads/master` AND `git rev-parse HEAD` in
  `~/workspace/the-scattering` at 2026-11-08 ~09:27Z — they AGREE at
  this read; the coordinator's earlier disagreement (HEAD 32c47d41e vs
  ref 3b9353fa8) has resolved: Loop A landings moved the ref forward).
- Stray dir `~/workspace/worktrees/build-ladder-leg2/` held NO leg-2
  work (only evidence/2026-10-20 journey-probe files, no .git, not a
  worktree) — removed with `rm -rf`. Branch `build-ladder-leg2` was at
  old master tip 3b9353fa8 with no unique commits
  (`git log master..build-ladder-leg2` empty; tip is an ancestor of
  master) — deleted with `git branch -D`.
- Registered fresh: slug `build-ladder-leg2`, owner
  `coord-victory-gating`, purpose "seat surgery + feast bundle",
  branch `build-ladder-leg2`, worktree
  `~/workspace/worktrees/build-ladder-leg2` at 32c47d41e. Heartbeat
  verified by read-back.
- Leg 1 is ON master (merged locally, pending ship): `Game.ladderCfg()`,
  `Game.villageLadder()`, `Game.ladderStage()` (live, NEVER 4),
  `Game.ladderPeakStage()`, `Game.ladderLine()`,
  `Game.ladderCapstoneReady(kind)`, `Game.ladderCapstoneDelivered()`,
  `Game.ladderCapstones()` — read the leg-1 run note as the API
  contract; not re-litigated here.

## Scope (leg 2 ONLY)

- `src/js/progression.js` — `deedGateReady()`: `foodDeeds` becomes
  `sentimentTaught` alone; `feastSurgeUsed` dropped from the full seat.
  Every other bar untouched (waves 5/5/4/3/2, contests ≥3, crises ≥3,
  national/global scale, stage ≥2). Comments naming the old pair
  updated; `checkArc()`'s reactor/seat-waiting beats keep working (the
  pellet no longer blocks the seat on food deeds — that IS the surgery;
  see the reactor-test note below).
- `src/js/table.js` — `tableSeat()`: lesser seat's `foodDeeds` becomes
  `sentimentTaught` alone AND gains ladder peak stage ≥ Village (12
  counted points); full seat gains ladder peak stage ≥ National (40)
  AND a capstone deed delivered. `tableSeatLine()` +
  `fullSeatShortfall()`: voice the ladder with `ladderLine()` reuse
  (Q10 — cap never silent, missing pieces named). `tablePreview()`:
  adds the ladder block for the Haven panel (leg 3 renders it).
  Sanctity: `tableActive()` extended so the window starts at capstone
  delivery, not at sitting (brief §b.9). All seven paths, branches,
  failure downgrades, NPC ascension, themes, overtime pricing,
  `table_won` frames untouched. NEW `ladderDeliverCapstone(kind)`:
  the delivery surgery (records on `progState().ladderCapstone`,
  pays the price; see below). Marked `// wired-exempt` as a leg-3
  Haven entry point (app.js panelHaven calls it).
- `src/js/game.js` — `feastPlan()` / `hostFeast()`: the feast gains a
  bundle sheet — 6 slots filled from 12 contributions (verified list
  below). Any 6 distinct contributions complete the bundle. Pantry
  cost stays real (each contribution drawn from the pantry like
  today's menu draw); the quality formula still runs on what was
  served. Completing the bundle writes `bundle: true` (+
  `bundleStage`: the live ladder stage at completion) on the feast-log
  entry and grants +4 ladder points to the current stage — a deed
  bonus OUTSIDE the track cap, once per stage (distinct `bundleStage`
  values on bundle feast-log entries; the record lives on the feast
  log itself, no new counter). NEW `feastBundleBuyOut()`: pay 8000
  kcal straight from the pantry, no feast held, no guests needed;
  bundle counts as complete (grants the +4, once-per-stage rule
  applies). Marked `// wired-exempt` as a leg-3 Haven entry point.
  Feast cost floor (1500 kcal), guest rules, one-per-day, exile rule,
  quality formula, pantry draw untouched. `feastBuff.js` untouched.
  `init()`: `ladder-capstones.json` added to the data list (leg-1
  owed item — the browser otherwise reads only the fallback mirror).
- `src/js/ladder.js` — MINIMAL AMENDMENT, FLAGGED FOR COORDINATOR
  REVIEW (not silent): the +4 bundle bonus has to be READ somewhere
  for the seat to ever see it, and `villageLadder()` is the only
  reader of ladder points. The amendment adds ONLY a bonus read
  inside `villageLadder()`: +4 per distinct `bundleStage` on bundle
  feast-log entries, added to `counted`/`total` AFTER the per-track
  cap, with `detail.bundleBonus` / `detail.bundleStages` exposed.
  No minting change, no threshold/cap change, no new store, no new
  function. If the coordinator rejects the amendment, the fallback is
  the bundle flag alone (embassy reads it) with the +4 unimplemented
  — and this prereg's L2-2 bar fails honestly rather than silently.
- NEW `scripts/test-ladder-seat-*.js` + `scripts/test-ladder-bundle-*.js`
  unit proofs (shared kit: `scripts/sim-harness.js` /
  `scripts/godpath/lib.js`; never copied eval boilerplate, never
  hardcoded absolute paths). Green-list entries added with `quick`.
- This prereg + `evidence/2026-11-08/sim-ladder-leg2-run-note.md`.
- NOT touched: `app.js`, `overtime.js`, `metaProgression.js`,
  `membership.js`, `standing.js`, `hierarchy.js`, `tracks.js`,
  `tracks.json`, `feastBuff.js`, pellet-pass / mirror-cap / alien
  files, Loop A/B arms, journey rotation files, loop locks. Leg 3
  owns overtime.js, app.js panelHaven, metaProgression.js. Leg 4 owns
  calibration panels + proof refresh.
- No balanced panel in this leg (leg 4 owns it). No fresh seed band
  needed: unit proofs use rigged states, not seeds.

## The final 12 bundle contributions (Q9 — verified by grep, pre-proof)

Each resolves to a real item id, a real food state, or a real deed/state
read. Two of the brief's starting 12 do NOT exist as stated and are
SWAPPED (not invented around — the swap is to a real thing in the same
family, documented here):

1. `hunted_meat` — served meat with `plantId: 'meat_<animal id>'`,
   foodKind 'meat', foodState carcass/cleaned/raw. Real: `foodCarcass`
   (food.js:432), `how: 'hunted'`; animal ids in animals.json.
2. `cooked_meat` — served meat with foodState cooked/smoked/roasted/
   dried. Real: the quality formula's own centrepiece check
   (`hostFeast` servedList `meat` flag, game.js).
3. `foraged_feast` — served plant/nut with `plantId` in plants.json
   (187 real plant ids). Real: foraged plant items (food.js).
4. `crafted_centrepiece` — served item with itemId `'pemmican'`.
   Real: pemmican bars, crafted from dried/smoked meat + rendered fat
   + berries (food.js:1118, itemId 'pemmican', foodState 'pemmican').
5. `monster_meat` — SWAP for the brief's `traded delicacy`. NO trade
   provenance marker exists on any pantry item (grep for
   traded/fromTrade/tradeGood in food.js, storage.js: nothing; trader
   purchases carry no origin flag), so a traded contribution cannot be
   read honestly. The swap: served meat with `plantId: 'meat_<monster
   id>'` where the id is a real monster id (data.monsters) — monster
   meat (game.js:32580, game.js:45863, `monsterMeatGated`), the tested
   and cooked monster meat of Steve's 2026-10-27 ruling (4).
6. `guest_of_honor` — SWAP for the brief's `a talker's song`. NO song
   exists anywhere: grep for song/sing over src/data/*.json finds only
   flavor text ("sings the cry free", abilities.json) — no song deed,
   no song action, no song contest. The swap: the feast's star guest
   (highest-trust showed villager attends) — `hostFeast`'s own `star`
   computation ("the table has its heart", quality formula +1). A real
   feast fact, in the talker's family (the guest who makes the table).
7. `explorers_rare` — served plant with idDifficulty 4 (8 real ids:
   mayapple, pokeweed, american_ginseng, wild_carrot, cow_parsley,
   giant_puffball, autumn_crocus, death_cap — plants.json).
8. `preserved_food` — served item with foodState 'preserved' (smoked,
   food.js:930) or 'rendered' (rendered fat, preservation ladder
   food.js:56: cleaned < cooked < smoked < rendered fat < pemmican).
9. `medicine_brewed` — served plant with `medicinal: true`
   (34 real plants) AND foodState 'cooked' (brewed = cooked medicinal
   plant; the brew action is game.js:13969, "brew the bitter leaves").
10. `garden_harvest` — served item carrying non-empty `gardenShares`
    (real marker on pantry items: food.js `blendGardenShares` /
    `mergeHarvestShares`, keys ordinary/assisted/legacy/
    legacyAssisted; garden crops in gardening.json, 9 plants).
11. `kept_recipe` — state fact: `state.codex.recipes` holds ≥1 entry
    with level ≥1. Real store (app.js:15343, food.js:829,
    game.js:2781 sets `snare` level 3); 36 real recipe ids in
    recipes.json.
12. `keepsake_channel` — state fact: a keepsake channel is armed at
    feast time (`s.prog.feastSurge`, progression.js:392 arming;
    `hostFeast` already reads it as `surgeSpent`).

RULES (implemented in `feastBundleCheck`, game.js): one served item
fills at most ONE slot (first match wins, specific-before-general
order: pemmican → monster meat → hunted meat → cooked meat →
preserved → garden → medicine → rare → foraged); the three state-fact
contributions (guest of honor, kept recipe, keepsake-channel) fill
their own slots independently. 6 distinct contributions complete the
bundle. The preview in `feastPlan()` computes the same sheet from the
preview draw (guest of honor = highest-trust invitable guest, marked
preview); `hostFeast()` computes the final sheet from the real draw +
the real showed star.

## Live stage vs peak stage for the seat gate — DECIDED IN PREREG

The seat gate reads PEAK stage (`ladderPeakStage()`), not live stage.
Reasoning: (1) the capstone delivery is recorded and irreversible
("cannot be undone" — brief §b.9); a seat the capstone opens must not
be revocable by later deaths, or the irreversibility is words only.
(2) Steve's standing-offer ruling (2026-11-06): once the table offers
a seat, the offer does not withdraw — peak stage is the offered-stage
memory. (3) The mercy rule's whole point is that the win cannot be
stolen between delivery and sitting; a live-stage gate would let
deaths steal it anyway. (4) The brief's own framing (§a): the lesser
seat "is priced on what the village did, not on one dinner" — what
the village DID (peak), not today's headcount. The ladder bar/line
still shows the LIVE stage; `tableSeat()` detail carries both live and
peak so the voicing can name a dip honestly. The other bars stay live
(waves faced are monotonic deeds; scale and integration can still dip
and hold the seat). Proved by the L2-7 test (reach National → lose
villagers → live stage drops → seat stays priced). Coordinator reviews.

## Capstone delivery (surgery)

- `ladderDeliverCapstone(kind)` (table.js): guards (already delivered
  → `delivered`; readiness via `ladderCapstoneReady(kind)` → the
  readiness reason otherwise); pays the price; records
  `pg.ladderCapstone = kind` (+ `pg.ladderCapstoneDay`, and for
  tribute `pg.ladderCapstoneDetail = {veterans: [names]}`); says the
  delivery beat aloud ([needs-eyes]); returns `{ok, kind, ...}`.
- Military tribute: the 2 veterans leave via the one removal choke
  point `removeVillager(vid, 'tribute')` (betrayal.js:1080 — death
  marking is killed/ambushed-only, phoenix killed-only, schism
  exiled-only; a 'tribute' removal filters the roster, records in
  `v.exiles` with how 'tribute', cleans positions/sick/heat/allies).
  The scholar is NEVER taken: delivery picks 2 living wave-4 veterans
  EXCLUDING the scholar. KNOWN GAP (flagged, not patched silently):
  leg 1's `ladderCapstoneReady('military_tribute')` counts the scholar
  as a payable veteran (`_ladderLivingVeterans` treats villagerId as
  living), so a scholar-veteran + 1 villager reads ready but cannot
  deliver — delivery refuses honestly with `veterans-short` and
  records nothing. Leg-1 follow-up owed: exclude the scholar from the
  tribute readiness count. In real runs the scholar is very often a
  wave-4 killer, so this edge is likely, not rare.
- Trade charter: no price to pay (the sealed charter IS the deed);
  delivery records which chartered trade link it is.
- Feast embassy: no price to pay (the bundle is already done);
  delivery records it. READING ADOPTED (leg 1's): bundle completed at
  ANY stage + currently National (live stage, per
  `ladderCapstoneReady`) = ready. The data form
  (`ladder-capstones.json` requires {feastBundle: true, ladderStage:
  3}) is a conjunction, not a temporal constraint; enforcing
  "bundleStage === 3" at delivery would contradict readiness. Noted
  for the coordinator.
- Buy-out and the embassy: a buy-out writes the same bundle feast-log
  entry, so a buy-out completed at National stage satisfies the
  embassy like a feast bundle does. Follows from the brief's own
  definitions ("the bundle counts as complete"). Noted for the
  coordinator.

## Sanctity hook (brief §b.9)

The hook is `tableActive()` (table.js, ~line 750): the single
predicate every ambient router gates on — monsterTurn ambient contact
(game.js:7991), `overtimeScaleFight` (overtime.js:128), havenGrowth,
npc-triggers ('table_sits' row), favor-outing, win-plan. The leg-2
change adds one clause: a delivered capstone
(`pg.ladderCapstone`) makes `tableActive()` true until the finale
resolves (phase 'done'). No second hook exists; overtime.js is NOT
touched (leg 3 owns it) — its `overtimeScaleFight` is a CONSUMER of
the hook, not a hook. NOTE: a village that delivers and never sits
stays under sanctity (same class as a sitting that never chooses a
door); the overtime clock still docks the seat's standing while it
waits, so waiting is not free.

## Bars (metric binding — MEASUREMENT.md §14: a miss is NO-GO, never re-scored)

- L2-1-seat: every `scripts/test-ladder-seat-*.js` proof passes:
  deedGateReady without feastSurgeUsed (sentimentTaught alone opens
  the food bar; a bearer with sentimentTaught and NO surge passes);
  lesser opens at Village peak with sentimentTaught and no feast;
  lesser refuses below Village peak; full needs National peak +
  capstone (each of the three capstones opens it; refuses with none);
  full still refuses when any other bar fails (waves/contests/crises/
  scale/stage).
- L2-2-bundle: every `scripts/test-ladder-bundle-*.js` proof passes:
  bundle completes with 6 distinct contributions (incl. one non-hunt
  mixture — no hunted meat among the 6); bundle refuses with <6 /
  with duplicates (one item filling two slots is refused); +4 granted
  once per stage only (second bundle at the same stage adds nothing);
  buy-out pays 8000 kcal and marks complete (pantry lighter by 8000,
  bundle flag + bonus recorded); tribute removes exactly 2 veterans
  (roster shrinks by 2, both named, scholar never taken); mercy:
  scripted post-capstone raid cannot kill villagers between delivery
  and sitting (monsterTurn ambient contact silent + overtimeScaleFight
  refuses, with a no-delivery control that fires); capstone delivery
  is recorded and irreversible (second delivery refused).
- L2-3-scope: `git show --stat` for every leg-2 commit touches no
  `src/js` file outside progression.js, table.js, game.js (plus the
  flagged minimal ladder.js bonus read), no `src/data` file, and no
  app.js / overtime.js / metaProgression.js / membership.js /
  standing.js / hierarchy.js / tracks.js / feastBuff.js.
- L2-4-wired: `node scripts/check-wired.js` on progression.js,
  table.js, game.js, ladder.js shows nothing unwired (the two new
  leg-3 entry points carry `// wired-exempt` with the leg-3 reason).
- L2-5-data: in a harness-loaded game, `Game.data.ladderCapstones`
  is the JSON (has `_doc`, 3 capstones) — not the in-code mirror — and
  `Game.ladderCapstones()` returns its 3 defs.
- L2-6-green: `node scripts/check.js --quick` in a free gate slot
  (never concurrent with another gate); no NEW failure attributable
  to the change. The measurement-proof pair
  (measurement-proof-update + measurement-workflow) may go red because
  the change alters what the game reads — if so, refresh the neutral
  proof the leg-1 way (fresh panel seed 7 × 4 policies × 150d +
  scripts/balance-proof-update.js) in its own commit and say so. The
  phone-frame-proof test stays red until a browser-capable agent
  refreshes receipts (known owed item — do not chase it, do not
  hand-edit proof hashes). Pre-existing failures (mobile-combat-
  cadence, occupation-panels, establishment-r20-fixes, per leg 1)
  are carried as known, not fixed here.
- L2-7-peak: the live-vs-peak test passes: rig National (peak 3) →
  kill villagers so the LIVE stage drops to ≤2 → the full seat stays
  priced (with capstone + other bars) and the lesser stays priced.
- L2-8-reactor: `scripts/test-table-reactor-seat-honesty-20261017.js`
  still passes (its setup's seat stays 'none' — now via the unrigged
  ladder bar, not the food deed). Its premise is updated in the same
  commit: comments corrected to the new design (the pellet no longer
  blocks the seat on food deeds; the beat still fires for a reactor
  bearer at arc 3 with no seat), plus an assertion that
  `detail.foodDeeds` is true with sentimentTaught alone. If it breaks
  for another reason, the break is diagnosed, not waived.

## NOT in this prereg (leg 4 owns them)

- The full P3 panel bar (bundle completes ≥4/8 on the r109 band +
  99767-shape seeds) is a LEG 4 panel bar, not a leg-2 bar. A SMALL
  scripted pilot may run if cheap (bundle completion on 2–3 r109-band
  seeds) and is reported as a pilot, not a panel verdict.

## Env

- None for the unit proofs (shared harness, fixed seeds, rigged
  states). The optional pilot uses the standard competent-panel env
  only if run.
