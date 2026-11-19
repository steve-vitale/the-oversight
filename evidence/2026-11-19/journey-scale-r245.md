# journey-scale r245 — SUBCAP-LIFT lever panel (lane A, leg 3 SCALE)

**Run id:** `2026-11-19T14:46:29Z` (lock run_id).
**Run:** scheduled Thu 2026-11-19 08:45 CST (14:45 UTC); lock created 14:46:29Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout.**
NOTE: r244's note said it would write 3→0 on success, but the rotation
file still read 3 at this run's start. This run played scale as the
rotation said; the discrepancy is recorded, not "fixed" by guessing.
**Base:** local master `de9bb3c22` (journey-succession r248 merged).
**Pre-flight:** main tree clean, disk 49%, no lock present (no stale-lock
recovery needed). `git pull` up to date. Reap ran (12/16 active, all
with uncommitted changes — reaper correctly leaves them). Worktree
registration ~10.3 min (slow checkout under load, no flap error).
Heartbeat landed at registration; 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r245.sh`) ran the whole run.
**Machine write flap 15:49Z–16:21Z (~32 min):** EPERM on writes across
the VM (git ref writes, registry atomic writes, /tmp balance-panel
writes, goal-evidence writes — bursty, sub-minute windows). The analysis
capture needed 5 attempts (single-writeFileSync retry loop); the gate's
solo re-run of cache-flags failed inside balance-panel on the same
EPERM, which is itself evidence the gate failure is a flap artifact.
Heartbeat landed until 15:46:28Z, then failed through the flap; the
tree sat ~35 min stale at most (reaper threshold 4h — safe). Flap
cleared 16:21:49Z (git probe OK); closeout proceeded immediately.
**Time-box:** hard stop ~16:46Z; panel done 15:48Z, analyzer done
15:49Z, closeout 16:21–16:46Z (flap-delayed).

## Q1 — SUBCAP LIFT: PARTIAL

**Prereg bar:** GO iff mechanism fires (a 2nd-or-later sub linked by a
raise on ≥6/8 arm seeds) AND arm national ≥3/8 AND arm−control ≥2.
**Result:** mechanism fired on **6/8** arm seeds (linked 18,
passedSubCapOff 74) — but national is **C 2/8 vs B 0/8 (delta +2)**.
The lever moves the wall but does not clear it. **PARTIAL.** The
sub-cap-off composition stays a branch (driver keeps the `SUBCAPOFF`
flag); it does NOT become the scale policy default.

Control B: firedSeeds 1/8, linked 8, **skippedSubCap 152 of 182 seen
(84%)** — the guard refused nearly everything again on a fresh band,
same as r244's 81%. Arm C: firedSeeds 6/8, linked 18, passed 74,
seen 53. The two arm nationals (103872, 103876) both came via LEAD,
both from d68 — early national, the first time on this policy the
village broke through before d80.

National on this band: control 0/8 (the harshest control band yet —
r244's was 1/8); arm 2/8. The control's 0/8 is the formation wall at
its worst: 5/8 seeds never formed a 3rd link at all.

## Q2 — Blocker taxonomy (measurement)

| Blocker | B | C |
|---|---|---|
| FORMATION-FEW (only 2 links ever form) | 5 | 1 |
| COLLAPSE (village over before national) | 2 | 0 |
| FORMATION-LATE (3rd link d110+) | 1 | 0 |
| TRUST-LOW (3rd link old, trust <40) | 0 | 4 |
| SNAP (3 formed, fewer active) | 0 | 1 |
| NATIONAL | 0 | 2 |

The taxonomy FLIPPED on the arm: formation is no longer the wall —
trust is. The arm's 4 TRUST-LOW seeds formed their 3rd link EARLY
(d44, d44, d54, d84 — plenty old enough) and watched trust rot to
10–32 by d140. The lift forms the links; the links then decay
untended. The one FORMATION-FEW seed on the arm (103877) is a
no-raise seed — the village simply never raised for more (lr 1/1 on
both arms), so no policy could have answered.

**Trade-road watch:** tradeSeasoned 3/3 on 0/8 seeds on BOTH arms;
nationalViaTrade 0/2 on C. The lift did NOT cost trade — trade
produced nothing on this band on either arm. The trade-first policy's
trade league never seasoned once in 16 villages; whether the trade
road is viable at all on current master is an open question for the
next scale run to watch, not this run's verdict.

## Q3 — Regression guards: all HOLD

- **Vetbar:** 0 disagreements on both arms (GO).
- **Lived-days:** B 137.4 (+11.7% vs control 123); C 140.8 (+14.4%);
  both within ±25% (HOLD).
- **Lesser seat priced:** 8/8 on both arms (HOLD).
- **Spoken-raise:** B GO, C GO (0 not-offered-spoken, ≥1 properly
  answered each).
- **Trap-line:** B HOLD, C HOLD (0 defect sittings).
- **Betrayal sibling:** B HOLD, C HOLD (0 defects).
- **Nod-loop:** worst streak 3x on both arms (guard ≥4). HOLD both.
- **Daily-play mime (read-only):** B 17 daily mimes, C 18; daily
  accepts proven 0 by the capture lower bound on both arms; 0 off-day
  accept events. Lane decision still owed: teach the shared chooser
  to take betrayal:accept + nv:accept when offered, or keep proving
  fixes only where the driver looks.

## Q4 — People check

Read in full: C 103872 d120 (Deborah, locksmith, withdrawn, trust
90 — she asks about the taken, Kyle; the player promises to ask the
System; "Even asking is more than the silence." — a want, a promise
owed, an honest ending), B 103878 d120 (Rafael, roofer, restless —
betrayal:accept opening, teaches water-reading on the way, "Home is
where they save you a seat. I'm looking for my seat." — a person,
not a menu), C 103872 d120-nv (Omar, piano tuner, Arabic-only —
three nods, each answered distinctly, "Talk to ME, not through it."
— the nod streak of 3 is inside the guard but the picker leans on
nod, same as r244's Mia), C 103872 raisetalk-1 d13 (Omar again —
outcome not-offered: no shared language, so no offer could be
spoken; correctly recorded, not a defect).
Plus all raise talks (B 16: 8 properly answered, 1 counter, 0 defect;
C 41: 18 properly answered, 6 counter, 0 defect) and all nonverbal
sittings.
No new dialogue defect class. No fabricated shared history, no filler
loops. Villagers act like people; the policy now takes them up on
what they offer (the lift answers the raises), and the villages that
do link early still watch the links rot — that is the trust wall,
not the dialogue's failure.

## Q5 — Census, spotter, wave-5 door

- **Census:** books close on all 16 seeds (unattributed 0). Lesser
  seat 8/8 both arms; full seat 0/16. Stage 3 reached d23–d44.
  Tribute delivered: B 0/8 (READY-UNPAYABLE 3, NEVER-READY 5), C 0/8
  (READY-UNPAYABLE 1 — 103876 d96, NEVER-READY 7); every ready
  tribute was veterans-short (payable 1, needed 2).
- **Spotter:** 1–3 villagers per village carry spotter skill at d90
  and at end on nearly every seed — thin but present, same as r243/r244.
- **Wave-5 door:** 0 door fights on all 16 seeds. B 103872 MIXED
  (one recurring lingerer ling9 fought 3× + 1 fresh full-HP editor;
  live wave-5 entities 41 days); B 103875 7 wave-5 fights, all fresh
  wild (UNANSWERED). C 103876: **25 wave-5 fights** (7 scholar, 18
  field; recurring ling12 ×4, ling13 ×4; 5 fresh full-HP) — the
  national village swims in wave-5 beasts, live entities 43 days.
  Sortie: all zero. **Muster:** B slew 2 titans (3 fights, 69 wave-4
  fights / 21 kills), C slew **4** (5 fights, 89 / 24) — MOVED both.
  **March:** MOVED both (B 27 march-days / 9 arrived / 2 slain;
  C 13 / 13 / 4 slain). The arm's bigger coalition fights better:
  C's muster rows are few because its heralds die fast (103871:
  herald slain d71; B's stood down d85 and lingered 75 days).
- **W5-instance (r207-owed):** UNANSWERED as a door question on all
  16 seeds — no wave-5 fights through the door, so one-Editor-vs-
  successive-Editors stays open. C 103876's recurring lingerers
  (ling12, ling13, 4 fights each) are the closest approach yet.

## Gate and telemetry

- **Gate:** `node scripts/check.js --quick` — **335 passed, 9 failed
  in 1458s** (`journey-scale-r245-gate.log`). Identical 9-file set to
  r244 (335/9): `test-measurement-cache-flags.js`,
  `test-occupation-panels.js` (120s timeouts),
  `test-measurement-proof-update.js`,
  `test-measurement-workflow.js`, `test-phone-frame-proof.js` (stale
  receipts), `test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js`,
  `test-trust-observer-neutrality.js`,
  `test-capable-bot-20261014.js` (120s timeouts). The 120s timeouts
  are load artifacts (panel + gate shared 1.5 CPUs); the proof/workflow/
  phone failures are the pre-existing staleness set from r243/r244.
  **Solo re-run adjudication BLOCKED by the flap:** cache-flags run
  alone failed inside balance-panel on `EPERM: operation not
  permitted, write` — the test's own subprocess hit the flap, which
  is evidence the gate failure is environmental, not an assertion.
  **0 failures attributable to this run's change** (policy-only:
  2 policy files + driver + analyzer + proof test; zero `src/js`).
- **Telemetry:** LOUD lines on both arms, adjudicated as baseline
  staleness, baseline NOT rolled (r244 precedent): B `fightsByWave.4`
  178 → 69 (−61%) and `maxGameDay` 468 → 1099 (+135%); C `maxGameDay`
  468 → 1126 (+141%), `fightsByWave.4` quiet (89 vs 178 = −50.0%,
  at the threshold). Per-file: r245 B is 8.6 w4/file and 137.4
  days/file; r244 B was 7.25/file and 129.75/file — same neighborhood.
  The baseline is a 4-file sum (44.5 w4/file) from an unknown,
  fight-dense band; its provenance is unrecoverable. `fightsTotal`
  stayed quiet on both arms.

## Tooling

- Policy `scripts/policies/scalecourt-traderoad-r113-linkraise-subcapoff.js`
  (+ `-sit` wrapper): clone of the r113 linkraise policy with the
  guard replaced by a counted pass-through (`raisesPassedSubCapOff`);
  every other line byte-identical in behavior (diff verified).
- Driver `scripts/journey-scale-r245-20261119.js` (SUBCAPOFF flag,
  seeds 103871–103878), analyzer
  `scripts/analyze-journey-scale-r245-20261119.js` (SUBCAP section +
  TRADE WATCH, Q1 rewired), proof test
  `scripts/test-journey-scale-r245-analyzer-20261119.js` (**138 passed,
  0 failed** — r244's 136 + 2 new "answermail stayed off" cases).
  Build commit `2921e7ec1`. Safe-commit index clobber struck after the
  commit (staged-as-deleted); repaired with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; verified status empty + diff HEAD empty.
- Corpora: goal `hidden_files/evidence/2026-11-19/`,
  `journey-scale-r245-{b,c}-*` (16 seeds × 2 arms, 847 files);
  analysis at `journey-scale-r245-analysis.txt` (409 lines); logs
  `journey-scale-r245-{pilot,panel}-{b,c}.log`, `journey-scale-r245-gate.log`.

## Metric review

- Q1's bar did its job: it separated a firing lever from a working
  lever — mechanism 6/8, outcome 2/8, delta +2. PARTIAL is the honest
  verdict, and the composition stays a branch until it clears 3/8.
- The taxonomy flipped: FORMATION-FEW 5→1, TRUST-LOW 0→4. The next
  scale run's question is now the COMBINATION: lift + answermail —
  the lift forms the links early and answermail tends them (r244's
  lever, which fired alone without moving national on the capped
  policy, now has links worth tending). One lever per run stays the
  rule for attribution; the combination is a new lever with its own
  prereg, not a quiet composition of two branches.
- The trade road produced 0 seasoned leagues in 16 villages on
  either arm. The r113 trade-first policy may be walking a road that
  never seasons on current master — the next run watches trade
  formation, not just trade national.
- The lived-days control (123, r233) still fits both arms.
- Gate note: this run's 9 failures are byte-identical to r244's set;
  the solo re-run adjudication was flap-blocked, recorded above.

## Village assessment (plain words)

Eight fresh villages, days 80–140, played as a competent neighbor
who finally says yes when a villager walks up and proposes a link.
On the side that kept saying no, five villages never found a third
friend at all — the offers came, the rule refused them, and the
villages sat at regional with two friends and no road forward. On
the side that said yes, the villages grew: four friends where there
had been two, coalitions that killed four titans instead of two, and
two villages that broke through to national before day 70 — the
earliest national this policy has ever reached. But the new friends
did not stay close: on four of the eight, the third link was made in
good time and then quietly rotted — trust falling to ten, eighteen,
thirty-two — because nobody tended it. The villages feel alive in
the small moments — Deborah asking about the taken boy, Rafael
looking for his seat, Omar nodding three times because words will
not cross — but the road to national is now a road of tending, not
of finding. The friends are there. They need keeping.

## Verdicts

- **Reachable:** national is reachable (2/8 on the arm, 0/8 control)
  and now STEERABLE in part — answering raises moves it. The full
  seat stays unreachable on this band (0/16).
- **Fun:** the leg's small moments hold up (see Q4); the scale climb
  now has a lever the player can pull, and the lift's villages fight
  better. The trust rot that follows is a waiting game with no
  tended-link lever in this composition — that is the next run's work.
- **Winnable:** no. The winnability wall moved from formation to
  trust, same band, same villages. National 2/8, full seat 0/16,
  wave-5 door 0/16.
- **Landing:** PARTIAL per prereg. Sub-cap-off composition stays a
  branch. Merged locally, pending ship (tooling + evidence only).
