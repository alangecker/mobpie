# mobpie
 _flexible api layer for creating backends with MobX support_

### Important!
consider it more as an *concept/draft*, not as a working reliable module. Depending on the interest/feedback I would perhaps work on it.

### Features
- Provides methods on the frontend
which get called on observable changes
- Flexible design to allow different uses

## Example
Full code under [alangecker/mobpie-example](https://github.com/alangecker/mobpie-example)
#### Backend
```js
const MobpieBackend = require('mobpie')
const backend = new MobpieBackend(httpServer)

let text = observable({
  welcome: 'Hello World'
})


backend.register('demo', {
  getText(req) {
    req.send(null, text.welcome)
  },
  setText(req) {
    text.welcome = req.params[0]
    console.log(`set to '${req.params[0]}'`);
  }
})
```

#### Frontend
```js
const api = new Mobpie
api.connect('http://localhost:5000', (err) => {
  api.demo.getText( (err, res) => {
    console.log('current text: '+res)
  })
  api.demo.setText('Hello yunity')
})

```

## API
### Backend

#### `new MobpieBackend(http.Server)`
#### `backend.register(namespace, methods)`
methods get always called with a `Request` instance.
#### `req.send(...args)`
arguments get passed to the frontend callback

### Frontend
#### `new Mobpie()`
#### `api.connect(url, callback)`
#### `api.namespace.method(...args, callback)`
arguments get passed to `req.params` on the backend
