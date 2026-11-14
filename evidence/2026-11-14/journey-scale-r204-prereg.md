# journey-scale r204 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r204-20261114T174308Z` (lock run_id
`playtest-loop-a-scale-r204-20261114T174308Z`).
**Run:** scheduled Sat 2026-11-14 10:45 CST (2026-11-14 16:45 UTC); lock
created 17:43:08Z, rewritten to r204 at 17:49:46Z (started ~58 min late —
scheduler/queue delay + a VM/runtime restart mid-registration, not a run
decision).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `dcae77800` (Version bump 976b161b5-20261114-173741,
batch ship) at worktree registration.
**Pre-flight:** main tree clean BY TARGETED EVIDENCE — a full `git status
--short` timed out 3× under box load 8–17 (280s, 240s, 880s attempts; a
sibling ship-loop status ran 9+ min in the same window). The first read
(17:38:01Z) showed exactly 4 modified files — the ship-loop version-bump
set (index.html, src/js/build.js, sw.js, version.json) — committed
17:38:22Z as dcae77800; after that commit all four hash-identical to HEAD
(`git hash-object` vs `git rev-parse HEAD:<path>`), `git diff --cached`
empty (nothing staged), `git ls-files --others` empty (no untracked
files), and no process wrote to the main tree in the window except the
ship loop's safe-commit (the `git reset --hard` in the window ran inside
a sibling worktree, verified via /proc cwd). A 580s background status
timed out as well (4th consecutive full-status timeout under load);
merge is gated on a clean status or the same targeted evidence holding. Disk 37%, lock absent (no stale-lock
recovery). `git pull` at 17:49Z: already up to date at dcae77800. Reap:
SKIP — registry lock held by a live sibling registration
(sim-transplant15e-p12-a, holding REGISTRY.lock through its slow
checkout); consecutive skips: 3 (ALERT — holder identified, legitimate,
not stuck; no cleanup this run, nothing removed).
**Worktree:** `journey-scale` — the first registration was interrupted
by a VM/runtime restart mid-checkout (~17:59Z; branch existed at
dcae77800, partial dir with only `evidence/`, no registry entry, not in
`git worktree list`); recovered by deleting the branch + partial dir and
re-registering under the same slug. Re-registration queued behind two
sibling registrations, completed 18:13:57Z (~12 min; registry run_id
2026-11-14T18:06:25+00:00, heartbeat_at 18:06:25Z). The manual
re-heartbeat queued behind the same registry lock and landed late (see
run note); hbloop
`~/workspace/worktrees/journey-scale-hbloop-r204.sh` (10-min cadence,
re-check the loop PROCESS at each phase — r197's first loop died
silently mid-run).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master after a day of landings (see below). It does not
re-prove the veteran census or the survival collapse (the bisect owns
that) — but the panel's wall reading IS a fresh-band check on the collapse
shape, and a moved wall would be the run's headline.

## Standing context (read before scoring)

- **r197 scale (landed 2026-11-14, this morning):** national 0/4 on fresh
  seeds 135301–135304; 3/4 survived; lived-days 526 vs r196 band 460
  (+14.3%, HOLD); lesser seat priced 4/4; **wave-5 fights 8 on 2/4 seeds,
  5 kills** — the door opened for the first time on the scale leg in
  recent bands (135304: 7 fights, 4 kills; 135302: 1 fight, 1 kill);
  tribute DELIVERED (135302 military_tribute d96, 1/1 attempts); one
  hunger-driven scatter (135304 d104, pantry empty 3 days, 11 alive when
  they walked). The wall is trust-hold, not link count — two living
  villages sat one seasoned link short of the LEAD road (LEAD 2/3).
  Telemetry QUIET (fightsTotal -17.0%, w4 +6.6%, maxGameDay -18.6% vs
  scale.json baseline; baseline NOT rolled — re-base owed, evaluated
  after this panel).
- **What changed in the game since r197's base (b81fde1c5 → dcae77800):**
  three src/js landings, all dialogue/fusion-scoped, none touching
  combat initiation or the hierarchy/scale systems:
  - journey-landing r132 (3bffd4752, [needs-eyes]): **nod-loop fix** —
    a repeated identical nv: react gesture thins the sitting (proof
    13/13; pilot 3/3 loops -> 0/3). Directly answers r197's carried
    observation (Mariko 4× nv:nod, third band running). This run
    re-proves it on the scale leg (new Q2 guard + analyzer instrument).
  - journey-crisis r201 (f1871e37b, [needs-eyes]): **favor-want settle
    gate** — a favor want is settled only when the favor itself is done
    (fulfilled/thanked); a promise is not a settlement. Touches the
    ask_favor close-line behavior r197's people check read (favor
    surfaces on the want thread, not the goal thread). This run reads it
    in live sittings (Q4).
  - sim-fusionoffer-b (afa416371): fusion offer defers while a sheet is
    pending; prize bag gates fusion_reactor on pellet possession
    (proof 16/16). Pellet/fusion-scoped; noted, not this leg's question.
  - The rest of the delta is evidence/scripts-only (journey-deepening
    r192 run note + instruments, journey succession r202 instrument-only,
    journey-establishment r138 driver-only wedge fix, proofrefresh-b17
    regenerated neutral panel, transplant 15A/15C/15E/15F evidence-only
    arms, version bump). Proof refresh b17 landed — the r197 gate's
    measurement-proof staleness pair should be gone this run; the gate
    log will confirm.
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  every judged corpus this week, survived 1–2/8, regional 8/8, national
  0/8, table 0/8, wins 0/8, wave-5 1–2/8, median ~134–139d. The collapse
  cause is localized to merge e4dbe581b (CULPRIT_MERGE); the inside-the-
  merge bisect narrowed to 39 revisions — narrowed 15A–15F arms are the
  tracker's next blanks, NOT this run's job. This run plays the scheduled
  scale leg; its panel is a fresh-band wall reading, not a bisect step.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG (valued
  subordinate in a ≥4-village realm), COVENANT (≥3 seasoned peer links),
  TRADE (≥3 seasoned trade links), CONQUEST, or REFUSE. Ladder stage 3
  (National Standing, points) is NOT national (polity rank) — the r134
  panel reached stage 3 on points while staying regional. Q1 measures the
  polity (natgate `nat=true`), with ladder stage as the secondary read.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; ask_favor
  goal-thread non-voicing (r201 gate may change the close line — read,
  don't re-litigate); Omar 3-day repeat raise with no shared words;
  first-memory + "left someone behind" line-pool reuse across villagers;
  raise-talk closers formulaic; post-delivery phantom persistence
  (shadow counter tracks kill history); telemetry fightsTotal baseline
  re-base (owed — evaluate after this panel); culpritbisect narrowed
  15A–15F (tracker blanks — bisect steps, not a journey leg).

## The blank to fill this run (r197 follow-ups, owed)

**Re-prove the r132 nod-loop fix on the scale leg + read the r201
favor-want settle gate in live sittings.** Mariko's 4× nv:nod was the
third band running with a nod loop (Herve 5× r196, Xue 3×, Mariko 4×);
r132 landed a fix claiming loops → 0. This run adds a nod-streak
instrument to the analyzer (max consecutive identical nv: react
gestures per sitting) and a Q2 guard, and reads any gesture-repeating
sitting in full for the thinning behavior. The r201 gate gets a Q4 read:
any favor-want sitting's close line must not declare the favor settled
on a promise or an unrelated beat. A narrow dialogue defect found here
gets a fix + proof test; a clean re-proof gets documented and the
carried items close.

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=true` in the natgate file), and when they
don't, what is the single binding constraint per seed — the closest road
(LEAD/COVENANT/TRADE seasoned counts), what it lacks, the pending shape,
the belong good flag, or collapse before the national window?

**Interesting-finding rule (binding):** the run is informative iff EITHER
≥1/4 seeds reach national (GO — the on-ramp is open on current master, the
wall moved) OR 0/4 AND the analyzer names a per-seed blocker for every
seed (NO-GO on the wall, blocker named — the finding IS the blocker). 0/4
with no diagnosable constraint (e.g. all seeds die before d60 with no links
at all) = INCOMPLETE — document and move on, do not re-score the panel
against a friendlier metric.

**What would overturn the picture:** ≥2/4 national, or a full seat, or a
seed whose blocker is a named defect with a narrow fix (that becomes the
run's blank — fix + proof, or document in sim-findings.md).

## Q2 — REGRESSION GUARDS (fail the run if any breaches)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered (the analyzer's classifier; exit 2 if the band has no raise
  talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0).
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines.
- **Nod-loop (NEW, r132 re-proof): 0 sittings with a streak of ≥4
  consecutive identical nv: react gestures (nod/smile/pointself,
  excluding nv:listen, which progresses); max streak reported per
  sitting. The r132 fix arms the thin-out after the 2nd identical
  gesture, so a 4-streak is the old loop shape.**
- Lived-days within ±25% of the **r197 band's 526** (re-based from r196's
  460 — most recent same-instrument band; guardrail 395–658); no
  alive/dead flip without an attributed cause.
- Lesser seat priced ≥3/4.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events). Expected 0 daily accepts — the gap, confirmed.
Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks. Bar: senseless 0 for the raise-answer class (a spoken
raise answered with the words that fit what was said; no English YOU lines
in a no-words sitting; no nod loops past the answer). The generic-question
"And?"/"Yeah?" filler repeats (r195 observation) and the raise-talk vs
transcript attribution split (file-level) are re-checked, not re-litigated
as defects. NEW surfaces this run: the r132 nod-loop thinning (a sitting
that repeats a gesture must thin and end naturally after the 2nd
identical gesture — read any gesture-repeating sitting for the winddown)
and the r201 favor-want settle gate (a favor-want sitting's close line
must not declare the favor settled on a promise or an unrelated beat).

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close).

## Panel

- **Seeds: FRESH 135401–135404** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197) — NO chooser change in this run (Q3 is read-only).
- **Driver:** `scripts/journey-scale-r204-20261114.js` (r197 driver cloned:
  labels/EVIDIR/seed list only; r197 picker, full-opening-transcript log,
  nonverbal sitting on CONVO_DAYS, vetbar recorder kept).
- **Analyzer:** `scripts/analyze-journey-scale-r204-20261114.js` (r197
  analyzer cloned + lived-days control re-based to the r197 band's 526 +
  NEW nod-streak section: max consecutive identical nv: react gestures
  per sitting, guard ≥4).
- **Proof:** `scripts/test-journey-scale-r204-analyzer-20261114.js` — the
  real analyzer on synthetic corpora (r197's 29 assertions + new nod
  cases: 4× nv:nod in one sitting -> guard BREACH; 2× nv:nod -> exit 0;
  nv:listen repeats excluded). Green before the panel runs.
- **Pilot:** seed 135401 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135401–135404: 0 hits naming the band in any dated prereg
(`grep -rlE '13540[1-4]' evidence/ --include='*prereg*'`, run
2026-11-14 in the main tree after the restart recovery). No
forbidden-band or contaminated-band list exists in evidence/ naming this
band. Fresh band confirmed before the panel runs. No game fixture seed is
needed this run (the analyzer proof uses synthetic corpora, no staged
game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker).
- Q2: the guards as written (lived-days control re-based r196 460 → r197
  526 — the re-base itself is this run's metric change, recorded here
  before the panel ran; nod-loop guard NEW — the r132 fix's claim, added
  here before the panel ran).
- Q3/Q4/Q5: as written.
- Telemetry: fightsTotal baseline re-base owed — evaluate after this
  panel (see run note §Telemetry).

## CLOSEOUT — run 2026-11-14T174308Z (this run)

**Panel (seeds 135401–135404, DAYCAP=140):** 135401 alive d141 (8/8,
regional, lesser d47, tribute ready d90 undelivered 0/51);
135402 over d109 (5/5, lesser d58, sickness 6, no healer all run);
135403 over d102 (5/5, lesser d40, 60 fights, tribute ready d72
undelivered 0/27); 135404 over d67 (SCATTERED from hunger, 10 alive
when they walked). Lived-days 419 vs r197 band 526 (-20.3%, HOLD).
Lesser 4/4. Books close, unattributed 0, teleOnly 0. Wave-5 fights 5,
kills 0.

**Q1 — NO-GO on the wall, blocker named per seed (informative):** national
0/4. 135401: LEAD 2/3 (needs 1 more seasoned). 135402: COLLAPSE
(sickness, healer-less). 135403: COLLAPSE (the wild). 135404: COLLAPSE
(hunger scatter d67). Wall stands on a fresh band; survival fell to 1/4.
The binding constraint is still trust held above 40 for a season.

**Q2 — all GO/HOLD (exit 0):** raise 3 talks (2 answered, 1 counter, 0
defects); vetbar 0 disagreements; trap HOLD (Elif d90-nv mime shown +
answered — r133 fix re-proven); betrayal HOLD (1 turn-0 offer,
labeled); **nod-loop HOLD (worst 3x — the r132 thin-out visible in the
transcript; the old 4–5x shape is gone)**; lived-days HOLD; lesser 4/4.

**Q3 — RECORDED:** daily-play mimes 9, daily accepts proven 0; Elif
(Turkish-only, trust 89) mime shown + nv:accept taken in the driver
sitting. Lane decision still owed.

**Q4 — PASS:** all d90/d120 transcripts + all 3 raise talks read in full.
Senseless 0. Strongest: Oliver on Ruth (d120), Isaac's control-group
theory. Observations: "left someone behind" line-pool reuse (fourth
band); formulaic raise closers; Elif flag-emoji opener; "And... scene.
Good talk." closer. New surfaces (r132 thinning, r201 settle gate) both
read correctly in live sittings.

**Q5 — census in the run note** (`evidence/2026-11-14/journey-scale-r204.md`).

**The blank filled:** r132 nod-loop fix re-proven on the scale leg
(worst 3x, mechanism visible) + r201 favor-want gate read (no defect).
Tribute 0/51 + 0/27 diagnosed as the known M23 shape (readiness counts
the scholar, delivery needs 2 payable veterans; payable=1 held for 51
and 27 days) — documented, metric revision still owed.

**Telemetry:** 2 LOUD lines vs the old baseline (fightsTotal -69%, w4
-75%); investigated (no combat code changed; band composition +
collapse shape); **baseline ROLLED to 3-band means 241/178/468**
(backup scale.json.20261114-pre-r204.bak); re-check: w4 -60% still LOUD
(marginal).

**Verdicts:** reachable YES, fun YES, winnable NO (this leg).

**Gate / landing:** see the run note's Gate/landing section (filled at
closeout). Full record: `evidence/2026-11-14/journey-scale-r204.md`.
Corpus: `hidden_files/evidence/2026-11-14/journey-scale-r204-*` (goal
store).
