# Hold-beat diagnostic — Loop A, run fleshout-20261104T0820Z, arm sim-holdbeat-a

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: zero src/js
changes, zero policy-file changes, zero gate/price/deed/standing/
veteran-counting changes. This arm answers the two timing questions
sim-killconv-a left open, with instrumented evidence — neither is
claimed as a bug without proof, and neither needed one: Q1's
"near-miss" dissolves on door state, Q2's timing question resolves
to a proven read-order mechanism (see below for exactly what that
means and does not mean).

## Pre-registration (committed before any judged sim)

`evidence/2026-11-04/sim-holdbeat-a-prereg.md` (commit fc483a078).
Policy `scripts/policies/competent.js` `{competent}` VERBATIM at
this anchor, default env. Horizon 140 days, death-aware. Balanced
panel (§15): INAPPLICABLE — a pure diagnostic with no variant; no
comparison is fabricated. Proof `scripts/test-holdbeat-20261104.js`
6/6 before the pilot leg and re-run green after the judged legs.

DIAG-GO bar (both required): Q1 definitive — for EVERY day of
EVERY overlap window, living-veteran count, readiness-5 readout,
standing breakdown + capped, peak/door state, natural gate-
evaluation count, and release fired or not (or, if no window
occurs, demonstrably captured veteran counts + stated closest
approach); Q2 definitive — credit-vs-beat order proven on at
least one kill case (same-day hold beat + kill credit with `seq`
ordering + beat-moment veteran count).

## Calibration gate — anchor move, targets re-found (not pooled)

The old corpus is NOT this arm's baseline (prereg anchor-move
rule). At this anchor both targets re-appeared, in changed
shape: 99110's overlap is 1 day (d108) here, not d108–d109
(nadia dies d109, as before, so the second day is gone);
99101's d134 kill + hold beat re-appeared exactly (same
killer, same beast, same day). All numbers below are this
anchor's judged legs only.

## Judged legs

Instruments commit 9047ce869 (seq-ordered kill/beat/gate
capture, overlap windows, fight-start beast HP). Pilot first
(99110 + 99101): the instrument captured door state on 99110
and beat order on 99101, so the fresh band was spent. Fresh
band 99701–99708 verified fresh (no day-`.md` filename or
content mention before this run).

### Per-seed (pilot / fresh)

| seed | days | end | maxWave | peak | windows | window days | max living vets | w4 kills | hold beats | rel5 | errors |
|------|------|-----|---------|------|---------|-------------|-----------------|----------|------------|------|--------|
| 99110 | 140 | survived | 4 | 4 | 1 | 1 | 2 | 2 | 4 | 0 | 0 |
| 99101 | 140 | survived | 4 | 4 | 0 | 0 | 1 | 1 | 2 | 0 | 0 |
| 99701 | 140 | survived | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 99702 | 81 | lost | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 99703 | 76 | lost | 4 | 4 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| 99704 | 86 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 99705 | 123 | lost | 4 | 4 | 0 | 0 | 1 | 3 | 6 | 0 | 0 |
| 99706 | 74 | lost | 4 | 4 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| 99707 | 90 | lost | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 99708 | 111 | lost | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Pooled 10 seeds: median survival 100.5 days (sorted 74, 76,
81, 86, 90, 111, 123, 140, 140, 140; 3 censored at the
horizon). Wins 0/10, national 0/10, table 0/10, wave-5
unlocks 0/10, wave-5 faced 0/10, wave-5 releases 0/10. Zero
instrument errors and zero gate/recount mismatches on all 10
legs. The scale wall stands.

## Q1 — the overlap window: door closed, correctly, twice over

99110's overlap window at this anchor is exactly ONE day:

| day | living veterans | readiness-5 | standing (war/diplo/plenty) | capped | peak | gate evals | release5 |
|-----|-----------------|-------------|------------------------------|--------|------|------------|----------|
| 108 | 2 (lena_ruiz, nadia_khoury) | NOT ready, short: armor only | 175/0/20 | 195 | 4 | 51 | NO |

The two d108 kills: lena (congregation, companion, fight-
start 450/900 HP — pre-wounded) and nadia (influencer,
player, fight-start 637/850 HP — pre-wounded). The day
before (d107): 0 veterans, capped 145. The day after
(d109): 1 veteran (nadia died d109, cause "the wild"),
capped 195, short armor + weapons + veterans.

Answer: NO, the door was not open on any standing-sufficient
day in the window — because the window contained NO
standing-sufficient day. Capped 195 is 5 short of 200, AND
readiness-5 was short on armor as well. The gate was
evaluated naturally 51 times on d108 (the instrument counts
`villageStandingTotal()` calls; the door was looked at, not
skipped) and correctly held: peak stayed 4, no release beat
fired, and the end-of-run `unlockedWave()` call did not move
the peak either (4 → 4). The old "one-day overlap" is NOT a
near-miss release: on its only day the village failed two
independent bars. The follow-up question is answered, and
the "unknown" is retired: the overlap did not fail to
release — it was never release-eligible.

Corroboration — the window is the ONLY overlap in 10 legs.
The fresh band's closest approach, 99705, makes the same
point from the other side: it holds exactly 1 living veteran
for weeks (d81–d96 hannah_kim, d99–d121 aroha_ngata, with
d97–d98 at 0 after hannah dies d96 "the night") while
capped climbs 210 → 375 — standing-sufficient for over a
month, held on veterans alone. Aroha kills twice (d99
influencer 411/850, d114 strike 665/1000) but the veteran
count counts DISTINCT killers, so her second kill adds
nothing; the village still needs a second living killer.
99705's six hold beats (d87–d122, weekly cadence) all read
"1 of 2 veterans" with beat count == moment count == 1 —
true post-credit counts, no timing artifact there. No fresh-
band day ever pairs capped >= 200 with 2 living veterans.

## Q2 — hold-beat timing: read-order artifact, PROVEN

99101 d134, the killconv case, reproduced exactly. Sequence
numbers from the instrument's single global counter (kill
entry → gate entry → beat → gate exit → kill credit):

- kill entry (recordWaveKill, eulogy, player, gen_o1uj9aa):
  seq 6142
- gate call (villageStandingTotal) entry: seq 6143
- hold beat: seq 6144 — "The fifth draft stays in the wings.
  It wants a village that can fight — blood your fighters
  (0 of 2 veterans)." Beat-moment veterans 0, log length 56.
- gate call exit: seq 6145, gated total 199 (the defer5 hold)
- kill credit (waveKillLog append): seq 6156, log length 57

The beat fires INSIDE the kill's own `recordWaveKill` call,
before the kill is appended to `waveKillLog`. The code order
in `src/js/game.js` `recordWaveKill` confirms it: ledger
scoring, then `checkWaveUnlockBeat()` (which reads
`villageStandingTotal()` → `_standingHoldBeat`), and only
then the `waveKillLog.push` that the veteran count reads.
So the beat's "0 of 2 veterans" is computed from the
PRE-KILL log — a read-order artifact, not a count gap. The
count itself is correct for the state at the moment of the
read; the read simply happens before the credit lands.

What this does and does not mean:

- DOES mean: a player reading the d134 end block hears the
  System say "0 veterans" in the same breath as the kill
  that makes a veteran. The narration is stale by one
  credit, on the exact day the kill also pushes standing to
  the threshold (gated total moves 185 → 199 across the
  d134 kills; end-of-day capped 210, ready false, short
  veterans only). The beat is the FIRST defer5 beat (no
  earlier hold beat on 99101), triggered by the kill's own
  unlock check.
- DOES NOT mean: the gate miscounts veterans, or the door
  mis-fires. After the credit, the very next gate calls read
  the kill: end-of-day d134 shows 1 veteran, capped 210,
  short veterans only. The weekly reminder d141 again reads
  "0 of 2 veterans" — but by then gen_o1uj9aa has died
  d135 ("the wild"), so d141's 0 is a TRUE post-credit
  count, not the artifact. The artifact is confined to the
  kill's own call.
- No fix is made here (DIAG ONLY). The named fix, if a
  future arm wants it, is ordering inside `recordWaveKill`:
  append the `waveKillLog` entry BEFORE `checkWaveUnlockBeat()`,
  so the beat the kill triggers counts the kill. That is a
  one-ordering change to document, not a gate/price/deed
  change — but it is NOT landed by this arm and must not be
  cited as landed.

No second kill-day hold beat was found: the fresh band has
no hold beat on any kill day (99705's beats fall between
kills), and 99110's d108 kills drew no hold beat at all
(only the companion vetkill beat for lena). The pilot case
is the proof; the fresh band neither confirms nor
contradicts it, it simply adds no second case.

## Sense-testing (2 transcripts read and judged)

1. VETERAN-KILL BEAT — 99110 d108 (lena, companion):
   "Oh — OH. Everybody saw that, right? Lena just put down
   The Congregation... on CAMERA. That's a veteran kill,
   folks. REMEMBER the name." Reads as a show moment, and
   the village noticing is coherent. BUT the beast entered
   the fight at 450/900 HP — a finishing blow on a half-dead
   beast, narrated identically to a fresh kill. The
   fresh-vs-mop-up distinction killconv flagged is reproduced
   here with fight-start HP, and the fresh band sharpens it:
   99703's maya_singh kills a suburb at 1/1300 HP, 99706's
   sari_wulandari finishes a eulogy at 169/900, 99101's own
   d134 eulogy kill enters at 440/900. The gate counts all
   of these as veterans identically; the narration does not
   distinguish them either. Whether "veteran kill" should
   mean "fresh kill" or "killing blow" is a design question,
   not a bug claim — but a player who watches a 1-HP
   mop-up get the same celebration as a full-HP duel will
   notice.
2. HOLD BEAT — 99101 d134 (see Q2): "The fifth draft stays
   in the wings. It wants a village that can fight — blood
   your fighters (0 of 2 veterans)." Sensible as a sentence,
   wrong as timing: it lands inside the kill that answers
   it. A player has no way to know the count predates the
   credit; the beat reads as the System ignoring the kill
   it just watched. The d141 reminder, by contrast, reads
   correctly (the killer is dead by then; 0 is true).

## Metric review (§14 — no in-run re-scoring)

- No metric was re-scored. DIAG-GO was judged exactly as
  pre-registered: Q1 window table complete for the single
  window day (plus fresh-band closest approach with 0
  instrument errors on all legs); Q2 order proven on the
  99101 kill case with seq nesting + beat-moment count +
  code-order confirmation.
- Judge note: the prereg's Q1 "definitive" clause for the
  no-window case required 0 instrument errors — the fresh
  band meets it (0 errors on all 8), and the pilot window
  makes the clause moot for the headline answer anyway.
- Instrument note: `beastHpAtFightStart` is null for
  field/contest kills (no `startCombat` snapshot) and for
  kills whose fight started before the instrument's last
  snapshot; all TB kills in the judged legs carry a value.
  The 99704 peak-0 row (maxWave 3) is a village that never
  reached wave 4, not an instrument gap — its endUnlockedWave
  is 3 and its standing never released wave 4.
- /tmp caution honored: no analysis intermediates were
  staged in /tmp; per-seed JSONs live in evidence/.

## Verdict — DIAG-GO

Q1 definitive: the 99110 overlap window (d108, 1 day) is
fully tabled — capped 195 (not sufficient), readiness-5
short on armor, 51 natural gate evaluations, peak 4, no
release. The "unknown release outcome" is closed: the door
correctly held. Fresh band adds 0 windows in 8 seeds, with
99705 as the standing-sufficient-but-one-veteran
corroboration. Q2 definitive: the 99101 d134 hold beat is
proven pre-credit (seq 6144 inside kill call 6142–6156,
moment veterans 0, log length 56 pre-append), with the
`recordWaveKill` code order confirming the mechanism.
Both questions answered; no lever judged (DIAG ONLY).

## Findings for the coordinator (append to sim-findings.md — NOT edited here)

- [open] 2026-11-04 — hold-beat read order — `recordWaveKill`
  calls `checkWaveUnlockBeat()` before appending the
  `waveKillLog` entry, so a kill's own unlock-check beat
  reads the pre-kill veteran count (99101 d134: beat seq
  6144 inside kill call 6142–6156). Named fix (not landed):
  append the log entry before the unlock check. (sim-holdbeat-a evidence)
- [open] 2026-11-04 — veteran-kill narration vs mop-up —
  reproduced with fight-start HP: 1/1300, 169/900, 440/900,
  450/900, 637/850 finishes all count and celebrate as
  veteran kills identically to fresh kills; narration does
  not distinguish finishing wounded beasts. (sim-holdbeat-a evidence)
- [open] 2026-11-04 — second-kill-does-not-add — a repeat
  killer (99705 aroha_ngata, wave-4 kills d99 + d114) still
  counts as ONE veteran; the door needs a second DISTINCT
  living killer, which the hold beat's "1 of 2" does not
  spell out. (sim-holdbeat-a evidence)

## Proof and landing

- Proof: `scripts/test-holdbeat-20261104.js` — 6/6 PASS
  (overlap-window construction, beat-before/after-credit
  ordering, hold/release regex classification, judgeDiag
  semantics, live harness smoke: capped math, gate ==
  recount, peak-stable snapshot, gate-call counting, live
  kill + vetkill beat). Re-run green after the judged legs.
- Arm commits on branch sim-holdbeat-a (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - fc483a078 sim-holdbeat-a prereg (before any judged sim)
  - 9047ce869 sim-holdbeat-a instruments + proof 6/6
    (zero src/js)
  - (this landing) sim-holdbeat-a pilot + fresh band +
    evidence (10 per-seed JSONs)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-holdbeat-a*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-holdbeat-a/` (10 files:
  pilot 99110/99101 + fresh 99701–99708, RUN=holdbeat);
  scripts `holdbeat-instrument-20261104.js`,
  `holdbeat-driver-20261104.js`,
  `holdbeat-analyze-20261104.js`, `test-holdbeat-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after all three commits
  (prereg + instruments + this landing); repaired each time
  via HEAD-blob `update-index --cacheinfo` and verified
  `git status` empty + `git diff HEAD` empty. The commits
  themselves were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).
- Heartbeats: worktree heartbeated per the coordinator's
  addition (registry `sim-holdbeat-a` alive through the run).
