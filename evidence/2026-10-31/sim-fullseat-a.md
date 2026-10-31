# sim-fullseat-a — full-seat bars reachability census (DIAG ONLY)

Run: Loop A worker, arm sim-fullseat-a, axis scale-onramp, run
fleshout-20261031T1702Z. Sibling Loop B live on food-economy — NOT
touched.
Worktree branch: sim-fullseat-a.
Base anchors: pilot seeds at 5bdc4de74, confirm seeds at f29db07a
(the only difference between the two anchors is this arm's own
prereg-addendum + analyzer commit — zero src/js, zero policy
changes — so the band is one base for trajectory purposes; see
Determinism leg).
Pre-registration: evidence/2026-10-31/sim-fullseat-a-prereg.md
(written BEFORE any judged sims; one addendum appended before
confirm spend and before any verdict — the interim-holder cc3 rule,
see Instrument).
Instrument: combined sweep scripts/fullseat-sweep-20261031.js
(regtable-diag + vet2-diag + wavegate-diag + fullseat-diag, all
reused UNCHANGED) + scripts/fullseat-split-20261031.js +
scripts/fullseat-analyze-20261031.js + scripts/fullseat-det-compare-20261031.js.
Proof: scripts/test-fullseat-20261031.js — 180 checks green
(synthetic + corpus legs re-deriving every band gate from the
judged corpus).
Corpus: evidence/2026-10-31/perseed-fullseat/leadfeast/s<seed>.json
(19 seeds, all non-empty) + evidence/2026-10-31/fullseat-analysis.json
(analyzer output) + raw stdout records fullseat-pilot.jsonl /
fullseat-confirm.jsonl (+ .log files).
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after comparison exists in this arm; none fabricated (same
declaration as vet2-a/regtable-a). The det leg compares recorder-on
vs recorder-off trajectories of the SAME stack; it is a neutrality
proof, not a panel comparison, and its numbers never enter the
census tables.

## Verdict: DIAG-GO

Judged exactly against the prereg's band verdict:

- Usable judged seeds: 19/19 (pilot 8 + confirm 11, the prereg's
  fixed band — no band-shopping, no substitutions).
- Recorder errors 0 on all 19 seeds (wavegate errs, vet errs,
  regtable errs, capture errs all 0). Cross-checks (i) tableDay
  regtable-vs-wavegate derivation, (ii) det-gate, (iv) derived vs
  engine unlockedWave pass on 19/19; (iii) capture-vs-log passes
  on 19/19; capture-vs-census mismatches (16 kills on 9 seeds) are
  ALL explained under the prereg's addendum rule (both capture
  scholar reads agree; prior-row or interim-holder succession
  shape; every mismatched kill wave <= 3 and no wave-3 mismatched
  killer is a vet5 holder — so no census number moves either way
  any of them is keyed; see Cross-check adjudication).
- Det-gate PASSED: recorder ON vs OFF on 87109 and 87135 —
  dayHash arrays byte-identical (145 vs 145; 144 vs 144) and end
  fields identical (gameDays, won, national, table, maxWave,
  endScaleRank, endReason) on both seeds.
- Determinism leg PASSED: judged 87107 JSON is byte-identical to
  its scratch re-run (208,300 bytes, `cmp` clean). 87115 and 87138
  re-runs are trajectory-identical to their judged JSONs except
  the single anchorCommit stamp line, which moved because this
  arm's own instruments-only commit landed between the pilot run
  and the re-runs (see Determinism leg — the stamp is metadata,
  not trajectory).
- Verdict sections (a) full seat reachable or not, with seed/day
  evidence, (b) the binding bar in plain words with the distance
  on the closest seeds, and (c) whether the 87109/87135 stories
  reproduce and whether either is a full-seat near miss, are all
  stated below.

## Answer in one paragraph

(a) The full seat is NOT reached on any seed on this stack: 0/19
hold a full seat on any day (firstFullDay null everywhere), while
16/19 reach the table and all 16 sit in the LESSER seat. (b) The
binding bar is ONE bar, and it is the same bar from both ends of
the chain: the deed side needs 2 distinct wave-5 monsters fought
and every seed has 0, because wave 5 never unlocks (0/19); wave 5
never unlocks because the village's standing is held at 199 — one
point under the 200 bar — by the wave-5 readiness deferral
(defer5), whose ONLY short bar on the two closest seeds is
veterans: 1 living wave-4+ killer against a demand of 2. The two
closest villages in the whole band (87132, 87138) meet EVERY other
full-seat bar on a single day — waves 1–4, contests, crises,
stage, food deeds, national/global scale — and are blocked by
exactly the missing second veteran, which is also the missing
wave-5 unlock, which is also the missing w5 deed bar. One
veteran short, three ways of saying it. (c) The 87109/87135
stories reproduce on this base but neither is a full-seat near
miss: 87109 is a no-SEAT story (w3 2/4 at its best, one short of
even the lesser bar, despite touching global rank), and 87135 is
a no-seat story on food deeds + zero wave-4 fights.

## Plain-words verdict (for the executive update)

A village can earn the lesser seat, win the game through it, and
still never sniff the full seat — not because it is small, poor,
or unready in general, but because the full seat's last door needs
two living heroes who have each killed a wave-4 monster, and no
village on this band ever holds two at once. The game already
tells the village it is one veteran short (the defer5 beat), but
the table's own audit never names the price: the two closest
villages sit down, hear an honest lesser-seat audit, win — and
never learn that two wave-5 fights stood between them and the
full seat. The full seat is reachable in principle (every other
bar is met on real seeds) and unreachable in practice on this
stack until a village can make — and keep alive — a second
wave-4 killer.

## Wall numbers (judged band, this base)

Ever-national/global 15/19; table 16/19 (all lesser); won 15/19
(all lesser); wave 4 unlocked 12/19; wave 5 unlocked 0/19; full
seat 0/19; median survival 90 days; max 197 days. These match the
vet2/regtable bands on their bases closely (national 14–15/19,
table 16/19, wins 15/19) — the band did not drift wildly onto
this base, and the full-seat zero is stable across three bases
now, not a one-base artifact.

## Per-seed census table

Table = first table day (first daily row with tableWaiting or
tableDone); seat/rank AT table day; full@table = deedGateReady
components at table day (w1/w2/w3/w4/w5, contests/crises, stage,
food, scale); maxVec = per-component MAX over all daily rows;
bindMax = binding bars at maxVec; shortMax = total shortfall at
maxVec; closestDay = the single day minimizing shortfall (on
every seed here the closest day's vector EQUALS the max vector —
there is no simultaneity gap anywhere on the band: the max vector
is a day the village actually lived).

| Seed | Table | Seat@table | Rank@table | full@table w1/w2/w3/w4/w5 c/cr st food scale | maxVec w1/w2/w3/w4/w5 c/cr st food scale | bindMax (short) | Closest day (bind, short) | End |
|---|---|---|---|---|---|---|---|---|
| 87103 | — | none | — | — | 11/2/0/0/0 6/3 st3 Y N | w2,w3,w4,w5,scale (13) | d60 (same, 13) | lost 60, regional |
| 87104 | 159 | lesser | global | 14/5/3/0/0 17/4 st3 Y Y | 14/5/3/0/0 17/4 st3 Y Y | w3,w4,w5 (6) | d159 (same, 6) | won 159, global |
| 87107 | 60 | lesser | regional | 16/7/3/0/0 5/3 st3 Y N | 17/8/6/0/0 10/3 st3 Y Y | w4,w5 (5) | d90 (same, 5) | won 90, global |
| 87109 | — | none | — | — | 15/9/2/5/0 14/3 st3 Y Y | w3,w5 (4) | d145 (same, 4) | lost 146, regional* |
| 87115 | 87 | lesser | global | 13/6/4/0/0 9/3 st3 Y Y | 13/6/4/0/0 9/3 st3 Y Y | w4,w5 (5) | d90 (same, 5) | won 90, global |
| 87119 | 64 | lesser | regional | 10/5/3/0/0 3/3 st3 Y N | 10/6/4/1/0 6/3 st3 Y Y | w4,w5 (4) | d90 (same, 4) | won 90, global |
| 87120 | 90 | lesser | global | 19/13/3/2/0 3/2 st3 Y Y | 19/13/3/3/0 4/2 st3 Y Y | w3,w5,crises (4) | d103 (same, 4) | won 103, global |
| 87121 | 75 | lesser | regional | 15/8/3/0/0 9/2 st3 Y N | 15/9/3/0/0 9/2 st3 Y Y | w3,w4,w5,crises (7) | d90 (same, 7) | won 90, global |
| 87123 | 104 | lesser | global | 11/9/3/0/0 15/3 st3 Y Y | 11/9/3/0/0 16/3 st3 Y Y | w3,w4,w5 (6) | d110 (same, 6) | won 110, global |
| 87124 | 47 | lesser | regional | 17/8/3/0/0 2/3 st3 Y N | 18/9/5/0/0 7/3 st3 Y Y | w4,w5 (5) | d92 (same, 5) | won 92, global |
| 87126 | 57 | lesser | regional | 18/4/3/0/0 5/3 st3 Y N | 19/6/5/0/0 8/3 st3 Y Y | w4,w5 (5) | d90 (same, 5) | won 90, global |
| 87127 | 127 | lesser | global | 15/7/3/0/0 9/4 st3 Y Y | 15/7/3/0/0 9/4 st3 Y Y | w3,w4,w5 (6) | d127 (same, 6) | won 127, global |
| 87128 | 50 | lesser | regional | 17/4/4/0/0 5/3 st3 Y N | 18/5/6/2/0 8/3 st3 Y N | w4,w5,scale (4) | d91 (same, 4) | won 91, regional |
| 87132 | 59 | lesser | regional | 16/8/3/0/0 2/3 st3 Y N | 16/8/7/3/0 6/3 st3 Y Y | w5 (2) | d90 (w5, 2) | won 90, global |
| 87134 | 73 | lesser | regional | 9/7/3/0/0 4/3 st3 Y N | 9/7/4/0/0 7/3 st3 Y N | w4,w5,scale (6) | d90 (same, 6) | won 90, regional |
| 87135 | — | none | — | — | 18/11/5/0/0 22/3 st3 N Y | w4,w5,foodDeeds (6) | d144 (same, 6) | lost 144, national |
| 87137 | 80 | lesser | regional | 20/6/3/1/0 8/4 st3 Y N | 20/6/6/1/0 11/4 st3 Y N | w4,w5,scale (5) | d89 (same, 5) | lost 89, regional |
| 87138 | 47 | lesser | regional | 16/4/4/0/0 3/3 st3 Y N | 17/5/5/4/0 9/3 st3 Y Y | w5 (2) | d90 (w5, 2) | won 90, global |
| 87140 | 197 | lesser | national | 25/9/5/0/0 24/3 st3 Y Y | 25/9/5/0/0 24/3 st3 Y Y | w4,w5 (5) | d197 (same, 5) | won 197, national |

\* 87109's day-145 daily row shows rank global, but the post-run
endScaleRank reads regional — the village lost on day 146 and the
post-run rank read differs from the last daily row. The daily row
is the measurement; the end rank is the post-loss read. It does
not move any verdict (87109 holds no seat at either rank: w3
2/4 fails the lesser bar too).

Reading the table: w5 is binding on 19/19 max vectors (0/2
everywhere — wave 5 never unlocks, so no village can fight a
wave-5 monster at all). Scale binds only on 87103, 87128, 87134,
87137 (villages that end below national); foodDeeds binds only on
87135. Every other bar is met on at least one seed's max vector,
and on 87132/87138 ALL of them are met at once except w5.

## The two closest villages (single-bar near misses)

- 87132: table day 59 (lesser, regional). By day 90 (win day) the
  vector is 16/8/7/3/0, contests 6, crises 3, stage 3, foodDeeds
  true, scale global — every full bar met except w5 0/2. Its one
  wave-4 kill: Nino (companion, influencer, day 69, the wave-4
  unlock day itself). Nino holds vet5 days 69–90 (22 daily rows,
  the longest vet5 tenure on the band) and is alive at the win —
  but alone. The wave-4 deed bar (3 distinct) is met by fought
  monsters (3), not by kills: the village fought 3 distinct wave-4
  monsters while killing only 1.
- 87138: table day 47 (lesser, regional). By day 90 (win day) the
  vector is 17/5/5/4/0, contests 9, crises 3, stage 3, foodDeeds
  true, scale global — every full bar met except w5 0/2. Its one
  wave-4 kill: Daniyar (scholar, influencer, day 82 — the day the
  mantle passes to him; see Sense test). Daniyar holds vet5 days
  82–90 (9 rows), alive at the win — but alone.

On both seeds the full seat is exactly one veteran away, and the
deed side and the readiness side agree on which veteran: the
wave-5 readiness row (rd5) on day 90 reads short ["veterans"]
only — armor 5–6/4, armed 8/6, tricks 21/17 vs 3, veterans 1/2.

## Veterans census (the binding bar, measured directly)

Maximum living wave-4+ killers held on any day, and for how long:

| Seed | Max living vet5 | Held (days, rows) | Holder(s) | Wave-4 kills (kill-time-keyed) | Wave-5 kills |
|---|---|---|---|---|---|
| 87132 | 1 | 69–90 (22 rows) | Nino (companion) | 1: Nino, influencer, d69, companion | 0 |
| 87138 | 1 | 82–90 (9 rows) | Daniyar (scholar) | 1: Daniyar, influencer, d82, scholar | 0 |
| 87120 | 1 | 76–87 (12 rows) | Caleb (scholar) | 1: Caleb, strike, d76, scholar | 0 |
| 87109 | 1 | 136–137 (2 rows) | Daniyar (scholar) | 1: Daniyar, suburb, d136, scholar | 0 |
| other 15 | 0 | — | — | 0 | 0 |

Band totals: 4 wave-4+ kills in 19 runs (3 scholar, 1 companion,
kill-time-keyed, both writers captured); 0 wave-5 kills; 0 seeds
ever holding 2 living vet5s; 0 seeds ever showing rd5 veterans
>= 2 on any daily row. Veteran mortality is NOT the driver here
the way vet2-a framed it: of the 4 vet5s, 2 survive to their
wins (Nino, Daniyar-87138) and 1 (Caleb) dies 15 days before a
win the village reaches anyway — the second veteran was never
MADE, not lost, on every seed. The kill rate is the gap: 4
wave-4 kills in 19 runs, and the 15 vet5-less seeds include the
197-day winner (87140, zero wave-3+ kills in 197 days) and the
longest unwon runs.

Note the w4-deed vs w4-kill distinction this census proves:
87132 fought 3 distinct wave-4 monsters (deed bar met) with 1
kill; 87138 fought 4 with 1 kill; 87109 fought 5 with 1 kill. The
deed bar counts FOUGHT monsters; the readiness bar counts LIVING
KILLERS. A village can satisfy the deed bar while failing the
readiness bar by 1 veteran — which is exactly what the two
closest seeds do.

## The wave-5 unlock chain (why w5 is 0 everywhere)

Standing gate (src/js/standing.js villageStandingTotal):
capped standing >= 200 with readiness unmet holds the gated total
at 199 (t5-1). Wave 5 needs gated standing >= 200 AND wave-4
faced (docs/MONSTER-WAVES.md). On this band:

- 12 wave-4 seeds: gated standing reaches 199 on 11 of them (all
  except 87128, peak 195); on 10 it is still held at 199 on the
  last row (defer5 hold: 87104, 87107, 87119, 87120, 87121, 87123,
  87132, 87135, 87137, 87138), while 87109 ends released4 with
  gated standing fallen to 175 as the village collapses.
  Standing raw reaches 507 (87104) — the cap/deferral, not the
  earning, is what holds it at 199.
- rd5 short bars on the last row: ["veterans"] alone on 15/19
  seeds; veterans is short on ALL 19 last rows. No seed ever
  shows rd5 veterans >= 2 on any day.
- 7 wave-3-or-lower seeds (87103 uw 2; 87115, 87124, 87126, 87127,
  87134, 87140 uw 3): defer4 holds (wave-4 readiness, also
  veterans-short on the last row for the wave-4 bar's demand of
  1 — rd4 veterans 0 on those seeds' last rows except where the
  gate already passed).

So the chain is a single loop, not three separate walls: too few
wave-4 kills → no second living veteran → wave-5 readiness fails
→ standing held at 199 → wave 5 never unlocks → no wave-5
monsters exist to fight → w5 deed bar stays 0/2 → full seat
blocked. Breaking any one link breaks the loop, but no link is
broken by longer survival alone: the 197-day winner never made a
wave-3+ kill, and the 146/144-day unwon runs never made a second
wave-4 kill.

## The 87109 / 87135 stories (re-measured, not assumed)

- 87109 DOES reproduce as a no-seat story on this base, with the
  same shape as regtable-a: global rank touched (day-145 daily
  row), 14 contests, 3 crises, stage 3, food deeds banked, 5
  distinct wave-4 monsters fought — but w3 2/4 at its best (2/3
  against the lesser bar): one distinct wave-3 fight short of
  ANY seat, let alone the full seat. Its binding set at closest
  approach is [w3, w5], shortfall 4 — NOT a full-seat near miss
  (two bars, and the w3 bar blocks the lesser seat first). It
  dies village-lost day 146. Its one vet5 (Daniyar, suburb, day
  136) lives 2 days and dies unreplaced — the band's shortest
  vet5 tenure, and the only vet5 death on the band.
- 87135 DOES reproduce as a no-seat story on this base, with the
  same shape as regtable-a: national rank, waves 18/11/5, 22
  contests, 3 crises, stage 3 — but foodDeeds false alone blocks
  the lesser seat, and w4 0/3 blocks the full seat further. Its
  binding set at closest approach is [w4, w5, foodDeeds],
  shortfall 6 — NOT a full-seat near miss. It dies village-lost
  day 144, never making a wave-4 kill despite unlocking wave 4
  (day 135 per vet2-a; wave-4 faced false on this base's last
  row — it unlocked wave 4 and never faced one before dying).
  The day-135 Maeve succession case reproduces exactly (see
  Cross-check adjudication).

## Sense-testing read (SENSE-TESTING LAW)

Near-miss seed 87138, scratch say()-probe (NOT judged corpus —
end fields verified identical to the judged 87138: 90d, won,
table, global; 9,482 narration lines captured, 61 table-needle
hits, other tables filtered by reading).

- Day 47 (table day): Viola to Tom, by the fire: "The table's
  set. The ring of pale light — it's just sitting there.
  Waiting on them. What do you think they'll tell it?" — the
  village gossips about the table like people, the day the
  lesser seat is earned. No System announcement yet; the
  invitation is real (tableWaiting from day 47) and unannounced
  for 30 days.
- Day 77: the System: "There's a table, little fires. A big one.
  Far away. And it is LOOKING at you." Day 78: "You are not at
  the table yet. But the table has your name now." — the same
  teaser shape as regtable-a's 87107 (there 18 silent days;
  here 30).
- Day 82: "You wake up somebody else. Daniyar Askarov, 33 — a
  paramedic." — the succession the census measures: Daniyar
  takes the mantle and the same day lands the influencer kill
  that makes him the village's only vet5. The fiction marks the
  changing of the guard; nothing marks that he is now the
  village's only blooded wave-4 killer, or that one more like
  him is what the next door needs.
- Day 90 (sitting): "THE TABLE IS SET. A ring of pale light
  waits — take your seat from Haven when you are ready.
  Nothing is final until you sit." Then the audit, which is
  honest about what was faced and silent about what was
  missing: "A lesser seat — global standing, waves 1–3 faced
  (17/5/5), with 4 wave-4 fought, 9 contests survived, 3 crises
  weathered. The table does not rise. It prices." Those counts
  match the judged closest-day vector exactly (17/5/5/4, 9, 3).
  Then the Feared path plays and: "You won. Say it plainly: you
  won. The village endures. The table signed."

Judged on meaning: the lesser-seat audit tells the truth about
the run, but the full seat's price is never spoken — not at the
table, and (from the census) not in the defer5 beats' veteran
count in a form the village can act on at sitting time. A
village that wins lesser never learns it was one veteran short
of full; it learns only that the table priced it. That is a
voicing gap worth a note (Steve-call if the audit should name
the full-seat distance), not a verdict-changer: the gate counts
are correct, the seat is correct, and the win is real.

## Cross-check adjudication (cc3 — read, not smoothed)

16 capture/census mismatches on 9 seeds. Every one satisfies the
prereg addendum rule: (i) both capture scholar reads agree
(Game.villagerId == state.scholar.villagerId at the kill moment);
(ii) prior-row succession shape, or the interim-holder shape
(87109 day 81 — see below); (iii) the kill moves no census
number (all are wave 1–2, except one wave-3 kill whose killer
never becomes a living veteran). The proof test re-derives (i)
and (iii) mechanically for every mismatch (180/180 green).

- 87135 day 135 (x3: spool w3, giant_mosquito w2, mirrormoth w1):
  the vet2-a exception, reproduced exactly — Maeve kills as
  scholar and dies the same day; Emma holds the mantle by the
  daily row. The exact capture wins; Maeve's w3 kill is
  scholar-keyed and she is never a living veteran either way.
- 87109 day 81 (cliffhanger w1, via companion): the interim-holder
  variant that prompted the addendum — kill-time scholar
  gen_xv4uwtn (both reads agreeing) never appears on any daily
  row; the daily series churns Leo (79) → Lucas (80) → Maya
  (81) → Daniyar (82), so the mantle passed twice within day 81
  and the interim holder is invisible to daily snapshots. Wave-1
  kill: moves nothing.
- 87138 day 82 (nightcourt w1, via companion): Alan holds the
  mantle at the kill moment; Daniyar holds it by the daily row
  (and lands the influencer w4 kill the same day, scholar-keyed
  on its own capture). The nightcourt kill's keying (companion)
  does not touch the w4 kill's keying (scholar).
- All other mismatches (87103 d40, 87107 d54, 87109 d145, 87119
  d58, 87123 d8, 87134 d61 x3, 87137 d67/d79): prior-row
  succession shape, both reads agreeing, waves 1–2 — the same
  class, no census effect.

The analyzer's machine check (prior daily row scholar == capture
scholar) cannot see interim holders; that blind spot is the
addendum's instrument note, not a new mechanism. Future kill
censuses should expect interim-holder mismatches wherever the
mantle churns fast, and should keep the exact capture primary.

## Det-gate + determinism leg (trajectory neutrality, prereg requirement)

- ON vs OFF on 87109 and 87135 (same stack, same seeds, scratch
  dirs, never the judged corpus): hashes IDENTICAL (145 vs 145;
  144 vs 144) and end fields IDENTICAL (gameDays, won, national,
  table, maxWave, endScaleRank, endReason) on both seeds.
  DET-GATE PASSED. The regtable + vet2 layers + kill capture do
  not move trajectories.
- Determinism leg: judged 87107 JSON is BYTE-IDENTICAL to its
  scratch re-run (208,300 bytes, `cmp` clean). 87115 and 87138
  re-runs differ from their judged JSONs in exactly ONE line:
  the anchorCommit stamp (5bdc4de7400a judged vs f29db07abae7
  re-run) — because this arm's own instruments-only commit
  (prereg addendum + analyzer closest-day field; zero src/js,
  zero policy changes) landed between the pilot run and the
  re-runs. The stamp is metadata, not trajectory: every other
  byte is identical. The judged corpus therefore carries two
  anchor stamps (pilot seeds 5bdc4de74, confirm seeds f29db07a)
  for one trajectory base; the proof test pins both stamps as
  known arm anchors.

## Instrument (what was built)

- NO new recorder policy file: regtable-diag, vet2-diag,
  wavegate-diag, fullseat-diag reused UNCHANGED. The sweep
  composes them (regtable outside vet2 outside wavegate outside
  fullseat), copies vet2's both-writers kill capture verbatim,
  installs say captures wavegate-first then regtable (as in
  regtable-sweep), and snapshots the fullseat ctx summary
  (max reach, first full/lesser day, win snapshot) that
  fullseat-diag keeps on runDays' ctx rather than a store.
- Analyzer additions over the prior arms: per-component max
  vector + binding/shortfall at max, closest single day (min
  shortfall) with its vector — which proved the no-simultaneity-
  gap finding (closest day == max vector on all 19 seeds) — plus
  vet5 spans, kill-time-keyed w4/w5 kills by killer, and the
  cc1/cc2/cc3/cc4/cc5 cross-checks.
- Runner discipline kept: stdout-runner + idle splitter
  throughout, foreground exec, stdout→file + stderr→file, never
  a backgrounded pipe; judged corpora never staged in /tmp.
  Scratch dirs (scratch-fullseat-det/, scratch-fullseat-det2/,
  scratch-fullseat-transcript/) are deleted before commit; the
  transcript probe script itself is committed so the sense read
  is reproducible, with its scratch-only status in its header.

## Metric review (for the NEXT run — mandatory section)

1. The max-vector definition (per-component max) vs the
   closest-day definition (best single day) gave IDENTICAL
   verdicts on all 19 seeds — the simultaneity worry was real
   as a question and empty as a finding on this band. Next arm:
   keep both (the equality itself is evidence), but the
   closest-day field is the one to quote for "best day lived."
2. The cc3 machine check's blind spot (interim holders) is now
   documented with a rule (addendum). Next arm: pre-register
   the interim-holder class from the start, and have the
   analyzer flag (not auto-fail) both shapes with the
   both-reads-agree + moves-no-number adjudication.
3. The anchor-stamp lesson: committing between a judged run and
   its determinism re-run breaks literal byte-identity on one
   metadata line. Next arm: run the determinism leg BEFORE any
   intermediate commit, or pin the determinism seed to the
   confirm batch (whose anchor is stable at re-run time, as
   87107 proved).
4. cc2 (capture vs log) passed cleanly on 19/19 with both
   writers wrapped — the vet2-a pyrrhic lesson holds. The
   dedupe counts (e.g. 87140: 27 calls → 20 log entries) confirm
   the exact-duplicate collapse is still load-bearing.
5. The fullseat ctx snapshot (max.standing) is what exposed the
   199 cap band-wide; future wave-5 arms should read rd5
   readiness bars + gated standing together from the start —
   the deed bar alone understates the chain by one link.

## Backlog items (for the coordinator — NOT chased mid-run)

1. The loop, stated once: wave-4 kill rate → second living
   veteran → wave-5 readiness → standing 199 → wave-5 unlock →
   w5 deed bar → full seat. The next arm that wants the full
   seat measured needs a stack or band where a second wave-4
   kill happens — either a longer-lived band that doesn't win
   at 90, a stack that fights wave-4 monsters more (the
   wave3enc finding was fled, not avoided — field fights never
   kill wave-3, and the same question is open for wave-4), or a
   build arm that changes the kill rate. Measuring the full
   seat again on the same win-at-90 stack will reproduce this
   zero.
2. Audit voicing gap (Steve-call if narration changes): the
   day-90 lesser audit never names the full-seat distance (one
   veteran / two wave-5 fights on the closest seeds). The defer5
   beat names the veteran count during the run; the sitting
   does not close that loop.
3. The 30-day unannounced-invitation window on 87138 (table day
   47 → first System mention day 77) extends regtable-a's 18-day
   note on 87107 — the silence scales with how early the seat
   is earned, not with the seat type.
4. End-rank vs daily-row rank divergence on village-lost seeds
   (87109: global on the day-145 row, regional post-run): worth
   one line in the next arm's prereg about which rank read is
   authoritative for wall numbers (this arm uses daily rows for
   ever-national and post-run reads for end rank, and says so).

## Files

- Prereg: evidence/2026-10-31/sim-fullseat-a-prereg.md
- Evidence (this file): evidence/2026-10-31/sim-fullseat-a.md
- Corpus: evidence/2026-10-31/perseed-fullseat/leadfeast/s<seed>.json
  (19 seeds)
- Analysis: evidence/2026-10-31/fullseat-analysis.json
  (pilot-only analysis superseded: fullseat-analysis-pilot.json,
  retained for the pilot-gate record)
- Raw stdout records: evidence/2026-10-31/fullseat-pilot.jsonl,
  fullseat-confirm.jsonl (+ .log files)
- Sweep / splitter / analyzer / det-compare / probe:
  scripts/fullseat-sweep-20261031.js,
  scripts/fullseat-split-20261031.js,
  scripts/fullseat-analyze-20261031.js,
  scripts/fullseat-det-compare-20261031.js,
  scripts/fullseat-transcript-probe-20261031.js
- Proof: scripts/test-fullseat-20261031.js (180/180)
