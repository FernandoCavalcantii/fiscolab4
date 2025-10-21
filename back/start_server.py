#!/usr/bin/env python3
"""
Optimized server startup script for Render deployment
"""
import os
import sys
import subprocess
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_environment():
    """Setup environment variables for memory optimization"""
    os.environ['PYTHONHASHSEED'] = '0'
    os.environ['OMP_NUM_THREADS'] = '1'
    os.environ['MKL_NUM_THREADS'] = '1'
    os.environ['OPENBLAS_NUM_THREADS'] = '1'
    os.environ['VECLIB_MAXIMUM_THREADS'] = '1'
    os.environ['NUMEXPR_NUM_THREADS'] = '1'
    
    # Set memory optimization flags
    os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'
    
    logger.info("Environment variables set for memory optimization")

def start_server():
    """Start the optimized server"""
    setup_environment()
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    
    # Start gunicorn with optimized configuration
    cmd = [
        'gunicorn',
        'config.wsgi:application',
        '--config', 'gunicorn.conf.py',
        '--bind', f'0.0.0.0:{port}',
        '--workers', '1',
        '--timeout', '300',
        '--max-requests', '1000',
        '--max-requests-jitter', '50',
        '--preload-app',
        '--worker-tmp-dir', '/dev/shm'
    ]
    
    logger.info(f"Starting server with command: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Server failed to start: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    start_server()
