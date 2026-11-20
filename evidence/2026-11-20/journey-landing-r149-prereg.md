# journey-landing r149 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-20261120T0945Z (scheduled Fri 2026-11-20 03:45 CST).
**Base:** local master `6b8051ec2` (journey-scale r246 adoption; `git pull`
already up to date at run start).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat loop every 5 min for the whole run
(nohup, log
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-landing-r149-heartbeat.log`).
Lock: none present at run start; fresh lock created 2026-11-20T09:43:59Z
(run_id playtest-20261120T0945Z). Pre-flight: main tree clean, disk 50%,
`worktree-reap.sh` ran (13/16 active; 4 trees with uncommitted changes
belong to other loops — never touched).
**Flap:** registration's first attempt died in a write-refusal window
(onset 09:57:26Z, flap-watch.log: A/B/E/G/H/I EPERM; `git worktree add`
wrote 105260 files then failed "Could not reset index file to revision
'HEAD'" with 5 files unwritable). The partial tree vanished before the
retry (no worktree dir, no registry entry; orphan branch `journey-landing`
left behind — the register script's attach fallback reused it). Window
cleared ~10:00:34Z (probes A/B/C/D/F/G/H OK; E/I EEXIST is the watcher's
own stale lock files, not a refusal); own probe `git update-ref
refs/heads/probe HEAD` passed 10:02Z. Re-registration clean (~3.7 min),
worktree verified clean at `6b8051ec2`, all 5 flap-hit files present.
Flap window ~3 min — a short burst, same shape as the Nov 19 bursts.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1272–1281**. `grep -l "1272"` over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md`: hits
are incidental numbers only — pantry kcal 1272 (r127/r128 run notes),
meeting count 1272 (sim-fieldability-a, sim-breakline-a, sim-staying-b
preregs), `#1272 context` (sim-fullseat-a), a commit-hash fragment
(sim-proofrefresh-b10). `grep -l "127[3-9]|128[01]"` over the same sets:
pantry kcal 1281 (r95), backlog line numbers 1279–1281 (sim-spanpromo-b,
sim-culthall-b, sim-postpayrefusal-b), 11xxx seed lists
(sim-clearhabit-b, sim-nighttravel-verdict-adopt-b), code line numbers
(game.js:12794–12817, sim-grindfinish-b, sim-wanderspawn-a). No landing
run note or sim prereg names seeds 1272–1281 as a band. Used landing
bands (r148 prereg): 1262–1271 (r148), 1252–1261 (r147), 1242–1251
(r146), 1232–1241 (r145), 1222–1231 (r144), 1212–1221 (r143),
1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140), 1162–1171 (r139),
1142–1151 (r121–r138, deliberate reuse), 1122–1131 (r119), 1083–1092,
1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906 (contaminated),
887–896, 867–876, 857–866, 847–856, 837–846, 817–826, 797–806, 777–786.
Band 1272–1281 is fresh.

## Q1 (PRIMARY) — regression watch on the post-r148 master, fresh band, + B-shape split

Since r148's base (`0aa413222`), `src/js/` changed in 9 files
(`git diff 0aa413222..6b8051ec2 -- src/js/`, +291/−14) and the driver
policy changed in 1 file. Landing-domain changes in the watch:

- `convo-wants.js` +16 — **scale r246 react wind-down fix** (db6f4d7ce):
  `dlg:react` retires from want menus at `reactDryCount >= 2`. AFTER
  measurement on live play (r246's proof was a staged repay sitting):
  no verbatim-repeat react loop, no dead-react sitting on the panel.
- `convoTopics.js` +21 — **succession r254 mourning witness variant**
  (aea63f6b5): the mourning pool serves witness lines when the speaker
  saw the latest fresh dead fall. Watch: a mourning sitting should name
  the dead AND read true when the speaker is a witness (not a template
  misfire).
- `bond-initiation.js` +29 — **r148 Fix 2** (cf17e4dd6): link-accept
  rotation by pool index. AFTER measurement: accept-line variety on live
  play (was 22/1, fixed code 14/9 on the matched re-panel).
- `scripts/policies/competent.js` +78 — **r148 Fix 1** (cf17e4dd6):
  moderator-mute guard in the driver policy. AFTER measurement:
  0 MOVE-MUTED violations, 0 movedLie on the panel.
- `game.js` — **establishment r244 counter-label comma-clause fix**
  (9fb55be89): `monsterCounterLabel` uses the guarded noun when the
  display name carries a comma. Watch carried from r148 (was 5/5
  noun-phrase): every COUNTER LEARNED line uses the guarded label.
- `favor-outing.js` +2 — **endgame r249 doubled-'The' fix** (26772ac93):
  villager scream + waiting-outing note. Watch: no doubled 'The' in
  outing lines on the panel.
- `finale-campaign.js` +14 / `game.js` — **crisis r253** (eb12c1471):
  march refusal once-per-day + antler-thrash 'The The' fix. Later-leg
  content; watch only on a 28d horizon.
- `villager-build.js` +138 — **BOWCRAFT turn-on** (d56fbe819, ef1c81094)
  + **BOWKNOW mentoring** (eaf530d6a): the BOWCRAFT duty env gate is
  REMOVED — duty always on in live play; a bow-knower at home teaches
  spear-holders. **Bar change (adopts the r148 metric-review
  consequence):** a 4-person launch or bow-staged volley is NO LONGER
  a defect — it is the landed lever working. Report launches/volleys
  as lever behavior, not as a Q1 failure. (r146/r147's "gate off =
  defect" bar is retired with the gate.)
- `game.js` — **sim-searsupply-a** (6c4b75925 + 0fd416c5d): lever NO-GO
  and reverted; instrument + evidence only. No live behavior change;
  no signal expected.
- `titans.js` +60 — **deepening r245 growth-line cooled call**
  (e086cffcb): dawn-line reword at the act. Later-leg content; watch
  only.

**Q1a — B-SHAPE SPLIT (r148 metric-review item 1, this run's instrument
change):** the 1271 fight is B-shape on all three r148 panels, but on
the re-panels it has zero violations — the scholar waits out a mute
while allies win. The current B-shape counts "stood through and dealt
0 damage" regardless of whether the turns were wasted or spent well.
Split it from this run:
- **refused-turns BINDS at 0** (panel total across zero-DMG fights): a
  scholar turn lost to a refused verb — a `player-move` fightLog entry
  with `posMoved === false` (movedLie + failed/refused moves, including
  mute violations) or a `player-ability` entry with `ok === false`.
  Counted by the new analyzer
  `scripts/analyze-landing-r149-zerodmg-v3.js` (v2 + split), proved
  against the r148 corpora (original: refusedTurns 2 on the 1271 fight;
  fix2: refusedTurns 0, stood-through 1) — see proof test
  `scripts/test-journey-landing-r149-zerodmg-split-20261120.js`.
- **stood-through-by-choice REPORTED ONLY:** a B-shape fight with
  refusedTurns 0 — waiting, closing, allies winning first. Not a miss.
- The original panel's NO-GO verdict stands (the miss was real then);
  the split judges r149, it does not re-score r148.

**Q1b — WARN_YOU CONTENT NIT (r148 metric-review item 10, this run's
Q2 focus):** the 1262 d12 warning never names the danger — the opener
trails off and no threat is ever stated, so the warning has no content
to heed. If a warn_you sitting fires on this panel, read it in full
for whether the danger is named. If the nit reproduces, it is this
run's blank candidate (dialogue-arm territory — fix with a proof test
if the mechanism is pinned in the want code, else document and carry).

**Interesting if:** any r148 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots;
a scholar ends stranded homeward for 2+ days; a favor with a live need
is answered settled; a trail-talk / Wren line repeats verbatim in one
sitting; a second scholar death pattern (deaths > 2); revised M-PR1 >
15%; statedAfterPick ≥ 6; hungry-at-horizon moves from 4/10 either way;
any village starts a win-plan inside 28d; a parting-hit death; a trio
party forms inside 28d; a dry `...` line on any turn; a COUNTER LEARNED
line naming a prose-clause descriptor; a confide exit with no secret
shared; a volley line naming the wrong ammo; a mourning beat that names
no one or reads as template filler; a dead-react loop (reactDryCount
gate not holding in live play); a link-accept pool[0] repeat streak;
a doubled 'The' in an outing line; a 4-person launch or bow-staged
volley (report as lever behavior, not a defect).

**Bars (bind, r148 bars carried, with the two changes above):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG: **refused-turns 0 BINDS** (new split); stood-through-by-choice
  reported only; raw zero-DMG + B-shape reported as watch.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised per r143 metric review item 1): never-offered among
  established ask_favor sittings ≤15%, where "established" excludes
  `resolution=unestablished` sittings regardless of final stage; raw
  analyzer rate + max per-seed never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
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
- **Scholar deaths: ≤2 per 10-seed panel.** Report count, day, cause,
  succession latency per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- **Dry-line watch: 0 dry (empty-content) lines in the panel's transcripts.**
  Any dry line is a Q1 failure on live data (maps-pool + fallback-structural
  AFTER measurement).
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
- Pilot first: seeds 1272–1275; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Metric-review adoptions from r148

1. **B-shape split — ADOPTED (Q1a above).** refused-turns binds at 0;
   stood-through-by-choice reported only.
2. **Link-accept watch — TESTED, now with variety.** 23 accepts, all
   voiced; variety 14/9 on the fixed code. Keep the watch; a repeat
   streak is now a Q1 failure, not just a watch.
3. **Mourning — ANSWERED, watch closed as a bar; witness variant is the
   new watch (Q1, convoTopics.js).** The generic menu label
   ("About... them.") stays a carried observation, not a bar.
4. **HEED-V bar — keep at 0.** Third full panel at 0 (r146/r147/r148).
5. **Dry-line bar — keep at 0.** Maps-pool + fallback-structural fixes
   hold on their second AFTER measurement (0 dry lines in 137 transcripts).
6. **M-PR1 — keep the revised ≤15% bar.** 9.1% on r148; statedAfterPick 3
   (honest away-guard road line, no defect).
7. **Hungry-at-horizon 4/10 (same as r147).** Watch move: none. History:
   r137/r138 4/10, r139 6/10, r140 6/10, r141 5/10, r142 4/10, r143 5/10→
   4/10, r144 5/10, r145 1/10, r146 5/10, r147 4/10, r148 4/10.
8. **Fights 16 (volatile range continues).** No claim; the matched-band
   A/B on fight frequency is still owed.
9. **Win-plans 2/10 at d14 and d28.** The r146 signal recurs after r147's
   0 — downgraded to noise last run, now a flicker again. Watch.
10. **Warn_you content nit — OWED THIS RUN (Q1b above).** Read a
    warn_you sitting for the named danger; fix if the mechanism pins.
11. **r147 item 12 (link-accept question to Steve) — MOOTED** (r148:
    23 accepts on the band; r147's 0 was band variance).
12. **r147 item 14 (mourning) — ANSWERED** (r148 Q1a).

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
it for whether the danger is named (Q1b). Include a resume-take sitting
if the panel produces one (Q1 watch) and read it for the re-pose AND for
any drift-note tail quoted as memory. Include a C3d recap sitting if one
fires (recap naming the live want with an empty thread log). Include a
fight transcript with a second ally if one fires — read it for whether
the ally's presence reads as a person joining, not a stat appearing.
Include an accepted link-raise talk if one fires — read it for the voiced
accept line and which pool line served (r243 watch + r148 variety fix).
Include a compare_maps sitting if one fires with 3+ compares — read it
for the new pool lines (Q1a re-verify). Include a confide-exit sitting
if one fires — read it for whether a secret was actually shared.

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

- Landing panel: seeds 1272–1281, 28d, r149 driver
  (scripts/journey-landing-r149-20261120.js — r148 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r149-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-20/`).
- Analyzers: the 15 standing analyzers (r144/r145 order) via
  `evidence/2026-11-20/journey-landing-r149-analyzers.sh`, with the
  zerodmg analyzer swapped to the new v3 (B-shape split).
- No threshold, bar, price, or gate changes in this run except the
  B-shape split (r148 metric-review adoption) and the BOWCRAFT bar
  retirement (the gate is gone — a launch is lever behavior, not a
  defect). If the panel surfaces a further game defect, fix in the
  worktree with a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142, r143, r144, r145, r146, r147, or r148.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels, r145 1/10, r146 5/10, r147 4/10, r148 4/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented for
  Steve/design call, not fixed here. Did not recur on r142, r143, r144,
  r145, r146, r147, or r148.
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
- Lead-in nit (r139–r148): topic answers repeat their lead-in within a
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
- R148 infrastructure (carried): registration queue (~4–12 min under
  load, REGISTRY.lock held by other loops' reaps/heartbeats); `git
  worktree add` ~3–6 min under load; write-flap windows strike
  mid-checkout (this run: 09:57–10:00Z, ~3 min, killed the first
  registration attempt). The standing heartbeat loop is the mitigation;
  the flap-watch log is the witness.
