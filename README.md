![version](https://img.shields.io/badge/Version-1.0.1-brightgreen)
![build](https://img.shields.io/badge/Build-Kinda%20Failing-yellow)
# EasyVideoCall
A Javascript library for easy video conferencing using webrtc

# How to use
Just include it to your html file like this:<br/>
```html
<script type="text/javascript" src="easyvideocall.js"></script>
```
Then use it like this:<br/>
```javascript
const vidCall = new EasyVideoCall();
vidCall.onGotCamera = function(stream) {
  // handle stream
};
vidCall.onCall = function(user) {
  // handle incoming calls, return true to answer and vice versa 
  return confirm("Answer "+user.name+"?");
};
vidCall.onMessage = function(user,msg) {
  // handle an incoming message
  alert(user.name+":\n"+msg);
};
vidCall.onNewUser = function(user) {
  //this callback is called everytime when a user sends a Scan or ScanAnswer type and it is new
};
vidCall.localUser.name = "My Cool Name";
vidCall.init({"video":true,"audio":false});
/* this handles necessary components to start
The first parameter is a MediaStream Constraints
*/
```

## To make a call
```javascript
vidCall.call(userId);
```

## Remember
You need your own server like a websocket,
This is an example code on how you can use your own server:
```javascript
ws = new WebSocket();
ws.onmessage = function(event) {
  vidCall.onReceive(event.data);
};
ws.onopen = function() {
  console.log("Websocket opened");
  vidCall.sendData = function(data) {
    ws.send(JSON.stringify(data);
  };
  vidCall.init();
};
```
