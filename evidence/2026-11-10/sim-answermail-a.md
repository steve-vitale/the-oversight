# Answer the mail — Loop A verdict (run fleshout-20261110T0615Z, arm sim-answermail-a)

Axis: scale-onramp / winnability chain (the diplomacy half of the
standaccum-b split, sim-findings #2032). BUILD, policy-only, zero
src/js. Gates, prices, deeds, and readyDemand untouched. The lever
is a new policy, not a game-code change: if the game itself should
answer its own mail (a villager drive), that is a follow-up build,
named below — not built here.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-10/sim-answermail-a-prereg.md`
(commit 592035af6) + amendment 1 (median definition,
commit c11c18381) + amendment 2 (confirm band,
commit d5e2d2856). In short: competent policy verbatim vs
competent-answermail-a (the build), default env, seeds 99101-99108
(the trustgrowth/standaccum band re-run on current master —
re-use recorded, NOT claimed as freshness), 150d death-aware
horizon, trustgrowth v2 instrument verbatim. Primary: seasoned
links per band, GO >= 5/8 armed (control 1/8). Cost bar
(scalemetric): starvation armed <= control + 2 totals AND <= 2
arm-only; median armed >= 0.8 x control median (standard median,
120.5 -> bar 96.4 after amendment 1). Fidelity: accord answers
>= 8, tends > 0, renegotiation silences 0, instrument errors 0,
reconciliation 100%.

## Stale-brief check (done before the prereg)

The named work had NOT been landed. `competent-linkdrive-b.js`
(landed 2026-11-07, GO on band 53001-53008) answers the accord
and tends — but bundles answering with PROPOSING new links,
answering raises, and honoring demands, and was never measured
on band 99101-99108. `leadcourt.js` (landed 2026-10-12) also
answers and tends, but also proposes from day 25 and answers
counters/national/global beats. The ISOLATED answer-the-mail
effect — answer the pending beats and tend weekly, with NO
proposing — had never been measured anywhere. This arm is that
measurement, on the diag band. PROCEED was the verdict of the
check.

## Grounding verified in code before the judged pilot (not assumed)

- Seasoned (`hierarchy.js` `_linkSeasoned`): active, 30+ days
  old, trust 40+. `polityOf('haven')` needs >= 3 seasoned
  subordinates (docs/SCALE.md: a polity is one primary with >= 3
  seasoned subordinates — four fires under one head).
- `answerAccord('gift')`: 2,000 kcal -> +10 trust (scaled down
  if the pantry is thin; +2 floor even on an empty pantry).
  'visit' +8, 'word' +4. Clears pendingAccord.
- `tendLink(linkId)`: 1,500 kcal -> +8 trust, once per week per
  link (tendedWeek). Refuses during their mourning (returns 0,
  charges nothing). Refuses an empty pantry (returns 0). LEAD
  links only; BELONG refuses.
- `answerRenegotiation(linkId, 'gift')`: 1,500 kcal -> +8 trust
  (scaled if thin); the beat's answers land through the mourning
  choke for succgrace beats (mourningUntil restored after).
  Unanswered beats expire after 7 days at -6.
- `answerDemand(linkId, true)`: honor a pending demand
  (linkdrive-b uses exactly this call).
- No canon doc covers trust, links, accords, or polity formation
  (docs/CANON.md manifest lists none; docs/SCALE.md covers polity
  shapes, the 30-day season, the trust-40 bar, and names
  `state.pendingAccord` / `Game.answerAccord`). The verbs above
  are grounded in code, not in a canon doc — stated here, not
  invented as canon.
- The first link on this band comes from the ladder stage-3
  reward (`_ladderRewardLink` -> `_formLink`; secondlink-a,
  evidence/2026-11-10/sim-secondlink-a.md), and second raises
  are staged and lost (104 stagings, 0 accepted) because
  competent never takes a conversation turn. This arm proposes
  nothing, so the band can hold at most 1 link per village.

## The lever (the build)

New policy `scripts/policies/competent-answermail-a.js` —
competent VERBATIM, plus a daily answer-the-mail step after
`competent.daily`:

1. `pendingAccord` present -> `Game.answerAccord('gift')`
   (unconditional, leadcourt-shaped; the engine prices a bare
   pantry honestly with a scaled gain).
2. Each active LEAD link (primary 'haven'): if
   `link.tendedWeek !== week` and pantry > 20,000 kcal ->
   `Game.tendLink(link.id)` (leadcourt's gate; tendLink itself
   refuses mourning weeks at no cost).
3. Each active link with `link.pendingRenegotiation` ->
   `Game.answerRenegotiation(link.id, 'gift')`.
4. Each active link with `link.pendingDemand` ->
   `Game.answerDemand(link.id, true)` (honor; counted
   separately).

Explicitly NOT in this arm: proposing links (no `proposeLink`
call anywhere — the policy must never form a link),
answering counters, answering national/global beats, tribute
manipulation, arrears calls/forgiveness. The arm answers mail
that arrives; it does not write new mail.

## Verdict — pilot GO (judged strictly against the prereg)

1. Primary: seasoned links 8/8 armed vs 1/8 control. GO bar
   was >= 5/8. Every link on the band seasoned.
2. Cost bar: PASS. Starvation 0 armed vs 5 control (cap
   control+2 = 7); arm-only starvation 0 (cap 2); median
   survival 130.5 armed vs bar 96.4 (0.8 x control median
   120.5).
3. Fidelity: all pass. Accord answers 8/8; tends 41
   band-wide; renegotiation silences 0 on the armed leg (7
   silences on the control leg, all answered as gifts);
   instrument errors 0 on all 16 legs; analyzer reconciliation
   202/202 link-days on the armed leg (138/138 control), 0
   unattributed residue on both legs.
4. Polity: 0/8 on both legs, as the prereg expected
   (reported, not judged). The blocking reason is now
   uniformly "seasoned-but-no-polity" on all 8 armed seeds
   (control: 7x never-seasoned + 1x seasoned-but-no-polity).
   Answering the mail seasons the one link; it cannot conjure
   the other two a polity needs.
5. Balanced panel (§15): `evidence/2026-11-10/answermail-panel`
   — decision review_required. Village deaths per run +5.875
   (CI -11.75 to 21.375, crosses 0); village deaths per 100
   days -5.8864 (CI -22.4596 to 8.53, no material signal);
   community loss +0.125 (CI -0.25 to 0.5). National, wins,
   table: 0 -> 0, no material signal. The raw-deaths watch is
   the live-longer artifact (villages that live longer
   accumulate more deaths; per-day deaths fall) — see the
   metric review.
Proof: `scripts/test-answermail-a.js` — 15/15 PASS (14 fixture
legs + a live 60d smoke leg on 99104: accord answered, 0
instrument errors, never proposes).

## THE ANSWER (plain words)

Answering the mail works — completely, on the only link the
village ever gets. Every village's one friendship, which used
to cool from funerals and night-strikes until it sat at trust
0-26, now holds at trust 39-96 for the whole run. The first
gesture lands the day the bond is born (+10), the grain goes
out every week the pantry can carry it (+8 a week), and when
a new speaker buries the old one and asks whether Haven still
holds, the answer is grain, not silence (+8, eight times).
The bond seasons on all eight seeds — it used to season on
one. And the village does not starve for it: the armed
villages lost NOBODY to starvation, where the control leg
lost five on one seed, and the median village lived ten days
longer.

But the mail was never the polity problem. A realm needs
three seasoned bonds under one head, and the village still
has exactly one friendship — the mail can't answer invites
that were never written. The second link still has to come
through the raise path, and the raise path still expires
unanswered, because competent never sits down for a
conversation. So the villages are warmer, richer in standing,
and still alone at the table: no national, no seat, no win
on either leg. The trust half of the diplomacy road is
solved. The link-count half is not — and this arm was never
going to solve it, because it proposes nothing by design.

## Per-seed table (pilot)

| seed | base days | armed days | base link (born->peak->end) | armed link (born->peak->end) | accord | tends | reneg | starv base->armed |
|------|-----------|------------|-----------------------------|------------------------------|--------|-------|-------|-------------------|
| 99101 | 132 lost | 145 lost | Stonebridge 30->37->8 decays | Stonebridge 52->97->75 seasoned | 1 | 10 | 0 | 0->0 |
| 99102 | 58 lost | 148 lost | Emberhold 30->40->23 rises | Emberhold 48->100->50 seasoned | 1 | 6 | 4 | 0->0 |
| 99103 | 132 lost | 128 lost | Stonebridge 30->30->4 decays | Stonebridge 48->100->87 seasoned | 1 | 7 | 1 | 0->0 |
| 99104 | 150 surv | 96 lost | Emberhold 30->45->26 seasoned | Emberhold 40->61->52 seasoned | 1 | 0 | 2 | 0->0 |
| 99105 | 109 lost | 150 surv | Emberhold 34->37->11 decays | Emberhold 52->100->84 seasoned | 1 | 6 | 0 | 0->0 |
| 99106 | 87 lost | 92 lost | Emberhold 30->31->0 decays | Emberhold 48->100->96 seasoned | 1 | 9 | 0 | 0->0 |
| 99107 | 150 surv | 87 lost | Emberhold 30->38->0 decays | Emberhold 40->72->67 seasoned | 1 | 3 | 0 | 0->0 |
| 99108 | 62 lost | 133 lost | Emberhold 30->30->17 decays | Emberhold 40->63->39 seasoned | 1 | 0 | 1 | 5->0 |

Band totals (pilot): seasoned 1/8 -> 8/8. Trust gains +205 ->
+769 (accord-gift +80, tend +320, renegotiation-answer +64,
tribute-weekly +73, aid-offer-accept +224, aid-beg-give +8).
Trust downs -364 -> -454 (succession-haircut -264, titan-event
-190, renegotiation-silence 0). Median survival 120.5 -> 130.5.
Standing: 99101 270->410, 99103 199->280, 99106 199->365,
99108 25->199 (others flat at 199/150).

## The growers, in order (pilot, before -> after)

- **Tend (+320, new).** 41 tends band-wide (10/6/7/0/6/9/3/0
  per seed), +8 each except two capped at trust 100 (+4:
  99102 d51, 99106 d78 — trust caps at 100). The tend is the
  engine of the season: born trust 40-52 plus +8 a week
  holds the link above 40 through its 30th day on every
  seed. Cost: 41 tends paid 64,732 kcal in total (not 41 x
  1,500 = 61,500 — see the overshoot note below; ~5% over
  sticker).
- **Accord gift (+80, new).** 8/8 answered, +10 each, on
  formation day. It is the single biggest one-shot trust-up
  on the board, and it lands the day the bond is born:
  born trust rises from 30-34 to 40-52. The born arithmetic
  is exact: 30 + 10 (accord) + 8 (first tend, same day) = 48;
  34 + 10 + 8 = 52; 30 + 10 = 40 where no tend fired that
  day (pantry gate). The formation-day aid give (+4, inside
  born trust on 99101/99105 per trustgrowth-b) still sits
  inside born trust on the control leg only — on the armed
  leg the first snapshot already carries the accord, so no
  formation-day write is unlogged beyond the disclosed gap
  (one day-37 tend on 99101, caught by the _trustGain wrap,
  reconciled).
- **Renegotiation answers (+64, new).** 8 answers, +8 each;
  the 7 control-leg silences (-42) are gone. 99102 answers
  four beats in 148 days — a succession cluster, each met
  with grain.
- **Aid offers (+224, was +136).** 56 accepts on the armed
  leg (vs 34 control). The neighbor still walks in with
  grain; Haven still says yes. The count rises because
  villages live longer and the link stays warm — aid offers
  are the subordinate's generosity, and a warm link gets
  fed more often.
- **Weekly tribute (+73, was +65).** Same +1 a week; the
  extra weeks are longer lives.
- **Aid begs (+8, was +4).** Two gives on the armed leg.

## The cutters, in order (pilot, before -> after)

- **Succession haircuts (-264, was -195).** 33 haircuts
  (vs 27). The absolute count RISES because villages live
  longer and meet more funerals — the same whole-run-count
  artifact as the fallen-count finding (sim-findings,
  2026-11-09). Per day alive, haircuts fall: the link
  survives them now instead of breaking under them.
- **Titan strikes (-190, was -127).** 38 strikes (vs 28),
  same artifact: longer lives, more nights, more strikes.
  The -5 still lands with no answer available.
- **Renegotiation silence (0, was -42).** Gone — every
  staged beat is answered.
- **The mourning choke (21 blocked +1s control; armed:
  tribute +1s still blocked during grief, but tends are
  refused at no cost and renegotiation gifts land through
  the choke).** The choke still costs tribute trust; the
  arm routes around it with the beat answers, which is
  exactly what the succgrace design intended.

## The seasoning math (why 8/8)

Seasoning needs trust >= 40 AND age >= 30 on the same day.
Control: only 99104 ever held 40+ at age 30. Armed: every
link is BORN at 40-52 (accord +10 at formation, plus the
first tend the same day on 5 seeds). From there the weekly
tend (+8) and tribute (+1) outrun the cutters (-8 per
funeral, -5 per night-strike) on every seed: peaks reach
61-100, and end trust is 39-96 (control: 0-26). The only
seed that ends below 40 is 99108 (39, after a late
succession/titan cluster) — but it seasoned long before,
and held seasoned status for weeks. The accord alone would
season most links (born >= 40 on all 8); the tend is what
HOLDS them there through the funeral clusters. The two
halves are separable in the event log: accord +80, tend
+320 — the tend is the holding engine, the accord is the
head start.

## The polity answer (counts, pilot)

- Links formed: exactly 1 per village, all 8 seeds, all
  Haven-primary (LEAD) over Emberhold (6) or Stonebridge (2),
  formed d17-d47 via the ladder stage-3 reward.
- Seasoned links: 8 (was 1). Seasoned-polity (forPolity)
  readings agree with the plain readings on every snapshot.
- Polities: 0 on every road on every day — no LEAD polity
  (needs >= 3 seasoned subordinates; the band holds 1), no
  BELONG, no covenant, no trade. `polityOf('haven')` is null
  on all snapshots.
- Blocking reasons by rule: 8x seasoned-but-no-polity (was
  7x never-seasoned + 1x seasoned-but-no-polity). The
  blocking reason MOVED — the trust half is done; the count
  half is now the whole story.
- Second links: 0 formed after the first on any seed, same
  as control. This arm proposes none, so that is by design,
  not a finding — see secondlink-a for why raises expire.

## Wall numbers (pilot)

Wins 0/8 -> 0/8. National 0/8 -> 0/8, table 0/8 (scaleRank
"regional" on all 8, both legs). Wave-4 unlocks 7/8 -> 8/8,
wave-5 unlocks 1/8 -> 3/8 (99101, 99103, 99106). Median
run-days 120.5 -> 130.5 (2 survivors control; 1 survivor
armed). The wall did not move on the seat: no national, no
table, no win. The wave-5 unlocks moved (1 -> 3) on
standing gains (99101 270->410, 99106 199->365, 99103
199->280) — but those standings rode diverged trajectories
(see the survival note below), so they are reported as a
secondary, not as a lever effect.

## The survival note (read this before leaning on the medians)

Per-seed day deltas (armed - control): +13, +90, -4, -54,
+41, +5, -63, +71. Two seeds collapsed hard (99104: 150 ->
96; 99107: 150 -> 87) — both were survivors on the control
leg. Neither died of starvation (armed starvation is 0
band-wide); their death causes are combat and 'the wild'
(99104 armed: 'the wild' 12 vs 1 control; 99107 armed:
expedition 25, combat 46). Once the policy spends grain,
the game state differs, and every downstream random draw
shifts — the sim is chaotic, so per-seed day deltas at n=8
are mostly divergence noise, not a lever effect. The
pre-registered bars (median + starvation) are the judges,
and both pass; the median rose while two seeds fell. The
confirm on 16 fresh seeds is the check on whether the
survival direction is real — do not lean on the pilot
median alone.

## Village assessment (plain words)

Picture the same eight villages, each holding exactly one
friendship — but this time somebody answers the door. The
day the bond is born, a gift walks to the other fire — no
strings, 2,000 kcal — and every week after, grain goes out
while the pantry can carry it. When the far village buries
a speaker and the new one asks, in so many words, whether
Haven still holds, the answer is grain on the table, not
silence. So the bond that used to cool until it sat at
trust zero now holds warm for the whole run: the villages
season their one friendship, all eight of them, and the
tribute wagons still come every week, and the neighbor still
walks in with grain when Haven's bins echo. Nobody starved
for it. But the villages are still alone at the table — one
friendship is not a realm, and no amount of tending makes
one fire into four. The mail is answered. The invitations
to a second fire still expire unheard, because nobody ever
sits down to listen.

## Sense-test

- The answered mail reads like people. Formation day, 99101
  d37: "⛓️ Enrique brings it home: Stonebridge bows to Haven
  — one organization, us primary. Tribute: 4,000 kcal/week.
  The relationship starts at trust 30. Everything from here
  is earned." Then, the same day: "🎁 Haven's first gesture:
  2,000 kcal walks to Stonebridge's fire — a gift, no
  strings. They count it, and they remember who sent it.
  (Trust +10.)" Then: "🌾 Haven sends 1,500 kcal of grain
  to Stonebridge's fire — not tribute, the other way around.
  Someone's grandmother over there will remember who fed
  her. (Trust +8.)" Three lines, one day: the bond is born,
  greeted, and fed. The fiction earns the numbers.
- The renegotiation gift reads like people: 99102 d27 "🕊️
  Haven sends 1,500 kcal to Emberhold's fire — grief met
  with grain. The new speaker eats with Haven's people and
  the tribute stays where it was. (Trust +8.)" Grief met
  with grain is the right sentence for the beat.
- Two sense-test tensions, named not fixed:
  (a) The tend line repeats VERBATIM every week ("Someone's
  grandmother over there will remember who fed her.") — 41
  times band-wide, the same sentence for every village,
  every week. It is honest and the +8 is earned, but a
  weekly ritual deserves a rotating line, not one sentence.
  Same repetition class as the doorwalk/grief-card findings.
  (b) The say lines still use the word "trust" for two
  numbers (link trust vs village opinion/donation lines:
  "Donated American Persimmon (+260 kcal). Trust +0. They'll
  remember this.") — the trustgrowth-b finding, unchanged.
- No robotic villager behavior was flagged by this arm's
  corpus beyond the template repetition above; the
  sense-test gap is the unanswered second-link mail, not
  behavior. 99102's four renegotiation answers in 148 days
  read correctly as a village burying speakers in a cluster
  and being met with grain each time — not as a grind.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The pilot GO bars held up: the primary separated the band
  cleanly (1/8 -> 8/8), the fidelity gates all passed, and
  the cost bar passed on both legs (starvation 0, median
  130.5 >= 96.4). No bar needs lowering or raising.
- Amendment 1 was the story of this run's prereg: the
  trustgrowth text's "median 132" is the analyzer's UPPER
  median; the per-seed list sorts to 120.5, and secondlink-a
  had already flagged it. The standard median is now the
  convention for this arm, with the TG figure reported
  alongside. Future arms should quote the per-seed list, not
  the old median.
- The panel's review_required is NOT a verdict override: the
  village-deaths watch (+5.875 raw, CI crossing 0) is the
  live-longer artifact — deaths per 100 days FELL (-5.8864)
  with no material signal. A whole-run death count without a
  per-day read misleads on any lever that extends life; the
  panel's per-100-days row is the honest read, and it is
  clean. The community-loss watch (+0.125, CI crossing 0)
  is 1 seed (6/8 lost -> 7/8 lost) — the two collapsed seeds
  above, i.e. the same divergence noise.
- The cost bar's starvation leg is now the quietest number
  in the run (0 armed vs 5 control): the tend gate (pantry
  > 20k) plus the engine's own empty-pantry refusals keep
  the lever from eating the village. The bar stays as is.
- One instrument note: the day-37 tend on 99101 (formation
  day, before the link's first snapshot) is covered only by
  the _trustGain wrap, not the setter — the instrument's
  known formation-day gap, disclosed in trustgrowth-b
  amendment 1. Reconciliation still went 202/202 with zero
  residue, so the gap is covered, not hidden. A future
  instrument should install the setter at formation time,
  not first snapshot.
- The tend overshoot (below) is a cost-accounting note, not
  a metric problem: the lever's sticker price (1,500 kcal)
  understates the pantry removal (1,600 typical) by ~5%.

## Next blanks, in order

1. **Confirm on fresh seeds (THIS RUN, amendment 2).**
   Band 120101-120116, 16 seeds/leg, GO bar seasoned >=
   10/16, same cost bar and fidelity gates. The pilot GO is
   a pilot; the confirm decides whether the lever lands.
2. **The second-link build (NAMED, not built).** Answering
   the mail seasons the one link; the polity still needs
   two more. Secondlink-a named it: does COMPETENT_TALK=1
   or the leadcourt policy answer raises, and if so do
   second links form — and is the fix "the player must sit
   down" or "the ask must survive longer / find the player
   another way"? This arm deliberately proposes nothing, so
   it cannot answer that question. It is the next build.
3. **The tend overshoot (cost-accounting note).** tendLink
   removes whole pantry items: 9 of 99101's 10 tends paid
   1,600 kcal, not the 1,500 sticker price (41 tends paid
   64,732 kcal band-wide vs 61,500 at sticker, ~5% over).
   The +8 trust is priced on 1,500, so the village pays ~5%
   more grain than the fiction names. Whether
   _removePantryKcal should split items exactly or the
   sticker should say 1,600 is a small engine question for
   a later arm — the lever still starves nobody, so it is
   not a blocker.
4. **Trust caps at 100.** Four links peak at exactly 100
   (99102/99103/99105/99106); two tends land as +4 (96 ->
   100) instead of +8. The cap is doing real work now that
   trust can actually reach it — whether 100 is the right
   ceiling for a seasoned bond, or seasoned bonds should be
   allowed to bank trust against the next funeral cluster,
   is a design question. It cost 8 trust band-wide; not a
   blocker.
5. **The game should answer its own mail (follow-up
   build).** This arm is a POLICY — it proves a competent
   player who answers the mail seasons links. The game
   itself (villagers, the village) still lets the accord
   sit unanswered under plain competent play. Whether the
   answer belongs in villager behavior (a dawn step, a
   drive) or stays a player choice is the design question
   for the next arm. Do NOT move readyDemand numbers or any
   win price/deed gate on this evidence.

## Findings for the coordinator

- **ANSWER THE MAIL SEASONS THE LINK (pilot GO).**
  Seasoned 8/8 armed vs 1/8 control; accord 8/8 answered
  (+80), tend 41 calls (+320), renegotiation answers 8
  (+64), silences 0 (was 7 x -6). Reconciliation 202/202,
  0 residue. Cost bar PASS (starvation 0 vs 5, median 130.5
  vs bar 96.4). (This arm, pilot.)
- **THE POLITY IS STILL 0 — THE BLOCK IS LINK COUNT,
  NOT TRUST.** All 8 armed seeds blocked
  seasoned-but-no-polity (was 7x never-seasoned + 1x
  seasoned-but-no-polity). Answering the mail moves the
  blocking reason; it cannot conjure the other two links.
  (This arm, pilot.)
- **TENDLINK OVERPAYS THE PANTRY BY ~5%.** 41 tends paid
  64,732 kcal vs 61,500 at the 1,500 sticker (whole-item
  removal; 1,600 typical). (This arm.)
- **TRUST CAPS AT 100.** Four links peak at exactly 100;
  two tends land +4 (96 -> 100). The cap now binds because
  trust can reach it. (This arm.)
- **MEDIAN 132 IS THE UPPER MEDIAN (method finding,
  confirms secondlink-a).** The per-seed day list sorts to
  a standard median of 120.5; the trustgrowth analyzer's
  medianSurvival takes sorted[floor(n/2)]. This arm uses
  the standard median and reports the TG figure alongside.
  (This arm, prereg amendment 1.)
- **WHOLE-RUN DEATH COUNTS MISLEAD ON LIFE-EXTENSION
  LEVERS (panel reading).** Village deaths per run +5.875
  (regression_watch) while deaths per 100 days -5.8864
  (no material signal): longer lives accumulate more
  deaths. Judge survival levers on the per-day read.
  (This arm, panel.)

## Proof and landing

- Prereg: `evidence/2026-11-10/sim-answermail-a-prereg.md`
  (commit 592035af6) + amendment 1
  (`evidence/2026-11-10/sim-answermail-a-prereg-amendment.md`,
  commit c11c18381) + amendment 2
  (`evidence/2026-11-10/sim-answermail-a-prereg-amendment-2.md`,
  commit d5e2d2856) + amendment 3
  (`evidence/2026-11-10/sim-answermail-a-prereg-amendment-3.md`,
  commit b491c98bb) + amendment 4
  (`evidence/2026-11-10/sim-answermail-a-prereg-amendment-4.md`,
  commit ddab32923) + amendment 5
  (`evidence/2026-11-10/sim-answermail-a-prereg-amendment-5.md`,
  this adoption: formation-day twin-pairing analyzer fix).
- Policy + instruments + proof:
  `scripts/policies/competent-answermail-a.js`,
  `scripts/answermail-driver-20261110.js`,
  `scripts/answermail-analyze-20261110.js`,
  `scripts/build-answermail-panels-20261110.js`,
  `scripts/test-answermail-a.js` — proof 17/17 PASS (15 policy
  checks + cap-phantom proof + twin-pairing regression + live
  60d smoke leg; the task brief's "15/15" predates the two
  regression checks) — plus the shared analyzer fix in
  `scripts/trustgrowth-analyze-20261109.js` (unifyEvents pairing,
  amendment 5, zero src/js).
- Corpus: `evidence/2026-11-10/perseed-answermail-a/`
  (16 pilot files + 2 trustgrowth summaries; 32 confirm-v3 files
  + 2 trustgrowth summaries + verdict
  `answermail-verdict-confirm-v3.json`); the discarded v2
  computation is kept as `evidence/2026-11-10/
  perseed-answermail-a-confirm-v2/` (32 files + verdict INVALID,
  superseded — do not judge from it); panel
  `evidence/2026-11-10/answermail-panel*` (pilot, before/after
  .json.gz + compare .json/.md) + `answermail-panel-confirm*`
  (confirm panel, same set).
- check.js --quick on the tooling commit: 293 passed, 7
  failed in 914s. None of the 7 is this arm's test (which is
  not in the green list; it passes 15/15 standalone). The
  7 are pre-existing at base a5d615880 — this arm's diff
  adds 6 files and modifies 0, so it cannot have caused
  them (measurement-proof staleness, documented in the
  tracker rebuild; phone-frame receipt staleness; observer-
  neutrality timeout; mobile-combat-cadence; occupation
  panels; establishment-r20 racks-voice). Reported here,
  not hidden.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after all three commits
  (and an MM on the analyzer once); repaired each time via
  HEAD-blob `update-index --cacheinfo` after ls-tree
  verification, and verified `git status` empty + `git diff
  HEAD` empty. The commits themselves were always correct.
- Worktree state at adoption closeout: only committed work plus
  the evidence + corpus + panel commit below (pilot corpus and
  panel, confirm-v3 corpus and panel, discarded confirm-v2
  corpus as record, amendment 5, analyzer fix + regression
  check); no uncommitted leftovers beyond that commit.

## Confirm (amendment 2) — VERDICT: GO

Judged on the amendment-4 re-run (instrument v3), band 120101-120116,
16 seeds/leg, 150d death-aware horizon, against the amendment-2 bars
(primary seasoned >= 10/16; cost bar starvation armed <= control + 2
AND <= 2 arm-only, median armed >= 0.8 x the confirm band's own
control median; fidelity accord answers == links formed, tends > 0,
renegotiation silences 0, instrument errors 0, unattributed 0).

### Adoption provenance (read this before the numbers)

The corpora the coordinator brief described as already existing
(`perseed-answermail-a-confirm-v2/`) are the DISCARDED first
computation: file timestamps prove the legs ran 07:23-07:44 UTC,
before the v3 instrument was committed (07:56:58), and the verdict
file in that directory is the discarded INVALID (6 cap-phantom
unattributed downs, polities miscounted as 1). Amendment 4's
re-run had started before the worker died — base leg 120101-120105
re-run with the v3 instrument (anchor ddab32923, trajectories
identical to the first computation on days, standings, wave
unlocks, and end reasons) — and this adoption
resumed and finished it: base 120106-120116 + armed 120101-120116,
same driver, same RUN names, into `perseed-answermail-a/`. All 32
v3 legs reproduce the discarded run's trajectories exactly (days,
standings, wave unlocks, end reasons) — determinism confirmed on
all 32, as amendment 4 predicted. The v2 directory is kept in the
tree as the discarded record; the judged corpus is the v3 one.

The v3 computation first returned unattributedDown 1 (seed 120104
d29) — a SECOND analyzer artifact, distinct from the six
cap-phantoms: the formation-day twin misattribution. Diagnosed,
fixed in the analyzer (`unifyEvents` consumes setter twins in
descending seq order), and proven by a new regression check — see
prereg amendment 5 (`sim-answermail-a-prereg-amendment-5.md`),
committed before this verdict was computed. No sim was re-run for
it: the per-seed data was correct, only the analysis double-counted
one real +1 move. Before/after diff of the band summaries: pilot
base/armed and confirm base byte-identical; confirm armed changes
only on the 120104 lines (d29 reconciles, reconciledDays 393->394,
unattributedDown 1->0, accord-gift +10 now attributed,
tribute-weekly -1). The numbers below are the post-fix judgment.

### The judged numbers

1. Primary: seasoned links 13/15 armed vs 2/15 control (15 links
   formed per leg; 120116 forms none on either leg — dies day 31).
   GO bar was >= 10/16. **PASS.**
2. Cost bar: **PASS.** Starvation 4 armed vs 5 control (cap
   control+2 = 7); arm-only starvation 1 (cap 2 — the 120101
   armed death on a seed whose control leg starved 0); median
   survival 136.5 armed vs bar 86.4 (0.8 x control median 108).
   Standard median; TG upper-median figures 114 -> 137.
3. Fidelity: all pass. Accord answers 15 == links formed 15
   (amendment 3's corrected gate — every staged accord answered);
   tends 112 band-wide; renegotiation answers 14, silences 0;
   demand answers 0 (no demands were staged on this band);
   instrument errors 0 on all 32 legs; reconciliation 394 link-days
   reconciled armed (260 control), 0 unattributed residue on
   both legs.
4. Polity: 0/16 on both legs, as the prereg expected (reported,
   not judged). The blocking reason is uniformly
   "seasoned-but-no-polity" on all 13 armed seasoned seeds (control:
   13x never-seasoned + 2x seasoned-but-no-polity + 1x no-links).
   Answering the mail seasons the one link; it cannot conjure the
   other two a polity needs.
5. Balanced panel (§15): `evidence/2026-11-10/answermail-panel-confirm`
   — decision review_required. Village deaths per run +3.625
   (CI -6.0625 to 13.5, crosses 0); village deaths per 100 days
   -10.1253 (CI -23.0472 to 1.8475, no material signal); community
   loss -0.125 (CI -0.3125 to 0, no material signal). National,
   wins, table: 0 -> 0, no material signal. The raw-deaths watch is
   the live-longer artifact again (villages that live longer
   accumulate more deaths; per-day deaths fall) — same reading as
   the pilot, and the per-day fall is larger on the confirm
   (-10.1 vs -5.9). Community loss IMPROVED on the confirm
   (0.875 -> 0.75 lost) where the pilot had worsened it — the
   pilot's 1-seed community-loss watch was divergence noise.
Proof: `scripts/test-answermail-a.js` — 17/17 PASS (15 policy
checks + the cap-phantom proof + the amendment-5 twin-pairing
regression + the live 60d smoke leg).

## THE ANSWER (plain words, confirm)

Answering the mail works on fresh ground, not just on the pilot's
eight villages. On sixteen new villages the one friendship each of
them gets now holds warm on thirteen — it used to hold on two.
The gift still lands the day the bond is born, the grain still goes
out every week the pantry can carry it, and when a new speaker
buries the old one the answer is still grain, not silence: fourteen
such griefs met with grain, none met with silence. And the
villages do not starve for it: four starvation deaths across the
whole armed band against five on the plain-play band, and the
middle village lived 136 days against 108.

But the seat is exactly as far away as it was. No village reached
national, no table, no win, on either leg — the wall did not move.
A realm needs three seasoned bonds under one head and every village
still has exactly one friendship. The trust half of the diplomacy
road is now confirmed solved on two bands, 21 of 24 links seasoned
against 3 of 24 left alone. The link-count half is the whole story
that is left, and this arm was never going to solve it: it proposes
nothing by design. The next build is the second link.

## Per-seed table (confirm)

| seed | base days | armed days | base link (born->peak->end) | armed link (born->peak->end) | accord | tends | reneg | starv base->armed |
|------|-----------|------------|-----------------------------|------------------------------|--------|-------|-------|-------------------|
| 120101 | 72 lost | 145 lost | Stonebridge 30->40->21 rises | Stonebridge 48->75->50 seasoned | 1 | 9 | 0 | 0->1 |
| 120102 | 114 lost | 144 lost | Ashford 34->56->47 seasoned | Ashford 44->100->72 seasoned | 1 | 6 | 1 | 0->0 |
| 120103 | 62 lost | 150 surv | Stonebridge 30->34->0 decays | Stonebridge 48->100->29 seasoned | 1 | 7 | 1 | 0->0 |
| 120104 | 97 lost | 115 lost | Thornfield 30->32->18 decays | Thornfield 48->100->68 seasoned | 1 | 8 | 0 | 1->0 |
| 120105 | 57 lost | 137 lost | Thornfield 30->35->9 decays | Thornfield 48->100->87 seasoned | 1 | 7 | 0 | 0->0 |
| 120106 | 102 lost | 68 lost | Emberhold 30->34->22 holds | Emberhold 48->74->63 rises | 1 | 3 | 5 | 0->0 |
| 120107 | 150 surv | 150 surv | Emberhold 30->34->7 decays | Emberhold 48->100->100 seasoned | 1 | 15 | 0 | 0->0 |
| 120108 | 124 lost | 73 lost | Emberhold 30->30->4 decays | Emberhold 48->62->49 rises | 1 | 2 | 2 | 0->0 |
| 120109 | 150 surv | 150 surv | Emberhold 30->39->0 decays | Emberhold 40->100->64 seasoned | 1 | 8 | 0 | 0->0 |
| 120110 | 141 lost | 122 lost | Emberhold 34->36->0 decays | Emberhold 44->100->83 seasoned | 1 | 11 | 0 | 0->0 |
| 120111 | 85 lost | 136 lost | Stonebridge 30->35->27 holds | Stonebridge 48->100->68 seasoned | 1 | 11 | 2 | 0->0 |
| 120112 | 142 lost | 150 surv | Stonebridge 30->31->2 decays | Stonebridge 48->100->47 seasoned | 1 | 12 | 0 | 0->0 |
| 120113 | 85 lost | 140 lost | Emberhold 30->40->21 seasoned | Emberhold 48->100->68 seasoned | 1 | 8 | 0 | 0->0 |
| 120114 | 125 lost | 61 lost | Thornfield 30->35->8 decays | Thornfield 40->51->44 seasoned | 1 | 0 | 1 | 0->0 |
| 120115 | 143 lost | 96 lost | Stonebridge 30->31->6 decays | Stonebridge 48->91->87 seasoned | 1 | 5 | 2 | 1->0 |
| 120116 | 31 lost | 31 lost | no link | no link | 0 | 0 | 0 | 3->3 |

Band totals (confirm): seasoned 2/15 -> 13/15. Trust gains +393 ->
+1517 (accord-gift +150, tend +829, renegotiation-answer +91,
tribute-weekly +99, aid-offer-accept +280, aid-beg-give +68).
Trust downs -679 -> -996 (succession-haircut -568, titan-event
-400, tribute-nothing -6, tribute-thin -2, aid-beg-refuse -20;
renegotiation-silence -90 on the control leg, 0 armed). Median
survival 108 -> 136.5. Survivors 2 -> 4. Standing: 120112
199->515, 120102 275->370, 120103 199->340, 120104 175->300,
120109 300->400, 120110 199->335, 120107 355->390, 120105
145->199, 120111 170->199; down on 120106 199->125, 120114
199->150, 120115 325->199; flat on the rest.

## The two that did not season (confirm)

- **120106 (Emberhold, 48->74->63, died d68).** The link was
  rising — five renegotiation answers in 68 days, a succession
  cluster met with grain every time — but the village died at
  day 68, before the link's 30th day (formed d45). Seasoning
  needs age 30 AND trust 40 on the same day; the village ran out
  of days, not trust. The mail was answered; the village died.
- **120108 (Emberhold, 48->62->49, died d73).** Same shape:
  formed late (d59), answered twice in grief, rising, but dead
  at day 73 — fourteen days short of the 30-day season. Both
  misses are short lives, not cold links. On the pilot the one
  non-seasoned armed seed never existed (8/8); the confirm's two
  misses are both late-formed links in short-lived villages.
- **120116 (no link, both legs).** Died day 31 with standing 0,
  three starvation deaths, before the ladder stage-3 reward could
  grant a link. No accord was ever staged, so there was no mail
  to answer — the amendment-3 gate correction in one seed.

## Wall numbers (confirm)

Wins 0/16 -> 0/16. National 0/16 -> 0/16, table 0/16
(scaleRank "regional" on 14 armed seeds, "village" on 120108 and
120116). Wave-4 unlocks 15/16 -> 15/16, wave-5 unlocks 4/16 ->
7/16 (120102, 120103, 120104, 120107, 120109, 120110, 120112).
Median run-days 108 -> 136.5 (2 survivors control; 4 survivors
armed). The wall did not move on the seat: no national, no table,
no win. The wave-5 unlocks moved (4 -> 7) on standing gains — but
those standings rode diverged trajectories (see the survival note
in the pilot section), so they are reported as a secondary, not as
a lever effect. Combined pilot + confirm: seasoned 21/23 armed
vs 3/23 control; national 0/24, table 0/24, wins 0/24.

## Metric review (confirm — for the NEXT run, §14)

- The confirm GO bars held up: the primary separated the band
  cleanly (2/15 -> 13/15), the fidelity gates all passed after
  the two instrument/analyzer fixes, and the cost bar passed on
  both legs (starvation 4 vs 5, median 136.5 >= 86.4). No bar
  needs lowering or raising.
- The fidelity gate did its job twice: it caught the v2
  cap-phantom (6 residue) and then the twin misattribution
  (1 residue). Both were analyzer-side double-counts of real
  moves, not lever effects — but the gate correctly refused to
  judge until the counting was proven honest. The unattributed-0
  bar stays as is; it is the tripwire that caught both artifacts.
- The median bar (0.8x control median on the band's own control
  leg) passed with wide margin on both bands (130.5 vs 96.4
  pilot; 136.5 vs 86.4 confirm). The median direction is
  consistent across bands but the per-seed day deltas are still
  divergence noise (armed - control: +73, +30, +88, +18, +80,
  -34, 0, -51, 0, -19, +51, +8, +55, -64, -47, 0) — three armed
  seeds collapsed hard (120106, 120108, 120114) while five gained
  50+ days. Do not lean on the median alone; the primary and the
  starvation legs are the judges.
- The tend overshoot (pilot §next-blanks #3) persists
  unmeasured on the confirm band; the pantry-kcal accounting for
  the 112 tends was not re-audited here. It stays a small engine
  question for a later arm.
- Panel note: the trustgrowth analyzer CLI's file filter matches
  its own summary output, so re-running it in a directory that
  already holds a summary self-includes a degenerate extra seed
  (found during this adoption: 9- and 17-seed bands). Delete
  summaries before re-running; the analyzer itself needs the
  filter fixed (a later arm — the filter is shared tooling, and
  this arm's fix was scoped to the pairing defect only).
