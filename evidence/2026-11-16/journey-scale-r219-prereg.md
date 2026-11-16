# journey-scale r219 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp + sortie arm on current master)

**Run id:** `playtest-loop-a-scale-r219-20261116T0245Z` (lock run_id
`2026-11-16T02:34:45Z`).
**Run:** scheduled Sun 2026-11-15 19:45 CST (2026-11-16 01:45 UTC); lock
created 02:34:45Z (run started late — 02:34Z).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `4c30c022a` at worktree registration.
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 40%, lock absent (no stale-lock recovery), `git pull` already up
to date at 4c30c022a. Reap: ran clean (11/16 active; dirty trees left
alone per reaper rules). Worktree `journey-scale` registered ~02:47Z
(registration took ~11 min — the box is heavily loaded, load avg 14;
the `git reset --hard` checkout crawled); heartbeat landed 02:47:12Z,
hbloop `~/workspace/worktrees/journey-scale-hbloop-r219.sh` (10-min
cadence) launched 02:47Z.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master AND answers the one blank r215 owed (W5-INSTANCE)
with a sortie-taking arm — a policy-side driver step, no game change.

## Standing context (read before scoring)

- **r215 scale (landed 2026-11-15, master abc52dce1):** national 0/4 on
  fresh seeds 135605–135608; survived **2/4** (135605, 135607 alive d141;
  135606 over d131, 135608 over d109); regional 4/4; lived-days 522 vs
  3-band rolling mean 478 (+9.2%, HOLD); lesser seat priced 4/4; **tribute
  DELIVERED 2/4** (135605 d117, 135607 d100 — first deliveries on this
  leg, payable at ready on both); blocker on both survivors: LEAD 2/3
  seasoned — one more seasoned link short. Wave-5 fights 1 in the whole
  band, yet 135607 had up to **10 live wave-5 entities a day for 37
  days** and fought none; 135605's Editor lived at the treeline 38 days.
  The game offers the sortie and the policy never takes it.
  Spotter blank FILLED (d90 reads live on 4/4 seeds). Curious-resume
  stutter fixed (conversation.js, proof 17/17). Vetbar GO (0
  disagreements). Nod-loop HOLD (worst 3x). Trap-line HOLD. Betrayal
  HOLD. Spoken-raise GO (3 answered, 1 correct hold). Telemetry QUIET
  (w4 183 vs 178 baseline); baseline stands.
- **What changed in the game since r215's base (7ab6e2546 → 4c30c022a):**
  net `src/js` diff is **dialogue-only** (4 files, +109/−13): the r215
  stutter fix itself, landing r137 want-thread resume (a deflected
  question is re-posed — dialogue), succession r218 commit-refusal
  noBeat (refusal lines never become thread memory), crisis r216
  funeral-mend partial-payment honest line (hierarchy.js — the trust
  claim follows the actual gain), plus the build-version stamp. The two
  lever arms that landed in between were both reverted with no trace:
  sim-producergate-b (NO-GO, reverted) and sim-producerparty-b (NO-GO,
  reverted). **No mechanical/survival change since r215's base** — arm A
  is a direct continuation read of the same game r215 measured, and any
  arm-A/arm-B difference is attributable to the sortie step alone.
- **The wall (tracker, scale-onramp):** national 0/24 on the judged
  corpora; the binding gap is veterans / seasoned links, not survival
  (r215: 2/4 survived, tribute paid twice, still LEAD 2/3). The wave-5
  door is the other open question: entities linger for weeks, are never
  fought, and the one-vs-successive shape is unanswered.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG, COVENANT,
  TRADE, CONQUEST, or REFUSE. Ladder stage 3 (points) is NOT national.
  Q1 measures the polity (natgate `nat=true`), ladder stage secondary.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger scatter;
  sickness-without-a-healer collapse; "left someone behind" /
  "Okay. You don't have to have an answer." line-pool reuse; raise-talk
  closers formulaic ("All right — let's ask them." echo); flag-emoji
  openers in -nv sittings; "Don't tell the others. Everyone needs one
  place." thinking-spot line; nonverbal closing pool thin; "The ease
  drains out of it, a little." reuse; herald linger / wave-4 variety
  collapse (herald kills now land; the linger side did not).

## The blank to fill this run (r215-owed): W5-INSTANCE, via a sortie arm

r215's metric review proposed it plainly: "a sortie-taking policy
variant so the Editor gets fought, or the question moves to a panel that
fights wave 5 deliberately." This run is the variant. The sortie step is
**driver-local, policy-side, no src/js change**: after the base daily, on
arm B only, when lingerers are present the driver runs the lingerfinish
Step 1 gates verbatim from `scripts/policies/partyfinish.js` (the
sim-partyfinish-a sortie-only driver, 2026-10-28) — sanctity (not over,
no active fight, no pending encounter, no table active, scholar awake),
at most once per 6 game days, min lingering HP ≤ 80, sum lingering HP
≤ 300, ≥2 healthy villagers at home, pantry ≥ 12,000 kcal — and calls
`Game.answerLingerer('sortie')`. Every gate outcome is recorded
(`sortieWatch`: day, seen count, held reason or sortie call + result).
Arm A runs the identical driver with the step inert, on the SAME seeds —
a paired/matched comparison, so any arm difference is the sortie step
alone. The analyzer's W5-INSTANCE section reads both arms: wave-5
fights/kills per arm, fight-instance grouping by lingerKey, and the
hp-trajectory verdict per seed (ONE / SUCCESSIVE / MIXED / UNANSWERED).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master, per arm

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=true` in the natgate file) per arm,
and when they don't, what is the single binding constraint per seed —
the closest road (LEAD/COVENANT/TRADE seasoned counts), what it lacks,
the pending shape, the belong good flag, or collapse before the national
window? SECONDARY: does fighting wave 5 (arm B) move survival, the
tribute, or the national picture vs arm A on the same seeds?

**Interesting-finding rule (binding):** the run is informative iff EITHER
≥1/8 seeds reach national (GO — the on-ramp is open on current master,
the wall moved) OR 0/8 AND the analyzer names a per-seed blocker for
every seed (NO-GO on the wall, blocker named — the finding IS the
blocker). 0/8 with no diagnosable constraint (e.g. all seeds die before
d60 with no links at all) = INCOMPLETE — document and move on, do not
re-score the panel against a friendlier metric. The arm-B question is
informative iff arm B fights ≥1 wave-5 lingerer (the sortie step fires
and a wave-5 fight happens) OR arm B records 0 sortie calls with a named
held reason on every lingerer day (the gates, not the policy, are the
blocker — that names the next fix).

**What would overturn the picture:** ≥2/8 national, or a full seat, or a
seed whose blocker is a named defect with a narrow fix (that becomes the
run's blank — fix + proof, or document in sim-findings.md). A wave-5
KILL on arm B overturns the r207/r215 "fought, never killed" shape.
A survival split ≥2 seeds between arms on matched seeds names the
sortie step as survival-relevant (paired attribution, not a gate
verdict).

## Q2 — REGRESSION GUARDS (fail the run if any breaches; per arm)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered per arm (the analyzer's classifier; exit 2 if an arm has no
  raise talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5, per arm.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0),
  per arm.
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines, per arm.
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting.
- Lived-days within ±25% of the **3-band rolling mean 513**
  ((r206 555 + r207 461 + r215 522)/3 = 512.67 → 513; guardrail 385–641)
  — **rolled forward one band from r215's 478, recorded here before the
  panel runs** (the rolling window moves with the bands; r215's 522
  replaces r204's 419 in the window). Per arm. No alive/dead flip
  without an attributed cause.
- Lesser seat priced ≥3/4 per arm.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events). Expected 0 daily accepts — the gap, confirmed.
Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks (both arms; arm B's sortie sittings are new
material — do the sortie's own engine lines read, and do villagers
react like people to a mustered fight?). Bar: senseless 0 for the
raise-answer class (a spoken raise answered with the words that fit
what was said; no English YOU lines in a no-words sitting; no nod loops
past the answer). Re-check surfaces: the r214 plain parting, the r211
quote fixes, the r209 deferred-ask ledger guard + favor-block noBeat,
the r208 lapsed-want thread, the r137 want-thread resume (a deflected
question re-posed — does it read as a person returning to something, or
as a loop?), the r218 commit-refusal noBeat, the r216 funeral-mend
partial line (does the honest claim read?). **Stutter watch:** any
seed-opener line of the shape "About X — <the same X as a question>"
is a live recurrence of the Rufina stutter — record it with the want +
seedNote.

## Q5 — CENSUS (plain words, per arm)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close). Spotter read: villagers
with foodXp.spotter > 0 / spotter skill ≥ 1 per seed — d90 FIRST (the
binding read), end second. Funeral-mend watch: any funeral/mourning shape
change vs r215's band. **W5-INSTANCE read (per arm):** per seed, the
wave-5 shape (ONE / SUCCESSIVE / MIXED / UNANSWERED) with the
hp-trajectory evidence behind it, plus sortieWatch counts (linger days
seen, sorties called, held reasons, wave-5 fights and kills).

## Panel

- **Seeds: FRESH 135609–135612** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak). **Paired:** the
  same 4 seeds run under arm A (control) and arm B (sortie) — 8 sims.
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204/r206/r207/r215) — NO chooser
  change in this run beyond the r207 secret:* ENGAGE addition (kept).
  Arm B adds ONLY the driver-local sortie step (gates above).
- **Driver:** `scripts/journey-scale-r219-20261116.js` (r215 driver cloned:
  labels/EVIDIR/seed list/arm tags only + sortie step + sortieWatch).
- **Analyzer:** `scripts/analyze-journey-scale-r219-20261116.js` (r215
  analyzer cloned + lived-days control re-based to the 3-band rolling
  mean 513 + arm tags + SORTIE + W5-INSTANCE-per-arm sections).
- **Proof:** `scripts/test-journey-scale-r219-analyzer-20261116.js` — the
  real analyzer on synthetic corpora (r215's 60 assertions + new cases:
  (24) arm-B sortie rows counted, arm-A sortie rows absent; (25) w5
  ONE via same lingerKey fought twice with falling HP; (26) w5
  SUCCESSIVE via fresh full-HP spawns; (27) control 513 named).
  **70/70 green before the panel runs.**
- **Pilot:** seed 135609, both arms first. Pilot gates: crash, census
  errors > 0, 0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict). Pilot ALSO
  gates the new instrument: on arm B, a lingerer day with neither a
  sortie call nor a held-reason row → STOP and diagnose the instrument
  (the panel must not run blind on the blank it owes).

## Seed freshness

135609–135612: 0 hits naming the band in any dated prereg
(`grep -rlE '135609|135610|135611|135612' evidence/ --include='*prereg*'`,
all dates, run 2026-11-16 in the worktree) and 0 hits in any .md note
under evidence/ (`grep -rlE '135609|135610|135611|135612' evidence/
--include='*.md'`). Forbidden-band lists naming 13560x/13561x: none (the
lists found name 73641–73648, 73671–73678, 871xx —
sim-scale-onramp-round-0615.md:123). Recent preregs use only 135601–
135608 (r207/r215's bands). Fresh band confirmed before the panel runs.
No game fixture seed is needed this run (the analyzer proof uses
synthetic corpora, no staged game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker, per arm; guard-attribution read as a secondary; arm-B
  informative rule as written).
- Q2: the guards as written (lived-days control rolled forward to the
  3-band mean 513 — the roll itself is this run's metric change,
  recorded here before the panel ran, per the rolling-mean practice;
  nod-loop guard carried).
- Q3/Q4/Q5: as written. Spotter: d90 read is the binding read (second
  live band). W5-INSTANCE: now answered per arm by the sortie variant.
- Telemetry: scale.json baseline is the r204 3-band roll (241/178/468);
  r215 was QUIET (w4 183 vs 178); evaluate after this panel, per arm.

## CLOSEOUT — run 2026-11-16T0245Z (this run)

[TO FILL AT CLOSEOUT]
