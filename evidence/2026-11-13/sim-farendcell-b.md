# Far-end interaction cell — evidence (arm sim-farendcell-b)

Run fleshout-loop-b-20261113T1430Z, Loop B, axis winnability chain.
Tracker blank #3 from the 0915Z review. Prereg:
`evidence/2026-11-13/sim-farendcell-b-prereg.md` (read it first — it
governs everything below: seeds, horizon, policy, GO bar, leg
mechanics). Base: the collapse window's far end `203a32775`.
Instrument-only arm — ZERO `src/js` changes committed.

## Verdict

**NO-GO — tendexact + 997 burn together do NOT re-derive the healthy
pole on the far end's own base: 2/8 survived**, below tendexact-only
(5/8), below the far-end bare base (4/8), and below burn-only (3/8).
Rank REGIONAL_INTACT (8/8 regional). Kill classification (§14a):
**CONCEPT-DEAD as a combination** — the mechanism was staged, the
metric was fair, and the combination failed on its merits: it does
not add the halves, it subtracts from both. This kills the
tendexact×burn interaction hypothesis only. Tendexact alone is NOT
dead (it re-derived the pole by count at 5/8); the burn alone is NOT
dead as a diagnostic (it moves 4/8 trajectories substantially). What
is dead is the idea that the two together carry the pole's health.

## Wall (judged corpus)

| Leg | Survived | Regional | National | Table | Wins | Wave 5 | Median |
|---|---|---|---|---|---|---|---|
| tendburn (this arm) | **2/8** | 8/8 | 0/8 | 0/8 | 0/8 | 4/8 | 134d |
| tendexact-only (optb L3) | 5/8 | 7/8 | 0/8 | 0/8 | 0/8 | 4/8 | 150d |
| burn-only (gap-candidates L3) | 3/8 | 7/8 | 0/8 | 0/8 | 0/8 | 4/8 | 130d |
| far-end bare base | 4/8 | — | 0/8 | 0/8 | 0/8 | — | 150d |
| healthy pole | 6/8 | 8/8 | 0/8 | 0/8 | 0/8 | — | 150d |

Deaths 726 (combat-dominated: villager combat 254, expedition 217,
combat 140, the wild 70; starvation 0, dehydration 1). Standing
199–560. Blooded 2/8 (190396, 190397). Tribute-ready 1/8 (190397
only — same seed as tendexact-only). Instrument errors 0.

## Per-seed table

| Seed | End | Days | Wave | Standing | Rank | Deaths | Pantry | Ready4/5 vets | Tribute |
|---|---|---|---|---|---|---|---|---|---|
| 190391 | village-lost | 93 | 4 | 199 | regional | 66 | 2173 | 0/0 | no |
| 190392 | village-lost | 128 | 4 | 199 | regional | 72 | 0 | 1/0 | no |
| 190393 | village-lost | 122 | 5 | 560 | regional | 133 | 0 | 0/0 | no |
| 190394 | village-lost | 134 | 4 | 199 | regional | 78 | 0 | 0/0 | no |
| 190395 | survived | 150 | 5 | 500 | regional | 90 | 8179 | 2/0 | no |
| 190396 | village-lost | 114 | 5 | 370 | regional | 103 | 0 | 1/1 | no |
| 190397 | survived | 150 | 5 | 215 | regional | 58 | 21142 | 5/2 | **ready** |
| 190398 | village-lost | 150 | 4 | 199 | regional | 126 | 0 | 0/0 | no |

Peak living wave-4+ veterans per seed (bar 2): 190391: 1, 190392: 0,
190393: 4, 190394: 1, 190395: 2, 190396: 2, 190397: 2, 190398: 1 —
4/8 seeds reach the bar at peak, but only 190395/190397 survive.
The wave-5 choke is NOT the veteran peak here: 190393 peaks at 4
veterans and still dies at d122 with 133 deaths.

## What the combination does, seed by seed

The burn dominates; tendexact rides along. Against the two
reference corpora on identical seeds:

| Seed | tendexact-only | burn-only | tendburn (this leg) | Read |
|---|---|---|---|---|
| 190391 | survived | lost d93 | lost d93 | burn's fate; tendexact saves nothing under the burn |
| 190392 | lost d136 | lost d72 | lost d128 | tendexact extends the burn's village +56d, still lost |
| 190393 | survived | lost d122 | lost d122 | burn's fate; tendexact saves nothing under the burn |
| 190394 | lost d43 | lost d130 | lost d134 | tendexact extends the burn's village +4d |
| 190395 | survived | survived | survived | survives on all three (standing 410 / 525 / 500) |
| 190396 | lost d85 | lost d119 | lost d114 | tendexact shortens the burn's village −5d, but reaches wave 5 (standing 370 vs 199) |
| 190397 | survived | survived | survived | survives on all three (standing 275 / 215 / 215) |
| 190398 | survived | survived | **lost d150** | tendexact KILLS a burn-only survivor, late (d140) |

Net: the combination loses all three tendexact-only survivors it
doesn't share with the burn (190391, 190393, 190398 — 190398 is a
burn-only survivor too), gains no seed over either half, and lands
below both halves. The +1 gap to the pole (190392/190394) is NOT a
tendexact×burn interaction: neither gap seed survives the
combination, and 190392's +56-day extension still ends in a lost
village.

## Deep-identity read (pre-registered)

Full log: `evidence/2026-11-13/farendcell-b-deepdiff.log`
(index-aligned daily snapshots, 4-field signature: vetsW3, vetsW4,
waveKillLog length, roster length).

- **vs tendexact-only: 0/8 identical.** First divergence at day 4–6
  on every seed — the burn shifts the stream immediately, as
  expected. Tendexact's trajectories do not survive the stream
  shift in any recognizable form.
- **vs burn-only: 3/8 deep-identical** (190391, 190393, 190397: 0
  signature diffs across 90/121/148 paired snapshots, and full-JSON
  identical except the leg label). On those seeds tendexact under
  the burned stream changes literally nothing — the exact-split
  pantry fix never alters the trajectory. The other five seeds
  diverge late (d28, d67, d107, d118, d140): tendexact's effect
  under the burn is a small pantry-timing shift that moves
  individual deaths, not a systematic health carrier.

## The mechanism, in miniature (seed 190398)

Both legs share the same d136–138 monster kills, identical through
d138. On tendburn, Catalina Reyes — a wave-3 veteran with 5 kills —
dies "in the wild" on d140; on burn-only she survives to d144 (and
dies then, but the village survives). Her d140 death cascades:
gen_kxtsavp d141, gen_xygxsxa d143, then a d147–149 wipe (Ingrid,
Sigrun, gen_6pid7mf, Boris, Daniyar, Yuki) and the village is lost
at d150 with 126 deaths. One death, four days earlier, same cause
("the wild") — and the village unravels. That is what the
interaction is: not a lever, a dice shift that happens to land on a
load-bearing villager.

## Sense-testing (transcripts)

- Dialogue is coherent and consequential where it speaks:
  veteran-kill announcements name the killer and the beast ("Werner
  just put down The Big Beast... on CAMERA"), door-defense beats
  name the defenders and the hurt, the wave-5 unlock beat is voiced
  ("Meet the PRODUCERS"), BLOODED beats fire (190393 d105/d117,
  190395 d83).
- **190398, d138–150: the final collapse passes in near-silence.**
  After Werner's d138 veteran kill, the only vetSay line in the
  last 12 days is the Nielsen naming at d150 — while nine
  villagers die. Same family as the already-filed VOICELESS EATER /
  VOICELESS SHORTFALL findings (sim-findings.md 2026-11-12/13):
  confirmed again on this leg, NOT filed as a duplicate.
- 190393's vetSays end at d117, village lost d122 — a 5-day
  silence at the end; less severe. 190395 (survivor) speaks through
  d150.
- No robotic, static, or repeated dialogue surfaced beyond the
  voiceless-collapse gap above.

## Village assessment (what the village looked like)

Every village reached regional; none reached national, the table,
or a win. The four wave-5 villages (190393, 190395, 190396, 190397)
all met the Producers, and two of them died anyway — reaching wave 5
is not the same as surviving it. The survivors (190395, 190397) are
the ones with pantry left at the end (8179 and 21142 kcal) and the
fewest deaths (90, 58); every lost village ends at 0 pantry except
190391 (2173). The pattern from the tendexact leg repeats: survival
tracks whether the village still has food and people at d150, and
the combination does not change that — it only re-rolls which
villages run out first. Who thrived: the wave-3/4 veteran core on
190397 (5 ready-4 veterans, tribute-ready — the only seed where the
village could pay tribute, and it still never delivered one).
Who died and why: combat and expeditions dominate (471/726 deaths);
"the wild" takes 70, including the load-bearing veteran on 190398.
What was missing: nothing new — the same wall as every corpus this
week (national 0/8, table 0/8, wins 0/8), and the same voiceless
collapse. Blank filled: the interaction question itself — the
tendexact×burn combination is now measured and killed, so the +1
gap hunt moves on from it.

## Proof + tooling (what was built this run)

Tooling commit `e7bb538e6` (parent `42024a8de`; prereg `088a9aef7` +
driver + analyzer + proof, **78/0 green**):

- The **driver** (`scripts/farendcell-driver-20261113.js`) is a clone
  of the optb-rederive driver with the single leg `tendburn`, corpus
  dir `evidence/2026-11-13/perseed-farendcell-b/`, RUN
  `farendcell-pilot`, arm `farendcell`, plus the gap-candidates
  reseed burn (exported `RESEED_BURN = 997`, applied after
  `setupGame`, recorded per seed) and the reconciled-a `writeRobust`
  hardening. Guards (all verified green before the run): standing
  fix swap (`f8fda429…`, marker present), far-end own policy
  (`a7ff5c51…`), tendexact marker
  (`EXACT SPLIT (tendexact-a` in `hierarchy.js`).
- The **analyzer** (`scripts/farendcell-analyze-20261113.js`) judges
  the prereg's GO/NO-GO (≥5/8 POLE_REDERIVED, ≤4/8 NO_GO) and the
  rank read; summary `evidence/2026-11-13/farendcell-b-summary.json`.
- The **proof test** (`scripts/test-farendcell-b.js`) re-proves
  instrument validity (live game load, rule-detecting ladder/scholar
  legs), seed-band identity, the swap-aware leg guard (including a
  real subprocess refusal), corpus completeness, the decision rule
  (all 8 counts), the rank read, the candidate guard (marker present
  at the pole, absent at the far end), and the burn semantics
  (RESEED_BURN = 997, burn after setupGame, never re-assigns
  `Math.random`, reseedBurn passed through per seed).
- Leg mechanics: detached checkout of `203a32775` in this worktree,
  tooling + instrument restored as untracked scratch, `git
  cherry-pick -n e6911eb80` (clean auto-merge; tooling files from
  the commit reset + deleted, ONLY `src/js/hierarchy.js` kept —
  45+/15-, the tendexact hunk), fix `standing.js` swapped in,
  run, then the original `standing.js` restored byte-identical
  (sha256 `75762cb2259d…`, `cmp` clean) and the cherry-pick undone
  via `git reset --hard` before checking the branch back out.
  Branch tip verified `e7bb538e6` afterwards; worktree contains
  only the committed work plus the judged corpus.

## Metric review (§14)

- The metric set held: survival count on the matched band + the rank
  read decided the leg without re-scoring. The 2/8 is unambiguous
  against the ≥5/8 GO bar — no near-miss, no friendly metric to
  drift toward. The deep-identity read (pre-registered) did the
  work it was meant to do: it showed the combination is burn-led
  (3/8 bit-identical to burn-only) rather than a genuine
  interaction.
- No metric revision proposed for the next run. One note for the
  next interaction cell: a combined leg whose halves are a code
  change and a stream shift should pre-register the deep-identity
  comparison as a first-class read, not a secondary — the headline
  count alone cannot say whether the code change did anything at
  all under the shifted stream. (Here it did: nothing on 3/8
  seeds, late small shifts on 5/8.)

## Telemetry deviation check

Attempted; REFUSED (recorder-corpus class, exit 2: rows carry
top-level `anchorCommit`, sweep recorder rows, not runs — same as
all prior bisect arms). Recorded, not waived. Baseline NOT rolled.
No LOUD lines to investigate.

## Infrastructure

- No EPERM flap during the leg run (probe OK before every commit;
  driver writeRobust never fell back to stdout).
- Safe-commit index clobber struck BOTH the prereg commit and the
  tooling commit (staged-as-deleted + untracked) — repaired each
  time with the documented `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; status empty + diff
  HEAD empty + blob hashes match after every repair. Commits
  always correct.
- The first deep-diff log write was short one seed block: the
  `tee ... | head -60` pipeline SIGPIPE'd tee after 60 lines.
  Caught by a seed-count check (15 vs 16 seed lines) and re-run
  in full; the committed log has all 16. Lesson: never pipe a
  log-producing command through `head` when the file is the
  record — write the file first, page it after.
- Worktree heartbeated at run start; leg checkout verified
  byte-identical restore before any evidence commit.
- Loop A's tree (`sim-masterregress-a`) was read-only (its prereg,
  for the far-end bare-base citation) and never touched.

## Findings for the coordinator (do not chase)

- None new to file. The voiceless-collapse gap (190398 d138–150)
  confirms the already-open VOICELESS EATER / VOICELESS SHORTFALL
  findings (sim-findings.md 2026-11-12/13); no duplicate filed.
- The +1 gap to the pole (190392/190394) is still unexplained, and
  the tendexact×burn interaction is now eliminated as its carrier.
  The gap sits in commits outside the four optb candidates, in the
  burn alone (which saves neither gap seed), or in their
  interaction with something else — same open item as the optb
  round, narrowed by one eliminated combination.
