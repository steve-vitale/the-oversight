# journey-deepening r213 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261115T1045CST`, scheduled Sun 2026-11-15 10:45 CST (16:45 UTC; run started ~16:56 UTC).
- **Run id:** `loop-a-20261115-1656`.
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 at closeout with read-back verification.
  - Rotation-history note: r212's closeout claimed 2→3, but the file read `1` when r213-establishment started (it played establishment, timed out, r214 adopted and advanced 1→2). The rotation file is authoritative and it reads `2` now, so this run plays deepening again on a fresh band. r212's run note lives in repo `evidence/2026-11-15/journey-deepening-r212.md` (NOT the goal evidence dir — the goal-dir copy does not exist).
- **Base:** local master `493b82c6c` at run start (sim-scale-onramp-round-1615 coordinator evidence). `git pull` quirk as r212 (pull fails "no such ref was fetched"; origin/master is an ancestor of HEAD — nothing to pull). No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered ~17:01Z; heartbeat stamped immediately after registration; 10-min heartbeat loop via `setsid`, PID 65764 — the r212 lesson: bare `nohup &` dies with its parent exec session).
  - Registration note: the worktree first checked out at `7a4353f68` (master-as-of-17:00Z — the landed transplant-7redef matched-band commits, already on master, NOT foreign unmerged work: verified `git log 493b82c6c..HEAD` empty and master contains them). Reset to current master `493b82c6c` before any work; worktree clean.
- **Lock:** run_id `loop-a-20261115-1656`. No lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Pre-flight:** main tree clean (0 files), disk 42%. Reap completed (0 removed, 13/16 active; dirty trees held as always).
- **Write flap:** watcher healthy on boot `4146a87f`, ALL-OK at run start (last windows #7/#8 cleared 09:48Z/10:06Z). No flap active during pre-flight.
- **Policy:** competent. Seeds: fresh **100111–100118** (8-seed panel, no smoke — the 8 seeds ARE the panel). DAYCAP=100. CONVO_DAYS [45, 60, 80] (r212 driver clone).
- **Seed freshness (per the seed-band skill):** text-file search (`*.md`/`*.txt`/`*.js`/`*.log`, both evidence trees + `scripts/`) for `10011[1-8]` = 0 hits; filename search for `*10011[1-8]*` in both evidence trees = 0 hits. A full-content boundary-token grep across the goal + repo evidence trees was attempted and terminated by the runtime (SIGTERM) after ~10 min with no output — recorded here as INCOMPLETE, mitigated by the r212 precedent: for this digit class the JSON-corpus hits are float/kcal substrings (e.g. `pantryFreshBefore 100097`, `kcal …100097…`), never seed uses, and a real seed use would also surface as a per-seed filename or a prereg line, both checked clean. (The one substring-class collision found by the loose `*10011*` filename pattern is seed **110011** — a different band, `wallbase-a-beats-s110011.json`.) Rejected bands, all used or named: 100091–100098 (r212), 100075–100082 (r192), 100083–100090 (r193), 100070–100074 (r191), 100050–100069 (r189), 100001–100058 (r129/r130/r183/r184/r187/r188/r189 + smokes), 100501–100505 (r213/r214 establishment), 100521–100536 (gorgeprice2 confirm + wave5kill-b DIAG), 190391–190398 (transplant matched band), 190561–190568 (OVE-48 fresh), 190581–190588 (7redef), 190589–190596 (8fam), 99641–99648 (wave5kill-a pilot), 99867–99882 (wave5kill-a), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms).
- **Single-seed-per-process (r183 adoption):** every seed runs as its own `node` invocation (SEEDS=<single>), 2 waves of 4 parallel.

## Standing context (read before scoring)

- **r212 (deepening, landed 2026-11-15, master 9643307d3):** Q1 A2 floor ADOPTED (proof 14/14). FAVORBLOCK total=3 → THIN-PROBE. PARTNERBLOCK total=11, beside 7/11 → REPETITIVE by the share bar but WATCH-CONTINUES, not a defect: 7 firings in 7 different sittings across 6 seeds, wants/outcomes vary, no shared trigger path — the beside variant dominates the rotation. **Metric-review proposal (this run adopts it as Q1): the decision rule needs a third branch for "share ≥ 0.5, distinct ≥ 3, no shared trigger".** Double-ask 0/103 (sixth clean panel). RE-ASK-ORPHAN 1, FROMSEED. Q2 wrinkles CONFIRMED: water-haul template ×5 across 4 seeds (3rd panel), teach-loop same-pick (Sigrun 5× teach, 2nd panel), betrayal:accept label on benign offers (27/103 sittings, all benign). NOT reconfirmed: 0-dinner villages (all 8 ate meat; thin end 1 dinner ×2), "(ended by engine)" 0, recap paraphrase 0. Moot events 6–19 (no 41-event outlier). Knowledge track HEALTHY-thin (tops=2, third panel). bank_veterans HEALTHY; gear_up tops first time on this leg. **Census: 8/8 survived to day 100–102 (first 8/8 on this leg), 8/8 wave 4, 3/8 wave 5, 4/8 global scale, max standing 577 (highest on any deepening panel).** Standing points still war/plenty only; diplomacy 0 everywhere. People check PASS (11 transcripts; Ryan's grief into a water haul, Sigrun's secret into four taught plants, Yesenia's candy bar). One dry line (Tyrone, curious path — same class as r209's Logan hit); the sitting recovers and ends engaged. Telemetry QUIET vs r192 baseline (no roll). Gate 332/340 GO, 0 attributable; instruments + evidence only, no src/js.
- **Head deltas since r212's substrate (9643307d3 → 493b82c6c):** establishment r213/r214 (plain-parting pool for friendly/neutral sittings, `c89ac24b3` [needs-eyes] — first deepening panel on the fixed code, see Q4); gorgeprice2 CONFIRM GO (armed unlocks wave 5 at 10/16 vs 4/16 control, but only 11 wave-5 kills across 16 villages); transplant-8fam matched-band NOT-CARRIER (bit-identical 4/8); transplant-7redef UNMEASURED-substrate (baseline 8/8 gate STOP); sim-wave5kill-b DIAG GO — the wave-5 killing blocker named (see Q2); scale-onramp round 1615 coordinator evidence (evidence-only).
- **sim-wave5kill-b (DIAG GO, evidence/2026-11-15/sim-wave5kill-b.md):** on 150d competent-answercourt-b corpora, every unlocked village faced wave 5 (10/10 armed, 4/4 control) but HALF the armed unlocked villages killed nothing (FACED-NOT-KILLED 5/10; kills per unlocked 1.1; kill:death 0.92; vet5 bleeds to 0 in 5/10; scholar never fights wave 5 — 0/28 deaths). Blocker 1 is the meeting, not the door. Named next lever: Producer re-engagement party (not built here).
- **Combat-play gate (Steve 2026-10-10):** no toughness/gear/ability tuning until the fight-play census lands. This run touches conversation/knowledge-instrument code only if Q1 confirms a single clear defect. The gate does not bind it.

## Q1 (PRIMARY) — THIRD-BRANCH DECISION RULE + FRESH 8-SEED PANEL

**The question.** (a) Does the adopted third branch behave as designed on synthetic inputs — the r212 panel shape reads WATCH-CONTINUES, a stuck-in-one-sitting shape still reads REPETITIVE, and the carried (11)–(14) controls still discriminate? (b) On a fresh 8-seed panel, what do the FAVORBLOCK, PARTNERBLOCK, and AWAY panel lines read under the NEW bar?

**Instrument change (this run's build, committed BEFORE any judged sim):** clone the r212 analyzer → r213 with ONLY the third-branch change in `summarizeFavorBlock`, `summarizePartnerBlock`, and `summarizeAwayLineVariety`, plus the Q2 `summarizeWave5` and Q4 `summarizeParting` additions, plus the r212 analyzer proof cloned → r213 with 6 new assertions (15)–(18), (20), (21) ((19) is the red-control invocation). Driver cloned r212 → r213 with ONLY the seed band, run tag, and EVIDIR date. Proof must be green (20/20) before the panel runs.

**The third branch (FROZEN).** Each summarizer already returns `detail` rows per sitting (`{seed, day, vid, total, patternCounts, maxRepeat}`). From them compute, for the dominant (max-pooled) pattern:
- `share` = dominant pooled count / total.
- `dominantSittings` = number of detail rows with `patternCounts[dominant] > 0` (distinct seed+day+vid sittings).
- `dominantMaxPerSitting` = max over detail rows of `patternCounts[dominant]`.
- `dominantSeeds` = distinct seeds among those rows (printed for audit).

Verdict order (blocks; AWAY keeps its total < 3 floor):
- `total < 6` (blocks) / `total < 3` (AWAY) → `THIN-PROBE` (unchanged).
- else if `distinct < 3` or `share >= 0.5`:
  - if `distinct >= 3` AND `share >= 0.5` AND `dominantSittings >= 4` AND `dominantMaxPerSitting <= 1` → **`WATCH-CONTINUES`** (rotation skew: one variant dominates the pool by hash across many independent sittings and no sitting ever hears it twice; carry as variant-pool watch, no fix).
  - else → `REPETITIVE` (unchanged).
- else → `VARIED`.

**Caveat (recorded, not hidden):** the branch is a rotation-vs-stuck proxy, not a proof of "no shared trigger". All 7 r212 beside firings DO share one trigger path — `dlg:favor_requirements` at the Haven door (verified: every beside sitting fires the block line on the favor_requirements pick). What the branch distinguishes is "one variant wins the hash across many independent sittings" from "one sitting/villager is stuck repeating the line". The run note still reads the detail rows in full for any REPETITIVE or WATCH-CONTINUES line. The `dominantSittings >= 4` bar is the line between a 2–3-sitting cluster (still REPETITIVE — see proof (12)/(14), dominant across 3 sittings) and panel-wide spread (r212: 7 sittings).

**Proof checks (new, r213):**
- (15) partnerblock, the r212 panel shape: total=11, distinct=3, beside 7 across 7 sittings (1 each) → WATCH-CONTINUES (was REPETITIVE under r212).
- (16) partnerblock, same totals but beside 7 concentrated in 2 sittings (4+3) → REPETITIVE (stuck shape — the branch must NOT fire).
- (17) favorblock, the r212 panel shape → WATCH-CONTINUES.
- (18) away, the r212 shape: total=9, distinct=3, rightnow 5 across 5 sittings (1 each) → WATCH-CONTINUES (was REPETITIVE under r212).
- (19) RED CONTROL: run the proof with `ANALYZER=./analyze-journey-deepening-r212-20261115.js` — (15)/(17)/(18) FAIL (r212 reads REPETITIVE), (16) passes, carried (11)–(14) behave as the r212 proof documents. The AWAY floor stays total < 3: the r212 note "whether the floor extends to AWAY" is answered NO — the third branch applies to AWAY, the floor does not move.
- (20) W5 id set: the frozen set in the analyzer still matches `src/data/monsters.json` wave-5 roster exactly (loadWave5Ids re-read).
- (21) Parting synthetic: transcripts — one closing with each plain-pool line → PLAIN-PARTING; one with no closing line → NO-CLOSE.
- Carried (1)–(14) must stay green under the r213 analyzer. Total: 20 assertions ((15)–(18), (20), (21) new; (19) is the red-control invocation, not an assertion — the prereg's earlier "21 checks" count was off by one and is corrected here before the panel).

**Pre-registered decision (reads straight off the analyzer's panel lines under the NEW bar — no re-scoring):**
- `THIN-PROBE` → watch CONTINUES unjudged on that block this run — carry, no verdict, no fix.
- `VARIED` → **WATCH-CLEAR** for that block — the earlier flags were panel noise at this firing rate; the watch closes.
- `WATCH-CONTINUES` → carry as variant-pool watch with the counts + detail rows; no fix. (The branch doing its job is itself the Q1(a) result.)
- `REPETITIVE` → read the detail rows in full. If one pattern is ≥50% of firings AND those sittings share one trigger path (same sitting shape / same door geometry / one villager stuck): verdict **DEFECT** — name the path; if a single clear fix exists, build it + proof test + before/after re-run in this run; else carry the diagnosis with transcript + code evidence, no game change. If REPETITIVE comes from distinct < 3 with an even spread (a content-variety question, not a trigger defect): verdict **WATCH-CONTINUES** — report counts, carry, no fix.
- FAVORBLOCK, PARTNERBLOCK, and AWAY are judged independently under the same rule.

## Q2 (SECONDARY) — WAVE-5 KILLING, DIAG READ ON A FRESH COMPETENT PANEL

**The question.** On a fresh 8-seed competent-policy panel to day 100, does the wave5kill-b shape recur — villages face the Producers and kill nothing, kill 1:1 while veterans bleed out, and the scholar stays out of the fights?

**Instrument (analyzer addition, committed BEFORE any judged sim):** `summarizeWave5(seedJSONs)` in the r213 analyzer, reading the journey seed JSONs (no driver change): frozen W5 id set `cancellation, editor, rerun, spoiler, timeslot, nielsen, finale, finale_crew, finale_opening, network_note` (re-verified against `src/data/monsters.json` in the proof — check (20)). Per seed:
- unlocked: `finalWave >= 5` (waveLog reaches wave 5); unlock day = first waveLog day with wave 5.
- `facedDistinct`: count of W5 ids present in `wavesFaced`.
- `w5kills`: total wave-5 monsters in `wildFightTable` fights with `result === 'won'` (see Amendment A1 — NOT villageSlain, whose snapshots stop at day 60).
- `w5fights`: `wildFightTable` entries with a wave-5 monster — count, partySize distribution, scholar-present count (party has `kind: 'player'`), result won/lost/fled. Guard: count must equal `fightsByWave["5"]`.
- `deathsW5`: `deaths` filtered by the W5 set on `who`, total only (see Amendment A1 — no scholar split; the journey corpus carries no `player` flag).
- class per unlocked seed (same as wave5kill-b): `NEVER-FACED` (faced 0) / `FACED-NOT-KILLED` (faced > 0, kills 0) / `KILLED` (kills > 0).
- Pooled: kills per unlocked village, kill:death ratio, FACED-NOT-KILLED share among unlocked, scholar fight/death share.

**Pre-registered decision:** instrument GO = 0 unclassified seeds (every unlocked seed lands in exactly one class, no field contradictions) AND the w5fights guard holds on every seed (count equals `fightsByWave["5"]`). The diagnostic comparison is against wave5kill-b (5/10 FACED-NOT-KILLED, 1.1 kills/unlocked, 0.92 kill:death, 150d answercourt corpora). This panel runs a different policy (competent) and horizon (100d), so NO lever verdict is judged here — the verdict is the class split + whether the faced-not-killed shape recurs. If FACED-NOT-KILLED is the majority class among unlocked seeds, the wave5kill-b blocker is CONFIRMED on competent/100d; carry to the re-engagement-party lever design. If KILLED dominates, report the split as the new datum (no re-scoring of wave5kill-b). Scholar party-presence in wave-5 fights is reported separately (see Amendment A1).

## Q3 (SECONDARY) — CARRIED-WRINKLE SWEEP

**The question.** Do the carried wrinkles from r212 recur on this fresh panel, in the same shape?

1. **Water-haul favor template** repeats near-verbatim across villagers (r212: ×5 across 4 seeds — 3rd panel).
2. **Teach-loop same-pick** repetition in one sitting (r212: Sigrun 5× teach — 2nd panel).
3. **`betrayal:accept` label** on a benign walk (r212: 27/103 sittings, all benign).
4. **Meat-dinner step** — sharpened bar this run (r212 metric review): 0 dinners on a surviving village = CONFIRMED wrinkle; exactly 1 dinner = thin-working, report counts (not the same wrinkle as 0).
5. **"(ended by engine)" closes** — sittings ending with no closing line (r212: 0; r210: Miguel's sitting).
6. **Recap paraphrase "that's still where we are"** — fewer than 3 total recurrences across the panel → THIN-PROBE, carry without a verdict.
7. **Secret-template verbatim repeat** (r212: medicine-theft secret on 2 villagers).
8. **Dry-line curious-path hit** (r212: Tyrone, 1/104 — same class as r209's Logan hit).
9. **Knowledge-goal thin engagement** (r212: tops=2, third panel — one-brain program's watch).

**Pre-registered decision:** count each wrinkle on the panel (seeds/sittings/shapes). A wrinkle counts as CONFIRMED only if it recurs on ≥2 seeds/sittings with the same shape; a single-seed occurrence stays an observation. The sweep is diagnostic: no game change unless a CONFIRMED wrinkle is a single clear defect with a proof test — otherwise carry the counts with transcript evidence.

## Q4 (NEW) — R214 PLAIN-PARTING POOL, FIRST DEEPENING PANEL

**The question.** Do deepening sittings now close with parting words? r214 fixed the gap where friendly/neutral sittings had NO mood goodbye (`convoMoodGoodbye` only covered warm/tense/cool) by adding a plain pool — `"See you around."` / `"Take care out there."` / `"Same time tomorrow, maybe."` — for friendly/neutral bands. The defect case was seed 100505 Marta: farewell, joke, "Snorts.", silence.

**Instrument (analyzer addition, committed BEFORE any judged sim):** `summarizeParting(transcripts)` — per sitting, read the driver's `closing line:` field (emitted only when the sitting ends with a closing beat; absent = the "(ended by engine)" shape): classify as `PLAIN-PARTING` (one of the 3 r214 lines), `WARM/COLD-PARTING` (one of the 4 pre-existing pool lines), `OTHER-CLOSE` (a closing line that is neither pool — e.g. a want-close beat), or `NO-CLOSE` (no `closing line:` field). Report counts panel-wide + list every NO-CLOSE sitting (seed/day/vid + last THEM line) for the full-transcript read.

**Pre-registered decision:** diagnostic, no GO/NO-GO bar. The fix predicts PLAIN-PARTING closes appear in the wild and NO-CLOSE sittings drop vs r212 (0 on that panel — note the floor: r212 already read 0 NO-CLOSE, so any NO-CLOSE here is a regression signal to read in full). If ≥2 NO-CLOSE sittings recur with the same bare-reaction shape, that's a CONFIRMED carry. Proof check (21): synthetic transcripts — one closing with each plain-pool line → PLAIN-PARTING; one with no closing line → NO-CLOSE.

## Q5 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel, GUARDLINES on the r134 6-line pool, FAVORBLOCK / PARTNERBLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE, REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST, double-ask watch. PANEL VERDICTS read as before.

## Census (Q3 context)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## People check (Q4 context)

Full transcripts read: every block-repeat sitting (Q1), every NO-CLOSE sitting (Q4), plus a sample of secret/grief sittings across the panel. SENSE-TESTING LAW: wants, consequences, specific memories — no filler loops, no fabricated shared history.

## Telemetry

`telemetry-check.js` vs the deepening baseline (8-seed sums, r192, seeds 100075–100082) on seeds 100111–100118, metrics `w3fights,engaged.w3,fightsTotal,fightsByWave.3`. Same-n panel (8 vs 8), so raw-sums comparison IS binding this run — no n-mismatch excuse. Any LOUD line is a same-run investigation item before any baseline roll.

## Shape

prereg (committed BEFORE any judged sim) → instrument clone (driver + analyzer + proof test, proof green 20/20 + red control (19) before the panel) → 8-seed panel (single-seed processes, 2 waves of 4) → analyzer verdicts (fresh panel + full-transcript reads of block repeats + NO-CLOSE sittings + wrinkle sweep) → run note → telemetry check → gate → rebase onto current master → merge. Heartbeat loop: 10-min cadence, setsid PID 65764.

## Amendment A1 (Q2 instrument correction — before any judged sim)

- `w5kills` is redefined: total wave-5 monsters in `wildFightTable` fights with `result === 'won'` (per-encounter, full horizon). The prereg's first definition (sum of `villageSlain[w5id]` at the LAST waveLog entry) is WRONG: waveLog snapshots stop at day 60 (days 2/10/25/43/60), so it misses late kills — verified on r212 seed 100091, whose last waveLog villageSlain shows {} for wave 5 while 3 wave-5 fights were won on days 74/79/93. Consistency guard: the w5fights count must equal `fightsByWave["5"]` (r212 seed 100091: 4 = 4); a mismatch is an instrument error, not a verdict.
- `deathsW5` scholar split DROPPED: the journey corpus carries no `player` flag on deaths (verified 0 flagged across all 509 deaths in r212's 8 seed JSONs). Scholar share is read from w5fights party composition (party has `kind: 'player'`), not from deaths. `deathsW5` is reported as a total only.
- Q2 decision correction: the "scholar fights in 0 wave-5 fights" confirmation condition is DROPPED. The r212 corpus already shows the scholar IN all 4 wave-5 fights on seed 100091 (party kinds include 'player' in every one), so the absent-scholar shape does not hold on the competent journey policy — the wave5kill-b corpora used a different policy (competent-answercourt-b). Blocker confirmation rests on the FACED-NOT-KILLED class majority alone, with scholar party-presence reported separately; if the scholar fights in wave-5 fights yet villages still don't kill, that is a sharper datum, not a contradiction.

## Metric review (to fill at closeout)

- Q1: proof result (19/19 + red control?) + all three panel lines under the new bar + verdicts (THIN-PROBE-carry / WATCH-CLEAR / WATCH-CONTINUES / DEFECT). Did the ≥4-sitting bar separate rotation from stuck, or did it misfire on the fresh panel?
- Q2: class split among unlocked seeds + kills/unlocked + kill:death + scholar share vs wave5kill-b; instrument errors (0?).
- Q3: per-wrinkle counts + CONFIRMED vs observation + the sharpened meat-dinner bar's first read (0 vs 1).
- Q4: PLAIN-PARTING count + NO-CLOSE list + whether any NO-CLOSE sitting repeats Marta's shape.
- Whether the 8-seed panel was enough for the Q1/Q2 verdicts, and whether any telemetry LOUD line was real.
- Whether the flap or the registry-lock queue delayed any step, and whether the rotation 2→3 write stuck (read-back).
