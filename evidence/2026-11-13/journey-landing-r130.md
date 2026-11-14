# journey-landing r130 — LANDING leg (Lane A, leg 0, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261113T2218Z (scheduled Fri 2026-11-13 15:45 CST, started 22:18Z).
**Base:** local master `6df2519b9` (proofrefresh-b11 landed; culpritbisect round 13 merged
941eecdce). **Rotation:** read 0 → wrote 0→1 at run start (verified by read-back).
**Prereg:** `evidence/2026-11-13/journey-landing-r130-prereg.md` (committed with this run).
**Panel seeds 1142–1151** (deliberate reuse, 10th run on the r121 band, sanctioned in prereg).
**Driver:** `scripts/journey-landing-r130-20261113.js` (r128 AFTER driver verbatim except
OUTDIR/header). **Corpora (goal hidden_files, outside repo):**
`evidence/2026-11-13/landing-r130-after/` (10 seeds, pilot 1142/1146/1150 + remainder),
`landing-r130-after-fix-1150/` (seed 1150 re-run with the D3 fix, in-the-wild proof).
**Worktree:** `~/workspace/worktrees/journey-landing-r130` (branch `journey-landing-r130`;
slug differs from the body's `journey-landing` because branch `journey-landing` is
occupied by the r129 terrain-pocket fix, commit 59ad7c479, NOT on master, awaiting
Steve's (a)-re-baseline / (c)-leave-unmerged call — this run did not touch it).

## Verdict: D3 FIXED + landed in-branch, D2 CLOSED by audit, HEED CARRIED with a panel rate

The owed landing-leg mission (the 14:45 slot pivoted to the r129 forage probe and
produced no leg mission) is done: full 10-seed panel played, census in plain words,
people check on 104 transcripts, one blank filled (D3), two carried items closed or
measured. The r129 terrain-pocket fix and D1 menu-label fix stay OUT of scope — they
live in commit 59ad7c479 on branch journey-landing, awaiting Steve; this run
documents their absence on master (D1 garbled label: 7 occurrences on the panel)
and never re-fixes or cherry-picks them. No threshold, bar, price, or gate changed
(gating freeze stands). No policy change.

## Q1 (PRIMARY) — r129's filed dialogue defects

New instrument: `scripts/analyze-landing-q1-dialogue.js` (counts D2/D3/HEED/D1 per
sitting across a transcript corpus; D3 counts tension-ONLY answers — the tension
line with NO injured status named — after the r130 fix redefined the hit).

### Q1-D2 — warn_you verbatim repeat: CLOSED, no fix needed (pool audit)

- **M-Q1-D2a (pool audit): DONE, premise corrected.** The repeated line lives in
  `convoWantWarning` (src/js/convo-wants.js, ~line 2996) — the r129 premise ("not in
  convo-wants.js") was wrong. The pool holds 9–10 variants (3 recent-attack + 1
  monster-named + 3 known-monster + 3 generic) with a per-villager rotation cursor
  (`state.convoWarnCursor`) that advances past each delivered line and skips lines
  the no-repeat ledger would block (`convoWouldBlock`). The r128 repeat was a
  same-sitting re-draw across the thread-resume (`[alive:thread:want]`) and
  want-opener (`[alive:want:warn_you]`) paths; on current master the two draws
  return different lines (1150 d6: line 61 "I don't know what's moving out
  there..." vs line 240 "Something's been moving out past the treeline..." —
  same as r129 AFTER). The `"Me? Okay."` prefix on the second delivery is an
  ack prepended by `convoComposeBeat` (delivery, not content).
- **M-Q1-D2b (fix): NOT NEEDED.** Panel count: **0 verbatim repeats** across 104
  transcripts / 2 warn_you sittings. The pool is healthy and the repeat does not
  reproduce. Filed as [closed] in sim-findings.md; the Q1 counter stays as the
  regression instrument.

### Q1-D3 — ask:village "How are the injured doing?" answered with leadership tension: FIXED

- **M-Q1-D3a (routing pin): DONE.** `convoVillageLine` (src/js/conversation.js)
  composes the village answer from grief/cheer/hunger/fear/heat bits and had NO
  injured bit at all. The label is the medicinal-occupation variant of ask:village
  (`convoLabel`, conversation.js:4331); the composer could never mention the
  injured. On 1150 d6 the only live bit was heat, so the answer was "Honestly?
  there's tension about who's in charge." — true village news, wrong question.
- **M-Q1-D3b (fix): LANDED in-branch.** `convoVillageLine` now leads with the
  injured status: sick (`v.sick`) or low-health (`v.health < 100`, the
  combat-wound pool `tbSyncHumanHealth` writes) villagers count as hurt
  ("1 person is injured" / "N people are injured"); when nobody is hurt and
  other news exists it says "nobody's injured right now"; on a quiet day with
  no live bits the temperament idle pool still answers (flavor preserved).
  Scholar's own health never counts (explicit exclusion).
  **Proof:** `scripts/test-journey-landing-r130-village-injured.js` **7/7 GREEN**
  on fixed code; **FAIL-control RED** on a pristine-HEAD scratch copy (case 1,
  the exact pre-fix line "Honestly? there's tension about who's in charge.";
  scratch deleted after). **In-the-wild:** seed-1150 re-run with the fix, same
  sitting: `THEM: "You want to know about that? Okay." "Honestly? 3 people are
  injured; there's tension about who's in charge."` — Q1 counter D3 **1 → 0**.
  (Note: 3 people ARE injured on 1150 d6 — the hurt state is real, not a
  zero-case fallback; the hurt>0 branch fires in the wild.)
  Filed as [fixed-in-branch] in sim-findings.md (merge pending at this writing).

### Q1-HEED — warn_you heed-cycle filler loop: REPRODUCED, carried (design call)

- **M-Q1-HEEDa (recurrence):** **1 sitting** on the panel (1150 d6, Dauletkhan,
  warn_you stage 1): **21 turns**, `[dlg:heed]` offered 12× and `[dlg:details]`
  12×, **neither ever taken**, want stuck stage 1. Panel rate: 1/104 sittings
  (1/2 warn_you sittings). The fixed-1150 re-run reproduces it byte-identically
  in shape (21 turns, 12+12 offers, 0 takes) — the D3 fix is scoped and does
  not touch the cycle. The R55 wind-down DOES surface (turn 20) — the pacing,
  not the mechanism, is the defect.
- **M-Q1-HEEDb (fix): NOT LANDED.** A sooner wind-down or a heed that lands is
  a design call (wind-down pacing), not a safe small fix — carried with the
  panel rate. sim-findings.md HEED entry updated with the r130 rate.

**Interesting finding (pre-registered):** D3 reproduced with its mechanism pinned
and fixed in-branch; D2 did not reproduce and its pool proved healthy; HEED
reproduced at a measured rate. All three pre-registered outcomes landed.

## Q2 — PRACTICE / HUNT (carried): GO

movedCells d1→d28=**97** (r129 AFTER 93, BEFORE 97 — identical to BEFORE, as
expected: r130 runs the same code as r129 BEFORE), seedsWithMove **10/10**,
skill0→pos 46, practiceReps **2757** (identical to r129 BEFORE). Bar (≥50, 10/10
moving): GO. Hunt reps **0** (13th panel running — H1-ESTABLISHED carries);
kills 223 (r129: 212; per-seed 22.3 vs 21.2 — seed variance, no code change).

## Q3 — BINDINGS, judged fresh on this panel

- **M1 ALIVE-D14:** **10/10** villages alive at d28 (over=no on all 10 seeds).
- **M2 SYSTEM CONTACT:** **10/10**, all systemDay=8.
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger (zerodmg-v2 byTrigger
  {"pending-face":1} — a known trigger; 6 fights, 1 zero-DMG no-strikes fight,
  same as r129 BEFORE's 1). Zero-DMG invariant test PASS (6 fights, 0 violations).
- **M5 PEOPLE:** PASS (sense-read below).
- **Scholar-turns:** fights=6, zeroDmg=1, B-shape=0, verbTotals {player-wait 0,
  player-move 6, player-barrier-exit 0, player-ability 0} — BEFORE shape.
- **Pocket watch (regression, unfixed code):** stuckFights 0, move-refusals
  byReason {} — no pocket fight on this band (defect seed 1209 not in band).
- **D1 watch (out of scope, document only):** garbled label "We never finished —
  themselves." **7 occurrences** across 6 files (1142 d6, 1146 d7, 1147 d8,
  1149 d5, 1151 d5/d6) — live on master as expected (fix in 59ad7c479). NOT fixed.
- **Personal bridge (r125 fix):** 0 repeats in a sitting (104 sittings, 14 servings).
- **Small bridge (r127 fix):** 0 repeats (plans/gossip/small all 0/0).
- **Q1 r126 (combat-interrupted evening chain):** presshop farUnreached **1**
  (identical to r129 both sides — regression check binds, "stays 0" wording
  carried as not-met on either side; see metric review).
- **Outingchain (r118):** CHAIN-COMPLETES-FAR (asked 28, kept 6, deliver 2 —
  identical to r129 BEFORE). R72: haulPresses=9, deliveredKept=6, deliveredLate=3.
- **Move-refusals (r128):** byReason {} (no refusals), stuckFights 0.
- **Commit-offer (M-PR1):** max per-seed never-offered **2** (1149 d13/d15 — the
  r129 Q4 cause stands: no offer fires when the want isn't engaged; r130
  reproduces the BEFORE shape exactly). 1148 d8 and 1150 d10 also never-offered.
- **1130-d6 amnesia shape:** 0 recurrences. **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** starvation deaths **0**. **Mantle latency:** vacuous (mantleLog empty).
- **Topic-dwell:** want dwell=147, servings=44 (the HEED sitting dominates);
  askPicks personal=14 goal=5 past=5 village=4 plans=3 fears=2 gossip=2.
- **Follow volunteers (folTelemetry.fires):** 13 fires across 8 seeds (trust
  50–58, goals home/understand/heal/remember/family/legacy/prove/feed) — healthy
  volunteer events, see telemetry section.

## Village assessment (plain words)

Ten villages, all alive at day 28. Every village met the System on day 8. Nobody
starved. The first fortnight is a live, working on-ramp: people practice (97
cells of movement, skills moving 0→positive for 46 villagers), fight and win
small fights (223 monster kills, mostly hushwolves and the like), and talk like
people — with two exceptions that matter. The 1150 village's Dauletkhan spent a
whole sitting warning the scholar about something moving past the treeline and
never got heard: the scholar kept changing the subject, the warning stalled for
21 turns, and the conversation ended without the warning ever landing. And the
same sitting asked after the injured and got an answer about who's in charge
instead — fixed now. The villages are healthy; the dialogue has one real loop
left (the heed cycle) and one garbled label (the "themselves" thread line) that
belongs to the r129 fix awaiting Steve.

## People check (M5 — sense-read, panel transcripts)

- **1150 d6 (Dauletkhan, warn_you):** the warning lands and reads ("I don't know
  what's moving out there, but something is."), the second warning at turn 19 is
  a different line ("Something's been moving out past the treeline...") — the
  two deliveries are distinct, the pool rotation works in the wild. The sitting
  itself is the HEED loop: 21 turns of dodges and brush-offs, want never
  advancing. The defeat is legible; the loop is the defect.
- **1150 d6 turn 3 (D3, before fix):** "How are the injured doing?" → "Honestly?
  there's tension about who's in charge." Reads as a non-sequitur on its face.
  **After fix (same seed/day/sitting):** "Honestly? 3 people are injured;
  there's tension about who's in charge." — the question is answered first,
  then the tension. Reads as a person giving the news.
- **1142 d6 / 1146 d7 (D1):** "We never finished — themselves." still renders in
  the personal-thread menu — garbled pronoun, live on master, out of scope.
- **1149 d13/d15 (Q4):** Jovan's immediate leave and Desmond's gossip drift both
  read as real people making real choices; the never-offered shape is a
  consequence, not incoherence.
- **Follow volunteers:** 13 times a villager walked up and said "I'm coming
  with you" (trust 50–58) — people choosing to follow the scholar, unprompted.
  That reads as a living village.

## Reachable / fun / winnable (leg 0, d1–28)

- **Reachable:** yes — 10/10 villages alive at d28, System contact d8 on all
  seeds, fights/outing chains/practice all firing, follow volunteers firing.
- **Fun:** yes, with the filed caveats — the D3 fix removes a real non-sequitur
  from the landing dialogue; the warn_you heed loop is the remaining dull spot
  (one 21-turn sitting per panel); the garbled "themselves" label still shows
  in 6 files until the r129 fix lands.
- **Winnable:** leg 0 is the on-ramp, not the win; the panel's job is a live
  village with moving practice (97 cells) and no stranded scholar — met.

## Telemetry

`telemetry-check.js` on the panel vs baselines — **3 LOUD lines, all EXPLAINED,
baseline NOT rolled**:
- `landing.json` is SUPERSEDED (its own `_superseded` note: "Do not compare new
  landing corpora against this file" — deaths series split per panel ruling 753).
  Its LOUD lines (systemDay 32→80, deaths 12→227, fires 0→13) are against a dead
  baseline, not the game.
- vs the live `landing-split.json` (rolled r66, 4-seed era): systemDay 33→80 is a
  panel-size scale artifact (per-file mean 8.0 vs 8.25); monsterKills 24→223 is
  the same artifact against an r66-era 4-seed total (per-seed 22.3 vs r129's
  21.2 — no movement vs the previous panel); folTelemetry.fires 0→13 is the
  follow-volunteer behavior firing (13 healthy volunteer events, trust 50–58),
  which the r66-era baseline predates. villagerDeaths and starvAutopsies quiet.
- Metric-review proposal for the NEXT run: re-seed landing-split.json from the
  r129/r130 panels (10-seed totals + per-seed means) so the baseline stops
  crying scale on every run; the monsterKills series needs a per-seed-mean
  comparison, not a 4-seed total.

## Metric review

- Q1 r126 presshop farUnreached bar "stays 0" — carried from r129: the base
  carries 1 on both r129 sides and on r130, so the bar as written is not met on
  any side; the regression check (identical across runs) is what binds. Propose
  re-wording the bar to "farUnreached identical to the previous panel" for the
  next run.
- M-PR1 (commit-offer) bar: r130 reproduces the BEFORE shape (max 2
  never-offered per seed, 1149 d13/d15). The bar as carried ("max 1") was met
  on r129 AFTER via path divergence, not a fix — the underlying cause (no offer
  fires when the want isn't engaged) is unchanged. Propose judging M-PR1
  against the BEFORE shape, not the AFTER divergence, for the next run.
- Telemetry baselines: see above — re-seed proposal.
- No metric was re-scored mid-run. A miss is NO-GO, never re-scored (§14).

## Gate

`node scripts/check.js --quick` in the worktree: **330 passed, 10 failed in 816s** (exit 1).
Log: `evidence/2026-11-13/journey-landing-r130-gate.log`.
**Verdict: GO — 0 attributable failures.** Adjudication (adoption, run id
d624422a-c4dc-4bba-a3ff-520450a6758f; the run's own gate session was interrupted,
so the gate was re-run in full at adoption):

| failure | cause | evidence |
|---|---|---|
| test-human-combat-parity.js | flap (EPERM write) | gate log shows `code: 'EPERM', syscall: 'write'`; standalone re-run exit 0, 69 passed, 0 failed (`adj-test-human-combat-parity.log`) |
| test-measurement-flags.js | flap (EPERM write) | gate log EPERM; standalone exit 0, 5 passed, 0 failed |
| test-measurement-source-text.js | flap (EPERM write) | gate log EPERM; standalone exit 0, 4 passed, 0 failed |
| test-measurement-cache-flags.js | flap (EPERM write at balance-panel.js:332) | gate log EPERM; standalone exit 0, 4 passed, 0 failed |
| test-living-garden-deed-attainment.js | load (check.js 120s timeout) | standalone exit 0 |
| test-one-person-army-deed-attainment.js | load (check.js 120s timeout) | standalone exit 0 |
| test-occupation-panels.js | environment (writes during flap/VM-replacement window) | standalone exit 0, 25 passed, 0 failed |
| test-measurement-proof-update.js | pre-existing staleness | fails IDENTICALLY on master 249da4729 (read-only run): "Proof source inputs are not current" |
| test-measurement-workflow.js | pre-existing staleness | fails IDENTICALLY on master: 8 passed, 1 failed, "retained neutrality proof covers the current Game/controller/harness inputs" |
| test-phone-frame-proof.js | pre-existing staleness (standing set) | fails IDENTICALLY on master: 3 passed, 3 failed, same three assertions |

The gate ran through a flap window (flap-watch FLAP? 23:19:45Z + 23:20:48Z, VM
replacement boot 5623d281→577910a4 mid-gate) and the write-flap resumed
23:29:05Z–~23:37Z; all write-dependent re-runs were done in the clear window
from 23:52Z. The D3 fix touches only `convoVillageLine` dialogue text and
cannot produce EPERM write refusals or 120s timeouts; no failure names
conversation.js, convo-wants.js, or any dialogue test. The staleness trio is
the standing set (proof refresh round 12 owed, incl. r195's src/js changes).

## Run bookkeeping

- Rotation `journey-rotation-a.txt`: read 0, wrote 0→1 at run start (verified).
- Lock `playtest-loop.lock` (run_id `2026-11-13T22:18:21Z`) deleted at closeout
  after run_id verification.
- Flap: the host write flap that blocked the morning (active since 21:27:38Z)
  ENDED 22:15:07Z on a VM replacement (boot bbb98318 → e6e16cb5); this run's
  probes pass (atomic-rename, O_EXCL, git ref write all OK). No flap during
  this run.
- r129 fixed-side probe bonus (which errand Chantal picks instead on day 28):
  NOT completed this run — the leg mission + D3 fix + closeout filled the
  window. `~/workspace/scratch-fixed/` (0-byte game.js/convo-scene.js) still
  needs deleting; do not trust its contents.
- sim-findings.md: HEED entry updated with r130 rate; D3 entry updated with
  fix + proof + in-the-wild result; D2 closed with a new entry (pool audit).
