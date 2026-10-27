# sim-standmeet-a — STANDING vs MEETING track separation: CENSUS-COMPLETE (GO)

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp.
Worker: sim-standmeet-a. Worktree: `~/workspace/worktrees/sim-standmeet-a`
(branch sim-standmeet-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
separation of the two tracks behind the wave-5 door on a FRESH band.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-standmeet-a-prereg.md (commit 2309973be9).
Corpus: evidence/2026-10-27/perseed-standmeet-a/ (8 rows + summary.json
+ sense-74902.txt). Instruments: scripts/test-standmeet-a-sweep.js
(census + separation computation), scripts/test-standmeet-a.js (proof
validator, ALL PROOFS PASS incl. S-G1/S-G2/S-G3), scripts/test-
standmeet-a-sense.js (non-measured sense replay).

## Plain words

The two tracks do separate — but not the way the parent run's
sharpest seed suggested, and the separation is what finally opens
the door. On this band, standing without meeting never happens:
zero villages earn high standing without also meeting wave 4,
so the 74406 shape (standing 347, zero meetings) does NOT repeat.
Meeting without standing is the common shape — five villages meet
wave 4 while never clearing 200. The gate's real work shows in the
two villages where both tracks coincide: on one, standing plus
meeting plus a living killer all arrive together, and wave 5
opens for the first time in this whole census family (74902, day
165). On the other, standing plus meeting arrive with zero kills,
and the gate still holds at 199 despite standing of 252 (74908).
So neither track alone moves the gate on this band — the thing
that opens the door is the third track, the living killer, and
the census finally has one seed on each side of that line. Top
rank does not bypass the table: every village that reaches global
standing is offered the table (zero rank-without-offer seeds).
And the lesser seat needs neither track at all: the one village
in neither cell still reaches global, gets the offer, and wins
the lesser feared seat.

## Verdict: GO (census complete, binding prereg)

GO required ALL of:
- G0: census completes on 8/8 seeds — PASS (8 rows, days > 0,
  every gate + deed field present).
- G0b: substrate-activation gate >= 7/8 — PASS (8/8 ACTIVE:
  links/feasts footprints on all 8, tsNationalDay set on all 8).
- G0c: separation table fully populated — PASS (cells sum to 8,
  every seed in exactly one cell, validator S-G1 recount equals
  summary).
- G0d: all proof gates pass — PASS (V1-V7 + G4 + G5 + G10
  carried from w5seq, plus S-G1/S-G2/S-G3; see Infrastructure
  notes).
The verdict is the table below with the plain-words reading
above. No cell count was thresholded: HS-no-meet at zero is a
finding (the track does not separate that way on this band), not
a failure. No second judged band was run (confirm-band rule).

## The separation table (judged, fresh band 74901-74908 only)

HIGH STANDING = peak capped standing >= 200. MEETING = wave-4
faced ever > 0. Cells sum to 8.

| cell | count | seeds |
|---|---|---|
| HS-no-meet (standing >= 200, zero meetings) | 0 | — |
| meet-no-HS (meetings, standing < 200) | 5 | 74903, 74904, 74905, 74906, 74907 |
| both (standing >= 200 AND meetings) | 2 | 74902, 74908 |
| neither | 1 | 74901 |

Secondary column (descriptive, not the verdict): global rank
reached + table offer ever seen (offer = tableWaiting ever true;
preview seen = policy priced the table at least once).

| seed | maxRank | offer ever | preview seen | rank-without-offer |
|---|---|---|---|---|
| 74901 | global | yes | yes | no |
| 74902 | national | no | no | — (not global) |
| 74903 | national | no | no | — |
| 74904 | global | yes | yes | no |
| 74905 | national | yes | no | — |
| 74906 | national | yes | yes | — |
| 74907 | national | yes | yes | — |
| 74908 | global | yes | no | no |

Rank-without-offer: 0/8. Stricter neither-waiting-nor-preview:
0/8. Every global-rank seed was offered the table. Note the
asymmetry the prereg did not ask about but the corpus shows:
74902 reaches WAVE 5 at national rank with NO table offer at all
— wave 5 without the table — because the full seat still needs
the wave-5 deed bar (2 distinct wave-5 types faced; 74902 has 0)
and the food deeds (74902 lacks them). The table does not follow
wave 5 automatically; it follows deeds.

## Wall numbers (every run needs these)

| field | this band (74901-74908) | w5seq (74401-74408) | w5twokey (74311-74318) |
|---|---|---|---|
| national ever / final | 8/8 / 6/8 | 8/8 / 6/8 | 7/8 / 4/8 |
| table invited / entered | 6/8 / 4/8 | 5/8 / 3/8 | 5/8 / 3/8 |
| wins | 4/8 (all feared lesser) | 3/8 (all feared lesser) | 3/8 (all feared lesser) |
| full seat | 0/8 | 0/8 | 0/8 |
| lesser seat | 4/8 | 3/8 | 2/8 |
| wave-4 unlock | 8/8 | 7/8 | 5/8 |
| wave-5 unlock | 1/8 | 0/8 | 0/8 |
| median survival | 174d | 153d | 156d |
| deaths | 306 | 273 | 238 |
| starvation deaths | 2 (0.7%: 1 villager, 1 player) | 1 (0.4%) | 2 (0.8%) |

National is not the wall on this band either — 8/8 reach it, 6/8
hold it at end, same as w5seq. The wall moved one notch: wave 4
is now universal (8/8, up from 7/8 and 5/8), and wave 5 opened
once. The full seat is still 0/8 everywhere — but for the first
time the reason is visible in a new form (see finding 2).

## Per-seed gate table (end-of-run, with peak in brackets)

Demand (live code, V5-checked): wave 5 = armored 4 @ P>=15, armed 6,
tricks 3, veterans 2. Wave 4 = armored 3 @ P>=10, armed 5, tricks 3,
veterans 1. Standing bar t5 = 200 (plenty capped at 100 toward it).

| seed | end | wave | rank | raw [peak] / capped [peak] / gated | rd5 end [peak] (a/arm/t/v) | w4faced | w4kills (living) | cell |
|---|---|---|---|---|---|---|---|---|
| 74901 | 163d won lesser feared | 4 | global | 167 [167] / 167 [167] / 167 | 4/6/25/0 [—] | 0 | 0 (0) | neither |
| 74902 | 180d survived | 5 | national | 202 [202] / 202 [202] / 202 | 3/5/29/0 [peak vet 2] | 4 | 3 (0) | both |
| 74903 | 174d village-lost | 4 | national | 177 [177] / 177 [177] / 177 | 2/5/25/0 [—] | 1 | 0 (0) | meet-no-HS |
| 74904 | 149d won lesser feared | 4 | global | 187 [187] / 187 [187] / 187 | 3/6/24/0 [—] | 2 | 0 (0) | meet-no-HS |
| 74905 | 180d survived | 4 | regional (peak national) | 45 [147] / 45 [147] / 100* | 2/4/24/0 [—] | 3 | 0 (0) | meet-no-HS |
| 74906 | 169d won lesser feared | 4 | national | 147 [147] / 147 [147] / 147 | 7/9/21/0 [—] | 1 | 0 (0) | meet-no-HS |
| 74907 | 89d won lesser feared | 4 | national | 172 [172] / 172 [172] / 172 | 2/9/17/1 [peak vet 1] | 2 | 1 (1) | meet-no-HS |
| 74908 | 180d survived | 4 | regional (peak global) | 280 [292] / 200 [252] / 199 | 1/2/19/0 [—] | 4 | 0 (0) | both |

\* 74905's gated 100 at end despite raw 45 is the peak ratchet
working as designed: wave 4 released floors the total at 100
forever. 74908's gated 199 at end despite capped 200-252 is the
rd5 deferral: capped >= 200 but rd5 not ready (veterans 0), so
the 199 hold wins — the same hold as 74406, now with meetings.

## Census findings (each number traceable to the corpus)

1. THE 74406 SHAPE DOES NOT REPLICATE — HS-no-meet = 0/8.
   The parent run's sharpest seed (raw 347, capped 227, gated
   199, zero meetings) has no counterpart here. The two high-
   standing seeds this band (74902 at 202, 74908 at 252) both
   met wave 4 (4 kinds each). Standing-without-fighting is a
   possible shape — 74406 proves it exists — but it is not the
   band's normal weather: on this band, high standing always
   travels with meetings. The separation runs the other way:
   meeting-without-standing (5/8) is the common shape, and the
   neither cell (1/8) shows a village can reach global and win
   the lesser seat with neither track.
2. WAVE 5 OPENS — FIRST IN THIS CENSUS FAMILY (74902).
   First gated-200 day d165 (capped 202, rd5 veterans 2, peak
   wave 5); engine unlocked wave 5 at end; daily unlocked wave
   5; the peak ratchet holds gated at 202 to the end even
   though veterans fall back to 0 at end (both killers dead)
   and end readiness decays (armored 3 < 4, armed 5 < 6). The
   opening sequence, from the first-veteran table: F4 d123
   (rd4 ready, gated 127), F5 d136 (rd5 [7,10,27,1] — veterans
   the only short bar), first gated 200 d165. Standing
   composition at end: war 100, diplomacy 102, plenty 0 —
   a WAR + DIPLOMACY village, not a feast village (end links
   3, feasts 0). The door opened on blood and links, not on
   plenty. But the opened door leads nowhere yet in deeds:
   deed w5 = 0 at end — no wave-5 type faced in the 15 days
   after unlock — and no table offer (see the secondary
   column). Unlocking wave 5 is an event, not yet a played
   encounter, on this seed.
3. THE MIRROR SEED: BOTH TRACKS, NO KILLS, STILL 199 (74908).
   Peak raw 292, peak capped 252, gated 199, w4faced 4,
   w4kills 0, peak veterans 0 — the 74316 replication count
   is 1, and this time WITH meetings. Standing composition at
   end: war 100, diplomacy 0, plenty 180 — war + plenty, the
   feast-heavy shape. Together, findings 2 and 3 isolate the
   binding bar exactly: 74902 and 74908 both clear 200 and both
   meet wave 4; only 74902 ever has living veterans at peak
   (2), and only 74902 opens. Meeting is necessary (the w5
   gate requires w4faced > 0) but the meeting alone does not
   turn the key — only a living killer does, and 74908 never
   has one.
4. THE FIRST LIVING WAVE-4 KILLER AT END (74907). End
   veterans 1, w4kills 1, killer alive at end; the village wins
   the lesser feared seat on day 89. Across w5block/w5twokey/
   w5seq (24 seeds), living wave-4 killers at end were 0;
   this band has 1, plus 74902's peak-2 (dead by end). Band
   totals: w4kills 4 (74902: 3, 74907: 1), killers 3, living 1
   — the highest kill count in the family, and the first
   survivorship data point that is not zero. The revolving
   door still spins (74902's two killers both die), but it is
   no longer the only story.
5. TOP RANK DOES NOT BYPASS THE TABLE (0/8). All three
   global-peak seeds (74901, 74904, 74908) saw a table offer
   (tableWaiting ever true). The stricter count (neither
   waiting nor preview) is also 0. What does bypass the table
   is wave 5 without deeds: 74902 opens wave 5 at national
   rank and never sees an offer, because the full seat needs
   the w5 deed bar and the food deeds, and it has neither.
   Rank and offer are not the bypass; deeds and offer are
   the pair to watch next.
6. DEED BARS (end-of-run). Bars 5/5/4/3/2 + contests 3 +
   crises 3 + stage 2 + food deeds + scale national+:
   - w1 (>= 5): 8/8 (13-21). w2 (>= 5): 8/8 (5-12). w3 (>= 4):
     6/8 (74905: 3, 74907: 3; rest 4-5). w4 (>= 3): 3/8
     (74902: 4, 74905: 3, 74908: 4; rest 0-2). w5 (>= 2): 0/8
     — including 74902, wave 5 unlocked but unmet.
   - contests (>= 3): 8/8 (12-24). crises (>= 3): 8/8 (3-5).
     stage (>= 2): 8/8 (all stage 3). food deeds: 6/8
     (74902/74903 lack them). scale national+ at end: 6/8
     (74905/74908 regional at end despite national/global
     peaks — the same peak-vs-end scale decay as w5seq).
   - deedGateReady().ok: 0/8 at end and at peak — still
     structurally forced by w5 = 0, as pre-registered, not a
     finding about effort. Nearest to ok: 74908 fails ONLY
     the w5 bar and scale-at-end (w1 16, w2 6, w3 5, w4 4,
     contests 20, crises 3, stage 3, food deeds true).
7. THE SEQ COMPARISON HOLDS (not judged, reported). S1 8/8
   (no daily gated >= 200 point lacks both keys), S2 6/8
   seeds exhibit the wave-4-door deferral (74903 and 74908
   never show a raw >= 100 + rd4vet 0 + gated <= 99 day —
   74903 because rd4 veterans turn early at low standing,
   74908 because rd4 veterans turn on day 42 before standing
   climbs), S3 8/8 (no wave 5 on one key), seqOk = TRUE,
   sole-short 6/8. The parent's sequential structure survives
   a third band; the new information is all in the separation
   table and the 74902 opening, not in the sequence.
8. DEATH CAUSES (306 deaths): villager combat 126 (41.2%),
   villager-vs-villager combat 84 (27.5%), player arena 39
   (12.7%) — combat 249/306 (81.4%); expedition 12, wounds
   that would not close 11, sickness 13 (villager 9, player
   4), ambush 6, monster 6, contest 3, Choir Toad 2,
   starvation 2, Big Loud 1, alien 1. Combat dominates as in
   every band of this family; starvation does not — the scale
   wall here is not food collapse. The two starvation deaths
   are 74903 (villager) and one player death; 74905's and
   74903's villages survive to 180/174 days regardless.
9. END-STATE BLOCKER SUPPORT, REPEATED: 0/8 for every
   component — the fourth fresh band where the end-state
   sole-shortfall frame finds nothing. The peak + sequential
   + separation frames are what see the structure; the
   end-state frame keeps missing it because several components
   are short at end on every seed.

## Village assessment (plain words)

Eight villages, all reaching national standing at some point,
six holding it at end. Four win through the lesser feared seat,
three survive the full 180 days (74902 with wave 5 open, 74905
and 74908 at regional), one is lost (74903 at day 174).
The shape of the run is: villages meet wave 4 everywhere now
(8/8 unlock, deed w4 met on three, faced on seven), kill a
little more than before (4 kills, one killer alive at end), and
mostly win small or survive — except one village that puts the
whole lock together. That village, 74902, is feared, not loved:
its standing is war and diplomacy, its killers blood wave 4
three times, and on day 165 the System announces the fifth
draft in fiction while the census watches the gate release in
numbers. It then sits at national rank for fifteen days with
wave 5 open and no table offer, because the table prices deeds
and this village has not yet faced what it unlocked. The
village that goes furthest on standing, 74908, reaches global,
peaks at 252, faces four kinds of wave-4 monster, kills none,
and is held at 199 — the same wall as 74406, now with the
meetings included, which proves the meetings were never the
missing piece. The missing piece was always the living killer.

## Sense-testing read (seed 74902, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: the HS-no-meet cell is
empty, so the fallback applies — highest gated standing at end
(74902, 202; next 74908, 199). Replay:
scripts/test-standmeet-a-sense.js, seed 74902, 180 days, output
saved alongside the corpus (perseed-standmeet-a/sense-74902.txt,
220 lines, 194 life/gate hits from d150, 13 fight starts). The
replay trajectory may shift from the census (as with all
narration replays, the text below proves wording and presence
only, never entity identity or counts).

What the standing was actually earned by, in words: NOT feasts.
The replay's late run is full of fear and links and empty of
feasting as an act — the census says war 100 + diplomacy 102 +
plenty 0, and the fiction agrees. "Out there they call you the
Feared. The show's narration lingers on your hands" (d156,
d168, d180, riders from The Red Table II, Emberhold, Thornfield
bringing talk of Haven). A raid lands in fiction (d151-152:
Elena of The Red Table II demands ~2,000 kcal, then takes 996
kcal from the stores). The standings beat agrees ("Haven sits
2nd of 8. Stonebridge leads"). The repeated "The feast was the
weapon" line is a keepsake beat about the Contract Quill, not a
feast happening — same noise class as w5seq's Mixtape line,
and the census feasts count (0) is the authority on feasts.

The wave-5 opening lands in fiction exactly on the census day:
d165, "RATINGS ARE UP... the Producers have greenlit the fifth
draft. Wave 5 talent has been released," plus "WAVE LEDGER —
wave 4's bar is full (3/3 — kills only, not near-misses). The
Producers are cleared for release — watch the sky." After the
release, a new presence watches from the treeline — "The Focus
Group stops at the treeline — pacing, unwilling" (d170-180,
repeated) — but it never engages in the replay window, which
matches the census deed w5 = 0: unlocked, announced, not yet
faced. The villagers otherwise read as people living: teaching
(Alganesh and Sofia teach plants to the whole village, "The
Codex grows without you lifting a finger"), cookpot tasting
(Rosa, Keisha, Alganesh at the pot daily), arguments about
monster names ("The Big Beast," "The Ugly Beast," "Big Big —
nobody agrees yet"), a succession (d180: "You wake up somebody
else. Adrian Sow, 51 — a line cook"), gossip with its own
epistemology ("Priya was killed — Ellis did it, they say. (The
truth: dead is dead; the killing part is gossip.)"), a village
debate that resolves without the player (a weathered hunter
vouched for at 47% for), HERALD strikes with trust −5 and a
named absence ("they notice who wasn't there"), and
Emberhold's foragers pressing on shared ground. The late run
reads as a feared village with a full pantry, a thinning fire
("Nobody's talking much. The fire feels smaller tonight,"
d176-180), and a new draft announced but not yet met.

Sense judgment: the fiction and the census agree on all three
things that matter — the standing is fear and links, not
feasts; the fifth draft is announced on the day the gate
releases; and the unlocked wave is not yet faced. The sense gap
and the census gap are the same gap: what happens after the
announcement, when the Producers actually arrive.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg: GO iff 8/8 rows + substrate >= 7/8 +
separation cells sum to 8 + proof gates pass. Result: all four
hold. Verdict GO (census complete), with the verdict being the
table and its reading — not a threshold on any cell.
Three method notes, each a proposal for the NEXT run, never a
revision of this one:

1. THE CENSUS-COMPLETENESS GO WORKED. Pre-registering GO as
   completion rather than a cell threshold meant HS-no-meet at
   zero was reportable as a finding instead of forcing a
   NO-GO on a band that delivered the family's first wave-5
   opening. Future separation censuses should keep GO as
   completion + proof, with cell counts as the verdict's
   content.
2. THE OFFER DEFINITION HELD, THE PREVIEW CROSS-CHECK SHOWED
   ITS LIMIT. offerEver (tableWaiting ever) is an engine fact;
   previewSeen is a policy artifact — 74905 has an offer with
   no preview (the policy only prices the table at national+,
   and the offer can arrive on a day the policy does not price
   it), and 74908 has an offer with no preview at global peak.
   Future rank/offer work should keep tableWaiting as the
   primary and drop previewSeen to a footnote, or price the
   table independently of the seat policy.
3. DAILY SAMPLING EDGE, NOT BITTEN THIS BAND. No daily-vs-end
   deed disagreement (G4 passes on all seeds); the known
   death-day edge (a final-day meeting after the last daily
   sample) did not affect any verdict input, because the
   separation uses w4facedEver = max(daily max, end). The
   max-with-end construction should stay standard.
4. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (grep: 0 hits for ingest/
   corpus). A panel compare was ATTEMPTED this run (`node
   scripts/balance-panel.js --out /tmp/panel-standmeet-a` under
   a 90s guard): it produced no panel output in 90s — it builds
   panels from live roots (a long sim run), not from the
   corpus — so it was stopped. It is the wrong instrument for
   this census, not a failed comparison. No panel artifact was
   faked; the sweep table + validator output are the
   comparison of record. Same standing exception as the w5seq
   corpus.

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline ~/workspace/goals/
the-scattering-roguelite-survival-game/hidden_files/
telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-standmeet-a/*.json' --metrics
national,table,wins,exiled` -> 3 LOUD lines (national 12->0,
table -62% 16->6, wins 16->0, n=9 files). Verdict: KNOWN
ARTIFACT, no investigation, baseline NOT rolled. Two independent
reasons, both documented (same as w5seq): (a) the baseline's own
_regime note forbids this comparison (a ~100%-win winseat suite
vs a tableseat-nowait census substrate — wins are structurally
lower here); (b) the field-shape artifact repeats (per-seed rows
carry nationalEver/entered/won, not top-level national/table/
wins paths; summary.json is the 9th file). The corpus's real wall
numbers are nationalEver 8/8, table entered 4/8, wins 4/8. No
exiled LOUD line.

## Findings for backlog (coordinator appends to sim-findings.md)

- Wave-5 unlocked but unmet: 74902 unlocks wave 5 on d165 and
  faces zero wave-5 types by day 180 (deed w5 0), while a
  "Focus Group" presence watches from the treeline in the
  replay. Question, not a bug claim: after the unlock
  announcement, when and how does wave-5 talent actually
  engage — is 15 days too short a window, or does the release
  need an arrival beat? (standmeet-a evidence.)
- Wave-5 without table offer: 74902 at national rank, wave 5
  open, no table offer ever — the full seat's w5 deed bar +
  food deeds gate the offer after the unlock. Worth a design
  note, not a fix: the table does not follow wave 5
  automatically. (standmeet-a evidence.)
- Living wave-4 killer at end, first in family: 74907's killer
  survives to the lesser-seat win — the veteran-survivorship
  question has a new data point on the survival side, against
  74902's two killers dying. (standmeet-a evidence.)
- Sense noise class, repeated: the Contract Quill keepsake
  line ("The feast was the weapon") repeats daily in replays —
  same ambient-repeat class as w5seq's Mixtape/keepsake beat,
  not a game bug. (standmeet-a sense replay.)

## Blanks filled or documented

- FILLED (answered, with numbers): the standing/meeting
  separation on a fresh band — HS-no-meet 0/8, meet-no-HS 5/8,
  both 2/8, neither 1/8; the 74406 shape not replicated; the
  first wave-5 unlock in this census family (74902, d165,
  gated 202, peak veterans 2, w4kills 3); the mirror seed
  (74908: capped 252, gated 199, w4faced 4, w4kills 0); the
  first living wave-4 killer at end (74907); rank-without-
  offer 0/8 (top rank does not bypass the table); wall numbers
  (national 8/8 ever, wave-4 8/8, wave-5 1/8, wins 4/8 lesser
  feared, median survival 174d); deed bars per seed; the SEQ
  comparison (S1/S2/S3 hold, sole-short 6/8).
- FILLED (gate re-derivation, verified against code):
  validator V5 confirms live demand (w5: 4/15/6/3/2; w4:
  3/10/5/3/1); S-G1/S-G2/S-G3 confirm the separation, rank/
  offer, and substrate-activation recounts from the daily
  series.
- DOCUMENTED, NOT FIXED (for the coordinator, not chased here):
  (1) wave-5-unlocked-but-unmet (74902, deed w5 0 after 15
  days); (2) wave-5 without table offer (74902, national, no
  offer); (3) the veteran-survivorship split (74907's killer
  lives, 74902's two die); (4) replay ambient-repeat noise
  (Contract Quill keepsake line daily).
- CARRIED (not chased here): the melt stage (proposed
  sim-w4melt-a); the empty nonat x w4 class (w5chain-a); the
  live rule-(3) firing band (needs defiance NOT offered —
  fallbackfeared's open item).

## Infrastructure notes

- Sweep: scripts/test-standmeet-a-sweep.js, 8 seeds, ~3 min
  wall. Corpus: evidence/2026-10-27/perseed-standmeet-a/ (8
  rows + summary.json + sense-74902.txt). Validator:
  scripts/test-standmeet-a.js — ALL PROOFS PASS (V1-V7 + G4 +
  G5 + G10 + S-G1 + S-G2 + S-G3).
- Safe-commit index clobber hit BOTH pre-sweep commits
  (prereg 2309973be9, instruments 22a676efa9) — the known
  class: commit correct, main index showing bogus staged
  deletions + untracked twins. Repaired via HEAD-blob
  cacheinfo both times, verified with git status --short
  empty + git diff HEAD empty, before any sweep ran.
- No EPERM flap blocked this run's writes; all rows wrote
  first try (the writer subprocess retry loop was not needed
  beyond its first attempt).
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the w5seq/w5twokey precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the
  sense script only READS beats on a replay).
- Panel attempt stopped under a 90s guard (see Metric review
  §4): the panel tool builds from live roots, not from a
  census corpus.
- Commit: sim-standmeet-a, CENSUS-COMPLETE (GO), zero src/js
  diff. Branch ready, pending coordinator merge; NOT pushed,
  NOT bumped, live NOT verified (coordinator/ship-loop line,
  not this arm's).
