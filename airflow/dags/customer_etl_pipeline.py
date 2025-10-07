from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'start_date': datetime(2024, 1, 1),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'customer_data_etl',
    default_args=default_args,
    description='ETL pipeline for customer data',
    schedule_interval='@daily',
    catchup=False,
    tags=['etl', 'customer', 'demo'],
)

def process_customers(**context):
    print("Processing customer data...")
    return "Customers processed"

def enrich_data(**context):
    print("Enriching customer profiles...")
    return "Data enriched"

def sync_to_warehouse(**context):
    print("Syncing to data warehouse...")
    return "Sync complete"

task1 = PythonOperator(
    task_id='process_customer_data',
    python_callable=process_customers,
    dag=dag,
)

task2 = PythonOperator(
    task_id='enrich_customer_profiles',
    python_callable=enrich_data,
    dag=dag,
)

task3 = PythonOperator(
    task_id='sync_to_warehouse',
    python_callable=sync_to_warehouse,
    dag=dag,
)

task1 >> task2 >> task3