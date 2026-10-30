# sim-scale-onramp-round-0420 — coordinator evidence (run fleshout-20261030T0420Z)

Axis: scale-onramp (blocking axis, converging, NOT converged).
Loop B live on food-economy at run start (0230Z claim: raidname-fix +
woodshort-ledger, NOT touched) -> this run worked scale-onramp.
Direction from run fleshout-20261030T0320Z: the next arm must change
what a meeting is, not what a fight is — this round takes both of
the 0320Z round's ranked-next items. Both arms below are DIAG,
measurement only, zero src/js changes, no default flip.

Band (shared substrate, each arm its own corpus): seeds 75101–75108
(chainfinish) and 75101–75116 (w4meet), 180d death-aware,
tableseat-nowait substrate VERBATIM (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1). Each arm re-derived its
own before leg on current master; no shoutrec/w4shape band number
is quoted as current (finding #1457 substrate drift, honored).
Chainfinish's 8-seed corpus reproduces the w4shape corpus exactly
on wall/per-seed counts — the base did not move — but every number
below is cited as this run's own corpus.

## Arm 1 — sim-chainfinish-a: chain-finish / zero-dealt, wild shape (DIAG-NO-GO on one instrument sub-leg)

Commits: prereg b32400c4c, instruments 60304611f, evidence
6b57b329d. Worker evidence:
evidence/2026-10-29/sim-chainfinish-a.md + perseed-chainfinish-a/.

Question: finding #1462's ranked-next measurement — decompose the
zero-dealt class for wild wave-4 meetings and price how many
re-meetings finish each beast.

Verdict (binding prereg, no mid-run re-scoring): DIAG-NO-GO,
decided solely by one completeness sub-leg. The leg required
mDealt agreement across breakline/w4dpr/shoutrec at every wild
wave-4 row; it fails on 1 row (d74 audit: shoutrec roundTotals
final 36 vs final total 58; 85 rows band-wide). Root-caused, not
assumed: shoutrec roundTotals is a morale-entry snapshot series
(src/js/fieldFights.js: pushed "at morale entry, after the action
phase"), so a fight ending before the next morale entry never
records its final round. Prefix-consistency holds 368/368. Every
other leg passes: joins 975/975 with 0 errors,
breakline-vs-w4dpr mDealt agreement 975/975, OTHER = 0,
determinism PASS (seed 75102 byte-identical), sense PASS (11/11
wild logs read), fixtures PASS (35 checks). The NO-GO is an
instrument-leg miss, not a data miss — no judged number here uses
shoutrec final totals.

Findings, wild wave-4 only (n = 11, all seed 75102, days 55–79):
beast-zero 4/11 (36%), every one in exactly one class, OTHER = 0.
NARRATION-SUPPRESSED 2 (d57, d59, both eulogy — the fighter
"contradicts the narration" instead of striking) and
NO-USABLE-WEAPON 2 (d67 algorithm, sling no arrows; d71 algorithm,
bow no arrows — ranged-only fighters with no melee fallback).
Pre-contact classes 0, turn-consumed-other 0,
strike-without-damage 0. Leader-zero-ally-positive 0 — defined and
checked; every zero is a whole-fight zero (allyDealt 0 in all
four). Disclosure: all four zeros are overdetermined (d59 also
arrowless, d67 also a Rage turn, d71 also a medicine turn);
first-match priority decides the label, not exclusive causation.

Per-beast chains (wild universe only; wounds persist exactly — no
healing break, no HP discontinuity in any chain):
- Eulogy n = 4, dealt [23, 24, 0, 0], remaining 853 HP — 75 more
  meetings at median 11.5, 36 at best 24.
- Algorithm n = 4, dealt [29, 0, 12, 0], remaining 959 HP — 160
  more at median 6, 34 at best 29.
- Audit, herald, reunion n = 1 each (remaining 1008 / 679 / 1185
  HP) — correctly unpriced (n < 2 rule). Caveat: the wild audit
  chain opens at 1,066 HP because the d73 raid audit meeting
  (outside the universe) closed there.

Re-meeting frequency: gaps 1, 1, 1, 2, 2, 3 days (median 1.5);
eulogy 4 meetings in 5 days, algorithm 4 in 7. The chain recurs in
days, but the finish is a fantasy at current rates: seed 75102's
village dies day 86, seven days after the last wave-4 meeting.
At observed paces the eulogy's 75 median-rate meetings need ~94
days, the algorithm's 160 need ~280 days. Supplementary arithmetic
(not a judged leg): even with every zero meeting replaced by its
chain's non-zero median, prices stay 37 (eulogy) and 47
(algorithm) — eliminating zeros alone does not close a chain;
per-hit damage scale binds.

Ranked next (worker, no behavior built here): (1) chain-close
target — price per-meeting damage that closes a chain inside a
village lifetime (~41/meeting for the eulogy over the 27 days from
d59 to the d86 loss, vs median 11.5 / best 24); (2) zero-cause
exclusivity probe — vary one factor at a time (arrowed fighter vs
eulogy; melee fighter on Rage turns); (3) join effectiveness at
wave-4 scale (joined wild fights add 6/5/4 vs 853–1,008 HP);
(4) raid shape still INSUFFICIENT-DATA (n = 2); (5) ammo (6/11
wild logs no-arrows, 0 volleys) — real gap, but not the front
door (prices stay 37/47 with zeros removed).

## Arm 2 — sim-w4meet-a: wave-4 meeting-shape census (DIAG-NO-GO on one taxonomy leg)

Commits (rebased onto 6b57b329d after the chainfinish merge;
analyzer re-run post-rebase reproduces the verdict exactly:
COMPLETENESS=FAIL, FIXTURES=PASS, wall numbers identical):
prereg 1429abaf9, instruments 472522db8, instrument fix
67ce7b400, evidence 47c9e9712. Worker evidence:
evidence/2026-10-29/sim-w4meet-a.md + perseed-w4meet-a/.

Question: the meeting-shape question — who meets wave-4 monsters,
alone or warned, and whether readiness bars should gate the
MEETING rather than the wave.

Verdict (binding prereg, no mid-run re-scoring): DIAG-NO-GO,
decided by exactly one leg. The outcome-taxonomy completeness leg
(OTHER = 0) fails with exactly one row — a NAMED discovery, the
first wave-4 expedition EVADE (75110 d51, Ellis vs Eater, "Ellis
saw The Eater in time and gave it room"). Every other leg PASSES:
16/16 seeds, joins 2248/2248 with 0 errors, determinism PASS
(75102 byte-identical), sense PASS (all 20 fought logs read end
to end + the evade line), fixtures PASS (32 checks), shape
taxonomy OTHER = 0, unlock-vs-contact pair reported. The
one-line fix (add a PRE-CONTACT-EVADE class) is proposed under
"metric review" for the next run, not applied retroactively.

Findings (this corpus only — never quote w4shape's band):
universe 21 wave-4 meetings: wild 16 / raid 4 / other 1; fought
20, kills 0, FLEE 12, DEATH 8, EVADE 1. 39 rounds, 405 dealt vs
1,568 taken.
- Unlock vs contact per seed: unlock 9/16, contact 5/16 (75102:
  13 meetings; 75110: 2; 75113: 3; 75114: 1; 75116: 2).
  Clustering is a heavy tail, not a one-seed fluke — but 4 unlock
  seeds still never meet wave 4.
- Who meets: crew size 0 at all 21 meetings (no expedition party
  exists to enlarge); solo-tile 6 (1 death in 5 fought),
  tile-mates-not-joined 10 (6 deaths — deadliest seat), joined 5
  (1 death; ally damage 6, 5, 4, 6, 3 vs 618–1,088 HP). Fighters
  armed 21/21, armorP 3–60, wave-3 veterans 0/21.
- Warned: 8/21 warned (wild 8/16, raid 0/4, other 0/1); W1
  prior-type 8, W2 counter-known 2, W3 same-wounded-individual
  re-meet 7 — all warned meetings on the 75102 chain. Every new
  seed's first meeting is unwarned. Caveat carried verbatim:
  scout sightings, rumors, pre-contact shouts are unmeasured by
  the recorders, so "unwarned" means no prior-type contact and no
  counter knowledge in the corpus, not zero warning in fiction.
- Readiness-gate counterfactual (demand live from standing.js:
  armored 3 @P>=10, armed 5, tricks 3, veterans 1): a full-demand
  meeting-gate blocks 14/21 (wild 11, raid 3) — veterans short in
  all 14 blocked, tricks short in 0 — and would avoid 7 deaths +
  7 flights but produce 0 wins, because the 7 let-through
  meetings also end 0 kills (5 FLEE, 1 DEATH, 1 evade). Raid
  blocked meetings (3) are not avoidable by staying home — the
  beast comes to the village — so a raid-gate needs a Steve-call
  on what happens to the raid instead.
- Base stability: the first 8 seeds reproduce the w4shape corpus
  exactly (75102: 86 days, 13 wave-4 meetings) — new findings
  come from the wider band, not drift. W3 wound-continuity
  corrects the old chain count: the 75102 algorithm chain is 2
  individuals, not 1; band total 14 individuals / 21 meetings.

Ranked next (worker, no behavior built here): (1) evade taxonomy
fix + evade-as-shape measurement; (2) meeting-gate Steve-call
(loss-avoider, not win-maker; raid meaning unresolved);
(3) below-floor arrivals instrument — 3 first-meetings below def
HP floor (75113 eulogy 675, 75116 audit 825, 75113 influencer
637), a possible off-corpus wounding channel; (4)
tile-mates-fare-worst + crew-empty; (5) raid shape stays
insufficient-data (n = 4), counts only.

## Wall numbers (both corpora)

Chainfinish band (8 seeds, identical to the 0320Z band): won 6/8,
all lesser seats (full 0). National ever 6/8, national final
6/8. Table reached 7/8, entered 6/8. Wave reach: 1: 8/8, 2: 8/8,
3: 7/8, 4: 5/8, 5: 0/8. Median survival 114d (upper-middle
convention; statistical median 107.5d). Deaths 232, starvation 2.
Death causes: villager:combat 90, villager:villager combat 73,
player:the wild 23, villager:expedition 15, villager:monster 11,
rest small.

W4meet band (16 seeds): won 9/16, all lesser (full 0). National
ever 13/16, final 11/16. Table 12/16, entered 9/16. Wave reach:
1: 16/16, 2: 16/16, 3: 14/16, 4: 9/16, 5: 0/16. Median survival
118d upper-middle (statistical 116.5d). Deaths 527, starvation 3.

## Reachability verdict

Waves 1–4 reachable as unlocks; wave 5 reached 0/24 seeds across
both bands, full seat 0/24. Wave-4 contact is the narrower gate
(unlock 9/16 vs contact 5/16 on the wide band), and wave-4 kills
are 0/21 meetings on the wide band, 0/13 on the narrow band. The
scale wall is now a meeting-and-chain question, not a fight
question: the same wounded beasts recur within days but need
36–160 more meetings to finish at observed damage; a
readiness-gated meeting rule would avoid deaths without producing
a single win; and the one observed pre-contact evade is the only
meeting that ends without a fight at all.

## Village assessment (plain words)

Picture a village that holds together and wins through the lesser
seat, but whose fighters keep meeting monsters they cannot finish.
The same five beasts come back again and again, wounded but never
dead, because every meeting shaves off a sliver — about eleven
points of damage against eight hundred and fifty health left — and
some meetings shave off nothing at all: the fighter argues with
the story instead of striking, or draws a bow with no arrows.
The beasts come back within a day or two, so the village gets
plenty of second chances, but it would need dozens of them, and
the village itself only lives about a hundred days. When a
fighter does meet a beast, they are usually alone even when
neighbors stand on the same ground — and neighbors standing by
without joining is the deadliest seat of all. Once, a villager saw
the beast in time and simply gave it room — the only meeting in
twenty-one that ended without a fight, and the only one nobody
lost. Nobody starves on this band. They die in combat, or in
fights with each other, while the full seat stays empty and the
fifth wave stays unmet.

## Sense notes (transcripts read, not just counted)

Chainfinish: 11/11 wild wave-4 logs read. The narration-suppressed
turns read as the fighter contradicting the narration rather than
fighting — a blank, not a lie: no in-band transcript shows a
successful interrupt dealing damage (Steve-call candidate whether
such turns should ever deal damage). The no-arrow lines read
plainly ("the string stays drawn, useless") and recur across
fighters, not one fighter's quirk — but w4meet's wider band
qualifies this: no no-arrow lines on the new seeds, so the ammo
gap is a 75102-fighter artifact, not band-wide. W4meet: all 20
fought logs read end to end + the evade line. The evade reads as
genuinely sensible pre-contact behavior — the first observed
meeting that ends by avoidance rather than by flight or death.

## Blanks filled or documented

- FILLED (measurement): zero-dealt decomposition for wild wave-4
  meetings — 2/2 split (narration-suppressed / no-usable-weapon),
  overdetermination disclosed.
- FILLED (measurement): per-beast chain pricing — finishes are
  36–160 meetings out at observed rates; zeros alone do not
  explain the gap (37/47 with zeros replaced).
- FILLED (measurement): wave-4 meeting census on a 16-seed band —
  warned split, party/crew shape, readiness-gate counterfactual
  (loss-avoider, 0 wins).
- DOCUMENTED (not built): shoutrec roundTotals lag semantics —
  morale-entry snapshot series, final round unrecorded when a
  fight ends before the next morale entry; evade taxonomy gap
  (first wave-4 expedition evade); below-floor first-meeting
  arrivals (possible off-corpus wounding channel); raid-gate
  meaning (Steve-call); narration-turn damage question
  (Steve-call candidate); tile-mates-fare-worst + crew-empty.
- Raid shape stays insufficient-data on both bands (n = 2 narrow,
  n = 4 wide) — counts only, no judgment.

## Metric review (nothing re-scored this run)

- CHAINFINISH revision for the NEXT run: replace the shoutrec
  final-total agreement sub-leg with (bl == dp final agreement)
  + (shoutrec prefix-consistency). Sensitivity (labeled, NOT the
  verdict): the instrument verdict would move to DIAG-GO with no
  substance reading changed. The binding DIAG-NO-GO stands.
- W4MEET revision for the NEXT run: add a PRE-CONTACT-EVADE class
  to the outcome taxonomy before any judged analysis. The single
  evade row would then classify, moving the instrument verdict to
  DIAG-GO with no substance reading changed. The binding
  DIAG-NO-GO stands.
- COORDINATOR note: telemetry-check does NOT brace-expand its
  --current glob (it readdirs the literal brace path) — the
  0320Z-style single quoted brace glob fails; run once per corpus.
  Future coordinator evidence should record the per-corpus
  invocations, not the brace form.

## Telemetry deviation check

W4meet corpus (16 seeds): QUIET — 16 seed rows, 1 non-row file
skipped, 4 metrics, no large deviations. Chainfinish corpus
(8 seeds): ONE LOUD line — wins swung -62%, baseline 16 ->
current 6. VERDICT: explained, KNOWN WINSEAT-baseline regime
artifact (same line, same band, same numbers as the 0320Z round;
the baseline file itself labels its regime "winseat — full
win-side win stack, ~100%-win suite" and warns "DO NOT compare
pre-seat / courtship / readiness substrates against this
baseline — wins are structurally ~0 there and telemetry-check
will fire a spurious LOUD 'wins disappeared'"). This band is a
tableseat-nowait substrate, not the winseat stack. Baseline NOT
rolled. Table + exiled clean on both corpora.

## Infrastructure

- Head moved mid-run twice: (1) my own chainfinish merge
  (6b57b329d) moved master under the still-running w4meet branch
  — rebased cleanly (4/4, no conflicts), analyzer re-run
  post-rebase reproduces the verdict exactly (COMPLETENESS=FAIL,
  FIXTURES=PASS, wall numbers identical); (2) a sibling
  playtest-loop merge (journey establishment r61, 23d8cfd7b)
  landed on master during the run — picked up by the same
  rebase, no conflicts, no sibling files touched.
- Stray file: the w4meet evidence commit carried
  sweep-w4meet-a.log (run output, 38 lines) at the repo root.
  Removed by cleanup commit eed07264 (1 file, 38 deletions).
  Safe-commit index clobber hit that cleanup commit (staged-add
  variant: index re-added the removed file after commit) —
  repaired via `git update-index --force-remove`, commit
  verified correct, main tree clean.
- Safe-commit index clobber also hit all worker commits (both
  workers repaired via HEAD-blob cacheinfo, commits verified
  correct, never reset/forced).
- Sibling trees untouched throughout (sim-raidnamefix-b,
  sim-woodshortledger-b, sim-lackingline3-b, journey2-endgame,
  journey-establishment). Reap at run start removed nothing;
  LOUD dirty trees (sim-raidnamefix-b, journey2-endgame) are
  their owners' to commit or release.
- No safe-commit refusal, no merge conflict, no force, no push,
  no bump. Both arm test suites re-run green on final master
  (chainfinish 35/35 fixtures, w4meet 32/32 fixtures; w4meet
  analyzer exit = its taxonomy verdict, reproduced).

## Convergence state

scale-onramp stays converging (NOT converged): two more gap
classes priced out by measurement — chains do not finish (36–160
meetings out) and a meeting-gate avoids losses without making a
win — but full seat 0, wave-5 reach 0, wave-4 kills 0 across both
bands. The next arm on this axis is the evade-as-shape
measurement (taxonomy fix first) or the chain-close target
(~41/meeting damage inside a village lifetime), not another
fight-price arm. food-economy stays converging (untouched;
sibling loop B lane). Claim deleted; lock deleted.
Merged locally, pending ship.
