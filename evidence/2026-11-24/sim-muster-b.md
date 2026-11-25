# sim-muster-b — NO-GO on cost bars: 10 is unreachable under the sounding policy (ceiling 9)

## 1. Verdict — NO-GO (cost bars B4; the reachability question itself is answered)

**No village assembles 10 allied blades, even when the call is sounded.**
Under the full sounding stack on the 16-seed tbrefuse band, the call sounds
on 12 of 13 herald-meeting seeds, the muster peaks at **9 blades — twice** —
and **0/16 seeds reach 10**. The gate never opens: all 217 herald attempts
after sounding are still muster-gate refusals, and the highest refusal ever
reads 9 of 10. The binding constraint is structural, not effort: **every
village on this band has exactly ONE active allied link**, so the allied
ceiling is one link's quota (6 trusted at most) and the total ceiling is
6 + 3 Haven blades = **9**. Ten needs a second answering link, and there
is no second link.

The NO-GO is on the frozen cost bars (B4), not on the measurement: median
survival 119.5d (bar ≥ 120d) and village-lost 11/16 (bar ≤ 7/16). The
sounding policy itself costs villages — six seeds flip from survived (on
control) to village-lost — and a same-tip diagnostic control re-run rules
out master drift as the cause (see §5). Per §14 the miss is NO-GO, never
re-scored: the reachability answer (0/16, ceiling 9) stands, and the arm
does not pass as a whole.

## 2. Prereg (frozen before any judged sim)

Prereg: `evidence/2026-11-24/sim-muster-b-prereg.md` (commit 9721569f2,
sha256 66b6c65836f4f7d6a482099b94f60491153291919db7eb2e02f67cbbdc110777).
Policy: `scripts/policies/muster-sound-b.js` — competent + titanroute +
musterclose + mustergap + commitrefresh, policy-only, zero src/js changes.
Corpus: the tbrefuse band, 16 seeds 109310–109325, 150d, death-aware.
Pilot: the 6 control herald seeds + 109310 + 109311 (8 seeds); confirm:
the remaining 8. Pilot gate (call sounded on ≥ 2 pilot herald seeds)
PASSED at pilot (5 of 6 sounded) before any confirm spend.

## 3. Method

Driver: `scripts/muster-b-driver-20261124.js` (tbrefuse instrument verbatim
for control-identical fields + closedecay-style daily gate trace after the
call + attempt-time gate snaps; engine gate rule replicated driver-side AND
read from the engine's `titanMusterReady` flag alongside). Analyzer:
`scripts/analyze-muster-b.js` (reuses the titanmuster refusal census).
Proof: `scripts/test-muster-b.js` — 7/7 PASS on the branch tip (policy
composition, max-gate read across all three gate sources, ready at ≥ 10,
refusal-gate extraction, median helper, refusal have census, driver smoke
run). Panels: `scripts/build-muster-b-panels.js` + `scripts/balance-panel.js
compare` (see §6). Analysis JSON: `evidence/2026-11-24/muster-b-analysis.json`.

Mechanism (code, read before judging — src/js/titans.js):
`titanAlliedLinks` (~444) returns exactly `hierarchyState()` filtered to
`status === 'active'` — the same set the driver reads, so the one-link
ceiling is the ENGINE's ceiling, not an instrument artifact.
`soundTitanCall` (~862) creates the muster record; allied links answer by
trust/opinion/arrears (refuse < 25 trust, < −10 opinion, or arrears > 0;
quota 6 when trusted ≥ 70 trust / ≥ 10 opinion, else 2). The call does NOT
auto-commit Haven. `titanCommitOwn` (~1029) is a two-tap player verb, up
to 3 Haven blades — reachable from policy (mustergap/closedecay prove it),
so this arm judges the FULL 10, allied + Haven, with no narrowing.

## 4. Results (judged only against the frozen bars)

| Bar | Result |
|---|---|
| B1 instrument complete (16/16 seeds, ≤ 2 error seeds) | PASS — 16/16 per-seed files, 0 instrument errors on every seed, 0 unclassified titan refusals |
| B2 the call sounds (≥ 3 of 6 control herald seeds) | PASS — sounded on 12/13 sounding-leg herald seeds; 5/6 control herald seeds |
| B3 reachability answered with numbers | PASS — max-gate distribution per seed (below), binding constraint named (one-link ceiling, §4.1) |
| B4 cost bars (median ≥ 120d; lost ≤ 7/16; starvation ≤ 20) | FAIL — median 119.5d; village-lost 11/16; starvation 10 (pass). See §5 for attribution |
| B5 panel (§15 compare attached) | PASS (produced) — decision `review_required`: community-loss and deaths/100d regression signals (see §6). The panel is the instrument; the bars are the judge |

### 4.1 The ceiling: 10 needs a second link

Max-gate distribution (living-unique allies + valid Haven blades):
`[—, —, —, 0, 0, 3, 4, 5, 5, 5, 6, 7, 7, 7, 9, 9]` (— = no call, no muster).
Per seed (max gate = allied + Haven):

| Seed | Call day | Max gate | Allied | Haven | Ceiling (allied + 3) |
|---|---|---|---|---|---|
| 109311 | 68 | 5 | 2 | 3 | 5 |
| 109312 | 65 | 4 | 2 | 2 | 5 |
| 109313 | 89 | 7 | 5 | 2 | 8 |
| 109314 | 68 | **9** | 6 | 3 | **9** |
| 109315 | 92 | 3 | 2 | 1 | 5 |
| 109317 | 78 | 7 | 4 | 3 | 7 |
| 109318 | — | 0 | 0 | 0 | — (never called) |
| 109319 | 88 | 5 | 2 | 3 | 5 |
| 109320 | 84 | 6 | 4 | 2 | 7 |
| 109321 | 95 | **9** | 6 | 3 | **9** |
| 109322 | 73 | 7 | 5 | 2 | 8 |
| 109324 | 73 | 5 | 2 | 3 | 5 |
| 109325 | 100 | 0 | 0 | 0 | 5 (refused) |
| 109310 / 109316 / 109323 | — | — | — | — | — (no herald met / no lair) |

Every village has exactly ONE active allied link (a primary link:
Emberhold, Stonebridge, or Thornfield) — confirmed by two independent
reads (the driver's link trace and musterclose's weekly choices, 10–15
per seed, each naming the same single village). One trusted link sends
at most 6; Haven sends at most 3; 6 + 3 = 9. The two 9-gate seeds
(109314, 109321) are AT their absolute ceiling: a trusted link at quota
6 plus a full Haven commit of 3. Even the commitrefresh leg firing (109321
day 98: Giulia re-committed after a blade was lost) only restores 9 — it
cannot add a 10th. The refusal census agrees: max `have` ever read is 9
(217 muster-gate refusals after sounding, 0 fought).

### 4.2 The two edge seeds

- **109318 — the call never sounds.** The lair is heard (7,4), but the
  scholar makes 27 march attempts and NEVER moves: every march starts at
  (4,4) with 0 steps, arrived false. The march cannot path to the lair
  tile (no travel target reduces the distance, or travel refuses) — a
  routing failure, not a guardrail: the last guard block (day 125) is
  starvation, but the marches were already stuck at 0 steps from day 100.
  Musterclose meanwhile deepened Emberhold to trust 94 — good work with
  nothing to harvest, because no call ever sounded. (Backlog: titanroute
  march routing failure — see §8.)
- **109325 — the call sounds and nobody answers.** One link only
  (Stonebridge), trust 86 but arrears 4000 → "— Stonebridge REFUSES.
  debts unpaid between you. (trust −8 — refusals are remembered.)"
  Musterclose spent 9 weeks tending Stonebridge (trust 30 → 96) but
  tending a primary link never clears arrears, so the refuse bar never
  moved. And mustergap never commits Haven's blades here: it requires a
  sounded coalition with allies > 0, and with 0 allies it stands down —
  so Haven's 3 blades sat home while the gate read 0. (Backlog: both gaps
  — see §8.)

### 4.3 Wall numbers (sounding leg vs control, identical seeds)

| | Sounding (this arm) | Control (tbrefuse -v2) |
|---|---|---|
| Wins | 0/16 | 0/16 |
| National | 0/16 | 0/16 |
| Table offered (waiting) | 15/16 | — (not recorded; standingLines mention the table on 16/16 control seeds) |
| Wave 5 unlocked | 5/16 | 6/16 |
| Median survival (gameDays) | 119.5d | 151d |
| Village-lost | 11/16 | 5/16 |
| Starvation deaths | 10 | 10 |
| Total deaths | 1317 | 1310 |

The scale wall stands: villages reach wave 5, survive, get the table
offer, and never reach national or win. The muster answer does not move
the wall — it names one more door that only opens with a second allied
link, which no village on this band has.

## 5. Cost bars — the sounding policy costs villages (attribution settled by diagnostic)

B4 failed: median 119.5d (bar ≥ 120d — missed by half a day on the
even-n median) and village-lost 11/16 (bar ≤ 7/16). Six seeds flip from
survived on control to village-lost under the sounding policy (109311,
109312, 109314, 109320, 109322, 109325); none flip the other way. Total
deaths are nearly identical (1317 vs 1310) and starvation deaths exactly
equal (10 vs 10) — the villages are not starving more; they are ending
earlier with the same death count, i.e. the roster/bearer line collapses
sooner. All six flipped seeds sounded the call (marched to the lair).

Attribution was confounded in the frozen comparison: the control corpus
anchor (2c82596cec5d) predates the sounding tip (b62d13213) by dozens of
commits (journey-crisis r287, fleeguard, homecraft-gate, reunionwild,
the 0130Z food-economy adoption). A post-hoc diagnostic — NOT a re-score
of B4 — settles it: the tbrefuse driver re-run on the CURRENT tip
(RUN=ctl-20261124, same 16 seeds, competent verbatim) reproduces the old
control EXACTLY on every wall number (survived 11 / lost 5, median 151d,
won 0, national 0, wave-5 6/16, starvation 10, total deaths 1310, titan
refusals 76; the five lost seeds are the same five, on the same days).
Master drift is ruled out: **the sounding policy itself flips the six
villages**. The mechanism is the march + muster exposure (the scholar
spends days at the lair instead of tending the village; committed Haven
blades die in the muster upkeep/bearer chain, closedecay-style) — stated
as a hypothesis for the next arm, not proven here.

## 6. Panel (§15) — `evidence/2026-11-24/muster-b-panel.md`

Decision: `review_required` (16 paired cases). Wins 0 → 0, national
0 → 0 (no signal). Two regression signals, both consistent with B4:
community loss 0.3125 → 0.6875 (+0.375, CI 0.125–0.625) and village
deaths per 100 calendar days 66.24 → 75.47 (+9.24, CI 2.90–16.58).
Village deaths per run 81.88 → 82.31 (+0.44, regression watch). The
panel compares the old-tip control against the new-tip sounding leg, so
it shares B4's drift confound — but the §5 diagnostic rules drift out
for the survival numbers, so the panel's regression signals stand as
policy cost, not tip noise.

## 7. Sense-test

The muster reads as people answering, not a number. On 109314 (day 68):
"📯 THE CALL GOES OUT — THE HERALD must fall, and no one fire can do
it." / "— Stonebridge answers! Rafael Novak and Kenji Marsh and Theo
Khan and Rafael Garcia and Maya Mendez and Theo Cohen will march.
(trust holds — they are counting on you.)" / "🛡️ Haven commits its own:
Tashi, Elena, Arsen march with the muster. Not loaned. Not asked-for.
Ours. The coalition counts 9 blades against THE HERALD — it needs 10."
The engine itself speaks the shortfall. On 109321 the refresh leg is
visible in the transcript (Giulia steps forward day 98, re-committing
after a loss) — the village notices a missing blade and sends a
replacement, and still counts 9. What is missing is never a person
failing to show up: it is a second village that does not exist. A
villager reading "you have 9" while the gate needs 10 is hearing the
truth about the coalition — and the arithmetic says one more fire.

## 8. Blanks filled / documented, and metric review

**Filled:** the titan muster question (tracker blank #2; the verdict of
sim-titanmuster-b named this arm). Reachability of 10 under a sounding
policy is now measured: 0/16, ceiling 9, one-link villages. The
commit-verb question is also settled: `titanCommitOwn` IS reachable
from policy and was used (Haven committed 3 blades on 8 seeds); the
shortfall is allied links, not the Haven leg.

**Documented (not fixed here — appended to `hidden_files/sim-findings.md`):**
- titanroute march routing failure (109318): 27 march attempts, 0 steps,
  scholar never leaves (4,4) — the lair is unpathable from home.
- mustergap zero-allies gap (109325): with 0 allied answers the commit
  leg stands down and Haven's 3 blades never march.
- musterclose arrears gap (109325): 9 weeks of tending a primary link
  never clears its 4000 arrears, so the refuse bar never moves.
- The sounding policy's village cost (6 flips) — mechanism hypothesis
  (march exposure + muster upkeep/bearer chain) needs its own arm.

**Metric review (frozen bars NOT re-scored):** the bars held, with two
notes for the next run. (1) Max-gate-over-run is the right reachability
read, but gate-at-contact is the honest one for the FIGHT question — here
they coincide (217/217 post-sounding attempts still refuse, max have 9),
so no divergence arose. (2) The pilot's herald-seed selection (all 6
control herald seeds in the pilot) was the right call — it put the
question in front of the instrument first — but the sounding leg met
heralds on 7 MORE seeds (the march brings the scholar to the herald),
so "herald seeds" is a policy-dependent set, not a fixed band property;
the next prereg should define the denominator on the SOUNDING leg.
(3) The B4 cost bars assumed a same-tip control; the frozen control was
an older tip. The diagnostic re-run (same tip, identical numbers)
rescued the attribution, but a frozen prereg should name the control
anchor and require a same-tip re-run when the anchors differ.

## 9. Closeout state

- Files: prereg (9721569f2) + policy + driver + analyzer + proof test
  (7/7) + fixtures + flap-safe writer + panel builder (b62d13213) +
  corpus (16 per-seed files, perseed-muster-b/) + analysis JSON +
  panel .md/.json (+ before/after .json.gz) + this evidence.
- Diagnostic control corpus: 16 per-seed files (RUN=ctl-20261124,
  perseed-tbrefuse-b/) on the current tip — post-hoc diagnostic, NOT a
  re-score of B4.
- Infrastructure notes (for the round record): the host write flap
  hit this arm hard — fresh-file writes refused for ~5-minute windows
  repeatedly (03:36–04:45Z), including git object/ref writes (blocked
  ~03:25–04:06Z; safe-commit failed twice, heartbeat failed, git probe
  failed). Workaround landed: `scripts/muster-b-write.js`
  (temp-sibling + rename + size check, 60 × 10s retries) — the plain
  writeFileSync retry could never succeed because a refused write
  leaves a 0-byte file and every retry against that empty path is
  refused again. Two safe-commit clobbers were repaired per AGENTS.md
  (index showed the committed files staged-deleted; repaired with
  ls-tree -r + update-index --index-info; diff HEAD empty after).
- **Merged locally, pending ship.** Do NOT push, do NOT bump versions.
  The ship loop owns deploys.
- Verdict for the coordinator: **NO-GO** (B4 cost bars; B1/B2/B3/B5
  pass). The next arm is the one-link ceiling (a second link, or a
  lower herald need) and the sounding policy's village cost — NOT
  another muster count.
