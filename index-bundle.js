;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var gravatar = require('gravatar')
var concat = require('concat-stream')
var hat = require('hat')

module.exports = function(user) {
  var username = 'anonymous'
  if (user.profile && user.profile.username) username = user.profile.username
  
  var formContainer = $('#default-popup')
  
  $(document)
    .on('click', '.upload-world', openDialog)
    .on('click', '.new-world', openDialog)
    .on('click', '.open-menu', openDialog)
    .on('click', '.menu-buttons .worlds', openWorldsList)
    .on('click', '.open-login', user.persona.identify.bind(user.persona))
    .on('click', '.show-login', showLogin)
    .on('click', '.logout', logout)
    .on('click', '.new-world', showNewWorldForm)
    .on('submit', '.new-world-form', submitNewWorldForm)
    .on('click', '.file-select', function(e) {
      var fileInput = $(e.target).parents('aside').find('input[type="file"]').first()
      fileInput.click()
    })
  
  loadWorldsList(username)
  
  function openDialog() {
    Avgrund.show( "#default-popup" )
  }

  function closeDialog() {
    Avgrund.hide()
  }

  function openWorldsList() {
    loadWorldsList(username, function() {
      Avgrund.show( "#default-popup" )
    })
  }
  
  function loadWorldsList(user, cb) {
    if (!cb) cb = function noop (){}
    var loggedIn = user !== 'anonymous'
    formContainer.html($('.welcome').html())
    if (loggedIn) {
      getGravatar(function(err, url) {
        if (err || !url) return
        formContainer.find('.gravatar').append('<img src="' + url + '">')
      })
    }
    getWorlds(function(err, worlds) {
      if (err) return console.error(err)
      var content = $('.demo-browser-content')
      var title = "Your Worlds"
      if (loggedIn) title = user + "'s Worlds"
      content.html("<h3>" + title + "</h3>")
      var itemHTML = $('.world-item').html()
      if (worlds.length === 0) content.html("You haven't created any worlds yet!")
      worlds.map(function(world) {
        content.append(itemHTML)
        content.find('a:last')
          .attr('href', '/world.html#' + world.id)
        content.find('dt:last').html(world.name)
        content.find('dd:last').text(world.published ? "Published": "Unpublished")
      })
      cb()
    })
  }

  function isLoggedOut() {
    console.log('isLoggedOut')
  }

  function showLogin() {
    formContainer.find('.form').html($('.login-form').html())
  }

  function formField(form, field) {
    return form.find('input[name="' + field + '"]')
  }

  function fieldParent(form, field) {
    var parent = formField(form, field).parents()[0]
    return $(parent)
  }

  function logout() {
    user.persona.unidentify.bind(user.persona)
  }
  
  function getWorlds(cb) {
    var worldStream = user.db.sublevel('worlds').createValueStream()
    var sentError
    worldStream.pipe(concat(function(worlds) {
      if (!worlds) worlds = []
      if (!sentError) cb(false, worlds)
    }))
    worldStream.on('error', function(err) {
      sentError = true
      cb(err)
    })
  }

  function getGravatar(cb) {
    user.db.get('profile', function(err, profile) {
      if (err) return cb(err)
      if (!profile) return cb(false, false)
      var email = profile.email
      if (!email) return cb(false, false)
      var gravURL = gravatar.url(email, {s: '200', r: 'pg', d: 'retro'})
      cb(false, gravURL)
    })
  }
  
  function showNewWorldForm(e) {
    $('.demo-browser-content').html($('.new-world-form').html())
  }
  
  function submitNewWorldForm(e) {
    e.preventDefault()
    var worldName = $(e.target).find('#world-name').val()
    var submit = $(e.target).find('input[type="submit"]')
    submit.hide()
    var uuid = hat()
    var world = {id: uuid, name: worldName, published: false}
    user.db.sublevel('worlds').put(uuid, world, function(err) {
      if (err) return submit.show()
      window.location.href = "/world.html#" + uuid
      
      // apparently setting href and triggering reload isn't synchronous!???
      // so I wait for 1 second before forcing it
      setTimeout(function() {
        window.location.reload()
      }, 1000)
    })
    return false
  }
}

},{"concat-stream":24,"gravatar":25,"hat":27}],2:[function(require,module,exports){
module.exports = function() {
  // parallax junk:

  // Cache the Window object
  $window = $(window);

  // Cache the Y offset and the speed of each sprite
  $('[data-type]').each(function() {  
    $(this).data('offsetY', parseInt($(this).attr('data-offsetY')))
    $(this).data('Xposition', $(this).attr('data-Xposition'))
    $(this).data('speed', $(this).attr('data-speed'))
  })

  // For each element that has a data-type attribute
  $('section[data-type="background"]').each(function() {


    // Store some variables based on where we are
    var $self = $(this),
      offsetCoords = $self.offset(),
      topOffset = offsetCoords.top

    // When the window is scrolled...
      $(window).scroll(function() {

      // If this section is in view
      if ( ($window.scrollTop() + $window.height()) > (topOffset) &&
         ( (topOffset + $self.height()) > $window.scrollTop() ) ) {

        // Scroll the background at var speed
        // the yPos is a negative value because we're scrolling it UP!                
        var yPos = -($window.scrollTop() / $self.data('speed')); 

        // If this element has a Y offset then add it on
        if ($self.data('offsetY')) {
          yPos += $self.data('offsetY');
        }

        // Put together our final background position
        var coords = '80% '+ yPos + 'px';

        // Move the background
        $self.css({ backgroundPosition: coords });

        // Check for other sprites in this section  
        $('[data-type="sprite"]', $self).each(function() {

          // Cache the sprite
          var $sprite = $(this);

          // Use the same calculation to work out how far to scroll the sprite
          var yPos = -($window.scrollTop() / $sprite.data('speed'));          
          var coords = $sprite.data('Xposition') + ' ' + (yPos + $sprite.data('offsetY')) + 'px';

          $sprite.css({ backgroundPosition: coords });                          

        }); // sprites


      }; // in view

    }); // window scroll

  });  // each data-type
}

},{}],3:[function(require,module,exports){
require('./js/parallax')()

var levelUser = require('level-user')
var commonStuff = require('./js/common')

var user = levelUser({dbName: 'blocks', baseURL: "http://wzrd.in:9000" })

user.getProfile(function(err, profile) {
  user.profile = profile
  commonStuff(user)
})

},{"./js/common":1,"./js/parallax":2,"level-user":28}],4:[function(require,module,exports){
(function(){// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

})()
},{"buffer":11,"util":9}],5:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":23}],6:[function(require,module,exports){

/**
 * Object#toString() ref for stringify().
 */

var toString = Object.prototype.toString;

/**
 * Array#indexOf shim.
 */

var indexOf = typeof Array.prototype.indexOf === 'function'
  ? function(arr, el) { return arr.indexOf(el); }
  : function(arr, el) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === el) return i;
      }
      return -1;
    };

/**
 * Array.isArray shim.
 */

var isArray = Array.isArray || function(arr) {
  return toString.call(arr) == '[object Array]';
};

/**
 * Object.keys shim.
 */

var objectKeys = Object.keys || function(obj) {
  var ret = [];
  for (var key in obj) ret.push(key);
  return ret;
};

/**
 * Array#forEach shim.
 */

var forEach = typeof Array.prototype.forEach === 'function'
  ? function(arr, fn) { return arr.forEach(fn); }
  : function(arr, fn) {
      for (var i = 0; i < arr.length; i++) fn(arr[i]);
    };

/**
 * Array#reduce shim.
 */

var reduce = function(arr, fn, initial) {
  if (typeof arr.reduce === 'function') return arr.reduce(fn, initial);
  var res = initial;
  for (var i = 0; i < arr.length; i++) res = fn(res, arr[i]);
  return res;
};

/**
 * Cache non-integer test regexp.
 */

var isint = /^[0-9]+$/;

function promote(parent, key) {
  if (parent[key].length == 0) return parent[key] = {};
  var t = {};
  for (var i in parent[key]) t[i] = parent[key][i];
  parent[key] = t;
  return t;
}

function parse(parts, parent, key, val) {
  var part = parts.shift();
  // end
  if (!part) {
    if (isArray(parent[key])) {
      parent[key].push(val);
    } else if ('object' == typeof parent[key]) {
      parent[key] = val;
    } else if ('undefined' == typeof parent[key]) {
      parent[key] = val;
    } else {
      parent[key] = [parent[key], val];
    }
    // array
  } else {
    var obj = parent[key] = parent[key] || [];
    if (']' == part) {
      if (isArray(obj)) {
        if ('' != val) obj.push(val);
      } else if ('object' == typeof obj) {
        obj[objectKeys(obj).length] = val;
      } else {
        obj = parent[key] = [parent[key], val];
      }
      // prop
    } else if (~indexOf(part, ']')) {
      part = part.substr(0, part.length - 1);
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
      // key
    } else {
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
    }
  }
}

/**
 * Merge parent key/val pair.
 */

function merge(parent, key, val){
  if (~indexOf(key, ']')) {
    var parts = key.split('[')
      , len = parts.length
      , last = len - 1;
    parse(parts, parent, 'base', val);
    // optimize
  } else {
    if (!isint.test(key) && isArray(parent.base)) {
      var t = {};
      for (var k in parent.base) t[k] = parent.base[k];
      parent.base = t;
    }
    set(parent.base, key, val);
  }

  return parent;
}

/**
 * Parse the given obj.
 */

function parseObject(obj){
  var ret = { base: {} };
  forEach(objectKeys(obj), function(name){
    merge(ret, name, obj[name]);
  });
  return ret.base;
}

/**
 * Parse the given str.
 */

function parseString(str){
  return reduce(String(str).split('&'), function(ret, pair){
    var eql = indexOf(pair, '=')
      , brace = lastBraceInKey(pair)
      , key = pair.substr(0, brace || eql)
      , val = pair.substr(brace || eql, pair.length)
      , val = val.substr(indexOf(val, '=') + 1, val.length);

    // ?foo
    if ('' == key) key = pair, val = '';
    if ('' == key) return ret;

    return merge(ret, decode(key), decode(val));
  }, { base: {} }).base;
}

/**
 * Parse the given query `str` or `obj`, returning an object.
 *
 * @param {String} str | {Object} obj
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str);
};

/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

var stringify = exports.stringify = function(obj, prefix) {
  if (isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix + '=' + encodeURIComponent(String(obj));
  }
};

/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}

/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[' + i + ']'));
  }
  return ret.join('&');
}

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyObject(obj, prefix) {
  var ret = []
    , keys = objectKeys(obj)
    , key;

  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    if (null == obj[key]) {
      ret.push(encodeURIComponent(key) + '=');
    } else {
      ret.push(stringify(obj[key], prefix
        ? prefix + '[' + encodeURIComponent(key) + ']'
        : encodeURIComponent(key)));
    }
  }

  return ret.join('&');
}

/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */

function set(obj, key, val) {
  var v = obj[key];
  if (undefined === v) {
    obj[key] = val;
  } else if (isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}

/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}

/**
 * Decode `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function decode(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (err) {
    return str;
  }
}

},{}],7:[function(require,module,exports){
var events = require('events');
var util = require('util');

function Stream() {
  events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
module.exports = Stream;
// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once, and
  // only when all sources have ended.
  if (!dest._isStdio && (!options || options.end !== false)) {
    dest._pipeCount = dest._pipeCount || 0;
    dest._pipeCount++;

    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":5,"util":9}],8:[function(require,module,exports){
var punycode = { encode : function (s) { return s } };

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

function arrayIndexOf(array, subject) {
    for (var i = 0, j = array.length; i < j; i++) {
        if(array[i] == subject) return i;
    }
    return -1;
}

var objectKeys = Object.keys || function objectKeys(object) {
    if (object !== Object(object)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in object) if (object.hasOwnProperty(key)) keys[keys.length] = key;
    return keys;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]+$/,
    // RFC 2396: characters reserved for delimiting URLs.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '~', '[', ']', '`'].concat(delims),
    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''],
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#']
      .concat(unwise).concat(autoEscape),
    nonAuthChars = ['/', '@', '?', '#'].concat(delims),
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
    hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always have a path component.
    pathedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var out = {},
      rest = url;

  // cut off any delimiters.
  // This is to support parse stuff like "<http://foo.com>"
  for (var i = 0, l = rest.length; i < l; i++) {
    if (arrayIndexOf(delims, rest.charAt(i)) === -1) break;
  }
  if (i !== 0) rest = rest.substr(i);


  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    out.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.

    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the first @ sign, unless some non-auth character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    var atSign = arrayIndexOf(rest, '@');
    if (atSign !== -1) {
      // there *may be* an auth
      var hasAuth = true;
      for (var i = 0, l = nonAuthChars.length; i < l; i++) {
        var index = arrayIndexOf(rest, nonAuthChars[i]);
        if (index !== -1 && index < atSign) {
          // not a valid auth.  Something like http://foo.com/bar@baz/
          hasAuth = false;
          break;
        }
      }
      if (hasAuth) {
        // pluck off the auth portion.
        out.auth = rest.substr(0, atSign);
        rest = rest.substr(atSign + 1);
      }
    }

    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = arrayIndexOf(rest, nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }

    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out port.
    var p = parseHost(out.host);
    var keys = objectKeys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';

    // validate a little.
    if (out.hostname.length > hostnameMaxLen) {
      out.hostname = '';
    } else {
      var hostparts = out.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            out.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    // hostnames are always lower case.
    out.hostname = out.hostname.toLowerCase();

    // IDNA Support: Returns a puny coded representation of "domain".
    // It only converts the part of the domain name that
    // has non ASCII characters. I.e. it dosent matter if
    // you call it with a domain that already is in ASCII.
    var domainArray = out.hostname.split('.');
    var newOut = [];
    for (var i = 0; i < domainArray.length; ++i) {
      var s = domainArray[i];
      newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
          'xn--' + punycode.encode(s) : s);
    }
    out.hostname = newOut.join('.');

    out.host = (out.hostname || '') +
        ((out.port) ? ':' + out.port : '');
    out.href += out.host;
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }

    // Now make sure that delims never appear in a url.
    var chop = rest.length;
    for (var i = 0, l = delims.length; i < l; i++) {
      var c = arrayIndexOf(rest, delims[i]);
      if (c !== -1) {
        chop = Math.min(c, chop);
      }
    }
    rest = rest.substr(0, chop);
  }


  // chop off from the tail first.
  var hash = arrayIndexOf(rest, '#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = arrayIndexOf(rest, '?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.search = '';
    out.query = {};
  }
  if (rest) out.pathname = rest;
  if (slashedProtocol[proto] &&
      out.hostname && !out.pathname) {
    out.pathname = '/';
  }

  //to support http.request
  if (out.pathname || out.search) {
    out.path = (out.pathname ? out.pathname : '') +
               (out.search ? out.search : '');
  }

  // finally, reconstruct the href based on what has been validated.
  out.href = urlFormat(out);
  return out;
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (typeof(obj) === 'string') obj = urlParse(obj);

  var auth = obj.auth || '';
  if (auth) {
    auth = auth.split('@').join('%40');
    for (var i = 0, l = nonAuthChars.length; i < l; i++) {
      var nAC = nonAuthChars[i];
      auth = auth.split(nAC).join(encodeURIComponent(nAC));
    }
    auth += '@';
  }

  var protocol = obj.protocol || '',
      host = (obj.host !== undefined) ? auth + obj.host :
          obj.hostname !== undefined ? (
              auth + obj.hostname +
              (obj.port ? ':' + obj.port : '')
          ) :
          false,
      pathname = obj.pathname || '',
      query = obj.query &&
              ((typeof obj.query === 'object' &&
                objectKeys(obj.query).length) ?
                 querystring.stringify(obj.query) :
                 '') || '',
      search = obj.search || (query && ('?' + query)) || '',
      hash = obj.hash || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (obj.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  return protocol + host + pathname + search + hash;
}

function urlResolve(source, relative) {
  return urlFormat(urlResolveObject(source, relative));
}

function urlResolveObject(source, relative) {
  if (!source) return relative;

  source = urlParse(urlFormat(source), false, true);
  relative = urlParse(urlFormat(relative), false, true);

  // hash is always overridden, no matter what.
  source.hash = relative.hash;

  if (relative.href === '') {
    source.href = urlFormat(source);
    return source;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    relative.protocol = source.protocol;
    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[relative.protocol] &&
        relative.hostname && !relative.pathname) {
      relative.path = relative.pathname = '/';
    }
    relative.href = urlFormat(relative);
    return relative;
  }

  if (relative.protocol && relative.protocol !== source.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      relative.href = urlFormat(relative);
      return relative;
    }
    source.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      relative.pathname = relPath.join('/');
    }
    source.pathname = relative.pathname;
    source.search = relative.search;
    source.query = relative.query;
    source.host = relative.host || '';
    source.auth = relative.auth;
    source.hostname = relative.hostname || relative.host;
    source.port = relative.port;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }

  var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host !== undefined ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (source.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = source.pathname && source.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = source.protocol &&
          !slashedProtocol[source.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // source.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {

    delete source.hostname;
    delete source.port;
    if (source.host) {
      if (srcPath[0] === '') srcPath[0] = source.host;
      else srcPath.unshift(source.host);
    }
    delete source.host;
    if (relative.protocol) {
      delete relative.hostname;
      delete relative.port;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      delete relative.host;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    source.host = (relative.host || relative.host === '') ?
                      relative.host : source.host;
    source.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : source.hostname;
    source.search = relative.search;
    source.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    source.search = relative.search;
    source.query = relative.query;
  } else if ('search' in relative) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      source.hostname = source.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && arrayIndexOf(source.host, '@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
    source.search = relative.search;
    source.query = relative.query;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.href = urlFormat(source);
    return source;
  }
  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    delete source.pathname;
    //to support http.request
    if (!source.search) {
      source.path = '/' + source.search;
    } else {
      delete source.path;
    }
    source.href = urlFormat(source);
    return source;
  }
  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (source.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    source.hostname = source.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = source.host && arrayIndexOf(source.host, '@') > 0 ?
                     source.host.split('@') : false;
    if (authInHost) {
      source.auth = authInHost.shift();
      source.host = source.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (source.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  source.pathname = srcPath.join('/');
  //to support request.http
  if (source.pathname !== undefined || source.search !== undefined) {
    source.path = (source.pathname ? source.pathname : '') +
                  (source.search ? source.search : '');
  }
  source.auth = relative.auth || source.auth;
  source.slashes = source.slashes || relative.slashes;
  source.href = urlFormat(source);
  return source;
}

function parseHost(host) {
  var out = {};
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    out.port = port.substr(1);
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

},{"querystring":6}],9:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":5}],10:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],11:[function(require,module,exports){
(function(){var assert = require('assert');
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

})()
},{"./buffer_ieee754":10,"assert":4,"base64-js":12}],12:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],13:[function(require,module,exports){
(function(){var Buffer = require('buffer').Buffer
var sha = require('./sha')
var rng = require('./rng')
var md5 = require('./md5')

var algorithms = {
  sha1: {
    hex: sha.hex_sha1,
    binary: sha.b64_sha1,
    ascii: sha.str_sha1
  },
  md5: {
    hex: md5.hex_md5,
    binary: md5.b64_md5,
    ascii: md5.any_md5
  }
}

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) {
  alg = alg || 'sha1'
  if(!algorithms[alg])
    error('algorithm:', alg, 'is not yet supported')
  var s = ''
  var _alg = algorithms[alg]
  return {
    update: function (data) {
      s += data
      return this
    },
    digest: function (enc) {
      enc = enc || 'binary'
      var fn
      if(!(fn = _alg[enc]))
        error('encoding:', enc , 'is not yet supported for algorithm', alg)
      var r = fn(s)
      s = null //not meant to use the hash after you've called digest.
      return r
    }
  }
}

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)));
    } catch (err) { callback(err); }
  } else {
    return new Buffer(rng(size));
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createHmac'
, 'createCypher'
, 'createCypheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDeffieHellman'
, 'pbkdf2'], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

})()
},{"./md5":14,"./rng":15,"./sha":16,"buffer":11}],14:[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}


exports.hex_md5 = hex_md5;
exports.b64_md5 = b64_md5;
exports.any_md5 = any_md5;

},{}],15:[function(require,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  // currently only available in webkit-based browsers.
  if (_global.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function(size) {
      var bytes = new Array(size);
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < size; c++) {
        bytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())
},{}],16:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

exports.hex_sha1 = hex_sha1;
exports.b64_sha1 = b64_sha1;
exports.str_sha1 = str_sha1;
exports.hex_hmac_sha1 = hex_hmac_sha1;
exports.b64_hmac_sha1 = b64_hmac_sha1;
exports.str_hmac_sha1 = str_hmac_sha1;

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}


},{}],17:[function(require,module,exports){
var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');

http.request = function (params, cb) {
    if (!params) params = {};
    if (!params.host) params.host = window.location.host.split(':')[0];
    if (!params.port) params.port = window.location.port;
    if (!params.scheme) params.scheme = window.location.protocol.split(':')[0];
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

},{"./lib/request":18,"events":5}],18:[function(require,module,exports){
(function(){var Stream = require('stream');
var Response = require('./response');
var concatStream = require('concat-stream')
var Buffer = require('buffer')

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = concatStream()
    
    var uri = params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    xhr.open(
        params.method || 'GET',
        (params.scheme || 'http') + '://' + uri,
        true
    );
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            if (isArray(value)) {
                for (var j = 0; j < value.length; j++) {
                    xhr.setRequestHeader(key, value[j]);
                }
            }
            else xhr.setRequestHeader(key, value)
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + new Buffer(params.auth).toString('base64'));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });
    
    xhr.onreadystatechange = function () {
        res.handle(xhr);
    };
};

Request.prototype = new Stream;

Request.prototype.setHeader = function (key, value) {
    if (isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            this.xhr.setRequestHeader(key, value[i]);
        }
    }
    else {
        this.xhr.setRequestHeader(key, value);
    }
};

Request.prototype.write = function (s) {
    this.body.write(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.write(s);
    this.body.end()
    this.xhr.send(this.body.getBody());
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

})()
},{"./response":19,"buffer":11,"concat-stream":20,"stream":7}],19:[function(require,module,exports){
var Stream = require('stream');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

Response.prototype = new Stream;

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":7}],20:[function(require,module,exports){
(function(Buffer){var stream = require('stream')
var util = require('util')

function ConcatStream(cb) {
  stream.Stream.call(this)
  this.writable = true
  if (cb) this.cb = cb
  this.body = []
  if (this.cb) this.on('error', cb)
}

util.inherits(ConcatStream, stream.Stream)

ConcatStream.prototype.write = function(chunk) {
  this.body.push(chunk)
}

ConcatStream.prototype.arrayConcat = function(arrs) {
  if (arrs.length === 0) return []
  if (arrs.length === 1) return arrs[0]
  return arrs.reduce(function (a, b) { return a.concat(b) })
}

ConcatStream.prototype.isArray = function(arr) {
  var isArray = Array.isArray(arr)
  var isTypedArray = arr.toString().match(/Array/)
  return isArray || isTypedArray
}

ConcatStream.prototype.getBody = function () {
  if (this.body.length === 0) return
  if (typeof(this.body[0]) === "string") return this.body.join('')
  if (this.isArray(this.body[0])) return this.arrayConcat(this.body)
  if (typeof(Buffer) !== "undefined" && Buffer.isBuffer(this.body[0])) {
    return Buffer.concat(this.body)
  }
  return this.body
}

ConcatStream.prototype.end = function() {
  if (this.cb) this.cb(false, this.getBody())
}

module.exports = function(cb) {
  return new ConcatStream(cb)
}

module.exports.ConcatStream = ConcatStream

})(require("__browserify_Buffer").Buffer)
},{"__browserify_Buffer":22,"stream":7,"util":9}],21:[function(require,module,exports){

},{}],22:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"util":2,"buffer":3}],2:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":4}],5:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":5,"base64-js":7}],7:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],8:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":8,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],23:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],24:[function(require,module,exports){
(function(Buffer){var stream = require('stream')
var util = require('util')

function ConcatStream(cb) {
  stream.Stream.call(this)
  this.writable = true
  if (cb) this.cb = cb
  this.body = []
  this.on('error', function(err) {
    // no-op
  })
}

util.inherits(ConcatStream, stream.Stream)

ConcatStream.prototype.write = function(chunk) {
  this.body.push(chunk)
}

ConcatStream.prototype.destroy = function() {}

ConcatStream.prototype.arrayConcat = function(arrs) {
  if (arrs.length === 0) return []
  if (arrs.length === 1) return arrs[0]
  return arrs.reduce(function (a, b) { return a.concat(b) })
}

ConcatStream.prototype.isArray = function(arr) {
  return Array.isArray(arr)
}

ConcatStream.prototype.getBody = function () {
  if (this.body.length === 0) return
  if (typeof(this.body[0]) === "string") return this.body.join('')
  if (this.isArray(this.body[0])) return this.arrayConcat(this.body)
  if (typeof(Buffer) !== "undefined" && Buffer.isBuffer(this.body[0])) {
    return Buffer.concat(this.body)
  }
  return this.body
}

ConcatStream.prototype.end = function() {
  if (this.cb) this.cb(this.getBody())
}

module.exports = function(cb) {
  return new ConcatStream(cb)
}

module.exports.ConcatStream = ConcatStream

})(require("__browserify_Buffer").Buffer)
},{"__browserify_Buffer":22,"stream":7,"util":9}],25:[function(require,module,exports){
module.exports = require('./lib/gravatar');

},{"./lib/gravatar":26}],26:[function(require,module,exports){
var crypto = require('crypto')
  , querystring = require('querystring');

var gravatar = module.exports = {
    url: function (email, options, https) {
      var baseURL = (https && "https://secure.gravatar.com/avatar/") || 'http://www.gravatar.com/avatar/';
      var queryData = querystring.stringify(options);
      var query = (queryData && "?" + queryData) || "";

      return baseURL + crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex') + query;
    }
};

},{"crypto":13,"querystring":6}],27:[function(require,module,exports){
var hat = module.exports = function (bits, base) {
    if (!base) base = 16;
    if (bits === undefined) bits = 128;
    if (bits <= 0) return '0';
    
    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
    for (var i = 2; digits === Infinity; i *= 2) {
        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
    }
    
    var rem = digits - Math.floor(digits);
    
    var res = '';
    
    for (var i = 0; i < Math.floor(digits); i++) {
        var x = Math.floor(Math.random() * base).toString(base);
        res = x + res;
    }
    
    if (rem) {
        var b = Math.pow(base, rem);
        var x = Math.floor(Math.random() * b).toString(base);
        res = x + res;
    }
    
    var parsed = parseInt(res, base);
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
        return hat(bits, base)
    }
    else return res;
};

hat.rack = function (bits, base, expandBy) {
    var fn = function (data) {
        var iters = 0;
        do {
            if (iters ++ > 10) {
                if (expandBy) bits += expandBy;
                else throw new Error('too many ID collisions, use more bits')
            }
            
            var id = hat(bits, base);
        } while (Object.hasOwnProperty.call(hats, id));
        
        hats[id] = data;
        return id;
    };
    var hats = fn.hats = {};
    
    fn.get = function (id) {
        return fn.hats[id];
    };
    
    fn.set = function (id, value) {
        fn.hats[id] = value;
        return fn;
    };
    
    fn.bits = bits || 128;
    fn.base = base || 16;
    return fn;
};

},{}],28:[function(require,module,exports){
var levelup = require('levelup')
var leveljs = require('level-js')
var websocket = require('websocket-stream')
var sublevel = require('level-sublevel')
var multilevel = require('multilevel')
var createPersona = require('persona-id')
var request = require('browser-request')

module.exports = function(options) {
  if (!options) options = {}
  if (!options.baseURL) options.baseURL = ''
  if (!options.dbName) options.dbName = "data"
  var db = sublevel(levelup(options.dbName, {
    db: leveljs,
    valueEncoding: 'json'
  }))
  return new User(db, options)
}

function User(db, options) {
  this.db = db
  this.persona = createPersona()
  this.options = options
}

User.prototype.getProfile = function(cb) {
  var self = this
  var opts = { withCredentials: true, json: true, url: this.options.baseURL + '/_profile' }
  request(opts, function(err, resp, profile) {
    if (err) return cb(err, {})
    if (!profile.email) return cb(err, profile)
    self.db.put('profile', profile, function(err) {
      cb(err, profile)
    })
  })
}

User.prototype.remote = function(name) {
  var backend = this.options.baseURL.replace('http:', 'ws:') + '/' + name
  var stream = websocket(backend)
  var db = multilevel.client()
  db.on('data', function(e) { console.log(e) })
  stream.pipe(db.createRpcStream()).pipe(stream)
  return db
}

User.prototype.copy = function(from, to, cb) {
  var write = to.createWriteStream({valueEncoding: 'binary'})
  from.createReadStream({valueEncoding: 'binary'}).pipe(write)
  var sent = false
  write.on('close', function() {
    if (!sent) {
      cb()
      sent = true
    }
  })
  write.on('error', function(err) {
    if (!sent) {
      cb(err)
      sent = true
    }
  })
}

},{"browser-request":29,"level-js":30,"level-sublevel":37,"levelup":49,"multilevel":79,"persona-id":112,"websocket-stream":115}],29:[function(require,module,exports){
(function(){// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')

module.exports = request
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}

})()
},{}],30:[function(require,module,exports){
module.exports = Level

var IDB = require('idb-wrapper')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var util = require('util')
var Iterator = require('./iterator')
var isBuffer = require('isbuffer')

function Level(location) {
  if (!(this instanceof Level)) return new Level(location)
  if (!location) throw new Error("constructor requires at least a location argument")
  
  this.location = location
}

util.inherits(Level, AbstractLevelDOWN)

Level.prototype._open = function(options, callback) {
  var self = this
  
  this.idb = new IDB({
    storeName: this.location,
    autoIncrement: false,
    keyPath: null,
    onStoreReady: function () {
      callback && callback(null, self.idb)
    }, 
    onError: function(err) {
      callback && callback(err)
    }
  })
}

Level.prototype._get = function (key, options, callback) {
  this.idb.get(key, function (value) {
    if (value === undefined) {
      // 'NotFound' error, consistent with LevelDOWN API
      return callback(new Error('NotFound'))
    }
    if (options.asBuffer !== false && !isBuffer(value))
      value = StringToArrayBuffer(String(value))
    return callback(null, value, key)
  }, callback)
}

Level.prototype._del = function(id, options, callback) {
  this.idb.remove(id, callback, callback)
}

Level.prototype._put = function (key, value, options, callback) {
  this.idb.put(key, value, function() { callback() }, callback)
}

Level.prototype.iterator = function (options) {
  if (typeof options !== 'object') options = {}
  return new Iterator(this.idb, options)
}

Level.prototype._batch = function (array, options, callback) {
  var op
    , i

  for (i=0; i < array.length; i++) {
    op = array[i]

    if (op.type === 'del') {
      op.type = 'remove'
    }
  }

  return this.idb.batch(array, function(){ callback() }, callback)
}

Level.prototype._close = function (callback) {
  this.idb.db.close()
  callback()
}

Level.prototype._approximateSize = function() {
  throw new Error('Not implemented')
}

Level.prototype._isBuffer = isBuffer

var checkKeyValue = Level.prototype._checkKeyValue = function (obj, type) {
  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')
  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')
  if (isBuffer(obj) && obj.byteLength === 0)
    return new Error(type + ' cannot be an empty ArrayBuffer')
  if (String(obj) === '')
    return new Error(type + ' cannot be an empty String')
  if (obj.length === 0)
    return new Error(type + ' cannot be an empty Array')
}

function ArrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

function StringToArrayBuffer(str) {
  var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

},{"./iterator":31,"abstract-leveldown":34,"idb-wrapper":35,"isbuffer":36,"util":9}],31:[function(require,module,exports){
var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
module.exports = Iterator

function Iterator (db, options) {
  if (!options) options = {}
  this.options = options
  AbstractIterator.call(this, db)
  this._order = !!options.reverse ? 'DESC': 'ASC'
  this._start = options.start
  this._limit = options.limit
  if (this._limit) this._count = 0
  this._end   = options.end
  this._done = false
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.createIterator = function() {
  var lower, upper
  var onlyStart = typeof this._start !== 'undefined' && typeof this._end === 'undefined'
  var onlyEnd = typeof this._start === 'undefined' && typeof this._end !== 'undefined'
  var startAndEnd = typeof this._start !== 'undefined' && typeof this._end !== 'undefined'
  if (onlyStart) {
    var index = this._start
    if (this._order === 'ASC') {
      lower = index
    } else {
      upper = index
    }
  } else if (onlyEnd) {
    var index = this._end
    if (this._order === 'DESC') {
      lower = index
    } else {
      upper = index
    }
  } else if (startAndEnd) {
    lower = this._start
    upper = this._end
    if (this._start > this._end) {
      lower = this._end
      upper = this._start
    }
  }
  if (lower || upper) {
    this._keyRange = this.options.keyRange || this.db.makeKeyRange({
      lower: lower,
      upper: upper
      // TODO expose excludeUpper/excludeLower
    })
  }
  this.iterator = this.db.iterate(this.onItem.bind(this), {
    keyRange: this._keyRange,
    autoContinue: false,
    order: this._order,
    onError: function(err) { console.log('horrible error', err) },
  })
}

// TODO the limit implementation here just ignores all reads after limit has been reached
// it should cancel the iterator instead but I don't know how
Iterator.prototype.onItem = function (value, cursor, cursorTransaction) {
  if (!cursor && this.callback) {
    this.callback()
    this.callback = false
    return
  }
  if (this._limit && this._limit > 0) {
    if (this._limit > this._count) this.callback(false, cursor.key, cursor.value)
  } else {
    this.callback(false, cursor.key, cursor.value)
  }
  if (this._limit) this._count++
  if (cursor) cursor.continue()
}

Iterator.prototype._next = function (callback) {
  if (!callback) return new Error('next() requires a callback argument')
  if (!this._started) {
    this.createIterator()
    this._started = true
  }
  this.callback = callback
}
},{"abstract-leveldown":34,"util":9}],32:[function(require,module,exports){
(function(process){/* Copyright (c) 2013 Rod Vagg, MIT License */

function AbstractChainedBatch (db) {
  this._db         = db
  this._operations = []
  this._written    = false
}

AbstractChainedBatch.prototype._checkWritten = function () {
  if (this._written)
    throw new Error('write() already called on this batch')
}

AbstractChainedBatch.prototype.put = function (key, value) {
  this._checkWritten()

  var err = this._db._checkKeyValue(key, 'key', this._db._isBuffer)
  if (err) throw err
  err = this._db._checkKeyValue(value, 'value', this._db._isBuffer)
  if (err) throw err

  if (!this._db._isBuffer(key)) key = String(key)
  if (!this._db._isBuffer(value)) value = String(value)

  this._operations.push({ type: 'put', key: key, value: value })

  return this
}

AbstractChainedBatch.prototype.del = function (key) {
  this._checkWritten()

  var err = this._db._checkKeyValue(key, 'key', this._db._isBuffer)
  if (err) throw err

  if (!this._db._isBuffer(key)) key = String(key)

  this._operations.push({ type: 'del', key: key })

  return this
}

AbstractChainedBatch.prototype.clear = function () {
  this._checkWritten()

  this._operations = []
  return this
}

AbstractChainedBatch.prototype.write = function (options, callback) {
  this._checkWritten()

  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('write() requires a callback argument')
  if (typeof options != 'object')
    options = {}

  this._written = true

  if (typeof this._db._batch == 'function')
    return this._db._batch(this._operations, options, callback)

  process.nextTick(callback)
}

module.exports = AbstractChainedBatch
})(require("__browserify_process"))
},{"__browserify_process":23}],33:[function(require,module,exports){
(function(process){/* Copyright (c) 2013 Rod Vagg, MIT License */

function AbstractIterator (db) {
  this.db = db
  this._ended = false
  this._nexting = false
}

AbstractIterator.prototype.next = function (callback) {
  var self = this

  if (typeof callback != 'function')
    throw new Error('next() requires a callback argument')

  if (self._ended)
    return callback(new Error('cannot call next() after end()'))
  if (self._nexting)
    return callback(new Error('cannot call next() before previous next() has completed'))

  self._nexting = true
  if (typeof self._next == 'function') {
    return self._next(function () {
      self._nexting = false
      callback.apply(null, arguments)
    })
  }

  process.nextTick(function () {
    self._nexting = false
    callback()
  })
}

AbstractIterator.prototype.end = function (callback) {
  if (typeof callback != 'function')
    throw new Error('end() requires a callback argument')

  if (this._ended)
    return callback(new Error('end() already called on iterator'))

  this._ended = true

  if (typeof this._end == 'function')
    return this._end(callback)

  process.nextTick(callback)
}

module.exports = AbstractIterator

})(require("__browserify_process"))
},{"__browserify_process":23}],34:[function(require,module,exports){
(function(process,Buffer){/* Copyright (c) 2013 Rod Vagg, MIT License */

var AbstractIterator     = require('./abstract-iterator')
  , AbstractChainedBatch = require('./abstract-chained-batch')

function AbstractLevelDOWN (location) {
  if (!arguments.length || location === undefined)
    throw new Error('constructor requires at least a location argument')

  if (typeof location != 'string')
    throw new Error('constructor requires a location string argument')

  this.location = location
}

AbstractLevelDOWN.prototype.open = function (options, callback) {
  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('open() requires a callback argument')
  if (typeof options != 'object')
    options = {}

  if (typeof this._open == 'function')
    return this._open(options, callback)

  process.nextTick(callback)
}

AbstractLevelDOWN.prototype.close = function (callback) {
  if (typeof callback != 'function')
    throw new Error('close() requires a callback argument')

  if (typeof this._close == 'function')
    return this._close(callback)

  process.nextTick(callback)
}

AbstractLevelDOWN.prototype.get = function (key, options, callback) {
  var self = this
  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('get() requires a callback argument')
  var err = self._checkKeyValue(key, 'key', self._isBuffer)
  if (err) return callback(err)
  if (!self._isBuffer(key)) key = String(key)
  if (typeof options != 'object')
    options = {}

  if (typeof self._get == 'function')
    return self._get(key, options, callback)

  process.nextTick(function () { callback(new Error('NotFound')) })
}

AbstractLevelDOWN.prototype.put = function (key, value, options, callback) {
  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('put() requires a callback argument')
  var err = this._checkKeyValue(key, 'key', this._isBuffer)
  if (err) return callback(err)
  err = this._checkKeyValue(value, 'value', this._isBuffer)
  if (err) return callback(err)
  if (!this._isBuffer(key)) key = String(key)
  // coerce value to string in node, dont touch it in browser
  // (indexeddb can store any JS type)
  if (!this._isBuffer(value) && !process.browser) value = String(value)
  if (typeof options != 'object')
    options = {}
  if (typeof this._put == 'function')
    return this._put(key, value, options, callback)

  process.nextTick(callback)
}

AbstractLevelDOWN.prototype.del = function (key, options, callback) {
  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('del() requires a callback argument')
  var err = this._checkKeyValue(key, 'key', this._isBuffer)
  if (err) return callback(err)
  if (!this._isBuffer(key)) key = String(key)
  if (typeof options != 'object')
    options = {}


  if (typeof this._del == 'function')
    return this._del(key, options, callback)

  process.nextTick(callback)
}

AbstractLevelDOWN.prototype.batch = function (array, options, callback) {
  if (!arguments.length)
    return this._chainedBatch()

  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('batch(array) requires a callback argument')
  if (!Array.isArray(array))
    return callback(new Error('batch(array) requires an array argument'))
  if (typeof options != 'object')
    options = {}

  var i = 0
    , l = array.length
    , e
    , err

  for (; i < l; i++) {
    e = array[i]
    if (typeof e != 'object') continue;

    err = this._checkKeyValue(e.type, 'type', this._isBuffer)
    if (err) return callback(err)

    err = this._checkKeyValue(e.key, 'key', this._isBuffer)
    if (err) return callback(err)

    if (e.type == 'put') {
      err = this._checkKeyValue(e.value, 'value', this._isBuffer)
      if (err) return callback(err)
    }
  }

  if (typeof this._batch == 'function')
    return this._batch(array, options, callback)

  process.nextTick(callback)
}

AbstractLevelDOWN.prototype.approximateSize = function (start, end, callback) {
  if (start == null || end == null || typeof start == 'function' || typeof end == 'function')
    throw new Error('approximateSize() requires valid `start`, `end` and `callback` arguments')
  if (typeof callback != 'function')
    throw new Error('approximateSize() requires a callback argument')

  if (!this._isBuffer(start)) start = String(start)
  if (!this._isBuffer(end)) end = String(end)
  if (typeof this._approximateSize == 'function')
    return this._approximateSize(start, end, callback)

  process.nextTick(function () { callback(null, 0) })
}

AbstractLevelDOWN.prototype.iterator = function (options) {
  if (typeof options != 'object')
    options = {}

  if (typeof this._iterator == 'function')
    return this._iterator(options)

  return new AbstractIterator(this)
}

AbstractLevelDOWN.prototype._chainedBatch = function () {
  return new AbstractChainedBatch(this)
}

AbstractLevelDOWN.prototype._isBuffer = function (obj) {
  return Buffer.isBuffer(obj)
}

AbstractLevelDOWN.prototype._checkKeyValue = function (obj, type) {
  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')
  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')
  if (this._isBuffer(obj)) {
    if (obj.length === 0)
      return new Error(type + ' cannot be an empty Buffer')
  } else if (String(obj) === '')
    return new Error(type + ' cannot be an empty String')
}

module.exports.AbstractLevelDOWN = AbstractLevelDOWN
module.exports.AbstractIterator  = AbstractIterator

})(require("__browserify_process"),require("__browserify_Buffer").Buffer)
},{"./abstract-chained-batch":32,"./abstract-iterator":33,"__browserify_Buffer":22,"__browserify_process":23}],35:[function(require,module,exports){
(function(){/*jshint expr:true */
/*global window:false, console:false, define:false, module:false */

/**
 * @license IDBWrapper - A cross-browser wrapper for IndexedDB
 * Copyright (c) 2011 - 2013 Jens Arps
 * http://jensarps.de/
 *
 * Licensed under the MIT (X11) license
 */

(function (name, definition, global) {
  if (typeof define === 'function') {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    global[name] = definition();
  }
})('IDBStore', function () {

  "use strict";

  var defaults = {
    storeName: 'Store',
    storePrefix: 'IDBWrapper-',
    dbVersion: 1,
    keyPath: 'id',
    autoIncrement: true,
    onStoreReady: function () {
    },
    onError: function(error){
      throw error;
    },
    indexes: []
  };

  /**
   *
   * The IDBStore constructor
   *
   * @constructor
   * @name IDBStore
   * @version 1.1.0
   *
   * @param {Object} [kwArgs] An options object used to configure the store and
   *  set callbacks
   * @param {String} [kwArgs.storeName='Store'] The name of the store
   * @param {String} [kwArgs.storePrefix='IDBWrapper-'] A prefix that is
   *  internally used to construct the name of the database, which will be
   *  kwArgs.storePrefix + kwArgs.storeName
   * @param {Number} [kwArgs.dbVersion=1] The version of the store
   * @param {String} [kwArgs.keyPath='id'] The key path to use. If you want to
   *  setup IDBWrapper to work with out-of-line keys, you need to set this to
   *  `null`
   * @param {Boolean} [kwArgs.autoIncrement=true] If set to true, IDBStore will
   *  automatically make sure a unique keyPath value is present on each object
   *  that is stored.
   * @param {Function} [kwArgs.onStoreReady] A callback to be called when the
   *  store is ready to be used.
   * @param {Function} [kwArgs.onError=throw] A callback to be called when an
   *  error occurred during instantiation of the store.
   * @param {Array} [kwArgs.indexes=[]] An array of indexData objects
   *  defining the indexes to use with the store. For every index to be used
   *  one indexData object needs to be passed in the array.
   *  An indexData object is defined as follows:
   * @param {Object} [kwArgs.indexes.indexData] An object defining the index to
   *  use
   * @param {String} kwArgs.indexes.indexData.name The name of the index
   * @param {String} [kwArgs.indexes.indexData.keyPath] The key path of the index
   * @param {Boolean} [kwArgs.indexes.indexData.unique] Whether the index is unique
   * @param {Boolean} [kwArgs.indexes.indexData.multiEntry] Whether the index is multi entry
   * @param {Function} [onStoreReady] A callback to be called when the store
   * is ready to be used.
   * @example
      // create a store for customers with an additional index over the
      // `lastname` property.
      var myCustomerStore = new IDBStore({
        dbVersion: 1,
        storeName: 'customer-index',
        keyPath: 'customerid',
        autoIncrement: true,
        onStoreReady: populateTable,
        indexes: [
          { name: 'lastname', keyPath: 'lastname', unique: false, multiEntry: false }
        ]
      });
   * @example
      // create a generic store
      var myCustomerStore = new IDBStore({
        storeName: 'my-data-store',
        onStoreReady: function(){
          // start working with the store.
        }
      });
   */
  var IDBStore = function (kwArgs, onStoreReady) {

    for(var key in defaults){
      this[key] = typeof kwArgs[key] != 'undefined' ? kwArgs[key] : defaults[key];
    }

    this.dbName = this.storePrefix + this.storeName;
    this.dbVersion = parseInt(this.dbVersion, 10);

    onStoreReady && (this.onStoreReady = onStoreReady);

    this.idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    this.keyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;

    this.consts = {
      'READ_ONLY':         'readonly',
      'READ_WRITE':        'readwrite',
      'VERSION_CHANGE':    'versionchange',
      'NEXT':              'next',
      'NEXT_NO_DUPLICATE': 'nextunique',
      'PREV':              'prev',
      'PREV_NO_DUPLICATE': 'prevunique'
    };

    this.openDB();
  };

  IDBStore.prototype = /** @lends IDBStore */ {

    /**
     * The version of IDBStore
     *
     * @type String
     */
    version: '1.2.0',

    /**
     * A reference to the IndexedDB object
     *
     * @type Object
     */
    db: null,

    /**
     * The full name of the IndexedDB used by IDBStore, composed of
     * this.storePrefix + this.storeName
     *
     * @type String
     */
    dbName: null,

    /**
     * The version of the IndexedDB used by IDBStore
     *
     * @type Number
     */
    dbVersion: null,

    /**
     * A reference to the objectStore used by IDBStore
     *
     * @type Object
     */
    store: null,

    /**
     * The store name
     *
     * @type String
     */
    storeName: null,

    /**
     * The key path
     *
     * @type String
     */
    keyPath: null,

    /**
     * Whether IDBStore uses autoIncrement
     *
     * @type Boolean
     */
    autoIncrement: null,

    /**
     * The indexes used by IDBStore
     *
     * @type Array
     */
    indexes: null,

    /**
     * A hashmap of features of the used IDB implementation
     *
     * @type Object
     * @proprty {Boolean} autoIncrement If the implementation supports
     *  native auto increment
     */
    features: null,

    /**
     * The callback to be called when the store is ready to be used
     *
     * @type Function
     */
    onStoreReady: null,

    /**
     * The callback to be called if an error occurred during instantiation
     * of the store
     *
     * @type Function
     */
    onError: null,

    /**
     * The internal insertID counter
     *
     * @type Number
     * @private
     */
    _insertIdCount: 0,

    /**
     * Opens an IndexedDB; called by the constructor.
     *
     * Will check if versions match and compare provided index configuration
     * with existing ones, and update indexes if necessary.
     *
     * Will call this.onStoreReady() if everything went well and the store
     * is ready to use, and this.onError() is something went wrong.
     *
     * @private
     *
     */
    openDB: function () {

      var features = this.features = {};
      features.hasAutoIncrement = !window.mozIndexedDB;

      var openRequest = this.idb.open(this.dbName, this.dbVersion);
      var preventSuccessCallback = false;

      openRequest.onerror = function (error) {

        var gotVersionErr = false;
        if ('error' in error.target) {
          gotVersionErr = error.target.error.name == "VersionError";
        } else if ('errorCode' in error.target) {
          gotVersionErr = error.target.errorCode == 12;
        }

        if (gotVersionErr) {
          this.onError(new Error('The version number provided is lower than the existing one.'));
        } else {
          this.onError(error);
        }
      }.bind(this);

      openRequest.onsuccess = function (event) {

        if (preventSuccessCallback) {
          return;
        }

        if(this.db){
          this.onStoreReady();
          return;
        }

        this.db = event.target.result;

        if(typeof this.db.version == 'string'){
          this.onError(new Error('The IndexedDB implementation in this browser is outdated. Please upgrade your browser.'));
          return;
        }

        if(!this.db.objectStoreNames.contains(this.storeName)){
          // We should never ever get here.
          // Lets notify the user anyway.
          this.onError(new Error('Something is wrong with the IndexedDB implementation in this browser. Please upgrade your browser.'));
          return;
        }

        var emptyTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);
        this.store = emptyTransaction.objectStore(this.storeName);

        // check indexes
        this.indexes.forEach(function(indexData){
          var indexName = indexData.name;

          if(!indexName){
            preventSuccessCallback = true;
            this.onError(new Error('Cannot create index: No index name given.'));
            return;
          }

          this.normalizeIndexData(indexData);

          if(this.hasIndex(indexName)){
            // check if it complies
            var actualIndex = this.store.index(indexName);
            var complies = this.indexComplies(actualIndex, indexData);
            if(!complies){
              preventSuccessCallback = true;
              this.onError(new Error('Cannot modify index "' + indexName + '" for current version. Please bump version number to ' + ( this.dbVersion + 1 ) + '.'));
            }
          } else {
            preventSuccessCallback = true;
            this.onError(new Error('Cannot create new index "' + indexName + '" for current version. Please bump version number to ' + ( this.dbVersion + 1 ) + '.'));
          }

        }, this);

        preventSuccessCallback || this.onStoreReady();
      }.bind(this);

      openRequest.onupgradeneeded = function(/* IDBVersionChangeEvent */ event){

        this.db = event.target.result;

        if(this.db.objectStoreNames.contains(this.storeName)){
          this.store = event.target.transaction.objectStore(this.storeName);
        } else {
          this.store = this.db.createObjectStore(this.storeName, { keyPath: this.keyPath, autoIncrement: this.autoIncrement});
        }

        this.indexes.forEach(function(indexData){
          var indexName = indexData.name;

          if(!indexName){
            preventSuccessCallback = true;
            this.onError(new Error('Cannot create index: No index name given.'));
          }

          this.normalizeIndexData(indexData);

          if(this.hasIndex(indexName)){
            // check if it complies
            var actualIndex = this.store.index(indexName);
            var complies = this.indexComplies(actualIndex, indexData);
            if(!complies){
              // index differs, need to delete and re-create
              this.store.deleteIndex(indexName);
              this.store.createIndex(indexName, indexData.keyPath, { unique: indexData.unique, multiEntry: indexData.multiEntry });
            }
          } else {
            this.store.createIndex(indexName, indexData.keyPath, { unique: indexData.unique, multiEntry: indexData.multiEntry });
          }

        }, this);

      }.bind(this);
    },

    /**
     * Deletes the database used for this store if the IDB implementations
     * provides that functionality.
     */
    deleteDatabase: function () {
      if (this.idb.deleteDatabase) {
        this.idb.deleteDatabase(this.dbName);
      }
    },

    /*********************
     * data manipulation *
     *********************/

    /**
     * Puts an object into the store. If an entry with the given id exists,
     * it will be overwritten. This method has a different signature for inline
     * keys and out-of-line keys; please see the examples below.
     *
     * @param {*} [key] The key to store. This is only needed if IDBWrapper
     *  is set to use out-of-line keys. For inline keys - the default scenario -
     *  this can be omitted.
     * @param {Object} value The data object to store.
     * @param {Function} [onSuccess] A callback that is called if insertion
     *  was successful.
     * @param {Function} [onError] A callback that is called if insertion
     *  failed.
     * @example
        // Storing an object, using inline keys (the default scenario):
        var myCustomer = {
          customerid: 2346223,
          lastname: 'Doe',
          firstname: 'John'
        };
        myCustomerStore.put(myCustomer, mySuccessHandler, myErrorHandler);
        // Note that passing success- and error-handlers is optional.
     * @example
        // Storing an object, using out-of-line keys:
       var myCustomer = {
         lastname: 'Doe',
         firstname: 'John'
       };
       myCustomerStore.put(2346223, myCustomer, mySuccessHandler, myErrorHandler);
      // Note that passing success- and error-handlers is optional.
     */
    put: function (key, value, onSuccess, onError) {
      if (this.keyPath !== null) {
        onError = onSuccess;
        onSuccess = value;
        value = key;
      }
      onError || (onError = function (error) {
        console.error('Could not write data.', error);
      });
      onSuccess || (onSuccess = noop);

      var hasSuccess = false,
          result = null,
          putRequest;

      var putTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);
      putTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      putTransaction.onabort = onError;
      putTransaction.onerror = onError;

      if (this.keyPath !== null) { // in-line keys
        this._addIdPropertyIfNeeded(value);
        putRequest = putTransaction.objectStore(this.storeName).put(value);
      } else { // out-of-line keys
        putRequest = putTransaction.objectStore(this.storeName).put(value, key);
      }
      putRequest.onsuccess = function (event) {
        hasSuccess = true;
        result = event.target.result;
      };
      putRequest.onerror = onError;
    },

    /**
     * Retrieves an object from the store. If no entry exists with the given id,
     * the success handler will be called with null as first and only argument.
     *
     * @param {*} key The id of the object to fetch.
     * @param {Function} [onSuccess] A callback that is called if fetching
     *  was successful. Will receive the object as only argument.
     * @param {Function} [onError] A callback that will be called if an error
     *  occurred during the operation.
     */
    get: function (key, onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not read data.', error);
      });
      onSuccess || (onSuccess = noop);

      var hasSuccess = false,
          result = null;
      
      var getTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);
      getTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      getTransaction.onabort = onError;
      getTransaction.onerror = onError;
      var getRequest = getTransaction.objectStore(this.storeName).get(key);
      getRequest.onsuccess = function (event) {
        hasSuccess = true;
        result = event.target.result;
      };
      getRequest.onerror = onError;
    },

    /**
     * Removes an object from the store.
     *
     * @param {*} key The id of the object to remove.
     * @param {Function} [onSuccess] A callback that is called if the removal
     *  was successful.
     * @param {Function} [onError] A callback that will be called if an error
     *  occurred during the operation.
     */
    remove: function (key, onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not remove data.', error);
      });
      onSuccess || (onSuccess = noop);

      var hasSuccess = false,
          result = null;

      var removeTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);
      removeTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      removeTransaction.onabort = onError;
      removeTransaction.onerror = onError;

      var deleteRequest = removeTransaction.objectStore(this.storeName)['delete'](key);
      deleteRequest.onsuccess = function (event) {
        hasSuccess = true;
        result = event.target.result;
      };
      deleteRequest.onerror = onError;
    },

    /**
     * Runs a batch of put and/or remove operations on the store.
     *
     * @param {Array} dataArray An array of objects containing the operation to run
     *  and the data object (for put operations).
     * @param {Function} [onSuccess] A callback that is called if all operations
     *  were successful.
     * @param {Function} [onError] A callback that is called if an error
     *  occurred during one of the operations.
     */
    batch: function (dataArray, onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not apply batch.', error);
      });
      onSuccess || (onSuccess = noop);

      if(Object.prototype.toString.call(dataArray) != '[object Array]'){
        onError(new Error('dataArray argument must be of type Array.'));
      }
      var batchTransaction = this.db.transaction([this.storeName] , this.consts.READ_WRITE);
      batchTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(hasSuccess);
      };
      batchTransaction.onabort = onError;
      batchTransaction.onerror = onError;
      
      var count = dataArray.length;
      var called = false;
      var hasSuccess = false;

      var onItemSuccess = function () {
        count--;
        if (count === 0 && !called) {
          called = true;
          hasSuccess = true;
        }
      };

      dataArray.forEach(function (operation) {
        var type = operation.type;
        var key = operation.key;
        var value = operation.value;

        var onItemError = function (err) {
          batchTransaction.abort();
          if (!called) {
            called = true;
            onError(err, type, key);
          }
        };

        if (type == "remove") {
          var deleteRequest = batchTransaction.objectStore(this.storeName)['delete'](key);
          deleteRequest.onsuccess = onItemSuccess;
          deleteRequest.onerror = onItemError;
        } else if (type == "put") {
          var putRequest;
          if (this.keyPath !== null) { // in-line keys
            this._addIdPropertyIfNeeded(value);
            putRequest = batchTransaction.objectStore(this.storeName).put(value);
          } else { // out-of-line keys
            putRequest = batchTransaction.objectStore(this.storeName).put(value, key);
          }
          putRequest.onsuccess = onItemSuccess;
          putRequest.onerror = onItemError;
        }
      }, this);
    },

    /**
     * Fetches all entries in the store.
     *
     * @param {Function} [onSuccess] A callback that is called if the operation
     *  was successful. Will receive an array of objects.
     * @param {Function} [onError] A callback that will be called if an error
     *  occurred during the operation.
     */
    getAll: function (onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not read data.', error);
      });
      onSuccess || (onSuccess = noop);
      var getAllTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);
      var store = getAllTransaction.objectStore(this.storeName);
      if (store.getAll) {
        this._getAllNative(getAllTransaction, store, onSuccess, onError);
      } else {
        this._getAllCursor(getAllTransaction, store, onSuccess, onError);
      }
    },

    /**
     * Implements getAll for IDB implementations that have a non-standard
     * getAll() method.
     *
     * @param {Object} getAllTransaction An open READ transaction.
     * @param {Object} store A reference to the store.
     * @param {Function} onSuccess A callback that will be called if the
     *  operation was successful.
     * @param {Function} onError A callback that will be called if an
     *  error occurred during the operation.
     * @private
     */
    _getAllNative: function (getAllTransaction, store, onSuccess, onError) {
      var hasSuccess = false,
          result = null;

      getAllTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      getAllTransaction.onabort = onError;
      getAllTransaction.onerror = onError;

      var getAllRequest = store.getAll();
      getAllRequest.onsuccess = function (event) {
        hasSuccess = true;
        result = event.target.result;
      };
      getAllRequest.onerror = onError;
    },

    /**
     * Implements getAll for IDB implementations that do not have a getAll()
     * method.
     *
     * @param {Object} getAllTransaction An open READ transaction.
     * @param {Object} store A reference to the store.
     * @param {Function} onSuccess A callback that will be called if the
     *  operation was successful.
     * @param {Function} onError A callback that will be called if an
     *  error occurred during the operation.
     * @private
     */
    _getAllCursor: function (getAllTransaction, store, onSuccess, onError) {
      var all = [],
          hasSuccess = false,
          result = null;

      getAllTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      getAllTransaction.onabort = onError;
      getAllTransaction.onerror = onError;

      var cursorRequest = store.openCursor();
      cursorRequest.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          all.push(cursor.value);
          cursor['continue']();
        }
        else {
          hasSuccess = true;
          result = all;
        }
      };
      cursorRequest.onError = onError;
    },

    /**
     * Clears the store, i.e. deletes all entries in the store.
     *
     * @param {Function} [onSuccess] A callback that will be called if the
     *  operation was successful.
     * @param {Function} [onError] A callback that will be called if an
     *  error occurred during the operation.
     */
    clear: function (onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not clear store.', error);
      });
      onSuccess || (onSuccess = noop);

      var hasSuccess = false,
          result = null;

      var clearTransaction = this.db.transaction([this.storeName], this.consts.READ_WRITE);
      clearTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      clearTransaction.onabort = onError;
      clearTransaction.onerror = onError;

      var clearRequest = clearTransaction.objectStore(this.storeName).clear();
      clearRequest.onsuccess = function (event) {
        hasSuccess = true;
        result = event.target.result;
      };
      clearRequest.onerror = onError;
    },

    /**
     * Checks if an id property needs to present on a object and adds one if
     * necessary.
     *
     * @param {Object} dataObj The data object that is about to be stored
     * @private
     */
    _addIdPropertyIfNeeded: function (dataObj) {
      if (!this.features.hasAutoIncrement && typeof dataObj[this.keyPath] == 'undefined') {
        dataObj[this.keyPath] = this._insertIdCount++ + Date.now();
      }
    },

    /************
     * indexing *
     ************/

    /**
     * Returns a DOMStringList of index names of the store.
     *
     * @return {DOMStringList} The list of index names
     */
    getIndexList: function () {
      return this.store.indexNames;
    },

    /**
     * Checks if an index with the given name exists in the store.
     *
     * @param {String} indexName The name of the index to look for
     * @return {Boolean} Whether the store contains an index with the given name
     */
    hasIndex: function (indexName) {
      return this.store.indexNames.contains(indexName);
    },

    /**
     * Normalizes an object containing index data and assures that all
     * properties are set.
     *
     * @param {Object} indexData The index data object to normalize
     * @param {String} indexData.name The name of the index
     * @param {String} [indexData.keyPath] The key path of the index
     * @param {Boolean} [indexData.unique] Whether the index is unique
     * @param {Boolean} [indexData.multiEntry] Whether the index is multi entry
     */
    normalizeIndexData: function (indexData) {
      indexData.keyPath = indexData.keyPath || indexData.name;
      indexData.unique = !!indexData.unique;
      indexData.multiEntry = !!indexData.multiEntry;
    },

    /**
     * Checks if an actual index complies with an expected index.
     *
     * @param {Object} actual The actual index found in the store
     * @param {Object} expected An Object describing an expected index
     * @return {Boolean} Whether both index definitions are identical
     */
    indexComplies: function (actual, expected) {
      var complies = ['keyPath', 'unique', 'multiEntry'].every(function (key) {
        // IE10 returns undefined for no multiEntry
        if (key == 'multiEntry' && actual[key] === undefined && expected[key] === false) {
          return true;
        }
        return expected[key] == actual[key];
      });
      return complies;
    },

    /**********
     * cursor *
     **********/

    /**
     * Iterates over the store using the given options and calling onItem
     * for each entry matching the options.
     *
     * @param {Function} onItem A callback to be called for each match
     * @param {Object} [options] An object defining specific options
     * @param {Object} [options.index=null] An IDBIndex to operate on
     * @param {String} [options.order=ASC] The order in which to provide the
     *  results, can be 'DESC' or 'ASC'
     * @param {Boolean} [options.autoContinue=true] Whether to automatically
     *  iterate the cursor to the next result
     * @param {Boolean} [options.filterDuplicates=false] Whether to exclude
     *  duplicate matches
     * @param {Object} [options.keyRange=null] An IDBKeyRange to use
     * @param {Boolean} [options.writeAccess=false] Whether grant write access
     *  to the store in the onItem callback
     * @param {Function} [options.onEnd=null] A callback to be called after
     *  iteration has ended
     * @param {Function} [options.onError=console.error] A callback to be called
     *  if an error occurred during the operation.
     */
    iterate: function (onItem, options) {
      options = mixin({
        index: null,
        order: 'ASC',
        autoContinue: true,
        filterDuplicates: false,
        keyRange: null,
        writeAccess: false,
        onEnd: null,
        onError: function (error) {
          console.error('Could not open cursor.', error);
        }
      }, options || {});

      var directionType = options.order.toLowerCase() == 'desc' ? 'PREV' : 'NEXT';
      if (options.filterDuplicates) {
        directionType += '_NO_DUPLICATE';
      }

      var hasSuccess = false;
      var cursorTransaction = this.db.transaction([this.storeName], this.consts[options.writeAccess ? 'READ_WRITE' : 'READ_ONLY']);
      var cursorTarget = cursorTransaction.objectStore(this.storeName);
      if (options.index) {
        cursorTarget = cursorTarget.index(options.index);
      }

      cursorTransaction.oncomplete = function () {
        if (!hasSuccess) {
          options.onError(null);
          return;
        }
        if (options.onEnd) {
          options.onEnd();
        } else {
          onItem(null);
        }
      };
      cursorTransaction.onabort = options.onError;
      cursorTransaction.onerror = options.onError;

      var cursorRequest = cursorTarget.openCursor(options.keyRange, this.consts[directionType]);
      cursorRequest.onerror = options.onError;
      cursorRequest.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          onItem(cursor.value, cursor, cursorTransaction);
          if (options.autoContinue) {
            cursor['continue']();
          }
        } else {
          hasSuccess = true;
        }
      };
    },

    /**
     * Runs a query against the store and passes an array containing matched
     * objects to the success handler.
     *
     * @param {Function} onSuccess A callback to be called when the operation
     *  was successful.
     * @param {Object} [options] An object defining specific query options
     * @param {Object} [options.index=null] An IDBIndex to operate on
     * @param {String} [options.order=ASC] The order in which to provide the
     *  results, can be 'DESC' or 'ASC'
     * @param {Boolean} [options.filterDuplicates=false] Whether to exclude
     *  duplicate matches
     * @param {Object} [options.keyRange=null] An IDBKeyRange to use
     * @param {Function} [options.onError=console.error] A callback to be called if an error
     *  occurred during the operation.
     */
    query: function (onSuccess, options) {
      var result = [];
      options = options || {};
      options.onEnd = function () {
        onSuccess(result);
      };
      this.iterate(function (item) {
        result.push(item);
      }, options);
    },

    /**
     *
     * Runs a query against the store, but only returns the number of matches
     * instead of the matches itself.
     *
     * @param {Function} onSuccess A callback to be called if the opration
     *  was successful.
     * @param {Object} [options] An object defining specific options
     * @param {Object} [options.index=null] An IDBIndex to operate on
     * @param {Object} [options.keyRange=null] An IDBKeyRange to use
     * @param {Function} [options.onError=console.error] A callback to be called if an error
     *  occurred during the operation.
     */
    count: function (onSuccess, options) {

      options = mixin({
        index: null,
        keyRange: null
      }, options || {});

      var onError = options.onError || function (error) {
        console.error('Could not open cursor.', error);
      };

      var hasSuccess = false,
          result = null;

      var cursorTransaction = this.db.transaction([this.storeName], this.consts.READ_ONLY);
      cursorTransaction.oncomplete = function () {
        var callback = hasSuccess ? onSuccess : onError;
        callback(result);
      };
      cursorTransaction.onabort = onError;
      cursorTransaction.onerror = onError;

      var cursorTarget = cursorTransaction.objectStore(this.storeName);
      if (options.index) {
        cursorTarget = cursorTarget.index(options.index);
      }
      var countRequest = cursorTarget.count(options.keyRange);
      countRequest.onsuccess = function (evt) {
        hasSuccess = true;
        result = evt.target.result;
      };
      countRequest.onError = onError;
    },

    /**************/
    /* key ranges */
    /**************/

    /**
     * Creates a key range using specified options. This key range can be
     * handed over to the count() and iterate() methods.
     *
     * Note: You must provide at least one or both of "lower" or "upper" value.
     *
     * @param {Object} options The options for the key range to create
     * @param {*} [options.lower] The lower bound
     * @param {Boolean} [options.excludeLower] Whether to exclude the lower
     *  bound passed in options.lower from the key range
     * @param {*} [options.upper] The upper bound
     * @param {Boolean} [options.excludeUpper] Whether to exclude the upper
     *  bound passed in options.upper from the key range
     * @return {Object} The IDBKeyRange representing the specified options
     */
    makeKeyRange: function(options){
      /*jshint onecase:true */
      var keyRange,
          hasLower = typeof options.lower != 'undefined',
          hasUpper = typeof options.upper != 'undefined';

      switch(true){
        case hasLower && hasUpper:
          keyRange = this.keyRange.bound(options.lower, options.upper, options.excludeLower, options.excludeUpper);
          break;
        case hasLower:
          keyRange = this.keyRange.lowerBound(options.lower, options.excludeLower);
          break;
        case hasUpper:
          keyRange = this.keyRange.upperBound(options.upper, options.excludeUpper);
          break;
        default:
          throw new Error('Cannot create KeyRange. Provide one or both of "lower" or "upper" value.');
      }

      return keyRange;

    }

  };

  /** helpers **/

  var noop = function () {
  };
  var empty = {};
  var mixin = function (target, source) {
    var name, s;
    for (name in source) {
      s = source[name];
      if (s !== empty[name] && s !== target[name]) {
        target[name] = s;
      }
    }
    return target;
  };

  IDBStore.version = IDBStore.prototype.version;

  return IDBStore;

}, this);

})()
},{}],36:[function(require,module,exports){
(function(){var Buffer = require('buffer').Buffer;

module.exports = isBuffer;

function isBuffer (o) {
  return Buffer.isBuffer(o)
    || /\[object (.+Array|Array.+)\]/.test(Object.prototype.toString.call(o));
}

})()
},{"buffer":11}],37:[function(require,module,exports){
(function(process){var EventEmitter = require('events').EventEmitter
var next         = process.nextTick
var SubDb        = require('./sub')
var fixRange     = require('level-fix-range')

var Hooks   = require('level-hooks')

module.exports   = function (db, options) {
  if (db.sublevel) return db

  options = options || {}

  //use \xff (255) as the seperator,
  //so that sections of the database will sort after the regular keys
  var sep = options.sep = options.sep || '\xff'
  db._options = options

  Hooks(db)

  db.sublevels = {}

  db.sublevel = function (prefix, options) {
    if(db.sublevels[prefix])
      return db.sublevels[prefix]
    return new SubDb(db, prefix, options || this._options)
  }

  db.methods = {}

  db.prefix = function (key) {
    return '' + (key || '')
  }

  db.pre = function (range, hook) {
    if(!hook)
      hook = range, range = {
        max  : sep
      }
    return db.hooks.pre(range, hook)
  }

  db.post = function (range, hook) {
    if(!hook)
      hook = range, range = {
        max : sep
      }
    return db.hooks.post(range, hook)
  }

  function safeRange(fun) {
    return function (opts) {
      opts = opts || {}
      fixRange(opts)

      if(opts.reverse) opts.start = opts.start || sep
      else             opts.end   = opts.end || sep

      return fun.call(db, opts)
    }
  }

  db.readStream =
  db.createReadStream  = safeRange(db.createReadStream)
  db.keyStream =
  db.createKeyStream   = safeRange(db.createKeyStream)
  db.valuesStream =
  db.createValueStream = safeRange(db.createValueStream)
  
  var batch = db.batch
  db.batch = function (changes, opts, cb) {
    if(!Array.isArray(changes))
      throw new Error('batch must be passed an Array')
    changes.forEach(function (e) {
      if(e.prefix) {
        if('function' === typeof e.prefix.prefix)
          e.key = e.prefix.prefix(e.key)
        else if('string'  === typeof e.prefix)
          e.key = e.prefix + e.key
      }
    })
    batch.call(db, changes, opts, cb)
  }
  return db
}


})(require("__browserify_process"))
},{"./sub":47,"__browserify_process":23,"events":5,"level-fix-range":38,"level-hooks":39}],38:[function(require,module,exports){

module.exports = 
function fixRange(opts) {
  var reverse = opts.reverse
  var end     = opts.max || opts.end
  var start   = opts.min || opts.start

  var range = [start, end]
  if(start != null && end != null)
    range.sort()
  if(reverse)
    range = range.reverse()

  opts.start   = range[0]
  opts.end     = range[1]

  delete opts.min
  delete opts.max

  return opts
}


},{}],39:[function(require,module,exports){
var ranges = require('string-range')

module.exports = function (db) {

  if(db.hooks) {
    return     
  }

  var posthooks = []
  var prehooks  = []

  function getPrefix (p) {
    return p && (
        'string' ===   typeof p        ? p
      : 'string' ===   typeof p.prefix ? p.prefix
      : 'function' === typeof p.prefix ? p.prefix()
      :                                  ''
      )
  }

  function getKeyEncoding (db) {
    if(db && db._getKeyEncoding)
      return db._getKeyEncoding(db)
  }

  function getValueEncoding (db) {
    if(db && db._getValueEncoding)
      return db._getValueEncoding(db)
  }

  function remover (array, item) {
    return function () {
      var i = array.indexOf(item)
      if(!~i) return false        
      array.splice(i, 1)
      return true
    }
  }

  db.hooks = {
    post: function (prefix, hook) {
      if(!hook) hook = prefix, prefix = ''
      var h = {test: ranges.checker(prefix), hook: hook}
      posthooks.push(h)
      return remover(posthooks, h)
    },
    pre: function (prefix, hook) {
      if(!hook) hook = prefix, prefix = ''
      var h = {test: ranges.checker(prefix), hook: hook}
      prehooks.push(h)
      return remover(prehooks, h)
    },
    posthooks: posthooks,
    prehooks: prehooks
  }

  //POST HOOKS

  function each (e) {
    if(e && e.type) {
      posthooks.forEach(function (h) {
        if(h.test(e.key)) h.hook(e)
      })
    }
  }

  db.on('put', function (key, val) {
    each({type: 'put', key: key, value: val})
  })
  db.on('del', function (key, val) {
    each({type: 'del', key: key, value: val})
  })
  db.on('batch', function onBatch (ary) {
    ary.forEach(each)
  })

  //PRE HOOKS

  var put = db.put
  var del = db.del
  var batch = db.batch

  function callHooks (isBatch, b, opts, cb) {
    try {
    b.forEach(function hook(e, i) {
      prehooks.forEach(function (h) {
        if(h.test(String(e.key))) {
          //optimize this?
          //maybe faster to not create a new object each time?
          //have one object and expose scope to it?
          var context = {
            add: function (ch, db) {
              if(typeof ch === 'undefined') {
                return this
              }
              if(ch === false)
                return delete b[i]
              var prefix = (
                getPrefix(ch.prefix) || 
                getPrefix(db) || 
                h.prefix || ''
              )
              ch.key = prefix + ch.key
              if(h.test(String(ch.key))) {
                //this usually means a stack overflow.
                throw new Error('prehook cannot insert into own range')
              }
              var ke = ch.keyEncoding   || getKeyEncoding(ch.prefix)
              var ve = ch.valueEncoding || getValueEncoding(ch.prefix)
              if(ke) ch.keyEncoding = ke
              if(ve) ch.valueEncoding = ve

              b.push(ch)
              hook(ch, b.length - 1)
              return this
            },
            put: function (ch, db) {
              if('object' === typeof ch) ch.type = 'put'
              return this.add(ch, db)
            },
            del: function (ch, db) {
              if('object' === typeof ch) ch.type = 'del'
              return this.add(ch, db)
            },
            veto: function () {
              return this.add(false)
            }
          }
          h.hook.call(context, e, context.add, b)
        }
      })
    })
    } catch (err) {
      return (cb || opts)(err)
    }
    b = b.filter(function (e) {
      return e && e.type //filter out empty items
    })

    if(b.length == 1 && !isBatch) {
      var change = b[0]
      return change.type == 'put' 
        ? put.call(db, change.key, change.value, opts, cb) 
        : del.call(db, change.key, opts, cb)  
    }
    return batch.call(db, b, opts, cb)
  }

  db.put = function (key, value, opts, cb ) {
    var batch = [{key: key, value: value, type: 'put'}]
    return callHooks(false, batch, opts, cb)
  }

  db.del = function (key, opts, cb) {
    var batch = [{key: key, type: 'del'}]
    return callHooks(false, batch, opts, cb)
  }

  db.batch = function (batch, opts, cb) {
    return callHooks(true, batch, opts, cb)
  }
}

},{"string-range":40}],40:[function(require,module,exports){

//force to a valid range
var range = exports.range = function (obj) {
  return null == obj ? {} : 'string' === typeof range ? {
      min: range, max: range + '\xff'
    } :  obj
}

//turn into a sub range.
var prefix = exports.prefix = function (range, within, term) {
  range = exports.range(range)
  var _range = {}
  term = term || '\xff'
  if(range instanceof RegExp || 'function' == typeof range) {
    _range.min = within
    _range.max   = within + term,
    _range.inner = function (k) {
      var j = k.substring(within.length)
      if(range.test)
        return range.test(j)
      return range(j)
    }
  }
  else if('object' === typeof range) {
    _range.min = within + (range.min || range.start || '')
    _range.max = within + (range.max || range.end   || (term || '~'))
    _range.reverse = !!range.reverse
  }
  return _range
}

//return a function that checks a range
var checker = exports.checker = function (range) {
  if(!range) range = {}

  if ('string' === typeof range)
    return function (key) {
      return key.indexOf(range) == 0
    }
  else if(range instanceof RegExp)
    return function (key) {
      return range.test(key)
    }
  else if('object' === typeof range)
    return function (key) {
      var min = range.min || range.start
      var max = range.max || range.end

      // fixes keys passed as ints from sublevels
      key = String(key)

      return (
        !min || key >= min
      ) && (
        !max || key <= max
      ) && (
        !range.inner || (
          range.inner.test 
            ? range.inner.test(key)
            : range.inner(key)
        )
      )
    }
  else if('function' === typeof range)
    return range
}
//check if a key is within a range.
var satifies = exports.satisfies = function (key, range) {
  return checker(range)(key)
}



},{}],41:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],42:[function(require,module,exports){
var Keys = require("object-keys")
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

},{"./has-keys":41,"object-keys":43}],43:[function(require,module,exports){
module.exports = Object.keys || require('./shim');


},{"./shim":46}],44:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function forEach (obj, fn, ctx) {
    if (typeof fn !== 'function') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],45:[function(require,module,exports){

/**!
 * is
 * the definitive JavaScript type testing library
 * 
 * @copyright 2013 Enrico Marino
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toString = objProto.toString;
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  "boolean": 1,
  "number": 1,
  "string": 1,
  "undefined": 1
};

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a =
is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return value !== undefined;
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toString.call(value);
  var key;

  if ('[object Array]' === type || '[object Arguments]' === type) {
    return value.length === 0;
  }

  if ('[object Object]' === type) {
    for (key in value) if (owns.call(value, key)) return false;
    return true;
  }

  if ('[object String]' === type) {
    return '' === value;
  }

  return false;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function (value, other) {
  var type = toString.call(value)
  var key;

  if (type !== toString.call(other)) {
    return false;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Array]' === type) {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Function]' === type) {
    return value.prototype === other.prototype;
  }

  if ('[object Date]' === type) {
    return value.getTime() === other.getTime();
  }

  return value === other;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is['null'] = function (value) {
  return value === null;
};

/**
 * is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undefined = function (value) {
  return value === undefined;
};

/**
 * Test arguments.
 */

/**
 * is.arguments
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arguments = function (value) {
  var isStandardArguments = '[object Arguments]' === toString.call(value);
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = function (value) {
  return '[object Array]' === toString.call(value);
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.arguments.empty = function (value) {
  return is.arguments(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.boolean(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.boolean
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.boolean = function (value) {
  return '[object Boolean]' === toString.call(value);
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.boolean(value) && (value === false || value.valueOf() === false);
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.boolean(value) && (value === true || value.valueOf() === true);
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return '[object Date]' === toString.call(value);
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return '[object Error]' === toString.call(value);
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || '[object Function]' === toString.call(value);
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return '[object Number]' === toString.call(value);
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.int
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.int = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return value && '[object Object]' === toString.call(value);
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return '[object RegExp]' === toString.call(value);
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return '[object String]' === toString.call(value);
};


},{}],46:[function(require,module,exports){
(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
		is = require('is'),
		forEach = require('foreach'),
		hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
		dontEnums = [
			"toString",
			"toLocaleString",
			"valueOf",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"constructor"
		],
		keysShim;

	keysShim = function keys(object) {
		if (!is.object(object) && !is.array(object)) {
			throw new TypeError("Object.keys called on a non-object");
		}

		var name, theKeys = [];
		for (name in object) {
			if (has.call(object, name)) {
				theKeys.push(name);
			}
		}

		if (hasDontEnumBug) {
			forEach(dontEnums, function (dontEnum) {
				if (has.call(object, dontEnum)) {
					theKeys.push(dontEnum);
				}
			});
		}
		return theKeys;
	};

	module.exports = keysShim;
}());


},{"foreach":44,"is":45}],47:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
var inherits     = require('util').inherits
var ranges       = require('string-range')
var fixRange     = require('level-fix-range')
var xtend        = require('xtend')

inherits(SubDB, EventEmitter)

function SubDB (db, prefix, options) {
  if('string' === typeof options) {
    console.error('db.sublevel(name, seperator<string>) is depreciated')
    console.error('use db.sublevel(name, {sep: separator})) if you must')
    options = {sep: options}
  }
  if(!(this instanceof SubDB)) return new SubDB(db, prefix, options)
  if(!db)     throw new Error('must provide db')
  if(!prefix) throw new Error('must provide prefix')

  options = options || {}
  options.sep = options.sep || '\xff'
  
  this._parent = db
  this._options = options
  this.options = options
  this._prefix = prefix
  this._root = root(this)
  db.sublevels[prefix] = this
  this.sublevels = {}
  this.methods = {}
  var self = this
  this.hooks = {
    pre: function () {
      return self.pre.apply(self, arguments)
    },
    post: function () {
      return self.post.apply(self, arguments)
    }
  }
}

var SDB = SubDB.prototype

SDB._key = function (key) {
  var sep = this._options.sep
  return sep
    + this._prefix 
    + sep
    + key
}

SDB._getOptsAndCb = function (opts, cb) {
  if (typeof opts == 'function') { 
    cb = opts
    opts = {}
  }
  return { opts: xtend(opts, this._options), cb: cb }
}

SDB.sublevel = function (prefix, options) {
  if(this.sublevels[prefix])
    return this.sublevels[prefix]
  return new SubDB(this, prefix, options || this._options)
}

SDB.put = function (key, value, opts, cb) {
  var res = this._getOptsAndCb(opts, cb)
  this._root.put(this.prefix(key), value, res.opts, res.cb)
}

SDB.get = function (key, opts, cb) {
  var res = this._getOptsAndCb(opts, cb)
  this._root.get(this.prefix(key), res.opts, res.cb)
}

SDB.del = function (key, opts, cb) {
  var res = this._getOptsAndCb(opts, cb)
  this._root.del(this.prefix(key), res.opts, res.cb)
}

SDB.batch = function (changes, opts, cb) {
  if(!Array.isArray(changes))
    throw new Error('batch must be passed an Array')
  var self = this
  changes.forEach(function (ch) {

    //OH YEAH, WE NEED TO VALIDATE THAT UPDATING THIS KEY/PREFIX IS ALLOWED
    if('string' === typeof ch.prefix)
      ch.key = ch.prefix + ch.key
    else
      ch.key = (ch.prefix || self).prefix(ch.key)

    if(ch.prefix) ch.prefix = null
  })
  this._root.batch(changes, opts, cb)
}

SDB._getKeyEncoding = function () {
  if(this.options.keyEncoding)
    return this.options.keyEncoding
  if(this._parent && this._parent._getKeyEncoding)
    return this.parent._getKeyEncoding()
}

SDB._getValueEncoding = function () {
  if(this.options.valueEncoding)
    return this.options.valueEncoding
  if(this._parent && this._parent._getValueEncoding)
    return this.parent._getValueEncoding()
}

SDB.prefix = function (key) {
  var sep = this._options.sep
  return this._parent.prefix() + sep + this._prefix + sep + (key || '')
}

SDB.keyStream =
SDB.createKeyStream = function (opts) {
  opts = opts || {}
  opts.keys = true
  opts.values = false
  return this.createReadStream(opts)
}

SDB.valueStream =
SDB.createValueStream = function (opts) {
  opts = opts || {}
  opts.keys = false
  opts.values = true
  opts.keys = false
  return this.createReadStream(opts)
}

function selectivelyMerge(_opts, opts) {
  [ 'valueEncoding'
  , 'encoding'
  , 'keyEncoding'
  , 'reverse'
  , 'values'
  , 'keys'
  , 'limit'
  , 'fillCache'
  ]
  .forEach(function (k) {
    if (opts.hasOwnProperty(k)) _opts[k] = opts[k]        
  })
}

SDB.readStream = 
SDB.createReadStream = function (opts) {
  opts = opts || {}
  var r = root(this)
  var p = this.prefix()

  var _opts = ranges.prefix(opts, p)
  selectivelyMerge(_opts, xtend(opts, this._options))

  var s = r.createReadStream(_opts)

  if(_opts.values === false) {
    var emit = s.emit
    s.emit = function (event, val) {
      if(event === 'data') {
        emit.call(this, 'data', val.substring(p.length))
      } else
        emit.call(this, event, val)
    }
    return s
  } else if(_opts.keys === false)
    return s
  else
    return s.on('data', function (d) {
      //mutate the prefix!
      //this doesn't work for createKeyStream admittedly.
      d.key = d.key.substring(p.length)
    })
}


SDB.writeStream =
SDB.createWriteStream = function () {
  var r = root(this)
  var p = this.prefix()
  var ws = r.createWriteStream.apply(r, arguments)
  var write = ws.write

  var encoding = this._options.encoding
  var valueEncoding = this._options.valueEncoding
  var keyEncoding = this._options.keyEncoding

  // slight optimization, if no encoding was specified at all,
  // which will be the case most times, make write not check at all
  var nocheck = !encoding && !valueEncoding && !keyEncoding

  ws.write = nocheck 
    ? function (data) {
        data.key = p + data.key
        return write.call(ws, data)
      }
    : function (data) {
        data.key = p + data.key
        
        // not merging all options here since this happens on every write and things could get slowed down
        // at this point we only consider encoding important to propagate
        if (encoding && typeof data.encoding === 'undefined')
          data.encoding = encoding
        if (valueEncoding && typeof data.valueEncoding === 'undefined')
          data.valueEncoding = valueEncoding
        if (keyEncoding && typeof data.keyEncoding === 'undefined')
          data.keyEncoding = keyEncoding

        return write.call(ws, data)
      }
  return ws
}

SDB.approximateSize = function () {
  var r = root(db)
  return r.approximateSize.apply(r, arguments)
}

function root(db) {
  if(!db._parent) return db
  return root(db._parent)
}

SDB.pre = function (range, hook) {
  if(!hook) hook = range, range = null
  range = ranges.prefix(range, this.prefix(), this._options.sep)
  var r = root(this._parent)
  var p = this.prefix()
  return r.hooks.pre(fixRange(range), function (ch, add) {
    hook({
      key: ch.key.substring(p.length),
      value: ch.value,
      type: ch.type
    }, function (ch, _p) {
      //maybe remove the second add arg now
      //that op can have prefix?
      add(ch, ch.prefix ? _p : (_p || p))
    })
  })
}

SDB.post = function (range, hook) {
  if(!hook) hook = range, range = null
  var r = root(this._parent)
  var p = this.prefix()
  range = ranges.prefix(range, p, this._options.sep)
  return r.hooks.post(fixRange(range), function (data) {
    hook({key: data.key.substring(p.length), value: data.value, type: data.type})
  })
}

var exports = module.exports = SubDB


},{"events":5,"level-fix-range":38,"string-range":40,"util":9,"xtend":42}],48:[function(require,module,exports){
/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License
 * <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var createError  = require('errno').custom.createError
  , LevelUPError = createError('LevelUPError')

module.exports = {
    LevelUPError        : LevelUPError
  , InitializationError : createError('InitializationError', LevelUPError)
  , OpenError           : createError('OpenError', LevelUPError)
  , ReadError           : createError('ReadError', LevelUPError)
  , WriteError          : createError('WriteError', LevelUPError)
  , NotFoundError       : createError('NotFoundError', LevelUPError)
  , EncodingError       : createError('EncodingError', LevelUPError)
}

},{"errno":69}],49:[function(require,module,exports){
(function(process){/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License
 * <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var EventEmitter   = require('events').EventEmitter
  , inherits       = require('util').inherits
  , extend         = require('xtend')
  , prr            = require('prr')

  , errors         = require('./errors')
  , readStream     = require('./read-stream')
  , writeStream    = require('./write-stream')
  , util           = require('./util')

  , toEncoding     = util.toEncoding
  , toSlice        = util.toSlice
  , getOptions     = util.getOptions
  , defaultOptions = util.defaultOptions
  , getLevelDOWN   = util.getLevelDOWN


  , createLevelUP = function (location, options, callback) {

      // Possible status values:
      //  - 'new'     - newly created, not opened or closed
      //  - 'opening' - waiting for the database to be opened, post open()
      //  - 'open'    - successfully opened the database, available for use
      //  - 'closing' - waiting for the database to be closed, post close()
      //  - 'closed'  - database has been successfully closed, should not be
      //                 used except for another open() operation

      var status = 'new'
        , error
        , levelup

        , isOpen        = function () { return status == 'open' }
        , isOpening     = function () { return status == 'opening' }

        , dispatchError = function (error, callback) {
            return typeof callback == 'function'
              ? callback(error)
              : levelup.emit('error', error)
          }

        , getCallback = function (options, callback) {
            return typeof options == 'function' ? options : callback
          }

        , deferred = [ 'get', 'put', 'batch', 'del', 'approximateSize' ]
            .reduce(function (o, method) {
              o[method] = function () {
                var args = Array.prototype.slice.call(arguments)
                levelup.once('ready', function () {
                  levelup.db[method].apply(levelup.db, args)
                })
              }
              return o
            }, {})

      if (typeof options == 'function') {
        callback = options
        options  = {}
      }

      options = getOptions(levelup, options)

      if (typeof location != 'string') {
        error = new errors.InitializationError(
            'Must provide a location for the database')
        if (callback)
          return callback(error)
        throw error
      }

      function LevelUP (location, options) {
        EventEmitter.call(this)
        this.setMaxListeners(Infinity)

        this.options = extend(defaultOptions, options)
        // set this.location as enumerable but not configurable or writable
        prr(this, 'location', location, 'e')
      }

      inherits(LevelUP, EventEmitter)

      LevelUP.prototype.open = function (callback) {
        var self = this
        if (isOpen()) {
          if (callback) {
            process.nextTick(function () { callback(null, self) })
          }
          return self
        }

        if (isOpening()) {
          return callback && levelup.once(
              'open'
            , function () { callback(null, self) }
          )
        }

        levelup.emit('opening')

        status = 'opening'
        self.db = deferred

        var dbFactory = levelup.options.db || getLevelDOWN()
          , db        = dbFactory(levelup.location)

        db.open(levelup.options, function (err) {
          if (err) {
            err = new errors.OpenError(err)
            return dispatchError(err, callback)
          } else {
            levelup.db = db
            status = 'open'
            if (callback)
              callback(null, levelup)
            levelup.emit('open')
            levelup.emit('ready')
          }
        })
      }

      LevelUP.prototype.close = function (callback) {
        if (isOpen()) {
          status = 'closing'
          this.db.close(function () {
            status = 'closed'
            levelup.emit('closed')
            if (callback)
              callback.apply(null, arguments)
          })
          levelup.emit('closing')
          this.db = null
        } else if (status == 'closed' && callback) {
          callback()
        } else if (status == 'closing' && callback) {
          levelup.once('closed', callback)
        } else if (isOpening()) {
          levelup.once('open', function () {
            levelup.close(callback)
          })
        }
      }

      LevelUP.prototype.isOpen = function () { return isOpen() }

      LevelUP.prototype.isClosed = function () { return (/^clos/).test(status) }

      LevelUP.prototype.get = function (key_, options, callback) {
        var key
          , valueEnc
          , err

        callback = getCallback(options, callback)

        if (typeof callback != 'function') {
          err = new errors.ReadError('get() requires key and callback arguments')
          return dispatchError(err)
        }

        if (!isOpening() && !isOpen()) {
          err = new errors.ReadError('Database is not open')
          return dispatchError(err, callback)
        }

        options  = getOptions(levelup, options)
        key      = toSlice[options.keyEncoding](key_)
        valueEnc = options.valueEncoding
        options.asBuffer = valueEnc != 'utf8' && valueEnc != 'json'

        this.db.get(key, options, function (err, value) {
          if (err) {
            if ((/notfound/i).test(err)) {
              err = new errors.NotFoundError(
                  'Key not found in database [' + key_ + ']', err)
            } else {
              err = new errors.ReadError(err)
            }
            return dispatchError(err, callback)
          }
          if (callback) {
            try {
              value = toEncoding[valueEnc](value)
            } catch (e) {
              return callback(new errors.EncodingError(e))
            }
            callback(null, value)
          }
        })
      }

      LevelUP.prototype.put = function (key_, value_, options, callback) {
        var err
          , key
          , value

        callback = getCallback(options, callback)

        if (key_ === null || key_ === undefined
              || value_ === null || value_ === undefined) {
          err = new errors.WriteError('put() requires key and value arguments')
          return dispatchError(err, callback)
        }

        if (!isOpening() && !isOpen()) {
          err = new errors.WriteError('Database is not open')
          return dispatchError(err, callback)
        }

        options = getOptions(levelup, options)
        key     = toSlice[options.keyEncoding](key_)
        value   = toSlice[options.valueEncoding](value_)

        this.db.put(key, value, options, function (err) {
          if (err) {
            err = new errors.WriteError(err)
            return dispatchError(err, callback)
          } else {
            levelup.emit('put', key_, value_)
            if (callback)
              callback()
          }
        })
      }

      LevelUP.prototype.del = function (key_, options, callback) {
        var err
          , key

        callback = getCallback(options, callback)

        if (key_ === null || key_ === undefined) {
          err = new errors.WriteError('del() requires a key argument')
          return dispatchError(err, callback)
        }

        if (!isOpening() && !isOpen()) {
          err = new errors.WriteError('Database is not open')
          return dispatchError(err, callback)
        }

        options = getOptions(levelup, options)
        key     = toSlice[options.keyEncoding](key_)

        this.db.del(key, options, function (err) {
          if (err) {
            err = new errors.WriteError(err)
            return dispatchError(err, callback)
          } else {
            levelup.emit('del', key_)
            if (callback)
              callback()
          }
        })
      }

      function Batch (db) {
        this.batch = db.batch()
        this.ops = []
      }

      Batch.prototype.put = function (key, value, options) {
        options = getOptions(levelup, options)

        if (key)
          key = toSlice[options.keyEncoding](key)
        if (value)
          value = toSlice[options.valueEncoding](value)

        try {
          this.batch.put(key, value)
        } catch (e) {
          throw new errors.WriteError(e)
        }
        this.ops.push({ type : 'put', key : key, value : value })

        return this
      }

      Batch.prototype.del = function (key, options) {
        options = getOptions(levelup, options)

        if (key)
          key = toSlice[options.keyEncoding](key)

        try {
          this.batch.del(key)
        } catch (err) {
          throw new errors.WriteError(err)
        }
        this.ops.push({ type : 'del', key : key })

        return this
      }

      Batch.prototype.clear = function () {
        try {
          this.batch.clear()
        } catch (err) {
          throw new errors.WriteError(err)
        }

        this.ops = []
        return this
      }

      Batch.prototype.write = function (callback) {
        var ops = this.ops
        try {
          this.batch.write(function (err) {
            if (err)
              return dispatchError(new errors.WriteError(err), callback)
            levelup.emit('batch', ops)
            if (callback)
              callback()
          })
        } catch (err) {
          throw new errors.WriteError(err)
        }
      }

      LevelUP.prototype.batch = function (arr, options, callback) {
        var keyEnc
          , valueEnc
          , err

        if (!arguments.length)
          return new Batch(this.db)

        callback = getCallback(options, callback)

        if (!Array.isArray(arr)) {
          err = new errors.WriteError('batch() requires an array argument')
          return dispatchError(err, callback)
        }

        if (!isOpening() && !isOpen()) {
          err = new errors.WriteError('Database is not open')
          return dispatchError(err, callback)
        }

        options  = getOptions(levelup, options)
        keyEnc   = options.keyEncoding
        valueEnc = options.valueEncoding

        arr = arr.map(function (e) {
          if (e.type === undefined || e.key === undefined) {
            return {}
          }

          // inherit encoding
          var kEnc = e.keyEncoding || keyEnc
            , vEnc = e.valueEncoding || e.encoding || valueEnc
            , o

          // If we're not dealing with plain utf8 strings or plain
          // Buffers then we have to do some work on the array to
          // encode the keys and/or values. This includes JSON types.
          if (kEnc != 'utf8' && kEnc != 'binary'
              || vEnc != 'utf8' && vEnc != 'binary') {
            o = { type: e.type, key: toSlice[kEnc](e.key) }

            if (e.value !== undefined)
              o.value = toSlice[vEnc](e.value)

            return o
          } else {
            return e
          }
        })

        this.db.batch(arr, options, function (err) {
          if (err) {
            err = new errors.WriteError(err)
            return dispatchError(err, callback)
          } else {
            levelup.emit('batch', arr)
            if (callback)
              callback()
          }
        })
      }

      // DEPRECATED: prefer accessing LevelDOWN for this: db.db.approximateSize()
      LevelUP.prototype.approximateSize = function (start, end, callback) {
        var err

        if (start === null || start === undefined
              || end === null || end === undefined
              || typeof callback != 'function') {
          err = new errors.ReadError('approximateSize() requires start, end and callback arguments')
          return dispatchError(err, callback)
        }

        if (!isOpening() && !isOpen()) {
          err = new errors.WriteError('Database is not open')
          return dispatchError(err, callback)
        }

        this.db.approximateSize(start, end, function (err, size) {
          if (err) {
            err = new errors.OpenError(err)
            return dispatchError(err, callback)
          } else if (callback)
            callback(null, size)
        })
      }

      LevelUP.prototype.readStream =
      LevelUP.prototype.createReadStream = function (options) {
        options = extend(this.options, options)
        return readStream.create(
            options
          , this
          , function (options) {
              return levelup.db.iterator(options)
            }
        )
      }

      LevelUP.prototype.keyStream =
      LevelUP.prototype.createKeyStream = function (options) {
        return this.readStream(extend(options, { keys: true, values: false }))
      }

      LevelUP.prototype.valueStream =
      LevelUP.prototype.createValueStream = function (options) {
        return this.readStream(extend(options, { keys: false, values: true }))
      }

      LevelUP.prototype.writeStream =
      LevelUP.prototype.createWriteStream = function (options) {
        return writeStream.create(extend(options), this)
      }

      LevelUP.prototype.toString = function () {
        return 'LevelUP'
      }

      levelup = new LevelUP(location, options)
      levelup.open(callback)
      return levelup
    }

  , utilStatic = function (name) {
      return function (location, callback) {
        getLevelDOWN()[name](location, callback || function () {})
      }
    }

module.exports         = createLevelUP
module.exports.copy    = util.copy
// DEPRECATED: prefer accessing LevelDOWN for this: require('leveldown').destroy()
module.exports.destroy = utilStatic('destroy')
// DEPRECATED: prefer accessing LevelDOWN for this: require('leveldown').repair()
module.exports.repair  = utilStatic('repair')

})(require("__browserify_process"))
},{"./errors":48,"./read-stream":51,"./util":52,"./write-stream":53,"__browserify_process":23,"events":5,"prr":70,"util":9,"xtend":73}],50:[function(require,module,exports){
function State () {
  this.ended = this._ready = this._reading = this._destroyed = this._paused = false
}

State.prototype.end = function() {
  this.ended = true
  this._destroyed = false
}

State.prototype.ready = function() {
  this._ready = true
}

State.prototype.destroy = function() {
  this._destroyed = true
}

State.prototype.pause = function() {
  this._paused = true
}

State.prototype.resume = function() {
  this._paused = false
}

State.prototype.read = function() {
  this._reading = true
}

State.prototype.endRead = function() {
  this._reading = false
}

State.prototype.canPause = function() {
  return !this.ended && !this._paused
}

State.prototype.canResume = function() {
  return !this.ended && this._paused
}

State.prototype.canRead = function() {
  return !this.ended && !this._reading && !this._paused
}

State.prototype.canCleanup = function() {
  return !this.ended && !this._reading
}

State.prototype.canEmitData = function() {
  return !this.ended && !this._destroyed
}

State.prototype.canEnd = function() {
  return !this.ended
}

module.exports = function () { return new State() }
},{}],51:[function(require,module,exports){
(function(Buffer){/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var Stream       = require('stream').Stream
  , bufferStream = require('simple-bufferstream')
  , inherits     = require('util').inherits
  , extend       = require('xtend')
  , errors       = require('./errors')
  , State        = require('./read-stream-state')

  , toEncoding   = require('./util').toEncoding
  , toSlice      = require('./util').toSlice

  , defaultOptions = { keys: true, values: true }

  , makeKeyValueData = function (key, keyEncoding, value, valueEncoding) {
      return {
          key: toEncoding[keyEncoding](key)
        , value: toEncoding[valueEncoding](value)
      }
    }
  , makeKeyData = function (key, keyEncoding) {
      return toEncoding[keyEncoding](key)
    }
  , makeValueData = function (_, __, value, valueEncoding) {
      return toEncoding[valueEncoding](value)
    }
  , makeNoData = function () { return null }

function ReadStream (options, db, iteratorFactory) {
  Stream.call(this)

  this._state = State()

  this._dataEvent = 'data'
  this.readable = true
  this.writable = false

  // purely to keep `db` around until we're done so it's not GCed if the user doesn't keep a ref
  this._db = db

  options = this._options = extend(defaultOptions, options)
  this._keyEncoding   = options.keyEncoding   || options.encoding
  this._valueEncoding = options.valueEncoding || options.encoding
  if (typeof this._options.start != 'undefined')
    this._options.start = toSlice[this._keyEncoding](this._options.start)
  if (typeof this._options.end != 'undefined')
    this._options.end = toSlice[this._keyEncoding](this._options.end)
  if (typeof this._options.limit != 'number')
    this._options.limit = -1
  this._options.keyAsBuffer   = this._keyEncoding != 'utf8'   && this._keyEncoding != 'json'
  this._options.valueAsBuffer = this._valueEncoding != 'utf8' && this._valueEncoding != 'json'

  this._makeData = this._options.keys && this._options.values
    ? makeKeyValueData : this._options.keys
      ? makeKeyData : this._options.values
        ? makeValueData : makeNoData

  var self = this
  var ready = function () {
    if (!self._state.canEmitData())
      return

    self._state.ready()
    self._iterator = iteratorFactory(self._options)
    self._read()
  }

  if (db.isOpen())
    ready()
  else
    db.once('ready', ready)
}

inherits(ReadStream, Stream)

ReadStream.prototype.destroy = function () {
  this._state.destroy()
  if (this._state.canCleanup())
    this._cleanup()
}

ReadStream.prototype.pause = function () {
  if (this._state.canPause()) {
    this._state.pause()
    this.emit('pause')
  }
}

ReadStream.prototype.resume = function () {
  if (this._state.canResume()) {
    this.emit('resume')
    this._state.resume()
    this._read()
  }
}

ReadStream.prototype.pipe = function (dest) {
  if (typeof dest.add == 'function' && this._options.type == 'fstream') {
    this._dataEvent = 'entry'
    var self = this
    this.on('entry', function (data) {
      var entry = bufferStream(new Buffer(data.value))
      entry.path = data.key.toString()
      entry.type = 'File'
      entry.props = {
          type: 'File'
        , path: data.key.toString()
      }
      entry.pause()
      if (dest.add(entry) === false)
        self.pause()
    })
  }
  return Stream.prototype.pipe.apply(this, arguments)
}

ReadStream.prototype._read = function () {
  var self = this
  if (this._state.canRead()) {
    this._state.read()
    this._iterator.next(function(err, key, value) {
      self._onData(err, key, value)
    })
  }
}

ReadStream.prototype._onData = function (err, key, value) {
  this._state.endRead()
  if (err || (key === undefined && value === undefined) || !this._state.canEmitData())
    return this._cleanup(err)
  this._read() // queue another read even tho we may not need it
  try {
    value = this._makeData(key, this._keyEncoding, value, this._valueEncoding)
  } catch (e) {
    return this.emit('error', new errors.EncodingError(e))
  }
  this.emit(this._dataEvent, value)
}

ReadStream.prototype._cleanup = function (err) {
  if (err)
    this.emit('error', err)

  if (!this._state.canEnd())
    return

  this._state.end()
  this.readable = false

  this.emit('end')

  if (this._iterator) {
    var self = this
    this._iterator.end(function () {
      self._iterator = null
      self.emit('close')
    })
  } else
    this.emit('close')
}

ReadStream.prototype.toString = function () {
  return 'LevelUP.ReadStream'
}

module.exports.create = function (options, db, iteratorFactory) {
  return new ReadStream(options, db, iteratorFactory)
}

})(require("__browserify_Buffer").Buffer)
},{"./errors":48,"./read-stream-state":50,"./util":52,"__browserify_Buffer":22,"simple-bufferstream":71,"stream":7,"util":9,"xtend":73}],52:[function(require,module,exports){
(function(process,global){/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License
 * <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var extend = require('xtend')
  , errors = require('./errors')
  , bops   = require('bops')

  , encodings = [
        'hex'
      , 'utf8'
      , 'utf-8'
      , 'ascii'
      , 'binary'
      , 'base64'
      , 'ucs2'
      , 'ucs-2'
      , 'utf16le'
      , 'utf-16le'
    ]

  , defaultOptions = {
        createIfMissing : true
      , errorIfExists   : false
      , keyEncoding     : 'utf8'
      , valueEncoding   : 'utf8'
      , compression     : true
    }

  , leveldown

  , toSlice = (function () {
      var slicers = {}
        , isBuffer = function (data) {
            return data === undefined || data === null || bops.is(data)
          }
      slicers.json = JSON.stringify
      slicers.utf8 = function (data) {
        return isBuffer(data) ? data : String(data)
      }
      encodings.forEach(function (enc) {
        if (slicers[enc]) return
        slicers[enc] = function (data) {
          return isBuffer(data) ? data : bops.from(data, enc)
        }
      })
      return slicers
    }())

  , toEncoding = (function () {
      var encoders = {}
      encoders.json = function (str) { return JSON.parse(str) }
      encoders.utf8 = function (str) { return str }
      encoders.binary = function (buffer) { return buffer }
      encodings.forEach(function (enc) {
        if (encoders[enc]) return
        encoders[enc] = function (buffer) { return bops.to(buffer, enc) }
      })
      return encoders
    }())

  , copy = function (srcdb, dstdb, callback) {
      srcdb.readStream()
        .pipe(dstdb.writeStream())
        .on('close', callback ? callback : function () {})
        .on('error', callback ? callback : function (err) { throw err })
    }

  , setImmediate = global.setImmediate || process.nextTick

  , encodingOpts = (function () {
      var eo = {}
      encodings.forEach(function (e) {
        eo[e] = { valueEncoding : e }
      })
      return eo
    }())

  , getOptions = function (levelup, options) {
      var s = typeof options == 'string' // just an encoding
      if (!s && options && options.encoding && !options.valueEncoding)
        options.valueEncoding = options.encoding
      return extend(
          (levelup && levelup.options) || {}
        , s ? encodingOpts[options] || encodingOpts[defaultOptions.valueEncoding]
            : options
      )
    }

  , getLevelDOWN = function () {
      if (leveldown)
        return leveldown

      var requiredVersion       = require('../package.json').devDependencies.leveldown
        , missingLevelDOWNError = 'Could not locate LevelDOWN, try `npm install leveldown`'
        , leveldownVersion

      try {
        leveldownVersion = require('leveldown/package').version
      } catch (e) {
        throw new errors.LevelUPError(missingLevelDOWNError)
      }

      if (!require('semver').satisfies(leveldownVersion, requiredVersion)) {
        throw new errors.LevelUPError(
            'Installed version of LevelDOWN ('
          + leveldownVersion
          + ') does not match required version ('
          + requiredVersion
          + ')'
        )
      }

      try {
        return leveldown = require('leveldown')
      } catch (e) {
        throw new errors.LevelUPError(missingLevelDOWNError)
      }
    }

module.exports = {
    defaultOptions : defaultOptions
  , toSlice        : toSlice
  , toEncoding     : toEncoding
  , copy           : copy
  , setImmediate   : setImmediate
  , getOptions     : getOptions
  , getLevelDOWN   : getLevelDOWN
}

})(require("__browserify_process"),self)
},{"../package.json":78,"./errors":48,"__browserify_process":23,"bops":54,"leveldown":21,"leveldown/package":21,"semver":21,"xtend":73}],53:[function(require,module,exports){
/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License
 * <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var Stream       = require('stream').Stream
  , inherits     = require('util').inherits
  , extend       = require('xtend')
  , concatStream = require('concat-stream')

  , setImmediate = require('./util').setImmediate

  , getOptions   = require('./util').getOptions

  , defaultOptions = { type: 'put' }

function WriteStream (options, db) {
  Stream.call(this)
  this._options = extend(defaultOptions, getOptions(db, options))
  this._db      = db
  this._buffer  = []
  this._status  = 'init'
  this._end     = false
  this.writable = true
  this.readable = false

  var self = this
  var ready = function () {
    if (!self.writable)
      return
    self._status = 'ready'
    self.emit('ready')
    self._process()
  }

  if (db.isOpen())
    setImmediate(ready)
  else
    db.once('ready', ready)
}

inherits(WriteStream, Stream)

WriteStream.prototype.write = function (data) {
  if (!this.writable)
    return false
  this._buffer.push(data)
  if (this._status != 'init')
    this._processDelayed()
  if (this._options.maxBufferLength &&
      this._buffer.length > this._options.maxBufferLength) {
    this._writeBlock = true
    return false
  }
  return true
}

WriteStream.prototype.end = function (data) {
  var self = this
  if (data)
    this.write(data)
  setImmediate(function () {
    self._end = true
    self._process()
  })
}

WriteStream.prototype.destroy = function () {
  this.writable = false
  this.end()
}

WriteStream.prototype.destroySoon = function () {
  this.end()
}

WriteStream.prototype.add = function (entry) {
  if (!entry.props)
    return
  if (entry.props.Directory)
    entry.pipe(this._db.writeStream(this._options))
  else if (entry.props.File || entry.File || entry.type == 'File')
    this._write(entry)
  return true
}

WriteStream.prototype._processDelayed = function () {
  var self = this
  setImmediate(function () {
    self._process()
  })
}

WriteStream.prototype._process = function () {
  var buffer
    , self = this

    , cb = function (err) {
        if (!self.writable)
          return
        if (self._status != 'closed')
          self._status = 'ready'
        if (err) {
          self.writable = false
          return self.emit('error', err)
        }
        self._process()
      }

  if (self._status != 'ready' && self.writable) {
    if (self._buffer.length && self._status != 'closed')
      self._processDelayed()
    return
  }

  if (self._buffer.length && self.writable) {
    self._status = 'writing'
    buffer       = self._buffer
    self._buffer = []

    self._db.batch(buffer.map(function (d) {
      return {
          type          : d.type || self._options.type
        , key           : d.key
        , value         : d.value
        , keyEncoding   : d.keyEncoding || self._options.keyEncoding
        , valueEncoding : d.valueEncoding
            || d.encoding
            || self._options.valueEncoding
      }
    }), cb)

    if (self._writeBlock) {
      self._writeBlock = false
      self.emit('drain')
    }

    // don't allow close until callback has returned
    return
  }

  if (self._end && self._status != 'closed') {
    self._status  = 'closed'
    self.writable = false
    self.emit('close')
  }
}

WriteStream.prototype._write = function (entry) {
  var key = entry.path || entry.props.path
    , self = this

  if (!key)
    return

  entry.pipe(concatStream(function (err, data) {
    if (err) {
      self.writable = false
      return self.emit('error', err)
    }

    if (self._options.fstreamRoot &&
        key.indexOf(self._options.fstreamRoot) > -1)
      key = key.substr(self._options.fstreamRoot.length + 1)

    self.write({ key: key, value: data })
  }))
}

WriteStream.prototype.toString = function () {
  return 'LevelUP.WriteStream'
}

module.exports.create = function (options, db) {
  return new WriteStream(options, db)
}

},{"./util":52,"concat-stream":67,"stream":7,"util":9,"xtend":73}],54:[function(require,module,exports){
var proto = {}
module.exports = proto

proto.from = require('./from.js')
proto.to = require('./to.js')
proto.is = require('./is.js')
proto.subarray = require('./subarray.js')
proto.join = require('./join.js')
proto.copy = require('./copy.js')
proto.create = require('./create.js')

mix(require('./read.js'), proto)
mix(require('./write.js'), proto)

function mix(from, into) {
  for(var key in from) {
    into[key] = from[key]
  }
}

},{"./copy.js":57,"./create.js":58,"./from.js":59,"./is.js":60,"./join.js":61,"./read.js":63,"./subarray.js":64,"./to.js":65,"./write.js":66}],55:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],56:[function(require,module,exports){
module.exports = to_utf8

var out = []
  , col = []
  , fcc = String.fromCharCode
  , mask = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
  , unmask = [
      0x00
    , 0x01
    , 0x02 | 0x01
    , 0x04 | 0x02 | 0x01
    , 0x08 | 0x04 | 0x02 | 0x01
    , 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x40 | 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
  ]

function to_utf8(bytes, start, end) {
  start = start === undefined ? 0 : start
  end = end === undefined ? bytes.length : end

  var idx = 0
    , hi = 0x80
    , collecting = 0
    , pos
    , by

  col.length =
  out.length = 0

  while(idx < bytes.length) {
    by = bytes[idx]
    if(!collecting && by & hi) {
      pos = find_pad_position(by)
      collecting += pos
      if(pos < 8) {
        col[col.length] = by & unmask[6 - pos]
      }
    } else if(collecting) {
      col[col.length] = by & unmask[6]
      --collecting
      if(!collecting && col.length) {
        out[out.length] = fcc(reduced(col, pos))
        col.length = 0
      }
    } else { 
      out[out.length] = fcc(by)
    }
    ++idx
  }
  if(col.length && !collecting) {
    out[out.length] = fcc(reduced(col, pos))
    col.length = 0
  }
  return out.join('')
}

function find_pad_position(byt) {
  for(var i = 0; i < 7; ++i) {
    if(!(byt & mask[i])) {
      break
    }
  }
  return i
}

function reduced(list) {
  var out = 0
  for(var i = 0, len = list.length; i < len; ++i) {
    out |= list[i] << ((len - i - 1) * 6)
  }
  return out
}

},{}],57:[function(require,module,exports){
module.exports = copy

var slice = [].slice

function copy(source, target, target_start, source_start, source_end) {
  target_start = arguments.length < 3 ? 0 : target_start
  source_start = arguments.length < 4 ? 0 : source_start
  source_end = arguments.length < 5 ? source.length : source_end

  if(source_end === source_start) {
    return
  }

  if(target.length === 0 || source.length === 0) {
    return
  }

  if(source_end > source.length) {
    source_end = source.length
  }

  if(target.length - target_start < source_end - source_start) {
    source_end = target.length - target_start + start
  }

  if(source.buffer !== target.buffer) {
    return fast_copy(source, target, target_start, source_start, source_end)
  }
  return slow_copy(source, target, target_start, source_start, source_end)
}

function fast_copy(source, target, target_start, source_start, source_end) {
  var len = (source_end - source_start) + target_start

  for(var i = target_start, j = source_start;
      i < len;
      ++i,
      ++j) {
    target[i] = source[j]
  }
}

function slow_copy(from, to, j, i, jend) {
  // the buffers could overlap.
  var iend = jend + i
    , tmp = new Uint8Array(slice.call(from, i, iend))
    , x = 0

  for(; i < iend; ++i, ++x) {
    to[j++] = tmp[x]
  }
}

},{}],58:[function(require,module,exports){
module.exports = function(size) {
  return new Uint8Array(size)
}

},{}],59:[function(require,module,exports){
module.exports = from

var base64 = require('base64-js')

var decoders = {
    hex: from_hex
  , utf8: from_utf
  , base64: from_base64
}

function from(source, encoding) {
  if(Array.isArray(source)) {
    return new Uint8Array(source)
  }

  return decoders[encoding || 'utf8'](source)
}

function from_hex(str) {
  var size = str.length / 2
    , buf = new Uint8Array(size)
    , character = ''

  for(var i = 0, len = str.length; i < len; ++i) {
    character += str.charAt(i)

    if(i > 0 && (i % 2) === 1) {
      buf[i>>>1] = parseInt(character, 16)
      character = '' 
    }
  }

  return buf 
}

function from_utf(str) {
  var bytes = []
    , tmp
    , ch

  for(var i = 0, len = str.length; i < len; ++i) {
    ch = str.charCodeAt(i)
    if(ch & 0x80) {
      tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for(var j = 0, jlen = tmp.length; j < jlen; ++j) {
        bytes[bytes.length] = parseInt(tmp[j], 16)
      }
    } else {
      bytes[bytes.length] = ch 
    }
  }

  return new Uint8Array(bytes)
}

function from_base64(str) {
  return new Uint8Array(base64.toByteArray(str)) 
}

},{"base64-js":55}],60:[function(require,module,exports){

module.exports = function(buffer) {
  return buffer instanceof Uint8Array;
}

},{}],61:[function(require,module,exports){
module.exports = join

function join(targets, hint) {
  if(!targets.length) {
    return new Uint8Array(0)
  }

  var len = hint !== undefined ? hint : get_length(targets)
    , out = new Uint8Array(len)
    , cur = targets[0]
    , curlen = cur.length
    , curidx = 0
    , curoff = 0
    , i = 0

  while(i < len) {
    if(curoff === curlen) {
      curoff = 0
      ++curidx
      cur = targets[curidx]
      curlen = cur && cur.length
      continue
    }
    out[i++] = cur[curoff++] 
  }

  return out
}

function get_length(targets) {
  var size = 0
  for(var i = 0, len = targets.length; i < len; ++i) {
    size += targets[i].byteLength
  }
  return size
}

},{}],62:[function(require,module,exports){
var proto
  , map

module.exports = proto = {}

map = typeof WeakMap === 'undefined' ? null : new WeakMap

proto.get = !map ? no_weakmap_get : get

function no_weakmap_get(target) {
  return new DataView(target.buffer, 0)
}

function get(target) {
  var out = map.get(target.buffer)
  if(!out) {
    map.set(target.buffer, out = new DataView(target.buffer, 0))
  }
  return out
}

},{}],63:[function(require,module,exports){
module.exports = {
    readUInt8:      read_uint8
  , readInt8:       read_int8
  , readUInt16LE:   read_uint16_le
  , readUInt32LE:   read_uint32_le
  , readInt16LE:    read_int16_le
  , readInt32LE:    read_int32_le
  , readFloatLE:    read_float_le
  , readDoubleLE:   read_double_le
  , readUInt16BE:   read_uint16_be
  , readUInt32BE:   read_uint32_be
  , readInt16BE:    read_int16_be
  , readInt32BE:    read_int32_be
  , readFloatBE:    read_float_be
  , readDoubleBE:   read_double_be
}

var map = require('./mapped.js')

function read_uint8(target, at) {
  return target[at]
}

function read_int8(target, at) {
  var v = target[at];
  return v < 0x80 ? v : v - 0x100
}

function read_uint16_le(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, true)
}

function read_uint32_le(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, true)
}

function read_int16_le(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, true)
}

function read_int32_le(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, true)
}

function read_float_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, true)
}

function read_double_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, true)
}

function read_uint16_be(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, false)
}

function read_uint32_be(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, false)
}

function read_int16_be(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, false)
}

function read_int32_be(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, false)
}

function read_float_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, false)
}

function read_double_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, false)
}

},{"./mapped.js":62}],64:[function(require,module,exports){
module.exports = subarray

function subarray(buf, from, to) {
  return buf.subarray(from || 0, to || buf.length)
}

},{}],65:[function(require,module,exports){
module.exports = to

var base64 = require('base64-js')
  , toutf8 = require('to-utf8')

var encoders = {
    hex: to_hex
  , utf8: to_utf
  , base64: to_base64
}

function to(buf, encoding) {
  return encoders[encoding || 'utf8'](buf)
}

function to_hex(buf) {
  var str = ''
    , byt

  for(var i = 0, len = buf.length; i < len; ++i) {
    byt = buf[i]
    str += ((byt & 0xF0) >>> 4).toString(16)
    str += (byt & 0x0F).toString(16)
  }

  return str
}

function to_utf(buf) {
  return toutf8(buf)
}

function to_base64(buf) {
  return base64.fromByteArray(buf)
}


},{"base64-js":55,"to-utf8":56}],66:[function(require,module,exports){
module.exports = {
    writeUInt8:      write_uint8
  , writeInt8:       write_int8
  , writeUInt16LE:   write_uint16_le
  , writeUInt32LE:   write_uint32_le
  , writeInt16LE:    write_int16_le
  , writeInt32LE:    write_int32_le
  , writeFloatLE:    write_float_le
  , writeDoubleLE:   write_double_le
  , writeUInt16BE:   write_uint16_be
  , writeUInt32BE:   write_uint32_be
  , writeInt16BE:    write_int16_be
  , writeInt32BE:    write_int32_be
  , writeFloatBE:    write_float_be
  , writeDoubleBE:   write_double_be
}

var map = require('./mapped.js')

function write_uint8(target, value, at) {
  return target[at] = value
}

function write_int8(target, value, at) {
  return target[at] = value < 0 ? value + 0x100 : value
}

function write_uint16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, true)
}

function write_uint32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, true)
}

function write_int16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, true)
}

function write_int32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, true)
}

function write_float_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, true)
}

function write_double_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, true)
}

function write_uint16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, false)
}

function write_uint32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, false)
}

function write_int16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, false)
}

function write_int32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, false)
}

function write_float_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, false)
}

function write_double_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, false)
}

},{"./mapped.js":62}],67:[function(require,module,exports){
(function(Buffer){var stream = require('stream')
var util = require('util')

function ConcatStream(cb) {
  stream.Stream.call(this)
  this.writable = true
  if (cb) this.cb = cb
  this.body = []
  this.on('error', function(err) {
    if (this.cb) this.cb(err)
  })
}

util.inherits(ConcatStream, stream.Stream)

ConcatStream.prototype.write = function(chunk) {
  this.body.push(chunk)
}

ConcatStream.prototype.destroy = function() {}

ConcatStream.prototype.arrayConcat = function(arrs) {
  if (arrs.length === 0) return []
  if (arrs.length === 1) return arrs[0]
  return arrs.reduce(function (a, b) { return a.concat(b) })
}

ConcatStream.prototype.isArray = function(arr) {
  return Array.isArray(arr)
}

ConcatStream.prototype.getBody = function () {
  if (this.body.length === 0) return
  if (typeof(this.body[0]) === "string") return this.body.join('')
  if (this.isArray(this.body[0])) return this.arrayConcat(this.body)
  if (typeof(Buffer) !== "undefined" && Buffer.isBuffer(this.body[0])) {
    return Buffer.concat(this.body)
  }
  return this.body
}

ConcatStream.prototype.end = function() {
  if (this.cb) this.cb(false, this.getBody())
}

module.exports = function(cb) {
  return new ConcatStream(cb)
}

module.exports.ConcatStream = ConcatStream

})(require("__browserify_Buffer").Buffer)
},{"__browserify_Buffer":22,"stream":7,"util":9}],68:[function(require,module,exports){
function init (name, message, cause) {
  this.name      = name
  // can be passed just a 'cause'
  this.cause     = typeof message != 'string' ? message : cause
  this.message   = !!message && typeof message != 'string' ? message.message : message
}

// generic prototype, not intended to be actually used - helpful for `instanceof`
function CustomError (message, cause) {
  Error.call(this)
  if (Error.captureStackTrace)
    Error.captureStackTrace(this, arguments.callee)
  init.call(this, 'CustomError', message, cause)
}

CustomError.prototype = new Error()

function createError (errno, name, proto) {
  var err = function (message, cause) {
    init.call(this, name, message, cause)
    //TODO: the specificity here is stupid, errno should be available everywhere
    if (name == 'FilesystemError') {
      this.code    = this.cause.code
      this.path    = this.cause.path
      this.errno   = this.cause.errno
      this.message =
        (errno.errno[this.cause.errno]
          ? errno.errno[this.cause.errno].description
          : this.cause.message)
        + (this.cause.path ? ' [' + this.cause.path + ']' : '')
    }
    Error.call(this)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, arguments.callee)
  }
  err.prototype = !!proto ? new proto() : new CustomError()
  return err
}

module.exports = function (errno) {
  var ce = function (name, proto) {
    return createError(errno, name, proto)
  }
  return {
      CustomError     : CustomError
    , FilesystemError : ce('FilesystemError')
    , createError     : ce
  }
}

},{}],69:[function(require,module,exports){
(function(){var all = module.exports.all = [
 {
  "errno": -1,
  "code": "UNKNOWN",
  "description": "unknown error"
 },
 {
  "errno": 0,
  "code": "OK",
  "description": "success"
 },
 {
  "errno": 1,
  "code": "EOF",
  "description": "end of file"
 },
 {
  "errno": 2,
  "code": "EADDRINFO",
  "description": "getaddrinfo error"
 },
 {
  "errno": 3,
  "code": "EACCES",
  "description": "permission denied"
 },
 {
  "errno": 4,
  "code": "EAGAIN",
  "description": "resource temporarily unavailable"
 },
 {
  "errno": 5,
  "code": "EADDRINUSE",
  "description": "address already in use"
 },
 {
  "errno": 6,
  "code": "EADDRNOTAVAIL",
  "description": "address not available"
 },
 {
  "errno": 7,
  "code": "EAFNOSUPPORT",
  "description": "address family not supported"
 },
 {
  "errno": 8,
  "code": "EALREADY",
  "description": "connection already in progress"
 },
 {
  "errno": 9,
  "code": "EBADF",
  "description": "bad file descriptor"
 },
 {
  "errno": 10,
  "code": "EBUSY",
  "description": "resource busy or locked"
 },
 {
  "errno": 11,
  "code": "ECONNABORTED",
  "description": "software caused connection abort"
 },
 {
  "errno": 12,
  "code": "ECONNREFUSED",
  "description": "connection refused"
 },
 {
  "errno": 13,
  "code": "ECONNRESET",
  "description": "connection reset by peer"
 },
 {
  "errno": 14,
  "code": "EDESTADDRREQ",
  "description": "destination address required"
 },
 {
  "errno": 15,
  "code": "EFAULT",
  "description": "bad address in system call argument"
 },
 {
  "errno": 16,
  "code": "EHOSTUNREACH",
  "description": "host is unreachable"
 },
 {
  "errno": 17,
  "code": "EINTR",
  "description": "interrupted system call"
 },
 {
  "errno": 18,
  "code": "EINVAL",
  "description": "invalid argument"
 },
 {
  "errno": 19,
  "code": "EISCONN",
  "description": "socket is already connected"
 },
 {
  "errno": 20,
  "code": "EMFILE",
  "description": "too many open files"
 },
 {
  "errno": 21,
  "code": "EMSGSIZE",
  "description": "message too long"
 },
 {
  "errno": 22,
  "code": "ENETDOWN",
  "description": "network is down"
 },
 {
  "errno": 23,
  "code": "ENETUNREACH",
  "description": "network is unreachable"
 },
 {
  "errno": 24,
  "code": "ENFILE",
  "description": "file table overflow"
 },
 {
  "errno": 25,
  "code": "ENOBUFS",
  "description": "no buffer space available"
 },
 {
  "errno": 26,
  "code": "ENOMEM",
  "description": "not enough memory"
 },
 {
  "errno": 27,
  "code": "ENOTDIR",
  "description": "not a directory"
 },
 {
  "errno": 28,
  "code": "EISDIR",
  "description": "illegal operation on a directory"
 },
 {
  "errno": 29,
  "code": "ENONET",
  "description": "machine is not on the network"
 },
 {
  "errno": 31,
  "code": "ENOTCONN",
  "description": "socket is not connected"
 },
 {
  "errno": 32,
  "code": "ENOTSOCK",
  "description": "socket operation on non-socket"
 },
 {
  "errno": 33,
  "code": "ENOTSUP",
  "description": "operation not supported on socket"
 },
 {
  "errno": 34,
  "code": "ENOENT",
  "description": "no such file or directory"
 },
 {
  "errno": 35,
  "code": "ENOSYS",
  "description": "function not implemented"
 },
 {
  "errno": 36,
  "code": "EPIPE",
  "description": "broken pipe"
 },
 {
  "errno": 37,
  "code": "EPROTO",
  "description": "protocol error"
 },
 {
  "errno": 38,
  "code": "EPROTONOSUPPORT",
  "description": "protocol not supported"
 },
 {
  "errno": 39,
  "code": "EPROTOTYPE",
  "description": "protocol wrong type for socket"
 },
 {
  "errno": 40,
  "code": "ETIMEDOUT",
  "description": "connection timed out"
 },
 {
  "errno": 41,
  "code": "ECHARSET",
  "description": "invalid Unicode character"
 },
 {
  "errno": 42,
  "code": "EAIFAMNOSUPPORT",
  "description": "address family for hostname not supported"
 },
 {
  "errno": 44,
  "code": "EAISERVICE",
  "description": "servname not supported for ai_socktype"
 },
 {
  "errno": 45,
  "code": "EAISOCKTYPE",
  "description": "ai_socktype not supported"
 },
 {
  "errno": 46,
  "code": "ESHUTDOWN",
  "description": "cannot send after transport endpoint shutdown"
 },
 {
  "errno": 47,
  "code": "EEXIST",
  "description": "file already exists"
 },
 {
  "errno": 48,
  "code": "ESRCH",
  "description": "no such process"
 },
 {
  "errno": 49,
  "code": "ENAMETOOLONG",
  "description": "name too long"
 },
 {
  "errno": 50,
  "code": "EPERM",
  "description": "operation not permitted"
 },
 {
  "errno": 51,
  "code": "ELOOP",
  "description": "too many symbolic links encountered"
 },
 {
  "errno": 52,
  "code": "EXDEV",
  "description": "cross-device link not permitted"
 },
 {
  "errno": 53,
  "code": "ENOTEMPTY",
  "description": "directory not empty"
 },
 {
  "errno": 54,
  "code": "ENOSPC",
  "description": "no space left on device"
 },
 {
  "errno": 55,
  "code": "EIO",
  "description": "i/o error"
 },
 {
  "errno": 56,
  "code": "EROFS",
  "description": "read-only file system"
 },
 {
  "errno": 57,
  "code": "ENODEV",
  "description": "no such device"
 },
 {
  "errno": 58,
  "code": "ESPIPE",
  "description": "invalid seek"
 },
 {
  "errno": 59,
  "code": "ECANCELED",
  "description": "operation canceled"
 }
]


module.exports.errno = {
    '-1': all[0]
  , '0': all[1]
  , '1': all[2]
  , '2': all[3]
  , '3': all[4]
  , '4': all[5]
  , '5': all[6]
  , '6': all[7]
  , '7': all[8]
  , '8': all[9]
  , '9': all[10]
  , '10': all[11]
  , '11': all[12]
  , '12': all[13]
  , '13': all[14]
  , '14': all[15]
  , '15': all[16]
  , '16': all[17]
  , '17': all[18]
  , '18': all[19]
  , '19': all[20]
  , '20': all[21]
  , '21': all[22]
  , '22': all[23]
  , '23': all[24]
  , '24': all[25]
  , '25': all[26]
  , '26': all[27]
  , '27': all[28]
  , '28': all[29]
  , '29': all[30]
  , '31': all[31]
  , '32': all[32]
  , '33': all[33]
  , '34': all[34]
  , '35': all[35]
  , '36': all[36]
  , '37': all[37]
  , '38': all[38]
  , '39': all[39]
  , '40': all[40]
  , '41': all[41]
  , '42': all[42]
  , '44': all[43]
  , '45': all[44]
  , '46': all[45]
  , '47': all[46]
  , '48': all[47]
  , '49': all[48]
  , '50': all[49]
  , '51': all[50]
  , '52': all[51]
  , '53': all[52]
  , '54': all[53]
  , '55': all[54]
  , '56': all[55]
  , '57': all[56]
  , '58': all[57]
  , '59': all[58]
}


module.exports.code = {
    'UNKNOWN': all[0]
  , 'OK': all[1]
  , 'EOF': all[2]
  , 'EADDRINFO': all[3]
  , 'EACCES': all[4]
  , 'EAGAIN': all[5]
  , 'EADDRINUSE': all[6]
  , 'EADDRNOTAVAIL': all[7]
  , 'EAFNOSUPPORT': all[8]
  , 'EALREADY': all[9]
  , 'EBADF': all[10]
  , 'EBUSY': all[11]
  , 'ECONNABORTED': all[12]
  , 'ECONNREFUSED': all[13]
  , 'ECONNRESET': all[14]
  , 'EDESTADDRREQ': all[15]
  , 'EFAULT': all[16]
  , 'EHOSTUNREACH': all[17]
  , 'EINTR': all[18]
  , 'EINVAL': all[19]
  , 'EISCONN': all[20]
  , 'EMFILE': all[21]
  , 'EMSGSIZE': all[22]
  , 'ENETDOWN': all[23]
  , 'ENETUNREACH': all[24]
  , 'ENFILE': all[25]
  , 'ENOBUFS': all[26]
  , 'ENOMEM': all[27]
  , 'ENOTDIR': all[28]
  , 'EISDIR': all[29]
  , 'ENONET': all[30]
  , 'ENOTCONN': all[31]
  , 'ENOTSOCK': all[32]
  , 'ENOTSUP': all[33]
  , 'ENOENT': all[34]
  , 'ENOSYS': all[35]
  , 'EPIPE': all[36]
  , 'EPROTO': all[37]
  , 'EPROTONOSUPPORT': all[38]
  , 'EPROTOTYPE': all[39]
  , 'ETIMEDOUT': all[40]
  , 'ECHARSET': all[41]
  , 'EAIFAMNOSUPPORT': all[42]
  , 'EAISERVICE': all[43]
  , 'EAISOCKTYPE': all[44]
  , 'ESHUTDOWN': all[45]
  , 'EEXIST': all[46]
  , 'ESRCH': all[47]
  , 'ENAMETOOLONG': all[48]
  , 'EPERM': all[49]
  , 'ELOOP': all[50]
  , 'EXDEV': all[51]
  , 'ENOTEMPTY': all[52]
  , 'ENOSPC': all[53]
  , 'EIO': all[54]
  , 'EROFS': all[55]
  , 'ENODEV': all[56]
  , 'ESPIPE': all[57]
  , 'ECANCELED': all[58]
}


module.exports.custom = require("./custom")(module.exports)

})()
},{"./custom":68}],70:[function(require,module,exports){
/*!
  * prr
  * (c) 2013 Rod Vagg <rod@vagg.org>
  * https://github.com/rvagg/prr
  * License: MIT
  */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports)
    module.exports = definition()
  else
    context[name] = definition()
})('prr', this, function() {

  var setProperty = typeof Object.defineProperty == 'function'
      ? function (obj, key, options) {
          Object.defineProperty(obj, key, options)
          return obj
        }
      : function (obj, key, options) { // < es5
          obj[key] = options.value
          return obj
        }

    , makeOptions = function (value, options) {
        var oo = typeof options == 'object'
          , os = !oo && typeof options == 'string'
          , op = function (p) {
              return oo
                ? !!options[p]
                : os
                  ? options.indexOf(p[0]) > -1
                  : false
            }

        return {
            enumerable   : op('enumerable')
          , configurable : op('configurable')
          , writable     : op('writable')
          , value        : value
        }
      }

    , prr = function (obj, key, value, options) {
        var k

        options = makeOptions(value, options)

        if (typeof key == 'object') {
          for (k in key) {
            if (Object.hasOwnProperty.call(key, k)) {
              options.value = key[k]
              setProperty(obj, k, options)
            }
          }
          return obj
        }

        return setProperty(obj, key, options)
      }

  return prr
})
},{}],71:[function(require,module,exports){
(function(process){const stream = require('stream')
    , util   = require('util')

var SimpleBufferStream = function (buffer) {
  var self = this
  stream.Stream.call(self)
  self._state  = 'ready'
  self._buffer = buffer
  process.nextTick(function () {
    self._dump()
  })
}

util.inherits(SimpleBufferStream, stream.Stream)

SimpleBufferStream.prototype._dump = function() {
  if (this._state != 'ready')
    return

  this._state = 'done'
  this.emit('data', this._buffer)
  this.emit('end')
  this.emit('close')
}

SimpleBufferStream.prototype.pause = function() {
  if (this._state != 'done')
    this._state = 'paused'
}
SimpleBufferStream.prototype.resume = function() {
  if (this._state == 'done')
    return
  this._state = 'ready'
  this._dump()
}

SimpleBufferStream.prototype.destroy = function() {}

module.exports = function (buffer) {
  return new SimpleBufferStream(buffer)
}

})(require("__browserify_process"))
},{"__browserify_process":23,"stream":7,"util":9}],72:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],73:[function(require,module,exports){
var Keys = require("object-keys")
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

},{"./has-keys":72,"object-keys":74}],74:[function(require,module,exports){
module.exports = Object.keys || require('./shim');


},{"./shim":77}],75:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function forEach (obj, fn, ctx) {
    if (typeof fn !== 'function') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],76:[function(require,module,exports){

/**!
 * is
 * the definitive JavaScript type testing library
 * 
 * @copyright 2013 Enrico Marino
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toString = objProto.toString;
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  "boolean": 1,
  "number": 1,
  "string": 1,
  "undefined": 1
};

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a =
is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return value !== undefined;
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toString.call(value);
  var key;

  if ('[object Array]' === type || '[object Arguments]' === type) {
    return value.length === 0;
  }

  if ('[object Object]' === type) {
    for (key in value) if (owns.call(value, key)) return false;
    return true;
  }

  if ('[object String]' === type) {
    return '' === value;
  }

  return false;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function (value, other) {
  var type = toString.call(value)
  var key;

  if (type !== toString.call(other)) {
    return false;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Array]' === type) {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Function]' === type) {
    return value.prototype === other.prototype;
  }

  if ('[object Date]' === type) {
    return value.getTime() === other.getTime();
  }

  return value === other;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is['null'] = function (value) {
  return value === null;
};

/**
 * is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undefined = function (value) {
  return value === undefined;
};

/**
 * Test arguments.
 */

/**
 * is.arguments
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arguments = function (value) {
  var isStandardArguments = '[object Arguments]' === toString.call(value);
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = function (value) {
  return '[object Array]' === toString.call(value);
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.arguments.empty = function (value) {
  return is.arguments(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.boolean(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.boolean
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.boolean = function (value) {
  return '[object Boolean]' === toString.call(value);
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.boolean(value) && (value === false || value.valueOf() === false);
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.boolean(value) && (value === true || value.valueOf() === true);
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return '[object Date]' === toString.call(value);
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return '[object Error]' === toString.call(value);
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || '[object Function]' === toString.call(value);
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return '[object Number]' === toString.call(value);
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.int
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.int = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return value && '[object Object]' === toString.call(value);
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return '[object RegExp]' === toString.call(value);
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return '[object String]' === toString.call(value);
};


},{}],77:[function(require,module,exports){
(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
		is = require('is'),
		forEach = require('foreach'),
		hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
		dontEnums = [
			"toString",
			"toLocaleString",
			"valueOf",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"constructor"
		],
		keysShim;

	keysShim = function keys(object) {
		if (!is.object(object) && !is.array(object)) {
			throw new TypeError("Object.keys called on a non-object");
		}

		var name, theKeys = [];
		for (name in object) {
			if (has.call(object, name)) {
				theKeys.push(name);
			}
		}

		if (hasDontEnumBug) {
			forEach(dontEnums, function (dontEnum) {
				if (has.call(object, dontEnum)) {
					theKeys.push(dontEnum);
				}
			});
		}
		return theKeys;
	};

	module.exports = keysShim;
}());


},{"foreach":75,"is":76}],78:[function(require,module,exports){
(function(){module.exports={
  "name": "levelup",
  "description": "Fast & simple storage - a Node.js-style LevelDB wrapper",
  "contributors": [
    {
      "name": "Rod Vagg",
      "email": "r@va.gg",
      "url": "https://github.com/rvagg"
    },
    {
      "name": "John Chesley",
      "email": "john@chesl.es",
      "url": "https://github.com/chesles/"
    },
    {
      "name": "Jake Verbaten",
      "email": "raynos2@gmail.com",
      "url": "https://github.com/raynos"
    },
    {
      "name": "Dominic Tarr",
      "email": "dominic.tarr@gmail.com",
      "url": "https://github.com/dominictarr"
    },
    {
      "name": "Max Ogden",
      "email": "max@maxogden.com",
      "url": "https://github.com/maxogden"
    },
    {
      "name": "Lars-Magnus Skog",
      "email": "lars.magnus.skog@gmail.com",
      "url": "https://github.com/ralphtheninja"
    },
    {
      "name": "David Björklund",
      "email": "david.bjorklund@gmail.com",
      "url": "https://github.com/kesla"
    },
    {
      "name": "Julian Gruber",
      "email": "julian@juliangruber.com",
      "url": "https://github.com/juliangruber"
    },
    {
      "name": "Paolo Fragomeni",
      "email": "paolo@async.ly",
      "url": "https://github.com/hij1nx"
    },
    {
      "name": "Anton Whalley",
      "email": "anton.whalley@nearform.com",
      "url": "https://github.com/No9"
    },
    {
      "name": "Matteo Collina",
      "email": "matteo.collina@gmail.com",
      "url": "https://github.com/mcollina"
    },
    {
      "name": "Pedro Teixeira",
      "email": "pedro.teixeira@gmail.com",
      "url": "https://github.com/pgte"
    }
  ],
  "keywords": [
    "leveldb",
    "stream",
    "database",
    "db",
    "store",
    "storage",
    "json"
  ],
  "version": "0.11.0",
  "main": "lib/levelup.js",
  "dependencies": {
    "errno": "~0.0.3",
    "concat-stream": "~0.1.1",
    "simple-bufferstream": "~0.0.2",
    "xtend": "~2.0.3",
    "prr": "~0.0.0",
    "semver": "~1.1.4",
    "bops": "~0.0.6"
  },
  "devDependencies": {
    "leveldown": "~0.5.0",
    "bustermove": "*",
    "tap": "*",
    "referee": "*",
    "rimraf": "*",
    "async": "*",
    "fstream": "*",
    "tar": "*",
    "mkfiletree": "*",
    "readfiletree": "*",
    "slow-stream": ">=0.0.4",
    "delayed": "*",
    "boganipsum": "*",
    "du": "*",
    "memdown": "*"
  },
  "browser": {
    "leveldown": false,
    "leveldown/package": false,
    "semver": false
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/rvagg/node-levelup.git"
  },
  "scripts": {
    "test": "tap test/*-test.js --stderr",
    "functionaltests": "node ./test/functional/fstream-test.js && node ./test/functional/binary-data-test.js && node ./test/functional/compat-test.js",
    "alltests": "npm test && npm run-script functionaltests"
  },
  "license": "MIT",
  "readme": "LevelUP\n=======\n\n![LevelDB Logo](https://twimg0-a.akamaihd.net/profile_images/3360574989/92fc472928b444980408147e5e5db2fa_bigger.png)\n\nFast & simple storage - a Node.js-style LevelDB wrapper\n-------------------------------------------------------\n\n[![Build Status](https://secure.travis-ci.org/rvagg/node-levelup.png)](http://travis-ci.org/rvagg/node-levelup)\n\n[![NPM](https://nodei.co/npm/levelup.png)](https://nodei.co/npm/levelup/)\n\n\n  * <a href=\"#news\">News</a>\n  * <a href=\"#intro\">Introduction</a>\n  * <a href=\"#leveldown\">Relationship to LevelDOWN</a>\n  * <a href=\"#platforms\">Tested &amp; supported platforms</a>\n  * <a href=\"#basic\">Basic usage</a>\n  * <a href=\"#api\">API</a>\n  * <a href=\"#events\">Events</a>\n  * <a href=\"#json\">JSON data</a>\n  * <a href=\"#extending\">Extending LevelUP</a>\n  * <a href=\"#multiproc\">Multi-process access</a>\n  * <a href=\"#support\">Getting support</a>\n  * <a href=\"#contributing\">Contributing</a>\n  * <a href=\"#licence\">Licence &amp; copyright</a>\n\n\n<a name=\"news\"></a>\nNews\n----\n\n * *2013-05-21* **[LevelUP v0.9 Released](http://r.va.gg/2013/05/levelup-v0.9-released.html)** &mdash; explains the main items in the [CHANGELOG](https://raw.github.com/rvagg/node-levelup/master/CHANGELOG.md) for 0.9 and who you should thank for the hard work.\n * *2013-05-20* **[LevelUP v0.9 - Some Major Changes](http://r.va.gg/2013/05/levelup-v0.9-some-major-changes.html)** &mdash; discussing why we've removed [LevelDOWN](https://github.com/rvagg/node-leveldown/) as a dependency and the growing collection of LevelDOWN-compatible back-ends for LevelUP.\n\n<a name=\"intro\"></a>\nIntroduction\n------------\n\n**[LevelDB](http://code.google.com/p/leveldb/)** is a simple key/value data store built by Google, inspired by BigTable. It's used in Google Chrome and many other products. LevelDB supports arbitrary byte arrays as both keys and values, singular *get*, *put* and *delete* operations, *batched put and delete*, bi-directional iterators and simple compression using the very fast [Snappy](http://code.google.com/p/snappy/) algorithm.\n\n**LevelUP** aims to expose the features of LevelDB in a **Node.js-friendly way**. All standard `Buffer` encoding types are supported, as is a special JSON encoding. LevelDB's iterators are exposed as a Node.js-style **readable stream** a matching **writeable stream* converts writes to *batch* operations.\n\nLevelDB stores entries **sorted lexicographically by keys**. This makes LevelUP's <a href=\"#createReadStream\"><code>ReadStream</code></a> interface is a very powerful query mechanism.\n\n**LevelUP** is an **OPEN Open Source Project**, see the <a href=\"#contributing\">Contributing</a> section to find out what this means.\n\n<a name=\"leveldown\"></a>\nRelationship to LevelDOWN\n-------------------------\n\nLevelUP is designed to be backed by **[LevelDOWN](https://github.com/rvagg/node-leveldown/)** which provides a pure C++ binding to LevelDB and can be used as a stand-along package if required.\n\n**As of version 0.9, LevelUP no longer requires LevelDOWN as a dependency so you must `npm install leveldown` when you install LevelUP.**\n\nLevelDOWN is now optional because LevelUP can be used with alternative backends, such as **[level.js](https://github.com/maxogden/level.js)** in the browser or [MemDOWN](https://github.com/rvagg/node-memdown) for a pure in-memory store.\n\nLevelUP will look for LevelDOWN and throw an error if it can't find it in its Node `require()` path. It will also tell you if the installed version of LevelDOWN is incompatible.\n\n**The [level](https://github.com/level/level) package is available as an alternative installation mechanism.** Install it instead to automatically get both LevelUP & LevelDOWN. It exposes LevelUP on its export (i.e. you can `var leveldb = require('level')`).\n\n\n<a name=\"platforms\"></a>\nTested & supported platforms\n----------------------------\n\n  * **Linux**: including ARM platforms such as Raspberry Pi *and Kindle!*\n  * **Mac OS**\n  * **Solaris**: including Joyent's SmartOS & Nodejitsu\n  * **Windows**: Node 0.10 and above only. See installation instructions for *node-gyp's* dependencies [here](https://github.com/TooTallNate/node-gyp#installation), you'll need these (free) components from Microsoft to compile and run any native Node add-on in Windows.\n\n<a name=\"basic\"></a>\nBasic usage\n-----------\n\nFirst you need to install LevelUP!\n\n```sh\n$ npm install levelup leveldown\n```\n\nOr\n\n```sh\n$ npm install level\n```\n\n*(this second option requires you to use LevelUP by calling `var levelup = require('level')`)*\n\n\nAll operations are asynchronous although they don't necessarily require a callback if you don't need to know when the operation was performed.\n\n```js\nvar levelup = require('levelup')\n\n// 1) Create our database, supply location and options.\n//    This will create or open the underlying LevelDB store.\nvar db = levelup('./mydb')\n\n// 2) put a key & value\ndb.put('name', 'LevelUP', function (err) {\n  if (err) return console.log('Ooops!', err) // some kind of I/O error\n\n  // 3) fetch by key\n  db.get('name', function (err, value) {\n    if (err) return console.log('Ooops!', err) // likely the key was not found\n\n    // ta da!\n    console.log('name=' + value)\n  })\n})\n```\n\n<a name=\"api\"></a>\n## API\n\n  * <a href=\"#ctor\"><code><b>levelup()</b></code></a>\n  * <a href=\"#open\"><code>db.<b>open()</b></code></a>\n  * <a href=\"#close\"><code>db.<b>close()</b></code></a>\n  * <a href=\"#put\"><code>db.<b>put()</b></code></a>\n  * <a href=\"#get\"><code>db.<b>get()</b></code></a>\n  * <a href=\"#del\"><code>db.<b>del()</b></code></a>\n  * <a href=\"#batch\"><code>db.<b>batch()</b></code> *(array form)*</a>\n  * <a href=\"#batch_chained\"><code>db.<b>batch()</b></code> *(chained form)*</a>\n  * <a href=\"#isOpen\"><code>db.<b>isOpen()</b></code></a>\n  * <a href=\"#isClosed\"><code>db.<b>isClosed()</b></code></a>\n  * <a href=\"#createReadStream\"><code>db.<b>createReadStream()</b></code></a>\n  * <a href=\"#createKeyStream\"><code>db.<b>createKeyStream()</b></code></a>\n  * <a href=\"#createValueStream\"><code>db.<b>createValueStream()</b></code></a>\n  * <a href=\"#createWriteStream\"><code>db.<b>createWriteStream()</b></code></a>\n\n### Special operations exposed by LevelDOWN\n\n  * <a href=\"#approximateSize\"><code>db.db.<b>approximateSize()</b></code></a>\n  * <a href=\"#getProperty\"><code>db.db.<b>getProperty()</b></code></a>\n  * <a href=\"#destroy\"><code><b>leveldown.destroy()</b></code></a>\n  * <a href=\"#repair\"><code><b>leveldown.repair()</b></code></a>\n\n\n--------------------------------------------------------\n<a name=\"ctor\"></a>\n### levelup(location[, options[, callback]])\n<code>levelup()</code> is the main entry point for creating a new LevelUP instance and opening the underlying store with LevelDB.\n\nThis function returns a new instance of LevelUP and will also initiate an <a href=\"#open\"><code>open()</code></a> operation. Opening the database is an asynchronous operation which will trigger your callback if you provide one. The callback should take the form: `function (err, db) {}` where the `db` is the LevelUP instance. If you don't provide a callback, any read & write operations are simply queued internally until the database is fully opened.\n\nThis leads to two alternative ways of managing a new LevelUP instance:\n\n```js\nlevelup(location, options, function (err, db) {\n  if (err) throw err\n  db.get('foo', function (err, value) {\n    if (err) return console.log('foo does not exist')\n    console.log('got foo =', value)\n  })\n})\n\n// vs the equivalent:\n\nvar db = levelup(location, options) // will throw if an error occurs\ndb.get('foo', function (err, value) {\n  if (err) return console.log('foo does not exist')\n  console.log('got foo =', value)\n})\n```\n\nThe `location` argument is available as a read-only property on the returned LevelUP instance.\n\n#### `options`\n\n`levelup()` takes an optional options object as its second argument; the following properties are accepted:\n\n* `'createIfMissing'` *(boolean, default: `true`)*: If `true`, will initialise an empty database at the specified location if one doesn't already exist. If `false` and a database doesn't exist you will receive an error in your `open()` callback and your database won't open.\n\n* `'errorIfExists'` *(boolean, default: `false`)*: If `true`, you will receive an error in your `open()` callback if the database exists at the specified location.\n\n* `'compression'` *(boolean, default: `true`)*: If `true`, all *compressible* data will be run through the Snappy compression algorithm before being stored. Snappy is very fast and shouldn't gain much speed by disabling so leave this on unless you have good reason to turn it off.\n\n* `'cacheSize'` *(number, default: `8 * 1024 * 1024`)*: The size (in bytes) of the in-memory [LRU](http://en.wikipedia.org/wiki/Cache_algorithms#Least_Recently_Used) cache with frequently used uncompressed block contents. \n\n* `'keyEncoding'` and `'valueEncoding'` *(string, default: `'utf8'`)*: The encoding of the keys and values passed through Node.js' `Buffer` implementation (see [Buffer#toString()](http://nodejs.org/docs/latest/api/buffer.html#buffer_buf_tostring_encoding_start_end)).\n  <p><code>'utf8'</code> is the default encoding for both keys and values so you can simply pass in strings and expect strings from your <code>get()</code> operations. You can also pass <code>Buffer</code> objects as keys and/or values and conversion will be performed.</p>\n  <p>Supported encodings are: hex, utf8, ascii, binary, base64, ucs2, utf16le.</p>\n  <p><code>'json'</code> encoding is also supported, see below.</p>\n\n* `'db'` *(object, default: LevelDOWN)*: LevelUP is backed by [LevelDOWN](https://github.com/rvagg/node-leveldown/) to provide an interface to LevelDB. You can completely replace the use of LevelDOWN by providing a \"factory\" function that will return a LevelDOWN API compatible object given a `location` argument. For further information, see [MemDOWN](https://github.com/rvagg/node-memdown/), a fully LevelDOWN API compatible replacement that uses a memory store rather than LevelDB. Also see [Abstract LevelDOWN](http://github.com/rvagg/node-abstract-leveldown), a partial implementation of the LevelDOWN API that can be used as a base prototype for a LevelDOWN substitute.\n\nAdditionally, each of the main interface methods accept an optional options object that can be used to override `'keyEncoding'` and `'valueEncoding'`.\n\n--------------------------------------------------------\n<a name=\"open\"></a>\n### db.open([callback])\n<code>open()</code> opens the underlying LevelDB store. In general **you should never need to call this method directly** as it's automatically called by <a href=\"#ctor\"><code>levelup()</code></a>.\n\nHowever, it is possible to *reopen* a database after it has been closed with <a href=\"#close\"><code>close()</code></a>, although this is not generally advised.\n\n--------------------------------------------------------\n<a name=\"close\"></a>\n### db.close([callback])\n<code>close()</code> closes the underlying LevelDB store. The callback will receive any error encountered during closing as the first argument.\n\nYou should always clean up your LevelUP instance by calling `close()` when you no longer need it to free up resources. A LevelDB store cannot be opened by multiple instances of LevelDB/LevelUP simultaneously.\n\n--------------------------------------------------------\n<a name=\"put\"></a>\n### db.put(key, value[, options][, callback])\n<code>put()</code> is the primary method for inserting data into the store. Both the `key` and `value` can be arbitrary data objects.\n\nThe callback argument is optional but if you don't provide one and an error occurs then expect the error to be thrown.\n\n#### `options`\n\nEncoding of the `key` and `value` objects will adhere to `'keyEncoding'` and `'valueEncoding'` options provided to <a href=\"#ctor\"><code>levelup()</code></a>, although you can provide alternative encoding settings in the options for `put()` (it's recommended that you stay consistent in your encoding of keys and values in a single store).\n\nIf you provide a `'sync'` value of `true` in your `options` object, LevelDB will perform a synchronous write of the data; although the operation will be asynchronous as far as Node is concerned. Normally, LevelDB passes the data to the operating system for writing and returns immediately, however a synchronous write will use `fsync()` or equivalent so your callback won't be triggered until the data is actually on disk. Synchronous filesystem writes are **significantly** slower than asynchronous writes but if you want to be absolutely sure that the data is flushed then you can use `'sync': true`.\n\n--------------------------------------------------------\n<a name=\"get\"></a>\n### db.get(key[, options][, callback])\n<code>get()</code> is the primary method for fetching data from the store. The `key` can be an arbitrary data object but if it doesn't exist in the store then the callback will receive an error as its first argument.\n\n#### `options`\n\nEncoding of the `key` object will adhere to the `'keyEncoding'` option provided to <a href=\"#ctor\"><code>levelup()</code></a>, although you can provide alternative encoding settings in the options for `get()` (it's recommended that you stay consistent in your encoding of keys and values in a single store).\n\nLevelDB will by default fill the in-memory LRU Cache with data from a call to get. Disabling this is done by setting `fillCache` to `false`. \n\n--------------------------------------------------------\n<a name=\"del\"></a>\n### db.del(key[, options][, callback])\n<code>del()</code> is the primary method for removing data from the store.\n\n#### `options`\n\nEncoding of the `key` object will adhere to the `'keyEncoding'` option provided to <a href=\"#ctor\"><code>levelup()</code></a>, although you can provide alternative encoding settings in the options for `del()` (it's recommended that you stay consistent in your encoding of keys and values in a single store).\n\nA `'sync'` option can also be passed, see <a href=\"#put\"><code>put()</code></a> for details on how this works.\n\n--------------------------------------------------------\n<a name=\"batch\"></a>\n### db.batch(array[, options][, callback]) *(array form)*\n<code>batch()</code> can be used for very fast bulk-write operations (both *put* and *delete*). The `array` argument should contain a list of operations to be executed sequentially, although as a whole they are performed as an atomic operation inside LevelDB. Each operation is contained in an object having the following properties: `type`, `key`, `value`, where the *type* is either `'put'` or `'del'`. In the case of `'del'` the `'value'` property is ignored. Any entries with a `'key'` of `null` or `undefined` will cause an error to be returned on the `callback` and any `'type': 'put'` entry with a `'value'` of `null` or `undefined` will return an error.\n\n```js\nvar ops = [\n    { type: 'del', key: 'father' }\n  , { type: 'put', key: 'name', value: 'Yuri Irsenovich Kim' }\n  , { type: 'put', key: 'dob', value: '16 February 1941' }\n  , { type: 'put', key: 'spouse', value: 'Kim Young-sook' }\n  , { type: 'put', key: 'occupation', value: 'Clown' }\n]\n\ndb.batch(ops, function (err) {\n  if (err) return console.log('Ooops!', err)\n  console.log('Great success dear leader!')\n})\n```\n\n#### `options`\n\nSee <a href=\"#put\"><code>put()</code></a> for a discussion on the `options` object. You can overwrite default `'keyEncoding'` and `'valueEncoding'` and also specify the use of `sync` filesystem operations.\n\nIn addition to encoding options for the whole batch you can also overwrite the encoding per operation, like:\n\n```js\nvar ops = [\n  {\n    type: 'put',\n    key: new Buffer([1, 2, 3]),\n    value: { some: 'json' },\n    keyEncoding: 'binary',\n    valueEncoding: 'json'\n  }\n]\n```\n\n--------------------------------------------------------\n<a name=\"batch_chained\"></a>\n### db.batch() *(chained form)*\n<code>batch()</code>, when called with no arguments will return a `Batch` object which can be used to build, and eventually commit, an atomic LevelDB batch operation. Depending on how it's used, it is possible to obtain greater performance when using the chained form of `batch()` over the array form.\n\n```js\ndb.batch()\n  .del('father')\n  .put('name', 'Yuri Irsenovich Kim')\n  .put('dob', '16 February 1941')\n  .put('spouse', 'Kim Young-sook')\n  .put('occupation', 'Clown')\n  .write(function () { console.log('Done!') })\n```\n\n<b><code>batch.put(key, value[, options])</code></b>\n\nQueue a *put* operation on the current batch, not committed until a `write()` is called on the batch.\n\nThe optional `options` argument can be used to override the default `'keyEncoding'` and/or `'valueEncoding'`.\n\n<b><code>batch.del(key[, options])</code></b>\n\nQueue a *del* operation on the current batch, not committed until a `write()` is called on the batch.\n\nThe optional `options` argument can be used to override the default `'keyEncoding'`.\n\n<b><code>batch.clear()</code></b>\n\nClear all queued operations on the current batch, any previous operations will be discarded.\n\n<b><code>batch.write([callback])</code></b>\n\nCommit the queued operations for this batch. All operations not *cleared* will be written to the database atomically, that is, they will either all succeed or fail with no partial commits. The optional `callback` will be called when the operation has completed with an *error* argument if an error has occurred.\n\n\n--------------------------------------------------------\n<a name=\"isOpen\"></a>\n### db.isOpen()\n\nA LevelUP object can be in one of the following states:\n\n  * *\"new\"*     - newly created, not opened or closed\n  * *\"opening\"* - waiting for the database to be opened\n  * *\"open\"*    - successfully opened the database, available for use\n  * *\"closing\"* - waiting for the database to be closed\n  * *\"closed\"*  - database has been successfully closed, should not be used\n\n`isOpen()` will return `true` only when the state is \"open\".\n\n--------------------------------------------------------\n<a name=\"isClosed\"></a>\n### db.isClosed()\n\n*See <a href=\"#put\"><code>isOpen()</code></a>*\n\n`isClosed()` will return `true` only when the state is \"closing\" *or* \"closed\", it can be useful for determining if read and write operations are permissible.\n\n--------------------------------------------------------\n<a name=\"createReadStream\"></a>\n### db.createReadStream([options])\n\nYou can obtain a **ReadStream** of the full database by calling the `createReadStream()` method. The resulting stream is a complete Node.js-style [Readable Stream](http://nodejs.org/docs/latest/api/stream.html#stream_readable_stream) where `'data'` events emit objects with `'key'` and `'value'` pairs.\n\n```js\ndb.createReadStream()\n  .on('data', function (data) {\n    console.log(data.key, '=', data.value)\n  })\n  .on('error', function (err) {\n    console.log('Oh my!', err)\n  })\n  .on('close', function () {\n    console.log('Stream closed')\n  })\n  .on('end', function () {\n    console.log('Stream closed')\n  })\n```\n\nThe standard `pause()`, `resume()` and `destroy()` methods are implemented on the ReadStream, as is `pipe()` (see below). `'data'`, '`error'`, `'end'` and `'close'` events are emitted.\n\nAdditionally, you can supply an options object as the first parameter to `createReadStream()` with the following options:\n\n* `'start'`: the key you wish to start the read at. By default it will start at the beginning of the store. Note that the *start* doesn't have to be an actual key that exists, LevelDB will simply find the *next* key, greater than the key you provide.\n\n* `'end'`: the key you wish to end the read on. By default it will continue until the end of the store. Again, the *end* doesn't have to be an actual key as an (inclusive) `<=`-type operation is performed to detect the end. You can also use the `destroy()` method instead of supplying an `'end'` parameter to achieve the same effect.\n\n* `'reverse'` *(boolean, default: `false`)*: a boolean, set to true if you want the stream to go in reverse order. Beware that due to the way LevelDB works, a reverse seek will be slower than a forward seek.\n\n* `'keys'` *(boolean, default: `true`)*: whether the `'data'` event should contain keys. If set to `true` and `'values'` set to `false` then `'data'` events will simply be keys, rather than objects with a `'key'` property. Used internally by the `createKeyStream()` method.\n\n* `'values'` *(boolean, default: `true`)*: whether the `'data'` event should contain values. If set to `true` and `'keys'` set to `false` then `'data'` events will simply be values, rather than objects with a `'value'` property. Used internally by the `createValueStream()` method.\n\n* `'limit'` *(number, default: `-1`)*: limit the number of results collected by this stream. This number represents a *maximum* number of results and may not be reached if you get to the end of the store or your `'end'` value first. A value of `-1` means there is no limit.\n\n* `'fillCache'` *(boolean, default: `false`)*: wheather LevelDB's LRU-cache should be filled with data read.\n\n* `'keyEncoding'` / `'valueEncoding'` *(string)*: the encoding applied to each read piece of data.\n\n--------------------------------------------------------\n<a name=\"createKeyStream\"></a>\n### db.createKeyStream([options])\n\nA **KeyStream** is a **ReadStream** where the `'data'` events are simply the keys from the database so it can be used like a traditional stream rather than an object stream.\n\nYou can obtain a KeyStream either by calling the `createKeyStream()` method on a LevelUP object or by passing passing an options object to `createReadStream()` with `keys` set to `true` and `values` set to `false`.\n\n```js\ndb.createKeyStream()\n  .on('data', function (data) {\n    console.log('key=', data)\n  })\n\n// same as:\ndb.createReadStream({ keys: true, values: false })\n  .on('data', function (data) {\n    console.log('key=', data)\n  })\n```\n\n--------------------------------------------------------\n<a name=\"createValueStream\"></a>\n### db.createValueStream([options])\n\nA **ValueStream** is a **ReadStream** where the `'data'` events are simply the values from the database so it can be used like a traditional stream rather than an object stream.\n\nYou can obtain a ValueStream either by calling the `createValueStream()` method on a LevelUP object or by passing passing an options object to `createReadStream()` with `values` set to `true` and `keys` set to `false`.\n\n```js\ndb.createValueStream()\n  .on('data', function (data) {\n    console.log('value=', data)\n  })\n\n// same as:\ndb.createReadStream({ keys: false, values: true })\n  .on('data', function (data) {\n    console.log('value=', data)\n  })\n```\n\n--------------------------------------------------------\n<a name=\"createWriteStream\"></a>\n### db.createWriteStream([options])\n\nA **WriteStream** can be obtained by calling the `createWriteStream()` method. The resulting stream is a complete Node.js-style [Writable Stream](http://nodejs.org/docs/latest/api/stream.html#stream_writable_stream) which accepts objects with `'key'` and `'value'` pairs on its `write()` method.\n\nThe WriteStream will buffer writes and submit them as a `batch()` operations where writes occur *within the same tick*.\n\n```js\nvar ws = db.createWriteStream()\n\nws.on('error', function (err) {\n  console.log('Oh my!', err)\n})\nws.on('close', function () {\n  console.log('Stream closed')\n})\n\nws.write({ key: 'name', value: 'Yuri Irsenovich Kim' })\nws.write({ key: 'dob', value: '16 February 1941' })\nws.write({ key: 'spouse', value: 'Kim Young-sook' })\nws.write({ key: 'occupation', value: 'Clown' })\nws.end()\n```\n\nThe standard `write()`, `end()`, `destroy()` and `destroySoon()` methods are implemented on the WriteStream. `'drain'`, `'error'`, `'close'` and `'pipe'` events are emitted.\n\nYou can specify encodings both for the whole stream and individual entries:\n\nTo set the encoding for the whole stream, provide an options object as the first parameter to `createWriteStream()` with `'keyEncoding'` and/or `'valueEncoding'`.\n\nTo set the encoding for an individual entry:\n\n```js\nwriteStream.write({\n  key: new Buffer([1, 2, 3]),\n  value: { some: 'json' },\n  keyEncoding: 'binary',\n  valueEncoding: 'json'\n})\n```\n\n#### write({ type: 'put' })\n\nIf individual `write()` operations are performed with a `'type'` property of `'del'`, they will be passed on as `'del'` operations to the batch.\n\n```js\nvar ws = db.createWriteStream()\n\nws.on('error', function (err) {\n  console.log('Oh my!', err)\n})\nws.on('close', function () {\n  console.log('Stream closed')\n})\n\nws.write({ type: 'del', key: 'name' })\nws.write({ type: 'del', key: 'dob' })\nws.write({ type: 'put', key: 'spouse' })\nws.write({ type: 'del', key: 'occupation' })\nws.end()\n```\n\n#### db.createWriteStream({ type: 'put' })\n\nIf the *WriteStream* is created a `'type'` option of `'del'`, all `write()` operations will be interpreted as `'del'`, unless explicitly specified as `'put'`.\n\n```js\nvar ws = db.createWriteStream({ type: 'del' })\n\nws.on('error', function (err) {\n  console.log('Oh my!', err)\n})\nws.on('close', function () {\n  console.log('Stream closed')\n})\n\nws.write({ key: 'name' })\nws.write({ key: 'dob' })\n// but it can be overridden\nws.write({ type: 'put', key: 'spouse', value: 'Ri Sol-ju' })\nws.write({ key: 'occupation' })\nws.end()\n```\n\n#### Pipes and Node Stream compatibility\n\nA ReadStream can be piped directly to a WriteStream, allowing for easy copying of an entire database. A simple `copy()` operation is included in LevelUP that performs exactly this on two open databases:\n\n```js\nfunction copy (srcdb, dstdb, callback) {\n  srcdb.createReadStream().pipe(dstdb.createWriteStream()).on('close', callback)\n}\n```\n\nThe ReadStream is also [fstream](https://github.com/isaacs/fstream)-compatible which means you should be able to pipe to and from fstreams. So you can serialize and deserialize an entire database to a directory where keys are filenames and values are their contents, or even into a *tar* file using [node-tar](https://github.com/isaacs/node-tar). See the [fstream functional test](https://github.com/rvagg/node-levelup/blob/master/test/functional/fstream-test.js) for an example. *(Note: I'm not really sure there's a great use-case for this but it's a fun example and it helps to harden the stream implementations.)*\n\nKeyStreams and ValueStreams can be treated like standard streams of raw data. If `'keyEncoding'` or `'valueEncoding'` is set to `'binary'` the `'data'` events will simply be standard Node `Buffer` objects straight out of the data store.\n\n\n--------------------------------------------------------\n<a name='approximateSize'></a>\n### db.db.approximateSize(start, end, callback)\n<code>approximateSize()</code> can used to get the approximate number of bytes of file system space used by the range `[start..end)`. The result may not include recently written data.\n\n```js\nvar db = require('level')('./huge.db')\n\ndb.db.approximateSize('a', 'c', function (err, size) {\n  if (err) return console.error('Ooops!', err)\n  console.log('Approximate size of range is %d', size)\n})\n```\n\n**Note:** `approximateSize()` is available via [LevelDOWN](https://github.com/rvagg/node-leveldown/), which by default is accessible as the `db` property of your LevelUP instance. This is a specific LevelDB operation and is not likely to be available where you replace LevelDOWN with an alternative back-end via the `'db'` option.\n\n\n--------------------------------------------------------\n<a name='getProperty'></a>\n### db.db.getProperty(property)\n<code>getProperty</code> can be used to get internal details from LevelDB. When issued with a valid property string, a readable string will be returned (this method is synchronous).\n\nCurrently, the only valid properties are:\n\n* <b><code>'leveldb.num-files-at-levelN'</code></b>: returns the number of files at level *N*, where N is an integer representing a valid level (e.g. \"0\").\n\n* <b><code>'leveldb.stats'</code></b>: returns a multi-line string describing statistics about LevelDB's internal operation.\n\n* <b><code>'leveldb.sstables'</code></b>: returns a multi-line string describing all of the *sstables* that make up contents of the current database.\n\n\n```js\nvar db = require('level')('./huge.db')\nconsole.log(db.db.getProperty('leveldb.num-files-at-level3'))\n// → '243'\n```\n\n**Note:** `getProperty()` is available via [LevelDOWN](https://github.com/rvagg/node-leveldown/), which by default is accessible as the `db` property of your LevelUP instance. This is a specific LevelDB operation and is not likely to be available where you replace LevelDOWN with an alternative back-end via the `'db'` option.\n\n\n--------------------------------------------------------\n<a name=\"destroy\"></a>\n### leveldown.destroy(location, callback)\n<code>destroy()</code> is used to completely remove an existing LevelDB database directory. You can use this function in place of a full directory *rm* if you want to be sure to only remove LevelDB-related files. If the directory only contains LevelDB files, the directory itself will be removed as well. If there are additional, non-LevelDB files in the directory, those files, and the directory, will be left alone.\n\nThe callback will be called when the destroy operation is complete, with a possible `error` argument.\n\n**Note:** `destroy()` is available via [LevelDOWN](https://github.com/rvagg/node-leveldown/) which you will have to have available to `require()`, e.g.:\n\n```js\nrequire('leveldown').destroy('./huge.db', function () { console.log('done!') })\n```\n\n--------------------------------------------------------\n<a name=\"repair\"></a>\n### leveldown.repair(location, callback)\n<code>repair()</code> can be used to attempt a restoration of a damaged LevelDB store. From the LevelDB documentation:\n\n> If a DB cannot be opened, you may attempt to call this method to resurrect as much of the contents of the database as possible. Some data may be lost, so be careful when calling this function on a database that contains important information.\n\nYou will find information on the *repair* operation in the *LOG* file inside the store directory. \n\nA `repair()` can also be used to perform a compaction of the LevelDB log into table files.\n\nThe callback will be called when the repair operation is complete, with a possible `error` argument.\n\n**Note:** `destroy()` is available via [LevelDOWN](https://github.com/rvagg/node-leveldown/) which you will have to have available to `require()`, e.g.:\n\n```js\nrequire('leveldown').repair('./huge.db', function () { console.log('done!') })\n```\n\n--------------------------------------------------------\n\n<a name=\"events\"></a>\nEvents\n------\n\nLevelUP emits events when the callbacks to the corresponding methods are called.\n\n* `db.emit('put', key, value)` emitted when a new value is `'put'`\n* `db.emit('del', key)` emitted when a value is deleted\n* `db.emit('batch', ary)` emitted when a batch operation has executed\n* `db.emit('ready')` emitted when the database has opened (`'open'` is synonym)\n* `db.emit('closed')` emitted when the database has closed\n* `db.emit('opening')` emitted when the database is opening\n* `db.emit('closing')` emitted when the database is closing\n\nIf you do not pass a callback to an async function, and there is an error, LevelUP will `emit('error', err)` instead.\n\n<a name=\"json\"></a>\nJSON data\n---------\n\nYou specify `'json'` encoding for both keys and/or values, you can then supply JavaScript objects to LevelUP and receive them from all fetch operations, including ReadStreams. LevelUP will automatically *stringify* your objects and store them as *utf8* and parse the strings back into objects before passing them back to you.\n\n<a name=\"extending\"></a>\nExtending LevelUP\n-----------------\n\nA list of <a href=\"https://github.com/rvagg/node-levelup/wiki/Modules\"><b>Node.js LevelDB modules and projects</b></a> can be found in the wiki.\n\nWhen attempting to extend the functionality of LevelUP, it is recommended that you consider using [level-hooks](https://github.com/dominictarr/level-hooks) and/or [level-sublevel](https://github.com/dominictarr/level-sublevel). **level-sublevel** is particularly helpful for keeping additional, extension-specific, data in a LevelDB store. It allows you to partition a LevelUP instance into multiple sub-instances that each correspond to discrete namespaced key ranges.\n\n<a name=\"multiproc\"></a>\nMulti-process access\n--------------------\n\nLevelDB is thread-safe but is **not** suitable for accessing with multiple processes. You should only ever have a LevelDB database open from a single Node.js process. Node.js clusters are made up of multiple processes so a LevelUP instance cannot be shared between them either.\n\nSee the <a href=\"https://github.com/rvagg/node-levelup/wiki/Modules\"><b>wiki</b></a> for some LevelUP extensions, including [multilevel](https://github.com/juliangruber/multilevel), that may help if you require a single data store to be shared across processes.\n\n<a name=\"support\"></a>\nGetting support\n---------------\n\nThere are multiple ways you can find help in using LevelDB in Node.js:\n\n * **IRC:** you'll find an active group of LevelUP users in the **##leveldb** channel on Freenode, including most of the contributors to this project.\n * **Mailing list:** there is an active [Node.js LevelDB](https://groups.google.com/forum/#!forum/node-levelup) Google Group.\n * **GitHub:** you're welcome to open an issue here on this GitHub repository if you have a question.\n\n<a name=\"contributing\"></a>\nContributing\n------------\n\nLevelUP is an **OPEN Open Source Project**. This means that:\n\n> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.\n\nSee the [CONTRIBUTING.md](https://github.com/rvagg/node-levelup/blob/master/CONTRIBUTING.md) file for more details.\n\n### Contributors\n\nLevelUP is only possible due to the excellent work of the following contributors:\n\n<table><tbody>\n<tr><th align=\"left\">Rod Vagg</th><td><a href=\"https://github.com/rvagg\">GitHub/rvagg</a></td><td><a href=\"http://twitter.com/rvagg\">Twitter/@rvagg</a></td></tr>\n<tr><th align=\"left\">John Chesley</th><td><a href=\"https://github.com/chesles/\">GitHub/chesles</a></td><td><a href=\"http://twitter.com/chesles\">Twitter/@chesles</a></td></tr>\n<tr><th align=\"left\">Jake Verbaten</th><td><a href=\"https://github.com/raynos\">GitHub/raynos</a></td><td><a href=\"http://twitter.com/raynos2\">Twitter/@raynos2</a></td></tr>\n<tr><th align=\"left\">Dominic Tarr</th><td><a href=\"https://github.com/dominictarr\">GitHub/dominictarr</a></td><td><a href=\"http://twitter.com/dominictarr\">Twitter/@dominictarr</a></td></tr>\n<tr><th align=\"left\">Max Ogden</th><td><a href=\"https://github.com/maxogden\">GitHub/maxogden</a></td><td><a href=\"http://twitter.com/maxogden\">Twitter/@maxogden</a></td></tr>\n<tr><th align=\"left\">Lars-Magnus Skog</th><td><a href=\"https://github.com/ralphtheninja\">GitHub/ralphtheninja</a></td><td><a href=\"http://twitter.com/ralphtheninja\">Twitter/@ralphtheninja</a></td></tr>\n<tr><th align=\"left\">David Björklund</th><td><a href=\"https://github.com/kesla\">GitHub/kesla</a></td><td><a href=\"http://twitter.com/david_bjorklund\">Twitter/@david_bjorklund</a></td></tr>\n<tr><th align=\"left\">Julian Gruber</th><td><a href=\"https://github.com/juliangruber\">GitHub/juliangruber</a></td><td><a href=\"http://twitter.com/juliangruber\">Twitter/@juliangruber</a></td></tr>\n<tr><th align=\"left\">Paolo Fragomeni</th><td><a href=\"https://github.com/hij1nx\">GitHub/hij1nx</a></td><td><a href=\"http://twitter.com/hij1nx\">Twitter/@hij1nx</a></td></tr>\n<tr><th align=\"left\">Anton Whalley</th><td><a href=\"https://github.com/No9\">GitHub/No9</a></td><td><a href=\"https://twitter.com/antonwhalley\">Twitter/@antonwhalley</a></td></tr>\n<tr><th align=\"left\">Matteo Collina</th><td><a href=\"https://github.com/mcollina\">GitHub/mcollina</a></td><td><a href=\"https://twitter.com/matteocollina\">Twitter/@matteocollina</a></td></tr>\n<tr><th align=\"left\">Pedro Teixeira</th><td><a href=\"https://github.com/pgte\">GitHub/pgte</a></td><td><a href=\"https://twitter.com/pgte\">Twitter/@pgte</a></td></tr>\n</tbody></table>\n\n### Windows\n\nA large portion of the Windows support comes from code by [Krzysztof Kowalczyk](http://blog.kowalczyk.info/) [@kjk](https://twitter.com/kjk), see his Windows LevelDB port [here](http://code.google.com/r/kkowalczyk-leveldb/). If you're using LevelUP on Windows, you should give him your thanks!\n\n\n<a name=\"licence\"></a>\nLicence &amp; copyright\n-------------------\n\nCopyright (c) 2012-2013 LevelUP contributors (listed above).\n\nLevelUP is licensed under an MIT +no-false-attribs license. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.\n\n*LevelUP builds on the excellent work of the LevelDB and Snappy teams from Google and additional contributors. LevelDB and Snappy are both issued under the [New BSD Licence](http://opensource.org/licenses/BSD-3-Clause).*\n",
  "readmeFilename": "README.md",
  "bugs": {
    "url": "https://github.com/rvagg/node-levelup/issues"
  },
  "_id": "levelup@0.11.0",
  "_from": "levelup@"
}

})()
},{}],79:[function(require,module,exports){
var MuxDemux = require('mux-demux/jsonb');

module.exports = {
  client : require('./lib/client')(MuxDemux),
  server : require('./lib/server')(MuxDemux)
};

},{"./lib/client":80,"./lib/server":81,"mux-demux/jsonb":86}],80:[function(require,module,exports){
/**
 * Module dependencies.
 */

var rpc = require('rpc-stream');
var Emitter = require('events').EventEmitter;
var duplexer = require('duplexer');
var manifest = require('level-manifest');
var combine = require('stream-combiner');
var inherits = require('util').inherits;
var tmpStream = require('tmp-stream');

module.exports = function (MuxDemux) {

function Db (m) {
  if (!(this instanceof Db)) return new Db(m);
  if (!m) m = manifest({ methods: {} });
  Emitter.call(this);

  this.isClient = true;
  this._isOpen = false;
  this.methods = m.methods;

  this.mdm = null;
  this.client = null;
  var self = this;

  this._buildAll(m, this, [], null);
  this.on('pipe', deprecated);
}

inherits(Db, Emitter);

Db.prototype.sublevel = function (name) {
  if (!this.sublevels || !this.sublevels[name]) {
    throw new Error('client cannot create new sublevels');
  }
  return this.sublevels[name];
};

Db.prototype.prefix = function (key) {
  if (!this._parent) return '' + (key || '');
  return (this._parent.prefix()
    + this._sep + this._prefix + this._sep + (key || ''));
};

Db.prototype.createRpcStream = function () {
  var self = this;
  self._isOpen = true;

  var mdm = self.mdm = MuxDemux({ error: true });
  mdm.on('end', function () {
    self._isOpen = false;
    self.emit('close');
  });

  var client = self.client = rpc(null, true);
  var rpcStream = mdm.createStream('rpc'); 
  rpcStream.on('error', function () {});
  client.pipe(rpcStream).pipe(client);

  setTimeout(function () {
    self.emit('open');
  });

  return mdm;
};

Db.prototype.close = function () {
  this._isOpen = false;
  if (this.mdm) this.mdm.end();
};

Db.prototype.destroy = function () {
  if (this.mdm) this.mdm.close();
};

Db.prototype.auth = function () {
  var args = [].slice.call(arguments);
  var cb = typeof args[args.length - 1] == 'function'
    ? args.pop()
    : function () {};
  this.client.rpc('auth', args, cb);
};

Db.prototype.deauth = function () {
  var args = [].slice.call(arguments);
  var cb = typeof args[args.length - 1] == 'function'
    ? args.pop()
    : function () {};
  this.client.rpc('deauth', args, cb);
};

Db.prototype.pipe = deprecated;

function deprecated () {
  throw new Error(
    'The API changed. Use db.createRpcStream().'
  );
}


Db.prototype._buildAll = function (_db, db, path, parent) {
  var self = this;
  var m = manifest(_db);

  for (var k in m.methods) {
    var method = m.methods[k];
    var type = method.type;
    var name = path.concat(k).join('!');

    if (type == 'error') throw new Error(method.message || 'not supported');

    /async|sync/.test(type)
      ? self._asyncSync(db, k, name)
      : self._stream(db, k, name, type);
  }

  db._sep = _db._sep || '\xff';
  db._prefix = _db._prefix;
  db._parent = parent;

  for (var name in _db.sublevels) {
    var sublevel = _db.sublevels[name];
    db.sublevels = db.sublevels || {};
    db.sublevels[name] = new Db(sublevel);
    self._buildAll(sublevel, db.sublevels[name], path.concat(name), db);
  }
};

Db.prototype._asyncSync = function (db, k, name) {
  var self = this;

  db[k] = function () {
    var args = [].slice.call(arguments);
    var cb = typeof args[args.length - 1] == 'function'
      ? args.pop()
      : null;

    if (/is(Open|Closed)/.test(k) && !cb) {
      if (k == 'isOpen') return self._isOpen;
      else return !self._isOpen;
    }

    if (!cb) cb = function (err) {
      if (err) db.emit('error', err)
    };

    self._queue(function () {
      self.client.rpc(name, args, cb);
    });
  };
};

Db.prototype._stream = function (db, k, name, type) {
  var self = this;

  db[k] = function () {
    var args = [].slice.call(arguments);
    args.unshift(name);

    var tmp = tmpStream();

    self._queue(function () {
      var mdm = self.mdm;
      var ts = (
          type === 'readable'
        ? mdm.createReadStream(args)
        : type == 'writable'
        ? mdm.createWriteStream(args)
        : type == 'duplex'
        ? mdm.createStream(args)
        : (function () { throw new Error('not supported') })()
      );
      ts.autoDestroy = false;
      tmp.replace(ts); 
    });

    return tmp;
  };
};

Db.prototype._queue = function (fn) {
  if (this._isOpen) fn();
  else this.once('open', fn);
};

return Db;

};


},{"duplexer":82,"events":5,"level-manifest":83,"rpc-stream":105,"stream-combiner":108,"tmp-stream":109,"util":9}],81:[function(require,module,exports){
/**
 * Module dependencies.
 */

var rpc = require('rpc-stream');
var manifest = require('level-manifest');

module.exports = function (MuxDemux) {

return function (db, opts) {
  if (typeof db == 'string') throw new Error('database instance required');
  
  var mdm = MuxDemux({ error: true });

  opts = opts || {};

  var deauth = opts.deauth || function () {};
  var auth = opts.auth || function () {
    var cb = [].pop.call(arguments);
    cb(null, true);
  };
  var access = opts.access || function () { return true };
  
  var server = rpc(null, true);
  var handlers = {};

  (function buildAll (db, path) {
    var m = manifest(db);
    for (var k in m.methods) (function (k) {
      var name = path.concat(k).join('!');
      var method = m.methods[k];

      if (method.type == 'async') {
        server.createLocalCall(name, function (args, cb) {
          access(server.sessionData, db, k, args);
          args.push(cb);
          db[k].apply(db, args);
        });
      } else if (method.type == 'sync') {
        server.createLocalCall(name, function (args, cb) {
          access(server.sessionData, db, k, args);
          var r;
          try { r = db[k].apply(db, args) }
          catch (err) { return cb(err) }
          cb(null, r);
        });
      } else {
        handlers[name] = function (args) {
          access(server.sessionData, db, k, args);
          return db[k].apply(db, args);
        };
      }
    })(k);

    for(var name in db.sublevels) {
      buildAll(db.sublevels[name], path.concat(name));
    }
  })(db, []);

  server.createLocalCall('auth', function (args, cb) {
    auth.apply(null, args.concat(function authCb (err, data) {
      if (err) return cb(err);
      server.sessionData = data;
      cb(null, data);
    }));
  });

  server.createLocalCall('deauth', function (args, cb) {
    server.sessionData = null;
    if (opts.deauth) opts.deauth.apply(null, args);
    else cb();
  });

  mdm.on('connection', function (con) {
    con.on('error', function () {});

    if (con.meta == 'rpc') return con.pipe(server).pipe(con);

    try {
      var stream = handlers[con.meta[0]](con.meta.slice(1));
      if (stream.readable) stream.pipe(con);
      if (stream.writable) con.pipe(stream);
    } catch (err) {
      mdm.emit('error', err);
    }
  });

  return mdm;
};

};

},{"level-manifest":83,"rpc-stream":105}],82:[function(require,module,exports){
var Stream = require("stream")
    , writeMethods = ["write", "end", "destroy"]
    , readMethods = ["resume", "pause"]
    , readEvents = ["data", "close"]
    , slice = Array.prototype.slice

module.exports = duplex

function duplex(writer, reader) {
    var stream = new Stream()
        , ended = false

    writeMethods.forEach(proxyWriter)

    readMethods.forEach(proxyReader)

    readEvents.forEach(proxyStream)

    reader.on("end", handleEnd)

    writer.on("drain", function() {
      stream.emit("drain")
    })

    writer.on("error", reemit)
    reader.on("error", reemit)

    stream.writable = writer.writable
    stream.readable = reader.readable

    return stream

    function proxyWriter(methodName) {
        stream[methodName] = method

        function method() {
            return writer[methodName].apply(writer, arguments)
        }
    }

    function proxyReader(methodName) {
        stream[methodName] = method

        function method() {
            stream.emit(methodName)
            var func = reader[methodName]
            if (func) {
                return func.apply(reader, arguments)
            }
            reader.emit(methodName)
        }
    }

    function proxyStream(methodName) {
        reader.on(methodName, reemit)

        function reemit() {
            var args = slice.call(arguments)
            args.unshift(methodName)
            stream.emit.apply(stream, args)
        }
    }

    function handleEnd() {
        if (ended) {
            return
        }
        ended = true
        var args = slice.call(arguments)
        args.unshift("end")
        stream.emit.apply(stream, args)
    }

    function reemit(err) {
        stream.emit("error", err)
    }
}

},{"stream":7}],83:[function(require,module,exports){

var deepExtend = require('deep-extend')

var methods = {
  createReadStream  : {type: 'readable'},
  readStream        : {type: 'readable'},
  createValueStream : {type: 'readable'},
  valueStream       : {type: 'readable'},
  createKeyStream   : {type: 'readable'},
  keyStream         : {type: 'readable'},
  createWriteStream : {type: 'writable'},
  writeStream       : {type: 'writable'},
  isOpen            : {type: 'sync'},
  isClosed          : {type: 'sync'},
  put               : {type: 'async'},
  get               : {type: 'async'},
  del               : {type: 'async'},
  batch             : {type: 'async'},
  approximateSize   : {type: 'async'}
}

//valid types:
//readable, writable, duplex, sync, async, error

//error means that this method is disabled in the client
//the client should throw

function getMethods (db) {
  var _methods = db.methods || {}
  return merge(merge({}, methods), _methods)
}

module.exports = function manifest (db, terse) {
  var man = {}
  if(db.methods || !terse) man.methods = {}
  if(!terse) {
    deepExtend(deepExtend(man.methods, methods), db.methods)
  } else
    deepExtend(man.methods, db.methods)

  if(db._sep)
    man._sep = db._sep
  if(db._prefix)
    man._prefix = db._prefix

  if(db.sublevels) {
    man.sublevels = {}
    for(var name in db.sublevels) {
      man.sublevels[name] = manifest(db.sublevels[name], terse)
    }
  }
  return man
}


},{"deep-extend":84}],84:[function(require,module,exports){
/*!
 * Node.JS module "Deep Extend"
 * @version 0.2.5
 * @description Recursive object extending.
 * @author Viacheslav Lotsmanov (unclechu)
 */

/**
 * Extening object that entered in first argument.
 * Returns extended object or false if have no target object or incorrect type.
 * If you wish to clone object, simply use that:
 *  deepExtend({}, yourObj_1, [yourObj_N]) - first arg is new empty object
 */
var deepExtend = module.exports = function (/*obj_1, [obj_2], [obj_N]*/) {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }

    if (arguments.length < 2) return arguments[0];

    var target = arguments[0];

    // convert arguments to array and cut off target object
    var args = Array.prototype.slice.call(arguments, 1);

    var key, val, src, clone;

    args.forEach(function (obj) {
        if (typeof obj !== 'object') return;

        for (key in obj) {
            if (obj[key] !== void 0) {
                src = target[key];
                val = obj[key];

                if (val === target) continue;

                if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    continue;
                }

                if (typeof src !== 'object') {
                    clone = (Array.isArray(val)) ? [] : {};
                    target[key] = deepExtend(clone, val);
                    continue;
                }

                if (Array.isArray(val)) {
                    clone = (Array.isArray(src)) ? src : [];
                } else {
                    clone = (!Array.isArray(src)) ? src : {};
                }

                target[key] = deepExtend(clone, val);
            }
        }
    });

    return target;
}

},{}],85:[function(require,module,exports){
'use strict';

var through = require('through')
  , extend = require('xtend')
  , duplex = require('duplex')

module.exports = function (wrap) {

function MuxDemux (opts, onConnection) {
  if('function' === typeof opts)
    onConnection = opts, opts = null
  opts = opts || {}

  function createID() {
    return (
      Math.random().toString(16).slice(2) +
      Math.random().toString(16).slice(2)
    )
  }

  var streams = {}, streamCount = 0
  var md = duplex()//.resume()

  md.on('_data', function (data) {
    if(!(Array.isArray(data)
      && 'string' === typeof data[0]
      && '__proto__' !== data[0]
      && 'string' === typeof data[1]
      && '__proto__' !== data[1]
    )) return
    var id = data.shift()
    var event = data[0]
    var s = streams[id]
    if(!s) {
      if(event == 'close')
        return
      if(event != 'new')
        return outer.emit('unknown', id)
      md.emit('connection', createStream(id, data[1].meta, data[1].opts))
    }
    else if (event === 'pause')
      s.paused = true
    else if (event === 'resume') {
      var p = s.paused
      s.paused = false
      if(p) s.emit('drain')
    }
    else if (event === 'error') {
      var error = data[1]
      if (typeof error === 'string') {
        s.emit('error', new Error(error))
      } else if (typeof error.message === 'string') {
        var e = new Error(error.message)
        extend(e, error)
        s.emit('error', e)
      } else {
        s.emit('error', error)
      }
    }
    else {
      s.emit.apply(s, data)
    }
  })
  .on('_end', function () {
    destroyAll()
    md._end()
  })

  function destroyAll (_err) {
    md.removeListener('end', destroyAll)
    md.removeListener('error', destroyAll)
    md.removeListener('close', destroyAll)
    var err = _err || new Error ('unexpected disconnection')
    for (var i in streams) {
      var s = streams[i]
      s.destroyed = true
      if (opts.error !== true) {
        s.end()
      } else {
        s.emit('error', err)
        s.destroy()
      }
    }
  }

  //end the stream once sub-streams have ended.
  //(waits for them to close, like on a tcp server)

  function createStream(id, meta, opts) {
    streamCount ++
    var s = through(function (data) {
      if(!this.writable) {
        var err = Error('stream is not writable: ' + id)
        err.stream = this
        return outer.emit("error", err)
      }
      md._data([s.id, 'data', data])
    }, function () {
      md._data([s.id, 'end'])
      if (this.readable && !opts.allowHalfOpen && !this.ended) {
        this.emit("end")
      }
    })
    s.pause = function () {
      md._data([s.id, 'pause'])
    }
    s.resume = function () {
      md._data([s.id, 'resume'])
    }
    s.error = function (message) {
      md._data([s.id, 'error', message])
    }
    s.once('close', function () {
      delete streams[id]
      streamCount --
      md._data([s.id, 'close'])
      if(streamCount === 0)
        md.emit('zero')
    })
    s.writable = opts.writable
    s.readable = opts.readable
    streams[s.id = id] = s
    s.meta = meta
    return s
  }

  var outer = wrap(md, opts)

  if(md !== outer) {
    md.on('connection', function (stream) {
      outer.emit('connection', stream)
    })
  }

  outer.close = function (cb) {
    md.once('zero', function () {
      md._end()
      if(cb) cb()
    })
    return this
  }

  if(onConnection)
    outer.on('connection', onConnection)

  outer.on('connection', function (stream) {
    //if mux-demux recieves a stream but there is nothing to handle it,
    //then return an error to the other side.
    //still trying to think of the best error message.
    if(outer.listeners('connection').length === 1)
      stream.error('remote end lacks connection listener ' 
        + outer.listeners('connection').length)
  })

  var pipe = outer.pipe
  outer.pipe = function (dest, opts) {
    pipe.call(outer, dest, opts)
    md.on('end', destroyAll)
    md.on('close', destroyAll)
    md.on('error', destroyAll)
    return dest
  }

  outer.createStream = function (meta, opts) {
    opts = opts || {}
    if (!opts.writable && !opts.readable)
      opts.readable = opts.writable = true
    var s = createStream(createID(), meta, opts)
    var _opts = {writable: opts.readable, readable: opts.writable}
    md._data([s.id, 'new', {meta: meta, opts: _opts}])
    return s
  }
  outer.createWriteStream = function (meta) {
    return outer.createStream(meta, {writable: true, readable: false})
  }
  outer.createReadStream = function (meta) {
    return outer.createStream(meta, {writable: false, readable: true})
  }

  return outer
}

  return MuxDemux
} //inject


},{"duplex":87,"through":103,"xtend":104}],86:[function(require,module,exports){
var JSONB = require('json-buffer')
var serializer = require('stream-serializer')

var inject = require('./inject')

function wrap (stream) {
  return serializer.json(stream, JSONB)
}

module.exports = inject(wrap)

module.exports.wrap = wrap

},{"./inject":85,"json-buffer":88,"stream-serializer":102}],87:[function(require,module,exports){
(function(process){var Stream = require('stream')

module.exports = function (write, end) {
  var stream = new Stream() 
  var buffer = [], ended = false, destroyed = false, emitEnd
  stream.writable = stream.readable = true
  stream.paused = false
  stream._paused = false
  stream.buffer = buffer
  
  stream
    .on('pause', function () {
      stream._paused = true
    })
    .on('drain', function () {
      stream._paused = false
    })
   
  function destroySoon () {
    process.nextTick(stream.destroy.bind(stream))
  }

  if(write)
    stream.on('_data', write)
  if(end)
    stream.on('_end', end)

  //destroy the stream once both ends are over
  //but do it in nextTick, so that other listeners
  //on end have time to respond
  stream.once('end', function () { 
    stream.readable = false
    if(!stream.writable) {
      process.nextTick(function () {
        stream.destroy()
      })
    }
  })

  stream.once('_end', function () { 
    stream.writable = false
    if(!stream.readable)
      stream.destroy()
  })

  // this is the default write method,
  // if you overide it, you are resposible
  // for pause state.

  
  stream._data = function (data) {
    if(!stream.paused && !buffer.length)
      stream.emit('data', data)
    else 
      buffer.push(data)
    return !(stream.paused || buffer.length)
  }

  stream._end = function (data) { 
    if(data) stream._data(data)
    if(emitEnd) return
    emitEnd = true
    //destroy is handled above.
    stream.drain()
  }

  stream.write = function (data) {
    stream.emit('_data', data)
    return !stream._paused
  }

  stream.end = function () {
    stream.writable = false
    if(stream.ended) return
    stream.ended = true
    stream.emit('_end')
  }

  stream.drain = function () {
    if(!buffer.length && !emitEnd) return
    //if the stream is paused after just before emitEnd()
    //end should be buffered.
    while(!stream.paused) {
      if(buffer.length) {
        stream.emit('data', buffer.shift())
        if(buffer.length == 0) {
          stream.emit('_drain')
        }
      }
      else if(emitEnd && stream.readable) {
        stream.readable = false
        stream.emit('end')
        return
      } else {
        //if the buffer has emptied. emit drain.
        return true
      }
    }
  }
  var started = false
  stream.resume = function () {
    //this is where I need pauseRead, and pauseWrite.
    //here the reading side is unpaused,
    //but the writing side may still be paused.
    //the whole buffer might not empity at once.
    //it might pause again.
    //the stream should never emit data inbetween pause()...resume()
    //and write should return !buffer.length
    started = true
    stream.paused = false
    stream.drain() //will emit drain if buffer empties.
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = ended = true     
    buffer.length = 0
    stream.emit('close')
  }
  var pauseCalled = false
  stream.pause = function () {
    started = true
    stream.paused = true
    stream.emit('_pause')
    return stream
  }
  stream._pause = function () {
    if(!stream._paused) {
      stream._paused = true
      stream.emit('pause')
    }
    return this
  }
  stream.paused = true
  process.nextTick(function () {
    //unless the user manually paused
    if(started) return
    stream.resume()
  })
 
  return stream
}


})(require("__browserify_process"))
},{"__browserify_process":23,"stream":7}],88:[function(require,module,exports){
var bops = require('bops')

//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

exports.stringify = function stringify (o) {
  if(o && bops.is(o))
    return JSON.stringify(':base64:' + bops.to(o, 'base64'))

  if(o && o.toJSON)
    o =  o.toJSON()

  if(o && 'object' === typeof o) {
    var s = ''
    var array = Array.isArray(o)
    s = array ? '[' : '{'
    var first = true

    for(var k in o) {
      var isFunction = 'function' == typeof o[k]
      if(Object.hasOwnProperty.call(o, k) && o[k] !== void(0) && !isFunction) {
        if(!first)
          s += ','
        first = false
        s += array ? stringify(o[k]) : stringify(k) + ':' + stringify(o[k])
      }
    }

    s += array ? ']' : '}'

    return s
  } else if ('string' === typeof o) {
    return JSON.stringify(/^:/.test(o) ? ':' + o : o)
  } else 
    return JSON.stringify(o)
}

exports.parse = function (s) {
  return JSON.parse(s, function (key, value) {
    if('string' === typeof value) {
      if(/^:base64:/.test(value))
        return bops.from(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
}

},{"bops":89}],89:[function(require,module,exports){
var proto = {}
module.exports = proto

proto.from = require('./from.js')
proto.to = require('./to.js')
proto.is = require('./is.js')
proto.subarray = require('./subarray.js')
proto.join = require('./join.js')
proto.copy = require('./copy.js')
proto.create = require('./create.js')

mix(require('./read.js'), proto)
mix(require('./write.js'), proto)

function mix(from, into) {
  for(var key in from) {
    into[key] = from[key]
  }
}

},{"./copy.js":92,"./create.js":93,"./from.js":94,"./is.js":95,"./join.js":96,"./read.js":98,"./subarray.js":99,"./to.js":100,"./write.js":101}],90:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],91:[function(require,module,exports){
module.exports = to_utf8

var out = []
  , col = []
  , fcc = String.fromCharCode
  , mask = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
  , unmask = [
      0x00
    , 0x01
    , 0x02 | 0x01
    , 0x04 | 0x02 | 0x01
    , 0x08 | 0x04 | 0x02 | 0x01
    , 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x40 | 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
  ]

function to_utf8(bytes, start, end) {
  start = start === undefined ? 0 : start
  end = end === undefined ? bytes.length : end

  var idx = 0
    , hi = 0x80
    , collecting = 0
    , pos
    , by

  col.length =
  out.length = 0

  while(idx < bytes.length) {
    by = bytes[idx]
    if(!collecting && by & hi) {
      pos = find_pad_position(by)
      collecting += pos
      if(pos < 8) {
        col[col.length] = by & unmask[6 - pos]
      }
    } else if(collecting) {
      col[col.length] = by & unmask[6]
      --collecting
      if(!collecting && col.length) {
        out[out.length] = fcc(reduced(col, pos))
        col.length = 0
      }
    } else { 
      out[out.length] = fcc(by)
    }
    ++idx
  }
  if(col.length && !collecting) {
    out[out.length] = fcc(reduced(col, pos))
    col.length = 0
  }
  return out.join('')
}

function find_pad_position(byt) {
  for(var i = 0; i < 7; ++i) {
    if(!(byt & mask[i])) {
      break
    }
  }
  return i
}

function reduced(list) {
  var out = 0
  for(var i = 0, len = list.length; i < len; ++i) {
    out |= list[i] << ((len - i - 1) * 6)
  }
  return out
}

},{}],92:[function(require,module,exports){
module.exports = copy

var slice = [].slice

function copy(source, target, target_start, source_start, source_end) {
  target_start = arguments.length < 3 ? 0 : target_start
  source_start = arguments.length < 4 ? 0 : source_start
  source_end = arguments.length < 5 ? source.length : source_end

  if(source_end === source_start) {
    return
  }

  if(target.length === 0 || source.length === 0) {
    return
  }

  if(source_end > source.length) {
    source_end = source.length
  }

  if(target.length - target_start < source_end - source_start) {
    source_end = target.length - target_start + start
  }

  if(source.buffer !== target.buffer) {
    return fast_copy(source, target, target_start, source_start, source_end)
  }
  return slow_copy(source, target, target_start, source_start, source_end)
}

function fast_copy(source, target, target_start, source_start, source_end) {
  var len = (source_end - source_start) + target_start

  for(var i = target_start, j = source_start;
      i < len;
      ++i,
      ++j) {
    target[i] = source[j]
  }
}

function slow_copy(from, to, j, i, jend) {
  // the buffers could overlap.
  var iend = jend + i
    , tmp = new Uint8Array(slice.call(from, i, iend))
    , x = 0

  for(; i < iend; ++i, ++x) {
    to[j++] = tmp[x]
  }
}

},{}],93:[function(require,module,exports){
module.exports = function(size) {
  return new Uint8Array(size)
}

},{}],94:[function(require,module,exports){
module.exports = from

var base64 = require('base64-js')

var decoders = {
    hex: from_hex
  , utf8: from_utf
  , base64: from_base64
}

function from(source, encoding) {
  if(Array.isArray(source)) {
    return new Uint8Array(source)
  }

  return decoders[encoding || 'utf8'](source)
}

function from_hex(str) {
  var size = str.length / 2
    , buf = new Uint8Array(size)
    , character = ''

  for(var i = 0, len = str.length; i < len; ++i) {
    character += str.charAt(i)

    if(i > 0 && (i % 2) === 1) {
      buf[i>>>1] = parseInt(character, 16)
      character = '' 
    }
  }

  return buf 
}

function from_utf(str) {
  var bytes = []
    , tmp
    , ch

  for(var i = 0, len = str.length; i < len; ++i) {
    ch = str.charCodeAt(i)
    if(ch & 0x80) {
      tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for(var j = 0, jlen = tmp.length; j < jlen; ++j) {
        bytes[bytes.length] = parseInt(tmp[j], 16)
      }
    } else {
      bytes[bytes.length] = ch 
    }
  }

  return new Uint8Array(bytes)
}

function from_base64(str) {
  return new Uint8Array(base64.toByteArray(str)) 
}

},{"base64-js":90}],95:[function(require,module,exports){

module.exports = function(buffer) {
  return buffer instanceof Uint8Array;
}

},{}],96:[function(require,module,exports){
module.exports = join

function join(targets, hint) {
  if(!targets.length) {
    return new Uint8Array(0)
  }

  var len = hint !== undefined ? hint : get_length(targets)
    , out = new Uint8Array(len)
    , cur = targets[0]
    , curlen = cur.length
    , curidx = 0
    , curoff = 0
    , i = 0

  while(i < len) {
    if(curoff === curlen) {
      curoff = 0
      ++curidx
      cur = targets[curidx]
      curlen = cur && cur.length
      continue
    }
    out[i++] = cur[curoff++] 
  }

  return out
}

function get_length(targets) {
  var size = 0
  for(var i = 0, len = targets.length; i < len; ++i) {
    size += targets[i].byteLength
  }
  return size
}

},{}],97:[function(require,module,exports){
var proto
  , map

module.exports = proto = {}

map = typeof WeakMap === 'undefined' ? null : new WeakMap

proto.get = !map ? no_weakmap_get : get

function no_weakmap_get(target) {
  return new DataView(target.buffer, 0)
}

function get(target) {
  var out = map.get(target.buffer)
  if(!out) {
    map.set(target.buffer, out = new DataView(target.buffer, 0))
  }
  return out
}

},{}],98:[function(require,module,exports){
module.exports = {
    readUInt8:      read_uint8
  , readInt8:       read_int8
  , readUInt16LE:   read_uint16_le
  , readUInt32LE:   read_uint32_le
  , readInt16LE:    read_int16_le
  , readInt32LE:    read_int32_le
  , readFloatLE:    read_float_le
  , readDoubleLE:   read_double_le
  , readUInt16BE:   read_uint16_be
  , readUInt32BE:   read_uint32_be
  , readInt16BE:    read_int16_be
  , readInt32BE:    read_int32_be
  , readFloatBE:    read_float_be
  , readDoubleBE:   read_double_be
}

var map = require('./mapped.js')

function read_uint8(target, at) {
  return target[at]
}

function read_int8(target, at) {
  var v = target[at];
  return v < 0x80 ? v : v - 0x100
}

function read_uint16_le(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, true)
}

function read_uint32_le(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, true)
}

function read_int16_le(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, true)
}

function read_int32_le(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, true)
}

function read_float_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, true)
}

function read_double_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, true)
}

function read_uint16_be(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, false)
}

function read_uint32_be(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, false)
}

function read_int16_be(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, false)
}

function read_int32_be(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, false)
}

function read_float_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, false)
}

function read_double_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, false)
}

},{"./mapped.js":97}],99:[function(require,module,exports){
module.exports = subarray

function subarray(buf, from, to) {
  return buf.subarray(from || 0, to || buf.length)
}

},{}],100:[function(require,module,exports){
module.exports = to

var base64 = require('base64-js')
  , toutf8 = require('to-utf8')

var encoders = {
    hex: to_hex
  , utf8: to_utf
  , base64: to_base64
}

function to(buf, encoding) {
  return encoders[encoding || 'utf8'](buf)
}

function to_hex(buf) {
  var str = ''
    , byt

  for(var i = 0, len = buf.length; i < len; ++i) {
    byt = buf[i]
    str += ((byt & 0xF0) >>> 4).toString(16)
    str += (byt & 0x0F).toString(16)
  }

  return str
}

function to_utf(buf) {
  return toutf8(buf)
}

function to_base64(buf) {
  return base64.fromByteArray(buf)
}


},{"base64-js":90,"to-utf8":91}],101:[function(require,module,exports){
module.exports = {
    writeUInt8:      write_uint8
  , writeInt8:       write_int8
  , writeUInt16LE:   write_uint16_le
  , writeUInt32LE:   write_uint32_le
  , writeInt16LE:    write_int16_le
  , writeInt32LE:    write_int32_le
  , writeFloatLE:    write_float_le
  , writeDoubleLE:   write_double_le
  , writeUInt16BE:   write_uint16_be
  , writeUInt32BE:   write_uint32_be
  , writeInt16BE:    write_int16_be
  , writeInt32BE:    write_int32_be
  , writeFloatBE:    write_float_be
  , writeDoubleBE:   write_double_be
}

var map = require('./mapped.js')

function write_uint8(target, value, at) {
  return target[at] = value
}

function write_int8(target, value, at) {
  return target[at] = value < 0 ? value + 0x100 : value
}

function write_uint16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, true)
}

function write_uint32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, true)
}

function write_int16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, true)
}

function write_int32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, true)
}

function write_float_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, true)
}

function write_double_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, true)
}

function write_uint16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, false)
}

function write_uint32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, false)
}

function write_int16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, false)
}

function write_int32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, false)
}

function write_float_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, false)
}

function write_double_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, false)
}

},{"./mapped.js":97}],102:[function(require,module,exports){

var EventEmitter = require('events').EventEmitter

exports = module.exports = function (wrapper) {

  if('function' == typeof wrapper)
    return wrapper
  
  return exports[wrapper] || exports.json
}

exports.json = function (stream, _JSON) {
  _JSON = _JSON || JSON

  var write = stream.write
  var soFar = ''

  function parse (line) {
    var js
    try {
      js = _JSON.parse(line)
      //ignore lines of whitespace...
    } catch (err) { 
      return stream.emit('error', err)
      //return console.error('invalid JSON', line)
    }
    if(js !== undefined)
      write.call(stream, js)
  }

  function onData (data) {
    var lines = (soFar + data).split('\n')
    soFar = lines.pop()
    while(lines.length) {
      parse(lines.shift())
    }
  }

  stream.write = onData
  
  var end = stream.end

  stream.end = function (data) {
    if(data)
      stream.write(data)
    //if there is any left over...
    if(soFar) {
      parse(soFar)
    }
    return end.call(stream)
  }

  stream.emit = function (event, data) {

    if(event == 'data') {
      data = _JSON.stringify(data) + '\n'
    }
    //since all stream events only use one argument, this is okay...
    EventEmitter.prototype.emit.call(stream, event, data)
  }

  return stream
}

exports.raw = function (stream) {
  return stream
}


},{"events":5}],103:[function(require,module,exports){
(function(process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = [], _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data == null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable && stream.autoDestroy)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}


})(require("__browserify_process"))
},{"__browserify_process":23,"stream":7}],104:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i],
            keys = Object.keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}
},{}],105:[function(require,module,exports){
(function(){var through = require('through')
var serialize = require('stream-serializer')()

function get(obj, path) {
  if(Array.isArray(path)) {
    for(var i in path)
      obj = obj[path[i]]
    return obj
  }
  return obj[path]
}

module.exports = function (obj, raw) {
  var cbs = {}, count = 1, local = obj || {}
  function flattenError(err) {
    if(!(err instanceof Error)) return err
    var err2 = { message: err.message }
    for(var k in err)
      err2[k] = err[k] 
    return err2
  }
  function expandError(err) {
    if (!err || !err.message) return err
    var err2 = new Error(err.message)
    for(var k in err)
      err2[k] = err[k]
    return err2
  }
  var s = through(function (data) {
    //write - on incoming call 
    data = data.slice()
    var i = data.pop(), args = data.pop(), name = data.pop()
    //if(~i) then there was no callback.    

    if (args[0]) args[0] = expandError(args[0])

    if(name != null) {
      var cb = function () {
        var args = [].slice.call(arguments)
        args[0] = flattenError(args[0])
        if(~i) s.emit('data', [args, i]) //responses don't have a name.
      }
      try {
        local[name].call(obj, args, cb)
      } catch (err) {
        if(~i) s.emit('data', [[flattenError(err)], i])
      }
    } else if(!cbs[i]) {
      //there is no callback with that id.
      //either one end mixed up the id or
      //it was called twice.
      //log this error, but don't throw.
      //this process shouldn't crash because another did wrong

      return console.error('ERROR: unknown callback id: '+i, data)
    } else {
      //call the callback.
      var cb = cbs[i]
      delete cbs[i] //delete cb before calling it, incase cb throws.
      cb.apply(null, args)
    }
  })

  var rpc = s.rpc = function (name, args, cb) {
    if(cb) cbs[++count] = cb
    if('string' !== typeof name)
      throw new Error('name *must* be string')
    s.emit('data', [name, args, cb ? count : -1])
    if(cb && count == 9007199254740992) count = 0 //reset if max
    //that is 900 million million.
    //if you reach that, dm me,
    //i'll buy you a beer. @dominictarr
  }

  function keys (obj) {
    var keys = []
    for(var k in obj) keys.push(k)
    return keys
  }

  s.createRemoteCall = function (name) {
    return function () {
      var args = [].slice.call(arguments)
      var cb = ('function' == typeof args[args.length - 1])
               ? args.pop()
               : null
      rpc(name, args, cb)
    }
  }

  s.createLocalCall = function (name, fn) {
     local[name] = fn
  }

  s.wrap = function (remote, _path) {
    _path = _path || []
    var w = {}
    ;(Array.isArray(remote)     ? remote
    : 'string' == typeof remote ? [remote]
    : remote = keys(remote)
    ).forEach(function (k) {
      w[k] = s.createRemoteCall(k)
    })
    return w
  }
  if(raw)
    return s

  return serialize(s)
}

})()
},{"stream-serializer":106,"through":107}],106:[function(require,module,exports){

var EventEmitter = require('events').EventEmitter

exports = module.exports = function (wrapper) {

  if('function' == typeof wrapper)
    return wrapper
  
  return exports[wrapper] || exports.json
}

exports.json = function (stream) {

  var write = stream.write
  var soFar = ''

  function parse (line) {
    var js
    try {
      js = JSON.parse(line)
      //ignore lines of whitespace...
    } catch (err) { 
      return stream.emit('error', err)
      //return console.error('invalid JSON', line)
    }
    if(js !== undefined)
      write.call(stream, js)
  }

  function onData (data) {
    var lines = (soFar + data).split('\n')
    soFar = lines.pop()
    while(lines.length) {
      parse(lines.shift())
    }
  }

  stream.write = onData
  
  var end = stream.end

  stream.end = function (data) {
    if(data)
      stream.write(data)
    //if there is any left over...
    if(soFar) {
      parse(soFar)
    }
    return end.call(stream)
  }

  stream.emit = function (event, data) {

    if(event == 'data') {
      data = JSON.stringify(data) + '\n'
    }
    //since all stream events only use one argument, this is okay...
    EventEmitter.prototype.emit.call(stream, event, data)
  }

  return stream
//  return es.pipeline(es.split(), es.parse(), stream, es.stringify())
}

exports.raw = function (stream) {
  return stream
}


},{"events":5}],107:[function(require,module,exports){
(function(process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = [], _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data == null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable && stream.autoDestroy)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}


})(require("__browserify_process"))
},{"__browserify_process":23,"stream":7}],108:[function(require,module,exports){
var duplexer = require('duplexer')

module.exports = function () {

  var streams = [].slice.call(arguments)
    , first = streams[0]
    , last = streams[streams.length - 1]
    , thepipe = duplexer(first, last)

  if(streams.length == 1)
    return streams[0]
  else if (!streams.length)
    throw new Error('connect called with empty args')

  //pipe all the streams together

  function recurse (streams) {
    if(streams.length < 2)
      return
    streams[0].pipe(streams[1])
    recurse(streams.slice(1))  
  }
  
  recurse(streams)
 
  function onerror () {
    var args = [].slice.call(arguments)
    args.unshift('error')
    thepipe.emit.apply(thepipe, args)
  }
  
  //es.duplex already reemits the error from the first and last stream.
  //add a listener for the inner streams in the pipeline.
  for(var i = 1; i < streams.length - 1; i ++)
    streams[i].on('error', onerror)

  return thepipe
}


},{"duplexer":82}],109:[function(require,module,exports){
(function(process){var duplex = require('duplexer');
var through = require('through');

var nextTick = typeof setImmediate !== 'undefined'
  ? setImmediate
  : process.nextTick;

module.exports = tmp;

function tmp () {
  var replaced = false;
  var buf = [];
  var realStream;

  var input = through(function (chunk) {
    if (!replaced) {
      buf.push(chunk);
      return false;
    } else {
      return realStream.write(chunk);
    }
  });

  var output = through();

  var dpl = duplex(input, output);

  dpl.replace = function (stream) {
    realStream = stream;
    replaced = true;
    
    dpl.readable = realStream.readable;
    dpl.writable = realStream.writable;

    if (realStream.readable) realStream.pipe(output);
    if (realStream.writable) input.pipe(realStream);

    stream.on('error', function (err) {
      dpl.emit('error', err);
    });
    stream.once('close', function () {
      dpl.emit('close');
    });

    nextTick(function () {
      for (var i = 0; i < buf.length; i++) realStream.write(buf[i]);
      buf = null;
    });
  }

  return dpl;
}

})(require("__browserify_process"))
},{"__browserify_process":23,"duplexer":110,"through":111}],110:[function(require,module,exports){
var Stream = require("stream")
var writeMethods = ["write", "end", "destroy"]
var readMethods = ["resume", "pause"]
var readEvents = ["data", "close"]
var slice = Array.prototype.slice

module.exports = duplex

function forEach (arr, fn) {
    if (arr.forEach) {
        return arr.forEach(fn)
    }

    for (var i = 0; i < arr.length; i++) {
        fn(arr[i], i)
    }
}

function duplex(writer, reader) {
    var stream = new Stream()
    var ended = false

    forEach(writeMethods, proxyWriter)

    forEach(readMethods, proxyReader)

    forEach(readEvents, proxyStream)

    reader.on("end", handleEnd)

    writer.on("drain", function() {
      stream.emit("drain")
    })

    writer.on("error", reemit)
    reader.on("error", reemit)

    stream.writable = writer.writable
    stream.readable = reader.readable

    return stream

    function proxyWriter(methodName) {
        stream[methodName] = method

        function method() {
            return writer[methodName].apply(writer, arguments)
        }
    }

    function proxyReader(methodName) {
        stream[methodName] = method

        function method() {
            stream.emit(methodName)
            var func = reader[methodName]
            if (func) {
                return func.apply(reader, arguments)
            }
            reader.emit(methodName)
        }
    }

    function proxyStream(methodName) {
        reader.on(methodName, reemit)

        function reemit() {
            var args = slice.call(arguments)
            args.unshift(methodName)
            stream.emit.apply(stream, args)
        }
    }

    function handleEnd() {
        if (ended) {
            return
        }
        ended = true
        var args = slice.call(arguments)
        args.unshift("end")
        stream.emit.apply(stream, args)
    }

    function reemit(err) {
        stream.emit("error", err)
    }
}

},{"stream":7}],111:[function(require,module,exports){
(function(process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = [], _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data == null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable && stream.autoDestroy)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}


})(require("__browserify_process"))
},{"__browserify_process":23,"stream":7}],112:[function(require,module,exports){
var http = require('http');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var qs = require('querystring');
var navId = require('./vendor/persona.js');

module.exports = function (opts) { return new Persona(opts) };

function Persona (opts) {
    var self = this;
    
    if (!opts) opts = { route: '/_persona' };
    if (typeof opts === 'string') opts = { route: opts };
    
    self.routes = {};
    if (typeof opts.route === 'string') {
        self.routes.login = opts.route + '/login';
        self.routes.logout = opts.route + '/logout';
    }
    if (opts.login) self.routes.login = opts.login;
    if (opts.logout) self.routes.logout = opts.logout;
}
inherits(Persona, EventEmitter);

Persona.prototype.set = function (id) {
    this.id = id;
    if (id) this.emit('login', id)
    else this.emit('logout')
};

Persona.prototype.identify = function () {
    this._watch(null);
    navId.request();
};

Persona.prototype.unidentify = function () {
    navId.logout();
    this._logout();
};

Persona.prototype._watch = function (user) {
    var self = this;
    navId.watch({
        loggedInUser: user,
        onlogin: function (assertion) { self._login(assertion) },
        onlogout: function () { self._logout() }
    });
};

Persona.prototype._login = function (assertion) {
    var self = this;
    var uri = self.routes.login;
    
    var u = typeof uri === 'object' ? uri : url.parse(uri);
    var req = http.request({
        method: 'POST',
        host: u.hostname || window.location.hostname,
        port: u.port || window.location.port,
        path: u.path
    });
    req.on('response', function (res) {
        var body = '';
        res.on('data', function (buf) { body += buf });
        
        if (!/^2\d\d\b/.test(res.statusCode)) {
            self.id = null;
            res.on('end', function () {
                self.emit('error', new Error(
                    'error code ' + res.statusCode + ': ' + body
                ));
            });
            navId.logout();
        }
        else {
            res.on('end', function () {
                try { var m = JSON.parse(body) }
                catch (err) { return self.emit('error', err) }
                if (!m || typeof m !== 'object') {
                    return self.emit('error',
                        'unexpected response ' + typeof m
                    );
                }
                
                if (m && m.cookie) {
                    for (var key in m.cookie) {
                        document.cookie = key + '=' + m.cookie[key];
                    }
                }
                if (m && m.id) {
                    self.id = m.id;
                    self.emit('login', m.id);
                }
            });
        }
    });
    req.end(JSON.stringify({ assertion: assertion }));
};

Persona.prototype._logout = function () {
    var self = this;
    var uri = self.routes.logout;
    self.id = null;
    
    var u = typeof uri === 'object' ? uri : url.parse(uri);
    var req = http.request({
        method: 'POST',
        host: u.hostname || window.location.hostname,
        port: u.port || window.location.port,
        path: u.path
    });
    req.on('response', function (res) {
        if (!/^2\d\d\b/.test(res.statusCode)) {
            var body = '';
            res.on('data', function (buf) { body += buf });
            res.on('end', function () {
                self.emit('error', new Error(
                    'error code ' + res.statusCode + ': ' + body
                ));
            });
        }
        else self.emit('logout');
    });
    req.end();
};

},{"./vendor/persona.js":114,"events":5,"http":17,"inherits":113,"querystring":6,"url":8}],113:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],114:[function(require,module,exports){
var navigator = { userAgent: window.navigator.userAgent };
if (window.navigator.id) navigator.id = window.navigator.id;

/**
 * Uncompressed source can be found at https://login.persona.org/include.orig.js
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function(){var a=function(){function e(a){return Array.isArray?Array.isArray(a):a.constructor.toString().indexOf("Array")!=-1}function d(a,c,d){var e=b[c][d];for(var f=0;f<e.length;f++)e[f].win===a&&e.splice(f,1);b[c][d].length===0&&delete b[c][d]}function c(a,c,d,e){function f(b){for(var c=0;c<b.length;c++)if(b[c].win===a)return!0;return!1}var g=!1;if(c==="*")for(var h in b){if(!b.hasOwnProperty(h))continue;if(h==="*")continue;if(typeof b[h][d]=="object"){g=f(b[h][d]);if(g)break}}else b["*"]&&b["*"][d]&&(g=f(b["*"][d])),!g&&b[c]&&b[c][d]&&(g=f(b[c][d]));if(g)throw"A channel is already bound to the same window which overlaps with origin '"+c+"' and has scope '"+d+"'";typeof b[c]!="object"&&(b[c]={}),typeof b[c][d]!="object"&&(b[c][d]=[]),b[c][d].push({win:a,handler:e})}"use strict";var a=Math.floor(Math.random()*1000001),b={},f={},g=function(a){try{var c=JSON.parse(a.data);if(typeof c!="object"||c===null)throw"malformed"}catch(a){return}var d=a.source,e=a.origin,g,h,i;if(typeof c.method=="string"){var j=c.method.split("::");j.length==2?(g=j[0],i=j[1]):i=c.method}typeof c.id!="undefined"&&(h=c.id);if(typeof i=="string"){var k=!1;if(b[e]&&b[e][g])for(var l=0;l<b[e][g].length;l++)if(b[e][g][l].win===d){b[e][g][l].handler(e,i,c),k=!0;break}if(!k&&b["*"]&&b["*"][g])for(var l=0;l<b["*"][g].length;l++)if(b["*"][g][l].win===d){b["*"][g][l].handler(e,i,c);break}}else typeof h!="undefined"&&f[h]&&f[h](e,i,c)};window.addEventListener?window.addEventListener("message",g,!1):window.attachEvent&&window.attachEvent("onmessage",g);return{build:function(b){var g=function(a){if(b.debugOutput&&window.console&&window.console.log){try{typeof a!="string"&&(a=JSON.stringify(a))}catch(c){}console.log("["+j+"] "+a)}};if(!window.postMessage)throw"jschannel cannot run this browser, no postMessage";if(!window.JSON||!window.JSON.stringify||!window.JSON.parse)throw"jschannel cannot run this browser, no JSON parsing/serialization";if(typeof b!="object")throw"Channel build invoked without a proper object argument";if(!b.window||!b.window.postMessage)throw"Channel.build() called without a valid window argument";if(window===b.window)throw"target window is same as present window -- not allowed";var h=!1;if(typeof b.origin=="string"){var i;b.origin==="*"?h=!0:null!==(i=b.origin.match(/^https?:\/\/(?:[-a-zA-Z0-9_\.])+(?::\d+)?/))&&(b.origin=i[0].toLowerCase(),h=!0)}if(!h)throw"Channel.build() called with an invalid origin";if(typeof b.scope!="undefined"){if(typeof b.scope!="string")throw"scope, when specified, must be a string";if(b.scope.split("::").length>1)throw"scope may not contain double colons: '::'"}var j=function(){var a="",b="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";for(var c=0;c<5;c++)a+=b.charAt(Math.floor(Math.random()*b.length));return a}(),k={},l={},m={},n=!1,o=[],p=function(a,b,c){var d=!1,e=!1;return{origin:b,invoke:function(b,d){if(!m[a])throw"attempting to invoke a callback of a nonexistent transaction: "+a;var e=!1;for(var f=0;f<c.length;f++)if(b===c[f]){e=!0;break}if(!e)throw"request supports no such callback '"+b+"'";t({id:a,callback:b,params:d})},error:function(b,c){e=!0;if(!m[a])throw"error called for nonexistent message: "+a;delete m[a],t({id:a,error:b,message:c})},complete:function(b){e=!0;if(!m[a])throw"complete called for nonexistent message: "+a;delete m[a],t({id:a,result:b})},delayReturn:function(a){typeof a=="boolean"&&(d=a===!0);return d},completed:function(){return e}}},q=function(a,b,c){return window.setTimeout(function(){if(l[a]){var d="timeout ("+b+"ms) exceeded on method '"+c+"'";(1,l[a].error)("timeout_error",d),delete l[a],delete f[a]}},b)},r=function(a,c,d){if(typeof b.gotMessageObserver=="function")try{b.gotMessageObserver(a,d)}catch(h){g("gotMessageObserver() raised an exception: "+h.toString())}if(d.id&&c){if(k[c]){var i=p(d.id,a,d.callbacks?d.callbacks:[]);m[d.id]={};try{if(d.callbacks&&e(d.callbacks)&&d.callbacks.length>0)for(var j=0;j<d.callbacks.length;j++){var n=d.callbacks[j],o=d.params,q=n.split("/");for(var r=0;r<q.length-1;r++){var s=q[r];typeof o[s]!="object"&&(o[s]={}),o=o[s]}o[q[q.length-1]]=function(){var a=n;return function(b){return i.invoke(a,b)}}()}var t=k[c](i,d.params);!i.delayReturn()&&!i.completed()&&i.complete(t)}catch(h){var u="runtime_error",v=null;typeof h=="string"?v=h:typeof h=="object"&&(h&&e(h)&&h.length==2?(u=h[0],v=h[1]):typeof h.error=="string"&&(u=h.error,h.message?typeof h.message=="string"?v=h.message:h=h.message:v=""));if(v===null)try{v=JSON.stringify(h),typeof v=="undefined"&&(v=h.toString())}catch(w){v=h.toString()}i.error(u,v)}}}else d.id&&d.callback?!l[d.id]||!l[d.id].callbacks||!l[d.id].callbacks[d.callback]?g("ignoring invalid callback, id:"+d.id+" ("+d.callback+")"):l[d.id].callbacks[d.callback](d.params):d.id?l[d.id]?(d.error?(1,l[d.id].error)(d.error,d.message):d.result!==undefined?(1,l[d.id].success)(d.result):(1,l[d.id].success)(),delete l[d.id],delete f[d.id]):g("ignoring invalid response: "+d.id):c&&k[c]&&k[c]({origin:a},d.params)};c(b.window,b.origin,typeof b.scope=="string"?b.scope:"",r);var s=function(a){typeof b.scope=="string"&&b.scope.length&&(a=[b.scope,a].join("::"));return a},t=function(a,c){if(!a)throw"postMessage called with null message";var d=n?"post  ":"queue ";g(d+" message: "+JSON.stringify(a));if(!c&&!n)o.push(a);else{if(typeof b.postMessageObserver=="function")try{b.postMessageObserver(b.origin,a)}catch(e){g("postMessageObserver() raised an exception: "+e.toString())}b.window.postMessage(JSON.stringify(a),b.origin)}},u=function(a,c){g("ready msg received");if(n)throw"received ready message while in ready state.  help!";c==="ping"?j+="-R":j+="-L",v.unbind("__ready"),n=!0,g("ready msg accepted."),c==="ping"&&v.notify({method:"__ready",params:"pong"});while(o.length)t(o.pop());typeof b.onReady=="function"&&b.onReady(v)},v={unbind:function(a){if(k[a]){if(delete k[a])return!0;throw"can't delete method: "+a}return!1},bind:function(a,b){if(!a||typeof a!="string")throw"'method' argument to bind must be string";if(!b||typeof b!="function")throw"callback missing from bind params";if(k[a])throw"method '"+a+"' is already bound!";k[a]=b;return this},call:function(b){if(!b)throw"missing arguments to call function";if(!b.method||typeof b.method!="string")throw"'method' argument to call must be string";if(!b.success||typeof b.success!="function")throw"'success' callback missing from call";var c={},d=[],e=function(a,b){if(typeof b=="object")for(var f in b){if(!b.hasOwnProperty(f))continue;var g=a+(a.length?"/":"")+f;typeof b[f]=="function"?(c[g]=b[f],d.push(g),delete b[f]):typeof b[f]=="object"&&e(g,b[f])}};e("",b.params);var g={id:a,method:s(b.method),params:b.params};d.length&&(g.callbacks=d),b.timeout&&q(a,b.timeout,s(b.method)),l[a]={callbacks:c,error:b.error,success:b.success},f[a]=r,a++,t(g)},notify:function(a){if(!a)throw"missing arguments to notify function";if(!a.method||typeof a.method!="string")throw"'method' argument to notify must be string";t({method:s(a.method),params:a.params})},destroy:function(){d(b.window,b.origin,typeof b.scope=="string"?b.scope:""),window.removeEventListener?window.removeEventListener("message",r,!1):window.detachEvent&&window.detachEvent("onmessage",r),n=!1,k={},m={},l={},b.origin=null,o=[],g("channel destroyed"),j=""}};v.bind("__ready",u),setTimeout(function(){},0);return v}}}();WinChan=function(){function i(){var b=window.location,c=window.opener.frames,d=b.protocol+"//"+b.host;for(var e=c.length-1;e>=0;e--)try{if(c[e].location.href.indexOf(d)===0&&c[e].name===a)return c[e]}catch(f){}return}function h(a){/^https?:\/\//.test(a)||(a=window.location.href);var b=/^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(a);return b?b[1]:a}function g(){return window.JSON&&window.JSON.stringify&&window.JSON.parse&&window.postMessage}function f(){try{var a=navigator.userAgent;return a.indexOf("Fennec/")!=-1||a.indexOf("Firefox/")!=-1&&a.indexOf("Android")!=-1}catch(b){}return!1}function e(){var a=-1;if(navigator.appName==="Microsoft Internet Explorer"){var b=navigator.userAgent,c=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");c.exec(b)!=null&&(a=parseFloat(RegExp.$1))}return a>=8}function d(a,b,c){a.detachEvent?a.detachEvent("on"+b,c):a.removeEventListener&&a.removeEventListener(b,c,!1)}function c(a,b,c){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener&&a.addEventListener(b,c,!1)}var a="__winchan_relay_frame",b="die",j=e();return g()?{open:function(e,g){function q(a){try{var b=JSON.parse(a.data);b.a==="ready"?m.postMessage(o,l):b.a==="error"?g&&(g(b.d),g=null):b.a==="response"&&(d(window,"message",q),d(window,"unload",p),p(),g&&(g(null,b.d),g=null))}catch(c){}}function p(){k&&document.body.removeChild(k),k=undefined;if(n)try{n.close()}catch(a){m.postMessage(b,l)}n=m=undefined}if(!g)throw"missing required callback argument";var i;e.url||(i="missing required 'url' parameter"),e.relay_url||(i="missing required 'relay_url' parameter"),i&&setTimeout(function(){g(i)},0),e.window_name||(e.window_name=null);if(!e.window_features||f())e.window_features=undefined;var k,l=h(e.url);if(l!==h(e.relay_url))return setTimeout(function(){g("invalid arguments: origin of url and relay_url must match")},0);var m;j&&(k=document.createElement("iframe"),k.setAttribute("src",e.relay_url),k.style.display="none",k.setAttribute("name",a),document.body.appendChild(k),m=k.contentWindow);var n=window.open(e.url,e.window_name,e.window_features);m||(m=n);var o=JSON.stringify({a:"request",d:e.params});c(window,"unload",p),c(window,"message",q);return{close:p,focus:function(){if(n)try{n.focus()}catch(a){}}}}}:{open:function(a,b,c,d){setTimeout(function(){d("unsupported browser")},0)}}}();var b=function(){function l(){return c}function k(){c=g()||h()||i()||j();return!c}function j(){if(!(window.JSON&&window.JSON.stringify&&window.JSON.parse))return"JSON_NOT_SUPPORTED"}function i(){if(!a.postMessage)return"POSTMESSAGE_NOT_SUPPORTED"}function h(){try{var b="localStorage"in a&&a.localStorage!==null;if(b)a.localStorage.setItem("test","true"),a.localStorage.removeItem("test");else return"LOCALSTORAGE_NOT_SUPPORTED"}catch(c){return"LOCALSTORAGE_DISABLED"}}function g(){return f()}function f(){var a=e(),b=a>-1&&a<8;if(b)return"BAD_IE_VERSION"}function e(){var a=-1;if(b.appName=="Microsoft Internet Explorer"){var c=b.userAgent,d=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");d.exec(c)!=null&&(a=parseFloat(RegExp.$1))}return a}function d(c,d){b=c,a=d}var a=window,b=navigator,c;return{setTestEnv:d,isSupported:k,getNoSupportReason:l}}();navigator.id||(navigator.id={},navigator.mozId?navigator.id=navigator.mozId:navigator.id={});if(!navigator.id.request||navigator.id._shimmed){var c="https://login.persona.org",d=navigator.userAgent,e=d.indexOf("Fennec/")!=-1||d.indexOf("Firefox/")!=-1&&d.indexOf("Android")!=-1,f=e?undefined:"menubar=0,location=1,resizable=1,scrollbars=1,status=0,width=700,height=375",g,h={login:null,logout:null,match:null,ready:null},i,j=undefined;function k(a){a!==!0;if(j===undefined)j=a;else if(j!=a)throw new Error("you cannot combine the navigator.id.watch() API with navigator.id.getVerifiedEmail() or navigator.id.get()this site should instead use navigator.id.request() and navigator.id.watch()")}var l,m=!1,n=b.isSupported();function o(a){document.addEventListener?document.addEventListener("DOMContentLoaded",function b(){document.removeEventListener("DOMContentLoaded",b),a()},!1):document.attachEvent&&document.readyState&&document.attachEvent("onreadystatechange",function c(){var b=document.readyState;if(b==="loaded"||b==="complete"||b==="interactive")document.detachEvent("onreadystatechange",c),a()})}function p(){if(!!n){var b=window.document;if(!b.body){m||(o(p),m=!0);return}try{if(!l){var d=b.createElement("iframe");d.style.display="none",b.body.appendChild(d),d.src=c+"/communication_iframe",l=a.build({window:d.contentWindow,origin:c,scope:"mozid_ni",onReady:function(){l.call({method:"loaded",success:function(){h.ready&&h.ready()},error:function(){}})}}),l.bind("logout",function(a,b){h.logout&&h.logout()}),l.bind("login",function(a,b){h.login&&h.login(b)}),l.bind("match",function(a,b){h.match&&h.match()}),q(i)&&l.notify({method:"loggedInUser",params:i})}}catch(e){l=undefined}}}function q(a){return typeof a!="undefined"}function r(a){try{console.warn(a)}catch(b){}}function s(a,b){if(q(a[b])){r(b+" has been deprecated");return!0}}function t(a,b,c){if(q(a[b])&&q(a[c]))throw new Error("you cannot supply *both* "+b+" and "+c);s(a,b)&&(a[c]=a[b],delete a[b])}function u(a){if(typeof a=="object"){if(a.onlogin&&typeof a.onlogin!="function"||a.onlogout&&typeof a.onlogout!="function"||a.onmatch&&typeof a.onmatch!="function"||a.onready&&typeof a.onready!="function")throw new Error("non-function where function expected in parameters to navigator.id.watch()");if(!a.onlogin)throw new Error("'onlogin' is a required argument to navigator.id.watch()");if(!a.onlogout)throw new Error("'onlogout' is a required argument to navigator.id.watch()");h.login=a.onlogin||null,h.logout=a.onlogout||null,h.match=a.onmatch||null,h.ready=a.onready||null,t(a,"loggedInEmail","loggedInUser"),i=a.loggedInUser,p()}}var v;function w(){var a=v;a==="request"&&(h.ready?a="watch_with_onready":a="watch_without_onready");return a}function x(a){s(a,"requiredEmail"),t(a,"tosURL","termsOfService"),t(a,"privacyURL","privacyPolicy"),a.termsOfService&&!a.privacyPolicy&&r("termsOfService ignored unless privacyPolicy also defined"),a.privacyPolicy&&!a.termsOfService&&r("privacyPolicy ignored unless termsOfService also defined"),a.rp_api=w(),v=null,a.start_time=(new Date).getTime();if(g)try{g.focus()}catch(d){}else{if(!b.isSupported()){var e=b.getNoSupportReason(),i="unsupported_dialog";e==="LOCALSTORAGE_DISABLED"&&(i="cookies_disabled"),g=window.open(c+"/"+i,null,f);return}l&&l.notify({method:"dialog_running"}),g=WinChan.open({url:c+"/sign_in",relay_url:c+"/relay",window_features:f,window_name:"__persona_dialog",params:{method:"get",params:a}},function(b,c){l&&(!b&&c&&c.email&&l.notify({method:"loggedInUser",params:c.email}),l.notify({method:"dialog_complete"})),g=undefined;if(!b&&c&&c.assertion)try{h.login&&h.login(c.assertion)}catch(d){}if(b==="client closed window"||!c)a&&a.oncancel&&a.oncancel(),delete a.oncancel})}}navigator.id={request:function(a){if(this!=navigator.id)throw new Error("all navigator.id calls must be made on the navigator.id object");if(!h.login)throw new Error("navigator.id.watch must be called before navigator.id.request");a=a||{},k(!1),v="request",a.returnTo||(a.returnTo=document.location.pathname);return x(a)},watch:function(a){if(this!=navigator.id)throw new Error("all navigator.id calls must be made on the navigator.id object");k(!1),u(a)},logout:function(a){if(this!=navigator.id)throw new Error("all navigator.id calls must be made on the navigator.id object");p(),l&&l.notify({method:"logout"}),typeof a=="function"&&(r("navigator.id.logout callback argument has been deprecated."),setTimeout(a,0))},get:function(a,b){var c={};b=b||{},c.privacyPolicy=b.privacyPolicy||undefined,c.termsOfService=b.termsOfService||undefined,c.privacyURL=b.privacyURL||undefined,c.tosURL=b.tosURL||undefined,c.siteName=b.siteName||undefined,c.siteLogo=b.siteLogo||undefined,v=v||"get";s(b,"silent")?a&&setTimeout(function(){a(null)},0):(k(!0),u({onlogin:function(b){a&&(a(b),a=null)},onlogout:function(){}}),c.oncancel=function(){a&&(a(null),a=null),h.login=h.logout=h.match=h.ready=null},x(c))},getVerifiedEmail:function(a){r("navigator.id.getVerifiedEmail has been deprecated"),k(!0),v="getVerifiedEmail",navigator.id.get(a)},_shimmed:!0}}})()
module.exports = navigator.id;

},{}],115:[function(require,module,exports){
var stream = require('stream')
var util = require('util')
var isBuffer = require('isbuffer')

function WebsocketStream(server, options) {
  if (!(this instanceof WebsocketStream)) return new WebsocketStream(server, options)
  stream.Stream.call(this)
  this.options = options || {}
  this.readable = true
  this.writable = true
  this._buffer = []
 
  if (typeof server === "object") {
    this.ws = server
    this.ws.on('message', this.onMessage.bind(this))
    this.ws.on('error', this.onError.bind(this))
    this.ws.on('close', this.onClose.bind(this))
    this.ws.on('open', this.onOpen.bind(this))
    if (this.ws.readyState === 1) this._open = true
  } else {
    this.ws = new WebSocket(server, this.options.protocol)
    this.ws.binaryType = this.options.binaryType || 'arraybuffer'
    this.ws.onmessage = this.onMessage.bind(this)
    this.ws.onerror = this.onError.bind(this)
    this.ws.onclose = this.onClose.bind(this)
    this.ws.onopen = this.onOpen.bind(this)
  }
}

util.inherits(WebsocketStream, stream.Stream)

module.exports = WebsocketStream
module.exports.WebsocketStream = WebsocketStream

WebsocketStream.prototype.onMessage = function(e, flags) {
  if (e.data) return this.emit('data', e.data, flags)
  this.emit('data', e, flags)
}

WebsocketStream.prototype.onError = function(err) {
  this.emit('error', err)
}

WebsocketStream.prototype.onClose = function(err) {
  if (this._destroy) return
  this.emit('end')
}

WebsocketStream.prototype.onOpen = function(err) {
  if (this._destroy) return
  this._open = true
  for (var i = 0; i < this._buffer.length; i++) {
    this._write(this._buffer[i])
  }
  this._buffer = undefined
  this.emit('open')
  this.emit('connect')
  if (this._end) this.ws.close()
}

WebsocketStream.prototype.write = function(data) {
  if (!this._open) {
    this._buffer.push(data)
  } else {
    this._write(data)
  }
}

WebsocketStream.prototype._write = function(data) {
  typeof WebSocket != 'undefined' && this.ws instanceof WebSocket
    ? this.ws.send(data)
    : this.ws.send(data, { binary : isBuffer(data) })
}

WebsocketStream.prototype.end = function(data) {
  if (data !== undefined) this.write(data)
  if (this._open) this.ws.close()
  this._end = true
}

WebsocketStream.prototype.destroy = function() {
  this._destroy = true
  this.ws.close()
}

},{"isbuffer":116,"stream":7,"util":9}],116:[function(require,module,exports){
(function(){var Buffer = require('buffer').Buffer;

module.exports = isBuffer;

function isBuffer (o) {
  return Buffer.isBuffer(o)
    || /\[object (.+Array|Array.+)\]/.test(Object.prototype.toString.call(o));
}

})()
},{"buffer":11}]},{},[3])
;