import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDisposable = () => ({ dispose: vi.fn() })

vi.mock('monaco-editor', () => {
  const ScriptTarget = { ES3: 0, ES5: 1, ES2015: 2, ES2016: 3, ES2017: 4, ES2018: 5, ES2019: 6, ES2020: 7, ESNext: 99, Latest: 99 }
  const ModuleKind = { None: 0, CommonJS: 1, AMD: 2, UMD: 3, System: 4, ES2015: 5, ESNext: 99 }
  const ModuleResolutionKind = { Classic: 1, NodeJs: 2 }
  const JsxEmit = { None: 0, Preserve: 1, React: 2, ReactNative: 3, ReactJSX: 4, ReactJSXDev: 5 }

  const typescriptDefaults = {
    setCompilerOptions: vi.fn(),
    setDiagnosticsOptions: vi.fn(),
    addExtraLib: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  }
  const javascriptDefaults = {
    setDiagnosticsOptions: vi.fn(),
  }

  const ts = { ScriptTarget, ModuleKind, ModuleResolutionKind, JsxEmit, typescriptDefaults, javascriptDefaults }
  const editor = {
    getModels: vi.fn().mockReturnValue([]),
  }

  return {
    default: { typescript: ts, editor },
    typescript: ts,
    editor,
  }
})

import * as monaco from 'monaco-editor'
import { loadMonacoProjectContext, clearMonacoProjectContext } from './monacoProjectContext'

// Convenience accessors for the mocked functions
const tsDefaults = monaco.typescript.typescriptDefaults as unknown as {
  setCompilerOptions: ReturnType<typeof vi.fn>
  setDiagnosticsOptions: ReturnType<typeof vi.fn>
  addExtraLib: ReturnType<typeof vi.fn>
}
const jsDefaults = monaco.typescript.javascriptDefaults as unknown as {
  setDiagnosticsOptions: ReturnType<typeof vi.fn>
}
const editorMock = monaco.editor as unknown as {
  getModels: ReturnType<typeof vi.fn>
}

describe('monacoProjectContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearMonacoProjectContext()
    vi.mocked(window.ts.getProjectContext).mockResolvedValue({
      projectRoot: '/project',
      compilerOptions: {},
      files: [],
    })
  })

  describe('loadMonacoProjectContext', () => {
    it('loads project context and sets compiler options', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/project',
        compilerOptions: { strict: true },
        files: [{ path: 'src/index.ts', content: 'const x = 1' }],
      })

      await loadMonacoProjectContext('/project')

      expect(window.ts.getProjectContext).toHaveBeenCalledWith('/project')
      expect(tsDefaults.setCompilerOptions).toHaveBeenCalled()
      expect(tsDefaults.addExtraLib).toHaveBeenCalledWith('const x = 1', '/project/src/index.ts')
    })

    it('skips loading when project root unchanged', async () => {
      await loadMonacoProjectContext('/project')
      vi.clearAllMocks()

      await loadMonacoProjectContext('/project')

      expect(window.ts.getProjectContext).not.toHaveBeenCalled()
    })

    it('disposes previous extra libs when switching projects', async () => {
      const disposeSpy = vi.fn()
      tsDefaults.addExtraLib.mockReturnValue({ dispose: disposeSpy })

      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/project1',
        compilerOptions: {},
        files: [{ path: 'a.ts', content: '' }],
      })

      await loadMonacoProjectContext('/project1')

      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/project2',
        compilerOptions: {},
        files: [],
      })

      await loadMonacoProjectContext('/project2')
      expect(disposeSpy).toHaveBeenCalled()
    })

    it('maps target compiler option', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: { target: 'es2020' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.target).toBe(7) // ES2020
    })

    it('maps module compiler option', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: { module: 'esnext' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.module).toBe(99) // ESNext
    })

    it('maps moduleResolution compiler option', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: { moduleResolution: 'bundler' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.moduleResolution).toBe(2) // NodeJs
    })

    it('maps jsx compiler option', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: { jsx: 'react-jsx' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.jsx).toBe(4) // ReactJSX
    })

    it('maps boolean compiler options', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: {
          strict: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          noEmit: true,
          isolatedModules: true,
        },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.strict).toBe(true)
      expect(opts.esModuleInterop).toBe(true)
      expect(opts.allowSyntheticDefaultImports).toBe(true)
      expect(opts.resolveJsonModule).toBe(true)
      expect(opts.skipLibCheck).toBe(true)
      expect(opts.noEmit).toBe(true)
      expect(opts.isolatedModules).toBe(true)
    })

    it('resolves baseUrl "." to project root', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/proj',
        compilerOptions: { baseUrl: '.' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/proj')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.baseUrl).toBe('/proj')
    })

    it('resolves baseUrl "./" to project root', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/proj',
        compilerOptions: { baseUrl: './' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/proj')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.baseUrl).toBe('/proj')
    })

    it('resolves relative baseUrl', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/proj',
        compilerOptions: { baseUrl: 'src' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/proj')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.baseUrl).toBe('/proj/src')
    })

    it('preserves absolute baseUrl', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/proj',
        compilerOptions: { baseUrl: '/absolute/path' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/proj')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.baseUrl).toBe('/absolute/path')
    })

    it('passes through paths option', async () => {
      const paths = { '@/*': ['src/*'] }
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: { paths },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.paths).toEqual(paths)
    })

    it('forces model re-analysis after loading', async () => {
      const mockSetValue = vi.fn()
      const mockGetValue = vi.fn().mockReturnValue('content')
      editorMock.getModels.mockReturnValue([{ getValue: mockGetValue, setValue: mockSetValue }])

      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: {},
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      expect(mockGetValue).toHaveBeenCalled()
      expect(mockSetValue).toHaveBeenCalledWith('content')
    })

    it('silently catches errors', async () => {
      vi.mocked(window.ts.getProjectContext).mockRejectedValue(new Error('fail'))

      clearMonacoProjectContext()
      await expect(loadMonacoProjectContext('/p')).resolves.toBeUndefined()
    })

    it('suppresses diagnostic codes for missing modules', async () => {
      clearMonacoProjectContext()
      await loadMonacoProjectContext('/project')

      expect(tsDefaults.setDiagnosticsOptions).toHaveBeenCalledWith({
        diagnosticCodesToIgnore: [2875],
      })
    })

    it('disables JS semantic validation', async () => {
      clearMonacoProjectContext()
      await loadMonacoProjectContext('/project')

      expect(jsDefaults.setDiagnosticsOptions).toHaveBeenCalledWith({
        noSemanticValidation: true,
      })
    })

    it('uses fallback values for unknown enum strings', async () => {
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: { target: 'unknown', module: 'unknown', moduleResolution: 'unknown', jsx: 'unknown' },
        files: [],
      })

      clearMonacoProjectContext()
      await loadMonacoProjectContext('/p')

      const opts = tsDefaults.setCompilerOptions.mock.calls[0][0]
      expect(opts.target).toBe(7) // fallback ES2020
      expect(opts.module).toBe(99) // fallback ESNext
      expect(opts.moduleResolution).toBe(2) // fallback NodeJs
      expect(opts.jsx).toBe(4) // fallback ReactJSX
    })
  })

  describe('clearMonacoProjectContext', () => {
    it('disposes all extra libs and resets state', async () => {
      const disposeSpy = vi.fn()
      tsDefaults.addExtraLib.mockReturnValue({ dispose: disposeSpy })

      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: {},
        files: [{ path: 'a.ts', content: '' }],
      })

      await loadMonacoProjectContext('/p')
      clearMonacoProjectContext()

      expect(disposeSpy).toHaveBeenCalled()

      // After clearing, loading same project should work again
      vi.clearAllMocks()
      vi.mocked(window.ts.getProjectContext).mockResolvedValue({
        projectRoot: '/p',
        compilerOptions: {},
        files: [],
      })
      await loadMonacoProjectContext('/p')
      expect(window.ts.getProjectContext).toHaveBeenCalled()
    })
  })
})
