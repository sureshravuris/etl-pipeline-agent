from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'inventory-team',
    'start_date': datetime(2024, 1, 1),
    'retries': 1,
}

dag = DAG(
    'product_inventory_etl',
    default_args=default_args,
    description='Product inventory ETL pipeline',
    schedule_interval='@hourly',
    catchup=False,
    tags=['etl', 'inventory', 'product'],
)

def extract_inventory(**context):
    print("Extracting inventory data...")
    return "Extracted"

def transform_inventory(**context):
    print("Transforming inventory data...")
    return "Transformed"

def load_inventory(**context):
    print("Loading inventory data...")
    return "Loaded"

extract = PythonOperator(
    task_id='extract_inventory',
    python_callable=extract_inventory,
    dag=dag,
)

transform = PythonOperator(
    task_id='transform_inventory',
    python_callable=transform_inventory,
    dag=dag,
)

load = PythonOperator(
    task_id='load_inventory',
    python_callable=load_inventory,
    dag=dag,
)

extract >> transform >> load