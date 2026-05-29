import fs from 'fs';
import path from 'path';

// Ścieżki do folderu z treściami i pliku wynikowego
const contentDir = path.resolve('content');
const outputFile = path.resolve('src', 'data.json');

// Rekursywna funkcja do znajdowania wszystkich plików .json
function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList); // Jeśli to folder, wejdź głębiej
    } else if (fullPath.endsWith('.json')) {
      filesList.push(fullPath); // Jeśli to JSON, dodaj do listy
    }
  }
  return filesList;
}

try {
  const allFiles = getFiles(contentDir);

  // Pobieranie danych z każdego pliku i parsowanie ich.
  // Każdy plik to kanał YouTube zawierający tablicę materiałów,
  // więc spłaszczamy wszystkie tablice do jednej listy.
  const allData = allFiles.flatMap(file => {
    const rawData = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [parsed];
  });

  // Zapis do jednego pliku w folderze src
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`✅ Sukces! Zbudowano bazę filmów. Liczba wpisów: ${allData.length}`);
} catch (error) {
  console.error("❌ Błąd podczas budowania bazy filmów:", error);
}