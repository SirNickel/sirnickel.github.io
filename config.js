// Code (c) 2017 Nicolas "Nickel" Kammerer
// ---------------------------------------
// Erstellt für ProjectInsight / Stefan
// 
// Bot Login: Projectinsightbot // Exone112 // Bot@e4c.info

var channels = ['#projectinsightde'], // Channels to initially join
fadeDelay = 5000, // Set to false to disable chat fade
showChannel = true, // Show repespective channels if the channels is longer than 1
useColor = true, // Use chatters' colors or to inherit
showBadges = true, // Show chatters' badges
showEmotes = true, // Show emotes in the chat
doTimeouts = true, // Hide the messages of people who are timed-out
doChatClears = true, // Hide the chat from an entire channel
showHosting = true, // Show when the channel is hosting or not
showConnectionNotices = true; // Show messages like "Connected" and "Disconnected"

var config = {
    //Twitch Daten
    name: 'projectinsightbot',
    password: 'oauth:1iuhy6lfe6ndnhnzybf9lab57fqghu',
    channel: '#projectinsightde',
    userid: "148112529", // Stefan
    clientid: 'q6batx0epp608isickayubi39itsckt',            // ID von Streamer

    //Hue Daten
    hueHost: '192.168.10.110',                              // Hue Bridpe IP
    hueUser: 'qeXt0FOYYeYPb7mAwbDxT54I0r8HFhmguLm6jbEc',	// Stefan Hue ID
    hueGroup: 1,                                            // Lichter Gruppe
    hueStrobo: 16,                                           // Hue Gruppe des Stobos

    // Anzeigeeinstellungen
    showTime: true,                                         // Uhrzeit des Posts vor den Namen
    showHosting: true,                                      // Anzeigen wenn man jemand Hostet

    //Admin
    admins: ['sir_nickel', 'projectinsightde'],
}