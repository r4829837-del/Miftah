#!/usr/bin/env node

/**
 * Script de vérification de santé pour l'application Appamine
 * Vérifie les configurations et dépendances essentielles
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de santé de l'application Appamine...\n');

// Vérification des fichiers essentiels
const essentialFiles = [
  'package.json',
  'src/App.tsx',
  'src/main.tsx',
  'src/lib/storage.ts',
  'src/lib/supabase.ts',
  'vite.config.ts'
];

console.log('📁 Vérification des fichiers essentiels...');
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MANQUANT`);
  }
});

// Vérification du fichier .env
console.log('\n🔐 Vérification de la configuration...');
if (fs.existsSync('.env')) {
  console.log('  ✅ Fichier .env trouvé');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('  ✅ Variables Supabase configurées');
  } else {
    console.log('  ⚠️  Variables Supabase manquantes');
    console.log('     Consultez CONFIGURATION_GUIDE.md pour plus d\\'infos');
  }
} else {
  console.log('  ⚠️  Fichier .env manquant');
  console.log('     Créez un fichier .env basé sur .env.example');
}

// Vérification des dépendances critiques
console.log('\n📦 Vérification des dépendances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const criticalDeps = [
    'react',
    'react-dom',
    'vite',
    '@vitejs/plugin-react',
    'typescript',
    '@supabase/supabase-js',
    'jspdf',
    'html2canvas',
    'chart.js',
    'lucide-react'
  ];
  
  criticalDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`  ✅ ${dep} (${dependencies[dep]})`);
    } else {
      console.log(`  ❌ ${dep} - MANQUANT`);
    }
  });
} catch (error) {
  console.log('  ❌ Erreur lors de la lecture de package.json');
}

// Vérification de la structure des composants
console.log('\n🧩 Vérification des composants principaux...');
const mainComponents = [
  'src/components/Reports.tsx',
  'src/components/Dashboard.tsx',
  'src/components/StudentManagement.tsx',
  'src/components/TestManagement.tsx',
  'src/components/Settings.tsx'
];

mainComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`  ✅ ${path.basename(component)}`);
  } else {
    console.log(`  ❌ ${path.basename(component)} - MANQUANT`);
  }
});

console.log('\n🎉 Vérification terminée !');
console.log('\n💡 Pour plus d\\'informations, consultez CONFIGURATION_GUIDE.md');