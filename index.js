const css = require('css');
const fetch = require('node-fetch');
const fs = require('fs');

const sources = [
  'https://assets-cdn.github.com/assets/frameworks-d7137690e30123bade38abb082ac79f36cc7a105ff92e602405f53b725465cab.css',
  'https://assets-cdn.github.com/assets/github-0ec8f40f7a33631b4b47f16538de5390d1bf9c7e896e7571eaa87e78159a92ef.css',
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
            rule.declarations.some(d => d.value.includes('monospace'))
          ) {
            return memo.concat(rule.selectors)
          } else {
            return memo;
          }
        }, []);
      })
    )
  );

  const out =
    `${selectors.join(',\n')} {\n  font-family: "Operator Mono" !important;\n}`;

  fs.writeFileSync('out.css', out);
})();

function flatten(arrays) {
  return arrays.reduce((a, b) => a.concat(b));
}
