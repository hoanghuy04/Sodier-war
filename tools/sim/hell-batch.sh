#!/bin/bash
# quick balance table: mode S skill runs
cd "$(dirname "$0")/../.."
for cfg in "0 1.0 1" "0 1.0 0.5" "0 1.0 0" "1 1.4 1" "1 1.4 0.5" "2 1.9 1" "3 2.6 1" "3 3.0 1"; do
  set -- $cfg; node tools/sim/hell-sim.mjs $1 $2 $3 ${RUNS:-4} ${HERO:-thach-lam} | head -1
done
