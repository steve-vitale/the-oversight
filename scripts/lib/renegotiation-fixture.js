'use strict';

// Call-through receipts for prepared succession proofs. Observe the actual
// resolver boundary, not net trust after an entire policy day.
function watchRenegotiation(Game) {
  const resolve = Game._resolveRenegotiation, answer = Game.answerRenegotiation;
  const events = [], answers = [];
  Game._resolveRenegotiation = function (link, proposal, chosen) {
    const before = link.trust, day = this.state.scholar.day;
    const result = resolve.apply(this, arguments);
    events.push({ id: link.id, day, age: day - (proposal.day || 0), chosen,
      before, after: link.trust, delta: link.trust - before, result });
    return result;
  };
  Game.answerRenegotiation = function (id, how) {
    answers.push({ id, how, day: this.state.scholar.day });
    return answer.apply(this, arguments);
  };
  return { events, answers, restore() {
    Game._resolveRenegotiation = resolve; Game.answerRenegotiation = answer;
  } };
}

module.exports = { watchRenegotiation };
