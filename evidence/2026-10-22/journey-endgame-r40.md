# Journey Endgame r40 — THE GREY MIDDLE (Lane B)

Run: lane-B endgame r40, 2026-10-22. Rotation-b read 4 at start (endgame up
after the full 5→6→7→4 cycle today).

## Pre-registered header (MEASUREMENT.md §§9–12, 14 — written before any play)

**Leg question:** THE GREY MIDDLE AS LIVED PLAY. The relay path's leaning
gradient has three bands; light (r39, this morning) and dark
(sim-tablepathdriver, 10 terminal walks) are walked. Grey — "the
pragmatist's both-hands endings," "not a coin flip, not a lesser frame"
(TABLE.md GRADIENT law; src/js/table-relay.js) — has never been walked. Is
the middle reachable by sustained pragmatic play (use the relay for real
work, refuse both the dark verbs and the tender extremes, read the System's
lean notices and self-correct), and do its two finals (both-hands,
the-contract) play and read as a person?

**What would count as interesting:** a grey final offered and walked to
terminal with a coherent both-hands ending; the band proving unreachable by
honest thermostat play (drift to light/dark despite correction — a design
finding about the gradient); the cockpit merge failing under grey
constraints (quarantine/merge math hostile to the middle); grounding
collapse pricing out the middle (the two-way cost).

**Bindings (a miss is NO-GO, never re-scored):**
- M1 GUARD: ≥3/4 seeds reach the table window (announceDay != null) and
  sit (satDay != null).
- M2 GREY EARNED: on seeds where the layer holds the relay pre-sit
  (sysBond ≥ 2, ≥5 relay verbs, ≥1 commune answered), the at-sit band is
  'grey' AND |lean| ≤ 30. GO = 100% of qualifying seeds. 0 qualifying
  seeds → NO-GO with reachability analysis.
- M3 GREY FINALS PLAY: on grey-sat seeds, a grey final is offered and the
  walk reaches terminal (won or priced failure — failure resolving counts
  as played). GO = 100% of grey-sat seeds.
- M4 LEAN LEGIBILITY: relayLeanNoticed fired ≥1 per grey run (the System
  voiced the drift); the sit-time ledger line names the relay band.
  GO = 100% of grey-sat seeds.
- REG (inherited, binding): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

**Substrate:** CAPABLE bot + CAPABLE_GREEDY=1 (deferral design, r39 regime),
CAPABLE_GREEDY_MAXTIER=6, CAPABLE_GREEDY_LASTDAY=170, RELAYGREY=1
(scripts/policies/relaygrey.js — the pragmatist's road), TELEMETRY_FULL=1.
180d, death-aware. Seeds 82011–82014 (fresh; adjacent to r39's 81011–81014).

**Instrument:** scripts/probe-endgame-r40-20261022.js (+ censusOf FIX —
r39's documented caveat resolved: occupation, village.npcAbilities[vid],
scholar.villagerId→name, dead-filter bug), verdict
scripts/analyze-endgame-r40-20261022.js. Gates: DET (on-twice
byte-identical), FID (off: relaygrey-wrapped == pure capable).

## RESULTS

Completed 2026-10-22 ~21:38Z by the adoption run (playtest-loop-2-2026-10-22T2059Z).
The 18:55Z coordinator died at ~19:48Z with seeds 82011–82013 done; its WIP
was preserved byte-identical (commit 8583e5645, rebased to 1eaf50e01 on master
4945cf38c) and the run completed: seed 82014 fresh + 82011–82013 re-run under
the corrected env. The re-runs reproduce the dead run's partials EXACTLY
(announce/sat days, lean, band, verbs, communes, finalPick) — the instrument
is deterministic and the adoption is faithful.

Per-seed (180d, death-aware, CAPABLE_GREEDY=1, RELAYGREY=1, CAPABLE_RELAYROAD=0):

| seed | announce | sat | seat | path/branch | won | at-sit | verbs | communes | final |
|------|----------|-----|------|-------------|-----|--------|-------|----------|-------|
| 82011 | d90 | d115 | lesser | relay/grey | yes | lean 9, grey, grounding 95, bond 2 | 8 | 6 | both-hands |
| 82012 | — | — | — | — | no | village-lost d37 (famine→scattering) | 0 | 0 | — |
| 82013 | d90 | d132 | lesser | relay/grey | yes | lean 9, grey, grounding 39, bond 3 | 9 | 7 | both-hands |
| 82014 | d90 | d133 | lesser | relay/grey | yes | lean 0, grey, grounding 55, bond 2 | 2 | 1 | both-hands |

Analyzer verdicts (`scripts/analyze-endgame-r40-20261022.js`):
- M1 GUARD: GO — 3/4 seeds announced+sat.
- M2 GREY EARNED: GO — 2/2 qualifying seeds grey at sit, |lean| ≤ 30 (both lean 9).
- M3 GREY FINALS PLAY: GO — 3/3 grey walks offered a grey final and reached terminal (all won).
- M4 LEAN LEGIBILITY: NO-GO — noticed=0 on all 3 grey runs (ledger line names the band on 3/3: "The middle road is open."). See metric review.
- REG r35 audit-naming: GO 3/3. REG r37 sat-penalty: GO 3/3.
- PRIMARY: NO-GO (M4 binding). ALL: NO-GO.

Headline finding: THE GREY MIDDLE IS REACHABLE AND WALKABLE. Three seeds
walked relay/grey to terminal with the both-hands final, all won, all at
lesser seat, all with the lean HELD (9, 9, 0) — the thermostat never even
needed to fire (rerouteEff=0, rerouteHon=0 on 82013's 85-day trace; lean
pinned at 9 for 44 straight days). The middle is held by least-extreme
commune answers, not by correction. The two-way cost is real and visible:
grounding bled 98→39 on 82013 (never hit the 30 floor, but the pragmatist
pays for the middle every day).

82014 is the edge case: relay claimed but barely used (2 verbs, 1 commune),
lean 0 — grey by neglect, not by pragmatism — yet the both-hands final was
still offered and won. See blanks #4 (design question for Steve).

## Village assessment (census in plain words)

**82011 — Haven, global scale, 8 alive, 0 dead, pantry 55,078 kcal.**
Bearer: Sigrun Eiriksdottir, 47, night security guard — the SECOND bearer;
Mara Vasquez (the original) died in combat on day 110 and the mantle passed
at the grave. The village: Ciro Roldán (interpreter, 4 abilities), Elif Demir
(hotel housekeeper, 4), Sanne Bakker (Vintner, 3), Raj Patel (Pharmacist, 3),
Owen Smith (hunting guide, 4), Kamila Akhmetbekova (bus driver, 3), Paramjit
Warrier (interpreter, 1). Nobody starved, nobody scattered. The bearer holds
no NPC abilities (abil 0 — the bearer's power is the six System slots, not
the villager ability count; consistent across all three sat seeds). This is a
village that learned division of knowledge: a pharmacist, a hunting guide, a
vintner, two interpreters — and it shows in the pantry.

**82013 — global scale, 8 alive, 0 dead, pantry 20,319 kcal.**
Bearer: Sisa Grijalba, Midwife. Milo Duarte (emergency dispatcher, 6
abilities), Kayden Kovalchuk (Rancher, 6), Gonzalo Cabrera (street artist,
3), Thabo Maseko (taxi driver, 3), Aki Tanaka (Fisherman, 3), Carlos Diaz
(Fisherman, 4), Giulia Bianchi (crossing guard, 5). The most able-bodied
roster of the four (two 6-ability villagers). Leaner pantry than 82011 but
comfortable.

**82014 — global scale, 10 alive, 0 dead, pantry 0 kcal.**
Bearer: Sam Wilson, bartender — held the whole run, no succession. Ten
souls: blacksmith, sign painter, street artist, locksmith (6 abilities),
journalist (5), glazier, two cooks, programmer. The biggest village — and an
EMPTY pantry at the table. They won on the day's food and the road's momentum,
not on stores. Either inspiring or a warning; the sim doesn't judge.

**82012 — village-lost, day 37.** Never reached the table window. The story:
pantry hit zero, "Day 3 of hunger," Elif starved, Daniella starved, Carlos
starved, a System grab took the bearer + Boris + Sanne mid-collapse, and on
the third hungry day "people started walking — in different directions. The
scattering, again." Six alive at the end but no village. The death-aware
horizon worked: the sim stopped at day 37 (+tail), never ticked a dead
village to fill the leg.

Who leads: the bearer, always — but on 82011 the village had to be re-won:
"You're not Mara," Owen says. No heat, just fact. Who is miserable: on 82012,
everyone, honestly. What is missing: on the sat seeds, nothing structural —
these are complete villages with cooks, healers, hunters, makers. The famine
seed is missing food, full stop.

## People check (sense-read)

Read the full table window on 82011 (good-env transcript, 3,843 lines) and
82014's ending, plus 82012's collapse.

1. **The audit (82011, line 3811)** reads the run back with receipts: "A
   lesser seat — global standing, waves 1–3 faced (14/7/6), with 3 wave-4
   fought, 13 contests survived, 4 crises weathered." Then the war path:
   "On day 109, Mara put down Don't-Look." Then the price: "The table notes
   the overtime: 3 weeks kept waiting, 1 of Haven lost meanwhile. Every
   door's standing −15." Specific, earned, priced — not a participation
   ribbon.
2. **The both-hands final** is the best ending prose in the relay path so
   far. The cockpit deepens with the System comprehending ("Depth recognizes
   depth... It is champion now... It is kin now"), two BACKFIREs where it
   mislearns at scale ("Planted: a thread you'll have to pull later" —
   consequence planted, not resolved), and the close: "the vast, jittery,
   trying-so-hard machine — does something it has never done: it ACCEPTS an
   unclean answer. 'BOTH HANDS,' it says, testing the words. 'THE TENDER ONE
   TEACHES. THE TOTAL ONE WINS. ...I CAN DO THAT. I CAN BE BOTH.'" The
   galaxy argues about what it saw; the village doesn't. This is the grey
   anthem the canon promises, and it lands.
3. **The succession (82011, day 110)** is people acting like people. Mara
   dies in combat; the relay goes unheld ("messages go back to runners and
   smoke"); The Hungry Road presses the tribute down while the chair is
   empty; Owen: "You're not Mara." / "You'll have to earn this face." / "The
   village's quarrel was with Mara — and Mara is dead. The sentence doesn't
   cross the grave." Ciro, Elif, Sanne speak for Sigrun at the grave. Trauma
   +5, "a heavier kind of stepping up." The r35 succession work holds up
   inside an endgame run.
4. **Commune cadence**: the System asks "BEARER. THE WIRES HAVE QUESTIONS.
   COME TALK WHEN THE FIRE IS LOW." 8 times across the run; the layer
   answers least-extreme. The actual scene dialogue isn't in the SAY
   capture (bot auto-answers) — instrument limitation, not a game gap; the
   lean trace proves the answers landed where intended.
5. **82012's collapse** is the famine leg's thesis in miniature: starvation
   warnings escalate honestly ("You went to bed on an empty stomach" →
   "The spiral has started"), deaths are named with their absence felt
   ("Somebody's sleeping-roll stays rolled out. Nobody puts it away"), and
   the scattering line — "Haven couldn't hold. On the third hungry day,
   people started walking — in different directions. The scattering, again."
   — earns the game's title.

No fabricated shared history found in the read passages; no filler loops;
the System's voice stays in register (big brother + chilling benefactor).

## Blanks

1. FIXED (instrument): censusOf — r39's documented caveat (roles/
   abilities/mantle unread, `dead` field copy-paste bug). Root cause: the
   probe read p.role/p.job (field is `occupation`), p.abilities (villager
   abilities live at `state.village.npcAbilities[vid]`), scholar.name (the
   bearer <redacted> `scholar.villagerId`). Fixed in the r40 probe.
2. FIXED (instrument, r40b): censusOf occupation STILL read null — the
   canonical person field is `formerOccupation` ("pottery instructor"), not
   `p.occupation` (always null); `occupationId` is the identity-layer
   disguise (e.g. taxi_driver vs true cook), not the true occupation.
   Verified by direct harness probe. The r40 "FIXED" claim was wrong; now
   actually fixed, and all four per-seed JSONs regenerated with real
   occupations.
3. FIXED (instrument, r40b — the big one): the probe's Usage line omitted
   `CAPABLE_RELAYROAD=0`, so the adoption sweep double-drove the relay
   (capable base + grey layer): verbs 207 vs 8, communes 120 vs 6, lean
   pinned at 100/light, table never announced on 82011. The dead run had run
   with CAPABLE_RELAYROAD=0 (its gate comment says so: "the grey road owns
   the relay") but never wrote it down. Root cause found by SMOKE
   A/B: with the var, 82011 reproduces the dead run's partial EXACTLY
   (announce d90, sat d115, grey/9, both-hands). Fix: the probe now defaults
   CAPABLE_RELAYROAD='0' when RELAYGREY=1 and unset (loud NOTE on stdout),
   and the Usage comment carries the full env. Zero game change.
4. DOCUMENTED (design question for Steve): 82014 walked grey by NEGLECT —
   relay claimed, 2 verbs, 1 commune, lean 0 — and still got the both-hands
   final and the win. Grey is the default band (lean 0 = neutral), so the
   middle is free to anyone who claims the relay and ignores it. Is that
   the honest pragmatist's road, or should the grey final require genuine
   relay use (the M2 "genuinely used" qualifier: ≥5 verbs, ≥1 commune,
   sysBond ≥ 2)? The canon says grey is "earned" and "not a coin flip" —
   82014's walk is neither earned nor a coin flip; it's untouched. Steve's
   call whether the door should ask for the work.
5. DOCUMENTED (design observation): the thermostat is a backstop, not the
   mechanism. Across 85 traced relay-days on 82013, rerouteEff=0 and
   rerouteHon=0 — the lean never left the ±10 deadband because
   least-extreme commune answers hold it there. If a future design wants
   the middle to feel PRECARIOUS rather than restful, the drift pressure
   needs to come from somewhere the answers can't fully cancel.

## Reachable / Fun / Winnable

- REACHABLE: yes — 3/4 seeds reached the table window and sat; the grey
  road was walked by sustained pragmatic play with no exploits, on the
  standard capable policy. The one miss (82012) died of famine at day 37,
  before the window — a legitimate early-game death, not a reachability
  gap.
- FUN: yes, with a caveat. The both-hands ending is the strongest relay
  prose to date; the audit prices the run honestly; the succession inside
  the run hits hard. The caveat is blank #5: holding grey is restful, not
  tense — the lean sits at 9 for 44 days and nothing threatens it. A player
  won't feel the middle; they'll feel the ending.
- WINNABLE: yes — 3/3 grey walks won at lesser seat. (The table prices the
  run rather than gating on godhood, per TABLE.md:62 — these wins came
  from competent non-god play.)

## Metric review

1. **M4 LEAN LEGIBILITY is a self-defeating metric (metric misfit).** It
   demands `relayLeanNoticed ≥ 1` per grey run — but relayLeanNoticed fires
   on BAND CROSSINGS, and a perfectly held grey run never crosses a band
   (lean 9 for 44 days → 0 notices, correctly). The metric punishes the
   thermostat for working. The mechanism itself is proven: the misconfigured
   double-drive sweep crossed bands repeatedly and notices fired (noticed=5
   and 7) — the voicing works, it just has nothing to voice on a held run.
   The ledger-line half of M4 passed 3/3 ("The middle road is open").
   PROPOSAL for the next endgame run: M4 = (a) ledger/audit line names the
   band on 100% of grey-sat seeds (kept), + (b) a forced-drift control —
   one seed with the thermostat disabled — must produce ≥1 notice, proving
   the voicing fires when there is drift to voice. Never re-score this
   run's NO-GO.
2. **M2's "genuinely used" qualifier vs 82014.** M2 correctly excluded 82014
   (2 verbs < 5) from the grey-earned set, but M3 counted its walk as a grey
   final played and won. The split verdict is honest, but it surfaces blank
   #4: the game currently lets an unused relay walk the grey final. If Steve
   rules that grey must be used to be walked, M2's qualifier should become
   the door's qualifier (game change); if the neutral middle is legitimate,
   M2's qualifier should drop to "claimed + sat grey" (metric change).
   Either way it's a next-run revision, not a re-score.
3. **M1's 3/4 bar** held despite 82012's famine death — the death-aware
   horizon (stop at d37, no dead-village ticking) makes early deaths cheap
   rather than run-killing. Keep.

## Regressions / checks

- DET (instrument on twice, 120d, seed 0, grey-owns config): GREEN byte-identical.
- FID (RELAYGREY unset: wrapped base vs pure capable, 120d): GREEN byte-identical (gameDays 121, won false, alive 8, pantry 37709 — identical).
- Telemetry deviation check vs `telemetry-baselines/endgame.json` (maxTier, satPenalty.penalty, 4 seeds): quiet, no large deviations.
- No src/js changes in this run (policy-side + instrument only). capable.js diff is 4 env-gated lines, default-on.
- The 18:55Z→21:38Z adoption is faithful: seeds 82011–82013 reproduce the dead run's partials exactly under the corrected env.
