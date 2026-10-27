# sim-finalloss-rebase-a — re-baseline evidence (run fleshout-20261027T0755Z)

## Verdict: DIAG-GO

All three pre-registered legs hold, judged only against
`evidence/2026-10-27/sim-finalloss-rebase-a-prereg.md`:

1. **Every selected new known instance re-derives** in this rerun
   (same seed/day/origin-maxHp, classified the same way under
   the tightened F9) — see the re-derivation table below.
2. **Every final-loss case in this corpus is classified inside
   F1–F13** — 16/16, with zero forced causes and zero
   UNEXPLAINED/UNOBSERVABLE cases in the census.
3. **All instrument gates pass** — G1 det-gate PASS, G2
   recorder neutrality 8/8, cost bar PASS, cross-checks
   (a)–(f) PASS on all 8 seeds.

The retired old instances (seq51/73672 day 148, seq45/73673
day 112) are NOT re-derived and are NOT claimed: the adopt arm
proved them unreachable on current master, and this arm
replaces them rather than substituting near-misses. The new
known-instance set is now the baseline for any future
final-loss arm: it re-derives deterministically on current
master (same fightIds, same seqs, same verdicts as the adopt
corpus).

## Re-baseline adoption

This arm re-baselines the adopt arm sim-finalloss-adopt-a
(run fleshout-20261027T0615Z). It adopts the adopt prereg's
F1–F13 cause set, classification definitions, gates, cost bar,
and cross-checks, with exactly the adaptations listed in the
rebase prereg (run/arm identity, known instances replaced,
F9 tightened, replication judge replaced by the adopt band).
The dead prereg preserved at
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-finalloss-a-prereg-preserved-20261027.md`
was READ and never modified. DIAG / MEASUREMENT ONLY: zero
`src/js` changes, no recorder edits, no new game code. The
TB CHANNEL RESET (whether a turn-based fight should inherit
wounds from the open-field fight) is a STEVE-CALL design
question: traced only, never proposed as a lever. The Haven
pile-up intended-behavior question is documented only — NO
restore-rule change. The F1 blocked-restore narration silence
is reported as a finding, not fixed in this arm.

## Prereg correction (recorded honestly, does not change the verdict)

The rebase prereg's K2 line misstated the adopt corpus's
day-169 final: it named the chain's FIRST fight
(fmgpspizt_ebynzg) and chain length 1. The adopt corpus's
actual day-169 final is fight fmgpspj04_6rwvac, chain length
3 (fights fmgpspizt_ebynzg, fmgpspizy_1ywlm2,
fmgpspj04_6rwvac), verdict RESTORED (F6). The rerun
reproduces that exact final (same fightId, same chain,
same verdict). K2's binding identity — (seed 73675, day 169,
origin maxHp 1200) — was correct throughout, and the
correction is to the prereg's citation detail, not to the
instance. Future arms should cite K2 as fmgpspj04_6rwvac,
chain 3. (This is also the fight that ends the day-168
lift under the tightened F9 — see below.)

## Replication gate: PASS (exact)

Plain replication FIRST, before any classification, matches
the adopt band on every field — the STOP condition did not
fire:

| field | adopt band (judge) | this baseline | this armed |
|---|---|---|---|
| wins | 4/8 | 4/8 | 4/8 |
| national-ever | 7/8 | 7/8 | 7/8 |
| national-final | 5/8 | 5/8 | 5/8 |
| table invited | 5/8 | 5/8 | 5/8 |
| table entered | 4/8 | 4/8 | 4/8 |
| wave-4 reached | 5/8 | 5/8 | 5/8 |
| wave-5 reached | 0/8 | 0/8 | 0/8 |
| median survival | 130d | 130d | 130d |
| deaths | 284 | 284 | 284 |
| starvation deaths | 2 | 2 | 2 |

Per-seed (baseline = armed on every seed): 73671 180d
survived wave-4 regional; 73672 118d won wave-4 global;
73673 32d village-lost wave-3 village; 73674 118d won
wave-3 national; 73675 169d village-lost wave-4 global;
73676 144d won wave-4 national; 73677 130d won wave-4
global; 73678 122d village-lost wave-3 regional.
Against the 1920 band the diff is unchanged from the adopt
arm (wins +2, national-ever +1, national-final 0, table +1,
entered +2, wave-4 −1, wave-5 0, median −22d, deaths −23,
starvation +1) — base movement since 1920, reported, never
absorbed.

## Per-instance re-derivation table (the DIAG-GO leg 1)

Seq numbers below are the rerun's reported values; they
match the adopt corpus exactly (no renumbering on this base).

| instance | identity (seed, day, origin maxHp) | rerun seq / id | rerun final fightId | rerun verdict | adopt verdict |
|---|---|---|---|---|---|
| K1 — F1 Haven pile-up | 73671, 167, 150 | seq 27 / moderator | fmgpspj1c_dx2n6n | BLOCKED (F1) | BLOCKED (F1) |
| K2 — RESTORED-exact | 73675, 169, 1200 | seq 38 / reunion | fmgpspj04_6rwvac | RESTORED (F6) | RESTORED (F6) |
| K3 — REMOVED-AFTERWARDS | 73677, 112, 850 | seq 39 / influencer | fmgpspijb_4ilh19 | REMOVED-AFTERWARDS (F8) | REMOVED-AFTERWARDS (F8) |

K1 detail: origin tile (4,4) — the Haven tile — occupied at
restore time by reunion (seq 47, 900 HP); the day-167
three-way Haven pile-up (moderator + reunion + chorus_line)
reproduces exactly. K2 detail: restored at 1200 HP, present
at the post-run count; it is the terminal fight of the
reunion day-167/168/169 saga. K3 detail: restored at 388 HP
to the Haven tile, lifted the same day, re-fight ends won
(fmgpspijk_flgohj) — killed in the re-fight. K3 is
explicitly NOT the retired known instance: different seed
(73677, not 73672), different day (112, not 148); the shared
id/maxHp (influencer/850) is a roster coincidence.

## Wall numbers

| | baseline | armed |
|---|---|---|
| national-ever / final | 7/8 / 5/8 | 7/8 / 5/8 |
| table invited / entered | 5/8 / 4/8 | 5/8 / 4/8 |
| wins | 4/8 | 4/8 |
| wave-4 / wave-5 | 5/8 / 0/8 | 5/8 / 0/8 |
| wave-4 kills (nonworldkill, wave 4) | — (snapshot) | 2 total (73671: 1, 73677: 1, rest 0) |
| median survival | 130d | 130d |
| deaths | 284 | 284 |

Death-cause shares (baseline corpus, 284 deaths; armed total
identical): villager combat 43.3%, villager-vs-villager
combat 24.6%, player arena 12.0%, villager expedition 7.0%,
villager sickness 3.5%, wound that wouldn't close 2.5%,
ambush 2.1%, villager monster 1.8%, starvation 0.7% (2
deaths: one villager, one player), dehydration 0.7%, and
five single deaths (lockjaw, The Redactor, The
Congregation, player contest, alien) at ~0.4% each. Two
seeds reached global rank without a table invitation
(73675) or without entering after invitation (73678) — rank
alone does not seat a village. The scale wall stands
unchanged on this base: wave-5 0/8, table entered 4/8,
wins 4/8 — the same band the adopt arm measured.

## Classified final-loss table (16 cases, all classified)

Verdict counts under the TIGHTENED F9: RESTORED (F6) 7,
BLOCKED (F1) 6, REMOVED-AFTERWARDS (F8) 3,
LIFTED-WITHOUT-TBEND (F9) 0, THROWN (F7) 0,
FINAL-ROW-EXPECTED (F10) 0, UNEXPLAINED (F11/F12) 0,
MISMATCH (F13) 0. Old-definition F9 count: 1 (the day-168
reunion case, reclassified below). Every RESTORED case
matched its predicted HP and tile exactly; no post-present
mismatch occurred anywhere.

### Seed 73671 (7 finals; survived 180d, wave 4, regional)

| monster | day | verdict | what happened |
|---|---|---|---|
| buffering (seq23) | 74 | RESTORED (F6) | Restored at 32 HP to the Haven tile; present at the day-74 count. |
| eulogy (seq43) | 138 | RESTORED (F6) | Restored at 612 HP; present at the day-138 count. |
| eulogy (seq43) | 139 | RESTORED (F6) | Restored at 900 HP; present at the day-139 count. |
| eulogy (seq43) | 140 | REMOVED-AFTERWARDS (F8) | Restored at 663 HP, then removed by the monster-turn lost-trail despawn (game.js "sounds fade", lostSight > 6). |
| moderator (seq27) | 167 | BLOCKED (F1) — K1 | Origin tile (4,4) occupied by reunion (seq47, 900 HP). No restore written; absent at the count. |
| reunion (seq47) | 167 | BLOCKED (F1) | Same Haven pile-up: origin tile occupied by chorus_line (seq51, 225 HP). |
| chorus_line (seq51) | 167 | REMOVED-AFTERWARDS (F8) | Restored at 243 HP, lifted for a new fight the same day; day-168 fight ends won — killed in the re-fight. |

### Seed 73675 (6 finals; village-lost 169d, wave 4, global)

| monster | day | verdict | what happened |
|---|---|---|---|
| eater (seq28) | 145 | BLOCKED (F1) | Origin tile (4,4) occupied at restore time; absent at the count. |
| eulogy (seq31) | 145 | BLOCKED (F1) | Same Haven pile-up on (4,4). |
| suburb (seq36) | 167 | BLOCKED (F1) | Same Haven pile-up on (4,4). |
| reunion (seq38) | 167 | RESTORED (F6) | Restored at 1184 HP; present at the day-167 count. |
| reunion (seq38) | 168 | RESTORED (F6) — tightened-F9 reclassification | See the tightened-F9 note below. Old-definition F9; under the tightened definition this is a delayed RESTORED. |
| reunion (seq38) | 169 | RESTORED (F6) — K2 | Third day running: restored at 1200 HP; present at the post-run count. Final fight fmgpspj04_6rwvac, chain 3. |

### Seed 73677 (2 finals; won 130d, wave 4, global)

| monster | day | verdict | what happened |
|---|---|---|---|
| influencer (seq39) | 112 | REMOVED-AFTERWARDS (F8) — K3 | Restored at 388 HP, lifted the same day, re-fight ends won — killed in the re-fight. |
| suburb (seq42) | 123 | BLOCKED (F1) | Origin tile (4,4) occupied by redactor (seq43, 195 HP). |

### Seed 73678 (1 final; village-lost 122d, wave 3, regional)

| monster | day | verdict | what happened |
|---|---|---|---|
| terms_of_service (seq45) | 121 | RESTORED (F6) | Restored at 267 HP; present at the day-121 count. |

### Seeds with no finals

73672 (6 chains, all won), 73673 (0 chains), 73674 (2 chains,
none final-lost), 73676 (1 chain, none final-lost). A chain
that ends won is not a final loss and is not counted here.

### The tightened-F9 note (seed 73675, reunion seq38, day 168)

Under the old definition this was the corpus's only F9:
lifted day 169 (removal rowIdx 52, startCombat) with no
fight-end row before the verdict tick (day-169 count).
Under the tightened definition it is NOT F9: the lift's
fight — fmgpspj04_6rwvac, day 169 — ends lost and restores
the monster at 1200 HP, visible in the post-run count, and
that fight is itself K2's final fight. So the day-168 case
reads as a delayed RESTORED (F6), flagged `oldF9` in the
corpus for traceability. Under the tightened definition
this corpus holds 0 F9, exactly as the adopt finding
predicted. No lift in this corpus ends without a fight-end
row before the next count.

### What did not fire

No restore ever threw (F7: 0). No final row was a
"should never have restored" case (F10: 0 — no F3/F4
finals). No case was left unexplained (F11/F12: 0) or
mismatched (F13: 0). All six F1 cases are the same shape:
lingering monsters pinned to the single Haven tile, so the
first one restored blocks the rest — the Haven pile-up
remains the dominant final-loss mechanism (6/16), a
consequence of the havenGrowth nightly re-pin plus the
origin-tile occupancy check, both existing systems, neither
touched here. Whether that pile-up is intended behavior is
documented only (Steve-call territory if it touches the
restore rule).

## Gates and cross-checks

- G1 det-gate: PASS (seed 73671: baseline 180d/181
  gameDays, wrapped 180d/181 gameDays, tsNationalDay 91
  both, diagSurface false, wrapsInstalled false, gapTicks
  0, finRows 0). Fresh record from this sweep.
- G2 recorder neutrality: PASS 8/8 (days, gameDays,
  tsNationalDay, faced-map, and kill-log identical baseline
  vs armed on every seed).
- Cost bar: PASS (armed starvation 2 <= baseline 2 + 2;
  armed median 130d >= 0.8 x baseline 130d).
- (a) w4dmg wave-4 field rows == wave4enc wave-4 field rows
  per seed: PASS on all 8 seeds (73671: 4=4, 73672: 2=2,
  73673: 0=0, 73674: 0=0, 73675: 1=1, 73676: 0=0, 73677:
  1=1, 73678: 0=0).
- (b) w4dmg tb rows join to nonworldkill starts (wave 4)
  minus named unjoined: PASS, unjoined 0 on all seeds.
- (c) source-sum identity on every w4dmg field row: PASS,
  sumFail 0.
- (d) recorder errors zero and overflow zero (all
  recorders including finalloss): PASS, diagErrs 0,
  overflow 0 on all seeds.
- (e) every finalloss tbEnd row with a fightId joins to a
  nonworldkill start or w4dmg tbEnd: PASS, finUnjoined 0
  on all seeds.
- (f) seq51gap tick gaps per seed: listed in the corpus
  rows; no gap inside a known-instance day (K1 day 167,
  K2 day 169, K3 day 112 all have their verdict ticks).
  The stale-tick mechanism fired on the 73675 reunion saga
  (staleTickSkipped 1 on the day-168 case) and skipping it
  is what keeps that verdict correct.

Proof: `scripts/test-finalloss-rebase-a.js` — 131 PASS, 0
FAIL over the corpus files (bands, G2, cross-checks,
finals, known-instance re-derivation with seq/id/verdict
assertions, verdict rule). Detail reproduction: the sweep's
`--detail` mode was not re-run here because the proof
re-derives every summary number from the corpus rows with
the sweep module's own pure functions; the corpus itself is
the reproduction artifact (identical fightIds to the adopt
corpus on all three known instances).

## Village assessment, in plain words

The villages in this corpus are not dying to a mysterious
vanishing monster — that question is now closed on current
master, with a re-derivable baseline to prove it. They die
the way villages die: in fights (two-thirds of all deaths
are combat of one kind or another), on expeditions, and —
on the two short runs — by falling apart when the pantry
runs dry. Four of eight villages win outright, and a fifth
reaches the top rank without ever being invited to the
table: being the strongest village in the world does not
guarantee a seat.

The final-loss question itself now has ordinary answers
every time, and the answers are stable across two
independent sweeps: six monsters never actually restored
because another monster was already standing on the spot
they would return to (the Haven tile, where lingering
monsters all pile up); seven came back exactly as the
rules say they should and were still there at the next
count; three came back, were fought again, and were killed
in that re-fight — gone, but for a reason you can watch.
Nothing in this corpus is a monster that simply blinks out
with no trace. The one case that once looked like a
blink-out (the day-168 reunion lift) turns out, under the
tightened definition, to be a monster that came back in
the next fight — the snapshot just caught it mid-lift.

## Sense section (opportunistic, NON-MEASURED, never census)

From a narration-on replay of seed 73675
(`evidence/2026-10-27/sim-finalloss-rebase-a-sense-73675.txt`).
This replay is not a measurement and nothing here enters
the census; its header warns that narration shifts
trajectories, and indeed its own finalloss verdicts differ
from the census (one UNEXPLAINED F12 in the replay vs zero
in the census) — that divergence is a property of the
narration-on trajectory, not a census finding, and it is
reported here so no reader mistakes the replay's verdicts
for measured ones.

What a player watching the K2 saga would see: the Reunion
keeps coming back, fight after fight, mirroring the
player's own moves back at them ("Faces surface on its
body — your own snarl. It knows 'strike' — it watched you
do it 2 times. YOUR MOVE, back at you."). The fights play
out blow-by-blow, never as a blink-out. Villagers act like
people in the tail: when Gonzalo Chambi dies on day 168,
Meera looks at the new bearer and says, "You're not
Gonzalo" — no heat, just fact — and the mantle passes to
Nina Petrova with the System's own startled grief ("We
hardly noticed. (That is a lie. We noticed. The audience
CRIED.)"). The village's end on day 169 is coherent human
ending, not a mechanical fizzle: "No one is left to pick
up the Codex. The village dies out — quietly, the way
villages do."

## Metric review (MEASUREMENT.md §14)

The pre-registered metrics bound this run, and this run
reports against them without revision. Three notes for the
NEXT run:

1. **Prereg citation hygiene.** The K2 fightId/chain-length
   misstatement (first fight cited instead of the final)
   shows that known-instance citations must be checked
   against the adopt summary's finals rows, not against
   the narrative table's shorthand. The triple identity
   (seed, day, maxHp) saved the instance; future preregs
   should cite the final fightId from the corpus file and
   have the proof assert it (this proof already asserts
   seq/id/verdict; adding a fightId assertion for each
   known instance would have caught the misstatement
   before the sweep).
2. **Tightened F9 validated.** The tightened definition
   behaves as predicted: old-F9 1 becomes delayed-RESTORED,
   new-F9 0, and no other verdict moves. The tightened
   definition should stand as the definition for future
   final-loss arms; the `oldF9` flag keeps the old count
   traceable for one more run, then can be dropped.
3. **The Haven pile-up is now the standing final-loss
   story (6/16, twice running).** Whether the pile-up is
   intended behavior remains a documented-only question
   (Steve-call if it touches the restore rule). The F1
   narration silence — a blocked restore has no line at
   all, the monster simply never comes back — remains the
   one genuinely silent case and the only sense-level gap
   in an otherwise fully traced mechanism. It is a finding
   to report, not something this measurement arm fixes.

## Comparison-of-record note

The balanced panel has no corpus-ingest mode, so paired
identical-seed tables (baseline vs armed, same seeds, same
policy) are the comparison of record for this arm. No panel
file was faked, and telemetry-check was not run on
recorder rows.

## What could not be measured, and why

- The retired old instances (seq51/73672 day 148, seq45/
  73673 day 112): unmeasurable on current master because
  the runs end at days 118 and 32. Deliberately retired by
  the re-baseline, not dropped silently.
- F3/F4/F7/F10/F11/F12/F13 mechanisms: zero occurrences
  in this corpus, so their behavior on current master is
  unobserved here, not disproven. In particular the
  restore-throw path (F7) never fired; whether it can fire
  at all remains untested by this corpus.
- The TB CHANNEL RESET question: traced only, per the
  DIAG-only bound. This report takes no position on
  whether turn-based fights should inherit field wounds,
  and proposes no lever. That question belongs to Steve.

## Files

- Evidence (this file):
  `evidence/2026-10-27/sim-finalloss-rebase-a.md`
- Pre-registration (committed BEFORE sweeping):
  `evidence/2026-10-27/sim-finalloss-rebase-a-prereg.md`
- Corpus (16 rows + det-gate + summary):
  `evidence/2026-10-27/perseed-finalloss-rebase-a/`
- Sweep + analyzer (adopt sweep copied, renamed, tightened
  F9 + K1/K2/K3 known logic):
  `scripts/test-finalloss-rebase-a-sweep.js`
- Proof script (131 PASS, 0 FAIL):
  `scripts/test-finalloss-rebase-a.js`
- Sense replay (non-measured):
  `evidence/2026-10-27/sim-finalloss-rebase-a-sense-73675.txt`
- Branch: `sim-finalloss-rebase` (commits below; no push,
  no bump, no live verification — coordinator merges
  via --ff-only).
