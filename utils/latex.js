(function (window) {
  var gray = "rgb(102, 102, 102)";
  var blue = "rgb(153, 153, 255)";
  var SERIF = 0,
    SANSSERIF = 1,
    BOLD = 2,
    ITALIC = 4,
    ROMAN = 8,
    TYPEWRITER = 16;

  // Constants for rendering
  var PIXELS_PER_POINT = 1;
  var FONT_SCALE_FACTOR = 100;
  var PREC = 0.0000001;

  var drawCircle = function (ctx, x, y) {
    ctx.strokeStyle = blue;
    ctx.moveTo(x, y);
    ctx.arc(0, 0, 8, 8, 0, 360);
    ctx.strokeStyle = "black";
    ctx.arc(0, 0, 8, 8, 0, 360);
    ctx.moveTo(-x, -y);
  };

  var roundRect = function (ctx, x, y, width, height, radius, fill, stroke) {
    stroke = stroke === undefined ? true : stroke;
    radius = radius || { tl: 5, tr: 5, br: 5, bl: 5 };

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  var draw = function (fig, box, ctx, x, y, csx, csy) {
    var boxType = box.bt;

    if (boxType === "CB") {
      ctx.save();
      ctx.translate(x, y);
      var fstyle = box.fst === 0 ? "normal" : box.fst === 1 ? "bold" : "italic";
      var font = fstyle + " " + box.fsz + "px " + box.fname;
      var scale =
        Math.abs(box.sz - FONT_SCALE_FACTOR) > PREC
          ? box.sz / FONT_SCALE_FACTOR
          : 1;

      if (scale !== 1) ctx.scale(scale, scale);
      if (ctx.font !== font) {
        ctx._context.font = font;
        ctx.setAttr("font", font);
      }

      ctx.fillText(box.c, 0, 0);
      ctx.restore();
    } else if (boxType === "FcB") {
      ctx.save();
      var s = csx === csy ? 1 / csx : 1;
      ctx.scale(s, s);
      ctx.setAttr("lineWidth", box.th);

      var th = box.th / 2.0;
      var xx = (x + box.spc) * s + (box.spc / 2.0) * s;
      var inc = Math.round((box.spc + box.th) * s);
      ctx.beginPath();

      for (var i = 0; i < box.N; i++) {
        ctx.moveTo(xx + th * s, (y - box.h) * s);
        ctx.lineTo(xx + th * s, y * s);
        xx += inc;
      }

      if (box.s) {
        ctx.moveTo((x + box.spc) * s, (y - box.h / 2.0) * s);
        ctx.lineTo(xx - (s * box.spc) / 2, (y - box.h / 2.0) * s);
      }

      ctx.stroke();
      ctx.restore();
    } else if (boxType === "FmB") {
      ctx.save();
      ctx.setAttr("lineWidth", box.th);
      var th = box.th / 2;
      ctx.rect(x + th, y - box.h + th, box.w - box.th, box.h + box.dp - box.th);
      ctx.stroke(fig);
      ctx.restore();
      draw(fig, box.b1, ctx, x + box.spc + box.th, y, csx, csy);
    } else if (boxType === "OvB") {
      draw(fig, box.b1, ctx, x + box.spc + box.th, y, csx, csy);
      ctx.save();
      ctx.setAttr("lineWidth", box.th);
      var th = box.th / 2;
      var r = 0.5 * Math.min(box.w - box.th, box.h + box.dp - box.th);
      roundRect(
        ctx,
        x + th,
        y - box.h + th,
        box.w - box.th,
        box.h + box.dp - box.th,
        r,
        false,
        true
      );
      ctx.restore();
    } else if (boxType === "HR") {
      ctx.beginPath();
      if (box.sft === 0) {
        ctx.rect(x, y - box.h, box.w, box.h);
      } else {
        ctx.rect(x, y - box.h + box.sft, box.w, box.h);
      }
      ctx.closePath();
      ctx.fill(fig);
    } else if (boxType === "JrB") {
      var oldf = ctx.font;
      var fstyle = box.fst === 0 ? "normal" : box.fst === 1 ? "bold" : "italic";
      var font = fstyle + " " + box.fsz + "px " + box.fname;
      ctx.font = font;

      ctx.translate(x, y);
      ctx.scale(0.1 * box.sz, 0.1 * box.sz);
      ctx.fillText(box.c, 0, 0);

      ctx.scale(10 / box.sz, 10 / box.sz);
      ctx.translate(-x, -y);
      ctx.setAttr("font", oldf);
    } else if (boxType === "OB") {
      draw(fig, box.b1, ctx, x, y, csx, csy);
      var yVar = y - box.b1.h - box.b2.w;
      box.b2.dp = box.b2.h + box.b2.dp;
      box.b2.h = 0;
      if (box.o) {
        // draw delimiter and box.b3 above box.b1
        ctx.save();
        var transX = x + (box.b2.h + box.b2.dp) * 0.75,
          transY = yVar;
        ctx.translate(transX, transY);
        ctx.rotate(Math.PI / 2);
        draw(fig, box.b2, ctx, 0, 0, csx, csy);
        ctx.restore();

        if (box.b3 != null) {
          draw(fig, box.b3, ctx, x, yVar - box.k - box.b3.dp, csx, csy);
        }
      } else {
        yVar = y + box.b1.dp;
        ctx.save();
        var transX = x + (box.b2.h + box.b2.dp) * 0.75,
          transY = yVar;
        ctx.translate(transX, transY);
        ctx.rotate(Math.PI / 2);
        draw(fig, box.b2, ctx, 0, 0, csx, csy);
        ctx.restore();
        yVar += box.b2.w;

        if (box.b3 != null) {
          draw(fig, box.b3, ctx, x, yVar + box.k + box.b3.h, csx, csy);
        }
      }
    } else if (boxType === "RB") {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      draw(fig, box.b1, ctx, -box.w, 0, csx, csy);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    } else if (boxType === "RtB") {
      y -= box.sY;
      x += box.sX;
      ctx.rotate(-box.a, x, y);
      draw(fig, box.b1, ctx, x, y, csx, csy);
      ctx.rotate(box.a, x, y);
    } else if (boxType === "ScB") {
      if (box.xscl !== 0 && box.yscl !== 0) {
        var dec = box.xscl < 0 ? box.w : 0;
        ctx.translate(x + dec, y);
        ctx.scale(box.xscl, box.yscl);
        draw(fig, box.b1, ctx, 0, 0, csx, csy);
        ctx.scale(1 / box.xscl, 1 / box.yscl);
        ctx.translate(-x - dec, -y);
      }
    } else if (boxType === "VB" || boxType === "OBr") {
      var yPos = y - box.h;
      for (var ii = 0; ii < box.cdr.length; ii++) {
        var b = box.cdr[ii];
        yPos += b.h;
        draw(fig, b, ctx, x + b.sft - box.lmp, yPos, csx, csy);
        yPos += b.dp;
      }
    }

    // Handle "StB" if needed, otherwise it's empty.
  };

  var paintIcon = function (fig, box, ctx, color, insets, x, y, size) {
    ctx.save();
    ctx.setAttr("textBaseline", "alphabetic");

    ctx.translate(x, y);
    ctx.scale(size, size);

    if (color) {
      ctx.setAttr("fillStyle", color);
      ctx.setAttr("strokeStyle", color);
    } else {
      ctx.setAttr("fillStyle", "black");
      ctx.setAttr("strokeStyle", "black");
    }

    if (insets == null) {
      draw(fig, box, ctx, 0, box.h, size, size);
    } else {
      draw(fig, box, ctx, insets.left / size, insets.top / size, size, size);
    }

    ctx.translate(-x, -y);
    ctx.restore();
  };

  window.r9_drawMathForm = paintIcon;
})(window);
