from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'sample_sales_etl',
    default_args=default_args,
    description='Sample ETL pipeline for sales data',
    schedule_interval='@daily',
    catchup=False,
    tags=['etl', 'sales', 'demo'],
)

def extract_data(**context):
    print("Extracting sales data from source...")
    # Simulate data extraction
    return "Data extracted successfully"

def transform_data(**context):
    print("Transforming sales data...")
    # Simulate data transformation
    return "Data transformed successfully"

def load_data(**context):
    print("Loading data into warehouse...")
    # Simulate data loading
    return "Data loaded successfully"

extract_task = PythonOperator(
    task_id='extract_sales_data',
    python_callable=extract_data,
    dag=dag,
)

transform_task = PythonOperator(
    task_id='transform_sales_data',
    python_callable=transform_data,
    dag=dag,
)

load_task = PythonOperator(
    task_id='load_sales_data',
    python_callable=load_data,
    dag=dag,
)

extract_task >> transform_task >> load_task 