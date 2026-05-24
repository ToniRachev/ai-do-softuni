# Manual browser testing and cleanup

Attach this file (`@.cursor/instructions/manual-browser-testing.md`) when you want the agent to verify UI work in Cursor’s embedded browser and leave no test data behind.

## When this applies

After implementing or changing user-facing behavior (pages, forms, flows, APIs consumed by the UI), **before marking the task done**.

## 1. Run the app locally

- Start the dev server (or use the project’s documented run command).
- Note the exact URL (e.g. `http://localhost:3000`).

## 2. Open the app in the embedded browser

Do **not** rely only on code review or unit tests for UI work.

1. Open Cursor’s **embedded browser** (browser pane in the IDE, or **Simple Browser: Show** from the command palette).
2. Navigate to the local app URL.
3. If browser automation tools are available (`@browser` / Browser Automation enabled), use them to drive the same flows; otherwise perform the steps manually in that pane and observe results.

Confirm the page loads without console errors before testing features.

## 3. Test what you built

For **each feature or change** introduced in this task:

| Step | Action |
|------|--------|
| Plan | Name the user flow (e.g. “create item → list shows it → edit → delete”). |
| Execute | Walk through it in the embedded browser using realistic inputs. |
| Assert | UI state, messages, navigation, and (if relevant) network/console — behavior matches requirements. |
| Record | Brief note: flow name, pass/fail, and any bug found. |

Cover at least:

- Happy path for new/changed behavior  
- One meaningful error or validation case (invalid input, empty required field, etc.)  
- Regression on adjacent UI if the change could affect it  

Do **not** mark the task complete if a core flow fails in the browser.

## 4. Cleanup after each test (required)

**After every individual test flow** — not only at the end of the session — remove **every resource created for that test**.

Track creations as you go (IDs, titles, filenames, etc.).

| Resource type | Cleanup |
|---------------|---------|
| Database rows / API entities | Delete via UI or API using the same app mechanisms; prefer test-only accounts/data when the project provides them. |
| Files / uploads | Remove from storage and UI. |
| Sessions / drafts / carts | Clear or sign out as appropriate. |
| LocalStorage / cookies (if used for test state) | Clear only what this test set; avoid wiping unrelated dev data when possible. |

Rules:

- **One test → one cleanup** before starting the next test.  
- Never leave orphaned test users, posts, orders, projects, or uploads.  
- If deletion is impossible (missing UI/API), document the blocker and remove what you can; do not invent destructive SQL unless the project explicitly allows it.  
- Prefer dedicated test prefixes (e.g. `e2e-temp-…`) so stray data is easy to spot and delete.

## 5. Report before finishing

Include in the final response:

1. **Browser**: URL opened and that embedded browser testing was performed.  
2. **Flows tested**: Short checklist with pass/fail.  
3. **Cleanup**: Confirmation that all test-created resources were removed (or what could not be removed and why).  
4. **Issues**: Any bugs found; fix or file follow-up as appropriate.

## Quick checklist

- [ ] Dev server running  
- [ ] App opened in embedded browser  
- [ ] Each new/changed feature exercised in the browser  
- [ ] After **each** test: all resources created in that test deleted  
- [ ] No test data left in DB, storage, or UI  
- [ ] Results summarized in the reply  
