import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskForm } from '../../components/task-form'
import { Provider } from 'jotai'

// Mock the dependencies

// Use real Jotai atoms; don't mock these modules to allow actual state handling

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock('@/components/connectors-provider', () => ({
  useConnectors: () => ({ connectors: [] }),
}))

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn()
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isSubmitting: false,
    selectedOwner: 'test-owner',
    selectedRepo: 'test-repo',
  }

  beforeEach(() => {
    vi.resetAllMocks()

    // No explicit mocking for atoms - use real jotai Provider in renders

    // Mock window.matchMedia for responsive behavior
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    // Mock global fetch to handle relative URLs in Node environment
    globalThis.fetch = vi.fn((input: RequestInfo) => {
      const url = String(input)
      if (url.includes('/api/github/repos')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => [
            {
              name: 'test-repo',
              full_name: 'test-owner/test-repo',
              description: 'Test repo',
              private: false,
              clone_url: 'https://github.com/test-owner/test-repo.git',
              language: 'TypeScript',
            },
          ],
          headers: { get: (k: string) => 'application/json' },
        } as any)
      }

      if (url.includes('/api/api-keys/check')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ hasKey: true, provider: 'aigateway', agentName: 'Claude' }),
          headers: { get: (k: string) => 'application/json' },
        } as any)
      }

      // Default fallback
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
        headers: { get: () => 'application/json' },
      } as any)
    })
    // Ensure localStorage is cleared so atomWithStorage starts fresh
    globalThis.localStorage.clear()
  })

  it('renders task form with all required elements', () => {
    render(
      <Provider>
        <TaskForm {...defaultProps} />
      </Provider>,
    )

    // Check for prompt textarea
    expect(screen.getByPlaceholderText(/Describe what you want the AI agent to do/i)).toBeInTheDocument()

    // Check for agent selection (first combobox)
    expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()

    // Check for submit button by type
    expect(screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')).toBeDefined()
  })

  it('calls onSubmit when form is submitted with valid data', async () => {
    render(
      <Provider>
        <TaskForm {...defaultProps} />
      </Provider>,
    )

    const promptTextarea = screen.getByPlaceholderText(/Describe what you want the AI agent to do/i)
    const submitButton = screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!

    // Fill in the prompt
    fireEvent.change(promptTextarea, { target: { value: 'Create a new feature' } })

    // Submit the form
    fireEvent.click(submitButton)

    // Wait for async operations
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Create a new feature',
          repoUrl: expect.any(String),
          selectedAgent: expect.any(String),
          selectedModel: expect.any(String),
          installDependencies: expect.any(Boolean),
          maxDuration: expect.any(Number),
          keepAlive: expect.any(Boolean),
        }),
      )
    })
  })

  it('disables submit button when prompt is empty', () => {
    render(
      <Provider>
        <TaskForm {...defaultProps} />
      </Provider>,
    )

    const submitButton = screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!

    // Initially disabled if prompt is empty
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when prompt is entered', async () => {
    render(
      <Provider>
        <TaskForm {...defaultProps} />
      </Provider>,
    )

    const promptTextarea = screen.getByPlaceholderText(/Describe what you want the AI agent to do/i)
    const submitButton = screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!

    // Fill in the prompt
    fireEvent.change(promptTextarea, { target: { value: 'Test prompt' } })

    // Wait for re-render
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows loading state when isSubmitting is true', () => {
    render(
      <Provider>
        <TaskForm {...defaultProps} isSubmitting={true} />
      </Provider>,
    )

    const submitButton = screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!

    // Check for loading indicator (spinner)
    expect(submitButton).toBeDisabled()
    expect(submitButton.querySelector('svg')).toBeInTheDocument() // Loader2 icon
  })

  it('displays proper agent options', () => {
    render(
      <Provider>
        <TaskForm {...defaultProps} />
      </Provider>,
    )

    const agentSelect = screen.getAllByRole('combobox')[0]
    fireEvent.click(agentSelect)

    // Check for presence of different agents (at least one match for each)
    expect(screen.getAllByText('Claude').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Codex').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Gemini').length).toBeGreaterThanOrEqual(1)
  })
})
