# journey-deepening r187 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261112T1245CST`, scheduled Thu 2026-11-12 12:45 CST (18:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `90f5d8298` (sim-fleerepair-adopt-b tip; verified in worktree: `git log` HEAD = 90f5d8298, branch `journey-deepening`, status clean). Origin divergence note: local master is 1 ahead of origin/master (50c6e7fc8, batch ship), 0 behind — `git pull` no-op, no reconciliation, no push; the ship loop owns pushes.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered ~19:31Z; slow checkout ~13.5 min on loaded host; flap probe ALL-OK before it).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-12T18:56:56Z` (created 18:56:56Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r187.sh`, 10-min cadence, started 19:34Z (PID 49379; loop lives in goal hidden_files, not /tmp, r128 lesson); manual heartbeat 19:33Z.
- **Policy:** competent. Seeds: fresh **100032–100039** (8-seed panel — full panel, see Q1); smoke **100040**. Freshness verified: 0 hits in `*-prereg.md` files, 0 in `scripts/`, 0 filenames. DAYCAP=100. CONVO_DAYS [45, 60, 80].
- **Single-seed-per-process (r183 adoption finding):** every seed runs as its own `node` invocation, parallel across processes.

## Pre-flight notes (this run)

- Main tree clean at run start (full `git status` took ~21 min on the loaded host; its single hit — `D` + `??` on `evidence/2026-11-12/sim-fleerepair-adopt-b.md` — was a transient index-clobber artifact from a sibling landing mid-scan: file is in HEAD at blob 435e1b24, worktree copy hashes identically, targeted re-check clean, second full status empty in 2.5s with warm index). Disk 40%.
- Worktree reaper (pre-flight run): removed nothing; LOUD dirty trees all other agents' (build-ladder-leg4-baseline, sim-wideduty-a, sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-siegedesign-a, sim-redactor-a, sim-saycap-a, sim-siegedialog-a, journey2-succession, sim-pairarming-a, sim-proofrefresh-b10) — none mine, left alone. Active 13/16, cap has room.
- **Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue/instrument code only, so the gate does not bind it (same as r129/r130/r183/r184).

## Standing context (read before scoring)

- **r184 (deepening, landed 2026-11-12):** place-lesson rotation CONFIRMED in the wild (18 frames, 4 distinct, maxSameFrame 2 on re-probe seed 100030); guard-beat dial CLOSED — "softens"/"warmth" lines fire only on genuine warming moves (MISS 0/23, by construction: `moodguard` is called only in the guard branch). **Carried watch, this run's Q1: SECRET-SILENT** — 0 confession openers in 51 sittings (Q1-SECRET, Q1-VARIETY THIN-PROBE, Q1-WANT NO-ANSWERS all 0). "The secret/confession content never fired this panel. Not a verdict — the opener needs high trust + specific conditions, and 51 sittings is a thin sample — but the next deepening run should check whether the confession path has gone quiet or this panel was just unlucky." **V-INIT also 0** (no NPC-initiated bonds; player invites offered in 36 sittings) — same standing shape as r183. That is this run's Q2.
- **r133/r134 (establishment, landed 2026-11-12):** guard pool widened 2→6 observational lines (r134, [needs-eyes]); Q1 stall diagnosed as rung-math. The guard lines this run counts are the r134 6-line pool — the r184 soft/warm verdict (MISS 0/23) was read on the OLD 2-line pool; a re-read on the new pool is owed if the lines fire, but the mechanism verdict stands.
- **Carried (not this run's to build):** Baraka unvoiced raise; Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — Loop B bisect is the top job); scholar-payment open item (Steve-call); scale.json baseline regime re-label; preserve_food has no villager-side job; taken-kin pod sentence / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is dialogue/instrument-only, so the pair is carried, not rebuilt; reaper-lock self-contention fix (needs a Steve nod).

## Q1 (PRIMARY) — SECRET-SILENT WATCH, 8-SEED PANEL (r184's named next step)

**The question.** Is the confession path quiet, or was r184's 51-sitting panel just unlucky? The gate (read from `src/js/conversation.js:3436-3470`, convoOpening secret branch): trust ≥ 40 AND villager has a secret (`proto.secret`) AND not yet shared (`!c.secretShared`) AND 20% roll AND no higher-priority opener wins (talk request / table / unfinished business / grief / acute need all sit above it) AND the line is not ledger-blocked. Any of those stages could be the bottleneck — the probe instruments the funnel so the verdict names the stage.

**Instrument (driver only, no simulation change):** runConversation records a `secretProbeSittings` entry per sitting (day, vid, trust at sitting start, hasSecret, secretSharedAlready, acuteNeed, openerThread, confessionFired) into the seed JSON; the analyzer adds `summarizeSecretProbe`. The picker is untouched — the probe observes, never steers. Trust is read from the game's trust store for the villager at sitting start; `proto.secret` presence is read from the cached villager prototype (synthesized on first conversation — a sitting before any synthesis reads as "unknown", recorded as such, not as "no secret").

**Pre-registered decision.** The analyzer summarizes the funnel: sittings → trust≥40 sittings → eligible sittings (trust≥40 + hasSecret + !shared + !acute) → branch-reached sittings (eligible + no higher-priority opener won) → confessions fired.
- If confessions fire ≥1: verdict **FIRES** — the path is alive; the funnel says whether trust or priority is the binding constraint, and the fired sittings get a full-transcript read (people check).
- If 0 confessions AND ≥5 branch-reached sittings: verdict **QUIET-PATH** — the 20% roll or the ledger is starving a reachable path; fix owed next run (not built in this run — a convo-flow change needs its own proof test + panel).
- If 0 confessions AND <5 branch-reached sittings: verdict **NO-DATA** — the trust gate binds (or priorities displace); the watch continues, and the fix question becomes trust acquisition by day 80, not the confession code. No re-scoring mid-run.

**Amendment A1 — game-level confession count (recorded after the smoke run, BEFORE the panel runs).** Smoke seed 100040: 0 confessions in 6 driver sittings, but `secretSharedBefore=true` for gen_b4r7tjm on days 34 and 45 — the ONLY setter of `secretShared` is the secret branch itself (`conversation.js:3458`), so that villager's secret fired in a conversation the driver never transcribed: the competent policy calls `Game.talkTo` during daily play (`scripts/policies/competent.js`), and those policy conversations run the full opener logic including the secret branch. The driver-sitting funnel therefore UNDERCOUNTS the path — a 0 on driver sittings cannot by itself mean the path is quiet. Added instrument (driver only, read-only): seed-end `secretSharedEnd` — the count of villagers whose secret fired ANYWHERE in the run — printed on the Q1-SECRETPROBE panel line as `sharedEnd`. The prereg verdict (FIRES / QUIET-PATH / NO-DATA) still binds on the driver-sitting funnel as written above; `sharedEnd` is a supporting read that decides the run note's answer to "has the path gone quiet": if `sharedEnd ≥ 1` while driver sittings read 0, the finding is "fires in policy play; driver sittings undercount it", not "quiet".

## Q2 (SECONDARY, people-check dial) — V-INIT: DO VILLAGERS EVER INITIATE BONDS?

**The question.** V-INIT read 0 on r183 and r184 (player invites offered in 36 sittings on r184). Villager-initiated bonds LANDED 2026-11-06 (villagers propose bonds, warmth 15–49, targets decide by character). Do villagers ever initiate on this panel, or is the gate unreachable in sims? The analyzer counts: bond/link proposals initiated by the villager (opener thread `request` with a bond/link pending, or equivalent) vs by the player, per sitting; plus the code-read of the initiation gate (warmth window, cooldown, who can propose).

**Pre-registered decision.** If ≥1 villager-initiated proposal fires, verdict **FIRES** — read it in full (people check). If 0, the verdict names the binding stage from the code + panel counts (no eligible villagers in warmth window? cooldowns? driver never opens the sittings where it could fire?). NOT a defect verdict on a 0 alone — the gate may legitimately need conditions the panel never meets; the finding is the named stage.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4, regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT counted in Q2, D-THING, RAJ-PHOTO), Q2-TRUST carried, all-tracks read. PANEL VERDICTS read as before. Q1-VARIETY / Q1-TEACHFRAME / Q1-PLACEPROBE / Q1-FAVORBLOCK / Q1-PARTNERBLOCK / Q3-AWAY carried (r183/r184 holds; place rotation already confirmed in the wild — not re-proven, but the r184 driver fork keeps the expedition-ask picker fix and the place probe instrument, so the counts still read).

## Shape

prereg → driver/analyzer fork (r184 → r187, seed band + run tag + EVIDIR date only, PLUS the Q1 secret-funnel instrument + Q2 V-INIT count; no other instrument change) → smoke 100040 × DAYCAP=45 → pilot 100032, 100033 × DAYCAP=100 (single-seed processes; pilot gates: crash, census errors > 0, 0 census rows; confession silence is NOT a stop — see Q1 pre-registered decision) → 8-seed panel 100032–100039 (single-seed processes, parallel) → analyzer verdicts (fresh panel + full-transcript reads of any confession / V-INIT firings) → run note → gate → merge. Heartbeat loop: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r187.sh`, 10-min cadence.

## Seed freshness

Band 100032–100040. Rejected bands, all used: 100001–100031 (r129/r130/r183/r184 + smokes), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms). Freshness check (grep evidence preregs + scripts + filenames) recorded in the run note.

## Metric review (to fill at closeout)

- Q1: the secret funnel stage counts, and whether the verdict is FIRES / QUIET-PATH / NO-DATA.
- Q2: V-INIT count + the binding stage if 0.
- Whether the 8-seed panel was enough for the Q1 read, or the watch needs a different instrument (e.g. a scripted high-trust sitting).
- Whether Q2 favour/partner lines stayed VARIED (r130 rotation holds).
