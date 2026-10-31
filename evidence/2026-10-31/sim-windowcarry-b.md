# sim-windowcarry-b — ADOPTION EVIDENCE (judged, NO-GO)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1230Z,
arm sim-windowcarry-b, axis food-economy. Worktree sim-windowcarry-b.
POLICY PROTOTYPE ONLY: one new policy file
(scripts/policies/windowcarry-diag.js), zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. This
worker does NOT push, bump, or verify live; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator
merge. Per the task brief, the prototype + instruments + corpora +
evidence are committed anyway; the coordinator handles prototype
cleanup. Nothing is deleted silently.

## Adoption note (read first)

Adopted from blocked run fleshout-loop-b-20261031T1130Z (EPERM flap,
never started). Tracker blank 1 from run 1047Z (food-economy): a
strand-window-gated morning-food design, pre-registered before
judged sims. The prereg (evidence/2026-10-31/sim-windowcarry-b-prereg.md)
was committed BEFORE any judged leg (commit 2ccbb75b7, with the
policy, driver, analyzer, and pure proof test).

## Canon read

docs/CANON.md first, then docs/PRESERVATION.md (the ladder;
spoilDay-366 staples survive every dawn sweep) and docs/TIME-ECONOMY.md
(ticks/day-parts, metabolic burn ~2200 kcal/day, bridge 96 ticks +
60 kcal). No canon doc covers the morning-carry blank itself —
stated in the prereg, not invented.

## The lever played (worker call: variant (b))

Haven-departure pack carry ONLY pre-strand — bank before the strand,
nothing during/after — with NO wake-eat half at all. Candidate (a)
(wake pack-eat only inside the strand window) and (c) (wake-eat only,
no carry) were rejected on the morningcarry trace evidence:
strand-morning packs hold NO known food, so a wake-eat with no carry
half could never fire on a strand morning — a vacuous arm. The
routine's own upkeep eat consumes carried staples at wake, so the
chain under test is pre-strand carry -> staples survive the night(s)
at the creek -> fed strand day -> evening bridge kcal gate.

The window gate (the whole point): a carry fires ONLY when BOTH
hold — (1) the leg's daily-call count (census loop-day) is <= 7,
the last morning before the control strand's first still evening
(loop-day 7 on 15215, both legs), AND (2) no still-creek evening
has been recorded yet on that leg. After the window closes the
lever NEVER acts again on that leg: no re-arming after a return
home, no daily re-feeding. The say line is deliberately neutral
("You pack N portions from the pantry for the road — K kcal
carried."): the vessel cannot know a strand is coming, so
prescient narration would be a sense failure.

Substrate (asserted FATAL in the driver): POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON), WINDOWCARRY=0/1, DAYS=30,
PRESSB unset/0, STRANDFIX unset/0. Seeds: the 8-seed pilot band
15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337. ALL legs
re-run fresh on the current base: morningcarry's corpora (adoption
base 6856df77f) are reference only and were NOT reused as judged
data. Fresh control legs reproduce morningcarry's control counts
exactly (guard [7,8,9], ON [7..16]).

## Proof tests

- scripts/test-windowcarry-b.js: 11/11 pure green (window gate,
  pantry ordering, pack-known accounting, depart-half behavior
  against a mocked Game, lever-off inertness).
- scripts/test-windowcarry-corpus-b.js: 8/8 green over the judged
  corpora (det-gate both legs, window integrity both legs, median
  survival both legs, determinism byte-identity, 15215 ON fall +
  zero linked rescues).
- No driver errors on any leg (errs 0 everywhere).

## PILOT (sniff only, never judged) — PASS

8 seeds, ON variant leg only, corpus
sim-windowcarry-b-corpus-pilot-on: 8/8 files present, errs 0, the
15215 ON still evening (loop-day 4) carries a complete record, the
window gate evaluated on 15215 haven mornings (4 acted departs,
loop-days 1-4, then window-closed-strand from loop-day 6), and at
least one acted depart inside the window. Pilot already showed
the confirm shape: the variant strands once, early (day 4), then
never again — outside the control range.

## CONFIRM (judged) — before/after numbers

Paired compare:
evidence/2026-10-31/sim-windowcarry-b-compare.md, from
evidence/2026-10-31/sim-windowcarry-b-census-{guard,on}.json.
Det-gate: OFF reproduces control creek/still/rescued exactly on
every seed, both legs. Determinism: ON variant re-run
byte-identical on all 8 seeds (cmp clean).

Primary metric — 15215 stranded-evening census (still =
woodcarry bucket creek + rescued false):

| leg | control still | variant still | fall |
|-----|---------------|---------------|------|
| ON | [7,8,9,10,11,12,13,14,15,16] (10, run 10) | [4] (1, run 1) | 9 |
| guard | [7,8,9] (3, run 3) | [4,5,6] (3, run 3) | 0 |

Linked rescues (variant evening D inside the control still range
with bucket creek + rescued true AND preceding evening pack
known-kcal > 0): NONE on either leg. The variant's only rescued
evening is ON day 5, outside the control range 7-16.

Departs on 15215: ON and guard alike, exactly 4 acted departs
(loop-days 1-4: 750 + 1250 + 750 + 1500 kcal), then day-5
not-at-haven, then window-closed-strand from loop-day 6 onward.
Zero window violations on any variant leg, any seed.

## Verdict against the prereg GO clauses — NO-GO

(a) Still-count fall >= 2 on ON with causal link — FAIL as
written. The fall bar is met (10 → 1, fall 9), but the
causal-link bar is not: there is no linked rescue inside the
control range 7-16. The variant never enters the control range
at all — its strand moved earlier (days 4-6 guard, day 4 ON),
which under this prereg is re-route prevention, not the
fed-bridge chain. The ON day-4 → day-5 sequence IS the
fed-bridge mechanism working (evening-4 pack known 2630, evening
5 rescued with the bridge line spoken), but on a shifted strand
outside the range the prereg defined. The verdict does not hinge
on this reading alone: clause (c) fails independently (below),
so NO-GO stands under either reading.

(b) Strand length non-increasing on either variant leg — PASS.
ON: total 10 → 1, run 10 → 1. Guard: total 3 → 3, run 3 → 3
(equal, not increased).

(c) Guardrails — FAIL. Four independent breaches:
- Earlier vessel deaths: 15215 ON day 17 → day 13; 15215 guard
  none → days 6, 17, 29; 15220 both legs none → day 20.
- New vessel-death modes: 15215 guard adds "the wild",
  "contest", "sickness" as vessel-death causes where control had
  none; 15220 both legs add "the wild".
- Newly ticks-short evenings: 15215 guard 1 → 2 (ON holds 1 → 1;
  all other seeds 0 → 0).
- Creek still increase on a non-strand seed: 15337 [] → [20]
  on BOTH legs (day-20 still evening, wood 0 — a late wood-bleed
  stranding on a healthy seed).
- Held: median survival 30d vs 30d (both legs pooled), no
  game-over on any leg, no driver errors, zero 'Someone watches'
  / 'Caught' pantry lines on judged legs.

(d) Window integrity — PASS. Zero violations on any variant leg:
no acted depart with loopDay > 7, none after the leg's first
still evening (verified from depart records and the policy's
daily-count cross-check).

Overall verdict: NO-GO. The bounded window held perfectly and
fixed morningcarry's 15211 breach (15211 variant still [] on
both legs here), but it did not fix the re-routing: a pre-strand
bank still moves the whole early trajectory, strands the vessel
days earlier, and re-routes a healthy seed (15337) into a late
stranding.

## SENSE TEST (law) — PASS

Read end to end: every acted departure line on 15215, both legs
("You pack 3/5/3/6 portions from the pantry for the road — K kcal
carried.", days 1-4, neutral, no strand mention — the vessel
cannot know a strand is coming); the guard still evenings
(day 4: pack 2630, kcal 2250, wood 4 → "No bridge tonight — 77
ticks left in the day, and a bridge takes 96 ticks."; day 5:
pack 750, kcal 2230, wood 4 → 91 ticks left, still short by 5 —
fed-but-ticks-short, narrated honestly, not silently rescued);
the guard day-6 wood-bleed ("The bridge stands, but the way home
still refuses — block:creek."); and the ON rescued evening
(day 5: "You lash logs together. A rough bridge spans the gap."
+ bridge built + retry arrived + rescued true, then walking home
into the Haven hall). Nothing converts silently. The one sour
note is narrated too: on guard, a fed strand morning (day 5:
kcal 2330, pack known 750) still ends ticks-short — food fills
the belly but does not buy evening hours back.

## Reachability verdict

Wall numbers (national / table / wins) are NOT observable on
a 30-day pre-seat census — reported as such, never fabricated.
Within the window: 15215 max wave unlocked rises 1 → 2 on both
variant legs (control 1); 15003 max wave FALLS 2 → 1 on both
variant legs (reported, not judged — the prereg bars no wave
metric). No wave-4/5 reach, no regional/national/table content
is in scope of this census.

## Village assessment, in plain words

Picture the village on the strand seed without the lever: the
traveler leaves home fed, walks to the creek, and gets stuck
there night after night — ten stuck nights in a row when the
fire is warm, three when it is not — because each morning she
wakes with nothing edible in her pack and the day's work eats
the hours she would need to bridge home. With the lever, she
packs pantry food every home morning for the first week — tinned
soup and rice that cannot spoil — and the bank works exactly as
designed: it never fires again after the first week, and it
never re-arms her after a return home. But the bank changes what
the first week IS: fed from day 1, she walks a different road
and reaches the creek days earlier, so she strands on day 4
instead of day 7 — and on the warm leg the carried food plus a
bridge gets her home on day 5, a rescue the control seed never
gets. The mechanism is real and narrated. But it is a
re-timing, not a repair of the control strand: the guarded leg
still strands three nights, just earlier ones, and the fed
mornings still end short of hours (77 ticks, then 91, against
the 96 the bridge needs). And on a healthy seed the new road
leads somewhere worse — stuck at the far end of the month with
no wood at all. A bank that only fires before the trouble
starts cannot aim at the trouble; it just moves it.

## Blanks filled or documented

- Documented: window-gating does NOT cure trajectory re-routing.
  Bounding the bank to 7 pre-strand acts fixed morningcarry's
  15211 breach but moved the strand earlier on 15215 (both legs)
  and created a new late stranding on 15337 (both legs). Any
  future morning-food lever must be judged on 15337 as well as
  15215 and 15211, and must reckon with the strand moving, not
  just shrinking.
- Documented: fed-but-ticks-short is now a twice-measured law.
  Guard day-5 strand morning (kcal 2330, pack known 750, wood 4)
  still ends 91/96 ticks short. The evening tick budget is its
  own gate; feeding cannot substitute for it.
- Documented: wood-bleed still blocks fed evenings. Guard day 6
  (pack 0, wood 0) and 15337 day 20 (wood 0) both end still with
  the bridge's wood gate unmet. Once food is carried, wood — not
  kcal — is the binding constraint on the strand's tail.
- Documented: the ON day-4 → day-5 fed-bridge chain works on a
  shifted strand (evening-4 pack known 2630 → evening-5 rescued
  with the bridge line spoken). A future prereg testing the
  fed-bridge chain itself, rather than the control strand's
  calendar, would judge this sequence a pass — but that is a
  different claim from the one this prereg defined, and it is
  NOT re-scored here.
- Documented: vessel-death-day guardrails stay near-unpassable
  for any lever that changes early routine decisions (see metric
  review). 15215 ON moves 17 → 13 on the same cause ("the
  wild"); 15215 guard and 15220 gain vessel deaths where control
  had none — all under ordinary divergence, none a game-over
  (median survival holds at 30d).
- Filled (instrument): the stdout-runner + splitter transport
  (scripts/windowcarry-stdout-runner-b.js,
  scripts/split-jsonl-b.js) — see "Infrastructure findings" below.
  The det + off-on legs were produced through it and verified
  byte-identical / det-gate-exact.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg Q1 (does the bounded pre-strand bank survive routine
  appetite to the strand?) — ANSWERED in part: yes on ON
  (evening-4 pack known 2630 at the creek) and on guard morning 5
  (pack known 750 at a strand wake), but the bank is eaten down
  across the strand (guard evening-6 pack 0) and does not last
  the strand's length.
- Prereg Q2 (is the vessel-death guardrail fair to a bounded
  lever?) — ANSWERED: no, not as written. Even a 4-act bank
  moves vessel deaths (15215 ON 17 → 13, same cause) and creates
  them where control had none. Next run should define that
  guardrail against game-over days or lever-caused death modes,
  or scope it to deaths inside the strand window — as
  morningcarry's review already proposed, now with a second
  arm's evidence behind it.
- Prereg Q3 (is the linked-rescue clause too strict if the bank
  prevents the strand entirely?) — ANSWERED in the strict
  direction: the variant did not prevent the strand, it MOVED
  it. The clause correctly distinguished re-timing from rescue
  here. A future arm claiming the fed-bridge chain itself should
  pre-register the shifted-strand chain (carried staples at the
  creek the night before a rescue, wherever in the horizon it
  falls) instead of the control range.
- New doubts for the NEXT run, not re-scored here: (1) whether
  ANY pre-strand bank can avoid re-routing, given that feeding
  days 1-7 changes route choice itself — the next design may
  need to act at the strand (not before it) or not act on food
  at all; (2) whether the 15337 day-20 still evening is a
  wood-route effect (the bank's early wood carry interacts with
  the vessel's wood economy) or pure re-route luck — the census
  alone cannot say, and a trace arm would need to answer it.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack,
the 30-day creek-evening census, or an env-gated single-mechanism
probe — the same declaration every prior strand arm made. The
comparison here is control-vs-variant legs on identical seeds
through the census analyzer (paired compare above), never labeled
a panel comparison. No panel result is fabricated; the panel tool
was not invoked on this corpus.

## Infrastructure findings (for the coordinator — NOT game findings)

The EPERM flap shaped this run's transport, and two findings are
worth recording for future arms:

1. GAME-LOADED PROCESSES CANNOT RELIABLY WRITE FILES. Verified
   2026-10-31 in controlled pairs: a process that loaded the game
   (even a 1-day sim) failed writeFileSync with EPERM (0-byte
   file left) while a fresh process in the same minute wrote the
   same size to the same directory successfully. The driver's
   own retry loop cannot save such a process: the game's frozen
   clock makes Atomics.wait return in ~1ms instead of the
   requested timeout (verified: 5 × 2000ms sleeps took 5ms
   total in a game-loaded process, 3000ms in a fresh one), so
   its 30s sleeps never happen and its pending loop spins
   without delay. The working pattern is scripts/
   windowcarry-stdout-runner-b.js (the sim process prints one
   JSON line per seed to stdout — a pre-opened fd, proven by the
   stalled drivers' own log lines reaching their logs) plus
   scripts/split-jsonl-b.js (an idle process that splits the
   .jsonl into per-seed files with tight retries). The det +
   off-on legs were produced this way and verified (det
   byte-identical, off-on det-gate exact). One caveat: piping
   the runner's stdout DIRECTLY into the splitter in a
   backgrounded exec session failed silently twice (runner exit
   1, empty logs); stdout→file + stderr→file in a foreground
   exec worked every time. Future arms should use the file
   redirect form, never the backgrounded pipe form.
2. /tmp IS NOT SAFE STAGING. The sibling-cleanup wipe deleted
   /tmp mid-run (runner script + in-flight OUTDIR vanished,
   killing a leg). Judged corpora must never be staged in /tmp;
   the .jsonl redirect lives in evidence/ until split, then is
   deleted.
