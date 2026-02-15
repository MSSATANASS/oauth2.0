const { LinearClient } = require('@linear/sdk');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../linear-mcp/.env') });

const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('🔄 Fetching assigned issues from Linear...');
  
  try {
    const me = await linear.viewer;
    const myIssues = await me.assignedIssues({
      filter: {
        state: { name: { eq: "In Progress" } } // Or "Todo"
      }
    });

    if (myIssues.nodes.length === 0) {
      console.log('✅ No issues found in "In Progress". Checking "Todo"...');
      // Fetch Todo if no In Progress
      // ... (simplified for demo)
    }

    const issues = myIssues.nodes;
    console.log('\n📋 Your Active Issues:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.identifier}] ${issue.title} (Priority: ${issue.priorityLabel})`);
    });

    if (issues.length === 0) {
      console.log('No issues found.');
      rl.close();
      return;
    }

    rl.question('\nSelect issue number to start working on: ', async (answer) => {
      const index = parseInt(answer) - 1;
      if (index >= 0 && index < issues.length) {
        const selectedIssue = issues[index];
        await startWorkflow(selectedIssue);
      } else {
        console.log('Invalid selection.');
      }
      rl.close();
    });

  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

async function startWorkflow(issue) {
  const branchName = `feat/${issue.identifier}-${issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  
  console.log(`\n🚀 Starting workflow for ${issue.identifier}...`);
  
  // 1. Create Git Branch
  try {
    console.log(`Checking out branch: ${branchName}`);
    execSync(`git checkout -b ${branchName}`);
  } catch (e) {
    console.log(`Branch might already exist or error: ${e.message.split('\n')[0]}`);
    try {
        execSync(`git checkout ${branchName}`);
    } catch (e2) {}
  }

  // 2. Create Spec File
  const specDir = path.join(__dirname, '../docs/specs');
  if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });
  
  const specFile = path.join(specDir, `${issue.identifier}.md`);
  if (!fs.existsSync(specFile)) {
    const template = `# Spec: ${issue.title}
**Linear Issue**: [${issue.identifier}](${issue.url})
**Status**: In Progress

## Context
${issue.description || 'No description provided.'}

## Implementation Plan
- [ ] Analysis
- [ ] Implementation
- [ ] Testing
`;
    fs.writeFileSync(specFile, template);
    console.log(`📄 Created spec file: ${specFile}`);
  } else {
    console.log(`📄 Spec file already exists: ${specFile}`);
  }

  // 3. Update Linear Status (Optional - requires status ID lookup)
  // console.log('Updating Linear status to "In Progress"...');
  
  console.log('\n✅ Workflow Ready!');
  console.log(`1. You are on branch '${branchName}'`);
  console.log(`2. Spec file created at 'docs/specs/${issue.identifier}.md'`);
  console.log(`3. Run 'npm run dev' to start coding.`);
}

main();
