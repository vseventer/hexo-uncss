/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Mark van Seventer
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
const debug = require('debug')('hexo:uncss');

const { minimatch } = require('minimatch');

const Promise = require('bluebird');

const streamToArray = require('stream-to-array');

const uncss = require('uncss');

// Promisify.
const streamToArrayAsync = Promise.promisify(streamToArray);

// Exports.
module.exports = function(str, locals) {
  // Init.
  const hexo = this;

  const config = hexo.config.uncss;

  const route = hexo.route;

  // Return original if disabled.
  if (config.enable === false) {
    debug('filter disabled'); // Debug.
    return str;
  }
  debug('removing unused styles from %s', locals.path); // Debug.

  // Retrieve generated HTML files.
  const routes = route.list().filter(path => {
    return minimatch(path, '**/*.html');
  });

  // Return original if no HTML files were found.
  if (routes.length === 0) {
    return str;
  }

  // Retrieve raw HTML from HTML files.
  const promise = Promise.map(routes, path => {
    const stream = route.get(path);
    return streamToArrayAsync(stream).then(arr => {
      const buffers = arr.map(el => {
        return el instanceof Buffer ? el : Buffer.from(el);
      });
      return Buffer.concat(buffers).toString();
    });
  });

  // UnCSS the raw HTML with the CSS provided.
  return promise.then(rawHtml => {
    // Process raw css. Ignore any external stylesheets.
    const options = Object.assign({ }, config, {
      ignoreSheets: ['_'], // Hack to ignore any ..
      stylesheets: ['_'], // .. external stylesheets.
      raw: str
    });

    // Return the result.
    return Promise.fromNode(callback => {
      uncss(rawHtml, options, (err, result) => {
        debug('updating %s', locals.path); // Debug.
        callback(err, result); // Invoke with exactly two arguments.
      });
    });
  });
};
