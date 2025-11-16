import type { Story } from '@ladle/react'

interface ButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => {
  const baseStyles = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  }

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {label}
    </button>
  )
}

// Stories
export const Primary: Story = () => <Button label="Primary Button" />

export const Secondary: Story = () => <Button label="Secondary Button" variant="secondary" />

export const Outline: Story = () => <Button label="Outline Button" variant="outline" />

export const Small: Story = () => <Button label="Small Button" size="sm" />

export const Large: Story = () => <Button label="Large Button" size="lg" />

export const Disabled: Story = () => <Button label="Disabled Button" disabled />

export const WithClick: Story = () => <Button label="Click Me" onClick={() => alert('Button clicked!')} />
