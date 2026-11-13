# Security policy

The current 1.x source on `main` is supported. Please use reviewed dependency updates and rerun the checks.

For suspected vulnerabilities, use **GitHub Security → Advisories → Report a vulnerability** on this repository when private reporting is enabled. If unavailable, open a public issue asking for a private reporting channel without including vulnerability details or sensitive input. Do not publish secrets, private response files, or exploit payloads in an ordinary issue.

Include the affected commit, browser or Node version, minimal synthetic reproduction, and the expected trust boundary. There is no promised fixed response time or paid bounty.

The browser treats imported responses as data and renders them as text. Imports have size, ID, and duplicate checks. The app does not execute model outputs, run external commands, or contact model services. Review any adapter you add independently.
