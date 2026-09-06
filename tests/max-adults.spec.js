const { test, expect } = require('../src/fixtures/test');
const { ADULTS_MAX, ADULTS_MIN } = require('../src/data/guests');

/**
 * Scenario 1 - Max Adults Selection.
 *
 * Verifies that the maximum number of adults can be selected in the Guests
 * selector and that the UI behaves correctly once the limit is reached.
 */
test.describe('Guests selector - maximum number of adults', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.open();
    await landingPage.guests.open();
  });

  test('adults can be raised to the maximum of 10', async ({ landingPage }) => {
    const { guests } = landingPage;

    await test.step('the selector starts at the default value', async () => {
      expect(await guests.adultsCount()).toBe(2);
    });

    await test.step(`raise adults to ${ADULTS_MAX}`, async () => {
      await guests.setAdults(ADULTS_MAX);
      expect(await guests.adultsCount()).toBe(ADULTS_MAX);
    });

    await test.step('the closed trigger reflects the selected count', async () => {
      await expect(guests.triggerSummary).toContainText(String(ADULTS_MAX));
    });
  });

  test('at the limit the increment control is disabled and decrement stays available', async ({
    landingPage,
  }) => {
    const { guests } = landingPage;
    await guests.setAdults(ADULTS_MAX);

    await test.step('"+" is genuinely disabled, not just styled as such', async () => {
      await expect(guests.adultsIncrement).toBeDisabled();
    });

    await test.step('"-" remains enabled so the user is not trapped at the limit', async () => {
      await expect(guests.adultsDecrement).toBeEnabled();
    });

    await test.step('stepping back down re-enables "+"', async () => {
      await guests.adultsDecrement.click();
      expect(await guests.adultsCount()).toBe(ADULTS_MAX - 1);
      await expect(guests.adultsIncrement).toBeEnabled();
    });
  });

  test('the limit is enforced against direct keyboard input', async ({ landingPage }) => {
    const { guests } = landingPage;

    await test.step('a value above the maximum is not accepted', async () => {
      await guests.typeAdults('99');
      const value = await guests.adultsCount();
      expect(value).toBeLessThanOrEqual(ADULTS_MAX);
    });

    await test.step('a value below the minimum is not accepted', async () => {
      await guests.typeAdults('0');
      const value = await guests.adultsCount();
      expect(value).toBeGreaterThanOrEqual(ADULTS_MIN);
    });
  });

  test('the field advertises its own bounds', async ({ landingPage }) => {
    const { guests } = landingPage;
    await expect(guests.adultsInput).toHaveAttribute('min', String(ADULTS_MIN));
    await expect(guests.adultsInput).toHaveAttribute('max', String(ADULTS_MAX));
  });
});
