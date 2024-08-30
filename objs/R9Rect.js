(function () {
  Kinetic.R9Rect = function (config) {
    this.___init(config);
  };

  Kinetic.R9Rect.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Rect";
      this.cloudArray =
        this.rectType() === 4 ? Kinetic.Util.parsePathData(r9_cloud) : [];
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

    _sceneFunc: function (context) {
      const cornerRadius = this.getCornerRadius(),
        width = this.getWidth(),
        height = this.getHeight(),
        rectType = this.rectType(),
        duration = this.duration(),
        strokeWidth = this.strokeWidth(),
        lineType = this.lineBorderType(),
        progressvalue = this.progressvalue(),
        underline = this.underline();

      if (underline === 1) this._drawUnderline(context, width, height);

      if (rectType === 0) {
        this._drawRectangleType0(
          context,
          width,
          height,
          cornerRadius,
          duration,
          lineType,
          strokeWidth,
          underline
        );
      } else if (rectType >= 1 && rectType <= 3) {
        this._drawSpecialRectangle(
          context,
          rectType,
          width,
          height,
          cornerRadius,
          duration
        );
      } else if (rectType === 4 && this.cloudArray.length > 0) {
        this._drawCloudShape(context, width, height);
      }

      context.fillStrokeShape(this);
      this.drawCorrectMarker(context);
      this.drawSelectionMarker(context);
    },

    _drawUnderline: function (context, width, height) {
      context.beginPath();
      context.moveTo(0, height);
      context.lineTo(width, height);
      context.closePath();
      context.stroke(this);
    },

    _drawRectangleType0: function (
      context,
      width,
      height,
      cornerRadius,
      duration,
      lineType,
      strokeWidth,
      underline
    ) {
      if (underline !== 1) {
        if (!cornerRadius || duration > 0) {
          if (duration > 0) {
            this._drawAnimatedRectangle(context, width, height);
          } else {
            context.setAttr("lineWidth", strokeWidth);
            context.setAttr("strokeStyle", this.getStrokeStyle());
            r9_drawLineBorder.call(
              this,
              context,
              lineType,
              width,
              height,
              cornerRadius,
              strokeWidth
            );
          }
        } else {
          r9_drawRounded.call(this, context, 0, 0, width, height, cornerRadius);
        }
      }
    },

    _drawAnimatedRectangle: function (context, width, height) {
      const data = [0, 0, width, 0, width, height, 0, height, 0, 0, width, 0];
      this._drawLinePath(context, data, width, height);
    },

    _drawSpecialRectangle: function (
      context,
      rectType,
      width,
      height,
      cornerRadius,
      duration
    ) {
      const data = this._getSpecialRectangleData(
        rectType,
        width,
        height,
        cornerRadius,
        duration
      );
      if (data) {
        this._drawLinePath(context, data, width, height);
      } else {
        context.beginPath();
        this._drawSpecialRectanglePath(
          context,
          rectType,
          width,
          height,
          cornerRadius
        );
        context.closePath();
      }
    },

    _getSpecialRectangleData: function (
      rectType,
      width,
      height,
      cornerRadius,
      duration
    ) {
      if (duration <= 0) return null;

      if (rectType === 1) {
        return [
          width / 2,
          0,
          width,
          height / 2,
          width / 2,
          height,
          0,
          height / 2,
          width / 2,
          0,
          width,
          height / 2,
        ];
      } else if (rectType === 2) {
        return [
          cornerRadius,
          0,
          width,
          0,
          width - cornerRadius,
          height,
          0,
          height,
          cornerRadius,
          0,
          width,
          0,
        ];
      } else if (rectType === 3) {
        return [
          cornerRadius,
          0,
          width - cornerRadius,
          0,
          width,
          height,
          0,
          height,
          cornerRadius,
          0,
          width - cornerRadius,
          0,
        ];
      }
    },

    _drawSpecialRectanglePath: function (
      context,
      rectType,
      width,
      height,
      cornerRadius
    ) {
      context.moveTo(rectType === 1 ? width / 2 : cornerRadius, 0);
      context.lineTo(rectType === 1 ? width : width - cornerRadius, height / 2);
      context.lineTo(rectType === 1 ? width / 2 : width, height);
      context.lineTo(0, height / 2);
      context.lineTo(rectType === 1 ? width / 2 : cornerRadius, 0);
    },

    _drawCloudShape: function (context, width, height) {
      const scaleX = width / 250.0,
        scaleY = height / 100.0;
      context.scale(scaleX, scaleY);
      Kinetic.Util.drawPathByData(this, context, this.cloudArray, false);
      context.scale(1 / scaleX, 1 / scaleY);
    },

    _drawLinePath: function (context, data, width, height) {
      const results = r9_drawLinePath.call(
        this,
        data,
        data.length,
        this.progressvalue(),
        this.duration(),
        this.lastPoint()
      );
      this.lastPoint(results.lastPoint);
      if (results.curdata && results.curdata.length > 2) {
        context.beginPath();
        context.moveTo(results.curdata[0], results.curdata[1]);
        for (var i = 2; i < results.curdata.length; i += 2) {
          context.lineTo(results.curdata[i], results.curdata[i + 1]);
        }
      }
    },
  };

  Kinetic.Util.extend(Kinetic.R9Rect, Kinetic.Shape);

  // Add getters and setters
  const properties = [
    "cornerRadius",
    "lineBorderType",
    "underline",
    "rectType",
    "lastPoint",
    "duration",
  ];
  properties.forEach((prop) =>
    Kinetic.Factory.addGetterSetter(Kinetic.R9Rect, prop, 0)
  );

  Kinetic.Collection.mapMethods(Kinetic.R9Rect);
})();
