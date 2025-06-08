# Logger module for standardized logging across the app
import traceback
import json
import time
from typing import Dict, Any, Optional
import databutton as db

from fastapi import APIRouter

# Create an empty router as required
router = APIRouter()

# Define log levels
LOG_LEVELS = {
    "DEBUG": 10,
    "INFO": 20,
    "WARNING": 30,
    "ERROR": 40,
    "CRITICAL": 50
}

# Set the minimum log level to log (adjust as needed)
MIN_LOG_LEVEL = LOG_LEVELS["INFO"]

# Log storage configuration
LOG_STORAGE_KEY = "app_logs"
MAX_LOGS_TO_KEEP = 1000  # Maximum number of log entries to keep in storage


def _get_log_storage():
    """
    Get the current logs from storage or initialize if not exists
    """
    try:
        logs = db.storage.json.get(LOG_STORAGE_KEY, default=[])
        return logs
    except Exception:
        # If can't load, return empty list
        return []


def _save_logs(logs):
    """
    Save logs to storage, keeping only the last MAX_LOGS_TO_KEEP entries
    """
    try:
        # Trim the logs if they're too long
        if len(logs) > MAX_LOGS_TO_KEEP:
            logs = logs[-MAX_LOGS_TO_KEEP:]

        db.storage.json.put(LOG_STORAGE_KEY, logs)
        return True
    except Exception:
        # Print to console if we can't save to storage
        print("Failed to save logs to storage")
        return False


def log(level: str, message: str, source: str = None, context: Dict[str, Any] = None,
        exception: Exception = None, store_hash: str = None, include_traceback: bool = False):
    """
    Log a message with the specified level and additional context.
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        message: The log message
        source: Source of the log (e.g., module name)
        context: Additional context information as a dictionary
        exception: Exception object if this is an error log
        store_hash: Store hash if related to a specific store
        include_traceback: Whether to include a full traceback for exceptions
    """
    level = level.upper()
    level_num = LOG_LEVELS.get(level, LOG_LEVELS["INFO"])
    
    # Skip logs below minimum level
    if level_num < MIN_LOG_LEVEL:
        return
    
    # Always print to console for immediate visibility
    log_entry = {
        "timestamp": int(time.time()),
        "level": level,
        "message": message,
        "source": source or "app"
    }
    
    if context:
        log_entry["context"] = context
        
    if store_hash:
        log_entry["store_hash"] = store_hash
        
    if exception:
        log_entry["error"] = str(exception)
        if include_traceback:
            log_entry["traceback"] = traceback.format_exc()
    
    # Print to console
    print(f"[{level}] {message}")
    if exception:
        print(f"Exception: {str(exception)}")
        if include_traceback:
            print(traceback.format_exc())
    
    # Try to save to storage for persistence - this may fail in some environments 
    try:
        logs = _get_log_storage()
        logs.append(log_entry)
        _save_logs(logs)
    except Exception as e:
        # If storage fails, at least we printed to console
        print(f"Failed to save log to storage: {str(e)}")
    
    return log_entry


def debug(message: str, **kwargs):
    """
Debug level log
    """
    return log("DEBUG", message, **kwargs)


def info(message: str, **kwargs):
    """
    Info level log
    """
    return log("INFO", message, **kwargs)


def warning(message: str, **kwargs):
    """
    Warning level log
    """
    return log("WARNING", message, **kwargs)


def error(message: str, **kwargs):
    """
    Error level log
    """
    return log("ERROR", message, **kwargs)


def critical(message: str, **kwargs):
    """
    Critical level log
    """
    return log("CRITICAL", message, **kwargs)


def log_exception(message: str, exception: Exception, **kwargs):
    """
    Log an exception with full traceback
    """
    return error(message, exception=exception, include_traceback=True, **kwargs)
