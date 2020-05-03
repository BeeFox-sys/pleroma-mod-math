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
      [ "<code>", "<\\/code>", "<code>", "</code>", ".*\\\\.*" ],
      [ "\\\\\\(", "\\\\\\)", "\\(", "\\)", ".+" ]
    ]
  };
  this.ready = false;
}
[
  function onMutation (mutation) {
    if (mutation.target.querySelector) {
      const statuses = mutation.target.querySelectorAll(".status-content");
      for (const stat of statuses) {
        if (
          this.ready &&
          !stat.classList.contains("mathed") &&
          stat.innerHTML
        ) {
          for (const pattern of this.config.matcher) {
            const regex = new RegExp(pattern[0] + "(?:(?!" + pattern[1] + ")" + pattern[4] + ")" + pattern[1], "gi");
            const matches = stat.innerHTML.match(regex);
            if (matches) {
              for (const match of matches) {
                try {
                  const domParser = new DOMParser();
                  const cleaned = domParser.parseFromString(match, "text/html").body.textContent.replace(pattern[2], "").replace(pattern[3], "");
                  console.log(cleaned);
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

  function run () {
    PleromaModLoader.includeModCss("pleroma-mod-math/" + this.config.stylesheet);
    PleromaModLoader.includeModCss("pleroma-mod-math/katex.min.css");
    PleromaModLoader.includeModScript("pleroma-mod-math/katex.min.js").then(() => {
      console.log("katex loaded");
      this.ready = true;
    });
  }
].forEach((fn) => { PleromaModMath.prototype[fn.name] = fn; });

PleromaModLoader.registerMod(PleromaModMath);
