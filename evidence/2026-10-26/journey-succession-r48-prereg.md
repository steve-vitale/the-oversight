# Journey succession r48 — MIXED REGIME + CONVO-WINDOW C1 + MOVER-NAMED E1b + ARMOR INTRADAY MAPS (lane B, pre-registration 2026-10-26, written before any run; worktree registration delayed ~22 min by the container .git EPERM flap, cleared 04:18 UTC)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r47's four named next steps PLUS the open succession-armor
thread (memory 2026-10-25: Pamela's worn bark piece leaves every scanned
location at the d34 mantle pass; a bark piece appears in the scholar pack
at the d58 succession, flickers d59 out / d60 in, leaves the pack d62 —
receiving locations unknown at day resolution). Instrument only, zero
src/js changes. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The five next steps (from r47's run note + the armor thread)

1. MIXED REGIME (r47's next). 2 day-5 seeds + 3 mature seeds (r45's mix).
   Day-5 seeds stage the scripted kill before the arena band opens;
   mature seeds (EARLY_KILL_DAY=40) let organic arena mantles pre-empt
   honestly per the standing rule, and give V1 real (non-vacuous) coverage
   — r47's V1 was 5/5 n/a-none-eligible because a day-5 village has no
   trust>=60 villager.
2. CONVO-WINDOW CAPTURE FOR C1 (r47's documented instrument gap).
   r47's C1 missed on the letter (26/27) because one office move (26021,
   day 21, 0 → 8) landed in the driven-convo window BETWEEN snapshots:
   the officeDaily push runs BEFORE the checkpoint convos in each
   post-loop iteration, and the next iteration's callTrustBefore is taken
   AFTER those convos, so the move is invisible to both series.
   Fix: after the convo block in each post-loop iteration, snapshot the
   office entry again (rec.officeDailyPostConvo) and record any delta vs
   the day's officeDaily entry as a convoWindowMove with that iteration's
   convo lines attached. C1v2 counts a daily move as covered if its day
   has a callMove OR a convoWindowMove.
3. FINER E1 REPLACEMENT — MOVER-NAMING LINES (r47 metric review).
   Whole-call presence is dead as a discriminator (26/26 trust moves
   carry both crisis and gift lines except a handful). E1b classifies
   each trust-move callMove by whether any of its lines NAME a mover
   (first-name match against the call's own movers list): mover-named
   vs unnamed, plus topMoverNamed bool. Cross-tab E1b against
   concentration (solo / single-mover / concentrated top-share >= 0.5 /
   diffuse). The old eventClass is kept for continuity, not judged.
4. ARMOR INTRADAY MAPS (the open succession-loss thread). The day-resolution
   map cannot say where a bark piece goes at a mantle pass. This run
   snapshots armor locations at: pre-death, immediately post-handoff,
   end of death day, d+1, d+2, d+3 (burial day), and at each chain
   handoff. Locations scanned (armorstock-census pattern + the missing
   ones): scholar inventory, scholar equipped, scholar prepStash
   (Game.prepStash()), village pantry, living villagers' equipped+items,
   DEAD villagers' equipped+items (vpOf without the living filter),
   corpses' items (Game.corpses() entries carry .items), villager.stashed
   (personal belongings). Focus item: bark_armor; all def.armor items
   reported, bark_armor tracked per piece.
5. OFFICE-LAGS / VILLAGE-WARMS SPLIT ON MATURE SEEDS (r47's next).
   r47 confirmed the split young (office crashes while the village
   warms). This run re-tests it on the 3 mature seeds via the existing
   trustVerdict dials.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's table
does not cover the lineage/mantle machinery). This run invents no canon;
it measures the machinery r38–r47 exercised, under Steve's 2026-10-23
meal-gate ruling (established-villager successors eat full at any trust).

## Leg question

On a mixed band — young villages where the scripted kill stages cleanly
and mature villages where the arena may pre-empt — does the succession
machinery still hold, does the convo-window capture close C1 to 100%,
does mover-naming separate the trust-move classes that whole-call
presence could not, and can intraday maps account for every bark piece
across a mantle pass?

## What counts as an interesting finding

- SCRIPTED STAGING (young): 2/2 day-5 seeds stage the scripted kill
  (not pre-empted before day 5). A pre-emption before day 5 is itself a
  finding (the arena band opens earlier than r46's days 8–28 suggested).
- V1 NON-VACUOUS: at least one mature seed has eligibleAtDeath > 0 and
  resolves PASS-fired. A FAIL-alive-silent on any seed is a REAL BUG.
- C1v2: a convo-window move is FOUND (the 26021 class reproduces) and
  every daily move is covered by callMove-or-convoWindow. If no
  convo-window move occurs on this band, C1v2 passes on the letter but
  the convo-window branch stays unexercised — reported as such, not
  claimed as coverage.
- E1b: mover-named vs unnamed separates concentration classes (e.g.
  concentrated moves cluster mover-named, diffuse moves cluster
  unnamed) — either clustering narrows the trap; no clustering leaves
  it open and is reported as such.
- A1: every bark_armor piece has a location at every snapshot, OR its
  loss transition is named (location → gone, with day/phase). A piece
  that vanishes between two intraday snapshots on the mantle-pass day
  IS the thread's answer taking shape (narrowed to the handoff window);
  a piece that vanishes between daily snapshots with no intraday
  narrowing is reported as still-open with the window stated.
- M3v2b, M1, M4, MG2, M5 stay green: any regression is a REAL BUG.

## Binding metrics (§14)

- SCRIPT (young staging): 2/2 day-5 seeds with death.scripted === true.
  Mature seeds: scripted-or-organic honored, reported per seed.
- V1 (vouch snapshot, carried): on every seed with eligibleAtDeath > 0,
  verdict PASS-fired; no FAIL-alive-silent anywhere.
- C1v2 (call + convo-window attribution): 100% of post-death officeDaily
  moves have a matching callMove (same day) OR a convoWindowMove (same
  day) carrying before/after and the covering lines.
- S1 (bearer-own delta, carried): 100% of same-bearer callMoves carry a
  numeric bearerDeltaExact; 100% of chain handoffs carry null; every
  solo-office call has |delta| <= 2 (a >= 3 solo-office delta is an
  instrument contradiction — fail loudly, not a game finding).
- E1b (mover-naming, completeness): 100% of trust-move calls carry
  moverNamedN + topMoverNamed; the cross-tab is reported whatever it shows.
- A1 (armor accounting): 100% of bark_armor pieces tracked have a location
  at every snapshot, or a named loss transition (from-location, day,
  phase). Pieces present pre-death but gone post-handoff with no
  receiving location are reported as UNACCOUNTED with the exact window.
- M3v2b (social echo, carried): on >= 4/5 seeds, >= 2 v2b mentions of
  the dead bearer within 7 days of death (funeral-arc lines excluded,
  loot lines excluded by the /^You take /i rule). v2 reported alongside.
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- MG2 (meal gate): 0 violations on 5/5 seeds.
- M5 (people check): 0 identity failures across sense-read transcripts.
- Chain deaths: every chain death cause-known from fallen/lineage, or
  reported UNKNOWN with the missing list named.

## Seeds / policy / horizon

Seeds 26031–26035 (fresh band: no journey-succession evidence file uses
26031–26035; r45 used 26001–26005, r46 26011–26015, r47 26021–26025).
Policy: competent (same as r41–r47). Regimes: 26031, 26032 EARLY_KILL_DAY=5;
26033, 26034, 26035 EARLY_KILL_DAY=40. Horizon: phase A per regime, then
the scripted kill via the REAL playerDeath ('a hushwolf') unless the
mantle passes organically in phase A (honored per the standing rule),
then 30d competent play as the successor. Death-aware stop (+10d tail).
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision
  is proposed here for the NEXT run, never re-scored mid-run.)

## Implementation notes (from r47 driver, for the run that builds r48)

Base: copy scripts/journey-succession-r47-20261025.js →
scripts/journey-succession-r48-20261026.js (mode string, EVID date dir
2026-10-26 for transcripts + tele files; analyzer + proof test copied
and re-seeded the same way). Edit list:

1. CONVO-WINDOW (post-loop iteration, AFTER the convo block, BEFORE the
   next iteration's callTrustBefore): snapshot office entry
   (Math.round(trustOf(Game, Game.villagerId))) + villageMean into
   rec.officeDailyPostConvo; if it differs from that iteration's
   officeDaily entry, push rec.convoWindowMoves.push({day: curDay,
   dplus: daysSince, from, to, delta, convoLines: <that iteration's
   convoLines slice>}). Capture the convoLines length before the convo
   block and slice after, so the move carries exactly its window's lines.
   C1v2 (in finish(), replacing callCheck): dailyMoveDays covered if
   day ∈ callMove days OR ∈ convoWindowMove days; report both sets
   and any still-missing day. TELE TRAP (r47 lesson): tele is written
   BEFORE finish(), so tele's convoWindow count must be computed
   directly from rec.convoWindowMoves, never from the finish-time
   callCheck object.
2. E1b MOVER-NAMING (inside the callMove capture IIFE, after movers are
   built): for each mover, test its first name against the call's lines
   (same first-match bucketing text the buckets already hold — use the
   raw callLines texts, not the bucket samples, so naming is not
   bucket-gated). Fields on the move: moverNamedN (count of movers
   named in ≥1 line), moverNamedMovers (list), topMoverNamed (bool for
   the largest-|delta| mover), e1bClass ('mover-named' if moverNamedN
   > 0 else 'unnamed'). Analyzer cross-tab: concentration
   (solo/single/concentrated/diffuse, same classifier as r47) × e1bClass.
3. ARMOR MAPS — new function armorMap(Game) (armorstock-census pattern):
   defById from G.data.items; isArmor = def.armor != null; report
   bark_armor separately (id === 'bark_armor'). Locations, each a list
   of item ids: scholarPack (state.scholar.inventory), scholarWorn
   (state.scholar.equipped values), scholarPrepStash (Game.prepStash()
   if function, else state.scholar.prepStash), pantry
   (state.village.pantry), livingWorn + livingPack (vpOf, !vp.dead:
   vp.equipped values + vp.items), deadWorn + deadPack (vpOf, vp.dead:
   same fields, recorded under the dead villager's first name),
   corpses (Game.corpses() entries: .items + holder name/id),
   villagerStashed (villager.stashed on roster chars — guard with
   try/catch; the field lives on villager records per game.js:2682).
   Snapshot points into rec.armorMaps[]: {at: 'pre-death' | 'post-handoff'
   | 'end-death-day' | 'd+1' | 'd+2' | 'd+3' | 'chain-handoff', day,
   map}. Per-piece transitions computed in the analyzer: for each
   bark_armor occurrence id (ids may repeat — track by location string
   + item id, and report COUNT per location rather than pretending
   piece identity when ids collide; a location-count drop with no
   receiving location gain is UNACCOUNTED with the window stated).
   Snapshot calls: pre-death (before Game.playerDeath, scripted path
   only — organic path gets 'post-organic-detection' instead),
   post-handoff (immediately after the handoff block — the scripted
   kill runs synchronously, so this IS the end-of-death-day state),
   then at the end of each post-loop iteration with daysSince in
   {1,2,3} (d+1/d+2/d+3), at each ledger checkpoint (d+7/+14/+30,
   inside the existing ledgerDone block), and inside the chain-handoff
   branch (before the chainDeaths.push).
4. PROOF TEST (copy of r47's): RED = r47 driver lacks convoWindowMoves,
   moverNamedN, armorMaps. GREEN = r48 driver on proof seed 24999
   (EARLY_KILL_DAY=5, POST_DAYS=30) emits all three; every callMove
   bucketed and summing (carried); C1v2 ok; every armorMaps entry has
   all location keys (no undefined location lists); tele carries
   succession.convoWindowMoves + succession.armorUnaccounted computed
   directly (not from finish-time objects).
5. ANALYZER (copy of r47's, seeds 26031–26035): new sections — C1v2
   (daily moves, call-covered, convo-covered, missing), E1b cross-tab,
   A1 armor transitions (per seed: bark counts per location per
   snapshot, gains/losses, UNACCOUNTED windows), V1 with mature-seed
   emphasis (eligibleAtDeath > 0 seeds listed first).
