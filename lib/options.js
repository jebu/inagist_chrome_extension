Options = {
  defaultOptions: {
    userid: undefined,
    alertTimeout: 8 * 1000,
    tweet_archived_limit: 4,
    autoClose: true,
    autoTrackTrends: false,
    autoTrackChannelTrends: false,
    searchText: undefined,
    websocketURL: "ws://websockets.inagist.com:18010/websockets_alert_stream",
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

  set: function(key, value) {
    this.cachedOptions[key] = value;
    localStorage[key] = value;
  }
};
