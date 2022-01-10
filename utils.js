/**
 * Executes a function exactly once.
 * @param fct {function} the function to be executed
 * @return {function}
 */
export const once = fct => {
  let called = false

  return function (...args) {
    if (called) return
    called = true
    return fct.call(this, ...args)
  }
}

/**
 * Returns the current url from a given DDP connection
 * @param connection {DDPConnection}
 * @return {String}
 */
export const getUrl = connection => connection._stream.rawUrl ||
  connection._stream.endpoint

/**
 * Returns the storage key for the respective connection url.
 * Use {getUrl} to get the correct url from the connection.
 */
export const storageKeys = {
  loginToken: url => `${url}/lea/loginToken`,
  loginTokenExpires: url => `${url}/lea/loginTokenExpires`,
  userId: url => `${url}/lea/userId`
}
