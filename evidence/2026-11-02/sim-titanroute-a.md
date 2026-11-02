# Loop A 0915Z round — scale-onramp: deliberate titan routing (march + sound-the-call)

Run: fleshout-loop-a-20261102T0915Z, arm sim-titanroute-a, axis scale-onramp.
Worktree branch: sim-titanroute-a. POLICY ONLY — zero `src/js` changes
(`git diff` on src/ empty at report time). Sibling Loop B trees/branches
NOT touched. Tracker/claim/lock/rotation files NOT touched (coordinator's).

Prereg: evidence/2026-11-02/sim-titanroute-a-prereg.md (commit 9fac2b492,
BEFORE any judged sim) + addendum evidence/2026-11-02/sim-titanroute-a-
prereg-addendum.md (commit b5a193e44, BEFORE any arm run — see below).
Policy: scripts/policies/titanroute.js. Driver:
scripts/titanroute-driver-20261102.js. Unit proof:
scripts/test-titanroute.js (19/19 green, twice: at prototype commit and
after the HP-field fix). Probe: scripts/titanroute-probe-97307.js.
Per-seed records: evidence/2026-11-02/perseed-titanroute-a/tr-{base,route}-
s<seed>.json (void first arm batch preserved as VOID-hpbug-route-s*.json).

No titan canon doc exists in docs/ — stated, none invented (same finding
as prior arms); in-code sources src/js/titans.js + src/data/titans.json +
src/js/havenGrowth.js. docs/CANON.md, docs/PERCEPTION.md, docs/MAP.md
read; repo AGENTS.md read and followed (shared sim-harness kit, no eval
boilerplate copy, no empty catches in new code).

## Verdict: PILOT NO-GO (bar 1 missed by one seed; bars 2 and 3 pass)

- GO (1) ROUTING — FAIL: arm reaches tile-share on 5/8 pilot seeds
  (97301, 97310, 97330, 97338, 97342); bar is ≥6/8. On the 7
  baseline-zero pilot seeds the arm shares on 4 (97310, 97330, 97338,
  97342) — same miss by either cut. A miss is NO-GO, not re-scored.
- GO (2) CALL/CONTACT — PASS: 5 sounded calls (same 5 seeds), 10 +
  1 + 7 + 72 + 0 herald attempts across them, and 2 REAL fights
  (97301 day 60, lost; 97310 day 85, herald SLAIN).
- GUARDRAIL (3) SURVIVAL — PASS: median end-gameDay 94 arm vs 91
  baseline on identical seeds, difference 3 days (bar: within 20).
- CONFIRM: NOT RUN — a confirm belongs to a fixed follow-up, not to
  a NO-GO prototype. Confirm owed on the follow-up arms (creek-aware
  routing + muster completion, below), same 8 seeds plus extension.

## The answer, in plain words

Marching to a located titan works — when the scholar actually gets
there. On all 5 seeds where the march arrived, the village shared a
tile with the herald, sounded the call, and drew allied blades
(5/5 arrivals → shares, 5/5 → calls). Two of those became real
fights, one of them a kill. The pilot misses its bar not because
routing fails, but because the scholar only arrives on 5 of 8
seeds: one seed's road east is blocked by a creek that needs a
bridge (20 refused marches in a row), one seed's only window was a
day the scholar was too hurt to march, and one seed heard about
the lair on the very day the run ended, leaving no window at all.
And even when the call sounds, it is not always enough: the fight
gate demands 10 allied blades, and two villages' calls brought only
6 — so their heroes stood on the herald's tile for days, attempts
firing again and again, and were refused every time for want of
four more blades. The march half is proven. The two missing legs
are now named precisely: a creek-aware road, and a complete muster.

## Before/after on identical seeds (DAYS=180, frozen stack, baseline vs arm)

Baseline = prior arm's frozen stack (tribfloor leadfeast + windefer +
seatdrive + fullseat-diag, flags FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1). Arm =
withTitanRoute(baseline). Columns: shares / attempts / calls /
end-day / national / table / won / maxWave.

| seed | baseline | arm |
|------|----------|-----|
| 97307 (case) | 0 / 0 / 0 / 152 / 1 / 1 / 1 / 4 | 0 / 0 / 0 / 152 / 1 / 1 / 1 / 4 |
| 97301 (contrast) | 8 / 6 / 0 / 90 / 0 / 1 / 1 / 4 | 2 / 10 / 1 / 90 / 0 / 1 / 1 / 4 |
| 97310 | 0 / 0 / 0 / 90 / 1 / 1 / 1 / 4 | 2 / 1 / 1 / 96 / 1 / 1 / 1 / 5 |
| 97318 | 0 / 0 / 0 / 90 / 1 / 1 / 1 / 4 | 0 / 0 / 0 / 90 / 1 / 1 / 1 / 4 |
| 97327 | 0 / 0 / 0 / 92 / 1 / 1 / 1 / 4 | 0 / 0 / 0 / 92 / 1 / 1 / 1 / 4 |
| 97330 | 0 / 0 / 0 / 96 / 0 / 0 / 0 / 4 | 3 / 7 / 1 / 122 / 0 / 0 / 0 / 4 |
| 97338 | 0 / 0 / 0 / 118 / 1 / 0 / 0 / 4 | 8 / 72 / 1 / 125 / 0 / 0 / 0 / 4 |
| 97342 | 0 / 0 / 0 / 65 / 0 / 0 / 0 / 4 | 2 / 0 / 1 / 64 / 0 / 0 / 0 / 4 |

Wall totals, pilot 8: national 5/8 baseline → 4/8 arm (one flip:
97338 loses national under the arm — see below); table 5/8 → 5/8;
won 5/8 → 5/8; wave-5 unlock 0/8 → 1/8 (97310 arm: killing the
herald advanced the campaign to the finale — the only wave-5
unlock in the pilot). Median end-day 91 → 94 (guardrail pass).

## Reproduction check (not band evidence)

Baseline re-runs reproduce the prior arm's diagnosis in mechanism,
with a small tail divergence disclosed: 97307 exact (lair 7,4, 0
shares, 0 attempts, end 152, nat/table/won 1/1/1). 97301: lair 8,4,
raid-pin shares, MUSTER-GATE refusals all reproduce, first attempt
day 78 ×3 as before; the tail differs (shares 74–80 + 84 and
attempts days 78 + 80 here, vs 74–81 + 89 in the prior arm; end
90 vs 91; national 0 vs 1). Cause is not isolated — the worktree
base moved since the prior arm (journey-scale r68 landing) and the
drift clock is RNG-sensitive — but the judged comparison is
baseline-vs-arm on identical seeds under current code, so the
pilot's internal validity is unaffected. The pilot is NOT voided
on this: the mechanism, not the tail day, is what the pilot builds
on.

## Prereg addendum (before any arm run — read this before citing GO (1))

The first-committed screening rule (first 6 baseline runs that hear
the lair line) omitted a condition the coordinator's bar itself
states ("seeds where the baseline policy reaches 0"). Screening
showed why it matters: baseline shares are COMMON once located —
97325 (shares 93–99 at home), 97328 (59–61, 70, 81 at home), 97333
(14 shares, 52 attempts), 97339 (7 shares), 97340, 97341 all share
via the raid-pin/lingering mechanism (herald pinned to home,
scholar home), the same accident as 97301. A pilot including them
would have failed GO (1) on screening data alone, before the
routing policy ever ran. Corrected rule (addendum commit, zero arm
outcomes existing at that point): fresh pilot seeds = first 6 in
numeric order from 97310 satisfying BOTH lair-heard AND baseline
shareCount = 0 → 97310, 97318, 97327, 97330, 97338, 97342.
Excluded seeds stay in the screening record as baseline raid-share
evidence; nothing was hidden. This correction follows the
coordinator's bar as written; it is not a softening, and the
original gloss's failure mode is documented here rather than
repeated.

Screening ledger (baseline-only): 40 seeds screened (97310–97349).
Located (lair heard): 14. Baseline-zero located (pilot-eligible):
97310, 97318, 97327, 97330, 97338, 97342, 97343, 97347, 97349
(first 6 taken). Raid-share located (excluded): 97325, 97328, 97333,
97339, 97340, 97341 (97341: 21 share days, 56 attempts — the
largest baseline accident in the screen). Never located: the rest.
Locate rate 14/40 (35%); among located, baseline shares 6/14 (43%)
— the "baseline never shares" picture was specific to 97307's
orbit geometry, not a general law. Two screening runs also reached
wave 5 under baseline alone (97328 maxWave 5 in screen; not a
pilot seed).

## The three misses, seed by seed (why the bar missed)

1. 97307 — CREEK-BLOCKED ROAD (the deep finding). The march
   attempted 20/20 days (130–150) from home and moved 0 steps every
   time. Probe (scripts/titanroute-probe-97307.js): the march's
   chosen step is travelTo(6,4), refused with blockType "creek"
   every time. (6,4) is a creek tile with needsBridge=true (game
   law: ~35% of creek tiles need a bridge or a swimmer). The
   march's step choice — Manhattan-best travelTarget, stop on
   refusal, mirroring competent's walkTo — never tries another
   tile: no detour via (5,3)/(6,3)/(7,3), no bridge action. Note
   the probe subtlety: Game.travelBlockage(6,4) returns null —
   the creek-bridge gate lives in travelTo itself, so a
   travelBlockage-based BFS (competent's routeAround) would NOT
   route around this either. Follow-up blank: creek-aware march
   routing (detour planning on visible tile types + refusal
   memory, or a bridge/swim action) — a new sub-blank, not a
   tweak to this prototype's step choice.
2. 97318 — GUARDRAIL-BLOCKED SOLE WINDOW. Lair heard day 89, run
   ends (won) day 90. The only march opportunity, day 89's daily,
   was guardrail-blocked (fed true, watered true, healthy false).
   The guardrail worked as designed; the window was one day wide.
3. 97327 — ZERO WINDOW. Lair heard day 92, the run's final day
   (won). No daily ever ran after the hearing. Nothing could
   march; this seed cannot test routing under any policy.

## The five arrivals (what routing actually does)

- 97301: march day 59 (2 steps, home → lair 8,4), call day 59:
  Thornfield 6 + Ashford 2 + Emberhold 2 = 10 blades — exactly
  minAllies. Shares 59–60 (vs baseline's 74–80 + 84): routing moved
  contact 15 days earlier and changed its kind (deliberate march,
  not raid pin). Fight day 60: LOST ("THE HERALD remains. The
  coalition breaks and runs. The muster is spent"), then 9
  MUSTER-GATE refusals at have=0. Deaths 42 vs baseline 29: the
  lost fight cost ~13 lives. The prototype sounds one call per
  run and does NOT re-sound after a spent muster, though the game
  itself suggests it ("sound the call again, if anyone still
  answers") — re-call-after-spent is a follow-up design question
  (trust costs, coalition recovery), documented not decided.
- 97310: march day 84 (1 step, home → lair 7,4 — travelTargets
  reach d≤3, so the lair is one honest step), call day 84: 11
  blades (3+4+4). Shares 84–85. Fight day 85: HERALD SLAIN
  ("THE HERALD FALLS. The realm exhales."). Campaign advances:
  maxWave 5 under the arm (finale arrives days 90–96) vs 4 under
  baseline. Deaths 35 vs 27: even a won titan fight costs lives.
- 97330: march day 85, call day 85: 6 blades (2+2+2) — short of
  10. Shares 85–86 + 101; all 7 attempts refused MUSTER-GATE.
  The village stood on the tile and could not fight for want of
  4 blades. (6 allies + 3 Haven blades via titanCommitOwn would
  still be 9 — this seed needs a deeper link or a fourth village
  too, not just the commit leg.)
- 97338: march day 90 (lair 7,3 — the pilot's only off-row lair),
  call day 90: Emberhold + Stonebridge REFUSE (debts unpaid,
  trust −8 each), Thornfield answers 6. Shares 8 days
  (90–92, 96–100); all 72 attempts refused MUSTER-GATE. The
  refusal spam is the engine's voice (one line per attempt), not
  the policy's — but 72 identical refusals across 7 days is a
  voice problem worth naming: the game repeats the arithmetic
  instead of saying anything new. National flips 1 → 0 under the
  arm on this seed (trust hits + fight-less attrition are the
  likely cause; not isolated to a single cause — flagged, not
  claimed).
- 97342: march day 61, call day 61: 6 blades. Shares 61–62, 0
  attempts (stance/detail cells never coincided in the 2-day
  window — the second layer this arm does not touch). Run ends
  day 64 village-lost, 1 day earlier than baseline (65).

Arrival → share is 5/5 in this pilot. The bar miss is an arrival
miss (creek, window, guardrail), not a share miss.

## Village assessment (plain words)

On the seeds where the village marches, it stops being a place
things happen to and becomes a place that goes out to meet the
sky getting bigger — and pays for it in lives either way. A won
herald fight still costs about eight lives; a lost one about
thirteen, and the coalition breaks and runs. Villages that march
but cannot muster 10 blades do the saddest thing of all: they
stand on the monster's tile for days, fully ready to die, and are
told by arithmetic that they may not fight. The herald, meanwhile,
keeps eating: 1,980 kcal in a single night on 97310 while the
village deliberated, and night strikes on allied villages on
97301/97338 while the coalition talked. Waiting is not free, and
marching is not free either — the pilot prices both.

## Transcript read (march + call, judged for sense) — 97310, days 84–85

Day 84, in order: "Scouts found its lair — tile 7,4. THE HERALD —
the sky, getting bigger. It is WAITING. You cannot face it alone.
Sound the call." → "THE HERALD fed in the night — 1,980 kcal gone
from your stores. It is eating the realm while you deliberate." →
"THE CALL GOES OUT — THE HERALD must fall, and no one fire can do
it." → three villages answer by name with named blades (11 total,
trust holds). Daily-post sample: scholar (7,4), herald (7,4) —
shared. Day 85: "THE HERALD! You're on your own." → "THE HERALD
FALLS. The realm exhales. That was the herald. The sky is still
getting bigger." Herald present days end at 85.
Judgement: the sequence is coherent end to end — a heard
location, a priced delay (the night feed lands BEFORE the call,
so deliberation has a visible cost), a call with named answers,
a shared tile, a fight, a death, and a consequence (the finale
arrives days later). Two voice notes, both the game's, not the
policy's: "You're on your own" reads lonely for a coalition
fight (the allies are injected by the engine, but the banner
doesn't say so); and on 97301's lost fight the same banner is
followed by the muster-spent line, which resolves it. Neither
breaks sense; the lonely banner is a minor voice oddity to
mention, not a defect to fix here.

## Villagers act like people? (sense-testing)

Sampled dialogue is named and consequential: villages answer or
refuse with reasons (trust, debts, old blood) and the refusals
cost trust visibly (−8, remembered). The muster-spent line after
a lost fight ("sound the call again, if anyone still answers")
is the game reasoning about its own state honestly. Robotic
residue, named: (a) the 72 identical MUSTER-GATE refusals on
97338 — the engine repeats one arithmetic line instead of
escalating, deflecting, or going quiet; (b) the scholar camps on
the dead lair tile for days after the 97310 kill (daily-post
still (7,4) on day 86) before the base routine carries them home
— nobody says why they linger. Neither is this policy's doing;
both are blanks for the voice/routine queue, not this arm.

## Reachability verdict

- Titan location (lair heard): reachable — 14/40 screened seeds.
- Deliberate tile-share via march: reachable — 5/5 arrivals.
- Sounded call with allied blades: reachable — 5/5 calls drew
  blades (6–11).
- A FOUGHT titan fight via routing: reachable — 2/8 pilot seeds
  (97301 lost, 97310 won).
- A SLAIN herald via routing: reachable — 1/8 (97310).
- Wave-5 unlock via routing: reachable — 1/8 (97310, through the
  kill). Wave-5 fought in normal play: still 0 anywhere in this
  pilot (the finale arrives but is not fought within the runs'
  remaining days).
- Full seat / win: unchanged by this arm (table 5/8 both arms;
  won 5/8 both arms). Routing is not a win lever on this pilot;
  it is a contact lever, and it moves the campaign (97310).

## Blanks filled / documented

FILLED (this arm, policy prototype, committed):
- Deliberate march to a heard lair + sound-the-call-once, under
  the perception law (lair from the scouts' say line only; live
  herald position NEVER read; target is always the fixed lair).
  Commits: 0dcf04430 (prototype+driver+unit proof), eb59d271b
  (HP-field fix, below).
DOCUMENTED (evidence, not built — next arms):
- (1) Creek-aware march routing: (6,4)-class needsBridge creek
  tiles refuse travelTo while travelBlockage reports null, so
  neither plain walkTo nor travelBlockage-BFS routes around.
  Needs detour planning on visible tile types + refusal memory,
  or a bridge/swim action. (Seed 97307.)
- (2) Muster completion: minAllies = 10 (titans.json herald);
  muster-ready = unique allies + committed Haven blades (cap 3).
  Calls bringing 6 blades (97330, 97338) can never fight; even
  6 + 3 = 9 falls short. Needs titanCommitOwn leg + deeper links
  (trusted villages bring 6, not 2) and/or a fourth village.
  This is the other half of the tracker's blank (the stance layer
  remains untouched by both halves).
- (3) Re-call after a spent muster: game suggests it, prototype
  deliberately does not (one call/run). Design question, not a
  bug.
- (4) Refusal-voice escalation: 72 identical MUSTER-GATE lines
  (97338) — engine voice work, not policy work.
- (5) Post-kill lingering: scholar camps the dead lair with no
  spoken reason (97310 day 86) — routine/voice blank.
- (6) 97338 national flip (1 → 0 under arm) — flagged, cause not
  isolated; needs a trust/standing trace before any claim.

## Void batch (honest record, not hidden)

The FIRST arm batch (8 seeds) ran with a policy bug and is VOID,
not NO-GO: the health guardrail read `s.hp`, but the Game stores
scholar HP in `s.health` (competent reads `s.hp || s.health`).
Every march blocked (healthy:false every day), so arm runs were
byte-identical to baseline — the intervention never acted. The
policy's own ctx record exposed it (lastGuardBlock on every
seed). Fix: read `s.hp ?? s.health ?? 100` (commit eb59d271b);
unit stub changed to the real Game shape (health-only) so the
regression is pinned. Void records preserved as
VOID-hpbug-route-s*.json and never pooled. The judged pilot above
is the re-run after the fix. Lesson carried forward: guardrail
fields must be asserted against the real state shape, not the
stub shape — the stub originally matched the bug, so the unit
proof passed while the sim failed.

## Balanced panel (docs/MEASUREMENT.md §15 — limitation reported)

No panel compare .md is attached, deliberately: the panel runs
named registry policies only (scripts/sweep-compare.js
POLICY_REGISTRY: capable, livelihoods, market builds, leadfeast —
no titanroute, no windefer/seatdrive/fullseat composition), so it
cannot express this prototype's before/after comparison, and
running it on a different policy would measure something else and
present it as this arm. The panel is the instrument and this
prereg's thresholds are the judge; where the instrument cannot
express the comparison, the instrumented driver records (attached
per-seed JSON) are the measurement, and the wall metrics above
(national/table/wins/wave reach, median survival) are reported
from them. Adding the prototype to the panel registry would mean
editing shared panel tooling mid-run — out of this arm's scope;
if the coordinator wants panel coverage for policy prototypes,
that is tooling work for a separate arm, noted here.

## Metric review (for the NEXT run, not this verdict)

- The 180 cap truncates post-window survival: 97343's baseline
  run survived to the cap (gameDays 181 — the loop rolls one day
  past the cap). The guardrail median is a capped median; a
  survival cost past day 180 would be invisible. A confirm run
  should consider a longer cap if the guardrail is tight — here
  it was not (diff 3 days).
- Tile-share at a sample is necessary, not sufficient, for a
  fight (detail-grid coincidence + stance escalation are a second
  layer). GO (1) proves routing, not combat — this report does
  not claim "titans now fought" from shares alone; the 2 FOUGHT
  records are claimed separately, from the instrument.
- The pilot's fresh seeds locate late (days 61–92) and several
  runs end within days of location (97327: same day; 97318: next
  day). Late location + early win compresses the routing window
  structurally. A future pilot should consider seeds selected for
  window length (locate day + run length), not just location —
  but that selection rule must be pre-registered before screening,
  not fitted to this pilot's misses.
- Baseline raid-share rate (43% of located seeds) means future
  "routing vs baseline" bars must keep the baseline-zero
  conditioning from the addendum, or they will measure accidents.
- The one-call rule and the no-commit-own rule are prototype
  limits, not game laws. A follow-up that adds commit-own must
  pre-register its own trust/death accounting, since Haven blades
  can die (the 97301/97310 fights already cost 8–13 lives from
  allied blades alone).

## Commits (worktree branch sim-titanroute-a; coordinator merges --ff-only)

- 9fac2b492 — prereg (before any judged sim).
- 0dcf04430 — march+call policy prototype, driver, unit proof.
- b5a193e44 — prereg addendum (baseline-zero conditioning,
  before any arm run).
- eb59d271b — HP-field fix (health, not hp) + stub-shape regression
  pin. (Unit proof re-green after fix.)
- Evidence + per-seed JSON + probe script: committed with this
  report (see coordinator merge step — hashes below at commit time).

Report: ready to merge locally, pending ship. Do NOT push, do NOT
bump versions, do NOT verify live (ship loop owns deploys).
