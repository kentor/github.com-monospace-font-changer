const css = require('css');
const fetch = require('node-fetch');
const fs = require('fs');

const sources = [
  'https://assets-cdn.github.com/assets/frameworks-5aa6d9885579bb2359f66266aee26f3b.css',
  'https://assets-cdn.github.com/assets/github-558080f77c5e1ef1c73e9aac93ccfb39.css',
];

(async () => {
  const selectors = flatten(
    await Promise.all(
      sources.map(async (source) => {
        const response = await fetch(source);
        const data = await response.text();
        const obj = css.parse(data);
        return obj.stylesheet.rules.reduce((memo, rule) => {
          if (
            rule.declarations &&
            rule.declarations.some((d) => d.value.includes('monospace'))
          ) {
            return memo.concat(rule.selectors);
          } else {
            return memo;
          }
        }, []);
      })
    )
  );

  const formattedSelectors = [...new Set(selectors)]
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .join(',\n');

  const out = `${formattedSelectors} {\n  font-family: "Dank Mono", "Operator Mono" !important;\n}`;

  fs.writeFileSync('out.css', `/* Last Generated ${new Date()} */\n${out}`);
})();

function flatten(arrays) {
  return arrays.reduce((a, b) => a.concat(b));
}
