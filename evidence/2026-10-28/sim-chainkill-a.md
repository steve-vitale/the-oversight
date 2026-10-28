# sim-chainkill-a — WOUNDED-BEAST CHAINING: DIAGNOSIS

Run: fleshout loop, run fleshout-20261028T2115Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-chainkill-a.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes. This arm classifies and
quantifies; it does not build the fix. The blank is a measurement
blank, so this complete, classified census IS the fill.
Preregistration (binding, committed BEFORE any judged census):
evidence/2026-10-28/sim-chainkill-a-prereg.md (commit 8142b6078).
VERDICT: DIAG-GO — all four prereg legs pass (census valid,
classification 100%, sense + ranked next step). No wall movement
is claimed from re-analysis.

## Plain words first

Chipped beasts do not get finished. Not once. On a fresh 16-seed
band, 13 wounded-beast chains were found — the same beast met
again and again, its health stepping down fight by fight — and
every single one ended with the beast still alive. Add the two
formed-party corpora and it is 21 chains, 52 chain fights, 842
damage dealt to chained beasts — and still zero kills. The
deepest wound in any corpus left a herald at 204 health after
three parties hit it across 11 days, and it walked away. The
closest any beast came to dying was a herald down to 29 health
that was stood down twice without ever being struck — driven
off, not killed. Chaining is real: beasts carry their wounds
from fight to fight, and later parties do meet the same wounded
beast. But chipping alone never finishes the job, because each
fight only lands a handful of damage before the party retreats
or dies, and the beast is never met often enough, hard enough,
to cross the last stretch. The next lever is not more chaining
— it is a party that hits hard enough to use a wounded beast,
measured against this census's exact yardstick (below).

## Header (pre-registered) vs result

- CENSUS-VALIDITY BAR: 16/16 rows, recorder errs 0, overflow 0,
  control shape matches (formed 0, kills 0 on BOTH judged cuts).
  RESULT: 16/16, errs 0, judgedA 42 formed 0 kills 0, judgedB 31
  formed 0 kills 0 → PASS. First-8 subset reproduces the
  retreatdiag fresh band EXACTLY (75106: 15, 75108: 9, others 0).
- CLASSIFICATION BAR: 100% of found chains classified,
  OTHER = 0. RESULT: 13/13 primary, 4/4 + 4/4 secondary,
  OTHER = 0 everywhere → PASS.
- SENSE BAR: >= 2 chain transcripts read + quoted.
  RESULT: published fieldfeed chain (S1) + fresh fixture chain
  (S2) + herald-294 fixture, all quoted below → PASS.
- DIAG-GO BAR: census valid AND every chain classified AND
  >= 2 sense transcripts AND one ranked next step named with
  numbers. RESULT: all four → DIAG-GO.
- No re-scoring: no metric was changed mid-run. Metric doubts
  are under "metric review" below, for the next run.

## Q1 — the primary question: does any chained beast get finished?

No. Cleanly, and in every corpus checked.

- PRIMARY (fresh 16-seed band, base code): 13 chains, 0 KILL,
  0 DRIVE-OFF, 13 STILL-ALIVE. Clean kills 0, flagged kills 0.
- SECONDARY fieldfeed-armed (formed parties): 4 chains, 0 KILL,
  4 STILL-ALIVE, no flags. The KNOWN chain (75106 d118
  influencer 850 → 817 → 790) ends STILL-ALIVE at 790 — it
  never continues in that run (no later influencer meeting).
- SECONDARY shoutgate-armed (formed parties): 4 chains, 0 KILL,
  1 DRIVE-OFF, 3 STILL-ALIVE, no flags.
- POOLED: 21 chains, 52 chain meetings, 842 villager-observed
  damage, 0 kills, 1 drive-off, 20 still alive, OTHER 0.

## The 13 primary chains (base code, all solo — formed 0 on this band)

Chain = maximal sequence linked by EXACT HP equality (next
fight's mHpStart == previous fight's mHpLeft, same seed, same
monster type, chronological file order). Terminal HP = the
beast's HP after the chain's last fight. Rounds @57 / @80 =
rounds to kill the terminal HP at the retreatdiag damage-arm
targets (57–80 damage/round); cap is 15 rounds.

| # | seed / beast | meetings | span | damage | chain DPR | terminal HP | @57 | @80 | class | flagged |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 75106 influencer | 2 | 2d | 52 | 13.0 | 555 | 9.7 | 6.9 | STILL-ALIVE | no |
| 2 | 75106 eulogy | 3 | 7d | 10 | 2.0 | 890 | 15.6 | 11.1 | STILL-ALIVE | AMBIGUOUS |
| 3 | 75106 eulogy | 2 | 0d | 0 | 0 | 501 | 8.8 | 6.3 | STILL-ALIVE | no |
| 4 | 75106 eulogy | 4 | 13d | 0 | 0 | 900 | 15.8 | 11.3 | STILL-ALIVE | AMBIGUOUS ×2 |
| 5 | 75108 eulogy | 4 | 2d | 11 | 2.2 | 889 | 15.6 | 11.1 | STILL-ALIVE | AMBIGUOUS ×2 |
| 6 | 75108 reunion | 2 | 2d | 30 | 7.5 | 1170 | 20.5 | 14.6 | STILL-ALIVE | no |
| 7 | 75108 reunion | 2 | 1d | 78 | 26.0 | 1122 | 19.7 | 14.0 | STILL-ALIVE | no |
| 8 | 75109 suburb | 3 | 1d | 18 | 6.0 | 957 | 16.8 | 12.0 | STILL-ALIVE | AMBIGUOUS |
| 9 | 75109 algorithm | 2 | 1d | 44 | 14.7 | 956 | 16.8 | 12.0 | STILL-ALIVE | no |
| 10 | 75109 eulogy | 2 | 0d | 61 | 20.3 | 839 | 14.7 | 10.5 | STILL-ALIVE | no |
| 11 | 75115 reunion | 3 | 11d | 52 | 17.3 | 1148 | 20.1 | 14.4 | STILL-ALIVE | no |
| 12 | 75116 reunion | 2 | 1d | 23 | 5.8 | 1177 | 20.6 | 14.7 | STILL-ALIVE | no |
| 13 | 75116 reunion | 2 | 0d | 7 | 3.5 | 870 | 15.3 | 10.9 | STILL-ALIVE | no |

Per-chain paths (HP steps; all vFlee/vDie terminal — no chain
ends in a kill or a drive-off):

- #1: d97 catalina_reyes 607→580 vFlee | d99 catalina_reyes
  580→555 vFlee. Same villager twice, two days apart — the
  closest thing to a return in the primary band, and it still
  only totals 52 damage.
- #2: d104 visjoin_102 900→890 vFlee | d104 visjoin_102
  890→890 vFlee | d111 catalina_reyes 890→890 vFlee.
- #3: d129 visjoin_102 501→501 vFlee | d129 visjoin_102
  501→501 vDie. Zero damage throughout; the beast started
  pre-wounded at 501 by a censored source (see censoring).
- #4: d127 visjoin_115 900→900 | d132 visjoin_113 900→900 |
  d132 visjoin_115 900→900 | d140 visjoin_111 900→900 vDie.
  Zero damage throughout — a fresh-HP trivial chain (see
  metric review: HP equality with no damage dealt is weak
  identity, and this chain is flagged AMBIGUOUS twice).
- #5: d86 diana_osei 900→889 | d86 diana_osei 889→889 |
  d87 ava_garcia 889→889 | d88 app_mgpsphm923 889→889.
- #6: d87 diana_osei 1200→1187 vFlee | d89 giulia_bianchi
  1187→1170 vDie.
- #7: d93 app_mgpsphm923 1200→1168 vFlee | d94 ava_garcia
  1168→1122 vDie. The joint-highest primary chain damage (78).
- #8: d112 visjoin_109 975→975 vFlee | d112 visjoin_109
  975→975 vDie | d113 chloe_dubois 975→957 vDie.
- #9: d141 visjoin_138 1000→989 vFlee | d142 visjoin_130
  989→956 vDie.
- #10: d171 visjoin_156 900→860 vFlee | d171 visjoin_156
  860→839 vDie. Same-day, same villager, 61 damage — the
  best single-day primary chain, still 839 short of dead.
- #11: d112 app_mgpspj23354 1200→1189 | d113
  chantal_mukendi 1189→1164 | d123 priya_nair 1164→1148.
  Three different villagers across 11 days, 52 damage.
- #12: d123 visjoin_120 1200→1185 vDie | d124 diana_osei
  1185→1177 vDie.
- #13: d131 app_mgpsphcq161 877→870 vFlee | d131
  app_mgpsphcq161 870→870 vDie.

Census totals (primary): 42 judged meetings = 9 unchained
singletons + 33 chain meetings in 13 chains. Length
distribution: 2-meeting chains 8, 3-meeting 3, 4-meeting 2.
Spans 0–13 days (3 same-day, 10 multi-day). Links 20, flagged
links 6 (ALL AMBIGUOUS — multiple meetings sharing one HP
value; zero FORK, zero IMPOSSIBLE-LINK). Flagged chains 4
(#2, #4, #5, #8); unflagged 9. Ordering anomalies 0, excluded
0. Tile-distance audit over links: distance 0 (same tile)
11, 1 tile 5, 2 tiles 3, 3 tiles 1 — consistent with beasts
wandering between meetings, not proof of identity (tile is
audited, never a filter, per prereg).
Chain damage: total 386 across 13 chains, max 78, median
chain DPR 6.0/round (range 0–26; damage-dealing chains only:
median 7.5). Two chains dealt literally zero damage across
all their meetings (#3, #4) — they are HP-continuous but
carry no wearing-down; they count as chains under the
prereg rule and are disclosed as such, not hidden.
Unchained singletons (9): algorithm 1000→991 then 741 (a
250-HP censored gap — the beast lost 250 between villager
meetings to a source this census cannot see, almost
certainly scholar fights); eulogy 675→675, 651→651;
eater 712→702, 950→938; suburb 832→799; reunion
1200→1180; algorithm 1000→987. A singleton is not a beast
met once — it is a beast whose HP trail breaks at the
censoring boundary (player damage) or at the run's edge.

## Secondary corpora (never pooled with the primary)

FIELDFEED-ARMED (formed parties, 9 judged meetings = 1
singleton + 4 chains, no flags, all STILL-ALIVE):

- influencer 75106: d118 visjoin_104 ("Elmarie") 850→817
  vFlee | d118 mateo_alvarez 817→790 vFlee. THE KNOWN CHAIN,
  reproduced exactly. 60 damage, chain DPR 10, terminal 790
  (13.9 rounds @57, 9.9 @80 — fits the cap at both targets,
  still retreated twice). No later influencer meeting exists
  in this run: the chain ends at 790, beast alive.
- suburb 75106: d121 visjoin_104 963→943 vFlee | d122
  visjoin_104 943→943 vDie. Terminal 943 (16.5 @57 — over
  cap, 11.8 @80 — fits).
- eater 75106: d147 nikos_papadopoulos 950→936 vFlee |
  d147 luis_fernandez 936→936 vDie. Terminal 936.
- eater 75106: d148 amina_diallo 682→682 vDie | d155
  benoit_lambert 682→682 vDie. A second eater chain
  starting pre-wounded at 682 (254 HP of censored damage
  between the 936 chain and this one) — and dealing zero
  further damage across two deaths.

SHOUTGATE-ARMED (formed parties, 14 judged meetings = 3
singletons + 4 chains, no flags):

- herald 75106: d109 app_mgpsphmu476 350→294 vFlee | d109
  app_mgpsphmu476 294→241 vFlee | d120 nikos_papadopoulos
  241→204 vFlee. THE DEEPEST WOUND IN ANY CORPUS: 146
  damage across 3 formed parties over 11 days, terminal 204
  (3.6 rounds @57, 2.6 @80 — a single good round at either
  target finishes it). It still walked away, because no
  fourth party ever met it. Cross-check: these are the
  retreatdiag table rows #2, #3, #6 (herald 350, 294, 241)
  — the analyzer reconstructs the published formed-party
  history exactly.
- audit 75106: d111 chen_wei 753→724 vFlee | d111
  caleb_jones 724→666 vDie | d120 chen_wei 666→637 vFlee.
  116 damage, terminal 637 (11.2 @57, 8.0 @80).
- herald 75106: d123 app_mgpspjia225 29→29 mFlee | d125
  app_mgpspjia225 29→29 mFlee. THE ONLY DRIVE-OFF IN ANY
  CORPUS — and the lowest terminal HP anywhere (29). A
  beast one blow from death was stood down twice without
  being struck (0 damage in both meetings; pre-round
  stand-down shape). It was never converted to a kill.
  Its history before 29 is censored (no judged meeting
  leads into 29), so how it got to 29 is unknown — but the
  chain itself proves the drive-off-does-not-become-kill
  shape at the extreme end.
- audit 75106: d126 chen_wei 362→329 vFlee | d126
  adaeze_nwosu 329→294 vFlee | d129 chen_wei 294→262
  vFlee. 100 damage, terminal 262 (4.6 @57, 3.3 @80).

## Q2 — the damage-arm fit: would chaining + 57–80/round fit the cap?

On PRIMARY terminal HPs (501–1177, median 900):

- At 80/round: ALL 13 terminal beasts fit the 15-round cap
  (worst: 1177 HP → 14.7 rounds). Chaining + 80/round
  finishes every observed wounded beast inside the cap — on
  rounds arithmetic.
- At 57/round: only 3/13 fit (501 → 8.8, 555 → 9.7,
  839 → 14.7). The other 10 need 15.3–20.6 rounds — just
  over the cap, every one of them. The 57 end of the
  retreatdiag target band does NOT finish chained beasts;
  the 80 end does. Any damage-arm prereg that targets
  "57–80" as a band must say which end it means: at 57,
  this census predicts 10/13 terminal beasts still survive
  the cap; at 80, 0/13 do.
- CAP-FIT IS NECESSARY, NOT SUFFICIENT (sense fixture
  proof, below): the herald-294 fixture needed only 10.4
  rounds at its DPR — inside the cap — and still fled at
  round 3, because the hopeless formula fires on the
  survival-vs-kill trajectory, not on cap arithmetic. A
  damage arm judged on "fits the cap" alone will over-claim:
  it must ALSO keep the party alive for the rounds the kill
  needs (~39 incoming/round on the retreatdiag corpus) and
  must be judged on kills, never on staying.
- Cross-arm bound (sibling sim-fieldability-a, same run
  family, DIAG-GO): the measured 2-fighter sustained ceiling
  on base code is 48.25/round (machete+bow dual) — BELOW 57,
  let alone 80 — and villagers do not hold alien-tier
  weapons at wave-4 time. So neither end of the 57–80 band
  is reachable by a 2-fighter party as currently equipped.
  That is why the ranked next step below is the
  tile-present party, not "more damage" in the abstract.

## Sense-testing law (transcripts read, beats quoted)

Verdict: MIXED — each fight reads as coherent people judging
a fight; the CHAIN thread between fights is unnarrated, and
chains are accidental re-meetings, not deliberate returns.

Transcript S1 — the published fieldfeed chain, 75106 d118
(sim-fieldfeed-a.md sense note; Elmarie fight, quoted
verbatim in beat form):

- "R1: Ratio hits Elmarie for 26 (55 left). Elmarie strikes
  for 11 (839 left)."
- "R2: Ratio hits Elmarie for 26 (29 left). Elmarie strikes
  for 10."
- "Elmarie is losing — shouts for help! Jorge charges in!"
- "R3: Ratio hits Jorge for 65 (35 left). Jorge strikes
  for 4."
- "Elmarie sees how this ends — and runs while running still
  works." (vFlee, party intact; beast 850→817.)
- The link fight, same day, same tile (4,3), same beast by
  HP arithmetic: mateo_alvarez + jorge_silva, 817→790,
  vFlee, 27 dealt. No published log beats survive for
  Mateo's fight (the corpus records numbers, not lines) —
  that absence is itself stated, not papered over: the
  chain's second half is numbers-only in the record.
Judgment: the first fight reads as people (shout when
losing, friend takes the hit, retreat together). But nothing
in the record marks Mateo's fight as a RETURN to a wounded
beast: no "the wounded Ratio" line, no recognition beat, no
villager saying "it is hurt from before." Two fights that
share HP are not, in the fiction, one wearing-down — they
are two accidents that happen to share a beast. The
mechanism (wound persistence) is real; the story thread is
not written anywhere.

Transcript S2 — fresh fixture chain, base code
(scripts/test-chainkill-a-sense.js, CHAIN-SENSE PASS):
same influencer entity, pair A then pair B, carry verified
(fight 2 started at exactly fight 1's mHpLeft, 770):

- Fight 1 (850→770, 80 dealt, DPR 26.7, vFlee):
  "R1: Ratio hits ... for 18 (82 left)" / "... strikes for
  24 (x1.3) (826 left)" — "R2: ... strikes for 26 (x1.2)
  (800 left)" / "Ratio hits ... for 22 (60 left)" —
  "... is losing — shouts for help! ... charges in!" —
  "R3: Ratio hits ... for 66 (34 left)" / "... strikes for
  25 (x1.3) (775 left)" / "... strikes for 5 (770 left)"
  / "... sees how this ends — and runs while running still
  works."
- Fight 2 (770→700, 70 dealt, DPR 23.3, vFlee):
  "R1: ... strikes for 20 (750 left)" / "Ratio hits ...
  for 16 (84 left)" — "R2: ... strikes for 23 (727 left)"
  / "Ratio hits ... for 20 (64 left)" — "... is losing —
  shouts for help! ... charges in!" — "R3: ... strikes for
  21 (706 left)" / "... strikes for 6 (700 left)" /
  "... sees how this ends — and runs while running still
  works."
- Chain math: 150 total damage, beast left at 700/850.
  Two full party fights, and the beast still holds 82% of
  its health. At fixture DPR (~25/round), a third, fourth,
  and fifth party would still be needed — and the corpus
  shows chains rarely reach even three meetings.
Judgment: the carry is mechanically exact (770 == 770),
and both fights read as the retreatdiag shape (shout, one
ally strike, hopeless refire, retreat line). But fight 2's
log is indistinguishable from a fresh-beast fight: no line
says the beast is already wounded, no line says this party
came back for it. A player watching both fights would not
know they were one chain. The fixture's fighters are also
named by generic descriptors ("the person in their 30s,
with thick glasses") — day-1 roster naming in a fixture,
not a sim narration finding, and not counted as one.

Transcript S3 — herald at 294, base code (same fixture
script; the near-cap wounded beast from retreatdiag):

- "... strikes for 26 (x1.2) (268 left)" / "First Omen
  hits ... for 13 (87 left)" — "... strikes for 28 (x1.3)
  (240 left)" / "The Naming hits ... for 29 (58 left)" —
  "... is losing — shouts for help! ... charges in!" —
  "... strikes for 28 (x1.3) (212 left)" / "... strikes
  for 3 (209 left)" / "Second Omen hits ... for 29
  (71 left)" / "... sees how this ends — and runs while
  running still works." (vFlee, 85 dealt, DPR 28.3.)
- Math: 10.4 rounds to kill at fixture DPR — INSIDE the
  15-round cap — and the party still fled at round 3.
  The hopeless formula compares survival window (~4
  rounds at the fixture's 23.7 incoming damage/round
  against ~100-HP villagers) with kill window (10.4
  rounds) and fires long before the cap could ever bind.
  This is the cap-fit caveat in played form: fitting the
  cap does not stop the flee.
Judgment: coherent as a judgment (the pair is losing the
HP race and says so), incoherent as a kill path — a beast
that fits the cap still cannot be finished by a party that
cannot survive the rounds the kill needs.

What would read as COHERENT-WEARING-DOWN (not observed):
a second party arriving with a line that marks the beast as
the wounded one, or a villager returning to a remembered
tile (the code HAS a return-to-fight memory —
objNoteMonsterSighting records fight tiles for the fighter
and the answering ally — but no census chain shows a
deliberate return: chains are different villagers stumbling
on the same tile, plus two same-villager repeats
(catalina d97/d99, visjoin_156 d171 twice, visjoin_102
d104 twice) that read as same-tile coincidence, not as
travel-to-a-known-beast). The memory exists; the behavior
does not, on this evidence.

## Ranked next step (single first lever, per prereg)

1. TILE-PRESENT PARTY vs CHAIN-TERMINAL BEASTS — FIRST.
   The mechanism is the sibling fieldability arm's rank-1
   (every ally standing on the tile joins, not just the one
   shouted ally — projected 57.25 sustained for a
   machete+bow leader + 2 allies, vs the 48.25 2-fighter
   ceiling). This census supplies its exact yardstick:
   judged on KILLS of beasts at observed terminal HPs
   (501–1177, median 900), where 57.25/round finishes only
   3/13 inside the cap (501, 555, 839) and leaves 10/13 at
   15.2–20.6 rounds — so the arm must ALSO report party
   size actually achieved (a 3-fighter party at 57.25 is
   not a 4-fighter party at higher DPR) and survival
   rounds alongside kills. If the tile-present party cannot
   push sustained DPR past ~80, or cannot survive the
   rounds a terminal kill needs, the verdict must say so
   with these numbers, not with "more damage" in general.
   Needs the tile-mate-stamp perception ruling first
   (perceptform's open blank: whether tile-mate-outing
   status counts as perception-legitimate).
2. DAMAGE SOURCES — SECOND: new damage that a wave-4-time
   villager party can actually hold (fieldability's ceiling
   table is the starting point: nothing earnable reaches
   57 sustained). A damage arm that only re-measures the
   ceiling without a new source repeats fieldability.
3. DELIBERATE RETURNS — THIRD: travel to a known monster
   (a ready piece) turning accidental chains into planned
   ones — more meetings per beast, lower terminal HP before
   the kill attempt. The return-to-fight memory already
   exists in code; the behavior (a party traveling to a
   remembered tile) is what needs measuring. Ranks below
   damage because more meetings at ~6–15 DPR still need
   the DPR answer first (a 5-meeting chain at 15 DPR deals
   ~150 — the shoutgate herald total — and still leaves a
   fresh beast at ~700+).
4. THRESHOLD LOOSENING — LAST, and harmful alone: chains
   do not change the retreatdiag argument. Terminal beasts
   still owed a median 900 HP at chain DPRs of ~6–15; a
   party that stayed would absorb hundreds of incoming
   damage against ~100 HP and die. Any threshold proposal
   must answer the terminal-HP table first.

## Fresh-band wall (16 seeds; reported, NOT claimed as movement)

- Wins 4/16, all lesser, full seat 0/16. National ever
  13/16, final 9/16. Table invited 10/16, entered 4/16.
  Wave-4 reach 11/16, wave-5 0/16. Median days 180 —
  HORIZON-CAPPED (8 of 16 runs reached the 180d horizon;
  the sweep's median takes the upper middle, which is the
  cap itself — not a survival gain. Compare retreatdiag
  fresh median 146d on 8 seeds, a different band size, not
  a movement claim).
  Deaths 600, starvation deaths 4.
- Death-cause shares (all deaths): villager combat 235,
  villager-vs-villager combat 160, player the wild 87,
  villager expedition 35, villager monster 32, villager
  ambush 8, villager wound-that-wouldn't-close 7, player
  contest 6, player the arena 6, villager sickness 6,
  player sickness 2, villager starvation 2, player
  starvation 2, villager alien 2, player a stranger 2,
  player the night 2, villager thirst 1, villager a toad
  like a war drum 1, villager The Heckler 1, villager
  The Algorithm 1, villager Loud-Eyes 1, villager Big
  Ugly 1.
- Per-seed judgedA: 75106: 15, 75108: 9, 75109: 8,
  75115: 5, 75116: 4, 75110: 1, all other seeds 0. Wave-4
  field meetings cluster on six seeds; the other ten
  contribute nothing to the chain census. That clustering
  is why the 16-seed band mattered: the 8-seed band would
  have held only the 75106/75108 chains (7 of the 13).

## Village assessment in plain words

The village's beasts are being nibbled, not hunted. A beast
walks the woods carrying wounds from yesterday's fight —
down 20 here, 50 there — and the next villager who meets it
adds a little more and then runs or dies, same as the last
one. Nobody ever comes back for it on purpose. The same
names recur on the same tiles (Catalina twice on the
influencer, Chen Wei three times on the audit) because they
live and walk there, not because anyone said "it is hurt,
let us finish it." Who thrived: villagers who met a beast,
hit it once, and walked away — the wound-load is free. Who
died: the ones who met a beast twice, or met one already
wounded and still could not finish it (the d122/d147
zero-damage deaths: a villager dies to a beast nobody has
hurt in that fight at all). Missing capability, still: a
party that can both hit a wounded beast hard enough and
live long enough to land the blows — and a story beat that
tells the player the beast they just met is the same one
from yesterday. The chain is a real thread in the numbers
and invisible in the fiction; both halves need work, in
that order.

## Metric review (for the NEXT run — never a mid-run re-score)

- ZERO-DAMAGE LINKS ARE WEAK IDENTITY: a link with
  mDealt 0 (mHpLeft == mHpStart because nothing happened)
  satisfies HP equality trivially. Two primary chains are
  entirely zero-damage (#3, #4) and all 6 AMBIGUOUS flags
  sit on 0-or-trivial-damage values (889/890/900/975 —
  fresh or near-fresh HPs shared by many meetings). The
  rule as preregistered counts them, and the evidence
  discloses them rather than quietly dropping them — but
  the NEXT chain prereg should either require damage > 0
  on at least one link of a chain, or require a spawn-level
  beast id in the recorder, before treating a chain as a
  wearing-down. The kill answer is robust to this either
  way: dropping all zero-damage chains still leaves 0
  kills (the remaining chains are all STILL-ALIVE too).
- MOST-RECENT PREDECESSOR: where several meetings share
  one HP value, the rule links to the most recent. That
  choice can mis-assign a link when two beasts of one type
  sit at one HP (the AMBIGUOUS flag marks exactly these).
  All flagged chains are STILL-ALIVE, so no kill claim
  rides on a flagged link — but a future arm chasing a
  flagged chain's continuation must resolve the flag first
  (tile + day proximity is the available audit, not proof).
- CENSORING DIRECTION: player damage can only BREAK chains
  or START new ones at pre-wounded HP — it cannot create a
  false chain kill (a vKill terminal is a real villager
  kill of the chained beast). The 0-kill answer is therefore
  conservative: the true number of beasts finished after
  villager wounding could be higher only via player kills,
  which are a different question (the scholar finishing a
  villager-wounded beast) and are NOT counted here by
  design — a future arm could ask it, with scholar-fight
  telemetry, as its own prereg.
- CAP-FIT vs KILL: the @57/@80 table answers the
  prereg's secondary question exactly as asked (rounds
  arithmetic vs the cap). The herald-294 fixture shows
  the table's limit: cap-fit does not predict a kill,
  because the hopeless formula fires on trajectory first.
  The next damage arm must judge kills, with survival
  rounds reported — a cap-fit table alone over-claims.
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-seed before/after corpora
  are the §15 substitute, as in prior rounds. No panel
  artifact faked, no panel verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus
  path for the coordinator's check is
  evidence/2026-10-28/perseed-chainkill-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in 1942Z: the
  baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The band's true
  wall numbers are nationalEver 13/16, entered 4/16,
  wins 4/16. Baseline NOT rolled by this arm; the
  coordinator judges any LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the wounded-beast chaining
  blank (retreatdiag 1942Z blank + sim-findings 2026-10-28
  chaining item) is now measured: 21 chains across three
  corpora, 0 kills, 1 drive-off (a 29-HP herald stood down
  twice, never struck), max chain damage 146, terminal HPs
  29–1177, cap-fit 3/13 at 57 and 13/13 at 80 on the primary
  band. Chaining is real and never finishes — both halves
  of that sentence are now numbers.
- DOCUMENTED (for the findings backlog, not chased here):
  (a) chain-thread narration blank — no fight log marks a
  beast as the same wounded one, and no chain shows a
  deliberate return despite the return-to-fight memory
  existing in code; (b) 0-damage-link identity weakness —
  HP arithmetic alone cannot distinguish one unwounded
  beast re-met from two fresh beasts at the same HP, so
  future chain preregs need a damage>0 rule or a spawn id;
  (c) the 29-HP stand-down: a beast one blow from death
  that flees twice on sight raises the drive-off-vs-kill
  question (should a stand-down at near-death HP convert?)
  — a design question for a future arm, not decided here.
- NOT re-judged: shoutgate-a NO-GO, fieldfeed-a
  pilot-GO-only, perceptform-a NO-GO, retreatdiag-a DIAG-GO
  all stand as published.

## Test and infrastructure notes

- `node --check` clean on all three new scripts;
  scripts/test-chainkill-a.js exits 0 with MACHINE LEGS
  PASS (census PASS, control-shape PASS, classification
  PASS); scripts/test-chainkill-a-sense.js CHAIN-SENSE
  PASS (carry verified, both logs captured);
  scripts/test-chainkill-a-sweep.js exits 0 with
  CONTROL-SHAPE PASS on 16 seeds (10.8 min for the band).
- Analyzer cross-validations (not claimed as separate
  proofs, but they pin the instrument): first-8 judgedA
  counts reproduce retreatdiag fresh exactly (15/9);
  the shoutgate herald chain reproduces retreatdiag table
  rows #2/#3/#6; the fieldfeed known chain reproduces
  850→817→790 exactly.
- No jest in this arm (node scripts only); the
  --cacheDirectory=/tmp/jest-cache-sim-chainkill-a rule is
  recorded and vacuous here, not waived for any jest run.
- Safe-commit index clobber hit the prereg commit and the
  instruments commit (staged-deletion twins of
  byte-identical files); repaired via HEAD-blob
  `git update-index --add --cacheinfo` with status-empty +
  diff-HEAD-empty + hash-match verification, never
  `git reset`. No .git EPERM flap this run. No ref surgery.
- Zero src/js diff on this branch (verified at closeout);
  zero policy files added or changed; no other arm's corpus
  touched (predecessor corpora read-only). No push, no bump,
  no live verification (ship-loop line). Ready for
  coordinator merge, pending ship — via the coordinator.

## Commits

- 8142b6078 prereg (before any judged census).
- c0ff7410a instruments (sweep + analyzer + sense).
- Corpus + analysis + sense fixture + this evidence: final
  commits on this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): chaining is
now measured end to end (21 chains, 0 kills) with a ranked
next step (tile-present party vs chain-terminal beasts, with
the 57.25 yardstick and the perception ruling it needs) —
but no wave-4 field party has yet killed in the field, the
full seat stays 0, wave 5 stays 0. The directive stands
until the tracker records this axis converged on measured
evidence.
