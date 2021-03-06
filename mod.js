/* global katex */

function PleromaModMath () {
  this.config = {
    stylesheet: "style.css",
    katex: {
      displayMode: true,
      output: "html",
      macros: {
        "\\f": "f(#1)"
      }
    },
    matcher: [
      {
        regex: "<code>(?:(?!<\\/code>).)+\\\\(?:(?!<\\/code>).)+<\\/code>",
        replace: [
          { src: "<code>", to: "" },
          { src: "</code>", to: "" }
        ]
      },
      {
        regex: "\\\\\\((?:(?!\\\\\\)).)+\\\\\\)",
        replace: [
          { src: "\\(", to: "" },
          { src: "\\)", to: "" }
        ]
      }
    ]
  };
  this.ready = false;
}
[
  function onMutation (mutation) {
    if (mutation.target.querySelector) {
      const statuses = document.querySelectorAll(".StatusBody");
      for (const stat of statuses) {
        if (
          this.ready &&
          (
            !stat.classList.contains("mathed") ||
            stat.parentNode.parentNode.classList.contains("preview-status")
          ) &&
          stat.innerHTML
        ) {
          for (const pattern of this.config.matcher) {
            const regex = new RegExp(pattern.regex, "gis");
            const matches = stat.innerHTML.match(regex);
            if (matches) {
              for (const match of matches) {
                try {
                  const domParser = new DOMParser();
                  let cleaned = domParser.parseFromString(match, "text/html").body.textContent;
                  for (let replace of pattern.replace) {
                    cleaned = cleaned.replace(replace.src, replace.to);
                  }
                  const rendered = katex.renderToString(cleaned, this.config.katex);
                  stat.innerHTML = stat.innerHTML.replace(match, rendered);
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }
          stat.classList.add("mathed");
        }
      }
    }
  },

  function onDestroy () {
    const scripts = document.querySelectorAll("script[src]");
    for (const script of scripts) {
      if (script.src.includes("pleroma-mod-math") && !script.src.endsWith("mod.js")) {
        script.remove();
      }
    }

    const links = document.querySelectorAll("link[rel=\"stylesheet\"]");
    for (const link of links) {
      if (link.href.includes("pleroma-mod-math")) {
        link.remove();
      }
    }
  },

  function run () {
    PleromaModLoader.includeModCss("pleroma-mod-math/" + this.config.stylesheet);
    PleromaModLoader.includeModCss("pleroma-mod-math/katex.min.css");
    PleromaModLoader.includeModScript("pleroma-mod-math/katex.min.js").then(() => {
      this.ready = true;
    });
  }
].forEach((fn) => { PleromaModMath.prototype[fn.name] = fn; });

PleromaModLoader.registerMod(PleromaModMath);
