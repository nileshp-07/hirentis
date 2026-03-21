import logging
import sys

def setup_logger() -> logging.Logger:
    logger = logging.getLogger("backend_logger")
    logger.setLevel(logging.INFO)
    
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    if not logger.handlers:
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
