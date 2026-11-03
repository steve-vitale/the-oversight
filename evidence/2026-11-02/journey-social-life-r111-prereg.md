# Journey social life r111 — PRE-REGISTRATION (Lane B, 2026-11-02)

Leg 5 (social life). Rotation-b read 5 at run start → write 6 at
closeout (social → crisis). Base: local master at registration
(1ce6d98fd). Slug journey2-social. No push, no bump, no live
check — ship loop owns those. Gating freeze stands; no
gate/deed/standing/wave/table change.

## The question, in one line

Do the social layer's DARK channels actually run in full play:
do villager-to-villager lure invitations resolve sometimes-taken
(Steve 2026-10-27 ruling 8, wired as npcInviteDecision kind
'lure' in betrayal.js, called from npcPlotTick), and do
recorded grievances feed new plots — or are they built but
silent in real runs?

## Why this question (not a re-proof)

r110 (2026-11-02) proved the bright side: conversations,
friendships, moots, gossip all fire, villages live 117–141
days. It also found grievances are the live rivalry channel
(9–10 per run, read from betrayalState) but did NOT test
whether grievances change behavior, nor whether lure
invitations ever resolve. The lure decision exists in code
and is unit-proven (tackle-invite 2026-10-27); no full-run
evidence shows it firing with mixed outcomes. This run
measures the wiring in play, per the Nov 1 direction to
deliver change, not re-prove constraints.

## Play

Competent + socialite policy (r110 driver + dark-channel
instrumentation, zero src/js changes in the driver),
DAYCap=140, seeds 41101–41104 (fresh, distinct from r110),
narration: true on ALL seeds (r110 metric review: never mix
narration-on/off). Driver:
scripts/journey-social-life-r111-20261102.js.

Instrumentation (read-only, driver-side):
- Wrap Game.npcInviteDecision: record every call (day,
  kind party/lure, inviter, invitee, chance, accept, veto,
  inputs, reasons). This is the direct lure-resolution read.
- Dark snapshots at d30/60/90/120/end: betrayalState()
  grievances (by/against/kind/day), plots (status
  active/sprung/resolved/expired, inviter/target, day),
  invite histories (count/accepted/outcomes/pending),
  cases count, and grievanceBetween(inviter, target) for
  each live plot.
- Ambush narration lines captured from the emit stream
  (ambush/spring keywords, capped).

## Pre-registered metrics (BINDING, §14)

- **M1 lure resolution: GO iff** ≥1 lure decision is
  recorded on ≥2 seeds AND across the panel at least one
  lure is TAKEN (sprung) and at least one DECLINED
  (expired plot / declined decision). All-taken or
  all-declined = NO-GO (the "sometimes" ruling fails in
  play). Zero lure decisions on ≥3 seeds = NO-GO,
  built-but-silent.
- **M2 grievance→motive: GO iff** on ≥2 seeds, at least one
  plot's inviter holds a recorded grievance against its
  target at snapshot time, OR grievance counts and plot
  counts move together with a named case quoted. Zero
  grievance-linked plots on all seeds = NO-GO finding
  (motive comes from elsewhere; say so, don't re-score).
- **M3 player invites: REPORT, no bar.** invite-history
  counts/accepts for player-facing invites (player choice,
  not automated). Zero offers is itself a finding.
- **M4 sense: GO iff** one ambush/spring passage and one
  grievance-recall conversation passage are read in full
  and judge as meaningful (want/engagement/consequence) or
  the break is named and fixed same-run.
- **M5 census (guardrail, r110 shape):** villages alive
  past d100 on ≥3 seeds, ≥10 full conversations and ≥80%
  natural ends per seed. A collapse here voids the dark
  read (no village, no society) and is reported as such,
  not papered over.

## Interesting findings (pre-declared)

- Lure decisions fire but skew all-taken or all-declined
  (character bands too narrow/wide in play).
- Plots form with no grievance link anywhere (motive from
  ambition/fear/envy only — grievances decorative).
- Lure decisions never fire despite plots existing
  (wiring gap between plot creation and tick).
- A grievance visibly cracks a bond and later drives a
  plot (the rivalry arc working end to end).
- Player party invites resolve by character (temperament/
  bond visible in reasons) — the same decision, other
  channel.

## Metric review (carried from r110, applied here)

- Grievances read from betrayalState().grievances, not
  village.grievances (r110 probe correction).
- Gossip spread via rep-ledger growth, not per-villager
  carriage (no such field).
- Narration: true on all seeds; never mix.
