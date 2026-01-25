#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Factory Method Pattern - API Examples
# By El Profe Millo
# ═══════════════════════════════════════════════════════════════

BASE_URL="http://localhost:3000/api"

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║      🏭 FACTORY METHOD PATTERN - API EXAMPLES         ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Make sure the server is running: npm run dev"
echo ""
echo "Press Enter to continue..."
read

# ═══════════════════════════════════════════════════════════════
# 1. Health Check
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$ curl $BASE_URL/health"
echo ""
curl -s "$BASE_URL/health" | jq '.'
echo ""

# ═══════════════════════════════════════════════════════════════
# 2. Get Supported Formats
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Get Supported Export Formats"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$ curl $BASE_URL/formats"
echo ""
curl -s "$BASE_URL/formats" | jq '.'
echo ""

# ═══════════════════════════════════════════════════════════════
# 3. Create Reports
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Create Reports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Creating Report 1: Sales Report..."
REPORT1=$(curl -s -X POST "$BASE_URL/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q4 2024 Sales Report",
    "content": "This quarter showed exceptional growth across all departments. Sales increased by 35% compared to Q3, driven primarily by strong performance in the EMEA region. Customer acquisition costs decreased by 15% while retention rates improved to 92%. Key highlights include the launch of three new product lines and expansion into two new markets.",
    "author": "Sarah Johnson",
    "category": "Sales"
  }')

echo "$REPORT1" | jq '.'
REPORT1_ID=$(echo "$REPORT1" | jq -r '.id')
echo ""
echo "✅ Report 1 created with ID: $REPORT1_ID"
echo ""

echo "Creating Report 2: Technical Report..."
REPORT2=$(curl -s -X POST "$BASE_URL/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Performance Analysis 2024",
    "content": "Our infrastructure has demonstrated remarkable stability and performance throughout 2024. Average response time decreased from 245ms to 89ms. System uptime reached 99.97%, exceeding our SLA targets. We successfully migrated 85% of our services to microservices architecture, resulting in improved scalability and fault tolerance.",
    "author": "Michael Chen",
    "category": "Technical"
  }')

echo "$REPORT2" | jq '.'
REPORT2_ID=$(echo "$REPORT2" | jq -r '.id')
echo ""
echo "✅ Report 2 created with ID: $REPORT2_ID"
echo ""

echo "Creating Report 3: Marketing Report..."
REPORT3=$(curl -s -X POST "$BASE_URL/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Digital Marketing Campaign Results",
    "content": "The Q4 digital marketing campaign exceeded expectations with a 127% ROI. Social media engagement increased by 450%, with TikTok and Instagram showing the strongest growth. Email marketing campaigns achieved a 34% open rate and 8.5% click-through rate. Influencer partnerships generated 12M impressions and 450K conversions.",
    "author": "Emma Rodriguez",
    "category": "Marketing"
  }')

echo "$REPORT3" | jq '.'
REPORT3_ID=$(echo "$REPORT3" | jq -r '.id')
echo ""
echo "✅ Report 3 created with ID: $REPORT3_ID"
echo ""

# ═══════════════════════════════════════════════════════════════
# 4. List All Reports
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  List All Reports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$ curl $BASE_URL/reports"
echo ""
curl -s "$BASE_URL/reports" | jq '.'
echo ""

# ═══════════════════════════════════════════════════════════════
# 5. Export to Different Formats (FACTORY METHOD IN ACTION!)
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Export Reports to Different Formats"
echo "   (THIS IS THE FACTORY METHOD PATTERN IN ACTION!)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# PDF Export
echo "📄 Exporting Report 1 to PDF..."
curl -s "$BASE_URL/reports/$REPORT1_ID/export?format=pdf" \
  --output "sales-report.pdf"
echo "✅ Saved as: sales-report.pdf"
echo ""

# Excel Export
echo "📊 Exporting Report 2 to Excel..."
curl -s "$BASE_URL/reports/$REPORT2_ID/export?format=excel" \
  --output "technical-report.xlsx"
echo "✅ Saved as: technical-report.xlsx"
echo ""

# CSV Export
echo "📋 Exporting Report 3 to CSV..."
curl -s "$BASE_URL/reports/$REPORT3_ID/export?format=csv" \
  --output "marketing-report.csv"
echo "✅ Saved as: marketing-report.csv"
echo ""

# Same report, different formats
echo "🔄 Exporting the SAME report (Report 1) to ALL formats..."
curl -s "$BASE_URL/reports/$REPORT1_ID/export?format=pdf" \
  --output "sales-report.pdf"
curl -s "$BASE_URL/reports/$REPORT1_ID/export?format=excel" \
  --output "sales-report.xlsx"
curl -s "$BASE_URL/reports/$REPORT1_ID/export?format=csv" \
  --output "sales-report.csv"
echo "✅ Same report exported to:"
echo "   - sales-report.pdf"
echo "   - sales-report.xlsx"
echo "   - sales-report.csv"
echo ""

# ═══════════════════════════════════════════════════════════════
# 6. View Exported Files
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Preview Exported Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📄 PDF Preview (first 20 lines):"
echo "────────────────────────────────────────────────────"
head -20 sales-report.pdf
echo "────────────────────────────────────────────────────"
echo ""

echo "📊 Excel Preview (first 20 lines):"
echo "────────────────────────────────────────────────────"
head -20 technical-report.xlsx
echo "────────────────────────────────────────────────────"
echo ""

echo "📋 CSV Preview:"
echo "────────────────────────────────────────────────────"
cat marketing-report.csv
echo "────────────────────────────────────────────────────"
echo ""

# ═══════════════════════════════════════════════════════════════
# 7. Error Handling
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  Error Handling Examples"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "❌ Try to export non-existent report:"
curl -s "$BASE_URL/reports/non-existent-id/export?format=pdf" | jq '.'
echo ""

echo "❌ Try to use unsupported format:"
curl -s "$BASE_URL/reports/$REPORT1_ID/export?format=json" | jq '.'
echo ""

echo "❌ Try to create invalid report:"
curl -s -X POST "$BASE_URL/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "content": "content",
    "author": "author"
  }' | jq '.'
echo ""

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║                    ✅ DEMO COMPLETE                    ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Key Takeaways:"
echo ""
echo "1. The same report was exported to multiple formats"
echo "2. Each format uses its own Factory (PdfExporterFactory, etc)"
echo "3. The ExportController doesn't know which factory it's using"
echo "4. Adding a new format = create new Exporter + Factory"
echo "5. No need to modify existing code (Open/Closed Principle)"
echo ""
echo "📁 Files created:"
ls -lh *.pdf *.xlsx *.csv 2>/dev/null || echo "   (no files created)"
echo ""
echo "🧹 To clean up: rm *.pdf *.xlsx *.csv"
echo ""
echo "🎓 By El Profe Millo - ¡Venga, a darle caña!"
echo ""
