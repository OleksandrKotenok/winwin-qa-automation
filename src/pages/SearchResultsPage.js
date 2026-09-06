const { BasePage } = require('./BasePage');
const { logger } = require('../utils/logger');

/**
 * The results page at /app.
 *
 * Search state lives in the URL: every guest and filter choice is serialised
 * into query parameters prefixed with `search.`, and the same values are sent
 * to the offers API without that prefix.
 */
class SearchResultsPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.searchButton = page.getByRole('link', { name: 'Search' });
  }

  /**
   * Quick filter chips shown above the results. They carry no `data-wwt-id`,
   * so they are addressed by their accessible name.
   * @param {string} name e.g. "Free cancellation"
   */
  filterChip(name) {
    return this.page.getByRole('button', { name, exact: true });
  }

  /**
   * Applies a quick filter chip.
   * @param {string} name
   */
  async applyFilter(name) {
    logger.info(`applying filter "${name}"`);
    await this.filterChip(name).click();
  }

  /**
   * Value of a single search parameter of the current URL.
   * @param {string} name e.g. "search.guestQuantity.adultsQuantity"
   */
  param(name) {
    return this.searchParams().get(name);
  }

  /** Names of every `search.*` parameter currently in the URL. */
  searchParamNames() {
    return [...this.searchParams().keys()].filter((key) => key.startsWith('search.'));
  }
}

module.exports = { SearchResultsPage };
