# Conversations — first numbers: pre-registration (arm sim-convfirst-a)

Run fleshout-20261111T0815Z, Loop A. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE
any judged sim. Base commit 5bb3c595a (worktree sim-convfirst-a;
rebased from 7638d4bbf — see infrastructure note).

INFRASTRUCTURE NOTE (recorded before any judged sim): an intermittent
host write-denial flap (EPERM) is ACTIVE for .git ref writes as of
spawn. Probe `git update-ref refs/heads/probe HEAD` FAILED
("couldn't write '.../the-scattering/.git/refs/heads/probe.lock'").
ONE rebase onto the explicit current master SHA 5bb3c595a was
attempted early and FAILED on the same flap ("could not write to
'.../.git/worktrees/sim-convfirst-a/rebase-merge/head-name':
Operation not permitted"), leaving a stale empty rebase-merge dir
(0-byte head-name + interactive only, no git process running).
This arm therefore proceeded on base 7638d4bbf and rebased later
when ref writes cleared; proof is re-run green after every rebase.
UPDATE: the flap cleared mid-run (probe ref write succeeded).
The stale rebase-merge dir was removed (verified empty, no git
process running) and the rebase onto 5bb3c595a SUCCEEDED with no
conflicts. The range 7638d4bbf..5bb3c595a holds only
journey-succession evidence commits — zero code changes to
competent.js, conversation.js, bond-initiation.js, game.js, or
sim-harness.js — so the substrate grounding above stands
unchanged on the new base. Per the arm brief, NO judged sim runs
until this prereg is committed; fixture miniatures only until then.
Master moved during the run: base 7638d4bbf, master now 5bb3c595a
(Loop B landed talkturn-confirm + conjurefix evidence).

## Canon

- docs/CANON.md read first. docs/CONVERSATIONS.md (275 lines) read
  in full — it IS the canon doc for this system. Nothing is invented
  here; the code citations below are the source of truth, and where
  the doc and the code disagree the code wins and the gap is noted.
- The conversation engine as coded (all in src/js/conversation.js
  unless noted):
  - **Open** — `talkTo(vid)` (conversation.js:531) opens a real
    conversation via `startConvo` and returns the opening line.
    Cost: 10 kcal charged on open. Trust +3 on natural end (same
    40-cap as before: words only go so far); the stipend scales
    with exchanges (0 = none, 1–2 = +1, 3+ = +3) and the mood
    residue lingers only after 3+ exchanges in a SUBSTANTIVE
    conversation (`endConvo`, conversation.js:7472).
  - **Threads** — `goal` (what they want), `past` (old life),
    `village` (how everyone's holding up, generated from live
    needs/moods/heat), `plans` (tomorrow), `request` / `grief` /
    `cheer` / `recall` (single-beat contextual threads), `where`
    ("Where do you think we are?", `state.scholar.placeKnown`),
    `secret` (high-trust confidence), `gossip`, `personal`.
    "Tell me more" (`more`) goes deeper until the thread is
    honestly exhausted ("I've told you everything I know about
    that") instead of looping.
  - **Budget** — each conversation has an energy budget (2–6
    exchanges, from temperament + social need; `convoBudget`,
    conversation.js:2763). When spent, the NPC signals a natural
    ending and the conversation closes (`endConvo 'natural'`).
  - **NPCs ask YOU questions** — six canon questions (origin,
    plans, fears, missing, trust, worldview), gated by trust and
    mood. The first conversation with someone always includes one.
    Answers are remembered (`conv.answered`) and referenced later
    ("You told me you're from..."). In-conversation they arrive as
    `pendingQ` (answered via `ans:*` choices) or as generic
    questions (`genericQ`, answered via `gq:*` choices).
  - **No repeats, ever** — `convoPick` tracks said lines by TEXT
    across ALL threads per villager.
  - **Language** — no shared language → nonverbal (gesture
    choices); partial → normal conversation.
  - **Silence and leaving are options** — `silence`, `leave`
    (`endConvo 'left'`), `goon` (queued-beat continuer).
  - **Choice taxonomy in `convoTurn`** (conversation.js:6097,
    branches 6121–7273 + menu builder 4415–4851): `leave`,
    `goon`, `deflect_q`, `more`, `recap`, `observe`, `offer_help`,
    `trade`, `trade_yes`, `trade_no`, `callout_quiet`,
    `callout_public`, `hawker`, `hawker_yes`, `hawker_no`,
    `teach`, `speak_back`, `invite_party`, `theorize`,
    `compare_maps` (merges their visited tiles into shared map
    knowledge via `Game.compareMaps`), `agree`, `joke`,
    `silence`, `subject` (pivot), plus prefixed families:
    `ans:*` (answer their canon question), `gq:*` (answer a
    generic question), `ask:*` (ask on a topic — `ask:gossip`,
    `ask:spread_rumor`, `ask:others`, ...), `follow:*`,
    `skill_learn:*` / `skill_teach:*` (lesson outcomes),
    `bond:*` (accept/decline a bond proposal),
    `link:*` (accept/decline a link raise), `dlg:*`
    (dialogue-commitment family), `nv:*` (nonverbal), `react:*`.
    `convoBeatOf` (conversation.js:4355) classifies a choice into
    ask / follow / more / pivot / react / theorize / teach /
    speak / other — the instrument classifies by the same rules
    plus the prefixed families above; anything landing in
    `other` with no family prefix is an UNCLASSIFIED event and
    fails the GO bar.
  - **Secrets** — `convoOpening` (conversation.js:3232): trust
    ≥40, secret not yet shared, 0.2 chance — "Can I tell you
    something? ..." (6 distinct secrets, conversation.js:2561).
    A volunteered secret sets `confessedThisSitting`, so a later
    confrontation-confession in the same sitting deflects instead
    of dispensing a second secret.
  - **Teaching** — `teach` branch (conversation.js:6878);
    lesson outcomes at 7274 (`skill_learn:` / `skill_teach:` /
    `teach`).
  - **Hawker** — resident hawkers offer ONE ware in conversation
    only (`hawker` / `hawker_yes` / `hawker_no`, 6854–6878;
    `hawkerOffer`/`hawkerBuy` in betrayal.js; see also the
    tradefirst-a prereg for the payment rails).
  - **Gossip / rumors** — `ask:gossip` and `ask:spread_rumor`
    threads (menu builder 4808); rumors are queued with
    `delivered: false` (game.js:10545) and delivered via gossip
    or map.
- **Talk requests — villagers come to YOU** (the
  villager-initiated half, all in src/js/game.js unless noted):
  - `villagerInitiative()` (game.js:18931, one initiative per day
    part max, NPCs on the scholar's node within 5 tiles): hunger
    (>70, 0.3 — asks for food, a `say` line, NOT a conversation
    open), fear (>70, 0.3 — a warning `say` line), social (>78,
    0.22 — wanders over to talk, a `say` line; may reveal a name
    by overhearing, trust +2 capped at 40), and "can we talk?"
    (0.16 — stages `v.talkRequests[rid] = {line, day}` via
    `talkReason(rid)`, says the line + "(Talk to ...)", chimes
    `talkAttention`, drama `npcAlert`).
  - Other stagers: betrayal.js:539 — a scripted day-1 request
    ("Day one. Everyone's pretending they're fine. ...Can we
    talk?"); bond-initiation.js:408 — bond proposals stage a
    talk request with `bondProposal: true`; bond-initiation.js:582
    — link raises stage one with `linkRaise: true`; game.js:21153
    — invitations stage one.
  - **Expiry** — `expireTalkRequests()` (game.js:18919):
    undelivered requests die after >2 days, delivered records
    are pruned after >3 days. Requests without a day stamp (old
    saves) are kept.
  - **Delivery** — the opener reads the request
    (conversation.js:3043) and marks it `delivered`
    (conversation.js:3051, 8106). A request whose opener goes dry
    must NOT mark delivered (conversation.js:3047).
  - **Link raises inside conversation** — a pending raise is
    offered as `link:accept` / `link:decline` while the raise is
    pending (menu ownership, conversation.js:4419); bond
    proposals the same way (`bond:accept` / `bond:decline`,
    4418). The talkturn-a arm proved the mechanism: under
    COMPETENT_TALK=1 the mail gets answered; under default play
    it expires unanswered.
- **Who calls the conversation verbs** (grep-verified 2026-11-11):
  `talkTo` / `convoTurn` / `endConvo` are called ONLY from
  app.js UI buttons, tests, and three policy functions:
  `talkRound` (competent.js:653 — opens ONE conversation/day
  with a random roster villager and walks straight out via
  `endConvo 'left'`, ZERO turns), `deepTalk` (competent.js:831
  — up to 2 held sittings/day, up to 5 real turns each, via
  `holdConversation`, gated by `talkOn()` =
  `process.env.COMPETENT_TALK === '1'`, default OFF), and
  `keepPromiseSocial` (competent.js:~925 — holds a real
  conversation to keep belong/understand promises, UNGATED: it
  calls `holdConversation` directly). `capableTalk`
  (capable.js:805) is capable-policy only, not competent.
  `competent.daily` calls `talkRound` then `deepTalk`
  (competent.js:3378–3381). **Under DEFAULT competent play
  (COMPETENT_TALK unset), the only held-turn path is
  `keepPromiseSocial`** — everything else is a walk-out open.
  That asymmetry IS one of the first numbers.
- **What talkturn-a already proved — cite, don't redo**
  (evidence/2026-11-10/sim-talkturn-a.md, run
  fleshout-20261110T1215Z, seeds 150201–150208, 150d):
  COMPETENT_TALK=1 (armed): 2,962 talks, 8,806 turns, 27 link
  picks, 1,952 held sittings, 8,140 deep turns; control (flag
  off): 869 talks, 0 turns, 0 link picks, 36 raiser-pending
  talks (all expired). Second links: armed 2/8 seeds, control
  0/8 — GO candidate, HELD by the cost bar. This arm does NOT
  re-measure that mechanism. It measures what the conversation
  system does when nobody sits down: the default-play census.
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Conversations/bonds — **Partial**: played thinly via
  `talkRound`, `deepTalk` (env-gated), `capableTalk` by need;
  sim-talkturn-a + sim-answermail-a Nov 10;
  journey-social-life r110–r167; **NO panel metric**;
  MEASUREMENT §4 demands sense-read transcripts, no standing
  instrument. This arm supplies the first standing instrument
  for the default-play conversation census.

## What the tests prove — and what they do NOT

The 28 conversation tests (playtests/test_conversations.js, all
passing per docs/CONVERSATIONS.md) prove the verbs work when
CALLED: openings, threads, questions, budgets, no-repeat picks,
language gates, endConvo stipends. None of them measures whether
conversation ever HAPPENS in a lived village under default play:
no open rate, no walk-out vs held split, no turn count, no
choice-kind mix, no topic mix, no talk-request staging/delivery/
expiry rates, no villager-initiated talks, no gossip subjects, no
teaching beats, no secrets, no hawker branches, no link raises
offered inside conversation. This arm measures exactly that, on
a plain competent band with the flag OFF.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked: no open
conversations line names this first-numbers measurement; the
talkturn link-answer mechanism is a different arm's question.)
Any conversation gap this arm surfaces is APPENDED as [open] in
the evidence file's findings section, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: `talkTo` runs daily via `talkRound`
   (competent.js:3378–3381) — the pilot will confirm opens live
   in the corpus, not assume them. `convoTurn` is proven live in
   the proof fixture by direct calls (a prepared villager +
   `holdConversation` with the flag ON, plus direct `convoTurn`
   calls on a fixture conversation); its zero under default
   competent is then a real zero, not a dead wrap — EXCEPT the
   `keepPromiseSocial` path, which the pilot measures live (any
   held turn under default play must come through it, and the
   instrument records the caller stack of every `convoTurn`).
   `expireTalkRequests` is proven live in the fixture the same
   way (stage a request, advance days, watch it prune) and
   marked live-or-dead from the pilot's request fates.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every `talkTo` open +
   every `convoTurn` + every talk request + every
   `villagerInitiative` staging on the band.
3. **Verb existence**: talkTo, convoTurn, endConvo, convoGet,
   convoBudget, convoPick, stageLinkRaise, acceptLinkRaise,
   declineLinkRaise, proposeLink, expireTalkRequests,
   villagerInitiative, hawkerOffer, hawkerBuy, compareMaps all
   exist in the engine. The policy calls `talkTo` daily and
   `convoTurn` only through the gated `deepTalk` and the
   ungated `keepPromiseSocial` — that asymmetry IS one of the
   first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 122.5–140d); talk requests live ≤3
   days and conversations are a daily phenomenon, so the long
   horizon is about the whole-life shape (does talk die out as
   the village thins? do secrets ever surface late?), not about
   seeing a rare event. Same horizon as the siblings for
   comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of the
conversation system under default competent play** — every
`talkTo` open classified by opening thread and ending, every
`convoTurn` classified by choice kind, every talk request
classified by source and fate, every villager-initiated staging
counted, every metric in the list below counted or explicitly
marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every talkTo open classified by opening thread + ending, none 'other' | 0 unclassified opens across the pilot |
| Every convoTurn call classified by choice kind, none 'other' | 0 unclassified turns across the pilot |
| Every talk request classified by source + fate, none 'other' | 0 unclassified requests across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under default competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–9; sense-test scenes quoted |
| Engagement floor | ≥5 talkTo opens band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14). NOTE on the
floor: the floor is on OPENS, not turns. Turns may legitimately
be 0 under default play (only `keepPromiseSocial` can take one)
— a 0-turn band is a FINDING (the system is unexercised), not a
failed floor, provided the opens prove the recorder is live.

## Metrics (all 9)

1. Opens: `talkTo` calls — total, by day band (1–30 / 31–60 /
   61–90 / 91+), by villager (repeat rate: does the random pick
   spread or fixate?), opening thread (goal / past / village /
   plans / request / grief / cheer / recall / where / secret /
   gossip / personal / question / favor / none — read from
   `convoGet` after the open: `thread`, `pendingQ` kind,
   `genericQ` kind, undelivered talk request present), ending
   (`endConvo` how: left / natural / other), turns per sitting
   (0 expected; any >0 traced to its caller), kcal charged (10
   per open), trust stipend paid per ending, language level of
   the partner (none / partial / full — no-language opens take
   no turns by construction).
2. Turns & choice kinds: `convoTurn` calls classified by the
   taxonomy in the Canon section (ans / gq / ask / follow /
   more / pivot / react / theorize / teach / speak / hawker /
   trade / callout / invite_party / compare_maps / offer_help /
   observe / recap / bond / link / skill_learn / skill_teach /
   dlg / nv / leave / goon / deflect_q / other). Per-kind
   counts; `ask:*` topics; `ans:*` question ids answered;
   `gq:*` kinds; caller stack class for every turn (deepTalk /
   keepPromiseSocial / other — the pilot must attribute every
   held turn to its policy path).
3. Threads & topics: opening-thread distribution (metric 1's
   thread read, aggregated); `more` (follow-up depth) picks per
   thread; winddown naturals (conversations that end by budget,
   not by walking out); threads that exhaust honestly ("told you
   everything") vs threads never opened.
4. Talk requests: staged by source (villagerInitiative /
   betrayal-day1 / bondProposal / linkRaise / invitation /
   other), delivered (opener fired, `delivered` set) vs expired
   (pruned by `expireTalkRequests`) vs pending-at-end; days from
   stage to delivery/expiry; requests answered inside
   conversation (`bond:` / `link:` picks while one was pending);
   requests whose villager died before delivery.
5. Villager-initiated talks: `villagerInitiative` talk-request
   stages (metric 4, source = villagerInitiative, with the
   `talkReason` kind recorded where the line names it);
   hunger/fear/social approach `say` lines (counted from the
   sense corpus — they do NOT open conversations, so they are
   reported as approaches, never as opens); NPC questions asked
   (`pendingQ` / `genericQ` present at open, metric 1); talk
   requests answered by the scholar walking over vs never
   answered.
6. Gossip: `ask:gossip` / `ask:spread_rumor` picks, rumor
   subjects surfaced (rumor-queue subjects read at snapshot
   where the engine exposes them; else marked unmeasurable with
   the reason), overheard name reveals (villagerInitiative
   social branch — via the sense corpus), gossip threads opened
   as openers.
7. Teaching beats: `teach` picks, `skill_learn:` /
   `skill_teach:` outcomes (lesson completed / refused /
   no-skill), skills taught/learned by name, teaching inside
   held sittings vs walk-outs (walk-outs: 0 by construction).
8. Secrets / confessions / hawker / compareMaps / link-in-
   conversation: secret-shared opens (opener thread `secret`),
   confessions (`confessedThisSitting` set — read from
   `convoGet` after the sitting), hawker offers (`hawker` picks)
   + buys (`hawker_yes` outcomes) + prices, `compare_maps`
   merges, link raises offered inside conversation (`link:`
   picks + talks with a raiser pending, cross-checked against
   the secondlink-a staging fates on the same band shape).
9. Wall numbers: national / table / wins, wave 4–5 unlocks,
   median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: conversation is a whole-life question (does talk die
  out as the village thins? do secrets ever surface late?); the
  sibling first-numbers pilots (cookfirst-a, preserve-a,
  fishfirst-a, travelfirst-a, tradefirst-a, talkturn-a) ran 150d
  with median survival 122.5–140d, so 150d captures the full
  village life without ticking dead villages. Same horizon as the
  siblings for comparability.
- **Seeds: 190201–190208 (8 seeds).** Freshness search for
  190201–190208 (skill local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190201–190208:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all eight
    seeds.
  - Searched all evidence `.json` with word-boundary grep: the
    only hits are NUMERIC FIELDS, not seed namings —
    `depriKcal: 190203` (a kcal count, preserveact-b corpus) and
    `"totalDraws": 190207 / 190208` (RNG draw counts,
    stageally-stab-b corpus). No .json names any of 190201–190208
    as a seed. The bare-substring grep also listed a few .json
    data files containing "19020" inside larger numbers; none is
    a prereg, forbidden list, screen, or extension band naming
    these seeds.
  - No perseed directory names any seed 190201–190208 (find over
    all 1,240 `perseed-*` directories, grep for 19020: zero).
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked; only preregs matched
    "band" — same finding as the travelfirst prereg).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + full-tree word-boundary seed
    grep over evidence/*.md and evidence/*.json + perseed
    directory names + goal hidden_files listing. Band is FRESH.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, COMPETENT_TALK unset
    (default — flag OFF), instrument ON (the judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented
    control leg exactly on days + end pantry kcal + death count
    (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/convfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game):
- talkTo: every call — vid, day, return (opening line, first 300
  chars), post-open `convoGet` read (thread, pendingQ kind/id,
  genericQ kind, count, budget, undelivered talk request
  present + its flags), caller stack class (talkRound /
  deepTalk / keepPromiseSocial / other — from the stack frames).
- convoTurn: every call — vid, day, choiceId, classified kind
  (taxonomy above; `other` recorded verbatim for the GO check),
  return kind/result flags, caller stack class, pre-turn
  `convoGet` thread.
- endConvo: every call — vid, day, how (left / natural /
  other), exchanges, trust stipend implied (exchanges band),
  caller stack class.
- stageLinkRaise / acceptLinkRaise / declineLinkRaise /
  proposeLink: every call — same shape as the secondlink-a
  wraps (day, vid, villageId, outcome class); link raises
  offered inside conversation only (metric 8 cross-check).
- expireTalkRequests: every call — talk-request keys pruned
  (vid, age, delivered-or-not), counted as expiries.
- villagerInitiative: every call — talk-request diff
  (new keys staged: vid, line first 200 chars, flags) so
  villager-initiated stagings are counted at the source, not
  inferred from snapshots.
- tele('bond_proposed') via the secondlink-a lazy-wrap pattern
  (chain onto the live harness tele at first daily): bond
  proposal events (initiator/target/kind/outcome/chance).
- Daily snapshot: talkRequests roll (vid/line first 200 chars/
  day/flags/delivered), pending link raises (vid/villageId/day),
  pantry kcal, roster size, roster alive count, trust of
  talked-to villagers (vid → trust, only for vids talked to
  that day — the full trust map is not snapshotted), scholar
  day, `conv.answered` count (questions answered, cumulative),
  rumor-queue subjects where exposed (else null + reason).
Driver: scripts/convfirst-driver-20261111.js (mirrors
talkturn-driver; COMPETENT_TALK explicitly UNSET for both legs
so ambient env cannot leak in; Game.say wrap with a
conversation regex for the sense corpus, 200 lines/seed cap —
same early-game-only caveat as the siblings, narrowed regex so
combat lines do not eat the cap:
talk|convers|gossip|rumor|secret|confess|teach|lesson|hawker|
compare maps|Can we talk|wants to talk|overheard|from before).
Analyzer: scripts/convfirst-analyze-20261111.js (standalone —
the secondlink analyzer's link classification is reused only
in shape, not imported: this arm's link slice is small and the
daily snapshots here carry no raiser census). Proof:
scripts/test-convfirst-a.js (each wrap proven live on a fixture
or miniature; RED checks on the pre-fix instrument where a wrap
is dead by construction).

## Reuse decision

- REUSED (shape, adapted): scripts/talkturn-driver-20261110.js
  (two-leg driver, say-wrap sense corpus, per-seed JSON, refuse-
  to-overwrite) and its `createTalkRecorder` wrap pattern;
  scripts/secondlink-instrument-20261110.js (wrapMethod helper
  shape, lazy tele chaining, stage/accept/decline/propose
  wraps); scripts/talkturn-analyze-20261110.js (`wallOf`,
  median, deaths-cause helpers — reimplemented standalone to
  avoid coupling to the secondlink daily shape).
- NOT reused: the full secondlink instrument (its per-villager
  raise-eligibility census is out of scope — this arm counts
  link raises offered inside conversation only); the
  talkturn-driver's COMPETENT_TALK=1 armed leg (this arm's
  question is the flag-OFF default; the flag-ON leg appears
  ONLY inside the proof test's 12d miniature, to prove the
  `convoTurn` wrap live).
- New files: scripts/convfirst-instrument-20261111.js,
  scripts/convfirst-driver-20261111.js,
  scripts/convfirst-analyze-20261111.js,
  scripts/test-convfirst-a.js. Corpus:
  evidence/2026-11-11/perseed-convfirst-a/ (16 files: 8 control
  + 8 neutral) + summary JSON. Evidence:
  evidence/2026-11-11/sim-convfirst-a.md.

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-fishstaff-b,
cookfirst-a, preserve-a, fishfirst-a, travelfirst-a, tradefirst-a,
talkturn-a). The control/neutral legs are the neutrality proof,
not a panel. Panel context: **no panel metric for
conversations** (coverage audit §4) — this arm supplies the
first-numbers census the panel lacks.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (fishfirst-a: median survival 122.5d, 7/8
village-lost, 650 deaths over 869 village-days; talkturn-a
control: 869 talks, 0 turns, median survival to be read from its
evidence). If the instrument changes any numeric field vs the
recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
