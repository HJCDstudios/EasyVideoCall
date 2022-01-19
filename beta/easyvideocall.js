/*
Easy Video Call Beta v1.2.0

TO DO:
Add support multiple video streamings
Add AcceptMulti boolean variable
Make remoteUser an array
Remove remoteCamera and put it in remoteUser
{
  "id":"",
  "name":"",
  "stream":MediaStream
}
"reconstruct" callbacks and docs.
*/
class EasyVideoCall {
  constructor() {
    this.localCamera = null;
    this.localUser = {
      "id":Date.now().toString(36) + Math.random().toString(36).substr(2),
      "name":""
    };
    this.remoteCamera = null;
    this.remoteUser = {
      "id":"",
      "name":""
    };
    this.callState = "standby";
    this.data = {};
    this.userList = [];
    this.callTimeout = 20000;
    this.cache = {
      "HandshakingWith":"",
      "CallTimeout":null,
      "Constraints":{}
    };
    this.onCallFinished = function() {
      console.log("Call finished");
    };
    this.onCallSuccess = function(user,stream) {
      console.log("Call success: "+JSON.stringify(user));
    };
    this.onCallFailed = function(reason) {
      console.log("Call Failed: "+reason);
    };
    this.onCall = function(user) {
      console.log("Received call from: "+user.name+" but declined");
      return false;
    };
    this.sendData = function(dat) {
      console.log("Send: "+JSON.stringify(dat));
    };
    this.onGotCamera = function(stream) {
      
    };
    this.onGotRemoteCamera = function(stream) {
      
    };
    this.onMessage = function(user,msg) {
      
    };
    this.onNewUser = function(user) {
      
    };
    this.onUserGone = function(user) {
      
    };
  }
  async init(camC) {
    this.cache.Constraints = camC;
    this.createRTC(camC);
    this.sendData({"user":this.localUser,"Type":"Scan"});
  }
  createRTC(camC) {
    if (rtc) {
      try {
        rtc.close();
      } catch(e) {}
    }
    var rtc = new RTCPeerConnection();
    var that = this;
    rtc.addEventListener("track",function(track) {
      that.remoteCamera = track.streams[0];
      that.onGotRemoteCamera(track.streams[0]);
    });
    rtc.oniceconnectionstatechange = function() {
      var state = this.iceConnectionState;
      if (state == "disconnected") {
        try {
          that.remoteUser = {"id":"","name":""};
          that.remoteCamera = null;
          that.stopCamera();
          that.createRTC();
          that.onCallFinished();
        } catch(e) {}
        that.callState = "standby";
      }
    };
    rtc.ondatachannel = function(event) {
      that.channel = event.channel;
      that.channel.onmessage = function(event) {
        that.onReceive(event.data);
      };
    };
    this.rtc = rtc;
    this.startCamera(camC);
  }
  async startCamera(constraints) {
    try {
      var that = this;
      var cam = await navigator.mediaDevices.getUserMedia(constraints?constraints:this.cache.Constraints);
      cam.getTracks().forEach(function(track) {
        that.rtc.addTrack(track,cam);
      });
      this.localCamera = cam;
      this.onGotCamera(cam);
    } catch(e) {
      console.error(e.toString());
    }
  }
  stopCamera() {
    try {
      this.localCamera.getTracks().forEach(function(track) {
        if (track.readyState == "live") {
          track.stop();
        }
      });
      return true;
    } catch(e) {
      return false;
    }
  }
  async onReceive(msg) {
    try {
      var that = this;
      var data = typeof msg=="string"?JSON.parse(msg):msg;
      if (["Scan","Disconnected","Message"].indexOf(data.Type) > -1 && !data.to) {
        
      } else if (["Offer","Answer","Message","Decline","Scan","ScanAnswer","Disconnected","Hangup","InAnotherCall","CallAnswered"].indexOf(data.Type) == -1) {
        return;
      }
      if (!data.user) return;
      if (data.user.id == this.localUser.id) return;
      var idList = [];
      this.userList.forEach(function(user) {
        idList.push(user.id);
      });
      switch(data.Type) {
        case "Scan":
          this.sendData({"user":this.localUser,"to":data.user.id,"Type":"ScanAnswer"});
          if (idList.indexOf(data.user.id) == -1) {
            this.onNewUser(data.user);
            this.userList.push(data.user);
          }
        break;
        case "ScanAnswer":
          if (idList.indexOf(data.user.id) == -1) {
            this.onNewUser(data.user);
            this.userList.push(data.user);
          }
        break;
        case "Disconnected":
          if (idList.indexOf(data.user.id) == -1) return;
          var newUserList = [];
          this.userList.forEach(function(id) {
            if (data.user.id != id) newUserList.push(id);
          });
          this.userList = newUserList;
          this.onUserGone(data.user);
        break;
        case "Message":
          this.onMessage(data.user,data.Message);
        break;
        
        case "Decline":
          if (this.callState != "calling" || data.user.id != this.cache.HandshakingWith) return;
          this.callState = "standby";
          this.cache.HandshakingWith = "";
          this.onCallFailed("declined");
        break;
        case "InAnotherCall":
          if (this.callState != "calling" || data.user.id != this.cache.HandshakingWith) return;
          this.callState = "standby";
          this.cache.HandshakingWith = "";
          this.onCallFailed("inanothercall");
        break;
        
        case "Offer":
          if (["incall","handshaking"].indexOf(this.callState) > -1) {
            this.sendData({"user":this.localUser,"Type":"InAnotherCall"});
            return;
          }
          if (!this.onCall(data.user)) {
            sendData({"user":this.localUser,"Type":"Decline"});
            return;
          }
          this.callState = "handshaking";
          this.cache.HandshakingWith = data.user.id;
          await this.rtc.setRemoteDescription(data.Offer);
          this.rtc.onicecandidate = function(event) {
            if (!event.candidate) {
              that.sendData({
                "user":that.localUser,
                "to":data.user.id,
                "Type":"Answer",
                "Answer":this.localDescription
              });
              that.cache.CallTimeout = setTimeout(function() {
                that.callState = "standby";
                that.cache.HandshakingWith = "";
                delete that.cache.CallTimeout;
              },that.callTimeout);
            }
          };
          var ab = this.rtc.createAnswer();
          this.rtc.setLocalDescription(ab);
        break;
        case "Answer":
          if (data.user.id != this.cache.HandshakingWith || this.callState != "calling") return;
          this.remoteUser = data.user;
          await this.rtc.setRemoteDescription(data.Answer);
          this.callState = "incall";
          this.cache.HandshakingWith = "";
          this.sendData({"user":this.localUser,"Type":"CallAnswered","to":data.user.id});
          clearTimeout(this.cache.CallTimeout);
          this.cache.CallTimeout = null;
          this.onCallSuccess(data.user);
        break;
        case "CallAnswered":
          if (data.user.id != this.cache.HandshakingWith || this.callState != "handshaking" || !this.cache.CallTimeout) return;
          this.onCallSuccess(data.user);
          this.callState = "incall";
          this.remoteUser = data.user;
          this.cache.HandshakingWith = "";
          clearTimeout(this.cache.CallTimeout);
          this.cache.CallTimeout = null;
        break;
        case "Hangup":
          if (data.user.id != this.remoteUser.id || this.callState != "incall") return;
          this.callState = "standby";
          this.remoteUser = {
            "id":"",
            "name":""
          };
          this.cache = {
            "HandshakingWith":"",
            "CallTimeout":null,
            "Constraints":this.cache.Constraints
          };
          this.stopCamera();
          this.channel.close();//maybe close the channel
          this.createRTC();
          this.onCallFinished();
        break;
        default:
      }
    } catch(e) {
      this.callState = "standby";
      this.cache.HandshakingWith = "";
      this.remoteUser = {"id":"","name":""};
      alert(e.toString()+"\n"+msg);
    }
  }
  async call(who) {
    if (typeof who != "string") return;
    if (this.callState != "standby") throw new Error(this.callState + " is not a good time to initiate a call");
    var that = this;
    if (this.channel) this.channel.close();
    this.channel = this.rtc.createDataChannel("private");
    this.channel.onmessage = function(event) {
      that.onReceive(event.data);
    };
    this.callState = "calling";
    this.cache.HandshakingWith = who;
    this.rtc.onicecandidate = function(event) {
      if (!event.candidate) {
        that.sendData({
          "user":that.localUser,
          "to":who,
          "Type":"Offer",
          "Offer":this.localDescription
        });
        that.cache.CallTimeout = setTimeout(function() {
          that.callState = "standby";
          delete that.cache.CallTimeout;
          that.onCallFailed("timedout");
        },that.callTimeout);
      }
    };
    var baka = await this.rtc.createOffer();
    this.rtc.setLocalDescription(baka);
  }
  cancelCall() {
    if (this.callState != "calling") return;
    this.callState = "standby";
    this.sendData({"user":this.localUser,"to":this.cache.HandshakingWith,"Type":"CancelCall"});
    try {
      clearTimeout(this.cache.CallTimeout);
    } catch(e) {}
    this.cache = {
      "HandshakingWith":"",
      "CallTimeout":null,
      "Constraints":this.cache.Constraints
    };
  }
  hangup() {
    if (this.callState != "incall") return;
    this.channel.send(JSON.stringify({"user":this.localUser,"to":this.remoteUser,"Type":"Hangup"}));
    this.channel.close();
    this.stopCamera();
    this.createRTC();
    this.callState = "standby";
    this.remoteUser = {"id":"","name":""};
    this.remoteCamera = null;
    this.onCallFinished();
  }
  sendMessage(msg,to,inchannel=true) {
    var toSend = {
      "user":this.localUser,
      "Type":"Message",
      "Message":msg
    };
    if (to) {
      toSend.to = to;
    }
    toSend = JSON.stringify(toSend);
    inchannel?this.channel.send(toSend):this.sendMessage(JSON.parse(toSend));
  }
  stop() {
    try {
      if (this.callState == "incall") {
        this.channel.send(JSON.stringify({"user":this.localUser,"to":this.remoteUser.id,"Type":"Hangup"}));
      }
      this.sendMessage({"user":this.localUser,"Type":"Disconnected"});
      this.channel.close();
      this.callState = "standby";
      this.remoteCamera = null;
      this.remoteUser = {"id":"","name":""};
      this.localUser = {"id":"","name":""};
      this.cache = {
        "HandshakingWith":"",
        "CallTimeout":null,
        "Constraints":{}
      };
      this.stopCamera();
    } catch(e) {}
  }
}
