# sim-partysurvive-b — the launch-party survival-to-the-fight diagnostic

**Verdict: NO-GO, kind NO-PRE-FIGHT-DEATHS** — the judged leg ran
clean on the fresh band (8/8 files, 0 instrument errors, anchor
`8ebca2cf7` on all 8), but the pool it was built to decompose does
not exist on this band: **4 quad launches, 0 pre-fight deaths**.
Every launched member who reached a meeting arrived alive (8/8),
and the only launched-member death in the whole leg happened to a
party that never met its target. There is nothing to classify, so
the frozen 0.90 bar cannot be met — and the instrument proves it
rather than guessing. The leg's real answer is about the pool
itself: quad launches are rare and violently band-variable (4 here
vs 18 on the reference band, 10 of those from a single village),
so a diagnostic priced in pre-fight deaths needs a wider band or a
quad-rate screen before it can say anything at all.

- **Branch:** `sim-partysurvive-b` (base master `e1f002065`,
  journey-establishment r243). Commits: prereg `df51446` (frozen
  2026-11-19 12:54 UTC), instrument `c7cd64327`, BLOCKED evidence
  `112532995`, port `f4d1100ee` (cherry-pick of `5a5343363`),
  prereg correction 2 `8ebca2cf7`.
- **Prereg:** `evidence/2026-11-19/sim-partysurvive-b-prereg.md`
  (frozen 12:54 UTC; corrected 13:07 UTC and 13:21 UTC — both
  before any judged sim; see §1).
- **Analyzer:** `scripts/analyze-partysurvive-b.js`
  (`--selftest` 34/34); **proof test:**
  `scripts/test-partysurvive-b.js` 5/5 (§A green, §B green, §C
  green after the port — it failed loudly on the blocker before
  it); **port proof:** `scripts/test-allyslot3-b.js` **18/18** on
  this branch.
- **Corpus:** `evidence/2026-11-19/perseed-partysurvive-b/`
  (8 files, seeds 105941–105948, 150d, competent verbatim,
  substrate SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1, LAUNCHSURVIVE=1; driver exit 0).
  Analysis: `evidence/2026-11-19/partysurvive-b-analysis.json`.

**EVIDENCE-ONLY:** the ALLYSLOT3 slot code on this branch is a
coordinator-authorized substrate port (see §1). It must NEVER be
merged to master as a game change. This branch holds it only so
the diagnostic could run; the coordinator lands evidence-only or
releases the branch done-abandoned.

## 1. The port (coordinator's option 1) and the two prereg corrections

The first worker finished BLOCKED-SUBSTRATE-MISSING: the fightcap
driver refuses to run without the ALLYSLOT3 slot code, which was
absent from master `e1f002065` (fightcap was NO-GO; the lever was
held, never landed). The coordinator authorized the port:

- Cherry-picked `5a5343363` (sim-fightcap-b's port of held
  sim-allyslot3-b `7efbf26a8`) onto this branch as `f4d1100ee`. It
  applied cleanly — no conflicts (the comment-only conflict in
  `party-wiring.js` the fightcap evidence warned about did not
  recur against `e1f002065`; the cherry-pick auto-merged all
  three files).
- Port verification: the port's diff against its own parent is
  content-identical to the source port's diff — the only
  differences are hunk line numbers and blob hashes (base drift
  between `eccc08af2` and `e1f002065`: speargate #2593 ammo
  naming, bowopen staging). `git diff 5a5343363 -- src/js/…`
  shows only those base differences. `ALLYSLOT3` now appears
  12× in `fieldFights.js`, 3× in `game.js`, 3× in
  `party-wiring.js`; `ally3Vid` 31× in `fieldFights.js`.
- Port proof re-run on this branch: `scripts/test-allyslot3-b.js`
  **18/18** (all §0–§8 checks, including the armed-from-start
  third-ally damage and the frozen shout rounds).
- Prereg correction 2 (13:21 UTC, before any judged sim): the
  frozen substrate was not present on the prereg's base; the port
  restores it on current master (source `5a5343363`, port
  `f4d1100ee`). No flag, seed, horizon, policy, or threshold
  changes. The prereg's "INSTRUMENT ONLY — zero src/js
  game-code changes" line is superseded ONLY by this
  coordinator-authorized substrate port, evidence-only.
- Prereg correction 1 (13:07 UTC, kept intact): death-day
  cross-check is presence-based (the roster is the living roster;
  the dead vanish) and the pool floor is 3 (not 5).

## 2. Judged numbers (frozen bars)

| Bar | Result |
| --- | --- |
| Pool floor (≥6 quad launches AND ≥3 pre-fight deaths) | **FAIL** — 4 launches, 0 pre-fight deaths, 16 members tracked |
| Classification completeness (≥0.90 classified, top cause named) | **FAIL** — 0/0 = n/a, top cause none (0) |
| Survival curve (share alive at meeting + median days launch→death) | **FAIL** — share alive at meeting 1.000 (8/8); median days launch→death null (no deaths); alive +7d 0.938, +21d 0.875 |
| Instrument (0 errors, 8/8 files, cross-check agrees) | **PASS** — 0 errors, 8/8 files, death-day cross-check 9/9 agree, 0 disagree, 0 unchecked, 0 early-vanish |

Per-seed table (quads / members / meetings joined / alive at
meeting / pre-fight deaths / died in meeting / died no-meeting /
survived no-meeting / launchTrack rows):

| Seed | Quads | Members | Meetings | Alive | Pre-fight | In-meeting | No-meeting deaths | Survived no-meeting | Track rows |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 105941 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 105942 | 1 | 4 | 0 | 0 | 0 | 0 | 0 | 4 | 286 |
| 105943 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 17 |
| 105944 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 139 |
| 105945 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| 105946 | 1 | 4 | 4 | 4 | 0 | 0 | 0 | 0 | 90 |
| 105947 | 2 | 8 | 4 | 4 | 0 | 0 | 1 | 3 | 140 |
| 105948 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **4** | **16** | **8** | **8** | **0** | **0** | **1** | **7** | **676** |

The single launched-member death in the leg is a
`died-in-window-no-meeting` death, NOT in the judged denominator:
**gen_uow37wx (Nathan), holder, seed 105947** — launched d47
(Reunion, second launch of the same holder), died d65
(+18d), cause `the wild`, on the road at (3,3), one tile from
Haven. See §7 for the story.

By-cause / by-monster tables are empty (no pre-fight deaths).
Holder vs companion split: 0 / 0. Same-day flags: 0.

## 3. Why the pool is thin — quad launches are rare and band-lumpy

The fresh band launched plenty of parties — **117 launch rows**
across the 8 seeds — but almost all of them are pairs: **4 quads,
0 trios**, the rest duos/solos. The reference band (fightcap-b
arm, seeds 104770–104777) launched 148 times and produced 18
quads — but 10 of those 18 came from ONE village (seed 104771),
5 more from seed 104772, and the other six seeds produced 3
between them. Quad launching is not a steady rate; it is a
property of particular villages that keep launching quads, and a
fresh 8-seed band can easily contain none of them. The pool floor
(6 launches, 3 deaths) was priced from the reference band's
measured rate, but that rate was carried by two villages — the
floor is seed-band luck, not a stable expectation. A diagnostic
priced in pre-fight deaths needs a wider band, a quad-rate screen,
or a longer horizon before it can say anything at all (see §9).

Cross-check: the fightcap sense-miss instrument run on THIS
corpus reads the same nothing — meetings 4, sense-full 2,
**Dead 0**, expedition-ended 1, different-expedition 4. Two
independent instruments agree: no launched companion died before
a meeting on this band. (The `ok: false` on that run is expected:
`reproduceFightcap` checks against the frozen reference table
Dead 10 — it is a reproduction check for the reference corpus,
not a fresh-band expectation.)

## 4. Reference-band validation decomposition (UNJUDGED — not the frozen verdict)

Kept from the first worker's BLOCKED report: while validating,
the analyzer was run on the FROZEN fightcap-b arm corpus (seeds
104770–104777, same substrate) as instrument validation. This is
NOT the judged leg, but it is the only decomposition of the
actual Dead-10 deaths this program has, and the instrument proves
itself on real data.

| | Reference band (unjudged) |
| --- | --- |
| Quad launches / members tracked | 18 / 72 |
| Joined meetings (first per launch) | 11 launches met; 44 members with a meeting |
| Alive at meeting | 37/44 = **0.841** |
| **Pre-fight deaths (died before the FIRST meeting)** | **3** — classified 3/3 = **1.000**, top cause **field-fight (2)** |
| Median days launch→death (pre-fight) | **0** (Q1 0, Q3 0.5) — the deaths land on launch day or the day after |
| Alive +7d / +21d after launch (all members) | 0.847 / **0.569** — barely half a launched party is alive three weeks out |
| Died IN the meeting fight | 4 |
| Died, launch never met (in-window) | 6 |
| Death-day cross-check (presence-based) | 57/57 agree, 0 disagree, 1 unchecked, 0 early-vanish |
| Instrument errors / files | 0 / 8 |

The three pre-fight deaths: Benjamin (visjoin_90), holder, seed
104771 — d125→d126 (+1d), field-fight / linked-v4, The Timeslot
(wave 5); fought THREE aid fights on d126 and died in the third.
Emma Larsen, companion, seed 104772 — d135→d135 (+0d),
field-fight / wave1-3-unrecorded, Gavel (wave 3), died on launch
day. Valeria Quispe, holder, seed 104773 — d109→d109 (+0d),
wounds / wound-fever, died of her wound on launch day, one day
before the meeting. She launched already dying.

Two things the validation run makes plain (still true after the
judged leg): the Dead 10 is not the same population as this arm's
denominator (fightcap's 10 counts companions dead at ANY missed
meeting; this arm counts deaths before the FIRST meeting only),
and the road kills on day 0–1, not day 10. The judged leg adds
the third: on a band without a quad-factory village, the
denominator can be zero.

## 5. Wall numbers (fresh band, judged leg)

| | Fresh band (judged) | Reference band (unjudged) |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wave 5 reached | **0/8** | 3/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Standing ≥200 | 0/8 | 3/8 |
| Survived 150d | 3/8 | 3/8 |
| Median survival | **132.5d** | 147d |

Per-seed (days / end / maxWave / standing / rank): 105941
150 survived / 4 / 199 / regional; 105942 150 survived / 4 /
199 / regional; 105943 94 village-lost / 4 / 150 / regional;
105944 123 village-lost / 4 / 199 / regional; 105945 114
village-lost / 4 / 199 / regional; 105946 142 village-lost /
4 / 199 / regional; 105947 103 village-lost / 4 / 175 /
regional; 105948 150 survived / 4 / 199 / regional.

The wall stands where fightcap left it: no village reaches
national, no seat, no win. Wave 5 did not open on ANY of the
eight fresh seeds (vs 3/8 on the reference band — another
band-variance note, not a regression claim; the substrate is the
same). **Standing 199 on five of eight seeds** (105941, 105942,
105944, 105945, 105946) — the 199 stall is the visible ceiling
again: villages sit one point short of the 200 release bar for
the whole run. The other three seeds ended at 150, 175, 199.

Band-wide villager death causes (79 villager deaths, all causes
across all eight seeds — context, not the judged denominator):
`the wild` 38 (48%), `monster` 12, `the arena` 5, Gavel 4,
`contest` 3, starvation 3, thirst 3, dehydration 2, `a
stranger` 2, The Eater 2, Grief Counselor 1, sickness 1, `a wound
that wouldn't close` 1, lockjaw 1, Loud-Eyes 1. Nearly half of
all villager deaths in the band are the unstoried `the wild`
catch-all — the same class as the leg's one launched-member
death (§7).

## 6. Village assessment, in plain words

Eight villages, same game, same rules as the fightcap arm — and
none of them ever gets a party of four to a wave-4 fight the way
the reference band's villages did. It is not that their parties
die on the road: on this band the parties that launch as four
arrive as four. It is that almost nobody launches as four at
all. The villages launch pairs — two people walking out to hunt
a wave-4 monster — and pairs do not become quads by wishing.
One village (seed 105942) launched a quad against the Eulogy on
day 58 and then never found it: the party hovered at Haven for
the rest of the run while the target was gone by day 150 (no
target alive on the tracker), and
by day 150 the "party" was the holder and one companion. Two
villages did reach their monster within a day of setting out, all
four alive, and both fights ended with the party running
(vFlee) — alive, but no kill. Three villages survived the full
150 days; five were lost, at 94–142 days, all of them sitting at
standing 199 or below, all of them regional, none of them ever
seeing wave 5. The binding picture on this band is not road
deaths. It is that the launch itself is rare, the meeting is
rarer, and the standing bar sits one point out of reach while
the villages wait.

## 7. Sense-test: three member stories read in the transcripts

**Nathan's third shout (seed 105947, d42 — the slot firing in
the wild).** Maria walks straight into The Congregation (wave
4). She strikes, takes hits, binds a wound mid-fight (+20 HP),
and shouts three times: Devon charges in, then Aishatu, then
Nathan — the third shout, the third ally, the ALLYSLOT3 seat
working exactly as ported. Five rounds, 242 damage dealt, and
the party flees with everyone alive. The launch and the meeting
are the same day: the quad set out as four and met as four.
This is the shape the whole program is trying to produce, and
on this band it happens once and ends in a flee.

**Kelsey's two-round Eater (seed 105946, d118).** Kelsey fights
the Eater, takes two heavy hits, binds a wound, strikes once for
26 — and runs while running still works. The encounter row lists
three sensed allies (`allyVids` all three companions) but
`ally3Vid` is null: the fight fled in round 2, before any shout,
so nobody joined. `allyVids` records who was sensed, not who
fought — a reader who takes it as the fighting party will
over-count the third ally. (Instrument note, not a defect claim.)

**Nathan's wild death (seed 105947, d47→d65 — the leg's only
launched-member death).** Nathan is the same man who charged in
on the third shout on d42, and he is the scholar — the player's
own character (`player: true` on the death row). He launches
again on d47 against the Reunion, hunts at (3,3), one tile from
Haven (4,4), for eighteen days: health 84→96, never sick, party
around him (Amina, Aroha, and one more at the same tile), the
target alive and near. Then on d65 he dies to `the wild` — no
fight row, no wound, no monster named, at full health, a tile
from home, with his party beside him. It reads as the engine's
ambient death roll, not as anything that happened to him. The
classifier records it honestly (`the-wild`), but the story is
empty: a healthy person does not die a tile from home for no
reason, and the game gives no reason. Worth a look by whoever
owns wild deaths — `the wild` is 48% of all villager deaths on
this band.

## 8. Panel and telemetry (both refused, verbatim)

**Balanced panel** (`scripts/build-partysurvive-b-panels.js`
built new for this arm; before = frozen fightcap-b arm corpus,
after = this corpus, same substrate, different bands — a
reproducibility reference, not a lever before/after). The panel
tool refuses the unpaired comparison, exactly as the prereg
anticipated:

```
# Balanced campaign comparison

**Decision: invalid**

- Unmatched seeds
- Unmatched origin
- Unmatched cases

Invalid comparisons must be repaired before interpretation.
```

Recorded verbatim; wall numbers are reported directly in §5
instead. The panel files exist
(`partysurvive-b-panel-before.json.gz`,
`partysurvive-b-panel-after.json.gz`, `partysurvive-b-panel.json`,
`partysurvive-b-panel.md`) for a future paired re-run.

**Telemetry deviation check** — refused the recorder corpus,
as fightcap-b's did:

```
telemetry-check: refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here. Pass --allow-recorder-corpus for a same-shape recorder-vs-recorder compare, or --update-baseline to reseed a baseline from these files.
```

Recorded verbatim; no LOUD lines, no deviation to investigate.
The `--allow-recorder-corpus` same-shape compare is a possible
next-run step, not taken here (the prereg prescribes the refusal
path).

## 9. Metric review

1. **The pool floor is seed-band luck, not a rate.** The floor
   (6 launches, 3 deaths) was priced from the reference band's
   18 quads — but 10 of those came from one village (seed
   104771) and 5 from another. The fresh band delivered 4 quads
   and 0 deaths under the identical substrate. A future run
   should either widen the band (16 seeds), screen seeds for
   quad-launch rate first, or re-price the floor as a rate per
   launch rather than an absolute count. As frozen, the verdict
   is the honest one: NO-GO, kind NO-PRE-FIGHT-DEATHS.
2. **The +7d/+21d shares do not censor at the meeting day,
   though the prereg says they do.** The analyzer counts ANY
   death within N days of launch (`deathDay > launchDay + N`),
   including deaths after a meeting the member survived. Marcus
   Webb (seed 105946) died d122, five days after his d117 launch
   but four days AFTER the d118 meeting he walked out of — he
   counts as "not alive at +7d". So the reported 0.938 / 0.875
   read as "alive N days after launch", post-meeting deaths
   included, not "survived the road N days". If the shares are
   ever re-run, either censor at the meeting day per the prereg
   or rename the metric. Not re-scored here (metric binding).
3. **The 0.90 bar on a thin pool is moot at n=0** — the
   reference-band note from the first worker stands: on n≈3 the
   bar effectively requires classifying all of them. Here there
   was nothing to classify at all, which the judge kind names
   directly.
4. **The died-in-meeting split still matters.** Zero members
   died in a meeting on this band (both meetings ended vFlee
   with everyone alive), vs 4 on the reference band. The road
   and the fight kill comparable numbers of launched members
   across bands — just not on this one.
5. **Same-day launch deaths need a closer look** (carried from
   the first worker): two of the three reference-band pre-fight
   deaths happened on launch day. The analyzer cannot tell
   whether the member died before or after the depart call
   within that day. A future instrument could record the depart
   hour / the member's wound state at launch.

## 10. Blanks and findings notes for the coordinator (file these; do not edit sim-findings.md)

- **JUDGED VERDICT: NO-GO, kind NO-PRE-FIGHT-DEATHS** — 4 quad
  launches, 0 pre-fight deaths on the fresh band; instrument
  green. The question "what kills launched parties before the
  fight" has no answer on this band because nothing died before
  a fight. The reference-band answer (unjudged) stands as the
  only decomposition: 3 deaths, field-fight 2, wounds 1, median
  0 days.
- **Quad-launch rate is the binding unknown, not road deaths.**
  117 launches, 4 quads, 0 trios on the fresh band. The next
  arm that needs launched quads should screen or widen the band
  first — or ask why villages launch pairs when the wave-4
  shape needs four.
- **Standing-199 stall, 5/8 seeds.** Five villages sat at 199
  for the whole run, one point short of the 200 release bar.
  Same stall the program has seen before; still the visible
  ceiling on this band.
- **Wave 5 never opened on the fresh band (0/8)** vs 3/8 on the
  reference band, same substrate. Band variance, not a
  regression claim — but the wall numbers move a lot between
  bands, and any wall claim needs the band named beside it.
- **Out-of-scope gap (note only):** `the wild` is 48% of all
  villager deaths on this band (38/79) and the leg's only
  launched-member death is an unstoried one — a healthy holder
  dying a tile from Haven with no fight and no wound (§7).
  Whoever owns wild deaths should look at whether the catch-all
  needs a story.
- **Instrument note:** `allyVids` lists sensed allies, not
  joined ones — the d118 Eater row lists three allies with
  `ally3Vid` null because the fight fled before any shout (§7).
  Do not read `allyVids` as the fighting party.
- **Instrument note:** the safe-commit index clobber struck a
  third time on this branch (the prereg-correction commit
  `8ebca2cf7` left the file `MM` in the main index; commit
  itself correct). Repaired with the documented `git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info` pipe;
  verified by `git status` empty + `git diff HEAD` empty +
  hash-object == HEAD blob. The port commit itself (`f4d1100ee`,
  cherry-pick) was unaffected.
- **Panel / telemetry:** both refused, verbatim in §8. No LOUD
  lines.
- **No `check.js` gate was run** — the port is evidence-only
  substrate, never to be merged; the proof tests
  (`test-partysurvive-b.js` 5/5, `test-allyslot3-b.js` 18/18)
  are the gate for this arm. The ported lever must NEVER be
  merged to master as a game change.
