import requests
import os

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/ats-event")

def notify_event(event_type, payload):
    try:
        data = {
            "event": event_type,
            "payload": payload
        }
        r = requests.post(N8N_WEBHOOK_URL, json=data, timeout=10)
        print(f"📡 Notified n8n: {event_type} (status={r.status_code})")
    except Exception as e:
        print(f"⚠️ Failed to notify n8n: {e}")
