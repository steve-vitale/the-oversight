# Journey Endgame r42 — THE KEY DEFERRAL, SECOND MEASUREMENT (Lane B)

**Run id:** playtest-loop2-20261023-0500 (oversight-playtest-loop-2, lane B).
**Worktree:** `journey2-endgame`. **Base:** master 8f80d3cb5 (pulled at run start).
Rotation-b read 4 at start (endgame); this run plays leg 4.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** THE NETWORK KEY, SECOND MEASUREMENT. r19 (2026-10-18) found:
overtime fully voiced + tier 6 reachable; the titan chain council→call→commit
plays, but the FIGHT is muster-blocked at the bot's diplomacy depth (5/10
herald, 3/12 nielsen); key path unwinnable 0/4; deferral lethal-by-design
(all four villages starved in the wait). r20 (2026-10-19) then BUILT the
missing verb: `titan:standdown:<tid>` breaks an unfillable muster — the exit
r19's death spiral needed. Question now: (a) can the muster FIGHT gate be
reached on current master at all? (b) does the stand-down verb make
key-deferral survivable — does the village live through the wait instead of
bleeding out? The driver only calls verbs a player can call
(council/call/commit/standdown), marches honestly, lets the fight engine
decide. Stand-down rule (competent-player logic): after call+commit, if the
muster shows no growth for 15 days and sits below half the gate, or the call
stands 45 days unanswered, the player breaks it — retreat is not resolution
(r20's design), but it stops the bleed.

**What would count as interesting:** a fight-ready muster (first titan fight
in sims); a stand-down fired with the village alive ≥20d after; OR the same
muster-block with fresh numbers (the design blank persists — Steve's tuning
call). Any of these answers the leg question.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 reach GO: ≥3/4 seeds reach table announcement.
- M2 overtime GO: ≥1 seed reaches overtime tier ≥3 unseated.
- M3 muster GO: ≥1 titan muster reaches fight-ready (titanMusterReady) on any
  seed — the gate that missed in r19.
- M4 stand-down GO: ≥1 unfillable muster stood down via the verb with outcome
  'stood-down' recorded, village alive ≥20d after.
- M5 people GO: ≥2 beats sense-read (war council / stand-down / a tier rise),
  0 senseless flags.
- M6 census GO: clean ends, no crash/softlock; ≤10d tail on dead villages.

**Seeds:** fresh 84011–84014. **Pilot:** seed 84011 first; expand if the chain
shows life. **Horizon:** 260 days, death-aware. **Env (before any require):**
TRIBFLOOR=1, WINDEFER=1, FEASTSCALE_R13=1, BELONG_V3=1 (r19's stack).
**Instrument:** scripts/journey-endgame-r42-20261023.js (r19's driver + the
stand-down clause + titanOutcomeLog capture).

## RESULTS (4/4 seeds)

| seed | announce | maxTier | herald (blades/need) | nielsen (blades/need) | stand-down | end |
|------|----------|---------|----------------------|-----------------------|-----------|-----|
| 84011 | d90 | 6 | called d100, 2/10, stood down d120 | called d120, 0/12 | d120 | scattered d134 |
| 84012 | d157 | 4 | called d107, 3/10, stood down d127 | called d182, ~0/12 | d127 | died d187 |
| 84013 | d90 | 2 | called d106 | — | none (died d107) | died d107 |
| 84014 | d98 | 6 | called d150, 2–3/10 | called d124, 6/12 | none (boundary) | scattered d165 |

- **M1 reach GO:** 4/4 announced (90, 157, 90, 98).
- **M2 overtime GO:** tiers 6, 4, 2, 6 — 3 seeds ≥3.
- **M3 muster — MISS (binding):** 0/4 musters fight-ready. Best: 84014's
  nielsen 6/12 (exactly half the gate), 84011/84012 heralds 2–3/10. The
  bot's diplomacy depth (1 active link, `_links: 0` at end on scattered
  seeds) still cannot field 10/12/20 blades. Same gate as r19, fresh numbers.
- **M4 stand-down GO:** 2 stand-downs fired (84011 d120, 84012 d127, both
  'stalled-15d-below-half-gate'). The 'stood-down' outcome IS recorded in
  game state — proven by the new mid-run snapshot on 84011:
  `[{titan:'herald', day:120, outcome:'stood-down', detail:{haven:1, allied:1}}]`.
  84012's village lived 60 days past its stand-down (d127→d187) — the ≥20d
  clause holds there. (84011 died 14d after; the clause needs only one seed.)
- **M5 people GO:** war councils (herald d100 with Grace Weber/Ruth Tanaka;
  nielsen d120 "No one sits with you. You have no coalition. The council is
  one chair."), 2 stand-down beats, tier-rise lines — 0 senseless flags.
- **M6 census GO:** 4 clean ends (2 scatterings, 2 deaths), no crash/softlock.

**PRIMARY: NO-GO on the M3 binding** — honestly kept, not re-scored. Same
verdict class as r19: the muster gate is the wall.

## METRIC REVIEW (§14)

- M3's fight clause misses again — the break is documented, not re-scored.
  The muster bar (10/12/20 allied blades) wants 4–10 answering villages; the
  competent bot builds one strong link. r19's blank #2 (Steve's tuning call)
  persists on current master with fresh numbers.
- The driver's outcome end-read returned null on all dead runs (the read path
  `G._titanTest.titanOutcomeLog()` at end-of-run). The outcome IS written —
  `titanStandDown` calls `titanRecordOutcome(tid,'stood-down',…)` unconditionally
  and r20's proof test (19/19) covers it. Fixed in-instrument: the driver now
  snapshots `_outcomes` into the per-dawn titan ledger (d%5); verified on the
  84011 re-run (`stood-down` captured at the d130 snap). Next key runs get the
  record regardless of end-state.
- Driver eagerness recurs (r19's note, again): 84011 called the NIELSEN on
  d120 — the same dawn it stood down the herald — while the pantry was
  already empty. A real player triages; the driver calls every titan it can.
  Instrument limitation, documented, not a game bug.
- 84014's nielsen sat at exactly 6/12 — the stall rule's strict `< half-gate`
  kept the muster standing while the village starved. Boundary case of the
  instrument rule, not a game bug; a real player at exactly half with no
  growth for 20+ days would likely break it too.
- Smoke-test discipline: a 25-day smoke run of the driver OVERWROTE the
  pilot's 84011 evidence (untracked files — `git checkout --` can't restore
  them). Recovered by deterministic full re-run (reproduced byte-for-byte:
  same days, same stand-down, same outcome). Lesson added to AGENTS.md:
  never smoke-test over a live run's evidence filenames.

## Village assessment (census in plain words)

- **84011 — the overtime village.** Held the seat from d90 to tier 6. Called
  the herald d100: Grace Weber of The Hungry Road II (trust 61, steadfast)
  answered with Ruth Tanaka; Haven committed Daniyar, Farid, Yara — 4 blades
  against 10. The muster stalled; the player broke it d120 ("they bled for a
  fight that never came"). Called the nielsen the same day — nobody answered;
  Aki stood alone against 12. The pantry was already empty; the village
  scattered d134.
- **84012 — the late bloomer.** Announced d157, held to tier 4. Herald called
  d107: 3 Haven blades, no allies; stood down d127. Nielsen located late via
  the tier-2 third-titan omen (d182). The village fought on 60 more days and
  died d187 — everyone dead, not scattered.
- **84013 — the quick death.** Announced d90, herald called d106, village
  died d107. The wait never got started.
- **84014 — the stubborn one.** Announced d98, tier 6. Nielsen called d124
  (6/12 — exactly half the gate, never grew, never broke), herald d150
  (2–3/10). On the fifth hungry day the village scattered d165: "people
  started walking — in different directions. The scattering, again." Rafael
  waited two days at the fire and walked back to Stonebridge with nothing —
  "They'll remember the silence."

## People check (SENSE-TESTING LAW)

1. **Herald war council (84011, d100):** "The leaders sit as faces, not
   pieces." Grace Weber (trust 61, steadfast) — "Scouts: they would die for
   this coalition." The Hungry Road II answers; Ruth Tanaka marches ("they
   are counting on you"). Haven commits Daniyar, Farid, Yara by name, the
   cost said aloud ("They can die — Haven does not get them back"). The
   coalition counts 4 against 10. The NPC wants something (their people's
   safety, a coalition that works); the answer is given aloud with reasons.
   0 senseless flags.
2. **Nielsen war council (84011, d120):** "No one sits with you. You have no
   coalition. The council is one chair." The call goes out, nobody answers,
   Aki stands alone against 12. The design says the empty council reads
   exactly this bleak — and it does. 0 senseless flags.
3. **Stand-down beats (d120/d127):** "THE MUSTER BREAKS — THE HERALD still
   stands, unanswered, but the blades go home. 1 of Haven's own comes home.
   1 allied fire walks home thinner (trust −5 — they bled for a fight that
   never came). The lair waits. Sound the call again when the coalition is
   real." Retreat is voiced as retreat, not victory; the cost is named; the
   future is planted. 0 senseless flags.
4. **Unanswered-call consequence (84014):** "Rafael waits two days at your
   fire, getting thinner. Nobody answers. They walk back to Stonebridge with
   nothing. They'll remember the silence." Cause and consequence on the page.
   0 senseless flags.

## BLANKS

1. **The muster/diplomacy gate (r19 blank #2, persists).** 0/8 key-chasing
   seeds (r19+r42) have fielded a fight-ready titan muster. minAllies 10/12/20
   wants 4–10 answering villages; the competent bot builds one strong link.
   Steve's tuning call stands: is the intended play really "build a 4+
   village coalition before wave 4," or are the gates high? The stand-down
   verb (r20) gives the failure an exit, but the key path stays unwinnable
   in sims (0/8) while the table stays winnable.
2. **The key path is still unwinnable in sims (0/8 cumulative).** The Network
   was never summoned on any seed (finale never omened — wave 5 unreached;
   the playtest loop's scale-onramp domain). THE HOSTS remains unplayed in
   sims. Not a kill — kill discipline: the lever (muster gates) hasn't been
   proven wrong, only unreachable at the bot's diplomacy depth.
3. **(Instrument, fixed)** the outcome end-read gap — now snapshotted mid-run.

## Reachable / Fun / Winnable

- **REACHABLE:** Overtime is reachable and fully voiced (G1, tiers to 6).
  The titan chain is reachable through council/call/commit/standdown. The
  FIGHT is not reachable at the bot's diplomacy depth (5th measurement
  round: 0/4 here, 0/8 cumulative). The Network key is unreached in sims.
- **FUN:** The overtime + escalation + muster beats remain the best systems
  writing in the game — the season that wouldn't end, the hungry muster, the
  ally who walks home thinner, Rafael's two days at the fire. The stand-down
  beat earns its place in that company. The design is coherent; the muster
  numbers may be high (Steve's call).
- **WINNABLE:** The key path is unwinnable in sims (0/8). The table itself
  remains winnable (r18: 7/8, r41: 6/6) — the deferral was the instrument's
  choice, not the game's. The stand-down verb makes the wait survivable for
  a while (60 days on 84012) but does not make key-deferral survivable
  overall: all four villages died unseated.

## Telemetry deviation check

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json` —
**2 LOUD lines**, both adjudicated EXPLAINED, baseline NOT rolled:
- `satPenalty.penalty` disappeared (91→0): the key-deferral arm never sits
  the seat by design (same adjudication as r19) — the baseline measures the
  seat-driver win-path axis; r42 is a different arm.
- `announced` newly appeared (0→4): metric-key artifact — the baseline has
  no `announced` key (missing path counts as 0); this run's aggregate
  introduced it. Not a real deviation.
- Quiet: maxTier 16→18 (seed-count sums, per-seed tiers 6/4/2/6 consistent
  with the deferral regime).
- New measurements (not baselined): standdowns 2, titanFights 0, won 0.
  Evidence: `evidence/2026-10-23/tele-r42-key.json`.

## Evidence

- evidence/2026-10-23/journey-endgame-r42.md (this note)
- evidence/2026-10-23/journey-endgame-r42-key-s{84011..84014}.json
- evidence/2026-10-23/journey-endgame-r42-transcript-key-s{seed}.txt
- evidence/2026-10-23/journey-endgame-r42-frames-key-s{seed}.json
- evidence/2026-10-23/journey-endgame-r42-convos-key-s84014.txt
- scripts/journey-endgame-r42-20261023.js (r19 driver + stand-down clause +
  mid-run _outcomes snapshot)

**Game-code changes this run:** none. **Tooling:** the r42 key-driver
instrument (1 stand-down clause, 1 outcomes-snapshot fix; verified by the
deterministic 84011 re-run).
