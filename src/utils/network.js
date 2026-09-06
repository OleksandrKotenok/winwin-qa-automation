const { logger } = require('./logger');

/** Search endpoint the SPA calls to fetch offers. */
const SEARCH_API_PATH = '/api/v1/offers/search';

/**
 * Starts collecting search API requests at the browser context level.
 *
 * Context level matters: the landing page opens the results in a NEW TAB, so a
 * page-level listener attached after the click would miss the very first
 * search call. Listening on the context captures requests from any page,
 * including ones that do not exist yet.
 *
 * @param {import('@playwright/test').BrowserContext} context
 * @returns {{ requests: import('@playwright/test').Request[], stop: () => void }}
 */
function collectSearchRequests(context) {
  const requests = [];

  const handler = (request) => {
    if (request.url().includes(SEARCH_API_PATH)) {
      requests.push(request);
      logger.info(`captured ${request.method()} ${SEARCH_API_PATH} (#${requests.length})`);
    }
  };

  context.on('request', handler);
  logger.info(`listening for requests to ${SEARCH_API_PATH}`);

  return {
    requests,
    stop: () => context.off('request', handler),
  };
}

/**
 * Returns the query parameters of a request as a URLSearchParams instance.
 *
 * The API mirrors the page URL but without the `search.` prefix:
 * page  ->  ?search.guestQuantity.adultsQuantity=3
 * API   ->  ?guestQuantity.adultsQuantity=3
 *
 * @param {import('@playwright/test').Request} request
 */
function queryOf(request) {
  return new URL(request.url()).searchParams;
}

module.exports = { collectSearchRequests, queryOf, SEARCH_API_PATH };
