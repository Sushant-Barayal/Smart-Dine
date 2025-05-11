import serial
import requests
import time

# === CONFIGURATION ===
PORT = 'COM3'  # ✅ Change to your correct Arduino COM port
BAUD_RATE = 9600

# ✅ Updated API endpoint that handles check-ins
DJANGO_API_URL = 'http://127.0.0.1:8000/api/dashboard/rfid-checkin/'

# 🔓 No token needed (since rfid_checkin uses AllowAny)
HEADERS = {
    'Content-Type': 'application/json'
}

def send_uid_to_django(rfid_uid):
    try:
        response = requests.post(DJANGO_API_URL, json={'rfid_uid': rfid_uid}, headers=HEADERS)
        data = response.json()

        if response.status_code == 200 and 'customer' in data:
            print(f"✅ CHECK-IN SUCCESS: {data['customer']} seated at Table {data['table']}")
            print("🍽️ Preordered Items:")
            for item in data.get("preorders", []):
                print(f"  - {item['name']} (Rs. {item['price']})")
        else:
            print(f"⚠️ Server Response: {data.get('message') or data.get('error') or 'Unknown'}")
    except Exception as e:
        print(f"❌ Request failed: {e}")



def main():
    print(f"📡 Connecting to {PORT} at {BAUD_RATE} baud...")
    try:
        ser = serial.Serial(PORT, BAUD_RATE, timeout=1)
        time.sleep(2)  # Wait for serial to initialize

        print("✅ Ready to scan RFID cards...\n")
        while True:
            line = ser.readline().decode('utf-8').strip()
            if line:
                print(f"\n📥 Scanned UID: {line}")
                send_uid_to_django(line)
                time.sleep(2)  # Prevent duplicate scans
    except serial.SerialException as e:
        print(f"❌ Could not open serial port {PORT}: {e}")

if __name__ == '__main__':
    main()
