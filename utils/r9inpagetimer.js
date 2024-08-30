// r9 remote request handler, used to deal with waiting/resume
function R9RequestRegister() {
  this.rqcounts = 0;
  this.timer = null;
}

R9RequestRegister.prototype.markTimer = function (maxWaitTime) {
  if (this.timer) {
    clearInterval(this.timer);
  }
  if (this.rqcounts <= 0) return;
  var that = this;
  this.timer = setInterval(function () {
    maxWaitTime -= 100;
    if (maxWaitTime > 0) {
      r9.markr9times();
    } else {
      that.rqcounts--;
      clearInterval(that.timer);
      that.timer = null;
      that.markTimer(5000);
    }
  }, 100);
};

R9RequestRegister.prototype.addRqst = function () {
  if (this.rqcounts < 0) this.rqcounts = 0;
  this.rqcounts++;
  this.markTimer(10000);
};

R9RequestRegister.prototype.removeRqst = function () {
  this.rqcounts--;
  if (this.rqcounts <= 0) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
    return;
  }
  this.markTimer(10000);
};

R9RequestRegister.prototype.empty = function () {
  return this.rqcounts <= 0;
};

R9RequestRegister.prototype.reset = function () {
  this.rqcounts = 0;
  if (this.timer) {
    clearInterval(this.timer);
  }
};

// R9 animation wrapper
function R9AniWrap(
  node,
  setup,
  func,
  id,
  stimeInSec,
  durationInSec,
  wait,
  freq,
  resumeAni,
  callback,
  repeat,
  block
) {
  this.node = node;
  this.realStime = 0;
  this.lastRunTime = 0;
  this.id = typeof id === "undefined" ? "" : id;
  this.func = func;
  this.setup = setup;
  this.stime = stimeInSec * 1000 || 0;
  this.duration = durationInSec ? durationInSec * 1000 : -1;
  this.wait = wait || false;
  this.freq = freq ? freq * 1000 : 0;
  this.resumeAni = resumeAni || false;
  this.callback = callback;
  this.repeat = typeof repeat === "undefined" ? false : repeat;
  this.block = typeof block === "undefined" ? false : block;
  this.doneJob = false;
  this.invoked = false;
  this.doneChecker = null;
}

R9AniWrap.prototype.run = function (frame) {
  var ct = new Date().getTime();
  if (this.realStime == 0) {
    this.realStime = ct;
  } else {
    if (this.freq != 0 && ct - this.lastRunTime < this.freq) return;
  }
  if (this.lastRunTime == 0 && this.setup) {
    this.setup();
  }
  this.lastRunTime = ct;
  var accTime = ct - this.realStime;
  if (this.node && !this.node.parent) {
    this.doneJob = true;
    return;
  }
  if (this.duration > 0) {
    var progress = accTime / this.duration;
    if (progress < 1) {
      try {
        if (this.func)
          this.func(progress, this.duration / 1000.0, accTime / 1000.0);
        else if (this.node) this.node.progressvalue(progress);
      } catch (e) {
        r9_log_console(e);
      }
      return true;
    } else {
      if (this.repeat) {
        this.reset();
      } else {
        try {
          if (this.func) this.func(1, this.duration / 1000.0, accTime / 1000.0);
          else if (this.node) this.node.progressvalue(1);
        } catch (e) {
          r9_log_console(e);
        }
        this.doneJob = true;
      }
      return false;
    }
  } else {
    try {
      if (this.func) this.func(-1, this.duration / 1000.0, accTime / 1000.0);
      else if (this.node) this.node.progressvalue(-1);
    } catch (e) {
      r9_log_console(e);
    }
    return true;
  }
};

R9AniWrap.prototype.isDone = function () {
  if (this.doneChecker != null && this.doneChecker()) return true;
  return this.doneJob;
};

R9AniWrap.prototype.reset = function () {
  this.lastRunTime = 0;
  this.realStime = 0;
  this.doneJob = false;
};

// R9 In-Page Timer
function R9InPageTimer(page, layerSetting, prefix, pos) {
  this.page = page;
  this.layerSetting = layerSetting;
  this.layer = layerSetting.layer;
  this.prefix = prefix;
  this.pos = pos;
  this.anim = null;
  this.aniList = [];
  this.onetimeList = [];
  this.daemonList = [];
  this.registeredList = [];
  this.doneAnim = false;
  this.doneTime = 0;
  this.paused = false;
  this.mediaReceived = 0;
  this.timer = 0;
  this.startTime = 0;
  this.accPausedTime = 0;
  this.lastPausedTime = 0;
}

R9InPageTimer.prototype.getPinByName = function (pinName) {
  var pinlist = this.layerSetting.pinList;
  if (!pinlist[pinName]) pinlist[pinName] = new Kinetic.SocketPin(pinName);
  return pinlist[pinName];
};

R9InPageTimer.prototype.registerPin = function (pinName, socket) {
  var pin = this.getPinByName(pinName);
  pin.sockets.push(socket);
  socket.pin = pin;
  return pin;
};

R9InPageTimer.prototype.syncNodesByPins = function () {
  var visited = [],
    pinlist = this.layerSetting.pinList;
  for (var i in pinlist) {
    var pin = pinlist[i];
    pin.syncWithUIChange(visited);
  }
};

R9InPageTimer.prototype.removePin = function (pinName) {
  delete this.layerSetting.pinList[pinName];
};

R9InPageTimer.prototype.validatePins = function () {
  var pinlist = this.layerSetting.pinList;
  for (var i in pinlist) {
    var pin = pinlist[i];
    if (!pin.valid()) delete pinlist[i];
  }
};

R9InPageTimer.prototype.markrun = function () {
  if (this.onetimeList.length > 0) {
    r9.markr9times();
    return;
  }
  for (var i in this.aniList) {
    if (
      !this.aniList[i].repeat &&
      !this.aniList[i].block &&
      this.aniList[i].duration > 0
    ) {
      r9.markr9times();
      return;
    }
  }
};

R9InPageTimer.prototype.register = function (
  func,
  id,
  stimeInSec,
  durationInSec,
  wait,
  freqInSec,
  resumeAni,
  callback,
  repeat
) {
  var func2 = func.bind(this.page);
  this.registeredList.push(
    new R9AniWrap(
      null,
      func2,
      id,
      stimeInSec,
      durationInSec,
      false,
      freqInSec,
      resumeAni,
      callback,
      repeat
    )
  );
};

R9InPageTimer.prototype.wakeup = function (id, delayInMini) {
  for (var i in this.aniList) {
    if (this.aniList[i].id === id) {
      this.aniList[i].block = false;
      if (typeof delayInMini != "undefined") {
        var timeused =
          new Date().getTime() - this.startTime - this.accPausedTime;
        this.aniList[i].stime = timeused + delayInMini;
      }
      break;
    }
  }
};

R9InPageTimer.prototype.activate = function (id, delayInMini) {
  for (var i in this.aniList) {
    if (this.aniList[i].id === id) {
      return;
    }
  }
  var found = null;
  for (var i in this.registeredList) {
    if (this.registeredList[i].id === id) {
      found = this.registeredList[i];
      if (typeof delayInMini != "undefined") {
        var timeused =
          new Date().getTime() - this.startTime - this.accPausedTime;
        found.stime = timeused + delayInMini;
      }
      break;
    }
  }
  if (found) {
    this.aniList.push(found);
  }
};

R9InPageTimer.prototype.addAnimation = function (
  func,
  stimeInSec,
  durationInSec
) {
  this.addAni2(
    null,
    null,
    func,
    stimeInSec,
    durationInSec,
    false,
    0,
    false,
    null,
    false,
    false,
    undefined
  );
};

R9InPageTimer.prototype.addAni = function (
  node,
  func,
  stimeInSec,
  durationInSec,
  wait,
  freqInSec,
  resumeAni,
  callback,
  repeat,
  block,
  id
) {
  this.addAni2(
    node,
    null,
    func,
    stimeInSec,
    durationInSec,
    wait,
    freqInSec,
    resumeAni,
    callback,
    repeat,
    block,
    id
  );
};

R9InPageTimer.prototype.addAni2 = function (
  node,
  setup,
  func,
  stimeInSec,
  durationInSec,
  wait,
  freqInSec,
  resumeAni,
  callback,
  repeat,
  block,
  id
) {
  var func2 = func == null ? null : func.bind(this.page);
  var setup2 = setup == null ? null : setup.bind(this.page);
  this.aniList.push(
    new R9AniWrap(
      node,
      setup2,
      func2,
      id,
      stimeInSec,
      durationInSec,
      wait,
      freqInSec,
      resumeAni,
      callback,
      repeat,
      block
    )
  );
};

R9InPageTimer.prototype.addAniOnNodeProgress = function (
  obj,
  stimeInSec,
  durationInSec,
  wait,
  freqInSec,
  resumeAni,
  callback,
  repeat,
  block,
  id
) {
  this.addAniOnNodeProgress2(
    obj,
    null,
    stimeInSec,
    durationInSec,
    wait,
    freqInSec,
    resumeAni,
    callback,
    repeat,
    block,
    id
  );
};

R9InPageTimer.prototype.addAniOnNodeProgress2 = function (
  obj,
  setup,
  stimeInSec,
  durationInSec,
  wait,
  freqInSec,
  resumeAni,
  callback,
  repeat,
  block,
  id
) {
  var func = function (progress, times) {
    try {
      obj.progress(progress, durationInSec, times / 1000.0);
    } catch (e) {
      r9_log_console(e);
    }
    return true;
  };
  this.addAni2(
    obj,
    setup,
    func,
    stimeInSec,
    durationInSec,
    wait,
    freqInSec,
    resumeAni,
    callback,
    repeat,
    block,
    id
  );
};

R9InPageTimer.prototype.addOneTimeEvt = function (
  node,
  func,
  stimeInSec,
  durationInSec,
  wait
) {
  var func2 = func.bind(this.page);
  this.onetimeList.push({
    node: node,
    func: func2,
    stime: stimeInSec * 1000,
    dur: durationInSec * 1000,
    invoked: false,
    wait: wait,
  });
};

R9InPageTimer.prototype.addDaeomEvt = function (
  inpage,
  id,
  node,
  func,
  durationInSec,
  checker
) {
  if (
    !inpage &&
    id &&
    this.layerSetting.daemonList.filter(function (m) {
      return m.id == id;
    }).length > 0
  )
    return;
  if (
    inpage &&
    id &&
    this.daemonList.filter(function (m) {
      return m.id == id;
    }).length > 0
  )
    return;
  var func2 = func;
  if (!func2)
    func2 = function (progress) {
      node.progressvalue(progress);
    };
  var repeat = true,
    stime = 0,
    wait = false,
    freq = 0,
    resume = false,
    callback = null;
  var w = new R9AniWrap(
    node,
    null,
    func2,
    id,
    stime,
    durationInSec || 1,
    wait,
    freq,
    resume,
    callback,
    repeat
  );
  w.doneChecker = checker;
  if (inpage) this.daemonList.push(w);
  else this.layerSetting.daemonList.push(w);
};

R9InPageTimer.prototype.addDelayOneTimeEvt = function (func, delayInSec) {
  if (this.startTime == 0) {
    this.addOneTimeEvt(null, func, 0, 0.1, true);
  } else {
    var timeused = new Date().getTime() - this.startTime - this.accPausedTime;
    this.addOneTimeEvt(null, func, timeused / 1000 + delayInSec, 0.1, true);
  }
};

R9InPageTimer.prototype.run = function (frame) {
  var that = this,
    notask = this.aniList.length == 0 && this.onetimeList.length == 0;
  var timeused = new Date().getTime() - this.startTime - this.accPausedTime;

  if (!this.doneAnim && notask && r9.r9rqstRter.empty()) {
    this.doneTime++;
    if (this.doneTime > 10) {
      this.doneAnim = true;
      this.addOneTimeEvt(
        null,
        function () {
          var player = that.page.r9player;
          player.inSetup = false;
          if (that.page.pagestay) that.page.pagestay();
          if (that.page.blockanimation) player.stop();
          else player.leavingPage();
        },
        timeused / 1000.0 + that.page.staytimeInSec,
        0.1,
        true
      );
      return;
    }
  }

  var needToPaint = false;
  for (var i = this.layerSetting.daemonList.length - 1; i >= 0; i--) {
    var target = this.layerSetting.daemonList[i];
    if (target.isDone()) {
      this.layerSetting.daemonList.splice(i, 1);
    } else {
      var p = false;
      try {
        p = target.run(frame);
      } catch (e) {
        r9_log_console(e);
      }
      if (typeof p === "boolean") {
        needToPaint = needToPaint || p;
      }
    }
  }
  for (var i = this.daemonList.length - 1; i >= 0; i--) {
    var target = this.daemonList[i];
    if (target.isDone()) {
      this.daemonList.splice(i, 1);
    } else {
      var p = false;
      try {
        p = target.run(frame);
      } catch (e) {
        r9_log_console(e);
      }
      if (typeof p === "boolean") {
        needToPaint = needToPaint || p;
      }
    }
  }
  if (this.paused) {
    if (needToPaint) {
      this.syncNodesByPins();
      this.layerSetting.layer.batchDraw();
    }
    return;
  }

  var waitBg = this.page.fromServerMedia && !this.page.mdstarted;
  if (waitBg) {
    this.mediaReceived = timeused;
  }

  for (var i = this.aniList.length - 1; i >= 0; i--) {
    var target = this.aniList[i];
    if (target.block || (target.wait && waitBg)) continue;
    if (target.node && !target.invoked && target.node.checkInAnimation())
      continue;
    var t = target.wait ? timeused - this.mediaReceived : timeused;
    if (t < target.stime) continue;
    var p = false;
    try {
      p = target.run(frame);
    } catch (e) {
      r9_log_console(e);
    }
    target.invoked = true;
    if (target.node) target.node.setDuringAnimation(true);
    if (target.isDone()) {
      if (target.resumeAni) {
        r9.PageBus.publish("r9.core.animation.resume", {
          prefix: this.prefix,
          messageid: -1,
          pos: this.pos,
        });
      }
      if (target.callback) target.callback();
      this.aniList.splice(i, 1);
      if (target.node) target.node.setDuringAnimation(false);
    }
    if (typeof p === "boolean") {
      needToPaint = needToPaint || p;
    }
  }
  for (var i = this.onetimeList.length - 1; i >= 0; i--) {
    var target = this.onetimeList[i];
    if (waitBg && target.wait) continue;
    if (target.node && !target.invoked && target.node.checkInAnimation())
      continue;
    var t = target.wait ? timeused - this.mediaReceived : timeused;
    if (t < target.stime) continue;
    try {
      if (!target.invoked) {
        target.invoked = true;
        target.func();
        needToPaint = true;
      }
    } catch (e) {
      r9_log_console(e);
    }
    if (t >= target.stime + target.dur) {
      this.onetimeList.splice(i, 1);
      if (target.node) target.node.setDuringAnimation(false);
    }
  }

  this.markrun();
  this.syncNodesByPins();
  if (needToPaint) {
    this.layerSetting.layer.batchDraw();
  }
};

R9InPageTimer.prototype.schedule = function () {
  this.stop();
  var func = this.run.bind(this);
  var that = this;
  if (this.startTime == 0) {
    this.startTime = new Date().getTime();
  } else {
    this.accPausedTime += new Date().getTime() - this.lastPausedTime;
  }
  that.anim = new Kinetic.Animation(function (frame) {
    func(frame);
  }, that.layer);
  that.anim.start();
};

R9InPageTimer.prototype.stop = function () {
  if (this.anim) {
    this.anim.stop();
  }
  this.lastPausedTime = new Date().getTime();
};

R9InPageTimer.prototype.destroy = function () {
  this.stop();
  this.onetimeList = [];
  this.aniList = [];
  this.registeredList = [];
  this.daemonList = [];
  this.doneAnim = false;
  this.doneTime = 0;
  this.paused = false;
  this.mediaReceived = 0;
  this.startTime = 0;
  this.accPausedTime = 0;
  this.lastPausedTime = 0;
};
