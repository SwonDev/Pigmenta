// Script de prueba para verificar el sistema de paletas personalizadas
// Ejecutar en la consola del navegador

console.log('🎨 Iniciando pruebas del sistema de paletas personalizadas...');

// Función para simular la creación de una paleta
function testCreatePalette() {
  console.log('📝 Probando creación de paleta...');
  
  // Simular datos de una paleta
  const testPalette = {
    id: 'test-palette-' + Date.now(),
    name: 'Paleta de Prueba',
    description: 'Una paleta creada para testing',
    colors: [
      { id: '1', value: '#FF6B6B', position: 0, name: 'Rojo Coral', locked: false },
      { id: '2', value: '#4ECDC4', position: 1, name: 'Turquesa', locked: false },
      { id: '3', value: '#45B7D1', position: 2, name: 'Azul Cielo', locked: false }
    ],
    tags: ['test', 'colores-vibrantes'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorCount: 3,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      author: 'Test User'
    }
  };
  
  try {
    // Intentar guardar en localStorage
    const existingData = localStorage.getItem('pigmenta-custom-palettes');
    let palettes = [];
    
    if (existingData) {
      const parsed = JSON.parse(existingData);
      palettes = parsed.palettes || [];
    }
    
    palettes.push(testPalette);
    
    const dataToSave = {
      version: '1.0.0',
      palettes: palettes,
      metadata: {
        totalPalettes: palettes.length,
        lastUpdated: new Date().toISOString(),
        storageSize: JSON.stringify(palettes).length
      },
      settings: {
        autoSave: true,
        maxPalettes: 100,
        compressionEnabled: false
      }
    };
    
    localStorage.setItem('pigmenta-custom-palettes', JSON.stringify(dataToSave));
    
    console.log('✅ Paleta creada y guardada exitosamente:', testPalette.name);
    console.log('📊 Total de paletas:', palettes.length);
    
    return testPalette;
  } catch (error) {
    console.error('❌ Error al crear paleta:', error);
    return null;
  }
}

// Función para verificar la carga de paletas
function testLoadPalettes() {
  console.log('📂 Probando carga de paletas...');
  
  try {
    const data = localStorage.getItem('pigmenta-custom-palettes');
    
    if (!data) {
      console.log('ℹ️ No hay paletas guardadas');
      return [];
    }
    
    const parsed = JSON.parse(data);
    const palettes = parsed.palettes || [];
    
    console.log('✅ Paletas cargadas exitosamente:', palettes.length);
    palettes.forEach((palette, index) => {
      console.log(`  ${index + 1}. ${palette.name} (${palette.colorCount} colores)`);
    });
    
    return palettes;
  } catch (error) {
    console.error('❌ Error al cargar paletas:', error);
    return [];
  }
}

// Función para limpiar datos de prueba
function cleanupTestData() {
  console.log('🧹 Limpiando datos de prueba...');
  
  try {
    const data = localStorage.getItem('pigmenta-custom-palettes');
    
    if (data) {
      const parsed = JSON.parse(data);
      const palettes = parsed.palettes || [];
      
      // Filtrar paletas de prueba
      const filteredPalettes = palettes.filter(p => !p.name.includes('Prueba') && !p.id.includes('test-'));
      
      if (filteredPalettes.length !== palettes.length) {
        const updatedData = {
          ...parsed,
          palettes: filteredPalettes,
          metadata: {
            ...parsed.metadata,
            totalPalettes: filteredPalettes.length,
            lastUpdated: new Date().toISOString()
          }
        };
        
        localStorage.setItem('pigmenta-custom-palettes', JSON.stringify(updatedData));
        console.log('✅ Datos de prueba eliminados');
      } else {
        console.log('ℹ️ No se encontraron datos de prueba para eliminar');
      }
    }
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Ejecutando suite de pruebas...\n');
  
  // Prueba 1: Cargar paletas existentes
  const existingPalettes = testLoadPalettes();
  console.log('');
  
  // Prueba 2: Crear nueva paleta
  const newPalette = testCreatePalette();
  console.log('');
  
  // Prueba 3: Verificar que se guardó correctamente
  if (newPalette) {
    const updatedPalettes = testLoadPalettes();
    const found = updatedPalettes.find(p => p.id === newPalette.id);
    
    if (found) {
      console.log('✅ Verificación exitosa: La paleta se guardó correctamente');
    } else {
      console.log('❌ Error: La paleta no se encontró después de guardar');
    }
  }
  
  console.log('\n🎯 Pruebas completadas');
  console.log('💡 Para limpiar los datos de prueba, ejecuta: cleanupTestData()');
}

// Exponer funciones globalmente para uso manual
window.testCustomPalettes = {
  runTests,
  testCreatePalette,
  testLoadPalettes,
  cleanupTestData
};

// Ejecutar pruebas automáticamente
runTests();