# journey-deepening r192 — deepening leg (days 40–80), Lane A — RUN NOTE

- **Run:** `playtest-loop-a-20261114T0945CST`, scheduled Sat 2026-11-14 09:45 CST (15:45 UTC; run started ~16:01 UTC — scheduler/queue delay ~16 min).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2`; advance 2→3 at closeout with read-back verification (owed — see closeout).
- **Base:** local master `3263ddb1f` at run start (journey-establishment r138 tip). `git pull` already up to date. No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 16:05–16:21Z, ~15 min — checkout `git reset --hard` genuinely running through the large evidence tree under box load ~13, plus a competing sim-holdpantry-b registration queued on the same registry lock; heartbeat_at stamped 16:06:26Z at registration start, so the heartbeat was already ~15 min old when the checkout finished; manual re-heartbeat landed 16:27:49Z after queuing behind the lock holder — no reaper running in the window, so the tree was never exposed to a reap while the heartbeat was queued). Heartbeat loop r192, 10-min cadence, PID 13678.
- **Lock:** run_id `2026-11-14T16:01:56Z-playtest-loop-a`. No lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Policy:** competent. Seeds: fresh **100075–100082** (8-seed panel, no smoke — the 8 seeds ARE the panel). Freshness verified per the seed-band skill: grep of all `*-prereg.md` under `evidence/` for `10007[5-9]` / `10008[0-2]` = 0 hits.
- **Commits:** `22a61e348` — Q1 prereg + instruments (analyzer proof 8/8, committed BEFORE any judged sim). Safe-commit index clobber struck the commit (repaired via the documented ls-tree pipe; verified: status clean, diff empty, all 4 hashes match HEAD). (Run-note commit owed at closeout.)
- **Corpus:** `hidden_files/evidence/2026-11-14/journey-deepening-r192-*` (goal store).

## Q1 (PRIMARY) — FAVORBLOCK WATCH ON AN 8-SEED PANEL: WATCH-CLEAR

**Verdict: WATCH-CLEAR.** Panel: total=9, distinct=4, maxRepeat=4, patternCounts={favorblock-theirside:4, favorblock-beside:2, favorblock-rightnext:1, favorblock-nextto:2} → **VARIED** (Amendment A2 share bar: 4/9 = 0.44 < 0.5, distinct 4 ≥ 3). The 9 firings sit in 9 DIFFERENT sittings (each total=1, maxRepeat=1 per sitting); the 4× theirside are spread across 4 seeds/days/villagers. No sitting repeats the line, no single trigger path. Per the pre-registered decision rule (VARIED → WATCH-CLEAR): the r191 flag was panel noise at this firing rate. The watch closes. No fix, no game change.

- **Double-ask: 0 across 72 transcripts → WATCH-CLEAR.** Fourth clean panel in a row (r188 0/135, r189 0/79, r191 0/52, r192 0/72). The r134 fix holds.
- **PARTNERBLOCK: total=4, distinct=3, maxRepeat=2 → REPETITIVE by the bar (share 2/4 = 0.5) but thin** — 4 different sittings, 1 each, no repeat within a sitting. Same shape as FAVORBLOCK's r191 flag. Carried as a watch, no fix.
- **RE-ASK-ORPHAN: 3 orphans, all FROMSEED, 0 true-no-thread.** The r191 stage-0 guard fix is visible in the wild: Miguel's sitting (100078 d45) opens with the fresh need ("I'm going hungry — do you have anything to eat?") rather than a re-ask phrasing.

## Q2 (SECONDARY) — KNOWLEDGE TRACK + MOOT PILE

- **Knowledge track pooled: tops=1, lined=0, capture=1 → HEALTHY by the panel rule** (capture > 0). Thin: the single top (Consuelo, 100080, day 80 — the LAST snap, so "never lined" is partly censoring: no later snap exists to observe a lining) and the single capture (100078, a seed with tops=0) never meet. Engagement is still near-zero: the goal tops once in 8 seeds. The r191 pooled GOALS-FAULT did not recur — carried to the one-brain program as an observation, not a fault.
  - Side note: Nora (100080) carries knowledge weight 1.0 — her highest weight — across all three snaps yet top=null throughout (objKind LEAVE). The picker never assigns her the knowledge goal at all. Same carry.
- **bank_veterans pooled GOALS-FAULT (tops=1, lined=0, capture=0):** Carlos (100081) topped it from day 26 (weight 2.0, objKind EXPEDITION, objState indoor) and it never left the door — the village died day 58. One top, one seed; carried to the one-brain program.
- **Other tracks:** party_up HEALTHY (tops 52, lined 5, capture 268), build_standing HEALTHY (14/3/42), food_security HEALTHY (24/5/1078), bonds HEALTHY (32/10/365), safety HEALTHY (17/4/207), gear_up NO-DATA.
- **Moot pile — CORRECTION:** the "moot pile" is not a knowledge pile. `knowCounts.moot` counts substring occurrences of moot-gathering narration in the capture ("There's going to be a moot" / "convenes a moot" / "The village gathers" / "moot"), with overlapping markers inflating it (100077: knowMoot 57 vs markerMoot 48). There is no itemized moot list in the seed JSON. So 100077's 57 is the highest moot-narration frequency, not wasted knowledge — r191's "knowledge going moot faster than it gets used" reading of this metric was a misread, corrected here. Moot per seed: 14, 16, 57, 17, 34, 24, 17, 31 (median ~24). The moot-gathering frequency itself is not a defect. Metric-review proposal for the next run: rename the K-CONTEXT field (mootMentions) or count moot EVENTS (distinct days) instead of substring hits.
- **Knowledge economy otherwise:** monster meat tested, revealed, and eaten on every seed (kills 10–38, reveals 2–16, dinners 1–29); the Codex grew by 25–104 entries per village; counters taught (Laura taught Snare + Pit Trap on 100077; Yara taught Cassava on 100078; Stan taught Snare on 100082; Bark armor taught on most seeds).

## Q3 — census (plain words)

Eight villages played. Five survived to day 100–101, three were lost. All eight reached wave 3; seven reached wave 4 (100075 died day 28 at wave 3). Regional on 7/8. Links form — 2–3 per surviving village (bond/links) — but standing POINTS are war/plenty only (0 diplomacy everywhere); the relationships exist, the points don't come from them. The link-less-standing question stays with the scale leg.

- **100075 — lost day 28, hunger scatter, 8 alive when they walked, pantry 0.** Never regional, max standing 0. 17 beasts slain, 6 dead (sickness ×3, monster). Codex +25. The earliest scatter on this leg's recent bands — the village never got going.
- **100076 — lost day 58, scholar-death-no-successor, 0 alive, pantry 14244.** Regional day 36, max standing 165 (war). 42 beasts, 12 dead (wild ×8, Gavel ×2). Codex +81. Ladder peaked stage 3, fell to 1 at the death.
- **100077 — survived day 101, 5 alive, pantry 20960.** Regional day 41, max standing 412 — the strongest standing on the panel. 54 beasts, 16 dead (wild ×12, monster ×2). Codex +104, the most learned. Ladder stage 3 holds.
- **100078 — survived day 101, 8 alive, pantry 5374.** Regional day 28 (earliest), max 159. 40 beasts, 6 dead (wild ×5, arena). Codex +98.
- **100079 — survived day 101, 8 alive, pantry 18968.** Regional day 34, max 275. 53 beasts, 7 dead (wild ×6, a stranger). Codex +77.
- **100080 — survived day 101, 9 alive, pantry 746 — nearly empty at the end; the most people, the least food.** Regional day 35, max 210 (plenty 60, feasts 3). 40 beasts, 5 dead. Codex +77.
- **100081 — lost day 58, scholar-death-no-successor, 0 alive, pantry 21484.** Regional day 47, max 165. The hardest-working meat village (38 kills, 16 revealed, 29 dinners) — and still lost the scholar at 58 with no successor. Ladder peaked 3, fell to 1.
- **100082 — survived day 100, 3 alive, pantry 7970.** Regional day 41, max 360. 77 beasts — the most fighting — 12 dead (wild ×8, monster ×2). Codex +93.

## Q4 — people check (full transcripts read): PASS

Four full transcripts, all coherent — people with wants, consequences, and specific memories.

- **Wolfgang, 100081 d45 (the secret that fired).** ER nurse, restless, trust 100: "Can I tell you something? I've been hiding an injury. I'm ashamed and I can't stop." The player promises secrecy; he thanks them — "I needed someone to know, and I needed it to stop there." Then the curious want: "what's the funniest thing you've seen since we got here?" — the player takes a moment, and the sitting ends ("Moving! But — good talk! More later!") with the question unanswered: planted, not broken. Small voice wrinkle: "can't stop" fits the skimming secret this line was written for, not an injury — the template bleeds across secret kinds.
- **Ivan, 100082 d60 (seek_comfort / grief).** Bus driver, fidgety, trust 97, grieving: "Have you — sorry. I keep thinking about them. Anyway." The player walks with him to his thinking place ("Don't tell the others. Everyone needs one place."), comfort lands ("They shake their head, then nod — both true at once."). Then a four-pick gossip chain (Stan won Windfall, you won The Alibi Chain, Olivia foraging, Hannah the chef) — each line specific and true, but the pick shape repeats mechanically. Ends gracefully ("I should get back to it."). Passes.
- **Miguel, 100078 d45 (favorblock-theirside).** Hungry rail conductor, anxious: "I'm going hungry — do you have anything to eat? Anything at all? My hands shake when I try to work." Requirements → the theirside block line → commit → "Thank you. I won't forget who fed me when it mattered." Promised. The r191 fix visible: the need speaks fresh, no re-ask.
- **Zoltan, 100080 d45 (favorblock-nextto, pre-fix wording).** Withdrawn mushroom grower, hungry: opens on the roads ("Have you seen anyone on the roads? Anyone at all? I'm asking everyone."), then the food ask, block, commit, promised. Coherent.

No senseless dialogue found this run. No fabricated shared history in the wild panel.

## Q5 (carried, read-only)

LADDER opens 8/8, mints 5/5, holds 6/8. SECRET-PROBE FIRES (1 fired, sharedEnd 35). PLACEPROBE bottleneck FIRES (3/73 sittings with places). B-SIT 28 (accept 15 / decline 13, 0 unanswered); B-FOLLOW 15 (5 with new betrayal); P-KEEP 15 (DEAD 11, SILENT 2, NO-LATER-SITTING 2). FIZZLE-FIX HOLDS (0 dry sittings). BOND-TELEMETRY PRESENT (121 tele, 59 proposals, 26 decisions, 9 accepts, 11 initiated bonds). REQUESTS REACHED (48 staged, 33 decided, 14 expired, 3 talkable-untalked). BOND-CHOICE 32/32 answered. LANGGATE NOT-REPRODUCED; LANGARC ARC-FIRES (6 sittings, 2 grants, 2 flips, 0 unmatched). MENU-FLIP NO FLIPS (fix holds). TEACHFRAME VARIED (4 frames, 4 distinct). TRUST: deaths 57, knownGains 83, lateGains 0 — TRUST-EARNED-ONLY on 7/8 seeds, r119 verdict stands. AWAY-LINE OLD LINE GONE. AWAY REPETITIVE thin (dawnmeet ×2, n=3) — carry. D-THING 11 pocketed / 4 testable / 2 named. RAJ-PHOTO 0. DEBRIEF: villageLost 3, all attributed, 0 unclassified. SOFTWARM 0. GUARDLINES 5. REPLAY NOT-REPRODUCED. CISTERN CLEAN.

## Telemetry + baseline re-seed (the r189/r191 proposal — DONE this run)

- Check vs the old baseline (4-seed sums, r120 Nov 9): tool **QUIET** on raw sums (w3fights 35 vs 33, engaged.w3 42 vs 28, fightsTotal 139 vs 104, fightsByWave.3 35 vs 34 — all under the 60% bar). Per-seed means: 4.38 / 5.25 / 17.38 / 4.38 vs baseline means 8.25 / 7.0 / 26.0 / 8.5 (−47% / −25% / −33% / −49%).
- **Adjudication: EXPLAINED — band variance + baseline staleness, not a new deviation.** Band means bounced 8.25 (r120) → ~2 (r189, LOUD −76%) → 6.75 (r191) → 4.38 (r192); all four fight metrics move together (a pacing/exposure signature, not a wave-3 mechanism break — villages still reach wave 4, fight, kill, and the ladder mints); no combat code changed this run. The tool's raw-sums quiet is an artifact of the n-mismatch (8-seed sums ≈ 4-seed sums only because per-seed halved) — the means comparison is the honest one, and it still sits inside the observed band range.
- **Re-seed DONE:** `telemetry-baselines/deepening.json` now holds 8-seed sums (35/42/139/35) with `_meta` corrected to n=8, panel r192 seeds 100075–100082, per-seed means + band history recorded in the reseeded note; old baseline backed up to `deepening.json.20261114-pre-r192.bak`. Verify run vs the new baseline: quiet (exit 0).

## Gate

`node scripts/check.js --quick` (340 scripts, 4 parallel, 1231s): **333 passed, 7 failed — GO after adjudication (0 attributable to this run).** Log `hidden_files/journey-deepening-r192-gate.log`, standalone log `hidden_files/journey-deepening-r192-gate-standalone.log`.
- The 7 failures: 6× 120s load timeouts under the parallel gate (living-garden, occupation-panels, one-person-army, trust-observer-neutrality, synergy-stall, capable-bot) + phone-frame-proof (stale receipt — index.html, same pre-existing failure as r189/r191/r197; the receipt refresh is a separate owed job, not this run's). Notably ABSENT vs r191/r197: the measurement-proof-update + measurement-workflow staleness pair and test-measurement-cache-flags both passed this run.
- Standalone re-runs: occupation-panels 25/25, one-person-army rc=0, trust-observer-neutrality 6/6, synergy-stall rc=0, capable-bot 42/42 — all green. Living-garden needed a 600s budget (took 308s standalone under current load; r197's took 222s) and passed rc=0. All 6 timeouts are load artifacts, not code failures.
- This run changed no `src/js` (scripts + evidence + baseline only); no conversation test failed, and the r192 analyzer proof is 8/8 green.

## Metric review (§14)

- Q1's metric worked as written: the analyzer's VARIED verdict decided WATCH-CLEAR without re-scoring. The 9 firings across 9 sittings is the cleanest possible variety read. The PARTNERBLOCK REPETITIVE flag at n=4/max-2 (share 0.5) shows the share bar fires on tiny totals — same thinness r191 noted for FAVORBLOCK; the next run should keep the watch rather than treat it as a defect. (Same for AWAY at n=3.)
- Q2's metric worked after the moot correction: the pooled GOALS-FAULT bar (tops ≥4) never triggered — tops=1 — so no diagnosis was owed by the letter, but the thin-HEALTHY shape (top and capture on different seeds) deserved the paragraph it got. The moot instrument needs a correction for the NEXT run: knowMoot is a narration-frequency count with overlapping markers, not a pile — the "moot pile" reading in r191 and in this run's prereg was wrong. Proposal: rename the field (mootMentions) or count moot EVENTS (distinct days) instead.
- The 8-seed panel was enough for Q1 (9 firings, clean variety), for the re-seed, and for the biggest deepening census yet; the survival picture is stable vs r191 (2/4) and r189 (5/8).
- The registry-lock queue delayed registration ~15 min and the re-heartbeat ~6 min; no work lost, no reaper exposure (no reaper running in the window). The rotation 2→3 write is owed at closeout with read-back verification.

## Verdicts

- **Reachable:** yes — wave 4 on 7/8 villages, regional on 7/8, ladder stage 3 on 5/8, links on 7/8, bonds, secrets, and the meat economy all fire in the wild.
- **Fun:** yes — the transcripts read like people (Ivan's grief, Wolfgang's secret, Miguel's shaking hands), and the villages that survived did so with standing to show for it. The two scholar-death losses and the day-28 hunger scatter are the game's hard edges, not dead ends.
- **Winnable:** partial — 5/8 survive to day 100–101, one reaches 412 standing, but no village reaches national or the table; this leg ends before the seat, and standing points are still war/plenty only. The link-less-standing question stays with the scale leg.

## Notes for the next run

- **Rotation:** advance 2→3 at closeout with read-back verification. Next leg is scale (days 80–140).
- **Next blank (r193):** the scale leg owns the link-less standing road; this panel adds 8 seeds of evidence (links form 2–3 per village, standing points stay war/plenty).
- **Carried:** PARTNERBLOCK watch (REPETITIVE thin, n=4); AWAY watch (REPETITIVE thin, n=3); knowledge-goal thin engagement + Nora top-null (one-brain); bank_veterans GOALS-FAULT thin (one-brain); moot metric correction (rename/redefine — the pile reading is wrong); Wolfgang injury-secret "can't stop" template bleed (voice wrinkle, not a defect); Ivan gossip-chain pick repetition (content varies, shape repeats).
- **Held tree (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale) still holds the unlanded revert of the live sim-wideduty-a medic-duty code in `src/js/game.js`. Real work-in-progress, not scratch — not released, not touched. Flagged again.
- **No src/js change this run** (instruments + evidence + baseline only).
