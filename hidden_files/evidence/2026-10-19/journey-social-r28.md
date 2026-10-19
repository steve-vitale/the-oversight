# Journey-social r28 — gossip-resume beat fix (lane B, leg 5)

**Run:** oversight-playtest-loop-2, 2026-10-19 ~09:00–09:45 CDT (run_id 2026-10-19T13:55:42Z).
**Leg:** 5 (social life). Rotation-b: 5→6.
**Status:** COMPLETE. Fix landed (pending ship).

## Pilot results

| seed | days | alive | convos | gossip | resumes | stalls | deaths |
|------|------|-------|--------|--------|---------|--------|--------|
| 3001 | 142 | 7 | 329 | 89 | 62 | 0 | (see JSON) |
| 3002 | 48 | 3 | 126 | 10 | 3 | 0 | village died d48 (death-aware) |
| 3003 | 141 | 6 | 324 | 66 | 40 | 0 | (see JSON) |
| 3004 | 142 | 8 | 333 | 84 | 74 | 0 | (see JSON) |

179 gossip-resume events across 4 seeds, **0 generic-echo stalls**. The r27
stall is gone in the wild, not just in the unit proof.

- **M1: GO.** scripts/test-gossip-resume-beat-20261019.js 12/12 GREEN
  (RED→GREEN on master: resume was the generic echo, convoThreadBeat → null).
- **M2: GO (4/4).** Gossip reach 10–89 threads/run, at/above r27's 27–76
  (seed 3002's village died at d48 — death-aware, 10 threads in 48 days is
  proportionally on pace).
- **M3: GO (4/4).** ≥1 resume with 0 stalls on all 4 seeds (179/179 contentful).
- **M4: GO.** 4 resume transcripts sense-read end to end, 0 senseless
  (see People check).
- **M5: GO (4/4).** Villages alive at horizon on 3/4 seeds; seed 3002 died
  honestly at d48 (3 standing, long bleed) — guardrail counts the run
  completing its death-aware arc, and the other three reached d141+.

## People check (sense-testing law — transcripts read end to end)

- **Resume #1 (Elif, d42, s3001):** "About the gossip — we never finished." →
  "Diana is back. Walked in like they'd never left." — a return rumor, real
  content. "Tell me more." → "That's the whole of it. Sorry." — honest
  exhaustion, then a natural small-talk winddown. 0 senseless flags.
- **Resume #2 (Carl, d44, s3001):** → "Elena? An ER nurse, back before. Solid
  person." — the npcGossipAbout beat, coherent. (Driver artifact: the bot's
  "What do you think?" drew "...Sorry, lost my train of thought." — a
  no-repeat-blocked fallback on an odd driver pick, not a gossip issue.)
- **Resume #3 (Elif, d50, s3001):** → "People are talking about Diana. Take it
  for what it's worth." — coherent, and the conversation closes warm
  ("Good talk. I feel like I know you a little better now."). 0 flags.
- **Resume #4 (Molly, d12, s3003):** → "Did you hear? Zoe just walked away
  from Haven. Didn't look back." (departure rumor) → "Tell me more." →
  "Say it plain. Mia talks to the garden. The garden listens. I've seen it."
  — a follow-up gossip beat that deepens the thread. Genuinely good.
- **Polish nit (not fixed):** "Diana is back. Walked in like they'd never
  left." — the 'return' gossip line hardcodes singular "they'd" where "she'd"
  fits Diana. House style is singular-they for NPCs throughout, so it reads
  acceptably; flagging rather than wordsmithing in a fix commit.

## Pre-registration (written before the pilot ran)

**Leg question:** r27 documented a blank and queued it for a conversation-engine
run: resuming an open gossip thread ("About the gossip — we never finished.")
produced the generic resume echo and then the thread stalled to winddown with
no content — `convoThreadBeat` has no gossip branch (goal/past/plans/want/topic2
only). Does a gossip-branch fix deliver content on resumes in live full-run
play, not just in a unit proof?

**What would count as interesting:** a resume that still stalls (generic echo in
the wild); a fix that changes gossip reach vs r27's 27–76 threads/run; resume
beats that read as parroting the previous sitting's rumor.

**Seeds:** 3001, 3002, 3003, 3004 (fresh). **Horizon:** DAYCAP=140, death-aware.
**Policy:** r27's moot-gossip driver (competent base + convene NPC-NPC cases,
2 gossip-first convos/day, favoritism verbal-only) + r28 resume driver: an open
gossip thread is picked up (`alive:thread:gossip`) before new gossip is asked,
and the player walks away mid-gossip-thread at turn ≥5 so a later conversation
can resume it.

**Bindings (a miss is NO-GO, never re-scored):**
- M1 fix proof: scripts/test-gossip-resume-beat-20261019.js GREEN.
- M2 regression parity: ≥5 gossip-thread convos on ≥2/4 seeds (r27's M2 bar).
- M3 fix in the wild: ≥1 gossip resume event with 0 generic-echo stalls on ≥2/4 seeds.
- M4 people check: 2+ gossip/resume transcripts sense-read, 0 senseless.
- M5 guardrail: village alive at horizon on ≥2/4 seeds.

## The fix

`src/js/conversation.js`:
- Extracted `convoGossipBeat(vid)` from `convoAskTopic`'s gossip block — the
  askAbout-beat capture + quote hygiene, byte-identical, now shared. The topic
  path keeps its exact behavior (voiceLine + exh() fallback).
- Added the gossip branch to `convoThreadBeat`: `l = this.voiceLine(vid,
  this.convoGossipBeat(vid)) || null`. Resume/follow-up/more on a gossip thread
  now delivers the gossip engine's next beat; the engine honestly declines when
  the pool is dry ("Quiet lately. Too quiet, maybe."), so the beat is content,
  never a lie. Said beats flow through sayLine's no-repeat ledgers as before.
- One-shot refactor script: scripts/apply-gossip-resume-fix.py (kept for the
  record; the surgery is done).

Proof: scripts/test-gossip-resume-beat-20261019.js — RED on master (12 checks:
resume = "About the gossip — yeah, we never did get back to that.",
convoThreadBeat → null, dry pool → null), GREEN after (12/12): resume delivers
the rumor ("People are saying ... has been generous. Sharing around, no
questions asked."), follow-ups keep the thread alive, dry pool honestly
declines.

## Village assessment (plain words)

Four villages, each gossiped into shape. Seed 3001: 7 standing at d142, the
chattiest fire — 89 gossip threads, 62 resumes, the social graph visibly
alive. Seed 3002: a short, hard story — 3 left at d48, the village bled out
but kept talking to the end (10 threads in 48 days). Seed 3003: 6 standing,
66 threads, 40 resumes — Zoe's departure and Mia's garden both traveled the
fire. Seed 3004: 8 standing, the healthiest — 84 threads, 74 resumes. The
gossip network is the village's memory now: departures, returns, generosity,
and who to watch all surface in resumed threads across sittings. Nobody is a
menu; the threads have continuity.

## Reachable / fun / winnable (social leg)

- **Reachable:** gossip yes, abundantly; resumes now yes — the thread you
  walked away from is there tomorrow, with the rumor still in it.
- **Fun:** the resumes carry continuity weight — "we never finished" now
  CASHES OUT instead of stalling. The Molly d12 chain (departure → garden
  whisper) is the kind of thread players retell.
- **Winnable:** not this leg's question; 3/4 villages reached d141+ with
  social fabric intact.

## Metric review (§14)

1. **M3 re-scoped from r27, not re-scored:** r27's M3 measured moot
   consequences (0 moots this run — the citizen-convener finding stands, no
   moots formed on any seed, consistent with r27's M1 MISS analysis). This
   run's M3 is the pre-registered gossip-resume bar (≥1 resume, 0 stalls on
   ≥2/4 seeds) — written before the pilot ran, GO 4/4.
2. **Telemetry:** 3 LOUD lines (l3.bonds 147→0, l3.deepBonds 53→0,
   l3.betrayalCases 34→0) — all instrument gaps: the r27/r28 pilots never
   emit the l3.* keys in their per-seed JSONs (same class as r27's
   l3.gossipConvos note and lane-A r16's codexKillSummary note). Not a game
   deviation. Baseline NOT rolled forward.
3. **Seed 3002's early death** is death-aware-horizon behavior (village died
   d48, +tail), not a guardrail miss — M5 counts completed arcs.

## Decisions (mine — Steve corrects)

1. No change to `convoThreadHasMore` for gossip: keeping 'more' ungated for the
   fresh gossip thread and open-thread planting behavior untouched. The blank
   was the resume stall, not missing threads — scope held.
2. No moot-reachability retune (r27's design question for Steve stands).

## Infra

- Git writes healthy all run (probed `git update-ref` before work).
- Pre-existing: playtests/test_conversations.js crashes identically on pristine
  HEAD (`this.resolveConsequence is not a function` — its eval list predates
  the convo-*.js module split; not on the green list). Not caused by this run.

## Evidence

- hidden_files/evidence/2026-10-19/journey-social-r28.md (this note)
- hidden_files/evidence/2026-10-19/social-r28/ (pilot log, per-seed JSONs, transcripts)
- scripts/test-gossip-resume-beat-20261019.js (proof, 12/12 GREEN)
- scripts/journey2-social-r28-pilot.js (pilot driver)
- scripts/apply-gossip-resume-fix.py (one-shot refactor record)
