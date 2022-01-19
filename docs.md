# Info

in this page we show all the uses and calbacks of
the library.

# Variables

Here you will find some various variables in the class

## localCamera (MediaStream | null)

The localCamera variable holds the current
MediaStream stream, example:
```javascript
vidCall.localCamera = await navigator.mediaDevices.getUserMedia({"video":false,"audio":true});
```
i don't recommend changing this variable when in use

## localUser (object)

This holds information about the user it would look like this:
```javascript
{
  "name":"MyName",
  "id":"uniqueId"
}
```
You can change the name but don't change the id because it might
collied with other people's id;

## remoteCamera (MediaStream | null)

Same as the localCamera variable but has the remote camera stream of the other user

## remoteUser (object)

Same as the localUser variable but holds information about the other user,
only has info when callState is incall

## callState (string)

It contains information about the classes state
possible values are:
- ***standby*** (when doing nothing)
- ***calling*** (when call function is called upon)
- ***incall*** (when the call is in session)

## data (object)

You can put stuff inside of it for future use

## userList (array)

This contains a list of active users

## callTimeout (number)

This is how long the class is going to wait until it realizes it got ghosted

## cache (object)

It contains some keys that are used by the class

# Callbacks

In this section you will find some callbacks,
it works like this: &lt;CALLBACK_NAME&gt; (&lt;PARAMETERS&gt;)

## onCallFinished ()

It gets called when the call session gets onCallFinished

## onCallSuccess (user)

It gets called when the call is successful

## onCallFailed (reason)

It gets called when the call failed to initiate, possible outcomes:
- ***inanothercall*** The user you're trying to call is inside another call
- ***declined*** The user declined your call
- ***timedout*** The user might not be available at the moment

## onCall (user)

This is called when you receive an offer or call,
accept is by returning true or false

## sendData (dat)

This is called when the class sends a message,
you would need to handle this

## onGotCamera (stream)

This is called when the class gets the camera of the current user

## onGotRemoteCamera (stream)

Called when the class gets the camera stream of the remote user

## onMessage (user,msg)

Called when you receive an message

## onNewUser (user)

Called when the class detects a new user

## onUserGone (user)

Called when a user disconnects

# Functions

In this section it shows all the functions you can call.
read it like this: &lt;FUNCTION_NAME&gt; (&lt;PARAMETERS&gt;)

## init (MediaStream-Constraints)

This is the most important part of the class this will need to called
to initiate the class.

## createRTC (MediaStream-Constraints)

This is to reset the RTCPeerConnection you do not need to call this function.

## startCamera (MediaStream-Constraints)

This is to get the users camera, you do not need to call this function

## stopCamera

This is to stop the camera, your camera to be exact. Again no need to call this function

## onReceive(data)

This is an important part of the class, Because it is the one
responsible for receiving communication from the server, Use like:
```javascript
vidCall.onReceive(<data>)
```

## call (who)

This is an important function, it used to initiate a call to the specified user id

## cancelCall ()

This cancels a call you've made

## hangup ()

This stops the current call session

## sendMessage(msg,inchannel)

***inchannel*** this will send the message inside the call when true but when false it will be broadcasted to to.<br/>
Examples:
```javascript
vidCall.sendMessage("hello kurt");//send a message to the remote user

vidCall.sendMessage("hello everyone",null,false);//sends a message to everyone

vidCall.sendMessage("hello dale","unique id",false);//sends a message to dale
```

## stop();

This stops the class and it's components.

# Beta docs

Under construction