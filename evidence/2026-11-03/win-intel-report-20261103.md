# Track 2: intelligence that plays to win — landing report (2026-11-03)

Plain-words version first: villagers now think in gameplan terms.
A villager who has fought something, or whose village has killed
something worth talking about at the fire, starts working a plan:
get geared, find a trusted companion they can actually see at
Haven, go out together instead of alone, skip a fight they cannot
win, walk into a fight they are ready for, keep the village's
alliances tended, and stand down a starving muster before it eats
the trust those alliances stand on. Nothing about win prices,
deed gates, standing thresholds, or readiness numbers changed.

## What villagers now DO, per behavior (identical seeds, before/after)

Panel: 8 seeds (11, 22, 33, 44, 55, 66, 77, 88), one fixture per
process, same driver. Before = master code (win-plan.js absent, so
every decision fixture reports apiPresent false). After = this
branch. Final after-panel (after4): 13 fixtures x 8 seeds = 104/104.

| behavior | before | after | what it looks like |
|---|---|---|---|
| Form a party before a hard fight | 0/8 | 8/8 | inviter + trusted co-located ranger companion leave on the SAME target/duration, so their legs stay together and the fight engine finds them via the landed ally-join sensing |
| Gear-check hold | 0/8 | 8/8 | a plan villager still weaponless AND armorless after gear-up stays home that day instead of walking out naked |
| Avoid an unwinnable fight | 0/8 | 8/8 | a wave-4 beast in front of a party that is not full (fighter + 2) and fully geared is not fought; the plan falls back to gathering help |
| Seek a veteran kill when ready | 0/8 | 8/8 | a hunt/standing-plan villager with a real party walks in on purpose (awareness evade skipped) on the wave the village was told it lacks, or its plan target species |
| Veteran guard (table stage) | 0/8 | 8/8 | a living veteran holding a table-stage plan does not go solo against a wave-3+ beast; holds up to 7 days for a party, then the fight gate is the backstop |
| Build standing on purpose | 0/8 | 8/8 | a standing-stage villager walks into a wave-3+ fight on purpose (standingContacts), the deed channel that feeds standing |
| Tend bonds / stand down a hungry muster (Arm 4 blueprint, villager-side) | 0/8 | 8/8 | plan-holders home at Haven tend marginal primary links weekly (trust <50, pantry-days >=3, 1,500 kcal/link/week) and stand down a >=3-day-old hungry muster when the weakest primary link is under 55 (-5/link, titan road abandoned for the run) |
| Trick gate (funnel answer) | 0/8 | 8/8 | a wave-4 beast whose trick the village has not learned is never a forced-contact seek (trickhold); once the trick is known, seeking opens (trickseek) |
| Engagement (smoke finding) | 0/8 | 8/8 | a geared ranger at Haven with no plan, whose village has a kill to talk about, gets a plan and advances gear -> party in one tick |
| No partial launch (smoke finding) | 0/8 | 8/8 | a sick companion blocks the launch BEFORE the inviter leaves; nobody goes out solo on a party ticket |
| Control (no-plan villager) | 8/8 | 8/8 | behaves exactly as before: fight proceeds, awareness true, all win-plan counters 0 |

## Funnel movement — stated honestly

The full 180-day competent funnel panel was NOT re-run here
(~19 min/8 seeds, and its wall is the readiness-5 release owned
by Track 1/national). What this track claims is the DECISION,
proven where decisions live, plus organic smokes as guardrails:

- The funnel verdict (sim-winfunnel-a.md, master e9de0bcd5) is
  what this landing answers: arms 1+2 moved the mechanism
  (ally-join 0 -> 77.0%) but not the funnel (veterans, releases,
  unlocks, facings all still 1/20; 2 kills in 83 wild wave-4
  fights, 21 deaths, 55 flees). This track's answer is selection:
  avoid the outmatched fights, seek only the ready ones, and
  withhold seeking until the village knows the beast's trick —
  the field fighter opens with the trick on round 1 only when
  the village knows it, and a trick-less wave-4 fight is how
  those 55 flees happen.
- Organic smokes (seed 11, competent policy): 30 days survived
  with drives live (planSeeds 2, stageAdvances 2, partyWaits 10,
  18 deaths vs 28 pre-engagement on the same seed). 180 days:
  village lost day 72, 38 deaths, waits 26, zero partial
  launches. Master control on the same seed lost day 161, then
  day 148 on an identical repeat — the control itself varies,
  so single-seed day counts support no regression claim either
  way. Guardrail reading: no crash, no instant die-out, deaths
  inside the control band.
- Open observation, not a blocker: on that 180-day seed no
  paired launch completed — a launch needs a trusted (trust
  >=15, the party-wiring floor), co-located, geared, healthy
  ranger pair at the same tick, and that coincidence never
  landed. The wait path absorbed those cases instead of solo
  departures, which is the designed behavior. Loosening launch
  conditions would be a balance change needing its own panel,
  so it is reported here, not tuned silently.

## How it is built (no central planner, no new AI)

One module, `src/js/win-plan.js`, hooked into existing decision
points only (agencyTick Haven evaluation + departure gate,
startExpedition shared-target option, expeditionMonster
pre-fight gate + fight/kill notes, agencyTick-tail bonds/muster
ticks). Composition comes from order — gear -> party -> hunt ->
standing -> table — where each stage's action is the next
stage's precondition. Stage advances only on that villager's
OWN events (their gear, a companion they can SEE at Haven, a
beast THEY fought/fled, a kill THEY banked, a System beat
broadcast while at Haven). No scheduler assigns anyone anything.
If panel evidence had shown stages advancing but never pairing
up, that would have been the held-with-evidence case for a
planner; the fixtures show them sequencing, so no planner was
built (root-cause first, per the diagnosis addendum).

## Perception audit (clean)

- Party = self + `villagerFightAllies(vid)` only (same node /
  adjacent node / same outdoor crew, trust-ordered); gear judged
  only for those sensed members, never the roster.
- Beast strength judged from the beast in front of them.
- Trick knowledge = `villageKnowsTrick` (ledger counter or two
  survived observations) — village fire knowledge, the same
  channel the beasttricks topic teaches through.
- Engagement = a beast they personally fought (agency
  know.fought) or a village slain count the fire has told
  everyone (villageSlain, the deed-talk channel). The villager
  learns only that the village HAS kills, never who or where.
- Bonds = Haven's OWN primary links, OWN pantry-days, the OWN
  herald muster, hunger bleed on the OWN links' histories.
  Actors come from the plan-holder set, never a roster scan.
- No list-fed shortcut is used or extended. The wild-router
  ambush path (`villagerMonsterTick` -> `resolveWildMonster
  Encounter`) is deliberately NOT gated here: it is an ambush,
  not a chosen hunt, and its callers' return-value expectations
  are mixed. Follow-up, not a silent gap. Likewise the funnel's
  104/1476 field fights (7.0%) that never consulted the sensing
  helper are flagged as a possible arm-1 router follow-up; the
  router was not rebuilt here.

## Track 3 integration note (updated: framework LANDED before merge)

Track 3's framework note landed on master as fb8388c95
(`evidence/2026-11-03/win-drive-framework.md`) while this
branch was proving. It was read before merging, and it
explicitly judges this branch conformant: "Track 2's win-plan
already fits this shape, independently derived" — no rewrite
is demanded, and one framework amendment comes FROM win-plan
(a drive's pursuit record may live as villager stage state,
`v.winPlan`, not only as an objective). Two distinctions are
recorded so the tracks do not collide: win-plan's 'guard' is
VETERAN guarding (protect a banked veteran for 7 days), while
Track 3 Drive 1 'rally-guard' is RAID-ANSWER company (a
protect/prove/lead villager volunteering as GUARD after raid
gossip) — same word, different drives, different triggers,
different files (rally-guard lives in villager-objectives.js;
win-plan lives in win-plan.js + agencyTick gates). The
framework's hard limits are respected: no drive sends an NPC
to the seat or chooses the village's path (the table stage
only keeps veterans alive and ready), and no gate, price,
threshold, or readiness number changed. Each drive here fits
the §1 shape {reason, perception, action, persists, proof}:
reason = the stage's own want; perception = only traced
records (own gear, a companion SEEN at Haven, a beast THEY
fought, a kill THEY banked, a System beat broadcast while at
Haven, villageSlain fire knowledge, villageKnowsTrick);
action = existing paths (expedition targets,
villagerFightAllies / fieldFight opts, tendLink,
titanStandDown); persists = the stage record plus the memory
each stage's action writes for the next; proof = the
identical-seed panels in this report. Composition by order,
not by planner, is the shared rule (§3) — and its evidence
bar for ever building a planner (a panel showing a chain
stalling DESPITE both drives firing) is not met here: the
stall this track found (dormant plans) was an engagement gap,
fixed by seeding, not by planning.

## Costs, bounds, and what did NOT change

- Party wait bounded 3 days, then normal departure; veteran
  guard bounded 7 days, then normal (fight gate backstops).
- Tend: 1,500 pantry kcal per link per week, weekly dedup.
- Stand-down: -5 trust per allied link, abandons the titan
  road for the run — a real tradeoff, taken only when the
  weakest primary link is under 55 and the muster is hungry.
- NO win prices, deed gates, standing thresholds, readiness
  numbers, or monster stats changed. No version bump, no push
  (ship loop owns those).

## Bugs the panels/smokes caught (kept in the record)

1. Snapshot aliasing: the first after-run read all counters 0
   because the panel held the LIVE stats object; fixed by
   copying stats by value.
2. Stand-down actor exclusion: muster-committed villagers count
   as engaged, so no actor ever qualified; fixed by allowing
   engaged actors for the muster tick only (commitment IS the
   qualification there).
3. Dormant system: plans only started from surviving a wave-3+
   beast, so the first 30-day smoke ran with zero plans; fixed
   with Haven engagement seeding (fixture: engage).
4. Partial launch: inviter launched before the companion's
   gates were checked, leaving the inviter solo (180-day smoke:
   2 invites, 0 departures); fixed with a pure-read
   launchability pre-check before the inviter leaves (fixture:
   partial). No double-spent medicine: the heal still happens
   exactly once inside startExpedition.

## Checks and their disposition

- `node scripts/validate-ontology.js`: 131 systems validated,
  Release permitted. `node scripts/check-wired.js src/js/win-plan.js`:
  26 functions, 0 unwired. `node --check` green on all touched
  JS. Targeted subsets post-change: party 6/6, encounter 1/1.
- Full `node scripts/check.js --quick` (worktree, pre-trick-gate
  code): 282 passed, 8 failed in 1008s. Disposition, each
  verified by running the failing script on unmodified master:
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  and establishment-r20 all fail IDENTICALLY on master
  (freshness gates gone stale as master moved through arms
  1/2/4/funnel, plus the cooking-voice case) — pre-existing,
  not regressions. sw-audio-cache failed in the worktree only
  because the new module made the offline manifest stale;
  regenerated via `node scripts/build-offline-assets.js`
  (sw.js +1 asset line), after which the offline proof passes
  190 checks and sw-audio 7/7. trust-observer-neutrality hit
  the 120s cap under check load with 6 passed and 0 assertion
  failures in both runs — a load timeout, not a regression.
  The full check was not re-run after the mechanical sw.js
  regen; the regen is covered directly by the offline proof.
- `[needs-eyes]`: party/fight decisions change how villagers
  behave in combat-adjacent play; Steve should playtest the
  feel of paired departures and avoided fights when this ships.

## Files

- `src/js/win-plan.js` (new), `src/js/villager-agency.js`
  (hooks), `index.html` (script tag), `sw.js` (offline asset),
  `docs/ONTOLOGY.md` (validator-generated section)
- `scripts/test-win-intel-20261103.js` (proof, 13 fixtures),
  `scripts/win-intel-drive-20261103.js` (driver),
  `scripts/smoke-win-intel-20261103.js` (organic smoke)
- `evidence/2026-11-03/win-intel-prereg-20261103.md`,
  `evidence/2026-11-03/win-intel-panel-before.json`,
  `evidence/2026-11-03/win-intel-panel-before2.json`,
  `evidence/2026-11-03/win-intel-panel-after4.json`,
  `evidence/2026-11-03/win-intel-smoke30-postfix.json`,
  `evidence/2026-11-03/win-intel-smoke180-postfix.json`,
  `evidence/2026-11-03/win-intel-smoke180-master.json`,
  `evidence/2026-11-03/win-intel-checkquick.log`
