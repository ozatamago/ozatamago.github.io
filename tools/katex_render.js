// Render TeX to HTML for tools/build.py.
// stdin: JSON list of TeX strings (inline math); stdout: JSON list of HTML strings.
const katex = require("katex");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const out = JSON.parse(input).map((tex) => katex.renderToString(tex, { throwOnError: true }));
  process.stdout.write(JSON.stringify(out));
});
