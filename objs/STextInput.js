(function () {
  Kinetic.STextInput = function (config) {
    this.___init(config);
  };

  Kinetic.STextInput.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "STextInput";
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
    },

    _getContextFont: function (fontsize, fontFamily) {
      var PX_SPACE = "px ",
        SPACE = " ";
      return (
        this.getFontStyle() +
        SPACE +
        this.getFontVariant() +
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
      var width = this._computeWidth(context),
        height = this.getHeight(),
        cornerRadius = this.getCornerRadius(),
        text = this.getText() || this.getPlaceholder(),
        fontSize = this.getFontSize();

      context.setAttr("font", this._getContextFont(fontSize));
      context.setAttr("textBaseline", "middle");

      this._drawInputBackground(context, width, height, cornerRadius);
      this._drawTextContent(context, text, width, height);
      this.drawSelectionMarker(context);
    },

    _computeWidth: function (context) {
      var width = this.getWidth(),
        text = this.getText(),
        placeholder = this.getPlaceholder();
      if (this.getPack()) {
        var measuredText = text
          ? context._context.measureText(text)
          : context._context.measureText(placeholder);
        width = measuredText.width + 6;
      }
      return width;
    },

    _drawInputBackground: function (context, width, height, cornerRadius) {
      context.beginPath();
      if (this.getUseUnderline()) {
        context.moveTo(0, height);
        context.lineTo(width, height);
      } else if (!cornerRadius) {
        context.rect(0, 0, width, height);
        context.closePath();
      } else {
        r9_drawRounded.call(this, context, 0, 0, width, height, cornerRadius);
      }
      context.fillStrokeShape(this);

      if (!this.valid()) {
        context.setAttr("fillStyle", "rgba(255,88,51,0.1)");
        context.setAttr("strokeStyle", "rgba(255,88,51,1)");
      }
    },

    _drawTextContent: function (context, text, width, height) {
      var lineHeight = getFontHeight(
        null,
        this.getFontStyle(),
        this.getFontSize(),
        this.getFontFamily()
      );
      var yoffset = height / 2;

      if (this.getMath() != null) {
        this._drawMathContent(context, yoffset, this.getFontSize());
      } else if (text) {
        this.drawTextString(
          context,
          text,
          Math.max(0, (width - context._context.measureText(text).width) / 2),
          yoffset,
          lineHeight
        );
      }
    },

    _drawMathContent: function (context, yoffset, fontSize) {
      var textColor = this.textColor();
      r9_drawMathForm.call(
        this,
        this,
        this.getMath(),
        context,
        textColor,
        { top: 0, left: 0, bottom: 0, right: 0 },
        0,
        yoffset,
        fontSize
      );
    },

    drawTextString: function (context, text, x, y, lineHeight) {
      var textColor = this.textColor();
      context.setAttr("font", this._getContextFont());
      context.setAttr("fillStyle", textColor);
      context.setAttr("strokeStyle", textColor);

      var strike = false;
      for (var i = 0; i < text.length; i++) {
        this._handleTextFormatting(context, text, i, x, y, lineHeight, strike);
      }
    },

    _handleTextFormatting: function (
      context,
      text,
      i,
      x,
      y,
      lineHeight,
      strike
    ) {
      if (text.slice(i, i + 5) === "<sup>") {
        y -= lineHeight / 3;
        i += 4;
        return;
      } else if (text.slice(i, i + 6) === "</sup>") {
        y += lineHeight / 3;
        i += 5;
        return;
      } else if (text.slice(i, i + 5) === "<sub>") {
        y += lineHeight / 3;
        i += 4;
        return;
      } else if (text.slice(i, i + 6) === "</sub>") {
        y -= lineHeight / 3;
        i += 5;
        return;
      } else if (text.slice(i, i + 2) === "√)") {
        strike = false;
        i += 1;
        return;
      }

      context.fillText(text.charAt(i), x, y);
      var m = context._context.measureText(text.charAt(i));
      if (strike) {
        context.save();
        context.beginPath();
        context.moveTo(x, y - (lineHeight * 4) / 5);
        context.lineTo(x + m.width, y - (lineHeight * 4) / 5);
        context.closePath();
        context.fillStrokeShape(this);
        context.restore();
      }
      x += m.width;

      if (text.charAt(i) === "√" && text.charAt(i + 1) !== ")") {
        strike = true;
      }
    },

    validating: function () {
      var text = this.getText(),
        answers = this.getAnswers(),
        math = this.getMath();
      text = math ? math.toString() : text;

      return answers.some(function (answer) {
        var a = answer.toString();
        if (a === text) return true;
        if (a.includes("...")) {
          var [min, max] = a.split("...").map(parseFloat);
          return (
            !isNaN(min) &&
            !isNaN(max) &&
            min <= parseFloat(text) &&
            max >= parseFloat(text)
          );
        }
        return false;
      });
    },

    del: function () {
      var text = this.getText(),
        linkedVarId = this.getLinkedvarid();
      if (this.getMath()) {
        this.setText("");
        this.setMath(null);
      } else {
        this._deleteLastCharacter(text);
      }

      if (linkedVarId && this.getText()) {
        r9.setVarValue(linkedVarId, this.getText());
        r9.PageBus.publish("r9.core.event.variableEvent", null);
      }
    },

    _deleteLastCharacter: function (text) {
      if (text && text.length > 1) {
        text = text.replace(/(<sup>|<\/sup>|<sub>|<\/sub>|√\))$/, "");
        this.setText(text.slice(0, -1));
      } else {
        this.setText("");
      }
    },

    append: function (achar) {
      if (this.optionMode()) {
        this._handleOptionMode(achar);
        return;
      }
      var text = this.getText();
      if (typeof achar === "string") {
        this._appendString(achar, text);
      } else if (typeof achar === "object") {
        this.setMath(achar);
      }
    },

    _handleOptionMode: function (achar) {
      if (typeof achar === "string") {
        this.setText(achar + "");
      } else if (typeof achar === "object") {
        this.setMath(achar);
      }
      this.confirm();
    },

    _appendString: function (achar, text) {
      var transformationMap = {
        上标: "<sup>",
        下标: "<sub>",
        "√(": "√",
      };
      var transformed = transformationMap[achar] || achar;
      this.setText(text + transformed);
    },

    confirm: function () {
      var text = this.getText(),
        feedback = _r9norm(this.correctStr()),
        linkedVarId = this.getLinkedvarid();

      if (linkedVarId && text) {
        r9.setVarValue(linkedVarId, text);
        r9.PageBus.publish("r9.core.event.variableEvent", null);
      }

      if (
        feedback ||
        this.correctMath() ||
        this.wrongStr() ||
        this.wrongMath()
      ) {
        this._publishFeedback();
      }
    },

    _publishFeedback: function () {
      var isValid = this.validating();
      var feedbackData = isValid
        ? {
            name: "message",
            style: this.correctStyle(),
            math: this.correctMath(),
            borderType: "Cloud",
            value: _r9norm(this.correctStr()),
            x: this.x(),
            y: this.y(),
          }
        : {
            name: "message",
            style: this.wrongStyle(),
            math: this.wrongMath(),
            borderType: "Cloud",
            value: _r9norm(this.wrongStr()),
            x: this.x(),
            y: this.y(),
          };
      r9.PageBus.publish("r9.core.message", feedbackData);
    },
  };

  Kinetic.Util.extend(Kinetic.STextInput, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "cornerRadius", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "placeholder", "");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "answers", "");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "text", "");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "correctStr", "");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "correctStyle", []);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "correctMath", null);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "wrongStr", "");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "wrongStyle", []);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "wrongMath", null);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "valid", true);
  Kinetic.Factory.addGetterSetter(
    Kinetic.STextInput,
    "fontFamily",
    r9_global_font
  );
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "fontSize", 18);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "fontStyle", "normal");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "fontVariant", "normal");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "padding", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "align", "left");
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "pack", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "useUnderline", 0);
  Kinetic.Factory.addGetterSetter(
    Kinetic.STextInput,
    "textColor",
    "rgba(0,0,0,1)"
  );
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "math", null);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "linkedvarid", null);
  Kinetic.Factory.addGetterSetter(Kinetic.STextInput, "optionMode", false);

  Kinetic.Collection.mapMethods(Kinetic.STextInput);
})();
