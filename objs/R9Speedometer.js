(function () {
  Kinetic.R9Speedometer = function (config) {
    this.___init(config);
  };

  Kinetic.R9Speedometer.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Speedometer";
      this.sceneFunc(this._sceneFunc.bind(this));
      this.hitFunc(this._hitFunc.bind(this));
    },

    _hitFunc: function (context) {
      const width = this.getWidth(),
        height = this.getHeight();
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    },

    _sceneFunc: function (ctx) {
      const w = this.getWidth(),
        arcAngle = this.arcAngle(),
        numTicks = this.numTicks(),
        tickLength = this.tickLength(),
        velocity = this.velocity(),
        startAngle = this.startAngle(),
        needleHeight = this.needleHeight(),
        needleWidth = this.needleWidth(),
        handColor = this.handColorStr();

      const cx = w / 2,
        cy = w / 2;
      const center = new Point(cx, cy);
      const margin = 10,
        radius = w / 2 - margin;

      this._drawArc(ctx, cx, cy, radius, startAngle);
      this._drawTicks(
        ctx,
        center,
        radius,
        startAngle,
        arcAngle,
        numTicks,
        tickLength
      );
      this._drawNeedle(
        ctx,
        center,
        cx,
        cy,
        radius,
        tickLength,
        startAngle,
        arcAngle,
        velocity,
        handColor
      );
    },

    _drawArc: function (ctx, cx, cy, radius, startAngle) {
      ctx.setAttr("lineWidth", 2);
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        radius,
        ((360 - startAngle) * Math.PI) / 180,
        ((startAngle - 180) * Math.PI) / 180
      );
      ctx.strokeShape(this);
    },

    _drawTicks: function (
      ctx,
      center,
      radius,
      startAngle,
      arcAngle,
      numTicks,
      tickLength
    ) {
      const arcUnit = arcAngle / (numTicks - 1);

      ctx.beginPath();
      this._drawTick(ctx, center, radius, -startAngle);
      this._drawTick(ctx, center, radius, -startAngle + arcAngle);
      ctx.strokeShape(this);

      for (var i = 0; i < numTicks; i++) {
        ctx.beginPath();
        const angle = -startAngle + arcUnit * i;
        const p = center.calcPoint(angle, radius);
        const p2 = center.calcPoint(angle, radius - tickLength);
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeShape(this);

        this._drawTickLabel(ctx, angle, radius, tickLength, i * 10);
      }
    },

    _drawTick: function (ctx, center, radius, angle) {
      const p = center.calcPoint(angle, radius);
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(p.x, p.y);
    },

    _drawTickLabel: function (ctx, angle, radius, tickLength, label) {
      const p = new Point(center.x, center.y).calcPoint(
        angle,
        radius + tickLength
      );
      ctx.setAttr("fillStyle", this.handColorStr());
      ctx.setAttr("font", `${parseInt(Math.ceil(radius / 4))}px Georgia`);
      ctx.fillText(label.toString(), p.x - 5, p.y);
    },

    _drawNeedle: function (
      ctx,
      center,
      cx,
      cy,
      radius,
      tickLength,
      startAngle,
      arcAngle,
      velocity,
      handColor
    ) {
      const angle = -startAngle + (arcAngle * velocity) / 100;
      const len = radius - tickLength * 2;
      const p = center.calcPoint(angle, len);
      const p2 = center.calcPoint(angle - 2, len - 5);
      const p3 = center.calcPoint(angle + 2, len - 5);

      ctx.setAttr("strokeStyle", handColor);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fillStrokeShape(this);
    },
  };

  Kinetic.Util.extend(Kinetic.R9Speedometer, Kinetic.Shape);

  // Add getters and setters
  const properties = [
    "arcAngle",
    "numTicks",
    "tickLength",
    "needleWidth",
    "needleHeight",
    "startAngle",
    "velocity",
    "handColorStr",
  ];
  properties.forEach((prop) =>
    Kinetic.Factory.addGetterSetter(
      Kinetic.R9Speedometer,
      prop,
      prop === "handColorStr" ? "" : 0
    )
  );

  Kinetic.Collection.mapMethods(Kinetic.R9Speedometer);
})();
