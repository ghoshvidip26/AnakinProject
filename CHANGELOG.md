# Changelog & Recent Updates

*This file tracks the major architectural changes and feature upgrades added to the Anakin Event Scraper.*

## [2026-05-10] Major Architecture Refactor & API Standardization

### Added
- **Dynamic Translation Engine:** Introduced a unified parameter schema (`city`, `category`, `dateRange`) for the `/api/scrape/all` and individual platform endpoints. The backend automatically translates a standard payload like `{"city": "mumbai"}` into the platform-specific URL structures required by Luma (`mumbai`), Meetup (`in--mumbai`), and Eventbrite (`india--mumbai`).
- **POST/GET Support:** All Express API endpoints (`/luma`, `/meetup`, `/eventbrite`, `/all`) now gracefully support both `GET` (via query strings) and `POST` (via JSON body payloads) methods.
- **Automated Verification Suite:** Added `verify_api.js`, an integration test script that programmatically boots up the API and runs 7 parallel tests to verify that the unified POST and GET payloads function correctly across all endpoints.
- **Session Lifecycle Management:** CLI orchestrator scripts (`npm run scrape`) now securely generate temporary JSON output files (`luma_results.json`, `meetup_results.json`, `eventbrite_results.json`) which are automatically wiped from the filesystem when the session is closed via `SIGINT` or typing `exit`.
- **NPM Scripts:** Officially added standard `npm start` and `npm run scrape` commands to `package.json`.

### Changed
- Completely refactored `index.js` Express route handlers to utilize the `mapLocation()` utility for dynamic URL construction.
- Overhauled `README.md` to include a professional Mermaid system architecture diagram, updated API documentation, and interactive lifecycle instructions.
- Updated `.gitignore` to block all `*_results.json` files and `debug_*.html` artifacts from polluting the Git repository.

### Removed
- Safely deprecated and removed the legacy duplicated `parseMeetupEvents.js` from the root directory (the system now relies entirely on the high-fidelity Apollo State Parser located in `lib/parseMeetupEvents.js`).
