// Code (c) 2017 Nicolas "Nickel" Kammerer
// ---------------------------------------
// Erstellt für ProjectInsight / Stefan
// 
// Bot Login: Projectinsightbot // Exone112 // Bot@e4c.info

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
    channel: '#sir_nickel',
    userid: "23803442", // ID vom Streamer - Nicolas
    //userid: "148112529", // ID vom Streamer - Stefan
    clientid: 'q6batx0epp608isickayubi39itsckt',             // Bot ID
    //clientId: 'hmh4tj2y5jw1ms9qmc74txnseqbf90',             // Nic ID

    //Hue Daten
    hueHost: '192.168.20.50',                               // Hue Bridpe IP
    hueUser: '9vVncu2eBe9OWrHWsuPG3fbxJs3p-KTUhnsG3kT7',    // Ni Hue User ID
    hueGroup: 2,                                            // Lichter Gruppe

    // Anzeigeeinstellungen
    showTime: true,                                         // Uhrzeit des Posts vor den Namen
    showHosting: true,                                      // Anzeigen wenn man jemand Hostet

    //Admin
    admins: ['sir_nickel', 'projectinsightde'],
}