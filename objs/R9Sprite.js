(function () {
  Kinetic.R9Sprite = function (config) {
    this.___init(config);
  };

  Kinetic.R9Sprite.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Sprite";
      this._oldState = null;
      this._updated = true;
      var that = this;

      this.anim = new Kinetic.Animation(function () {
        var updated = that._updated;
        that._updated = false;
        return updated;
      });

      this._addEventListeners();
      this.sceneFunc(this._sceneFunc.bind(this));
      this.hitFunc(this._hitFunc.bind(this));
    },

    _addEventListeners: function () {
      var that = this;

      this.on("animationChange.kinetic", function () {
        that.frameIndex(0);
      });

      this.on("frameIndexChange.kinetic", function () {
        that._updated = true;
      });

      this.on("frameRateChange.kinetic", function () {
        if (that.anim.isRunning()) {
          clearInterval(that.interval);
          that._setInterval();
        }
      });
    },

    _sceneFunc: function (context) {
      var animIndex = this.getAnimation(),
        index = this.frameIndex(),
        ix4 = index * 4,
        set = this.getAnimations()[animIndex],
        x = set[ix4],
        y = set[ix4 + 1],
        width = set[ix4 + 2],
        height = set[ix4 + 3],
        image = this.getImage();

      if (image) {
        this.fwidth(width);
        this.fheight(height);
        this._drawImage(context, image, x, y, width, height);
      }
      this.drawSelectionMarker(context);
    },

    _drawImage: function (context, image, x, y, width, height) {
      var r9cropX = this.getR9cropX(),
        r9cropY = this.getR9cropY(),
        r9cropWidth = this.getR9cropWidth(),
        r9cropHeight = this.getR9cropHeight();

      if (r9cropWidth && r9cropHeight) {
        context.drawImage(
          image,
          x + r9cropX,
          y + r9cropY,
          r9cropWidth,
          r9cropHeight,
          0,
          0,
          width,
          height
        );
      } else {
        context.drawImage(image, x, y, width, height, 0, 0, width, height);
      }
    },

    _hitFunc: function (context) {
      var animIndex = this.getAnimation(),
        index = this.frameIndex(),
        ix4 = index * 4,
        set = this.getAnimations()[animIndex],
        width = set[ix4 + 2],
        height = set[ix4 + 3];

      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillShape(this);
    },

    _setInterval: function () {
      var that = this;
      this.interval = setInterval(function () {
        that._updateIndex();
      }, 1000 / this.getFrameRate());
    },

    start: function () {
      var layer = this.getLayer();
      this.anim.setLayers(layer);
      this._setInterval();
      this.anim.start();
    },

    stop: function () {
      this.anim.stop();
      clearInterval(this.interval);
    },

    isRunning: function () {
      return this.anim.isRunning();
    },

    provoke: function (newState) {
      var oldState = this.getAnimation();
      if (oldState !== newState) {
        this._oldState = oldState;
        this.changeState(newState);
      }
    },

    changeState: function (newState, provoked) {
      if (provoked) {
        this.provoke(newState);
        return;
      }
      this.stop();
      this.frameIndex(0);
      this.setAnimation(newState);
      this.start();
    },

    hasState: function (state) {
      return typeof this.getAnimations()[state] !== "undefined";
    },

    _updateIndex: function () {
      var index = this.frameIndex(),
        animIndex = this.getAnimation(),
        animations = this.getAnimations(),
        animConfig = animations[animIndex],
        len = animConfig.length / 4;

      if (index < len - 1) {
        this.frameIndex(index + 1);
      } else {
        if (this._oldState) {
          this.setAnimation(this._oldState);
          this._oldState = null;
        } else {
          if (this.norepeat() === 0) {
            this.frameIndex(0);
          } else {
            this.stop();
          }
        }
      }
    },
  };

  Kinetic.Util.extend(Kinetic.R9Sprite, Kinetic.Shape);

  // Add getters setters
  const props = [
    "animation",
    "animations",
    "image",
    "frameIndex",
    "frameRate",
    "duration",
    "fwidth",
    "fheight",
    "norepeat",
  ];
  props.forEach((prop) =>
    Kinetic.Factory.addGetterSetter(Kinetic.R9Sprite, prop)
  );

  Kinetic.Factory.addComponentsGetterSetter(Kinetic.R9Sprite, "r9crop", [
    "x",
    "y",
    "width",
    "height",
  ]);
  Kinetic.Factory.addComponentsGetterSetter(Kinetic.R9Sprite, "fcrop", [
    "x",
    "y",
    "width",
    "height",
  ]);
  Kinetic.Factory.addComponentsGetterSetter(Kinetic.R9Sprite, "tcrop", [
    "x",
    "y",
    "width",
    "height",
  ]);

  Kinetic.Collection.mapMethods(Kinetic.R9Sprite);
})();
