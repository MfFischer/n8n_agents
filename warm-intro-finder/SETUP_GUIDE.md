# 🚀 Warm Intro Finder Setup Guide

This guide will walk you through setting up the complete Warm Intro Finder system step by step.

## Prerequisites Checklist

- [ ] n8n instance running on `http://localhost:5678`
- [ ] Node.js 16+ installed
- [ ] Google account with Sheets API access
- [ ] Slack workspace with admin permissions
- [ ] Basic familiarity with n8n workflows

## Step 1: n8n Workflow Setup

### 1.1 Import the Workflow

1. Open n8n at `http://localhost:5678`
2. Click "Import from File" or use Ctrl+O
3. Select `n8n-workflow/warm-intro-finder-workflow.json`
4. The workflow will be imported with all nodes

### 1.2 Configure Google Sheets Credentials

1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential** → **Google Sheets OAuth2 API**
3. Follow Google OAuth setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:5678/rest/oauth2-credential/callback` as redirect URI
4. Copy Client ID and Client Secret to n8n
5. Complete OAuth flow

### 1.3 Configure Slack Credentials

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new Slack app
3. Add OAuth scopes:
   - `chat:write`
   - `channels:read`
   - `groups:read`
4. Install app to workspace
5. Copy Bot User OAuth Token
6. In n8n, add **Slack OAuth2 API** credential
7. Paste the Bot Token

### 1.4 Update Workflow Configuration

1. Open the imported workflow
2. Click on **Google Sheets Trigger** node
3. Select your Google Sheets credential
4. Choose the spreadsheet (create one first if needed)
5. Set sheet name to "Leads"
6. Click on **Slack** nodes
7. Select your Slack credential
8. Set channel to `#sales-alerts` (or create this channel)

## Step 2: Google Sheets Setup

### 2.1 Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Warm Intro Finder"
3. Create 3 sheets with these exact names:
   - `Leads`
   - `Contacts` 
   - `Error Log`

### 2.2 Setup Sheet Headers

**Leads Sheet (Sheet 1):**
```
A1: Name
B1: Company  
C1: Email
D1: Title
E1: Added Date
F1: Status
G1: Relationship Status
H1: Connection Details
I1: Notes
```

**Contacts Sheet (Sheet 2):**
```
A1: Name
B1: Company
C1: Email
D1: Title
E1: Relationship Type
F1: Connection Strength
G1: Last Contact
H1: Notes
```

**Error Log Sheet (Sheet 3):**
```
A1: Timestamp
B1: Lead Name
C1: Error Type
D1: Error Message
E1: Status
```

### 2.3 Add Sample Contact Data

Copy data from `sample-data/contacts-sample.json` into the Contacts sheet:

| Name | Company | Email | Title | Relationship Type | Connection Strength | Last Contact | Notes |
|------|---------|-------|-------|------------------|-------------------|--------------|-------|
| Alice Thompson | Acme Corp | alice.thompson@acmecorp.com | Director of Engineering | former_colleague | strong | 2023-12-10 | Worked together at previous company for 3 years |
| Bob Wilson | TechStart Inc | bob.wilson@techstart.com | Senior Developer | university_friend | medium | 2023-11-15 | College roommate, stays in touch occasionally |
| Carol Davis | DataFlow Systems | carol.davis@dataflow.com | VP of Operations | industry_contact | medium | 2023-10-20 | Met at industry conference, exchanged business cards |
| Emma Foster | CloudVision Ltd | emma.foster@cloudvision.com | Senior Manager | mutual_connection | weak | 2023-09-05 | Connected through LinkedIn mutual friend |
| Henry Kim | InnovateLab | henry.kim@innovatelab.com | Co-founder | investor_network | medium | 2023-11-30 | Met through investor network events |

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment

Create `frontend/.env`:
```env
REACT_APP_N8N_WEBHOOK_URL=http://localhost:5678/webhook/warm-intro-finder
REACT_APP_API_BASE_URL=http://localhost:5678
```

### 3.3 Start the Frontend

```bash
npm start
```

The app will open at `http://localhost:3000`

## Step 4: Test the System

### 4.1 Activate the Workflow

1. In n8n, open the workflow
2. Click the **Activate** toggle in the top right
3. Verify the status shows "Active"

### 4.2 Test with Sample Lead

1. Open the frontend at `http://localhost:3000`
2. Go to "Add Lead" tab
3. Use the "Quick Fill" sample data or enter:
   - **Name**: John Smith
   - **Company**: Acme Corp
   - **Email**: john.smith@acmecorp.com
   - **Title**: VP of Sales
4. Click "Add Lead"

### 4.3 Verify Results

1. **n8n Execution**: Check workflow execution in n8n
2. **Google Sheets**: Verify lead appears in Leads sheet
3. **Slack**: Check for notification in #sales-alerts
4. **Frontend**: See lead in Dashboard and Leads list

Expected result: Should show "Warm Intro Available" with Alice Thompson connection.

## Step 5: Slack Channel Setup

### 5.1 Create Sales Alerts Channel

1. In Slack, create channel `#sales-alerts`
2. Add your Slack bot to the channel
3. Test by running the workflow

### 5.2 Customize Notifications

Edit the Slack node messages in n8n to match your team's style:

**Warm Intro Message:**
```
🔥 *Warm Intro Opportunity!*

*Lead:* {{ $json.Name }} ({{ $json.Title }})
*Company:* {{ $json.Company }}
*Email:* {{ $json.Email }}

*Connection:* {{ $json.connection_details }}
*Strength:* {{ $json.connection_strength }}

*Suggested Intro Message:*
{{ $json.intro_message_template }}

_Time to make that warm introduction! 🤝_
```

## Step 6: Troubleshooting

### Common Issues

**Workflow not triggering:**
- Check Google Sheets credentials
- Verify sheet name is exactly "Leads"
- Ensure workflow is activated

**Slack notifications not working:**
- Verify bot token permissions
- Check channel name matches exactly
- Ensure bot is added to channel

**Frontend not connecting:**
- Check n8n is running on port 5678
- Verify environment variables
- Check browser console for errors

### Debug Steps

1. **Check n8n logs**: View execution details in n8n
2. **Test nodes individually**: Use "Execute Node" in n8n
3. **Verify credentials**: Test API connections
4. **Check sample data**: Ensure contacts sheet has data

## Step 7: Customization

### 7.1 Add Your Real Network Data

Replace sample contacts with your actual network:
1. Export LinkedIn connections
2. Format according to contacts schema
3. Update Google Sheets
4. Test with real scenarios

### 7.2 Customize Matching Logic

Edit the Code node in n8n to:
- Add more sophisticated matching
- Include additional relationship types
- Implement scoring algorithms
- Add company domain matching

### 7.3 Extend Notifications

Add more notification channels:
- Email notifications
- Teams integration
- Discord webhooks
- SMS alerts

## Step 8: Production Considerations

### 8.1 Security

- Use environment variables for credentials
- Implement proper OAuth scopes
- Regular credential rotation
- Audit access logs

### 8.2 Scaling

- Consider database instead of Google Sheets
- Implement rate limiting
- Add error retry logic
- Monitor performance metrics

### 8.3 Compliance

- Review data handling practices
- Implement data retention policies
- Add consent management
- Regular security audits

## 🎉 You're All Set!

Your Warm Intro Finder is now ready to automatically identify warm introduction opportunities and streamline your sales process.

### Next Steps

1. Add your real network data
2. Customize notification templates
3. Train your team on the system
4. Monitor and optimize performance
5. Explore advanced features

### Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review n8n execution logs
3. Verify all credentials are working
4. Test with the provided sample data first

Happy networking! 🚀
