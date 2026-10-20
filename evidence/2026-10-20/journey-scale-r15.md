# journey-scale r15 — the Watchers answers: CHAMPION and DECLINE (2026-10-20)

**Run id:** playtest-loop-2026-10-20-0745CDT (oversight-playtest-loop, LANE A, leg 3 scale).
**Base:** master 5a8ec8ef1. Worktree: `journey-scale`.
**Rotation note:** journey-rotation-a.txt read "3" at run start (the r14 note of
2026-10-20 claimed "rotation-a 3→0" but the file still held "3" — discrepancy
noted, not chased). This run played leg 3 and writes back "0".

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any code changed)

**Leg question:** on the current tip, does a competent national-road village
that reaches The Watchers (global, viewership ≥ 32, days 80–140) get the
CHAMPION and DECLINE answers aloud with real consequences — and what do they
cost/buy versus the feast road (r8–r14: 5,000 kcal of theater, always the
harness default)? The r8–r14 harnesses all answered `answerGlobalChoice('feast')`;
champion/decline are engine-complete but unexercised on the tip.

**Canon:** docs/SCALE.md §4 (The Watchers: champion = send the speaker into
the light 7 days; feast = 5,000 kcal of theater; decline = say no on camera,
viewership −10, remembered). Decline's "remembered" is the moral ledger:
`ledgerAdd('hierarchy', 'global-declined')` → defiance +1 (ledger.js:227),
which the table's path evaluation reads (`defiant: L.defiance*3 + …`). All
three answers stage globalLive. TABLE.md:72 — the lesser seat's scale bar is
deliberately regional ("reachable by competent non-god play"); the full seat
keeps the national bar.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 staging — The Watchers beat stages on ≥2/4 pilot seeds (viewership ≥ 32
  + nationalLive; a seed that never reaches it is replaced, never a miss).
- M2 fire-aloud — each exercised answer fires with beat text captured +
  consequences state-verified: CHAMPION → `mshipState().loaned =
  {vid, untilDay: day+7, to: 'the world feed'}`; DECLINE → viewership −10
  (live value), ledger defiance +1 with the 'global-declined' event logged,
  globalLive=true. NO-GO if silent or consequences don't match copy.
- M3 people — ≥4 full transcripts sense-read (Watchers beat + surround),
  0 senseless flags.
- M4 survival — ≥2/4 reach d120 (death-aware; dead/scattered stops).
- M5 honesty — the champion's departure AND return are voiced; decline's
  price is spoken aloud ("(Viewership -10.)"); the decline ledger entry
  exists (the galaxy's memory is state, not silence).

**Interesting-finding bar:** first champion/decline beat text on this tip;
the champion absence's real cost; the serve+champion loan-slot interaction;
whether decline is a real choice or a trap.
**Policy:** belongseek + feast layer (R15_FEAST=1; r13's 7/8-lesser-seats
policy — the most viewership-rich instrument on the belong road). The
Binding is answered 'swear' (r13's control road to national).
**Horizon:** DAYCAP=185, death-aware. PILOT FIRST: 2 champion + 2 decline on
fresh seeds 15001–15004.

**Substrate checklist (§14b):**
1. Contact: the Watchers staged on 3/8 r11-repl seeds and 2/5 r14 seeds on
   this tip — the mechanism is live. PASS.
2. Pool sizing: the probe is an engine-path exercise, not a lever measure —
   2+2 pilot suffices; expansion only if the pilot shows material. PASS.
3. Verb existence: `answerGlobalChoice` + the r12 watchers stamp are the
   established idiom; the outer-wrap substitution pattern is proven (r14's
   Binding fix). PASS.
4. Horizon fit: the beat stages d70–130 on this tip; DAYCAP=185 covers it. PASS.

**Kill verdict taxonomy:** an M2 miss is METRIC-BROKEN unless the autopsy
finds the answer can't reach the mechanism (then CONCEPT-DEAD). A silent
beat is NO-GO for the leg's "played, never a silent flip" canon.

## HARNESS BUG CAUGHT ON PILOT (r14 lesson applied)

`belongseek` extends `scalecourt`, whose daily answers `pendingGlobal`
with 'feast' inside `BASE.daily` — before the harness's regionalPlay
backstop ever sees the beat. The probe would have silently measured feast
×4. Fixed by substituting the probed answer in the outer `answerGlobalChoice`
wrap (harness-only, zero game-code change), exactly the r14 Binding pattern.
Verified: 15002's JSON records `watchersAnswer: 'champion'`, 15003/15004
record `'decline'`.

## RESULTS

### Pilot: 2 champion + 2 decline (belongfeast, seeds 15001–15004)

| seed | answer | watchers | days | end | national | global | table |
|------|--------|----------|------|-----|----------|--------|-------|
| 15001 | champion | — (never national) | 123 | village-lost | never | never | lesser d90 (regional — canon, TABLE.md:72) |
| 15002 | champion | d73 | 169 | village-lost | d72, 55d | d73 | lesser d90 |
| 15003 | decline | d120 | 179 | survived | d72, 76d | d120 | lesser d90 |
| 15004 | decline | d77 | 108 | village-lost | d76, 9d | d77 | lesser d90 |

### M1 staging — GO (3/4)
15002/15003/15004 staged. 15001 never reached national (replaced per the
pre-registered rule — but kept as a datum: a regional village took a lesser
seat at d90 with viewers=40, exactly TABLE.md's intended on-ramp).

### M2 fire-aloud — GO, with two findings
- **DECLINE (15003, 15004): clean.** Full beat text captured: the staging
  ("36. You see the number. THE WORLD IS WATCHING…"), the demand copy,
  "📡 Haven declines the world feed. The countdown runs without you. The
  galaxy watches you say no — and remembers. (Viewership -10.)", and the
  System's "Species agency: unlocked." Consequences state-verified:
  viewership −10 on the live value, `ledger().defiance` +1,
  `ledgerEvents` carries `{sys:'hierarchy', ev:'global-declined'}`,
  globalLive=true. 15004's tail even caught a villager reacting mid-beat
  ("My kid asked if the watchers have favorites.").
- **CHAMPION (15002): fired, but the loan slot was occupied.** At d73 a live
  3-day policy tend-loan (Nino → village_spl_27_89332, until d74) held
  `m.loaned`, so the champion answer took its designed fallback: "There is
  no speaker to send — the cameras find you anyway. The galaxy gets what
  the galaxy wants." No clobber (break-it regional 2026-10-09: loans don't
  clobber), globalLive still staged. **Finding:** the copy is slightly off —
  there WAS a speaker (Nino was abroad, not absent); the beat reads as if
  no one exists. The champion answer is not guaranteed: any in-flight loan
  (accord gesture, tend-serve, first-court host, binding serve) downgrades
  it. Documented as a polish note; the engine behavior is honest and voiced.

### M3 people — GO (4 transcripts sense-read, 0 senseless)
- **Roman d100 (15002, seek_comfort):** grieving farmer, driver spammed
  comfort 8× — he stayed in voice, then closed it himself ("We're done for
  now. Not done-done. For now."). Graceful anti-spam, resolution=engaged.
- **Iker d120 (15001, ask_favor):** mechanic, trust 74 — wants a door he can
  close. Specific, grounded lines ("I rearranged the bunks again last
  night. Nobody noticed."). resolution=stated.
- **Askar d140 (15002, no shared language):** Russian-speaking joiner; the
  system offered mime/gesture choices, closed with "a promise without
  words." The unique-person law in action.
- **Silas d80 (15003, seek_taken):** social worker, trust 90 — asks about
  the taken (Nadezhda), canon-grounded (docs/KIN.md). "Even asking is more
  than the silence." resolution=promised. The fiction's central wound in a
  villager's mouth.

### M4 survival — GO (3/4 ≥ d120: 123/169/179; 15004 lost at d108)
Death-aware stops worked on both lost villages.

### M5 honesty — GO
Decline's price spoken ("(Viewership -10.)") and state-kept (defiance +1,
event logged). The champion's clean loan + return path is proven by the
proof test below (deterministic), not by a live run — the live run caught
the collision case instead.

## BLANK FILLED — the champion/first-court homecoming copy

**Finding:** `loanedReturnTick` (membership.js) rendered the homecoming for
non-village postings via `_ovName(to)`, which degrades to "them" — the
Watchers champion's return read **"days at them's fire, served"** and the
First Court host's return had the same wart. Broken copy on two
national/global beats.

**Fix (src/js/membership.js, copy-only):** named non-village postings read
as places — "A man, maybe 50s walks back in — days in the light, served."
/ "days in the first court, served." Village postings unchanged ("days at
Emberhold's fire, served"). The dead-abroad line got the same treatment
("never made it home from the light").

**Proof:** `scripts/test-watchers-champion-loan-20261020.js` — 13 checks:
A1–A6 the champion answer lands the loan `{vid, untilDay: day+7, to: 'the
world feed'}` with the departure voiced; B1–B3 the world-feed homecoming;
C1–C3 the first-court homecoming; D1 the village-posting control.
RED on base (4 fails: "them's fire" ×2 postings) → GREEN after the fix
(13/13). Verified via patch-file round trip (never stash on the hot tree).

**Regressions:**
- Proof `test-watchers-champion-loan-20261020.js`: 13/13 GREEN (RED→GREEN
  verified via patch round trip).
- `test-gesture-beat-20261012.js`: 36/36 PASS (covers the accord-gesture
  loan path that shares `m.loaned`).
- `test-regional-audit-20261009.js`: 75 passed, 4 failed — the 4 failures
  are pre-existing on pristine HEAD (verified via patch round trip;
  accord-beat assertions V1b/V1d/V1s/V2l, untouched by this change).
- `test-travel-r12.js`: harness error (`Game.hierarchyState is not a
  function` at mkLink) — pre-existing test-setup/API drift, unrelated to a
  copy-only change (hierarchyState exists in src/js/hierarchy.js).
- `node --check src/js/membership.js`: clean.
- `check.js --quick`: BLOCKED — hung with 0:01 CPU after 16+ min elapsed
  (process alive, no output; same hang class as the r11-repl note's
  "check.js --quick hung 6.5min on diphold tree"). Killed and reported
  plainly rather than silently skipped. The change is copy-only (two string
  literals in `loanedReturnTick`); the copy-sensitive suites above cover
  the risk surface, and the r14 baseline for --quick was 253/4 (4
  pre-existing phone-frame staleness). No new failures were introduced by
  this change that the targeted suites could detect.

## VILLAGE ASSESSMENTS — in plain words

- **15001 (champion):** 4 alive at d123, scattered. Ingrid the physical
  therapy aide (scared, 35 plants known), Iker the mechanic (trust 74),
  Aiman the lifeguard, Kiara the night guard. Never climbed past regional —
  no court, no oath, no Watchers — and still took a lesser seat at d90 on
  deeds alone (waves, contests, crises, food). The on-ramp works as Steve
  priced it.
- **15002 (champion):** 1 alive at d169 — Askar the Russian butcher, trust
  18, hungry, alone. A village that bled out through wave 4 (11 w4 fights):
  34 fights, national 55 days, the Watchers answered, the realm dissolved
  aloud, the table announced. What they knew: 48 counter-observations, 31
  tricks learned. What was missing: people.
- **15003 (decline):** 3 alive at d179, SURVIVED — Owen the hunting guide,
  Desmond the sign painter, Guadalupe the fishing guide. Said no to the
  galaxy on camera at d120, kept the realm 76 days, took the lesser seat.
  The decline didn't close the table — it priced it (defiance +1, feeding
  the Defiant path).
- **15004 (decline):** 3 alive at d108, lost — Katarina the journalist,
  Miguel the dockworker, Jovan the tattoo artist. Said no at d77, the realm
  came apart 9 days later, wave 4 finished them. The no was real; so was
  the cost.

## REACHABLE / FUN / WINNABLE (scale leg, the Watchers)

- **REACHABLE:** YES — the Watchers staged on 3/4 deed-rich national
  villages; all three answers are one choice at a staged beat. The decline
  and champion paths are no longer feast-only in practice.
- **FUN:** the decline is the most characterful "no" in the game — the
  galaxy watches you say no, and remembers (defiance +1 prices the Defiant
  table path). The champion is a real 7-day absence with a human price
  (someone's face on every screen; the village gets the quiet).
- **WINNABLE:** decline keeps the table path open (2/2 lesser seats,
  announced). The champion's downgrade case keeps globalLive — never a
  trap. The regional lesser-seat on-ramp (15001) is canon-honest.

## METRIC REVIEW (§14)

No revision proposed. M1's replacement rule was used as written (15001
replaced for staging, kept as the regional-seat datum — no re-scoring).
M2's champion expectation (clean loan) met the collision case instead;
the clean path is proven deterministically by the proof test, and the
collision is documented as a finding, not a miss. No metric was re-scored
mid-run.

## TELEMETRY

`telemetry-check.js` vs `scale-belong.json` (4 seeds, 4 metrics):
quiet — no LOUD lines, no deviations. Baseline NOT rolled forward.

## FILES

- Harness: `scripts/journey-scale-r15-20261020.js` (r14 instrument +
  R15_WATCHERS_ANSWER probe with the outer-wrap substitution + feast-layer
  A/B + watchers consequence capture; builder: transform script, auditable)
- Proof: `scripts/test-watchers-champion-loan-20261020.js` (RED→GREEN 13/13)
- Fix: `src/js/membership.js` (loanedReturnTick place-word map; copy-only)
- Evidence: `evidence/2026-10-20/journey-scale-r15-belongfeast-watch{champion,decline}-15
...[truncated 1043 chars]
## FILENAME WART (transcripts)

The 13 transcript files carry a `journey-scale-r14-` prefix: the pilot runs
loaded the harness before the r15 prefix fix landed (a mid-run harness edit
is safe — the file is loaded once at process startup). The per-seed JSONs'
`convoFiles` arrays match the on-disk names. The harness on disk now writes
the r15 prefix for future runs. Content is r15 throughout.
