# journey-scale r243 — PRE-REGISTER (lane A, leg 3 SCALE, single-arm natural band + dialogue fix)

**Run id:** `playtest-a-20261118T1745Z` (lock run_id `2026-11-18T23:45:00Z-lane-a-scale-r243`).
**Run:** scheduled Wed 2026-11-18 17:45 CST (23:45 UTC); lock created 23:44:45Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `046ae5859` at prereg time (ship ac1b82736-20261118-232437;
contains the r242 `tableSitting()` fix, landed + shipped).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 47%, no lock file (no stale-lock recovery). `git pull` already up to
date. Reap ran (exit 0, removed nothing; 11/16 active, 5 slots free).
Worktree registration took ~9.5 min (registry-lock contention — a sibling
`flock -x 200` holder; the register script's own pre-lock reap ran first).
Heartbeat landed at registration (23:56:04Z) and a 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r243.sh`) runs for the whole run.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs), zero `src/js` change at panel time
beyond the pre-registered echo fix (dialogue content, see Fix scope).
**TEST WITH ENCOUNTER GEAR (Steve 2026-11-13):** the policy fights with
the party and gear the competent player has by the leg — the muster/march
steps are that policy, not a fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01):** this run LANDS the owed raise-accept
echo fix (arm: the engine as fixed) IF the panel proves it, and measures
the scale wall on current master on a NATURAL band (no stage — r242 already
proved the tableSitting mechanism; the natural band is the honest census
for the deed gate + wave-5 door). A build with its before/after panel, not
a re-proof.
**Time-box (stated up front):** hard stop ~01:45Z (2h from the 23:43Z run
start). The panel is 8 fresh seeds × 140d, single arm; each sim ~2.5 min,
2 concurrent. The `--quick` gate is launched in the background right after
the build commit; the analyzer proof tests are the binding suite for a
driver-only change, and the gate result is reported if it lands before
closeout — if it does not, the run note says so and the merge waits for it
(no landing over an unfinished gate).

## Standing context (read before scoring)

- **r242 scale (landed 2026-11-18, master 519653e29 → shipped 046ae5859):**
  Q1 GO — the `tableSitting()` fix landed: arm A reproduced the mask
  (worst seed 45 present-held mercy rows), arm B held 0 table-holds on
  every seed and 90 mercy-window musters proceeded. The fix is IN this
  run's base, so the panel runs single-arm with `MUSTER_HOLD=sitting`
  (the behaviour that ships). National 1/8 (103848, TRADE 3/3, d95);
  tribute READY-UNPAYABLE (103843, 9 attempts, veterans-short); wave-5:
  **0 fights on all seeds, both arms** — the door question stays open.
  Q4 people check: the echo at full scale — **13/13 accepted/counter
  raise talks end with the NPC repeating the player's acceptance back
  nearly verbatim** (`YOU: "All right. Let's ask them."` →
  `THEM: "All right — let's ask them." You carry the proposal to X.`).
  r239 noted a single instance (Walt) as "short and functional, not a
  defect". At 13/13 it is the standing content item for a dialogue pass.
  **This run is that pass (Q1).**
- **r239 scale (landed 2026-11-18):** natural band 2/8 national, 1/8 full
  seat (103825, d125); wave-5 beasts fought 19×, 1 killed in the field
  (103827 spoiler, d126); the deed gate opens after national — sometimes,
  and late (103828 delivered its charter d114, no seat by d140).
- **Scale wall, current (2026-11-18):** national reachable (TRADE road),
  full seat reachable (1/8 on r239's band, 0/8 on r242's staged band —
  the staged delivery moved that census). The binding constraint is now
  the veterans bar on tribute delivery + the deed gate's timing after
  national. The wave-5 door was never faced.
- **Queue-jump note:** rotation read 3 although r242 wrote 3→0 at
  closeout — the scale leg keeps being jumped to because the tableActive
  work just landed and its questions (echo, deed-gate timing, wave-5
  door) live on this leg. This run plays scale under the body's
  queue-jump rule and writes 3→0 at closeout on success.
- **Loop B live alongside (NOT touched):** lane B social r237 timed out;
  its adoption owns the closeout (gate → commit → merge → rotation-b
  5→6 → lock delete). Neither touches the bond-initiation code or the
  103851 band.
- **Write flap (host, ongoing, never solved):** the flap-watch probe +
  watchdog report windows; this run does not re-report flap windows the
  watchdog already caught, but records any it hits first-hand.

## Seed-band freshness

- **Band: FRESH 103851–103858.**
- Searched before the run: all `evidence/*/journey-*-prereg.md` +
  `evidence/*/sim-*-prereg.md` — **0 hits** for any of 103851–103858.
  Searched goal `hidden_files/evidence/` (.md) — **0 hits**. Searched
  all of repo `evidence/` — the only hits are JSON data values (same
  class as r239's recorded caveat): `crumbdefault-armed-belongseek`
  census, `belongfeast`/`leadfeast` sweep JSONs, `pantrystarve-b`
  corpora, `solo-campaign-prepared-death-pilot-r1.jsonl`. No prereg,
  forbidden list, contaminated list, screen, or extension band names
  any of 103851–103858.
- **Collision record (so the next worker does not repeat it):** 103801–
  103808 and 103811–103818 reserved (r242 prereg); 103821–103828 and
  103831–103838 spent (r239); 103841–103848 spent (r242). Do not reuse.

## Pre-registered questions

- **Q1 — THE BLANK: RAISE-ACCEPT ECHO FIX (decides the fix's verdict).**
  The defect: in `bondTurn` (`src/js/bond-initiation.js`, `link:accept`),
  the NPC's line opens by repeating the player's choice label verbatim —
  `"All right — let's ask them."` — then narrates the carry. The NPC
  adds nothing of their own at the moment the proposal is carried.
  Before-measurement (same instrument, r242 corpora): **13/13 accepted/
  counter raise talks echo on arm B, 13/13 on arm A** (verified by grep
  over `journey-scale-r242-{a,b}-raisetalk-*.txt` before this run).
  - **Fix:** `acceptLinkRaise` returns a voiced line — the NPC's own
    words, keyed to how they know the village (the lore `how` already
    used by `linkRaiseLine`: visit / seen-nearby / rumor / told /
    default), naming the village — and `bondTurn` uses it, following
    the `acceptBondProposal` precedent (`'"Stick together, then." They
    look steadier already.'`). The carry ("You carry the proposal to
    X.") stays as the narration tail, not quoted speech — per
    docs/CONVERSATIONS.md ("Both voice backends receive complete quoted
    speech only; narration remains visible and silent"). A small pool
    per `how` (2 lines each) is picked first-unledgered via the
    `convoRunLedger` (`declineLine` precedent), so the same villager
    does not repeat one accept line across villages.
  - **GO iff (a)** the unit proof test is GREEN — staged link raise,
    accept, the NPC line's quoted speech does NOT normalize-equal the
    player's choice text, names the village, and the proposal is still
    carried (`proposeLink` called, lore told); **AND (b)** the panel
    ECHO count is **0 echo lines across all accepted/counter raise talks
    on the 8-seed band** (analyzer ECHO section — the detector compares
    the normalized quoted speech of the THEM line following a link:accept
    YOU line against that YOU line's normalized text); **AND (c)** the
    spoken-raise guard (Q3) still passes — the accept path works
    end-to-end (proposals carried, links form; ≥1 accepted raise talk
    in the band, else the panel is INCOMPLETE on Q1 — a 0-talk band
    proves nothing; r242's band had 19 talks, 13 accepted/counter).
  - **What the fix does NOT prove:** that every raise talk in the game
    is voiced — only the link-accept reply. The bond-accept line is
    already voiced; the link-decline line is already voiced.
- **Q2 — NATIONAL / DEED GATE (primary, measurement, NOT a gate):** on
  the natural band, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? Interesting iff ≥1 reaches
  national with its road named (LEAD/BELONG/COVENANT/TRADE/CONQUEST),
  OR 0/8 with a diagnosable per-seed blocker (natgate blocker lines).
  The census carries the deed-gate half: capstoneReady /
  capstoneDelivered / seatFullDay per seed. **The deed-gate timing
  question:** r239's 103825 (tribute d123 → seat d125) vs r239's 103828
  (charter d114, no seat by d140) vs r242's 103848 (charter d96, no seat
  by d140 — staged). On this natural band, for every national village
  that delivers a capstone and gets no seat by d140, name the
  discriminator (what the gate is still waiting on). No GO/NO-GO rides
  on the game — the verdict is the census + named blockers.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, lived-days
  per-seed mean within ±25% of the control **123** (r233's 8-seed mean),
  lesser seat priced ≥4/8. Single arm.
- **Q4 — PEOPLE CHECK:** read 1–2 full transcripts (d90/d120) in full,
  PLUS the nonverbal sittings AND all raise talks (the only arm — the
  arm that ships).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states (M23 shape), survival. The analyzer's "wave-4 kills"
  line stays relabeled "wave-4 fights" with a band kill total from
  kAttr. The wave-5 door question: did any village FACE the door
  (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r239 Q6 "tell me more" echo
  shape — a "tell me more" / "Go on" that echoes rather than deepens —
  watched for in the r243 transcripts and recorded; a dialogue-content
  fix belongs to this run's Q1 only if it is the same link-accept line.

## Policy (frozen)

`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON (r242
policy verbatim) + `MUSTER_HOLD=sitting` (the landed fix's behaviour) +
`STAGE_CAPSTONE=off` (natural history — the stage was r242's instrument
for the tableSitting proof and is retired now that the fix has landed).
Sortie INERT (r219/r223 decision stands). SIT false (the table offer is
STANDING — Steve 2026-11-06 — so a competent player chasing the FULL seat
lets the lesser seat wait; Q3 re-scopes to lesser-seat PRICED, not taken).
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 103851–103858.
Single arm: `ARM=B MUSTER_HOLD=sitting STAGE_CAPSTONE=off`.

## Fix scope (pre-registered — the build is not scope creep)

- `src/js/bond-initiation.js`: new `linkAcceptLine(vid, villageId,
  villageName)` — voiced accept lines keyed to the lore `how`
  (visit / seen-nearby / rumor / told / default), 2 lines per `how`,
  first-unledgered pick via `convoRunLedger` (the `declineLine`
  precedent). `acceptLinkRaise` returns the line (`line` field — new,
  additive; existing callers read `.ok` / `.villageId` only).
  `bondTurn` `link:accept` uses `a.line` with a voiced fallback (never
  the parrot). No other behaviour changes: the lore tell, the
  `proposeLink` call, telemetry, cooldowns, and the player's choice
  label (`"All right. Let's ask them."`) are byte-identical.
  Canon: docs/CONVERSATIONS.md — "Replies belong to the spoken
  exchange" + "Both voice backends receive complete quoted speech only;
  narration remains visible and silent." The fix is dialogue content
  in code (the parrot line lives in code next to `linkRaiseLine` and
  the bond lines) — the data-over-code preference is noted, and the
  existing code pattern is followed instead of moving one line to JSON.
- Driver (`scripts/journey-scale-r243-20261118.js`, cloned from r242):
  seeds 103851–103858, corpus tags r243, `STAGE_CAPSTONE=off` default
  (the stage code stays but never arms — the analyzer drops the STAGE
  section; the stage JSON is still written with a null state), single
  arm B. The muster/march holds stay on the live-sitting predicate
  (`MUSTER_HOLD=sitting` — the landed fix).
- Analyzer (`scripts/analyze-journey-scale-r243-20261118.js`): cloned
  from r242; STAGE section removed; Q6 tableActive section replaced by
  the Q1 ECHO section (single arm); Q1 national/deed gate → Q2;
  guards → Q3; census/W5/spotter/mime carried. Proof test
  `scripts/test-journey-scale-r243-analyzer-20261118.js`: cloned from
  r242's 148 cases, stage + two-arm cases removed, echo-detector cases
  added (echo transcript → ECHO 1; voiced transcript → ECHO 0;
  counter-outcome talk counted; decline talk not counted).
- Proof test `scripts/test-link-accept-voice-20261118.js`: staged link
  raise per `how` (visit / seen-nearby / rumor / told / default) +
  the no-pending fallback + the bondTurn routing (the accept path
  returns the voiced line through `bondTurn`, not just the verb).
  Verified RED on the pre-fix tree (the NPC line normalizes equal to
  the player's choice) before the panel, GREEN with the fix.
- **Landing rule (pre-registered):** the fix lands ONLY on a Q1 GO.
  On INCOMPLETE or NO-GO it is rebased out of the branch (r239
  precedent) and the proof test preserved RED in the goal evidence dir.

## Metric review (carried)

- Q1's echo bar (0 echoes) is a saturation bar: the defect fired 13/13
  on r242's band, so a single echo on r243's band fails the fix's
  verdict — the bar is 0, not a rate.
- The lived-days control stays **123** (r233's 8-seed mean). r242's band
  mean was 122.6/122.8 (inside the guardrail).
- Q2 is deliberately gate-free: 1/8 national with named blockers is the
  finding, and the deed-gate timing discriminator is the question.
- The Q1(a) refusal watch stays measurement-only.
