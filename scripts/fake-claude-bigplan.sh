#!/bin/bash
# Fake Claude simulator that outputs a MASSIVE plan in a single write.
# Simulates the real-world scenario where Claude dumps a huge plan file
# as one large chunk via the PTY, which stresses xterm.js scrolling.

# Show ready marker
echo "FAKE_CLAUDE_READY"

# Wait for terminal to initialize
sleep 0.5

echo ""
echo "I'll help you implement that feature. Let me create a detailed plan."
echo ""

# Brief pause so the terminal is established at "bottom" before the flood
sleep 0.5

# Build the ENTIRE plan into a single string and output it in ONE write.
# This is critical: real Claude sends data as large chunks, not line-by-line.
# Using printf with a single format string ensures it goes through the PTY
# as one big block, which is what triggers the xterm scrolling bug.
PLAN=""
PLAN+="PLAN_OUTPUT_START\n"
PLAN+="\n"
PLAN+="╭────────────────────────────────────────────────────────────────────────────╮\n"
PLAN+="│                     Comprehensive Implementation Plan                     │\n"
PLAN+="├────────────────────────────────────────────────────────────────────────────┤\n"
PLAN+="│                                                                            │\n"
PLAN+="│  Phase 1: Foundation Setup                                                 │\n"
PLAN+="│  ─────────────────────────                                                 │\n"
for i in $(seq 1 40); do
    PLAN+="$(printf "│  1.%02d  Set up base infrastructure component %-28s │" "$i" "foundation-part-$i")\n"
done
PLAN+="│                                                                            │\n"
PLAN+="│  Phase 2: Core Implementation                                              │\n"
PLAN+="│  ───────────────────────────                                                │\n"
for i in $(seq 1 50); do
    PLAN+="$(printf "│  2.%02d  Implement core logic for module %-33s │" "$i" "core-module-$i")\n"
done
PLAN+="│                                                                            │\n"
PLAN+="│  Phase 3: Integration Layer                                                │\n"
PLAN+="│  ────────────────────────                                                  │\n"
for i in $(seq 1 40); do
    PLAN+="$(printf "│  3.%02d  Wire up integration between services %-27s │" "$i" "integration-$i")\n"
done
PLAN+="│                                                                            │\n"
PLAN+="│  Phase 4: Testing & Validation                                             │\n"
PLAN+="│  ──────────────────────────                                                │\n"
for i in $(seq 1 30); do
    PLAN+="$(printf "│  4.%02d  Write test suite for %-43s │" "$i" "test-suite-$i")\n"
done
PLAN+="│                                                                            │\n"
PLAN+="│  Phase 5: Polish & Documentation                                           │\n"
PLAN+="│  ─────────────────────────────                                             │\n"
for i in $(seq 1 30); do
    PLAN+="$(printf "│  5.%02d  Document and polish %-44s │" "$i" "polish-item-$i")\n"
done
PLAN+="│                                                                            │\n"
PLAN+="├────────────────────────────────────────────────────────────────────────────┤\n"
PLAN+="│  Summary: 190 steps across 5 phases                                        │\n"
PLAN+="│  Estimated files to modify: 47                                             │\n"
PLAN+="│  New files to create: 23                                                   │\n"
PLAN+="│  Estimated complexity: HIGH                                                │\n"
PLAN+="╰────────────────────────────────────────────────────────────────────────────╯\n"
PLAN+="\n"
PLAN+="PLAN_OUTPUT_END\n"

# Output the entire plan in a SINGLE printf call — one giant PTY write
printf "%b" "$PLAN"

# Brief pause then go idle
sleep 0.3
echo ""
echo "FAKE_CLAUDE_IDLE"

# Keep running
sleep 999999
