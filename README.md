# WinWin.travel — QA Automation Test Task

Playwright suite covering the three scenarios from the test task, written against the live site at https://winwin.travel.

**Role applied for:** Automation QA
**Stack:** Playwright + JavaScript (CommonJS), Chromium

---

## Setup

```bash
npm install
npx playwright install chromium
```

## Running

```bash
npm test                 # all three scenarios
npm run test:headed      # with a visible browser
npm run test:adults      # scenario 1 only
npm run test:pets        # scenario 2 only
npm run test:filters     # scenario 3 only
npm run report           # open the HTML report of the last run
```

The base URL can be overridden without touching the code:

```bash
BASE_URL=https://staging.example.com npm test
```

---

## Project structure

```
playwright.config.js          config: baseURL, timeouts, trace/video on failure
src/
  data/guests.js              test data: limits, pet types, weight ranges
  fixtures/test.js            custom fixture: page objects + consent blocking
  pages/
    BasePage.js               navigation and overlay dismissal
    LandingPage.js            landing page and its search widget
    SearchResultsPage.js      /app results page, URL params, filter chips
    components/
      GuestsSelector.js       adults / children / pets component
  utils/
    logger.js                 timestamped logging
    network.js                offers API request collection
tests/
  max-adults.spec.js          scenario 1
  pets-filter.spec.js         scenario 2
  filters-affect-request.spec.js  scenario 3
```

---

## Scenarios

### 1. Max Adults Selection — `tests/max-adults.spec.js`

The Guests selector allows **1 to 10 adults**. The suite raises the counter to 10 and checks the behaviour at the limit: the "+" control receives a real `disabled` attribute rather than a disabled-looking style, "−" stays enabled so the user is not stuck, and stepping back down re-enables "+". The limit is also checked against direct keyboard input, since the counter is a real `input[type=number]` and is not read-only — typing `99` or `0` must not push the value out of bounds. Finally the field's own `min`/`max` attributes are asserted, so a change in the business rule fails the test loudly instead of silently.

### 2. Pets Filter Options — `tests/pets-filter.spec.js`

Adding a pet reveals two dropdowns: **type** (Dog, Cat, Other) and **weight**. Each of the six weight ranges and each of the three types is selected in its own parameterised test. Selected state is asserted twice over: on the closed trigger, and by reopening the dropdown and reading `data-state="checked"` from the option itself — a state assertion rather than a colour or class assertion.

**Discrepancy with the task description.** The task lists five weight ranges and places "Other" among them. The application actually offers six ranges — `<1 kg`, `1-5 kg`, `5-10 kg`, `10-15 kg`, `15-20 kg`, `>20 kg` — with `10-15 kg` missing from the task text, and "Other" is a pet *type*, not a weight. The tests follow the application and cover all nine options. One test asserts the full list explicitly, so if the intent was in fact five ranges, that test is the one that will report it.

### 3. Filters Affect Request — `tests/filters-affect-request.spec.js`

Search state is serialised into the page URL with a `search.` prefix, and the SPA then calls `GET /api/v1/offers/search` with the same parameters **without** that prefix:

| Page URL | API request |
| --- | --- |
| `search.guestQuantity.adultsQuantity=3` | `guestQuantity.adultsQuantity=3` |
| `search.guestQuantity.pets[0].type=DOG` | `guestQuantity.pets[0].type=DOG` |
| `search.filters[0].id=18` | `filters[0].id=18` |

Both layers are asserted. The first test selects 3 adults and a 5–10 kg dog, then verifies the results URL and the intercepted API call agree. The second applies the "Free cancellation" chip on the results page and verifies that the URL gains `search.filters[0].id / .type / .optionIDs[0]` and that a *new* API call is issued carrying the same filter id.

---

## Implementation notes

These are the application behaviours that shaped the code. They are worth knowing before changing anything here.

**The application ships its own test attribute.** Controls carry `data-wwt-id` (for example `guests-select__adults-number--increment--button`), so nothing in this suite depends on CSS classes or on visible text that would break under localisation. Two exceptions exist and are handled by accessible name: the mobile burger button and the quick filter chips have no such attribute.

**`guests-select__open--button` appears twice in the DOM** — a desktop and a mobile variant of the search bar. A bare locator is ambiguous under strict mode, so the component object narrows it with `:visible`.

**Search opens the results in a new tab.** `LandingPage.search()` therefore waits for a `page` event on the context and returns the new page. For the same reason the API collector listens on the **browser context**, not on a page: a page-level listener attached after the click would miss the first search call.

**Two overlays intercept clicks on a cold profile.** The CookieFirst consent banner is blocked at the network level in the fixture; the `/app` welcome tutorial modal is dismissed by `BasePage`. Both are optional — their absence is not treated as a failure.

**The pet dropdowns are Radix selects.** Options live in a portal, expose `role="option"` and carry `data-state="checked"`. Note also that the Account menu in the header opens on `pointerdown` rather than `click`; it is outside the scope of these three scenarios, but the same pattern is likely elsewhere in the header.

## Known constraints

The tests run against production, so they depend on it being reachable and are subject to its response times; timeouts are set generously for that reason. Scenario 3 asserts on parameter names and structure rather than on the number of offers returned, so it does not depend on inventory availability — a search returning no results still passes, which is the correct behaviour for a test about request construction. No authenticated scenarios are included: no test account was available.
