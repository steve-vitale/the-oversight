# Journey ENDGAME R16 (2026-10-18) — the overtime wait: is waiting ever worth it?

**Run id:** 20261018T022545Z (oversight-playtest-loop). Worktree: `journey-endgame`.
**Base:** master@349f9c03. Rotation index was 4 (endgame); advanced to 5 after this run.
Queued by r13's open tuning question: *"whether waiting through overtime is ever
viable or the design forces sitting by ~tier 3."*

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** Once the Table is ANNOUNCED (day 90+), is WAITING a real
choice for a competent player? Steve's overtime design (2026-10-14: "waiting
should have a cost — but also an opportunity for the truly powerful") says a
village can spend unseated weeks building power/deeds while RERUN-scaled
waves, faster raids and a degrading seat price eat them. Does a 3-tier wait
ever SIT STRONGER than sitting at dawn, or does sitting immediately always
dominate?

**Arms** (paired seeds, identical base stack — only the sit timing differs):
- CONTROL = sit-now: seatdrive default (tableTakeSeat the dawn the invitation is ready)
- WAIT = hold the seat 21 game-days (3 overtime tiers) after first announcement,
  keep playing the identical competent base policy, then sit.
- The wait is a policy gate on `SD.driveSeat` only — winseek's `tableRoad` only
  drains modals and never sits, so no other verb is suppressed. Verified: the
  engine never auto-sits (no dawn caller of tableScene exists; both arms' sits
  came through the policy driver).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 reach: ≥3/4 pairs both reach announcement (invited).
- M2 survive: ≥2/4 wait runs survive the 21-day hold and sit.
- M3 delta: ≥1 pair shows a material seat-quality delta attributable to the
  wait (doors ±, door standings, standings penalty, outcome) — in EITHER
  direction. Inert arms are a finding too.
- M4 people: ≥2 transcripts sense-read (announcement + tier-ups + the sit),
  0 senseless flags.
- M5 census: village census real post-table on both arms; no crash/softlock.

**Interesting-finding bar:** a wait that sits STRONGER than its control pair
(opportunity real) or LOSES something real during the hold (cost real) —
either resolves Steve's design question. Both arms identical end to end =
the wait is inert (a Steve question).

**Horizon:** DAYCAP=210, death-aware (+10d tail). **Seeds:** 8931–8934 (fresh).
**Policy:** belongseat stack (TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 +
BELONG_V3=1). **Pilot:** 1 pair (8931) to validate the hold instrument, then
expand to 4 pairs.

## PILOT (1 pair)

The hold worked exactly as designed: wait arm announced d90, held 21
game-days, tiers ticked at 97/104/111, sat d111 at tier 3. Control sat d90.
Two instrument bugs found and fixed in-run (both mine, not the game's):
1. runDays passes its OWN ctx to policy.daily — my counters were read off my
   local ctx object (heldDays/sdSeatTaken always 0). Fixed: capture the
   harness ctx in the daily wrapper.
2. `announceLost` incremented on every pre-announcement day (the null branch
   ran before any announcement). Fixed: only count when a live announcement lapses.
3. Conversation driver looped `dlg:comfort` 8× in a row (the r15-known driver
   artifact). Fixed: prefer unused choice ids per conversation (fresh-first,
   repeats only when nothing fresh remains).

## RESULTS (4 pairs, 8 runs)

| seed | arm | announced | sat | tier@sit | gone in wait | doors Δ (standings) | won |
|------|-----|-----------|-----|----------|--------------|---------------------|-----|
| 8931 | control | d90 | d90 | 0 | — | — | ✅ feared/light |
| 8931 | wait | d90 | d111 | 3 | 0 | −12/door, 0 gained, 0 lost | ✅ feared/light |
| 8932 | control | d129 | d130 | 0 | — | — | ✅ feared/light |
| 8932 | wait | d129 | d151 | 3 | 0 | −12/door, 0 gained, 0 lost | ✅ feared/light |
| 8933 | control | d90 | d90 | 0 | — | — | ✅ feared/light |
| 8933 | wait | d90 | d111 | 3 | **5** (Gunther, Katiuska, Santiago, Ingrid, Liam) | −27/door, 0 gained, 0 lost | ✅ feared/light |
| 8934 | control | d100 | d100 | 0 | — | — | ✅ feared/light |
| 8934 | wait | d100 | d121 | 3 | **2** (Lena, Wanjiru) | −18/door, 0 gained, 0 lost | ✅ feared/light |

- **M1 reach GO 4/4.** **M2 survive GO 4/4.** **M5 GO** (no crashes, no softlocks).
- **M3 delta GO — in the COST direction, on all 4 pairs.** Every wait arm sat
  with every door's standing docked (tier 3 × −4 = −12, plus −3 per Haven loss:
  −12, −12, −27, −18). **Zero doors gained, zero doors lost, zero new seats**
  on any pair. Door bases never improved — 21 extra days of competent play
  added wave deeds (e.g. 8931: 13/8/5 → 14/10/6 faced; 7 → 9 contests) but no
  door's base strength rose and the relative door ordering never changed.
- **Outcomes identical:** all 8 runs won feared/light at weakened 0, ending
  composition identical (path/path; the only diffs were cosmetic track/class
  keys on 2 wait arms: 8933 field→craft, 8934 hunter/stalker→socialite/showrunner).
- Pairs are CLEANLY matched: control@sit door standings == wait@announce door
  standings on all 4 seeds (byte-identical pre-announcement play).

**The answer to the leg question:** on 4/4 pairs the 3-tier wait was pure
cost and zero benefit. Nobody sat stronger. The "opportunity for the truly
powerful" half of the overtime design did not materialize: waiting 21 days
cost 0–5 villagers and 12–27 standing per door while earning nothing the
table prices. Sitting at dawn dominates on every measured axis.

**Design note for Steve (not a unilateral fix):** the overtime cost knobs all
fire correctly and legibly (see M4), but there is currently no mechanism by
which waiting IMPROVES the seat — door bases are threshold-driven and the
thresholds were already maxed at announcement on all 4 seeds. If the intent
is "waiting should have a cost — but also an opportunity," the opportunity
needs a priced mechanism (e.g. a door whose strength scales with deeds past
the announcement thresholds, or the lesser→full seat transition being
reachable mid-wait — none of the 4 pairs were near full). Alternatively the
design may simply be "waiting is always wrong, and the System tells you so" —
the tier-up lines already sell that reading honestly. Steve's call.

**Also observed (s8932):** the withdrawal→re-announcement arc plays correctly.
At d90 the seat priced 'none' ("The ledger still wants: wave-3 monsters
faced" — the flickering-ring beat), the village kept playing, and at d129 the
table was announced with fresh wording ("The table is being set — a lesser
seat, priced for what you built. They are watching to see who comes to it.").
Both arms then behaved. The no-seat path is not a dead end.

## Village assessment (census in plain words)

- **8931:** control ended 8/8 alive (won d90); wait ended 8/8 alive (won d111) —
  the wait cost nobody here, only standings.
- **8932:** the late bloomer — withdrew at d90 (no wave-3 deeds), re-announced
  d129, control won d130, wait won d151. 11/11 alive on both arms. The village
  that wasn't ready at 90 was ready at 129, and waiting past THAT cost nothing
  but standings.
- **8933:** the costly wait — 5 dead during the hold (Gunther, Katiuska,
  Santiago, Ingrid, Liam), village 8 → 3. Gunther had asked at day 80 whether
  the Bearer was staying "for real"; the Bearer waited, and Gunther died
  waiting. The run still won feared/light. The win is honest; the price is
  on the record.
- **8934:** 2 dead in the wait (Lena, Wanjiru), 8 → 7 (one joiner or return).
  Won identically.

## People check (SENSE-TESTING LAW)

- **Day 80 (pre-table), all runs:** villagers read as people. Gunther (8933):
  "About whether you're staying — Are you going to stay? With us. For real."
  → "Good. We're better with you here. I mean that." → on the table: "They
  say the table's coming. For us. I keep thinking about what we'd even bring
  to it." → "My part? I keep the fire lit where it sits. Somebody should tend
  the waiting." A person with a role, a fear, and a want (the Bearer to stay).
- Santiago (8933): "About what happened to my taken kin — You talk to it, the
  System. Have you ever asked? About the taken — about Victoria?" — the KIN.md
  Taking canon surfacing naturally in conversation, unprompted by the driver.
  When the driver answered inconsistently ("Yes" then "No"), Santiago reacted
  coherently: "Right. Noted — and I mean that, I'm keeping track of who says
  what." The engine handles driver nonsense gracefully.
- Grace (8934): a want with a plan — "The north treeline by the fallen oak,
  morning, early. Bring your pack and your knife." References a show event
  unprompted ("Duel. They just... took Henry. Came back like nothing happened.
  It wasn't nothing.").
- **Mid-wait (overtime pressure), wait arms:** Gunther at day 100 (8933):
  "So what's your plan here? Just... get through it?" — the village FEELS the
  stall and asks the Bearer for a plan. Henry at day 100 (8931, old driver):
  "We gave them a good burial. Doesn't feel like enough, does it?" — grief for
  the wait's dead, in the villager's own words.
- **Overtime tier-up lines (M4):** flavorful, specific, honest about the
  mechanics — "OVERTIME! The season was supposed to END. You didn't sit. So we
  kept the cameras rolling. RERUNS, folks — the hits, but HUNGRIER." /
  "OVERTIME ×2! Ratings are UP! The audience loves a stall!" / "The table
  docks your standing −13." The System's voice is on-brand and the numbers are
  stated plainly. 0 senseless flags.

## BLANK: investigated, not a bug (no code change)

`party_namepick:<n>` returns `line: null` on success (saw `(no line)` in the
8933 mid-wait transcript after naming the party "PLOT ARMOR"). Investigated:
`nameParty()` already narrates the beat via `this.say()` ("🤝 'PLOT ARMOR.' It
hangs in the air a moment — then Gunther grins..."), and the conversation
engine's `sayLine` fallback machinery (`convoSelfRepeatLine`, structural
turns) covers null lines — the UI reads the transcript, not the raw null.
The beat lands; the transcript renderer just printed the raw null. No fix needed.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`
(wins, table, scenes, completions, approaches, ascensions, exiled):
**quiet — no LOUD deviations** (2 files, 7 metrics). 8/8 wins vs baseline
7/8; both arms identical. Baseline NOT rolled forward (the wait arm's later
sit days and docked standings are deliberate-treatment artifacts, and the
baseline's coarse metrics don't capture the wait axis — a wait-specific
baseline would need seat-quality metrics).

## METRIC REVIEW (§14)

- M1–M5 all GO. No metric proved wrong; no revision proposed.
- Note for future runs: the wait-gate instrument is calibrated — 21 game-days
  = 3 tiers exactly (tier ticks at +7/+14/+21), `held` counts loop-days not
  game-days (45 loop-days ≈ 21 game-days on s8932; the tier clock is the
  authoritative measure). Paired seeds are byte-identical pre-announcement
  (control@sit == wait@announce on all 4 seeds) — the pair design is sound.
- The conversation driver now prefers fresh choices; note that day-80 convos
  consume game RNG, so driver changes re-randomize downstream runs — future
  runs must keep the driver pinned for comparability.

## Reachable / Fun / Winnable

- **REACHABLE:** Yes — 8/8 competent runs reached the table (one via the
  honest withdraw→re-announce arc). The overtime wait is reachable by simply
  not sitting; the engine prices it aloud every 7 days.
- **FUN:** The wait itself is legible and dramatic (the tier-up broadcasts,
  the villagers asking for a plan, the grief beats) — but as a STRATEGY it is
  currently a trap with no upside, which the game never quite says outright.
  The tier lines sell "the audience loves a stall" while the mechanics say
  "the stall only costs you." That tension is either a lie or a design
  waiting for its opportunity mechanism — Steve's call (see design note).
- **WINNABLE:** Yes — 8/8 wins, and the wait never un-won a run (even the
  5-death wait won cleanly). But winnability is not the question here —
  optimality is, and sitting at dawn dominates 4/4.

## Evidence

- `evidence/2026-10-18/journey-endgame-r16.md` (this note)
- `evidence/2026-10-18/journey-endgame-r16-{control,wait}-s{8931..8934}.json`
- `evidence/2026-10-18/journey-endgame-r16-transcript-{control,wait}-s{8931..8934}.txt`
- `evidence/2026-10-18/journey-endgame-r16-convos-{control,wait}-s{8931..8934}.txt`
- `evidence/2026-10-18/tele-r16-{control,wait}.json` (telemetry-check inputs)
- `scripts/journey-endgame-r16-20261018.js` (harness + wait-gate instrument)

**No game-code changes this run (tooling only).** Merged locally, pending ship.
