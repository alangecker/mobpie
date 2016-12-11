'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Request = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _mobx = require('mobx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = exports.Request = function Request(connection, req) {
  var _this = this;

  _classCallCheck(this, Request);

  this.send = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (_this.callbackId === null) return;
    _this.connection.send(_this.callbackId, args);
  };

  this.connection = connection;
  this.namespace = req[0];
  this.method = req[1];
  this.params = req[2];
  this.callbackId = req[3];
};

var Connection = function () {
  function Connection(ioClient, backend) {
    _classCallCheck(this, Connection);

    this.listening = true;

    this.ioClient = ioClient;
    this.backend = backend;
    this.state = (0, _mobx.observable)({});
    this.init();
  }

  _createClass(Connection, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.ioClient.on('req', function (data) {
        _this2.backend.dispatch(new Request(_this2, data));
      });
      this.ioClient.on('disconnect', function () {
        _this2.listening = false;
      });
      this.ioClient.emit('methods', this.backend.getMethods());
    }
  }, {
    key: 'send',
    value: function send(callbackId, data) {
      this.ioClient.emit('res', callbackId, data);
    }
  }]);

  return Connection;
}();

var Server = function () {
  function Server(httpServer) {
    var _this3 = this;

    _classCallCheck(this, Server);

    this.methods = {};

    this.io = (0, _socket2.default)(httpServer);
    this.io.on('connection', function (client) {
      new Connection(client, _this3);
    });
  }

  _createClass(Server, [{
    key: 'register',
    value: function register(namespace, methods) {
      if (!this.methods[namespace]) this.methods[namespace] = {};
      for (var method in methods) {
        this.methods[namespace][method] = methods[method];
      }
    }
  }, {
    key: 'dispatch',
    value: function dispatch(req) {
      var method = this.methods[req.namespace][req.method];
      if (req.callbackId === null) {
        method(req);
      } else {
        (0, _mobx.autorun)(function () {
          if (!req.connection.listening) return;
          method(req);
        });
      }
    }
  }, {
    key: 'getMethods',
    value: function getMethods() {
      var res = {};
      for (var namespace in this.methods) {
        res[namespace] = Object.keys(this.methods[namespace]);
      }
      return res;
    }
  }]);

  return Server;
}();

exports.default = Server;