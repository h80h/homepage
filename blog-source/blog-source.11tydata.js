const folderSlugMap = {
  "hedi-s-coding": "code",
  "hedi-s-daily": "daily",
};

module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      if (!data.category_name) return false;

      if (data.title && data.page && data.page.filePathStem) {
        const parts = data.page.filePathStem.split("/");
        const isPost = parts.length >= 2; // e.g. ['/hedi-s-coding', 'post-1']

        if (isPost && parts[parts.length - 1] !== "index") {
          const rawFolder = parts[parts.length - 2]; // e.g. hedi-s-coding
          const mappedFolder =
            folderSlugMap[rawFolder] || rawFolder.toLowerCase();
          const slug = data.title
            .replace(/#/g, "")
            .replace(/[^a-zA-Z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .toLowerCase();
          return `/${mappedFolder}/${slug}/index.html`;
        }
      }

      return data.permalink;
    },

    eleventyExcludeFromCollections: (data) => {
      return (
        data.category_name === "root" ||
        !data.category_name ||
        data.category_name === "feed"
      );
    },
  },
};
