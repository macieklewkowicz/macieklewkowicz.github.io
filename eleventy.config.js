import { default as jsonld } from "jsonld";
import { StreamWriter, StreamParser } from "n3";
import intoStream from "into-stream";
import getStream from "get-stream";
import * as fs from "fs";
import tinyCSS from "@sardine/eleventy-plugin-tinycss";
import tinyHTML from "@sardine/eleventy-plugin-tinyhtml";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(tinyCSS);
  eleventyConfig.addPlugin(tinyHTML);

  eleventyConfig.addFilter("date", (date) =>
    new Date(date).toLocaleString("en-GB", { dateStyle: "full" }),
  );

  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());

  eleventyConfig.addDataExtension("ttl", {
    parser: async (file) => {
      //return { graph: file };

      const parser = new StreamParser();
      const writer = new StreamWriter({ format: "N-Quads" });
      const rdfStream = fs.createReadStream(file);

      rdfStream.pipe(parser);
      parser.pipe(writer);
      const quads = await getStream(writer);

      const process = (data) => jsonld.fromRDF(data);
      // .then((graph) =>
      //   jsonld.frame(graph, {
      //     "@context": {
      //       schema: "https://schema.org/",
      //       "@base": "https://macieklewkowicz.pl/",
      //     },
      //     "@type": "https://schema.org/WebPage",
      //   }),
      // );

      let graph = await process(quads);

      return { graph: graph };
    },

    read: false,
  });

  eleventyConfig.setBrowserSyncConfig({
    files: "./_site/css/**/*.css",
  });

  return {
    dir: {
      input: "_src",
      output: "_site",
    },
  };
}
