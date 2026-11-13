# The +1 gap deciding test — pre-registration (arm sim-gap-candidates-a)

Run fleshout-20261113T0515Z, Loop A, axis scale-onramp.
Written and committed BEFORE any judged sim. Base: the collapse
window's far end `203a32775`. Healthy pole: pre-reconcile master
`5157782a4` (vetphantom fix leg: 6/8 survived). Band: seeds
190391–190398, competent verbatim, 150d death-aware, mode `fix`
only (with the roster-check fix swapped in, per the rederive
prereg). Instrument-only arm — ZERO `src/js` changes committed.

## The question

The tendexact re-derivation (arm sim-optb-rederive-a) re-derived
the healthy pole BY COUNT (5/8) but not by seed-pattern: it saves
190391 and keeps/improves 190395, but it does NOT save 190392
(lost d136 vs the far end's d144) or 190394 (lost d43 on every
leg). The pole saves both. The remaining +1 gap to the pole's 6/8
is 190392 + 190394. The arm-1 diagnosis (coordinator, read-only
from the committed corpora) says the gap is RNG-carried, not
design-carried: dialogue-variety commits shift the shared
`Math.random` stream, and the drifted stream changes fight
outcomes, re-engagement cadence (190394), and which wanderers
join (190392). This arm is the DECIDING TEST of that diagnosis.
The draft is a handoff, not a verdict — this prereg re-verifies
the diagnosis from the corpora under its own bar BEFORE any sim
(see §0).

## §0 — Re-verification of the arm-1 diagnosis (done by this worker, from the committed corpora)

Script (scratch, in /tmp, NOT committed): `/tmp/gap-verify-a.js`.
Corpora: pole `evidence/2026-11-11/perseed-vetphantom-b/` (fix
leg) vs L3 `evidence/2026-11-12/perseed-optb-rederive-a-tendexact/`;
firstparent `evidence/2026-11-11/perseed-bisect-firstparent-a/`
vs L1/L2 `evidence/2026-11-12/perseed-optb-rederive-a-{r125,favor}/`.
Per-day 4-field signature (vetsW3.count, vetsW4.count,
waveKillLog length, roster length incl. live count) + full
snapshot diff. All claims below were re-read by this worker,
not taken from the draft.

- **190394 — CONFIRMED.** Pole survives 150d; L3 lost d43.
  First signature divergence d40 (waveKillLog 38 vs 39 — one
  extra L3 kill, a hushwolf). First deep-diff day 17, counter-only
  (waveKills counter 8 vs 9, log length identical 14 — the
  vetcount-reconcile footprint, telemetry-only, as predicted).
  Eater fights: pole d40, d42, d45 (3 fights, HP 1008→950→763);
  L3 d40, d41, d42×3, d43×4 (9 fights in 4 days). L3 roster dies
  "the wild" d41 (Michelle Ahmed, the scholar), d42 (Gabriela
  Hayes, Daniyar Askarov, Daniel Medina), d43 (Luis Fernandez,
  Tashi Sherpa, Ursula Weber, Hannah Kim); village lost d43. Pole
  loses only Michelle d42 and Hannah d43 (a wound that wouldn't
  close); Gabriela takes over as scholar. Same spawn, same first
  fight (hp 1008 both legs) — the split is the flee/re-engage
  cadence after d40–41. No design mechanism in the tested set
  touches this seed (L1/L2/L3/L4 all lost d43).
- **190392 — CONFIRMED.** Pole survives 150d; L3 lost d136.
  First signature divergence d78 (waveKillLog 60 vs 59). First
  deep-diff day 52, counter-only (vetcount footprint). Joins:
  d78 pole gains Daniyar Askarov, L3 gains Nina Petrova; d80 pole
  gains Akai Nyamori + Nina Petrova (live 7→10), L3 stays 8; d81
  pole gains Mia Andersson (live 10), L3 gains Lyazzat Sarsenova
  (live 9). L3 then bleeds scholars (Olivia Bennett d83 "the
  wild", Nino Kapanadze d87 "the wild") and dies d136. Daniyar
  was never on either roster before d78 — he JOINS on the pole.
  Stream drift is visible before any kill/roster flip (fights
  d73–74: Ugly Beast HP 319 pole vs 305 L3; Reunion 2/3 1372/1309
  vs 1213/1264).
- **L1/L2 deep-identity — CONFIRMED with one method correction.**
  L1 and L2 vs the firstparent corpus are identical on both gap
  seeds through the loss day (d143 on 190392, d42 on 190394);
  end states identical (both lost d144 / d43, same waveKillLog
  length 62 / 40). My first script run flagged a day-144/43
  "divergence" that is a PAIRING ARTIFACT: each corpus carries
  TWO snapshots stamped with the loss day (the daily snapshot
  plus the final post-run snapshot), and a day-keyed map pairs
  the wrong two. Field-by-field, the final-day snapshots are
  identical. Deep-diff comparisons in this arm MUST pair
  snapshots index-aligned, never day-keyed, when duplicate day
  stamps exist.
- **Draw site — VERIFIED in code, not assumed.** r180
  (`28875b1b1`) is in the range (`git merge-base
  --is-ancestor 28875b1b1 5157782a4`; far end is its ancestor).
  Its markers are present at `5157782a4` and absent at
  `203a32775` (`git grep`: conversation.js:2175 `reframed ? line
  : this.voiceLine(vid, line)`; convo-wants.js:2730–2732
  `convoAckLines().indexOf(m[1]) !== -1`). The voiceLine skip
  removes 1–2 draws per reframed recap; the topic-ack skip
  removes the voiceLine call on a beat that already opens with
  an ack/change line. Reframed recaps fire routinely in ordinary
  play (that is what r180 fixed).

## Candidate legs (in order; each judged on its own GO bar)

| Leg | Configuration (far end + cherry-pick `-n`, uncommitted) | Why chosen |
|---|---|---|
| **L1 `r180`** | `28875b1b1` (conversation.js reframed-recap voiceLine skip + convo-wants.js topic-ack skip) | The only remaining commit in the range with a live, routinely-firing DRAW-REMOVAL. If the pole's save is a stream shift, removing draws is the most direct transplant of it. |
| **L2 `joint`** | `10fe7ee52` + `ed33b42b8` + `b09cf584e` (r125 secret-answer variety + teach-plant frames + r129/r130 favour-line pools + stateful cycle, TOGETHER) | Singles were deep-identical (re-verified §0) — the joint leg tests interaction through conversation flow: a line choice changing which later draws fire. |
| **L3 `reseed`** | NO code change. Same far-end base, same seeds, same world — the shared `Math.random` stream is shifted by a fixed burn (see §Reseed) after world generation. | Measures the band's RNG sensitivity directly. A flip here PROVES the gap is dice with no candidate needed. |
| **L4 `r172`** | `bd0bf10e2` (truth.js one-confession-per-sitting guard) | ONLY if legs 1–3 leave the question open AND the worker judges it cheap. Prereg judgment: too rare/indirect (a −3 trust deflect on a second confession in one sitting; no confession telemetry in the snapshots) — the worker MAY DROP it with a stated reason. |

Cherry-pick applicability was verified before any sim by
hunk-overlap analysis: r180's `src/js` hunks sit at
conversation.js ~2118/2172 and convo-wants.js ~2716; later range
commits' hunks in the same files sit elsewhere (r176 convo
guards @~1089; r129/r130 favour @13–1956). The joint leg's
hunks are the L1/L2 hunks, already verified applicable by the
rederive arm (L1 had non-behavioral DU conflicts on its own
evidence/test files only; L2 was clean). If a cherry-pick
conflicts on a BEHAVIORAL hunk at apply time, record the
conflict, abandon that leg, and move to the next — never
hand-resolve a behavioral hunk. Non-behavioral DU conflicts
(the commit's own evidence/test files, absent at the far end)
are resolved by taking the incoming versions, exactly as the
rederive arm did for L1, and the applied `src/js` hunks are
verified line-identical to the commit's `src/js` diff before
running.

## §Reseed — the L3 control design (why a burn, not a re-assignment)

The shared stream is `Math.random = mulberry32(seed)`, installed
by the harness BEFORE eval. A naive re-seed (`Math.random =
mulberry32(other)`) does NOT shift every draw site: five modules
capture the function object at load into a module-scope alias —
`betrayal.js:87`, `comms.js:115`, `corruption.js:47`,
`fieldFights.js:71`, `finale-campaign.js:28` (`const/var R =
Math.random`) — and a re-assignment leaves those aliases
pointing at the OLD stream. That includes `fieldFights.js`,
the fight engine: the Eater fight outcomes on 190394 run
through the alias. A BURN instead advances the ONE shared
mulberry32 instance, so every call site — aliased or direct —
shifts by the same N draws: the alias and the global are the
same function object with shared closure state.
**L3 method (pre-registered): after `setupGame` (world
generation: `genRoster` + `newGame` + `depart` all happen
inside `setupGame`, verified in `scripts/sim-harness.js`),
call `Math.random()` exactly 997 times (a fixed prime, chosen
before any sim), then run the 150 days.** Same code, same
seeds, same world, different play-phase dice. The only
in-game `Math.random =` is the `_worldRng` save/restore pair
(`game.js:10900–10902`, restores in `finally`) — a scoped
temporary swap, not a per-day reseed; verified by grep that
nothing re-seeds per day. The policy RNG (`__policyRandom`,
derived from the manifest seed inside `runDays`) is untouched
by the burn, so policy decisions are unchanged; only the
game's dice shift. `reseedBurn: 997` is recorded per seed.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric per leg: which of the gap seeds {190392,
190394} survive on the far end `203a32775` plus the leg's
configuration (with the fix swapped in), and whether any
far-end survivor is lost.** The far-end baseline (firstparent
leg): 190392 lost d144, 190394 lost d43; far-end survivors
190393, 190397, 190398 (plus 190395, which the pole LOSES —
keeping or losing 190395 is NOT part of this leg's bar, since
the pole itself loses it; it is reported only).

| Outcome | Verdict for that leg |
|---|---|
| **≥1 of {190392, 190394} survives AND 190393, 190397, 190398 all survive** | **GO** — the leg saves a gap seed with no regression on the baseline's survivors |
| **neither gap seed survives, OR a baseline survivor (190393/190397/190398) is lost** | **NO-GO for that leg** — move to the next leg |

"Without losing a pole survivor" is read as no regression
against the FAR-END baseline's survivors (190393/190397/
190398): a leg cannot lose what the base never had (190391
is a pole survivor the far end loses; a leg that fails to
save it has not regressed). This reading is fixed here,
before any sim.

**Run verdict (judged after all legs run):**

| Outcome | Run verdict |
|---|---|
| **ANY RNG-only leg (L1, L2, or L3) GO** | **GAP-IS-DICE** — the +1 gap question is CLOSED. The pole's extra save is a stream outcome; no design mechanism is owed for 190392/190394. The option-B search is complete. |
| **NO RNG-only leg GO** | **GAP-NOT-DICE** — the gap needs a design mechanism after all. The worker names the remaining design candidates (L4 r172 first among them, then any mechanism the legs' corpora suggest) as the next run's work. |

**Rank read (reported, not judged):** survived count on the
band vs the vetphantom fix leg's 6/8 and the firstparent
leg's 4/8; regional reach vs the pole's 8/8.

**Secondary (reported, not judged):** median survival vs
150d; death-cause shares vs the combat-heavy profile; wave-4
and wave-5 unlocks; national / table / wins; standing range;
tribute-ready (ladder read); blooded count; peak living
wave-4+ veterans per seed vs the bar of 2; phantom days —
defined CORRECTLY this time (carried correction from the
rederive evidence): "live count exceeds shadow" is a real
phantom; "shadow exceeds live during a collapse" is EXPECTED
(a killer whose vp record is alive but who is no longer on
the roster while the village falls apart) and is reported,
not judged. **Wave-5 choke:** report peak living wave-4+
veterans per seed vs the bar of 2. **ARC IV firing per seed
is a REPORTED field only** — it is not judged and no
threshold is set on it (the instrument does not capture ARC
IV; same standing as r9/r10).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical
  to all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME
  band as vetphantom, the firstparent, r5–r10 cuts, and every
  other bisect leg.** A control/bisect re-derivation re-runs
  the same seeds on old code plus a transplant; that is the
  point, not a freshness violation. Grep scope
  `evidence/*/sim-*-prereg.md` on master names seed 190391
  in 23+ prior preregs (same justification as every one of
  those preregs).
- **Policy: competent verbatim, SINGLE leg per candidate on
  the far-end base, mode `fix` only** (with the swap — see
  below). The driver enforces the leg guards (swap-aware
  standing guard + own-policy guard + candidate guard, all
  exact-match) and refuses to run otherwise. Policy confound
  notes (all verified by diff before any sim, not assumed):
  - `scripts/policies/competent.js` on `203a32775` vs
    `5157782a4` differs ONLY by the COUNTER_ANSWER block
    (env-gated OFF by default — inert unless
    `COUNTER_ANSWER=1`, which this run does not set). The
    driver runs the far end's OWN policy (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`)
    and refuses any other sha.
  - `scripts/sim-harness.js` is byte-identical between the two
    poles — the comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs, plus
    the candidate cherry-pick under test).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  copied from master as UNTRACKED scratch (never committed —
  it already exists on master and committing a duplicate would
  break the later rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and the
  bisect drivers. Driver:
  `scripts/gap-candidates-driver-20261113.js` — a clone of the
  optb-rederive driver with the corpus dir parameterized by
  leg (`evidence/2026-11-13/perseed-gap-candidates-a-<leg>/`),
  RUN = `gap-candidates-pilot`, arm = `gap-candidates`, mode
  fixed to `fix` only, plus the swap-aware leg guard (exported
  `legGuard`, exact-sha), the own-policy guard (exported
  `legGuardPolicy`, exact-sha), a per-leg candidate guard
  (exported `candidateGuard`, marker strings verified present
  at `5157782a4` and absent at `203a32775` before any sim),
  the L3 no-code-change guard (exported `noCodeChangeGuard`:
  `git diff --name-only -- src/js` must list exactly
  `src/js/standing.js`), and the L3 burn (exported
  `RESEED_BURN = 997`, applied after `setupGame`).
  **`\belder\b` filter:** the driver carries the tightened
  veteran-say regex `\\belder\\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10.
- **Corpora:** `evidence/2026-11-13/perseed-gap-candidates-a-<leg>/`
  — 8 per-seed JSONs per leg; one summary JSON per leg
  (`evidence/2026-11-13/gap-candidates-a-<leg>-summary.json`).
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far.
  Compare each leg's corpus against the firstparent corpus
  (`evidence/2026-11-11/perseed-bisect-firstparent-a/`) and the
  vetphantom fix corpus, plus a full daily-snapshot deep-diff
  **pairing snapshots INDEX-ALIGNED, never day-keyed** (the
  duplicate loss-day stamps make day-keyed pairing pair the
  wrong snapshots — see §0). Veteran killers in the instrument
  are keyed `by`, not `vid` — a phantom check reading `k.vid`
  silently checks nothing.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `203a32775`, `src/js/standing.js` is the PRE-FIX version
(sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
hashed by this arm from `git show 203a32775:src/js/standing.js`
— NOTE: this differs from the r9 base's pre-fix sha
`98c8bfad70d7…`, because the wave5kill lever (commit
`203a32775` itself, 390–393) added the BLOODED block to this
file; the r131 roster-check fix (`5d16916f4`) is NOT an ancestor
of this base). Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
firstparent / r5–r10 preregs: the FIX `standing.js` is extracted
with `git show 5157782a4:src/js/standing.js`, its sha256 verified
to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the far end's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `cmp` clean plus `git status`
showing no `src/js` modification. The `standingSha` in use is
recorded per seed in the corpus. The swap keeps the comparison
apples-to-apples: every leg in this bisect runs WITH the roster
check. **The swapped file itself is never committed.** The
driver refuses to run unless the on-disk `standing.js` carries
the "ROSTER CHECK" marker AND its sha256 is exactly the fix sha
— an unswapped run is refused loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not
assumed):

- **BLOODED rider, LIVE on this base (unlike r9).** The fix
  file differs from the far-end base's `standing.js` in exactly
  one hunk: the ROSTER CHECK (`if (roster.indexOf(vid) < 0)
  return false;`) — the BLOODED block (`bloodedCfg` /
  `bloodedLine` / `villageBlooded`) is present in BOTH, because
  the wave5kill lever landed in `203a32775` itself. On this
  base the block HAS callers (the wave5kill hookup in
  `fieldFights.js` / `game.js`), so the swap introduces NO
  blooded delta at all: the only live behavioral delta the swap
  introduces is the roster check. The driver's end-of-run
  `blooded` read is a report field.
- **Ladder scholar rule — LEG 3, same as round 5–10.** This
  base's `ladder.js _ladderLivingVeterans` is the old inline rule
  (`vp && !vp.dead`, no roster check) with the LEG 3 tribute
  scholar-readiness fix layered on: the scholar is NEVER counted
  (`if (!vid || vid === this.villagerId) return false;`) —
  verified by reading the function at `203a32775`. There is no
  `countLivingVeterans` on this base. `5157782a4` / master use
  the shared `countLivingVeterans` (roster check + scholar
  counts, commit `3995d21d6`). The proof test detects which
  scholar rule the LOADED game carries from
  `_ladderLivingVeterans` source and asserts the matching count
  (a scholar wave-3 kill reads 1 in the swapped-in readiness
  gate and the instrument, 0 in this base's ladder); the
  survival read comes from the harness end state, not the
  ladder. (The L1–L3 cherry-picks do not touch `ladder.js`,
  so this rule is the same on every leg.)

## Balanced panel (§15) — N/A

Instrument-only legs, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
vetphantom fix leg vs each candidate leg on identical seeds,
judged by the analyzer's decision rule. Same standing as
survivalcontrol-b §7, anchor-a §7, merge-a §7, origin-a §7,
mergebase-a §7, r5-cut1-a §7, r5-cut2-a §7, r6-cut-a §7,
r7-cut-a §7, r8-cut-a §7, r9-cut-a §7, and r10-cut-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap + the cherry-pick are the ONLY permitted uncommitted
  changes during a leg (plus the untracked instrument scratch).
  After each leg, the original `standing.js` is restored
  byte-identical (sha256 `75762cb2259d…`) AND the cherry-picked
  files are restored byte-identical (`git checkout -- <files>`
  + `git status` clean of `src/js` modification) before the
  next leg or any evidence commit. If a restore fails, FAIL
  LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, r9-cut INCONCLUSIVE, r10-cut
  INCONCLUSIVE, tendexact HEALTHY_POLE_REDERIVED-by-count, and
  all earlier bisect verdicts) — it tests the +1 gap only.
- Do NOT cut at commits 390–393 (the r10 remainder): a cut there
  can only localize the 190393/190397 remainder, it cannot
  return CUT_HEALTHY — that is a separate question, not this
  arm's. Do not touch the stall window (commits 58–65) — the
  stallcut61 arm owns it.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this
  leg's decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior bisect arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT
  rolled.
- Ancestry note: `203a32775` is an ANCESTOR of `5157782a4`
  (their merge-base is `203a32775` itself), not the reverse —
  do not assume a linear order between the healthy base and the
  local merge-tip. `ee30f22a2` (385th) is an ancestor of
  `203a32775`; `c67a17564` (389th) is an ancestor of
  `203a32775`; all verified.
- Flap note: a host write flap (EPERM on git ref writes and
  some file writes) was ACTIVE at 04:44–05:23Z and intermittently
  after; the flap-watch log read ALL-OK 05:25–06:11Z. The prereg
  + tooling are written and committed only after a probe
  succeeds; the tree is heartbeated after. If the flap returns
  mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial.
- Merge note (rederive precedent): this worktree runs on a
  DETACHED HEAD at the far end `203a32775` — the driver and
  proof only make sense on that base (standing pre-fix sha,
  own-policy sha). The tooling + evidence commits live on the
  detached HEAD; the coordinator adopts them BY SHA. Do NOT
  rebase onto master (it would break the experiment substrate)
  and do NOT merge to local master from here.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the legs: did the metric set hold, or does a
  metric need revision for the NEXT run?)
