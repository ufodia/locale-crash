# User guide

## Understand the demonstration

The initial report comes from a deliberately naive local parser. It removes commas from every amount, assumes month-first dates, uses default Unicode case conversion, and only notices the English phrase `Do not`. These defects are explicit and reproducible. They are not measurements of a language model.

Select **Run reference parser** to compare with code that uses the fixture's declared locale. Every built-in case should pass. The parser implementations are independent of the expected objects: they parse the input or apply locale-sensitive casing.

## Inspect one difference

1. Select **Numbers & amounts** in the case library.
2. Run **Show naive failures** and filter to **Failed only**.
3. Open `numbers-01-tr`.
4. Compare the expected `1234.5` with the naive parser's `1.2345`.
5. Enter `{"amount":1234.5}` in **Your response** and select **Check this response**.

The report becomes a manual response check. Existing evaluated answers remain present; the edited case is rescored. The inspector displays whether every required field matches.

## Import an actual run

Use **Export prompt pack** and feed its prompts to your own harness. Keep each `caseId`. Store the parsed output object in the response format described in [formats](formats.md). Import the file with **Import model outputs**. Files must be UTF-8 JSON, smaller than 2 MB, and contain no duplicate or unknown IDs.

The label in your response file is displayed as supplied. Include a meaningful model/run label for your own records, but never include credentials. The app does not attest that a named model produced the file.

## Custom cases

Select **Add a custom case**, choose a category and locale, provide the raw input, and supply an expected object with scalar string, number, or boolean fields. Casing cases also use the selected upper/lower operation. The new case starts as missing. Use its inspector to enter a response or export a fresh template for your harness.

The built-in parser only supports its documented grammar. A custom case outside that grammar returns a reference-parser error object; this is scored as an ordinary response against your expectation. Custom prompts include field names/types, not expected values. The generic custom prompt may need a clearer task instruction in your external harness.

## Retain your work

Use **Report JSON** or **Report CSV** before closing. Reports include expected and actual values; remove private inputs before sharing them. Export the prompt pack for custom prompts and the response template for their IDs. There is no automatic persistence or custom-fixture import in this version. For reusable custom suites in the CLI, add reviewed fixtures to `src/fixtures.ts`.

## Troubleshooting

| Problem | Next step |
| --- | --- |
| Import says unknown ID | Use a fresh template from the same fixture suite, or add the custom case before importing |
| Import says repeated ID | Keep only one response per case |
| Correct-looking answer fails | Check JSON types, extra fields, decimal values, and exact Unicode characters |
| CLI exits with code 2 | Inspect failures and missing cases; this is an evaluation result, not a crash |
| A date is rejected | Use exactly `MM/DD/YYYY` or `DD.MM.YYYY` and a valid calendar date |
| Local port is occupied | Open the alternative local URL Vite prints or run with `--port 5174` |
