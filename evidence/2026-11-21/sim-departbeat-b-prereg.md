# sim-departbeat-b — prereg (FROZEN before the armed leg)

**Arm:** sim-departbeat-b, Loop B adoption round
`fleshout-loop-b-20261121T2030Z` (winnability chain).
**Branch:** `sim-departbeat-b`, worktree
`~/workspace/worktrees/sim-departbeat-b`, base tip `bcc59bcd4`
(sim-d3refreeze2-b). **Date:** 2026-11-21.
**No re-score:** the bars below are frozen now. A miss is NO-GO —
never re-scored against a friendlier metric mid-run.

## 1. Finding + baseline (verified in the sources)

- On the 16-seed profilegate confirm band (106751–106766), ordinary
  wave-4+ party departures have **no fiction line — 0 launch-mention
  `vetSays` lines across all 16 ON files**
  (`evidence/2026-11-21/sim-profilegate-confirm-b.md` §10;
  re-confirmed in `evidence/2026-11-21/sim-winnability-round-1530.md`:
  "0 launch-mention `vetSays` lines across all 16 ON files").
- The re-seed launch DOES speak (sim-reseedbeat-b, finding #2632:
  "Amina is hunting Loud-Eyes now — the fire found a new trail."),
  but ordinary launches are silent. The holds, by contrast, ARE
  voiced (`villager-brain.js:736/:768`, homebody/holder voice) — do
  not re-file them as silent.
- Baseline for THIS band is re-measured by the control leg below
  (DEPARTBEAT=0), not assumed from the confirm band: control
  ordinary-beat lines must be 0, and control launches/deaths are
  the guardrail reference.

## 2. Canon check

- Read `docs/CANON.md` first. No canon doc covers fireside
  departure beats specifically (`docs/CONVERSATIONS.md` covers
  dialogue/talk/gossip UI and voice backends, not narration beats —
  grepped: no fireside/departure-beat rule). The voice model is the
  documented one in code: `winPlanReseedLaunchBeat(vid)` in
  `src/js/win-plan.js` (~line 964; documented ~lines 85, 493, 565,
  940) and the hold lines in `src/js/villager-brain.js:736/:768`
  (holder + companion + reason named, once per pair, fiction only).
  CANON.md's standing rule "No silent actions" supports speaking
  the launch. Nothing is invented from scratch: the beat mirrors
  the reseed beat's hook shape and dedup discipline.

## 3. Lever (design pinned by the dead run, verified in code)

**Default-ON departure beat for ordinary wave-4+ launches.**

- New `departLaunchBeat(self, vid, launched)` in `src/js/win-plan.js`
  (next to `reseedLaunchBeat`) + new method
  `winPlanDepartLaunchBeat(vid, launched)`:
  - Calls `winPlanReseedLaunchBeat(vid)` FIRST. If it speaks (a
    re-seed launch), the launch already has its beat — stamp the
    depart dedup and return, never a second line. Exactly one
    beat per launch, ordinary XOR re-seed.
  - Else, if the beat is off (`DEPARTBEAT=0`), or there is no plan,
    or `(plan.needWave|0) < 4`, return false, silent.
  - Dedup: `plan.departBeatDay` / `plan.departBeatTarget` stamped
    BEFORE speaking; a second call the same day for the same
    target is silent. A genuinely new launch (different day, or
    different target) speaks again — once per launch, never daily
    spam. (Belt-and-braces: the two departure paths are mutually
    exclusive per tick — `villager-agency.js:439` runs
    `vbrainExecuteDepart` and `continue`s when the brain owns dawn,
    so `winPlanDepart` never also runs that tick — but the stamp
    makes a double-fire impossible even if that ever changes.)
  - Wording (same voice as the reseed beat: holder + party +
    target as the village knows them, deterministic, no RNG):
    "`<Holder>` sets out with `<C1>` and `<C2>` after `<Target>` —
    the fire marks the trail." Solo launch (companion blocked,
    inviter still goes): "`<Holder>` sets out after `<Target>` —
    the fire marks the trail." No target on the plan: the
    "after `<Target>`" clause is dropped rather than invented.
    SYSTEM wrap after arrival, like the reseed beat.
    SAY_RE token: "marks the trail" (collides with nothing the
    game says — verified: no "marks the trail" in `src/js/`).
  - Fiction only: `say()` consumes no RNG and writes only the
    narration log. The only state writes are the two dedup fields
    on the holder's plan, read by nothing but this hook.
- Hook sites (replacing the two direct reseed-hook calls, which
  move inside the new method unchanged):
  - `winPlanDepart`'s `launchParty` (after `partyDepartures`,
    before `return true`), with the `launched` array.
  - `vbrainExecuteDepart`'s `party_launch` branch (before
    `return 'launch'`), with the `launched` array. This is the
    departure path that fires in sims.
- Gate: `departbeatOn()` = `process.env.DEPARTBEAT !== '0'`
  (default ON, matching the pinned design; the control leg sets
  `DEPARTBEAT=0`). All other `*On()` gates in `win-plan.js` are
  `=== '1'` default-OFF; this one is deliberately inverted per
  the pinned design. If code review showed default-ON would spam
  or misfire, the prereg would say so and propose the gated
  variant — it does not: the hook fires only after a real
  `startExpedition` + expedition-record check, once per launch
  by construction, and the stamp covers re-entry.

## 4. Primary metric + GO threshold (frozen)

Counting rule (analyzer `scripts/analyze-departbeat-b.js`):
launches are `v4departs` rows with `result 'launch'`,
`targetWave >= 4`, non-null target, deduped by (vid, day,
target) — the reseedexpiry survey's rule. A beat line is a
`vetSays` line matching the ordinary-beat regex
`/sets out .* — the fire marks the trail\./`; a re-seed beat
line matches `/is hunting .* now — the fire found a new trail\./`.
A launch is "beaten" if a beat line (ordinary XOR re-seed) for
the same holder falls on the launch day; a launch with 2+ beat
lines that day is spam.

- **B1 (primary):** armed ordinary-beat `vetSays` lines > 0 on
  the band, control = 0.
- **B2 (coverage / no-spam):** every armed wave-4+ launch
  carries exactly 1 beat line: launches with 0 beats = 0 AND
  launches with 2+ beats = 0. Floor: ≥ 4 wave-4+ launches on
  the band; below that the verdict is REPORTED / LOW-N, not GO.
- **B3 (guardrail — no regression_signal):** launches and
  village deaths identical armed vs control, per seed. The beat
  is fiction-only (say consumes no RNG; dedup fields are read
  by nothing), so identical-seed trajectories must not move. Any
  mismatch is a regression_signal → NO-GO, investigate before
  any re-judge.
- **Verdict GO iff B1 + B2 pass and B3 is clean.** Anything else
  is NO-GO (or REPORTED / LOW-N under the B2 floor).

## 5. Horizon + why

**150 days**, same as the reseed / reseedbeat / confirm bands.
Launches need time to accumulate: the confirm band saw 14
launches on 16 seeds (≈ 7 expected on 8 seeds, above the B2
floor of 4 with margin). A shorter horizon would risk LOW-N;
a longer one buys nothing for a fiction-only beat.

## 6. Seeds + freshness (verified before freezing)

**Band 106771–106778 (8 seeds).** Freshness search (skill
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):
- `grep -rl 106771…106778 --include="sim-*-prereg.md" evidence/`
  — empty (no prereg names any of them).
- `grep -rl "10677" --include="*.md" evidence/` — empty (no
  dated evidence .md names the band at all).
- `grep -rl "10677" --include="*.md" evidence/2026-11-2*/` —
  empty; no corpora dir `*10677*` under `evidence/`; no
  `106771` in `docs/`; no `10677` in goal `hidden_files/`
  (names only — a content grep there dumps multi-MB JSON lines).
- Neighbours: highest named below is 106751–106766 (confirm);
  the dead run verified this band fresh; this re-check confirms
  it. **Band 106771–106778 is FRESH.**

## 7. Policies + substrate (frozen)

- Policy: `competent` verbatim (`scripts/policies/competent.js`).
- Env flags on BOTH legs:
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 PLANRESEED=1` — the landed substrate of the
  reseedbeat observation band, plus PLANRESEED=1 so re-seed
  launches (the one case where the re-seed beat, not this beat,
  speaks) occur and the ordinary-XOR-reseed split is exercised
  live. No ALLYSLOT3, no LAUNCHSURVIVE (the departbeat driver
  inherits the reseedexpiry driver's STOP guards — landed
  substrate only).
- Legs differ ONLY by DEPARTBEAT: armed = unset (default-ON);
  control = `DEPARTBEAT=0`.
- Driver: `scripts/departbeat-driver-b.js` — a copy of
  `scripts/reseedexpiry-driver-b.js` with ONLY: header/arm
  strings, RUN/OUTDIR/MODE defaults (`departbeat`,
  `perseed-departbeat-b-106771-{armed,control}`,
  `evidence/2026-11-21/`), SAY_RE gains "marks the trail",
  `departbeatFlag` recorded per corpus file, MODE guard.
  All recorder logic (v4departs rows, vetSays capture, VF
  instrument, gate/rumor snapshots) byte-identical in behavior.
- Analyzer: `scripts/analyze-departbeat-b.js` (new, focused) +
  `--selftest` (its own proof; B1/B2/B3 rules above, incl. the
  per-launch beat join and the armed-vs-control equality check).
- Proof (before the pilot): `scripts/test-departbeat-b.js` —
  staged ordinary wave-4+ launch (exactly one beat line naming
  holder/party/target, both departure paths); re-seed launch
  still fires its own beat once, no double-beat; no beat on
  non-wave-4 launches; flag-off silent; old-code control
  (pre-change `win-plan.js`) launches silently. All green
  before the pilot runs.

## 8. What this arm does NOT do

No version bump, no push, no live verification, no merge to
master — the adoption coordinator merges. No re-judging of any
frozen bar. No change to launch mechanics, party formation,
damage, or costs: the lever is narration only.

## 9. CORRECTION 1 (2026-11-21, before the pilot — counting rule)

The §4 counting rule says launches are `v4departs` rows with
`result 'launch'`, `targetWave >= 4`, non-null target. Verified
against the driver wraps: the row's `targetWave` IS
`plan.needWave` (read after the call), so the rule is the beat's
domain (needWave >= 4) plus a target id. A launch with
needWave >= 4 but target null would still speak the beat (the
no-target form) while the rule excludes the launch — a beat line
on a day with no counted launch must therefore not auto-count as
spam. The analyzer cross-checks it: such a day is explained iff a
`v4departs` launch row exists that day with `targetWave >= 4` and
target null (a legitimate no-target beat); unexplained unmatched
beat days fail B2 as spam. Measured on the 16-seed confirm band:
281 launches, 70 targetWave>=4, 0 targetless — the case is a
diagnostic, not an expected shape. The staged proof (34/34)
already proves the per-launch holder/party/target naming, so the
analyzer counts by day rather than re-proving wording (vetSays
rows carry {day, line} only, no holder).
