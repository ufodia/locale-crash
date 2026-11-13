# Browser verification

The automated workbench suite exercises the 72-case reference parser, imported response scoring, JSON/CSV exports, and a 390px viewport. A controlled delayed-file regression verifies that a newer reference run survives an older pending import and that an overflow JSON number is rejected without losing the current report. No API key or model service is required.

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Playwright starts the local Vite server automatically. Desktop/mobile screenshots and failure traces are written to ignored `test-results/`; the HTML report is in `playwright-report/`. To use an already running server, set `PLAYWRIGHT_BASE_URL`. To use installed Chrome, set `PLAYWRIGHT_CHANNEL=chrome`. The default CI browser is Playwright Chromium.

These tests are intentionally scoped to the documented workbench workflow. They do not establish all-browser compatibility, universal input support, or the correctness of arbitrary AI output. The README screenshot is from the real local application using synthetic data.
