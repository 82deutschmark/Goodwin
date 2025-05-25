**Plan: AdMob Integration and Changelog Refactor**

**1. Files to Create:**
    *   `d:\1Projects\openai-responses-starter-app\docs\admob_changelog_plan.md` (This document)
    *   `d:\1Projects\openai-responses-starter-app\public\ads.txt` (The `ads.txt` file moved to the correct location)

**2. Files to Modify:**
    *   `d:\1Projects\openai-responses-starter-app\docs\CHANGELOG.md` (Reformat and add new entry)
    *   `d:\1Projects\openai-responses-starter-app\README.md` (Add section on AdSense/AdMob integration)

**3. Tasks:**
    *   **Create Plan Document:**
        *   Save this plan to `d:\1Projects\openai-responses-starter-app\docs\admob_changelog_plan.md`.
    *   **Handle `ads.txt`:**
        *   Write the content of the current `ads.txt` to `d:\1Projects\openai-responses-starter-app\public\ads.txt`.
        *   Inform you that `d:\1Projects\openai-responses-starter-app\ads.txt` (at the root) is no longer needed and can be deleted after the new one is created.
    *   **Reformat `CHANGELOG.md`:**
        *   Add a comment at the top explaining the file's purpose and structure.
        *   Restructure entries under date-based headings (e.g., `## YYYY-MM-DD`).
        *   Use sub-sections like `### Added`, `### Changed`, `### Fixed`.
        *   Ensure changes are in reverse chronological order (newest first).
        *   Add an entry for today's changes (AdMob setup, changelog reformat).
    *   **Update `README.md`:**
        *   Add a new section explaining how to integrate AdSense/AdMob, covering:
            *   The purpose and placement of `public/ads.txt`.
            *   How to add the main AdSense script to Next.js (e.g., in `_app.tsx` or `_document.tsx` using `next/script`).
            *   Guidance on creating and embedding AdSense ad units.
    *   **Provide AdSense Integration Guidance (in chat):**
        *   Reiterate key points from the `README.md` update regarding AdSense script and ad unit integration.
        *   Remind about Google AdSense Program Policies.
