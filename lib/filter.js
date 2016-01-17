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

// Package modules.
var assign    = require('object-assign'),
    debug     = require('debug')('hexo:uncss'),
    minimatch = require('minimatch'),
    Promise   = require('bluebird'),
    streamToArray = require('stream-to-array'),
    uncss     = require('uncss');

// Promisify.
var streamToArrayAsync = Promise.promisify(streamToArray);

// Exports.
module.exports = function(str, locals) {
  // Init.
  var hexo   = this,
      config = hexo.config.uncss,
      route  = hexo.route;

  // Return original if disabled.
  if(false === config.enable) {
    debug('filter disabled'); // Debug.
    return str;
  }
  debug('removing unused styles from %s', locals.path); // Debug.

  // Retrieve generated HTML files.
  var routes = route.list().filter(function(path) {
    return minimatch(path, '**/*.html');
  });

  // Return original if no HTML files were found.
  if(0 === routes.length) {
    return str;
  }

  // Retrieve raw HTML from HTML files.
  var promise = Promise.map(routes, function(path) {
    var stream = route.get(path);
    return streamToArrayAsync(stream).then(function (parts) {
      var buffers = [];
      for (var i = 0; i < parts.length; i += 1) {
        var part = parts[i];
        buffers.push((part instanceof Buffer) ? part : new Buffer(part));
      }
      return Buffer.concat(buffers).toString();
    });
  });

  // UnCSS the raw HTML with the CSS provided.
  return promise.then(function(rawHtml) {
    // Process raw css. Ignore any external stylesheets.
    var options = assign({ }, config, {
      ignoreSheets : [ '_' ], // Hack to ignore any ..
      stylesheets  : [ '_' ], // .. external stylesheets.
      raw: str
    });

    // Return the result.
    return Promise.fromNode(function(callback) {
      uncss(rawHtml, options, function(err, result) {
        debug('updating %s', locals.path); // Debug.
        callback(err, result); // Invoke with exactly two arguments.
      });
    });
  });
};
