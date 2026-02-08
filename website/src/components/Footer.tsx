export default function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 py-12 md:px-12">
      <div className="mx-auto max-w-[1200px] text-center text-sm text-text-muted">
        Broomy is free and open source software under the{' '}
        <a
          href="https://github.com/broomy-ai/broomy/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-body"
        >
          MIT License
        </a>
        .
        <br className="sm:hidden" />{' '}
        <a
          href="https://github.com/broomy-ai/broomy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-body"
        >
          Source on GitHub
        </a>{' '}
        &middot; Built with Electron, React, and TypeScript.
      </div>
    </footer>
  )
}
