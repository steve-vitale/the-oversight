# Post-blood killer deaths — DIAG verdict (arm sim-postblood-b)

Run: fleshout-loop-b-20261105T0618Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Instrument-only; ZERO src/js changes, no policy
probe variant, no gate/price/deed/readyDemand change. Prereg:
`evidence/2026-11-05/sim-postblood-b-prereg.md` (committed before any
judged sim). Corpus: `evidence/2026-11-05/perseed-postblood-b/` (16
files, instrument errors 0). Proof: `scripts/test-postblood-20261105.js`
26/26 PASS (fixture + live harness smoke + off/on neutrality leg).
Instrument reused verbatim: `scripts/killerdeath-instrument-20261105.js`.
Analyzer: `scripts/postblood-analyze-20261105.js`.

## Prereg summary

- Fresh band 99171–99186, competent policy verbatim, 150d death-aware
  horizon, 16 seeds (not 8 — the pooled n=16 was thin and this DIAG
  needs killers).
- Primary metric: for every wave-4 killer, days from first blood to
  death + death-cause split (contest/arena vs wild/monster vs
  expedition vs other), plus the show's take rate on fresh killers
  (dead within 7d of first blood) vs the show's take rate on the
  general roster — in SHARE form and in RATE form (show deaths per 100
  fresh-killer-days vs per 100 non-fresh roster-days).
- Verdict rule (pre-registered, ranked): (a) show-preferential iff ≥4
  fresh-killer deaths AND show share ≥2× the non-killer base rate AND
  the rate form agrees (≥2×); (b) wild dominant iff wild/monster is
  the largest cause bucket among fresh-killer deaths AND the show share
  among fresh-killer deaths is <1.5× the base rate; (c) underpowered
  iff fewer than 4 fresh-killer deaths or the two forms disagree.
- Code-read in the prereg (not canon): no `wave4Kill` notability deed
  exists — `wave2Kill`/`wave3Kill` are only added in debug-scenarios,
  never from real kills — so a wave-4 kill cannot raise contest/show
  casting weight. The scholar is taken first when castable regardless
  of deeds, so any show elevation for scholar-killers would ride the
  player slot, not killer status.

## Verdict — (b) WILD EXPOSURE IS THE DOMINANT WINDOW-KILLER

The show took **zero** wave-4 killers on this fresh band. All 9 dead
killers died wild/monster deaths. The pre-registered rule (b) is
implicated on both its legs; rule (a) fails on all three of its legs.

| | fresh band (this run) |
|---|---|
| Wave-4 killers ever | 9 (13 wave-4 kills in 113 wild wave-4 fights) |
| Dead killers (known death day) | 9/9 (0 censored) |
| Kill-to-death median | 9d (range 1–24d) |
| Died within 7d of first blood | 3/9 — ALL wild/monster |
| Died within 1d of first blood | 1/9 — wild (Fatima, d+1) |
| Death-cause split, all dead killers | WILD-MONSTER 9, SHOW 0, EXPEDITION 0, OTHER 0 |
| Show share, fresh-killer deaths | 0/3 = 0% |
| Show share, non-killer roster deaths | 13/242 = 5.4% |
| Show rate, fresh-killer-days | 0 per 100 days (0 deaths / 57 days) |
| Show rate, non-fresh roster-days | 0.11 per 100 days (13 deaths / 11,746 days) |
| Share ratio / rate ratio | 0 / 0 (rule (a) needs ≥2 on both) |

Rule (a) fails: n=3 fresh deaths (<4), share ratio 0 (<2), rate ratio
0 (<2). Rule (b) holds: wild/monster is the largest — the only —
bucket among fresh-killer deaths (3/3), and the fresh-killer show share
(0%) is below 1.5× the base rate (8.1%). The verdict does not rest on
the 7d window alone: at a 3d window, 1 death, 0 show; at a 14d window,
5 deaths, 0 show. No window makes the show appear.

Pooled context (not the judged metric — the prereg judges this band):
prior corpora had 3 show deaths among 11 dead killers (Boris contest
d+1, Marcus arena d+0, Dmitri arena d+11). Adding this band: 3 show
deaths among 20 dead killers (25 killers ever). The fresh band's 0/9
does not erase the prior show deaths, but it does retire the pattern
they suggested: the two day-0/1 show deaths in the pooled data were
the whole "show takes fresh killers FAST" signal, and this band's only
day-0/1 death is wild. The show takes people — 13 times on this band —
but it takes the scholar, not killers (see below).

## The show takes the scholar, not killers (secondary split, pre-registered)

- Non-killer roster deaths: 242 (112 scholar deaths, 130 NPC deaths).
- Show share among non-killer SCHOLAR deaths: 11/112 = 9.8%.
- Show share among non-killer NPC deaths: 2/130 = 1.5%.
- ALL 13 show deaths on the band are scholar deaths (11 'the arena',
  in combat at haven; 2 'contest', not in combat). ZERO NPC show
  deaths — no NPC was taken by the show at all, killer or not.
- The 2 scholar-channel killers (James Okonkwo, gen_qdcthtw) both died
  wild. The show's 13 takes were all non-killers.

Plain words: the show's selection is scholar-first, exactly as the
canon says ("the player is the surest star and is taken first when
castable") — and it is not killer-first. A fresh killer who is an NPC
is invisible to the show; a fresh killer who is the scholar dies in
the wild before the show's turn comes. The contest-shield idea is
dead on this evidence: there is nothing for a shield to block, and
the code-read says there is no notability wire for a kill to trip in
the first place.

## Per-seed table

| seed | days | end | w4 fights | w4 kills | killers ever | living at end | max sim | peak gated | class |
|------|------|-----|-----------|----------|--------------|---------------|---------|------------|-------|
| 99171 | 150 | survived | 5 | 2 | 1 | 0 | 1 | 199 | KILLED-DEAD-KILLER |
| 99172 | 110 | village-lost | 11 | 1 | 1 | 0 | 1 | 175 | KILLED-DEAD-KILLER |
| 99173 | 64 | village-lost | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99174 | 40 | village-lost | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99175 | 134 | village-lost | 11 | 1 | 1 | 0 | 1 | 199 | KILLED-DEAD-KILLER |
| 99176 | 45 | village-lost | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99177 | 97 | village-lost | 13 | 0 | 0 | 0 | 0 | 150 | FACED-NO-KILL |
| 99178 | 138 | village-lost | 9 | 0 | 0 | 0 | 0 | 100 | FACED-NO-KILL |
| 99179 | 115 | village-lost | 13 | 4 | 2 | 0 | 2 | 320 | KILLED-DEAD-KILLER |
| 99180 | 137 | village-lost | 9 | 1 | 1 | 0 | 1 | 150 | KILLED-DEAD-KILLER |
| 99181 | 47 | village-lost | 0 | 0 | 0 | 0 | 0 | 25 | NEVER-FACED-WAVE4 |
| 99182 | 123 | village-lost | 15 | 2 | 1 | 0 | 1 | 199 | KILLED-DEAD-KILLER |
| 99183 | 75 | village-lost | 1 | 0 | 0 | 0 | 0 | 120 | FACED-NO-KILL |
| 99184 | 69 | village-lost | 13 | 1 | 1 | 0 | 1 | 125 | KILLED-DEAD-KILLER |
| 99185 | 83 | village-lost | 12 | 1 | 1 | 0 | 1 | 180 | KILLED-DEAD-KILLER |
| 99186 | 86 | village-lost | 1 | 0 | 0 | 0 | 0 | 125 | FACED-NO-KILL |

4 NEVER-FACED-WAVE4, 4 FACED-NO-KILL, 8 KILLED-DEAD-KILLER. No seed
ended with a living killer. One seed (99179) produced a living pair —
see below.

## Per-killer table

| seed | killer | kills | channel | first blood | death day | k→d | cause (split) | bucket |
|------|--------|-------|---------|-------------|-----------|-----|---------------|--------|
| 99171 | gen_rdlexhi | 2 | npc | d112 | d136 | 24d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99172 | miguel_santos | 1 | npc | d94 | d103 | 9d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99175 | gen_qdcthtw | 1 | player | d125 | d133 | 8d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99179 | james_okonkwo | 3 | player | d89 | d110 | 21d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99179 | thabo_maseko | 1 | npc | d93 | d115 | 22d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99180 | visjoin_96 | 1 | npc | d98 | d102 | 4d | monster:The Reunion | WILD-MONSTER |
| 99182 | gen_n05d0xt | 2 | npc | d58 | d76 | 18d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99184 | gen_uz6zxlw | 1 | npc | d54 | d59 | 5d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |
| 99185 | fatima_hassan | 1 | npc | d78 | d79 | 1d | scholar-death:the wild:at-haven:in-combat | WILD-MONSTER |

Channel mix: player 2, NPC 7. Every killer death is split (0
'wild (unsplit residual)' among killers; 8 split via the playerDeath
wrap, 1 via a monster-threaded fallen entry). Note: several NPC
killers carry a scholar-death split because the mantle later passed
to them — they died AS the scholar, in combat at haven. The split
still says wild combat, not the show.

## The closest seed — 99179: the pair that formed, released, and died facing wave 5

James Okonkwo blooded d89 (The Strike, player), Thabo Maseko d93
(The Strike, companion) — a living pair from d93, engine snapshot
pair day d93, overlapping 18 days. Readiness-5 held at veterans 2
from d93 but ready=false: armored sat at 3 of 4. On d106 armored hit
4, ready flipped true, gated standing jumped 199 → 300, and wave 5
RELEASED (ready days 106–109). Wave-5 fights followed: The Spoiler
d110, The Editor ×5 on d115. James died d110 — the day the Spoiler
was faced, in combat at haven. Thabo died d115 — the day of the
Editor fights, in combat at haven. No wave-5 kills. The village was
lost d115.

This is the first band in this chain where the pair formed AND the
door opened — and the fifth wave killed both veterans at home within
days of release. The readiness gate worked exactly as designed
(armored 3→4 released it); what failed was surviving the facing.
The binding problem after release is wave-5 lethality at haven, not
the show, not the gate.

## Scale-wall numbers (every run)

Wins 0/16. National 0/16. Table 0/16. Wave-4 unlocks 12/16. Wave-4
faced 12/16. Wave-5 unlocks 1/16. Wave-5 faced 1/16. Readiness-5-ready
days: 4 (all on 99179, d106–109). Median survival 91.5 days (15 of 16
villages lost; range 40–150 days). One village survived to the
horizon (99171); four seeds never faced wave 4 at all (died at
40–64 days).

## Village assessment (plain words)

Sixteen villages playing competently. Four die before ever meeting
the fourth draft; four meet it a dozen times and never kill one;
eight blood a fighter — and every single one of those fighters dies
in the wild within three and a half weeks, most of them in about a
week. Nobody is taken by the show. The villages do not lose their
veterans to the cameras; they lose them to monsters, in fights at
their own front door — eight of the nine died in combat at haven,
not out on some far expedition. The one village that finally gets two
veterans alive at once does everything right — gears up, opens the
fifth door — and the fifth wave walks in and kills them both at home
within the week. What is missing is not protection from the show. It
is the ability to survive a wave-4 or wave-5 fight at home: damage,
staying, finishing — the same finishing gap the second-killer arm
named, now with the show ruled out as the thief.

## Sense-testing law (read, not just counted)

- Seed 99185, Fatima (d78–79): coherent and grim. On d78 the System
  celebrates on camera — "Fatima just put down The Strike... on
  CAMERA. That's a veteran kill, folks. REMEMBER the name." — while
  the village is losing people around her (Greta d77, Nina d78). The
  next day Fatima herself is dead in the wild, and the grave ritual
  runs the day after ("That night, they bring Fatima home... the
  filling of it is yours"). The celebration and the burial sit one day
  apart and both read as true. One robotic thread: the Strike's
  SHUTDOWN picket-line beat repeats verbatim 11 times across the d78
  fight (the same repetition secondkiller-b flagged) — a small sense
  flag for that monster's narration, not for the verdict.
- Seed 99179, James (d106–110): coherent. Release on d106 is quiet
  in the transcript (no release beat in the death-say sample), raids
  hammer the pantry nightly, and James's death on d110 gets the full
  ritual — Codex page, grave, keepsakes, and a succession speech at
  the grave naming Thabo ("James trusted them. Give them the fire's
  hearing"). The village then loses Thabo on d115, the day of the
  Editor fights. Caveat: the death-say capture hit its 400-line cap
  on this seed (sayCount 11,141), so Thabo's d115 death lines are not
  in the captured transcript — his death itself is fully recorded in
  `fallen` + the playerDeath wrap (the wild, at haven, in combat).
  Instrument limitation, not a verdict gap.

## Blanks filled or documented

- FILLED (this run): the post-blood show question, as a DIAG verdict
  — wild exposure binds, show-preferential selection is refuted on
  this band (0/9 killer deaths show, both forms agree, robust to the
  3d/14d window cuts). The contest-shield BUILD is not merely
  unproven; it has no target — do not build it.
- FILLED (secondary): the show's selection is scholar-first, not
  killer-first — 13 show deaths, all scholars, 9.8% of non-killer
  scholar deaths vs 1.5% of NPC deaths, 0 NPC show deaths. This
  matches the canon (player taken first when castable) and the
  code-read (no wave-4 notability deed).
- DOCUMENTED (not fixed — instrument-only scope): wave-5 facing
  lethality at haven (99179: both veterans dead within 9 days of
  release, on wave-5 fight days); the Strike SHUTDOWN-beat verbatim
  repetition (11× in one fight); the death-say 400-line capture cap
  truncating late-run death windows on long-lived seeds.

## Named next blank (for the following run)

A FINISHING / wave-5-facing lever, not a show lever and not another
census of killer deaths. The pair formed, the gate released, and the
fifth wave killed both veterans at home — the next arm should test a
finishing or staying lever (the arm-2 damage+staying toggle, or the
finishhold line) on the same band family with wave-5 facing survival
and wave-5 kills as secondaries, gates/prices/deed gates/readyDemand
untouched. The post-blood question is closed unless a future band
shows show deaths among killers again.

## Metric review (per §14)

- The 7d fresh window was the right window: the verdict is identical
  at 3d (1 death, 0 show) and 14d (5 deaths, 0 show). No window
  rescues the show hypothesis.
- 'The wild (unsplit residual)' among killers: 0 — every killer death
  was split (8 via the playerDeath wrap, 1 via monster-threaded
  fallen). No hidden show deaths in the residual.
- Killer scarcity: 9 killers on 16 seeds (0.56/seed) — thinner than
  the pooled prior (16 on 24 seeds) but enough that the 0/9 show
  figure is informative: even the all-dead-killers lens (not just
  fresh) shows zero show takes. The rule-(a) n≥4 fresh-death bar was
  not met (n=3), but rule (b) does not need it, and the wider 0/9
  carries the point.
- Share form and rate form agreed exactly (both 0 for fresh killers).
  No conflict to resolve.
- The analyzer's ratio-against-zero-base guard (a ratio vs a zero
  base is undefined, not a pass) never triggered: the non-killer base
  rate is nonzero in both forms (5.4% share, 0.11/100d rate).
- Death-say capture cap (400 lines) truncated the late-run transcript
  on 99179; future instruments that sense-test long-lived seeds
  should raise the cap or capture per-day windows around killer
  deaths specifically.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: single-arm instrument run, no
Game-root change and no policy variant to compare. No balance-panel
compare exists for it, and none is attached.

## Telemetry deviation check (loop-body step 10)

ATTEMPTED, refused by design: `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-05/perseed-postblood-b/*.json' --metrics
national,table,wins,exiled` exits 2 — "refusing recorder-corpus
input: all 16 --current rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs." Same refusal killerdeath-b hit.
No LOUD line exists to investigate; wall numbers are reported
directly above instead of via a forced flag.

## Infrastructure notes (loud, as required)

- EPERM flap: NO git write failed with EPERM on this arm. The two
  safe-commit runs each produced the known index-clobber pattern
  (committed files showing staged-as-deleted); both repaired the same
  way (`git update-index --add --cacheinfo` from HEAD blobs, verified
  `git status` empty + `git diff HEAD` empty + hash-object matches).
  Prereg commit 05cc5a8ce; instrument commit 3e1bc1268.
- Registry heartbeat: the heartbeat script blocked twice on the
  registry flock (~60s+ each, sibling activity at the time — a
  sibling driver started 08:12Z); the lock was free on retry and the
  heartbeat landed 08:13:26Z. No registry write was lost.
- The first `git status` in the worktree hung ~20s+ (same load window
  as the heartbeat blocks); a retry ran clean. No data lost.
- Judged band ran ~12 minutes for 16 seeds (DRIVER_EXIT=0, 0
  instrument errors on every file). Smoke seeds 99171–99172 reproduce
  their judged results exactly (same days/end/kills), confirming
  determinism.
- No other run's worktree, branch, claim, or lock was touched. Loop A
  arms, held sim-finishhold-b / sim-pantrymealword-a, and main-session
  ability-use work were not duplicated or rebuilt.

## Corpus

Per-seed JSON (16 files): `evidence/2026-11-05/perseed-postblood-b/`
(`postblood-s<seed>-postblood-pilot.json`). Smoke corpus (2 seeds,
NOT judged) was written to /tmp and is not part of the verdict.
Analysis JSON (this run's working copy, not committed):
`/tmp/postblood-analysis.json` — regenerate any time with
`node scripts/postblood-analyze-20261105.js
evidence/2026-11-05/perseed-postblood-b`.
