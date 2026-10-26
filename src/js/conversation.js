// @ontology
// system: conversation
// description: Real back-and-forth dialogue. Player always has response choices.
// provides:
//   - startConvo()
//   - convoMenuPage(vid, choices)
//   - convoNextMenu(vid)
//   - convoChoices(vid)
//   - convoBeatOf(choiceId, thread)
//   - convoFollowups(vid, topic)
//   - convoSpeakBackChoice(vid, suppressPivot)
//   - convoUI() -> {active, transcript, choices}
//   - convoTopicLedger(vid)
//   - convoNoteTopic(vid, tid, label)
//   - convoNoteBeat(vid, thread, line)
//   - convoNoteSpokenBeat(vid, line)
//   - convoThreadOpen(vid, tid, label, why, snippet)
//   - convoThreadResolve(vid, tid)
//   - convoOpenThreads(vid)
//   - convoResumeOpener(vid)
//   - convoTopicLabel(vid, tid)
//   - convoPlantOpenThread(vid, how)
//   - convoRecapLine(vid)
//   - convoRecapChoice(vid)
//   - convoDrift(vid)
//   - convoComputeDrift(vid)
//   - convoDriftedTemper(vid)
//   - convoSpeechDNA(vid)
//   - convoSpeechMarkers(vid)
//   - convoSkillOriginLine(vid, skill)
//   - convoVoiceState(name)
//   - convoSaidFacts(vid)
//   - convoSaidFact(vid, key, value)
//   - convoFactRecalled(vid, key)
//   - convoFactConflict(vid, key, value)
//   - convoVoiceSig(vid)
//   - convoDriftNote(vid)
//   - convoThreadAbout(vid, tid, label)
//   - convoCloseLine(vid)
//   - convoLapseLine(vid)
//   - convoPendingQDodge(vid) -> lapse line | null
//   - convoHeldAskDodge(vid)
// rules:
//   - compare_maps: choiceId 'compare_maps' merges their visited tiles into your shared map knowledge (code: convoTurn, via Game.compareMaps)
//   - transcript_cap: 200 entries (code: conversation.js, convoTurn push sites)
//   - one_beat_turns: a choice yields exactly one new THEM beat; follow-ons queue in c.heldBeats and surface as a voiced continuer ('goon', convoMoreLabel per person/mood/thread); unspoken beats die when the player moves on (code: conversation.js convoTurn, Steve 2026-10-05)
//   - tap_advance: one message per tap; msgIndex anchored on entry identity, never raw length; lands on their reply, not your echoed line (code: app.js chatChoice, Steve 2026-10-05)
//   - history_view: speaker tab toggles full scrollable transcript (code: app.js dialogueBoxHTML, Steve 2026-10-05)
//   - topic_ledger: per-villager topic memory — discussed counts plus open threads; leaving mid-thread or changing the subject plants an open thread, and open threads can resurface at the next conversation's opening (code: convoTopicLedger/convoNoteBeat/convoResumeOpener, Steve 2026-10-07)
//   - drift_derived: personality drift recomputed from lived events at most once per day and stored on the char; npcTemper() stays authoritative for sibling systems, the conversation layer reads convoDriftedTemper() (code: convoDrift/convoDriftedTemper, Steve 2026-10-07)
//   - speech_dna: discourse markers derive from the lifeseed register/pace/humor/address and merge into voiceLine's pools under the same one-marker-per-line restraint (code: convoSpeechDNA/convoSpeechMarkers, Steve 2026-10-07)
//   - recap_verb: the player can always ask what the conversation is about; the recap re-anchors from the per-conversation thread log (code: convoRecapLine/convoRecapChoice, Steve 2026-10-07)
//   - said_facts: stated facts go on the record (village.saidFacts) — generation sites record their claims and check before inventing, so speech never contradicts what was said earlier; convoFactConflict is the vetting primitive (code: convoSaidFact/convoFactRecalled/convoFactConflict, Steve 2026-10-07)
//   - voice_signature_stable: register|pace|humor|address is lifeseed-derived and immutable across turns and days; drift bends temper, never the signature (code: convoVoiceSig, Steve 2026-10-07)
//   - drift_visible: when a drift channel crosses >=2 since the last note, the next conversation opens with one short stage-direction beat showing the change — at most once per day per villager, always matching the actual drift state (code: convoDriftNote, Steve 2026-10-07)
//   - thread_lifecycle: open threads older than 14 days lapse into a remembered lapsed list (never silently deleted); resuming a lapsed topic gets an honest nod, and a hanging thread that gets discussed earns its closing beat at goodbye (code: convoTopicLedger/convoCloseLine/convoLapseLine, Steve 2026-10-07)
//   - resume_honest_time: the resume opener names how long the thread hung (a 12-day-old thread is not "last time") and nods at other hanging threads so none feel orphaned (code: convoResumeOpener, Steve 2026-10-07)
//   - goodbye_once_real: endConvo is a no-op on an inactive conversation (no repeat-call trust payouts); the talk stipend scales with exchanges (0=none, 1-2=+1, 3+=+3) and the mood residue (talk-capped at 40 like the stipend — words only go so far, r8 2026-10-09) lingers only after 3+ exchanges in a SUBSTANTIVE conversation (c.substantive set by the convoTurn wrapper / convoMarkSubstantive — agree-spam must not smuggle trust past the 40 talk cap) (code: endConvo, break-it 2026-10-08)
//   - question_dodge_lapse: a hanging bespoke question dodged with silence gets one noticed follow-up, then lapses honestly (same convention as dodged generic questions) — a lapsed question unblocks the winddown (!c.pendingQ gate); a queued-but-unrevealed question stonewalled twice is dropped unspoken (the moment passes, askedQs marked so it isn't re-queued) (code: convoPendingQDodge/convoHeldAskDodge, socialite r12 2026-10-10)
// consumes:
//   - village.villagers
//   - state.convos
//   - village.topicLog
//   - village.saidFacts
//   - village.memory
//   - npcNeeds(rid)
// ============ CONVERSATIONS ============
// Real back-and-forth dialogue. The player always has response choices —
// never just "continue". NPCs ask questions back, remember your answers,
// and every conversation has a shape: opening, development, natural end.
// No repeats: said lines are tracked per villager across all threads;
// exhausted threads admit it honestly instead of looping.
//
// Self-attaching module: loaded after game.js, adds/replaces Game methods.
// This keeps the conversation system in one file, independent of game.js churn.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // CONVO_DRIFT_VOICE (Steve 2026-10-07): speech inflections for drift
  // states. Kept in code (not data/characterGen.json — sibling-owned) so
  // the drift layer stays self-contained; convoVoiceState() merges these
  // under the data states.
  const CONVO_DRIFT_VOICE = {
    haunted:    { open: ['"…sorry. ', 'I keep thinking — '], close: [' …sorry.', ' Or something.'], terse: true, pMul: 0.8 },
    embittered: { open: ['Hah. ', 'Sure — '], close: [' Not that it matters.', " You'd know about that."], pMul: 1.1 },
    guarded:    { open: ['Careful — ', "I'll say this much: "], close: [" That's all I'll say.", ' …for now.'], terse: true, pMul: 0.9 },
    softened:   { open: ['You know — ', 'Honestly? '], close: [' Thank you for asking.', ', friend.'], pMul: 1.1 },
    hardened:   { open: ['Listen. ', "Here's how it is: "], close: [" That's the way of it.", ' End of story.'], pMul: 1.0 },
  };

  // CONVO_REGISTER_MARKERS (Steve 2026-10-07): discourse markers per
  // lifeseed speech register — HOW they talk, not what they say. Fed into
  // voiceLine's opener/closer pools by convoSpeechMarkers().
  const CONVO_REGISTER_MARKERS = {
    plainspoken: { open: ['Look — ', "Here's the thing: "], close: [" That's the whole of it.", ' Simple as that.'] },
    laconic:     { open: [], close: [' Hm.', ' …', '.'] },
    effusive:    { open: ['Oh! ', 'You know what — '], close: [' — ask anyone!', '!'] },
    wry:         { open: ['Well — ', 'Funny thing: '], close: [' Funny how that works.', ' — or so they tell me.'] },
    formal:      { open: ['If I may — ', 'Permit me: '], close: [' That is all.', ', as it were.'] },
    halting:     { open: ['I… ', '…'], close: [' …sorry.', ' …if that makes sense.'] },
  };

  // clipSnippet: thread snippets are quoted back as memories (MEMORY QUOTE,
  // deepening r11). A raw N-char slice cuts mid-sentence and the quote then
  // dangles ("...You're '") — transcript-verified senseless (journey
  // succession r13 2026-10-15). Clip at a word boundary with an honest
  // ellipsis so the fragment reads as a remembered fragment, not a bug.
  function clipSnippet(s, n) {
    const t = String(s == null ? '' : s).replace(/^"+|"+$/g, '');
    if (t.length <= n) return t;
    let cut = t.slice(0, n);
    const sp = cut.lastIndexOf(' ');
    if (sp > n * 0.55) cut = cut.slice(0, sp);
    return cut.replace(/[ ,;:—–-]+$/, '') + '…';
  }

  // ============ REACTIVE QUESTIONS ============
  // NPC lines phrased as DIRECT questions that the old system delivered as
  // small talk with no way to answer — the player could only change the
  // subject (the burdock non sequitur: "Did you see that?" -> plant lesson).
  // Each entry maps a line fragment to a lightweight question:
  // - contextual answers come FIRST in the choice list
  // - pivots (teach/theorize) are suppressed while it hangs in the air
  // - unanswered questions get ONE follow-up, then lapse with a line —
  //   they linger, never vanish mid-thought
  const REACTIVE_DEFS = {
    rq_treeline: {
      match: 'Did you see that, just now?',
      thread: 'spooked',
      answers: [
        { id: 'saw', label: '"I saw it too."',
          line: '"You did?" Their voice drops. "Then I\'m not imagining things. Stay close to the fire tonight — both of us."',
          trust: 2 },
        { id: 'no', label: '"I didn\'t see anything."',
          line: '"Hm." They keep watching the trees. "Maybe I\'m jumpy. Probably jumpy. ...Probably."',
          trust: 0 },
        { id: 'look', label: '"Let\'s go look. Together."', action: 'look_treeline', trust: 3 },
        { id: 'what', label: '"What did it look like?"',
          line: '"I don\'t know. Fast. Wrong-shaped." A pause. "Let\'s not go out alone tonight, yeah?"',
          trust: 1 },
      ],
      followUp: '"Hey — the tree line. Did you see it or not? I need to know I\'m not imagining things."',
      lapse: '"...Never mind. Probably nothing." They don\'t sound convinced. They keep glancing at the trees.',
      reacts: {
        agree: '"I know I saw it. That\'s what scares me."',
        joke: 'You try to laugh it off. It comes out wrong — and now you\'re both scared.',
        silence: 'You say nothing. They read your face, and go a shade paler.',
      },
    },
    rq_heard: {
      match: 'Did you hear that?',
      thread: 'spooked',
      answers: [
        { id: 'yes', label: '"I heard it too."',
          line: '"Okay. Okay, so it\'s real. ...I hate that it\'s real."',
          trust: 2 },
        { id: 'no', label: '"I didn\'t hear anything."',
          line: '"Huh. Lucky — or I\'m losing it." They keep watching the trees anyway.',
          trust: 0 },
        { id: 'what', label: '"What did it sound like?"',
          line: '"Like something big, moving careful. Like it didn\'t want to be heard."',
          trust: 1 },
      ],
      followUp: '"Don\'t tell me you didn\'t hear that. Please."',
      lapse: '"...It stopped. That\'s worse, somehow."',
      reacts: {
        agree: '"Right? It\'s out there. It\'s out there right now."',
        joke: 'You make a joke about the wind. Neither of you laughs.',
        silence: 'Your silence is answer enough. They edge closer to the fire.',
      },
    },
    rq_wants: {
      match: 'what do you think it actually wants from us?',
      thread: 'small',
      answers: [
        { id: 'test', label: '"Something\'s testing us."',
          line: '"That\'s what I keep coming back to. A test has rules. Rules can be learned."',
          trust: 1 },
        { id: 'dontknow', label: '"I have no idea."',
          line: '"Honest. I appreciate honest. I\'m tired of people pretending they know."',
          trust: 1 },
        { id: 'survive', label: '"Does it matter? We survive anyway."',
          line: 'A short laugh. "Fair. Philosophy\'s a luxury. Surviving\'s the job."',
          trust: 0 },
      ],
      followUp: '"I\'m serious — what do you think it wants? I need someone to sanity-check me."',
      lapse: '"...Forget it. Thinking in circles."',
      reacts: {
        agree: '"Right? It wants SOMETHING. The trick is figuring out what before it collects."',
        joke: '"Ha. "Wants" — like it\'s a person with a shopping list. ...Don\'t make me laugh about this."',
        silence: 'You don\'t answer. They nod slowly, like your silence confirmed something.',
      },
    },
    rq_shifting: {
      match: 'You feel it too, right?',
      thread: 'small',
      answers: [
        { id: 'yes', label: '"I feel it."',
          line: '"Good. Not good, but — good that it\'s not just me. Keep an eye on people, yeah?"',
          trust: 1 },
        { id: 'no', label: '"I think things are fine."',
          line: '"...Maybe. Maybe I\'m reading weather that isn\'t there." They don\'t look convinced.',
          trust: 0 },
        { id: 'how', label: '"Shifting how?"',
          line: '"Small things. Who sits where. Who stopped laughing. It adds up."',
          trust: 1 },
      ],
      followUp: '"The group — you really don\'t feel anything off?"',
      lapse: '"Forget I said anything."',
      reacts: {
        agree: '"Thank you. I needed someone else to say it out loud."',
        joke: 'You joke about group dynamics. They smile, but it doesn\'t reach their eyes.',
        silence: 'You say nothing. They take that as agreement — maybe correctly.',
      },
    },
    rq_personal: {
      match: 'Can I ask you something — person to person',
      thread: 'small',
      answers: [
        { id: 'yes', label: '"Of course. Ask."', action: 'ask_real', trust: 1 },
        { id: 'depends', label: '"Depends what it is."',
          line: '"Fair." A pause. "It\'s personal. But — we\'re past small talk, aren\'t we?"',
          action: 'ask_real', trust: 0 },
        { id: 'later', label: '"Maybe another time."',
          line: '"Of course. No pressure — the offer stands."',
          trust: 0 },
      ],
      followUp: '"I meant it — can I ask you something? Person to person."',
      lapse: '"Never mind. Forget it."',
      reacts: {
        agree: '"Okay. Good. Here goes, then —"',
        joke: '"I\'m being serious. ...Okay, one joke. Then I ask."',
        silence: 'You wait. They take a breath, and ask anyway.',
      },
    },
    rq_holding: {
      match: 'how are you holding up',
      thread: 'small',
      answers: [
        { id: 'honest', label: '"Honestly? Not great."',
          line: '"Thank you for saying it straight. Most people perform. I\'m tired of performances." You feel oddly steadier.',
          trust: 2 },
        { id: 'fine', label: '"I\'m fine."',
          line: '"Mm." They don\'t believe you, kindly. "Well. I\'m here if fine stops working."',
          trust: 0 },
        { id: 'busy', label: '"Better when I\'m busy."',
          line: '"Then let\'s find you something to do. Idle hands, idle thoughts."',
          trust: 1 },
      ],
      followUp: '"I asked how you\'re holding up. Honestly means honestly."',
      lapse: '"...I\'ll take the silence as an answer. It\'s okay."',
      reacts: {
        agree: '"Yeah. Me too, if I\'m honest." A small, real smile.',
        joke: 'You deflect with humor. They let you — this time.',
        silence: 'You don\'t answer. They sit with you anyway. That\'s the answer.',
      },
    },
    rq_alright: {
      match: 'Are you alright? Really?',
      thread: 'small',
      answers: [
        { id: 'notreally', label: '"Not really."',
          line: '"Okay. That\'s allowed, you know. Sit a minute?"',
          trust: 2 },
        { id: 'okay', label: '"I\'m okay."',
          line: '"You don\'t have to perform okay for me. But I won\'t push."',
          trust: 0 },
        { id: 'you', label: '"Are YOU?"',
          line: 'A surprised laugh. "Nobody asks me that. ...I\'m managing. Ask me again sometime."',
          trust: 2 },
      ],
      followUp: '"I\'m asking because I mean it. Are you alright?"',
      lapse: '"Okay. I\'ll stop hovering."',
      reacts: {
        agree: '"Good. That\'s good. Hold onto that."',
        joke: 'You joke. They smile, unconvinced but fond.',
        silence: 'Silence. They read it, and don\'t press. That\'s kindness.',
      },
    },
    rq_busy: {
      match: "What do you want? I'm busy.",
      thread: 'small',
      answers: [
        { id: 'talk', label: '"Just wanted to talk."',
          line: '"...Huh. Nobody just talks anymore." A pause. "Fine. Talk." They soften, barely.',
          trust: 1 },
        { id: 'help', label: '"Actually, I could use your help."',
          line: '"Knew it. Fine — what do you need?" Brisk, but not unkind.',
          trust: 0 },
        { id: 'nothing', label: '"Nothing. Sorry."',
          line: '"Right." They turn back to their work — but less sharply than before.',
          trust: 0 },
      ],
      followUp: '"Well? Busy doesn\'t mean gone. What do you want?"',
      lapse: '"..." They go back to work.',
      reacts: {
        agree: '"Right. Busy. We\'re all busy. That\'s the job now."',
        joke: 'A joke. Against all odds, the corner of their mouth moves.',
        silence: 'You stand there. "...You\'re still here. So it wasn\'t nothing."',
      },
    },
    rq_others: {
      match: 'Have you talked to the others lately?',
      thread: 'small',
      answers: [
        { id: 'bit', label: '"A bit. People seem..."',
          line: '"...Yeah. That\'s what I\'m seeing too. Keep checking in, yeah? It matters more than it looks."',
          trust: 1 },
        { id: 'worried', label: '"You\'re worried about the mood."',
          line: '"Someone should be. Moods are load-bearing, out here."',
          trust: 1 },
        { id: 'who', label: '"Who specifically?"',
          line: '"I don\'t want to name names. Just — pay attention. You\'ll see it."',
          trust: 0 },
      ],
      followUp: '"The others — have you talked to them? I\'m a little worried, honestly."',
      lapse: '"Forget it. Probably nothing."',
      reacts: {
        agree: '"I knew you\'d see it. You pay attention. I like that."',
        joke: 'You joke about village gossip. "It\'s not gossip if it\'s true," they say, half-smiling.',
        silence: 'You don\'t answer. "That silence tells me plenty," they murmur.',
      },
    },
    rq_monsters: {
      match: "the monsters aren't the problem?",
      thread: 'small',
      answers: [
        { id: 'maybe', label: '"Maybe they\'re not."',
          line: '"Right? What if they\'re — symptoms. Or guards. Or livestock. "Monsters" feels too easy."',
          trust: 1 },
        { id: 'chase', label: '"They feel like the problem when they\'re chasing you."',
          line: '"Fair. Very fair. I theorize from safety; you theorize from experience."',
          trust: 1 },
        { id: 'what', label: '"What else would they be?"',
          line: '"I don\'t know yet. That\'s why I\'m asking everyone. Collecting wrong answers until a right one shows up."',
          trust: 0 },
      ],
      followUp: '"Hear me out, though — what if the monsters aren\'t the problem? What are they, then?"',
      lapse: '"...Forget it. Half-baked."',
      reacts: {
        agree: '"I knew you\'d get it. Keep thinking — tell me what you land on."',
        joke: '"I\'m serious! ...Okay, it does sound unhinged out loud."',
        silence: 'You don\'t answer. "Yeah," they say quietly. "That\'s what I thought too."',
      },
    },
  };

  // ============ TOPIC FOLLOW-UPS (Steve 2026-10-06) ============
  // Thread coherence: after you ask about a topic, the next menu leads with
  // 2-3 things a person would actually say next — not the full topic dump.
  // Follow-ups reuse the thread's beat machinery ('more'), so the response
  // is always on-thread. When the thread has no more beats, the fallback
  // pools below carry the moment honestly instead of pivoting away.
  const TOPIC_FOLLOWUPS = {
    // These handlers continue the topic; they do not answer an arbitrary
    // specific question. Offer one honest continuation, not three aliases
    // promising different answers from the same generator.
    village: ['"Tell me more about the village."'],
    past: ['"Tell me more about your life before."'],
    goal: ['"Tell me more about what you want to do."'],
    plans: ['"Tell me more about your plans."'],
    gossip: ['"Tell me more about what you heard."'],
    personal: ['"Tell me more."'],
  };
  const TOPIC_FOLLOWUP_FALLBACK = {
    village: ['"It\'s home. Wasn\'t always, but it is now."', '"We make do. Everyone pulls weight — that\'s the whole secret."', '"Ask me again in a week. It changes that fast out here."'],
    past: ['"Feels like someone else\'s life, most days."', '"I don\'t think about it much. Then something reminds me."', '"It made me who I am. For better or worse."'],
    goal: ['"It\'s the thing that gets me up in the morning."', '"I think about it more than I say."', '"One step at a time. That\'s all anyone can do."'],
    plans: ['"We\'ll see. Plans out here are more like intentions."', '"Soon, I hope. Nothing\'s certain, but soon."', '"I\'ve been turning it over. I think it\'s time."'],
    gossip: ['"That\'s all I know. For now."', '"Keep it between us, yeah?"', '"People talk. I just listen."'],
    personal: ['"That\'s me, I suppose."', '"Funny, saying it out loud."', '"Not everyone asks. Thanks for asking."'],
  };
  const TOPIC_THREADS = ['village', 'past', 'goal', 'plans', 'gossip', 'personal'];

  // ============ GENERIC QUESTION ANSWERS (Rule 4) ============
  // NPCs ask direct questions all over the opener/small-talk pools — far
  // more than the bespoke REACTIVE_DEFS cover ("Are you eating enough?",
  // "Want to see?", "What's the move?"). A direct question with no
  // answerable option is the non-sequitur Steve flagged: the player can
  // only dodge. So: classify the question, offer real answers.
  // - yes/no shaped -> Yes / No / I don't know
  // - "how are you" shaped -> honest / fine / busy
  // - greeting ("what's up?") -> not much / surviving
  // - open -> "What do you think?" (they give a take) / "I don't know yet."
  // Rhetorical questions ("isn't that weird?", "don't answer that") are
  // NOT direct — agree/joke/silence already answer those fine.
  // Acknowledgments are human filler, tracked no-repeat per villager via
  // convoPick, like every other react pool.
  const GQ_ACK = {
    yes: ['"All right. Thank you for telling me."',
          'They nod. "Okay."',
          '"I see." They take a moment to think about your answer.'],
    no: ['"Okay. Thank you for telling me."',
         'They take that in without interrupting.',
         '"All right. I wanted to ask rather than assume."'],
    unsure: ['"It\'s all right if you don\'t know."',
             '"Okay. You don\'t have to have an answer."',
             'They nod, giving you room to think.'],
    howru_bad: ['"Yeah. Me too, if I\'m honest." A small, real smile.',
                '"Thank you for saying it straight. Most people perform."',
                '"Okay. That\'s allowed, you know. Sit a minute?"'],
    howru_fine: ['"Mm." They don\'t believe you, kindly. "Well. I\'m here if fine stops working."',
                 '"Good. Hold onto that."',
                 '"You don\'t have to perform okay for me. But I won\'t push."'],
    howru_busy: ['"Then let\'s find you something to do. Idle hands, idle thoughts."',
                 '"Busy is good. Busy means tomorrow."',
                 '"Same. Keep moving, keep okay."'],
    greet_notmuch: ['"Same. Same."', '"Yeah. That\'s the job now."',
                    '"Not much is good. Not much is safe."'],
    greet_surviving: ['"Aren\'t we all."', '"That\'s the whole resume now."',
                      '"Surviving counts. Don\'t let anyone tell you different."'],
    // Nodding along IS an answer to a direct question — small acks so the
    // passive conversationalist is never stranded mid-question.
    gq_agree: ['"Yeah." They take it.', '"Mm." That seems to land.',
               'Nods. "Okay. Good to know."'],
    gq_joke: ['You crack a joke. It lands, mostly.',
              'A joke. They snort despite themselves.',
              'You deflect with humor. They let you — this time.'],
    gq_silence: ['You say nothing. They read it as an answer.',
                 'Silence. They don\'t press.',
                 'You don\'t answer. They nod slowly, like your silence confirmed something.'],
  };
  // "What do YOU think?" — the take the NPC gives is now a plain short
  // reaction (see the 'take' answer branch): the old GQ_TAKES pool was
  // retired (conversation intent repair 2026-10-20, 3329c74bf) after its
  // "Short version:" self-openers kept doubling with voice openers
  // ("Quick version — Short version: I don't know…", audit F13 2026-10-21).
  // The pool is removed outright (sim-voicefix1 F13) so the template can't
  // be resurrected by a future wiring — it is dead content, not live data.
  const GQ_FOLLOWUP = '"Sorry — I asked you something there."';
  const GQ_LAPSE = '"Forget it. Wasn\'t important."';

  // classifyQuestion: direct question without a bespoke def? Returns
  // { kind, q } or null. kind: 'yn' | 'howru' | 'open'.
  function classifyQuestion(line) {
    if (!line || typeof line !== 'string') return null;
    // Gestures before a quote must not turn a yes/no question into an
    // unrelated open question (and its generic 'What do you think?' menu).
    const speech = [...line.matchAll(/"([^"]+)"|“([^”]+)”/g)].map(m => m[1] || m[2]).join(' ');
    let t = String(speech || line).replace(/^[\s"'“”‘’]+|[\s"'“”‘’.,;:—–-]+$/g, '');
    // The direct question can sit mid-line ("Are you eating enough? You
    // look thin.") — take the first question sentence, not just a trailing one.
    let m = t.match(/([^.?!]*\?)/);
    if (!m) return null;
    // A talk request has already opened the conversation. When its courtesy
    // preface introduces a reason, answer that reason (or its real question),
    // rather than offering Yes/No to "Can we talk?" after hearing the concern.
    if (/^(can|could) we (talk|speak)\?$/i.test(m[1].trim()) && t.slice(m.index + m[0].length).trim().length > 6) {
      t = t.slice(m.index + m[0].length).trim();
      m = t.match(/([^.?!]*\?)/);
      if (!m) return null;
    }
    // Voice preambles are delivery, not the grammar of the question. Match
    // the addressed clause after a colon/dash ("About the wound — have you
    // had a chance?") without turning a noun echo ("My plan?") into an ask.
    let q = m[1].trim().replace(/^(?:.*[:—–]\s*)(?=(?:you|do|did|is|are|can|could|would|should|will|have|has|was|were|does|what|who|where|when|why|how)\b)/i, '');
    // Discourse markers, not questions: a bare "Honestly?" / "Really?" /
    // "Right?" is a tag, not something the player must answer.
    if (/^(honestly|really|right|yeah|huh|eh)\?$/i.test(q)) return null;
    if (/^where (?:was|am) I\?$/i.test(q)) return null; // the speaker finding their place
    // TAG QUESTIONS: ", yeah?" / ", right?" / ", huh?" trail a statement —
    // rhetorical agreement-seeking, not a question to answer. ("Keep it
    // between us, yeah? Forget it." — socialite playtest 2026-10-06)
    if (/,\s*(yeah|right|huh|eh|ok|okay|you know)\?$/i.test(q)) return null;
    // RHETORICAL SELF-ANSWERED OPENERS: "You know what I miss? Minneapolis
    // rain." — the speaker answers themselves in the same line. Only when
    // the framing is rhetorical AND the line keeps talking after the "?".
    const rest = t.slice(m.index + m[0].length).replace(/[\s"'“”‘’.,;:—–-]+/g, '');
    if (rest.length > 6 && (/^(?:can|could) I (?:tell you|be honest)\b/i.test(q) ||
        /^(?:when|how|why) (?:did|do|am|was|have) I\b/i.test(q) ||
        /^(?:if I|doesn.t .*, does it)/i.test(q) || /^(?:what|honestly)\?$/i.test(q))) return null;
    // "Did you hear?" is gossip framing, never a genuine question — extracting
    // it produced the broken follow-up '"Sorry — I asked you something
    // there." Did you hear?' (journey-scale r3 2026-10-11).
    if (/^(you know what|guess what|know what|wanna know|want to know|did you hear)\b/i.test(q) && rest.length > 6) return null;
    if (/isn'?t that (weird|strange|something)|rhetorical/i.test(q)) return null;
    // Rhetorical markers can trail the question ("...? Don't answer that.")
    if (/don'?t answer|never mind/i.test(t)) return null;
    if (/how are you\b/i.test(q) || /^(are )?you (doing )?(okay|ok|alright|all right)\?$/i.test(q)) return { kind: 'howru', q };
    if (/what'?s up\?|how'?s it going\?/i.test(q)) return { kind: 'greet', q };
    if (/^why (?:do|did|are) you (?:ask|asking)\?$/i.test(q) || /^what(?:'s| is) this about\?$/i.test(q)) return { kind: 'reason', q };
    if (/^what(?:'s| is) the count today\?$/i.test(q) || /^what day is it\?$/i.test(q)) return { kind: 'day', q };
    // Colloquial yes/no: "you ever...?", "have you ever...?"
    if (/^(do you ever|you ever|have you ever|did you ever)\b/i.test(q)) return { kind: 'yn', q };
    // Imperative-as-question: invitations and requests ("Grab an end?",
    // "Walk with me?", "Smile for me?", "Say that again?"). Yes/No fits.
    if (/^(grab|take|walk|sits?|come|join|help|look|listen|smile|race|stay|wait|tell me|say|repeat)\b/i.test(q)) return { kind: 'yn', q };
    if (/^(do|did|is|are|can|could|would|should|will|have|has|was|were|does|am|don't|can't|won't|isn't|aren't|want to|wanna|shall we)\b/i.test(q)) return { kind: 'yn', q };
    if (/^(what|who|whose|which|where|when|why|how)\b.+\?/i.test(q)) return { kind: 'open', q };
    return null; // a name/topic echoed as a question is not a player question
  }

  // A discovered introduction waits behind the current exchange, like other
  // follow-on beats. Queuing it must not claim that the player has heard it.
  function queueTraderIntro(c) {
    if ((!c.traderIntroPending && !c.invitePending) || c.pendingQ || c.reactiveQ || c.genericQ || c.heldAsk || c.windingDown) return;
    if (c.thread === 'want' && c.want && ((c.want.stage || 0) < 2 ||
        (['ask_favor','seek_comfort','seek_taken','warn_you'].includes(c.want.id) && (c.want.stage || 0) < 3))) return;
    c.heldBeats = c.heldBeats || [];
    if (c.heldBeats.some(h => h.ask || h.traderIntro || h.invitation)) return;
    if (c.invitePending) {
      c.heldBeats.push({ text: c.invitePending, invitation: true });
      c.invitePending = null;
      return;
    }
    c.heldBeats.push({ text: c.traderIntroPending, traderIntro: true });
    c.traderIntroPending = null;
  }

  // floraWords: the green world coming up in conversation. Teaching later
  // can connect to it (Rule 2: show/teach relates to what's discussed).
  const FLORA_WORDS = /(forag|plant|herb|\broot\b|berr|mushroom|\bgreen\b|grow|\bseed\b|garden|\beat\b|food|cook|meal|dandelion|burdock|nettle|ramp|acorn|walnut)/i;

  const methods = {

    talkTo(vid) {
      // Now opens a real conversation. Kept for compatibility — returns the opening line.
      const st = this.startConvo(vid);
      return st ? st.line : null;
    },

    vpOf(vid) {
      return (this.data.villagers || []).find(x => x.id === vid)
        /* unified: hydrated seeds are in villagers */
        || ((((this.state || {}).village) || {}).rosterChars || {})[vid] || {};
    },

    // cleanDialogue: defense-in-depth against doubled quotes. Dialogue data
    // sometimes carries its own quotes and a template wraps it again —
    // ""x"" reads broken. Collapse accidental doublings at the edges.
    // Applied at render (both chat paths), so every conversation benefits.
    cleanDialogue(text) {
      let t = String(text == null ? '' : text);
      t = t.replace(/^""+/, '"').replace(/""+$/, '"');
      return t;
    },
    // quoteWrap: wrap a line in exactly one pair of quotes. Flavor and
    // System text sometimes carry their own quotes; naive '"'+t+'"' doubles
    // them (the ""PLANTS LIKE YOU!"" bug). Strip, then wrap — once.
    quoteWrap(text) {
      const t = this.cleanDialogue(text).replace(/^"+/, '').replace(/"+$/, '');
      return '"' + t + '"';
    },

    // voiceMods: what has this person LIVED through? Voice isn't a static
    // template from generation — people change during a run. A villager
    // who's been threatened, betrayed, or grieved sounds different than on
    // day 1. Derived from memory + trust + mood; no state writes.
    // (Steve 2026-10-06: unique-person law — not the same person throughout.)
    voiceMods(vid) {
      const v = this.state.village || {};
      const mods = [];
      const mem = (v.memory || {})[vid] || [];
      const day = (this.state.scholar || {}).day || 1;
      const recent = n => mem.filter(m => day - (m.day || 0) <= n).map(m => m.t);
      const r7 = recent(7), r4 = recent(4);
      const has = (arr, ...ts) => ts.some(t => arr.indexOf(t) !== -1);
      try { if (this.npcMood(vid) === 'grieving') mods.push('grieving'); } catch (e) {}
      if (has(r7, 'confronted', 'hostile', 'you_threatened', 'moot_vote', 'observed')) mods.push('scarred');
      if (has(r7, 'promise_broken', 'rumor_about_them', 'caught_you_stealing', 'suspects_you_stealing', 'deal_refused')) mods.push('betrayed');
      if (has(r4, 'gift', 'private_gift', 'saved', 'hero', 'comforted', 'promise_kept', 'amends', 'mediated')) mods.push('grateful');
      if (((v.trust || {})[vid] || 10) >= 55) mods.push('close');
      // DRIFT (Steve 2026-10-07): what they've lived through keeps bending
      // the voice. A grieving person halts; a betrayed one hardens. These
      // states resolve through convoVoiceState() (drift table under data).
      try {
        const dr = this.convoDrift(vid) || {};
        if ((dr.grief || 0) >= 2) mods.push('haunted');
        if ((dr.bitterness || 0) >= 2) mods.push('embittered');
        if ((dr.wariness || 0) >= 2) mods.push('guarded');
        if ((dr.warmth || 0) >= 2) mods.push('softened');
        if ((dr.hardness || 0) >= 2) mods.push('hardened');
      } catch (e) {}
      return mods;
    },

    // voicePool: terse people say less. When selecting from a generic pool,
    // prickly/withdrawn/grieving villagers prefer short lines — fragments,
    // not paragraphs. Falls back to the full pool when nothing is short.
    voicePool(vid, pool) {
      if (!pool || pool.length < 4) return pool;
      const temp = String(this.npcTemper(vid) || 'steady').toLowerCase();
      const V = (this.data.characterGen || {}).voice || {};
      const prof = (V.profiles || {})[temp] || {};
      let terse = !!prof.terse;
      if (!terse) {
        for (const m of this.voiceMods(vid)) {
          if (((this.convoVoiceState(m) || {}).terse)) { terse = true; break; }
        }
      }
      if (!terse) return pool;
      const short = pool.filter(s => String(s).length < 75);
      return short.length >= 2 ? short : pool;
    },

    // npcVoiceSet: WHICH age-voice this villager speaks in. Seeded by
    // villager id -- stable for the whole run, unique per person. Same age
    // band, different set: two young villagers with the same temperament
    // still sound like different people. (Steve 2026-10-06: diversity --
    // not one voice per age band.)
    npcVoiceSet(vid) {
      const bandOf = (id) => (this.npcAgeBand ? this.npcAgeBand(id) : 'adult') || 'adult';
      const tempOf = (id) => String(this.npcTemper(id) || 'steady').toLowerCase();
      const band = bandOf(vid);
      const sets = ((((this.data || {}).characterGen || {}).voice || {}).ageSets || {})[band] || {};
      const ids = Object.keys(sets);
      if (!ids.length) return null;
      const rawPick = (id) => {
        const h = this._hashStr ? this._hashStr('ageset:' + id) : 0;
        return ids[Math.abs(h) % ids.length];
      };
      // UNIQUE-PERSON LAW (Steve 2026-10-06): no two villagers share a full
      // voice fingerprint. Collisions resolve in canonical vid order -- each
      // villager keeps their seeded pick unless an earlier villager with the
      // same band+temperament already holds it, then takes the first free
      // set. Same roster always yields the same assignment; call order
      // never matters.
      try {
        const roster = (((this.state || {}).village || {}).roster || []).slice().sort();
        if (roster.indexOf(vid) !== -1) {
          const myTemp = tempOf(vid);
          const taken = new Set();
          for (const other of roster) {
            if (other === vid) break;
            if (bandOf(other) !== band || tempOf(other) !== myTemp) continue;
            let op = rawPick(other);
            if (taken.has(op)) {
              const alt = ids.find(id => !taken.has(id));
              if (alt) op = alt;
            }
            taken.add(op);
          }
          let pick = rawPick(vid);
          if (taken.has(pick)) {
            const alt = ids.find(id => !taken.has(id));
            if (alt) pick = alt;
          }
          return pick;
        }
      } catch (e) {}
      return rawPick(vid);
    },
    // npcVoiceFingerprint: the full voice identity -- age band + age set +
    // temperament. Two villagers sharing all three would sound alike; the
    // uniqueness test (test-npc-age-voice.js) enforces no collisions across
    // a generated roster. (Steve 2026-10-06 unique-person law.)
    npcVoiceFingerprint(vid) {
      const band = (this.npcAgeBand ? this.npcAgeBand(vid) : 'adult') || 'adult';
      const set = this.npcVoiceSet(vid) || 'none';
      const temp = String(this.npcTemper(vid) || 'steady').toLowerCase();
      return band + ':' + set + ':' + temp;
    },
    // voiceLine: HOW they say it, not what they say. The temperament profile
    // is the base voice (who they are); the age set inflects it with life
    // stage (how long they've been who they are); voiceMods inflect it with
    // what they've lived through (who they've become). Applies an opener OR a
    // closer — never both; restraint is what keeps it voice, not mannerism.
    // Only touches plain quoted speech; stage directions pass through.
    // Never call on choice labels (sibling's lane) or turn-flow text.
    voiceLine(vid, line) {
      const t = String(line == null ? '' : line);
      if (!/^".*"$/.test(t)) return line;
      // Requests already carry a precise action and response contract.
      // Random semantic mannerisms ("It'll be fun", "how are YOU?") can
      // contradict an injury or introduce a second unanswered question.
      const request = this.state.village?.conv?.[vid];
      if (request?.active && ['ask_favor', 'repay'].includes(request.want?.id)) return line;
      const temp = String(this.npcTemper(vid) || 'steady').toLowerCase();
      const V = (this.data.characterGen || {}).voice || {};
      const prof = (V.profiles || {})[temp] || (V.profiles || {}).steady || {};
      const mods = this.voiceMods(vid);
      let p = prof.p || 0.3;
      let opens = (prof.open || []).slice();
      let closes = (prof.close || []).slice();
      // AGE VOICE (Steve 2026-10-06): a brash young bold villager and a
      // flinty elder bold villager share a temperament and sound nothing
      // alike. The age set layers with temperament -- never overrides it.
      const ageSetId = this.npcVoiceSet(vid);
      const ageBand = (this.npcAgeBand ? this.npcAgeBand(vid) : 'adult') || 'adult';
      if (ageSetId) {
        const aset = (((V.ageSets || {})[ageBand] || {})[ageSetId]) || {};
        if (aset.open) opens = opens.concat(aset.open);
        if (aset.close) closes = closes.concat(aset.close);
      }
      for (const m of mods) {
        const st = this.convoVoiceState(m) || {};
        if (st.open) opens = opens.concat(st.open);
        if (st.close) closes = closes.concat(st.close);
        if (st.pMul) p *= st.pMul;
        if (st.hush && st.hush.indexOf(temp) !== -1) p *= 0.35;
      }
      // SPEECH DNA (Steve 2026-10-07): per-person discourse markers from the
      // lifeseed backstory — register, pace, humor, what they call you. A
      // laconic elder and an effusive youth never share mannerisms, even at
      // the same temperament. Same restraint as everything else: the pools
      // merge, still one marker per line, cycling never exhausting.
      try {
        const dna = this.convoSpeechMarkers(vid);
        if (dna) {
          if (dna.open) opens = opens.concat(dna.open);
          if (dna.close) closes = closes.concat(dna.close);
        }
      } catch (e) {}
      if ((!opens.length && !closes.length) || Math.random() >= p) return line;
      const inner = t.slice(1, -1);
      const isQ = /\?\s*$/.test(inner);
      // FAVOR HEADS (journey establishment r5 2026-10-12): a self-naming head
      // already opens its own discourse — a voice opener doubles it ("The way
      // I read it — Never mind the food I needed — ...", caught live). Openers
      // never lead heads; dash-led closers are filtered too (they stutter
      // against the head's own beat — "Thanks anyway." + " — anyway.").
      // Trailing/address closers ("…", ", friend.") stay — voice without the
      // doubling.
      const favorHead = (typeof this.convoFavorHead === 'function') && this.convoFavorHead(t);
      // Openers don't lead questions ("I think are you okay?" is broken).
      let useOpen = opens.length && (!closes.length || (!isQ && Math.random() < 0.45));
      if (favorHead) useOpen = false;
      let pool = useOpen ? opens : closes;
      // DISMISSAL CLOSERS (journey endgame 2026-10-11; sim-voicefix1 F9
      // 2026-10-21: DNA's old " — anyway." / " — comedy." dash-tags are gone —
      // they became the spoken ", anyway." and " Ha."). A dash-led closer
      // after a direct question reads as answering yourself ("Will you help
      // me? — or so they tell me."), so the remaining dash-led asides
      // (wry's " — or so they tell me.") are filtered on questions; questions
      // keep trailing/address closers ("…", ", name.", "Ha. Funny.") only.
      if (!useOpen && isQ) {
        const filtered = pool.filter(b => !/^ — /.test(String(b)));
        if (filtered.length) pool = filtered;
      }
      if (favorHead) {
        const fc = pool.filter(b => !/^\s*—/.test(String(b)));
        if (fc.length) pool = fc;
      }
      // Mannerisms cycle, never exhaust: real people repeat their tics.
      // convoPickCycle reshuffles when the pool runs dry.
      let bit = this.convoPickCycle(vid, 'voice:' + temp + ':' + ageBand + ':' + (ageSetId || 'none') + ':' + mods.join('+') + ':' + (useOpen ? 'o' : 'c'), pool);
      if (!bit) return line;
      // COMMA-OPENER CASE (journey deepening 2026-10-11): an opener that ends
      // in ", " ("Honestly, ", "Well, ") continues the clause — the composed
      // line must continue lowercase ("Honestly, we never finished…"), not
      // "Honestly, We never finished…". Dash openers ("Let me be straight — ")
      // and sentence openers ("Look. ") keep the capital: they start a new
      // clause. Never touch the pronoun I, and never downcase a name — only
      // common sentence-starters survive the rule.
      let said = inner;
      let sep = ' ';
      if (useOpen && /, $/.test(bit)) {
        const fw = (/^([A-Za-z']+)/.exec(said) || [])[1] || '';
        if (/^(we|you|they|he|she|it|that|this|these|those|there|then|the|a|an|my|our|your|their|his|her|its|no|yes|well|so|and|but|if|when|because|not|never|just|still|even|only)$/i.test(fw)) {
          said = said.charAt(0).toLowerCase() + said.slice(1);
        }
      } else if (!useOpen && /^\s*,/.test(bit)) {
        // COMMA-CLOSER FOLD (journey-succession 2026-10-12): a closer that
        // begins with a comma (", friend.", ", as it were.", DNA ", kid.")
        // attaches to the clause — appended after the line's terminal mark
        // it stutters ("...say different. , friend.", seed 302). Fold it
        // in: strip the line's terminal mark, tuck the address into the
        // clause with no join space ("...say different, friend."); a
        // question keeps its mark at the very end ("...coming with us,
        // friend?"). Dash-led closers (" — or so they tell me.") stay
        // trailing asides — untouched.
        const tm = /([.!?])\s*$/.exec(said);
        if (tm) {
          said = said.slice(0, tm.index);
          if (tm[1] === '?') bit = bit.replace(/\.\s*$/, '?');
          bit = bit.replace(/^\s+/, '');
          sep = '';
        }
      }
      // PUNCTUATION FOLD (journey landing r7 2026-10-12; extended journey
      // endgame r11 2026-10-14, ported 2026-10-15): a bare-punctuation closer
      // ('!', '.', from the effusive/laconic mannerism pools) appended after
      // the line's own terminal mark stutters ("...knows about? !", seed 999
      // day 6; "...Solid person. .", endgame r10 transcript) — same bug
      // class as the comma-closer fold above. Fold it: a question keeps its
      // mark and the closer is dropped (a question stays a question); any
      // other terminal mark is swapped for the closer ("...ask anyone!" —
      // never "...ask anyone. !"); a line with no terminal mark takes the
      // punctuation with no join space ("...I see." — never "...I see .").
      if (!useOpen && /^[.!?…]+$/.test(bit.trim())) {
        const ptm = /([.!?…])\s*$/.exec(said);
        if (ptm) {
          if (ptm[1] === '?') return line;
          return '"' + said.slice(0, ptm.index) + bit.trim() + '"';
        }
        return '"' + said + bit.trim() + '"';
      }
      // SPACE-LED CLOSER JOIN (journey establishment r7 2026-10-12): most
      // closers carry their own leading space (' Not that it matters.',
      // ' Funny how that works.') and sep adds another — "Will you?  Funny
      // how that works." (seed 424242 d30). A space-led closer needs no join
      // space. (Comma-closers already fold with sep=''; punctuation closers
      // return early above.)
      if (!useOpen && /^\s/.test(bit)) sep = '';
      return useOpen ? '"' + bit + said + '"' : '"' + said + sep + bit + '"';
    },

    // sayLine: THE single emission point for NPC speech (convo rebuild
    // 2026-10-11, Steve: fix structurally). Every villager line in a
    // conversation passes through here — no exceptions, no side channels.
    // It does three things atomically: (1) enforces the NO-REPEAT invariant
    // — a 'them' line already said in THIS conversation is never emitted
    // again (returns null; the caller must pick another beat or end the
    // thread honestly, never filler); (2) pushes the transcript entry;
    // (3) says the feed line with exactly one quote layer.
    // Lines flowing through convo are pre-quoted speech (voiceLine's contract:
    // "only touches plain quoted speech"), so a blind `Name: "line"` wrap
    // produced `Name: ""line""`. A line that already opens with a quote
    // carries its own layer; bare narration still gets wrapped. (Steve 2026-10-06)
    // QUOTE HYGIENE (fix 2026-10-07): beats that mix stage direction with
    // quoted speech (`leans in. "Oh?"`) carry their own speech layer too —
    // wrapping those produced `Name: "leans in. "Oh?""`. If the beat contains
    // a quoted segment anywhere, it keeps its own layer. (Socialite playtest
    // 2026-10-07; the cleanDialogue defense only covered edge doublings.)
    // convoSplitBeats: pagination for the one-screen rule (dialog-ui-fix
    // 2026-10-11, Steve 2026-10-05: moment-to-moment play never scrolls).
    // A single NPC beat must fit the dialogue box without scrolling — so a
    // long line is split HERE, at the emission choke point, into multiple
    // transcript entries. Tap-advance (▼) walks them beat by beat; the
    // render layer never needs a scrollbar. Splits land on sentence
    // boundaries, never mid-word; a pathological single sentence falls back
    // to word boundaries. Returns [line] when it already fits.
    convoSplitBeats(text) {
      const MAX = 260;
      const t = String(text || '');
      if (t.length <= MAX) return [t];
      // Split into sentences on . ! ? ; — : followed by space, plus em-dashes.
      const parts = t.split(/(?<=[.!?;:])\s+|(?<=\u2014)\s+/);
      const chunks = [];
      let cur = '';
      const flush = () => { if (cur) { chunks.push(cur); cur = ''; } };
      for (const s of parts) {
        if (!s) continue;
        if ((cur + (cur ? ' ' : '') + s).length <= MAX) {
          cur = cur ? cur + ' ' + s : s;
        } else {
          flush();
          if (s.length <= MAX) { cur = s; }
          else {
            // Single over-long sentence: split at word boundaries.
            const words = s.split(/\s+/);
            let wcur = '';
            for (const w of words) {
              if ((wcur + (wcur ? ' ' : '') + w).length <= MAX) {
                wcur = wcur ? wcur + ' ' + w : w;
              } else {
                if (wcur) chunks.push(wcur);
                // A single word longer than MAX: hard cut (never happens
                // with real dialogue, but the box must not scroll).
                while (w.length > MAX) { chunks.push(w.slice(0, MAX)); w = w.slice(MAX); }
                wcur = w;
              }
            }
            if (wcur) chunks.push(wcur);
          }
        }
      }
      flush();
      return chunks.length ? chunks : [t];
    },

    sayLine(vid, line, opts) {

      const c = this.convoGet(vid);
      const t = String(line == null ? '' : line);
      if (!t) return null;
      // PAGINATION (dialog-ui-fix 2026-10-11): long lines become multiple
      // transcript entries — one beat per tap, never a scroll box.
      const chunks = this.convoSplitBeats(t);
      // NO-REPEAT INVARIANT: per-conversation ledger of emitted NPC lines.
      // Checked on the final rendered string — what the player sees is what
      // must not repeat. saidLines survives the transcript cap (old entries
      // shift off the transcript but stay in the ledger). The first chunk
      // identifies the line: a repeat blocks the whole line.
      const key = chunks[0].trim();
      c.saidLines = c.saidLines || [];
      // RUN-WIDE LEDGER (dialog-ui-fix 2026-10-11, defect 7): the no-repeat
      // choke point spans NPCs within a run — Lena and David must not speak
      // the same line verbatim. Per-conversation saidLines can't catch that.
      const runLedger = this.convoRunLedger();
      // INVITATION HONESTY (journey landing r7 2026-10-12): an invitation
      // beat is a diegetic ACT, not flavor — the betrayal:accept/decline
      // menu quotes the same invite label verbatim regardless of the
      // ledgers. Blocking the spoken beat (a recent same-lure, or the same
      // villager's own earlier invite) produced the dry non-sequitur
      // "...Sorry, lost my train of thought." while the menu asked the
      // player to accept an invitation that was never extended — the exact
      // blind-accept failure (armed-plot invites travel the same channel)
      // the spoken-lure fix exists to prevent. Invitation beats are exempt
      // from both blocks; they still feed the ledgers below (honesty: they
      // were said). A repeated invitation reads as insistence, not a
      // parrot bug.
      const inviteAct = !!(opts && opts.inviteBeat);
      // DIEGETIC ACTS (journey-social r25 2026-10-18): betrayal-menu outcomes
      // ride the same exemption as invitation beats — they are speech acts,
      // not flavor (see betrayal.js finish()). The fixed outcome labels
      // ('Said. Now it's theirs to carry.') fire once per case, so the run
      // ledger false-positived them as parroting whenever two cases resolved
      // inside the 48-entry window (transcript-caught in every pilot:
      // tellside/askheard/bribe dry streaks). Game logic already guards true
      // repeats, so the exemption only ever removes the false positive.
      const diegeticAct = inviteAct || !!(opts && opts.diegeticAct);
      // STRUCTURAL BEATS (journey-social r17 2026-10-15): resume openers,
      // recap lines and thread-resume responses are conversation GRAMMAR,
      // not content — two villagers using the same structural beat in one
      // day is not parroting (defect 7's target). They skip the run-ledger
      // block, which was turning every post-first resume into a dry-line
      // deflection (transcript-caught across 6 pilot runs: the resume
      // machinery's filler loop). The per-sitting ledger still applies, so
      // true same-conversation repeats keep the honest "I just said" path.
      const structural = !!(opts && opts.structural);
      // PER-SITTING SELF-BLOCK (journey-social r24 2026-10-18): the old
      // check read the flat c.saidLines, which persists across sittings —
      // so a goodbye / silence / subject-change line said three days ago
      // blocked its own repeat forever and fell back to a deflection dry
      // line ("...Sorry, lost my train of thought." AS the goodbye —
      // transcript-caught; a 20-day probe measured 170 self-blocks, 151
      // of them dry). The pools do NOT rely on the flat list (they cycle
      // on per-key c.said[key] — nothing but the block check reads the
      // flat list); the no-repeat invariant was always meant
      // per-conversation (see the PAGINATION comment above). A villager
      // repeating a favorite line across sittings is a person, not a
      // parrot bug — the run ledger still stops same-day cross-villager
      // parroting, and the per-pool picker still spaces repeats.
      const selfBlocked = !diegeticAct && !structural && (c.saidLinesConvo || []).indexOf(key) !== -1;
      const runBlocked = !diegeticAct && !structural && !selfBlocked && runLedger.indexOf(key) !== -1;
      // THIS-SITTING vs OLDER (journey-social r16 2026-10-15): saidLines is
      // never reset between sittings (endConvo/startConvo leave it — the
      // pools rely on the persistence), so "self-blocked" conflates "said
      // five minutes ago in THIS conversation" with "said three days ago in
      // another sitting". The caller's "I just said — did you miss it?"
      // fallback is only honest for the first: a villager who told you
      // 'Nothing new.' about another case last week and snaps "did you miss
      // it?" today is accusing you of something that never happened (caught
      // in r16 grief transcripts: betrayal:askheard's reveal re-blocked
      // across sittings). saidLinesConvo is the per-sitting ledger (reset in
      // startConvo); only its hits keep the accusation fallback. Older
      // self-blocks get the honest dry line, like run-blocks.
      const convoBlocked = !diegeticAct && (c.saidLinesConvo || []).indexOf(key) !== -1;
      // FALLBACK (journey-social 2026-10-11): a blocked line must never go
      // silent — "no silent actions" is a standing rule, and a blocked beat
      // with fired consequences (trust/mood/evidence) but no words reads as
      // a dead verb. Self-repeat blocks use the caller's opts.fallback (or
      // null); run-ledger blocks get the honest dry line (convoDryLine).
      // Fallbacks are deliberately EXEMPT from the ledgers (generic by
      // design — ledgering them would just re-silence the beat).
      // RUN-BLOCK HONESTY (convo gaps 2026-10-11, Steve: "Address any
      // gaps!"): when the block comes from the RUN ledger, another villager
      // said the line recently — this speaker didn't. The old fallback
      // ("I just said — did you miss it?") LIED, and because it was
      // ledger-exempt it parroted verbatim on consecutive blocks, reading
      // as the NPC snapping at the player. Run-blocks now get an honest dry
      // line (per-conversation cycling, never verbatim); only true
      // self-repeats keep the caller's "I just said" fallback.
      let useChunks = chunks;
      // FELL-BACK (journey-social r17 2026-10-15): tracks whether the
      // primary line was no-repeat-blocked. Fallback chunks are meta-speech
      // ("lost my train of thought"), not thread content — they must not be
      // ledgered as the thread's last beat (transcript-caught: the resume
      // opener quoting dry lines as the unfinished topic). Mirrored onto
      // c._sayFellBack for the convoTurn tail, which otherwise ledgers the
      // unspoken primary as a beat.
      let fellBack = false;
      c._sayFellBack = false;
      if (selfBlocked || runBlocked) {
        fellBack = true;
        c._sayFellBack = true;
        if (runBlocked || (selfBlocked && !convoBlocked)) {
          // Another villager said it recently, or THIS villager said it in
          // an earlier sitting — the "I just said" accusation would be a
          // lie either way. Honest dry line.
          const dry = this.convoDryLine(vid);
          if (!dry) return null;
          useChunks = this.convoSplitBeats(dry);
        } else {
          let fb = opts && opts.fallback;
          // LAZY FALLBACK (journey-social 2026-10-12 r6): a function fallback
          // is only invoked when the block actually fires — eager evaluation
          // burned a pool slot on every successful sayLine and phase-shifted
          // the cycle. Plain strings still work.
          if (typeof fb === 'function') { try { fb = fb(); } catch (e) { fb = null; } }
          if (!fb) return null; // blocked: already said
          useChunks = this.convoSplitBeats(String(fb));
        }
        // generic fallback: never ledgered, never blocked
      } else {
        c.saidLines.push(key);
        c.saidLinesConvo = c.saidLinesConvo || [];
        c.saidLinesConvo.push(key);
        if (!structural) {
          runLedger.push(key);
          // WINDOW, not run-history (journey-social 2026-10-11): the ledger is
          // a backstop against ADJACENT parroting (defect 7: "Lena and David
          // must not speak the same line verbatim") — the pools + freshness do
          // the real work. A 400-entry whole-run window exhausted the shared
          // pools (favor wants, recaps, mood beats are legitimately reused
          // across villagers and days) and ate ~40% of npc beats. 48 entries
          // ≈ the current + previous few conversations: adjacent NPCs can't
          // parrot each other, day-old lines can breathe again.
          if (runLedger.length > 48) runLedger.splice(0, runLedger.length - 48);
        }
      }
      let first = null;
      if (fellBack) {
        // The promised ask did not reach the player. Never display answers
        // to it over a ledger fallback such as "lost my train of thought".
        c.pendingQ = null; c.reactiveQ = null;
      }
      // A generic answer belongs to the actual spoken ask, not to an earlier
      // line replaced by a mood beat, fallback or another speaker intention.
      if (c.genericQ && !useChunks.join(' ').includes(c.genericQ.q)) {
        c.genericQ = null;
        c.heldBeats = (c.heldBeats || []).filter(h => !h.genericFollowup);
      }
      for (const chunk of useChunks) {
        const entry = { who: 'them', text: chunk };
        if (this.convoRecordSpokenBeat) this.convoRecordSpokenBeat(vid, chunk, fellBack ? { tag: 'endtopic' } : opts);
        if (opts && opts.foreign) entry.foreign = opts.foreign;
        // (beat/topic tags are stamped by convo-beats' transcript-push wrapper
        // from c.lastBeat when present — same as before.)
        c.transcript.push(entry);
        while (c.transcript.length > 200) c.transcript.shift();
        if (first === null) first = chunk;
      }
      // ONE TEXT STREAM (dialog-ui-fix 2026-10-11, Steve: "same text in two
      // stacked panels"): NPC speech in a conversation lives ONLY in the
      // dialogue transcript — never echoed to the narration feed. The old
      // this.say() echo rendered every line twice (dialogue box + narration
      // box, truncating differently). The transcript is the record; the
      // narration surface is for narration, not dialogue.
      // TOPIC LEDGER (Steve 2026-10-07): every spoken NPC line is a beat on
      // the current thread. The dialogue layer (convo-dialogue.js) speaks
      // its beats through here, so this is the one hook that sees both the
      // base turns and the dlg: turns — the ledger stays complete even
      // though the dialogue layer intercepts dlg: choices before convoTurn.
      // Paginated chunks note each beat (the full line's beats, in order) —
      // the ACTUALLY SPOKEN chunks (fallback when the primary was blocked).
      // R17 (journey-social 2026-10-15): NOT the fallback chunks — dry-line
      // and self-repeat fallbacks are meta-speech, not thread content.
      // Noting them made deflections the thread's "last beat", which the
      // resume opener then quoted as the unfinished topic.
      try { if (!fellBack) for (const chunk of useChunks) this.convoNoteSpokenBeat(vid, chunk); } catch (e) {}
      // VOICED DIALOGUE (Steve 2026-10-11): speak each NPC beat in the
      // villager's own deterministic voice (voice-piper.js). Fire-and-forget;
      // mute/unlock/setting/foreign gates live inside convoSpeakLine.
      // Speaks what was ACTUALLY spoken (useChunks: the fallback when the
      // primary was no-repeat-blocked), never the blocked line.
      try { for (const chunk of useChunks) this.convoSpeakLine(vid, chunk, opts); } catch (e) {}
      // DRY STREAK + WIND-DOWN (journey-social r18 2026-10-16): count
      // consecutive deflection speeches — however they were produced. The
      // sayLine fallbacks (dry / self-repeat) are one source, but the dlg:
      // handlers (convo-dialogue.js) also draw the deflection pool directly
      // when a beat is blocked, bypassing the fallback path — counting only
      // fallbacks missed those and left 14-deep streaks. Three deflection
      // speeches in a row means the conversation has genuinely run dry: a
      // real person winds down here ("I should get back to it"), not a
      // fourth "lost my train of thought". Spend the energy budget so the
      // EXISTING convoMaybeWinddown machinery closes it naturally (queued
      // goodbye, continuer reveal, natural end) — all its gates still apply
      // (pendingQ, heldAsk, relationship-age winddown lines, spurn rules).
      // Any real beat resets the count. Silence (null first) leaves it.

      if (first && this.convoIsDeflectionLine(first)) {
        c.fallbackStreak = (c.fallbackStreak || 0) + 1;

        if (c.fallbackStreak >= 3 && c.active && !c.winddownQueued && !c.windingDown) {
          c.budget = Math.min(c.budget, c.exchanges);
        }
      } else if (first) {
        c.fallbackStreak = 0;
      }
      return first;
    },

    // convoRunLedger: the run-wide spoken-line registry (dialog-ui-fix
    // 2026-10-11, defect 7). Per-conversation saidLines can't stop two
    // different NPCs from speaking the same line verbatim in one run — this
    // can. Stored on the village (survives across conversations, resets with
    // the run). Capped as a recent WINDOW in sayLine (adjacent-parroting
    // backstop), not whole-run history.
    convoRunLedger() {
      const v = this.state.village || {};
      if (!v.convoRunLines) v.convoRunLines = [];
      return v.convoRunLines;
    },
    // convoAnswerReactLine (journey-social r20 2026-10-17): the voiced
    // acknowledgment for a player's answer, with the r19 opener pattern
    // applied to the two-candidate pool [specific react, generic "Huh.
    // Okay."]. A run-blocked specific react falls back to the generic
    // rather than going dry; if the generic is blocked too, sayLine's
    // normal handling dry-replaces it (honest). The fallback is voiced
    // through fillTalkLine only (no voiceLine cycle step): the extra
    // discourse-marker draw would perturb the villager's mannerism cycle
    // for a line that is pure acknowledgment. Kept as a method (not
    // inline) so the emission site stays a one-liner and the fallback is
    // unit-testable.
    convoAnswerReactLine(vid, react) {
      const voiced = (txt) => {
        // These reactions acknowledge the player's answer. Filling them as
        // NPC self-description lets a liar's origin scrub rewrite the place
        // the PLAYER just named (Columbus became the NPC's cover, Denver).
        try { return this.voiceLine(vid, txt); }
        catch (e) { return txt; }
      };
      const specific = voiced(react);
      try {
        if (!this.convoWouldBlock(vid, specific)) return specific;
      } catch (e) {}
      try { return this.fillTalkLine('"Huh. Okay."', this.vpOf(vid)); }
      catch (e) { return '"Huh. Okay."'; }
    },
    // convoWouldBlock (journey-social r19 2026-10-16): PURE predicate — would
    // sayLine no-repeat-block this line right now? Mirrors sayLine's block
    // decision (self ledger + run ledger, first-chunk key) without emitting
    // or ledgering. The opener chain uses it to SKIP a blocked candidate and
    // fall through to the next one: a real person with a blocked opener
    // picks a different line, not "...Sorry, lost my train of thought."
    // (r19 M1: 18.8% of driven openers were dry-replaced, all thread-
    // mismatched.) Structural/invite-exempt beats never block — callers
    // must not ask about those.
    convoWouldBlock(vid, line) {
      if (line == null) return false;
      const c = this.convoGet(vid);
      if (!c) return false;
      let key = String(line);
      try { key = this.convoSplitBeats(line)[0].trim(); } catch (e) {}
      if (!key) return false;
      // PER-SITTING (journey-social r24 2026-10-18): matches the sayLine
      // self-block — a line said in an earlier sitting is repeatable, not
      // blocked. (The r19 hard-mode opener fall-through keeps working: it
      // now skips only lines said in THIS sitting.)
      const said = c.saidLinesConvo || [];
      if (said.indexOf(key) !== -1) return true;
      try {
        const rl = (typeof this.convoRunLedger === 'function') ? this.convoRunLedger() : [];
        if (rl && rl.indexOf(key) !== -1) return true;
      } catch (e) {}
      return false;
    },

    // convoDryLine: honest dry lines for run-ledger blocks. The line was
    // swallowed because ANOTHER villager said it recently — the speaker
    // didn't, so "I just said" would be a lie. These admit the dropped
    // thread without snapping at the player. The pool covers the full
    // 9-use cap with DISTINCT lines (journey-landing r14: a 3-line pool
    // cycled to 9 uses parroted verbatim from use 4 — "...Actually, forget
    // it." twice in one conversation, seed 43). Never ledgered (generic by
    // design, like the old fallback). Capped: past 9 uses in one
    // conversation something else is broken and silence is the honest
    // signal.
    convoDryLine(vid) {
      const c = this.convoGet(vid);
      const DRY = this.convoDeflectionLines().slice(0, 9);
      const used = c.dryLines || 0;
      if (used >= DRY.length) return null;
      c.dryLines = used + 1;
      return DRY[used];
    },

    // convoSelfRepeatLine: honest deflections for SELF-repeat blocks. The
    // NPC already said the line in THIS conversation, so the caller has no
    // fresh line and the beat must not go silent (no-silent-actions is
    // standing law). The "THIS conversation" part is ENFORCED by sayLine
    // (journey-social r16 2026-10-15): blocks against lines said in earlier
    // sittings get the dry line instead — this pool only fires for
    // within-sitting repeats, where the accusation is true. A single hardcoded fallback parrots VERBATIM on
    // consecutive blocks (observed 2026-10-12: "I just said — did you miss
    // it?" x3 in one conversation) — the exact filler-loop Steve called
    // out. Per-conversation cycling pool, never verbatim, like
    // convoDryLine. The pool cycles FOREVER (journey-social 2026-10-12 r6):
    // the old "past 9 uses -> canonical" cap collapsed right back into the
    // verbatim parrot it was built to kill — 78 identical lines in one
    // run's evidence. A spamming player gets rotating honest brush-offs,
    // which is what a real person does. Never ledgered (generic by design,
    // same as sayLine's fallback rule). Counter resets in startConvo.
    convoSelfRepeatLine(vid) {
      const c = this.convoGet(vid);
      const POOL = this.convoDeflectionLines().slice(9);
      const used = c.selfRepeatLines || 0;
      c.selfRepeatLines = used + 1;
      return POOL[used % POOL.length];
    },

    // DEFLECTION LINES (journey-social r17 2026-10-15): the dry-line and
    // self-repeat fallback pools are META-SPEECH ("lost my train of
    // thought") — an honest admission that the beat didn't land, not
    // thread content. Central list so the thread ledger can refuse to
    // record them as "the last thing said" on a thread (transcript-caught:
    // resume openers quoting "...Sorry, lost my train of thought." as the
    // unfinished topic, and snippet-less ghost threads resuming as
    // unfinished business). convoDryLine draws the first 9, the
    // self-repeat pool the last 3.
    convoDeflectionLines() {
      return [
        '"...Sorry, lost my train of thought."',
        '"Hm. Never mind — go on."',
        '"...Actually, forget it."',
        '"...Where was I? Gone. Ask me something else."',
        '"Huh. That went clean out of my head."',
        '"...No, it\'s not coming back. What were you saying?"',
        '"Lost it. The thought, I mean. Go on."',
        '"...Sorry — that one slipped away from me."',
        '"Eh. Wasn\'t important. Probably."',
        '"I just said — did you miss it?"',
        '"I just told you — what else is on your mind?"',
        '"We\'ve covered this one. Ask me something else."',
      ];
    },
    convoIsDeflectionLine(text) {
      try {
        // Snippets are stored quote-stripped (clipSnippet); spoken lines
        // carry their dialogue quotes. Normalize both before comparing.
        const t = String(text == null ? '' : text).trim().replace(/^"+|"+$/g, '');
        if (!t) return false;
        return this.convoDeflectionLines().some(d => d.replace(/^"+|"+$/g, '') === t);
      } catch (e) { return false; }
    },

    // ACK LINES (journey-deepening r13 2026-10-16): thinking-aloud preamble
    // chunks the engine prepends to beats — topic acks (convo-wants.js),
    // the t2changeLine "it's different now" variants (convoTopics.js), the
    // personal "Me? Okay.". Delivery, not content: when a thread snippet is
    // noted from the final voiced line, the acks must not be quoted back as
    // the "memory" of the topic (transcript-caught: 'Huh. Let me think about
    // that." "You asked me that before. It's a different question now."
    // "The Witness. They…' as the memory of "what's been happening" — a
    // stitched fragment of fillers standing in front of the content).
    convoAckLines() {
      return [
        'Good question.',
        'Huh. Let me think about that.',
        'You want to know about that? Okay.',
        'Me? Okay.',
        "You asked me that before. It's a different question now.",
        'Last time things were different. They always are.',
        'Huh. I answered that once — back when the answer was simpler.',
      ];
    },
    // convoStripAcks: remove leading ack chunks from a spoken line before
    // noting it as a thread snippet. Tolerates a voice-opener prefix inside
    // the chunk (voiceLine may lead the whole line with one). Non-ack
    // first chunks (narration, single-chunk lines) stop the strip — the
    // line is kept whole.
    convoStripAcks(line) {
      try {
        let t = String(line == null ? '' : line);
        const ACKS = this.convoAckLines();
        const OPENS = ['Look — ', "Here's the thing: ", 'Oh! ', 'You know what — ',
          'Well — ', 'Funny thing: ', 'If I may — ', 'Permit me: ', 'I… ', '…',
          'Honestly, ', 'Well, ', 'Look. ', 'Let me be straight — '];
        for (let guard = 0; guard < 4; guard++) {
          const m = /^"((?:[^"\\]|\\.)*)"\s*/.exec(t.trim());
          if (!m) break;
          let inner = m[1];
          for (const o of OPENS) { if (inner.indexOf(o) === 0) { inner = inner.slice(o.length); break; } }
          if (ACKS.indexOf(inner) < 0) break;
          t = t.trim().slice(m[0].length);
        }
        return t;
      } catch (e) { return line; }
    },

    convoGet(vid) {
      const v = this.state.village;
      v.conv = v.conv || {};
      if (!v.conv[vid]) v.conv[vid] = {
        active: false, exchanges: 0, budget: 4, thread: null, depth: 0,
        said: {}, saidLines: [], transcript: [], pendingQ: null, askedQs: [],
        answered: {}, recalled: {}, lastDay: -1, count: 0, over: false,
        offeredHelp: false, askedTopics: [], qCount: 0,
        theorized: [], heldBeats: [], heldAsk: false,
      };
      const c = v.conv[vid];
      // Normalize older convo states (saves/scenarios predate the fields).
      if (!c.heldBeats) c.heldBeats = [];
      if (!c.saidLines) c.saidLines = [];
      if (typeof c.heldAsk === 'undefined') c.heldAsk = false;
      if (typeof c.winddownQueued === 'undefined') c.winddownQueued = false;
      if (!c.followUsed) c.followUsed = {};
      if (!c.threadLog) c.threadLog = [];
      // SPENT (journey-succession 2026-10-12): per-conversation ledger of
      // single-use choice ids (resumed threads, named memories, asked
      // events, invitations). finalizeMenu filters them; startConvo resets.
      if (!c.spent) c.spent = {};
      // PER-SITTING said-lines (journey-social r16 2026-10-15): normalized
      // for older convo states; startConvo resets it every sitting.
      if (!c.saidLinesConvo) c.saidLinesConvo = [];
      return c;
    },

    // convoSpendChoice(vid, choiceId): this choice was used in this sitting —
    // don't offer it again. People don't repeat themselves within one
    // conversation. (The ledger across conversations is untouched: a thread
    // resumed today can honestly resurface tomorrow.)
    convoSpendChoice(vid, choiceId) {
      if (!choiceId) return;
      try {
        const c = this.convoGet(vid);
        if (!c.spent) c.spent = {};
        c.spent[choiceId] = true;
      } catch (e) {}
    },

    // ============ CONVERSATION DEPTH (Steve 2026-10-07) ============
    // Dialogue coherence is the highest-leverage open problem. Four
    // deepening systems for the BASE conversation layer (this file only):
    //
    //   1. TOPIC LEDGER: per-villager memory of what was discussed, what's
    //      still open, and what was left hanging. Open threads resurface at
    //      the next conversation's opening.
    //   2. DRIFT: personality is not static. Lived events (death, betrayal,
    //      hunger, exile, kindness) shift a per-villager drift vector; the
    //      drifted temperament bends speech, never the stored npcTemper.
    //   3. SPEECH DNA: per-person discourse markers derived from the
    //      lifeseed backstory (register, pace, humor, address) — not a
    //      fixed cast of voices. Layered into voiceLine with the same
    //      one-marker-per-line restraint.
    //   4. COHERENCE STATE: a per-conversation thread log, a recap verb for
    //      long exchanges, and wiring points the convo-* scenario files use.
    //
    // WIRING POINTS for convo-*.js scenario files (sibling-owned — call
    // these, do not reimplement):
    //   Game.convoNoteTopic(vid, tid, label)       — a topic was discussed
    //   Game.convoNoteBeat(vid, thread, line)      — an NPC beat landed on a thread
    //   Game.convoThreadOpen(vid, tid, label, why, snippet) — mark unfinished
    //   Game.convoThreadResolve(vid, tid)          — mark finished
    //   Game.convoOpenThreads(vid)                 — [{tid,label,day,why,snippet}]
    //   Game.convoResumeOpener(vid)                — {line, thread} | null
    //   Game.convoDrift(vid)                       — {grief,bitterness,wariness,warmth,hardness}
    //   Game.convoDriftedTemper(vid)               — effective temperament string
    //   Game.convoSpeechDNA(vid)                   — per-person speech profile
    //   Game.convoSpeechMarkers(vid)               — {open:[], close:[]} for voiceLine
    //   Game.convoSkillOriginLine(vid, skill?)     — "who taught them" line
    //   Game.convoRecapLine(vid)                   — "what were we talking about?"
    //   Game.convoRecapChoice(vid)                 — menu choice object for the recap
    //   Game.convoVoiceState(name)                 — merged data + drift voice states
    //   Game.convoSaidFact(vid, key, value)        — put a stated fact on the record
    //   Game.convoFactRecalled(vid, key)           — what did they say about this before?
    //   Game.convoFactConflict(vid, key, value)    — would asserting this contradict the record?
    //   Game.convoVoiceSig(vid)                    — immutable register|pace|humor|address
    //   Game.convoDriftNote(vid)                   — visible drift-change beat (≤1/day)
    //   Game.convoThreadAbout(vid, tid, label)     — grammatical thread phrase for closing frames
    //   Game.convoCloseLine(vid)                   — closing beat for a resolved thread
    //   Game.convoLapseLine(vid)                   — honest nod for a lapsed thread
    //
    // Threads the ledger treats as substantive (worth resuming). Small talk,
    // requests, and nonverbal are never planted as open threads.
    // (module-level consts live just inside the IIFE, below the methods.)

    // ---------- 1. TOPIC LEDGER ----------
    // village.topicLog[vid] = { discussed: {tid: {times, firstDay, lastDay, label}},
    //                           open: [{tid, label, day, why, snippet}] }
    convoTopicLedger(vid) {
      const v = this.state.village || {};
      v.topicLog = v.topicLog || {};
      if (!v.topicLog[vid]) v.topicLog[vid] = { discussed: {}, open: [] };
      const L = v.topicLog[vid];
      if (!L.discussed) L.discussed = {};
      if (!L.open) L.open = [];
      if (!L.lapsed) L.lapsed = [];
      // People move on: open threads older than 14 days lapse — REMEMBERED
      // as lapsed, not deleted (COHERENCE Steve 2026-10-07). Circling back
      // to a lapsed topic gets an honest "we never did finish that one",
      // never a fresh-start lie. Resume openers only draw from L.open.
      const day = (this.state.scholar || {}).day || 1;
      const still = [];
      for (const o of L.open) {
        if (day - (o.day || 0) <= 14) { still.push(o); continue; }
        if (!L.lapsed.some(x => x.tid === o.tid)) {
          L.lapsed.push(o);
          if (L.lapsed.length > 4) L.lapsed.shift();
        }
      }
      L.open = still;
      return L;
    },

    // convoTopicLabel: a human phrase for a thread id, for resume lines and
    // the ledger. Generated topics resolve through the topic2 labels.
    convoTopicLabel(vid, tid) {
      if (!tid) return 'something';
      // REBUILD 2026-10-11: the 'want' thread is labeled by the actual want —
      // "what they want" is a leaked internal note, not a human label.
      // Neutral demonstratives ("that favor") — the label is spoken by the
      // NPC (resume opener) AND offered as the player's menu option, so it
      // can't be first- or third-person.
      if (tid === 'want') {
        try {
          const w = this.convoGet(vid).want;
          if (w && w.def && w.def.topicLabel) return String(w.def.topicLabel);
          const wid = w && w.id;
          // CURIOUS NAMES ITS QUESTION (journey social r14 2026-10-14): the
          // open-thread ledger and recap/resume lines labeled the thread the
          // generic 'that question' ("About that question — we never
          // finished."). When the want is curious and its question is known
          // (hanging now, or resumed from a seed), name the actual question —
          // same noun-phrase map as the seed note (convoQuestionTopic).
          if (wid === 'curious') {
            const c = this.convoGet(vid);
            // The want's own question first (recorded at hang time, so it
            // names correctly even after the question was answered), then
            // the seed resume id, then a live hanging question.
            const pqid = (c && c.want && (c.want.qid || c.want.seedQid)) ||
              (c && c.pendingQ && c.pendingQ.id) || null;
            if (pqid && typeof this.convoQuestionTopic === 'function') {
              const named = this.convoQuestionTopic(pqid);
              if (named && named !== 'that question') return named;
            }
          }
          const labels = {
            ask_favor: 'that favor', share_news: 'that news',
            seek_comfort: 'that hard time', warn_you: 'that warning',
            curious: 'that question', just_company: 'that visit', repay: 'that debt',
          };
          if (wid && labels[wid]) return labels[wid];
        } catch (e) {}
        return 'what was on their mind';
      }
      const base = {
        personal: 'themselves', goal: 'what they want', past: 'their past',
        village: 'the village', plans: 'their plans', gossip: 'the gossip',
        spread_rumor: 'that rumor', small: 'small talk', spooked: 'what spooked them',
        secret: 'their secret', request: 'their request',
        theorize: 'the big questions', trade: 'trading knowledge',
        situation: 'the situation', lately: "what's been happening",
        // SCENARIO THREADS (fix 2026-10-07): teach-offer and recall threads
        // can hang open via convoPlantOpenThread — without labels the
        // resume/recap lines leak the raw tid ("talking about taughtref").
        // REBUILD 2026-10-11: 'that lesson they offered' was the phantom's
        // label — the villager never offered a lesson. The honest label names
        // what happened, in neutral voice (spoken by NPC and player alike).
        taughtref: 'that plant lesson', recall: 'that personal stuff',
        // TABLE SITTING (journey-endgame r11 2026-10-14): the table opener's
        // thread id must never leak raw into resume/recap lines
        // ("talking about table") — the honest label is the table.
        table: 'the table',
      };
      if (base[tid]) return base[tid];
      // T2 SPEECH LABELS (journey-social r13 2026-10-14): t2 ask-labels are
      // menu-choice QUESTIONS ("Who's on your mind around here?") — the
      // player-facing choice text. Quoted as the topic noun in NPC speech
      // they leak the internal title ("We started on Who's on your mind
      // around here?..."). The topic label used by resume / recap / close /
      // lapse lines needs a plain noun phrase instead. Neutral voice (same
      // register as the base map: 'that favor', 'their skills') — labels are
      // spoken by the NPC, never re-offered as player menu choices.
      const t2speech = {
        you: 'each other', fears: 'what scares them', others: 'the others',
        neighbors: 'the neighbors', advice: 'advice',
        oldworld: 'the old world', skills: 'their skills',
        systemtake: 'the Taking', loved: 'someone they loved',
      };
      if (t2speech[tid]) return t2speech[tid];
      try {
        if (this.topic2Label && this.topic2Has && this.topic2Has(tid)) {
          const l = String(this.topic2Label(vid, tid) || '').replace(/^"+|"+$/g, '').replace(/^Ask about /i, '');
          if (l) return l.slice(0, 60);
        }
      } catch (e) {}
      return String(tid).replace(/^t2:?/, '').replace(/_/g, ' ').slice(0, 60) || 'something';
    },

    // convoNoteTopic: this topic was discussed. Also resolves any open
    // thread on it — talked-about is finished, or at least no longer hanging.
    // COHERENCE (Steve 2026-10-07): resolving a thread that WAS open records
    // lastClosed (it earns its closing beat at goodbye via convoCloseLine);
    // discussing a LAPSED thread records lastLapsed (honest nod, never a
    // fresh-start lie). convoThreadOpen clears lastClosed when it re-plants
    // the same thread — walked away AGAIN is not "settled".
    convoNoteTopic(vid, tid, label) {
      if (!tid) return;
      try {
        const L = this.convoTopicLedger(vid);
        const day = (this.state.scholar || {}).day || 1;
        const d = L.discussed[tid] || { times: 0, firstDay: day };
        d.times++; d.lastDay = day;
        if (label && !d.label) d.label = String(label).slice(0, 80);
        L.discussed[tid] = d;
        const c = this.convoGet(vid) || {};
        const oi = L.open.findIndex(o => o.tid === tid);
        if (oi !== -1) {
          const was = L.open.splice(oi, 1)[0];
          L.lastClosed = { tid, label: was.label || label || tid, day, convo: c.count };
        }
        const li = (L.lapsed || []).findIndex(o => o.tid === tid);
        if (li !== -1) {
          const was = L.lapsed.splice(li, 1)[0];
          L.lastLapsed = { tid, label: was.label || label || tid, day, convo: c.count };
        }
      } catch (e) {}
    },

    // convoThreadBacked: does this thread id have a REAL ledger entry behind
    // it? (convo rebuild 2026-10-11, Steve: fix structurally.) Options may
    // only reference ledger entries that actually exist — no ledger entry,
    // no option. Event-backed threads (a lesson, a confidence) require the
    // event; topic threads are backed by their beats.
    // The phantom "that lesson they offered (last time)": the taughtref
    // opener fired on background familiarity misread as teaching, planted a
    // taughtref open thread, and the menu resurrected a lesson that never
    // happened. Now the plant itself requires the teaching event.
    convoThreadBacked(vid, tid) {
      if (!tid) return false;
      if (tid === 'taughtref') {
        try {
          const tbp = this.playerTaughtPlants ? this.playerTaughtPlants(vid) : [];
          return tbp.length > 0;
        } catch (e) { return false; }
      }
      if (tid === 'recall') {
        try {
          const c = this.convoGet(vid);
          return !!(c && c.answered && Object.keys(c.answered).length);
        } catch (e) { return false; }
      }
      return true;
    },

    // convoThreadOpen: plant an unfinished thread. Cap 4 — people can only
    // hold so many loose ends; oldest lapses first.
    //
    // MEMORY QUOTE (deepening r11 2026-10-15): the 5th arg is the last
    // NPC-spoken beat on the thread (from the live conversation's thread
    // log). Stored on the thread record so the resume opener can QUOTE what
    // was actually said — the ledger already had the field, but nothing
    // wrote it, so resumes referenced labels ("their secret") with no
    // content and read as fabricated shared history.
    convoThreadOpen(vid, tid, label, why, snippet) {
      if (!tid || tid === 'small' || tid === 'nonverbal' || tid === 'request') return;
      // R19 (journey-social 2026-10-16): "real beat" needs content, not just
      // truthiness — micro-fillers ("Hm.") passed the R17 gate and got
      // quoted as memories. The plant contract is no ghost threads,
      // whatever the caller passes.
      if (!this.convoSnippetIsRealBeat(snippet)) return;
      // LEDGER GATE (convo rebuild 2026-10-11): no backing event, no plant.
      if (!this.convoThreadBacked(vid, tid)) return;
      try {
        const L = this.convoTopicLedger(vid);
        // Re-planting the same thread revokes its closing beat: leaving
        // mid-thread AGAIN is not "settled".
        if (L.lastClosed && L.lastClosed.tid === tid) L.lastClosed = null;
        if (L.open.some(o => o.tid === tid)) return;
        if (L.open.length >= 4) L.open.shift();
        L.open.push({
          tid, label: String(label || tid).slice(0, 80),
          day: (this.state.scholar || {}).day || 1,
          why: why || 'unfinished',
          snippet: snippet ? clipSnippet(snippet, 110) : null,
        });
      } catch (e) {}
    },

    // convoGriefOpenerPool (journey-social r19 2026-10-16): the acute-grief
    // opener pool. Was 2 lines — undersized for a village-wide beat: with
    // 12 villagers grieving at once, the run-ledger blocked repeat speakers
    // and the per-life pool exhausted after one death, muting every later
    // death's grief (r19 M2 root cause). 8 lines: still once-per-line-per-
    // life (no spam), but a second death in the same run still has words.
    // Plain-spoken, matching the original two; no naming (the lately
    // mourning lines own the named dead via firstRef).
    convoGriefOpenerPool() {
      return [
        '"Have you — sorry. I keep thinking about them."',
        '"It\'s quiet today. Wrong kind of quiet."',
        '"I keep expecting to see them by the fire. Then I remember."',
        '"Don\'t mind me. Today\'s just heavy."',
        '"We gave them a good burial. Doesn\'t feel like enough, does it?"',
        '"I don\'t know what to do with my hands today."',
        '"Every laugh out there feels wrong today. Then I feel wrong for thinking it."',
        '"They\'d tell me to keep working. So I\'m working. That\'s the whole plan."',
      ];
    },
    // convoLastThreadSnippet: the last NPC-spoken beat landed on a thread in
    // the live conversation (deepening r11 2026-10-15). threadLog only
    // records beats the NPC landed (convoNoteBeat / convoNoteSpokenBeat), so
    // quoting it in the NPC's voice at resume time is honest — it's
    // literally the last thing THEY said on that thread.
    convoLastThreadSnippet(vid, tid) {
      try {
        const c = this.convoGet(vid);
        const log = (c && c.threadLog) || [];
        for (let i = log.length - 1; i >= 0; i--) {
          if (log[i] && log[i].thread === tid && log[i].snippet) {
            // R19 (journey-social 2026-10-16): the memory quote must be a
            // real beat — a thread whose last beat was filler ("Hm.") but
            // had substance earlier quotes the substance, not the filler.
            // A thread with no substantive beat at all yields null, and the
            // plant-time gate treats it as the ghost it is.
            if (this.convoSnippetIsRealBeat(log[i].snippet)) {
              return clipSnippet(log[i].snippet, 110);
            }
          }
        }
      } catch (e) {}
      return null;
    },
    // convoSnippetIsRealBeat (journey-social r19 2026-10-16): is this
    // snippet a memory worth quoting? The R17 "real beat" gate tested
    // truthiness — micro-fillers ("Hm.", "So.", "Anyway.") passed and got
    // quoted as memories ("we never finished talking about what scares
    // them — we wandered off it. 'Hm.'"). A real beat is not a deflection
    // line, not resume scaffolding, and carries a proposition (>= 4 words;
    // a dropped quote is harmless — the resume still names the thread —
    // while a quoted filler is the bug).
    convoSnippetIsRealBeat(sn) {
      if (!sn) return false;
      const t = String(sn).replace(/^["'“”\s]+|["'“”\s.,!?;:—-]+$/g, '').trim();
      if (!t || t.split(/\s+/).length < 4) return false;
      try { if (this.convoIsDeflectionLine(sn)) return false; } catch (e) {}
      if (/never (did )?finish(ed)? talking about|never did get back to|we left it|we wandered off|proper ending/i.test(sn)) return false;
      return true;
    },
    // convoSnippetIsHook (journey-deepening r13 2026-10-18): a teaser /
    // invitation is a real beat (the unfinished business exists — the plant
    // gate keeps it), but it is NOT quotable as the thread's content-memory.
    // Transcript-caught (seed 8307): a 'show' thread planted with the NPC's
    // invitation "Come see what I found. You won't believe it." resumed as
    // "We never finished talking about that personal stuff — we wandered
    // off it. 'Come see what I found. You won't believe it.'" — the
    // UNFULFILLED INVITATION quoted as if it were the memory of the topic.
    // A hook names no proposition; quoting it fabricates shared content.
    // Structural test like the scaffolding guard above: invitations match
    // a small fixed set of phrasings, never real content.
    convoSnippetIsHook(sn) {
      if (!sn) return false;
      return /\bcome\s+(and\s+)?(see|look|take a look)\b|you\s+won'?t\s+believe|wait\s+(till|until)\s+you\s+(see|hear)|\bi\s+found\s+something\b|(have|got)\s+something\s+to\s+show\s+you\b|you('ve| have) got to see\b/i.test(String(sn));
    },

    convoThreadResolve(vid, tid) {
      try {
        const L = this.convoTopicLedger(vid);
        L.open = (L.open || []).filter(o => o.tid !== tid);
      } catch (e) {}
    },

    convoOpenThreads(vid) {
      try { return this.convoTopicLedger(vid).open.slice(); }
      catch (e) { return []; }
    },

    // convoNoteBeat: one NPC beat landed on a thread. Records the topic as
    // discussed, appends a snippet to the per-conversation thread log, and
    // detects subject changes: leaving a live substantive thread for
    // another plants the old one as open. Consecutive duplicates (the same
    // line noted twice via sayLine + turn tail) collapse.
    convoNoteBeat(vid, thread, line) {
      if (!thread || thread === 'nonverbal') return;
      try {
        const c = this.convoGet(vid);
        this.convoNoteTopic(vid, thread, this.convoTopicLabel(vid, thread));
        // R13 (journey-deepening 2026-10-16): strip thinking-aloud acks
        // before clipping — the snippet is the memory of the topic's
        // CONTENT, not the delivery wrappers.
        const clean = clipSnippet(this.convoStripAcks(line), 110);
        c.threadLog = c.threadLog || [];
        const last = c.threadLog[c.threadLog.length - 1];
        if (clean && (!last || last.thread !== thread || last.snippet !== clean)) {
          c.threadLog.push({ thread, snippet: clean, ex: c.exchanges || 0 });
          if (c.threadLog.length > 12) c.threadLog.shift();
        }
        // SUBJECT CHANGE: the old thread was live and we moved on. The plant
        // carries the last beat spoken on the old thread (deepening r11).
        const prev = c._beatThread;
        // ANSWERED-QUESTION (journey-establishment r19 2026-10-20): the
        // want's hanging question was ANSWERED this conversation — the
        // question-exchange is finished, so the old 'want' thread carries no
        // "unfinished business" to plant. Without this, the next sitting
        // offers "We never finished — <question>" and the resume re-serves
        // the generic first-reveal engageBeat ("Huh. I wouldn't have guessed
        // that about you") AFTER the player already answered and the NPC
        // already acknowledged it — transcript-caught amnesia (seed 103
        // Erin "where you're from", seed 61 Wilhelm "what got you through
        // the first week"). The want ARC itself persists via
        // convoResolveWant seeds, not this plant. honest_pass/declined
        // questions stay plantable: the exchange is genuinely unresolved.
        const wantQDone = prev === 'want' && (() => {
          try {
            const w = c.want;
            return !!(w && w.qid && c.answered && (w.qid in c.answered) && c.answered[w.qid] !== 'honest_pass');
          } catch (e) { return false; }
        })();
        if (prev && prev !== thread && prev !== 'small' && thread !== 'small' && !wantQDone) {
          this.convoThreadOpen(vid, prev, this.convoTopicLabel(vid, prev), 'changed the subject',
            this.convoLastThreadSnippet(vid, prev));
        }
        c._beatThread = thread;
      } catch (e) {}
    },

    // convoNoteSpokenBeat: the sayLine hook. The dialogue layer speaks its
    // beats through sayLine, so this sees dlg: turns that never reach
    // methods.convoTurn. Guarded: only live conversations record.
    convoNoteSpokenBeat(vid, line) {
      try {
        const c = this.convoGet(vid);
        if (!c.active || !c.thread) return;
        this.convoNoteBeat(vid, c.thread, line);
      } catch (e) {}
    },

    // convoPlantOpenThread: end-of-conversation planting. Called from
    // endConvo BEFORE c.thread is cleared. Walking away mid-thread, or
    // ending with a question hanging, leaves it open. A conversation that
    // ran its course plants nothing.
    convoPlantOpenThread(vid, how) {
      try {
        const c = this.convoGet(vid);
        const thread = c.thread;
        if (!thread || thread === 'small' || thread === 'nonverbal' || thread === 'request') return;
        const depth = c.depth || 0;
        if (depth < 1) return;
        // PHANTOM-THREAD FIX (journey establishment r5 2026-10-15): a
        // conversation opened and immediately left — zero player exchanges
        // (the talkRound open-and-walk-out; a human tapping away on turn 1)
        // — must not plant an open thread. Nothing was discussed, so the
        // resume opener's "we never did finish talking about X" manufactures
        // shared history from a drive-by (transcript-caught: Anh d25 s124,
        // Sanne d37 s82, Nadia d37 s124 — no prior conversation existed).
        // A walked-out favor ask is not lost: the favor seed system
        // (convoPlantSeed) owns legitimate unkept-ask follow-ups. One real
        // exchange is the bar — discussed means somebody said something back
        // (the opener alone notes a beat but no exchange; c.exchanges counts
        // player turns only).
        if ((c.exchanges || 0) < 1) return;
        const unresolved = c.pendingQ || c.reactiveQ || (c.heldBeats || []).length ||
          (typeof this.convoThreadHasMore === 'function' && this.convoThreadHasMore(vid));
        // Record the discussion FIRST (it resolves any stale open entry for
        // this thread), THEN plant the new open thread — order matters,
        // because noting a topic as discussed resolves its open thread.
        this.convoNoteTopic(vid, thread, this.convoTopicLabel(vid, thread));
        // MEMORY QUOTE (deepening r11 2026-10-15): carry the last spoken
        // beat into the plant so the resume opener can quote it.
        const _memSnip = this.convoLastThreadSnippet(vid, thread);
        // ANSWERED-QUESTION (journey-establishment r19 2026-10-20): same
        // class as the convoNoteBeat subject-change guard — the want's
        // hanging question was answered this conversation, so the 'want'
        // thread's question-exchange is finished. Planting it as "unfinished
        // business" manufactures the amnesia resume in a later sitting.
        // The want ARC persists via convoResolveWant seeds, not this plant.
        const wantQDone = thread === 'want' && (() => {
          try {
            const w = c.want;
            return !!(w && w.qid && c.answered && (w.qid in c.answered) && c.answered[w.qid] !== 'honest_pass');
          } catch (e) { return false; }
        })();
        if (how === 'left' && !wantQDone) {
          this.convoThreadOpen(vid, thread, this.convoTopicLabel(vid, thread), 'walked away mid-thread', _memSnip);
        } else if (unresolved && !wantQDone) {
          this.convoThreadOpen(vid, thread, this.convoTopicLabel(vid, thread), 'unfinished business', _memSnip);
        }
      } catch (e) {}
    },

    // MANTLE HANDOFF (journey-succession 2026-10-11): conversational
    // continuity must survive the Bearer change — the village is the
    // protagonist — but HONESTLY. Threads, seeds, favors and memories
    // planted with a previous Bearer keep the predecessor's name; the
    // new face never pretends they were in the room. (v.mantleOf is written
    // by playerDeath in ledger.js.)
    mantleOf() { try { return (this.state.village || {}).mantleOf || []; } catch (e) { return []; } },
    // inheritedName(rec): first name of the Bearer who held the office
    // when this conversational record (open thread, seed, favor, memory)
    // was made — or null when the current Bearer is it. Prefers the
    // explicit handoff stamp written by playerDeath (precise across
    // same-day deaths); falls back to day comparison against the handoff.
    inheritedName(rec) {
      if (!rec) return null;
      const stamped = rec.inh || rec.inhFrom;
      if (stamped) return String(stamped).split(' ')[0];
      const m = this.mantleOf();
      if (!m.length) return null;
      const last = m[m.length - 1];
      const rday = rec.day != null ? rec.day : rec.askedDay;
      if ((rday || 0) >= (last.day || 1)) return null;
      return String(last.fromName || 'your predecessor').split(' ')[0];
    },

    // COUNT HONESTY (journey-succession 2026-10-12): fills {people} with the
    // living roster count in words ("we're twelve people" was hardcoded and
    // lied once villagers died). Called at every point a player-facing line
    // can carry the token.
    convoFillPeople(line) {
      if (!line || String(line).indexOf('{people}') === -1) return line;
      const n = ((this.state.village || {}).roster || []).length;
      const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six',
        'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
      const w = n >= 0 && n < words.length ? words[n] : String(n);
      // token usually reads "{people} people" — fold the noun in so the
      // count stays grammatical ("one person", not "one people").
      let s = String(line).split('{people} people').join(w + ((n === 1 || n === 0) ? ' person' : ' people'));
      s = s.split('{people}').join(w);
      return s;
    },

    // convoResumeOpener: an unfinished thread resurfaces as the next
    // conversation's opening. Never ahead of a talk request, never twice
    // running, gated on a little trust — strangers don't pick up old threads.
    convoResumeOpener(vid) {
      const v = this.state.village || {};
      const treq = (v.talkRequests || {})[vid];
      if (treq && !treq.delivered) return null;
      // SEED PRIORITY (favor system 2026-10-11): a planted want-seed is more
      // specific and more recent than a generic open thread. If the last
      // conversation planted a seed (e.g. an unkept favor ask), the seed's
      // follow-up opens — not the generic resume.
      if ((v.convoSeeds || {})[vid]) return null;
      // TABLE SITS (journey-endgame r11 2026-10-14): the table pre-empts
      // generic open-thread resumes — the village talks about the table
      // first. Planted want-seeds (above) keep their priority: a favor
      // follow-up is a commitment, not chatter.
      try {
        if (typeof this.convoTableSitting === 'function' && this.convoTableSitting()) return null;
      } catch (e) {}
      const c = this.convoGet(vid);
      if (c._resumedOnce) return null;
      const trust = ((v.trust || {})[vid] || 10);
      if (trust < 15) return null;
      const open = this.convoOpenThreads(vid);
      if (!open.length) return null;
      if (Math.random() > 0.65) return null;
      const o = open[Math.floor(Math.random() * open.length)];
      // LEDGER GATE (convo rebuild 2026-10-11): no backing event, no resume.
      // (Old saves may hold taughtref threads planted before the gate.)
      if (typeof this.convoThreadBacked === 'function' && !this.convoThreadBacked(vid, o.tid)) return null;
      c._resumedOnce = true;
      const label = this.convoThreadAbout(vid, o.tid, o.label || o.tid);
      // COHERENCE (Steve 2026-10-07): the resume must not contradict the
      // timeline — a thread left hanging 12 days ago is not "last time".
      const day = (this.state.scholar || {}).day || 1;
      const ago = Math.max(0, day - (o.day || day));
      const whyLine = {
        'walked away mid-thread': 'we got cut off',
        'changed the subject': 'we wandered off it',
        'unfinished business': 'we left it mid-thought',
        'unanswered': 'you never answered',
      }[o.why] || 'we left it hanging';
      let inner;
      // INHERITED THREAD (journey-succession 2026-10-11): the thread was the
      // predecessor's — the NPC names them. The new Bearer can pick it
      // up, but never as if they were there.
      const pred = (typeof this.inheritedName === 'function') ? this.inheritedName(o) : null;
      if (pred) {
        if (ago > 7) {
          // STALE INHERITANCE (journey-landing r16 2026-10-15): an 8+-day-old
          // thread from a dead predecessor resumed as "You're not {pred}.
          // Still on your mind?" reads as a fresh realization addressed to
          // someone who was never in the conversation (transcript-caught:
          // "You're not Colin. Still on your mind?" to the third Bearer on day 10).
          // Name the dead, own the gap, invite — the new Bearer can pick it
          // up, never as if they were there.
          inner = `${pred} and I never did finish talking about ${label} — that was ${this.pluralize(ago, 'day')} back. You weren't there for that one — ${pred} was. Want to hear where it left off?`;
        } else if (ago > 1) {
          inner = `${pred} and I never finished talking about ${label} — ${whyLine}, ${this.pluralize(ago, 'day')} back. You're wearing ${pred}'s shoes now — want to pick it up?`;
        } else {
          inner = `${pred} and I never finished talking about ${label} — ${whyLine}. You're wearing ${pred}'s shoes now — want to pick it up?`;
        }
      } else if (ago > 7) {
        inner = `We never did finish talking about ${label} — that was ${this.pluralize(ago, 'day')} back. Still on your mind?`;
      } else if (ago > 1) {
        inner = `We never finished talking about ${label} — ${whyLine}, ${this.pluralize(ago, 'day')} back.`;
      } else {
        // REBUILD 2026-10-11: the leaked internal "(last time)" note is
        // gone — recent threads get honest phrasing, not a parenthetical.
        inner = `We never finished talking about ${label} — ${whyLine}.`;
      }
      // MULTI-THREAD AWARENESS (Steve 2026-10-07): no orphaned threads — if
      // more than one thread is hanging, the other gets a brief nod so it
      // doesn't feel forgotten. One sentence, inside the same breath.
      //
      // MEMORY QUOTE (deepening r11 2026-10-15): the planted thread carries
      // the last NPC-spoken beat (convoThreadOpen's snippet, written at
      // plant time from the thread log). Quote it so the resume reads as a
      // real memory — "their secret" with no content was indistinguishable
      // from fabricated shared history (Steve's conversation bar). The
      // snippet is always their own last words on the thread, so quoting
      // it in-voice is honest. Threads planted before this change carry
      // null and render exactly as before.
      // NESTED QUOTES (journey-social r15 2026-10-15): the opener is
      // wrapped in double quotes downstream — wrapping the snippet in
      // doubles too nested unescaped quotes (transcript-verified:
      // ...neighbors.""). Single quotes nest cleanly; the snippet text
      // itself is untouched.
      if (o.snippet) {
        // R17 (journey-social 2026-10-15): never quote a deflection as the
        // "memory" — the sayLine hook no longer notes fallback chunks, so no
        // new deflection snippets are planted; this guards threads planted
        // before the fix (transcript-caught: "...Sorry, lost my train of
        // thought." quoted as the unfinished topic).
        // R18 (journey-landing 2026-10-16): never quote a RESUME OPENER as
        // the "memory" either — the snippet is the thread's last NPC beat,
        // and when that beat was itself a resume opener the quote nests
        // scaffolding inside scaffolding (transcript-caught, seed-64 probe:
        // "We never finished talking about X — we wandered off it. 'We
        // never finished talking about X — we wandered off it. ...'").
        // The template's signature phrase never appears in real content,
        // so matching it is a clean structural test. The thread still
        // resumes (label + whyLine); only the nested quote is dropped.
        // R19 (journey-social 2026-10-16): the quote must be a real beat —
        // the old guard missed micro-fillers ("Hm.") and resume-scaffolding
        // phrasings ("never did get back to that").
        // R20 (journey-deepening r13 2026-10-18): and not a hook — a teaser
        // invitation ("Come see what I found") is a real beat but quoting it
        // presents the unfulfilled invitation as the thread's content-memory.
        // The thread still resumes (label + whyLine); only the quote drops.
        if (this.convoSnippetIsRealBeat(o.snippet) && !this.convoSnippetIsHook(o.snippet)) {
          // QUOTE HYGIENE (journey-landing r25 2026-10-19): the snippet
          // renders inside single quotes inside the opener's double quotes —
          // any double quotes surviving in the snippet TEXT nest unescaped
          // (transcript-caught, seed 95: "...mid-thought. 'They go still.
          // "So it's not just me. Good...'"). Strip them all (leading/
          // trailing included); the memory reads clean without inner marks.
          const sq = String(o.snippet).replace(/"/g, '');
          inner += ` '${sq}'`;
        }
      }
      const others = open.filter(x => x.tid !== o.tid);
      if (others.length && Math.random() < 0.5) {
        const o2 = others[Math.floor(Math.random() * others.length)];
        const about = this.convoThreadAbout(vid, o2.tid, o2.label || o2.tid);
        inner += ` We still owe ${about} a proper ending, too.`;
      }
      const line = this.voiceLine(vid, `"${inner}"`);
      // R17: the resume opener is structural grammar — exempt from the
      // run-ledger block (consumed at emission in startConvo).
      return { line, thread: o.tid, structural: true };
    },

    // ---------- 4. COHERENCE: recap ----------
    // convoRecapLine: "what were we talking about?" — re-anchors a long
    // exchange from the thread log. Two threads deep, it names the arc;
    // one thread, it restates it. Always voiced, never a dead end.
    convoRecapLine(vid) {
      const c = this.convoGet(vid);
      const log = (c.threadLog || []).filter(e => e.thread && e.thread !== 'small' && e.thread !== 'nonverbal');
      const labelOf = (t) => this.convoThreadAbout(vid, t);
      let line;
      if (!log.length) {
        line = '"We were just talking. Nothing important."';
      } else {
        const last = log[log.length - 1];
        if (log.length >= 2) {
          const prev = log[log.length - 2];
          line = prev.thread === last.thread
            ? `"Still on ${labelOf(last.thread)}."`
            : `"We started on ${labelOf(prev.thread)}, then got onto ${labelOf(last.thread)}."`;
        } else {
          line = `"We were talking about ${labelOf(last.thread)}."`;
        }
      }
      // RECAP REPEAT (journey-social r27 2026-10-19): back-to-back recap
      // picks re-served the verbatim line ("Still on that personal stuff."
      // x3, transcript-verified s2002 d34/d122 Wei). If this exact line was
      // already said this conversation, reframe honestly — a real person
      // being re-asked says "as I said", they don't parrot.
      // R31 (2026-10-20): the r27 reframe pool itself WRAPPED on the 4th
      // pick (seed 2006 Olivia — the reframe became the repeat, an L2'
      // violation). Count-aware now: the 3 reframe templates serve once
      // each, then the NPC escalates honestly (a real person re-asked a
      // 4th time names the repetition), then the recap choice spends out
      // of the menu for the sitting — never a verbatim cycle.
      c._recapSaid = c._recapSaid || {};
      const raw = line;
      if (c._recapSaid[raw]) {
        const inner = String(raw).replace(/^"|"$/g, '');
        c._recapReframes = (c._recapReframes || 0) + 1;
        if (c._recapReframes <= 3) {
          line = this.convoPickCycle(vid, 'recaprepeat', [
            `"As I said — ${inner}"`,
            `"Like I said — ${inner}"`,
            `"${inner} That's still where we are."`,
          ]);
        } else if (c._recapReframes === 4) {
          line = `"I've told you three times now — ${inner}"`;
        } else {
          line = `"We're going in circles a bit — ${inner}"`;
          // CAP: the choice spends out for this sitting — a real person
          // stops answering, they don't find a sixth synonym.
          try { this.convoSpendChoice(vid, 'recap'); } catch (e) {}
        }
      }
      c._recapSaid[raw] = true;
      return this.voiceLine(vid, line);
    },

    // convoRecapChoice: the menu object. Sibling menu code (convoChoices /
    // dialogueResponses) inserts this where it fits — the base 'recap'
    // branch in convoTurn already handles it.
    convoRecapChoice(vid) {
      return { id: 'recap', label: '"Wait — what were we talking about?"' };
    },

    // ---------- 5. SAID FACTS: what they told you, on the record ----------
    // COHERENCE (Steve 2026-10-07): a villager's speech must not contradict
    // what they said earlier. village.saidFacts[vid] is the on-the-record
    // ledger: {key: {value, day}}. Generation sites RECORD their claims
    // (hardstory wound, who they're thinking about, skill origin stories)
    // and CHECK the ledger before inventing — once said, the fact is reused,
    // never re-rolled. convoFactConflict is the vetting primitive for
    // scenario code: ask before asserting, pick an alternate line on true.
    convoSaidFacts(vid) {
      const v = this.state.village || {};
      v.saidFacts = v.saidFacts || {};
      if (!v.saidFacts[vid]) v.saidFacts[vid] = {};
      return v.saidFacts[vid];
    },

    // convoSaidFact: put a stated fact on the record.
    convoSaidFact(vid, key, value) {
      if (!vid || !key) return false;
      try {
        this.convoSaidFacts(vid)[key] = {
          value: String(value == null ? '' : value).slice(0, 140),
          day: (this.state.scholar || {}).day || 1,
        };
        return true;
      } catch (e) { return false; }
    },

    // convoFactRecalled: what did they say about this before? value or null.
    convoFactRecalled(vid, key) {
      try {
        const f = this.convoSaidFacts(vid)[key];
        return f ? f.value : null;
      } catch (e) { return null; }
    },

    // convoFactConflict: would asserting (key, value) contradict the record?
    convoFactConflict(vid, key, value) {
      try {
        const f = this.convoSaidFacts(vid)[key];
        return !!(f && String(f.value) !== String(value));
      } catch (e) { return false; }
    },

    // ---------- 6. VOICE SIGNATURE + DRIFT VISIBILITY ----------
    // convoVoiceSig: the immutable part of how this person talks —
    // register|pace|humor|address, all lifeseed-derived. Stable across
    // turns and days; drift bends the temper, never the signature.
    convoVoiceSig(vid) {
      try {
        const dna = this.convoSpeechDNA(vid) || {};
        return [dna.register || 'plainspoken', dna.pace || 'measured',
          dna.humor || 'none', String(dna.address || 'you').split(/\s+/)[0]].join('|');
      } catch (e) { return 'plainspoken|measured|none|you'; }
    },

    // convoDriftNote: when lived events have visibly changed them since the
    // last conversation, the player SEES it — drift is never silent. Fires
    // at most once per day per villager: the first channel to cross >=2
    // since the last FIRED note earns one short stage-direction beat. The
    // stamp is only written when a note fires — a quiet check must not
    // swallow a crossing that lands later the same day. The note always
    // matches the actual drift state (never contradicts voiceMods).
    convoDriftNote(vid) {
      try {
        const vp = this.vpOf(vid) || {};
        const day = (this.state.scholar || {}).day || 1;
        const d = this.convoDrift(vid) || {};
        const vec = { grief: d.grief || 0, bitterness: d.bitterness || 0, wariness: d.wariness || 0, warmth: d.warmth || 0, hardness: d.hardness || 0 };
        const noted = vp.convoDriftNoted || null;
        if (noted && noted.day === day) return null;
        const prev = (noted && noted.vec) || {};
        const crossed = [
          ['grief', 'looks hollowed out — grief\'s been sitting heavy.'],
          ['bitterness', 'has an edge today — something curdled.'],
          ['wariness', 'keeps glancing past you — braced for something.'],
          ['warmth', 'seems lighter — something good landed recently.'],
          ['hardness', 'looks weathered — the hard days are showing.'],
        ].filter(([k]) => (vec[k] || 0) >= 2 && (prev[k] || 0) < 2);
        if (!crossed.length) return null;
        vp.convoDriftNoted = { day, vec };
        const name = (this.displayName(vid) || 'they').split(' ')[0];
        return name + ' ' + crossed[0][1];
      } catch (e) { return null; }
    },

    // ---------- 7. THREAD LIFECYCLE: resume honestly, close cleanly ----------
    // convoThreadAbout: a grammatical phrase for a thread in closing frames.
    // The ledger label 'themselves' (personal) breaks third-person frames
    // ("talking about themselves") — rendered as 'your story'. The ledger
    // label itself is untouched (sibling proof tests pin it verbatim).
    convoThreadAbout(vid, tid, label) {
      try {
        const l = label || this.convoTopicLabel(vid, tid);
        return l === 'themselves' ? 'your story' : l;
      } catch (e) { return label || tid || 'that'; }
    },

    // convoCloseLine: a thread that was hanging got discussed this
    // conversation — it earns its closing beat at goodbye. Fires once per
    // (thread, day); a re-planted thread (walked away AGAIN) is not closed.
    // Spoken plain, not through voiceLine: the beat is a complete thought
    // and a prepended discourse marker ("Maybe it's only me — Good — …")
    // would garble it.
    convoCloseLine(vid) {
      try {
        const L = this.convoTopicLedger(vid);
        const lc = L.lastClosed;
        if (!lc) return null;
        const day = (this.state.scholar || {}).day || 1;
        const c = this.convoGet(vid) || {};
        if (lc.convo !== c.count || lc.day !== day) return null;
        if (L.closeGiven === lc.tid + ':' + day) return null;
        L.closeGiven = lc.tid + ':' + day;
        L.lastClosed = null;
        const about = this.convoThreadAbout(vid, lc.tid, lc.label);
        return '"Good — ' + about + ', settled. Feels better said out loud."';
      } catch (e) { return null; }
    },

    // convoLapseLine: a thread that lapsed (>14 days) got circled back to —
    // the honest nod, never a fresh-start lie. Fires once per (thread, day).
    // Spoken plain, same voiceLine reason as the close beat.
    convoLapseLine(vid) {
      try {
        const L = this.convoTopicLedger(vid);
        const ll = L.lastLapsed;
        if (!ll) return null;
        const day = (this.state.scholar || {}).day || 1;
        const c = this.convoGet(vid) || {};
        if (ll.convo !== c.count || ll.day !== day) return null;
        if (L.lapseGiven === ll.tid + ':' + day) return null;
        L.lapseGiven = ll.tid + ':' + day;
        L.lastLapsed = null;
        const about = this.convoThreadAbout(vid, ll.tid, ll.label);
        // LAPSE GRAMMAR (journey-social r27 2026-10-19): the old template
        // ("It's been a while since we left {about} hanging") assumed the
        // label was a noun phrase — a clause label like "the last time you
        // laughed" composed into nonsense ("...we left the last time you
        // laughed hanging", transcript-verified s2001 Ines). The new frame
        // takes any label shape.
        return '"It\'s been a while. Glad we circled back to ' + about + '."';
      } catch (e) { return null; }
    },

    // ---------- 2. DRIFT: people change during a run ----------
    // convoDrift: the per-villager drift vector, recomputed at most once
    // per day from lived events. Stored on the char (not derived fresh
    // every line) so a person's arc is stable within a day.
    //   grief: death around them / their own losses
    //   bitterness: betrayals, theft, broken promises
    //   wariness: threats, hostility, being watched
    //   warmth: kindness received
    //   hardness: hunger endured, attacks survived
    convoDrift(vid) {
      const vp = this.vpOf(vid) || {};
      const day = (this.state.scholar || {}).day || 1;
      let d = vp.convoDrift;
      if (!d || d.updatedDay !== day) {
        d = this.convoComputeDrift(vid);
        d.updatedDay = day;
        try { vp.convoDrift = d; } catch (e) {}
      }
      return d;
    },

    convoComputeDrift(vid) {
      const d = { grief: 0, bitterness: 0, wariness: 0, warmth: 0, hardness: 0 };
      try {
        const v = this.state.village || {};
        const day = (this.state.scholar || {}).day || 1;
        const mem = (v.memory || {})[vid] || [];
        const recent = n => mem.filter(m => day - (m.day || 0) <= n).map(m => m.t);
        const r14 = recent(14);
        const count = (arr, ...ts) => arr.filter(t => ts.indexOf(t) !== -1).length;
        d.grief = Math.min(3, count(r14, 'mourned', 'death_witnessed', 'loss') + ((v.grief || 0) > 0 ? 1 : 0));
        d.bitterness = Math.min(3, count(r14, 'promise_broken', 'caught_you_stealing', 'suspects_you_stealing', 'rumor_about_them', 'deal_refused', 'theft_victim'));
        d.wariness = Math.min(3, count(r14, 'confronted', 'hostile', 'you_threatened', 'observed', 'moot_vote'));
        d.warmth = Math.min(3, count(r14, 'gift', 'private_gift', 'saved', 'hero', 'comforted', 'promise_kept', 'amends', 'mediated', 'welcomed'));
        let hard = count(r14, 'hunger_survived', 'monster_attack', 'fought');
        try { if ((this.npcNeeds(vid).hunger || 0) > 70) hard += 1; } catch (e) {}
        try { if ((this.npcNeeds(vid).fear || 0) > 70) hard += 1; } catch (e) {}
        d.hardness = Math.min(3, hard);
        // Lifeseed lived events: what happened TO them, not just with you.
        // recordLifeseedEvent kinds: death_of_kin, death_witnessed, betrayal,
        // hunger_survived, kill, spared, feast_shared, exile, welcomed,
        // kindness, theft_victim, theft_done, loss.
        const ls = (this.vpOf(vid) || {}).lifeseed || {};
        const lived = (ls.lived || []).filter(e => day - (e.day || 0) <= 14).map(e => e.kind);
        d.grief = Math.min(3, d.grief + count(lived, 'death_of_kin', 'death_witnessed', 'loss'));
        d.bitterness = Math.min(3, d.bitterness + count(lived, 'betrayal', 'theft_victim'));
        d.wariness = Math.min(3, d.wariness + count(lived, 'betrayal', 'exile'));
        d.warmth = Math.min(3, d.warmth + count(lived, 'kindness', 'welcomed', 'feast_shared', 'spared'));
        d.hardness = Math.min(3, d.hardness + count(lived, 'hunger_survived', 'exile'));
      } catch (e) {}
      return d;
    },

    // convoDriftedTemper: who they are NOW. Base temperament bent by what
    // they've lived through — grief withdraws, bitterness prickles, wariness
    // cautions, hardship hardens, kindness warms. npcTemper() stays the
    // authority for sibling systems; this is the conversation layer's read.
    convoDriftedTemper(vid) {
      let base = 'steady';
      try { base = String(this.npcTemper(vid) || 'steady').toLowerCase(); } catch (e) {}
      const d = this.convoDrift(vid) || {};
      if ((d.grief || 0) >= 2) return 'withdrawn';
      if ((d.bitterness || 0) >= 2) return 'prickly';
      if ((d.wariness || 0) >= 2) return 'cautious';
      if ((d.hardness || 0) >= 2) return 'intense';
      if ((d.warmth || 0) >= 2) return 'warm';
      return base;
    },

    // ---------- 3. SPEECH DNA ----------
    // convoSpeechDNA: how THIS person talks, derived from their lifeseed —
    // register (plainspoken/laconic/effusive/wry/formal/halting), pace,
    // humor, address term, skill origins (who taught them), home, kin.
    // Never a fixed cast: two villagers with the same temperament get
    // different DNA from different lives.
    convoSpeechDNA(vid) {
      const vp = this.vpOf(vid) || {};
      const ls = vp.lifeseed || {};
      let lv = null;
      try { lv = (typeof this.lifeseedVoice === 'function') ? this.lifeseedVoice(vp) : (ls.voice || null); }
      catch (e) { lv = ls.voice || null; }
      return {
        vid,
        register: (lv && lv.register) || 'plainspoken',
        pace: (lv && lv.pace) || 'measured',
        humor: (lv && lv.humor) || 'none',
        address: (lv && lv.address) || 'you',
        temperament: String(((vp.personality || {}).temperament) || 'steady').toLowerCase(),
        driftedTemper: this.convoDriftedTemper(vid),
        skillOrigins: ls.skillOrigins || {},
        hometown: ls.hometown || null,
        regionLand: ls.regionLand || null,
        kin: (ls.people || []).slice(0, 2).map(p => ({
          name: (p.name || '').split(' ')[0], relation: p.relation, fate: p.fate,
        })),
        woundTone: (lv && lv.woundTone) || null,
      };
    },

    // convoSpeechMarkers: discourse markers from the DNA — HOW they talk,
    // not what they say. Merged into voiceLine's opener/closer pools, so
    // the same one-marker-per-line restraint and cycling apply. Drift bends
    // the markers: grief halts a plainspoken person, bitterness sours them.
    convoSpeechMarkers(vid) {
      const dna = this.convoSpeechDNA(vid);
      const reg = CONVO_REGISTER_MARKERS[dna.register] || CONVO_REGISTER_MARKERS.plainspoken;
      let open = reg.open.slice(), close = reg.close.slice();
      // TONE-TAG LEAK FIX (sim-voicefix1 F9 2026-10-21): ' — anyway.' /
      // ' — comedy.' are stage directions — a person never says "comedy"
      // inside their own quote (audit F9: "…twice the ground. — comedy.").
      // Spoken instead: quick-pace people drop ", anyway." (the comma-fold
      // tucks it into the clause: "…twice the ground, anyway."), dry-humor
      // people give the flat deadpan " Ha." Both are things a person would
      // actually SAY, not stage labels. Steve 2026-10-07: design call made,
      // documented here for overrule.
      if (dna.pace === 'quick') close.push(', anyway.');
      if (dna.pace === 'slow') close.push(' …');
      if (dna.humor === 'gallows') close.push(' Ha. Funny.');
      if (dna.humor === 'dry') close.push(' Ha.');
      // What they call you lands as a closer, once in a while.
      const addr = String(dna.address || '').replace(/\s*\(.*\)\s*/, '').trim().split(/\s+/)[0];
      if (addr && addr !== 'you' && addr.length <= 8) close.push(', ' + addr + '.');
      try {
        const d = this.convoDrift(vid) || {};
        if ((d.grief || 0) >= 2 || (d.wariness || 0) >= 2) {
          open = ['I… '].concat(open.filter(o => o !== 'I… '));
          close.push(' …sorry.');
        }
        if ((d.bitterness || 0) >= 2) open = ['Hah. '].concat(open.filter(o => o !== 'Hah. '));
      } catch (e) {}
      return { open, close };
    },

    // convoSkillOriginLine: "who taught THEM" — a skill's origin story in
    // their own voice, from lifeseed skillOrigins. Wiring point for
    // teach/learn scenario code (convo-wants dlg:learn and friends).
    convoSkillOriginLine(vid, skill) {
      const dna = this.convoSpeechDNA(vid);
      const keys = Object.keys(dna.skillOrigins || {});
      if (!keys.length) return null;
      const sk = (skill && dna.skillOrigins[skill]) ? skill : keys[Math.floor(Math.random() * keys.length)];
      // COHERENCE (Steve 2026-10-07): once they've told their origin story
      // for a skill, it's on the record — "show me" teaches THIS skill, not
      // a re-rolled one (convoTeachSkill prefers the recorded story).
      try { this.convoSaidFact(vid, 'skillstory', sk); } catch (e) {}
      const how = String(dna.skillOrigins[sk] || 'the hard way').replace(/\.$/, '');
      const skName = { food: 'finding food', medicinal: 'patching people up', mending: 'fixing things', navigation: 'never getting lost', tracking: 'reading ground', trapping: 'traps', forecast: 'reading the sky' }[sk] || sk;
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
      const pool = [
        `"I learned ${skName} ${how}."`,
        `"${cap(skName)} — ${how}, and I'm still learning."`,
        `"${cap(how)} — that's where the ${skName} came from."`,
      ];
      return this.voiceLine(vid, pool[Math.floor(Math.random() * pool.length)]);
    },

    // convoVoiceState: merged voice-state lookup — data states first
    // (characterGen.voice.states), drift states underneath. Keeps the drift
    // layer self-contained in code instead of touching sibling-owned data.
    convoVoiceState(name) {
      const V = (this.data.characterGen || {}).voice || {};
      return ((V.states || {})[name]) || CONVO_DRIFT_VOICE[name] || {};
    },

    // UNIQUE-PERSON LAW (Steve 2026-10-06): two villagers asking the player
    // the identical verbatim question reads as a fixed cast, not unique
    // individuals. Track question ids asked by ANYONE village-wide; draws
    // prefer globally-unasked questions and only repeat when the pool is
    // exhausted (a small camp does circle back to the same worries).
    villageAskedQs() {
      const v = this.state.village || {};
      v.askedQsAny = v.askedQsAny || [];
      return v.askedQsAny;
    },
    noteAskedQ(qid) {
      if (!qid) return;
      try {
        const a = this.villageAskedQs();
        if (a.indexOf(qid) === -1) a.push(qid);
      } catch (e) {}
    },

    // synthPrototype: derive Want/Know/Feel/Secret for generated villagers
    // from their occupation, personality, and backstory. Not hand-authored,
    // but specific enough to feel like a person, not a template.
    synthPrototype(v) {
      const occ = (v.formerOccupation || v.occupation || 'drifter').toLowerCase();
      const temp = ((v.personality || {}).temperament || 'steady').toLowerCase();
      const name = (v.name || 'they').split(' ')[0];

      // Know from occupation. PRONOUN-NEUTRAL (background audit 2026-10-11):
      // these lines were gendered ("she can look at a wound") while keyed
      // only on occupation — a male nurse got "she". Neutral phrasing.
      const knowByOcc = {
        'nurse': 'triage — reading a wound like a weather report',
        'cook': 'food — making anything edible, most things delicious',
        'chef': 'precision with a knife — no waste, no hesitation',
        'driver': 'roads — decades of knowing where everything is, or was',
        'engineer': 'fixing things — wire, tape, and stubbornness',
        'accountant': 'numbers — organizing chaos into systems',
        'teacher': 'explaining — making anything make sense',
        'farmer': 'growing — knowing what the land wants',
        'mechanic': 'engines — hearing what\'s wrong before seeing it',
      };
      let know = 'surviving — they\'ve learned fast';
      for (const [k, val] of Object.entries(knowByOcc)) {
        if (occ.includes(k)) { know = val; break; }
      }

      // Want: something specific and actionable. First-person: the hook is
      // SPOKEN by the villager as their own dialogue, never narrated in
      // third person about them (Steve 2026-10-06: third-person-as-speech fix).
      const wants = [
        `I'm running low on ${['bandages', 'salt', 'wire', 'paper', 'thread'][Math.floor(Math.random() * 5)]}. It's the kind of thing you don't miss until it's gone.`,
        `I want to ${['fix the water filter', 'map the east woods', 'build a better shelter', 'find a working radio'][Math.floor(Math.random() * 4)]}. Been thinking about it for days.`,
        `I'm worried about ${['the kids', 'the food stores', 'the winter', 'the strangers'][Math.floor(Math.random() * 4)]}. Trying not to say it out loud.`,
      ];
      const want = wants[Math.floor(Math.random() * wants.length)];

      // Feel from temperament. Every temperament gets its own read —
      // falling back to 'steady' made a mischievous villager "calm on the
      // surface", a voice/personality mismatch (background audit 2026-10-11).
      const feelByTemp = {
        'warm': 'Open and tired. They\'re holding on by holding others.',
        'steady': 'Calm on the surface. They\'ve decided to endure.',
        'sharp': 'Alert and a little angry. They\'re not going down easy.',
        'restless': 'Itchy. They need to move, to do, to not think.',
        'bold': 'Confident, or performing confidence. Hard to tell.',
        'cautious': 'Careful. Measuring everyone, including you.',
        'prickly': 'Guarded. The warmth is there; the door isn\'t.',
        'dry': 'Amused at everything, including this.',
        'gentle': 'Soft-spoken. Kindness as a deliberate practice.',
        'intense': 'Focused like a held breath. A lot, all at once.',
        'withdrawn': 'Far away even standing here. Watching, always.',
        'anxious': 'Wound tight. Already rehearsing what could go wrong.',
        'sardonic': 'Smirking at a world that keeps proving them right.',
        'earnest': 'Sincere to the point of vulnerability. Means it all.',
        'fidgety': 'Buzzing. Hands, feet, eyes — always in motion.',
        'stoic': 'Still water. Feeling plenty, showing none.',
        'mischievous': 'Up to something. Probably harmless. Probably.',
      };
      const feel = feelByTemp[temp] || feelByTemp.steady;

      // Secret: something specific with stakes — 6 distinct secrets so villagers
      // don't share (the duplicate opener bug: 2-item pool meant collisions).
      // First-person: confessed as "Can I tell you something? I..." — their
      // own voice, never third-person narration (Steve 2026-10-06).
      const secrets = [
        `I've been ${['skimming extra food', 'sneaking out at night', 'hiding an injury', 'writing letters I\'ll never send'][Math.floor(Math.random() * 4)]}. I'm ashamed and I can't stop.`,
        `Before the scattering, I ${['froze when it mattered', 'said something cruel', 'ran when I should have stayed', 'stole from someone who trusted me'][Math.floor(Math.random() * 4)]}. I think about it every day.`,
        `I'm ${['keeping a photo of someone I left behind', 'saving a candy bar for when things get better', 'practicing what I would say if I ever saw my family again'][Math.floor(Math.random() * 3)]}. I haven't told anyone.`,
        `I ${['don\'t actually know how to swim and I\'m terrified someone will find out', 'have been lying about my age — I\'m younger than I look', 'can\'t read, and I\'m scared it matters now'][Math.floor(Math.random() * 3)]}.`,
        `At night I ${['cry quietly so no one hears', 'talk to someone who isn\'t there anymore', 'count the stars and name them after people'][Math.floor(Math.random() * 3)]}.`,
        `I ${['stole medicine from the stash once and never confessed', 'know who took the extra rations but won\'t say', 'saw something in the woods I\'m not telling anyone about'][Math.floor(Math.random() * 3)]}.`,
      ];
      const secret = secrets[Math.floor(Math.random() * secrets.length)];

      // SECRET/WANT UNIQUENESS (background audit 2026-10-11, unique-person
      // law): two villagers confessing the identical secret reads as one
      // template. Re-roll on collision within the expedition (bounded —
      // the pool still stands when exhausted).
      try {
        const _us = this._usedSecrets || (this._usedSecrets = new Set());
        let w2 = want, s2 = secret, guard = 0;
        while (_us.has('w:' + w2) && guard++ < 8) w2 = wants[Math.floor(Math.random() * wants.length)];
        guard = 0;
        while (_us.has('s:' + s2) && guard++ < 8) s2 = secrets[Math.floor(Math.random() * secrets.length)];
        _us.add('w:' + w2); _us.add('s:' + s2);
        return { want: w2, know, feel, secret: s2, relationships: [] };
      } catch (e) { /* fall through */ }

      return { want, know, feel, secret, relationships: [] };
    },

    // convoGoalLines: the era-appropriate lines for a villager's goal.
    // Worker D 2026-10-11: the 'answers' goal ("make the System explain
    // itself") is entirely post-arrival vocabulary — every line names the
    // System. Pre-arrival (day < 7) nobody knows that word, so goal lines
    // about "the System" are canon violations, not personality. Before the
    // arrival, the same drive speaks era-neutrally (preSystemLines).
    convoGoalLines(goal, goalDef) {
      if (!goalDef) return [];
      if (goal === 'answers' && !this.state.systemArrived && goalDef.preSystemLines) {
        return goalDef.preSystemLines;
      }
      return goalDef.lines || [];
    },

    // convoQuestionOk: can this bespoke question be asked right now?
    // Trust and mood gates were the original filters; minDay adds the time
    // gate (Worker D 2026-10-11): "what got you through the first week?"
    // is nonsense on day 3, "did you sleep?" is nonsense on day 1. A
    // question whose time hasn't come is a precondition bug, not content.
    // CRISIS GATE (journey crisis r9 2026-10-13): a villager in physical
    // crisis (severity>=2 sickness, starving) does not ask small-talk
    // nostalgia questions — a gutrot sufferer asking "What did you do for
    // fun? Before." is tonally senseless. The gate is narrow: only
    // smallTalk-tagged questions are suppressed; everything else still
    // passes, and callers without a vid behave exactly as before.
    convoSpeakerInCrisis(vid) {
      if (!vid) return false;
      try {
        const sick = (((this.state.village || {}).sick || {})[vid]) || null;
        if (sick && (sick.severity || 0) >= 2) return true;
      } catch (e) {}
      try {
        if (this.npcNeeds && ((this.npcNeeds(vid) || {}).hunger || 0) > 70) return true;
      } catch (e) {}
      return false;
    },
    convoQuestionOk(q, trust, moodNow, vid) {
      if (!q) return false;
      if (trust < (q.minTrust || 0)) return false;
      if (q.when && q.when !== moodNow) return false;
      const day = (this.state.scholar || {}).day || 1;
      if ((q.minDay || 0) > day) return false;
      if (q.smallTalk && vid && this.convoSpeakerInCrisis(vid)) return false;
      return true;
    },

    // convoMatchReactive: does this NPC line ask the player something direct?
    // Returns { id, ...def } or null. Matched lines get contextual answers;
    // unmatched lines flow through the normal choice builder.
    // Matching is case-insensitive on a normalized line — bespoke defs use
    // short fragments ('how are you holding up') so openers and formal
    // questions share them instead of missing by a tail word.
    convoMatchReactive(line) {
      if (!line || typeof line !== 'string') return null;
      const norm = line.toLowerCase();
      for (const id of Object.keys(REACTIVE_DEFS)) {
        const def = REACTIVE_DEFS[id];
        if (norm.indexOf(String(def.match).toLowerCase()) !== -1) return Object.assign({ id }, def);
      }
      return null;
    },

    // convoGenericQ: the NPC just said something that's a direct question
    // with no bespoke reactive def. Classify it and hang it on the convo
    // (like reactiveQ): answers come first, pivots are suppressed, and a
    // dodged question gets one follow-up before it lapses. Never leave a
    // direct question answerless (Steve's Rule 4).
    convoGenericQ(vid, line) {
      const c = this.convoGet(vid);
      if (c.pendingQ || c.reactiveQ || c.pendingTrade || c.pendingHawk) return null;
      // Real favor instances have their own details/commit/refuse lifecycle.
      // A generic "Yes" cannot stand in for creating that obligation.
      if (c.choosingSubject || (c.thread === 'want' && (c.want?.stage || 0) < 3 &&
          (c.want?.id === 'ask_favor' || (c.want?.id === 'repay' && (this.openFavorObligation?.(vid)?.favorTask ||
            (c.want.favor?.waterRun && !c.want.favor.waterRun.returned)))))) return null;
      // Never stack questions: one hanging question at a time. A response
      // line that asks something new while a question hangs is part of the
      // dodge, not a second question (it must not reset the follow-up).
      if (c.genericQ) return null;
      if (this.convoMatchReactive(line)) return null;
      const gq = classifyQuestion(line);
      if (!gq) return null;
      c.genericQ = { kind: gq.kind, q: gq.q, followedUp: false };
      return c.genericQ;
    },

    // convoGenericAnswers: the answer options for a hanging generic
    // question. Real answers to what was asked — never topic-change
    // buttons masquerading as replies (Steve's Rule 1 + Rule 4).
    convoGenericAnswers(vid, gq) {
      if (!gq) return [];
      if (gq.kind === 'yn') {
        return [
          { id: 'gq:yn:yes', label: '"Yes."' },
          { id: 'gq:yn:no', label: '"No."' },
          { id: 'gq:yn:unsure', label: '"I don\'t know."' },
        ];
      }
      if (gq.kind === 'howru') {
        return [
          { id: 'gq:howru:bad', label: '"Honestly? Not great."' },
          { id: 'gq:howru:fine', label: '"I\'m fine."' },
          { id: 'gq:howru:busy', label: '"Better when I\'m busy."' },
        ];
      }
      if (gq.kind === 'greet') {
        return [
          { id: 'gq:greet:notmuch', label: '"Not much. You?"' },
          { id: 'gq:greet:surviving', label: '"Surviving."' },
        ];
      }
      if (gq.kind === 'reason') return [
        { id: 'gq:reason:understand', label: '"I want to understand you better."' },
        { id: 'gq:reason:curious', label: '"I was curious. You don\'t have to answer."' },
      ];
      if (gq.kind === 'day') return [
        { id: 'gq:day:count', label: '"It\'s day ' + this.state.scholar.day + '."' },
        { id: 'gq:day:unsure', label: '"I\'ve lost track of the days."' },
      ];
      return [
        { id: 'gq:open:take', label: '"I need a moment to think about that."' },
        { id: 'gq:open:unsure', label: '"I don\'t know how to answer that yet."' },
      ];
    },

    // convoHonestPassReact: the graceful accept when the player honestly
    // opts out of a bespoke question ("I'd rather not say."). No guilt,
    // no chill — wistful at most. Varied per villager AND per question
    // (unique-person law, Steve 2026-10-06): stable per (villager, qid)
    // so nobody contradicts themselves, different across people so it
    // never reads as a fixed cast. (Steve 2026-10-08.)
    convoHonestPassReact(vid, qid) {
      const pool = [
        '"Fair enough." A nod, no pressure. Some things keep.',
        '"Okay." They don\'t push. "Not everything needs saying out loud."',
        'An easy shrug. "Your call. I\'m just glad you\'re talking at all."',
        '"Say no more." And they mean it — the subject closes like a door, gently.',
        'They accept it without a flicker. "Plenty I don\'t say either."',
        '"Understood." A quiet beat that isn\'t awkward — just room.',
        'A small, real nod. "Some questions can wait. I\'m patient."',
        '"No worries." The conversation breathes, and moves on.',
      ];
      let h = 0;
      const s = String(vid == null ? '' : vid) + '|' + String(qid == null ? '' : qid);
      for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) >>> 0;
      return pool[h % pool.length];
    },

    // convoNoteFlora: the green world came up in this conversation. Later
    // teaching can connect to it — Rule 2: show/teach relates to what's
    // being discussed. Tracks a specific named plant when one appears.
    convoNoteFlora(vid, text) {
      if (!text) return;
      const c = this.convoGet(vid);
      const t = String(text).toLowerCase();
      // Fresh read per line: only the latest NPC line counts as "what's
      // being discussed". A stale mention from three turns ago is not a
      // connection — that's what the teach bridge is for.
      c.floraMentioned = null;
      try {
        for (const p of (this.data.plants || [])) {
          const nm = (p.name || '').toLowerCase();
          if (nm && nm.length > 3 && t.indexOf(nm) !== -1) {
            c.floraMentioned = { pid: p.id, name: p.name };
            return;
          }
        }
      } catch (e) {}
      if (FLORA_WORDS.test(t)) c.floraMentioned = { pid: null, name: null };
    },

    convoBudget(vid) {
      const temp = this.npcTemper(vid);
      const n = this.npcNeeds(vid);
      let b = 4;
      if ((n.social || 0) > 70) b += 1;
      if (temp === 'warm' || temp === 'gentle') b += 1;
      if (temp === 'withdrawn' || temp === 'prickly' || temp === 'restless') b -= 1;
      // INTELLIGENCE SHAPES TALK: social and analytical minds linger over ideas;
      // practical minds would rather be doing.
      try {
        const ip = this.npcIntel(vid).primary;
        if (ip === 'social' || ip === 'analytical') b += 1;
        if (ip === 'practical') b -= 1;
      } catch (e) {}
      // Brief people are brief — but never cut off after a single exchange.
      // Floor 3: opener + two real turns before the wind-down can land.
      // RELATIONSHIP AGE (Steve 2026-10-06): old friends linger — more to
      // say, more comfortable saying it. Close tier gets +1 budget.
      try {
        if (this.convoVoiceTier && this.convoVoiceTier(vid) === 'close') b += 1;
      } catch (e) {}
      return Math.max(3, Math.min(7, b));
    },

    // convoHesitationMs: people don't respond instantly. A brief,
    // personality-shaped pause before their line lands — impulsive people
    // fire back, thoughtful people take their time. Deep or emotional beats
    // get a longer pause. Feels human, never laggy (200–950ms).
    // RELATIONSHIP AGE (Steve 2026-10-06): the rhythm of a relationship.
    // Strangers are careful — they weigh words, feel for the shape of you.
    // Old friends fire back — shorthand, no performance. New +70ms, close
    // -110ms. First meetings open slower (sizing each other up); reunions
    // open quick (they saw you coming).
    convoHesitationMs(vid, choiceId, isOpening) {
      const c = this.convoGet(vid);
      const isFirstMeeting = (c.count || 0) <= 1;
      let ms = isOpening ? (isFirstMeeting ? 380 : 260) : 400;
      const temp = (this.npcTemper && this.npcTemper(vid)) || '';
      if (temp === 'bold' || temp === 'intense' || temp === 'restless') ms -= 150;
      else if (temp === 'cautious' || temp === 'withdrawn' || temp === 'steady') ms += 230;
      else if (temp === 'warm' || temp === 'gentle') ms += 90;
      // 'dry' and 'prickly' answer at their own pace — no modifier.
      const deep = choiceId && /^(ask:|more|theorize|confront|trade|teach|offer_help|invite_party|ans:)/.test(choiceId);
      if (deep) ms += 260;
      try {
        const tier = this.convoVoiceTier ? this.convoVoiceTier(vid) : 'new';
        if (tier === 'new') ms += 70;
        else if (tier === 'close') ms -= 110;
      } catch (e) {}
      return Math.max(200, Math.min(950, ms + Math.floor(Math.random() * 120)));
    },

    // convoDeepTick: going deep costs a little time (1 tick), not energy.
    // Small talk is cheap — you're already standing there. A real exchange,
    // a lesson, a hard question: those take a real moment. Keeps social
    // play viable: a full deep conversation runs ~4-6 ticks, not a day.
    convoDeepTick(vid) {
      try { this.tickAction(1); } catch (e) {}
      try { this.setEngaged(vid, 2); } catch (e) {}
    },

    // convoPick: no repeats, ever. Tracks by line TEXT (not index), so it
    // stays correct even when the pool's composition shifts with mood/rep.
    // Filters against EVERYTHING ever said to this villager — a line used in
    // one thread never resurfaces in another. ALSO filters village-wide:
    // lines said by ANYONE in the village in the last LINE_FRESH_DAYS are
    // deprioritized, so shared pools don't recycle visibly across speakers.
    // Falls back to per-villager-fresh, then to anything, then null.
    // Returns the line, or null when the pool is genuinely exhausted.
    convoPick(vid, key, pool, hard) {
      const c = this.convoGet(vid);
      c.said[key] = c.said[key] || [];
      const allSaid = [];
      for (const k of Object.keys(c.said)) for (const l of c.said[k]) allSaid.push(l);
      const fresh = (pool || []).filter(l => allSaid.indexOf(l) === -1);
      if (!fresh.length) return null;
      let pickPool = fresh;
      try {
        const vf = fresh.filter(l => this.villageLineFresh(l));
        if (vf.length) pickPool = vf;
      } catch (e) {}
      // RUN-LEDGER AWARENESS (convo gaps 2026-10-11): prefer lines no
      // villager has spoken in the current window — sayLine would block
      // them anyway, and the block is what produced the lying fallback.
      // A preference, not a hard filter: small pools must not collapse.
      try {
        const rl = this.convoRunLedger ? this.convoRunLedger() : [];
        if (rl.length) {
          const key0 = (l) => {
            try { return this.convoSplitBeats(String(l))[0].trim(); }
            catch (e2) { return String(l).trim(); }
          };
          const unf = pickPool.filter(l => rl.indexOf(key0(l)) === -1);
          if (unf.length) pickPool = unf;
        }
      } catch (e) {}
      // HARD MODE (journey-social r19 2026-10-16): the caller is selecting
      // an opener with fallbacks behind it (convoOpening). A line that
      // would be blocked at emission must return null so the caller falls
      // through to the next candidate — never a dry opener. Default stays
      // a preference: mid-conversation beats have no fallbacks.
      if (hard) {
        const self = this;
        const ok = pickPool.filter(l => {
          try { return !self.convoWouldBlock(vid, l); } catch (e) { return true; }
        });
        if (!ok.length) return null;
        pickPool = ok;
      }
      const line = pickPool[Math.floor(Math.random() * pickPool.length)];
      c.said[key].push(line);
      try { this.noteVillageLine(line); } catch (e) {}
      return line;
    },

    // convoDeeperPick: the bespoke-question `deeper` beat (see the DEEPER
    // note at the answer path). DEEPER VARIANTS (journey-deepening r32
    // 2026-10-22): these beats were singleton strings, so every villager
    // recited the same anecdote verbatim (q_first_week: two villagers, one
    // run, identical "spite at the sky" story). Data may now carry an array
    // of variants; selection goes through convoPick — a villager never
    // repeats a line and village-fresh lines are preferred, so the same
    // question lands differently per speaker. Plain strings keep the old
    // path (single-variant pool). Falls back to the first variant rather
    // than dropping the reliably-queued beat.
    convoDeeperPick(vid, qd) {
      const pool = Array.isArray(qd.deeper) ? qd.deeper : [qd.deeper];
      const key = 'deeper:' + ((qd && qd.id) || 'q');
      try {
        const l = this.convoPick(vid, key, pool);
        if (l) return l;
      } catch (e) {}
      return pool[0];
    },

    // convoPickCycle: like convoPick, but generic pools (exits, "told you
    // everything") are allowed to cycle rather than collapse to one fixed
    // string — the order still varies, so it never feels like a loop.
    convoPickCycle(vid, key, pool) {
      let l = this.convoPick(vid, key, pool);
      if (l == null) {
        const c = this.convoGet(vid);
        // ANTI-REPEAT (journey-endgame r10 2026-10-14): the reset used to
        // clear the key's said-list outright, so the random re-pick drew
        // from the full pool — including the exact line just spoken
        // (comfort pool: verbatim '"Thanks. ...Thanks for saying that."'
        // back-to-back, caught live; ~1/3 per exhaustion). Seed the fresh
        // list with the last line so the cycle never opens with an
        // immediate repeat. Cross-key memory is untouched — one thread
        // still never resurfaces in another.
        // R18 MEMORY WINDOW (journey-landing r18 2026-10-16): seeding with
        // only the last line let the reshuffle repeat a distinctive line
        // 3 turns later (comfort pool: "You're kind. Don't let this place
        // change that." twice in one sitting, seed-64 probe). Keep the
        // last 3 lines — a real person wouldn't repeat a distinctive line
        // within 3 turns. Capped at pool.length - 1 so small pools still
        // cycle instead of collapsing to null.
        const keep = Math.max(1, Math.min(3, (pool || []).length - 1));
        const last = (c.said[key] || []).slice(-keep);
        c.said[key] = last;
        l = this.convoPick(vid, key, pool);
      }
      return l;
    },

    // convoFavorHead: lines that already open their own discourse — the favor
    // follow-up heads name the prior business outright ("About {short} — ...",
    // "Never mind {short} — ...", "You came through on {short}",
    // "You said you'd help with {short}...", the inherited "I asked X about
    // {short} — ..."). Prepending a voice discourse-opener onto one doubles
    // the discourse move ("The way I read it — Never mind the food I needed
    // — ..." — caught live, journey establishment r5 2026-10-12). Shared by
    // the unfinished-business seed guard and voiceLine.
    convoFavorHead(line) {
      const t = String(line == null ? '' : line);
      return /^"(About |Never mind |You came through on |You said you'd help with |I asked )/.test(t);
    },

    convoOpening(vid, want) {
      const cg = (this.data.characterGen || {}).convo || {};
      const v = this.state.village;
      const c = this.convoGet(vid);
      const trust = (v.trust || {})[vid] || 10;
      const temp = this.npcTemper(vid);
      const mood = this.npcMood(vid);
      const goal = this.npcGoal(vid);
      const goalDef = (this.data.characterGen.goals || []).find(g => g.id === goal);
      const vp = this.vpOf(vid);

      // 1. THEY asked to talk — their reason leads, once. The stored line is
      // a template: the requester's name may have been earned since the
      // request fired, so it renders fresh here, never stale.
      // FIRST, before any random hooks: a pending request is why they're
      // here. (socialite playtest 2026-10-06: the want/secret/taught hooks
      // used to pre-empt it intermittently, stranding the request.)
      const treq = (v.talkRequests || {})[vid];
      if (treq && !treq.delivered) {
        const tline = this.renderTalkLine(String(treq.line).replace(/ \(Talk to .*?\.\)$/, ''), vid);
        // OPENER SKIP (journey-social r19 2026-10-16): a run-blocked request
        // opener must not go dry — and must NOT mark delivered, or the
        // reason they came to talk is stranded. The request stays pending
        // and fires next conversation (the 48-entry ledger slides).
        if (!this.convoWouldBlock(vid, tline)) {
          treq.delivered = true;
          return { line: tline, thread: 'request' };
        }
      }

      // 2. THE TABLE SITS (journey-endgame r11 2026-10-14): the most
      // newsworthy thing that has ever happened to the village. While the
      // table waits unanswered — or once per resolution — they talk about
      // it first, ahead of secrets, taught-plant callbacks, and small talk.
      // Talk requests keep priority (#1): they came to you for a reason.
      // Once per villager per sitting; never a loop.
      try {
        const cc0 = this.convoGet(vid);
        const prevRemarked = cc0 ? cc0.tableRemarked : undefined;
        const top = this.convoTableOpener(vid);
        if (top) {
          // OPENER SKIP (r19): a run-blocked table remark must not go dry —
          // restore the once-per flag so it fires next conversation.
          if (this.convoWouldBlock(vid, top.line)) {
            if (cc0) cc0.tableRemarked = prevRemarked;
          } else {
            return top;
          }
        }
      } catch (e) {}

      // 3. UNFINISHED BUSINESS — a seed from last time opens the conversation.
      // The want was established before; now it resurfaces, named. The seed
      // is consumed by the resolution at endConvo (or expiry after 7 days).
      if (want && want.fromSeed && want.def) {
        const opener = this.convoWantOpener(vid, want);
        // OPENER SKIP (r19): compute the full voiced opener BEFORE the
        // stage/mood side effects — a blocked seed opener falls through to
        // the next candidate with the seed still planted (it fires next
        // conversation), never a dry line.
        if (opener && opener.line) {
          // QUOTE HYGIENE (dialogue rethink, Steve 2026-10-07): the old
          // composition left a stray quote — the opener keeps its own layer.
          // FAVOR FOLLOW-UP (2026-10-11): the favor opener names the prior
          // ask itself ("About {short} — ...") — don't double-prefix it.
          // SEED VOICE (journey endgame 2026-10-11): openers shaped
          // "speech." + narration (seek_comfort) can't be dequoted blindly —
          // stripping only the outer quotes leaves a dangling " after the
          // speech and a stray " at the end. Close the quote after the
          // spoken part; the narration stays outside it.
          // NAMED-HEAD RECOGNITION (journey establishment r4 2026-10-12):
          // every convoFavorFollowup head already names the favor — not just
          // "About {short}". Without the wider match, the settled states
          // ("Never mind {short}", "You came through on {short}", "You said
          // you'd help with {short}") got the redundant seed prefix:
          // "About the help I asked you for — Never mind the food they
          // needed — ..." (caught live in r4 transcripts, 777-day25).
          const alreadyNamed = (typeof this.convoFavorHead === 'function')
            ? this.convoFavorHead(opener.line)
            : /^"(About |Never mind |You came through on |You said you'd help with )/.test(opener.line);
          // INHERITED SEED (journey-succession r26 2026-10-19): the seed was
          // planted in the predecessor's conversation (stamped inh at the
          // handoff, ledger.js) — the follow-up must name them, never frame
          // the new bearer was the one who was asked. Transcript-caught:
          // "About that question — ..." addressed to the successor for a
          // question the dead bearer walked away from. Mirrors the thread
          // resume (convoResumeOpener) and the favor's INHERITED ASK.
          // Favor seeds excluded: convoFavorFollowup names the predecessor
          // itself. One-shot (inheritedSeedAcked), like the favor's
          // inheritedAcked — the seed is consumed on resolve anyway; this
          // covers only the blocked-opener re-fire.
          let seedPred = null, _liveSeed = null;
          try {
            _liveSeed = ((this.state.village || {}).convoSeeds || {})[vid] || null;
            if (_liveSeed && !want.seedFavorId && !_liveSeed.inheritedSeedAcked &&
                typeof this.inheritedName === 'function') {
              seedPred = this.inheritedName(_liveSeed);
            }
          } catch (e) { seedPred = null; }
          let seedLine;
          if (alreadyNamed) {
            seedLine = opener.line;
          } else if (seedPred) {
            try { _liveSeed.inheritedSeedAcked = true; } catch (e) { console.warn('[conversation] seed acknowledgement', e); }
            const _note = want.seedNote || 'last time';
            const _head = `I asked ${seedPred} about ${_note} — ${seedPred}'s gone.`;
            const spoken = /^"([^"]+)([.?!])" ([\s\S]*)$/.exec(opener.line);
            if (spoken) {
              seedLine = `"${_head} ${spoken[1]}${spoken[2]}" ${spoken[3]}`;
            } else {
              seedLine = `"${_head} ` +
                opener.line.replace(/^"/, '').replace(/"$/, '') + '"';
            }
          } else {
            const spoken = /^"([^"]+)([.?!])" ([\s\S]*)$/.exec(opener.line);
            if (spoken) {
              seedLine = `"About ${want.seedNote || 'last time'} — ${spoken[1]}${spoken[2]}" ${spoken[3]}`;
            } else {
              seedLine = `"About ${want.seedNote || 'last time'} — ` +
                opener.line.replace(/^"/, '').replace(/"$/, '') + '"';
            }
          }
          // FAVOR FOLLOW-UP (convo favor system 2026-10-11): the favor
          // opener may have already established the ask (stage 2, menu goes
          // straight to commit/deflect). Don't downgrade it.
          const seedVLine = this.voiceLine(vid, seedLine);
          if (this.convoWouldBlock(vid, seedVLine)) {
            // Blocked: fall through — seed stays planted, side effects
            // deferred, next conversation resumes it.
          } else {
            this.convoAcceptWantQuestion(vid, opener);
            if ((c.want.stage || 0) < 1) c.want.stage = 1; // surfaced
            // SURFACED (gap-closure 2026-10-17): the want spoke — defs with
            // an onSurfaced hook (seek_taken's 3-day gate) start it here,
            // never on a skipped opener.
            try { if (want.def.onSurfaced) want.def.onSurfaced.call(this, vid); }
            catch (e) { console.warn('[convo] onSurfaced', e); }
            // UNFINISHED BUSINESS (dialog rethink Phase 1, Steve 2026-10-08):
            // seed-driven conversations open one mood band cooler. Whatever
            // was left hanging, it wasn't nothing — the air is heavier.
            if (typeof this.convoMoodShift === 'function') this.convoMoodShift(vid, -1);
            return { line: seedVLine, thread: 'want', wantId: want.id };
          }
        }
      }

      // ACUTE GRIEF (journey-social r16 2026-10-15): someone died within the
      // last ~3 days (villageEvent('death') sets v.grief=3, decaying 1/day;
      // murder of an innocent sets 5). The grief thread used to be fallback
      // #4 — structurally starved behind the want opener, which is the
      // default and almost always fires (r15: 0 grief-thread convos in
      // 3,908 with 43 villager deaths). Grief in its acute window IS
      // something the villager has on their mind, so it displaces the
      // default want/small-talk opening — but nothing concrete: pending
      // talk requests (#1), the table (#2), and unfinished business (#3)
      // keep priority above (they're commitments the player is owed), and
      // acute bodily needs own the opening too (a villager doubled up with
      // gut cramps leads with the cramps — crisis-leg precedent). The
      // no-repeat ledger means each villager says each grief line once per
      // life, so the thread can't spam the whole window; when the pool is
      // exhausted (or grief is stale) the opener falls through to want.
      if ((v.grief || 0) > 0) {
        let acuteNeed = false;
        try {
          if (want && want.id === 'ask_favor' && typeof this.convoFindFavorNeed === 'function') {
            const wneed = this.convoFindFavorNeed(vid);
            acuteNeed = !!(wneed && (wneed.urgency || 0) >= 4);
          }
        } catch (e) {}
        if (!acuteNeed) {
          // OPENER SKIP (r19): hard filter — when the pool is ledger-
          // blocked (the whole village grieving at once), fall through
          // rather than dry-open. The pool slot is NOT consumed on a skip;
          // the villager grieves next conversation.
          const l = this.convoPick(vid, 'grief', this.convoGriefOpenerPool(), true);
          if (l) return { line: this.voiceLine(vid, l), thread: 'grief' };
        }
      }

      // PROTOTYPE: Four Things (Steve 2026-10-05) — the SECRET survives.
      // (The old 30% proto-want hook is retired: the real want system owns
      // the opening now. The secret is a high-trust confidence, kept.)
      const villager = (this.data.villagers || []).find(x => x.id === vid);
      let proto = villager && villager.prototype;
      if (!proto && villager) {
        proto = this.synthPrototype(villager);
        // Cache it — otherwise every conversation regenerates a random prototype
        // and two villagers can share the same secret/want (the duplicate opener bug)
        villager.prototype = proto;
      }
      if (proto) {
        // Secret at high trust
        // ACUTE FIRST (crisis leg 2026-10-12): a villager doubled up with gut
        // cramps doesn't open with secrets — an acute need (favor urgency 4:
        // sickness, starving hunger, serious wounds) owns the opening. The
        // secret keeps for a later conversation. (The want picker already
        // treats acute needs as leading — "that's human" — but this hook
        // didn't, so the sick opened with "Can I tell you something?" and
        // never mentioned the fever.)
        let acuteNeed = false;
        try {
          if (want && want.id === 'ask_favor' && typeof this.convoFindFavorNeed === 'function') {
            const wneed = this.convoFindFavorNeed(vid);
            acuteNeed = !!(wneed && (wneed.urgency || 0) >= 4);
          }
        } catch (e) {}
        if (!acuteNeed && trust >= 40 && proto.secret && !c.secretShared && Math.random() < 0.2) {
          const sline = this.voiceLine(vid, `"Can I tell you something? ${proto.secret}"`);
          // OPENER SKIP (r19): never burn the once-per-secret flag on a
          // blocked line — the secret keeps for a conversation that can
          // actually speak it.
          if (!this.convoWouldBlock(vid, sline)) {
            c.secretShared = true;
            return { line: sline, thread: 'secret' };
          }
        }
      }

      // TAUGHT PLANTS (Steve 2026-10-05): if you taught them something, they
      // remember. The one real conversation mechanic was invisible — now it's
      // visible. They reference what you taught them.
      // FABRICATION FIX (convo rebuild 2026-10-11, Steve: fix structurally):
      // this used to read v.taught — the KNOWLEDGE union, seeded at game
      // start with home-region familiarity. Day-1 strangers "remembered"
      // lessons that never happened. Now it reads taughtByPlayer ONLY:
      // plants the player genuinely taught this villager this run. No
      // teaching event, no opener — the invariant is structural, not gated.
      const taught = this.playerTaughtPlants ? this.playerTaughtPlants(vid) : [];
      if (taught.length > 0 && !c.taughtMentioned && Math.random() < 0.4) {
        const pid = taught[Math.floor(Math.random() * taught.length)];
        const plant = (this.data.plants || []).find(p => p.id === pid);
        const pname = plant ? plant.name : 'that plant';
        const refs = [
          `"Hey — I found some ${pname} today. You were right, it was right where you said."`,
          `"I tried the ${pname} like you showed me. Didn't poison anyone, so that's a win."`,
          `"${pname} — I keep thinking about what you said. I'm seeing it everywhere now."`,
        ];
        // OPENER SKIP (r19): hard filter — the mention keeps for a
        // conversation that can speak it; the flag is not burned on a skip.
        const tr = this.convoPick(vid, 'taughtref', refs, true);
        if (tr) {
          c.taughtMentioned = true;
          return { line: this.voiceLine(vid, tr), thread: 'taughtref' };
        }
      }

      // 2. They remember what you told them. Being remembered feels real.
      // PLAYTEST social r10 2026-10-13: the old origin/trust-only hard-coded
      // blocks became this generalized loop. Every bespoke question with a
      // `recalls` map (answer-specific) or a legacy generic `recall` can fire
      // a "they remembered" opener once per villager. Rules:
      //   - only an answer WITH a recall entry fires: opt-out answers and
      //     honest_pass never fire (no fabricated memory — the r9 q_trust
      //     lesson: the recall must match the words the player actually said)
      //   - a `recalls` map is STRICT: unmapped answers do NOT fall back to
      //     the generic `recall` (this preserves q_origin's old a_tell-only
      //     gating). The generic `recall` is the fallback only for questions
      //     with no map at all. Each question fires at most once (c.recalled).
      const regionRecall = (this.homeRegion || (this.state.scholar || {}).homeRegion) || 'wherever you said';
      for (const qd of (cg.questions || [])) {
        if (!(qd.recall || qd.recalls)) continue;
        const qid = qd.id;
        const ans = c.answered && c.answered[qid];
        if (!ans || ans === 'honest_pass' || (c.recalled && c.recalled[qid])) continue;
        const answerDef = (qd.answers || []).find(a => a.id === ans);
        if (answerDef && answerDef.honest_opt_out) continue;
        const rec = (qd.recalls && qd.recalls[ans]) || (!qd.recalls ? qd.recall : null);
        if (!rec) continue;
        const rline = String(rec).replaceAll('{region}', regionRecall);
        // OPENER SKIP (r19): a run-blocked memory must not go dry — and
        // must not burn this question's once-per flag. Try the next
        // question's memory; the skipped one fires next conversation.
        if (this.convoWouldBlock(vid, rline)) continue;
        c.recalled = c.recalled || {};
        c.recalled[qid] = true;
        return { line: rline, thread: 'recall' };
      }
      // 3. THE WANT — the spine of the conversation (convo rebuild 2026-10-11,
      // Steve). Every conversation opens with something the NPC wants: a
      // favor, a question they need answered, news they must share, comfort
      // they need. Strangers included (Principle 12 overridden) — a stranger
      // with nothing on their mind is a stranger with nothing to say, and
      // that's the emptiness Steve called out. Small talk is the fallback,
      // never the default.
      if (want && want.def && !want.fromSeed) {
        const opener = this.convoWantOpener(vid, want);
        if (opener && opener.line) {
          const wline = this.voiceLine(vid, opener.line);
          // OPENER SKIP (r19): a run-blocked want opener falls through to
          // the next candidate — the want stays live at stage 0 and
          // resurfaces next conversation (or as a seed), never a dry line.
          if (!this.convoWouldBlock(vid, wline)) {
            this.convoAcceptWantQuestion(vid, opener);
            c.want.stage = 1; // surfaced, in the opening beats
            try { if (want.def.onSurfaced) want.def.onSurfaced.call(this, vid); }
            catch (e) { console.warn('[convo] onSurfaced', e); }
            return { line: wline, thread: 'want', wantId: want.id };
          }
          // STALE OPENER (gap-closure 2026-10-17): every fresh variant is
          // ledger-blocked — a long-lived want (seek_taken at trust 100 on
          // day 100) would otherwise go permanently mute: the goal fallback
          // hijacks the topic every conversation while the want stays
          // "live" but can never surface. Reframe instead: the NPC names
          // what's still on their mind. Defs supply state-aware reframes
          // via staleOpener(vid); the generic fallback names the want
          // plainly. Still ledger-checked — a blocked stale line falls
          // through honestly.
          let sline = null;
          try {
            sline = (typeof want.def.staleOpener === 'function')
              ? want.def.staleOpener.call(this, vid)
              : this.convoWantStaleOpener(vid, want);
          } catch (e) { console.warn('[convo] staleOpener', e); sline = null; }
          if (sline) {
            const vsline = this.voiceLine(vid, sline);
            if (!this.convoWouldBlock(vid, vsline)) {
              c.want.stage = 1; // surfaced, in the opening beats
              try { if (want.def.onSurfaced) want.def.onSurfaced.call(this, vid); }
              catch (e) { console.warn('[convo] onSurfaced', e); }
              return { line: vsline, thread: 'want', wantId: want.id };
            }
          }
        }
      }
      // 4. Fallbacks — the village's weather, their goal, small talk. These
      // only run when no want was selected (shouldn't happen) or its opener
      // failed. The want is the default; these are the safety net.
      if ((v.grief || 0) > 0) {
        const l = this.convoPick(vid, 'grief', this.convoGriefOpenerPool(), true);
        if (l) return { line: this.voiceLine(vid, l), thread: 'grief' };
      }
      if ((v.cheer || 0) > 0 && Math.random() < 0.5) {
        const l = this.convoPick(vid, 'cheer', [
          '"Good day, huh? Almost feels normal."',
          '"People are smiling. I forgot what that looked like."',
        ], true);
        if (l) return { line: this.voiceLine(vid, l), thread: 'cheer' };
      }
      // 5. What they want, said plainly — if they trust you enough to say it.
      const shareAt = temp === 'withdrawn' ? 60 : temp === 'prickly' ? 50
        : (temp === 'warm' || temp === 'gentle') ? 25 : 35;
      if (goalDef && trust >= shareAt) {
        const l = this.convoPick(vid, 'goal', this.convoGoalLines(goal, goalDef));
        if (l) {
          const gline = this.voiceLine(vid, this.fillTalkLine(l, vp));
          // OPENER SKIP (r19): check the final filled line — placeholders
          // can shift the ledger key.
          if (!this.convoWouldBlock(vid, gline)) return { line: gline, thread: 'goal' };
        }
      }
      // BOND SURFACE (journey-social r22 2026-10-18): sedimented relationships
      // color the chit-chat — a depth-2 friend and a depth-(-1) rival don't
      // open like strangers. Tried once (ledger-checked, OPENER-SKIP
      // pattern), then falls through to the general pool. Every commitment
      // above (talk request, table, unfinished business, grief, secrets,
      // taught-refs, recalls, wants, goal-share) keeps priority — a bond
      // tints the small talk, it never hijacks it. Feeling-level only: the
      // bond record stores no event history, so no line may name a specific
      // shared event (no fabricated memories).
      try {
        const bnd = (typeof this.bondGet === 'function') ? this.bondGet(this.villagerId, vid) : null;
        const bdepth = (bnd && bnd.depth) || 0;
        const bondPool = bdepth >= 2 ? (cg.bondWarm || []) : bdepth <= -1 ? (cg.bondCold || []) : null;
        if (bondPool && bondPool.length) {
          // era filter (same rule as the general pool below: pre-day-7, no
          // System references — it hasn't arrived). eraOk is defined further
          // down; don't reference it here (TDZ).
          const sysUpB = !!this.state.systemArrived;
          const eraPool = bondPool.filter(l => sysUpB || !/\bSystem\b/.test(String(l)));
          const bl = this.convoPick(vid, 'small', eraPool, true);
          if (bl) {
            const bfilled = this.fillTalkLine(bl, vp);
            const bline = this.voiceLine(vid, bfilled);
            // BOND ENTRY BEAT (r22): the opener WAS the bond line — the
            // entry beat in startConvo must not double-mark it.
            if (!this.convoWouldBlock(vid, bline)) { c.bondOpened = true; return { line: bline, thread: 'small' }; }
          }
        }
      } catch (e) {}
      // 6. Contextual small talk — mood, temperament, reputation. Never repeated.
      const pool = [];
      const push = (arr, w) => { for (const x of (arr || [])) for (let i = 0; i < (w || 1); i++) pool.push(x); };
      // KNOWLEDGE GATE (dialog rebuild 2026-10-11): pre-day-7, nobody references
      // the System — it hasn't arrived. Filter System-name lines from the
      // small-talk pools (e.g. the sardonic "If the System wanted us dead").
      const sysUp = !!this.state.systemArrived;
      const eraOk = (arr) => (arr || []).filter(l => sysUp || !/\bSystem\b/.test(String(l)));
      push(eraOk((this.data.characterGen.moodTalk || {})[mood]), (mood === 'grieving' || mood === 'scared') ? 3 : 1);
      push(eraOk((this.data.characterGen.temperamentTalk || {})[temp]), 2);
      push(this.repTalkLines(vid), 2);
      // INTELLIGENCE VOICE: analytical people open with questions, practical
      // people open with work, social people open with the group. How someone
      // is smart shapes how they talk. (Note: cg here is characterGen.convo;
      // intelOpeners lives at characterGen top level.)
      try { push(((this.data.characterGen || {}).intelOpeners || {})[this.npcIntel(vid).primary], 2); } catch (e) {}
      // Talk templates: sample 8 fresh each time, not the same first 8 —
      // otherwise every villager's small talk converges on the same lines.
      const allT = (this.data.characterGen.talkTemplates || []).slice();
      for (let i = allT.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = allT[i]; allT[i] = allT[j]; allT[j] = t;
      }
      push(eraOk(allT.slice(0, 8)), 1);
      if (!pool.length) push(cg.openers || ['"Hey."'], 1);
      // Authored-voiced lines (mood/temperament/intel) already sound like
      // someone — the voice layer only voices the generic pools.
      const voiced = new Set();
      for (const x of ((this.data.characterGen.moodTalk || {})[mood] || [])) voiced.add(x);
      for (const x of ((this.data.characterGen.temperamentTalk || {})[temp] || [])) voiced.add(x);
      try { for (const x of (((this.data.characterGen || {}).intelOpeners || {})[this.npcIntel(vid).primary] || [])) voiced.add(x); } catch (e) {}
      const l = this.convoPick(vid, 'small', this.voicePool(vid, pool));
      if (l) {
        const filled = this.fillTalkLine(l, vp);
        const sline = voiced.has(l) ? filled : this.voiceLine(vid, filled);
        // OPENER SKIP (r19): last content candidate — a blocked small-talk
        // line falls through to the reopeners below, not a dry line.
        if (!this.convoWouldBlock(vid, sline)) return { line: sline, thread: 'small' };
      }
      // Reopeners: the small-talk well is dry, but you've talked before —
      // a familiar line beats a loop. (Previously dead data; now wired in.)
      // BOND-AWARE (journey-social r23 2026-10-18): a rival doesn't greet
      // you warmly on re-open either — "I'm glad it's you. I needed a
      // friendly face." from someone at depth -2 is the same blank as the
      // warm invite (r22 blank #1). Rivals skip the warm reopeners and
      // fall through to the honest exhausted line below.
      if ((c.count || 0) > 1) {
        let reopenPool = cg.reopeners || [];
        try {
          const bnd = (typeof this.bondGet === 'function') ? this.bondGet(this.villagerId, vid) : null;
          const bd = (bnd && bnd.depth) || 0, bv = (bnd && bnd.v) || 0;
          if ((bd <= -1 || bv <= -25) && reopenPool.length) reopenPool = [];
        } catch (e) {}
        if (reopenPool.length) {
          const rl = this.convoPick(vid, 'small', reopenPool);
          if (rl) return { line: this.voiceLine(vid, this.fillTalkLine(rl, vp)), thread: 'small' };
        }
      }
      // 6. Truly nothing new — said like a person, not a loop.
      const ex = this.convoPickCycle(vid, 'exh', cg.exhausted || ['"I\'ve told you everything I know."']);
      return { line: this.voiceLine(vid, ex || '"Good to just be around people."'), thread: 'small' };
    },

    // THE TABLE SITS — opener (journey-endgame r11 2026-10-14). The most
    // newsworthy thing that has ever happened to the village: while the
    // table waits unanswered (or during the win-day-floor deferral), and
    // once after it resolves, villagers open with it — ahead of secrets,
    // taught-plant callbacks, and small talk. Once per villager per sitting
    // per phase — one remark while it waits, one after it resolves (r12:
    // the kind is part of the once-per key; a waiting remark must not eat
    // the resolved remark). Talk requests still lead (convoOpening #1), and planted
    // want-seeds keep their resume priority (a favor follow-up is a
    // commitment, not chatter). Question openers route through
    // convoMatchReactive downstream and become answerable — the NPC wants
    // to know what you're going to tell it.
    convoTableSitting() {
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        if (!pg || !(pg.tableSittingId | 0)) return false;
        const T = (typeof this.tableState === 'function') ? this.tableState() : {};
        return !!pg.tableWaiting || !!T.winDeferred ||
          (!!pg.tableDone && T.phase && T.phase !== 'done');
      } catch (e) { return false; }
    },
    convoTableOpener(vid) {
      // Fires while the table actively sits (convoTableSitting) OR once
      // after it resolves (the run usually ends on a win, so this is the
      // rare continued run — downgrade paths, or the table answered without
      // winning). After resolution the sitting predicate is false by design
      // (the table is gone) — the resolved remark is still owed once per
      // sitting, even to villagers who already remarked while it waited
      // (r12: kind-aware guard below).
      const pg0 = (typeof this.progState === 'function') ? this.progState() : null;
      if (!pg0 || !(pg0.tableSittingId | 0)) return null; // never sat this run
      if (!this.convoTableSitting()) {
        const T0 = (typeof this.tableState === 'function') ? this.tableState() : {};
        if (!(pg0.tableDone && T0.phase === 'done')) return null;
      }
      const pg = this.progState();
      const sitting = pg.tableSittingId | 0;
      const c = this.convoGet(vid);
      if (!c) return null;
      const T = (typeof this.tableState === 'function') ? this.tableState() : {};
      const deferred = !!T.winDeferred;
      const waiting = deferred || !!pg.tableWaiting ||
        (!!pg.tableDone && T.phase && T.phase !== 'done');
      const resolved = !!pg.tableDone && T.phase === 'done';
      if (!waiting && !resolved) return null;
      // REMARK KIND (journey-endgame r12 2026-10-15): one remark while the
      // table waits AND one after it resolves — they are different news
      // ("it's sitting up there" vs "you walked out of the light"). The old
      // guard compared sitting only, so a villager who remarked during the
      // wait never got the post-resolution remark: the "once after it
      // resolves" half of the design never fired for them. The kind is part
      // of the once-per key now; repeat conversations in the same phase
      // still remark only once (never a loop).
      const wantKind = resolved ? 'done' : 'waiting';
      const remarked = c.tableRemarked;
      if (remarked && remarked.sitting === sitting && remarked.kind === wantKind) return null; // said their piece for this phase
      c.tableRemarked = { sitting: sitting, kind: wantKind };
      let pool;
      if (deferred) {
        pool = [
          '"The table\'s still sitting up there. Waiting on the days, they say — ninety dawns. We just... live, until then?"',
        ];
      } else if (wantKind === 'done') {
        // RESOLVED POOL (journey-endgame r13 2026-10-15): the kind-aware
        // guard above computes wantKind='done' once the table resolves, but
        // the pool used to branch on `waiting` — and pg.tableWaiting is
        // never cleared by the resolve paths, so post-win villagers served
        // the WAITING lines ("it's just sitting there. Waiting on you.")
        // after the table was gone. The pool follows the kind, not the
        // stale flag.
        pool = [
          '"You walked out of the light and came back breathing. Did it work? Is it done?"',
          '"The light\'s gone. The sky\'s just sky again. Tell me it meant something."',
        ];
      } else {
        pool = [
          '"The table\'s here. The ring — the light — it\'s just sitting there. Waiting on you."',
          '"Nobody\'s sleeping. The sky is waiting and nobody knows what to do with their hands. What are you going to tell it?"',
          '"Did you see their faces? Too many angles. I keep wondering what they want from us."',
        ];
      }
      const line = pool[Math.floor(Math.random() * pool.length)];
      return { line: this.voiceLine(vid, line), thread: 'table' };
    },

    convoThreadHasMore(vid) {
      const c = this.convoGet(vid);
      const cg = (this.data.characterGen || {}).convo || {};
      const t = c.thread;
      // TOPIC PACK (Steve 2026-10-06): generated topics track their own depth.
      if (this.topic2Has && this.topic2Has(t)) return this.topic2HasMore(vid);
      if (t === 'goal') {
        const goal = this.npcGoal(vid);
        const lines = (cg.goalFollow || {})[goal] || [];
        const said = c.said.goaldeep || [];
        return said.length < lines.length;
      }
      if (t === 'past') {
        // A deflected past is a closed door, not a thread: "Tell me more."
        // must not pry it open with pastFollow beats. Other topics stay open.
        if (c.pastDeflected) return false;
        const said = c.said.pastdeep || [];
        return said.length < (cg.pastFollow || []).length;
      }
      if (t === 'plans') {
        const said = c.said.plansdeep || [];
        return said.length < (cg.plansFollow || []).length;
      }
      return false;
    },

    // convoGossipBeat: one gossip beat from the gossip engine, captured
    // into a speakable line. Shared by the ask:gossip topic and by thread
    // resumptions/follow-ups (convoThreadBeat). Returns { line, sig } — the
    // raw line (may be '' when the engine said nothing; the caller voices)
    // and the gossip entry signature (null when the engine honestly declined
    // or the beat wasn't an entry). Callers record sigs on the conversation
    // and pass them back as skipSigs so a repeated "tell me more" walks the
    // pool (walk-down, landing r28) instead of re-serving the same rumor.
    // The gossip engine always speaks at least its honest dry admission
    // ("Quiet lately. Too quiet, maybe."), so a resume beat is never a lie.
    convoGossipBeat(vid, skipSigs) {
      // THE SOCIALITE'S VERB: "heard anything about anyone?" The gossip
      // engine lives in askAbout (game.js) and says its beats directly —
      // capture them so the conversation flow can display the line.
      // (askedTopics already gates this to once per conversation.)
      const said = [];
      const origSay = this.say;
      this.say = (t) => { said.push(String(t)); };
      let res = null;
      try { res = this.askAbout(vid, 'gossip', { inConvo: true, skipSigs: skipSigs || [] }); }
      catch (e) { console.warn('[conversation] gossip beat', e); }
      finally { this.say = origSay; }
      // QUOTE HYGIENE (fix 2026-10-07): askAbout formats beats as
      // `Name: "line"` (or `Name lowers their voice. "..."`) for the
      // person-card path (app.js), which renders them raw. This path
      // re-wraps via voiceLine/sayLine, which adds the name itself — strip
      // the attribution so it doesn't double
      // (`Jamal: "Jamal: "Nothing new.""`). Journal toasts (📓) and doubt
      // beats (❓, e.g. checkGossipClaim's identity-doubt narration) captured
      // mid-ask are re-emitted outside the spoken line so they don't
      // pollute it. Socialite playtest 2026-10-07. (Journey landing r9
      // 2026-10-13: the ❓ beats used to leak INTO the spoken line — the
      // NPC would "say" the player's own doubt narration.)
      let line;
      try {
        const asides = said.filter(t => /^\s*(📓|❓)/.test(t));
        const beats = said.filter(t => !/^\s*(📓|❓)/.test(t));
        for (const a of asides) { try { this.say(a); } catch (e) { console.warn('[conversation] gossip beat', e); } }
        line = beats.join(' ');
        const nm = String(this.displayName(vid) || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (nm) {
          line = line.replace(new RegExp('^' + nm + ':\\s*'), '')
                     .replace(new RegExp('^' + nm + '\\s+lowers their voice\\.\\s*'), '');
        }
      } catch (e) { line = said.join(' '); }
      return { line, sig: (res && res.gossipSig) || null };
    },

    convoThreadBeat(vid) {
      // The next beat in the current thread, or null when it's honestly done.
      const c = this.convoGet(vid);
      const cg = (this.data.characterGen || {}).convo || {};
      const vp = this.vpOf(vid);
      const t = c.thread;
      let l = null;
      if (t === 'goal') {
        const goal = this.npcGoal(vid);
        l = this.convoPick(vid, 'goaldeep', (cg.goalFollow || {})[goal] || []);
      } else if (t === 'past') {
        l = this.convoPick(vid, 'pastdeep', cg.pastFollow || []);
      } else if (t === 'plans') {
        l = this.convoPick(vid, 'plansdeep', cg.plansFollow || []);
      }
      // VILLAGE THREAD (journey-landing r42 2026-10-23): same fizzle class
      // as the request thread — the village topic plants thread='village'
      // with real follow-up content (the regenerated state line walks to
      // the idle-variant pool on repeat), but convoThreadBeat had no
      // branch, so "tell me more" fell to the dry admission. Serve the
      // next village line via the shared generator.
      else if (t === 'village') {
        try {
          l = this.convoVillageLine(vid);
        } catch (e) { l = null; }
      }
      // PERSONAL THREAD (journey-landing r42 2026-10-23): the personal
      // topic's talkLines pool was equally unserved. Same shape as the
      // goal/past/plans branches; voiced here like the topic path (the
      // tail only slot-fills).
      else if (t === 'personal') {
        try {
          const vp2 = this.vpOf(vid) || {};
          const talkLines = vp2.talk || [];
          const pl = talkLines.length ? this.convoPick(vid, 'personal', this.voicePool(vid, talkLines)) : null;
          l = pl ? this.voiceLine(vid, pl) : null;
        } catch (e) { l = null; }
      }
      // WANT THREAD (dialog-ui-fix 2026-10-11, defect 8): "tell me more" on a
      // want-driven conversation must deliver the want's content — not fizzle
      // to "that's all of it." The want def owns the concrete beat (the news,
      // the favor, the warning); the thread draws from it. If the beat was
      // already spoken, sayLine's ledger blocks the repeat and the caller
      // falls through to the honest dry admission — which is correct, the
      // content WAS delivered.
      else if (t === 'want') {
        try {
          const w = c.want;
          if (w && w.def && typeof w.def.engageBeat === 'function') {
            l = w.def.engageBeat.call(this, vid);
          }
        } catch (e) { l = null; }
      }
      // REQUEST THREAD (journey-landing r42 2026-10-23): a talk-request
      // opener sets thread='request' — a want-driven one-shot, never a
      // planted thread (convoThreadOpen refuses it by design). The request
      // opener pre-empts the want opener ("THEY asked to talk — their
      // reason leads"), so "tell me more" on it must deliver the want's
      // DEFERRED opener content — not fizzle to the dry admission with the
      // NPC's reason for coming to talk still unstated (seed 505 Nora:
      // curious want, "I'm listening" -> "That's... pretty much all of it,
      // honestly.", want stranded at stage 0, resolution 'unestablished').
      // Mirrors the plain want-opener flow (convoWantOpener provisional +
      // convoAcceptWantQuestion + ledger check + onSurfaced); the thread
      // flips to 'want' so the deferred want now drives. Falls back to the
      // defect-8 engageBeat contract, then null (honest dry admission).
      else if (t === 'request') {
        try {
          const w = c.want;
          if (w && w.def && typeof w.def.opener === 'function' &&
              typeof this.convoWantOpener === 'function') {
            const opener = this.convoWantOpener(vid, w);
            if (opener && opener.line) {
              const wline = this.voiceLine(vid, opener.line);
              if (!this.convoWouldBlock(vid, wline)) {
                if (opener.question && typeof this.convoAcceptWantQuestion === 'function') {
                  this.convoAcceptWantQuestion(vid, opener);
                }
                if ((w.stage || 0) < 1) w.stage = 1; // surfaced, deferred
                try { if (w.def.onSurfaced) w.def.onSurfaced.call(this, vid); }
                catch (e) { console.warn('[convo] request-thread onSurfaced', e); }
                l = wline;
                c.thread = 'want'; // the deferred want now drives the thread
              }
            }
          }
          if (!l && w && w.def && typeof w.def.engageBeat === 'function') {
            l = w.def.engageBeat.call(this, vid);
          }
        } catch (e) { l = null; }
      }
      // GOSSIP THREAD (journey-social r28 2026-10-19): resuming an open
      // gossip thread (or a follow-up on it) must deliver the gossip
      // engine's next beat — the old fall-through returned null and the
      // resume stalled: generic echo, then winddown with no content
      // (transcript-verified r27, Christian d34). The engine honestly
      // declines when the pool is dry ("Quiet lately. Too quiet, maybe."),
      // so the beat is content, never a lie.
      // WALK-DOWN (landing r28 2026-10-19): the salience-first engine
      // re-served the same rumor on every follow-up (Rafael d11: "Victor
      // just walked away from Haven" three times in one sitting). Served
      // sigs accumulate on the conversation and pass back as skipSigs, so
      // "tell me more" walks older gossip instead of repeating.
      else if (t === 'gossip') {
        const skip = c.gossipServedSigs || [];
        const beat = this.convoGossipBeat(vid, skip) || {};
        if (beat.sig) c.gossipServedSigs = skip.concat([beat.sig]);
        l = this.voiceLine(vid, beat.line) || null;
      }
      // TOPIC PACK (Steve 2026-10-06): generated topic beats.
      else if (this.topic2Has && this.topic2Has(t)) l = this.topic2Beat(vid);
      if (!l) return null;
      c.depth++;
      // A landed beat re-opens the conversation — the consecutive dead-react
      // count restarts (wind-down fix, Steve 2026-10-08).
      c.reactDryCount = 0;
      return this.fillTalkLine(l, vp);
    },

    // convoVillageLine(vid): the current "how's the village" line, generated
    // from live village state with temperament-specific idle fallback.
    // Extracted (journey-landing r42 2026-10-23) from convoAskTopic so the
    // 'village' thread's "tell me more" follow-up serves the next line instead
    // of fizzling to the dry admission — same root cause as the request
    // thread (convoThreadBeat served goal/past/plans/want/gossip but not
    // village). Repeat calls walk the idle-variant pool, never verbatim.
    convoVillageLine(vid) {
      const c = this.convoGet(vid);
      const vp = this.vpOf(vid) || {};
      const vg = this.state.village;
      const bits = [];
      if ((vg.grief || 0) > 0) bits.push("everyone's quiet since the loss");
      if ((vg.cheer || 0) > 0) bits.push('people are in good spirits');
      const hungry = (vg.roster || []).filter(id => id !== this.villagerId && (this.npcNeeds(id).hunger || 0) > 70).length;
      if (hungry > 2) bits.push(hungry + ' people are going hungry');
      const scared = (vg.roster || []).filter(id => id !== this.villagerId && (this.npcNeeds(id).fear || 0) > 70).length;
      if (scared > 2) bits.push('people are scared');
      const heat = Object.values(vg.heat || {}).filter(h => h > 0).length;
      if (heat) bits.push("there's tension about who's in charge");
      // TEMPERAMENT-SPECIFIC (Steve 2026-10-05): the same generic pool made
      // every villager sound identical ("better than yesterday" x3). Now the
      // idle lines reflect who's talking.
      const temp = ((vp.personality || {}).temperament || 'steady').toLowerCase();
      const idleByTemp = {
        bold: [
          'holding. Because we hold — that\'s the job.',
          'fine. We decide it\'s fine, then we make it true.',
          'better than it looks. I refuse to read it any other way.',
        ],
        cautious: [
          '...okay, I think. Nothing\'s broken that I can see.',
          'stable, probably. I\'m watching for the crack.',
          'alright. For now. I keep checking.',
        ],
        warm: [
          'holding together, somehow. People are good, you know?',
          'tired, but nobody\'s giving up. That counts for a lot.',
          'we\'re alright. We look out for each other.',
        ],
        prickly: [
          'fine. Nobody died. High bar, cleared.',
          'whatever "okay" means out here. We\'re it.',
          'people are people. Still here.',
        ],
        steady: [
          'quiet. People keeping to themselves, mostly.',
          'stable. No crises today, which is its own kind of good.',
          'same as yesterday. I\'ll take boring.',
        ],
        restless: [
          'everyone\'s itchy. Too much sitting, not enough doing.',
          'fine, I guess. I need to move, though. You?',
          'okay. But okay feels like waiting for something.',
        ],
        dry: [
          'oh, thriving. Absolutely thriving. (We are not.)',
          'fine, in the technical sense.',
          'nobody\'s on fire. Today.',
        ],
        gentle: [
          'we\'re... okay. Being gentle with each other, mostly.',
          'tired, but kind. That\'s something.',
          'holding each other up. Quietly.',
        ],
        intense: [
          'everyone\'s awake now. Good. Awake is alive.',
          'focused. Finally. Fear sharpens.',
          'we\'re here. That\'s not nothing — that\'s everything.',
        ],
        withdrawn: [
          '...fine. I think. Haven\'t really... yeah. Fine.',
          'quiet. I like quiet. Mostly.',
          'okay. Don\'t ask me for details.',
        ],
      };
      const idlePool = idleByTemp[temp] || idleByTemp.steady;
      const line = bits.length ? bits.join('; ') + '.' : this.convoPickCycle(vid, 'villageidle', idlePool);
      // Repeat-check on the raw line — voiceLine is probabilistic, so the
      // voiced output can't be the dedupe key.
      const rawLine = '"Honestly? ' + line + '"';
      // Village news can repeat when nothing changed — say it differently.
      c.said.villagelines = c.said.villagelines || [];
      if (c.said.villagelines.indexOf(rawLine) !== -1) {
        c.thread = 'village'; c.depth = 1;
        return this.voiceLine(vid, '"Honestly? ' + this.convoPickCycle(vid, 'villageidle', [
          'same as before, mostly.',
          'no big changes. That\'s good news, out here.',
          'still standing. Ask me tomorrow.',
        ]) + '"');
      }
      c.said.villagelines.push(rawLine);
      c.thread = 'village'; c.depth = 1;
      return this.voiceLine(vid, rawLine);
    },

    convoAskTopic(vid, topic) {
      // Ask about something specific. Threads develop; pools never repeat.
      // One topic per conversation — re-asking gets an honest deflection.
      const c = this.convoGet(vid);
      const cg = (this.data.characterGen || {}).convo || {};
      const exh = () => this.convoPickCycle(vid, 'exh', cg.exhausted || ['"I\'ve told you everything I know about that."']);
      c.askedTopics = c.askedTopics || [];
      if (c.askedTopics.indexOf(topic) !== -1) return exh();
      c.askedTopics.push(topic);
      const vp = this.vpOf(vid);
      if (topic === 'personal') {
        // PERSONAL: the villager's own talk lines — generated from their
        // personality, occupation, backstory. These are the lines that make
        // them a person, not a template. (Steve 2026-10-05: wire up dead data)
        const talkLines = vp.talk || [];
        if (talkLines.length) {
          const l = this.convoPick(vid, 'personal', this.voicePool(vid, talkLines));
          c.thread = 'personal'; c.depth = 1;
          return l ? this.voiceLine(vid, this.fillTalkLine(l, vp)) : exh();
        }
        // Fallback if no personal lines (background survivors)
        return exh();
      }
      if (topic === 'goal') {
        const goal = this.npcGoal(vid);
        const goalDef = (this.data.characterGen.goals || []).find(g => g.id === goal);
        const l = this.convoPick(vid, 'goal', this.convoGoalLines(goal, goalDef));
        this.state.village.goalsKnown = this.state.village.goalsKnown || {};
        this.state.village.goalsKnown[vid] = goal;
        this.remember(vid, 'shared_goal', goal || 'unknown');
        c.thread = 'goal'; c.depth = 1;
        return l ? this.voiceLine(vid, this.fillTalkLine(l, vp)) : exh();
      }
      if (topic === 'past') {
        // DEFLECTORS don't do "before". Withdrawn/prickly people with low
        // trust shut it down — that's a real conversation, not a dead end.
        const temp = this.npcTemper(vid);
        const trust = (this.state.village.trust || {})[vid] || 10;
        if ((temp === 'withdrawn' || temp === 'prickly') && trust < 40 && Math.random() < 0.55) {
          c.thread = 'past'; c.depth = 1; c.pastDeflected = true;
          return this.convoPickCycle(vid, 'deflectpast', [
            '"Before doesn\'t matter anymore." A wall comes down.',
            '"I don\'t talk about before." Flat. Final.',
            '"Long story. Not a good one. Let\'s leave it there."',
          ]);
        }
        const all = this.data.characterGen.talkTemplates || [];
        // PREFER occupation answers for "what did you do" — origin-flavored
        // lines ("I'm from Chicago...") are non-sequiturs here. Only fall
        // back to origin lines if no occupation lines exist.
        // (matches {occ}, {an_occ}, {Occ} — 'occ}' is the common tail)
        const occPool = all.filter(s => s.indexOf('occ}') !== -1);
        const pool = occPool.length ? occPool : all.filter(s => s.indexOf('{origin}') !== -1);
        const l = this.convoPick(vid, 'past', this.voicePool(vid, pool.length ? pool : ['"Before? I was {an_occ}. Feels like someone else\'s life."']));
        c.thread = 'past'; c.depth = 1;
        return l ? this.voiceLine(vid, this.fillTalkLine(l, vp)) : exh();
      }
      if (topic === 'village') {
        return this.convoVillageLine(vid);
      }
      if (topic === 'plans') {
        const l = this.convoPick(vid, 'plansdeep', cg.plansFollow || []);
        c.thread = 'plans'; c.depth = 1;
        return l ? this.voiceLine(vid, this.fillTalkLine(l, vp)) : exh();
      }
      if (topic === 'gossip') {
        // THE SOCIALITE'S VERB: "heard anything about anyone?" The gossip
        // engine lives in askAbout (game.js); convoGossipBeat captures its
        // beats into a speakable line. (askedTopics already gates this to
        // once per conversation.) Record the served sig so follow-up
        // "tell me more" walks the pool instead of repeating (walk-down).
        const beat = this.convoGossipBeat(vid) || {};
        if (beat.sig) c.gossipServedSigs = (c.gossipServedSigs || []).concat([beat.sig]);
        c.thread = 'gossip'; c.depth = 1;
        return this.voiceLine(vid, beat.line) || exh();
      }
      if (topic === 'spread_rumor') {
        // THE DRAMA VERB: start a rumor about someone. Two-step: pick target, then rumor type.
        // The person you're talking to becomes the first hearer.
        const others = (this.state.village.roster || []).filter(id => 
          id !== vid && id !== this.villagerId);
        if (!others.length) return "There's no one to talk about.";
        c.thread = 'spread_rumor'; c.depth = 1;
        c.rumorTargets = others;
        // Return a line prompting target selection; the choices are built in convoChoices
        return `${this.displayName(vid)} leans in. "Oh? Who are we talking about?"`;
      }
      // TOPIC PACK (Steve 2026-10-06): generated identity/event topics delegate
      // to convoTopics.js. askedTopics was already pushed above.
      if (this.topic2Has && this.topic2Has(topic)) return this.topic2Ask(vid, topic);
      return null;
    },

    // playerVoice: WHO the player is this life. Steve's law (2026-10-06):
    // every player is a completely unique person, and not the same person
    // run to run. The player character is a full generated villager
    // (rosterChars[villagerId]) with temperament, occupation, age. Choice
    // labels draw from that identity: a gruff ex-soldier and a nervous
    // teenager do not "say" the same things.
    // voiceClass: blunt (bold/prickly/intense), soft (warm/gentle/cautious),
    // dry (dry), plain (steady/restless/withdrawn — the neutral register).
    // occTags: teachTags from the occupation def (medicinal, food) — a
    // medic asks about injuries the way a cook asks about hunger.
    playerVoice() {
      const rc = (this.state.village.rosterChars || {})[this.villagerId] || {};
      const temp = (rc.personality && rc.personality.temperament) || 'steady';
      const occName = rc.formerOccupation || '';
      const occDef = ((this.data || {}).characterGen || {}).occupations || [];
      const def = occDef.find(o => o.name === occName) || {};
      const voiceClass = { bold: 'blunt', prickly: 'blunt', intense: 'blunt',
        warm: 'soft', gentle: 'soft', cautious: 'soft', dry: 'dry' }[temp] || 'plain';
      // AGE (Steve 2026-10-06): a teenager and an elder with the same
      // temperament do not sound alike. Age is a voice dimension, not just
      // a stat. Bands are coarse on purpose — voice is about life stage,
      // not birthdays.
      const age = rc.age || 30;
      const ageBand = age <= 24 ? 'young' : age >= 55 ? 'elder' : 'adult';
      return { temp, voiceClass, occName, occTags: def.teachTags || [],
               age, ageBand, name: rc.name || null };
    },

    // convoVoicePool: shared selection for tier x voice labels. Occupation
    // flavor wins (a medic's check-in is about injuries), then age (a
    // teenager and an elder phrase the same question differently), then
    // temperament voice, then the relationship-tier default. Seeded per
    // person so your phrasing is stable — you sound like YOU, consistently.
    convoVoicePool(vid, def, seedKey) {
      const tier = this.convoVoiceTier(vid);
      const pv = this.playerVoice();
      let pool = null;
      if (def) {
        if (def.occ && pv.occTags.length) {
          for (const t of pv.occTags) { if (def.occ[t]) { pool = def.occ[t]; break; } }
        }
        if (!pool && def.age && pv.ageBand !== 'adult' && def.age[pv.ageBand]) pool = def.age[pv.ageBand];
        if (!pool && def.voice && def.voice[pv.voiceClass]) pool = def.voice[pv.voiceClass];
        if (!pool && def.tier) pool = def.tier[tier] || def.tier.new;
      }
      pool = pool || [seedKey];
      const h = this._hashStr ? this._hashStr(vid + ':' + seedKey + ':' + tier + ':' + pv.voiceClass + ':' + pv.ageBand) : 0;
      return pool[Math.abs(h) % pool.length];
    },

    // convoVoiceTier: the REGISTER the player speaks in to this villager.
    // Not a stat — a voice. Strangers are careful and a little formal;
    // friends are direct; close ones are blunt and warm. Choice labels
    // should sound like a person whose relationship has a history, not
    // a menu that never changes. Tier shifts as trust/conversations grow —
    // your voice changing is the point, not a bug.
    convoVoiceTier(vid) {
      // TRUST + TIME, not convo count (dialog rethink Phase 1, Steve
      // 2026-10-08): the count-bypasses are dead. You don't become close
      // by talking a lot on day one — intimacy needs trust AND time.
      const trust = (this.state.village.trust || {})[vid] || 10;
      const days = this.relDays(vid);
      if (trust >= 55 || days >= 14) return 'close';
      if (trust >= 30 || days >= 7) return 'warm';
      return 'new';
    },

    // convoLabel: topic prompts are NOT identical every time, and they're
    // not identical for every relationship. Each villager gets stable-per-
    // person phrasing (seeded by id hash) WITHIN their voice tier, so the
    // "paths" stop looking like paths and your voice deepens as trust grows.
    // You learn to talk to PEOPLE, not menus.
    convoLabel(vid, key) {
      const variants = {
        goal: {
          tier: {
            new: ['"What do you want? Out of all this."',
                  '"What are you hoping for, here?"'],
            warm: ['"What keeps you going?"',
                   '"What are you working toward — really?"'],
            close: ['"Tell me what you actually want. Not the polite version."',
                    '"If you could do anything tomorrow, what would it be?"'],
          },
          voice: {
            blunt: ['"What do you actually want?"', '"Endgame. What is it?"'],
            soft: ['"What are you hoping for? If you don\'t mind me asking."'],
            dry: ['"So. What\'s the dream?"'],
          },
          age: {
            young: ['"So like... what do you actually want? From all this?"',
                    '"What are you even hoping for? Honestly?"'],
            elder: ['"Tell me what you want, child. I\'ve heard enough wants to know the real ones."',
                    '"What are you hoping for? At my age, hope is a plan."'],
          },
        },
        past: {
          tier: {
            new: ['"What did you do — before?"',
                  '"Mind if I ask what your life was, before?"'],
            warm: ['"What was your life, before?"',
                   '"You\'ve never said what you did before all this."'],
            close: ['"Tell me about before. The real version."',
                    '"What do you miss most, from before?"'],
          },
          voice: {
            blunt: ['"What were you, before?"', '"Before all this — what?"'],
            soft: ['"Do you mind talking about before?"', '"What was your life like? Before, I mean."'],
            dry: ['"What did you used to be?"'],
          },
          age: {
            young: ['"What did you do before? Like, as a job?"',
                    '"Were you in school, or...?"'],
            elder: ['"What was your trade, back in the world?"',
                    '"Tell me about your life. I\'ve got time."'],
          },
        },
        village: {
          tier: {
            new: ['"How\'s everyone holding up?"',
                  '"How are people doing?"'],
            warm: ['"What\'s the feeling around the fire lately?"',
                   '"Who\'s struggling that I haven\'t noticed?"'],
            close: ['"Be honest — how bad is it, really?"',
                    '"Who do I need to check on?"'],
          },
          occ: {
            medicinal: ['"Anyone hurt? Who needs looking at?"', '"How are the injured doing?"'],
            food: ['"Is anyone going hungry?"', '"How\'s the food holding out — honestly?"'],
          },
          voice: {
            blunt: ['"Everyone still breathing?"', '"Who\'s falling apart?"'],
            soft: ['"Is everyone alright? Really alright?"'],
            dry: ['"How\'s morale? Or shouldn\'t I ask."'],
          },
          age: {
            young: ['"Is everyone okay? Like, actually okay?"',
                    '"How\'s everyone doing? For real?"'],
            elder: ['"How are the young ones holding up?"',
                    '"Is everyone managing? Tell me true."'],
          },
        },
        plans: {
          tier: {
            new: ['"What\'s your plan for tomorrow?"',
                  '"Thought about what\'s next?"'],
            warm: ['"Any plans, or just getting through?"',
                   '"What are you thinking for tomorrow?"'],
            close: ['"So what\'s the move tomorrow?"',
                    '"What do you need tomorrow to look like?"'],
          },
          voice: {
            blunt: ['"Tomorrow. What\'s the plan?"'],
            soft: ['"Have you thought about tomorrow at all?"'],
            dry: ['"What\'s the plan, then?"'],
          },
          age: {
            young: ['"So what are we doing tomorrow?"',
                    '"Any plan for tomorrow, or are we winging it?"'],
            elder: ['"What\'s the plan for tomorrow? And the day after — I think in weeks now."',
                    '"Tomorrow, then. What does it need to look like?"'],
          },
        },
        gossip: {
          tier: {
            new: ['"Heard anything about anyone?"',
                  '"What\'s the word around the fire?"'],
            warm: ['"Anyone saying anything interesting?"',
                   '"What are people saying when they think I\'m not listening?"'],
            close: ['"Give me the real gossip. All of it."',
                    '"What aren\'t people saying out loud?"'],
          },
          voice: {
            blunt: ['"What are people saying?"'],
            soft: ['"Has anyone told you anything — about anyone?"'],
            dry: ['"Any good gossip? I\'m bored."'],
          },
          age: {
            young: ['"Heard anything good? About anyone?"',
                    '"What\'s everyone saying? Give me everything."'],
            elder: ['"What are people saying? I hear less than I used to."',
                    '"Any news around the fire? My ears aren\'t what they were."'],
          },
        },
      };
      const def = variants[key] || null;
      // Unknown topic keys fall through to the action-voice system
      // ('personal' lives there) rather than echoing a raw key.
      if (!def) return this.convoActionLabel(vid, key);
      return this.convoVoicePool(vid, def, 'ask:' + key);
    },

    // convoMoreLabel: continuers that fit the moment. A continuer should
    // sound like a response to WHAT THEY JUST SAID — not a button.
    // Gentle when they're grieving or scared; eager when they trail off
    // mid-story; per-thread otherwise. Stable per person within context.
    convoMoreLabel(vid) {
      const c = this.convoGet(vid);
      // TOPIC PACK (Steve 2026-10-06): generated topics have their own more-labels.
      if (this.topic2Has && this.topic2Has(c.thread || '')) return this.topic2MoreLabel(vid);
      const thread = c.thread || 'small';
      const mood = (this.npcMood && this.npcMood(vid)) || '';
      const themLines = (c.transcript || []).filter(e => e.who === 'them');
      const last = themLines.length ? String(themLines[themLines.length - 1].text || '') : '';
      const trailsOff = /(\.\.\.|—|…)\s*"?$/.test(last);
      const askedYou = /\?\s*"?$/.test(last);
      let pool;
      if (mood === 'grieving' || mood === 'scared') {
        pool = ['"Take your time."', '"I\'m here. Go on."', '"You don\'t have to say it all at once."'];
      } else if (trailsOff) {
        pool = ['"What? What were you going to say?"', '"And then?"', '"Don\'t stop there —"'];
      } else if (askedYou) {
        pool = ['"Hm. Let me think — go on, first."', '"Good question. What do YOU think?"'];
      } else {
        const variants = {
          past: ['"What happened next?"', '"Go on — what was it like?"', '"Then what?"'],
          goal: ['"Say more about that."', '"What would that look like?"', '"How would that even work?"'],
          plans: ['"And after that?"', '"What\'s the first step?"', '"How do you start?"'],
          village: ['"Who else?"', '"How bad is it, really?"', '"What aren\'t you telling me?"'],
          gossip: ['"Whoa — go on."', '"What else did you hear?"', '"Who told you that?"'],
          personal: ['"Go on."', '"I\'m listening."', '"What else?"'],
          small: ['"Go on."', '"I\'m listening."', '"Yeah?"'],
        };
        // Your voice colors even the continuer: a blunt person says "And?",
        // a soft one says "Please, go on." Same moment, different person.
        // Age colors it too: a teenager says "Wait, what?", an elder says
        // "Take your time, I've got nowhere to be." Life stage is audible
        // even in two words.
        const pv = this.playerVoice();
        const ageMore = { young: ['"Wait, what? Go on —"',
                                  '"Hold on, back up. Then what?"'],
                          elder: ['"Go on. I\'m listening."',
                                  '"Take your time. I\'ve got nowhere to be."'] }[pv.ageBand];
        const voiceMore = { blunt: ['"And?"', '"Keep going."'],
                            soft: ['"Please, go on."', '"I\'m listening, I promise."'],
                            dry: ['"Do go on."'] }[pv.voiceClass];
        pool = ageMore || voiceMore || variants[thread] || variants.small;
      }
      const pv = this.playerVoice();
      const h = this._hashStr ? this._hashStr(vid + ':more:' + thread + ':' + pv.voiceClass + ':' + pool.length) : 0;
      return pool[Math.abs(h) % pool.length];
    },

    // convoActionLabel: the player's ACTION lines (offer help, trade,
    // teach, theorize, change subject, start a rumor...). Same principle:
    // voiced per relationship tier, stable per person. Things a person
    // would actually say out loud.
    convoActionLabel(vid, key) {
      const variants = {
        personal: {
          tier: {
            new: ['"I realize I don\'t actually know you. Who are you?"',
                  '"So \u2014 who are you, when nobody\'s watching?"'],
            warm: ['"Tell me about yourself \u2014 the parts you don\'t tell everyone."',
                   '"I want to know you better. The real you."'],
            close: ['"Talk to me. The real stuff."',
                    '"You never really told me your story."'],
          },
          voice: {
            blunt: ['"Who are you, then?"', '"Your story. Go."'],
            soft: ['"I\'d like to know you better, if that\'s alright."'],
            dry: ['"So what\'s your deal?"'],
          },
          age: {
            young: ['"So... who are you? Like, really?"',
                    '"I don\'t even know your story. Tell me?"'],
            elder: ['"Tell me who you are, child. The whole of it."',
                    '"I\'d like to know you. Properly, this time."'],
          },
        },
        spread_rumor: {
          tier: {
            new: ['"Can I tell you something? About someone..."',
                  '"Between you and me \u2014 have you heard about...?"'],
            warm: ['"I heard something. About someone here."',
                   '"Can you keep a secret? It\'s about someone."'],
            close: ['"You\'ll want to hear this. It\'s about someone."',
                    '"Between us \u2014 I heard something about someone."'],
          },
          voice: {
            blunt: ['"Heard about someone. You\'ll want to know."'],
            dry: ['"I have gossip. Good gossip."'],
          },
        },
        theorize: {
          tier: {
            new: ['"What do you think is actually going on here?"',
                  '"Seriously \u2014 what do you make of all this?"'],
            warm: ['"You ever wonder what this is all for?"',
                   '"What\'s your theory? The real one."'],
            close: ['"Okay, real talk \u2014 what IS this?"',
                    '"You and me, honestly: what do you think is happening?"'],
          },
          voice: {
            blunt: ['"What\'s your read on all this?"'],
            soft: ['"What do you think it all means? I keep wondering."'],
            dry: ['"Any theories? I\'m collecting."'],
          },
          age: {
            young: ['"Okay but like... what IS all this? Seriously?"',
                    '"Do you have any idea what\'s happening? Any at all?"'],
            elder: ['"I\'ve seen a lot, but nothing like this. What do you make of it?"',
                    '"In all my years, never. What do you think it is?"'],
          },
        },
        offer_help: {
          tier: {
            new: ['"I could help with that."',
                  '"If you need help, I\'m here."'],
            warm: ['"Let me help. I mean it."',
                   '"What if I helped with that?"'],
            close: ['"I\'ve got you. We\'ll figure it out."',
                    '"Say the word and I\'m in."'],
          },
          occ: {
            medicinal: ['"I might be able to help \u2014 it\'s what I did."', '"Let me help. I know bodies."'],
            food: ['"I can help with that \u2014 feeding people is what I do."'],
          },
          voice: {
            blunt: ['"Point me at the problem."'],
            soft: ['"Can I help? Please \u2014 let me."'],
            dry: ['"I could be useful, if you want."'],
          },
          age: {
            young: ['"I can help! Like, actually, I can."',
                    '"Want help? I\'m pretty good at... stuff."'],
            elder: ['"Let an old hand help with that."',
                    '"I\'ve done this before. Let me."'],
          },
        },
        compare_maps: {
          tier: {
            new: ['"Can we compare maps? Show me where you\'ve been."',
                  '"I\'m trying to learn this ground. Where have you walked?"'],
            warm: ['"Let\'s compare maps — I want to see what you\'ve seen."',
                   '"Show me your ground. I\'ll show you mine."'],
            close: ['"Maps. Yours, mine, let\'s put them together."',
                    '"Walk me through where you\'ve been. All of it."'],
          },
          voice: {
            blunt: ['"Maps. Compare. Go."'],
            soft: ['"Would you mind — could we look at maps together?"'],
            dry: ['"Cartography time. You bring the landmarks."'],
          },
        },
        trade: {
          tier: {
            new: ['"You know things. I know things. Shall we trade?"'],
            warm: ['"I\'ll show you mine if you show me yours \u2014 knowledge, I mean."',
                   '"Trade you something I know for something you know?"'],
            close: ['"Let\'s trade what we know."',
                    '"Teach me something; I\'ll return the favor."'],
          },
          voice: {
            blunt: ['"Trade knowledge. You in?"'],
            dry: ['"Knowledge for knowledge. Fair trade."'],
          },
        },
        teach: {
          tier: {
            new: ['"Could I show you something?"',
                  '"Mind if I show you something I learned?"'],
            warm: ['"Let me show you something."',
                   '"Here \u2014 let me show you."'],
            close: ['"Come here, I want to show you this."',
                    '"Watch \u2014 this is useful."'],
          },
          occ: {
            medicinal: ['"Let me show you \u2014 I did this for a living."'],
            food: ['"Here, I know this one \u2014 let me show you."'],
          },
          voice: {
            blunt: ['"Watch. This matters."'],
            soft: ['"Can I show you something? It might help."'],
          },
        },
        subject: {
          tier: {
            new: ['"Can I ask you something else?"',
                  '"Actually \u2014 different question."'],
            warm: ['"Can we talk about something else a minute?"',
                   '"Changing the subject \u2014"'],
            close: ['"Different thing \u2014"', '"Okay, new subject:"'],
          },
          voice: {
            blunt: ['"Next subject."'],
            soft: ['"Can we \u2014 can we talk about something else?"'],
            dry: ['"Anyway \u2014"'],
          },
        },
        invite_party: {
          tier: {
            new: ['"Want to come with me?"'],
            warm: ['"Come with me. I could use you."',
                   '"I\'m heading out \u2014 come along?"'],
            close: ['"You\'re coming with me."',
                    '"I need you on this one. Come on."'],
          },
          voice: {
            blunt: ['"You\'re with me tomorrow."'],
            soft: ['"Would you come with me? I\'d feel better."'],
          },
        },
      };
      const def = variants[key] || null;
      if (!def) return key;
      return this.convoVoicePool(vid, def, 'act:' + key);
    },

    // convoBeatOf: what just happened, in one small record — so the NEXT
    // choice list can lead with on-thread options instead of a grab-bag.
    // (Steve 2026-10-06: conversation choices were non-sequitur soup.)
    convoBeatOf(choiceId, thread) {
      if (!choiceId) return null;
      if (choiceId.indexOf('ask:') === 0) return { kind: 'ask', id: choiceId.slice(4), thread };
      if (choiceId.indexOf('follow:') === 0) { const p = choiceId.split(':'); return { kind: 'follow', id: p[1], thread }; }
      if (choiceId === 'more') return { kind: 'more', id: thread, thread };
      if (choiceId === 'subject') return { kind: 'pivot', id: 'subject', thread: null };
      if (choiceId.indexOf('react:') === 0 || choiceId === 'agree' || choiceId === 'joke' || choiceId === 'silence') return { kind: 'react', id: choiceId, thread };
      if (choiceId === 'theorize') return { kind: 'theorize', id: thread, thread };
      if (choiceId === 'teach') return { kind: 'teach', id: null, thread };
      if (choiceId === 'speak_back') return { kind: 'speak', id: null, thread };
      return { kind: 'other', id: choiceId, thread };
    },

    // convoFollowups: the 2-3 things you'd actually say next on this topic.
    // Already-used follow-ups are skipped (tracked per topic per convo).
    convoFollowups(vid, topic) {
      const c = this.convoGet(vid);
      const pool = TOPIC_FOLLOWUPS[topic] || [];
      const used = ((c.followUsed || {})[topic]) || [];
      const out = [];
      for (let i = 0; i < pool.length && out.length < 3; i++) {
        if (used.indexOf(i) === -1) out.push({ id: 'follow:' + topic + ':' + i, label: pool[i] });
      }
      return out;
    },

    // convoSpeakBackChoice: the extracted speak-back offer — usable both in
    // the on-thread menu (with the follow-ups) and the opener menu below.
    convoSpeakBackChoice(vid, suppressPivot) {
      const c = this.convoGet(vid);
      if (c.speakBackDone || suppressPivot) return null;
      try {
        const nlang = this.npcNativeLang(vid);
        if (nlang && nlang !== 'english' && this.langExposure(nlang) >= 3 && this.translatorStage() < 2) {
          // THEY REMEMBER YOU TRYING (spoke_<lang> ledger read): a repeat
          // attempt is labeled as one — continuity, not amnesia.
          let tried = false;
          try {
            const mem = (((this.state.village || {}).memory || {})[vid]) || [];
            tried = mem.some(m => m && m.t === 'spoke_' + nlang);
          } catch (e) {}
          const lname = this.langDef(nlang).name;
          return { id: 'speak_back', label: tried ? `(try your ${lname} again)` : `(try your ${lname})` };
        }
      } catch (e) {}
      return null;
    },

    // Thin wrapper: the additive wrappers (betrayal.js, party-formal.js,
    // truth.js) wrap convoChoices; the single builder is buildMenu.
    // One budget after all live injectors; direct buildMenu callers use
    // the same pager. Overflow is navigation, never a discarded feature.
    convoMenuPage(vid, choices) {
      const c=this.convoGet(vid), seen=new Set();
      // Run after additive injectors too: one currently spoken question or
      // offer owns its answers. An unrelated action cannot enter that menu.
      let owns = null;
      if (c.thread === 'ambush') owns = id => /^(betrayal:run|betrayal:talk|betrayal:fight)$/.test(id);
      else if (c.windingDown || c.spokenBeat?.tag === 'closing') owns = id => id === 'leave' || id === 'silence';
      else if (c.spokenBeat?.tag === 'invitation' && this.pendingInvite?.(vid)) owns = id => /^betrayal:(accept|decline)$/.test(id) || id === 'leave' || id === 'silence';
      else if (c.pendingQ) owns = id => id.startsWith('ans:') || ['deflect_q','leave','silence'].includes(id);
      else if (c.reactiveQ) owns = id => id.startsWith('react:') || ['leave','silence'].includes(id);
      else if (c.genericQ) owns = id => id.startsWith('gq:') || ['leave','silence'].includes(id);
      else if (c.pendingTrade) owns = id => ['trade_yes','trade_no','leave','silence'].includes(id);
      else if (c.pendingHawk) owns = id => ['hawker_yes','hawker_no','leave','silence'].includes(id);
      else if (!c.choosingSubject && c.thread === 'want' && c.want?.stage > 0 && c.want.stage < 3 &&
          !['curious','share_news','just_company'].includes(c.want.id)) {
        owns = id => (id.startsWith('dlg:') && id !== 'dlg:invite') || ['goon','leave','silence'].includes(id);
      }
      if (owns) {
        choices = (choices || []).filter(ch => ch && owns(ch.id));
        if (c.thread !== 'ambush' && !choices.some(ch => ch.id === 'leave')) choices.push({ id: 'leave', label: '"I should go."' });
      } else if (c.spokenBeat?.tag !== 'invitation') {
        choices = (choices || []).filter(ch => !/^betrayal:(accept|decline)$/.test(ch.id));
      }
      const full=(choices || []).filter(ch=>ch && ch.id && ch.id!=='menu:more' && !seen.has(ch.id) && seen.add(ch.id));
      c.offeredReplies = Object.fromEntries(full.map(ch => [ch.id, ch.label]));
      if (full.some(ch=>/^(ans:|gq:)/.test(ch.id))) { c.menuPage=0;c.menuPages=1;return full; }
      const silent=full.filter(ch=>ch.id==='silence' || ch.id==='nv:listen').slice(0,1);
      const navigation=full.filter(ch=>['leave','subject','dlg:subject'].includes(ch.id));
      const content=full.filter(ch=>!silent.includes(ch) && !navigation.includes(ch));
      const rank=ch=>/^(betrayal:|confront:|agency:)/.test(ch.id)?0:
        /^(alive:|dlg:commit|dlg:cant|dlg:help|dlg:heed|dlg:stay)/.test(ch.id)?1:
        /^(ask:goal$|offer_help$)/.test(ch.id)?2:
        // R54 OTHERS RANK (journey-social r53 funnel fix): 'ask:others'
        // was rank 4 (default, sorts last), so a fresh 'others' in a long
        // menu paged to page 2+ almost always (~32% of r53 menu-problem
        // turns). It pages with the other social verbs now.
        /^(teach|trade|hawker|invite_party|dlg:invite|skill_learn:|skill_teach:|ask:gossip$|ask:spread_rumor$|ask:others$)/.test(ch.id)?3:4;
      if(content.length+navigation.length<=7){c.menuPage=0;c.menuPages=1;return full;}
      content.sort((a,b)=>rank(a)-rank(b));
      const size=Math.max(1,7-navigation.length-1),pages=Math.ceil(content.length/size);
      const page=Number.isSafeInteger(c.menuPage)&&c.menuPage>=0?c.menuPage%pages:0;
      c.menuPage=page;c.menuPages=pages;
      return content.slice(page*size,(page+1)*size).concat(
        {id:'menu:more',label:'More things to say ('+(page+1)+'/'+pages+')'},navigation,silent);
    },
    convoNextMenu(vid) {
      const c=this.convoGet(vid);
      if(!c.active || !(c.menuPages>1)) return {ignored:true,navigation:true,ended:!c.active,choices:c.active?this.convoChoices(vid):[],transcript:c.transcript.slice()};
      c.menuPage=((c.menuPage || 0)+1)%c.menuPages;
      return {navigation:true,ended:false,choices:this.convoChoices(vid),transcript:c.transcript.slice()};
    },
    convoChoices(vid) { return this.buildMenu(vid,true); },

    // ============ DISPOSITION (dialog rethink Phase 1, Steve 2026-10-08) ============
    // Principle 4: your character shapes your voice; your choices reshape it.
    // Axis: -3 (cruel) .. +3 (kind). Baseline from this life's temperament;
    // shifts with played moral choices (shiftDisposition). The menu reorders
    // by temper match; out-of-character picks cost more socially.
    playerDisposition() {
      const s = this.state.scholar || {};
      if (typeof s.disposition !== 'number') {
        let base = 0;
        try {
          const pv = this.playerVoice ? this.playerVoice() : null;
          const temp = pv && pv.temp;
          if (temp === 'warm' || temp === 'gentle') base = 2;
          else if (temp === 'cautious') base = 1;
          else if (temp === 'prickly' || temp === 'intense') base = -1;
        } catch (e) {}
        s.disposition = base;
      }
      return Math.max(-3, Math.min(3, s.disposition));
    },

    // Shift the moral trajectory. Called on kind/cruel conversational
    // choices. Small steps — you become who you act like, gradually.
    shiftDisposition(delta) {
      if (!delta) return;
      const s = this.state.scholar || {};
      const cur = this.playerDisposition();
      s.disposition = Math.max(-3, Math.min(3, cur + delta));
      // TABLE INPUT (coherence audit 2026-10-14; Steve: conversation style
      // counts toward the ending): only REAL movement on the axis counts, so
      // the clamp stops farming. Cruel → might (Feared), kind → protected (Beloved).
      const moved = s.disposition - cur;
      if (moved && this.ledgerAdd) this.ledgerAdd(moved < 0 ? 'might' : 'protected', Math.abs(moved));
    },

    // relDays: relationship age in days (for trust gating — the count
    // bypasses are dead; intimacy is trust-tier + time, per Steve 2026-10-08).
    relDays(vid) {
      try {
        const c = this.convoGet(vid);
        const day = (this.state.scholar || {}).day || 1;
        const first = c.firstDay || day;
        return Math.max(0, day - first);
      } catch (e) { return 0; }
    },

    // finalizeMenu: cross-cutting rules applied to every menu the single
    // builder produces (Principles 4, 5, 10, 12, 13).
    finalizeMenu(vid, choices) {
      const c = this.convoGet(vid);
      let out = (choices || []).slice();
      // 1. Room-fit (Principle 5): cruel options are suppressed vs close
      // friends (trust 35+) unless the player already escalated in-scene.
      // Hostility toward enemies/strangers is honest with teeth — it stays.
      // deflect_q is the legible rude dodge: always available, always costs.
      try {
        const trust = ((this.state.village || {}).trust || {})[vid] || 10;
        if (trust >= 35 && !c.escalated) {
          out = out.filter(ch => !ch || ch.id === 'deflect_q' || (ch.temper || 'neutral') !== 'cruel');
        }
      } catch (e) {}
      // 2. Disposition reorder (Principle 4): matching temper first among
      // content choices; structural options (leave/goon/subject) stay pinned.
      // Out-of-character options don't vanish — they sit last, and cost more
      // on use (see dispositionCostMult).
      try {
        const disp = this.playerDisposition();
        if (disp !== 0) {
          const pinned = new Set(['leave', 'goon', 'subject', 'dlg:subject']);
          const score = (ch) => {
            const t = (ch && ch.temper) || 'neutral';
            if (disp > 0) return t === 'kind' ? 0 : (t === 'neutral' || t === 'honest-hard') ? 1 : 2;
            return t === 'cruel' ? 0 : (t === 'neutral' || t === 'honest-hard') ? 1 : 2;
          };
          const content = [], rest = [];
          for (const ch of out) (pinned.has(ch && ch.id) ? rest : content).push(ch);
          content.sort((a, b) => score(a) - score(b));
          out = content.concat(rest);
        }
      } catch (e) {}
      // 3. Strangers aren't interrogated (NOT Principle 12): fresh
      // conversations gate confrontations and doubt-probes — you don't
      // interrogate a stranger. This is player-side hostility gating, NOT
      // the old want-emptiness rule: strangers still get full want depth
      // (Principle 12 overridden, convo rebuild 2026-10-11).
      try {
        const tier = this.convoVoiceTier ? this.convoVoiceTier(vid) : 'new';
        if (tier === 'new') {
          out = out.filter(ch => {
            const id = ch && ch.id;
            if (!id) return true;
            if (id.indexOf('confront:') === 0) return false;
            if (id === 'dlg:doubt') return false;
            return true;
          });
        }
      } catch (e) {}
      // 4. Silence on every menu (Principle 10): "..." via the existing
      // mood-silence machinery — one generic react per mood, never bespoke
      // branches (research: unchosen options are dialogue's priciest content).
      try {
        if (!out.some(ch => ch && (ch.id === 'silence' || ch.id === 'nv:listen'))) {
          out.push({ id: 'silence', label: '"..."', temper: 'neutral' });
        }
      } catch (e) {}
      // 5. SPENT CHOICES (journey-succession 2026-10-12): single-use
      // conversation verbs — resumed threads, named memories, asked events,
      // issued invitations — were re-offered forever in one sitting ("About
      // that question — we never finished." x4, "Want to come with me?"
      // pestering into a flip-flop). You don't repeat yourself within one
      // sitting. Handlers mark ids spent via convoSpendChoice; the ledger
      // stays honest across conversations (threads can resurface tomorrow).
      try {
        const spent = (c && c.spent) || {};
        if (Object.keys(spent).length) {
          out = out.filter(ch => !ch || !ch.id || !spent[ch.id]);
        }
      } catch (e) {}
      return out;
    },

    // dispositionCostMult: out-of-character picks cost more socially.
    // A kind player choosing cruelty (or vice versa) pays +1 on negative
    // trust/mood deltas — becoming someone new isn't free (Principle 4).
    dispositionCostMult(vid, temper) {
      try {
        const disp = this.playerDisposition();
        const t = temper || 'neutral';
        if (disp > 0 && t === 'cruel') return 2;
        if (disp < 0 && t === 'kind') return 2;
      } catch (e) {}
      return 1;
    },

    // markEscalated: the player chose a hard/cruel move in-scene — room-fit
    // suppression lifts for the rest of this conversation (Principle 5:
    // escalation, not ambush).
    markEscalated(vid) {
      try { this.convoGet(vid).escalated = true; } catch (e) {}
    },

    // ============ THE MENU BUILDER (dialog rethink Phase 1) ============
    // Game.buildMenu is the SINGLE place conversation menus are built.
    // Pipeline (§3.2 of the rethink): focused machineries first (narrowed),
    // then the beat matrix, then the topic-assembly fallback. finalizeMenu
    // applies the cross-cutting rules: disposition filter, stranger gating,
    // silence. Game.convoChoices is a thin wrapper (betrayal / party-formal /
    // truth wrap it additively — those wrappers are not part of the old
    // override chain and stay).
    buildMenu(vid, uncapped) {
      const c = this.convoGet(vid);
      queueTraderIntro(c);
      const menuKey = JSON.stringify([c.spokenBeat, c.thread, c.depth, c.choosingSubject, c.windingDown,
        c.pendingQ, c.reactiveQ, c.genericQ, c.pendingTrade, c.pendingHawk, c.heldBeats, c.spent,
        c.want?.id, c.want?.stage, c.want?.resolution, c.want?.favorExplained, this.state.scholar.day,
        this.state.village.trust?.[vid], c.escalated,
        this.convoFavorAction?.(vid, c.want?.favor || this.convoGetFavor?.(vid))]);
      if (c.replyMenu?.key === menuKey) {
        const menu = c.replyMenu.choices.map(ch => ({ ...ch }));
        c.offeredReplies = Object.fromEntries(menu.map(ch => [ch.id, ch.label]));
        return uncapped ? menu : this.convoMenuPage(vid, menu);
      }
      const finish=choices=>{const menu=this.finalizeMenu(vid,choices);
        // Keep the exact offered words; handlers must not invent another
        // question after the player has selected a reply.
        c.offeredReplies = Object.fromEntries(menu.map(ch => [ch.id, ch.label]));
        c.replyMenu = { key: menuKey, choices: menu.map(ch => ({ ...ch })) };
        return uncapped?menu:this.convoMenuPage(vid,menu);};
      if (c.windingDown || c.spokenBeat?.tag === 'closing') return finish([{ id: 'leave', label: '"See you."' }]);
      if (c.thread === 'want' && (c.want?.favor?.state === 'promised' ||
          (c.want?.favor?.waterRun && !c.want.favor.waterRun.returned)) && !c.choosingSubject &&
          !c.pendingQ && !c.reactiveQ && !c.genericQ) {
        return finish(this.convoFavorActionMenu(vid, c.want.favor, false).map(o => ({ id: o.id, label: o.labels[0], temper: o.temper })).concat([
          { id: 'dlg:subject', label: '"Can I ask you something else?"' },
          { id: 'leave', label: '"I should go."' },
        ]));
      }
      if (c.spokenBeat?.tag === 'endtopic' && !c.pendingQ && !c.reactiveQ && !c.genericQ && !c.choosingSubject) {
        const out = [{ id: 'dlg:subject', label: '"Can I ask you something else?"' }, { id: 'leave', label: '"I should go."' }];
        if (c.heldBeats?.length) out.unshift({ id: 'goon', label: this.convoGoonLabel(vid) });
        return finish(out);
      }
      // STICKY OPENED-UP (trust r7 2026-10-12): once they've opened up about
      // their goal (goal thread, depth 2+), that's a relationship fact, not
      // menu flicker — persist it on the convo record (survives talkTo's
      // per-conversation reset like answered/askedQs do). Set here at the
      // top because beat-menu early returns below would skip it. The old
      // code computed openedUp from live thread state inside the offer gate
      // (which needs !onThread, while leaving the thread clears thread and
      // depth) — a dead circular that made offer_help unreachable. Measured:
      // 0 promises in 36 long runs.
      if (c.thread === 'goal' && (c.depth || 0) >= 2) c.goalOpenedUp = true;
      const choices = [];
      // Answering their question comes first — it's rude to ignore it.
      if (c.pendingQ) {
        const region = (this.homeRegion || (this.state.scholar || {}).homeRegion) || 'far from here';
        // DEFENSIVE (socialite 2026-10-10): a pending question without an
        // answers array must not crash the choice builder — malformed beats
        // shouldn't kill the conversation UI (mirrors the || [] guard below).
        for (const a of (c.pendingQ.answers || [])) choices.push({ id: 'ans:' + c.pendingQ.id + ':' + a.id, label: String(a.label).replaceAll('{region}', region), temper: (a && a.temper) || 'neutral' });
        // HONEST OPT-OUT (Steve 2026-10-08, revised per his corrections):
        // every bespoke question guarantees "I'd rather not say." Honesty
        // is always AVAILABLE — but honest words have WEIGHT (Principle 3).
        // This is a boundary, not an attack: low consequence, gracefully
        // received. Data authors can supply a bespoke one flagged
        // honest_opt_out — the engine never double-adds.
        const hasHonestOptOut = (c.pendingQ.answers || []).some(a => a && a.honest_opt_out);
        if (!hasHonestOptOut) choices.push({ id: 'ans:' + c.pendingQ.id + ':honest_pass', label: '"I\'d rather not say."', temper: 'neutral' });
        // (change the subject) is the genuinely rude option now that an
        // honest opt-out exists — choosing it is a real choice to dodge,
        // so the trust cost is fair and the rudeness is legible.
        choices.push({ id: 'deflect_q', label: '(change the subject)', temper: 'cruel' });
        choices.push({ id: 'leave', label: '"I should go."', temper: 'neutral' });
        return finish( choices);
      }
      if (c.thread === 'nonverbal') {
        // (moved from the old :4384 IIFE replacement — now part of the
        // single pipeline)
        const out = [
          { id: 'nv:nod', label: '(nod slowly)' },
          { id: 'nv:smile', label: '(smile)' },
          { id: 'nv:pointself', label: '(point: you, them, together)' },
          { id: 'nv:listen', label: '(listen hard — catch words)' },
        ];
        const lang = c.nativeLang || this.npcNativeLang(vid);
        const yid = this.findInterpreter(vid, lang);
        c.interpreter = yid || null;
        if (yid) {
          const yn = this.firstRef(yid);
          out.push({ id: 'nv:translate', label: `(ask ${yn} to translate)` });
        }
        try {
          if (!c.speakBackDone && lang && lang !== 'english' &&
              this.langExposure(lang) >= 3 && this.translatorStage() < 2) {
            out.push({ id: 'speak_back', label: `(try your ${this.langDef(lang).name})` });
          }
        } catch (e) {}
        out.push({ id: 'leave', label: '(walk away)' });
        if ((c.heldBeats || []).length) out.unshift({ id: 'goon', label: this.convoGoonLabel(vid) });
        return finish( out);
      }
      // TRADE THREAD: focused. They've laid out terms; you decide.
      if (c.thread === 'trade' && c.pendingTrade) {
        return finish( [
          { id: 'trade_yes', label: '"Deal."' },
          { id: 'trade_no', label: '"Another time, maybe."' },
          { id: 'leave', label: '"I should go."' },
        ]);
      }
      // HAWKER THREAD: a villager's offer. Same shape as the trade thread.
      if (c.pendingHawk) {
        return finish( [
          { id: 'hawker_yes', label: '"Deal."' },
          { id: 'hawker_no', label: '"Not today."' },
          { id: 'leave', label: '"I should go."' },
        ]);
      }
      // CONTINUER (Steve 2026-10-05): one-beat turns. When the engine held
      // follow-on beats, the continuer leads the choices — voiced per
      // person, mood, and thread (convoMoreLabel), never a hardcoded
      // "Go on." (unique-person law, Steve 2026-10-06).
      if (c.thread !== 'nonverbal' && (c.heldBeats || []).length) {
        choices.unshift({ id: 'goon', label: this.convoGoonLabel(vid) });
      }
      // REACTIVE: they asked you something direct ("Did you see that?").
      // Answers come first — it's rude to ignore it. Pivots (teach/theorize)
      // are suppressed while the question hangs: you don't teach burdock
      // when someone asks if you saw something move by the tree line.
      const reactiveDef = c.reactiveQ ? REACTIVE_DEFS[c.reactiveQ.id] : null;
      if (reactiveDef) {
        for (const a of reactiveDef.answers) {
          choices.push({ id: 'react:' + c.reactiveQ.id + ':' + a.id, label: a.label });
        }
        // ASK/ANSWER CONTRACT (Phase 2): reactive questions get the honest
        // opt-out too — every question, no exceptions.
        choices.push({ id: 'react:' + c.reactiveQ.id + ':honest_pass', label: '"I\'d rather not say."', temper: 'neutral' });
      }
      // GENERIC-Q: a direct question with no bespoke def still deserves
      // answers first (Rule 4). Same narrowing as reactive: pivots wait.
      // One generic react rides along — nodding along is a valid answer
      // too, and a passive conversationalist is never stranded with no
      // valid move mid-question.
      const gqActive = c.genericQ && !reactiveDef && !c.pendingQ;
      const gqAnswers = gqActive ? this.convoGenericAnswers(vid, c.genericQ) : [];
      for (const a of gqAnswers) choices.push(a);
      // ASK/ANSWER CONTRACT (Phase 2): generic questions get the honest
      // opt-out too.
      if (gqActive) choices.push({ id: 'gq:' + c.genericQ.kind + ':honest_pass', label: '"I\'d rather not say."', temper: 'neutral' });
      if (gqActive) {
        const gr = [['agree', '"You\'re right."'], ['joke', '"Ha — yeah."'], ['silence', '"..."']];
        const pick = gr[Math.floor(Math.random() * gr.length)];
        choices.push({ id: pick[0], label: pick[1] });
      }
      // RUMOR THREAD: two-step — pick WHO, then WHAT. While the thread is
      // open the menu narrows to the steps, like the reactive narrowing
      // above. (Fix 2026-10-06: the thread used to dangle at "who are we
      // talking about?" with no follow-up choices — rumors could never be
      // started through conversation.)
      if (c.thread === 'spread_rumor' && !c.rumorDone && !reactiveDef && !gqActive && !c.pendingQ) {
        const rlist = [];
        if (!c.rumorTarget) {
          for (const tid of (c.rumorTargets || [])) {
            rlist.push({ id: 'rumor:tgt:' + tid, label: this.displayName(tid) });
          }
        } else {
          const tname = this.firstRef ? this.firstRef(c.rumorTarget) : this.displayName(c.rumorTarget);
          const types = [
            ['stingy', `"${tname}'s been holding back. Keeping the good stuff close."`],
            ['untrustworthy', `"Can't trust ${tname}. Watch your back around them."`],
            ['generous', `"${tname}'s been generous. Sharing around, no questions asked."`],
            ['scheming', `"${tname}'s scheming. Planning something — I can see it."`],
            ['coward', `"${tname} froze when it mattered. Coward."`],
          ];
          for (const [ty, label] of types) rlist.push({ id: 'rumor:type:' + ty, label });
        }
        rlist.push({ id: 'leave', label: '"Never mind."' });
        return finish( rlist);
      }
      const suppressPivot = !!c.reactiveQ || !!c.genericQ || c.thread === 'grief' || c.thread === 'cheer';
      // MAXC: the chat view has room for a real choice list. Topic asks
      // must never be starved by action buttons — Steve found deep topics
      // unreachable when discovery actions filled all 5 slots.
      // When a direct question hangs (reactive), the menu narrows to the
      // answers plus a couple conversational options — discovery actions
      // return next exchange, once the question is engaged. You don't get
      // the full menu mid-question; that's the coherence fix, not a bug.
      // (7: five topic asks can now be open at once — gossip joined them —
      // and discovery actions must still fit behind topics/theorize/observe.)
      const MAXC = reactiveDef ? reactiveDef.answers.length + 2 : gqActive ? gqAnswers.length + 3 : 7;
      // THREAD COHERENCE (Steve 2026-10-06): mid-topic-thread, the menu is
      // the thread — follow-ups lead, off-thread verbs wait behind the
      // subject-change. Computed once, used by invite_party below and the
      // topic assembly further down.
      const onThread = !c.choosingSubject && TOPIC_THREADS.indexOf(c.thread) !== -1;
      if (c.thread && this.convoThreadHasMore(vid)) choices.push({ id: 'more', label: this.convoMoreLabel(vid) });
      // DEPTH GATING: what they'll talk about depends on how well they know
      // you. Little hits over time, like real people. Defined once, used by
      // theorize and the topic asks below — and by the party-invite trust
      // check above it (moved up 2026-10-06: the invite block read effTrust
      // before its const declaration, a TDZ ReferenceError the try/catch
      // swallowed — invite_party silently never appeared).
      // - village, plans: always (safe small talk)
      // - past: trust 20+ or 2nd conversation
      // - goal: trust 35+ or 3rd conversation (what they really want)
      // - theorize: trust 25+ or 2nd conversation (thinking together is intimate)
      // DEFLECTORS offer fewer doors: withdrawn/prickly/restless people don't
      // volunteer every topic — you get two, and you earn the rest.
      const trustNow = (this.state.village.trust || {})[vid] || 10;
      // INTIMACY GATING (dialog rethink Phase 1, Steve 2026-10-08): the
      // convo-count bypasses are dead. Deep topics need trust-tier OR
      // relationship age (time) — never "talked N times today".
      const relAge = this.relDays(vid);
      // MOOD (convo-mood.js): warmth opens doors, tension closes them.
      // Effective trust for depth gates shifts with the conversation's
      // temperature (±15). A tense villager shuts doors (fewer topics);
      // a warm one volunteers more.
      const moodBandNow = typeof this.convoMoodBand === 'function' ? this.convoMoodBand(vid) : 'neutral';
      const effTrust = trustNow + (typeof this.convoMoodMod === 'function' ? this.convoMoodMod(vid) : 0);
      // PARTY INVITES live in conversation, not on a button. Discovered via
      // the System unlock. You ask people. Like a person.
      // Sits with 'more', AHEAD of the topic asks: a trust-earned, contextual
      // person-action must never be crowded out by small talk. When you've
      // earned the right to ask, the ask is there.
      // (Thread coherence: mid-thread it waits — one subject-change away.)
      if (!onThread && choices.length < MAXC) {
        try {
          if (this.state.systemArrived && this.partyUnlocked && this.partyUnlocked() &&
              !this.inParty(vid) && !this.partyFull()) {
            if (this.hasDiscovered('party') && effTrust >= 20) choices.push({ id: 'invite_party', label: this.convoActionLabel(vid, 'invite_party') });
          }
        } catch (e) {}
      }
      // TOPIC ASKS come first — the conversation itself. Discovery actions
      // (trade/teach/promise/invite) fill whatever slots remain; they never
      // crowd out the talk.
      const threadAsk = { goal: 'ask:goal', past: 'ask:past', village: 'ask:village', plans: 'ask:plans', gossip: 'ask:gossip', personal: 'ask:personal' }[c.thread];
      const asked = c.askedTopics || [];
      const tempNow = this.npcTemper(vid);
      const topicCap = (tempNow === 'withdrawn' || tempNow === 'prickly' || tempNow === 'restless') ? 2 : 5;
      // Tense conversations close down: one fewer door (min 1).
      const topicCapMood = moodBandNow === 'tense' ? Math.max(1, topicCap - 1) : topicCap;
      const pastOpen = effTrust >= 20 || relAge >= 5;
      const goalOpen = effTrust >= 35 || relAge >= 8;
      // GOSSIP ASK: the socialite's core verb. "Heard anything about anyone?"
      // The detective layer is ask-able, not just receive-only. Same intimacy
      // gate as theorize; sits with the other topic asks, never crowding out
      // discovery actions.
      const gossipOpen = effTrust >= 20 || relAge >= 5;
      const asks = [];
      // PERSONAL: their own words — the talk lines generated from personality.
      // Always available and prioritized; it's who they are, not what they know.
      if (asked.indexOf('personal') === -1) asks.push({ id: 'ask:personal', label: this.convoActionLabel(vid, 'personal') });
      // GOSSIP FIRST: the socialite's core verbs. They used to sit last in
      // the asks list, so the topic cap (5, or 2 for deflectors) starved
      // them on a fresh conversation — gossip and rumor-spreading were
      // unreachable until you'd exhausted every other topic. (socialite
      // playtest 2026-10-06)
      if (gossipOpen && asked.indexOf('gossip') === -1) asks.push({ id: 'ask:gossip', label: this.convoLabel(vid, 'gossip') });
      // SPREAD RUMOR (fix 2026-10-07): the player's drama verb was starved by
      // the topic cap — it sat 4th and never surfaced. Now it's 2nd, right
      // after gossip. If you have the rapport to gossip, you have the rapport
      // to start a rumor.
      if (gossipOpen && asked.indexOf('spread_rumor') === -1) asks.push({ id: 'ask:spread_rumor', label: this.convoActionLabel(vid, 'spread_rumor') });
      // INTERVIEW VERB (Steve 2026-10-07): ask:past is the detective's core
      // tool — it sat 5th behind the topic cap and was unreachable whenever
      // fresh topics existed. Now it rides right behind gossip; the interview
      // verbs are 2nd and 3rd, never starved.
      if (asked.indexOf('past') === -1 && pastOpen) asks.push({ id: 'ask:past', label: this.convoLabel(vid, 'past') });
      // PROMISE DISCOVERY HOOK (trust r7 2026-10-12): the goal thread is the
      // designed discovery path for promises ("the offer only surfaces when
      // they've really opened up, deep in their goal thread") — but
      // post-System goals are auto-known, so !goalKnown never held and the
      // thread became unreachable from the menu: offer_help (needs
      // hasDiscovered('promise') OR goal-thread depth 2, and the depth flag
      // was computed from live thread state that clears on exit — a dead
      // circular) could never be discovered. Measured: 0 goal-thread
      // openings and 0 promises across 170 conversations in a 200d
      // socialite run (seed 3) — the want system owns every opening, and
      // the menu path was dead. While the promise concept is undiscovered,
      // the goal stays askable and rides FIRST (a discovery action, not a
      // topic — it must not starve behind the topic cap). After the first
      // vow it behaves as before.
      const promiseHook = !this.hasDiscovered('promise') && asked.indexOf('goal') === -1 && goalOpen;
      if (promiseHook) {
        asks.unshift({ id: 'ask:goal', label: this.convoLabel(vid, 'goal') });
      } else if (!this.goalKnown(vid) && asked.indexOf('goal') === -1 && goalOpen) {
        asks.push({ id: 'ask:goal', label: this.convoLabel(vid, 'goal') });
      }
      if (asked.indexOf('village') === -1) asks.push({ id: 'ask:village', label: this.convoLabel(vid, 'village') });
      if (asked.indexOf('plans') === -1) asks.push({ id: 'ask:plans', label: this.convoLabel(vid, 'plans') });
      // TOPIC PACK (Steve 2026-10-06): fresh generated topics get first crack
      // at the topic budget — who this villager IS shouldn't wait behind small
      // talk forever. 'lately' always qualifies: live events cut the queue.
      // Once a generated topic's been discussed, it joins the rotation behind
      // the main asks. Shared budget — the cap never grows.
      // Split the generated topics into fresh vs already-discussed (used by
      // both the subject menu and the opener below).
      const t2said = (this.convoGet(vid).said || {});
      const t2list = this.topic2Asks ? this.topic2Asks(vid) : [];
      // (r51 re-offer: a changed 'others' is fresh; it must leave the
      // discussed list too, or the main menu would offer it twice.)
      const t2FreshFn = (tid) => (typeof this.t2topicFresh === 'function') ? this.t2topicFresh(vid, tid) : (tid === 'lately' || !(t2said['t2:' + tid] || []).length);
      const t2fresh = t2list.filter(a => t2FreshFn(a.id.slice(4)));
      const t2discussed = t2list.filter(a => { const tid = a.id.slice(4); return tid !== 'lately' && (t2said['t2:' + tid] || []).length && !t2FreshFn(tid); });
      const freshCap = topicCapMood <= 2 ? 1 : 2;

      // SUBJECT MENU (Steve 2026-10-06): after "can I ask you something
      // else?", the uncovered topics are listed plainly — the player picks,
      // no random jump. Choosing one clears choosingSubject (ask: handler).
      if (c.choosingSubject && !reactiveDef && !gqActive) {
        const sub = [];
        let n = 0;
        for (const a of t2fresh) {
          // R53 OTHERS EXEMPTION (journey-social r52 funnel fix): 'others'
          // is the village's social life surfacing (bonds, rifts, deeds),
          // not small talk — like the gossip verbs below, it rides past
          // the fresh cap instead of inside it. Still bounded by
          // topicCapMood, so the menu grows by at most one slot and the
          // exempt topic may displace one generic ask — the intended
          // tradeoff, judged by the r53 funnel metric.
          const othersExempt = a.id === 'ask:others';
          if (a.id === threadAsk || (!othersExempt && n >= freshCap) || n >= topicCapMood) continue;
          sub.push(a); n++;
        }
        for (const a of asks) {
          if (a.id === threadAsk || n >= topicCapMood) continue;
          sub.push(a); n++;
        }
        // R54 DISCUSSED-'OTHERS' RE-LIST (journey-social r53 funnel fix):
        // the subject menu never listed t2discussed, so a discussed-and-
        // unchanged 'others' (67.8% of r53 menu-problem turns) could never
        // surface — no freshCap-scoped fix can reach it. 'others' ONLY:
        // discussed topics generally stay behind by design, but 'others'
        // is dynamic (the pick recomputes; lines come through the
        // said-ledger, so a re-serving is never a verbatim repeat). It
        // rides after the capped topics, like the gossip verbs below —
        // never while it IS the current thread.
        if (c.thread !== 'others') {
          for (const a of t2discussed) {
            if (a.id === 'ask:others' && !sub.some(s => s.id === a.id)) sub.push(a);
          }
        }
        // Memories and unfinished business are deliberate topic choices,
        // not replies inserted over the NPC's current thought.
        if (this.convoWhatsAlive) for (const a of this.convoWhatsAlive(vid) || []) {
          if (!sub.some(ch => ch.id === a.id)) sub.push(a);
        }
        // GOSSIP VERBS (fix 2026-10-07): ask:gossip / ask:spread_rumor are
        // earned verbs, not intimacy-budget topics. The topic cap (2 for
        // deflectors) permanently starved them behind t2fresh + ask:personal
        // — prickly/withdrawn/restless villagers could NEVER be gossiped
        // with, contradicting the 2026-10-06 "GOSSIP FIRST, never starved"
        // intent. They ride after the capped topics once gossipOpen.
        for (const gid of ['ask:gossip', 'ask:spread_rumor']) {
          const g = asks.find(a => a.id === gid);
          if (g && g.id !== threadAsk && !sub.some(s => s.id === gid)) sub.push(g);
        }
        // PARTY INVITE survives the subject menu — the ask you came to make
        // is not small talk. (Fix 2026-10-07: the subject-menu early return
        // discarded `choices`, where invite_party already sat, so the
        // invite was unreachable after browsing topics.)
        const inv = choices.find(ch => ch.id === 'invite_party');
        if (inv) sub.push(inv);
        // TEACH (socialite fix 2026-10-08): "let me show you something" is a
        // subject too. Earned knowledge-sharing rides with the other earned
        // verbs — hiding it behind a topic pick would put the conversation
        // on-thread, where teach correctly waits, stranding the intent.
        try {
          const youKnow = Object.keys(this.state.codex.plants || {})
            .filter(k => this.plantKnown(k)); // L1+ only: a blind taste isn't teachable knowledge
          const theyKnow = this.plantsKnownBy ? this.plantsKnownBy(vid) : [];
          if (!suppressPivot && youKnow.some(pid => theyKnow.indexOf(pid) === -1) &&
              !sub.some(s => s.id === 'teach')) {
            sub.push({ id: 'teach', label: this.convoActionLabel(vid, 'teach') });
          }
        } catch (e) {}
        if (!suppressPivot && this.convoSkillChoices) {
          try { for (const ch of this.convoSkillChoices(vid)) if (!sub.some(s => s.id === ch.id)) sub.push(ch); } catch (e) { console.warn('[skill-teaching] subject menu', e); }
        }
        // Deliberate topic changes also expose earned practical verbs.
        // Focusing ordinary replies must not strand those features.
        if (this.goalKnown(vid) && !c.offeredHelp && !(this.state.village.promises || {})[vid] &&
            (this.hasDiscovered('promise') || c.goalOpenedUp)) sub.push({ id: 'offer_help', label: this.convoActionLabel(vid, 'offer_help') });
        if (this.isKnowledgeTrader?.(vid) && this.traderKnowledge(vid)?.length &&
            (this.hasDiscovered('trade') || c.traderMentioned)) sub.push({ id: 'trade', label: '"You know things. I know things. Shall we trade?"' });
        if (this.tradeSpirit?.(vid) >= 1) sub.push({ id: 'hawker', label: '"Got anything to trade?"' });
        if (effTrust >= 15 || relAge >= 3) sub.push({ id: 'compare_maps', label: this.convoActionLabel(vid, 'compare_maps') });
        if (this.observePerson && (relAge >= 4 || this.getDoubts?.(vid)?.length)) sub.push({ id: 'observe', label: '(watch them for a while)' });
        const mysteries = ['system','monsters','situation'].filter(t => !(c.theorized || []).includes(t) && (t !== 'system' || this.state.systemArrived));
        if ((effTrust >= 25 || relAge >= 6) && mysteries.length) sub.push({ id: 'theorize', label: this.convoActionLabel(vid, 'theorize') });
        sub.push({ id: 'leave', label: c.exchanges === 0 ? '"Actually — never mind."' : '"I should go."' }); // BREAK-IT (socialite 2026-10-08): 'Nice talking to you' lied on a zero-exchange menu — the player said nothing. An aborted approach says never mind.
        return finish( sub);
      }

      // WHAT'S ALIVE (dialog rethink Phase 2, Principle 8): the menu leads
      // with what's alive between you — open threads, fresh memories,
      // want-driven questions, world events — not the static pool. Placed
      // before the beat matrix so lived continuity outranks the topic pool.
      if (c.choosingSubject && !onThread && !suppressPivot && !reactiveDef && !gqActive) {
        try {
          const alive = (typeof this.convoWhatsAlive === 'function') ? this.convoWhatsAlive(vid) : [];
          let aliveAdded = 0;
          for (const a of alive) {
            if (choices.length >= MAXC || aliveAdded >= 3) break;
            if (choices.some(ch => ch && ch.id === a.id)) continue;
            choices.push(a); aliveAdded++;
          }
        } catch (e) {}
      }
      // BEAT MATRIX (dialog rethink Phase 1, Steve 2026-10-08): the live
      // beat+topic menu from convo-beats.js. Tried before the topic-assembly
      // fallback below; returns null when the fallback should run. This
      // replaces the old load-order override chain (convo-dialogue.js:427)
      // with an explicit call inside the single pipeline.
      // CONTRACT (Phase 2): a hanging direct question owns the menu — the
      // beat matrix must not override reactive/generic answers. Answering
      // comes first; it's rude to ignore it.
      if (reactiveDef || gqActive) {
        return finish( choices);
      }
      try {
        const beatMenu = typeof this.beatMenuResponses === 'function'
          ? this.beatMenuResponses(vid) : null;
        if (beatMenu) {
          // Alive items ride along: prepend them to the beat menu so the
          // conversation leads with what's alive, not just what's next.
          try {
            const alive = (typeof this.convoWhatsAlive === 'function') && c.choosingSubject && !onThread && !suppressPivot
              ? this.convoWhatsAlive(vid) : [];
            const pre = [];
            for (const a of (alive || [])) {
              if (pre.length >= 2) break;
              if (!beatMenu.some(ch => ch && ch.id === a.id)) pre.push(a);
            }
            // Preserve every offered choice for the final pager. The normal
            // convoChoices path caps after all injectors; direct buildMenu
            // callers use the same pager through finish(). Cutting the tail
            // here stranded subject changes, personal topics and promises.
            const full = pre.length ? pre.concat(beatMenu) : (beatMenu || []).slice();
            return finish( full);
          } catch (e) {}
          return finish( beatMenu);
        }
      } catch (e) {}

      // THREAD COHERENCE (Steve 2026-10-06): mid-thread, the menu IS the
      // thread. Follow-ups lead; other topics wait behind the explicit
      // subject-change; discovery actions return once the thread resolves.
      // A real conversation has a thread — changing the subject should feel
      // like changing the subject, not like the menu reshuffled.
      let reactPushed = false;
      const pushReact = () => {
        const reacts = [
          { id: 'agree', label: '"You\'re right."' },
          { id: 'joke', label: '"Ha — yeah."' },
          { id: 'silence', label: '"..."' },
        ];
        choices.push(reacts[Math.floor(Math.random() * reacts.length)]);
        reactPushed = true;
      };
      if (onThread) {
        for (const f of this.convoFollowups(vid, c.thread)) {
          if (choices.length >= MAXC) break;
          choices.push(f);
        }
        const sb = this.convoSpeakBackChoice(vid, suppressPivot);
        if (sb && choices.length < MAXC) choices.push(sb);
        if (choices.length < MAXC) pushReact();
      } else {
        let topicsAdded = 0;
        for (const a of t2fresh) {
          // R53 OTHERS EXEMPTION: same rule as the subject menu above —
          // 'others' rides past freshCap, still bounded by topicCapMood
          // and MAXC.
          const othersExempt = a.id === 'ask:others';
          if (a.id === threadAsk || (!othersExempt && topicsAdded >= freshCap) || topicsAdded >= topicCapMood || choices.length >= MAXC) continue;
          choices.push(a); topicsAdded++;
        }
        for (const a of asks) {
          if (a.id === threadAsk || topicsAdded >= topicCapMood || choices.length >= MAXC) continue;
          choices.push(a); topicsAdded++;
        }
        for (const a of t2discussed) {
          if (a.id === threadAsk || topicsAdded >= topicCapMood || choices.length >= MAXC) continue;
          choices.push(a); topicsAdded++;
        }
        // GOSSIP VERBS (fix 2026-10-07): same starvation as the subject menu —
        // earned verbs, not intimacy-budget topics. They fill remaining slots
        // once gossipOpen, like the other discovery actions below.
        for (const gid of ['ask:gossip', 'ask:spread_rumor']) {
          const g = asks.find(a => a.id === gid);
          if (g && g.id !== threadAsk && choices.length < MAXC && !choices.some(s => s.id === gid)) choices.push(g);
        }
      }
      // THEORIZE: joint discovery, a signature mechanic — not small talk.
      // GATED: thinking together is intimate. System talk only makes sense
      // after it arrives; before that, the scattering itself and the
      // monsters are the mystery.
      const theorized = c.theorized || [];
      const sysUp = !!this.state.systemArrived;
      const theorizeOpen = effTrust >= 25 || relAge >= 6;
      const topicsLeft = ['system', 'monsters', 'situation'].filter(t =>
        theorized.indexOf(t) === -1 && (t !== 'system' || sysUp));
      if (!onThread && theorizeOpen && topicsLeft.length && choices.length < MAXC && !suppressPivot) choices.push({ id: 'theorize', label: this.convoActionLabel(vid, 'theorize') });
      // COMPARE MAPS (Steve 2026-10-06): "show me where you've been." A
      // pre-System social action — their visited tiles become your shared
      // map knowledge. Practical, not intimate: low gate.
      if (!onThread && choices.length < MAXC && !suppressPivot && (effTrust >= 15 || relAge >= 3)) {
        choices.push({ id: 'compare_maps', label: this.convoActionLabel(vid, 'compare_maps') });
      }
      // WATCH THEM: the detective's tool. Spend time observing — behavior may
      // contradict story. Available once you've talked enough to have a baseline
      // (2nd conversation+), or if you already have doubts about them.
      // (observePerson lives in truth.js; guarded in case that module is absent.)
      // (Thread coherence: waits for the thread to resolve — one subject-change away.)
      if (!onThread && choices.length < MAXC && typeof this.observePerson === 'function') {
        const hasDoubts = this.getDoubts && this.getDoubts(vid).length > 0;
        if (relAge >= 4 || hasDoubts) {
          choices.push({ id: 'observe', label: hasDoubts ? '"I\'ve been watching you. Keep talking."' : '(watch them for a while)' });
        }
      }
      // DISCOVERY ACTIONS fill the remaining slots — trade, teach, promise,
      // invite. Meaningful, but the conversation itself comes first.
      // PROMISES are discovered, not menued. Before you've learned the
      // concept, the offer only surfaces when they've really opened up
      // (deep in their goal thread). After that, any known goal will do.
      // The handler makes a FORMAL tracked promise — keep it or break it.
      // (Thread coherence: off-thread verbs wait for the thread to resolve.)
      const alreadyPromised = !!((this.state.village.promises || {})[vid]);
      // (c.goalOpenedUp is set at the top of buildMenu — see STICKY note.)
      // EARNED VERB (trust r7): rides after the capped topics like teach/
      // trade — the old `choices.length < MAXC` check starved it behind the
      // topic budget (measured: offer missing from a 10-item menu even with
      // openedUp set). Computed here, pushed after the caps below.
      let offerHelpChoice = null;
      if (!onThread && this.goalKnown(vid) && !c.offeredHelp && !alreadyPromised) {
        const openedUp = !!c.goalOpenedUp;
        if (this.hasDiscovered('promise') || openedUp) {
          offerHelpChoice = { id: 'offer_help', label: this.convoActionLabel(vid, 'offer_help') };
        }
      }
      // KNOWLEDGE TRADING is discovered through conversation: traders seed it
      // by mentioning it; once learned, you can raise it with any trader.
      // (Thread coherence: off-thread — waits behind the subject-change.)
      // STARVATION FIX (longsim knowledge r4 2026-10-12): trade used to
      // compete for the remaining MAXC slots and lost on full menus — the
      // same starvation the teach verb was fixed for (2026-10-08). Earned
      // knowledge-sharing rides after the capped topics instead of losing
      // the slot lottery; the offer is computed here, pushed below.
      let tradeChoice = null;
      if (!onThread && !suppressPivot) {
        try {
          const isTrader = this.isKnowledgeTrader && this.isKnowledgeTrader(vid);
          const tradeable = isTrader ? (this.traderKnowledge(vid) || []) : [];
          if (isTrader && tradeable.length && (this.hasDiscovered('trade') || c.traderMentioned)) {
            tradeChoice = { id: 'trade', label: '"You know things. I know things. Shall we trade?"' };
          }
        } catch (e) {}
      }
      // CALLOUT (Steve 2026-10-06): they taught you wrong and you KNOW better.
      // Knowledge-gated — the choice only exists when contested exists.
      if (!onThread && choices.length < MAXC) {
        try {
          const contested = this.hasContestedWith ? this.hasContestedWith(vid) : [];
          if (contested.length) {
            const e = (this.state.codex.plants || {})[contested[0]] || {};
            const claim = (e.contested || {}).claim || 'something';
            choices.push({ id: 'callout_quiet', label: `"About that ${claim} — can we talk? Privately."` });
            const witnesses = ((this.state.village || {}).roster || []).length;
            if (witnesses >= 3 && choices.length < MAXC) {
              choices.push({ id: 'callout_public', label: `"${claim}? In front of everyone — that's not ${claim}."` });
            }
          }
        } catch (e) {}
      }
      // HAWKING (Steve 2026-10-06): trading is a verb. Villagers with the
      // entrepreneurial spirit sell goods too — not a trader class.
      // The real menu already pages. A full first page must not erase the
      // resident's business; focused questions/threads still come first.
      if (!onThread) {
        try {
          if (this.tradeSpirit && this.tradeSpirit(vid) >= 1) {
            choices.push({ id: 'hawker', label: '"Got anything to trade?"' });
          }
        } catch (e) {}
      }
      // TEACHING happens in conversation now — show, don't menu.
      // Suppressed while a direct question hangs: no burdock non sequiturs.
      // (Thread coherence: off-thread — waits behind the subject-change.)
      // STARVATION FIX (2026-10-08): teach used to compete for the remaining
      // MAXC slots and lost on full menus — the same starvation the gossip
      // verbs were fixed for (2026-10-07). Earned knowledge-sharing rides
      // after the capped topics instead of losing the slot lottery.
      let teachChoice = null;
      if (!onThread && !suppressPivot) {
        try {
          const youKnow = Object.keys(this.state.codex.plants || {})
            .filter(k => this.plantKnown(k)); // L1+ only: a blind taste isn't teachable knowledge
          const theyKnow = this.plantsKnownBy ? this.plantsKnownBy(vid) : [];
          if (youKnow.some(pid => theyKnow.indexOf(pid) === -1)) {
            teachChoice = { id: 'teach', label: this.convoActionLabel(vid, 'teach') };
          }
        } catch (e) {}
      }
      // SPEAK IT BACK (Steve 2026-10-06): try your hard-won words on a
      // native speaker. Offered at exposure 3+ — the heart of the human
      // path (lean into it: this is where trust is actually built). Never
      // under live translate: why reach for words the System hands you.
      // Under the memory aid the device feeds you the phrase first — a
      // study partner, not a replacement.
      // (On-thread it's placed with the follow-ups above; here for openers.)
      if (!onThread) {
        const sb = this.convoSpeakBackChoice(vid, suppressPivot);
        if (sb && choices.length < MAXC) choices.push(sb);
      }
      if (!reactPushed && choices.length < MAXC) {
        const reacts = [
          { id: 'agree', label: '"You\'re right."' },
          { id: 'joke', label: '"Ha — yeah."' },
          { id: 'silence', label: '"..."' },
        ];
        choices.push(reacts[Math.floor(Math.random() * reacts.length)]);
      }
      // Earned verbs ride after the capped topics (see TEACHING above).
      if (teachChoice) choices.push(teachChoice);
      // SKILL LESSONS (skill-teaching.js): "Teach me X?" / "I could show you X." — earned verbs, same slot rule.
      if (!onThread && !suppressPivot && this.convoSkillChoices) {
        try { for (const ch of this.convoSkillChoices(vid)) choices.push(ch); } catch (e) { console.warn('[skill-teaching] menu', e); }
      }
      if (tradeChoice) choices.push(tradeChoice);
      if (offerHelpChoice) choices.push(offerHelpChoice);
      // The subject-change is always available mid-thread (it's the explicit
      // pivot); on openers it rides the remaining slots as before.
      if (c.thread && c.thread !== 'small' && (onThread || choices.length < MAXC)) choices.push({ id: 'subject', label: '"Can I ask you something else?"' });
      choices.push({ id: 'leave', label: c.exchanges === 0 ? '"Actually — never mind."' : '"I should go."' }); // BREAK-IT (socialite 2026-10-08): see sub.push above — the zero-exchange label must not claim a conversation happened.
      return finish( choices);
    },

    startConvo(vid) {
      // MODAL (Steve 2026-10-05): one conversation at a time. If another is
      // active, end it first — you can't talk to two people at once.
      // BREAK-IT (socialite r11 2026-10-10): this iterated the plural key —
      // a property that never exists (convoGet stores in v.conv). The modal
      // rule was dead: 12 simultaneous "active" conversations, whole village
      // engaged.
      const v = this.state.village;
      for (const otherId of Object.keys(v.conv || {})) {
        if (otherId !== vid) {
          const oc = (v.conv || {})[otherId];
          if (oc && oc.active) {
            oc.active = false; oc.over = true;
            // INVITATION HONESTY (journey landing r8 2026-10-12): modal
            // cutoff is a conversation end too — an undecided invite must
            // be re-spoken next sitting (see endConvo).
            try {
              const _oinv = (this.pendingInvite && this.pendingInvite(otherId)) || null;
              if (_oinv) _oinv.spoken = false;
            } catch (e) {}
            try {
              const oname = this.displayName(otherId) || 'them';
              this.say(`You turn away from ${oname} mid-conversation.`);
            } catch (e) {}
          }
        }
      }
      const vp = this.vpOf(vid);
      if (!vp || !vp.id) return null;
      // PHANTOM TALK (break-it social r6 2026-10-09): removeVillager drops the
      // roster but leaves rosterChars, so vpOf still resolved exiled/dead
      // villagers and startConvo opened full conversations with ghosts — you
      // could talk to, teach, and trade with people who were gone. The living
      // roster is the source of truth for who can hold a conversation.
      if (!(v.roster || []).includes(vid)) {
        try { this.say(`${this.displayName(vid)} isn't here anymore.`); } catch (e) {}
        return null;
      }
      // EXILE COLD SHOULDER (Steve 2026-10-17, journey-social r20): the exiled
      // don't get conversations. Villagers refuse by default; close
      // friends/family may break the shoulder at a trust cost. The gate sits
      // at initiation — the one choke point — so every path in (Talk button,
      // talk requests, sim drivers) hits it before any state is written or
      // any cost charged. A refusal returns the talkTo shape with ended:true
      // (no conversation record is touched); a break flags the record below
      // and falls through to the normal open.
      let _exileBroke = false;
      try {
        if (typeof this.justiceExileSociallyCut === 'function' && this.justiceExileSociallyCut()) {
          const res = (typeof this.justiceExileColdResolve === 'function')
            ? this.justiceExileColdResolve(vid) : null;
          if (res && res.refused && !res.broke) {
            return { line: res.line || null, choices: [], transcript: [], ended: true, refused: true, broke: false, vid };
          }
          if (res && res.broke) _exileBroke = true;
        }
      } catch (e) { _exileBroke = false; /* a broken gate must not break talking */ }
      const c = this.convoGet(vid);
      c.active = true; c.exchanges = 0; c.budget = this.convoBudget(vid);
      c.thread = null; c.depth = 0; c.transcript = []; c.pendingQ = null;
      c.choosingSubject = false; c.lastBeat = null; c.spokenBeat = null; c.replyMenu = null; c.followUsed = {}; c.menuPage=0; c.menuPages=1;
      c.threadLog = []; c._beatThread = null; c._resumedOnce = false;
      // STALE INVITE HOLD (journey-social r40 2026-10-21): c.invitePending is
      // the intra-conversation hold for "opener owns the reply, queue the
      // invite for the continuer". It leaked across sittings — a d13 hold
      // that was never served re-queued at d14's open via queueTraderIntro
      // AFTER the fresh invite was already spoken, so <goon> re-served the
      // opener verbatim (transcript-caught: David d14 "Come see what I found").
      // The next-sitting re-speak design lives in the pendingInvite itself
      // (endConvo resets inv.spoken), not in this hold — clearing it here
      // preserves that design and kills the double-serve.
      c.invitePending = null;
      // PER-SITTING said-lines (journey-social r16 2026-10-15): the
      // no-repeat ledger (c.saidLines) persists across sittings by design
      // (pool draws rely on it), but the "I just said" fallback is only
      // honest within one sitting — reset the sitting ledger here.
      c.saidLinesConvo = [];
      // SPENT (journey-succession 2026-10-12): reset the per-conversation
      // spent-choice ledger — a new sitting, fresh offers.
      c.spent = {};
      // SELF-REPEAT (journey-social 2026-10-12 r6): the deflection pool is
      // per-conversation by design — reset the counter here like the other
      // per-sitting ledgers, or the cycle never restarts and the old cap
      // logic collapses to verbatim.
      c.selfRepeatLines = 0;
      // RECAP REFRAMES (journey-social r31 2026-10-20): the count-aware
      // recap escalation is per-sitting — a new sitting, fresh patience.
      c._recapReframes = 0;
      // FAVOR-REQUIREMENTS REFRAMES (journey-social r35 2026-10-20):
      // per-sitting like the recap/silence counters — a new sitting, fresh
      // patience. _favorReqSaid stays persistent (they told you before).
      c._favorReqReframes = 0; c._favorReqEscalations = 0; c._favorReqLastRaw = null;
      // SILENCE-EXHAUSTION (journey-social r31 2026-10-20): per-sitting,
      // per-band silence count — a new sitting, fresh quiet.
      c._msil = {};
      // GOSSIP WALK-DOWN (landing r28 2026-10-19): the served-gossip sigs are
      // PER-SITTING, like saidLinesConvo — a resumed gossip thread in a new
      // sitting honestly re-delivers its headline gossip (the r28 resume
      // intent); within one sitting, "tell me more" walks the pool instead
      // of repeating. Reset here so a resume doesn't inherit the last
      // sitting's served list and dry out on arrival.
      c.gossipServedSigs = [];
      // DRY STREAK (journey-social r18 2026-10-16): fresh sitting, fresh
      // dry count — a previous conversation's dry spell must not cut the
      // new one short.
      c.fallbackStreak = 0;
      // DRY LINES (journey-social r16 2026-10-15): the dry pool's own comment
      // says "past 9 uses in one conversation" — but the counter never
      // reset, so it was per-RUN: after 9 lifetime dry uses a villager went
      // permanently silent on blocked beats (12 silent "Look at me." turns
      // in an r16 grief transcript — no-silent-actions violation). Reset
      // per sitting like the self-repeat counter.
      c.dryLines = 0;
      // COHERENCE (Steve 2026-10-07): per-conversation teaching state resets
      // here — the teach skill is sticky WITHIN a conversation, not forever,
      // and "one lesson per conversation" means per conversation.
      c.teachSkill = null; c.learnedOnce = false; c.learnedWhat = null;
      c.over = false; c.offeredHelp = false; c.askedTopics = [];
      // EXILE COLD SHOULDER: per-sitting reset; the initiation gate above
      // sets it when a loyal villager breaks the shoulder.
      c.exileBreak = false;
      if (_exileBroke) c.exileBreak = true;
      c.qCount = 0; c.theorized = [];
      // PENDINGQ DODGE-LAPSE (socialite r12 2026-10-10): counts consecutive
      // silence-dodges of a hanging bespoke question (see convoPendingQDodge).
      c.pendingQDodges = 0;
      // HELDASK DODGE (socialite r12 2026-10-10): counts silence-dodges while
      // a question sits queued-but-unrevealed (see convoHeldAskDodge).
      c.heldAskDodges = 0;
      // SUBSTANCE (socialite break-it 2026-10-08): per-conversation flag —
      // set by the convoTurn wrapper (convo-dialogue.js) when the player
      // makes any non-acknowledgment choice. The uncapped mood residue in
      // endConvo only lingers on a substantive conversation.
      c.substantive = false;
      // BOND SURFACE (journey-social r22 2026-10-18): per-sitting reset —
      // set by the stage-6 bond preamble when the opener itself was a bond
      // line (the entry beat must not double-mark it).
      c.bondOpened = false;
      // RUMOR (fix 2026-10-07): the drama verb is per-conversation, not
      // per-lifetime — rumorDone must reset here like teachSkill/offeredHelp,
      // or the second rumor with the same person dangles at the prompt with
      // no targets.
      c.rumorDone = false; c.rumorTarget = null; c.rumorTargets = null;
      // INTERPRETER GRATITUDE (socialite r4 2026-10-09): per-conversation —
      // reset here like rumorDone/speakBackDone's cousins.
      c._interpThanks = false;
      c.traderMentioned = false; c.pendingTrade = null;
      c.reactiveQ = null; c.windingDown = false; c.winddownQueued = false; c.winddownSpurns = 0; c.pastDeflected = false;
      // MOOD (convo-mood.js): every conversation starts at a temperature
      // derived from the relationship as it stands and who they are right
      // now — never stored, re-derived fresh each time (Steve 2026-10-06).
      // Guarded: old harnesses may load conversation.js without convo-mood.js.
      c.mood = typeof this.convoMoodInit === 'function' ? this.convoMoodInit(vid) : 0;
      c.moodGuardUsed = false; c.moodGraceUsed = false; c.moodBeat = null;
      c.genericQ = null; c.floraMentioned = null;
      c.count++; c.lastDay = this.state.scholar.day;
      // RELATIONSHIP AGE (dialog rethink Phase 1, Steve 2026-10-08): the
      // count-bypasses are dead; intimacy is trust-tier + time. firstDay
      // anchors relDays(vid).
      if (!c.firstDay) c.firstDay = this.state.scholar.day || 1;
      // TALKING COSTS A LITTLE ENERGY — 10 kcal to open a conversation, not
      // per line. Small talk is quick and cheap; going deep costs ticks
      // (see convoDeepTick), not a flat tax. Social play stays viable.
      // HONESTY (socialite r10 2026-10-10): the charge was silent — the
      // button now names it (app.js), and the first conversation says it
      // once, in-fiction. After that it's priced into the habit.
      if (!this.state.scholar.talkCostTold) {
        this.state.scholar.talkCostTold = true;
        this.say('(Talking costs a little energy — 10 kcal a conversation. Small talk is cheap; going deep costs time, not more food.)');
      }
      this.state.scholar.kcal = Math.max(0, (this.state.scholar.kcal || 0) - 10);
      // ACTION CLOCK: opening a conversation takes 1 tick (time-only —
      // talking barely burns calories). Deep beats add ticks as they land.
      // ENGAGEMENT: they're talking with you now — batch turns won't wander them off.
      this.tickAction(1);
      this.setEngaged(vid, 2);
      if (this.state.scholar.week1) this.state.scholar.week1.talk++;
      this.notePlaystyle('social');
      // DIPLOMAT XP (socialite r11 2026-10-10): practice is the conversation,
      // not the opening. The old on-open grant farmed diplomat L3 (trust 3x,
      // unprompted secrets) via 35 zero-exchange open/leave cycles — 35
      // ticks, 350 kcal, or free at 0 kcal. XP now lands in endConvo, gated
      // on at least one real exchange.
      // (was: this.gainAbilityXP('diplomat', 1); — removed, see endConvo)
      // LANGUAGE: the barrier is discovered in conversation, never listed.
      const comm = this.commLevel(vid);
      const firstMet = !(v.met || {})[vid];
      v.met = v.met || {}; v.met[vid] = true;
      if (firstMet && comm.level !== 'full') {
        const langName = ((this.data.characterGen || {}).languages || []).find(l => l.id === comm.lang);
        const label = langName ? `${langName.icon} ${langName.name}` : comm.lang;
        this.say(`...and then it lands: ${this.displayName(vid)} speaks ${label}. ${comm.level === 'partial' ? 'A few shared words. Gestures. Patience.' : 'You share no language at all.'}`);
      }
      // NAMES ARE EARNED SOCIALLY — but only with enough shared language.
      if (firstMet && !this.state.systemArrived && comm.level !== 'none') this.revealName(vid, 'intro');
      if (firstMet && !this.state.systemArrived && comm.level === 'none') this.revealName(vid, 'gesture');
      // ALIVE: talking eases loneliness — for them, not just you.
      try { this.npcNeeds(vid).social = Math.max(0, this.npcNeeds(vid).social - 40); } catch (e) {}
      if (comm.level === 'none') {
        // No shared language: real foreign speech, not gestures-then-English.
        // nvOpen (appended module) states the barrier plainly and lets them
        // speak their actual tongue.
        return this.nvOpen(vid);
      }
      // THE WANT (convo rebuild 2026-10-11, Steve): every conversation
      // selects one NPC want HERE, in the core flow — not in a wrapper.
      // The want shapes the opening beats (below), the menu answers it
      // (convoWantMenu), and the ending resolves it (convoResolveWant).
      // Nonverbal conversations have no want — no shared words, no asks.
      let want = null;
      try {
        want = this.convoSelectWant(vid);
        if (want && want.def) c.want = { id: want.id, def: want.def, stage: 0, fromSeed: !!want.fromSeed, seedNote: want.seedNote || null, seedFavorId: want.seedFavorId || null, seedQid: want.seedQid || null };
      } catch (e) { want = null; }
      const op = (() => {
        // An outing is physical work already under way. Its current-phase
        // opening keeps the actual collect/unload action reachable through
        // Continue and repeat visits, instead of replacing it with small talk.
        const jointWork = this.waterFavorOpening?.(vid);
        if (jointWork && c.want?.id === 'repay') {
          c.want.favor = this.convoGetFavor(vid);
          return jointWork;
        }
        // RESUME (Steve 2026-10-07): an unfinished thread from a previous
        // conversation resurfaces — people remember what was left hanging.
        // Never ahead of a talk request (convoOpening owns that priority).
        // When resume fires, the fresh want waits at stage 0 — the menu
        // surfaces it once the old thread settles.
        try {
          const rs = this.convoResumeOpener(vid);
          if (rs) return rs;
        } catch (e) {}
        return this.convoOpening(vid, want);
      })();
      // DEFENSIVE (Steve 2026-10-05): convoOpening must return {line, thread}.
      // A bare-string return once rendered as `Name: "undefined"` — normalize
      // here so no future branch can leak that into the fiction.
      const opLine0 = (op && typeof op === 'object' && op.line) ? op.line
        : (typeof op === 'string' && op) ? op : '"Hey."';
      let opLine = opLine0;
      const opThread = (op && typeof op === 'object' && op.thread) ? op.thread : 'small';
      c.thread = opThread; c.depth = 1;
      // WANT-OWNED QUESTION (journey sociallife 2026-10-11): when the opener
      // came from the live want def and the want is already stated
      // (stage >= 2), the want def OWNS the question — its menuOptions
      // supply the answers (commit/deflect). Classifying the opener's
      // trailing "Are you in?" as a generic yes/no question suppresses the
      // want menu (see convoWantMenu), so an uncommitted favor follow-up
      // became uncommittable: the player could say "Yes." but the favor
      // stayed 'asked' and re-seeded forever. The fresh-ask flow
      // (stage 0/1) is untouched — there the generic question IS the
      // engagement path.
      let wantOwnsQ = false;
      try {
        const w = c.want;
        if (opThread === 'want' && w && w.def && (w.stage || 0) >= 2 &&
            typeof w.def.menuOptions === 'function') {
          const mo = w.def.menuOptions.call(this, vid, w.stage) || [];
          wantOwnsQ = mo.length > 0;
        }
      } catch (e) { wantOwnsQ = false; }
      // REACTIVE: if the opener asked something direct ("Did you see that?"),
      // it becomes a lightweight question — answerable, follow-up-able,
      // not small talk the player can only dodge.
      // TALK REQUESTS are exempt: "Can we talk? ..." is the reason they came
      // to you, not a question — matching it produced the garbled
      // "Sorry — I asked you something there. Can we talk?" follow-up.
      const rq = (opThread === 'request' || wantOwnsQ) ? null : this.convoMatchReactive(opLine);
      if (rq) {
        c.reactiveQ = { id: rq.id, followedUp: false };
        if (rq.thread) { c.thread = rq.thread; }
      } else if (!wantOwnsQ) {
        // GENERIC-Q: opener asked something direct with no bespoke def —
        // hang it as an answerable question (Rule 4).
        this.convoGenericQ(vid, opLine);
      }
      this.convoNoteFlora(vid, opLine);
      // SPOKEN LURE (journey landing 2026-10-12): a pending invite used to
      // surface ONLY as betrayal:accept/decline menu choices — the NPC never
      // spoke the invitation, so the player was asked to accept or decline
      // something they were never asked (and could walk blind into an armed
      // plot). If they hold a pending invite, they speak it now as a second
      // opener beat, so the accept/decline choices that follow make sense.
      // Spoken once per pending (inv.spoken); the pending itself is still
      // consumed by accept/decline, and plot invites still travel the normal
      // channel (indistinguishable by design — tells are the warning cue).
      // SEPARATE BEAT (journey establishment r5 2026-10-12): the lure was
      // space-glued onto the opener ("We're down to 0 liters of clean
      // water." ... "you and me?" "Come get air with me. I need to think out
      // loud.") — three discourse moves in one breath, no connective tissue.
      // Two things on their mind get two beats: the want opener lands first,
      // then the invitation as its own THEM line.
      let inviteBeat = null;
      try {
        const inv = (this.pendingInvite && this.pendingInvite(vid)) || null;
        if (inv) {
          // BOND-AWARE (journey-social r23): the label is resolved through
          // inviteLabelFor so rivals speak the cold line, not the warm one.
          const label = (typeof this.inviteLabelFor === 'function') ? this.inviteLabelFor(vid, inv) : null;
          if (label) {
            inviteBeat = label;
            inv.spoken = true;
          }
        }
      } catch (e) {}
      // R17: a resume opener is structural grammar — sayLine exempts it
      // from the run-ledger block (op.structural set by convoResumeOpener).
      this.sayLine(vid, opLine, op && op.structural ? { structural: true } : undefined);
      // INVITATION HONESTY (journey landing r7 2026-10-12): the lure is a
      // diegetic act — sayLine's inviteBeat exemption keeps it spoken even
      // when another villager used the same lure recently (or this one did
      // in an earlier sitting). The menu quotes the label verbatim, so the
      // spoken beat and the menu can never disagree.
      const openerOwnsReply = c.pendingQ || c.reactiveQ || c.genericQ || (c.thread === 'want' && c.want && (c.want.stage || 0) < 3);
      if (inviteBeat) {
        if (openerOwnsReply) c.invitePending = inviteBeat;
        else this.sayLine(vid, inviteBeat, { inviteBeat: true, tag: 'invitation' });
      }
      // COHERENCE (Steve 2026-10-07): drift is never silent. When lived
      // events have visibly changed them since the last conversation, the
      // player SEES it — one short stage-direction beat, at most once a day.
      try {
        const dn = this.convoDriftNote(vid);
        if (dn) {
          if (openerOwnsReply || inviteBeat) c.heldBeats.push({ text: dn });
          else this.sayLine(vid, dn);
        }
      } catch (e) {}
      // BOND ENTRY BEAT (journey-social r22 2026-10-18): sedimented
      // relationships are visible the moment they see you — a depth-2
      // friend and a depth-(-1) rival don't open like strangers. One short
      // stage-direction beat after the opener (the drift-note pattern
      // above), skipped when the opener itself was already a bond line
      // (c.bondOpened, set by the stage-6 preamble). ONCE PER DAY: the
      // beat marks the day's greeting, not every sitting. A ledger-blocked
      // beat stays SILENT — the dry-line fallback ("...lost my train of
      // thought") would be a non-sequitur here, since nothing was
      // attempted conversationally. Feeling-level narration, never a
      // claimed event — the bond record stores no event history.
      try {
        if (!c.bondOpened) {
          const today = (this.state.scholar || {}).day || 0;
          if (c.bondBeatDay !== today) {
            const bb = (typeof this.bondGet === 'function') ? this.bondGet(this.villagerId, vid) : null;
            const bd = (bb && bb.depth) || 0;
            if (bd >= 2 || bd <= -1) {
              const bcg = (this.data.characterGen || {}).convo || {};
              const bpool = bd >= 2 ? (bcg.bondBeatWarm || []) : (bcg.bondBeatCold || []);
              const beat = this.convoPickCycle(vid, 'bondbeat', bpool);
              if (beat && !this.convoWouldBlock(vid, beat)) {
                if (openerOwnsReply || inviteBeat) c.heldBeats.push({ text: beat });
                else this.sayLine(vid, beat);
                c.bondBeatDay = today;
              }
            }
          }
        }
      } catch (e) {}
      // SEEDING: knowledge traders mention their trade in conversation — the
      // mechanic is discovered by talking, not by a button. Once you've
      // learned the concept, you can bring it up with any trader yourself.
      if (this.isKnowledgeTrader && this.isKnowledgeTrader(vid) && !this.hasDiscovered('trade') && Math.random() < 0.5) {
        const seed = '"...I should say, I trade in what I know. My knowledge for yours. Or food, if you\'re short on secrets."';
        if (!c.pendingQ && !c.reactiveQ && !c.genericQ && opThread !== 'request' && !inviteBeat &&
            !(opThread === 'want' && c.want && (c.want.stage || 0) < 3)) {
          c.thread = 'trade'; c.depth = 0;
          this.sayLine(vid, seed, { tag: 'offer', topic: 'trade' });
          c.traderMentioned = true;
          c.traderIntroPending = null;
        } else c.traderIntroPending = seed;
      }
      // EXILE COLD SHOULDER: carry the break flag on the return so callers
      // (and sim drivers) can tell a broken-shoulder open from a normal one.
      return { line: opLine, choices: this.convoChoices(vid), transcript: c.transcript.slice(), ended: false, refused: false, broke: !!c.exileBreak, vid };
    },

    // convoGoonLabel: the continuer, voiced per person/mood/thread — or a
    // gesture when there's no shared language. Never a hardcoded "Go on."
    // (unique-person law, Steve 2026-10-06).
    convoGoonLabel(vid) {
      const c = this.convoGet(vid);
      if (c.thread === 'nonverbal') return '(watch quietly)';
      return this.convoMoreLabel(vid);
    },

    // convoWinddownChoices: one last turn — say goodbye yourself, take one
    // more beat of a live thread, or just leave.
    convoWinddownChoices(vid) {
      const wdChoices = [{ id: 'leave', label: '"I should go."' }];
      if (this.convoThreadHasMore(vid)) {
        wdChoices.push({ id: 'more', label: '"One more thing —"' });
      }
      const reacts = ['agree', 'joke', 'silence'];
      const rid = reacts[Math.floor(Math.random() * reacts.length)];
      const rlabels = { agree: '"You\'re right."', joke: '(crack a joke)', silence: '(say nothing)' };
      wdChoices.push({ id: rid, label: rlabels[rid] });
      return wdChoices;
    },

    // convoPendingQDodge: silence-dodge handling for a hanging BESPOKE
    // question (socialite r12 2026-10-10). Returns a lapse line when the
    // question lapses (the caller replaces the turn's line with it), or null.
    // Convention mirrors the generic-question dodge path: one noticed
    // follow-up (queued as a held beat, revealed via the continuer), then an
    // honest lapse. A lapsed question is asked, not forgotten — askedQs was
    // marked at queue time, so it won't be re-asked this conversation. The
    // lapse clears pendingQ, which unblocks the natural winddown (!c.pendingQ
    // gate) — one unanswered question no longer defeats the energy budget.
    convoPendingQDodge(vid) {
      const c = this.convoGet(vid);
      if (!c || !c.pendingQ) return null;
      c.pendingQDodges = (c.pendingQDodges || 0) + 1;
      if (c.pendingQDodges === 1) {
        const fup = this.convoPickCycle(vid, 'pendingq_fup', [
          '"Hey — I asked you something. You don\'t have to answer, but say something."',
          '"Did you hear me? It\'s alright if you\'d rather not say."',
          '"...You\'re not going to answer, are you."',
        ]) || '"Did you hear what I asked?"';
        (c.heldBeats = c.heldBeats || []).push({ text: fup, pendingqFup: true });
        return null;
      }
      // Second dodge: lapse honestly. Drop any stale follow-up beats first —
      // "forget I asked" must not be followed by "did you hear me?".
      c.heldBeats = (c.heldBeats || []).filter(hb => !hb.pendingqFup);
      c.pendingQ = null;
      const lapse = this.convoPickCycle(vid, 'pendingq_lapse', [
        '"...Alright. Forget I asked."',
        '"Never mind — wasn\'t important."',
        '"Okay. Your business is your business."',
      ]) || '"Forget I asked."';
      return lapse;
    },

    // convoHeldAskDodge: silence-dodge handling for a QUEUED-but-unrevealed
    // question (socialite r12 2026-10-10). Same bug class as the pendingQ
    // hang: a queued ask beat sets heldAsk, which gates the natural winddown
    // (!c.heldAsk) — stonewalling with silence kept the beat queued forever
    // and the conversation never wound down (the continuer was offered every
    // turn, but nothing forced the issue). After 2 silence-dodges the moment
    // passes: the queued ask beats are dropped and heldAsk clears. No lapse
    // line is owed — the question was never spoken, so the fiction stays
    // coherent by simply never asking. Dropped questions are marked in
    // askedQs so the same question isn't re-queued two turns later (the
    // village-wide note landed at queue time already).
    convoHeldAskDodge(vid) {
      const c = this.convoGet(vid);
      if (!c || !c.heldAsk || c.pendingQ) return;
      c.heldAskDodges = (c.heldAskDodges || 0) + 1;
      if (c.heldAskDodges < 2) return;
      const beats = c.heldBeats || [];
      for (const hb of beats) {
        if (hb && hb.ask && hb.ask.id && c.askedQs.indexOf(hb.ask.id) === -1) {
          c.askedQs.push(hb.ask.id);
        }
      }
      c.heldBeats = beats.filter(hb => !(hb && hb.ask));
      c.heldAsk = (c.heldBeats || []).some(hb => hb && hb.ask);
      c.heldAskDodges = 0;
    },

    // convoDropUnspoken(vid, choiceId): ONE-BEAT TURNS (Steve 2026-10-05) —
    // unspoken held beats die when the player moves on (anything but the
    // 'goon' continuer). The wind-down can't be dodged: it stays queued.
    // Shared choke point: the base turn handler AND the early-return
    // wrappers (dlg:subject in convo-beats.js, betrayal: in betrayal.js)
    // must all run it, or queued beats never die on those paths and a
    // stuck heldAsk defeats the winddown gate (socialite 2026-10-10).
    convoDropUnspoken(vid, choiceId) {
      const c = this.convoGet(vid);
      // Every content handler (including early-return injectors) passes this
      // boundary. Selecting a topic leaves the topic selector; browsing does
      // not. Otherwise a resumed event speaks but its menu stays on topics.
      if (c && c.choosingSubject && !['subject','dlg:subject','menu:more','silence','leave'].includes(choiceId)) c.choosingSubject = false;
      if (!c || choiceId === 'goon' || !c.heldBeats || !c.heldBeats.length) return;
      const traderIntro = c.heldBeats.find(h => h && h.traderIntro);
      if (traderIntro && !c.traderMentioned) c.traderIntroPending = traderIntro.text;
      const invitation = c.heldBeats.find(h => h && h.invitation);
      if (invitation) c.invitePending = invitation.text;
      // DODGE COUNTING (socialite 2026-10-11): a queued-but-unrevealed
      // question the player moves past without tapping the continuer is being
      // dodged — by ANY choice, not just silence. r12 counted silence only;
      // recap/ask:/dlg: choices discarded the beat with no dodge recorded,
      // and the first-conversation forceQ re-queued a fresh question every
      // turn — heldAsk true at every turn end, winddown never firing
      // (measured infinite). After 2 dodges the moment passes (askedQs
      // marked inside convoHeldAskDodge).
      if ((c.heldBeats || []).some(h => h && h.ask)) {
        try { this.convoHeldAskDodge(vid); } catch (e) {}
      }
      c.heldBeats = c.heldBeats.filter(h => h.winddown);
      if (!c.heldBeats.length) { c.heldAsk = false; c.winddownQueued = false; }
      c.heldBeats = c.heldBeats.filter(h => h.winddown);
      if (!c.heldBeats.length) { c.heldAsk = false; c.winddownQueued = false; }
      // STUCK-HELDASK (socialite 2026-10-10): the filter discards a queued-
      // but-unrevealed QUESTION beat when the player moves on — but heldAsk
      // stayed true whenever any beat survived (e.g. the winddown beat).
      // The winddown gate (!c.heldAsk) then blocked FOREVER: budget spent,
      // goodbye queued, conversation never winding down (measured: 79 recap
      // taps, budget 3, no winddown — the ask beat was long gone but its
      // flag wasn't). The flag tracks the BEAT, not the turn: no ask beat
      // queued, no heldAsk.
      else if (!c.heldBeats.some(h => h.ask)) { c.heldAsk = false; }
    },

    // convoMaybeWinddown(vid): the energy budget's enforcement, shared by the
    // base turn tail and the dlg: early-return handlers (convo-dialogue.js).
    // Queues the goodbye beat when the budget is spent (revealed via the
    // continuer — one-beat turns, Steve 2026-10-05); ends naturally once the
    // goodbye is winding down. A queued question gets asked before the
    // goodbye (heldAsk gate). Returns the endConvo result when the
    // conversation ends on this turn, else null.
    // SPURN RULE (socialite 2026-10-11): the queued goodbye can't be dodged
    // forever by never tapping the continuer — one more beat is grace ("take
    // one more beat of a live thread"), the second spurn lands the goodbye
    // unilaterally (spoken, never a silent chop). Without this the budget was
    // decorative: hostile players held 60-exchange conversations on budget 3.
    convoMaybeWinddown(vid) {
      const c = this.convoGet(vid);
      if (!c || !c.active) return null;
      if (c.pendingQ || c.heldAsk || c.exchanges < c.budget) return null;
      if (!c.windingDown && !c.winddownQueued) {
        c.winddownQueued = true;
        c.winddownSpurns = 0;
        const cg = (this.data.characterGen || {}).convo || {};
        const temp = this.npcTemper(vid);
        let wdPool = (cg.winddowns || {})[temp] || (cg.winddowns || {}).default
          || ['"Anyway — I should get back to it."'];
        // RELATIONSHIP AGE (Steve 2026-10-06): old friends don't wind down
        // formally. Close tier gets a brief, warm "I should..." — the
        // conversation tapers like it does between people who'll talk
        // again tomorrow.
        try {
          if (this.convoVoiceTier && this.convoVoiceTier(vid) === 'close' && Math.random() < 0.5) {
            wdPool = ['"Alright — I should get back to it."', '"I should go. You know where to find me."',
                      '"Okay. We\'ll pick this up later."'];
          }
        } catch (e) {}
        const wd = this.convoPickCycle(vid, 'winddown', wdPool);
        c.heldBeats.push({ text: wd, winddown: true });
        return null;
      }
      if (c.windingDown) return this.endConvo(vid, 'natural');
      // Queued but unrevealed, and the player took another beat instead of
      // the continuer. One is grace; two is stonewalling.
      c.winddownSpurns = (c.winddownSpurns || 0) + 1;
      if (c.winddownSpurns >= 2) {
        const bi = (c.heldBeats || []).findIndex(h => h && h.winddown);
        const hb = bi >= 0 ? c.heldBeats.splice(bi, 1)[0] : null;
        c.windingDown = true;
        c.winddownQueued = false;
        c.winddownSpurns = 0;
        const line = (hb && hb.text) || '"Anyway — I should get back to it."';
        this.sayLine(vid, line, {
          // FALLBACK (journey-social 2026-10-11): a blocked goodbye must not
          // go silent — the conversation is ending either way.
          fallback: '"Right. Back to it, then."',
        });
        const wdChoices = (typeof this.convoWinddownChoices === 'function')
          ? this.convoWinddownChoices(vid)
          : [{ id: 'leave', label: '"I should go."' }];
        return { line, choices: wdChoices, ended: false, windingDown: true, transcript: c.transcript.slice() };
      }
      return null;
    },

    convoTurn(vid, choiceId) {
      const c = this.convoGet(vid);
      if (!c.active) return null;
      // Old saves / mid-run convos predate heldBeats (one-beat-turns):
      // lazy-init so a dodged question can't crash the turn.
      if (!c.heldBeats) c.heldBeats = [];
      this.convoDropUnspoken(vid, choiceId);
      const cg = (this.data.characterGen || {}).convo || {};
      const temp = this.npcTemper(vid);
      const mood = this.npcMood(vid);
      let line = null, youSaid = null;
      const done = (l, you) => { line = l; youSaid = you || null; };
      // STRUCTURAL TURN (journey-social r17 2026-10-15): resume/recap beats
      // are conversation grammar, not content — exempt from the run-ledger
      // block (see sayLine's structural flag). Set by the branch before
      // done(), consumed at emission below.
      let structuralTurn = false;
      // answeredReactive: this turn engaged their direct question — the
      // follow-up logic must not fire. extraQ: a formal question that lands
      // as a second beat in the same turn (rq_personal -> real question).
      // extraLine: a follow-up beat after an answer — Q -> A -> follow-up,
      // so answering doesn't dead-end the moment.
      let answeredReactive = false, answeredGeneric = false, extraQ = null, extraLine = null;

      if (choiceId === 'leave') {
        return this.endConvo(vid, 'left');
      } else if (choiceId === 'goon') {
        // CONTINUER (Steve 2026-10-05): the queued beat lands now, with
        // whatever state its showing implies. Nothing else happens this
        // turn — the beats belonged to the turn that queued them.
        // The label is voiced per person, mood, and thread (convoMoreLabel)
        // — never a hardcoded "Go on." (unique-person law, Steve 2026-10-06).
        const hb = (c.heldBeats || []).shift();
        if (hb) {
          // The ask-beat is the one piece of state that waits for the
          // showing: offering answers before the player has seen the
          // question would be answering blind.
          if (hb.ask) {
            c.pendingQ = hb.ask;
            c.pendingQDodges = 0;
            c.qCount = (c.qCount || 0) + 1;
            if (c.askedQs.indexOf(hb.ask.id) === -1) c.askedQs.push(hb.ask.id);
            try { this.noteAskedQ(hb.ask.id); } catch (e) {}
            c.heldAsk = false;
            // IT'S DIFFERENT NOW (Phase 2, Principle 8): the t2clock "it's
            // different now" pattern goes universal — re-asked bespoke
            // questions acknowledge the changed run, never repeat blind.
            try {
              c.qsnap = c.qsnap || {};
              const qclock = (typeof this.t2clock === 'function')
                ? this.t2clock(vid) : String((this.state.scholar || {}).day || 0);
              if (c.qsnap[hb.ask.id] && c.qsnap[hb.ask.id] !== qclock) {
                hb.text = '"You asked me that before. It\'s a different question now." ' + hb.text;
              }
              c.qsnap[hb.ask.id] = qclock;
              // THEY REMEMBER WHAT YOU SAID (you_said ledger read): a re-ask
              // names your previous answer — continuity, not amnesia.
              const prevAid = (typeof this.convoRecallYouSaid === 'function')
                ? this.convoRecallYouSaid(vid, hb.ask.id) : null;
              if (prevAid && prevAid !== 'honest_pass') {
                const pqq = (cg.questions || []).find(q => q.id === hb.ask.id);
                const paa = pqq && (pqq.answers || []).find(a => a.id === prevAid);
                if (paa && paa.label) {
                  hb.text += ' "Last time you said ' + String(paa.label).replace(/^"|"$/g, '') + ' — still true?"';
                }
              }
            } catch (e) {}
          }
          const gl = this.convoGoonLabel(vid);
          c.transcript.push({ who: 'you', text: gl });
          if (hb.traderIntro) {
            c.traderMentioned = true;
            c.thread = 'trade'; c.depth = 0;
          }
          this.sayLine(vid, hb.text, hb.winddown ? { tag: 'closing' } : hb.invitation ? { tag: 'invitation', inviteBeat: true } : hb.traderIntro ? { tag: 'offer', topic: 'trade' } : { foreign: hb.foreign });
          queueTraderIntro(c);
          done(hb.text, gl);
          if (hb.winddown) {
            // The goodbye lands: one last turn of choices, then it's over.
            // Only the player's "I should go." (or the turn after) ends it —
            // never a silent chop.
            c.windingDown = true;
            c.winddownQueued = false;
            const wdChoices = c.thread === 'nonverbal'
              ? [{ id: 'leave', label: '(walk away)' }, { id: 'nv:nod', label: '(nod slowly)' }]
              : this.convoWinddownChoices(vid);
            return { line, choices: wdChoices, ended: false, windingDown: true, transcript: c.transcript.slice() };
          }
        } else {
          done('"..."', null);
        }
        return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      } else if (choiceId.indexOf('ans:') === 0) {
        const parts = choiceId.split(':');
        const qid = parts[1], aid = parts[2];
        if (aid === 'honest_pass') {
          // ENGINE-GUARANTEED HONEST OPT-OUT (Steve 2026-10-08): the player
          // honestly declined to answer. The question resolves, the
          // conversation continues — NO trust penalty, NO mood cool. The
          // NPC accepts gracefully (convoHonestPassReact), never guilt-trips.
          const qd = (cg.questions || []).find(q => q.id === qid);
          c.answered[qid] = aid;
          if (c.askedQs.indexOf(qid) === -1) c.askedQs.push(qid);
          try { this.noteAskedQ(qid); } catch (e) {}
          c.pendingQ = null;
          const react = this.convoHonestPassReact(vid, qid);
          const saidLabel = '"I\'d rather not say."';
          done(this.voiceLine(vid, this.fillTalkLine(react, this.vpOf(vid))), saidLabel);
          this.remember(vid, 'you_said', qid + '=honest_pass');
          if (qd && qd.follow && Math.random() < 0.5) {
            extraLine = this.voiceLine(vid, this.fillTalkLine(qd.follow, this.vpOf(vid)));
          }
        } else {
        const qd = (cg.questions || []).find(q => q.id === qid);
        const ad = qd && qd.answers.find(a => a.id === aid);
        c.answered[qid] = aid;
        if (c.askedQs.indexOf(qid) === -1) c.askedQs.push(qid);
        try { this.noteAskedQ(qid); } catch (e) {}
        c.pendingQ = null;
        let react = (ad && ad.react) || '"Huh. Okay."';
        const regionNow = (this.homeRegion || (this.state.scholar || {}).homeRegion) || 'there';
        react = react.replaceAll('{region}', regionNow);
        const saidLabel = ad && ad.label ? String(ad.label).replaceAll('{region}', regionNow) : null;
        // ANSWERED-LISTENING (journey-social r20 2026-10-17): the player
        // answered a direct question — the acknowledgment must not go dry.
        // A run-blocked specific react falls back to the generic
        // acknowledgment (first unblocked wins — the r19 opener pattern);
        // dry only when both are blocked. Transcript-caught: Rafael asks
        // "So what's your plan here?", the player answers, the blocked
        // react dry-replaced to "...Sorry, lost my train of thought."
        // HONEST WEIGHT (dialog rethink Phase 1, Steve 2026-10-08): honest
        // words land. Data answers may carry trust/mood; honest-hard and
        // cruel tempers move the relationship and mark escalation.
        // SCENE (Phase 2): all consequences flow through the resolver — one
        // place, one set of rules (talk caps, cost mults, mediation).
        const atemper = (ad && ad.temper) || 'neutral';
        let tdelta = (ad && typeof ad.trust === 'number') ? ad.trust : 0;
        let mdelta = (ad && typeof ad.mood === 'number') ? ad.mood : undefined;
        // honest-hard defaults: the truth lands, even without data numbers.
        if (atemper === 'honest-hard' && tdelta === 0 && mdelta === undefined) { tdelta = -1; mdelta = -1; }
        this.resolveConsequence(vid, {
          trust: tdelta, mood: mdelta, temper: atemper,
          disposition: atemper === 'kind' ? 0.5 : atemper === 'cruel' ? -0.5 : 0,
          escalate: atemper === 'cruel' || atemper === 'honest-hard',
          name: 'answer:' + qid + ':' + aid,
        });
        done(this.convoAnswerReactLine(vid, react), saidLabel);
        this.remember(vid, 'you_said', qid + '=' + aid);
        // FOLLOW-UP BEAT: answering a real question sometimes earns a second
        // beat — their thought continues instead of terminating. Not every
        // time; people don't monologue after every answer.
        // DEEPER (playtest deepening r18 2026-10-18, #541): the curious
        // bespoke questions carry a `deeper` beat — the NPC's own substantive
        // stake in their question. It queues RELIABLY (not the 50% follow
        // lottery): answering a real question earns a real exchange, and the
        // thread continues on the continuer instead of going dry after one
        // react. When deeper exists it replaces the follow roll on this path.
        if (qd && qd.deeper) {
          extraLine = this.voiceLine(vid, this.fillTalkLine(this.convoDeeperPick(vid, qd), this.vpOf(vid)));
        } else if (qd && qd.follow && Math.random() < 0.5) {
          extraLine = this.voiceLine(vid, this.fillTalkLine(qd.follow, this.vpOf(vid)));
        }
        }
      } else if (choiceId === 'deflect_q') {
        const qid = c.pendingQ && c.pendingQ.id;
        c.pendingQ = null;
        if (qid && c.askedQs.indexOf(qid) === -1) c.askedQs.push(qid);
        try { this.noteAskedQ(qid); } catch (e) {}
        // DISPOSITION (Phase 1): dodging is a cruel-temper move. Out-of-
        // character for a kind player — costs more. Marks escalation.
        // MOOD: dodging a direct question cools the room. Fair now that an
        // honest opt-out exists — this is a choice to be rude, not a trap.
        // SCENE (Phase 2): through the resolver.
        this.resolveConsequence(vid, {
          trust: -1, mood: -1, temper: 'cruel', disposition: -0.5,
          escalate: true, name: 'deflect_q',
        });
        done('"Okay." Something shutters, just slightly.', '(change the subject)');
      } else if (choiceId.indexOf('react:') === 0) {
        // REACTIVE ANSWER: engaged their direct question. The outcome must
        // read as a RESPONSE to what they asked — never a canned pivot.
        const parts = choiceId.split(':');
        const rid = parts[1], aid = parts[2];
        const rdef = REACTIVE_DEFS[rid];
        const ad = rdef && rdef.answers.find(a => a.id === aid);
        if (c.reactiveQ && c.reactiveQ.id === rid) c.reactiveQ = null;
        answeredReactive = true;
        // SCENE (Phase 2): consequences through the resolver. Warmth follows
        // the trust delta — kind answers warm, cruel or dismissive ones cool.
        const rcons = (rdelta, aname) => this.resolveConsequence(vid, {
          trust: rdelta, temper: 'neutral', name: aname,
        });
        if (aid === 'honest_pass') {
          // ASK/ANSWER CONTRACT (Phase 2): honestly decline a reactive
          // question. Graceful, no cost — the question resolves.
          this.resolveConsequence(vid, {
            memory: { type: 'you_said', note: rid + '=honest_pass' },
            name: 'react:honest_pass',
          });
          done('"Fair enough. I shouldn\'t have pressed."', '"I\'d rather not say."');
        } else if (ad && ad.action === 'look_treeline') {
          // "Let's go look. Together." — the contextual show, not burdock.
          const spooky = Math.random() < 0.5;
          rcons(ad.trust || 0, 'react:' + rid + ':' + aid);
          c.thread = 'spooked'; c.depth = 1;
          try { this.convoDeepTick(vid); } catch (e) {}
          done(spooky
            ? 'You go to the tree line together. Nothing moves. ...Or something just stopped moving. Broken branches at head height — snapped, not cut. You don\'t let go of each other\'s sleeves all the way back.'
            : 'You go to the tree line together and stare until your eyes water. Nothing. Just wind. "Okay," they breathe. "Okay. Good." Neither of you believes it.',
            '"Let\'s go look. Together."');
        } else if (ad && ad.action === 'ask_real') {
          // "Of course. Ask." — the personal question becomes a REAL
          // question with real answers (pendingQ machinery).
          const cg2 = (this.data.characterGen || {}).convo || {};
          const prefer = ['q_miss', 'q_regret', 'q_first_memory', 'q_hope', 'q_scared', 'q_trust'];
          const askedAny = this.villageAskedQs();
          // Time/trust gates apply here too (Worker D 2026-10-11): the
          // fallback pools used to draw ANY unasked question, including
          // "the first week?" on day 2.
          const qok2 = (q) => this.convoQuestionOk(q, (this.state.village.trust || {})[vid] || 10, this.npcMood(vid), vid);
          let pool = (cg2.questions || []).filter(q => prefer.indexOf(q.id) !== -1 && c.askedQs.indexOf(q.id) === -1 && askedAny.indexOf(q.id) === -1 && qok2(q));
          if (!pool.length) pool = (cg2.questions || []).filter(q => prefer.indexOf(q.id) !== -1 && c.askedQs.indexOf(q.id) === -1 && qok2(q));
          if (!pool.length) pool = (cg2.questions || []).filter(q => c.askedQs.indexOf(q.id) === -1 && askedAny.indexOf(q.id) === -1 && qok2(q));
          if (!pool.length) pool = (cg2.questions || []).filter(q => c.askedQs.indexOf(q.id) === -1 && qok2(q));
          const qd = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
          // village-wide note at draw time: the next "ask me something real"
          // draws from what's left, even before this one is revealed.
          try { this.noteAskedQ(qd && qd.id); } catch (e) {}
          rcons(ad.trust || 0, 'react:' + rid + ':' + aid);
          c.thread = 'small'; c.depth = 1;
          done(ad.line || '"...Okay. Here it is."', ad.label);
          // ONE-BEAT TURNS (Steve 2026-10-05): the question queues behind
          // "Of course. Ask." — pendingQ/askedQs/qCount land when the
          // continuer reveals it, never before the player has seen it asked.
          if (qd) extraQ = qd;        } else if (ad) {
          rcons(ad.trust || 0, 'react:' + rid + ':' + aid);
          if (rdef.thread) { c.thread = rdef.thread; c.depth = 1; }
          done(ad.line, ad.label);
        } else {
          done('"..."', null);
        }
      } else if (choiceId.indexOf('alive:') === 0) {
        // WHAT'S ALIVE (Phase 2): the player picked up something alive —
        // an open thread, a fresh memory, a want-driven question, a world
        // event. Route each to its machinery; never a dead end.
        const aparts = choiceId.split(':');
        const akind = aparts[1], akey = aparts.slice(2).join(':');
        if (akind === 'thread') {
          // Resume the open thread. It's being addressed — clear it from
          // the ledger so it doesn't haunt the menu.
          const open = (typeof this.convoOpenThreads === 'function') ? this.convoOpenThreads(vid) : [];
          const o = open.find(x => x && x.tid === akey);
          const label = (o && o.label) || akey;
          try {
            const led = this.convoTopicLedger(vid);
            led.open = (led.open || []).filter(x => !x || x.tid !== akey);
          } catch (e) {}
          c.thread = akey; c.depth = 1;
          this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'alive:thread' });
          const beat = (typeof this.convoThreadBeat === 'function') ? this.convoThreadBeat(vid) : null;
          // SPENT (journey-succession 2026-10-12): resumed once — the
          // thread is live now; the subject-change replant must not re-offer
          // the identical "we never finished" line this sitting.
          this.convoSpendChoice(vid, choiceId);
          // INHERITED THREAD (journey-succession 2026-10-11): name whose
          // thread it was — the new Bearer can resume it as their own.
          const predT = (typeof this.inheritedName === 'function') ? this.inheritedName(o) : null;
          // THREAD-SPECIFIC RESUME (journey-social r15 2026-10-15): the old
          // generic line was identical for every thread — resuming a SECOND
          // different thread in one sitting self-blocked in the no-repeat
          // ledger, and the "I just said — did you miss it?" deflection
          // fired at a player who wasn't repeating themselves
          // (transcript-verified seed 53 sit490, recovered from the dead
          // 2026-10-14 sociallife-r1 run). Naming the thread keeps each
          // resume distinct in the ledger AND reads like a person picking
          // up the actual thread instead of a menu.
          const resumeLine = beat || (predT
            ? `"About ${label} — that was ${predT}'s thread. We never did get back to that."`
            : `"About ${label} — yeah, we never did get back to that."`);
          // R17: the generic fallback is structural grammar (exempt from the
          // run-ledger block); a real beat keeps full ledger protection.
          structuralTurn = !beat;
          done(resumeLine,
            predT ? `"About ${label} — that was ${predT}'s thread. We never finished."` : `"About ${label} — we never finished."`);
        } else if (akind === 'memory') {
          // Name something you share. The ledger is continuity — they answer
          // from the specific memory, not a generic line.
          const MEM_RESP = {
            deflected: "\u201cYeah. I remember. ...It\u2019s okay. Really.\u201d",
            gift: "\u201cYou didn\u2019t have to do that. I haven\u2019t forgotten.\u201d",
            private_gift: "\u201cNobody saw that. I know. Thank you.\u201d",
            promise_kept: "\u201cYou kept your word. That\u2019s rare out here.\u201d",
            promise_broken: "\u201c...Yeah. We should talk about that.\u201d",
            comforted: "\u201cThat night helped. More than I said.\u201d",
            shared_fear: "\u201cI\u2019m glad I told you. Glad you told me.\u201d",
            you_threatened: "\u201cI haven\u2019t forgotten what you said. Just... careful.\u201d",
            confronted: "\u201cYou were wrong, you know. But I hear you.\u201d",
            shared_goal: "\u201cWe talked about wanting that. Still do.\u201d",
            // MEM-WIRE (2026-10-13): the warning, cited. Knowledge-gated by
            // construction — the memory is keyed under the confronter, and
            // this line only surfaces in conversation with them.
            confronted_theft: "\u201cI told you at the fire. Take what you need \u2014 not double. I meant it.\u201d",
            // MEMDEPTH (2026-10-13): responses for previously write-only
            // memories. Each line names the deed back — the NPC cites the
            // ledger, not a vibe. Tone: Steve's law — conversations have
            // meaning; the NPC wants something (acknowledgment, distance,
            // leverage) and says so.
            wrongly_accused: "\u201cYou called me a liar, and you were wrong. I don't forget that easily.\u201d",
            confession: "\u201cI already told you the truth once. That cost me.\u201d",
            hostile: "\u201cAsk your questions. Carefully.\u201d",
            exposed_cannibal: "\u201c...You know. And you're saying it out loud. Fine. It was that or watch them rot, and I chose wrong.\u201d",
            offered_meat: "\u201cIt was food. Out here that's all it ever is, until someone decides it isn't.\u201d",
            shared_secret: "\u201cYou watched and didn't look away. That means something. I haven't decided what.\u201d",
            saw_weakness: "\u201cI saw. I won't say it again. But I saw.\u201d",
            warned: "\u201cI heard you. Pulling weight. You won't have to say it twice.\u201d",
            feast: "\u201cThat feast \u2014 real food, firelight. I still think about it.\u201d",
            moot_vote: "\u201cYou stood up at the moot. I remember which way.\u201d",
            heckled: "\u201cEveryone saw. The cameras saw. Don't pretend it was nothing.\u201d",
            appeal: "\u201cYou asked me to take the work. I'm still doing it.\u201d",
            deal_refused: "\u201cYou took the food and walked. Next time the food stays until the work's done.\u201d",
            grudging_respect: "\u201cI stopped coming at you. That doesn't mean I stopped watching.\u201d",
            blame: "\u201cIt was the pot. I know it was the pot. I taste it in my sleep.\u201d",
            moot_case_held: "\u201cI stood up at the moot and the fire agreed. I'd do it again.\u201d",
            moot_weak_case: "\u201cThe fire wouldn't hold it. ...I overreached. I know.\u201d",
            moot_split_fire: "\u201cThat moot split the fire and I called it. I carry that.\u201d",
            duel_terms: "\u201cWitnessed, to yield. I remember the terms. Do you?\u201d",
            duel_fought: "\u201cWe fought it out, witnessed. It's settled. It stays settled.\u201d",
            lost_duel: "\u201cI yielded, witnessed. Don't make me say it again.\u201d",
          };
          // INHERITED MEMORY (journey-succession 2026-10-11): the memory is
          // the predecessor's deed — the NPC attributes it to them, never to
          // the new face. A broken promise died with its maker: explicitly
          // not the successor's to carry.
          let memResp = MEM_RESP[akey] || '"Yeah. I think about that too."';
          // TRUST r6: hoisted for the petition_moot read below (was try-scoped).
          let lastMem = null;
          try {
            const mems = (((this.state.village || {}).memory || {})[vid] || []).filter(m => m && m.t === akey);
            lastMem = mems[mems.length - 1];
            const predM = (typeof this.inheritedName === 'function' && lastMem) ? this.inheritedName(lastMem) : null;
            if (predM) {
              const MEM_INH = {
                gift: `\u201c${predM} didn\u2019t have to do that. I haven\u2019t forgotten.\u201d`,
                private_gift: `\u201cNobody saw that but ${predM} and me. I haven\u2019t forgotten.\u201d`,
                promise_kept: `\u201c${predM} kept their word. That\u2019s rare out here.\u201d`,
                promise_broken: `\u201c${predM} never got to make that right. It\u2019s not yours to carry — but I remember.\u201d`,
                comforted: `\u201c${predM} sat with me that night. Helped more than I said.\u201d`,
                shared_fear: `\u201cI\u2019m glad I told ${predM}. ...Glad I\u2019m telling you, too.\u201d`,
                you_threatened: `\u201cI haven\u2019t forgotten what ${predM} said. Just... careful.\u201d`,
                confronted: `\u201c${predM} said I was wrong. Maybe. You\u2019re not ${predM} — but I\u2019ll hear you out.\u201d`,
              };
              if (MEM_INH[akey]) memResp = MEM_INH[akey];
            }
          } catch (e) {}
          // TRUST r6 (moot afterlife): petition_moot memories get a specific
          // read, not the generic fallback — the response names THEIR vote
          // and the outcome from the memory note itself. The loser lines
          // carry the disagreement honestly (Telltale-theater: the write
          // earns its read).
          if (akey === 'petition_moot' && lastMem && lastMem.note) {
            const _n6 = String(lastMem.note);
            const _va6 = _n6.indexOf('voted to take them in') >= 0;
            const _oa6 = _n6.indexOf('the moot took them in') >= 0;
            memResp = _va6 && _oa6
              ? "\u201cI voted to take them in. The moot agreed \u2014 glad we did.\u201d"
              : _va6
                ? "\u201cI voted to take them in. The moot said no. It still sits wrong with me.\u201d"
                : _oa6
                  ? "\u201cI voted to turn them away. The moot took them in anyway. We\u2019ll see.\u201d"
                  : "\u201cI voted to turn them away, and the moot agreed. Hard call. Right one.\u201d";
          }
          this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'alive:memory' });
          const about = (typeof this.convoMemoryAbout === 'function' && this.convoMemoryAbout(akey)) || 'that';
          // SPENT (journey-succession 2026-10-12): the memory was named —
          // re-offering "About what I asked before..." in the same sitting
          // reads as amnesia.
          this.convoSpendChoice(vid, choiceId);
          done(memResp, `"About ${about}..."`);
        } else if (akind === 'want') {
          // The want surfaces as a question (Principle 9): engage it.
          c.thread = 'want'; c.depth = 1;
          let wline = null;
          try {
            // SETTLED FAVOR (journey establishment r7 2026-10-12): re-asking
            // "Is there something you need? Really." after a settled favor
            // must not dead-end into the "Okay. Here's the thing —" opener
            // fallback (caught live, seed 999) — the favor is closed, so the
            // NPC says so honestly.
            const wf = (c.want && c.want.favor) ||
              (typeof this.convoGetFavor === 'function' ? this.convoGetFavor(vid) : null);
            if (c.want && c.want.id === 'ask_favor' && wf &&
                (wf.state === 'moot' || wf.state === 'thanked' ||
                 wf.state === 'acknowledged' || wf.state === 'fulfilled')) {
              wline = '"No, really — it\'s handled. Thanks for asking, though."';
            } else if (c.want && c.want.def && (c.want.stage || 0) >= 1 && (c.want.stage || 0) < 3 &&
                       typeof c.want.def.engageBeat === 'function') {
              // WANT RESUME (journey crisis r8 2026-10-14): the want is already
              // stated (stage 1-2) — re-asking ENGAGES its beat (the news, the
              // favor's stakes) instead of re-running the opener. Transcript-
              // verified: three "you'll never guess" hooks, zero news
              // delivered, the hook promise violated. Matches the want arc
              // (0 selected -> 1 surfaced -> 2 engaged, code: convoWantEngage)
              // and the t==='want' thread continuation, which already routes
              // to engageBeat.
              wline = c.want.def.engageBeat.call(this, vid);
            } else {
              const opener = this.convoWantOpener ? this.convoWantOpener(vid, c.want) : null;
              wline = opener && opener.line;
            }
            if (c.want) c.want.stage = Math.max(c.want.stage || 0, 1);
          } catch (e) {}
          this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'alive:want' });
          done(wline || '"Okay. Here\u2019s the thing \u2014"', '"Is there something you need? Really."');
        } else if (akind === 'event') {
          // World events cut the queue — route to the lately topic.
          this.resolveConsequence(vid, { trust: 1, temper: 'neutral', name: 'alive:event' });
          const evline = (typeof this.topic2Ask === 'function') ? this.topic2Ask(vid, 'lately') : null;
          // SPENT (journey-succession 2026-10-12): "what's going on out
          // there" asked once — the answer was given.
          this.convoSpendChoice(vid, choiceId);
          done(evline || '"Yeah. Everyone\u2019s talking about it."', '"What\u2019s going on out there?"');
        } else {
          done('"..."', null);
        }
      } else if (choiceId === 'more') {
        const beat = this.convoThreadBeat(vid);
        // NULL-LINE GUARD (journey-establishment r16 2026-10-18): when the
        // thread is dry AND the exhausted pool is fully ledger-blocked,
        // convoPickCycle returns null and the turn spoke a literal
        // "THEM: null" into the transcript (r15, seed 61 Wilhelm). Fall back
        // to the dry admission, same shape as the dlg:more dry path.
        done(beat || this.convoPickCycle(vid, 'exh', cg.exhausted || ['"I\'ve told you everything I know about that."'])
          || '"That\'s the whole of it. Sorry."', '"Tell me more."');
      } else if (choiceId.indexOf('gq:') === 0) {
        // GENERIC ANSWER: the player answered their direct question. The
        // outcome must read as a RESPONSE — never a canned pivot (Rule 1).
        const parts = choiceId.split(':');
        const kind = parts[1], aid = parts[2];
        const wasGq = c.genericQ;
        c.genericQ = null; answeredGeneric = true;
        let youLine = null, resp = null;
        // SCENE (Phase 2): trust through the resolver (talk caps at 40).
        let gqTrust = 0;
        if (aid === 'honest_pass') {
          // ASK/ANSWER CONTRACT (Phase 2): honestly decline a generic
          // question. Graceful, no cost — the question resolves.
          youLine = '"I\'d rather not say."';
          resp = '"Fair enough \u2014 I shouldn\'t have pressed."';
          this.resolveConsequence(vid, {
            memory: { type: 'you_said', note: (wasGq && wasGq.kind || 'gq') + '=honest_pass' },
            name: 'gq:honest_pass',
          });
        } else if (kind === 'yn') {
          youLine = aid === 'yes' ? '"Yes."' : aid === 'no' ? '"No."' : '"I don\'t know."';
          const acknowledgments = GQ_ACK[aid] || GQ_ACK.unsure;
          resp = this.convoPick(vid, 'gq:yn:' + aid, acknowledgments) || acknowledgments[0];
          if (aid !== 'unsure') gqTrust = 1;
        } else if (kind === 'howru') {
          youLine = aid === 'bad' ? '"Honestly? Not great."' : aid === 'fine' ? '"I\'m fine."' : '"Better when I\'m busy."';
          resp = this.convoPick(vid, 'gq:howru:' + aid, GQ_ACK['howru_' + aid] || GQ_ACK.howru_fine);
          gqTrust = aid === 'bad' ? 2 : 1;
        } else if (kind === 'greet') {
          youLine = aid === 'notmuch' ? '"Not much. You?"' : '"Surviving."';
          resp = this.convoPick(vid, 'gq:greet:' + aid, GQ_ACK['greet_' + aid] || GQ_ACK.greet_notmuch);
          gqTrust = 1;
        } else if (kind === 'day') {
          youLine = aid === 'count' ? '"It\'s day ' + this.state.scholar.day + '."' : '"I\'ve lost track of the days."';
          resp = aid === 'count' ? '"Thank you. I wanted to check."' : '"It\'s easy to lose count."';
          gqTrust = 1;
        } else if (kind === 'reason') {
          youLine = aid === 'understand' ? '"I want to understand you better."' : '"I was curious. You don\'t have to answer."';
          resp = aid === 'understand' ? '"All right. Thank you for asking."' : '"Fair enough. I appreciate that."';
          gqTrust = 1;
        } else {
          if (aid === 'take') {
            youLine = '"I need a moment to think about that."';
            resp = '"Take your time."';
            gqTrust = 1;
          } else {
            youLine = '"I don\'t know how to answer that yet."';
            resp = this.convoPick(vid, 'gq:open:unsure', GQ_ACK.unsure);
          }
        }
        if (gqTrust) this.resolveConsequence(vid, { trust: gqTrust, temper: 'neutral', name: 'gq:' + kind + ':' + aid });
        if (wasGq && wasGq.kind === 'howru' && aid === 'bad') {
          try { this.convoDeepTick(vid); } catch (e) {}
        }
        // These are complete answer reactions. Random semantic closers such
        // as "Doesn't matter now" can contradict "Take your time."
        done(resp || '"Okay."', youLine);
      } else if (choiceId === 'recap') {
        // RECAP (Steve 2026-10-07): long exchanges stay coherent — the
        // player can always ask what the conversation is actually about.
        // The recap re-anchors from the thread log; the thread continues.
        // (Menu insertion is the sibling's lane: Game.convoRecapChoice(vid).)
        // R17: structural beat — exempt from the run-ledger block.
        structuralTurn = true;
        done(this.convoRecapLine(vid), '"Wait — what were we talking about?"');
      } else if (choiceId.indexOf('ask:') === 0) {
        const topic = choiceId.slice(4);
        // DEEP BEATS build trust faster: asking about someone's past or what
        // they want is an act of care. Words only go so far — talk caps at 40.
        // TOPIC PACK (Steve 2026-10-06): you/fears/loved are acts of care too.
        if (topic === 'past' || topic === 'goal' || (this.topic2Deep && this.topic2Deep(topic))) {
          // SCENE (Phase 2): asking deep is an act of care — through the resolver.
          this.resolveConsequence(vid, { trust: 2, temper: 'kind', name: 'ask:' + topic });
        }
        // TOPIC PACK (Steve 2026-10-06): generated topics carry their own labels.
        done(this.convoAskTopic(vid, topic), this.topic2AskLabel ? this.topic2AskLabel(vid, topic) : this.convoLabel(vid, topic));
        c.choosingSubject = false;
      } else if (choiceId.indexOf('follow:') === 0) {
        // THREAD FOLLOW-UP (Steve 2026-10-06): the natural next thing to say
        // on this topic. Reuses the thread's beat machinery so the response
        // is always on-thread; the fallback pools carry the moment when the
        // thread's beats are spent.
        const parts = choiceId.split(':');
        const ftopic = parts[1], fi = +(parts[2] || 0);
        c.followUsed = c.followUsed || {};
        c.followUsed[ftopic] = c.followUsed[ftopic] || [];
        if (c.followUsed[ftopic].indexOf(fi) === -1) c.followUsed[ftopic].push(fi);
        const flabel = (TOPIC_FOLLOWUPS[ftopic] || [])[fi] || '"Tell me more."';
        const fbeat = this.convoThreadBeat(vid);
        if (fbeat) {
          done(fbeat, flabel);
        } else {
          c.depth = (c.depth || 0) + 1;
          const fb = this.convoPickCycle(vid, 'follow:' + ftopic, TOPIC_FOLLOWUP_FALLBACK[ftopic] || ['"Hm."']);
          done(this.voiceLine(vid, this.fillTalkLine(fb, this.vpOf(vid))), flabel);
        }
        c.choosingSubject = false;
      } else if (choiceId === 'observe') {
        // WATCH THEM: the detective's tool. Costs time, may reveal that
        // behavior doesn't match story. (observePerson lives in truth.js.)
        // The observation is the PLAYER's narration — it is said directly,
        // never rendered as the villager's own dialogue. Their actual beat
        // is their reaction to being watched.
        const r = this.observePerson(vid);
        if (r && r.text) this.say(r.text);
        const react = (this.drawTruthLine && this.drawTruthLine('observedReact', vid))
          || '"Something on your mind?"';
        done(this.voiceLine(vid, react),
          r && r.found ? '"I\'ve been watching you. Keep talking."' : '(watch them for a while)');
      } else if (choiceId === 'offer_help') {
        c.offeredHelp = true;
        // A promise is a FORMAL tracked commitment now — not just +2 trust.
        // This is the conversation path to promiseHelp (the button is gone).
        // Keep it or break it: they remember.
        const pr = this.promiseHelp(vid);
        if (pr && pr.ok) {
          done('"...Thank you. Really."', '"I could help with that."');
        } else {
          // BREAK-IT (social r7 2026-10-09): promiseHelp deflects honestly for
          // goals with no keep path ("I won't promise what I can't keep") —
          // the NPC hears the honesty, not a broken vow in waiting.
          const l = (pr && pr.deflected)
            ? `"Fair." A slow nod. "Most people just say the words."`
            : (this.convoPick(vid, 'offerhelp', [
            '"You\'d do that? ...Thank you. Really."',
            '"I won\'t forget you said that."',
            '"Okay. Okay — that means something, you know that?"',
          ]) || '"Thank you."');
          // SCENE (Phase 2): through the resolver.
          this.resolveConsequence(vid, { trust: 2, temper: 'kind', name: 'offer_help' });
          done(l, '"I could help with that."');
        }
      } else if (choiceId === 'trade') {
        // Knowledge trading, discovered through conversation. They lay out
        // what they know and the price; you decide. No button was ever here.
        const tradeable = (this.traderKnowledge && this.traderKnowledge(vid)) || [];
        if (!tradeable.length) {
          done('"Nothing I know that you don\'t — right now. The green world keeps its secrets."', '"You know things. I know things. Shall we trade?"');
        } else {
          const pid = tradeable[0];
          const p = (this.data.plants || []).find(x => x.id === pid) || {};
          const pname = (this.plantKnown && this.plantKnown(pid)) ? p.name : (p.description || 'a plant');
          const trust = (this.state.village.trust || {})[vid] || 10;
          const price = trust >= 60 ? 'trust' : (trust >= 30 ? 'food' : 'knowledge');
          const priceLine = price === 'trust'
            ? '"For you? Just remember who taught you."'
            : price === 'food'
              ? `"${pname} — I know it deep. 300 kcal of food and it's yours."`
              : `"${pname}. Deep knowledge. ...What do YOU know that's worth it?"`;
          c.thread = 'trade'; c.depth = 1;
          c.pendingTrade = { pid, price };
          done(`"Ah. A fellow collector." ${priceLine}`, '"You know things. I know things. Shall we trade?"');
        }
      } else if (choiceId === 'trade_yes') {
        const pt = c.pendingTrade;
        c.pendingTrade = null; c.thread = null;
        if (pt) {
          const before = ((this.state.codex.plants || {})[pt.pid] || {}).level || 0;
          // HONEST FOLLOW-UP (break-it knowledge 2026-10-08): tradeKnowledge
          // returns an explicit outcome token. The old after>before check
          // answered every refusal with "come back when you can pay" — wrong
          // when the refusal was "you already know it" or "you have nothing
          // I don't know". Each refusal names its real reason.
          const res = this.tradeKnowledge(vid, pt.pid);
          const after = ((this.state.codex.plants || {})[pt.pid] || {}).level || 0;
          if (res === 'ok' || res === 'taught-wrong' || after > before) {
            done('"Pleasure doing business."', '"Deal."');
          } else if (res === 'known') {
            done('"Already know it cold, huh? Then we\'re even on that one."', '"Deal."');
          } else if (res === 'nothing') {
            done('"Bring me something I haven\'t seen and we\'ll talk."', '"Deal."');
          } else if (res === 'contested') {
            done('"Hm. We\'ll see about that."', '"Deal."');
          } else {
            done('"...Come back when you can pay."', '"Deal."');
          }
        } else {
          done('"..."', '"Deal."');
        }
      } else if (choiceId === 'trade_no') {
        c.pendingTrade = null; c.thread = null;        done('"Another time, then. Knowledge keeps."', '"Another time, maybe."');
      } else if (choiceId === 'callout_quiet' || choiceId === 'callout_public') {
        // CALLOUT (Steve 2026-10-06): you know better — say so. Quiet or
        // public, the social consequences are real either way.
        const contested = this.hasContestedWith(vid) || [];
        if (!contested.length) {
          done('"Never mind."', '"Actually — never mind."');
        } else {
          const pid = contested[0];
          const isPublic = choiceId === 'callout_public';
          this.callOutTeaching(vid, pid, { public: isPublic });
          done(isPublic ? '"Everyone heard that." (you said it loud)' : '"Just between us." (you kept it quiet)',
               isPublic ? '"That wasn\'t right, and everyone should know it."' : '"Can we talk about that? Privately."');
        }
      } else if (choiceId === 'hawker') {
        // HAWKER (Steve 2026-10-06): villagers with the spirit sell goods.
        const ware = this.hawkerOffer(vid);
        if (!ware || ware.sold) {
          done('"Sold out, friend. The road provides — sometimes."', '"Got anything to trade?"');
        } else {
          c.pendingHawk = true;
          const scamHint = ware.scam && this.tradeSavvy() >= 4
            ? (ware.scam.kind === 'overprice' ? ' (steep, for what it is)' : ' (something about this feels off)')
            : '';
          const price = this.goodsTradePrice ? this.goodsTradePrice(ware.price) : ware.price;
          done(`"${ware.blurb}" ${this.displayName(vid)} shows you the ${ware.name} — ${price} kcal of finished food${ware.kg ? ` (${ware.kg} kg — you can feel the heft)` : ''}${scamHint}.`, '"Got anything to trade?"');
        }
      } else if (choiceId === 'hawker_yes') {
        c.pendingHawk = null;
        const ok = this.hawkerBuy(vid);
        done(ok ? '"Pleasure." (the deal is done)' : '"Another time." (you couldn\'t pay)', '"Deal."');
      } else if (choiceId === 'hawker_no') {
        c.pendingHawk = null;
        done('"No hurry. It\'ll keep."', '"Not today."');
      } else if (choiceId.indexOf('skill_learn:') === 0 || choiceId.indexOf('skill_teach:') === 0) {
        // SKILL LESSON (skill-teaching.js): one mechanic, either direction.
        const r = this.convoSkillLesson(vid, choiceId);
        done(r.line, r.you);
      } else if (choiceId === 'teach') {
        // Teaching happens in conversation now — show, don't menu.
        // TOPICAL TEACH (Steve, Rule 2): show/teach must relate to what's
        // being discussed. If the green world came up, teach the plant that
        // came up. Otherwise the teach carries a bridge — "that reminds
        // me" — never a random burdock drop mid-thought.
        const youKnow = Object.keys(this.state.codex.plants || {})
            .filter(k => this.plantKnown(k)); // L1+ only: a blind taste isn't teachable knowledge
        const theyKnow = this.plantsKnownBy ? this.plantsKnownBy(vid) : [];
        const teachable = youKnow.filter(pid => theyKnow.indexOf(pid) === -1);
        if (!teachable.length) {
          done('"Huh — looks like we\'re even on the green stuff."', '"Let me show you something."');
        } else {
          const fm = c.floraMentioned;
          let pid = teachable[0], youLine = '"Let me show you something."', respLine = null;
          if (fm && fm.pid && teachable.indexOf(fm.pid) !== -1) {
            // They named it, you teach it — the show connects to the talk.
            pid = fm.pid;
            respLine = `You crouch down — the ${fm.name} you were just talking about. You show them where it grows, how to tell it apart, what it's good for. ` + (this.convoPickCycle(vid, 'teachreact', [
              'Their eyes widen. "I never knew that."',
              '"Huh." They turn it over in their mind. "I\'ll remember that one."',
              'They nod slowly, committing it to memory. "Good to know. Really good to know."',
              'A short laugh. "And I\'ve been walking past it for weeks."',
            ]) || 'Their eyes widen. "I never knew that."');
          } else if (!fm || fm.pid) {
            // Nothing green came up — or they named a plant you can't teach
            // them — so the teach pivots: bridge it or it's a non sequitur.
            youLine = this.convoPickCycle(vid, 'teachbridge', [
              '"That reminds me — let me show you something."',
              '"Speaking of staying alive out here — let me show you something."',
              '"Different subject, but this can\'t wait — let me show you something."',
            ]) || '"Let me show you something."';
          }
          // (generic flora words matched: the green world IS the topic —
          // teaching any plant connects without a bridge.)
          // TEACHING-EVENT WRITE (convo rebuild 2026-10-11): the lesson lands
          // in BOTH stores — v.taught (in-run knowledge, via the primitive so
          // plantKnowledge stays synced) and v.taughtByPlayer (the player
          // genuinely taught them — the ONLY thing the taughtref opener may
          // read). Background familiarity is never written here.
          try {
            if (this.villagerLearnsPlant) this.villagerLearnsPlant(vid, pid, 'player-taught');
            else { this.state.village.taught[vid] = this.state.village.taught[vid] || []; if (this.state.village.taught[vid].indexOf(pid) === -1) this.state.village.taught[vid].push(pid); }
          } catch (e) {}
          try {
            const tbp = this.state.village.taughtByPlayer = this.state.village.taughtByPlayer || {};
            const lst = tbp[vid] = tbp[vid] || [];
            if (lst.indexOf(pid) === -1) lst.push(pid);
          } catch (e) {}
          // WRONG-KNOWLEDGE HONESTY (break-it knowledge 2026-10-08): you teach
          // the name YOU believe (wrongAs), never the true name you never
          // learned — and the false name travels with the lesson, like the
          // fireside wrong-branch (deliberate:false).
          const _pe = (this.state.codex.plants || {})[pid] || {};
          const pname = _pe.wrongAs || (((this.data.plants || []).find(p => p.id === pid) || {}).name) || pid;
          if (_pe.wrongAs && _pe.wrongPid) {
            try {
              const _lw = this.villagerWrongAbout ? (this.villagerWrongAbout(vid) || {}) : {};
              _lw[pid] = { wrongPid: _pe.wrongPid, deliberate: false };
            } catch (e) {}
          }
          this.discover('teach');
          // SCENE (Phase 2): teaching is a real act — through the resolver, no talk cap.
          this.resolveConsequence(vid, { trust: 2, talk: false, temper: 'kind', name: 'teach' });
          try { this.socialTick(vid); } catch (e) {}
          try { this.convoDeepTick(vid); } catch (e) {}
          done(respLine || (`You show them ${pname} — where it grows, how to tell it apart. ` + (this.convoPickCycle(vid, 'teachreact', [
            'Their eyes widen. "I never knew that."',
            '"Huh." They turn it over in their mind. "I\'ll remember that one."',
            'They nod slowly, committing it to memory. "Good to know. Really good to know."',
            'A short laugh. "And I\'ve been walking past it for weeks."',
          ]) || 'Their eyes widen. "I never knew that."')), youLine);
        }
      } else if (choiceId === 'speak_back') {
        // SPEAK IT BACK: the human path. One beat, trust is the currency.
        const r = this.speakBack(vid);
        done(r.line, r.youSaid);
      } else if (choiceId === 'invite_party') {
        const r = (this.inviteToParty && this.inviteToParty(vid)) || { ok: false, msg: '...' };
        // SPENT (journey-succession 2026-10-12): the invitation was issued
        // and answered — accept or decline. Pestering it until they flip-flop
        // ("I work alone... Fine.") reads as no memory of their own stance.
        this.convoSpendChoice(vid, 'invite_party');
        done(r.msg || '...', '"Want to come with me?"');
      } else if (choiceId.indexOf('rumor:tgt:') === 0) {
        // RUMOR STEP 1: who are we talking about. The listener is in on
        // the secret — they become the rumor's first hearer. (Fix
        // 2026-10-06: the thread dangled here with no follow-up choices.)
        const tid = choiceId.slice('rumor:tgt:'.length);
        c.rumorTarget = tid;
        c.thread = 'spread_rumor'; c.depth = 1;
        done(`"${(this.firstRef ? this.firstRef(tid) : this.displayName(tid))}? Okay. And what's the word — what am I hearing?"`,
          `"${this.displayName(tid)}."`);
      } else if (choiceId.indexOf('rumor:type:') === 0) {
        // RUMOR STEP 2: what's the word. The drama verb completes: the
        // rumor enters the gossip system WITH the listener as first hearer,
        // so spreadGossip has a teller and it can actually travel. (Fix
        // 2026-10-06: heard: [] meant rumors died on arrival.)
        const type = choiceId.slice('rumor:type:'.length);
        const rtarget = c.rumorTarget;
        const tname = this.firstRef ? this.firstRef(rtarget) : this.displayName(rtarget);
        const typeLabels = {
          stingy: `"${tname}'s been holding back. Keeping the good stuff close."`,
          untrustworthy: `"Can't trust ${tname}. Watch your back around them."`,
          generous: `"${tname}'s been generous. Sharing around, no questions asked."`,
          scheming: `"${tname}'s scheming. Planning something — I can see it."`,
          coward: `"${tname} froze when it mattered. Coward."`,
        };
        const g = this.spreadRumor(rtarget, type, vid);
        c.rumorDone = true; c.thread = null; c.rumorTarget = null; c.rumorTargets = null;
        // Sharing a secret is intimate: a little trust, and they remember.
        // SCENE (Phase 2): through the resolver (words cap; the memory is the act).
        // DEDUPE GATE (detective playtest 2026-10-08): the reward fires ONLY
        // when a rumor actually started. The dedupe path (same target, same
        // day-part) spread nothing but still paid +trust per fresh
        // conversation — an infinite trust farm for repeating one rumor.
        if (g) {
          this.resolveConsequence(vid, {
            trust: 2, temper: 'cruel',
            memory: { type: 'you_told_rumor', note: `${type} about ${this.displayName(rtarget)}` },
            name: 'rumor:spread',
          });
          try { this.socialTick(vid); } catch (e) {}
        }
        // Reaction in their temperament voice — not a canned pivot.
        const temp = this.npcTemper(vid);
        const reacts = {
          warm: [`"Oh no. Really? ...Thanks for trusting me with that."`],
          gentle: [`"...That's hard to hear. I'll keep it between us."`],
          prickly: [`"Huh. Noted. I'll be watching them."`],
          bold: [`"Interesting. I'll keep my eyes open."`],
          intense: [`"${tname}? Are you sure? ...Okay. Okay, noted."`],
          withdrawn: [`"...I won't say who told me."`],
          cautious: [`"...I didn't hear it from you. Got it."`],
          dry: [`"Juicy. Filed away."`],
          restless: [`"Huh — okay, that's worth knowing."`],
        };
        const pool = reacts[temp] || [`"Oh? ...I'll keep that in mind."`];
        done(g ? this.convoPick(vid, 'rumorreact:' + type, pool) : `"It's already going around."`,
          typeLabels[type] || `"Word about ${tname}."`);
      } else if (choiceId === 'theorize') {
        // Think TOGETHER. Topic order: the System (if it's here), the monsters,
        // the situation. Each NPC theorizes in their intelligence voice — and
        // sharp minds advance your understanding for real.
        const done_topics = c.theorized || [];
        const sysUp = !!this.state.systemArrived;
        const order = sysUp ? ['system', 'monsters', 'situation'] : ['monsters', 'situation'];
        const topic = order.find(x => done_topics.indexOf(x) === -1) || 'situation';
        if (done_topics.indexOf(topic) === -1) done_topics.push(topic);
        c.theorized = done_topics;
        c.thread = 'theorize'; c.depth = 1;
        const line = this.theorizeWith(vid, topic);
        // Thinking together is intimate — it deepens trust, like past/goal asks.
        // SCENE (Phase 2): through the resolver.
        this.resolveConsequence(vid, { trust: 2, temper: 'kind', name: 'theorize' });
        done(line, '"What do you think is actually going on here?"');
      } else if (choiceId === 'compare_maps') {
        // COMPARE MAPS (Steve 2026-10-06): their visited tiles become your
        // shared map knowledge. Voiced by the villager — some people draw
        // in the dirt, some people just point and talk.
        const cmp = this.compareMaps(vid);
        const vp = this.vpOf(vid);
        const vname = (vp && vp.name ? vp.name.split(' ')[0] : 'They');
        let line;
        if (cmp.newCount > 0) {
          const spots = [
            `"Here — and here." ${vname} sketches in the dirt with a stick, quick sure lines. "Don't go there after rain. And this one's worth the walk."`,
            `"I've been all through here." A finger traces routes you haven't walked. "The ground's different than it looks from far off. Now you know."`,
            `${vname} talks you through their ground — where the path holds, where it doesn't, what's worth seeing. Your map grows by ${cmp.newCount} place${cmp.newCount === 1 ? '' : 's'}.`,
          ];
          line = this.convoPick(vid, 'maps:shared', spots);
        } else {
          const spots = [
            `"Huh. We've walked the same ground, you and I." ${vname} shrugs. "Nothing new on mine."`,
            `"Let me see... no, you've got everything I've got. We're even."`,
          ];
          line = this.convoPick(vid, 'maps:nonenew', spots);
        }
        // Sharing ground is trust-building — practical intimacy.
        // SCENE (Phase 2): through the resolver.
        this.resolveConsequence(vid, { trust: 1, temper: 'neutral', name: 'compare_maps' });
        done(line, '"Can we compare maps?"');
      } else if (choiceId === 'agree') {
        // Reactive-aware: "You're right" IS an answer to a direct question.
        const rrA = c.reactiveQ && REACTIVE_DEFS[c.reactiveQ.id];
        if (rrA && rrA.reacts && rrA.reacts.agree) {
          c.reactiveQ = null; answeredReactive = true;
          if (rrA.thread) { c.thread = rrA.thread; c.depth = 1; }
          done(rrA.reacts.agree, '"You\'re right."');
        } else if (c.genericQ) {
          // Nodding along answers a direct question too — no strand.
          c.genericQ = null; answeredGeneric = true;
          done(this.convoPick(vid, 'gq:agree', GQ_ACK.gq_agree) || '"Yeah."', '"You\'re right."');
        } else {
          const m = cg.agreeReacts || {};
          // Acknowledgments are human filler — per-temperament pools (arrays
          // in data), never a loop.
          const rawA = m[temp] || m.default || '"Yeah."';
          const poolA = Array.isArray(rawA) ? rawA : [rawA];
          const l = this.convoPick(vid, 'agree:' + temp, poolA)
            || this.convoPickCycle(vid, 'agreefill', ['"Yeah."', '"Mm."', '"Right."', 'Nods along.']);
          // MOOD: being agreeable warms the room, a little, every time.
          // SCENE (Phase 2): through the resolver.
          this.resolveConsequence(vid, { mood: 1, temper: 'kind', name: 'agree' });
          done(l, '"You\'re right."');
        }
      } else if (choiceId === 'joke') {
        const rrJ = c.reactiveQ && REACTIVE_DEFS[c.reactiveQ.id];
        if (rrJ && rrJ.reacts && rrJ.reacts.joke) {
          c.reactiveQ = null; answeredReactive = true;
          if (rrJ.thread) { c.thread = rrJ.thread; c.depth = 1; }
          const vgJ = this.state.village;
          vgJ.cheer = Math.max(vgJ.cheer || 0, 1);
          done(rrJ.reacts.joke, '(crack a joke)');
        } else if (c.genericQ) {
          c.genericQ = null; answeredGeneric = true;
          const vgJ2 = this.state.village;
          vgJ2.cheer = Math.max(vgJ2.cheer || 0, 1);
          done(this.convoPick(vid, 'gq:joke', GQ_ACK.gq_joke) || 'A short laugh.', '(crack a joke)');
        } else {
        const m = cg.jokeReacts || {};
        const rkey = (mood === 'grieving' || mood === 'scared') ? mood : temp;
        const key = 'joke:' + rkey;
        const rawJ = m[rkey] || m.default || 'A short laugh.';
        const poolJ = Array.isArray(rawJ) ? rawJ : [rawJ];
        const l = this.convoPick(vid, key, poolJ)
          || this.convoPickCycle(vid, 'jokefill', ['A short laugh.', 'Snorts.', 'Grins.']);
        // MOOD: jokes warm — unless they're grieving or scared, in which
        // case it lands badly. Read the room. SCENE (Phase 2): resolver.
        this.resolveConsequence(vid, {
          mood: (mood === 'grieving' || mood === 'scared') ? -1 : 1,
          temper: 'neutral', name: 'joke',
        });
        done(l, '(crack a joke)');
        const vg = this.state.village;
        vg.cheer = Math.max(vg.cheer || 0, 1);
        }
      } else if (choiceId === 'silence') {
        const rrS = c.reactiveQ && REACTIVE_DEFS[c.reactiveQ.id];
        if (rrS && rrS.reacts && rrS.reacts.silence) {
          c.reactiveQ = null; answeredReactive = true;
          if (rrS.thread) { c.thread = rrS.thread; c.depth = 1; }
          done(rrS.reacts.silence, '(say nothing)');
        } else if (c.genericQ) {
          c.genericQ = null; answeredGeneric = true;
          done(this.convoPick(vid, 'gq:silence', GQ_ACK.gq_silence) || '...', '(say nothing)');
        } else {
        // MOOD: silence means different things at different temperatures —
        // comfortable when warm, pointed when cold. (convo-mood.js)
        const ms = typeof this.convoMoodSilence === 'function'
          ? this.convoMoodSilence(vid) : { line: '"..."', shift: 0 };
        // MOOD-SILENCE IS GRAMMAR (journey-social r25 2026-10-18): the mood-
        // silence line is a stage direction ("The silence stretches a beat
        // too long"), not content — two villagers filling quiet the same way
        // on one day is not parroting (defect 7's target was content lines).
        // The run-ledger block was turning single silences into dry-line
        // deflections ("...Sorry, lost my train of thought." as the answer
        // to saying nothing — transcript-caught on fresh sittings, turn 0).
        // Structural exemption, same as the r17 resume/recap beats: the
        // per-sitting ledger still applies, so true same-turn repeats keep
        // the honest "I just said" path.
        structuralTurn = true;
        // SCENE (Phase 2): through the resolver.
        if (ms.shift) this.resolveConsequence(vid, { mood: ms.shift, temper: 'neutral', name: 'silence' });
        done(ms.line, '(say nothing)');
        // SILENCE-EXHAUSTION (journey-social r31 2026-10-20): the NPC has
        // named the repeated silence and the moment is spent — drain the
        // energy budget so the EXISTING convoMaybeWinddown machinery closes
        // it naturally (r18 dry-streak precedent). Guards mirror r18.
        if (ms.spent && c.active && !c.winddownQueued && !c.windingDown) {
          c.budget = Math.min(c.budget, c.exchanges);
        }
        // PENDINGQ DODGE (socialite r12 2026-10-10): silence never answers a
        // hanging bespoke question — without this hook the question hung
        // forever and its !c.pendingQ winddown gate defeated the energy
        // budget indefinitely (measured: 40 turns, budget 3, never wound
        // down). One noticed follow-up, then an honest lapse — the same
        // convention dodged generic questions already get (GQ_FOLLOWUP /
        // GQ_LAPSE). The lapse replaces this turn's line so the fiction
        // stays coherent: they notice the silence, then let it go.
        const _pqdLapse = this.convoPendingQDodge(vid);
        if (_pqdLapse) done(_pqdLapse, '(say nothing)');
        // HELDASK DODGE is counted in convoDropUnspoken (turn top) for every
        // non-continuer choice — silence included — so no second count here
        // (socialite 2026-10-11: counting twice marked the question asked
        // after a single silence).
        }
      } else if (choiceId === 'subject') {
        // Change the subject — but LET THE PLAYER PICK, not a random jump.
        // (Steve 2026-10-06: the random topic leap was a non sequitur.)
        // Sets choosingSubject; the next menu lists uncovered topics plainly.
        c.choosingSubject = true;
        c.thread = null; c.depth = 0;
        const sack = this.convoPickCycle(vid, 'subjectack', [
          '"Oh — sure. What\'s on your mind?"',
          '"Yeah, alright. Different subject."',
          '"Mm. Okay — what else?"',
        ]);
        done(this.voiceLine(vid, this.fillTalkLine(sack, this.vpOf(vid))), '"Actually — can I ask you something else?"');
      } else if (choiceId.indexOf('nv:') === 0) {
        const kind = choiceId.slice(3);
        const outs = {
          nod: ['They nod back, slowly. Some understanding passes between you.',
                'They nod. A small, careful acknowledgment.',
                'Nod returned. The ice thins a fraction.'],
          smile: ['They smile — surprised, then genuine.',
                  'A grin breaks through, quick and warm.',
                  'They smile back. It reaches their eyes this time.'],
          pointself: ['You point at yourself, then at them, then at the fire. Together. They get it.',
                      'You draw a circle in the dirt around both your feet. They laugh, surprised.',
                      'You tap your chest, then theirs. Us. They nod, emphatic.'],
        };
        // SCENE (Phase 2): through the resolver.
        this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'nv:' + kind });
        done(this.convoPickCycle(vid, 'nv:' + kind, outs[kind] || ['You gesture.']), '(gesture)');
      } else {
        done('"..."', null);
      }

      // GENERIC-Q DETECTION: their response just asked something direct with
      // no bespoke def — hang it as an answerable question (Rule 4), and
      // note when the green world comes up (Rule 2: topical teaching).
      // Skipped when a formal/reactive question is already live, or the
      // player just answered the generic one.
      // RUMOR PROMPTS are menu prompts, not real questions: "who are we
      // talking about?" must surface the target choices, not generic-Q
      // answers. Without this the generic-Q narrowing re-dangles the rumor
      // thread the 2026-10-06 fix had just un-dangled. (socialite playtest
      // 2026-10-06)
      const rumorPrompt = c.thread === 'spread_rumor' && !c.rumorDone;
      if (line) this.convoNoteFlora(vid, line);
      if (line && !answeredGeneric && !answeredReactive && !extraQ && !rumorPrompt) this.convoGenericQ(vid, line);

      if (youSaid) c.transcript.push({ who: 'you', text: youSaid });
      c.exchanges++;
      // BEAT COMPOSITION (convo rebuild 2026-10-11): the beat acknowledges
      // what the player just said BEFORE emission — the transcript holds the
      // composed line and the no-repeat ledger sees the final string.
      // FALLBACK (journey-social 2026-10-11): a no-repeat-blocked base beat
      // must not go silent — the turn's consequences already fired.
      try {
        if (line && typeof this.convoComposeBeat === 'function' && typeof this.convoPlayerSaid === 'function') {
          const composed = this.convoComposeBeat(vid, line, this.convoPlayerSaid(vid, choiceId));
          if (composed) line = composed;
        }
      } catch (e) {}
      // NULL-LINE CLASS GUARD (journey-establishment r16 2026-10-18): several
      // branches can done(null) when a pool is fully ledger-blocked
      // (convoPickCycle -> null: winddown 'more', 'agree' agreefill, a null-text
      // goon-held winddown beat, voiceLine nulls). A live turn must never
      // return a null line — the phone would show an empty beat. Trail off
      // honestly through the normal emission path below.
      if (line == null) line = '"..."';
      // A required answer acknowledgment is dialogue grammar. Replacing it
      // with amnesia because another NPC acknowledged a reply is misleading.
      line = this.sayLine(vid, line, { fallback: () => this.convoSelfRepeatLine(vid), structural: structuralTurn || answeredGeneric }) || line;
      // WANT ARC (convo rebuild 2026-10-11): answering their question engages
      // the want; rudely changing the subject deflects it. The core flow
      // advances the want — no wrapper needed.
      // WANT-AWARE ENGAGEMENT (convo favor system 2026-10-11): the old hook
      // engaged WHATEVER want was live on any answer/reaction — answering an
      // unrelated generic question "engaged" a favor want, which then
      // resolved 'engaged' with no commitment (the false-engagement lie).
      // Now: answers engage only question wants (curious), reactions engage
      // only wants where reacting is the point (share_news, just_company).
      // Favor/comfort/warning wants engage solely through their own menus.
      try {
        if (c.want && (c.want.stage || 0) < 3 && typeof this.convoWantEngage === 'function') {
          const wdef = c.want.def || {};
          if (/^(ans:|gq:)/.test(choiceId || '') && choiceId.indexOf('honest_pass') === -1) {
            if (wdef.answerEngages) this.convoWantEngage(vid, 'engage');
          } else if (/^react:/.test(choiceId || '')) {
            if (wdef.reactEngages) this.convoWantEngage(vid, 'engage');
          } else if (choiceId === 'deflect_q') {
            this.convoWantEngage(vid, 'deflect');
          }
        }
      } catch (e) {}
      // ONE-BEAT TURNS (Steve 2026-10-05): everything after the line queues.
      // MOOD: a band-crossing or guard/grace beat queues behind the line —
      // the continuer reveals their reaction settling in. (convo-mood.js
      // queues into c.heldBeats; never lands mid-turn.)
      try { this.convoMoodFlush(vid); } catch (e) {}

      // extraQ: "Of course. Ask." is the turn's beat; the real question
      // queues behind it — asked is asked only when it's actually asked.
      if (extraQ) {
        c.heldBeats.push({ text: extraQ.q, ask: extraQ });
        c.heldAsk = true;
        c.heldAskDodges = 0;
      }
      // extraLine: the follow-up beat after an answer queues — the thought
      // continues on the continuer, or goes unspoken if the player moves on.
      if (extraLine) {
        c.heldBeats.push({ text: extraLine });
      }

      // DEEP BEATS cost a tick: topic asks, "tell me more", theorizing,
      // trading, teaching, promises, invites, answering personal questions.
      // Small talk (agree, joke, silence, subject-change) is free — you're
      // already here. Graduated cost keeps long conversations affordable.
      if (/^(ask:|more|theorize|trade_yes|teach|offer_help|invite_party|ans:|follow:)/.test(choiceId || '')) {
        this.convoDeepTick(vid);
      }

      // THREAD COHERENCE (Steve 2026-10-06): remember what just happened so
      // the next choice list leads with on-thread options, not a grab-bag.
      // Recorded here — after the whole choice chain, before the final menu
      // is built — so c.thread reflects the post-choice state.
      try { c.lastBeat = this.convoBeatOf(choiceId, c.thread); } catch (e) {}

      // THEY ask YOU things. Conversations go both ways — but they follow
      // the player's lead. A question never stomps a live thread: if the
      // player drove the conversation this turn (ask:/more/theorize/...),
      // the NPC stays with the thread. Questions arrive after small talk,
      // breaths, and thread exhaustion — never as an interrogation pile-on.
      // Never in nonverbal: someone you share no words with does not
      // suddenly ask "Where are you from?" in fluent English. (Leak fix.)
      //
      // COHERENCE: an unanswered direct question LINGERS. If the player
      // dodged it, the NPC follows up once before letting it lapse — the
      // thread is never silently dropped for a random new topic. And a
      // genuinely new question mid-thread gets a narrative bridge, not a
      // hard pivot.
      //
      // PACING: at most 2 questions per conversation, never on the turn
      // right after an answer (let the react breathe), and the first-
      // conversation question waits until the second exchange — the opener
      // and the player's first move set the tone, not an interrogation.
      const droveThread = /^(ask:|more|theorize|react:|trade|teach|offer_help|invite_party)/.test(choiceId || '');
      const justAnswered = /^(ans:)/.test(choiceId || '');
      const forceQ = c.count === 1 && (c.qCount || 0) === 0 && c.exchanges >= 2 && !droveThread && !justAnswered;
      // ONE-BEAT TURNS (Steve 2026-10-05): follow-ups, lapses, and new
      // questions queue behind the turn's line — the continuer reveals them.
      // heldAsk guards against queueing a second question behind one already
      // queued ("Of course. Ask." case above).
      if (c.thread !== 'nonverbal' && !c.pendingQ && !c.heldAsk && c.exchanges >= 1 && !answeredReactive) {
        const rqf = c.reactiveQ && REACTIVE_DEFS[c.reactiveQ.id];
        const gqf = c.genericQ && !answeredGeneric ? c.genericQ : null;
        if (rqf) {
          if (!c.reactiveQ.followedUp) {
            // State marks at queue time (as before); only the showing waits
            // for the continuer.
            c.reactiveQ.followedUp = true;
            c.heldBeats.push({ text: rqf.followUp });
          } else {
            if (rqf.lapse) c.heldBeats.push({ text: rqf.lapse });
            c.reactiveQ = null;
          }
        } else if (gqf) {
          // GENERIC-Q LINGERS: a dodged direct question gets one follow-up,
          // then lapses honestly — the thread is never silently dropped
          // for a random new topic (Rule 3).
          if (!gqf.followedUp) {
            const fup = GQ_FOLLOWUP + ' ' + gqf.q;
            gqf.followedUp = true;
            c.heldBeats.push({ text: fup, genericFollowup: true });
          } else {
            c.heldBeats.push({ text: GQ_LAPSE });
            c.genericQ = null;
          }
        } else if (!droveThread && !justAnswered && !c.windingDown && !(c.heldAskDodges > 0) && (forceQ || ((c.qCount || 0) < 2 && Math.random() < 0.3))) {
          // DODGE GRACE (socialite 2026-10-11): a queued question the player
          // moved past is a declined moment, not an unasked one — don't
          // re-queue a fresh question on the very next turn. The villager got
          // the hint; the winddown gate can open. Next conversation may ask.
          const trust = (this.state.village.trust || {})[vid] || 10;
          const moodNow = this.npcMood(vid);
          const askedAny = this.villageAskedQs();
          const qok = (q) => this.convoQuestionOk(q, trust, moodNow, vid);
          // prefer questions nobody has asked the player yet (unique-person
          // law) — fall back to per-villager-unasked when the pool runs dry.
          let cands = (cg.questions || []).filter(q =>
            c.askedQs.indexOf(q.id) === -1 && askedAny.indexOf(q.id) === -1 && qok(q));
          if (!cands.length) cands = (cg.questions || []).filter(q =>
            c.askedQs.indexOf(q.id) === -1 && qok(q));
          if (cands.length) {
            const qd = cands[Math.floor(Math.random() * cands.length)];
            // BRIDGE: pivoting off a live thread without a breath reads as
            // a non sequitur (the tree-line -> hope-question cut). Name the
            // pivot so the conversation keeps its shape.
            const liveThreads = ['goal', 'past', 'plans', 'village', 'theorize', 'trade',
              'spooked', 'request', 'recall', 'grief', 'cheer', 'small'];
            if (liveThreads.indexOf(c.thread) !== -1) {
              const bridge = this.convoPickCycle(vid, 'qbridge', [
                'A beat. Then, as if shaking something off:',
                'They let that thread drop — for now.',
                'A pause. When they speak again, it\'s about something else entirely.',
                'They glance away, then back. Different subject, same worry:',
              ]);
              c.heldBeats.push({ text: bridge });
            }
            // Asked is asked — but only when it's actually asked: pendingQ,
            // qCount, and askedQs land when the continuer reveals the
            // question, never before the player has seen it. The
            // village-wide note lands at queue time (idempotent) so two
            // back-to-back conversations can't draw the same question.
            try { this.noteAskedQ(qd.id); } catch (e) {}
            c.heldBeats.push({ text: qd.q, ask: qd });
            c.heldAsk = true;
            c.heldAskDodges = 0;
            // The answer and their question stay SEPARATE transcript entries —
            // never mashed into one line. Reading back feels like dialogue.
          }
        }
      }

      // WIND-DOWN (Steve 2026-10-05, one-beat turns): the goodbye beat queues
      // like any other follow-on — the continuer reveals it, and only then
      // does the conversation start ending. It can't be dodged: other held
      // beats die on a new choice, the wind-down stays queued. heldAsk
      // guards: a queued question gets asked before the goodbye.
      // The player can still say goodbye themselves, take one more beat of
      // a live thread, or just leave. Never a silent chop.
      // Shared enforcement — convoMaybeWinddown. The dlg: early-return
      // handlers (convo-dialogue.js) call it too, so the energy budget binds
      // every verb, not just the ones that reach this tail.
      const wdEnd = this.convoMaybeWinddown(vid);
      if (wdEnd) return wdEnd;
      // LEDGER (Steve 2026-10-07): the turn's beat lands on the current
      // thread — topic memory + subject-change detection. (dlg: turns speak
      // through sayLine instead; both collapse consecutive duplicates.)
      // R17 (journey-social 2026-10-15): a no-repeat-blocked turn spoke a
      // fallback (or nothing) — the unspoken primary must not be ledgered
      // as a beat. c._sayFellBack is set by sayLine above.
      try { if (!c._sayFellBack) this.convoNoteBeat(vid, c.thread, line); } catch (e) {}
      return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
    },

    endConvo(vid, how) {
      const c = this.convoGet(vid);
      // BREAK-IT (socialite 2026-10-08): endConvo had no active-convo guard
      // and paid its +3 trust stipend + mood residue on EVERY call. Repeat
      // calls on a dead conversation (or the winddown auto-end followed by
      // the UI's closeChat second call) farmed trust to 100 with no
      // conversation at all. A goodbye is an event: it happens once, for a
      // conversation that actually happened. Same shape as a real end so
      // callers (convoTurn winddown, closeChat) need no changes.
      if (!c || !c.active) {
        return { ended: true, line: null, choices: [], transcript: (c && c.transcript || []).slice(), noop: true };
      }
      // OPEN THREADS (Steve 2026-10-07): leaving mid-thread plants it in the
      // topic ledger — the next conversation can resume it. Must run before
      // c.thread is cleared below.
      try { this.convoPlantOpenThread(vid, how); } catch (e) {}
      // THE WANT RESOLVES (convo rebuild 2026-10-11, Steve): the ending is
      // resolved, planted, or owed — never evaporated. Runs here, in the
      // core flow (not a wrapper): the want's resolve() plants the seed for
      // unfinished business, and the goodbye names the resolution.
      try { this.convoResolveWant(vid, how); } catch (e) {}
      let wantClose = null;
      try { wantClose = this.convoWantCloseLine(vid); } catch (e) {}
      const cg = (this.data.characterGen || {}).convo || {};
      const temp = this.npcTemper(vid);
      const mood = this.npcMood(vid);
      // GOODBYE-ALREADY-SAID (journey-social 2026-10-12 r7): capture before
      // the reset below. When the winddown beat was already spoken, the
      // exit line here would be a SECOND goodbye — the stacked-farewell
      // shape ("should get back to it" + "Right. Go on, then." + dry-line
      // trail-offs). A person says goodbye once.
      const goodbyeSaid = !!c.windingDown;
      c.active = false; c.over = true; c.thread = null; c.pendingQ = null;
      c.reactiveQ = null;
      // UNIFIED TRACKS (2026-10-14): a held conversation (a real exchange,
      // not a hello) is social work — the deed that feeds a villager's social
      // track feeds yours. Per-day capped in the deed table.
      // PARITY (2026-10-14): it was a conversation for both of them — the
      // villager gets the same social deed, and learns of one ability the
      // bearer holds (villager ability knowledge, villager-build.js).
      try {
        if ((c.transcript || []).length >= 4) {
          if (this.noteDeed) this.noteDeed('conversation');
          if (this.creditDeed && vid && vid !== this.villagerId) this.creditDeed(vid, 'conversation');
          if (this.npcLearnFromTalk && vid && vid !== this.villagerId) this.npcLearnFromTalk(vid, 'player');
        }
      } catch (eT) { console.warn('[tracks] convo deed', eT); }
      c.heldBeats = []; c.heldAsk = false; c.winddownQueued = false; c.windingDown = false;
      // INVITATION HONESTY (journey landing r8 2026-10-12): an undecided
      // invite is re-spoken next sitting. inv.spoken meant "the NPC said
      // it" — but a sitting can end without the player deciding (walked
      // away, modal cut, harness policy open/close), and the next sitting's
      // menu then offered accept/decline for an invitation never spoken
      // THERE. The menu quotes the invite label verbatim, so the spoken
      // beat and the menu can never disagree (r7 principle): if the pending
      // survives the sitting, the next sitting speaks it again.
      // Accept/decline consume the pending, so decided invites never
      // re-fire. Repetition reads as insistence, not parrot.
      try {
        const _inv = (this.pendingInvite && this.pendingInvite(vid)) || null;
        if (_inv) _inv.spoken = false;
      } catch (e) {}
      // ENGAGEMENT ENDS (Steve 2026-10-07): the conversation is over — they're
      // free to live again immediately. Without this they stand frozen until
      // the batch-turn lapse (2 batches ≈ 64 ticks) instead of resuming their
      // needs-driven life (fleeing, foraging, seeking people).
      try { if (this.state.village.engaged) delete this.state.village.engaged[vid]; } catch (e) {}
      let line;
      if (goodbyeSaid) {
        // the winddown beat WAS the goodbye — close quietly. The want's
        // closing beat (below) still lands; bookkeeping is untouched.
        line = null;
      } else if (how === 'left') {
        line = this.convoPickCycle(vid, 'leftexit', [
          '"Oh — okay. Later, then."',
          '"Sure. I\'ll be around."',
          '"Right. Go on, then."',
        ]);
      } else {
        const exits = cg.exits || {};
        const key = (mood === 'grieving' || mood === 'scared') ? mood : temp;
        let pool = exits[key] || exits.steady || ['"I should go."'];
        // RELATIONSHIP AGE (Steve 2026-10-06): old friends don't make
        // speeches. Close tier sometimes gets short, warm shorthand —
        // "Later." lands harder than a paragraph when you've talked a
        // hundred times. 50/50 keeps it human: sometimes brief, sometimes
        // the full temperament line. Grieving/scared always get the real
        // goodbye — shorthand would read as cold.
        try {
          if (this.convoVoiceTier && this.convoVoiceTier(vid) === 'close' &&
              mood !== 'grieving' && mood !== 'scared' && Math.random() < 0.5) {
            pool = ['"Later."', '"Good talk."', '"Don\'t be a stranger."',
                    '"See you at the fire."', '"Take care of yourself."'];
          }
        } catch (e) {}
        line = this.convoPickCycle(vid, 'exit', pool);
      }
      try { line = this.convoFillPeople(line); } catch (e) {}
      // GOODBYES ARE GRAMMAR (journey-social r25 2026-10-18): the exit pools
      // (leftexit 3 lines, temperament exits, close-tier shorthand) are
      // closural stage directions, not content — two villagers saying
      // "Later, then." on one day is not parroting. The run-ledger block was
      // turning farewells into dry-line deflections (transcript-caught:
      // "...Actually, forget it." AS the goodbye). Structural exemption,
      // same as the r17 resume/recap beats and the r25 mood-silence turn.
      this.sayLine(vid, line, { structural: true });
      // THE WANT'S CLOSING BEAT (convo rebuild 2026-10-11): the goodbye
      // names the resolution — promised, deflected, comforted, heeded.
      // Resolved/planted/owed, never evaporated.
      if (wantClose) this.sayLine(vid, wantClose);
      // WORDS ONLY GO SO FAR: talk caps at 40. Beyond that, do something real.
      // MOOD LINGERS (convo-mood.js): how the conversation felt sticks to
      // the relationship — ending warm earns a little trust, ending tense
      // costs a little. Small, but felt over many conversations.
      // SCENE (Phase 2): both through the resolver. The talk stipend caps,
      // and so does the mood residue.
      // BREAK-IT (socialite 2026-10-08): the stipend paid +3 even for a
      // zero-exchange hello-goodbye — spam open/close farmed to the 40 talk
      // cap with nothing said. Words must be spoken for words to build
      // trust: the stipend scales with actual exchanges. The residue got a
      // substance gate (c.substantive) the same run — agree-spam + goodbye
      // must not smuggle trust past the cap.
      // KILL (socialite r8 2026-10-09): the residue was talk:false
      // (uncapped) on the theory that it was "felt experience, not words".
      // The hostile player manufactures the feeling with words alone: one
      // cheap topic-ask + two "You're right." + goodbye satisfies the
      // substance gate every time, and the residue harvested trust 40->69
      // over 60 conversations — the exact farm the 40 cap was built to
      // kill. Words are words: the residue obeys the same 40 cap as the
      // stipend. Above 40, trust comes from real acts (food, kept promises,
      // fair deals). Penalties still land whole — a tense ending above 40
      // still costs.
      const stipend = c.exchanges >= 3 ? 3 : (c.exchanges >= 1 ? 1 : 0);
      if (stipend > 0) this.resolveConsequence(vid, { trust: stipend, temper: 'neutral', name: 'endConvo:talk' });
      // TALKED FOR REAL (2026-10-13): a substantive conversation that ran
      // its course is time spent as people — the bond machinery never
      // noticed, so the scholar could talk all season and stay a stranger.
      // Same bar as the mood residue (substantive, 3+ exchanges); walking
      // away mid-thread ('left') earns nothing. +2, under the +6/day cap.
      try {
        if (c.substantive && (c.exchanges || 0) >= 3 && how !== 'left' && this.bondAdd) {
          this.bondAdd(this.villagerId, vid, 2, 'deep talk');
        }
      } catch (e) {}
      // DIPLOMAT XP (socialite r11 2026-10-10): earned by the conversation,
      // not the opening — a hello-goodbye (0 exchanges) teaches nothing.
      // Moved here from startConvo (open/leave XP farm: 35 cycles to L3).
      if (c.exchanges >= 1) { try { this.gainAbilityXP('diplomat', 1); } catch (e) {} }
      const cm = Math.max(-3, Math.min(3, c.mood || 0));
      if (cm !== 0 && c.exchanges >= 3 && c.substantive) this.resolveConsequence(vid, { trust: cm, temper: 'neutral', name: 'endConvo:mood-lingers' });
      try { this.observe('talk', { noTrust: true }); } catch (e) {}
      // PROMISES (socialite r10 2026-10-10): keeping a 'belong'/'understand'
      // promise ('social' kind) requires a REAL conversation — substantive
      // and 3+ exchanges, the same bar as the mood residue. The old
      // unconditional call kept the promise on ANY convo end, so
      // promise -> open/close (hello-goodbye, 10 kcal, 1 tick) farmed +15
      // trust per cycle: measured 10 -> 92 in 10 cycles for 100 kcal, zero
      // real investment. Words don't keep promises; time spent does.
      if (c.substantive && (c.exchanges || 0) >= 3) { try { this.checkPromises('social', vid); } catch (e) {} }
      // BUGFIX (break-it 2026-10-08): `t` was undefined here — every natural
      // conversation end threw ReferenceError, skipping the exit line, mood
      // goodbye, and coherence close-beat. Pass the live trust value.
      this.convoConflictFallout(vid, ((this.state.village || {}).trust || {})[vid]);
      // COHERENCE (Steve 2026-10-07): close out what got closed. A thread
      // that was hanging and got discussed this conversation earns its
      // closing beat at goodbye; a lapsed thread circled back to gets the
      // honest nod, never a fresh-start lie. Close beats take precedence.
      try {
        const closeBeat = (typeof this.convoCloseLine === 'function') ? this.convoCloseLine(vid) : null;
        const lapseBeat = closeBeat ? null : ((typeof this.convoLapseLine === 'function') ? this.convoLapseLine(vid) : null);
        const cbeat = closeBeat || lapseBeat;
        if (cbeat) {
          this.sayLine(vid, cbeat);
        }
      } catch (e) {}
      // (exit line already emitted via sayLine above — single emission point,
      // no second feed write.)
      // MOOD GOODBYE: the parting beat carries the temperature out the door.
      try {
        const mgb = this.convoMoodGoodbye(vid);
        if (mgb) {
          this.sayLine(vid, mgb);
        }
      } catch (e) {}
      return { line, choices: [], ended: true, transcript: c.transcript.slice() };
    },

    convoConflictFallout(vid, newTrust) {
      // OLD WOUNDS: favoritism is noticed. If you're close to one side of a
      // conflict, the other side keeps score — even if you don't know there's
      // a score being kept.
      const day = (this.state.scholar || {}).day || 0;
      for (const cf of (this.state.village.conflicts || [])) {
        if (cf.resolved || (cf.a !== vid && cf.b !== vid)) continue;
        // FAVORITISM NARRATION THROTTLE (social r38 2026-10-21): the -2 cost
        // lands on every qualifying convo end — the game keeps score — but
        // the identical beat was wallpapering the feed (53 servings in 47
        // days on one pilot seed). Narrate on the rising edge (first convo
        // end at/above 50 with this side) and at most once per 7 days after:
        // a reminder, not a loop. Per-side state, so closeness with both
        // parties narrates for each.
        cf._favAbove = cf._favAbove || {};
        cf._favNarrDay = cf._favNarrDay || {};
        if (newTrust >= 50) {
          const other = cf.a === vid ? cf.b : cf.a;
          const ot = this.state.village.trust;
          ot[other] = Math.max(0, (ot[other] || 10) - 2);
          const rising = !cf._favAbove[vid];
          cf._favAbove[vid] = true;
          if (rising || day - (cf._favNarrDay[vid] || 0) >= 7) {
            cf._favNarrDay[vid] = day;
            if (cf.known) this.say(`${this.displayName(other)} saw how close you've gotten to ${this.displayName(vid)}. Old history has long eyes. (-2 trust)`);
            else this.say(`${this.displayName(other)} has been colder to you lately. You don't know why.`);
          }
        } else {
          cf._favAbove[vid] = false;
        }
        // HISTORY UNFOLDS through trust — slowly, partially, maybe never fully.
        // KNOWLEDGE GATE (dialog rebuild 2026-10-11): history strings are
        // templates; {a}/{b} resolve via displayName at render time so no
        // true name leaks before it's earned. (Pre-rebuild saves may carry
        // baked-name strings; those pass through — can't unbake reliably.)
        if (cf.known && cf.kind === 'old_wound') {
          const t = (this.state.village.trust || {})[vid] || 0;
          const fillNames = (s) => String(s).split('{a}').join(this.displayName(cf.a)).split('{b}').join(this.displayName(cf.b));
          if (cf.stage === 0 && t >= 45) {
            cf.stage = 1;
            this.say(`Late, quiet, ${this.displayName(vid)} tells you: "${fillNames(cf.history[1])}"`);
          } else if (cf.stage === 1 && t >= 70) {
            cf.stage = 2;
            this.say(`${this.displayName(vid)} looks away. "${fillNames(cf.history[2])}" That's all you get. Maybe that's all there is.`);
          }
        }
      }
    },

    convoUI(vid) {
      // What the person card needs to render the conversation.
      const c = this.convoGet(vid);
      if (!c.active) return { active: false, transcript: c.transcript.slice(), choices: [], over: c.over };
      const them = c.transcript.filter(t => t.who === 'them');
      return {
        active: true, transcript: c.transcript.slice(),
        choices: this.convoChoices(vid), over: false,
        line: them.length ? them[them.length - 1].text : null,
      };
    },

  };

  Object.assign(Game, methods);
  // SCENE (dialog rethink Phase 2): expose the reactive defs so
  // validateAskContract can gate every question path, not just pendingQ.
  Game.REACTIVE_DEFS = REACTIVE_DEFS;
})();

// ============ REAL FOREIGN LANGUAGES ============
// No shared language means NO shared language. NPCs speak their actual
// tongue — real Italian, real Mandarin, real Spanish. Not gibberish, not
// "[speaks Italian]". You see the words. You don't understand them.
// That's the point. Over time, exposure teaches you: first a word,
// then the shape of sentences, then — earned, never given — you get by.
// Interpreters (bilingual NPCs) bridge the gap humanly. And post-System,
// friction inspires augmentation: the System offers a Translator. It works.
// It's in your head. The translations are... cheerful. Slightly off.
// Tone sold separately.
//
// Self-attaching module: appended to conversation.js, loads before
// journal.js/party.js/truth.js. Overrides startConvo's nonverbal branch,
// the nv: turn handlers, and the nonverbal choices via method replacement.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const methods = {

    // langDef: icon + name for a language id.
    langDef(id) {
      const d = ((this.data.characterGen || {}).languages || []).find(l => l.id === id);
      return d ? { icon: d.icon || '', name: d.name || id } : { icon: '', name: id || 'an unknown tongue' };
    },

    npcNativeLang(vid) {
      const nl = this.npcLangs(vid);
      return (nl && nl.native) || 'english';
    },

    npcEnglishLevel(vid) {
      return (this.levelsOf(this.npcLangs(vid)).english) || 0;
    },

    // foreignLine: one real phrase in their tongue. No-repeat per villager
    // (tracked by object identity — pools are stable data references).
    foreignLine(vid, kind, sub) {
      const lang = this.npcNativeLang(vid);
      const fd = (this.data.foreignSpeech || {})[lang];
      if (!fd) return null;
      const pool = sub ? ((fd[kind] || {})[sub] || []) : (fd[kind] || []);
      if (!pool.length) return null;
      const p = this.convoPickCycle(vid, 'fl:' + lang + ':' + kind + (sub ? ':' + sub : ''), pool);
      return p ? Object.assign({ lang }, p) : null;
    },

    // translatorStage: 0 = no ability. 1 = MEMORY AID (Steve 2026-10-06):
    // the translator starts as a better remembering device — it logs every
    // foreign word you hear and replays them on demand. It does NOT
    // translate novel speech. It helps you learn; it's a study tool, not
    // a replacement. 2 = LIVE TRANSLATE (integration 60+): your extended
    // mind translates live, System biases baked in — cheerful, slightly
    // wrong, misses tone entirely.
    // (Steve 2026-10-06, fiction correction: your brain IS the system.
    // There is no "your brain" vs "the System" — one extended mind. The
    // old "your brain doesn't bother learning" framing is dead.)
    translatorStage() {
      if (!this.state.systemArrived || !this.hasAbility('translator')) return 0;
      return ((this.state.scholar || {}).integration || 0) >= 60 ? 2 : 1;
    },
    // translatorActive: LIVE translate only (stage 2). The memory aid is
    // not "active" in this sense — it helps you learn, never replaces it.
    translatorActive() {
      return this.translatorStage() === 2;
    },
    // mediatedBySystem: live translate is on AND you share no tongue with
    // them. The System gives you the words — the human work doesn't happen.
    mediatedBySystem(vid) {
      try {
        if (this.translatorStage() !== 2) return false;
        const cl = this.commLevel ? this.commLevel(vid) : null;
        return !cl || cl.level === 'none';
      } catch (e) { return false; }
    },
    // translatorStageCheck: journal the stage transitions once each.
    // Called lazily from the language paths — the beats land where the
    // language lives, not in some distant ability-grant handler.
    translatorStageCheck(vid) {
      const s = this.state.scholar || {};
      const now = this.translatorStage();
      const seen = s._translatorStageSeen || 0;
      if (now === seen) return;
      s._translatorStageSeen = now;
      if (seen === 0 && now >= 1) {
        this.say('\u25C8 The translator settles in \u2014 not as a voice, but as a ledger. Every foreign word you hear gets logged, replayable on demand. It will not translate anything new. That part is still on you, and that\u2019s the point.');
        try { this.journalLearn(vid, 'note', 'translator earned: a memory aid, not a shortcut. It logs words; I still have to learn them', {}); } catch (e) {}
      }
      if (seen <= 1 && now === 2) {
        this.say('\u25C8 The translator wakes up all the way. Words arrive in English now \u2014 your extended mind doing the work, cheerful and slightly wrong, missing the tone entirely. You\u2019ll never have to earn a single word again. That\u2019s the trade: the words come free. The person doesn\u2019t.');
        try { this.journalLearn(vid, 'note', 'translator went live at high integration. I understand every word now — and I\u2019m starting to miss the people saying them', {}); } catch (e) {}
      }
    },
    // translatorLogPhrase: the memory aid logs every keyword gloss it sees.
    // scholar.translatorWords[lang] = {word: gloss}. Checked BEFORE logging
    // the current phrase, so novel speech is never translated on first
    // hearing — the device only replays what you\u2019ve already heard.
    translatorLogPhrase(lang, phrase) {
      if (this.translatorStage() < 1 || !phrase || !phrase.kw) return;
      const s = this.state.scholar || {};
      s.translatorWords = s.translatorWords || {};
      const log = s.translatorWords[lang] || (s.translatorWords[lang] = {});
      for (const [w, g] of Object.entries(phrase.kw)) if (!log[w]) log[w] = g;
    },

    // trustGain REMOVED (break-it 2026-10-08): dead method — zero callers.
    // Its mediation-halving logic lives on in convo-scene.js resolveConsequence
    // ("kept from trustGain"), which now also applies trustGainProgressive.
    // Do not re-add a parallel trust conduit; route gains through
    // trustGainProgressive (game.js) instead.
    // langExposure: words of this tongue you've absorbed. 0..25+.
    langExposure(lang) {
      const e = (this.state.scholar || {}).langExposure || {};
      return e[lang] || 0;
    },

    // langExposureGain: listening teaches. Thresholds: 3 (words), 10 (shape
    // of sentences), 25 (you get by — level 1, earned).
    // STAGE EFFECTS (Steve 2026-10-06):
    // - memory aid (1): +1 bonus per gain — the device drills you. It's a
    //   study tool; learning still happens in YOU.
    // - live translate (2): vocabulary still accrues (your extended mind
    //   forgets nothing; "what you lose isn't vocabulary — it's the
    //   person"). The tradeoff is social, not neurological: rapport gains
    //   halve while the System mediates (trustGain), and villagers react
    //   to being heard through the machine.
    langExposureGain(vid, lang, n) {
      try { this.translatorStageCheck(vid); } catch (e) {}
      const s = this.state.scholar || {};
      const def = this.langDef(lang);
      const stage = this.translatorStage();
      if (stage === 2) {
        const f = s._translatorNote || (s._translatorNote = {});
        if (!f[lang]) {
          f[lang] = true;
          this.say(`The ${def.name} comes to you in English now — your extended mind translating live. You understand every word, and miss the person saying them. The System means well. The System always means well. That's the problem.`);
        }
      }
      s.langExposure = s.langExposure || {};
      const before = s.langExposure[lang] || 0;
      const after = before + (n || 1) + (stage === 1 ? 1 : 0);
      s.langExposure[lang] = after;
      if (before < 3 && after >= 3) {
        this.say(`💡 You're starting to catch words in ${def.name}. Not sentences — words.`);
        try { this.journalLearn(vid, 'note', `picking up ${def.name}, a word at a time`, { quiet: true }); } catch (e) {}
      } else if (before < 10 && after >= 10) {
        this.say(`💡 ${def.name} is starting to make sense. You catch the shape of sentences now.`);
        try { this.journalLearn(vid, 'note', `${def.name}: catching whole phrases now`, { quiet: true }); } catch (e) {}
      } else if (before < 25 && after >= 25) {
        s.languages = s.languages || {};
        s.languages[lang] = 1;
        this.say(`💡 You can get by in ${def.name} now. A few dozen words — all earned the hard way. Gestures. Patience. Embarrassment.`);
        try { this.journalLearn(vid, 'note', `can get by in ${def.name} now — learned it live`, {}); } catch (e) {}
        try { this.discover('language'); } catch (e) {}
      }
      return after;
    },

    // speakBack: the player tries their hard-won words on a native speaker.
    // One beat, well-written, not a minigame. THE HEART OF THE HUMAN PATH
    // (Steve 2026-10-06): the villager who teaches you gives you trust,
    // warmth, correction, laughter. The System gives you subtitles.
    // Outcomes scale with exposure; consequences are social only —
    // embarrassment is the currency. Never damage, never hard locks.
    // The villager reacts in their own voice (age band + temperament): a
    // young eager one teaches you on the spot; an elder pretends not to
    // understand to make you try harder.
    speakBack(vid) {
      const c = this.convoGet(vid);
      const lang = this.npcNativeLang(vid);
      const def = this.langDef(lang);
      const exp = this.langExposure(lang);
      const trust = (this.state.village.trust || {})[vid] || 10;
      const temp = this.npcTemper(vid);
      const band = (this.npcAgeBand ? this.npcAgeBand(vid) : 'adult') || 'adult';
      const fname = (this.firstRef ? this.firstRef(vid) : this.displayName(vid)) || 'them';
      const aid = this.translatorStage() === 1;
      c.speakBackDone = true;
      if (!lang || lang === 'english' || exp < 3) {
        return { line: 'The moment passes — you don\u2019t have the words yet.', youSaid: '(the words won\u2019t come)' };
      }
      // What you try: a REAL simple phrase from their tongue. Never
      // gibberish — the phrase is real; it's your DELIVERY that's wrong.
      const fd = (this.data.foreignSpeech || {})[lang] || {};
      const pool = fd.agree || fd.warm || fd.openers || [];
      const ph = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
      const attempt = ph ? ph.t : '...';
      const aidLine = aid ? ' The device replays the phrase in your head first \u2014 a study partner, not a replacement.' : '';
      const gain = (n) => { try { this.langExposureGain(vid, lang, n + (aid ? 1 : 0)); } catch (e) {} };
      try { this.remember(vid, 'spoke_' + lang, 'tried'); } catch (e) {}
      let line, youSaid, jtext;
      if (exp >= 25) {
        // LEVEL: it works. Simple things land. Just two people talking.
        youSaid = `"${attempt}." It comes out right \u2014 a little stiff, a little proud.${aidLine}`;
        const reacts = [
          `${fname} answers in ${def.name}, fast \u2014 then catches themselves, slows down, delighted. You catch most of it. For a minute it\u2019s just two people talking, and the System has nothing to do.`,
          `"WAIT. Say that again!" ${fname} grabs your sleeve. "You SOUND like my grandmother. Say more!" You do. Some of it even lands.`,
        ];
        line = this.convoPick(vid, 'speakback:level', reacts) || reacts[0];
        gain(1);
        // SCENE (Phase 2): speaking their tongue is a real act — resolver, no talk cap.
        this.resolveConsequence(vid, { trust: 3, mood: 1, talk: false, temper: 'kind', name: 'speak_back:level' });
        jtext = `spoke ${def.name} with ${fname} \u2014 it worked. Just two people talking`;
      } else if (exp >= 10) {
        // MID: the shape is right, one word wrong — a funny misunderstanding.
        youSaid = `"${attempt}." The shape is right this time \u2014 but one word veers off somewhere.${aidLine}`;
        const reacts = [
          `${fname} blinks. Then cracks up. "You said that BEAUTIFULLY. It means nothing like what you think it means." They teach you the right word, still laughing.`,
          `"Hm. Almost." ${fname} corrects the one word, gently, like setting a bone. "Again." You say it right. They nod, satisfied with both of you.`,
        ];
        line = this.convoPick(vid, 'speakback:mid', reacts) || reacts[0];
        gain(1);
        // SCENE (Phase 2): resolver, no talk cap (real effort).
        this.resolveConsequence(vid, { trust: 2, mood: 1, talk: false, temper: 'kind', name: 'speak_back:mid' });
        jtext = `tried speaking ${def.name} with ${fname} \u2014 one wrong word, we both laughed`;
      } else {
        // LOW: mostly wrong, charming failure. The correction teaches.
        youSaid = `You try it in ${def.name}: "${attempt}." The tones go sideways halfway through.${aidLine}`;
        let react;
        if (band === 'young' || temp === 'eager') {
          react = `${fname} lights up. "No, no \u2014 like this." They say it slowly, twice, watching your mouth shape it. "${attempt}." You try again. Closer. They grin like you just scored the winning point.`;
        } else if (band === 'elder') {
          react = `${fname} tilts their head. "...What?" You try again, slower, redder. A long beat. Then the smallest smile. "${attempt}," they say \u2014 perfectly. "You meant." They knew all along; they just wanted to watch you work for it.`;
        } else if (temp === 'prickly') {
          react = `${fname} snorts. "That was \u2014 no. Say it like you mean it." They correct you anyway, because even they can\u2019t leave it standing that wrong.`;
        } else {
          react = `${fname} laughs \u2014 with you, mostly. "Good try! Again \u2014 ${attempt}." They walk you through it, patient as sunrise.`;
        }
        line = react;
        gain(2);
        // Endearing if rapport is high, awkward if not. Never punished —
        // awkward is a beat, not a penalty.
        // SCENE (Phase 2): resolver.
        if (trust >= 30) this.resolveConsequence(vid, { trust: 1, mood: 1, talk: false, temper: 'kind', name: 'speak_back:low' });
        jtext = `tried speaking ${def.name} with ${fname} \u2014 mangled it, they corrected me${trust >= 30 ? ' and laughed' : ''}`;
      }
      try { this.journalLearn(vid, 'note', jtext, {}); } catch (e) {}
      return { line, youSaid };
    },

    // langExposureReport: for the journal's LANGUAGES section.
    // "Italian: 12 words — catching phrases."
    langExposureReport() {
      const e = (this.state.scholar || {}).langExposure || {};
      const out = [];
      for (const [id, n] of Object.entries(e)) {
        if (!n) continue;
        const def = this.langDef(id);
        const lvl = ((this.state.scholar || {}).languages || {})[id] || 0;
        const stage = lvl >= 1 ? 'can get by' : n >= 10 ? 'catching phrases' : n >= 3 ? 'catching words' : 'heard a few times';
        out.push({ id, icon: def.icon, name: def.name, n, stage, fluent: lvl >= 1 });
      }
      return out.sort((a, b) => b.n - a.n);
    },

    // renderForeign: what the player SEES. Never auto-translated.
    // Understanding is earned (exposure), borrowed (interpreter), or
    // System-mediated (translator — cheerful, slightly wrong).
    // Returns { text, foreign } for transcript entries.
    renderForeign(vid, phrase) {
      if (!phrase) return null;
      const lang = phrase.lang;
      const c = this.convoGet(vid);
      const t = phrase.t;
      // TRANSLATOR (stage 2): your extended mind, translating live. It takes
      // priority even over a human interpreter — which is exactly what's
      // unsettling about it. Works. Slightly off. Cheerful. Misses tone
      // entirely. (Steve 2026-10-06: this is not a separate System vs your
      // brain — it's your bigger mind, with the System's biases baked in.)
      if (this.translatorActive()) {
        let en = phrase.en;
        if (Math.random() < 0.3) {
          const quips = [
            ' (Family units: IMPORTANT! The audience loves family!)',
            ' (Emotional content: HIGH! Great for ratings!)',
            ' (We think they mean it! Probably!)',
            ' (Such passion! The gamblers are taking notes!)',
          ];
          en += quips[Math.floor(Math.random() * quips.length)];
        }
        return { text: `«${t}» → "${en}"`, foreign: lang };
      }
      // INTERPRETER: a bilingual friend translates, humanly. The pre-System
      // way — and the only way that carries tone, warmth, and trust.
      if (c.interpreter) {
        const iname = this.firstRef(c.interpreter);
        return { text: `«${t}» — ${iname} translates: "${phrase.en}"`, foreign: lang };
      }
      const exp = this.langExposure(lang);
      const def = this.langDef(lang);
      // MEMORY AID (stage 1): no translation of novel speech — but the
      // device replays logged words, even below your own exposure
      // thresholds. The log is read BEFORE this phrase is logged, so a
      // word is only replayed if you've actually heard it before.
      if (this.translatorStage() === 1 && phrase.kw) {
        const wlog = (((this.state.scholar || {}).translatorWords || {})[lang]) || {};
        const known = Object.entries(phrase.kw).filter(([w]) => wlog[w]);
        try { this.translatorLogPhrase(lang, phrase); } catch (e) {}
        if (known.length) {
          const gloss = known.map(([w, g]) => `'${w}' meant '${g}'`).join('; ');
          return { text: `«${t}» (the device replays: ${gloss})`, foreign: lang };
        }
      } else {
        try { this.translatorLogPhrase(lang, phrase); } catch (e) {}
      }
      if (exp >= 10) return { text: `«${t}» (${phrase.en} — you're fairly sure)`, foreign: lang };
      if (exp >= 3) {
        const kws = Object.entries(phrase.kw || {}).slice(0, 2);
        if (kws.length) {
          const gloss = kws.map(([k, v]) => `'${k}' — ${v}`).join(', ');
          return { text: `«${t}» (you catch ${gloss})`, foreign: lang };
        }
      }
      return { text: `«${t}»`, foreign: lang };
    },

    // maybeEnglishFragment: the Mario moment. Zero-English speakers sometimes
    // know a handful of English words — crude, proud, characterful.
    // "Sometimes you get Mario from Italy and all he can say is 'fuck you'."
    maybeEnglishFragment(vid) {
      if (this.npcEnglishLevel(vid) !== 0) return null;
      const c = this.convoGet(vid);
      if (c._fragUsed) return null;
      const fd = (this.data.foreignSpeech || {})[this.npcNativeLang(vid)];
      const pool = (fd && fd.fewWords) || [];
      if (!pool.length || Math.random() > 0.35) return null;
      c._fragUsed = true;
      return pool[Math.floor(Math.random() * pool.length)];
    },

    // findInterpreter: someone nearby who speaks their tongue AND one of yours.
    // Bilinguals are worth their weight in food.
    findInterpreter(vid, targetLang) {
      let here = [];
      try { here = this.npcsOnNode() || []; } catch (e) {}
      const trust = (this.state.village.trust || {});
      for (const oid of here) {
        if (oid === vid) continue;
        const ol = this.levelsOf(this.npcLangs(oid));
        if ((ol[targetLang] || 0) < 1) continue;
        let comm = null;
        try { comm = this.commLevel(oid); } catch (e) {}
        if (!comm || comm.level === 'none') continue;
        if ((trust[oid] || 10) < 10) continue;
        return oid;
      }
      return null;
    },

    // nvOpen: the rewritten no-shared-language opening. The barrier is
    // stated plainly — language named, incomprehension total. Then THEY
    // speak: real words in a real tongue. No English. Not even a little.
    nvOpen(vid) {
      const v = this.state.village;
      const c = this.convoGet(vid);
      const lang = this.npcNativeLang(vid);
      const def = this.langDef(lang);
      c.thread = 'nonverbal'; c.wasNonverbal = true; c.nativeLang = lang;
      c.interpreter = null; c._fragUsed = false;
      // Consume any pending "can we talk" — they approached, but in their tongue.
      const treq = (v.talkRequests || {})[vid];
      if (treq) treq.delivered = true;
      // FRICTION TRACKING: the System notices what you struggle with.
      if (this.state.scholar.week1) this.state.scholar.week1.langStruggle = (this.state.scholar.week1.langStruggle || 0) + 1;
      // THE BARRIER, COMMUNICATED — in the conversation itself, not just the
      // log. Steve's bug was that the barrier was never stated and then the
      // NPC "just started talking". Now the opening line states it plainly,
      // and THEN they speak: real words in a real tongue. No English. Not even a little.
      const first = this.displayName(vid);
      // LIVE TRANSLATE (Steve 2026-10-06): the barrier is one-way now. You
      // hear them in English — your extended mind, cheerful and slightly
      // off. They hear only your English, and understand none of it.
      const barrier = this.translatorStage() === 2
        ? `${first} speaks only ${def.icon} ${def.name}. You hear them in English — your extended mind translating live, cheerful and slightly off. They hear only your English, and understand none of it. Eyes, hands, and patience — one direction only.`
        : `${first} speaks only ${def.icon} ${def.name}. No shared words at all — just eyes, hands, and patience.`;
      this.say(barrier);
      const ph = this.foreignLine(vid, 'openers');
      const r = this.renderForeign(vid, ph);
      let spoken = r ? r.text : 'They speak. You understand none of it.';
      const frag = this.maybeEnglishFragment(vid);
      if (frag) spoken += ` "${frag}" — they grin, proud of the one English they know.`;
      // Transcript: your realization (narration), then their real speech —
      // the speech goes through the single emission point (no-repeat ledger).
      c.transcript.push({ who: 'you', text: `(${barrier})` });
      this.sayLine(vid, spoken, { foreign: lang });
      // SPOKEN LURE, NONVERBAL (journey landing r5 2026-10-12): the verbal
      // path in startConvo speaks a pending invite as a second opener beat,
      // but nonverbal conversations return early and never reach it — the
      // invite surfaced only as English menu labels the NPC never "said",
      // and accepting blind can spring an armed plot. They can't speak it
      // (no English — not even a little), so they SHOW it: one
      // stage-direction beat (narration, not quoted speech — the no-English
      // rule holds), once per pending (inv.spoken), gesturing at the
      // invite's spot. Same guarantee as the verbal path, kept inside the
      // fiction of no shared words.
      let gesture = '';
      try {
        const inv = (this.pendingInvite && this.pendingInvite(vid)) || null;
        if (inv && !inv.spoken) {
          const defs = (this.INVITE_DEFS && this.INVITE_DEFS()) || [];
          const idef = defs.find(d => d.id === inv.defId) || null;
          const spot = (idef && idef.spot) || 'the treeline';
          gesture = '(They mime walking — pointing at themselves, then at you, then toward ' + spot + '. The meaning is unmistakable: come with me.)';
          c.transcript.push({ who: 'you', text: gesture });
          this.say(gesture);
          inv.spoken = true;
        }
      } catch (e) {}
      // The returned opening line carries BOTH — the first thing the player
      // reads states the barrier plainly, then the foreign speech lands.
      const line = `${barrier}\n${spoken}` + (gesture ? '\n' + gesture : '');
      this.langExposureGain(vid, lang, 1);
      return { line, choices: this.convoChoices(vid), transcript: c.transcript.slice(), ended: false };
    },

    // nvRespond: every gesture gets a real answer — in their tongue.
    // Listening is the fastest way to learn. Interpreters bridge humanly.
    nvRespond(vid, kind) {
      const c = this.convoGet(vid);
      const lang = c.nativeLang || this.npcNativeLang(vid);
      // SYSTEM MEDIATION (Steve 2026-10-06): under live translate they can
      // TELL you're hearing them through the machine. Once per conversation,
      // voiced by age and temperament — elders may find it rude, the young
      // find it funny, most find it faintly unsettling. Social, not
      // mechanical: this is the relationship cost, stated in the fiction.
      let mediatedNote = '';
      if (!c._mediatedReacted && this.mediatedBySystem(vid)) {
        c._mediatedReacted = true;
        const mband = (this.npcAgeBand ? this.npcAgeBand(vid) : 'adult') || 'adult';
        const mtemp = this.npcTemper(vid);
        if (mband === 'elder') {
          mediatedNote = ' They notice your eyes unfocus \u2014 listening to something behind their words. "Talk to ME," they sign, irritated, "not through it."';
          // SCENE (Phase 2): rude lands whole, never halved — through the resolver.
          this.resolveConsequence(vid, { trust: -1, temper: 'neutral', name: 'foreign:mediated-rude' }); // rude.
        } else if (mband === 'young') {
          mediatedNote = ' They catch on fast \u2014 you flinch at the wrong moments, hearing the System\u2019s version under their voice. They grin and ham it up for the audience in your head.';
        } else if (mtemp === 'prickly') {
          mediatedNote = ' Something about the way you tilt your head \u2014 hearing them twice, once in their voice and once in the System\u2019s cheerful wrongness. It puts their teeth on edge.';
        } else {
          mediatedNote = ' Something about the way you tilt your head \u2014 hearing them twice, once in their voice and once in the System\u2019s. It unsettles them, a little.';
        }
      }
      if (kind === 'listen') {
        const ph = this.foreignLine(vid, 'questions') || this.foreignLine(vid, 'openers');
        this.langExposureGain(vid, lang, 3);
        const r = this.renderForeign(vid, ph);
        return `You listen hard, watching their mouth shape the words. ${r ? r.text : 'Sounds, and the shape of meaning just out of reach.'}${mediatedNote}`;
      }
      if (kind === 'translate') {
        const yid = c.interpreter;
        if (!yid) return 'No one here can bridge the gap. Gestures will have to do.';
        const ph = this.foreignLine(vid, 'questions') || this.foreignLine(vid, 'openers');
        const r = this.renderForeign(vid, ph);
        // INTERPRETER GRATITUDE (socialite r4 2026-10-09): the old +2 per
        // gesture was a direct write — no resolver, no progressive scaling,
        // no cap — so spamming 'translate' farmed interpreter trust 10->100
        // for free (measured). Thanks is a per-conversation beat, not a
        // per-gesture faucet: once per conversation, a real act (talk:false),
        // progressive like every other gain.
        if (!c._interpThanks) {
          c._interpThanks = true;
          if (typeof this.resolveConsequence === 'function') {
            this.resolveConsequence(yid, { trust: 3, temper: 'kind', talk: false, name: 'foreign:interpreted' });
          } else {
            const yt = this.state.village.trust || (this.state.village.trust = {});
            const cur = yt[yid] === undefined ? 10 : yt[yid];
            yt[yid] = Math.min(100, cur + (typeof this.trustGainProgressive === 'function' ? this.trustGainProgressive(yid, 3) : 3));
          }
        }
        return (r ? r.text : 'They speak; the translation falters.') + mediatedNote;
      }
      const reactKind = { nod: 'agree', smile: 'warm', pointself: 'warm' }[kind] || 'agree';
      const ph = this.foreignLine(vid, reactKind);
      this.langExposureGain(vid, lang, 1);
      // SCENE (Phase 2): through the resolver.
      this.resolveConsequence(vid, { trust: 1, temper: 'kind', name: 'foreign:react' });
      const r = this.renderForeign(vid, ph);
      const narr = {
        nod: 'They nod back, slowly.',
        smile: 'A grin breaks through, quick and warm.',
        pointself: 'You tap your chest, then theirs. Us. They nod, emphatic.',
      }[kind] || 'You gesture.';
      const frag = this.maybeEnglishFragment(vid);
      return `${r ? r.text : 'They answer at length.'} ${narr}${frag ? ` "${frag}"` : ''}${mediatedNote}`;
    },

    // nvEndLine: gesture exits. No fluent English goodbyes from someone
    // you share no words with. (Steve's leak, fixed.)
    nvEndLine(vid) {
      return this.convoPickCycle(vid, 'nvexit', [
        'They press their palms together — thanks, or goodbye, or both. Then turn back to their own thoughts.',
        'A final nod. They touch their chest, then point at you — a promise without words.',
        'They wave you off gently, already turning away. The conversation ends where language couldn\'t reach.',
      ]);
    },
  };

  Object.assign(Game, methods);

  // ---- Overrides: fix the leaks, rewire the nonverbal path ----
  // These run at load (conversation.js loads before truth.js), wrapping the
  // base methods defined above in this same file.

  // 1. startConvo: route 'none' through nvOpen.
  const _startConvo = Game.startConvo;
  Game.startConvo = function (vid) {
    const c = this.convoGet(vid);
    // reset nonverbal state every conversation
    c.wasNonverbal = false; c.nativeLang = null; c.interpreter = null;
    const st = _startConvo.call(this, vid);
    // _startConvo already handled the 'none' branch inline; if it took the
    // OLD path (shouldn't happen after our edit below), leave it.
    return st;
  };

  // 2. convoTurn: nv: kinds route through nvRespond (real foreign answers).
  const _convoTurn = Game.convoTurn;
  Game.convoTurn = function (vid, choiceId) {
    if (typeof choiceId === 'string' && choiceId.indexOf('nv:') === 0) {
      const c = this.convoGet(vid);
      if (!c.active) return null;
      if (choiceId === 'leave') return this.endConvo(vid, 'left');
      // NV WINDDOWN DELIVERY (journey-scale r19 2026-10-21): the budget-landing
      // winddown beat queues in heldBeats, but the nonverbal thread offers no
      // 'goon' continuer (convoChoices excludes it for nonverbal), so the beat
      // sat queued forever and gesture-spam looped without end — the winddown
      // machinery was dead on this path. Surface it here: the turn after
      // queueing speaks the gesture beat and arms windingDown; the next
      // gesture ends the conversation naturally. Wind-down, not a chop.
      const wdi = (c.heldBeats || []).findIndex(h => h && h.winddown);
      if (wdi >= 0 && !c.windingDown) {
        const wb = c.heldBeats.splice(wdi, 1)[0];
        c.windingDown = true;
        c.transcript.push({ who: 'you', text: '(gesture)' });
        // R35 (journey-landing): sayLine records its own them-line in the
        // transcript (possibly paginated into chunks) and returns null only
        // when nothing was recorded (empty/blocked) — pushing a second copy
        // here double-recorded the winddown beat (transcript-caught as a
        // verbatim repeat in the wild, seed 202 day 2). Push the fallback
        // text only when sayLine recorded nothing.
        const said = this.sayLine(vid, wb.text, { foreign: wb.foreign || c.nativeLang || this.npcNativeLang(vid) });
        const wline = said || wb.text;
        if (!said) c.transcript.push({ who: 'them', text: wline });
        c.exchanges++;
        return { line: wline, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
      }
      const kind = choiceId.slice(3);
      const line = this.nvRespond(vid, kind);
      c.transcript.push({ who: 'you', text: '(gesture)' });
      this.sayLine(vid, line, { foreign: c.nativeLang || this.npcNativeLang(vid) });
      c.exchanges++;
      // No they-ask-you in nonverbal. Ever. (The leak Steve reported.)
      // Wind-down, not a chop: the budget landing gets a gesture beat first,
      // same as the verbal path. ONE-BEAT TURNS (Steve 2026-10-05): queued —
      // the gestural continuer reveals it.
      if (!c.pendingQ && c.exchanges >= c.budget) {
        if (!c.windingDown && !c.winddownQueued) {
          c.winddownQueued = true;
          const wd = this.convoPickCycle(vid, 'nvwinddown', [
            'Their gestures slow — the conversation thinning like light at dusk.',
            'They glance toward their own thoughts; the exchange is winding down.',
            'A final shared look — you both feel the talk running its course.',
          ]);
          c.heldBeats.push({ text: wd, winddown: true, foreign: c.nativeLang || this.npcNativeLang(vid) });
        } else if (c.windingDown) {
          return this.endConvo(vid, 'natural');
        }
      }
      return { line, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };
    }
    return _convoTurn.call(this, vid, choiceId);
  };

  // 3. endConvo: gesture exits for nonverbal conversations.
  // wasNonverbal is deliberately NOT cleared here (startConvo clears it):
  // a redundant endConvo on an already-over nonverbal chat still exits
  // with a gesture, never a sudden English "I should go."
  const _endConvo = Game.endConvo;
  Game.endConvo = function (vid, how) {
    const c = this.convoGet(vid);
    const wasNV = c.wasNonverbal || c.thread === 'nonverbal';
    const r = _endConvo.call(this, vid, how);
    if (wasNV && r) {
      const line = this.nvEndLine(vid);
      const tr = (r.transcript || []).slice();
      if (tr.length) tr[tr.length - 1] = { who: 'them', text: line, foreign: c.nativeLang || undefined };
      // LEDGER SYNC (convo rebuild 2026-10-11): the transcript's last entry
      // was swapped for the gesture line — the no-repeat ledger follows it,
      // so the verbal exit it replaced can't leak back in as a "fresh" beat.
      try {
        const sl = c.saidLines || [];
        if (sl.length) sl[sl.length - 1] = String(line).trim();
      } catch (e) {}
      r.line = line;
      r.transcript = tr;
    }
    return r;
  };
})();
