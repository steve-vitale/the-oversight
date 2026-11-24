# sim-bloodcluster-b — why bloodings cluster on door seeds: density, not conversion

**Arm:** sim-bloodcluster-b · **Loop B run:** fleshout-loop-b-20261124T1030Z
**Axis:** winnability-chain · **Answers:** vetpair
(evidence/2026-11-24/sim-vetpair-b.md) §Next blanks #1
**Verdict: DIAG-GO** (all four frozen bars pass, §7)
**Prereg:** `evidence/2026-11-24/sim-bloodcluster-b-prereg.md` (frozen,
committed before any judged sim; Amendment #1 recorded in the analyzer
header — instrument fix only, bars unchanged)
**Instrument:** `scripts/bloodcluster-b-instrument-20261124.js` (fieldFight
+ startCombat wraps, call-through, RNG-neutral) + the
standing-gearready instrument reused verbatim as the base
**Driver:** `scripts/bloodcluster-b-driver-20261124.js` (run
`bloodcluster-b-v2`) · **Analyzer:**
`scripts/bloodcluster-b-analyze-20261124.js`
**Proof test:** `scripts/test-bloodcluster-b-20261124.js` (analyzer
fixtures + live harness smoke + determinism replay leg; green before
the judged leg)
**Corpora:** `evidence/2026-11-24/perseed-bloodcluster-b/` — v1 smoke
leg, 8 files (RUN `bloodcluster-b`, committed) + v2 judged leg, 16
files (RUN `bloodcluster-b-v2`, committed with this evidence) + 1
determinism replay file (`bloodcluster-b-s109312-bloodcluster-b-v2-replay.json`)
**Analysis:** `/tmp/bloodcluster-b-summary.json` is the finisher's
scratch copy; the numbers below are the analyzer's
`summarizeAll` output on the committed v2 corpus
**Substrate:** competent policy verbatim, default env, horizon 150d
death-aware. Seeds 109310–109325 (16) — a deliberate replay of the
vetpair / standingconfirm band for comparability. Anchor `b7f77443c`
(branch base at prereg time). Zero src/js changes.

## 1. The answer in one paragraph

Bloodings cluster on door seeds because door villages meet far more
wave-4 monsters — not because they fight better. Door seeds see 0.44
wave-4+ contacts per village-day alive from unlock against 0.14 on
non-door seeds (3.15x), while the kill rate per contact is nearly
identical (0.144 vs 0.128, 1.12x) and the wave-3 control kill rate is
dead even (0.41 vs 0.42, 0.97x). The density gap compounds into 3.54x
more kills per day, which is what stacks two living veterans into the
same window: mean gap between bloodings 12.3 days on door seeds vs
35.6 days elsewhere. Party formation is the runner-up, also qualifying
under the prereg rule (party ≥2 at 71% of door kills vs 35%,
2.01x, covering 78% of door bloodings) — the density brings the
fights, the party wins more of them. The two sharpest-looking
candidates fail on coverage: field-fight damage per kill is 4.72x
higher on door seeds (161 vs 34) but covers only a third of door
bloodings, and ally-joins answer 2.40x more door kills but cover only
a sixth. Staying is not a separator at all (fled share 0.63 vs 0.63).
Every one of the 31 bloodings carries exactly one mechanism class;
the instrument links every kill to its fight with zero orphans, and
the 109312 replay is identical kill-for-kill.

## 2. The decomposition — every blooding classified

| Mechanism class | Door (18) | Non-door (13) |
|---|---|---|
| tb-companion | 7 | 0 |
| tb-scholar-party | 5 | 3 |
| field-solo | 4 | 4 |
| field-party-shout | 2 | 1 |
| tb-scholar-solo | 0 | 5 |
| field-party-start | 0 | 0 |
| contest / other | 0 | 0 |
| UNCLASSIFIED | **0** | **0** |

Two splits carry the story. First, **no companion ever bloods on a
non-door seed** (7 door / 0 non-door) and **no scholar ever bloods
alone on a door seed** (0 door / 5 non-door): on door seeds the
killing is done by the party, on non-door seeds the scholar alone
carries five of thirteen first kills. Second, the shout-join is
present but small: only 2 of 18 door bloodings are field-party-shout
(1 of 13 non-door); the party at door kills is mostly already
standing there, not summoned mid-fight.

## 3. Door vs non-door contrast — all four families

| Family / headline rate | Door | Non-door | Ratio |
|---|---|---|---|
| **A — contacts/day (w4+, from unlock)** | 0.437 | 0.139 | **3.15x** |
| A — kills/contact (w4+) | 0.144 | 0.128 | 1.12x |
| A — kills/day (w4+, from unlock) | 0.063 | 0.018 | 3.54x |
| A — kills/contact, wave-3 control | 0.407 | 0.418 | 0.97x |
| **B — party ≥2 share at w4+ kills** | 0.708 | 0.353 | **2.01x** |
| B — mean party at w4+ kills | 2.13 | 1.53 | 1.39x |
| B — party ≥2 share at w4+ contacts | 0.527 | 0.573 | 0.92x |
| **C — mean leader mDealt per w4 field kill** | 161.2 | 34.2 | **4.72x** |
| C — staying share (1 − vFlee) | 0.372 | 0.366 | 1.02x |
| C — vFlee share (w4+ field contacts) | 0.628 | 0.634 | 0.99x |
| C — mean rounds (w4+ field contacts) | 3.07 | 2.77 | 1.11x |
| **D — ally-join share at w4 field kills** | 0.400 | 0.167 | **2.40x** |
| D — shout-join share at w4 field kills | 0.400 | 0.167 | 2.40x |
| D — joiner (visjoin/app) share of blooders | 0.056 | 0.077 | 0.72x |

Dominant-mechanism call (prereg rule — largest headline ratio ≥1.5x
whose channel covers ≥50% of door bloodings): **A, spawn
density / kill rate, 3.15x on contacts/day, coverage 100%**
(every kill flows through a contact). B also qualifies (2.01x,
coverage 0.78) and is named runner-up. C's headline is the largest
ratio in the table (4.72x) but its channel covers only 33% of door
bloodings, so it fails the coverage clause — a real but narrow
effect, not the cluster's cause. D fails the same way (coverage
0.17), and its blooder-level share runs the wrong way (door blooders
are joiners less often than non-door blooders). If no family had
reached 1.5x the verdict would have been NO-DOMINANT; it was not
needed.

Reading the table as a whole: the door/non-door gap is a **volume
gap with a party amplifier**. Contacts/day is the only family whose
headline clears 3x with full coverage; conversion is flat (1.12x,
and the wave-3 control is flat at 0.97x, so door villages are not
better killers in general); the party is bigger at the kill (2.13 vs
1.53) but not at the contact (0.92x — parties do not meet more
monsters, they finish more of the ones they meet); staying is
identical (fled 0.63 both sides — the field-fight flee problem is
band-wide, not a door property).

## 4. Instrument health — the v1 defect and the fix

The smoke leg (v1, 8 seeds, RUN `bloodcluster-b`) proved an
instrument defect before any judged sim: **7 of 20 bloodings
unlinked** — no matching fight record. Root cause, found in the
wraps: `startCombat` is not the only TB entry (it refuses while a
fight is live, so re-entries never produce a row), and the
scholar's villager id changes on succession, so day+mid+leader
matching missed kills whose killer had succeeded. **Amendment #1**
(analyzer header; bars unchanged): TB linkage moved from
startCombat-row matching to settle-time context (`tbKillCtx`) —
party size is now the settle-time party (fighters standing at the
kill), entry party kept alongside, and TB contacts count rebuilt
starts only. The v2 corpus, judged under the fixed instrument:

- 0 instrument errors; 0 orphan log rows; 0 veteran-mismatch days;
  0 duplicate deaths
- 0 unlinked kills band-wide (field 0, TB 0); every wave-4+
  waveKillLog row linked to a killEvent with `entryAdded`
- Determinism: seed 109312 run twice on this anchor yields
  identical killEvents and identical wave-4+ fieldFight rows
- Door grouping verified: daily peak reaches 5 on exactly
  109311–109314
- Vetpair reproduction: overlap 92 event days / 85 snapshot days /
  6 windows, max 4 living veterans — byte-for-byte the vetpair
  census figures
- 92 refused TB starts recorded (the scale of the v1 defect's
  cause: starts refused while a fight was live — now counted as
  rebuilt-only, never silently dropped)
- 1 tb-direct kill linked via tbKillCtx (alien-duel direct build;
  wave null, no startCombat row — linked, not an error)

## 5. Per-seed table

| Seed | Door | Days | End | W4 contacts | W4 kills | Bloodings | W5 unlock | W5 faced | W5 kills |
|---|---|---|---|---|---|---|---|---|---|
| 109310 | – | 150 | survived | 30 | 1 | 1 | – | – | 0 |
| 109311 | D | 150 | survived | 34 | 5 | 4 | yes | yes | 0 |
| 109312 | D | 150 | survived | 61 | 10 | 8 | yes | yes | 2 |
| 109313 | D | 97 | village-lost | 40 | 5 | 4 | yes | yes | 1 |
| 109314 | D | 150 | survived | 32 | 4 | 2 | yes | – | 0 |
| 109315 | – | 96 | village-lost | 7 | 0 | 0 | – | – | 0 |
| 109316 | – | 49 | village-lost | 0 | 0 | 0 | – | – | 0 |
| 109317 | – | 150 | survived | 9 | 1 | 1 | – | – | 0 |
| 109318 | – | 150 | survived | 17 | 3 | 2 | – | – | 0 |
| 109319 | – | 150 | survived | 12 | 1 | 1 | – | – | 0 |
| 109320 | – | 150 | survived | 13 | 2 | 2 | – | – | 0 |
| 109321 | – | 122 | village-lost | 36 | 4 | 3 | – | – | 0 |
| 109322 | – | 150 | survived | 19 | 3 | 2 | – | – | 0 |
| 109323 | – | 68 | village-lost | 6 | 0 | 0 | – | – | 0 |
| 109324 | – | 150 | survived | 2 | 0 | 0 | – | – | 0 |
| 109325 | – | 150 | survived | 12 | 2 | 1 | – | – | 0 |

Band totals: 300 wave-4+ contacts (167 door / 133 non-door), 41
deduped wave-4+ kills (24 / 17), 31 bloodings (18 / 13). Door
villages alive from wave-4 unlock: 382 days; non-door: 957 days.
109312 alone carries 61 contacts and 10 kills — a fifth of the
band's contacts on one seed. 109321 is the busiest non-door seed
(36 contacts, 4 kills) and still bloods only 3 times, 50 days
apart at the end.

## 6. Sense-test — the bloodings, in plain words

**109312, the richest door seed (8 bloodings, gaps 26/6/4/14/2/10/7
days).** The first blood is a generated villager, d57, in a
three-person turn-based fight against the Influencer — the scholar
plus Miguel Santos and Jovan Milic standing with them; the killer
dies d82, 25 days later. Boris Kowalski bloods d89 in the wild
against the Herald: five rounds, 176 damage dealt by Boris himself,
52 by Devon Okafor, who answered the hopeless shout mid-fight —
the only shout-joined blooding on this seed that needed asking.
Aroha Ngata bloods d93 as a companion in a four-person fight
against the Strike, beside Jovan Milic and Grace Obi; Aroha had
first appeared on the roster four days earlier, d89. Grace Obi
bloods d107 as a companion against the Reunion, again with Jovan
beside her. Devon Okafor bloods d109 in a two-person fight against
the Editor, Jovan again at his shoulder; Devon dies d119, ten days
later. Jovan Milic himself bloods d119 as a companion against the
Eulogy — the third blooding in eleven days with Jovan in the party,
the second killer in the pair forming around him. Luis Fernandez
closes the seed d126, alone in the wild against the Spoiler: one
round, 80 damage, none taken, a known trick doing the work. Seven
of the eight bloodings happen with a party standing beside the
killer; the one solo kill is the last, smallest, and cheapest.
Jovan Milic is in five of the eight fight parties without ever
being the scholar — the village's fighting core is a person, not a
policy.

**109321, the sequential non-door seed (3 bloodings, gaps 10 and
50 days).** A generated villager bloods d40 alone against the
Strike in a turn-based fight — party of one, dead d47, seven days
later. A second generated villager bloods d50 against the Eater
with four companions at their back, the biggest party on the seed
— and dies d74 anyway, 24 days later. Then nothing for fifty days:
the third blooding does not come until d100, Tashi Sherpa alone in
the wild against the Herald, six rounds, 71 damage dealt, 31 taken,
no one beside her. The System's own counter tells the same story
in the standing lines: "blood your fighters (0 of 2 veterans)" on
d48, still "(1 of 2 veterans)" on d55 and d62 — the second veteran
never arrives, and the village is lost d122. On 109312 the counter
would have ticked twice in eleven days.

**Judgment.** The numbers and the voices agree: door bloodings
are a crowd event — parties already standing together, fights
arriving every few days — while non-door bloodings are solitary
and spaced by weeks. No line is fabricated, no kill is voiceless:
every blooding has a named killer, a named monster, a party (or
its absence), and a survival afterward. The one soft note: the
saySample carries no kill-beat narration for individual bloodings
— the fight is told by its record (rounds, damage, who answered),
not by a line in the log. That is an instrument limit stated in
the prereg, not a defect in the game.

## 7. Frozen bars — judged

| Bar (prereg §11/§14) | Result |
|---|---|
| 1. Classification completeness — every w4+ blooding carries exactly one mechanism class; 0 unclassified | **PASS** — 31/31 classified, 0 unclassified |
| 2. Dominant mechanism named with counts, coverage ≥50% (or NO-DOMINANT with all ratios) | **PASS** — A, contacts/day 3.15x, coverage 1.0; B named runner-up (2.01x, 0.78) |
| 3. Door vs non-door contrast quantified for all four families, 0 missing cells | **PASS** — §3 table complete; a null is a reported number (staying 1.02x, w3 control 0.97x) |
| 4. Instrument health — 0 errors; every w4+ kill linked; determinism; door grouping verified | **PASS** — 0 errors, 0 unlinked, 0 orphans, 0 mismatches, 0 dup deaths; 109312 replay identical; peak 5 on exactly 109311–109314 |

**Verdict: DIAG-GO.** This is a measurement arm: zero src/js
changes, nothing to land as a lever. What it lands is the
decomposition and the next question (see §10).

## 8. Scale-wall numbers (v2 band)

Wins **0**, national **0** (best standing regional; 109312 peaks
at regional), table 0. Wave-4 faced 15/16 seeds. Wave-5 unlocked
**4/16** (the four door seeds, as frozen), faced **3/16**
(109311, 109312, 109313), kills **3** (109312 ×2, 109313 ×1).
Median survival **150 days, censored** — 11 of 16 seeds reach the
horizon; the five losses are 109313 (97d), 109315 (96d), 109316
(49d), 109321 (122d), 109323 (68d). End states: 11 survived, 5
village-lost. Deaths band-wide 21 villagers; killer
survival after blooding median 12 days (max 50).

## 9. Village assessment — what the village looked like

Sixteen villages on the same band, same competent play, and the
difference between the four that open the door and the twelve that
do not is not courage, gear, or tactics — it is traffic. The door
villages are simply beset: a wave-4 monster every two or three
days, fights arriving faster than the dead can be buried, so the
second killer bloods while the first is still alive. The non-door
villages meet a wave-4 monster once a week or less, and their
killers blood alone, die alone, and are replaced by strangers who
have to start over. The party is the amplifier, not the cause: on
door seeds the party is already standing there because the fights
keep coming; on non-door seeds even a five-person party (109321
d50) cannot manufacture the next meeting. The wall is unchanged by
this arm — no seed reaches national, none wins — but the wall now
has a shape: the wave-4 spawn flow into a village is the thing to
move, and the party is the thing that converts it.

## 10. Next blanks

1. **[open] tb-companion 7/0.** Why does a companion never blood
   on a non-door seed? The companion kill needs a turn-based fight
   with a companion landing the blow — is the companion channel
   itself door-gated (fights only reach TB with a party on door
   seeds), or do non-door companions simply never get the chance?
   A follow-up census of TB entry parties by seed group would
   settle it; this arm's `tbStarts` rows carry the data.
2. **[open] mDealt/kill 4.72x, coverage 33%.** Door field kills
   deal 161 damage against 34 — the largest ratio in the table,
   on 6 vs 5 field kills. Real effect or small-n artifact of the
   six door field kills (two of them 300+ damage outliers, 109313
   at 339)? A confirm band on field kills only would settle it;
   do not build on it yet.
3. **[open] The +1 killer.** This replay counts 31 killers against
   the vetpair census's 30, with overlap days identical (92/85/6).
   One borderline killer lands differently between the two
   instruments/anchors. A one-line diff of the two killer lists
   would name it; filed as a metric-review note (§11), not chased
   here.
4. **[open] 92 refused TB starts.** Starts refused while a fight
   was live, on a 16-seed band — the fight brain's re-entry
   refusal is common enough to be a behavior question (what does
   the player see when the second fight refuses?), not just an
   instrument note. Worth a look by whoever owns the TB entry
   path.

## 11. Metric review

- **Bloodings 31 vs expected 30.** The prereg expected 30 from
  the vetpair census; the replay finds 31 killers with identical
  overlap figures (92 event days, 6 windows, 85 snapshot days).
  The extra killer is a replay-vs-census drift of one borderline
  case (instrument + anchor moved between the arms), not a bar
  failure — bar 1 judges classification completeness (0
  unclassified), which holds at 31/31. Named in §10.3 for a
  one-line diff, not re-run.
- **Killer survival median 12d vs vetpair 15d.** Secondary rate,
  not judged. Same replay drift family as the +1 killer; the
  direction (shorter) is consistent with one extra early-death
  killer in the count. No bar depends on it.
- **B also qualifies.** Under the prereg's dominant rule the
  call is A (largest qualifying ratio), but B clears both
  thresholds too (2.01x, 0.78 coverage). The rule as written
  handles this correctly — largest first — and the evidence names
  the runner-up rather than hiding it. No revision proposed.
- **C's headline is the largest ratio and still loses.** The
  coverage clause did exactly the work it was written for: a
  4.72x ratio on 6 kills must not name the mechanism. No
  revision proposed.
- **No re-scoring.** Every bar was judged as frozen. The v1
  smoke leg's defect was an instrument fix (Amendment #1),
  recorded before the judged leg; the judged leg is the v2
  corpus only, and the v1 corpus stays committed as the smoke
  leg that proved the defect.
- **Check status.** The proof test
  (`scripts/test-bloodcluster-b-20261124.js`) is re-run green on
  the rebased tip by the finisher (see round record); the full
  repo gate is run once at round closeout (round record §gate),
  not per arm.
