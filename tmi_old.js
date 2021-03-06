! function e(t, s, n) {
    function i(r, a) {
        if (!s[r]) {
            if (!t[r]) {
                var c = "function" == typeof require && require;
                if (!a && c) return c(r, !0);
                if (o) return o(r, !0);
                var l = new Error("Cannot find module '" + r + "'");
                throw l.code = "MODULE_NOT_FOUND", l
            }
            var h = s[r] = {
                exports: {}
            };
            t[r][0].call(h.exports, function (e) {
                var s = t[r][1][e];
                return i(s ? s : e)
            }, h, h.exports, e, t, s, n)
        }
        return s[r].exports
    }
    for (var o = "function" == typeof require && require, r = 0; r < n.length; r++) i(n[r]);
    return i
}({
    1: [function (e, t, s) {
        "use strict";
        String.prototype.includes || (String.prototype.includes = function () {
            return -1 !== String.prototype.indexOf.apply(this, arguments)
        }), String.prototype.startsWith || (String.prototype.startsWith = function (e, t) {
            return t = t || 0, this.indexOf(e, t) === t
        }), Object.setPrototypeOf || (Object.setPrototypeOf = function (e, t) {
            return e.__proto__ = t, e
        }), t.exports = {
            client: e("./lib/client"),
            Client: e("./lib/client")
        }
    }, {
        "./lib/client": 3
    }],
    2: [function (e, t, s) {
        "use strict";
        var n = e("request"),
            i = e("./utils"),
            o = function (e, t) {
                var s = null === i.get(e.url, null) ? i.get(e.uri, null) : i.get(e.url, null);
                if (i.isURL(s) || (s = "/" === s.charAt(0) ? "https://api.twitch.tv/kraken" + s : "https://api.twitch.tv/kraken/" + s), i.isNode()) n(i.merge(e, {
                    url: s,
                    method: "GET",
                    json: !0
                }), function (e, s, n) {
                    t(e, s, n)
                });
                //else if (i.isExtension()) {
                else {
                    e = i.merge(e, {
                        url: s,
                        method: "GET",
                        headers: {}
                    });
                    var o = new XMLHttpRequest;
                    o.open(e.method, e.url, !0);
                    for (var r in e.headers) o.setRequestHeader(r, e.headers[r]);
                    o.responseType = "json", o.addEventListener("load", function (e) {
                        4 == o.readyState && (200 != o.status ? t(o.status, null, null) : t(null, null, o.response))
                    }), o.send()
                }/* else {
                    console.log("test123");
                    var a = "jsonp_callback_" + Math.round(1e5 * Math.random());
                    window[a] = function (e) {
                        delete window[a], document.body.removeChild(c), t(null, null, e)
                    };
                    var c = document.createElement("script");
                    c.src = "" + s + (s.indexOf("?") >= 0 ? "&" : "?") + "callback=" + a, document.body.appendChild(c)
                }*/
            };
        t.exports = o
    }, {
        "./utils": 9,
        request: 10
    }],
    3: [function (e, t, s) {
        (function (s) {
            "use strict";
            var n = e("./api"),
                i = e("./commands"),
                o = e("./events").EventEmitter,
                r = e("./logger"),
                a = e("./parser"),
                c = e("./timer"),
                l = s.WebSocket || s.MozWebSocket || e("ws"),
                h = e("./utils"),
                u = function f(e) {
                    if (this instanceof f == !1) return new f(e);
                    this.setMaxListeners(0), this.opts = h.get(e, {}), this.opts.channels = this.opts.channels || [], this.opts.connection = this.opts.connection || {}, this.opts.identity = this.opts.identity || {}, this.opts.options = this.opts.options || {}, this.clientId = h.get(this.opts.options.clientId, null), this.maxReconnectAttempts = h.get(this.opts.connection.maxReconnectAttempts, 1 / 0), this.maxReconnectInterval = h.get(this.opts.connection.maxReconnectInterval, 3e4), this.reconnect = h.get(this.opts.connection.reconnect, !1), this.reconnectDecay = h.get(this.opts.connection.reconnectDecay, 1.5), this.reconnectInterval = h.get(this.opts.connection.reconnectInterval, 1e3), this.reconnecting = !1, this.reconnections = 0, this.reconnectTimer = this.reconnectInterval, this.secure = h.get(this.opts.connection.secure, !1), this.emotes = "", this.emotesets = {}, this.channels = [], this.currentLatency = 0, this.globaluserstate = {}, this.lastJoined = "", this.latency = new Date, this.moderators = {}, this.pingLoop = null, this.pingTimeout = null, this.reason = "", this.username = "", this.userstate = {}, this.wasCloseCalled = !1, this.ws = null;
                    var t = "error";
                    this.opts.options.debug && (t = "info"), this.log = this.opts.logger || r;
                    try {
                        r.setLevel(t)
                    } catch (s) {}
                    this.opts.channels.forEach(function (e, t, s) {
                        s[t] = h.channel(e)
                    }), o.call(this)
                };
            h.inherits(u, o), u.prototype.api = n;
            for (var m in i) u.prototype[m] = i[m];
            u.prototype.handleMessage = function (e) {
                var t = this;
                if (!h.isNull(e)) {
                    var s = h.channel(h.get(e.params[0], null)),
                        n = h.get(e.params[1], null),
                        i = h.get(e.tags["msg-id"], null);
                    if (e.tags = a.badges(a.emotes(e.tags)), e.tags)
                        for (var o in e.tags) "emote-sets" !== o && "ban-duration" !== o && "bits" !== o && (h.isBoolean(e.tags[o]) ? e.tags[o] = null : "1" === e.tags[o] ? e.tags[o] = !0 : "0" === e.tags[o] && (e.tags[o] = !1));
                    if (h.isNull(e.prefix)) switch (e.command) {
                        case "PING":
                            this.emit("ping"), h.isNull(this.ws) || 2 === this.ws.readyState || 3 === this.ws.readyState || this.ws.send("PONG");
                            break;
                        case "PONG":
                            var r = new Date;
                            this.currentLatency = (r.getTime() - this.latency.getTime()) / 1e3, this.emits(["pong", "_promisePing"], [
                                [this.currentLatency],
                                [this.currentLatency]
                            ]), clearTimeout(this.pingTimeout);
                            break;
                        default:
                            this.log.warn("Could not parse message with no prefix:\n" + JSON.stringify(e, null, 4))
                    } else if ("tmi.twitch.tv" === e.prefix) switch (e.command) {
                        case "002":
                        case "003":
                        case "004":
                        case "375":
                        case "376":
                        case "CAP":
                            break;
                        case "001":
                            this.username = e.params[0];
                            break;
                        case "372":
                            this.log.info("Connected to server."), this.userstate["#tmijs"] = {}, this.emits(["connected", "_promiseConnect"], [
                                [this.server, this.port],
                                [null]
                            ]), this.reconnections = 0, this.reconnectTimer = this.reconnectInterval, this.pingLoop = setInterval(function () {
                                h.isNull(t.ws) || 2 === t.ws.readyState || 3 === t.ws.readyState || t.ws.send("PING"), t.latency = new Date, t.pingTimeout = setTimeout(function () {
                                    h.isNull(t.ws) || (t.wasCloseCalled = !1, t.log.error("Ping timeout."), t.ws.close(), clearInterval(t.pingLoop), clearTimeout(t.pingTimeout))
                                }, h.get(t.opts.connection.timeout, 9999))
                            }, 6e4);
                            var l = new c.queue(2e3),
                                u = h.union(this.opts.channels, this.channels);
                            this.channels = [];
                            for (var m = 0; m < u.length; m++) {
                                var f = this;
                                l.add(function (e) {
                                    h.isNull(f.ws) || 2 === f.ws.readyState || 3 === f.ws.readyState || f.ws.send("JOIN " + h.channel(u[e]))
                                }.bind(this, m))
                            }
                            l.run();
                            break;
                        case "NOTICE":
                            switch (i) {
                                case "subs_on":
                                    this.log.info("[" + s + "] This room is now in subscribers-only mode."), this.emits(["subscriber", "subscribers", "_promiseSubscribers"], [
                                        [s, !0],
                                        [s, !0],
                                        [null]
                                    ]);
                                    break;
                                case "subs_off":
                                    this.log.info("[" + s + "] This room is no longer in subscribers-only mode."), this.emits(["subscriber", "subscribers", "_promiseSubscribersoff"], [
                                        [s, !1],
                                        [s, !1],
                                        [null]
                                    ]);
                                    break;
                                case "emote_only_on":
                                    this.log.info("[" + s + "] This room is now in emote-only mode."), this.emits(["emoteonly", "_promiseEmoteonly"], [
                                        [s, !0],
                                        [null]
                                    ]);
                                    break;
                                case "emote_only_off":
                                    this.log.info("[" + s + "] This room is no longer in emote-only mode."), this.emits(["emoteonly", "_promiseEmoteonlyoff"], [
                                        [s, !1],
                                        [null]
                                    ]);
                                    break;
                                case "slow_on":
                                case "slow_off":
                                    break;
                                case "followers_on_zero":
                                case "followers_on":
                                case "followers_off":
                                    break;
                                case "r9k_on":
                                    this.log.info("[" + s + "] This room is now in r9k mode."), this.emits(["r9kmode", "r9kbeta", "_promiseR9kbeta"], [
                                        [s, !0],
                                        [s, !0],
                                        [null]
                                    ]);
                                    break;
                                case "r9k_off":
                                    this.log.info("[" + s + "] This room is no longer in r9k mode."), this.emits(["r9kmode", "r9kbeta", "_promiseR9kbetaoff"], [
                                        [s, !1],
                                        [s, !1],
                                        [null]
                                    ]);
                                    break;
                                case "room_mods":
                                    for (var p = n.split(":"), d = p[1].replace(/,/g, "").split(":").toString().toLowerCase().split(" "), m = d.length - 1; m >= 0; m--) "" === d[m] && d.splice(m, 1);
                                    this.emits(["_promiseMods", "mods"], [
                                        [null, d],
                                        [s, d]
                                    ]);
                                    break;
                                case "no_mods":
                                    this.emit("_promiseMods", null, []);
                                    break;
                                case "msg_channel_suspended":
                                    this.emits(["notice", "_promiseJoin"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "already_banned":
                                case "bad_ban_admin":
                                case "bad_ban_broadcaster":
                                case "bad_ban_global_mod":
                                case "bad_ban_self":
                                case "bad_ban_staff":
                                case "usage_ban":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseBan"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "ban_success":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseBan"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "usage_clear":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseClear"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "usage_mods":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseMods"], [
                                        [s, i, n],
                                        [i, []]
                                    ]);
                                    break;
                                case "mod_success":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseMod"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "usage_mod":
                                case "bad_mod_banned":
                                case "bad_mod_mod":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseMod"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "unmod_success":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseUnmod"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "usage_unmod":
                                case "bad_unmod_mod":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseUnmod"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "color_changed":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseColor"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "usage_color":
                                case "turbo_only_color":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseColor"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "commercial_success":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseCommercial"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "usage_commercial":
                                case "bad_commercial_error":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseCommercial"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "hosts_remaining":
                                    this.log.info("[" + s + "] " + n);
                                    var g = isNaN(n.charAt(0)) ? 0 : n.charAt(0);
                                    this.emits(["notice", "_promiseHost"], [
                                        [s, i, n],
                                        [null, ~~g]
                                    ]);
                                    break;
                                case "bad_host_hosting":
                                case "bad_host_rate_exceeded":
                                case "bad_host_error":
                                case "usage_host":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseHost"], [
                                        [s, i, n],
                                        [i, null]
                                    ]);
                                    break;
                                case "already_r9k_on":
                                case "usage_r9k_on":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseR9kbeta"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "already_r9k_off":
                                case "usage_r9k_off":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseR9kbetaoff"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "timeout_success":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseTimeout"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "already_subs_off":
                                case "usage_subs_off":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseSubscribersoff"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "already_subs_on":
                                case "usage_subs_on":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseSubscribers"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "already_emote_only_off":
                                case "usage_emote_only_off":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseEmoteonlyoff"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "already_emote_only_on":
                                case "usage_emote_only_on":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseEmoteonly"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "usage_slow_on":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseSlow"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "usage_slow_off":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseSlowoff"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "usage_timeout":
                                case "bad_timeout_admin":
                                case "bad_timeout_broadcaster":
                                case "bad_timeout_duration":
                                case "bad_timeout_global_mod":
                                case "bad_timeout_self":
                                case "bad_timeout_staff":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseTimeout"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "unban_success":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseUnban"], [
                                        [s, i, n],
                                        [null]
                                    ]);
                                    break;
                                case "usage_unban":
                                case "bad_unban_no_ban":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseUnban"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "usage_unhost":
                                case "not_hosting":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseUnhost"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "whisper_invalid_login":
                                case "whisper_invalid_self":
                                case "whisper_limit_per_min":
                                case "whisper_limit_per_sec":
                                case "whisper_restricted_recipient":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseWhisper"], [
                                        [s, i, n],
                                        [i]
                                    ]);
                                    break;
                                case "no_permission":
                                case "msg_banned":
                                    this.log.info("[" + s + "] " + n), this.emits(["notice", "_promiseBan", "_promiseClear", "_promiseUnban", "_promiseTimeout", "_promiseMod", "_promiseUnmod", "_promiseCommercial", "_promiseHost", "_promiseUnhost", "_promiseR9kbeta", "_promiseR9kbetaoff", "_promiseSlow", "_promiseSlowoff", "_promiseFollowers", "_promiseFollowersoff", "_promiseSubscribers", "_promiseSubscribersoff", "_promiseEmoteonly", "_promiseEmoteonlyoff"], [
                                        [s, i, n],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i],
                                        [i]
                                    ]);
                                    break;
                                case "unrecognized_cmd":
                                    this.log.info("[" + s + "] " + n), this.emit("notice", s, i, n), "/w" === n.split(" ").splice(-1)[0] && this.log.warn("You must be connected to a group server to send or receive whispers.");
                                    break;
                                case "cmds_available":
                                case "host_target_went_offline":
                                case "msg_censored_broadcaster":
                                case "msg_duplicate":
                                case "msg_emoteonly":
                                case "msg_verified_email":
                                case "msg_ratelimit":
                                case "msg_subsonly":
                                case "msg_timedout":
                                case "no_help":
                                case "usage_disconnect":
                                case "usage_help":
                                case "usage_me":
                                    this.log.info("[" + s + "] " + n), this.emit("notice", s, i, n);
                                    break;
                                case "host_on":
                                case "host_off":
                                    break;
                                default:
                                    n.includes("Login unsuccessful") || n.includes("Login authentication failed") ? (this.wasCloseCalled = !1, this.reconnect = !1, this.reason = n, this.log.error(this.reason), this.ws.close()) : n.includes("Error logging in") || n.includes("Improperly formatted auth") ? (this.wasCloseCalled = !1, this.reconnect = !1, this.reason = n, this.log.error(this.reason), this.ws.close()) : n.includes("Invalid NICK") ? (this.wasCloseCalled = !1, this.reconnect = !1, this.reason = "Invalid NICK.", this.log.error(this.reason), this.ws.close()) : this.log.warn("Could not parse NOTICE from tmi.twitch.tv:\n" + JSON.stringify(e, null, 4))
                            }
                            break;
                        case "USERNOTICE":
                            if ("resub" === i) {
                                var _ = e.tags["display-name"] || e.tags.login,
                                    b = e.tags["msg-param-sub-plan"],
                                    y = h.replaceAll(h.get(e.tags["msg-param-sub-plan-name"], null), {
                                        "\\\\s": " ",
                                        "\\\\:": ";",
                                        "\\\\\\\\": "\\",
                                        "\\r": "\r",
                                        "\\n": "\n"
                                    }),
                                    v = h.get(~~e.tags["msg-param-months"], null),
                                    w = b.includes("Prime"),
                                    C = null;
                                n && (C = e.tags, C["message-type"] = "resub"), this.emits(["resub", "subanniversary"], [
                                    [s, _, v, n, C, {
                                        prime: w,
                                        plan: b,
                                        planName: y
                                    }],
                                    [s, _, v, n, C, {
                                        prime: w,
                                        plan: b,
                                        planName: y
                                    }]
                                ])
                            } else if ("sub" == i) {
                                var _ = e.tags["display-name"] || e.tags.login,
                                    b = e.tags["msg-param-sub-plan"],
                                    y = h.replaceAll(h.get(e.tags["msg-param-sub-plan-name"], null), {
                                        "\\\\s": " ",
                                        "\\\\:": ";",
                                        "\\\\\\\\": "\\",
                                        "\\r": "\r",
                                        "\\n": "\n"
                                    }),
                                    w = b.includes("Prime"),
                                    C = null;
                                n && (C = e.tags, C["message-type"] = "sub"), this.emit("subscription", s, _, {
                                    prime: w,
                                    plan: b,
                                    planName: y
                                }, n, C)
                            }
                            break;
                        case "HOSTTARGET":
                            if ("-" === n.split(" ")[0]) this.log.info("[" + s + "] Exited host mode."), this.emits(["unhost", "_promiseUnhost"], [
                                [s, ~~n.split(" ")[1] || 0],
                                [null]
                            ]);
                            else {
                                var k = ~~n.split(" ")[1] || 0;
                                this.log.info("[" + s + "] Now hosting " + n.split(" ")[0] + " for " + k + " viewer(s)."), this.emit("hosting", s, n.split(" ")[0], k)
                            }
                            break;
                        case "CLEARCHAT":
                            if (e.params.length > 1) {
                                var x = h.get(e.tags["ban-duration"], null),
                                    T = h.replaceAll(h.get(e.tags["ban-reason"], null), {
                                        "\\\\s": " ",
                                        "\\\\:": ";",
                                        "\\\\\\\\": "\\",
                                        "\\r": "\r",
                                        "\\n": "\n"
                                    });
                                h.isNull(x) ? (this.log.info("[" + s + "] " + n + " has been banned. Reason: " + (T || "n/a")), this.emit("ban", s, n, T)) : (this.log.info("[" + s + "] " + n + " has been timed out for " + x + " seconds. Reason: " + (T || "n/a")), this.emit("timeout", s, n, T, ~~x))
                            } else this.log.info("[" + s + "] Chat was cleared by a moderator."), this.emits(["clearchat", "_promiseClear"], [
                                [s],
                                [null]
                            ]);
                            break;
                        case "RECONNECT":
                            this.log.info("Received RECONNECT request from Twitch.."), this.log.info("Disconnecting and reconnecting in " + Math.round(this.reconnectTimer / 1e3) + " seconds.."), this.disconnect(), setTimeout(function () {
                                t.connect()
                            }, this.reconnectTimer);
                            break;
                        case "SERVERCHANGE":
                            break;
                        case "USERSTATE":
                            e.tags.username = this.username, "mod" === e.tags["user-type"] && (this.moderators[this.lastJoined] || (this.moderators[this.lastJoined] = []), this.moderators[this.lastJoined].indexOf(this.username) < 0 && this.moderators[this.lastJoined].push(this.username)), h.isJustinfan(this.getUsername()) || this.userstate[s] || (this.userstate[s] = e.tags, this.lastJoined = s, this.channels.push(s), this.log.info("Joined " + s), this.emit("join", s, h.username(this.getUsername()), !0)), e.tags["emote-sets"] !== this.emotes && this._updateEmoteset(e.tags["emote-sets"]), this.userstate[s] = e.tags;
                            break;
                        case "GLOBALUSERSTATE":
                            this.globaluserstate = e.tags, "undefined" != typeof e.tags["emote-sets"] && this._updateEmoteset(e.tags["emote-sets"]);
                            break;
                        case "ROOMSTATE":
                            if (h.channel(this.lastJoined) === h.channel(e.params[0]) && this.emit("_promiseJoin", null), e.tags.channel = h.channel(e.params[0]), this.emit("roomstate", h.channel(e.params[0]), e.tags), e.tags.hasOwnProperty("slow") && !e.tags.hasOwnProperty("subs-only") && ("boolean" == typeof e.tags.slow ? (this.log.info("[" + s + "] This room is no longer in slow mode."), this.emits(["slow", "slowmode", "_promiseSlowoff"], [
                                    [s, !1, 0],
                                    [s, !1, 0],
                                    [null]
                                ])) : (this.log.info("[" + s + "] This room is now in slow mode."), this.emits(["slow", "slowmode", "_promiseSlow"], [
                                    [s, !0, ~~e.tags.slow],
                                    [s, !0, ~~e.tags.slow],
                                    [null]
                                ]))), e.tags.hasOwnProperty("followers-only") && !e.tags.hasOwnProperty("subs-only"))
                                if ("-1" === e.tags["followers-only"]) this.log.info("[" + s + "] This room is no longer in followers-only mode."), this.emits(["followersonly", "followersmode", "_promiseFollowersoff"], [
                                    [s, !1, 0],
                                    [s, !1, 0],
                                    [null]
                                ]);
                                else {
                                    var S = ~~e.tags["followers-only"];
                                    this.log.info("[" + s + "] This room is now in follower-only mode."), this.emits(["followersonly", "followersmode", "_promiseFollowers"], [
                                        [s, !0, S],
                                        [s, !0, S],
                                        [null]
                                    ])
                                }
                            break;
                        default:
                            this.log.warn("Could not parse message from tmi.twitch.tv:\n" + JSON.stringify(e, null, 4))
                    } else if ("jtv" === e.prefix) switch (e.command) {
                        case "MODE":
                            "+o" === n ? (this.moderators[s] || (this.moderators[s] = []), this.moderators[s].indexOf(e.params[2]) < 0 && this.moderators[s].push(e.params[2]), this.emit("mod", s, e.params[2])) : "-o" === n && (this.moderators[s] || (this.moderators[s] = []), this.moderators[s].filter(function (t) {
                                return t != e.params[2]
                            }), this.emit("unmod", s, e.params[2]));
                            break;
                        default:
                            this.log.warn("Could not parse message from jtv:\n" + JSON.stringify(e, null, 4))
                    } else switch (e.command) {
                        case "353":
                            this.emit("names", e.params[2], e.params[3].split(" "));
                            break;
                        case "366":
                            break;
                        case "JOIN":
                            h.isJustinfan(this.getUsername()) && this.username === e.prefix.split("!")[0] && (this.lastJoined = s, this.channels.push(s), this.log.info("Joined " + s), this.emit("join", s, e.prefix.split("!")[0], !0)), this.username !== e.prefix.split("!")[0] && this.emit("join", s, e.prefix.split("!")[0], !1);
                            break;
                        case "PART":
                            var E = !1;
                            if (this.username === e.prefix.split("!")[0]) {
                                E = !0, this.userstate[s] && delete this.userstate[s];
                                var O = this.channels.indexOf(s); - 1 !== O && this.channels.splice(O, 1);
                                var O = this.opts.channels.indexOf(s); - 1 !== O && this.opts.channels.splice(O, 1), this.log.info("Left " + s), this.emit("_promisePart", null)
                            }
                            this.emit("part", s, e.prefix.split("!")[0], E);
                            break;
                        case "WHISPER":
                            this.log.info("[WHISPER] <" + e.prefix.split("!")[0] + ">: " + n), e.tags.hasOwnProperty("username") || (e.tags.username = e.prefix.split("!")[0]), e.tags["message-type"] = "whisper";
                            var N = h.channel(e.tags.username);
                            this.emits(["whisper", "message"], [
                                [N, e.tags, n, !1],
                                [N, e.tags, n, !1]
                            ]);
                            break;
                        case "PRIVMSG":
                            if (e.tags.username = e.prefix.split("!")[0], "jtv" === e.tags.username)
                                if (n.includes("hosting you for")) {
                                    var P = h.extractNumber(n);
                                    this.emit("hosted", s, h.username(n.split(" ")[0]), P, n.includes("auto"))
                                } else n.includes("hosting you") && this.emit("hosted", s, h.username(n.split(" ")[0]), 0, n.includes("auto"));
                            else n.match(/^\u0001ACTION ([^\u0001]+)\u0001$/) ? (e.tags["message-type"] = "action", this.log.info("[" + s + "] *<" + e.tags.username + ">: " + n.match(/^\u0001ACTION ([^\u0001]+)\u0001$/)[1]), this.emits(["action", "message"], [
                                [s, e.tags, n.match(/^\u0001ACTION ([^\u0001]+)\u0001$/)[1], !1],
                                [s, e.tags, n.match(/^\u0001ACTION ([^\u0001]+)\u0001$/)[1], !1]
                            ])) : e.tags.hasOwnProperty("bits") ? this.emit("cheer", s, e.tags, n) : (e.tags["message-type"] = "chat", this.log.info("[" + s + "] <" + e.tags.username + ">: " + n), this.emits(["chat", "message"], [
                                [s, e.tags, n, !1],
                                [s, e.tags, n, !1]
                            ]));
                            break;
                        default:
                            this.log.warn("Could not parse message:\n" + JSON.stringify(e, null, 4))
                    }
                }
            }, u.prototype.connect = function () {
                var e = this;
                return new Promise(function (t, s) {
                    e.server = h.get(e.opts.connection.server, "irc-ws.chat.twitch.tv"), e.port = h.get(e.opts.connection.port, 80), e.secure && (e.port = 443), 443 === e.port && (e.secure = !0), e.reconnectTimer = e.reconnectTimer * e.reconnectDecay, e.reconnectTimer >= e.maxReconnectInterval && (e.reconnectTimer = e.maxReconnectInterval), e._openConnection(), e.once("_promiseConnect", function (n) {
                        n ? s(n) : t([e.server, ~~e.port])
                    })
                })
            }, u.prototype._openConnection = function () {
                this.ws = new l((this.secure ? "wss" : "ws") + "://" + this.server + ":" + this.port + "/", "irc"), this.ws.onmessage = this._onMessage.bind(this), this.ws.onerror = this._onError.bind(this), this.ws.onclose = this._onClose.bind(this), this.ws.onopen = this._onOpen.bind(this)
            }, u.prototype._onOpen = function () {
                h.isNull(this.ws) || 1 !== this.ws.readyState || (this.log.info("Connecting to " + this.server + " on port " + this.port + ".."), this.emit("connecting", this.server, ~~this.port), this.username = h.get(this.opts.identity.username, h.justinfan()), this.password = h.password(h.get(this.opts.identity.password, "SCHMOOPIIE")), this.log.info("Sending authentication to server.."), this.emit("logon"), this.ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership"), this.ws.send("PASS " + this.password), this.ws.send("NICK " + this.username), this.ws.send("USER " + this.username + " 8 * :" + this.username))
            }, u.prototype._onMessage = function (e) {
                var t = this,
                    s = e.data.split("\r\n");
                s.forEach(function (e) {
                    h.isNull(e) || t.handleMessage(a.msg(e))
                })
            }, u.prototype._onError = function () {
                var e = this;
                this.moderators = {}, this.userstate = {}, this.globaluserstate = {}, clearInterval(this.pingLoop), clearTimeout(this.pingTimeout), this.reason = h.isNull(this.ws) ? "Connection closed." : "Unable to connect.", this.emits(["_promiseConnect", "disconnected"], [
                    [this.reason],
                    [this.reason]
                ]), this.reconnect && this.reconnections === this.maxReconnectAttempts && (this.emit("maxreconnect"), this.log.error("Maximum reconnection attempts reached.")), this.reconnect && !this.reconnecting && this.reconnections <= this.maxReconnectAttempts - 1 && (this.reconnecting = !0, this.reconnections = this.reconnections + 1, this.log.error("Reconnecting in " + Math.round(this.reconnectTimer / 1e3) + " seconds.."), this.emit("reconnect"), setTimeout(function () {
                    e.reconnecting = !1, e.connect()
                }, this.reconnectTimer)), this.ws = null
            }, u.prototype._onClose = function () {
                var e = this;
                this.moderators = {}, this.userstate = {}, this.globaluserstate = {}, clearInterval(this.pingLoop), clearTimeout(this.pingTimeout), this.wasCloseCalled ? (this.wasCloseCalled = !1, this.reason = "Connection closed.", this.log.info(this.reason), this.emits(["_promiseConnect", "_promiseDisconnect", "disconnected"], [
                    [this.reason],
                    [null],
                    [this.reason]
                ])) : (this.emits(["_promiseConnect", "disconnected"], [
                    [this.reason],
                    [this.reason]
                ]), this.reconnect && this.reconnections === this.maxReconnectAttempts && (this.emit("maxreconnect"), this.log.error("Maximum reconnection attempts reached.")), this.reconnect && !this.reconnecting && this.reconnections <= this.maxReconnectAttempts - 1 && (this.reconnecting = !0, this.reconnections = this.reconnections + 1, this.log.error("Could not connect to server. Reconnecting in " + Math.round(this.reconnectTimer / 1e3) + " seconds.."), this.emit("reconnect"), setTimeout(function () {
                    e.reconnecting = !1, e.connect()
                }, this.reconnectTimer))), this.ws = null
            }, u.prototype._getPromiseDelay = function () {
                return this.currentLatency <= 600 ? 600 : this.currentLatency + 100
            }, u.prototype._sendCommand = function (e, t, s, n) {
                var i = this;
                return new Promise(function (o, r) {
                    h.promiseDelay(e).then(function () {
                        r("No response from Twitch.")
                    }), h.isNull(i.ws) || 2 === i.ws.readyState || 3 === i.ws.readyState ? r("Not connected to server.") : (h.isNull(t) ? (i.log.info("Executing command: " + s), i.ws.send(s)) : (i.log.info("[" + h.channel(t) + "] Executing command: " + s), i.ws.send("PRIVMSG " + h.channel(t) + " :" + s)), n(o, r))
                })
            }, u.prototype._sendMessage = function (e, t, s, n) {
                var i = this;
                return new Promise(function (o, r) {
                    if (h.isNull(i.ws) || 2 === i.ws.readyState || 3 === i.ws.readyState || h.isJustinfan(i.getUsername())) r("Not connected to server.");
                    else {
                        if (i.userstate[h.channel(t)] || (i.userstate[h.channel(t)] = {}), s.length >= 500) {
                            var c = h.splitLine(s, 500);
                            s = c[0], setTimeout(function () {
                                i._sendMessage(e, t, c[1], function () {})
                            }, 350)
                        }
                        i.ws.send("PRIVMSG " + h.channel(t) + " :" + s);
                        var l = {};
                        Object.keys(i.emotesets).forEach(function (e) {
                            i.emotesets[e].forEach(function (e) {
                                return h.isRegex(e.code) ? a.emoteRegex(s, e.code, e.id, l) : void a.emoteString(s, e.code, e.id, l)
                            })
                        });
                        var u = h.merge(i.userstate[h.channel(t)], a.emotes({
                            emotes: a.transformEmotes(l) || null
                        }));
                        s.match(/^\u0001ACTION ([^\u0001]+)\u0001$/) ? (u["message-type"] = "action", i.log.info("[" + h.channel(t) + "] *<" + i.getUsername() + ">: " + s.match(/^\u0001ACTION ([^\u0001]+)\u0001$/)[1]), i.emits(["action", "message"], [
                            [h.channel(t), u, s.match(/^\u0001ACTION ([^\u0001]+)\u0001$/)[1], !0],
                            [h.channel(t), u, s.match(/^\u0001ACTION ([^\u0001]+)\u0001$/)[1], !0]
                        ])) : (u["message-type"] = "chat", i.log.info("[" + h.channel(t) + "] <" + i.getUsername() + ">: " + s), i.emits(["chat", "message"], [
                            [h.channel(t), u, s, !0],
                            [h.channel(t), u, s, !0]
                        ])), n(o, r)
                    }
                })
            }, u.prototype._updateEmoteset = function (e) {
                var t = this;
                this.emotes = e, this.api({
                    url: "/chat/emoticon_images?emotesets=" + e,
                    headers: {
                        Authorization: "OAuth " + h.password(h.get(this.opts.identity.password, "")).replace("oauth:", ""),
                        "Client-ID": this.clientId
                    }
                }, function (s, n, i) {
                    return s ? void setTimeout(function () {
                        t._updateEmoteset(e)
                    }, 6e4) : (t.emotesets = i.emoticon_sets || {}, t.emit("emotesets", e, t.emotesets))
                })
            }, u.prototype.getUsername = function () {
                return this.username
            }, u.prototype.getOptions = function () {
                return this.opts
            }, u.prototype.getChannels = function () {
                return this.channels
            }, u.prototype.isMod = function (e, t) {
                return this.moderators[h.channel(e)] || (this.moderators[h.channel(e)] = []), this.moderators[h.channel(e)].indexOf(h.username(t)) >= 0
            }, u.prototype.readyState = function () {
                return h.isNull(this.ws) ? "CLOSED" : ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][this.ws.readyState]
            }, u.prototype.disconnect = function () {
                var e = this;
                return new Promise(function (t, s) {
                    h.isNull(e.ws) || 3 === e.ws.readyState ? (e.log.error("Cannot disconnect from server. Socket is not opened or connection is already closing."), s("Cannot disconnect from server. Socket is not opened or connection is already closing.")) : (e.wasCloseCalled = !0, e.log.info("Disconnecting from server.."), e.ws.close(), e.once("_promiseDisconnect", function () {
                        t([e.server, ~~e.port])
                    }))
                })
            }, u.prototype.utils = {
                levenshtein: function (e, t, s) {
                    var n = 1,
                        i = 1,
                        o = 1;
                    if (s = h.get(s, !1), s || (e = e.toLowerCase(), t = t.toLowerCase()), e == t) return 0;
                    var r = e.length,
                        a = t.length;
                    if (0 === r) return a * n;
                    if (0 === a) return r * o;
                    var c = !1;
                    try {
                        c = !"0" [0]
                    } catch (l) {
                        c = !0
                    }
                    c && (e = e.split(""), t = t.split(""));
                    var u, m, f, p, d, g, _ = new Array(a + 1),
                        b = new Array(a + 1);
                    for (m = 0; a >= m; m++) _[m] = m * n;
                    for (u = 0; r > u; u++) {
                        for (b[0] = _[0] + o, m = 0; a > m; m++) f = _[m] + (e[u] == t[m] ? 0 : i), p = _[m + 1] + o, f > p && (f = p), d = b[m] + n, f > d && (f = d), b[m + 1] = f;
                        g = _, _ = b, b = g
                    }
                    return f = _[a]
                },
                raffle: {
                    init: function (e) {
                        this.raffleChannels || (this.raffleChannels = {}), this.raffleChannels[h.channel(e)] || (this.raffleChannels[h.channel(e)] = [])
                    },
                    enter: function (e, t) {
                        this.init(e), this.raffleChannels[h.channel(e)].push(t.toLowerCase())
                    },
                    leave: function (e, t) {
                        this.init(e);
                        var s = this.raffleChannels[h.channel(e)].indexOf(h.username(t));
                        return s >= 0 ? (this.raffleChannels[h.channel(e)].splice(s, 1), !0) : !1
                    },
                    pick: function (e) {
                        this.init(e);
                        var t = this.raffleChannels[h.channel(e)].length;
                        return t >= 1 ? this.raffleChannels[h.channel(e)][Math.floor(Math.random() * t)] : null
                    },
                    reset: function (e) {
                        this.init(e), this.raffleChannels[h.channel(e)] = []
                    },
                    count: function (e) {
                        return this.init(e), this.raffleChannels[h.channel(e)] ? this.raffleChannels[h.channel(e)].length : 0
                    },
                    isParticipating: function (e, t) {
                        return this.init(e), this.raffleChannels[h.channel(e)].indexOf(h.username(t)) >= 0
                    }
                },
                symbols: function (e) {
                    for (var t = 0, s = 0; s < e.length; s++) {
                        var n = e.substring(s, s + 1).charCodeAt(0);
                        (30 >= n || n >= 127 || 65533 === n) && t++
                    }
                    return Math.ceil(t / e.length * 100) / 100
                },
                uppercase: function (e) {
                    var t = e.length,
                        s = e.match(/[A-Z]/g);
                    return h.isNull(s) ? 0 : s.length / t
                }
            }, "undefined" != typeof t && t.exports && (t.exports = u), "undefined" != typeof window && (window.tmi = {}, window.tmi.client = u)
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
        "./api": 2,
        "./commands": 4,
        "./events": 5,
        "./logger": 6,
        "./parser": 7,
        "./timer": 8,
        "./utils": 9,
        ws: 10
    }],
    4: [function (e, t, s) {
        "use strict";

        function n(e, t) {
            var s = this;
            return e = h.channel(e), t = h.get(t, 30), this._sendCommand(this._getPromiseDelay(), e, "/followers " + t, function (n, i) {
                s.once("_promiseFollowers", function (s) {
                    s ? i(s) : n([e, ~~t])
                })
            })
        }

        function i(e) {
            var t = this;
            return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/followersoff", function (s, n) {
                t.once("_promiseFollowersoff", function (t) {
                    t ? n(t) : s([e])
                })
            })
        }

        function o(e) {
            var t = this;
            return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), null, "PART " + e, function (s, n) {
                t.once("_promisePart", function (t) {
                    t ? n(t) : s([e])
                })
            })
        }

        function r(e) {
            var t = this;
            return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/r9kbeta", function (s, n) {
                t.once("_promiseR9kbeta", function (t) {
                    t ? n(t) : s([e])
                })
            })
        }

        function a(e) {
            var t = this;
            return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/r9kbetaoff", function (s, n) {
                t.once("_promiseR9kbetaoff", function (t) {
                    t ? n(t) : s([e])
                })
            })
        }

        function c(e, t) {
            var s = this;
            return e = h.channel(e), t = h.get(t, 300), this._sendCommand(this._getPromiseDelay(), e, "/slow " + t, function (n, i) {
                s.once("_promiseSlow", function (s) {
                    s ? i(s) : n([e, ~~t])
                })
            })
        }

        function l(e) {
            var t = this;
            return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/slowoff", function (s, n) {
                t.once("_promiseSlowoff", function (t) {
                    t ? n(t) : s([e])
                })
            })
        }
        var h = e("./utils");
        t.exports = {
            action: function (e, t) {
                return e = h.channel(e), t = "ACTION " + t + "", this._sendMessage(this._getPromiseDelay(), e, t, function (s, n) {
                    s([e, t])
                })
            },
            ban: function (e, t, s) {
                var n = this;
                return e = h.channel(e), t = h.username(t), s = h.get(s, ""), this._sendCommand(this._getPromiseDelay(), e, "/ban " + t + " " + s, function (i, o) {
                    n.once("_promiseBan", function (n) {
                        n ? o(n) : i([e, t, s])
                    })
                })
            },
            clear: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/clear", function (s, n) {
                    t.once("_promiseClear", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            color: function (e, t) {
                var s = this;
                return t = h.get(t, e), this._sendCommand(this._getPromiseDelay(), "#tmijs", "/color " + t, function (e, n) {
                    s.once("_promiseColor", function (s) {
                        s ? n(s) : e([t])
                    })
                })
            },
            commercial: function (e, t) {
                var s = this;
                return e = h.channel(e), t = h.get(t, 30), this._sendCommand(this._getPromiseDelay(), e, "/commercial " + t, function (n, i) {
                    s.once("_promiseCommercial", function (s) {
                        s ? i(s) : n([e, ~~t])
                    })
                })
            },
            emoteonly: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/emoteonly", function (s, n) {
                    t.once("_promiseEmoteonly", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            emoteonlyoff: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/emoteonlyoff", function (s, n) {
                    t.once("_promiseEmoteonlyoff", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            followersonly: n,
            followersmode: n,
            followersonlyoff: i,
            followersmodeoff: i,
            host: function (e, t) {
                var s = this;
                return e = h.channel(e), t = h.username(t), this._sendCommand(2e3, e, "/host " + t, function (n, i) {
                    s.once("_promiseHost", function (s, o) {
                        s ? i(s) : n([e, t, ~~o])
                    })
                })
            },
            join: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), null, "JOIN " + e, function (s, n) {
                    t.once("_promiseJoin", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            mod: function (e, t) {
                var s = this;
                return e = h.channel(e), t = h.username(t), this._sendCommand(this._getPromiseDelay(), e, "/mod " + t, function (n, i) {
                    s.once("_promiseMod", function (s) {
                        s ? i(s) : n([e, t])
                    })
                })
            },
            mods: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/mods", function (s, n) {
                    t.once("_promiseMods", function (i, o) {
                        i ? n(i) : (o.forEach(function (s) {
                            t.moderators[e] || (t.moderators[e] = []), t.moderators[e].indexOf(s) < 0 && t.moderators[e].push(s)
                        }), s(o))
                    })
                })
            },
            part: o,
            leave: o,
            ping: function () {
                var e = this;
                return this._sendCommand(this._getPromiseDelay(), null, "PING", function (t, s) {
                    e.latency = new Date, e.pingTimeout = setTimeout(function () {
                        null !== e.ws && (e.wasCloseCalled = !1, e.log.error("Ping timeout."), e.ws.close(), clearInterval(e.pingLoop), clearTimeout(e.pingTimeout))
                    }, h.get(e.opts.connection.timeout, 9999)), e.once("_promisePing", function (e) {
                        t([parseFloat(e)])
                    })
                })
            },
            r9kbeta: r,
            r9kmode: r,
            r9kbetaoff: a,
            r9kmodeoff: a,
            raw: function (e) {
                return this._sendCommand(this._getPromiseDelay(), null, e, function (t, s) {
                    t([e])
                })
            },
            say: function (e, t) {
                return e = h.channel(e), t.startsWith(".") && !t.startsWith("..") || t.startsWith("/") || t.startsWith("\\") ? "me " === t.substr(1, 3) ? this.action(e, t.substr(4)) : this._sendCommand(this._getPromiseDelay(), e, t, function (s, n) {
                    s([e, t])
                }) : this._sendMessage(this._getPromiseDelay(), e, t, function (s, n) {
                    s([e, t])
                })
            },
            slow: c,
            slowmode: c,
            slowoff: l,
            slowmodeoff: l,
            subscribers: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/subscribers", function (s, n) {
                    t.once("_promiseSubscribers", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            subscribersoff: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(this._getPromiseDelay(), e, "/subscribersoff", function (s, n) {
                    t.once("_promiseSubscribersoff", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            timeout: function (e, t, s, n) {
                var i = this;
                return e = h.channel(e), t = h.username(t), h.isNull(s) || h.isInteger(s) || (n = s, s = 300), s = h.get(s, 300), n = h.get(n, ""), this._sendCommand(this._getPromiseDelay(), e, "/timeout " + t + " " + s + " " + n, function (o, r) {
                    i.once("_promiseTimeout", function (i) {
                        i ? r(i) : o([e, t, ~~s, n])
                    })
                })
            },
            unban: function (e, t) {
                var s = this;
                return e = h.channel(e), t = h.username(t), this._sendCommand(this._getPromiseDelay(), e, "/unban " + t, function (n, i) {
                    s.once("_promiseUnban", function (s) {
                        s ? i(s) : n([e, t])
                    })
                })
            },
            unhost: function (e) {
                var t = this;
                return e = h.channel(e), this._sendCommand(2e3, e, "/unhost", function (s, n) {
                    t.once("_promiseUnhost", function (t) {
                        t ? n(t) : s([e])
                    })
                })
            },
            unmod: function (e, t) {
                var s = this;
                return e = h.channel(e), t = h.username(t), this._sendCommand(this._getPromiseDelay(), e, "/unmod " + t, function (n, i) {
                    s.once("_promiseUnmod", function (s) {
                        s ? i(s) : n([e, t])
                    })
                })
            },
            whisper: function (e, t) {
                var s = this;
                return e = h.username(e), e === this.getUsername() ? Promise.reject("Cannot send a whisper to the same account.") : this._sendCommand(this._getPromiseDelay(), "#tmijs", "/w " + e + " " + t, function (n, i) {
                    var o = h.channel(e),
                        r = h.merge({
                            "message-type": "whisper",
                            "message-id": null,
                            "thread-id": null,
                            username: s.getUsername()
                        }, s.globaluserstate);
                    s.emits(["whisper", "message"], [
                        [o, r, t, !0],
                        [o, r, t, !0]
                    ]), n([e, t])
                })
            }
        }
    }, {
        "./utils": 9
    }],
    5: [function (e, t, s) {
        "use strict";

        function n() {
            this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
        }

        function i(e) {
            return "function" == typeof e
        }

        function o(e) {
            return "number" == typeof e
        }

        function r(e) {
            return "object" === ("undefined" == typeof e ? "undefined" : c(e)) && null !== e
        }

        function a(e) {
            return void 0 === e
        }
        var c = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
            return typeof e
        } : function (e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        };
        String.prototype.startsWith || (String.prototype.startsWith = function (e, t) {
            return t = t || 0, this.indexOf(e, t) === t
        }), t.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0, n.defaultMaxListeners = 10, n.prototype.setMaxListeners = function (e) {
            if (!o(e) || 0 > e || isNaN(e)) throw TypeError("n must be a positive number");
            return this._maxListeners = e, this
        }, n.prototype.emits = function (e, t) {
            for (var s = 0; s < e.length; s++) t[s].unshift(e[s]), this.emit.apply(this, t[s])
        }, n.prototype.emit = function (e) {
            var t, s, n, o, c, l;
            if (this._events || (this._events = {}), "error" === e && (!this._events.error || r(this._events.error) && !this._events.error.length)) {
                if (t = arguments[1], t instanceof Error) throw t;
                throw TypeError('Uncaught, unspecified "error" event.')
            }
            if (s = this._events[e], a(s)) return !1;
            if (i(s)) switch (arguments.length) {
                case 1:
                    s.call(this);
                    break;
                case 2:
                    s.call(this, arguments[1]);
                    break;
                case 3:
                    s.call(this, arguments[1], arguments[2]);
                    break;
                default:
                    o = Array.prototype.slice.call(arguments, 1), s.apply(this, o)
            } else if (r(s))
                for (o = Array.prototype.slice.call(arguments, 1), l = s.slice(), n = l.length, c = 0; n > c; c++) l[c].apply(this, o);
            return !0
        }, n.prototype.addListener = function (e, t) {
            var s;
            if (!i(t)) throw TypeError("listener must be a function");
            return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", e, i(t.listener) ? t.listener : t), this._events[e] ? r(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t, r(this._events[e]) && !this._events[e].warned && (s = a(this._maxListeners) ? n.defaultMaxListeners : this._maxListeners, s && s > 0 && this._events[e].length > s && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), "function" == typeof console.trace && console.trace())), this
        }, n.prototype.on = n.prototype.addListener, n.prototype.once = function (e, t) {
            function s() {
                "_" !== e.charAt(0) || isNaN(e.substr(e.length - 1)) || (e = e.substring(0, e.length - 1)), this.removeListener(e, s), n || (n = !0, t.apply(this, arguments))
            }
            if (!i(t)) throw TypeError("listener must be a function");
            var n = !1;
            if (this._events.hasOwnProperty(e) && "_" === e.charAt(0)) {
                var o = 1,
                    r = e;
                for (var a in this._events) this._events.hasOwnProperty(a) && a.startsWith(r) && o++;
                e += o
            }
            return s.listener = t, this.on(e, s), this
        }, n.prototype.removeListener = function (e, t) {
            var s, n, o, a;
            if (!i(t)) throw TypeError("listener must be a function");
            if (!this._events || !this._events[e]) return this;
            if (s = this._events[e], o = s.length, n = -1, s === t || i(s.listener) && s.listener === t) {
                if (delete this._events[e], this._events.hasOwnProperty(e + "2") && "_" === e.charAt(0)) {
                    var c = e;
                    for (var l in this._events) this._events.hasOwnProperty(l) && l.startsWith(c) && (isNaN(parseInt(l.substr(l.length - 1))) || (this._events[e + parseInt(l.substr(l.length - 1) - 1)] = this._events[l], delete this._events[l]));
                    this._events[e] = this._events[e + "1"], delete this._events[e + "1"]
                }
                this._events.removeListener && this.emit("removeListener", e, t)
            } else if (r(s)) {
                for (a = o; a-- > 0;)
                    if (s[a] === t || s[a].listener && s[a].listener === t) {
                        n = a;
                        break
                    }
                if (0 > n) return this;
                1 === s.length ? (s.length = 0, delete this._events[e]) : s.splice(n, 1), this._events.removeListener && this.emit("removeListener", e, t)
            }
            return this
        }, n.prototype.removeAllListeners = function (e) {
            var t, s;
            if (!this._events) return this;
            if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e], this;
            if (0 === arguments.length) {
                for (t in this._events) "removeListener" !== t && this.removeAllListeners(t);
                return this.removeAllListeners("removeListener"), this._events = {}, this
            }
            if (s = this._events[e], i(s)) this.removeListener(e, s);
            else if (s)
                for (; s.length;) this.removeListener(e, s[s.length - 1]);
            return delete this._events[e], this
        }, n.prototype.listeners = function (e) {
            var t;
            return t = this._events && this._events[e] ? i(this._events[e]) ? [this._events[e]] : this._events[e].slice() : []
        }, n.prototype.listenerCount = function (e) {
            if (this._events) {
                var t = this._events[e];
                if (i(t)) return 1;
                if (t) return t.length
            }
            return 0
        }, n.listenerCount = function (e, t) {
            return e.listenerCount(t)
        }
    }, {}],
    6: [function (e, t, s) {
        "use strict";

        function n(e) {
            return function (t) {
                r[e] >= r[o] && console.log("[" + i.formatDate(new Date) + "] " + e + ": " + t)
            }
        }
        var i = e("./utils"),
            o = "info",
            r = {
                trace: 0,
                debug: 1,
                info: 2,
                warn: 3,
                error: 4,
                fatal: 5
            };
        t.exports = {
            setLevel: function (e) {
                o = e
            },
            trace: n("trace"),
            debug: n("debug"),
            info: n("info"),
            warn: n("warn"),
            error: n("error"),
            fatal: n("fatal")
        }
    }, {
        "./utils": 9
    }],
    7: [function (e, t, s) {
        "use strict";
        var n = e("./utils");
        t.exports = {
            badges: function i(e) {
                if (n.isString(e.badges)) {
                    for (var i = {}, t = e.badges.split(","), s = 0; s < t.length; s++) {
                        var o = t[s].split("/");
                        if (!o[1]) return;
                        i[o[0]] = o[1]
                    }
                    e["badges-raw"] = e.badges, e.badges = i
                }
                return n.isBoolean(e.badges) && (e["badges-raw"] = null), e
            },
            emotes: function o(e) {
                if (n.isString(e.emotes)) {
                    for (var t = e.emotes.split("/"), o = {}, s = 0; s < t.length; s++) {
                        var i = t[s].split(":");
                        if (!i[1]) return;
                        o[i[0]] = i[1].split(",")
                    }
                    e["emotes-raw"] = e.emotes, e.emotes = o
                }
                return n.isBoolean(e.emotes) && (e["emotes-raw"] = null), e
            },
            emoteRegex: function (e, t, s, i) {
                for (var o, r = /\S+/g, a = new RegExp("(\\b|^|s)" + n.unescapeHtml(t) + "(\\b|$|s)"); null !== (o = r.exec(e));) a.test(o[0]) && (i[s] = i[s] || [], i[s].push([o.index, r.lastIndex - 1]))
            },
            emoteString: function (e, t, s, i) {
                for (var o, r = /\S+/g; null !== (o = r.exec(e));) o[0] === n.unescapeHtml(t) && (i[s] = i[s] || [], i[s].push([o.index, r.lastIndex - 1]))
            },
            transformEmotes: function (e) {
                var t = "";
                return Object.keys(e).forEach(function (s) {
                    t = t + s + ":", e[s].forEach(function (e) {
                        t = t + e.join("-") + ","
                    }), t = t.slice(0, -1) + "/"
                }), t.slice(0, -1)
            },
            msg: function (e) {
                var t = {
                        raw: e,
                        tags: {},
                        prefix: null,
                        command: null,
                        params: []
                    },
                    s = 0,
                    n = 0;
                if (64 === e.charCodeAt(0)) {
                    var n = e.indexOf(" ");
                    if (-1 === n) return null;
                    for (var i = e.slice(1, n).split(";"), o = 0; o < i.length; o++) {
                        var r = i[o],
                            a = r.split("=");
                        t.tags[a[0]] = r.substring(r.indexOf("=") + 1) || !0
                    }
                    s = n + 1
                }
                for (; 32 === e.charCodeAt(s);) s++;
                if (58 === e.charCodeAt(s)) {
                    if (n = e.indexOf(" ", s), -1 === n) return null;
                    for (t.prefix = e.slice(s + 1, n), s = n + 1; 32 === e.charCodeAt(s);) s++
                }
                if (n = e.indexOf(" ", s), -1 === n) return e.length > s ? (t.command = e.slice(s), t) : null;
                for (t.command = e.slice(s, n), s = n + 1; 32 === e.charCodeAt(s);) s++;
                for (; s < e.length;) {
                    if (n = e.indexOf(" ", s), 58 === e.charCodeAt(s)) {
                        t.params.push(e.slice(s + 1));
                        break
                    }
                    if (-1 === n) {
                        if (-1 === n) {
                            t.params.push(e.slice(s));
                            break
                        }
                    } else
                        for (t.params.push(e.slice(s, n)), s = n + 1; 32 === e.charCodeAt(s);) s++
                }
                return t
            }
        }
    }, {
        "./utils": 9
    }],
    8: [function (e, t, s) {
        "use strict";

        function n(e) {
            this.queue = [], this.index = 0, this.defaultDelay = e || 3e3
        }
        n.prototype.add = function (e, t) {
            this.queue.push({
                fn: e,
                delay: t
            })
        }, n.prototype.run = function (e) {
            (e || 0 === e) && (this.index = e), this.next()
        }, n.prototype.next = function i() {
            var e = this,
                t = this.index++,
                s = this.queue[t],
                i = this.queue[this.index];
            s && (s.fn(), i && setTimeout(function () {
                e.next()
            }, i.delay || this.defaultDelay))
        }, n.prototype.reset = function () {
            this.index = 0
        }, n.prototype.clear = function () {
            this.index = 0, this.queue = []
        }, s.queue = n
    }, {}],
    9: [function (e, t, s) {
        (function (e) {
            "use strict";
            var s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
                    return typeof e
                } : function (e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                },
                n = t.exports = {
                    get: function (e, t) {
                        return "undefined" == typeof e ? t : e
                    },
                    isBoolean: function (e) {
                        return "boolean" == typeof e
                    },
                    isFinite: function (e) {
                        function t(t) {
                            return e.apply(this, arguments)
                        }
                        return t.toString = function () {
                            return e.toString()
                        }, t
                    }(function (e) {
                        return isFinite(e) && !isNaN(parseFloat(e))
                    }),
                    isInteger: function (e) {
                        return !isNaN(n.toNumber(e, 0))
                    },
                    isJustinfan: function (e) {
                        return RegExp("^(justinfan)(\\d+$)", "g").test(e)
                    },
                    isNull: function (e) {
                        return null === e
                    },
                    isRegex: function (e) {
                        return /[\|\\\^\$\*\+\?\:\#]/.test(e)
                    },
                    isString: function (e) {
                        return "string" == typeof e
                    },
                    isURL: function (e) {
                        return RegExp("^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$", "i").test(e)
                    },
                    justinfan: function () {
                        return "justinfan" + Math.floor(8e4 * Math.random() + 1e3)
                    },
                    password: function (e) {
                        return "SCHMOOPIIE" === e ? "SCHMOOPIIE" : "oauth:" + e.toLowerCase().replace("oauth:", "")
                    },
                    promiseDelay: function (e) {
                        return new Promise(function (t) {
                            setTimeout(t, e)
                        })
                    },
                    replaceAll: function (e, t) {
                        if (null === e || "undefined" == typeof e) return null;
                        for (var s in t) e = e.replace(new RegExp(s, "g"), t[s]);
                        return e
                    },
                    unescapeHtml: function (e) {
                        return e.replace(/\\&amp\\;/g, "&").replace(/\\&lt\\;/g, "<").replace(/\\&gt\\;/g, ">").replace(/\\&quot\\;/g, '"').replace(/\\&#039\\;/g, "'")
                    },
                    addWord: function (e, t) {
                        return 0 != e.length && (e += " "), e += t
                    },
                    channel: function i(e) {
                        var i = "undefined" == typeof e || null === e ? "" : e;
                        return "#" === i.charAt(0) ? i.toLowerCase() : "#" + i.toLowerCase()
                    },
                    extractNumber: function (e) {
                        for (var t = e.split(" "), s = 0; s < t.length; s++)
                            if (n.isInteger(t[s])) return ~~t[s];
                        return 0
                    },
                    formatDate: function (e) {
                        var t = e.getHours(),
                            s = e.getMinutes();
                        return t = (10 > t ? "0" : "") + t, s = (10 > s ? "0" : "") + s, t + ":" + s
                    },
                    inherits: function (e, t) {
                        e.super_ = t;
                        var s = function () {};
                        s.prototype = t.prototype, e.prototype = new s, e.prototype.constructor = e
                    },
                    isNode: function () {
                        try {
                            return t.exports = "object" === ("undefined" == typeof e ? "undefined" : s(e)) && "[object process]" === Object.prototype.toString.call(e)
                        } catch (n) {
                            return !1
                        }
                    },
                    isExtension: function () {
                        try {
                            if (window.chrome && window.chrome.runtime && window.chrome.runtime.id) {
                                return true;
                            }
                            return false;
                            //return !!(window.chrome && chrome.runtime && chrome.runtime.id)
                        } catch (e) {
                            return !1
                        }
                    },
                    merge: function (e, t) {
                        for (var s in t) try {
                            t[s].constructor == Object ? e[s] = n.merge(e[s], t[s]) : e[s] = t[s]
                        } catch (i) {
                            e[s] = t[s]
                        }
                        return e
                    },
                    splitLine: function (e, t) {
                        var s = e.substring(0, t).lastIndexOf(" ");
                        return [e.substring(0, s), e.substring(s + 1)]
                    },
                    toNumber: function (e, t) {
                        if (null === e) return 0;
                        var s = Math.pow(10, n.isFinite(t) ? t : 0);
                        return Math.round(e * s) / s
                    },
                    union: function (e, t) {
                        for (var s = {}, n = [], i = 0; i < e.length; i++) {
                            var o = e[i];
                            s[o] || (s[o] = !0, n.push(o))
                        }
                        for (var i = 0; i < t.length; i++) {
                            var o = t[i];
                            s[o] || (s[o] = !0, n.push(o))
                        }
                        return n
                    },
                    username: function o(e) {
                        var o = "undefined" == typeof e || null === e ? "" : e;
                        return "#" === o.charAt(0) ? o.substring(1).toLowerCase() : o.toLowerCase()
                    }
                }
        }).call(this, e("_process"))
    }, {
        _process: 11
    }],
    10: [function (e, t, s) {
        "use strict"
    }, {}],
    11: [function (e, t, s) {
        function n() {
            throw new Error("setTimeout has not been defined")
        }

        function i() {
            throw new Error("clearTimeout has not been defined")
        }

        function o(e) {
            if (u === setTimeout) return setTimeout(e, 0);
            if ((u === n || !u) && setTimeout) return u = setTimeout, setTimeout(e, 0);
            try {
                return u(e, 0)
            } catch (t) {
                try {
                    return u.call(null, e, 0)
                } catch (t) {
                    return u.call(this, e, 0)
                }
            }
        }

        function r(e) {
            if (m === clearTimeout) return clearTimeout(e);
            if ((m === i || !m) && clearTimeout) return m = clearTimeout, clearTimeout(e);
            try {
                return m(e)
            } catch (t) {
                try {
                    return m.call(null, e)
                } catch (t) {
                    return m.call(this, e)
                }
            }
        }

        function a() {
            g && p && (g = !1, p.length ? d = p.concat(d) : _ = -1, d.length && c())
        }

        function c() {
            if (!g) {
                var e = o(a);
                g = !0;
                for (var t = d.length; t;) {
                    for (p = d, d = []; ++_ < t;) p && p[_].run();
                    _ = -1, t = d.length
                }
                p = null, g = !1, r(e)
            }
        }

        function l(e, t) {
            this.fun = e, this.array = t
        }

        function h() {}
        var u, m, f = t.exports = {};
        ! function () {
            try {
                u = "function" == typeof setTimeout ? setTimeout : n
            } catch (e) {
                u = n
            }
            try {
                m = "function" == typeof clearTimeout ? clearTimeout : i
            } catch (e) {
                m = i
            }
        }();
        var p, d = [],
            g = !1,
            _ = -1;
        f.nextTick = function (e) {
            var t = new Array(arguments.length - 1);
            if (arguments.length > 1)
                for (var s = 1; s < arguments.length; s++) t[s - 1] = arguments[s];
            d.push(new l(e, t)), 1 !== d.length || g || o(c)
        }, l.prototype.run = function () {
            this.fun.apply(null, this.array)
        }, f.title = "browser", f.browser = !0, f.env = {}, f.argv = [], f.version = "", f.versions = {}, f.on = h, f.addListener = h, f.once = h, f.off = h, f.removeListener = h, f.removeAllListeners = h, f.emit = h, f.prependListener = h, f.prependOnceListener = h, f.listeners = function (e) {
            return []
        }, f.binding = function (e) {
            throw new Error("process.binding is not supported")
        }, f.cwd = function () {
            return "/"
        }, f.chdir = function (e) {
            throw new Error("process.chdir is not supported")
        }, f.umask = function () {
            return 0
        }
    }, {}]
}, {}, [1]);
//# sourceMappingURL=./build/tmi.js.map