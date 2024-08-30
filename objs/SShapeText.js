(function () {
  var dummyContext = Kinetic.Util.createCanvasElement().getContext("2d");

  Kinetic.SShapeText = function (config) {
    this.___init(config);
  };

  Kinetic.SShapeText.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "SShapeText";
      this.cloudArray =
        this.borderType() === "Cloud"
          ? Kinetic.Util.parsePathData(r9_cloud)
          : [];

      this._setupEventHandlers();
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
    },

    _setupEventHandlers: function () {
      var eventType = this.getEventtype(),
        name = this.getName(),
        value = this.getValue();
      if (eventType) {
        this.cleanon("click tap", function () {
          r9.PageBus.publish(eventType, { name: name, value: value });
        });
      }
    },

    _getContextFont: function (fontsize, fontFamily) {
      var PX_SPACE = "px ",
        SPACE = " ";
      return (
        this.getFontStyle() +
        SPACE +
        this.getFontVariant() +
        SPACE +
        this.getFontWeight() +
        SPACE +
        (fontsize || this.getFontSize()) +
        PX_SPACE +
        (fontFamily || this.getFontFamily())
      );
    },

    _hitFunc: function (context) {
      var width = this.getWidth(),
        height = this.getHeight();
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    },

    _sceneFunc: function (context) {
      var width = this.getWidth(),
        height = this.getHeight(),
        tXoff = this.getTextXOffset(),
        tYoff = this.getTextYOffset(),
        iconName = this.getIconName(),
        borderType = this.borderType(),
        borderWidth = this.getBorderWidth(),
        borderColorStr = this.getBorderColorStr();

      if (iconName) {
        width += 32;
      }
      context.save();
      this._drawBorder(
        context,
        width,
        height,
        borderType,
        borderWidth,
        borderColorStr
      );
      this._drawIcon(context, iconName, tXoff, tYoff);
      this._drawText(context, tXoff, tYoff, width, height);
      context.restore();

      this.drawCorrectMarker(context);
      this.drawSelectionMarker(context);
    },

    _drawBorder: function (
      context,
      width,
      height,
      borderType,
      borderWidth,
      borderColorStr
    ) {
      context.beginPath();
      if (borderColorStr) {
        context.setAttr("strokeStyle", borderColorStr);
        context.setAttr("lineWidth", borderWidth);
      }
      if (borderType === "Cloud") {
        this._drawCloudBorder(context, width, height);
      } else if (borderType === "Underline") {
        context.rect(
          0,
          height - this.getStrokeWidth(),
          width,
          this.getStrokeWidth()
        );
        context.closePath();
      } else {
        var cornerRadius = this.getCornerRadius();
        if (!cornerRadius) {
          context.rect(0, 0, width, height);
          context.closePath();
        } else {
          r9_drawRounded.call(this, context, 0, 0, width, height, cornerRadius);
        }
      }
      context.fillStrokeShape(this);
    },

    _drawCloudBorder: function (context, width, height) {
      var scaleX = width / 250.0,
        scaleY = height / 100.0;
      context.scale(scaleX, scaleY);
      Kinetic.Util.drawPathByData(this, context, this.cloudArray, false);
      context.scale(1 / scaleX, 1 / scaleY);
    },

    _drawIcon: function (context, iconName, tXoff, tYoff) {
      if (iconName) {
        var imge = r9 && r9.getCacheImageByName(iconName);
        if (imge) {
          var params = [imge, tXoff, tYoff, 24, 24];
          context.drawImage.apply(context, params);
          tXoff += 28;
        }
      }
    },

    _drawText: function (context, tXoff, tYoff, width, height) {
      context.save();
      context._context.font = this._getContextFont();
      context.setAttr("font", this._getContextFont());

      var math = this.getMath();
      if (math) {
        this._drawMathText(context, tXoff, tYoff, width, height, math);
      } else {
        this._drawNormalText(context, tXoff, tYoff, width, height);
      }
      context.restore();
    },

    _drawMathText: function (context, tXoff, tYoff, width, height, math) {
      var fontColorStr = this.getFontColorStr();
      r9_drawMathForm.call(
        this,
        this,
        math,
        context,
        fontColorStr,
        { top: 0, left: 0, right: 0, bottom: 0 },
        tXoff,
        tYoff + Math.max(0, (height - math.toph) / 2) + this.getFontSize(),
        this.getFontSize()
      );
    },

    _drawNormalText: function (context, tXoff, tYoff, width, height) {
      var fontColorStr = this.getFontColorStr();
      if (fontColorStr) {
        context.setAttr("fillStyle", fontColorStr);
        context.setAttr("strokeStyle", fontColorStr);
      }
      var lineHeight = getFontHeight(
        null,
        this.getFontStyle(),
        this.getFontSize(),
        this.getFontFamily()
      );
      var lines = this.getName().split("\n");
      tYoff = (height - lines.length * lineHeight) / 2;
      context._context.textBaseline = "top";

      for (var i = 0; i < lines.length; i++) {
        context.fillText(lines[i], tXoff, tYoff);
        tYoff += lineHeight;
      }
      context.fillStrokeShape(this);
    },

    resetText: function (text) {
      dummyContext.font = this._getContextFont();
      var cloudAdust = this.borderType() === "Cloud" ? 50 : 0;
      var tsize = dummyContext.measureText(text).width,
        width = this.width(),
        height = this.height();

      if (width >= tsize + cloudAdust) {
        this.textXOffset((width - tsize - cloudAdust) / 2);
      } else {
        this._adjustTextSize(tsize, cloudAdust, width);
      }

      tsize = this.getLineHeight() * this.getFontSize();
      if (height >= tsize + cloudAdust) {
        this.textYOffset((height - tsize - cloudAdust) / 2);
      } else {
        this._adjustTextHeight(tsize, cloudAdust, height);
      }

      this.name(text);
    },

    _adjustTextSize: function (tsize, cloudAdust, width) {
      this.width(tsize + cloudAdust + 10);
      this.x(this.x() - (tsize + cloudAdust - width) / 2 - 5);
      this.textXOffset(5);
    },

    _adjustTextHeight: function (tsize, cloudAdust, height) {
      this.height(tsize + cloudAdust + 10);
      this.y(this.y() - (tsize + cloudAdust - height) / 2 - 5);
      this.textYOffset(5);
    },
  };

  Kinetic.Util.extend(Kinetic.SShapeText, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "fontColorStr", "");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "borderColorStr", "");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "cornerRadius", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "name", "");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "value", "");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "id", "");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "eventtype", "");
  Kinetic.Factory.addGetterSetter(
    Kinetic.SShapeText,
    "fontFamily",
    r9_global_font
  );
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "fontSize", 18);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "lineHeight", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "borderWidth", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "fontStyle", "normal");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "fontVariant", "normal");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "fontWeight", "normal");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "padding", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "align", "left");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "textXOffset", 5);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "textYOffset", 5);
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "iconName", "");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "borderType", "Normal");
  Kinetic.Factory.addGetterSetter(Kinetic.SShapeText, "math", null);

  Kinetic.Collection.mapMethods(Kinetic.SShapeText);
})();
