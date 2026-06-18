// i18n guards: (1) th.json and en.json must have IDENTICAL deep key sets —
// a key in one locale only renders as a raw message path for half the
// users; (2) no duplicate sibling keys — JSON.parse silently last-wins,
// which shadowed DocumentForm.errors during Phase 7 development.
// Run: node scripts/check-i18n-parity.mjs
import { readFileSync } from "node:fs";

let failures = 0;

function leafPaths(obj, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") out.push(...leafPaths(v, p));
    else out.push(p);
  }
  return out;
}

// Duplicate-sibling-key scan: tokenize just enough JSON (strings, braces)
// to track the object path and spot repeated keys at the same level.
function findDuplicateKeys(raw, file) {
  const stack = [new Set()];
  const path = [];
  let i = 0;
  let pendingKey = null;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"') {
      let j = i + 1;
      let s = "";
      while (j < raw.length && raw[j] !== '"') {
        if (raw[j] === "\\") {
          s += raw[j] + raw[j + 1];
          j += 2;
        } else {
          s += raw[j];
          j++;
        }
      }
      // Is this string a KEY? Look ahead for a colon.
      let k = j + 1;
      while (k < raw.length && /\s/.test(raw[k])) k++;
      if (raw[k] === ":") {
        const level = stack[stack.length - 1];
        if (level.has(s)) {
          console.log(
            `DUPLICATE [${file}] ${[...path, s].join(".")} — second occurrence silently wins`,
          );
          failures++;
        }
        level.add(s);
        pendingKey = s;
      }
      i = j + 1;
      continue;
    }
    if (ch === "{") {
      stack.push(new Set());
      path.push(pendingKey ?? "?");
      pendingKey = null;
    } else if (ch === "}") {
      stack.pop();
      path.pop();
    }
    i++;
  }
}

const enRaw = readFileSync("messages/en.json", "utf8");
const thRaw = readFileSync("messages/th.json", "utf8");
findDuplicateKeys(enRaw, "en");
findDuplicateKeys(thRaw, "th");

const en = new Set(leafPaths(JSON.parse(enRaw)));
const th = new Set(leafPaths(JSON.parse(thRaw)));
for (const k of en) {
  if (!th.has(k)) {
    console.log(`MISSING [th] ${k}`);
    failures++;
  }
}
for (const k of th) {
  if (!en.has(k)) {
    console.log(`MISSING [en] ${k}`);
    failures++;
  }
}

console.log(
  failures === 0
    ? `ok — ${en.size} keys, parity + no duplicates`
    : `${failures} problem(s)`,
);
process.exit(failures === 0 ? 0 : 1);
