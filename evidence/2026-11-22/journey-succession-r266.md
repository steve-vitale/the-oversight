# Journey succession r266 — Lane B, leg 7 (succession) — RUN NOTE

Adoption-completed. The 02:00 CST occurrence (run_id
`playtest-loop-2-20261122T0800Z`) ran the 26-seed panel clean and
timed out before closeout; this note was written by the adoption
coordinator from the evidence in the worktree, re-deriving the
adjudication from the analyzer output and the per-seed JSONs rather
than copying the timed-out run's verdicts. Base at registration:
master `e67224635`. Rotation-b read 7 at run start; this run writes
4 (endgame next) at closeout. Lock: playtest-loop-2.lock run_id
`playtest-loop-2-20261122T0800Z`. Prior lock
`playtest-loop-2-20261122T0100Z` (created 06:55:34Z, no registered
tree, no heartbeat) was deleted by the run via stale-lock recovery,
recorded in the prereg. Prereg:
`evidence/2026-11-22/journey-succession-r266-prereg.md` (the plan of
record; the screen-plan DRAFT in `~/workspace/` was superseded —
this run staged in-trajectory on one wide band, per the prereg's
recorded design correction to r263's two-phase prescription).

## Pre-registered question + bars

r263 ended SUPPLY-ZERO: 29 person corpses panel-wide, 0 with
witnesses; WIT-SIT v2 staged 0 sittings. The question this run
answers: **does a witnessed person death occur on a fresh band, and
can the witness variant be staged on it?** The prereg's diagnostic
map (read before play) said witnesses attach ONLY to tbDamage
combat deaths inside a bearer-present tbfight; `hurtVillager`
passes no witnesses for field-fight deaths; monster corpses always
carry witnesses because monsters die only in combat the player is
in. Bars (binding, §14): SUPPLY, MONSTER-WITNESS (≥90%),
STAGE (≥1 staged wit-sit fires), REL-WIT (≥1 judged witness-variant
serving, ≥3 single-fresh draws or INSUFFICIENT-DATA, wrong-dead
serving = FAIL LOUDLY), REL-BOND, REL-VET (≥10 opener draws),
MOURN-TEMPLATE (0 same-speaker same-shape for different dead AND
0 different-speaker same-shape same-dead within 5 days, except
double-stage pairs), MOURN-EXHAUST, MANTLE-FINE, DRY CENSUS (0 dry
hits), WILD CHECK, C3d WILD HOLD, F5 WILD EXERCISE (descriptive),
CONTROLS (smoke 33998 matches r233), CAP-NC (descriptive),
POSITIVE CONTROL 34403 (descriptive).

## Panel

- Driver `scripts/journey-succession-r266-20261122.js` = r263 driver,
  rename-only fork (filenames r263 → r266, EVID 2026-11-21 →
  2026-11-22). Analyzer `scripts/analyze-journey-succession-r266-20261122.js`
  = r263 analyzer, same rename-only fork. Runner
  `scripts/run-journey-succession-r266-panel.sh` = r263 runner,
  renames + seeds.
- Seeds: FRESH BAND 34422–34445 (24 seeds; EARLY_KILL_DAY=40,
  POST_DAYS=70) + positive control 34403 (same config, replay) +
  smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot seed 34422 first, then 34423–34445, then 34403,
  then smoke. All 26 seeds exit 0.
- No src/js change this run. No new proof test (the five carried
  proofs re-ran on this base — see WILD CHECK).

## Results — adjudication per bar

| Bar | Verdict | Evidence |
|---|---|---|
| SUPPLY (binding) | **SUPPLY-PRESENT** | 5 witnessed person corpses across 4 fresh seeds (see below) |
| MONSTER-WITNESS (binding) | **PASS** | 875/875 = 100% |
| STAGE (binding) | **PASS** (≥1 fires) | 5 staged, 4 fired |
| REL-WIT (binding) | **INSUFFICIENT-DATA** | 0 servings, 0 single-fresh draws (floor 3 unmet); no wrong-dead serving |
| REL-BOND (binding) | **PASS** | 10 judged, 10 held, 0 unheld |
| REL-VETERAN (binding) | **PASS** | 12 judged, 12 held, 0 unheld; 59 opener draws |
| MOURN-TEMPLATE (binding) | **FAIL** | 1 village-window repeat (Ava d+14 vs Finn d+9, opener:expect-fire, Hilda, 34443) |
| MOURN-EXHAUST (binding) | **PASS** | 0 exhausted-line servings |
| MANTLE-FINE (binding) | **PASS** | 87 deaths, 0 flippedImmediate=false, 0 fineLatency≥2, 0 unexplained fineLatency==1, 0 day-skips |
| DRY CENSUS (binding) | **FAIL** | 2 other-class dry hits (Asep 34426 d94, Ursula 34436 d91), both alive:event:mourning |
| WILD CHECK (binding) | **PASS** | all 5 proof re-runs green; no regression observed in the panel transcripts |
| C3d WILD HOLD (binding) | **PASS** | 0 erasures in the transcripts read |
| F5 WILD EXERCISE (descriptive) | 0 firings | rolling window r233+r245+r248+r254+r258+r263 stays 0 |
| CONTROLS (binding) | drift recorded, re-baselined by measurement | smoke deterministic fields match r233; stochastic relationship counts moved (see below) |
| CAP-NC (descriptive) | 10/10 eligible bonded by deadline | denominator ≥3 for the first time in several runs |
| POSITIVE CONTROL (descriptive) | 0 witnessed | replay divergence, not instrument failure |
| HABIT-COLLISION | **PASS** | no two speakers in one village share a habit text |

relOpp totals: bondConvos 44, vetConvos 122, witConvos 2,
mourningConvos 208.

## SUPPLY-PRESENT — the finding of the run

Five witnessed person corpses across 4 fresh seeds — the first
fresh-band supply since r248 (r263 was 0/29):

- **Daniela, 34424, combat**, witnesses [Abigail]. Staged d+13, did
  NOT fire — no living witness (Abigail dead by then).
- **Ella + Tyler, 34426, combat**, witnesses [Ruby, Diana, Tyler,
  Helga] / [Ruby, Diana, Helga]. Staged twice (Ruby d+38 seq 1,
  Diana d+39 seq 2) — the double-stage pair.
- **Sari, 34435, ambush**, witnesses [Maya, Dmitri, Yara]. Staged
  twice (Maya + Dmitri d+11, pre-phase).
- **Jamal, 34444, ambush**, witnesses [Giulia].

Person corpses 152 total (146 fresh); witnessed by cause: combat 3,
ambush 2, everything else 0. **The analyzer's own census counts 4,
not 5** — Sari is missing from the 34435 census. Verified directly:
the 34435 corpseCensus holds exactly 40 entries (36 monster + 4
person: Roberto/monster, Booker/expedition, Ashley/wild,
Yara/alien), and Sari is absent. The census caps at 40 entries per
seed, and the cap truncated her. The witSit pre-death scan caught
her because it reads corpses() live at staging time. SUPPLY-PRESENT
either way (≥1), but the true count is 5, and the 40-entry census
cap is a second instrument limitation to carry: a witnessed corpse
can be invisible to the census.

## The diagnostic map was wrong — a new witness path exists

The prereg's map said witnesses attach ONLY to tbDamage combat
deaths, and its "interesting" list explicitly named a witnessed
person corpse whose cause is NOT 'combat' as the map being wrong.
That is what happened, twice: **Sari and Jamal both died by ambush
with witnesses.** The path is `simNpcAmbush` (`src/js/betrayal.js`,
the NPC-NPC murder-plot resolution): it registers kind 'person',
cause 'ambush', with `witnesses: this.witnesses(6)` filtered to
exclude the victim — anyone standing within 6 tiles when the ambush
resolves. The negative control is on the same panel: Ella's ambush
on the positive-control replay (34403) carried 0 witnesses —
nobody in range. Corrected rule: **a person death carries witnesses
iff it happens inside a bearer-present fight (combat via
fightWitnesses) OR an ambush with a bystander within 6 tiles.**
The `hurtVillager` gap stands unchanged — field-fight villager
deaths still carry no witnesses, and the fix proposal (thread
field-fight allies as witnesses in `hurtVillager`, mirroring the
monster side's killer-as-witness) stays filed for Steve, NOT built
this run, per the prereg.

## REL-WITNESS stays INSUFFICIENT-DATA — and why

0 witness-variant servings on 4 fired sittings; 0 single-fresh
draws against the 3-draw floor; no serving named the wrong dead
(no fabrication). The shape of the miss matters:

- The 2 **post-phase** sittings (34426 Ella: Ruby d+38, Diana d+39)
  had the lately event BE a witnessed death (Tyler, witnessed=true)
  — and still served no witness variant and never named the staged
  dead (Ella). Both had freshPersonN=2 (Ella + Tyler both fresh),
  so they do not count as single-fresh draws.
- The 2 **pre-phase** sittings (34435 Sari: Maya + Dmitri d+11) had
  freshPersonN=1 but latelyWitnessed=false — the death was still in
  the future at sitting time (the pre-death scan stages before the
  death). Pre-phase sittings structurally cannot judge REL-WIT.
- The 5th staged sitting (34424 Daniela) never fired: no living
  witness.

So the variant has now been given supply and still never served —
but the preregistered floor (3 single-fresh draws) was never met,
so the verdict stays INSUFFICIENT-DATA rather than a NO-GO on the
pick. The next question is filed in Metric review: the variant may
be gated on exactly-one-fresh-dead, and supplied seeds keep
producing 2+ fresh dead.

## The two FAILs

**DRY-CENSUS FAIL (2 other-class dry hits).** Both are the same
pick class, `alive:event:mourning`, at the same 3 sites
(conversation.js:8290, conversation.js:9453,
convo-dialogue.js:1186): Asep 34426 d94, Ursula 34436 d91. Both
transcripts were read in full. In each, the player picks "How are
you holding up? About... them." and the NPC answers "...Sorry, lost
my train of thought." — the mourning pick's selected line is blocked
at emission and falls back to the dry line (the known
ledger-blocked-react class; see the comment at
conversation.js:8290). The conversation recovers on the next pick
in both cases (Asep goes on to the alone-time question, an invite,
and a scout party role; Ursula to sleep troubles, a Spicebush
teaching, and "The fire feels smaller without Vikram"). Honest
fallbacks 10, null silences 0. **No fix exists in the worktree:**
no src change, no patch file, no note — the timed-out run's report
said a fix was "filed," but nothing file-like could be located
(the `~/workspace/tackle-succession-stage/` dir is a different
workstream: succession inheritance feel, worn gear/stash). The
failure is documented here as an open finding; no fix was invented.

**MOURN-TEMPLATE FAIL (1 village-window repeat).** Ava d+14 vs
Finn d+9, both `opener:expect-fire`, dead Hilda, seed 34443, 5 days
apart (inside the 5-day window). Both transcripts were read: Finn
(d50): "Since Hilda died... I keep expecting to see Hilda at the
fire. Stupid." Ava (d55): the identical line, verbatim. Same-speaker
repeats 0; double-stage exemptions 0 (the pair is 5 days apart, not
consecutive days, so the exemption does not apply). 150 mourning
servings total. The MOURN-TEMPLATE double-stage-pair exemption
remains untested in the wild — the 34426 Ella pair (Ruby seq 1,
Diana seq 2) did not share a shape.

## People check (transcripts read in full)

- **Sari, 34435, Maya + Dmitri d11.** The sittings ran the ambush
  CASE thread, not the mourning witness variant: Maya is pressed on
  the case twice, the site is visited ("The ground remembers"),
  witnesses are asked ("No one saw Sari leave. Just trees.");
  Dmitri investigates, exposes the bribery at the moot, votes
  guilty, visits the site. It reads like a person settling a murder,
  not a mourning — which is the point: the case thread works, the
  witness variant never appears. (Note the driver re-ask pestering:
  "There's still the matter of the ambush of Sari" repeats after
  the vote.)
- **Ava / Finn, 34443.** The repeat is verbatim (above). Both
  conversations are otherwise coherent people: Finn refuses parties
  ("I don't do parties. ...It's not you. It's the party."), teaches
  American Persimmon, and turns over Hilda's last words; Ava is
  already Scout and the role menu correctly refuses to re-assign it.
- **Asep, 34426 d94 (the dry hit).** The dry line lands mid-mourning
  pick and the conversation recovers; later Asep takes the Scout
  role from Diana ("Scout is yours now") and serves a real
  mourning-flavored line unprompted ("I greet everyone by name each
  morning the way Ruby used to..."). The mourning content exists and
  serves through other picks; only the `alive:event:mourning` pick
  itself deflects.
- **Ursula, 34436 d91 (the dry hit).** Newcomer probe; the same
  deflection on the same pick, the same recovery ("Sleep's gone
  strange. I do push-ups at dawn..."), a Spicebush teaching, and a
  real mourning line via listen ("The fire feels smaller without
  Vikram").

## Controls — drift recorded, bar re-baselined by measurement

Smoke 33998 deterministic fields match r233 exactly, verified from
the per-seed JSON: handoff d6 Heinrich → Grace (scripted), relPost
bonds 33, selfId grace_obi at all three snapshots, funeral INCALL
(entryDay 6, 16 lines), alive 11, fallen 1. The stochastic
relationship counts moved: relD14 50 → 45, relEnd 51 → 47, mourning
servings 4 → 0, NPC-NPC bonds 16 → 12 (as reported by the run; the
first three verified directly from the JSON). Per the prereg clause
("if the smoke snapshot moves, it is base drift since r233,
recorded as such and the bar re-baselines by measurement, not
adoption"), CONTROLS is recorded as drift and the bar re-baselines
by measurement. Positive control 34403 yielded 0 witnessed person
corpses (Ella ambush, witnessN 0) — replay divergence, not
instrument failure, per the prereg; the instrument is validated
end-to-end by the fresh-band supply plus MONSTER-WITNESS 100%.

## WILD CHECK

All five carried proofs re-ran GREEN on this base (adoption ran
them): r262 escalator-cap GREEN, r254 multiwit ALL GREEN, r232
relationship-mourning ALL GREEN, r225 F5 harness 22/22, r258
selfwit ALL GREEN. No F4a/F4b/F4c/F5/F6/C3c/F2/C3d regression
observed in the panel transcripts. C3d: 0 erasures in the six
transcripts read; the recap opener engages (Ursula's "Still on what
you miss most."). F5 WILD EXERCISE: 0 firings by the r248
convention — the 16 "settled" lines in convoLines are the ambush
case line ("Nobody's settled it") and the generic wind-down line
("...settled. Feels better said out loud."), not settled-favor
servings. Rolling window r233+r245+r248+r254+r258+r263 stays 0;
the r225 harness (22/22) remains the binding proof.

## Telemetry

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-22/journey-succession-r266-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
— 2 LOUD lines, both forced-chain regime, investigated, no real
bug shown:

- deaths.bearer: baseline 7.6 → current 87 (n=26 files). The panel
  forces a bearer death on day 40 of every seed (EARLY_KILL_DAY=40)
  plus the scripted smoke death; 87 bearer deaths across 26 seeds
  is the forced chain doing its job.
- census.fallen: baseline 14.3 → 175. Same regime — forced chain +
  110-day panel horizon.
- census.alive, census.integrationStage, week2.deadBearerMentions:
  quiet.

Per the prereg rule (a forced-chain panel must NOT roll the
unforced baseline forward), **the baseline is NOT rolled**. The
LOUD lines are regime, not drift.

## Reachable / fun / winnable

This is a succession leg: it measures the mourning/witness
machinery, not the win chain, so no winnability movement is claimed.
What it settles: **the witness question is now stageable.** After
three supply-zero panels (r248, r263, and the 0/29 that motivated
this run), fresh seeds DO produce witnessed person deaths — 5
across 4 of 24 seeds — and the staged sittings fire on them. The
wall has moved: it is no longer supply, it is the pick. The witness
variant never served even when a witnessed death was the
conversation's lately event, and the single-fresh floor was never
met (0 draws). The mourning system itself reads as people: the
ambush case thread settles murders, the dry-hit conversations
recover, the repeat is the one verbatim line the template bar
exists to catch. The two FAILs are real and narrow — a deflected
mourning pick (2 hits) and one repeated opener — and neither is a
game-breaker; both are filed as open findings below.

## Metric review (carried + filed)

- REL-WIT: still INSUFFICIENT-DATA (0 single-fresh draws ever on a
  staged panel; the 3-draw floor stands). **Filed:** pre-phase
  sittings cannot judge REL-WIT (the death is in the future at
  sitting time); only post-phase sittings with freshPersonN==1
  count. **Filed:** the witness variant may be gated on
  exactly-one-fresh-dead — the 2 post-phase sittings both had
  freshPersonN=2 and served nothing despite a witnessed lately
  death. The next staging panel should stage post-phase only, on
  seeds with exactly one fresh witnessed death — or the floor needs
  revisiting.
- MOURN-TEMPLATE double-stage-pair exemption: still untested in the
  wild (0 double-stage pairs sharing a shape); the 34426 Ella pair
  did not share one. Stands.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances one
  panel (r233+r245+r248+r254+r258+r263+r266, still 0).
- CAP-NC: denominator ≥3 for the first time in several runs
  (10/10 bonded by deadline). No revision — the starvation was by
  design; the denominator arrived on its own.
- **Filed (instrument):** the 40-entry corpse-census cap can hide
  witnessed corpses (Sari, 34435). The census verdict undercounts
  when a seed's corpse list overflows; the witSit live scan is the
  backstop. The analyzer's WITNESS-CENSUS count should be read as a
  lower bound.
- **Filed (diagnostic):** the witness-population map is corrected —
  ambush is a second witness path (bystander within 6 tiles). The
  `hurtVillager` fix proposal stays filed for Steve, NOT built.
- **Filed (open finding):** DRY-CENSUS mourning-pick deflection
  (2 hits, same pick, same 3 sites). No fix exists in the worktree;
  the timed-out run's "filed fix" could not be located anywhere.
- **Filed (open finding):** MOURN-TEMPLATE village-window repeat
  (Ava/Finn, opener:expect-fire, Hilda).
- Proof refresh rounds 11 + 12 remain owed (measurement-proof
  track, carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged (observed again in the Dmitri transcript).
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). Day-skip watch:
  twenty-seventh straight panel watch, 0 skips. BOWCRAFT bisect for
  the 34362 drift stays open (not this run's). Outing-chain re-tune
  stays open (conversion 12.9%, r260).

## Adoption notes

- The timed-out run's panel, analyzer output, and transcripts were
  re-verified independently (Python aggregation over the 26 per-seed
  JSONs + transcript reads); the adjudication above is the
  adoption's own, not a copy of the timed-out run's report. Where
  it differs: the true witnessed count is 5, not the analyzer's 4
  (census cap); the diagnostic map correction (ambush path) is
  stated here for the first time; the "filed" DRY fix could not be
  located and is reported as not found rather than as filed.
- Write flap window 4 (09:06:37Z–~09:31:30Z, ~25 min, boot
  87ed2c33) blocked adoption writes; heartbeat re-established
  09:33:00Z after the clear. A VM replacement occurred ~09:31Z
  (uptime 1 min at 09:32Z).
- Lane B Loop 0530Z adoption landed first: master moved
  e67224635 → 4681e740f (sim-hypofloor-b NO-GO). This branch rebased
  onto 4681e740f before merging; proof tests re-ran on the rebased
  tip (see below).
- Gate: [adoption fills in after the merge — see Gate section
  below].

## Gate

Adoption gate on the merged tip `67a87d1b5` (after rebase onto
`4681e740f`): `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r266-gate` — **338 passed, 6
failed in 1085s**, log at goal
`hidden_files/check-quick-r266-adoption.log`. The 6 failures are
all standing pre-existing families, 0 attributable to this run (no
src/js change; evidence + tooling only):

- test-living-garden-deed-attainment.js — 120.2s timeout
  (deed-attainment 120s timeouts under load).
- test-one-person-army-deed-attainment.js — 120.1s timeout (same
  family).
- test-measurement-proof-update.js — "Proof source inputs are not
  current" (measurement-proof staleness, first of the pair).
- test-measurement-workflow.js — exit 1 (staleness pair, second).
- test-measurement-cache-flags.js — exit 1
  (measurement-cache-flags family).
- test-phone-frame-proof.js — stale receipt (phone-frame stale
  receipt family).

Occupation-panels (114s, slow but passed) did not fail this time.
338/6 is better than the recent baseline (r263 adoption gate
331/13, r265 339/5) and no failure touches any file this run
changed. The five WILD CHECK proofs re-ran GREEN on the rebased tip
before the merge (r262 escalator-cap, r254 multiwit, r232
relationship-mourning, r225 F5 22/22, r258 selfwit).
