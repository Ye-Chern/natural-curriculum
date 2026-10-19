"""Serve the rendered book for concurrent browser tests, on loopback only."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class Server(ThreadingHTTPServer):
    # Python 3.12 defaults to five queued connections. Two browser workers can
    # exceed that on Windows while fetching Quarto's scripts simultaneously.
    request_queue_size = 128


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4201)
    args = parser.parse_args()
    directory = Path(__file__).resolve().parents[1] / "_book"
    with Server(("127.0.0.1", args.port), partial(Handler, directory=str(directory))) as server:
        print(f"Serving {directory} at http://127.0.0.1:{args.port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
