#!/bin/bash
# Fake Claude simulator that streams output in SMALL RAPID CHUNKS.
# This simulates how real Claude Code works: data arrives from the streaming
# API in small pieces (a few words at a time), with ANSI formatting codes.

# Show ready marker
echo "FAKE_CLAUDE_READY"
sleep 0.5

echo ""
echo "I'll help you implement that feature. Let me create a detailed plan."
echo ""
sleep 0.5

# Use ANSI bold/color formatting like real Claude does
BOLD=$'\033[1m'
RESET=$'\033[0m'
DIM=$'\033[2m'
CYAN=$'\033[36m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'

echo "PLAN_OUTPUT_START"
echo ""

# Stream the plan as many small writes with tiny delays between them.
# This simulates the streaming API behavior where data arrives in
# small token-sized chunks (5-50 bytes each).

# Header
printf "${BOLD}${CYAN}╭────────────────────────────────────────────────────────────────────╮${RESET}\n"
sleep 0.005
printf "${BOLD}${CYAN}│${RESET}              ${BOLD}Comprehensive Implementation Plan${RESET}              ${BOLD}${CYAN}│${RESET}\n"
sleep 0.005
printf "${BOLD}${CYAN}├────────────────────────────────────────────────────────────────────┤${RESET}\n"
sleep 0.005

# Phase 1 - stream word by word with tiny delays
printf "\n${BOLD}${GREEN}  Phase 1: Foundation Setup${RESET}\n"
sleep 0.005
printf "  ${DIM}─────────────────────────${RESET}\n"
sleep 0.005

for i in $(seq 1 40); do
    # Simulate token-by-token streaming: each line arrives in 2-3 chunks
    printf "  ${YELLOW}1.%02d${RESET}  " "$i"
    sleep 0.002
    printf "Set up base infrastructure "
    sleep 0.002
    printf "component foundation-part-%d\n" "$i"
    sleep 0.003
done

printf "\n${BOLD}${GREEN}  Phase 2: Core Implementation${RESET}\n"
sleep 0.005
printf "  ${DIM}───────────────────────────${RESET}\n"
sleep 0.005

for i in $(seq 1 50); do
    printf "  ${YELLOW}2.%02d${RESET}  " "$i"
    sleep 0.002
    printf "Implement core logic "
    sleep 0.002
    printf "for module core-module-%d\n" "$i"
    sleep 0.003
done

printf "\n${BOLD}${GREEN}  Phase 3: Integration Layer${RESET}\n"
sleep 0.005
printf "  ${DIM}────────────────────────${RESET}\n"
sleep 0.005

for i in $(seq 1 40); do
    printf "  ${YELLOW}3.%02d${RESET}  " "$i"
    sleep 0.002
    printf "Wire up integration "
    sleep 0.002
    printf "between services integration-%d\n" "$i"
    sleep 0.003
done

printf "\n${BOLD}${GREEN}  Phase 4: Testing & Validation${RESET}\n"
sleep 0.005
printf "  ${DIM}──────────────────────────${RESET}\n"
sleep 0.005

for i in $(seq 1 30); do
    printf "  ${YELLOW}4.%02d${RESET}  " "$i"
    sleep 0.002
    printf "Write test suite for "
    sleep 0.002
    printf "test-suite-%d\n" "$i"
    sleep 0.003
done

printf "\n${BOLD}${GREEN}  Phase 5: Polish & Documentation${RESET}\n"
sleep 0.005
printf "  ${DIM}─────────────────────────────${RESET}\n"
sleep 0.005

for i in $(seq 1 30); do
    printf "  ${YELLOW}5.%02d${RESET}  " "$i"
    sleep 0.002
    printf "Document and polish "
    sleep 0.002
    printf "polish-item-%d\n" "$i"
    sleep 0.003
done

printf "\n${BOLD}${CYAN}├────────────────────────────────────────────────────────────────────┤${RESET}\n"
sleep 0.005
printf "${BOLD}${CYAN}│${RESET}  Summary: 190 steps across 5 phases                               ${BOLD}${CYAN}│${RESET}\n"
sleep 0.005
printf "${BOLD}${CYAN}│${RESET}  Estimated files to modify: 47                                    ${BOLD}${CYAN}│${RESET}\n"
sleep 0.005
printf "${BOLD}${CYAN}╰────────────────────────────────────────────────────────────────────╯${RESET}\n"
echo ""
echo "PLAN_OUTPUT_END"
echo ""

# Brief pause then go idle
sleep 0.3
echo "FAKE_CLAUDE_IDLE"

# Keep running
sleep 999999
