# Sim round 1528Z — scale-onramp: PARTYFINISH=1 band + field-party formation diag

Run: fleshout-20261028T1528Z, axis scale-onramp (converging). No live
claim at run start (all prior claims .DEAD); sibling loop B live only on
other axes (onceaday-refresh, grantpersist — NOT touched). Both arms
measurement-only under the gating freeze (freeze intent clarified
2026-10-28 09:14 CDT): zero src/js, zero default flips from this run.
Shared band: seeds 75101–75108, tableseat-nowait verbatim,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware. Baseline: the
1415Z run (universe 44, faced 21, engaged 21, KILLED 2, demand-met 2/50).

## Pre-registration

- Arm 1 sim-partyfinish-band-a (prereg committed before any judged sweep):
  primary metric wave-4 KILLED on the 8-seed pilot; GO = killed ≥4 AND
  ≥1 non-solo party kill AND scalemetric cost bar (starvation ≤ control+2
  totals and arm-only, median ≥ 0.8× control median 146d = ≥117d).
  Kill-fast rule: no holdout band on a failed pilot.
- Arm 2 sim-fieldparty-form-a (prereg committed before any judged sweep):
  primary metric party-formation rate on crew-lens could-form wave-4 field
  meetings; DIAG-GO = census 8/8, 0 unclassified, named mechanism.

## Arm 1 — sim-partyfinish-band-a: NO-GO (killed 3 vs bar 4)

PARTYFINISH=1 vs PARTYFINISH=0 on identical seeds:

| measure | PARTYFINISH=1 | control | delta |
|---|---|---|---|
| universe / faced / engaged | 46 / 19 / 17 | 44 / 21 / 21 | +2 / −2 / −4 |
| wave-4 KILLED | 3 | 2 | +1 — misses ≥4 |
| field faced/engaged/killed | 7 / 7 / 0 | 11 / 11 / 0 | 0 field kills either band |
| raid faced/engaged/killed | 16 / 3 / 0 | 16 / 2 / 0 | 0 |
| TB faced/engaged/killed | 10 / 10 / 3 | 14 / 14 / 2 | +1, all TB |
| never-met / met-no-kill | 27 / 16 | 23 / 19 | — |

GO legs: killed 3 vs ≥4 FAIL (deciding leg); party kills 2 vs ≥1 pass;
starvation 1 ≤ control+2 pass; median 140d ≥ 117d pass; driver fired
(12 sorties) pass; census validity pass (8/8 rows, 0 unclassified,
control re-census reproduces 44/21/21/2 exactly). Per the kill-fast
rule, no holdout band was run.

The 3 kills are all TB-channel, none sortie-caused (75105 d121 Eater,
scholar + vasyl_shevchenko; 75105 d167 Strike, scholar + visjoin_163;
75108 d113 Strike, scholar-solo). The driver works exactly as landed:
18 counted sortie finishes, all wave 1/2, all 1 HP, all party-of-3
round-1 cornered holds — zero wave-4. Why: sortie gates (weakest
lingerer ≤80 HP, treeline ≤300 HP) almost never admit a wave-4 beast
(850–1500 HP arrivals; 27 minHp holds on the band, none wave-4), and
one held round cannot finish an 850+ HP beast. Wave-4 conversion on
this substrate is a TB-attrition phenomenon, not a village-party one.
1415Z blank 1 is answered: do not re-run this driver.

Wall (band vs control): national ever/final 8/8 / 6/8 (vs 7/8 / 6/8);
table invited/entered 7/8 / 5/8 (vs 4/8 / 3/8); wins 5/8, all lesser,
full seat 0/8 (vs 3/8); wave-4 reach 8/8 (vs 6/8); wave-5 0/8 both;
median 140d (vs 146d); deaths 312 (vs 286); starvation 1 both. The
band's wall numbers reproduce the landed partyfinish-a ARMED band
exactly — the new contribution is the wave-4 census on those
trajectories. The +26 deaths (incl. one won→lost flip, 75104) are
disclosed in the arm evidence, not hidden behind the win count.

Sense (75104 replay, wording evidence only — replay ends d144 vs the
judged row's d131): the village's wave-4 judgment reads like people
("beyond us… We outlast it"); sortie lines are honest (named
fighters, 6,258 kcal ration price stated, no kill promised). Disclosure:
the Herald titan-call line spams verbatim 33× over d108–d111 (up to
~17×/day) — narration-pass candidate, appended to the findings
backlog, not fixed here.

## Arm 2 — sim-fieldparty-form-a: DIAG-GO

No field party forms because the wild meeting's party input is never
fed — twice over:

1. Wild meetings read assignments, not the tile. `resolveWildMonsterEncounter`
   / `resolvePatrol` build allies solely from `this._outdoorCrew`
   (snapshot in `resolveAssignments` from patrol/scout/hunt/forage
   tasks). They never read `npcsOnNode(monster tile)`.
2. The snapshot is always empty on this band. Crew raw non-empty in
   0/1,272 meetings (all waves, all callers). The policy assigns only
   water/wood/garden/cook/fish — never an outdoor task.
3. Physical company is invisible to that code. In 14/24 judged wave-4
   meetings, ≥1 armed villager stood on the monster's own tile (up to
   5 in one meeting); fights were still solo. Village armed mean at
   meetings: 6.25.
4. The presence-aware join exists but is wired elsewhere.
   `party-wiring.js` `villagerFightAllies` (crew, then in-earshot,
   trust ≥15, cap 2) is called only by `expeditionMonster`, never by
   the wild/patrol routers. Corpus proof: all 58 allies>0 meetings
   and all 8 joined second fighters are expedition-channel;
   wild/patrol/raid/aid = 0 allies, 0 joins, ever.
5. No late joins either. The 24 meetings sit on just 11 distinct wave-4
   instances; the same beast is met up to 4 times, always solo, 0
   later-joins across all 9 multi-meeting groups. Every judged meeting
   ends in 1–2 rounds (vFlee 16, vDie 8; damage dealt 255 total).

Judged numbers: 24 wave-4 field meetings (75106: 15, 75108: 9;
prereg-literal resolve+patrol cut = 18, +6 aid-routed = 24, same
classification either way), all NO-CREW:RAW-EMPTY (14 TILE-ONLY /
10 TILE-EMPTY), formed 0, crew-could-form 0, tile-could-form 14
(secondary rate 0/14, never substituted for the primary). The
prereg's primary metric is therefore 0/0, undefined — not 0%: the
could-form condition never arises, and that vacuity IS the finding
one level up. Wave-3 contrast (82 meetings): same shape — crew 0/82,
joins 0/82 — so this is the wild path's shape at every wave.
Detgate PASS; parity EXACT vs the 1415Z demand corpus on all 8 seeds
× 9 fields.

Wall (this band): national ever 7/8, final 6/8; table invited 4/8,
entered 3/8; wins 3/8 (all lesser, full seat 0/8); wave-4 reach 6/8;
wave-5 0/8; median 146d; deaths 286; courtship combined 110.

Sense (75106, d90–d146 replay): villagers read like people judging a
fight they cannot win AND like a missing system, both at once —
mourning lines match corpus meetings exactly, but solo deaths are
announced with no join attempt and no "nobody came" beat. The absence
is silent, which is what a missing feed looks like from inside the
fiction.

## Metric review

- Arm 1: a bare party leg can pass on TB wins alone (party kills 2/2
  passed while field/sortie conversion stayed 0). The NEXT conversion
  prereg must pre-register field/sortie-channel kills as the deciding
  leg, not total kills.
- Arm 2: the prereg's crew-lens could-form definition returned 0/0.
  That was the correct outcome to report, not a bar to re-cut: the
  next arm's prereg must pre-register a FED-BUT-UNANSWERED class
  (e.g. trust <15) in advance, so a fed-but-refused meeting is
  classified rather than vanishing.
- Balance-panel compare has no census-ingest mode (standing exception
  as in 1415Z); paired census/parity tables are the §15 substitute.
  No artifact faked.

## Telemetry deviation check

Both corpora vs the scale-wall baseline: partyfinish 2 LOUD lines
(national 12→0, wins 16→0); fieldparty 3 LOUD lines (national 12→0,
table −75% 16→4, wins 16→0). All the known WINSEAT-regime +
field-shape artifact class: per-seed rows carry nationalEver/entered/
won, not top-level national/wins paths, and the baseline regime does
not match these instrument corpora. Actuals: partyfinish nationalEver
8/8, entered 5/8, wins 5/8; fieldparty nationalEver 7/8, entered 3/8,
wins 3/8. Baseline NOT rolled; no new investigation.

## Infrastructure

- Container .git write flap hit the second worktree registration
  (packed-refs.new EPERM, ~10 min) and the arm-1 prereg commit twice;
  both cleared on their own — no ref surgery. A dangling branch from
  the failed registration (tip = master tip, zero unique commits) was
  deleted only after the flap cleared and the tip was verified.
- Safe-commit index clobber hit all worker commits (repaired via
  HEAD-blob cacheinfo, hash-verified each time) and both coordinator
  merges' proof re-runs left timestamp-only churn in analysis.json
  (single `generated` line each), restored before merging.
- Both branches rebased clean in their own worktrees (zero file
  overlap with master moves: journey deepening r61 + the arm-1 merge);
  proofs re-ran green post-rebase (partyfinish VERDICT-GO: NO-GO
  reproduced exactly; fieldparty DIAG-GO with parity exact).
- check.js --quick NOT re-run: zero src/js, zero green-list files,
  standing 280/7 pre-existing profile recorded by prior runs.
- Master moved under the run (journey deepening r61, sibling B trees
  active); no interference either way.

## Convergence

scale-onramp stays converging (NOT converged): the wall is now
decomposed to a named missing feed — wild meetings never see the
party that is standing on the tile — and a named dead driver
(PARTYFINISH sortie gates cannot admit wave-4 beasts). Wins still
come only through default-OFF courtship + seat instruments, only
through the lesser seat, wave 5 still 0. The directive stands until
the tracker records this axis converged on measured evidence.

Next blanks, in order: (1) FEED THE WILD MEETING — wire
`villagerFightAllies` (or its tile/earshot logic) into
`resolveWildMonsterEncounter`/`resolvePatrol`, or put villagers on
outdoor assignments under a competent-like policy — GO = a fought
wave-4 field party on this seed band, baseline NO-CREW 24/24,
could-form 0/24, formed 0/24, tile-could-form 14/24, with a
pre-registered FED-BUT-UNANSWERED class; (2) re-think sortie gates /
held-round damage / the TB attrition channel itself, pre-registering
field/sortie-channel kills as the deciding leg; (3) veteran
survival/conversion (0.12 mean at 1415Z, both killers dead); (4) TB
attrition shape design look (steve-call candidate); (5) tricks-bar
revision in the next demand prereg. food-economy stays converging
(untouched; sibling B loop). Rotation left at 3 (convergence work
does not cycle it).

## Commits

- sim-partyfinish-band-a: 4da3f5680 prereg, 84bd92bb0 instruments,
  317433c3b corpus, 2ee77a1cf evidence — rebased to 86b436aae /
  958b2cd1d / 58b7c5da5 / 763c6cd48, merged --ff-only.
- sim-fieldparty-form-a: 8d52a77a0 prereg, ed4462565 instruments,
  50f037f92 evidence + corpus — rebased to d19f5660b / d0199585e /
  68a1bf70c, merged --ff-only.
- This record: coordinator commit (below). Merged locally, pending
  ship. No push, no bump, no live verification (ship-loop line).
