const { test, expect } = require('../src/fixtures/test');
const { collectSearchRequests, queryOf } = require('../src/utils/network');

/**
 * Scenario 3 - Filters Affect Request.
 *
 * Verifies that applying filters changes both the page URL and the request
 * sent to the offers API.
 *
 * How the application works, established by exploring it:
 *   - search state is serialised into the page URL with a `search.` prefix,
 *     e.g. `search.guestQuantity.adultsQuantity=3`;
 *   - the SPA then calls `GET /api/v1/offers/search` with the same parameters
 *     WITHOUT that prefix, e.g. `guestQuantity.adultsQuantity=3`;
 *   - a quick filter chip adds `search.filters[0].id`, `.type` and
 *     `.optionIDs[0]` to the URL, and `filters[0].*` to the API call.
 */
test.describe('Filters are reflected in the URL and in the API request', () => {
  test('guest selection reaches both the URL and the offers API', async ({
    landingPage,
    resultsPageFor,
    context,
  }) => {
    const collector = collectSearchRequests(context);

    await landingPage.open();
    await landingPage.guests.open();

    await test.step('choose 3 adults and one large dog', async () => {
      await landingPage.guests.setAdults(3);
      await landingPage.guests.addPet();
      await landingPage.guests.selectPetType('Dog');
      await landingPage.guests.selectPetWeight('5-10 kg');
    });

    const resultsPage = resultsPageFor(await landingPage.search());
    await resultsPage.dismissOverlays();

    await test.step('the results URL carries the selection', async () => {
      expect(resultsPage.param('search.guestQuantity.adultsQuantity')).toBe('3');
      expect(resultsPage.param('search.guestQuantity.pets[0].type')).toBe('DOG');
      expect(resultsPage.param('search.guestQuantity.pets[0].weight')).toBe('5-10kg');
    });

    await test.step('the offers API is called with the same selection', async () => {
      await expect
        .poll(() => collector.requests.length, { timeout: 30_000 })
        .toBeGreaterThan(0);

      const query = queryOf(collector.requests[collector.requests.length - 1]);
      expect(query.get('guestQuantity.adultsQuantity')).toBe('3');
      expect(query.get('guestQuantity.pets[0].type')).toBe('DOG');
      expect(query.get('guestQuantity.pets[0].weight')).toBe('5-10kg');
    });

    collector.stop();
  });

  test('applying a quick filter changes the URL and triggers a new API call', async ({
    landingPage,
    resultsPageFor,
    context,
  }) => {
    const collector = collectSearchRequests(context);

    await landingPage.open();
    const resultsPage = resultsPageFor(await landingPage.search());
    await resultsPage.dismissOverlays();

    await test.step('no filter is applied yet', async () => {
      expect(resultsPage.searchParamNames()).not.toContain('search.filters[0].id');
    });

    await expect.poll(() => collector.requests.length, { timeout: 30_000 }).toBeGreaterThan(0);
    const callsBeforeFilter = collector.requests.length;

    await test.step('apply the "Free cancellation" filter', async () => {
      await resultsPage.applyFilter('Free cancellation');
    });

    await test.step('the URL gains the filter parameters', async () => {
      await expect
        .poll(() => resultsPage.param('search.filters[0].id'), { timeout: 20_000 })
        .toBeTruthy();

      expect(resultsPage.param('search.filters[0].type')).toBe('AND');
      expect(resultsPage.param('search.filters[0].optionIDs[0]')).toBeTruthy();
    });

    await test.step('a fresh search request is sent carrying the filter', async () => {
      await expect
        .poll(() => collector.requests.length, { timeout: 30_000 })
        .toBeGreaterThan(callsBeforeFilter);

      const query = queryOf(collector.requests[collector.requests.length - 1]);
      expect(query.get('filters[0].id')).toBe(resultsPage.param('search.filters[0].id'));
      expect(query.get('filters[0].type')).toBe('AND');
    });

    collector.stop();
  });
});
