(function () {
  Kinetic.R9LineTip = function (config) {
    this.___init(config);
  };

  Kinetic.R9LineTip.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9LineTip";
      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _sceneFunc: function (context) {
      const startX = this.startX(),
        startY = this.startY(),
        endX = this.endX(),
        endY = this.endY(),
        targetStartX = this.targetStartX(),
        targetStartY = this.targetStartY(),
        targetEndX = this.targetEndX(),
        targetEndY = this.targetEndY(),
        arrawdash = this.arrawdash(),
        duration = this.duration(),
        progressvalue = this.progressvalue(),
        headEnd = this.headend(),
        strokeWidth = this.strokeWidth() || 1,
        dragTarget = this.dragTarget(),
        tipOffset = this.tipOffset(),
        lineOffsetStart = this.lineOffsetStart(),
        lineOffsetEnd = this.lineOffsetEnd(),
        dash2solid = this.dash2solid();

      const adjustedPoints = this._calculateAdjustedPoints(
        startX,
        startY,
        endX,
        endY,
        targetStartX,
        targetStartY,
        targetEndX,
        targetEndY,
        dragTarget,
        lineOffsetStart,
        lineOffsetEnd
      );
      var [adjustedStartX, adjustedStartY] = adjustedPoints.start;
      var [adjustedEndX, adjustedEndY] = adjustedPoints.end;
      const angle = new Point(adjustedStartX, adjustedStartY).calcAngle(
        new Point(adjustedEndX, adjustedEndY)
      );

      if (duration > 0) {
        adjustedEndX =
          adjustedStartX + (adjustedEndX - adjustedStartX) * progressvalue;
        adjustedEndY =
          adjustedStartY + (adjustedEndY - adjustedStartY) * progressvalue;
      }

      this._drawLine(
        context,
        adjustedStartX,
        adjustedStartY,
        adjustedEndX,
        adjustedEndY,
        arrawdash,
        dash2solid,
        duration,
        progressvalue
      );

      if (headEnd === "BraceEnd") {
        this._drawBraceEnd(
          context,
          adjustedStartX,
          adjustedStartY,
          adjustedEndX,
          adjustedEndY,
          angle
        );
        return;
      }

      this._drawLineHead(
        context,
        adjustedStartX,
        adjustedStartY,
        adjustedEndX,
        adjustedEndY,
        angle,
        headEnd,
        strokeWidth,
        tipOffset
      );

      this._drawBoundingBox(
        context,
        adjustedStartX,
        adjustedStartY,
        adjustedEndX,
        adjustedEndY
      );

      context.fillStrokeShape(this);
    },

    _calculateAdjustedPoints: function (
      startX,
      startY,
      endX,
      endY,
      targetStartX,
      targetStartY,
      targetEndX,
      targetEndY,
      dragTarget,
      lineOffsetStart,
      lineOffsetEnd
    ) {
      const start = new Point(startX, startY),
        end = new Point(endX, endY);
      var length = start.distance(end),
        angle = start.calcAngle(end);

      if (length - lineOffsetStart > 0) {
        const newStart = start.calcPoint(angle, lineOffsetStart);
        startX = newStart.x;
        startY = newStart.y;
      }
      if (length - lineOffsetEnd > 0) {
        const newEnd = start.calcPoint(
          angle,
          length - lineOffsetEnd - lineOffsetStart
        );
        endX = newEnd.x;
        endY = newEnd.y;
      }

      if (targetEndX !== -99999) {
        endX = targetEndX - this.getX();
        endY = targetEndY - this.getY();
      }

      if (targetStartX !== -99999) {
        startX = targetStartX - this.getX();
        startY = targetStartY - this.getY();
      }

      if (dragTarget) {
        try {
          endX = dragTarget.getX();
          endY = dragTarget.getY();
        } catch (err) {
          r9_log_console(err);
        }
      }

      return { start: [startX, startY], end: [endX, endY] };
    },

    _drawLine: function (
      context,
      startX,
      startY,
      endX,
      endY,
      arrawdash,
      dash2solid,
      duration,
      progressvalue
    ) {
      const solidPartEnd = new Point(
        endX - ((endX - startX) * dash2solid) / 100,
        endY - ((endY - startY) * dash2solid) / 100
      );

      if (dash2solid > 0) {
        if (duration === 0 || progressvalue > dash2solid / 100) {
          this.setDash(arrawdash === 1 ? [5, 5] : [0, 0]);
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(solidPartEnd.x, solidPartEnd.y);
          context.fillStrokeShape(this);

          this.setDash(arrawdash === 1 ? [0, 0] : [5, 5]);
          context.beginPath();
          context.moveTo(solidPartEnd.x, solidPartEnd.y);
          context.lineTo(endX, endY);
          context.fillStrokeShape(this);
        } else {
          this.setDash(arrawdash === 1 ? [5, 5] : [0, 0]);
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(endX, endY);
          context.fillStrokeShape(this);
        }
      } else {
        this.setDash(arrawdash === 1 ? [5, 5] : [0, 0]);
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.fillStrokeShape(this);
      }
    },

    _drawBraceEnd: function (context, startX, startY, endX, endY, angle) {
      const braceParams = [
        { angle: 45, offset: 10 },
        { angle: 135, offset: 10 },
      ];

      context.beginPath();
      braceParams.forEach(({ angle: a, offset }) => {
        const startPt = new Point(startX, startY).calcPoint(angle + a, offset);
        const endPt = new Point(endX, endY).calcPoint(angle - a, offset);
        context.moveTo(startX, startY);
        context.quadraticCurveTo(startPt.x, startPt.y, endPt.x, endPt.y);
      });
      context.fillStrokeShape(this);
    },

    _drawLineHead: function (
      context,
      startX,
      startY,
      endX,
      endY,
      angle,
      headEnd,
      strokeWidth,
      tipOffset
    ) {
      const arrowSize = Math.max(strokeWidth * 3, 10);
      const end = new Point(endX, endY);

      switch (headEnd) {
        case "ArrowEnd":
          const arrowPoints = [
            end.calcPoint(angle - 135, arrowSize),
            end.calcPoint(angle + 135, arrowSize),
          ];
          context.beginPath();
          context.moveTo(endX, endY);
          arrowPoints.forEach((p) => context.lineTo(p.x, p.y));
          context.closePath();
          break;
        case "BallEnd":
          context.moveTo(endX, endY);
          context.arc(endX, endY, arrowSize / 2, 0, 2 * Math.PI);
          break;
        case "SquareEnd":
          context.beginPath();
          context.rect(
            endX - strokeWidth,
            endY - strokeWidth,
            strokeWidth * 2,
            strokeWidth * 2
          );
          context.closePath();
          break;
      }
    },

    _drawBoundingBox: function (context, startX, startY, endX, endY) {
      if (this.checked()) {
        const strokeWidth = this.strokeWidth();
        this.strokeWidth(1);
        context.setAttr("strokeStyle", "rgba(255,0,0,1)");
        context.beginPath();
        context.rect(
          Math.min(startX, endX),
          Math.min(startY, endY),
          Math.abs(endX - startX),
          Math.abs(endY - startY)
        );
        context.closePath();
        context.stroke(this);
        this.strokeWidth(strokeWidth);
      }
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

  Kinetic.Util.extend(Kinetic.R9LineTip, Kinetic.Shape);

  // Add getters and setters
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "startX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "startY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "endX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "endY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "targetStartX", -99999);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "targetStartY", -99999);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "targetEndX", -99999);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "targetEndY", -99999);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "headend", "ArrowEnd");
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "arrawdash", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "strokeRed", "1");
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "strokeGreen", "1");
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "strokeBlue", "1");
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "strokeWidth", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "duration", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "dragTarget", null);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "dash2solid", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "curvetype", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "tipOffset", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "lineOffsetStart", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9LineTip, "lineOffsetEnd", 0);

  Kinetic.Collection.mapMethods(Kinetic.R9LineTip);
})();
