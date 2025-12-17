const fs = require('fs');
const path = require('path');

// CONFIGURACIÓ
const carpetaOrigen = './src';
const arxiuSortida = 'PROJECTE_COMPLET.txt';
// Extensions a ignorar (imatges, fonts, etc.)
const extensionsIgnorar = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];

function llegirDirectori(directori, llistaArxius = []) {
  const arxius = fs.readdirSync(directori);

  arxius.forEach((arxiu) => {
    const rutaCompleta = path.join(directori, arxiu);
    const estat = fs.statSync(rutaCompleta);

    if (estat.isDirectory()) {
      llegirDirectori(rutaCompleta, llistaArxius);
    } else {
      // Comprovem si l'extensió està a la llista d'ignorar
      const ext = path.extname(arxiu).toLowerCase();
      if (!extensionsIgnorar.includes(ext) && arxiu !== '.DS_Store') {
        llistaArxius.push(rutaCompleta);
      }
    }
  });

  return llistaArxius;
}

function generarTxt() {
  console.log('🔄 Llegint arxius de /src...');
  
  try {
    const totsElsArxius = llegirDirectori(carpetaOrigen);
    let contingutFinal = '';

    totsElsArxius.forEach((ruta) => {
      const contingutArxiu = fs.readFileSync(ruta, 'utf-8');
      
      // Afegim una capçalera per saber de quin arxiu és el codi
      contingutFinal += '\n' + '='.repeat(50) + '\n';
      contingutFinal += ` ARXIU: ${ruta}\n`;
      contingutFinal += '='.repeat(50) + '\n\n';
      contingutFinal += contingutArxiu + '\n';
    });

    fs.writeFileSync(arxiuSortida, contingutFinal);
    console.log(`✅ Fet! S'ha creat l'arxiu "${arxiuSortida}" amb tot el codi.`);
    
  } catch (error) {
    console.error('❌ Hi ha hagut un error:', error.message);
  }
}

generarTxt();