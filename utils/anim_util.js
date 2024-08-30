// Utility function to create a Kinetic.Tween
function createTween(config) {
  return new Kinetic.Tween(config);
}

// Helper function to animate node scaling
function animateScaling(obj, scaleX, scaleY, duration, onFinish) {
  return createTween({
    node: obj,
    scaleX: scaleX,
    scaleY: scaleY,
    duration: duration,
    onFinish: onFinish,
  }).play();
}

// Helper function to animate node translation and scaling
function animateMoveAndScale(obj, x, y, scaleX, scaleY, duration, onFinish) {
  return createTween({
    node: obj,
    x: x,
    y: y,
    scaleX: scaleX,
    scaleY: scaleY,
    duration: duration,
    onFinish: onFinish,
  }).play();
}
var r9shrinktwm = function (obj, ttype, callback, layer) {
  if (!obj) return;

  if (ttype === 0) {
    // Scaling animation sequence for type 0
    return animateScaling(
      obj,
      obj.scaleX() * 1.2,
      obj.scaleY() * 0.8333,
      0.1,
      function () {
        animateScaling(
          obj,
          obj.scaleX() * 0.8333,
          obj.scaleY() * 1.2,
          0.1,
          function () {
            animateScaling(
              obj,
              obj.scaleX() * 1.2,
              obj.scaleY() * 0.8333,
              0.1,
              function () {
                animateScaling(
                  obj,
                  obj.scaleX() * 0.8333,
                  obj.scaleY() * 1.2,
                  0.1,
                  callback
                );
              }
            );
          }
        );
      }
    );
  } else if (ttype === 1) {
    // Scaling and translation animation sequence for type 1
    var x = typeof obj.x === "function" ? obj.x() : obj.x;
    var y = typeof obj.y === "function" ? obj.y() : obj.y;
    var width = obj.width ? obj.width() : obj.width;
    var height = obj.height ? obj.height() : obj.height;

    var offX = width * obj.scaleX() * 0.1;
    var offY = height * obj.scaleY() * 0.1;
    var scaleX = obj.scaleX();
    var scaleY = obj.scaleY();

    return animateMoveAndScale(
      obj,
      x - offX,
      y - offY,
      scaleX * 1.2,
      scaleY * 1.2,
      0.1,
      function () {
        animateMoveAndScale(obj, x, y, scaleX, scaleY, 0.1, function () {
          animateMoveAndScale(
            obj,
            x - offX,
            y - offY,
            scaleX * 1.2,
            scaleY * 1.2,
            0.1,
            function () {
              animateMoveAndScale(obj, x, y, scaleX, scaleY, 0.1, callback);
            }
          );
        });
      }
    );
  } else if (ttype === 2 && layer) {
    // Rotation animation for type 2
    return createTween({
      node: obj,
      duration: 0.1,
      onFinish: function () {
        var anim = new Kinetic.Animation(function (frame) {
          obj.rotate((90 * frame.timeDiff) / 1000);
          if (frame.time > 500) anim.stop();
        }, layer);
        anim.start();
      },
    }).play();
  } else if (ttype === 3 && layer) {
    // Scaling and translation animation for type 3
    var xOffset = obj.width() * obj.scaleX() * 0.25;
    return animateMoveAndScale(
      obj,
      obj.x() - xOffset,
      obj.scaleX() * 1.5,
      obj.scaleY() * 1.5,
      0.3,
      function () {
        createTween({
          node: obj,
          duration: 1,
          onFinish: function () {
            animateMoveAndScale(
              obj,
              obj.x(),
              obj.scaleX() * 0.666,
              obj.scaleY() * 0.666,
              0.3,
              callback
            );
          },
        }).play();
      }
    );
  } else {
    // Default animation with callback
    return createTween({
      node: obj,
      onFinish: callback,
    }).play();
  }
};

// Remove object tween function
var r9twnrm = function (obj, dur, etype, easingname) {
  if (!obj) return;

  etype = etype || 0;
  easingname = Kinetic.Easings[easingname] || Kinetic.Easings.Linear;

  if (etype === 13) etype = Math.floor(Math.random() * 10);

  var tweenConfig = { node: obj, duration: dur, easing: easingname };

  switch (etype) {
    case 0:
      tweenConfig.opacity = 0.8;
      tweenConfig.strokeAlpha = 0.5;
      tweenConfig.onFinish = function () {
        obj.dash([3, 3]);
        createTween({
          node: obj,
          opacity: 0,
          strokeAlpha: 0,
          duration: dur * 0.8,
          onFinish: function () {
            obj.remove();
          },
        }).play();
      };
      break;
    case 1:
    case 2:
      var scale = etype === 1 ? 9 : 0.00001;
      tweenConfig.scaleX = scale;
      tweenConfig.scaleY = scale;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
    case 3:
    case 4:
      var y = etype === 3 ? obj.x() || -500 : obj.x ? 1000 - obj.x : 1000;
      tweenConfig.y = y;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
    case 5:
    case 6:
      var x = etype === 5 ? obj.x() || -500 : obj.x ? 1000 - obj.x : 1000;
      tweenConfig.x = x;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
    case 9: // Flip
      tweenConfig.scaleX = 0.00001;
      tweenConfig.x = obj.getX() + obj.getWidth() / 2;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
    case 10: // Curl Right
      tweenConfig.scaleX = 0.00001;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
    case 11: // Curl Down
      tweenConfig.scaleY = 0.00001;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
    default:
      tweenConfig.opacity = 0.1;
      tweenConfig.onFinish = function () {
        obj.remove();
      };
      break;
  }

  createTween(tweenConfig).play();
};

var tween_r9figure = function (node, properties) {
  var newProperties = { node: node };
  for (var key in properties) {
    newProperties[fromShortTag(key)] = properties[key];
  }
  return createTween(newProperties);
};

var r9tween = function (tweens, properties, useObj) {
  var newProperties = {};
  for (var key in properties) {
    if (key === "node" && !properties[key]) return;
    newProperties[fromShortTag(key)] = properties[key];
  }
  tweens.push(useObj ? properties : createTween(newProperties));
};

var r9indi_rotate = function (node, config, ptimer) {
  ptimer.addAni(
    node,
    function (progress) {
      node.setAnchorX(config.cx);
      node.setAnchorY(config.cy);
      node.setRotation(config.angle * progress);
    },
    config.stime,
    config.dur,
    true,
    0,
    false,
    function () {}
  );
};

var r9indi_movealongpath = function (node, alongpath, config, ptimer) {
  var path = new Kinetic.Path({ data: alongpath.toPathString(), opacity: 0 });
  var length = Kinetic.Util.getPathDataLength(alongpath.toPathData());

  ptimer.addAni(
    node,
    function (progress) {
      if (!path.parent) ptimer.layer.add(path);
      var p = Kinetic.Util.getPointAt(
        alongpath.toPathData(),
        length * progress
      );
      node.setX(p.x);
      node.setY(p.y);
    },
    config.stime,
    config.dur,
    true,
    0,
    false,
    function () {
      path.remove();
    }
  );
};
