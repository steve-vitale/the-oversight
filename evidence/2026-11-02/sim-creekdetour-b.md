# Loop B fleshout-20261102T1030Z round — scale-onramp: creek-detour march routing

Run: fleshout-20261102T1030Z, arm sim-creekdetour-b, axis scale-onramp.
Worktree branch: sim-creekdetour-b. POLICY / INSTRUMENT ONLY — zero
`src/js` changes. Sibling Loop A/B trees/branches NOT touched.
Tracker/claim/lock/rotation files NOT touched (coordinator's).

Prereg: evidence/2026-11-02/sim-creekdetour-b-prereg.md (commit
e4f483c01, BEFORE any judged sim). Policy:
scripts/policies/creekdetour.js. Unit proof:
scripts/test-creekdetour-b.js (31/31 green). Driver:
scripts/creekdetour-driver-20261102.js. Per-seed records:
evidence/2026-11-02/perseed-creekdetour-b/cd-{base,detour}-s<seed>.json
+ screening-ledger.json (all 70 baseline records summarized: seed,
lair, marches, arrivals, blocked marches, case flag, geometry hits).

## Verdict: PILOT GO (routing bar met; wall metrics regress — read both)

- GO (primary, routing): PASS. Seed 97307 is reached via detour on
  its first march day (day 130, north path (4,3)->(5,3)->(6,3)->
  (7,3)->(7,4)), AND 7/8 pilot seeds are reached under the detour
  policy. The bar was >= 6/8.
- Split (reported, not hidden): of the 7 reached, 6 are pure
  detours, 1 is swimmer-assisted (97449), 0 are bridge-assisted.
  The GO holds on detour-only count alone (6/8, excluding the
  swimmer seed) — the swimmer seed does not carry the verdict.
- GUARDRAIL (survival): PASS. Median end-gameDay 113.5 baseline ->
  122.0 detour on identical pilot seeds, difference 8.5 days
  (bar: within 20).
- CONTACT (secondary, not the GO bar): baseline 0 calls / 0 fought
  on all 8 pilot seeds -> detour 7 calls / 2 fought (1 SLAIN,
  97474 day 64; 1 LOST, 97599 day 61). Routing turns zero contact
  into real fights on these seeds.
- WALL (reported, NOT re-scored into GO): national 5/8 baseline ->
  2/8 detour; table 7/8 -> 5/8; won 7/8 -> 4/8; wave-5 1/8 -> 1/8
  (97474, wave-5 under BOTH arms via the baseline raid mechanism —
  not a detour effect). On this pilot, reaching the titan costs
  standing: 4 of 7 called seeds end village-lost against baselines
  that survived or won (97307 won->lost, 97422 survived->lost,
  97514 won->lost, 97599 won->lost). Deaths do not explain two of
  those flips (97307 deaths 38 both arms; 97514 deaths 44 both
  arms), so the cost sits in trust/standing around the call and
  muster, not in body count — mechanism NOT isolated, flagged for
  the muster-completion arm, not claimed here.
- CONFIRM: NOT RUN in this run. A GO pilot earns a confirm (12–16
  seeds, same selection rule) on a follow-up arm.

## The answer, in plain words

The creek was never the wall. The road was. On 97307 the march
failed for 20 days because the old walk picked the straightest
jump and the engine refuses a jump if ANY tile on ANY shortest
path is blocked — a creek one tile to the east poisoned every
straight jump, while a five-step walk around the north side had
been open the whole time. The new walk thinks like a person
looking at the map: it walks around the creek, one honest step at
a time, and it arrives on the first day it tries. Seven of eight
creek-blocked villages now reach the monster's lair, sound the
call, and — twice — actually fight it, once killing it. But
reaching the monster is not winning: the villages that march
come home poorer in standing, and four of them fall that would
have lived. The march is fixed. The muster — gathering enough
blades, and paying what the call costs — is now the named
bottleneck, not the road.

## Correction to titanroute-a (load-bearing, read this first)

titanroute-a's evidence says "(6,4) is a creek tile with
needsBridge=true" and "a travelBlockage-based BFS would NOT route
around this either." Both halves are wrong, proven by replay trace
in this run (diagnostic dumps, not judged sims):

- (6,4) on 97307 is WETLAND, not creek. The needsBridge creek is
  (5,4), the tile BEFORE it. travelTo(6,4) from (4,4) returns
  {blockType:'creek', x:5, y:4} — the block object names the
  INTERMEDIATE tile (travelTo's intermediate scan walks every
  shortest path from (4,4) to (6,4) and hits (5,4)), not the
  destination. The probe's own travelBlockage(6,4) = null was
  CORRECT for the destination; it was compared against the wrong
  tile. travelBlockage(5,4 from 4,4) = {blockType:'creek'}.
- A travelBlockage-based BFS DOES route around: edges (4,4)->(5,4)
  blocked, but (4,4)->(4,3)->(5,3)->(6,3)->(7,3)->(7,4) all open,
  and the lair's fallen tree guards ONLY the west approach
  (blockFrom dx=-1 on (7,4)), so the north entry is open. The
  scratch hop-by-hop walk proved it live: all five hops succeed
  and the scholar stands on the lair.
- Consequence: the "creek gate lives in travelTo itself" framing
  is retired. The gate lives in two honest engine rules working
  together: (a) needsBridge creeks block entry (travelBlockage),
  (b) multi-tile jumps are refused if any shortest-path tile is
  blocked (travelTo intermediate scan). Step-by-step adjacent
  hops (d=1) skip rule (b) entirely, which is why the detour walk
  cannot hit the same refusal. No engine change was needed, and
  none is proposed.

Code citations (all in src/js/game.js, this worktree): travelTo
intermediate scan ("every tile on a shortest path ... must be
enterable"); travelBlockage creek rule ("hard creek crossing:
bridge it, swim it, or go around"); clearBlockage / buildBridge
(4 wood, 60 kcal); MAP.md §1–2 (creeks top-to-bottom, ~35% need
a bridge or a swimmer).

## Question (1): is the creek genuinely impassable without a bridge?

Yes — the TILE is, the ROAD is not. A needsBridge creek tile
refuses entry from every side unless bridged or swum
(travelBlockage, no side exception for creeks — unlike fallen
trees, which guard one approach side only). What was never true
is that the creek blocked the ROAD: on 7 of 8 pilot seeds a
walkable detour exists on the home board, and on the eighth
(97396) the wall is a different shape (below). The creek is a
gated tile, not a gated map.

## Question (2): can a perception-lawful policy route around it?

Yes — proven on 97307 + 6 more seeds. The policy
(scripts/policies/creekdetour.js) reads ONLY: its own tile, the
engine's offered steps, entry-specific travelBlockage, board
tiles the BFS steps onto (terrain the player sees on the 9x9
board), the heard lair (scouts' say line, same anchored regex as
titanroute.js), its own wood count, and its own swimmer ability.
It NEVER reads Game.worldMonsters() or any monster roster, and
never a live herald position. The unit proof audits this two
ways: the stub Game has NO worldMonsters at all and the march
still arrives, and a call-spy asserts routing calls only
{tileAt, travelBlockage, travelTo, hasAbility, woodCount,
buildBridge, say}. BFS tie-breaks are deterministic (Manhattan
to lair, then x, then y); no RNG is consumed by the policy.

## Before/after on identical seeds (DAYS=180, frozen stack, base vs detour)

Baseline = titanroute arm (tribfloor leadfeast + windefer +
seatdrive + fullseat-diag + titanroute greedy march). Detour =
same stack with creekdetour march (BFS + refusal memory + bridge
fallback) and the same sound-the-call-once rule. Columns:
gameDays / national / table / won / maxWave / deaths / shares /
calls / attempts(FOUGHT) / first-arrival way + path.

| seed | lair | baseline | detour |
|------|------|----------|--------|
| 97307 | 7,4 | 152 / 1 / 1 / 1 / 4 / 38 / 0 / 0 / 0 | 146 / 0 / 0 / 0 / 4 / 38 / 0 / 1 / 0 — detour day 130, path (4,3)(5,3)(6,3)(7,3)(7,4) |
| 97396 | 6,4 | 113 / 1 / 1 / 1 / 4 / 33 / 8 / 0 / 25R | 113 / 1 / 1 / 1 / 4 / 33 / 8 / 0 / 25R — NO ARRIVAL (see below) |
| 97422 | 7,4 | 181 / 0 / 0 / 0 / 4 / 41 / 27 / 0 / 81R | 131 / 0 / 0 / 0 / 4 / 43 / 3 / 1 / 12R — detour day 110, path (5,4)(5,3)(6,3)(7,3)(7,4) |
| 97449 | 7,3 | 113 / 0 / 1 / 1 / 4 / 29 / 2 / 0 / 7R | 107 / 0 / 1 / 1 / 4 / 25 / 0 / 1 / 0 — SWIMMER day 96, path (5,4)(6,4)(7,4)(7,3) |
| 97474 | 7,4 | 114 / 1 / 1 / 1 / 5 / 32 / 22 / 0 / 39R | 146 / 0 / 1 / 1 / 5 / 43 / 2 / 1 / 1F — detour day 63, path (5,4)(5,3)(6,3)(7,3)(7,4); HERALD SLAIN day 64 |
| 97489 | 8,4 | 90 / 1 / 1 / 1 / 4 / 29 / 0 / 0 / 0 | 92 / 0 / 1 / 1 / 4 / 33 / 0 / 1 / 0 — detour day 86, 8-hop south loop (5,4)(5,5)(6,5)(6,6)(7,6)(8,6)(8,5)(8,4) |
| 97514 | 7,3 | 178 / 1 / 1 / 1 / 4 / 44 / 9 / 0 / 32R | 150 / 1 / 0 / 0 / 4 / 44 / 7 / 1 / 55R — detour day 133, 10-hop north loop (4,3)(4,2)(4,1)(5,1)(5,0)(6,0)(6,1)(6,2)(6,3)(7,3) |
| 97599 | 7,4 | 90 / 0 / 1 / 1 / 4 / 30 / 10 / 0 / 62R | 89 / 0 / 1 / 0 / 4 / 34 / 3 / 1 / 1F+1R — detour day 60, path (5,4)(5,5)(6,5)(7,5)(7,4); FOUGHT day 61, LOST |

R = MUSTER-GATE refusals, F = FOUGHT. Wall totals, pilot 8:
national 5 -> 2; table 7 -> 5; won 7 -> 4; wave-5 1 -> 1.
Median end-day 113.5 -> 122.0 (guardrail pass, diff 8.5).
Calls 0 -> 7; fought 0 -> 2; slain 0 -> 1.

## The one miss: 97396 (a different wall, honestly reported)

Lair (6,4) IS itself a needsBridge creek tile, and (5,4) is
another needsBridge creek — a double-creek wall with the lair
tile gated. The detour policy behaves exactly as pre-registered:
BFS finds no walkable path (the lair tile itself refuses entry),
bridge fallback looks for an ADJACENT needsBridge creek (finds
(5,4) from home), but woodCount = 0 on all 17 bridge-eligible
march days, so it fails honestly (bridgeBlocked wood:0) and the
run is byte-identical to baseline on every wall metric (113
days, 33 deaths, 8 shares, 25 refusals both arms). Two lessons,
both documented not fixed: (a) the prereg bridge rule covers
only a single adjacent creek — a two-creek wall needs walk-
toward-then-bridge (bridge the first creek, walk onto it, bridge
the second), which the frozen policy does not do and which must
be pre-registered as its own arm, not bolted on after seeing
this seed; (b) wood = 0 at march time on this seed, so even the
extended rule would need a wood-gathering leg first. 97396 stays
a NO on this pilot and a named blank for the bridge arm.

## The swimmer seed: 97449 (counts, but does not prove detour)

The scholar on 97449 HAS the swimmer ability (provenance not
traced — occupation/grant path unisolated, flagged not claimed),
so travelBlockage passes the (6,4) creek and the BFS walks
straight through it. The arrival is recorded as swimmer-assisted
(path steps on a needsBridge creek tile while swimmer=true),
and the pilot's GO does not depend on it (detour-only 6/8 still
meets the bar). The swimmer lane is the engine's own third option
("bridge it, swim it, or go around") working as designed — a
confirmation of the MAP.md rule, not a detour proof.

## Legs never exercised in the pilot (unit-proven only)

- Refusal memory: 0 refusals on all 8 detour runs — every BFS
  path was clean on first try, so the re-plan leg never fired in
  sim. It is proven only by the unit test (surprise refusal ->
  re-plan via the south route, arrival preserved).
- Bridge success: 0 bridge arrivals in the pilot (only the
  wood-starved 97396 attempt). Bridge building is proven only by
  the unit test (wall board + 4 wood -> bridge -> arrival; 3 wood
  -> honest failure). A bridge-success sim (a seed with wood >= 4
  at march time and a single-creek wall) is owed before anyone
  claims the bridge leg works in play.

## Calls and musters (the new bottleneck, in numbers)

Detour calls drew, by seed (named answers; minAllies = 10):
97307: 8 blades (2+4+2) — short by 2, 0 attempts, no fight.
97422: 5 blades (3+2, Emberhold refuses debts) — 12 MUSTER-GATE
refusals, no fight. 97449: 4 blades (2+2) — 0 attempts, no fight.
97474: 16 blades (5+5+6, Emberhold refuses trust) — FOUGHT day
64, HERALD SLAIN. 97489: 12 blades (6+6) — 0 attempts, no fight:
the scholar camps the lair but the herald is never sampled on
the tile after arrival (shares 0) — arrival without contact,
the second layer titanroute-a named (stance/detail coincidence).
97514: 5 blades (Thornfield only; Emberhold + Stonebridge
refuse) — 55 MUSTER-GATE refusals, no fight. 97599: 10 blades
exactly (6+2+2) — FOUGHT day 61, LOST ("THE HERALD remains. The
coalition breaks and runs. The muster is spent").
So of 7 calls: 2 fought, 4 muster-short, 1 no-contact. Even
97307's 8 + 3 Haven blades (titanCommitOwn, NOT in this policy)
would be 11 — the muster-completion arm (commit-own + deeper
links, titanroute-a blank #2) would flip 97307 to a fight. That
arm is now the highest-value follow-up: arrival is solved, the
muster is what still gates 4 of 7 calls.

## Screening method (auditable; two prereg deviations, both disclosed)

Full-run screening (unchanged titanroute arm, DAYS=180) ran
97350–97389 (40 seeds): 0 cases — every located seed's greedy
march arrived (10/10 located arrived; 97369 and 97409 patterns
show blocked-then-arrived, mechanism unisolated: a bridge built
by the base routine, or a later march from an away tile).
Creek-blocked marches are rare in unfiltered seeds (~0/40), so
the scan was accelerated in two disclosed ways (case STATUS
still comes only from full titanroute records; nothing was
admitted on geometry alone):

1. Geometry nomination (map-gen only, zero days run): after
   setupGame, read the home->east-lair corridor tiles. A seed was
   nominated if a needsBridge creek sat at (5,4) or (6,4) (Tier
   A, 97307-class) or only at (7,4)/(5,3)/(6,3) (Tier B).
   Nomination validated on knowns: 97307 flags (5,4 NB);
   arrived seeds 97352/97357/97362 do not flag (97360 flags
   (6,3) only and arrived — over-broad Tier B, excluded by its
   full record, as designed). 300 seeds geometry-screened
   (97390–97689); Tier A nominations confirmed by full runs in
   numeric order until 7 cases were banked.
2. Case-rule narrowing (stricter, not softer): the prereg's case
   rule (lair heard + >= 1 march + 0 arrivals + >= 1 blocked
   march) admits ANY blocked march, but the task's bar names
   CREEK-blocked cases, and titanroute march records do not store
   refusal blockType. Cases were therefore admitted only when the
   full record satisfied the prereg rule AND geometry showed a
   needsBridge creek on the home->lair corridor. NO seed changed
   status because of this: the first 22 full screens yielded 0
   cases under either rule, and all 9 confirmed cases satisfy
   both rules. The full confirmation ledger is
   perseed-creekdetour-b/screening-ledger.json (70 baseline
   records); the 9 confirmed cases in numeric order are 97307,
   97396, 97422, 97449, 97474, 97489, 97514, 97599, 97619. Pilot =
   97307 + first 7 of the rest; 97619 is a confirmed reserve,
   NOT pooled.

Confirmation ledger (Tier A nominations -> full-run verdict):
97396 CASE (22/0/22), 97403 never-located, 97409 arrived (7
marches, 2 arrivals, 5 blocked — blocked-then-arrived),
97415 arrived, 97421 arrived, 97422 CASE (63/0/63), 97447
never-located, 97448 never-located, 97449 CASE (13/0/7),
97474 CASE (47/0/47), 97479 never-located, 97482 never-located,
97486 1 partial march (window, not a case), 97488
never-located, 97489 CASE (4/0/4), 97491 arrived, 97494 arrived,
97501 never-located, 97506 never-located, 97514 CASE (44/0/44),
97517 never-located (24 days), 97538 never-located, 97546
never-located, 97599 CASE (21/0/21), 97607 never-located, 97609
arrived, 97619 CASE (59/0/59, reserve), 97622 never-located.
(Format: marches/arrivals/blocked.)

## Transcript read (march + call, judged for sense)

97307, days 129–130: "Scouts found its lair — tile 7,4. THE
HERALD — the sky, getting bigger. It is WAITING. You cannot face
it alone. Sound the call." -> "THE HERALD struck Stonebridge in
the night. They bled while the coalition talked. (trust -5 —
they notice who wasn't there.)" -> day 130, detour march (5
hops, no refusal, no narration of the walk itself — the walk is
silent engine movement, same as titanroute's; the policy says
nothing about the road, which is honest but quiet) -> "THE CALL
GOES OUT" -> three villages answer by name with named blades
(8 total, trust holds). Judgement: coherent end to end — a
heard location, a priced delay (the night strike lands BEFORE
the call, so deliberation has a visible cost), a call with
named answers, an arrival the day the road opens. Two voice
notes, both the game's, not the policy's: the 8-blade muster
sits below the 10-blade gate with no line saying "two blades
short" (the player must count names); and the detour walk
itself narrates nothing (a five-tile walk around a creek
deserves one line — "You skirt the creek and come at the lair
from the north" — a voice blank for the queue, not a defect in
routing). 97474's kill sequence (heard + marched + called day
63, 16 blades, refusal with reason, FOUGHT day 64, "THE HERALD
FALLS. The realm exhales.") is the cleanest deliberate-titan
sequence in the program to date.

## Villagers act like people? (sense-testing)

Sampled call answers are named and consequential: villages
answer with named marchers or refuse with reasons (trust -8,
debts unpaid) that are remembered. The muster-spent line after
97599's lost fight ("sound the call again, if anyone still
answers") is the game reasoning about its own state honestly.
Robotic residue, named: (a) 55 identical MUSTER-GATE refusals on
97514 (the engine repeats one arithmetic line instead of
escalating, deflecting, or going quiet — same note as
titanroute-a's 72 on 97338, now reproduced under the detour);
(b) the scholar camps the lair tile for days after arrival with
no spoken reason when the muster is short (97307 days 131+,
97422 days 113+) — nobody says why they wait, or what would
unblock them. Neither is this policy's doing; both are blanks
for the voice/routine queue, not this arm.

## Reachability verdict

- Deliberate march to a heard lair past a creek: reachable —
  7/8 pilot seeds (6 pure detour + 1 swimmer).
- Sounded call via detour: reachable — 7/7 arrivals called.
- A FOUGHT titan fight via detour routing: reachable — 2/8
  pilot seeds (97474 won, 97599 lost); baseline fought 0/8.
- A SLAIN herald via detour routing: reachable — 1/8 (97474).
- Wave-5 unlock via detour routing: NOT demonstrated as a
  detour effect (97474 wave-5 pre-exists under baseline).
- Full seat / win: NOT improved by this arm on this pilot
  (table 7 -> 5, won 7 -> 4) — routing is a contact lever, and
  the call's standing cost currently outweighs its campaign
  gain on these seeds. This is a finding, not a verdict on
  routing: the muster-completion arm is where the win-path
  question now lives.

## Blanks filled / documented

FILLED (this arm, policy, committed):
- Creek-aware march routing: BFS detour over entry-specific
  travelBlockage + refusal memory + bridge fallback (wood-gated)
  + swimmer lane, under the perception law. Commits: e4f483c01
  (prereg + proof skeleton), 25574ebbc (policy + full proof
  31/31 + driver). 97307 reached day 130 first try; pilot GO.
- titanroute-a correction: blocking tile is (5,4), not (6,4);
  travelBlockage-BFS DOES route around; the "gate lives in
  travelTo" framing retired (this file, above).
DOCUMENTED (evidence, not built — next arms):
- (1) Muster completion: minAllies = 10 gates 4/7 detour calls
  (8, 5, 4, 5 blades). Needs titanCommitOwn leg + deeper links
  (titanroute-a blank #2, now the top follow-up).
- (2) Two-creek walls + wood gathering: 97396 (lair tile itself
  a creek, wood 0) needs walk-toward-then-bridge + a wood leg,
  pre-registered as its own arm.
- (3) Bridge-success + refusal-memory sims: both legs are
  unit-proven only (0 firings in the pilot); a wood-rich
  single-creek seed and a surprise-refusal seed are owed.
- (4) Call standing cost: 4/7 called seeds flip to village-lost
  against surviving/winning baselines, with deaths flat on two
  of them — trust/standing trace owed before any claim about
  whether the call itself is overpriced.
- (5) No-contact arrival: 97489's 12-blade muster never meets
  the herald (shares 0 after arrival) — the stance/detail
  second layer, untouched by both routing arms.
- (6) Refusal-voice escalation: 55 identical MUSTER-GATE lines
  (97514) — engine voice work, not policy work.
- (7) Detour-walk narration: the walk itself says nothing — one
  line naming the way around is owed to the voice queue.
- (8) Blocked-then-arrived pattern (97369, 97409): marches
  blocked for days, then arrivals — mechanism (base-built
  bridge? away-tile march?) not isolated, flagged not claimed.
- (9) Swimmer provenance on 97449: which grant gave the scholar
  swimmer is untraced.

## Balanced panel (§15 — limitation reported)

As in titanroute-a, no panel compare .md is attached,
deliberately: the panel runs named registry policies only
(scripts/sweep-compare.js POLICY_REGISTRY) and cannot express
the titanroute/creekdetour composition, so running it would
measure something else and present it as this arm. The panel is
the instrument and this prereg's thresholds are the judge; where
the instrument cannot express the comparison, the instrumented
driver records (attached per-seed JSON) are the measurement, and
the wall metrics above (national/table/wins/wave reach, median
survival) are reported from them.

## Metric review (for the NEXT run, not this verdict)

- The pilot's case rule (0 march arrivals) admits seeds with
  heavy raid/wander shares (97396: 8 shares, 97422: 27 shares,
  97474: 22 shares under baseline) — shares and march arrival
  are different things, and the pilot correctly measures the
  latter, but a future pilot should state the shares distinction
  in the case rule itself so a reader does not mistake "0
  arrivals" for "no contact."
- The GO bar counts reached seeds regardless of split, with a
  "GO via bridge/swimmer" label promised for a split-carried
  verdict. Here the label was not needed (detour-only 6/8 meets
  the bar alone) — but the rule should be tightened for the
  confirm: pre-register whether swimmer/bridge arrivals count
  toward the confirm bar, or whether the confirm bar is
  detour-only, BEFORE the confirm runs.
- The 180 cap truncates post-call survival on 97422's baseline
  (181 days — the loop rolls one day past the cap) and hides
  any survival cost past day 180. The guardrail median is a
  capped median; the 8.5-day gap is comfortable, but a tight
  confirm guardrail should consider a longer cap.
- Wood at march time is unmeasured in the baseline records
  (97396's wood:0 came from the detour record's bridgeBlocked
  field). A bridge arm must instrument wood at first march day
  in BOTH arms, or its before/after will not know whether the
  bridge leg could even fire.
- Blocked-then-arrived seeds (97369, 97409) show the case rule's
  edge: a seed can be creek-blocked for days and then arrive.
  The rule (0 arrivals over the whole run) handles this
  correctly by exclusion, but the MECHANISM (what changed) is
  worth a trace — if the base routine builds bridges, then
  "creek-blocked" is a timed state, not a seed trait, and future
  pilots should record first-blocked and first-arrived days.

## Commits (worktree branch sim-creekdetour-b; coordinator merges --ff-only)

- e4f483c01 — prereg (before any judged sim) + proof skeleton.
- 25574ebbc — creekdetour policy, full proof 31/31, driver.
- (this file + per-seed records + screening ledger — commit
  hash to be filled at commit time; see report.)

Report: ready to merge locally, pending ship. Do NOT push, do NOT
bump versions, do NOT verify live (ship loop owns deploys).
Routing-diagnosis work: no [needs-eyes] (no feel/combat/UI change;
the detour walk narrates nothing new).
