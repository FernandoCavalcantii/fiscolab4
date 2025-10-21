# Gunicorn configuration for memory-optimized deployment
import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.environ.get('PORT', 8000)}"
backlog = 2048

# Worker processes
workers = 1  # Single worker to avoid memory issues
worker_class = "sync"
worker_connections = 1000
timeout = 300  # 5 minutes timeout
keepalive = 2

# Restart workers after this many requests, to prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Memory optimization
preload_app = False  # Don't preload to save memory
worker_tmp_dir = "/dev/shm"  # Use shared memory for temporary files

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "fiscolab-backend"

# Server mechanics
daemon = False
pidfile = None
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
keyfile = None
certfile = None

# Environment variables for memory optimization
raw_env = [
    'PYTHONHASHSEED=0',
    'OMP_NUM_THREADS=1',
    'MKL_NUM_THREADS=1',
    'OPENBLAS_NUM_THREADS=1',
    'VECLIB_MAXIMUM_THREADS=1',
    'NUMEXPR_NUM_THREADS=1',
]
