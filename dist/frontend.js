'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Client = function () {
  function Client() {
    _classCallCheck(this, Client);

    this.callbackCalled = false;
    this.callbacks = {};
    this.nextCallbackId = 0;
  }

  _createClass(Client, [{
    key: 'connect',
    value: function connect(url, callback) {
      var _this = this;

      this.socket = io(url);
      this.socket.on('connect', function () {
        console.log('[client] connected');
      });
      this.socket.on('res', function (callbackId, args) {
        var _callbacks;

        (_callbacks = _this.callbacks)[callbackId].apply(_callbacks, _toConsumableArray(args));
      });
      this.socket.on('methods', function (methods) {
        _this.handleMethods(methods);
        if (!_this.callbackCalled) {
          callback();
        }
      });
      this.socket.on('disconnect', function () {
        console.log('[client] disconnected');
      });
    }
  }, {
    key: 'handleMethods',
    value: function handleMethods(methods) {
      for (var namespace in methods) {
        if (!this[namespace]) this[namespace] = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = methods[namespace][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var method = _step.value;

            this[namespace][method] = this.generateMethod(namespace, method);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }, {
    key: 'generateMethod',
    value: function generateMethod(namespace, method) {
      var _this2 = this;

      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var callbackId = null;
        if (typeof args[args.length - 1] == 'function') {
          callbackId = _this2.nextCallbackId++;
          _this2.callbacks[callbackId] = args.pop();
        }
        _this2.socket.emit('req', [namespace, method, args, callbackId]);
      };
    }
  }]);

  return Client;
}();

if (window) window.Mobpie = Client;else if (module) module.exports = Client;