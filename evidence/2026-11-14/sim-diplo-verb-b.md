# sim-diplo-verb-b — DIAG: which leadfeast verb seasons a link

Run: fleshout-loop-b-20261114T1130Z (Loop B), arm sim-diplo-verb-b
Axis: winnability chain. DIAG arm — attributes finding #2321's diplomacy
gap to named verbs; it changes nothing in the game.
Branch: sim-diplo-verb-b — worktree ~/workspace/worktrees/sim-diplo-verb-b
Base: master 237fb445f
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-diplo-verb-b-prereg.md (binds G1/G2/G3;
includes a correction, committed before the pilot was judged, that the
answermail drive is DEFAULT-OFF)

## Verdict: DIAG-GO on all three prereg bars

- **G1 INSTRUMENT VALIDITY — GO.** Recorder captured a full per-day link
  roll on all 16 configs (8 seeds × competent/capable), **0 instrument
  errors**, **every diplomacy point attributed (0 unattributed on all 16
  configs)**, and **every link classified — 42 links, 0 UNCLASSIFIED**.
- **G2 ATTRIBUTION — GO.** The verb attribution table below carries
  per-seed numbers on all 8 seeds, names THE verb that seasons links
  (the first-gesture accord gift, +10 — 24 of 30 first-crossings; the
  tend, +8/week, carries the other 6 and all the maintenance), and names
  THE mechanism for competent's zero in three layers, each with
  per-seed counts.
- **G3 INSTRUMENT-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof test green (static 39/39, game 22/22 on smoke seed 98801).

No confirm band was spent. The prereg licenses a 12–16 seed confirm
only if the pilot attributes cleanly; it did — 30/30 seasoned links
carried by a named verb, 0 unattributed diplomacy points, competent's
zero explained at three layers with per-seed counts. A confirm would
tighten the medians, not change the answer; the pilot IS the result.

## The answer in one paragraph

The verb is **the first-gesture accord gift — answerAccord('gift'),
+10 trust, 2,000 kcal** — and the tend is its maintenance crew. A link
is born at trust 30; the accord gift lands the morning after formation
and puts it at exactly 40, so the link is born seasoned-eligible and
only has to *survive* 30 days. Tends (+8/week, policy + villagers'
own drive) then hold it above 40 against funerals, night strikes, and
tribute shortfalls. Feast and devotion channel touch no link at all:
competent feasts 18 times and channels devotion 653 times across the
pilot and scores exactly 0 diplomacy; the feast feeds plenty, devotion
arms the feast surge, neither moves trust by a point. Competent's zero
is three layers deep, all measured: (1) it forms exactly **one** link
per village — the ladder stage-3 reward, handed to it by the game, days
39–58 — while capable proposes 3–5 from day 10–38; (2) it never
answers an accord and never tends, so its one link is born at 30 and
decays (max trust 31–39, one seed one point short) until it breaks at a
succession or rots at trust 0–27; (3) even a seasoned link scores 0
without a polity — capable proves it twice (98804, 98808: 3–4 seasoned
links, diplomacy 0) because its seasoned links are the wrong shape
(BELONG links, or too few Haven-primary subs for the LEAD realm). The
diplomacy number is exactly 34 × (Haven-primary seasoned subs) when
that count is ≥3, else 0 — an exact fit on all 8 capable seeds.

## The verb attribution table (pilot, 8 seeds × 2 policies)

Per-verb totals across the pilot. "Cross" = crossing EVENTS: the verb's
call moved a link from below 40 to 40+ (includes re-crossings after a
link dipped back below 40). First-crossings over the 30 seasoned links
are accord 24, tend 6 (2 policy + 4 engine).
"Refused" = the verb returned 0 (refusal, no trust moved).

| verb | caller | policy | calls | trust moved | first-crossings | refused |
|---|---|---|---|---|---|---|
| answerAccord (gift +10) | policy | capable | 25 | +250 | 24 | 0 |
| answerAccord | policy | competent | 0 | 0 | 0 | 0 |
| tendLink (+8/week) | policy | capable | 126 | +688 | 5* | 37† |
| tendLink (+8/week) | engine (villagers' drive) | capable | 27 | +216 | 4* | 0 |
| tendLink | policy/engine | competent | 0 | 0 | 0 | 0 |
| payTribute | — | both | 0 | 0 | 0 | 0 |
| proposeLink | policy | capable | 32 | — | — | — |
| proposeLink | policy | competent | 0 | — | — | — |
| answerCounter | policy | capable | 5 | — | — | — |
| answerCounter | policy | competent | 0 | — | — | — |
| hostFeast | upkeep‡ | capable | 45 | 0 (no link) | 0 | — |
| hostFeast | upkeep‡ | competent | 18 | 0 (no link) | 0 | — |
| devotion channel | policy ctx | capable | 585 | 0 (no link) | 0 | — |
| devotion channel | policy ctx | competent | 653 | 0 (no link) | 0 | — |

\* First-crossing split over the 30 seasoned links: accord 24, tend 6
(2 policy + 4 engine); 3 of the 30 needed a +1 tribute tick to finish
from 38–39 after the verb landed. The verb table's Cross column counts
all crossing events (34: accord 25, tend-policy 5, tend-engine 4) —
the extra 4 are re-crossings after a link dipped below 40.
† All 37 refused tends are the **mourning choke**: the link's speaker
was being buried (0 already-tended-this-week, 0 bare-pantry — the
callers gate on both before calling). 37/153 tend attempts = 24%
refused on grief.
‡ hostFeast is called from the policy's `upkeep` hook, which runs
outside `daily()`, so the recorder tags it 'engine' — the tag is a
harness artifact. The verb still has no link id and moves no trust on
either leg.

Trust totals, per link (end trust = 30 + verb trust + residual, where
the residual is the weekly tribute tick (+1/week) + aid (+4s) −
decays):

- Capable links (34 formed): verb trust +8…+58 per link, residuals
  −37…+43. The tend is maintenance, not just crossing: 126 policy
  tends (+688) + 27 engine tends (+216) hold 30 links above 40 for
  30–84 days.
- Competent links (8 formed): verb trust **+0 on all 8**; residuals
  −3…−30 (pure decay). Max trust 31–39; end trust 0–27; 3 broke at
  succession (trust 18/6/0 at the break).

## The mechanism for competent's zero — three layers

### Layer 1 — formation: one link, late, gifted (8/8 seeds)

Competent forms exactly **1 link per village**, on days 39–58, and
every one forms `engine-direct` — the meta-progression ladder stage-3
reward (`_ladderRewardLink` → `_formLink`, the game handing Haven a
link for reaching ladder stage 3; secondlink-a proved this path on
2026-11-10 and this recorder confirms it on this band: 0 proposeLink
calls, 0 counter answers, 0 link-raise accepts in 8 runs). Capable
forms 3–5 links (median 4) from day 10–38: 27 via policy proposeLink,
5 via policy answerCounter, 2 via the same ladder reward. The
formation gap is 1 vs 4 and ~30 days late — the link that would need
to season has the shortest runway and no siblings.

### Layer 2 — tending: no accord, no tend, decay wins (8/8 seeds)

Competent never answers an accord (0 calls) and never tends (0
calls), policy or engine. Its link is born at 30 and its only upward
pressure is the weekly tribute tick (+1/week when the subordinate pays
in full). The downward pressure is succession haircuts (−8 per link
per leader death), night strikes, and tribute shortfalls (−6/week):
the eight links peak at trust 31, 36, 31, 39, 32, 32, 32, 33 — **98804
peaks at 39, one point short of the bar** — and end at 18, 4, 6, 23,
24, 27, 0, 0. Three break outright at succession (98801 day 112 at
trust 18; 98803 day 78 at trust 6; 98808 day 95 at trust 0). The
villagers' own tend drive (`winPlanBondsTick`, win-plan.js) cannot
help: it requires **≥2 Haven-primary links** before it fires, and
competent never has 2. The formation gap gates the tending gap.

Note what competent DOES do: it feasts (18×) and channels devotion
(653×) — more than capable on both (9 feasts, 585 channels). Both
verbs are exonerated by the count: 653 devotion channels and 18
feasts, zero link-trust deltas, zero crossings. The feast feeds
plenty (competent ends with plenty 0–80); devotion arms the feast
surge (competent's surge fires on 8/8 seeds). Neither seasons a link.

### Layer 3 — the polity gate: seasoned is not counted (2 capable seeds prove it)

A seasoned link scores 0 unless it sits in a regional+ polity
(`standing.js` `_linkRegionalPlus`). The pilot's exact fit, per
capable seed — counted links = Haven-primary seasoned subs iff ≥3:

| seed | Haven-primary seasoned | BELONG seasoned | counted | diplomacy |
|---|---|---|---|---|
| 98801 | 5 | 0 | 5 | 170 |
| 98802 | 4 | 0 | 4 | 136 |
| 98803 | 3 | 1 | 3 | 102 |
| 98804 | 1 | 2 | 0 | 0 |
| 98805 | 4 | 0 | 4 | 136 |
| 98806 | 3 | 0 | 3 | 102 |
| 98807 | 3 | 0 | 3 | 102 |
| 98808 | 2 | 2 | 0 | 0 |

98804 and 98808 season 3–4 links each and score 0: their seasoned
links are BELONG links (Haven bows to another fire — all 5 of
capable's counter-answers form BELONG links) or too few Haven-primary
subs (1 and 2) for the LEAD realm's 3. The BELONG road never
completes either: no foreign 4-realm exists for the BELONG polity on
any seed (`_havenPolity` null on all 98804/98808 snapshots). So the
counter-answer path builds seasoned links that score 0, while the
propose path builds LEAD links that score 34 each. Competent never
reaches layer 3 — it has 0 seasoned links — but a build that only
taught competent to tend its one link would still score 0: one link
can never be a polity (standaccum-b, 2026-11-09: the same wall).

## Per-seed link table (pilot)

`formed` = formation day + forming verb; `t40` = first day trust ≥40;
`seas` = seasoned day; `count` = first day counted toward diplomacy;
`cross` = verb that carried the first crossing; `end` = end trust/age.

### Capable (8/8 won, days 89–92)

| seed | link | formed | t40 | seas | count | cross | end |
|---|---|---|---|---|---|---|---|
| 98801 | village_2 | d10 propose | d11 | d40 | d65 | accord | 90/83 |
| 98801 | village_0 | d26 propose | d27 | d56 | d65 | accord | 97/67 |
| 98801 | village_1 | d35 propose | d43 | d65 | d65 | tend:engine | 84/58 |
| 98801 | spl_33 | d40 ladder | d43 | d70 | d70 | tend:engine | 83/53 |
| 98801 | spl_22 | d63 propose | d66 | d93 | d93 | tend:engine+tick | 69/30 |
| 98802 | village_0 | d25 propose | d26 | d55 | d60 | accord | 81/67 |
| 98802 | village_1 | d27 propose | d28 | d57 | d60 | accord | 70/65 |
| 98802 | village_2 | d30 propose | d41 | d60 | d60 | tend:policy | 69/62 |
| 98802 | village_3 | d31 ladder | d31 | d61 | d61 | accord | 66/61 |
| 98803 | village_2 | d24 propose | d25 | d54 | d59 | accord | 76/67 |
| 98803 | village_0 | d25 propose | d26 | d55 | d59 | accord | 70/66 |
| 98803 | village_1 | d29 propose | d43 | d59 | d59 | tend:policy+tick | 65/62 |
| 98803 | village_3 (BELONG) | d30 counter | d31 | d60 | — | accord | 83/61 |
| 98804 | village_0 (BELONG) | d8 counter | d8 | d38 | — | accord | 79/84 |
| 98804 | village_1 | d11 propose | d12 | d41 | — | accord | 100/81 |
| 98804 | village_2 (BELONG) | d13 counter | d13 | d70 | — | accord | 46/79 |
| 98804 | spl_30 | d65 propose | d66 | — | — | tend | 74/27 |
| 98805 | village_2 | d10 propose | d11 | d40 | d54 | accord | 100/80 |
| 98805 | village_0 | d19 propose | d20 | d49 | d54 | accord | 93/71 |
| 98805 | village_1 | d24 propose | d25 | d54 | d54 | accord | 75/66 |
| 98805 | village_3 | d28 propose | d29 | d58 | d58 | accord | 54/62 |
| 98805 | spl_27 | d90 propose | — | — | — | — | 30/0 |
| 98806 | village_0 | d26 propose | d28 | d56 | d59 | accord | 94/64 |
| 98806 | village_1 | d28 propose | d29 | d58 | d59 | accord | 73/62 |
| 98806 | village_2 | d29 propose | d30 | d59 | d59 | accord | 69/61 |
| 98807 | village_0 | d27 propose | d28 | d57 | d68 | accord | 87/63 |
| 98807 | village_2 | d29 propose | d30 | d59 | d68 | accord | 69/61 |
| 98807 | village_1 | d38 propose | d39 | d68 | d68 | accord | 97/52 |
| 98807 | spl_31 | d71 propose | d79 | — | — | tend:engine+tick | 53/19 |
| 98808 | village_1 | d12 propose | d13 | d42 | — | accord | 54/78 |
| 98808 | village_3 (BELONG) | d17 counter | d17 | d47 | — | accord | 71/73 |
| 98808 | village_2 (BELONG) | d18 counter | d18 | d48 | — | accord | 69/72 |
| 98808 | village_0 | d25 propose | d26 | d55 | — | accord | 51/65 |
| 98808 | spl_25 | d71 propose | d85 | — | — | tend+tick | 32/19 |

Dip steps (each +34 named to its link): 98801 d65 +102 (3 links),
d70 +34, d93 +34; 98802 d60 +102, d61 +34; 98803 d59 +102; 98805 d54
+102, d58 +34; 98806 d59 +102; 98807 d68 +102; 98804/98808 none.
Polity days (LEAD, first day the realm stood): 98801 d65 (4 fires,
then 5, then 6); 98802 d60; 98803 d59; 98805 d54; 98806 d59; 98807
d68; 98804/98808 never.

### Competent (0/8 won)

| seed | link | formed | max trust | end trust/age | fate |
|---|---|---|---|---|---|
| 98801 | village_0 | d54 ladder | 36 | 18/93 | broke:succession d112 |
| 98802 | village_2 | d39 ladder | 36 | 4/46 | never-seasoned-trust<4 |
| 98803 | village_0 | d52 ladder | 31 | 6/38 | broke:succession d78 |
| 98804 | village_1 | d58 ladder | 39 | 23/87 | never-seasoned-trust<23 |
| 98805 | village_0 | d46 ladder | 32 | 24/41 | never-seasoned-trust<24 |
| 98806 | village_2 | d44 ladder | 32 | 27/37 | never-seasoned-trust<27 |
| 98807 | village_0 | d47 ladder | 32 | 0/83 | never-seasoned-trust<0 |
| 98808 | village_3 | d49 ladder | 33 | 0/81 | broke:succession d95 |

## Raw standing split, with the day read (mandatory)

At **first-seat day**, diplomacy is 0 for BOTH policies on ALL 16
configs — the divergence appears only after the seat, as links
season (capablewinpath §3's warning, confirmed):

| seed | pol | seat day (d) | raw (war/dip/plenty) | end/win day (d) | raw (war/dip/plenty) | gated end |
|---|---|---|---|---|---|---|
| 98801 | capa | 38 | 70 (50/0/20) | 93 | 350 (100/170/80) | 199 |
| 98801 | comp | 76 | 305 (225/0/80) | 147 | 355 (275/0/80) | 199 |
| 98802 | capa | 47 | 115 (75/0/40) | 92 | 586 (350/136/100) | 586 |
| 98802 | comp | 61 | 205 (125/0/80) | 85 | 230 (150/0/80) | 199 |
| 98803 | capa | 46 | 135 (75/0/60) | 91 | 367 (125/102/140) | 199 |
| 98803 | comp | 74 | 125 (125/0/0) | 90 | 125 (125/0/0) | 125 |
| 98804 | capa | 57 | 60 (0/0/60) | 92 | 165 (25/0/140) | 165 |
| 98804 | comp | 80 | 125 (125/0/0) | 145 | 245 (225/0/20) | 199 |
| 98805 | capa | 34 | 70 (50/0/20) | 90 | 321 (125/136/60) | 199 |
| 98805 | comp | 68 | 155 (75/0/80) | 87 | 205 (125/0/80) | 205 |
| 98806 | capa | 48 | 225 (125/0/100) | 90 | 527 (225/102/200) | 199 |
| 98806 | comp | 66 | 190 (150/0/40) | 81 | 290 (250/0/40) | 199 |
| 98807 | capa | 49 | 50 (50/0/0) | 90 | 292 (150/102/40) | 199 |
| 98807 | comp | 69 | 125 (125/0/0) | 130 | 350 (350/0/0) | 199 |
| 98808 | capa | 37 | 85 (25/0/60) | 90 | 490 (350/0/140) | 490 |
| 98808 | comp | 71 | 120 (100/0/20) | 130 | 295 (275/0/20) | 199 |

Days here are scholar.day (one ahead of harness days; a harness-day-90
win reads as scholar-day-91 in the seat-take log). Capable median dip
at the win: **102** (0, 102, 102, 102, 136, 136, 170, 0 → median 102).
Competent median dip at end of run: **0** (0 on 8/8).

## Wall numbers (scale wall, every run)

- National / table / wins: capable reaches national-or-global on **6/8**
  (global on 6; 98804/98808 stay regional — no polity, no court),
  takes the table on **8/8**, wins **8/8**; competent reaches national
  on **0/8**, takes the table on **0/8**, wins **0/8**.
- Wave 4–5 reach: wave 4 unlocked 8/8 both policies; wave 5 unlocked
  2/8 capable, 1/8 competent. Pooled wave kills — capable 253/143/43/
  10/8 (waves 1–5), competent 198/124/62/16/0.
- Median survival: competent **110d** (80–147; 8/8 village-lost);
  capable **90d** (89–92, win-truncated).
- Death causes (§14c co-primary): villager (non-scholar) combat deaths
  pooled **493 capable vs 426 competent** (~62 vs ~53/run). The win is
  not bought with fewer deaths — same shape as capablewinpath (902 vs
  883 on 16 seeds).

## Village assessment

The same eight villages, twice. The competent villages each receive
exactly one gift from the game itself — a link, handed over by the
ladder around day 50 — and then nothing happens to it. Nobody answers
the first gesture (the gift that would put the bond at 40 on day
one), nobody sends grain, nobody tends. The bond sits at trust 30
while funerals shave it 8 points at a time, and by day 80–147 it is
at 0–27 or broken at a succession, unmourned by any mechanic. The
capable villages court: they propose from day 10, answer every
gesture the morning after it is staged (the gift, 2,000 kcal, "They
count it, and they remember who sent it"), tend weekly, and their own
villagers tend too once there are two bonds to tend. Their links cross
40 within a day or two of birth and then simply have to live 30 days
— and three at a time become a realm, which is when the System starts
counting: 34 points a link, 102 the morning the third one seasons.
Two of the eight capable villages season their links and still score
0, because they bowed instead of leading — their seasoned bonds are
with fires that outrank them, and the foreign realm that would make
those bonds count never forms. The mechanism is honest all the way
down: a gift, grain, and thirty days — and a realm needs three fires
under one head.

## Sense-testing (SENSE-TESTING LAW)

The courtship reads like a played relationship, not a meter. The
first gesture (98801-capable, day 11): "🎁 Haven's first gesture:
2,000 kcal walks to Thornfield's fire — a gift, no strings. They
count it, and they remember who sent it. (Trust +10.)" The tend
(98805-capable, day 14): "🌾 Haven sends 1,500 kcal of grain to
Thornfield's fire — not tribute, the other way around. Someone's
grandmother over there will remember who fed her. (Trust +8.)" The
aid gift to a struggling primary (98804-capable, day 16): "You give
Emberhold 1,209 kcal from Haven's bins — real food, honestly
counted. Malik weeps, openly. 'The fire network. That's what it's
FOR.' (Trust +4. They owe you — the ledger remembers.)" The competent
side reads as neglect in the transcript: its villages argue with
neighbors over foraging ground ("Back off — or we'll talk with
teeth", days 3–5, three villages in a row), suffer night raids, and
its one bond dies at a succession with no line marking the loss in
the captured sample — the break is an engine event, not a played
beat. Two recorder limits: the say capture caps at 150 lines per run
and fills with early meal/tribute chatter, so the "Three fires bow"
line, the drift warning, and the Regional Dawn announcement were not
captured on this band (they exist in code; the cap is a sampling
limit, not an absence). The accord/tend/aid lines above ARE run-captured.

## Reproduction check vs capablewinpath corpus (98801–98808)

End-state columns (days, endReason, won, maxWave, standing, waveKills)
checked against evidence/2026-11-14/perseed-capablewinpath-b/:
**12/16 exact.** The 4 diffs are all base moves, not recorder effects
— the base moved 2042cb96c → 237fb445f, and the only game-code change
in between is the fusion-offer landing (findings #2326/#2327:
fusion_reactor prize gating + offer deferral), which reshuffles the
RNG draw sequence for any run that reaches an ability offer:

- 98801-capable: days 90→92, waveKills 38/11/9/1 → 43/21/4/0.
- 98805-capable: days 104→90 (the 14-day travel friction from
  capablewinpath §8 is gone on this base).
- 98806-competent: days 147→80, maxWave 5→4, standing 320→199.
- 98807-competent: days 150 survived→130 village-lost, maxWave 5→4,
  standing 300→199.

Recorder neutrality was proven directly: the UNMODIFIED
capablewinpath driver on THIS base reproduces my driver's numbers
exactly on the three checked seeds — 98801-capable (days 92, standing
199, villager deaths 66), 98806-competent (days 80, deaths 49),
98807-competent (days 130, deaths 58). Corroboration files:
evidence/2026-11-14/perseed-diploverb-repro/ (98801-capable) and
evidence/2026-11-14/perseed-diploverb-repro2/ (98806/98807-competent).

## Metric review (§14)

1. The metrics held. G1/G2/G3 measured the attribution as designed;
   no re-scoring was needed. The pilot attributed cleanly, so no
   confirm band was spent (see Verdict).
2. The prereg's H1 ("the verb is tend") was HALF right: tend is the
   maintenance verb (+904 trust band-wide on capable, 6 first-
   crossings) but the accord gift is the crossing verb (25 calls,
   +250, 24 first-crossings). The prior-guess section records the
   miss honestly; the verdicts did not depend on it.
3. The prereg's H4 ("the engine auto-answers the first accord for
   BOTH") was WRONG and was corrected before the pilot was judged
   (prereg correction commit 64dd2bc3c): the answermail drive is
   DEFAULT-OFF, so under defaults there is no engine accord/tend at
   all (`state.answermailDrive` null on all 16 configs). The accord
   gap is purely policy-side.
4. Blind channel, stated plainly: the recorder wraps hierarchy verbs
   only. **Aid** (`answerAidOffer`/`answerAidBeg`, +4 trust per
   answer) is NOT wrapped, so aid trust sits inside the per-link
   residual (capable residuals −37…+43; the +39 residual on
   98804-capable's BELONG link is mostly aid gifts to its primary,
   e.g. the day-16 Emberhold gift quoted above). Aid never carried a
   first-crossing on its own in the checked windows — every crossing
   had a tend/accord landing at 38+ within 14 days — but a future
   recorder that wants the residual fully decomposed should wrap the
   aid verbs too. This does NOT touch G1: diplomacy-point attribution
   (the primary metric) is 0-unattributed on all 16 configs.
5. Say-capture cap (150 lines/run) fills with early meal/tribute
   chatter; late beats (First Court, drift warning, Regional Dawn)
   were not sampled. A future recorder should filter the say stream
   to link/polity lines only, or raise the cap.
6. `hostFeast`'s caller tag reads 'engine' although the call comes
   from the policy's `upkeep` hook (outside `daily()`). Tag artifact
   only; the verb moves no trust on either leg.
7. The crossing detector's first version keyed on the seasoned day
   (trust 40 AND age 30) instead of the trust-40 day, and labeled 3
   crossings 'tick/other'. The fix (key on trust-40 day, refined
   carry check at 38+ within 14 days) attributes all 30; the 3
   'tick/other' cases are tend-to-38 plus a +1 tribute tick. The
   analyzer fix is committed with the instrument history, not hidden.

## Evidence files

- Prereg: evidence/2026-11-14/sim-diplo-verb-b-prereg.md (incl. the
  DEFAULT-OFF correction, commit 64dd2bc3c)
- Driver: scripts/diploverb-driver-20261114.js (new)
- Analyzer: scripts/analyze-diploverb-b.js (new)
- Proof: scripts/test-diploverb-b.js (new; static 39/39, game 22/22)
- Per-seed JSON: evidence/2026-11-14/perseed-diploverb-b/ (16 files)
- Analysis JSON: evidence/2026-11-14/diploverb-b-analysis.json
- Pilot log: evidence/2026-11-14/diploverb-b-pilot.log
- Reproduction checks: evidence/2026-11-14/perseed-diploverb-repro/
  (98801-capable, old driver on this base) and
  evidence/2026-11-14/perseed-diploverb-repro2/ (98806/98807-competent)
- Evidence: this file

## Commits (branch sim-diplo-verb-b)

- 63b3e0fb4 prereg (G1/G2/G3 bars)
- 64dd2bc3c prereg correction: answermail drive is DEFAULT-OFF
- ebd3017a1 instrument: recorder driver + analyzer + proof test
  (static 39/39, game 22/22 on smoke seed 98801)
- (this commit — pilot corpora + analysis JSON + evidence)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **#2321 follow-up ANSWERED (this arm).** The verb is the accord
   gift (+10, 24/30 first-crossings); the tend (+8/week, policy +
   villagers' drive) carries the other 6 and all maintenance. Feast
   and devotion channel touch no link (competent: 18 feasts, 653
   devotion channels, 0 diplomacy). Competent's zero is formation
   (1 gifted link vs 3–5 proposed) + no accord/tend (decay to 0–27,
   3 succession breaks) + the polity gate (seasoned ≠ counted without
   3 Haven-primary subs; BELONG links score 0 without a foreign
   4-realm). The scale-climb lever's prerequisite is met: build on
   propose + accord + tend + the 3-sub polity bar. Annotated in
   sim-findings.md.
2. **Mourning chokes 24% of tends.** 37/153 tend attempts refused,
   all 37 on grief (0 already-tended, 0 bare-pantry). A scale-climb
   build that tends weekly will lose nearly a quarter of its tends
   to mourning — the choke is the friction, not the pantry.
3. **Counter-answers build BELONG links that score 0.** All 5 of
   capable's counter-answers form Haven-subordinate links; 5/5
   seasoned, 0/5 counted (no foreign 4-realm on any seed). A build
   that answers counters to climb LEAD is climbing the wrong road —
   the propose path is the counted one.
4. **Aid is an unwrapped trust channel.** Aid answers (+4) sit
   inside this recorder's residual; the 98804 BELONG link's +39
   residual is mostly aid. A future recorder should wrap
   `answerAidOffer`/`answerAidBeg` if the residual must be fully
   decomposed.
5. **Say-capture cap fills early.** The 150-line cap fills with
   meal/tribute chatter before the late beats stage. Future
   recorders should filter to link/polity lines only.

## Convergence state

DIAG — no lever, no convergence verdict. The arm documents; the
finding's fix (the scale-climb lever) is a later arm's prereg. The
prerequisite is met: the mechanism is pinned (accord + tend + 3-sub
polity bar), so the lever can be built on measured ground.
