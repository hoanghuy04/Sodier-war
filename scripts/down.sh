#!/usr/bin/env bash
tmux kill-session -t sodier 2>/dev/null && echo "Đã tắt Sodier War" || echo "Không có phiên nào đang chạy"
