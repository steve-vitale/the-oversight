'use strict';
// CDP may discard a response body on navigation. Keep every capture in the
// boundary transaction so a caller can drain it before reload/snapshot/close.
function createResponseCapture(page, capture, report, { timeoutMs = 30000 } = {}) {
  const pending = new Set(), reportFailures = [];
  page.on('response', response => {
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Response body capture timed out after ' + timeoutMs + 'ms')), timeoutMs);
    });
    const task = Promise.race([Promise.resolve().then(() => capture(response)), deadline])
      .then(value => { clearTimeout(timer); return value; }, error => { clearTimeout(timer); throw error; })
      .catch(error => report(error, response))
      .catch(error => { reportFailures.push(error); });
    pending.add(task);
    task.then(() => pending.delete(task), () => pending.delete(task));
  });
  return {
    async drain() {
      while (pending.size) await Promise.all([...pending]);
      if (reportFailures.length) throw reportFailures[0];
    },
  };
}
module.exports = { createResponseCapture };
