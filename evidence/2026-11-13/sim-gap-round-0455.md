# ADOPTION HEADER — read this first (added 2026-11-13, Loop A run fleshout-20261113T1015Z)

Adopted from `hidden_files/sim-gap-round-0455-DRAFT.md` (verbatim below this
header) into `evidence/2026-11-13/sim-gap-round-0455.md`, as the tracker
queued ("adopt into evidence + commit when the flap clears" — flap ALL-OK
this run). The draft's own verdict was CONDITIONAL: "DIAG-GO ... pending arm
2's deciding test ... Until arm 2 runs, this verdict is a coordinator
diagnosis, not a judged verdict."

Arm 2 HAS since run, and it resolves the condition AGAINST the draft:
sim-gap-candidates-a (commit `4d79e6056`, evidence
`evidence/2026-11-13/sim-gap-candidates-a.md`) returned GAP-NOT-DICE —
r180 / joint-RNG / r172 legs NO-GO and deep-identical, reseed control NO-GO
3/8, no RNG-only leg saved either gap seed. Two further arms have since
hardened that result: sim-tendshift-a (tendexact x stream-shift interaction
NO-GO, `0b22103b0`) and sim-burnoffsets-a (five more offsets, all NO-GO,
`377e12141`); the stream question is parked after 6 sampled offsets
(997 + 1 + 13 + 251 + 499 + 1999). The +1 gap question is therefore NOT
closed as dice. The draft's conditional DIAG-GO does NOT stand as a judged
verdict.

What DOES stand from the draft: the diagnostic analysis — the r180 draw-site
verification in code, the per-leg exclusions (§4), and the two sense findings
VOICELESS EATER and VOICELESS JOINS (filed in sim-findings.md 2026-11-13).
Read the verdict section below as a superseded coordinator diagnosis, not as
the standing answer.

---

# The +1 gap to the healthy pole — diagnostic evidence (arm sim-gap-diag-a)

Run fleshout-20261113T0455Z, Loop A, axis scale-onramp.
**DRAFT — NOT committed to the repo.** The host write flap (see Infrastructure)
blocked worktree registration and every commit this run, so this evidence is
filed in the goal hidden_files for the next run to adopt, verify, and commit
into `evidence/2026-11-13/sim-gap-round-0455.md`. The arm-1 analysis below was
done by the coordinator, read-only, from the committed corpora; the adopting
worker MUST re-verify it under its own prereg (the draft is a handoff, not a
verdict already judged). Arms 2 and 3 were NOT spawned — see §9.

Prereg: none filed before analysis (coordinator diagnostic; no judged sims
were run — all reads are from committed corpora). The arm-1 worker's prereg
must state the GO bar before it re-judges: name the saving mechanism per gap
seed with day + actor + fight, or NO-GO if indistinguishable.
Base / poles: far end `203a32775`, healthy pole `5157782a4` (vetphantom fix
leg, 6/8 survived). Band: seeds 190391–190398, competent, 150d death-aware.
Corpora compared: `evidence/2026-11-11/perseed-vetphantom-b/` (pole fix leg)
vs `evidence/2026-11-12/perseed-optb-rederive-a-tendexact/` (L3 leg).
Method: per-day snapshot diff (4-field signature + full deep-diff, the
optb-rederive compare method), kill-log / fights / spawns / deaths reads.
Scratch scripts (in /tmp, not committed): /tmp/gap-diag-0455.js,
/tmp/gap-diag-392.js, /tmp/gap-diag-394.js.

## Verdict

**DIAG-GO — the +1 gap is RNG-carried, not design-carried.** On both gap
seeds the pole's save runs through the shared `Math.random` stream: the
dialogue-variety commits in the range shift the stream, and the drifted
stream changes fight outcomes, re-engagement cadence, and which wanderers
join. No design mechanism in `203a32775..5157782a4` remains untested that
could carry the gap — L1 (r125), L2 (favor), L3 (tendexact) and L4 (grants)
are all NO-GO or deep-identical on these two seeds, and every excluded item
is excludable on the corpora (see §4). The deciding test is arm 2 (§9): an
RNG-only leg (r180, joint-RNG, or a reseed control) saving a gap seed would
CONFIRM dice; if none does, this verdict is wrong and the gap needs a design
mechanism after all. Until arm 2 runs, this verdict is a coordinator
diagnosis, not a judged verdict.

Consequence to state plainly: the "healthy pole" is partly a dice artifact.
The tendexact re-derivation by count stands (a real mechanism: +1 survival,
end pantries 21,975 / 9,893 kcal, two new wave-5 unlocks). But the remaining
+1 to the pole's 6/8 is NOT a missing design mechanism to go find — it is
the stream. The next run's work is the arm-2 deciding test, not another
candidate transplant for these two seeds; if arm 2 confirms dice, the
option-B search is complete and the +1 gap question is CLOSED as DICE.

## §1 — Seed 190394: the Eater re-engagement cascade

- All four tested legs are deep-identical to the far end on 190394 (L1,
  L2, L3, L4 — lost d43 on every one). No tested design mechanism touches
  this seed.
- Pole vs L3: counter-only divergence from d17 (waveKills pole 8 vs L3 9
  wave-1 — the vetcount-reconcile footprint, telemetry-only, exactly as
  the rederive prereg predicted). First BEHAVIORAL divergence d40: L3 has
  one extra kill (hushwolf w1 by Gabriela Hayes); Michelle Ahmed HP 91
  (pole) vs 95 (L3); ad_break spawn HP 377 (pole) vs 363 (L3). The stream
  had already drifted before d40.
- The Eater (w4, hp 1008, defHp 950–1150) spawns d39 on BOTH legs (same
  caller `Object.checkEncounter`, same def range). Both legs fight it d40
  (hp 1008, identical). Then the cadence splits: the pole fights it d40,
  d42, d45 — 3 fights, HP 1008→950→763, wounding it, surviving. L3 fights
  it d40, d41, d42×3, d43×4 — 9 fights in 4 days. L3's roster dies "the
  wild" d41 (Michelle Ahmed, the scholar), d42 (Gabriela Hayes, Daniyar
  Askarov, Daniel Medina), d43 (Luis Fernandez, Tashi Sherpa, Ursula
  Weber, Hannah Kim) — village lost d43. The pole loses only Michelle d42
  ("the wild") and Hannah d43 (a wound that wouldn't close); Gabriela
  Hayes takes over as scholar; the village survives 150d, end pantry
  6,968 kcal, standing 199.
- Mechanism: same spawn, same first fight — the split is the
  flee/re-engage decision after the d40–41 fights. The drifted stream
  changes engagement/nerve rolls, so L3 feeds the Eater nine fights in
  four days while the pole spaces three fights over six days and lives.
  The instrument records no per-fight casualty detail, so the exact roll
  that flips the first re-engagement is not visible in the corpora — the
  arm-2 deciding test is what names the draw site, not this read.

## §2 — Seed 190392: the join lottery

- L3 shares the pole's d37 divergence vs the far end (a wave-3 kill
  missing) — not the saver. Stream drift is visible before any
  kill/roster flip: damage-roll differences d71 (Javier ONeill HP 80.62
  pole vs 81.36 L3; Kofi Kong 14 vs 19) and spawn-roll differences d73–74
  (redactor 319 vs 305; Reunion 1372/1309 vs 1213/1264). Counter-only
  divergence from d52 (vetcount footprint). Deaths identical through d74
  (gen_vispq3g d56, gen_e87s06n d57, Javier d73, Kofi d74 — same both legs).
- First behavioral divergence d78: the JOIN LOTTERY. The pole draws
  Daniyar Askarov (d78), Akai Nyamori (d80), Nina Petrova (d80), Mia
  Andersson (d81) — roster 7→10, armed/armored 8→10. L3 draws only Nina
  Petrova (d78) and Lyazzat Sarsenova (d81) — roster stays 8, then bleeds
  scholars (Olivia Bennett d83 "the wild", Nino Kapanadze d87 "the
  wild", Ruth Goldstein next) and dies d136. Pole survives 150d, end
  pantry 9,340 kcal.
- CORRECTION (recorded because the first roster-diff read misled):
  Daniyar Askarov was NEVER on the 190392 roster before d78 on either
  leg — he JOINS on the pole d78; he does not die on L3. (No daniyar
  death row exists on either leg; the join script proves first roster
  appearance d78 pole, never L3.)
- L4 dies even earlier (d126) than L3 (d136) vs the far end (d144) — the
  seed's fate flips with the stream across legs. Same conclusion as
  190394: the save is a stream outcome, not a design mechanism.

## §3 — The draw site (verified in code, not assumed)

r180 (commit `28875b1b1`, "journey crisis r180: fix Q3 voice-line
stacking") is the only remaining commit in the range with a live,
routinely-firing draw-count change. Verified by reading current master
`src/js/conversation.js`:
- Line 2365 (the r180 site): `return reframed ? line : this.voiceLine(vid, line);`
  — a reframed recap returns unvoiced, SKIPPING the voiceLine call.
- `voiceLine` (line 688) draws `Math.random()` at line 732
  (`Math.random() >= p` — the open/close gate) and line 748
  (`Math.random() < 0.45` — the open/close choice). Every skipped
  voiceLine removes 1–2 draws from the shared stream.
- Reframed recaps fire routinely in ordinary play (that is what r180
  fixed: Q3 voice-line stacking in journey-crisis transcripts).
- By contrast, r125's secret-answer and teach-plant draw sites and the
  r129/r130 favour-display sites NEVER fired differentially on this band
  (L1/L2 deep-identical to the far end, 8/8 seeds) — they cannot carry
  the gap alone. The joint r125+favor leg could still shift the stream
  through conversation-flow interaction (a line choice changing which
  later draws fire), which is why arm 2 tests it.

## §4 — Exclusions (why nothing else in the range carries the gap)

- tendexact (L3): deep-identical on 190394; loses 190392 d136 (earlier
  than the far end's d144). Tested, not the carrier.
- grants (L4, run fleshout-20261113T0215Z, NO-GO 3/8): deep-identical on
  190394; loses 190392 d126. Tested, not the carrier.
- r125 (L1) / favor (L2): deep-identical to the far end on both gap
  seeds (and 8/8 overall). Tested, not the carrier alone.
- vetcount-reconcile (`a80b2d789`): counter/telemetry only. Its footprint
  (waveKills counter diverging from d17 on 190394, d52 on 190392, while
  the kill LOG stays identical) is visible and inert — it cannot flip a
  fight or a join.
- scholarcount (`3995d21d6`): tribute-readiness read only; tribute is
  never delivered on either leg on either seed.
- F1 party-role death release (`82450a883`): `partyMembers` is identical
  on both poles on all 8 seeds; no party exists on 190394.
- ANSWERMAIL_DRIVE (`43c6742e0`) / COUNTER_ANSWER: env-gated OFF on
  both legs as run.
- Roster check (`5d16916f4`): equalized by the fix-swap on both legs.
- r172 confession guard (`bd0bf10e2`): a −3 trust deflect on a second
  confession in one sitting. Not excluded by the corpora (no confession
  telemetry in the snapshots) — stays residual, but the prereg's
  judgment stands: too rare and too indirect to carry a 2-seed swing.
  Arm 2 may test it only if legs 1–3 leave the question open.
- Remaining dialogue/text (r124/r129/r130 bridge pools, r169/r170/r179
  guards, r130 trust naming): no draw-count change, no state effect.

## §5 — Wall numbers (this run's judged corpora: none — diagnostic read only)

No new sims were run (flap-blocked; see Infrastructure). Wall numbers
below are the RE-READ of the two corpora this diagnostic compares, for
the record:
- Pole (vetphantom fix leg, 5157782a4): survived 6/8, regional 8/8,
  national 0/8, table 0/8, wins 0/8, wave-5 1/8 (190393 only on this
  leg's end states; 190398 reaches wave 5 on L3, not here — see the
  rederive evidence for the full table), median 150d.
- L3 tendexact (e6911eb80): survived 5/8, regional 7/8, national 0/8,
  table 0/8, wins 0/8, wave-5 4/8, median 150d.
- Gap seeds: 190392 pole survived / L3 lost d136; 190394 pole survived /
  L3 lost d43.
Telemetry deviation check: NOT run — no per-seed evidence glob was
produced this run (diagnostic read of existing corpora only). Baseline
NOT rolled.

## §6 — Sense-testing (transcripts)

- 190394 pole, d38–45 say sample (vetSays, 38 lines total on the seed):
  only 2 lines, both System broadcast — a veteran-kill announcement
  ("Leo just put down Ad Break... on CAMERA") and a Mirror Draft
  announcement. NOBODY names the Eater, warns about it, or marks the
  scholar's death d42. Same family as the voiceless-shortfall finding
  (seed 190398 wave-5 hold). Filed: sim-findings.md [open] 2026-11-13
  "VOICELESS EATER".
- 190392 pole, d76–83 say sample (vetSays, 47 lines total): 2 lines —
  a foraging-basket line and a door-defense beat (names fighters, hurt —
  good, consequential). The four joins d78–81 pass in TOTAL silence; no
  line announces any arrival. Daniyar is first mentioned d89 (teaching
  European Elder), Mia d90, Nina d108. The winnability chain's first
  link (wild ally-join) passes unvoiced. Filed: sim-findings.md [open]
  2026-11-13 "VOICELESS JOINS".
- No robotic, static, or repeated dialogue surfaced in the sampled
  lines beyond the two voiceless gaps above. The door-defense beat and
  the veteran-kill announcement read coherent and consequential.

## §7 — Metric review (§14)

No metric was pre-registered for this run (no judged sims; the
diagnostic is a corpus read, not a measurement). The arm-1 worker's
prereg must carry the GO bar (name the mechanism per seed, or NO-GO).
One correction owed, carried from the rederive evidence: the prereg's
"phantom days (0 expected)" is wrong as stated — a collapsing village
legitimately shows shadow-over-live days while its roster falls apart
(190394 shows 5 phantom days on ALL legs including the far-end
baseline). The next prereg should define phantom days as "live count
exceeds shadow" (a real phantom) vs "shadow exceeds live during a
collapse" (expected), or drop the field to report-only with that note.

## §8 — Infrastructure (flap-blocked run)

- Host write flap ACTIVE and intermittent for the whole run (onset
  ≤04:44Z; still failing at 05:23Z on a NEW boot id 51308e8e after a VM
  replacement ~05:23Z). Atomic renames + git ref writes + O_EXCL fail
  (EPERM errno 1); plain file writes OK. Clear windows observed:
  04:56:37–04:59:41Z (~3 min), 05:05:47–05:06:48Z (~1–2 min).
  Single clear probe 05:11:42Z preceded a registration that failed at
  its final index reset after a ~10-min checkout (sibling load: a
  playtest-loop registration ran concurrently).
- Registration attempts (3): all failed. Attempt 1 (~04:57Z) failed at
  index reset after checkout; left orphan branch sim-gap-diag-a at
  f06c8e4e7 (deleted 05:11Z, re-created by the failed attempt 3 — the
  branch EXISTS again at closeout with no worktree; the next run must
  `git branch -D sim-gap-diag-a` in a clear window before re-registering
  that slug, or pick a fresh slug). Attempts 2/3 failed on ref-write
  EPERM or the same index reset. `git worktree add` checkout takes
  3–10 min under load — longer than any observed clear window, so
  registration is structurally blocked until the flap clears for longer
  than a checkout.
- worktree-reap.sh re-ran clean after the 04:56Z clear (active 9/16).
  sim-proofrefresh-b10 has uncommitted changes (Loop B's live tree —
  NOT touched). Pre-flight at run start: main tree clean, disk 35%.
- No merges, no pushes, no version bumps. Main tree clean at closeout
  (verified). Lock + claim deleted at closeout (this file + the claim
  record the run; the draft evidence lives in hidden_files, not the
  repo, so the main tree stays clean).

## §9 — Next blanks (in order; arms 2–3 UNCLAIMED, for the next run)

1. **Arm 2 sim-gap-candidates-a — the deciding test.** Transplant sweep
   of the rederive prereg's residual list onto the far end 203a32775
   (same option-B method: cherry-pick `-n`, uncommitted; fix-swap
   standing.js; candidate guards; driver/analyzer/proof on master,
   tooling commit a34329f61). Legs: (a) r180 draw-removal
   (`28875b1b1`); (b) joint r125+r129/r130 (L1+L2 together); (c)
   same-code RNG-reseed control (no code change — measures the band's
   RNG sensitivity directly); (d) r172 confession guard (`bd0bf10e2`)
   only if (a)–(c) leave the question open. GO bar per leg (worker
   pre-registers before sims): saves ≥1 of {190392, 190394} without
   losing a pole survivor on the band. Run verdict: if ANY RNG-only leg
   saves a gap seed, GAP-IS-DICE and the +1 gap question is CLOSED; if
   NONE does, GAP-NOT-DICE and the worker names the remaining design
   candidates. Seeds 190391–190398, 150d death-aware, competent
   verbatim, mode fix only. No [needs-eyes] (instrument-only).
2. **Arm 3 sim-tendexact-confirm-a — fresh-seed confirm.** Far end +
   tendexact (`e6911eb80`) on a FRESH 8-seed band vs the far-end baseline
   on identical seeds. Band freshness per the local_seed_band_freshness
   skill (grep ALL preregs + forbidden/contaminated lists + screens).
   Coordinator's preliminary grep found NO use of 190401–190408 in
   evidence/2026-11-*/sim-*.md (190419–190434 IS used — mcconfirm ctrl
   band, do NOT use it), but the worker MUST do the full check and
   record it in its prereg. GO bar (worker pre-registers): tendexact
   survives ≥ baseline+1 AND ≥5/8, median ≥0.8× baseline, starvation
   ≤ baseline+2 — else NO-GO. 150d death-aware, competent verbatim.
   No [needs-eyes].
3. **Proof refresh round 10** — Loop B owns (0330Z claim, live) — do NOT
   pre-claim.
4. **Headcount-ceiling** (sim-findings, Steve-call) and **Reunion mirror
   pack in the wild** (sim-findings, Steve design call) — NOT claimed.
5. **Voiceless Eater + Voiceless Joins** — two new open findings filed
   this run (sim-findings.md 2026-11-13); the voice arm that takes them
   should announce Eater-class threats and wild ally-joins.

## Convergence state

scale-onramp stays converging (NOT converged): the +1 gap is diagnosed
as RNG-carried (pending arm 2's deciding test), national/table/wins are
0 on every corpus in this comparison, and no lever has moved the wall
numbers this run (no sims run). The standing directive stands until the
tracker records this axis converged on measured evidence. food-economy
stays converging (untouched; parked). winnability chain: Loop B live on
0330Z claim — NOT touched.
Claim deleted; lock deleted.

## Corpora + handoff files

- `evidence/2026-11-11/perseed-vetphantom-b/` (pole fix leg, committed)
- `evidence/2026-11-12/perseed-optb-rederive-a-tendexact/` (L3 leg, committed)
- `evidence/2026-11-12/optb-rederive-a-deepdiff.log` (committed)
- `hidden_files/optb-rederive-compare-20261112.js` (compare script, kept)
- `hidden_files/gap-diag-draft-20261113T0455Z.md` (coordinator working
  draft: arm briefs + worker spawn template + flap log — read this
  BEFORE spawning arms 2–3)
- This file: `hidden_files/sim-gap-round-0455-DRAFT.md` (adopt into
  `evidence/2026-11-13/sim-gap-round-0455.md` + commit when the flap
  clears)
