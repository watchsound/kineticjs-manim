(function () {
  // the 0.0001 offset fixes a bug in Chrome 27
  const PIx2 = Math.PI * 2 - 0.0001,
    R9ELLIPSE = "R9Ellipse";

  Kinetic.R9Ellipse = function (config) {
    this.___init(config);
  };

  Kinetic.R9Ellipse.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = R9ELLIPSE;
      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _sceneFunc: function (context) {
      const rx = this.getRadiusX(),
        ry = this.getRadiusY(),
        duration = this.duration(),
        progressvalue = this.progressvalue(),
        hideScratch = this.hideScratch(),
        antiClockwise = this.antiClockwise() !== 0,
        startAngle = this._toRadians(this.start()),
        endAngle = this._toRadians(this.end()) * progressvalue + startAngle;

      if (!hideScratch) {
        this._drawEllipse(context, rx, ry);
      }

      if (duration > 0) {
        this._drawProgressArc(
          context,
          rx,
          ry,
          startAngle,
          endAngle,
          antiClockwise
        );
      }

      this.drawCorrectMarker(context);
      this.drawSelectionMarker(context);
    },

    _toRadians: function (degrees) {
      return (degrees * Math.PI) / 180;
    },

    _drawEllipse: function (context, rx, ry) {
      context.beginPath();
      context.save();
      if (rx !== ry) {
        context.scale(1, ry / rx);
      }
      context.arc(0, 0, rx, 0, PIx2, false);
      context.restore();
      context.closePath();
      context.fillStrokeShape(this);
    },

    _drawProgressArc: function (context, rx, ry, start, end, antiClockwise) {
      context.beginPath();
      context.save();
      if (this.animationBallColor()) {
        context.setAttr("fillStyle", this.animationBallColor());
        context.setAttr("strokeStyle", this.animationBallColor());
      }
      if (rx !== ry) {
        context.scale(1, ry / rx);
      }
      context.arc(0, 0, rx, start, end, antiClockwise);
      context.restore();
      if (this.animationColorAll()) {
        context.strokeShape(this);
      }

      if (this.useAnimationBall()) {
        this._drawAnimationBall(context, rx, ry, end, antiClockwise);
      }
    },

    _drawAnimationBall: function (context, rx, ry, end, antiClockwise) {
      const endX = rx * Math.cos(end);
      const endY = ry * Math.sin(end);
      context.beginPath();
      context.arc(endX, endY, 4, 0, PIx2, antiClockwise);
      context.fill();
    },

    drawSelectionMarker: function (context) {
      if (this.checked()) {
        context.setAttr("strokeStyle", "rgba(255,0,0,1)");
        context.beginPath();
        context.rect(
          (-this.getWidth() * this.scaleX()) / 2,
          (-this.getHeight() * this.scaleY()) / 2,
          this.getWidth(),
          this.getHeight()
        );
        context.closePath();
        context.stroke(this);
      }
    },

    getWidth: function () {
      return this.getRadiusX() * 2;
    },

    getHeight: function () {
      return this.getRadiusY() * 2;
    },

    setWidth: function (width) {
      Kinetic.Node.prototype.setWidth.call(this, width);
      this.setRadius({ x: width / 2 });
    },

    setHeight: function (height) {
      Kinetic.Node.prototype.setHeight.call(this, height);
      this.setRadius({ y: height / 2 });
    },

    getBounds: function () {
      return {
        x: this.getX() - this.getWidth() / 2,
        y: this.getY() - this.getHeight() / 2,
        width: this.getWidth(),
        height: this.getHeight(),
      };
    },

    getCenter: function (locType) {
      switch (locType) {
        case "top":
          return { x: this.getX(), y: this.getY() - this.getHeight() / 2 };
        case "bottom":
          return { x: this.getX(), y: this.getY() + this.getHeight() / 2 };
        case "left":
          return { x: this.getX() - this.getWidth() / 2, y: this.getY() };
        case "right":
          return { x: this.getX() + this.getWidth() / 2, y: this.getY() };
        default:
          return { x: this.getX(), y: this.getY() };
      }
    },

    renderBounds: function () {
      const cp = this.getParent(),
        cx1 = this.getX() - (this.getWidth() * this.scaleX()) / 2,
        cy1 = this.getY() - (this.getHeight() * this.scaleY()) / 2;

      if (cp && cp.nodeType === "Group") {
        return {
          x: cx1 + cp.getX(),
          y: cy1 + cp.getY(),
          w: Math.abs(this.getWidth() * this.scaleX()),
          h: Math.abs(this.getHeight() * this.scaleY()),
        };
      }

      return {
        x: cx1,
        y: cy1,
        w: Math.abs(this.getWidth() * this.scaleX()),
        h: Math.abs(this.getHeight() * this.scaleY()),
      };
    },

    toPathString: function () {
      const b = this.renderBounds();
      return `M ${b.x} ${b.y + b.h / 2} A ${b.w / 2} ${b.h / 2}, 0, 0 1, ${
        b.x + b.w
      } ${b.y + b.h / 2} A ${b.w / 2} ${b.h / 2}, 0,0, 1, ${b.x} ${
        b.y + b.h / 2
      }`;
    },

    adjustdraghooks: function () {
      const draghooktargets = this.draghooktargets(),
        adjx =
          this.parent && this.parent.nodeType === "Group" ? this.parent.x() : 0,
        adjy =
          this.parent && this.parent.nodeType === "Group" ? this.parent.y() : 0;

      if (draghooktargets.length > 0) {
        for (var i = 0; i < draghooktargets.length; i++) {
          const node = draghooktargets[i].node;
          const targetX = adjx + this.x() + this.getRadiusX() / 2;
          const targetY = adjy + this.y() + this.getRadiusY() / 2;
          if (draghooktargets[i].type === 0 || draghooktargets[i].type === 1) {
            node.setTargetStartX(targetX);
            node.setTargetStartY(targetY);
          } else if (draghooktargets[i].type === 2) {
            node.setTargetEndX(targetX);
            node.setTargetEndY(targetY);
          }
        }
      }
    },

    calculateOtargetsPos: function () {
      const rx = this.getRadiusX(),
        ry = this.getRadiusY(),
        duration = this.duration(),
        progressvalue = this.progressvalue(),
        antiClockwise = this.antiClockwise() !== 0;

      if (duration <= 0) return;

      const endAngle = this._toRadians(
        this.start() + (this.end() - this.start()) * progressvalue
      );
      this.curx(rx * Math.cos(endAngle));
      this.cury(ry * Math.sin(endAngle));
    },
  };

  Kinetic.Util.extend(Kinetic.R9Ellipse, Kinetic.Shape);

  // add getters setters
  Kinetic.Factory.addComponentsGetterSetter(Kinetic.R9Ellipse, "radius", [
    "x",
    "y",
  ]);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "radiusX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "radiusY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "duration", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "animationColorAll", 0);
  Kinetic.Factory.addGetterSetter(
    Kinetic.R9Ellipse,
    "animationBallColor",
    null
  );
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "useAnimationBall", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "draghooktargets", []);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "hideScratch", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "start", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "end", 360);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Ellipse, "antiClockwise", 0);

  Kinetic.R9Ellipse.prototype.setX = function (x) {
    Kinetic.Node.prototype.setX.call(this, x);
    this.adjustdraghooks();
  };

  Kinetic.R9Ellipse.prototype.setY = function (y) {
    Kinetic.Node.prototype.setY.call(this, y);
    this.adjustdraghooks();
  };

  Kinetic.Collection.mapMethods(Kinetic.R9Ellipse);
})();
