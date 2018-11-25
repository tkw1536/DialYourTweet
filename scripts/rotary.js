var rotateDial = function(rotary, event, hole) {
  var rotation = getRotationDegrees(hole.parent());
  var offset = (55 - getRotationDegrees(hole.parent()) + 360) % 360;
  var pageX = event.pageX || event.originalEvent.touches[0].pageX;
  var pageY = event.pageY || event.originalEvent.touches[0].pageY;
  var x = pageX - rotary.offset().left - rotary.width()/2;
  var y = -1*(pageY - rotary.offset().top - rotary.height()/2);
  var theta = Math.atan2(y,x) * (180/Math.PI);
  var cssDegs = convertThetaToCssDegs(theta, rotation);
  var dial = rotary.find('.dial');

  if (cssDegs > (offset + 55) || cssDegs < 0 || cssDegs < getRotationDegrees(dial)) {
    return;
  }

  var rotate = 'rotate(' +cssDegs + 'deg)';
  dial.css({'transform' : rotate, '-webkit-transform': rotate, '-moz-transform': rotate, '-ms-transform': rotate});
};

var makeTweet = function(text) {
  window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text));
}

var convertThetaToCssDegs = function(theta, rotation) {
  var cssDegs = (90 - theta - rotation);
  cssDegs = (cssDegs + 360) % 360;
  return cssDegs;
};

var getRotationDegrees = function(obj) {
  var angle;
  var el = obj[0];
  var st = window.getComputedStyle(el, null);

  var matrix = st.getPropertyValue("-webkit-transform") ||
               st.getPropertyValue("-moz-transform") ||
               st.getPropertyValue("-ms-transform") ||
               st.getPropertyValue("-o-transform") ||
               st.getPropertyValue("transform");

  if (matrix !== 'none') {
      var values = matrix.split('(')[1].split(')')[0].split(',');
      var a = values[0];
      var b = values[1];
      angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
  } else {
    angle = 0;
  }

  return (angle < 0) ? angle + 360 : angle;
};

var totalCount = 0;

var calculateNum = function(input, dial) {
  var base = 40;
  var interval = 30;
  var deg = getRotationDegrees(dial);
  var num = 0;

  if (deg < base) return;
  else if (deg < base + 1*interval) {num = 1;}
  else if (deg < base + 2*interval) {num = 2;}
  else if (deg < base + 3*interval) {num = 3;}
  else if (deg < base + 4*interval) {num = 4;}
  else if (deg < base + 5*interval) {num = 5;}
  else if (deg < base + 6*interval) {num = 6;}
  else if (deg < base + 7*interval) {num = 7;}
  else if (deg < base + 8*interval) {num = 8;}
  else if (deg < base + 9*interval) {num = 9;}

  return num;
};

var lastnum = -1;
var newnum = 0;
var lastTime = new Date();
var timeoutSecs = 5;

var hasTimedOut = function () {
    if ( Math.floor((new Date() - lastTime)/1000 > timeoutSecs) || lastnum != newnum ) {
      return true;
    } else {
      return false;
    }
};

var extendTimeout = function () {
  lastTime = new Date();
};

var numMapper = function (input) {
  newnum = input
  if (lastnum == -1) {
    lastnum = input
  }
  mapping = {
    1: ['1', '.'],
    2: ['2', 'a', 'b', 'c'],
    3: ['3', 'd', 'e', 'f'],
    4: ['4', 'g', 'h', 'i'],
    5: ['5', 'j', 'k', 'l'],
    6: ['6', 'm', 'n', 'o'],
    7: ['7', 'p', 'q', 'r', 's'],
    8: ['8', 't', 'u', 'v', 's'],
    9: ['9', 'w', 'x', 'y', 'z'],
    0: ['0', ' ', '+'],
  };
  if (hasTimedOut()) {
    if (newnum == lastnum) {
      totalCount = 0;
    } else {
      totalCount = 1;
    }
    lastnum = newnum;
    extendTimeout();
    return {"char": mapping[input][0], "hasTimedOut": true};
  } else {
    res = mapping[input][totalCount % mapping[input].length];
    lastnum = newnum;
    totalCount += 1;
    extendTimeout();
    return {"char": res, "hasTimedOut": false};
  }
};

var init = function() {
  $('.controls').show();
  $('body').removeClass('nojs');

  $('[data-rotary]').each(function() {
    var input = $(this);
    var parent = $(input.attr('data-rotary'));
    var rotary = parent.find(".rotary");

    rotary.on('mousedown touchstart', '.hole', function(e) {
      e.preventDefault();

      var dial = rotary.find('.dial');
      var hole = $(this);

      if (getRotationDegrees(dial) !== 0) {
        return;
      }

      dial.removeClass('smooth');

      $('body').on('mousemove touchmove', function(e) {
        rotateDial(rotary, e, hole);
      });

      $(document).one('mouseup touchend', function() {
        var num = calculateNum(input, dial);
        result = numMapper(num);
        res = result["char"]
        isTimedOut = result["hasTimedOut"];
        if (!isTimedOut) {
          $('body').off('mousemove touchmove');
          dial.addClass('smooth').attr('style', '');
          console.log("did not time out ", res)
          dial.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
            value = 	input.val().substring(0, input.val().length-1);
            input.val("" + value + res).change();
          });
        } else {
          $('body').off('mousemove touchmove');
          console.log("time out ", res)
          dial.addClass('smooth').attr('style', '');
          dial.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
            input.val("" + input.val() + res).change();
          });
        }
      });
    });

    input.on('change', function() {
      var number = input.val();

      if (number.length === 0) {
        $('#call').removeAttr("href");
      } else {
        $('#call').attr("href", "tel:" + number);
      }
    });
  });
};

$(document).ready(function() {
  init();
});
