# Journey — Scale r276

**Run:** `playtest-loop-20261123T2043Z`, scheduled 14:45 CST Mon 2026-11-23 / 20:45Z.
**Leg:** 3 SCALE (days 80–140), Lane A. **Base:** master `53ae1c2de` at prereg.
**Seeds:** FRESH 106310–106317 (8-panel) + probe seed 106318 (unscored extra).
**Policy:** r244–r251 control verbatim, single arm B (`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON, MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off, COMPETENT_ROUTE_AROUND=1 for the march walk only). DAYCAP 140, death-aware stop.
**Pre-flight note:** main tree clean, disk 52%. Registration took ~25 min (the first `git worktree add` checkout died mid-`evidence/` after ~11 min / 19 GB written; the register's fallback re-ran the checkout to completion). The base moved under the run: the departsafe-rejudge adoption's ff-merge landed between the pre-flight pull (20:43Z, master `b68134225`) and the register (20:49Z), so the worktree registered at `dcbaafeb0` and was ff-merged to current master `53ae1c2de` in the worktree before any work (clean tree, zero local commits — the body's prescribed recovery). The musterask adoption (`53e60a140` + `53ae1c2de`) landed in the same window; both deltas are instrument/evidence only. Lock `playtest-loop-20261123T2043Z` created 20:43:56Z; rotation 3→0 written at run start and read back. Heartbeat loop (10-min cadence, setsid, pid 48210) alive for the whole run; registry heartbeat never went stale. No flap window observed during the run (write probes OK at 21:05Z).

## Leg question (prereg)

Can a competent village reach national standing / the table approach in days 80–140 on current master, and what blocks it? Interesting iff ≥3/8 national, OR a new blocker class, OR a taxonomy miss (UNKNOWN), OR a fixable defect in the table-approach path. Else QUIET. This panel is also the band-wide measurement of the r273 fruitless-march stand-down fix.

**Short answer: QUIET — and the wall moved the wrong way: four villages collapsed before day 90, none reached national, and no wave-5 monster ever appeared.** The stand-down fix never fired band-wide (no muster marched 7 fruitless days), so it stays proven on its one r273 seed only. The villages that lived fought in pairs, as always — 98 plan departures and not one trio.

## Panel numbers (arm B, seeds 106310–106317)

| Seed | End | Rank | Lesser | Full | w4 fights/kills | w5 faced | Deaths |
|------|-----|------|--------|------|-----------------|----------|--------|
| 106310 | 140d | regional | d35 | — | 7 / 1 | 0 | 16 |
| 106311 | 141d | regional | d38 | — | 7 / 4 | 0 | 12 |
| 106312 | 132d OVER | regional | d75 | — | 11 / 4 | 0 | 12 |
| 106313 | 60d OVER | regional | d48 | — | 0 / 0 | 0 | 15 |
| 106314 | 83d OVER | regional | d34 | — | 5 / 0 | 0 | 13 |
| 106315 | 46d OVER | regional | d35 | — | 0 / 0 | 0 | 12 |
| 106316 | 140d | regional | d47 | — | 12 / 2 | 0 | 18 |
| 106317 | 140d | regional | d47 | — | 5 / 1 | 0 | 6 |

Band: national **0/8**, lesser seat priced **8/8**, full seat **0/8**, wave-4 fights **47** / kills **12**, wave-5 faced **0/8**, survival **4/8**, lived-days mean 110.3 (control 123, −10.4%, HOLD). Deaths 104 panel-wide; the wild 48, monster 22, starvation 7 (all on 106311/106313/106315). Collapses: 106312 (d132), 106313 (d60, pop 0/0), 106314 (d83, pop 1/1), 106315 (d46).

**Wave-4 fight slide: 231 → 168 → 101 → 62 → 82 → 85 → 52 → 47 (r246–r276).** The decomposition is composition again — but the composition is worsening: 4 collapses (the most yet) contributed 16 wave-4 fights between them, and the per-surviving-village rate also slipped (31 fights over 4 survivors = 7.75, vs r273's 9.0 and r251's 10.0). The kill rate slipped too (12/47 = 26% vs r273's 31% and r251's 32%). No spawn/engagement change is indicated by the prereg's rule (early collapses present), but the per-survivor slip is now two runs in a row — the watch stays open, and if the next band is also <60 the spawn question gets asked with or without collapses.

**Wave-5:** faced on **0/8** seeds — and the W5-INSTANCE section is starker: **zero live wave-5 entities on any day on any seed** (0/140 days on the survivors). No village unlocked wave 5 (living-veteran peak 5 band-wide; only 106312 ever held 2 living wave-4 veterans, maxR5=2, and it collapsed d132). The unlock chain works as designed (veterans are the gate); the villages just didn't bank 2 living veterans. A step back from r273 (2/8 faced) and r275 deepening (2/2 faced) — but the difference is the veteran count, not the door.

**Tribute:** DELIVERED 0/8; READY-UNPAYABLE 1/8 (106312: ready d123, 8 attempts, all veterans-short — the same shape as r273's 106280); NEVER-READY 7/8. The veteran shortage, not the deed, is what blocks tribute delivery — same as r251/r273.

## Q1 — QUIET (the wall stands as measured)

Blocker taxonomy: COLLAPSE 4 (106312 d132, 106313 d60, 106314 d83, 106315 d46), FORMATION-FEW 2 (106310, 106316 — LEAD 2/3 ever seasoned, one link short each), SNAP 1 (106311 — LEAD 3 formed events on 3 villages but only 2 active at end), FORMATION-LATE 1 (106317 — LEAD 3rd link formed d138, two days before the horizon). No NATIONAL, no RUNG, no RUNG-HORIZON, no UNKNOWN this band. The interesting-bar (≥3/8 national) was not met; no new class; no taxonomy miss.

### Stall — 48 phantom days, 0 stalled-while-ready

Standing-199 stall: 48 phantom days on 1 seed (106311, d93–d140). The per-day split says **0 days stalled-while-ready, 48 stalled-while-not-ready** — the stall is not binding. The mechanism: 106311's living-veteran peak is 1 (maxR5=1) against the wave-5 demand of 2, and it never banks a second — the readiness gate holds the village at the t5−1 cap because the veterans aren't there, not because the gate is stuck. Same reading as r273.

### The stand-down measurement — VACUOUS (the fix never fired)

The r273 fruitless-march stand-down (7 arrived-but-no-pending march days → stand down + 30-day re-call cooldown) fired **0 times** this band: 0 `fruitless-standdown` march rows, 0 `fruitless-cooldown` muster rows across all 8 seeds. The two `stood-down` muster rows are the PRE-EXISTING absent-trigger (the driver stands a muster down when its titan wanders off), not the r273 fix:
- 106310: muster called d61, marched d61–d63 (3 arrived, 0 pending; the herald's lair moved daily), titan absent d64 → stood down.
- 106317: muster called d123, marched d123–d128 (6 arrived, 0 pending — **one day short of the 7-day trigger**; d127 the march stood ON the lair tile and still no encounter started), titan absent d129 → stood down.

No national seed existed to lose national, so there was no hunger-bleed dissolution to prevent. The fix remains proven on its one r273 seed (106282) only. The band-wide question is still open — it needs a band that produces a 7-day fruitless march, and this band's musters ended at 3 and 6 days because the herald wandered off first. (Note for the next run: the absent-trigger fires first whenever the titan leaves inside a week; the fruitless fix only matters for a titan that stays present and un-engageable.)

## Q2 — WINPLAN (ported snapshot)

Plans ignite on **8/8 seeds**: 31 plan seeds, **98 departures** on 6 seeds, **trios=0 quads=0**, 401 party fights, 0 reseeds, 0 expiries. The homebody-metric-a handoff is IN this run's base — and departures are still all pairs (r273: 160 departures, 0 trios; r275 deepening: 175 departures, 0 trios). The pair-only wall is unchanged since r249. Largest departure count (106310, 28 departures, 106 fights) still never fields a trio.

## Q3 — REGRESSION GUARDS: all HOLD/GO

- VETBAR **GO** (0 disagreements across 8 seeds).
- Lived-days **HOLD** (110.3 vs control 123, −10.4%, guardrail ±25%).
- Lesser seat priced **8/8 HOLD** (bar ≥4/8).
- SPOKEN-RAISE **GO** (11 talks: 6 properly-answered, 2 counter, 0 not-offered-spoken defect, 3 not-offered-unspoken correct hold — the three are Shanshan's Mandarin-only sittings, the raise correctly not offered).
- TRAP-LINE **HOLD** (1 sitting answered, 0 defect; mimes in capture 13).
- BETRAYAL sibling **HOLD** (3 turn-0 offers, 0 defects; Thabo verdict stands).
- NOD-LOOP **HOLD** (0 sittings with a ≥4 identical nv: react streak; worst 3× nod — the flat spot persists in 6 NV sittings).
- MUSTER **MOVED**: 309 titan days, 3 calls, 1 titan slain, 1 titan fight started, 3 refused meetings, 6 committed blades, 3 committed deaths. Living-veteran peak 5.
- MARCH **MOVED**: 12 march days, arrived 12/12, 1 fight on-march, 1 slain on-march (106311's herald — the march did its job there).
- DOWNEDTWICE watch: **no recurrence**. GONE-BEARER watch: **no recurrence**. TABLE-DRY watch (r268 fix): **no recurrence** (no dry table beat in the read transcripts).
- SUBCAP guard: lever OFF as designed. ANSWERMAIL: 0/8 fired, as designed.

## Q4 — PEOPLE CHECK: PASS (with the blank below)

Five full transcripts read in full (plus one NV sitting and all 11 raise talks, plus the probe's raise talk). No dry lines, no filler loops, no fabricated history.

- **106316 d120 (Nadia, radio DJ, warm, trust 91, want: curious):** the best transcript of the run. Opens on grief ("I keep expecting to see them by the fire. Then I remember."), the invite pays off in open conversation ("Come get air with me" → accept → she teaches slope-reading for water, "how their grandmother did it", the Codex notes it), then comfort ("Talk to me a bit. That helps more than anything."), then the curious want lands ("What scares you most about what's happening? The real answer."). Grief, teaching, curiosity in one sitting. Want advances 0→2.
- **106311 d90 (Emilio, tattoo artist, cautious, trust 91, want: curious):** "Every name, every day, every meal. The boring stuff is the important stuff." The walk invite pays off ("It's quiet at the tree line. Emilio doesn't say much. Sometimes that's the whole point."), then the record-keeping thread ("A hundred years from now someone should know we were here and what it cost."). The "Tell me more / I'm listening / Go on" picks each draw a distinct, characterful line — NOT the r239 echo defect.
- **106317 d120 (Fernando, bike messenger, earnest, trust 91, ask_favor stage 2→3):** "About the creek water run — still need hands. Are you in?" The player commits; Fernando answers honestly that he's away from Haven and can't promise a dawn meet while out — find him when he's back. A favor-commit with a real deferral, not a fake promise.
- **106310 d120 (Asnakech, paramedic, fidgety, trust 20, curious 1→2):** short but coherent — "You look handy. What did you do with your hands, before?" / "Paramedic hands. Clipboards, mostly. Now they hold wire and wood, and they learn fast. Hands are honest that way."
- **106311 d120 (Angela, mechanic, withdrawn, trust 91, ask_favor stage 1):** the thin sitting of the run — "Never mind the food I needed — we got it handled. Thanks anyway." The favor planted d117 resolved off-screen before it was asked; the sitting lands a relationship beat ("There's an ease between you now — the kind that takes weeks to build.") and ends. Coherent, not senseless; the want stays unasked.
- **106311 d90 NV (Sanne, vintner, dry, trust 61):** German-only, no shared words — "scheiße" / "No!" grinned with pride. Charming, but the NV 3-nod flat spot persists (nod ×3, then "Their gestures slow — the conversation thinning like light at dusk"). Guard HOLDs (worst 3×, bar ≥4), flat spot unchanged since r250.
- **Closing-line duplication: count moves 6 → 9.** The spoken closing line "I need to walk a bit. I'll be by the fire when I'm ready." repeats 3× across driver transcripts (106310 d90, 106312 d90, 106316 d120) and "Take care of yourself." repeats 2× (106312 d120, 106317 d120). Counting rule carried: extra instances beyond the first occurrence (+2 and +1). BUT the mechanism is the designed grammar pool, not a defect: exit lines come from small per-mood pools in characterGen.json (grieving has 8 lines) picked per-villager by convoPickCycle, and the code exempts them explicitly ("GOODBYES ARE GRAMMAR ... two villagers saying 'Later, then.' on one day is not parroting"). The count is a variety watch, not a defect count — no fix attempted.
- **warn_you heed:** no warn_you sitting appeared in this run's driver transcripts — absence noted, not a failure.
- **Tell-me-more echo:** not observed.

## Q5 — CENSUS + spotter d90 + W5-INSTANCE

Spotter: 1 villager with foodXp.spotter>0 on most seeds at d90 and end; spotter skill≥1 on 0–1 per seed. Thin but present, same as r273. W5-INSTANCE: all UNANSWERED (see Wave-5 above — zero wave-5 fights, zero live wave-5 entities). Sortie: inert by design (0 called, 0 lingerer days).

## Q6 — DIALOGUE WATCH: the blank — orphaned raise-talk invite lines (counted in LINES this run)

**Count this run: 1 orphaned invite LINE in 11 panel raise talks** (r273: 4 lines / 11 talks):

- 106310 d13, Sal: "Come get air with me. I need to think out loud." spoken mid-raise-talk; the player answers the raise; the invitation dies.
- (Probe, unscored) 106318 d12, Zaid: "Walk my trap line with me? Extra hands, extra eyes." — same shape, same death. The probe corroborates the defect on a 9th seed.

**The rate did NOT heal — only the frequency fell.** Invite lines appeared in only 2 of 12 talks this run (panel + probe), and BOTH orphaned — the orphan rate among invite lines is still 100%. The count fell 4 → 1 because fewer invites spawned, not because any invite survived. The defect is specific to the raise-answer-talk shape, not the invite system: the same lines in open conversation own the menu and pay off (106316 d120 Nadia, above; 106311 d90 Emilio).

**Why not fixed here:** same as r251/r273 — the fix touches the conversation engine's menu/held-beat plumbing (the invite-honesty invariant) and cannot be landed on an unproven trace. This run's one blank is documented, not filled: the orphan count is 1/11 panel (+1 probe), the defect unchanged, the fix stays with a builder arm.

## Village assessment (plain words)

Four of eight villages are still standing at day 140, and none of them got anywhere near a nation — the closest any village came was two seasoned links out of three, with the third link either never forming or forming two days before the horizon ended. The villages that died, died fast and early: one gone by day 46, one by day 60 with nobody left alive, one by day 83 down to a single person, one by day 132. The wild killed more people than monsters did (48 of 104 deaths), and starvation took 7. The villages that lived fought in pairs, as always — 98 plan departures and not one trio, even with the handoff lever now in the game. The strongest village (106317, seven alive, the only one with three links forming) still sat one seasoned link short of national, and no village ever banked the two living wave-4 veterans the readiness bar demands — so no wave-5 monster ever showed up at all, not even as a rumor on the horizon. The people themselves read as people — a radio DJ grieving by the fire who still teaches you to read a slope for water, a tattoo artist keeping the boring history so someone a hundred years from now knows what it cost, a bike messenger who won't promise a dawn meeting while he's out on the road — but twice in twelve raise talks someone offered to show the player something, or asked for a hand on the trap line, and the conversation walked past it like it hadn't been said.

**Reachable / fun / winnable:** the table approach is reachable (lesser seat priced 8/8 on every seed); the full seat is still unwon on the control policy (0/8, and the deed gate's tribute delivery is veteran-starved, not deed-starved). Fun holds where the people talk well; the orphaned invitations and the nod-nod-nod sittings are the visible cracks in it. Winnable still NO — the wall this band is the collapse rate (4/8 before day 90) plus the veteran bank (max 1 living on 7/8 seeds).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r276-gate` on the rebased tip `ea04dd01f` (base `04717109b`, the endgame r275 landing): **335 passed, 9 failed in 1481s, exit 1. 0 attributable.** The 9, classified:

**Standing set (3, exit 1 — retained-proof staleness, fail standalone too on this base per the endgame r275 gate):**
1. `scripts/godpath/test-measurement-proof-update.js` — "Proof source inputs are not current" (balance-proof-update validator).
2. `scripts/godpath/test-measurement-workflow.js` — "retained neutrality proof covers the current Game/controller/harness inputs" (8/1).
3. `scripts/godpath/test-phone-frame-proof.js` — retained browser inputs vs current source (index.html et al.) + "Phone receipt source is stale or missing: index.html" (3/3).

**Standing slow-test timeouts (2, exit null at the 120s check.js cap):**
4. `scripts/godpath/test-living-garden-deed-attainment.js` — 120s timeout; slow by construction (16 seeded campaign sims), fails identically in 8+ earlier gates on master without this change (endgame r275 gate: passed at 900s standalone).
5. `scripts/godpath/test-one-person-army-deed-attainment.js` — 120s timeout; same class (r273: re-ran green standalone in the clear).

**Load/flap flakes (4 — all confirmed by standalone re-runs, none attributable):**
6. `scripts/godpath/test-measurement-cache-flags.js` — 4 sub-failures in the gate; standalone re-run **exit 0 (4 passed, 0 failed)**.
7. `scripts/godpath/test-trust-observer-neutrality.js` — 120s timeout in the gate; standalone re-run **exit 0 (6 passed, 0 failed)**.
8. `scripts/godpath/test-occupation-panels.js` — 120s timeout in the gate; standalone re-run 6 passed, 1 failed ("real CLI workflow completed") with an **explicit EPERM write** in the log (`balance-panel.js:328 writeFileSync`, flap signature) — a flap artifact, not a test verdict. Re-run in the clear: **exit 0 (25 passed, 0 failed)**.
9. `scripts/test-capable-bot-20261014.js` — 120s timeout in the gate; standalone re-run exit 1 with an **empty log** during an active write-flap window (fresh-file writes EPERM in /tmp and home at 22:15Z) — a flap artifact, not a test verdict. Re-run in the clear: **exit 0 (40 passed, 0 failed)**.

This run touches no src/js, no index.html, no godpath files, no data files (3 new r276 scripts + 2 evidence notes only), so no gate failure can be attributed to it by construction — and the re-run evidence above confirms the classification. The gate ran 1481s (r273: 687s) under a machine restart mid-run (~21:39Z) and load 10–15; the four flake failures track that load, not this change. A write-flap window was active at 22:15Z during the standalone re-runs (fresh writes EPERM in /tmp and home; the flap-watch is tracking it).

## Telemetry

`node scripts/telemetry-check.js --baseline scale-wall.json --current 'journey-scale-r276-b-*.json' --metrics national,table,wins,exiled`: **3 LOUD lines** (national 12→0, table 16→0, wins 16→0; n=126 files). **Explained, not a deviation** — identical to r273 and r251: the baseline's own `_regime` note says not to compare readiness substrates against it; wins are structurally ~0 there and the check fires a spurious LOUD. This panel is a readiness substrate (control policy, wins 0/8 by design). **Baseline NOT rolled.**

## Metric review

- **RUNG-HORIZON:** no RUNG-HORIZON fired this band; RUNG did not fire either. The observed set for the next run stays {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW, FORMATION-LATE, COLLAPSE, RUNG, RUNG-HORIZON}. SNAP fired (106311) — it is in the observed set, so no INTERESTING.
- **Standing-199 stall:** the per-day split is the adopted reading (0 ready / 48 not-ready on 106311). The peak split (48 ready) is invalid as written and is kept only for continuity, labeled invalid. The stall mechanism this band is veteran shortage (maxR5=1), not the tribute-delivery price r273 named — watch whether tribute delivery systematically stalls readiness next band (no delivery happened this band to test it).
- **Wave-4 fight slide:** 47 this band — the decomposition is composition again (4 early collapses), BUT the per-survivor rate slipped a second run in a row (10.0 → 9.0 → 7.75). If the next band is also <60, the spawn/engagement question gets asked with or without collapses.
- **Orphaned invitations:** counted in LINES per raise talk (1 line / 11 talks panel, +1 probe line). The defect rate among invite lines is 100% (2/2 orphaned) — the count fell only because fewer invites spawned.
- **Stand-down measurement:** VACUOUS this band (0 fruitless firings). The fix stays proven on one seed only. The absent-trigger stands down musters at 3 and 6 fruitless days; the fruitless fix only matters for a titan that stays present and un-engageable past day 7.
- **Closing-line duplication:** count 6 → 9 by the extra-instance rule. The mechanism is the designed grammar pool (per-mood exits, per-villager cycle) — a variety watch, not a defect. No fix attempted.
- **Homebody handoff:** in base, departures still all pairs (98 departures, 0 trios). The handoff is a plan-survival mechanism, not a party-size mechanism — the trio question needs a different lever, not a re-run of this one.

## Method notes (for the next run)

- The driver prints per-seed JSON to stdout and never writes a seed file; the panel outputs live in goal hidden_files/evidence/2026-11-23/ (arm B). The analyzer reads that dir and prints to stdout — capture it with a direct redirect, never pipe through head (SIGPIPE killed the finisher's first attempt in r264's closeout; same hazard here).
- The analyzer proof test (`scripts/test-journey-scale-r276-analyzer-20261123.js`) runs 159/159 BEFORE the panel, per the prereg.
- Probe seed 106318 ran as an unscored extra (collapsed d90, pop 3/3); the analyzer scores only 106310–106317.
- Registration took ~25 min on a loaded box (the first `git worktree add` checkout died mid-`evidence/`; the register's fallback re-ran it to completion). The base moved under the run (departsafe-rejudge + musterask adoptions landed mid-registration); the worktree was ff-merged to `53ae1c2de` before any work.
- Seed-band note: the first candidate block 106301–106308 is SPENT by sim-reseedexpiry-b (Nov 20 prereg) — recorded in the r276 prereg; do not reuse. 106286 appears only in sweep .json corpus contents (outside the prereg search scope).
- The next scale run clones the r276 driver (stand-down carried). The stand-down band-wide question is still open — it needs a band that produces a 7-day fruitless march.

## Closeout

- Panel commit `36399de10` (base `53ae1c2de`) rebased onto local master `04717109b` (Lane B endgame r275 landed first — dead-whisper fix + Voice-collapse fix-the-fix; no conflicts, patch replayed exactly once) → tip `ea04dd01f`; proof test re-run green on the rebased tip (analyzer 159/159). Gate on `ea04dd01f`: 335/9, 0 attributable (see Gate). Gate-section commit (this note, gate + telemetry + closeout sections filled) → merged `--ff-only` into local master; worktree released; main tree verified clean (the one pre-existing untracked fleshout round-record file, `evidence/2026-11-23/sim-scale-onramp-round-2015.md`, still present — another run's work, untouched).
- Telemetry: 3 LOUD lines, explained regime artifact; baseline NOT rolled.
- Lock `playtest-loop-20261123T2043Z` deleted at closeout (same-call read + delete, run_id match).
- Flap window ~22:15–22:32Z (~17 min) struck the standalone gate re-runs (occupation-panels EPERM, capable-bot empty log); both re-ran green in the clear. Machine restart ~21:39Z killed the first heartbeat loop mid-run (registry heartbeat went ~19 min stale max — the flesh-out register held the registry lock 21:51–22:05Z; heartbeat re-landed 22:05:44Z by manual retry, no lock deletion by any loop in the window). A second heartbeat loop (setsid, pid 7862) kept the heartbeat fresh after the restart.
- Rotation-a 3→0, read back. Merged locally, pending ship — no version tag; the ship job reports the tag when it goes live.
