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
const markdown      = require('metalsmith-markdown')
const feed          = require('metalsmith-feed')
const chalk         = require('chalk')

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
  // (Used instead of inplace for table and html support, jstransformer not updated)
  .use(markdown({
    pattern: 'posts/*.md',
    smartypants: true
  }))
  
  // Add `collection: [ 'posts' ]` to `posts/*.md` & create `posts` collection object in reverse date order
  .use(collections({
    posts: {
      pattern: 'posts/*.html',
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
  
  // /example.html --> example/item.html (i.e. '.html'-free urls)
  // REQUIRES .html! DON'T break URLs! Creates folder with filename, renames file to `item.html`, moves it into newly created folder and updates $path
  .use(permalinks({
    // 'default'
    relative: 'folder',
    
    linksets: [
      {
        match: { collection: 'posts' },
        pattern: 'posts/:title', // name folders using `title` from YFM instead of 'YYYY-MM-DD_FILENAME'
        relative: 'false'
      }
    ]
       
  }))
  
  // Inject source files into layouts
  // Layouts specified with YFM `layout`
  .use(layouts({
    pattern: ['posts/*/*.html'], // `/*` since URLs have been prettified at this point
  }))
  
  // Generate rss.xml
  .use(feed({
    collection: 'posts'
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
