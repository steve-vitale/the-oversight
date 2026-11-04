# Journey leg: DEEPENING (days 40–80) R95 — "WHEN THE INVITATION IS TAKEN, WHAT HAPPENS NEXT?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r95 plays deepening, writes 2->3
at closeout. Base: master 3417f9eb0 at worktree creation (ability-use
gamecode, merged 2026-11-04; it is context for this run, NOT judged here —
its own panel judged the twins mechanism panel-thin and the bar
untested on a real phone). Policy: competent (pinned, r94 driver lineage
+ r95 sitting instruments below). Seeds: fresh 93801–93804 (fresh-band
check: r94 used 93701–93704, r93 93601–93604). Horizon: DAYCAP=100,
death-aware stop. Smoke seed 93800 (outside the main band) x DAYCAP=45
proves the r95 driver before the main run; smoke outputs deleted after
the check.

Context: r94 (same leg, same day) answered its question — betrayal
branches, when answered, read SENSE (1 accept via the sick veto, 1
decline with the pocketed found thing) — but left two metric-review
items, and this run answers both instead of re-measuring anything else.
It does NOT re-judge wave 4 (r90), the knowledge economy (r91),
beast-trick teaching (r92), or the standing/scale two-rulers finding
(r93). No game change is pre-committed: if a follow-up sitting reads
senseless, the fix (if any) is judged on its own proof test; if
sittings read coherent, the instrument result is the finding.

Item 1 — betrayal-panel coverage (r94 metric review): r94's B-SIT count
bar (>=4 betrayal sittings) was missed — only 2 of 9 sittings offered a
betrayal branch at all. r95's instrument SEEKS inviters instead of
taking one sitting per convo day: on each convo day (45, 60, 80) the
driver runs sittings in order — the revisit target first (see item 2),
then roster order — up to 3 sittings per day, stopping after the first
betrayal sitting that day. Every opened sitting is played in full (no
probe-and-leave: a probe leave would itself be a conversation move, so
ordinary sittings found while seeking are kept as ordinary transcripts).
Transcript filenames now carry the villager id
(`...-transcript-<seed>-day<day>-<vid>.txt`) so same-day sittings do
not collide. The betrayal alternation is unchanged and panel-wide
(accept on even-numbered betrayal sittings, decline on odd, accept
first, at most once per sitting).

Item 2 — follow-up sittings (r94 metric review): r94's driver picked one
villager per sitting day and never revisited the inviter, so
after-effects were visible only by accident. r95 REVISITS: the day-45
inviter (if any) is the first sitting candidate on day 60, and the most
recent inviter is first on day 80. A revisit sitting that offers no new
betrayal branch IS the follow-up evidence (read in full); a revisit
that offers a new branch is both a follow-up and a new betrayal sitting,
and the alternation continues.

Why an invitation cannot be detected before opening: the r94
Nikolai transcript shows want=ask_favor (stage 0) while the first
offered menu already contains betrayal:accept — the invitation is a
menu overlay, not a want id. Seeking therefore requires opening
sittings, which is why item 1 runs full sittings rather than peeking.

Canon note: no dedicated betrayal-invitation section exists in
docs/CONVERSATIONS.md (searched: only the replies-ownership rule). The
governing rule is Steve's 2026-10-27 ruling — invitations, betrayal
invitations included, should sometimes be taken; villagers choose like
real people by character, not never and not always — plus the
sense-testing law (Steve 2026-10-11): a sitting must have meaning
(the NPC wants something, options engage or deflect it, endings
resolve/plant/owe), never just exchange counts.

## Leg question

In the deepening window under natural competent play, when the driver
seeks inviters and revisits them: do more betrayal sittings surface
than r94's 2-in-9, and when the player sits with the same inviter
again two weeks later, does that sitting make sense — does it
acknowledge, owe, or resolve the earlier invitation, or honestly leave
it unmentioned, rather than fabricating shared history or voiding the
branch without a line?

## Binding metrics (NO-GO never re-scored; revisions go to metric review)

- B-SEEK (primary): every sitting in the panel classified from its
  transcript: betrayal sitting (offered betrayal:accept at any turn)
  vs ordinary; for betrayal sittings, mode (accept/decline), turns
  taken after the branch, want final, and a sense verdict from a full
  read. Bar: at least 4 betrayal sittings read in full (2 accept, 2
  decline if the panel yields them); sittings per convo day <= 3 on
  every seed-day. If the panel yields fewer than 4 betrayal sittings,
  the count miss is reported as panel composition, not rounded up and
  not re-scored against ordinary sittings.
- B-FOLLOW (primary): for each inviter named in an earlier sitting,
  whether a later convo day's transcript revisits that same villager
  while alive and talkable. Bar: every inviter alive at a later convo
  day gets a revisit sitting attempted (an attempt blocked by village
  death or an un-talkable id is logged as blocked, not silently
  missing). Each follow-up sitting is read in full and given a sense
  verdict (SENSE / SENSELESS / UNESTABLISHED) under the same
  definition as B-SENSE.
- B-SENSE (primary, strict): 0 SENSELESS betrayal sittings. A sitting
  is SENSELESS only on a full read: fabricated shared history, a
  verbatim repeat, a branch that voids the invitation without a line,
  or an ending that neither resolves, plants, nor owes. An engaged
  but unresolved ending (plant/owe) counts as SENSE, as in r94.
- K-CONTEXT (carried, not re-judged): lessons ok/total, moots
  (markerCounts), proposals/outcomes, standing + scale at the
  last-living snapshot, from the r95 analyzer (r94 print keys).
- M5 winnable (descriptive, by endReason): survived vs lost per seed.
- STAY-GREEN: 0 death-honesty mislabels on all seeds.
- Rotation bound (carried): max consecutive dlg:more/dlg:details
  picks <= 2 in every transcript, betrayal sittings included.
- S-TRACE (carried, not re-judged): standing-trace verdict per seed
  from the r94 analyzer logic.

## Interesting-finding bar (pilot gate)

The pilot (smoke seed 93800 x DAYCAP=45) must prove: the day-45
sitting loop runs up to 3 full sittings, stops after a betrayal
sitting if one occurs, writes vid-suffixed transcript filenames with
no collision, and completes without a harness crash. If the pilot
crashes on the new loop, the run stops and the loop is fixed with a
proof test before any main seed runs. The pilot does NOT prove the
revisit (no later convo day inside DAYCAP=45) — the main panel's day
60 is the live test of revisits, exactly as the prereg's pilot gate
allows.
