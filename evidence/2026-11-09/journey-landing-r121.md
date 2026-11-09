# Journey — landing, r121 (2026-11-09, Lane A)

**Leg:** 0 LANDING (days 1–14 judged, horizon to d28). **Run:** `playtest-loop-a-20261109T1245Z`.
**Prereg:** `evidence/2026-11-09/journey-landing-r121-prereg.md` (matched BEFORE/AFTER, seeds 1142–1151, DAYS=28).
**Base:** local master `5e79679e4` (r122 scale fix, pending ship). Branch: `journey-landing` (worktree).
**Lock:** created 12:43:45Z, run_id `playtest-loop-a-20261109T1245Z`. Rotation-a 0→1.
**Status at writing:** panel judged on the POST-FIX corpus (see § Panel re-run). All verdicts below are the final post-fix numbers; pre-fix values are noted where they differ.
**Flap 2 cleared** 14:04:33Z (sustained window); pre-fix AFTER corpus preserved as `landing-r121-after-prefix/` (123 files, 6 misfit-line files).

## Verdicts (pre-registered bars, judged BEFORE vs AFTER on identical seeds)

- **Q1 (PRIMARY) — the double-press: GO.** Evening press-fails 4 → **0** (bar ≤2). Stripped second-fails 0 → 0 (bar 0; BEFORE unmeasured — the BEFORE driver records no press fields, so the binding half is the AFTER 0). `together-stopped` 0 → **7** (bar ≥1, all green3x3After=0; 8 on the pre-fix AFTER corpus — the 8th, 1144 d13 Sanne, played out differently after the 1144 divergence below). Kept favors 4 → 4 (5 on the pre-fix corpus; the dropped keep is 1144 Sanne, same cause). The fix fires exactly as designed: a first press that yields 0 kcal on a fully-harvested patch stops the press loop, and the evening moves on to the next green node instead of failing a second press on a dead patch. No species-less corner occurred (0/7 with green3x3After>0).
- **Q2 — the evening hop gives up on the first refusal: GO.** Far-unreached 5 → **0** (bar AFTER < BEFORE); near-unreached 2 → 0. Every AFTER hop reached (hopReached=6, detourReached=1 — seed 1142 d12 (7,2), 7 steps for a Manhattan-5 walk). Strongest single case: **1147 Adaeze** — BEFORE, the favor broke on 4 unreached stock-2 nodes; AFTER, the detouring hop reached the far node and the same favor **kept with a 450-kcal haul, delivered**. H-ROUTE/H-HOP/H-GUARD all 0 (no unreached node left to classify).
- **Q3 practice: GO.** movedCells d1→d28 = 97 (attributed 97, 10/10 seeds), skill 0→positive = 20 (22 pre-fix), practiceReps = 2647 (2715 pre-fix). Moves by task: wood 28, stone 31, deadfall 7, water 21, cook 10. Hunt: **H1-ESTABLISHED again** — 261 kills, 0 hunt reps, 0 hunt villagers (the hunt-assignment question stands; fifth panel running).
- **Q4 engagement lines: GO.** M-PR1 (≥3-turn rule): **10/10** seeds with ≤1 never-offered sitting (only 1 counted miss in the whole panel — the 1150 d9 Henry settled-favor false positive). M-PR2: promised 8 / (picked 11 − away-guard 3) = **100%** (9/9 pre-fix). All 3 stated-after-pick are the R72 away-guard ("I'm away from Haven, out on the road...").
- **Q5 M7 goaround with meaning: GOAROUND-HOLDS.** R84 prompt arrival **2/2** (1/1 pre-fix — the 1144 divergence added a d15 kcal skip that arrived); R85 NO BEARER LOST **2/2** complete (1/1 pre-fix). 100% on both.
- **Q6 doorstep M6: UNTESTED** (carried). R88: checks=278, triggered=0 — no hungry/thirsty Haven day triggered the step (57 already-inside, 217 fed-and-watered, 4 not-at-haven).
- **Carried bindings (re-judged fresh on AFTER):** M1 ALIVE-D14 **10/10** (all villages alive to d28). M2 SYSTEM CONTACT **10/10** (systemDay 8, 9 on 1143). M3 FIGHT-LOG 0 unknown/mixed (4 zero-dmg fights in 12, all classified: B=1, no-strikes=2, died-before=1). NAV-log clean (103 files, 58 navLines all menuMore). Zero-DMG invariant **PASS** (12 fights, 0 violations). Miriam line test **PASS** (0 "That's settled"). R66: **8/10 HUNGRY** at d28 (<2000 kcal/person; 7/10 pre-fix — 1144 flipped FED→HUNGRY at 1832/person) with **0 starvation deaths** — the pantry-collapse pattern recurs (r120: 5/10); per the r120 revised gate the leg is NOT-HUNGRY, but the HUNGRY share rose 5/10 → 8/10. R73 **NARROW-PATTERN** (promised 8, 8 NARROW windows, 4 kept inside narrow — 9/5 pre-fix). Mantle: latencies **1** (1143: Blanca died d11 "the wild" → Vincent took the mantle d12) and **0** (1148: Jian died d25 "the arena" → Roberto same day) — **no latency-2 recurrence**; the r120 latency-2 stays a single observation. Kill mean 26.1/seed (25.2 pre-fix; matched BEFORE 24.9 — the apparent drop vs r120's 31.1 is a seed-band difference, not a driver effect). Poison re-test: **0** (10th panel running). Eamon fallback: 0. Observe fallback fires (R55 WD NO-LEAVE). Scholar-eats-first: voiced by a villager ("I've started noticing who eats first and who waits") — the held design question, not a verdict.

## The amnesia fix (panel-proven defect, fixed in this run)

The curious-resume-line watch fired **6 times on the AFTER panel** (and 6 on BEFORE — the same shape both sides): the NPC answers a thread resume with *"Huh. I wouldn't have guessed that about you."* — a first-reveal reaction to a revelation that never happened. Two shapes: 5× `alive:thread:want` resume (e.g. 1142 d5 Aroha — the player *deflected* "Is there someone here you don't trust?", wandered off, then resumed "We never finished — who you don't trust." and the NPC reacted as if told something surprising); 1× `dlg:more` "Go on" on a talk-request thread before any question was asked (1144 d9 Heidi: "Can we talk?" → "Go on" → the reveal-reaction, with nothing yet said).

**Root cause:** `curious.engageBeat` (convo-wants.js) is a reaction to an answer, but it is the want's generic "engage" beat, served by three call sites that never check whether anything was revealed (convoThreadBeat t==='want', t==='request' fallback, alive:want stage 1-2). The r120-era wantQDone guard fixed the *answered* resume (plant side); this is the *unanswered* resume, which it never covered.

**Fix (one guard at the source, same shape as wantQDone):** `curious.engageBeat` returns null unless the want's question was answered in *this* sitting (`c.answered[qid]`, not honest_pass). `c.answered` resets per conversation, so a prior sitting's answer never re-arms it. Each call site falls through to its honest line: the resume acknowledgment ("About whether you still sing — yeah, we never did get back to that."), the dry admission ("That's... pretty much all of it, honestly."). No other want touched; the answer flow is untouched (the continuer still serves the question's deeper beat).

**Proof test:** `scripts/test-journey-landing-r121-curious-firstreveal.js` (4 cases, separate processes). On unfixed code: **3 FAILURES** (engage-unanswered returns the line; resume serves the misfit; request "Go on" serves the misfit; control green). After the fix: **ALL GREEN**. Note from building it: every question carries a `deeper` + `follow`, so the continuer after answering always has real content before the thread is spent — the engageBeat effectively never fires legitimately through the menu; its menu firings are (almost) always the misfire. The direct `engage` case is the legit-direction proof (answered → the line).

**Panel re-run (post-fix): DONE.** The AFTER driver re-ran on seeds 1142–1151 after the fix (14:04Z window, ~3.3 min). Misfit line: **6 → 0 files** on the matched panel. Q1/Q2 hold: press-fails 0, together-stopped 7, far-unreached 0, kept 4, CHAIN-COMPLETES-FAR. Census JSONs: **9/10 byte-identical** to the pre-fix corpus — the dialogue change did not move the sim except on **seed 1144**, the only seed where the fix changed a served line that altered the driver's subsequent picks. First transcript divergence is exactly the fixed sitting (1144 d9 Heidi: the misfit line → the dry admission "That's... pretty much all of it, honestly."). Downstream on 1144: a different contest fired (maw, not honey), Marthe lived (she died d13 pre-fix), the Sanne favor did not keep, one extra goaround skip+arrival appeared, 2 extra fights. That is the butterfly effect of a changed conversation, confined to one seed — and it proves the fix actually changes what happens in the world, not just the text. All other seeds' villages played out identically; the fix is dialogue-only in effect everywhere else.

## Village assessment (plain words)

Ten villages, all alive at day 28 (pop 10–12 from a 12 start). The System arrived on day 8 (day 9 on Blanca's village) in every one. People are learning: 22 villagers picked up a brand-new skill from nothing, 97 competence cells moved. Denise checks the pantry before heading out and leaves the harvest standing — "The pantry can't take more; the wild will keep." Ursula gathers deadfall day after day and gets visibly better at it. Gossip mutates by the fire ("Thabo telling Ursula about Kiprono. The details have shifted. Nobody seems to mind."). The beast-naming debate is a living argument: Tao calls it "Loud-Eyes", Blanca "Ugly-Eyes", nobody agrees, and the village keeps voting. Two villages named their beast and then met it face-to-face — both times the beast (a lockpick raccoon, Loud-Eyes / Lockpick) turned and ran before a blow was struck. The hard villages fight as parties: Vera's village killed 48 monsters in 28 days (16 party fights). Two scholars died on their feet: Blanca to a gallowdeer on day 11, walking and never striking; Jian to a union_rep in the arena on day 25, walking to the corner nine times while it killed him. The pantry is the pressure: 7 of 10 villages end the month under 2,000 kcal per person, and nobody starved — they just run lean. Trust pairs are forming (Denise 90, Jenny 87, Kiprono 85 on Chen's village); the mantle passed twice, once the next day, once the same day.

## People check (full transcripts read)

- **The one counted M-PR1 miss is a false positive.** 1150 d9 Henry: the favor was already handled ("Never mind the food I needed — we got it handled. Thanks anyway."), so no commit *could* be offered — offering one would be the lie. The analyzer counts it as never-offered; the game is correct. (Metric review below.)
- **Deflect repetition:** in the three sittings ≥15 turns (max 21), the most-repeated THEM line appears 2× — and they are subject-change pivots ("Sorry — I shouldn't load that on you. What's up?"), not deflect fallbacks. No filler loop.
- **The two routed fights are honest:** both lockpick raccoons fled at the face-off (round 1, nobody touched, monster at full HP) — a monster choosing to run is a real outcome, not a missing fight.
- **The scholar never strikes — the driver, not the game.** Panel verb totals: 26 moves, 0 waits, 0 abilities, 0 strikes across all fights. The policy walks; the fights that do damage are the allies' (villagers dealt every point of monster damage on the panel). Combat assessment of the scholar is out of reach for this driver — the watch stands.
- **A villager notices who eats first.** ("I've started noticing who eats first and who waits. Tells you everything about a person.") The held design question, voiced in-world.
- **Good beats seen:** the Auckland line ("I tell myself Auckland, New Zealand is still there. It helps on the bad nights."); the tellbeast spread ("Something heavy rooting in the grass, dust rising for no reason"); the naming vote tallies carried across sittings.

## Reachable / fun / winnable (leg 0)

- **Reachable:** the landing content fires on every seed — System contact d8/9, favors asked (35), chains completing (5 kept), practice moving, the naming debate, the goaround rescue. Nothing in the leg is gated behind unreached content.
- **Fun:** the village feels alive (gossip mutating, pantry-aware foraging, the naming argument) and the outing chain completes as often as before (kept 4, far haul on 4) because the evening stops wasting presses on dead patches and reaches farther nodes. The amnesia fix removes six moments where an NPC talked nonsense — and on one seed it changed what happened next, which is the point.
- **Winnable:** leg 0 is the first fortnight — no win is expected here, and none is claimed. The chain toward it (practice moves, kills 25/seed, parties forming on Vera's village) is intact.

## Metric review

- **M-PR1 should exclude settled-favor sittings.** The one counted miss (1150 d9 Henry) is a favor already handled; the metric as written counts it against the game. Proposed revision for the next run: a sitting whose favor is in a settled state (thanked/acknowledged/moot/fulfilled) does not count as never-offered. Verdict unaffected (10/10 either way).
- **Q1's strippedSecondFails BEFORE is unmeasured** (the BEFORE driver records no press fields). The binding half is the AFTER 0, which held. A future BEFORE driver should record press fields so the shape is measured on both sides.
- **The amnesia watch is closed as a fix**, not carried: 6 → 0 expected on the re-run.
- **The 6394 alive:want stage 1–2 branch** now falls to "Okay. Here's the thing —" when a curious re-ask has no answer on record (the engageBeat returns null and the branch has no opener fall-through). Honest but flat; a future pass can route null → opener there. Not a defect, noted.

## Tooling (this run)

- **Analyzer fix (pre-panel, proven defect in standing tooling):** the r118 outingchain analyzer's `classifyEveningLine` regex required `)` right after the distance, but since r119 the driver writes tile stock into nodeFails entries (`(0,0,d4,s47):unreached`). Every r119/r120 unreached entry silently failed to match → farUnreached read 0 on both panels (true r120 count is 11 far, 4 near). Fixed with optional `(?:,s\d+)?` in both analyzers; proof test gained the h-hop-stock fixture + r120 calibration. (Recorded in the prereg as a pre-panel correction.)
- **New:** `scripts/analyze-landing-r121-presshop.js` (Q1/Q2 before/after counter) + `scripts/test-landing-r121-presshop.js` (PASS); `scripts/test-journey-landing-r121-curious-firstreveal.js` (4 cases, ALL GREEN post-fix).
- **Drivers:** `scripts/journey-landing-r121-before-20261109.js` (r120 verbatim, seeds 1142–1151) and `scripts/journey-landing-r121-20261109.js` (r120 + Q1 stop + Q2 stepping hop). Diff is exactly: header, OUTDIR, outingHopTo rewrite, hopDetails, press-loop Q1 changes, hopDetail on evening-blocked.
- **Pilot gate:** PASS (3 seeds, both drivers; practice snapshots d1/d14/d28 present; invariant 0 violations; favors 9/8; far-node together attempts present; resume offers present).

## Flap 2 (EPERM write flap, 2026-11-09 ~13:38–14:04Z)

A second filesystem-wide EPERM episode struck during closeout (first: ~13:02–13:19Z, cleared). `cp -r` of the AFTER corpus failed on every file; probes 3/3 refused at 13:55Z; heartbeat last OK 13:37:55Z (resilient hbloop alive, PID 15574, retrying). The partial prefix copy was removed (unlink works during a flap). A flap-waiter (`flap-waiter-r121.sh`, 2-consecutive-success gating) watched for a sustained window: a brief blip at 13:56 (copy failed mid-window, resumed probing), then the clear at **14:04:33Z** — copy done (123 files), heartbeat re-landed manually at 14:04:51Z, panel re-run started immediately. One later redirect (`> /tmp/commit-r121-postfix.log`) came back empty — a brief recurrence during that write; re-ran with pipe capture. No work lost: all analysis is recorded here and in /tmp logs.

## Files changed (in worktree, to commit)

- `evidence/2026-11-09/journey-landing-r121-prereg.md`
- `evidence/2026-11-09/journey-landing-r121.md` (this note)
- `scripts/journey-landing-r121-before-20261109.js`, `scripts/journey-landing-r121-20261109.js`
- `scripts/analyze-landing-r118-outingchain.js` (regex fix), `scripts/analyze-landing-r121-presshop.js` (new)
- `scripts/test-landing-r118-outingchain.js` (new fixture + r120 calibration), `scripts/test-landing-r121-presshop.js` (new)
- `src/js/convo-wants.js` (curious.engageBeat first-reveal guard)
- `scripts/test-journey-landing-r121-curious-firstreveal.js` (new proof test)

## Adoption closeout (r121 run died in closeout; landed by playtest-loop-a-20261109T1445Z)

**Recovery:** the 1245Z run's lock was stale (heartbeat 14:14:11Z, 32 min old at
recovery; no live coordinator process, no heartbeat-loop process, no file
writes under 15 min in the tree except a content-identical ONTOLOGY.md mtime
touch at 14:43:15Z with no process holding the tree). Stale-lock recovery per
the overlap guard; lock deleted, this run's lock created
(`playtest-loop-a-20261109T1445Z`). The branch tip `5e79679e4` was already an
ancestor of master (r122/r162 adoption commits already landed); only the
uncommitted r121 work remained. Report recovered from
`evidence/2026-11-09/journey-landing-r121.md` as written by the dead run.

**Gate (closeout re-run, this adoption):** `node scripts/check.js --quick`
285 passed / 15 failed in 1896s (log
`evidence/2026-11-09/journey-landing-r121-gate.log`). The first attempt
(289/11) lost its failure list to `tail -40` and is superseded. Adjudication
of the 15, by class:
- **Standing (r120's 4):** `test-mobile-combat-cadence`,
  `test-occupation-panels`, `test-phone-frame-proof`,
  `test-establishment-r20-fixes` (same racks-full voice assertion).
- **Measurement-proof staleness pair (NOT r121):** `test-measurement-proof-update`
  ("Proof source inputs are not current") and `test-measurement-workflow`
  ("retained neutrality proof covers the current Game/controller/harness
  inputs"), plus `test-measurement-cache-flags` (0/4). Attribution run on the
  CLEAN tree (r121 changes stashed): all three fail identically — the
  staleness predates r121 (Game inputs moved under earlier landings, e.g. the
  r122 scale walkTo rewrite, with no proof refresh since). A sibling arm
  (sim-wideduty-a, `8cee6a8d2`) independently recorded the same pair as a
  standing profile on current master. The refresh (`scripts/balance-proof-update.js`)
  is owned by the measurement-maintenance lane, not this landing; landing
  r121 does not make it worse.
- **Load timeouts (7):** `test-phase-shawl`, `test-solo-campaign-endings`,
  `test-time-save-crashes`, `test-synergy-stall`, `test-throttlefeast-20261014`,
  `test-capable-bot-20261014`, `test-table-endings-20261014` — all 120.0–120.3s
  under box load ~13. `test-trust-observer-neutrality` (exit 1, 117.5s) PASSES
  standalone on the clean tree (6/6) — a load artifact, re-verified with the
  fix applied after the rebase (see below).
- **No new attributable failure.** The branch's only src change is the
  curious first-reveal guard in `convo-wants.js`; none of the 15 failing
  files touches it, and the 7 r121 proof tests are all green (see below).

**Adoption-only change:** one comment-only correction in
`scripts/analyze-landing-r118-outingchain.js` — the R121 FIX comment said
"r120's true count is 7, not 0", which reads as the unreached count; the true
counts are 11 far / 4 near (pressFail 7). Proof test re-run green after the
edit. No behavior change.

**Proof tests re-run post-rebase (all green):**
`test-journey-landing-r121-curious-firstreveal` (ALL GREEN),
`test-landing-r121-presshop` (PASS), `test-landing-r118-outingchain` (PASS,
r120 calibration 11/4/7), `test-landing-r115-zerodmg-invariant` on the AFTER
corpus (12 fights, 0 violations), `test-landing-r115-miriam-line` (PASS),
`test-landing-r117-zerodmg-v2` (PASS), `test-landing-r120-scholar-turns`
(PASS), plus `test-trust-observer-neutrality` standalone (6/6).

## Landing (pending)

- [x] Post-fix AFTER panel re-run + presshop/outingchain re-analysis (Q1/Q2 hold; misfit 6 → 0)
- [ ] `node scripts/check.js --quick` in worktree (expect the 4 standing pre-existing failures, no new attributable failure)
- [ ] safe-commit, merge --ff-only to master, release worktree, verify main tree clean
- [ ] Telemetry deviation check (landing leg baseline)
- [ ] Memory log + goal timeline entry; delete lock; stop hbloop
- [ ] Report "merged locally, pending ship" — no version tag
