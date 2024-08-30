// 1. Morphing Animation
var r9indi_morphing = function (from, to, config, ptimer, isCreation) {
  var dur = config.dur,
    stime = config.stime,
    fill_color = config.fill_color,
    stroke_color = config.stroke_color,
    closed = config.closed,
    frompathStr = config.frompathStr,
    topathStr = config.topathStr,
    cxt = ptimer.layer.getContext();

  var path = new Kinetic.Path({
    data: frompathStr,
    stroke: stroke_color,
    fill: fill_color,
    todata: topathStr,
    tofill: config.tofill,
    tostroke: config.tostroke,
  });
  path.forceClose = closed;

  ptimer.addAni(
    to,
    function (progress, duration, times) {
      if (path.parent == null) {
        ptimer.layer.add(path);
        path.startMorph();
      }
      path.renderMorphStep(progress);
    },
    stime,
    dur,
    true,
    0,
    false,
    function () {
      if (isCreation) {
        tween_r9figure(to, {
          opa: 1.0,
          dur: 0.1,
          onFinish: function () {
            path.remove();
          },
        }).play();
      } else {
        path.remove();
      }
    }
  );
};

//  Circumscribe Animation
var r9indi_circumscribe = function (node, config, ptimer, isCreation) {
  var dur = config.dur,
    stime = config.stime,
    color = config.color,
    sw = config.sw,
    pathStr = node.toPathString(),
    pathdata = node.toPathData(),
    cxt = ptimer.layer.getContext();

  var path = new Kinetic.Path({
    x: 0,
    y: 0,
    data: pathStr,
    strokeWidth: sw || 1,
    stroke: color,
    fillOpacity: 0,
  });
  path.forceClose = false;
  path.strokeOnly = true;
  path.duration(dur);

  ptimer.addAni(
    node,
    function (progress, duration, times) {
      if (path.parent == null) {
        ptimer.layer.add(path);
      }
      path.progressvalue(progress);
    },
    stime,
    dur,
    true,
    0,
    false,
    function () {
      if (isCreation) {
        tween_r9figure(node, {
          opa: 1.0,
          dur: 0.5,
          onFinish: function () {
            path.remove();
          },
        }).play();
      } else {
        path.remove();
      }
    }
  );
};

// . Focus On Animation
var r9indi_focuson = function (node, config, ptimer) {
  var dur = config.dur,
    stime = config.stime,
    center = node.getCenter();
  ptimer.addOneTimeEvt(
    node,
    function () {
      var circle = new Kinetic.Circle({
        radius: (node.width() + node.height()) / 4,
        fill: "gray",
        fillOpacity: 0.2,
      });
      circle.setCenter(center);
      ptimer.layer.add(circle);
      new Kinetic.Tween({
        node: circle,
        width: 2,
        height: 2,
        onFinish: function () {
          circle.remove();
        },
        duration: dur,
      }).play();
    },
    stime,
    dur,
    true
  );
};

//  Flash Animation
var r9indi_flash = function (node, config, ptimer) {
  var dur = config.dur,
    stime = config.stime,
    fo = node.fillAlpha(),
    fr = config.fr,
    fb = config.fb,
    fg = config.fg,
    fr1 = config.fr1,
    fb1 = config.fb1,
    fg1 = config.fg1,
    fr2 = config.fr2,
    fb2 = config.fb2,
    fg2 = config.fg2,
    times = config.times || 1,
    tgap = dur / times;

  var acct = 0;
  for (var i = 0; i < times; i++) {
    ptimer.addOneTimeEvt(
      node,
      function () {
        var tgap2 = tgap / 3.0;
        new Kinetic.Tween({
          node: node,
          fillRed: fr1,
          fillGreen: fg1,
          fillBlue: fb1,
          onFinish: function () {
            new Kinetic.Tween({
              node: node,
              fillRed: fr2,
              fillGreen: fg2,
              fillBlue: fb2,
              onFinish: function () {
                new Kinetic.Tween({
                  node: node,
                  fillAlpha: fo,
                  fillRed: fr,
                  fillGreen: fg,
                  fillBlue: fb,
                  onFinish: function () {},
                  duration: tgap2,
                }).play();
              },
              duration: tgap2,
            }).play();
          },
          duration: tgap2,
        }).play();
      },
      stime + acct,
      dur,
      true
    );
    acct += tgap;
  }
};

// Indicate Animation
var r9indi_indicate = function (node, config, ptimer) {
  r9indi_focuson(node, config, ptimer);
};

// Show Passing Flash Animation
var r9indi_showpassingflash = function (node, config, ptimer) {
  var dur = config.dur,
    stime = config.stime,
    color = config.color,
    bound = node.renderBounds();

  var line = new Kinetic.R9LineTip({
    fill: color,
    stroke: color,
    strokeWidth: 2,
    startX: bound.x,
    startY: bound.y + bound.h,
    endX: bound.x + bound.w,
    endY: bound.y + bound.h,
  });

  ptimer.addAni(
    node,
    function (progress, duration, times) {
      if (line.parent == null) {
        ptimer.layer.add(line);
        line.duration(dur);
      }
      line.progressvalue(progress);
    },
    stime,
    dur,
    true,
    0,
    false,
    function () {
      line.remove();
    }
  );
};

// Wiggle Animation
var r9indi_wiggle = function (node, config, ptimer) {
  r9indi_circumscribe(node, config, ptimer);
};

// Apply Wave Animation
var r9indi_applywave = function (node, config, ptimer) {
  r9indi_circumscribe(node, config, ptimer);
};
