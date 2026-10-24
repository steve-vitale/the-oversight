# Journey landing r42 — run note (2026-10-23, lane A)

## Pre-registration
- **Leg question A (blank):** THREAD-DEPTH PURSUIT. r41's people check found
  Liam's curious-stage-0 beat fizzling ("help me think through tomorrow's
  work" -> "That's... pretty much all of it, honestly") with depth untested.
  The engine HAS depth machinery (c.thread/c.depth, the 'more' continuer,
  dlg:more replies, honest exhaustion) but the journey driver's pickChoice
  never took the thread continuer 'more' and the wild depth paths were
  unmeasured. r42 adds a DEPTH_PROBE pursuit path (default ON) + per-sitting
  thread/depth instruments + fizzle detection.
  Gates:
  - depth>=2 in >=40% of sittings where 'more' was offered >=1.
  - 0 fizzles: a pursued continuer yielding the dry admission at depth<=1
    while the thread claims more (the Liam pattern) = documented miss.
  - 0 fabricated-shared-history instances.
  - curiosity threads surface the NPC's actual want (sense-read).
- **Question B (stay-green carry, light):** System contact <=d10,
  DEATH-LITURGY exactness, THEFT-RATE 0, self-sufficiency >=0.70/seed,
  plenty-voice present.
- **Seeds:** 505, 506 (pilot), 507, 508 (main) — FRESH. Policy: competent,
  PINNED. FAVOR_ACCEPT default ON. COMPETENT_TALK unset (driver's
  runConversation is the single conversation instrument).
- **Horizon:** 14d, death-aware (+10d tail). **Code versions:** 505/506 ran
  with the request-thread fix only; 507/508 ran with the full fix set
  (request + village + personal + grief menu gate).
- **Canon read:** CANON.md + docs/CONVERSATIONS.md reread. No new canon.

## Verdicts
- **Q-A1 fizzle hunt: MISS FOUND → FIXED (3 fixes, proof 5/5).**
  - WILD FIZZLE 1 (seed 505 day 3, Nora): talk-request opener ("Can we
    talk? Just talk — like people used to.") + live curious want; player
    "I'm listening" -> "That's... pretty much all of it, honestly." The
    NPC's reason for coming to talk stranded; want stuck stage 0,
    resolution 'unestablished'. Root cause: convoThreadBeat had no
    'request' branch (the request opener pre-empts the want opener, and the
    deferred want content was never delivered). THE LIAM PATTERN, reproduced.
  - WILD FIZZLE 2 (seed 505 day 8, Lounes): grief thread + comfort beat;
    player "I'm listening" -> dry admission. Root cause: grief has no
    follow-up pool, but the reply-pool menu offered "tell me more" anyway
    (thread_dry_collapse contract violated).
  - LATENT (same root cause): 'village' and 'personal' threads planted with
    real follow-up content but unserved by convoThreadBeat.
  - Post-fix wild: the SAME Nora/day-3 beat now resolves — "You look handy.
    What did you do with your hands, before?" (deferred curious question,
    thread flips to 'want', answered, resolution='engaged'). Caleb (506 d4):
    request + ask_favor -> "Please — I'm achy and wrung out, barely keeping
    food down. Will you help me?" (favor accepted AND kept: keptLines).
- **Q-A2 'more'-offered gate: VACUOUS (metric review).** moreOffered=0
  across 37 sittings / 4 seeds — the 'more' thread continuer
  (convoThreadHasMore) is never offered in landing wild play. Depth is
  pursued via dlg:more (3 picks, 2 content post-fix) and goon (24 picks,
  24 content beats). The continuer UI serves a conversation shape (topic
  threads with unspoken follow-ups) that doesn't occur in landing's
  want-driven act-0 flow.
- **Q-A3 fabricated history: GO.** 0 flags across 37 sittings.
- **Q-B stay-green: GO with one observation.** System d8 all seeds;
  death-liturgy EXACT on villager deaths (505: 2 deaths -> 2 beats, 0
  codas); theft 0; plenty-voice 25-26/seed; pantries held (21-47k).
  Observation: 506's SCHOLAR died day 11 (combat, succession to Ada) with
  no grief beat — the succession pipeline, not the village-death liturgy;
  "first-grave" crisis explicitly excludes the player by design. Documented
  as a design question, not a miss.

## Village assessment (plain words)
Four fortnights. 505 (Hazel): 12 → 10 — Priya Nair (d6) and Aroha Ngata
(d7) taken by ambushes; the village grieved each, one beat, no codas; the
living killed a mirrormoth and a sunbasker on day 12 (fought, won).
Pantries held throughout; the System arrived day 8, itself as ever. 506
(Austin): 12 → 11 — the PLAYER died day 11 in combat; the mantle passed to
Ada mid-run and the village played on (lineage 1, full-ration gate correctly
off for the established successor per c8d7c787d). Nobody starved anywhere.
The standout: villagers came TO the player with reasons — Nora's curiosity,
Caleb's sickness, Raj's bare pantry ("Another day like today and we're
choosing who eats") — and when the player leaned in, the conversation went
somewhere real instead of fizzling. That's the act-0 social emergence the
leg is about, and r42's fixes are what let it land.

## Blanks filled
1. **request-thread fizzle (src/js/conversation.js, convoThreadBeat).**
   New 'request' branch: delivers the want's DEFERRED opener via the
   provisional machinery (convoWantOpener + convoAcceptWantQuestion +
   ledger check + onSurfaced), flips c.thread to 'want'. Falls back to the
   defect-8 engageBeat, then honest null.
2. **village/personal thread fizzle (src/js/conversation.js).** Extracted
   the 85-line village-line generator to convoVillageLine(vid)
   (behavior-preserving; verified by diff), added 'village' branch serving
   the next line and 'personal' branch serving the talkLines pool (voiced
   like the topic path — the tail only slot-fills).
3. **grief-thread menu offer (src/js/convo-beats.js).** Extended isDry:
   threads with no follow-up machinery (grief/cheer/recall/secret/table/
   spooked/small/nonverbal) no longer offered reply-pool dlg:more —
   thread_dry_collapse (Steve 2026-10-06). Null threads keep current
   behavior (no observed fizzle; highest-traffic path untouched).
4. **grief-thread winddown (src/js/convo-dialogue.js).** REGRESSION from
   fix 3, caught by test-mourning-name-r8 (7/7 -> 1 failure: "rendered
   mourning line: null"). The fizzle was the grief thread's ONLY winddown —
   it funneled comfort -> dry admission -> collapsed menu -> dlg:subject ->
   alive:event:mourning. The gate removed the funnel; the thread looped the
   comfort pool forever and the structured mourning beat was stranded.
   Fix: the comfort handler sets choosingSubject=true on grief threads —
   the comforted moment is complete, the next menu IS the subject menu
   with alive:event:mourning first. No fizzle, no loop, same destination.
   Verified: debug trace shows turn0 comfort -> turn1 subject menu with
   mourning beat; test-mourning-name-r8 back to 7/7.
- Proof: scripts/test-r42-request-thread-20261023.js — 5/5 GREEN post-fix;
  3/5 RED pre-fix (A, D, E fail on old code; B, C green both ways =
  unchanged honest paths). test-mourning-name-r8.js: 7/7 (regression
  check). check.js --only conversation: 5/7 (2 pre-existing harness
  crashes, identical on HEAD); --only mourning: 2/2.

## Observations (documented, not fixed)
1. **STALE-SLOT carried (r41 blank 2, Steve's call):** meal gate still reads
   the never-moving trust slot (trust 15.00 flat all seeds). Not touched.
2. **moreOffered=0:** the 'more' continuer is dead UI in landing (see
   metric review). Whether topic-thread conversations SHOULD occur more in
   landing is a design question, not a bug.
3. **Scholar-death grief (see Q-B):** succession swallows the liturgy.
   Design question for the succession lane (lane B territory).
4. **RE-OFFER flags** remain benign structural persistence (r41
   classification holds; goon re-offer at turn 4 observed once, same class).
5. **Beat-scan day attribution** (r41 observation 3) unchanged.

## Metric review
- Q-A1's 0-fizzle gate: 1 MISS on pre-gate code (505 Lounes, grief) —
  binding miss recorded, root-caused, fixed, proof-tested. Post-gate wild
  (507/508): 0 fizzles / 20 sittings.
- Q-A2's depth>=40% gate: UNEVALUABLE — denominator ('more' offered) is 0
  in the wild. The gate assumed the continuer is offered; it isn't in
  landing. Proposed revision for the next run: gate on dlg:more/goon depth
  instead (pursued continuers reaching depth>=2: 3/37 sittings this run —
  shallow by construction, wants resolve fast) OR instrument topic-thread
  frequency as its own question.
- `MET.moreOffered` counts menu offers (fixed mid-run: first counted picks).
  Census summary carries the r42 keys (r41Summary object extended).

## Reachable / fun / winnable
- **Reachable:** the landing leg plays clean; request openers, deferred
  wants, favor keeps, death liturgy, System d8 all fire in natural play.
- **Fun:** villagers come to you with wants and the conversations now go
  somewhere — the Nora/Caleb/Raj transcripts read like people, not menus.
- **Winnable:** pantries held 21k+ on all seeds; no starvation; monsters
  fought and killed by villagers (blow-by-blow, per the law).

## Evidence
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/landing-r42/`
— 4 census JSONs, 37 transcripts, 4 system-contact files. Driver:
scripts/journey-landing-r42-20261023.js (new). Proof:
scripts/test-r42-request-thread-20261023.js (new, 5/5; 3/5 RED pre-fix).

## Infra notes
- worktree-register.sh was SIGTERM-killed at 35s by the backgrounding
  mechanism (git worktree add checkout takes ~2 min here); retry in the
  FOREGROUND with yield_ms=120000 succeeded. Lesson: never background the
  register script — run it foreground with a long yield.
- The register's first attempt left a partial checkout (evidence/ only);
  contents byte-identical to committed files; removed before retry.
- check.js --quick slow (~10+ min, progressing through green list at last
  check); result pending at note time — see commit message for the final
  verdict.
- Telemetry check vs landing.json baseline: QUIET (4 files, 4 metrics).
