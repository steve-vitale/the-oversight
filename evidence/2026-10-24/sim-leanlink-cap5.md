# sim-leanlink-cap5 — lean courtship, cap-5 headroom WITHOUT tends (scale-onramp axis)

Run: flesh-out loop arm sim-leanlink-cap5 (ARM 3). Worktree: `~/workspace/worktrees/sim-leanlink-cap5`.
Base anchor: `34101b3cde24` (single anchor across all 32 judged configs, asserted by the proof test).

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional → national →
  global, transitions are moments not thresholds, never speedrunnable, verbs never change.
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run.
- NO canon doc covers the envoy→accord mechanism specifically — stated, not invented. The
  mechanism comes from `src/js/hierarchy.js` (read before designing), `scripts/policies/
  linkform.js` and `leadcourt.js` (both read): national is a polity — LEAD = primary of ≥3
  seasoned subordinates; seasoned = link 30+ days old AND trust 40+ (formed at 30); one rung
  per season (national cannot stage until regional for a full season); Regional Dawn at
  bond 21+ days; proposeLink scores courtship (≥55 accepts, 35–54 counters with played
  terms, <35 declines); counter-terms played, never rolled; national/global beats are played
  with real costs and a REFUSE option; national is a live state (dissolve the realm and
  nationalLive clears).
- Predecessor context: sim-linkdrive (2026-10-24) proved a link/courtship drive moves
  national 0/8 → 7/8, but was KILLED-AT-PILOT on the binding starvation guardrail (armed 5
  vs control 1 + 2 allowance). Linkdrive combined TWO changes over leadcourt: cap 3 → 5
  (overcourt headroom — its mechanism notes show the headroom absorbing broken links: seed
  73406 held global with 4 active subs despite 2 broken links) AND weekly tends to all
  links. Sim-envoyaccord proved the before-regional wall is no-proposal-made (50/50 envoy
  events, counterfactual judgeLink accept-certain). This arm isolates the cap: keep the
  5-link headroom, drop the tend ingredient entirely, and test whether headroom alone
  (without tend cost) preserves the national gain.

## Pairing — defined exactly (the crux)

- Control = `scripts/policies/competent.js` (no env levers).
- Armed = `scripts/policies/leanlinkcap5.js` with `LEANLINKCAP5=1` (env-gated, default OFF).
- Armed daily = `competent.daily` + lean courtship copied from linkformCourtship (LINKFORM=2
  shape) with EXACTLY one delta vs LINKFORM=2: NO weekly tends at all. Subordinate cap stays
  5. Nothing else changes: answers pending counters (sweeten if pantry > 25,000 kcal else
  accept), accords (gift), national beats (shape-mapped pick), global beats (feast),
  defense calls (send if pop >= 5 else refuse); proposes from day 25, 1/day, 7-day
  per-village cooldown, pantry > 12,000 kcal, tribute 4,000 kcal/week.
- So the delta armed-vs-control is the whole no-tend courtship with the cap-5 headroom;
  the delta armed-vs-linkdrive-armed is EXACTLY the tend ingredient (and its pantry cost).
  The policy file contains NO tend verb at all (proven by the proof test: no `tendLink`,
  no `ctx.tended` assignment); the sweep's `court.tended` counter must read 0 on every
  armed row, and that zero is asserted, not assumed.
- Do NOT modify competent.js, linkform.js, leadcourt.js, or any src/js. Policy-side ONLY.
- Broken-link correction (from linkdrive): links in `broken` status at end COUNT as
  dissolutions. This sweep records `links.brokenFinal` (final broken-status links) and
  `links.dissolvedPlusBroken` (vanished + broken-final) alongside the legacy vanished-only
  `links.dissolved`, and judges dissolutions on the corrected count.

## Pre-registration (binding, §14 — written BEFORE any sweep, judged against this, never re-scored mid-run)

- Pilot seeds: FRESH band 73501–73508 × {control, armed} paired = 16 configs. Band verified
  unused at run start (no `*7350*` file under `evidence/2026-10-24/` at run start).
  Sibling arms use the same band with different policy files — by design; the paired
  comparison is within-arm.
- Confirm ONLY on pilot GO: 73509–73516 × {control, armed}. No confirm spend on a pilot NO-GO.
- Horizon: 180d death-aware (dead villages stop; +10d tail max).
- PRIMARY GO: national armed ≥ 2/8 AND armed national > control national.
- Guardrails (binding — breach = KILLED even if the primary passes):
  - starvation deaths armed ≤ control + 2;
  - median survival armed ≥ 0.8 × control median;
  - no lever-caused death-mode spike (any cause with ≥ 3 deaths in armed and 0 in control
    must be named and judged).
- A GO verdict means GO CANDIDATE, default-OFF only — landing this as competent play is a
  coordinator/Steve call, NOT made by this arm. No default flips.
- Also reported: regional/table/wins, wave reach (1–5), median/max survival, death-cause
  shares, links formed, accords, counters, tends (= 0 by design — verified), broken-status
  links COUNTED as dissolutions, and §14c co-primary non-scholar combat deaths.
- Balanced panel (§15): ATTEMPT `scripts/balance-panel.js`; if it cannot ingest this
  corpus, state the inapplicability explicitly and fall back to the identical-seed paired
  comparison judged by the bar above.
- Sense: at least one courtship transcript sequence read in EACH arm and judged below
  (sense runs are separate narration-on runs; their words only are judged, never their
  numbers).

## §14b pre-pilot substrate checklist (run BEFORE the pilot sweep)

Probe: armed, seed 73501, 60d, `perseed-leanlinkcap5/probe/s73501-armed.json` (NOT part of
the judged pilot corpus). Checks: proposals fire from day 25; links form at trust 30;
tends stay 0; rank movement by day 60. Results appended below before the pilot sweep.

Probe results (anchor 34101b3cde24, 60d, survived, rank regional, maxWave 2, 12 deaths,
0 errors) — ALL CHECKS PASS:
- Contact: PASS — proposals fired days 25, 26, 27 (3 links formed, all Haven-primary);
  3 accords answered; rank reached `regional` by the day-49 weekly sample.
- Tends-zero: PASS — `court.tended = 0` exactly, the arm's defining zero, verified in the
  corpus (not assumed from the source). The policy file contains no tend verb at all.
- Trust without tends: PASS with a mechanism note — trusts rose WITHOUT any tend:
  day 28 [40, 40, 40] → day 35 [41, 41, 45] → day 49 [47, 43, 47] → day 56 [52, 44, 48].
  Accord gifts + tribute handling lift trust past the seasoned bar (40) on their own;
  the seasoning bar is reachable without the tend verb. The open question is whether
  trust HOLDS at 40+ across 3+ links for the seasons national needs, without the
  +8/week tend ratchet — that is what the pilot measures.
- Pool sizing: PASS with a ceiling caveat — only 3 other villages exist in this seed
  world (all 3 known), so the cap-5 headroom cannot even express here: max 3 subs, the
  same as leadcourt's cap 3. As in linkdrive's probe (4 villages, headroom of exactly
  one), the 5-link polity is not on the table in small worlds. The pilot's per-seed
  `otherVillages` counts must be read with the verdict: headroom only bites on seeds
  with ≥4 known villages.
- Verb existence: PASS — proposeLink, answerAccord fired; answerCounter /
  answerNationalChoice / answerGlobalChoice code-present but not yet staged by day 60,
  as expected (counters arrive on proposals, national/global beats only after a
  seasoned polity). hierarchyState read every day without errors.
- Horizon fit: PASS — courtship from day 25, regional by ~day 49, links season at 30+
  days (~day 55–57), national needs regional + 30 days (earliest ~day 79). 180d leaves
  ~100d of national window. The calendar is not the binding constraint; the HOLD
  (trust ≥ 40 sustained across 3 links without tends + pantry to feed the tribute) is.

## Pilot results (16 configs, anchor 34101b3cde24, 180d death-aware)

Paired per-seed table (gameDays = scholar day at end; 181 = survived the full 180d horizon —
day-count off-by-one, identical in both arms; `table` = progState tableWaiting OR tableDone;
`broken` = final broken-status links, counted as dissolutions per the linkdrive correction):

| seed | arm | days | end | rank | nat | table | wave | deaths | starv | villCombat | formed | maxSubs | finalSubs | broken |
|------|-----|------|-----|------|-----|-------|------|--------|-------|------------|--------|----------|-----------|--------|
| 73501 | control | 181 | survived | village | 0 | 0 | 4 | 45 | 1 | 38 | 0 | 0 | 0 | 0 |
| 73501 | armed | 113 | village-lost | national | 1 | 0 | 4 | 30 | 2 | 19 | 3 | 3 | 3 | 0 |
| 73502 | control | 75 | village-lost | village | 0 | 0 | 4 | 30 | 0 | 15 | 0 | 0 | 0 | 0 |
| 73502 | armed | 138 | village-lost | global | 1 | 1 | 4 | 37 | 0 | 19 | 5 | 5 | 5 | 0 |
| 73503 | control | 172 | village-lost | village | 0 | 0 | 4 | 56 | 0 | 43 | 0 | 0 | 0 | 0 |
| 73503 | armed | 181 | survived | regional | 0 | 1 | 3 | 53 | 0 | 40 | 4 | 4 | 4 | 0 |
| 73504 | control | 181 | survived | village | 0 | 0 | 4 | 42 | 1 | 26 | 0 | 0 | 0 | 0 |
| 73504 | armed | 180 | survived | regional | 0 | 1 | 4 | 45 | 1 | 31 | 6 | 4 | 4 | 2 |
| 73505 | control | 181 | survived | village | 0 | 0 | 4 | 31 | 0 | 21 | 0 | 0 | 0 | 0 |
| 73505 | armed | 117 | village-lost | regional | 0 | 1 | 4 | 33 | 0 | 21 | 5 | 5 | 4 | 1 |
| 73506 | control | 174 | village-lost | village | 0 | 0 | 3 | 34 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73506 | armed | 181 | survived | national | 1 | 0 | 3 | 21 | 0 | 17 | 5 | 5 | 5 | 0 |
| 73507 | control | 181 | survived | village | 0 | 0 | 3 | 32 | 1 | 25 | 0 | 0 | 0 | 0 |
| 73507 | armed | 145 | village-lost | regional | 0 | 0 | 4 | 40 | 0 | 32 | 5 | 4 | 4 | 1 |
| 73508 | control | 180 | survived | village | 0 | 0 | 4 | 32 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73508 | armed | 181 | survived | national | 1 | 0 | 3 | 27 | 0 | 23 | 5 | 5 | 5 | 0 |

Totals — control: national 0/8, regional 0/8, global 0/8, table 0/8, won 0/8, exiled 0/8;
waves 3:3 / 4:5; median survival 180.5d, max 181d; deaths 302 (scholar 65, villager 237,
villager-combat 214); starvation 3; links formed 0; court all 0 (pairing holds).
Totals — armed: national 4/8, regional 8/8, global 1/8, table 4/8, won 0/8, exiled 0/8;
waves 3:3 / 4:5; median survival 162.5d, max 181d; deaths 286 (scholar 60, villager 226,
villager-combat 202); starvation 3; links formed 38, vanished 0, broken-final 4
(dissolvedPlusBroken 4); court: counters 1, accords 28, national answers 6, global
answers 2, proposed 38, tended 0 (verified on every row), defense calls 0. Zero sweep
errors on all 16 files. Waves 1–2 universal (not tabulated); wave 5 reached in 0/16 either
arm — the pre-existing wave-5 wall, not this arm's question.

Pilot verdict against the header (no re-scoring):
- PRIMARY GO: national armed 4/8 ≥ 2/8 AND 4 > control 0 → PASSES.
- Median guardrail: armed 162.5d ≥ 0.8 × control 180.5d = 144.4d (ratio 0.90) → PASSES.
- Starvation guardrail: armed 3 ≤ control 3 + 2 = 5 (diff 0) → PASSES.
- Spike guardrail: no cause with ≥ 3 armed deaths and 0 control deaths → PASSES (clean).
- Pilot verdict: GO — confirm band 73509–73516 is therefore run, per the header.

## Confirm results (16 configs, same anchor, 180d death-aware)

Confirm control: national 0/8, regional 0/8, global 0/8, table 0/8, won 0/8; median 181d;
deaths 278 (scholar 51, villager 227, villager-combat 210); starvation 1; waves 3:1 / 4:7.
Confirm armed: national 4/8, regional 8/8, global 4/8, table 6/8, won 0/8; median 178d;
deaths 334 (scholar 63, villager 271, villager-combat 242); starvation 3; links formed 39,
vanished 0, broken-final 6 (dissolvedPlusBroken 6); court: counters 3, accords 33,
national answers 6, global answers 5, proposed 39, tended 0, defense calls 0. Zero errors.

Confirm per-seed (armed only; control is village rank, national 0, on all 8):
73509 regional/table, 123d, village-lost; 73510 global/table, 99d, village-lost;
73511 global, 181d, survived; 73512 regional/table, 181d, survived;
73513 regional/table, 174d, village-lost; 73514 global, 181d, survived;
73515 global/table, 181d, survived; 73516 regional/table, 175d, village-lost.

Confirm verdict against the header: PRIMARY 4/8 ≥ 2/8 AND 4 > 0 → PASSES (an exact
replication of the pilot's 4/8). Median 178d ≥ 144.8d → PASSES. Starvation 3 ≤ 1 + 2 = 3
→ PASSES, exactly at the allowance (no headroom on this band — stated plainly, not
hidden; the bar as written is met, not exceeded). Spikes: none → PASSES.

Combined pilot + confirm (32 configs): armed national 8/16, regional 16/16, global 5/16,
table 10/16, won 0/16, exiled 0/16; control national 0/16, regional 0/16, table 0/16;
median armed 177.5d vs control 181d; deaths armed 620 vs control 580; starvation armed 6
vs control 4 (combined diff +2, also exactly at the +2 allowance); villager-combat armed
444 vs control 424 (pilot had armed LOWER, 202 vs 214; confirm had armed higher, 242 vs
210 — the confirm's extra villager combat rides on higher-rank exposure, the same class
as linkdrive's finding, and control has plenty of villager combat too, so no spike);
waves 3:4 / 4:12 in BOTH arms; wave 5: 0/32. Links formed 77, vanished 0, broken-final 10.
Court combined: counters 4, accords 61, national answers 12, global answers 7, proposed
77, tended 0, defense calls 0.

## Verdict: GO CANDIDATE (default-OFF only)

Judged against the pre-registered header in both bands, no re-scoring: the primary passes
twice (4/8 pilot, 4/8 confirm, 8/16 combined vs 0/16 control), and all three guardrails
pass in both bands. The verdict is GO CANDIDATE, default-OFF only — landing this as
competent play is a coordinator/Steve call, NOT made by this arm. No default flips.
What this verdict does NOT claim: the win. Won = 0/32 in both arms; no arm takes the
table seat (table waiting ≠ win, as linkdrive found). The full chain (table → win) is
still the next blank, not this arm's.

Comparison with linkdrive (same question, tend ingredient included): linkdrive armed
national 7/8 with starvation 5 vs 1 (KILLED on the guardrail). Leanlink armed national
4/8 with starvation 3 vs 3 (pilot) and 3 vs 1 (confirm). Dropping tends roughly halves
the national rate (7/8 → 4/8 per band) AND removes the starvation breach. In plain words:
the weekly grain gifts to allied villages were doing real work holding realms together —
without them, about half the villages that would have reached national still do, and the
villages stop starving from the upkeep. The headroom alone (room for 5 allies instead of
3) preserves a real but smaller gain, at no starvation cost.

## Mechanism: what holds a realm together without tends, and what doesn't

- The trust economy without tends has three visible channels (sense transcript + numbers):
  tribute wagons turned at the gate when shelves are full (+1 trust each week per link),
  fire-network food gifts from allies (+4, irregular, with named runners and real amounts),
  and the court feast (+10 with each link when a court is held). Tended villages get
  +8/week/link on top of these; lean villages climb slowly (+1s and +4s) instead of
  ratcheting. That slow climb is enough on rich villages and not enough on poor ones.
- Rich villages hold: 73508's trusts climb all run ([40s] → [87, 91, 69, 58, 58]) and
  73506's hold [76, 100, 87, 90, 70] — both end national with pantries in the tens of
  thousands. The court feast is a ratchet lean villages need: 73508's trusts jump +11
  across the First Court week (day 70 → 77), and villages that never reach a court never
  get that lift.
- Poor villages bleed: 73503's trusts peak at formation (~40) then bleed from day 35
  ([33, 41, 33] → [21, 33, 21, 33] → [6, 22, 9, 8] → [0, 19, 0, 0]) even while the pantry
  later holds 10k–70k — the early thin pantry (9.5k at day 35) seems to have broken
  something that later plenty doesn't repair. 73505's trusts rise to [48, 44, 48, 44, 31]
  then bleed as its pantry collapses (90k → 641 by day 112, village-lost day 117): five
  allies cost 20,000 kcal/week in tribute before the village eats, and the pantry
  couldn't carry it. 73504 ends [21, 39, 15, 26] with 2 broken links (trust 17, 16).
  In plain words: without the weekly grain gifts, a realm's friendships slowly cool
  unless the village is rich enough that everything else keeps them warm — and once
  friendships cool below the bar, there is no routine way back.
- Headroom DID express in this band (unlike the 3-village probe world): 7 of 8 pilot
  seeds have ≥4 known villages; maxSubs hit 5 on 73502/73505/73506/73508. 73505's story
  is the headroom thesis in miniature: 5 allies formed, 1 broke, 4 held — the extra room
  absorbed the break (as linkdrive's 73406 did) — yet it still stalled at regional
  because the surviving trusts decayed. Headroom absorbs a broken bond; it does not
  warm a cooling one.
- National is a live state, not a title: 73507 touched national (day 98 weekly sample),
  fell back to regional (day 105), touched national again (day 112) and global (days
  119–126, with an EMPTY pantry), then fell back to regional (days 133–140) as trusts
  sagged — yet counts as national 0 in the end-state metric. The pre-registered metric
  is end-state national, judged as written (4/8 pilot); the transient is reported here
  as mechanism, not re-scored. Counting touched-ever, pilot national-or-better is 5/8,
  not 4/8 — and the same live-state logic means a village can lose what it earned.
  (Confirm adds a second transient: 73513 reached national on days 77–133, then fell
  back to regional — confirm touched-ever is likewise 5/8, combined 10/16 vs end-state
  8/16.)
- Starvation detail (robustness, not re-scoring): pilot 73501's scholar starvation on
  day 16 is IDENTICAL in both arms (substrate, not lever — same class as linkdrive's
  matched 73402 death). Armed-only starvation deaths: 73501 day-67 villager, 73504
  day-142 villager (2); control-only: 73504 day-171 villager, 73507 day-50 villager (2).
  On the fairer arm-only count the pilot is a tie, 2 vs 2. The confirm band's 3 vs 1 is
  the band where the guardrail sits exactly at its allowance.
- Table nuance (carried from linkdrive, confirmed here): table waiting ≠ win, and table
  is not national-gated — pilot 73503/73504/73505 reached table 1 at regional rank with
  zero national answers, and confirm 73509/73512/73516 did the same. (Confirm 73513 is
  the exception that proves the live-state rule: it reached national on days 77–133,
  answered a national beat, then fell back to regional by day 140 — a second
  transient-national case after pilot 73507.) The table prices the run; it is not a
  national prize.
- Defense calls: 0 staged in all 32 judged configs — that courtship ingredient is
  unmeasured in this band, not proven absent from the game.

## Sense verdict (SENSE-TESTING LAW: meaning, coherence, relevance, consequences)

Sense runs are separate narration-on runs (seed 73501, 100d); their WORDS only are judged,
never their numbers.

- ARMED transcript (73 tight-filter lines): a coherent no-tend courtship story, not a
  count. Days 25/26/27 — "Larisa brings it home: Emberhold bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The relationship starts at trust
  30. Everything from here is earned." Day 27 — "Three fires bow to Haven. But a realm
  isn't leverage — it's seasons. These bonds are young; tend them, keep the trust, and
  the court will come." Day 28 onward, weekly — "Tribute wagons from Emberhold turn at
  the gate — our shelves are full past tomorrow. 'Eat well,' we send back. 'That IS your
  tribute this week.' (Trust +1.)" — the engine refusing tribute honestly, which is why
  trusts climb on turned tribute and gifts, not on tends (there are none). Fire-network
  gifts arrive with named runners and reasons: "Deshawn of Thornfield walks into Haven
  unannounced, pack-mules behind. 'Heard your bins are echoing. Thornfield has grain to
  spare — 2,316 kcal, no tribute, no ceremony. Say the word.'" / "That's what the fire
  network is FOR. (Trust +4.)" Day 46 — Regional Dawn: "One fire was a village. Two fires
  is a NETWORK. Coordination layer: online... Try not to starve twice as fast." Day 67 —
  succession test, said aloud: "Emberhold watches to see if Haven holds without its dead
  — and presses the tribute down to 3,000 kcal/week while the chair is empty. They'll
  test the link. Count on it." Day 68 — the drift warning, honest about untended bonds:
  "Stonebridge's fire is drifting from ours — their speaker doesn't linger at the gate
  the way they used to, and nobody over there says why. Bonds don't mend themselves; a
  tended fire remembers who fed it." Day 84 — First Court with a real choice (feast
  5,000 kcal shared granary / host / cold ink / REFUSE the scale itself); the policy
  feasts (day 85: shared granary opens, +10 with each fire). Day 84 — "Four fires. One
  head. GOVERNANCE LAYER: online... You built a realm. Try not to lose it the way you
  found it." Every beat has a real cost, a named speaker, and a consequence.
  VERDICT: SENSICAL — the no-tend courtship reads as played diplomacy, with the slow
  trust climb visible in the words (+1s and +4s, never a +8 tend line — correctly
  absent). One observation, not a bug: the engine's advice lines say "tend them" and "a
  tended fire remembers who fed it" to a village that never tends. That advice is
  addressed to the player (tending exists as a choice), not to the policy — the village
  hears counsel it doesn't follow, which is coherent, and the drift warning on day 68
  is the game noticing the choice.
- CONTROL transcript (31 lines): ZERO courtship lines — no proposes, no links, no tends,
  no court. The village lives a full village life instead: gossip teaching (Aroha taught
  Olivia Gossip Network), synergy discovery (Word of Mouth), and a televised contest
  (The Oath). The scale-blind village hears nothing of courts and joins nothing.
  VERDICT: SENSICAL — and the contrast with the armed transcript is itself the finding:
  a village that never proposes never hears the scale game at all.
- Villagers acting like people (beyond courtship): teaching spreads person to person
  (Aroha → Olivia → Miguel); allies send food when they hear the bins are echoing, with
  a reason and a name; a dead leader's allies test the new speaker by cutting tribute
  and saying so. Goals, routines, reactions — present, not robotic.
- Repetition notes (documented, not chased — outside this arm): the weekly tribute-wagon
  line repeats verbatim (village names vary; ritual repetition, acceptable); the villager
  line "My kid asked if the watchers have favorites" repeats verbatim across different
  speakers (Miguel, Hassan, Liam here; already in the findings backlog from linkdrive,
  line 905 — no duplicate appended); the fire-network gift line repeats per gift (ritual).

## Village assessment (assessor's account)

- What the villages looked like: control villages stay single-fire villages — they
  survive the full 181d or die at ~75–175d, never link, never hear a court. Armed
  villages become realms in every seed: 3–6 allies formed, regional in 16/16, national
  in 8/16, global in 5/16, courts held, camera feasts eaten — and then most still die
  (village-lost on 73501/73502/73505/73507 pilot, 73509/73510/73513/73516 confirm) of
  combat attrition, not starvation. The dead armed villages die WITH their realms
  (final ranks global/national on 73501/73502 pilot, 73510/73511/73514/73515 confirm
  survivors and dead alike). The scale wall moved: from "never reach national" (0/16
  control here, 0/16 rerunclock) to "reach national in half the villages, hold it in
  the rich ones, watch it cool in the poor ones — and never yet convert it into a win."
- Who thrived and why: rich formers that held trusts ≥ 40 through the seasons (73506,
  73508 pilot; 73511, 73514, 73515 confirm — all survived at national/global with
  trusts climbing). Who died and why: pantry-thin realms (73505: pantry 641 at day 112)
  and combat attrition everywhere — arena + combat deaths dominate death shares in
  BOTH arms (combined, cause-labeled: control arena 91, combat 227; armed arena 107,
  combat 252; co-primary villager-combat: control 424, armed 444), so the armed
  villages' extra deaths (+40 total combined) are mostly more combat exposure at higher
  rank, not the starvation story — except for the 6 starvation deaths the bar counts.
- What knowledge/capabilities were missing: the win itself. No arm takes the table seat;
  the beat-answering policy stops at waiting. The next blank is a take-the-table policy,
  not a stronger courtship drive. Second blank: a routine trust repair that isn't the
  tend verb — cooled realms (73503-style, trusts at 0–24 with a full pantry) have no
  visible way back, and the court feast only helps villages that already reached a court.
- Blank filled or documented: DOCUMENTED, not fixed — and deliberately so. A GO
  CANDIDATE verdict here does not land the lever: the policy file is env-gated and
  default-OFF, and landing it as competent play is a coordinator/Steve call. What lands
  is the instrument + this evidence + the proof test documenting that (a) headroom
  without tends moves national from 0 to 4/8 per band with no starvation breach,
  (b) the tend ingredient was load-bearing for the other half (7/8 → 4/8), and
  (c) the hold mechanism (slow trust climb on turned tribute + gifts + court feasts)
  works on rich villages and fails visibly on poor ones.
- Findings backlog: no new items appended — the one out-of-scope observation (villager
  line repetition) is already logged (sim-findings.md line 905); the transient-national
  and cooled-realm observations are mechanism, documented above, not backlog items.

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: primary + guardrails judged exactly as pre-registered in both bands; no
  re-scoring. The spike clause was applied as written (no spikes in either band).
- Proposed revisions for the NEXT run (not applied here): (1) starvation guardrail
  should count arm-only deaths (matched-substrate deaths like pilot 73501 day-16 scholar
  pollute both sides; the pilot's fairer count is a 2-vs-2 tie, not 3-vs-3); (2) the
  national metric should report touched-ever alongside end-state national — 73507
  reached global and ended regional, and end-state alone hides real reach (and real
  loss); (3) table should split tableWaiting vs tableDone (waiting ≠ win — this run's
  10/16 table with 0/16 wins repeats linkdrive's warning); (4) links.dissolved already
  counts broken-status links in this run (the linkdrive correction, adopted here) —
  future runs should keep it.
- Balanced panel (§15): ATTEMPTED and found inapplicable, stated explicitly. The panel
  has no ingest path for this corpus: its `compare` mode requires `--before`/`--after`
  panel.json.gz files produced by the panel's OWN driver, which runs its own observer
  harness with its own policy registry — and `leanlinkcap5` is absent from
  sweep-compare's POLICY_REGISTRY (grep-verified), so the panel driver cannot run this
  arm at all without registry + observer work that would be a different instrument, not
  a comparison of this corpus. Fallback (as the task anticipates, same as linkdrive):
  the identical-seed paired comparison judged by the pre-registered bar above. The
  panel's absence changes nothing about the verdict — it means the panel is the wrong
  tool for a policy-side courtship arm, not that the measurement is missing.

## Infrastructure notes (loud, for the coordinator)

- EPERM write flap (known container class, third sighting on this repo): the flap blocked
  the per-seed file writer for s73506-armed across THREE attempts (evidence/ direct,
  evidence/ retry, /tmp staging — this flap instance blocks the writer's 1KB chunk
  writes in both dirs, unlike the earlier instance where small appends succeeded). Two
  finished simulations were lost to the flap before the fallback existed (their sims
  re-ran deterministically on the same seeds — seeded runs reproduce, so no data was
  corrupted, only time). Recovery that worked: the sweep gained a stdout fallback
  (finished simulations print their byte-identical JSON between LEANLINK-JSON-BODY
  markers and continue instead of throwing) plus 24 writer attempts; by the time the
  patched sweep ran, the flap had passed and all three files landed normally
  (stdoutSaved false on all three). No simulation result in this corpus comes from a
  stdout reconstruction — every file was writer-verified (sha-checked) — but the
  fallback now exists in the instrument for the next flap. The flap also hit a sibling
  arm's run concurrently (sim-leanlink, seed 73508) — not this arm's lane, not touched.
- First pilot attempt's background command died silently after s73501-armed (session
  record vanished with no completion); the sweep's resume logic (skip valid existing
  files) made the re-run clean. No data lost.
- Filter catch (instrument honesty): the pilot proof test and analyzer originally
  filtered filenames with a loose `s7350\d+` pattern, which silently swept the confirm
  seed 73509 pair into the pilot once confirm files existed (18 files, pilot median
  corrupted 180.5 → 145). Caught by the proof test failing on file count after confirm
  landed. Fixed: pilot filter is exactly 73501–73508, and the analyzer now takes
  BAND=pilot|confirm|combined with band-exact filters (confirm = 73509 + 73510–73516;
  the 73509 seed belongs to the 7350x family, not 7351x — a second off-by-band trap
  caught the same way). All three bands were re-run after the fix and reproduce every
  number transcribed in this file exactly.
- Sense runs are excluded from the judged corpora (separate `sense/` subdir; the
  analyzer reads top-level files only) and their numbers are never judged — words only.

## File inventory (this arm's commit set)

- scripts/policies/leanlinkcap5.js (NEW — the arm's only policy file, env-gated, default OFF)
- scripts/sim-leanlinkcap5-sweep.js (NEW — renamed at landing from sim-leanlink-sweep.js to avoid collision with the sim-leanlink arm's sweep of the same name; content unchanged — sweep instrument, adapted from sim-linkdrive-sweep.js;
  + broken-link fields + EPERM stdout fallback + 24 writer attempts)
- scripts/sim-leanlink-analyze.js (NEW — paired analysis, adapted from sim-linkdrive-analyze.js)
- scripts/test-sim-leanlink-cap5.js (NEW — proof test, TEST-OK)
- evidence/2026-10-24/sim-leanlink-cap5.md (this file)
- evidence/2026-10-24/perseed-leanlinkcap5/*.json (pilot 16 + confirm 16 + probe 1 + sense 2)
- No src/js changes. No changes to competent.js, linkform.js, leadcourt.js.
