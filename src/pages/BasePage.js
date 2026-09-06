const { logger } = require('../utils/logger');

/**
 * Shared behaviour for every page object.
 *
 * The application greets a first-time visitor with two overlays that steal
 * clicks: the CookieFirst consent banner and, on /app, a welcome tutorial
 * modal. Both are dismissed here so the tests can assume a clean page.
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.cookieDenyButton = page.getByRole('button', { name: 'Deny', exact: true });
    this.skipTutorialButton = page.getByRole('button', { name: 'Skip tutorial', exact: true });
  }

  /**
   * @param {string} path
   */
  async goto(path) {
    logger.info(`navigating to ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }

  /**
   * Dismisses the consent banner and the tutorial modal if either is shown.
   * Both are optional: on a warm profile neither appears, so a miss is not a
   * failure.
   */
  async dismissOverlays() {
    await this.dismissIfPresent(this.cookieDenyButton, 'cookie consent banner');
    await this.dismissIfPresent(this.skipTutorialButton, 'welcome tutorial modal');
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {string} label
   */
  async dismissIfPresent(locator, label) {
    try {
      await locator.first().click({ timeout: 5_000 });
      logger.info(`dismissed ${label}`);
    } catch {
      logger.info(`${label} not shown, continuing`);
    }
  }

  /** Current URL query parameters. */
  searchParams() {
    return new URL(this.page.url()).searchParams;
  }
}

module.exports = { BasePage };
