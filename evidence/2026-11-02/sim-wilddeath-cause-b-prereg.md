# sim-wilddeath-cause-b — PREREG (Loop B, food-economy, next blank 3)

Diagnosis arm, NOT a stepwalk re-confirm. The stepwalk confirm
(evidence/2026-11-02/sim-stepwalk-confirm-b.md, branch sim-stepwalk-b)
and the 0741Z coordinator record left one open question: a rescued
scholar dies "the wild" at home while FED — seed 61901 day 10
(1099 kcal day 9, home tile (4,4) days 7–9, successor home day 10),
and seed 61407 day 26 (home (4,4) days 20–25, 2050 kcal day 25,
successor home day 26). "Prevented" there meant the staying-type
stranding was prevented and life extended, not lived forever. This
arm builds a cause instrument for fed-at-home "wild" deaths and
applies it. It changes NO guard policy, NO trip/return walk, and
touches zero src/js (instrument/policy-side only).

Committed BEFORE any judged or diagnostic sim in this arm.

## Canon note (read first, per brief)

docs/CANON.md read. NO canon doc covers death-cause recording: the
manifest registers DISEASES.md (disease roster/vectors/cures),
MONSTER-WAVES.md (wave law), PARTY.md (villager treatment) and
others, but none specifies what a death-cause string must mean or
which string a fed-at-home death must carry. That gap is stated
here, not filled by invention. Disease candidates are judged only
against docs/DISEASES.md's roster if a disease is implicated; a
wild-fight candidate is judged against MONSTER-WAVES.md's wave law
only for which monster could be present, not for the cause string.

## Primary question

For a player death whose harness tele record reads cause "the
wild" while the scholar is AT HOME and FED at the last pre-death
day-end: what did the engine actually do? Distinguish the RECORDED
cause (the string in the tele / fallen / corpse records) from the
PROXIMATE cause (the mechanism that ended the life), and say which
one this instrument reports. Candidate mechanisms, from a code
census done before this prereg (all in this worktree's tree):

1. WILD-FIGHT LOSS (tbEnd): src/js/game.js tbFightDeathCause
   returns 'the wild' for a proven wild fight (>=1 monster fighter,
   no hostile fighter, no arena/betrayal/table/coalition flag), and
   tbEnd calls playerDeath with it. This is the ONLY live call site
   found that passes the exact string 'the wild' as a playerDeath
   argument. A fight staged at home (monster reaching Haven, or the
   scholar joining a fight from home) would read "the wild" while
   the body is at home.
2. FALLBACK LABEL (ledger): src/js/ledger.js playerDeath records
   `cause || 'the wild'` into registerDeath / fallen / lineage /
   the death line. A playerDeath call with a falsy cause would
   record 'the wild' regardless of place or mechanism. Census of
   live playerDeath call sites found NO site passing a falsy cause
   (resolveDay passes killedBy||'starvation'; hurtVillager passes
   cause||'injuries'; encounters passes cause||'the hunt'; all
   others pass named strings; tbEnd passes tbFightDeathCause).
   Candidate 2 is therefore expected to be RULED OUT by stack
   evidence, not assumed.
3. DISEASE / WOUND / SICKNESS LAG: hurtVillager lethal path passes
   its cause (sickness name, 'wounds', etc.), never 'the wild' —
   so a disease/wound death mislabeled 'the wild' would require a
   second registration winning the double-death guard (corpses.js)
   or a tele-repair artifact. Ruled in/out by the registerDeath
   wrapper + sick/wound state at death.
4. STALE CAUSE / SUCCESSION ARTIFACT: the tele record's player flag
   is repaired in place after the fire (sim-harness TELEFLAG note);
   day/kind/who/cause never change after the fire. A 'the wild'
   record attached to the wrong bearer <redacted> successor would show as a
   who/day mismatch against the day-end scholarKey series. Ruled
   in/out by joining deaths to dayEnds on scholarKey.
5. STARVATION/DEHYDRATION LAG: resolveDay honestCause is
   killedBy||'starvation' — never 'the wild'. A fed scholar cannot
   be a same-day starvation death; a lagged overnight death would
   still carry its honest cause. Ruled in/out by kcal series +
   honestCause path in the stack.

## The instrument (scripts/sweep-wilddeath-b.js, new this arm)

Driver-side wrappers installed after setupGame, before runDays;
pure observation — every wrapper delegates to the original and
only records:

- Game.playerDeath wrapper: the RAW argument (before ledger's
  `|| 'the wild'` fallback), a stack trace (caller identification),
  and a death-moment snapshot: day, dying scholar key/id, tile
  (map.px,py) + tile type, departed, insideHaven / playerAtHaven,
  kcal + kcalCap, health, sick record for the scholar, tbfight
  fighter summary (kind, monster/villager id, alive, hp) and
  origin flags (arenaContest, betrayal, tableTrial,
  coalitionArena), and the last 30 Game.say lines.
- Game.registerDeath wrapper: opts as passed (cause, killerId,
  witnesses, mx,my) so the tele cause can be joined to the
  registration that produced it, including double-death-guard
  no-ops (a second registration returning null is recorded, not
  hidden).
- Game.hurtVillager wrapper: last 20 hits on the scholar
  (damage, cause, damageContext) — the proximate-damage trail.
- Per-day-end snapshots (tile, away, kcal, scholarKey, pantry)
  in the stepwalk-driver shape, so each death joins to the
  scholar's place and food state.

Classification, fixed here (judged against this, not revised
mid-run):

- WILD-FIGHT: playerDeath arg === 'the wild' AND stack passes
  through tbEnd AND tbfight shows >=1 monster fighter, no hostile
  fighter. Proximate = lost wild fight. Whether the narration
  LIES is judged separately: if the death tile is Haven, the
  "wild" label is true about the fight's origin but false about
  where the person died — reported as location-misleading.
- FALLBACK: playerDeath arg falsy (undefined/null/'') AND tele
  cause 'the wild'. Proximate = the stack caller + state.
- OTHER-NAMED: arg is some other string but tele reads 'the
  wild' (registration/tele mismatch) — reported as a recording
  bug with both strings.
- UNRESOLVED: no playerDeath wrapper fire for a tele player
  death (e.g. a villager-path registration winning the guard) —
  reported with the registerDeath wrapper record, not guessed.

Fed-at-home test, fixed here: the LAST pre-death day-end for the
dying scholarKey shows tile (4,4) [haven] AND kcal >= 1000.
(61901: 1099 qualifies; 61407: 2050 qualifies. The 1000-kcal line
is this arm's stated definition of "fed" for classification, not a
canon threshold.)

## DIAG-GO vs DIAG-NO-GO (binding)

- DIAG-GO: the instrument attributes >=1 fed-at-home 'the wild'
  player death — on a named diagnostic seed or on the judged band
  — to exactly one candidate mechanism above, with trace evidence
  (raw playerDeath arg + stack caller + death-moment snapshot +
  day-end join) that a second reader can re-derive from the
  committed corpus. The verdict names recorded vs proximate cause
  and whether the death narration lies about where/why.
- DIAG-NO-GO: the instrument runs clean on both named seeds (or
  they fail to reproduce — see below) AND on the judged band, and
  no fed-at-home 'the wild' death is attributable to any candidate:
  each candidate is ruled out with the evidence that rules it out,
  and the report states what remains unknown. A NO-GO here is a
  diagnosis result, not a failed run — it is still reported with
  the ruled-out list.
- NOT a GO: a cause asserted from the tele string alone, from a
  day-end series alone, or from a single seed's story without the
  wrapper trace. The tele string 'the wild' is the QUESTION, never
  the answer.

## Seeds, policies, substrate

- DIAGNOSTICS (unjudged, disclosed): 61901 and 61407, armed leg
  only (competent-stepwalk-b), 30d, DEPOSITGATE=0, same gate
  assertions as the stepwalk confirm (COMPETENT_STANDING_HOME,
  COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND unset).
  The stepwalk policy is NOT landed by this arm and is NOT
  committed into this branch: it is loaded for diagnostic runs
  only from a /tmp extract of the held sim-stepwalk-b branch blobs
  (competent-stepwalk-b + competent-stayhome-b, with symlinks to
  this tree's scripts/policies/ for their shared imports), so this
  branch stays free of another worker's code. If either case does
  NOT reproduce on this tree's base (the 2026-11-02 base-drift
  finding: the RNG stream shifted under sibling landings), that is
  reported as non-reproduction with the new outcome quoted — the
  old corpora are NOT quoted as current-master evidence.
- JUDGED BAND: fresh seeds 62201–62208 (8 seeds, minimum band),
  BASELINE policy competent only (the instrument is substrate
  independent; the judged question is whether the instrument
  classifies wild deaths in the wild, not whether stepwalk still
  rescues). 30d, DEPOSITGATE=0, same gate assertions. No banned /
  reused band is touched: 61401–61408, 61501–61508, 61601–61508,
  61701–61708, 61801–61808, 61901–61916, 61308, 60307.
- No stepwalk re-confirm is run or claimed by this arm (separate
  future prereg, explicitly out of scope).

## Horizon + why

30d observation cap, matching the stepwalk window that produced
both named deaths (days 10 and 26). Death-aware: the harness
stops a run at an engine ending; dead villages are not simulated
to day 30. Waves 4–5, national, table, and wins are NOT expected
in-window at 30d; they are reported as wall numbers, never as
rate claims. A 30d pre-seat window showing 0s is the expected
measurement profile, not a regression.

## Staged method (docs/MEASUREMENT.md §§9–12, 14–15)

Pilot gate does not apply as a lever gate (no lever is tuned);
the staged rule applied here is: prereg FIRST (this file), then
diagnostics, then the 8-seed judged band. Pre-registered
classification binds the verdict (§14): a miss is NO-GO, never
re-scored against a friendlier reading mid-run. Before/after
comparison runs through the balanced panel (scripts/balance-panel.js)
per §15 as CONTEXT only for the judged band (single-policy
competent campaign): the panel is the instrument, this prereg's
classification is the judge; if the panel refuses, that refusal
is reported honestly and the driver tables stand — no compare is
fabricated. No game-code change is made, so no before/after lever
comparison is claimed.

## Sense test (SENSE-TESTING LAW)

For every classified fed-at-home wild death, read the death line
("X is dead — the wild..."), the last 30 say-lines, and the
death-day transcript around the death: does it read as something
that happened to a person at home, or does the narration lie
about where or why they died? Flag any lying narration verbatim.

## Wall numbers (reported for the judged band)

national / table / wins, wave unlocks 1–5, median survival, plus
the player-death cause census for the band (all causes, not only
wild) so the wild share is honest.

## Metric review

Filled in the results file, never used to re-score this run.
