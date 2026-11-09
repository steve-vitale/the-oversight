# sim-sicknessdiag-b — the sickness-disease second measurement (DIAG, zero src/js)

**Arm:** sim-sicknessdiag-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1530Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sicknessdiag-b, base master `0ba20ac1c` · **Prereg:** `evidence/2026-11-09/sim-sicknessdiag-b-prereg.md` (committed before any judged computation; no corrections after) · **Instrument:** winseek sweep (`scripts/sweep-sicknessdiag-b.js`, feveranat wrapper pattern + healerRounds wrapper + lean daily healer snapshot + say-wrap + fallen read at end) + analyzer (`scripts/analyze-sicknessdiag-b.js`, reuses the prefloor `classifyCause` and the feveranat `buildEpisodes` read-only). Corpora committed under `evidence/2026-11-09/perseed-sicknessdiag-b/` (8 winseek corpora + 8 bare fingerprints + `sweep-winseek.json`). Proof `scripts/test-sicknessdiag-b.js` **58/58 green, 0 failed, 0 skipped**.

## Verdict: DIAG-NO-GO

**The measurement does not support a medic/wound-care lever — because there is
no fever-death burden left to attack on this band.** The wound-chain
decomposition is complete and the answer is the opposite of the prereg's
hypothesis: all 5 pre-90 sickness-disease deaths are `a wound that wouldn't
close` with **no fever episode at all** (0 wound-first, 0 sickness-first, 5
unlinked-verified), wound_fever kills **0 of 36** episodes, tick fever kills
**0 of 101**, and the healer is present on **93.8% of village-days** with the
medic duty curing **73 infections the night they start**. The fever channel
the prefloor band measured as the runner-up (23/154, 14.9%) has collapsed to
**5/99 (5.1%)** on this band, and what remains is not fever — it is the daily
wound-attrition roll finishing villagers whose HP crashed in the day's
fighting. The arena (12/99, 12.1%) has overtaken sickness as the runner-up.

Two distinct reasons, stated separately because they are different failures:
1. **The lever-naming rule failed on the mechanism, not on noise.** Wound-first
   0/attributed (bar ≥50%); healer-absent wound_fever deaths 0 (bar ≥3, and
   there are 0 healer-absent wound_fever episodes at all — no contrast
   exists to measure). The hypothesized mechanism (wound_fever deaths with
   healer-absent mortality) does not exist on winseek / current master.
   Kill taxonomy (§14a): **CONCEPT-DEAD** for the hypothesized mechanism —
   the mechanism was staged, the lever rule was fair, and the concept failed
   on its merits: the fever channel is already healed here. Do not retry a
   medic/wound-care lever on this substrate without a new mechanism.
2. **G1 missed as written (5 unlinked vs the ≤2 bar).** The bar is
   **METRIC-BROKEN** (mis-scoped — see Metric review): it treated every
   unlinked death as an instrument gap, but all 5 are verified attrition
   deaths (no episode at any time for 4 of 5; the fifth's only episode was a
   wound_fever cured 6 days before death; no snapshot record on any death
   day; the single code push-site for the cause confirmed). The run is NOT
   re-scored under a revised bar — the verdict stands as DIAG-NO-GO.
   **No confirm spend** (prereg: confirm only on pilot DIAG-GO).

**Status of the bars:** (1) G1 classification — bar MISSED as written (5
unlinked > 2; every death assigned to exactly one chain class, raw census
printed, 0 missing days). (2) G1 det-gate — PASS (proof 58/58). (3) G2
neutrality — PASS on all 8 seeds (recorded == bare fingerprints; judged on
58202 + 58206). (4) G3 corpus integrity — PASS 8/8. (5) Gate/contradiction
flags — PASS (zero sit-verb calls, zero door-verb calls). (6) Smoke gate —
PASS (1 seed in /tmp before the sweep; corpus parsed, fallen present,
episodes built, no instrument errors).

## The question as asked, answered

The prefloor DIAG found pre-day-90 deaths under winseek wild 76.6% (118/154)
with sickness-disease the runner-up at 23/154 (14.9%), led by `a wound that
wouldn't close` (14); the party-up build arm that was supposed to attack the
wild deaths was KILLED at pilot (armed pre-90 wild 77 vs control 86, bar
51.6; floor 3/8 vs 4). This arm decomposed the runner-up on winseek, on a
fresh band (58201–58208). The decomposition says the runner-up is no longer
a fever story at all: 5 wound deaths, 0 fever deaths, 0 cures needed because
the duty already cures everything it touches, and a healer in camp nearly
every day. The second killer on this band is the arena, not sickness — and
the wound deaths that remain are the tail of the wild deaths (fight damage
finished off by the nightly wound roll), not a disease burden with its own
lever.

## Per-seed classification table (winseek leg — the judged leg)

| Seed | Days | End | Floor? | Fallen | pre-90 | wild | arena | starv | sick | other |
|---|---|---|---|---|---|---|---|---|---|---|
| 58201 | 104 | village-lost | YES | 21 | 17 | 14 | 0 | 2 | 1 | 0 |
| 58202 | 78 | village-lost | no | 9 | 9 | 8 | 0 | 0 | 1 | 0 |
| 58203 | 115 | village-lost | YES | 22 | 12 | 10 | 0 | 0 | 2 | 0 |
| 58204 | 91 | village-lost | YES | 14 | 12 | 8 | 4 | 0 | 0 | 0 |
| 58205 | 113 | village-lost | YES | 14 | 9 | 6 | 3 | 0 | 0 | 0 |
| 58206 | 82 | village-lost | no | 17 | 17 | 14 | 1 | 0 | 1 | 1 |
| 58207 | 75 | village-lost | no | 15 | 15 | 12 | 3 | 0 | 0 | 0 |
| 58208 | 58 | village-lost | no | 8 | 8 | 7 | 1 | 0 | 0 | 0 |

**Band split — primary set (all pre-90 deaths, n=99): wild 79 (79.8%), arena 12 (12.1%), starvation 2 (2.0%), sickness-disease 5 (5.1%), other 1 (1.0%). Dominant: wild, MEETS the 50% bar.**
**Band split — subset (deaths in villages ending before day 90, n=49): wild 41 (83.7%), arena 5 (10.2%), starvation 0 (0.0%), sickness-disease 2 (4.1%), other 1 (2.0%). Dominant: wild, MEETS the 50% bar.**

**Raw cause census (pre-90 deaths, all causes, nothing hidden):** `the wild` 62, `the arena` 12, `monster` 10, `a wound that wouldn't close` 5, `starvation` 2, `ambush` 2, `Gavel` 2 (wild — signature-monster kill, `monsterName` set), `Buffering` 1 (wild, `monsterName` set), `a stranger` 1 (wild), `thirst` 1 (other, named), `Ugly-Eyes` 1 (wild, `monsterName` set). Fallen entries with a missing day: 0. No `sickness` or `wound_fever` fallen cause fired on this band at all — every sickness-disease death is the wound cause.

## The wound-chain join (primary metric — all 5 deaths)

| Seed | Day | Victim | Cause | Chain | Episode? | Onset→death | Treated? | Healer@onset | HP day before | Healer@death day | Rounds 7d |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 58201 | 54 | Nora Wilson | a wound that wouldn't close | unlinked | none ever | — | — | — | 31 | true | 4 (d50 14→29, d51 12→27, d52 3→18, d53 19→34) |
| 58202 | 39 | Benjamin Oliveira | a wound that wouldn't close | unlinked | wound fever d33→33, cured (6d before death) | — | — | — | 14 | true | 2 (d34 18→33, d35 36→51) |
| 58203 | 27 | Kathleen Stepanov | a wound that wouldn't close | unlinked | none ever | — | — | — | 95 | true | 1 (d27 2→17) |
| 58203 | 80 | Xavier Dubois | a wound that wouldn't close | unlinked | none ever | — | — | — | 86 | true | 0 |
| 58206 | 65 | Halima Akinkuotu | a wound that wouldn't close | unlinked | none ever | — | — | — | 88 | true | 1 (d62 52→67) |

**Chain counts: wound-first 0, sickness-first 0, unlinked 5 (attributed 0 of 5).**
**Onset→death days: n/a — no death has an episode onset to measure from.**

### Why unlinked is verified attrition, not an instrument miss

Each of the five was checked four ways, and all four agree the fever chain
is genuinely absent:
1. **No episode at any time.** Four victims never had any sickness episode
   in the whole run; Benjamin's only episode was a wound_fever contracted
   d33 and cured the same tick, six days before his d39 death — the fever
   was gone long before the wound killed him.
2. **No snapshot record.** No death-day daily snapshot shows any `sickMap`
   record for any victim.
3. **The code has one push site for this cause.** `a wound that wouldn't
   close` is pushed as a fallen cause in exactly one place
   (src/js/game.js:28916 registerDeath + 28924 fallen push): the
   `villageLives()` wound roll — a picked villager rolls a bad day,
   -15..-28 HP, and dies at HP ≤ 0. (The only other occurrence of the
   string is the awayNews notification line.) Every one of these five
   deaths is that roll.
4. **The HP trajectories fit attrition, not fever.** Nora bled down over
   days (95→98→57→12→43→31→17) despite four daily healer rounds; Benjamin
   swung 93→18→79→14 across days. The healer rounds (+15/day, one patient
   per day) roughly cancel one wound roll (-15..-28/day) — a villager who
   keeps rolling wounds bleeds out slowly in plain sight.

One measurement gap, named honestly: for three deaths (Kathleen 95, Xavier
86, Halima 88 HP in the morning snapshot) the HP crashed during the policy
day itself — Kathleen 95→2 on d27, the same day the deathSays record Big
Beast dying — and the wound roll that night was only the final blow. The
damage that set those three up is not attributed in this corpus (no
per-villager fight-damage record was kept). The next run that wants the
full chain should record `hurtVillager` damage per villager per day; this
arm names the gap rather than guessing the fight.

## The fever channel is healed on this band

- **Episodes: 146 (NPC 145, scholar 1).** By disease: `disease` (tick fever)
  101, `wound_fever` 36, `bad belly` 6, food poisoning (raw) 3. By vector:
  tick 100, wound 36, unsafe food 6, raw food 3, food 1. By outcome:
  recovered 64, cured 73, died of another cause (the wild) 7, open at run
  end 1, recovered (expired) 1. **Died of fever: 0 of 146.**
- **Wound_fever (NPC): n=36, died-of-fever 0.** 22 cured same-tick (0-day),
  12 recovered, 2 died in the wild while sick. Healer present at onset on
  **36/36**; healer absent at onset on **0**. Treated 24/36.
- **Tick fever (NPC): n=101, died-of-fever 0.** 51 cured same-tick, 43
  recovered, 5 died in the wild while sick, 1 open, 1 expired.
- **Healer-present vs healer-absent mortality: not computable** — there is
  no absent arm (present 0/36, absent 0/0). The lever rule's 2× condition
  cannot be evaluated because the contrast the medicdiag band had (present
  2/12 vs absent 18/31 wound_fever deaths) does not exist here.
- **Why it is healed — the substrate changed since feveranat.** Haven
  Medic Duty LANDED on master (d910dc6da, sim-medicduty-a; Steve ruled
  2026-11-08 roster medics CAN cure by ability OR proper medicine). On
  this band the duty cured **73 infections the night they started**
  (dutyCure events 73, game-counter `medicDutyCures` total 73 — capture
  73/73; all 73 synthesized as 0-day cured episodes, 22 of them
  wound_fever). The care pass runs inside the same tick that creates the
  infection, so a fresh wound_fever is cured before any snapshot ever sees
  the villager sick. What the duty does not cure the same night mostly
  recovers on its own (median 3 days, as on the feveranat band).
- **Medic presence (daily series): village-days 711, healerDays 667
  (93.8%), medicDays 470 (66.1%).** NPC sick-days healer-present 243,
  healer-absent 22. Per seed: 58201 100/103, 58202 77/78, 58203 96/115,
  58204 91/91, 58205 112/112, 58206 81/81, 58207 53/74 (medicDays 0 — no
  roster medic at all; the scholar is the healer there), 58208 57/57. The
  healer is usually the scholar as well as, or instead of, a roster medic:
  roster-medic days are two-thirds of days; the rest are scholar-healer
  days under the `campHealerId` definition. Compare the competent bands:
  healer present 64.2% of days (feveranat) / 61.5% (medicdiag live leg).
- **Wound-care availability: healerRounds events 307, distinct patients 83,
  total HP gained 4605.** TreatEvents by kind: villagerCare 21, dutyCure
  73, sickRest 1 (total 95). tendVillager wound-care events 0,
  treatVillager calls 0 (cured 0), diagnoses 0, cureEvents 0. The
  scholar-side cure channels never fire under winseek (no treatVillager /
  tendVillager calls at all) — but nothing needs them: the duty + rounds
  already cover the burden. VillagerCare tends are 21 against 146
  episodes — tending is rare because the duty cures first.
- **The 7 'died in the wild while sick' episodes** (2 wound_fever, 5 tick
  fever) are wild deaths with a sickness comorbidity: the fever did not
  kill them, the wild did. They count as wild deaths in the split, as the
  classifier provides.

## The arena is the new runner-up (secondary finding)

Arena deaths are 12/99 pre-90 (12.1%), against 5/154 (3.2%) on the prefloor
band (seeds 58204: 4, 58205: 3, 58207: 3, 58206: 1, 58208: 1). The
sickness-disease share fell (14.9% → 5.1%) while the arena share rose —
but the two bands are different seeds on different bases (prefloor base
5e79679e4; this base 0ba20ac1c, which includes the medic duty landing and
the alien-player expansion), so this is a secondary finding, not a verdict:
the arena deserves its own decomposition before anyone leans on it. The
wild share is unchanged in character (79.8% vs 76.6%).

## Wall numbers (winseek leg)

- Floor-reach **4/8** (58201 d104, 58203 d115, 58204 d91, 58205 d113).
- National **0/8**, table sits **0/8** (no seat-walking by design), wins **0/8**.
- Wave-4 unlocks **8/8**, wave-5 unlocks **0/8**.
- True median survival **86.5d** (sorted 58, 75, 78, 82, 91, 104, 113, 115).
- Sit-verb calls across the band: **0**. `takeseatStats.seatTaken` n/a
  (winseek leg carries no takeSeat drive); `doorVerbMsgs` 0 on all 8 corpora.

## Village assessment — what the band's villages looked like (plain words)

Eight villages, all lost, none past 115 days. They are the same deed-seeking
villages the prefloor band buried — the scholar walks out to fight, usually
alone, and usually dies: 79 of 99 pre-floor deaths are in the wild, and the
arena takes another 12. But the sick beds tell a different story than they
did a month ago. Fever is everywhere — 146 episodes, half the villagers
catch something — and nobody dies of it. Someone is always at the sick bed:
a healer is in camp 19 days out of 20, and when a wound turns feverish in
the night, the medic on duty cures it before morning more often than not
(73 times on this band). The villages still die, but they die with their
boots on, not in their beds. The five who died of wounds are the exception
that proves it: Nora, bound up four days running while her health slid
from 95 to 17, because the healer can only tend one person a day and the
wounds kept coming faster than the bandages; Kathleen, healthy at breakfast
and dead by nightfall after something big took 93 health off her in a
single day; Xavier and Halima, healthy in the morning and gone by
nightfall, the damage that set it up invisible to the record. The wound
deaths are the tail of the fighting, not a plague — and there is no
medic-shaped lever left to pull on this substrate, because the medics
already won.

## Sense test — three pre-floor wound deaths, read aloud

**58201, day 54 — Nora Wilson dies of a wound (her village's 12th fallen;
the village ends day 104).** The death lines land as a sequence, and they
cohere: the Codex page turns on its own — "Nora Wilson is dead. You didn't
ask. It knew." — and in the same breath a raid comes in the night
("Ashford came in the night… Nobody's dead, but the message is clear").
The say-window for the day shows the triage choice that killed her: "🩹
You make rounds — Fernando gets bound up properly. (9 → 24 HP)." The
healer treated the most-hurt villager — Fernando at 9 — and Nora, at 17,
was second in line. There is only one round a day. The fiction is honest
about what the numbers say: the healer had to choose, and the choice had
a price. The village is also starving that day ("⚠ STARVING: health and
energy falling. You went to bed on an empty stomach") — the wound death
lands inside a hungry village, not instead of it.

**58203, day 27 — Kathleen Stepanov dies of a wound (her village's
shortest-lived stretch; the village ends day 115).** The deathSays for the
day are polluted by the Codex kill feed, as the prefloor backlog item (d)
warned: "📖 The Codex turns a page on its own. Big Big is dead." / "The
Big Beast is dead." / "Kathleen Stepanov is dead." — three deaths in one
feed, two of them monsters. Between the lines, the day itself is legible:
a storm is coming ("The sky to the west has gone the color of a bruise"),
the System files a request for the sky to be less bruised, and the healer
binds Kathleen up at 2 HP ("🩹 You make rounds — Kathleen gets bound up
properly. (2 → 17 HP)") — fifteen minutes too late, or one wound roll
too many. She fought something big that day and bled out that night. The
fiction knows what happened; the instrument just cannot name the fight.

**58202, day 39 — Benjamin Oliveira dies of a wound.** The quiet one:
"Benjamin is gone — dead. The errand dies with them; nobody's waiting on
those dandelions now." No drama, no choice, no monster named — a villager
whose wound fever was cured six days earlier, whose health swung 93→18→79
across the week, dead on a day the village was also starving ("⚠
STARVING… The spiral has started"). The village carries on around him:
lessons by the fire, snare-tying, barter. That is the sense of these five
deaths — they are not plague deaths, they are attrition deaths, and the
village treats them as weather.

One instrument note from the sense read (backlog, not verdict): the
`deathSays` sample is still polluted by the Codex kill feed ("📖 The
Codex turns a page… X is dead" for every monster kill, dozens per run) —
the prefloor backlog item (d) again. The fallen list remains the reliable
death record; the deathSays sample in this evidence is quoted only where
the line is unambiguously a villager death.

## Metric review

- **Metrics held, except G1's unlinked bar.** The primary metric (wound-chain
  attribution of pre-90 sickness-disease deaths) was judged exactly as
  pre-registered: all 5 deaths assigned to exactly one chain class, raw
  census printed, 0 missing days. The G1 sub-bar (unlinked ≤ 2) missed at
  5 — and the miss is classified **METRIC-BROKEN** (mis-scoped), not a
  measurement failure: the bar treated every unlinked death as an
  instrument gap, but the investigation proves all 5 are verified
  attrition deaths (no episode at any time for 4 of 5; the fifth's only
  episode cured 6 days prior; no snapshot record on any death day; the
  single code push-site for the cause confirmed). The bar conflated a
  legitimate chain outcome (attrition death with no fever) with an
  unexplained one. **Proposed revision for the NEXT run:** split unlinked
  into unlinked-verified (no episode at any time + no snapshot record +
  death via the single attrition push site) vs unlinked-unexplained, and
  put the ≤2 bar on unexplained only. Under the revised metric this run
  has 0 unexplained. The run is NOT re-scored: the verdict stands as
  DIAG-NO-GO on the preregistered bars.
- **The lever-naming rule was fair and it failed on the merits.** 0
  wound-first deaths, 0 healer-absent wound_fever episodes, 0 fever
  deaths of any kind — the rule's conditions could not be met because the
  mechanism does not exist on this band, not because the band was too
  thin to see it (146 episodes, 36 wound_fever, 711 village-days — the
  instrument saw the fever channel clearly; it saw it healed).
- **The 50% wound-first bar did its job by failing.** A wound-first share
  of 0% with a complete join is a decisive answer, not a marginal one.
- **No other metric proved wrong.** The full five-class split was
  re-derived on this band rather than assumed from prefloor (wild 79.8%
  vs 76.6% — agrees on dominance; sickness-disease 5.1% vs 14.9% and
  arena 12.1% vs 3.2% — the secondary finding above, reported as a
  finding, never used to re-pick the question). The doorwalk secondary
  leg was not run (single-leg DIAG by prereg design); the policy-vs-game
  read therefore rests on the prefloor band's two-leg agreement, not on
  this arm.
- **Day-gap note (instrument, not a metric failure):** daily snapshots
  are missing on a few days per seed (e.g. 58201 day 4; 58206 days 2, 4)
  because the clock can advance >1 day per policy.daily call
  (multi-day travel/legs). The G3 length rule (daySeries == daysAlive or
  daysAlive-1) held on all 8 seeds; the gaps are recorded as notes naming
  the day, per the feveranat G3 precedent. The wound-chain join reads
  episodes (authoritative) with snapshots as corroboration, so a missing
  snapshot day cannot flip a chain — but a death falling exactly on a
  gap day would join on episodes alone. None of the 5 deaths falls on a
  gap day (verified: death days 54, 39, 27, 80, 65 all have snapshots).

## Telemetry deviation check (loop-body step 10)

Ran `node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-09/perseed-sicknessdiag-b/sicknessdiag-b-winseek-s*.json'
--metrics national,table,wins,exiled`:

```
LOUD: national disappeared: baseline 12 -> current 0 (n=8 files)
LOUD: table disappeared: baseline 16 -> current 0 (n=8 files)
LOUD: wins disappeared: baseline 16 -> current 0 (n=8 files)
```

Verdict: EXPLAINED REGIME ARTIFACT, not a bug. This is exactly the outcome
the prereg predicted — winseek never sits or wins by design, national is 0/8
on this band, and the baseline was seeded from a different regime (the
prefloor and medicdiag arms hit the identical LOUD lines for the same
reason). No investigation item. The baseline was NOT rolled forward
(`--update-baseline` not run).

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- (a) **NO MEDIC/WOUND-CARE LEVER ON THIS SUBSTRATE (this arm,
  DIAG-NO-GO).** Pre-90 sickness-disease deaths under winseek are 5/99
  (5.1%), all `a wound that wouldn't close` with no fever episode; wound
  fever kills 0/36, tick fever 0/101; healer present 93.8% of days; the
  medic duty (landed d910dc6da) cures 73 infections the night they start.
  The hypothesized mechanism (wound_fever deaths with healer-absent
  mortality) does not exist here. CONCEPT-DEAD for that mechanism on
  winseek/current master; do not retry without a new mechanism.
- (b) **THE ARENA IS THE NEW RUNNER-UP (12/99, 12.1%, vs 5/154 on the
  prefloor band).** Next decomposition candidate once the winnability
  chain needs it — the arena deserves its own DIAG before anyone leans
  on it, and the band/base confound (different seeds, medic-duty landing
  in between) must be controlled.
- (c) **WOUND DEATHS ARE THE TAIL OF FIGHT DAMAGE, NOT A DISEASE
  BURDEN.** Three of the five wound deaths (Kathleen, Xavier, Halima)
  crashed from healthy morning HP during the policy day and died on the
  night's wound roll; the damage that set them up is not attributed in
  this corpus. Next run that wants the full chain: record `hurtVillager`
  damage per villager per day.
- (d) **HEALER ROUNDS TREAT ONE PATIENT A DAY — THE TRIAGE CHOICE HAS
  A PRICE.** Nora died at 17 HP on the day the healer bound Fernando up
  at 9 HP instead (one round per day, most-hurt first; +15 vs a
  -15..-28 wound roll). Whether one-patient-a-day is the right shape is
  a design question (Steve-call), not a measurement: the duty already
  covers fever; the rounds are the only wound-care channel and they
  cannot outrun repeated wound rolls.
- (e) **THE `deathSays` SAMPLE IS STILL POLLUTED BY THE CODEX KILL
  FEED** (prefloor backlog item (d), still open) — restrict the say-wrap
  death capture to the ledger death line / villager-death verbs before
  the next driver reuses it.
- (f) **SCHOLAR-SIDE CURE CHANNELS NEVER FIRE UNDER WINSEEK**
  (treatVillager 0 calls, tendVillager wound-care 0, diagnoses 0) — the
  scholar's cure ladder exists but winseek never uses it on villagers;
  nothing needs it while the duty covers the burden, but a policy that
  never tends is a standing gap in the winseek substrate.

## Convergence state

**converging** — the sickness-disease half of the pre-floor decomposition is
now closed with a measured answer (the fever channel is healed on current
master; the remaining wound deaths are fight-damage attrition, not a
lever), and the wild half stays open (wild 79.8% dominant, party-up killed
at pilot). The axis (scale-onramp / winnability chain) is NOT converged:
national stays 0/8, wave-5 stays 0/8 under winseek, wins stay 0/8, and
floor-reach is 4/8 at an 86.5d median. Next work on this axis is the
flee-repair build and the standing-accumulation arm (per the Loop B queue),
not more sickness measurement.

## Proof

`node scripts/test-sicknessdiag-b.js` — **58/58 green, 0 failed, 0 skipped**
(G1 classifier fixtures for all five classes + `the night`/`betrayal` →
other-NAMED + the monsterName rule + unknown-cause → other-named; wound-chain
join fixtures wound-first / sickness-first / unlinked / snapshot-only + the
discriminating fixture E (wound-cause death with a tick-fever episode open
→ sickness-first) + broken-join sensitivity; checkCorpusDiag fixtures;
broken-classifier sensitivity ×3; G2 real neutrality on 58202 + 58206
(recorded == bare fingerprints); G2 determinism (58201 twice → identical
per-seed JSON); G2 real legs: zero sit-verb calls, fallen present with day +
cause, episodes built, zero instrument errors; G3 real integrity on all 8
pilot corpora). Analyzer: `node scripts/analyze-sicknessdiag-b.js
evidence/2026-11-09/perseed-sicknessdiag-b evidence/2026-11-09/perseed-sicknessdiag-b`
— full output saved at `/tmp/sicknessdiag-analyze-full.txt` (read work, not
committed). Smoke gate: 1 seed (58201) in /tmp before the sweep — corpus
parsed, fallen present, episodes built, G3 PASS.

## Files committed with this evidence

- `evidence/2026-11-09/sim-sicknessdiag-b-prereg.md` (already committed: `fd95674de`)
- `scripts/sweep-sicknessdiag-b.js`, `scripts/analyze-sicknessdiag-b.js`, `scripts/test-sicknessdiag-b.js` (new: driver, analyzer, proof — instrument commit, this run)
- `evidence/2026-11-09/perseed-sicknessdiag-b/` (8 winseek corpora + 8 bare fingerprints + `sweep-winseek.json`)
