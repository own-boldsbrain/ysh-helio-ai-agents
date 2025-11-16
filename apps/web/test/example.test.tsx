import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Example component for testing
function Button({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
      {label}
    </button>
  )
}

describe('Button Component', () => {
  it('renders with the correct label', () => {
    render(<Button label="Click me" />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies correct classes', () => {
    render(<Button label="Test" />)
    const button = screen.getByText('Test')
    expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded')
  })
})
