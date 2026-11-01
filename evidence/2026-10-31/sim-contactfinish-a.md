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

## Confirm section (run fleshout-loop-a-20261101T0515Z, arm sim-contactfinish-a-confirm)

Confirm verdict: **GO — all six preregistered bars hold on the 12-seed
confirm band alone** (never pooled into the pilot). The rule is NOT
merged by this worker; it is reported 'ready to merge, pending
coordinator'. No game-code change was made in this leg: the rule is
commit `54642e946`, branch tip `c41b8cb60`, unchanged.

### Confirm band table (both legs, identical seeds, same policy stack)

Policy stack both legs: `withFullseatDiag(withSeatDrive(withWinDefer(TF
leadfeast)))`, `FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1`, recorder `CONTACTFINISH=1`, death-aware cap
200 loop-days. Seeds: 87103, 87107, 87120, 87121, 87126, 87128, 87132,
87134, 87135, 87137, 87138, 87141. Baseline leg FIRST with the rule
OFF (fieldFights.js swapped to the `1a6dce59d` version, verified
byte-identical to that commit and differing from HEAD by the rule
block only), then restored from the backup copy (never `git
checkout` as the restore step) with `git diff HEAD` verified empty
before the lever leg ran. The legs differ ONLY by this rule.

| | Baseline (rule OFF) | Lever (rule ON) |
| --- | --- | --- |
| National / table / wins | 7/12 / 10/12 / 9/12 | 6/12 / 10/12 / 9/12 |
| Wave-4 / wave-5 | 10/12 / 0/12 | 10/12 / 0/12 |
| Full seat | 0/12 | 0/12 |
| Median / max survival | 90d / 144d | 90d / 163d |
| Wave-3 rows / CONTACT meetings | 128 / 14 | 87 / 1 (remaining only) |
| Judged finishable mFlee CONTACT | 13 (+1 no-instrument) | 3 attempted (2 killed, 1 struck-and-fled), 0 remaining finishable |
| Drive-off lines / lies | 14 / 14 (100%, old code) | 1 / 0 (0%) |
| Wave-3 field deaths | 2 | 2 |
| Recorder errors | 0 all seeds | 0 all seeds |

Per seed (baseline nat/table/won/days → lever nat/table/won/days):
87103 0/0/0/60 → 0/0/0/60; 87107 1/1/1/90 → 1/1/1/90; 87120 1/1/1/103
→ 1/1/1/103; 87121 1/1/1/90 → 1/1/1/96; 87126 1/1/1/102 → 1/1/1/102;
87128 0/1/1/91 → 0/1/1/91; 87132 1/1/1/90 → 1/1/1/90; 87134 0/1/1/90
→ 0/1/1/90; 87135 1/0/0/144 → 0/0/0/163; 87137 0/1/0/89 → 0/1/0/89;
87138 1/1/1/90 → 1/1/1/90; 87141 0/1/1/90 → 0/1/1/90. Best seat is
lesser everywhere a seat was taken, none on 87103/87135.

### The six bars (confirm band alone)

| GO bar | Result |
| --- | --- |
| Converted kills >= 50% of judged finishable mFlee CONTACT meetings | **PASS: 2/3 = 66.7%** (attempted 3, all analyzer-verified finishable; remaining finishable 0) |
| Unarmed meetings converted = 0 | **PASS: 0** |
| Deaths attributable to contact-finish attempts = 0 | **PASS: 0** (no vDie row carries `contactFinishAttempted`) |
| Median survival >= baseline −10% | **PASS: 90d vs 90d** (bar 81d) |
| Wave >= 3 field deaths <= baseline + 2 | **PASS: 2 vs 2** (bar 4; same two seeds, 87128 and 87137, on both legs) |
| Lie rate on remaining drive-off lines = 0 | **PASS: 0/1** (the one remaining line uses honest no-weapon wording) |

Instrument accounting (prereg: a mismatch fails the accounting even
if the conversion bar passes): **zero mismatches** — no engine
attempt outside the analyzer's spear-counts-as-melee universe, no
analyzer-universe row left unattempted, no instrument-unclassified
rows on either leg. Baseline leg attempted 0, as it must with the
rule off.

### The three strikes (all analyzer-verified finishable)

- 87121 d79, Greta, Hardlight knife vs 28-HP Callback (28/260, below
  the 15% break line): **killed** (40 dmg).
- 87135 d85, Sigrun, crowbar vs 17-HP Spool: struck for 10 (7 left),
  beast broke away.
- 87135 d87, Francisco, fire-hardened spear vs 7-HP Spool: **killed**
  (16 dmg) — the spear-edge case again, spear named.

### Sense-reads (4 transcripts: 3 strikes + 1 leftover, judged for MEANING)

All three kills read as earned put-downs, not granted fights: a real
single strike, the held weapon named, the beast already below its
break line (28, 17, and 7 HP against 260–280 maxima). Greta's kill
line is the strongest honesty check on the band: her log first says
she "has Crude bow but no arrows — the string stays drawn, useless",
and the kill line then credits the hardlight knife, never the bow —
the two lines agree instead of contradicting. Sigrun's failed strike
reads as a real attempt that fell short (10 vs 17 HP, 7 left stated
before the flight). The one leftover drive-off is the honest pair:
Pasquale "has Phase sling but no arrows", then "drove Ugly-Eyes off
— it broke before it ever closed" — no weapon credited. **No line
anywhere in these 4 transcripts credits a weapon nobody holds.**
(The "Ugly-Eyes" name is the pre-existing monster-naming fixture,
not this arm's.) All 3 attempts are engage intent, as on the pilot;
the intent-gating question still has not arisen on any judged band.

### The win dip: does NOT replicate on confirm

Pilot dip (table/wins 7/8 → 5/8) is absent here: confirm table/wins
are **10/9 on BOTH legs with identical won sets** (87107, 87120,
87121, 87126, 87128, 87132, 87134, 87138, 87141 won on both legs; no
seed flips won → survived-to-cap in either direction). Wins are not
a preregistered bar and this is not re-scored either way; it is
reported because the pilot carried it as the confirm decision item.
The one confirm move is national, not wins: s87135 reached national
on baseline (144d, village-lost) but not on lever (163d,
village-lost) — it won on neither leg, and it lived 19 days longer
on the lever leg. The §15 confirm panel returns `review_required`
on that single signal alone (national scale access 0.5833 → 0.5,
regression_watch); table win rate, table sitting, day-30/60
survival, and community loss are all exactly flat (0 delta). The
panel is the instrument; the six bars above are the judge.

### Trajectory note: s87135 reroutes hard after two conversions

Baseline s87135 produced 47 wave-3 rows and 11 finishable CONTACT
meetings; lever s87135 produced 6 wave-3 rows, 2 attempts, and no
remaining CONTACT meetings. Two conversions rerouted the village's
whole later meeting stream (fewer wave-3 meetings, longer survival,
no national). The mechanism is not identified from these corpora —
same open class as the pilot's win-dip mechanism question, but here
it cost no win. This is a coordinator note, not a bar: nothing in
the preregistration scores trajectory stability, and all six bars
pass. A future arm that wants to claim the rule is trajectory-safe
needs a mechanism account for s87135, not just bar passes.

### Baseline-confirm reuse decision (strict byte rule, honored)

The dead worker's partial baseline-confirm corpus (s87103, s87107)
was NOT reused. A fresh rule-OFF re-run of those 2 seeds reproduced
them in every simulation field but differed at one metadata line:
`anchorCommit` `54642e946806` (dead worker's HEAD) vs `c41b8cb60b44`
(current tip, pilot evidence commit). The task's reuse rule requires
byte-identity, so both files were discarded and the full 12-seed
baseline band was re-run fresh; the fresh s87103/s87107 files then
matched the det-run scratch copies byte-identically (143,533 and
332,274 bytes). No judged number rests on the discarded files.

### EPERM flap windows in this leg

- Coordinator-start flap (2026-11-01 05:19Z, reported in the task)
  did not stall this leg's baseline sweep (05:23–05:28Z, relay
  wrote=12 failed=0, no retries logged).
- Lever-leg relay stall ~05:34–~05:40Z: the relay stopped after
  s87120 and sat on the s87121 write through the flap (sweep
  stderr shows seeds completing while relay output froze; relay
  stderr is buffered behind the retry loop, so no waiting line
  flushed until the flap lifted). When it lifted, the relay
  flushed all remaining seeds in one go: final relay done
  wrote=12 skipped=0 failed=0, all 12 files full-size. A
  flap-blocked write was treated as a retry, not a failure, and
  no file was accepted without full-size verification.
- The two untracked 0-byte pilot lever captures
  (`contactfinish-lever-pilot.jsonl` / `.err`, 2026-11-01 02:11Z)
  were flap casualties with no content; the judged lever-pilot
  corpus is the committed per-seed JSONs, so the empty files were
  deleted, not committed.

### Metric review (for the NEXT run, not this verdict)

- The confirm universe is small (3 attempts; baseline finishable
  13 concentrated 11-on-1-seed on s87135). Conversion 2/3 = 66.7%
  matches the pilot's 4/6 = 66.7% exactly, but on tiny n; pooled
  descriptively that is 6/9 = 66.7%. The rate is stable, the
  sample is thin — a future band with more attempts would firm
  it, but no preregistered bar demands it.
- The lever-leg universe definition (attempted + remaining
  finishable) worked verbatim again: remaining finishable 0, so
  no denominator ambiguity on confirm.
- The baseline-leg lie rate (14/14) is the old-code control, not
  a leak: the baseline leg runs pre-rule code by design. The
  lever leg is where the bar lives (0/1).
- The full-20-seed panel (descriptive only, pooled, never a
  verdict) shows win 0.8 → 0.7 and sitting 0.85 → 0.75 — both
  inherit the pilot dip; confirm alone is flat. Do not cite the
  pooled panel as a confirm result.

### Unmeasured (never zero)

Arc reach, four-realm formation, trap acquisition, counter
discovery, and young-link succession are not in the contactfinish
corpora. The s87135 reroute mechanism is unmeasured (see above).
Intent-gating of the finish (learn-intent meetings) is unmeasured
— no such meeting appeared on either judged band.

### Panel (§15)

`evidence/2026-10-31/sim-contactfinish-a-panel-compare-confirm.{md,json}`
plus `-before-confirm`/`-after-confirm` panel `.json.gz`, and the
full-20-seed descriptive set with `-full` suffix, built by
`scripts/contactfinish-panels-20261031.js` (extended in this leg
with a `[pilot|confirm|full]` band argument; pilot files
untouched). Deviation stated on the face of each compare: the
official panel driver runs sweep-compare registry policies only
and cannot express the leadfeast + fullseat-diag stack +
contactfinish instrument, so panels are built from the sweep
corpora. Contract metrics mapped where observable (won, table,
national, survival30/60, communityLost); the rest null, never
fabricated. Panel is the instrument; prereg thresholds are the
judge.

### Proof and suite

- `scripts/test-contactfinish-20261031.js` (pilot proof, re-run on
  the final branch state): **39/39 passed**.
- `scripts/test-contactfinish-confirm-20261031.js` (new, confirm
  leg): **9/9 passed** — all six bars, both mismatch checks, and
  the baseline zero-attempt control, asserted from the confirm
  corpora, not eyeballed.
- No game-code change was made in this leg, so no new `check.js`
  surface exists beyond the pilot's full run (284 passed, 6
  pre-existing failures, re-verified individually then). The
  panels-script extension is tooling-only and was validated by
  running it (confirm + full compares produced, exit 2 = material
  signal, not an error).

### Village assessment (plain words, confirm band)

On twelve fresh villages, the rule did what the pilot said it
would: villagers who meet a dying beast with a real weapon in
hand try one honest finishing blow — two out of three such tries
put the beast down — and villagers with nothing usable watch it
walk away while the log says so plainly. Villages survive exactly
as long, lose nobody extra, and win exactly as often; the pilot's
worrying win dip did not show up again. The one shadow is a
single village whose whole later story changed course after two
finishing blows — longer life, fewer monster meetings, no
national standing where it had reached it before — and nobody
yet knows why a kill instead of a flight reroutes a village that
far. That question travels with the rule to the coordinator; it
does not overturn six passing bars.
