#!/usr/bin/env python3
"""
Script to run the FastAPI object detection API.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
    )
