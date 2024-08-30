//  Global Font and Font Height Calculation
var r9_global_font = "FangSong";
var _fs2height = {}; // Cache for font heights
var r9_cloud =
  "m194.59129,18.32957c2.6611,-0.41561 5.67701,-0.78966 8.60423,-0.78966c14.90216,0 26.96582,5.65233 26.96582,12.63463c0,0.78966 -0.17741,1.53777 -0.44352,2.28587l0,0c9.57996,1.87026 18.6277,6.73293 18.18419,11.88652c-0.35481,3.78208 -1.06444,7.81352 -10.02348,11.51247l0,0c7.53979,2.82617 7.71719,12.30214 4.16906,16.2089c-3.63684,4.03144 -10.467,8.14601 -29.62692,11.30467c-7.27368,8.06289 -26.69971,14.83738 -46.48056,14.83738c-8.51552,0 -16.76493,-1.03903 -23.6838,-2.86773l0,0c-7.18497,2.32743 -15.70049,3.65739 -25.10305,3.65739c-16.76493,0 -31.7558,-4.4055 -39.38429,-10.80593l0,0c-19.95825,0 -40.18262,-6.35888 -43.90816,-15.21143l0,0c-17.03104,-2.36899 -29.36081,-9.72534 -29.36081,-18.49477c0,-4.03144 2.5724,-7.77196 7.09627,-10.88905l0,0c-2.39499,-2.28587 -3.72554,-4.90423 -3.72554,-7.60571c0,-9.10192 15.34568,-16.62451 34.4169,-17.28949l0,0c6.47534,-6.06795 19.86955,-10.26563 35.39264,-10.26563c4.25776,0 8.24941,0.29093 12.06366,0.87279l0,0c6.74145,-3.44959 16.58753,-5.61077 27.40934,-5.61077c11.35403,0 21.46621,2.36899 28.29637,6.15107l0,0c5.3222,-1.95338 12.06366,-3.15866 19.24863,-3.15866c14.99087,0.08312 26.96582,4.98735 29.89303,11.63716l0,0z";

function r9_log_console(e) {
  if (window.console) {
    console.error("Error:", e);
    console.log(e.stack);
  }
}

function calFontHeight(fontStyle) {
  try {
    var dv = document.createElement("div");
    dv.appendChild(document.createTextNode("M"));
    dv.setAttribute("style", fontStyle);
    document.body.appendChild(dv);
    var height = dv.offsetHeight;
    document.body.removeChild(dv);
    return height;
  } catch (e) {
    r9_log_console(e);
    return 0;
  }
}

function getFontHeight(ctx, weight = "normal", fsize, fname = r9_global_font) {
  var fontSpec = `${weight} ${fsize} ${fname}`;
  if (_fs2height[fontSpec]) return _fs2height[fontSpec];

  if (ctx) {
    var originalFont = ctx.font;
    ctx.font = fontSpec;
    var height = ctx.measureText("M").width;
    ctx.font = originalFont;
    _fs2height[fontSpec] = height;
    return height;
  } else {
    var height = calFontHeight(fontSpec);
    _fs2height[fontSpec] = height || fsize;
    return height;
  }
}

//Drawing Functions for Borders and Rounded Shapes
function r9_drawLineBorder(ctx, lineType, width, height, corner, borderWidth) {
  if (corner > 0) {
    r9_drawRounded(ctx, 0, 0, width, height, corner, corner);
    return;
  }

  ctx.save();
  ctx.setAttr("lineWidth", borderWidth);

  switch (lineType) {
    case "Single":
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.closePath();
      ctx.stroke();
      break;
    case "Double":
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(
        borderWidth + 3,
        borderWidth + 3,
        width - (borderWidth + 3) * 2,
        height - (borderWidth + 3) * 2
      );
      ctx.closePath();
      ctx.stroke();
      break;
    case "SingleDeco":
      // Additional drawing logic for 'SingleDeco' type...
      break;
    // Other cases like 'SingleSqu', 'DoubleSqu', etc.
  }

  ctx.restore();
}

function r9_drawRounded(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

// Animation Utilities and Polyfills
(function () {
  var r9RAFtime = 0;
  var prefixes = ["webkit", "moz", "ms", "o"];

  var raf = window.requestAnimationFrame;
  var caf = window.cancelAnimationFrame;

  for (var i = 0; i < prefixes.length; i++) {
    if (raf && caf) break;
    var prefix = prefixes[i];
    raf = raf || window[prefix + "RequestAnimationFrame"];
    caf =
      caf ||
      window[prefix + "CancelAnimationFrame"] ||
      window[prefix + "CancelRequestAnimationFrame"];
  }

  if (!raf || !caf) {
    raf = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - r9RAFtime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      r9RAFtime = currTime + timeToCall;
      return id;
    };

    caf = function (id) {
      window.clearTimeout(id);
    };
  }

  window.requestAnimationFrame = raf;
  window.cancelAnimationFrame = caf;
})();

//  Animation for Moving and Resizing Divs
function r9divmove(div, nx, ny, nw, nh, dur, callback) {
  var x = parseInt(div.style.left),
    y = parseInt(div.style.top);
  var w = parseInt(div.style.width),
    h = parseInt(div.style.height);
  var frames = (60.0 * dur) / 1000;

  var dx = typeof nx === "number" ? (parseInt(nx) - x) / frames : 0;
  var dy = typeof ny === "number" ? (parseInt(ny) - y) / frames : 0;
  var dw = typeof nw === "number" ? (parseInt(nw) - w) / frames : 0;
  var dh = typeof nh === "number" ? (parseInt(nh) - h) / frames : 0;

  function animateFrame() {
    if (dx !== 0) div.style.left = parseInt(div.style.left) + dx + "px";
    if (dy !== 0) div.style.top = parseInt(div.style.top) + dy + "px";
    if (dw !== 0) div.style.width = parseInt(div.style.width) + dw + "px";
    if (dh !== 0) div.style.height = parseInt(div.style.height) + dh + "px";
  }

  requestAnimationFrame(function step() {
    animateFrame();
    dur -= 1000 / 60;
    if (dur > 0) requestAnimationFrame(step);
    else if (callback) callback();
  });
}

// URL Parameter Utilities
function r9getURLPara(name) {
  var value = r9getURLPara2(name);
  return value == null ? "" : value;
}

function r9getURLPara2(name) {
  return (
    decodeURIComponent(
      (new RegExp("[?|&]" + name + "=([^&;]+?)(&|#|;|$)").exec(
        location.search
      ) || [null, ""])[1].replace(/\+/g, "%20")
    ) || null
  );
}

//  Tweening and Animation Utilities
// Shrinks or enlarges an object with scaling effects
var r9shrinktwm = function (obj, ttype, callback, layer) {
    if (typeof obj == 'undefined' || obj == null) return;

    if (ttype == 0) {  // Basic shrink and expand animation
        return new Kinetic.Tween({
            node: obj,
            scaleX: obj.scaleX() * 1.2,
            scaleY: obj.scaleY() * 0.8333,
            onFinish: function () {
                new Kinetic.Tween({
                    node: obj,
                    scaleX: obj.scaleX() * 0.8333,
                    scaleY: obj.scaleY() * 1.2,
                    onFinish: function () {
                        new Kinetic.Tween({
                            node: obj,
                            scaleX: obj.scaleX() * 1.2,
                            scaleY: obj.scaleY() * 0.8333,
                            onFinish: function () {
                                new Kinetic.Tween({
                                    node: obj,
                                    scaleX: obj.scaleX() * 0.8333,
                                    scaleY: obj.scaleY() * 1.2,
                                    onFinish: function () {
                                        if (callback) callback();
                                    },
                                    duration: 0.1
                                }).play();
                            },
                            duration: 0.1
                        }).play();
                    },
                    duration: 0.1
                }).play();
            },
            duration: 0.1
        }).play();
    } else if (ttype == 1) {  // Move and scale animation
        // Handle specific animation when ttype == 1
        var offX = obj.width() * obj.scaleX() * 0.1;
        var offY = obj.height() * obj.scaleY() * 0.1;
        var scaleX = obj.scaleX(), scaleY = obj.scaleY();
        return new Kinetic.Tween({
            node: obj,
            x: obj.x() - offX,
            y: obj.y() - offY,
            scaleX: scaleX * 1.2,
            scaleY: scaleY * 1.2,
            onFinish: function () {
                new Kinetic.Tween({
                    node: obj,
                    x: obj.x(),
                    y: obj.y(),
                    scaleX: scaleX,
                    scaleY: scaleY,
                    onFinish: function () {
                        if (callback) callback();
                    },
                    duration: 0.1
                }).play();
            },
            duration: 0.1
        }).play();
    } else if (ttype == 2 && (typeof layer != 'undefined')) {  // Rotate animation
        return new Kinetic.Tween({
            node: obj,
            duration: 0.1,
            onFinish: function () {
                var anim = new Kinetic.Animation(function (frame) {
                    obj.rotate(90 * frame.timeDiff / 1000);
                    if (frame.time > 500) anim.stop();
                }, layer);
                anim.start();
            }
        }).play();
    } else if (ttype == 3 && (typeof layer != 'undefined')) {  // Scaling and positioning animation
        var xoff0 = obj.width() * obj.scaleX() * 0.25, xoff1 = obj.x();
        return new Kinetic.Tween({
            node: obj,
            x: xoff1 - xoff0,
            scaleX: obj.scaleX() * 1.5,
            scaleY: obj.scaleY() * 1.5,
            onFinish: function () {
                new Kinetic.Tween({
                    node: obj,
                    duration: 1,
                    onFinish: function () {
                        new Kinetic.Tween({
                            node: obj,
                            x: xoff1,
                            scaleX: obj.scaleX() * 0.666,
                            scaleY: obj.scaleY() * 0.666,
                            onFinish: function () {
                                if (callback) callback();
                            },
                            duration: 0.3
                        }).play();
                    }
                }).play();
            },
            duration: 0.3
        }).play();
    } else {
        return new Kinetic.Tween({ node: obj, onFinish: function () { if (callback) callback(); } }).play();
    }
};

// Handles animation effects such as flipping, curling, scaling, and moving
var r9twnrm = function (obj, dur, etype, easingname) {
    if (typeof obj == 'undefined' || obj == null) return;
    etype = etype || 0;
    easingname = easingname || 'Linear';
    
    if (easingname === 'Shrinking') {
        var tween = r9shrinktwm(obj, 0, function () { r9twnrm(tweens, obj, dur, etype, 'Linear') });
        return;
    }
    easingname = Kinetic.Easings[easingname];

    if (etype == 13) etype = Math.floor(Math.random() * 10);
    if (etype == 0) {  // Opacity change and removal
        new Kinetic.Tween({
            node: obj,
            opacity: 0.8,
            strokeAlpha: 0.5,
            onFinish: function () {
                obj.dash([3, 3]);
                new Kinetic.Tween({
                    node: obj,
                    opacity: 0,
                    strokeAlpha: 0,
                    onFinish: function () { obj.remove(); },
                    duration: dur * 0.8
                }).play();
            },
            duration: dur * 0.2
        }).play();
    }
    // Additional etype cases for other animation effects...
};

// Creates a Kinetic.Tween instance for a node with specified properties
var tween_r9figure = function (node, properties) {
    var newpropertis = { node: node };
    for (var key in properties) {
        newpropertis[fromShortTag(key)] = properties[key];
    }
    return new Kinetic.Tween(newpropertis);
};

// Adds tween animations to an array for execution
var r9tween = function (tweens, properties, useobj) {
    if (!useobj) {
        var newpropertis = {};
        for (var key in properties) {
            if (key == 'node' && !properties[key]) return;
            newpropertis[fromShortTag(key)] = properties[key];
        }
        tweens.push(new Kinetic.Tween(newpropertis));
    } else {
        tweens.push(properties);
    }
};

// A simplified version to add a fade-in animation to the array
var r9tween2 = function (tweens, obj, useobj) {
    if (obj) r9tween(tweens, { node: obj, opa: 1, dur: 1 }, useobj);
};

// Animates a node to rotate around a point (cx, cy) using a custom timer
var r9indi_rotate = function (node, config, ptimer) {
    var dur = config.dur, stime = config.stime, cx = config.cx,
        cy = config.cy, angle = config.angle;
    ptimer.addAni(node, function (progress, duration, times) {
        node.setAnchorX(cx);
        node.setAnchorY(cy);
        node.setRotation(angle * progress);
    }, stime, dur, true, 0, false, function () { });
};

// Animates a node to move along a given path using path data
var r9indi_movealongpath = function (node, alongpath, config, ptimer) {
    var dur = config.dur, stime = config.stime, pathStr = alongpath.toPathString(),
        pathdata = alongpath.toPathData(), cxt = ptimer.layer.getContext();
    var path = new Kinetic.Path({
        x: 0,
        y: 0,
        data: pathStr,
        opacity: 0
    });
    var length = Kinetic.Util.getPathDataLength(pathdata);
    ptimer.addAni(node, function (progress, duration, times) {
        if (path.parent == null) {
            ptimer.layer.add(path);
        }
        var p = Kinetic.Util.getPointAt(pathdata, length * progress);
        node.setX(p.x);
        node.setY(p.y);
    }, stime, dur, true, 0, false, function () {
        path.remove();
    });
};

// Path and Drawing Calculations
// Calculates the path for drawing lines with a specified progress and duration
r9_drawLinePath = function (points, length, progress, duration, lastPoint) {
    var tp, len, n, endX = -1, endY = -1, curdata = [];

    var totallen = 0, px = points[0], py = points[1], acclen = [];
    for (n = 0; n < length; n += 2) {
        totallen += Math.sqrt((px - points[n]) * (px - points[n]) + (py - points[n + 1]) * (py - points[n + 1]));
        acclen.push(totallen);
    }
    var proglen = totallen * progress;
    curdata.push(points[0]);
    curdata.push(points[1]);
    for (var n = 0; n < acclen.length; n++) {
        if (acclen[n] <= proglen) {
            curdata.push(points[2 * n + 2]);
            curdata.push(points[2 * n + 3]);
            if (n + 1 > lastPoint) {
                lastPoint = (n + 1);
                endX = points[2 * n + 2];
                endY = points[2 * n + 3];
                break;
            }
        } else {
            var flen = acclen[n] - acclen[n - 1];
            var plen = proglen - acclen[n - 1];
            endX = points[2 * n] + (points[2 * n + 2] - points[2 * n]) * plen / flen;
            endY = points[2 * n + 1] + (points[2 * n + 3] - points[2 * n + 1]) * plen / flen;
            curdata.push(endX);
            curdata.push(endY);
            break;
        }
    }
    if (curdata.length == 2) return { lastPoint: lastPoint };

    if (endX < 0 && endY < 0) {
        endX = points[points.length - 2];
        endY = points[points.length - 1];
    }
    return { tp: tp, len: len, n: n, endX: endX, endY: endY, curdata: curdata, lastPoint: lastPoint };
};

// Additional Drawing Utilities
// Formats a numeric value as a string with proper decimal placement and signs
r9_formatTicker = function (amount) {
    var i = parseFloat(amount);
    if (isNaN(i)) { i = 0; }
    var minus = '';
    if (i < 0) { minus = '-'; }
    i = Math.abs(i);
    i = parseInt((i + .005) * 100);
    i = i / 100;
    s = new String(i);
    if (s.indexOf('.') < 0) { }
    else if (s.indexOf('.') == (s.length - 2)) { s += '0'; }
    s = minus + s;
    return s;
};
