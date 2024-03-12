#!/usr/bin/env node

const program = require('commander');
const fs = require('fs').promises;
const Handlebars = require('handlebars');
const path = require('path');
const parser = require('./parser');

const MD_TEMPLATE = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, './templates/md.hbs'), 'utf8')
);

async function generateDocs(content, outPath) {
  try {
    const { constructor, externalFunctions, viewFunctions, events, l1Handlers } = parser.parse(content);

    const formattedFileContent = MD_TEMPLATE({ constructor, externalFunctions, viewFunctions, events, l1Handlers });

    await fs.writeFile(outPath, formattedFileContent);
    console.log(`File written successfully to ${outPath}`);
  } catch (error) {
    console.error(error);
  }
}

program
  .description('Generate documentation for Cairo smart contracts')
  .arguments('<inputFile> [outputDir]')
  .option('-o, --outputDir <outputDir>', 'Directory to write the generated documentation to', '.')
  .action(async (inputFile, outputDir, defaults) => {
    outputDir = outputDir ?? defaults.outputDir;
    const sourceContent = await fs.readFile(inputFile, 'utf8');
    const outputFile = path.resolve(outputDir, `${path.basename(inputFile)}.md`);

    await generateDocs(sourceContent, outputFile);
  });

program.parse(process.argv);
