# sim-tablepaths-fullseat-round-2115 — COORDINATOR RUN EVIDENCE (fleshout-20261024T2115Z, axis scale-onramp)

**Run:** fleshout-20261024T2115Z · **Axis:** scale-onramp (standing directive — still
stands: see convergence note) · **Type:** coordinator run — 2 arms, both landed
locally, pending ship (no push, no version bump).
**Commits:** arm 1 `696cdf8a8` (policy) + `02f6b32ef` (sweep + evidence + corpus,
rebased twice); arm 2 `5cc5f00b3` (rebased once). This evidence committed separately.
**Sibling lanes NOT touched:** B loop food-economy (live claim 1830Z, arms
pantrystarve + leg2decide — its leg2decide commit `a6104f891` landed under this
run and was rebased over, zero file overlap), gap-w4-narr, panel-contract-rulings.
Zero `src/js` changes in either arm — policy-side only.

## Why this round: the 1955Z next blanks, in order

The 1955Z round left, in order: (1) a seat-answering variant that walks doors
other than Feared (path diversity); (2) full-seat reachability. This round takes
both, on one shared fresh band, against one shared baseline substrate.

## PRE-REGISTRATION (binding, shared by both arms, written before any sweep)

- Baseline: tableseat-nowait (`TABLESEATNOWAIT=1`: leanlinkrescue courtship +
  seat legs, no wait leg), identical seeds, each arm ran its own baseline
  replication.
- Seeds (pilot): 73641–73648. Fresh at run start (no prior evidence hits).
- Horizon: 180 loop-days, death-aware.
- Deciding cost bar (from sim-scalemetric, binding): starvation deaths armed
  total ≤ baseline total + 2 AND arm-only starvation ≤ 2 AND median days armed
  ≥ 0.8 × baseline median days. All conditions must pass or NO-GO.
- Arm 1 primary: table entered PER PATH — GO requires ≥ 1 non-Feared path
  entered on the pilot plus the full cost bar.
- Arm 2 (diag): DIAG-GO requires 8/8 armed configs producing end/win full-seat
  snapshots with per-component distances, plus a ranked binding-blocker list.
  Any full seat reached is a breakthrough, reported prominently.
- Landing rule: GO/DIAG-GO → policy lands as its own commit, default-OFF only,
  NO default flips. NO-GO / det-gate failure → policy deleted, instruments +
  evidence only.
- Balanced panel (§15): attempted by both arms; see metric review.

## Arm results (both judged on the pre-registered bar, no re-scoring)

### Arm 1 — sim-tablepaths-a: GO (path diversity)
Commits `696cdf8a8` (policy `scripts/policies/tablepaths-nowait.js`: tableseat-nowait
wrapped with a paths-phase door rule) + `02f6b32ef` (instrument + evidence +
corpus). Evidence `evidence/2026-10-24/sim-tablepaths-a.md`, corpus
`perseed-tablepaths-a/` (16 + summary).
- Filename note: `scripts/policies/tablepaths.js` already exists (2026-10-19
  seatdrive-substrate path-forcing driver). Overwriting it would have destroyed
  prior work, so this arm's policy is `tablepaths-nowait.js`, kept as-is on
  landing. Nothing else was renamed.
- Option→path mapping (from code, in the evidence header before any sweep):
  `tableOfferPaths` offers ONLY earned paths as `path:<id>`, in registration
  order feared → indispensable → beloved → witness → assimilated → defiant →
  relay; indispensable is full-seat-only, so a lesser-seat menu runs feared →
  beloved → witness → assimilated → defiant → relay. Feared registers first
  with an easy prereq (might+killed ≥ 6) — that is why first-option answering
  always walked Feared. The pre-registered door rule: assigned rotation
  `['defiant','assimilated','beloved','relay',…]` by seed; if assigned is
  offered take it, else first offered non-Feared door, else Feared. Every
  other phase answers first-option exactly like baseline, so the delta is ONLY
  the door.
- Primary PASS: armed non-Feared entered 2 (need ≥ 1). Seatings, paired
  identically except the door: seed 73642 day 160 lesser seat — baseline
  feared/light, armed **assimilated/light** (assigned rule) and won; seed 73648
  day 105 lesser seat — baseline feared/light, armed **relay/grey** (assigned
  rule) and won. Both seatings were offered the FULL lesser menu (feared,
  beloved, witness, assimilated, defiant, relay) — five earned doors were
  hidden by the first-option rule, not locked.
- Cost bar PASS: starvation 5 vs 5 (≤ +2); arm-only 0 (≤ 2); median 180 vs 180
  (≥ 0.8×). G1 det-gate PASS, G2 pre-national read-only PASS, G3 corpus PASS.
- Per-path entered / won: baseline feared 2 / feared 2; armed assimilated 1 +
  relay 1 / assimilated 1 + relay 1. Non-Feared 0/0 → 2/2. National ever/final
  7/6 both arms; wave 4 3/0 both; wave 5 0/0 both. Death-cause shares identical
  (294 deaths each). The door rule moves which ending a seat converts to, not
  scale: national and wave 4/5 are unchanged.
- Sense replay (73648, relay grey): coherent — audit prices the real run
  (waves 1–3 15/6/3, 9 contests, 4 crises, wave 4/5 bars honestly unmet),
  "The middle road is open" (correct grey voicing), three backfires with named
  consequences, final "Stay both-hands. No merge, no champion." with the
  OUTSHONE beat firing alongside the win. Thin note, same class as 1955Z:
  routine assignments resume immediately after the finale.
- Post-rebase proof: full sweep re-ran VERDICT GO with numbers identical on
  the first rebase base; on the second rebase base (journey-scale r30,
  evidence-only, zero sweep inputs touched) the arm's own files diffed 0 lines
  and the det-gate re-ran PASS — the full-sweep verdict carries on
  byte-identical sweep inputs.

### Arm 2 — sim-fullseat-diag-a: DIAG-GO (full-seat distance)
Commit `5cc5f00b3` (sweep instrument + evidence + corpus; no new policy file —
`scripts/policies/fullseat-diag.js` was reused unmodified, it already landed
2026-10-21 and composes cleanly on tableseat-nowait). Evidence
`evidence/2026-10-24/sim-fullseat-diag-a.md`, corpus
`perseed-fullseat-diag-a/` (16 + summary).
- G1 det-gate PASS (seed 73641, FULLSEAT unset: 180/181 days identical, no
  recorder surface). G2 recorder neutrality PASS 8/8 — baseline vs armed
  identical on days/gameDays/counters/starvation on every seed. G3 corpus PASS
  16/16. Cost comparison (diagnostic): starvation 5 vs 5, median 180 vs 180,
  death total 294 vs 294 with an identical cause breakdown.
- Before/after (identical seeds, baseline = armed on every aggregate): won 2,
  national ever 7 / final 6, table invited 2, entered 2, **entered FULL 0**,
  wave 4 reach 3, wave 5 reach 0, max arc 4, seats 2/2, both lesser + Feared +
  won (73642 day 160, 73648 day 105).
- Ranked binding-blocker list (end snapshot; max-reach distances identical on
  every component, so this is not an end-state artifact):
  1. **w5 — 8/8 blocked, median distance 2 (full bar, 0 wave-5 fights
     everywhere).** Wave 5 never unlocked (unlockedWave max 4); standing t5 =
     200, max reached 172; four seeds pin at exactly 99, one below the wave-4
     bar; hold kind `below-bar` everywhere — cap/deferral holds never trigger.
  2. **w4 — 6/8 blocked, median distance 3** (cleared only on 73644 with 7
     distinct fights and 73646 with 3; 73642 fought 1 of 3).
  3. **w3 — 6/8 blocked, median distance 2.**
  4. **foodDeeds — 6/8 blocked, median distance 1.** Split is clean:
     sentimentTaught lands on all 8 seeds (days 12–26); feastSurgeUsed lands
     only on the 2 seated/won seeds (73648 day 52, 73642 day 154). The missing
     half is always the surge, never the sentiment.
  5. w2 / contests / crises — 1/8 each (early-death seeds only). w1 / stage —
     0/8, never binding.
- Any full seat reached: NONE (0/8). Closest seed: 73644 — blocked only by
  w5(2) + foodDeeds(1); cleared w4, reached global, then decayed to regional
  and never saw a table (arc 3). Closest winner at the win: 73642, blocked
  only by w4(2) + w5(2) — winning early truncates the window, so lesser-seat
  wins and full-seat chasing pull opposite directions on this band.
- Indispensable sub-gates are NOT the constraint: score clears the 10 bar on
  7/8 seeds (72–190); foodShared > 0 on the winners, 0 on 73644.
- Reachability verdict: the full seat is decoration on this band, not merely
  untested — the binding blocker (w5) is structurally unreachable while
  standing never reaches 200. Any future full-seat arm must attack wave-5
  unlocking first; filling wave bars fight-by-fight cannot work while the
  waves themselves are locked.
- Sense replay (73648): 240-line ring, seat day 105 matches the measured run
  exactly; audit reads the real run (waves 15/6/3, 9 contests, 4 crises).

## Wall numbers (this run's judged corpora, 32 configs; baselines replicate exactly across both independent workers)

| | baseline (pooled 16) | armed (pooled 16) |
|---|---|---|
| national ever | 14/16 | 14/16 |
| national final | 12/16 | 12/16 |
| table entered | 4/16 | 4/16 |
| entered by path | feared 4 | feared 2, assimilated 1, relay 1 |
| wins | 4/16 | 4/16 |
| entered FULL | 0/16 | 0/16 |
| wave 4 | 6/16 | 6/16 |
| wave 5 | 0/32 | 0/32 |
| median survival | 180d | 180d |

Note on pooling: the two arms share the same baseline substrate and band, so
the pooled baseline double-counts one substrate — the per-arm tables above
are the judged numbers; the pooled row shows the two arms agree exactly.

## Village assessment (plain words)

On this band the villages court, climb, and reach national on 7 of 8 seeds —
then the story splits by which door the seat answers. Left to first-option
answering, every seat walks Feared: terror pledged as a shield, won twice.
Give the same villages a rule that answers a different earned door, and the
same two seatings become an assimilated win and a relay win — same villages,
same days, same deaths, different endings. The doors were never locked; the
answering rule was hiding them. The full seat, meanwhile, stays out of reach
for a structural reason, not a lack of trying: no village on this band ever
unlocks wave 5, so the wave-5 deed bar sits at its full distance on every
seed, and the villages that do win stop early — winning and full-seat chasing
pull in opposite directions. The next wall is wave-5 unlocking itself, not
the seat.

## Metric review (binding section)

- Pre-registered metrics held: no re-scoring. The scalemetric cost bar judged
  arm 1 cleanly (all three conditions with margin); arm 2's diag bar judged
  the recorder, not a lever.
- "Table invited ever" stays NON-DISCRIMINATING (1955Z note holds); seat arms
  judge on entered/won per path, as this run did.
- Per-path judging works: entered-by-path separates the door effect (2
  non-Feared) from the scale effect (national/wave numbers unchanged).
- Balanced panel (§15): ATTEMPTED by both arms, NOT INGESTED — same throw as
  1955Z (`TypeError: Cannot read properties of undefined (reading 'days')` at
  `balance-scorecard.js:44`). Sweep-compare tables in each arm's evidence are
  this run's before/after comparison. Panel-contract lane NOT touched.

## Telemetry deviation check

Command (once per corpus; the script accepts a single `--current`):
`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-24/perseed-<arm>-a/*.json' --metrics national,table,wins,exiled`.
LOUD lines, identical on both corpora: "national disappeared: baseline 12 ->
current 0 (n=17 files)", "table swung -75%: baseline 16 -> current 4 (n=17)",
"wins disappeared: baseline 16 -> current 0 (n=17)". VERDICT: all artifacts,
baseline NOT rolled. (1) n=17 = 16 rows + summary.json. (2) The baseline's
own `_regime` note forbids comparing pre-seat/courtship substrates against it.
(3) Per-seed rows carry `nationalEver`/`entered`/`won`, not top-level
`national`/`wins`/`table` paths, so the check reads 0 by construction — while
the arms' own aggregates measure entered 4/16 and wins 4/16 pooled. Same
artifact class as 1955Z/1822Z.

## Infrastructure notes

- Master moved 3 times under this run from sibling lanes (B-loop leg2decide
  `a6104f891`, journey-scale r30 `dbea76c6c`, plus the arm-1 merge itself as
  seen by arm 2): arm 2 rebased once, arm 1 rebased twice, all with zero file
  overlap, all proofs re-ran green after every rebase (full sweeps on the
  first two rebases; det-gate + 0-line arm-file diff on the evidence-only
  third).
- Safe-commit index clobber hit on all 3 worker commits + both arm
  policy/sweep commits (bogus staged-as-deleted entries, worktree files
  byte-identical to HEAD); repaired each time with `git update-index
  --cacheinfo` from HEAD blobs; commits verified correct. No EPERM flap
  encountered by either worker this run (one `git ls-tree` without `-r` note:
  the recursive listing is required to enumerate corpus files).
- `node scripts/check.js --quick` after merging: 280 passed, 7 failed in 356s.
  The failures are NOT attributed to this run (zero `src/js` changes, zero
  green-list files touched; the visible failure is a pre-existing parity
  gear assertion in `test-parity-20261014.js`). The full failure list was not
  captured (output was piped through `tail`), so this is reported as a gap,
  not as green. The arms' own proofs (sweeps + det-gates) all ran green.
- Rotation file left at `3`: convergence-directed work does not cycle the
  lever rotation (the tracker, not the rotation, is the plan).

## Convergence note

scale-onramp stays CONVERGING, not converged. Path diversity is now proven
(assimilated + relay wins at zero cost) and the full seat is measured as
structurally blocked by wave-5 unlocking — but wins still come only through
default-OFF courtship instruments plus default-OFF seat legs, only through
the lesser seat, with wave 5 still at 0. The directive stands until the
tracker records this axis converged on measured evidence. Next blanks, in
order: (1) wave-5 unlocking itself — why standing never reaches 200 on the
tableseat band (73644-class seeds pin at 99, one below the wave-4 bar);
(2) a witness-door walk (witness IS earned on this substrate per arm 1's
exposures, contradicting the 2026-10-20 tablepathdriver note); (3) whether
waiting matters on bands where the seat stays unready longer (still untested).
food-economy stays converging (untouched; sibling B loop live).
Claim deleted; lock deleted.

## Findings

Backlog line 906 stays fixed (1955Z). New items appended (see sim-findings.md):
full-seat standing-99 pin; lesser-wins-truncate-full-seat-window; post-finale
chatter (repeat note); witness-door earned contradiction; fallback-non-feared
rule unexercised.
