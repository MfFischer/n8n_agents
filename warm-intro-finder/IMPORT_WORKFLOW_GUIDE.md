# 📥 How to Import the Warm Intro Finder Workflow into n8n

## Step-by-Step Import Instructions

### Method 1: Import via n8n Interface (Recommended)

1. **Open your n8n instance**
   - Go to `http://localhost:5678`
   - Make sure n8n is running

2. **Access the Import Function**
   - Click on your profile/user icon in the top right
   - Select **"Import from file"** from the dropdown
   - OR use keyboard shortcut: `Ctrl+O` (Windows/Linux) or `Cmd+O` (Mac)

3. **Select the Workflow File**
   - Navigate to your project folder
   - Select `n8n-workflow/warm-intro-finder-import.json`
   - Click **"Open"**

4. **Import the Workflow**
   - n8n will show a preview of the workflow
   - Click **"Import"** to add it to your workflows
   - The workflow will appear in your workflows list

### Method 2: Copy-Paste Import

1. **Open the workflow file**
   - Open `n8n-workflow/warm-intro-finder-import.json` in a text editor
   - Select all content and copy (`Ctrl+A`, then `Ctrl+C`)

2. **Import in n8n**
   - In n8n, click your profile icon → **"Import from file"**
   - Click **"Import from text"** tab
   - Paste the workflow JSON
   - Click **"Import"**

### Method 3: Manual Creation (If import fails)

If the import doesn't work, you can create the workflow manually:

1. **Create New Workflow**
   - Click **"+ Add workflow"** in n8n
   - Name it "Warm Intro Finder"

2. **Add Nodes in Order:**

   **Node 1: Google Sheets Trigger**
   - Search for "Google Sheets Trigger"
   - Configure: Event = "Row Added", Sheet = "Leads"

   **Node 2: Code Node**
   - Search for "Code"
   - Copy the JavaScript code from the import file
   - Name it "Graph Matcher"

   **Node 3: IF Node**
   - Search for "IF"
   - Condition: `{{ $json.relationship_status }}` equals `warm_intro_possible`
   - Name it "Warm or Cold?"

   **Node 4: Slack Node (Warm)**
   - Search for "Slack"
   - Configure for warm intro notifications
   - Name it "Slack Warm Notification"

   **Node 5: Slack Node (Cold)**
   - Search for "Slack"
   - Configure for cold outreach notifications
   - Name it "Slack Cold Notification"

3. **Connect the Nodes:**
   - Google Sheets Trigger → Graph Matcher
   - Graph Matcher → Warm or Cold?
   - Warm or Cold? (True) → Slack Warm Notification
   - Warm or Cold? (False) → Slack Cold Notification

## Expected Workflow Layout

After import, you should see this workflow structure:

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  New Lead Added │───▶│ Graph Matcher│───▶│  Warm or Cold?  │
│ (Google Sheets) │    │    (Code)    │    │      (IF)       │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                     │
                                            ┌────────┴────────┐
                                            ▼                 ▼
                                   ┌─────────────────┐ ┌─────────────────┐
                                   │ Slack Warm      │ │ Slack Cold      │
                                   │ Notification    │ │ Notification    │
                                   └─────────────────┘ └─────────────────┘
```

## Troubleshooting Import Issues

### Issue: "Invalid workflow format"
**Solution:** Make sure you're using `warm-intro-finder-import.json` (not the original workflow file)

### Issue: "Missing credentials"
**Solution:** The workflow will import but show credential warnings. This is normal - you'll configure credentials next.

### Issue: "Node type not found"
**Solution:** Make sure your n8n instance has the required nodes:
- Google Sheets Trigger
- Code node
- IF node  
- Slack node

### Issue: Workflow appears but nodes are disconnected
**Solution:** 
1. Click on each node connection point
2. Drag to connect them manually following the layout above

## Next Steps After Import

1. **Configure Credentials**
   - Set up Google Sheets OAuth2 API credentials
   - Set up Slack OAuth2 API credentials

2. **Test the Workflow**
   - Click "Test workflow" button
   - Add a test lead to your Google Sheet
   - Verify the workflow executes

3. **Activate the Workflow**
   - Toggle the "Active" switch in the top right
   - The workflow will now run automatically

## Verification Checklist

After import, verify you have:
- ✅ 5 nodes total
- ✅ Google Sheets Trigger configured for "Leads" sheet
- ✅ Code node with graph matching logic
- ✅ IF node with warm/cold condition
- ✅ 2 Slack nodes with different messages
- ✅ All nodes properly connected
- ✅ Workflow named "Warm Intro Finder"

## Screenshots for README

After successful import, take screenshots of:
1. **Workflow Overview**: Full workflow with all 5 nodes
2. **Node Details**: Close-up of the Graph Matcher code
3. **Connections**: Show the branching logic from IF node
4. **Execution**: A successful test run

These screenshots will be perfect for the README documentation!

## Need Help?

If you encounter issues:
1. Check that n8n is running on `http://localhost:5678`
2. Verify you have the latest version of n8n
3. Try the manual creation method if import fails
4. Check the n8n logs for error details

The workflow is designed to be robust and should import cleanly into any standard n8n installation.
