(function () {
  Kinetic.SImage = function (config) {
    this.___init(config);
  };

  Kinetic.SImage.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "SImage";
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
    },

    _useBufferCanvas: function () {
      return (
        (this.hasShadow() || this.getAbsoluteOpacity() !== 1) &&
        this.hasStroke() &&
        this.getStage()
      );
    },

    _sceneFunc: function (context) {
      var image = this.getImage();
      if (image) {
        this._drawImage(context, image);
      }
      this._drawBorder(context);
      this.drawCorrectMarker(context);
      this.drawSelectionMarker(context);
    },

    _drawImage: function (context, image) {
      var width = this.getWidth(),
        height = this.getHeight(),
        cropParams = this._getCropParams(image, width, height);

      if (cropParams) {
        context.drawImage.apply(context, cropParams);
      }
    },

    _getCropParams: function (image, width, height) {
      var cropWidth = this.getCropWidth(),
        cropHeight = this.getCropHeight(),
        ratioX = this.getImageRatioX(),
        ratioY = this.getImageRatioY(),
        r9cropX = this.getR9cropX(),
        r9cropY = this.getR9cropY(),
        r9cropWidth = this.getR9cropWidth(),
        r9cropHeight = this.getR9cropHeight();

      if (r9cropWidth && r9cropHeight) {
        return [
          image,
          r9cropX * ratioX,
          r9cropY * ratioY,
          r9cropWidth * ratioX,
          r9cropHeight * ratioY,
          0,
          0,
          width,
          height,
        ];
      } else if (cropWidth && cropHeight) {
        return [
          image,
          this.getCropX() * ratioX,
          this.getCropY() * ratioY,
          cropWidth * ratioX,
          cropHeight * ratioY,
          this.getCropX(),
          this.getCropY(),
          cropWidth,
          cropHeight,
        ];
      } else {
        return [image, 0, 0, width, height];
      }
    },

    _drawBorder: function (context) {
      if (this.strokeWidth() > 0) {
        var width = this.getWidth(),
          height = this.getHeight();
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        context.fillStrokeShape(this);
      }
    },

    _hitFunc: function (context) {
      var width = this.getWidth(),
        height = this.getHeight();
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    },

    getImageWidth: function () {
      var image = this.getImage();
      return this.attrs.width || (image ? image.width : 0);
    },

    getImageHeight: function () {
      var image = this.getImage();
      return this.attrs.height || (image ? image.height : 0);
    },

    getWidth: function () {
      return this.getCropWidth() || this.getImageWidth();
    },

    getHeight: function () {
      return this.getCropHeight() || this.getImageHeight();
    },

    getImageRatioX: function () {
      var image = this.getImage();
      if (!image) return 1;
      var simageWidth = this.attrs.width;
      return simageWidth ? image.width / simageWidth : 1;
    },

    getImageRatioY: function () {
      var image = this.getImage();
      if (!image) return 1;
      var simageHeight = this.attrs.height;
      return simageHeight ? image.height / simageHeight : 1;
    },

    progress: function (progress, duration) {
      if (duration === 0) return;

      var width = this.getWidth(),
        height = this.getHeight(),
        [fcropX, fcropY, fcropWidth, fcropHeight] = [
          this.fcropX(),
          this.fcropY(),
          this.fcropWidth() || width,
          this.fcropHeight() || height,
        ],
        [tcropX, tcropY, tcropWidth, tcropHeight] = [
          this.tcropX(),
          this.tcropY(),
          this.tcropWidth() || width,
          this.tcropHeight() || height,
        ];

      if (fcropWidth === tcropWidth && fcropHeight === tcropHeight) return;

      this.r9crop({
        x: fcropX + (tcropX - fcropX) * progress,
        y: fcropY + (tcropY - fcropY) * progress,
        width: fcropWidth + (tcropWidth - fcropWidth) * progress,
        height: fcropHeight + (tcropHeight - fcropHeight) * progress,
      });
    },

    changeCrop: function (cx, cy, cw, ch) {
      var [tcropX, tcropY, tcropWidth, tcropHeight] = [
        this.tcropX(),
        this.tcropY(),
        this.tcropWidth(),
        this.tcropHeight(),
      ];

      this.tcrop({ x: cx, y: cy, width: cw, height: ch });

      if (tcropWidth !== 0 && tcropHeight !== 0) {
        this.fcrop({
          x: tcropX,
          y: tcropY,
          width: tcropWidth,
          height: tcropHeight,
        });
      }
    },

    setState: function (state) {
      this.state = state;
      if (state === this.state1) this.image = this.image1;
      if (state === this.state2) this.image = this.image2;
    },

    setTwoStates: function (state1, image1, func1, state2, image2, func2) {
      this.state1 = state1;
      this.image1 = image1;
      this.func1 = func1;
      this.state2 = state2;
      this.image2 = image2;
      this.func2 = func2;
      this.setState(state1);
      this._setupTwoStateHandlers();
    },

    _setupTwoStateHandlers: function () {
      this.on("tap click", function () {
        if (this.state === this.state1) {
          this.func1();
          this.setState(this.state2);
        } else if (this.state === this.state2) {
          this.func2();
          this.setState(this.state1);
        }
      });
    },
  };

  Kinetic.Util.extend(Kinetic.SImage, Kinetic.Shape);

  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "image");
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "duration", 0);

  Kinetic.Factory.addComponentsGetterSetter(Kinetic.SImage, "crop", [
    "x",
    "y",
    "width",
    "height",
  ]);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "cropX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "cropY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "cropWidth", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "cropHeight", 0);

  Kinetic.Factory.addComponentsGetterSetter(Kinetic.SImage, "r9crop", [
    "x",
    "y",
    "width",
    "height",
  ]);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "r9cropX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "r9cropY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "r9cropWidth", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "r9cropHeight", 0);

  Kinetic.Factory.addComponentsGetterSetter(Kinetic.SImage, "fcrop", [
    "x",
    "y",
    "width",
    "height",
  ]);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "fcropX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "fcropY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "fcropWidth", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "fcropHeight", 0);

  Kinetic.Factory.addComponentsGetterSetter(Kinetic.SImage, "tcrop", [
    "x",
    "y",
    "width",
    "height",
  ]);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "tcropX", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "tcropY", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "tcropWidth", 0);
  Kinetic.Factory.addGetterSetter(Kinetic.SImage, "tcropHeight", 0);

  Kinetic.Collection.mapMethods(Kinetic.SImage);
})();
