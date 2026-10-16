# sim-seatdefault — seat driver default-ON (flesh-out loop, 2026-10-15/16)

Run: fleshout-a-2026-10-15T... (sim-seatdefault). Axis: scale-onramp
(the WIN side of the wall). Canon: docs/CANON.md + docs/TABLE.md read
first; the seat/driver rules are engine + canon. Zero src/js changes —
policy only. The tracker's named next: flip the seat driver default ON.

## PRE-REGISTERED EVIDENCE HEADER (written BEFORE any sims — binding per docs/MEASUREMENT.md §14)

**Question:** the seatdrive layer (sim-seatdrive, 2026-10-15) is proven
(12/16 sittings, 12/16 wins armed vs 0/16 control) but ships
env-gated-default-OFF: `layerOn() = process.env.SEATDRIVE === '1'`.
Unset delegates byte-identically to the seatdrive-less stack, so every
sweep that forgets the flag measures the inert census stack. This run
flips the default ON: `layerOn() = process.env.SEATDRIVE !== '0'`;
unset (or any value except '0') drives the seat; SEATDRIVE='0' opts out
to the pure-delegation behavior. The file's header comment (COMPOSITION
paragraph) is updated to the new truth.

**Change:** scripts/policies/seatdrive.js only — `layerOn()` +
COMPOSITION paragraph + the two composed-policy desc strings. Zero
src/js.

**PRIMARY (binding):** determinism-equivalence — 8 fresh seeds
[181,292,403,514,625,736,847,958] x {leadfeast, belongfeast} x
{default-ON (env unset), explicit SEATDRIVE=1}: trajectories
byte-identical 16/16 (same seed, same road). GO = 16/16 identical.

**CO-PRIMARY (binding):** wall wins reproduce — full win-side substrate
(FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 +
WINPURSUIT=1 + WINDEFER=1), 180d death-aware, 8 fresh seeds above x
{leadfeast,belongfeast} x {driver default-ON (unset), seat-off
(SEATDRIVE=0)}. GO = default-ON wins >= 8/16 AND seat-off wins 0/16
(the explicit-ON number was 12-16/16 across three seed sets; the
own-control comparison is what binds).

**Guardrails (binding):** exiled 0; armed death modes a subset of
control's.

Both GO -> land the flip. Either miss -> revert the file byte-clean,
evidence-only commit. A miss is NO-GO, never re-scored mid-run.

**Proof:** scripts/test-seatdrive-20261015.js (updated in the same
commit — the old det-gate's "unset delegates byte-identically" is
REPLACED assertion-for-assertion by "(a) SEATDRIVE=0 delegates
byte-identically; (b) unset == explicit-ON". Nothing loosened.) RED→GREEN
on the layer gate:
- (a) SEATDRIVE=0 on identical seeds -> byte-identical trajectories to
  the old unset behavior (opt-out purity, 16/16 in the det-gate);
- (b) unset -> byte-identical to SEATDRIVE=1 on identical seeds (the
  PRIMARY, runnable in the proof);
- (c) composition still delegates cleanly (no driveSeat errors, ctx
  counters classify: sdGuardRefused / sdNoScholar / sdPreviewSeen split
  from attempts).
Fixture-level D1/D2 also updated: D1 is the SEATDRIVE=0 opt-out (RED:
no sitting), D2 explicit-ON (GREEN: seat taken), D2b unset ==
explicit-ON on the fixture.

## Results

**Proof** (scripts/test-seatdrive-20261015.js, updated in this commit):
31 pass, 0 fail (~27 min). Includes the updated det-gate: (a) opt-out
purity 16/16 byte-identical (SEATDRIVE=0 wrapped == unwrapped stack),
(b) PRIMARY default-ON equivalence 16/16 byte-identical (unset ==
explicit SEATDRIVE=1) on the fresh seeds [181,292,403,514,625,736,847,958]
x {leadfeast,belongfeast} x 60d. D1 opt-out RED (no sitting with
SEATDRIVE=0), D2 explicit-ON GREEN (seat taken, modal for the drain),
D2b unset == explicit-ON on the fixture, guards (exiled/joined/dead
scholar) classify cleanly, layerOn honesty pins the new truth.

**PRIMARY: GO** — 16/16 trajectories byte-identical (unset vs SEATDRIVE=1).

**CO-PRIMARY: GO** — full win-side substrate, 180d death-aware, 8 fresh
seeds x {leadfeast,belongfeast} x {default-ON (unset), seat-off
(SEATDRIVE=0)}, own control in the same sweep (scripts/sweep-seatdefault-20261016.js,
~18 min, SMOKE gate green):

| side | n | sittings | wins | national | table | wave≥4 | wave5 | exiled | medianSurv(all) |
|---|---|---|---|---|---|---|---|---|---|
| default-on | 16 | 13 | **13** | 12/16 | 13/16 | 14/16 | 3/16 | 0 | 90.0d |
| seatdrive-off | 16 | 0 | **0** | 12/16 | 13/16 | 14/16 | 7/16 | 0 | 113.5d |

GO needed default-on >= 8/16 AND seatdrive-off == 0/16. Got 13/16 and
0/16. The flipped default reproduces the explicit-ON win number (12-16/16
across the three earlier seed sets; 13/16 here).

Wins land at the day-90 floor (end=over-other, 12 at exactly d90, 1 at
d93, 1 at d117, 1 at d139 — the last two sat late, invitations firing
late). Each win shows sits=1, tableAnswers=5, and tableWaiting fired
first — the stack is sit → drain → modal answers → win, never a bare
sit.

**Guardrails: GO** — exiled 0/0. Armed (default-on) death modes with
n>=3: {villager combat, combat, expedition, monster, sickness, the
phoenix link} — all present in control's list; extra-vs-control = none.
Seat-off control dies late (village-lost 15/16, median 113.5d); the
driver converts the same villages into wins instead (13/16 over-other).
The two sides reach national/table at identical rates (12/16, 13/16) —
the driver changes the END of the story, not the scale numbers.

**Village assessment:** villages on both sides look like villages —
people fetch water, draw plant knowledge in the dirt, die in combat
(Benoit Lambert's day-87 death made Emberhold, Stonebridge and
Thornfield press tribute down to 1,266 kcal/week while the chair was
empty — the links are relationships, not numbers), set out to find
missing people, survive contests on camera with trauma. The three
default-on losses are honest deaths: two early starvation/village-lost
(d36, d44, no invitation ever fired — the driver never forces what the
game doesn't offer) and one d129 village-lost with table=0. No robotic
behavior observed; no villager frozen or repeating.

**Sense-read (SENSE-TESTING LAW):** leadfeast-default-on-s403 (wave-5
win, d90). The beats read: day 87 death + tribute pressure from linked
villages; day 88 STARVING warning while Nina teaches plantain in the
dirt; day 89 a televised contest ("The Wrong Map", won, +4 trauma);
day 90 the table is set, the seat taken, and the audit reads the run
back honestly — "a lesser seat — regional standing, waves 1–3 faced
(14/9/5), 5 contests survived, 3 crises weathered. The table does not
rise. It prices." The FEARED path plays with real content from the run
("the deer, the fire, the ones who came for you"), the ledger reads
"protected outnumber the killed; the food truth was shared", and the
light road plays to the win. The win is EARNED: the audit's numbers are
the sim's real state, the path follows from the moral ledger, and the
modal was drained answer by answer (tableAnswers=5). Not scripted.

## Metric review (§14)

The pre-registered metrics were binding and both hit GO with margin
(13/16 vs bar 8/16; 16/16 determinism). No metric proved wrong. One
observation for the NEXT run, not a re-score: wins cluster at the
day-90 win floor (12/16 at exactly d90) — the win-side substrate's
victories are gated by the invitation/winday timing, not by the driver's
own speed. If a future lever wants to probe *early* wins, it needs the
invitation clock, not the seat gate. The median-survival guardrail
letter-of-law (all-runs median 90.0d vs 113.5d) is structurally
confounded by wins truncating runs — the pre-registered precedent
(sim-seatdrive: matched non-winning pairs) applies; n=3 here, both
44.0d, equal.

## Wall numbers

Default-ON side (the stack as players will now experience it):
national 12/16, table 13/16, wins 13/16, wave-4+ unlocks 14/16, wave-5
unlocks 3/16, median survival 90.0d (win-truncated), exiled 0/16.
Control (seatdrive-off): national 12/16, table 13/16, wins 0/16, wave-5
7/16, median survival 113.5d. The scale wall (national 12/16 both
sides) holds — the driver ends runs at the table; it does not change
what scale villages reach.

Per-seed JSONs: evidence/2026-10-16/perseed-seatdefault/*.json (32).
Beat transcripts: evidence/2026-10-16/seatdefault-beats/*.json (32).
