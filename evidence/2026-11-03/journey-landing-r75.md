# journey-landing r75 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261103T224404Z (scheduled 16:45 CST 2026-11-03). Base
master@349a6ab15 at branch creation; worktree `journey-landing`. Rotation
read 0 → leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-03/journey-landing-r75-prereg.md (committed with
this run). Panel outputs: goal hidden_files evidence/2026-11-03/landing-r75
(census/system/transcript/pilot+main logs). No src/js change this run (fix
gate not met — see below); no new driver landed (the r76 probe spec is
documented, not shipped untested).

## Panel verdicts (as run)

- **905 GO. 906 GO (succession note). 907 GO. 908 GO except liturgy
  (see below).**
- System contact: 8 / 8 / 8 / 8 (gate ≤ 10) ✓ all.
- Theft (caughtRedHanded): 0 all ✓. Headcount codas: 0 all ✓.
- Self-sufficiency, last series day: 0.845 / 0.862 / 0.868 / 0.910
  (gate ≥ 0.70) ✓ all. Starvation deaths: 0 all ✓.
- Plenty-voice: 26 / 20 / 26 / 24 (gate ≥ 1) ✓ all.
- Death liturgy (presence-aware form adopted from r74's metric review,
  deferred-beat reading — a beat owed for each villager/person death
  followed by a Haven night within the horizon):
  - 905 exact (1 death at Haven, 1 beat — Oliver, day 11).
  - 906 exact (2 deaths, 2 beats — Rahul day 8, Yana day 12).
  - 907 exact (0/0).
  - 908 NO-GO as written (2 deaths, 1 beat — Keisha day 7, Hans day 9).
    The single beat cannot be attributed from saved evidence: grief-beat
    lines are counted by the driver from live lines and appear in NO
    saved transcript or system file, so whether the missing beat is
    Keisha's or Hans's is unrecoverable. NOT re-scored: the miss stands
    as a NO-GO on this gate, with the attribution gap as the finding
    (see metric review). The village does mark the deaths elsewhere —
    908 day-11 Luis: "We gave them a good burial. Doesn't feel like
    enough, does it?" — so mourning is not absent, the counted line is
    short one.
- **Succession note (906 + 908):** both seeds' players died mid-fortnight
  and play continued as another villager, as designed (village, not
  individual, is the protagonist). 906: Rahul died in the wild day 8,
  mantle passed to Ruby the same day; the village later names him
  ("I asked Rahul about the most useful thing you've learned — Rahul's
  gone", day-10 Maya). 908: Hans died on expedition day 9, mantle
  passed to Rachel day 10; Keisha's death is marked by a full crisis
  beat ("THE FIRST GRAVE") on day 7. Neither succession broke the run.

## LIVE-RUN PROBE verdict (r74 blank, fresh seeds)

- **905: the r74 chain closes end-to-end on a fresh seed.** Henry
  promised day 9 (meet 10, due 11, "the old burn east of camp"); the run
  went live days 10–11 (haul 0+0, correctly untouched); promise broke
  day 12; the live-run pass ENDed it at Haven ok=true with the honest
  line ("0 kcal from you, 0 kcal from Henry — 0 kcal into the pantry.
  The promise was missed; unloading does not earn kept-promise credit."),
  runReturned=true. The r74 replay result reproduces in live panel play.
- **907: the pass's blind spot, sharper than r74.** Fatima promised day 7
  (meet 8, due 9). Day 8 the probe's start was blocked by Haven-door
  adjacency; day 9 the run existed with 0 haul ("Forage together on
  green ground first"); the promise broke and the run went live. Days
  11–14 the live-run pass tried to END it four times and failed every
  time: "Return to Haven together to unload and end this outing." The
  pass checks that the PLAYER is at Haven, but the end action needs
  player AND partner together at Haven — and Fatima is out on the run,
  not at Haven. The run stayed `runlive` through the horizon end.
  Poison check: NO "Finish your current outing" refusal appears
  anywhere in r75 (pilot or main). Aroha's later break (promised day 11,
  meet 12, due 13) was NOT Fatima poisoning: her day-12 start was blocked
  by the same Haven-door adjacency, she went away day 13, and her
  promise broke unrun. So per the prereg's fix gate this is NOT a
  confirmed game defect — a real player can walk out, find Fatima, and
  return together (the end line says exactly that); the probe has no
  fetch step. It IS the documented blank for r76: the live-run pass
  needs a "go fetch the partner and return together, then end" step,
  and its end attempt should check partner-at-Haven before trying.
- **906: no outing reached live-run state (no case). 908: Olivia's
  promise (day 12, meet 13, due 14) reached day-14 dawn still waiting;
  her start was blocked by Haven-door adjacency — the panel's third
  door-adjacency block (Fatima day 8, Aroha day 12, Olivia day 14).**
  The door-adjacency probe failure is now a standing probe-robustness
  item, not a game defect (a real player walks into the hall; the
  probe's walk-toward stalls when the partner sits deep in it, once
  even reporting the partner position as undefined).
- **Counter-stage:** no panel outing delivered with player food staged
  on the counter, so the r73 fix gets no new end-to-end case here
  (same NO-OPPORTUNITY shape as r74). No false-zero line appeared
  anywhere (no regression signal).

## Village assessment (plain words)

Four first fortnights, all surviving to the horizon — two of them under a
second leader after the first died. System contact lands day 8 on all
four. Pantries stay ahead of hunger (self-sufficiency 0.85–0.91) and
nobody starves. Villagers ask for help constantly and the village
answers honestly: when the asker is out on the road, the game refuses
the promise outright ("Find me when I'm back, and we'll set it then")
instead of making a promise it can't keep; when promises break, the
village says so to your face ("Promises rot. -15 trust"). The dead are
not forgotten — the village digs a first grave, gives a good burial,
and names the dead in later conversation. The fortnight's sore spot is
the same mechanical one as r74, now with its edges measured: promised
outings keep dying unworked, and when a run goes live with its partner
away, nothing in the daily routine fetches her home — the outing sits
live, the promise rots, and the player is blamed. A real player who
walks out to their partner can end it; the sim's player never did.
That fetch step is next run's probe, not a villager failure.

## People check (all transcripts read in full, 1654 lines)

GO. 0 depth fizzles, 0 fabricated shared history, 0 empty beats
(counters agree on all seeds). What the transcripts actually show:
- Curious villagers want a real answer and the depth beats pay it off
  with specific memories (trail-crew reading people, tracking résumés,
  Almaty mornings, Hokkaido streets that get longer, "laughter's a
  mutiny") — never filler.
- The away-guard speaks honestly again (907 Zoltan, out on the road:
  no promise made to an absent asker, no rot).
- The village names its monsters together: namebeast votes accumulate
  across sittings, and tellbeast reports travel ("word travels fast
  around a fire"). Knowledge-gating holds: an unnamed villager is
  described, not named ("the man in his 50s, with ink-stained fingers,
  the emt").
- Invitations resolve both ways in form: declines acknowledged cleanly
  ("Another time, then. A small thing, pocketed."); one sitting (907
  Fatima) carries both a kept promise and a declined lure.
- Withdrawn asks stay honest non-events (905 Zoe: "we got it handled.
  Thanks anyway.").
- Cleared suspicion, second time: two NPC depth beats say "Columbus,
  Ohio" (907 Aaliyah, 908 Eamon) right after the player said it — but
  the template fills the NPC's own origin (game.js fill closure;
  lifeseed.js:512 fixes only the PLAYER's origin to Columbus), and this
  panel alone shows Jakarta, Seville, Almaty and Portland in the same
  slot. Columbus twice is coincidence in a small origin pool, not an
  echo. (r74 cleared the same suspicion via Emma/Oslo.)
- Thin-beat note, not a fizzle: 905 Wei's depth beat is a withdrawal
  ("They pull back half a step") rather than a memory — a behavioral
  beat, counted content by the instrument, and the sitting still
  resolves engaged.
- Watch item, not a defect: 906 Tariq's confession ("I've been writing
  letters I'll never send") arrives framed only by lure accept/decline
  ("All right. Let's go." / "Not this time.") — the decline resolves
  cleanly, but "Let's go" points nowhere in a confession. Worth a
  wording look when the lure menu is next touched.

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact, food, talk, and promises — but the
  joint-outing KEEP path is still reachable only through careful
  driving, not through normal play + auto-depart, and the
  end-when-partner-away path is reachable only by walking out to fetch
  her, which no routine does. The r76 fetch probe is the next measurement.
- Fun: the fortnight reads like people surviving together — asks,
  refusals, naming, grief, burial. The unfun part is unchanged from
  r74: being blamed (-15 trust) for outings the routine never worked.
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.

## Metric review

- Death-liturgy gate, revision proposed for the NEXT run (this run's
  miss is NOT re-scored): the gate needs two rules it currently lacks —
  (1) whether a grief beat is owed for the player's own prior body
  after succession (906 suggests yes, 908 suggests no — or 908's miss
  is Keisha's deferred beat never firing), and (2) grief-beat
  attribution persisted in the driver (which death, which night), so a
  future miss can be diagnosed instead of merely counted. No thresholds
  changed this run (gating freeze stands).
- No other metric revision. The counter-stage panel fields stay in the
  driver (they cost nothing and will catch a counter case when one
  finally walks the deliver path).

## Telemetry deviation check

Ran `telemetry-check.js --baseline .../telemetry-baselines/landing-split.json
--current '<r75-census-glob>' --metrics systemDay,monsterKills,starvAutopsies`.
Output: one LOUD line — "monsterKills swung 113%: baseline 24 -> current
51 (n=4 files)". Verdict: EXPLAINED, stale baseline + seed variance,
not a real deviation — per-seed kills 8/21/15/7 (r74 panel: 6/4/9/10,
total 29); the r75 excess is driven by 906's 13 expedition kills and
907's 10 villager-combat wave-1 kills, all itemized by day/cause/wave
with no double-counting (same-kind same-day pairs match distinct
corpses at the same node). The baseline (rolled 2026-10-28 by r66 from
a pooled mean of 8 runs, totals 18–34) predates the win-intel / table /
villager-agency landings. NO baseline rolled: a single 4-seed panel is
not a re-baseline — propose a pooled re-baseline across r74+r75+next
run instead. No other LOUD lines.

## Closeout note

- Quick suite: `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest` in the worktree: 284
  passed, 6 failed in 779s — the SAME 6 pre-existing failures as r74
  (measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes), none
  referencing this run's files. This run changed zero src/js and zero
  existing tests (prereg + note + suite log only), so the 6 are
  other lanes' proof-freshness maintenance, reported here, not fixed.
- Heartbeat note: beats queue behind the registry flock under sibling
  load (a manual beat took 72s to land; the loop's printed line is not
  proof). Verified heartbeat_at in the registry directly (23:27:26Z)
  before closeout; the loop kept beating thereafter.
- Commit: prereg + this note + suite log (evidence only, zero src/js).
  No [needs-eyes] — no player-facing change.
- Merged locally, pending ship (no version tag; ship job owns it).
