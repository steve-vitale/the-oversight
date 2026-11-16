# sim-trickshare-a — JUDGED EVIDENCE (PILOT NO-GO)

Loop A run `fleshout-20261116T2015Z`, axis winnability chain, arm
sim-trickshare-a — LEVER FORM of the tricklearn DIAG finding: the
TAUGHT channel is dead. Judged strictly against the frozen prereg
`evidence/2026-11-16/sim-trickshare-a-prereg.md` (never altered).
Adopted by a fresh worker from the dead 2015Z run (coordinator
adoption, run `fleshout-20261116T2215Z`).

**Verdict: PILOT NO-GO — lever KILLED, reverted, evidence-only
(net src/ diff 0).** The taught channel FIRES — 65 taught
observations, 25 of them wave-4/5, every one voiced at the fire —
and the gate's trick-known rate more than triples, but all-origins
wave-4 kills tie 5–5 and launched kills are 0–0. Trick knowledge
was the binding constraint in the DIAG; after this lever it is not.
The next lever must aim at the gate/launch decision or the damage
math, not at trick knowledge.

## Frozen bars (prereg) — judged

| Bar | Control | Armed (TRICKSHARE=1) | Result |
| --- | --- | --- | --- |
| (a) Taught observations > 0, armed | 0 taught rows | **65 taught rows (25 wave-4/5)** | PASS |
| (b) Gate trick-known rises vs control | 1/63 (1.6%) | **3/44 (6.8%)** — count and rate both rise | PASS |
| (c) PRIMARY: all-origins wave-4 kills, rounds ≥ 1, distinct meetings | 5 | **5** (rows 8, 0-round 3) | **FAIL — tie, not >** |
| Cost: starvation armed ≤ control + 2 | 4 | 2 | PASS |
| Cost: median survival armed ≥ 0.8× control | 150.5d | 151d (0.8× = 120.4d) | PASS |
| Cost: §15 panel deaths/100d not regression_signal | 66.02/100d | 53.83/100d, panel `no_material_signal` | PASS |
| Instrument clean: 0 errors, 8/8 parse both legs | 0 errors, 8/8 | 0 errors, 8/8 | PASS |
| D1 + D2 green, D3 CLEAN or IDENTICAL | — | D1 ✓ D2 ✓ D3 **CLEAN 8/8** | PASS |

Analyzer: `node scripts/analyze-trickshare-a.js` — exit non-zero on
the bar failure; full log `evidence/2026-11-16/trickshare-a-analysis.log`,
JSON `evidence/2026-11-16/trickshare-a-analysis.json`.
§15 panel: `evidence/2026-11-16/trickshare-a-panel.md` (+
`trickshare-a-panel.json`, before/after `.json.gz`) — decision
**review_required** (deaths/100d `no_material_signal`; national
scale access 0→0; table win 0→0).

## The run, in plain words

Eight villages each, same eight seeds (102601–102608), 150 days,
competent policy, the ONLY difference the `TRICKSHARE=1` flag.

On the armed leg, villagers who survived an encounter came home
and told the tale at the fire — 85 pending offers, 65 of them
turning into taught observations within a day or two of the telling
(median delay 2 days, longest 19). The village learned 25 wave-4/5
tricks this way, including 9 of the 10 wave-4 species (every one
but the Algorithm) and 5 of the 10 wave-5 species. The telling was
voiced every time: 50 hearthside learn beats naming the teacher and
the listeners, 16 teach-on-learn beats naming the party who were
there. The channel the DIAG found dead is now alive and loud.

And it changed nothing where it counts. Launched parties fought 11
wave-4 fights on the armed leg (6 on control) and killed nothing
on either leg. Every launched fight ended evaded, fled, or dead.
The one launched fight where the party KNEW the trick — Javier
Cusi's party against the Herald on seed 102604, day 88 — still
fled after three rounds having dealt 62 of 621 damage. Knowing
how the beast is fought does not make a hunting spear hurt it
enough. The five wave-4 kills on each leg are wild fights, and
most of them are finish-offs of beasts already nearly dead when
met (see metric review). The gate never once said "seek" on either
leg (0/63 control, 0/44 armed) and was mostly not even consulted
before launched fights (10 of 11 armed launched fights have no
gate row). The lever moved knowledge; the wall is now the launch
decision and the damage numbers, and neither moved.

## The lever played

Hearthside trick teaching (`TRICKSHARE=1`, default off): a survived
observation records a pending share; at the next dawn, if the
teacher is home at Haven with listeners at the fire, the telling
credits a taught observation on the shared bar — the second
observation, so the trick is learned (threshold stays 2; waves 1–2
learn through `discoverMonsterCounter(mid, 'taught')`, waves 3–5
through `state.villagerTricks`). Teach-on-learn voices the party
who were there when a trick is learned in the field. No gate
change, no party change, no damage change, no seed call.
`src/js/game.js` (+204 lines), `src/js/fieldFights.js` (1 line:
party threaded into the observation call). Env-gated in exactly
one place (`trickShareEnabled()`); default-off verified by the
proof's static off-mode check and by the control leg (0 taught
rows, 0 offers, `trickShareEnabled: false`).

**Reverted after the NO-GO** (prereg: pilot NO-GO kills the lever).
`src/js/game.js` and `src/js/fieldFights.js` restored to the base
`63fa44d6c`; `git diff 63fa44d6c -- src/` empty — verified below.
Evidence + instrument kept; net src/ diff 0.

## Before / after on identical seeds

| | Control | Armed |
| --- | --- | --- |
| Seeds / horizon / policy | 102601–102608, 150d death-aware, competent | identical |
| Policy sha (rebased tip) | `df9b7dff4de4` | `df9b7dff4de4` |
| Tip anchor (both legs) | `b3808cb479ae` | `b3808cb479ae` |
| Taught observations | 0 (0 wave-4/5) | **65 (25 wave-4/5)** |
| Pending offers recorded | 0 | 85 |
| Taught learns (obs 1→2 → learned) | 0 | 65 (25 wave-4/5) |
| Offer → learn delay | — | median 2d, range 1–19d |
| Pending left at end of run | — | 0 (all resolved) |
| Tricks learned (distinct species / transitions) | 12 / 29 | 11 / 23 |
| Wave-4/5 species learned via taught | — | 9/10 wave-4, 5/10 wave-5 |
| Hearthside learn beats voiced ("At the fire, …") | 0 | 50 |
| Teach-on-learn beats voiced ("…how it went…") | 0 | 16 |
| Gate trick-known | 1/63 (1.6%) | 3/44 (6.8%) |
| Gate rows (seek / avoid / null) | 0 / 49 / 14 | 0 / 30 / 14 |
| Launched wave-4+ fights | 6 | 11 |
| Launched wave-4+ kills (distinct) | 0 | 0 |
| Launched fights, trick known at contact | 1/6 | 1/11 |
| Wild wave-4+ fights | 183 | 144 |
| Wild fights, trick known at contact | 88/183 | 91/144 |
| All-origins wave-4 kills, rounds ≥ 1 (PRIMARY) | 5 | 5 |
| All-origins wave-4 kills, unfiltered | 8 | 8 |
| All-origins wave-5 kills, rounds ≥ 1 | 0 | 1 |
| All-origins wave-5 kills, unfiltered | 0 | 1 |
| Median survival | 150.5d | 151d |
| Villages surviving to 150d | 5/8 | 5/8 |
| Total villager deaths | 746 | 619 |
| Deaths / 100 village-days | 66.02 | 53.83 |
| Starvation deaths | 4 | 2 |

Launched-fight outcomes: control vFlee 3, vDie 1, evade 2;
armed vDie 2, evade 5, vFlee 4. Launched failure modes, armed:
evaded 5, out-damaged 4, died 2. Flags on armed launched fights:
launched-short 11/11, trick-unknown 10/11, out-damaged 6/11,
mauled 6/11, no-working-range 6/11, evaded 5/11, died 2/11,
under-geared 2/11. Control: launched-short 6/6,
trick-unknown 5/6, out-damaged 4/6, no-working-range 4/6,
mauled 3/6, party-short 2/6, dry-fighter 2/6, evaded 2/6.

## Reachability verdict

| Content | Control | Armed | Reachable? |
| --- | --- | --- | --- |
| Waves 1–3 | yes | yes | yes |
| Wave 4 unlock | 8/8 | 8/8 | yes |
| Wave 5 unlock | 4/8 | 2/8 | yes |
| Wave-4 kill (any origin) | 8 (5 real) | 8 (5 real) | yes, barely |
| Wave-5 kill | 0 | 1 | yes, once |
| Regional (scaleRank) | 8/8 | 8/8 | yes |
| National by standing ≥ 200 | 4/8 | 2/8 | partially |
| National by scaleRank ≥ 2 | 0/8 | 0/8 | **no** |
| The table (seat taken) | 0/8 | 0/8 | **no** |
| Win flag | 0/8 | 0/8 | **no** |

The scale wall stands on both legs: every village reaches
regional, none reaches national by rank, none sits at the table,
none wins. The lever does not move the wall — it was never a
knowledge wall on this band once the telling works; the villages
that push toward national still die fighting or stall at regional
standing 199.

## Per-seed table

| Seed | Leg | Days | End | Standing | Rank | Max wave | Launched fights | Launched kills | Wild fights | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 102601 | control | 150 | survived | 385 | regional | 5 | 0 | 0 | 48 | 89 |
| 102601 | armed | 126 | village-lost | 199 | regional | 4 | 2 | 0 | 22 | 65 |
| 102602 | control | 150 | survived | 190 | regional | 4 | 0 | 0 | 5 | 71 |
| 102602 | armed | 149 | village-lost | 199 | regional | 4 | 5 | 0 | 18 | 93 |
| 102603 | control | 149 | village-lost | 315 | regional | 5 | 0 | 0 | 19 | 77 |
| 102603 | armed | 150 | survived | 199 | regional | 4 | 0 | 0 | 15 | 83 |
| 102604 | control | 107 | village-lost | 199 | regional | 4 | 3 | 0 | 15 | 96 |
| 102604 | armed | 125 | village-lost | 199 | regional | 4 | 4 | 0 | 5 | 91 |
| 102605 | control | 124 | village-lost | 375 | regional | 5 | 2 | 0 | 32 | 77 |
| 102605 | armed | 150 | survived | 199 | regional | 4 | 0 | 0 | 1 | 62 |
| 102606 | control | 150 | survived | 425 | regional | 5 | 0 | 0 | 21 | 137 |
| 102606 | armed | 150 | survived | 425 | regional | 5 | 0 | 0 | 49 | 74 |
| 102607 | control | 150 | survived | 199 | regional | 4 | 0 | 0 | 16 | 73 |
| 102607 | armed | 150 | survived | 199 | regional | 4 | 0 | 0 | 8 | 60 |
| 102608 | control | 150 | survived | 199 | regional | 4 | 1 | 0 | 27 | 126 |
| 102608 | armed | 150 | survived | 325 | regional | 5 | 0 | 0 | 26 | 91 |

Note the seed-level churn: 102601 and 102602 survive on control
and die on armed; 102603 and 102605 die on control and survive
on armed. The lever acts early (first taught observation day 8–32
per seed), so trajectories diverge within the first month — that is
a lever consequence, not drift (D3 CLEAN on all 8 seeds: first
divergence day = first-lever day on 7 seeds, 2 days after on
102607). The churn is symmetric (2 flips each way) and the
medians are identical; no survival price, no survival gain.

## Per-fight table (every launched fight)

Control (6): 102604 d48 congregation vFlee R3 trick-unknown
(dmg/rd 24, 8% of HP); 102604 d97 eulogy vFlee R3 unknown
(23/rd, 8%); 102604 d97 eulogy vDie R2 trick-KNOWN (0/rd — the
fighter died dealing nothing); 102605 d109 audit evade R0
unknown; 102605 d112 network_note vFlee R2 unknown (26/rd, 5%);
102608 d98 influencer evade R0 unknown.

Armed (11): 102601 d56 eater vDie R2 unknown (23.5/rd, 4%);
102601 d57 suburb evade R0 unknown; 102602 d48 strike evade R0
unknown; 102602 d54 algorithm evade R0 unknown; 102602 d54
algorithm evade R0 unknown (a second party the same day);
102602 d72 strike evade R0 unknown; 102602 d87 audit vFlee R4
unknown (22/rd, 7%); 102604 d48 congregation vFlee R3 unknown
(24/rd, 8%); 102604 d87 reunion vFlee R3 unknown (47.3/rd, 11%
— the best damage fraction on either leg); 102604 d88 herald
vFlee R3 trick-KNOWN (20.7/rd, 10% — quoted below);
102604 d93 eulogy vDie R2 unknown (13/rd, 3%).

Five of the eleven armed launched fights end in evade at 0
rounds: the party walks out, meets the beast, and never engages.
The four fought ones deal 3–11% of the monster's health before
fleeing or dying. No launched party on either leg deals more than
11% of a wave-4 monster's HP.

## The wave-4 kills, for the record (all origins, rounds ≥ 1)

Control: 102601 d104 herald (Nadia Khoury, 3 rounds, 72 HP at
entry, trick known); d127 algorithm (Vasyl Shevchenko, 8 rounds,
43 HP, known); 102605 d101 herald (Ava Garcia, 5 rounds, 62 HP,
known); 102607 d135 herald (Vy Sweeney, 5 rounds, 164 HP, trick
UNKNOWN); 102608 d88 herald (Ines Duarte, 2 rounds, 41 HP,
known). Plus 3 zero-round wound-mill finish-offs (102606 d113
eulogy, d114 herald; 102607 d141 congregation).

Armed: 102602 d116 herald (Aroha Ngata, 12 rounds, 350 HP at
entry, trick UNKNOWN — the one genuine full-HP wild kill);
d118 strike (Aroha Ngata, 1 round, 132 HP, known); 102603 d128
herald (Yoshiko Nagata, 5 rounds, 62 HP, known); 102606 d111
herald (Fatima Hassan, 1 round, **1 HP at entry**); 102606 d143
network_note wave-5 (Katarina Novak, 2 rounds, **1 HP at
entry**); 102608 d145 algorithm (Dmitri Sokolov, 9 rounds,
291 HP, known). Plus 3 zero-round finish-offs (102602 d106
eulogy; 102607 d150 eulogy; 102608 d104 herald).

Four of the five "real" kills on each leg are against beasts
already wounded to 41–164 HP when met. Only two armed kills
(350 and 291 HP) and one control kill (164 HP) are against
anything near full health.

## Sense check — read, not counted

**One launched fight, end to end (armed, seed 102604, day 88).**
The launch: Javier Cusi's party went out under a wave-4 launch
window (launched party size 2, contact party 3 — Carlos Diaz and
Diana Osei with him; target not named, need-wave 3). What they
met: the Herald, wave 4, 621 HP at entry. Javier entered at 77 HP
with a hunting spear and 5 armor; Carlos 86 HP, stone knife, 25
armor; Diana 67 HP, hunting spear, 12 armor. The fight log:

> "Javier's gear absorbs 14."
> "R1: First Omen hits Javier for 16 (61 left)"
> "R1: Javier strikes for 21 (600 left)"
> "R2: Javier strikes for 19 (581 left)"
> "Javier's gear absorbs 18."
> "R2: Second Omen hits Javier for 21 (40 left)"
> "Javier holds the line — they know how this one is fought, and have not had their turn to prove it."
> "Javier's gear absorbs 15."
> "R3: Second Omen hits Javier for 19 (21 left)"
> "R3: Javier strikes for 22 (559 left)"
> "Javier is losing — shouts for help! Carlos charges in!"
> "Carlos answered Javier's shout, but Javier is past holding — they run while running still works."

Verdict: this reads like a party that went out knowing and
fought honestly — the trick is even voiced mid-fight ("they know
how this one is fought") — and still ran after dealing 10% of
the beast's health in three rounds. The knowledge arrived; the
damage did not. A party that knew, tried, and could not hurt it
is a different failure from a party that wandered in blind — and
it is the failure this lever cannot fix.

**One hearthside share beat (armed, seed 102601, day 50).**

> "💡 COUNTER LEARNED — The Audit: Be inefficient on purpose. It
> taxes your best trick on audit day — read the clipboard, know the
> schedule, and front-load everything between the announced rounds.
> When the auditors come, be deliberately, visibly inefficient: it
> cannot tax what does not optimize. (At the fire, Zoe told Denise,
> Mohammed, Natalia, and 4 more how it moves — the village pieced
> it together.)"

Verdict: the village voices the learning, with the teacher and
the listeners named. Fifty such beats on the armed leg, zero on
control. This is the fiction working as the prereg drew it.

**One teach-on-learn beat (armed, seed 102601, day 63).**

> "🗣️ Brian told Wei and Mara how it went — they were there when it happened."

Sixteen such beats on the armed leg. Short, named, and true to
the moment — the telling names the people who were there.

One dead line, documented: the mid-progress telling ("🔥 {Teacher}
told the fire about {monster} … (n/2 — one more telling and the
village will have its trick.)") never fired in either corpus.
Every taught credit goes 1→2 and learns immediately, because a
pending offer is only recorded when the bar is already at exactly
1 — so the "one more telling" state cannot occur on the share
path. The line is unreachable as built; a future share design
that credits a first observation by telling would need it.

## Village assessment — what the villages looked like

Five of eight villages on each leg live to day 150; the other
three are lost between days 107 and 149, dying fighting, not
hungry (starvation 4 control, 2 armed; total deaths 746 control,
619 armed — the armed leg's villages actually lost fewer people,
though the panel calls that no material signal, and so do I).
Every village reaches regional standing; the strongest end at
425 (seed 102606, both legs — the same village, standing 425,
surviving, wave 5 unlocked, and still no national rank, no table,
no win). Four control villages and two armed ones cross standing
200, but standing alone never converts: national by rank is 0/8
on both legs, and the standing-200 villages sit at regional with
nowhere to go.

Who thrived: the villages that learned to tell stories. On the
armed leg every village had a fire-tale within the first month
(first taught observation day 8–32), and the wave-4/5 trick book
filled fast — Audit, Eulogy, Herald, Reunion, Suburb, Congregation,
Strike, Eater, Influencer by telling, plus Network Note, Spoiler,
Editor, Rerun, Finale Crew at wave 5. Who died: the same people
as always — fighters who meet a wave-4 beast with a spear and
25 armor and deal a tenth of its health before running. The
knowledge gap is closed. The capability gap is damage, party
cohesion at contact (5 of 11 launched fights never engage), and
a gate that never says "seek" and is usually never asked.

## Blanks filled or documented

- FILLED (then reverted on NO-GO): the taught channel. The DIAG's
  dead channel now fires, is voiced, and is perception-gated
  (listeners are exactly the living Haven population minus the
  teacher; a villager away on expedition is never a listener; the
  teacher must be home). The instrument (driver, analyzer, panel
  builder, drift check, proof) stays on the branch for the next
  arm that needs a trick channel.
- DOCUMENTED: the binding constraint has moved downstream of
  trick knowledge — launch decision (gate never seeks, usually
  unconsulted) and damage (best launched fight: 11% of monster
  HP). Any next arm on this axis should start there, not at
  knowledge. Proposed primary revision in the metric review.
- DOCUMENTED: the mid-progress telling line is unreachable on
  the share path (above).
- DOCUMENTED: launched-party evasion — 5 of 11 armed launched
  fights end in 0-round evade. The party launches and then does
  not engage; whether that is the flee/engage brain or the
  launch itself misjudging the target is a question for the
  fight-play work, not this arm.

## Metric review (prereg §14 — no re-scoring; the bars above are the judge)

1. **The primary flatters both legs.** The frozen primary
   (rounds ≥ 1) counts finish-offs of 1-HP beasts as real fights:
   armed d111 herald and d143 network_note both entered at 1 HP.
   Counting only fights against beasts at ≥ 50% of their listed
   HP, the score is armed 2, control 1 — the lever still does not
   pass (the bar is armed > control on the frozen definition, and
   2 > 1 would pass under that revision, but the revision is NOT
   applied retroactively). PROPOSED for the next run: primary =
   distinct wave-4 kills, rounds ≥ 1, **and** monster HP at entry
   ≥ 50% of its listed range, with the wound-mill finish-offs
   reported separately as now.
2. **The gate-known bar passed on a shrinking denominator.**
   Gate rows fell 63 → 44 on the armed leg because trajectories
   diverge within the first month (wave-1/2 shares fire by day 8).
   The rate rose (1.6% → 6.8%) and the count rose (1 → 3), so the
   bar passes as written — but the gate still never says "seek"
   and is unconsulted on 10 of 11 launched fights. A future bar
   should judge the gate's SEEK rate, not only its known rate.
3. **No deaths price — the opposite.** Total deaths fell 746 →
   619 and deaths/100d fell 66.02 → 53.83; the panel interval for
   the paired delta (−23.4 to −0.2) excludes zero, yet the panel
   status is `no_material_signal` (its materiality threshold, not
   the interval, governs). I claim no deaths improvement: 8 seeds,
   symmetric seed churn, and the panel's own verdict.
4. **Trajectories diverge early by design.** First-lever-day is
   day 8–32 because wave-1/2 shares fire in the first month. The
   lever's encounter-volume effect (wild fights 183 → 144, gate
   rows 63 → 44) is a real consequence of earlier knowledge, not
   drift — D3 is CLEAN on all 8 seeds. A future arm that wants a
   cleaner kill contrast should consider a wave-3+ only share, so
   the legs stay identical through the early game.

## Determinism (prereg D1–D3)

- D1 (repeatability): armed tip, seed 102601, 150d, recorder ON
  twice → identical full corpus. GREEN (proof test).
- D2 (wrap neutrality): armed tip, seed 102601, 150d, recorder ON
  vs OFF → identical trajectories. GREEN (proof test).
- D3 (drift smoke): `scripts/trickshare-drift-check.js` —
  firstLeverDay vs firstDivDay per seed: 102601 8/8, 102602 14/14,
  102603 30/30, 102604 28/28, 102605 9/9, 102606 21/21,
  102607 32/34, 102608 10/10. **CLEAN 8/8 — no pre-lever drift.**
  (102607 diverges 2 days after the first taught observation;
  every other seed diverges on the lever day itself.)

## Proof test

`scripts/test-trickshare-a.js`: **65/65 GREEN on the lever tip**
(rebased to master `63fa44d6c`), after the adoption fixes below.
Post-revert off-mode run: TRICKSHARE_PROOF_MODE=off — [result
filled after the revert step].

## Adoption notes (this worker)

- Adopted from the dead 2015Z run: branch `sim-trickshare-a`,
  3 commits ahead of master at adoption (prereg `e1cc32855`,
  lever `c1f3a35df`, instrument `97f92a076`), no corpora, no
  evidence .md. The 2015Z worker was cancelled before finishing.
- **Rebase:** branch base `7bb50f3dc` was 8 commits behind master
  tip `63fa44d6c` at run start (origin/master `4fcfc32c` is an
  ancestor of local master — no divergence; local master is 36
  commits ahead of origin, unshipped landings). Rebased cleanly,
  no conflicts; re-ran the proof after the rebase (65/65).
- **Uncommitted test fix kept:** the 2015Z worker's uncommitted
  modification to `scripts/test-trickshare-a.js` was verified by
  running the proof, not trusted blindly. It fixes three real
  defects in the committed proof: (1) the threshold-site count
  3→4 — the lever adds a fourth `obs[mid] < 2` site in
  `noteTrickTaught`, so the static check was wrong, not the
  lever; (2) the no-listeners case is the scholar-as-teacher
  alone at Haven, because the scholar is always a Haven
  listener when home — a villager-teacher can never be alone
  while the scholar is home; (3) the live geared-fight fixture
  now wounds the fighter to 45% HP and tries 3 wave-3 mids ×
  4 seeds — a full-HP geared party kills wave-1/2 beasts
  outright and dies to wave-3 ones, so the observation path
  (flee) never fired. All three fixes pass in the 65/65 proof.
- **Policy sha changed under the rebase:** the prereg records
  competent.js sha `74a890f0844e` (pre-rebase). The rebased tip
  carries journey-landing r140's budget stop (`6436b14c8`) in
  competent.js, sha `df9b7dff4de4` (full
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`).
  Both legs ran under the new policy on identical seeds, so the
  contrast is clean; the proof test's sha assertion was updated
  to the tip's sha (the assertion still pins the exact sha).
  The prereg itself is frozen and untouched.
- Canon: `docs/CANON.md` read first; `docs/MONSTER-WAVES.md`
  §Monster counters — the 2-observation rule and the "Told at
  Haven" channel are canon. No canon doc covers trick-learning
  speed or hearthside sharing; the prereg says so rather than
  inventing canon, and so does this evidence.
- Encounter gear (Steve 2026-11-13): the proof's live fight
  stages a geared villager fighter (machete, crude bow) with two
  geared party allies against a wave-3 beast — never a fresh
  un-geared scholar alone.

## §15 panel summary (attached)

`evidence/2026-11-16/trickshare-a-panel.md` — decision
**review_required**, 8 paired cases. Village deaths per run
93.25 → 77.38 (delta −15.88, 95% interval −33 to −0.88);
deaths per 100 days 66.63 → 54.05 (delta −12.58, interval
−23.41 to −0.23); both `no_material_signal`. National scale
access 0 → 0, table win rate 0 → 0, first-bearer survival
through day 30/60 1 → 1 — all `no_material_signal`. No metric
shows a `regression_signal`. The panel is the instrument; the
frozen bars above are the judge.

## Revert verification

- `git checkout 63fa44d6c -- src/js/game.js src/js/fieldFights.js`
  (the rebased base) — then `git diff 63fa44d6c -- src/` EMPTY
  (0 lines), and `grep -c TRICKSHARE src/js/game.js
  src/js/fieldFights.js` = 0 / 0. No `trickShareEnabled`,
  `noteTrickTaught`, or `trickShareDawnTick` remains anywhere
  in src/. The lever is fully gone; the branch's src/ is
  byte-identical to master `63fa44d6c`.
- Post-revert proof (off mode): `TRICKSHARE_PROOF_MODE=off node
  scripts/test-trickshare-a.js` — [result filled after the
  revert commit; the off-mode static checks assert the empty
  src diff via `git diff master...HEAD -- src/`, so they run
  after the revert is committed].

## Files

- Prereg (frozen): `evidence/2026-11-16/sim-trickshare-a-prereg.md`
- This evidence: `evidence/2026-11-16/sim-trickshare-a.md`
- Analysis: `evidence/2026-11-16/trickshare-a-analysis.json`,
  `evidence/2026-11-16/trickshare-a-analysis.log`
- Panel: `evidence/2026-11-16/trickshare-a-panel.md`,
  `evidence/2026-11-16/trickshare-a-panel.json`,
  `evidence/2026-11-16/trickshare-a-panel-before.json.gz`,
  `evidence/2026-11-16/trickshare-a-panel-after.json.gz`
- Corpora: `evidence/2026-11-16/perseed-trickshare-a-control/`
  (8 seeds), `evidence/2026-11-16/perseed-trickshare-a-armed/`
  (8 seeds)
- Instrument: `scripts/trickshare-driver-20261116.js`,
  `scripts/analyze-trickshare-a.js`,
  `scripts/build-trickshare-panels-20261116.js`,
  `scripts/trickshare-drift-check.js`,
  `scripts/test-trickshare-a.js`
- Lever (REVERTED — nothing of it remains in src/):
  was `src/js/game.js`, `src/js/fieldFights.js`
