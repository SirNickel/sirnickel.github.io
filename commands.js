// Code (c) 2017 Nicolas "Nickel" Kammerer
// ---------------------------------------
// Erstellt für ProjectInsight / Stefan
// 
// Bot Login: Projectinsightbot // Exone112 // Bot@e4c.info

var commands = {
    // Chat Befehle
    prefix: '#',
    text: {
        'help'              : {
            'text'          : function (command, args, user, admin, mod) {
                if (args[0] == undefined) {
                    client.say(config.channel, '====================');
                    client.say(config.channel, 'Liste der Möglichen Befehle');
                    client.say(config.channel, 'Textbefehle:   #help text');
                    client.say(config.channel, 'Lichtbefehle:  #help licht');
                    client.say(config.channel, '====================');
                }
                if (args[0] == 'text') {
                    var output = Object.keys(commands.text);
                    output.splice(output.indexOf('listviewers'), 1);

                    client.say(config.channel, 'Verfügbare Befehle: ' + commands.prefix + output.join(', ' + commands.prefix));
                }
                else if (args[0] == 'licht') {
                    var output = Object.keys(commands.lights);
                    client.say(config.channel, 'Verfügbare Befehle: ' + commands.prefix + output.join(', ' + commands.prefix));
                }
            },
            'timer'         : '30', // Max alle xxx Sekunden
        },
        'creator'           : {
            'text'          : 'Ich bin bereit, meinen Schöpfer zu treffen. Ob mein Schöpfer auf das Leiden vorbereitet ist, mich zu treffen, ist eine andere Sache. Sein Name ist ... Nickel',
        },
        'dance'             : {
            'text'          : 'GivePLZ TakeNRG GivePLZ TakeNRG GivePLZ TakeNRG GivePLZ TakeNRG GivePLZ TakeNRG',
        },
        'bier'              : {
            'text'          : 'Na, willste Bier? Im Kühlschrank steht eines! :D',
        },
        'donate'            : {
            'text'          : 'Spende uns doch etwas: https://www.tipeeestream.com/projectinsightde/donation',
            'timer'         : '30', // Max alle xxx Sekunden
        },
        'facebook'          : {
            'text'          : 'Folge uns auf Facebook: https://www.facebook.com/ProjectInsightDE/',
            'timer'         : '30', // Max alle xxx Sekunden
        },
        'gigadance'         : {
            'text'          : 'Folgt unserem DJ-Kollegen aus Österreich! :)https://www.twitch.tv/gigadancedj BloodTrail BloodTrail BloodTrail BloodTrail BloodTrail BloodTrail',
            'timer'         : '30', // Max alle xxx Sekunden
        },
        'go'                : {
            'text'          : 'JA! ICH will, das die Party weiter geht!!! Verlängerung! :D',
        },
        'nackt'             : {
            'text'          : 'Du Sau! :P',
        },
        'ping'              : {
            'text'          : 'PONG!',
        },
        'pong'              : {
            'text'          : 'PING!',
        },
        'eltsch'            : {
            'text'          : 'DJ-Eltsch ist On Air!',
        },
        'benny'             : {
            'text'          : 'DJ-Ced One ist On Air!',
        },
        'skylin3r'          : {
            'text'          : '/me Aktuell an den Decks, der DJ-Skylin3r!',
        },
        'stefan'            : {
            'text'          : 'Skylin3r',
		},
        'bss'          		: {
            'text'          : 'Die geilten Bayern? Das BavarianSoundSystem! ;)',
		},
        'roli'          	: {
            'text'          : 'Der beste Koch? Der Roli! ;)',
		},
        'djanedestiny'      : {
            'text'          : 'Starke FrauenPower im harten Bereich der elektronischen Tanzmusik! https://www.twitch.tv/djanedestiny',
		},
        'tbmarkus'       	: {
            'text'          : 'Idol meiner Jugend! Klasse DJ auf Technobase.FM gewesen! Jetzt ist er auf Twitch unterwegs! https://www.twitch.tv/tbmarkus',
        },
        'Orca'            : {
            'text'          : 'Klasse Typ! Bestes Intro, das ich für DJ-Shows kenne! ;) https://twitch.tv/dj_orca',
		},
        'tomtrax'           : {
            'text'          : 'Folgt unserem DJ-Kollegen TOMTRAX!https://www.twitch.tv/tomtrax',
        },
        'x-cess'            : {
            'text'          : 'Folgt unserem Kollegen X-Cess!https://www.twitch.tv/xcessmusic',
        },
		'ehefrau'            : {
            'text'          : 'Die allerliebste @katjaboxleiter ! <3 <3 <3 Ehefrau <3 <3 <3',
        },
        'sm'                : {
            'text'          : 'Wir im Social-Media: http://project-insight.de',
        },
        'instagram'         : {
            'text'          : 'Folge und auf Instagram: https://www.instagram.com/projectinsightde/',
        },
        'mixcloud'          : {
            'text'          : 'Folge uns auf Mixcloud: https://www.mixcloud.com/ProjectInsight/',
        },
        'youtube'           : {
            'text'          : 'Abonniert uns auf YouTube!https://www.youtube.com/channel/UCjXvbS9r2q_k0UgVN6UvoXA',
        },
        'youporn'           : {
            'text'          : 'Geile Pornos von mir: https://www.youtube.com/channel/UCjXvbS9r2q_k0UgVN6UvoXA',
            'timer'         : '30', // Max alle xxx Sekunden
        },
        'nebel'             : {
            'text'          : function(command, args, user, admin, mod) {
                                if (args[0] == undefined) nebel();
                                if (args[0] == 'an' && admin) nebel('an');
                                else if (args[0] == 'aus' && admin) nebel('aus');
                            },
            'timer'         : '1', // Max alle xxx Sekunden
        },
        'strobo'             : {
            'text'          : function(command, args, user, admin, mod) {
                                api.setGroupState(config.hueStrobo, {"on": true});
                                setTimeout(function() {
                                    api.setGroupState(config.hueStrobo, {"on": false})
                                }, 10*1000);
                            },
            'timer'         : '120', // Max alle xxx Sekunden
        },
        'gewinn'            : {
            'text'          : function(command, args, user, admin, mod) {
                                if (args[0] == undefined) {
                                    if (customCommands['gewinn']) {
                                        if (customCommands.gjoin.indexOf(user) == -1) {
                                            customCommands.gjoin.push(user);
                                            return userdata[user].display_name + ', Erfolgreich beigetretten';
                                        } else if (customCommands.gjoin.indexOf(user) > -1) {
                                            return userdata[user].display_name + ', bereits teilgenommen!';
                                        }
                                    } else return 'Immoment kein Gewinnspiel!';
                                }
                                if (args[0] == 'start' && admin) {
                                    customCommands['gewinn'] = true;
                                    customCommands.gjoin = [];
                                    return 'Gewinnspiel gestartet beitretten mit #gewinn';
                                }
                                else if (args[0] == 'ende' && admin) {
                                    customCommands['gewinn'] = false;
                                    let i = Math.floor(Math.random() * customCommands.gjoin.length);
                                    let name = customCommands.gjoin[i];
                                    let winner = userdata[name].display_name
                                    client.say(config.channel, '====================');
                                    client.say(config.channel, 'Gewinnspiel beendet');
                                    client.say(config.channel, 'Gratulation an den Gewinner');
                                    client.say(config.channel, '--> ' + winner + ' <--');
                                    client.say(config.channel, '====================');
                                    customCommands.gjoin = [];
                                }
                            },

            'timer'         : '1', // Max alle xxx Sekunden
        },
        'lob'               : {
            'text'          : 'Magst den Tadel noch so fein, noch so zart bereiten, weckt er Widerstreiten. Lob darf ganz geschmacklos sein, hocherfreut und munter schlucken sie’s hinunter.',
            'rechte'        : 'admin'
        },
        'tadel'             : {
            'text'          : function(command, args, user, admin, mod) {
                var texts = [
                    "Eine Gehirnzelle weniger, und du wärst 'ne Topfpflanze.",
                    "Es ist ja nicht so, dass ich dich hasse, aber würdest du brennen und ich hätte Wasser… Ich würd's trinken!",
                    "Gibt es dich auch in schön?",
                    "Hast du dir die Nummer gemerkt? Na, vom Lastwagen, der dir über das Gesicht gefahren ist?",
                    "Ist dein Vater Taxifahrer? Oder warum siehst du so mitgenommen aus?",
                    "Keine Ahnung was dich so dumm macht, aber es funktioniert perfekt. ",
                    "Mein Mittelfinger lässt dich grüßen.",
                    "Wann immer du einen Freund brauchst, kauf dir einen Hund.",
                    "Was man nicht im Kopf hat, sollte man in den Beinen haben. Du solltest sehr lange Beine haben!",
                    "Wenn Dummheit klingeln würde, bräuchtest du kein Handy.",
                    "Wie bringst du dein Hirn auf Erbsengröße? Ist doch ganz klar, einfach aufblasen! ",
                    "Willst du dir den Tag versauen, musst du in den Spiegel schauen.",
                    "Du bist wie ein Duden! Aufschlagen, zuschlagen und immer wieder nachschlagen!",
                ]
                var i = Math.floor(Math.random() * texts.length);
                if (args[0]) return args[0] + ", " + texts[i]
                else return texts[i]
            },
            'rechte'        : 'admin'
        },
        'listviewers'       : {
            'text'          : function viewers() { return users.join(', '); },
            'rechte'        : 'admin'
        },
        'uptime'            : {
            'text'          : function(command, args, user, admin, mod) { StreamTime(); },
            'rechte'        : ''
        },
    },

    lights: {
        'rot'           : {"hue": 0},
        'red'           : {"hue": 0},
        'gelb'          : {"hue": 10922},
        'yellow'        : {"hue": 10922},
        'orange'        : {"hue": 12306},
        'grün'          : {"hue": 21845},
        'green'         : {"hue": 21845},
        'navyblue'      : {"hue": 45608},
        'blau'          : {"hue": 43690},
        'blue'          : {"hue": 43690},
        'purple'        : {"hue": 48185},
        'pink'          : {"hue": 54418},
        'weiß'          : {"hue": 0, "sat": 0},
        'white'         : {"hue": 0, "sat": 0},
        'black'         : {"on": false},
        'schwarz'       : {"on": false},
        'licht an'      : {"on": true},
        'licht aus'     : {"on": false},
        'blind'         : {"timeout": 10, "hue": Math.round(Math.random() * 65000), "bri": 254},
        'colorloop'     : {"effect": "colorloop"},
        'random color'  : {"hue": Math.round(Math.random() * 65000)},
    },
    
    // Willkommensnachrichten
    welcome: {
        'standard'          : ['Wünderschönen guten {TIME} {NICK}!',
                            '{NICK} willkommen bei meinem Stream!',
                            'Guten {TIME} {NICK}!',
                            'Willkommen {NICK}!',
                            '{NICK} möge die Musik mit dir sein!',
                            'Nimm platz und genieß die Musik {NICK}',
                            '{NICK} ist der Party beigetretten'],
        'projectinsightbot' : '',
        'nightbot'          : '',
        'sir_nickel'        : '/me begrüßt sein Schöpfer! #creator Nickel',
        'projectinsightde'  : 'The Roof, The Roof, The Roof is on Fire!!!',
        'djskylin3r'        : 'Welcome the one and only DJ Skylin3r',
        'imaginie'          : 'Max! Senpai noticed you!  TearGlove',
		'T0rox'             : 'Das Nachbarskind ist Online! Yo Bruda!',
		'Eltsch'       	    : 'Ein Teammitglied betritt das Gebiet! Achtung! Eltsch is in da House! :P',
		'djcedonede'        : 'Ein Teammitglied betritt das Gebiet! Achtung! Ced One is mal nicht am Produzieren ;)!'
    },

    // Rotierende Nachrichten
    timer: 600, // Sekunden
    timertext: [
        'Dir gefällt der Stream? Dann unterstütze uns mit Deiner Spende? https://www.tipeeestream.com/projectinsightde/donation',
        'Folge uns auf Facebook: https://www.facebook.com/ProjectInsightDE/',
		'Du bist mit dem Handy unterwegs ? Dan gönn dir unseren "Spritsparenden" Radio-Stream: https://project-insight.de/radio/ '
    ],
}