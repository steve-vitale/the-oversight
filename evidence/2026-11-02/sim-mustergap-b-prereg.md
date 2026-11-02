# sim-mustergap-b PREREG (committed BEFORE any judged sim)

Run: fleshout-20261102T1030Z, arm sim-mustergap-b, axis scale-onramp.
Worktree branch: sim-mustergap-b. POLICY/INSTRUMENT ONLY — zero `src/js`
changes. Sibling trees/branches NOT touched. Tracker/claim/lock/rotation
files NOT touched (coordinator's).

## Question

Loop A 0915Z titanroute PILOT NO-GO (evidence/2026-11-02/sim-titanroute-a.md):
on 5 sounded-call pilot seeds (97301, 97310, 97330, 97338, 97342), the
sounded calls drew 10, 11, 6, 6, 6 allied blades against minAllies 10
(herald, src/data/titans.json). Two calls fought (97301 lost, 97310 won);
three stood refused MUSTER-GATE. This arm audits the gap: who counts
toward the muster, exactly where each call's blades came from, what
Haven blades and linked villages would add if committed/resolved, and
the exact shortfall composition per call.

## Canon read

- docs/CANON.md read. No titan canon doc exists in docs/ (same finding as
  titanroute); in-code sources src/js/titans.js + src/data/titans.json.
- Perception law (Steve 2026-10-28, per task brief + alignment record):
  villagers know who's around only through their own senses — no global
  roster or list-fed decision. Operative precedent: titanroute policy
  (heard lair line only; live monster position never read; unit proof
  asserting 0 roster reads). No dedicated perception-law canon doc was
  found (docs/PERCEPTION.md covers UI hints, not this law) — stated,
  none invented.
- Gate math (read from src/js/titans.js, not assumed):
  titanMusterReady = unique living allied blades + unique valid Haven
  blades >= def.minAllies (10 for herald). Per-link call math: refuse
  iff trust < 25 OR opinion < -10 OR arrears > 0 (trust -8 on refusal);
  else quota = 6 iff trust >= 70 AND opinion >= 10, else 2; contribution
  capped by free living adults. Haven blades join ONLY via the explicit
  two-tap titanCommitOwn, cap 3, and count toward the gate. The refusal
  line reports allies.length only (Haven blades not named in it).

## Primary metric + GO threshold (diagnosis arm)

GO iff ALL of:
  (a) the audit names the exact muster composition + shortfall for
      >= 4/5 sounded calls (per-link blades, refusals with reasons,
      Haven volunteers available at call time, link count);
  (b) it names ONE concrete, perception-lawful lever that closes the
      gap (measured via the commit-own prototype where applicable, or
      proved impossible within current mechanics with the mechanism
      cited).
Otherwise NO-GO / DIAG-NO-GO, honestly reported. A miss is NO-GO, never
re-scored against a friendlier metric mid-run (MEASUREMENT §14).

## Horizon + why

DAYS=180 cap, identical to the titanroute pilot, so before/after runs
are comparable seed-for-seed. Death-aware: runs end early on death/win
(runDays endReason); the cap truncates only post-window survival, as in
the pilot (its metric review notes the same limit). No fixed-200d
horizon is used as a target; 180 is the pilot's cap, kept for identity.

## Seeds + policies

Seeds (the 5 sounded-call pilot seeds, no others for judged numbers):
97301, 97310, 97330, 97338, 97342.
Baseline arm ("route"): titanroute pilot stack exactly (tribfloor
leadfeast + windefer + seatdrive + fullseat-diag + titanroute march/call,
flags FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1), re-run under the new audit driver for link/muster
snapshots the pilot records lack.
Arm ("gap"): route + scripts/policies/mustergap.js commit-own leg
(sound the call, then commit Haven blades while the sounded coalition
still stands and the gate is unmet; two-tap across two dailies).
Per-seed records: evidence/2026-11-02/perseed-mustergap-b/mg-{route,gap}-
s<seed>.json. Driver: scripts/mustergap-driver-20261102.js.

## Instrument / policy separation (perception law)

The DRIVER (instrument) MAY read link/muster/roster state to record the
audit snapshot (same dispensation as titanroute's tile-share instrument).
The POLICY (mustergap.js) may NOT read any monster roster, allied roster,
or link list: it decides only from (i) the heard lair/call lines, (ii)
its own tile, (iii) its own muster record via Game.titanMusterState /
Game.titanMusterReady (the coalition the village itself assembled, whose
answers were spoken aloud by name), and (iv) the player verb
Game.titanCommitOwn. Unit proof scripts/test-mustergap-b.js asserts 0
roster/monster/link reads by the policy (counters on stub functions),
plus commit-leg behavior cases.

## Sense-testing

Read the call/answer/refusal/commit lines per seed and judge meaning,
not just counts (SENSE-TESTING LAW): do refusals name real reasons, do
commit lines price the cost, does the refusal line misreport the count
(it names allies only)?

## Metric review (placeholder — filled in the evidence file)

- The 180 cap truncates post-window survival (pilot's note, inherited).
- titanCallReadiness exists in game code (sim-sumdeploy-a) but is NOT
  used by the policy: it is a player decision-point read, and this arm's
  commit leg keys off the gate itself instead. Whether a future policy
  may call it is a design question, recorded not decided here.
