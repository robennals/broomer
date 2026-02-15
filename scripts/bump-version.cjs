#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const VALID_BUMP_TYPES = new Set(['major', 'minor', 'patch'])
const bumpType = process.argv[2]

if (!VALID_BUMP_TYPES.has(bumpType)) {
  console.error('Usage: pnpm version:bump <major|minor|patch>')
  process.exit(1)
}

const packageFiles = [
  path.resolve(__dirname, '..', 'package.json'),
  path.resolve(__dirname, '..', 'website', 'package.json'),
]

function parseSemver(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

function nextVersion(version, type) {
  const parsed = parseSemver(version)
  if (!parsed) {
    throw new Error(`Unsupported version format: ${version}`)
  }

  if (type === 'major') return `${parsed.major + 1}.0.0`
  if (type === 'minor') return `${parsed.major}.${parsed.minor + 1}.0`
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`
}

const rootPackagePath = packageFiles[0]
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'))
const newVersion = nextVersion(rootPackage.version, bumpType)

for (const filePath of packageFiles) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  pkg.version = newVersion
  fs.writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`)
}

console.log(`Bumped version (${bumpType}): ${rootPackage.version} -> ${newVersion}`)
console.log('Updated: package.json, website/package.json')
