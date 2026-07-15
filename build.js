#! /usr/bin/env node

"use strict";

import Metalsmith from "metalsmith";
import debug from "metalsmith-debug";
import layouts from "@metalsmith/layouts";
import dateFormatter from "metalsmith-date-formatter";
import inPlace from "@metalsmith/in-place";
import collections from "@metalsmith/collections";
import wordcount from "metalsmith-word-count";
import markdown from "@metalsmith/markdown";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import feed from "metalsmith-feed";
import paths from "metalsmith-paths";
import assets from "metalsmith-assets";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nunjucksEngineOptions = {
  directory: "layouts", // beware, nunjucks seems to struggle with rel paths
  engineOptions: {
    path: ["layouts"],
  },
  transform: "nunjucks",
  pattern: ["**"],
};

Metalsmith(__dirname)
  .metadata({
    site: {
      name: "dougwebb.site",
      url: "https://dougwebb.site",
      author: "Doug Webb",
    },
  })

  .source("./src")

  .destination("./public")

  .use(
    markdown({
      render(source, engineOptions, context) {
        return micromark(source, {
          allowDangerousHtml: true,
          extensions: [gfm()],
          htmlExtensions: [gfmHtml()],
        });
      },
    }),
  )

  .use(
    collections({
      posts: {
        pattern: "posts/*/*.html",
        sortBy: "date",
        reverse: true,
      },
      slides: {
        pattern: "slides/*/*.html",
        sortBy: "date",
        reverse: true,
      },
    }),
  )

  .use(wordcount()) // Requires files to be html

  .use(
    dateFormatter({
      dates: [
        {
          key: "date",
          format: "Do MMM YYYY", // e.g. 27th Nov 2018,  http://momentjs.com/
        },
      ],
    }),
  )

  // Adds property with different paths
  // e.g. 'post.paths.dir'
  // https://github.com/ahmadnassri/metalsmith-paths
  .use(
    paths({
      property: "paths",
    }),
  )

  // Transpile .njk files in `src` in place
  .use(inPlace(nunjucksEngineOptions))

  // Wrap source files into layouts, specified with yfm `layout:`
  // https://github.com/metalsmith/layouts#usage-with-metalsmithin-place
  .use(layouts(nunjucksEngineOptions))

  // Generate rss.xml
  .use(
    feed({
      collection: "posts",
    }),
  )

  // Copy over assets
  .use(
    assets({
      source: "./assets", // relative to the working directory
      destination: "./assets", // relative to the build directory
    }),
  )

  // Delete existing files in destination directory
  .clean(true)

  // Debugging data during build
  .use(
    debug({
      log: "first debug", // any comment you like
      metadata: true, // default: true
      source: true, // default: true
      destination: true, // default: true
      files: true, // default: true
      match: "**/index.html", // default: all files
    }),
  )

  // Let's build this thing!
  .build((err) => {
    if (err) {
      throw err; // error handling is required
    } else {
      console.log("Build successful!");
    }
  });
