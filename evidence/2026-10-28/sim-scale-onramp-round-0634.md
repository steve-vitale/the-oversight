# sim-scale-onramp round 0634 — coordinator evidence (run fleshout-20261028T0634Z)

Axis: scale-onramp (the blocking axis, converging, NOT converged).
Sibling loop B live on food-economy the whole run (0630Z run landed
mid-run as 51757f233: divedeep boundary fix, caughtlift trust
booking, barwhy why-visible — NOT touched, no file overlap with
any arm here). Gating freeze stands (Steve 2026-10-27): no arm
touched gating or deed bars. No push, no bump, no live
verification (ship-loop line). Merged locally, pending ship.

Plain words first. Three blanks from the 0527Z review, worked in
order. (1) The village now marches out to wounded beasts on the
treeline — and still finishes nobody in the field, because a
broken beast is allowed to walk away instead of dying. That is
the mechanism to fix next, not a policy failure. (2) The book
was wrong about the Relay seat's door, not the game: the game
never asked for a System-relationship score at the door, only
for the integration stage or the relay office, and the book now
says so. (3) A turn-based fight never grows a monster's health
ceiling: the scary 3688-health example was already that big
when the fight started, because overtime scaling had already
applied before the first blow. The full seat is still 0 and
wave 5 still unlocks nowhere on these bands — the wall stands,
but two of its readings are now corrected and one of its
mechanisms is named.

## The village, assessed

On the tableseat-nowait substrate (seeds 75101-75108, 180 days),
villages mostly reach national standing and often sit the lesser
seat, but the full seat never opens: the veterans bar needs two
living wave-4 killers at once, and kills remain rare and
solitary. The tbovertime band: national ever/final 7/8 / 6/8,
table invited/entered 4/8 / 3/8, wins 3/8 (3 lesser / 0 full),
wave-4 reach 6/8, wave-5 0/8, median survival 146 days. The
lingerfinish armed band flips two lost villages to won and one
survived village to won (wins 3 -> 5), and 75101 reaches wave 5
for the first time on this band — but those wins are NOT a GO
leg in that arm's prereg and are NOT re-scored into one here.
Who thrived: scholars who fought wounded world monsters at
their wounded health (the world-HP rule, landed 0527Z) — two
wave-4 turn-based fights were won on the tbovertime band. Who
died and why: the one recorded wave-4 killer of the previous
round died before run end, and on this round's bands the
scholar remains the only finishing channel — villagers finish
nothing in the field (see arm 1). What knowledge/capability
was missing: a field-finishing mechanism (a broken beast must
be finishable, not just frightenable), party formation and
gearing intelligence for wave-4 attempts (see the new ruling
below), and tier-2+ overtime measurement. Blanks filled: the
Relay door wording (arm 2, landed in docs), the overtime
mechanism reading (arm 3, landed as measurement). Blanks
documented: field-flee at the break line (arm 1), tier-2+
overtime (arm 3, future arm only), the sysBond code-fix
specification (arm 2, held — see below).

## Arm 1 — sim-lingerfinish-a: wound-selective lingerer finishing (NO-GO, policy deleted)

Prereg 7081a3997, evidence cdb0c5d6c + correction 02cfc6dfe
(rebased 9972fa06c / 367af0855). Phase 1 policy-side ONLY, zero
src/js. Policy: if the whole treeline is weak enough (weakest
beast <= 80 HP, treeline total <= 300), muster a village
sortie (answerLingerer('sortie'), real rations, real
blow-by-blow field fights); otherwise the scholar marches to
the most-wounded beast for a turn-based fight at its wounded
world health. Baseline vs armed on identical seeds, fresh
current-master baseline (never the old corpus numbers):
villager field finishes 0 -> 0 (GO needed >= 2) — leg (c)
FAIL; wave-4 finishes 4 -> 3 (GO needed > baseline) — leg (d)
FAIL; cost bar PASS (starvation 2 vs 1, median 152d vs 146d =
1.04x); substrate gate PASS (courtship 110 -> 113, 8/8 active
both); detgate PASS (75101: 132/132 days, tsNationalDay 77);
killer-identity reporting PASS (scholar-TB is the only
finishing channel on both bands). Verdict NO-GO, binding
prereg, no re-score: the policy file is DELETED before commit
(killed arms leave no trace); the sweep driver is patched so
baseline mode still runs and armed mode fails fast.
Mechanism found, not a policy failure: 11 sorties cleared 19
lingerers off the treeline and the scholar marched 26 times,
but in 20 sortie fights, 18 end with the beast fleeing in
zero rounds, 1 with the village fleeing, 1 with a kill the
census does not count (its raid-night toll row is not marked
an exact toll). A beast down to 1 HP does not stand and die
when villagers reach it — the field engine lets a broken
beast leave instead of dying. Phase 2 (the visibility
narration clause re-proposal) is NOT triggered: phase 1
could act without a hook (37 actions), so no hook was
missing; phase 2 remains an unjudged re-proposal for a
future arm. Sense reading: the sorties read like people
acting (named fighters, real rations, treeline cleared), but
the flee-at-the-break-line ending reads wrong — a village
that marched out to finish a broken beast watches it walk
away untouched. Named next arm: a field-flee mechanism arm
(when a beast at the break line is met by a finishing party,
it must be finishable), judged on villager field finishes
against this arm's baseline. check.js --quick on this arm:
279 passed / 8 failed in 955s (raced a kill call; the tail
output does not name the 8 failures, so their identities are
NOT asserted as the pre-existing set; a sibling suite was in
flight in another worktree).

## Arm 2 — sim-sysbond-a: TABLE sysBond doc/code gap (GO, doc correction)

Prereg 485abfc0d, evidence 5392e778b (rebased b8b358eac /
cc5729ad7). Audit ONLY: zero src/js, zero gating, zero
behavior change. Finding: docs/TABLE.md §7 said the Relay
door needs sysBond >= 2 ("curious"), but code
(src/js/table-relay.js prereq) never compares sysBond — it
prices strength only (stage >= 3: 40 + bond x 10; stage >= 2
+ holding the relay office: 25 + bond x 5). The offered door
is prereq AND a lesser+ seat (table.js minSeat), so
"scale-independent" is true of the prereq alone, false of
the offered door. Two sub-gaps fixed in the same correction:
the stage-2 branch accepts ANY held office (code checks
switchboard() exists, not the holder; fixture-proven), and
"(curious)" is off by one on code naming (0 static,
1 curious, 2 listening). History: doc wording verbatim
since TABLE.md's first contract commit (6053db314,
2026-10-11); code prereq verbatim since its first commit
(2bd5096d0); no commit ever gated the door on sysBond —
a never-implemented doc claim, not a deliberate removal.
Fixture 14/14 (re-run green on the rebased branch);
band 4/4 table previews earn Relay at stage 3, sysBond 0
(75101/75103/75104/75106; strength 40, 50 with ascension
bonus, 40, 40). Code-wrong bar NOT met on any prong: no
Steve ruling ordering a bond gate, no second code path
assuming one, no bond-0 entry producing a broken state
(bond-0 walks win coherently). HELD WITH REASON (per
Steve 2026-10-28, pursue all held work to landed or
documented held-with-reason): the precise code-fix
specification (add bond >= 2 to both earning branches of
table-relay.js prereq) is specified ONLY, not landed —
landing it would close the stage-3 route on this entire
band (all four previews bond 0) and needs a Steve ruling
first. The doc correction lands; the behavior change does
not. No [needs-eyes] (doc-only audit). Observed, not
changed: TABLE.md's full-seat line says stage >= 3 while
the table.js seat comment describes deedGateReady with
stage >= 2 — a separate full-seat claim, not audited here.

## Arm 3 — sim-tbovertime-a: overtime vs in-fight TB growth (GO, measurement only)

Prereg a44c81c9b, instruments b662e0239, analyzer fix
a0128a814, evidence e11396f026 (rebased db2fcb8ba). Zero
src/js. Join completeness 24/24 world-origin wave-4 TB
fights (100%, bar >= 95%), 0 tier disagreements, 0 opening
disagreements, 0 failed sum identities, 0 unexplained gaps;
analyzer MECHANICAL PASS on the rebased branch (exit 0).
Decomposition (primary fighter): tile -> construction 0 on
24/24 (construction EQUALS tile HP exactly — the world-HP
rule, measured; the fighterconstruct "always built full"
claim is superseded on current master); pre-fight overtime
scaling on 2 fights only, both tier 1 (tier counts 0 x 22,
1 x 2, 2+ x 0; maxHp +463, HP gain +345; 0 crew fighters);
opening damage 71 total, all in one fight (75102 d166,
traced faster-villager opening strikes); in-fight change
-3,187 total (net damage on 22 fights, 0 on 2), positive
(healing/growth) on 0 fights; in-fight maxHp growth 0 on
24/24; tile -> end -2,913 total. Scales-up set: exactly
the 2 overtime fights (+288 = +345 pre-fight gain - 57
in-fight damage). Corrected sentence for the w4convert
"TB scales the monster up" reading: on current master, a
turn-based fight NEVER grows a monster's health ceiling —
in-fight maxHp growth is 0 on all 24 fights, and the only
construction-to-end increases are the 2 tier-1 overtime
fights, 100% pre-fight. For the cited old-base example
(75103 d178 suburb, tile 975 -> end 3688/3688): the 3688
was already the start (construction 1475 x 2.5 overtime),
so of its +2,713 tile-to-end gap, the fresh roll
contributed +500, pre-fight overtime +2,213, and in-fight
growth exactly 0. The w4convert 0-kill verdict is NOT
re-scored (stands untouched); the two TB fights won on
this base (75102 d172 reunion, 75108 d95 suburb) are
reported as new-base facts only. Sense reading: the game
DOES tell the player why (d144 tier announcement, "RERUN
x1" fight-start line, renamed fighter every turn) but
never states the exact HP arithmetic (675 -> 844).
Caveats: the prereg's construction-hp == maxHp assumption
was falsified on this base by the world-HP rule; the
analyzer failed loudly on all 24 fights, the identity was
re-derived from actual order of operations (opening turns
run BEFORE the overtime wrapper scales post-opening HP),
and the corrected re-run passes — no threshold moved.
Parity vs the fighterconstruct corpus FAILS on 4 seeds
(75102, 75103, 75105, 75108), diagnosed as base drift from
the world-HP rule, not recorder effect (detgate PASS plus
a same-base detcheck reproduces the row exactly except
stack-trace audit lines; parity is diagnostic, not a
mechanical gate, per the analyzer fix commit). Tier-2+
overtime (packmate injection, tier 4/6 scaling) is
UNMEASURED on this band — named as a future arm only; no
balance change proposed from this arm.

## Wall numbers (this run's bands only, never pooled)

- tbovertime band: national ever/final 7/8 / 6/8, table
  invited/entered 4/8 / 3/8, wins 3/8 (3 lesser / 0 full),
  wave-4 6/8, wave-5 0/8, median 146d.
- lingerfinish bands: baseline wins 3, armed wins 5 (NOT a
  GO leg, NOT re-scored); wave-5 armed 1/8 (75101, first on
  this band); median baseline 146d, armed 152d; starvation
  baseline 1, armed 2.
- sysbond band: Relay earned 4/4 previews, all stage 3
  sysBond 0; full seat 0/8, wave-5 0/8 on its band.
The standing directive stands: no run has yet shown the
full seat reached in sims on measured evidence, so the
scale-onramp axis stays converging, NOT converged.

## New standing ruling, recorded for the next run (NOT applied retroactively)

Steve 2026-10-28 02:54 CDT (landed in MEMORY.md during this
run): WAVE-4 DEMAND — wave 4 should demand parties and
fully outfitted gear; taking on wave 4 is a party, fully
geared undertaking, not solo or under-equipped play. Apply
as the demand wave-4 work is measured against. This run's
verdicts were pre-registered BEFORE that ruling and are
NOT re-scored against it: the w4tbkill kill and this
round's TB wins include solo-scholar fights, which the new
demand says should not be the shape of wave-4 success.
Next wave-4 arms must measure against party + geared
attempts (party formation, gearing, and the intelligence
to attempt only when ready) — and the field-flee mechanism
arm must be judged on party finishes, not solo ones.
Second ruling, same timestamp: remaining work is sim/NPC
intelligence failures, not new systems — root-cause-first;
no new system is proposed by any arm here.

## Metric review (mandatory)

- Pre-registered metrics bound all three arms; no mid-run
  re-scoring happened. Lingerfinish's win movement (3 -> 5)
  and wave-5 first reach were explicitly NOT converted into
  a GO leg. Tbovertime's parity-vs-old-corpus FAIL was
  diagnosed as base drift, not waived: parity was declared
  diagnostic in the analyzer fix commit, matching the
  prereg's hard-failure list treatment, and the mechanical
  gate (join completeness, sum identities) passed.
- Sysbond's GO is an audit GO (gap closed in docs), not a
  behavior GO; the behavior change it specifies is held
  pending a Steve ruling, documented above.
- Proposed revision for the NEXT run (not this one): the
  wave-4 demand ruling above should enter the next
  wave-4 arm's prereg as a leg (party + geared attempts
  only), and the telemetry checker needs a per-seed schema
  note (see below) before its LOUD lines are read as
  regressions.

## Telemetry deviation check (coordinator-run, on the merged tbovertime corpus)

Command: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-28/perseed-tbovertime-a/s*.json' --metrics
national,table,wins,exiled. Result: 3 LOUD lines
(national 12 -> 0, table 16 -> 4, wins 16 -> 0). Verdict:
EXPLAINED, ingestion artifact — baseline NOT rolled, no
new investigation. Evidence: the checker's metric names
(bare national/wins/table) do not match this corpus's
schema (nationalEver/nationalFinal/won/entered), and the
coordinator's glob also swept in summary.json (n=9 files
for 8 seeds), which carries none of those fields. The
rows' true values reproduce the worker's wall numbers
exactly (nationalEver 7/8, nationalFinal 6/8, won 3/8,
entered 3/8). The WINSEAT baseline is additionally a
different regime from this tableseat-nowait substrate.
The checker's LOUD lines on a sweep-row corpus must not
be read as a regression without a schema-aligned ingest;
that alignment is a tooling blank for a future run, in
the same class as the standing balanced-panel
corpus-ingest exception (no panel artifact producible on
any arm here — stated explicitly, not faked).

## Infrastructure

- Master moved once under the run (sibling loop B 0630Z
  landing 51757f233, zero file overlap with any arm: only
  src/js-adjacent deltas were abilityActions/trust/UI,
  untouched by all three arms). Each arm rebased clean in
  its own worktree with proofs re-run (sysbond fixture
  14/14; tbovertime analyzer MECHANICAL PASS exit 0, 24/24
  joined; lingerfinish analyzer NO-GO reproduced, exit 0),
  then merged ff-only, verified HEAD + clean tree BEFORE
  releasing, then released/removed/branch-deleted (never
  chained after merge, per the 0527Z landing lesson).
- Safe-commit index clobber hit worker commits on all
  three arms — repaired via HEAD-blob cacheinfo each
  time, commits verified correct via git show --stat.
- Registry-lock contention queued registrations
  (~60-135s each, waited out). No EPERM flap this run.
  One lingerfinish backgrounded sweep loop vanished after
  seed 75101 (row safe on disk); remaining seeds ran one
  at a time in the foreground. One sysbond band process
  died before seed 75108 (7 rows safe); 75108 re-ran alone
  with the same script; band complete 8/8.
- Final master 367af0855 + this evidence commit (branch
  sim-round-0634, ff-only). Main tree clean at closeout.
  Merged locally, pending ship. No push, no bump, no live
  verification (ship-loop line).

## Next blanks, in order

1. Field-flee at the break line (lingerfinish mechanism):
   a party-finishing arm judged on villager field finishes
   against this round's baseline, measured against the
   party + geared wave-4 demand (Steve 2026-10-28).
2. Tier-2+ overtime measurement (tbovertime caveat):
   packmate injection + tier 4/6 scaling, unmeasured here.
3. sysBond code-fix specification (arm 2, held): needs a
   Steve ruling before any behavior change lands.
4. TABLE.md full-seat stage claim (stage >= 3 vs
   deedGateReady stage >= 2 comment) — separate claim,
   not audited here.
5. Telemetry checker schema-aligned ingest for sweep-row
   corpora (tooling blank, same class as the panel
   corpus-ingest exception).

scale-onramp stays converging (NOT converged). food-economy
stays converging (untouched; sibling loop B live). Claim
deleted; lock deleted.
