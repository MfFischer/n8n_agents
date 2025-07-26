# Google Sheets Structure for Warm Intro Finder

## Sheet 1: "Leads" 
**Purpose**: New leads to be processed for warm intro opportunities

| Column | Field Name | Type | Description | Example |
|--------|------------|------|-------------|---------|
| A | Name | Text | Full name of the lead | John Smith |
| B | Company | Text | Company name | Acme Corp |
| C | Email | Email | Contact email | john.smith@acmecorp.com |
| D | Title | Text | Job title | VP of Sales |
| E | Added Date | Date | When lead was added | 2024-01-15 |
| F | Status | Text | Processing status | new/processing/completed |
| G | Relationship Status | Text | Warm/Cold result | warm_intro_possible/cold_outreach |
| H | Connection Details | Text | Who can make intro | Alice Thompson (former_colleague) |
| I | Notes | Text | Additional context | Strong connection, worked together 3 years |

## Sheet 2: "Contacts" 
**Purpose**: Your network graph - people you know at various companies

| Column | Field Name | Type | Description | Example |
|--------|------------|------|-------------|---------|
| A | Name | Text | Contact's full name | Alice Thompson |
| B | Company | Text | Their company | Acme Corp |
| C | Email | Email | Contact email | alice.thompson@acmecorp.com |
| D | Title | Text | Their job title | Director of Engineering |
| E | Relationship Type | Text | How you know them | former_colleague |
| F | Connection Strength | Text | Relationship strength | strong/medium/weak |
| G | Last Contact | Date | Last interaction | 2023-12-10 |
| H | Notes | Text | Relationship context | Worked together at previous company |

## Sheet 3: "Error Log" 
**Purpose**: Track any processing errors for debugging

| Column | Field Name | Type | Description | Example |
|--------|------------|------|-------------|---------|
| A | Timestamp | DateTime | When error occurred | 2024-01-15 14:30:00 |
| B | Lead Name | Text | Lead being processed | John Smith |
| C | Error Type | Text | Type of error | API_ERROR |
| D | Error Message | Text | Detailed error | Failed to fetch contacts data |
| E | Status | Text | Resolution status | open/resolved |

## Sample Data Setup Instructions

1. Create a new Google Sheet with 3 tabs named: "Leads", "Contacts", "Error Log"
2. Add the column headers as specified above
3. Populate "Contacts" sheet with your network data
4. Leave "Leads" sheet with just headers (workflow will populate)
5. Leave "Error Log" sheet with just headers (workflow will populate)
6. Share the sheet with your n8n service account for API access

## Airtable Alternative Structure

If using Airtable instead:
- Create a base called "Warm Intro Finder"
- Create tables: "Leads", "Contacts", "Error Log" 
- Use the same field structure but leverage Airtable's field types:
  - Single line text for names/companies
  - Email field type for emails
  - Date field type for dates
  - Single select for status fields
  - Long text for notes
