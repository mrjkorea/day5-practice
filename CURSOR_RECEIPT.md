# CURSOR_RECEIPT

Repo: day5-practice only. This receipt is not committed.

The code itself is already on `main` as `b37eb01` ("Add shared sign-in and send Day 5 scores to the score sheet."), authored 2026-10-04 16:11 +0900, and that commit matches `origin/main`. This session did not run `git commit`.

## What changed

Jay's law is wired for this app. A signed-in student sends each finished unit test to the one Classroom Metrics sheet, and the same result is saved on the sign-in book so the next login can put the student back on their best percent.

## Pages

`index.html` and `intermediate/index.html` are the only pages that load `assets/js/app.js`. Before that script, each page now loads:

- `https://mrjkorea.github.io/mrj-signin/mrj-auth.css`
- `https://mrjkorea.github.io/mrj-signin/mrj-auth.js`
- `https://mrjkorea.github.io/mrj-signin/mrj-auth-boot.js` with `data-mrj-app="day5-practice"`
- `mrj-scores.js`

On the intermediate page the scores file is `../mrj-scores.js` so it still loads the repo-root copy from `/intermediate/`. No local name box, PIN, or Skip was added. The shared door is the only sign-in.

## Scores

`mrj-scores.js` is the shared poster, copied into this repo. `post()` returns without sending when `MRJ_AUTH.student()` is empty. When a student is signed in, it posts the row to Classroom Metrics and, at the end of `post()`, calls `MRJ_AUTH.noteScore` with the same program, itemId, scoreValue, scoreMax, scorePct, and localDate.

`assets/js/app.js` calls `MRJ_SCORES.post` only from a finished test (`finish`), including a fail. It does not post for opening a page. Fields: student from `MRJ_AUTH.student()`, program `day5-practice`, appName `MRJ Day 5`, source `day5-practice`, bookTitle the book id, unitTitle the test id, itemId `book:test`, itemType `unit_test`, scoreValue and scorePct the percent, scoreMax `100`, correctness `correct` on pass and `incorrect` otherwise. A passing percent is still stored in `localStorage` when it is the best.

## Continue

On `mrj-auth-ready`, `detail.progress` is read. Rows for program `day5-practice` restore the best percent into the existing `d5v2-book-test` keys (`book:test` item ids; scores like `90/100` or `90%`). Empty progress leaves the app on its normal start. A lower saved percent does not replace a higher one already on this device.

## Check

Local pages at `http://127.0.0.1:8891/` and `/intermediate/` showed the shared door (I already have an ID / Make a new ID), loaded `MRJ_AUTH` and `MRJ_SCORES`, and did not show a name box, PIN, or Skip. A thrown `mrj-auth-ready` with two percents for one test kept 90, ignored another program, and did not replace a stored 95 with 80. `post()` with no signed-in student did not fetch and did not call `noteScore`.
