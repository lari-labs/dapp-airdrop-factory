/* global globalThis */
const ambientSetTimeout = globalThis.setTimeout;

// type SleepOptions = {
//   log?: Log;
//   setTimeout?: typeof ambientSetTimeout;
// };
export const SleepOptions = {
  log: x => console.log(x),
  setTimeout: ambientSetTimeout,
};
export const RetryOptions = {
  ...SleepOptions,
  maxRetries: 4,
  retryIntervalMs: 2000,
};
export const sleep = (
  ms = 0,
  { log = () => {}, setTimeout = ambientSetTimeout } = SleepOptions,
) =>
  new Promise(resolve => {
    log(`Sleeping for ${ms}ms...`);
    setTimeout(resolve, ms);
  });

const retryUntilCondition = async (
  operation = () => {},
  condition = x => x,
  message = '',
  opts = RetryOptions,
) => {
  let retries = 0;

  const { maxRetries, log, retryIntervalMs, setTimeout } = opts;
  console.log({ maxRetries, retryIntervalMs, message });

  await null;
  while (retries < maxRetries) {
    try {
      const result = await operation();
      if (condition(result)) {
        return result;
      }
    } catch (error) {
      if (error instanceof Error) {
        log(`Error: ${error.message}`);
      } else {
        log(`Unknown error: ${String(error)}`);
      }
    }

    retries += 1;
    console.log(
      `Retry ${retries}/${maxRetries} - Waiting for ${retryIntervalMs}ms for ${message}...`,
    );
    await sleep(retryIntervalMs, { log, setTimeout });
  }

  throw Error(`${message} condition failed after ${maxRetries} retries.`);
};

export const makeRetryUntilCondition =
  (defaultOptions = RetryOptions) =>
  (
    operation = () => Promise.resolve('op'),
    condition = x => x,
    message = '',
    options = RetryOptions,
  ) =>
    retryUntilCondition(operation, condition, message, {
      ...defaultOptions,
      ...options,
    });
