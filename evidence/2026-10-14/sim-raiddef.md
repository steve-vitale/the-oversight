# sim-raiddef — RAID-CHANNEL DEFENSE (RAID-CHANNEL REMAINDER blank)

Arm: `sim-raiddef` (oversight-flesh-out-loop, run r35 2026-10-14, axis scale-onramp, ARM 3 of 3).
Type: POLICY LEVER (scripts/policies/raiddef.js, RAIDDEF=1, default OFF).
Scripts: `scripts/policies/raiddef.js` (layer), `scripts/test-raiddef-20261014.js` (proof),
`scripts/det-gate-raiddef-20261014.js` (det-gate), `scripts/sweep-raiddef-20261014.js` (pilot sweep),
`scripts/raiddef-diag-20261014.js` (diagnostic).
Data: `evidence/2026-10-14/raiddef-diag.json`, `evidence/2026-10-14/raiddef-pilot.json`.
Claims: sim-findings RAID-CHANNEL REMAINDER [claimed] (from the siegedef3 kill).

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- PRIMARY METRIC: post-unlock non-draw Haven combat deaths per wave-5 unlocker.
  GO = armed ≤ control × 0.70.
- GUARDRAILS: median survival ≥ control−5d; national ≥ control−2;
  wave-5 unlocks ≥ control−1; no new death mode (cause-family level,
  count/seed floor n≥2 per r34 metric review).
  A miss on any is NO-GO — never re-scored against a friendlier metric.
- POLICY: control = leadfeast + FEASTSCALE_R13=1 (RAIDDEF unset);
  armed = leadfeast+raiddef + FEASTSCALE_R13=1 + RAIDDEF=1.
- SEEDS: 11/22/33/44/55/66/77/88 (the plentycost road, 8-seed pilot).
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why 180: WIN-PATH HORIZON 180 (Steve 2026-10-13) — post-unlock survival is a
  late metric; shorter caps truncate exactly the long survivors it needs.
- The lever: RAID WATCH + DAWN CLEARING. On raid-ripe days the scholar builds
  a party via honest Game.inviteToParty (the competent policy never invites
  anyone — every measured non-draw death was "You're on your own"). Threats
  at the haven tile (raiders, lingerers) or followers holding the treeline
  (adjacent tile, mdef.follows) are answered proactively on the village's
  terms — party at the back, HP-gated (w5 ≥50%, w3-4 ≥60%) — via honest
  Game.triggerEncounter, instead of the scholar stumbling into them alone.
  Judgment gates: table sanctity (no engagements while the table sits),
  never engage w4+ alone when villagers available (HOLD if invites refuse),
  one answer per threat per day, never clobber a live fight/pending encounter.
- NO feast verbs, NO draw logic, NO tribute/allowance logic (loop B's live
  territory — untouched).

## Diagnostic (STEP 1 — precondition screen on current tip)

`scripts/raiddef-diag-20261014.js` re-applied the siegedef3 leadfeast
substrate (leadfeast + FEASTSCALE_R13=1, 8 seeds, 180d) and instrumented the
FULL post-unlock Haven-death surface with channel attribution:
- draw: s.feastDraw marker live at death (the feast's scavenger)
- raid-night: killer in a raid's raider set AND death within [raidDay, raidDay+1]
- lingerer: killer id ever carried m.lingering
- other: Haven combat death, none of the above

Result: 21 post-unlock Haven combat deaths across 5 unlockers —
draw 12 (57.1%), raid-night 5 (23.8%), lingerer 0, other 4 (19.0%).
Non-draw share 42.9% ≥ 30% PRECONDITION — PASS, building authorized.

Mechanism archaeology (transcripts):
- The "other" deaths are FOLLOWERS: monsters with mdef.follows trail the
  scholar across a tile boundary; at Haven they "stop at the treeline —
  pacing, unwilling. The walls end the argument. It's still out there."
  (game.js travelTo). The scholar then walks out ALONE ("You're on your
  own") and dies. s55 d107 eulogy, d128 algorithm, d163 reunion; s11 d121
  focus_group. (3/4 carry follows=True; the eulogy's path is unclear but it
  fought at the haven tile.)
- The raid-night deaths (s11 d126 reunion, d165 timeslot, d174 spool+editor;
  s44 d90 spoiler) happen even WITH a palisade — the palisade blocks the
  bedroll pendingEncounter, but raiders are PHYSICALLY on the haven grounds
  (havenRaidTick moves 3-5 entities to the haven tile) and the scholar walks
  into them.
- The competent policy NEVER builds a party (no inviteToParty calls) — every
  non-draw death was a solo fight.

## Proof (REAL RED → GREEN)

`scripts/test-raiddef-20261014.js`: 57/57 GREEN across seeds 11/42/99.
- RED (gate off): injected raider + wrapped daily → no engagement.
- NON-AGGRESSION: 20d same-seed hashes identical (leadfeast == wrapped).
- GREEN: haven-tile raider → triggerEncounter sets pendingEncounter with the
  raider's id; one-answer-per-day holds; adjacent follower (reunion,
  follows=True) → engaged as 'follower'.
- JUDGMENT: tableActive → no trigger; HP<60% → hold + counted; w4 + no party
  + villagers refuse → HOLD + counted.
- SMOKE=1: unwrap honest, harness drives the armed policy.
`scripts/det-gate-raiddef-20261014.js`: 8/8 gate-off trajectories
byte-identical (60d).

## Results — KILLED AT PILOT (primary missed)

8-seed identical-seed pilot (leadfeast control vs raiddef armed, 180d):

| metric | control | armed | GO / guardrail | verdict |
|---|---|---|---|---|
| post-unlock non-draw Haven deaths / unlocker | 1.80 (9/5) | 2.00 (14/7) | ≤ 1.26 | **NO-GO** |
| median survival | 101d | 177d | ≥ 96d | PASS |
| national | 5/8 | 6/8 | ≥ 3 | PASS |
| table | 3/8 | 6/8 | — | (up) |
| wave-5 unlocks | 5/8 | 7/8 | ≥ 4 | PASS |
| new death mode (n-floor 2 seeds) | — | lockjaw, starvation | none | FAIL |

Channel split (post-unlock Haven combat): control draw 12 / raid-night 5 /
linger 0 / other 4; armed draw 15 / raid-night 2 / lingerer 0 / other 12.

The mechanism fired — 189 engagements, raid-night deaths 5→2 — but "other"
deaths rose 4→12. The layer FEEDS scholars to unbeatable threats: s33 lost
three successive scholars (d80/d81/d82) to the same editor(w5); s11 three in
four days (influencer, editor×2); s22 three in five days. The dawn clearing's
HP gate (w5 ≥50%) is not sufficient — a w5 apex at 50% HP scholar with 2
villagers is still a likely death, and "one answer per threat per day" does
not stop the spiral when each day brings a new scholar. The correct doctrine
is AVOIDANCE of w5 threats, not engagement. Per §14 the primary miss is
NO-GO; the arm is killed, the layer deleted.

Guardrail note: the no-new-death-mode FAIL (lockjaw×3, starvation×2 on 2+
seeds) is the r34-predicted longevity confound — armed median 177d vs 101d
surfaces rare causes. The n-floor does not fix the longevity confound; filed
in metric review. The primary miss stands regardless.

## Village assessment

s33 is the story of the arm: the layer engaged 52 threats, the village
reached wave 5 (unlock d75) and the table (d117) — further than the control's
32-day collapse — but the same editor(w5) at the haven treeline killed three
scholars in three days (d80/d81/d82). Each dawn the layer saw a threat and
answered it; each dawn the threat answered back. s55 is the counter-story:
26 engagements, zero post-unlock Haven combat deaths, 180d survived — when
the threats are answerable, the doctrine works. The difference is not
courage or numbers but the threat's wave: w3/w4 the village can answer, w5
it cannot.

The sense check passes: the engagement beats name real villagers, the holds
are legible (25 HP-holds, 0 alone-holds — the party usually came), and the
raid watch reads as village prudence. The doctrine behaves sensibly; it is
simply too brave — it does not know which fights it cannot win.

## Blanks filled / documented

- CLAIMED: sim-findings RAID-CHANNEL REMAINDER (this arm — killed, not fixed).
- FILLED (measured): the non-draw Haven-death surface on the plentycost road
  — 42.9% of post-unlock Haven combat deaths (9/21: 5 raid-night, 4
  follower). The palisade answers the bedroll path, not the walk-into-raiders
  or follower-treeline paths. The competent policy's never-party is the
  common thread — every non-draw death was "You're on your own."
- FILLED (mechanism): the "other"/follower channel — mdef.follows monsters
  trail the scholar to Haven's treeline and hold ("The walls end the
  argument"); the scholar walks out alone and dies. 3/4 measured followers
  carry follows=True (algorithm, reunion, focus_group).
- DOCUMENTED (design): proactive engagement of w5 threats is HARMFUL —
  the layer's 189 engagements bought raid-night 5→2 but cost other 4→12 via
  a successor-feed spiral. AVOIDANCE, not engagement, is the w5 doctrine.
  The layer's survival gains (median 101→177d, table 3/8→6/8) are real and
  suggest a survival-primary arm with a w5-avoidance doctrine could land.

## Metric review (§14)

Primary missed cleanly (2.00 vs ≤1.26) — no re-score, no metric doubt. The
GO bar (30% reduction) assumed the layer would reduce the measured channels;
it reduced raid-night (5→2) but tripled "other" (4→12) via the engagement
spiral. If a w5-avoidance doctrine is built, it should pre-register against
the same primary — the instrument (diag + sweep + channel attribution) is
kept. The no-new-death-mode guardrail's n-floor does not survive the
longevity confound (armed lives 76d longer); a rate-based or
days-at-risk-normalized form is needed for longevity-improving arms —
proposed for the next run, not applied here.

## Wall numbers (this pilot, 8 seeds)

Control: national 5/8, table 3/8, won 0/8, wave-4 7/8, wave-5 5/8, median 101d.
Armed: national 6/8, table 6/8, won 0/8, wave-4 8/8, wave-5 7/8, median 177d.
(The wall moved on reach — table 3→6, wave-5 5→7 — but not on the primary;
the siege still grinds successions post-unlock.)
