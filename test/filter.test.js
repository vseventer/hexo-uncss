/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mark van Seventer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
**/

// Strict mode.
'use strict';

// Standard lib.
var fs   = require('fs'),
    path = require('path');

// Local modules.
var subject = require('../lib/filter.js');

// Configure.
var fixture = path.join(__dirname, 'fixture.html');

// Stub hexo.route.
var hexoRoute = {
  get: function(name) {
    return fs.createReadStream(name, { encoding: 'utf8' });
  },
  list: function() {
    return [ fixture ];
  }
};

// Test suite.
describe('hexo-uncss', function() {
  // Tests.
  it('should remove unused styles from CSS.', function() {
    // Configure.
    var data = 'div { color: black; } span { color: white; }';
    var hexo = {
      config: {
        uncss: { }
      },
      route: hexoRoute
    };

    // Filter and test.
    var promise = subject.call(hexo, data, { path: 'test.css' });
    return promise.then(function(result) {
      result = result.replace(/\s/g, ''); // Perform a whitespace  ..
      var expected = 'div{color:black;}'; // insensitive comparison.
      console.assert(result === expected);
    });
  });

  it('should support uncss options.', function() {
    // Configure.
    var data = 'div { color: black; } span { color: white; }';
    var hexo = {
      config: {
        uncss: { ignore: [ 'span' ] }
      },
      route: hexoRoute
    };

    // Filter and test.
    var promise = subject.call(hexo, data, { path: 'test.css' });
    return promise.then(function(result) {
      result = result.replace(/\s/g, ''); // Perform a whitespace  ..
      var expected = data.replace(/\s/g, ''); // insensitive comparison.
      console.assert(result === expected);
    });
  });

  it('should do nothing if there are no HTML files.', function() {
    // Configure.
    var data = 'div { color: black }; span { color: white }';
    var hexo = {
      config: {
        uncss: { }
      },
      route: {
        list: function() {
          return [ ];
        }
      }
    };

    // Filter and test.
    var result = subject.call(hexo, data, { path: 'test.css' });
    console.assert(result === data);
  });

  it('should do nothing if disabled.', function() {
    // Configure.
    var data = 'div { color: black }; span { color: white }';
    var hexo = {
      config: {
        uncss: { enable: false }
      },
      route: hexoRoute
    };

    // Filter and test.
    var result = subject.call(hexo, data, { path: 'test.css' });
    console.assert(result === data);
  });
});