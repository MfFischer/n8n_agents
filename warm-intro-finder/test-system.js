#!/usr/bin/env node

/**
 * Warm Intro Finder System Test Script
 * 
 * This script validates the complete system setup and functionality
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  n8nUrl: 'http://localhost:5678',
  frontendUrl: 'http://localhost:3000',
  testTimeout: 30000
};

// Test data
const testLead = {
  name: "Test User",
  company: "Acme Corp",
  email: "test.user@acmecorp.com",
  title: "Test Manager"
};

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

// Test functions
async function testN8nConnection() {
  logInfo('Testing n8n connection...');
  try {
    const response = await axios.get(`${config.n8nUrl}/healthz`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      logSuccess('n8n is running and accessible');
      return true;
    }
  } catch (error) {
    logError(`n8n connection failed: ${error.message}`);
    logWarning('Make sure n8n is running on http://localhost:5678');
    return false;
  }
}

async function testFrontendConnection() {
  logInfo('Testing frontend connection...');
  try {
    const response = await axios.get(config.frontendUrl, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      logSuccess('Frontend is running and accessible');
      return true;
    }
  } catch (error) {
    logError(`Frontend connection failed: ${error.message}`);
    logWarning('Make sure to run "npm start" in the frontend directory');
    return false;
  }
}

function testFileStructure() {
  logInfo('Testing file structure...');
  
  const requiredFiles = [
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
    'README.md',
    'SETUP_GUIDE.md'
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

function testWorkflowStructure() {
  logInfo('Testing n8n workflow structure...');
  
  try {
    const workflowPath = 'n8n-workflow/warm-intro-finder-workflow.json';
    const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Check required nodes
    const requiredNodes = [
      'googleSheetsTrigger',
      'code', // Graph Matcher
      'if',   // Warm/Cold Router
      'slack' // Notifications
    ];
    
    const nodeTypes = workflow.nodes.map(node => node.type.split('.').pop());
    
    for (const requiredNode of requiredNodes) {
      if (nodeTypes.includes(requiredNode)) {
        logSuccess(`Found required node: ${requiredNode}`);
      } else {
        logError(`Missing required node: ${requiredNode}`);
        return false;
      }
    }
    
    // Check connections
    if (workflow.connections && Object.keys(workflow.connections).length > 0) {
      logSuccess('Workflow has node connections');
    } else {
      logError('Workflow missing node connections');
      return false;
    }
    
    logSuccess('Workflow structure is valid');
    return true;
    
  } catch (error) {
    logError(`Workflow validation failed: ${error.message}`);
    return false;
  }
}

function testSampleData() {
  logInfo('Testing sample data...');
  
  try {
    // Test leads data
    const leadsData = JSON.parse(fs.readFileSync('sample-data/leads-sample.json', 'utf8'));
    if (Array.isArray(leadsData) && leadsData.length > 0) {
      logSuccess(`Found ${leadsData.length} sample leads`);
    } else {
      logError('Invalid leads sample data');
      return false;
    }
    
    // Test contacts data
    const contactsData = JSON.parse(fs.readFileSync('sample-data/contacts-sample.json', 'utf8'));
    if (Array.isArray(contactsData) && contactsData.length > 0) {
      logSuccess(`Found ${contactsData.length} sample contacts`);
    } else {
      logError('Invalid contacts sample data');
      return false;
    }
    
    // Validate data structure
    const requiredLeadFields = ['name', 'company', 'email', 'title'];
    const requiredContactFields = ['name', 'company', 'email', 'relationship_type', 'connection_strength'];
    
    const leadSample = leadsData[0];
    for (const field of requiredLeadFields) {
      if (leadSample[field]) {
        logSuccess(`Lead data has required field: ${field}`);
      } else {
        logError(`Lead data missing field: ${field}`);
        return false;
      }
    }
    
    const contactSample = contactsData[0];
    for (const field of requiredContactFields) {
      if (contactSample[field]) {
        logSuccess(`Contact data has required field: ${field}`);
      } else {
        logError(`Contact data missing field: ${field}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    logError(`Sample data validation failed: ${error.message}`);
    return false;
  }
}

function testFrontendDependencies() {
  logInfo('Testing frontend dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    
    const requiredDeps = [
      'react',
      'react-dom',
      'axios',
      'lucide-react',
      'tailwindcss'
    ];
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of requiredDeps) {
      if (dependencies[dep]) {
        logSuccess(`Found dependency: ${dep}`);
      } else {
        logError(`Missing dependency: ${dep}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    logError(`Frontend dependencies check failed: ${error.message}`);
    return false;
  }
}

async function testGraphMatchingLogic() {
  logInfo('Testing graph matching logic...');
  
  try {
    // Simulate the matching logic from the workflow
    const contacts = JSON.parse(fs.readFileSync('sample-data/contacts-sample.json', 'utf8'));
    
    // Test case 1: Should find warm intro for Acme Corp
    const testLead1 = { company: "Acme Corp" };
    const matches1 = contacts.filter(contact => 
      contact.company.toLowerCase() === testLead1.company.toLowerCase()
    );
    
    if (matches1.length > 0) {
      logSuccess(`Found warm intro for ${testLead1.company}: ${matches1[0].name}`);
    } else {
      logError(`No warm intro found for ${testLead1.company}`);
      return false;
    }
    
    // Test case 2: Should not find warm intro for unknown company
    const testLead2 = { company: "Unknown Corp" };
    const matches2 = contacts.filter(contact => 
      contact.company.toLowerCase() === testLead2.company.toLowerCase()
    );
    
    if (matches2.length === 0) {
      logSuccess(`Correctly identified no warm intro for ${testLead2.company}`);
    } else {
      logError(`Incorrectly found warm intro for ${testLead2.company}`);
      return false;
    }
    
    // Test connection strength sorting
    const strengthOrder = { 'strong': 3, 'medium': 2, 'weak': 1 };
    const sortedContacts = contacts.sort((a, b) => 
      strengthOrder[b.connection_strength] - strengthOrder[a.connection_strength]
    );
    
    if (sortedContacts[0].connection_strength === 'strong') {
      logSuccess('Connection strength sorting works correctly');
    } else {
      logError('Connection strength sorting failed');
      return false;
    }
    
    return true;
    
  } catch (error) {
    logError(`Graph matching logic test failed: ${error.message}`);
    return false;
  }
}

function generateTestReport(results) {
  logInfo('Generating test report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    },
    tests: results
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  
  log('\n📊 Test Summary:', 'blue');
  log(`Total Tests: ${report.summary.total}`);
  log(`Passed: ${report.summary.passed}`, 'green');
  log(`Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'red' : 'green');
  
  if (report.summary.failed === 0) {
    log('\n🎉 All tests passed! Your Warm Intro Finder system is ready to use.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the issues above and refer to SETUP_GUIDE.md', 'yellow');
  }
  
  log(`\nDetailed report saved to: test-report.json`, 'blue');
}

// Main test runner
async function runTests() {
  log('🚀 Starting Warm Intro Finder System Tests\n', 'blue');
  
  const tests = [
    { name: 'File Structure', fn: testFileStructure },
    { name: 'Workflow Structure', fn: testWorkflowStructure },
    { name: 'Sample Data', fn: testSampleData },
    { name: 'Frontend Dependencies', fn: testFrontendDependencies },
    { name: 'Graph Matching Logic', fn: testGraphMatchingLogic },
    { name: 'n8n Connection', fn: testN8nConnection },
    { name: 'Frontend Connection', fn: testFrontendConnection }
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n--- Running ${test.name} Test ---`, 'yellow');
    
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed, error: null });
      
      if (passed) {
        logSuccess(`${test.name} test passed`);
      } else {
        logError(`${test.name} test failed`);
      }
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
      logError(`${test.name} test error: ${error.message}`);
    }
  }
  
  generateTestReport(results);
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
