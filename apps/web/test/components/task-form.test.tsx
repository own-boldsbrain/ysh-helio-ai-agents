import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskForm } from '../../components/task-form'
import { useAtom } from 'jotai'

// Mock the dependencies
vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai')
  return {
    ...actual,
    useAtom: vi.fn(),
    useAtomValue: vi.fn(),
    useSetAtom: vi.fn(),
  }
})

vi.mock('@/lib/atoms/task', () => ({
  taskPromptAtom: vi.fn(),
}))

vi.mock('@/lib/atoms/agent-selection', () => ({
  lastSelectedAgentAtom: vi.fn(),
  lastSelectedModelAtomFamily: vi.fn(),
}))

vi.mock('@/lib/atoms/github-cache', () => ({
  githubReposAtomFamily: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock('jotai', () => ({
  useAtom: vi.fn(),
  useAtomValue: vi.fn(),
  useSetAtom: vi.fn(),
}))

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn()
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isSubmitting: false,
    selectedOwner: 'test-owner',
    selectedRepo: 'test-repo'
  }

  beforeEach(() => {
    vi.resetAllMocks()
    
    // Mock the atom hooks
    vi.mocked(useAtom).mockReturnValue(['', vi.fn()]) // taskPrompt
    
    // Mock window.matchMedia for responsive behavior
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
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
  })

  it('renders task form with all required elements', () => {
    render(<TaskForm {...defaultProps} />)

    // Check for prompt textarea
    expect(screen.getByPlaceholderText(/Describe what you want the AI agent to do/i)).toBeInTheDocument()

    // Check for agent selection
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    // Check for submit button
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted with valid data', async () => {
    render(<TaskForm {...defaultProps} />)

    const promptTextarea = screen.getByPlaceholderText(/Describe what you want the AI agent to do/i)
    const submitButton = screen.getByRole('button', { name: /Submit/i })

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
        })
      )
    })
  })

  it('disables submit button when prompt is empty', () => {
    render(<TaskForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /Submit/i })

    // Initially disabled if prompt is empty
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when prompt is entered', async () => {
    render(<TaskForm {...defaultProps} />)

    const promptTextarea = screen.getByPlaceholderText(/Describe what you want the AI agent to do/i)
    const submitButton = screen.getByRole('button', { name: /Submit/i })

    // Fill in the prompt
    fireEvent.change(promptTextarea, { target: { value: 'Test prompt' } })

    // Wait for re-render
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows loading state when isSubmitting is true', () => {
    render(<TaskForm {...defaultProps} isSubmitting={true} />)

    const submitButton = screen.getByRole('button', { name: /Submit/i })

    // Check for loading indicator (spinner)
    expect(submitButton).toBeDisabled()
    expect(submitButton.querySelector('svg')).toBeInTheDocument() // Loader2 icon
  })

  it('displays proper agent options', () => {
    render(<TaskForm {...defaultProps} />)

    const agentSelect = screen.getByRole('combobox')
    fireEvent.click(agentSelect)

    // Check for presence of different agents
    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('Qwen')).toBeInTheDocument()
    expect(screen.getByText('Gemini')).toBeInTheDocument()
  })
})