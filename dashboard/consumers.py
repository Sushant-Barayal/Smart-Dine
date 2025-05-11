from channels.generic.websocket import AsyncWebsocketConsumer
import json

class StaffNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("staff_notifications", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("staff_notifications", self.channel_name)

    async def receive(self, text_data):
        pass  # We only send messages from backend, not receive from staff

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event["content"]))
