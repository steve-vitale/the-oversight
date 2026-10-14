# Presentation pass A: what you see and hear, and where

*2026-10-14, worker A (feedback, sound, haptics). Steve: "Address all graphic and sound survey gaps."*

Data lives in `src/js/feel.js` (`FEEL_MOMENTS`, `FEEL_VERBS`, `GROUNDED_KINDS`, haptic patterns). Visuals are in `src/js/drama.js`: `grounded`, `moment`, `verbFx`. Synth voices are in `src/js/feel-audio.js`, which runs on `CombatAudio.port()`, so they share the same buses, mute and compressor. Proof: `scripts/test-feedback-moments-20261014.js` (56 checks, green list, quick).

## Days 1–6: grounded feedback (no System chrome)

Before this pass, `Game.drama` returned early before day 7, so nothing was drawn. Now, before the System arrives, the human-scale effects draw in earthy colours: ochre, blood, ash, bark and bone. There is no cyan, no glow and no System wording.

| Moment | Visual | Sound |
|---|---|---|
| Strike lands | ochre dust splat | `weaponHit` + `monsterHurt` (these already sounded) |
| Crit | blood splat, bone slash, damage number, small shake | as above |
| You dodge | dashed dust arc, "miss" in ash | **`groundedMiss`**: a cloth whoosh |
| Hit taken (≥5) | dark-brown edge vignette, small shake | **`groundedHurt`**: body thud and exhale |
| Heavy hit | big blood splat, vignette | `groundedHurt` |
| Kill | ash motes settle, dust ring | `monsterDown` (already sounded) |
| Flee | dust kick, "you break away" | **`groundedFlee`**: running steps and breath |
| Rain / cold | grey-brown streaks / pale edge chill | **`weatherRain`** / **`weatherCold`** (now plays after day 7 too) |
| Death | brown-black fade, name, "the fire is lit anyway." | `playerDeathSting` / `defeat` (already sounded) |
| Footsteps | (move-anim) | `footstep` already plays every day |

System-flavoured kinds stay still before day 7: broadcast, commentary, hero cards, signatures, flashes, integration, social and contest.

## Payoff moments

| Moment | Hook (outside the owning file) | Visual | Sound | Haptic |
|---|---|---|---|---|
| Ascension ceremony | wraps `Godhood.recognitionCeremony` | 5 staged beats on the screen layer: dim, rising motes, light column, **the god-form sprite from `MYTHIC_SPRITES`** with name and title, then "THE PRICE" | **`ascensionRise`**: drone, widening, clean shimmer, major bloom, then an unresolved tritone | ascension |
| Class recognition | tele `class_recognized` | cold rounded System card: "Warden of the …" | **`classChime`** | levelUp |
| Level-up sheet opens | wraps `pumpLevelUps` | gold ring, sparks and "LEVEL n" above the sheet | **`levelUpFlourish`** | levelUp |
| Keepsake flashback | wraps `playFlashback` | sepia vignette, dust motes, warm serif card. Human only, also before day 7 | **`flashbackWarm`**: soft music-box notes and tape hiss | soft |
| Keepsake level-up | wraps `keepsakeLevelBeat` (L1 = the flashback only) | amber glow and a warm card | **`keepsakeGlow`** | soft |
| Feast | wraps `hostFeast` (ok only) | fire glow from below, rising embers, warm card with quality and turnout | **`feastFire`**: crackle, hearth hum, friendly triad | soft |
| Titan entry | wraps `startCombat` (titan in the fight) | letterbox bars, red edge, TITAN name card, shake | **`titanEntrySting`** + **the titan's own voice** (registry signature, or its encounter `aggroAudio`: finale → `fiTitleCard`, nielsen → `niWatch`, herald → `heraldTrumpet`) | titan |
| Titan phase (⅔, ⅓ HP) | wraps `tbDamage` | red edge pulse, crack, "IT CHANGES" / "IT IS DESPERATE" | **`titanPhaseSting`** | hit |
| Titan falls | wraps `tbEnd` (won/routed with the titan dead) | slow pale flash, "… FALLS", shake | **`titanFallSting`** | kill |
| The Table: entry | wraps `tableScene` | dark wash, ring of pale light, the eyes, "HUMANITY PRESENTS ITS CASE" | **`tableEnterSting`** (over the existing `table` music bed) | ascension |
| The Table: lock-in | wraps `tableStartPath` | ring closes, "THE DOOR IS CHOSEN" card | **`tableLockIn`** | soft |
| The Table: each beat | wraps `tableRunBeat` | a soft ring pulse | **`tableBeatPulse`** | — |
| The Table: win | wraps `tableResolveFinal` | dawn bloom, ring dissolving, sparks | **`tableWinSting`** (then the ending bed) | ascension |
| The Table: lose | wraps `tableFail` | dark wash, ring shatters into shards | **`tableLoseSting`** | death |
| Wave arrival | (already existed) | purple flash and shake | `waveUnlock` + `stingWave` | — |

## Day 7: the System arrives (`app.js systemArrivalAnimation`)

- **Open:** `arrivalSting` plays (stepped glitch bursts, a dropout, a cold tone over a sub drop), with the arrival haptic.
- **Each tapped beat:** `arrivalBed({beat})` holds a pad whose root note climbs with each beat. The previous bed crossfades out, and the bed has a 150 s ceiling, so it is never a loop.
- **Voice:** the System's recorded ElevenLabs lines are chained per beat. Lines are matched by text first (`systemVoiceIdFor`), with `feel.js ARRIVAL_VOICE` as the fallback:

  | Beat | Lines |
  |---|---|
  | contact | sys-day7-01 to 03 |
  | watched | 04 to 06 |
  | food | 07 to 10 |
  | gifts | 11 to 13, and 17 when the translator pitch line is present |
  | button | 14 to 16 |

  The pods beat and the knack beat have no recordings, so only the bed plays under them.
- **Tapping on:** stops the current line and moves to the next beat. **Finishing** stops the voice and fades the bed.
- **Degrades to silence:** when muted (`port()` returns null), with no AudioContext, before the first tap, with a missing manifest, or with a missing MP3.

## God-path abilities: one effect and one cue each

Actives fire on tele `godpath_verb`. Passives fire on their own tele event (`godpath_lifeline`, `godpath_ember`) or on the narration tag godpath.js writes at the end of the line, for example "(Last Rites)", once per round.

| Ability | Grid effect | Cue |
|---|---|---|
| aegis_link | a thread of light from you to the ally | thread |
| raise_earth | three earth blocks rise between you and it | wall |
| gravity_well | rings fall inward on the target | pull |
| landslide | the ground heaves outward from you, shake | push |
| pack_hunt | paw prints run from you to the target | pack |
| mending_hands | green ✚ motes rise off the mended | heal |
| lifeline (passive) | a thread to the ally who should be down | thread |
| keepers_oath (passive) | a keepsake glow ring | keepsake |
| mourners_bond (passive) | a keepsake glow ring | keepsake |
| last_rites (passive) | the fallen's pale echo rises | echo |
| blink | a fold of light where you are | blink |
| switcheroo | a dashed arc between the two who swapped | swap |
| misdirection (passive) | an afterimage drifting off you | blink |
| foresight | an eye opens over the target | foresee |
| prophecy (passive) | an eye opens over the target | foresee |
| live_broadcast | a red "● LIVE" tag and ring | broadcast |
| rally_aura (passive) | a gold ring of resolve | aura |
| the_crowd_moves | a line out to your people and a » chevron | command |
| stoke | embers lift off you | stoke |
| ember_heart (passive) | embers and ❤‍🔥 | stoke |
| back_from_the_brink (passive) | a red-gold burst | aura |
| coin_guard | coins orbit you | coins |
| haggle (passive) | coins | coins |
| bribe | a coin arcs to the beast | coins |
| sweetener (passive) | a coin arcs to the beast | coins |
| harvest_table (passive) | a bowl and steam | feed |
| long_table | a bowl and steam | feed |

## Monster signatures: what plays per monster

`game.js audioEvent` now plays the **live synth** whenever the registry entry is a placeholder render (`placeholder:true`) and a synth voice is registered. Real recordings (`placeholder:false`) still play first, with the synth as fallback. Three of the twelve placeholders had no synth until this pass: `fiCrewQuiet` and `fiOpeningSting` (empty stubs) and `auditTax` (it borrowed `tosPenalty`). They now have bespoke synths in `feel-audio.js`. The registry labels now say which is which.

| Monster | Hook | What plays |
|---|---|---|
| congregation | `congregationInvite` | **live synth** (placeholder render retired) |
| congregation | `congregationGeas` | real recording: church organ, Toccata & Fugue, horror |
| congregation | `congregationAbsolve` | real recording: long bells (Red Library) |
| strike | `strikeShutdown` | real recording: street protest (TriBeCa) |
| suburb | `suburbHum` | real recording: diesel lawnmower |
| focus_group | `focusGroupMurmur` | real recording: serious walla in a government chamber |
| redactor | `redactorPoint` | real recording: paper crumpling |
| gavel | `gavelVerdict` | **live synth** |
| spool | `spoolReplay` | real recording: projector running |
| chorus_line | `chorusBeat` | **live synth** |
| terms_of_service | `tosClause` | real recording: magazine pages turning |
| callback | `callbackRing` | **live synth** |
| buffering | `bufferStall` | real recording: dial-up modem handshake |
| ad_break | `adbreakCut` | **live synth** |
| influencer | `influencerRecruit` | real recording: Nikon shutter burst |
| audit | `auditTax` | **live synth (new: stamp thunk, paper slap, flat tone)** |
| reunion | `reunionMirror` | real recording: wound-up music-box lullaby |
| nielsen | `niWatch` | real recording: slow-starting applause |
| eater | `eaterGorge` | **live synth** |
| algorithm | `algorithmTick` | **live synth** |
| herald | `heraldTrumpet` | real recording: 1930s fanfare |
| cancellation | `cxDescend` | **live synth** |
| editor | `edCut` | real recording: scissors cutting card stock |
| rerun | `rrClap` | **live synth** |
| spoiler | `spSpoil` | real recording: PA announcement |
| timeslot | `tsTick` | real recording: clock ticking |
| finale | `fiTitleCard` | real recording: ten-minute timer |
| finale | `fiSacrifice` | real recording: short bell tolls |
| eulogy | `eulogyVerse` | real recording: deep bell |
| network_note | `nnNote` | real recording: typewriter |
| finale_crew (+ network_tower) | `fiCrewQuiet` | **live synth (new: a hush falls, a clapper, dead air)** |
| finale_opening (+ network_limb) | `fiOpeningSting` | **live synth (new: a four-note theme that ends flat)** |

**Animal pools:**
- The raccoon now has a real recording (`raccoon/1.mp3`, `lockpickFingers`).
- The turtle is still a documented gap: no usable recording exists, so its synth voices play (`turtleGrind` for aggro, `turtleSnap` for resolve).
- Every other animal pool uses a real recording.

## Haptics

`navigator.vibrate` is feature-detected. It is **on by default where supported**, and Settings → Feel → Vibration turns it off (`oversight_haptics`). Bursts are throttled to one per 90 ms, except death, ascension and arrival.

| Event | Pattern (ms) |
|---|---|
| hit taken | 35 |
| crit | 20 / 30 / 45 |
| death | 140 / 90 / 220 / 90 / 420 |
| level-up | 20 / 40 / 20 / 40 / 70 |
| ascension | 40 / 60 / 40 / 60 / 90 / 60 / 240 |
| System arrival | 300 / 140 / 60 / 60 / 60 / 60 / 120 |
| titan entry | 90 / 60 / 180 |
| soft moments | 12 |

**Judgement call:** haptics stay on under reduced motion. Vibration is not on-screen motion, and it has its own toggle.

## Reduced motion

The OS `prefers-reduced-motion` setting, or Settings → Feel → Reduce motion (`oversight_reduce_motion`), changes three things:
- `spawn()` swaps every animation class for a plain opacity fade (`drama-calm`).
- `shake()` does nothing.
- Infinite sub-animations are killed.

Every effect still appears, so the information survives, but nothing scales, spins, drifts or shakes.

## Engine fixes found on the way

1. **Drama effects were destroyed in the tick they spawned.** The overlay lived inside `.detail`, and every action ends with `refresh()`, which replaces the screen's innerHTML. So every hit, crit, hurt or signature fired during an action vanished. The overlay is now a body-level fixed layer laid over the grid's rect. `shake()` re-applies to the new `.detail` after the refresh.
2. **Anchored effects landed in the top-left corner.** `tileCenter` looked for the world map's `.tile`, but the fight grid uses `.cell[data-cx][data-cy]`, so positions came out as NaN. It now finds the fight-grid cell (9×9 or 12×12) first.
3. **A titan summoned onto a 9×9 node crashed the screen.** The Table's trial by combat (`_tableTrialDirect`) set `body.titan-fight` with a 9-row cell array, and `renderDetail` threw at `cells[9]`. It is now guarded.
