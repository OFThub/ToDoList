#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run with: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function check(condition, message) {
  if (condition) {
    console.log('✅ ' + message);
    checks.push(true);
  } else {
    console.log('❌ ' + message);
    checks.push(false);
  }
}

console.log('\n🔍 Verifying Deployment Setup...\n');

// Check Netlify config
check(
  fs.existsSync('netlify.toml'),
  'netlify.toml exists'
);

// Check .env files
check(
  fs.existsSync('frontend/.env.example'),
  'frontend/.env.example exists'
);

check(
  fs.existsSync('backend/.env.example'),
  'backend/.env.example exists'
);

// Check package.json scripts
const rootPkg = JSON.parse(fs.readFileSync('package.json'));
check(
  rootPkg.scripts.dev && rootPkg.scripts.build,
  'Root package.json has dev and build scripts'
);

const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json'));
check(
  frontendPkg.scripts.dev && frontendPkg.scripts.build,
  'Frontend has dev and build scripts'
);

const backendPkg = JSON.parse(fs.readFileSync('backend/package.json'));
check(
  backendPkg.scripts.dev && backendPkg.scripts.start,
  'Backend has dev and start scripts'
);

// Check documentation
check(
  fs.existsSync('QUICK_START.md'),
  'QUICK_START.md exists'
);

check(
  fs.existsSync('DEPLOYMENT_GUIDE.md'),
  'DEPLOYMENT_GUIDE.md exists'
);

// Check source files
check(
  fs.existsSync('frontend/src/services/api/axios.js'),
  'Axios configuration exists'
);

const axiosContent = fs.readFileSync('frontend/src/services/api/axios.js', 'utf8');
check(
  axiosContent.includes('import.meta.env.VITE_API_BASE_URL'),
  'API client uses environment variables'
);

// Summary
const passed = checks.filter(c => c).length;
const total = checks.length;

console.log(`\n${'='.repeat(50)}`);
console.log(`✅ Setup Verification: ${passed}/${total} checks passed`);
console.log(`${'='.repeat(50)}\n`);

if (passed === total) {
  console.log('🎉 Your project is ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Read QUICK_START.md for setup instructions');
  console.log('2. Read DEPLOYMENT_GUIDE.md for deployment details');
  console.log('3. Test locally: npm run dev');
  console.log('4. Deploy frontend to Netlify');
  console.log('5. Deploy backend to Railway/Render/Heroku');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Review the items above.');
  process.exit(1);
}
