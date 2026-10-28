# sim-fieldfeed-a — FEED THE WILD MEETING

Run: fleshout loop, run fleshout-20261028T1628Z. Axis: scale-onramp
(blocking axis). Worker: sim-fieldfeed-a. Prereg:
evidence/2026-10-28/sim-fieldfeed-a-prereg.md (committed BEFORE any
judged sweep; binding). VERDICT: pilot-GO-only (see below) — the
game change is REVERTED in this branch; instruments + evidence +
corpora only, no src/js trace.

## Header (pre-registered)

- PRIMARY METRIC: wave-4 field meetings on the band that form a
  party (>= 2 fighters) and fight (FORMED, including the
  formed-but-retreated sub-class, sub-reported).
- GO THRESHOLD: >= 1 formed wave-4 field party on the pilot band;
  for LAND, >= 1 formed on the confirm band.
- GUARDS (all must pass for a LAND verdict): median survival >=
  117d (80% of the 146d control); starvation <= 2; no wave-5 unlock
  claimed (wave 5 is not the metric here).
- HORIZON + WHY: 180d death-aware (runDays stops on death/win;
  +10d tail max) — the shared band's horizon, death-aware per
  MEASUREMENT §10, never a fixed 200d.
- SEEDS: pilot 75101–75108; confirm 75109–75116, each with its own
  no-feed control on the same seeds.
- SUBSTRATE: scripts/policies/tableseat-nowait.js verbatim,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1.
- SECONDARY (reported, never re-scored against): formed count,
  tile-could-form count, fed-but-unanswered count, field kills by
  channel, party wins/losses, deaths by channel.

## The change (what was built, in plain words)

Wild monster meetings never saw the party standing on the tile: the
wild and patrol routers built their ally list only from the outdoor
crew snapshot, which was empty on every meeting of the shared band,
so every wave-4 field fight was fought solo even when trusted,
armed villagers stood on the same ground. The fix fed the routers
the villagers who are actually there: the existing presence-aware
join (party-wiring's trust-ordered answer list — friends answer,
strangers at trust below 15 don't, at most 2) filtered to
villagers standing on or adjacent to the fighter's own square (the
earshot radius that logic already defines — no new radius
invented). A villager assigned to an outdoor task but standing
elsewhere was NOT fed: no radar, no teleporting, nobody routed to
a monster tile nobody fought on. Raid defense and aid-crisis
fights kept their old crew-only feed untouched; the expedition
channel was untouched; no monster stats, wave gates, table gates,
or spawn rates changed. This was villagers acting like people
(Steve 2026-10-28), not a difficulty lever — a party that forms
and then judges the fight unwinnable and retreats counts as
formed, and is reported as formed-but-retreated.

Files (REVERTED — see verdict): src/js/party-wiring.js (new
`presentFightAllies`), src/js/game.js (wild + patrol PARTY-UP
blocks only; the aid-route computation moved above party-up so the
feed could exempt it — same value, same uses).

Proof (on the armed code, before revert):
scripts/test-fieldfeed-a-proof.js — 18/18, re-run post-commit:
(A) present, willing, armed villager forms a party and answers the
shout (calledHelp + allyVid, shout line in the fight log);
(B) nobody present stays solo; (C) a stranger on the tile (trust
10) does not answer; (D) patrol feeds the same presence.

## No-feed control band, pilot seeds (base code, recorder on)

8/8 seeds, corpus PASS, recorder errors 0, detgate PASS (seed
75101: days=132, gameDays=132, ts identical, no recorder surface,
no wraps). Wall parity vs the 1528Z control is EXACT on every
field: national ever 7/8, final 6/8; table invited 4/8, entered
3/8; wins 3/8 (all lesser); wave-4 reach 6/8; wave-5 0/8; median
survival 146d; deaths 286; starvation 1. The base had not moved in
any way that matters since 1528Z.

Meeting census (control, prereg-literal resolve+patrol cut): 18
judged wave-4 field meetings (75106: 10, 75108: 8 — matching the
1528Z 18-cut; the 1528Z 24-count adds 6 aid-routed meetings, which
this prereg excludes as contrast, not judged). Fed 0, formed 0.
Earshot lens (same/adjacent node, the feed's own input) gives
tile-could-form 18/18 — broader than the 1528Z monster-tile lens
(14/24 on the 24-set), because adjacent squares count as earshot
here. Every control meeting classifies FED-BUT-UNANSWERED:OTHER —
expected on a band with no feed at all: willing presence exists
(earshot trust values run 25–94, far above the 15 floor) but
nothing feeds it. The finding is sharper than 1528Z's: the old
feed failed on input (empty crew), NOT on willingness — the
villagers standing there are trusted friends, not strangers.
Field kills by channel (wave-4 meetings): none. Field deaths:
resolve 4, aid 4. Corpus:
evidence/2026-10-28/perseed-fieldfeed-a-control/.

## Pilot band (armed, seeds 75101–75108)

Corpus PASS, census valid (8/8 rows, 0 unclassified, recorder
errors 0).

- PRIMARY: PASS — 4 formed wave-4 field parties, all
  formed-but-retreated (see sense note). Judged meetings 9 (all
  resolve; 0 patrol): tile-could-form 9, fed 9, formed 4,
  fed-not-fought 5 (all NEVER-HOPELESS), fed-but-unanswered 0,
  solo-no-presence 0. Field kills by channel (wave-4 meetings):
  none. Field deaths: resolve 4, other 1, aid 1. Party outcomes
  (formed): vFlee 4.
- The 4 formed (all resolve, all vFlee): 75106 d118 visjoin_104 +
  jorge_silva (fed jorge_silva, fatima_hassan); 75106 d118
  mateo_alvarez + jorge_silva; 75106 d121 visjoin_104 +
  jorge_silva; 75107 d106 nikos_papadopoulos + gen_v0dsfw1.
  Across ALL waves on the pilot band, the feed fired on 199/209
  judged meetings (95%) and formed 33 parties — the mechanism is
  not wave-4-specific, and it fires whenever company is present.
- GUARDS: median 132d PASS (>= 117d); starvation 7 FAIL (<= 2);
  wave-5 0 (reported only). Pilot standalone verdict: NO-GO on
  the starvation guard — the pilot alone cannot land this change.
- WALL (armed vs control): national ever 6/8 (vs 7/8), final 5/8
  (vs 6/8); table invited 3/8 (vs 4/8), entered 3/8 (vs 3/8); wins
  3/8, all lesser (vs 3/8); wave-4 reach 4/8 (vs 6/8); wave-5 0/8;
  median 132d (vs 146d); deaths 258 (vs 286); starvation 7 (vs 1).
- The starvation 7 concentrates on two early-collapse seeds:
  75103 (5 starvation deaths, days 56–63, village-lost day 63,
  courtship 0) and 75105 (2, village-lost day 22, final pantry 0).
  Per-meeting, fed fights are bloodier than solo learn fights
  (judged channel, all waves, 5-seed cut: fed vTaken 21.6 vs solo
  14.9; formed fights 4.2 rounds, vTaken 67.4; ally wound sum 273
  over 33 formed fights) — longer engage-fights wound two
  villagers where a learn-withdrawal wounded one briefly. That
  wound load is the plausible mechanism for the pilot's workforce
  → food cascade, but it did NOT replicate on the confirm band
  (below), so it is reported as a pilot-band signal, not a
  settled systematic effect.

## Confirm band (armed, seeds 75109–75116)

Corpus PASS, census valid (8/8 rows, 0 unclassified, recorder
errors 0).

- PRIMARY: FAIL — 0 formed of 7 judged wave-4 field meetings
  (all resolve; 0 patrol). Tile-could-form 2, fed 2,
  fed-not-fought 2 (both NEVER-HOPELESS), fed-but-unanswered 0,
  solo-no-presence 5 (earshot empty). Field kills by channel
  (wave-4 meetings): none. Field deaths: resolve 2, raid 1, aid 3.
  Party outcomes: none.
- Failure mode, diagnosed (not a feed breakage): the feed fired
  2/2 times presence existed, but both fed fights ended in ROUND
  1 (one vFlee, one vDie) — before the round->=2 hopeless shout
  branch can fire. The other 5 meetings genuinely had nobody in
  earshot (engine agreed: fed 0). All 15 wave-4 meetings on the
  band by channel: resolve/villager 7, aid/villager 6,
  raid/villager 2 — most wave-4 contact ran through aid/raid
  contrast channels, not wild field meetings, and the villages
  won fast (5 lesser wins), closing the late-game window for wild
  wave-4 meetings.
- GUARDS: median 143d PASS; starvation 0 PASS; wave-5 0. The
  pilot's starvation signal did NOT replicate (0 vs the pilot's
  7) — but a non-replicated guard failure does not rescue a
  failed primary (see verdict).
- WALL (armed): national ever 8/8, final 7/8; table invited 5/8,
  entered 5/8; wins 5/8, all lesser; wave-4 reach 7/8; wave-5 0/8;
  median 143d; deaths 236; starvation 0.
- Its own no-feed control on the same seeds (base code, recorder
  on): 8/8 seeds, corpus PASS, census valid. Judged meetings 13
  (vs armed 7), tile-could-form 12, fed 0, formed 0; field deaths
  resolve 6, aid 3, other 1. WALL (control): national ever 6/8,
  final 3/8; table invited 6/8, entered 1/8; wins 1/8; wave-4 reach
  5/8; wave-5 0/8; median 180d; deaths 314; starvation 3. Corpus:
  evidence/2026-10-28/perseed-fieldfeed-a-confirm-control/.
  Reading: the same seeds DO produce wave-4 field meetings (13 on
  control) — the armed band's low count (7) is a trajectory
  effect (armed villages won faster, 5 lesser wins ending runs,
  and monsters distributed differently), not feed suppression
  (the feed changes fight outcomes, it never prevents meetings).
  Armed vs control on confirm seeds (wins 5 vs 1, deaths 236 vs
  314, national final 7 vs 3) looks net-positive for the feed —
  but a favorable wall cannot rescue a failed primary, and none
  of it lands anything under this verdict.

## Verdict: pilot-GO-only

Per the prereg's verdict rules, the confirm primary failed (0
formed) → verdict is pilot-GO-only: the game change is REVERTED
before the final commit, leaving instruments + evidence + corpora
only. No re-scoring: the pilot's 4 formed parties are not
substituted for the confirm's 0, the confirm's strong wall and
passing guards are not substituted for the failed primary, and the
pilot's starvation guard failure is disclosed, not hidden. The
formation effect is real (proof green, pilot 4 formed, feed fired
whenever presence existed on both bands) but opportunity-bound:
it needs company on the tile AND a fight lasting to round 2, and
on the confirm band neither lined up. A future arm that wants
this feed needs a prereg that survives low-meeting bands (see
metric review) — and must reckon with the pilot's wound-load
signal before landing.

## Sense note (SENSE-TESTING LAW — read, not counted)

Pilot 75106 d118, leader visjoin_104 ("Elmarie") vs the influencer
("Ratio"), fed [jorge_silva, fatima_hassan], 6 villagers in
earshot (trusts 46–97). The log reads like people:

- R1: Ratio hits Elmarie for 26 (55 left). Elmarie strikes for 11
  (839 left).
- R2: Ratio hits Elmarie for 26 (29 left). Elmarie strikes for 10.
- "Elmarie is losing — shouts for help! Jorge charges in!"
- R3: Ratio hits Jorge for 65 (35 left). Jorge strikes for 4.
- "Elmarie sees how this ends — and runs while running still
  works." (vFlee, party intact.)

The shout comes when losing, the friend takes the hit, and the
pair retreats together rather than dying for pride — a party
judging a fight, not a mechanism firing. Contrast the control
band's 75106 d96: Ingrid, solo, intent 'learn', dies in 2 rounds
to the algorithm with 6 trusted armed villagers in earshot — no
shout, no join attempt, no "nobody came" beat. The feed changes
the fiction from silent solo death to a called-for, retreated
party. What it does NOT change on this evidence is the outcome
class: all 4 pilot parties retreated; none won a wave-4 field
fight. A party that forms is not yet a party that kills.

## Reachability verdict

- Wave-4 field parties: REACHABLE — proven by the pilot (4
  formed) and the proof fixture. The feed is the missing input,
  not a missing system.
- Wave-4 field kills: still 0 on every band (pilot, confirm,
  controls). Parties retreat; they don't convert.
- Wave 5: 0 everywhere, as expected — not the metric here.
- Table / wins: unchanged in kind — all wins lesser, full seat
  0/8 on every band. The feed moves field-fight shape, not the
  scale wall, on this evidence.
- Vests / arcs: not re-measured here (outside this arm's corpus).

## Village assessment in plain words

Pilot villages: two collapsed early and ugly (75103 starved with
food in the pantry at the end — a workforce/distribution collapse
more than an empty-pantry one; 75105 lost at day 22 with six
people left), two won fast, the rest ground on. Confirm villages:
healthier across the board — every village reached national at
some point, five won the lesser seat, none starved. The same
change active on both bands produced a starvation scare on one
and a clean sheet on the other, which is what chaotic cascades
look like: one early fight going differently rearranges the whole
village. Who thrived: villagers with trusted company nearby —
they got help and walked away. Who died: solo villagers meeting
wave-4 beasts with nobody in earshot, exactly as before — the
feed helps only where company already exists. Missing
capability, still: parties that can actually WIN a wave-4 field
fight (all formed parties retreated), and any reason for
villagers to be out together where beasts roam (earshot was empty
on 5/7 confirm meetings — the village doesn't travel in company
to the dangerous ground).

## Metric review (for the NEXT run — never a mid-run re-score)

- The primary is opportunity-sensitive: on a low-meeting band, 0
  formed can reflect few meetings + round-1 endings rather than a
  broken feed (confirm: feed fired 2/2 where presence existed).
  The NEXT field-party prereg should pre-register a
  formed-per-fed-meeting or fed-rate deciding leg alongside the
  absolute formed count, or a minimum judged-meeting floor below
  which the band is declared under-powered rather than failed.
- The absolute starvation guard (<= 2) is noisy across 8-seed
  bands with chaotic cascades (pilot 7, confirm 0, same change).
  The NEXT run should pre-register a control-relative starvation
  guard (e.g. armed <= control + 2 on the same seeds) in addition
  to the absolute bar, and judge on both.
- Panel note (standing): scripts/balance-panel.js has no
  census-ingest mode (as in 1415Z / 1528Z); paired census tables
  (control band vs armed band, identical seeds) are the §15
  substitute. No panel artifact faked.
- Census limitation (documented, not hidden): the recorder reads
  presence from the nodePos map purely (never npcNode, which
  creates a Haven default entry for a villager with none). The
  engine's feed reads the same map after villagerFightAllies, so
  for a fighter WITH a nodePos entry the two reads agree exactly;
  for a fighter WITHOUT one, the engine defaults the fighter to
  Haven while the census marks earshot UNKNOWN. Fed-ness itself
  is always engine truth (opts at fight entry), so the primary
  can never misclassify on this gap — it only softens the
  why-unfed split for near-Haven solo fights.
- FED-BUT-UNANSWERED:OTHER on an ARMED band must be read as a
  feed-gap flag, not as "unanswered": willing (trust >= 15)
  earshot presence with fed == 0 means the feed did not fire as
  designed and needs investigation. Only the TRUST-FLOOR
  sub-split is a genuine unanswered shout. (On the control band,
  OTHER is expected — no feed exists.)

## Blanks filled or documented

- FILLED (mechanism, not landed): the wild-meeting feed — wild /
  patrol meetings now fight with the villagers physically present
  (proven, then reverted per the verdict).
- DOCUMENTED (for the findings backlog, not chased here):
  parties form but retreat, never killing wave-4 in the field;
  earshot is empty on most confirm meetings (villagers don't
  travel in company to dangerous ground); the pilot wound-load
  signal (engage-fights wound two villagers where learn fights
  wounded one briefly).
- The 1528Z blank #1 is answered in the mechanism sense (the feed
  was the missing input, and feeding it forms parties) but NOT
  landed — the next arm owns landing, with a low-meeting-proof
  prereg.

## Test and infrastructure notes

- `node scripts/check.js --quick` on the armed code: 284 passed,
  6 failed in 826s (failure names lost — the run piped output
  through tail -5; disclosed, not hidden). Targeted combat/party
  tests on the armed code are green: party-wiring 10/10,
  aid-fight-wired 9/9, break-monsters3-fieldfights 26/26,
  monsterknowledge 1743 PASS. Two targeted failures were checked
  against BASE code and reproduce identically there (pre-existing,
  not this arm): test-fieldguard-probe (P1/P4/P6/P7 binding-case
  failures) and test-break-monsters5-wavekills (ReferenceError:
  Text is not defined at harness character generation — a node
  environment gap, before any game code under test runs).
- `node scripts/check-wired.js src/js/party-wiring.js` on the armed
  code: 0 unwired.
- Safe-commit index clobber hit every commit in this run
  (staged-deletion twins of byte-identical files); repaired each
  time via HEAD-blob `git update-index --add --cacheinfo` with
  hash verification, never `git reset`. No ref surgery; the
  container .git EPERM flap did not strike this run.
- The confirm-control band ran with the game files swapped to
  base via plain file writes (index untouched), then restored and
  hash-verified against HEAD before any further commit.

## Commits

- 4eccccffe prereg (before any judged sweep).
- 68980c423 instruments (fieldfeed recorder, sweep copy, analyzer).
- 336f8636f pilot-seed no-feed control corpus + sense + proof
  scripts.
- 045181e21 game change (presentFightAllies + wild/patrol feeds)
  — REVERTED below, must NOT ship.
- 2ba2a8efa pilot band corpus.
- 7faa306db confirm band corpora (armed + no-feed control).
- 823e5033b revert of the game change (pilot-GO-only verdict).
- 2e9e33359 removal of the proof test for the reverted feature
  (proof lives in git history at 336f8636f / 045181e21).
- Evidence file: final commit on this branch (hash in the run
  report to the coordinator).
- This branch is evidence-only at the end: zero src/js diff vs
  its base (revert verified: presentFightAllies refs 0, syntax
  clean). The coordinator must NOT merge the game change from
  this branch — there is none left to merge. No push, no bump, no
  live verification (ship-loop line).
