# journey-landing r151 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-a-20261121T0414Z (scheduled Fri 2026-11-20 21:45 CST;
started 22:14 CST — scheduler fired late; the run's own clock is 04:14Z).
**Base:** local master `36d694f13` (verified up to date at start; main tree
clean, disk 48%).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch
`journey-landing`). Registered 04:18–04:25Z (registration queued ~7.7 min
behind the registry lock; live sibling registrations hold it — NOT stale).
HEAD `36d694f13`, clean. Registry heartbeat at registration
2026-11-21T04:25:19Z. Standing hbloop (pid 31762, setsid-detached, every
5 min, `timeout 120` per beat, `rc=$?` captured before `$(date)` — r150
logging fix).
**Lock:** `playtest-loop.lock`, run_id `playtest-loop-a-20261121T0414Z`,
created 2026-11-21T04:14:36Z. None present at start. Delete at closeout in
the same call as its read, only if run_id matches.
**Flap:** flap-watch ALL-OK at 04:16:23Z (load ~15, memav ~5.4G). Machine
restarted ~03:20Z (`uptime` 56 min at 04:16Z, boot ac0f701d). No flap at
run start.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1322–1331**. Grep over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md` for
`132[2-9]|133[01]` plus the range string `1322-1321|1322–1321`; every
hit's context read:
- `1322–1331` as a range: zero hits.
- `132[2-9]|133[01]` hits: run IDs (`1331Z`, `1330Z`), a duration
  (`1328s`, r135 gate), commit-hash fragments (`0aa413222`), line refs
  (`~l1328`, `~l1346`), and 5-digit seeds (`13067`, `13268`, `13276`,
  `13300–13359`, sim-lackingline-b). None names seeds 1322–1331 as a band.
- REJECTED first choice **1292–1301**: `1301` is named in the contaminated
  band 1301–1304 (r107 prereg; repeated in the contaminated-band lists of
  r108–r119 preregs/notes). `1292`–`1300` individually are incidental only
  (`+1292%` in r126, `game.js:12928` line ref). The 10-seed band is
  unusable because it contains 1301.
- REJECTED second choice **1312–1321**: the rejected fallback range
  1304–1313 is named in the r107 prereg ("Fallback checked and REJECTED:
  1304–1313 contaminated"), which reserves 1312–1313. Other hits are run
  IDs (`1315Z`).
- Used landing bands (r150 prereg): 1282–1291 (r150), 1272–1281 (r149),
  1262–1271 (r148), 1252–1261 (r147), 1242–1251 (r146), 1232–1241 (r145),
  1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140),
  1162–1171 (r139), 1142–1151 (r121–r138, deliberate reuse), 1122–1131
  (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906
  (contaminated), 887–896, 867–876, 857–866, 847–856, 837–846, 817–826,
  797–806, 777–786. Band 1322–1331 is fresh.

## Q1 (PRIMARY) — regression watch on the post-r150 master, fresh band

Since r150's base (`9b14b0b93`), `src/js/` changed in 7 files
(`git diff 9b14b0b93..36d694f13 -- src/js/`, +476/−19) — landing-domain
changes in the watch:

- `convo-dialogue.js` +36 — **r150 Fix** (a11df1fac): first heed of a
  warn_you want speaks the warning. AFTER measurement (r150 matched
  re-panel): 4/4 heed sittings name the danger. This run re-verifies on
  a fresh band: every heed sitting must name the danger.
- `bond-initiation.js` +69 — **scale r248 raise-opener variety by
  lore-how** (36d694f13, [needs-eyes]): link-raise openers vary by the
  villager's lore-how. AFTER measurement on the scale band: opener
  variety raised (proof test-convo-raise-opener-variety-r248). Watch on
  the landing band: no link-raise opener repeats verbatim in the panel.
- `convo-dialogue.js` (also) — **crisis r261 dodge-the-the fix**
  (144049840, articlePhrase, proof 7/7): "the the" article doubling
  removed. Watch: grep the panel transcripts for "the the"
  (case-insensitive); any hit is a Q1 investigation item.
- `game.js` +312 — **ammo/lend/fiber substrate** (sim-ammo-a,
  sim-lendfix-a, sim-fiberfetch-a): AMMO lever + FIBERFETCH lever
  REVERTED; DEPMAT/ROLL35/AMMO substrate rebuilt, GUNRATE + CELLGATE +
  LEND env-gated OFF by default (13a0c5ed2). No live behavior change
  expected on the landing band; the standing ammo-name watch (every
  volley "has no X" line names the weapon's actual ammo) is the
  regression check.
- `game.js` (also) — **succession r258 self-witness fix in ambush
  path** (ef5e65cb1): witness attribution in ambushes. Watch: any
  ambush-path mourning/witness line that names no one is a Q1
  investigation item.
- `build.js` — version-bump artifact only.

**Q1a — INSTRUMENT (r150 metric-review item 10, carried):** the
`worktree-heartbeat.sh` flock question — the script uses bare
`flock -x 200` with no timeout (read this run: `scripts/worktree-heartbeat.sh`),
so a beat blocks indefinitely on a held registry lock (r149's ~19-min
hang is the evidence). The coordinator-side mitigation (`timeout 120`
in the hbloop) is in place. This run proves the point with a direct
lock-contention test (hold REGISTRY.lock ~30s in the background, run
the script WITHOUT timeout, observe the block; then the same with
`flock -w 120` semantics) and, if the test shows the script blocks
past a sane bound, lands the `flock -w` change in the shared script
with a proof test — or documents why not. The test holds the lock
~30s only; siblings' heartbeats queue behind it briefly, as they do
under normal contention.

**Q1b — WARN_YOU DEFLECT SHAPE (r149 item, carried r150 — this run's
Q2 focus, fourth carry):** r148: the warning never names the danger.
r149: 1278 d11 Lucas, the warning never surfaces at all (want ends
stage 3, resolution=unestablished). r150: 1284 d8 Leonard, same shape
on BOTH panels (deflect at turn 0, `[alive:want:warn_you]` offered at
turn 2 and walked past, ends stage 3/unresolved). The r150 warn-heed
fix closed the heed path; the deflect path is still open. If a
warn_you sitting fires on this panel, read it in full for whether the
danger is named AND whether it surfaces at all. If the nit reproduces,
it is this run's blank candidate: pin the mechanism in the want code
(`convo-wants.js` engageBeat / menuOptions stage gating) and fix with
a proof test if a minimal, safe fix exists (e.g. the pending warning
re-asserts at wind-down when never delivered) — else document and
carry with the design decision named (how forcefully a pending
warning re-asserts itself after the player changes the subject).

**Interesting if:** any r150 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots or
repeats its opener verbatim; a scholar ends stranded homeward for 2+ days;
a favor with a live need is answered settled; a trail-talk / Wren line
repeats verbatim in one sitting; a second scholar death pattern (deaths >
2); revised M-PR1 > 15%; statedAfterPick ≥ 6; hungry-at-horizon moves from
5/10 either way; any village starts a win-plan inside 28d; a parting-hit
death; a trio party forms inside 28d; a dry `...` line on any turn; a
COUNTER LEARNED line naming a prose-clause descriptor; a confide exit with
no secret shared; a volley line naming the wrong ammo; a mourning beat that
names no one or reads as template filler; a dead-react loop (reactDryCount
gate not holding in live play); a link-accept pool[0] repeat streak; a
doubled 'The' in an outing line; a "the the" article doubling anywhere in
the panel transcripts (r261 regression watch); a 4-person launch or
bow-staged volley (report as lever behavior, not a defect); a settled-favor
help topic that names no favor or speaks a bare kind id; a warn_you sitting
where the danger is never named or never surfaces; an all-fights
refused-turns count > 0 with the binding zero-DMG count at 0 (the Spool
shape recurring); a truly-silent (non-deduped) refused move; a warn_you
deflect sitting that re-surfaces the warning (new behavior — report it).

**Bars (bind, r150 bars carried):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG: **refused-turns 0 BINDS** (v4, zero-DMG fights); stood-through-by-choice
  reported only; raw zero-DMG + B-shape reported as watch.
- Refused-turns all-fights (v4): reported as watch; any count > 0
  is a Q1 investigation item (the Spool shape).
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised per r143 metric review item 1): never-offered among
  established ask_favor sittings ≤15%, where "established" excludes
  `resolution=unestablished` sittings regardless of final stage; raw
  analyzer rate + max per-seed never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
  Goal bridge: 0 repeats in a sitting (r149 fix regression watch).
- Presshop farUnreached REPORTED only.
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- **Scholar deaths: ≤2 per 10-seed panel** (fairness adjudication
  recorded alongside; see r150 Q1a). Report count, day, cause,
  succession latency per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- **Dry-line watch: 0 dry (empty-content) lines in the panel's transcripts.**
  Any dry line is a Q1 failure on live data.
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- **Homeward watch (r240 fix):** report end-stranded days per seed; any
  scholar stranded homeward 2+ days is a Q1 investigation item.
- **Door-flee watch (Q1a r146):** 0 fights ending 'fled' where the scholar's
  last step was onto a door tile; the zero-DMG/B-shape analyzer plus the
  fight-log `player-move` entries adjudicate.
- **Link-accept watch (r243 fix):** every accepted link-raise talk ends
  with a voiced accept line (never the player's choice label verbatim).
  Variety reported (pool[0] vs pool[1] split); a 22/1-style repeat streak
  is a Q1 failure on live data (r148 fix regression).
- **Link-opener watch (r248 fix, NEW):** no link-raise opener repeats
  verbatim in the panel; report the opener variety observed.
- **Counter-label watch (r246 fix):** every COUNTER LEARNED line on the
  panel uses the guarded label (no prose-clause descriptor as a name).
- **Confide watch (r244 F8):** no "This stays between us, right? Right."
  closing a sitting where no secret was shared.
- **Ammo-name watch (#2593):** every volley "has no X" line names the
  weapon's actual ammo.
- **React wind-down watch (r246 fix):** no sitting where `dlg:react` is
  offered at reactDryCount ≥ 2; no verbatim-repeat react loop. Any such
  sitting is a Q1 failure on live data.
- **Settled-help watch (r247 fix):** every settled-favor help topic
  names the favor's short; a bare kind id spoken is a Q1 failure.
- **Deduped-vs-silent watch (r150 instrument):** the r150 move-refusals
  split is reported; a truly-silent refused move (not deduped) is a Q1
  investigation item.
- **Warn-heed watch (r150 fix):** every warn_you sitting where the
  player heeds must name the danger (r150 AFTER: 4/4). A heed sitting
  that ends without the danger named is a Q1 failure on live data.
- Pilot first: seeds 1322–1325; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the panel. Bar: each sitting shows the NPC
wanting something, options engaging or deflecting it, endings resolving /
planting / owing. No fabricated shared history, no filler loops, no static
menus. Include a mourning sitting if the panel produces one (r232 watch —
read it for the name worn, the template spread, and the witness-variant
shape). Include a favor/repay sitting if one fires (639bd3f41 watch — the
live need stated, never the settled line). Include a flee fight transcript
if one fires (FLEEREPAIR3 watch — the leave reads as a person leaving,
not a stat). Include a warn_you sitting if the panel produces one — read
it for whether the danger is named AND whether it surfaces at all (Q1b).
Include a resume-take sitting if the panel produces one (Q1 watch) and read
it for the re-pose AND for any drift-note tail quoted as memory. Include a
C3d recap sitting if one fires (recap naming the live want with an empty
thread log). Include a fight transcript with a second ally if one fires —
read it for whether the ally's presence reads as a person joining, not a
stat appearing. Include an accepted link-raise talk if one fires — read it
for the voiced accept line and which pool line served (r243 watch + r148
variety fix) AND its opener (r248 watch). Include a compare_maps sitting if
one fires with 3+ compares — read it for the new pool lines (Q1a
re-verify). Include a confide-exit sitting if one fires — read it for
whether a secret was actually shared. Include a settled-favor help sitting
if one fires — read it for whether the favor is named (r247 watch).

## Q3 — Telemetry

`telemetry-check.js` on the panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q4 — Gate

`node scripts/check.js --quick` in the worktree
(`--cacheDirectory=/tmp/jest-cache-playtest`); adjudicate every failure
against pristine HEAD. 0 attributable is the bar. Never run concurrent jest
with a sibling gate (phantom-failure rule — wait if one is running).

## Policies / seeds

- Landing panel: seeds 1322–1331, 28d, r151 driver
  (scripts/journey-landing-r151-20261121.js — r150 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r151-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-21/`). ABSOLUTE OUTDIR (r149 footgun: a
  relative OUTDIR lands the corpus under the worktree CWD). DAYS=28
  passed explicitly (r149 footgun: driver defaults to DAYS=14; check
  max series day == 28 before trusting a panel).
- Analyzers: the 15 standing analyzers (r144/r145 order) via
  `evidence/2026-11-21/journey-landing-r151-analyzers.sh`, with the
  zerodmg analyzer at v4 and the move-refusals analyzer at the r150
  split version.
- No threshold, bar, price, or gate changes in this run except the
  r248 link-opener watch and the r150 warn-heed watch above. If the
  panel surfaces a further game defect, fix in the worktree with a
  proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — goal-pool fixed in
  r149; Olivia bridge repeat remains in the bridge-memory build arm
  with its own panel; NOT this run. Did not recur on r142–r150.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels, r145 1/10, r146 5/10, r147 4/10, r148 4/10,
  r149 3/10, r150 5/10 both panels.
- Stated same-day need with no commit path (r141 F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented for
  Steve/design call, not fixed here. Did not recur on r142–r150.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d. (r142 reads H1 — same rung, no
  assignments at all; see r142 F3.)
- Lead-in nit (r139–r150): topic answers repeat their lead-in within a
  sitting. Observation only; worth a look when the bridge pool gets its
  per-sitting memory.
- R66 margin question (r142 F1): a scholar at home with a full pantry
  lived hand-to-mouth for three weeks and died on a 934-kcal nightly
  deficit. Balance/policy arm question — meal share vs daily burn for a
  Haven-bound scholar, and whether the competent policy should bank food
  during the day. Not this run.
- R240 homeward shape (seed 101401): the fix is IN this run's base;
  the watch above is the regression check, not a carry.
- Accept-line pool variety (r243 metric review item 2): the r243 fix's
  pool has 2 lines per `how`, but the scale band showed the same line
  9/9 — every fresh run opens with the same first pick. The ledger
  rotation is proven by the unit test; cross-run variety is unproven.
  Watch on this panel: if an accepted link-raise talk fires, record
  which line served. (r148 fixed the in-run rotation; cross-run first
  pick is still the same line.)
- R150 infrastructure (carried): registration queue (~5–8 min under
  load, REGISTRY.lock held by other loops' reaps/heartbeats); `git
  worktree add` ~3–6 min under load; write-flap windows strike
  mid-checkout. The standing heartbeat loop is the mitigation; the
  flap-watch log is the witness.
- R150 carried design questions (unchanged): (a) the deflect shape
  (this run's Q1b); (b) opener-composition prefixes that mismatch the
  opener ("I'm not sure, but Listen."; "Here's what I think — Don't
  mind me."); (c) the personal-question dodge (Caleb's potluck joke
  leaves the personal thread nowhere to go); (d) settled-help (r247
  fix) and confide exits still untested on the 28d landing band (0
  occurrences on r150); (e) S-shape fight tactical question (scholar
  keeps striking an out-of-reach flying monster — what should the
  player do instead; design question, not a defect).
