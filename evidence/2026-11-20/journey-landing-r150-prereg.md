# journey-landing r150 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-20261120T1441Z (scheduled Fri 2026-11-20 13:45 CST;
started 14:41 CST — scheduler fired late; the run's own clock is 20:41Z).
**Base:** local master `9b14b0b93` (sim-dmgcheck-b evidence; `git pull`
already up to date at run start).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
Rotation-file history (read-back note): the r149 adoption addendum claims
0→1 was written by the r150 occurrence, but the file read `0` at this run's
start — explained, not a miss: scale r247 (leg 3, commit `b6a551691`
20:35Z) wrote 3→0 at its closeout (mtime 20:38:52Z), so 0 is the correct
next leg after scale. Establishment r245 jumped the queue earlier today
for the same rotation reason; see its note.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Registered 20:44Z (registration queued ~4.7 min behind the registry lock;
live sibling registrations/heartbeats hold it — NOT stale). Registry
heartbeat at registration 20:44:42Z. Standing hbloop every 5 min
(`journey-landing-r150-hbloop.sh`, setsid-detached, `timeout 120` per
beat so a flock stall fails loud and retries — r149's ~19-min silent
flock hang is the shape being guarded against).
Lock: none present at run start; fresh lock created 2026-11-20T20:41:34Z
(run_id playtest-20261120T1441Z). Pre-flight: main tree clean, disk 51%,
`worktree-reap.sh` SKIPPED (registry lock held, 6 consecutive skips —
holder is live sibling activity: a reaper run + registrations, verified
via fuser/ps, not a stale lock; the reaper will get its turn).
**Flap:** flap-watch ALL-OK at 20:43Z (load ~7–12, memav ~6.2G). No flap
at run start.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1282–1291**. Grep over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md` for
`1282` and for `128[3-9]|129[01]`, plus a range-string grep
(`1282-1291`) over the same subsets; every hit's context read:
- `1282`: commit-hash fragments only (`0a1282119` in sim-funeral-mend-b
  / sim-holdbuild-b preregs; a hash on sim-bisect-mergebase-a:7).
- `1283–1291`: sim-findings line 1283 (sim-outflowzero-b); suburb id
  1285 / HP 1285 (sim-draftflag-a, sim-removal-a, sim-sameday-a,
  sim-stalkertick-a, sim-uidmatcher-a); pantry-kcal list "1167: 1284"
  (journey-landing-r139.md); commit-hash fragment `72512906f`
  (sim-heraldcontact-a, sim-mustercall-b); 11xxx seed lists
  (sim-nighttravel-verdict-adopt-b).
- Range string `1282-1291`: zero hits.
No landing run note or sim prereg names seeds 1282–1291 as a band.
Used landing bands (r149 prereg): 1272–1281 (r149), 1262–1271 (r148),
1252–1261 (r147), 1242–1251 (r146), 1232–1241 (r145), 1222–1231 (r144),
1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140),
1162–1171 (r139), 1142–1151 (r121–r138, deliberate reuse), 1122–1131
(r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906
(contaminated), 887–896, 867–876, 857–866, 847–856, 837–846, 817–826,
797–806, 777–786. Band 1282–1291 is fresh.

## Q1 (PRIMARY) — regression watch on the post-r149 master, fresh band, + r149 metric-review instrument adoptions

Since r149's base (`6b8051ec2`), `src/js/` changed in 4 files
(`git diff 6b8051ec2..9b14b0b93 -- src/js/`, +53/−4) — landing-domain
changes in the watch (r149's own fixes are the AFTER state of r149 and
are the baseline here, not new changes):

- `convo-beats.js` +15 / `scripts/policies/competent.js` +50 — **r149
  Fix 1+2+3** (0d38a74d1): dodge reachability pre-check + R140 budget
  stop; closeStep + beastStrikeTarget null-path skip; goal bridge pool
  2→6. AFTER measurement on live play (r149 matched re-panel):
  refusedTurns 33→0, goal repeats 1→0, failed moves 48→0, timeline
  otherwise identical. This run re-verifies on a fresh band: refused
  turns must stay 0 and no goal-pool repeat may fire.
- `conversation.js` +23 — **social r256 gossip-ask dry-line fix**
  (ed19c3d57, Arm C). AFTER measurement: panel F6 0 dry GO (on the
  social band). Watch on the landing band: 0 dry lines (standing bar).
- `convo-dialogue.js` +17 — **scale r247 settled-help names the favor**
  (b6a551691): a settled favor's help topic now says "It's already
  handled — {short}. Thank you for asking." instead of the bare line,
  falling back to bare only when there is no speakable short (a bare
  kind id must never be spoken — the r16 stale-opener rule). AFTER
  measurement on live play (r247, day-120 evidence): the favor is named.
  Watch on the landing band: any settled-favor help topic names the
  favor's short; a bare kind id spoken is a Q1 failure on live data.
- `build.js` — version-bump artifact only. sim-evade-a lever code is
  flag-gated default-off and reverted; no live behavior change.

**Q1a — INSTRUMENT ADOPTIONS (r149 metric-review items 2 + 5, this
run's instrument change — built and proof-tested BEFORE the panel):**
- **v4 zerodmg analyzer** (copy of v3, `scripts/analyze-landing-r150-zerodmg-v4.js`):
  adds a panel-wide `refusedTurnsAllFights` line — the same
  refusedTurnsOf count across ALL fights, not just zero-DMG ones —
  reported as WATCH alongside the binding zero-DMG count. The r149
  Spool fight's 14 refused approach steps hid behind a damage-dealing
  scholar; the all-fights line closes that hiding place. Binding bar
  unchanged: zero-DMG refusedTurns 0. Back-compat, proved before the
  panel: r149 BEFORE corpus (landing-r149-after) binding 33,
  all-fights 48 (33 dodge + 14 Spool approach + 1 Highbeam Deer
  1275 d14), nonZeroDmgWithRefusals 2; r149 AFTER corpus
  (landing-r149-after-fix) binding 0, all-fights 0.
- **r150 move-refusals analyzer** (copy of r128,
  `scripts/analyze-landing-r150-move-refusals.js`): splits the
  `silent-noline` bucket into `deduped-refusal` (the previous fightLog
  entry's first line is itself a refusal-pattern line — the engine's
  consecutive-duplicate dedup said it once and refused to repeat it)
  vs `silent-noline` (truly silent: no line and no preceding refusal
  line). The r149 note established 29 of 33 failed moves in the 1277
  fight were dedup, not silence; the split stops the next run
  re-litigating it. Back-compat, proved before the panel: r149 BEFORE
  corpus — the 1277 d21 fight's 29 silent moves classify as
  deduped-refusal; r149 AFTER corpus — 0 failed moves, no change.
- **Scholar-deaths bar (r149 metric-review item 3):** bar kept at ≤2,
  but the fairness adjudication is recorded alongside it in the run
  note — a miss on fair deaths is a note, not a defect, and does not
  by itself block a landing that fixes the binding defect.

**Q1b — WARN_YOU CONTENT NIT (r148 item 10, carried r149 — this run's
Q2 focus, third carry):** r148: the 1262 d12 warning never names the
danger. r149: worse — 1278 d11 Lucas, the warning never surfaces at
all (want ends stage 3, resolution=unestablished, no danger named).
If a warn_you sitting fires on this panel, read it in full for
whether the danger is named AND whether it surfaces at all. If the
nit reproduces, it is this run's blank candidate (dialogue-arm
territory — fix with a proof test if the mechanism pins in the want
code, else document and carry; the fix needs a design decision about
how forcefully a pending warning shapes the opener, per r149).

**Interesting if:** any r149 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots;
a scholar ends stranded homeward for 2+ days; a favor with a live need
is answered settled; a trail-talk / Wren line repeats verbatim in one
sitting; a second scholar death pattern (deaths > 2); revised M-PR1 >
15%; statedAfterPick ≥ 6; hungry-at-horizon moves from 3/10 either way;
any village starts a win-plan inside 28d; a parting-hit death; a trio
party forms inside 28d; a dry `...` line on any turn; a COUNTER LEARNED
line naming a prose-clause descriptor; a confide exit with no secret
shared; a volley line naming the wrong ammo; a mourning beat that names
no one or reads as template filler; a dead-react loop (reactDryCount
gate not holding in live play); a link-accept pool[0] repeat streak;
a doubled 'The' in an outing line; a 4-person launch or bow-staged
volley (report as lever behavior, not a defect); a settled-favor help
topic that names no favor or speaks a bare kind id; a warn_you sitting
where the danger is never named or never surfaces; an all-fights
refused-turns count > 0 with the binding zero-DMG count at 0 (the
Spool shape recurring); a truly-silent (non-deduped) refused move.

**Bars (bind, r149 bars carried, with the two instrument changes above):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG: **refused-turns 0 BINDS** (v4, zero-DMG fights); stood-through-by-choice
  reported only; raw zero-DMG + B-shape reported as watch.
- Refused-turns all-fights (v4, NEW): reported as watch; any count > 0
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
  recorded alongside; see Q1a). Report count, day, cause,
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
- **Counter-label watch (r246 fix):** every COUNTER LEARNED line on the
  panel uses the guarded label (no prose-clause descriptor as a name).
- **Confide watch (r244 F8):** no "This stays between us, right? Right."
  closing a sitting where no secret was shared.
- **Ammo-name watch (#2593):** every volley "has no X" line names the
  weapon's actual ammo.
- **React wind-down watch (r246 fix):** no sitting where `dlg:react` is
  offered at reactDryCount ≥ 2; no verbatim-repeat react loop. Any such
  sitting is a Q1 failure on live data.
- **Settled-help watch (r247 fix, NEW):** every settled-favor help topic
  names the favor's short; a bare kind id spoken is a Q1 failure.
- **Deduped-vs-silent watch (r150 instrument, NEW):** the r150
  move-refusals split is reported; a truly-silent refused move (not
  deduped) is a Q1 investigation item.
- Pilot first: seeds 1282–1285; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Metric-review adoptions from r149

1. **B-shape split — KEPT.** refused-turns binds at 0; stood-through-by-choice
   reported only. r149 proved it: the B-shape fight's 33 refused turns
   bound the run NO-GO, the split kept the honest "stood through it"
   shape visible without punishing it.
2. **silent-noline relabel — ADOPTED (Q1a above).** Split into
   deduped-refusal vs truly-silent in the r150 move-refusals analyzer.
3. **Scholar-deaths bar — KEPT with fairness adjudication (Q1a above).**
   A miss on fair deaths is a note, not a defect.
4. **Goal-pool repeat is the last of its class — CLOSED.** Personal,
   want, small and goal are all 6+ lines. Remaining 2-line pools (grief,
   cheer, past, village, plans, gossip) serve 0–1× per 100 sittings —
   no evidence of repeats; leave them until evidence shows one.
5. **refused-turns all-fights line — ADOPTED (Q1a above).** v4 reports
   the all-fights count alongside the binding zero-DMG count.
6. **Outing-chain contradiction — RESOLVED (r149).** The 14-day artifact
   was a truncated series; on the true 28-day panel the chain completes.
   No watch.
7. **R88 ARMOR-SILENT — CARRIED.** teleOk 10, lineMissing 2,
   silentWild 1, silentHaven 2 on r149 — a line-missing craft on a
   scholar-haven day. Same shape as r148. Watch on this panel; a third
   recurrence with the same shape is a blank candidate, not a re-litigation.
8. **S-shape spear vs flying monster — CARRIED.** 1276 d23 Big Big: the
   scholar struck 4× for 0 damage, "out of Fire-hardened spear reach"
   (high overhead). Policy gap, not a silent-action defect; the fix
   needs engine knowledge of "high overhead" state. Carried observation.
9. **fledBad probe — CARRIED CURIOSITY.** 0 actual flees on r149; the
   probe samples flee considerations. The 1277 d26 spool sample (monster
   at 6% HP) has no fight record — the outmatched increment fired at a
   face/flee decision on a nearly-dead monster. One look this run if a
   sample fires: is the outmatched trigger firing on nearly-dead
   monsters (a trigger-shape question, not a demonstrated bad flee)?
10. **hbloop flock stall — OWED ONE LOOK THIS RUN.** r149: the hbloop's
    16:02Z beat hung ~19 min on the registry `flock` (no timeout in
    `worktree-heartbeat.sh`); the pre-flap gap (10:47→11:02Z) is
    unexplained. This run's hbloop wraps each beat in `timeout 120`
    (coordinator-side mitigation, no shared-script change). The look:
    whether a `flock -w` timeout belongs in `worktree-heartbeat.sh`
    itself — a shared-infrastructure change; prove it with a direct
    lock-contention test before landing, or document why not.

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
variety fix). Include a compare_maps sitting if one fires with 3+ compares
— read it for the new pool lines (Q1a re-verify). Include a confide-exit
sitting if one fires — read it for whether a secret was actually shared.
Include a settled-favor help sitting if one fires — read it for whether
the favor is named (r247 watch).

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

- Landing panel: seeds 1282–1291, 28d, r150 driver
  (scripts/journey-landing-r150-20261120.js — r149 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r150-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-20/`). ABSOLUTE OUTDIR (r149 footgun: a
  relative OUTDIR lands the corpus under the worktree CWD). DAYS=28
  passed explicitly (r149 footgun: driver defaults to DAYS=14; check
  max series day == 28 before trusting a panel).
- Analyzers: the 15 standing analyzers (r144/r145 order) via
  `evidence/2026-11-20/journey-landing-r150-analyzers.sh`, with the
  zerodmg analyzer swapped to the new v4 and the move-refusals analyzer
  swapped to the new r150 split version.
- No threshold, bar, price, or gate changes in this run except the two
  instrument adoptions above (Q1a) and the scholar-deaths adjudication
  practice. If the panel surfaces a further game defect, fix in the
  worktree with a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — goal-pool fixed in
  r149; Olivia bridge repeat remains in the bridge-memory build arm
  with its own panel; NOT this run. Did not recur on r142–r149.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels, r145 1/10, r146 5/10, r147 4/10, r148 4/10,
  r149 3/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented for
  Steve/design call, not fixed here. Did not recur on r142–r149.
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
- Lead-in nit (r139–r149): topic answers repeat their lead-in within a
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
- R149 infrastructure (carried): registration queue (~4–12 min under
  load, REGISTRY.lock held by other loops' reaps/heartbeats — this run:
  ~4.7 min); `git worktree add` ~3–6 min under load; write-flap windows
  strike mid-checkout. The standing heartbeat loop is the mitigation;
  the flap-watch log is the witness. Reaper consecutive-skip alert
  (6 skips at this run's pre-flight): the holder is live sibling
  activity, not a stale lock — investigate only if skips persist past
  this run.
