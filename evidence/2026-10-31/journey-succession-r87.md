# Journey succession r87 — WEEK-1 DRIVEN NAMING (lane B, 2026-10-31)

Leg 7 (succession). Prereg: evidence/2026-10-31/journey-succession-r87-prereg.md
(committed BEFORE any seed run, 4055b3ca4). Instrument only, zero src/js.
Base: master 0fe9bc4ee. Seeds 26151–26156, competent policy, POST_DAYS=70,
EARLY_KILL_DAY=40. 26151–26153 chain-forced (20/20/10/10 dplus), 26154–26156
controls. This run executes r86's unrun prereg (r86 wrote the prereg but
never played; its driver/analyzer copies were 0-byte flap losses, rebuilt
here from r83 master files + r86's intact scorer/test).

## Headline

Week-1 naming REPRODUCES r83 EXACTLY, seed by seed: pooled 8/28
transcripts naming, per-seed 2/5, 1/4, 1/5, 1/5, 0/5, 3/4. Zero
trajectory drift on this question despite r85 (betrayal) + deadfall
landing between r83's base and this base. The 26155 silence reproduces
too — and is now explained, not just observed. No code change needed;
the finding is measurement, documented for tackle-succession.

## WEEK1-NAMING (reported, not pass/fail — prereg interpretation met)

Prereg bar: naming on ≥5/6 seeds with ≥1 = consistent acknowledgment.
Result: 5/6 seeds name (only 26155 silent). Interpretation: consistent,
variance is draw-level.

| seed | dead first bearer | named/total | lately+mourning draws | naming lines |
|------|-------------------|-------------|-----------------------|--------------|
| 26151 | Sierra | 2/5 | 2 | 2 |
| 26152 | Violet | 1/4 | 2 | 2 |
| 26153 | Jorge | 1/5 | 1 | 1 |
| 26154 | Nancy | 1/5 | 1 | 2 |
| 26155 | Marta | 0/5 | 1 | 0 |
| 26156 | Natalie | 3/4 | 2 | 5 |
| pooled | | 8/28 | 9 | 12 |

Of 9 lately+mourning draws, 7 produced grief naming and 2 produced
gossip (Tomas d+7 on 26152: White Noise naming debate; Denise d+7 on
26155: Murkcap naming debate). No collisions (dead first name never
shared with a living partner). No missing transcripts, dead names all
resolve — WEEK1-READABLE holds on 6/6.

## Mechanism inventory (sense-confirmed per naming line)

Naming lines by mechanism (12 total):
- Lately-pool grief lines: 6 (Landon d+3 "Since Sierra died..."; Tomas
  d+3 "Violet owed me a favor..."; Sizwe d+7 "I dreamed Jorge was still
  here..."; Adaeze d+7 "I dreamed Nancy was still here..."; Scarlett
  d+3 "Natalie always took the burnt piece..."; Oliver d+7 "Natalie
  owed me a favor...").
- Mourning-event lines: 1 (Kate d+7 "Sierra is gone and the world
  just... continues.").
- Lately-continuation lines via more/react: 3 (Tomas d+3 "I keep
  turning over the last thing Violet said..."; Adaeze d+7 "Nobody says
  Nancy's name right yet..."; Scarlett d+3 "I keep turning over the
  last thing Natalie said..."). A lately draw yields a grief line AND
  a follow-up grief line across the more/react chain — the draw is
  the unit, the line count is not.
- Resumed-topic grief lines: 2 — NEW to the inventory. Scarlett d+7
  on 26156 opens by resuming the d+3 thread left mid-thought 4 days
  earlier ("We never finished talking about what's been happening"),
  and its more/react continuations name Natalie twice ("The fire
  feels smaller without Natalie." / "I tend the fire without being
  asked for Natalie, now."). No lately/mourning draw in that
  transcript (lately=0, mourning=0). The resumed "what's been
  happening" topic is a fourth naming channel, worth preserving.
  (r83's count-only baseline could not have split this out.)

## SILENCE REPRODUCTION: 26155 explained

26155 repeats silent on current master: 0/5, dead Marta, high-trust
partners 90/91, bond-partner Adaeze (depth 2, v 64) never naming her.
Mechanism, from the full transcript read: 4 of the 5 transcripts never
draw lately/mourning at all (their subjects are beliefs, alien food,
hunger skill, naming-debate event, goals/expedition asks), and the
single draw (d+7 Denise ask:lately) returns Murkcap naming-debate
gossip — the same gossip outcome r83's baseline recorded. So the
silence is draw ABSENCE plus one gossip draw, not a grief gate, not a
trust gate (trust 90/91 partners stay silent; trust 53–61 partners
name on other seeds), and not a bond gate (the depth-2 bond partner
is among the silent). Per the prereg's pre-declared interpretation
this is a variance finding for tackle-succession, never a game-bug
claim: want-driven convos are by design, and the driven subjects
that week simply did not ask "lately."

## Carried regression bars (all PASS)

- CHAIN5-READABLE: 3/3 forced seeds, full fifth handoff (relPre5 +
  relPost5 + fifthDeath lin+mo). Fifth deaths: 26151 Kate→Pavel
  (d+10 since 4th, d+61 since 1st), 26152 Yuki→Fritz (d+60 since 1st),
  26153 Mia→Klaus (d+60 since 1st).
- CHAIN5-BONDS: fifth-successor bonds survived 31/31 (r83: 31/31),
  affinityDiff5 = 0 on all three forced seeds.
- DEATH-LEDGER: every chain death cause-known (7/7, 5/5, 4/4, 0, 0,
  2/2); no lineage fallback. Organic causes are honest and specific
  (contest, the night, a stranger, dehydration).
- CARRIED: C1v3 missing = [] on all seeds; S1 missingExact = 0 on all
  seeds; MG2v2 violations = 0; M1/M4 true on all seeds; M3v2b ≥2 on
  5/6 seeds (26155 control at 1 — the prereg's stated allowance for
  a no-chain control, and above the 4/6 bar regardless).
- INVITE SEAM: 40/40 invite outcomes spoken across all driven
  transcripts (accepts and declines, both with reasons); 0 deflected,
  0 other. The 4 sibling-deflection lines in the run are all in
  later (d+14+) transcripts, none in week 1, all the
  "lost my train of thought" form with a SAYTRACE pool draw.

## PEOPLE CHECK: all 28 week-1 transcripts read in full — PASS

Every week-1 conversation satisfies the bar: the NPC wants something
(a confession, help foraging, an answer, a party, a case settled);
options engage or deflect it (invites accepted with reasons or
declined with reasons — Jada at trust 29: "I don't know you well
enough for that. Ask me again when we've survived something
together."); endings resolve, plant, or owe (parties formed with
roles and names; stockpile gifts +4 wood/+4 fiber with real stash
effect; teachings learned; cases advanced to moot/vote; a d+3 thread
resumed at d+7; declined favors answered with "They won't forget.
They'll just stop asking."). No fabricated shared history: callbacks
reference real driven history (the player's own earlier answers, the
d+3 silence ending resumed at d+7). No filler loops: when the driver
hammers Klaus's confrontation 4 times, Klaus pushes back ("I
confessed that already. I'm not confessing it twice for dramatic
effect.") instead of looping.

Observations (not bar failures):
- The invite flow prints two near-identical player lines ("Want to
  come with us?" / "Want to come with me?") in every invite — the
  party-vs-solo offer, slightly robotic in transcript form.
- The hidden-origin secret pool is small: Dylan, Jada, and Klaus all
  confess "not from Denver, from Columbus, Ohio" inside one week-1
  set. Each confession is in-character; a player who talks to
  everyone will notice the reuse. Pool-size note for content, not a
  defect.
- Parallel betrayal cases (murder of Raúl, ambush of Hayden, murder
  of Henry) run alongside the succession deaths and stay coherent;
  they are not confused with the succession death in any transcript.

## VILLAGE ASSESSMENT (plain words)

All six villages are alive at the end of the 70-day window, and all
six are, frankly, doing well. First bearers: Sierra died on day 27
and Hayden took the mantle; Violet was killed by a hushwolf on day
41 and Catalina took over; Jorge died day 18, Everett followed;
Nancy died day 24, Blanca followed; Marta was killed by a hushwolf
day 41, Kelsey followed; Natalie died day 15, Adrian followed. On
the three forced seeds the mantle passed five times in a row and
every friendship survived each passing (31 of 31 bonds intact, no
drifting loyalties). The new bearers kept their own lives — their
own packs, their own plant knowledge (14–28 plants each), their own
skills — and on the scripted paths they also picked up some of the
dead bearer's knowledge (Catalina learned 4 plants and 7 skills from
Violet). Nobody inherited magic: abilities stayed with the person
who earned them, which is the honest version. Leadership got
stronger everywhere: bearer trust climbed from 38–62 at the handoff
to 74–97 by the end, village trust averaged 73–81, and pantries held
11,000–56,000 kcal. Nobody is miserable in any legible way — the
worst trust wobble is Ethel dipping a few points late on 26155 while
still sitting at 86–90. What is missing: nothing structural in this
window. The one silence (26155) is explained above. The grief is
real, the villages bend, none break.

## Verdicts for the leg

- REACHABLE: yes. First deaths, driven week-1 convos, fifth
  handoffs, and organic chains all fire on every seed (6/6 readable).
- FUN: yes. Week-1 convos are the strongest people-content in this
  set — confessions, resumed threads, parties with real gifts and
  roles. The silent seed is still good conversation (beliefs, alien
  food, hunger as a skill) even without a naming.
- WINNABLE: yes. Succession does not break the run: villages survive
  the window with healthy pantries and climbing leadership on all
  six seeds.

## BLANK filled

r86's unrun question is now answered by measurement (no code fix):
week-1 naming reproduces r83 exactly; the 26155 silence is draw
absence + one gossip draw; resumed-topic grief is a fourth naming
channel. Notes for tackle-succession (documented, not built here):
(a) do not chase the 26155 silence as a grief gate — it is draw
variance; (b) preserve the resumed-topic channel — it produced 2 of
12 naming lines with no draw at all; (c) the Columbus-secret pool
repeats visibly within a single week of conversations.

## Telemetry deviation check

node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json
--current 'evidence/2026-10-31/journey-succession-r87-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
LOUD lines (2), both VERDICT: EXPLAINED, baseline NOT rolled:
- deaths.bearer <redacted> 380%: baseline 5 -> current 24 — the forced-chain
  panel deliberately kills bearers 5 times on 3 seeds; regime, not drift
  (r83 precedent, prereg rule: forced panel must not roll the unforced
  baseline).
- census.fallen swung 190%: baseline 10 -> current 29 — same cause:
  forced chain deaths add fallen entries by design.
Quiet: census.alive, census.integrationStage, week2.deadBearerMentions
(no LOUD line). Baseline left untouched.

## Metric review

- r83 → r87 raw-count comparison IS valid (same 70-day window, same
  seeds, same regimes) and it reproduces exactly (8/28, per-seed
  counts identical, 31/31 bonds). Comparison to pre-r83 windows stays
  qualitative (different window lengths).
- Draws are a NEW denominator (r86 instrument): r83 has no draw
  counts to compare against, so draw-level claims (7/9 draws name)
  are r87-only observations, not drift claims.
- FIFTH-KILL DPLUS bases named throughout (d+10 since 4th death;
  d+60/61 since 1st death). No bare "d+10" reading.
- POLICY FALLBACKS ARE NOT DRIVEN DEFLECTIONS: SEAM counts driven
  transcripts only (40 spoken, 0 deflected, 0 other).
- No threshold was moved after seeing results. WEEK1-NAMING was
  pre-declared reported-not-scored; its ≥5/6 interpretation was met
  at exactly 5/6.

## Infrastructure notes (for the next run, not the game)

- Stale-lock recovery: predecessor r86 lock (12:55:40Z) + heartbeat
  13:22:38Z + last file activity 13:55:19Z; 10-min watch 14:00–14:10
  showed no new activity, main tree came clean ~14:07 (0-byte
  test-c.lock, another agent's flap probe, gone by itself); lock
  replaced 14:11:43Z. r86 tree/branch untouched.
- EPERM flap: registration failed ~5 min (index reset + rc=120
  attempts with 0-byte /tmp logs), succeeded on attempt 7 (14:19Z);
  heartbeat verified by read-back (14:20:51Z) + 5-min loop.
- Master moved mid-pre-flight (sighit measurement commit
  0fe9bc4ee, scripts/evidence only); this run's base is the new tip.
- Pre-flight reaper removed lootabilities-w1's worktree (4.6h-stale
  heartbeat; branch kept, 6 commits ahead) — reaper's own action,
  noted here, not this run's.
- Broken 0-byte probe refs refs/heads/__probe4__–__probe9__ break
  `git fetch` (sibling flap probes, still appearing 14:10Z); left
  untouched. Local master is 64 ahead of origin/master, so no pull
  was needed.
- safe-commit index clobber hit once (commit correct, main index
  showed staged deletions); repaired via cacheinfo from HEAD blobs,
  all 5 files hash-verified, status clean before seeding.
- Rotation: 7 -> 4 to be written at closeout and verified by read-back.
- Next Lane B leg: 4 (endgame).
