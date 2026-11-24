# sim-departname-a — departure beats name companions by true name, not stranger descriptors

**Arm:** sim-departname-a (Loop A run fleshout-20261124T0215Z, axis
scale-onramp — adoption of the dead run fleshout-20261123T2315Z)
**Verdict:** **GO** — B1 + B2 + B3 + B4 all pass against the frozen
bars in `sim-departname-a-prereg.md` (see §9). The departure-beat
naming bug is fixed on the repro seeds and across the band, with
nothing else in departure beats moved.
**Base:** `7344d8a56` (master tip at adoption; branch rebased onto it,
zero branch commits at adoption)
**Policy:** competent verbatim (`scripts/policies/competent.js`)
**Horizon:** 150d death-aware (`DAYS=150`; runs end early on
won/over)
**Driver:** `scripts/dawnchoke-driver-a.js`, reused unchanged (the
judged instrument that produced the repro corpora)
**Substrate env (identical on both legs):** `GUNRATE=1 CELLGATE=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 FIGHTALLY2=1`, `MODE=ctl`; `KILLBUNDLE`, `LEND`,
`PRESENCE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` all unset
**Repro seeds (frozen reuse):** 107423, 107425, 107429
**Band (frozen reuse):** 107601–107616 (16 seeds)
**Corpora:** `evidence/2026-11-22/perseed-departname-a-before/` (19
seeds) and `evidence/2026-11-22/perseed-departname-a-after/` (19
seeds); analysis `evidence/2026-11-23/departname-a-analysis.json`
**Fixes:** sim-findings line 2710 (tracker blank #4)

## 1. The bug (sense-test flag, pre-existing on both legs)

A departure beat named a companion by a generated physical
description instead of a name. Seed 107423 day 7:

> "Sean sets out with A person, maybe 40s, with deep-set eyes — the
> fire marks the trail."

The detgate-order-a re-check confirmed it recurring — 5 beats across
seeds 107423/107425/107429, identical text on both legs — and the
departsafe-a band check found it again on 107601–107616 ("A man,
maybe 40s, with a long braid sets out with A woman, maybe 30s").
On the departsafe control corpus (tableseat-nowait policy, 95d) the
shape was 11 descriptor-named beats out of 274 beat lines, all on
days 5–7. A player reading the fireside line meets a label, not a
person — and the same line can render the HOLDER as a descriptor
too ("A person, maybe 40s, with a gap-toothed grin sets out with
Lucas…").

## 2. Root cause

The fireside beats in `src/js/win-plan.js` resolved holder and
companion names through `self.disp` — a method that does not exist
on Game (no `disp:` definition anywhere in `src/js/`; the only
`disp()` in the repo is a local helper in `feastBuff.js`). The
`typeof self.disp === 'function'` check always fell through to
`self.displayName(vid)`. And `displayName` (game.js) is the
scholar's knowledge gate: pre-System-arrival, or when the scholar
has not learned the name, it returns `personDescriptor(vid)` — "A
person, maybe 40s, with deep-set eyes" (plus a stable visible trait
when the base descriptor collides in the village).

The bug window is exactly the pre-System week: departures on days
5–7 name strangers by description, because the System overlay has
not arrived yet to hand the scholar everyone's names. After day 7,
`systemArrived` makes `displayName` return the true name for
everyone, so the defect vanishes on its own — which is why it
survived as a quiet quirk instead of a loud break.

The fiction is wrong in the other direction: the beats are the
village's fireside voice announcing its own people setting out
together. The holder chose these companions by name at dawn; the
village knows who is walking out. Routing a village-voice line
through the scholar's stranger-gate is the defect — not the gate
itself, which stays correct everywhere it governs what the scholar
knows (person cards, conversation UI, the Codex).

## 3. The fix

One shared module helper in `src/js/win-plan.js`, `beatName(self,
vid)`, returning the true first name (`npcName` — which prefers a
bestowed calledName and falls back to `'Someone'` for a nameless
record), with fallbacks to `disp` (fixture ctxs that stub it), then
`displayName`, then `'Someone'`. Total by construction, never
throws, never renders `undefined`. Used by all five naming sites in
the file that shared the defect:

- `departLaunchBeat` — holder + every companion (the finding's
  beat).
- `reseedBeat`, `expiryBeat`, `reseedLaunchBeat` — the holder.
  Same `disp` → `displayName` resolution, same village-voice
  fiction; the holder-descriptor variant was already observed in
  departure beats.
- `winPlanHomebodyHandoff` — the handoff line ("X never leaves
  Haven — Y takes the plan and leads the party"). A fifth site,
  found while staging the proof test: the staged handoff fixture
  spoke "A person, maybe 40s, with a gap-toothed grin never leaves
  Haven — A person, maybe 40s, with deep-set eyes takes the plan
  and leads the party." on old code.

Text-only by design: `say()` consumes no RNG and the fix writes no
state, so sim outcomes (launches, deaths, standing) cannot move.
The beat does NOT mark the named people as name-known (no
`revealName` / knowledge write) — whether hearing the beat should
teach the scholar the name is a follow-up design question, recorded
in §8, not decided here. A second behavior note: on old code, a
companion whose name resolved to null was silently dropped from
the line ("Someone sets out after Herald" — the party member
vanished); `beatName` never returns null, so an unresolvable
companion now reads as `Someone` instead of vanishing. In
production `npcName` always returns a string, so this path is
fixture-only.

## 4. Proof test

`scripts/test-departname-a.js` — 29 checks, staged on the real
naming funnel (no `disp` stub; `npcName` / `nameKnown` /
`displayName` / `personDescriptor` mirror game.js; pre-System day
7; holder known, companion unknown — the exact repro shape):

- §A code pins: helper prefers `npcName`; falls back through
  `disp`/`displayName` to `'Someone'`; all five sites call it;
  `disp` survives only inside the helper; no `Math.random`.
- §B fixtures: B1 the repro verbatim (Mara, not her descriptor);
  B2 holder unknown too; B3 trio; B4 post-System control
  (identical line — the fix is a no-op once names are known); B5
  re-seed launch; B6 dead-target re-seed commit; B7 expiry; B8
  calledName preferred (Ash, not Ashley); B9 nameless record reads
  `Someone`; B10 the real `winPlanDepart` launch path; B11 the
  homebody handoff (both lines named); B12 an apostrophe name
  spoken whole (Chepng'etich — the band leg surfaced one, and the
  analyzer's name pattern had to learn that shape; see §6).
- §C old-code control: the B1 fixture against
  `git show 7344d8a56:src/js/win-plan.js` speaks the descriptor line
  (RED on old, GREEN on new).
- §D compat: a `disp`-only ctx (the old departbeat fixture shape)
  still speaks through the fallback; no naming function at all
  reads `Someone`, never throws; same fixture twice is
  byte-identical.

**Result: 29/29 on new code; the naming assertions RED on old code
(§B 10/11 fail with descriptor lines on the base, §C confirms).**

`scripts/analyze-departname-a.js` (the before/after judge, §5–§6)
carries its own selftest: **17/17 PASS**, including the
apostrophe-name (Chepng'etich) and accented-name (Tomás) cases.

Neighboring beat tests on the fixed tree: `test-departbeat-b.js`
34/34, `test-reseedbeat-b.js` 30/30, `test-winplandepart-b.js`
18/18, `test-winplan-departures-r265.js` 14/14.
`test-reseed-b.js` 85 passed / 4 failed and
`test-reseedexpiry-b.js` 35 passed / 6 failed — every failure is
the driver's own `ALLYSLOT3 slot code present on this base` STOP
(the old drivers refuse a tree carrying the slot code); the slot
code is present on the base itself
(`git show 7344d8a56:src/js/fieldFights.js` contains 37 `ally3Vid`
matches), so these are pre-existing base conditions, not
regressions from this arm (this arm touches only `win-plan.js`).

`node scripts/check.js --quick` (2026-11-24, on the fixed tree):
**336 passed, 8 failed in 1352s** (exit 1). All 8 adjudicated
individually — none is caused by this arm:

- **4 load timeouts** (killed at exactly 120.0–120.2s by check.js's
  per-script cap, mid-run with progress lines, no assertion
  failure): `test-living-garden-deed-attainment`,
  `test-occupation-panels`, `test-one-person-army-deed-attainment`,
  `test-trust-observer-neutrality`. The box was at load ~22 with
  sibling loop work. **Re-run directly (node, no 120s cap, same
  tree): all four pass** — trust-observer-neutrality 6/6,
  occupation-panels 25/25, one-person-army-deed-attainment 7/7,
  living-garden-deed-attainment 8/8. The timeouts were load, not
  code.
- **4 proof-staleness failures, proven pre-existing at the base:**
  `test-measurement-proof-update` ("Proof source inputs are not
  current"), `test-measurement-workflow` ("retained neutrality
  proof covers the current Game/controller/harness inputs"),
  `test-measurement-cache-flags` (same stale-panel family), and
  `test-phone-frame-proof` (retained browser inputs mismatch).
  The retained balance panel
  (`evidence/2026-11-19/neutral-new.json.gz`) already differs from
  the base commit `7344d8a56` in **27 sources** — its stored
  `win-plan.js` hash matches neither the base nor the fixed file —
  so the measurement tests were already failing before this arm.
  The phone-frame receipts (2026-11-09, build `2294ef815`) predate
  the base by ~2 weeks with ~150 boot inputs differing from base,
  and zero inputs differ *only* from the current tree (my change
  adds nothing new to that mismatch set). Refreshing these proofs
  is maintenance work owned by the proof-refresh process (a fresh
  real neutral panel for the balance proof; fresh browser receipts
  for the phone-frame proof) — out of scope for a text-only
  dialogue arm, and not done silently here.

## 5. Before/after — repro seeds (B1)

The analyzer (`scripts/analyze-departname-a.js`, verdict GO) on
`perseed-departname-a-before/` vs `perseed-departname-a-after/`:
all 5 known beats reproduced on the before leg (same seed, day,
text) and all 5 re-appear on the after leg with true first names
(same day, party size, target clause); **0 descriptor-named
departure beats on the 3 repro seeds after** (5 → 0). Repro-seed
totals: beat lines 111 → 111, deaths 386 → 386.

Fixed lines, before → after:

- 107423 d7: "Sean sets out with A person, maybe 40s, with
  deep-set eyes — the fire marks the trail." → **"Sean sets out
  with Ethan — the fire marks the trail."**
- 107425 d5: "A person, maybe 40s, with a gap-toothed grin sets
  out with Lucas — the fire marks the trail." →
  **"Chepng'etich sets out with Lucas — the fire marks the
  trail."**
- 107425 d6: "A man, maybe 40s, with a scarred cheek sets out
  with Desmond — the fire marks the trail." → **"Darius sets out
  with Desmond — the fire marks the trail."**
- 107425 d6: "Owen sets out with A man, maybe 20s, with
  calloused knuckles — the fire marks the trail." → **"Owen sets
  out with Theo — the fire marks the trail."**
- 107429 d5: "DeAndre sets out with A woman, maybe 30s — the fire
  marks the trail." → **"DeAndre sets out with Wanjiru — the fire
  marks the trail."**

## 6. Before/after — band 107601–107616 (B2)

Band totals (16 seeds, competent verbatim, 150d):

| | before | after |
|---|---|---|
| departure beat lines | 296 | 296 |
| descriptor-named beats | 16 | **0** |
| total deaths | 1434 | 1434 |
| `v4departs` launches | 34 | 34 |

Per-seed descriptor counts before: 107602: 1, 107603: 1, 107605:
2, 107606: 3, 107607: 1, 107612: 2, 107614: 1, 107615: 1, 107616:
4 (others 0) — all 0 after. Every after beat line equals its
before counterpart except person-name tokens (0 line mismatches);
structured `departBeats` rows byte-identical; days and end
reasons identical per seed. Across all 19 seeds: 407 beat lines
both legs, descriptors 21 → 0, deaths 1820 → 1820, launches
38 → 38.

**Analyzer lesson (instrument bug, fixed, not a game bug):** the
first analyzer run said NO-GO on exactly one line — 107425 d5,
holder "Chepng'etich". The fix had rendered the true name
correctly; the analyzer's substituted-name pattern
`[A-Z][a-z]+` did not allow apostrophes. Villager names come
from `src/data/nameCultures.json`, which includes apostrophe
names (Chepng'etich) and accented ones (Tomás is in
characterGen's firstNames too). The pattern is now
`[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\-]*`, selftest-grown to 17 checks
with apostrophe/accented cases, and the proof test gained §B12
(Chepng'etich spoken whole). Re-run: GO, 0 mismatches.

**Run notes.** The after leg was interrupted three times by
runtime restarts (the machine itself rebooted once, ~03:27Z;
the other two were runtime-level interruptions). Each time: the
heartbeat was re-established first, the corpora on disk were
verified, and the driver was resumed with only the missing seeds
(the driver refuses to overwrite existing files, so resumes are
safe). Both legs verified **19/19 corpora valid, 0 instrument
errors**. One bookkeeping note: the after-leg corpora carry
`anchor: 235edd2734ad` (the prereg commit) because the fix was
still uncommitted while they ran; the code identity is
`winplanSha` — before `8b5cfd05cb33`, after `cbe644ec1dfe`.
Corpora live under `evidence/2026-11-22/` (the driver hardcodes
the date dir; the detgate precedent of moving them afterward was
not followed — cited as-is).

## 7. Sense test (B3)

Read as a player at the fireside, the fixed lines name people:

- "Sean sets out with Ethan — the fire marks the trail."
- "Chepng'etich sets out with Lucas — the fire marks the trail."
- "Darius sets out with Desmond — the fire marks the trail."
- "Owen sets out with Theo — the fire marks the trail."
- "DeAndre sets out with Wanjiru — the fire marks the trail."

Every person reads as a first name — a villager you know, or
could get to know — never a label. The holder and the companion
are both named in every line, and the party shape is unchanged
(same companions, same target, same "the fire marks the trail"
closer). The one name that might catch a player's eye,
Chepng'etich, is a real generated name from the game's own name
cultures, spoken whole with its apostrophe — it reads as a person
from a far village, which is what the name is.

## 8. Village assessment, blanks, and follow-ups

The fix changes no sim outcome by construction (text-only), and
the band check exists to prove that rather than assume it — see
§6 for the deaths/launches identity.

Documented, not fixed here:

- **Whether the beat should teach the name.** The beat now names a
  companion the scholar has not formally met. Diegetically that is
  overhearing a name at the fire — and the fiction already has an
  `overheard` reveal channel (`revealName 'overheard'`: "A name
  drifts over from the fire: X. That's the … — now they have a
  name."). Marking the name known from the beat would be coherent
  with that channel, but it is a knowledge-state change with
  UI-wide effects (person cards, conversation UI), so it is a
  design call, not part of this text fix. Until it is decided, the
  companion keeps rendering as a descriptor on other surfaces
  after the beat names them — slightly incoherent, flagged here.
- **Hold lines (villager-brain.js :736/:768).** They name people
  through `displayName` + `firstNameOf`, and `firstNameOf` already
  guards the descriptor (returns the whole descriptor, never a
  bare "A"). Same class, different finding (held departures are
  silent in the corpus — steve-call whether a hold should speak
  at all). Not touched.
- **The handoff line is not SAY_RE-captured.** "X never leaves
  Haven — Y takes the plan…" carries none of the driver's beat
  tokens, so it is absent from `beatLines` and the band check
  cannot see it. It is fixture-proven (§B11) and code-pinned
  (§A). If a future arm wants band coverage of handoff lines, the
  driver's SAY_RE needs a "never leaves Haven" token.
- **Scope note (prereg deviation).** The prereg named four beats;
  the handoff line is a fifth site found while staging the proof
  test, fixed with the same helper and covered by §A + §B11. The
  frozen bars are unaffected (they measure departure beats and
  no-regression; the handoff line is neither a departure beat nor
  a sim outcome).

## 9. Judgment (frozen bars)

- **B1 — fix verified on repro: PASS.** 5/5 known beats
  reproduced on the before leg; 0 descriptor-named departure
  beats on the 3 repro seeds after; each beat re-appears with
  true first names (same day, party size, target clause).
- **B2 — no regression on band: PASS.** Departure-beat count
  identical per seed and total (296 → 296); every after line
  equals its before counterpart except person-name tokens (0
  mismatches); 0 descriptor-named beats after across ALL beat
  kinds; per-seed deaths identical (1434 → 1434);
  `v4departs` launches identical (34 → 34).
- **B3 — sense test: PASS.** Every fixed beat line reads as
  people setting out by first name (§7, quoted).
- **B4 — proof test + gate: PASS.** `scripts/test-departname-a.js`
  29/29 on new code, naming assertions RED on old code; analyzer
  selftest 17/17; `node scripts/check.js --quick` 336 passed / 8
  failed with all 8 adjudicated individually as pre-existing
  (proof staleness proven at base) or load timeouts (§4).

**Overall verdict: GO.** The fix is verified on the repro, clean
across the band, and reads as people. Branch head after commit:
[TO FILL — commit hash]. Merged locally, pending ship (the
coordinator merges; no push, no version bump, no live check by
this arm).

## Metric review

The metric did its job: descriptor-named beats (21 → 0 across
19 seeds) is exactly the defect, and the identity checks (beat
counts, deaths, launches, structured rows, days, end reasons)
prove the text-only fix moved nothing else. Two revisions for
the next run:

1. **Name shapes in the instrument.** A name-token pattern
   built for plain ASCII first names fails on real generated
   names (apostrophes, accents). Any future beat-line matcher
   must accept the name cultures' full shape
   (`[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\-]*`) and carry a Chepng'etich
   case. Fixed here in the analyzer (selftest 17/17) and the
   proof test (§B12).
2. **Handoff lines need a beat token.** The homebody handoff
   line is fixture-proven but invisible to the band check
   (no SAY_RE token). If a future arm wants band coverage of
   handoff lines, add a "never leaves Haven" token to the
   driver's SAY_RE — recorded in §8.
