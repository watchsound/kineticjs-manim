var R9PageChainPlayer = function (prefix, layer) {
  var Player = this;
  this.prefix = prefix || "";
  this.chain = [];
  this.currentStep = 0;
  this.isRunning = false;
  this.inForceResume = false;
  this.inSetup = false;
  this.r9pplan = [];
  this.state = "";

  // Check the animation plan
  this.checkAnimationPlan = function () {
    if (!Player.r9pplan || Player.r9pplan.length === 0) return false;
    try {
      var aplan = Player.r9pplan[0];
      if (aplan.end >= 0 && aplan.end <= Player.currentStep) {
        var jumploc = r9parseBookmark(aplan.jumpFrom, true);
        var jumpTimeline = r9parseBookmark(aplan.jumpFrom, false);
        var page = Player.getCurPage();
        if (jumploc > 0 || Player.r9pplan.length > 1) {
          if (typeof page.pageend === "function") {
            page.pageend();
          }
          if (typeof page.pagecleanup === "function") {
            try {
              page.pagecleanup();
            } catch (e) {
              r9_log_console(e);
            }
          }
          if (jumploc > 0) {
            // Not in mistake review
            r9.PageBus.publish("r9.core.animation.hotphase", {
              hotphase_pos: jumploc,
              timeline_name: jumpTimeline,
              pplan: [],
              destory_it: true,
            });
            return true;
          } else {
            Player.r9pplan.splice(0, 1);
            if (jumpTimeline === Player.prefix) {
              Player.initialStartFrom(Player.r9pplan[0].start);
            } else {
              r9.PageBus.publish("r9.core.animation.hotphase", {
                hotphase_pos: 0,
                pplan: Player.r9pplan,
                destory_it: true,
              });
            }
            return true;
          }
        }
      }
    } catch (e) {
      r9_log_console(e);
    }
    return false;
  };

  // Determine if the timeline is the main timeline
  this.isMainTimeline = function () {
    return prefix == null || prefix.length === 0;
  };

  // Cleanup the current page
  this.cleanupCurrentPage = function () {
    try {
      r9.removeOverlapLayer(prefix);
    } catch (e) {
      r9_log_console(e);
    }
    var clayer = r9.lys(prefix),
      tnodes = clayer.tmpnodes;
    if (clayer.ptimer) {
      clayer.ptimer.destroy();
    }
    if (tnodes.length > 0) {
      for (var i in tnodes) {
        if (tnodes.hasOwnProperty(i)) {
          var node = clayer.i2f[tnodes[i].oid];
          if (node) {
            r9twnrm(node, 1, tnodes[i].exittype || 0);
          }
        }
      }
      clayer.tmpnodes = [];
      clayer.gnrtrids = {};
    }
    if (typeof window._dismissr9keyboard === "function") {
      _dismissr9keyboard();
    }
    r9.r9rqstRter.reset();
  };

  // Get the current page
  this.getCurPage = function () {
    return this.chain[this.currentStep].page;
  };

  // Reset the player
  this.reset = function () {
    Player.stop();
    Player.currentStep = 0;
    Player.start();
  };

  // Start the player
  this.start = function () {
    if (Player.chain.length === 0 || Player.isRunning) return;
    Player.isRunning = true;
    Player.startCurrentPage();
  };

  // Proceed to the next step
  this.nextStep = function () {
    this.state = "next";
    if (!this.isRunning) return;
    this.cleanupCurrentPage();
    if (this.checkAnimationPlan()) return;
    Player.currentStep++;
    if (Player.currentStep >= Player.chain.length) {
      Player.currentStep = Player.chain.length - 1;
      r9.PageBus.publish("r9.core.animation.finish", {
        targetId: "curFrameIndex_" + Player.currentStep,
        prefix: prefix,
      });
      Player.stop();
    } else {
      Player.startCurrentPage();
      r9.PageBus.publish(prefix + "r9.core.event.studyEvent", {
        targetId: "curFrameIndex_" + Player.currentStep,
        eventType: "OnNewFrame",
      });
    }
    if (Player.currentStep + 1 >= Player.chain.length) {
      r9.PageBus.publish(prefix + "r9.core.event.studyEvent", {
        targetId: "curFrameIndex_" + Player.currentStep,
        eventType: "FinishedLastFrame",
        prefix: Player.prefix,
      });
    }
  };

  // Resume the player
  this.resume = function (pos) {
    if (Player.chain.length === 0 || Player.isRunning) return;
    Player.isRunning = true;
    var page = this.getCurPage();
    if (this.inSetup) {
      page.ptimer.paused = false;
      return;
    }
    if (this.state === "start") this.leavingPage();
    else if (this.state === "leaving" || this.state === "next") this.nextStep();
    this.state = "";
  };

  // Start the current page
  this.startCurrentPage = function () {
    this.state = "start";
    if (!this.isRunning) return;
    this.inSetup = false;
    var page = Player.chain[Player.currentStep].page;
    var clayer = r9.lys(prefix);

    if (clayer.ptimer) {
      clayer.ptimer.destroy();
    }
    clayer.ptimer = page.ptimer;
    page.ptimer.validatePins();
    if (typeof page.pageenter === "function") {
      try {
        page.pageenter(this);
      } catch (e) {
        r9_log_console(e);
        this.setupPage();
      }
    } else {
      this.setupPage();
    }
  };

  // Setup the page
  this.setupPage = function () {
    if (!this.isRunning) return;
    var page = this.getCurPage();
    try {
      page.pagesetup(this);
      page.ptimer.schedule();
    } catch (e) {
      r9_log_console(e);
    }
  };

  // Leaving the page
  this.leavingPage = function () {
    this.state = "leaving";
    if (!this.isRunning) return;
    var page = this.getCurPage();
    if (typeof page.pageend === "function") {
      try {
        page.pageend();
      } catch (e) {
        r9_log_console(e);
      }
    }
    if (typeof page.pagecleanup === "function") {
      try {
        page.pagecleanup();
      } catch (e) {
        r9_log_console(e);
      }
    }
    if (typeof page.stageexit === "function") {
      try {
        page.stageexit(this);
      } catch (e) {
        r9_log_console(e);
        this.nextStep();
      }
    } else {
      this.nextStep();
    }
  };

  // Stop the player
  this.stop = function () {
    Player.isRunning = false;
    if (this.inSetup) {
      var page = this.getCurPage();
      page.ptimer.paused = true;
    }
  };

  // Add a page to the chain
  this.add = function (_page, _staytime, _transtime) {
    _page.r9player = this;
    _page.staytimeInSec = _staytime;
    Player.chain[Player.chain.length] = {
      page: _page,
      transtimeInSec: _transtime,
      staytimeInSec: _staytime,
    };
  };

  // Destroy the player
  this.distroy = function () {
    this.stop();
    Player.chain = [];
  };

  // Restart from a specific phase position
  this.restartFrom = function (_page, phasePosition) {
    _page.r9player = this;
    if (Player.chain[phasePosition]) {
      _page.staytimeInSec = Player.chain[phasePosition].staytimeInSec;
      Player.chain[phasePosition] = {
        page: _page,
        transtimeInSec: Player.chain[phasePosition].transtimeInSec,
        staytimeInSec: Player.chain[phasePosition].staytimeInSec,
      };
    } else {
      _page.staytimeInSec = 1;
      Player.chain[phasePosition] = {
        page: _page,
        transtimeInSec: 1,
        staytimeInSec: 1,
      };
    }
    this.initialStartFrom(phasePosition);
  };

  // Start from an initial phase position
  this.initialStartFrom = function (phasePosition) {
    this.stop();
    Player.state = "";
    Player.isRunning = true;
    Player.currentStep = phasePosition;
    Player.startCurrentPage();
  };

  // Setup the animation plan
  this.setupPlan = function (rplan) {
    this.r9pplan = rplan;
  };
};
