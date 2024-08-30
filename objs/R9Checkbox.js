(function () {
  Kinetic.R9Checkbox = function (config) {
    this.___init(config);
  };

  Kinetic.R9Checkbox.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Checkbox";
      this.sceneFunc(this._sceneFunc.bind(this));
      this.hitFunc(this._hitFunc.bind(this));
    },

    _hitFunc: function (context) {
      const width = this.getWidth(),
        height = this.getHeight(),
        x = this.startX(),
        y = this.startY();

      context.beginPath();
      context.rect(x, y, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    },

    _sceneFunc: function (context) {
      const startX = this.startX(),
        startY = this.startY(),
        endX = startX + this.width(),
        endY = startY + this.height(),
        checked = this.checked(),
        markcolor = this.markcolor(),
        boxstype = this.boxstype();

      switch (boxstype) {
        case 0:
          this._drawCrossBox(context, startX, startY, endX, endY, markcolor);
          break;
        case 1:
          this._drawCircleBox(
            context,
            startX,
            startY,
            endX,
            endY,
            checked,
            markcolor
          );
          break;
        default:
          this._drawImageBox(context, checked);
          break;
      }
    },

    _drawCrossBox: function (context, startX, startY, endX, endY, markcolor) {
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.moveTo(startX, endY);
      context.lineTo(endX, startY);
      context.strokeStyle = markcolor;
      context.stroke();

      context.beginPath();
      context.rect(startX, startY, endX - startX, endY - startY);
      context.closePath();
      context.fillStrokeShape(this);
    },

    _drawCircleBox: function (
      context,
      startX,
      startY,
      endX,
      endY,
      checked,
      markcolor
    ) {
      const PIx2 = Math.PI * 2;
      const rx = (endX - startX) / 2;
      const ry = (endY - startY) / 2;
      const centerX = startX + rx;
      const centerY = startY + ry;

      context.save();
      context.translate(centerX, centerY);

      if (checked) {
        context.fillStyle = markcolor;
        this._drawEllipse(context, rx - 4, ry - 4);
        context.fill();
      }

      context.fillStyle = "transparent";
      this._drawEllipse(context, rx, ry);
      context.fillStrokeShape(this);
      context.restore();
    },

    _drawEllipse: function (context, rx, ry) {
      context.save();
      context.beginPath();
      if (rx !== ry) {
        context.scale(1, ry / rx);
      }
      context.arc(0, 0, rx, 0, Math.PI * 2);
      context.closePath();
      context.restore();
    },

    _drawImageBox: function (context, checked) {
      context.save();
      const iconName = checked === 0 ? this.uncheckimg() : this.checkimg();
      const img = r9 && r9.getCacheImageByName(iconName);
      if (img) {
        context.drawImage(
          img,
          this.startX(),
          this.startY(),
          this.width(),
          this.height()
        );
      }
      context.restore();
    },
  };

  Kinetic.Util.extend(Kinetic.R9Checkbox, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "startX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "startY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "strokeRed", "1");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "strokeGreen", "1");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "strokeBlue", "1");
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "strokeWidth", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "boxstype", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Checkbox, "markcolor", "black");
  Kinetic.Factory.addGetterSetter(
    Kinetic.R9Checkbox,
    "uncheckimg",
    "r9checkbox_u.png"
  );
  Kinetic.Factory.addGetterSetter(
    Kinetic.R9Checkbox,
    "checkimg",
    "r9checkbox_s.png"
  );

  Kinetic.Collection.mapMethods(Kinetic.R9Checkbox);
})();
