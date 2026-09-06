const { logger } = require('../../utils/logger');

/**
 * The Guests selector of the search widget: adults, children and pets.
 *
 * Two details drive the locator strategy here.
 *
 * 1. The application ships its own test attribute, `data-wwt-id`, so controls
 *    are addressed by it rather than by CSS classes or text.
 * 2. `guests-select__open--button` exists TWICE in the DOM - a desktop and a
 *    mobile variant of the search bar - which makes a bare locator ambiguous
 *    under Playwright strict mode. `:visible` narrows it to the variant the
 *    current viewport actually renders.
 *
 * The pet type and weight dropdowns are Radix selects: their options are
 * rendered in a portal with `role="option"` and expose the selected state as
 * `data-state="checked"`, which is what the tests assert on.
 */
class GuestsSelector {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.trigger = page.locator('[data-wwt-id="guests-select__open--button"]:visible');
    this.triggerSummary = this.trigger.locator('xpath=..');

    this.adultsInput = page.locator('[data-wwt-id="guests-select__adults-number--input"]:visible');
    this.adultsIncrement = page.locator('[data-wwt-id="guests-select__adults-number--increment--button"]:visible');
    this.adultsDecrement = page.locator('[data-wwt-id="guests-select__adults-number--decrement--button"]:visible');

    this.petsInput = page.locator('[data-wwt-id="guests-select__pets-number--input"]:visible');
    this.petsIncrement = page.locator('[data-wwt-id="guests-select__pets-number--increment--button"]:visible');
    this.petsDecrement = page.locator('[data-wwt-id="guests-select__pets-number--decrement--button"]:visible');

    this.petTypeSelect = page.locator('[data-wwt-id="guests-select__pet-type--select"]:visible');
    this.petWeightSelect = page.locator('[data-wwt-id="guests-select__pet-weight--select"]:visible');
  }

  async open() {
    logger.info('opening guests selector');
    await this.trigger.click();
    await this.adultsInput.waitFor({ state: 'visible' });
  }

  /**
   * Closes the popover.
   *
   * Necessary before submitting: the open popover overlaps the Search
   * control, and Playwright waits for the button to stop being covered
   * rather than clicking through it.
   */
  async close() {
    logger.info('closing guests selector');
    await this.page.keyboard.press('Escape');
    await this.adultsInput.waitFor({ state: 'hidden' });
  }

  /** Number currently shown on the closed trigger, e.g. "9". */
  async triggerText() {
    return (await this.triggerSummary.innerText()).trim();
  }

  async adultsCount() {
    return Number(await this.adultsInput.inputValue());
  }

  async petsCount() {
    return Number(await this.petsInput.inputValue());
  }

  /**
   * Clicks "+" for adults the given number of times.
   * @param {number} times
   */
  async incrementAdults(times) {
    logger.info(`incrementing adults x${times}`);
    for (let i = 0; i < times; i += 1) {
      await this.adultsIncrement.click();
    }
  }

  /**
   * Raises the adults counter to the target value.
   * @param {number} target
   */
  async setAdults(target) {
    const current = await this.adultsCount();
    if (target > current) {
      await this.incrementAdults(target - current);
    }
    logger.info(`adults set to ${await this.adultsCount()}`);
  }

  /**
   * Types a raw value straight into the adults field, bypassing the buttons.
   * Used to check that the limit is enforced by validation, not only by
   * disabling "+".
   * @param {string} value
   */
  async typeAdults(value) {
    logger.info(`typing "${value}" into the adults field`);
    await this.adultsInput.click({ clickCount: 3 });
    await this.adultsInput.type(value);
  }

  /** Adds one pet, which reveals the pet type and weight dropdowns. */
  async addPet() {
    logger.info('adding a pet');
    await this.petsIncrement.click();
    await this.petTypeSelect.waitFor({ state: 'visible' });
    await this.petWeightSelect.waitFor({ state: 'visible' });
  }

  /**
   * Picks a pet type from the dropdown.
   * @param {string} type one of Dog | Cat | Other
   */
  async selectPetType(type) {
    logger.info(`selecting pet type "${type}"`);
    await this.petTypeSelect.click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
  }

  /**
   * Picks a pet weight range from the dropdown.
   * @param {string} weight e.g. "5-10 kg"
   */
  async selectPetWeight(weight) {
    logger.info(`selecting pet weight "${weight}"`);
    await this.petWeightSelect.click();
    await this.page.getByRole('option', { name: weight, exact: true }).click();
  }

  /**
   * Opens the weight dropdown and returns the option marked as checked.
   * Radix exposes it as data-state="checked".
   */
  async checkedWeightOption() {
    await this.petWeightSelect.click();
    const checked = this.page.locator('[role="option"][data-state="checked"]');
    const label = (await checked.innerText()).trim();
    await this.page.keyboard.press('Escape');
    return label;
  }

  /** Labels of every option in the weight dropdown, in render order. */
  async weightOptionLabels() {
    await this.petWeightSelect.click();
    const labels = await this.page.locator('[role="option"]').allInnerTexts();
    await this.page.keyboard.press('Escape');
    return labels.map((label) => label.trim());
  }
}

module.exports = { GuestsSelector };
