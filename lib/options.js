Options = {
  defaultOptions: {
    userid: undefined,
    alertTimeout: 15 * 1000,
    autoClose: false,
    websocketURL: "ws://websockets.inagist.com:18010/websockets_alert_stream"
  },
  cachedOptions: null,

  init: function() {
    var storedVals = {};
    for (var key in this.defaultOptions) {
      storedVals[key] = localStorage[key];
    }
    this.cachedOptions = $.extend(true, {}, this.defaultOptions, storedVals);
  },

  get: function(key) {
    return this.cachedOptions[key];
  },

  set: function(key, value) {
    this.cachedOptions[key] = value;
    localStorage[key] = value;
  }
};
