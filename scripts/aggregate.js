// Build script: aggregates all JSON files from content/ directory into a single data.json file.
// Run at build time (vite.config.js includes this) to generate the data source for the React app.
import fs from 'fs';
import path from 'path';

const contentDir = path.resolve('content');
const outputFile = path.resolve('src', 'data.json');

/**
 * Recursively find all JSON files in a directory tree.
 * @param {string} dir - Directory to search
 * @param {string[]} [filesList=[]] - Accumulator array for results
 * @returns {string[]} - Array of absolute paths to all .json files found
 */
function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else if (fullPath.endsWith('.json')) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

try {
  const allFiles = getFiles(contentDir);

  const allData = allFiles.flatMap(file => {
    const rawData = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(rawData);
    // Handle both array (modern) and single-object (legacy) file formats
    return Array.isArray(parsed) ? parsed : [parsed];
  });

  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`✅ Success! Built materials database. Total entries: ${allData.length}`);
} catch (error) {
  console.error("❌ Error building materials database:", error);
}