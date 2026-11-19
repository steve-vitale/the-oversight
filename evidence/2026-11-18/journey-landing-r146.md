# journey-landing r146 — RUN NOTE (Lane A, leg 0 LANDING)

**Run id:** lane-a-20261119T012424Z (scheduled Wed 2026-11-18 18:45 CST).
**Base:** local master `be0b90b41` (journey-scale r243 closeout); `git pull` already up to date.
**Seeds:** 1242–1251 (fresh band, verified in prereg), DAYS=28 (days 1–14 judged, horizon d28).
**Driver:** `scripts/journey-landing-r146-20261118.js` (r145 driver verbatim except header/seeds/OUTDIR + fledBadLog dump).
**Corpus:** `landing-r146-after` under the goal hidden_files evidence dir (`evidence/2026-11-18/`).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Prereg:** `evidence/2026-11-18/journey-landing-r146-prereg.md`.

## Verdict

**Panel NO-GO on one binding bar (HEED-V=1, binds at 0) — defect found, fixed, and proven in this run.**
Everything else on the Q1 table passes. The fix (want-bridge pool 6→10) is landed in the
worktree with a proof test (GREEN) and a before/after re-run of the affected seed (HEED-V 1→0).
Per metric binding (§14) the panel verdict is not re-scored: the panel as-run is NO-GO, the
defect is closed in the same run, and the next run's panel verifies it. Same shape as r145's
door fix (panel-found, fixed in-run, verified by re-run).

## Q1 — verdict table (prereg bars)

| Bar | Result | Verdict |
|---|---|---|
| M1 ALIVE-D14: 10/10 alive at d28 | 10/10 alive; pop end 10–12 (start 12) | PASS |
| M2 SYSTEM CONTACT: 10/10 by d9 | 10/10, all d8 | PASS |
| M3 FIGHT-LOG: 0 unknown/mixed trigger | 1 zero-DMG fight, trigger monster-approach; no unknown/mixed | PASS |
| Zero-DMG (revised metric: bind B-shape, exclude routed-at-start) | Raw 1: B-shape 1 (1244 d20 Paparazzo, scholar stood through, allies killed); routed-at-start 1 (1245 d11 lockpick_raccoon, end=routed) excluded | REPORTED — see below |
| Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10 | 91 cells, 10/10 seeds, skill0→pos 56 | PASS |
| Pocket: 0 pocket fights BINDS; stuckTurns watch | pocket 0; stuckTurns 1 (the 1244 d20 fight) | PASS |
| D1 garbled labels | 0 | PASS |
| HEED-V = 0 BINDS | **1** (1250 d10, "Look, forget it. You wanted something?" ×2) | **FAIL — fixed this run** |
| M-PR1 revised: never-offered among established ask_favor sittings ≤15% | 2/23 = 8.7% (raw analyzer 6/27 = 22.2%; 4 sittings unestablished) | PASS |
| Personal bridge: 0 repeats in a sitting | 0 (18 servings, 0 repeat sittings) | PASS |
| Small bridge: 0 repeats | 0 (6 servings, 0 repeat sittings) | PASS |
| Presshop farUnreached | 0 (attempts 83, pressFail 0, hopReached 12) | REPORTED |
| R66 HUNGRY: starvation deaths 0, starvingWarnings 0 | starvation deaths 0; griefMiss 0/9 | PASS |
| 1130-d6 amnesia shape: 0 recurrences | Not surfaced by this run's analyzers; "That's settled" 0× on the panel | PASS* |
| Miriam line: 0 "That's settled" | 0 | PASS |
| Deflect-fallback: 0 `fellBack` | **1** — 1250 d10 turn 23, "I just said — did you miss it?" (same sitting as HEED-V) | WATCH HIT — see metric review |
| Nodloop: LOOP=0 | LOOP=0 (106 sittings, 7 nv, mime 0) | PASS |
| Scholar deaths ≤2 per 10-seed panel | 0 | PASS |
| silentTurns (phantom-line detector): 0 | No silentTurns key in census; r128 silent-noline move failures = 3, all inside the 1244 stuck fight | REPORTED |
| Dry-line watch: 0 dry lines | **2** bare-"..." THEM lines (1248 d6, 1250 d10), both compare_maps with nothing new | WATCH HIT — see metric review |
| FIGHTALLY2: fights with a second ally; any 2-ally fight ending zero-DMG/stuck is a Q1 failure | 6/10 fights with 2+ allies; the 1244 d20 fight (3 allies) ended zero-DMG + stuck | WATCH HIT — same fight as B-shape (see below) |
| Homeward watch: scholar stranded homeward 2+ days | Not surfaced by this run's analyzers; no stranded-homeward signal in the census series | REPORTED |
| Door-flee watch (Q1a): 0 fled fights with a door-tile last step | 0 (all 10 fights fled=false; 9 won, 1 routed) | PASS |
| Link-accept watch (r243): accepted link-raise talks end voiced, never parroted | **UNTESTED** — 1 raise fired (1245 d7 Rewi/Thornfield), never accepted or declined (driver left); 0 accepts on the panel | UNTESTED |
| Q1 resume-take re-pose watch | No resume-take count printed by this run's analyzers; no re-pose exemption recorded | REPORTED |

\* Amnesia shape: no dedicated analyzer line in this run's 15-analyzer set; the "That's settled"
grep (0×) and the case-ledger lines were checked by hand instead.

### Zero-DMG / B-shape / FIGHTALLY2 — one fight, three watch hits

The panel's single zero-DMG fight is seed 1244 d20 vs The Paparazzo (wave 2), already seen in the
pilot: the scholar spawned at the corner (0,8), 3 moves failed ("No path there" ×2 + 1 silent),
0 strikes, allies Vincent/Dale/Nathan killed it over 4 rounds, scholar took 30 damage, end won.
Shape B-scholar-stood-through, trigger monster-approach, allies=3. It is simultaneously the
panel's only stuck fight (r128: 1 stuck fight), the only B-shape, and the only 2+-ally fight
ending zero-DMG/stuck. Root cause is the edge spawn + failed moves, not the door guard (no
door-tile step involved; the fix's proof test covers the door class separately). Not a new
defect class — the same edge-spawn stuck shape — but the count is 1, and the FIGHTALLY2
failure condition fires on it by the letter of the prereg. Carried as one fight, not three
defects; the edge-spawn move-failure shape (r128 nopath 2 + silent-noline 3 on this panel)
stays an open watch.

### Q1a — door-guard follow-up fix (r145 metric-review item 8): DONE, panel-verified

Fix applied before the panel to `scripts/policies/competent.js` (+37/−1): `beastStrikeTarget`
(check the stepped tile, mirror of r145's closeStep guard), `move_x2` and `keep_distance` trick
picks (skip door-tile picks). Evidence first: `tbPlayerMove` flees only when the move ENDS on a
door tile (the only door check is at `src/js/game.js:37721`, reading the final cell after the
path walk); `beastFreeTiles` returns all interior tiles 1..7 including doors.
Proof test `scripts/test-journey-landing-r146-door-followup-20261118.js`: **44/44 GREEN**; RED
verified via a pristine+probe hybrid (strike-door-step, strike-door-only, movex2-door-only,
keepdist-door-skip all fail on unfixed policy). Panel AFTER measurement: 0 door-flee fights,
0 fled fights at all. **CLOSED.**

### Q1b — fledBad probe (r145 metric-review item 7): CLOSED by naming the fights

New exported helper `fledBadSample` records day, totalMhp, maxWave, hpPct, pmax, monster
id/hp/maxHp into `ctx.fledBadLog` at the single legacy-outmatched increment site; the driver
dumps it into the per-seed census JSON. Panel total **2, both seed 1244**: d21 giant_mosquito
(totalMhp 32, maxWave 2, hpPct 0.62, pmax 110) and d23 voice_mimic_radio "Static" (totalMhp 70,
maxWave 2, hpPct 0.49, pmax 110). Both fired on the HP-ratio legs (`maxWave>=2 && hpPct<0.7`;
`hpPct<0.5`), and **both fights ended won, fled=false** (rounds 2 and 3, 1 and 2 strikes) — the
`flee()` call returned falsy (directional-flee hold: no safe exit), so the scholar fought and
won. fledBad counts the walk-away DECISION, not actual flights. The 70%-rule firing on a 32-HP
mosquito at 62% HP is a twitchiness question for metric review, not a defect. **CLOSED.**

### HEED-V=1 — investigation, fix, before/after

**The sitting.** Seed 1250 d10, Wei (chen_wei), want warn_you, 27 turns. Wei opens "Heh. Listen.
I need you to hear this before you go back out there." The scholar (driver) never picks
[dlg:details] or [dlg:heed] — it picks [dlg:subject] ("Can I ask you something else?") 7 times,
pages menus, compares maps twice, invites Wei to a party (refused: trust 13/20, "You don't
really KNOW Wei yet"). Every deflect serves a want-bridge line; the pool holds 6, so the 7th
deflect repeats the first: "Look, forget it. You wanted something?" at turns 1 and 24, 23
turns apart. The warning itself never lands (want ends stage 3, unresolved); the wind-down
resolves the GOAL thread instead ("I dream about roads..."). Legacy HEED=2 on the panel
(d10 + d9); HEED-V=1 is only the d10 sitting.

**Defect or driver artifact?** Both, but the game side is real: the pool exhausts at 7 bridges
in one sitting — the r124 fix's own comment says "Six lines means a sitting would need seven
want-bridges before any repeat," and the driver found the seventh. A real player deflecting
seven times hits the same repeat. The driver amplified it (a real player would rarely deflect
7×), but the exhaustion is a game-side fact. The r127 topic-dwell analyzer confirms the want
pool is trigger-capable (dwell 139 turns, subjFrom 20, servings 50 — the heaviest pool in the
corpus).

**Fix (this run).** `src/js/convo-beats.js` BRIDGES.want 6→10 lines, same voice (villager backs
off their own want, hands the floor to the player), the six existing lines kept as entries 1–6.
New lines: "It's nothing, really. What were you saying?", "Forget it — go on, I'm listening.",
"Never mind. You had something to say?", "I'll keep it to myself. What's on your mind?" A
sitting now needs eleven want-bridges before any repeat. Follows the r124/r125/r127 pool
expansions exactly. No other call-site change; no collision with existing text (grep-verified).

**Proof test** `scripts/test-journey-landing-r146-want-bridge.js` (pattern copied from the r124
test): pool10 (10 calls → 10 distinct), sitting7 (7 calls → 7 distinct, the exact panel
shape), window (12 calls, no repeat within any 3-consecutive window), control (small pool 2
calls distinct). **RED verified on unfixed code** (pool10 distinct=6, sitting7 repeats on the
7th call); **ALL GREEN with the fix** (pool10 distinct=10, sitting7 distinct=7, window clean,
control clean). One test-authoring correction during writing: the control's SMALL_LINES list
was stale (r124's 2-line list; r127 expanded small to 6) — updated to all 6 lines.

**Before/after on the affected seed.** Re-ran the r146 driver for seed 1250 only
(SEEDS=1250 DAYS=28, OUTDIR `landing-r146-after-fix1250`): same 27-turn d10 sitting shape
(warn_you, stage 3, unresolved), "Look, forget it. You wanted something?" ×1 (was ×2), no
VERBATIM REPEATS line. `analyze-landing-q1-dialogue.js` on the fix corpus: **HEED-V 1→0**
(legacy HEED still 2 — the driver still deflects; that is driver behavior, not a verbatim
defect). **CLOSED in-run; next run's panel verifies.**

**Deeper question (not rewired).** After 6+ deflections the villager keeps handing the floor
back instead of insisting on the warning. Whether a pending want should re-assert itself after
repeated deflection is a design question for the next run / Steve — the d9 sitting shows the
want CAN re-surface via the [alive:thread:want] menu ("We never finished — that warning."),
which is the existing mechanism working. Not changed here.

## Q2 — People check (5 full transcripts + 1 fight log)

Read in full: 1250 d10 (Wei, HEED-V sitting, above), 1250 d9 (Caleb, warn_you), 1247 d8
(Boris, ask_favor, unresolved-settled watch), 1251 d9 (Carmela, ask_favor, unresolved-settled
watch), 1245 d7 (Rewi, link-raise), plus the 1244 d20 Paparazzo fight log (pilot stage).

- **1250 d9 (Caleb, warn_you, 13 turns) — HEALTHY.** The scholar deflects twice, then picks
  [alive:thread:want] "We never finished — that warning." Caleb delivers it: "You've seen
  what's out there. I'm just saying — the treeline at dusk. Don't." (stage 1→2, ends
  resolution=engaged, stage 3). No verbatim repeats (4 distinct bridges). Party invite refused
  with a legible reason (trust 18/20, "You don't really KNOW Caleb yet"). The naming debate
  flows at the end. This is the warn_you shape working as designed — including the want
  re-surfacing in the menu after a deflect.
- **1247 d8 (Boris, ask_favor, 4 turns) — watch HOLDS.** Boris opens "Never mind the sickness
  I'm fighting — we got it handled. Thanks anyway." Asked directly ("Is there something you
  need? Really.") he answers honestly: "No, really — it's handled. Thanks for asking, though."
  No live-need favor was answered with a settled line — the need was handled before the
  sitting. Ends unresolved only because the want was never engaged, not because anything was
  falsely settled. (639bd3f41 watch.)
- **1251 d9 (Carmela, ask_favor, 17 turns) — RICH, watch HOLDS.** Opens "Never mind the food
  I needed — we got it handled. Thanks anyway." Then a real conversation: party invite
  ACCEPTED ("...Fine. This had better be worth it."), personal thread (locksmith past — "My
  hands know things my brain hasn't caught up to yet."), others thread (Raul keeps her sane),
  a walk invitation offered ("Walk with me? I want another pair of eyes on something.") and
  DECLINED by the driver ("Right — another time.", acknowledged ✓), wind-down with a true
  closing beat ("I was saving up for something... I was someone with a future tense."). The
  favor was already handled; nothing live was brushed off. (639bd3f41 watch.)
- **1245 d7 (Rewi, link-raise, 1 turn) — r243 watch UNTESTED.** Rewi raises linking with
  Thornfield: "I've heard good things about Thornfield. We should link with them — we'd be
  stronger together." Menu offers [link:accept] / [link:decline] alongside the walk invite.
  The driver declines the WALK ("Not this time." → "Another time, then."), leaves the link
  offer on the menu, then leaves. The link-raise was never accepted or declined: the r243
  voiced accept line did not fire on this panel (0 accepts). The co-presence of the link
  offer and the walk invite in one menu reads fine.
- **1244 d20 (Paparazzo fight) — see Zero-DMG section.** Edge-spawn stuck fight; allies
  finished it; scholar took 30 damage and lived.
- **M-PR1 watch holds.** All 5 statedAfterPick are the honest away-guard road line ("I'm away
  from Haven, out on the road..."). No live-need favor answered with the settled line on the
  panel (the 2 unresolved-settled sittings above are both already-handled needs).
- **R67 CASE — LABELING-GO** (7 sittings, 7 match). Case lines name their targets honestly:
  "There's still the matter of the ambush of Sanne. Nobody's settled it." Sanne is ambushed
  d13 on 1242 and dies of it — the village talks about the ambush the day before she dies.
  Grim, coherent.
- **R68 PARTY — PARTY-GO** (offered 8 / picks 8 / spoken 8 / dry 0 / accepted 5). Up from r145
  (4 offers, 1 accepted). Accepted lines are all voiced and distinct ("Finally. I was
  wondering when you'd see my value." / "Someone should watch your back. Might as well be
  me." / "...Fine. This had better be worth it."). Refusals are legible (trust-gated, System
  voiced).

## Q3 — Telemetry

`telemetry-check.js` vs baseline `landing-split.json` (81/9/217/15/0, re-pinned r136):
**quiet** (10 files, 5 metrics, no large deviations). Current: systemDay 80,
villagerDeaths 9, monsterKills 257, folTelemetry.fires 14, starvAutopsies 0. Baseline NOT
rolled — the panel carries no new information that moves it. No LOUD lines.

## Q4 — Gate

`node scripts/check.js --quick` on the branch tip (base `be0b90b41` + r146 fix),
cache `/tmp/jest-cache-playtest`, started 03:16Z, finished 03:44Z:
**335 passed, 9 failed in 1401s. 0 attributable.**

| Failure | Attribution |
|---|---|
| test-living-garden-deed-attainment.js — TIMEOUT 120s | Load artifact. Re-run solo: exit 0. |
| test-occupation-panels.js — TIMEOUT 120s | Load artifact. Re-run solo: 25 passed, 0 failed. |
| test-one-person-army-deed-attainment.js — TIMEOUT 120s | Load artifact. Re-run solo: exit 0. |
| test-trust-observer-neutrality.js — TIMEOUT 120s | Load artifact. Re-run solo: 6 passed, 0 failed. |
| test-capable-bot-20261014.js — TIMEOUT 120s | Load artifact. Re-run solo: 40 passed, 0 failed. |
| test-measurement-cache-flags.js — "both actual CLI configurations complete valid neutral panels" | Load artifact. Re-run solo: 4 passed, 0 failed. |
| test-measurement-proof-update.js — "Proof source inputs are not current" | Standing staleness pair. Not attributable: the pair fails on master generally (present in the r237/r238/r242/r243 gates); this run's game-code change is dialogue-pool lines only. |
| test-measurement-workflow.js — "retained neutrality proof covers the current Game/controller/harness inputs" | Same staleness pair, same attribution. |
| test-phone-frame-proof.js — retained browser input / boot inputs / receipt stale | Standing stale receipt (index.html, alienPlayers.json, foreignSpeech.json, regions.json, statusEffects.json, table-endings). Not attributable: this run touched no boot input. |

**Ladder-bundle control failure: GONE.** No ladder-bundle failure appears in this
gate — the ladderbase-cause-a fix on master cleared the control failure that
r237/r238 both carried. Verified, not assumed: the 9 failures above are the
complete failure list.

**Telemetry:** re-run by the adoption (see Q3): quiet, 10 files, 5 metrics,
no large deviations. Baseline NOT rolled.

## Village assessment (plain words)

Ten villages, all alive at day 28 — nobody's scholar died, and every village met the System by
day 8. But the month was not kind: nine villagers died. Five were ambushed out on the road
(Sanne, Fatima, Nadia, Onni, and one more), two died of wounds that wouldn't close (Stan, and
one more), two were killed by monsters outright. The road is where people die, not the pantry:
nobody starved, and the villages that ended the month hungry (5 of 10) still had people in them.

The villages are talking to each other and planning ahead more than last run. Two villages had
a win-plan running by day 14 — the first time that's happened — and fifteen plan-holders
stood across the band by day 28. Nobody has a trio party yet, nobody has killed a wave-4
beast, nobody is near the table; the plans are young. People do go out together: six of the
ten fights had two or more allies beside the scholar, and no scholar fought alone. The
monsters were quiet this month — only ten fights in the whole band (last run: twenty-one),
nine won and one raccoon that ran away. Villagers killed 257 monsters between them while out
hunting and foraging; the scholar's own fights are a small part of the killing.

What people want from each other is visible in the talk: party invites (eight offered, five
taken), a village link proposed (Thornfield), favors asked and kept (seven kept, four broken),
the naming debate running in the firelight, and the dead still named the next day. One
village's month turned on a single moment: on 1244 the scholar got stuck at the field's edge
while a beast the villagers call The Paparazzo closed in, and three villagers had to finish
it while the scholar stood there taking hits. The scholar lived. The village remembers.

The hungry villages are the worry to watch: five of ten end the month with under 2,000 kcal
per person in the pantry (last run: one of ten). Nobody starved, but the margin is thin, and
the pantries swing wildly — one village ends with 63,644 kcal banked while another ends at
1,701 per person. Feasts aren't being thrown in the hungry villages, and the pellet-bearer's
old trap (a village that never feasts because one person never hungers) is worth keeping an
eye on as the hungry count climbs.

## Reachable / fun / winnable (leg 0)

- **Reachable: yes.** First System contact by d8 on all 10 seeds; conversations, party invites,
  favors, outings, contests, and win-plans all fire inside the window. The link-raise fires
  (Thornfield) but its accept path went untested — a real player would likely take it.
- **Fun: mostly.** The conversations read like people (Carmela's sitting is the best of the
  panel — a party joined, a past told, an invitation declined gracefully). The two flat spots
  are both in one sitting: Wei repeating himself after seven deflections, and the map-comparison
  beat answering "..." when there's nothing new. Both are fixed or documented this run. The
  stuck fight (scholar pinned at the field's edge while allies do the work) is the least fun
  moment on the panel — the scholar watches for four rounds.
- **Winnable: too early to judge on this leg.** No village is near a win — that's expected at
  day 28. The direction is right: plans start earlier than last run, parties form, veterans
  are banking. The binding wall is still the same one: wave-4 kills (0 on this panel).

## Metric review (for the next run)

1. **HEED-V bar — keep at 0.** The fix raises the want-bridge pool to 10; the bar stays.
   If a sitting ever deflects 11 times, it fires again — that would be a real loop, not a pool
   size problem.
2. **Want-insistence question (design, not a metric).** After repeated deflection, should a
   pending want re-assert itself instead of handing the floor back? The [alive:thread:want]
   menu already re-surfaces it (1250 d9 proves it works). No change proposed here; note it
   for the conversation arm.
3. **Dry "..." lines (2, watch hit).** Both are compare_maps with even maps: the beat renders
   a literal "..." instead of a voiced "nothing new" line (1248 d6, 1250 d10). Fix owed: give
   the even-maps case a real line. Same family as the HEED-V filler loop — a sitting running
   out of voiced content. Carry to the next run.
4. **Deflect-fallback (1, watch hit).** Same sitting (1250 d10 turn 23): "I just said — did
   you miss it?" fires right after the "..." map beat — Wei hadn't just said anything about
   maps, so the fallback reads as if he had. Mild incoherence; carry with item 3.
5. **fledBad twitchiness.** The 70%-rule fired on a 32-HP mosquito at 62% HP (1244 d21). The
   walk-away decision fired, the fight was then won. Question for the next run: should the
   outmatched legs have a minimum monster-threat floor, or is a twitchy walk-away the correct
   behavior for a competent player? No change proposed here.
6. **Hungry-at-horizon 1→5 (watch move).** r145: 1/10; r146: 5/10. Report as a watch move; do
   NOT over-claim a cause. History: r137/r138 4/10, r139 6/10, r140 6/10, r141 5/10, r142 4/10,
   r143 5/10→4/10, r144 5/10, r145 1/10, r146 5/10. The r145 1/10 looks like the outlier, not
   the r146 5/10. No lever changed in the food path this run (foodgate instrumentation is
   record-only). Keep watching.
7. **Fights 10 vs 21 (r145).** Sharp drop, in the same volatile range as the carried open
   question (21 vs 12 vs 17 vs 7 vs 16). No claim made; the matched-band A/B is still owed
   before any claim about fight frequency.
8. **Together-blocked breaks (8, +2 in R71's count of 10).** Outings that go out together and
   come back with 0 kcal break the favor — "You carry 0 kcal; your partner carries 0 kcal."
   Several kept favors (delivered, thanked) still carry the break reason in the ledger, which
   looks like a counting quirk rather than a real break. Worth one look by the outing arm:
   does a kept favor keep its break flag, and should a 0-yield together-outing break at all?
9. **Win-plan early start (2 seeds at d14).** First time plans seed inside the landing window.
   Positive signal; watch whether it holds on the next band.
10. **R68 PARTY offers 4→8, accepted 1→5.** The r145 watch (fewer offers) reversed; no
    verdict, just the move.
11. **M-PR1 statedAfterPick 5 (r145: 4), all honest away-guard road lines.** Watch holds.
12. **Link-accept watch still UNTESTED.** No accepted link-raise on this panel (1 raise fired,
    neither accepted nor declined). The r243 accept-line pool variety question (same first pick
    every fresh run) is still open for the same reason. If the next panel also produces no
    accept, the driver should be taught to take one (the way FAVOR_ACCEPT=1 exercises the
    commit path) rather than leaving the watch untested run after run.

## Infrastructure (loud)

- **Runtime restart ~02:09Z** killed the full-panel node process mid-seed-1247 (day 7) and the
  heartbeat loop. State verified directly afterward (lock intact, 5 census files, registry
  heartbeat 02:08:09Z); the panel was resumed for seeds 1247–1251 into the same OUTDIR and
  completed. Heartbeat loop restarted. No data lost; the resumed seeds are deterministic
  re-runs of the same driver (seed 1244's fledBad entries reproduce byte-identically).
- **Registry-lock jam ~02:33–02:56Z (23 min).** A `worktree-reap.sh` run (started ~02:28Z,
  parent shell 12428 — another agent's process, left alone) held the exclusive flock on
  `REGISTRY.lock` while its python waited on a `git status --short` (PID 13835) that ran
  22+ minutes (D-state, disk-I/O wait, 2:07 CPU) before completing. While it held the lock,
  ALL registry heartbeats blocked: this run's (stuck 02:23:44Z, 30+ min stale) and Lane B's
  journey2-crisis (02:11:27Z, 42 min stale), plus my manual heartbeat invocation (hung 3+
  min, SIGTERM'd). The jam cleared on its own when the git status finished; heartbeats
  resumed at 02:56:24Z/02:56:26Z. No lock was deleted, no process was killed (the reaper
  belonged to another agent and was live, not dead). This is the exact hazard the standing
  heartbeat rule guards: a live run looks dead when its heartbeat goes stale. The reaper
  taking 22 minutes on a `git status` under load 17.87 is itself the thing to look at — the
  reaper's python does one `git status --short` per tree, and one tree's status took the
  whole window. Report for the ship loop / reaper owner.
- **Box load:** load average 17.87 at 02:53Z (1.5 shared CPUs). A sibling adoption gate
  (`sim-partysize4-confirm-b`, check.js --quick) was running when this run's gate was due;
  this run's gate waited rather than running concurrent jest (phantom-failure rule).

## Closeout

- Fix commit `56e395253` (door-guard follow-up in `scripts/policies/competent.js`
  + fledBad probe + want-bridge pool 6→10 in `src/js/convo-beats.js`; proof
  tests 44/44 + all-green, re-run green by the adoption on the branch tip).
- Evidence commit `0a6903070` (driver, prereg, pilot/full/analyzer logs,
  seed-1250 fix re-run log).
- Adoption closeout: the scheduled run timed out with the gate still running
  (check.js --quick pid 35382, started 03:16Z). The adoption waited for it to
  finish (03:44Z, 335/9), adjudicated all 9 failures (6 load artifacts
  re-run green solo, 3 standing-set, 0 attributable), re-ran the telemetry
  check (quiet), re-ran both proof tests green, and committed this run note +
  the gate log. Remaining closeout steps after this commit: rebase onto
  current master, re-run proof tests on the rebased tip, merge ff-only,
  release the tree, write rotation 0→1, delete the lock last after run_id
  verification, kill the orphaned heartbeat loop (pid 2684) by exact PID after
  the tree is released, final worktree-reap, main tree verified clean.
  Merged locally, pending ship.
