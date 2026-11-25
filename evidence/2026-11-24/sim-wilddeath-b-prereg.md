# What actually kills a veteran "in the wild" — Loop B, run fleshout-loop-b-20261124T2230Z, arm sim-wilddeath-b (DIAG)

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm answers vetpair blank #2, filed in
sim-findings.md ("THE WILD KILLS 57% OF VETERANS AND SAYS
NOTHING"): on the standingconfirm band replayed 109310–109325 (16
seeds, 150d, competent), 12 of 21 dead wave-4+ killers die with the
cause string "the wild" — off-screen, no encounter, expedition leg,
or monster named.

Anchor: HEAD `b48b195db` (branch sim-wilddeath-b) at prereg time.
Instrument: the standing-gearready instrument
(`scripts/standing-gearready-b-instrument-20261124.js`) reused
VERBATIM as the base (daily snapshots, killEvents, deathEvents,
standing lines) PLUS a new wilddeath capture layer
(`scripts/wilddeath-b-instrument-20261124.js`): call-through wraps
on `playerDeath` and `registerDeath` that record, at death time,
the cause argument AS PASSED, a stack trace naming the call site,
the live `tbfight` (fighters, monster ids + waves, fight flags),
and the scholar's live context (departed, location, tile type,
insideTent, camp, pending encounter, day part, vitals) plus a
rolling say tail (last 8 lines). New driver
(`scripts/wilddeath-b-driver-20261124.js`, run `wilddeath-b`) and
new analyzer (`scripts/wilddeath-b-analyze-20261124.js`). Proof:
`scripts/test-wilddeath-b-20261124.js` (fixture attribution cases
+ live harness smoke + determinism replay leg), green BEFORE the
judged leg.

Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Horizon: 150 days, death-aware. Seeds: 109447–109462
(16) — a FRESH band on identical spec (16 seeds, 150d, competent
verbatim). Band freshness (local_seed_band_freshness skill):
searched all dated preregs under `evidence/` (`*.md`), all
`evidence/2026-11-24/*.md`, and the goal
`hidden_files/*.md` for 109447–109462 — zero hits. Nearest used
bands: 109439–109446 (departteach/holdspeak), 109411–109418
(retarget). The one 109448 hit anywhere in the repo is a kcal
total (`glutInflowTotal: 109448`) in an unrelated 2026-10-23 JSON,
not a seed. Balanced panel (§15): INAPPLICABLE — a census with no
before/after change; no comparison is fabricated. Roster rule
(§14c): satisfied by construction — the co-primary IS veteran
deaths; scholar deaths are recorded under the same census and
flagged `player:true` where the death tele says so.

## Corpus re-read verdict (why a fresh band, not a re-read)

The vetpair corpus CANNOT support attribution — established by
re-reading it before writing this prereg, not assumed:
- `deathEvents` rows carry only day/kind/who/cause/player. The
  12 "wild" veteran deaths are ALL `player:true` — every one is a
  SCHOLAR death (gen_ps9tn1q d89, gen_l59pl8j d82, devon_okafor
  d119, wanjiru_kamau d68, gen_2fleeyg d69, gen_wa9lzr8 d91,
  omar_farouk d138, gen_sb2h332 d92, owen_smith d128,
  gen_jwfuhpt d47, gen_up9q8vq d74, ava_garcia d149). No corpus
  field says what any of them was doing when they died.
- Daily snapshots carry no location, activity, expedition leg, or
  pending-encounter field for the scholar. `saySample` is
  SAY_RE-filtered (standing/release lines only) and capped at 200
  — it never quotes a death. `killEvents` name kills, not deaths.
- So the corpus knows WHEN veterans die and THAT they die
  off-screen, but no re-read can say WHAT kills them. A fresh
  band with an event-capture recorder is required. Do NOT claim
  attribution the old instrument cannot see.

## Prior art read first (the G recorder gap, vetattrition-a)

sim-vetattrition-a (2026-11-15) missed its 90% bar on exactly
this class of gap: its G-class recorder carried NO victim
identity on death rows, leaving 23/69 drops AMBIGUOUS and
unresolvable by any analyzer (sensitivity pass resolved 0/23).
This instrument does NOT repeat that failure: every death row
carries victim identity (vid + player flag) AND the call-site
stack AND the live fight context, captured at death time in the
driver — the analyzer never has to infer a victim from a
same-day death count. The settle-time TB-context pattern is
reused from sim-bloodcluster-b (which proved startCombat linkage
unreliable and settle-time `tbfight` reads reliable): `tbEnd`
clears `tbfight` in its `finally` block (game.js:48432), AFTER
the loss branch calls `playerDeath` (game.js:48334), so the live
fight is still readable inside the `playerDeath` wrapper.

## Code-level hypothesis (to TEST, not to assume)

A full read of every `playerDeath(` call site in `src/js/` before
this prereg gives the candidate map — the instrument proves or
refutes it per death:
- `game.js:48334` tbEnd('lost') → `playerDeath(tbFightDeathCause(f))`.
  `tbFightDeathCause` (game.js:47978) returns 'the wild' for a
  PROVEN wild fight: at least one monster fighter, no hostile
  (human/alien) fighter, none of the arena/betrayal/table-trial/
  coalition flags. This is the ONLY call site that can stamp a
  scholar death 'the wild' — every other caller passes a named
  cause ('contest', 'the expedition', 'the arena', 'your own pit
  trap', 'the phoenix link…', sickness/lockjaw/trembles) or a
  default that is NOT 'the wild' (`hurtVillager` → `cause ||
  'injuries'`; `encScholarDeathGate` → `cause || 'the hunt'`;
  overnight resolveDay → `res.killedBy || 'starvation'`).
- Non-scholar villagers cannot die 'the wild' through
  `hurtVillager` (its callers pass 'monster' / 'starvation' /
  'hunting' / 'experiment' / 'contest' / 'aid-runner') — but the
  `registerDeath` wrap is the backstop: if a fresh-band veteran
  death with cause 'the wild' has no `playerDeath` row, its stack
  names the path instead of the analyzer guessing.
- If the hypothesis holds, "the wild" is NOT exposure, NOT an
  expedition leg, NOT a wandering encounter: it is a LOST PLAYED
  FIELD FIGHT against a monster, and the monster can be named
  from the live `tbfight`. If any death's stack says otherwise,
  that death is the finding — the taxonomy below has a class for
  it, and the code map above is corrected in the evidence file,
  not silently re-scored.

## Definitions (frozen — no mid-run taxonomy drift)

- **Veteran (wave-4+ killer):** as vetpair — a roster member with
  a recorded wave-4+ kill in `state.waveKillLog` (deduped log
  rows only, never kill-event calls). **Blooding day** = day of
  the FIRST wave-4+ kill. A death row is a VETERAN death iff its
  victim has a wave-4+ kill with day <= death day.
- **Wild death:** any death row (tele 'death' event, kind
  person/villager) whose recorded cause string is exactly
  "the wild". The judged population is wild VETERAN deaths.
- **Attribution taxonomy (exactly one class per wild veteran
  death; the class is read off the captured stack + live
  context, never inferred from the cause string):**
  - `WILD-TB-FIGHT` — `playerDeath` stack contains `tbEnd`;
    live `tbfight` present with ≥1 monster fighter, no hostile
    fighter, no arena/betrayal/table-trial/coalition flag. The
    monster id(s) + wave(s) from the live fight are recorded.
  - `WILD-TB-OTHER` — `playerDeath` stack contains `tbEnd` but
    the live fight is NOT a proven wild fight (arena contest
    live, hostile fighter present, or `tbfight` already cleared
    when the wrapper ran — the stack still proves the site).
  - `WILD-DEFAULT` — `playerDeath` called with a falsy cause
    argument (the `cause || 'the wild'` default in ledger.js
    fired); the stack names the call site. Expected 0 per the
    code map — any occurrence is a finding, not an error.
  - `WILD-EXPLICIT` — `playerDeath` called with the literal
    string 'the wild'. No such caller exists in code; expected 0.
  - `WILD-NON-SCHOLAR` — a non-scholar veteran death with cause
    'the wild' and no `playerDeath` row; classified from its
    `registerDeath`-wrap stack + context.
  - `UNCLASSIFIED` — a wild veteran death with no `playerDeath`
    row AND no usable `registerDeath` row, or an unreadable
    stack. Any occurrence fails bar 1.
- **Determinism:** seed 109447 run twice on this anchor yields
  byte-identical wild-death attributions (same death rows, same
  classes, same monster ids). The replay file carries
  `-wilddeath-b-replay` in the RUN slot and is NOT pooled.
- **Wall numbers:** wins / national (scaleRank) / table,
  wave-4 faced, wave-5 unlocks / faced / kills, median survival
  (censored, reported as such) — reported every run, never
  judged.

## Substrate check (§14b — before the pilot leg)

Contact, pool, and horizon are verified WITHOUT spending the leg:
the vetpair corpus (same policy, same horizon, same anchor
family) blooded wave-4+ killers on 12/16 seeds and recorded 12
wild veteran deaths on 8 seeds — the phenomenon IS staged on
this substrate at ~0.75 wild veteran deaths per seed. Pool: a
16-seed fresh band at that rate yields ~12 wild veteran deaths
to attribute (pilot 8 → ~6). Horizon: vetpair deaths fall days
40–149, inside 150 days. Staging: pilot = seeds 109447–109454
(instrument fires, wild deaths captured with stacks, veteran
join works); confirm = 109455–109462. Both legs judged against
the SAME frozen bars below; the verdict is on the full 16.

## Pre-registration (binding, §11/§14) — FROZEN BARS

Judge ONLY against these bars. The wild-death COUNT is measured,
not judged: a band with 0 wild veteran deaths and complete
classification is the census succeeding with an empty population,
not failing (the pool check above says this is unlikely).
DIAG-GO requires ALL of:

1. **Classification completeness** — every "the wild" veteran
   death on the band carries exactly one taxonomy class;
   0 unclassified, 0 wild veteran deaths without a death row.
2. **Instrument health** — 0 instrument errors; 0 parse errors
   on all per-seed files; proof test green before the leg and
   re-run green on the merged tip; determinism replay leg
   byte-identical (seed 109447 twice).
3. **Dominant wild-killer named** — the largest taxonomy class
   is named with its count and share of wild veteran deaths, and
   every death in it carries its evidence (for WILD-TB-FIGHT:
   monster id + wave per death; for any other class: the stack
   site per death). A dominant class is named even if it is NOT
   the hypothesized one — the hypothesis does not bind the
   verdict.
4. **Veteran census reproduced** — every wave-4+ killer on the
   band carries exactly one terminal status (dead with a recorded
   cause / alive-at-end / departed with roster evidence), 0
   unclassified, so the wild-death denominator is honest (same
   bar as vetpair bar 1, re-proven on the fresh band).

Secondary rates (recorded, NOT judged — a move here is a
metric-review note, not a bar failure): wild share of all
veteran deaths; scholar vs non-scholar wild deaths; wave split
of TB-fight monsters; departed/location/day-part distribution of
wild deaths; wave-4+ kills per seed; wave-4 faced / wave-5
unlocks / faced / kills; wins / national / table; median
survival (censored).

## Sense-testing law

Death traces are read whole for at least 3 attributed veterans:
the stack site, the live fight (monsters, party present?), where
the scholar was (departed? tile? camp?), and the say tail around
the death, judged as a real sequence of events a person lived
through — not a label stuck on a string. Quoted in the evidence
file.

## Deliverables

- This prereg, committed BEFORE any judged sim.
- Per-seed JSONs under `evidence/2026-11-24/perseed-wilddeath-b/`
  (16 files, `-wilddeath-b` in the RUN slot, + 1 replay file NOT
  pooled).
- Evidence `evidence/2026-11-24/sim-wilddeath-b.md`: attribution
  table (per wild veteran death: seed, victim, blooding day,
  death day, class, monster id + wave where TB-fight, stack site,
  where-context, say tail), the dominant wild-killer with counts
  and coverage, the code-map verdict (hypothesis held / refuted,
  per death), sense-test of ≥3 death traces in plain words,
  scale-wall numbers, a "metric review" section (§14), next
  blanks, infrastructure section (write-flap windows, if any).
- New gap found outside this arm → append to
  `hidden_files/sim-findings.md` in its format; do not chase it.
  Do NOT touch the "correct the standingconfirm prose" item
  (vetpair blank #4) — coordinator call, not this arm.
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
- No second band / no confirm-of-confirm without coordinator
  say-so.
