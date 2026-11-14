# sim-holdrealm-b — EVIDENCE ("the hold")

Run: `oversight-flesh-out-loop-b` 2130Z, run id `fleshout-loop-b-20261114T2230Z`
Arm: sim-holdrealm-b — DIAG arm: why do realms dissolve after the court, and
why do two never re-climb? Next blank #2 of the 2130Z run; findings-backlog item
"REALMS DISSOLVE AFTER THE COURT".
Branch: `sim-holdrealm-b` (worktree `~/workspace/worktrees/sim-holdrealm-b`).
Date: 2026-11-14. Analyzer: `scripts/analyze-holdrealm-b.js` (report
`evidence/2026-11-14/holdrealm-b-analysis.json`).
Prereg: `evidence/2026-11-14/sim-holdrealm-b-prereg.md` (binding, committed
before any judged analysis run).

## Verdict: GO — 0 UNCLASSIFIED, both re-climb blockers named

**Primary metric (prereg): GO = every one of the 5 confirm-band dissolutions
gets a named mechanism from the recorded per-day series, 0 UNCLASSIFIED; plus
the re-climb blocker named for 100203 and 100212. MET — and exceeded:** the
analyzer found **7 dissolutions** in the confirm band, not 5 (see the count
correction below), and classified **all 7**, plus both pilot-band dissolutions,
0 UNCLASSIFIED. The re-climb blocker is named for 100203, 100212, and the
pilot's 100107.

**No fresh band was run.** Per the prereg, a fresh band runs ONLY if the corpus
cannot answer a dissolution. The corpus answered all of them — running a fresh
band would have been a wasted measurement batch.

## Count correction: the source evidence undercounted dissolutions (5 → 7)

The answercourt confirm evidence said "13 reached national; 8 held it at the
end; 5 dissolved". The per-day series says: **13 reached national; 7
dissolved; 2 of the 7 re-climbed** (100208 back on day 113, 100211 back on day
127), so 8 ended national (6 never dissolved + 2 re-climbed) and 5 stayed
dissolved at the end. The "5" was dissolutions-that-stayed-dissolved, not
dissolutions. The two re-climbs were folded into "held at end" and their
dissolutions were invisible to the end-state count. Every dissolution below
is a series-observed national→regional transition, not an end-state inference.

## Per-dissolution table (confirm band, armed policy)

| seed | national | dissolved | held | mechanism (proximate) | trigger (underlying) | end |
|------|----------|-----------|------|-----------------------|----------------------|-----|
| 100203 | d62 | d90 | 28d | speaker-death | speaker-death-verified | survived d150, never re-climbed |
| 100204 | d68 | d139 | 71d | trust-slide | probable-succession | fell d140 |
| 100206 | d62 | d134 | 72d | trust-slide | probable-succession | fell d137 |
| 100208 | d64 | d101 | 37d | speaker-death | speaker-death-verified | fell d132, **re-climbed d113** |
| 100211 | d63 | d107 | 44d | trust-slide | probable-succession | survived d150, **re-climbed d127** |
| 100212 | d65 | d142 | 77d | trust-slide | probable-succession | survived d150, never re-climbed |
| 100216 | d63 | d97 | 34d | trust-slide | succession-wounded-then-erosion | fell d105 |

Pilot band (secondary check, not in the GO bar): 100106 dissolved d129
(probable-succession), **re-climbed d134** after 5 days down; 100107 dissolved
d138 (probable-succession), survived to d150, never re-climbed.

Mechanism vocabulary is the prereg's: the proximate mechanism is what the
per-day series shows on the dissolution day (a link crossing below the
seasoned trust-40 bar, or a speaker death the same day); the trigger is the
underlying cause the trust deltas + deaths + captured lines support.

## What the engine rule is (read from `src/js/hierarchy.js`)

A link counts toward a polity only when it is **seasoned**: 30+ days old AND
trust 40+ (`_linkSeasoned`). A polity needs Haven + 3 seasoned links (size 4).
When no qualifying polity remains and no beat is pending, `nationalLive`
clears and the realm dissolves aloud (`national_is_a_live_state`). A speaker
death costs **every** link a −8 trust haircut plus a 7-day mourning window
with no trust gains (`successionCrisis`, `succession_is_with_the_village`).
Other decrements: herald strike −5, raid −10, tribute arrears −6/week,
renegotiation push −5, refused primary demand −15. Gains for a seasoned link:
+1/week when its tribute is paid in full, and +4 from a tend — if the policy
tends it at all (see below).

## Finding 1 — a realm has exactly one weak link of slack, and succession spends it all at once

Every realm in this band formed exactly 3 links. The polity tolerates ONE
link below the bar (3 seasoned + Haven = 4 fires) and dies the moment a
second one dips. The succession haircut is **correlated across links**: −8 to
all of them on the same day. So one funeral drops every marginal link at
once, and any realm with two links near the bar dies on the spot:

- 100203 (verified): Arjun died day 89. Emberhold 49→36 (−5 herald that
  night, then −8 haircut), Thornfield 41→33 (−8). Two links under the bar
  the same morning; the realm came apart day 90.
- 100208 (verified): Carlos died day 100; the realm came apart the same day;
  the mantle passed to Dong in the same breath.
- 100204 / 100206 / 100211 / 100212 / 100106 / 100107 (probable): simultaneous
  −8 (or −7, the haircut netted with a same-day +1 tribute tick; or −13,
  the haircut plus a −5 herald strike) on 2–4 links on the dissolution day,
  each aligned with a villager death that day — the succession signature.
  The funeral lines are NOT captured for these (see Finding 4), so this is
  inference from the series, stated as such, not a voiced line.
- 100216 (wounded-then-erosion): Nikos died day 83; all four links took −8.
  The realm did NOT die that day — it limped 14 more days with one link
  below the bar and another sitting exactly at 40, until a −5 push on day 96
  finished the last marginal link. The death set it up; erosion finished it.
  One link (village_1) never recovered: its tribute arrears spiralled to
  103,750 kcal while its trust fell 44→17 — a subordinate whose fields
  cannot pay, falling behind a little every week.

In every case the polity first failed 0–1 days before the dissolution: the
pending global summons bought at most a day of life support. It is not a
real grace period; the realm dies with its polity.

## Finding 2 — re-climb is possible and fast when the village tends; 100203 and 100212 could not tend

Three realms climbed back: 100208 in 12 days with **no tends at all** (the
mourning window passed, weekly +1 tribute gains crept the weakest link from
39 back to 40, the national beat was answered the same day it staged);
100211 in 20 days (3 tends + a feast the day before the answer); 100106 in
5 days (3 tends over 3 days, then the answer). A re-climb needs trust back
to 40+ on every polity link and one answered national beat. That is a small
ask — when it is attempted.

100203 never attempted it. **Zero tendLink calls in the 60 days after the
fall** (its last tend anywhere was day 42), zero pendingNational days, and
its links slid further: 36→21, 41→39, 33→22 by day 150. 100212 the same:
zero tends after the fall, trust 25/28 on the two weak links at day 150 —
and only 8 days of horizon left after a day-142 dissolution, too little for
a re-climb even with tending. 100107 (pilot): 3 tend attempts on day 143,
then nothing; trust 38/23/33 at day 150.

Why no tending? Two corpus facts, both checkable:

1. **The policy tends only unseasoned links.** Every tend in the corpus lands
   on a link with seasoned=0 that day. Once the last link seasons, tending
   stops everywhere — including in healthy villages that never dissolved
   (100201's last tend is day 70, the day its last link seasoned; 100208's
   is day 56). A seasoned link has NO maintenance: its only gains are +1/week
   of tribute paid, against −5 herald / −10 raid / −6 arrears decrements.
   The tend drive is a climb-phase drive, not upkeep. After a dissolution
   un-seasons the links, tending resumes only where the village can pay for
   it (100211: pantry recovered past 21,000 kcal by day 133; 100106: the same
   pattern in the pilot).
2. **100203 and 100212 were too poor to tend.** 100203's pantry never topped
   14,447 kcal in the 60 days after the fall (day 150: 1,400); 100212's never
   topped 8,606. The fall itself impoverishes: three lingering monsters
   gorged 700–1,900 kcal a night off the stores for weeks after the court,
   and raids kept taking more. Dissolution → empty pantry → no tending →
   trust keeps sliding → no re-climb. A poverty trap, not a decision.

The exact tend-gate value in the scaleclimb policy could NOT be verified
from source: the policy files (`scripts/policies/competent-scaleclimb-b.js`,
`competent-answercourt-b.js`, and the answercourt driver) live only on the
killed branch, whose refs are deleted from this repo — the corpus is the
only evidence. The leadcourt code on master gates its own tend on pantry
> 20,000 kcal, which is consistent with the 100203/100212 poverty trap and
with 100211's tends resuming once the pantry recovered; the day-126 tends on
100211 (pantry ~8,000 before a feast + 3 tends spent it to ~1,000) show the
gate is not the whole story, and the count of successful tends
(`capSummary.tends`: 100203: 3, 100212: 8, 100211: 13) against attempted
tends (`verbEvents`: 4, 8, 49) shows most late attempts do not land — a
weekly per-link gate, a pantry gate, or both. The corpus proves the pattern;
the exact gate is an open question for the coordinator (policy source
recovery).

## Finding 3 — the sense gap stands, and the instrument hid most of it

Of the 7 confirm dissolutions, only 2 have a captured dissolution line
(100203, 100208 — both speaker deaths, both voiced beautifully: the funeral,
the mantle passing, the drifting fire, the feed going quiet, the realm coming
apart). The other 5 left **no captured line at all**: the recorder's 600-line
cap was already hit on days 84–108 while the dissolutions fell on days
97–142. The pilot is the same (0/2 lines). The known silence also stands:
no villager anywhere says what Haven did wrong when trust slides — the drift
warnings name the symptom ("their speaker doesn't linger at the gate") and
never the cause. The drift warnings themselves fired on 100203 (2 warnings,
day 89) and 100208 (1 warning) — the voice exists, it just arrives the
morning the realm dies, when it is already too late to tend.

**Recorder fix (this arm, landed in this branch):**
`scripts/linklines-capture.js` (new, shared) + wired into
`scripts/diploverb-driver-20261114.js`. A second, small ring buffer keeps
only the dissolution episode — the dissolution itself, the funeral, the
mantle transfer, the drift warning, the succession leverage — and keeps it
even after the general buffer is full, as an additive `dissolutionLines`
field on the per-seed JSON. The general buffer is untouched (same cap, same
regex). Tests: `scripts/test-holdrealm-b-recorder.js` 19/19 (a dissolution
line pushed after 200 filler lines is retained in the episode ring and
absent from the capped general buffer; the ring keeps the latest 60).
`scripts/test-holdrealm-b-classify.js` 17/17 (speaker-death, trust-slide,
probable-succession, held-realm negative, village-fall negative —
a same-day fall with no crossing classifies UNCLASSIFIED, never trust-slide
— and the re-climb blocker cases). The diploverb driver's own test is green
with the wiring in: §1 static 39/39, §2 game 22/22 (seed 98801, both
policies, 0 instrument errors). The answercourt driver itself could not be
patched — it lives only on the killed branch (see Finding 2).

## Wall numbers (confirm band, 16 seeds × 2 policies)

| | national | table | wins | wave 4 | wave 5 | median survival | max survival |
|--|----------|-------|------|--------|--------|-----------------|--------------|
| armed `competent-answercourt-b` | 13/16 | 0 | 0 | 16/16 | 8/16 | 122d | 150d |
| baseline `competent-scaleclimb-b` | 0/16 | 0 | 0 | 16/16 | 8/16 | 125d | 150d |

(Median survival 122d here vs 121.5d in the confirm evidence — this
analyzer medians `days`; the confirm evidence interpolated. Same picture.)
Held-days for the 7 dissolved realms: 28, 71, 72, 37, 44, 77, 34 (median 44
for terminal dissolutions). No table, no wins on either leg — the wall
past national is untouched by this arm.

## Metric review

1. **The GO bar was met, but its count was wrong.** The prereg said "the 5
   confirm-band dissolutions" on the source evidence's authority. The corpus
   holds 7. The bar as written is met (all 5 named ones classified) and the
   instrument found 2 more and classified them too. Proposed revision for
   the NEXT run: count dissolutions as EVENTS from the per-day series
   (national→regional transitions), never from end-state arithmetic — a
   realm that dissolves and re-climbs is both a dissolution and a hold, and
   end-state counting erases it.
2. **The pending-beat grace is not a metric.** The pending global summons
   bought 0–1 days in all 9 dissolutions. Do not credit it as life support
   in future holding metrics; the polity's first-failure day is the honest
   clock.
3. **The re-climb blocker needs the pantry read alongside it.** "Trust
   below the bar" is the blocker, but on 100203/100212 the reason trust
   could not climb back was poverty (pantry never recovered), and on 100212
   the horizon (8 days) was itself the blocker. Future re-climb metrics
   should carry pantry-at-dissolution and days-remaining as alongside reads.
4. **No metric was re-scored mid-run.** The classification vocabulary is
   the prereg's; the trigger field (speaker-death-verified /
   probable-succession / succession-wounded-then-erosion / slow-erosion) is
   a refinement WITHIN the mechanism, drawn only from the series, and
   "probable-succession" is labelled inference wherever the funeral lines
   are uncaptured.
5. **Canon gap (stated, not invented):** no canon doc covers realm
   holding/dissolution mechanics. `docs/COHERENCE-SPINE.md` does not mention
   realms; `docs/godpath/STEVE-ANSWERS.md` does not answer holding. The
   mechanics above are grounded only in `src/js/hierarchy.js` (header
   comments + `successionCrisis` / `_linkSeasoned` / `_trustDriftWatch`)
   and the corpus. A canon doc for holding is owed if Steve wants the
   rules written down.

## Village assessment (plain words)

Picture thirteen villages that did the hard thing — they became nations.
They held courts, feasted their neighbours, swore oaths. And then, in seven
of them, the nation quietly came apart. Not in a battle, and not because
anyone chose to leave. In two of them a person died — the speaker, the one
who held the bonds — and every bond took the same wound on the same morning,
because grief does not pick favourites. The villages with two friendships
already fraying lost both at once, and a nation built on exactly three
friendships cannot survive losing two. In one village the death left the
nation wounded but standing, and it bled out slowly over two weeks while
nobody tended it, because tending is something the village only does while
it is still climbing. Once you are a nation, nobody tends the bonds anymore
— until they break, and then the pantry is empty from monsters eating the
stores every night, and there is nothing left to tend with. Two villages
did climb back: one because the mourning passed and a week's tribute was
just enough, one because it spent nearly its whole pantry in a day to win
its friends back. The other two are still regional fires, living on, with
friends they no longer trust enough to call a nation — and no one in the
village has ever said aloud what Haven did wrong.

## Findings outside this arm (for the coordinator — NOT edited into sim-findings.md here)

- **No upkeep tending for seasoned links.** The tend drive only fires on
  unseasoned links; once a realm is formed, its bonds receive no
  maintenance (+1/week tribute against −5/−10/−6 decrements). A BUILD
  candidate: upkeep tending (or a lower tend gate for links that
  un-seasoned after a dissolution). Evidence: every tend in the 32-file
  corpus lands on a se=0 link; healthy 100201 stops tending at day 70.
- **The post-dissolution poverty trap.** Lingering monsters gorge the pantry
  nightly after the court; a dissolved village's pantry never recovers past
  ~14k kcal, so the tend gate never opens. A BUILD candidate: the tend gate
  (or a re-climb beat) should not require a full pantry from a village that
  just lost its realm.
- **SUCCPOLITY / SUCCGRACE are env-gated levers for exactly this.** Both
  exist in `src/js/hierarchy.js`, default OFF: a 14-day proving window that
  reads inherited standing instead of the funeral hour's shaken trust, and
  an answerable renegotiation beat for sub-bar links at succession instead
  of the silent verdict. A natural next arm: run one or both against this
  corpus's seeds and measure dissolutions + re-climbs.
- **The scaleclimb/answercourt policy source is unrecoverable from this
  repo** (killed branch, refs deleted). The exact tend gate is an open
  question until the coordinator recovers it.
- **The 600-line cap blinded 5/7 dissolutions.** Fixed for the diploverb
  driver in this branch (episode ring); the answercourt driver cannot be
  patched from here.

## Infrastructure notes

- Write flap: the first `safe-commit.sh` after the prereg hit the known
  index clobber (AGENTS.md 2026-10-22 lesson) — the prereg showed staged-as-
  deleted while the worktree file was byte-identical to HEAD (hash
  a019f309…). Repaired with `git ls-tree HEAD -- <file> | git update-index
  --add --index-info`; verified `git status --short` clean of it and
  `git diff HEAD` empty. The commit itself (4c3ac7d7f) was intact; no work
  lost. Every later write was probe-first (`git update-ref refs/heads/probe
  HEAD`) and verified by size/line count after writing.
- No new sims were run. No game code changed (zero `src/js` diff). All
  analysis is deterministic re-reads of the committed corpus; the analyzer
  re-run reproduces `holdrealm-b-analysis.json` byte-for-byte modulo key
  order (verified by re-running after the final edit: GO=true, same counts).

## Files

- Prereg: `evidence/2026-11-14/sim-holdrealm-b-prereg.md`
- Evidence (this file): `evidence/2026-11-14/sim-holdrealm-b.md`
- Analysis report: `evidence/2026-11-14/holdrealm-b-analysis.json`
- Analyzer: `scripts/analyze-holdrealm-b.js`
- Recorder fix: `scripts/linklines-capture.js` (new), wired into
  `scripts/diploverb-driver-20261114.js` (additive `dissolutionLines` field)
- Tests: `scripts/test-holdrealm-b-recorder.js` (19/19),
  `scripts/test-holdrealm-b-classify.js` (17/17),
  `scripts/test-diploverb-b.js` §1 39/39 + §2 game 22/22
