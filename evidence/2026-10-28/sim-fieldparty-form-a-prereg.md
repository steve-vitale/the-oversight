# sim-fieldparty-form-a — PRE-REGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T1528Z. Axis: scale-onramp
(blocking axis). Worker: sim-fieldparty-form-a.
Worktree: `~/workspace/worktrees/sim-fieldparty-form-a` (branch
sim-fieldparty-form-a). MEASUREMENT ONLY — zero src/js changes, zero
default flips, no game lever, no fix bundled. If the mechanism suggests
a lever, it is named as the next arm with its own pre-registration,
not built here. No [needs-eyes] (measurement only).

## Question (verbatim from the 1415Z run's named next blank 2)

Field-party formation on meeting as NPC intelligence. The 1415Z demand
census found field fights are all lone villagers (24 field + 2 raid
rows, zero second fighters, ~half armored, zero veterans) and 0/26
parties formed despite ~6 armed villagers village-wide — the party
never forms because the village judges it cannot win. This arm asks
the mechanism question underneath that judgment: when a villager
MEETS a wave-4 monster in the field, why does no second fighter
ever join — is there no join call, does a judgment gate fail, or
does proximity never overlap?

## Substrate (verbatim from the 1415Z run)

Seeds 75101–75108, scripts/policies/tableseat-nowait.js verbatim,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware horizon
(runDays stops on death/win; +10d tail max). Baseline facts to
reproduce/check against (1415Z, same band): field 11 fights /
11 engaged / 0 kills on the w4convert channel split; demand-met
2/50 fights overall; field-channel party rate 0/24 (0/26 with raid).
Parity partner: the 1415Z demand corpus
(evidence/2026-10-28/perseed-wave4demand-a/) on identical seeds /
policy / code-era — the judged census must reproduce its wall
numbers exactly (national ever 7/8, final 6/8; table entered 3/8;
wins 3/8 all lesser; wave-4 reach 6/8; wave-5 0/8; median survival
146d; deaths 286) or explain any divergence as a base move, never
as a re-score. A sibling worker (sim-partyfinish-band-a) runs a
PARTYFINISH=1 band on the same seeds; this arm does NOT touch its
files, branch, or worktree, and does NOT consume its outputs.

## Definitions (held for the whole run — no mid-run redefinition)

- MEETING: one call to Game.resolveWildMonsterEncounter or
  Game.resolvePatrol that reaches Game.fieldFight (directly or via
  Game.aidFight) with a wave-4 world monster, leader a villager
  (non-scholar). Raid-defense calls (havenRaidTick → resolveWild
  with opts.raid) are recorded as channel 'raid' for contrast and
  are NOT in the judged denominator — a raid at the Haven door is
  defence, not a field meeting. Turn-based (TB) fights are NOT
  meetings (scholar party system, different wiring). Expedition-leg
  field fights (channel 'other' in the demand census) are recorded
  but NOT judged — the judged set is wild field meetings only.
- PRESENT AT THE MEETING, two lenses, both recorded per meeting
  (the gap between them IS a candidate mechanism, so neither is
  hidden inside the other):
  - CREW lens (the only lens the engine's party-up code reads):
    Game._outdoorCrew at fight start, filtered to living roster
    members excluding the leader. A crew member counts ARMED if
    they hold an equipped melee/ranged weapon or carry a weapon
    item (the waveCombatReadiness(4) gear read, mirrored from the
    demand recorder).
  - TILE lens (physical co-location): Game.npcsOnNode(monster tile)
    at fight start, filtered the same way (living roster, excl
    leader), with the same armed read.
- COULD-FORM (primary, judged): a meeting where the CREW lens
  holds >= 1 ARMED other villager besides the leader — i.e. the
  party-up code's own input contains at least one armed
  potential second fighter. TILE-COULD-FORM (secondary, reported
  alongside, never substituted): the TILE lens holds >= 1 ARMED
  other villager. A meeting can be tile-could-form without being
  could-form; that split is itself a finding, not a redefinition.
- FORMED: the meeting's fieldFight record has calledHelp true
  with a non-null allyVid (a second fighter actually fought),
  whether from-start (aidFight, allyFromStart) or by hopeless
  shout (fieldFight). Named allies that never fight (opts.allies
  > 0, calledHelp false) are NOT formed — the demand census's
  "named party == fighting party" equivalence is re-checked, not
  assumed.
- SECOND-FIGHTER-JOINS-LATER: a later meeting on the SAME world
  monster spawn seq (_spawnSeq) by a different villager, or a
  later fieldFight on the same seq with calledHelp true. Distance
  is reported in meetings-later and days-later (and day-parts
  later via a recorder-owned advancePart counter) — engine
  "ticks" are not a clock the recorder can read honestly, so no
  tick count is claimed; the part counter is labeled as the
  recorder's own.

## Recorded per meeting (no invented numbers; nulls stand)

Leader vid, monster id + spawn seq + tile, channel (resolve /
patrol / raid-contrast), day + day-part counter, crew raw list,
crew filtered list with per-member armed / armorP / veteran /
current-assignment-task-or-resolved / node-vs-monster-tile,
tile list with the same per-member reads, village-wide armed /
armored counts at fight start, opts.allies + opts.allyVids +
opts.allyFromStart, fieldFight intent + intentWhy, calledHelp +
allyVid + allyDealt + join round if the record carries it,
outcome, rounds, damage dealt/taken, and the meeting's
classification (below). Same-seq later meetings are joined in
the analyzer, never by hand.

## Classification (per meeting, mutually exclusive, applied in this order)

1. JOINED-FROM-START — calledHelp true via allyFromStart (aid path).
2. JOINED-BY-SHOUT — calledHelp true via the hopeless branch.
3. NAMED-NOT-FOUGHT — opts.allies > 0 but calledHelp false.
   Sub-reason recorded from the fight record: intent 'learn'
   (learn-first withdrawal pre-empts the shout — the shout
   branch requires intent !== 'learn'), never-hopeless (fight
   ends vKill / mFlee / evade / vDie before the hopeless branch
   fires), or hopeless-but-blocked (any other shape, quoted
   from the record).
4. NO-CREW — opts.allies == 0 because the filtered crew is empty.
   Sub-split: crew raw empty vs crew raw non-empty but all
   filtered out (dead / not roster / leader-only), recorded.
5. TILE-ONLY — NO-CREW and the TILE lens holds >= 1 armed other
   villager (party-up reads the crew snapshot, not the tile —
   the co-location gap, if it appears).
6. CREW-UNARMED — filtered crew non-empty but zero armed members
   (the code counts unarmed crew toward allies, so this class is
   expected to be empty as a no-join explanation; it is kept so
   a surprise is classified, not dropped).
7. UNCLASSIFIED — anything that fits none of the above; counted,
   never silently dropped. DIAG-NO-GO if UNCLASSIFIED > 0 on the
   judged set (see GO bar).

Wave-3 meetings on the same band are recorded by the same
recorder and contrasted (same classification table) if they
arrive free — wave 3 is NOT judged, and a wave-3 contrast never
rescues a wave-4 NO-GO.

## Primary metric and GO bar (binding — no re-score)

PRIMARY METRIC: party-formation rate on wave-4 field meetings
where a party COULD form (crew lens, definition above):
formed / could-form, over the judged set (wild field meetings,
resolve + patrol, wave 4, 8 seeds).

DIAG-GO requires ALL of:
(a) census complete 8/8 seeds (every seed row valid, days > 0);
(b) 0 UNCLASSIFIED meetings on the judged set;
(c) every could-form meeting classified into JOINED-* /
    NAMED-NOT-FOUGHT / NO-CREW / TILE-ONLY / CREW-UNARMED with its
    sub-reason, and every no-form meeting carrying the code
    citation for its class (see "Mechanism" below);
(d) a NAMED MECHANISM: a code path or decision rule, quoted
    from the code, explaining formation or its absence — e.g.
    no join call exists on the wild path, a judgment gate fails
    (named gate + its condition), or proximity never overlaps
    (crew snapshot vs tile, named functions). A rate without a
    mechanism is NOT GO.
(e) recorder neutrality (detgate): seed 75101 with the recorder
    OFF must match plain tableseat-nowait on days / gameDays /
    tsNationalDay, with no recorder surface and no wraps
    installed; and the judged census must reproduce the 1415Z
    wall numbers above or explain the divergence as a base move.

DIAG-NO-GO if the recorder cannot classify meetings (any
UNCLASSIFIED on the judged set), the census is incomplete
(< 8/8 seeds), the detgate fails, or no mechanism can be named
from the code. A 0% formation rate with a named mechanism IS GO
(a complete census showing no formation is a GO census with a
no-formation finding — same rule as the 1415Z demand census).

## Mechanism (code citations, read before the sweep — to be confirmed or refuted by the census)

Candidate paths, all in current code, none assumed to be the answer:
- game.js resolveWildMonsterEncounter / resolvePatrol: PARTY-UP
  builds wAllies / wAllyVids (or pAllies / pAllyVids) SOLELY
  from this._outdoorCrew (snapshot in resolveAssignments from
  state.village.assignments tasks patrol/scout/hunt/forage),
  trust-sorted, allyVids capped at 2, count uncapped. It never
  reads npcsOnNode(monster tile).
- game.js villagerMonsterTick: per world monster, at most ONE
  npc from npcsOnNode(tile) is picked per worldTick, and only
  with probability 0.5 — co-located villagers meet the monster
  one at a time, in separate meetings, never as a group.
- fieldFights.js fieldFight: at most ONE ally ever joins a
  fight (allyVids shift once; helpCalled guard). From-start
  join requires opts.allyFromStart (set only by aidFight, for
  lingering raiders during an aid crisis). The hopeless shout
  requires hopeless trajectory AND allies > 0 AND intent !==
  'learn'; a learn-intent villager withdraws at round >= 3
  (fleeLearn) before the shout branch can fire. Intent is
  'engage' iff trick known OR allies > 0, else 'learn' — so a
  solo villager facing a wave-4 monster (no counter field, so
  trick known is normally false) starts in 'learn'.
- havenGrowth.js lingererSortie is a deliberate muster, NOT a
  meeting — excluded from the judged set; it is the contrast
  case (a party CAN be mustered to a lingerer, by policy
  choice, not by meeting).

## Sense-testing (SENSE-TESTING LAW)

Read at least one real meeting transcript (the sense replay on
the seed with the most judged meetings, window covering its
first wave-4 field meetings) and judge meaning: do the
villagers' choices read like people judging a fight they
cannot win, or like a missing system (a join that should
exist but never fires)? The sense reading is reported
separately from the census numbers and never substitutes for
them. Sense replay is NON-MEASURED (its trajectory shifts;
counts are the corpus's, not the replay's).

## Balanced panel (§15)

Before/after comparisons run through scripts/balance-panel.js
where a comparison exists — the panel is the instrument, this
prereg's threshold is the judge. This arm changes nothing in
the game, so no before/after game comparison exists; the
paired table (this census vs the 1415Z demand corpus,
identical seeds/policy) is the §15 substitute, as in the
1415Z arms. No panel artifact is faked: if balance-panel.js
has no census-ingest mode, that is recorded in Metric review,
not worked around.

## Metric review (filled at judging time — never mid-run)

- (to be filled at judging: detgate result, parity result,
  classification completeness, any metric doubt for the NEXT
  run, panel note.)
