var Instaket = function(user, options){
  this.defaults = {
    url: "ws://websockets.inagist.com:18010/websockets_stream",
    retweets: false,
    trackwords: false,
    toplinks: false,
    toptweets: false,
    toptrends: false,
    level: 3,
    archive_limit: undefined,
    debug: false
  };
  this.settings = $.extend(this.defaults, options);
  this.userid = user;
  this.ws;
  this.chandler = 100;
  this.callbacks = [];
};
Instaket.prototype = {
  connect: function(){
    var self = this;
    if ("WebSocket" in window) {
      var ws = new WebSocket("ws://websockets.inagist.com:18010/websockets_stream");
      ws.onopen = function() {
        self.onopen.apply(self, arguments);
      };
      ws.onmessage = function(){
        self.onmessage.apply(self, arguments);
      };
      ws.onclose = function(){
        self.onclose.apply(self, arguments);
      };
      ws.onerror = function(){
        self.onerror.apply(self, arguments);
      };
      this.ws = ws;
    } else{
      this.ws = {};
      self.nosocket.apply(self, arguments);
    }
  },

  disconnect: function(){
    this.ws.close();
  },

  onopen: function(e){
    this.ws.send("stream " + this.userid);
    if (this.settings.retweets)
      this.ws.send("retweets_on");
    else
      this.ws.send("retweets_off");
    $(this).trigger('connection_opened', e);
  },
  onmessage: function(e){
    e = JSON.parse(e.data);
    if (this.settings.debug)
      console.log(e.data);
    if (e.error){
      $(this).trigger('error', e);
    }else if (e.status == "connected") {
      if (this.settings.trackwords)
        this.ws.send("trackwords " + this.userid);
      if (this.settings.toptrends)
        this.ws.send("toptrends " + this.userid + " " + this.settings.level);
      if (this.settings.toplinks)
        this.ws.send("toplinks " + this.userid + " " + this.settings.level);
      if (this.settings.toptweets)
        this.ws.send("toptweets " + this.userid + " " + this.settings.level);
      if (this.settings.archive_limit)
        this.ws.send("setlimit tweet_archived_limit " + this.settings.archive_limit);
      $(this).trigger('user_connected', e);
    }else if (typeof e.status != 'undefined') {
      $(this).trigger('status', e.status);
    }else if (typeof e.trackwords != 'undefined') {
      $(this).trigger('trackwords', [e.trackwords]);
    }else if (typeof e.toptrends != 'undefined') {
      $(this).trigger('toptrends', [e.toptrends]);
    }else if (typeof e.toplinks != 'undefined') {
      $(this).trigger('toplinks', [e.toplinks]);
    }else if (typeof e.toptweets != 'undefined') {
      $(this).trigger('toptweets', [e.toptweets]);
    }else if (typeof e.search_result != 'undefined') {
      $(this).trigger('search_result', e.search_result);
    }else if (typeof e.tweet_archived != 'undefined') {
      $(this).trigger('tweet_archived', e.tweet_archived);
    }else if (typeof e.trending_phrase != 'undefined') {
      $(this).trigger('trending_phrase', e.trending_phrase);
    }else if (typeof e.trending_personal_phrase != 'undefined') {
      $(this).trigger('trending_personal_phrase', e.trending_personal_phrase);
    }else if (typeof e.trending_channel_phrase != 'undefined') {
      $(this).trigger('trending_channel_phrase', e.trending_channel_phrase);
    }else if (typeof e.lookedup_tweetstat != 'undefined') {
      if (this.hasCallback(e.lookedup_tweetstat.corelation)){
        this.doCallback(e.lookedup_tweetstat.corelation, e.lookedup_tweetstat);
      } else
        $(this).trigger('lookedup_tweetstat', e.lookedup_tweetstat);
    }else if (typeof e.lookedup_url != 'undefined') {
      if (this.hasCallback(e.lookedup_url.corelation)){
        this.doCallback(e.lookedup_url.corelation, e.lookedup_url);
      } else
        $(this).trigger('lookedup_url', e.lookedup_url);
    }else if (typeof e.lookedup_tweet != 'undefined') {
      if (this.hasCallback(e.lookedup_tweet.corelation)){
        this.doCallback(e.lookedup_tweet.corelation, e.lookedup_tweet);
      } else
        $(this).trigger('lookedup_tweet', e.lookedup_tweet);
    }else if(typeof e.type != 'undefined'){
      $(this).trigger(e.type, e);
    }else{
      $(this).trigger('custom_event', e);
    }
  },
  onclose: function(e){
    $(this).trigger('connection_closed', e);
  },
  onerror: function(e){
    $(this).trigger('connection_errored', e);
  },
  hasCallback: function(index){
    return jQuery.isFunction(this.callbacks[index]);
  },
  doCallback: function(index, data){
    if (jQuery.isFunction(this.callbacks[index])){
      var callback = this.callbacks[index];
      delete this.callbacks[index];
      callback(data);
    }
  },
  addCallback: function(callback){
    var handlerid = "cback_" + this.chandler++;
    this.callbacks[handlerid] = callback;
    return handlerid;
  },
  nosocket: function(e){
    $(this).trigger('nosocket', e);
  },
  lookuptweet: function(tweetid, corelation){
    var query = "tweet " + tweetid;
    if (typeof corelation == 'function'){
      query += " " + this.addCallback(corelation);
    }else if (typeof corelation != 'undefined')
      query += " " + corelation;
    this.ws.send(query);
  },
  lookupurl: function(url, corelation){
    var query = "url " + url;
    if (typeof corelation == 'function'){
      query += " " + this.addCallback(corelation);
    }else if (typeof corelation != 'undefined')
      query += " " + corelation;
    this.ws.send(query);
  },
  lookuptweet_stat: function(tweetid, corelation){
    var query = "tweetstat " + tweetid;
    if (typeof corelation == 'function'){
      query += " " + this.addCallback(corelation);
    }else if (typeof corelation != 'undefined')
      query += " " + corelation;
    this.ws.send(query);
  },
  retweets_on: function(){
    this.settings.retweets = true;
    this.ws.send("retweets_on");
  },
  retweets_off: function(){
    this.settings.retweets = false;
    this.ws.send("retweets_off");
  },
  search: function(text){
    this.ws.send("search " + text);
  },
};
