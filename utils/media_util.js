var PIXEL_RATIO = (function () {
  var ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
  return dpr / bsr;
})();

var openExtraR9Browser = function (url) {
  if (typeof r9baseurl !== "undefined" && url.slice(0, 4) != "http") {
    url = r9baseurl + "/" + url;
  }
  window.open(
    url,
    "mywin",
    "left=20,top=20,width=500,height=500,toolbar=1,resizable=1,scrollbars=1"
  );
};

var speakText_notts = function (
  pos,
  pageid,
  prefix,
  text,
  langCode,
  resumeAfterTTs,
  rate,
  topicId,
  subtopic,
  callback,
  ttsNoBlkAni
) {
  var extime = 0;
  if (langCode == "zh" || langCode == "zh_CN") {
    extime = text.replace(/\s*/g, "").length * 0.2174 * 1000;
  } else {
    extime = text.split(/[\s,.]+/).length * 0.4162 * 1000;
  }
  if (extime < 1000) extime = 1000;

  function _nottswait(cdown) {
    if (cdown < 0) {
      if (resumeAfterTTs) {
        r9.PageBus.publish("r9.core.animation.resume", {
          prefix: prefix,
          messageid: -1,
          pos: pos,
        });
      }
      if (topicId) {
        r9.PageBus.publish("r9.core.event.broadcast", {
          prefix: prefix,
          pageid: pageid,
          pos: pos,
          topic: topicId,
          subtopic: subtopic,
        });
      }
      if (callback) callback();
      endSpeakInPage();
      return;
    }
    if (!ttsNoBlkAni) {
      r9.markr9times();
    }
    window.setTimeout(function () {
      _nottswait(cdown - 500);
    }, 500);
  }
  _nottswait(extime);
};

var speakText = function (
  pos,
  page,
  prefix,
  text,
  langCode,
  resumeAfterTTs,
  rate,
  topicId,
  subtopic,
  callback,
  ttsNoBlkAni
) {
  ttsNoBlkAni = ttsNoBlkAni || false;
  var usetts = "speechSynthesis" in window;
  var isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

  if (usetts) {
    var syn = window.speechSynthesis;
    syn.cancel();

    langCode = langCode == "zh" || langCode == "zh_CN" ? "zh-CN" : langCode;

    if (isChrome && langCode != "zh-CN") {
      usetts = false;
      speakText_notts(
        pos,
        page.pageid,
        prefix,
        text,
        langCode,
        resumeAfterTTs,
        rate,
        topicId,
        subtopic,
        callback,
        ttsNoBlkAni
      );
      return;
    }

    page.ssu = new SpeechSynthesisUtterance(text);
    page.ssu.lang = langCode;
    if (rate) {
      page.ssu.rate = rate;
    }
    page.ssu.onerror = function () {
      usetts = false;
      speakText_notts(
        pos,
        page.pageid,
        prefix,
        text,
        langCode,
        resumeAfterTTs,
        rate,
        topicId,
        subtopic,
        callback,
        ttsNoBlkAni
      );
    };
    page.ssu.onend = function () {
      usetts = false;
      if (resumeAfterTTs) {
        r9.PageBus.publish("r9.core.animation.resume", {
          prefix: prefix,
          messageid: -1,
          pos: pos,
        });
      }
      if (topicId) {
        r9.PageBus.publish("r9.core.event.broadcast", {
          prefix: prefix,
          pageid: page.pageid,
          pos: pos,
          topic: topicId,
          subtopic: subtopic,
        });
      }
      if (callback) callback();
      endSpeakInPage();
    };
    syn.speak(page.ssu);

    function _wait() {
      if (!usetts) return;
      if (!syn.speaking || syn.paused || syn.pending) {
        return;
      }
      if (!ttsNoBlkAni) {
        r9.markr9times();
      }
      window.setTimeout(_wait, 500);
    }
    _wait();
  } else {
    speakText_notts(
      pos,
      page.pageid,
      prefix,
      text,
      langCode,
      resumeAfterTTs,
      rate,
      topicId,
      subtopic,
      callback,
      ttsNoBlkAni
    );
  }
};

var startSpeakInPage = function (page, silent) {
  if (page) {
    page.mdstarted = true;
  }
  if (!silent) r9.PageBus.publish("r9.core.action.speak", { speak: true });
};

var endSpeakInPage = function () {
  r9.PageBus.publish("r9.core.action.speak", { speak: false });
};

var getCacheR9AudioFile = function (audiofilename) {
  if (window.HTMLAudioElement) {
    try {
      var oAudio = document.getElementById("r9audioplayer");
      if (oAudio && oAudio.src == audiofilename) {
        return oAudio;
      }
      var oAudio1 = document.getElementById("r9audioplayer1");
      if (oAudio1 && oAudio1.src == audiofilename) {
        return oAudio1;
      }
    } catch (e) {
      r9_log_console(e);
    }
    return null;
  }
};

var cachedR9AudioFile = null;

var cacheR9AudioFile = function (audiofilename) {
  if (!navigator.onLine || r9.baiduerror) {
    return;
  }
  if (window.HTMLAudioElement) {
    try {
      var oAudio = document.getElementById("r9audioplayer");
      var oAudio1 = document.getElementById("r9audioplayer1");
      if (
        oAudio &&
        oAudio.paused &&
        (oAudio1 == cachedR9AudioFile || cachedR9AudioFile == null)
      ) {
        oAudio.src = audiofilename;
        oAudio.load();
        cachedR9AudioFile = oAudio;
        return;
      }
      if (
        oAudio1 &&
        oAudio1.paused &&
        (cachedR9AudioFile == null || cachedR9AudioFile == oAudio)
      ) {
        oAudio1.src = audiofilename;
        oAudio1.load();
        cachedR9AudioFile = oAudio1;
        return;
      }
    } catch (e) {
      r9_log_console(e);
    }
  }
};

var playR9AudioFile = function (audiofilename, blockanimation, page) {
  if (window.HTMLAudioElement) {
    try {
      r9.r9rqstRter.addRqst();
      var oAudio = document.getElementById("r9audioplayer");
      var oAudio1 = document.getElementById("r9audioplayer1");

      if (
        oAudio &&
        (oAudio.paused || oAudio.ended || oAudio.error) &&
        oAudio.src == audiofilename
      ) {
        playR9AudioFile2(oAudio, blockanimation, page);
      } else if (
        oAudio1 &&
        (oAudio1.paused || oAudio1.ended || oAudio1.error) &&
        oAudio1.src == audiofilename
      ) {
        playR9AudioFile2(oAudio1, blockanimation, page);
      } else if (oAudio.paused || oAudio.ended || oAudio.error) {
        oAudio.src = audiofilename;
        playR9AudioFile2(oAudio, blockanimation, page);
      } else if (
        oAudio1 &&
        (oAudio1.paused || oAudio1.ended || oAudio1.error)
      ) {
        oAudio1.src = audiofilename;
        playR9AudioFile2(oAudio1, blockanimation, page);
      } else {
        oAudio.pause();
        oAudio.src = audiofilename;
        playR9AudioFile2(oAudio, blockanimation, page);
      }
    } catch (e) {
      r9_log_console(e);
      r9.r9rqstRter.removeRqst();
      startSpeakInPage(page);
    }
  } else {
    startSpeakInPage(page);
  }
};

var playR9AudioFile2 = function (oAudio, blockanimation, page) {
  try {
    var firstTime = true;

    function _wait() {
      if (oAudio.played) {
        if (firstTime) {
          firstTime = false;
          r9.r9rqstRter.removeRqst();
          startSpeakInPage(page);
        }
      }
      if (oAudio.paused || oAudio.error || oAudio.ended) {
        endSpeakInPage();
        return;
      }
      if (blockanimation) {
        r9.markr9times();
      }
      window.setTimeout(_wait, 500);
    }

    var playPromise = oAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(
        function () {
          _wait();
        },
        function () {
          startSpeakInPage(page, true);
        }
      );
    } else {
      _wait();
    }
  } catch (e) {
    r9_log_console(e);
    r9.r9rqstRter.removeRqst();
    startSpeakInPage(page);
  }
};

var exitVideoPaneIOS = function () {
  var elements = document.getElementsByClassName("video_container_class");
  for (var j = elements.length - 1; j >= 0; j--) {
    var current = elements[j];
    if (current.style.setProperty) {
      current.style.setProperty("top", "2048px", null);
    } else {
      current.style.setAttribute("top", "2048px");
    }
  }

  elements = document.getElementsByTagName("video");
  for (var j = elements.length - 1; j >= 0; j--) {
    elements[j].pause();
  }

  var node = document.getElementById("video_overlay_container");
  if (node.style.setProperty) {
    node.style.setProperty("display", "none", null);
  } else {
    node.style.setAttribute("display", "none");
  }
};

var createVideoPaneIOS = function (videoContainerId, sourceUrl) {
  var node = document.getElementById(videoContainerId);
  if (node.style.setProperty) {
    node.style.setProperty("top", "50%", null);
  } else {
    node.style.setAttribute("top", "50%");
  }

  node = document.getElementById("video_overlay_container");
  if (node.style.removeProperty) {
    node.style.removeProperty("display");
  } else {
    node.style.removeAttribute("display");
  }
};

var exitVideoPane = function () {
  var node = document.getElementById("video_container");
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
  if (node.style.setProperty) {
    node.style.setProperty("display", "none", null);
  } else {
    node.style.setAttribute("display", "none");
  }

  node = document.getElementById("video_overlay_container");
  if (node.style.setProperty) {
    node.style.setProperty("display", "none", null);
  } else {
    node.style.setAttribute("display", "none");
  }
};

var createVideoPane = function (sourceUrl) {
  var node = document.getElementById("video_container");

  if (node.style.removeProperty) {
    node.style.removeProperty("display");
  } else {
    node.style.removeAttribute("display");
  }

  var videoEle = document.createElement("VIDEO");
  videoEle.setAttribute("preload", "preload");
  videoEle.setAttribute("controls", "controls");
  videoEle.setAttribute("src", sourceUrl);
  node.appendChild(videoEle);

  node = document.getElementById("video_overlay_container");
  if (node.style.removeProperty) {
    node.style.removeProperty("display");
  } else {
    node.style.removeAttribute("display");
  }
};

var convertCanvasToImage = function (canvas) {
  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
};
