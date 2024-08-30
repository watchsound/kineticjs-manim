(function () {
  Kinetic.R9Highlighter = function (config) {
    this.___init(config);
  };

  Kinetic.R9Highlighter.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Highlighter";
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
      const x = 0,
        y = 0,
        height = this.getHeight(),
        duration = this.getDuration(),
        progressvalue = this.progressvalue(),
        line = this.getLine();
      var width = this.getWidth();

      if (duration > 0) {
        width *= progressvalue;
      }

      switch (line) {
        case 0:
          this._drawFilledRectangle(context, x, y, width, height);
          break;
        case 1:
          this._drawBottomLine(context, x, y, width, height);
          break;
        case 2:
          this._drawRoundedRectangle(context, x, y, width, height);
          break;
        case 3:
          this._drawMiddleLine(context, x, y, width, height);
          break;
        case 4:
          this._drawDiagonalLineFromBottomLeft(context, x, y, width, height);
          break;
        case 5:
          this._drawCrossLines(context, x, y, width, height);
          break;
      }

      this.drawSelectionMarker(context);
    },

    _drawFilledRectangle: function (context, x, y, width, height) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width, y);
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.closePath();
      context.fillShape(this);
    },

    _drawBottomLine: function (context, x, y, width, height) {
      context.beginPath();
      context.moveTo(x, y + height);
      context.lineTo(x + width, y + height);
      context.closePath();
      context.strokeShape(this);
    },

    _drawRoundedRectangle: function (context, x, y, width, height) {
      const cornerRadius = Math.min(width, height) / 2;
      context.beginPath();
      r9_drawRounded.call(this, context, x, y, width, height, cornerRadius);
      context.closePath();
      context.strokeShape(this);
    },

    _drawMiddleLine: function (context, x, y, width, height) {
      context.beginPath();
      context.moveTo(x, y + height / 2);
      context.lineTo(x + width, y + height / 2);
      context.closePath();
      context.strokeShape(this);
    },

    _drawDiagonalLineFromBottomLeft: function (context, x, y, width, height) {
      context.beginPath();
      context.moveTo(x, y + height);
      context.lineTo(x + width, y);
      context.closePath();
      context.strokeShape(this);
    },

    _drawCrossLines: function (context, x, y, width, height) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width, y + height);
      context.moveTo(x, y + height);
      context.lineTo(x + width, y);
      context.closePath();
      context.strokeShape(this);
    },
  };

  Kinetic.Util.extend(Kinetic.R9Highlighter, Kinetic.Shape);

  // Add getters and setters
  Kinetic.Factory.addGetterSetter(Kinetic.R9Highlighter, "duration", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Highlighter, "line", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Highlighter, "aorder", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Highlighter, "showchecked", 0);

  Kinetic.Collection.mapMethods(Kinetic.R9Highlighter);
})();
