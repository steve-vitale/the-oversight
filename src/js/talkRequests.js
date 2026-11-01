// @ontology
// system: talkRequests
// description: Versioned reasons for NPC-initiated conversations. The saved request owns its subject, replies and accepted outcome; legacy missing context stays unknown.
// provides:
//   - prepareTalkRequest(vid)
//   - talkRequestNeedsReply(vid, record)
//   - activeTalkRequest(vid)
//   - talkRequestChoices(vid)
//   - talkRequestTurn(vid, choice)
// rules:
//   - backing_request: request replies require the same live request and bearer (code: activeTalkRequest, talkRequestTurn)
//   - no_phantom_work: choosing to plan work opens actual assignment controls and assigns nothing by itself (code: talkRequestTurn)
//   - honest_legacy: absent old gossip details cannot become a specific accusation (code: talkRequestTurn)
(function () {
  'use strict';
  const G = globalThis.Scattering.Game;
  const definitions = game => game.data.characterGen?.convo?.requestContracts || {};
  const owned = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const current = (game, vid) => game.state.village.conv?.[vid];
  function usable(game, vid, request) {
    return request?.version === 1 && owned(definitions(game), request.kind) &&
      request.requesterId === vid && vid !== game.villagerId && (game.state.village.roster || []).includes(vid) &&
      !(Number.isFinite(game.state.village.health?.[vid]) && game.state.village.health[vid] <= 0) &&
      request.bearerId === game.villagerId && !request.answered;
  }
  function identifyLegacy(game, vid, record) {
    const line = String(record.line || '').replace(/ \(Talk to .*?\.\)$/, '');
    return Object.entries(definitions(game)).find(([, def]) =>
      line === def.legacyLine || line === game.renderTalkLine(def.legacyLine, vid))?.[0] || null;
  }
  G.prepareTalkRequest = function (vid) {
    const record = this.state.village.talkRequests?.[vid];
    if (!record) return null;
    const c = current(this, vid) || this.convoGet(vid);
    if (!record.request) {
      const kind = identifyLegacy(this, vid, record);
      // Delivered old requests may have been answered. Only a still-hanging
      // question on that request establishes an unfinished legacy decision.
      const pending = c.thread === 'request' && c.genericQ && String(record.line).includes(c.genericQ.q);
      if (!kind || (record.delivered && !pending)) return null;
      const made = this.makeTalkRequest(vid, kind);
      if (!made) return null;
      record.request = { ...made.request, legacy: true, createdDay: record.day ?? this.state.scholar.day,
        id: [this.state.runKey, this.villagerId, vid, record.day ?? this.state.scholar.day, kind, 'legacy'].join(':') };
    }
    const request = record.request;
    if (!usable(this, vid, request)) return null;
    c.talkRequestId = request.id;
    if (c.thread === 'request' && c.genericQ && String(record.line).includes(c.genericQ.q)) c.genericQ = null;
    return request;
  };
  G.talkRequestNeedsReply = function (vid, record) {
    return usable(this, vid, record?.request);
  };
  G.activeTalkRequest = function (vid) {
    const c = current(this, vid), record = this.state.village.talkRequests?.[vid], request = record?.request;
    if (this.over || !c?.active || c.over || c.thread !== 'request' || c.windingDown ||
        c.pendingQ || c.reactiveQ || c.pendingTrade || c.pendingHawk ||
        !usable(this, vid, request) || c.talkRequestId !== request.id) return null;
    return request;
  };
  G.talkRequestChoices = function (vid) {
    const request = this.activeTalkRequest(vid);
    if (!request) return null;
    const c = current(this, vid), def = definitions(this)[request.kind];
    const replies = def[request.phase] || [];
    const choices = replies.map(reply => ({ id: 'request:' + request.id + ':' + request.phase + ':' + reply.id,
      label: reply.label, intent: reply.op }));
    choices.push({ id: 'silence', label: '"..."' }, { id: 'leave', label: '"I should go."' });
    c.offeredReplies = Object.fromEntries(choices.map(choice => [choice.id, choice.label]));
    c.menuPage = 0; c.menuPages = 1;
    return choices;
  };
  G.talkRequestTurn = function (vid, choice) {
    const request = this.activeTalkRequest(vid), c = current(this, vid);
    if (!request) return c?.active ? { line: null, navigation: true, requestDecision: false,
      choices: Object.entries(c.offeredReplies || {}).map(([id, label]) => ({id, label})),
      ended: false, transcript: c.transcript.slice() } : null;
    const def = definitions(this)[request.kind], phase = request.phase;
    const reply = ['leave', 'silence'].includes(choice) && c.offeredReplies?.[choice]
      ? { id: choice, label: c.offeredReplies[choice], op: 'pause', response: '"Another time, then."' }
      : (def[phase] || []).find(r => choice === 'request:' + request.id + ':' + phase + ':' + r.id);
    if (!reply || c.offeredReplies?.[choice] !== reply.label) return {
      line: null, navigation: true, requestDecision: false, choices: this.talkRequestChoices(vid),
      ended: false, transcript: c.transcript.slice() };
    if (['past', 'supplies', 'morale'].includes(reply.op)) {
      // Reuse the complete existing topic verb: learning, exact offered words,
      // consequences, narration and follow-up ownership all belong to it.
      const answered = reply.op !== 'supplies', topic = reply.op === 'past' ? 'past' : 'village';
      request.phase = answered ? 'answered' : 'detail'; request.answered = answered;
      request.reply = { id: reply.id, op: reply.op, day: this.state.scholar.day };
      c.offeredReplies['ask:' + topic] = reply.label;
      const result = turn.call(this, vid, 'ask:' + topic);
      if (!answered && !result?.ended) { c.thread = 'request'; c.choosingSubject = false; }
      return result && { ...result, choices: result.ended ? [] : this.convoChoices(vid), requestDecision: true,
        requestOutcome: { requestId: request.id, kind: request.kind, operation: reply.op, answered, paused: false } };
    }
    let line = reply.response || null, navigation = null, close = false;
    let answered = true, paused = false;
    if (reply.op === 'concern') {
      const context = request.context;
      if (context?.subjectId === this.villagerId && context.epistemic === 'opinion' && context.claim) {
        line = def.detailLine.replaceAll('{claim}', context.claim); answered = false;
      } else line = def.unknown;
    } else if (reply.op === 'detail' || reply.op === 'space-detail') {
      answered = false;
    } else if (reply.op === 'assign') {
      navigation = { kind: 'assign', vid }; close = true;
    } else if (reply.op === 'close') close = true;
    else if (reply.op === 'pause') { close = true; answered = false; paused = true; }
    else if (reply.op !== 'answer') throw new Error('Unknown talk request operation: ' + reply.op);
    if (!line) throw new Error('Talk request produced no accepted response: ' + request.kind + '/' + reply.id);
    c.transcript.push({ who: 'you', text: reply.label });
    c.exchanges++;
    if (reply.op !== 'pause' && reply.id !== 'decline') c.substantive = true;
    if (reply.trust) this.resolveConsequence(vid, {trust: reply.trust, temper:'neutral',name:'request:' + request.kind + ':' + reply.id});
    request.phase = paused ? phase : answered ? 'answered' : 'detail'; request.answered = answered;
    request.reply = { id: reply.id, op: reply.op, day: this.state.scholar.day };
    if (!answered && !close) c.thread = 'request';
    else if (c.thread === 'request') { c.thread = 'small'; c.choosingSubject = true; }
    this.sayLine(vid, line, { structural: true, tag: close ? 'request-close' : 'request' });
    // A refusal/actual story is allowed to ask a new question, but only
    // after the request's own decision has completed.
    if (answered && !close && !c.pendingQ && !c.reactiveQ) {
      const reactive = this.convoMatchReactive(line);
      if (reactive) c.reactiveQ = { id: reactive.id, followedUp: false };
      else this.convoGenericQ(vid, line);
    }
    let ending = null;
    if (close) ending = this.endConvo(vid, 'request-complete');
    else if (answered) ending = this.convoMaybeWinddown(vid);
    return { ...(ending || {}), line, ended: !!ending?.ended, choices: ending?.ended ? [] : this.convoChoices(vid),
      transcript: c.transcript.slice(), requestDecision: true,
      requestOutcome: { requestId: request.id, kind: request.kind, operation: reply.op, answered, paused },
      ...(navigation ? { requestNavigation: navigation } : {}) };
  };
  const end = G.endConvo;
  G.endConvo = function (vid, ...args) {
    // Continue deliberately settles an open chat. Capture an unanswered old
    // request before that normal settlement clears its transient question.
    if (current(this, vid)?.active) this.prepareTalkRequest(vid);
    return end.call(this, vid, ...args);
  };
  const start = G.startConvo;
  G.startConvo = function (vid, ...args) {
    // Migration happens on an actual conversation start, before the original
    // chain resets transient questions. It never reconstructs missing facts.
    this.prepareTalkRequest(vid);
    const result = start.call(this, vid, ...args);
    if (this.activeTalkRequest(vid) && result && !result.ended) result.choices = this.talkRequestChoices(vid);
    return result;
  };
  for (const name of ['convoChoices', 'buildMenu', 'convoMenuPage']) {
    const original = G[name];
    G[name] = function (vid, ...args) {
      const c = current(this, vid);
      if (c?.active && c.thread === 'request') this.prepareTalkRequest(vid);
      return this.talkRequestChoices(vid) || original.call(this, vid, ...args);
    };
  }
  const generic = G.convoGenericQ;
  G.convoGenericQ = function (vid, ...args) {
    return this.activeTalkRequest(vid) ? null : generic.call(this, vid, ...args);
  };
  const villageIntent = G.convoVillageQuestionIntent;
  G.convoVillageQuestionIntent = function (label) {
    const intent = villageIntent.call(this, label);
    if (intent && intent !== 'unknown') return intent;
    for (const def of Object.values(definitions(this))) for (const phase of ['start', 'detail'])
      for (const reply of def[phase] || []) if (reply.label === label && ['supplies', 'morale'].includes(reply.op)) return reply.op;
    return intent;
  };
  const turn = G.convoTurn;
  G.convoTurn = function (vid, choice, ...args) {
    const request = this.activeTalkRequest(vid);
    if (String(choice).startsWith('request:')) return this.talkRequestTurn(vid, choice);
    if (request && ['leave', 'silence'].includes(choice)) return this.talkRequestTurn(vid, choice);
    if (request && !['leave', 'silence', 'menu:more'].includes(choice)) return this.talkRequestTurn(vid, choice);
    return turn.call(this, vid, choice, ...args);
  };
})();
