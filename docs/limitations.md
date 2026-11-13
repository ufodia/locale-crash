# Limitations

## What a result means

The suite measures exact agreement on a small set of explicit structured tasks. It does not establish overall intelligence, translation quality, fairness, reliability, safety, or performance in a real application. Do not turn its pass counts into a general model leaderboard.

The built-in naive parser is intentionally wrong in known ways. The reference parser is a finite local implementation. Neither result is an LLM benchmark. Imported model labels are supplied by the user and are not independently attested.

## Fixture scope

There are 36 English/Turkish pairs and 72 individual cases. Inputs are synthetic. Casing pairs intentionally have different expected strings where Unicode locale rules require them. Other pairs target the same underlying amount, date, or permission. The suite does not cover every locale, language, dialect, calendar, command form, currency, or time-zone convention.

Strict JSON equality is intentional: additional fields fail, numeric strings fail numeric expectations, and Unicode distinctions remain meaningful. There is no semantic judge, fuzzy matching, partial credit, or confidence estimate.

## Parser scope

The command parser recognizes explicit finite templates, not arbitrary natural language. Custom prompts are generic and may need task-specific instructions in an external harness. The reference parser may reject custom cases outside its grammar; such errors are displayed as response mismatches.

JavaScript number representation is sufficient for these fixtures, but this is not a decimal accounting engine. Date parsing returns calendar strings with no time zones. Case conversion follows the browser/Node implementation's Unicode locale data.

## Storage and privacy

Data stays in memory and disappears on refresh. There is no automatic persistence, response harvesting, model execution, or custom-fixture import. Custom cases can be exported as prompts and reports; maintaining a reusable custom CLI suite requires source fixtures. Exports may include private data if you enter it, so review files before sharing them.

The interface includes semantic controls, keyboard-accessible dialogs, responsive layouts, and visible focus indicators. Formal accessibility certification is not claimed.
