# sim-refusalsay-a — say-text capture closes the refusal question (PILOT DIAG-GO)

Run: flesh-out loop, run fleshout-20261030T1427Z, worker sim-refusalsay-a.
Axis: scale-onramp (converging, NOT converged). Finding #1539, from run
fleshout-20261030T1315Z arm sim-dissolveprobe-a
(evidence/2026-10-30/sim-dissolveprobe-a.md, DIAG-NO-GO as written):
the 120 "dissolved" herald fights are titan-entry-gate refusals, but
muster-branch identification rested on code elimination because say text
was never captured. This arm captures the gate say text on each refusal
row and re-judges under its revised prereg only
(evidence/2026-10-30/sim-refusalsay-a-prereg.md, as amended
pre-analysis: buffersAtEntry guard on the claimed-set attach rule).

DIAG ONLY. No game change, no src/js change, no gate move, no deed-bar
move, no default flip. The instrument is a policy-side recorder layering
on the untouched scholarmelt recorder. No [needs-eyes]: nothing about
feel, combat, or UI changes — it only records.

## Closeout note (read first — this run did not end normally)

The Loop A coordinator timed out after 7200s with this arm's worker
gone and no final report. Closeout was done by the main session's
recovery coordinator: worker death re-verified (no sweep or heartbeat
process alive; registry heartbeats stale at 15:51Z, a reconstruction
stamp from the morning's REGISTRY.json truncation, not proof of life).
The pilot corpus on disk was complete except one file: seed 75108's
fresh row was missing (its census file existed). The recovery
coordinator re-ran exactly that seed with the same driver
(`node scripts/sweep-refusalsay-a.js --one 75108`): it completed
(days 31, village-lost, probe windows 2, attached 2, errs 0) and the
re-written census file is BYTE-IDENTICAL to the worker's original,
which proves the sweep is deterministic and the re-run reproduced the
worker's seed rather than inventing a new one. All judged numbers
below come from the worker's corpus plus that one deterministic
re-run. The confirm band was NOT run (coordinator timeout, and the
closeout brief forbids new sims beyond the seed-8 re-run), so there
is no confirm verdict — the pilot verdict below stands alone.

## Prereg legs (binding — judged only against the revised prereg)

| Leg | Bar | Result |
|---|---|---|
| Prereg | Committed before any judged analysis | PASS (prereg + amendment committed before fixtures/sweep) |
| Fixtures | scripts/test-refusalsay-a.js green | PASS — 107/107, re-run by the recovery coordinator |
| Pilot gate | 8/8 valid + dissolved rows reproduced > 0 + probe firing + substrate | PASS — 8/8 valid, 120 dissolved rows, probe windows 242 total, substrate 8/8 (below) |
| Seeds | 8/8 valid pilot | PASS — rsValidSeeds 8; per-seed diag errs 0, overflow empty, installed true, windows > 0 on all 8 (75101: 11, 75102: 62, 75103: 7, 75104: 57, 75105: 80, 75106: 13, 75107: 10, 75108: 2), attached == windows on every seed |
| Probe coverage | Probe log on >= 95% of dissolved rows | PASS — 120/120 (100%) |
| Bracket rate | Counting bracket on >= 95% of probe-carrying dissolved rows | PASS — 120/120 (100%), 0 unbracketed |
| Refusal share | Reported in full (no separate bar) | 120/120 rows are refusals (100%) — see distribution below |
| Gate identification | >= 95% of refusal rows gate-identified from say text | PASS — 120/120 (100%), all gateSource 'say-text' |
| Have/need capture | >= 95% of muster rows carry parsed have AND need | PASS — 120/120 (100%), every row have=0, need=10 |
| Classification | Every dissolved row classified, 0 UNCLASSIFIED | PASS — 0 UNCLASSIFIED; fates SCHOLAR-RESTORED 75, SPAWN-ENDED 45; cause start-post-gone 120/120 |
| Substrate | Pilot seeds, normalized OR frame-reconciled, census byte-identical | PASS — frame-reconciled 8/8, diffCount 0 on every seed, census byte-identical 8/8 (raw normalized comparison fails on all 8 — wrapper-frame diffs only; the judged OR passes with the reconciliation attached, as the prereg provides) |
| Sense | >= 2 refusal chains read end to end on the pilot band | PASS — chains below, with gate text quoted |
| Wall numbers | Recomputed, checked vs dissolveprobe pilot | PASS — zero divergence (below) |

**Pilot verdict: DIAG-GO.** Confirm verdict: NONE — confirm band
75117–75128 not run (see closeout note). Per the prereg confirm
rule, a confirm-inconclusive result would never upgrade or downgrade
the pilot verdict; here there is not even an inconclusive band, only
an outstanding next step. NO lever verdict: this arm proposes no
damage buff, gate move, deed-bar move, or any game change.

## Refusal numbers in full

Dissolved population: 120 rows, all with result 'dissolved-no-tbend',
all classified start-post-gone.

- Per seed: 75101: 0, 75102: 32, 75103: 0, 75104: 45, 75105: 43,
  75106: 0, 75107: 0, 75108: 0.
- Window distribution: refusal:muster 120. No call, no gap, no
  unbracketed rows.
- Gate distribution: muster, from say text, 120/120. No campaign,
  no unknown-say, no elimination rows.
- Have/need per row: have=0, need=10 on all 120 rows. There is no
  variation to tabulate: every refused face found zero allied blades
  mustered against a need of 10.
- Titan title on all 120: THE HERALD. Intended mid on all 120:
  herald.
- Full per-row list (seed, fightSeq, day, have, need, say text) is
  in evidence/2026-10-30/sim-refusalsay-a-analysis.json (probeRows).

The gate text, quoted verbatim from a captured row (identical on all
120 rows):

> "⛔ THE HERALD does not notice you the way prey notices a hunter.
> It notices you the way weather notices a field. You cannot face
> this alone — sound the call, muster 10 allied blades (you have 0).
> This is not courage. This is arithmetic."

What this closes: the prior arm's muster-branch identification, which
rested on code elimination, is now confirmed from the game's own
spoken text on every row. No have/need number in this file comes from
an elimination row, because there are no elimination rows.

What this newly shows: the muster never advances. Not one of the 120
refusals found even a single allied blade mustered (have=0
throughout, across three seeds and days 74–156). The gate is not
being approached and failing late — it is being walked into, alone,
over and over. That is the follow-up question, not a finding of this
arm: why does no muster ever form on these seeds?

## Sense: two chains read end to end

Chain 1 — seed 75102, day 74 cluster (32 dissolved rows on the
seed; fightSeq 24 onward, day 74). The census snapshots bracketing
the day show the herald present in the field roster on days 73, 74,
and 75 (titan, wave 4, alongside the ordinary wave-1 roster). The
scholar faces it repeatedly on day 74 and is refused every time
with have=0, need=10. Coherent: a solo scholar, no muster behind
her, meets a wave-4 titan in the field and is turned away by
arithmetic, not by a fight. Nothing reads as a melt — there is no
live fight to melt from; the refusal happens before combat starts,
exactly as the gate code describes.

Chain 2 — seed 75104, days 99–101 cluster (45 dissolved rows,
fightSeq 36 onward, days 99, 100, 101). The census snapshots for
days 99–101 do NOT list the herald in the field roster (24 monsters,
none titan-flagged). That is a roster-scope fact, not an
incoherence: census snapshots record the field-monster roster, and
titans are tracked separately from it (chain 1's roster presence
is the exception that proves the roster can show a herald, not a
requirement). The face sequence itself coheres: 45 identical
muster refusals across three days, have=0 throughout, the scholar
returning alone day after day without ever mustering. The
repetition is the story — and it connects to the open steve-call
on refused-face routing (should a refused solo face route toward
mustering instead of re-facing?): on this evidence, the bot
re-faces and is refused identically, and the muster count never
moves.

## Wall numbers (recomputed from the fresh corpus)

won 6, nationalEver 6, nationalFinal 6, tableReached 7,
tableEntered 6, wave reach 1:8, 2:8, 3:7, 4:5, 5:0, median survival
114d, deaths 232. Checked against the dissolveprobe pilot numbers
on the identical pilot seeds (evidence/2026-10-30/sim-dissolveprobe-a.md:
wave 8/8/7/5/0, median 114d, deaths 232): DIVERGENCE ZERO, as the
substrate leg requires. The probe moved no game data.

## Plain-words village assessment

On this band the villages do well at the table game — 6 of 8 win,
7 of 8 reach the table — while the scholar's titan ambitions go
nowhere: every single attempt to face the Herald alone bounces off
a gate that wants 10 allied blades, and the villages never muster
even one. The scale wall, seen from this angle, is not that the
gate is too high. It is that the mustering itself never starts.
The villages climb rank and sit at tables while the Herald waits
unfaced, because nobody ever gathers the blades the gate counts.

## Telemetry deviation check

Telemetry check against the scale-wall baseline on this band's
per-seed rows: 1 LOUD line (wins swung, baseline 16 → current 6).
Verdict: REGIME artifact, explained, baseline NOT rolled. The
baseline is the WINSEAT regime (~100%-win suite with win-pursuit
policies); this band runs tableseat-nowait policy on herald-band
seeds, and its rows are substrate-identical to the dissolveprobe
corpus on identical seeds — the arm changed no game code, so no
telemetry movement can be attributed to it. (The baseline file
itself warns against comparing pre-seat substrates to it.)

## Metric review (for the NEXT run, not this verdict)

- Substrate comparison: the raw normalized comparison fails on all
  8 seeds while the frame-reconciled comparison passes with zero
  diffs. The prereg's judged OR handles this by design, but a
  future prereg should name the frame-reconciled comparison as the
  primary leg and report the raw result as diagnostic only, so the
  verdict table does not read as a split decision.
- Census bracketing: census snapshots are field-monster rosters;
  titans need not appear in them. Sense legs for titan faces
  should pair the meeting rows with the census as corroboration
  when present, not as a requirement — chain 2 above is valid
  sense evidence without a roster entry.
- EPERM flap: seed 75108's fresh-row write failed under the sweep's
  inherited sparse write backoff (30s-capped, 60 attempts). The
  worker's uncommitted sweep delta — dense 1-second retries, 900
  attempts, write timing only — is committed with this arm, and
  the coordinator's re-run under it succeeded. The flap, not the
  sim, lost the file; determinism (byte-identical census) is the
  proof the re-run is the same seed, not a new one.

## Ranked next

1. Confirm band 75117–75128 (12 seeds) under the same prereg: needs
   >= 20 dissolved rows for a Confirm GO; the pilot verdict stands
   regardless.
2. Muster-formation follow-up: why have stays 0 on every refused
   face — is mustering ever attempted on these seeds, and what
   would make the scholar muster before facing? (Connects to the
   open steve-call on refused-face routing.)
3. No game change is proposed by this arm. The gate text is now
   quoted fact, not elimination, and any muster/routing work
   starts from it.

## CORRECTION — confirm band resumed by the original worker (closeout, 17:05Z)

After this evidence was written, the recovery coordinator found the
original refusalsay worker ALIVE and running the confirm band (seeds
75117–75128, started 16:46Z, 6/12 seeds complete at 17:02Z, process
verified live by ps, not by heartbeat). The "confirm NOT run"
statement in the closeout note above was true when written and is
now outdated: confirm is in progress, not absent. The pilot DIAG-GO
verdict above stands unchanged. The merge of this branch is DEFERRED
until the confirm sweep finishes: rebasing onto current master now
would change game code (the stashfetch change) under the running
band's later seeds and corrupt its comparability. Follow-up
closeout owed: confirm evidence + rebase + merge (or hold, per the
confirm verdict). The pilot corpus and verdict in this file are
final; only the confirm section is outstanding. UPDATE (adopted
worker, fleshout-20261030T1639Z): the confirm section above is
now written and the verdict is Confirm GO; rebase + merge
preparation follows in this run.

## CONFIRM BAND — run by the adopted worker (fleshout-20261030T1639Z), verdict: Confirm GO

The outstanding confirm section is now closed. The adopted worker
ran the prereg's confirm band fresh: seeds 75117–75128, same 180d
death-aware horizon, tableseat-nowait policy, same env set, EVID
evidence/2026-10-30/perseed-refusalsay-a-confirm/ (12 census + 12
fresh rows, sweep summary corpus ok=true, census ok=true). The
analyzer was run over the confirm corpus
(evidence/2026-10-30/sim-refusalsay-a-confirm-analysis.json). No
game code changed between the pilot and confirm bands on this
branch; the rebase onto master (fullseatgate-a) happens only after
the sweep, per the closeout's deferral.

| Confirm leg (prereg confirm rule) | Bar | Result |
|---|---|---|
| Pilot DIAG-GO | prerequisite | PASS (above, unchanged) |
| Confirm dissolved rows | >= 20 | PASS — 77 |
| Seeds | 12/12 valid | PASS — rsValidSeeds 12; per-seed diag errs 0, overflow empty, installed true, windows > 0 on all 12 (75117: 20, 75118: 29, 75119: 44, 75120: 101, 75121: 12, 75122: 30, 75123: 28, 75124: 18, 75125: 31, 75126: 9, 75127: 5, 75128: 12), attached == windows on every seed, 339 windows total |
| Probe coverage | >= 95% of dissolved rows | PASS — 77/77 (100%) |
| Bracket rate | >= 95% of probe-carrying dissolved rows | PASS — 77/77 (100%), 0 unbracketed |
| Gate identification | >= 95% of refusal rows from say text | PASS — 77/77 (100%), all gateSource 'say-text' |
| Have/need capture | >= 95% of muster rows with parsed have AND need | PASS — 77/77 (100%), every row have=0, need=10 |
| Classification | 0 UNCLASSIFIED | PASS — 0 UNCLASSIFIED; fates SCHOLAR-RESTORED 52, SPAWN-ENDED 25; cause start-post-gone 77/77 |
| Substrate | NOT judged on confirm band (no draftflag comparator corpus) | n/a, as the prereg provides — reported as not-applicable, never as a pass. The pilot substrate leg stands as this arm's substrate verdict. |
| Confirm sense | >= 1 chain | PASS — chains below, with gate text quoted |

**Confirm verdict: Confirm GO.** Pilot DIAG-GO + 77 dissolved rows
+ 12/12 valid + every rate at 100% against its >= 95% bar +
classification complete + confirm sense. This is not
confirm-inconclusive (77 >= 20) and it neither upgrades nor
downgrades the pilot verdict — it confirms it on a fresh band.

### Confirm refusal numbers in full

Dissolved population: 77 rows, all 'dissolved-no-tbend', all
start-post-gone, all intendedMid herald, all title THE HERALD.

- Per seed: 75117: 0, 75118: 0, 75119: 3, 75120: 74, 75121: 0,
  75122: 0, 75123: 0, 75124: 0, 75125: 0, 75126: 0, 75127: 0,
  75128: 0. Herald clusters are seed-dependent, as the prereg
  warned: ten confirm seeds yield zero dissolved rows, and one
  seed (75120) carries 74 of the 77.
- Window distribution: refusal:muster 77. No call, no gap, no
  unbracketed rows.
- Gate distribution: muster, from say text, 77/77. No campaign,
  no unknown-say, no elimination rows.
- Have/need per row: have=0, need=10 on all 77 rows — the same
  zero-muster picture as the pilot, now on 197/197 rows across
  both bands combined. The full per-row list is in
  evidence/2026-10-30/sim-refusalsay-a-confirm-analysis.json
  (probeRows); distinct captured say texts across both bands = 1,
  the pilot text quoted above, verbatim.

### Confirm sense: one chain read end to end (plus a second cluster)

Chain 3 — seed 75120, days 75–80 cluster (49 rows) and days
129–138 cluster (25 rows) on the same seed. The seed survives the
full 180 days (end=survived, won=0, nationalEver=0), so these are
not death-throe faces: a living village's scholar keeps meeting
the Herald alone across two separate months and is refused
identically each time, have=0, need=10. The first cluster's
census snapshots show no titan-flagged roster entry (the herald
arrives intra-day); by the second cluster the census DOES show
the herald, at 222 HP on days 138–139 — down from its 700 HP
full strength, so something outside these refused faces has hurt
it — yet the refusals continue with have=0. That is the gate's
logic made visible: it counts mustered blades, not titan HP. A
wounded Herald still refuses a solo scholar with zero blades
behind her. Nothing reads as a melt: every row is the same
4-event window (startCombat enter, say enter/exit, startCombat
exit), no live fight, scholar HP unchanged at dissolve.

Chain 4 (corroboration) — seed 75119, day 148, 3 rows: the same
text, the same 0/10, on a village-lost seed (174 days). The
refusal does not depend on the village's fate.

### Confirm wall numbers (own band, no smoothing against pilot)

won 3 (full 0), nationalEver 8, nationalFinal 6, tableReached 6,
tableEntered 3, wave reach 1:12, 2:12, 3:11, 4:9, 5:0, median
survival 143d, deaths 458. Reported on their own band, per the
prereg; the pilot band's figures above are unchanged. Wave 5
reached 0 on both bands — the scale wall stands, and this arm's
contribution to it is the confirmed gate text, not a moved gate.

### Dissolveprobe question: answered, on both bands

The question this arm was adopted to close — is the dissolved
population really titan-entry-gate refusals, and which gate, with
what numbers? — is now answered from the game's own spoken text,
not elimination: YES, on 197/197 dissolved rows across pilot +
confirm, every one a muster-gate refusal of THE HERALD, need 10
allied blades, have 0 on every row. No row required elimination,
no row was unknown-say, no campaign gate appeared. The question
is closed; what remains open is the follow-up the pilot evidence
already ranked: why a muster never forms (backlog item, already
logged — not duplicated here).

### Metric review, confirm addendum (for the NEXT run)

- Confirm-band concentration: 74/77 rows on one seed. The
  prereg's >= 20 threshold is met, but a future instrument arm
  whose population clusters this hard should pre-register a
  per-seed spread note (e.g. "dissolved rows on >= 2 seeds" as
  a robustness check) so a single-seed cluster cannot carry a
  confirm alone. This arm's confirm still passes as written —
  the threshold counts rows, and 77 rows on two seeds (75119 +
  75120) is what the band yielded — but the concentration is
  stated, not hidden.
- No new telemetry deviation check was run for the confirm band:
  the arm's prereg names no confirm telemetry leg, the pilot
  check's REGIME-artifact verdict already covers this policy
  regime, and the confirm band has no draftflag comparator. The
  pilot telemetry verdict stands; nothing in the confirm numbers
  reopens it.
- No new sim-findings backlog entries from this band: the
  muster-never-forms gap is already logged (pilot), and the
  herald-HP observation (222 HP on 75120 day 138) is a sense
  note about gate logic, not a new gap.

### Updated ranked next

1. (DONE by this run) Confirm band 75117–75128 — Confirm GO.
2. Muster-formation follow-up: why have stays 0 on 197/197
   refused faces — is mustering ever attempted on these seeds,
   and what would make the scholar muster before facing?
   (Connects to the open steve-call on refused-face routing.)
3. No game change is proposed by this arm. The gate text is now
   quoted fact on two bands, not elimination, and any
   muster/routing work starts from it.

## Outputs

- scripts/policies/refusalsay-diag.js, scripts/sweep-refusalsay-a.js
  (incl. the disclosed dense-retry write delta),
  scripts/analyze-refusalsay-a.js, scripts/test-refusalsay-a.js
  (107/107)
- evidence/2026-10-30/perseed-refusalsay-a/ (8 census + 8 fresh
  rows), evidence/2026-10-30/sim-refusalsay-a-analysis.json
- evidence/2026-10-30/sim-refusalsay-a-prereg.md (binding, with
  pre-analysis amendment)
