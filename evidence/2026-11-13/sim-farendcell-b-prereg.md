# Far-end interaction cell — pre-registration (arm sim-farendcell-b)

Run fleshout-loop-b-20261113T1430Z, Loop B, axis winnability chain.
Tracker blank #3 from the 0915Z review. Written and committed BEFORE
any judged sim. Worktree base `42024a8de` (current master tip at spawn).
Instrument-only arm — ZERO `src/js` changes committed.

## The question

On the far end's own base `203a32775`, does tendexact + a 997-draw burn
TOGETHER re-derive the healthy pole? Each half is already measured on
this band, same horizon, same swap, same driver family — but never
combined:

| Leg (arm) | Combination | Survived | Per-seed |
|---|---|---|---|
| far-end bare base (firstparent-a / Loop A sim-masterregress-a leg `far`) | base only | **4/8** | survive 190393/190395/190397/190398; lose 190391 d86, 190392 d144, 190394 d43, 190396 d87 |
| L3 tendexact (optb-rederive-a, run fleshout-20261112T0215Z) | base + `e6911eb80` | **5/8** | survive 190391/190393/190395/190397/190398; lose 190392 d136, 190394 d43, 190396 d85 |
| L3 reseed (gap-candidates-a, run fleshout-20261113T0515Z) | base + 997 burn, no code change | **3/8** | survive 190395/190397/190398; lose 190391 d93, 190392 d72, 190393 d122, 190394 d130, 190396 d119 |
| healthy pole (vetphantom-b fix leg, `5157782a4`) | pole code | **6/8** | — |

The combination is a genuine open question, not a foregone sum: the
burn alone LOSES two baseline survivors (190391, 190393) while
tendexact alone SAVES one baseline loser (190391) and keeps the other
four. If the burn's stream shift and the exact-split pantry fix
interact, the combined leg could land anywhere from 3/8 to 6/8. The
+1 gap to the pole (190392/190394 — what saves them on the pole but
not on tendexact) is the thing this cell probes from the interaction
side: the burn moves 4/8 trajectories substantially on its own
(gap-candidates-a evidence), so a burn under tendexact may or may not
recover either gap seed.

## Leg (1 — one leg, one invocation)

| Leg | Base (anchor) | Standing.js | Policy (own, exact sha) | Candidate | Burn |
|---|---|---|---|---|---|
| `tendburn` | `203a32775` | swap in fix `f8fda429…` (pre-fix `75762cb2…`) | `a7ff5c51…` (far-end own) | `e6911eb80` cherry-picked uncommitted (marker `EXACT SPLIT (tendexact-a` in `src/js/hierarchy.js`) | 997 draws of `Math.random()` after `setupGame`, before `runDays` |

Leg mechanics (optb pattern, verified at run start — see §Guards):
- The leg runs on a detached checkout of `203a32775` in this
  worktree, with the tooling files restored as UNTRACKED scratch via
  `git show sim-farendcell-b:<path>` (masterregress / reconciled-a
  pattern) and the vetfirst instrument copied as untracked scratch
  (it does not exist at `203a32775`; master copy sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`).
  Scratch copies are DELETED before checking the branch back out.
- `git cherry-pick -n e6911eb80`, then reset + delete the commit's
  tooling files (`scripts/tendexact-*`, `scripts/test-tendexact-a.js`)
  so the ONLY uncommitted game-code change is `src/js/hierarchy.js`.
  The driver REFUSES to run unless the tendexact marker is present.
- The fix `standing.js` is extracted with
  `git show 5157782a4:src/js/standing.js`, sha256 verified exactly
  `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
  swapped in UNCOMMITTED, run, then the base original restored
  byte-identical afterwards (sha256 `75762cb2259d…` + `cmp` clean +
  `git status` showing no `src/js` modification). The swapped file
  itself is never committed. The driver refuses to run unless the
  on-disk `standing.js` carries the "ROSTER CHECK" marker AND its
  sha256 is exactly the fix sha.
- The burn is a BURN, not a re-assignment: five modules capture the
  mulberry32 function object into module-scope aliases at load
  (`betrayal.js:87`, `comms.js:115`, `corruption.js:47`,
  `fieldFights.js:71`, `finale-campaign.js:28`), so re-assigning
  `Math.random` would leave the fight engine on the old stream
  (gap-candidates-a evidence §Tooling). Burning 997 draws after
  `setupGame` (world generation done: genRoster + newGame + depart)
  keeps the world identical and shifts only the play-phase dice.
  `reseedBurn: 997` is recorded per seed. The policy RNG
  (`__policyRandom`) is untouched by the burn.
- Do NOT re-run tendexact alone. Do NOT re-run the burn alone. This
  arm is the combined leg only.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count /8 on the matched band.**

| Outcome | Verdict |
|---|---|
| **`tendburn` >= 5/8 survived** | **GO — POLE RE-DERIVED.** tendexact + 997 burn together re-derive the healthy pole on the far end's own base (matching L3 tendexact's 5/8, or the pole's 6/8). |
| **`tendburn` <= 4/8 survived** | **NO-GO — POLE COMBINATION DOES NOT RE-DERIVE.** The combination does not carry the health on its own base; the +1 gap to the pole is not a tendexact×burn interaction. |

**Rank read (pre-registered alongside survival — judged, same bands
as the optb prereg):** regional reach on the same band, vs the
vetphantom fix leg's 8/8 regional and the origin leg's 0/8 regional.

| Outcome | Rank verdict |
|---|---|
| ≥5/8 regional | **REGIONAL_INTACT** |
| ≤2/8 regional | **RANK_STALL** |
| 3–4/8 regional | **RANK_INCONCLUSIVE** |

**Secondary (reported, not judged):** median survival (upper median,
the analyzer's convention) vs 150d (tendexact) / 126d-adjacent
(burn-only median from its corpus: deaths d72–d130, survivors 3/8);
death-cause shares vs the combat-heavy profile; wave-4 and wave-5
unlocks; national / table / wins; standing range; tribute-ready;
blooded count; peak living wave-4+ veterans per seed vs the bar of 2
(reported only — the analyzer does not capture the veteran peak; the
evidence file reports it from the corpus daily snapshots).
**Deep-identity read (pre-registered):** per-day 4-field signature
(vetsW3, vetsW4, waveKillLog length, roster length) + full
daily-snapshot deep-diff of this leg's corpus vs the tendexact corpus
(`evidence/2026-11-12/perseed-optb-rederive-a-tendexact/`) and vs the
reseed corpus (`evidence/2026-11-13/perseed-gap-candidates-a-reseed/`),
snapshots paired INDEX-ALIGNED (never day-keyed). A divergence from
BOTH references on a seed is expected (the burn shifts the stream);
a seed deep-identical to the tendexact corpus would mean the burn did
not move that trajectory — reported, investigated, never a verdict
input.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to all
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, firstparent, merge, reconciled, anchor,
  survivalcontrol, burnoffsets-b0, optb, gap-candidates, and Loop A's
  masterregress legs.** A re-derivation / interaction leg re-runs the
  same seeds on old code; that is the point, not a freshness
  violation. Grep scope `evidence/*/sim-*-prereg.md` on master names
  seed 190391 in 26+ prior preregs — same justification as every one
  of those preregs, and the bisect prereg
  (`sim-masterregress-a-prereg.md`, read-only in Loop A's tree
  `~/workspace/worktrees/sim-masterregress-a/`) cites the same band
  for its `far` leg.
- **Policy: competent verbatim, far-end own** (exact sha
  `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`,
  verified by `git show 203a32775:scripts/policies/competent.js` at
  run start). The driver refuses any other sha. The policy confound
  at the far end is closed (firstparent-swap-a: first parent +
  vetphantom policy also reads 4/8, same four survivors).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  (byte-identical to master, sha256 `311f105b…c40d23`) + the driver's
  live shadow old-rule count per snapshot, exactly as
  vetphantom-driver and the bisect drivers. Driver:
  `scripts/farendcell-driver-20261113.js` — a clone of the
  optb-rederive driver with the single leg `tendburn`, corpus dir
  `evidence/2026-11-13/perseed-farendcell-b/`, RUN =
  `farendcell-pilot`, arm = `farendcell`, plus the gap-candidates
  reseed burn (exported `RESEED_BURN = 997`, applied after
  `setupGame`, recorded per seed), and the reconciled-a `writeRobust`
  hardening (Atomics.wait real-time backoff, 480 retries — the r10
  driver's Date.now busy-wait burns instantly under the harness's
  frozen clock). **`\belder\b` filter:** the driver carries the
  tightened veteran-say regex `\belder\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10 and the optb driver.
  Analyzer: `scripts/farendcell-analyze-20261113.js` (judges the
  GO/NO-GO + rank rules; one summary JSON:
  `evidence/2026-11-13/farendcell-b-summary.json`). Proof:
  `scripts/test-farendcell-b.js`.
- **Corpus:** `evidence/2026-11-13/perseed-farendcell-b/` — 8
  per-seed JSONs; driver log
  `evidence/2026-11-13/farendcell-b-driver.log`.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md (wave law:
wave 4 at standing ≥100, wave 5 at standing ≥200 AND wave-4 faced;
design call #4 — the readiness gate reads living roster members
with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and the
scholar-counts ruling (Steve 2026-11-10: the scholar counts as a
villager; their kills count toward the living-veteran bar). No canon
doc covers survival-collapse attribution or RNG-stream interaction;
nothing here invents canon.

## Balanced panel (§15) — N/A

Instrument-only leg, no code change, no before/after pair to compare
on one base. The before/after comparison IS this leg vs the tendexact
and reseed reference corpora on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, r5-cut1-a §7,
r6-cut-a §7, r7-cut-a §7, r8-cut-a §7, r9-cut-a §7, r10-cut-a §7,
gap-candidates-a §7, burnoffsets-a §7, and masterregress-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The cherry-pick (+ the fix swap) are the ONLY permitted uncommitted
  changes during the leg (plus the untracked instrument/tooling
  scratch). After the leg, the original `standing.js` is restored
  byte-identical (sha256 `75762cb2259d…`) AND the cherry-pick is
  undone (`git reset --hard` on the detached checkout / checkout
  back to the branch) before any evidence commit. If a restore fails,
  FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (optb L3
  HEALTHY_POLE_REDERIVED, gap-candidates reseed NO_GO,
  firstparent 4/8, vetphantom pole 6/8) — it tests only whether the
  COMBINATION re-derives the pole.
- Do NOT touch Loop A's tree (`sim-masterregress-a`) or claim — its
  cells are bare-base, this cell is base+policies; complementary, not
  duplicative. Do NOT touch the stall window or any other arm's
  branch.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class). If
  refused again, recorded, not waived, baseline NOT rolled.
- Ancestry notes (all verified at run start): `e6911eb80` is NOT an
  ancestor of `203a32775` (cherry-pick required); the tendexact
  marker is present in `e6911eb80:src/js/hierarchy.js` (1 hit) and
  absent at `203a32775` (0 hits); `203a32775` IS an ancestor of the
  pole `5157782a4`; `5d16916f4` (r131 fix) is NOT an ancestor of
  `203a32775`; the fix sha `f8fda429…` matches
  `5157782a4:src/js/standing.js`; the pre-fix sha `75762cb2…`
  matches `203a32775:src/js/standing.js`; the far-end policy sha
  `a7ff5c51…` matches `203a32775:scripts/policies/competent.js`.
- Flap note: the host write flap is intermittent today (cleared
  14:55Z, flickered once 15:03Z). The prereg + tooling are written
  and committed only after a probe (`git update-ref
  refs/heads/probe HEAD`) succeeds. If the flap returns mid-run,
  wait for it to clear rather than bypassing safe-commit; never route
  around a denial. The driver's writeRobust carries the reconciled-a
  Atomics.wait hardening so a burst cannot silently lose a seed.
  All scratch logs live under `~/workspace/scratch-loopb-1430/`,
  NEVER /tmp.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the leg: did the metric set hold, or does a
  metric need revision for the NEXT run?)
