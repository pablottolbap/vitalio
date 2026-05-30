import fs from 'fs';
import path from 'path';

const contentDir = path.resolve('content');
const outputFile = path.resolve('src', 'data.json');

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
    return Array.isArray(parsed) ? parsed : [parsed];
  });

  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`✅ Sukces! Zbudowano bazę filmów. Liczba wpisów: ${allData.length}`);
} catch (error) {
  console.error("❌ Błąd podczas budowania bazy filmów:", error);
}