<%*
// --- post-id only ---
const allFiles = app.vault.getMarkdownFiles();
const postNums = allFiles
  .map(f => f.basename.match(/^post-(\d+)$/))
  .filter(Boolean)
  .map(m => parseInt(m[1]));
const nextPostId = postNums.length ? Math.max(...postNums) + 1 : 1;

// --- rename file ---
await tp.file.rename(`post-${nextPostId}`);

// --- insert frontmatter ---
tR += `---
post-id: ${nextPostId}
---`;
-%>