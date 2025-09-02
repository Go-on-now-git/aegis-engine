import subprocess, time, httpx, json, os
from datetime import datetime
API_HOST, API_PORT = "127.0.0.1", 8000
API_URL = f"http://{API_HOST}:{API_PORT}/api/v1/scan"
DATA_DIR, OUTPUT_FILE = "data", os.path.join("data", "latest_scan_results.json")
STARTUP_WAIT_TIME, REQUEST_TIMEOUT = 15, 300
def run_scan_and_save():
    server_process = None
    try:
        print("Starting FastAPI server in the background...")
        server_process = subprocess.Popen(["uvicorn", "main:app", "--host", API_HOST, "--port", str(API_PORT)])
        print(f"Server process started with PID: {server_process.pid}. Waiting {STARTUP_WAIT_TIME}s...")
        time.sleep(STARTUP_WAIT_TIME)
        print(f"Sending request to API endpoint: {API_URL}")
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            response = client.get(API_URL)
            response.raise_for_status()
        scan_results = response.json()
        os.makedirs(DATA_DIR, exist_ok=True)
        print(f"Saving scan results to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(scan_results, f, indent=2)
        print("Data saved successfully.")
    finally:
        if server_process:
            print(f"Terminating server process (PID: {server_process.pid})...")
            server_process.terminate()
            server_process.wait()
            print("Server terminated.")
if __name__ == "__main__":
    print(f"AEGIS-MVP Test Harness initiated at {datetime.now().isoformat()}")
    run_scan_and_save()
    print("Harness execution complete.")
