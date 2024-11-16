import { default as jsonld } from "jsonld";

export default {
  framed: async (data) => {
    const frameBy = new URL(
      data.page.url,
      "https://macieklewkowicz.pl/",
    ).toString();
    return jsonld.frame(
      [
        data.graph,
        Object.values(data.globalGraphs).map((item) => item.graph),
        data.collections.all.map((item) => item.data.graph),
      ],
      {
        "@context": {
          "@base": null,
          "https://schema.org/subjectOf": {
            "@reverse": "https://schema.org/about",
            "@container": "@set",
          },
          "https://schema.org/hasPart": {
            "@reverse": "https://schema.org/isPartOf",
            "@container": "@set",
          },
        },
        "@id": frameBy,
        "https://schema.org/mainEntity": {
          "https://schema.org/subjectOf": {},
          "https://schema.org/hasPart": {},
        },
      },
    );
  },
};
