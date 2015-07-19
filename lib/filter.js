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
    minimatch = require('minimatch'),
    Promise   = require('bluebird'),
    streamToBuffer = require('stream-to-buffer'),
    uncss     = require('uncss');

// Promisify.
var streamToBufferAsync = Promise.promisify(streamToBuffer);

// Exports.
module.exports = function(str, locals) {
  // Init.
  var hexo   = this,
      config = hexo.config.uncss;

  // Return original if disabled.
  if(false === config.enable) {
    return str;
  }

  // Retrieve raw HTML of all generated HTML files.
  var routes = hexo.route.list().filter(function(route) {
    return minimatch(route, '**/*.html');
  });
  var promise = Promise.map(routes, function(route) {
    var stream = hexo.route.get(route);
    return streamToBufferAsync(stream);
  });

  // UnCSS the raw HTML with the CSS provided.
  return promise.then(function(rawHtml) {
    // Init.
    var options = assign({ }, config, { raw: str });

    // Return the result.
    return Promise.fromNode(function(callback) {
      uncss(rawHtml, options, function(err, result, _) {
        callback(err, result);
      });
    });
  });
};