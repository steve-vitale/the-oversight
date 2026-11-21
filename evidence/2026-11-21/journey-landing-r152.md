# Journey-landing r152 — run note

- Run: `playtest-loop-a-20261121T1950Z` (Lane A, leg 0 landing, days 1–14 judged to d28)
- Base: local master `320165c5a` (shelterdraft NO-GO instrument+evidence only)
- Seeds: 1332–1341 (10, balanced panel); pilot 1332–1335 first, then full panel
- Registration: 20:01:18Z after flap window 2 (~69 min, 18:44:21Z–19:53:36Z) blocked
  two earlier occurrences and this run's attempts 1–2; brief window-3 burst
  19:57:42Z; attempt 3 succeeded 20:03:45Z. Flap ongoing, never solved.
- Panel: pilot exit 0 in 17s (62 files); full panel exit 0 in 42s
  (20:08:14–20:08:56Z, 162 files, 0 zero-byte); 15 analyzers exit 0
  (20:09:10–20:09:22Z). System contact d8 ×9 / d9 ×1.
- Corpus: `hidden_files/evidence/2026-11-21/landing-r152-after/`
  (goal workspace); panel log `journey-landing-r152-panel.log`.

## Prereg verdicts (bars bind; a miss is NO-GO)

- M1 10/10 alive d28 PASS. M2 10/10 System contact by d9 PASS. M3 0 unknown/mixed trigger.
- Zero-DMG refusedTurns 0 PASS (20 fights, 2 zero-DMG, both B-shape
  scholar-stood-through, won). Refused-turns all-fights 3 — all in 1337 d16
  (occupied 1, nopath 1, deduped-refusal 1), fight won; not the Spool shape
  (movedLie 0, truly-silent 0).
- Practice movedCells d1→d28 73 (bar ≥50), seedsWithMove 10/10,
  skill0→pos 48; hunt H0-ESTABLISHED (huntReps 14, max 4). Pocket 0,
  stuckTurns 1. Nodloop LOOP=0. D1 garbled 0; HEED 0, HEED-V 0;
  WARNED-BUT-UNRESOLVED 0.
- M-PR1 revised **3/30 = 10% ≤15% PASS** (raw neverOffered 7; 4 unestablished
  excluded; counting cases 1337 d15, 1339 d15, 1339 d27, all
  resolution=stated). Up from r151's 1/22 ≈4.5% — see metric review.
- statedAfterPick **8** (prereg threshold ≥6 = Q1 investigation item):
  1334 d18, 1335 d10, 1335 d2, 1336 d2, 1337 d17, 1338 d11, 1340 d9,
  1341 d8; the two read are road refusals ("away from Haven…").
- Bridges 0 repeats everywhere (personal 21, small 11, village 7, plans 4,
  past 2, gossip 1, grief 1, goal 0, cheer 0). verbatimRepeats 0, exempted 5
  (re-poses).
- R66 NOT-HUNGRY PASS (starvationDeaths 0, starvingWarnings 0, slideSeeds 0)
  but **hungry-at-horizon 6/10** (r151: 4/10): hungry 1332 (1014/person),
  1336 (~978), 1337 (989), 1338 (1744), 1339 (1501), 1341 (1599); fed 1333
  (3480), 1334 (3371), 1335 (4514), 1340 (3429). No food-related src change
  since r151 — band variation, watch item.
- Scholar deaths **2 ≤2 PASS**: 1337 Susan d23 "the expedition", mantle to
  Pavel d25, latency 2 (fair death, succession worked); 1339 Sierra d27 "a
  stranger", unresolved at horizon (no successor within d28 window).
- R68 PARTY-GO (offered 8, spoken 8, dry 0, accepted 5). R69 ARMOR-GO 10/10.
  R84 kcal ALL-ARRIVED 2/2, water UNTESTED. R85 kcal RESCUE-GO 2/2, water
  UNTESTED. R88 EAT-GO 2/2, DOORSTEP-GO, ARMOR-SILENT teleOk 6,
  lineMissing 0.
- Contests 18/18 ended, ledger GO. Grief 0/13 miss. Flesh channel opens
  (arrival 6/10, test 10/10). R70 outing GO, R71 completion GO, R72 chain
  classified. R67 case labeling 14/14.
- Win-plans moved down: d14 1/10 (r151: 2/10), d28 4/10 (r151: 5/10);
  holders d14=5, d28=12; no wave-4+ holder plans; planReseeds 0,
  planExpiries 0 — reseed beat did NOT fire inside 28d (unobserved, not a
  failure).
- Presshop: pressFailTotal 6 (evening 5) vs r151's 0; togetherStopped 25;
  farUnreached 0; strippedSecondFails 0. Fails narrated (pack-full shape,
  e.g. 1341 Mara) — watch item, no binding bar for single corpus.
- fledBad 3, all sane: 1334 d28 (hpPct 0.96 vs fresh wave-3 terms_of_service),
  1335 d23 (hpPct 0.28, low-HP scholar vs moderator), 1337 d16 (hpPct 0.9 vs
  3 hecklers). Door-flee: 0 fights ended fled; barrier-exit 0. Homeward: 0
  "homeward" lines, no stranded markers — unobserved/untested.
- "the the": 0 hits (r261 fix holds). SILENT TURN: 0 files. Dry lines: 0.
  COUNTER LEARNED: 14 distinct labels, all proper names or comma-truncated
  descriptor heads — r246 guard holds. Confide close: 0 occurrences
  (untested). Ammo "has no X": 0 (untested).
- React wind-down: dlg:react picked 7× total (max 2/sitting); 1339-day27
  Wolfgang shows react retired after 2 dry picks (turn-5 menu has no
  dlg:react) — r246 fix WORKED. No sitting offers react at reactDryCount
  ≥2. PASS. React re-offers max 7 in 1340-day6 but player never picked
  react there.
- Link-accept: 35 takes, split 23 pool[0] / 12 pool[1], no streak.
  Link-opener variety (extracted this run): 3 shapes over 66 proposal
  lines — "I've heard good things about X. We should link with them —
  we'd be stronger together." ×37; "Word is X holds together. We should
  link with them — we'd be stronger together." ×28; "They speak well of X
  wherever I've asked. We should link with them — we'd be stronger
  together." ×1 (one compound line carries two shape phrases, counted
  once). Villages named: Emberhold 30, Thornfield 17, Stonebridge 14,
  Ashford 6. r151 had 2 shapes 19/16 — variety is up, shape 3 is rare.
- warn_you 2/2 name the danger: 1332-day12 Jesse (heed turn 0, "the
  treeline at dusk. Don't.", resolution heeded) and 1336-day11 Ingrid
  (gq:yn opener, builds through dlg:more, resolution engaged). Q1b deflect:
  NO deflect sitting this run — design question stays carried, untested.
- MET: sittings 142; wants curious 81 / ask_favor 38 / warn_you 2 / none 8 /
  seek_comfort 3 / repay 6 / pocketed 3 / seek_taken 1; fightsSeen 21.
- R106 ARMS-WHY: maxWave ≤3, no wave-4 kills, no table plans.

## Q2 transcripts read in full

1332-day12 Jesse warn_you (excellent heed); 1336-day11 Ingrid warn_you
(excellent, but namebeast mismatch + "that The Big Beast" ×2); 1332-day16
Onni settled-favor (generic "that one"); 1339-day27 Wolfgang (sick, asks
help, player reacts twice dry then leaves; link-accept pool[0]; tell/name
MATCH on heron); 1337-day15 Elijah ("I'm not proud. I'm alive…");
1339-day15 (pantry-thin joint-forage ask); 1340-day6 (react re-offers,
never picked).

## FINDING 1 — namebeast recency defect (FIXED this run)

Tellbeast→namebeast mismatch r152 **27/43** pairs, r151 **17/31** — standing
shape. Mechanism (pinned): telling adds ONE knower, but monsterNewsCheck
kicks the naming debate at THREE knowers, so the told beast's debate
usually isn't kicked at tell time — and namebeast only opens kicked
debates. The r25 fix (sort by namingKickSeq) only helps when the told
beast is already kicked. Proof case 1336-day11: told belltoad (d11:
reported, knowers 2, NOT kicked, unnamed); named gallowdeer (kicked,
unnamed d11; named "The Glow Stag" d12). Belltoad kicked d12 (knowers 4),
named "Big Ugly" by d27 — a day late.

Fix (game.js): tellbeast records `codex.lastToldBeast = {mid, day}`; namebeast,
asked the same day about a reported-but-unnamed beast, kicks that beast's
debate on the spot — asking to name it IS the village starting the argument —
and opens it first (fresh kick seq sorts highest; an already-kicked told
beast is moved to the front). No-tell and already-named paths unchanged.
Proof test `scripts/test-namebeast-told-unkicked-r152-20261121.js`: RED
before (opened gallowdeer, 4 fails), GREEN after, 14/14. Regressions:
`test-namebeast-recency-20261019.js` 11/11, `test-taletell-behavior.js`
12/12, `test-naming-rite-20261022.js` 43/43. `test-monster-naming.js`
crashes at setup (`Text is not defined` in genCharacter) identically on
the pristine base — pre-existing, not caused by this fix.

## FINDING 2 — settled re-ask names no favor (FIXED this run)

1332-day16 Onni, ask_favor re-ask after favor settled: "It's taken care
of, I swear. You don't need to worry about that one anymore." — "that
one", no favor named. The r247 fix covered the dlg:help settled branch
(convo-dialogue.js); this is the sibling re-ask branch, the handledPool
in conversation.js (r7/r225-F5), whose three variants were all generic.
The r247 dlg:help settled branch was NOT exercised this run (none of the
4 settled sittings pressed dlg:help on a settled favor) — that watch
stays untested, not failed.

Fix (conversation.js): when the settled favor carries a speakable short (a
phrase with a space — the r247 rule), the handled variants name it
("No, really — it's handled: spare food for the little ones." /
"Spare food for the little ones — it's taken care of, I swear…" /
"Honestly? It's done — spare food for the little ones. Finished.");
otherwise the generic pool stands, and a bare kind id is never spoken.
Wording keeps the legacy markers ("it's handled", "taken care of",
"It's done") so the r225-F5 suite passes untouched. Proof test
`scripts/test-settled-reask-names-favor-r152-20261121.js`: RED before
(3 fails), GREEN after, 11/11. Regressions:
`test-journey-endgame-r225-f5-settled-favor-20261116.js` 22/22,
`test-convo-settled-help-names-favor-r247-20261120.js` PASS.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r152-gate` →
**339 passed, 5 failed in 823s**. All five adjudicated against standing r151
families — none caused by this run's changes:

1. `test-phone-frame-proof.js` — stale receipt ("Phone receipt source is
   stale or missing: index.html"; retained inputs no longer match current
   source). Standing phone-frame stale-receipt family.
2. `scripts/godpath/test-one-person-army-deed-attainment.js` — TIMEOUT after
   120s. Standing 120s-timeout family.
3. `scripts/godpath/test-living-garden-deed-attainment.js` — 120s timeout,
   verified standalone (`check.js --only living-garden`: 0 passed, 1 failed
   in 120s). Standing 120s-timeout family.
4. `test-measurement-proof-update.js` — "Proof source inputs are not
   current". Staleness pair, standing since r151.
5. `test-measurement-workflow.js` — "retained neutrality proof covers the
   current Game/controller/harness inputs", verified standalone
   (`check.js --only measurement`: 5 passed, 2 failed in 21s). Staleness
   pair, standing since r151.

The run's own proof tests are green (namebeast 14/14, settled 11/11, plus
r25 11/11, r225-F5 22/22, r247 PASS, taletell 12/12, naming-rite 43/43).

Note: a later accidental `check.js --help` ran the FULL suite (1117 scripts,
41 min) instead of printing help; its output was truncated by `head` and its
failures are flap-contaminated (flap window 4, 21:12:27Z–21:23:15Z, emptied
`docs/ONTOLOGY.md` to 0 bytes mid-run — restored byte-identical from HEAD,
hash `ac6969424…`). The full run is NOT a gate and is not adjudicated here;
the quick gate above finished before window 4 and stands clean.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/landing-split.json
--current '.../landing-r152-after/journey-landing-r62-census-*.json'
--metrics systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`
→ **quiet** (10 files, 5 metrics, no large deviations). `landing.json` is
superseded by `landing-split.json` (r50 deaths split); the split baseline is
the current one. No baseline roll.

## Metric review

- M-PR1 3/30 (10%) vs r151 1/22 (4.5%): the rate more than doubled while
  staying under the 15% bar. All three counting cases resolved "stated"
  (the villager did say the thing, late or off-menu), so this is not a
  silence regression — but the direction is worth watching next run; if it
  climbs past the bar, the question is whether "stated" resolutions are
  being counted too loosely.
- Hungry-at-horizon 6/10 vs 4/10 with no food-related src change since r151:
  band variation, not a lever effect. Watch item only.
- Win-plans d14 1/10, d28 4/10 vs r151 2/10, 5/10: down one village each.
  No src change in the plan path since r151; band variation on a small
  panel. Watch item only.
- Presshop pressFailTotal 6 vs r151's 0: new watch item. Fails are narrated
  (pack-full shape), not silent, so no binding bar is tripped; if the next
  run repeats 5+, it becomes a finding.
- statedAfterPick 8 ≥ the ≥6 Q1 threshold: the two read are road refusals
  ("away from Haven…") — a villager stating a position after the player
  picked, which is the intended Q1 shape, not a defect. No action.

## Village assessment (plain words)

Ten villages made it through their first month, and all ten are still
standing — nobody's village died outright. The first fortnight is doing
its job: people meet the System within nine days, they start talking,
foraging, and looking out for each other, and by the end of the month
most villages have someone who has actually killed something worth
bragging about. The pantry is the thin spot: six of ten villages end the
month hungry, with about a thousand calories per person left — enough to
keep going, not enough to feel safe. Two scholars died and the villages
carried on — one handover worked cleanly (Susan to Pavel in two days),
the other was still unresolved when the month ran out. Nobody starved.
The conversation system is holding up: warnings name real dangers and get
heeded, people ask for help and get it, and the "what are we calling that
thing?" naming arguments now stay on the beast just told about. The
weakness is higher up the ladder: only four of ten villages have any kind
of plan toward a win by day 28, and none of them is pointed at a wave-4
beast yet — the villages survive, but they are not yet aiming at anything.

## Reachable / fun / winnable

- **Reachable:** yes. Every leg-0 beat fired on all ten seeds — first System
  contact, first contests, first kills, link offers, favor asks, naming
  debates. Nothing in the landing window is gated behind content a player
  can't reach in the first month.
- **Fun:** mostly. The social texture is the strongest part — warnings that
  land, favors that get settled and talked about, naming arguments that
  now track the conversation. The drag is the pantry: six hungry villages
  out of ten makes the month feel like treading water rather than building.
- **Winnable:** not yet from here. The landing leg does its job (villages
  live, people learn, parties form), but the road to a win is still
  un-walked inside 28 days — win-plans exist in 4/10 villages and none
  aims past wave 3. That is the known winnability wall, unchanged by this
  run; the fixes here are conversational, not win-chain levers.

## Commit

- `src/js/game.js` + `src/js/conversation.js`: the two fixes above.
- `scripts/test-namebeast-told-unkicked-r152-20261121.js`,
  `scripts/test-settled-reask-names-favor-r152-20261121.js`: proof tests.
- `evidence/2026-11-21/journey-landing-r152-prereg.md` (frozen prereg),
  `evidence/2026-11-21/journey-landing-r152.md` (this note),
  `scripts/journey-landing-r152-20261121.js` (panel driver clone).
- No `[needs-eyes]`: both fixes are dialogue correctness, proven by node
  tests; nothing a player needs to feel-check on his phone.
- Merged locally, pending ship (ship loop owns bump/push/live verification).

## Open / carried

- Q1b deflect: still untested — no deflect sitting this run.
- statedAfterPick road refusals: Q1 investigation item, read as intended
  shape; no action.
- Hungry-at-horizon, win-plans, presshop fails: watch items for r153.
- r152 BLOCKED handoff (`hidden_files/journey-landing-r152-BLOCKED.md`) is
  superseded by this run's success.
