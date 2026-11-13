# Architecture and API

```text
Reviewed paired fixtures ───→ Prompt export ───→ Your external harness
         │                                           │
         ▼                                           ▼
 Reference / naive parser                       Response JSON
         │                                           │
         └────────────────→ Exact scorer ←──── Format validation
                                  │
                           UI / JSON / CSV / CLI
```

## Source layout

- `src/fixtures.ts`: 36 paired cases, literal expected answers, and category/locale types.
- `src/engine.ts`: independent locale parsers, naive baseline, exact scoring, import validation, custom-case validation, CSV serialization.
- `src/main.ts`: DOM interface, filters, inspectors, in-memory custom cases, and file handling. Imported content uses text nodes, not HTML interpolation.
- `cli/score.ts`: scores response files or runs a built-in parser.
- `cli/fixtures.ts`: exports prompts or full development fixtures.

## Reference parser contracts

`parseNumber(input, locale)` validates optional negative signs, decimal separators, and three-digit grouping. It rejects trailing junk, malformed groups, nonfinite values, and values outside JavaScript's safe integer magnitude. It uses JavaScript numbers; decimal arithmetic precision is not guaranteed for arbitrary financial calculations.

`parseDate(input, locale)` accepts exactly two-digit month/day components and a four-digit year from 1000–9999. `en-US` uses slashes and month-first order; `tr-TR` uses dots and day-first order. Calendar validation rejects impossible dates without time-zone conversion.

`parseCommand(input, locale)` handles finite, explicit command forms. English accepts `Do not <verb> the <object>` and `<verb> the <object>` for send, delete, publish, share, upload, cancel, and invite. Turkish recognizes the corresponding positive/negative imperative endings. This suffix matcher does not understand arbitrary context, quoted speech, conditional permissions, or every Turkish morphological form.

`reference(case)` dispatches to those parsers or locale-sensitive `toLocaleUpperCase` / `toLocaleLowerCase`. It does not read `expected`. `naive(case)` deliberately uses locale-unsafe number/date/casing operations and English-only negation detection to demonstrate bugs.

## Scoring API

```ts
import { parseResponses, score } from './src/engine.ts';

const responses = parseResponses(JSON.stringify({
  format: 'locale-crash/responses/1',
  label: 'One imported answer',
  responses: [{ caseId: 'numbers-01-tr', output: { amount: 1234.5 } }]
}));
const report = score(responses);
console.log(report.passed, report.missing); // 1, 71
```

`score(responses, fixtures?)` compares against the supplied fixture array, defaulting to the built-in suite. The browser and CLI validate external responses with `parseResponses(text, fixtures?)` first. Direct API callers should also validate untrusted data. `runBuiltin('reference' | 'naive', fixtures?)` catches unsupported reference-grammar inputs and emits an error object for ordinary exact scoring.

`csv(report)` exports a report; `validateCustom(input, id)` checks the UI's custom-case contract. These modules are source-level APIs; this repository does not publish an npm package.

## Reproducible setup

Clone GitHub `main`, install Node.js 24, run `npm ci`, then type checking, tests, and the build. No database, secret, private account, or external API is required. Generated `dist/` and installed dependencies are ignored and can be restored from the lockfile.
