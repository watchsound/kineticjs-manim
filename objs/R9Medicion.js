(function () {
  Kinetic.R9Medicion = function (config) {
    this.___init(config);
  };

  Kinetic.R9Medicion.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Medicion";
      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _getContextFont: function (fontsize, fontFamily) {
      const PX_SPACE = "px ",
        SPACE = " ";
      return `${this.getFontStyle()}${SPACE}${this.getFontVariant()}${SPACE}${
        fontsize || this.getFontSize()
      }${PX_SPACE}${fontFamily || this.getFontFamily()}`;
    },

    _sceneFunc: function (context) {
      const startX = this.startX(),
        startY = this.startY(),
        endX = this.endX(),
        endY = this.endY(),
        strokeWidth = this.strokeWidth() || 1,
        tipOffset = this.tipOffset(),
        text = this.text(),
        fontSize = this.fontSize(),
        math = this.math(),
        textColor = this.textColor(),
        arrawdash = this.arrawdash();

      const start = new Point(startX, startY),
        end = new Point(endX, endY),
        middle = start.interpolate(end, 0.5),
        len = start.distance(end),
        angle = start.calcAngle(end);

      this._drawArrows(context, start, end, angle, strokeWidth, tipOffset);
      this._drawDashedLine(
        context,
        start,
        end,
        angle,
        len,
        arrawdash,
        strokeWidth,
        tipOffset,
        math,
        text
      );
      this._drawText(context, middle, angle, text, math, textColor, fontSize);
    },

    _drawArrows: function (context, start, end, angle, strokeWidth, tipOffset) {
      const arrowSize = Math.max(strokeWidth * 3, 10);
      const newStart = start.calcPoint(angle, arrowSize - 5 - tipOffset);
      const newEnd = end.calcPoint(angle + 180, arrowSize - 5 - tipOffset);

      this._drawArrowHead(context, start, angle, strokeWidth);
      this._drawArrowHead(context, end, angle + 180, strokeWidth);
    },

    _drawArrowHead: function (context, point, angle, strokeWidth) {
      const aheadsize = Math.max(strokeWidth * 3, 10);
      const ap1 = point.calcPoint(angle - 45, aheadsize);
      const ap2 = point.calcPoint(angle + 45, aheadsize);

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(ap1.x, ap1.y);
      context.lineTo(ap2.x, ap2.y);
      context.lineTo(point.x, point.y);
      context.closePath();
      context.fillStrokeShape(this);
    },

    _drawDashedLine: function (
      context,
      start,
      end,
      angle,
      len,
      arrawdash,
      strokeWidth,
      tipOffset,
      math,
      text
    ) {
      const twidth = math
        ? math.topw
        : context._context.measureText(text).width;
      const m1Start = start.calcPoint(
        angle,
        Math.max(5, (len - twidth) / 2 - 4)
      );
      const m1End = end.calcPoint(
        angle + 180,
        Math.max(5, (len - twidth) / 2 - 4)
      );

      this.setDash(arrawdash === 1 ? [5, 5] : [0, 0]);
      context.beginPath();
      context.moveTo(m1Start.x, m1Start.y);
      context.lineTo(m1End.x, m1End.y);
      context.fillStrokeShape(this);
    },

    _drawText: function (
      context,
      middle,
      angle,
      text,
      math,
      textColor,
      fontSize
    ) {
      context.save();
      context.setAttr("textBaseline", "middle");
      context.setAttr("font", this._getContextFont());
      context.translate(middle.x, middle.y);
      context.rotate((angle * Math.PI) / 180);

      if (textColor) {
        context.setAttr("fillStyle", textColor);
        context.setAttr("strokeStyle", textColor);
      }

      const tXoff = -context._context.measureText(text).width / 2;
      const tYoff = 0;

      if (math) {
        r9_drawMathForm.call(
          this,
          this,
          math,
          context,
          textColor,
          { top: 0, left: 0, right: 0, bottom: 0 },
          tXoff,
          tYoff,
          fontSize
        );
      } else {
        context.fillText(text, tXoff, tYoff);
      }

      context.restore();
    },

    getDataPointAt: function (pos) {
      return pos === 0
        ? new Point(this.startX(), this.startY())
        : new Point(this.endX(), this.endY());
    },

    setDataPointAt: function (pos, point) {
      if (pos === 0) {
        this.setStartX(point.x);
        this.setStartY(point.y);
      } else {
        this.setEndX(point.x);
        this.setEndY(point.y);
      }
    },

    changeDataPointAt: function (pos, shift) {
      if (pos === 0) {
        this.setStartX(this.getStartX() + shift.x);
        this.setStartY(this.getStartY() + shift.y);
      } else {
        this.setEndX(this.getEndX() + shift.x);
        this.setEndY(this.getEndY() + shift.y);
      }
    },

    toPathString: function () {
      return `M ${this.startX()} ${this.startY()} L ${this.endX()} ${this.endY()} `;
    },
  };

  Kinetic.Util.extend(Kinetic.R9Medicion, Kinetic.Shape);

  // Add getters and setters
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "startX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "startY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "endX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "endY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "arrawdash", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "tipOffset", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "strokeWidth", 2);
  Kinetic.Factory.addGetterSetter(
    Kinetic.R9Medicion,
    "fontFamily",
    r9_global_font
  );
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "fontSize", 18);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "lineHeight", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "fontStyle", "normal");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "fontVariant", "normal");
  Kinetic.Factory.addGetterSetter(
    Kinetic.R9Medicion,
    "textColor",
    "rgba(0,0,0,1)"
  );
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "math", null); // math object only supported in option-mode
  Kinetic.Factory.addGetterSetter(Kinetic.R9Medicion, "text", null);

  Kinetic.Collection.mapMethods(Kinetic.R9Medicion);
})();
