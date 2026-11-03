# journey-landing r74 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261103T164342Z (scheduled 10:45 CST 2026-11-03). Base
master@c5118da82 at branch creation (includes r73's deliver-counter fix,
merged locally, pending ship); worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-03/journey-landing-r74-prereg.md (committed with
this run). Panel outputs: goal hidden_files evidence/2026-11-03/landing-r74
(census/system/transcript/pilot+main logs); proof replay:
landing-r74-proof/replay-902.log + r75 census.

## Panel verdicts (as run)

- **901 GO with explained liturgy note. 902 GO. 903 GO. 904 GO.**
- System contact: 8 / 8 / 9 / 8 (gate ≤ 10) ✓ all.
- Theft: 0 / 0 / 0 / 0 ✓. Headcount codas: 0 all ✓.
- Self-sufficiency, last series day: 0.857 / 0.851 / 0.997 / 0.844
  (gate ≥ 0.70) ✓ all. Starvation deaths: 0 all ✓.
- Plenty-voice: 26 / 26 / 20 / 26 (gate ≥ 1) ✓ all.
- Death liturgy: 902 exact (0 villager deaths, 0 beats); 903 exact
  (1 villager death, 1 beat); 904 exact (0/0). 901 is the explained
  exception: 2 villager deaths vs 0 beats. Marcus (day 6) died while the
  player was away from Haven — the grief line is presence-gated BY DESIGN
  (game.js:18315: "grief is real, the narration waits"; the state effect
  v.grief=3 + fear/social bumps still fires). Priya, the player, died on
  the final day 14, leaving no in-horizon night for a beat. Explained,
  not a defect, not re-scored.
- **COUNTER-STAGE VERIFY: NO-OPPORTUNITY.** Zero panel outings reached
  deliver (0 thanked, 0 deliveredKcal across all four seeds), so the new
  census fields (deliveredPlayerKcal / deliveredPlayerCounterKcal /
  deliveredPartnerKcal) are all null. The r73 unit proof (18/18) stands
  as the evidence; the panel neither confirms nor refutes the fix
  end-to-end. Why zero deliveries is itself the run's blank — see below.

## The blank: the stuck live outing (documented + tooled, no game change)

**The chain, bracketed by the r73 FAVOR_TRACE tracer (902, Enzo):**
1. Day 11: Maya promises ("forage with Maya tomorrow", meet 12, due 13).
2. Day-12 dawn: the ENGINE auto-departs the outing (favor-outing.js dawn
   machinery — villagers act on their own; this is the designed path, not
   the probe's). Maya's run goes live.
3. The run is never worked: plain `forage` presses do NOT feed an outing
   — only the `forage_together` favor action splits hauls into the run
   (favor-forage.js). Neither the competent policy nor the driver's
   runConversation ever presses favor actions, and the dawn probe only
   acts on *waiting* partners (forageFavorWaiting requires NO run), so a
   live run is invisible to the whole driver.
4. Day 13: Maya's promise breaks (deadline passes) while the run stays
   live — nothing auto-ends a broken-promise run; the only exits are
   player-pressed deliver/end (convo cancel).
5. Days 13–14: Nina waits at dawn, walks to the player, and is refused
   with "Finish your current outing before starting another"
   (forageFavorCompanions() still lists Maya). Nina's promise then
   breaks too. One dead outing poisons every later outing, and the
   player is blamed for both (-15 trust rot lines each).
6. Same shape elsewhere: 903 Caleb blocked by a live run on day 11;
   903 Thabo / 904 Onni blocked instead by Haven-door adjacency (the
   probe's walk-toward stalls when the partner sits deep in the hall —
   probe robustness note for r75, not a game defect).

**Verdict on the fix gate:** this is a DRIVER/POLICY coverage gap, not a
proven game defect — a real player talking to Maya would see the
opening ("We missed the promise. We still need to get home and unload
what we have.") and the conversation cancel ("End outing and unload
what we have"). The game offers the exit; the driver never takes it.
So NO src/js change this run (fix gate not met for a game change).

**Tooling landed instead (scripts/, no src/js):**
- scripts/journey-landing-r75-20261103.js — clone of the r74 driver +
  a dawn LIVE-RUN PASS: at each dawn it logs every live run (partner,
  promise state, haul kcal, at-home) and ENDS a live run whose promise
  is already broken when the player is at Haven (the end action's own
  requirement; ending unloads both shares through the shared unload
  path, so food still banks — it only frees the companion slot). Live
  runs with open promises are logged only; driving them to
  together/deliver is a bigger probe for later.
- Proof replay (seed 902, r75 driver, landing-r74-proof/): day 12/13
  Maya logged live, promised, haul 0+0 (correctly untouched); day 14
  Maya broken → END ok=true with the honest line ("0 kcal... The
  promise was missed; unloading does not earn kept-promise credit.");
  Nina's start then UNBLOCKED → start ok → together presses → deliver
  ok=true, 810 kcal (360 player + 450 Nina), kept=true, fulfilled.
  The poisoned panel converts to a kept outing. No FAVOR-VANISH in the
  replay. r75's prereg should adopt this driver (seeds/OUTDIR TBD then).

## Village assessment (plain words)

Four first fortnights, all surviving to the horizon. System contact
lands days 8–9. Pantries stay ahead of hunger (self-sufficiency
0.84–1.00) and nobody starves. Villagers ask for help constantly —
pantry-run promises are the fortnight's social currency — and the
village answers honestly: when the asker is out on the road, the game
refuses the promise outright ("Find me when I'm back, and we'll set it
then") instead of making a promise it can't keep. When promises do
break, the village says so to your face ("Promises rot. -15 trust").
One villager the player actually talked to (903's butchery-handed
stranger, day 3) died of sickness on day 12, and the village grieved
exactly once. The fortnight's sore spot is mechanical, not social:
promised outings keep dying unworked — the engine sends your partner
out with you at dawn, but nothing in the daily routine ever works the
outing, so the promise rots and the dead outing blocks the next one.
A real player who talks to their partner can end it; the sim's player
never did. That is next run's probe to close, not a villager failure.

## People check (all transcripts read in full, 1484 lines)

GO. 0 depth fizzles, 0 fabricated shared history, 0 empty beats
(counters agree on all seeds). What the transcripts actually show:
- Curious villagers want a real answer (hopes, skills, theories) and
  the depth beats pay it off with specific memories (stew bowls,
  control-group villages, trapping résumés) — never filler.
- The away-guard speaks honestly twice (902 Ivy, 902 Nino) and once
  more (903 Zoltan): no promise made to an absent asker, no rot.
- The village names its monsters together: namebeast votes accumulate
  across sittings (Ugly-Eyes, Loud-Eyes, The Bailiff...), and tellbeast
  reports travel ("word travels fast around a fire").
- Invitations resolve both ways: 902 Maya's lure declined ("Another
  time, then. A small thing, pocketed."); 904 Ingrid's lure declined
  at the conversation's open, then the talk still deepened to maxDepth 2.
- 904 Nikolai: a withdrawn ask ("we got it handled. Thanks anyway.")
  with no promise made — an honest non-event, not a dead end.
- Cleared suspicion: 902 Oliver's "Me? Columbus, Ohio" after the
  player named Columbus looked like an echo, but 904 Emma's beat uses
  the same template with her own origin ("Me? Oslo, Norway") — the
  template reports the NPC's own origin. Not a defect.
- Thin record, by construction: 901's sittings stop after day 5
  because the player spent days 6–14 away from Haven (long wild
  stretch, died of sickness day 14). That is a policy-travel
  observation, not a conversation defect — but it is why 901's grief
  beat for Marcus never sounded (see liturgy note).

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact, food, talk, and promises — but the
  joint-outing KEEP path is currently reachable only through the
  probe's careful driving, not through normal play + auto-depart.
  The r75 probe closes the measurement gap; whether normal play can
  keep an auto-departed outing is still the open question for r75.
- Fun: the fortnight reads like people surviving together — asks,
  refusals, naming, grief. The unfun part is being blamed (-15 trust)
  for outings the game itself refused to start; the r75 probe end
  path is the first step to seeing whether that blame is fair.
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.

## Metric review

- The death-liturgy gate as written ("grief beats == villager deaths")
  is presence-blind: it fails any seed where the player is away when
  a villager dies, even though the game gates the LINE by design and
  still applies the grief state. Proposed revision for the NEXT run:
  count only villager deaths that occur while the player is at Haven
  (or on a night the player spends at Haven) within the horizon, and
  exclude final-day player deaths. No thresholds changed this run
  (gating freeze stands).
- **`more` gate RETIRED.** `more` offered 0 times on all four seeds —
  the SEVENTH running run of dead UI in landing (r73's prereg proposed
  retirement if 0 again; r73's metric review did not execute it, so
  this run executes it). The more-thread gate leaves this leg's panel;
  thread depth is still covered by depthFizzles / depthEmptyBeats /
  sitDepth2Plus, which all scored clean. This retirement is reported
  once, here, not as news again.
- No other metric revision. The counter-stage panel fields stay in the
  driver (they cost nothing and will catch a counter case when one
  finally walks the deliver path).

## Telemetry deviation check

Attempted (r73 left this undone): `telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'.../landing-r74/journey-landing-r74-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,starvAutopsies`. Output: one
LOUD line — "villagerDeaths disappeared: baseline 9 -> current 0
(n=4 files)". Verdict: EXPLAINED, instrument mismatch, not a real
deviation — the current census shape carries deaths in the `deaths`
array (villager-kind: 2/0/1/0), not a top-level `villagerDeaths` key,
so the checker reads 0. No other LOUD lines. NO baseline rolled.

## Closeout note

- Rebase addendum (post-commit, pre-merge): master moved twice during
  this run (siblings + batch ship to ba36659f9), so the branch rebased
  cleanly onto ba36659f9 (1 pick, no conflicts — the commit adds only
  new files). Proof re-run on the rebased tree: both drivers
  node --check clean; seed-902 replay exit 0 with the live-run pass
  logging correctly (Maya live/promised/haul 0+0 on days 12–13, Nina
  correctly still blocked day 13). The 14-loop horizon ended on day 13
  on the new base (day skips; win-intel changed NPC behavior), so the
  day-14 end+deliver sequence did not recur in that replay — a DAYS=16
  replay on the rebased tree closed it: day-15 dawn, Maya broken →
  END ok=true (runReturned=true in census). Nina had already broken by
  then (due 14), so no deliver followed on the new base; the
  end-to-end end→start→deliver chain remains proven by the pre-rebase
  replay (810 kcal, kept=true). No panel re-scoring from any replay.
- Quick suite: `node scripts/check.js --quick` run TWICE (second run with
  full output to /tmp/check-quick-r74.log): 284 passed, 6 failed both
  times (742s / 757s). The 6 failures are pre-existing on this base and
  independent of this run's files (none of the 6 failing tests references
  the r74/r75 drivers or the r74 notes; this run changed zero src/js and
  zero existing tests): measurement-proof-update, measurement-workflow
  ("retained neutrality proof covers the current inputs"),
  mobile-combat-cadence ("Continue does not wrap the announced round a
  second time"), occupation-panels ("real CLI workflow completed"),
  phone-frame-proof (stale phone receipt for index.html), and
  establishment-r20-fixes ("next day voices once more: expected 2,
  got 1"). Reported here, not fixed — they belong to other lanes'
  proof-freshness maintenance, not to this leg's findings.
- Heartbeat note: the registry-lock queue stalled this run's beats for
  30+ min (heartbeat_at stuck at 2026-11-03T17:03:34Z while a sibling
  register held the lock; the loop process itself stayed alive and
  queued). No other run interfered (the playtest lock held throughout);
  closeout proceeded promptly once the suite finished. Lesson for the
  next run: if the heartbeat loop's beat blocks on the registry flock,
  the lock queue — not the loop — is the fault, and the run should
  close out promptly rather than wait for the beat.
- Commit: prereg + this note + r74 driver + r75 driver (tooling only,
  zero src/js). No [needs-eyes] — no player-facing change.
- Merged locally, pending ship (no version tag; ship job owns it).
