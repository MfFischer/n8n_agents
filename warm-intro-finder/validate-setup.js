#!/usr/bin/env node

/**
 * Simple validation script for Warm Intro Finder setup
 * No external dependencies required
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function validateFileStructure() {
  logInfo('Validating file structure...');
  
  const requiredFiles = [
    'README.md',
    'SETUP_GUIDE.md',
    'package.json',
    'n8n-workflow/warm-intro-finder-workflow.json',
    'sample-data/leads-sample.json',
    'sample-data/contacts-sample.json',
    'sample-data/google-sheets-structure.md',
    'frontend/package.json',
    'frontend/src/App.js',
    'frontend/src/components/Dashboard.js',
    'frontend/src/components/LeadForm.js',
    'frontend/src/components/LeadsList.js',
    'frontend/src/components/NetworkGraph.js',
    'frontend/src/index.js',
    'frontend/src/index.css',
    'frontend/public/index.html',
    'frontend/tailwind.config.js'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

function validateWorkflow() {
  logInfo('Validating n8n workflow...');
  
  try {
    const workflowPath = 'n8n-workflow/warm-intro-finder-workflow.json';
    const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Check basic structure
    if (!workflow.name) {
      logError('Workflow missing name');
      return false;
    }
    
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      logError('Workflow missing nodes array');
      return false;
    }
    
    if (!workflow.connections || typeof workflow.connections !== 'object') {
      logError('Workflow missing connections object');
      return false;
    }
    
    logSuccess(`Workflow "${workflow.name}" has ${workflow.nodes.length} nodes`);
    
    // Check for required node types
    const nodeTypes = workflow.nodes.map(node => node.type);
    const requiredTypes = [
      'n8n-nodes-base.googleSheetsTrigger',
      'n8n-nodes-base.code',
      'n8n-nodes-base.if',
      'n8n-nodes-base.slack'
    ];
    
    for (const type of requiredTypes) {
      if (nodeTypes.includes(type)) {
        logSuccess(`Found required node type: ${type.split('.').pop()}`);
      } else {
        logError(`Missing required node type: ${type.split('.').pop()}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    logError(`Workflow validation failed: ${error.message}`);
    return false;
  }
}

function validateSampleData() {
  logInfo('Validating sample data...');
  
  try {
    // Validate leads data
    const leadsData = JSON.parse(fs.readFileSync('sample-data/leads-sample.json', 'utf8'));
    if (!Array.isArray(leadsData) || leadsData.length === 0) {
      logError('Invalid leads sample data');
      return false;
    }
    
    const leadSample = leadsData[0];
    const requiredLeadFields = ['name', 'company', 'email', 'title'];
    for (const field of requiredLeadFields) {
      if (!leadSample[field]) {
        logError(`Lead sample missing field: ${field}`);
        return false;
      }
    }
    
    logSuccess(`Found ${leadsData.length} sample leads with valid structure`);
    
    // Validate contacts data
    const contactsData = JSON.parse(fs.readFileSync('sample-data/contacts-sample.json', 'utf8'));
    if (!Array.isArray(contactsData) || contactsData.length === 0) {
      logError('Invalid contacts sample data');
      return false;
    }
    
    const contactSample = contactsData[0];
    const requiredContactFields = ['name', 'company', 'email', 'relationship_type', 'connection_strength'];
    for (const field of requiredContactFields) {
      if (!contactSample[field]) {
        logError(`Contact sample missing field: ${field}`);
        return false;
      }
    }
    
    logSuccess(`Found ${contactsData.length} sample contacts with valid structure`);
    
    return true;
    
  } catch (error) {
    logError(`Sample data validation failed: ${error.message}`);
    return false;
  }
}

function validateFrontend() {
  logInfo('Validating frontend structure...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    
    // Check required dependencies
    const requiredDeps = ['react', 'react-dom', 'lucide-react', 'tailwindcss'];
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of requiredDeps) {
      if (dependencies[dep]) {
        logSuccess(`Found dependency: ${dep}`);
      } else {
        logError(`Missing dependency: ${dep}`);
        return false;
      }
    }
    
    // Check component files
    const componentFiles = [
      'frontend/src/components/Dashboard.js',
      'frontend/src/components/LeadForm.js',
      'frontend/src/components/LeadsList.js',
      'frontend/src/components/NetworkGraph.js'
    ];
    
    for (const file of componentFiles) {
      if (fs.existsSync(file)) {
        logSuccess(`Found component: ${path.basename(file)}`);
      } else {
        logError(`Missing component: ${path.basename(file)}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    logError(`Frontend validation failed: ${error.message}`);
    return false;
  }
}

function validateGraphLogic() {
  logInfo('Validating graph matching logic...');
  
  try {
    const contacts = JSON.parse(fs.readFileSync('sample-data/contacts-sample.json', 'utf8'));
    
    // Test matching logic
    const testCompany = "Acme Corp";
    const matches = contacts.filter(contact => 
      contact.company.toLowerCase() === testCompany.toLowerCase()
    );
    
    if (matches.length > 0) {
      logSuccess(`Graph matching works: Found ${matches.length} contact(s) at ${testCompany}`);
      
      // Test connection strength sorting
      const strengthOrder = { 'strong': 3, 'medium': 2, 'weak': 1 };
      const sorted = matches.sort((a, b) => 
        strengthOrder[b.connection_strength] - strengthOrder[a.connection_strength]
      );
      
      logSuccess(`Best connection: ${sorted[0].name} (${sorted[0].connection_strength})`);
      return true;
    } else {
      logError(`Graph matching failed: No contacts found at ${testCompany}`);
      return false;
    }
    
  } catch (error) {
    logError(`Graph logic validation failed: ${error.message}`);
    return false;
  }
}

function generateReport(results) {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  log('\n' + '='.repeat(50), 'blue');
  log('📊 VALIDATION REPORT', 'blue');
  log('='.repeat(50), 'blue');
  
  log(`\nTests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All validations passed!', 'green');
    log('Your Warm Intro Finder system is properly set up.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Follow SETUP_GUIDE.md to configure n8n and credentials');
    log('2. Run "cd frontend && npm install && npm start" to start the frontend');
    log('3. Import the workflow into your n8n instance');
    log('4. Test with sample data');
  } else {
    log('\n⚠️  Some validations failed.', 'yellow');
    log('Please check the errors above and ensure all files are present.', 'yellow');
  }
  
  log('\nFor detailed setup instructions, see SETUP_GUIDE.md', 'blue');
}

// Main validation function
function runValidation() {
  log('🚀 Warm Intro Finder - System Validation\n', 'blue');
  
  const tests = [
    { name: 'File Structure', fn: validateFileStructure },
    { name: 'n8n Workflow', fn: validateWorkflow },
    { name: 'Sample Data', fn: validateSampleData },
    { name: 'Frontend Structure', fn: validateFrontend },
    { name: 'Graph Logic', fn: validateGraphLogic }
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n--- ${test.name} ---`, 'yellow');
    
    try {
      const passed = test.fn();
      results.push({ name: test.name, passed });
      
      if (passed) {
        logSuccess(`${test.name} validation passed`);
      } else {
        logError(`${test.name} validation failed`);
      }
    } catch (error) {
      results.push({ name: test.name, passed: false });
      logError(`${test.name} validation error: ${error.message}`);
    }
  }
  
  generateReport(results);
}

// Run validation
runValidation();
