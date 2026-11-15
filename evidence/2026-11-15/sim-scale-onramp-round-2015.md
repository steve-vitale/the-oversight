# Latest review — run fleshout-20261115T2015Z (axis scale-onramp — STALE-LOCK RECOVERY + ADOPTION, guardablate-fresh CONFIRMED + vetattrition DIAG NO-GO, 3 arms LANDED, merged locally pending ship)

STALE-LOCK RECOVERY at start: lock 1715Z was 3h01m old at 20:16Z
(its transplant tree heartbeat 70min stale, past the 15-min guard);
dead 1715Z claim retired. Its guardablate arm had already landed on
master as 5453f710e (AMBIGUOUS) before its coordinator died; its
transplant2b-fresh arm was stranded with both legs run but no
evidence, panel, or landing. Loop B live on winnability chain
throughout (claim fleshout-loop-b-20261115T2005Z, arms
sim-courtship-rework2-b + sim-producergate-b) — NOT touched. Loop B's
courtship-rework2-b later reported PILOT GO and producergate-b
NO-GO (their coordinator's business, noted here only for the
record).

Arm 0 (recovery) sim-transplant2b-fresh-a (NOT-CARRIER, landed as
605d72bd4; branch commits 57944b8e6, 32028869b, 9ad098b29,
4bd49efe4→605d72bd4 after one rebase): family 2b fresh-band
generalization, band 190621–190628, 150d, competent verbatim, fix
standing swapped in. Baseline (far end 203a32775) 0/8, subject
(385a9f7b6) 0/8 — frozen Branch-2 mapping (B≠4, S ≥ B−1) →
NOT-CARRIER. Proof 112/112 + culpritbisect 116/116 on the arm
branch; transplant2b.js 64/65 (one adjudicated branch-identity leg).
Panel review_required, no material signal (player deaths −0.75,
village deaths +7.625 regression_watch). The fresh band is harsher
than the matched band for the third time (far end 4/8 matched →
0/8 fresh; cf. 8c 1/8, ove48-freshband 1/8) — a 0/8 baseline cannot
show a subject collapse even in principle, so the verdict is "no
carrier signal on this band", and the family closes only in
combination with its matched-band AMBIGUOUS ×2 reads. Recovery
itself: panel legs rebuilt from the surviving corpora, proof
re-run, evidence written from the recovered summaries (no leg
re-run, nothing re-scored); one staged-deletion of the panel
script restored from HEAD; safe-commit clobber struck once,
repaired via the documented pipe. Evidence:
evidence/2026-11-15/sim-transplant2b-fresh-a.md (+ prereg).

Arm 1 sim-guardablate-fresh-a (CONFIRMED, landed as d96b0e854;
branch commits de29e115a, ac97a5f2c, cd4b8ec6b, d96b0e854):
CASCADE lingerer guard-removal ablation on a FRESH band
190631–190638 under the REVISED bar (CONFIRMED at S ≤ B−3),
baseline gate B ≥ 3/8 (fallback 190661–190668 pre-screened, not
needed). Baseline 6/8 → subject 2/8, a 4-survivor gap; lingerer
signature returns hard (scholar deaths 51→94, "the wild" scholar
deaths 41→81, gap-0 lockstep repeats 3→20). Proof 117/117 on the
branch, 116/117 on the rebased tip (one lineage check — subject
branch commit count after the rebase moved the arm tip — adjudicated
in the arm evidence; subject content verified unchanged, −16/+0
game.js, removed lines byte-identical 16/16). Panel
review_required. Wall: national 0/8 both legs, table 0, wins 0,
wave-5 1/8 baseline vs 0/8 subject, wave-4 8/8 both, median 150d
vs 139d. The 1715Z read (1/8 vs 4/8, AMBIGUOUS under the old bar)
classifies CONFIRMED under the revised bar too — two independent
bands now agree. Evidence:
evidence/2026-11-15/sim-guardablate-fresh-a.md (+ prereg).

Arm 2 sim-vetattrition-a (DIAG NO-GO, mechanism named, landed as
474e6e598; branch commits db568441f, 16daffc2f, 8aae2ef1f,
474e6e598 after one rebase): why living veterans bleed to zero
after wave-5 unlock, from 7 landed corpora (72 files: 40 T-class,
32 G-class). DIAG bar (≥90% of 139 exits classified) missed:
116/139 = 83.5%. The miss is entirely a recorder gap — T legs
classify 70/70 (100%), G legs 46/69 (67%), residue 23 AMBIGUOUS G
drops with no victim identity; sensitivity pass resolves 0/23.
Mechanism named with per-seed counts: the veteran bar is a
scholar-survival count — the scholar makes 57% of wave-4 kills, so
the 2 living veterans at unlock are usually the scholar plus one
villager; the scholar then dies in the wild (52/70 T exits are
scholar deaths, 40/70 scholar WILD deaths); only 3/139 exits are
wave-4/5 fight deaths (1 W5-FIGHT). vet5 = 2 at unlock on 28/29
unlocked seeds, ends at 0 on 16/29 (55%), mean 0.59. Veterans are
almost never in the scholar's party (2.2% of veteran-days), 0/70
die in-party. Correction: wave5kill-b's "1:1 kill:death" is a
misread — kind-filtered recompute shows the wave-5 death rows are
dead Producers (kind monster), not villager deaths; the vet5 2→0
attrition fact stands. Next lever specified (NOT built): wave-4
re-engagement party (villager who faced a wave-4 type seeks a party
from perceived wave-3 killers/armed villagers and goes back after
that type together); GO bar named (mean living wave-4 veterans at
end among unlocked seeds ≥ 1.0 and ≥ 1.5× control; survival within
1/8 of control; baseline 0.59). Proof 73/73. Evidence:
evidence/2026-11-15/sim-vetattrition-a.md (+ prereg).

Wall (this run's judged corpora, 104 configs): national 30/104
(all 30 from the G-class gorgeprice2 legs; 0/40 T, 0/32 fresh-band
legs), table 0/104, wins 0/104, wave-5 unlocked 29/72 in the
vetattrition corpora (1/8 + 0/8 guardablate-fresh, 3/8 + 3/8
2b-fresh). Median survival: guardablate-fresh 150d/139d,
2b-fresh 115.5d/125d. Telemetry deviation check REFUSED on all
four recorder corpora (anchorCommit guard, by design) — baseline
NOT rolled, no LOUD lines.

COORDINATOR DECISION (Steve can overrule): family 7 brain-side is
CLOSED by attribution. Two independent bands under the revised bar
both confirm the guard carries the survival floor (matched 4/8→1/8,
fresh 6/8→2/8); the collapse regime the family needed to explain
was guard-masked, not family-7. The align step itself stays
UNMEASURED (no subject leg ever ran for it) — that, not the guard,
is now the open family-7 item. Family 2b is CLOSED as a carrier
suspect (matched AMBIGUOUS ×2 + fresh NOT-CARRIER), joining family
8 (closed 1615Z).

Infrastructure: master moved 3× under the run (journey-social
r215, journey-scale r215 ×2 — the last landing mid-merge attempt).
COORDINATOR ERROR (owned): the vetattrition merge was attempted
with release+remove chained in one command; the ff-only merge
failed (master had moved), but the chain ran worktree-release
anyway, marking the branch done-merged and removing its worktree
while the branch was unmerged. Recovered without loss: branch
intact (all 4 commits), stale done-merged registry entry removed
under flock, slug re-registered (attaches to the existing branch),
rebased onto the new tip, proof re-run 73/73, merged ff-only with
the exit checked BEFORE release. Lesson recorded here so the next
coordinator does not repeat it: never chain release/remove after a
merge in the same call — check the merge exit first, in its own
step. Registry-lock contention was severe all run (register calls
took 5–11 min; the reaper holds REGISTRY.lock for its whole scan —
the known self-contention from AGENTS.md). Safe-commit index
clobber struck 3× across the run (recovery commit, vetattrition
worker's last commit, coordinator rebase-note commit) — all
repaired via the documented pipe, every commit verified correct.
No write flap this run. check.js --quick NOT re-run (zero src/js
on any landed branch; loop precedent). Rotation file left at 4:
the standing directive overrides the lever rotation, and this run
worked the scale-onramp axis, not a lever — same as the 1415Z/
1615Z runs. Backlog: 7 items appended (death-cause taxonomy mix,
kill:death misread, non-gated spawn callers, G recorder victim-
identity gap, MONSTER-WAVES wave-4 count drift 9 vs 10,
veteran-bar mechanism, silent veteran deaths).

scale-onramp stays converging (NOT converged): families 2b, 7
brain-side, and 8 are now all closed as carrier suspects, and the
collapse regime is explained (guard-masked on the matched band,
band-sensitive on fresh bands) — but wins remain 0 on every judged
corpus, national stays 0 on all fresh-band legs, and the wave-5
veteran gap (mean 0.59 living veterans at end among unlocked
seeds) is the binding constraint now with a named mechanism and a
named next lever. food-economy stays converging (untouched;
parked). winnability chain stays converging (untouched; sibling
Loop B). Next blanks, in order: (1) wave-4 re-engagement party
lever (vetattrition spec, prereg-ready) — the next build against
the veteran gap; (2) G-class recorder victim-identity fix
(per-death vid/veteran flag) so the vetattrition bar can be judged
on pooled corpora; (3) family-7 align step — still UNMEASURED, no
subject leg ever ran; (4) headcount-ceiling (Steve-call); (5)
Reunion mirror pack in the wild (Steve design call). Claim
deleted; lock deleted. Evidence:
evidence/2026-11-15/sim-scale-onramp-round-2015.md (this file).
