# Loop A 0815Z round — scale-onramp: located-titan engagement trace DIAG-GO

Run: fleshout-loop-a-20261102T0815Z, arm sim-locatedengage-a, axis scale-onramp.
Worktree branch: sim-locatedengage-a, based at current master 3f0f7dd07.
POLICY/INSTRUMENT SIDE ONLY — zero `src/js` changes (git diff on src/
empty at report time). This arm sounded nothing, deferred nothing,
and mutated nothing: it is a pure diagnosis of the 0725Z finding
(seed 97307, LOCATED_NO_ENGAGE). Prereg committed BEFORE any judged
sim (commit 9cf8baf3b, below). Sibling Loop B trees/branches NOT
touched. No titan canon doc exists in docs/ — stated, none invented
(same finding as 0445Z, 0605Z, 0725Z); the in-code source is
`src/js/titans.js` + `src/data/titans.json` + `src/js/havenGrowth.js`.

## Verdict: DIAG-GO (all bars pass)

- (a) COVERAGE-97307: every day 129–152 carries a named daily label,
  0 UNCLASSIFIED days (validator: 24/24).
- (b) CONTRAST-97301: every day 59–91 carries a named daily label,
  0 UNCLASSIFIED; both attempt days (78, 89) carry a resolved step
  sub-label (SHARED-IDLE), 0 ATTEMPT-UNRESOLVED.
- (c) REPRODUCIBILITY: the trace reproduces the 0725Z pilot
  milestones exactly for both seeds (97307: wave4 116, stage2 129,
  present 129–152, attempts 0, lair 7,4; 97301: wave4 48, stage2 59,
  present 59–91, attempts days 78/89, lair 8,4). The instrument
  reads did not shift the runs.
- (d) PROOF: classifier unit proof 13/13 green
  (`scripts/test-locatedengage-classify.js`); corpus validator
  22/22 green, exit 0, reproducing the verdict from the corpus
  alone (`scripts/test-locatedengage-a.js`).
- (e) PURITY: zero `src/js` changes.
- (f) WALLS: per-seed wall numbers below — case + contrast only,
  NEVER pooled, NEVER presented as band evidence.

## The answer, in plain words

The policy never routes to a located titan because there is no
routing to do: no layer of the frozen policy stack ever aims at a
titan, a lair, or a monster tile at all. Its daily trips go to
forage ground, rubble, and stone — on 97307, only the four tiles
around home, out and back within the day. The herald, meanwhile,
wanders a tight orbit one to three tiles east of home and can
never step onto home itself, because home is a safe tile and the
wandering code refuses safe tiles. So for 24 days the scholar sat
at home, the herald circled one tile away (14 of those days at
exactly distance 1), and the two never shared a tile — and sharing
a tile is the only way the base policy can ever touch a titan.
Nothing avoided anything. There is no deliberate march to build
on, and no avoidance to remove: engagement, for this policy, is
something that happens TO the village, never something it does.

The contrast seed proves the shape of that accident. On 97301 the
herald did not get engaged by marching either. It got engaged
because the RAID system dragged it onto the home tile: a raid
night drafted it as a raider and pinned it to home, nobody met it,
so it stayed as a lingering besieger that the dawn re-pins to
home every morning. Once it slept on the home tile, the scholar's
ordinary trips carried it along step for step, and after four
mornings of sharing, the fight engine's patience ran out and it
called combat — refused, because no muster existed. The village
never went to the herald. The herald was delivered to the village
by a raid, and then the village still could not fight it without
a sounded call nobody sounds.

## The engagement mechanism, precisely (two layers, both required)

TITAN CONTACT needs two things at once, and the trace shows both
layers failing independently on 97307:

1. TILE SHARING — the scholar (`Game.map.px/py`) and the herald
   (`tx/ty`) must be on the same map tile. Only then does
   `Game.playerMonster()` return the herald and `monsterTurn()`
   run for it. Tile sharing happens exactly four ways in code,
   and the probes + trace separate them:
   - WANDER (`wanderWorldMonsters`, on tile entry): 35% per tick,
     one orthogonal step, herald-steered toward home — but it
     NEVER steps onto a safe tile, so it can never step onto home
     (4,4). It can step onto the scholar's tile elsewhere, which
     announces itself ("Something pads into the clearing").
   - FOLLOW (`travelTo` arrival, game.js:12651): when the scholar
     leaves a tile, a monster with a truthy `mdef.follows` follows
     through the boundary — unless the destination is occupied
     (holds) or safe (stops at the treeline). NOTE THE WRINKLE:
     the herald's data says `follows: "it does not follow. It
     precedes."` — a non-empty string, which the code reads as
     truthy, so the herald DOES follow. Prose and code disagree;
     this arm documents it and does not resolve it (Steve-call
     whether the string was meant as a refusal).
   - RAID PIN (`havenRaidTick`, havenGrowth.js:543): on a raid
     night, the nearest 3–5 monsters are drafted, marked
     `raidBorn`, and pinned to the home tile outright — the raid
     path ignores the safe-tile fence entirely.
   - LINGERING RE-PIN (`havenGrowthDaily`, havenGrowth.js:216):
     every endDay, any monster with `m.lingering` is re-pinned to
     the home tile ("besieging, not wandering"). A raider nobody
     met becomes lingering (lingerSince stamped once, ~6-night
     drift clock, cleared by sortie/mFlee or by the drift valve).
2. DETAIL-GRID ESCALATION — sharing a tile is not a fight. The
   detail-grid stance machine (`monsterTurn`) must close the
   detail distance (`mx/my` vs the scholar's `mx/my`) and
   escalate (none → curious, watchTurns ≥ 3 → hungry, step
   toward until the detail cells coincide → `startCombat`).
   On 97301 the shared mornings 74–77 produced NO attempt:
   stance was still none/curious and the detail cells were far
   apart (day 74 pre: scholar (8,0), herald (4,8)). Attempts fired
   only when the detail cells coincided at the morning snapshot:
   day 78 pre scholar (0,0) = herald (0,0), and day 89 pre
   scholar (8,0) = herald (8,0). Both attempts were then refused
   MUSTER-GATE (no muster — the call was never sounded).

PENDING ENCOUNTERS play no role: `pendingEncounter` was false at
every trace row of both runs (0 rows true), and at both ends.
Titan contact does not go through the pending-encounter panel.

## Case: 97307 — 24 days, one tile away, never touching

Lair 7,4 (day 129). Wave4 day 116, regional day 57. End 152d
over-other, nat 1, table 1, won 1, maxWave 4.

- Scholar tiles at every daily boundary: (4,4) only — home, every
  morning and every evening. WITHIN days the scholar did travel
  (67 travel events in the window: 60 moved, 6 blocked, 1
  refused), but only to (4,4)×23, (4,3)×21, (4,5)×12, (3,4)×4 —
  forage trips out and home again before the daily ends. ZERO
  travelTo events in the window targeted the herald's tile.
- Herald tiles in the window: (7,4) → orbit {(5,3), (5,4), (5,5),
  (6,3), (6,4), (6,5)} — a 2×3 block east of home, never (4,4).
- Daily labels (validator table): SCHOLAR_NEAR 24/24. Min
  distance: 1 on 14 days (132, 133, 134, 136, 137, 138, 141, 142,
  143, 145, 146, 147, 148, 149), 2 on 8 days, 3 on days 129 and 152.
  Shared days: 0. Attempt days: 0.
- Why never shared, layer by layer: (i) the scholar's trips never
  stepped onto the herald's tile (0 targeting events — the trips
  are forage/rubble/stone targets, never monster tiles); (ii) the
  herald's wander could not step onto home (safe-tile block) and
  its haven-ward steer parks it adjacent instead; (iii) the raid
  bridge never fired — a lingering monster is re-pinned to home
  EVERY endDay by code, and this herald was at (5,4)/(6,4)/etc. at
  every morning snapshot, so it was never lingering and never
  raid-drafted in the window (if it had been, it would have woken
  on (4,4)); (iv) the scholar always slept at home, so no
  follow-chain could start (follow needs a shared tile first).
- The cost of waiting, narrated honestly: five escalation strikes
  /feeds across the window (days 129, 134, 139, 144, 149), and the
  run's epitaph (day 152, see Sense below).

## Contrast: 97301 — how wild-contact actually happens

Lair 8,4 (day 59). Wave4 day 48, regional day 47. End 91d
over-other, nat 1, table 1, won 1, maxWave 4.

- Days 59–62 APART (herald at (8,4), scholar home). Days 63–73
  SCHOLAR_NEAR: the herald steers homeward (8,4)→(7,5)→(6,5)→
  (6,4)→(5,4), scholar still home, distance closing 4→1.
- Day 73 (incidental, not deliberate): the scholar's forage trip
  steps onto (5,4) WHILE the herald is there (a travelTo
  targeting the herald's tile, via forageTripSeedFirst — the
  policy was foraging, not hunting). No attempt follows: sharing
  a tile for part of one daily is not enough; the stance machine
  needs detail coincidence, and the scholar walks home the same
  daily. (Same incidental step recurs days 85, 87, again with no
  attempt.)
- Raid night, endDay-73 (probe4 stack: `havenRaidTick` →
  `progDaily` → endDay chain): the herald is drafted as a raider
  and pinned to (4,4). Nobody meets it, so it becomes lingering.
- Days 74–81 SHARED (pre-daily snapshot shared every morning):
  every endDay re-pins it to (4,4) (probe4 stacks:
  `havenGrowthDaily` → `progDaily` → endDay chain, detail
  preserved); every daily trip it follows the scholar step for
  step (probe4 stacks: game.js:12651 follow branch) or wanders
  onto the scholar's tile ("Something pads into the clearing",
  day 75); walking home blocks the follow at the safe tile, so it
  waits adjacent until the next dawn re-pins it. This is the
  daily cycle that manufactures contact.
- Day 78: 3 attempts, all REFUSED/MUSTER-GATE, caller
  wild-contact, step sub-label SHARED-IDLE (already shared at the
  morning snapshot). Detail cells coincided at pre (0,0)=(0,0);
  stance hungry. Readiness at refusals: total 11, ready TRUE —
  the call would muster 11, but the fight gates on an existing
  muster and none exists (call-vs-fight distinction, as in
  0725Z).
- Days 82–88 SCHOLAR_NEAR again (drift: lingering clears after
  ~6 nights; the herald wanders off to (4,5)/(5,5)/(5,4)/(5,3)/
  (4,2)). Day 89: shared again at the morning snapshot, detail
  coincided (8,0)=(8,0), 1 attempt, REFUSED/MUSTER-GATE,
  SHARED-IDLE. Day-89's sharing mechanism class is established
  by elimination (see below); its sub-cause is not distinguished
  by the judged corpus.
- Day-89 mechanism, stated honestly: between the day-88 evening
  snapshot (herald (4,2)) and the day-89 morning snapshot (herald
  (4,4)) the scholar did not travel, so wander and follow cannot
  have run (both need tile entry), and a wander step onto the
  safe home tile is blocked anyway. The only tile-movers that
  can place a monster on the safe home tile are the raid pin and
  the lingering re-pin (both endDay mechanisms). Day 89's share
  is therefore a raid-system pin — whether a fresh raid draft or
  a lingering re-pin, the judged corpus cannot distinguish, and
  the probes cannot arbitrate it (see Comparability note). What
  is certain is that it is NOT a deliberate march and NOT a
  wander step.

## What the probes proved (non-judged, instrument-side only)

Four probe scripts (scripts/locatedengage-probe*.js) were run on
97301 ONLY to name the mover behind two trace puzzles. They are
NOT judged evidence and the validator does not read them; the
judged corpus is le-s97307.json + le-s97301.json only.

- Probe1 (sleep brackets): sleep() itself does not move the
  herald on days 73/74 — the (5,4)→(4,4) move sits between sleep
  and the next daily, not inside sleep.
- Probe2 (mid-level brackets): the mover is endDay (called from
  advancePart), every endDay, detail preserved.
- Probe3 (endDay callee brackets): none of endDay's callees
  fired — the mover is reached through endDay's progDaily wrap
  chain, which probe3's Game-level brackets could not see (the
  wrap chain lives in other modules).
- Probe4 (tx/ty setters on the herald object): the exact
  assignments. `havenRaidTick` (havenGrowth.js:543) pins on raid
  nights; `havenGrowthDaily` (havenGrowth.js:216) re-pins
  lingering monsters every endDay; `wanderWorldMonsters`
  (game.js:20210, detail re-rolled) and the `travelTo` follow
  branch (game.js:12651, detail re-placed) move it on trips.
  Detail preservation across the dawn moves is what separates
  the raid pins (preserve detail) from wander/follow (replace
  detail).

COMPARABILITY NOTE (read before reusing probe numbers): the
probes do not install the judged replay's startCombat readiness
interceptor, and that interceptor's readiness call GENERATES a
roster on first refusal (documented `generatedNow` in the judged
corpus). Probe runs therefore diverge from judged runs AFTER the
first refusal (probe attempts: days 78×3 + 80×3; judged: days
78×3 + 89×1; probe endDay 90 vs judged 91). Every probe claim
used above is either pre-first-refusal (days 73–77 pins and
follows) or mechanism-level (the code paths exist and fire, with
stacks). No probe day-number after day 78 is cited as judged
fact. A future arm that needs day-89's exact sub-cause must
instrument the judged replay itself (raid-pin flags in the trace
rows), not re-run a probe.

## Sense-testing (real lines only, anchored patterns, judged for meaning)

All lines below are from the judged corpus's anchored capture
("THE HERALD" / "Scouts found its lair" / "fed in the night" /
"struck .* in the night" / "THE HERALD came" / "pads into the
clearing"). No bare-/omen/ lines are quoted.

1. s97307, day 129 — the lair line, identical to the 0725Z
   capture: "🗺️ Scouts found its lair — tile 7,4. THE HERALD —
   the sky, getting bigger. It is WAITING. You cannot face it
   alone. Sound the call." Judgment: the game names the tile and
   the act. What follows is the finding, not a mystery: the
   village was told, and its daily routine never once walked to
   the named tile in 24 days. The failure is not knowledge — it
   is that no one in the policy's repertoire does "go to the
   named tile."
2. s97307, day 149 — the price, still unanswered: "🌪️ THE
   HERALD fed in the night — 1,950 kcal gone from your stores.
   It is eating the realm while you deliberate." Judgment: the
   cost of deliberation is priced in food, the game's own
   currency, and the village keeps paying it. (The day-139
   0-kcal variant of this line, noted in 0725Z, recurs here —
   still a narration wrinkle, still not chased.)
3. s97307, day 152 — the epitaph: "THE HERALD came. Named and
   located — the war council knew its face." Judgment: the run
   ends knowing exactly what it never faced. The epitaph is
   honest; the 24 days before it are the blank.
4. s97301, day 75 — the accident, announced: "Something pads
   into the clearing — The Herald. It's here." Judgment: this is
   the wild-contact mechanism saying its own name. The herald
   arrives as weather arrives — it pads in, uninvited, because
   the raid pinned it and the wander step finished the job. The
   line reads like an encounter; the policy did nothing to earn
   it.
5. s97301, days 78/89 — the refusal, four times: "⛔ THE HERALD
   does not notice you the way prey notices a hunter. It notices
   you the way weather notices a field. You cannot face this
   alone — sound the call, muster 10 allied blades (you have
   0)." Judgment: the gate is legible and correctly refuses a
   solo fight. The tragedy is structural, not textual: the only
   path to the fight runs through a call the policy never makes,
   so the refusal is the end of the story, not the middle.

## Wall numbers (per seed only, never pooled)

- 97307: national 1, table 1, won 1, wave4 1, wave5 0, survival
  152d, endReason over-other, herald attempts 0, pendingEncounter
  never true.
- 97301: national 1, table 1, won 1, wave4 1, wave5 0, survival
  91d, endReason over-other, herald attempts 4 (days 78×3, 89×1,
  all REFUSED/MUSTER-GATE, all wild-contact), pendingEncounter
  never true.

## Metric review (for the NEXT run, never this verdict)

- TRACE WART (haven null): the trace rows record haven tile as
  (null, null) because `state.village.px/py` are unset in these
  runs. The engine defaults to (4,4) everywhere (`?? 4`), and
  map generation sets tiles[4][4].type='haven', so "scholar at
  (4,4) = at home" is established by code, not by the null field.
  The replay script was left unedited after the judged run so
  the committed script is exactly the script that produced the
  corpus; the next trace instrument should record
  `v.px ?? 4` instead of `v.px`.
- ROW ATTRIBUTION (1-row/3-row days): trace rows are stamped by
  scholar day at sample time, and a daily can roll the scholar
  day mid-daily — so days 1, 3, 117, 129 (97307) have 1 row and
  days 2, 4, 118, 130 have 3. No day is missing: the "missing"
  post row is stamped on the next day. The validator groups by
  stamped day and still labels every window day; a future
  instrument should carry a loop-day sequence number alongside
  the scholar day so attribution is exact.
- STEP TAXONOMY GAP: the prereg's step sub-labels (scholar-stepped
  / herald-stepped / shared-idle) have no RAID-PINNED class, yet
  the raid pin is the dominant sharing mechanism on the contrast
  seed. The validator bars were met as pre-registered (both
  attempt days resolve to SHARED-IDLE, which is true — they were
  shared at the morning snapshot), but the mechanism statement
  needed the probe chain to say HOW they came to be shared. The
  next contact instrument should pre-register RAID-PINNED (and
  record `lingering`/`raidBorn` flags in the trace rows) as a
  first-class step class.
- PROBE/JUDGED DIVERGENCE: see Comparability note above. Any
  future probe that omits an interceptor must state, up front,
  that its post-first-intervention days are not comparable to
  the judged run.
- The 0725Z prereg's "titans never wander" is corrected by this
  arm's code reading (wanderWorldMonsters + HERALD STEER move the
  herald between tiles; the safe-tile fence, not immobility, is
  what keeps it off home). Future preregs should not repeat it.

## Findings (for the coordinator, not chased mid-run)

1. DELIBERATE TITAN ROUTING DOES NOT EXIST (next arm's question):
   no policy layer sounds the call, musters, or marches to a
   lair tile. If Steve wants located titans fought deliberately
   rather than by raid accident, some policy must gain a
   sound-the-call + march behavior — a build decision, not a
   measurement. Until then, "located but never engaged" will
   recur whenever the raid bridge does not fire.
2. RAID-PIN IS THE ACCIDENTAL BRIDGE: raid drafts and lingering
   re-pins are the only code that places a monster on the safe
   home tile. Any intervention that changes raid frequency,
   lingering duration, or drift will mechanically change titan
   contact rates — a confound the next contact arm must control
   for.
3. FOLLOWS-STRING WRINKLE (Steve-call): the herald's data says
   "it does not follow. It precedes." and the code reads that
   string as truthy, so the herald DOES follow through tile
   boundaries. Is the string meant as a refusal the code should
   honor, or flavor the code correctly ignores? The answer
   changes whether follow-assisted contact is intended.
4. STEP-ONTO ≠ ENGAGEMENT: on 97301 the scholar stepped onto the
   herald's tile three times (days 73, 85, 87) with zero attempts
   — tile sharing without detail coincidence and stance
   escalation is not contact. Any future "march to the lair"
   design must also solve the detail/stance layer (wait on the
   tile until the stance machine closes), not just the tile
   layer.
5. The 0-kcal fed line (s97307 day 139, as in 0725Z) recurs — a
   small narration honesty wrinkle, still not chased.

## Convergence state

scale-onramp stays converging (NOT converged): the located-no-
engage mechanism is now ANSWERED (no deliberate routing exists;
contact is raid-accidental; tile sharing + detail escalation are
both required and the first fails on 97307), but no intervention
has been built or measured. The next move on this axis is a
build-or-rule decision (finding 1), not another trace.

## What was built (stays — the reusable located-titan trace instrument)

- `scripts/locatedengage-replay-20261102.js` — heraldcontact
  replay + pre/post-daily position traces + travelTo route-target
  wrap (with herald tile before/after each move) + anchored-only
  say capture + lair-tile parse.
- `scripts/locatedengage-classify.js` — pure per-day mechanism
  classifier (ATTEMPT + step sub-labels / SHARED_NO_ESCALATION /
  SCHOLAR_NEAR / APART / UNCLASSIFIED).
- `scripts/test-locatedengage-classify.js` (unit, 13/13),
  `scripts/test-locatedengage-a.js` (corpus validator, 22/22).
- `scripts/locatedengage-probe*.js` (4 probes, non-judged) —
  the probe chain that named the raid-pin mover; kept for reuse,
  clearly marked non-judged.
- Corpus: evidence/2026-11-02/perseed-locatedengage-a/
  (le-s97307.json, le-s97301.json, run.stdout/.stderr, probe
  logs). DISCLOSED REUSE: both seeds are the 0725Z pilot case +
  contrast, NOT a fresh band — never pooled, never band evidence.

## Commits (this branch, coordinator merges —ff-only or not at all)

- 9cf8baf3b prereg (before any judged sim).
- CLOSING COMMIT (this evidence + corpus + replay + classifier +
  tests + probes; DIAG-GO, scripts stay).

Ready for coordinator merge, pending ship. Nothing pushed, no
version bump, no live verification (ship loop owns deploys).
