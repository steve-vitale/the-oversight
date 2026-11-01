# sim-contactfinish-a — pilot evidence (Loop A, run fleshout-loop-a-20261101T0125Z)

Axis: scale-onramp, converging NOT converged. Arm: contact-finish rule
(prereg: `evidence/2026-10-31/sim-contactfinish-a-prereg.md`, commit
`2b91aadec`). Game code touched: `src/js/fieldFights.js`, volley-break
block only. Instruments are own copy-named files; no spikecontact /
contactrec file was edited.

## What the rule does, in plain words

When a villager meets a wave-3-or-later beast that is already at death's
door (below its break line) and would otherwise have run away untouched,
the villager now gets one real closing strike with the weapon they
actually hold. If the strike is enough, the beast falls and the log names
the weapon honestly. If it is not enough, the beast still runs away —
nobody is forced to keep fighting, and the beast does not get a free hit
back (it was already turning to run). A villager with no usable weapon
never gets the strike, and a bow with no arrows never counts. The old
drive-off line that always said "with the bow" — even for fighters
holding no bow at all — is gone: drive-offs now name the weapon held,
or say plainly that the beast broke off.

## Pilot verdict: GO — all six preregistered bars hold

Judged on the lever leg's own meetings (prereg definition: rows the
engine attempted, cross-checked against the analyzer's spear-counts-as-
melee universe, plus finishable CONTACT meetings still ending in a
drive-off on the lever leg):

| GO bar | Result |
| --- | --- |
| Converted kills >= 50% of judged finishable mFlee CONTACT meetings | **PASS: 4/6 = 66.7%** (attempted 6, all analyzer-verified finishable; remaining finishable 0) |
| Unarmed meetings converted = 0 | **PASS: 0** (the 2 remaining CONTACT drive-offs are both unarmed bow-no-arrows meetings, still drive-offs) |
| Deaths attributable to contact-finish attempts = 0 | **PASS: 0** (wave-3 field deaths 0 on the lever leg; no vDie row carries `contactFinishAttempted`) |
| Median survival >= baseline −10% | **PASS: 120.5d vs 121d** (bar 108.9d) |
| Wave >= 3 field deaths <= baseline + 2 | **PASS: 0 vs 0** (bar 2) |
| Lie rate on remaining drive-off lines = 0 | **PASS: 0/2** (both remaining lines use honest no-weapon wording) |

**Pilot GO, so confirm runs** (12 fresh seeds, both legs, own band,
never pooled into the pilot). See "Confirm" below.

### The denominator, stated plainly (do not re-score this)

On the lever leg, a converted meeting ends in a kill and a failed strike
ends in a flight with damage dealt — so neither still counts as a
CONTACT meeting under the contactbreak definition. The analyzer's lever
`finishableMfleeN` is therefore 0 by construction, not evidence that
nothing was finishable. The preregistered lever universe is attempted
(6) + remaining finishable (0) = 6. The baseline leg's finishable
universe (11) is a different set of meetings on trajectories that
diverged at the first conversion; 4/11 is not a valid rate because
those 11 meetings mostly never occurred on lever trajectories. It is
reported here as context only, never as a second verdict.

## Before / after on identical pilot seeds (8)

Policy stack both legs: `withFullseatDiag(withSeatDrive(withWinDefer(TF
leadfeast)))`, `FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1`, recorder `CONTACTFINISH=1`, death-aware cap
200 loop-days.

| | Baseline | Lever |
| --- | --- | --- |
| National / table / wins | 7/8 / 7/8 / 7/8 | 7/8 / 5/8 / 5/8 |
| Wave-4 / wave-5 | 5/8 / 0/8 | 7/8 / 0/8 |
| Full seat | 0/8 | 0/8 |
| Median / max survival | 121d / 197d | 120.5d / 201d |
| Wave-3 rows / CONTACT meetings | 86 / 13 | 67 / 2 (remaining only; see denominator note) |
| Judged finishable mFlee CONTACT | 11 | 6 attempted (4 killed, 2 struck-and-fled) |
| No-instrument mFlee CONTACT | 2 | 2 (both still drive-offs) |
| Drive-off lines / lies | 13 / 13 (100%) | 2 / 0 (0%) |
| Wave-3 field deaths | 0 | 0 |
| Recorder errors | 0 all seeds | 0 all seeds |

Per seed (lever): 87104 201d survived/global/w4 (baseline 159d won);
87109 146d village-lost/regional/w4 (same); 87119 90d won/global/w4
(same); 87124 112d won/global/w4 (same); 87140 201d survived/national/w4
(baseline 197d won); 87115 90d won/global/w4 (same); 87123 114d
won/global/w4 (baseline 115d won); 87127 127d won/global/w3 (same).

## The six strikes (all analyzer-verified finishable)

- 87104 d148, Weronika, crowbar vs 1-HP Callback: **killed** (14 dmg).
- 87140 d163, Wayra, kitchen knife vs 29-HP Spool: struck for 12
  (17 left), beast broke away.
- 87140 d166, Rafael, sharpened stick vs 1-HP Spool: **killed** (16 dmg).
- 87115 d89, Greta, machete vs 36-HP Callback: struck for 26 (10 left),
  beast broke away.
- 87115 d89, Frank, stone knife vs 1-HP Callback: **killed** (10 dmg).
- 87123 d112, Luis, hunting spear vs 1-HP Callback: **killed** (21 dmg)
  — the spear-edge case from spikecontact, now converted with the spear
  named. (The analyzer flags this row melee too via the carried spear;
  the engine's instrument label is 'spear', which is the honest name.)

## Sense-reads (8 transcripts: 6 strikes + 2 leftovers)

Every kill reads as an earned put-down, not a granted fight: all four
kills are against beasts at exactly 1 HP, with the held weapon named
and the damage stated. Both failed strikes read as real attempts that
fell short (12 vs 29 HP, 26 vs 36 HP) with the beast's remaining HP
stated before it leaves. Both leftover drive-offs are the honest pair:
"Dmitri/David has Crude bow but no arrows — the string stays drawn,
useless." followed by "drove [beast] off — it broke before it ever
closed." — no weapon credited, and the two lines now agree instead of
contradicting each other. **No line anywhere in these 8 transcripts
credits a weapon nobody holds.** (The "Ugly Beast" name on the callback
rows is a pre-existing monster-naming fixture, not this arm's.)

## The win-rate dip: panel review_required, investigated, carried to confirm

The §15 panel (`sim-contactfinish-a-panel-compare.md`) returns
`review_required` on one signal: table/win rate 0.875 → 0.625 (the two
seeds above, 87104 and 87140, flipping from won to survived-to-cap).
National access, day-30/60 survival, and community loss are unchanged.
Investigation from the corpora: the diverged seeds did not get weaker
— both end at standing 199 (87140 up from baseline 99, 87104 equal),
same ultimate weapon tier, no deaths, villages alive at the cap having
reached national but never reached the table. The mechanism (which
deed/table timing shifted downstream of the first conversion) is **not
identified from these corpora**, and wins are not a preregistered GO
bar, so this is not re-scored as a pilot fail. It is carried as an
open review item into confirm: if the dip replicates on the 12 fresh
confirm seeds, that is a coordinator-level decision, not a quiet
pilot-pass footnote.

## Baseline band notes (for the record)

- Baseline CONTACT universe 11 finishable / 2 no-instrument; lie rate
  13/13 = 100% (the old bow line on every drive-off).
- Why 13 CONTACT, not spikecontact's 20: 7/8 seeds' trajectories are
  byte-identical to the spikecontact fresh pilot; only s87123 diverged
  (days 112 → 115, field fights 120 → 98, contact 9 → 2), attributed to
  chorus-hold (s87123 held the Gabriela commit+dance flight from
  spikecontact, changing the downstream meeting stream). Contact counts
  on the other seeds reconcile exactly.
- Control-driver step: prior instrument verbatim (twoblow sweep) on
  87104/87127 on this base — dayHash arrays byte-identical to both old
  corpora, end fields identical. Det-gate: recorder ON vs OFF on the
  same seeds — dayHash arrays byte-identical. Corpus determinism leg:
  lever s87104 re-run byte-identical (407,884 bytes, three separate
  landings of that exact size).
- Carried-definition note: the carried loop skips equipped item ids
  (equipped items also sit in the pack list and were swallowing the
  spear label). This changes only the instrument label, not whether an
  attempt fires or which weapon is named. Outcome-identical; documented
  here, not a prereg amendment.

## EPERM flap handling and lost-file accounting

The intermittent container write-denial flap (from ~02:02Z 2026-11-01)
hit this arm throughout the lever leg: safe-commit failed twice on
`/tmp` index-lock writes; sweep stdout redirected to a file produced
0-byte corpora twice; an 8-seed OUTDIR sweep lost three seeds' files to
one flap window (02:25–02:37Z). The working pattern, learned the hard
way: the game-loaded process must never be the file writer — sweep to
stdout, fresh-process relay writes per-seed files (180×10s budget,
splitter parity). The lever leg landed via that relay (wrote=8,
failed=0), then **s87104.json vanished after landing** (silent-loss
class; other 7 intact). It was re-run alone through the same pipeline
(relay skipped the 7 valid files) and reproduced byte-identical at
407,884 bytes — the third landing of that exact size, confirming the
re-run is the same trajectory, not a new one. No judged number rests
on a file that was not re-validated after landing.

## Metric review (for the NEXT run, not this verdict)

- Intent was not a gate in the preregistered rule, and the question did
  not arise on the pilot: all 6 attempted rows are engage intent, as
  were all baseline CONTACT meetings. If a learn-intent finishable
  meeting appears on confirm, the rule converts it as written; whether
  intent should gate is a next-run question, not a mid-run change.
- The lever-leg universe definition (attempted + remaining finishable)
  worked as preregistered and should be kept verbatim for confirm.
- The win-rate dip (above) is the one open measurement question for
  confirm; confirm's panel is the instrument for it.

## Unmeasured (never zero)

Arc reach, four-realm formation, trap acquisition, counter discovery,
and young-link succession are not in the contactfinish corpora and are
reported as UNMEASURED, not zero.

## Panel (§15)

`evidence/2026-10-31/sim-contactfinish-a-panel-compare.{md,json}` plus
`-before`/`-after` panel `.json.gz`, built by
`scripts/contactfinish-panels-20261031.js` (twoblow precedent).
Deviation stated on the face of the compare: the official panel driver
runs sweep-compare registry policies only and cannot express the
leadfeast + fullseat-diag stack + contactfinish instrument, so panels
are built from the sweep corpora. Contract metrics mapped where
observable (won, table, national, survival30/60, communityLost); the
rest null, never fabricated. Panel is the instrument; prereg thresholds
are the judge.

## Proof and suite

- `scripts/test-contactfinish-20261031.js`: **39/39 passed** (~6s),
  including the 4 lever-corpus legs (conversion ≥ 50%, lie = 0, median
  ≥ baseline −10%, w3Deaths ≤ baseline + 2) and engine legs E1–E7.
- `node scripts/check.js --quick`: **284 passed, 6 failed in 459s**
  (7m40s). The 6 failures are exactly the pre-existing 0000Z set,
  each re-verified individually failing on its own
  (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20) — no new failure from the rule. Full `check.js`
  runs before any landing claim (coordinator step).

## Confirm plan (runs next, only because pilot is GO)

12 fresh seeds (twoblow confirm set): 87103, 87107, 87120, 87121, 87126,
87128, 87132, 87134, 87135, 87137, 87138, 87141. Both baseline-confirm
and lever-confirm legs on identical seeds, same stack, own band, never
pooled into the pilot. Same six bars on the confirm band alone; a
confirm miss is NO-GO at confirm and the game code is reverted
(verified via `git diff <base> -- src/js/fieldFights.js` empty before
any landing commit).

## Village assessment (plain words)

Villagers who meet a dying beast no longer watch it walk away while the
log lies about a bow nobody holds. When they hold a real weapon, they
try one real finishing blow — and on this band, two out of three such
tries put the beast down, all four kills against beasts at 1 HP, which
is the honest shape of a mercy blow, not a new combat system. When they
hold nothing usable, the beast still walks away and the log now says so
plainly. Nothing else about village life moved: villages survive as
long, lose nobody extra, and reach national standing as often. The one
shadow is that two villages that would have won by day ~160–197 instead
ran out the 200-day clock still strong but unseated — why is not yet
known, and the fresh-seed confirm band is where that gets tested before
anyone calls this safe to keep.
