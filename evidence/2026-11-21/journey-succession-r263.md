# Journey succession r263 — run note (2026-11-21)

- Run: r263, Lane B leg 7 SUCCESSION (EARLY_KILL_DAY=40, POST_DAYS=70)
- Run id: playtest-loop-2-20261121T1400Z (scheduled Sat 2026-11-21 14:00 CST)
- Base: local master `320165c5a` at registration
- Branch: `journey2-succession`, worktree `~/workspace/worktrees/journey2-succession`
- Rotation read `7` (succession); write `7→4` at closeout with read-back
- Policy: competent + succession driver (r262 fork + WIT-SIT v2)
- Seeds: FRESH BAND 34411–34416 + smoke 33998 (standing control)
- Prereg: `evidence/2026-11-21/journey-succession-r263-prereg.md` (this note
  adjudicates against it; metric binding applies — a miss is NO-GO, never
  re-scored mid-run)

## Pre-registration (from the prereg)

One arm: WIT-SIT v2 — the r262 metric review's prescribed next step.
r262 staged the first single-fresh witness sitting (Isabella/Cesar,
34403) but the pick drew the veteran variant; REL-WIT stayed
INSUFFICIENT-DATA at 1 draw < the 3-draw floor. This run stages MORE
sittings per seed: cap 2→4, and a second sitting for the same witnessed
death the next day with a different living witness (sitSeq 1|2). Bars:
STAGE, REL-WIT (floor 3), REL-BOND, REL-VET (floor 10 opener draws),
MOURN-TEMPLATE (with the preregistered double-stage-pair exemption),
MOURN-EXHAUST, MANTLE-FINE, DRY, WILD, C3d, CONTROLS (smoke matches
r233 exactly), F5 descriptive, CAP-NC descriptive.

## What happened: SUPPLY-ZERO — the instrument never fired

PANEL (driver `scripts/journey-succession-r263-20261121.js`, analyzer
`scripts/analyze-journey-succession-r263-20261121.js`, runner
`scripts/run-journey-succession-r263-panel.sh`): all 7 seeds exit 0,
analyzer exit 0. Panel ran 20:14–20:16Z (seeds ~17s each).

The fresh band produced ZERO witnessed person corpses: 29 person
corpses panel-wide, 0 with witnesses. WIT-SIT staged 0 sittings, 0
double-staged deaths, 0 exemptions. The v2 machinery (cap 4, second
sitting, sitSeq) is proven inert-when-absent, not proven in the wild —
it never got a death to stage on. The pilot (34411) already showed
this: 5 person corpses, 0 witnessed, no anomalies, exit 0.

The witness machinery itself works: EVERY monster corpse on the panel
carries witnesses (227/227). Person deaths are the gap — 29 deaths,
causes: the wild (9), the expedition (5), monster (4), a stranger (2),
sickness, dehydration, starvation, a wound, the arena, contest, alien,
The Focus Group. Even the 4 monster-caused villager deaths (Odd,
Devon, Suman, Henry) carry witnessN=0. Villagers die alone — on
expedition, in the wild, to a stranger — and nobody is standing next
to them to witness it. The two witnessed deaths ever seen on
succession panels (Vincent + Javier, 34362; Isabella, 34403) both
came on REPLAY seeds, not fresh bands. Fresh-band witnessed-person
rate across r248 + r263: 0 in 10 seeds.

## Results — analyzer verdicts

| Question | Verdict | Numbers |
|---|---|---|
| STAGE (binding) | **NO-GO (supply)** | 0 staged wit-sits fired; WITNESS-CENSUS SUPPLY-ZERO |
| REL-WIT (binding) | **INSUFFICIENT-DATA** | 0 servings; 0 single-fresh draws < 3 floor |
| REL-BOND (binding) | **PASS** | 4/4 held (Theo d+7 ×3 shapes, Aaron d+14, Seymour d+14) |
| REL-VET (binding) | **PASS** | 2 servings held (Mario vet-treeline, Theo vet-treeline); 15 opener draws ≥ 10 floor |
| MOURN-TEMPLATE (binding) | **PASS** | 42 servings, 0 same-speaker repeats, 0 village-window repeats, 0 double-stage exemptions |
| MOURN-EXHAUST (binding) | **PASS** | 0 exhausted-line servings |
| MANTLE-FINE (binding) | **PASS** | 22 deaths observed, 0 flippedImmediate=false, 0 fineLatency≥2, 0 day-skips |
| DRY CENSUS (binding) | **PASS** | 0 dry hits |
| WILD CHECK (binding) | **PASS** | all five proof re-runs green (see below) |
| C3d WILD HOLD (binding) | **PASS** | 0 erasures; recap opener engaged (see People check) |
| CONTROLS (binding) | **PASS** | smoke 33998 matches r233 exactly (see below) |
| CAP-NC (descriptive) | INSUFFICIENT-DATA | 2/2 eligible bonded-by-deadline; denominator < 3 |
| HABIT-COLLISION | PASS | 0 collisions |
| MULTI-NAME SITTING | 1 sitting | 1 driven mourning sitting in a multi-name window; 0 witness servings among them |
| WITNESS-CENSUS | SUPPLY-ZERO | 29 person corpses, 0 witnessed; 227 monster corpses, 227 witnessed |
| F5 WILD EXERCISE (DESCRIPTIVE) | 0 firings | rolling window r233+r245+r248+r254+r258 stays 0; binding proof r225 harness 22/22 |

CONTROLS detail (smoke 33998): handoff d6 Heinrich → Grace
(scripted), relPost bonds 33, relD14 50, selfId grace_obi, pick rank
1, funeral INCALL true, selfReq 0 — the r233 snapshot exactly, on
every field. The WIT-SIT v2 driver is inert on the smoke (no
witnessed death, so no staging), as designed.

WILD CHECK detail: r262 escalator-cap proof GREEN; r254 multiwit ALL
GREEN; r232 relationship-mourning ALL GREEN; r225 F5 harness 22/22;
r258 selfwit ALL GREEN. No F4a/F4b/F4c/F5/F6/C3c/F2/C3d regression
observed in the panel transcripts.

F5 note: the word "settled" appears in 4 transcripts, all the recap
closer ("Good — what's been happening, settled. Feels better said out
loud."), not a settled-favor serving. 0 F5 firings by the r248
convention.

## Census (plain words)

Seven villages, seven ways to lose a scholar — and nobody watched
any of them fall. The mantle passed 22 times and never stuck: every
handoff landed the same day, nobody was left waiting, no day was
skipped. The deepest chain was seed 34416, where the mantle changed
hands six times and two bearers died on a single day (d96), the
village shedding leaders faster than it could mourn them — and ending
thinnest, 6 alive with an empty pantry. Seed 34412 lost only one
bearer and ended with 9 alive and the fullest pantry (40,519); seed
34414 lost five and ended with 7 alive. Nobody starved on a full
pantry; the villages that ended poor ended poor because the people
who knew how to keep them fed kept dying — same as r248.

Per-seed census (end of panel): 33998 alive 11 / fallen 1 / pantry
22,336; 34411 alive 10 / fallen 6 / pantry 17,008; 34412 alive 9 /
fallen 3 / pantry 40,519; 34413 alive 9 / fallen 3 / pantry 9,836;
34414 alive 7 / fallen 8 / pantry 9,339; 34415 alive 8 / fallen 6 /
pantry 9,443; 34416 alive 6 / fallen 11 / pantry 0. Bearer deaths 22
panel-wide (1/2/1/3/5/4/6).

The mourning still lands: 42 name-parameterized servings, every one
naming the right dead, none repeated for the wrong person. Theo
grieved Dwayne by habit and by secret, Mario grieved Grace as a
fellow fighter, Seymour grieved Wolfgang over a shared meal. The
village buries its dead by name. What it never does — on this band —
is watch them fall.

## People check (SENSE-TESTING LAW — read full transcripts)

- **Theo, 34413 d+7, mourning Dwayne** (bond-close, both-veteran):
  the recap opener engages — "We never finished talking about
  what's been happening — we left it mid-thought, 4 days back... We
  still owe grief a proper ending, too." — the C3d live-want path
  alive in the wild for the second panel running after seven silent
  ones. Then the bond-habit line, specific to the dead man: "I hum
  one note, over and over, when the dark comes the way Dwayne used
  to, when they were the one keeping me steady. It doesn't work the
  same. I do it anyway." And: "Dwayne knew things about me nobody
  else does. That's gone now, and I keep catching myself about to
  tell them something." A person grieving, not a template.
- **Theo, 34413 d+64, mourning Esperanza** (bondV 91, depth 3):
  teaches (wild soybean, cacao), shows (wild carrot), answers anger
  ("Furious. Most days." → "Anger's fuel. Just — point it somewhere
  useful."), then the vet-treeline line behind the "You asked me
  that before" prefix: "We both stood at the treeline. Esperanza
  held it. I keep replaying my part, looking for the step I missed."
  A veteran grieving a fellow veteran, 64 days on, still replaying
  his part. Sensical.
- **Mario, 34412 d+7, mourning Grace** (vet-treeline): opens on the
  heavy question — "Did you leave someone behind?" — answered with
  a quiet "Me too." Then "We both stood at the treeline. Grace held
  it." plus the sleep detail ("Sleep's gone strange. I sleep in
  short shifts at odd hours now.") and "Nobody says Grace's name
  right yet." Sensical.
- **Seymour, 34416 d+14, mourning Wolfgang** (bond-habit): opens
  reaching for levity — "what's the funniest thing you've seen
  since we got here? I desperately need it." — a person laughing
  through grief, then "Wolfgang is gone and the world just...
  continues." and "I sit apart to eat the way Wolfgang used to."
  Sensical.
- **Driver notes (carried, not defects):** the driver's "Wait — what
  were we talking about?" re-ask fires in ALL FOUR sittings read
  (the driver pestering, the villager re-anchoring — carried since
  r248). The scout role transfers in all four sittings (the driver
  always picks scout — the r245 scout-role ping-pong note; the
  checkpoint loop is untouched to protect the smoke control).
- **Verdict: PASS.** Conversations have want, engagement, and
  endings that resolve or plant. No fabricated shared history
  spotted; no filler loops outside the (now capped) escalator.

## Telemetry

`node scripts/telemetry-check.js` on the panel corpora: **2 LOUD
lines, both explained** — deaths.bearer +189% (baseline 7.6 →
current 22) and census.fallen +166% (baseline 14.3 → current 38).
The tool sums the 7 current files; the baseline stores means (the
documented means-vs-sum mismatch, unresolved since r229). Per-file
means this panel are BELOW baseline (bearer 3.14 vs 7.6; fallen 5.43
vs 14.3; alive 8.57 vs 3.8 — higher, not flagged; integrationStage
3.00 vs 3.0 exact; week2.deadBearerMentions 4.00 vs 4.2). No real
deviation. **Baseline NOT rolled.**

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r264-gate` in
the worktree (adoption, rebased tip `bcc59bcd4`): **332 passed, 12 failed
in 867s, 0 attributable.** Log:
`evidence/2026-11-21/journey-succession-r263-gate.log` (GATE_EXIT=1 is the
standing-failure count, not a run break).

- Standing set (6): measurement-proof staleness pair
  (test-measurement-proof-update, test-measurement-workflow), phone-frame
  stale receipt, deed-attainment 120s timeouts (living-garden,
  one-person-army), occupation-panels load flake (passes solo).
- Flap/load artifacts (6): prepared-runner-custody, sw-audio-cache, and
  deathcleanup-instrument failed in the gate on EPERM writes during a
  flap burst 21:58–22:04Z (watcher FLAP? A=FAIL@write on every cycle);
  proof-text-identity, telemetry-check-recorder, and foodpower failed
  without an assertion trace in the same window. All six pass solo on
  clear writes (adoption re-runs 22:06–22:07Z, all exit 0 with
  non-empty output); deathcleanup also passed solo during the flap
  itself (exit 0). No failure touches this run's changed files, and
  the branch carries 0 src/js delta — nothing attributable.

## Landing

Adoption closeout: merged ff-only as (see merge tip in the adoption
report); rotation-b 7→4; lock deleted same-call after run_id verify.

## Reachable / Fun / Winnable

- **Reachable: YES.** The succession leg fires on every seed: the
  mantle passes, checkpoints sit people down, funerals are called,
  newcomers arrive and bond. Nothing in the leg is decoration.
- **Fun: mostly.** The mourning writing is the strongest part of the
  leg — villagers grieve by name, with habits and details that
  belong to the dead. The weak part is the witness question itself:
  the game knows how to record a witness (every monster corpse
  carries one) and almost never records one for a person. A witness
  who never exists is a story the player can feel is missing — the
  village buries its dead by name but never saw them fall.
- **Winnable: not judged on this leg.** Succession measures the
  handoff, not the win.

## Metric review

- **REL-WIT stays INSUFFICIENT-DATA, but the binding constraint
  moved AGAIN.** r262: the sitting fired, the pick missed. r263:
  the sitting never had a chance — SUPPLY-ZERO on a 6-seed fresh
  band. The next step is NOT another staging tweak and NOT more
  sittings: it is supply. Fresh-band witnessed-person rate is now
  0 in 10 seeds (r248 + r263). The two witnessed deaths ever seen
  both came on replay seeds (34362, 34403). Filed for the next run:
  run a cheap SUPPLY SCREEN first — many seeds, corpse census only,
  no full panel — to find seeds where a witnessed person death
  actually occurs, then stage WIT-SIT v2 on THOSE seeds. The v2
  instrument (cap 4, second sitting, sitSeq) is built, syntax-checked,
  analyzer-validated against the r262 corpus (verdicts identical),
  and proven inert when supply is absent; it is still unproven in
  the wild because no supply arrived. Do not re-run a fresh band
  hoping for supply — screen for it.
- **Diagnostic question for the next run:** WHY do person corpses
  never carry witnesses while monster corpses always do? 4
  monster-caused villager deaths on this panel, all witnessN=0.
  The witness-population rule (registerDeath / combat attribution)
  needs one read before the next staging panel — if witnesses only
  populate for deaths the bearer participates in, the staging
  instrument should look there, not at the corpse census.
- **MOURN-TEMPLATE exemption never fired** (0 double-stage pairs —
  no supply). The amendment stands, untested in the wild; it needs
  a supply panel to prove itself.
- **REL-VET floor watch CLEARED with margin:** 15 opener draws vs
  the 10-draw floor, and the bar PASSED (2 servings held). Keep the
  floor; stop watching it.
- **C3d:** the recap opener engaged again (Theo d+7) — second panel
  running after seven silent ones. The bar stays; the path is alive.
- **F5 WILD EXERCISE stays DESCRIPTIVE:** 0 firings this panel,
  rolling window r233+r245+r248+r254+r258 stays 0. The r225 harness
  (22/22) remains the binding proof.
- **CAP-NC:** denominator starved again (2 eligible). No revision —
  the starvation is by design (newcomers arrive late or not at all).
- **Day-skip watch:** 0 skips — twenty-fifth straight panel watch,
  still clean.
- **Proof refresh rounds 11 + 12 remain owed** (not this run's).
- **Scout-role ping-pong / driver re-ask pestering:** carried, unchanged.
- **Multi-name relationship mourning stays open** (not built).
- **KIN mourning stays unavailable** (no kin signal).
