# mobpie
 _flexible api layer for creating backends with MobX support_

### Important!
consider it more as an concept/draft, not as a working reliable module. Depending on the interest/feedback I would perhaps work on it.

### Features
- Provides backend methods on the frontend
which get automatically recalled on observable changes
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
  getText(cb) {
    cb(text.welcome)
  },
  setText(value) {
    text.welcome = value // <- magic happens here
  }
})
```

#### Frontend
```js
const api = new Mobpie
api.connect('http://localhost:5000', (err) => {
  api.demo.getText( (res) => {
    console.log('current text: '+res)
  })
  api.demo.setText('Hello yunity')
})

```

## API
### Backend

#### `new MobpieBackend(http.Server)`
#### `backend.register(namespace, methods)`
methods get always binded to `Request` instance.


### Frontend
#### `new Mobpie()`
#### `api.connect(url, callback)`
#### `api.namespace.method(...args, callback)`
