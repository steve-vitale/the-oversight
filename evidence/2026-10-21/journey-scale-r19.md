# journey-scale r19 — THE WITHDRAWN SEAT (2026-10-21)

**Run id:** 2026-10-21T13:00:09Z (oversight-playtest-loop, LANE A, leg 3 scale).
**Base:** master 7554f2c6a (worktree `journey-scale`; branch base == master tip at registration, verified).
**Rotation note:** journey-rotation-a.txt read "3" at run start (r18's note claimed it wrote back "0", but the file held "3", mtime 12:57 UTC — the write-back didn't stick). This run plays leg 3 and writes back "0".

## INFRA (fail-loud, recorded)

- Main-tree pre-flight: clean (`git status --short` empty). Disk 22%. Reaper: 4/16 active (sim-wave4hunt2, sim-windowstay2, sim-heraldsplit, journey2-social lane B), none touched. Lane B's lock (playtest-loop-2.lock) was active — different rotation file, no coordination needed.
- Git EPERM probe (`git update-ref refs/heads/probe HEAD`) passed before registration.
- Worktree registered via scripts/worktree-register.sh with WT_RUN_ID=2026-10-21T13:00:09Z (lock/registry run_id agreement). Heartbeat loop every 10 min for the whole run (registry shows fresh heartbeats).
- **STASH INCIDENT (LOUD, my fault):** while verifying the nv-winddown proof test RED, I ran `git stash push -- <file> -m <msg> -q`; this git parsed the flags as pathspecs, the push failed, and the `;`-chained `git stash pop -q` then bare-popped a SIBLING'S stash (stash@{0}, "WIP on region-wave1-southasia") into my worktree, conflict-marking 7 data files I never touched. Recovered via `git checkout HEAD -- <7 files>` (stash entry kept — never drop others' stashes; verified still listed). Lesson reinforced: never bare-pop, never chain pop with `;`. RED was instead verified from the earlier pre-fix probe (/tmp/nv-test2.js); GREEN re-confirmed post-recovery. No sibling work was lost or committed.

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any play or code change)

**Leg question:** when a seated run's deeds slip below the bar after the announce, does the deed re-check withdraw the seat aloud at dawn, name the loss honestly, and re-extend the invitation aloud on re-earn? And does breaking every link withdraw it, or does the Regional Dawn stick?

**Why this:** r18's named-next — "force the seat-withdrawal path (deed re-check with a failing seat during a long wait) and verify the withdrawal beat fires aloud." Code survey before the run established: the lesser seat's only regressable bar in the scale window is the integration stage (waves/contests/crises/food-deeds monotonic; networkLive never clears, so scale loss can't drop the seat); integration drops only via favor refusal (−3, comms.js) or aid-quest expiry (−2, days 7–21 only).

**Arms (R19_ARM, per seed):** defiant (refuse every System favor; use the System relay in crises to rack up owed favors — real verbs, real costs; pay favors after any withdrawal to re-earn) / gambit (breakLink('gambit') on every active link after the announce) / control / control.

**Binding metrics:**
- M1 staging — table announced on ≥2/4 seeds (substrate: r16 5/10, r17/r18 4/4). A seed that never announces is replaced, never a miss.
- M2a defiant — IF integration drops below 40, the withdrawal beat fires aloud at the next dawn (copy captured, tableWaiting=false state-verified, no silent flip). If integration never drops below 40, the arm reports refusal count + final integration (no miss — reachability is the finding).
- M2b gambit — breaking all links does NOT withdraw the seat (pre-registered: networkLive sticky); the audit's rank line is captured for the design question.
- M3 proof — scripts/test-tablewithdraw-20261021.js GREEN (deterministic beat + re-fire).
- M4 people — ≥4 full transcripts sense-read, 0 senseless flags.
- M5 survival — villages alive+coherent at the decision day.

**Interesting-finding bar:** the withdrawal voice in a real run; the re-fire behavior; how many refusals it takes to slip the seat; whether the gambit arm's audit flatters.

**Horizon:** DAYCAP=185, death-aware (+10d tail max). **Seeds:** 19001–19004, then 19005–19008 (replacements). **Policy:** belongfeast-watchfeast (FEASTSCALE_R13=1). The Binding 'swear'; the Watchers 'feast'.

## HARNESS

`scripts/journey-scale-r19-20261021.js` (built by auditable `scripts/make-r19.py` from the r18 instrument; `node --check` clean): per-seed arms, favor-refusal + relay-use forcing, all-link gambit break, withdrawal watch (r18's), re-fire watch (new: the TABLE RE-FIRE line must come back aloud), arm-aware sitting, r19force log (added to evidence JSON via a make-r19.py fix mid-run).

## RESULTS

### M3 proof — GREEN (deterministic)
`scripts/test-tablewithdraw-20261021.js`: constructed lesser-seat deed profile → seat 'lesser' at integration 45; slip to 39 → seat 'none'; the dawn check (`tableAnnounce`, exactly what ledger.js's endDay wrap calls) fires the withdrawal beat ALOUD ("does not come… YOUR CASE IS NOT COMPLETE. THE DEEDS ARE NOT ALL DONE. WE WILL… RESCHEDULE. The table is withdrawn — for now. It will be set again when the deeds are done.") with tableWaiting=false, tableAnnounced=false, tableDone=false; re-earning (integration 45) re-extends the invitation ALOUD via checkArc's TABLE RE-FIRE. Documented: the withdrawal copy does NOT name the failed bar.

### M1 staging — GO (6/8 announced; 2 replaced per the pre-registered rule)
19003 (control, arc 3, seat none — never qualified) and 19004 (control, died d38) replaced by 19007/19008. Final corpus: 19001, 19002, 19005, 19006, 19007, 19008 announced.

### M2a defiant — the seat is practically unloseable (the finding)
- **19001** (announced d101, died d106): integration 100 at announce; no favors came due in the 5-day window. No slip possible.
- **19005** (announced d90, sat d125, survived d178): the aggressive defiant — 5 relay uses (d102–113) racking up owed favors, 4 favor refusals (d110–120), integration 100→91, stage stayed 3. The seat never slipped. **Natural re-integration fought the refusals** (integration rose 91→94 between refusals via the policy's normal integrate() calls).
- The math: slipping the seat needs integration <40 (stage 2→1). From a typical 60–100 at announce that's 7–20 refusals at −3 each, each requiring an owed favor (crisis relay use) plus a ~4%/day collection — against natural re-integration. **The withdrawal-via-integration path is reachable in code (proof GREEN) but practically unreachable in play.**

### M2b gambit — confirmed: the Regional Dawn sticks (pre-registered expectation holds)
- **19002** (announced, gambit d91): broke the only link; sat d95, seat 'lesser'. No withdrawal. Audit: "regional standing" with zero active links.
- **19006** (announced d138 at GLOBAL, gambit d138): broke the link; the realm dissolved aloud (nationalLive/globalLive cleared — the machinery died with the realm, per the break-it r4 law); rank fell to 'regional' (networkLive sticky), never 'village'. Sat d141, seat 'lesser', audit "regional standing."
- The seat bar's scaleOk (regional+) survives the vassal's gambit by construction. Whether "regional standing" is honest for a linkless village is a Steve-call (see BLANKS).

### M4 people — GO (6 transcripts sense-read)
- **Patricia d100 (19001, mechanic, grieving, trust 48):** "what do you miss most" → soup → shutters when pushed → opens up (Vancouver mornings, coffee, being bored) → "Talking helps. Then it hurts. Then it helps again." Want engaged. PASS.
- **Rosa d80 (19002, piano tuner, grieving, trust 80):** belief after Eleuterio's death — "That's not naive. That's load-bearing." → levels out when pushed → "I believe in breakfast. In people showing up. Small, provable things." PASS.
- **Sean d100 (19003, gardener, trust 92):** seek_taken — wants news of taken kin → "I'll ask the System about the pods" → "Thank you. Really. Even asking is more than the silence." Promise persists. PASS.
- **Pedro d120 (19005, carpenter, trust 90):** seek_comfort — "I'm not okay. I'm saying it out loud so it's real" → stays by the fire → "I keep count of who's at the fire… I just notice the gaps" → "Walk my trap line with me?" Resolution comforted. The quality bar being met. PASS.
- **Amina d100 (19002, Twi-only, midwife):** 8× nv:nod spam by the driver → 8 polite nod-backs, no close (driver hit its 8-turn cap). Driver artifact, but it exposed the real blank below. Coherent for a language barrier; the blank is the missing winddown. See BLANKS.
- **Amina d140 (19006, sardonic midwife):** "People are saying things. About you. Is any of it true?" (two days after the vassal's gambit — the gossip is ABOUT the gambit) → "I wish there was more to tell. That's it." The rumor content never lands; want ask_favor resolves 'unestablished'. Honest fizzle, borderline PASS — noted.

### M5 survival — GO
19005/19006/19007/19008 survived to d170–186 as going concerns. 19001/19002 lost their villages (d106/d109, pop 3/0 — combat, contests, sickness, starvation; ordinary attrition, 6 bearer deaths each — heavy churn but no death spiral mechanics).

## FINDINGS

1. **The withdrawal beat works and the re-fire honors the promise (proof GREEN) — but the seat is practically unloseable in real play.** The only regressable bar (integration stage) needs ~7–20 favor refusals against natural re-integration; scale loss bottoms out at 'regional' (networkLive sticky). The beat is honest defense-in-depth that never fires. The design question for Steve: is the seat MEANT to be unloseable once earned ("the table prices the run's history"), or should "relative until entered" have teeth (a bad week between qualify and sit can cost the seat)?
2. **The vassal's gambit burns the realm but keeps the seat.** 19006's realm dissolved aloud (national/global cleared, machinery died), rank stuck at 'regional', audit said "regional standing" with zero links, and the table sat them. Narrow blast radius (only the seat bar + audit line read the sticky rank), but the audit line is arguably flattery — the exact thing r18's metric watched for.
3. **Natural re-integration fights defiance.** 19005's integration rose between refusals. A player who refuses the System is simultaneously re-integrated by playing well — the two systems pull opposite directions, and integration wins.
4. **The nv winddown was dead (fixed).** The budget-landing winddown beat queued in heldBeats but the nonverbal thread offers no 'goon' continuer, so it sat queued forever — gesture-spam looped without end. Fix: the turn after queueing surfaces the gesture beat and arms windingDown; the next gesture closes naturally. Proof RED→GREEN (RED from the pre-fix probe; GREEN post-fix; identical pre-existing failures on pristine vs fixed for the old convo suites).
5. **Aggressive favor refusal is speakable.** Every refusal got the "Integration slips" line; the relay-use got the "favor owed… keeps books you can't read" line. The causal chain a player would experience is fully voiced.

## VILLAGE ASSESSMENTS — in plain words

- **19001 (defiant, announced d101, lost d106):** bled the whole run — 6 bearer deaths (dehydration ×2, sickness, contest, combat, starvation), sat nothing, died with 3 left. The early game killed it, not the forcing.
- **19002 (gambit, announced, sat d95, lost d109):** broke with the kingdom (gambit d91, "Haven broke faith"), sat the table as a free fire with a lesser seat, then attritioned out (6 bearer deaths: starvation, combat, the night, contest, sickness, the expedition). A complete arc: court → break → sit → die.
- **19005 (defiant, announced d90, sat d125, survived d178):** the healthiest — 6 alive at the end, 41 days of national, the full defiant forcing (5 relay uses, 4 refusals) without ever slipping the seat. The village that tested the beat hardest.
- **19006 (gambit, announced d138 at global, sat d141, survived d186):** the late bloomer — national from d85, global, then the gambit burned the realm at d138 and the table still sat them at d141 as "regional standing." 7 alive. The realm-dissolution aftermath, played.
- **19007 (control, sat d90, survived d170):** global, national 106d, 7 alive. The smooth road.
- **19008 (control, sat d90, survived d178):** global, national 64d, 9 alive. The smooth road.

## REACHABLE / FUN / WINNABLE (scale leg, the withdrawn seat)

- **REACHABLE:** the withdrawal beat is code-reachable (proof) but not play-reachable in any reasonable window — a player would need ~20 favor refusals. The gambit path is fully reachable and behaves exactly as coded.
- **FUN:** the defiant forcing was all voice — every refusal and relay-use spoke. The gambit's "Haven broke faith" + realm-dissolution + still-sat table is a real story.
- **WINNABLE:** the seat, once earned, is effectively locked — no trap, no silent loss. Whether that's the right call is Steve's (finding 1).

## METRIC REVIEW (§14)

- M2a was pre-registered as conditional (IF integration <40) — the condition never obtained; per the pre-registration this is a finding (unreachability), not a miss. No metric re-scored.
- M1's replacement rule applied as written (19003/19004 → 19007/19008).
- The r19force log was missing from the evidence JSON on the first pilot batch (harness wrote it to ctx but the serializer didn't include it); fixed in make-r19.py and regenerated — instrument-only, no game change.

## TELEMETRY

`telemetry-check.js` vs `scale-belong.json` (8 seeds, 10 metrics): 4 LOUD lines, all investigated same-run. **No game-code change in r19's sim phase** (only scripts/), so no line can be a game regression:
- `markerCounts.binding swung 100% (38 → 76)`: EXPLAINED — seed variance; 19005 (long-lived defiant, d178, heavy relay/courtship activity) contributed 37 of 76. Others 0–16.
- `markerCounts.demand disappeared (251 → 0)`: EXPLAINED — instrument gap (r14–r19 family defines no demand marker; the 251 comes from an older baseline corpus). Same as r16/r17/r18.
- `tableTele newly appeared (0 → 4)`: EXPLAINED — `table_entered` fires at each sitting; r19 sits the table (5 sittings).
- `fightsTotal swung 81% (112 → 203)`: EXPLAINED — 4 seeds survived to d170–186 (longer runs, more exposure) vs the baseline corpus.
Baseline NOT rolled forward.

## BLANKS

1. **FILLED — the dead nv winddown (game-code fix).** Nonverbal conversations queued their budget-landing winddown beat in heldBeats, but the nonverbal thread offers no 'goon' continuer, so the beat never surfaced — gesture-spam looped forever. Fix (src/js/conversation.js, +17 lines, purely additive): the turn after queueing surfaces the gesture beat and arms windingDown; the next gesture ends naturally. Proof: scripts/test-nvwinddown-20261021.js — RED on pre-fix code (queued at turn 3, never surfaced/ended through turn 8), GREEN after (queued 5, surfaced 6, ended 7). Old convo suites show identical pre-existing failures on pristine vs fixed (test-detective-nonverbal 15/6 both ways; test-conversation-dialogue-20261006 FATALS on missing dialogueBeatKind — pre-existing). Ontology: 123/123.
2. **Documented — the withdrawal copy doesn't name the failed bar.** "THE DEEDS ARE NOT ALL DONE" when the deeds were done and the integration slipped. Proposal (not implemented — the beat never fires in play, so this is moot until finding 1 is decided): name the regressed bar from seat.detail (stage/rank/waves).
3. **Documented — the sticky Regional Dawn (Steve-call).** networkLive never clears; breaking every link leaves scaleRank 'regional' and the audit says "regional standing" for a linkless village. Either the Dawn is un-losable by design (the region remembers you) or the seat bar should read live standing. Narrow blast radius (seat bar + audit line only).
4. **Documented — Amina d140's undelivered gossip.** Two days after the vassal's gambit, "People are saying things. About you" never names the thing (the seeded broke_faith gossip). The rumor content exists in the gossip system; the conversation surfaces only the shape. Candidate for a social-loop run.

## FILES

- Harness: `scripts/journey-scale-r19-20261021.js` (built by `scripts/make-r19.py` from the r18 instrument; `node --check` clean)
- Proofs: `scripts/test-tablewithdraw-20261021.js` (GREEN), `scripts/test-nvwinddown-20261021.js` (RED→GREEN)
- Fix: `src/js/conversation.js` (+17, nv winddown delivery)
- Evidence: `evidence/2026-10-21/journey-scale-r19-belongfeast-watchfeast-1900{1,2,5,6,7,8}.json` (19003/19004 replaced per M1) + 20 transcripts (6 sense-read)
- No src/js changes beyond the conversation.js fix. Merged locally, pending ship.
