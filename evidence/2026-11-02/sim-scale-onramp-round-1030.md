# Loop 1030Z round — scale-onramp: muster gap + creek detour, two arms

Run: fleshout-20261102T1030Z, axis scale-onramp (converging, NOT
converged). Claim written before any sims; deleted at closeout. Lock
deleted at closeout. Sibling trees/branches NOT touched (sibling Loop B
work — stepwalk-rcf, homext-abl, wilddeath-era trees — was live during
this run; master moved twice under us, both worker rebases clean, zero
file overlap, zero src/js changes in either arm). Rotation untouched
(convergence-directed axis work supersedes rotation; stands at 3).

Follow-up to Loop A 0915Z titanroute PILOT NO-GO (5/8 tile-share; calls
sounded but muster-gated; 97307 march refused 20/20). Both arms are
policy/instrument side only, zero src/js changes. No game change landed
in this round — both arms refine why deliberate titan routing stalls and
prove one stall is already passable. No titan canon doc exists in docs/
— stated, none invented.

## Pre-registration (coordinator level)

- Primary question: what blocks a sounded titan call from becoming a
  fight — the muster count, or the march to the lair?
- Arms pre-registered separately by each worker before any judged sim
  (prereg commits 38924e187 and e4f483c01, both before their sims).
- Horizon: DAYS=180, death-aware (dead villages stop; +10d tail max in
  the harness convention). Seeds: titanroute pilot seeds + a
  creek-confirmed pilot set (see each arm's evidence).
- Metric binding (§14): each arm is judged against its own header; the
  wall regression reported under creekdetour is NOT re-scored into its
  routing GO, and the mustergap commit-own side-effect is NOT claimed
  as a titan victory.

## Arm sim-mustergap-b — DIAG-GO

Policy/instrument only. Proof scripts/test-mustergap-b.js 17/17 green
(re-green on the rebased tip), asserting 0 monster-roster, allied-roster,
and link-list reads by the policy.

Correction to the brief's shorthand: only 3 of the 5 sounded calls
stopped at 6 blades. Two met the gate and fought (97301: 10, lost;
97310: 11, herald slain, wave 5). The route arm reproduces the
titanroute pilot exactly on all 5 seeds, so the audit's baseline is the
pilot itself.

Gate math, read from code: unique living allied blades + unique valid
Haven blades (cap 3, only via two-tap titanCommitOwn) >= 10. Per link:
refuse iff trust < 25, opinion < -10, or arrears > 0; else quota 6 iff
trust >= 70 and opinion >= 10, else 2; capped by free living adults.
All 5 seeds have exactly 3 active links — no fourth linked village
exists anywhere in this pilot.

Per-call composition (minAllies 10):

| Seed | Allied blades | Haven volunteers at call | Total | Outcome |
|---|---|---|---|---|
| 97301 | Thornfield 6 + Ashford 2 + Emberhold 2 | 0 | 10 | Fought d60, lost, muster spent |
| 97310 | Emberhold 3 + Stonebridge 4 + Thornfield 4 | 2 (unused) | 11 | Fought d85, HERALD SLAIN, wave 5 |
| 97330 | Emberhold 2 + Stonebridge 2 + Thornfield 2 | 3 | 6 | 7 MUSTER-GATE refusals |
| 97338 | Thornfield 6; Emberhold REFUSES (arrears 8628); Stonebridge REFUSES (arrears 7000) | 3 | 6 | 72 MUSTER-GATE refusals |
| 97342 | Emberhold 2 + Stonebridge 2 + Thornfield 2 | 0 | 6 | 0 attempts; village-lost d64 |

The closing lever, and the only single lever closing 3/3: deepen ONE
link to trusted-and-current before the call, through ordinary
trade/aid/tribute flows the village already has (perception-lawful, no
roster reads). 97330: Emberhold trust 55 -> 70 gives 6+2+2 = 10.
97338: Stonebridge arrears 7000 paid + trust 66 -> 70 gives 6+6 = 12
(arrears alone + Haven 3 = 11 is the cheaper variant). 97342:
Stonebridge trust 64 -> 70 gives 6+2+2 = 10 — its only single-lever
closer, since Haven has 0 volunteers and a fourth base-quota link
would give only 8. A fourth link is not the closer anywhere: 8 without
Haven, 11 with Haven only where volunteers exist. Re-calling adds
zero: already-marching faces are excluded.

Commit-own prototype, measured button-faithfully (one commit episode
on call day, tap + confirm in the same daily): 97330 -> 9 ("counts 9
blades ... needs 10"), 97338 -> 9, 97342 -> 6 ("No one is free to
march"), idle on the two met calls. Commit-own closes the fight gate
on ZERO seeds — it is support, not the closer. Honest caveat: 97330
gap2 flips to won/table via the table (herald never fought, +16
deaths) — a trajectory side-effect with unisolated mechanism, not a
titan victory; 97338's national flip under gap1 did not reproduce
under gap2.

Gap1 finding (preserved, not hidden): the two-tap confirm re-keys
pending to the exact volunteer set on every call, so one-tap-per-daily
stutters (97338 gap1 took 13 days to commit 1 blade; 97330 took 3
confirms over 4 days). A delayed second tap silently restarts the
offer with different names — a UX question for the voice/UX queue.
Also documented: the MUSTER-GATE refusal line counts allies only
(code-read, titans.js), so it says "you have 6" when the coalition
counts 9; committed blades attritting without a fight (97330 gap1:
3 -> 1 -> 0, mechanism unisolated); trust bleeding while standing
short (97330: 55 -> 43 in two days).

Verdict DIAG-GO: both prereg bars met (composition + shortfall named
for 5/5 calls, exceeding the >=4/5 bar; one concrete
perception-lawful lever named).

Evidence: evidence/2026-11-02/sim-mustergap-b.md (+ prereg and
addendum), per-seed records under
evidence/2026-11-02/perseed-mustergap-b/.

## Arm sim-creekdetour-b — PILOT GO

Policy/instrument only. Proof scripts/test-creekdetour-b.js 31/31
green (re-verified after the final commit, and re-green on the
rebased tip).

Correction to titanroute-a (load-bearing): its evidence misattributes
the block. On 97307, (6,4) is wetland, not creek — the needsBridge
creek is (5,4). travelTo(6,4) returns {blockType:'creek', x:5, y:4}:
the block object names the INTERMEDIATE tile (travelTo's scan refuses
a jump if any tile on any shortest path is blocked), not the
destination. So travelBlockage(6,4) = null was correct, and a
travelBlockage-based BFS DOES route around — the "gate lives in
travelTo itself" framing is retired. No engine change needed or
proposed. Code: src/js/game.js travelTo intermediate scan +
travelBlockage creek rule.

Policy scripts/policies/creekdetour.js: BFS over entry-specific
travelBlockage edges, step-by-step d=1 hops that skip the intermediate
scan, refusal memory with re-plan, wood-gated bridge fallback,
swimmer lane. It reads only its own tile, offered steps, board
terrain, the heard lair (scouts' say line), own wood, and own swimmer
ability. It never reads worldMonsters() or a live herald position —
the unit proof audits this with a stub Game that has no worldMonsters
at all plus a call-spy allowing only {tileAt, travelBlockage,
travelTo, hasAbility, woodCount, buildBridge, say}.

Per-seed march results, before -> after (DAYS=180, identical seeds;
pilot = 97307 + first 7 confirmed cases in numeric order; 97619
confirmed reserve, not pooled; baseline = titanroute arm; detour =
same stack with creekdetour march + same sound-the-call-once rule;
reached = policy march record AND instrument daily-post sample agree,
no NO-DATA on any seed):

| Seed | Lair | Base marches/arrivals | Detour first arrival | Calls | Fights |
|---|---|---|---|---|---|
| 97307 | 7,4 | 20 / 0 | day 130, detour, (4,3)(5,3)(6,3)(7,3)(7,4) | 0 -> 1 (8 blades, short of 10) | 0 |
| 97396 | 6,4 | 22 / 0 | NO ARRIVAL — lair tile itself is a needsBridge creek + second creek (5,4); wood 0 on all 17 bridge-eligible days, run byte-identical to baseline | 0 -> 0 | 0 |
| 97422 | 7,4 | 63 / 0 | day 110, detour | 0 -> 1 (5 blades) | 0 (12 MUSTER-GATE refusals) |
| 97449 | 7,3 | 13 / 0 | day 96, swimmer (scholar has swimmer; provenance untraced) | 0 -> 1 (4 blades) | 0 |
| 97474 | 7,4 | 47 / 0 | day 63, detour | 0 -> 1 (16 blades) | FOUGHT day 64, HERALD SLAIN |
| 97489 | 8,4 | 4 / 0 | day 86, detour (8-hop south loop) | 0 -> 1 (12 blades) | 0 (herald never sampled on tile after arrival — arrival is not contact) |
| 97514 | 7,3 | 44 / 0 | day 133, detour (10-hop north loop) | 0 -> 1 (5 blades) | 0 (55 MUSTER-GATE refusals) |
| 97599 | 7,4 | 21 / 0 | day 60, detour | 0 -> 1 (10 blades) | FOUGHT day 61, LOST |

Totals: calls 0 -> 7, fought 0 -> 2, slain 0 -> 1. Baseline fought 0/8
seeds, so both fights are detour-caused. Guardrail passes (median
end-day 113.5 baseline -> 122.0 detour, diff 8.5 < 20). GO holds on
pure-detour count alone (6/8), so the one swimmer-assisted arrival
does not carry it. Verdict PILOT GO (bar was 97307 reached + >=6/8).

Honest caveats (all in the arm evidence): wall metrics REGRESS on
this pilot — national 5/8 -> 2/8, table 7/8 -> 5/8, won 7/8 -> 4/8,
wave-5 1/8 -> 1/8 (97474, pre-existing under baseline). 4/7 called
seeds flip to village-lost vs surviving/winning baselines, with
deaths flat on two of them — the call's standing cost, mechanism
unisolated, is now the named bottleneck (muster completion: 4/7 calls
drew <10 blades). GO is the pre-registered routing bar; the wall
regression is reported, not re-scored into it. Legs unit-proven only:
refusal memory fired 0 times in the pilot (all BFS paths clean
first-try) and bridge success fired 0 times (only the wood-starved
97396 attempt) — both need sims before being claimed in play.
Screening deviations, disclosed: full-run screening of 97350–97389
found 0 cases (creek blocks are rare unfiltered), so nomination was
accelerated with a map-gen-only geometry screen (300 seeds,
97390–97689; validated: 97307 flags, arrived seeds don't) and the case
rule was narrowed to creek-confirmed (prereg rule + needsBridge creek
on the home -> lair corridor). No seed changed status because of
this — first 22 full screens yielded 0 cases under either rule, and
all 9 confirmed cases satisfy both rules. Full ledger committed.

Evidence: evidence/2026-11-02/sim-creekdetour-b.md (+ prereg),
per-seed records + screening ledger under
evidence/2026-11-02/perseed-creekdetour-b/.

## Village assessment (plain words)

The village can now walk to the titan's lair and sound the call — the
road was never actually blocked, only the shortcut was. What still
stops the fight is people, not terrain: a sounded call needs 10
blades, and most villages can only raise 6 from their friends unless
one friendship is deep and paid-up. Sending the call before that
friendship is ready can cost the village its standing and, on this
pilot, its life — so the next job is not more routing, it is getting
one link trusted-and-current before calling, and tracing what the
call itself costs. Villagers otherwise behaved as the pilot recorded:
no new robotic/static dialogue flagged in these arms (transcripts
were read in the titanroute pilot; these arms are instrument/policy
and add no new dialogue claims).

## Wall numbers this round

No fresh full wall sweep was run (both arms are follow-up pilots on
the titanroute pilot seeds, not a new baseline band). Wall figures
that changed, on the creekdetour pilot band only: national 5/8 ->
2/8, table 7/8 -> 5/8, won 7/8 -> 4/8, wave-5 unlocked 1/8 -> 1/8
(pre-existing 97474), wave-5 fought 1/8 via the two detour-caused
fights (97474 slain, 97599 lost) — note: these are herald fights on
the titan route, counted here as fought, not as "wave 5 fought in
normal play" (the maxwave5-a distinction stands: unlock vs spawn vs
fight is still the language for the arrearsscreen band). Full seat 0
in both arms. Median survival: creekdetour guardrail 113.5 -> 122.0
days on its pilot band; mustergap median not re-measured (route arm
reproduces the pilot exactly).

## Blanks filled / documented

- Filled (diagnosis): muster composition per call + the single
  trusted-link lever that closes 3/3 gaps; commit-own proven support,
  not closer.
- Filled (routing): creek block re-attributed (intermediate tile,
  not destination); BFS detour policy proven 7/8 (6 pure detour).
- Documented, not built: muster completion prototype (deepen one link
  pre-call, then measure the trusted-link close) — now the top
  follow-up; two-creek walls + wood gathering (97396); bridge-success
  and refusal-memory sims; call standing-cost trace; 97489-style
  no-contact arrivals; detour-walk narration line; blocked-then-
  arrived mechanism (97369, 97409). Confirm (12–16 seeds) owed on a
  follow-up arm, not run here.
- Findings backlog: no new sim-findings.md item added this run — the
  follow-ups above are recorded here and in the arm evidence; the
  next arm's prereg should claim the muster-completion prototype
  from this list.

## Metric review

- Creekdetour screening rule narrowed mid-run (geometry screen after
  0/40 full screens) — disclosed with validation, no seed status
  changed; next run should pre-register the geometry screen as the
  primary nomination method for rare-block cases instead of
  discovering it mid-run.
- Balanced panel compare .md NOT attached for either arm (same
  limitation as titanroute: panel registry has no titanroute /
  mustergap / creekdetour policies; instrumented driver records are
  the measurement). Adding prototype policies to the panel registry
  remains tooling work for a separate arm.
- Wall-metric language: herald fights caused by detour routing are
  reported as fought here and must not be folded into the
  "wave 5 fought in normal play" count without the maxwave5-a
  spawn/fight distinction.

## Convergence state

scale-onramp: converging, NOT converged. The march block is solved
in policy; the muster block has a named single lever but no measured
prototype yet; full seat 0, wave 5 fought in normal play 0 (outside
this route pilot). Next blank: muster-completion prototype (deepen
one link pre-call).

## Commits (merged locally, pending ship)

- sim-mustergap-b (rebased onto cee4041c3, proof re-green): prereg
  d16d8bf93, prototype 6679f3df1, driver 3a00aa75f, gap2
  b38d76b47, evidence a0608ed09.
- sim-creekdetour-b (rebased onto c5da437cd, proof re-green):
  prereg 0aea48c40, policy 0d4fc935c, evidence e5f1678b5,
  hash-fill 40bc4004a.
- Coordinator evidence: this file (committed on master as the
  round's closeout, following the 0915Z/0933Z coordinator precedent;
  no push, no version bump — the ship loop owns deploys).

No [needs-eyes] in either arm (no feel/combat/UI change; policy and
instrument only).
