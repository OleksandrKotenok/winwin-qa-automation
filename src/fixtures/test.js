const base = require('@playwright/test');
const { LandingPage } = require('../pages/LandingPage');
const { SearchResultsPage } = require('../pages/SearchResultsPage');
const { logger } = require('../utils/logger');

/**
 * Test fixture.
 *
 * The CookieFirst consent widget is blocked at the network level rather than
 * clicked away: it loads asynchronously and can appear mid-test, which makes
 * click-based dismissal a race. BasePage still clicks "Deny" as a fallback in
 * case the widget is served from somewhere else.
 */
const test = base.test.extend({
  context: async ({ context }, use) => {
    await context.route('**/consent.cookiefirst.com/**', (route) => route.abort());
    logger.info('consent widget blocked');
    await use(context);
  },

  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  resultsPageFor: async ({}, use) => {
    await use((page) => new SearchResultsPage(page));
  },
});

module.exports = { test, expect: base.expect };
