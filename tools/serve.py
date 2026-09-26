"""Start a localhost-only server for the game. No third-party runtime packages."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse,functools,webbrowser,urllib.request

p=argparse.ArgumentParser()
p.add_argument('--port',type=int,default=8765)
p.add_argument('--open',action='store_true')
args=p.parse_args()
root=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,format,*args):
  if args and str(args[1]) not in ['200','304']: super().log_message(format,*args)
try:
 server=ThreadingHTTPServer(('127.0.0.1',args.port),functools.partial(Handler,directory=str(root)))
except OSError:
 if args.open:
  try:
   existing=urllib.request.urlopen(f'http://127.0.0.1:{args.port}',timeout=2).read()
  except OSError:existing=b''
  if b'<title>Doctor Ayden to the Rescue!</title>' in existing:
   webbrowser.open(f'http://localhost:{args.port}')
   raise SystemExit(0)
 raise SystemExit(f'Port {args.port} is in use. Try: python3 tools/serve.py --port {args.port+1} --open')
print(f'Doctor Ayden is ready: http://localhost:{args.port}',flush=True)
if args.open:webbrowser.open(f'http://localhost:{args.port}')
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
