from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Airflow configuration
AIRFLOW_API_URL = "http://localhost:8080/api/v1"
AIRFLOW_USERNAME = "admin"
AIRFLOW_PASSWORD = "admin"

def get_airflow_session():
    """Create authenticated session for Airflow API"""
    session = requests.Session()
    session.auth = (AIRFLOW_USERNAME, AIRFLOW_PASSWORD)
    return session

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'ETL Pipeline Backend'
    })

@app.route('/api/pipelines', methods=['GET'])
def get_all_pipelines():
    """Get list of all DAGs/pipelines"""
    try:
        session = get_airflow_session()
        response = session.get(f"{AIRFLOW_API_URL}/dags")
        
        if response.status_code == 200:
            dags = response.json().get('dags', [])
            
            pipelines = [{
                'id': dag['dag_id'],
                'name': dag['dag_id'].replace('_', ' ').title(),
                'is_paused': dag['is_paused'],
                'is_active': dag.get('is_active', True),
                'tags': dag.get('tags', []),
            } for dag in dags]
            
            return jsonify({
                'success': True,
                'pipelines': pipelines,
                'count': len(pipelines)
            })
        else:
            logger.error(f"Airflow API returned status {response.status_code}")
            return jsonify({
                'success': False,
                'error': 'Failed to fetch pipelines from Airflow'
            }), 500
            
    except Exception as e:
        logger.error(f"Error fetching pipelines: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pipelines/<dag_id>/runs', methods=['GET'])
def get_pipeline_runs(dag_id):
    """Get execution history for a specific pipeline"""
    try:
        session = get_airflow_session()
        
        response = session.get(
            f"{AIRFLOW_API_URL}/dags/{dag_id}/dagRuns",
            params={'limit': 50, 'order_by': '-execution_date'}
        )
        
        if response.status_code == 200:
            dag_runs = response.json()['dag_runs']
            
            runs = []
            for run in dag_runs:
                runs.append({
                    'run_id': run['dag_run_id'],
                    'execution_date': run['execution_date'],
                    'start_date': run['start_date'],
                    'end_date': run['end_date'],
                    'state': run['state'],
                    'run_type': run['run_type']
                })
            
            return jsonify({
                'success': True,
                'dag_id': dag_id,
                'runs': runs,
                'count': len(runs)
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch runs for {dag_id}'
            }), response.status_code
            
    except Exception as e:
        logger.error(f"Error fetching pipeline runs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pipelines/<dag_id>/history', methods=['GET'])
def get_pipeline_history(dag_id):
    """Get detailed execution history with statistics"""
    try:
        session = get_airflow_session()
        
        response = session.get(
            f"{AIRFLOW_API_URL}/dags/{dag_id}/dagRuns",
            params={'limit': 20, 'order_by': '-execution_date'}
        )
        
        if response.status_code == 200:
            dag_runs = response.json()['dag_runs']
            
            runs = []
            success_count = 0
            failed_count = 0
            total_duration = 0
            
            for run in dag_runs:
                duration = None
                if run['start_date'] and run['end_date']:
                    start = datetime.fromisoformat(run['start_date'].replace('Z', '+00:00'))
                    end = datetime.fromisoformat(run['end_date'].replace('Z', '+00:00'))
                    duration = (end - start).total_seconds()
                    total_duration += duration
                
                if run['state'] == 'success':
                    success_count += 1
                elif run['state'] == 'failed':
                    failed_count += 1
                
                runs.append({
                    'run_id': run['dag_run_id'],
                    'execution_date': run['execution_date'],
                    'start_date': run['start_date'],
                    'end_date': run['end_date'],
                    'state': run['state'],
                    'run_type': run['run_type'],
                    'duration': duration
                })
            
            avg_duration = total_duration / len(runs) if runs else 0
            
            return jsonify({
                'success': True,
                'dag_id': dag_id,
                'runs': runs,
                'statistics': {
                    'total_runs': len(runs),
                    'success_count': success_count,
                    'failed_count': failed_count,
                    'success_rate': (success_count / len(runs) * 100) if runs else 0,
                    'avg_duration': avg_duration
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch history for {dag_id}'
            }), response.status_code
            
    except Exception as e:
        logger.error(f"Error fetching pipeline history: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pipelines/<dag_id>/trigger', methods=['POST'])
def trigger_pipeline(dag_id):
    """Manually trigger a pipeline run"""
    try:
        session = get_airflow_session()
        
        response = session.post(
            f"{AIRFLOW_API_URL}/dags/{dag_id}/dagRuns",
            json={}
        )
        
        if response.status_code == 200:
            run = response.json()
            return jsonify({
                'success': True,
                'message': f'Pipeline {dag_id} triggered successfully',
                'run_id': run['dag_run_id']
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to trigger pipeline'
            }), response.status_code
            
    except Exception as e:
        logger.error(f"Error triggering pipeline: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/pipelines/<dag_id>/runs/<run_id>/logs', methods=['GET'])
def get_task_logs(dag_id, run_id):
    """Get logs for all tasks in a specific run"""
    try:
        session = get_airflow_session()
        
        # Get all task instances for this run
        response = session.get(
            f"{AIRFLOW_API_URL}/dags/{dag_id}/dagRuns/{run_id}/taskInstances"
        )
        
        if response.status_code == 200:
            tasks = response.json()['task_instances']
            
            task_logs = []
            for task in tasks:
                task_id = task['task_id']
                try_number = task['try_number']
                
                # Get logs for each task
                log_response = session.get(
                    f"{AIRFLOW_API_URL}/dags/{dag_id}/dagRuns/{run_id}/taskInstances/{task_id}/logs/{try_number}"
                )
                
                log_content = ""
                if log_response.status_code == 200:
                    log_content = log_response.text
                
                task_logs.append({
                    'task_id': task_id,
                    'state': task['state'],
                    'start_date': task['start_date'],
                    'end_date': task['end_date'],
                    'duration': task['duration'],
                    'logs': log_content
                })
            
            return jsonify({
                'success': True,
                'dag_id': dag_id,
                'run_id': run_id,
                'tasks': task_logs
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch logs for {dag_id}/{run_id}'
            }), response.status_code
            
    except Exception as e:
        logger.error(f"Error fetching task logs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/metrics/overview', methods=['GET'])
def get_metrics_overview():
    """Get overall metrics across all pipelines"""
    try:
        session = get_airflow_session()
        
        # Get all DAGs
        dags_response = session.get(f"{AIRFLOW_API_URL}/dags")
        
        if dags_response.status_code != 200:
            return jsonify({
                'success': False,
                'error': 'Failed to fetch DAGs'
            }), 500
        
        dags = dags_response.json()['dags']
        
        total_pipelines = len(dags)
        active_pipelines = sum(1 for dag in dags if dag['is_active'] and not dag['is_paused'])
        
        # Collect metrics from all pipelines
        all_runs = []
        pipeline_metrics = []
        
        for dag in dags:
            runs_response = session.get(
                f"{AIRFLOW_API_URL}/dags/{dag['dag_id']}/dagRuns",
                params={'limit': 20, 'order_by': '-execution_date'}
            )
            
            if runs_response.status_code == 200:
                runs = runs_response.json()['dag_runs']
                all_runs.extend(runs)
                
                # Calculate per-pipeline metrics
                success_count = sum(1 for r in runs if r['state'] == 'success')
                failed_count = sum(1 for r in runs if r['state'] == 'failed')
                
                durations = []
                for run in runs:
                    if run['start_date'] and run['end_date']:
                        start = datetime.fromisoformat(run['start_date'].replace('Z', '+00:00'))
                        end = datetime.fromisoformat(run['end_date'].replace('Z', '+00:00'))
                        durations.append((end - start).total_seconds())
                
                avg_duration = sum(durations) / len(durations) if durations else 0
                
                pipeline_metrics.append({
                    'pipeline_id': dag['dag_id'],
                    'pipeline_name': dag['dag_id'].replace('_', ' ').title(),
                    'total_runs': len(runs),
                    'success_count': success_count,
                    'failed_count': failed_count,
                    'success_rate': (success_count / len(runs) * 100) if runs else 0,
                    'avg_duration': avg_duration
                })
        
        # Overall statistics
        total_runs = len(all_runs)
        success_count = sum(1 for r in all_runs if r['state'] == 'success')
        failed_count = sum(1 for r in all_runs if r['state'] == 'failed')
        running_count = sum(1 for r in all_runs if r['state'] == 'running')
        
        return jsonify({
            'success': True,
            'overview': {
                'total_pipelines': total_pipelines,
                'active_pipelines': active_pipelines,
                'total_runs': total_runs,
                'success_count': success_count,
                'failed_count': failed_count,
                'running_count': running_count,
                'success_rate': (success_count / total_runs * 100) if total_runs else 0
            },
            'pipeline_metrics': pipeline_metrics
        })
        
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    
if __name__ == '__main__':
    print("=" * 50)
    print("Starting Flask Backend on http://localhost:5000")
    print("Airflow API: " + AIRFLOW_API_URL)
    print("Health check: http://localhost:5000/api/health")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)