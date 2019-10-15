/* globals DDP localStorage */
DDP = DDP || {}

const once = fct => {
  let called = false
  return function (...args) {
    if (called) return
    called = true
    return fct.call(this, ...args)
  }
}

const log = (...args) => {
  if (Meteor.isDevelopment) {
    console.info('[DDP.loginWithLea]', ...args)
  }
}

function loginWithLea (connection, { accessToken, debug }, callback = () => {}) {
  const url = connection._stream.rawUrl
  let reconnected = false
  let onceUserCallback = once(callback)

  if (debug) log('login url', url)

  function onResultReceived (err, result) {
    if (err || !result || !result.token) {
      connection.onReconnect = null
    } else {
      connection.onReconnect = function () {
        reconnected = true
        callLoginMethod([ { resume: result.token } ])
      }
    }
  }

  function loggedInAndDataReadyCallback (error, result) {
    // If the login method returns its result but the connection is lost
    // before the data is in the local cache, it'll set an onReconnect (see
    // above). The onReconnect will try to log in using the token, and *it*
    // will call userCallback via its own version of this
    // loggedInAndDataReadyCallback. So we don't have to do anything here.
    if (reconnected)
      return

    if (debug) log(`login result received, successful = ${!!result && !error}`)

    if (error || !result) {
      onceUserCallback(error || new Error('No result from call to login'), null)
    } else {
      // Logged in
      localStorage.setItem(`${url}/lea/loginToken`, result.token)
      localStorage.setItem(`${url}/lea/loginTokenExpires`, result.tokenExpires)
      localStorage.setItem(`${url}/lea/userId`, result.id)
      connection.setUserId(result.id)
      onceUserCallback(null, result)
    }
  }

  function callLoginMethod (args) {
    if (debug) {
      if (args[0].accessToken) log('login with accessToken')
      if (args[0].resume) log('login with resumeToken')
    }
    connection.apply('login', args, {
      wait: true,
      onResultReceived: onResultReceived
    }, loggedInAndDataReadyCallback)
  }

  const resumeToken = localStorage.getItem(`${url}/lea/loginToken`)
  if (resumeToken) {
    callLoginMethod([ { resume: resumeToken } ])
  } else {
    callLoginMethod([ { lea: true, accessToken } ])
  }
}

if (Meteor.isClient) {
  DDP.loginWithLea = loginWithLea
  console.log('asigned', DDP)
} else {
  // Allow synchronous usage by not passing callback on server
  DDP.loginWithLea = function ddpLoginWithLea (connection, { accessToken }, callback) {
    if (!callback) {
      return Meteor.wrapAsync(loginWithLea)(connection, { accessToken })
    } else {
      return loginWithLea(connection, { accessToken }, callback)
    }
  }
}