from flask_socketio import SocketIO, emit


socketio = SocketIO(async_mode="eventlet")


# some general handlers
# not in any actuall use for now

# @socketio.on("connect")
# def on_connect():
#     pass

# @socketio.on("disconnect")
# def on_disconnect():
#     pass

# @socketio.on("connect")
# def handle_connect():
#     print("Client connected")

# @socketio.on("message_from_client")
# def handle_message(data):
#     print("Received:", data)
#     # send message back to all connected clients
#     emit("message_from_server", data, broadcast=True)

# @socketio.on("disconnect")
# def handle_disconnect():
#     print("Client disconnected")
