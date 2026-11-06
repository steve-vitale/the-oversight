# Journey social life r149 — run note (Lane B, 2026-11-06)

Leg 5 (social life). Seeds 42201–42204, DAYCAP 140, policy journey
(socialite base + real conversations). Base: master c7bf1e308 (r147
landed; bond-initiation 5ba7f167f in base; drive build NOT on base —
built+tested, unmerged). Prereg:
`journey-social-life-r149-prereg.md` (seed band 42201–42204 verified
fresh, full-scope check; first choice 42101–42104 COLLIDED with
sim-snarecatch-b 2026-10-19 — recorded in the prereg, do not reuse).
Run opened on a stale r147 lock with a LIVE landing check in the
tree — waited instead of deleting; the r147 closeout deleted its own
lock and released the tree, this run's lock created 21:01:54Z.

## Panel

All 4 villages LOST, d53–d80 (42201 d63, 42202 d53, 42203 d80, 42204
d53). 0/4 past d100 — seventh consecutive short panel (sequence 1/4,
1/4, 0/4, 1/4, 0/4, 0/4, 0/4). Full convs 51/54/75/67; natural ends
42/50/70/62. Deaths dominated by the wild + sickness (42202: 9/13
the wild; 42204: 8/14 the wild; 42201: monsters 3, combat 2, wild 2,
sickness 2, betrayal 1, arena 1).

## Village assessment (plain words)

- **42201 (d63, 0 alive, 17 dead):** the mantle passed four times
  (Morris→Rafael→Liam→Franco→Omar). Ines plotted against Theo on
  day 7 out of grievance and a need to prove herself; it sprang the
  same day and Theo escaped. Memuna asked Rafael to be closer on
  d15, watched it expire on d18, and asked again the same day —
  then turned to Liam instead and was accepted on d21. Oscar asked
  Omar on d43 (accepted d44) and raised a link to a splinter village
  on d61 (accepted d62). Amelia's link raise to village_2 expired
  on d8 after staging on d5.
- **42202 (d53, 0 alive, 13 dead):** the mantle changed hands seven
  times in thirteen days (Thao→Debbie→Amina→Catalina→Jamie→Sofia→
  Hannah→Francesca, d40–52) as bearers died. Nino ambushed Lucas on
  d8 (hurt); Lucas killed Nino on d14 (murder, acquitted). Amina and
  Shanice each raised village links ten times — see the finding
  below. Debbie→Jamie accepted d19; Sofia→Thao accepted d27.
- **42203 (d80, 1 alive — Domfeh, 21 dead):** the longest-lived
  village, a vendetta: Terrence plotted against Petra (d7, d17),
  Petra answered against Terrence three times (d18, d19, d21) off
  the same ambush grievance — each plot sprang (escaped/hurt) and
  the next armed after it resolved, not on top of it. Terrence's
  confession arc is the run's best transcript (see M4). Paul asked
  Gladys on d15 (expired d18); Ursula→Jesse accepted d54.
- **42204 (d53, 0 alive, 14 dead):** Elif→Dieter accepted d19;
  Kelsey→Elif accepted the same day at a 27% chance; Nur→Rafael
  accepted d31 at 74%; Francois→Nur refused at 0%. Death clusters
  d46×3, d53×3.

## Pre-registered verdicts (BINDING, §14)

- **M1 arming motive — GO.** 10 plots, 10 arms, all 10 grievance-
  linked at arming (reasons grievance, grievance+prove, or
  grievance+ambition). Grievance-holder → later leader: 7 cases
  (Lucas d10 off Nino's d8 ambush; Shanice d18/d26 off the d12 vote;
  Terrence d17 off the d14 vote; Petra d18/d19/d21 off the d17
  ambush). No plot armed after d30 — drought bound not re-broken
  (noted, not a re-confirmation). Accomplices cold while leader hot:
  not broken (accMotives grievance 0 on the d7/d10 arms; the d18/d26
  Shanice arms had grievance-carrying accomplices, 44/22 — but the
  leader's own grievance was 0 there, so the cold-accomplice pattern
  is not the story either; the motive lived in the accomplices).
- **M2 villager-initiated bonds — ANSWERED YES.** 73 bond_proposed
  events, ALL villager-initiated (byInitiatorKind villager:73,
  scholar:0). Person-kind 29, 10 accepted — villagers formed bonds
  on their own: Memuna→Liam d21, Debbie→Jamie d19, Sofia→Thao d27,
  Oscar→Omar d44, Elif→Dieter d19, Kelsey→Elif d19, Nur→Rafael d31,
  Rafael→Juan d35, Desmond→Ursula d45, Ursula→Jesse d54. Link
  raises 44, 17 accepted. Per-initiator max: person-kind 4 (Memuna)
  — inside the amendment-5 ≤8/90d bar; link raises 10 (Amina,
  Shanice — see finding). Refusals 5 person / 0 link, expiries 4
  person / 5 link. First post-build datapoint: Q1 is answered.
  The bond-initiate build fires in wild social play, at roughly the
  build panel's own rates (person ~7/seed here vs ~13/seed there
  counting link raises; link ~11/seed here vs ~13/seed there).
- **M3 invite refusal — report only.** Party (player-invited)
  accept 13 / decline 7; lure (NPC-invited) accept 8 / decline 7;
  bond (NPC-invited) accept 4 / decline 5. Invitations are
  sometimes taken, on both sides.
- **M4 sense — GO.** Four candidates read as real people (see
  below). The visible drag is the DRIVER's repetition, not the
  game's: the doubt probe ×5 and the lost-thread question ×4 in
  the Terrence transcript, "Tell me more." ×8 in the Amina
  transcript — in each case the NPC's replies vary, push back, and
  stay in character. The react DOES surface in the wild as
  dlg:react '(listen)' (365 offers) — but the buildMenu fallback
  react (agree/joke/silence) never fires; see the Job C correction.
  Longest continuer run: 9 (Amina, 42202).
- **M5 census guardrail — fails.** 0/4 past d100: all dark-channel
  verdicts are within-window only, reported that way.
- **M6 gossip-position — GO (re-aligned definition).** Gate-away
  (beyond radius-1 of Haven): 0 across all four kinds. Strict
  on-tile away: 39 (36 burst + 3 settle) — ALL of it sits on the
  radius-1 ring, exactly the r145 diagnosis confirmed: the gate's
  radius-1 and the metric's on-tile disagree only there, nowhere
  further out. Debates alive, not silenced: 102 kicked, 101
  settled, 9 stranded days.
- **M7 dedupe fix holds — HOLDS.** 35 near-dup flags across 242
  transcripts, 0 in a fixed pool. All 35 are in pools left as
  legitimate variety (nonverbal-nod family, "Sure — what's on your
  mind?" opener tails, link-raise template lines with the village
  name swapped). The fix is not reopened.

## M4 transcripts (the people check)

- **Rafael (42201, talk request):** an edge, something curdled,
  "Everyone's choosing sides and pretending they aren't. I hate
  it." / "Someone has to say the thing nobody's saying. Probably
  won't be me." Wants to stay out of it; the ending resolves
  ("This was good."). Passes.
- **Terrence (42203, talk request):** the run's best — deflects a
  probe ("Can we not do this right now?"), glances at who's
  listening, confesses ("I wasn't a Mushroom grower. I was a
  Sailor... the only nobody in a camp of somebodies"), then refuses
  to re-confess ("I confessed that already. I'm not confessing it
  twice for dramatic effect."), and the conversation lands on a
  foraging invite. The driver's doubt-probe ×5 is the bot's
  doing; the NPC never repeats a beat. Passes.
- **Amina (42203, friendship):** a murder investigation ("There's
  still the matter of the murder of Nino"), a bribery trail that
  goes cold on the second dig ("You've been over this ground twice
  now... the trail is going cold"), then the thread-loss loop
  ("Wait — what were we talking about?" ×4, NPC: "Still on that
  personal stuff." with honest repeat-prefixes). Passes, with the
  thread-loss choice staying offered after the NPC answered it
  three times noted as a small wart.
- **Wanjiru (42204, talk request):** no shared language (Swahili
  only) — gestures, nods, one proud English word ("Food?"), a
  comfortable quiet. The language barrier is honored, not faked.
  Passes.

## Job C correction (prereg diagnostic was incomplete — own it)

The prereg's code read mapped buildMenu's FALLBACK path (the 'more'
thread continuer, the one goal follow-up, the random agree/joke/
silence react) and concluded "not a wiring bug". That read missed
the beat-matrix early return: buildMenu calls beatMenuResponses
first, and when it returns a menu the fallback section never runs.
In the wild panel (247 transcripts) the fallback items were offered
ZERO times — 'more' 0, 'agree' 0, 'joke' 0, 'follow:goal:0' 0 —
while the beat matrix offered dlg:more 308, goon 542, dlg:react 365
(as '(listen)'), leave 1901, silence 1523, dlg:subject 1343. The
"Tell me more" ×6 pattern in r144/r145 was the BEAT matrix's
dlg:more (3-label pool: "Tell me more." / "Go on." / "I'm
listening."), not the 'more' thread continuer. CORRECTED verdict:
on a goal thread in the wild, the player gets continuers + a
listen-react, never an agree/deflect/challenge/commit. The fallback
block is not dead code — it fires when the beat menu returns null
(questions, trade offers, nonverbal) — but it never fires on goal
threads. Whether a leadership bid deserves an on-thread
agree/challenge/commit is still a DESIGN call, now aimed at the
beat matrix (convo-beats.js REPLY_POOLS), not at buildMenu's
fallback. No code changed in this run: the wiring works as
authored; the shape is the question.

## Finding: link-raise → counter → re-raise loop (42202)

Amina and Shanice each raised village links 10 times in ~31 days
(Amina: village_2 d5/d6, d30/d32, d33, d36; village_1 d9/d10, d31,
d33; village_0 d25/d28. Shanice: same three villages on a similar
cadence). The mechanism is fully traced: the bearer accepted the
idea 9 times, and all 9 proposeLink calls came back "counter"
(trust 30, 35–54 band) — no link ever formed. The counter terms
are never surfaced or settled in the sim (acceptLinkRaise drops
proposeLink's return), and after the 14-day per-pair cooldown the
same villager raises the same village again. The already-linked
guard and the 14-day cooldown both work as written; neither fires
because nothing ever links. In real play the counter opens a
negotiation the player can settle — whether a real player would
break the loop is UNTESTED by this driver (it never settles
counters). Held for a design call: should a countered raise block
re-raises longer than 14 days, or should the sim policy settle
counters? Not fixed in this run — the fix touches negotiation flow
and needs the call, not a drive-by.

## Carry-forwards — closed and open

- **CLOSED: bond records carry an initiator field.** The probe
  (`scripts/probe-bond-proposer-r149-20261106.js`, log
  `journey-social-life-r149-proposer-probe.log`) forced one
  accepted proposeBond (pinned roll, chance 70, "bold temperament
  (+15)", "wants to lead (+10)") and read the live record back:
  `{v:6, depth:0, proposed:true, proposedDay:1,
  proposer:gen_jr2wt6k}` — the field exists on proposeBond-formed
  bonds. The panel's bond samples (1 per seed) showed none only
  because most bonds form via bondAdd from meals/visits/feasts.
  The analyzer's initiatorRecorded check stays a weak instrument
  (1-bond sample); the probe is the evidence. r141/r144/r145
  carry-forward CLOSED.
- **CLOSED: Q1 villager-initiated bonds** (M2 above — answered YES,
  first post-build datapoint).
- **CLOSED: M6 definition dispute** (re-aligned to the gate's
  radius-1; GO; strict counts reported as the known discrepancy).
- **OPEN: goal-thread agree/challenge/commit** — reframed at the
  beat matrix (Job C correction above). Design call.
- **OPEN: link-raise counter loop** (finding above). Design call.
- **OPEN (standing): phone-tap verification of the new
  conversation buttons** (bond:/link: accept/decline) — node sims
  cannot prove taps; still outstanding for the main session.
- **OPEN (standing): survival wall** — seventh consecutive short
  panel; social content only ever fires inside a ~60–80-day
  window. Not a social finding.

## Small observations (not defects)

- Trial votes surface inside conversations: "⚖️ VOTE: GUILTY /
  Counted." appears mid-transcript when a murder case is pending
  (betrayal:vote_guilty injected into the convo menu). The vote is
  counted and the conversation resumes — it reads as a scene cut,
  not dialogue, but the system works as designed.
- The vendetta re-arming on 42203 (Petra→Terrence d18/d19/d21)
  is NOT duplicate plots: each armed after the previous one
  sprang (escaped). A feud that keeps flaring, working as the
  grievance system intends.
- Memuna re-staged a person proposal the same day it expired
  (d18) — expiry frees the slot and the tick re-stages at once.
  No cooldown on expiry for person bonds (the 14-day cooldown
  covers refusals and link raises, not expiries).
- Splinter villages can be link-raise targets (Oscar →
  village_spl_32_16739, d61/62, accepted).

## Gate

[FILL AT CLOSEOUT]

## Telemetry

Social baseline `telemetry-baselines/social.json`, l3.* metrics:
LOUD-disappeared l3.* lines confirmed as known schema drift (the
social driver never emits l3.* fields), no other LOUD lines.
Baseline NOT rolled on a single 4-seed panel.

## Reachable / fun / winnable

- Reachable: social content fires hard (51–75 full conversations
  per village, moots 0–2, plots arm and spring, bonds get proposed
  and accepted by villagers themselves) — but only inside a
  ~60–80-day window; no village lives to see late social content.
- Fun: the conversations read as people, with real wants and
  resolving endings — Terrence's confession and Amina's
  researcher monologue are the best in this leg's line. The
  visible drag is the player's own line repeating ("Tell me more."
  ×8, "Wait — what were we talking about?" ×4) when the bot
  keeps pressing the same continuer; a human varies, the menu's
  3-label continuer pool does not.
- Winnable: not judged by this leg; survival (0/4 past d100) is
  the standing wall, not a social finding.

## Metric review

- M6's re-alignment worked as intended: judging by the gate's
  definition removes the instrument disagreement (strict 39 vs
  gate 0, all on the ring). Keep the re-aligned definition.
- M4's near-dup flag rate (35 / 242 transcripts) is a variety
  measure, not a defect count; 0 flags in fixed pools is the
  binding read.
- M2's per-initiator cap needs a scope note for the next run: the
  ≤8/90d bar holds for person-bond proposals (max 4) but link
  raises run hotter (max 10) under their own 14-day per-pair
  cooldown — the next prereg should state which kind the cap
  covers before scoring it.
- The analyzer's bond-sample initiator check is a weak instrument
  (1 bond per seed); the proposer probe is the real evidence.
  The next run should sample a proposeBond-formed bond directly
  (or keep the probe) rather than re-reading the 1-bond sample.
- Job C lesson: a menu code read must cover the beat-matrix early
  return, not just buildMenu's fallback — the fallback never fires
  on goal threads in the wild.
