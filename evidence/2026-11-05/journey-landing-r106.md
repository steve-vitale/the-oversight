# journey-landing r106 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261105T1847Z (scheduled 12:45 CST 2026-11-05). Base
master@5ffbdaa1a at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-05/journey-landing-r106-prereg.md (committed
d28003c1f BEFORE any seed ran — pre-rebase b5e09c374; the safe-commit index
clobber struck on that commit, same class as r90/r94/r95/r97/r98/r99/r104/r105: commit correct,
index lied with the file staged-as-deleted + untracked; repaired via
HEAD-blob cacheinfo, verified `git status` clean + `git diff HEAD` empty +
hash-object matches).
Panel outputs: goal hidden_files evidence/2026-11-05/landing-r106/ (panel
censuses/system/transcripts + analysis + fights + pilot/panel logs +
checkquick log) and landing-r106-readonly887/ (the read-only control corpus:
r105 driver on seed 887).
Driver: scripts/journey-landing-r106-20261105.js (r105 driver verbatim +
R106-ARMS-WHY instrument, see Q1; seeds 887–896, DAYS=28; diff-verified
against the r105 driver at run start: only header, seeds, OUTDIR, and the
R106 blocks differ).
Analyzer: scripts/analyze-landing-r104-20261105.js (+ R106 precond reporting
+ R106-STARVATION-CLASS-F fix, see Blank below).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape test: scripts/test-landing-r94-shape.js (PASS). Goaround regression:
scripts/test-landing-r104-rescue-goaround.js (PASS on the r104 replay corpus).
Proof test: scripts/test-landing-r106-starvation-class-f.js (new, 6/6 PASS;
FAIL 3/6 on the pre-fix analyzer).
Next driver prepared here: scripts/journey-landing-r107-20261105.js (r106
verbatim + seeds 897–906, OUTDIR landing-r107; diff-verified, node --check
clean).

## Infrastructure notes (loud, first)
- **Pre-flight NOT clean — proceeded, loudly, with reason.** `git status
  --short` showed 1 untracked file:
  evidence/2026-11-05/sim-adoption-round-1715.md, left by the finished Loop
  A adoption run fleshout-20261105T1715Z (merged locally, pending ship; its
  own note says so). Per the workspace lesson (AGENTS.md: stopping for
  shared-tree dirt is over-conservative; a dirty shared index is normal
  sibling staging), an untracked sibling evidence file cannot be swept by
  private-index commits or an ff-only merge of this run's branch, so the run
  proceeded and the file was left untouched. The r100 Lane A run had already
  logged this exact file as "not mine, untouched". If the main agent wants
  the strict pre-flight restored, the file still sits there for its owner.
- **Registration was SLOW, not flap-blocked.** `worktree-register.sh`
  completed but the trailing `git status` hung >2 min (loaded box; git is
  very slow today — the 12:40 CST memory note records a 16-min status).
  Killed the hung tail after the worktree verified present at 5ffbdaa1a.
  Plain writes worked throughout; no retry needed. No main-tree file was
  edited, committed, or written by this run.
- **Heartbeat held:** registration beat 18:50:13Z, heartbeat loop (10-min
  interval, logged to goal hidden_files
  journey-landing-r106-heartbeat.log) ran for the whole run. Killed at
  closeout (see Closeout note).
- **EPERM flap:** NOT present this run (writes + git + registry all worked).
- **Reaper (pre-flight):** removed build-role-formation (heartbeat 4.0h
  stale; branch KEPT with 5 commits ahead of master — no work lost; that
  build's owner can re-register). Active 10/16 after. LOUD lines are other
  owners' dirty trees (journey2-succession, sim-exphurt-land-a,
  build-smallfixes, sim-gossipfix-a, journey2-social, build-departmeal) —
  never touched.

## Panel verdicts (as run)

- **Q1 WHY ARE THE WIN-PLAN ARMS SILENT: ANSWERED — STRUCTURALLY
  UNREACHABLE (M-A2) + GEAR STAGE TRANSIENT (M-A1).** The R106-ARMS-WHY
  instrument (read-only; proven so — see Shape below) snapshots each arm's
  preconditions at d14 and d28. Across all 20 snapshots: prims=0 on every
  seed (no own primary links — regional links have not formed), muster=false
  everywhere, beat4=false and beat5=false everywhere, wave4kills=0
  everywhere (maxWaveKill 1–3), tablePlans=0 everywhere. So bondTends,
  musterStanddowns, veteranGuardHolds, trickHolds and avoidances are
  STRUCTURALLY UNREACHABLE in the landing window — their preconditions
  reference wave-4 kills, the table stage, >=2 primary links, and the
  herald muster, none of which exist before day 28. That is a design
  answer, not a defect: the arms are built for later legs, and the silence
  across 30 seeds on three panels is the system working as staged.
  M-A1 (gear): gear-stage holders = [] on ALL 20 snapshots — no plan-holder
  sits in 'gear' at d14 or d28, and gearHolds=0 cumulative. The gear stage
  is transient in landing: plans seed into gear and advance to party (holders at
  d28 are 9 hunt + 6 party, 0 gear, 0 standing, 0 table — every seeded plan
  advanced out of gear and none reached standing). villagerGearUp
  arms and armors holders before the depart gate ever sees one unarmed AND
  unarmored. Snapshot-resolution caveat, recorded: a holder could sit in
  gear between snapshots — but the cumulative counter is the backstop (a
  depart tick catching one would bump gearHolds above 0; it never did).
  M-A3 (seek/standing): 1 wave>=3 scholar fight in the panel (890 d27 Ad
  Break, solo, allies 0 — see Notable events) and 1 wave-3 kill (896 d26
  Terms of Service, villager combat, killer unrecorded, no plan advanced
  to standing) — the seek/standing precondition (hunt/standing plan +
  party >=2 armed at a wave>=3 fight) never arose in the instrumented data.
  Panel totals d28: planSeeds=14 (4/10 seeds; d14: 6 on 3/10),
  partyInvites 9, departures 9, waits 101, partyFights 42, all other arms 0.
  M-S2 carried: 6/10 seeds never seed a plan by d28 (888, 889, 892, 893,
  894, 895) — no readable difference from the seeders in this run's data
  (all System day 8, pops 8–12, monster kills 14–42); the difference, if
  any, is in the plan-seeding conditions, not village health. Third panel
  in a row the uptake is uneven (r104: 5/10 at d14; r105: 2/10; r106: 3/10).
- **Q2 R104-GOAROUND AT PANEL SCALE: GOAROUND-HOLDS, RUNGS NOW FIRED.**
  M7-r106 kcal (arrived/skips): 4 arrivals / 4 skips = 100% >= the 80%
  bar. R85 RESCUE kcal: skips=4 complete=4. R86 CLEAR rung fires this
  panel (r105's gap is closed): first-travelTo 4, walkHome:reached 2,
  walkHome:stopped 1, clear:washed_out@5,4 1, walkHome-retry:reached 1;
  walkHomeStops=1, clearOk=1, clearRefused=0. The bridge/detour rungs are
  now proved at panel scale, not only on the r104 replay. R88
  EAT-ON-ARRIVAL: arrivals 4, ate 4/4.
- **Q3 DOORSTEP-OUTINGLIVE REGRESSION: GO.** 282 checks, 1 triggered
  (ate 1, drank 0, noGainEat 0, doorFromOutside 1, doorRefused 0). The
  branch is barely exercised this panel (r105: 2 triggered) but holds;
  the R105-DOORSTEP-DRINK-ENTRY fix is carried in the driver and the one
  triggered step ate. 0 class-E scholar starvation deaths (see Blank —
  the two starvation deaths on the panel were NPCs, now class F).
- **Q4 WATER CLAUSE: UNTESTED again** (18th run). 5 wild outing
  iterations, min hydration 72, 0 under 25, 0 wild water skips.
- **M1 ALIVE-D14: 10/10 PASS** (overAt None on all ten seeds; day-28 pops
  6–12; no village lost).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on all ten seeds).
- **M3 FIGHT-LOG: PASS** — panel 20 hunt fights, 20/20 complete, 2 fatal,
  fatalWithUnknownOrMixedTrigger=0. Three ZERO-DMG shape notes (not verdict
  items): d21 others-killed 0 strikes, d9 others-killed 0 strikes, d20
  others-killed 1 strike (all won by allies' damage).
- **M5 PEOPLE: PASS.** Wind-down more 8 picks, 0 empty; WD probe 10/11
  surfaced; betrayal held-offers 0 (16 offers, all spoken); party invites
  5 offered / 5 spoken / 0 dry / 0 accepted; case labeling 9/9. Two full
  transcripts read (888 day 6 Tashi, 889 day 6 Ines) — both contentful, no
  fabricated shared history (see People check).

## Village assessment (plain words)
Ten villages, all alive at day 28 (pop 6–12, down from 12). The first
fortnight is harsh but survivable everywhere except 891, which collapses
in the last week (see below). Deaths are monsters, sickness, wounds and
ambushes — plus two scholars lost in the wild (888 d9 to the Highbeam Deer,
890 d27 to a wave-3 Ad Break in a feast draw). No village lost. Pantries
mostly hold (d28 finals 800–46,915 kcal; self-sufficiency 0.68–0.97) except
891, which slides to 800. The System shows up on day 8 everywhere and the
villages answer it. Monster meat moves: the flesh channel opens on 10/10
seeds (arrival 10/10, tests 10, exits 8, stuck 2). Outings work sometimes:
R70 askSeeds 10/10, waitSeeds 4/10, departSeeds 6/10, keptSeeds 5/10,
keptTotal 7 — but on 6 seeds the scholar NEVER waits at dawn despite favors
existing (R70 watch, carried). Promised favors mostly break on 1-day
windows: 13 promised, all 13 NARROW, 7 kept inside narrow (R73
NARROW-PATTERN, design input, carried). Contests fired 19 times, 18 ended,
1 open at horizon, 0 orphan ends. The horizon-pantry pattern recurs:
7/10 seeds end hungry (R66 HUNGRY) — the landing pantry is a slow leak
everywhere, a collapse on one seed in ten.

## People check (SENSE-TESTING LAW — two full transcripts read)
- **888 day 6, Tashi (ask_favor, stage 1→3, promised, 21 turns):** Tashi
  wants wound care ("I can't reach this properly. Could you clean it out
  for me? Please."). The player commits; the favor is promised ("help
  Tashi with their injury"). The talk wanders — maps ("I've been all
  through here"), personal ("I keep a mental list of everyone who's still
  kind"), goal ("Every stranger on the road could know something. I ask.
  I always ask.") — and the unfinished thread stays visible in the menu
  ("We never finished — that wound care"). Wind-down resolves: "I ask
  every traveler. Every one. Someone has to have seen them." + "Come find
  me when you have a moment." / "They're smiling as you go. 'Come back
  anytime.'" Real. The beast-naming thread runs after ("Big Big",
  "The Loud Beast", "The Ugly Beast", "The Ugly Stare").
- **889 day 6, Ines (curious, stage 0→3, engaged, 14 turns):** Ines wants
  space, a corner nobody needs her in ("Can we talk? I need some space.
  A corner nobody needs me in. Is that okay?"). The player says yes; she
  thanks them. The talk moves through the quiet nights ("Like the world's
  holding its breath"), her past as a florist ("Being a florist taught me
  one useful thing: how to look busy while thinking"), maps, and ends in
  a real wind-down: "Weekends were for nothing. Glorious, deliberate
  nothing. I'd kill for a nothing-day." + "Good talk. I feel like I know
  you a little better now." / "This was good." Real.
- **Polish notes (carried, not defects):** [menu:more] paging yields
  THEM: (no line) turns (7+ in the Tashi conversation, 4 in the Ines one);
  the subject-switch deflection lines repeat verbatim ("Forget I said
  anything. What did you want?", "Sorry — I shouldn't load that on you.
  What's up?", "That's me, I guess. What's on your mind?" ×2 in Tashi);
  one small seam in Ines (answering "Yes" to the rhetorical "You ever
  notice how quiet it gets..." gets "I see. They take a moment to think
  about your answer." — handled gracefully, but the yes/no menu fits a
  rhetorical question awkwardly).

## BLANK FILLED — the starving villagers mislabeled as a doorstep failure (seed 891) + R106-STARVATION-CLASS-F fix
**The blank:** seed 891's village collapses in the last week — pantry
47,250 kcal on d1 sliding steadily to ~1,000 by d21, then 6 deaths
(Liam d8 sickness; Chloe d23 starvation; Xiaoli d24 starvation; Sofia d25,
Nia d26, Brooklyn d27 sickness; pop 12→6). The analyzer labeled both
starvation deaths CAUSE CLASS E ("at Haven, pantry held food — DOORSTEP"),
which reads as a doorstep failure: villagers starving next to reachable
food. That reading is wrong twice over. First, the "at Haven" is the
SCHOLAR's location (the autopsy trajectory, away streak, and zero-kcal
days are all scholar-scoped series data) — Chloe's and Xiaoli's own
locations were never recorded. Second, the pantry held 1,000–1,800 kcal
for 10–11 people — under a tenth of one day's need — while the scholar's
separate trust-scaled meal (villageMeal, drawn BEFORE the villagers eat
in endDay: game.js:32702 vs :32710) kept her fed at ~1,500 kcal. That is
famine with the player fed first, not a doorstep failure.
**The mechanism (probed, code-read):** the analyzer's A–E classes are
adjudicated entirely from scholar-scoped data, but the loop runs over
EVERY death with a starvation cause, scholar or not. The D/E fallback
reads the scholar's away streak and last snapshot location, and the
autopsy join reads the deceased's death-day pantry — so an NPC death
inherits the scholar's "at Haven" and a nonzero pantry and lands in E.
The R88 comment claiming non-scholar deaths carry no autopsy is stale:
the driver records an autopsy per starvation death, scholar or not.
**The fix (analyzer-only, zero src/js):** a starvation death whose who is
not the mantle holder on that day (via the existing scholarIdAt helper)
now classifies F — "NPC starvation — scholar-scoped series cannot
adjudicate the deceased's location or feeding; famine vs doorstep
undetermined" — and skips the scholar-scoped trajectory print. Scholar
deaths still classify A–E exactly as before.
**Proof (before/after, r106 corpus + synthetic scholar case):** BEFORE
(pre-fix analyzer): Chloe d23 = E, Xiaoli d24 = E. AFTER (fixed analyzer):
both = F; the full-panel analyzer re-run diffs ONLY on those two lines.
Proof test scripts/test-landing-r106-starvation-class-f.js: 6/6 PASS on
the fixed analyzer (NPC Chloe F, NPC Xiaoli F, no E in the NPC run,
synthetic scholar Layla still E); FAIL 3/6 on the pre-fix analyzer (both
NPC deaths E). The STARVATION verdict (every death assigned a cause
class) still holds — F is a class, honestly labeled.
**Held, not fixed (design question for Steve, not a unilateral change):**
the scholar eats FIRST (villageMeal before villageEats in endDay) while
the code comment says "You're one of the 12". Whether the player should
eat in roster order like everyone else — and starve first in a famine —
is a design call with balance consequences across every landing run; this
run documents it and does not change it.
**Instrument question, open:** the death-day pantry reads 1,800 (autopsy
live sum) vs 1,000 (series pantryKcal) on d23 — two measures of the same
pantry disagree by 800 kcal. Either number supports "running on fumes";
the discrepancy itself is unadjudicated.

## Notable events (not defects)
- **891 famine collapse (above):** the panel's harshest village — pantry
  47,250→800 over 28 days, 6 deaths in the last week, self-sufficiency
  0.683, plenty-voice 13 (vs ~54 on healthy seeds), grief beats 6.
- **890 d27: a wave-3 monster in the landing window, scholar killed.** Ray
  faced the Ad Break (355 HP) via a feast-draw face (pending-face), solo,
  allies 0: 5 strikes, 29 damage dealt, 20 monster turns, 73 taken, HP
  97→-4, hydration 8, kcal 1040. The fight was complete and fairly lost.
  Tuning note, not a bug: the feast draw can face the scholar against
  wave 3 on day 27 (second panel in a row — r105 had the same shape at
  d27 with The Terms of Service).
- **888 d9: scholar killed by the Highbeam Deer.** Mario, monster-approach
  trigger: 4 strikes, 114 damage dealt, 9 monster turns, 84 taken, HP
  93→-55. Complete and fairly lost.
- **896 d26: a wave-3 kill by villagers.** Terms of Service killed in
  villager combat (killer unrecorded); no plan advanced to standing, so
  the killer held no hunt/party-stage plan. The village's wave-3 kills
  happen without the win-plan system noticing — consistent with Q1.
- **R69 ARMOR tele/line disagree (carried):** teleOk counts vs narration
  lines disagree on 7 seeds (e.g. craftTele 1ok/1fail vs craftLines
  1ok/12fail; 0ok/1fail vs 0ok/7fail). Investigate before trusting either
  — carried from r96, not re-litigated here.
- **R70 never-waited at dawn (carried friction, threshold met):** 6 seeds
  where favors exist but the scholar NEVER waits at dawn; dominant reasons
  are the door-side mismatch ("Move next to your partner, on the same
  side of the Haven door" / "Your partner is inside the Haven hall. Go
  through the door to meet them."). The prereg watch threshold (>=3 seeds)
  is met — named as a carried friction for a future run, not fixed here.
- **R71 together-blocked:** 9 blocks, all "You carry 0 kcal; your partner
  carries 0 kcal. You have nothing from this outing" — empty-handed
  outings that never had food to haul.
- **R68 party invites:** 5 offered / 5 spoken / 0 dry / 0 accepted — every
  taken invite outcome spoke, but none was accepted this panel (r105: 4/9
  accepted). Worth watching, not a verdict item.

## Reachable / fun / winnable
- **Reachable:** yes — all content in the leg fired (System contact 10/10,
  contests 19 fired / 18 ended, flesh channel opens 10/10, outings
  complete, win-plans seed in the first fortnight on 3/10 seeds by d14,
  4/10 by d28).
- **Fun:** yes — conversations read like people talking (Tashi's wound and
  her list of the still-kind; Ines's nothing-days), the beast-naming
  thread is alive across villages, and the villages feel busy rather than
  mechanical. The 891 collapse is grim but legible — a famine you can
  watch coming for twenty days.
- **Winnable:** not yet — unchanged. The win-plan system's party/hunt arms
  run hard in the first fortnight, but its gear-check, bond-tending,
  avoidance, and standing-contact arms are now PROVED structurally
  unreachable before day 28 (not merely silent) — the levers that would
  move the early funnel toward a geared party cannot fire in the landing
  window by construction. That is the answer to r105's question, and it
  reframes the winnability work: the early funnel moves on party/hunt
  arms alone, or the arms' stages must become reachable earlier — a
  design question, not a measurement gap.

## Metric review
- M-A1 (gear): the metric worked as written, and the observed state was
  stronger than its "armed-or-armored" bar — zero gear-stage holders at
  any snapshot. No revision proposed, but the next landing run should
  note the snapshot-resolution caveat in its prereg (a holder could sit
  in gear between snapshots; the cumulative gearHolds counter is the
  backstop).
- M-A2 (structural): worked as written — STRUCTURALLY-UNREACHABLE is the
  finding, not a metric failure. No revision proposed. The metric retires
  with this run: re-running it on later landing panels would only re-prove
  the same staging. A future run should ask the design question instead
  (should the arms' stages be reachable before day 28?).
- M-A3 (seek/standing): worked as written — the precondition never arose
  in the instrumented (scholar-fight) data. One gap in the metric: the
  896 villager wave-3 kill was unadjudicated for plan/party state (killer
  unrecorded). A future run that wants M-A3 airtight should instrument
  the killer on villager field kills.
- M7 revised (arrived/skips): worked as written (4/4). The r104 revision
  is validated again — keep judging arrivals, not ladder completion. The
  rung fires are now proved at panel scale; the metric can retire the
  rung-fire watch or keep it as a regression line.
- M-S2 (never-seeding seeds): 6 named (888, 889, 892, 893, 894, 895). No
  readable difference found — same standing note as r105.
- M6 / doorstep: the class-F fix changes labeling, not verdicts — the "0
  class-E scholar starvation deaths" clause was already 0, and stays 0
  with the honest label. No metric change.

## Telemetry deviation check
Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r106 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as
r94/r95/r96/r97/r98/r99/r104/r105), baseline NOT rolled: (1) systemDay
baseline 33 → current sum 80 over 10 files (per-seed 8, mean 8.0);
(2) monsterKills baseline pooled mean 24 → current sum 233 over 10 files
(per-seed mean 23.3, range 14–42). No behavior change is indicated.

## Mid-run standing-context update (recorded, not acted on)
- **Steve's XP/ABILITIES+GEAR direction (2026-11-05 07:09 CST):** the
  queued build (XP coverage + synergy bonus + gear protection retune) may
  change what gear means in the landing window before r107 runs. Read
  M-A1 alongside it: the gear-stage transience finding is about the
  win-plan gear-check arm never firing, not about gear bars. No verdict in
  this run changes; no work in this run touches that build.

## Closeout note
- Commit: prereg + R106 instrument (d28003c1f) + class-F fix/proof
  (82b4d4276) + this note + r107 driver (4fba2d57d) — pre-rebase hashes
  b5e09c374 / b58b88ab1 / b9b0e72cc. The fix is instrument-only —
  no [needs-eyes] flag (nothing player-facing changed; the ship loop need
  not fast-track).
- Rebase: Loop B landed first (tbretreat NO-GO revert, master 7f7475f59),
  so the branch rebased onto the new master before merging — zero file
  overlap; the rebase hit the known 2nd-pick sequencer stop (pick in both
  done and todo lists, worktree clean, pick unapplied) and recovered with
  `git rebase --continue` per the recorded recipe; all proof tests re-run
  green on the rebased branch (class-F 6/6, shape PASS, goaround PASS).
  Merged locally as ff-only (see below), pending ship.
- Quick suite: `node scripts/check.js --quick` — 284 passed, 6 failed in
  538s (landing-r106-checkquick.log). The 6 are EXACTLY r104's standing
  set (measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes); none
  touches this run's files (zero src/js changed; the analyzer, new test,
  and drivers are not on the check list). No load-artifact failures this
  run (r105 had 5) — a cleaner result than r105. No regression from this run.
- Telemetry: LOUD explained, baseline NOT rolled.
- Rotation 0→1 already written. Lock deleted at closeout after
  read-back of its run_id.
