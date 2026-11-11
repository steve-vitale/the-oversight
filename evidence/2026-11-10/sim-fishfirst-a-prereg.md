# Fishing — first numbers: pre-registration (arm sim-fishfirst-a)

Run fleshout-20261111T0215Z, Loop A. Coverage Program Tier 2 #3 (Steve order
2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE any judged
sim. Base commit cb7cd6695.

## Canon

- docs/CANON.md read first. **There is NO FISHING.md in docs/** — no canon
  doc covers fishing. Nothing is invented here; the code citations below
  are the source of truth.
- Fishing mechanics as coded (src/js/game.js, read before pre-registering):
  - Villager fish duty ("FISH DUTY", bal-survival 2026-10-10): resolveAssignments
    'fish' works the nearest creek/pond/wetland tile with real fish stock
    (regionFish(), default creek_chub 200 kcal / bluegill 150 kcal), 2–4 fish
    × occupation efficiency (fisherman/fishing guide/sailor 1.4; cook/hunter/
    forager 1.2), species-honest kcal to the pantry via stockPantry(fkcal,
    'Fish catch'), creditDeed 'fishing', trust +1. A fished-out creek says
    so honestly; stock regrows at the ecology's pace.
  - Scholar active line-fish (game.js ~15966): tele('fish'), 60 kcal cost,
    chance 0.5 known / 0.18 blind (+0.25 with fishing_line, ×0.6 still
    water), one real fish from the tile's stock, carcass to the scholar's
    pack (foodCarcass origin 'fished'), fishWise bonus second fish 30%,
    noteDeed('fishing'). Ecology-fixed 2026-10-10 (no more flat 500–900
    kcal conjured fish).
  - Gill net (game.js ~3910 setNet, ~3983 haul): overnight, 1–3 fish from
    the tile's real stock, carcasses origin 'netted', noteDeed('fishing'),
    net frays 1 use per fish (16 uses).
  - Trader gift: 2 smoked fish (+200 kcal, spoilDay +30) pressed into the
    scholar's hands after a generous trader meal (game.js ~26993) — an
    inline inventory push, not a wrappable method.
  - Smoked fish: the cook duty converts fish to '(smoked)' (engine naming
    rule /fish/i); preserve-a measured 49 smoked batches / 32,145 kcal.
- Staffing context: evidence/2026-10-26/sim-fishstaff-b.md (fish-duty
  refusals are one repeated ask of a trust-5..9 villager; sheltered
  holders keep assignments; trust-0 reads as 10). Backlog #1072 (fish
  staffing fallback fix shape) is a BUILD queued behind these first
  numbers — do NOT implement it here.
- Instrument pattern: evidence/2026-11-10/sim-cookfirst-a.md +
  sim-preserve-a.md (same food-system first-numbers shape).

## Pre-pilot substrate checklist (§14b)

1. **Contact**: fish duty fires under competent — proven by sim-fishstaff-b
   (173 ok assignTask('fish') calls on seed 9750 alone). Scholar line/net:
   competent never calls doAction('fish') or setNet (grep of
   scripts/policies/competent.js: zero calls) — the pilot will confirm the
   zero via the tele('fish') + foodCarcass wraps, not assume it.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio to
   size. The addressable pool is the home-board fish wildlife, snapshotted
   daily.
3. **Verb existence**: all four fishing verbs exist in the engine (duty,
   line, net, trader gift). The policy calls only the duty — that asymmetry
   IS one of the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 137–140d); fishing runs from day 1, so no late-window
   risk.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of fishing** — every
fishing event classified by method + caller, every yield kcal attributed,
every metric in the list below counted or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every fishing event classified by method + caller, none 'other' | 0 unclassified events across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–8; sense-test scenes quoted |

A miss on any row is NO-GO against the pre-registered bar (metric review
records why; never re-scored mid-run, §14).

## Metrics (all 8)

1. Fishing events by method/caller: duty resolutions (+ fished-out days),
   scholar line-fish attempts/catches, gill-net sets/hauls, opportunistic
   (encounter/trap catches of fish species), trader gifts.
2. Yield kcal by method: duty 'Fish catch' pantry kcal; scholar carcasses
   by origin ('fished' / 'netted' / opportunistic); trader-gift kcal.
3. Who fishes: scholar vs villagers; duty holders by vid + occupation +
   sheltered status; scholar techniques (fishWise).
4. Duty-fish staffing: assignTask('fish') calls, ok, refused (by reason +
   villager), plus snapshot fish-duty holder days.
5. Fish stock over time: daily pantry fish kcal ('Fish catch' + smoked-fish
   items) and daily home-board fish wildlife total (sum of regionFish()
   counts over the 9×9 home grid).
6. Fish kcal share vs forage/hunt/garden: stockPantry deposits by name
   ('Fish catch' / 'Foraged food' / 'Game meat' / 'Garden harvest') on
   identical days, plus village-meal draws by pantry item name.
7. Fish spoilage if observable: spoiled-present fish kcal at daily
   snapshot; smoked-fish stock peak/end; spoiled fish purged via eat.
   If the dawn sweep purges rot before the snapshot (cookfirst-a
   limitation), say so and mark the sub-metric inferred/unmeasured.
8. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: fishing is a food-economy / reachability question; sibling
  first-numbers pilots (cookfirst-a, preserve-a) ran 150d with median
  survival 137–140d, so 150d captures the full village life without
  ticking dead villages. Same horizon as the siblings for comparability.
- **Seeds: 180233–180240 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 180233–180240: zero
    hits (grep over all dated preregs; the only 1802xx seeds named
    anywhere are 180201/180208 cookfirst-a, 180209/180216 preserve-a,
    180217/180224 named in the preserve prereg as gardening's band, and
    180225/180232 named in the preserve prereg as its reserved confirm
    band).
  - **Collision found and avoided:** the task's starting suggestion
    180225–180232 IS named in evidence/2026-11-10/sim-preserve-a-prereg.md
    (lines 259–260) as a reserved confirm band — "NOT spent by this
    measurement arm" but named, and the skill treats a named band as used.
    Picked 180233–180240 instead.
  - No perseed directory names any seed 180233–180240; no dated evidence
    .md names them (full .md grep of evidence/ returns zero hits).
  - No standalone forbidden/contaminated band list exists in the goal
    hidden_files (listing checked; only sim-heraldband-pilot-prereg-2018.md
    matched "band" and it is a prereg, not a list).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + all dated evidence `.md` + perseed
    directory names + goal hidden_files listing.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no snapshots;
    end-of-run wall numbers + days + end pantry kcal + deaths only),
    same seeds — must match the instrumented control leg exactly on
    days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/fishfirst-instrument-20261110.js — wraps (record-only, never alter
state, never consume RNG; recording failures go to instrumentErrors,
never thrown into the game):
- stockPantry: every pantry deposit by name (fish/forage/hunt/garden
  share + duty kcal backstop).
- foodCarcass: every carcass by origin ('fished' / 'netted' / 'trapped' /
  'hunted' / 'charred') + species + kcal — scholar fish kcal backstop.
- tele: tele('fish') attempts (known/cost) + tele('eat') reconciliation.
- assignTask: fish staffing calls with return + trust-before + reason.
- creditDeed / noteDeed: 'fishing' deeds, who earned them.
- setNet: net sets (expected 0 under competent — proven live in fixture).
- pantryDraw: meal draws by pantry item name (fish kcal drawn).
- eat / eatOne / eatStashOne: fish kcal eaten + spoiled purge (as in
  cookfirst-a).
- Daily snapshot: pantry roll by name, pack roll by name, fish-duty
  holders (vid/occ/sheltered), home-board fish wildlife total,
  spoiled-present fish kcal, scholar fishWise flag.
Driver: scripts/fishfirst-driver-20261110.js (mirrors cookfirst-driver;
Game.say wrap with a fish regex for the sense corpus, 200 lines/seed
cap — same early-game-only caveat as preserve-a). Analyzer:
scripts/fishfirst-analyze-20261110.js. Proof:
scripts/test-fishfirst-a.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b). The control/neutral legs
are the neutrality proof, not a panel.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers corpus
shape (cookfirst-a / preserve-a: median survival 137–140d, 6/8
village-lost). If the instrument changes any numeric field vs the
recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
