#!/usr/bin/env node

/**
 * Test script to verify the n8n workflow import file is valid
 */

const fs = require('fs');

function validateWorkflowImport() {
  console.log('🔍 Validating n8n workflow import file...\n');
  
  try {
    // Read the import file
    const importFile = 'n8n-workflow/warm-intro-finder-import.json';
    const workflow = JSON.parse(fs.readFileSync(importFile, 'utf8'));
    
    // Check basic structure
    console.log('✅ JSON is valid');
    
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Missing or invalid nodes array');
    }
    console.log(`✅ Found ${workflow.nodes.length} nodes`);
    
    if (!workflow.connections || typeof workflow.connections !== 'object') {
      throw new Error('Missing or invalid connections object');
    }
    console.log('✅ Connections object is valid');
    
    // Check required nodes
    const nodeTypes = workflow.nodes.map(node => node.type);
    const requiredTypes = [
      'n8n-nodes-base.googleSheetsTrigger',
      'n8n-nodes-base.code',
      'n8n-nodes-base.if',
      'n8n-nodes-base.slack'
    ];
    
    for (const type of requiredTypes) {
      if (nodeTypes.includes(type)) {
        console.log(`✅ Found required node: ${type.split('.').pop()}`);
      } else {
        throw new Error(`Missing required node type: ${type}`);
      }
    }
    
    // Check node names
    const nodeNames = workflow.nodes.map(node => node.name);
    const expectedNames = [
      'New Lead Added',
      'Graph Matcher', 
      'Warm or Cold?',
      'Slack Warm Notification',
      'Slack Cold Notification'
    ];
    
    for (const name of expectedNames) {
      if (nodeNames.includes(name)) {
        console.log(`✅ Found node: "${name}"`);
      } else {
        console.log(`⚠️  Node name not found: "${name}"`);
      }
    }
    
    // Check connections
    const connectionCount = Object.keys(workflow.connections).length;
    if (connectionCount >= 3) {
      console.log(`✅ Found ${connectionCount} node connections`);
    } else {
      throw new Error('Insufficient node connections');
    }
    
    // Check for Graph Matcher code
    const codeNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.code');
    if (codeNode && codeNode.parameters && codeNode.parameters.jsCode) {
      const codeLength = codeNode.parameters.jsCode.length;
      console.log(`✅ Graph Matcher code found (${codeLength} characters)`);
      
      // Check for key code elements
      const code = codeNode.parameters.jsCode;
      if (code.includes('contacts.filter') && code.includes('relationship_status')) {
        console.log('✅ Graph matching logic is present');
      } else {
        console.log('⚠️  Graph matching logic may be incomplete');
      }
    } else {
      throw new Error('Graph Matcher code node missing or invalid');
    }
    
    console.log('\n🎉 Workflow import file is valid and ready for n8n!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:5678 in your browser');
    console.log('2. Click profile icon → "Import from file"');
    console.log('3. Select n8n-workflow/warm-intro-finder-import.json');
    console.log('4. Click "Import" to add the workflow');
    console.log('5. Configure Google Sheets and Slack credentials');
    console.log('6. Activate the workflow and test!');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Validation failed: ${error.message}`);
    console.log('\nPlease check the workflow file and try again.');
    return false;
  }
}

// Run validation
if (require.main === module) {
  const isValid = validateWorkflowImport();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateWorkflowImport };
