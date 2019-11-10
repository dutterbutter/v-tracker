const http = require('http');
const httpProxy = require('http-proxy');
const sgMail = require('@sendgrid/mail');
const program = require('commander');

// CLI
program
    .requiredOption('-t, --target <url>', 'The url tha the proxy will pass the requests too.')
    .requiredOption('-e, --email <email>', 'The email to send notifications too.')
    .option('-p, --proxy-port <port>', 'The port of the proxy server.')
    .option('--timeout-interval <milliseconds>', 'Interval to wait for a request.')
    .option('--email-interval <minutes>','Interval between emails.');
    
program.parse(process.argv);

// Variables
var target = program.target;
var email = program.email;
var proxyPort = program.proxyPort || 8000;
var inttimeoutIntervalerval = program.timeoutInterval || 6000;
var emailInterval = program.emailInterval || 10;

// Create proxy
var proxy = httpProxy.createProxyServer();

// GLOBALS
// Timeout
let timer;
let isOffline;

// Logs
var logs = {
    lastRequest: null,
    /**
     * {
     *   timestamp: number
     *   lastRequest: number
     * }
     */
    notifications: []
};

/**
 * Create your server that makes an operation that waits a while and then proxies the request.
 */
http.createServer(function (req, res) {
    // Cancel previous timer
    clearTimeout(timer);

    // Ensure isOffline = false
    if (isOffline) {
        isOffline = false;
        const diff = Math.floor((Date.now() - logs.notifications[logs.notifications.length - 1].lastRequest)/1000);
        sendEmail(`Your validator client came online after ${diff} seconds!`);
    }

    // Log to stdout
    console.log("\nReceived Request from validator.");

    // Send request to the proxy
    proxy.web(req, res, {
        target: target
    });

    // Update the last request
    logs.lastRequest = Date.now();

    // Set the timer
    timer = setTimeout(triggerNotification, timeoutInterval);
}).listen(proxyPort);

/**
 * Stores to internal log, and sends an email.
 */
function triggerNotification() {
    isOffline = true;
    // clear timeout if it exists
    clearTimeout(timer);

    // Create a timestamp
    var timestamp = Date.now();
    
    // Store a log
    logs.notifications.push({
        timestamp,
        lastRequest: logs.lastRequest
    });

    // Calculate difference in seconds
    var diff = Math.floor((timestamp - logs.lastRequest)/1000);

    // Optional Log
    console.log(`\nNotification: [ERROR] No validator requests!`);
    console.log(`Last request: ${formatDate(logs.lastRequest)}`);
    console.log(`Current Time: ${formatDate(timestamp)}`);
    console.log(`Time elapsed: ${diff} seconds`);

    // Send notification
    if ((diff / 60) % emailInterval === 0) {
        sendEmail(`Your vailadtor has not responded in ${diff} seconds`);
    }

    // Start Timer
    timer = setTimeout(triggerNotification, timeoutInterval);
}

/**
 * Send an email
 * @param {string} msg 
 */
function sendEmail (msg) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.send({
        to: email,
        from: 'test@example.com',
        subject: 'V-Tracker ALERT',
        text: msg,
    });
}

/**
 * Format unix timestamp to readable date
 * @param {number} unix 
 */
function formatDate(unix) {
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

// Create your target server
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(target.split(":")[2]);