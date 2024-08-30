(function () {
  Kinetic.R9Dialog = function (config) {
    this.___init(config);
  };

  Kinetic.R9Dialog.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Dialog";
      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _sceneFunc: function (context) {
      const startX = 0,
        startY = 0,
        fontSize = this.fontSize(),
        messages = [
          this.title(),
          this.message1(),
          this.message2(),
          this.message3(),
        ],
        lineHeight = 40;

      var dialogWidth = 0,
        dialogHeight = 0;

      // Set font and text alignment
      context._context.font = `${fontSize}pt Calibri`;
      context._context.textAlign = "center";

      // Measure text widths to determine dialog dimensions
      messages.forEach((message) => {
        const width = context._context.measureText(message).width;
        dialogHeight += lineHeight;
        dialogWidth = Math.max(dialogWidth, width);
      });

      // Draw dialog background
      const padding = 20;
      const rectX = startX - padding - dialogWidth / 2;
      const rectY = startY - padding;
      const rectWidth = dialogWidth + 2 * padding;
      const rectHeight = dialogHeight + 2 * padding;

      context.save();
      context.globalAlpha = 0.5;
      context.beginPath();
      context.rect(rectX, rectY, rectWidth, rectHeight);
      context.fillStyle = "yellow";
      context.fill();
      context.lineWidth = 7;
      context.strokeStyle = "black";
      context.stroke();
      context.restore();

      // Draw text
      context.fillStyle = "black";
      var textY = startY;
      messages.forEach((message, index) => {
        context.fillText(message, startX, textY);
        textY += lineHeight;
        if (index === 0) {
          // Draw separator line after title
          context.beginPath();
          context.moveTo(rectX, textY - lineHeight / 2);
          context.lineTo(rectX + rectWidth, textY - lineHeight / 2);
          context.stroke();
          textY += lineHeight / 2;
        }
      });

      // Draw shape
      context.fillStrokeShape(this);

      this.drawSelectionMarker(context);
    },
  };

  Kinetic.Util.extend(Kinetic.R9Dialog, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "x", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "y", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "stroke", "black");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "strokeWidth", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "fontSize", 18);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "title", "");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "message1", "");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "message2", "");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Dialog, "message3", "");

  Kinetic.Collection.mapMethods(Kinetic.R9Dialog);
})();
