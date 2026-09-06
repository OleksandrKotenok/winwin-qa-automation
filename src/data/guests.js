/**
 * Test data for the Guests selector.
 *
 * NOTE ON THE TASK DESCRIPTION
 * The task lists the pet weights as "<1kg, 1-5 kg, 5-10 kg, 15-20 kg, >20kg"
 * and puts "Other" in the same list. The application actually offers SIX
 * weight ranges - the 10-15 kg range is missing from the task text - and
 * "Other" is a pet TYPE, not a weight. The values below follow the
 * application, and every option is covered by the tests.
 */

/** Highest number of adults the selector allows (input has max="10"). */
const ADULTS_MAX = 10;

/** Lowest number of adults the selector allows (input has min="1"). */
const ADULTS_MIN = 1;

/** Highest number of pets the selector allows (input has max="10"). */
const PETS_MAX = 10;

/** Pet types, exactly as rendered in the dropdown. */
const PET_TYPES = ['Dog', 'Cat', 'Other'];

/** Pet weight ranges, exactly as rendered in the dropdown. */
const PET_WEIGHTS = ['<1 kg', '1-5 kg', '5-10 kg', '10-15 kg', '15-20 kg', '>20 kg'];

/** Default option preselected when the first pet is added. */
const PET_DEFAULTS = { type: 'Dog', weight: '1-5 kg' };

module.exports = {
  ADULTS_MAX,
  ADULTS_MIN,
  PETS_MAX,
  PET_TYPES,
  PET_WEIGHTS,
  PET_DEFAULTS,
};
