# sim-winnability-round-1730 — Loop B recovery run: stranded 1530Z arms landed + held

**Run:** fleshout-loop-b-20261107T1730Z (axis scale-onramp / winnability
chain) · **Type:** STALE-LOCK RECOVERY + ADOPTION/LANDING RUN — no new
sims were run by this coordinator; both arms' corpora were judged and
committed by the cancelled 1530Z run's workers. **Loop A live on
food-economy the whole run (1615Z claim, sim-prodstore-a +
sim-mealday-caller-a, NOT touched; Loop A landed sim-mealday-caller-a
as ed7d5d152 during this run).**

## Stale-lock recovery (start)

The 1530Z B lock (created 15:50:00Z) was 2h+ old at run start. This was
NOT a heartbeat-age retirement: all three 1530Z workers were cancelled
simultaneously at 2026-11-07T17:49:41Z (subagent list: all three
"cancelled before it finished", no result), the coordinator agent dir
does not exist, and no B process was running. The EPERM flap active
~16:30–17:54Z confounded heartbeats (all trees' last heartbeats
16:30–16:43Z, including Loop A's provably-alive trees), so heartbeat
age was never used as the death evidence — the cancellation is direct.
Old lock read, deleted; 1530Z claim retired to .DEAD with a note; this
run's lock + claim written. Both 1530Z arms verified complete and
committed on their branches before any landing work: doorwalk-confirm
GO (sim-doorwalk-b tip 6064f456a) and feareddoor NO-GO-on-defective-
clause (sim-feareddoor-b tip 6e8b3e8f0). Nothing was re-run, nothing
was re-judged, nothing was lost.

## Infrastructure: the flap, and the main-tree repair

A container EPERM write-denial flap ran ~16:30–17:54Z (all registry
heartbeats refused, evidence writes failing filesystem-wide; Loop A
coordinator's own heartbeat attempts failed). At 17:25:31Z a write
during the flap truncated `docs/ONTOLOGY.md` to 0 bytes in the main
tree, and the reaper left a 0-byte `__reap_probe2__.tmp` in the repo
root. My probe (`git update-ref refs/heads/probe HEAD`) succeeded
17:54:35Z — flap clear — and I immediately restored ONTOLOGY.md from
HEAD (`git checkout HEAD -- docs/ONTOLOGY.md`, verified 2088 lines)
and removed the probe file. Content was never at risk (HEAD holds it);
the file is byte-identical to HEAD. Two unattributed flap probes were
running at recovery time (a git update-ref loop from 17:25Z, a python
write-window probe from 17:31Z); both exited when the flap cleared.

Main-tree git operations were pathologically slow through ~18:08Z
(multiple concurrent `git status --short` processes spinning at
10–57% CPU, several in D state; `git status` timing out at 25–30s) —
the ship loop's version-bump commit and Loop A's merge landing in the
same window. The tree settled by ~18:08Z. Two sibling landings crossed
this run: ship-loop version bump 4e4158b77 (batch ship, 17:54Z) and
Loop A sim-mealday-caller-a ed7d5d152 (DIAG-GO, endDay-double-fire
diag). Both are zero-overlap with this run's arms (evidence + scripts
only for mealday; version files for the bump). The doorwalk branch was
rebased onto each explicit SHA in turn (see below); no work was done
in the main tree except the coordinator evidence commit.

## Arm 1 — sim-doorwalk-confirm-b: LANDED (GO)

**Branch sim-doorwalk-b merged --ff-only as dbfcca9b3, merged locally
pending ship.** Policy-side only, zero src/js, zero default flips, no
changes to any existing policy file. New wrapper policy
(`scripts/policies/competent-doorwalk-b.js`, `DOORWALK_B=1`, default
OFF — the HELD branch from the 1430Z run).

**Judged verdict (frozen prereg ba1831626, base 4ce3c0c1f, fresh band
53201–53212, 150d death-aware): GO.** Wins 5/12 armed vs 0/12
baseline (bar ≥4/12 AND margin ≥3 — margin 5); doors entered 5/12
vs 0/12; substrate sanity PASS (lesser 6/12, sat 5/12); guard 12/12
per-seed exact; cost bar PASS (per-seed non-inferiority 12/12,
starvation 4→4, cap 5, arm-only 0); panel review_required, win rate
0 → 0.4167. The pilot's 5/5 was not a band fluke: on fresh ground
every village that sat walked its assigned door and won (Defiant ×2,
Beloved, Assimilated, Relay/grey). Full evidence:
`evidence/2026-11-07/sim-doorwalk-confirm-b.md` (+ prereg, corpora
`perseed-doorwalk-confirm-b-baseline/` + `-armed/`, 12 files each,
panels `doorwalk-confirm-panel.*`).

**Landing path (this run).** Branch at 6064f456a (base 4ce3c0c1f).
Rebase #1 onto explicit master SHA 4e4158b77 (ship bump): all 5 picks
clean, new tip 88ab1a1f4. Proof re-run on that tip: 27 ok printed,
smoke assert fails (see proof note below), no new failure. Master
moved under the run (Loop A mealday merge ed7d5d152, zero file
overlap — evidence + mealday scripts only). Rebase #2 onto explicit
SHA ed7d5d152: stopped at pick 2 with the documented stop-at-pick
quirk (pick in both done and todo, worktree clean, pick's files
unapplied — verified `competent-doorwalk-b.js` and the driver absent
before continuing). Recovered per the lesson with `git rebase
--continue`: picks 3–6 applied clean, new tip dbfcca9b3. Proof re-run
on dbfcca9b3: identical result. Merged --ff-only (2.1s, no conflict);
proof re-run ON MERGED MASTER: identical result. Worktree released
done-merged, branch deleted. Main tree clean after merge.

**Proof note (honest count).** `scripts/test-doorwalk-b-20261107.js`
has 30 `ok()` calls. On every post-rebase run here (tips 88ab1a1f4,
dbfcca9b3, and merged master) it prints 27 `ok:` lines and then dies
at the hard `assert.strictEqual(seatTaken, 1)` at line 363
(`0 !== 1`, exit 1) — the LIVE SMOKE leg on seed 53003, the collapsed
frozen band, exactly as the prereg and arm evidence record. The 3
remaining smoke `ok()` calls never execute because the assert throws.
The worker's recorded "29/30" is the leg-count reading (30 checks,
smoke leg the sole failure), not a literal `ok()` tally; the literal
tally is 27 passed / 1 hard assert failed / 3 unreached. No new
failure appeared on any rebase or on merged master: the only failing
leg is the documented smoke leg, same cause throughout. The smoke leg
is re-pinned by the confirm itself (53201 sat, walked Defiant, won).

## Arm 2 — sim-feareddoor-b: HELD (NO-GO as judged, lever not killed)

**Branch sim-feareddoor-b NOT merged, NOT deleted — HELD, registered
with a fresh heartbeat (18:02:38Z).** Policy-side only, zero src/js,
zero default flips. New wrapper policy
(`scripts/policies/competent-feareddoor-b.js`, feared-first door rule,
`FEAREDDOOR_B=1`, default OFF).

**Judged verdict (frozen prereg a696d0178, fresh band 53201–53212,
150d): NO-GO as judged by the frozen header — the miss is a metric
defect, not a lever failure.** Feared entered 5/12 (bar ≥3/12) and
feared wins 5/12 (bar ≥3/12) — both PASS; the "+2 more wins" clause
fails 5 vs 7 because the baseline rotation already won all five sat
seeds and the armed leg cannot differ before the sit (guard 12/12
proves pre-sit trajectories identical). No door lever can pass that
clause on this band. Cost bar clean (starvation 4→4, per-seed
non-inferiority 12/12); panel review_required, win rate 0.4167 →
0.4167 (delta 0). Full evidence:
`evidence/2026-11-07/sim-feareddoor-b.md` (+ prereg, corpora
`perseed-feareddoor-b-baseline/` + `-armed/`, 12 files each, panels
`feareddoor-panel.*`). Branch tip 6e8b3e8f0 (prereg a696d0178,
tooling 808515cb5, prefix-shape fix b8bbf538e, corpus+evidence
6e8b3e8f0), worktree clean, corpora verified 12+12 files.

**Coordinator call:** the NO-GO stands as judged — §14 metric
binding forbids re-scoring against a friendlier metric mid-run, and
the re-judge belongs to the NEXT run under a revised prereg (feared
wins vs baseline feared wins, 5 vs 0 here — a clean +5). Deleting the
branch would be the kill-discipline failure Steve warned against:
the feared door works 5/5 with a clean cost bar and a 12/12 guard;
the metric is what's wrong, confirmed. The branch is held exactly as
doorwalk was held after the 1430Z run. Next blank #1 (below) is the
re-judge.

## Wall numbers (this run's judged corpora)

Doorwalk-confirm, 12 seeds, 150d: national 0/12 → 0/12; table-sat
5/12 → 5/12; wins 0/12 → **5/12 (all lesser)**; full seat 0/12 →
0/12; wave-4 unlocks 12/12 → 12/12; wave-5 unlocks 5/12 → 4/12
(win truncation — 53201 unlocked wave 5 after d90 in the baseline);
wave-5 faced 4/12 → 4/12; median survival 150d → 112.5d all-seed
(150d non-won both legs — nobody who didn't win died earlier).

Feareddoor, 12 seeds, 150d: national 0/12 → 0/12; table-sat 5/12 →
5/12; doors entered 5/12 → 5/12; feared entered 0/12 → **5/12**;
feared wins 0/12 → **5/12**; wins 5/12 → 5/12; full seat 0/12 →
0/12; wave-4 unlocks 12/12 → 12/12; wave-5 unlocks 4/12 → 4/12;
wave-5 faced 4/12 → 4/12; median survival 112.5d → 112.5d
(identical — the legs differ only in which door was walked).

Telemetry deviation check: `scripts/telemetry-check.js` REFUSES
recorder-corpus input by design on both corpora (same refusal as
doorwalk/takeseat) — no LOUD line, no deviation signal; zero src/js
changed, so no Game-telemetry baseline exists to deviate from.

## Village assessment (plain words)

The door is a real way to win now, and it repeats on fresh ground.
Five villages sat on the morning they were allowed, walked the door
they were assigned, played the challenge straight through, and won —
all five, on the day they sat. The feared door, the one nobody had
ever walked, was walked five times and won five times — the footage
played unasked, the kill led, the terror was spent shielding a small
village that wasn't theirs, and the table signed. What the wins don't
buy is the next rung: national standing is still 0/12 everywhere, the
full seat is still 0/12, and the seven villages that never earned a
seat lived and died exactly as before — one of them the strongest
fighter on the band (53204: 9 wave-4 kills, 3 wave-5 kills, standing
424) and still no seat, because the seat prices deeds and scale, not
kills alone. The chain runs end to end through a won lesser seat now;
the national Binding behind the full seat is the wall that stands.

## Convergence

**scale-onramp: converging, NOT converged.** The chain now runs end
to end through a TAKEN seat AND a WALKED door on a fresh band, 5/5
wins repeating the pilot — and the win path is now LANDED on master
(dbfcca9b3), not held. The feared door is walked and won 5/5 but its
branch is held on a defective metric, not landed. What remains:
national 0/12, full seat 0/12, un-walked doors (witness, dark
branches, trial-by-combat). food-economy stays converging (untouched;
Loop A live, mealday-caller-a DIAG-GO landed as ed7d5d152).

Next blanks, in order: (1) re-judge feareddoor under the revised
metric (feared wins vs baseline feared wins) and land the held
branch if GO — new prereg, analyzer re-run on the frozen corpus, no
new sims needed for the judgment itself; (2) un-walked doors
(witness — offered 4/5, walked 0/5 — the DARK feared walk, trial-by-
combat) and the national Binding (LEAD realm formation) behind the
full seat; (3) bisect which 62ca38845→cf22937b8 landing collapsed the
frozen band's survival (still open from 1430Z); (4) feast cost-taming
next shape — stop-after-spend variant or pair-overlap lever,
donations in the cost bar; (5) lean-seed giving per-village (#1870);
(6) sitter-dies-mid-sitting, feast draws under sanctity, pre-day-90
table-talk — all Steve calls; (7) balance levers / flee-repair port /
pellet-bearer — Steve calls.

Claim deleted; lock deleted. **Merged locally, pending ship.**
