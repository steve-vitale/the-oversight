# journey-scale r223 — SCALE leg (days 80–140): national on-ramp on current master + profilegate-bypass continuation read

**Run id:** `playtest-loop-a-scale-r223-20261116T0755Z` (lock run_id
`2026-11-16T07:55:00Z`). **Base:** local master `4b1800402`
(worktree registered at `0740ce985`, rebased onto `4b1800402` after
Lane B's crisis-r223 merge landed mid-registration; the only `src/js`
change in that merge is `conversation.js` +10, a drift-note
stage-direction filter — dialogue-only).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout.**
**Prereg:** `evidence/2026-11-16/journey-scale-r223-prereg.md`
(committed `e2cd1d7b3`); instruments committed `c465df97f`
(analyzer proof 70/70 green before the panel).
**Panel:** single arm, 4 fresh seeds 135613–135616, DAYCAP=140.
4 sims, all exit 0. Corpora in the goal hidden dir
`evidence/2026-11-16/` (`journey-scale-r223-*` prefix).

## The finding — the Herald cannot be fought, and the village never musters

Seed 135614 carries the run's blank, and it is the sharpest statement
yet of why the wall does not move. The Herald — the wave-4 titan —
lived at the treeline from d61 to d137 (76 days). The scholar met it
**151 times**. It was fought **0 times**: zero combat lines in the
capture, zero blows landed or taken, zero kills. The same three
lingerers recur (ling7 fought 51×, ling9 24×, ling4 13×) plus 67
full-HP wild meetings; ling9 sat at **8/280 HP and was met 9 times in
one day without dying**.

**Mechanism** (pinned from the corpus + a code read of
`src/js/titans.js` + `src/js/havenGrowth.js`): the Herald is a titan
with a hard muster gate (`minAllies` 10). `titanWrapCombat` refuses
`startCombat` outright when the muster is not ready — the line the
capture carries 104 times: "⛔ THE HERALD does not notice you the way
prey notices a hunter. … You cannot face this alone — sound the call,
muster 10 allied blades (you have 0). This is not courage. This is
arithmetic." The muster is built by beats-panel verbs the competent
policy never drives: "sound the call" (allied villages commit blades)
and `titanCommitOwn` (Haven commits up to 3 of its own, two-tap,
named, said aloud). On this seed the muster was never sounded and
Haven never committed — "you have 0" for the whole run. The village
had 7 links that could in principle supply blades; nothing in the
policy's repertoire asks them.

The Herald is not idle while the village deliberates. It gorges
800–1,200 kcal a night from the stores (2 nights at 800, 2 at 1,200
in the capture), strikes allied villages at night (Ashford,
Stonebridge ×3, Emberhold — trust −5 each, "they notice who wasn't
there"), and the villagers say so aloud: "It eats while we
deliberate. The Herald feeds on our stores and we're supposed to
just... wait?" Villagers who do meet it in the field get mauled
(Nikos −56 over 6 rounds, −44 over 11, −16 over 1; Adaeze −66 over
7) and flee — which is how its HP fell 700→134 over the run without
any scholar combat. The game also voices the answer twice: "Endure
it (they drift off within ~6 nights — the gorge is the price), or
send a sortie: fighters, rations, real risk." But the sortie path
(`answerLingerer('sortie')`, 2+ fighters via fieldFight — it does
NOT check the titan muster gate) is closed by the r219 driver gates:
the Herald at 134–700 HP never passes the min-HP ≤80 gate, so the
driver never sorties. The gate call is owed, not made here.

**The chain this pins:** no muster → no Herald kill → wave-4 kills
stay scholar-only (7/9 band-wide; villagers 2) → living wave-4
killers peak at **1 on every seed** → the tribute never readies (0
attempts this band, vs r219's ready-but-unpayable) AND wave 5 never
unlocks (maxWave 4 on all seeds; live wave-5 entities 0 days on two
seeds, 1 day on one, 2 days on one) → national 0/4 with LEAD 1–2/3
seasoned as the named blocker. The seasoned-link blocker and the
veteran blocker are the same wall seen from two sides.

**Instrument note (same finding, other side):** the ladder
"fights" metric counts refused `startCombat` calls as fights. On
135614 the census reads fights=178, wave-4=165 — of which 151 are
refused Herald meetings and only ~14 are real wave-4 fights (the
reunion/audit/eulogy/algorithm fights, which do carry combat lines).
The telemetry fight metrics were already dropped from this run's
check (prereg decision), and this is exactly the noise they carry.
The analyzer's census prints the raw count; read it as meetings +
fights on Herald-heavy seeds, not as 165 real fights. No instrument
change made here — the classification question (refused vs fought)
goes in metric review.

**Not built (documented):** a driver-side muster step (sound the
call / commit Haven's own when a titan is live) is the next run's
question, not this run's build — it commits villagers to a titan
fight where they can die, so it needs its own prereg with a cost bar,
like launchdef's. The sortie-gate call (min/sum HP caps) is still
owed. The muster verbs are reachable in real play through the beats
panel; whether a real player finds and uses them is untested by this
run — the sim policy is the gap, not necessarily the game.

## Results — the village in plain words

**National 0/4.** No village reached national. The wall didn't move —
but the blocker is named more precisely than r219's this time: it is
not "veterans-short at delivery" but "never two living veterans at
once."

- **135613 (Haven):** alive to d140, 8/8 people, regional, lesser
  seat d47. Seven links (3 LEAD subs — 2 seasoned; the 3rd is 12 days
  old at trust 33, aging in but not seasoned by d140). Tribute never
  ready — peak 1 living veteran (the scholar alone). Blocker: LEAD
  2/3 seasoned — needs 1 more. 4 deaths (2 the wild, 1 wound, 1 Big
  Ugly), 19 fights (2 wave-4, 1 kill, scholar).
- **135614:** wiped out d137, 4 people left, pantry 0. Five links
  (LEAD subs: one seasoned at trust 87; one 92 days old at trust 27
  — old but never tended to 40; one 12 days old). Tribute never ready
  — peak 1 living veteran. Blocker: **collapse** d137 (final: LEAD
  1/3, COV 0/3, TRADE 1/3). 14 deaths (10 the wild — the scholar
  died 10 times out in the world — plus ambush, monster, wound,
  contest), 178 ladder-counted fights (165 wave-4, of which 151 are
  refused Herald meetings; 3 real wave-4 kills). The Herald ate the
  stores for 76 days.
- **135615:** alive to d141, 4/4 people, regional, lesser seat d50.
  Five links (LEAD 2/2 seasoned — there is no 3rd subordinate at
  all). Tribute never ready — peak 1 living veteran. Blocker: LEAD
  2/3 seasoned — needs a 3rd subordinate entirely. 11 deaths (7 the
  wild, 3 monster, 1 stranger), 34 fights (19 wave-4, 1 kill,
  scholar). The fusion reactor is online (`fusion=true`) — the only
  seed to get there.
- **135616:** alive to d141, 9/9 people, regional, lesser seat d39.
  Six links (LEAD 5 subs — only 1 seasoned; one 101 days old at
  trust 32, three 14–17 days old). Tribute never ready — peak 1
  living veteran (the village's one villager wave-4 killer lived).
  Blocker: LEAD 1/3 seasoned — needs 2 more. 5 deaths (2 the wild,
  2 stranger, 1 thirst), 29 fights (8 wave-4, 4 kills — 3 scholar +
  1 villager, the band's only living villager killer).

**Survival:** 3/4 (135613, 135615, 135616 alive; 135614 over).
**Lived-days 559** vs the 3-band rolling mean 476 (+17.4%, guardrail
357–595: HOLD). **Lesser seat priced 4/4** (HOLD). **Tribute
delivered 0/4 — never ready on any seed** (0 attempts; a step back
from r219's ready-but-unpayable: the second living veteran never
coexists with the first).

## Q1 — national on-ramp: NO-GO on the wall, blocker named per seed

National 0/4, informative by the prereg's rule: 135613 LEAD 2/3
seasoned (needs 1 more — the 3rd sub is 12 days old); 135614
collapse d137; 135615 LEAD 2/3 (no 3rd sub exists); 135616 LEAD 1/3
seasoned (needs 2 more — one old sub at trust 32, three young).
No seed overturns the picture (no national, no full seat, no wave-5
kill — no wave-5 fight at all).

## Q1 secondary — profilegate bypass: NO downstream movement

Wave-4 kills 14 → 9 vs r219 arm A (11 scholar + 3 villager → 7
scholar + 2 villager); living villager killers 1 → 1; tribute
readiness went the other way (r219: ready 2/4, unpayable; r223:
never ready 0/4). Real wave-4 fights ≈ 43 vs r219's 38 (the
headline 194 counts 151 refused Herald meetings — see the instrument
note). The bypass shows no downstream engagement signal, as
launchdef predicted ("on master without a seed source the fix is
nearly inert"). Downstream-only read, as preregistered — the driver
carries no launch recorder, so the launch-level question (did any
party_launch plan form and use the bypass?) stays open; the null here
is at the outcome level, not a proof of zero launches.

## Q2 / Q3 / Q4 guards

- **Spoken-raise: GO.** 9 raise talks (7 properly-answered, 2
  correct holds), **0 not-offered-spoken, 0 defects**. The r219 goon
  fix holds on a fresh band.
- **Vetbar: GO.** 0 disagreements on all four seeds (140/140/140/140
  rows).
- **Trap-line: HOLD.** 1 driver sitting with a mime, answered,
  0 defects; 12 mimes in the say-capture overall.
- **Betrayal sibling: HOLD.** 0 turn-0 betrayal:accept offers.
- **Nod-loop: HOLD.** Worst streak 3x (Daniyar's nods, d90 and d120
  on 135615; Sanne's nods, d90 and d120 on 135616); 0 sittings at ≥4.
- **Lived-days: HOLD** (559 vs 476, +17.4%). **Lesser: HOLD** (4/4).
- **Q3 daily-play mime (read-only):** 11 daily-play mimes in the
  capture, **0 daily accepts proven** (capture lower bound 0, 0
  off-day events in the betray watch). The carried gap stands:
  the shared chooser never takes an invite in daily play, verbal or
  mimed. Lane decision owed — teach the chooser to take
  `betrayal:accept` + `nv:accept` when offered, or keep proving
  fixes only where the driver looks. No build claimed.

## Q5 census (per seed)

| seed | days | end | pop | rank | lesser | fights (w1/w2/w3/w4) | deaths | books |
|---|---|---|---|---|---|---|---|---|
| 135613 | 140 | alive | 8/8 | regional | d47 | 19 (4/6/7/2) | 4: wild 2, wound 1, Big Ugly 1 | close, 0 unattrib |
| 135614 | 137 | over | 4/4 | regional | d34 | 178 (4/5/4/165*) | 14: wild 10, ambush 1, monster 1, wound 1, contest 1 | close, 0 unattrib |
| 135615 | 141 | alive | 4/4 | regional | d50 | 34 (6/2/7/19) | 11: wild 7, monster 3, stranger 1 | close, 0 unattrib |
| 135616 | 141 | alive | 9/9 | regional | d39 | 29 (4/7/10/8) | 5: wild 2, stranger 2, thirst 1 | close, 0 unattrib |

\* 135614's w4=165 is 151 refused Herald meetings + ~14 real fights —
see the instrument note. All seeds maxWave 4; wave-5 fights 0.

What they knew: every village linked early and kept its links
(7/5/5/6 ever, all still active at the end or at collapse). Nobody
reached national; nobody held 2 living veterans at once. What was
missing: seasoned links (the national bar), a second living veteran
(the tribute bar and the wave-5 unlock), and — on 135614 — any answer
at all to a Herald that lived at the treeline for 76 days.

**Funeral-mend watch:** no funeral/mourning shape change vs r219's
band observed in the read material.

## Spotter — one village strong, three thin

- **d90 (binding read):** 135613 — Sophia 24 XP + Marcus 3 XP,
  **4 skilled spotters** (Sophia, Wei, Dalila, Nair — the first band
  where the skill spread past one villager). 135614 — Ella 6 XP, 1
  skilled. 135615 — Diana 6 XP, 1 skilled. 135616 — Zoe 9 XP,
  2 skilled (Gianna, Zoe).
- **End:** each village holds 1 villager with spotter XP (Esmeralda
  6, Yara 1, Linda 2, Sanne 7); skilled counts 4/1/0/2.
- The skill CAN spread (135613 proves it) but XP still concentrates
  in one or two villagers everywhere else. The r219 "thin" reading
  stands with one counterexample.

## W5-INSTANCE — UNANSWERED on all four seeds

- **135613 / 135614:** 0 wave-5 fights, **0 live wave-5 entities on
  any day** — wave 5 never arrived in these worlds at all.
- **135615:** 0 fights, live entities max 1/day on 1/140 days.
- **135616:** 0 fights, live entities max 1/day on 2/140 days.
- The door never opened this band: with living veterans peaking at
  1, the wave-5 unlock (2 banked living veterans, per the r222
  read) never fires. The r219 MIXED answer stands unchallenged —
  this band adds no new shape, only the reason the door stays shut.

## People check (12 transcripts + 9 raise talks, read in full)

No stutter recurrence ("About X — <the same X as a question>") in
any sitting. No r137 want-thread resume defect, no r218
commit-refusal noBeat, no r216 funeral-mend line seen in these
sittings. The r223 drift-note filter: no resume opener quotes a
drift note as memory in this material (no drift-note resume shape
appears at all).

- **135613 d90 — Esmeralda (sailor, anxious, trust 90).** Share-news
  want: "something moved out there, big" by the treeline. Coherent
  hook and elaboration; the sitting is short (picker leaves after one
  exchange) but the want advances 1→2. Thin, not senseless.
- **135613 d120 — Esmeralda.** Ask-favor (water haul, planted d112).
  Player commits; she answers honestly that she's out on the road
  and can't promise a dawn meet, deferring to when she's back.
  Perception-grounded honesty; want 1→3.
- **135614 d90 — Riley (postal worker, withdrawn, trust 92).** A real
  conversation about regrets: "I regret the ordinary days I rushed
  through. All those Columbus, Ohio mornings I spent annoyed at small
  things. I'd pay anything for one annoyed morning now." The regret
  template echoes r219's Tashi (rushed Kathmandu mornings) with the
  city swapped — a line-pool reuse, not a defect. Want 1→2.
- **135614 d120 — Emma (veterinarian, warm, trust 31).** Opens with
  a real worry — "The stores. Have you looked at the stores? We're
  running thin." — true on this seed (pantry 0 at collapse). The
  player has no answer; "Okay. You don't have to have an answer."
  (the carried line-pool reuse, seen again) — then it thins out.
  Coherent, short, grounded in the village's actual state.
- **135615 d90 — Harper (HVAC tech, warm, trust 100).** A
  goal-thread monologue about food as the group's first promise:
  "I'd rather be the cook than the hero. Heroes get songs. Cooks get
  everyone through winter." / "Food's the first promise a group makes
  to itself: we won't let each other starve." Genuinely good writing
  — but the sitting is 8 turns of dlg:more/dlg:react ping-pong and the
  planted ask_favor never surfaces (stage stays 2). The r222 Onni
  wart family (picker loops the generic choices; the want stays
  pocketed). Observation, not a defect — the picker is the driver.
- **135615 d90-nv / d120-nv — Daniyar (paramedic, gentle, trust
  95/94).** Russian-only nonverbal sittings. Three nods each, every
  nod answered with a distinct line, the sitting thins naturally and
  closes with a wave. The 3x nod streaks are the driver picking nod,
  not the NPC looping. These read like people.
- **135615 d120 — Linda (bike messenger, gentle, trust 91).**
  Ask-favor re-ask ("About the creek water run — I still haven't
  found anyone. Any chance?") — the r222 deepening variant, a
  legitimate re-ask of a genuinely open favor. Player commits; she's
  away on the road, honest deferral. Then the trap-line invite is
  offered and taken (betrayal:accept, ordinary): "You walk to the
  trap line with Linda. Nothing much there — but they talk the whole
  way." Honest outcome, resolves.
- **135616 d90 — Gianna (community gardener, stoic, trust 90).**
  Sick, asking for help: "I'm achy and wrung out, barely keeping
  food down. Will you help me?" Player commits; she thanks. Short,
  real. Want 1→3.
- **135616 d90-nv — Sanne (vintner, dry, trust 92).** German-only.
  The mime invite — answered (nv:accept); she shows her thinking
  place: "Don't tell the others. Everyone needs one place." (the
  carried thinking-spot line, seen again). Then three nods, distinct
  lines, natural close. The trap-line guard's one answered sitting.
- **135616 d120 — Gianna.** The creek-water re-ask ("I hate to ask
  twice, but it's still open"). Player commits ("Dawn, then. Bring
  something to carry"). Then a "come get air" invite, taken — and
  Gianna GIVES the player a tool: "Here. I made an extra." A gift
  arising from the conversation — real consequence. Want 2→3.
- **135616 d120-nv — Sanne.** Three nods, distinct lines, palm-press
  close. Good.
- **Raise talks (9).** All properly voiced or correctly held. Zoe
  (135614) holds on d124 — a real getting-to-know-you (Columbus /
  Brooklyn, "I still dream in its weather") — then voices Thornfield
  properly on d125 and it's accepted, after a fear conversation with
  a real voice ("Being watched means being kept. I'd rather be
  boring to the sky."). Sanne (135616) correctly never voices a link
  proposal in words — she speaks only German, and the engine doesn't
  fake it. The "All right — let's ask them." echo sounds in all 7
  accepts (carried observation, not a defect).

## Verdicts

- **REACHABLE:** yes for the leg's content — lesser 4/4, links raised
  and formed on all seeds, the Herald present and (in the field)
  fought. National: **not reached** (0/4). The wall is seasoned
  links and living veterans, not survival or tribute readiness — and
  this run names the veteran half precisely: never two living
  wave-4 killers at once.
- **FUN:** the conversations are the leg's strength — Harper's cook
  monologue, Zoe's fear talk, Gianna's gifted tool, Sanne's wordless
  thinking place read as people with things they want. The dullest
  edge is the wave-4 door again, now with a name: the Herald paces
  the treeline for 76 days while the village walks past it 151
  times, and the game keeps saying the answer out loud ("sound the
  call", "send a sortie") while nothing in the village's repertoire
  does either.
- **WINNABLE:** not yet. No full seat, no national, no wave-5 fight.
  Three villages survived everything else and stalled one seasoned
  link short with a tribute that never readied for lack of a second
  living veteran. The binding links this band are seasoned-link
  production and veteran production — the same wall r219 named, one
  band later, with the veteran half now measured to the person.

## Telemetry check: QUIET (maxGameDay only, per the adopted decision)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'.../journey-scale-r223-trust-*.json' --metrics maxGameDay` →
**quiet** (4 files, 1 metric, no large deviations; 559 vs 468,
+19.4%). The fight metrics were dropped from this run's check by the
prereg decision (r219's owed proposal, decided before the panel) —
and this band justifies it: the raw fightsTotal would read 260 vs
the 241 baseline (QUIET-looking) while hiding that 151 of the
wave-4 count are refused meetings, not fights. Baseline NOT rolled.

## Gate: 334 passed, 6 failed in 813s — 0 attributable

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
(log: `evidence/2026-11-16/journey-scale-r223-gate.log`). The 6 are
the identical standing set as r221/r222 (stash-verified in r221):
measurement-proof staleness pair
(`test-measurement-proof-update.js`, `test-measurement-workflow.js`
"retained neutrality proof"), phone-frame staleness trio
(`test-phone-frame-proof.js`, stale receipt: index.html), 2× 120s
deed-attainment load timeouts (living-garden, one-person-army),
ladder-bundle ambient-raid control (fires 0 without delivery).
Attribution: this branch modifies ZERO tracked files (`git diff
HEAD` empty on src/; 5 untracked evidence files only, no src/js) —
no existing test's inputs changed, so all 6 are pre-existing on the
base by construction. The r223 analyzer proof test (70/70) ran green
standalone before the panel; per-run analyzer proofs are not in the
gate's green list, same as r218/r222.

## Metric review (§14)

- **Q1:** the interesting-finding rule as written — national 0/4
  with a named per-seed blocker (informative, NO-GO on the wall).
  Bypass secondary as written (downstream-only; null result).
  No overturn (no national, no full seat, no wave-5 kill, no wave-5
  fight).
- **Q2:** guards as written — spoken-raise GO, vetbar GO, trap-line
  HOLD, betrayal HOLD, nod-loop HOLD, lived-days HOLD (559 vs the
  rolled-forward 3-band mean 476), lesser HOLD (4/4).
- **Q3/Q4/Q5:** as written. Spotter d90 is the binding read (third
  live band) — thin except 135613's 4 skilled. W5-INSTANCE
  UNANSWERED on all four seeds (the door never opened).
- **Telemetry:** maxGameDay only (decision adopted in the prereg);
  QUIET; baseline NOT rolled (241/178/468 stands).
- **Metric-change note for the next run:** the ladder "fights"
  count conflates refused `startCombat` calls with real fights on
  titan-heavy seeds (151 of 165 wave-4 on 135614 never reached a
  round). A future instrument revision should split the count
  (refused vs fought) — the fight metrics are doubly unreliable at
  this panel size: band noise AND meeting-counting. The lived-days
  guard already carries the band-shape signal.
- **Blank owed to the next scale run:** a driver-side muster step
  (sound the call / commit Haven's own when a titan is live) with
  its own prereg and cost bar — the Herald finding is the
  justification. The sortie-gate call (min/sum HP caps) is still
  owed alongside it.

## Fix landed this run

- **None.** No game change: the run's finding (Herald muster) is a
  policy-side blank with a cost bar owed, not a dialogue fix; the
  combat-play gate and gating freeze both stand. The instruments
  (driver + analyzer + proof, 70/70) are the landed work.

## Closeout

- Panel complete: 4 sims, all exit 0; analyzer run once, exit 0.
- Rotation: 3 → 0 (written at closeout).
- Merge: `git merge --ff-only journey-scale` in the main tree;
  report "merged locally, pending ship" — no version tag, no push,
  no live verification (the ship loop owns that).
- Worktree released (`worktree-release.sh journey-scale merged`),
  worktree + branch removed, final reap, main tree verified clean.
- Lock deleted at closeout. Heartbeat loop killed at closeout.
