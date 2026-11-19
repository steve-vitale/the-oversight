# journey-scale r244 — ANSWERMAIL lever panel (lane A, leg 3 SCALE)

**Run id:** `2026-11-19T07:46:41Z` (lock run_id).
**Run:** scheduled Thu 2026-11-19 01:45 CST (07:45 UTC); lock created 07:46:41Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.**
**Base:** local master `800405556` (r243 deepening merged).
**Pre-flight:** main tree clean, disk 44%, stale-lock recovery (lock read
`2026-11-19T05:50:25Z`, no registry tree for that run_id; the r243
deepening run had already merged and deleted the lock). `git pull` up to
date. Reap ran (9/16 active, all with uncommitted changes — reaper
correctly leaves them). Worktree registration ~5.7 min (slow checkout).
Heartbeat landed at registration; 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r244.sh`) ran the whole run.
**Machine restart ~08:11Z:** the VM restarted mid-run (uptime "up 3 min"
at 08:14Z), killing the first pilot attempt and the hbloop. Recovered:
heartbeat refreshed 08:14:52Z, hbloop restarted (PID 3324), lock intact,
worktree intact, pilots relaunched. Arm-C 103861 corpus from the first
attempt survived complete and was kept, not re-run.
**Time-box:** hard stop ~09:45Z; panel done 08:38Z, gate done 08:48Z.

## Q1 — ANSWERMAIL: NO-GO

**Prereg bar:** GO iff mechanism fires (≥1 tend or renegotiation answer
on ≥6/8 arm seeds) AND arm national ≥3/8 AND arm − control ≥2.
**Result:** mechanism fired on **8/8** arm seeds — 60 tends (90,000 kcal
paid), 27 renegotiation answers, 12 accord answers, 0 demand answers,
**945 tends blocked by the 20,000 kcal pantry gate** — but national is
**1/8 on both arms (delta 0)**. The lever is real, heavy, and moves
nothing about national. **NO-GO.** The answermail composition stays a
branch (driver keeps the `ANSWERMAIL` flag); it does NOT become the
scale policy default.

National on this band: control B 103868 (trade charter d67, national
from d66, 16 national days, global rank voiced) and arm C 103866
(trade 3/3, national from d82, 60 national days, global rank). Both
reached national through TRADE, different seeds — the band's national
rate is 1/8 on either policy.

**Why the lever fails:** the blocker taxonomy is identical on both
arms — FORMATION-FEW 3, COLLAPSE 3, FORMATION-LATE 1, NATIONAL 1.
The r243 trust-decay diagnosis was real (unanswered beats, trust in
the 30s) but answering the mail does not fix it: on 6 of 8 seeds the
third link never forms at all, or forms too late, or the village
collapses first. Trust-tending cannot season a link that does not
exist. The wall is **formation**, not trust. The next scale run's
question is why the third link never forms (see Metric review).

**Cost read (pilot signal adjudicated):** the pilot's C 103862
starvation flag (5 of 13 starved, village over d62 vs B alive d141)
did NOT generalize. Full panel starvation deaths: B 7, C 6.
Lived-days: B 129.8 mean, C 120.9 (−6.9%, guardrail ±25% HOLD).
Wave-4 kills: B 21, C 13 (paired seeds diverge wildly; read as noise,
not a lever cost — not gated). Muster committed deaths: B 6, C 9.
No regression verdict on the lever; it simply does not move national.

## Q2 — Blocker taxonomy (measurement)

| Blocker | B | C |
|---|---|---|
| FORMATION-FEW (only 2 links ever form) | 3 | 3 |
| COLLAPSE (village over before national) | 3 | 3 |
| FORMATION-LATE (3rd link d124/d128) | 1 | 1 |
| NATIONAL | 1 | 1 |

Closest roads: LEAD 2/3 seasoned on 5 of the 7 non-national B seeds
and 4 of 7 C seeds; TRADE 2/3 on B 103864 and C 103864. No seed was
blocked on TRUST-LOW or SNAP — the r243 classes did not recur on this
band. The formation-late seeds formed their 3rd link d124 (C 103867,
trust 28, age 17) and d128 (B 103867, trust 19, age 13) — after the
d120 trade-window close, too young to season by d140.

## Q3 — Regression guards: all HOLD

- **Vetbar:** 0 disagreements on both arms (GO).
- **Lived-days:** B 129.8 vs control 123 (+5.5%); C 120.9 (−1.7%);
  both within ±25% (HOLD).
- **Lesser seat priced:** 8/8 on both arms (HOLD).
- **Spoken-raise:** B 10 talks (8 properly answered, 0
  not-offered-spoken [DEFECT], 2 not-offered-unspoken [correct hold]);
  C 9 talks (7 properly answered, 0 defect, 2 correct hold). GO both.
- **Trap-line:** B HOLD (2 sittings, both answered, 0 defect); C
  SILENT (no mime shown in the band — nothing to regress-check).
- **Betrayal sibling:** B 2 turn-0 offers, C 1, all with the invite
  label in the opening, 0 defects. HOLD both.
- **Nod-loop:** worst streak 3x on both arms (guard ≥4). HOLD both.
- **Daily-play mime (read-only):** B 17 daily mimes, C 16; daily
  accepts proven 0 by the capture lower bound on both arms; 0 off-day
  accept events. Lane decision still owed: teach the shared chooser
  to take betrayal:accept + nv:accept when offered, or keep proving
  fixes only where the driver looks.

## Q4 — People check

Read in full: B 103861 d120 (Tanya's bond proposal — player leaves,
clean), B 103862 d90 (Ruth's trap-line walk: two plants taught, dry
humor, honest ending — the bar, met), B 103864 d90 (Aisha at the
hollow: grief, then "Do you dream about before?" and "I'd rather be
boring to the sky. Boring things get left alone." — a person, not a
menu), C 103861 d90 (Johan closes the creek-water thread, warm and
thin), C 103863 d120-nv (Mia, Norwegian-only: three nods in a row,
each answered distinctly, closing on a wordless promise — the nod
streak of 3 is inside the guard but the picker leans on nod).
Plus all raise talks (19 total, 0 defects) and all nonverbal sittings.
No new dialogue defect class. No fabricated shared history, no filler
loops. Villagers act like people; the policy just rarely takes them up
on what they offer (bonds, walks) — that is the policy's choice, not
the dialogue's failure.

## Q5 — Census, spotter, wave-5 door

- **Census:** books close on all 16 seeds (unattributed 0). Lesser
  seat 8/8 both arms; full seat 0/16. Stage 3 reached d25–d59.
  Tribute delivered: B 2/8 (103861 d104, 103862 d94), C 1/8 (103864
  d84); the rest NEVER-READY.
- **Spotter:** 1 villager per village carries spotter XP at d90 and
  at end on nearly every seed — thin but present, same as r243.
- **Wave-5 door:** 0 wave-5 fights on all 16 seeds; live wave-5
  entities seen on only 3 B seeds (103861: 25 days, 103862: 48 days,
  103868: 5 days) and 0 C seeds. The door never opened on this band.
  Sortie: all zero. **Muster:** B slew 2 titans (3 fights, 58 wave-4
  fights / 21 kills), C slew 2 (2 fights, 51 / 13) — MOVED both.
  **March:** MOVED both (B 100 march-days / 72 arrived; C 25 / 6).
- **W5-instance (r207-owed):** UNANSWERED on all 16 seeds — no
  wave-5 fights, so one-Editor-vs-successive-Editors stays open.

## Gate and telemetry

- **Gate:** `node scripts/check.js --quick` — **335 passed, 9 failed
  in 1481s** (`journey-scale-r244-gate.log`). r243's gate was 337/7.
  New failures vs r243: `test-measurement-cache-flags.js` (exit 1,
  69.4s) and `test-occupation-panels.js` (120.2s timeout). The other
  7 are r243's known set: stale balance-proof pair
  (`test-measurement-proof-update`, `test-measurement-workflow`),
  phone-frame receipt staleness (`test-phone-frame-proof`), and the
  deed-attainment 120s timeouts (`test-living-garden-deed-attainment`,
  `test-one-person-army-deed-attainment`) plus the two load-artifact
  timeouts (`test-trust-observer-neutrality`, `test-capable-bot-20261014`).
  **Solo re-runs on the quiet box, all GREEN:** cache-flags 4 passed
  in 29.5s; living-garden exit 0; occupation-panels 25 passed;
  one-person-army exit 0; trust-observer-neutrality 6 passed;
  capable-bot 40 passed. All 6 non-pre-existing failures are load
  artifacts (panel + gate sharing 1.5 CPUs), not assertions.
  **0 failures attributable to this run's change** (policy-only:
  driver + analyzer + proof test; zero `src/js`).
- **Telemetry:** two LOUD lines on the control arm, both adjudicated
  as baseline staleness, baseline NOT rolled (r243 precedent):
  `fightsByWave.4` 178 → 58 (−67%) and `maxGameDay` 468 → 1038
  (+122%), n=8 files. Per-file: r243's own band was w4 9.4/file and
  138.9 days/file; r244 B is 7.25/file and 129.75/file — within
  band-to-band variation. The baseline is a 4-file sum (44.5 w4/file)
  from an unknown, fight-dense band; its provenance is unrecoverable.
  `fightsTotal` stayed quiet.

## Tooling

- Driver `scripts/journey-scale-r244-20261119.js` (ANSWERMAIL flag,
  per-seed answermail stats), analyzer
  `scripts/analyze-journey-scale-r244-20261119.js` (ANSWERMAIL +
  BLOCKER sections, PANEL VERDICT), proof test
  `scripts/test-journey-scale-r244-analyzer-20261119.js` (**136 passed,
  0 failed**). Build commit `be496b7715`. Safe-commit index clobber
  struck after the commit (staged-as-deleted); repaired with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; verified status empty + diff HEAD empty.
- Corpora: goal `hidden_files/evidence/2026-11-19/`,
  `journey-scale-r244-{b,c}-*` (16 seeds × 2 arms); analysis at
  `journey-scale-r244-analysis.txt`; logs
  `journey-scale-r244-{pilot,panel}-{b,c}.log`, `journey-scale-r244-gate.log`.

## Metric review

- Q1's bar was met on mechanism (8/8) and missed on outcome (1/8,
  delta 0) — the bar did its job: it separated a firing lever from a
  working lever. The Nov 10 prior (0/16 on the competent base) now
  has a second confirmation on a different policy: answermail does not
  move national. Two confirmations is enough — the next scale run
  should NOT re-test answermail; it should test the formation wall.
- The tend pantry gate (20,000 kcal, leadcourt's) blocked 945 tend
  attempts vs 60 paid (94%). If a future run lowers that gate, it is
  a new lever with its own prereg — not a quiet tweak of this one.
- Q2's taxonomy held: FORMATION-FEW + FORMATION-LATE + COLLAPSE is
  7/8 of each arm. The formation question is now the named next
  run: what gates the 3rd link's formation — the r113 sub-cap guard
  holding subs at 1 while the trade window is open, or something else?
  The r243 diagnosis (trust decay) is demoted to a contributing
  factor, not the wall.
- The lived-days control (123, r233) still fits both arms.
- Gate note: r243's note said "6 failed" but its log says 7; this
  run's count (9) is taken from the log, not the note.

## Village assessment (plain words)

Eight fresh villages, days 80–140, played as a competent neighbor
who answers every letter the game sends. Three villages on each side
collapsed before day 140 — people died in the wild, of sickness, of
thirst, a few starved — and the ones that survived mostly sat at
regional with two seasoned friends and no third. One village on each
side broke through to national, both through trade, both by luck of
the draw rather than anything the player did: the letters were
answered, the gifts were given, the pantry paid 90,000 calories of
tending on the answering side — and the outcome was the same as the
side that answered nothing. The villages feel alive in the small
moments — Aisha at the hollow, Ruth teaching plants on the trap line,
Mia's wordless promise — but the road to national is not a road the
player can walk by being diligent. It is a road the village either
finds a third friend on, or does not, and no amount of answering the
mail changes that.

## Verdicts

- **Reachable:** national is reachable (1/8 each arm) but not
  steerable — the player cannot earn it by doing the right things.
  The full seat stays unreachable on this band (0/16).
- **Fun:** the leg's small moments hold up (see Q4); the scale
  climb itself is a waiting game with no lever the player can pull.
- **Winnable:** no. The winnability wall stands at coalition
  formation + launch, same as r243 deepening found. National 1/8,
  full seat 0/16, wave-5 door 0/16.
- **Landing:** NO-GO per prereg. Answermail composition stays a
  branch. Merged locally, pending ship (tooling + evidence only).
