// Cross-platform postinstall: chmod spawn-helper on Unix only
const { execSync } = require('child_process')

if (process.platform !== 'win32') {
  try {
    execSync('chmod +x node_modules/node-pty/prebuilds/darwin-*/spawn-helper 2>/dev/null || true', { stdio: 'ignore' })
    execSync('chmod +x node_modules/node-pty/prebuilds/linux-*/spawn-helper 2>/dev/null || true', { stdio: 'ignore' })
  } catch {
    // Ignore errors — prebuilds may not exist for this platform
  }
}
