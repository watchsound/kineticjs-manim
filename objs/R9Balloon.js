(function () {
  Kinetic.R9Balloon = function (config) {
    this.___init(config);
  };

  Kinetic.R9Balloon.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Balloon";
      this.cloudArray = this.cloud()
        ? Kinetic.Util.parsePathData(r9_cloud)
        : [];
      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _sceneFunc: function (context) {
      var attrs = this.getAttrs();
      var x = attrs.x,
        y = attrs.y,
        width = attrs.width,
        height = attrs.height,
        p1x = attrs.p1x,
        p1y = attrs.p1y,
        p2x = attrs.p2x,
        p2y = attrs.p2y,
        arrowx = attrs.arrowx,
        arrowy = attrs.arrowy,
        rwidth = attrs.rwidth,
        rheight = attrs.rheight,
        cornerRadius = attrs.cornerRadius,
        btype = attrs.btype,
        borderonly = attrs.borderonly,
        duration = attrs.duration,
        progressvalue = attrs.progressvalue;
      var ratio = 1;

      if (this.cloud()) {
        this._drawCloud(context, rwidth, rheight);
      } else if (this.oval()) {
        this._drawOval(context, rwidth, rheight, borderonly);
      } else {
        this._drawRectangle(context, rwidth, rheight, cornerRadius, borderonly);
      }

      if (this.bubble() > 0) {
        this._drawBubbles(
          context,
          p1x,
          p1y,
          p2x,
          p2y,
          arrowx,
          arrowy,
          duration,
          progressvalue,
          borderonly
        );
      } else {
        this._drawArrow(
          context,
          p1x,
          p1y,
          p2x,
          p2y,
          arrowx,
          arrowy,
          duration,
          progressvalue,
          borderonly
        );
      }

      this.drawSelectionMarker(context);
    },

    _drawCloud: function (context, width, height) {
      var scaleX = width / 250.0;
      var scaleY = height / 100.0;
      context.save();
      context.scale(scaleX, scaleY);
      Kinetic.Util.drawPathByData(this, context, this.cloudArray, false);
      context.restore();
    },

    _drawOval: function (context, width, height, borderonly) {
      var ratio = height / width;
      var PI2 = Math.PI * 2 - 0.0001;
      context.save();
      context.translate(width / 2, height / 2);
      if (ratio !== 1) {
        context.scale(1, ratio);
      }
      context.beginPath();
      context.arc(0, 0, width / 2, 0, PI2, false);
      context.closePath();
      if (borderonly) {
        context.strokeShape(this);
      } else {
        context.fillShape(this);
      }
      context.restore();
    },

    _drawRectangle: function (
      context,
      width,
      height,
      cornerRadius,
      borderonly
    ) {
      context.beginPath();
      if (!cornerRadius) {
        context.rect(0, 0, width, height);
      } else {
        r9_drawRounded.call(this, context, 0, 0, width, height, cornerRadius);
      }
      context.closePath();
      if (borderonly) {
        context.strokeShape(this);
      } else {
        context.fillShape(this);
      }
    },

    _drawBubbles: function (
      context,
      p1x,
      p1y,
      p2x,
      p2y,
      arrowx,
      arrowy,
      duration,
      progressvalue,
      borderonly
    ) {
      var cx = (p1x + p2x) / 2;
      var cy = (p1y + p2y) / 2;
      var rxc = Math.max(Math.abs(p2x - p1x) / 12, 2);
      var ryc = Math.max(Math.abs(cy - arrowy) / 12, 2);
      var lenx = Math.max(Math.abs(cx - arrowx), 2);
      var leny = Math.max(Math.abs(cy - arrowy), 2);
      var PI2 = Math.PI * 2 - 0.0001;
      var ccx = cx,
        ccy = cy;

      if (duration > 0) {
        ccx = Math.abs(p2x - p1x) * progressvalue;
      }

      for (var i = 1; i <= 5; i++) {
        var rx = rxc * i;
        var ry = ryc * i;
        if (rx > ccx) continue;

        context.save();
        var cxx = arrowx + ((arrowx < cx ? i : -i) * lenx) / 5;
        var cyy = arrowy + ((arrowy < cy ? i : -i) * leny) / 5;
        context.translate(cxx, cyy);

        if (rx !== ry) context.scale(1, height / width);
        context.beginPath();
        context.arc(0, 0, rx, 0, PI2, false);
        context.closePath();
        if (borderonly) {
          context.strokeShape(this);
        } else {
          context.fillShape(this);
        }
        context.restore();
      }
    },

    _drawArrow: function (
      context,
      p1x,
      p1y,
      p2x,
      p2y,
      arrowx,
      arrowy,
      duration,
      progressvalue,
      borderonly
    ) {
      var ex = arrowx;
      var ey = arrowy;
      if (duration > 0) {
        ex = ex + (p1x - ex) * progressvalue;
        ey = ey + (p1y - ey) * progressvalue;
      }
      context.beginPath();
      context.moveTo(p1x, p1y);
      context.lineTo(p2x, p2y);
      context.lineTo(ex, ey);
      context.closePath();
      if (borderonly) {
        context.strokeShape(this);
      } else {
        context.fillShape(this);
      }
    },
  };

  Kinetic.Util.extend(Kinetic.R9Balloon, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "p1X", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "p1Y", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "p2X", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "p2Y", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "arrowX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "arrowY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "rwd", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "rht", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "btype", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "cornerRadius", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "bubble", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "borderonly", false);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "duration", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "oval", false);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "cloud", false);
  Kinetic.Factory.addComponentsGetterSetter(Kinetic.R9Balloon, "radius", [
    "x",
    "y",
  ]);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "radiusX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Balloon, "radiusY", 0);

  Kinetic.Collection.mapMethods(Kinetic.R9Balloon);
})();
