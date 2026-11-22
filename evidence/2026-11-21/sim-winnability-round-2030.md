# sim-winnability-round-2030 — Loop B lever round, axis winnability-chain — ADOPTION CLOSEOUT

- Round: `fleshout-loop-b-20261121T2030Z`, axis winnability-chain, claim base master `5accf69db`
- Closeout: adoption (the round timed out at ~22:29Z, 2h limit, with two arms unfinished). The adoption resumed both arms from scratch — the dead run's doorflee scratch extractors were in /tmp and are lost; the departbeat design survived only as a pinned note. No new round started.
- **One src/js change on master this round: departbeat-b** (default-ON departure beat). Doorflee-b lands evidence only; its port + lever stay HELD. No default flip on any lever, no version bump by this adoption (the ship loop shipped departbeat mid-adoption — see below), no push (ship loop owns that).
- Master tip after this round: this record's merge (see log); arm merges `bcc59bcd4` (d3refreeze2, landed by the dead run), `70d9dda36` (departbeat), `7fbbc122c` (doorflee evidence).

## Arm 1 — sim-d3refreeze2-b: GO (LANDED `bcc59bcd4` by the dead run — not re-done here)

Second D3 re-freeze + re-judge of the profilegate-confirm B5 clause, under the dawnbidScore bound, no new sims. Proof 35/35.

- **16/16 CLEAN/IDENTICAL under the dawnbidScore bound.** The profilegate-confirm verdict becomes GO; no default flip.
- Finding #2639 marked FIXED.
- Evidence: `evidence/2026-11-21/sim-d3refreeze2-b.md` (+ prereg, drift logs).

## Arm 2 — sim-departbeat-b: GO (LANDED `70d9dda36`)

The ordinary wave-4+ departure beat: the village now says when a party walks out. Frozen prereg `sim-departbeat-b-prereg.md`, fresh band 106771–106778, 150d, 8 seeds, control vs armed on identical seeds.

- **B1: 14 ordinary-beat vetSays lines armed vs 0 control.** B2: 14/14 launches beaten exactly once — 0 missed, 0 spam, 0 malformed (floor 4 met). B3: launches 14 = 14, deaths 696 = 696, per-seed identical — trajectories byte-identical including standing/survival. The beat is fiction-only and moved nothing.
- What was built (`src/js/win-plan.js`, `src/js/villager-brain.js`): `"<Holder> sets out with <party> after <Target> — the fire marks the trail."` — holder + party + target as the village knows them, once per launch, via a shared hook `winPlanDepartLaunchBeat(vid, launched)` called from both departure paths. The re-seed beat speaks first and keeps precedence (exactly one beat per launch, ordinary XOR re-seed); a day+target dedup stamp prevents re-entry spam; `DEPARTBEAT=0` silences it (control leg only). Fiction only — `say()` consumes no RNG. No canon doc covers departure beats; the voice model is the documented reseed beat + the hold lines, per CANON.md's "no silent actions."
- Proofs green before the pilot: `test-departbeat-b.js` 34/34, reseedbeat 30/30, reseed 97/97, reseedexpiry 58/58, reseedwide 28/28, analyzer selftest 18/18. One real catch during proof: the first hook replacement dropped the re-seed beat for callers that never received the shared hook — fixed with a fallback to the old call (reseedbeat 21/30 → 30/30), plus a one-line pin update in `test-reseedbeat-b.js` for the deliberate design change. `check.js --quick` was NOT run by the arm (a sibling arm was running it concurrently; the harness forbids concurrent jest — the arm's own gates all pass; the round gate below covers the merged tip).
- Instrument correction before judging: the analyzer first counted a wave-3 re-seed beat (106776 d36) against the wave-4+ population and reported NO-GO. The re-seed beat has no wave gate by design; the frozen metric never covered that line. Analyzer fixed (spam/unmatched counted on ordinary beats only; re-seed beats explained by any launch row that day), selftest gained S15–S17, re-run verdict GO. Frozen metric unchanged.
- Sense-test: all 14 lines read true — pairs, trios, quads, two solos; one village renamed the Rerun "The Ugly Beast" mid-band via the village-naming system, and the beat tracks the name as the village knows it.
- Wall (both legs identical): wins 0, national 0, wave-5 4/8, standing-199 3/8, survived 3/8. Launches are lopsided (one village accounts for 12/14).
- **What ships:** build + proofs + instrument + prereg + evidence + corpora (merged `70d9dda36`; rebased `e5c8b4633` + `70d9dda36` onto the then-master `265c61dbd`, proofs re-run green on the rebased tip: 34/34, 30/30, 18/18). The beat is default-ON.
- Findings: **#2646 FIXED** — the ordinary-departure silence filed by profilegate-b and confirmed on the 16-seed band is closed: every ordinary wave-4+ launch now speaks, once.
- Evidence: `evidence/2026-11-21/sim-departbeat-b.md` (+ prereg, analysis, legs logs, 16 corpora).

## Arm 3 — sim-doorflee-b: NO-GO (evidence LANDED `7fbbc122c`; port + lever HELD)

The staying/commitment lever for pinned-door fights (#2619 line). Frozen prereg `sim-doorflee-b-prereg.md` (frozen ~23:00Z, before any judged sim; one pre-legs amendment, bars unchanged: M3e count 25/25). Designated band reuse: 106809, 106812, 106816, 106817, 106820, 106824, 106829, 106830. Control = pin + damage substrate, armed = + DOORFLEE. 150d death-aware, policy `1884c8852d38`.

- **Diagnosis (re-derived from the dmgpin corpora — the dead run's scratch was lost):** 24 fought doors across both dmgpin legs: 18 vFlee, 5 vKill, 1 mFlee. All 18 flights are the HOPELESS branch ("sees how this ends — and runs while running still works"), intent always `engage`. Recomputed on LIVE numbers, **15 of 18 flees are winning** — the party drops the monster first. Two extreme cases fled one round from the kill (106829 algorithm control: monster 23% HP; 106830 algorithm armed: 18% HP).
- **Mechanism, plain words:** the morale read replays the fight as if everyone's armor were only protection 4, while monster damage stays real. Tier armor (~prot 33) lets through ~20% of a blow; imagined at prot 4, ~68% gets through — ~3× the real damage. After a few rounds the leader's imagined HP is deeply negative, and that negative number drags the whole four-person party's pooled survival below the kill horizon, so a winning quad reads as hopeless and runs. The dead run's lead was half right: the flee traces to the P4 hopeless read, but the "party-pool misread" is WRONG — the pool does include the third ally. The misread is the negative-HP drag: one fighter's deeply-negative hypothetical HP outweighs three healthy allies.
- **Blank reproduced, not fixed:** door parties launch with near-dead members — 106809 reunion's third ally entered at 3 HP (control) / 9 HP (armed). Formation does not HP-gate members.
- **Lever (DOORFLEE, env-gated OFF, no default flip):** pinned quad at a door holds while the live race says winning (same 1.1 margin), provided the leader survives another round at the current incoming rate. Ported pinquad/dmgpin from held branch `sim-pinquaddoor-b` tip `94e0b5b85` (diff sha `3107d05f…`, 6 files byte-identical to port commit `c48854921`; #2634 pick line kept verbatim).
- **Pilot (8 designated seeds, identical both legs):** fought doors 11 control → 15 armed; vFlee/vKill/vDie 8/3/0 → 6/5/4; fresh door kills 3 → 5; damage/round 170.9 → 153.2; hold rounds 0 → 24 across 8 fights.
- **Frozen bars:** F1 **FAIL** (6 flees vs bar ≤ 4; rate −32.7pp passed, count failed — the armed leg fought 4 more doors). P2 **PASS** (5 ≥ 3). P3 **FAIL** (0.897× vs 0.90 floor, by 0.3pp — held fights run longer and dilute per-round damage). B1/B2/B3a/B4 **PASS**. M5 **FAIL** (`review_required` with a `regression_signal` on village deaths/100d: 64.59 → 67.28, +2.69, 95% CI 0.34–4.96; median survival 136.5d → 120d).
- **The hold's ledger (8 held doors):** 2 kills, 3 later flees, **3 dead leaders**. One clean conversion is quoted blow-by-blow in the evidence (106830 d98 algorithm: control fled R5 at 18% monster HP; armed held after R2 and killed R7, all four alive). The leader-next-round guard isn't enough — the leader survives the next round and dies two rounds later. Next arm's input: a leader-survival-only hold (leader HP > rate × rounds-to-kill), the hypo-floor alternative, or HP-gating door parties.
- Proofs (all green, post-freeze, on the held tip): M1 allyslot3 18/18, M2 pinquaddoor 35/35, M2w wide 16/16, M3 dmgpin 29/29, M3d doorflee 42/42, M3e downedtwice 25/25, analyzer selftest 11/11. `check.js --quick` on the held tip: 338 passed, 6 failed — 3 are 120s timeouts that all pass standalone (contention artifacts; a sibling's check.js was running concurrently), 3 are proof-freshness failures expected after any src change (refresh via `balance-proof-update.js` / `phone-frame-proof-update.js` deliberately NOT done — maintenance for the merge flow, not this arm).
- Wall (control → armed): wins 0/8 → 0/8, national 0/8 → 0/8, wave-5 3/8 → 4/8 (106820 newly reaches wave 5), survived 2/8 → 2/8, median survival 136.5d → 120d, village deaths 681 → 692, deaths/100d 64.59 → 67.28 (`regression_signal`).
- **What ships:** evidence + prereg + analysis + panel + 16 corpora (merged `7fbbc122c` via evidence-only branch `sim-doorflee-b-evidence`, rebased onto the ship bump `caaf6742c`). **What does not ship:** the src/ port + lever + ported tests stay on branch `sim-doorflee-b` at `e71dd5ea4` (HELD, env-gated OFF — same precedent as `sim-dmgpin-report-b`). No confirm runs (correctly — pilot NO-GO spends no confirm seeds).
- Findings: **#2619 stays OPEN on kill conversion** — updated with the flee mechanism (imagined prot-4 morale read, negative-HP drag; 15/18 flees winning) and the hold's ledger; next arm input named above.
- Evidence: `evidence/2026-11-21/sim-doorflee-b.md` (+ prereg, analysis, panel, 16 corpora).

## Telemetry deviation check (coordinator level)

Ran `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-21/<perseed-dir>/*.json' --metrics national,table,wins,exiled` against all four corpora dirs (departbeat armed/control, doorflee armed/control):

- **Refused on all four by design** without flags (recorder-corpus input: every row carries top-level `anchorCommit`; exit-2 semantics). Same refusal class as the 1615Z round.
- Re-run with `--allow-recorder-corpus` (as the 1630Z and 2215Z rounds did): the **same 3 LOUD lines on both armed legs** — national 12 → 0, table 16 → 0, wins 16 → 0 (n=8 files each). Investigation: regime difference between the scale-wall baseline (a scale-run regime where villages reach national/table/wins) and these recorder corpora (0 wins/national/table on every leg, per the arms' own wall numbers). No src/js change on master this round caused them — the departbeat src change is fiction-only (trajectories byte-identical) and the doorflee src never landed. **Baseline NOT rolled forward.** Recorded as an investigation item, not a regression.

## Gates (round)

| arm | gate / proof | result |
| --- | --- | --- |
| d3refreeze2-b | proof 35/35; no full gate (analysis-only re-judge, no code change) | GO 16/16 |
| departbeat-b | proofs 34/34 + reseed 30/30 + analyzer 18/18 re-run green on the rebased tip; `check.js --quick` not run by the arm (concurrent-jest guard) — covered by the round gate below | GO |
| doorflee-b | proofs M1–M3e + analyzer 11/11 green on the held tip; `check.js --quick` 338/6 on the held tip (3 timeouts pass standalone, 3 proof-freshness expected after src change) | NO-GO (3 frozen bars) |

Round gate on the merged tip: `node scripts/check.js --quick` run twice on master tip `a8c2c201c` (includes both arm merges + the r264 gate-section commit): first run 339 passed / 5 failed, re-run with full output to `hidden_files/round-2030-gate.log` 338 passed / 6 failed in 952s, exit 1. The 6: measurement-proof staleness pair (`test-measurement-proof-update.js` "Proof source inputs are not current", `test-measurement-workflow.js` "retained neutrality proof covers the current Game/controller/harness inputs" — the known stale proof; re-sign rounds 11+12 and 22 still owed), phone-frame stale receipt, and three 120s deed-attainment timeouts (living-garden, one-person-army, trust-observer-neutrality — load flakes; the r264 run's independent gate on a nearby tip shows the same classes at 336/8). Run-to-run flake accounts for the 339/5 vs 338/6 difference (timeout set flips). **0 attributable to this round's arms.**

## Findings filed / updated this round

- #2646 (ordinary wave-4+ departures have no fiction line) — **FIXED** by departbeat-b (14/14 launches beaten once, 0 control).
- #2619 (third ally / kill conversion) — updated by doorflee-b: flee mechanism named (imagined prot-4 morale read, negative-HP drag), hold ledger priced (2 kills / 3 later flees / 3 leader deaths); stays OPEN, next arm input named.
- #2639 (D3 bound) — FIXED by d3refreeze2-b (landed by the dead run; recorded here for the round).

## Infrastructure notes (this closeout)

- The dead run timed out at ~22:29Z with doorflee in Phase 1 diag (scratch lost) and departbeat design-only. The adoption re-ran both arms from scratch in their registered worktrees.
- **Ship loop shipped departbeat mid-adoption:** version bump `caaf6742c` ("Version bump 70d9dda36-20261122-000556 (batch ship)") landed on master between the departbeat merge and the doorflee-evidence merge, so the first doorflee-evidence ff-merge failed (diverged master). Rebased the evidence branch onto `caaf6742c` and merged clean.
- A service restart hit mid-merge-call on the doorflee-evidence merge: the call reported failure with unknown effects. Verified against git before retrying — the merge had NOT applied (HEAD still `caaf6742c`, evidence not an ancestor) — retried and merged clean (`7fbbc122c`, exit 0). Never assume a failed call means nothing happened; verify first.
- Git was extremely slow at points (one plain `git log` + status took ~25 min wall-clock; registry operations took 2–7 min each — lock contention with sibling loops). No work lost; merges were verified by exit code and ancestor checks, never assumed.
- Write flap: writes probed clear at adoption start (22:31Z) and before every commit; no flap window hit this adoption's commits. `docs/ONTOLOGY.md` verified intact (354,584 bytes) before the evidence commit.
- Safe-commit index clobber struck both arm workers (repaired via the `ls-tree -r | update-index` recipe; commits verified correct by hash). The adoption's own evidence commit landed clean with no clobber.
- Held, not merged: branch `sim-doorflee-b` at `e71dd5ea4` (port + DOORFLEE lever + ported tests, env-gated OFF). Its worktree is left in place for the reaper (clean tree, unmerged branch → worktree removed, branch kept, by design). Merged branches deleted: `sim-departbeat-b`, `sim-doorflee-b-evidence`. Worktrees released: `sim-departbeat-b` (released + removed + branch deleted). The round-record worktree is released after this record merges.

## Closeout state

Merged `bcc59bcd4` (d3refreeze2) + `70d9dda36` (departbeat) + `7fbbc122c` (doorflee evidence) + this record; round record `evidence/2026-11-21/sim-winnability-round-2030.md`. Tracker updated (winnability-chain line + review note); findings #2646/#2619/#2639 updated. Claim deleted; lock deleted.
