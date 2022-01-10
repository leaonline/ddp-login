# DDP Login

Provides `loginWithLea` to a DDP connection. Requires custom Oauth2 server.
Isomorphic, handles server-side remote connections, too.

## Installation and usage

Install via `meteor add leaonline:ddp-connection` and use as the following:

### Server example

You need a valid lea user account. See [leaonline-accounts]()
for how it works.

If you connect within a Meteor method, you can get the userId via `this.userId` 

```javascript
import { DDP } from 'meteor/ddp-client'

const log = (...args) => console.log('[DDP]:', ...args) 

DDP.onReconnect(function (connection) {
  log('connected to', connection._stream.endpoint)
  
  const user = Meteor.users.findOne(userId) // get the userId your way
  const { accessToken } = user.services.lea
  
  DDP.loginWithLea(connection, { accessToken }, function(error, result) {
    if (error) {
      log('error - ', error.name, error.message)
    }
    
    if (result) {
      log('logged in')
      // run authentication-requiring contexts
    }
  })
})


DDP.connect('http://localhost:8080') // some external Meteor app running on 8080
```

### Client example

On the client you need a way to retrieve the `accessToken` from the server:

```javascript
Meteor.methods({
  getToken: function() {
    const { userId } = this
    const user = Meteor.users.findOne(userId)
    
    return {
      accessToken: user?.services?.lea?.accessToken
    }
  }
})
```

```javascript
import { DDP } from 'meteor/ddp-client'

const log = (...args) => console.log('[DDP]:', ...args)

DDP.onReconnect(function (connection) {
  log('connected to', connection._stream.endpoint)

  Meteor.call('getToken', (error, { accessToken }) => {
    if (error) return log('error - ', error.name, error.message)

    DDP.loginWithLea(connection, { accessToken }, function (error, result) {
      if (error) {
        log('error - ', error.name, error.message)
      }

      if (result) {
        log('logged in')
        // run authentication-requiring contexts
      }
    })
  })
})

DDP.connect('http://localhost:8080') // some external Meteor app running on 8080
```


You can also call the functions without a callback, which makes them return 
Promises.

## License

MIT, see [license file](./LICENSE)
