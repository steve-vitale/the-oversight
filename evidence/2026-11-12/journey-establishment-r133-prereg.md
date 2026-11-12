# Journey leg ESTABLISHMENT — r133 pre-registration (2026-11-12, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118/r128/r131/r132
precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261112T0401Z` (scheduled Wed 2026-11-11 21:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `a0039d484` (journey-landing r127 landed).
Pre-flight deviations (LOUD):
- **Write-flap episode from ~03:59Z, still in progress at 04:12Z.** The
  pre-flight reaper's registry write failed with `PermissionError: [Errno 1]
  Operation not permitted` (atomic_write_json); `git update-ref
  refs/heads/probe HEAD` fails with `couldn't write
  '.../.git/refs/heads/probe.lock'`; a plain write probe into the same
  directory also fails (`printf: write error: Operation not permitted`,
  04:10Z) and leaves a 0-byte file behind (removed by hand). Probe-gated
  per the flap-response skill: registration is attempted only after
  FLAP_CLEAR (two consecutive 60s-apart passes). The lock file itself
  (goals hidden_files, a different directory) wrote fine at 04:01:32Z.
  r132's flap lasted ~15 min (18:46–19:01Z); this episode lasted ~56 min
  (03:59–04:55Z): a 30-probe loop (30s apart, 04:40–04:55Z) failed 30/30,
  then refs passed at 04:55:43Z and again at 04:56:09Z (FLAP_CLEAR, two
  consecutive passes + hash-object). Registration then took ~9 min
  (worktree add slow, heartbeat step hung and was killed — the registry
  entry was already active with heartbeat 04:56:49Z). The flap flickered
  back after registration: a `git update-ref` probe failed again at
  05:16Z while plain writes to scripts/ still worked, and a `sed -i`
  temp-file write failed with EPERM at 05:16Z (edits after that went
  through muse.edit). No copied binaries or manual ref edits were used.
  LOCK RECOVERY 05:41Z: the run's lock file was found DELETED (something
  — likely a liveness sweep acting on the worktree heartbeat, stale
  since 05:07:21Z — removed it while this run was alive) and the
  heartbeat + flap-probe background loops were found dead (a runtime
  event SIGTERM'd the FLAP_CLEAR watcher at ~05:41Z). The worktree,
  branch, and all files were verified intact; the lock was re-created
  at 05:42:33Z with the original run_id (2026-11-12T04:01:32Z) and the
  recovery timestamp, and both loops + the watcher were restarted.
- `git pull --ff-only` at run start: "Already up to date". Main tree clean;
  disk 40%.
**Lock:** created 04:01:32Z, run_id `2026-11-12T04:01:32Z`. Heartbeat loop
every 10 min once registered.

## Leg question (named by r132's metric review)
r132 judged the call-level cap NO-GO: it cuts the race but does not stop
it — Carmine the blacksmith (seed 2403) raced preserver 0→3 on 31 XP on
the AFTER panel because she preserves ~3 batches on the FIRST resolution
of most days. The fuel is units per day, not resolutions per day. The
next dial, named by r132: **a per-day UNIT cap on the preserver grant**
(only the first N batches' worth of XP per villager per day counts).
This run IS that question: cap the preserver grant at N units/day and see
whether the race stops without braking the entry rung.

## Diagnosis (code + r132 BEFORE panel cookLog, verified pre-run)
- Grant sites (game.js): `butcher` 1 unit per hunt kill (6847);
  `preserver` n units per rack resolution (7406, n = batches preserved);
  `cook` 1 unit per cook resolution, capped first-of-day (7506);
  `builder` 1 unit per mend resolution, capped first-of-day (7564).
  All through `grantFoodXpCredit` (6700: first 5 XP 1:1, then 1 XP per
  2 units, odd unit carried).
- **Unit-cap simulation from the r132 BEFORE panel** (cookLog fx deltas
  inverted to units per resolution through the grant math, ±1 unit
  ambiguity bounded by simulating both the low and high inversion;
  arrivals handled — Carmine/Layla/Ae-ri are not in the d1 snapshot, so
  their start is their first cookLog row's fxBefore/spec):
  - N=99 (no cap): pace03 2 (Carmine 37, Elena-2413 32), moves 11/16 —
    **reproduces r132's BEFORE exactly**, so the inversion is validated.
  - N=1: pace03 0, moves 10/16; top preserver Carmine 14 XP (skill 1).
  - **N=2: pace03 0 on BOTH inversion bounds, moves 11/16 (identical to
    BEFORE); top preserver Carmine 25 XP (skill 2), Kyle 15 (skill 2).**
  - N=3: pace03 0 (low) / 1 (high) — the verdict flips on inversion
    noise; N=3 is NOT a safe dial.
- **N=2 is pinned.** It stops the race on both bounds, leaves the entry
  rung byte-identical to the control (11/16 moves), and still lets the
  most dedicated daily preserver reach skill 2 — the ladder still rewards
  daily work. N=1 would cap the leg's best preserver at skill 1, the same
  top-braking failure mode as r127's flat halving (judged NO-GO). A
  pace03 under N=2 needs ~28 granting days at 2 units/day (30 XP = 55
  units); the r132 panel's max is 24 granting days (Carmine) — a 3.5-day
  margin, judged on this panel's own numbers, not assumed.
- **Butcher is NOT capped in this run:** pace03 0 on both r132 panels;
  capping it would brake the marginal movers for no measured gain
  (r127's flat-halving lesson).

## Fix (in the worktree, game.js preserver grant site only)
- **Preserver:** only the first **2 units** of preserver XP per villager
  per day count, tracked as `foodXpDay.preserverUnits` on the person
  record (same field family as the cook/builder caps, reset when the day
  rolls). A resolution preserving n batches grants
  `min(n, 2 - alreadyGrantedToday)` units' worth through
  `grantFoodXpCredit`; later batches that day still preserve food
  (pantry, deeds, practice/competence all unchanged) — only the
  specialist XP is capped. Keyed to the GRANT event (inside `if (n > 0)`),
  not the cook resolution: a first resolution that preserves nothing
  leaves the day's budget open. Fiction: the first two batches of the
  day teach; the rest is routine.
- **Butcher, cook, builder:** untouched. The rung (5/15/30) and
  askSpecialist (+1) UNCHANGED. No threshold, bar, price, or gate change
  (gating freeze 2026-10-27 stands).

## Bars (binding, §14 — no mid-run re-scoring)
- Q1a PRESERVER PACE03 (AFTER): GO iff preserver spec 0 at d1 → 3 at
  dEnd = 0 seeds. pace03 ≥ 1 on AFTER is a NO-GO: the unit cap doesn't
  stop the race; the next dial is named in metric review, never re-scored
  here. The fix lands ONLY if Q1a passes (r132's binding, carried).
- Q1b PRESERVER MOVES (AFTER): ≥6/16 seeds with a preserver spec
  0→positive move (r132 BEFORE: 11/16 — the cap brakes the top, not the
  entry).
- Q1c BUTCHER UNTOUCHED (AFTER): butcher moves within 2 of the BEFORE
  panel (r132 metric review: bar against the control, not a historical
  band — r132's BEFORE was 5/16, AFTER 4/16, and the ≥10 bar was
  band-wrong) AND butcher pace03 = 0. Guards the panel/driver, not the
  fix.
- Q1d COOK/BUILDER NO REGRESSION (AFTER): cook moves ≥10/16 seeds
  (r132: 15/16), builder moves ≥2/16 (r132: 3/16), cook+builder
  pace03 = 0.
- Q1e SPOTTER GUARD: foodXp['spotter'] total = 0 on the AFTER panel.
- BEFORE-VALIDITY (binding): the BEFORE panel must show preserver
  pace03 ≥ 1 — the race reproduces on this band+driver. If BEFORE
  shows 0, the question is UNTESTED on this band (fix stays unproven;
  panel reported, not GO).
- CAP CHECK (binding): max granted preserver UNITS per villager-day on
  AFTER ≤ 2 (read from the driver's new `fxPreserverUnitsBefore/After`
  cookLog fields); BEFORE must show >2 implied units on some
  villager-days (the mechanism's room, via the fx-delta inversion).
- Q2 INVITATIONS: (a) GAME OFFER — every invitation-owned menu offers
  betrayal:accept + betrayal:decline. (b) DRIVER ANSWER — ≥80% of
  offered invitations answered. Accept rate reported, not barred.
  0 invitations offered = no-data, report, do not pass or fail.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the panel convo
  files.
- M3 survival-42 ≥12/16; M4 0 starvation deaths ≥12/16 (r116 bars
  carried at full scale).

## Seeds, policy, horizon
Seeds: **fresh band 2501–2516** (see freshness below). Policy:
competent + withDelegate + HUNTSTAFF=2. Horizon 42d. BEFORE/AFTER pair on
the SAME band (§15 balanced panel): BEFORE driver on current master (fix
off), AFTER driver on the fixed tree (fix on).
Driver: `scripts/journey-establishment-r133-20261112.js` (r132 driver
clone — tag rename + seed band + one read-only addition: the cook wrap
also records `fxPreserverUnitsBefore/After` from the live
`foodXpDay.preserverUnits` field, null on the unfixed engine; the dEnd
foodXp fallback stays).
Analyzer: `scripts/analyze-journey-establishment-r133-20261112.py`
(r132 analyzer clone + unit-cap check + Q1c control-relative bar).
Proof test: `scripts/test-journey-establishment-r133-preserver-unitcap.js`
(proves the unit cap end to end on the live game: a 3-batch resolution
grants 2 units' worth; a second resolution the same day grants 0; next
day grants again; a 1-batch resolution grants 1; above-rung 2:1 math
unchanged; cook/butcher grants unaffected; det-gate: same driver fix-off
vs fix-on, 5d seed 2501 — funnel keys and practice snapshots identical
except foodXp preserver deltas).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 2501–2516**, verified fresh across ALL dated preregs:
  word-boundary grep (`\b25(0[1-9]|1[0-6])\b`) over
  `evidence/*/journey-*-prereg.md` + `evidence/*/sim-*-prereg.md` returns
  only line-number references (`hierarchy.js:2501,2547` in
  journey-scale-r113 + sim-bindingtrace-b preregs — code lines, never
  seeds); the broader prereg grep (`25(0[1-9]|1[0-6])\b`) returns only
  5-digit collisions (62501–62808 homeward bands, 92501–92504, 42501) and
  data values (seedNominalKcal 25120); filename search over evidence/ +
  goal hidden_files returns only substring collisions (`s12501`–`s12511`
  blockscreen corpora, case hashes containing 2502/2504/2509/2516) — no
  corpus file for seeds 2501–2516 exists.
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); 1801–1804 (r117
  pilot); 1901–1916 (r118 panel); 2001–2010 (landing r107–r115 bands);
  2101–2116 (r127 panel); 2201–2216 (r128 panel); 2301–2316 (r131 panel);
  2401–2416 (r132 panel); 100001–100008 (r129 deepening); 1200–1209
  (r127 fresh-band scan).

## Canon
docs/CANON.md + docs/PRESERVATION.md read at run start (this run).
PRESERVATION.md covers the smoking ladder (16 ticks, 0.95x known /
0.80x blind, 30d shelf) and the no-creation rules — the fix touches
only the PRACTICE CREDIT a rack resolution awards, not yields, shelf,
or time, so no canon rule is moved. No canon doc covers the specialist
ladder's grant rate — Q1 rests on code (`src/js/food.js` SPECIALTIES +
rung 5/15/30; `src/js/game.js` resolveOneAssignment grant sites) +
panel, not invented canon. docs/DIRECTIVES.md re-read (hard rule). No
gate/price/threshold change.

## People check
Read the held convos from the panel in full (same method as
r114–r118/r127/r128/r131/r132). Standing watch: the r132 people-check
items — "Something in them almost softens — then doesn't. Not yet."
(9×, rising); "They hear the warmth in it." (8×, rising); taken-kin
pod-dream closing sentence (9× in three wordings, kin details breaking
the mold); deflect pivot "Sorry — I shouldn't load that on you. What's
up?" (4×); field-teaching closer "Remember the leaf, the stem, the
smell — that's the whole of it." (3×); quiet-place walk outcome (1×);
gossip closer "Take it for what it's worth." (4×); **accept-then-back-out
(3rd instance: Gilberto 2404, sick — backing out reads as contradiction
because the line never says he's too ill to walk)**; **stitched
fragments (Heinrich 2414 gossip; "Funny thing: Honest."; "I hum one
note... when the dark comes when the fire gets loud.")**; **recap
stutter (Layla 2415: "We started on that visit, then got onto that
visit.")**. Note whether they recur; a fix is out of this run's prereg
scope unless the mechanism turns out to be the grant path (it is not —
the fix touches XP credit only). The accept-then-back-out and stitched
openings are conversation-flow defects to be fixed by a later run if
they recur. The spotter blank stands from r131 (a villager can stare at
the wild all day and learn nothing — "faster ID" is still a comment,
not an effect).

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The invite-answer rule reads the live trust map only.

## Pilot gate
4 seeds first (2501–2504), BOTH drivers, 42d. The pilot validates (a)
seeds run on both drivers; (b) practice snapshots present in census JSON
(d1/d14/d28/dEnd, non-null competence maps, specialist fields present,
dEnd foodXp fallback reading live values); (c) the cap fires on AFTER
(max 2 granted preserver units per villager-day; BEFORE shows >2 implied
units on at least one villager-day — the mechanism's room); (d) the AFTER
pilot shows preserver XP > 0 on ≥2/4 seeds AND no trajectory breakage
(deaths/pantry within a few of BEFORE on matched seeds); (e) convo files
written (4 held convos per driver); (f) the invite rule fires at least
once OR 0 invitations offered (either is a valid pilot outcome — the
rule is exercised by the proof test regardless). If the pilot shows 0
preserver work, document and stop — do not burn a full panel on a dead
question. On pilot GO, run seeds 2505–2516 the same way on both drivers.

## Telemetry
The live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416), rolled forward at r132 closeout. This
run's driver is the SAME regime on a fresh band, so guardrails should
stay quiet; any LOUD line is adjudicated as band noise vs real bug
BEFORE rolling the baseline forward. Run the telemetry check at closeout.

## Measurement-proof refresh (owed)
Still owed since r129. `scripts/balance-proof-update.js` takes a
retained real observer-neutral panel as its argument — it validates and
installs one, it does not generate one — and no fresh retained panel
exists yet (r132: sim-proofrefresh-b4's tree was removed by the
pre-flight reaper; its panel was not retained in evidence). This run
lands src/js (game.js grant site) — attempt the refresh at closeout if
a retained panel exists; if none exists, report it as still owed with
the reason, do not silently deepen the debt, and do not run a competing
panel in this lane.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
