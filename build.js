#! /usr/bin/env node

'use strict'

import Metalsmith from 'metalsmith'
import debug from 'metalsmith-debug'
import layouts from '@metalsmith/layouts'
import dateFormatter from "metalsmith-date-formatter"
import inPlace from "@metalsmith/in-place"
import collections from "@metalsmith/collections"
import wordcount from "metalsmith-word-count"
import markdown from "@metalsmith/markdown"
import feed from 'metalsmith-feed'
import renamer from 'metalsmith-renamer'
import paths from "metalsmith-paths"
import assets from 'metalsmith-assets'
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

Metalsmith(__dirname)
  .metadata({
    site: {
      name: 'dougwebb.site',
      url: 'https://dougwebb.site',
      author: 'Doug Webb'
    }
  })
  .source('./src')              
  .destination('./public')              

  // `*.md` -> `*.html`
  // (Used instead of inplace for table and html support since the jstransformer componenet is not updated)
  .use(markdown({
    smartypants: true
  }))
  
  // Add `collection: [ 'posts' ]` to `posts/*.md` & create `posts` collection object in reverse date order
  .use(collections({
    posts: {
      pattern: 'posts/*/*.html',
      sortBy: 'date',
      reverse: true
    },
    slides: {
      pattern: 'slides/*/*.html',
      sortBy: 'date',
      reverse: true
    }    
  }))
  
  .use(wordcount()) // Requires files to be html
  
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
    pattern: ['**'], // `/*` since URLs have been prettified at this point
  }))
  
  // Adds property with different paths
  // e.g. 'post.paths.dir'
  // https://github.com/ahmadnassri/metalsmith-paths
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
  .use(inPlace({ transform: 'nunjucks' }))
  
  .use(assets({
    source: './assets', // relative to the working directory
    destination: './assets' // relative to the build directory
  }))
    
  // Delete existing files in destination directory
  .clean(true)
  
  // Debugging data during build
  // LOTS!
  .use(debug({
    log: "first debug",      // any comment you like
    metadata: true,         // default: true
    source: true,           // default: true
    destination: false,      // default: true
    files: false,             // default: true
    match: "**/index.html"         // default: all files
  }))
  
  // Let's build this thing!
  .build((err) => {
    if (err) { // error handling is required
      throw err 
    } else {
      console.log("Build successful!");
    }
  })
