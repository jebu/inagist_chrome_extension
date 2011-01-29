Options = {
  defaultOptions: {
    userid: undefined,
    alertTimeout: 8 * 1000,
    relevanceTime: 2 * 60 * 60,
    tweet_archived_limit: 4,
    autoClose: true,
    autoTrackTrends: false,
    autoTrackChannelTrends: false,
    searchText: undefined,
    ignoredTrends: undefined,
    websocketURL: "ws://websockets.inagist.com:18010/websockets_alert_stream",
    websocketSecureURL: "wss://websockets.inagist.com/websockets_alert_stream",
    encrypt: false,
    debug: false,
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

  getBoolean: function(key) {
    return (this.cachedOptions[key] == true || this.cachedOptions[key] === 'true');
  },

  getInt: function(key) {
    return parseInt(this.cachedOptions[key]);
  },

  set: function(key, value) {
    this.cachedOptions[key] = value;
    localStorage[key] = value;
  }
};
