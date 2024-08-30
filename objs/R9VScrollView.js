(function () {
  Kinetic.R9VScrollView = function (config) {
    this.___init(config);
  };

  Kinetic.R9VScrollView.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9VScrollView";
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);

      this._setupEventHandlers();
    },

    _setupEventHandlers: function () {
      this.on("mousedown touchstart", this._onStart.bind(this));
      this.on("mouseup touchend", this._onEnd.bind(this));
      this.on("mousemove touchmove", this._scrollFunc.bind(this));
    },

    _onStart: function (event) {
      this.dragPointY = this.getStage().getPointerPosition().y;
    },

    _onEnd: function (event) {
      this.dragPointY = 0;
    },

    _hitFunc: function (context) {
      var width = this.getWidth(),
        height = this.getHeight();

      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    },

    _scrollFunc: function () {
      if (this.dragPointY > 0) {
        this.setDuration(-1); // Stop autoscroll
        this._updateScrollPosition();
        this.getStage().draw();
      }
    },

    _updateScrollPosition: function () {
      var pointerPos = this.getStage().getPointerPosition(),
        ydiff = pointerPos.y - this.dragPointY;
      this.dragPointY = pointerPos.y;

      var r9callback = this.getR9callback(),
        height = this.getHeight(),
        r9vpheight = this.getR9vpheight(),
        r9vpstart = this.getR9vpstart(),
        r9vpfull = this.getR9vpfull();

      if (
        this._isScrollInvalid(
          r9vpstart,
          r9vpheight,
          r9vpfull,
          height,
          r9callback
        )
      )
        return;

      var thumbSize = this._calculateThumbSize(height, r9vpheight, r9vpfull),
        trange = height - thumbSize,
        vrange = r9vpfull - r9vpheight;

      var spos = this._calculateScrollPosition(
        r9vpstart,
        trange,
        vrange,
        ydiff,
        height,
        thumbSize
      );

      this.setR9vpstart((spos * vrange) / trange);
      if (r9callback) {
        r9callback.setScrollViewport(r9vpstart, height);
      }
    },

    _isScrollInvalid: function (
      r9vpstart,
      r9vpheight,
      r9vpfull,
      height,
      r9callback
    ) {
      return (
        r9vpstart < 0 ||
        r9vpheight <= 0 ||
        r9vpfull < r9vpheight ||
        r9vpfull <= height ||
        !r9callback
      );
    },

    _calculateThumbSize: function (height, r9vpheight, r9vpfull) {
      return (height * r9vpheight) / r9vpfull;
    },

    _calculateScrollPosition: function (
      r9vpstart,
      trange,
      vrange,
      ydiff,
      height,
      thumbSize
    ) {
      var spos = (r9vpstart * trange) / vrange;
      spos += ydiff;
      if (spos < 0) spos = 0;
      if (spos + thumbSize > height) spos = height - thumbSize;
      return spos;
    },

    _sceneFunc: function (context) {
      var r9callback = this.getR9callback(),
        width = this.getWidth(),
        height = this.getHeight(),
        thumbcolor = this.getThumbcolor(),
        trackcolor = this.getTrackcolor(),
        r9vpheight = this.getR9vpheight(),
        r9vpstart = this.getR9vpstart(),
        r9vpfull = this.getR9vpfull(),
        duration = this.getDuration(),
        progressvalue = this.progressvalue(),
        trackwidth = 20;

      this._drawTrack(context, width, height, trackwidth, trackcolor);

      if (
        this._isScrollInvalid(
          r9vpstart,
          r9vpheight,
          r9vpfull,
          height,
          r9callback
        )
      )
        return;

      var thumbSize = this._calculateThumbSize(height, r9vpheight, r9vpfull),
        trange = height - thumbSize,
        vrange = r9vpfull - r9vpheight;

      var spos = this._getThumbPosition(
        duration,
        progressvalue,
        trange,
        r9vpstart,
        vrange
      );
      this._drawThumb(context, width, spos, thumbSize, trackwidth, thumbcolor);
    },

    _drawTrack: function (context, width, height, trackwidth, trackcolor) {
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.strokeShape(this);

      context.beginPath();
      context.rect(0, 0, width - trackwidth, height);
      context.closePath();
      context.fillStrokeShape(this);

      context.setAttr("fillStyle", trackcolor);
      context.setAttr("strokeStyle", trackcolor);
      context.beginPath();
      context.rect(width - trackwidth, 0, trackwidth, height);
      context.closePath();
      context.fillShape(this);
    },

    _getThumbPosition: function (
      duration,
      progressvalue,
      trange,
      r9vpstart,
      vrange
    ) {
      var spos;
      if (duration > 0 && progressvalue >= 0) {
        spos = trange * progressvalue;
        this.setR9vpstart((spos * vrange) / trange);
        if (this.getR9callback()) {
          this.getR9callback().setScrollViewport(
            this.getR9vpstart(),
            this.getHeight()
          );
        }
      } else {
        spos = (r9vpstart * trange) / vrange;
      }
      return spos;
    },

    _drawThumb: function (
      context,
      width,
      spos,
      thumbSize,
      trackwidth,
      thumbcolor
    ) {
      context.setAttr("fillStyle", thumbcolor);
      context.setAttr("strokeStyle", thumbcolor);
      context.beginPath();
      context.rect(width - trackwidth, spos, trackwidth, thumbSize);
      context.closePath();
      context.fill(this);
    },
  };

  Kinetic.Util.extend(Kinetic.R9VScrollView, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "r9callback", null);
  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "r9vpheight", -1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "r9vpstart", -1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "r9vpfull", -1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "duration", -1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "thumbcolor", null);
  Kinetic.Factory.addGetterSetter(Kinetic.R9VScrollView, "trackcolor", null);

  Kinetic.Collection.mapMethods(Kinetic.R9VScrollView);
})();
