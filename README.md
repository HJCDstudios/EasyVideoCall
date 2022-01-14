<iframe src="https://img.shields.io/badge/Version-1.0.1-brightgreen"/>
# EasyVideoCall
A Javascript library for easy video conferencing using webrtc

# How to use
Just include it to your html file like this:<br/>
<code>&lt;script type="text/javascript" src="easyvideocall.js"&gt;&lt;/script&gt;</code><br/>
Then use it like this:<br/>
<code><pre>
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
</pre></code>

## To make a call
<code>vidCall.call(userId)</code>
