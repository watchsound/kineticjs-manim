(function () {
  Kinetic.R9Scratch = function (config) {
    this.___init(config);
  };

  Kinetic.R9Scratch.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Scratch";
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
      const {
        duration,
        progressvalue,
        total,
        useAnimationBall,
        animationBallColor,
        animationBallColor2,
        widthcolors,
        data,
      } = this;
      const colors = widthcolors ? widthcolors.split("|") : [];
      const pathlist = data.split("|");

      context.setAttr("lineWidth", this.strokeWidth());
      this.fillEnabled(false);

      var needToPaint =
        duration && !useAnimationBall
          ? Math.ceil(total * progressvalue)
          : total;

      this._drawPaths(context, pathlist, colors, needToPaint);

      if (useAnimationBall && duration > 0) {
        this._drawAnimatedBall(
          context,
          pathlist,
          total,
          progressvalue,
          animationBallColor,
          animationBallColor2
        );
      }

      this.drawSelectionMarker(context);
    },

    _drawPaths: function (context, pathlist, colors, needToPaint) {
      var count = 0;

      pathlist.forEach((apath, j) => {
        if (colors.length > j) {
          const wc = colors[j].split(";");
          context.setAttr("strokeStyle", wc[1]);
          context.setAttr("lineWidth", parseInt(wc[0]));
        }
        context.beginPath();

        const pointsData = apath.split(",");
        pointsData.forEach((point, i) => {
          if (i % 2 === 0) {
            i === 0
              ? context.moveTo(pointsData[i], pointsData[i + 1])
              : context.lineTo(pointsData[i], pointsData[i + 1]);
            count++;
            if (count > needToPaint) return;
          }
        });

        context.stroke(this);
      });
    },

    _drawAnimatedBall: function (
      context,
      pathlist,
      total,
      progressvalue,
      animationBallColor,
      animationBallColor2
    ) {
      var count = 0;
      const needToPaint = total * progressvalue;
      this.fillEnabled(false);
      context.beginPath();
      if (animationBallColor) {
        context.setAttr("fillStyle", animationBallColor);
        context.setAttr("strokeStyle", animationBallColor);
      }

      var ballx = 0,
        bally = 0;

      pathlist.forEach((apath) => {
        const pointsData = apath.split(",");
        pointsData.forEach((point, i) => {
          if (i % 2 === 0) {
            count++;
            if (count > needToPaint) {
              ballx = pointsData[i];
              bally = pointsData[i + 1];
              return;
            }
          }
        });
      });

      context.stroke(this);
      if (ballx && bally) {
        this._drawGradientBall(
          context,
          ballx,
          bally,
          animationBallColor,
          animationBallColor2
        );
      }
    },

    _drawGradientBall: function (
      context,
      ballx,
      bally,
      animationBallColor,
      animationBallColor2
    ) {
      context.save();
      const gradient = context.createRadialGradient(0, 0, 3, 0, 0, 6);
      gradient.addColorStop(0, animationBallColor);
      gradient.addColorStop(1, animationBallColor2 || animationBallColor);
      context.fillStyle = gradient;
      context.setAttr("fillStyle", gradient);
      context.beginPath();
      context.arc(ballx, bally, 6, 0, 2 * Math.PI, false);
      context.fill(this);
      context.restore();
    },

    toPathString: function () {
      const pathlist = this.data().split("|");
      return pathlist
        .map((apath) => {
          const pointsData = apath.split(",");
          return pointsData.reduce((acc, point, i) => {
            return i % 2 === 0
              ? acc + ` ${i === 0 ? "M" : "L"} ${point} ${pointsData[i + 1]}`
              : acc;
          }, "");
        })
        .join("");
    },
  };

  Kinetic.Util.extend(Kinetic.R9Scratch, Kinetic.Shape);

  // Add getters and setters
  const properties = [
    "startX",
    "startY",
    "width",
    "height",
    "data",
    "total",
    "widthcolors",
    "duration",
    "resumeAnimation",
    "strokeRed",
    "strokeGreen",
    "strokeBlue",
    "strokeWidth",
    "animationColorAll",
    "useAnimationBall",
    "animationBallColor",
    "animationBallColor2",
  ];
  properties.forEach((prop) =>
    Kinetic.Factory.addGetterSetter(
      Kinetic.R9Scratch,
      prop,
      prop === "total" ? 1 : 0
    )
  );

  Kinetic.Collection.mapMethods(Kinetic.R9Scratch);
})();
