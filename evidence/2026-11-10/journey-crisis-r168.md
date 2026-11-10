# Journey crisis r168 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start (written by the r167-social
closeout; r164-crisis wrote 7, r167-social then wrote 6 — the file is the
authority); this run writes 7 (succession next) at closeout. Run r168
follows social r167 (landed 2026-11-09) and crisis r164 (landed
2026-11-09). Base: master 00528fb72 (r167 run-note commit). Prereg:
goal hidden_files/evidence/2026-11-10/journey-crisis-r168-prereg.md
(seeds 14201–14205, fresh band, verified). Policy oracleV2, 150d
death-aware +10d tail (120d → 150d per r164 metric review — the leg's
harder-stress question). 5-seed panel, sequential — no pilot gate (the
5-seed panel IS the minimum Q1/Q12 instrument). Driver
scripts/journey-crisis-r168-delayed-20261110.js, analyzer
scripts/analyze-crisis-r168-delayed-20261110.js (r164 verbatim except
r168 names/seeds/labels + party-name pick varies by seed + turn cap
12→16 + day-60 stash sample).

## PRE-FLIGHT / INFRASTRUCTURE

- No lock at run start (r167's closeout deleted it); new lock
  2026-11-10T05:55:55Z written. Main tree clean, disk 33%.
- `git pull --ff-only` FAILED (standing divergence — local master ahead
  358, behind 156 vs origin/master; Steve's Cursor PRs #118–#121 pushed
  directly to GitHub master, bypassing the ship loop; ship blocked 6
  times, Steve's reconciliation answer still pending since Nov 8).
  Proceeded on local master per the loop body's procedure (r156/r164
  adoption precedent), reported LOUDLY. No push, no bump — the ship
  loop owns reconciliation.
- Worktree journey2-crisis registered 05:57:02Z; registration itself
  took ~12 min (registry flock held by sibling reaper/loops; the
  `git worktree add` checkout ran ~10 min under contention). Heartbeat
  kept <15 min throughout (06:09, ~06:45, ~07:05, ~07:20Z).

## BASE MOVEMENT (since r164)

Master 2215e22d4 → 00528fb72. Game-code changes (src/, 7 files,
+874/−18): conversation.js +96 (r167 coach prior-deflect no-repeat
fix; convo wants/dialogue/scene changes); contests.js +23 (death-ledger
write on the arena-lost path — comment says "This changes the CHOICE,
not the death rate"); convo-dialogue.js +25; convo-scene.js +9;
convo-wants.js +24; truth.js +15 (r167 coach-repeat suppression);
foreignSpeech.json +700 lines (r167 no-words agree pools 4→8). NOT a
pure re-measurement — cross-panel deltas are confounded; the panel
judges the current base on its own bars. Canon read: docs/CANON.md +
docs/DISEASES.md (two pools; medic-duty cures are mundane medicine for
mundane disease — no canon conflict).

## INSTRUMENT VALIDATION (before any scored seed)

- Proof test scripts/test-journey-crisis-r168-instruments.js: 14/14
  PASS (party-name pick varies 0/1/2, out-of-range fallback, missing-ctx
  default 2, party pick outranks gq:, panel seeds map to indices
  2,0,1,2,0, non-party regression x2, cap 16 source checks x3,
  stashMid source checks x2). RED verified on the r164 driver: old
  pickConvoChoice returns party_namepick:2 for indices 0, 1 and 2 alike
  (the splice-reversal in partyConvoChoices puts :2 first, and the old
  first-non-leave fallback always lands on it — "The Company" on three
  straight panels, confirmed as driver artifact).
- Analyzer validated on r164's JSONs: the r168 analyzer output diffs
  from r164-analysis.txt in exactly ONE place — the five medic-duty
  lines gain `"stashMid":null` (the new field, absent in r164 JSONs).
  All other 682 lines reproduce exactly.
- Smoke: SEED=14201 DAYS=5, exit 0, no instrumentErrors; stashMid
  unset before day 60 as designed.
- Determinism proof: seed 14201 full 150d run twice — panel JSON
  BYTE-IDENTICAL, transcripts identical. Instrument is
  trajectory-neutral. The panel's seed-14201 JSON also matches the
  determinism run byte-identically.
- ATTRIBUTION DIAGNOSTICS (not scored panel data): the 0/5 panel
  demanded a base-vs-seed check before any claim. (1) r164 driver,
  seed 14101, 120d, CURRENT base → 120d horizon, 9 alive, 48 gorge
  nights, BYTE-IDENTICAL to r164's own run: the base did NOT change
  lethality. (2) r168 driver, seed 14101, 150d → horizon, 5 alive,
  pantry 18,423: the old "easy" seed survives the longer horizon, but
  its trajectory diverges from the r164 driver (raids/gorge differ —
  the cap 12→16 change has trajectory effects through longer sittings,
  as expected; determinism within one driver is what the panel needs).
  Conclusion: the 0/5 is SEED variance on a hard band, not a base
  regression and not a driver artifact.

## PANEL (judged)

Seeds 14201–14205, oracleV2, 150d +10d tail. Ran ~07:00–07:04Z.
instrumentErrors [] on all 5 seeds. Per-seed .err files carry only the
benign retired-feastBurn notice.

| seed | days | end | raids | gorge | sorties | convos | alive | pantry |
|------|------|-----|-------|-------|---------|--------|-------|--------|
| 14201 | 128 | game-over | 11 | 6 | 2 | 8 | 0 | 2422 |
| 14202 | 80 | game-over (scattered) | 6 | 4 | 1 | 8 | 2 | 0 |
| 14203 | 108 | game-over | 10 | 23 | 5 | 8 | 0 | 18755 |
| 14204 | 84 | game-over (scattered) | 6 | 16 | 3 | 8 | 1 | 0 |
| 14205 | 76 | game-over | 5 | 8 | 3 | 7 | 0 | 0 |

Attempts 14, ok 8, refused 6, cleared(remaining0) 4, deltaExact 8,
deltaBad []. Gorge nights 57, gorgeKcal 69,388. Convos 39,
fabricHits 0. Sortie fights 11. D1 delayed>=3: 14/14. D2 clear rate
ok 4/8. Missed-window corrected 7, per-day 7 — SPLIT: valve-expiry 3
/ per-day 3, drawn-off 4 / per-day 4. C7b buried: 14201 Marcus Okafor;
14202 Rosa Lund; 14203 Zuri Yin / Chantal Mukendi / Landon Kang /
Jovan Milic; 14204 Salvador Zielinski / Ethan Hunt; 14205 Priya Gibson
/ Frank Flynn / Camila. G-ID watch: 15th panel at zero id-matched
gorge-after-clear (name-matched 4). WRAP: 39 transcripts, 39 marked,
unmarked 0 (37 engine-ended, 2 refused/ended). SOFTLOCK: 0 seeds.
BENCH (watch): 6 refusals, 5 supply-empty (livingBesidesPlayer 0) and
1 gate-one-short (14203 d111, musterAvailable 1, livingBesidesPlayer
1); alive-bench refusals 0 this panel — the r164 nodeAway story does
NOT reproduce; the bench here is bare because everyone is dead.
W1: no same-set re-musters, no ok sorties / full clears after a
refusal — count stays 66/4/4/1. Fight-1: okSorties 8, brokeAfterFight1
1 (vTaken 119, vFlee), cleared 7; clearedOpeners {mFlee:4, vKill:3},
brokeAfter1Openers {vFlee:1}; the vTaken>=~70 break clause stays
untested in isolation (the one >=70 break also opened vFlee).
Multi-monster set clear 3/4. R59 TRUE early count 0. Phoenix burns 0
everywhere. D3 drift labels: player-drawn-off 33, sortie-clear 7,
moved-on-valve 3, unknown 0. No-repeat rule: 68 redirects, 0 forced.
Turn cap 16: 0 cap-breaks in 39 transcripts (the r164 12-turn cuts
would now fit).

MEDIC DUTY census (live holder + spans + stash, now with day-60
mid-run sample):
- 14201: spans Gudrun d3–11, Kenji d15–28, Amara d29–35, Omar d29–31,
  Kayden d37–120, Josue d123–125; blocked 82, cures ability 14 /
  medicine 0, stashMid d60 {} / census {}.
- 14202: spans Fatima d2–26, Andre d27–51, Ursula d53–66, Nikolai
  d67–70; blocked 35, cures 5/0, stashMid d60 {} / census {}.
- 14203: spans Emma d2–88, Fatima d91–108; blocked 68, cures 15/0,
  stashMid d61 {} / census {}.
- 14204: spans Chris d3–55, David d58–84; blocked 57, cures 13/0,
  stashMid d60 {} / census {}.
- 14205: spans Wanjiru d3–26, Victor d29–71; blocked 43, cures 10/0,
  stashMid d60 {} / census {}.
- Medicine cures 0/5 AGAIN — and the new mid-run sample CONFIRMS the
  r164 supply attribution: the pharmacy is empty at day 60 too, not
  just at census. The channel is starved of supply, never stocked
  mid-run either. No holder died on a sortie (canary clear).

## VILLAGE ASSESSMENT (plain words)

Five villages, 150 days each, played by a competent bot that forages,
waits, drinks, answers every lingerer set with a sortie, and talks to
whoever is standing by the fire. **All five died** — the first 0/5
panel in the crisis leg's recent sequence (r164: 5/5 horizon, 31
alive). Three alive in total at the end (0+2+0+1+0). The villages did
not starve: they bled out in the wild and scattered.

- 14201 (Seattle), 128 days, game-over, 0 alive. The longest-lived.
  Amara's arc carries it: the staying question, the naming debate,
  the party named "The Company" (seed index 2), Amara taking Scout,
  the sickness favor kept and thanked ("You came through on the
  sickness I'm fighting. I won't forget it."), the Thornfield link
  proposal. Marcus dies early and is mourned all run ("Since Marcus
  died... I keep expecting to see Marcus at the fire"). The village
  ends with pantry 2,422 and nobody left to eat it.
- 14202 (Boston), 80 days, game-over SCATTERED, 2 alive. Fatima's
  village: the pantry-run favor with real stakes ("Another day like
  today and we're choosing who eats"), the declined favor with
  consequences ("They'll just stop asking"), the party named "FINAL
  GIRLS CLUB" (seed index 0 — the first non-Company name in four
  panels), Fatima taking Scout — then Fatima dies in the arena and
  Andre steps up ("If I don't step up, someone worse will. That's
  not ambition, that's arithmetic."). The village scatters with two
  people left.
- 14203 (Austin), 108 days, game-over, 0 alive. The richest corpse:
  pantry 18,755 at death. Landon's control-group theory, Esther's
  "The Second Try" (seed index 1), the table foreshadowed ("They say
  the table's coming. For us."), Jordan's stockpile gift (+4 wood,
  +4 fiber). The gorge nights pile up (23) and the wild takes them
  one by one — 8 wild deaths, 4 monster, 2 combat, 2 arena.
- 14204 (Chicago), 84 days, game-over SCATTERED, 1 alive. The water
  village: Nora's 4-liter haul with real math, Petra's away-from-Haven
  refusal ("find me when I'm back"), Chris's confession ("I wasn't
  a Baker. I was an army medic."), Yara dreaming in Beirut weather,
  Mashael's buried food cache (+972 kcal). Brian starves on d79 while
  the village still has hands to haul — the last survivor is alone
  with the creek.
- 14205 (Phoenix), 76 days, game-over, 0 alive. The shortest run.
  Wanjiru's puffball forage, Dmitri's "The fire doesn't care",
  Hunter writing everything down for Dmitri, Victor's doubt-press
  escalation ("I've told you what I've told you."), the party named
  "PLOT ARMOR" (seed index 0). Seven people dead by d75, the last
  four in two days (d71–d75: monster, Gavel, monster, the night,
  wild x3).

Across the panel: the dying is the wild (13/23 corpses on 14201, 8/18
on 14203, 10/16 on 14204), then monsters, contests and the arena —
not famine (2 starvation corpses in the whole panel, both on villages
that also lost everyone to the wild) and not thirst (0 thirst
corpses). Two villages scatter rather than going extinct — the ending
has a shape the horizon panels never show. The crisis loop
(linger → gorge → sortie) fires reliably and the fight-1 frame holds
on the villages that live long enough to fight it. The headline is
the bend itself: Q12 answered — the panel bends and breaks, 0/5
horizons, and the attribution diagnostics prove it is the seeds, not
the base and not the driver.

## VERDICTS (prereg bars, §14 binding)

- C1 (bend, not break) GO — non-vacuously this time: 5 game-overs,
  causes named per seed (wild attrition + monster + arena/contest;
  14202/14204 scattered with 2/1 alive). No game-over is a
  siege-mechanic failure; no softlock. Q12 answered: the panel bends.
- C2 (episodes fire + gates hold) GO: raids fired on all seeds;
  fought resolutions present; D1 14/14 delayed>=3; deltaBad empty;
  D3 drift unknown = 0. Missed-window corrected 7 — the instrument
  look (trigger >= 8) does NOT fire.
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable
  case fired or was refused with a recorded reason (6 refusals, all
  "no-fighters"); no boundary-firable case unfired.
- BENCH (watch): 6 refusals, 5 supply-empty + 1 gate-one-short;
  alive-bench 0. The r164 nodeAway finding does NOT reproduce — with
  the villages dying, the bench is bare because the roster is dead,
  not because fighters are away. The watch now has two shapes across
  panels: nodeAway (r164, villages alive) vs supply-empty (r168,
  villages dying). Report both; no single lever covers >= 80% across
  panels.
- C3 (people check) GO: 39/39 transcripts read in full (below);
  fabricHits = 0; zero unforced consecutive repeats (68 redirects,
  0 forced); Q1c fix holds; party names VARY (4 distinct names —
  the (a) fix works, bar met); no fourth naming-stance wobble
  sighting. VoiceLine prefix stacking: 0 sightings (does NOT
  graduate). Recap-quote glitch: 1 sighting (does NOT graduate —
  bar was a second consecutive panel at >= 2; r164 was 1).
- WRAP-CHECK GO: 39 transcripts, 39 marked, unmarked = 0.
- C7b (instrument, REVISED BAR) GO: buried list reported per seed
  (above).
- Q1 missed-window split: valve-expiry 3 / per-day 3 vs drawn-off 4
  / per-day 4. The valve story stays small (r156: 12/5, r164: 2/1,
  r168: 3/3) — no systemic valve defeat; the wait is not being
  defeated.
- Q2 medic duty: census works (spans show real handoffs; the live
  read removes the stale-field case; the mid-run stash sample
  STRENGTHENS the r164 attribution — pharmacy empty at d60 on 5/5
  seeds as well as at census). Blocked 35–82 per seed; ability cures
  5–15; medicine cures 0/5. Canary clear (no sortie deaths).
- Q4 fight-1 (SETTLED frame) HOLDS: clears open on vKill (3) or
  mFlee (4); the one break opens on vFlee (1/1, vTaken 119). The
  vTaken>=~70 break clause stays untested in isolation — kept marked
  untested.
- Q5 multi-monster set clear: 3/4 — pattern holds (r154 8/12, r155
  3/4, r156 pre 4/9, post 7/14, r164 8/10).
- Q6 G-ID watch: 15th panel at zero id-matched. Watch stays open.
- Q7 naming-stance wobble: no 4th sighting (three naming debates
  end in deferral — the vote dangle, driver gap (a), still open).
  Watch stays open.
- Q10 recap-quote glitch: 1 sighting (14203 d21 Rafael). Third
  panel running at 1–2 (r156: 2, r164: 1, r168: 1) — below the
  graduation bar; watch continues.
- Q11 filed-item recurrence: betrayal empty beats NOT exercised this
  panel (the driver picked betrayal:accept only; site/witnesses
  never offered or never picked — no recurrence count possible);
  double confession 0 sightings (the r164 2nd-panel watch RESETS —
  no third consecutive panel); vote dangle recurs 3x (14202 d14,
  14203 d9, 14205 d9) — still attributed to the driver gap, not a
  game blank.
- Q12 horizon stress: ANSWERED — 0/5 horizons, game-overs at
  d76–d128, 3 alive total. The leg's design question is resolved
  for now: a longer horizon on fresh seeds bends the panel. No
  harder stress needed.

## C3 PEOPLE CHECK (39 transcripts, read in full)

All 39 meet the meaning bar except the filed items below (d86 and
d71 are 1-line refusals, counted as marked). What works, seen
repeatedly: debts with memory across days and sittings (Amara's
sickness favor kept and thanked across d36→d50; Gerald's "Good. Then
we're square."); confidences with reasons (Chris the army medic;
Yara's Beirut; Landon's control-group theory); grief that names the
dead and keeps naming them (Marcus, Fatima, Benoit, Jovan, Dmitri,
Zoe, Chris — "the world just... continues"); favors with real stakes
and real math (Fatima's pantry run, Nora's 4 liters, Petra's 2
liters); the doubt-press escalation (Victor d65, three "That doesn't
quite add up" presses rattling him); the leadership turn (Andre
stepping up after Fatima); the party naming itself four different
ways; the table foreshadowed as weather ("Something's on its way").
The no-words sitting is absent this panel (no no-words villager in
the driven set) — the r167 agree-pool change is not exercised here.

FILED (not fixed here):
1. "Debts unpaid just sit there" after a SETTLED debt — RECURRENT
   (r156 #5; r164: 0 sightings; r168: 1): 14201 d50 Amara. The favor
   is thanked/settled and the closer says "that sickness help,
   settled" — yet mid-conversation the dismiss line serves "They
   won't forget. Debts unpaid just sit there." The settled state
   and the line disagree. (Contrast 14204 d26 Gerald, where the same
   dismiss line correctly files a NEW ask as "unpaid, and counted"
   after the debt was squared.)
2. Role re-pick loop in one sitting — NEW: 14202 d27 Fatima. The
   driver picks party_role three times; the second and third picks
   re-serve the full role list and re-assign Scout ("Fatima is
   Scout now" twice). Partly driver (it keeps picking party_role
   after the assignment), partly engine: re-assigning an
   already-held role narrates the assignment as if new. Soft-medium.
3. Dead member keeps the party role — NEW: Fatima dies (d38, arena)
   but "scout (held by Fatima)" still shows on d39 and d51. The
   role is not released on death. Soft-medium; the d64 Hunter
   sitting on 14205 shows the same menu shape with a living holder.
4. Naming-debate vote dangle — RECURRENT (3x: 14202 d14, 14203 d9,
   14205 d9) but still ATTRIBUTED, not a game defect: the vote IS
   castable — app.js renders "Back a name" buttons per option and
   calls Game.backMonsterName (app.js:14080–14089); the sim driver
   never clicks them (it picks the generic [gq:open:take] "I need a
   moment to think"). Driver gap (a) from r164, still open: the vote
   lives on the askAbout path (Game.askAbout 'namebeast' →
   Game.backMonsterName), not in convoChoices, so pickConvoChoice
   cannot reach it; a driver askAbout probe would carry trajectory
   effects (socialTick, double-weighted vote) and needs its own
   prereg. Do NOT file as a game blank.
5. Recap triple-repeat texture — OBSERVED, not a new finding: every
   recap-driven sitting re-serves the same three lines ("Still on
   X" / "X — that's still where we are" / "Like I said — we're
   still on X"). Single prefixes only, never the Q3 two-deep stack
   — but the recap machinery is the most-repeated texture in the
   panel. Noted for the metric review, not filed as a defect.

## REACHABLE / FUN / WINNABLE

Reachable: crises fire on all seeds, sorties answerable (8/14
attempts ok, 6 refused with recorded reasons), conversations rich
and reachable, the medic duty fires and cures (ability channel
5–15/seed), the naming vote is castable on the real UI, parties
name themselves four different ways. Fun: the conversation system
is the star again — grief with names, favors with math, the doubt
press, Andre stepping up, the table as weather. The crisis loop
fires reliably and the fight-1 frame holds. Winnable: this leg
judges crisis survival, not the win — 0/5 reached the horizon, 0
wins. The swing from r164's 5/5 is seed variance on a hard band
(proven by the attribution diagnostics, not a base regression) —
but a competent bot losing every village by day 128 says plainly
that the wild is the binding pressure now, not the monsters: the
villages that die do so one forager at a time, pantry full or not.

## METRIC REVIEW (§14 — for the NEXT run)

- MISSED-WINDOW SPLIT: works as designed (valve 3 / drawn 4; per-day
  3 / 4). KEEP. The instrument-look trigger (>= 8) did not fire for
  the third straight panel.
- BENCH: two shapes across panels now — nodeAway (r164, villages
  alive) vs supply-empty (r168, villages dying). KEEP as a watch;
  the refusal shape is a readout of village health, not a lever
  question. A lever naming rule (>= 80%) should be judged per
  panel, not pooled.
- Q4 frame: SETTLED — held on a fourth panel. The vTaken>=~70
  clause remains untested in isolation; keep it marked untested.
- Q10: 1 sighting (after 2 in r156, 1 in r164). The graduation bar
  (second consecutive panel at >= 2) has now missed twice. Consider
  lowering the bar to "three panels at >= 1" or accepting the
  glitch as rare-but-real and fixing it when a fix is cheap — a
  decision for the next run's prereg, not a bar change in-run.
- Q11: double-confession watch RESETS (0 this panel after 2nd-panel
  recurrence in r164). Betrayal beats were not exercised — the next
  run should force a betrayal:site/witnesses pick at least once to
  keep the watch honest, or drop it as unexercised.
- MEDIC DUTY census: the mid-run stash sample works and strengthens
  the supply attribution (empty at d60 on 5/5). KEEP. The medicine
  channel's 0/5 is now a supply story twice over — the next question
  is where medicine comes from at all, not whether the channel
  works.
- C1 on a 0/5 panel: the bar passes non-vacuously. The horizon
  extension (120d → 150d) is validated as a stressor — but note the
  attribution: four of five villages died before day 120 anyway, so
  the fresh band, not the extra 30 days, did most of the work. KEEP
  150d.
- DRIVER GAPS (filed, not fixed here): (a) naming-vote askAbout
  probe (needs its own prereg — trajectory effects); (b) DONE this
  run — party-name pick varies (4 distinct names); (c) DONE this
  run — cap 12→16, 0 cap-breaks. New gap: (d) the driver re-picks
  party_role after assignment (14202 d27 loop) — teach
  pickConvoChoice to skip party_role when the role was just
  assigned in this sitting.
- RECAP TEXTURE: the recap triple-repeat is the panel's most common
  sentence shape. If the next run touches recap lines, vary the
  third serve ("Like I said —") so three recaps in one sitting do
  not read as one line three times.

## INSTRUMENT / TELEMETRY

- Telemetry check (judged panel, 5 JSONs): `node
  scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/crisis.json --current
  '.../journey-crisis-r168-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount` → **quiet (5
  files, 3 metrics, no large deviations)**. Baseline NOT rolled.
  (First invocation failed on a literal `~` inside the quoted glob
  — ENOENT scandir; re-run with the absolute path.)
- Gate: `node scripts/check.js --quick --cacheDirectory=
  /tmp/jest-cache-playtest2` in the worktree → [GATE TBD — log
  journey-crisis-r168-gate.log].

## GATE — RE-RUN ON THE REBASED TREE (adoption closeout, main session)

[TBD at closeout if the coordinator times out before confirming.]

## ADOPTION CLOSEOUT (this run, 2026-11-10 ~08:35Z — Lane B coordinator died ~07:20Z mid-gate)

- STALE-LOCK RECOVERY: lock run_id 2026-11-10T05:55:55Z, heartbeat
  06:43:29Z (72 min stale at 07:55Z check) — dead per the 15-min rule;
  lock deleted, new lock 2026-11-10T07:57:52Z written. Registry
  heartbeat re-verified after heartbeat (07:57:53Z). No file in the
  adopted tree was modified within 15 min of adoption (newest write
  06:44:19Z, the killed gate log).
- Recovered from `evidence/2026-11-10/journey-crisis-r168.md` + the 3
  scripts + goal hidden_files evidence (prereg, 5 panel JSONs,
  analysis, 39 transcripts, dead gate log). Spot-verified filed items
  #1 (d50 transcript carries both "that sickness help, settled" and
  "Debts unpaid just sit there") and #3 (d39 "scout (held by Fatima)"
  after her d38 arena death). All 5 panel JSONs parse, days match the
  note (128/80/108/84/76), instrumentErrors [].
- BASE MOVEMENT since the dead run: master 00528fb72 → a6ed956f5 (15
  commits: journey-scale r125 evidence + sim-roundcap-b DIAG; the
  roundcap landing touched scripts/sim-harness.js +8). Branch had no
  commits of its own, so it was fast-forwarded to the explicit SHA
  a6ed956f50ca78309fec4dcefb3502128efdc9b0 (no rebase needed, no
  conflicts). Master had not moved again at merge time (verified).
- PROOF RE-RUN on the rebased tree: `node
  scripts/test-journey-crisis-r168-instruments.js` → 14/14 PASS
  ("r168 instruments: ALL PASS").
- TELEMETRY RE-RUN: quiet (5 files, 3 metrics, no large deviations).
  Baseline NOT rolled.
- GATE (adoption re-run, `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest2`, 1896s): **286 passed,
  14 failed — RED ON MASTER, none of it r168's.** The 14:
  - 7 timeouts at exactly 120s (phase-shawl, solo-campaign-endings,
    time-save-crashes, trust-observer-neutrality, synergy-stall,
    capable-bot-20261014, table-endings-20261014) — contention
    artifacts on this 1.5-CPU box (gate ran 4-parallel for 31 min);
    each was passing assertions when killed.
  - 3 stale-proof failures from other landings: measurement-proof-
    update + measurement-workflow + measurement-cache-flags ("Proof
    source inputs are not current" — the roundcap sim-harness.js
    change invalidated the retained neutrality proof);
    phone-frame-proof (retained browser inputs stale after r167's
    foreignSpeech.json / index.html changes).
  - 2 content failures, BOTH PROVEN PRE-EXISTING on pristine master
    (r168 files stashed via `git stash -u`, re-run, stash popped
    clean): test-establishment-r20-fixes-20261020 (racks-full voice
    gate: "next day voices once more, expected 2, got 1") and
    test-mobile-combat-cadence (2 failures: "enemy is announced
    before its action runs" / "Continue does not wrap the announced
    round a second time"). No file outside r168 references r168's
    scripts (grep: zero cross-refs), and r168 changed zero src/js —
    the gate result is identical with or without this commit.
  - Verdict: landing is evidence + tooling only (scripts/ + evidence/,
    both deploy-excluded). The gate is red on master for reasons
    owned by other lanes: measurement-proof refresh (roundcap lane),
    phone-frame proof refresh (r167 lane), establishment-r20 voice
    gate + mobile-combat cadence (their owners). This run does NOT
    waive those failures — they are recorded here and in the chat
    report for their owners; the r168 evidence itself is proven by
    its own 14/14 proof test + determinism + telemetry-quiet.
- LANDING: committed in worktree via safe-commit.sh, merged --ff-only
  to master, worktree released, rotation 6→7 written, lock deleted.
  Merged locally, pending ship (no bump, no push — ship loop owns it).
- STANDING DIVERGENCE (carried from r168): `git pull --ff-only`
  still unattempted — local master ahead 358 / behind 156 vs
  origin/master (Steve's Cursor PRs #118–#121 pushed directly to
  GitHub master; ship blocked, reconciliation answer pending since
  Nov 8). Proceeded on local master per precedent; no push.
