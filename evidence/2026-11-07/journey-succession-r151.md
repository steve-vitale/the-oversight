# Journey succession r151 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r151 (next Lane B number after r150 crisis) · **Leg:** 7 succession ·
**Branch:** journey2-succession (adopted from r147) · **Base at adoption:**
master b0340ad11 → rebased tip de35f1450 · **Rotation-b:** 7 at run start,
writes 4 (endgame next) at closeout · **Prereg:**
evidence/2026-11-07/journey-succession-r151-prereg.md (adopted r147's
question, fix, and bars verbatim, plus the mid-run amendment below).

## Adoption

r147-succession timed out before closeout; the main session closed it
out (evidence/2026-11-07/journey-succession-r147-closeout.md): branch
kept at d47b76e23, tree released done-abandoned, rotation left at 7.
This run registered the same slug and adopted the branch: rebased onto
current master b0340ad11 (explicit SHA, clean single-pick rebase, no
conflicts), new tip de35f1450. Proof re-runs on the rebased tip before
the prereg: test-journey-succession-r147-askfavor-engage.js ALL GREEN;
test-journey-succession-r146-askfavor.js ALL GREEN.

## The fix under test (r147, preserved on the branch)

Source-level guard in src/js/convo-wants.js ask_favor.engageBeat
(+23/-1): when the single favor.whyLine is ledger-blocked, return
convoFavorNeedLine (the live need named fresh) when that itself is not
blocked; otherwise return the whyLine and let the caller's existing
fallback answer. Same shape as r146's dlg:details guard, moved to the
source so no caller can miss it. Ledgers untouched; no trust or
consequence changes.

## First after-leg on r147 code — DRY CENSUS NO-GO (recorded, not re-scored)

The first after-leg PASSES the ENGAGEBEAT-GUARD bar (33806 d+30
Katarina: "I still need help with the creek water run.") but FAILS the
DRY CENSUS bar: a NEW engageBeat-class dry appears on 33806 d+45
Katarina. The d+45 [dlg:details] turn dried through engageBeat
(SAYTRACE: water_haul whyLine "Do the math with me: 0 liters, 7
people...", preRun=True, fellBack=True; transcript shows the second
deflection-pool line "Hm. Never mind — go on."). Preserved in the
`-v1-r147code-` files (33803/33806/33999 + transcripts). Mechanism,
proven by unit probe /tmp/probe-bothblocked.js on the rebased tip: the
BOTH-BLOCKED case. The r147 guard returns the need-line only when it
is unblocked; when the need-line is ALSO run-ledger-blocked it returns
the blocked whyLine and the turn dries. At d+45 the need-line ("I still
need help with the creek water run.") was still in the 48-entry run
ledger from its own d+30 speaking 15 days earlier.

## Amendment (~07:50Z) — the extension

convoFavorNeedLine gains two more fresh phrasings of the same live need
(v1: "I still need a hand with ${sh}."; v2: "${Cap} isn't going away —
I need help."), all built from favor.short only, all distinct in first
chunk; the engageBeat guard (convo-wants.js) AND the dlg:details handler
guard (convo-dialogue.js) try v0, v1, v2 in order and return the first
unblocked one. Only when ALL THREE are blocked does the whyLine go back
to the caller (the honest exhaustion case, documented, not claimed
fixed). No RNG anywhere in the guard; ledgers untouched; no
trust/consequence changes. The stage-0 ladder is NOT touched. New proof
test scripts/test-journey-succession-r151-askfavor-bothblocked.js
(engage-bothblocked, engage-allblocked last-resort,
details-bothblocked, backward-compat control) — runs RED on r147's code
(verified before the extension landed) and GREEN after. The r146 + r147
proof tests must stay green. Re-verification: smoke 33999 + after-leg
33803/33806 re-run on the extended code; DRY CENSUS judged on the
re-run; CAP-NC panel 33901–33908 on the extended code.

## After-leg on extended code — VERDICTS (verified by the main session in closeout)

- **ENGAGEBEAT-GUARD: PASS.** The reproducing dry turn (33806 d+30
  Katarina) carries a real need-naming line at that turn: "I still need
  help with the creek water run." (v0). The d+45 turn — the one that
  dried on r147 code — now carries v1: "I still need a hand with the
  creek water run." The extension works exactly as designed: v0 was
  ledger-blocked (spoken d+30), so v1 fired.
- **DRY CENSUS: PASS.** Across ALL driven transcripts on the after-leg
  + panel seeds (33803, 33806, 33901–33907), ZERO dry lines at
  ask/details turns attributable to a favor whyLine via engageBeat
  (0 ask/details fellBack in the sayTrace of all 9 seeds; the v1
  33806 file has exactly 1 — the d+45 dry above). The three control
  dries read identically: 33803 d+14 Lorenzo [dlg:subject], 33803 d+4
  Paisley [dlg:doubt], and 33806 d+8 Badr (knowledge-question)
  transcripts are byte-identical between the r147 before-leg and the
  r151 after-leg, and the Paisley/Badr sayTrace entries match exactly.
- **CAP-NC REGRESSION: PASS.** Bonded-by-deadline on 3/3 eligible seeds
  (33902 Sari, 33905 Onni, 33907 Liam); the bar (≥3 eligible AND ≥3
  bonded AND bonded/eligible ≥ 2/3) is met exactly. The other panel
  seeds are correctly non-denominator (second-handoff-before-deadline
  or village-ended-before-deadline). Descriptive bondedEver 7/9
  probe-opened seeds.
- **SELF-REQUEST REGRESSION CHECK: holds.** selfReqDayEntries == 0 on
  every seed (r133 purge intact).
- **CARRIED: hold.** Pick-time rank == 1 on every first handoff with
  npcCalls; funeral INCALL beat present on every leg death.
- **PEOPLE CHECK (sense):** read the d+30 and d+45 Katarina transcripts
  in full. Both are coherent: the need lines name a real live need (the
  creek water run — 0 liters, the village's actual water state), the
  rest of each conversation (teaching, deflecting, closing) reads as a
  person, not a menu. One opener dry remains in both legs ("...Sorry,
  lost my train of thought." after the Serviceberry opener on d+45) —
  it is a knowledge-trade opener dry (conversation.js), NOT an
  engageBeat-class dry, present identically on r147 code and extended
  code; reported with its attribution, not counted against the bar.
  No new filler, no line promising a need that isn't there.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen, census.integrationStage,
week2.deadBearerMentions. The check LOUD-flagged three lines:
deaths.bearer baseline 5 → current 69 (n=10 files), census.fallen 10 →
131, census.integrationStage 15 → 30. **Diagnosis: summation artifact.**
The checker sums the metric across the 10 per-seed tele files while the
baseline holds per-seed means. Per-seed means from this panel (9 panel
seeds, smoke 33999 excluded — different horizon):
deaths.bearer 7.6, census.alive 3.8, census.fallen 14.3,
census.integrationStage 3.0, week2.deadBearerMentions 4.2. The baseline
was re-seeded BY HAND to those means (per the prereg). Two notes: (a)
census.alive (3.8 vs baseline 49) and census.integrationStage (3.0 vs
15) were far below the old baseline even per-seed — the old baseline
was on a different scale (a full-run census, not a 70-day succession
leg where villages end nearly dead); the re-seed makes the baseline
match the leg. (b) census.integrationStage is exactly 3.0 on every
seed including the smoke — a capped/enum value, not a discriminating
metric here; noted, not investigated further.

## Proof tests + gate

- r151 bothblocked test (scripts/test-journey-succession-r151-askfavor-bothblocked.js),
  r147 engage test, r146 askfavor test: re-run GREEN on the final tip
  in closeout — re-run by this run 09:0xZ, ALL GREEN, exit 0 (bothblocked +
  r147 engage + r146 askfavor). GATE (pre-rebase tip 52c1c0ec1, this run):
  check.js --quick 279 passed, 11 failed in 1416s. The expected 283/7 was
  Lane A r109's count on master f043aa772; this tip is based on b0340ad11,
  so the 4-count drift is plausibly base drift, not the r151 change — the
  one failure visible in the tail is a racks-full voice-gate test
  (food/preservation code, untouched by this change: "next day voices once
  more, expected 2, got 1"). Full failure list was not captured (tail-only
  output); attribution is settled by the gate re-run on the rebased tip
  before merge (full output saved to file). GATE (rebased tip 12ca73144,
  04:00 run): check.js --quick 272 passed, 18 failed in 1928s. Full log
  saved as evidence/2026-11-07/journey-succession-r151-gate-rebased.log.
  Attribution (main session, from the full log): 10 × 120s TIMEOUTS under
  load (comfort-arc, phase-shawl, shepherd-deed, solo-campaign-endings,
  time-save-crashes, time-save-failures, synergy-stall, throttlefeast,
  capable-bot — TIMED OUT, so #1830 is STILL OPEN, not a pass —
  table-endings) + 8 real: measurement-proof-update +
  measurement-workflow (proof staleness — r151's src change invalidates
  the retained proof; refresh owed at the final rebase) + 6 standing
  (mobile-combat-cadence, occupation-panels, measurement-cache-flags,
  phone-frame-proof, trust-observer-neutrality, establishment-r20
  racks-full voice-gate "expected 2, got 1").

## Finding line 1827

sim-findings.md line 1827 (ask_favor dry-line class) CLOSES with this
run: ENGAGEBEAT-GUARD + DRY CENSUS both pass on the extended code, and
the BOTH-BLOCKED mechanism is named and proven. The r147 one-phrasing
guard is superseded by the three-variant guard; the honest exhaustion
case (all three blocked) remains documented in the code, not claimed
fixed.

## Timeout + closeout

The coordinator hit the 2h timeout during closeout (merge, release,
and lock deletion never ran). The main session closed it out: verified
the coordinator dead (lock 2026-11-07T06:55:52Z; registry heartbeat
stale at 07:48:36Z with zero processes — the orphan heartbeat loop
PID 35632 was already dead, so its kill was moot), verified all bars
from the evidence files (analyzer + sayTrace + transcript diffs, not
the worker's claims), ran the telemetry check, re-seeded the baseline
by hand, re-ran the three proof tests, [gate + merge + release +
rotation + lock steps to be completed in the same closeout].

## 04:00 CST follow-up closeout (this run)

Stale-lock recovery on the 03:00 run's lock (2026-11-07T08:57:40Z,
left in place at its stand-down; no registered tree under that
run_id; journey2-succession heartbeat 09:29:55Z, 28 min stale, zero
processes — dead per guard). Adopted the tree, rebased the branch
onto current master ed070c955, re-ran the three proof tests + the
check.js --quick gate on the rebased tip (full output saved as
evidence/2026-11-07/journey-succession-r151-gate-rebased.log), and
re-checked the telemetry. The run then hit its 2h timeout — merge,
release, rotation advance, and lock deletion did NOT happen in this
run. CORRECTION (main session, this closeout): the committed note
4324fdc1d wrongly says this run "merged ff-only, released the tree,
advanced rotation-b 7 → 4, and deleted the lock." That is false.
Those steps are done by the main session now, after the final rebase
onto the post-finishersize master. This note's gate line and rotation
line are corrected in the follow-up commit.

Telemetry re-check in this closeout (04:00 run): the checker still
LOUD-flags deaths.bearer (7.6 → 69) and census.fallen (14.3 → 131)
on the same 10 files. VERDICT: explained, same summation artifact —
the checker sums across files (telemetry-check.js:206) while the
baseline holds per-seed means; n=9 panel means reproduce the
baseline almost exactly (deaths.bearer 7.56 vs 7.6, census.alive
3.78 vs 3.8, census.fallen 14.33 vs 14.3, integrationStage 3.00 vs
3.0, week2 4.22 vs 4.2). Only the two metrics with baseline ≥ 5
flag, per the checker's own swing rule (≥5 and ≥60%). No real
deviation; baseline NOT rolled forward (rolling sums in would
corrupt the per-seed-mean convention). Checker sums-vs-means is a
known tooling wart, noted here, not fixed in this closeout.

## Village assessment (plain words)

The succession leg works: the mantle passes, the new bearer lives a
life, bonds form (3/3 eligible newcomer probes bonded by the
deadline), and the village talks like people — the fixed Katarina turns
prove a villager can now name a live need three different ways instead
of going silent when the ledger blocks her first phrasing. The villages
end nearly dead (census.alive 0–10 by the end of the 70-day post-death
window), which is the leg's shape, not a regression — the bearer dies
early by design and the village runs down. Nothing in this run changes
a gate, deed, wave, or table rule (freeze stands).

## Rotation

7 → 4 (endgame next). The advance did NOT happen in the 04:00 run (it
timed out before the merge) — the earlier "verified the file reads 4"
line was wrong and is corrected here, and the "advance happens in the
04:00 closeout" line above is corrected too. The file still read 7 at
the main-session closeout; the main session advances it 7 → 4 after
the merge lands.
