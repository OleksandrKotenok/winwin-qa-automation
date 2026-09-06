const { test, expect } = require('../src/fixtures/test');
const { PET_TYPES, PET_WEIGHTS, PET_DEFAULTS } = require('../src/data/guests');

/**
 * Scenario 2 - Pets Filter Options.
 *
 * Verifies that every pet type and every weight range can be selected and
 * that each choice is reflected as the selected state in the UI.
 */
test.describe('Guests selector - pet options', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.open();
    await landingPage.guests.open();
    await landingPage.guests.addPet();
  });

  test('adding a pet reveals the type and weight controls with their defaults', async ({
    landingPage,
  }) => {
    const { guests } = landingPage;

    expect(await guests.petsCount()).toBe(1);
    await expect(guests.petTypeSelect).toHaveText(PET_DEFAULTS.type);
    await expect(guests.petWeightSelect).toHaveText(PET_DEFAULTS.weight);
  });

  test('the weight dropdown offers exactly the documented ranges', async ({ landingPage }) => {
    const labels = await landingPage.guests.weightOptionLabels();
    expect(labels).toEqual(PET_WEIGHTS);
  });

  for (const weight of PET_WEIGHTS) {
    test(`weight "${weight}" can be selected and is marked as selected`, async ({
      landingPage,
    }) => {
      const { guests } = landingPage;

      await test.step(`select "${weight}"`, async () => {
        await guests.selectPetWeight(weight);
      });

      await test.step('the trigger shows the chosen range', async () => {
        await expect(guests.petWeightSelect).toHaveText(weight);
      });

      await test.step('reopening the dropdown shows it as the checked option', async () => {
        expect(await guests.checkedWeightOption()).toBe(weight);
      });
    });
  }

  for (const type of PET_TYPES) {
    test(`pet type "${type}" can be selected`, async ({ landingPage }) => {
      const { guests } = landingPage;

      await guests.selectPetType(type);
      await expect(guests.petTypeSelect).toHaveText(type);
    });
  }

  test('type and weight are independent of each other', async ({ landingPage }) => {
    const { guests } = landingPage;

    await guests.selectPetType('Other');
    await guests.selectPetWeight('>20 kg');

    await expect(guests.petTypeSelect).toHaveText('Other');
    await expect(guests.petWeightSelect).toHaveText('>20 kg');
  });
});
