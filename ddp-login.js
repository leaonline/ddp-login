/* globals DDP */
import { Meteor } from 'meteor/meteor'
import { getUrl, once, storageKeys } from './utils'
import { clearStorage, setStorage } from './storage'
import { DDP } from 'meteor/ddp-client'

const debugLog = (...args) => {
  if (Meteor.isDevelopment) {
    console.debug('[DDP.loginWithLea]', ...args)
  }
}

export const loginWithLea = function loginWithLea (connection, { accessToken, debug }, callback = () => {}) {
  if (debug) debugLog('loginWithLea()')

  const url = getUrl(connection)
  const onceUserCallback = once(callback)
  let reconnected = false

  if (debug) debugLog('login url', url)

  function onResultReceived (err, result) {
    if (err || !result || !result.token) {
      connection.onReconnect = null
    }

    else {
      connection.onReconnect = function () {
        reconnected = true
        callLoginMethod([{ resume: result.token }])
      }
    }
  }

  function loggedInAndDataReadyCallback (error, result) {
    // If the login method returns its result but the connection is lost
    // before the data is in the local cache, it'll set an onReconnect (see
    // above). The onReconnect will try to log in using the token, and *it*
    // will call userCallback via its own version of this
    // loggedInAndDataReadyCallback. So we don't have to do anything here.
    if (reconnected) { return }

    if (debug) debugLog(`login result received, successful = ${!!result && !error}`)

    if (error || !result) {
      clearStorage(url)
      connection.setUserId(null)
      onceUserCallback(error || new Error('No result from call to login'), null)
    }

    // Logged in
    else {
      setStorage(url, result)
      connection.setUserId(result.id)
      onceUserCallback(null, result)
    }
  }

  function callLoginMethod (args) {
    if (debug) {
      if (args[0].accessToken) debugLog('login with accessToken')
      if (args[0].resume) debugLog('login with resumeToken')
    }
    connection.apply('login', args, {
      wait: true,
      onResultReceived
    }, loggedInAndDataReadyCallback)
  }

  const resumeToken = Meteor._localStorage.getItem(storageKeys.loginToken(url))

  if (resumeToken) {
    callLoginMethod([{ resume: resumeToken }])
  }
  else {
    callLoginMethod([{ lea: true, accessToken }])
  }
}

/**
 * @private logs the user out and clears all login data from collection and
 * storage
 * @param connection {DDP.Connection}
 * @param callback {Function|undefined}
 */
function logout (connection, callback = () => {}) {
  const url = getUrl(connection)

  connection.apply('logout', [], { wait: true }, (error) => {
    clearStorage(url)
    connection.onReconnect = null
    connection.setUserId(null)

    if (error) {
      return callback(error)
    }

    callback(undefined, true)
  })
}

if (Meteor.isClient) {
  console.debug('[DDP.loginWithLea]', 'define login method')
  DDP.loginWithLea = loginWithLea
  DDP.logout = logout
}

else {
  // Allow synchronous usage by not passing callback on server
  DDP.loginWithLea = function ddpLoginWithLea (connection, options, callback) {
    if (!callback) {
      return Meteor.wrapAsync(loginWithLea)(connection, options)
    }
    else {
      return loginWithLea(connection, options, callback)
    }
  }

  DDP.logout = function ddpLogout (connection, callback) {
    if (!callback) {
      return Meteor.wrapAsync(logout)(connection)
    }
    else {
      return logout(connection, callback)
    }
  }
}
