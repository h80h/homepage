const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItObsidian = require("markdown-it-obsidian");

module.exports = function(eleventyConfig) {
  
  // 1. THE OBSIDIAN BRIDGE
  // This makes [[wikilinks]] work and helps with Obsidian images
  let markdownLib = markdownIt({
    html: true,       // Allow vanilla HTML inside your markdown
    breaks: true,     // Convert line breaks to <br>
    linkify: true     // Auto-convert URLs to links
  }).use(markdownItObsidian({
    baseURL: '/blog/' // Ensures links lead to your /blog/ folder
  }));
  eleventyConfig.setLibrary("md", markdownLib);

  // 2. THE ASSET PIPELINE
  // Tell 11ty to copy your Vanilla CSS/JS folders directly to the output
  eleventyConfig.addPassthroughCopy("style.css");        // Global CSS
  eleventyConfig.addPassthroughCopy("blog-assets");    // Blog-specific CSS/Images

  // 3. THE PLUGINS
  // RSS plugin for your feed.xml
  eleventyConfig.addPlugin(pluginRss);
  // HTML Base plugin: MAGICally fixes all links to work at h80h.xyz/blog/
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // 4. THE DATA FILTER (Optional but recommended)
  // Makes your dates look like "Feb 27, 2026" instead of a weird code
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-us', {
      year: "numeric", month: "short", day: "numeric"
    });
  });

  // This tells Eleventy: "Find any image inside ANY subfolder of blog-source and copy it"
  eleventyConfig.addPassthroughCopy("blog-source/**/*.jpg");
  eleventyConfig.addPassthroughCopy("blog-source/**/*.png");
  eleventyConfig.addPassthroughCopy("blog-source/**/*.svg");

  // 5. THE FACTORY SETTINGS
  return {
    pathPrefix: "/blog/", // CRUCIAL: Tells 11ty the site lives in a subfolder
    dir: {
      input: "blog-source",   // Your Obsidian folder
      output: "blog",        // The public folder on your GitHub
      includes: "../_includes" // Where your HTML layouts live
    },
    // Use Nunjucks for HTML/Markdown files so you can use loops
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};