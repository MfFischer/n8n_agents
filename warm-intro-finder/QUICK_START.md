# ⚡ Quick Start Guide - Warm Intro Finder

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Import the Workflow (2 minutes)

1. **Open n8n**: Go to `http://localhost:5678`
2. **Import workflow**:
   - Click your profile icon (top right) → **"Import from file"**
   - Select `n8n-workflow/warm-intro-finder-import.json`
   - Click **"Import"**
3. **Verify import**: You should see 5 connected nodes

### Step 2: Start the Frontend (1 minute)

```bash
cd frontend
npm install
npm start
```

Frontend will open at `http://localhost:3000`

### Step 3: Test with Sample Data (2 minutes)

1. **In the frontend**:
   - Go to "Add Lead" tab
   - Click "Quick Fill" → Select "Alex Johnson" at "Acme Corp"
   - Click "Add Lead"

2. **Expected result**: Should show warm intro opportunity with Alice Thompson

## 🎯 What You'll See

### n8n Workflow (5 nodes):
```
📊 New Lead Added → 🧠 Graph Matcher → 🔥 Warm or Cold? → 🔥 Slack Notifications
                                                        → ❄️ Cold Outreach
```

### Frontend Interface:
- **Dashboard**: Real-time stats and warm intro rates
- **Leads**: Manage and track all leads
- **Network**: Visualize your professional connections
- **Add Lead**: Quick form with sample data

## 🔧 Optional: Full Setup

For production use, configure:

1. **Google Sheets credentials** (for real data)
2. **Slack credentials** (for notifications)
3. **Replace sample contacts** with your network

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## ✅ Validation

Run the validation script to ensure everything is working:

```bash
node validate-setup.js
```

Should show: **"All validations passed!"**

## 🎉 You're Ready!

The system demonstrates:
- ✅ Automated lead processing
- ✅ Graph-based relationship matching
- ✅ Smart warm/cold classification
- ✅ Modern React interface
- ✅ Real-time notifications

Perfect for showcasing GTM automation capabilities!

---

**Need help?** Check [IMPORT_WORKFLOW_GUIDE.md](IMPORT_WORKFLOW_GUIDE.md) for detailed import instructions.
