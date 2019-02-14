#! /usr/bin/env node

'use strict'

// build.js: metalsmith API method (alternative is metalsmith.json https://github.com/segmentio/metalsmith/wiki/The-basics-of-Metalsmith)

const Metalsmith    = require('metalsmith')
const debug         = require('metalsmith-debug')
const layouts       = require('metalsmith-layouts')
const msSymlink     = require('metalsmith-symlink')
const dateFormatter = require('metalsmith-date-formatter')
const inplace       = require('metalsmith-in-place')
const collections   = require('metalsmith-collections')
const drafts        = require('metalsmith-drafts')
const wordcount     = require('metalsmith-word-count')
const permalinks    = require('metalsmith-permalinks')
const chalk         = require('chalk')

// SETUP

Metalsmith(__dirname)           // __dirname defined by node.js:
  .source('./src')              // specify source directory
  .destination('./public')      // specify destination directory
  .use(drafts())                // omit drafts (YFM `draft: true`) from process 
  .use(msSymlink({              // create symlink to `assets` (instead of copying)
      paths: [
        {	
          src: './assets',  // relative to the directory the script was executed from (i.e. `dougwebb.site`)
          dest: 'assets'    // relative to the destination directory given to Metalsmith above (i.e. 'dougwebb.site/public)
        }
      ]
    }))
  
// PROCESS POSTS

  .use(inplace({                // transpile files to .html based on RTL file extenstions
      pattern: "posts/*"        //   transpile files in `posts` (.md) into .html
  }))
  .use(collections({            // create collection metadata
    posts: {                    // add `collection: [ 'posts' ]` ...
      pattern: 'posts/*',       //    to files in `posts` ...
      sortBy: 'date',           //    sort by date ...
      reverse: true             //    reverse date order
    }
  }))
  .use(dateFormatter({          // format date-time using 'moment' date formats: http://momentjs.com/
    dates: [
      {
        key: 'date',            //      change the standard `date` format
        format: 'Do MMM YYYY'   //      e.g. 27th Nov 2018
      },
      {
        key: 'modifiedDate',
        format: 'MM YYYY'
      }
    ]
  }))
  .use(wordcount())             // REQUIRES .html! counts words, adds `wordCount` and `readingTime` metadata
  .use(permalinks({             // REQUIRES .html! CAUTION don't break URLs! Prettifies URLs by 1. name.html → name/index.html 2. path: name.html → path: name
    linksets: [
      {
        match: { collection: 'posts' }, // for files with `collection: 'posts'` ...
        pattern: 'posts/:title'         // mkdir and change path to `'posts/:title'`
      }
    ]
  }))

// PROCESS REST

  .use(inplace())               // in-place transpiling of remaining .html files (n.b. all `posts` meta-data now available!)
  .use(layouts({                // injects content + metadata into template specified by a files YFM `layout:`
    suppressNoFilesError: true  //   BAD! Suppresses errors when no layout found. This is lazy, fix it: https://www.npmjs.com/package/metalsmith-layouts          
  }))
  
// BUILD

  .use(debug())
  .build((err) => {             // build process
    if (err) {                  //   error handling is required
      throw err 
    } else {
      console.log(chalk.bgGreen.bold('✓ Build successful'))
    }
  })
