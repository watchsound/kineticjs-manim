
var normalizeString = function (content) {
    if (content)
        return content.replace(/r9newline/g, '\n').replace(/r9apostrophe/g, "'").replace(/r9backslash/g, "\\").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    else
        return content;
}
var _r9norm = function (content) {
    return normalizeString(content);
}


var r9figure = function (properties) {
    var newpropertis = {};
    for (var key in properties) {
        newpropertis[fromShortTag(key)] = properties[key];
    }
    return newpropertis;
}


var fromShortTag = function (tag) {
    if ("sw" == tag)
        return "strokeWidth";
    if ("sr" == tag)
        return "strokeRed";
    if ("sb" == tag)
        return "strokeBlue";
    if ("sg" == tag)
        return "strokeGreen";
    if ("sa" == tag)
        return "strokeAlpha";
    if ("fpi" == tag)
        return "fillPatternImage";
    if ("fr" == tag)
        return "fillRed";
    if ("fg" == tag)
        return "fillGreen";
    if ("fb" == tag)
        return "fillBlue";
    if ("fal" == tag)
        return "fillAlpha";

    if ("ra" == tag)
        return "radius";
    if ("dr" == tag)
        return "draggable";
    if ( "vdr" == tag )
		return "vertexDraggable";
    if ( "loss" == tag )
		return "lineOffsetStart";
    if ( "lose" == tag )
		return "lineOffsetEnd"; 
    
    
    if ("sed" == tag)
        return "shadowEnabled";
    if ("fs" == tag)
        return "fontStyle";
    if ("aln" == tag)
        return "align";
    if ("ran" == tag)
        return "resumeAnimation";

    if ("dur" == tag)
        return "duration";
    if ("ff" == tag)
        return "fontFamily";
    if ("fsz" == tag)
        return "fontSize";
    if ("opa" == tag)
        return "opacity";
    if ("eas" == tag)
        return "easing";

    if ("w" == tag)
        return "width";

    if ("h" == tag)
        return "height";

    if ("sX" == tag)
        return "startX";
    if ("sY" == tag)
        return "startY";
    if ("eX" == tag)
        return "endX";
    if ("eY" == tag)
        return "endY";
    if ("lh" == tag)
        return "r9lineHeight";

    if ("flgspx" == tag)
        return "fillLinearGradientStartPointX";
    if ("flgspy" == tag)
        return "fillLinearGradientStartPointY";
    if ("flgepx" == tag)
        return "fillLinearGradientEndPointX";
    if ("flgepy" == tag)
        return "fillLinearGradientEndPointY";
    if ("flgcs" == tag)
        return "fillLinearGradientColorStops";
    if ("frgspx" == tag)
        return "fillRadialGradientStartPointX";
    if ("frgspy" == tag)
        return "fillRadialGradientStartPointY";
    if ("frgepx" == tag)
        return "fillRadialGradientEndPointX";
    if ("frgepy" == tag)
        return "fillRadialGradientEndPointY";
    if ("frgsr" == tag)
        return "fillRadialGradientStartRadius";
    if ("frger" == tag)
        return "fillRadialGradientEndRadius";
    if ("frgcs" == tag)
        return "fillRadialGradientColorStops";
    if ("fillp" == tag)
        return "fillPriority";
    if ("sox" == tag)
        return "shadowOffsetX";
    if ("soy" == tag)
        return "shadowOffsetY";
    if ("soxy" == tag)
        return "shadowOffset";
    if ("sob" == tag)
        return "shadowBlur";
    if ("sopc" == tag)
        return "shadowOpacity";
    if ("sdcl" == tag)
        return "shadowColor";
    if ("fwt" == tag)
        return "fontWeight";

    if ("uul" == tag)
        return "useUnderline";
    if ("crs" == tag)
        return "cornerRadius";
    if ("txo" == tag)
        return "textXOffset";
    if ("tyo" == tag)
        return "textYOffset";
    if ("fcs" == tag)
        return "fontColorStr";

    if ("rts" == tag)
        return "r9textstyle";

    if ( "bcs" == tag)
		return "borderColorStr";
	if ( "bgr" == tag ) 
		return "bgRed";
	if ( "bgg" == tag )
		return "bgGreen";
	if ( "bgb" == tag )
		return "bgBlue";
	if ( "bgal" == tag )
		return "bgAlpha";
	if ( "ac" == tag )
		return "anchor";
	if ( "acY" == tag )
		return "anchorY";
	if ( "acX" == tag )
		return "anchorX";
	if ( "lbt" == tag )
		return "lineBorderType";
    if ("bt" == tag)
         return "borderType";
	if ( "fcr" == tag )
		return "fillColor";
	if ( "scr" == tag )
		return "strokeColor";
	if ( "scx" == tag )
		return "scaleX";
	if ( "scy" == tag )
		return "scaleY";
	if ( "pos" == tag )
		return "position";
	if ( "bds" == tag )
		return "'bounds.size'";
	if ( "bdp" == tag )
		return "'bounds.point'";
	if ( "ubd" == tag )
		return "useBackground"; 
    
    
    return tag;
}

 

/** bookmark :    1,  or   name#1 */
function r9parseBookmark(bookmark, loc) {
    if (typeof bookmark === 'number') {
        return loc ? bookmark : '';
    }
    var bmfs = bookmark.split('#');
    if (loc) {
        return bmfs.length == 1 ? parseInt(bmfs[0]) : parseInt(bmfs[1]);
    } else {
        return bmfs.length == 1 ? "" : bmfs[0];
    }
}

