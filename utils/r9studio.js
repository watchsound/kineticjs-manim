var LayerSetting = function (name, layer, resumeAnimation, autoClose) {
  this.name = name;
  this.i2f = {}; // Map for nodes
  this.emotions = {}; // Emotional states, if needed
  this.transpages = []; // Transitions between pages
  this.r9player = null; // R9PageChainPlayer instance
  this.tmpnodes = []; // Temporary nodes
  this.gnrtrids = {}; // Generated IDs
  this.ptimer = null; // Timer for animations
  this.layer = layer; // Kinetic layer or similar
  this.ra = resumeAnimation; // Resume animation flag
  this.autoClose = autoClose; // Auto close flag
  this.daemonList = []; // List of daemon tasks
  this.pinList = {}; // List of pins for sync
  this.size = null; // Size information if needed
};

// Method to destroy the LayerSetting instance and clean up
LayerSetting.prototype.destroy = function () {
  // Stop the player if it exists
  if (this.r9player != null) {
    this.r9player.stop();

    // Cleanup the current page if it exists and has a cleanup function
    var curPage = this.r9player.getCurPage();
    if (curPage && typeof curPage.pagecleanup === "function") {
      try {
        curPage.pagecleanup();
      } catch (e) {
        r9_log_console(e);
      }
    }
  }

  // Destroy the layer if it exists
  if (this.layer != null) {
    try {
      this.layer.destroy();
    } catch (e) {
      r9_log_console(e);
    }
  }

  // Reset properties to initial states
  this.emotions = {};
  this.transpages = [];
  this.tmpnodes = [];
  this.gnrtrids = {};
  this.daemonList = [];
  this.pinList = {};

  // Cleanup the PageBus timeline for this layer, if r9 is defined
  if (typeof r9 !== "undefined" && r9.PageBus) {
    try {
      r9.PageBus.cleanupTimeline(this.name);
    } catch (e) {
      r9_log_console(e);
    }
  }

  // Set the layer to null to prevent any accidental usage after destruction
  this.layer = null;
};

var R9StudioStage = function (r9topdivid, docuuid, stageProps) {
  this.r9topdivid = r9topdivid;
  this.docuuid = docuuid;
  this.vjsid = "vjs_" + r9topdivid;
  this.cvsid = "cvs_" + r9topdivid;
  this.topdom = document.getElementById(r9topdivid);
  this.vjsdom = document.getElementById(this.vjsid);
  this.cvsdom = document.getElementById(this.cvsid);

  this.firstload = true;
  this.initialTTS = false;
  this.PageBus = PageBus;
  this.r9timestamp = 0;
  this.width = stageProps.docwidth;
  this.height = stageProps.docheight;

  // Initialize the KineticJS stage
  this.stage = new Kinetic.Stage({
    container: this.cvsid,
    width: stageProps.docwidth,
    height: stageProps.docheight,
  });

  if (stageProps.hasBgJsAnimation) {
    this.bblayer = new Kinetic.Layer();
    this.stage.add(this.bblayer);
  }

  var mlayer = new Kinetic.Layer();
  this.layersetting = new LayerSetting("", mlayer, false, false);
  this.stage.add(mlayer);

  this.bgAniJsHandler = null;
  this.r9pathdict = [];
  this.baiduacctoken = null;
  this.appuuid = Math.random();
  this.baiduerror = false;
  this.ttsspeed = stageProps.ttsspeed;
  this.baiduTTS = stageProps.baiduTTS;
  this.FOR_IPAD_AS4 = stageProps.FOR_IPAD_AS4;
  this.r9userprofile = {
    name: r9getURLPara("r9username"),
    tname: stageProps.usernameHolder,
  };
  this.r9gsummary = {
    score: 0,
    total: 0,
    emotion: "",
    pos: 0,
    totalpos: stageProps.totalpos,
  };
  this.hotspotCanJumpAfterVisitOnly = stageProps.hotspotCanJumpAfterVisitOnly;
  this.layerstack = [];
  this.timelinescreens = [];

  this.curtarget = null;
  this.docw = 100;
  this.doch = 100;
  this.hotphases = {};
  this.htpsovals = {};
  this.htpsflag = {};

  this.animationFrameId = 0;
  this.flagset = [];
  this.score_report = [];
  this.firstload = true;
  this.acheivedwards = [];
  this.awardimages = [];
  this.varsTable = {};
  this.varsTypeTable = {};
  this.problemscores = {}; // Zero is correct, undefined is unused
  this.problemlocs = {};
  this.mcpoptions = {};

  this.inSpeakerMode = true;
  this.usetts = true;
  this.initialTTS = false;
  this._langCode_ = "zh";

  this.newimages = stageProps.newimages || [];

  this.r9rqstRter = new R9RequestRegister(this);

  this.r9captiontimer = -1;
  this.capline = new Kinetic.Rect(
    r9figure({
      fg: 255,
      sw: 1.0,
      w: this.stage.getWidth(),
      h: 36,
      x: 0,
      y: this.stage.getHeight() - 75,
      fr: 255,
      fsz: 24.0,
      dr: false,
      sb: 255,
      fal: 0.05,
      sed: false,
      sg: 255,
      fb: 255,
      value: "",
      sr: 255,
      opa: 1,
    })
  );
  this.captext = new Kinetic.R9Text(
    r9figure({
      sft: 0,
      dur: 0,
      fg: 1,
      sw: 1.0,
      h: 27,
      fr: 1,
      fsz: 22.0,
      fs: "normal",
      dr: false,
      sb: 1,
      sg: 1,
      lh: 26,
      fb: 1,
      ran: 0,
      sr: 1,
      opa: 1,
      x: 0,
      y: this.stage.getHeight() - 80,
    })
  );

  this.bgvideotimeline = null;
  this.bgvideojs = null;
  this.autoCreatedVideo = false;

  this.draftbutton = null;
  this.playbutton = null;
  this.restartbutton = null;
  this.bgvideoplaybutton = null;
  this.obj2loc = {};
  this.variables = [];
  this.varmtime = 0;

  // Subscribe to PageBus events
  this.PageBus.subscribe(
    "r9.core.study.score.report",
    this,
    this.onScoreReport,
    "#"
  );
  this.PageBus.subscribe(
    "r9.core.event.captionLineEvent",
    this,
    this.onR9CaptionLine,
    null,
    "#"
  );
};

// Handle caption line events
R9StudioStage.prototype.onR9CaptionLine = function (subject, edo, ssd) {
  var that = this;
  if (subject == "r9.core.event.captionLineEvent") {
    clearTimeout(that.r9captiontimer);
    that.capline.remove();
    if (edo.caption != null && edo.caption.length > 0) {
      that.capline.y(that.stage.getHeight() - 75);
      that.layer().add(that.capline);
    }
    that.layer().draw();
  }
  that.captext.remove();
  if (edo.caption != null && edo.caption.length > 0) {
    that.captext.y(that.stage.getHeight() - 80);
    that.layer().add(that.captext);
    that.captext.setFontSize(22);
    that.captext.text(edo.caption);
    that.captext.otext(edo.caption);
    that.captext.r9textstyle(edo.r9textstyle);
    that.captext._setTextData();
    var lx = (that.stage.getWidth() - that.captext.getWidth()) / 2;
    if (lx < 0) {
      that.captext.setFontSize(20);
      lx = (that.stage.getWidth() - that.captext.getWidth()) / 2;
    }
    that.captext.x(lx);
  }
  that.layer().draw();
  that.r9captiontimer = setTimeout(function () {
    that.capline.remove();
    that.captext.remove();
  }, edo.duration);
};

R9StudioStage.prototype.setVarValue = function (varid, value) {
  var vtype = this.varsTypeTable[varid];
  if (!vtype) return;

  switch (vtype.t) {
    case 0: // String
      this.varsTable[varid] = value;
      break;
    case 1: // Integer
      this.varsTable[varid] = parseInt(value, 10);
      break;
    case 2: // Float
      this.varsTable[varid] = parseFloat(parseFloat(value).toFixed(vtype.f));
      break;
    case 3: // Time (Integer)
      this.varsTable[varid] = parseInt(value, 10);
      break;
  }
  this.varmtime = new Date().getTime();
};

R9StudioStage.prototype.getVarValue = function (varid) {
  var vtype = this.varsTypeTable[varid];
  if (!vtype) return undefined;

  switch (vtype.t) {
    case 1: // Integer
      return parseInt(this.varsTable[varid] || 0, 10);
    case 2: // Float
      return parseFloat(
        parseFloat(this.varsTable[varid] || 0).toFixed(vtype.f)
      );
    case 3: // Time (Integer)
      return parseInt(this.varsTable[varid] || 0, 10);
    default: // String or undefined type
      return this.varsTable[varid];
  }
};

R9StudioStage.prototype.setVariTable = function (variables) {
  if (variables) this.variables = variables;
  this.varsTable = {};
  this.varsTypeTable = {};

  // Initialize default variables
  this.varsTable["R9_V_SCORE"] = 0;
  this.varsTypeTable["R9_V_SCORE"] = { t: 2, f: 2 }; // Float with 2 decimals
  this.varsTable["R9_V_TIME"] = new Date().getTime();
  this.varsTypeTable["R9_V_TIME"] = { t: 3 }; // Time as integer

  // Load custom variables
  for (var i in this.variables) {
    this.varsTable[this.variables[i].id] = this.variables[i].value;
    this.varsTypeTable[this.variables[i].id] = this.variables[i].types;
  }
};

R9StudioStage.prototype.clearCurPageForMainline = function () {
  this.layer().removeChildren();
  if (this.playbutton) this.layer().add(this.playbutton);
  if (this.restartbutton) this.layer().add(this.restartbutton);
  var player = this.lys().r9player;
  if (player && typeof player.getCurPage().pagecleanup === "function") {
    player.getCurPage().pagecleanup();
  }
  this.layer().draw();
};

R9StudioStage.prototype.queryCachedLoc = function (targetid, loc) {
  if (!this.obj2loc[targetid]) {
    this.obj2loc[targetid] = loc;
    return null;
  }
  var dif = {
    x: loc.x - this.obj2loc[targetid].x,
    y: loc.y - this.obj2loc[targetid].y,
  };
  this.obj2loc[targetid] = loc;
  return dif;
};

R9StudioStage.prototype.addNodeToLayer = function (node) {
  this.layer().add(node);
  this.lys().tmpnodes.push({ id: node.id });
};

R9StudioStage.prototype.reload = function () {
  this.bgAniJsHandler = null;
  this.r9gsummary.score = 0;
  this.r9gsummary.total = 0;
  this.r9gsummary.pos = 0;
  this.clearLayerStack(true);

  this.curtarget = null;
  this.animationFrameId = 0;
  this.flagset = [];
  this.score_report = [];
  this.acheivedwards = [];
  this.setVariTable(null);

  this.problemscores = {};
  this.mcpoptions = {};
};

R9StudioStage.prototype.changePscore = function (pid, score) {
  if (typeof this.problemscores[pid] === "undefined") {
    this.problemscores[pid] = 0;
  }
  this.problemscores[pid] += score;
};

R9StudioStage.prototype.pscoreCorrect = function (pid) {
  return this.problemscores[pid] === 0;
};

R9StudioStage.prototype.pscoreWrong = function (pid) {
  return !!this.problemscores[pid];
};

R9StudioStage.prototype.pscoreUnused = function (pid) {
  return typeof this.problemscores[pid] === "undefined";
};

R9StudioStage.prototype.getCacheImageByName = function (name) {
  var extensions = ["", ".png", ".jpg"];
  var img, i;

  for (i = 0; i < this.newimages.length; i++) {
    img = this.newimages[i];
    if (img.name === name) return img;
  }

  for (i = 0; i < extensions.length; i++) {
    for (img of this.newimages) {
      if (img.name + extensions[i] === name) return img;
      if (img.src.includes("/" + name + extensions[i])) return img;
      if (img.src.includes(name + extensions[i])) return img;
    }
  }

  return null;
};


R9StudioStage.prototype.update_score = function (result) {
  var found = null;

  // Find existing score entry for the concept
  for (var i = 0; i < this.score_report.length; i++) {
    if (this.score_report[i].conceptName === result.conceptName) {
      found = this.score_report[i];
      break;
    }
  }

  if (found) {
    // Update the found concept's total and score
    found.total += result.weight;
    found.score += result.score * result.weight;

    // Update or add aspects
    for (var i = 0; i < result.aspects.length; i++) {
      var resultAspect = result.aspects[i];
      var aspectFound = false;

      for (var j = 0; j < found.aspects.length; j++) {
        if (resultAspect.aspect === found.aspects[j].aspect) {
          aspectFound = true;
          found.aspects[j].total += resultAspect.value;
          found.aspects[j].value += resultAspect.value * result.score;
          break;
        }
      }

      if (!aspectFound) {
        // Add new aspect to the found concept
        var newAspect = Object.assign({}, resultAspect);
        newAspect.total = newAspect.value;
        newAspect.value = newAspect.value * result.score;
        found.aspects.push(newAspect);
      }
    }
  } else {
    // Add new concept with aspects
    var newResult = Object.assign({}, result);
    newResult.total = newResult.weight;

    for (var i = 0; i < newResult.aspects.length; i++) {
      newResult.aspects[i].total = newResult.aspects[i].value;
      newResult.aspects[i].value *= newResult.score;
    }

    this.score_report.push(newResult);
  }
};

R9StudioStage.prototype.score_by_concept = function (conceptName) {
  for (var i = 0; i < this.score_report.length; i++) {
    if (this.score_report[i].conceptName === conceptName) {
      var found = this.score_report[i];
      var mapped = found.aspects.map(function (aspect) {
        return {
          aspect: aspect.aspect,
          value: Math.ceil((aspect.value * 100) / aspect.total),
        };
      });
      return mapped;
    }
  }
  return null;
};

R9StudioStage.prototype.overallscore = function () {
  var total = 0,
    score = 0;

  this.score_report.forEach(function (found) {
    found.aspects.forEach(function (aspect) {
      score += aspect.value;
      total += aspect.total;
    });
  });

  var percentage = total === 0 ? 0 : Math.ceil((score * 100) / total);
  return { percentage: percentage, score: score, total: total };
};

R9StudioStage.prototype.onScoreReport = function (subject, edo, sd) {
  if (subject === "r9.core.study.score.report") {
    this.update_score(edo);
  }
};

R9StudioStage.prototype.ttssetup = function (
  page,
  pos,
  pageid,
  prefix,
  ttsStr,
  langCode,
  resumeAfterTTs,
  fromText,
  topicId,
  subtopic,
  callback,
  role,
  ttsNoBlkAni
) {
  var pauseAni = false;
  var ttsNoBlkAni2 = typeof ttsNoBlkAni === "undefined" ? false : ttsNoBlkAni;
  langCode = langCode || this._langCode_ || "zh"; // Default language code

  // Check if there is text to speak and TTS is enabled
  if (this.usetts && this.inSpeakerMode && ttsStr.trim().length > 0) {
    // Replace user-specific text if required
    if (this.r9userprofile.name && this.r9userprofile.tname) {
      var reg = new RegExp(this.r9userprofile.tname, "g");
      ttsStr = ttsStr.replace(reg, this.r9userprofile.name);
    }

    this._langCode_ = langCode; // Update language code for TTS
    pauseAni = resumeAfterTTs; // Determine if animation should be paused

    // Handling different TTS scenarios based on platform and settings
    if (this.FOR_IPAD_AS4) {
      ipad_as4_speak(
        page,
        pos,
        prefix,
        ttsStr,
        pauseAni,
        topicId,
        subtopic,
        callback,
        ttsNoBlkAni2
      );
    } else if (this.baiduTTS) {
      this.handleBaiduTTS(
        page,
        pos,
        prefix,
        ttsStr,
        pauseAni,
        topicId,
        subtopic,
        callback,
        role,
        ttsNoBlkAni2
      );
    } else {
      this.handleDefaultTTS(
        page,
        pos,
        prefix,
        ttsStr,
        pauseAni,
        topicId,
        subtopic,
        callback,
        ttsNoBlkAni2
      );
    }

    // Pause animation if needed
    if (pauseAni) {
      this.PageBus.publish("r9.core.animation.stop", {
        messageid: -1,
        prefix: this.prefix,
      });
    }
  }

  return pauseAni;
};

// Helper method to handle Baidu TTS logic
R9StudioStage.prototype.handleBaiduTTS = function (
  page,
  pos,
  prefix,
  ttsStr,
  pauseAni,
  topicId,
  subtopic,
  callback,
  role,
  ttsNoBlkAni2
) {
  var speed = this.ttsspeed;
  if (navigator.onLine && !this.baiduerror) {
    try {
      onBaiduTTS(
        page,
        pos,
        prefix,
        ttsStr,
        this._langCode_,
        pauseAni,
        speed,
        topicId,
        subtopic,
        callback,
        role,
        ttsNoBlkAni2
      );
    } catch (err) {
      this.handleDefaultTTS(
        page,
        pos,
        prefix,
        ttsStr,
        pauseAni,
        topicId,
        subtopic,
        callback,
        ttsNoBlkAni2
      );
    }
  } else {
    this.handleDefaultTTS(
      page,
      pos,
      prefix,
      ttsStr,
      pauseAni,
      topicId,
      subtopic,
      callback,
      ttsNoBlkAni2
    );
  }
};

// Helper method to handle the default TTS logic
R9StudioStage.prototype.handleDefaultTTS = function (
  page,
  pos,
  prefix,
  ttsStr,
  pauseAni,
  topicId,
  subtopic,
  callback,
  ttsNoBlkAni2
) {
  startSpeakInPage(page);
  speakText(
    pos,
    page,
    prefix,
    ttsStr,
    this._langCode_,
    pauseAni,
    isipad ? 1.1 : 0,
    topicId,
    subtopic,
    callback,
    ttsNoBlkAni2
  );
};

R9StudioStage.prototype.markr9times = function () {
  this.r9timestamp = new Date().getTime();
};

R9StudioStage.prototype.getTopLayerSetting = function () {
  return this.layerstack.length === 0
    ? this.layersetting
    : this.layerstack[this.layerstack.length - 1];
};

R9StudioStage.prototype.layer = function () {
  return this.getTopLayerSetting().layer;
};

R9StudioStage.prototype.redrawTopLayer = function () {
  this.layer().draw();
};

R9StudioStage.prototype.pushNewLayer = function (
  name,
  layer,
  resumeAnimation,
  autoClose
) {
  this.layerstack.push(
    new LayerSetting(name, layer, resumeAnimation, autoClose)
  );
};

R9StudioStage.prototype.topLayerPos = function () {
  var l = this.layer();
  return { x: l.x(), y: l.y() };
};

R9StudioStage.prototype.getCurPage = function () {
  return this.getTopLayerSetting().r9player.getCurPage();
};

R9StudioStage.prototype.getCurPlayer = function () {
  return this.getTopLayerSetting().r9player;
};

R9StudioStage.prototype.getPlayerByName = function (name) {
  return this.lys(name).r9player;
};

R9StudioStage.prototype.getLayerPos = function (name) {
  if (!name) return 0;
  for (var i = 0; i < this.layerstack.length; i++) {
    if (this.layerstack[i].name === name) return i;
  }
  return 0;
};

R9StudioStage.prototype.lys = function (name) {
  return name ? this.layerstack[this.getLayerPos(name)] : this.layersetting;
};

R9StudioStage.prototype.removeOverlapLayer = function (name) {
  var curLayerPos = name ? this.getLayerPos(name) : 0;
  if (curLayerPos <= 0 || curLayerPos === this.layerstack.length - 1) return;

  while (curLayerPos < this.layerstack.length - 1) {
    var l = this.layerstack.pop();
    if (l) {
      this.finishLayer(l);
    }
  }
};

R9StudioStage.prototype.clearLayerStack = function (all) {
  var btm = all ? 0 : 1;
  while (this.layerstack.length > btm) {
    var l = this.layerstack.pop();
    if (l) {
      this.finishLayer(l);
    }
  }
};

R9StudioStage.prototype.finishLayerByName = function (name) {
  var layercomp = this.lys(name);
  this.finishLayer(layercomp);
};

R9StudioStage.prototype.finishLayer = function (layercomp) {
  var pos = this.layerstack.indexOf(layercomp);
  if (pos >= 0) this.layerstack.splice(pos, 1);

  if (typeof layercomp.layerExitCode === "function") {
    layercomp.layerExitCode(layercomp);
  } else {
    layercomp.destroy();
    if (layercomp.ra) this.getCurPlayer().resume();
    this.PageBus.publish("r9.core.animation.resume", {
      prefix: this.prefix,
      messageid: -1,
      pos: -1,
    });
  }
};

R9StudioStage.prototype.getBackgroundNode = function () {
  var laysetting = this.getTopLayerSetting(),
    i2f = laysetting.i2f,
    size = laysetting.size;

  if (!i2f["_bgrect_"]) {
    i2f["_bgrect_"] = new Kinetic.Rect({
      fillRed: 0,
      fillGreen: 0,
      fillAlpha: 1.0,
      fillBlue: 0,
      draggable: false,
      width: size ? size.width : this.width,
      height: size ? size.height : this.height,
      x: size ? size.x : 0,
      y: size ? size.y : 0,
    });

    laysetting.layer.add(i2f["_bgrect_"]);
    i2f["_bgrect_"].moveToBottom();
  }
  return i2f["_bgrect_"];
};

R9StudioStage.prototype.shiftBackgroundNode = function (x, y, duration) {
  var that = this,
    layer = that.getTopLayerSetting().layer,
    isFullscreen =
      that.width === layer.width() && that.height === layer.height();

  if (isFullscreen) {
    var _bgrect_ = that.getBackgroundNode(),
      layer_x = layer.x(),
      layer_y = layer.y(),
      bx = _bgrect_.x(),
      by = _bgrect_.y();

    _bgrect_.x(-Math.abs(x));
    _bgrect_.y(-Math.abs(y));

    var adj_x =
      x * layer_x < 0
        ? Math.abs(x) + Math.abs(bx)
        : Math.max(Math.abs(x), Math.abs(bx));
    var adj_y =
      y * layer_y < 0
        ? Math.abs(y) + Math.abs(by)
        : Math.max(Math.abs(y), Math.abs(by));

    _bgrect_.width(adj_x + layer.width());
    _bgrect_.height(adj_y + layer.height());
  }

  new Kinetic.Tween({
    node: that.getTopLayerSetting().layer,
    x: x,
    y: y,
    duration: duration,
  }).play();
};

R9StudioStage.prototype.showMessageNode = function (
  dnclayer,
  messageid,
  message,
  anode,
  duration,
  resumeAnimation,
  jumpTimeline,
  noTTS,
  langCode,
  pos,
  pageid,
  prefix,
  topicId,
  subtopic
) {
  dnclayer.add(anode);
  anode.opacity(0);

  if (typeof pos === "undefined") pos = -1;
  if (!prefix) prefix = "";

  var page = this.getCurPage();
  page.mdstarted = true;
  var _this = this;

  new Kinetic.Tween({
    node: anode,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 0.5,
    onFinish: function () {
      if (noTTS || message === "#") {
        // Handle placeholder for math
        new Kinetic.Tween({
          node: anode,
          opacity: 1,
          duration: duration,
          onFinish: function () {
            new Kinetic.Tween({
              node: anode,
              opacity: 0.2,
              duration: 0.5,
              onFinish: function () {
                anode.remove();
                if (resumeAnimation)
                  _this.PageBus.publish("r9.core.animation.resume", {
                    prefix: prefix,
                    messageid: -1,
                    pos: pos,
                  });
                if (jumpTimeline)
                  _this.PageBus.publish("r9.core.animation.timeline", {
                    prefix: prefix,
                    timeline: jumpTimeline,
                  });
              },
            }).play();
          },
        }).play();
      } else {
        // Handle TTS case
        _this.ttssetup(
          page,
          pos,
          pageid,
          prefix,
          _r9norm(message),
          langCode,
          resumeAnimation,
          true,
          topicId,
          subtopic,
          function () {
            var tween = new Kinetic.Tween({
              node: anode,
              opacity: 0.6,
              easing: Kinetic.Easings["Linear"],
              duration: 0.6,
              onFinish: function () {
                anode.remove();
                if (resumeAnimation)
                  _this.PageBus.publish("r9.core.animation.resume", {
                    prefix: prefix,
                    messageid: -1,
                    pos: pos,
                  });
                if (jumpTimeline)
                  _this.PageBus.publish("r9.core.animation.timeline", {
                    prefix: prefix,
                    timeline: jumpTimeline,
                  });
              },
            });
            tween.play();
          },
          "",
          true
        );
      }
    },
  }).play();

  this.PageBus.publish("r9.core.event.studyEvent", {
    targetId: messageid,
    eventType: "ShowMessage",
    prefix: this.prefix,
  });
};

R9StudioStage.prototype.showMessageBorder = function (
  dnclayer,
  messageid,
  otext,
  textstyle,
  math,
  strokeColor,
  scr,
  scg,
  scb,
  bgr,
  bgg,
  bgb,
  fontSize,
  width,
  height,
  posX,
  xoff,
  posY,
  yoff,
  duration,
  resumeAnimation,
  langCode,
  pos,
  pageid,
  prefix,
  topicId,
  subtopicId,
  borderType,
  noTTS,
  jumpTimeline
) {
  if (typeof borderType === "undefined") borderType = "Cloud";

  var anode = new Kinetic.R9Text(
    r9figure({
      width: width,
      height: height,
      r9textstyle: textstyle,
      otext: otext,
      text: otext,
      math: math,
      x: posX,
      y: posY,
      fontSize: fontSize || 18,
      borderColorStr: strokeColor,
      borderType: borderType,
      strokeWidth: 1,
      corner: 4,
      shadowOffsetX: 0.5,
      shadowOffsetY: 0.5,
      textXOffset: xoff,
      scaleX: 0.1,
      scaleY: 0.1,
      textYOffset: yoff,
      fr: bgr,
      fg: bgg,
      fb: bgb,
      sr: scr,
      sg: scg,
      sb: scb,
      fillOpacity: 1,
      useBackground: 1,
      borderWidth: 1,
    })
  );

  this.showMessageNode(
    dnclayer,
    messageid,
    otext,
    anode,
    duration,
    resumeAnimation,
    jumpTimeline,
    noTTS,
    langCode,
    pos,
    pageid,
    prefix,
    topicId,
    subtopicId
  );
};

R9StudioStage.prototype.showMessageBorder2 = function (
  dnclayer,
  messageid,
  otext,
  textstyle,
  math,
  stageWidth,
  stageHeight,
  posX,
  posY,
  borderType,
  duration,
  resumeAnimation,
  langCode,
  rate,
  fontSize,
  pos,
  pageid,
  prefix,
  topicId,
  subtopicId
) {
  if (typeof borderType === "undefined") borderType = "Cloud";

  var anode = new Kinetic.R9Text(
    r9figure({
      width: 100,
      height: 50,
      r9textstyle: textstyle,
      otext: otext,
      text: otext,
      math: math,
      x: posX || 0,
      y: posY || 0,
      fontSize: fontSize || 18,
      borderColorStr: "rgba(1, 1,1, 0.9)",
      borderType: borderType,
      strokeWidth: 1,
      corner: 4,
      shadowOffsetX: 0.5,
      shadowOffsetY: 0.5,
      textXOffset: 10,
      scaleX: 0.1,
      scaleY: 0.1,
      textYOffset: 5,
      fr: 255,
      fg: 255,
      fb: 255,
      sr: 1,
      sg: 1,
      sb: 1,
      fillOpacity: 1,
      useBackground: 1,
      borderWidth: 1,
    })
  );

  anode.resetOffset(30, 15);
  if (!posX) anode.x((stageWidth - anode.width()) / 2);
  if (!posY) anode.y((stageHeight - anode.height()) / 2);

  this.showMessageNode(
    dnclayer,
    messageid,
    otext,
    anode,
    duration,
    resumeAnimation,
    "",
    false,
    langCode,
    pos,
    pageid,
    prefix,
    topicId,
    subtopicId
  );
};

R9StudioStage.prototype.showMessage = function (
  dnclayer,
  messageid,
  message,
  stagewidth,
  stageheight,
  duration,
  resumeAnimation,
  langCode,
  rate,
  pos,
  pageid,
  prefix,
  topicId,
  subtopicId
) {
  this.showMessageBorder2(
    dnclayer,
    messageid,
    message,
    null,
    null,
    stagewidth,
    stageheight,
    0,
    0,
    "Cloud",
    duration,
    resumeAnimation,
    langCode,
    rate,
    20,
    pos,
    pageid,
    prefix,
    topicId,
    subtopicId
  );
};


//R9StudioStage.prototype.showColorMessage = function (dnclayer, messageid, message, stagewidth, stageheight, duration, resumeAnimation, langCode, rate, fontColor, bgColor,
//    pos, pageid, prefix, topicId) {
//    if (!prefix) prefix = ""; stagewidth = stagewidth || this.width; stageheight = stageheight || this.height;
//    this.PageBus.publish('r9.core.event.studyEvent', { 'targetId': messageid, 'eventType': 'ShowMessage', 'prefix': this.prefix });
//    var messagedialog = new Kinetic.Label({
//        x: stagewidth / 2,
//        y: stageheight / 2,
//        opacity: 1
//    });
//
//    messagedialog.add(new Kinetic.Tag({
//        fill: bgColor,
//        pointerDirection: 'down',
//        pointerWidth: 10,
//        pointerHeight: 10,
//        lineJoin: 'round',
//        shadowColor: 'white',
//        shadowBlur: 1,
//        shadowOffset: { x: 1, y: 1 },
//        shadowOpacity: 0.5
//    }));
//
//    messagedialog.add(new Kinetic.Text({
//        text: _r9norm(message),
//        fontFamily: 'Calibri',
//        fontSize: 22,
//        padding: 5,
//        fill: fontColor
//    }));
//
//
//    dnclayer.add(messagedialog);
//    dnclayer.draw();
//
//    if (typeof pos === "undefined") { pos = -1; }
//    var page = this.getcurpage(); page.mdstarted = true;
//    this.ttssetup(page, pos, pageid, prefix, _r9norm(message),
//        langCode, resumeAnimation, true, topicId, function () {
//            var tween = new Kinetic.Tween({
//                node: messagedialog,
//                opacity: 0.6,
//                easing: Kinetic.Easings['Linear'],
//                duration: duration,
//                onFinish: function () {
//                    messagedialog.remove();
//                }
//            });
//            tween.play();
//
//        }, '', true);
//};
R9StudioStage.prototype.showDialog = function (
  dnclayer,
  messageid,
  title,
  message1,
  message2,
  message3,
  follow,
  stagewidth,
  stageheight,
  duration,
  resumeAnimation,
  langCode,
  rate
) {
  this.PageBus.publish("r9.core.animation.stop", {
    messageid: messageid,
    prefix: this.prefix,
  });

  var fontsize = stagewidth > 500 ? 18 : 15;
  var that = this;
  var dialog = new Kinetic.R9Dialog({
    x: stagewidth / 2,
    y: stageheight / 2,
    opacity: 1,
    title: title,
    message1: message1,
    message2: message2,
    message3: message3,
    fontSize: fontsize,
  });

  dialog.on("tap click", function () {
    dialog.remove();

    if (follow) {
      that.showMessageBorder2(
        dnclayer,
        messageid,
        follow,
        [],
        stagewidth,
        stageheight,
        0,
        0,
        "Cloud",
        duration,
        resumeAnimation,
        langCode,
        rate
      );
    } else if (resumeAnimation) {
      that.PageBus.publish("r9.core.animation.resume", {
        messageid: messageid,
        prefix: that.prefix, // Fixed typo here
      });
    }
  });

  dnclayer.add(dialog);

  var tween = new Kinetic.Tween({
    node: dialog,
    opacity: 1,
    easing: Kinetic.Easings["Linear"],
    duration: duration,
    onFinish: function () {},
  });
  tween.play();
};

R9StudioStage.prototype.showOptionsDialog = function (
  dnclayer,
  messageid,
  nodeList,
  strokeColor,
  scr,
  scg,
  scb,
  bgr,
  bgg,
  bgb,
  fontSize,
  w,
  h,
  resumeAnimation,
  langCode,
  pos,
  pageid,
  prefix,
  topicId,
  subtopic,
  noTTS
) {
  var nodes = [];
  if (!prefix) prefix = "";
  var page = this.getCurPage();
  page.mdstarted = true;
  var _this = this;

  var bgrect = new Kinetic.R9Rect(
    r9figure({
      width: w + 40,
      height: h + 40,
      x: nodeList[0].x - 20,
      y: nodeList[0].y - 20,
      corner: 10,
      fillAlpha: 0.6,
      fill: "gray",
    })
  );

  dnclayer.add(bgrect);
  bgrect.opacity(0);
  nodes.push(bgrect);

  nodeList.forEach(function (n) {
    var anode = new Kinetic.R9Text(
      r9figure({
        width: n.w,
        height: n.h,
        r9textstyle: n.style,
        otext: n.otext,
        x: n.x,
        y: n.y,
        fontSize: n.fs || 18,
        strokeWidth: 1,
        corner: 2,
        textXOffset: n.xoff,
        scaleX: 0.1,
        scaleY: 0.1,
        textYOffset: n.yoff,
        fr: bgr,
        fg: bgg,
        fb: bgb,
        sr: scr,
        sg: scg,
        sb: scb,
        strokeAlpha: 1,
        fillAlpha: 1,
        useBackground: 1,
      })
    );

    anode.on("click tap", function () {
      nodes.forEach(function (node) {
        new Kinetic.Tween({
          node: node,
          opacity: 0.3,
          duration: 0.5,
          onFinish: function () {
            node.remove();
          },
        }).play();
      });

      if (n.follow) {
        _this.showMessage(
          dnclayer,
          messageid,
          n.follow,
          0,
          0,
          2,
          resumeAnimation,
          langCode,
          "",
          pos,
          prefix,
          topicId,
          subtopic
        );
      }

      if (typeof n.hotpage === "function") n.hotpage();

      if (n.concept) {
        _this.PageBus.publish("r9.core.study.score.report", n.concept);
      }

      if (n.timeline) {
        _this.PageBus.publish("r9.core.animation.timeline", {
          timeline: n.timeline,
        });
      }
    });

    dnclayer.add(anode);
    anode.opacity(0);
    nodes.push(anode);
  });

  nodes.forEach(function (node, index) {
    new Kinetic.Tween({
      node: node,
      opacity: index === 0 ? 0.6 : 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      onFinish: function () {
        if (index === 4 && !noTTS) {
          _this.ttssetup(
            page,
            pos,
            pageid,
            prefix,
            _r9norm(nodeList[1].otext),
            langCode,
            false,
            true,
            topicId,
            subtopic,
            function () {},
            "",
            true
          );
        }
      },
    }).play();
  });
};
