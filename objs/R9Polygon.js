(function () {
  Kinetic.R9Polygon = function (config) {
    this.___init(config);
  };

  Kinetic.R9Polygon.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "R9Polygon";

      this.on(
        "pointsChange.kinetic tensionChange.kinetic closedChange.kinetic",
        function () {
          this._clearCache("tensionPoints");
        }
      );

      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _sceneFunc: function (context) {
      const points = this._getPoints(),
        closed = this.getClosed(),
        duration = this.duration(),
        progressvalue = this.progressvalue(),
        lastPoint = this.lastPoint(),
        useArrow = this.useArrow(),
        animationColorAll = this.animationColorAll(),
        animationBallColor = this.animationBallColor(),
        useAnimationBall = this.useAnimationBall(),
        hideScratch = this.hideScratch();

      var curdata = [],
        endX = -1,
        endY = -1;

      if (duration > 0 && progressvalue > 0) {
        const results = r9_drawLinePath.call(
          this,
          points,
          points.length,
          progressvalue,
          duration,
          lastPoint
        );
        this.lastPoint(results.lastPoint);

        if (results.curdata) {
          curdata = results.curdata;
          endX = results.endX;
          endY = results.endY;
          if (!useAnimationBall) points = curdata;
        }
      }

      if (!hideScratch) {
        this._drawPolygon(context, points, closed, useArrow);
      }

      if (animationColorAll && curdata.length > 1) {
        this._drawAnimationPath(context, curdata, animationBallColor);
      }

      if (useAnimationBall && endX >= 0 && endY >= 0) {
        this._drawAnimationBall(context, endX, endY, animationBallColor);
      }

      this.drawCorrectMarker(context);

      if (hideScratch) {
        this.drawSelectionMarker(context);
      }
    },

    _getPoints: function () {
      var points = this.getPoints();
      if (points.length === 0) {
        points = this.getDataFromProps();
      }
      return points;
    },

    _drawPolygon: function (context, points, closed, useArrow) {
      context.beginPath();
      context.moveTo(points[0], points[1]);
      for (var i = 2; i < points.length; i += 2) {
        context.lineTo(points[i], points[i + 1]);
      }
      if (closed) {
        context.closePath();
        context.fillStrokeShape(this);
      } else {
        context.strokeShape(this);
      }

      if (useArrow && points.length >= 4) {
        this.drawArrowHead(
          context,
          points[points.length - 4],
          points[points.length - 3],
          points[points.length - 2],
          points[points.length - 1]
        );
      }
    },

    _drawAnimationPath: function (context, points, animationBallColor) {
      this.fillEnabled(false);
      context.beginPath();
      if (animationBallColor) {
        context.setAttr("fillStyle", animationBallColor);
        context.setAttr("strokeStyle", animationBallColor);
      }
      context.moveTo(points[0], points[1]);
      for (var i = 2; i < points.length; i += 2) {
        context.lineTo(points[i], points[i + 1]);
      }
      context.stroke(this);
    },

    _drawAnimationBall: function (context, endX, endY, animationBallColor) {
      context.beginPath();
      if (animationBallColor) {
        context.setAttr("fillStyle", animationBallColor);
        context.setAttr("strokeStyle", animationBallColor);
      }
      context.arc(endX, endY, 4, 0, 2 * Math.PI, false);
      context.fill(this);
    },

    drawArrowHead: function (context, startX, startY, endX, endY) {
      const sw = this.getStrokeWidth() || 1;
      const start = new Point(startX, startY);
      const end = new Point(endX, endY);
      const angle = start.calcAngle(end);
      const arrowSize = Math.max(sw * 3, 10);

      const newEnd = end.calcPoint(angle, arrowSize - 5);
      context.beginPath();
      const ap1 = newEnd.calcPoint(angle - 135, arrowSize);
      const ap2 = newEnd.calcPoint(angle + 135, arrowSize);

      context.moveTo(newEnd.x, newEnd.y);
      context.lineTo(ap1.x, ap1.y);
      context.lineTo(ap2.x, ap2.y);
      context.closePath();
      context.fillStrokeShape(this);
    },

    getDataFromProps: function () {
      const data = [];
      const count = this.count();
      for (var i = 1; i <= count; i++) {
        data.push(this[`x${i}`]());
        data.push(this[`y${i}`]());
      }
      return data;
    },
  };

  Kinetic.Util.extend(Kinetic.R9Polygon, Kinetic.Shape);

  // Add getters and setters
  const properties = [
    "useArrow",
    "closed",
    "duration",
    "x1",
    "y1",
    "x2",
    "y2",
    "x3",
    "y3",
    "x4",
    "y4",
    "x5",
    "y5",
    "x6",
    "y6",
    "x7",
    "y7",
    "x8",
    "y8",
    "x9",
    "y9",
    "count",
    "points",
    "animationColorAll",
    "useAnimationBall",
    "lastPoint",
    "animationBallColor",
    "hideScratch",
  ];

  properties.forEach((prop) =>
    Kinetic.Factory.addGetterSetter(Kinetic.R9Polygon, prop, 0)
  );

  Kinetic.Collection.mapMethods(Kinetic.R9Polygon);
})();

(function () {
  Kinetic.GeomPolyFill = function (config) {
    this.___init(config);
  };

  Kinetic.GeomPolyFill.prototype = {
    ___init: function (config) {
      Kinetic.Shape.call(this, config);
      this.className = "GeomPolyFill";
      this.cachedPoses = [];
      this.geomPoints = this.geomPoints || [];
      this.dataArray = [];
      this.sceneFunc(this._sceneFunc.bind(this));
    },

    _sceneFunc: function (context) {
      this.createShapes();
      const progressValue = this.progressvalue();
      if (progressValue >= 0 && progressValue < 1) {
        Kinetic.Util.drawPathByProgress(
          this,
          context,
          this.dataArray,
          progressValue,
          this.forceClose,
          this.strokeOnly
        );
      } else {
        Kinetic.Util.drawPathByData(
          this,
          context,
          this.dataArray,
          this.forceClose
        );
      }
    },

    setupVertices: function (vertices) {
      this.geomPoints = vertices;
      this.createShapes();
    },

    createShapes: function () {
      const cp = this.cachedPoses,
        gp = this.geomPoints,
        count = gp.length;

      if (count === 0) return;

      var dirty = cp.length === 0;

      if (dirty) {
        gp.forEach((pos) => {
          const v = pos.position();
          cp.push({ x: v.x, y: v.y });
        });
      } else {
        for (var i = 0; i < count; i++) {
          const v = gp[i].position();
          if (cp[i].x !== v.x || cp[i].y !== v.y) {
            cp[i] = { x: v.x, y: v.y };
            dirty = true;
          }
        }
      }

      if (dirty) {
        this.dataArray = Kinetic.Util.parsePathData(this._generatePathData(cp));
        this.closed = true;
      }
    },

    _generatePathData: function (poses) {
      return (
        poses.reduce((acc, pos, i) => {
          return acc + `${i === 0 ? "M" : "L"} ${pos.x} ${pos.y} `;
        }, "") + "z"
      );
    },
  };

  Kinetic.Util.extend(Kinetic.GeomPolyFill, Kinetic.Path);
  Kinetic.Factory.addGetterSetter(Kinetic.GeomPolyFill, "geomPoints", []);

  Kinetic.Collection.mapMethods(Kinetic.GeomPolyFill);
})();
