#! /usr/bin/env node

'use strict'

// build.js: metalsmith API method (alternative method: metalsmith.json https://github.com/segmentio/metalsmith/wiki/The-basics-of-Metalsmith)

// Recommendation to use `const` when the identifier won't be reassigned https://medium.com/javascript-scene/javascript-es6-var-let-or-const-ba58b8dcde75

const Metalsmith    = require('metalsmith')
const debug         = require('metalsmith-debug')
const layouts       = require('metalsmith-layouts')
const msSymlink     = require('metalsmith-symlink')
const assets        = require('metalsmith-assets')
const dateFormatter = require('metalsmith-date-formatter')
const inplace       = require('metalsmith-in-place')
const collections   = require('metalsmith-collections')
const drafts        = require('metalsmith-drafts')
const wordcount     = require('metalsmith-word-count')
const permalinks    = require('metalsmith-permalinks')
const copy          = require('metalsmith-copy')
const chalk         = require('chalk')

// Start
// In Node.js, `__dirname` is always the directory in which the currently executing script resides
Metalsmith(__dirname)
  
  // Specify source file directory
  .source('./src')              
  
  // Specify destination directory
  .destination('./public')
  
  // Ignore a test folder
  .ignore('public/test')
  
  // Omit drafts (i.e. YFM `draft: true`) 
  .use(drafts())                
    
  // Rename `slides/*.md` to `slides/*.html` 
  // (Remark requires markdown: renaming files `.html` prevents `inplace` from transpiling them; `layouts` keeps the extensions it finds.)
  .use(copy({
    pattern: 'slides/*.md', 
    extension: '.html',
    move: true // move, don't copy
  }))  
  
  // Transpile `posts/*.md` to html then update file extension
  .use(inplace({
      pattern: 'posts/*.md'
  }))
  
  // Create `posts` collection data
  // Add `collection: [ 'posts' ]` to `posts/*.md`, and create `posts` collection object in reverse date order
  .use(collections({
    posts: {
      pattern: 'posts/*.html',
      sortBy: 'date',
      reverse: true
    }
  }))
  
  // Calculate reading data
  // REQUIRES .html! Counts words, adds `wordCount` and `readingTime` metadata
  .use(wordcount())
  
  // Prettify date format
  // Uses 'moment' date formats: http://momentjs.com/
  .use(dateFormatter({
    dates: [
      {
        key: 'date',
        format: 'Do MMM YYYY' // e.g. 27th Nov 2018
      },
      {
        key: 'modifiedDate', // not currently used
        format: 'MM YYYY'
      }
    ]
  }))
  
  // Prettify URLs (`/x` vs `/x.html`)
  // REQUIRES .html! DON'T break URLs! Creates folder with filename, renames file to `item.html` then moves it into newly created folder
  .use(permalinks({
    linksets: [
      {
        match: { collection: 'posts' },
        pattern: 'posts/:title' // name folders using `title` from YFM instead of 'YYYY-MM-DD_FILENAME'
      }
    ]
  }))
  
  // Inject source files into layouts
  // Layouts specified with YFM `layout`
  .use(layouts({
    pattern: ['posts/*/*.html', 'slides/*/*.html'], // `/*` since URLs have been prettified at this point
  }))
  
  // Transpile `base` pages (index.html, 404, 403)
  // N.B. At this point `collection`, `wordCount`, etc now available: this allows the posts index to be built
  .use(inplace())
  
  // Copy assets to `public`
  // IMPROVE, seems wasteful to copy each time. Could be possible to set `clean` as false, move assets to `destination` then symlink in base directory. Plugin deprecated, but working.
  .use(assets({
	    source: './assets',
	    destination: './assets'
  }))
  
  // Delete existing files in destination directory
  .clean(true)
  
  // Debugging data during build
  // LOTS!
  .use(debug())
  
  // Let's build this thing!
  .build((err) => {
    if (err) { // error handling is required
      throw err 
    } else {
      console.log(chalk.bgGreen.bold('✓ Build successful'))
    }
  })
