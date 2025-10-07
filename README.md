# 🚀 ETL Pipeline Management Dashboard

A modern, full-stack web application for monitoring and managing ETL (Extract, Transform, Load) data pipelines. Built with React, Flask, Apache Airflow, and Docker.

![Main Dashboard](screenshots/dashboard-main.png)

## ✨ Features

### 📊 Real-Time Pipeline Monitoring
- View all active ETL pipelines at a glance
- Live status updates every 10 seconds
- One-click pipeline execution
- Pause/Active status indicators

### 📈 Execution History & Analytics
- Detailed run history for each pipeline
- Success/failure statistics
- Performance metrics (duration, success rate)
- Visual status indicators

![History Modal](screenshots/history-modal.png)

### 📝 Advanced Logs Viewer
- Task-by-task execution logs
- Terminal-style log display
- Color-coded status indicators
- Real-time log streaming

![Logs Viewer](screenshots/logs-viewer.png)

### 📉 Metrics Dashboard
- Overall performance across all pipelines
- Per-pipeline analytics
- Success rate visualizations
- Performance insights and recommendations

![Metrics Dashboard](screenshots/metrics-dashboard.png)

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Lucide React** - Modern icon library
- **Vite** - Fast development server

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Requests** - HTTP library for Airflow API integration

### Orchestration
- **Apache Airflow 2.7** - Workflow orchestration
- **PostgreSQL 13** - Airflow metadata database
- **Docker & Docker Compose** - Containerization

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Docker Desktop**
- **npm/yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sureshravuris/etl-pipeline-agent.git
cd etl-pipeline-agent
```

2. **Start Airflow with Docker**
```bash
docker-compose up -d
```
Wait 1-2 minutes for Airflow to initialize.

3. **Start Flask Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

4. **Start React Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Access Applications
- **Dashboard**: http://localhost:3000
- **Airflow UI**: http://localhost:8080 (admin/admin)
- **Backend API**: http://localhost:5000

---

## 📁 Project Structure

```
etl-pipeline-agent/
├── airflow/
│   ├── dags/                    # Pipeline definitions
│   │   ├── customer_etl_pipeline.py
│   │   ├── product_inventory_etl.py
│   │   └── sample_etl_pipeline.py
│   ├── logs/                    # Airflow logs
│   └── plugins/                 # Custom plugins
├── backend/
│   ├── app.py                   # Flask API
│   ├── config.py                # Configuration
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── index.jsx            # Entry point
│   │   └── index.css            # Styles
│   ├── package.json             # Node dependencies
│   └── vite.config.js           # Vite configuration
├── data/
│   ├── input/                   # Input data files
│   └── output/                  # Processed data
├── docker-compose.yml           # Docker services
└── README.md                    # This file
```

---

## 🎯 Key Features Explained

### 1. Pipeline Execution
Click the **"Run"** button to manually trigger any pipeline. The system will:
- Queue the pipeline in Airflow
- Execute tasks in sequence
- Update status in real-time
- Log all activities

### 2. History Tracking
Click **"History"** to view:
- All past executions
- Success/failure statistics
- Execution duration
- Run type (manual vs scheduled)

### 3. Log Analysis
Click **"Logs"** on any run to:
- View task-level logs
- Debug failed executions
- Track data processing steps
- Monitor performance

### 4. Metrics Dashboard
Click **"View Metrics Dashboard"** to see:
- Overall system health
- Pipeline performance comparison
- Success rate trends
- Actionable insights

---

## 🔧 API Endpoints

### Pipelines
- `GET /api/pipelines` - List all pipelines
- `POST /api/pipelines/{dag_id}/trigger` - Trigger pipeline
- `GET /api/pipelines/{dag_id}/history` - Get execution history

### Logs & Metrics
- `GET /api/pipelines/{dag_id}/runs/{run_id}/logs` - Get task logs
- `GET /api/metrics/overview` - Get overall metrics

### Health
- `GET /api/health` - Backend health check

---

## 🎨 Screenshots

### Main Dashboard
Clean, intuitive interface showing all available pipelines with status indicators.

### Execution History
Detailed view of pipeline runs with statistics and performance metrics.

### Logs Viewer
Terminal-style log viewer with color-coded task statuses.

### Metrics Dashboard
Comprehensive analytics across all pipelines with visual insights.

---

## 🐳 Docker Services

The application runs 4 Docker containers:
- **postgres** - Airflow metadata database
- **airflow-webserver** - Airflow UI (port 8080)
- **airflow-scheduler** - Task scheduler
- **airflow-init** - Database initialization

---

## 📝 Sample Pipelines

### 1. Customer Data ETL
- Processes customer data
- Enriches customer profiles
- Syncs to data warehouse

### 2. Product Inventory ETL
- Extracts inventory from warehouses
- Validates data quality
- Generates low-stock alerts

### 3. Sales Data ETL
- Extracts sales transactions
- Transforms and aggregates data
- Loads to analytics database

---

## 🛠️ Development

### Adding New Pipelines
1. Create a new Python file in `airflow/dags/`
2. Define your DAG with tasks
3. Airflow auto-detects it within 30 seconds
4. Pipeline appears in dashboard automatically

### Modifying the UI
1. Edit `frontend/src/App.jsx`
2. Changes hot-reload automatically
3. Build for production: `npm run build`

### Backend Development
1. Edit `backend/app.py`
2. Restart Flask server
3. Test with: `http://localhost:5000/api/health`

---



## 🚀 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Email/Slack notifications
- [ ] User authentication & authorization
- [ ] Data lineage visualization
- [ ] Custom dashboard widgets
- [ ] Export reports to PDF
- [ ] Dark mode theme
- [ ] Apache Spark integration for large-scale data processing
- [ ] Multi-cloud deployment support (AWS, Azure, GCP)

---

Made with ❤️ for modern data engineering
```
