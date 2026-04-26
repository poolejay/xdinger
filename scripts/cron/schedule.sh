#!/bin/bash
# Run at 10am ET every day during MLB season (April-October)
# Add to crontab: crontab -e
# 0 14 * * * /bin/bash /path/to/schedule.sh

cd /path/to/project
echo "Starting pipeline - $(date)"
python3 scripts/pipeline/run_pipeline.py
echo "Pipeline complete - $(date)"
