# sim-sighit-a — Does the monster signature hit cap fight rounds? (DIAG-NO-GO pooled, eater-only YES)

Run: Loop A, oversight-flesh-out-loop, run fleshout-20261031T1315Z,
axis scale-onramp, arm sim-sighit-a. Worktree branch: sim-sighit-a.
Base anchor: e0115918be8f02a6721c67423a4d7a92228a24bb (last commit
touching src/, the spearxbow-a anchor rule).
Pre-registration: evidence/2026-10-31/sim-sighit-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/sighit-a-fixture-20261031.js (forced-meeting
fixture band through the real Game.fieldFight; spearxbow-a P2-BOW
party shape; NOSIG leg monkeypatches Game.sigW4FieldMonster
inside the fixture process only — it still calls the original,
so RNG draws and side effects incl. audit tax are preserved,
but returns the pre-signature total).
Proof: scripts/test-sighit-a-20261031.js — 32/32 green.
Corpus: evidence/2026-10-31/perseed-sighit-a/fixture-band.json
(SUMMARY corpus — see the flap note below).
No [needs-eyes] (measurement only; nothing player-facing ships).

## Verdict (judged exactly against the prereg, confirm sample alone)

Pilot gate: PASS, so the confirm ran. P1 from-start join 64/64 =
100% (bar >= 90%). P2 wrapper-call == hit-log-line on 64/64 =
100%. P3 sig-add presence 1.0 on congregation, eater, suburb
and audit control 1.0 (delta 0 on every audit hit). Pilot
numbers below are reported separately and never pooled into
the confirm.

DIAG-NO-GO (pooled): the signature does NOT cap fight rounds
at the spearxbow party scale, judged as preregistered:
- R1: pooled median rounds NOSIG 2 >= MAIN 2 + 1? NO (2 vs 2).
- R2: pooled mean paired delta rounds (NOSIG − MAIN) 0.396
  >= 0.5? NO (misses by ~0.1 round).
- R3: pooled median leader HP left NOSIG 64 >= MAIN 50 + 10?
  YES (+14).
R1 and R2 miss, so the pooled verdict is NO-GO — never
re-scored against a friendlier metric mid-run. A NO-GO here
is a substantive answer, not a failure (see "what this
means" below): removing the signature buys health, not
rounds, in aggregate.

Per-beast round-cap (reported, never promoted to judge):
only the EATER is round-capped by its signature — median
rounds 1 → 2 AND mean paired delta +0.75 on that beast
alone. Congregation (+0.583 paired, but median 2 → 2),
suburb (+0.25, median 2 → 2), and audit (0, median 2 → 2)
are not. The pooled NO-GO hides a real single-beast YES:
the eater's every-round signature is the only one that
moves the median round count.

## Numbers (confirm sample unless stated)

Confirm: 96 fights (4 beasts x 2 legs x 12 streams 201-212).
All 96 confirm fights and all 64 pilot fights ended vFlee;
kills/drive-offs 0/160 overall, vDie 0 everywhere. Removing
the signature changes NO fight's outcome — every paired
fight is vFlee in both legs. The signature is not the
kill-blocker either: NOSIG total damage only rises to a
median 110 (from 100.5) against 1000-1400 HP.

Pooled, MAIN vs NOSIG:
- Median rounds 2 vs 2; mean rounds 1.83 vs 2.23.
- Median total damage 100.5 vs 110; median DPR 53.25 vs 51.75
  (DPR falls slightly in NOSIG because the extra rounds
  dilute the same volley-led damage — longer fights, not
  harder hits).
- Median leader HP left 50 vs 64; median ally HP left 39 vs
  48.5; median leader taken 50 vs 36; median ally taken 61
  vs 51.5; median volley 30 vs 30 (identical — the volley
  fires before any signature, as expected).
- Ally down: 33% MAIN vs 17% NOSIG. The signature's clearest
  pooled effect is on the ally, not the leader's round count.

Per beast, MAIN vs NOSIG (median rounds / mean paired delta
rounds / median leader HP left):
- Congregation: 2 / 2, +0.583, 50 / 63. Paired delta rounds
  beat the 0.5 bar but the median does not move — 7 of 12
  pairs gain a round, 5 do not.
- Eater: 1 / 2, +0.75, 20.5 / 60.5. The signature costs the
  leader 40 HP of median health and a full median round:
  9 of 12 pairs gain a round, and the leader ends MAIN
  eater fights at ~20 HP — one more hit from dead — vs
  ~60 HP without the signature.
- Audit (control): 2 / 2, 0, 61.5 / 61.5. All 12 pairs
  identical on rounds AND leader HP; hit summaries
  identical. The instrument is clean: where the signature
  adds nothing, the legs agree exactly.
- Suburb: 2 / 2, +0.25, 67 / 81.5. Two pairs gain rounds
  (one +2, stream 207: 2 → 4); the rest do not move.

## Per-monster single-hit distributions (MAIN leg, confirm)

Round-1 hits only (the cleanest single-hit band, n = 12 per
beast) — pre-signature total / sig delta / post-signature
pre-armor total, medians, with range of post-signature
totals and share above the logged attack's base band top:
- Congregation (all 12 Absolution, base [50,70]): pre 62,
  delta 61, post 123.5, range [109,137], 100% above band top
  (70). Median final (post-armor/post-worn) hit 93.
- Eater (Gorge 5, Smack-Rush 7; bases [45,75]/[55,85]): pre
  65.5, delta 56.5, post 121, range [102,153], 100% above
  band top. Median final hit 86.
- Audit (Field Audit 7, Assessment 5; bases [40,60]/[55,75]):
  pre 58.5, delta 0, post 58.5, range [46,74], 0% above band
  top. Median final hit 43.5.
- Suburb (HOA Fine 6, Property Tax 6; bases [28,44]/
  [35,55]): pre 39, delta 41, post 80.5, range [69,104],
  100% above band top. Median final hit 77.

All rounds, MAIN leg — median pre-signature total /
sig delta / post-signature total, share of hits above band
top, median signature share of the fight's incoming damage:
- Congregation (19 hits): pre 59 [50,70], delta 54,
  post 114 [50,137], 63.2% above top, sig share 0.367.
  Pre-signature totals are in-band on 100% of hits — no
  unmodeled layer.
- Eater (17 hits): pre 62 [48,85], delta 60 [46,82],
  post 126 [102,153], 100% above top, sig share 0.518.
  Every eater hit is signature-inflated, every round.
- Audit (26 hits): pre 58.5, delta 0 [0,0], post 58.5,
  0% above top, sig share 0.
- Suburb (26 hits): pre 38 [29,52], delta 37.5 [0,55],
  post 70.5 [29,104], 53.8% above top, sig share 0.369.
  (Delta 0 on even rounds, as the odd-round rule predicts.)

How the signature lands, by target (MAIN leg): the
congregation beam and suburb tax fall disproportionately
on the UNARMORED ally — congregation median sig delta
63.5 on ally hits vs 0 on leader hits; suburb 40 vs 0 —
because round-1/odd-round sig hits meet the 40% ally-share
roll while the leader's hide armor then halves what the
leader takes. The eater is the exception: its every-round
signature hits leader (median delta 69) and ally (53)
alike. NOSIG hit records carry the WOULD-BE signature
values (the wrapper still calls the original) — only
finalDmg in a NOSIG fight is actually-applied damage, so
never read a NOSIG postSig column as damage dealt.

## What the village looked like, in plain words

Two villagers walk up to a wave-4 beast in cured-hide armor,
loose three or four arrows, and then the beast's signature
does its work — but at this party scale the signature
mostly does not end the fight sooner, it just makes the
ending bloodier. Against the Congregation, the beam lands
as one enormous blow (a 67-point absolution plus a 69-point
beam, read as a single 136) that drops the unarmored
companion on the spot; the leader, armor on, takes the
next ordinary blow and walks away at 64 health. Against
the Eater, it is different and worse: every single hit
carries an extra gorge on top, the leader ends the fight
at about 20 health — one more mouthful from dead — and
taking the gorge away is the difference between leaving
after one round and standing for two. Against the Audit
there is no signature damage at all, and the two versions
of the fight are identical blow for blow, which is how we
know the measuring tool itself is honest. And in every
case, signature or not, the pair runs: they scratch about
a tenth of the beast's health and leave. The signature
explains the bruises, not the retreat.

## Sense-testing (four full MAIN confirm transcripts read)

- Congregation, stream 201 (2 rounds, vFlee): volley 45,
  ally "already at the door — charges in", leader strikes
  33, ally 6, then Absolution hits the ally for 136 and
  "goes down!", leader absorbs 27, takes 36, "sees how
  this ends — and runs while running still works" at 64 HP.
  Reads as people fighting: the ally's death is the
  turning point and the flee is a judgment call with the
  ally down. BUT the beam is never narrated as its own
  event in the fight log — there is no "rings / takes the
  beam" line; the 136 reads as one inflated Absolution.
  The decomposition (67 + 69) is instrument-measured,
  not narrated. Same for the eater (Gorge 116 pre-armor
  reads as one 68 after armor, no gorge line) and the
  suburb (HOA Fine 69, no Property Tax line). If the
  signature is meant to be legible in play, its narration
  must enter the fight record — currently sigW4's say()
  lines do not land in rec.log. Flagged as a finding,
  not fixed (DIAG only).
- Eater, stream 201 (1 round, vFlee): volley 32, ally
  charges in, gear absorbs 48, Gorge hits the leader for
  68 (32 HP left), both villagers strike — and the log
  just ENDS. No flee line, no "sees how this ends", though
  the outcome is vFlee. A 1-round eater flee is a silent
  flee in the transcript. Minor narration blank, flagged
  not fixed.
- Audit, stream 201 (2 rounds, vFlee): volley 45, strikes
  33/32 and 6/3, Field Audit 34 then Assessment 41
  through armor, flee at 25 HP with the spoken line.
  Coherent throughout; the audit's scheduled-tax
  signature (round 3) never arrives because the fight
  ends in round 2 — the tax is a threat the party flees
  before facing.
- Suburb, stream 201 (2 rounds, vFlee): volley 59 (4 shots),
  HOA Fine hits the ally for 69 (31 left), leader takes
  16 after absorbing 15, flee at 84 HP with the spoken
  line. Coherent: the suburb's odd-round tax is the only
  big number in the fight, and it lands on the ally.
- Standing blanks, unchanged and not chased: beasts are
  unnamed in fixture logs ("something", "sound like a
  feast with no people at it", "grey man with your
  paperwork", "street that wasn't there yesterday") —
  knowledge-gating, coherent. Volley lines say "arrow"/
  "bow" — accurate here, since this tier actually carries
  a bow (the volleyfix wording blank is unchanged
  elsewhere).

## Wall numbers

NOT OBSERVABLE on this substrate, stated structurally per
the prereg (not as 0s): a fixture band has no village
trajectory, no scale ladder, and no win flag, so national
/ table / wins / wave reach cannot be read off it. The
wall relevance is the bound this band establishes: at the
largest party fieldFight can field (leader + 1 sensed
ally) in the best earnable armor, removing the wave-4
signature entirely still leaves 96/96 fights ending vFlee
in a median 2 rounds with 0 kills/drive-offs. The
signature is a health tax (median +14 leader HP pooled,
+40 vs the eater) and an ally-killer (ally down 33% →
17%), not the round-cap the spearxbow band hit — except
against the eater, where it genuinely caps rounds. The
2-round vFlee wall after signature removal sits in the
morale flee rule and the damage race (median total ~110
vs 1000-1400 HP), not in the signature stack.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js
is a policy-comparison driver: it runs registry policies on
ONE frozen root and compares panel outputs. It cannot
express this arm's substrate (a forced-meeting fixture band
with no policy, no sim days, and a paired instrument leg
as the comparison) and it has no fixture mechanism. The
judge is the pre-registered fixture comparison +
determinism gate above (same rationale as sim-volleyfix-b /
sim-partyvolley-b / sim-spearxbow-a).

## Determinism + flap note (read before reusing the corpus)

Determinism gate, as adapted: the FULL corpus (~230KB with
all fight logs) could not be landed as a file in this
worktree at all — the EPERM flap denied every file write
to it across ~25 minutes (the initial writeFileSync, a
6-attempt retry loop, two chunked-retry fixture processes
that retried every 2-5s, plus probe writes to the same
directory, /tmp, and /dev/shm; small shell writes landed
only in brief windows). The committed corpus is therefore
a SUMMARY corpus: all judged fields (48 pairs, leg
medians, per-beast/per-leg hit summaries, round-1
summaries, pilot gate) plus the four sense-testing
transcripts, with the per-fight array omitted. The summary
corpus is byte-deterministic: two SIGHIT_SUMMARY_OUT runs
produce identical sha256
40925cee0cc29db84792a9ac719501d53eff59bed81a5976c18788f4638a39dd.
Re-run scripts/sighit-a-fixture-20261031.js (default mode,
no env flags) to regenerate the full corpus when the flap
clears; the numbers above are the same deterministic
computation, and the proof test re-derives every verdict
from the committed summary corpus (32/32 green). The
fixture script's chunked-retry writer and the
SIGHIT_COMPACT / SIGHIT_OUT / SIGHIT_SUMMARY_OUT modes
are flap tooling, not game changes.

## Metric review (applies to the NEXT run, never a re-score)

1. The pooled R1/R2 bars hid the eater: a pooled median
   round bar is the wrong shape when one beast's signature
   fires every round and the others' fire every 2-3 rounds.
   Future signature preregs should judge per-beast
   round-cap flags as co-primary with the pooled verdict,
   not as secondaries — the eater finding would otherwise
   have been reported as a flat NO-GO.
2. R2's 0.5-round bar was missed by 0.104 (0.396 measured).
   The bar was honest and the miss is real, but a future
   prereg could pre-register the paired-delta distribution
   (share of pairs gaining >= 1 round: here 18/48 = 37.5%)
   alongside the mean, since the mean is dragged by the
   audit's exact zeros (12 pairs at 0 by control design).
3. NOSIG hit records must be labeled counterfactual wherever
   they are quoted: postSig/sigDelta in a NOSIG fight are
   would-be values (the wrapper still calls the original);
   only finalDmg is applied. A future instrument should
   record the applied pre-sig total as its own field to
   prevent misquotation.
4. Median sig delta on leader hits (0 for congregation and
   suburb) is a target-mix artifact, not a signature
   absence: leader hits cluster on non-sig rounds because
   sig-round hits disproportionately meet the ally-share
   roll. Future reports should split sig deltas by round
   parity (sig-add vs non-sig-add rounds) as well as by
   target.

## New findings for the backlog (coordinator appends — NOT chased here)

- [open] 2026-10-31 — signature narration — sigW4 say()
  lines (beam/gorge/tax announcements) do not land in the
  field-fight rec.log, so a signature hit reads as one
  inflated base blow in fight transcripts; the
  decomposition is instrument-only (this run, 4
  transcripts).
- [open] 2026-10-31 — narration — 1-round eater vFlee
  ends with no flee line in the transcript (log ends after
  the round-1 strikes); other beasts' flees carry the
  "sees how this ends" line (this run, eater stream 201).
- [open] 2026-10-31 — signature targeting — the
  congregation beam / suburb tax land disproportionately
  on the unarmed ally (median sig delta 63.5 / 40 on ally
  hits vs 0 on leader hits); the ally is the signature
  sponge and ally-down falls 33% → 17% with the signature
  removed (this run, confirm).
- [open] 2026-10-31 — eater lever — the eater's
  every-round signature is the only wave-4 signature that
  caps rounds at party scale (median 1 → 2, leader HP
  20.5 → 60.5); any signature lever aimed at the wall
  should be eater-shaped (every-round) or it will not
  move the median (this run).

## Ranked next arms (for the coordinator — not chased here)

1. EATER-SHAPED SIGNATURE LEVER: test whether an
   every-round signature (or its removal) moves live-sortie
   survival, since the eater is the only round-capper found
   here — a pooled signature lever will not move the median.
2. SIGNATURE NARRATION WIRE-IN: put sigW4 say() lines
   into rec.log (a game change for a future arm, not a
   fixture) so the beam/gorge/tax read as their own event
   in play, then re-run the sense test on the transcripts.
3. MORALE/DAMAGE-RACE WALL: with the signature removed,
   fights still end vFlee in 2 rounds at ~110 total damage
   vs 1000+ HP — the next wall measurement is the flee
   rule + damage race, not another damage component.

## Convergence state

measured (no game change): the scale-onramp axis gains a
closed question with one exception — pooled, the wave-4
signature is NOT the round-cap (DIAG-NO-GO on R1+R2), and
it is NOT the kill-blocker (0 kills with or without it);
the eater alone is round-capped by its signature, and the
signature's pooled price is leader health (+14 median HP)
and ally survival (ally down 33% → 17%). The binding
constraints after this arm are the morale flee rule and
the damage race at P2-hide scale, plus the eater's
every-round stack as the single signature-shaped lever.

## Files

- Pre-registration: evidence/2026-10-31/sim-sighit-a-prereg.md
- Evidence: evidence/2026-10-31/sim-sighit-a.md (this file)
- Fixture: scripts/sighit-a-fixture-20261031.js
- Proof: scripts/test-sighit-a-20261031.js (32/32 GREEN)
- Corpus: evidence/2026-10-31/perseed-sighit-a/fixture-band.json
  (summary corpus; determinism sha256 above)
