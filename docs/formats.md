# File formats

## Prompt pack: `locale-crash/prompts/1`

The browser's **Export prompt pack** and `npm run fixtures` produce an object containing `format` and `cases`. Each entry has:

| Field | Meaning |
| --- | --- |
| `caseId` | Stable response-matching ID |
| `pair` | Related English/Turkish case group |
| `locale` | `en-US` or `tr-TR` |
| `category` | `numbers`, `dates`, `casing`, or `negation` |
| `prompt` | Instruction text to send to your harness |
| `outputFields` | Required property names and scalar types |

Expected values are omitted. `npm run fixtures -- --include-expected` instead exports the full reviewed fixtures as `locale-crash/fixtures/1`; use this only for development and inspection.

## Responses: `locale-crash/responses/1`

```json
{
  "format": "locale-crash/responses/1",
  "label": "My agent run",
  "responses": [
    { "caseId": "numbers-01-tr", "output": { "amount": 1234.5 } }
  ]
}
```

`label` must contain 1–200 characters. `responses` can contain up to 10,000 entries, but every ID must be known and unique. Each entry needs an `output` property. A response may contain any bounded JSON value; a value that is not the expected object fails rather than being rejected at file-import time. Numbers must be finite. Each output is limited to 20,000 JSON values and 32 nesting levels so comparison, display, and export remain safe. These limits also apply to the manual response editor.

The browser limits files to 2,000,000 bytes. The parser also limits the serialized text to 2,000,000 JavaScript characters. Empty response lists are valid and score every case as missing. Unknown top-level fields are ignored.

## Report: `locale-crash/report/1`

A report contains `label`, `total`, `passed`, `failed`, `missing`, `pairFailures`, and `results`. Each result records `caseId`, `pair`, `category`, `locale`, `status`, `expected`, `actual`, and `differences`.

- A missing answer has status `missing` and `actual: null`.
- An explicitly supplied `null` has status `failed`; the response exists but is not the expected object.
- Object key order is ignored.
- Required values and types must match exactly. Extra keys fail.
- `pairFailures` counts distinct pair IDs with at least one failed case. Missing-only pairs are not counted as failed pairs.

CSV reports use CRLF rows and quoted fields; embedded quotes are escaped. Cells beginning with a spreadsheet formula character (optionally after control characters or spaces) receive a leading apostrophe. Expected and actual objects are serialized as JSON in their respective cells. Reports are exports, not response-file imports.

## Custom cases

The UI accepts category, locale, raw input (1–5,000 characters), expected JSON, and a casing operation. Expected JSON is limited to 100,000 characters and must be an object with 1–20 scalar string/finite-number/boolean values. Each string is limited to 5,000 characters; arrays, nulls, and nested objects are not accepted for custom expected outputs. Custom IDs are generated for the current session and must be recreated before importing their responses.
