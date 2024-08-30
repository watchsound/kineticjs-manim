//  //0 : static text, 1: show text increasely 2: use text as background  3: use underline as animation 
//4: karaoka    5: manim-style  6: manim-style2 
//    0 static, 1 writing, 2 rewriting, 3 underline, 4 karaoka,  5 manim

(function () {

     var AUTO = "auto",
       CENTER = "center",
       CHANGE_KINETIC = "Change.kinetic",
       CONTEXT_2D = "2d",
       DASH = "-",
       EMPTY_STRING = "",
       LEFT = "left",
       TEXT = "text",
       TEXT_UPPER = "Text",
       MIDDLE = "middle",
       NORMAL = "normal",
       PX_SPACE = "px ",
       SPACE = " ",
       RIGHT = "right",
       WORD = "word",
       CHAR = "char",
       NONE = "none",
       ATTR_CHANGE_LIST = [
         "fontFamily",
         "fontSize",
         "fontStyle",
         "fontVariant",
         "padding",
         "align",
         "lineHeight",
         "text",
         "width",
         "height",
         "wrap",
       ],
       attrChangeListLen = ATTR_CHANGE_LIST.length,
       dummyContext = Kinetic.Util.createCanvasElement().getContext(CONTEXT_2D);

     var _curFontFamily,
       _curFontStyle,
       _curFontWeight,
       _curR9textstyle,
       _defaultStroke;

     Kinetic.R9Text = function (config) {
       this.___init(config);
       this.cloudArray = [];
       if (this.borderType() === "Cloud") {
         this.cloudArray = Kinetic.Util.parsePathData(r9_cloud);
       }
     };

     function _fillFunc(context) {
       context.lineWidth = 1;
       context.fillStyle = this._curTextColor || this.getStrokeStyle();
       context.fillText(this.partialText, 0, 0);
     }

     function _strokeFunc(context) {
       if (this.drawunderline()) {
         _drawUnderline(context, this);
         return;
       }

       context.lineWidth = 1;
       context.strokeStyle = this._curTextColor || this.getStrokeStyle();

       if (this.getSft() === 5 && this.text() !== this.otext()) {
         context.strokeText(this.partialText, 0, 0);
       }

       if (this.getSft() === 6 && this.gend() !== 0) {
         _drawManimStyle(context, this);
         return;
       }

       context.strokeText(this.partialText, 0, 0);
       _drawTextStyles(context, this);
     }

     function _drawUnderline(context, instance) {
       dummyContext.save();
       dummyContext.font = instance._getContextFont();
       context.beginPath();
       context.moveTo(0, instance._getLineHeightPx() / 3);
       context.lineTo(
         instance._getTextWidth(instance.partialText),
         instance._getLineHeightPx() / 3
       );
       context.stroke();
       dummyContext.restore();
     }

     function _drawManimStyle(context, instance) {
       var offx6 = 0;
       context.strokeStyle =
         instance._curTextColor || instance.getStrokeStyle();
       context.strokeText(instance.partialText, offx6, 0);
       context.fillStyle = instance.effectColorStr();
       context.strokeStyle = instance.effectColorStr();

       var wh6 = instance._getLineHeightPx() * 0.75;
       context.translate(0, -wh6 / 2);
       for (var i = 0; i < 16; i++) {
         var x0 = Math.random() * wh6 * 3;
         var y0 = Math.random() * wh6;
         context.beginPath();
         context.rect(offx6 + x0, y0, wh6 * 0.2, wh6 * 0.25);
         context.closePath();
         context.fill();
       }
     }

     function _drawTextStyles(context, instance) {
       if (!instance._curR9textstyle) return;
       if (instance._curR9textstyle.u) {
         context.beginPath();
         context.moveTo(0, instance._getLineHeightPx() / 3);
         context.lineTo(
           instance._curR9textstyle.width,
           instance._getLineHeightPx() / 3
         );
         context.stroke();
       }

       if (instance._curR9textstyle.strike) {
         context.beginPath();
         context.moveTo(0, 0);
         context.lineTo(instance._curR9textstyle.width, 0);
         context.stroke();
       }
     }

    Kinetic.R9Text.prototype = {
      ___init: function (config) {
        if (config.width === undefined) {
          config.width = AUTO;
        }
        if (config.height === undefined) {
          config.height = AUTO;
        }

        Kinetic.Shape.call(this, config);

        this._fillFunc = _fillFunc;
        this._strokeFunc = _strokeFunc;
        this.className = TEXT_UPPER;

        for (var n = 0; n < attrChangeListLen; n++) {
          this.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, this._setTextData);
        }

        var stdsize = this.getR9stdsize();
        if (stdsize > 0) {
          var teststr = this.getR9stdline();
          dummyContext.font = this._getContextFont();
          var tsize = dummyContext.measureText(teststr).width;
          this.setScaleX((1.0 * stdsize) / tsize);
        }

        this._setTextData();
        this.sceneFunc(this._sceneFunc);
        this.hitFunc(this._hitFunc);
      },

      _drawBackground: function (context) {
        var width = this.getWidth();
        var height = this.getHeight();
        var useBackground = this.useBackground();
        var borderColorStr = this.borderColorStr() || this.getStrokeStyle();
        var corner = this.corner();
        var borderWidth = this.borderWidth();
        var borderType = this.borderType();
        var lineType = this.lineBorderType();

        // If there's no background, border, or border width, return early
        if (!useBackground && borderType === "None" && borderWidth <= 0) {
          return;
        }

        // Adjust height if vertical size is specified
        if (this.getR9vsize() > 0) {
          height = this.getR9vsize() * this._getLineHeightPx();
        }

        context.save();
        this._setFillAndStrokeStyles(
          context,
          borderColorStr,
          borderWidth,
          lineType
        );

        switch (borderType) {
          case "Cloud":
            this._drawCloudBorder(context, width, height);
            break;
          case "Normal":
            if (!corner) {
              r9_drawLineBorder.call(
                this,
                context,
                lineType,
                width,
                height,
                corner,
                borderWidth
              );
            }
            break;
          case "Underline":
            this._drawUnderlineBorder(context, width, height);
            break;
          case "Cross":
            this._drawCrossBorder(context, width, height);
            break;
          default:
            if (corner) {
              r9_drawRounded.call(this, context, 0, 0, width, height, corner);
            }
            break;
        }

        context.fill();
        context.stroke();
        context.restore();
      },

      _setFillAndStrokeStyles: function (
        context,
        borderColorStr,
        borderWidth,
        lineType
      ) {
        var bgcolorStr = this.getFillStyle();
        context.setAttr("fillStyle", bgcolorStr);

        if (borderColorStr || lineType !== "Single") {
          context.setAttr("strokeStyle", borderColorStr);
          context.setAttr("lineWidth", borderWidth || 1);
        } else {
          context.setAttr("strokeStyle", bgcolorStr);
          context.setAttr("lineWidth", 0);
        }
      },

      _drawCloudBorder: function (context, width, height) {
        var scaleX = width / 250.0;
        var scaleY = height / 100.0;
        context.scale(scaleX, scaleY);
        Kinetic.Util.drawPathByData(null, context, this.cloudArray, true);
        context.scale(1 / scaleX, 1 / scaleY);
      },

      _drawUnderlineBorder: function (context, width, height) {
        context.beginPath();
        context.moveTo(0, height);
        context.lineTo(width, height);
      },

      _drawCrossBorder: function (context, width, height) {
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(width, height);
        context.moveTo(0, height);
        context.lineTo(width, 0);
      },

      _sceneFunc: function (context) {
        var sft = this.getSft(),
          needToPaint = this.needToPaint(),
          duration = this.duration(),
          otext = this.otext(),
          text = this.text(),
          expression = this.expression(),
          math = this.math();

        // Handle different drawing scenarios based on settings
        if (math) {
          this._renderMath(context);
          return;
        }

        if (expression) {
          this._evaluateExpression(context, otext);
          return;
        }

        if (sft === 0 || duration === 0) {
          this._renderStaticText(context, text, otext);
          return;
        }

        switch (sft) {
          case 3:
            this._renderUnderline(context, otext, needToPaint);
            break;
          case 4:
            this._renderKaraoke(context, otext);
            break;
          case 5:
            this._renderManimStyle1(context, otext, needToPaint);
            break;
          case 6:
            this._renderManimStyle2(context, otext, needToPaint);
            break;
          case 2:
            if (needToPaint < otext.length) {
              this.setText(otext);
              this._setTextData();
              this._sceneFuncImpl(context, true, false);
            }
            break;
          default:
            this._renderPartialText(context, otext, needToPaint);
            break;
        }
      },

      _renderMath: function (context) {
        this.setText("");
        this._setTextData();
        this._sceneFuncImpl(context, false, false);
      },

      _evaluateExpression: function (context, otext) {
        this.setText(eval(this.expression()));
        var r9vs = this.getText();
        var r9v = Number(r9vs);
        if (!Number.isNaN(r9v)) {
          r9vs = r9v.toFixed(this.getFixed());
          r9v = parseFloat(r9vs);
          this.setText(otext + r9v + "");
        }
        this._setTextData();
        this._sceneFuncImpl(context, false, false);
      },

      _renderStaticText: function (context, text, otext) {
        this.setText(text || otext);
        this._setTextData();
        this._sceneFuncImpl(context, false, false);
      },

      _renderUnderline: function (context, otext, needToPaint) {
        this.setText(otext);
        this._setTextData();
        this._sceneFuncImpl(context, false, false);
        this.drawunderline(1);
        if (needToPaint > 0) {
          this.setText(otext.substr(0, needToPaint + 1));
          this._setTextData();
          this._sceneFuncImpl(context, false, false);
          this.drawunderline(0);
        }
      },

      _renderKaraoke: function (context, otext) {
        var fullTextWidth =
          this.kalaoktextwidth() || this._calculateFullTextWidth(otext);
        var kalaokoffset = this.kalaokoffset();
        var showStr = this._calculateKaraokeText(
          otext,
          fullTextWidth,
          kalaokoffset
        );
        this.setText(showStr);
        this._setTextData();
        this._sceneFuncImpl(context, false, false);
      },

      _calculateFullTextWidth: function (otext) {
        this.setText(otext);
        this._setTextData();
        var fullTextWidth = this.textWidth;
        this.kalaoktextwidth(fullTextWidth);
        return fullTextWidth;
      },

      _calculateKaraokeText: function (otext, fullTextWidth, kalaokoffset) {
        var showStr = "";
        if (kalaokoffset > 0) {
          var width = this.kalaokwidth() || this.getWidth();
          var diff = this.getX() + width - kalaokoffset;
          if (diff <= 0) {
            showStr = "";
          } else {
            showStr = otext.substr(0, (diff * otext.length) / fullTextWidth);
          }
        } else {
          var diff = -kalaokoffset;
          showStr = otext.substr(
            Math.ceil((diff * otext.length) / fullTextWidth)
          );
        }
        return showStr;
      },

      _renderManimStyle1: function (context, otext, needToPaint) {
        if (needToPaint > 0) {
          this.setText(
            otext.substr(0, this._calculateManimStyle1End(needToPaint))
          );
          this._setTextData();
          this._sceneFuncImpl(context, false, true);
          this.setText(otext.substr(0, needToPaint === 1 ? 0 : needToPaint));
          this._setTextData();
          this._sceneFuncImpl(context, false, false);
        }
      },

      _calculateManimStyle1End: function (needToPaint) {
        return needToPaint === 1 ? 1 : needToPaint === 2 ? 3 : needToPaint + 3;
      },

      _renderManimStyle2: function (context, otext, needToPaint) {
        if (needToPaint > 0) {
          var pend = this._calculateManimStyle2End(needToPaint);
          var pstart = Math.max(0, pend - 2);
          this.setGstart(pstart);
          this.setGend(pend);
          this.setText(otext.substr(pstart, pend));
          this._setTextData();
          this._sceneFuncImpl(context, false, true);
          this.setGstart(0);
          this.setGend(0);
          this.setText(otext.substr(0, needToPaint === 1 ? 0 : needToPaint));
          this._setTextData();
          this._sceneFuncImpl(context, false, false);
        }
      },

      _calculateManimStyle2End: function (needToPaint) {
        return needToPaint === 1
          ? 1
          : needToPaint === 2
          ? needToPaint + 2
          : needToPaint + 2;
      },

      _renderPartialText: function (context, otext, needToPaint) {
        var fill = this.fill(),
          fillBlue = this.fillBlue(),
          fillRed = this.fillRed(),
          fillGreen = this.fillGreen(),
          fillAlpha = this.fillAlpha(),
          stroke = this.stroke(),
          strokeBlue = this.strokeBlue(),
          strokeRed = this.strokeRed(),
          strokeGreen = this.strokeGreen(),
          strokeAlpha = this.strokeAlpha();

        if (needToPaint > 0) {
          this.fill(fill);
          this.fillBlue(fillBlue);
          this.fillRed(fillRed);
          this.fillGreen(fillGreen);
          this.fillAlpha(fillAlpha);
          this.stroke(stroke);
          this.strokeBlue(strokeBlue);
          this.strokeRed(strokeRed);
          this.strokeGreen(strokeGreen);
          this.strokeAlpha(strokeAlpha);
          this.setText(otext.substr(0, needToPaint + 1));
          this._setTextData();
          this._sceneFuncImpl(context, false, false);
        }
      },

      _sceneFuncImpl: function (context, paintBgText, paintBorderOnly) {
        var sft = this.getSft(),
          lineHeightPx = this._getLineHeightPx(),
          textArr = this.textArr,
          textArrLen = textArr.length,
          totalWidth = this.getWidth(),
          abOrder = this.abOrder(),
          glow = this.glow(),
          gstart = this.gstart(),
          gend = this.gend(),
          math = this.math(),
          pX = this.getPaddingX(),
          pY = this.getPaddingY();

        this._drawBackground(context);

        var r9vstart = this._calculateViewportStart(lineHeightPx);
        var r9vend = this._calculateViewportEnd(r9vstart);

        context.setAttr("font", this._getContextFont());
        context.save();
        context.translate(pX, pY);

        if (sft === 6 && gend > 0 && gstart > 0) {
          this._renderManimStyle2(context, textArrLen, lineHeightPx, gstart);
          return;
        }

        context.setAttr("textBaseline", MIDDLE);

        if (math) {
          this._renderMath(context, math);
          return;
        }

        if (abOrder) {
          this._renderAbOrder(context, abOrder);
        }

        if (sft === 4) {
          this._applyKaraokeOffset(context);
        }

        this._renderTextArray(
          context,
          textArr,
          textArrLen,
          r9vstart,
          r9vend,
          paintBgText,
          paintBorderOnly,
          lineHeightPx,
          totalWidth,
          pX
        );

        if (!this.textEqualsOtext()) {
          if (glow) this._drawGlow(context, 0, 0);
          this._drawPenFunc(context, 0, 0);
        }

        context.restore();
        this.drawCorrectMarker(context);
        this.drawSelectionMarker(context);
      },

      _calculateViewportStart: function (lineHeightPx) {
        var r9vstart = this.getR9vstart();
        var r9vpstart = this.getR9vpstart();
        return r9vpstart >= 0 ? Math.ceil(r9vpstart / lineHeightPx) : r9vstart;
      },

      _calculateViewportEnd: function (r9vstart) {
        return this.getR9vsize() < 0 ? 1000 : r9vstart + this.getR9vsize() - 1;
      },

      _renderManimStyle2: function (context, textArrLen, lineHeightPx, gstart) {
        var th = this._getMaxLineHeight(textArrLen, lineHeightPx);
        var offx6 = this._getTextSize(this.otext().substring(0, gstart)).width;
        context.translate(offx6, 0);
        context.setAttr("textBaseline", MIDDLE);
        context.translate(0, th / 2);
        this.partialText = this.text();
        context.fillShape(this);
        context.restore();
      },

      _getMaxLineHeight: function (textArrLen, lineHeightPx) {
        var th = lineHeightPx;
        for (var n = 0; n < textArrLen; n++) {
          var style = this.textArr[n].style;
          if (style && style.math && style.math.toph) {
            th = Math.max(th, style.math.toph);
          }
        }
        return th;
      },

      _renderMath: function (context, math) {
        context.translate(0, math.toph / 2);
        var strokecolorStr = this.getStrokeStyle();
        r9_drawMathForm.call(
          this,
          this,
          math,
          context,
          strokecolorStr,
          { top: 0, left: 0, right: 0, bottom: 0 },
          0,
          0,
          this.getFontSize()
        );
        context.restore();
      },

      _renderAbOrder: function (context, abOrder) {
        var orderw = this._getTextSize(abOrder).width;
        context.setAttr(
          "strokeStyle",
          this._curTextColor || this.getStrokeStyle()
        );
        context.strokeText(abOrder, 0, 0);
        context.translate(orderw, 0);
      },

      _applyKaraokeOffset: function (context) {
        var kalaokoffset = this.kalaokoffset();
        if (kalaokoffset >= 0) {
          context.translate(kalaokoffset, 0);
        }
      },

      _renderTextArray: function (
        context,
        textArr,
        textArrLen,
        r9vstart,
        r9vend,
        paintBgText,
        paintBorderOnly,
        lineHeightPx,
        totalWidth,
        pX
      ) {
        var _xoffset = 0;
        var rowIndex = 0;
        var newLineStart = true;
        var curRowHeight = 0;

        for (var n = 0; n < textArrLen; n++) {
          var { text, width, style } = textArr[n];
          this._curR9textstyle = style;
          if (style && style.itag && style.itagwidth && text === "#")
            text = " ";

          if (this._shouldSkipRow(r9vstart, rowIndex, r9vend, text, style)) {
            rowIndex++;
            continue;
          }

          if (newLineStart && this.getSft() !== 4) {
            var alineH = style && style.rh ? style.rh : lineHeightPx;
            context.translate(-_xoffset, curRowHeight / 2 + alineH / 2);
            _xoffset = 0;
            newLineStart = false;
            curRowHeight = alineH;
          }

          if (text.includes("\n") && this.getSft() !== 4) newLineStart = true;

          context.save();
          context.setAttr("textBaseline", MIDDLE);
          this._curTextColor = this._determineTextColor(
            paintBgText,
            paintBorderOnly,
            style
          );
          this._renderStyledText(context, text, width, style, paintBorderOnly);
          context.restore();

          if (newLineStart) rowIndex++;
          else context.translate(width, 0);
        }
      },

      _shouldSkipRow: function (r9vstart, rowIndex, r9vend, text, style) {
        return (
          r9vstart > rowIndex ||
          rowIndex > r9vend ||
          (text.indexOf("\n") >= 0 && this.getSft() !== 4)
        );
      },

      _determineTextColor: function (paintBgText, paintBorderOnly, style) {
        if (paintBgText) {
          return this.getStrokeStyle(0.3);
        } else {
          var ccc =
            (style && style.fct < 0 && style.stroke) || this._defaultStroke;
          return ccc || this.getStrokeStyle();
        }
      },

      _renderStyledText: function (
        context,
        text,
        width,
        style,
        paintBorderOnly
      ) {
        if (style) {
          this._applyTextStyle(context, style, width);
          this.partialText = this._hasMedia(style) ? "" : text;
          if (paintBorderOnly) {
            this.strokeWidth(1);
            context.strokeShape(this);
          } else {
            context.fillShape(this);
          }
        } else {
          this._renderPlainText(context, text, width);
        }
      },

      _applyTextStyle: function (context, style, width) {
        style.width = width;
        style.height = this._curR9textstyle.rh || this._getLineHeightPx();
        this._setFontAttributes(style);

        if (style.iconName) this._drawIcon(context, style, width);
        if (style.sup) context.translate(0, -style.height / 3);
        if (style.sub) context.translate(0, +style.height / 3);

        context.setAttr("font", this._getContextFont());
        if (style.math) this._drawMathFormula(context, style);
      },

      _setFontAttributes: function (style) {
        if (style.b) {
          this._curFontWeight = "bold";
          this._curFontStyle = null;
        } else if (style.i) {
          this._curFontStyle = "italic";
          this._curFontWeight = "normal";
        } else {
          this._curFontWeight = "normal";
          this._curFontStyle = null;
        }
        this._curFontFamily = style.fontFamily || this.getFontFamily();
      },

      _drawIcon: function (context, style, width) {
        var imge = r9 && r9.getCacheImageByName(style.iconName);
        if (imge) {
          var iconwh = this._getTextSize("xx").width;
          var iconxof = Math.max(0, (width - iconwh) / 2);
          context.translate(iconxof, -iconwh / 2);
          context.drawImage(imge, 0, 0, 32, 32, 0, 0, iconwh, iconwh);
          context.translate(-iconxof, iconwh / 2);
        }
      },

      _drawMathFormula: function (context, style) {
        var width = style.math.topw;
        var tXoff = Math.max(0, (width - style.math.topw) / 2);
        var tYoff = style.math.toph / 2;
        r9_drawMathForm.call(
          this,
          this,
          style.math,
          context,
          this._curTextColor,
          { top: 0, left: 0, right: 0, bottom: 0 },
          tXoff,
          0,
          this.getFontSize()
        );
      },

      _renderPlainText: function (context, text, width) {
        if (this.getAlign() === RIGHT) {
          context.translate(
            this.getWidth() - width - this.getPaddingX() * 2,
            0
          );
        } else if (this.getAlign() === CENTER) {
          context.translate(
            (this.getWidth() - width - this.getPaddingX() * 2) / 2,
            0
          );
        }
        this._curFontFamily = this.getFontFamily();
        this.partialText = text;
        context.fillShape(this);
      },

      _drawPenFunc: function (context, x, y) {
        var pen = this.penImageName();
        if (pen) {
          var image = r9 && r9.getCacheImageByName(pen);
          if (image) {
            context.translate(x - image.width / 2, y + 10);
            context.drawImage(image, 0, 0, image.width, image.height);
          }
        }
      },

      _drawGlow: function (context, x, y) {
        var width = this.getWidth(),
          height = this.getHeight();

        context.save();
        context.translate(0, -height / 2);

        var gradient = context.createRadialGradient(0, 0, 0, 0, 0, height / 2);
        gradient.addColorStop(0, "rgba(255,0,0, 0.6)");
        gradient.addColorStop(1, "rgba(255,0,0,0)");

        context.setAttr("fillStyle", gradient);
        context.beginPath();
        context.arc(0, 0, height / 2, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.restore();
      },

      _hitFunc: function (context) {
        var width = this.getWidth(),
          height = this.getHeight();

        context.globalAlpha = 0.5;
        context.beginPath();
        context.rect(0, 0, width, height);
        context.setAttr("fillStyle", "yellow");
        context.fillStrokeShape(this);
      },

      setText: function (text) {
        var str = text
          ? Kinetic.Util._isString(text)
            ? text
            : text.toString()
          : "";
        this._setAttr(TEXT, str);
        return this;
      },

      getPaddingX: function () {
        return this.getPadding() + this.textXOffset();
      },

      getPaddingY: function () {
        return this.getPadding() + this.textYOffset();
      },

      getWidth: function () {
        if (this.attrs.width === AUTO) {
          return this.getTextWidth() + this.getPaddingX() * 2;
        }
        return this.attrs.width;
      },

      getHeight: function () {
        if (this.attrs.height === AUTO) {
          return this.textHeight
            ? this.textHeight + this.getPaddingY() * 2
            : this.textArr.length * this.getLineHeight() +
                this.getPaddingY() * 2;
        }
        return this.attrs.height;
      },

      getTextWidth: function () {
        return this.textWidth;
      },

      getTextHeight: function () {
        return this.textHeight;
      },

      _getTextSize: function (text, r9textstyle) {
        var _context = dummyContext,
          fontSize = this.getFontSize();

        if (r9textstyle) {
          if (r9textstyle.math) {
            return {
              width: parseInt(r9textstyle.math.topw, 10),
              height: parseInt(r9textstyle.math.toph, 10),
            };
          }
          if (r9textstyle.itag && r9textstyle.itagwidth) {
            return {
              width: parseInt(r9textstyle.itagwidth, 10),
              height: parseInt(fontSize, 10),
            };
          }
        }

        _context.save();
        _context.font = this._getContextFont();
        var metrics = _context.measureText(text);
        _context.restore();
        return {
          width: metrics.width,
          height: parseInt(fontSize, 10),
        };
      },

      _getContextFont: function (fontsize, fontFamily) {
        return [
          this._getFontStyle(),
          this.getFontVariant(),
          this._getFontWeight(),
          (fontsize !== undefined ? fontsize : this.getFontSize()) + PX_SPACE,
          fontFamily !== undefined ? fontFamily : this.fontFamily(),
        ].join(SPACE);
      },

      _getFontWeight: function () {
        return this._curFontWeight || this.getFontWeight();
      },

      _getFontStyle: function () {
        if (this._curFontStyle) {
          return this._handleBoldStyle(this._curFontStyle);
        }
        return this._handleBoldStyle(this.getFontStyle());
      },

      _handleBoldStyle: function (style) {
        if (style === "bold") {
          this._curFontWeight = "bold";
          return "normal";
        }
        return style;
      },

      _getFontFamily: function () {
        return this._curFontFamily || this.getFontFamily();
      },

      _getLineHeightPx: function (r9textstyle) {
        if (r9textstyle && r9textstyle.rh) {
          return r9textstyle.rh;
        }
        return this.getR9lineHeight() < 0
          ? this.getLineHeight() * this.getFontSize()
          : this.getR9lineHeight();
      },

      _addTextLine: function (line, width, r9textstyle) {
        this.textArr.push({
          text: line,
          width: width,
          style: r9textstyle,
        });
      },

      _getTextWidth: function (text) {
        return dummyContext.measureText(text).width;
      },

      _setTextData: function () {
        try {
          return this.r9textstyle() && this.r9textstyle().length > 0
            ? this._setTextData2()
            : this._setTextData1();
        } catch (e) {
          r9_log_console(e);
          return this._setTextData1();
        }
      },

      _setTextData1: function () {
        var lines = this.getText().split("\n"),
          fontSize = this.getFontSize(),
          textWidth = 0,
          lineHeightPx = this._getLineHeightPx(),
          width = this.attrs.width,
          height = this.attrs.height,
          textXOffset = this.textXOffset(),
          textYOffset = this.textYOffset(),
          fixedWidth = width !== AUTO && textXOffset === 0,
          fixedHeight = height !== AUTO && textYOffset === 0,
          paddingX = this.getPaddingX(),
          paddingY = this.getPaddingY(),
          maxWidth = fixedWidth ? 10000 : width - paddingX * 2,
          maxHeightPx = fixedHeight ? 10000 : height - paddingY * 2,
          currentHeightPx = 0,
          wrap = this.getWrap(),
          shouldWrap = wrap !== NONE,
          wrapAtWord = wrap !== CHAR && shouldWrap;

        this.textArr = [];
        dummyContext.save();
        dummyContext.font = this._getContextFont();

        for (var i = 0, max = lines.length; i < max; i++) {
          this._processLine(
            lines[i],
            maxWidth,
            maxHeightPx,
            shouldWrap,
            wrapAtWord,
            lineHeightPx,
            fixedWidth,
            fixedHeight
          );
          currentHeightPx = this._updateHeightAndWidth(
            currentHeightPx,
            lineHeightPx
          );
          textWidth = Math.max(textWidth, this._getMaxLineWidth());
          if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)
            break;
        }

        dummyContext.restore();
        this.textHeight = currentHeightPx || lineHeightPx;
        this.textWidth = textWidth || this._getMaxLineWidth();
        this._adjustWidthForAbOrder();
      },

      _processLine: function (
        line,
        maxWidth,
        maxHeightPx,
        shouldWrap,
        wrapAtWord,
        lineHeightPx,
        fixedWidth,
        fixedHeight
      ) {
        var lineWidth = this._getTextWidth(line);

        if (fixedWidth && lineWidth > maxWidth) {
          this._wrapLine(
            line,
            maxWidth,
            shouldWrap,
            wrapAtWord,
            lineHeightPx,
            maxHeightPx,
            fixedHeight
          );
        } else {
          this._addTextLine(line + "\n", lineWidth);
        }
      },

      _wrapLine: function (
        line,
        maxWidth,
        shouldWrap,
        wrapAtWord,
        lineHeightPx,
        maxHeightPx,
        fixedHeight
      ) {
        while (line.length > 0) {
          var { match, matchWidth, low } = this._binarySearchWrap(
            line,
            maxWidth
          );

          if (match) {
            if (wrapAtWord) {
              var wrapIndex = this._getWrapIndex(match);
              if (wrapIndex > 0) {
                low = wrapIndex;
                match = match.slice(0, low);
                matchWidth = this._getTextWidth(match);
              }
            }
            this._addTextLine(match, matchWidth);
            if (
              !shouldWrap ||
              (fixedHeight && this._exceedsMaxHeight(lineHeightPx, maxHeightPx))
            )
              break;
            line = line.slice(low);
          } else {
            break;
          }
        }
      },

      _binarySearchWrap: function (line, maxWidth) {
        var low = 0,
          high = line.length,
          match = "",
          matchWidth = 0;
        while (low < high) {
          var mid = (low + high) >>> 1,
            substr = line.slice(0, mid + 1),
            substrWidth = this._getTextWidth(substr);
          if (substrWidth <= maxWidth) {
            low = mid + 1;
            match = substr;
            matchWidth = substrWidth;
          } else {
            high = mid;
          }
        }
        return { match, matchWidth, low };
      },

      _getWrapIndex: function (match) {
        return Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
      },

      _updateHeightAndWidth: function (currentHeightPx, lineHeightPx) {
        currentHeightPx += lineHeightPx;
        return currentHeightPx;
      },

      _getMaxLineWidth: function () {
        return this.textArr.reduce((max, line) => Math.max(max, line.width), 0);
      },

      _exceedsMaxHeight: function (lineHeightPx, maxHeightPx) {
        return (
          this.textArr.reduce((height, line) => height + line.height, 0) +
            lineHeightPx >
          maxHeightPx
        );
      },

      _adjustWidthForAbOrder: function () {
        var abOrder = this.abOrder();
        if (abOrder) {
          var orderw = this._getTextSize(abOrder).width;
          this.textWidth += orderw;
        }
      },

      _setTextData2: function () {
        var text = this.getText(),
          sft = this.getSft(),
          r9textstyle = this.r9textstyle(),
          fontSize = +this.getFontSize(),
          textWidth = 0,
          lineHeightPx = this._getLineHeightPx(),
          fixedWidth = this.attrs.width !== AUTO,
          fixedHeight = this.attrs.height !== AUTO,
          paddingX = this.getPaddingX(),
          paddingY = this.getPaddingY(),
          wrap = this.getWrap(),
          shouldWrap = wrap !== NONE,
          wrapAtWord = wrap !== CHAR && shouldWrap;

        this.textArr = [];
        dummyContext.save();
        dummyContext.font = this._getContextFont();

        var currentHeightPx = 0;
        for (var i = 0; i < r9textstyle.length; i++) {
          currentHeightPx = this._processStyledText(
            text,
            r9textstyle[i],
            currentHeightPx,
            lineHeightPx,
            sft,
            shouldWrap,
            wrapAtWord
          );
          textWidth = Math.max(textWidth, this._getMaxLineWidth());
        }

        dummyContext.restore();
        this.textHeight = currentHeightPx;
        this.textWidth = textWidth;
        this._adjustWidthForAbOrder();
      },

      _processStyledText: function (
        text,
        style,
        currentHeightPx,
        lineHeightPx,
        sft,
        shouldWrap,
        wrapAtWord
      ) {
        var line = this._getStyledTextLine(text, style);

        currentHeightPx += this._addLineHeight(currentHeightPx, style);

        this._applyTextStyle(style);

        var textSize = this._getTextSize(line, style);
        this._addTextLine(line, textSize.width, style);

        if (line.includes("\n") && sft !== 4) {
          this._resetLineWidth();
        }

        return currentHeightPx;
      },

      _getStyledTextLine: function (text, style) {
        return style.end < text.length - 1
          ? text.substring(style.start, style.end + 1)
          : text.substring(style.start);
      },

      _addLineHeight: function (currentHeightPx, style) {
        return this._getLineHeightPx(style);
      },

      _applyTextStyle: function (style) {
        this._curFontStyle = style.b ? "bold" : style.i ? "italic" : null;
        this._curFontFamily = style.fontFamily || this.getFontFamily();
      },

      _resetLineWidth: function () {
        return 0;
      },

      _getMaxLineWidth: function () {
        return this.textArr.reduce((max, line) => Math.max(max, line.width), 0);
      },

      _adjustWidthForAbOrder: function () {
        var abOrder = this.abOrder();
        if (abOrder) {
          var orderw = this._getTextSize(abOrder).width;
          this.textWidth += orderw;
        }
      },
    };

    Kinetic.Util.extend(Kinetic.R9Text, Kinetic.Shape);


    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'fontFamily', r9_global_font);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'fontSize', 18);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9lineHeight', -1);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'fontStyle', NORMAL);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'fontWeight', NORMAL);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'fontVariant', NORMAL);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'padding', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'align', LEFT);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'lineHeight', 1);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'wrap', WORD);
    Kinetic.Factory.addGetter(Kinetic.R9Text, 'text', EMPTY_STRING);
    Kinetic.Factory.addOverloadedGetterSetter(Kinetic.R9Text, 'text');
    
    //Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'bgRed', 0, Kinetic.Validators.RGBComponent);
    //Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'bgGreen', 0, Kinetic.Validators.RGBComponent);
    //Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'bgBlue', 0, Kinetic.Validators.RGBComponent);
    //Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'bgAlpha', 0, Kinetic.Validators.RGBComponent);
    

    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9textstyle', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'otext', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'duration', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'resumeAnimation', 1);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9stdsize', -1);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9stdline', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9vstart', -1);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9vsize', -1);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'r9vpstart', -1); 
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'sft', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'needToPaint', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'drawunderline', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'expression', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'math', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'penImageName', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'borderType', 'None');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'lineBorderType', 'Single'); 
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'fixed', 2);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'kalaokoffset', 9999);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'kalaoktextwidth', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'kalaokwidth', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'userobj', null);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'abOrder', '');
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'mstyles', null);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'useBackground', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'corner', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'borderWidth', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'textXOffset', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'textYOffset', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'borderColorStr', '');
    
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'glow', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'gstart', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'gend', 0);
    Kinetic.Factory.addGetterSetter(Kinetic.R9Text, 'effectColorStr', '');

    //r9vpstart is scrolling distance from top, r9vpx is the top-x position of viewport in global view, r9vpsize is the height of viewport
    Kinetic.R9Text.prototype.setScrollViewport = function (r9vpstart,  r9vpheight) {
    	 this.setR9vpstart(r9vpstart); 
    	 this.setR9vsize( r9vpheight / this. _getLineHeightPx() );
    };
    
    Kinetic.R9Text.prototype.relayout = function (width, height) {
    if (!this.textHeight) {
        this._setTextData();
    }

    var padding = this.padding();
    var offsetX = (width - this.textWidth - padding * 2) / 2;
    var offsetY = (height - this.textHeight - padding * 2) / 2;

    if (offsetX >= 0 && offsetY >= 0) {
        this.setTextXOffset(offsetX);
        this.setTextYOffset(offsetY);
        this.setWidth(width);
        this.setHeight(height);
    }
    };

    Kinetic.R9Text.prototype.resetOffset = function (offsetX, offsetY) {
    if (this.textHeight <= 0) {
        this._setTextData();
    }

    var padding = this.padding();
    var width = this.textWidth + padding * 2 + offsetX * 2;
    var height = this.textHeight + padding * 2 + offsetY * 2;

    this.setTextXOffset(offsetX);
    this.setTextYOffset(offsetY);
    this.setWidth(width);
    this.setHeight(height);
    };

    Kinetic.R9Text.prototype.changeStyle = function (styleName) {
    var mstyles = this.mstyles();
    if (!mstyles) return;

    for (var i in mstyles) {
        if (_r9norm(mstyles[i].name) === _r9norm(styleName)) {
        this.r9textstyle(mstyles[i].style);
        this.otext(_r9norm(mstyles[i].text));
        this.text(_r9norm(mstyles[i].text));
        break;
        }
    }
    };

    Kinetic.R9Text.prototype.changeText = function (text, styles) {
    this.r9textstyle(styles || null);
    this.otext(text);
    this.text(text);
    this._setTextData();
    this.relayout(this.width(), this.height());
    };

    Kinetic.R9Text.prototype.toggleUnderline = function () {
    this.drawunderline() ? this.drawunderline(0) : this.drawunderline(1);
    };

    // hasTextBase is an object: {text, math, style}
    Kinetic.R9Text.prototype.setHasTextBase = function (hasTextBase) {
    this.setMath(hasTextBase.math);
    this.r9textstyle(hasTextBase.style);
    this.otext(_r9norm(hasTextBase.text));
    this.text(_r9norm(hasTextBase.text));
    };

    Kinetic.R9Text.prototype.getMathInput = function () {
    var math = this.math();
    if (math) return math;

    var r9textstyle = this.r9textstyle();
    if (r9textstyle) {
        if (r9textstyle.length === 2 && r9textstyle[1].math) {
        return r9textstyle[1].math;
        }
        if (r9textstyle.length === 1 && r9textstyle[0].math) {
        return r9textstyle[0].math;
        }
    }

    return null;
    };

    Kinetic.R9Text.prototype.progress = function (progress) {
    var duration = this.duration();
    var otext = this.otext();
    var sft = this.getSft();
    var total = otext.length;

    if (sft === 4) {
        this._updateKaraokeProgress(progress, otext, duration);
    } else {
        this._updateTextProgress(progress, total, duration);
    }
    };

    // Helper Functions
    Kinetic.R9Text.prototype._updateKaraokeProgress = function (
    progress,
    otext,
    duration
    ) {
    var width = this.kalaokwidth() || this.getWidth();
    var fullTextWidth = this.kalaoktextwidth();

    if (fullTextWidth === 0) {
        this.setText(otext);
        this._setTextData();
        fullTextWidth = this.textWidth;
        this.kalaoktextwidth(fullTextWidth);
    }

    var kalaokoffset = duration ? width - (fullTextWidth + width) * progress : 0;
    this.kalaokoffset(kalaokoffset);
    };

    Kinetic.R9Text.prototype._updateTextProgress = function (
    progress,
    total,
    duration
    ) {
    var needToPaint = duration ? Math.ceil(total * progress) : total;
    this.needToPaint(needToPaint);
    };


    Kinetic.Collection.mapMethods(Kinetic.R9Text);
})();
