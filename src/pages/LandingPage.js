const { BasePage } = require('./BasePage');
const { GuestsSelector } = require('./components/GuestsSelector');
const { logger } = require('../utils/logger');

/**
 * The public landing page at https://winwin.travel/ with its search widget.
 */
class LandingPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.guests = new GuestsSelector(page);
    this.destinationInput = page.locator('[data-wwt-id="combobox__search--input"]');
    this.datesTrigger = page.locator('[data-wwt-id="dates-input__trigger--button"]');
    this.searchButton = page.locator('[data-wwt-id="landing__search--link"]');
  }

  async open() {
    await this.goto('/');
    await this.searchButton.waitFor({ state: 'visible' });
  }

  /**
   * Submits the search.
   *
   * The Search control is an anchor that opens the results in a NEW TAB, so
   * the caller gets back the new page rather than the current one.
   *
   * @returns {Promise<import('@playwright/test').Page>}
   */
  async search() {
    logger.info('submitting search');
    // The guests popover, if left open, covers the Search control and the
    // click would wait for actionability until it times out.
    if (await this.guests.adultsInput.isVisible()) {
      await this.guests.close();
    }

    const [resultsPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.searchButton.click(),
    ]);
    await resultsPage.waitForLoadState('domcontentloaded');
    logger.info('results opened in a new tab');
    return resultsPage;
  }
}

module.exports = { LandingPage };
