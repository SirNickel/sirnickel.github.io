// Code (c) 2017 Nicolas 'Nickel' Kammerer
// ---------------------------------------
// Erstellt für ProjectInsight / Stefan


// Generele Werte
var state           = []; // Bot Daten
var users           = []; // Personen in Channel
var userdata        = []; // User Daten über API
var customCommands  = []; // Spezifische wert Speicherung
var lastCommandUse  = {}; // Spam Prevention
var timeouts        = []; // Timed Messages
var welcomed        = [];
var welcomeLock     = true; // Join Spam Schutz
var LastFollows     = []; // Neuer Follower Check
var prevLights      = {"on": false};

console.log('*** Bot Started ***');

// Bot Daten holen
state.oauth = config.password.replace('oauth:', '');
state.startTime = Date.now();
state.followers = [];
state.lastFollows = []; // Neuer Follower Check
getJSON('https://api.twitch.tv/helix/users?login=' + encodeURIComponent(dehash(config.channel)), function (err, res) {
    state.refreshRate = 10;
    state.channel_id = res.data[0].id;
});

// Hue Bridge Connect
var api = jsHue().bridge(config.hueHost).user(config.hueUser)

// Twitch Stream Connect
var chat = document.getElementById('chat'),
defaultColors = ['rgb(254, 0, 0)','rgb(0, 0, 254)','rgb(0, 128, 0)','rgb(178, 34, 34)','rgb(254, 127, 80)','rgb(154, 205, 50)','rgb(254, 69, 0)','rgb(46, 139, 87)','rgb(218, 165, 32)','rgb(210, 105, 30)','rgb(95, 158, 160)','rgb(30, 144, 254)','rgb(254, 105, 180)','rgb(138, 43, 226)','rgb(0, 254, 127)'],
randomColorsChosen = {},
clientOptions = {
        options: {
            debug: true,
            level: 'info',
        },
        connection: {
            server: 'irc-ws.chat.twitch.tv',
            //server: 'irc.chat.twitch.tv',
            port: 443,
            //port: 80,
            timeout: 9999,
            reconnect: true
        },
        identity: {
            username: config.name,
            password: config.password
        },
        //channels: [config.channel,'#projectinsightde']
        channels: [config.channel]
    },
client = new tmi.client(clientOptions);

var recentTimeouts = {};

function clearChat(channel) {
    if(!doChatClears) return false;
    var toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"]');
    for(var i in toHide) {
        var h = toHide[i];
        if(typeof h == 'object') {
            h.className += ' chat-cleared';
        }
    }
    chatNotice('Chat was cleared in ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-clear')
}

function hosting(channel, target, viewers, unhost) {
    if(!showHosting) return false;
    if(viewers == '-') viewers = 0;
    var chan = dehash(channel);
    chan = capitalize(chan);
    if(!unhost) {
        var targ = capitalize(target);
        //chatNotice(chan + ' hostet nun ' + targ + ' mit ' + viewers + ' Zuschauer' + (viewers !== 1 ? 'n' : '') + '.', null, null, 'chat-hosting-yes');
        client.say(config.channel, chan + ' hostet nun ' + targ + '.', null, null, 'chat-hosting-yes');
    }
    else {
        //chatNotice(chan + ' hostet nichtmehr länger.', null, null, 'chat-hosting-no');
        client.say(config.channel, chan + ' hostet nichtmehr länger.', null, null, 'chat-hosting-no');
    }
}

  // Add listeners
  /*
  ircClient.addListener('error',                    onError);
  ircClient.addListener('registered',               onRegistered);
  ircClient.addListener('join' + config.channel,    onJoin);
  ircClient.addListener('part' + config.channel,    onPart);
  ircClient.addListener('motd',                     onMotd);
  ircClient.addListener('notice',                   onNotice);
  ircClient.addListener('message' + config.channel, onMessage);
  ircClient.addListener('raw',                      onRaw);
*/
// Chat Handlers
client.addListener('message', onMessage);
client.addListener('timeout', onTimeout);
client.addListener('clearchat', clearChat);
client.addListener('hosting', hosting);
client.addListener('unhost', function(channel, viewers) { hosting(channel, null, viewers, true) });

client.addListener('connecting', function (address, port) {
    if(showConnectionNotices) chatNotice('Connecting', 1000, -4, 'chat-connection-good-connecting');
});
client.addListener('logon', function () {
    if(showConnectionNotices) chatNotice('Authenticating', 1000, -3, 'chat-connection-good-logon');
});
client.addListener('connectfail', function () {
    if(showConnectionNotices) chatNotice('Connection failed', 1000, 3, 'chat-connection-bad-fail');
});
client.addListener('connected', function (address, port) {
    if(showConnectionNotices) chatNotice('Connected', 1000, -2, 'chat-connection-good-connected');
});
client.addListener('disconnected', function (reason) {
    if(showConnectionNotices) chatNotice('Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected');
});
client.addListener('reconnect', function () {
    if(showConnectionNotices) chatNotice('Reconnected', 1000, 'chat-connection-good-reconnect');
});
client.addListener('join', onJoin);
client.addListener('part', function (channel, username) {
    users.splice(users.indexOf(username), 1)
    //document.getElementById("users").innerHTML = users.join('<br>');
});

client.addListener('crash', function () {
    chatNotice('Crashed', 10000, 4, 'chat-crash');
});

// -----------------------------------------------------------
// User Joined
// -----------------------------------------------------------
function onJoin(channel, username) {
    if (username === client.getUsername()) {
        setTimeout(function () { timedMessage(0); }, commands.timer * 1000);
        apiUpdate();

        if(showConnectionNotices) chatNotice('Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join');
        setTimeout(function() { welcomeLock = false }, 90000);      // Joins erst nach XX Sekunden begrüßen (Bot Join Spam)
    
    } else if (users.indexOf(username) == -1) {
        users.push(username);
        getUserData(username, function (data) {
            udata = userdata[username];
            if (!data.display_name) data.display_name = username;
            else userdata[username] = data;

            //Custom User Welcome Message
            if (welcomeLock == false) {
            if (checkuser(username, commands.welcome)) {
                //if (commands.welcome[username] != '') chatNotice(commands.welcome[username], null, null, '');
                if (commands.welcome[username] != '') client.say(config.channel, commands.welcome[username])
            } else {
                var i = Math.floor(Math.random() * commands.welcome.standard.length);
                var date = new Date();
                var hour = date.getHours();
                var time_welcome = "Abend";
                if (hour < 12) time_welcome = "Morgen"
                if (hour < 20) time_welcome = "Tag"

                var message = commands.welcome.standard[i].replace('{NICK}', data.display_name);
                var message = message.replace('{TIME}', time_welcome);
                //chatNotice(message, null, null, '');
                client.say(config.channel, message);
            }}

            if (data.id) {
                isFollowing(data.id, config.userid, function (res) {
                    var follow = (res.isFollowing ? ' || <img height="20" width="20" src="./images/heart.png"> ' + res.dateFollowed : '')
                    chatNotice('Joined: ' + data.display_name + follow);
                    userdata[username].isFollowing = res.isFollowing;
                });
            }
        });
    }

    //document.getElementById("users").innerHTML = users.join('<br>');
}

// -----------------------------------------------------------
// On Chat Message
// -----------------------------------------------------------
function onMessage(channel, user, message, self) {
    // Check for command prefix
    if (message.indexOf(commands.prefix) === 0) onCommand(channel, user, message);

    // Userdata aktualisieren
    let name = user.username;
    if (!userdata[name]) userdata[name] = {};
    if (!userdata[name].id) getUserData(name ,function(data) { userdata[name] = data });
    if (!userdata[name].isFollowing && state.followers.indexOf(userdata[name].id) != -1) userdata[name].isFollowing = true;
    userdata[name].isSubscriber = user.subscriber;

    var chan = dehash(channel),
        chatLine = document.createElement('div'),
        chatTime = document.createElement('span'),
        chatChannel = document.createElement('span'),
        chatName = document.createElement('span'),
        chatColon = document.createElement('span'),
        chatMessage = document.createElement('span');

    var color = useColor ? user.color : 'inherit';
    if(color === null) {
        if(!randomColorsChosen.hasOwnProperty(chan)) {
            randomColorsChosen[chan] = {};
        }
        if(randomColorsChosen[chan].hasOwnProperty(name)) {
            color = randomColorsChosen[chan][name];
        }
        else {
            color = defaultColors[Math.floor(Math.random()*defaultColors.length)];
            randomColorsChosen[chan][name] = color;
        }
    }

    chatLine.className = 'chat-line';
    chatLine.dataset.username = name;
    chatLine.dataset.channel = channel;

    if(user['message-type'] == 'action') {
        chatLine.className += ' chat-action';
    }

    chatTime.className = 'chat-time';
    chatTime.innerHTML = displayTime();
    chatChannel.className = 'chat-channel';
    chatChannel.innerHTML = chan;
    chatName.className = 'chat-name';
    chatName.style.color = color;
    chatName.innerHTML = user['display-name'] || name;
    chatColon.className = 'chat-colon';
    chatMessage.className = 'chat-message';
    chatMessage.style.color = color;
    chatMessage.innerHTML = showEmotes ? formatEmotes(message, user.emotes) : htmlEntities(message);

    if(config.showTime) chatLine.appendChild(chatTime);
    if(client.opts.channels.length > 1 && showChannel) chatLine.appendChild(chatChannel);
    if(showBadges) chatLine.appendChild(badges(chan, user, self));
    chatLine.appendChild(chatName);
    chatLine.appendChild(chatColon);
    chatLine.appendChild(chatMessage);

    chat.appendChild(chatLine);

    if(typeof fadeDelay == 'number') {
        setTimeout(function() {
                chatLine.dataset.faded = '';
            }, fadeDelay);
    }

    if(chat.children.length > 50) {
        var oldMessages = [].slice.call(chat.children).slice(0, 10);
        for(var i in oldMessages) oldMessages[i].remove();
    }
}

// -----------------------------------------------------------
// Chat Notice
// -----------------------------------------------------------
function chatNotice(information, noticeFadeDelay, level, additionalClasses) {
    var ele = document.createElement('div');

    ele.className = 'chat-line chat-notice';
    ele.innerHTML = displayTime() + information;

    if(additionalClasses !== undefined) {
        if(Array.isArray(additionalClasses)) {
            additionalClasses = additionalClasses.join(' ');
        }
        ele.className += ' ' + additionalClasses;
    }

    if(typeof level == 'number' && level != 0) ele.dataset.level = level;
    chat.appendChild(ele);

    if(typeof noticeFadeDelay == 'number') {
        setTimeout(function() { ele.dataset.faded = ''; }, noticeFadeDelay || 500);
    }
    return ele;
}

// -----------------------------------------------------------
// on Chat Commands
// -----------------------------------------------------------
function onCommand(channel, user, message) {
    var message = message.substr(commands.prefix.length);

    // Nachricht aufteilen in Command und Argumente
    var parts   = message.split(' ');
    var command = parts[0].toLowerCase();
    var args    = parts.slice(1);
    var text    = '';

    console.log('Command: ' + command + '    ||    Args: ' + args[0]);

    // Rechte
    var admin = checkuser(user.username, config.admins);
    var mod = user.mod;
    var sub = user.subscriber;
    var follow = userdata.isFollowing;

    // Check last command usage time
    var then = lastCommandUse[message];
    var now  = new Date().getTime();
    var diff = now - lastCommandUse[message];
    if (!user.mod && !isNaN(diff) && diff <= 10) return;

    // Config Text Commands
    if (commands.text[command]) {
        if (!commands.text[command].timer) commands.text[command].timer = 10;
        if (!commands.text[command].rechte) commands.text[command].rechte = '';

        diff = now - timeouts[command];
        time_rest = Math.round((commands.text[command].timer*1000 - diff) / 1000)
        var timer = commands.text[command].timer || 10;

        // Timeout Text
        if (!admin && !user.mod && !isNaN(diff) && diff <= commands.text[command].timer*1000) client.say(config.channel, 'Dieser Befehl geht nur alle: ' +commands.text[command].timer + ' Sekunden || Noch ' + time_rest + ' Sekunden')
        if (!admin && !user.mod && !isNaN(diff) && diff <= commands.text[command].timer*1000) return;

        var handler = commands.text[command].text;

        // Funktionen ausführen
        if (typeof handler === 'function') {
            // Call the handler and convert to promise
            var response = handler(command, args, user.username, admin, mod);
            //console.log(response);
            //response = Promise.resolve(response);
            //response.then(function(message) {
                text = response || '';
            //});
        } else text = commands.text[command].text

        // Rechte kontrollieren
        var send    = false;
        if (commands.text[command].rechte != '') {
            var rechte  = commands.text[command].rechte.split(' ');
            for (var val in rechte) {
                if (admin) send = true;
                else if (rechte[val] === 'mod' && mod) send = true;
                else if (rechte[val] === 'sub' && sub) send = true;
            }
        } else { send = true; }

        // Werte austauschen
        if (text.indexOf('{ARG1}') != -1) {
            if (args[0] != undefined) text = text.replace('{ARG1}', args[0]);
            else text = 'Bitte den Befehl mit Wert ausführen z.B.: #' + command + ' 123!';
        }
        if (args[1] != undefined) text = text.replace('{ARG2}', args[1]);
        else text = text.replace('{ARG2}', '');

        timeouts[command] = now;
        if (send === true && text != '') client.say(config.channel, text)
    }

    // Config Light Commands
    if (commands.lights[message]) {
        var handler = commands.lights[message];
        var prev = false;
        var timeout = 0;

        if (handler.timeout) {
            prev = true;
            timeout = handler.timeout;
            delete handler.timeout;  
        }
        setLightGroup(handler,prev,timeout);
    }

/*
    if (message.toLowerCase() === 'crazy') {
        for (i = 0; i < 10; i++) {
            console.log(i);
            setTimeout(function(){ api.setGroupState(config.hueGroup, {'hue': 43690, 'sat': 254, 'bri': 170}) }, i*100);
            setTimeout(function(){ api.setGroupState(config.hueGroup, {'hue': 21845, 'sat': 254, 'bri': 170}) }, i*100+33);
            setTimeout(function(){ api.setGroupState(config.hueGroup, {'hue': 0, 'sat': 254, 'bri': 170}) }, i*100+66);
        }
    }
*/
    if (user.username == 'sir_nickel') {

    if (message == 'pink fluffy unicorn' || message == 'pfu') {
        document.getElementById("pfu").style.visibility = "visible";
        setTimeout(function () { document.getElementById("pfu").style.visibility = "hidden" }, 20000);
        
        client.say(config.channel, 'Pink Fluffy Unicorns Dancing On Rainbows');
        setLightGroup({'alert': 'lselect', 'hue': 54418, 'sat': 254, 'bri': 190},
            {'effect': 'colorloop', 'bri': 170}, 10);
    }
    if (message == 'welcometest') {
        var i = Math.floor(Math.random() * commands.welcome.standard.length);
        var date = new Date();
        var hour = date.getHours();
        var time_welcome = "Abend";
        if (hour < 12) time_welcome = "Morgen"
        if (hour < 20) time_welcome = "Tag"
        
        console.log('Hour: ' + hour + '    ||    Args: ' + args[0]);
        
        var message = commands.welcome.standard[i].replace('{NICK}', user.username);
        var message = message.replace('{TIME}', time_welcome);
        client.say(config.channel, message);
    }
    if (command == 'test2') {
        isFollowing(args[0], config.userid, function (res) {
            console.log(res);
            if ( res.isFollowing ) console.log( 'Following since: ' + res.dateFollowed );
            else console.log( 'Not following.' );
        });
    }
    if (command == 'stest') {
        //var audio1 = new Audio('images/knocking.wav');
        //audio1.play();
        //document.getElementById('audiofile1').play();
        //var x=document.getElementById("audio1");
        //x.innerHTML='<audio autoplay><source src="images/knocking.wav" /></audio>';
    }

    }

    if (command == 'stefan') {
        var i = Math.round(Math.random() * (3 - 1) + 1);
        if (i == 1) client.say(config.channel, 'Stefan goes UZ UZ UZ!')
        if (i == 2) client.say(config.channel, 'Stefan sagt hebt die arme!')
        if (i == 3) client.say(config.channel, 'Stefan - mütze glatze mütze glatze - BOOM!')
    }

    lastCommandUse[message] = now;
};

// -----------------------------------------------------------
// On Timeout
// -----------------------------------------------------------
function onTimeout(channel, username) {
    if(!doTimeouts) return false;
    if(!recentTimeouts.hasOwnProperty(channel)) {
        recentTimeouts[channel] = {};
    }
    if(!recentTimeouts[channel].hasOwnProperty(username) || recentTimeouts[channel][username] + 1000*10 < +new Date) {
        recentTimeouts[channel][username] = +new Date;
        chatNotice(capitalize(username) + ' was timed-out in ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-timeout')
    };
    var toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"][data-username="' + username + '"]:not(.chat-timedout) .chat-message');
    for(var i in toHide) {
        var h = toHide[i];
        if(typeof h == 'object') {
            h.innerText = '<Message deleted>';
            h.parentElement.className += ' chat-timedout';
        }
    }
}
// User Subscribed
client.on('subscription', function (channel, username, method, message, userstate) {
    client.say(config.channel, username + ' hat den Kanal Aboniert', null, null, '');
    setLightGroup({'alert': 'lselect', 'hue': 0, 'sat': 254, 'bri': 220}, true, 10)
});
client.on('resub', function (channel, username, months, message, userstate, methods) {
    client.say(config.channel, username + ' Aboniert bereits seit ' + months + ' Monaten!!!', null, null, '');
    setLightGroup({'alert': 'lselect', 'hue': 0, 'sat': 254, 'bri': 220}, true, 10)
});


// -----------------------------------------------------------
// Funktionen
// -----------------------------------------------------------

// Update der API informationen
apiUpdate = function(callback) {
    //console.log(state);
    //console.log(userdata);
    
    if (!state.channel_id) return;

    let follows = false;

    // Followers
    getJSON(
        'https://api.twitch.tv/helix/users/follows',
        '?to_id=' + encodeURIComponent(state.channel_id) + '&limit=100',
        function (err, res) {
            if (!res.data) return;

            if (state.followers.length > 0) firstUpdate = false;
            for (let i = 0; i < res.data.length; i++) {
                const tempFollower = res.data[i].from_id;
                if (state.followers.indexOf(tempFollower) === -1) { // if user isn't in state.followers
                    state.followers.push(tempFollower);
                }
            }

            // Neuer Follower
            let userid = res.data[0].from_id;
            var check = LastFollows.indexOf(userid);
            if (LastFollows[0] == undefined) {
                LastFollows[0] = res.data[0].from_id;
                LastFollows[1] = res.data[1].from_id;
                LastFollows[2] = res.data[2].from_id;
            } else if (check == -1) {
                LastFollows[2] = LastFollows[1] || '';
                LastFollows[1] = LastFollows[0] || '';
                LastFollows[0] = userid;
                getJSON(
                    'https://api.twitch.tv/helix/users',
                    '?id=' + encodeURIComponent(userid),
                    function (err, res) {
                        if (!res.data) return;
                        setLightGroup({'alert': 'lselect', 'hue': 21845, 'sat': 254, 'bri': 220}, true, 8)
                        client.say(config.channel, 'Neuer Follower: ' + res.data[0].display_name);
                    }
                );
            }
        }
    );

    // Stream Infos
    getJSON(
        'https://api.twitch.tv/helix/streams',
        '?user_id=' + encodeURIComponent(state.channel_id),
        function (err, res) {
            if (res.data == "") {
                return;
            }
            state.stream = res.data[0];

            let uptime = timeDifference(new Date(res.data[0].started_at));
            document.getElementById("uptime").innerHTML = 'Uptime: '+uptime.hours+':'+uptime.minutes+':'+uptime.seconds;
        }
    );

    // User im Channel
    let userlist = [];
    users.forEach(function(username) {
        if (!userdata[username].isSubscriber) userdata[username].isSubscriber = false;
        var follow = (userdata[username].isFollowing ? '<img height="20" width="20" src="./images/heart.png">' : '<img style="opacity: 0.1" height="20" width="20" src="./images/heart.png">')
        var subscr = (userdata[username].isSubscriber ? '<img height="20" width="20" src="./images/star.png"> ' : '<img style="opacity: 0.1" height="20" width="20" src="./images/star.png"> ')
        userlist.push(follow + subscr + userdata[username].display_name);
    });
    //console.log(userlist);
    document.getElementById("users").innerHTML = userlist.join('<br>');

    // Interface - Number Viewers
    document.getElementById("viewers").innerHTML = '   ||   ' + users.length + ' Zuschauer';

    // Interface - Gewinnspiel
    if (customCommands.gewinn) {
        document.getElementById("rulist").innerHTML = customCommands.gjoin.join(', ');
    }

    setTimeout(function () { apiUpdate(); }, state.refreshRate * 1000);
}

// Licht schalten
function setLightGroup(state, previous = false, timeout = 0) {
    // Standard Werte
    if (state.on != false && !state.on) state.on = true;
    if (!state.alert) state.alert = 'none';
    if (!state.effect) state.effect = 'none';
    if (!state.sat) state.sat = 254;
    if (!state.bri) state.bri = 170;

    api.setGroupState(config.hueGroup, state);

    if (previous == true) {
        setTimeout(function() {
            api.setGroupState(config.hueGroup, prevLights);
            //prevLights = state;
        }, timeout*1000);
    } else if (previous != '') {
        if (previous.on != false && !previous.on) previous.on = true;
        if (!previous.alert) previous.alert = 'none';
        if (!previous.effect) previous.effect = 'none';
        if (!previous.sat) previous.sat = 254;
        if (!previous.bri) previous.bri = 170;

        setTimeout(function() {
            api.setGroupState(config.hueGroup, previous)
            prevLights = state;
        }, timeout*1000);
    } else {
        prevLights = state;
    }
}

// Send Chat
function sendChat(){
    var x = document.getElementById("ChatInput").value;
    client.say(config.channel, x);
    document.getElementById("ChatInput").value = '';
}

// Set Gewinnspiel
function setGewinnspiel(on=false) {
    var submitButton = document.getElementById('ruffle');
    if (on) {
        customCommands['gewinn'] = true;
        customCommands.gjoin = [];

        client.say(config.channel, '====================');
        client.say(config.channel, 'Gewinnspiel gestartet beitretten mit #gewinn');
        client.say(config.channel, '====================');

        submitButton.setAttribute('onclick',  'setGewinnspiel(false);');
        document.getElementById("ruffle").innerHTML = 'Gewinnspiel Stop';
        document.getElementById("rulist").innerHTML = customCommands.gjoin.join(', ');
    } else if (!on) {
        if (customCommands.gjoin.length === 0) {
            client.say(config.channel, 'Kein Teilnehmer = Kein Gewinner');
        } else {
            let i = Math.floor(Math.random() * customCommands.gjoin.length);
            let name = customCommands.gjoin[i];
            let winner = userdata[name].display_name

            client.say(config.channel, '====================');
            client.say(config.channel, 'Gewinnspiel beendet');
            client.say(config.channel, 'Gratulation an den Gewinner');
            client.say(config.channel, '--> ' + winner + ' <--');
            client.say(config.channel, '====================');
        }  
        customCommands['gewinn'] = false;
        customCommands.gjoin = [];

        submitButton.setAttribute('onclick',  'setGewinnspiel(true);');
        document.getElementById("ruffle").innerHTML = 'Gewinnspiel';
        document.getElementById("rulist").innerHTML = '';
    }
}

// Nebel
function nebel(state = undefined) {
    var submitButton = document.getElementById('buttonNebel');

    if (state == undefined) {
        if (customCommands['nebel']) client.say(config.channel, '/me Die nächste Nebelwand kommt!');
        else client.say(config.channel, '/me Leider steht kein Nebel zur verfügung');
    }
    if (state == 'an') {
        customCommands['nebel'] = true;
        //return '/me Der NEBEL-Modus wurde aktiviert! Bitte denkt an eure Nebelschlussleuchte um Euch hier zurecht zu finden!';
        client.say(config.channel, '/me Der Nebelmodus ist nun aktiviert! Gebe einen Nebelstoß mit "#Nebel"');
        document.getElementById("buttonNebel").innerHTML = 'Nebel aus';
        submitButton.setAttribute('onclick',  'nebel("aus");');
    }
    else if (state == 'aus') {
        customCommands['nebel'] = false;
        client.say(config.channel, '/me Der Nebelodus wurde deaktiviert!');
        document.getElementById("buttonNebel").innerHTML = 'Nebel an';
        submitButton.setAttribute('onclick',  'nebel("an");');
    }
}

// Timed Messages
function timedMessage(i) {
    let max = commands.timertext.length - 1;
    client.say(config.channel, commands.timertext[i]);

    if (i === max) { i = 0; }
    else { i = i + 1; }

    setTimeout(function () { timedMessage(i); }, commands.timer * 1000);
}

// Kontrolle ob ein user Followed
isFollowing = function (user, channel, callback) {
    if (typeof user != 'string' || typeof channel != 'string' || typeof callback != 'function') {
        return console.error('Invalid parameters. Usage: isFollowing(user_id, channel_id, callback);');
    }
    getJSON(
        'https://api.twitch.tv/helix/users/follows',
        '?from_id=' + encodeURIComponent(user) + '&to_id=' + encodeURIComponent(channel),
        function (err, res) {
            if (res && res.data[0]) callback({
                isFollowing: true,
                dateFollowed: (new Date(res.data[0].followed_at).toLocaleString())
            });
            else callback({
                isFollowing: false
            });
        }
    );
};

// Check User
function checkuser(name, list) {
    for (key in list) {
        if(key === name || list[key] == name) {
            return true;
        }
    }
    return false;
}

// Chat Zeit anzeige
function displayTime() {
    var str = '';

    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()

    if (hours < 10) hours = '0' + hours
    if (minutes < 10) minutes = '0' + minutes
    if (seconds < 10) seconds = '0' + seconds
    str += '[' + hours + ':' + minutes + ':' + seconds + '] ';
    return str;
}

function timeDifference(oldtime) {
    var dt = new Date();
    var difftime = Math.floor( ( dt.getTime() - oldtime ) / 1000);
    var diffHrs = Math.floor( difftime / 3600 ); //3600 = 60*60 = seconds per hour
    var diffMins = Math.floor( (difftime % 3600) / 60);
    var diffSecs = difftime - (diffHrs * 3600) - (diffMins * 60);

    let time = [];
    time.hours = diffHrs;
    time.minutes = (diffMins < 10) ? '0' + diffMins : diffMins;
    time.seconds = (diffSecs < 10) ? '0' + diffSecs : diffSecs;

    var output = '';
    if ( diffHrs === 1 ) output += diffHrs + ' Stunde, ';
    else if ( diffHrs > 1 ) output += diffHrs + ' Stunden, ';

    if ( diffMins === 1 ) output += diffMins + ' Minute, ';
    else if ( diffMins > 1 ) output += diffMins + ' Minuten, ';

    if ( diffSecs === 1 ) output += diffSecs + ' Sekunde';
    else output += diffSecs + ' Sekunden';
    time.text = output

    return time;
}

// Uptime
function StreamTime() {
    getJSON(
        'https://api.twitch.tv/helix/streams',
        '?user_id=' + state.channel_id,
    function (err, res) {
        if (res.data[0] == null) {
            client.say(config.channel, 'Stream offline.');
            return
        }
        // var temp = new Date(response.stream.created_at);
        var temp = new Date(res.data[0].started_at)
        var timediff = timeDifference(temp);
        client.say(config.channel, 'Der Stream ist Live seit ' + timediff.text);
    });
}

// ID eines Chatters raufinden
function getUserData(username, callback) {
    if (typeof username != 'string' || typeof callback != 'function') {
      return console.error('Invalid parameters. Usage: getID(username, callback);');
    }
    getJSON(
        'https://api.twitch.tv/helix/users',
        '?login=' + encodeURIComponent(username),
        function (err, res) {
            if (res.data[0] == null) callback({});
            else callback(res.data[0]);
        }
    );
}

// API Abruf
function getJSON(path, params, callback) {
    const oauthString = '?oauth_token=' + state.oauth;
    let url = path + oauthString;
    if (state.clientid) url += '&client_id=' + state.clientid;
    if (typeof params === 'string') url += params;
    else if (typeof params === 'function') callback = params;

    const timeoutLength = 5;
    let timeout = setTimeout(function() {
        return callback(null, {error:'Request timeout after '+ timeoutLength +' seconds.'});
    }, timeoutLength * 1000);

    if (typeof callback !== 'function') return console.error('Callback needed.');
    
    if ((typeof window !== 'object' || typeof nw === 'object' )) { // No jsonp required, so using http.get
        let http = require('https');
        http.get(url, function (res) {
            // res.setTimeout(timeoutMS, function() {
            //   res.emit('close');
            // });

            let output = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
            output += chunk;
            });
            res.on('end', function () {
            if (res.statusCode === 204) {
                clearTimeout(timeout);
                return callback(output);
            }
            else if (res.statusCode >= 200 && res.statusCode < 400) {
                try {
                clearTimeout(timeout);
                return callback(JSON.parse(output));
                } catch (err) {
                clearTimeout(timeout);
                return console.error(err + '@' + path);
                }
            } else { // error
                clearTimeout(timeout);
                return console.error(output + '@' + path);
            }
            });
        }).on('error', function (e) {
            clearTimeout(timeout);
            return console.error(e.message + '@' + path);
        });
    } else { // XHR da kein JASONP untersütztung bei der neuen API
        if (typeof params === 'string') path += params;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.setRequestHeader('Client-ID', config.clientid);
        xhr.setRequestHeader('Authorization', 'Bearer ' + state.oauth);
        xhr.responseType = 'json';
        xhr.onload = function() {
            var status = xhr.status;
            if (status === 200) {
                clearTimeout(timeout);
                return callback(null, xhr.response);
            } else {
                return callback(status, xhr.response);
            }
        };
        xhr.send();
    }
} // close getJSON

// # entfernen
function dehash(channel) {
    return channel.replace(/^#/, '');
}

// 1. Buchstabe groß
function capitalize(n) {
    return n[0].toUpperCase() +  n.substr(1);
}

// Test für HTML tauglich machen
function htmlEntities(html) {
    function it() {
        return html.map(function(n, i, arr) {
                if(n.length == 1) {
                    return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                        return '&#'+i.charCodeAt(0)+';';
                        });
                }
                return n;
            });
    }
    var isArray = Array.isArray(html);
    if(!isArray) {
        html = html.split('');
    }
    html = it(html);
    if(!isArray) html = html.join('');
    return html;
}

// Emotes Formatieren
function formatEmotes(text, emotes) {
    var splitText = text.split('');
    for(var i in emotes) {
        var e = emotes[i];
        for(var j in e) {
            var mote = e[j];
            if(typeof mote == 'string') {
                mote = mote.split('-');
                mote = [parseInt(mote[0]), parseInt(mote[1])];
                var length =  mote[1] - mote[0],
                    empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                splitText.splice(mote[0], 1, "<img class='emoticon' src='http://static-cdn.jtvnw.net/emoticons/v1/" + i + "/3.0'>");
            }
        }
    }
    return htmlEntities(splitText).join('')
}

// Chat Badges hohlen
function badges(chan, user, isBot) {
    function createBadge(name) {
        var badge = document.createElement('div');
        badge.className = 'chat-badge-' + name;
        return badge;
    }

    var chatBadges = document.createElement('span');
    chatBadges.className = 'chat-badges';

    if(!isBot) {
        if(user.username == chan) chatBadges.appendChild(createBadge('broadcaster'));
        if(user['user-type']) chatBadges.appendChild(createBadge(user['user-type']));
        if(user.turbo) chatBadges.appendChild(createBadge('turbo'));
    }
    else chatBadges.appendChild(createBadge('bot'));

    return chatBadges;
}

client.connect();