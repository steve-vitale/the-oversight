# journey-deepening r218 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261115T1845CST`, scheduled Sun 2026-11-15 18:45 CST (00:45 UTC; run started ~00:50 UTC).
- **Run id:** `loop-a-20261116-0050`.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advanced 2→3 at run start with read-back verification (`3`).
- **Base:** local master `5e0bba6e5` at run start (sim-courtship-confirm-b CONFIRM NO-GO commit). `git pull` clean ("Already up to date"). No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered ~00:51Z; heartbeat stamped 00:54:31Z; 10-min heartbeat loop via `setsid`, PID 50165 — the r212 lesson: bare `nohup &` dies with its parent exec session).
- **Lock:** run_id `2026-11-16T00:50:30Z`. No lock present at run start.
- **Pre-flight:** main tree clean at lock creation (0 files) — NOTE: at first check (00:43Z) the tree showed 21 staged files, all sibling grecorder-adoption staging (per the 18:44 CST Lane B note, "not mine to commit or reset"); by 00:47Z the owning adoption had repaired the index clobber and deleted both branches, and `git status --short` read empty twice. Disk 39%. Reaper exit 0, removed nothing, 10 LOUD dirty trees (known, never auto-removed), active 10/16.
- **Overlap guard:** the previous Lane A run (journey-establishment r217, run_id `2026-11-15T22:36:30Z`) had MERGED and RELEASED before this run started: its commits are on master (`2a3ea11b1` run note, `9e3abfbab`, `40fe6eda4`), branch deleted, worktree removed from `git worktree list`, rotation already advanced 1→2, no lock file, no live processes. Its registry heartbeat (00:42:04Z, ~5 min old at check) reads as a closeout heartbeat on a done-merged, tree-removed entry — the same pattern sim-grecorder-a shows (00:44:59Z, done-merged, tree gone) — not live work. Per the standing rule the heartbeat was weighed, not ignored: there is no tree, branch, lock, or process left to collide with, and this run uses a different slug (`journey-deepening`). Proceeding.
- **Write flap:** watcher alive on boot `55adc5a7` (pid 3214), ALL-OK at run start (01:05Z). No flap active during pre-flight.
- **Policy:** competent. Seeds: fresh **100221–100228** (8-seed panel, no smoke — the 8 seeds ARE the panel). DAYCAP=100. CONVO_DAYS [45, 60, 80] (r212 driver clone).
- **Seed freshness (per the seed-band skill):** filename search (`*10022[1-8]*`) + content grep (`10022[1-8]`) across the repo evidence tree + `scripts/` = 0 hits. Rejected bands, all used or named: 100201–100208 (cascade-b control corpora), 100211 (answercourt-confirm-b + funeralmend-b-off perseed), 100311–100318 (named in gorgeprice/guardablate preregs), plus the full r213 rejected list carried (100111–100118 r213, 100091–100098 r212, 100075–100082 r192, 100083–100090 r193, 100070–100074 r191, 100050–100069, 100001–100058, 100501–100505, 100521–100536, 190391–190398, 190561–190568, 190581–190588, 190589–190596, 99641–99648, 99867–99882, 2501–2516, 44001–44016, 45001–45016, 46001–46064, 47001–47040, 48001–48040, 49001–49040, 50001–50003, 51001–51008, 52001–52008, 53001–53008, 54001–61001, 70001–77001, 110001, 100541–100556 grecorder, 100621–100636 courtship-confirm reserved).
- **Single-seed-per-process (r183 adoption):** every seed runs as its own `node` invocation (SEEDS=<single>), 2 waves of 4 parallel.

## Standing context (read before scoring)

- **r213 (deepening, landed 2026-11-15):** 8/8 survived to day 99–102 (second 8-for-8 in a row) but stuck one step earlier than r212: 7/8 wave 4, 0/8 wave 5, only **1 fourth-wave kill** across the panel (r212: 11). The wave-5 door opens at 2 banked fourth-wave kills and nobody banked any. `wildFightTable` w4 fights 72→26, w4 kills 11→1 vs r212; `villageSlain` w4 at the last waveLog snapshot 6→0. The only `src/js` delta vs r212's base is the gorgeprice2 lingerer guard (`dc8cbd3f3`, `game.js:24162` `if (m.lingering) return;` in monsterTurn — a lingering raider no longer steps onto the scholar and starts a solo fight it always wins) plus the r214 dialogue-only parting pool. **Follow-up owed, this run: a discriminating head-to-head — same seeds, guard on vs off — before anyone touches the guard.** Q1 third branch behaved as designed (AWAY fired WATCH-CONTINUES; FAVOR/PARTNER VARIED → WATCH-CLEAR). Q2 wave-5 read UNMEASURED (vacuous — 0 unlocked). Q4 UNMEASURED (instrument error A2a — the driver never logged winddown sayLines, so the r214 plain-parting pool was unobservable). Q3 CONFIRMED: water-haul template (4th panel), betrayal:accept label, meat-dinner 0-cases (100113, 100114 — both 0 reveals), knowledge-goal thinness (3rd panel). People check PASS. Reachable YES / fun MIXED (people yes, fights no) / winnable NO from this panel's position — block is wave-4 killing. Telemetry QUIET vs r192 (4 metrics; caveat: they do not cover wave-4 kills). Gate 333/7 GO, 0 attributable; instruments + evidence only, no src/js.
- **r212 (deepening):** 8/8 survived, 8/8 wave 4, 3/8 wave 5, max standing 577. The comparator for the A/B's OFF arm (w4 fights 72, w4 kills 11).
- **sim-guardablate-a / drawparity:** RNG-draw drift is dead as a systematic effect; matched-seed A/Bs compare panel-level, not bit-identical trajectories.
- **Combat-play gate (Steve 2026-10-10):** no toughness/gear/ability tuning until the fight-play census lands. This run touches conversation/winddown-instrument code only, plus a panel-only guard toggle that is reverted before landing. The gate does not bind it.

## Q1 (PRIMARY) — WAVE-4 KILL A/B: LINGERER GUARD ON vs OFF, SAME SEEDS

**The question.** Is the gorgeprice2 lingerer guard the cause of the r213 wave-4 kill collapse? Same 8 seeds (100221–100228), competent policy, DAYCAP 100 — once with the guard ON (current master) and once with it OFF.

**Instrument change (this run's build, committed BEFORE any judged sim):** clone the r213 driver → r218 with ONLY the seed band, run tag, and the Q2 winddown logging (below). Clone the r213 analyzer → r218 with ONLY the r218 filename regexes, the Q2 `summarizeParting` rewrite, and the new `summarizeWave4`. Clone the r213 proof → r218 with new assertions (22)–(25) (below). Proof must be green (25/25) + red control before the ON panel runs.

**Guard-OFF variant (panel-only, NEVER lands):** in the worktree, comment out the single line `if (m.lingering) return;` (`src/js/game.js:24162`) with a `// R218 A/B ONLY — REVERT BEFORE LANDING` marker. Nothing else changes. After the OFF panel, revert with `git checkout -- src/js/game.js` and verify `git diff -- src/js/game.js` is empty before any further commit. The final branch contains instruments + evidence only — no `src/js` change.

**`summarizeWave4(seedJSONs)` (new, mirrors `summarizeWave5`):** per seed — `w4fights` (`wildFightTable` entries with a wave-4 monster), `w4kills` (won fights' wave-4 monsters), `villageSlainW4` (sum of wave-4 ids in `villageSlain` at the LAST `waveLog` entry), `deathsW4` (`deaths` filtered by the W4 set on `who`), `scholarFights` (w4 fights with a `kind: 'player'` party member), `playerDeaths` (`deathHonesty.playerDeaths` — list of `{day, cause}`; also count the `cause === 'the wild'` subset), `finalWave`, `unlockedW5` (`finalWave >= 5`). Guard: `w4fights` must equal `fightsByWave['4']` on every seed (a mismatch is an instrument error, not a verdict). Frozen W4 id set re-verified against `src/data/monsters.json` in the proof (check (25) — see the Q2 proof list). Pooled per arm: total w4 fights/kills, kills per seed, seeds with ≥2 banked w4 kills (door threshold), unlockedW5 count, total playerDeaths + wild-cause playerDeaths.

**Pre-registered decision (reads straight off the pooled lines — no re-scoring):**
- **GUARD-IS-CAUSE** if OFF restores wave-4 killing to the r212 level (panel w4 kills ≥ 8 AND w4 fights ≥ 60) while ON stays collapsed (w4 kills ≤ 2, matching r213's 1). Verdict names the guard as the cause; the guard stays IN the game this run — removal is a Steve/design call with the scholar-death price attached (see below), not a same-run edit.
- **GUARD-EXONERATED** if OFF also stays collapsed (w4 kills ≤ 2 in both arms). The collapse is seed luck or another cause; carry to the next diagnostic. The guard is untouched.
- **MIXED** if OFF lands between (3–7 kills): report as partial restoration, no causal claim, carry with the numbers.
- **Scholar-death price (reported with every verdict, never folded into it):** total `playerDeaths` + wild-cause `playerDeaths` per arm. The guard was built because lingering raiders killed the scholar solo (38/88 in the cascade control pilot). If OFF buys kills at a steep scholar-death price, that trade IS the finding — the A/B does not recommend removing the guard on kills alone.
- **RNG caveat (recorded, not hidden):** OFF trajectories diverge from ON after the first lingering-monster turn (more code runs, more draws). Matched seeds = same starting conditions, not bit-identical paths. The comparison is panel-level (8v8), never per-seed paired.

## Q2 — R214 PLAIN-PARTING POOL, FIRST READABLE DEEPENING PANEL

**The question.** Do deepening sittings now close with parting words? r213 could not read this (A2a): the driver never logged the winddown `sayLine`s `endConvo` speaks (exit line, close/lapse beat, mood goodbye — `conversation.js:8221` + `convo-mood.js:316`), so the r214 plain pool was unobservable.

**Instrument change (this run's build, committed BEFORE any judged sim):** driver — capture the transcript length before `endConvo(vid, 'done')`, then log each new `them` line as `winddown THEM: <line>`. No game change, no behavior change (read-only logging of lines already spoken). Analyzer — `summarizeParting` r218 classifies the `winddown THEM:` lines per sitting: `PLAIN-PARTING` (one of the 3 r214 lines — verified verbatim against `convoMoodGoodbye`'s `mbye:plain` pool), `WARM/COLD-PARTING` (one of the 4 pre-existing pool lines), `OTHER-CLOSE` (winddown lines exist, none match either pool), `NO-CLOSE` (no winddown lines at all). The old `closing line:` field is kept as a secondary read (comparable to r213's 27/123 NO-CLOSE rate) but the winddown measure is the verdict measure: NO-CLOSE now means no goodbye was spoken at all.

**Proof checks (new, r218):**
- (22) Parting synthetic, winddown: transcript with a winddown line carrying each plain-pool line → PLAIN-PARTING.
- (23) Winddown lines present, no pool match → OTHER-CLOSE.
- (24) No winddown lines → NO-CLOSE.
- (25) W4 id set: the frozen set in the analyzer still matches `src/data/monsters.json` wave-4 roster exactly (loadWave4Ids re-read).
- Carried (1)–(21) must stay green under the r218 analyzer (the r213 proof's red-control semantics carry: run with `ANALYZER=./analyze-journey-deepening-r213-20261115.js` — (22)–(24) FAIL (r213 reads only `closing line:`), (25) FAILS (function absent), carried checks behave as the r213 proof documents).
- Total: 25 assertions ((22)–(25) new; (19) remains the red-control invocation, not an assertion).

**Pre-registered decision:** diagnostic, no GO/NO-GO bar. The fix predicts PLAIN-PARTING closes appear in the wild (≥5 across the ON panel) and winddown NO-CLOSE stays low (a sitting with no goodbye spoken at all is the defect shape — read every NO-CLOSE sitting in full). If ≥2 NO-CLOSE sittings recur with Marta's bare-reaction shape (farewell/joke/grace-beat, then silence), that's a CONFIRMED carry. Read on the ON panel only (the OFF panel's transcripts are a guard-read, not a conversation read).

## Q3 (SECONDARY) — CARRIED-WRINKLE SWEEP + Q1 THIRD-BRANCH RE-VERIFY

**The question.** Do the carried wrinkles from r213 recur on the fresh ON panel, in the same shape? And do the FAVORBLOCK / PARTNERBLOCK / AWAY lines still read VARIED / WATCH-CONTINUES under the third-branch bar?

1. **Water-haul favor template** repeats near-verbatim across villagers (r213: 13× across 6 seeds — 4th panel).
2. **Teach-loop same-pick** repetition in one sitting (r212: Sigrun 5× — 2nd panel; r213: not reconfirmed).
3. **`betrayal:accept` label** on a benign walk (r213: 17/32 betrayal sittings accept).
4. **Meat-dinner step** — sharpened bar (r212 metric review): 0 dinners on a surviving village = CONFIRMED wrinkle; exactly 1 dinner = thin-working, report counts. r213: 100113 (17 kills, 0 reveals) and 100114 (18 kills, 0 reveals) = 0 dinners.
5. **"(ended by engine)" closes** — sittings ending with no closing line (r213: 0 literal lines).
6. **Recap paraphrase "that's still where we are"** — fewer than 3 total recurrences → THIN-PROBE, carry without a verdict.
7. **Secret-template verbatim repeat** (r212: medicine-theft secret on 2 villagers; r213: secret never opened).
8. **Dry-line curious-path hit** (r212: Tyrone; r213: no secret answers, not reconfirmable).
9. **Knowledge-goal thin engagement** (r213: knowledge tops=1 panel-wide, 3rd panel).
10. **AWAY watch continues** (r213: outroad 6/12, spread across 6 sittings, 6 seeds — variant-pool watch, no fix).

**Pre-registered decision:** count each wrinkle on the ON panel (seeds/sittings/shapes). A wrinkle counts as CONFIRMED only if it recurs on ≥2 seeds/sittings with the same shape; a single-seed occurrence stays an observation. The sweep is diagnostic: no game change unless a CONFIRMED wrinkle is a single clear defect with a proof test — otherwise carry the counts with transcript evidence. Q1 block lines are judged independently under the r213 third-branch bar (THIN-PROBE / VARIED → WATCH-CLEAR / WATCH-CONTINUES / REPETITIVE → read detail rows in full).

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel, GUARDLINES on the r134 6-line pool, FAVORBLOCK / PARTNERBLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE, REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST, double-ask watch. PANEL VERDICTS read as before. The wave-5 killing read stays UNMEASURED-population on the 100d horizon (r213 A2b) — but wave-5 unlocks per A/B arm are reported as a secondary line (the door opens at 2 banked w4 kills).

## Census (Q1 context)

Plain-words village assessment per seed on the ON panel (who lived, who died, what they knew, what was missing); OFF panel census abbreviated to survival / standing / wave reached per seed. Books close on all seeds; unattributed 0.

## People check (Q2/Q3 context)

Full transcripts read: every REPETITIVE / WATCH-CONTINUES block sitting (Q3), every winddown NO-CLOSE sitting (Q2), plus a sample of secret/grief sittings across the ON panel. SENSE-TESTING LAW: wants, consequences, specific memories — no filler loops, no fabricated shared history.

## Telemetry

`telemetry-check.js` vs the deepening baseline (8-seed sums, r192, seeds 100075–100082) on the ON panel seeds 100221–100228, metrics `w3fights,engaged.w3,fightsTotal,fightsByWave.3`. Same-n panel (8 vs 8), so raw-sums comparison IS binding this run. The r213 metric-review proposal to add a wave-4-kills panel line is adopted as a NOTE line (w4 fights/kills printed per arm in the run note) — the r192 baseline file carries no w4 fields, so no telemetry comparison on w4 this run; a baseline extension is proposed for the next run, not improvised here. Any LOUD line on the 4 binding metrics is a same-run investigation item before any baseline roll.

## Shape

prereg (committed BEFORE any judged sim) → instrument clone (driver + analyzer + proof test, proof green 25/25 + red control before the panel) → ON panel (8 seeds, single-seed processes, 2 waves of 4) → guard-OFF patch (one line, marked, worktree-only) → OFF panel (same 8 seeds) → revert patch (`git checkout -- src/js/game.js`, diff-empty verification) → analyzer verdicts both arms (ON full read; OFF wave-4 + census lines) → run note → telemetry check → gate → rebase onto current master → merge. Heartbeat loop: 10-min cadence, setsid PID 50165.

## Metric review (to fill at closeout)

- Q1: A/B verdict (GUARD-IS-CAUSE / GUARD-EXONERATED / MIXED) + pooled numbers both arms + scholar-death price + whether the panel was enough for the verdict.
- Q2: PLAIN-PARTING count + winddown NO-CLOSE list + whether any NO-CLOSE sitting repeats Marta's shape; did the winddown instrument work first try?
- Q3: per-wrinkle counts + CONFIRMED vs observation + block lines under the third-branch bar.
- Q4: read-only carries as printed.
- Whether any telemetry LOUD line was real, and whether the rotation 2→3 write stuck (read-back).
- Whether the flap or the registry-lock queue delayed any step.
