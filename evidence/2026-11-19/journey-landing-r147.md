# journey-landing r147 — RUN NOTE (Lane A, leg 0 LANDING)

**Run id:** lane-a-20261119T090508Z (scheduled Thu 2026-11-19 02:45 CST).
**Base:** local master `7235e2102` (bowopen adoption note; main moved 18dae3a93 →
7235e2102 during registration when the bowopen-fixnote release landed).
**Seeds:** 1252–1261 (fresh band, verified in prereg), DAYS=28 (days 1–14 judged, horizon d28).
**Driver:** `scripts/journey-landing-r147-20261119.js` (r146 driver verbatim except header/seeds/OUTDIR).
**Corpus:** `landing-r147-after` under the goal hidden_files evidence dir (`evidence/2026-11-19/`).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Prereg:** `evidence/2026-11-19/journey-landing-r147-prereg.md`.

## Verdict

**Panel GO on every binding bar — the Q1a maps-pool fix is proven live in the
exact panel shape that dried on r146, and nothing else on the Q1 table moves
against the run.** HEED-V 0, dry lines 0, zero-DMG 0, pocket 0, M-PR1 2/21 =
9.5% (bar ≤15%). One scholar death (Dominic, d9, solo gallowdeer — a fair
fight death, within the ≤2 bar). The link-accept watch is UNTESTED for the
third panel running (0 raises fired) — diagnosed, not fixed, this run: the
binding gate is the standing-drive weight, and the driver-teaching owed by
r146 cannot execute without a raise to take. See Q1b below.

## Q1 — verdict table (prereg bars)

| Bar | Result | Verdict |
|---|---|---|
| M1 ALIVE-D14: 10/10 alive at d28 | 10/10 alive; pop end 10–12 (start 12) | PASS |
| M2 SYSTEM CONTACT: 10/10 by d9 | 10/10 (9 by d8, 1257 by d9) | PASS |
| M3 FIGHT-LOG: 0 unknown/mixed trigger | 0 (8 fights, clean face-off records; 6 won, 1 routed, 1 lost) | PASS |
| Zero-DMG (revised metric: bind B-shape, exclude routed-at-start) | Raw 0, B-shape 0 | PASS |
| Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10 | 101 cells, 10/10 seeds, skill0→pos 65 | PASS |
| Pocket: 0 pocket fights BINDS; stuckTurns watch | pocket 0; stuckTurns 0 | PASS |
| D1 garbled labels | 0 | PASS |
| HEED-V = 0 BINDS | 0 (legacy HEED 0) | PASS |
| M-PR1 revised: never-offered among established ask_favor sittings ≤15% | 2/21 = 9.5% (raw 5/24; 3 unestablished excluded) | PASS |
| Personal bridge: 0 repeats in a sitting | 0 (19 servings, 0 repeat sittings) | PASS |
| Small bridge: 0 repeats | 0 (7 servings, 0 repeat sittings) | PASS |
| Presshop farUnreached | 0 (attempts 69, hopReached 6) | REPORTED |
| R66 HUNGRY: starvation deaths 0, starvingWarnings 0 | starvation deaths 0; griefMiss 0/5 | PASS |
| 1130-d6 amnesia shape: 0 recurrences | Not surfaced by this run's analyzers; "That's settled" 0× on the panel | PASS* |
| Miriam line: 0 "That's settled" | 0 | PASS |
| Deflect-fallback: 0 `fellBack` | 0 ("I just said" 0× in all 108 transcripts) | PASS |
| Nodloop: LOOP=0 | LOOP=0 (108 sittings, 8 nv, mime 0) | PASS |
| Scholar deaths ≤2 per 10-seed panel | 1 (Dominic, 1259 d9, gallowdeer, solo; succession latency 0) | PASS |
| silentTurns (phantom-line detector): 0 | No silentTurns signal; r128 failed moves 0, stuckFights 0 | PASS |
| Dry-line watch (Q1a fix): 0 dry lines | **0** bare-`...` THEM lines in all 108 transcripts | PASS |
| FIGHTALLY2: fights with a second ally; any 2-ally fight ending zero-DMG/stuck is a Q1 failure | 5/8 fights with 2+ allies; 0 ending zero-DMG/stuck | PASS |
| Homeward watch: scholar stranded homeward 2+ days | No stranded-homeward signal; R85 kcal skips 2/2 complete, RESCUE-GO | PASS |
| Door-flee watch (Q1a r146): 0 fled fights with a door-tile last step | 0 (all 8 fights fled=false) | PASS |
| Link-accept watch (r243): accepted link-raise talks end voiced, never parroted | **UNTESTED** — 0 raises fired, 0 accepts on the panel | UNTESTED — see Q1b |
| Counter-label watch (r246): COUNTER LEARNED lines use the guarded label | 3 lines, all noun-phrase descriptors (guarded by design); living_wire guard verified directly | PASS — see below |
| Q1 resume-take re-pose watch | 1 resume-take read in full (1253 d10): the want re-surfaces and is answered honestly, not with the generic ack | PASS (observed live) |

\* Amnesia shape: no dedicated analyzer line in this run's 15-analyzer set; the "That's settled"
grep (0×) and the case-ledger lines were checked by hand instead.

### Q1a — maps-pool dry lines (r146 item 3): FIXED, panel-verified

Fix applied before the panel to `src/js/conversation.js` (compare_maps branch):
`maps:nonenew` 2→6 lines, `maps:shared` 3→6 lines, existing lines kept first, same
voice. Root cause (verified against the r146 transcripts + code): `convoPick`
filters against everything ever said to that villager, so the third nonenew pick
in one sitting returned null and the null-line guard (`conversation.js:8130`)
rendered bare `"..."`.

Proof test `scripts/test-journey-landing-r147-maps-pools-20261119.js`: **ALL GREEN**
(pool6 distinct=6 both pools, sitting3 distinct=3, control keeps all original
lines verbatim). **RED verified via stash-swap** (nonenew nulls on the 3rd call,
shared on the 4th, sitting3 fails on the 3rd pick — the exact panel shape; 6
failures on unfixed code).

**Live AFTER evidence (the exact panel shape).** Seed 1255 d6 (Leo), 3 compare_maps
picks in one sitting, reproduced byte-identically in pilot and full panel:
turn 4 shared ("I've been all through here."), turn 8 nonenew 1 ("Huh. We've
walked the same ground, you and I."), turn 12 nonenew 4 — a NEW line:
"We've both been everywhere worth going, looks like." Leo folds their arms.
"Nothing left to trade." On r146's code that turn rendered bare `"..."`.
Seed 1254 d6 served the other new shared line ("Here's one you haven't got.").
**Panel dry lines: 0. CLOSED.**

### Q1b — link-accept (r146 item 12): UNTESTED, diagnosed — driver-teaching cannot execute

**The panel produced 0 link-raises** (no "We should link" line in any of the 108
transcripts; no link keys in any census). Third panel in a row with ≤1 raise
(r145: 16, r146: 1, r147: 0). With no raise fired there is no accept for the
driver to take — r146's owed "teach the driver to take one" cannot execute
this run, and teaching it anyway would be untestable (a driver change that can
never fire on this panel proves nothing).

**Diagnosis (probe, not a guess).** The raise gate is `bondLinkRaiseCand`
(`src/js/bond-initiation.js`): trust ≥20 AND `vgoalWeights.build_standing` ≥1
AND per-villager lore about the village AND the village in `otherVillages`,
then the scorer must pick RAISE_LINK over HOLD (plus a 0.5/day lottery).
Probe (`/tmp/r147-linkraise-probe.js`, seed 1252, shared `runDays` loop,
competent policy, 28d — scratch, not committed):
- Trust is NOT the binding gate: 9–12 villagers per seed end at trust ≥20 on
  this panel (census), same as r146 (9–11).
- Lore EXISTS: 4 villagers knew another village (village_3/village_1) at d28;
  the panel's system files name Thornfield on 4 seeds (commons pressure,
  runners) — the village knows Thornfield, but per-villager lore is what the
  gate reads.
- **`build_standing` ≥ 1: 0 villagers** (max observed 0.75). No `linktick`
  scorer-log entry at all — no villager ever presented a link candidate.
- The gate is unchanged since OVE-51 (2026-11-08), which is in r145's base
  too — the 16→1→0 drop is band variance in roster composition + lore flow,
  not a code regression.

**What this means.** In the landing window the standing-drive weight rarely
reaches 1: the weights come from character axes (lead=2, prove/understand=1,
others 0.25) modulated by temperament/occupation/intel and gated on what the
villager has perceived. A raise needs a villager who both carries a standing
drive AND has learned of another village — a combination the first month
rarely produces. Whether that is correct (raises are a later-window behavior)
or the gate is too strict for the window is a design/balance question for the
goals arm — **not decided here, not re-tuned in this run**. The link-accept
watch stays UNTESTED; the r243 accept-line pool variety question stays open
for the same reason. Carried with the diagnosis, not with a blind driver change.

### Counter-label watch (r246 fix): PASS

Three COUNTER LEARNED lines on the panel, all naming the beast by its unknown
descriptor: "a dog-shaped silence at the treeline" (hushwolf, 3×), "a raccoon
with too many fingers, working at something" (lockpick_raccoon), "the humming
in the grass" (hummice). These are noun-phrase descriptors, not prose clauses:
`monsterNoun` returns them as-is (verified directly: hushwolf noun "dog-shaped
silence at the treeline", lockpick_raccoon "raccoon with too many fingers",
hummice "humming in the grass"), so the r246 guard keeps them by design. The
guard itself works: living_wire noun is 'something', so its counter label is
'something' (the clause "the creek went still, and your arm-hairs stood up"
never stands where a name belongs). No prose-clause descriptor named a counter
on this panel. PASS.

### Scholar death — Dominic, 1259 d9 (within bar, read in full)

Dominic met a gallowdeer (Highbeam Deer, 151 HP, wave 1) alone at the field's
edge (spawn (8,0)), 0 allies, HP 94, 1300 kcal, hydration 28. He closed twice,
struck once for 27 (Crowbar), and the deer hit for 15, then 51, then 43 through
armor (absorbs 17, 15). HP 94 → 79 → 18 → dead. End lost, fatal. Succession
same day (latency 0). This is the game's thesis working as designed — wave 1
is animal shock, every animal might kill you — not a defect: a scholar walked
up to a Highbeam Deer alone and it killed him. The village remembers (the
d6 ambush death of Kathleen got the FIRST GRAVE crisis line the same week).

### Fights — 8 (r146: 10, r145: 21)

6 won, 1 routed (1253 d9 lockpick_raccoon fled at the face-off), 1 lost
(1259 d9, fatal). 5/8 fights had 2+ allies (2, 2, 3, 2, 3); none ended
zero-DMG or stuck; 0 failed moves in the whole panel (r128). Villagers killed
223 monsters in the wild between them (12–33/seed, waves 1–3 — including a
wave-3 ad_break killed on expedition, 1252 d26). The scholar's own fights are
a small part of the killing, as on r146. The fight-count volatility question
(21 vs 12 vs 17 vs 7 vs 16 vs 10 vs 8) is unchanged — the matched-band A/B is
still owed before any claim about fight frequency.

## Q2 — People check (5 full transcripts + 2 fight logs)

Read in full: 1252 d7 (Axel, warn_you), 1260 d6 (Ella, mourning offered),
1252 d5 (Victor, resume-take offered), 1253 d10 (Chloe, ask_favor + resume-take
taken), 1255 d6 (Leo, compare_maps ×3 — Q1a AFTER), plus the 1259 d9 death
fight and the 1258 d18 three-ally fight.

- **1252 d7 (Axel, warn_you, 4 turns) — HEALTHY.** The scholar heeds at once
  (stage 1→3, resolution=heeded) and the warning deepens turn by turn:
  "Promise me that. Please." → "Thank you. I needed to hear you say it." →
  "Good. I mean it — watch yourself out there." → "You hear me, right? Not the
  words — the part underneath. I'm scared, and I'm asking you not to make me
  watch it happen." A worried person, not a quest giver. Four distinct deepen
  lines, no repeats.
- **1260 d6 (Ella, curious, 7 turns) — the mourning beat is offered, never
  taken.** The day after a villager died by monster (d5), the menu offers
  `[alive:event:mourning] "How are you holding up? About... them."` twice, but
  the probe driver pages past it both times and leaves. The sitting itself is
  good — Ella tells her past ("My hands know things my brain hasn't caught up
  to yet. Muscle memory from ESL teacher days.") and the closing line lands
  ("Talking helps. Then it hurts. Then it helps again. It's a cycle."). But
  the mourning beat's name-wearing and template spread stay untested on this
  panel (same as r146): the driver never takes a mourning option. The menu
  label says "About... them." without naming the dead — whether the spoken
  beat names them is still unobserved.
- **1252 d5 (Victor, curious, 10 turns) — HEALTHY.** Victor answers the big
  question ("The world's ended. We're what's left." → "Bleak. Probably true.
  I keep looking for the part where it's not."), tells his past (mason: "Doesn't
  mean much now, does it? Means something. Just not much."), jokes about a gray
  hair ("wisdom frost"). The resume-take `[alive:thread:personal] "We never
  finished — your story."` is offered at turn 9; the driver pages past it.
  Ends engaged (stage 3). Bridges vary; no repeats.
- **1253 d10 (Chloe, ask_favor, 12 turns) — RICH, watch HOLDS, resume-take
  WORKS.** Opens already-handled ("Never mind the food I needed — we got it
  handled."). At turn 6 the driver takes `[alive:thread:want] "We never
  finished — that foraging help."` and Chloe answers honestly: "No, really,
  it's fine. Forget I even asked." — the want re-surfaces and resolves as
  already-handled, NOT the generic acknowledgment. The Q1 resume-take re-pose
  watch is observed live and passing. Party invite refused legibly ("We've
  barely spoken. Ask me after we've bled together."). The beast-naming beat
  runs at the end (the lockpick_raccoon gets its votes: "Big Loud",
  "Loud-Eyes", "The Loud Beast"...). Closing line: "Well. That was almost a
  conversation. We're improving." No live need was brushed off with the settled
  line in any sitting read (the 3 settled=true sittings all open with the need
  stated as already handled — Arthur's sickness, Chloe's food, and one more).
  (639bd3f41 watch.)
- **1255 d6 (Leo, compare_maps ×3) — Q1a AFTER, see above.** Also notable:
  Leo is sick and asks outright ("Please — whatever this is, it's getting
  worse — I'm achy and wrung out, barely keeping food down. Can you do
  anything?") — a live need stated in conversation, the medicine shape.
- **1259 d9 (gallowdeer fight) — see Scholar death above.** A solo fight the
  scholar chose to close on, and lost.
- **1258 d18 (hushwolf, 3 allies) — reads as a group fight.** DeShawn, Nora,
  Zuri stand with the scholar; the wolf picks targets by name ("The wolf's head
  swings toward DeShawn. You're on the list now — it doesn't forget.") and by
  proximity ("Too close. The wolf's attention SNAPS to you."). The allies are
  named people the monster chooses between, not a stat appearing. Won.
- **M-PR1 watch holds.** statedAfterPick 0 this run (r146: 5) — no
  stated-after-pick lines at all. All 3 settled=true sittings open with the
  need already handled; nothing live was brushed off.

## Q3 — Telemetry

`telemetry-check.js` vs baseline `landing-split.json` (81/9/217/15/0, re-pinned r136):
**quiet** (10 files, 5 metrics, no large deviations). Baseline NOT rolled — the
panel carries no new information that moves it. No LOUD lines.

## Q4 — Gate (adoption closeout, 2026-11-19 ~11:1xZ)

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
in the worktree on the rebased tip (`4ea7686ea` + evidence `ebaf457be`):
**338 passed, 6 failed in 992s** (log
`evidence/2026-11-19/journey-landing-r147-gate.log`). The 6 failures are
0 attributable — this branch changes only `conversation.js` (maps-pool
lines) + a proof test + evidence:

| Failure | Verdict |
|---|---|
| `test-living-garden-deed-attainment.js` (120s timeout) | standing deed-attainment timeout class (r242 same) |
| `test-measurement-proof-update.js` ("Proof source inputs are not current") | standing stale balance-proof manifest (r242 same) |
| `test-measurement-workflow.js` (neutrality proof coverage) | same stale-manifest family (r242 same) |
| `test-measurement-cache-flags.js` ("both actual CLI configurations complete valid neutral panels", 69.1s) | r241 failure recurring; passed in-gate on r242 — load artifact, not the maps-pool change (neutral panels don't read convo pools) |
| `test-phone-frame-proof.js` (phone receipt stale/missing: index.html) | standing phone-frame receipt staleness (r242 same) |
| `test-one-person-army-deed-attainment.js` (120s timeout) | standing deed-attainment timeout class (r242 same) |

Gate GOOD for merge: 338/6, 0 attributable (5 = r242's exact standing
set; cache-flags = the r241 failure recurring under load).

## Adoption closeout — stale-lock recovery (2026-11-19 ~11:05Z)

The 02:45 CST run (lock `2026-11-19T09:04:57Z-playtest-loop-a`) died before
closeout: registry heartbeat for `journey-landing` last `10:11:11Z` (~55 min
stale at recovery), no live coordinator in `subagent.list`, no process with
the worktree as cwd, no file writes in the tree in the last 15 min. Stale-lock
recovery per the loop body + `local_loop_closeout` skill.

- `docs/ONTOLOGY.md` was found emptied to 0 lines in the worktree (the known
  write-flap shape). Restored from HEAD (`git checkout HEAD -- docs/ONTOLOGY.md`);
  hash-object now equals the HEAD blob `c4fcc0454`. The fix commit itself never
  touched ONTOLOGY.md.
- Fix commit `9efd6870b` verified by the adoption run, not taken on the timed-out
  run's word: proof test `scripts/test-journey-landing-r147-maps-pools-20261119.js`
  re-run on the original tip → ALL GREEN.
- Rebased onto current master `385f07995` → `4ea7686ea`, clean, no conflicts
  (master-ahead commits are evidence-only). Proof test re-run on the rebased
  tip → ALL GREEN.
- Evidence (this note, prereg, driver, pilot/full/analyzer logs, 0-byte
  check.log from the killed gate) committed via `safe-commit.sh` on the branch.
- Gate: `node scripts/check.js --quick` in the worktree on the rebased tip —
  result recorded in Q4 above once the sibling gate finishes (no concurrent jest).

## Village assessment (plain words)

Ten villages, all alive at day 28 — nine scholars lived, one died, and every
village met the System by day 9. Five villagers died: three to monsters, one
ambushed on the road, and the scholar Dominic to a deer he walked up to alone.
Nobody starved. The month was hungry, though: four villages end with under
2,000 kcal per person in the pantry (a fifth sits at 1,370 on its last recorded
day), and the pantries swing wildly — one village ends with 6,478 kcal per
person banked while another ends at 731. The hungry villages still had people
in them; the margin is thin, and the spread is the story.

The villages are talking and planning more than last run. No village had a
win-plan running by day 14 (last run two did — that signal did not hold), but
sixteen plan-holders stood across five villages by day 28. Nobody has a trio
party yet, nobody has killed a wave-4 beast, nobody is near the table; the
plans are young. People do go out together: five of the eight fights had two
or more allies beside the scholar, and the villagers killed 223 monsters
between them while out hunting and foraging — including a wave-3 beast, killed
on expedition. The scholar's own fights are a small part of the killing.

What people want from each other is visible in the talk: party invites (six
offered, two taken), favors asked and kept (seven kept), the naming debate
running in the firelight (the raccoon with too many fingers got its votes),
and the dead still named the next day (the case ledger named its targets 16
for 16). One village's month turned on a single moment: on 1259 the scholar
Dominic walked up to a Highbeam Deer alone at the field's edge, struck it
once, and it killed him in three hits. The village buried him the same day
and kept going.

The worry to watch is the same as last run: the hungry villages. Four of ten
end the month under 2,000 kcal per person, and the pellet-bearer's old trap
(a village that never feasts because one person never hungers) is worth keeping
an eye on as the hungry count stays high. The other worry is quieter: nobody
in any village has yet proposed linking with Thornfield, though Thornfield's
runners are already at the fire arguing over shared ground.

## Reachable / fun / winnable (leg 0)

- **Reachable: yes.** First System contact by d9 on all 10 seeds; conversations,
  party invites, favors, outings, contests, win-plans, and the beast-naming
  debate all fire inside the window. The link-raise does not fire — a real
  player would not meet it in the first month either (see Q1b).
- **Fun: mostly.** The conversations read like people (Chloe's sitting is the
  best of the panel — a favor revisited honestly, a party refused with a
  reason, a monster named by vote). The flat spot is the probe's own doing:
  the driver pages menus and leaves options untaken (mourning, the resume-take),
  so some beats are offered but never heard. The death fight is the least fun
  moment on the panel — the scholar walks up to a deer alone and dies in three
  hits — but it reads as the game's thesis, not a bug.
- **Winnable: too early to judge on this leg.** No village is near a win —
  that's expected at day 28. The direction is right: plans seed by day 28,
  parties form, villagers kill wave-2 and wave-3 beasts in the wild. The
  binding wall is still the same one: wave-4 kills (0 on this panel).

## Metric review (for the next run)

1. **HEED-V bar — keep at 0.** The want-bridge fix holds on its first full
   panel (HEED 0, HEED-V 0); the bar stays.
2. **Dry-line bar — keep at 0.** The maps-pool fix holds (0 dry lines, new
   lines served live). The bar stays; a sitting comparing maps 7+ times would
   be a real loop, not a pool-size problem.
3. **Want-insistence question (design, not a metric).** Carried from r146:
   after repeated deflection, should a pending want re-assert itself instead
   of handing the floor back? The [alive:thread:want] menu already re-surfaces
   it (1253 d10 proves it works). No change proposed here.
4. **Deflect-fallback — CLOSED as a watch.** "I just said" 0× on the panel
   (r146: 1). The mis-fire came with the dry line it followed; with the dry
   line gone, the fallback never mis-fired. Drop the watch unless it recurs.
5. **fledBad twitchiness.** fledBad 0 on this panel (r146: 2, both named).
   The instrument is proven live by r146's firings; this is a genuine zero.
   The minimum-threat-floor question (r146 item 5) stays open, unmeasured.
6. **Hungry-at-horizon 5→4 (watch move).** r145: 1/10; r146: 5/10; r147: 4/10
   at d28 entries (5/10 counting 1258's last-available day, d27 1,370/person).
   Report as a watch move; do NOT over-claim a cause. History: r137/r138 4/10,
   r139 6/10, r140 6/10, r141 5/10, r142 4/10, r143 5/10→4/10, r144 5/10,
   r145 1/10, r146 5/10, r147 4/10. No lever changed in the food path this run.
   Keep watching.
7. **Fights 10→8 (r146→r147).** Still in the volatile range (21 vs 12 vs 17
   vs 7 vs 16 vs 10 vs 8). No claim made; the matched-band A/B is still owed
   before any claim about fight frequency.
8. **Together-blocked breaks (9, all "carry 0 kcal").** Same shape as r146
   item 8 (8, +2 in R71's count of 10). Outings that go out together and come
   back with 0 kcal break the favor; several kept favors still carry the break
   reason in the ledger. Worth one look by the outing arm: does a kept favor
   keep its break flag, and should a 0-yield together-outing break at all?
9. **Win-plan early start (2 seeds at d14 → 0).** The r146 signal did not hold
   on this band. Positive signal downgraded to noise; watch whether it ever
   recurs.
10. **R68 PARTY offers 8→6, accepted 5→2.** The r146 high reversed; no
    verdict, just the move.
11. **M-PR1 statedAfterPick 5→0.** Watch holds; the away-guard road line did
    not fire once on this panel.
12. **Link-accept watch still UNTESTED — DIAGNOSED (Q1b above).** 0 raises on
    this panel; the binding gate is the standing-drive weight (0 villagers ≥1
    at d28 on the probed seed). The next step is a design/balance question
    for the goals arm, not a driver change and not a silent gate re-tune.
    If the next panel also produces no raise, the question goes to Steve
    with the diagnosis attached.
13. **Resume-take re-pose — OBSERVED, PASS.** 1253 d10 takes the thread and
    gets an honest answer. The analyzer still prints no resume-take count;
    the count, if wanted, is a tooling addition for the analyzer arm, not
    this run.
14. **Mourning beat — still unheard.** The option is offered (1260 d6, twice)
    but never taken by the probe driver. A mourning sitting needs a driver
    that takes the option (same shape as Q1b) or a staged read; the name-worn
    and template-spread questions stay open.

## Infrastructure (loud)

- **Registration queue (~7 min).** Lane B's journey2-social registration held
  REGISTRY.lock while mine waited; then `git worktree add` ran ~3 min under
  load ~8.5. No failure — a slow queue on a hot tree. The reaper also skipped
  at pre-flight (registry lock held by another reaper run, consecutive skips: 1).
- **Box load:** load average ~8.5 at registration, ~17.87-class pressure during
  the panel (r146 saw the same). The gate waited for the sibling partyfunnel-a
  gate rather than running concurrent jest (phantom-failure rule).
- **VM restart ~08:11Z** (uptime 1:00 at 09:11Z) preceded this run; no
  mid-run restart hit this panel (unlike r146).

## Closeout

- Fix commit: [PENDING — maps-pool fix + proof test, to be committed via safe-commit.sh]
- Evidence commit: [PENDING — driver, prereg, pilot/full/analyzer logs, run note]
- Remaining closeout steps after this commit: rebase onto current master if
  it moved, re-run proof tests on the rebased tip, merge ff-only, release the
  tree, write rotation 0→1, delete the lock last after run_id verification,
  kill the heartbeat loop by exact PID after the tree is released, final
  worktree-reap, main tree verified clean. Merged locally, pending ship.
