
class Client {
  callbackCalled = false
  callbacks = {}
  nextCallbackId = 0
  connect(url, callback) {
    this.socket = io(url)
    this.socket.on('connect', () => {
      console.log('[client] connected');

    });
    this.socket.on('res', (callbackId, args) => {
      this.callbacks[callbackId](...args)
    });
    this.socket.on('methods', (methods) => {
      this.handleMethods(methods)
      if(!this.callbackCalled) {
        callback()
      }
    });
    this.socket.on('disconnect', () => {
      console.log('[client] disconnected');
    });
  }
  handleMethods(methods) {
    for(let namespace in methods) {
      if(!this[namespace]) this[namespace] = {}
      for(let method of methods[namespace]) {
        this[namespace][method] = this.generateMethod(namespace,method)
      }
    }
  }
  generateMethod(namespace, method) {
    return (...args) => {
      let callbackId = null
      if(typeof args[args.length-1] == 'function') {
        callbackId = this.nextCallbackId++
        this.callbacks[callbackId] = args.pop()
      }
      this.socket.emit('req', [namespace,method,args,callbackId])
    }
  }
}

if(window) window.Mobpie = Client
else if(module) module.exports = Client
