# sim-w4funnel-repin-a — re-pin the wave-4 funnel control on current master (axis scale-onramp)

Run: fleshout loop A, run fleshout-20261027T0755Z.
DIAG ONLY — zero src/js changes, zero default flips, no game lever,
no game-lever proposal. The deliverable is the re-pinned control
table + funnel census on the current base and a verdict on whether
the 2026-10-25 funnel answer still stands.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

Full text: evidence/2026-10-27/sim-w4funnel-repin-a-prereg.md
(committed first, before any sweep, before the sweep script's
summary logic was run). In brief:

- Base: branch sim-w4funnel-repin rebased onto current master tip
  fc57dd0bd (journey-scale r43) BEFORE the prereg — rebase clean,
  no conflicts, branch had no unique commits of its own
  (merge-base == old HEAD 5c3c80013). Master movement since the
  0615Z run is ONLY r43 (a33fe3c74 + fc57dd0bd).
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4
  = The Mirror Draft, standing >= 100; wave 5 = The Producers,
  standing >= 200 AND wave-4 faced; readiness gates: wave 4
  demands 3 armored @ P>=10 / 5 armed / 3 tricks / 1 living
  wave-3+ killer; wave 5 demands 4 @ P>=15 / 6 / 3 / 2 living
  wave-4 killers; veterans from src/js/standing.js
  waveCombatReadiness(): distinct waveKillLog vids with w >= 4,
  filtered to LIVING — vid == Game.villagerId counts living by
  definition, else vpOf(vid) must exist and not be dead; null-by
  entries skipped outright).
- Context read first: evidence/2026-10-25/sim-w4funnel-a.md and
  evidence/2026-10-27/sim-scale-onramp-round-0615.md (which
  requires this re-pin "before any future funnel number is
  judged") and evidence/2026-10-27/sim-finalloss-adopt-a.md
  (the 0615Z band's per-seed trajectories).
- Substrate: seeds 73671-73678, tableseat-nowait policy
  (composed upon, never edited), 180d death-aware horizon
  (runDays stops on death/win; 180 is the cap, not a fixed
  horizon — MEASUREMENT §10). Two arms, same seeds: PLAIN
  (no recorders) runs FIRST; ARMED (five recorders) must
  reproduce plain EXACTLY on every shared field or STOP.
- Replication reference (0615Z band, finalloss-adopt-a,
  baseline == armed there): national-ever 7/8, national-final
  5/8, table invited 5/8, entered 4/8, wins 4/8, wave-4 5/8,
  wave-5 0/8, median 130d, deaths 284, starvation 2.
  Plain-vs-0615 rule, fixed in advance: any deviation is BASE
  MOVEMENT (the re-pin finding), never a gate failure; only
  armed-vs-plain inexactness stops the run.
- Instruments reused VERBATIM from current master (never
  edited; sha256 in the prereg): raftdraft-diag, spawnsrc-diag,
  oldcore-diag, w5births-diag, defwound-diag. New this run:
  scripts/test-w4funnel-repin-diag-sweep.js (w4funnel-a sweep
  copied: new evidence dir, plain arm, summary judging
  armed-vs-plain exactness + plain-vs-0615 report-only, the
  two w4funnel-a summary-predicate fixes carried), analyzer
  reused verbatim (scripts/test-w4funnel-diag.js, corpus dir
  as argv), new proof validator
  scripts/test-w4funnel-repin-a.js (pure corpus analysis),
  new sense script scripts/test-w4funnel-repin-sense.js
  (parameterized by SEED/DAYS; NON-MEASURED replay only).
- Definitions verbatim from w4funnel-a (arrival = wave-4
  world-monster birth joined on seq; fled-recovery re-entry a
  NEW arrival; outcome precedence still-present > pending >
  last-removal-kind mapping; fought = resolve row or tbEnd
  for the seq; living = daily rd5.veterans; cumulative =
  distinct waveKillLog by with w >= 4 and kill day <= day;
  divergence = cumulative - living, never clamped).
- DIAG-GO rule (ALL required): (a) >= 95% of wave-4 arrivals
  classified with known outcomes; (b) single largest funnel
  loss named with count and share of arrivals and of its
  stage; (c) living-vs-cumulative decomposed per day with
  per-killer end explanation (living / dead / not-counted,
  with the gate rule); (d) sense: one seed's wave-4 thread
  read and described in plain words (non-measured replay
  allowed; replay text never enters any count). Gates (STOP,
  not verdict inputs): armed-vs-plain exactness, corpus
  recorder errors 0, detgate PASS on 73671, analyzer unit
  proof 48/48. Any leg missing = DIAG-NO-GO.
- Sense-seed selection rule, fixed before sweeping: most
  wave-4 arrivals in the NEW corpus, ties by most wave-4
  kills, then lowest seed.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — and the October 25 funnel answer does NOT still stand as stated

- (a) Census classifies 31/31 wave-4 arrivals with known
  outcomes (100%, bar >= 95%): 23 still-present, 2
  killed-by-player-fight, 5 melted, 1 departed, 0 unknown,
  0 untagged, 0 pending-in-fight. Analyzer gate PASS and
  proof validator 17/17 (scripts/test-w4funnel-repin-a.js),
  analyzer unit proof 48/48 (scripts/test-w4funnel-a.js).
- (b) Single largest funnel loss named with count and share:
  never-fought — 20 of 31 arrivals (64.5%), against
  fought-not-killed 9/31 (29.0%; 9/11 = 81.8% of fought)
  and killer-not-living 1 (1/31 arrivals; 1/2 kills).
  Largest outcome class: still-present, 23/31 (74.2%).
- (c) Living-vs-cumulative decomposed per day on all 8 seeds:
  living-days >= 1: 35 (73671: 17, 73677: 18); max living 1;
  max cumulative 1; max divergence 1 (73671 only, from the
  d137-to-d138 daily point onward). Both killers explained
  at end: 73671's killer dead (in the fallen, vpDead true,
  gateLiving false), 73677's killer living (in roster,
  vp alive, gateLiving true). Not-counted killers: 0.
- (d) Sense: 73671's wave-4 thread read and described below
  (census timeline, authoritative, plus a NON-MEASURED
  narration replay whose limits are disclosed, not hidden).

## CONTROL GATE — PLAIN, ARMED, AND 0615Z ALL AGREE

Armed band reproduces plain EXACTLY on every shared field,
per seed and in total (summary gate ARMED-vs-PLAIN: EXACT,
8/8 seeds exact on days, gameDays, endReason, won,
waveReach, maxArc, finalRank, maxRank, nationalEver,
nationalFinal, table invited, table entered, deathTotal,
starvationDeaths, faced, waveKillLog entries). Plain
reproduces the 0615Z band EXACTLY on every field too
(summary gate PLAIN-vs-0615: EXACT) — journey-scale r43
did NOT move the control headlines. Detgate PASS (seed
73671: baseline vs recorders-OFF wrapped, 180d/181
gameDays both, tsNationalDay 91 both, no diag surface, no
wraps installed, post-setup world 0). Corpus PASS
(recorder errors 0 on all five recorders, no overflow).

## THE NEW CURRENT-BASE CONTROL TABLE (plain == armed)

| field | plain | armed | 0615Z reference |
|---|---|---|---|
| wins | 4/8 | 4/8 | 4/8 |
| national-ever | 7/8 | 7/8 | 7/8 |
| national-final | 5/8 | 5/8 | 5/8 |
| table invited | 5/8 | 5/8 | 5/8 |
| table entered | 4/8 | 4/8 | 4/8 |
| wave-3 reached | 8/8 | 8/8 | (not published) |
| wave-4 reached | 5/8 | 5/8 | 5/8 |
| wave-5 reached | 0/8 | 0/8 | 0/8 |
| median survival | 130d | 130d | 130d |
| deaths | 284 | 284 | 284 |
| starvation deaths | 2 | 2 | 2 |
| wave-4 kills total | 2 (73671: 1, 73677: 1) | 2 (same) | 2 (73671: 1, 73677: 1) |

Per-seed (both arms identical): 73671 180d survived wave-4
regional; 73672 118d won wave-4 global; 73673 32d
village-lost wave-3 village; 73674 118d won wave-3
national; 73675 169d village-lost wave-4 global; 73676
144d won wave-4 national; 73677 130d won wave-4 global;
73678 122d village-lost wave-3 regional. This per-seed
table is IDENTICAL to the 0615Z finalloss trajectories.

Death-cause shares (plain corpus, 284 deaths; armed total
identical): villager combat 123 (43.3%), villager-vs-
villager combat 70 (24.6%), player arena 34 (12.0%),
villager expedition 20 (7.0%), villager sickness 10
(3.5%), wound that wouldn't close 7 (2.5%), ambush 6
(2.1%), villager monster 5 (1.8%), player dehydration 2
(0.7%), starvation 2 (0.7%: 1 villager, 1 player), and
singles at 0.4% each: player lockjaw, The Redactor, The
Congregation, player contest, alien. These shares match
the 0615Z finalloss shares exactly.

Two footnote movements (reported, not gated — headlines
identical, details moved): (1) the detgate's
tsNationalDay on 73671 reads 91 on this base vs 77 in the
October 25 w4funnel-a detgate — the day national was
first reached moved even though the band headlines did
not; (2) the armed-only raftdraft census reads raids 89,
raiders 382, pool total 1,442, pool wave-3+ 161, vs the
October 25 armed census 85 / 361 / 1,494 / 107 — a
recorder-census movement on a different base, not a
plain-vs-armed deviation (plain has no raid census to
compare it against, by construction).

## THE ANSWER, FIRST (plain words)

The control did not move — and the funnel underneath it
tripled. On the October 25 base, eleven wave-4 monsters
were born across eight villages and none of them died by
any world's hand. On today's base, thirty-one are born,
eleven are fought, and two are killed — both by world
arrivals, both logged and matched, none from the nameless
door. The funnel still narrows at first contact: twenty
of thirty-one monsters are never fought at all. But it
no longer "never opens." It opens early (median arrival
day 133, median 27 days left in the run, vs day 139 and
7 days before), it produces real fights, and it produces
a real veteran story with a real ending: one village's
killer lived to the win, another village's killer counted
for seventeen days and then died, and the count noticed
— living fell to zero while the kill stayed on the books.
That divergence, the exact thing the old band could not
test because it had only one living killer, now has a
positive instance, and it is not a counting artifact: the
killer is in the fallen. The other new stage is melting:
five monsters, all after lost turn-based fights, end as
melts — a fate that did not appear once in the old
census. And the old band's most haunting finding is
gone: the wave-4 kill that came from nowhere. On this
base every wave-4 kill traces to a born monster. If you
judged a future funnel number against the October 25
census, you would be judging against a game that no
longer exists — same headlines, different funnel.

## CENSUS (a) — WAVE-4 ARRIVALS PER SEED

Arrival = one wave-4 world-monster birth (oldcore birth
joined to its spawnsrc spawn on seq; join clean on all
31 — 0 spawn-only, 0 birth-only, 0 untagged). Raid draft
is NOT a birth source: the spawn-source vocabulary across
all spawns on the band contains no raid-draft value, and
every wave-4 entity seen in a raid-time pool traces to a
spawn seq (64/64, below). Raid draft selects from the
pool; it creates nothing.

| seed | end | arrivals (type @ day, source) | days-available |
|---|---|---|---|
| 73671 | survived 180d | 13: congregation @ d116 tile-entry; eulogy @ d121 tile-entry; reunion @ d124 tile-entry; herald @ d125 scripted-titan; eulogy @ d130 tile-entry; eulogy @ d132 tile-entry; reunion @ d149 tile-entry; reunion @ d153 tile-entry; suburb @ d155 tile-entry; reunion @ d162 tile-entry; eulogy @ d171 tile-entry; influencer @ d173 tile-entry; eulogy @ d180 tile-entry | 64, 59, 56, 55, 50, 48, 31, 27, 25, 18, 9, 7, 0 |
| 73672 | won lesser d118 | 1: suburb @ d108 tile-entry | 10 |
| 73673 | village-lost d32 | 0 (wave 3 only) | — |
| 73674 | won lesser d118 | 0 (wave 3 only) | — |
| 73675 | village-lost d169 | 13: herald @ d101 scripted-titan; reunion @ d103 tile-entry; eater @ d106 tile-entry; congregation @ d123 tile-entry; eulogy @ d133 tile-entry; eulogy @ d139 tile-entry; algorithm @ d139 tile-entry; algorithm @ d149 tile-entry; suburb @ d150 tile-entry; eulogy @ d150 tile-entry; reunion @ d152 tile-entry; eulogy @ d159 tile-entry; influencer @ d161 tile-entry | 68, 66, 63, 46, 36, 30, 30, 20, 19, 19, 17, 10, 8 |
| 73676 | won lesser d144 | 0 (wave 4 reached, no birth) | — |
| 73677 | won lesser d130 | 4: influencer @ d96 tile-entry; herald @ d108 scripted-titan; suburb @ d114 tile-entry; eater @ d127 tile-entry | 34, 22, 16, 3 |
| 73678 | village-lost d122 | 0 (wave 3 only) | — |

Band totals: arrivals 31, all fresh (fled-recovery 0).
Sources: tile-entry 28, scripted-titan 3. Arrival days
sorted: 96, 101, 103, 106, 108, 108, 114, 116, 121, 123,
124, 125, 127, 130, 132, 133, 139, 139, 149, 149, 150, 150,
152, 153, 155, 159, 161, 162, 171, 173, 180 — median 133.
Days-available sorted: 0, 3, 7, 8, 9, 10, 10, 16, 17, 18,
19, 19, 20, 22, 25, 27, 30, 30, 31, 34, 36, 46, 48, 50, 55,
56, 59, 63, 64, 66, 68 — median 27. Four seeds had zero
wave-4 arrivals (73673, 73674, 73676, 73678) — 73676 is
the sharpest: wave 4 reached, yet no wave-4 monster was
ever born before the win. Against October 25: arrivals
11 -> 31, median arrival day 139 -> 133, median days
available 7 -> 27. The arrival drought is over; the
meeting drought is not.

Raid-time pool check: wave-4 entities appeared in raid-
time pools 64 times (73671: 25, 73672: 1, 73675: 33,
73677: 5) — all 64 trace to spawn seqs, 0 untraced.
Drafted as raiders: 15 drafted appearances (same entity
can appear in several raids, so appearances, not distinct
monsters — 73671: 3, 73672: 1, 73675: 8, 73677: 3).
Drafting is not fighting: 15 drafted appearances against
11 fought arrivals, and several drafted entities (e.g.
73675's herald, drafted at d111, d118, d148) have no
fight row at all.

## CENSUS (b) — OUTCOME FOR EVERY WAVE-4 ARRIVAL

Outcome classes per the pre-registration (still-present
beats any earlier removal; re-appearance after a removal
cancels the exit). Every arrival classified; unknown 0.

| outcome | count | share of arrivals | which arrivals |
|---|---|---|---|
| still-present | 23 | 74.2% | 73671: 10 (all but congregation, eulogy d132, reunion d153); 73672: 1; 73675: 10 (all but eater, eulogy d139, suburb); 73677: 2 (herald, eater) |
| killed-by-player-fight | 2 | 6.5% | 73671 congregation (d121); 73677 influencer (d113) |
| melted | 5 | 16.1% | 73671 reunion d153 (removal d167); 73675 eater d106 (removal d145); 73675 eulogy d139 (removal d145); 73675 suburb d150 (removal d167); 73677 suburb d114 (removal d123) |
| departed | 1 | 3.2% | 73671 eulogy d132 (3 TB losses, departure-lost-trail d140) |
| killed-by-villager-fight | 0 | 0% | — |
| killed-by-defender-fight | 0 | 0% | — |
| killed-other-cause | 0 | 0% | — |
| fled-record | 0 | 0% | — |
| pending-in-fight | 0 | 0% | — |
| unknown | 0 | 0% | — |

Fought detail (all 11 fought arrivals):
- 73671 congregation @ d116: 1 TB fight, won d121 — the
  kill. Killer record gen_yxyq6c6, channel 'player' (see
  leg (c) for what became of the killer).
- 73671 eulogy @ d132: 3 TB fights, all lost — departed
  d140 (departure-lost-trail). Fought and left on its own.
- 73671 reunion @ d153: 1 TB fight, lost — melted,
  removal d167.
- 73671 suburb @ d155: 1 resolve fight, vFlee —
  still-present (the monster fled the field fight and
  survived).
- 73671 reunion @ d162: 1 resolve fight, vDie —
  still-present (the villager died; the monster did not).
- 73675 eater @ d106: 1 TB fight, lost — melted,
  removal d145.
- 73675 eulogy @ d139: 1 TB fight, lost — melted,
  removal d145 (same removal day as the eater's melt;
  the corpus records removal days, not a shared cause —
  no shared-cause claim is made here).
- 73675 suburb @ d150: 1 TB fight, lost — melted,
  removal d167.
- 73675 reunion @ d152: 6 TB fights, all lost —
  still-present. This is the October 25 suburb pattern a
  second time: six lost fights, monster whole at the end
  — wounds do not accumulate across TB fights against a
  lingering raider (game.js tbEnd restore, read in
  w4funnel-a), and six losses are six fresh fights.
- 73677 influencer @ d96: 2 TB fights, lost then won
  d113 — the kill. Killer record gen_g38w18q, channel
  'companion', living at the win.
- 73677 suburb @ d114: 1 TB fight, lost — melted,
  removal d123.

Kill-log reconciliation, both directions: waveKillLog
holds exactly 2 wave-4 entries on the band, and BOTH
match arrivals (kills-with-log-match 2/2,
log-without-arrival 0). The October 25 band's defining
negative — its only kill matching NO arrival — is
reversed: on this base the world funnel produces both
veterans, and the non-world door produces none that the
log shows. (Scope limit, stated plainly: the census
proves no non-world wave-4 kill exists in THIS log; it
does not prove a non-world TB kill is impossible — the
startCombat null-origin path read in w4funnel-a is still
in the code, and a future band could still produce one.)

## CENSUS (c) — LIVING VS CUMULATIVE VETERANS

Daily living = w5births daily rd5.veterans (last point
per day; duplicate-day points present on every seed, 0
disagreements anywhere). Daily cumulative = distinct
waveKillLog by with w >= 4 and kill day <= that day.
(Wave-5 log entries: 0 on the band, so w >= 4 and w == 4
coincide here; the analyzer verifies, not assumes.)

| seed | living days >=1 | living days >=2 | max living | max cumulative | max divergence | end living / cumulative |
|---|---|---|---|---|---|---|
| 73671 | 17 (d121-137) | 0 | 1 | 1 | 1 (d138-180) | 0 / 1 |
| 73672 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73673 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73674 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73675 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73676 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73677 | 18 (d113-130) | 0 | 1 | 1 | 0 | 1 / 1 |
| 73678 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |

Band: living-days >= 1: 35; >= 2: 0; max living 1; max
cumulative 1; max divergence 1; end pair
(cumulative-through-end vs living killers at end) 2 vs
1, divergence 1. The divergence is one killer, fully
explained: 73671's killer (record gen_yxyq6c6, kill d121,
channel 'player') counted as living for 17 daily points
(d121-137) and then stopped counting between the d137
and d138 points — at end she is in the fallen, vpDead
true, gateLiving false: DEAD, by the gate's own rule
(vpOf exists and is dead; she is not the scholar, so
no living-by-definition applies). 73677's killer (record
gen_g38w18q, kill d113, channel 'companion') is the
opposite case: in roster, not in fallen, vp alive,
gateLiving true — LIVING-VILLAGER through the d130 win.
Dead killers at end: 1. Not-counted killers at end: 0
(no null-by entries, no person-record gaps).

So the w5chain revolving-door worry — kills happen but
killers die or leave before they count — now has a
measured positive instance AND a negative control on the
same band: one killer died and the count dropped (the
door is real, and it is a death, not a bookkeeping
artifact), one killer lived and the count held. The
veteran shortage is no longer purely a kill shortage:
of 2 kills, 1 veteran survived to the end. What the band
still cannot answer is scale — whether a third, fifth,
or tenth killer would survive — because it has only two
killers to test with. (Side note, not a verdict input:
73671's and 73677's readiness veterans (rd4, demand 1
wave-3 killer) are a different bar from rd5; the evidence
keeps them apart, as w4funnel-a did.)

## CENSUS (d) — THE SINGLE LARGEST FUNNEL LOSS

Stage losses, computed on arrivals (killer-not-living is
a veteran-stage loss, compared on count):

| stage | count | share of arrivals | share of its stage |
|---|---|---|---|
| never-fought | 20 | 64.5% | 64.5% of arrivals |
| fought-not-killed | 9 | 29.0% | 81.8% of fought (9/11) |
| killer-not-living-at-end | 1 | 3.2% | 50.0% of kills (1/2) |

Named largest loss: NEVER-FOUGHT, 20/31 arrivals
(64.5%). The funnel still narrows at first contact, but
the margin narrowed with it (October 25: 81.8%): the
second stage now drains nearly a third of arrivals, and
a third stage that did not exist in the old census —
melting, 5 arrivals — sits inside fought-not-killed.
Any next arm that manufactures wave-4 kills without
manufacturing MEETINGS will still move nothing: the
binding constraint is arrival-to-encounter, and behind
it the fight-survival wall (9 of 11 fought arrivals
survive, 5 of them by melting out of the world entirely
rather than by winning).

## SENSE-TESTING READ (sense seed 73671's wave-4 thread)

Sense seed by the pre-registered rule: 73671 and 73675
tie at 13 arrivals; 73671 wins the tiebreak with 1 kill
against 73675's 0. Census timeline, the authoritative
thread:

Day 116: a Congregation — faith as a weapon — steps onto
a tile the village walks (tile-entry birth). Five days
later, on day 121, it is killed in a turn-based fight,
and the village gains a veteran. Day 121 also births a
Eulogy that is never fought. Day 124, a Reunion; day
125, a Herald from the scripted titan; day 130, another
Eulogy — none of them ever fought. Day 132, a third
Eulogy is fought three times, loses three times to the
village, and walks away on day 140 under its own power
(departure, not death). Day 149, another Reunion,
never fought. Day 153, another Reunion, fought once,
lost — and melts out of the world by day 167. Day 155,
a Suburb is met in the field and flees, alive. Day 162,
a Reunion is met in the field and the villager who met
it dies; the Reunion lives. Day 171, a Eulogy; day 173,
an Influencer; day 180, a final Eulogy on the last day
of the run — none fought, none named in the fiction as
far as the census can tell. Meanwhile the veteran earned
on day 121 stops counting after day 137: the killer
dies, and the village finishes its 180 days with the
Congregation's kill on the books and nobody left alive
who made it.

Sense judgment: this thread reads less like two ships
passing (the October 25 thread) and more like a siege
the village half-fought. The Mirror Draft IS met now —
five fights on this seed, a kill, a departure, a melt,
a field death — but it is met as a crowd, not as a
duel: thirteen monsters, most of them scenery, arriving
faster than the village can introduce itself to them.
The Eulogy, the monster with the most legible fiction
(it narrates your death before it happens), appears
four times on this seed and is fought once, in its
d132 incarnation, which then leaves. The village that
survives 180 days does so with ten wave-4 monsters
still standing in its world.

NON-MEASURED replay note (scripts/test-w4funnel-repin-
sense.js, seed 73671, 180 days, say/sysSay taps from
d150): the replay's window shows the fiction DOES name
the next bar — day 151: "FINALES need a LEGEND...
More STANDING — blood, bonds, or bread — and look the
Mirror Draft in the eye. The producers are WAITING."
It also shows turn-based fighting late in the run
(fight-starts d160, d167 x4, d179 x2), including a
Reunion fight across d167-168 and a Suburb struck for
48 with a Machete on d179. Those replay fights do NOT
map cleanly onto census entities (the census's d153
Reunion melts by d167; the census's d155 Suburb has
one field fight, vFlee, and no turn-based strike) —
the replay trajectory shifted, as narration replays do,
and the replay therefore proves wording and presence
(the Mirror Draft is named as the bar; late turn-based
fighting happens), never entity identity. The replay's
tap regex also caught ambient daily lines (a repeated
Reading Glasses beat) — noise in the instrument, not in
the game; the census, not the replay, is the count.
Replay text saved alongside the corpus:
evidence/2026-10-27/perseed-w4funnel-repin-a/sense-73671.txt.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the 0615Z band —
their fates did not move at all — so what is new is
where their wave-4 monsters went, and the answer is
"everywhere, and mostly nowhere." Two villages that
survived long (73671 to day 180, 73675 to day 169)
absorbed thirteen Mirror Draft monsters each and killed
none between them except 73671's one Congregation; the
rest are still standing, melted, or walked away. The
village that won "best" on the kill count (73677) did
so by meeting its Influencer twice and winning the
second fight, then watching its Suburb melt and its
Herald and Eater stand untouched. The villages that won
without meeting anything (73674, 73676) won without a
single wave-4 birth. If the Mirror Draft is supposed to
be the System building monsters out of us, on this base
it builds them in bulk, introduces a third of them, and
lets the rest stand around the village like weather.
The funnel's story changed from "the monsters never
arrive" to "the monsters arrive and wait" — and waiting
is now the thing to explain.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): the wave-4 kill funnel
  on the current base — arrivals 31 (tile-entry 28,
  scripted-titan 3, raid-draft 0), outcomes 23
  still-present / 2 player-fight kills / 5 melted / 1
  departed / 0 unknown, fought 11/31, killed-from-
  arrivals 2/31, largest loss never-fought 20/31 (64.5%),
  living-vs-cumulative divergence 1 on 73671 (killer
  died between d137 and d138) and 0 on 73677 (killer
  living), both wave-4 kills log-matched to arrivals
  (log-without-arrival 0, vs 1/1 non-world in October).
- FILLED (control, re-pinned): the new current-base
  control table above (plain == armed == 0615Z on every
  headline) — future funnel numbers are judged against
  THIS table, not the October 25 one.
- OVERTURNED (October 25 answers that do not stand):
  arrivals 11 -> 31; fought 2 -> 11; kills-from-arrivals
  0 -> 2; non-world kill as the band's veteran source
  (1/1) -> 0/2; median days available 7 -> 27; flat
  living-vs-cumulative divergence (0 everywhere, n=1)
  -> divergence 1 with a dead killer and a living
  killer side by side.
- STANDING (October 25 answers that survive): largest
  loss is still never-fought (share down 81.8% -> 64.5%);
  wave-5 still 0/8; the lingerer wound-reset pattern
  (six lost fights, monster whole) repeats on 73675's
  reunion; raid draft still creates nothing (64/64 pool
  traces).
- DOCUMENTED, NOT FIXED (named next blanks, below):
  the melt stage (5 arrivals — what a melt IS
  mechanically after a lost TB fight, and why two melts
  share removal day d145 on 73675 and two share d167
  across seeds); the arrival surge itself (what changed
  between October 25 and October 27 in spawn/standing
  code that tripled arrivals while leaving every
  headline identical — a code-archaeology question, not
  a lever); the killer-death timing (the d137-to-d138
  drop is a daily-point boundary, not a dated death —
  the corpus does not date the killer's death itself).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending — now with 5 fresh instances);
  the 23% pool wave-3+ bar re-derivation (tileentry
  question, still open); the non-world TB kill door
  (still in code per w4funnel-a's startCombat reading,
  0 instances on this band).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: sim-w4melt-a (DIAG, same band, same recorders
plus one new instrument). Pre-registration sketch: (1)
instrument TB-fight settlement for wave-4 entities —
record, per TB fight, the fight result, the lingerer/
raider state, the post-fight HP path, and the removal
kind + day that follows (melt vs linger vs depart vs
still-present), WITHOUT changing any fight; (2) census,
per seed: melts by fight result and by days-to-removal,
and whether melts cluster on raid/siege days (the d145
and d167 coincidences tested, not assumed); (3) the
arrival-surge question answered alongside from git
history (which commits between the October 25 base and
fc57dd0bd touch spawnWaveTarget / standing / readiness
/ spawn gating, and whether any single commit explains
11 -> 31) — a code reading, not a lever. DIAG-GO when
every melt on the band is fight-classified and the
surge has a named commit or a named "no single commit"
verdict. Rationale: this arm proved the funnel's new
shape is "arrive, rarely meet, often melt" — the next
arm must measure the melt door before any lever touches
the world funnel, or the loops will keep tuning a
meeting problem while a fifth of arrivals exit through
a door nobody has described. Second, separable question
for the same run's metric-review shelf (not the same
arm): whether the six-loss lingerer pattern should
accumulate wounds — still a Steve design ruling (it
changes what a lost fight means), now with a second
instance (73675 reunion) as evidence, not a lever to
pull silently.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged
exactly against its four pre-registered DIAG-GO legs
(a) >= 95% classified (100% achieved), (b) largest loss
named with count and share (never-fought 20/31, 64.5%
of arrivals), (c) living-vs-cumulative decomposed per
day with per-killer end explanation (divergence 1 on
73671 with a dead killer, 0 on 73677 with a living
killer), (d) 73671's thread described in plain words
(census timeline + replay note). Gates all passed:
armed-vs-plain EXACT (8/8 seeds), plain-vs-0615 EXACT
(report-only, would not have failed the run either way),
corpus PASS, detgate PASS, analyzer unit proof 48/48,
proof validator 17/17. Three method notes, neither a
revision: (1) the plain-vs-0615 comparison is report-
only by pre-registered design — had r43 moved the
headlines, the run would still have been judged on
armed-vs-plain exactness and the new table would have
become the control; as run, the comparison happened to
be exact, so no judgment call was needed. (2) The
analyzer's daily series is bounded by the last daily
point, so a kill after that point would hide from the
series — closed, as in w4funnel-a, by reporting the
end-state pair (cumulative-through-end vs living
killers at end) alongside the series; on this corpus
the last daily point falls on the end day for all 8
seeds, so nothing hides. (3) The sense script's tap
regex caught ambient daily lines (the repeated Reading
Glasses beat) — the replay section discloses the noise
and rests on the census plus two named beats, not on
raw hit counts. The telemetry-check and balanced panel
were NOT run, per the standing exception for recorder
rows (panel cannot ingest per-seed recorder corpora —
eleventh sighting). The sweep-compare table + analyzer
output are the comparison of record. The telemetry
baseline was NOT rolled. No game code changed in this
run; no [needs-eyes] flag applies (DIAG-only, no
narration or behavior added — the sense script only
READS beats on a replay, it adds none to the game).

## Infrastructure notes

- Sweep: scripts/test-w4funnel-repin-diag-sweep.js is the
  w4funnel-a sweep copied with a plain arm, a new
  evidence dir, and an armed-vs-plain summary gate
  (stale w4funnel-a control band superseded, never used
  as a gate). Corpus:
  evidence/2026-10-27/perseed-w4funnel-repin-a/ (16 rows
  + summary.json + analysis.json + sense-73671.txt).
  Analyzer: scripts/test-w4funnel-diag.js (verbatim).
  Unit proof: scripts/test-w4funnel-a.js (48/48).
  Validator: scripts/test-w4funnel-repin-a.js (17/17).
  Sense: scripts/test-w4funnel-repin-sense.js
  (NON-MEASURED replay only).
- Safe-commit index clobber hit BOTH commits in this run
  (prereg b3bc5cb78, sweep+validator c1bb6d3f) — the
  known class: the commit itself correct, the main index
  showing bogus staged deletions after. Repaired both
  times via HEAD-blob cacheinfo, verified with
  git status --short empty + git diff HEAD empty +
  worktree files intact, before any further work.
- No EPERM flap blocked this run's writes; all 16 rows
  wrote first try (the sweep's writeFileRetry was not
  needed beyond its first attempt). Plain sweep ~5.5 min
  (8 seeds), armed sweep ~11 min (8 recorder-heavy
  seeds), detgate + summary + analyzer ~3 min.
- Commit: sim-w4funnel-repin-a, DIAG-GO, zero src/js
  diff. Ready for coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line,
  not this arm's).
