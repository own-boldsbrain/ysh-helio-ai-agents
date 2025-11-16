import type { Story } from '@ladle/react'

interface CardProps {
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'elevated' | 'bordered'
}

export const Card: React.FC<CardProps> = ({ title, description, children, footer, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    bordered: 'bg-white border-2 border-gray-200',
  }

  return (
    <div className={`rounded-lg p-6 ${variantStyles[variant]}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {children && <div className="mb-4">{children}</div>}
      {footer && <div className="border-t pt-4 mt-4">{footer}</div>}
    </div>
  )
}

// Stories
export const Default: Story = () => (
  <Card title="Default Card" description="This is a simple card with default styling">
    <p className="text-gray-700">Card content goes here...</p>
  </Card>
)

export const Elevated: Story = () => (
  <Card title="Elevated Card" description="This card has a shadow effect" variant="elevated">
    <p className="text-gray-700">Elevated cards stand out from the background.</p>
  </Card>
)

export const Bordered: Story = () => (
  <Card title="Bordered Card" description="This card has a border" variant="bordered">
    <p className="text-gray-700">Bordered cards provide clear separation.</p>
  </Card>
)

export const WithFooter: Story = () => (
  <Card
    title="Card with Footer"
    description="This card includes a footer section"
    footer={
      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
      </div>
    }
  >
    <p className="text-gray-700">Form or action content here...</p>
  </Card>
)
