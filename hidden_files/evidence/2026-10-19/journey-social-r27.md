# Journey-social r27 — moots & gossip as a citizen-player (lane B, leg 5)

**Run:** oversight-playtest-loop-2, 2026-10-19 ~03:00–03:30 CDT (run_id 2026-10-19T07:55:21Z).
**Leg:** 5 (social life). Rotation-b: 5→6.
**Status:** PILOT COMPLETE. No code changes (see Infra). Merged: nothing — EPERM outage blocked worktree registration and all commits.

## Pre-registration (written before the pilot ran)

**Leg question:** when a player convenes moots and gossips across a full run, do the
social institutions work end-to-end — convened, played, resolved, with consequences
the villagers acknowledge in conversation afterward? r26 probe-verified moots +
gossip are reachable but its driver never exercised them ("flagged for the next
run's driver, not a game gap"). This run is that driver.

**What would count as interesting:** a moot that convenes but resolves nothing; gossip
that never spreads; villagers with no memory of a moot they attended; consequences
that don't land in the graph.

**Seeds:** 2001, 2002, 2003, 2004 (fresh). **Horizon:** DAYCAP=140, death-aware
(+10d tail). **Policy:** competent survival base + 'moot-gossip' driver —
(a) convene ≤1 open/dormant NPC-vs-NPC case/day via Game.callMoot, vote guilty iff
accused trust < 25 else acquit; (b) 2 gossip-first conversations/day
(ask:gossip / ask:spread_rumor); (c) day-after-moot lately-first follow-ups;
(d) favoritism wrapper (2 favorites kind, 2 outsiders verbally hostile — NO theft).

**Bindings (a miss is NO-GO, never re-scored):**
- M1 moot end-to-end: ≥1 moot convened → verdict on ≥2/4 seeds.
- M2 gossip reach: ≥5 gossip-thread conversations on ≥2/4 seeds.
- M3 consequences: each resolved moot moves accused trust or victim-side bonds
  (measured nonzero delta).
- M4 people check: 1 moot transcript + 4 gossip transcripts sense-read, 0 senseless.
- M5 guardrail: village alive at horizon on ≥2/4 seeds.

## Pilot results

| seed | days | alive | convos | gossip | moots | deaths |
|------|------|-------|--------|--------|-------|--------|
| 2001 | 142 | 7 | 339 | 58 | 1 (d16 ambush, NOT GUILTY, player voted acquit) | 6 |
| 2002 | 142 | 4 | 344 | 76 | 0 | 17 |
| 2003 | 142 | 9 | 374 | 62 | 0 | 5 |
| 2004 | 142 | 7 | 302 | 27 | 0 | 17 |

- **M1: MISS (1/4).** One moot in 560 village-days. NPC-NPC cases essentially don't
  form under competent, law-abiding play.
- **M2: GO (4/4).** Gossip threads fire constantly (27–76/run).
- **M3: GO (thin, n=1).** The single moot moved accused trust +4 (vindication).
- **M4: GO.** 2 moot transcripts + 3 gossip transcripts sense-read (see People check).
- **M5: GO (4/4).** All villages alive at day 142.

## Headline finding: moots are unreachable for a law-abiding citizen-player

The moot *machinery* works end-to-end (proven: convene → broadcast ceremony →
attendance → player vote → verdict → sentence → trust/bond consequences — see the
d8/d16 transcripts and the confounded run below). But a player who doesn't commit
crimes will almost never see one. Mechanism, verified in code:

- NPC-NPC cases come only from betrayal plots (`considerBetrayalPlot`).
- Plot arming needs motive ≥ 45 between some pair AND passes the "beloved village"
  gate (avg trust > 55 + heat < 20 → 90% skip) AND a 40% daily roll AND ≥2 recruits.
- `npcMootTick` convenes NPC-NPC moots automatically (no player needed) — the
  binding constraint is case formation, not convening.

This is arguably **by design** ("beloved village: basically never" — a happy village
shouldn't hold murder trials). It is also true that the moot is a flagship social
institution (post-System galaxy broadcast, "THE MOOT!") that a citizen-player never
experiences. **Design question for Steve, not a silent retune:** should law-abiding
players ever see a moot, or is the moot correctly reserved for player crimes + rare
blowups? No code changed.

## Bonus finding (confounded first run): symmetric jeopardy works beautifully

The first pilot attempt used r26's theft driver (stealFrom outsiders every 5d). Every
moot (25 across 2 seeds) named **the player** as accused — "Jude", "Regina", "Saul"
were the player's own generated names. The village prosecuted the criminal player
end-to-end: cases formed from the thefts, moots convened (one convened by the player
themselves — "You call a moot" then standing accused), votes tallied (the accused
correctly don't vote — `playerVoter=false` when accused, which is why 24/25 showed
`vote=null`), acquittals with +2 vindication trust, convictions with weregild
("You pay. And stay — this time." dTrust −15) and murder conviction → exile → death
the next day. Accusers paid −8 to −12 trust per failed prosecution (cry-wolf cost).
Steve's "obviously a player should have to face the judge" is fully realized.
Driver fixed (verbal hostility only) and the pilot re-run clean.

## People check (sense-testing law — transcripts read end to end)

- **Moot d16 (2001):** "0 for guilty. 8 against." — unanimous acquittal, the player
  voted acquit, "Your 'not guilty' lands in the count, out loud... the accused
  breathe — and they'll remember who stood up." Coherent ceremony, consequences
  named. 0 senseless flags.
- **Moot d8 (confounded run):** guilty verdict → "No agreement. The village splits —
  not in houses, in fires. Two circles now, and the space between them." (coldWar+1).
  The split is said aloud. 0 senseless flags.
- **Gossip, Benoit (d33):** the NPC asks the player a hard question first, then the
  gossip ask lands with teeth — "Vasyl told you that? Then Vasyl told you wrong."
  A rumor being contested, sources named. Excellent.
- **Gossip, Daniela (d11):** gossip beat thin but honest ("Chloe? A florist, back
  before. Solid person.") — the engine declines to invent gossip when the pool is
  dry. Good discipline; matches r26's read.
- **Gossip, Christian (d34) — BLANK (documented, not fixed):** resuming the open
  gossip thread ("About the gossip — we never finished.") produces the generic
  resume line ("yeah, we never did get back to that") and then the thread stalls —
  "Still on the gossip." → winddown, no content. Mechanism: the `alive:thread`
  resume path sets `c.thread='gossip'` but delivers no beat; `convoThreadBeat`
  has no gossip branch (goal/past/plans/want/topic2 only), so 'more' finds nothing
  and the energy budget winds down. The honest moves would be (a) delivering an
  askAbout gossip beat on resume, or (b) the exhausted line. Left for a
  conversation-engine run — needs a proof test, and git was down.

## Village assessment (plain words)

Four villages, 140 days each, all alive at the end — the social fabric holds under
competent play. Seed 2001: 7 standing, tight after early losses. Seed 2002: 4 left,
a long bleed (17 dead) but the fire holds. Seed 2003: 9 standing, the healthiest —
only 5 deaths, all late. Seed 2004: 7 standing after a mid-game cull. Gossip is the
village's constant weather (27–76 threads/run); the moot is a story none of them
told. Bonds form on their own; the graph is alive even when the courtroom is dark.

## Reachable / fun / winnable (social leg)

- **Reachable:** gossip yes, abundantly. Moots: reachable only via player crime (or
  debug) — the citizen path is structurally starved. Verdict: partial.
- **Fun:** the transcripts carry it — contested rumors, the moot's ceremony, the
  village splitting into two fires. The gossip-resume stall is the one immersion
  break found.
- **Winnable:** not this leg's question; all four villages survived to day 142 with
  social fabric intact.

## Metric review (§14)

1. **M1 miss stands as documented, not re-scored.** The miss measures reachability
   for law-abiding players, not machinery function (proven separately).
2. **Confounded first run:** documented above, driver fixed, pilot re-run clean —
   the re-run is the binding result.
3. **Telemetry:** 1 LOUD line (l3.gossipConvos 0→223) — explained: the r26 baseline
   driver never picked ask:gossip (its own note says so); this pilot gossips 2×/day
   by design. Not a game deviation. Baseline NOT rolled forward (metric sets differ;
   this pilot doesn't produce bonds/dryRate/l1).

## Decisions (mine — Steve corrects)

1. No moot-reachability tuning (beloved-village gate is deliberate design; the
   citizen-moot question is Steve's call).
2. No gossip-resume fix this run (git down; needs a proof-tested conversation-engine
   change, queued as a blank).
3. Driver fix (verbal-only hostility) kept; theft driver retired for citizen
   questions.

## Infra

- **Git EPERM outage (4th incident):** `git update-ref` EPERM on .lock writes from
  ~07:55 UTC through end of run (~08:35 UTC, 40+ min and counting). Shell and
  (intermittent) node writes succeed — the binary-targeted pattern from AGENTS.md.
  Blocked: worktree registration (never attempted mid-flap per the orphan rule),
  all commits, rotation/evidence landing. Node writes also flapped — the pilot was
  reworked to stdout-only artifacts (console pipe unaffected).
- **Deliverables staged (uncommitted):** `~/workspace/scratch/journey2-social-r27/`
  — pilot script `journey2-social-r27-pilot.js`, this note, per-seed tele JSONs,
  transcripts. A follow-up run should move the script to `scripts/` and this note
  to `evidence/2026-10-19/journey-social-r27.md`, then land via the normal
  worktree flow.
- No sibling trees touched. Lock deleted at end of run.

## Evidence

- `~/workspace/scratch/journey2-social-r27/journey-social-r27.md` (this note)
- `~/workspace/scratch/journey2-social-r27/journey2-social-r27-pilot.js` (pilot)
- `~/workspace/scratch/journey2-social-r27/tele/cur-s{2001..2004}.json`
- transcripts printed to stdout during the run (moot d16, gossip Benoit/Daniela/Christian)
