# Haven-link foreign-polity membership — Loop B, run fleshout-loop-b-20261124T0630Z, arm sim-havenlink-b

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: prereg HEAD `60f6e7436`; prereg commit `fce99c07a`;
instruments commit `ae5ee3892` (single anchor on all 8
per-seed JSONs). Corpus anchor `ae5ee3892ea9`.
Policy `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Seeds 109301–109308 (deterministic replay of the
standing pilot band). Horizon 150 days, death-aware.
Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
before/after change; no comparison is fabricated.

Prereg: `evidence/2026-11-24/sim-havenlink-b-prereg.md`
(commit `fce99c07a`, before any judged sim).

## Verdict — DIAG-GO

All four prereg legs pass: proof 15/15 green before the judged
leg, 0 instrument errors on every seed, one anchor commit; all
8 seeds reproduced the pilot EXACTLY on every frozen field
(days, endReason, scaleRank, maxWave, endUnlockedWave,
bestCapped, doorOpenDay, daysAt199) — the replay is judged,
no fresh band needed; every regional seed classified with its
link target NAMED, its foreign polity's membership STATED, and
its join path STATED — 0 UNCLASSIFIED, 0 orphan link events;
both sense-test link stories read end to end.

The answer to the standing pilot's next blank #3, in one
sentence: **no — Haven's one link never points at the foreign
primary on any seed; the foreign realm is standing there, four
of six times big enough to join, and Haven never even knocks
on its door.** The BELONG road's precondition is met and the
road is never walked — not because the bar fails, but because
no one ever proposes, counters, or stages a Binding. On five
of the six regional seeds the foreign realm is big enough to
join (size 4 or 5); on none of them does Haven knock.

## Correction to the prereg (instrument-proved, stated plainly)

The prereg asserted the pilot's single link each seed "comes
from villager-initiated bonds (bond-initiation.js, accepted
through conversation)". That was wrong, and the instrument
proved it: **0 proposeEvents, 0 counterEvents on all 8 seeds**,
and the single `_formLink` call on every seed comes from
`src/js/metaProgression.js` — the ladder's National-stage
reward (`_ladderRewardLink`, called once per stage from
`ladderGrantStageReward`): when the ladder reaches stage 3
(total 41–44, days 20–59), the best-known unlinked village
bows to Haven, Haven primary, 4,000 kcal/week tribute, with
the line "Word of Haven's standing reaches X before any
speaker does — they send word back: they will bow to Haven."
No villager proposes anything; no conversation courts
anything; the link is a prize for the ladder, not a
relationship anyone built. The prereg's mechanism claim is
retracted and replaced by this one.

## Reproduction check (binding, prereg leg 3)

8/8 seeds match the pilot on all eight frozen fields. The two
src/js changes since the pilot anchor (departname voice-only,
rearm-witness expedition channel) moved NO trajectory on this
band — the rearm channel's behavior change never fires on
these seeds, and the departname change is voice-only. The
replay IS the judged leg; the fresh fallback band
109325–109332 is unspent (and note: the sibling arm
sim-standingconfirm-b is live this run on 109310–109325, so
the fallback band would have needed re-freshness anyway).

## Per-seed membership table

Haven's link target is NAMED on every seed; the foreign
primary is NAMED with its full membership; Haven is a member
of NO foreign polity on any seed; the join path is
`no-join-path-offered` on all 8 seeds. (FP = foreign polity;
first/last = first/last day the FP is seen in snapshots;
Haven's link is Haven-primary on every linked seed.)

| seed | days | end | scale | maxW | Haven's link (day, end trust) | foreign polity: primary + members (first→last, max size) | Haven's link target IN the FP? | Haven member? | join path |
|------|------|-----|-------|------|-------------------------------|----------------------------------------------------------|-------------------------------|---------------|-----------|
| 109301 | 126 | lost | regional | 5 | Ashford, village_3 (d27, 53) | The Red Table, village_spl_27_82850: Stonebridge, Thornfield, The Hungry Road, Ashford (d50→d126, size 5) | YES — Ashford is its sub | no | no-join-path-offered |
| 109302 | 119 | lost | regional | 4 | Emberhold, village_0 (d27, 54) | Thornfield, village_2: Stonebridge (d57→d119, size 2) | no | no | no-join-path-offered |
| 109303 | 104 | lost | regional | 4 | Emberhold, village_0 (d36, 17) | The Hungry Road, village_spl_25_39088: Emberhold, The Red Table, Stonebridge (d59→d104, size 4) | YES — Emberhold is its sub | no | no-join-path-offered |
| 109304 | 74 | lost | village | 4 | Stonebridge, village_1 (d59, 26) | none ever | n/a (no FP) | no | no-join-path-offered |
| 109305 | 36 | lost | village | 3 | none | none ever | n/a (no link) | no | no-join-path-offered |
| 109306 | 150 | survived* | regional | 5 | Emberhold, village_0 (d20, 35) | The Red Table II, village_spl_30_70264: Emberhold, The Red Table, Thornfield (d43→d151, size 4) | YES — Emberhold is its sub | no | no-join-path-offered |
| 109307 | 150 | survived* | regional | 4 | Emberhold, village_0 (d25, 81) | The Red Table, village_spl_26_93377: Emberhold, Thornfield, The Red Table II (d48→d151, size 4) | YES — Emberhold is its sub | no | no-join-path-offered |
| 109308 | 150 | survived* | regional | 4 | Stonebridge, village_1 (d39, 33) | Thornfield, village_2: The Hungry Road, Emberhold, Ashford, Stonebridge (d64→d151, size 5) | YES — Stonebridge is its sub (and Emberhold + Ashford too) | no | no-join-path-offered |

\* "survived" = alive at the 150-day horizon cap, not a win and
not ready.

Pooled: link target IS the foreign primary 0/6 regional
seeds (0/8 overall). Haven a member/subordinate of any
foreign polity 0/8. Join path offered 0/8. `pendingNational`
NEVER present, `nationalLive` NEVER set, `scaleRefused`
never set (same as the pilot). Foreign polity sizes at max:
5, 2, 4, 4, 4, 5 — five of six are size >= 4, i.e.
BELONG-eligible realms (a realm needs a primary + >= 3 subs
for the size bar: 2 + subs >= 4). The one that is not:
109302's Thornfield never grows past a pair (size 2), and
109304/109305 have no foreign polity at all.

## The shape that actually holds

Three facts, each measured, not inferred:

1. **Haven's subordinate is already inside the foreign
   realm on 5 of 6 regional seeds.** Ashford bows to the Red
   Table while bowing to Haven (109301); Emberhold bows to
   the Hungry Road (109303), the Red Table II (109306), the
   Red Table (109307); Stonebridge bows to Thornfield
   (109308, where the realm holds all four of the region's
   villages). The canon calls this hedging ("A fire Haven
   binds may still bind abroad") — and it is the normal
   shape here, not the exception. Haven is one handshake
   from the realm on five seeds: its own subordinate already
   kneels to the foreign primary. Only 109302 breaks the
   pattern (Emberhold is not in Thornfield's pair).
2. **The foreign realm arrives late.** First seen days 50,
   57, 59, 43, 48, 64 — as a pair; it grows to BELONG size
   (4) on days 78–106 (109301 reaches 5 on day 99; 109308
   reaches 5 on day 85). For the first two months of every
   run there is no realm to join at all; the BELONG
   precondition materializes in the last third. The growth
   is engagement-driven and announced: each new binder gets
   a trader rumor ("Word comes late, through traders:
   Thornfield has bound itself to The Red Table"), with the
   stir lead naming Haven's deeds ("Word of Haven's the
   televised games is doing work out there").
3. **The foreign primaries are mostly split villages.**
   Four of six are `village_spl_*` — The Red Table, The
   Hungry Road, The Red Table II — split-offs with generated
   names, and the same names recur across seeds (The Red
   Table is a primary on 109301/109307 and a subordinate on
   109303/109306/109307). `polityOf()` reads
   `foreignPolities` entries regardless of split origin, so
   a split realm counts for BELONG in code; whether a
   split-off realm SHOULD count is a design question, not a
   measurement — but on this band the BELONG-eligible realms
   are split ones on 4 of the 5 eligible seeds
   (109308's Thornfield is the one non-split eligible
   primary).

## The join path, stated (prereg question (c))

On all 8 seeds: **no join path offered.** The evidence is
complete, not an absence of data: 0 proposeEvents (the
policy never proposes a link at all, let alone as
subordinate), 0 counterEvents (no counter ever staged, so
no counter ever asked Haven to bow), 0 nationalEvents (no
Binding ever staged), 0 subordinate `_formLink` calls (the
one link per seed is always Haven-primary, always the
ladder reward). `pendingNational` never present, so no
Binding was ever staged and refused, walked away from, or
left unanswered. The BELONG-bar gap decomposition is
therefore VACUOUS on this band — there is no link to a
foreign primary to decompose, and the prereg's leg-2
BELONG-gap clause is satisfied by stating exactly that,
not by inventing a gap.

What joining WOULD cost, from the code (not measured on
this band — no offer ever staged): the Binding's SWEAR is
a 3,000 kcal oath (trust +12); SERVE is seven days of the
speaker's life at their court (trust +8); WALK breaks the
link and refuses the scale with it. A counter, had one
been staged, would ask Haven to bow at 6,000 kcal/week
tribute (as-subordinate proposal) or 5,000 kcal/week (on
a primary proposal). These are the code-fixed prices;
nothing on this band ever named them to the player.

The reason no path was offered has two halves, both
measured: (a) the engine never invites Haven to bow — no
foreign primary ever courts Haven, and `_foreignPolitySim`
only grows foreign bindings among foreign villages; (b)
the player side never asks — the competent policy contains
no `proposeLink` call, and the ladder-reward link is
always Haven-primary by construction. The BELONG road has
no inviter and no asker on this band.

## Sense-test: two link stories, end to end

**109301 — Ashford, the Red Table, and the door.**
Day 27: "⛓️ Emma brings it home: Ashford bows to Haven —
one organization, us primary. Tribute: 4,000 kcal/week.
The relationship starts at trust 30. Everything from here
is earned." Plus the ladder's own line: "Word of Haven's
standing reaches Ashford before any speaker does — they
send word back: they will bow to Haven." Day 28 Haven
gives Ashford 1,443 kcal ("Rosa weeps, openly. 'The fire
network. That's what it's FOR.'") and Ashford's tribute
wagons arrive the same day. Day 48 the Regional Dawn:
"One fire was a village. Two fires is a NETWORK."
Day 49 the traders bring the first foreign news: "The Red
Table and Stonebridge have bound together — The Red Table
primary. Other fires are climbing, too." Then the realm
grows in front of Haven, one binder at a time, each
announced: Thornfield day 63, the Hungry Road day 91,
Ashford itself day 98 — Haven's own subordinate kneels to
the Red Table while still paying Haven tribute. The door
opens day 80; the village loses both veterans by day 88
and dies day 126 with the Red Table at size 5, Ashford
seasoned at trust 53 inside it, and Haven still regional.
Haven heard every step of the realm's growth and never
once spoke to the Red Table.

**109306 — Emberhold, the Red Table II, and the long
sit.** Day 20: "⛓️ Paola brings it home: Emberhold bows
to Haven — one organization, us primary." Day 41 the
Dawn. Day 42: "The Red Table II and Emberhold have bound
together — The Red Table II primary." Emberhold binds to
the foreign primary three weeks after bowing to Haven.
The Red Table joins day 49, Thornfield day 105 — the
realm reaches BELONG size 4 with Emberhold inside it.
Haven collects Emberhold's tribute every few weeks for
the next hundred days (the same line each time — see the
voice note below) and survives to the horizon at standing
615, still regional, still with one link, still never
having courted the Red Table II. The richest standing on
any band in this program, and the BELONG road never
entered the village's mind.

Voice notes (both sense-tested, neither a membership
finding): (1) the tribute-acceptance line repeats verbatim
5–8 times per seed ("You accept Emberhold's food — 1,759
kcal on the road, 2 day-parts out. Rosa clasps your
runner's shoulder. 'That's what the fire network is
FOR.' (Trust +4.)") — the same repeated-frame class as
the pantry-check line already filed (2026-11-14); (2) the
stir lead is garbled — "Word of Haven's the televised
games is doing work out there" — the kind-word
("the televised games") lands inside a possessive that
doesn't parse. Both appended to sim-findings.md.

## Village assessment (plain words)

Picture eight villages playing competently for one to five
months. Each one earns exactly one bond with another
village — not by courting, not by conversation, but as a
prize: the moment their standing ladder reaches National,
the System hands them a village that bows. They tend that
one bond — food goes back and forth, trust climbs — and
meanwhile the rest of the region is doing the same thing
without them. The Red Table, the Hungry Road, Thornfield:
other fires bind to each other, week by week, and the
traders carry the news to Haven's fire, and Haven listens
and does nothing. On five of the six villages that live
long enough to see it, their one subordinate is already
inside the foreign realm — their own person kneels to a
foreign king while paying them tribute — and nobody in
Haven ever walks over and asks what it would take to
kneel beside them. The road to the nation is standing
open, with a realm big enough to join, and the village
never takes a step down it, because nothing in the game
ever invites them and nothing in their play ever asks.
That is the wall now, stated plainly: not the size of the
realm, not the trust bar — the BELONG road has no inviter
and no asker.

## Wall numbers (this pilot — identical to the standing pilot, by reproduction)

Wins 0/8. Villages lost 5/8, survived to horizon 3/8.
National (scaleRank) 0/8, table 0/8. Wave-5 unlocks 2/8,
wave-5 faced 2/8 (109301, 109306), wave-5 kills 1 (109306).
Wave-4 faced 7/8 (all but 109305). Readiness-5-ready
snapshots 50, on 2 seeds. Capped >= 200 on 6/8 seeds. Days
at gated 199: 311 (all defer5). Median survival 122.5 days
(sorted 36, 74, 104, 119, 126, 150, 150, 150; max 150,
censored). Link target IS the foreign primary 0/8. Haven
a foreign-polity member 0/8. Join path offered 0/8.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- REPRODUCTION HELD 8/8 on all eight frozen fields. The
  anchor moved (departname + rearm-witness landed between
  the pilot and this replay) and nothing moved with it.
  The fresh fallback band 109325–109332 is unspent.
- CALLER MARKER COARSENESS (instrument note, not a
  verdict change): the `_formLink` caller marker records
  file paths only, so all three frames read
  `metaProgression.js` — the mechanism was pinned by
  grepping the file for `_formLink` callers (exactly one:
  `_ladderRewardLink`, line 637) plus the ladder-stage
  crossing on the link day (stage 2→3, total 38–41→41–44).
  A future instrument that needs the call SITE should
  record line numbers, not just files.
- PENDINGACCORD SNAPSHOT SHAPE: `state.pendingAccord` is
  `{linkId, day}` — no target/kind fields, so the
  snapshot's `pendingAccord.target` reads null by design.
  The linkId + day are the real fields; the snapshot
  carries them. The accord itself sits pending from link
  day to run end on 7/7 linked seeds (see Next blanks #2)
  — recorded, not fixed.
- BELONG-GAP VACUITY: the prereg froze a BELONG-bar gap
  decomposition "when Haven's link IS to the foreign
  primary". That condition never occurs, so the gap is
  stated as vacuous rather than decomposed. No metric was
  re-scored: the classification leg is satisfied by the
  named `notApplicable` branch with its reason, and the
  analyzer's fixture tests pin exactly that branch.
- SNAPSHOT CADENCE / DAY DRIFT: same as the pilot
  (snapshots ~daily, first snapshot day 2; driver days vs
  gameDays drift ±2 on survived runs — 109306: days 150,
  gameDays 151, last snapshot day 151). Wall counts use
  the analyzer's `days` field, as frozen.
- SAY-LINE SATURATION: `linkLines` peaked at 290 (109307)
  against the 2000 cap; `saySample` still saturates at 200
  (by design — a sample, not a transcript). The link story
  quotes above come from the uncapped-per-day linkLines
  stream, not the sample.

## Next blanks, in order

1. BELONG needs an inviter and an asker (the binding
   gap, 0/8 offered, 0/8 attempted): nobody ever courts
   the foreign primary — the policy never proposes as
   subordinate, and the engine never stages an invitation
   from a foreign primary. The build/design question is
   which side moves first: should competent play court a
   known foreign primary (a policy verb + a villager-side
   reason to bow), or should a grown foreign realm invite
   Haven (a staged Binding offer when the realm reaches 4
   with Haven's subordinate inside it)? Either is a Steve/
   design call before building; the measurement says the
   road is currently unwalked from both ends.
2. The first gesture is never made (7/7 linked seeds):
   `pendingAccord` stages at link formation and sits
   unanswered to run end (99 days on 109301). The
   competent policy never calls `answerAccord`, and the
   engine's auto-answer (`_answermailDriveDaily`) is
   env-gated (`ANSWERMAIL_DRIVE=1`, default OFF). The
   Regional Dawn fires anyway, so the unanswered accord
   blocks nothing mechanically — but the fiction says "the
   gesture goes out now" while no gesture ever goes out.
   Appended to sim-findings.md.
3. The subordinate chain is unnoticed (5/6 regional
   seeds): Haven's subordinate is a member of the foreign
   realm and the game never remarks on it — no line, no
   beat, no standing effect. Does Haven's polity math, or
   its fiction, notice that its subordinate kneels to
   another primary? Currently neither does.
4. Foreign realms are split realms (4/6 primaries are
   `village_spl_*`): the BELONG-eligible realms on this band
   are split-offs on 4 of 5 eligible seeds. If
   split villages are meant to be junior fires rather than
   realm-heads, the BELONG precondition may be thinner
   than the count suggests — a canon question, not a
   measurement.

## Proof and landing

- Proof: `scripts/test-havenlink-b-20261124.js` — 15/15
  PASS (14 fixture tests: foreign-primary identification,
  membership listing incl. subordinate-not-in-good-standing,
  BELONG-bar gap decomposition, join-offer classification
  incl. Binding costs, counter terms, subordinate-link
  formation, no-join-path reasons, orphan detection,
  reproduction-field comparison incl. named-field
  divergence; plus the live harness smoke with the
  havenlink fields and wrap restoration). Re-run post-commit
  below.
- Commits (this worktree branch sim-havenlink-b;
  coordinator merges via --ff-only; ready to merge, pending
  ship — no push, no bump, no live verification by this
  worker):
  - `fce99c07a` sim-havenlink-b prereg (before any judged sim)
  - `ae5ee3892` sim-havenlink-b instruments: membership
    census + driver + analyzer + proof 15/15 (zero src/js)
  - (corpus + evidence commits follow)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-havenlink-b*.md`; per-seed JSON
  in `evidence/2026-11-24/perseed-havenlink-b/` (8 files,
  anchor `ae5ee3892ea9`).
- Telemetry deviation check (body step 10): NOT APPLICABLE
  to this corpus shape — the per-seed JSONs are recorder
  rows (top-level `anchorCommit`), and the standing arm
  already established that `telemetry-check.js` refuses
  recorder-corpus input; the scale-wall baseline carries a
  DO NOT compare note for pre-seat substrates. No LOUD line
  fired; no deviation is claimed. The wall numbers above
  are the report.
