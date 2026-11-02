# sim-locatedengage-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0815Z, arm sim-locatedengage-a, axis scale-onramp.
Worktree branch: sim-locatedengage-a, based at current master 3f0f7dd07.
POLICY/INSTRUMENT SIDE ONLY — zero `src/js` changes, nothing sounded,
deferred, stood down, or mutated. This is a DIAGNOSIS arm: if a fix
suggests itself, it is documented, not landed here. No [needs-eyes]
(policy measurement only, nothing player-facing ships). Sibling Loop B
trees/branches NOT touched (sim-latescape-b, sim-stepwalk-b,
food-economy lane). No hidden_files (tracker/claims/findings —
coordinator-owned).

## Canon read

docs/CANON.md first. There is NO titan-specific canon doc in docs/ —
stated here instead of inventing one (same finding as 0445Z, 0605Z,
0725Z). The in-code design source is `src/js/titans.js` plus
`src/data/titans.json` (herald def, minAllies 10) and
`src/data/monsters.json` (herald: size 3, wave 4, aggression
"heraldic"). The herald pipeline in code (titans.js, titanDawnTick /
titanAdvanceOmen / titanPlace) is:

1. OMEN GATE: unlockedWave >= 4 AND scaleRank in {regional, national,
   global} — then 10%/day to start omen stage 0.
2. STAGE 0 -> 1 (named): >= 4 days after omen start, 35%/day.
3. STAGE 1 -> 2 (located): >= 9 days after omen start, 40%/day —
   titanPlace puts the herald monster on a map tile and says the
   lair line ("Scouts found its lair ... It is WAITING. You cannot
   face it alone. Sound the call.").
4. ENGAGEMENT: a startCombat call on the herald. Two routes exist
   in code, and telling them apart is this arm's whole job:
   (a) DELIBERATE: the policy sounds the call
   (`Game.soundTitanCall('herald')`, mustering allies) and then
   marches/fights — no base-policy layer in the frozen stack calls
   it, so this route is structurally absent unless a policy acts;
   (b) WILD-CONTACT: the scholar and the herald share a map tile
   (`Game.playerMonster()` = the monster on `Game.map.px/py`), and
   the detail-grid `monsterTurn()` stance machine calls
   `Game.startCombat('herald')` — refused MUSTER-GATE without a
   muster (no-solo-titans rule), fought only with one.

CORRECTION to the 0725Z prereg's step-4 note: it said "titans never
wander". That is WRONG in code. `Game.wanderWorldMonsters()`
(game.js) loops over ALL world monsters with a 35% move chance per
`worldTick()` (which runs on tile entry via `checkEncounter`), and
carries an explicit HERALD STEER (2026-11-01): half of a herald
step is drawn from haven-ward directions (target = haven tile
`state.village.px/py`), same one-tile step, still blocked off
safe tiles and occupied tiles. The herald therefore DOES drift
between tiles — toward Haven, not toward the scholar — and a
wild-contact needs the scholar's tile and the herald's tile to
coincide at a moment when `monsterTurn()` runs. Whether that ever
happens on 97307, and by which side stepping, is what the trace
must show, not what this prereg assumes.

## Question (next blank #2 from the 0725Z round, evidence/2026-11-02/sim-heraldcontact-a.md)

Seed 97307, classified LOCATED_NO_ENGAGE: omen stage 2 day 129,
lair line naming tile 7,4 ("Scouts found its lair — tile 7,4. THE
HERALD — the sky, getting bigger. It is WAITING. You cannot face
it alone. Sound the call."), monster present days 129–152 through
the end, ZERO attempts, no pending encounter at end, wave4 day
116, regional day 57, end 152d over-other, nat 1, table 1, won 1.
Why does the policy never route to a located titan? Instrument
the mechanism: scholar pathing, encounter generation, policy
avoidance — with position/pending-encounter traces, not another
band.

## DISCLOSED REUSE (never band evidence)

Seeds 97307 and 97301 are a single-seed case study plus a contrast
seed, both taken from the 0725Z heraldcontact pilot band
(97301–97308). They are NOT a fresh band, their numbers are NEVER
presented as independent band evidence, and they are NEVER pooled
with the pilot. The pilot corpus
(evidence/2026-11-02/perseed-heraldcontact-a/pilot-s9730*.json) is
the cross-check for reproducibility (milestones and attempt days
must match), not a sample to add to.

## Instrument (extends the heraldcontact replay, intervention still none)

`scripts/locatedengage-replay-20261102.js` — adapts
`scripts/heraldcontact-replay-20261102.js` with the SAME frozen
policy stack, env flags, herald-v1 instrument, and DAYS=180
death-aware cap, plus a position/route trace. Behavior changes,
all pre-registered here:

1. WRAPPED DAILY, TWICE: the wrapped daily samples the trace row
   BEFORE the base policy's daily (pre) and again AFTER it returns
   (post). One trace row per loop-day per seed: day, scholar tile
   (`Game.map.px/py`) pre/post, haven tile (`state.village.px/py`),
   herald tile (`tx/ty` of the `id === 'herald'` world monster, or
   null) pre/post, herald detail coords (`mx/my`), scholar detail
   coords (`state.scholar.mx/my`), Manhattan tile distance
   scholar↔herald pre/post, same-tile flags pre/post, omen stage,
   herald presence, pendingEncounter / pendingMonsterId, and the
   day's travel events + attempt rows (joined by day).
2. TRAVELTO WRAP: every `Game.travelTo` call in the whole run is
   logged (day, from tile, to tile, return kind: moved / blocked /
   refused-null, and the top 3 stack function names, to attribute
   the call to a policy helper vs engine walk). This is the
   policy's route target, recorded directly — not inferred from
   positions. The wrap reads only; it consumes no RNG and mutates
   no game state, so the pilot milestones must reproduce.
3. LAIR TILE: parsed from the anchored say line "Scouts found its
   lair — tile X,Y" (same anchored capture as below), recorded
   once per seed; the herald's CURRENT tile is traced separately
   every day, because the lair tile and the wandering monster's
   tile diverge after placement.
4. SAY CAPTURE, ANCHORED ONLY (heraldcontact metric review): the
   Game.say wrapper captures ONLY lines matching "THE HERALD" /
   "Scouts found its lair" / "fed in the night" / "struck .* in
   the night" / "THE HERALD came" / "pads into the clearing".
   NEVER bare /omen/ (it matches "moment" in routine lines).
   Quoted lines are real lines only, judged for meaning
   (SENSE-TESTING LAW).
5. UNCHANGED: the herald-v1 instrument attempt rows (day, cls,
   reason, caller incl. the wild-contact stack classification),
   the startCombat readiness interceptor, and the wall fields.
   No sound, no deferral, no stand-down, no muster-diag.

`scripts/locatedengage-classify.js` (PURE, no game load, no I/O)
derives per-day mechanism labels from one seed's trace rows +
travel events + attempt rows (see Daily labels below), plus the
seed-level verdict. `scripts/test-locatedengage-a.js` (corpus
validator) reproduces the verdict from the corpus alone, with no
game load, and cross-checks the pilot milestones/attempt days.
`scripts/test-locatedengage-classify.js` (unit proof) runs the
classifier on stub traces covering every label and the decision
order. STDOUT-RUNNER PATTERN: the replay prints one JSON line per
seed and writes NOTHING itself; the splitter runs in a foreground
exec, never a backgrounded pipe.

## Policy stack (exact names, frozen from sumtrigger/arrears/heraldcontact)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) recorder. Env: FEASTSCALE_R13=1
TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
HERALD=1. Switching stacks mid-run would break comparability, so
the stack is frozen here.

## Seeds (case + contrast, disclosed reuse — see above)

- 97307: the case. Judged window days 129–152 (placement through
  end). Full-run trace recorded; the verdict table covers every
  day 129–152.
- 97301: the contrast. Judged window days 59–91 (placement day 59
  through end; its 4 wild-contact attempts fall days 78/89). The
  question for 97301 is HOW wild-contact happens there: for each
  attempt day, was it scholar-stepped (a travelTo landed the
  scholar on the herald's tile that day), herald-stepped (the
  herald's tile became the scholar's tile with no scholar travel
  onto it), or shared-idle escalation (tiles already shared at
  the pre-daily snapshot, monsterTurn escalating later)?

DAYS=180 death-aware cap (same rationale as heraldcontact).

## Daily labels (decision order — first match wins, per day)

Derived per day from that day's pre/post trace rows, that day's
travel events, and that day's attempt rows. A day is UNCLASSIFIED
only if its trace rows are missing — never as a bucket for
"didn't look". The mechanism question is answered by the label
sequence, not by any single day.

- ATTEMPT — >= 1 herald attempt row that day. Sub-label from the
  instrument caller + travel events: SCHOLAR-STEPPED (a travelTo
  that day landed the scholar on the herald's tile before the
  attempt), HERALD-STEPPED (the herald's tile became the scholar's
  tile with no such travelTo that day — wander onto the scholar),
  SHARED-IDLE (tiles already shared at the pre-daily snapshot),
  else ATTEMPT-UNRESOLVED (attempt with no traceable step — a
  named unknown, counts against bar (b) if it is an attempt day).
- SHARED_NO_ESCALATION — tiles shared at pre or post snapshot (or
  a travel step produced sharing) with zero attempts that day.
  The contact existed and the stance machine never called
  startCombat: record stance/detail coords if present.
- SCHOLAR_NEAR — min Manhattan distance that day <= 3 (inside the
  travelTargets offer radius) with tiles never shared: the lair
  region was reachable but never entered.
- APART — min Manhattan distance that day > 3, tiles never
  shared, zero attempts: the scholar's routine never brought it
  near the herald.
- UNCLASSIFIED — trace rows for the day missing entirely.

Seed-level verdict: the day-label sequence for the judged window,
plus (for 97307) the count of days the herald tile was ever within
reach (<= 3) and ever shared; (for 97301) the step classification
of each attempt day. The plain-words mechanism statement names
which of these dominates: (i) never shared, (ii) shared but never
escalated, (iii) shared only via one side's stepping, or (iv) a
named unknown that remains.

## PRIMARY METRIC

Per-day mechanism coverage of the judged windows + step
classification of every attempt day.

## GO (DIAG-GO — all must hold)

(a) COVERAGE-97307: every day 129–152 carries a named daily label,
    0 UNCLASSIFIED days in the window.
(b) CONTRAST-97301: every attempt day (days 78, 89 expected from
    the pilot; the trace's own attempt rows are authoritative)
    carries a resolved step sub-label (SCHOLAR-STEPPED /
    HERALD-STEPPED / SHARED-IDLE) — 0 ATTEMPT-UNRESOLVED days — and
    every day 59–91 carries a named daily label, 0 UNCLASSIFIED.
(c) REPRODUCIBILITY: the trace reproduces the pilot milestones
    for both seeds (97307: wave4 116, stage2 129, present
    129–152, attempts 0; 97301: wave4 48, stage2 59, present
    59–91, attempts on days 78/89) — the instrument reads did not
    shift the run. A mismatch is investigated, not averaged away.
(d) PROOF: unit proof (classifier on stubs, every label + order)
    AND corpus validator green; validator reproduces the verdict
    from the corpus alone.
(e) PURITY: zero `src/js` changes (git diff on src/ empty at
    report time); this arm sounds, defers, and mutates nothing.
(f) WALLS: wall numbers reported per seed (national/table/won,
    wave reach, survival, endReason) — case + contrast only,
    NEVER pooled, NEVER presented as band evidence.

A miss on any bar is NO-GO, never re-scored against a friendlier
metric mid-run (MEASUREMENT §14). Doubts go under "metric review".

## PILOT GATE / CONFIRM

There is no pilot/confirm split: the case + contrast ARE the run
(2 seeds, full traces). A follow-up arm (screen, intervention, or
deeper instrument) is a new prereg, not an extension of this one.

## KILL RULE

On NO-GO: the replay, classifier, and test scripts are DELETED in
the closing commit. Evidence, prereg, corpus, and analyzer output
stay committed. The report states "killed, nothing to merge". On
DIAG-GO: the scripts stay (they are the reusable located-titan
trace instrument), and the report states "ready for coordinator
merge".

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is
a trigger-moment trace with no intervention and no sweep-compare
policy run — same declaration class as heraldcontact / arrears-
route. Before/after is not applicable (no lever); wall metrics
are reported per seed, NEVER pooled. No panel fabricated.

## Wall metrics reported (per seed, never pooled)

National(end) / table reach / won, wave-4 / wave-5 reach, survival
(gameDays), endReason, herald attempt count.

## OUT OF SCOPE (task bounds)

No game-code change. No sound/defer/stand-down intervention, no
tribute/arrears rule change, no gate/stage/deed-bar/win-price
retunes, no new policy behavior. No sibling trees or branches
touched. No hidden_files (tracker/claims/findings —
coordinator-owned).

## Metric review

(To be filled at end of run. Doubts about the bars above go here
and apply to the NEXT run, never to this run's verdict.)
