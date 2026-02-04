export function issueToBranchName(issue: { number: number; title: string }): string {
  const slug = issue.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-')
  return `${issue.number}-${slug}`
}
