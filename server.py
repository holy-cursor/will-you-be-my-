import http.server
import json
import os
import random
import string

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

class ValentineHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body)

                # Generate unique 6-char code
                for _ in range(100):
                    code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
                    filepath = os.path.join(DATA_DIR, f'{code}.json')
                    if not os.path.exists(filepath):
                        break

                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'code': code}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
            return

        self.send_response(404)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/load/'):
            code = self.path.split('/')[-1].strip()
            # Only allow alphanumeric codes
            if not code.isalnum() or len(code) != 6:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'invalid code'}).encode())
                return

            filepath = os.path.join(DATA_DIR, f'{code}.json')
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'not found'}).encode())
            return

        # Serve static files normally
        super().do_GET()

if __name__ == '__main__':
    PORT = 3000
    with http.server.HTTPServer(('', PORT), ValentineHandler) as httpd:
        print(f'Valentine server on http://127.0.0.1:{PORT}')
        httpd.serve_forever()
