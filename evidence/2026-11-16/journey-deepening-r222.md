# Journey deepening r222 — run note

- Run: r222, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218)
- Run id: playtest-a-20261116T0620Z (lock loop-a-20261116T062004Z)
- Base: master 209704334 (worktree journey-deepening, registered 06:24Z)
- Policy: competent, single arm, linger-guard ON (current master; r218 settled guard stays)
- Seeds: 102001–102008 (fresh band; full check in the prereg — 0 prereg-md hits, 0 panel-log hits)
- Driver: fork of scripts/journey-deepening-r218-20261115.js (band + tag + EVIDIR date + trickEnd snapshot only; no picker/policy change). Analyzer fork + new summarizeTrickPipeline; proof test 29/29 green (4 new: (27)–(30)).
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md § Monster counters.
- Evidence: evidence/2026-11-16/journey-deepening-r222-prereg.md (repo) + corpora in goal hidden_files/evidence/2026-11-16/ (8 seed JSONs, transcripts, analyzer log).

## Q1 — TRICK-KNOWLEDGE PIPELINE: NO-GO (the pipeline FLOWS)

Verdict: **TRICK-PIPELINE-FLOWS**. All three prereg bars missed, so the
aidgate door problem sits elsewhere — the village is NOT trick-starved.

- taughtRate: null — countered12 is EMPTY panel-wide (0/8 seeds have a
  slain-unknown wave 1–2 countered type left untaught at day 80). The
  village knows every wave 1–2 trick by day 80: 11 types taught across
  the panel (sunbasker, moderator, belltoad, giant_mosquito, paparazzo,
  voice_mimic_radio, sunback, understudy, heckler, warranty_caller,
  drumbelly_tanuki); countersKnown runs 20–33 types per seed.
- learnedRate: 0.69 — 9/13 wave-3+ signature tricks learned
  (callback, gavel, buffering, redactor, spool, focus_group,
  congregation, strike, ad_break). Unlearned: terms_of_service,
  chorus_line, influencer, herald.
- asks: 105 beasttricks asks panel-wide, 11 taught, 94 none-no-counter,
  **0 none-other** (the r92 bug class never fires).
- Wave-4 kills: 6 across 33 fights; 3 with the trick known at end, 3
  without. Seed 102006 killed 3/3 with known tricks and banked 2 — the
  only seed to unlock wave 5. Knowledge helps, but kills also happen
  without it; the binding constraint on wave-4 kills is not knowledge
  alone.
- Stalls: flows 8/8. No seed stalls at any pipeline step.
- **Thin spot (finding, below the prereg bar):** wave-4 signature tricks
  stall at ONE observation on 6/8 seeds — herald (102002/102004/102008),
  reunion (102001/102003), algorithm (102001/102007), suburb
  (102005/102006), eulogy (102003/102007), audit (102004). The village
  meets a wave-4 entity once, survives, and never meets it again before
  day 100. The observation channel (2 survived encounters) is
  encounter-starved at wave 4, not broken: wave-3 tricks DO complete
  (9/13). The door consults trick-hold 6/7 for a different reason than
  general trick scarcity — the consult likely wants a SPECIFIC trick
  (the door entity's), and the village's wave-4 trick book is thin
  exactly there. Next lever (teaching/scouting/lingerer-hunt per the
  aidgate note) should target wave-4 re-encounters, not general
  teaching.

## Q1 comparison — r218 guard-ON arm (8 seeds, 100d) vs r222

| | r218 ON | r222 |
|---|---|---|
| w4 fights | 37 | 33 |
| w4 kills | 2 | 6 |
| kills/seed | 0.25 | 0.75 |
| banked 2 | 0 | 1 |
| unlocked w5 | 0 | 1 |
| playerDeaths | 30 | 31 |
| wild playerDeaths | 22 | 16 |

Kills 2→6 and one wave-5 unlock read better, but no combat code changed
since r218 (net src diff dialogue-only: r219 goon ask-tag, r220/r221
test-side) — this is band composition, not a lever effect. Still far
from r212 levels (≥8 kills, wave-5 unlocks) and far from winnable:
wave 5 unlocked on 1 seed and never faced (0 fights, 0 kills).
Scholar deaths flat (31 vs 30); wild deaths down 22→16.

## Q2 — FAVORLESS-ASK WATCH: does NOT reproduce as the r221 shape

34 raised ask_favor sittings in deepening; **0 with no favor at all**
in the ledger (start/end snapshots both null). 18 have a FRESH favor
(askedDay == sitting day: forage_help 4, water_haul 5, heal_help 4,
sick_help 1, food_share 4). 16 have only a STALE favor (askedDay <
sitting day) — read two in full:

- 102002 d10 Grayson: the sitting's real content is a LINK proposal
  (Emberhold), accepted; the stale food_share favor is unrelated. The
  ask_favor label rides a link sitting — a labeling mismatch, not a
  favorless ask.
- 102006 d32 Ingrid: "About the pantry run — I still haven't found
  anyone. Any chance?" — a legitimate re-ask of a genuinely open
  favor, committed ("I'll come back to help"), resolution stated.

Moods of the 34 askers: steady 12, grateful 8, hungry 7, grieving 6,
cheerful 1 — no distressed cluster like r221's starving Ivy / sick
Dale. **Verdict: the r221 blank does not reproduce in deepening.**
The deepening variant (stale-only re-ask / link-under-ask_favor-label)
is real content, not a villager asking for help the game cannot name.
Carried to the next establishment run as a one-line note, not a Q1.

## Q3 — PEOPLE CHECK: PASS with a wart (seed 102001, Onni, read in full)

- **Day 60 (grieving, trust 82): PASS, genuinely human.** Onni mourns
  Ashanti: "Ashanti always took the burnt piece. Said someone had to.
  I take it now." / "I keep turning over the last thing Ashanti said
  to me. I can't tell if I'm remembering it right, and that's somehow
  the worst part." / "We bury, we grieve, we keep going. There's no
  step four." The want (seek_comfort) is engaged, options engage it,
  ending resolves (engaged, "Thanks for... you know. Just listening.").
- **Day 80 (hungry, trust 92): THIN.** Opens with continuity that
  works — "I tried the Ghost Pipe like you showed me. Didn't poison
  anyone, so that's a win" (a callback to the day-60 teach). Then the
  sitting becomes three teach picks in a row (Maypop, Wild Onion,
  Goji Berry) — a lecture, not a conversation; want stays pocketed,
  stage 0, unestablished. The betrayal:accept lead-in yields a walk
  to the tree line with "Nothing much there." Driver-pick artifact
  (teach always available, picker favors it), not an engine defect —
  but three teaches in one sitting reads like a lesson, not a talk.
  Polish wart, documented not fixed.

## Q4 — census (plain words)

Eight villages, 100 days. **6/8 survived** (102003–102008);
102001 lost d94 (scatter-hunger), 102002 lost d75. All reached wave 4;
102006 alone unlocked wave 5 (d101, never faced).

- **The living (43 across 8 villages):** 102006 is the strong one
  (10 alive: Amol, Mykhailo, Nino, Rafael, Xavier, Jovan, Ingrid,
  Meera, Lena, Theo — ladder stage 3, regional, 3 wave-4 kills).
  102005 holds 8 (Matahi, Jorge, Daniyar, Yuki, Vasyl, Boris,
  Xavier, James). 102007 ends with just Leo and Hannah alive — a
  village of two that survived to day 100. 102001 ends with Onni and
  Nora; 102002 with Somchai alone.
- **The dying:** 351 monsters killed by villagers; 83 human deaths
  (76 villagers + 7 persons). Causes: killed by monsters 21,
  scholar lost in the wild 16, sickness 12, thirst 6, the arena 6,
  ambush 5, contest 4, starvation 4, wound 3, lockjaw 2, other 4.
  The villages die fighting and sick, not hungry — same shape as
  every deepening panel.
- **Scholar deaths:** 31 across the panel (16 in the wild) — flat
  vs r218 ON (30). Successions carried on every time; no village
  was lost for lack of a successor.
- **What they knew:** 20–33 monster counters known per village at
  end; 1–6 wave-3 signature tricks held. Ladder: opens 8/8, all five
  tracks minted on all 8 seeds, holds 7/8 — regional standing is
  routine by day 40 (stage 3); national never reached in this leg.
- **Social life:** 144 bond telemetry events, 68 proposals, 22
  decisions, 11 accepts (0.50), 22 link raises, 14 initiated bonds;
  requests staged 61, decided 46, expired 15 (7 talkable-untasked).
  Fizzle fix holds (0 dry sittings). Favor block VARIED (12 total,
  max share 0.33). One secret opener panel-wide (THIN-PROBE).

## Reachable / fun / winnable

- **Reachable: YES.** Wave 4 reached 8/8, wave 5 unlocked 1/8 (never
  faced). Regional standing 8/8.
- **Fun: YES, with the day-80 wart.** Conversations are the
  strength (day-60 Onni is the best grief writing this leg has
  produced); the teach-triple sitting is the dull spot.
- **Winnable: NOT YET.** Wave-5 facing 0/8, wave-5 kills 0/8, full
  seat 0/8. The chain now reads: wave-4 kills 6 (up from 2) →
  veterans banked on 1 seed → wave-5 unlocked on 1 seed → never
  faced. The door is the next choke, and the trick pipeline is
  exonerated as its cause.

## Gate / telemetry

- Gate: `node scripts/check.js --quick` (cache /tmp/jest-cache-playtest)
  — **334 passed, 6 failed in 859s, 0 attributable.** The 6 are the
  standing set, identical to r221's stash-verified set: measurement-proof
  staleness pair (test-measurement-proof-update.js,
  test-measurement-workflow.js "retained neutrality proof"), phone-frame
  staleness trio (test-phone-frame-proof.js, stale receipt: index.html),
  2× 120s deed-attainment load timeouts (living-garden,
  one-person-army), ladder-bundle ambient-raid control (fires 0 without
  delivery). Attribution: this branch modifies ZERO tracked files
  (`git diff HEAD` empty; 5 untracked new files only, no src/js) — no
  existing test's inputs changed, so all 6 are pre-existing on the base
  by construction. r222 proof test 29/29 green standalone (per-run
  analyzer proofs are not in the green list / gate, same as r218).
- Telemetry: `telemetry-check.js --baseline .../deepening.json
  --current 'evidence/2026-11-16/journey-deepening-r222-on-seed*.json'
  --metrics fightsTotal,wave4,standing` — **quiet** (8 files, 3 metrics,
  no large deviations). Baseline NOT rolled.

## Metric review

- **Scholar-deaths bar misapplied in the prereg:** the ≤2/panel bar is
  an ESTABLISHMENT-leg bar (r221 proposal: ≤2 per 5-seed panel, both
  "lost in the wild"). Applied to deepening it reads 31 and looks like
  a trip — it is not: r218 ON read 30 on the same instrument. The
  deepening-comparable is the r218 ON arm (30 total, 22 wild); r222
  reads 31 total, 16 wild — flat on total, down on wild. Next
  deepening prereg should carry the r218-ON comparison, not the
  establishment bar.
- **Stall classifier masks the wave-4 stall:** a seed reads 'flows'
  while its wave-4 tricks are all obs-stalled (6/8 seeds), because
  wave 1–2 discoveries keep discoveredTypes non-empty. Next run's
  summarizeTrickPipeline should split the stall by wave (w1-2 vs
  w3+), so a healthy low-wave pipeline cannot hide a stalled
  wave-4 pipeline.
- **taughtRate null is informative, not missing:** an empty
  countered12 means the wave 1–2 pipeline is fully drained, not that
  the metric failed. Keep null (with the panelCountered12 list) rather
  than coercing to 0 or 1.
- **farUnreached / scholar-deaths-watch:** unchanged from r221.

## Blanks filled / documented

- **Documented (not fixed):** wave-4 trick observation starvation —
  6/8 seeds have wave-4 types stuck at 1/2 observations at day 100.
  No src/js change: the mechanism (2 survived encounters) is
  by-design; the fix, if any, is a lever (re-encounters /
  scouting / lingerer-hunt) per the aidgate note, not a bug fix.
- **Documented (not fixed):** teach-triple sitting (day-80 Onni) —
  driver-pick artifact; polish wart.
- **Instrument landed:** summarizeTrickPipeline + trickEnd snapshot
  (driver pure-read) + proof 29/29.

## Infra notes

- Reaper skipped pre-flight (4th consecutive skip — registry lock
  held by a live reaper run started 06:18Z, inside its normal 9–14
  min scan window; verified live, not stuck). Known self-contention;
  Steve's nod on the fix still owed. No cleanup this run.
- Worktree registration queued ~3 min on the same lock; heartbeat
  landed immediately after registration and was refreshed through
  the run (panel + gate).
- **VM replacement killed gate run #1:** the first `check.js --quick`
  run was SIGTERM'd ~07:06Z when the VM was replaced (uptime reset to
  1 min; /tmp wiped, gate log lost). Worktree, registry, lock, and all
  evidence survived (all under ~/workspace). Gate re-run with the log
  in persistent evidence (journey-deepening-r222-gate.log): 334/6 in
  859s. Flap watcher: (main session owns the restart — not checked
  here).
- Safe-commit index clobber: (filled at closeout — repair via
  `ls-tree -r HEAD | update-index --add --index-info` if struck).
- Master moved mid-run (sim-seedattach-a evidence landed between
  the 06:20 pull and the 06:24 registration); worktree base is the
  newer tip 209704334.

## Landing

- (filled at closeout: commits, merge, rotation 2→3, lock deletion)
