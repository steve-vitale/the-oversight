# Journey — Scale r251

**Run:** `playtest-loop-a-20261122T2145Z`, scheduled 15:45 CST Sun 2026-11-22 / 21:45Z.
**Leg:** 3 SCALE (days 80–140), Lane A. **Base:** master `52b71428f` at prereg.
**Seeds:** FRESH 106268–106275 (8-panel) + probe seed 106276 (unscored extra).
**Policy:** r244–r250 control verbatim, single arm B (`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON, MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off, COMPETENT_ROUTE_AROUND=1 for the march walk only). DAYCAP 140, death-aware stop.
**Finisher:** the scheduled occurrence timed out before closeout. The panel ran and was analyzed; this finisher re-ran the analyzer on the corpus (exit 0, 233 lines) and reproduced every verdict below independently, read the two Q4 transcripts in full, diagnosed the blank, and closed out. No panel numbers here are taken on the timed-out run's word alone.
**Lock discrepancy:** the r251 lock (`playtest-loop-a-20261122T2145Z`) was stale-lock-recovered by the 17:45 CST occurrence while this finisher worked — that occurrence now holds `playtest-loop-a-20261122T2345Z` and will fail worktree registration (slug `journey-scale` still registered to this run) until this closeout releases it. Closeout deletes no lock: the lock file no longer belongs to this run. Rotation was written 3→0 by this finisher (see Closeout).

**Infrastructure:** registration was blocked by the host write flap ~69 min (21:47–22:56Z); a VM restart ~23:02Z killed the first successful registration mid-checkout; re-registered clean 23:13Z; panel ran to ~23:40Z. The flap window 21:52:30Z–~23:00Z cleared before the panel finished. Nothing was lost.

## Leg question (prereg)

Can a competent village reach national standing / the table approach in days 80–140 on current master, and what blocks it? Interesting iff ≥3/8 national, OR a new blocker class, OR a fixable defect in the table-approach path. Else QUIET.

**Short answer: INTERESTING as printed — but the new blocker class is a horizon artifact, and the wall is thinner than the raw count says.** One seed reached national (106268, trade road, d132); a second (106273) completed its trade rung on the final day d140, and the national flip demonstrably lags the rung by one day — it would have converted on d141, one day past the horizon. Effective national: 1/8 converted + 1/8 would-convert. The standing-199 "stall" is not binding on this band either (see Stall correction). The wall stands, but two of eight villages now reach the rung, and the fight slide has stopped falling.

## Panel numbers (arm B, seeds 106268–106275)

| Seed | End | Rank | Lesser | Full | w4 fights/kills | w5 faced | Deaths |
|------|-----|------|--------|------|-----------------|----------|--------|
| 106268 | 143d | global | d33 | — | 6 / 4 | 1 fight | 10 |
| 106269 | 141d | regional | d43 | — | 5 / 8 | 22 fights | 14 |
| 106270 | 62d OVER | regional | d43 | — | 5 / 0 | 0 | 15 |
| 106271 | 125d OVER | regional | d43 | — | 23 / 4 | 0 | 13 |
| 106272 | 141d | regional | d47 | — | 14 / 3 | 0 | 16 |
| 106273 | 141d | regional | d39 | — | 8 / 2 | 0 | 8 |
| 106274 | 123d OVER | regional | d45 | — | 7 / 1 | 0 | 15 |
| 106275 | 140d | regional | d55 | — | 17 / 5 | 11 fights | 8 |

Band: national **1/8**, lesser seat priced **8/8**, full seat **0/8**, wave-4 fights **85** / kills **27**, wave-5 faced **3/8**, survival **5/8**, lived-days mean 127.0 (control 123, +3.3%). Deaths 99 panel-wide; starvation deaths 0; collapses 106270 (d62), 106271 (d125), 106274 (d123).

**Wave-4 fight slide: 231 → 168 → 101 → 62 → 82 → 85 (r246–r251).** The slide has stopped falling and recovered slightly toward ~100. The next run still asks whether spawn/engagement changed on master, but the direction is no longer down.

**Wave-5:** faced on 3/8 seeds, killed on 2. 106269 MIXED (22 fights; the Editor killed d108 at 1/1500 HP; a network_note killed d112). 106275 MIXED (11 fights; the spoiler died d107). 106268 UNANSWERED (1 scholar fight, rerun, no kill). No village faced the wave-5 door as a door — the fights are roaming/field wave-5 entities, same as r250.

**Tribute:** DELIVERED 2/8 (106269 military_tribute d130, 106275 d124); READY-UNPAYABLE 1/8 (106268: 4 attempts, all veterans-short); NEVER-READY 5/8. The veteran shortage, not the deed, is what blocks tribute delivery.

## Q1 — INTERESTING (new blocker class RUNG — corrected below)

Blocker taxonomy: NATIONAL 1 (106268), FORMATION-LATE 1 (106269 — LEAD 3rd link formed d126, age 15), COLLAPSE 3 (106270 d62, 106271 d125, 106274 d123), FORMATION-FEW 2 (106272, 106275 — LEAD 2/3 ever formed), RUNG 1 (106273).

### RUNG correction — horizon artifact, not a live wall

106273's natgate: trade 1/3 through d130, 2/3 d131–d139, **3/3 only on d140, the final simulated day**, national false on d140. Compare 106268: trade hits 3/3 on d131, the trade polity forms the same day (`polities.trade={"shape":"trade","size":4}`), and national flips on **d132 — exactly one day later**. The national flip demonstrably lags rung completion by a day. 106273 had no d141 for the flip to land on. The RUNG classification is the analyzer reading the final day's state; the honest reading is that 106273 would have gone national on d141. The printed INTERESTING verdict stands as written (metric binding — the analyzer's rule fired on a new class), but the finding is the artifact, and the metric review below proposes the +1-day read for the next run. The trade road is the converting road on this band: tradeSeasoned3of3 2/8, nationalViaTrade 1/1 national.

### Stall correction — 0 days stalled-while-ready

Standing-199 stall: 4/8 seeds, 120 phantom days (106269 d130–140, 106272 d80–140, 106274 d92–123, 106275 d124–139). **But the r251 per-day split (adopted this run, replacing the r249-invalidated peak split): stalled-while-ready (r5≥2 on the stalled day) 0 days on 0/8 seeds; stalled-while-not-ready 120 days on 4/8.** The villages held at the t5−1 cap were not otherwise ready on any of those days. The standing-199 "stall" is not binding on this band — it is the readiness gate holding villages that weren't ready anyway. The r250 stall reading (1/8 seeds, 49d, peak-based) is superseded by this split; the next run should judge the stall on the per-day split only.

## Q2 — WINPLAN (ported snapshot)

Plans ignite on **8/8 seeds**: 49 plan seeds, **179 departures** on 8 seeds, **trios=0 quads=0**, 680 party fights, 0 reseeds, 0 expiries. The needwave-b guarded copy is in base and departures are plentiful — but every departure is still a pair. The pair-only wall is unchanged since r249/r269: plans ignite, pairs launch, trios never form. Per-seed departures range 13–38; the largest (106273, 38 departures, 138 fights) still never fields a trio.

## Q3 — REGRESSION GUARDS: all HOLD/GO

- VETBAR **GO** (0 disagreements across 8 seeds; maxR4/maxL3 agree everywhere).
- Lived-days **HOLD** (127.0 vs control 123, +3.3%, guardrail ±25%).
- Lesser seat priced **8/8 HOLD** (bar ≥4/8).
- SPOKEN-RAISE **GO** (7 talks: 6 properly-answered, 0 not-offered-spoken defect, 1 not-offered-unspoken correct hold).
- TRAP-LINE **HOLD** (3 sittings, 3 answered, 0 defect; mimes in capture 20).
- BETRAYAL sibling **HOLD** (4 turn-0 offers, invite label in opening every time, 0 defect).
- NOD-LOOP **HOLD** (0 sittings with a ≥4 identical nv: react streak; worst 3× nod).
- MUSTER **MOVED**: 249 titan days, 6 calls, 4 titans slain, 5 titan fights started, 22 meetings refused, 1 fled; committed Haven blades died 7 (the price against the kill gain). Living-veteran peak 6.
- MARCH **MOVED**: 8 march days, arrived 8/8, 5 fights on-march, 4 slain on-march, 0 fought off-march. March arrived-no-fight stays fixed.
- DOWNEDTWICE watch: **no recurrence**. The only "goes down" line in the whole corpus is a duck line ("The head goes down — the next duck in line takes the lead"). The r264 aidAllyDown double-emit did not fire on this panel.
- SUBCAP guard: lever OFF as designed (firedSeeds 1/8, linked 6, passedSubCapOff 0). ANSWERMAIL: 0/8 fired, as designed.

## Q4 — PEOPLE CHECK: PASS (with the blank below)

Two transcripts read in full, plus all 7 raise talks and the 25 driver transcripts scanned.

- **106268 d90 (Katarina, journalist, bold, trust 46, want: curious):** reads as a person. "I'm an archive of a world that doesn't exist. Someone should keep the records." The memory exchange is coherent and affecting ("Tell me one small thing you remember — a smell, a song. The small things are the ones that slip." / "History isn't what happened. It's what we refuse to let go of. I refuse."). One wrinkle, the blank: her "Help me haul something back? Too much for one." is spoken at open and never answered in the sitting — the player takes betrayal:accept and gets a tool gift instead.
- **106273 d120 (Kate, tailor, earnest, trust 90, want: ask_favor):** reads as a person. The water-haul ask is concrete and resolves: "We're down to 3 liters of clean water. I need someone to haul water with me at first light. Two of us, half the trips. Will you come?" → player commits → "Dawn, then. Bring something to carry — and thank you." A thread opened and closed, with a time and a plan.
- **Closing-line duplication: count stays 6.** No new verbatim spoken closing-line duplication across the 25 driver transcripts ("Good talk." ×1, "Good talk. Don't be a stranger." ×1 — different lines). Variety note, not the counted class: the nonverbal closer "A final nod. They touch their chest, then point at you — a promise without words." repeats 5× across the 25 sittings.
- **Tell-me-more echo:** not observed in the read set. **warn_you heed:** not observed in the read set (no warn lines in the driver transcripts — not a regression, the read set is 25 sittings).
- **Raise talks: 7 total, 6 accepted, 1 not-offered (correct hold).** The raise-opener variety work from r248 holds (no 90% modal repeat in this small set).

## Q5 — CENSUS + spotter d90 + W5-INSTANCE

Spotter: 1 villager with foodXp.spotter>0 on most seeds at d90 and end; spotter skill≥1 on 0–2 per seed. Thin but present, same as r250. W5-INSTANCE: see Wave-5 above (106269 MIXED, 106275 MIXED, 106268 UNANSWERED). Sortie: inert by design (0 called, 0 lingerer days).

## Q6 — DIALOGUE WATCH: the blank — orphaned raise lines (documented, not fixed)

**Count this run: 2 of 7 raise talks carry an invite line the recorded picks never address** (down from r250's 10/18 orphaned invitations):

- 106269 d124, Kamal: "Come see what I found. You won't believe it." spoken mid-raise-talk; the player answers the raise ("All right. Let's ask them.") and the invitation dies. It did not re-appear in Kamal's d125 or d126 talks.
- 106273 d17, Consuelo: "Help me haul something back? Too much for one." spoken mid-raise-talk; the player answers the raise; the haul is never addressed.

**Counter-evidence — open-conversation invites resolve:** the same lines in open conversation own the menu (turn-0 choices betrayal:accept/decline) and pay off. 106271 d90 (Marta): "Come see what I found" → accept → "I buried this before the Scattering... Marta digs up a wrapped bundle — food, still good. (+1600 kcal to the pantry.)" 106268 d90 (Katarina): "Help me haul something back?" → accept → tool gift. The orphan is specific to the raise-answer-talk shape, not to the invite system.

**Root cause, narrowed:** the invite lines are the betrayal.js micro-quest invites (INVITE_DEFS: look/carry/air/show/traps). In open conversation the menu-exclusivity union (conversation.js ~5040: `c.inviteSpoken && pendingInvite(vid)` → menu restricted to betrayal:accept/decline/leave/silence) forces an answer, and endConvo resets `inv.spoken` so a dodged invite re-speaks next sitting (r40 design). In the raise-answer talk the invite beat rides along with the raise opener, the recorded picks are the raise's, and the re-stage did not fire for Kamal across two later sittings. Which path fails — the menu union not engaging for the raise-talk shape, or the re-stage not re-speaking — was not traceable from the corpus in this closeout (the driver records lines, not menus; the beats/capture files don't carry the invite after d124).

**Why not fixed here:** a fix touches the conversation engine's menu/held-beat plumbing (the invite-honesty invariant — the menu must quote the label verbatim) and cannot be landed on an unproven trace. Filing as a finding for a builder arm: trace the raise-talk menu composition with a pending invite, and add a proof test that replays a raise talk with a pending invite and asserts the invite is answered or re-staged next sitting. Filed in sim-findings.md (orphaned-raise-lines root cause).

## Village assessment (plain words)

Five of eight villages are still standing at day 140, and the one that reached national did it on the trade road — three seasoned trade links, a charter delivered, national the next day. The villages that died, died the old way: scattered by hunger and monster pressure before their links seasoned (106270 gone by day 62 with zero wave-4 kills; 106274 down to a single survivor). The villages that lived fought a lot more than they used to — 85 wave-4 fights, 27 kills, four titans slain by musters that actually marched and arrived — but the fighting still happens in pairs. A hundred and seventy-nine plan departures and not one trio. The win plans have learned to start; they have not learned to bring a third person. The other wall is formation: two villages sat at two of three lead links all run, one more link short, and the trade road is the only one that finished. The people themselves read as people — a journalist keeping records of a world that doesn't exist, a tailor counting liters of clean water — but twice in seven raise talks someone offered to show the player something, or asked for a hand hauling, and the conversation walked past it like it hadn't been said.

**Reachable / fun / winnable:** the table approach is reachable (lesser seat priced 8/8, national 1/8 + 1 would-convert); the full seat is still unwon on the control policy (0/8, and the deed gate's tribute delivery is veteran-starved, not deed-starved). Fun holds where the people talk well; the orphaned invitations are the visible crack in it.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r251-gate` on the rebased tip `aa3ad2b5e`, run detached from a script file (serialized — the 2115Z gate finished 23:52–~00:05Z and the 1630Z gate 00:05–~00:21Z before mine started 00:22Z): **339 passed, 5 failed in 643s, exit 1. 0 attributable.** The 5 failures are the documented standing set, identical to the 2115Z and 1630Z rounds' gates (both 339/5): measurement-proof staleness pair (`test-measurement-proof-update.js`, `test-measurement-workflow.js` — retained neutrality proof vs current Game/controller/harness inputs), phone-frame stale receipt (`test-phone-frame-proof.js`), and two 120s deed-attainment timeouts (`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js` — under load; a second gate, `jest-cache-r267-gate`, started at 00:33Z while mine ran). This closeout touches no game code (evidence + driver/analyzer/test scripts only), so no failure can be attributed to it. Gate log: goal hidden_files/evidence/2026-11-22/journey-scale-r251-gate.log.

## Telemetry

`node scripts/telemetry-check.js --baseline scale-wall.json --current 'journey-scale-r251-b-*.json' --metrics national,table,wins,exiled`: 3 LOUD lines (national 12→0, table 16→0, wins 16→0). **Explained, not a deviation:** the baseline's own `_regime` note says not to compare readiness substrates against it — wins are structurally ~0 there and the check fires a spurious LOUD. This panel is a readiness substrate (control policy, wins 0/8 by design). Baseline NOT rolled.

## Metric review

- **RUNG:** the analyzer's blocker taxonomy reads the final day's state, so a rung completed on the horizon day classifies as RUNG. Next run: extend the horizon +1 day past a d140 rung completion, or read rung-completion-day +1 before classifying. The national flip lags the rung by a day (106268: 3/3 d131 → national d132).
- **Standing-199 stall:** the per-day split (stalled-while-ready vs stalled-while-not-ready) replaces the peak split from this run on — the peak split is invalid as written (r249) and the per-day split says 0 days stalled-while-ready on this band. Judge the stall on the per-day split only.
- **Wave-4 fight slide:** 85 this band — the slide has stopped falling; keep the watch one more run before asking whether spawn/engagement changed.
- **Orphaned invitations:** the r250 10/18 count and this run's 2/7 are not directly comparable (invitations vs talks) — the next run should count orphaned invite LINES per raise talk, the unit this run used.

## Method notes (for the next run)

- The driver prints per-seed JSON to stdout and never writes a seed file; the panel outputs live in goal hidden_files/evidence/2026-11-22/ (449 r251 files, arm B). The analyzer reads that dir and prints to stdout — capture it with a direct redirect, never pipe through head (SIGPIPE killed the finisher's first attempt in r264's closeout; same hazard here).
- The analyzer proof test (`scripts/test-journey-scale-r251-analyzer-20261122.js`) runs 153/153 BEFORE the panel, per the prereg. The finisher re-ran it green.
- Probe seed 106276 ran as an unscored extra (raisetalk ×3, transcripts d90/d120 exist); the analyzer scores only 106268–106275.
- The 17:45 CST occurrence stale-lock-recovered this run's lock at 23:45:24Z (heartbeat 25 min stale) and will fail worktree registration on the still-registered `journey-scale` slug until this closeout releases it. Its failure is a consequence of the timeout, not a defect — the next occurrence after release proceeds normally.

## Closeout

- Rebased onto current master `1860dc26e` (1630Z round record) clean; proofs re-run on the rebased tip (analyzer test 153/153); gate 339/5, 0 attributable (standing set only); merged ff-only into master; worktree released, branch `journey-scale` deleted.
- Rotation-a 3→0, read back. Telemetry: LOUD lines explained as regime artifact; baseline NOT rolled.
- Lock: NOT deleted by this finisher — the lock file now belongs to no live run: the r251 lock was stale-lock-recovered by the 17:45 CST occurrence (`playtest-a-20261122T2345Z`), which then failed worktree registration on the still-registered `journey-scale` slug and deleted its lock on failure. At closeout no `playtest-loop.lock` exists. Nothing to delete; the next Lane A occurrence will register cleanly once the worktree is released.
