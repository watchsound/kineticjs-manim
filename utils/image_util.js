 //1. Mask Handling Utilities
 // Splits an image into smaller boxes and returns them as Kinetic.SImage instances
var _mask_k_getImageBoxes = function (onode, topleft, kimage) {
    if (!kimage) return [];
    var _m_boxCols = 10, _m_boxRows = 10;
    var kiw = kimage.width;
    
    // Adjust box columns based on image width
    if (kiw >= 800) _m_boxCols = 20;
    else if (kiw > 600) _m_boxCols = 18;
    else if (kiw > 400) _m_boxCols = 16;
    else if (kiw > 200) _m_boxCols = 14;
    else if (kiw > 100) _m_boxCols = 12;
    
    // Adjust box rows based on image height
    kiw = kimage.height;
    if (kiw >= 800) _m_boxRows = 20;
    else if (kiw > 600) _m_boxRows = 18;
    else if (kiw > 400) _m_boxRows = 16;
    else if (kiw > 200) _m_boxRows = 14;
    else if (kiw > 100) _m_boxRows = 12;

    var boxList = [];
    var boxWidth = Math.round(kimage.width / _m_boxCols),
        boxHeight = Math.round(kimage.height / _m_boxRows);
    
    // Loop through rows and columns to create image boxes
    for (var rows = 0; rows < _m_boxRows; rows++) {
        for (var cols = 0; cols < _m_boxCols; cols++) {
            var nimage = new Kinetic.SImage({
                image: kimage,
                x: topleft.x,
                width: kimage.width,
                y: topleft.y,
                height: kimage.height,
                scaleX: topleft.scaleX,
                scaleY: topleft.scaleY
            });

            // Define crop areas for image boxes
            if (cols === _m_boxCols - 1) {
                nimage.cropX(boxWidth * cols);
                nimage.cropY(boxHeight * rows);
                nimage.cropWidth(kimage.width - boxWidth * cols);
                nimage.cropHeight(boxHeight);
            } else {
                nimage.cropX(boxWidth * cols);
                nimage.cropY(boxHeight * rows);
                nimage.cropWidth(boxWidth);
                nimage.cropHeight(boxHeight);
            }
            boxList.push(nimage);
        }
    }
    return { list: boxList, width: boxWidth, height: boxHeight, cols: _m_boxCols, rows: _m_boxRows };
};

// Handle Image Strips
var _mask_getImageStrips = function (onode, topleft, kimage, horizontal) {
  if (!kimage) return [];
  var _m_boxCols = 5,
    _m_boxRows = 5,
    boxWidth,
    boxHeight;
  var boxList = [];
  var kiw = horizontal ? kimage.width : kimage.height;

  // Determine the number of boxes based on image size
  if (kiw >= 800) _m_boxCols = 40;
  else if (kiw > 600) _m_boxCols = 35;
  else if (kiw > 400) _m_boxCols = 25;
  else if (kiw > 200) _m_boxCols = 16;
  else if (kiw > 100) _m_boxCols = 12;
  else _m_boxCols = 8;

  if (horizontal) {
    var imgwidth = kimage.width;
    boxWidth = Math.round(imgwidth / _m_boxCols);
    boxHeight = Math.round(kimage.height);

    if (Math.random() > 0.3) {
      // Create image strips dynamically with random behavior
      var curx = 0,
        curw = 2,
        fright = Math.random() > 0.5;
      if (fright) curx = imgwidth - curw;

      while (curx < imgwidth && curx >= 0) {
        var nimage = new Kinetic.SImage({
          image: kimage,
          x: topleft.x,
          width: imgwidth,
          y: topleft.y,
          height: kimage.height,
          scaleX: topleft.scaleX,
          scaleY: topleft.scaleY,
        });

        curw += 1;
        if (!fright) {
          if (curx + curw > imgwidth) {
            curw = imgwidth - curx;
          }
        }

        nimage.cropX(curx);
        nimage.cropY(0);
        nimage.cropWidth(curw);
        nimage.cropHeight(boxHeight);
        boxList.push(nimage);

        if (fright) {
          if (curx > 0 && curx < curw) {
            curw = curx;
            curx = 0;
          } else {
            curx -= curw;
          }
        } else {
          curx += curw;
        }
      }
    } else {
      // Create image strips normally
      for (var cols = 0; cols < _m_boxCols; cols++) {
        var nimage = new Kinetic.SImage({
          image: kimage,
          x: topleft.x,
          width: imgwidth,
          y: topleft.y,
          height: kimage.height,
          scaleX: topleft.scaleX,
          scaleY: topleft.scaleY,
        });

        if (cols === _m_boxCols - 1) {
          nimage.cropX(boxWidth * cols);
          nimage.cropY(0);
          nimage.cropWidth(kimage.width - boxWidth * cols);
          nimage.cropHeight(boxHeight);
        } else {
          nimage.cropX(boxWidth * cols);
          nimage.cropY(0);
          nimage.cropWidth(boxWidth);
          nimage.cropHeight(boxHeight);
        }
        boxList.push(nimage);
      }
    }
  } else {
    // Create vertical strips
    _m_boxRows = _m_boxCols;
    boxWidth = Math.round(kimage.width);
    boxHeight = Math.round(kimage.height / _m_boxRows);

    for (var rows = 0; rows < _m_boxRows; rows++) {
      var nimage = new Kinetic.SImage({
        image: kimage,
        x: topleft.x,
        width: kimage.width,
        y: topleft.y,
        height: kimage.height,
        scaleX: topleft.scaleX,
        scaleY: topleft.scaleY,
      });

      if (rows === _m_boxRows - 1) {
        nimage.cropX(0);
        nimage.cropY(boxHeight * rows);
        nimage.cropWidth(boxWidth);
        nimage.cropHeight(kimage.height - boxHeight * rows);
      } else {
        nimage.cropX(0);
        nimage.cropY(boxHeight * rows);
        nimage.cropWidth(boxWidth);
        nimage.cropHeight(boxHeight);
      }
      boxList.push(nimage);
    }
  }

  return {
    list: boxList,
    width: boxWidth,
    height: boxHeight,
    cols: _m_boxCols,
    rows: _m_boxRows,
  };
};

//Image Transition Utilities
 // Handles background transition with two images
var _mask_r9ImgBgTransMask = function (alay, kimage, topleft, duration, transType, kimage2, duration2, transType2, useForground) {
    var callback = {};
    var count = 2;
    if (!kimage || transType == 11) count--;
    if (!kimage2) count--;
    if (count <= 0) return;

    callback.onStart = function () { };
    callback.onEnd = function () {
        count--;
        if (count == 0) {
            if (transType == 11) {
                kimage.remove();
            }
            if (useForground) {
                alay.moveDown();
            }
        }
    };

    if (useForground) alay.moveUp();
    if (transType != 11 && kimage) {
        _mask_k_handleImageTransition2(alay, kimage, topleft, kimage.image(), 0, duration, transType, false, true, callback);
    }
    if (kimage2) {
        _mask_k_handleImageTransition2(alay, kimage2, topleft, kimage2.image(), 0, duration2, transType2, true, false, callback);
    }
};

// . Handle Image Transitions
var _mask_k_handleImageTransition = function (
  contentlay,
  onode,
  topleft,
  duration,
  transitionType,
  isCreation,
  removeNode,
  callback
) {
  var offset = 0;
  onode.toImage({
    x: isCreation ? topleft.x - offset : topleft.x,
    y: topleft.y,
    callback: function (image) {
      _mask_k_handleImageTransition2(
        contentlay,
        onode,
        topleft,
        image,
        offset,
        duration,
        transitionType,
        isCreation,
        removeNode,
        callback
      );
    },
  });
};

var _mask_k_handleImageTransition2 = function (
  contentlay,
  onode,
  topleft,
  image,
  xoffset,
  duration,
  transitionType,
  isCreation,
  removeNode,
  callback
) {
  var boxList, boxWidth, boxHeight, result;
  var _m_boxCols = 5,
    _m_boxRows = 5;

  topleft.scaleX = onode.width() / image.width;
  topleft.scaleY = onode.height() / image.height;

  if (transitionType < 7 || transitionType == 12) {
    result = _mask_k_getImageBoxes(onode, topleft, image);
  } else if (transitionType == 7 || transitionType == 8) {
    result = _mask_getImageStrips(onode, topleft, image, transitionType == 7);
  } else if (transitionType == 11) {
    // delay
    result = { list: [], width: 1, height: 1, cols: 0, rows: 0 };
  } else {
    return;
  }

  // More methods can follow here...
};

