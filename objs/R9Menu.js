(function () {
  Kinetic.R9Menu = function (config) {
    this.___init(config);
  };

  Kinetic.R9Menu.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Menu";
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
      if (this.hide() === 1) return;

      const cornerRadius = this.getCornerRadius(),
        width = this.getWidth(),
        height = this.getHeight();

      context.save();
      context.beginPath();

      if (!cornerRadius) {
        context.rect(0, 0, width, height);
      } else {
        r9_drawRounded.call(
          this,
          context,
          -cornerRadius,
          -cornerRadius,
          width + 2 * cornerRadius,
          height + 2 * cornerRadius,
          cornerRadius
        );
      }

      context.closePath();
      context.fillStrokeShape(this);
      context.restore();
    },

    addMenuTextItem: function (layer, content, iconName, callback, userobj) {
      var text = content;
      if (this.addorder()) {
        const menuItems = this.menuItems();
        text =
          ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"][
            menuItems.length
          ] +
          ": " +
          content;
      }

      const textNode = new Kinetic.R9Text({
        text: text,
        fontSize: this.fontSize(),
        fontFamily: this.fontFamily(),
        fillStyle: this.menuItemColor() || "white",
        strokeStyle: this.menuItemColor() || "black",
        lineHeight: 1.1,
        padding: 5,
      });

      this.addMenuItem(layer, textNode, content, iconName, callback, userobj);
    },

    addMenuItem: function (
      layer,
      textNode,
      content,
      iconName,
      callback,
      userobj
    ) {
      const gap = 4,
        width = this.width(),
        height = this.height(),
        colnum = this.colnum(),
        prevXoffset = parseFloat(this.prevX()),
        prevYoffset = parseFloat(this.prevY());

      const [newX, newY] = this._calculateMenuItemPosition(
        textNode,
        width,
        height,
        colnum,
        prevXoffset,
        prevYoffset,
        gap
      );
      textNode.setX(newX);
      textNode.setY(newY);

      layer.add(textNode);
      this.menuItems().push(textNode);
      this._attachItemClickHandler(textNode, layer, content, callback, userobj);
    },

    _calculateMenuItemPosition: function (
      textNode,
      width,
      height,
      colnum,
      prevXoffset,
      prevYoffset,
      gap
    ) {
      const tw = parseFloat(textNode.width() + 30), // 30 for icon space
        th = textNode.height();

      if (colnum > 1) {
        if (this.menuItems().length % colnum !== 0) {
          this.prevX(prevXoffset + tw + gap);
          return [
            this.getX() + prevXoffset + gap,
            this.getY() + prevYoffset + gap,
          ];
        } else {
          this.prevX(tw);
          this.prevY(height);
          return [this.getX(), this.getY() + height + gap];
        }
      } else {
        this.prevX(0); // Reset X offset in single column mode
        return [this.getX(), this.getY() + height + gap];
      }
    },

    _attachItemClickHandler: function (
      textNode,
      layer,
      content,
      callback,
      userobj
    ) {
      const that = this;
      textNode.on("click tap", function () {
        that.removeAllItems();
        if (callback) {
          try {
            callback(content, userobj);
          } catch (e) {
            r9_log_console(e);
          }
        }
        layer.draw();
      });
    },

    removeAllItems: function () {
      try {
        const items = this.menuItems();
        items.forEach((item) => item.remove());
        this.menuItems().length = 0;
      } catch (e) {
        r9_log_console(e);
      }

      const layer = this.getLayer();
      this.remove();
      if (layer) layer.draw();
    },
  };

  Kinetic.Util.extend(Kinetic.R9Menu, Kinetic.Shape);

  // Add getters and setters
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "cornerRadius", 4);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "fontFamily", r9_global_font);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "fontSize", 18);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "menuItems", []);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "menuItemColor", null);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "addorder", false);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "colnum", 1);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "prevX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "prevY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.R9Menu, "hide", 0);

  Kinetic.Collection.mapMethods(Kinetic.R9Menu);
})();
