# Journey endgame r270 — run note (Lane B, leg 4 ENDGAME)

Run: `playtest-loop-2-20261123T0255Z`, Lane B leg 4 endgame, substrate `ff17699c7`.
Prereg: `evidence/2026-11-22/journey-endgame-r270-prereg.md`. Probe:
`scripts/probe-endgame-r270-20261122.js`. Analyzer:
`scripts/analyze-endgame-r270-20261122.js`. Clone:
`scripts/clone-endgame-r270.py`. Telemetry baseline:
`hidden_files/telemetry-baselines/endgame.json` (uw 22 / won 4 / peakVet 3
per the r263 revert).

## Headline

The tribute experiment ENGAGED — for the first time in the wild.
Seed 107501 delivered military_tribute on day 68 (Lena + Tiana,
tribute-first), the deed gate opened the same day, and the village
sat the FULL seat on day 119 and won. After two straight VOID
pilots (r264, r267) the policy is no longer a hypothesis: a tribute
delivery fires when the gate opens, and it converts 1/1. The rest of
the panel is the same hard picture as r267: 1 of 6 villages that
reached the table faced 2 distinct wave-5 types, the charter is
still unreachable (0/476 peak>=3 days, zero active trade links), and
no stall unblocked on any seed. Two villages scattered on hunger
before ever being announced. Per the frozen PILOT FIRST rule the
pilot ENGAGED, so the full 8-seed band ran. Analyzer: PRIMARY
GO | ALL GO.

## The panel (Pass T, TRIBUTE_FIRST=1, seeds 107501–107508)

Flags: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
CAPABLE_VETGUARD=1 RELAYGREY=1 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1
TRIBUTE_FIRST=1. PILOT_EXIT:0, EXPAND_EXIT:0, all eight seeds wrote
JSONs + transcripts. 6/8 won (1 full + 5 lesser), 2/8 scattered.

- **107501 (wavesnw): sat FULL d119 (deferred 29d, guard=veteran-banked), won.** uw=5, peak 3 living veterans (d40), 1 living at the end. Deed gate first ok d68. Tribute delivered d68 (Lena + Tiana, onHand=2 need=2 paid=2). Scholar Nathan Wen died d52 in the wild killing a rerun; the village faced 4 distinct wave-5 types (rerun d34, cancellation d36, editor d45, spoiler d61), killed 4 wave-4+ monsters, and sat full on the feared/light road with final:mercy. Standing peak 527. Bought the bundle d25. The tribute road works end to end — when the gate opens.
- **107502 (wavesnw): sat lesser d95 (deferred 5d, guard=roster), won.** uw=4, 0 living veterans (peak 0). Deed gate never ok (w5=0 — never faced a wave-5 monster). Scholar Terry Sullivan died d64 (reunion). 6 fights, 0 kills. Standing sat at 199 for 102 days. Bought d27. Final:pledge.
- **107503 (waves): village LOST (scattering), never announced.** uw=4. Scholar Amelia Kovalenko died d51. 3 fights, 0 kills. Bought d28 — then lost (M25d's one bought-seed loss). Stall 4.1d PERSIST. The village starved on the third hungry day and walked in different directions.
- **107504 (waves): sat lesser d92, won.** uw=4, 0 living veterans. Deed gate never ok (w5=0). Omar died d73 (eater, alien). 4 fights, 1 wave-4+ kill. Buyout d44 refused, bought d48. Final:mercy. Stall 1.7d PERSIST.
- **107505 (waves): sat lesser d92, won.** uw=4, 1 living veteran. Deed gate never ok (w5=0). 2 fights, 1 kill, 0 deaths. Buyout d42 refused, bought d46. Final:mercy. Stall 36.0d PERSIST.
- **107506 (waves): village LOST (scattering), never announced.** uw=3, 0 fights, ladder peak 2/stage 1. Never bought. An audience trial (haul 3,000 kcal in 3 days) and a duel contest interruption came while the pantry was empty; the gardens died untended ("Six untended days. The garden keeps honest books.") and the village scattered on hunger day 3. An early collapse, coherent throughout.
- **107507 (waves): sat lesser d104, won, beloved path.** uw=4, 0 living veterans. Deed gate never ok (w5=0). 15 fights — 13 of them talked down (Walk In), 2 fled. 8 feasts, 30 feasted days. Bought d27. Final:quiet. Stall 41.0d PERSIST. A talking village: it ended nearly every fight with words and a 40-kcal peacemaker's price.
- **107508 (waves): sat lesser d96, won.** uw=4, 0 living veterans. Deed gate never ok (w5=0). 8 fights, 0 kills, 1 death. Bought d42. Final:mercy. Stall 31.0d PERSIST.

## Q1 TRIBUTE-FIRST — ENGAGED, and it converts (first wild fire)

Analyzer: `GO TRIBUTE-FIRST: 1 tribute deliveries: 107501@d68
(Lena+Tiana) sat=full | tribute-first attempts 1 | full seats 1/8
(r263 Pass C embassy-first: 1/5 full, 0 tribute) | tribute-delivered
full 1/1`. M23-capstone GO (1 eligible, delivered 1/1, pricedFull
1/1); M24-tribute-agreement GO (onHand=2 need=2 paid=2). The
mechanism the r264 proof test proved (5/5) now has its wild
confirmation: when the gate opens and tribute is ready+payable, the
delivery jumps the queue, the capstone lands, and the village sits
full. The experiment's precondition is the gate, not the tribute —
on the other 7 seeds the gate never opened, so no second delivery
could fire. Full seats 1/8 vs r263 Pass C 1/5 (embassy-first) is
descriptive at this n; the tribute road is now PROVEN to work, not
just to fire.

## Q2 W5-FACING — second run; the bar still binds

Analyzer: `GO W5-FACING: 6 seeds reached the table, distinct w5
types faced distribution {"0":5,"4":1}; w5>=2 (deed-gate bar) 1/6`.
Pooled with r267 (0/4): 1/10 villages that reach the table face 2
distinct wave-5 types (r264's pilot adds 0/2, for 1/12 across the
three tribute-first pilots). The one seed that cleared the bar faced
FOUR types and won the full seat; the other five faced ZERO. M9-supply:
blockedW5=6 across the panel (all on 107501, days 89–119) — no
wave-5 arrival was blocked on the other seeds; the monsters simply
never arrived. Filed as a DESIGN OBSERVATION, not a defect: the deed
gate's w5>=2 bar is Steve's design; the measurement is that on this
fresh band 5 of 6 table villages never meet a wave-5 monster at all.
Whether the bar or the wave-5 arrival rate wants tuning is a Steve
call. No game change made here. M9b-contention-share (INFO, not a
verdict) fell sharply vs r74/r77 on both plans (waves 72.6% vs 94%
r77, WATCH-FLAG-r77; wavesnw 60% vs 100% r77, WATCH-FLAG-r74+r77) —
reported as an observation; the W5 census above remains the binding
read (monsters still rarely arrive to be faced).

## Q3 STALL FATES — third run, in days

Analyzer: `GO STALL-FATES: 6/8 seeds stalled, 147.7 stall-days
total, fates {"NONE":2,"REGRESSION":1,"PERSIST":5}; UNBLOCK->full
0/0 (r263: 4/6)`. No stall unblocked on any seed this run, so the
pooled UNBLOCK->full conversion stays 4/10 (r263 4/6, r264 0/2,
r267 0/2, r270 0/0). The stalls are long: 107501 d56–d119 (63d),
107508 d33–d96 (63d), 107505 d37–d92 (55d), 107504 d41–d92 (51d),
107502 d48–d95 (47d), 107507 d65–d104 (39d) — villages wait at
standing 199 for a gate that never opens, spending ~half their
dusks away (duskAwayInStall 32–51%). The REGRESSION (107502) is the
scholar-death seed again: the stall broke the other way when the
veteran count fell to zero. PERSIST dominates this band (5/6 stalled
seeds) where r267 split 1/1/2 — the fate split is descriptive, and
the run-to-run swing is the finding, not a failure.

## Q4 M25d — at the bar (1/7)

7 bought seeds (all but 107506, which never bought); 1 bought-seed
loss (107503, bought d28, scattered). M25d 1/7 on this band — AT the
bar (<=1), not over it. Pooled with r263 (1/13) and r267 (0/4):
2/24 bought-seed losses. M25c-buyout-early GO (9 eligible early-days,
0 skipped, 47 early attempts, 7 bought).

## Q5 DIALOGUE HOLDS — people check (read in full)

Transcripts read in full: 107501 (3567 lines, 3439 SAY), 107502 (617),
107503 (9116), 107504 (267), 107505 (183), 107506 (10021), 107507
(1873), 107508 (910). Defect greps across all eight: "dodged the
the" 0, "The The" 0, "three times now" 0, "Names, named." 0,
never-again deflect lines 0. No resume-quote mismatches served; the
namebeast topic fired and settled ("It's settled. The village is
calling it 'Ugly-Eyes.' The Codex keeps it." ×7; "Kayden is calling
it 'Old Gavel.' The name's up for grabs — weigh in if you want.").

- **The succession inside the endgame (107501):** the scholar
  Nathan Wen died d52 in the wild; later the village faced The
  Elder Loud-Eyes wearing his face — "The face is too symmetrical.
  The eyes don't track you" — and the player spoke to Nathan Wen,
  not to it: "I know you're gone, Nathan Wen. You used to say
  'About the creek water run — still open. That promise is dead,
  but the need isn't.' — I remember." It answered in his voice,
  thinning: "thank you." A remembered promise carried across a
  death. The mantle transfer reads as one line, twice: "The Codex
  doesn't pause for grief. Aria blinks — and it's already there,
  overlaying everything, syncing. No pen. No paper. The mantle
  just... transfers." (Brian's transfer reads the same way.)
- **WORNSTACK — VACUOUS on this panel:** no transcript line shows
  a successor's worn stack count, so the panel neither confirms nor
  contradicts the ff17699c7 change (a 2-cell stack worn as gear no
  longer collapses to 1 on succession). The mechanism stands proven
  by its own proof test (13/13 on the commit), same treatment as
  r267 gave the r264 tribute-first proof.
- **LAUNCHVOICE speaks (new, live):** "Osama sets out to find
  Owen. 'Won't be long.' The village needs friends beyond the
  fire." / "Elias sets out with Karina — the fire marks the
  trail." Holder+party+target named, once per launch, not a
  bare-ground repeat. GO.
- **The grief-bridge pool fires:** Oliver's funeral feast (5,164
  kcal, "every shaken fire is fed — Emberhold, Stonebridge,
  Thornfield, Ashford. The village mourns together, and the links
  hold because the dead are honored, not because the grief was
  forgotten." Trust +28). "It is grief. Do not eat grief."
- **Villagers talk like people:** Tiana — "The voice said 'north.'
  Just... north. I don't know what it means." / "They said you're
  doing well. It sounded... proud? Can they feel proud?" / "Dreamed
  again. They showed me teeth. Lots of teeth. Be ready to fight
  soon"; Jamila — "Do you ever feel it? Like the air leans in when
  something happens."; Valeria — "My kid asked if the watchers have
  favorites. I didn't know what to tell her."; Robin — "Do you
  think they're watching right now? The... audience? I try not to
  think about it."; the Wren food mystery, told by a dozen
  villagers and never resolved; the stranger Mara met. Wants,
  warnings, and offers — not filler loops.
- **The talk-down village (107507):** 13 Walk Ins, each one "You
  walk in open-handed, talking — low, steady, unafraid. And
  impossibly, they listen. They stand down." with a 40-kcal
  peacemaker's price and "No meat, no trophy — but you're
  breathing, and now you know its moves." It reads as a tactic with
  a cost, and the counter-learned lines vary by monster (Big Beast:
  confess first; Eulogy: contradict the narration) — but the Walk
  In triplet repeats VERBATIM 13 times. Carried blemish (see below).
- **The audit (107501):** names the shortfall exactly, in the
  village's own numbers — "A full seat. global standing, every
  wave faced, the deeds complete." The war path: "On day 119, Aroha
  put down The Timeslot. On day 40, Tiana put down Big Big — and 2
  more teeth after." The feared ending is a real ending: "Show
  mercy." / "The most frightening thing you ever did... the
  audience weeps, and the galaxy learns that the feared one chose
  gentleness." Aroha Ngata ascended through the relay doors ("The
  galaxy will remember the god's name. The village will remember
  who built the door."). Honest.
- **Carried blemishes (same families as r267, no new F-item):**
  travel-banter pool is thin ("Stay close, yeah?", "Smell that?
  Something's different here.", "Huh. Never been this way before."
  dominate every seed; Aroha's "You would say that." ×12 and
  "Agreed." ×10 on 107501); the Walk In triplet repeats verbatim
  ×13 on 107507; the tribute-wagon refusal repeats verbatim ("...
  turn at the gate — our shelves are full past tomorrow. 'Eat
  well,' we send back. 'That IS your tribute this week.'" ×4 per
  village) and "Haven sends 1,500 kcal of grain to X's fire — not
  tribute, the other way around. Someone's grandmother over there
  will remember who fed her." repeats per village; "You wait. The
  light changes. Nothing asks anything of you." ×90 on 107501 (the
  wait narration is a single line); the war-path namespace stays
  thin ("THE HERALD came" / "THE FINALE came" with no verb marking
  arrival vs kill, though the "put down" lines do carry days). The
  keepsake refrain ("The feast was the weapon") repeats per item by
  design (test-main67 A-1b); full sentences vary.

## Analyzer verdicts (full 8-seed panel)

Analyzer exit 0. Log:
`evidence/2026-11-22/journey-endgame-r270-analyzer-t.log`.

- **PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO.** Every binding
  verdict GO, including M1-guard (8/8 announced or honest-death),
  M6-guard (6/6 deferred sat waves named), M20-standing-trace
  (mech199=true on 7/8; 107501 fsMax=527, the one seed past 199),
  M25c-buyout-early, STALL-FATES, TRIBUTE-FIRST, CHARTER-CENSUS,
  W5-FACING.
- M5-voicing-canonical VACUOUS (no forcedrift control seed in this
  band); M5b VACUOUS GO; M24b VACUOUS (no scholar+1 day).
- M3b-peak: 1/8 peak>=2 (only 107501); spread-peak 2/8. The veteran
  picture is thin: 2 seeds ended with a living veteran (107501: 1,
  107505: 1); w4+ kills 6 across the panel (107501: 4, 107504: 1,
  107505: 1). KILL-ANATOMY: 52/52 multi-turn fights, vKill n=5,
  partyMed=5, turnsMed=14, dmgMed=1092, shareMed=0.95.
- LOSSKIND: 2/2 classified (107503: scattering, 107506:
  scattering). M2b-attribution: 4/4 death flags classified.
- M11-standing-peak: at-199: 6, at-200+: 1 (107501: 527). Six
  villages sat at 199 and waited.

## Village assessment (plain words)

Eight villages, six alive at the table, two scattered on hunger
before ever being announced. One village did everything right:
faced four different late monsters, banked its veterans, bought
its bundle early, delivered its tribute the day the gate opened,
waited twenty-nine days for the right moment, and sat the full seat
— and won by showing mercy. The other five that reached the table
sat lesser and walked out with what they had, each of them short
the same single thing: a second late monster to face. Two villages
never got to the table at all — their pantries emptied, their
gardens died untended, and their people walked in different
directions. The tribute road is proven now: it fires when the gate
opens and it converts. The gate itself is the wall — five of six
table villages never met a wave-5 monster, and the trade charter
does not exist in any of these villages' world at all.

## Reachable / fun / winnable

- **Reachable: YES (unchanged).** Six of eight villages reached the
  table (announced d90, sat d92–119). The table is not a rumor. Two
  scattered before it — hunger, not a locked door.
- **Fun: YES, with the carried caveats.** The full-seat ending
  reads as a real ending with real words — the audit, the war
  path, the mercy choice, the ascension. The grief-mirror fight,
  the mantle transfers, the talk-down village, and the scattering
  villages all read as people living through things. The thin
  travel-banter pool, the verbatim Walk In triplet, and the
  repeated wagon/grain lines remain the flat notes, all carried.
- **Winnable: YES — now with a second road proven.** The r263
  verdict (YES — 4 full seats) stands, and this run adds the first
  wild tribute-first full seat: the tribute road converts 1/1 when
  it engages. The binding constraint is unchanged and now sharper:
  the deed gate's wave-5 facing bar. A village can unlock wave 5,
  bank its veterans, buy its bundle, and still sit lesser for want
  of a second late monster to meet — 5 of 6 on this band. The
  charter road is unreachable in practice; the tribute road works
  when the gate opens.

## F-item

None. No new finding is filed from r270: the tribute engagement is
a proven mechanism working (not a defect), the charter and the w5
bar are design observations (Steve-call), the stall-fate split is a
third measurement, and the verbatim-repeat lines are carried
blemish families, not new defects.

## Metric review (§14)

- **M20 samples-vs-days — CONFIRMED.** The analyzer's daysAt199
  (0/102/12/5/… on 8 seeds) are TRACE SAMPLES; the run note
  reports days. No revision needed beyond the r264 correction,
  which this run followed.
- **peakVet baseline (3):** unchanged — no roll (telemetry quiet;
  panel peakLivingVeterans sum 4 over 8 seeds, mean 0.5 vs baseline
  mean 0.6 — in band).
- **FIGHTALLY2:** stays OFF. Eleventh sighting not taken — this run
  does not touch it; the turn-on decision is still owed.
- **M25d:** 1/7 bought-seed losses on this band — AT the bar (<=1),
  not over it. Pooled 2/24 (r263 1/13, r267 0/4, r270 1/7). Bar
  stays <=1.
- **NOTICK/CARRY:** 0 deferrals, 0 trioCarry — eighth straight
  zero. The instrument keeps measuring nothing; the deferral it was
  built to catch has never fired on eight endgame panels. Carried.
- **M1/M6 on pilots:** M1 passed (8/8 announced or honest-death);
  M6 passed (6/6 deferred sat waves named). The r264 worry about
  absolute pilot thresholds does not bite on an 8-seed panel.
- **M23 vs TRIBUTE-FIRST:** the two now AGREE — M23 GO (1 eligible,
  delivered 1/1) and TRIBUTE-FIRST GO (1 delivery, 1/1 converted).
  The r264/r267 tension (NO-GO under M23, VOID under TRIBUTE-FIRST)
  is resolved by engagement, not by a rule change.
- **W5-FACING (second run):** 1/6 reach the bar; pooled with r267
  1/10 (1/12 across the three tribute-first pilots). Descriptive, no
  bar. Keep as a standing census section.
- **M9b-contention-share:** INFO watch flags fired on both plans
  (waves -21.4pt vs r77, wavesnw -40.0pt vs r77). The analyzer does
  not judge it; the run note records it as an observation. No
  revision proposed — the next endgame panel reads it again.
- **PLANWAKE (live head delta):** the chain as it now plays shows
  the same shape as r267 (1/8 full seats, gate rarely ok) with one
  decisive difference — the one seed that reached the gate
  converted through tribute. The establishment leg owns the
  launch-count measurement; the endgame leg records the chain as it
  now plays.

## Telemetry

`telemetry-check.js` on Pass T (8 files, 3 metrics
veterans.unlockedWave/won/peakLivingVeterans): **quiet**. Baseline
NOT rolled. (First invocation passed the metrics slash-separated and
read 1 bogus metric — caught by the count in its own output and
re-run comma-separated; the corrected read is the one reported here.
Means: uw 4.0 vs baseline 4.4, won 0.75 vs 0.8, peakVet 0.5 vs 0.6 —
all in band.)

## Gate

Attempt 1 (coordinator's, interrupted): 320/344 with 5 failures at
03:54:50Z; completion NOT confirmed. The log was truncated to 0 bytes by
the finisher's waiter during flap window 13 (04:28Z) — the 320/344 + 5
failures record survives only in the parent brief.

Attempt 2 (finisher's serialized re-run, tip 3fd09decc, launched
05:24:12Z, exit 05:45:20Z): **329 passed, 15 failed in 1266s, exit 1.**
Log: `evidence/2026-11-22/journey-endgame-r270-gate.log`.

The 15 failures:
- 4x 120s timeouts under load: test-living-garden-deed-attainment,
  test-one-person-army-deed-attainment, test-trust-observer-neutrality,
  test-capable-bot-20261014.
- 5x EPERM write artifacts of flap window 14 (started ~05:33–05:34Z):
  test-prepared-runner-custody, test-proof-text-identity,
  test-telemetry-check-recorder, test-deathcleanup-instrument-20261117,
  test-sw-audio-cache copyfile to /tmp.
- Measurement-proof staleness pair: test-measurement-proof-update
  ("Proof source inputs are not current"), test-measurement-workflow
  ("retained neutrality proof covers the current inputs").
- test-measurement-cache-flags; test-phone-frame-proof (stale receipt);
  test-foodpower-20261014 (ontology validator — `docs/ONTOLOGY.md` was
  0 bytes, truncated by the flap in both trees 05:38Z/05:45Z; HEAD blob
  `6fdba43b`, 354,624 bytes); test-occupation-panels ("real CLI workflow
  completed").

Standalone re-runs (finisher, tip 3fd09decc, 07:29:41–07:34:49Z, after
`docs/ONTOLOGY.md` was restored byte-identical from HEAD in both trees):
**12/15 PASS.** The 4 timeouts pass (living-garden 122s, one-person-army
73s, trust-observer 29s, capable-bot 30s); all 5 EPERM artifacts pass;
foodpower passes (3s); occupation-panels passes (25s);
measurement-cache-flags passes (13s). The 3 that fail identically are
the standing set: test-measurement-proof-update +
test-measurement-workflow (retained-proof staleness, same dormant debt
class as the proof re-sign rounds) and test-phone-frame-proof (stale
receipt).

Adjudication: **0 attributable to the r270 panel** — evidence-only run,
no game-code change. The 3 standing failures are known dormant debt,
not a regression.
