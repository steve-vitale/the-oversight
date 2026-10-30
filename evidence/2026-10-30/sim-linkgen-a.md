# sim-linkgen-a — regional link failure decomposition

Run: Loop A, axis scale-onramp. MEASUREMENT ONLY — no src/js change;
the gating freeze (Steve 2026-10-27/28) stands.
Base: worktree ~/workspace/worktrees/sim-linkgen-a, branch sim-linkgen-a,
HEAD 359a384cc3ff7516235c52777ef66bccd4c01f11 (recorded in every corpus
file's manifest).
Pre-registration: evidence/2026-10-30/sim-linkgen-a-prereg.md (frozen
before any judged sim).

Decomposes sim-bladequota-a (evidence/2026-10-30/sim-bladequota-a.md,
read first, NOT re-quoted as this run's data):
(1) Competent leg: 0 active links on all 16 bladequota seeds — were
link proposals ever made, ever accepted, or does something block
proposal/acceptance entirely?
(2) Leadcourt leg: links that DO form can carry empty rosters
(generated=false, rosterSize 0 every linked day) — what generates a
village roster, what leaves one ungenerated, and do such villages
ever gain people later?
Fresh band on THIS base: seeds 76201–76208 × 2 legs (competent,
leadcourt). Every number below is from this band.

## Verdict: DIAG-GO on both questions (per the frozen header)

- Q1: competent stage NO-ATTEMPT on 8/8 seeds (>= 6 required) AND
  leadcourt attempts on 8/8 seeds (>= 6 required) → diag1 true.
- Q2: 24 linked villages (>= 12 required) with complete generation
  histories; generated-ever holds a strict majority (16/24) AND 100%
  of generation events carry an approach trigger (0 non-approach
  counterexamples) → both diag2 clauses true.
- Confirm decision (prereg rule, not a shortcut): the pilot already
  decides both questions with margin, so the pilot IS the band. No
  confirm seeds were spent. 0 instrument errors on all 16 seeds.

## (1) Competent: nobody ever asks — the zero is a policy fact, not an engine block

Competent, 8 seeds: proposals attempted 0, links formed 0, links at
end 0 — on every seed, including 200-day survivors. Stage NO-ATTEMPT
8/8. This is NOT a knowledge block, NOT a distance block, NOT a trust
block:

- Knowledge arrives early and often. Every competent seed knew 4–8
  villages; the first village was known by day 4–9 on every seed
  (mostly via delivered traveler rumor, sometimes via seen-nearby).
  Seed 76201 knew Emberhold day 4 (rumor) and Thornfield day 22
  (rumor) and still proposed nothing for 200 days.
- Approach works fine. Competent generated 1–6 village rosters per
  seed (22 generation events across the band) by walking within 2
  tiles — the approach machinery is exercised constantly (29–688
  catchUp re-syncs per seed). The player meets villages and still
  never courts them.
- The code says why: scripts/policies/competent.js contains NO
  proposeLink call, and neither do any of its delegates (grep over
  all proposeLink callers: only app.js UI + scale policies). The
  wrapper confirms empirically: 0 calls in 8 runs. Competent is the
  scale-free baseline BY DESIGN — its silence is the finding, not a
  bug to chase in the engine. Any "competent should link" claim needs
  a policy change, not a game change.

## (1) Leadcourt: when someone DOES ask, everyone says yes — the negotiation never fires

Leadcourt, 8 seeds: 24 proposals, 24 ACCEPT, 0 COUNTER, 0 DECLINE,
0 BLOCKED-UNKNOWN, 0 SHUT-DOOR, 0 counters to answer. Stage REACHED
8/8 (3 active links at end on 7/8 seeds; 76202 ends with 1 after 2
broke — see below). Every proposal had knowsBefore=true. Opinions
at proposal time were LOW (-2 to +8, median ~2) — yet all cleared
the >= 55 accept bar. The played negotiation (counter band 35–54,
decline with -5, shut door at opinion <= -20) never appears on this
policy: by day 25+, Haven's representative standing + strength term
already push judgeLink's base 38 over 55 without any courtship climb.
The counter band is not the binding stage; the binding stages are
UPSTREAM of the proposal:

- The day-25 gate (leadcourt proposes from day 25; link days run
  25–49, mostly 25–30).
- The pantry > 12,000 kcal gate (leadcourt's own guard).
- Knowledge arrival: 76207's third link waited to day 38 for its
  village to become known (rumor delivered ~day 37–38, proposed the
  next day — see Metric review on the 'link' lore overwrite).
  76208's third link also waited to day 38 DESPITE knowledge since
  day 9 — cause not instrumented (pantry dip vs pending accord/
  national is the candidate set; the instrument did not record
  pantry/pending state daily — see Metric review).
- So the link-formation pipeline, in order, is: policy verb (absent
  in competent) → day/pantry gates → knowledge → instant accept.
  Trust, opinion, and the negotiation bands bind nothing on this
  band. Follow-up question (not answered here): does the counter
  band EVER fire in the wild, or is rep+strength always enough by
  day 25? That needs a weaker-rep policy probe, not a game change.

Per-seed leadcourt: 76201 3 links, national; 76202 3 formed / 1 at
end, global; 76203 3 links, global; 76204 3 links, regional (died
day 71); 76205 3 links, global; 76206 3 links, global; 76207 3
links, global; 76208 3 links, global. All 3 proposals per seed —
leadcourt stops at its 3-subordinate cap, so 24/24 accepts also
means the cap, not demand, ends courtship.

76202 breakage (noted, cause not instrumented): 2 of its 3 links
broke before end (Emberhold trust 7, Thornfield trust 17 at end,
arrears 0 on both — so NOT a tribute-arrears break). Both villages
gained rosters only AFTER breaking (approaches day 173/174).
Break-cause instrumentation (wrap breakLink) belongs in the next
run; linkdissolve arms own breakage mechanics.

## (2) What generates a roster: walking within 2 tiles. Nothing else. Ever.

48 generation events across both legs (26 leadcourt + 22 competent),
100% with player distance <= 2 at the call (visit dist <= 1, or
seen-nearby dist 2). 0 generation events without an approach trigger.
genVillageRoster is called ONLY from catchUpSim (verified by grep),
and catchUpSim runs ONLY on approach (checkVillageProximity) or
presence interactions (talk/join/betrayal — all require being at
the fire). _formLink does NOT generate a roster. _linkedVillageWeek
(linkTick, Haven-primary subs only) advances village.day and moves
pantryKcal with NO roster and NO roster deaths. Time passing,
tribute weeks, and link formation never generate a roster.

The 24 linked villages split four ways:

| class | n | what happened |
|-------|---|---------------|
| generated BEFORE link | 6 | visited/seen first (gen day 3–23), courted later — the healthy path |
| generated AFTER link, while linked | 8 | rosterless at link, then a later approach generated them — after 23–143 days rosterless (link→gen gaps: 23, 28, 36, 86, 92, 128, 139, 143 days) |
| generated AFTER break | 2 | 76202's broken links; rosters arrived day 173/174, after the bond ended |
| NEVER generated | 8 | catchUps = 0 — the player never came within 2 tiles in the whole run |

Answer to "do such villages ever gain people later?": YES — but
only if the player eventually walks there. 8 of 16 villages that
were rosterless at link day gained people later, all via a later
approach (dist 2, seen-nearby, in every case). The other 8 never
did, because the player never went: they stayed rosterless for
41–173 linked days to run end.

The 8 never-generated villages are NOT failed links. At end they
show trust 52–100 (76201 Emberhold: trust 100, opinion 10, linked
156 days, roster 0), opinion 9–58, and arrears up to 9,704 kcal on
some — tribute shortfalls accrue against their abstract pantry
while no person exists there. Their village.day marched to 42–175
via _linkedVillageWeek: they AGE without existing. They are the
bladequota pattern reproduced on fresh seeds: 8/24 links (33%)
contribute 0 faces to any muster, aid, or defense call for their
entire linked life, and the 8 generated-after-link villages
contributed 0 faces during their 23–143-day rosterless windows.
Any system reading allied rosters finds nobody there; only the
visited village carries a coalition (same shape as bladequota's
"the third village carries the whole muster").

H4 (daysToSim early-return trap): NOT OBSERVED. 0 lore-only
approaches across 2,442 catchUps in both legs. Negative daysToSim
values (min -6) exist, but only on already-generated villages,
where the early return skips a harmless re-sync and the roster is
intact. The trap (ungenerated village approached with village.day
>= scholar day) remains code-possible — weekly ticks push
village.day up 7/week — but in this band every approach of a
rosterless linked village had daysToSim 24–29 and generated. The
reason it stays positive: a linked village's day counts from ~0 at
link time via weekly ticks, so it trails scholar day by weeks.
Report H4 as unobserved, not refuted.

## Wall numbers

Competent 8: won 0/8, national-ever 0/8, national-final 0/8,
table-waiting 0/8, table-entered 0/8, wave 4 4/8, wave 5 0/8,
median survival 180.5 days, max 201, deaths 292 (combat 119,
villager combat 70, the wild 30, expedition 18).
Leadcourt 8: won 0/8, national-ever 7/8, national-final 6/8,
table-waiting 5/8, table-entered 0/8, wave 4 7/8, wave 5 0/8,
median survival 189 days, max 201, deaths 333 (combat 133,
villager combat 65, the wild 47, sickness 19).
The wall stands in both legs: national is reachable only by
courting (7/8 vs 0/8), the table is waited on but never entered
(5/8 vs 0/8 waiting; 0/8 entered both legs), wins 0/16, wave 5
0/16. Courting moves the wall from village to national/table —
it does not cross it.

## What the village looked like (plain words)

On the no-courtship road, villages live and die as single fires
that know their neighbors by rumor — travelers bring word by day
4, the player walks past their smoke and learns their plants —
and never once ask them to join anything. The neighbors stay
names the wind brought, not allies.

On the courting road, three fires bow within a month of the
earliest asking day, tribute starts flowing, and the realm climbs
to national and global standing. But a third of the coalition is
paper: villages that bowed on a traveler's word, whose wagons
supposedly roll into Haven and whose grandmothers supposedly
remember Haven's grain, yet no one from those villages has ever
been seen, because no one from Haven has ever walked the two
tiles to their fire. One realm in this band (seed 76206) reached
global standing with three allies and zero approached villages —
a global power whose allies are, person by person, nobody. When
the player does eventually walk out — sometimes four months
later — the village suddenly has people, with names and ages, as
if they had been there all along. They hadn't, in any sense the
game's systems could use.

## Sense-testing (transcripts on-trajectory — event sequences match the silent runs exactly)

- Mechanism (1), leadcourt seed 76201 (17,661 captured lines):
  link formation reads cleanly — "Tanya brings it home: Emberhold
  bows to Haven — one organization, us primary. Tribute: 4,000
  kcal/week. The relationship starts at trust 30. Everything from
  here is earned." Then "Three fires bow to Haven. But a realm
  isn't leverage — it's seasons." What is ABSENT is any
  negotiation: no counter, no decline, no reason given for the
  accept — because none fired (24/24 accepts). A player would
  experience courtship as a single line, not a negotiation; the
  judgeLink reasons are spoken only on decline, so an accept
  never says WHY they said yes. Coherent, but thin: the climb
  that supposedly earned the bond is invisible in the fiction.
- Mechanism (2), leadcourt seed 76206 (19,645 captured lines):
  ZERO "smoke on the horizon" lines in the whole run — no village
  is ever approached — yet Emberhold/Thornfield/Ashford are
  mentioned 110/138/80 times (tribute wagons, tending grain,
  "Someone's grandmother over there will remember who fed her",
  and "Ibrahim of Thornfield walks into Haven unannounced,
  pack-mules behind"). The fiction asserts people — grandmothers,
  wagon drivers, a named visitor — for villages whose rosters are
  empty. The inconsistency is system-level (muster faces, aid
  hands find nobody), not narration-level: the game talks as if
  the people exist while its systems find none. Seed 76201 shows
  the contrast in one run: exactly ONE smoke line (Stonebridge,
  the only approached village) against 92/76 mentions of
  never-visited Emberhold/Thornfield.
- Judgment: both mechanisms read as the code says they are. The
  sense gap is the rosterless ally: narration that presumes
  people where the roster holds none. Any follow-up that makes
  allies' people matter (muster, aid, defense) must reckon with
  this gap first — or the fiction will keep promising grandmothers
  the systems cannot produce.

## Metric review (applies to the NEXT run, never re-scores this one)

1. firstKnown day has a +1-day skew: the daily snapshot runs after
   policy.daily but before endDay deliveries, so a rumor delivered
   at end of day N first appears in the day N+1 snapshot (76201
   competent: Stonebridge generated day 3, firstKnown day 4).
   Report firstKnown as "first daily snapshot showing known", not
   the delivery day.
2. firstKnown how can read 'link' when rumor delivery and proposal
   share a day: _formLink records 'link' lore (rank 3), which
   overwrites the rumor entry (rank 1) before the snapshot reads
   it. The proposal wrapper's knowsBefore is the ground truth for
   enablement — use it, not snapshot lore how, for "what enabled
   this proposal".
3. Link-break cause is not instrumented: next run should wrap
   breakLink (76202's 2 breaks have arrears 0 and are unexplained
   by this instrument).
4. The 76208 day-38 third-link delay cause is not instrumented:
   next run should snapshot pantry kcal + pendingCounter/Accord/
   National flags daily, so pantry-gate vs pending-gate delays can
   be separated.
5. The pilot-as-band rule (prereg) worked: both questions decided
   with margin on 8+8 seeds. Keep it — but note it depends on the
   margin (stage 8/8, 24 linked villages); a closer pilot must
   still trigger confirm spend.
6. CatchUp re-sync volume (up to 688 events/seed, mostly the same
   visited village re-syncing every approach) bloats corpus files
   without adding information. Next run: record first-approach and
   generation events in full, re-syncs as counts only.

## Limitations (stated, not hidden)

- Single base (359a384cc); no game-code lever, so per §15 there is
  NO balanced-panel file — the competent-vs-leadcourt contrast is
  a POLICY contrast on identical seeds, not a panel result.
- Policies are bots: a human who walks to allies after linking
  would generate rosters faster than leadcourt does; the sims show
  what the game's own courting play produces, not the human ceiling.
- FirstKnown skew + lore-overwrite (Metric review 1–2) limit
  knowledge-timing precision to ~1 day and make snapshot lore how
  unreliable for same-day delivery+proposal cases.
- Break cause (76202) and the 76208 delay cause are uninstrumented
  (Metric review 3–4) — reported as open, not inferred.
- Transcript kept-lines are regex-filtered (link/proposal/tribute/
  smoke/trust vocabulary); counts of village mentions are over
  kept lines, not full captures, except the smoke-line counts,
  which were checked over the full captured set (76206: 0 smoke
  lines in 19,645 lines).
- The original pilot sweep process was lost to a session reset
  after 6 competent seeds; the run was relaunched from the saved
  per-seed files (6 competent seeds reused verbatim, remaining 2
  competent + 8 leadcourt run fresh). No seed was run twice into
  the corpus; 76201 leadcourt's event sequences match across the
  smoke run, the pilot run, both determinism replays, and the
  transcript run.

## Blanks found (documented — this arm is measurement-only)

1. Linked-rosterless allies are the muster/aid hole, measured: 8/24
   links never have people; 8 more have none for 23–143 days.
   Anything that reads allied rosters inherits the hole. No fix is
   proposed here (perception law forbids roster/list-fed shortcuts;
   a fix must come through sensed contact, e.g. a policy or system
   that actually walks to allies — that is a follow-up design
   question, not a recommendation of this arm).
2. The counter/decline negotiation may never fire in the wild:
   24/24 accepts with opinions -2..+8. Whether the played
   negotiation exists anywhere outside fixtures is an open
   measurement question for a weaker-rep policy probe.
3. Competent's missing scale verb is a policy-design question:
   the scale-free baseline is deliberate, but it means every
   competent-based reachability claim about national/table is
   really a claim about a village that never courts. Reachability
   claims about the LEAD road must run against leadcourt (or
   equivalent), never competent's silence — bladequota's addendum
   already corrected this; this arm confirms it with proposal
   counts (0 vs 24).

## Instrument proof (scripts/test-linkgen-instrument.js — PASS)

Seed 76201 leadcourt replayed twice in separate processes:
byte-identical proposal, counter, catchUp, and generation event
sequences (proposals=3, catchUps=323, genEvents=1, linksEnd=3,
days=201), 0 instrument errors, every end-generated village backed
by a gen event. The same event counts reproduce across the smoke
run, the pilot run, both replays, and the on-trajectory transcript
run. PASS.

## Files (all in this worktree; ready for coordinator merge, pending ship)

- evidence/2026-10-30/sim-linkgen-a-prereg.md — frozen pre-registration
- evidence/2026-10-30/sim-linkgen-a.md — this file
- evidence/2026-10-30/sim-linkgen-a-analysis.json — band aggregator output
- evidence/2026-10-30/sim-linkgen-a-transcript-76201.json — sense transcript, mechanism (1)+(2) contrast (on-trajectory)
- evidence/2026-10-30/sim-linkgen-a-transcript-76206.json — sense transcript, pure rosterless coalition (on-trajectory)
- evidence/2026-10-30/perseed-linkgen-a-competent/ — competent per-seed JSONs (8)
- evidence/2026-10-30/perseed-linkgen-a-leadcourt/ — leadcourt per-seed JSONs (8)
- scripts/linkgen-snapshot.js — pure-read link + roster snapshot + proposal classifier
- scripts/linkgen-sweep.js — seed sweep (competent/leadcourt, death-aware, event wrappers)
- scripts/analyze-linkgen-a.js — band aggregator (stage + linked-village + wall)
- scripts/linkgen-transcript.js — sense transcript runner with on-trajectory check
- scripts/test-linkgen-instrument.js — determinism/replay proof (PASS)

Measurement only, nothing game-changing to merge — the coordinator
should land evidence + instrument scripts only. No [needs-eyes]: no
game feel/combat/UI changed. Do NOT push, bump, or verify live.
