# sim-heraldsteer-adopt-a — LIVE-SEED ADOPTION VERIFICATION OF THE HERALD STEER (DIAG ONLY, zero new src/js)

- Run: fleshout-loop-a-20261101T2315Z (Loop A, axis scale-onramp).
- Arm: DIAG ONLY. Zero new `src/js` changes — the treatment
  under test is build 3056aeb4f, already on this branch's
  history. No gate, stage, deed-bar, or win-price retune.
  Nothing from the #1538 steve-call queue built.
  No `[needs-eyes]` (DIAG instrumentation only; the steer
  build itself already carried its own flag).
- Verdict: **GO — adoption verified.** The drift raises real
  Herald contact and Haven-window arrivals in full sims, not
  just fixture ticks: contact-seed rate 4/8 pilot (bar ≥ 3/8)
  and 9/16 confirm, 33 Haven windows across the 24-seed band
  every one landing via raidPin with a continuous chain, and
  all movement guardrails intact (0 teleports, 0 wander
  landings on the Haven tile, non-Herald control green).
- Stack (named exactly; numbers NEVER pooled across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Instrument:
  `scripts/sim-heraldarr2-a-sweep.js` +
  `scripts/sim-heraldarr2-a-lib.js` reused UNMODIFIED (capture
  ON = `SIMHERALDARR2=1`). New files in this arm only:
  `scripts/sim-heraldsteer-adopt-a-analyze.js`,
  `scripts/sim-heraldsteer-adopt-a-screen.sh`,
  `scripts/test-sim-heraldsteer-adopt-a.js`.
- Band: LONGEVITY-SCREENED on this tree's own base (see BASE
  NOTE below). Screen (substrate-only, capture off) scanned
  40 seeds from 95401, 24 qualifiers (`gameDays > 120 AND
  won == 0`). Pilot = qualifiers 1–8: 95401, 95402, 95405,
  95408, 95409, 95411, 95413, 95415. Confirm = qualifiers
  9–24 (16 seeds): 95417, 95419, 95421, 95423, 95425, 95427,
  95428, 95429, 95431, 95432, 95433, 95434, 95435, 95438,
  95439, 95440. Screen audit trail:
  `evidence/2026-11-01/sim-heraldsteer-adopt-a-screen/`
  (40 per-seed JSONs + `qualifiers.txt`).
- Horizon: `DAYS=180`, death-aware.
- Corpus (capture ON): pilot
  `evidence/2026-11-01/sim-heraldsteer-adopt-a-pilot/`
  (8 JSONs), confirm
  `evidence/2026-11-01/sim-heraldsteer-adopt-a-confirm/`
  (16 JSONs). Analyses: `sim-heraldsteer-adopt-a-pilot-analysis.json`
  (heraldarr2 analyzer), `sim-heraldsteer-adopt-a-pilot-adoption.json`
  (adoption analyzer), and the matching confirm pair.
- Preregistration: `evidence/2026-11-01/sim-heraldsteer-adopt-a-prereg.md`
  (commit `3f4da1b6f`, BEFORE any judged sim). Judged exactly
  against that header; no bar moved after seeing results.
  The confirm ran because the pilot met GO (see bars below).

## BASE NOTE (judged honestly, not smoothed)

This worktree's HEAD differs from the heraldarr2 corpus base:
it contains the steer build PLUS later journey/evidence
commits. BEFORE numbers below are therefore REFERENCE
corpora, not a seed-identical baseline, and no old code was
checked out to fake one. The re-screen itself measures the
drift: vs heraldarr2's 16 qualifiers, this base's first 16
qualifiers drop 95404 (it now dies day 103 — it was
heraldarr2's star seed: 140d, wave 5, 3 haven windows) and
add 95402 and 95411 (both become contacted seeds here).
13 of heraldarr2's 16 qualifiers still qualify. The AFTER
band is judged as a screened-equivalent band on its own
base; the pilot/confirm rates below stand on their own
seeds, and the BEFORE comparison is directional, never
pooled.

## The answer in one paragraph

The fixture was not lying. On long-lived un-won runs, the
Herald now comes to Haven's door and stays there: half the
pilot seeds meet it (4/8, vs 1/8 on the heraldplace band
and 2/8 on the heraldarr2 pilot), the confirm repeats it
(9/16), and every one of the 33 Haven-tile arrival windows
across the 24-seed band lands by raid draft — the proven
pin path, chain-continuous, with the Herald's name in the
raid line and a priced nightly gorge after. The Herald's
mean dawn distance to Haven falls from 3.51 (heraldarr2
pilot, same instrument) to 1.89 (adopt pilot) and 1.74
(confirm). The movement guards all hold: every wander step
is exactly one tile, no wander step ever lands on Haven's
own tile, and a non-Herald monster on the same code walks
exactly like the old symmetric walk. What the steer does
NOT do: it does not make every seed meet the Herald
(95425 reaches wave 5 with 54 located dawns and zero
contacts), it does not make the scholar fight the Herald
(all 535 scholar contacts are refusals — facing is still
gated through the call, #1538 pending), and it does not
complete the climb (wave-5 reach 2/24, full seat 0/24,
wins 0/24 on this screened band).

## Before / after (reference corpora vs this band — directional, never pooled)

| Measure | BEFORE (recorded) | AFTER pilot (8) | AFTER confirm (16) |
|---|---|---|---|
| Contact-seed rate | heraldplace 1/8; heraldarr2 pilot 2/8, confirm 2/8 | 4/8 | 9/16 |
| Total Herald contacts | heraldplace 30 (1 seed); heraldarr2 pilot 81, confirm ~8 | 147 (142 scholar + 5 villager) | 445 (393 scholar + 52 villager) |
| Haven windows (landing) | heraldarr2 pilot 4, confirm 1, all raidPin | 11, all raidPin, all chain-continuous | 22, all raidPin, all chain-continuous |
| Herald raid drafts | heraldarr2 pilot 6, confirm 1 | 12 | 29 |
| Linger re-pins (moved + held) | heraldarr2 pilot 18, confirm 0 | 65 (47 + 18), 0 missing days | 107 (81 + 26), 0 missing days |
| Pooled mean dawn dist to Haven | heraldarr2 pilot 3.51 (same instrument) | 1.89 | 1.74 |
| Wander steps (approach / retreat) | heraldarr2 pilot 122 (55 / 67) | 137 (56 / 81) | 269 (120 / 149) |
| Teleports / wander Haven landings | 0 / 0 (both priors) | 0 / 0 | 0 / 0 |

Wander approach stays below retreat on both bands (56/81
pilot, 120/149 confirm) — the same equilibrium signature
the build evidence explains: in steady state any walk
approaches as often as it retreats, and drift shows in the
stationary distribution (mean distance 3.51 → 1.89/1.74,
dawns at distance ≤ 1: pilot 131 of 284 located dawns),
not in the approach share. The approach share was never a
gate here, and it is not one now.

## Per-seed pilot

| seed | class | contacts (s/v) | located dawns | mean dist | dawns ≤1 | wave | rank | days | end |
|---|---|---|---|---|---|---|---|---|---|
| 95401 | LOCATED-UNFACED | 0 | 18 | 3.39 | 0 | 4 | global | 181 | survived |
| 95402 | CONTACTED | 60 (59/1) | 87 | 1.87 | 46 | 4 | regional | 181 | survived |
| 95405 | CONTACTED | 1 (1/0) | 37 | 2.43 | 7 | 4 | national | 181 | survived |
| 95408 | LOCATED-UNFACED* | 0 | 44 | 1.39 | 23 | 4 | national | 181 | survived |
| 95409 | LOCATED-UNFACED | 0 | 1 | 4.00 | 0 | 4 | regional | 181 | survived |
| 95411 | CONTACTED | 68 (64/4) | 85 | 1.68 | 49 | 4 | regional | 168 | village-lost |
| 95413 | CONTACTED | 18 (18/0) | 12 | 1.33 | 6 | 4 | global | 181 | survived |
| 95415 | NEVER-LOCATED | 0 | 0 | — | 0 | 3 | global | 181 | survived |

\* 95408 is located-unfaced with 2 Haven windows and 16
linger re-pins but zero contacts: the Herald sat on Haven
unmet (the scholar was elsewhere) — arrival without meeting,
the mirror of heraldarr2's contacted seeds.

Pilot Haven windows (11, all raidPin, all chain-continuous):
95402 d119→120, d127→128, d138→139, d149→150; 95405
d176→177; 95408 d158→159, d176→177; 95411 d117→118,
d126→127, d137→138; 95413 d177→178.

## Per-seed confirm

| seed | class | contacts (s/v) | located dawns | mean dist | dawns ≤1 | wave | rank | days | end |
|---|---|---|---|---|---|---|---|---|---|
| 95417 | NEVER-LOCATED | 0 | 0 | — | 0 | 2 | national | 181 | survived |
| 95419 | CONTACTED | 83 (83/0) | 46 | 0.50 | 40 | 4 | regional | 181 | survived |
| 95421 | NEVER-LOCATED | 0 | 0 | — | 0 | 3 | global | 181 | survived |
| 95423 | CONTACTED | 36 (32/4) | 30 | 1.80 | 12 | 4 | global | 181 | survived |
| 95425 | LOCATED-UNFACED | 0 | 54 | 4.20 | 0 | 5 | regional | 180 | survived |
| 95427 | CONTACTED | 93 (86/7) | 75 | 0.95 | 52 | 4 | regional | 181 | survived |
| 95428 | LOCATED-UNFACED | 0 | 16 | 3.38 | 0 | 4 | regional | 125 | village-lost |
| 95429 | CONTACTED | 42 (39/3) | 60 | 1.55 | 34 | 4 | regional | 160 | village-lost |
| 95431 | LOCATED-UNFACED | 0 | 40 | 2.30 | 5 | 4 | regional | 179 | village-lost |
| 95432 | CONTACTED | 35 (30/5) | 48 | 1.33 | 35 | 4 | regional | 124 | village-lost |
| 95433 | CONTACTED | 71 (70/1) | 45 | 1.00 | 30 | 4 | regional | 152 | village-lost |
| 95434 | LOCATED-UNFACED | 0 | 36 | 2.53 | 13 | 4 | global | 181 | survived |
| 95435 | NEVER-LOCATED | 0 | 0 | — | 0 | 3 | global | 180 | survived |
| 95438 | CONTACTED | 26 (14/12) | 45 | 1.60 | 20 | 4 | regional | 181 | survived |
| 95439 | CONTACTED | 18 (6/12) | 25 | 1.24 | 20 | 4 | global | 174 | village-lost |
| 95440 | CONTACTED | 41 (33/8) | 43 | 1.40 | 25 | 5 | regional | 181 | survived |

Confirm Haven windows (22, all raidPin, all chain-continuous)
across 9 seeds: 95419, 95423, 95427, 95429, 95432, 95433,
95438, 95439, 95440. Standouts: 95419's Herald camps at
mean dawn distance 0.50 (40 of 46 located dawns at distance
≤ 1); 95425 is the counter-example seed — wave 5 unlocked,
54 located dawns at mean distance 4.20, zero contacts, zero
linger pins: the steer raises rates, it does not guarantee
any single seed.

## Pre-registered GO bars (judged exactly as written)

1. 8 pilot seeds, each complete — PASS. 8/8 JSONs present,
   capture errors 0 on all 8, end fields present. (Confirm
   likewise 16/16, errors 0.)
2. Contact-seed rate ≥ 3/8 — PASS. Pilot 4/8; confirm 9/16
   replicates it (pooled band 13/24).
3. ≥ 1 Haven window AND 100% attributed with landing
   raidPin or lingerPin — PASS. Pilot 11/11 raidPin,
   chain-continuous; confirm 22/22 raidPin,
   chain-continuous. No pilot or confirm Haven window lands
   by wander, follow, or spawn, and none is unattributed.
4. Guardrails — PASS. 0 wander teleports and 0 wander
   Haven landings on both bands (verified per event by the
   adoption proof test's corpus legs, not just pooled
   counts); steer proof test PASS on this tree and its
   non-Herald control (`MONSTER=gallowdeer`) PASS —
   non-Herald movement reproduces pre-steer behavior.
5. Recorder-neutrality leg — PASS. First contacted pilot
   seed 95402: ON vs fresh OFF end fields IDENTICAL on all
   8 fields (days 180, gameDays 181, won 0, national 0,
   table 1, maxWave 4, endScaleRank regional, endReason
   survived). The instrument does not move the run.
6. Determinism leg — PASS. 95402 ON re-run reproduces the
   judged per-seed JSON except `anchorCommit` (in fact
   byte-identically including the anchor — no commit landed
   between the judged sweep and the re-run).
7. Proof tests green — PASS WITH A DOCUMENTED EXCEPTION
   (see below, not hidden): `test-sim-heraldarr2-a.js`
   synthetic + corpus legs: pilot 1614/1614; confirm
   3036/3037. The single confirm failure is the reused
   test's `corpus-has-8-seeds` leg (line 122, hardcoded
   `files.length === 8`) — a pilot-size assumption that
   fails by construction on a 16-seed confirm corpus, while
   `analysis-seed-count-matches` (16 === 16) passes and
   every census/draft/linger/chain leg passes. The reused
   test was NOT edited to force green (repo rule: never
   loosen an assertion); the leg is inapplicable to the
   prereg's own confirm size (12–16), and the measurement
   legs it guards are all green. `test-sim-heraldsteer-adopt-a.js`:
   pilot 313/313, confirm 601/601. Steer proof test:
   PASS + control PASS on this tree.
8. Sense-test — PASS (read below).

Panel (MEASUREMENT.md §15): NOT APPLICABLE as preregistered
— the before/after comparison here is a DIAG census vs
recorded reference corpora on a moved base (see BASE NOTE);
no old-code checkout was run to fabricate a same-base
panel, and none is claimed. The seed-identity note: 13 of
heraldarr2's 16 qualifiers still qualify on this base, but
the qualifier lists differ (95404 out, 95402/95411 in), so
even the overlapping seeds are not presented as a panel run.

## The unattributed windows and the mismatches (reported, not smoothed)

Change-window coverage: pilot 81/87 attributed, confirm
200/211. The 17 unattributed windows, by inspection, are
ALL non-haven windows — none touches a Haven arrival, so
none blocks the GO verdict for any arrival under the verdict
mapping:
- Spawn-day-boundary artifact (heraldarr2 metric review (j),
  same class): dawn-day spawns filed into the following
  window by the day-range rule (pilot 95408 d138, 95411
  d84, 95413 d170; confirm 95433 d89, 95439 d123).
- One genuinely unrecorded first step (the heraldarr2
  95404-day-120 class, same signature): the window's first
  move starts one tile away from the previous dawn tile —
  a step through a path this instrument does not wrap
  (candidate: a combat/fight displacement outside
  `resolveWildMonsterEncounter`). Pilot: 95402 d115, d135;
  95411 d124 (a Haven EXIT, (4,4)→(3,5), not an arrival).
  Confirm: 95419 d136; 95427 d147, d161 (both Haven EXITS);
  95428 d110; 95434 d146; 95438 d143, d155; 95439 d147;
  95440 d143 (the last three end at null = removals, i.e.
  kills/fights closing the window).
Travel mismatches (pilot 15, confirm 33) are the heraldarr2
follow+nested collapse class in every sampled case: the
branch's expected line fired and the Herald then took one
more nested wander step inside the same travelTo call before
the wrapper's after-state (e.g. confirm 95419 d140:
followEnter predicted (4,4)→(3,4), after-tile (3,3) — one
nested step further). The branch prediction was right; the
after-tile reflects a second, nested move. None touches a
Haven window landing (all landings are raidPin).

## SENSE-TESTING: what the transcripts actually say

The arrival is loud, named, and priced — now on 13 of 24
seeds instead of 4 of 16. 95402 day 119: "🐗 RAID — 3 raiders
(Inspiration, The Herald, Rut King) hit Haven in the night,
drawn by the smell of the pantry!" followed by "Nobody met
The Herald — it's still out there at the treeline. It'll
gorge every night until it's driven off." and then nightly
"🌙 Night. The lingering The Herald gorges at the treeline
— 1,110 kcal gone from the stores. Endure it (they drift
off within ~6 nights — the gorge is the price), or send a
sortie: fighters, rations, real risk." — six-plus nights
running, real numbers, stores falling accordingly. The
first scholar contact on each contacted seed reads the same
refusal as heraldarr2 ("⛔ THE HERALD does not notice you
the way prey notices a hunter. ... You cannot face this
alone — sound the call, muster 10 allied blades (you have
0).") — the arrival is loud and the facing is gated
elsewhere, by design, not by this arm's question. Two
wrinkles, both honest readings, both repeats of known ones:
(a) 95413 day 180 gorge reports "0 kcal gone from the
stores" — true (nothing left to take) but tonally flat, the
same wrinkle heraldarr2 noted on 95404 days 138–140;
(b) the gorge line keeps promising "they drift off within
~6 nights" while 95402's Herald is re-drafted and gorges
for 15+ nights across four sieges — the drift valve is a
per-linger timer, and re-drafts restart it, so the line
over-promises an end the siege does not keep. Neither
wrinkle is a teleport, a list feed, or off-law movement:
every step in every window is one tile, and the steer reads
only the Herald's own tile and Haven's map tile.

## Secondary observations (not chased, but new vs heraldarr2)

- Villagers now KILL the Herald — 5 times across the band
  (pilot 95402 d169, villager app_mgpspj0m52; confirm 95433
  d133, 95438 d155 adaeze_nwosu, 95439 d147 miguel_santos,
  95440 d143 ines_duarte; each followed by a removal record
  and no re-placement — single lair only). Heraldarr2 saw
  zero Herald deaths either way. With the Herald lingering
  at Haven's door, villagers meet it in the field and
  sometimes finish it.
- Villagers also DIE to the Herald — 2 times (confirm
  95423 d174 thabo_maseko, d175 app_mgpsphjz297, both on
  the Haven tile (4,4) while the Herald sat there). The
  field channel is now genuinely two-way, not just
  refusals and flees.
- Scholar contacts: 535 across the band, ALL `refused`.
  Villager contacts: 57 (5 vKill, 2 vDie, 9 mFlee, 41
  vFlee). The scholar still never fights the Herald by
  bumping into it; the facing remains gated through the
  call (#1538 pending, untouched).
- The 95402 kill is checkable end to end: lair day 83 at
  (8,4), four raid sieges days 119–155, roaming to (3,2),
  killed day 169 at (3,3), Herald absent every dawn after,
  village survives to day 181 un-won at regional rank.

## Wall numbers (orientation only — screened band, never pooled)

Pilot: won 0/8, national 5/8, table 2/8, wave-4 reach 7/8,
wave-5 reach 0/8, median survival 181d, max 181d.
Confirm: won 0/16, national 6/16, table 3/16, wave-4 reach
13/16, wave-5 reach 2/16 (95425, 95440), median survival
181d, max 181d.
Pooled screened band: won 0/24, national 11/24, table 5/24,
wave-4 20/24, wave-5 2/24, median 181d.
These numbers describe a band SELECTED to survive past day
120 un-won — by construction — so they must never be
trended as if representative, and the 0 wins say nothing
about the win rate. What they do show for the scale wall:
the Herald arrival blocker is now closed as a mechanism
(contact on 13/24 long runs, Haven windows on 14/24 seeds),
but the climb past wave 4 to a full seat still does not
complete — wave 5 is reached on 2/24 and no wave-5 fight
chain completes in this Herald-only instrument (it records
Herald contacts, not wave-5 monster fights; 95440 pairs
wave-5 reach with 41 Herald contacts, 95425 pairs wave-5
reach with zero Herald contacts — neither is a recorded
wave-5 fight). The next blocker is downstream of arrival:
facing the Herald (call/muster, #1538) and the wave-5 climb
itself, not getting the Herald to Haven.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the committed header: 8 pilot seeds, contact bar
  ≥ 3/8, Haven windows attributed with pin landings,
  guardrails, neutrality on the first contacted seed,
  determinism on the same seed, proof green (with the one
  documented inapplicable leg above), sense beats read.
  No re-scoring, no bar moved after seeing results. The
  confirm ran because the pilot met GO — it replicated
  the finding (9/16 contacted, 22/22 raidPin windows)
  rather than rescuing a miss.
- **Doubts filed, not resolved by re-scoring.**
  (a) Dawn snapshots miss intra-day position changes — the
  move-event log is the guard, as on heraldarr2; 17
  unattributed non-haven windows are reported above, not
  hidden. (b) The BEFORE corpora are on older bases; the
  re-screen is the honest AFTER band, and the
  qualifier-list difference (95404 out, 95402/95411 in)
  is base drift, reported, not hidden. (c) The
  contact-seed rate on a screened band is still a
  screened-band rate: never pooled with unscreened bands
  or trended as representative. (d) Mean dawn distance is
  a different instrument from the fixture's tick-mean;
  direction only, never a numeric gate — the gate was the
  contact rate, and it passed. (e) The raidPin move event
  records net before/after tiles across a raid call
  (heraldarr2 metric review (f)) — chains through
  draft+flee days carry that caveat. (f) The analyzer's
  spawn-filing artifact (heraldarr2 metric review (j))
  breaks non-haven chains cosmetically; haven windows are
  judged on their own chain text, not on the pooled
  attributed count alone. (g) NEW: the reused heraldarr2
  proof test hardcodes an 8-seed corpus
  (`corpus-has-8-seeds`); a future arm reusing it for a
  confirm band should parameterize that leg rather than
  editing it mid-run to force green. (h) NEW: the
  follow+nested mismatch class (48 across both bands) is
  still counted as contradictions by the v2 taxonomy even
  though every sampled case shows the branch line fired
  plus one nested step — a future taxonomy should classify
  "branch line spoken + nested post-leg move" separately.
  (i) NEW: the gorge line's "~6 nights" promise
  over-promises across re-drafts (see sense-test (b)).
- **Revisions for the NEXT run, not this one.** (1) A
  stepwise raid-call record would close the draft+flee
  collapse class. (2) The unrecorded first step in 17
  windows wants one more wrapper (fight-displacement paths
  outside resolve) before anyone claims 100% move coverage.
  (3) A wave-5 fight instrument (not Herald-only) is needed
  before anyone claims a wave-5 fight chain completes —
  this arm proves Herald arrival, not wave-5 combat.

## Blanks filled or documented

- Filled (measured): the adoption question itself — the
  steer raises live-seed Herald contact (4/8 pilot, 9/16
  confirm vs 1/8 heraldplace baseline) and Haven arrivals
  (33 windows, all raidPin chain-continuous) with all
  movement guardrails intact; the full draft census (41
  Herald drafts across the band: 12 pilot + 29 confirm),
  the linger re-pin census (172 re-pins, 0 missing days),
  and the first villager Herald kills (5) and Herald
  villager deaths (2) in these corpora.
- Documented, not filled (for later arms, NOT this one):
  (a) #1538 (refused-face routing: the call/muster path
  from a Herald contact to a fought facing) still pending
  and untouched — all 535 scholar contacts are refusals;
  (b) the wave-5 fight chain itself (reach 2/24, completion
  unrecorded by this instrument); (c) the 95425
  counter-example (wave 5, located 54 dawns, never
  contacted) — why the drift stalls on some seeds;
  (d) the "~6 nights" gorge-line over-promise across
  re-drafts; (e) the unrecorded-step wrapper gap.

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis loses a second blocker — Herald arrival is now not
only a proven mechanism (heraldarr2) but a live-seed
reality at 13/24 long runs — while the climb past wave 4
to a full seat still does not complete. No new game change
landed (DIAG only; the steer build itself was already on
master, pending ship).

## Readiness

Ready for coordinator merge ('merged locally, pending ship'
is the coordinator's call) — NOT pushed, NOT version-bumped,
NOT live-verified. No `[needs-eyes]` (DIAG instrumentation
only; nothing player-facing changed by this arm). Worktree
clean after commit (see commit message for the file list);
scratch leg dir (/tmp/heraldsteer-legs) and screen log
(/tmp/heraldsteer-screen.log) live outside the tree, not
committed; per-seed .err progress files removed, not
committed (prior-arm convention: JSONs only).
