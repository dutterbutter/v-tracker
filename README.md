# V-Tracker
V-Tracker is a proxy middleware that allows users to setup uptime monitoring for their eth2 validator client.

# Setup
V-Tracker currently supports SendGrid for sending emails, its great because you get 40,000 emails for 30 days, then 100/day forever. Head over to [SendGrid](www.sendgrid.com) and get your API and follow the instructions (assumes your API key is stored as SENDGRID_API_KEY).

# CLI Options
|Flag|Default|Description|
|----|-------|------------|
|-t, --target <url>||The url tha the proxy will pass the requests too.|
|-e, --email <email>||The email to send notifications too.|
|-p, --proxy-port <port>|8000|The port of the proxy server.|
|--timeout-interval <milliseconds>|6000|Interval to wait for a request.|
|--email-interval <minutes>|10|Interval between emails.|

# License
Apache 2.0