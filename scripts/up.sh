#!/usr/bin/env bash
# Start Sodier War in tmux session "sodier": game server + Cloudflare quick tunnel.
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-8790}"
SESSION=sodier
mkdir -p data
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Đã có phiên tmux '$SESSION'. Link: $(cat data/public-url.txt 2>/dev/null || echo '(chưa có)')"
  echo "Khởi động lại: ./scripts/down.sh rồi ./scripts/up.sh"
  exit 0
fi
[ -d client/assets/map ] || node tools/build-assets.mjs
rm -f data/tunnel.log data/public-url.txt
tmux new-session -d -s "$SESSION" -n server "PORT=$PORT node server/main.js 2>&1 | tee -a data/server.log"
tmux new-window -t "$SESSION" -n tunnel "cloudflared tunnel --no-autoupdate --url http://localhost:$PORT 2>&1 | tee data/tunnel.log"
echo -n "Đang mở tunnel"
for _ in $(seq 1 40); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' data/tunnel.log 2>/dev/null | head -1 || true)
  [ -n "$URL" ] && break
  echo -n "."; sleep 1
done
echo
if [ -n "${URL:-}" ]; then echo "$URL" > data/public-url.txt; echo "Link chơi:  $URL"; else echo "Chưa lấy được link. Xem: tmux attach -t $SESSION"; fi
echo "Trên máy:   http://localhost:$PORT"
INVITE=$(node -e "console.log(require('./data/config.json').invite)" 2>/dev/null || echo '?')
echo "Mã mời:     $INVITE   (cần khi tạo tài khoản mới)"
echo "Xem log:    tmux attach -t $SESSION   (Ctrl+b rồi d để thoát)"
