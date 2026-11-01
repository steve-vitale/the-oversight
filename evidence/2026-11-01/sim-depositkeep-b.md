# sim-depositkeep-b — DIAG: does the gate-off keep (2,000) restore scholar unload?

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1305Z,
axis food-economy, arm sim-depositkeep-b. Worktree sim-depositkeep-b,
branch sim-depositkeep-b. Answers the coordinator's depositgate-keep
arm, following sim-scholaraway-b: under competent play the scholar
sleeps at home 22–30 of 30 evenings yet unloads exactly 0 kcal into
the pantry on 8/8 seeds — a KEEP-THRESHOLD zero, not a presence zero
(keep 2,000, raised to 6,000 while the depositgate is engaged; largest
finished-food pack at any gate-on return 3,720 kcal).
DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New files only:
prereg, depositkeep trace driver, depositkeep analyzer, proof test
(including three live controls), evidence, census/corpus. This worker
does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Verdict: NO-GO / killed-at-pilot — judged exactly against the prereg bar

Prereg: evidence/2026-11-01/sim-depositkeep-b-prereg.md, committed
BEFORE any judged sim. Its verdict rule, applied exactly as written:

GO required nonzero unload on >= 6/8 pilot seeds (vs the published
0/8 gate-on baseline). The pilot lands at 4/8. That is NO-GO, and per
the prereg there is NO confirm spend: killed at pilot, evidence only.
No re-score: the band total (12,190 kcal unloaded), the 13/13
big-return hit rate below, and the donation-substitution finding do
NOT convert a 4/8 into a GO — the bar was 6/8 and it missed.

But "NO-GO" undersells what the pilot actually proved, so state it
sharply: the keep arithmetic works EXACTLY as predicted. The bar
missed because half the seeds never carry finished food over the
keep at all — the bar measured pack luck as much as keep arithmetic
(see Metric review). On every seed whose finished pack ever clears
2,000 kcal, unload fires; on every seed whose pack never clears it,
unload is zero by arithmetic, not by breakage.

## The answer in one paragraph

With the gate OFF (keep 2,000), the scholar unloads 12,190 kcal
across the 8-seed pilot band on 4/8 seeds (2,850 / 5,980 / 2,040 /
1,320 kcal on seeds 51101 / 51102 / 51105 / 51106), against exactly
0 kcal on 8/8 seeds with the gate on. The separation is perfect at
the return level: all 13 returns carrying a finished pack over
2,000 kcal unload (100%), and zero returns at or under 2,000 unload
— the keep is a clean threshold, not a leaky one. The four zero
seeds are zero for pack reasons, not keep reasons: 51103 and 51104
carry zero finished food at every return (their packs are unknowns,
in-shell nuts, and materials), 51107 peaks at 1,040 kcal, 51108
peaks at 0 finished kcal. And the donation channel empties
completely: gate-on donations were 1,360 / 605 / 1,300 kcal on seeds
51102 / 51105 / 51106, but gate-off the policy never calls
donateToPantry once on any seed — the automatic unload at return
takes the surplus first, so the next morning's donate step finds
nothing above its own 2,400-kcal keep. Unload does not ADD to
donation; it PRE-EMPTS it.

## Pilot gates (all passed, before judging)

(1) POSITIVE CONTROLS: scripts/test-depositkeep-b.js — 19 pure
checks green, plus three live controls each in its own process:
(a) gate off, 3,000-kcal finished pack, returnToVillage: one
homecoming recorded, unload kcal > 0, gate-engaged read false;
(b) gate off, 1,500-kcal finished pack: homecoming recorded,
unload exactly 0 (the keep swallows it — the recorder
distinguishes unload from no-unload); (c) donateToPantry call:
donation recorded in the donate bucket, zero in the unload bucket
(the shared deposit helper is split correctly). A pilot zero from
this recorder is a real zero, not a broken recorder.
(2) COMPLETE CAPTURE: analyzer completeCapture true on 8/8 seeds
(full evening snapshots plus a finished-pack figure on every
return).
(3) INSTRUMENT NEUTRALITY: the driver contains no travelTo,
returnToVillage, eat, donateToPantry, or other state-moving call in
the judged path — wrappers count only. Verified by code read.
(4) GATE-OFF CHECK: gate-engaged reads false on every judged return
(entry and exit), 0 exceptions. The arm is what the prereg says it
is.
(5) ACCOUNTING TIE (not a prereg gate, but checked): per seed,
deposit-unload totals equal return-unload totals exactly
(2,850 / 5,980 / 0 / 0 / 2,040 / 1,320 / 0 / 0), and deposit-donate
totals equal donate totals exactly (0 everywhere). No kcal is
unaccounted or double-counted.

## Pilot census (30d competent window, DEPOSITGATE=0, seeds 51101-51108)

homeLive = returnToVillage calls with Game.over false at entry
(scholaraway rule, for comparability; endDay-flagged sensitivity
count is identical — 0 flagged calls on all 8 seeds). unload =
depositPantryPieces kcal inside a live return. donate =
depositPantryPieces kcal inside a donateToPantry call. Full
per-return tables: evidence/2026-11-01/sim-depositkeep-b-census.json.

| seed | end | days | wave | homeLive | unload | retUnload | donate | maxFin | meanFin | gateTrue |
|---|---|---|---|---|---|---|---|---|---|---|
| 51101 | survived | 30 | 1 | 30 | 2850 | 6 | 0 | 2970 | 1029 | 0 |
| 51102 | survived | 30 | 2 | 28 | 5980 | 3 | 0 | 5780 | 991 | 0 |
| 51103 | survived | 30 | 1 | 28 | 0 | 0 | 0 | 0 | 0 | 0 |
| 51104 | survived | 30 | 2 | 33 | 0 | 0 | 0 | 0 | 0 | 0 |
| 51105 | survived | 30 | 2 | 22 | 2040 | 3 | 0 | 2910 | 1035 | 0 |
| 51106 | survived | 30 | 2 | 28 | 1320 | 1 | 0 | 3320 | 470 | 0 |
| 51107 | survived | 30 | 2 | 29 | 0 | 0 | 0 | 1040 | 168 | 0 |
| 51108 | survived | 30 | 2 | 28 | 0 | 0 | 0 | 0 | 0 | 0 |

Baseline comparison (same seeds, same policy, same 30d window,
gate ON, as published in sim-scholaraway-b.md): unload 0 kcal on
8/8 seeds; donations 1,360 / 605 / 1,300 kcal on seeds 51102 /
51105 / 51106, 0 elsewhere. Gate-off: unload nonzero on 4/8 seeds;
donations 0 on 8/8 seeds, with ZERO donateToPantry calls anywhere
in the band (not failed calls — no calls).

## Mechanism: the keep is a clean threshold; the donation channel is pre-empted

1. THRESHOLD SEPARATION (return level, all 226 live returns):
13 returns carry a finished pack over 2,000 kcal; all 13 unload
(90–3,780 kcal each). 213 returns carry 2,000 or less; none
unload. There is no leak in either direction. Kept food after an
unloading return reads 1,890–2,000 kcal: the undershoot below
2,000 is stack-split granularity (when the room left is smaller
than one unit of the next stack, the whole stack is given), not an
error — kept + unloaded always equals the finished pack exactly.
2. THE ZERO SEEDS ARE PACK SEEDS: 51103's returns carry
Father's Whetstone, sticks, in-shell Hickory Nuts, and unknown
nuts — finished food never appears. 51104 is the same shape
(in-shell nuts, unknown berries, sticks, care packages). 51107's
finished food is Blackberry packs peaking at 1,040 kcal.
51108's largest total pack is 480 kcal of unprocessed items
(in-shell acorns, nettle, unknown shoots) — 0 finished. Lowering
the keep further would not move these seeds; their packs contain
nothing the haul block can pool. The lever for them is pack
composition (identification / processing / what the scholar
forages), not the keep.
3. DONATION PRE-EMPTION (the substitution finding, mechanism
named): gate-on, the scholar comes home carrying up to 3,720 kcal
(the 6,000 keep swallows it all), and the next morning the
policy's donateHaul step donates everything over its own 2,400-kcal
keep — that is where the 1,360 / 605 / 1,300 kcal donations come
from. Gate-off, the return itself unloads everything over 2,000,
so the scholar starts the next day at or under 2,000 finished
kcal — below donateHaul's 2,400 keep — and the donate step has
nothing to move. The policy never calls donateToPantry, on any
seed, all month. The scholar's food still reaches the pantry, but
through the automatic channel instead of the manual one. A future
lever that counts "donations" as scholar generosity will read this
as generosity collapsing to zero; it is a channel shift, not a
generosity collapse. (The policy's second donate site, surplus
over a 2-day buffer, never fires in either arm: scholar kcal caps
at 2,400, below its 3,600 trigger.)
4. GATE-OFF PACKS RUN BIGGER on the unloading seeds: 51102's
largest finished pack is 5,780 kcal gate-off vs 3,720 gate-on.
Gate-off trajectories diverge from gate-on twins beyond the keep
(no meal-share easing, no haul holdbacks), so pack sizes are not
directly comparable seed for seed — but the direction is
consistent with the gate-off scholar accumulating more finished
food, since nothing is eased away mid-day. This is descriptive,
not a keep-effect claim.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Seed 51102, day 28 — the band's biggest single unload (3,780 kcal):
the day reads as one honest foraging trip. "You work the patch
with practiced hands: 13× Sassafras, 13× Muscadine Grapes (1430
kcal). This patch is picked clean — it'll recover in a few days."
Then "Travel 1 tile to Haven." Then the unload line, with the
census-exact numbers: "You keep a day's food (2000 kcal) and
unload 3780 kcal into Haven's pantry." Then the welcome: "You
walk back into Haven. 23 Codex entries. The village is glad to
see you." The unload-or-keep moment reads sensibly to a player:
the work, the walk home, the split, the welcome — in that order,
with numbers that match the ledger exactly. Full extract:
evidence/2026-11-01/sim-depositkeep-b-corpus/
51102-day28-homecoming.txt.

Seed 51107, day 7 — a keep (no-unload) return for contrast: the
scholar comes home with 325 finished kcal, hears away news
("Ingrid stood down the stripes flowing where no wind blows and
kept walking"), then "You keep a day's food (325 kcal) — nothing
extra for the pantry this time," stages one unprocessed haul onto
the counter, teaches a Hickory Nuts lesson, and is welcomed home.
The keep voice is honest about a small haul; nothing here reads as
a missed unload. Full extract:
evidence/2026-11-01/sim-depositkeep-b-corpus/
51107-keep-homecoming.txt.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does. What
runDays returns in-window: 8/8 seeds survived 30 days gate-off
(median survival 30, max 30, collapses 0); wave reach max 2
(wave 1 on 51101/51103, wave 2 on the rest); waves 3–5 not reached
(expected — early window). National 0, table 0, wins 0 IN THIS
WINDOW ONLY — not a wall movement claim. Descriptive contrast
only, NOT a causal claim: the gate-on band collapsed 1/8 seeds
(51101, village-lost day 25) while the gate-off twin of 51101
survives all 30 days. Gate-off changes more than the keep (meal
easing and holdbacks also switch off), so this contrast cannot be
attributed to the keep; it is reported because the coordinator
asked for wall numbers in-window, not as a lever effect.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration: the panel compares lever arms through its standardized
observer/scorecard/cohort rows; this arm changes no game code, its
primary metric is a custom homecoming census (unload kcal per
return), not a panel metric, and its baseline is a PUBLISHED
census, not a freshly run panel. The gate-off-vs-published-baseline
table above is reported directly instead.

## Caveats and attribution limits (honest, per prereg)

- GATE-OFF ≠ KEEP-ONLY: DEPOSITGATE=0 disables meal-share easing
  and haul holdbacks as well as lowering the keep to 2,000. The
  unload result is attributable to the keep arithmetic (the keep
  is the only gate-dependent term in the unload path, and the
  threshold separation is exact), but survival, pack sizes, and
  wave reach in the gate-off band are whole-gate effects, not
  keep effects. Any future keep-only lever (a keep parameter
  independent of the gate) would need its own run to isolate the
  keep's share of the survival contrast.
- HOMECOUNT RULE: judged counts follow the scholaraway rule
  (Game.over false at entry) for comparability. The endDay
  sensitivity count is identical here (0 stack-flagged calls on
  all 8 seeds), so the death-day distortion scholaraway warned
  about does not arise in this band.
- DONATION ZERO IS CALLS, NOT FAILURES: donateCalls = 0 on all
  seeds — the policy never attempts a donation gate-off. A
  donation-attempt instrument (e.g. wrapping donateSurplus) would
  be needed to distinguish "no surplus" from "surplus but refused";
  the pack figures already show the scholar starts days at or
  under 2,000 finished kcal, below donateHaul's 2,400 keep, which
  is sufficient to explain the zero without a refusal story.
- Single policy (competent) by prereg design, 30-day early window
  only. Other policies and later windows may shape differently.
- Infrastructure note: zero flap losses on this run — all 8 pilot
  seeds landed first try, every line JSON-verified after landing.
  The driver's callback-based stdout retry (depositgate precedent)
  was not exercised.

## Metric review (for the NEXT run; this run judged against its header)

- THE GO BAR MEASURED PACK LUCK: the prereg's 6/8 bar assumed the
  gate-on pack distribution would transfer to gate-off, but 4/8
  gate-off seeds never carry finished food over 2,000 kcal at any
  return — no keep value above zero moves them, and no keep value
  below their max pack was tested. The NEXT run should pre-register
  a CONDITIONAL bar alongside the unconditional one — e.g. unload
  on >= 80% of returns carrying a finished pack over the keep, or
  nonzero unload on >= 6/8 seeds CONDITIONAL on max finished pack
  exceeding the keep — so the keep's behavior and the pack's
  composition are judged separately instead of multiplied into one
  bar. This run's conditional result (13/13 big returns unload)
  is reported, not substituted for the verdict.
- PACK COMPOSITION IS THE NEXT LEVER, NOT THE KEEP: the four zero
  seeds fail on composition (unknowns, in-shell nuts, materials),
  not on threshold. The next arm on this axis should ask why the
  scholar's pack is finished-food-empty on those seeds
  (identification timing, forage targets, sortHaul gating) rather
  than tuning the keep number again.
- DONATION METRICS MUST NAME THE CHANNEL: any future metric
  counting scholar generosity must sum unload + donation, or it
  will read the gate-off channel shift as generosity collapsing.
  Report both channels together from now on.
- No metric, threshold, seed, or leg definition was changed
  mid-run. The NO-GO verdict stands as written; the threshold
  separation and substitution findings above are interpretation
  of a NO-GO result, not a re-score.

## Findings for backlog (for the coordinator to append)

None outside this arm. The substitution finding (unload pre-empts
donation) and the pack-composition finding (zero seeds fail on
composition, not threshold) are this arm's own results, reported
above — the coordinator may reword them as backlog items if the
next arm needs them, but this worker appends nothing: no out-of-arm
gap surfaced.

## Files

- Prereg: evidence/2026-11-01/sim-depositkeep-b-prereg.md
- Driver: scripts/depositkeep-b-driver.js
- Analyzer: scripts/analyze-depositkeep-b.js
- Proof test: scripts/test-depositkeep-b.js (19 pure checks;
  live controls --live-a/--live-b/--live-c, each in its own process)
- Pilot census: evidence/2026-11-01/sim-depositkeep-b.jsonl
  (8 lines), sim-depositkeep-b-census.json (analyzer summary)
- Corpus extracts: evidence/2026-11-01/sim-depositkeep-b-corpus/
  51102-day28-homecoming.txt, 51107-keep-homecoming.txt
