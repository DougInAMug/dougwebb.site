#! /usr/bin/env node

'use strict'

// build.js: metalsmith API method (alternative is metalsmith.json https://github.com/segmentio/metalsmith/wiki/The-basics-of-Metalsmith)

const Metalsmith    = require('metalsmith')
const markdown      = require('metalsmith-markdown')
const debug         = require('metalsmith-debug')
const layouts       = require('metalsmith-layouts')
const dateFormatter = require('metalsmith-date-formatter')
const inplace       = require('metalsmith-in-place')
const collections   = require('metalsmith-collections')
const drafts        = require('metalsmith-drafts')
const wordcount     = require('metalsmith-word-count')
const permalinks    = require('metalsmith-permalinks')
const chalk         = require('chalk') // just to color log messages
const assets        = require('metalsmith-assets')

Metalsmith(__dirname)         // __dirname defined by node.js:
  .source('./src')            // source directory
  .destination('./public')    // destination directory
  .use(drafts())              // stops drafts (`draft: true`) from being built
  .use(markdown())            // transpile md into html
  //.use(collections({          // create 'collections' metadata from `collections: blah` OR pattern, defined below
    //articles: {
      //pattern: 'articles/*.html',
      //sortBy: 'date',
      //reverse: true
    //}
  //}))
  .use(permalinks())          // prettifies urls... but adds everything into it's own folder and calls it index.html... why?
  .use(dateFormatter({        // format date/time based on YFM key and 'moment' date formats: http://momentjs.com/
    dates: [
      {
        key: 'date',          // change the standard date format, seems better than the default one
        format: 'Do MMM YYYY'
      },
      {
        key: 'modifiedDate',
        format: 'MM YYYY'
      }
    ]
  }))
  .use(wordcount())
  .use(inplace())              // transform `contents` based on RTL file extenstions. Only necessary if inheriting template bits! Use absolute path.
  //.use(layouts())              // injects content + metadata into a template
  .use(debug())
  //.use(function(files, metalsmith, done) {  // this is a method to view interstitial files, bad workaround for debug
    //console.log(files);
    //console.log(metalsmith);
    //done();
  //})
  .use(assets({
    source: './assets',
    destination: './assets'
  }))
  .build((err) => {           // build process
    if (err) {                // error handling is required
      throw err
    } else {
      console.log(chalk.bgGreen.bold('✓ Build successful'))
    }
  })
