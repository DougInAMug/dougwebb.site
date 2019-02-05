#! /usr/bin/env node

'use strict'

// build.js: metalsmith API method (alternative is metalsmith.json https://github.com/segmentio/metalsmith/wiki/The-basics-of-Metalsmith)

const Metalsmith    = require('metalsmith')
const debug         = require('metalsmith-debug')
const layouts       = require('metalsmith-layouts')
const dateFormatter = require('metalsmith-date-formatter')
const inplace       = require('metalsmith-in-place')
const collections   = require('metalsmith-collections')
const drafts        = require('metalsmith-drafts')
const wordcount     = require('metalsmith-word-count')
const permalinks    = require('metalsmith-permalinks')
const chalk         = require('chalk')
const assets        = require('metalsmith-assets')

// SETUP

Metalsmith(__dirname)           // __dirname defined by node.js:
  .source('./src')              // source directory
  .destination('./public')      // destination directory
  .use(drafts())                // omit drafts (YFM `draft: true`) from process 
  
// PROCESS POSTS

  .use(inplace({                // in-place transpile to .html based on RTL file extenstions
      pattern: "articles/*"     //   transpile files in `articles` (.md) into .html
  }))
  .use(collections({            // create collection metadata
    articles: {                 // add `collection: [ 'articles' ]` ...
      pattern: 'articles/*',    //    to files in `articles` ...
      sortBy: 'date',           //    sort by date ...
      reverse: true             //    reverse date order
    }
  }))
  .use(dateFormatter({          // format date-time using 'moment' date formats: http://momentjs.com/
    dates: [
      {
        key: 'date',            // change the standard `date` format
        format: 'Do MMM YYYY'   // e.g. 27th Nov 2018
      },
      {
        key: 'modifiedDate',
        format: 'MM YYYY'
      }
    ]
  }))
  .use(wordcount())            // REQUIRES .html, counts words, adds `wordCount` and `readingTime` metadata
  .use(permalinks())           // REQUIRES .html, prettifies URLs by
                               //   1. name.html       → name/index.html
                               //   2. path: name.html → path: name

// PROCESS REST

  .use(inplace())              // in-place transpiling of remaining .html files (n.b. all `article` meta-data now available!)
  .use(layouts({               // injects content + metadata into template specified by a files YFM `layout:`
    suppressNoFilesError: true //   BAD. Suppresses errors when no layout found. This is lazy, fix it: https://www.npmjs.com/package/metalsmith-layouts          
  }))
  .use(assets({                // copy assets (note: plugin is deprecated, but working)
    source: './assets',        //   from `$SOURCE/assets`
    destination: './assets'    //   to `$DESTINATION/assets`
  }))
  
// BUILD

  .use(debug())
  .build((err) => {            // build process
    if (err) {                 //   error handling is required
      throw err
    } else {
      console.log(chalk.bgGreen.bold('✓ Build successful'))
    }
  })
