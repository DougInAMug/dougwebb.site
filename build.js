#! /usr/bin/env node

'use strict'

// build.js: metalsmith API method (alternative method: metalsmith.json https://github.com/segmentio/metalsmith/wiki/The-basics-of-Metalsmith)

// Recommendation to use `const` when the identifier won't be reassigned https://medium.com/javascript-scene/javascript-es6-var-let-or-const-ba58b8dcde75

const Metalsmith    = require('metalsmith')
const debug         = require('metalsmith-debug')
const layouts       = require('metalsmith-layouts')
const dateFormatter = require('metalsmith-date-formatter')
const inplace       = require('metalsmith-in-place')
const collections   = require('metalsmith-collections')
const drafts        = require('metalsmith-drafts')
const wordcount     = require('metalsmith-word-count')
const markdown      = require('metalsmith-markdown')
const feed          = require('metalsmith-feed')
const chalk         = require('chalk')
const renamer       = require('metalsmith-renamer')
const paths         = require('metalsmith-paths')

// Start
// In Node.js, `__dirname` is always the directory in which the currently executing script resides
Metalsmith(__dirname)

  // Define global metadata
  .metadata({
    site: {
      name: 'dougwebb.site',
      url: 'https://dougwebb.site',
      author: 'Doug Webb'
    }
  })
      
  // Specify source file directory
  .source('./src')              
  
  // Specify destination directory
  .destination('./public')
  
  // Omit drafts (i.e. `draft: true`) 
  .use(drafts())                

  // `posts/*.md` --transpile-to-html--> `posts/*.html`
  // (Used instead of inplace for table and html support since the jstransformer componenet is not updated)
  .use(markdown({
    pattern: 'posts/*/*.md',
    smartypants: true
  }))
  
  // Add `collection: [ 'posts' ]` to `posts/*.md` & create `posts` collection object in reverse date order
  .use(collections({
    posts: {
      pattern: 'posts/*/*.html',
      sortBy: 'date',
      reverse: true
    }
  }))
  
  // Calculate reading data
  // REQUIRES .html Counts words, adds `wordCount` and `readingTime` metadata
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
   
  // Inject source files into layouts
  // Layouts specified with YFM `layout`
  .use(layouts({
    default: "post.njk",
    pattern: ['posts/*/*.html'], // `/*` since URLs have been prettified at this point
  }))
  
  // Adds property with different paths
  // e.g. 'post.paths.dir'
  .use(paths({
    property: "paths"
  }))
  
  // rename post and slide *.html to index.html
  // somehow easier than metalsmith-permalinks, because I want to keep imgs as subfolders
  .use(
    renamer({
      "posts": { // this name is only used to help organize different settings
        pattern: "posts/**/*.html",
        rename: "index.html",
      }, // and as many more patterns as you want
      "slides": { 
        pattern: "slides/**/*.html",
        rename: "index.html",
      }, 
    })
  )
  
  // Generate rss.xml
  .use(feed({
    collection: 'posts'
  }))
  
  // Transpile `base` pages (index.html, 404, 403)
  // N.B. At this point `collection`, `wordCount`, etc now available: this allows the posts index to be built
  .use(inplace())
    
  // Delete existing files in destination directory
  .clean(true)
  
  // Debugging data during build
  // LOTS!
  .use(debug({
    log: "first debug",      // any comment you like
    metadata: true,         // default: true
    source: false,           // default: true
    destination: false,      // default: true
    files: false,             // default: true
    match: "**/index.html"         // default: all files
  }))
  
  // Let's build this thing!
  .build((err) => {
    if (err) { // error handling is required
      throw err 
    } else {
      console.log(chalk.bgGreen.bold('✓ Build successful'))
    }
  })
