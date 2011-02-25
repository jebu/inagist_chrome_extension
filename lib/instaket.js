/**
 *  Instaket - A javascript library for In-A-Gist websocket
 *
 *  @inagist
 *  This library provides an event based interface to the stream coming in from an inagist 
 *  websocket connection. Typical usage
 *  var iSocket = new Instaket(<userid>, <options>);
 *  iSocket.connect();
 *  $(iSocket).bind(<event name>, <handler function>);
 *
 *  This has a dependency on jQuery, events are triggered using jQuery on the instaket object.
 *  Events exposed
 *  - connection_opened
 *  - connection_closed
 *  - connection_errored
 *  - keep_alive
 *  - nosocket
 *
 *  - user_connected
 *  - error
 *  - status
 *
 *  - trackwords
 *  - toplinks
 *  - toptweets
 *  - toptrends
 *  - tweet_archived
 *  - tweet
 *  - retweeted_tweet
 *  - external_retweeted_tweet
 *  - search_result
 *
 *  Functions with callbacks
 *  - lookuptweet(<tweet id>, <callback>)
 *  - lookupurl(<url>, <callback>)
 *  - lookuptweet_stat(<tweet id>, <callback>)
 *
 *  Other functions
 *  - retweets_off() -> turn off retweets from people you dont follow
 *  - retweets_on() -> turn on retweets from people you dont follow
 *  - search(text) -> text to search for seperated by , will get search_result events with tweet ids
 *
 *  For full usage see background.html in chrome plugin
 **/
var Instaket = function(user, options){
  this.defaults = {
    url: "ws://websockets.inagist.com:18010/websockets_stream",
    retweets: false,
    trackwords: false,
    trackwords_with_stat: false,
    toplinks: false,
    toptweets: false,
    toptweets_m: false,
    toptrends: false,
    level: 3,
    archive_limit: undefined,
    live: true,
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
      var ws = new WebSocket(this.settings.url);
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
    if (typeof this.userid == 'string'){
      this.ws.send("stream " + this.userid);
    }
    $(this).trigger('connection_opened', e);
  },
  onmessage: function(event){
    if (this.settings.debug)
      console.log(event.data);
    var e = JSON.parse(event.data);
    if (e.error){
      $(this).trigger('error', e);
    }else if (e.status == "connected") {
      if (this.settings.trackwords)
        this.ws.send("trackwords " + this.userid);
      if (this.settings.trackwords_with_stat)
        this.ws.send("trackwordsstat " + this.userid);
      if (this.settings.toptrends)
        this.ws.send("toptrends " + this.userid + " " + this.settings.level);
      if (this.settings.toplinks)
        this.ws.send("toplinks " + this.userid + " " + this.settings.level);
      if (this.settings.toptweets)
        this.ws.send("toptweets " + this.userid + " " + this.settings.level);
      if (this.settings.toptweets_m)
        this.ws.send("toptweets " + this.userid + " " + this.settings.level + " tweet_cache");
      if (this.settings.archive_limit)
        this.ws.send("setlimit tweet_archived_limit " + this.settings.archive_limit);
      if (this.settings.retweets)
        this.ws.send("retweets_on");
      else
        this.ws.send("retweets_off");
      if (this.settings.live)
        this.ws.send("live_on");
      else
        this.ws.send("live_off");
      $(this).trigger('user_connected', e);
    }else if (e.type == "status") {
      $(this).trigger('status', e.status);
    }else if (e.type == "trackwords") {
      $(this).trigger('trackwords', [e.trackwords]);
    }else if (e.type == "toptrends") {
      $(this).trigger('toptrends', [e.toptrends]);
    }else if (e.type == "toplinks") {
      $(this).trigger('toplinks', [e.toplinks]);
    }else if (e.type == "toptweets") {
      $(this).trigger('toptweets', [e.toptweets]);
    }else if(typeof e.type != 'undefined'){
      var type = e.type;
      if (typeof e[type] != 'undefined')
        if (this.hasCallback(e[type].corelation))
          this.doCallback(e[type].corelation, e[type]);
        else
          $(this).trigger(type, e[type]);
      else
        $(this).trigger(type, e);
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
  live_on: function(){
    this.settings.live = true;
    this.ws.send("live_on");
  },
  live_off: function(){
    this.settings.live = false;
    this.ws.send("live_off");
  },
  search: function(text){
    if (typeof text == 'object'){
      if (typeof text.callback == 'function')
        text.corelation = this.addCallback(text.callback);
      this.ws.send("esearch " + JSON.stringify(text));
    } else
      this.ws.send("search " + text);
  },
};
