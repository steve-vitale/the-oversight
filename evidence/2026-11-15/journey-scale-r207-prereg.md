# journey-scale r207 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r207-20261115T1100Z` (lock run_id
`oversight-playtest-loop-2026-11-15T04:53Z`).
**Run:** scheduled Sun 2026-11-15 04:45 CST (2026-11-15 10:45 UTC); lock
created 10:53:53Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `9fa74d252` at worktree registration.
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 38%, lock absent (no stale-lock recovery). `git pull`: already up
to date at 9fa74d252. Reap: ran clean (11/16 active, no journey-scale
tree; 4 dirty trees left alone per reaper rules). Worktree
`journey-scale` registered ~10:57Z (registration took ~3 min — the box
is slow this morning; heartbeat landed 11:00:36Z, hbloop
`~/workspace/worktrees/journey-scale-hbloop-r207.sh` 10-min cadence,
pid 30383).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master after a day of landings (see below), and fills
the two blanks r206 owed this run (secret:* picker + spotter snapshot —
both driver/instrument, no game change).

## Standing context (read before scoring)

- **r206 scale (landed 2026-11-15, master 7ba58d326):** national 0/4 on
  fresh seeds 135501–135504; survived 2/4 (up from r204's 1/4); regional
  4/4; lived-days 555 vs r204 band 419 (+32.5%, **BREACH** — long side,
  NO-GO per §14, not re-scored); lesser seat priced 4/4; **wave-5 fights
  5, kills 2** (first wave-5 kills on the scale leg since r197 — both by
  the scholar's party in the field); tribute **DELIVERED d108** on
  135503 (first delivery since r197; ready-but-unpayable lasted exactly
  one day, resolved by a second veteran arriving) and READY-UNPAYABLE
  on 135502/135504. Nod-loop re-proven (worst 3x, 7/7 sittings — the
  thin-out's signature). Telemetry: 2 LOUD lines (fightsTotal +66%, w4
  +86%); investigated (band composition + herald flood, no combat code
  changed); **baseline NOT rolled** (4-band sequence r196 215, r197 370,
  r204 137, r206 400 shows the metric is noise-dominated on 4-seed
  panels). Gate 337/3 GO after adjudication (0 attributable).
- **What changed in the game since r206's base (7ba58d326 → 9fa74d252):**
  four src/js landings, none touching combat initiation or the
  hierarchy/scale pricing:
  - sim-funeral-mend-b (52a84cd46): **funeral mend in hierarchy.js**
    (FUNERALMEND default ON) + proof 7/7. Hierarchy-scoped; could touch
    village morale/death handling — the census watches for a shape
    change, the panel does not judge it.
  - journey succession r209 (af56c7b4f): **deferred-ask ledger guard +
    favor-block noBeat** (r202 fixes, proofs green). Conversation-scoped;
    the people check may read it.
  - journey-landing r129 (413252eb4): **terrain-pocket fix**
    (findWalkableEntry main-region + stacked-spawn) + D1 menu label.
    Spawn-scoped; the scale leg's field fights may read it.
  - journey-crisis r208 (783487438): **lapsed want thread names the
    current favor, not the stale one** [needs-eyes]. Dialogue-scoped.
  - The rest is evidence/scripts-only (establishment r210 spotter-in-
    the-wild GO, deepening r212, transplant 6b/7b, cascade/gap3 DIAGs,
    proof refresh round 20).
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  every judged corpus this week, survived 1–2/8, regional 8/8, national
  0/8, table 0/8, wins 0/8, wave-5 1–2/8, median ~134–139d. The binding
  constraint is still trust held above 40 for a season — the two living
  r206 villages held ZERO seasoned links on any road. This run plays the
  scheduled scale leg; its panel is a fresh-band wall reading, not a
  bisect step.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG (valued
  subordinate in a ≥4-village realm), COVENANT (≥3 seasoned peer links),
  TRADE (≥3 seasoned trade links), CONQUEST, or REFUSE. Ladder stage 3
  (National Standing, points) is NOT national (polity rank) — the r134
  panel reached stage 3 on points while staying regional. Q1 measures the
  polity (natgate `nat=true`), with ladder stage as the secondary read.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger scatter
  2 bands running (r197/r204, none r206); sickness-without-a-healer
  collapse (none r206 — healerDays 133–140 on all 4); "left someone
  behind" / "Okay. You don't have to have an answer." line-pool reuse
  (fifth band running); raise-talk closers formulaic ("All right — let's
  ask them." echo ×6); flag-emoji openers systematic in all -nv sittings;
  just_company filler loop (Ray d90 r206); **herald linger / wave-4
  variety collapse** (167 + 96 fights, 1 kill each — spawn/encounter
  question, carried); 135504 belong arrears 67,500 in 11 days
  (tribute-arrears math worth a look); OVE-48 revert-vs-keep DECIDED
  KEEP (Nov 14 0215Z); culpritbisect narrowed 15A–15F (tracker blanks —
  bisect steps, not a journey leg).

## The blanks to fill this run (both r206-owed, driver/instrument only)

**1. secret:* picker handling.** r206's Omar d120 sitting: the NPC
confides a secret ("I'm saving a candy bar for when things get better.
I haven't told anyone.") and the driver walks away, because the picker
has NO secret:* handling — `secret:promise` / `secret:comfort` /
`secret:offer` (conversation.js:5109–5111) are real choices the picker
never takes. The fix is driver-only: add the three kind secret choices
to ENGAGE (after `dlg:empathize`, before the nv block) so a competent
player answers a confidence instead of leaving on it. No game change;
the transcript is the proof (a secret sitting that ends with a promise
or comfort instead of a walk-away).

**2. Spotter foodXp snapshot.** r206's Q5 spotter line was NOT
MEASURABLE — the r139 wiring grants spotter XP silently and no
instrument snapshots foodXp. The fix is driver-only: census() gains a
`spotterWatch` field — the r210 end-only foodXp snapshot pattern
(live getPerson first, wrapper second; read-only), per roster villager:
name, alive, foodXp.spotter, spotter skill via specialistSkill. The
analyzer gains a SPOTTER census section (measurement only, never a
gate): how many villagers hold foodXp.spotter > 0 / spotter skill ≥ 1
per seed. Proof cases (18)–(19) cover a snapshot with spotters and a
missing snapshot.

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
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting.
- Lived-days within ±25% of the **3-band rolling mean 500**
  ((r197 526 + r204 419 + r206 555)/3 = 500; guardrail 375–625) —
  **adopted this run from r206's metric-review proposal, recorded here
  before the panel ran** (the single-band control is too volatile: 460 →
  526 → 419 → 555 across four bands; ±25% bands barely overlap, and a
  longer-lived band should not fail the same way a collapse-heavy band
  passes). No alive/dead flip without an attributed cause.
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
in a no-words sitting; no nod loops past the answer). NEW surfaces this
run: the secret:* picker change — any secret sitting in the band must end
with a promise/comfort/offer, not a walk-away; the r209 deferred-ask
ledger guard + favor-block noBeat — any favor-blocked sitting must read
coherently; the r208 lapsed-want thread — a lapsed want must name the
current favor. The r132 nod-loop thinning and the r201 favor-want settle
gate are re-checked, not re-litigated as defects.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close). Spotter read: villagers
with foodXp.spotter > 0 / spotter skill ≥ 1 per seed (the r139 wiring's
first live read on the scale leg — a census line, not a bar). Funeral-mend
watch: any funeral/mourning shape change vs r206's band (deaths by cause
+ mourning beats in the capture).

## Panel

- **Seeds: FRESH 135601–135604** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204/r206) — NO chooser change in this
  run beyond the secret:* ENGAGE addition (Q4 surface, driver-only).
- **Driver:** `scripts/journey-scale-r207-20261115.js` (r206 driver cloned:
  labels/EVIDIR/seed list only + secret:* ENGAGE + spotterWatch in census()).
- **Analyzer:** `scripts/analyze-journey-scale-r207-20261115.js` (r206
  analyzer cloned + lived-days control re-based to the 3-band rolling
  mean 500 + NEW spotter census section, measurement only).
- **Proof:** `scripts/test-journey-scale-r207-analyzer-20261115.js` — the
  real analyzer on synthetic corpora (r206's 43 assertions + new spotter
  cases: (18) snapshot with 2 spotters → counted; (19) snapshot missing
  → "unavailable", no fail). Green before the panel runs.
- **Pilot:** seed 135601 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135601–135604: 0 hits naming the band in any dated prereg
(`grep -rlE '13560[1-4]' evidence/ --include='*prereg*'`, run
2026-11-15 in the worktree; also 0 hits in all of evidence/).
No forbidden-band or contaminated-band list exists in evidence/ naming
this band. Fresh band confirmed before the panel runs. No game fixture
seed is needed this run (the analyzer proof uses synthetic corpora, no
staged game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker).
- Q2: the guards as written (lived-days control re-based to the 3-band
  rolling mean 500 — the re-base itself is this run's metric change,
  recorded here before the panel ran, per r206's proposal; nod-loop guard
  carried).
- Q3/Q4/Q5: as written. Spotter: NEW census section — first live read of
  the r139 wiring on the scale leg.
- Telemetry: scale.json baseline is the r204 3-band roll (241/178/468);
  r206's 2 LOUD lines stand as band noise until this band judges the
  center — evaluate after this panel.

## CLOSEOUT — run 2026-11-15T1100Z (this run)

[To fill at closeout: panel table, Q1–Q5 verdicts, telemetry, gate/landing.]
