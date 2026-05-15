const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItObsidian = require("markdown-it-obsidian");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItTaskLists = require("markdown-it-task-lists");
const { execSync } = require("child_process");

module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("blog-source/Templates/**");
  // 1. THE OBSIDIAN BRIDGE
  let markdownLib = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(markdownItTaskLists, { enabled: true })
    .use(markdownItAnchor, {
      renderPermalink: (slug, opts, state, idx) => {
        const level = parseInt(state.tokens[idx].tag.slice(1), 10);
        const symbol = "#".repeat(level - 1);
        const linkOpen = new state.Token("html_inline", "", 0);
        linkOpen.content = `<a class="header-anchor" href="#${slug}" aria-hidden="true" tabindex="-1">`;
        const text = new state.Token("html_inline", "", 0);
        text.content = symbol;
        const linkClose = new state.Token("html_inline", "", 0);
        linkClose.content = "</a>";
        const tokens = state.tokens[idx + 1].children;
        tokens.push(linkOpen, text, linkClose);
      },
      level: [2, 3, 4, 5, 6],
      slugify: (s) =>
        s
          .trim()
          .toLowerCase()
          .replace(/[\s]+/g, "-")
          .replace(/[^\w-]/g, ""),
    });

  // Standard markdown ![alt](url) images — wrap in <figure> the same way.
  // Standard markdown images: ![filename.png|300](url)
  // The alt may contain a pipe-separated width (Obsidian convention when images
  // are written in standard markdown syntax): "filename.png|64" splits into
  // caption="filename.png" and width=64. The numeric part is never shown as text.
  markdownLib.renderer.rules.image = function (
    tokens,
    idx,
    options,
    env,
    self,
  ) {
    const token = tokens[idx];
    const src = token.attrGet("src") || "";
    const rawAlt =
      token.children?.map((t) => t.content).join("") ||
      token.attrGet("alt") ||
      "";

    // Parse "name|300" → caption="name", widthStr="300"
    const pipeIdx = rawAlt.lastIndexOf("|");
    let caption = rawAlt;
    let widthStr = "";
    if (pipeIdx !== -1) {
      const after = rawAlt.slice(pipeIdx + 1).trim();
      if (/^\d+$/.test(after)) {
        caption = rawAlt.slice(0, pipeIdx).trim();
        widthStr = after;
      }
    }

    const displayW = widthStr ? parseInt(widthStr, 10) : null;

    token.attrSet("src", src);
    token.attrSet("loading", "lazy");
    token.attrSet("decoding", "async");
    if (caption) token.attrSet("alt", caption);
    if (displayW) token.attrSet("width", String(displayW));
    const imgHtml = self.renderToken(tokens, idx, options);
    return `<div  data-pagefind-ignore="all">${imgHtml}</div>
    <div class="figcaption">${caption}</div>
    `;
  };

  eleventyConfig.setLibrary("md", markdownLib);

  // 2. THE ASSET PIPELINE
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("blog-assets");
  eleventyConfig.addPassthroughCopy("favicon");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("_redirects");

  // 3. THE PLUGINS
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // 4. THE DATA FILTER

  eleventyConfig.addPassthroughCopy("blog-source/**/*.jpg");
  eleventyConfig.addPassthroughCopy("blog-source/**/*.png");
  eleventyConfig.addPassthroughCopy("blog-source/**/*.svg");
  eleventyConfig.addPassthroughCopy("favicon/*.ico");
  eleventyConfig.addPassthroughCopy("favicon/*.webmanifest");
  eleventyConfig.addPassthroughCopy("fonts/*.woff2");

  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addGlobalData("build", { timestamp: Date.now() });

  const gitDateCache = {};
  const getGitDates = (filePath) => {
    if (gitDateCache[filePath]) return gitDateCache[filePath];
    try {
      const log = execSync(`git log --format=%ci -- "${filePath}"`, {
        encoding: "utf8",
      }).trim();
      if (!log)
        return (gitDateCache[filePath] = {
          first: null,
          last: null,
          firstRaw: null,
          lastRaw: null,
        });
      const lines = log.split("\n");
      // Git outputs timestamps like "2026-05-08 01:23:45 +0800".
      // Parsing with new Date() and calling getDate() uses the Node process
      // timezone (often UTC on servers), which can shift the date by a day.
      // Instead, read the date part directly from the git string so the
      // displayed date always matches the committer's local calendar date.
      const fmt = (line) => {
        const match = line.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[1]}-${match[2]}-${match[3]}`;
        const d = new Date(line.trim());
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      };
      return (gitDateCache[filePath] = {
        last: fmt(lines[0]),
        first: fmt(lines[lines.length - 1]),
        // raw git timestamps (e.g. "2026-04-25 14:32:11 +0800") for UTC conversion in feed
        lastRaw: lines[0].trim(),
        firstRaw: lines[lines.length - 1].trim(),
      });
    } catch (e) {
      return (gitDateCache[filePath] = {
        first: null,
        last: null,
        firstRaw: null,
        lastRaw: null,
      });
    }
  };

  function timeFilter() {
    eleventyConfig.addFilter("postDate", (dateObj) => {
      const year = dateObj.getFullYear();
      // Convert to string and pad with '0' to ensure two digits
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    });

    eleventyConfig.addFilter(
      "gitFirstCommit",
      (filePath) => getGitDates(filePath).first,
    );
    eleventyConfig.addFilter(
      "gitLastModified",
      (filePath) => getGitDates(filePath).last,
    );
    eleventyConfig.addFilter(
      "gitFirstCommitRaw",
      (filePath) => getGitDates(filePath).firstRaw,
    );
    eleventyConfig.addFilter(
      "gitLastModifiedRaw",
      (filePath) => getGitDates(filePath).lastRaw,
    );

    // Converts a raw git timestamp ("YYYY-MM-DD HH:mm:ss +HHMM") to UTC ISO 8601
    // for use in feed.xml. new Date() correctly parses the timezone offset,
    // and toISOString() always outputs UTC.
    eleventyConfig.addFilter("gitDateToRfc3339", (rawStr) => {
      if (!rawStr) return null;
      return new Date(rawStr).toISOString();
    });
  }

  timeFilter();

  // Sort helper: newest gitFirstCommit first, fallback to page.date
  const byGitFirst = (a, b) => {
    const dateA =
      getGitDates(a.inputPath).first ||
      (a.date ? a.date.toISOString().slice(0, 10) : "");
    const dateB =
      getGitDates(b.inputPath).first ||
      (b.date ? b.date.toISOString().slice(0, 10) : "");
    if (dateA !== dateB) return dateA < dateB ? 1 : -1;
    // Same date (git or fallback): sort by post-id descending (higher id listed first)
    const idA = a.data["post-id"] ?? -Infinity;
    const idB = b.data["post-id"] ?? -Infinity;
    return idA < idB ? 1 : idA > idB ? -1 : 0;
  };

  // POSTS COLLECTION sorted by git first commit date, newest first
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByTag("posts").sort(byGitFirst),
  );
  eleventyConfig.addCollection("hedi-s-coding-sorted", (collectionApi) =>
    collectionApi.getFilteredByTag("hedi-s-coding").sort(byGitFirst),
  );
  eleventyConfig.addCollection("hedi-s-daily-sorted", (collectionApi) =>
    collectionApi.getFilteredByTag("hedi-s-daily").sort(byGitFirst),
  );
  eleventyConfig.addCollection("pinned-sorted", (collectionApi) =>
    collectionApi.getFilteredByTag("pinned").sort(byGitFirst),
  );

  // CONTENT PREVIEW FILTER
  eleventyConfig.addFilter("contentPreview", (content, wordCount = 30) => {
    if (!content) return "";
    return (
      content
        .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "") // strip first h1
        .replace(/<pre[\s\S]*?<\/pre>/g, " ") // strip code blocks entirely
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (_, inner) =>
          inner.replace(/&lt;/g, "\x00LT\x00").replace(/&gt;/g, "\x00GT\x00"),
        ) // protect inline code from tag stripper
        .replace(/<[^>]+>/g, " ") // strip remaining HTML tags
        .replace(/\x00LT\x00/g, "<")
        .replace(/\x00GT\x00/g, ">") // restore < >
        .replace(/\s+/g, " ") // collapse whitespace
        .trim()
        .split(" ")
        .slice(0, wordCount)
        .join(" ") + "…"
    );
  });

  // STRIP FIRST H1 FILTER (for RSS feed)
  eleventyConfig.addFilter("stripFirstH1", (content) => {
    if (!content) return "";
    return content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "");
  });

  // STRIP PLAYGROUND FILTER (for RSS feed)
  eleventyConfig.addFilter("stripPlayground", (content) => {
    if (!content) return "";
    return content.replace(
      /<pre><code class="language-playground">[\s\S]*?<\/code><\/pre>/g,
      "",
    );
  });

  eleventyConfig.addFilter("doubleStruck", function (str) {
    const map = {
      a: "𝕒",
      b: "𝕓",
      c: "𝕔",
      d: "𝕕",
      e: "𝕖",
      f: "𝕗",
      g: "𝕘",
      h: "𝕙",
      i: "𝕚",
      j: "𝕛",
      k: "𝕜",
      l: "𝕝",
      m: "𝕞",
      n: "𝕟",
      o: "𝕠",
      p: "𝕡",
      q: "𝕢",
      r: "𝕣",
      s: "𝕤",
      t: "𝕥",
      u: "𝕦",
      v: "𝕧",
      w: "𝕨",
      x: "𝕩",
      y: "𝕪",
      z: "𝕫",
      A: "𝔸",
      B: "𝔹",
      C: "ℂ",
      D: "𝔻",
      E: "𝔼",
      F: "𝔽",
      G: "𝔾",
      H: "ℍ",
      I: "𝕀",
      J: "𝕁",
      K: "𝕂",
      L: "𝕃",
      M: "𝕄",
      N: "ℕ",
      O: "𝕆",
      P: "ℙ",
      Q: "ℚ",
      R: "ℝ",
      S: "𝕊",
      T: "𝕋",
      U: "𝕌",
      V: "𝕍",
      W: "𝕎",
      X: "𝕏",
      Y: "𝕐",
      Z: "ℤ",
      0: "𝟘",
      1: "𝟙",
      2: "𝟚",
      3: "𝟛",
      4: "𝟜",
      5: "𝟝",
      6: "𝟞",
      7: "𝟟",
      8: "𝟠",
      9: "𝟡",
    };
    return [...str].map((c) => map[c] ?? c).join("");
  });

  // STICKY HEADER SCROLL OFFSET
  // Headings that are jump targets need scroll-margin-top equal to the
  // sticky header height (≈54 px) so they aren't obscured after navigation.
  eleventyConfig.addTransform("anchor-scroll-margin", function (content) {
    if (
      !this.outputPath ||
      typeof this.outputPath !== "string" ||
      !this.outputPath.endsWith(".html")
    ) {
      return content;
    }
    const style =
      "<style>html{scroll-behavior:smooth}h1,h2,h3,h4,h5,h6{scroll-margin-top:54px}</style>";
    if (content.includes("</head>"))
      return content.replace("</head>", style + "</head>");
    return content;
  });

  // PLAYGROUND TRANSFORM
  eleventyConfig.addTransform("playground-embed", function (content) {
    if (
      !this.outputPath ||
      typeof this.outputPath !== "string" ||
      !this.outputPath.endsWith(".html")
    ) {
      return content;
    }

    let hasPlayground = false;

    const replaced = content.replace(
      new RegExp(
        '<pre><code class="language-playground">([\\s\\S]*?)<\\/code><\\/pre>',
        "g",
      ),
      function (match, raw) {
        const decoded = raw
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        const get = (re) => {
          const m = decoded.match(re);
          return m ? m[1].trim() : "";
        };
        const h = get(/---html---\s*([\s\S]*?)(?=---\w+---|$)/i);
        const c = get(/---css---\s*([\s\S]*?)(?=---\w+---|$)/i);
        const j = get(/---js---\s*([\s\S]*?)(?=---\w+---|$)/i);

        // Escape brackets for all languages to prevent the browser from rendering raw DOM nodes inside the div
        const safeH = h.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeC = c.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeJ = j.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        hasPlayground = true;
        return [
          '<div class="pg-wrap">',
          '<div class="pg-tabs">',
          '<button class="pg-tab active" data-tab="html">HTML</button>',
          '<button class="pg-tab" data-tab="css">CSS</button>',
          '<button class="pg-tab" data-tab="js">JS</button>',
          '<button class="pg-tab active" data-tab="preview">Preview</button>',
          "</div>",
          '<div class="pg-body">',
          '<div class="pg-editor-wrap">',
          '<div class="pg-editor-panel active" data-lang="html"><div class="pg-editor">' +
            safeH +
            "</div></div>",
          '<div class="pg-editor-panel" data-lang="css"><div class="pg-editor">' +
            safeC +
            "</div></div>",
          '<div class="pg-editor-panel" data-lang="js"><div class="pg-editor">' +
            safeJ +
            "</div></div>",
          "</div>",
          '<div class="pg-preview"><iframe class="pg-frame"></iframe></div>',
          "</div>",
          "</div>",
        ].join("");
      },
    );

    if (!hasPlayground) return replaced;

    const style = [
      "<style>",
      ".pg-wrap{font-family:Menlo;border:1px solid #d0d0d0;overflow:hidden;margin:1.5rem 0;}",
      ".pg-tabs{display:flex;align-items:center;background:#dcdcdc;}",
      ".pg-tab{padding:2px 10px;font-size:15px;font-weight:500;cursor:pointer;border:none;background:transparent;color:#333;font-family:inherit;}",
      ".pg-tab:hover{color:#B8382F;}.pg-tab.active{color:#B8382F;}",
      ".pg-body{display:flex;height:300px;}",
      ".pg-editor-wrap{width:50%;border-right:1px solid #d0d0d0;display:flex;flex-direction:column;overflow:hidden;background:#fff;}",
      ".pg-editor-wrap.pg-solo{width:100%;border-right:none;}",
      ".pg-preview{width:50%;background:#fff;}",
      ".pg-preview.pg-solo{width:100%;}",
      ".pg-editor-wrap.pg-hidden,.pg-preview.pg-hidden{display:none;}",
      ".pg-editor-panel{display:none;flex:1;width:100%;height:100%;}",
      ".pg-editor-panel.active{display:block;}",
      ".pg-editor{width:100%;height:100%;font-size:15px;}",
      ".pg-frame{width:100%;height:100%;border:none;display:block;}",
      "@media(max-width:450px){",
      "  .pg-editor-wrap{width:100%;border-right:none;}",
      "  .pg-preview{width:100%;}",
      "  .pg-editor-wrap:not(.pg-mobile-show){display:none;}",
      "  .pg-preview.pg-mobile-show{display:block;}",
      "  .pg-preview:not(.pg-mobile-show){display:none;}",
      "}",
      "@media(max-width:326px){",
      ".pg-body{height: 220px}",
      "}",
      "</style>",
    ].join("");

    const aceOverrides = [
      "<style>",
      // Chrome token colors applied to kuroir's background/layout
      ".ace-kuroir{color:black !important;}",
      ".ace-kuroir .ace_comment,.ace-kuroir .ace_comment.ace_doc,.ace-kuroir .ace_comment.ace_doc.ace_tag{color:#236e24 !important;background-color:transparent !important;}",
      ".ace-kuroir .ace_string{color:#1A1AA6 !important;}",
      ".ace-kuroir .ace_string.ace_regexp{color:rgb(255,0,0) !important;background-color:transparent !important;}",
      ".ace-kuroir .ace_constant{color:rgb(88,72,246) !important;}",
      ".ace-kuroir .ace_constant.ace_numeric{color:rgb(0,0,205) !important;}",
      ".ace-kuroir .ace_constant.ace_language{color:rgb(88,92,246) !important;}",
      ".ace-kuroir .ace_constant.ace_library,.ace-kuroir .ace_support.ace_constant{color:rgb(6,150,14) !important;}",
      ".ace-kuroir .ace_support.ace_function{color:rgb(60,76,114) !important;}",
      ".ace-kuroir .ace_support.ace_type,.ace-kuroir .ace_support.ace_class{color:rgb(109,121,222) !important;}",
      ".ace-kuroir .ace_storage,.ace-kuroir .ace_keyword{color:rgb(147,15,128) !important;}",
      ".ace-kuroir .ace_keyword.ace_operator{color:rgb(104,118,135) !important;}",
      ".ace-kuroir .ace_variable{color:rgb(49,132,149) !important;}",
      ".ace-kuroir .ace_variable.ace_parameter{color:#FD971F !important;font-style:italic;}",
      ".ace-kuroir .ace_meta.ace_tag{color:rgb(147,15,128) !important;}",
      ".ace-kuroir .ace_entity.ace_name.ace_function{color:#0000A2 !important;}",
      ".ace-kuroir .ace_entity.ace_other.ace_attribute-name{color:#994409 !important;}",
      ".ace-kuroir .ace_markup.ace_heading{color:rgb(12,7,255) !important;background-color:transparent !important;}",
      ".ace-kuroir .ace_markup.ace_list{color:rgb(185,6,144) !important;}",
      ".ace-kuroir .ace_invalid{background-color:rgb(153,0,0) !important;color:white !important;}",
      "</style>",
    ].join("");

    const SO = "<scr" + "ipt>";
    const SC = "<\/scr" + "ipt>";
    const aceLib =
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.js"></script>\n';

    const script =
      aceLib +
      SO +
      [
        "(function(){",
        "function init(){",
        "  if(typeof ace === 'undefined'){ setTimeout(init, 50); return; }",
        '  document.querySelectorAll(".pg-wrap").forEach(function(wrap){',
        '    var tabs=wrap.querySelectorAll(".pg-tab");',
        '    var frame=wrap.querySelector(".pg-frame");',
        '    var editorWrap=wrap.querySelector(".pg-editor-wrap");',
        '    var preview=wrap.querySelector(".pg-preview");',
        "    var timer;",
        "    var editors = {};",
        // On mobile, show preview by default
        "    var isMobile=function(){ return window.matchMedia('(max-width:450px)').matches; };",
        '    var getAceTheme=function(){ var t=document.documentElement.getAttribute("data-theme"); return (t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)) ? "ace/theme/nord_dark" : "ace/theme/kuroir"; };',
        "    function initMobile(){",
        "      if(isMobile()){",
        "        preview.classList.add('pg-mobile-show');",
        '        tabs.forEach(function(t){ if(t.dataset.tab!=="preview") t.classList.remove("active"); else t.classList.add("active"); });',
        "      }",
        "    }",
        '    ["html", "css", "js"].forEach(function(lang){',
        '      var panel = wrap.querySelector(".pg-editor-panel[data-lang=\\""+lang+"\\"]");',
        '      var el = panel.querySelector(".pg-editor");',
        "      var editor = ace.edit(el);",
        '      var mode = lang === "js" ? "javascript" : lang;',
        '      editor.session.setMode("ace/mode/" + mode);',
        "      editor.setTheme(getAceTheme());",
        "      editor.setOptions({ useWorker: false, showPrintMargin: false, highlightActiveLine: false, tabSize: 2, useSoftTabs: true });",
        "      editor.renderer.setPadding(10);",
        '      editor.session.on("change", function(){',
        "        clearTimeout(timer); timer=setTimeout(render,400);",
        "      });",
        "      editors[lang] = { panel: panel, editor: editor };",
        "    });",
        "    function getDoc(){",
        '      var h=editors["html"].editor.getValue();',
        '      var c=editors["css"].editor.getValue();',
        '      var j=editors["js"].editor.getValue();',
        '      var scrollbarCSS="::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-thumb{background-color:#afc7d6;border-radius:5px;border:2px solid transparent;background-clip:padding-box;cursor:pointer;}::-webkit-scrollbar-thumb:hover{background-color:#94b1c3;}::-webkit-scrollbar-track{background:transparent;}";',
        '      return "<style>"+scrollbarCSS+c+"<\\/style>"+h+"<scr"+"ipt>"+j+"<\\/scr"+"ipt>";',
        "    }",
        "    function render(){frame.srcdoc=getDoc();}",
        "    document.addEventListener('visibilitychange',function(){ if(document.hidden){ frame.srcdoc=''; } else { render(); } });",
        "    function editorVisible(){ return !editorWrap.classList.contains('pg-hidden'); }",
        "    function previewVisible(){ return !preview.classList.contains('pg-hidden'); }",
        "    function showEditorOnly(){",
        "      editorWrap.classList.remove('pg-hidden'); editorWrap.classList.add('pg-solo');",
        "      preview.classList.add('pg-hidden'); preview.classList.remove('pg-solo');",
        "      if(isMobile()){ editorWrap.classList.add('pg-mobile-show'); preview.classList.remove('pg-mobile-show'); }",
        "    }",
        "    function showPreviewOnly(){",
        "      preview.classList.remove('pg-hidden'); preview.classList.add('pg-solo');",
        "      editorWrap.classList.add('pg-hidden'); editorWrap.classList.remove('pg-solo');",
        "      if(isMobile()){ preview.classList.add('pg-mobile-show'); editorWrap.classList.remove('pg-mobile-show'); }",
        "    }",
        "    function showBoth(){",
        "      editorWrap.classList.remove('pg-hidden','pg-solo');",
        "      preview.classList.remove('pg-hidden','pg-solo');",
        "      if(isMobile()){ preview.classList.add('pg-mobile-show'); editorWrap.classList.remove('pg-mobile-show'); }",
        "    }",
        "    tabs.forEach(function(tab){",
        '      tab.addEventListener("click",function(){',
        "        var clickedTab = tab.dataset.tab;",
        "        var wasActive = tab.classList.contains('active');",
        "        if(clickedTab === 'preview'){",
        "          if(wasActive){",
        // Preview re-clicked: on mobile do nothing; on desktop hide preview only if editor is visible
        "            if(isMobile()){ return; }",
        "            if(editorVisible()){",
        '              tabs.forEach(function(t){ if(t.dataset.tab==="preview") t.classList.remove("active"); });',
        "              showEditorOnly();",
        "            }",
        "          } else {",
        // Switch to preview tab — on mobile show preview only and set only preview active; on desktop show both and keep editor tab active
        "            tab.classList.add('active');",
        "            if(isMobile()){ tabs.forEach(function(t){ if(t.dataset.tab!=='preview') t.classList.remove('active'); }); showPreviewOnly(); } else { showBoth(); }",
        "          }",
        "        } else {",
        "          if(wasActive){",
        // Editor tab re-clicked: on mobile do nothing; on desktop hide editor only if preview is visible
        "            if(isMobile()){ return; }",
        "            if(previewVisible()){",
        '              tabs.forEach(function(t){ if(t.dataset.tab===clickedTab) t.classList.remove("active"); });',
        "              showPreviewOnly();",
        "            }",
        "          } else {",
        // Switch to an editor tab — on mobile show editor only and set only that tab active; on desktop restore both only if preview was already visible
        '            tabs.forEach(function(t){ if(t.dataset.tab!=="preview") t.classList.remove("active"); });',
        "            if(isMobile()){ tabs.forEach(function(t){ if(t.dataset.tab==='preview') t.classList.remove('active'); }); }",
        "            tab.classList.add('active');",
        '            Object.keys(editors).forEach(function(k){ editors[k].panel.classList.remove("active"); });',
        "            editors[clickedTab].panel.classList.add('active');",
        "            editors[clickedTab].editor.resize();",
        "            if(isMobile()){ showEditorOnly(); } else if(previewVisible()){ showBoth(); } else { showEditorOnly(); }",
        "          }",
        "        }",
        "      });",
        "    });",
        "    initMobile();",
        "    render();",
        '    var lightBtn=document.getElementById("light-theme-symbol"); if(lightBtn) lightBtn.addEventListener("click",function(){ Object.keys(editors).forEach(function(k){ editors[k].editor.setTheme("ace/theme/kuroir"); }); });',
        '    var darkBtn=document.getElementById("dark-theme-symbol"); if(darkBtn) darkBtn.addEventListener("click",function(){ Object.keys(editors).forEach(function(k){ editors[k].editor.setTheme("ace/theme/nord_dark"); }); });',
        "  });",
        "}",
        "init();",
        "})();",
      ].join("") +
      SC;

    if (replaced.includes("</body>"))
      return replaced.replace(
        "</body>",
        style + aceOverrides + script + "</body>",
      );
    return replaced + style + aceOverrides + script;
  });

  // 5. THE FACTORY SETTINGS
  return {
    pathPrefix: "/blog/",
    dir: {
      input: "blog-source",
      output: "blog",
      includes: "../_includes",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
