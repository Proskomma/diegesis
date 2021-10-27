const path = require('path');
const fse = require('fs-extra');

if (process.argv.length !== 4) {
    console.log("USAGE: node make_json_module <varName> <jsonPath>");
    process.exit(1);
}

const json_string = JSON.stringify(JSON.stringify(fse.readJsonSync(path.resolve(process.argv[3]))));

console.log(
    `const ${process.argv[2]} = JSON.parse(${json_string});

export default ${process.argv[2]};
`);
