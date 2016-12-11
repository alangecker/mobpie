import io from 'socket.io'
import {observable, autorun} from 'mobx'


export class Request {
  constructor(connection, req) {
    this.connection = connection
    this.namespace = req[0]
    this.method = req[1]
    this.params = req[2]
    this.callbackId = req[3]
  }
  send = (...args) => {
    if(this.callbackId === null) return
    this.connection.send(this.callbackId, args)
  }

}


class Connection {
  listening = true
  constructor(ioClient, backend) {
    this.ioClient = ioClient
    this.backend = backend
    this.state = observable({})
    this.init()
  }
  init() {
    this.ioClient.on('req', (data) => {
      this.backend.dispatch(new Request(this, data))
    })
    this.ioClient.on('disconnect', () => {
      this.listening = false
    })
    this.ioClient.emit('methods', this.backend.getMethods())
  }
  send(callbackId, data) {
    this.ioClient.emit('res', callbackId, data)

  }
}

export default class Server {
  methods = {}
  constructor(httpServer) {
    this.io = io(httpServer)
    this.io.on('connection', (client) => {
      new Connection(client,this)
    })
  }
  register(namespace, methods) {
    if(!this.methods[namespace]) this.methods[namespace] = {}
    for(let method in methods) {
      this.methods[namespace][method] = methods[method]
    }
  }
  dispatch(req) {
    let method = this.methods[req.namespace][req.method]
    if(req.callbackId === null) {
      method(req)
    } else {
      autorun( () => {
        if(!req.connection.listening) return
        method(req)
      })
    }
  }
  getMethods() {
    let res = {}
    for(let namespace in this.methods) {
      res[namespace] = Object.keys(this.methods[namespace])
    }
    return res
  }
}
