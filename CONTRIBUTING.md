# Contributing

Help turn a small locale mistake into a reproducible regression.

1. Install Node.js 24 and run `npm ci`.
2. Create a focused branch and run `npm run dev`.
3. For a fixture, include an explicit locale, input, prompt, literal expected output, and a short explanation. Keep the paired case logically comparable.
4. Derive parser outputs independently from expected objects; never make a reference implementation return the answer key.
5. Add a regression test and run `npm run typecheck`, `npm test`, and `npm run build`.
6. Update relevant docs and the changelog. Open a pull request with the resulting behavior and verification.

Useful contributions include a corrected fixture, a narrowly documented parser improvement, clearer validation errors, or keyboard/usability fixes. Discuss new language support before expanding the fixture contract.

Use synthetic examples. Do not upload customer messages, private model logs, or credentials. Contributions use the repository's MIT License and follow the [code of conduct](CODE_OF_CONDUCT.md).
