function longestBacktickRun(text) {
  const runs = text.match(/`+/g);
  return runs ? Math.max(...runs.map((run) => run.length)) : 0;
}
function codeFence(content) {
  return "`".repeat(Math.max(3, longestBacktickRun(content) + 1));
}
export {
  codeFence
};
