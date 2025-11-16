import Editor from '@monaco-editor/react'
import { Card, Title, AreaChart, BarChart, DonutChart } from '@tremor/react'
import { useState } from 'react'

const chartdata = [
  {
    date: 'Jan 23',
    SemiAnalysis: 2890,
    'The Pragmatic Engineer': 2338,
  },
  {
    date: 'Feb 23',
    SemiAnalysis: 2756,
    'The Pragmatic Engineer': 2103,
  },
  {
    date: 'Mar 23',
    SemiAnalysis: 3322,
    'The Pragmatic Engineer': 2194,
  },
  {
    date: 'Apr 23',
    SemiAnalysis: 3470,
    'The Pragmatic Engineer': 2108,
  },
  {
    date: 'May 23',
    SemiAnalysis: 3475,
    'The Pragmatic Engineer': 1812,
  },
  {
    date: 'Jun 23',
    SemiAnalysis: 3129,
    'The Pragmatic Engineer': 1726,
  },
]

const cities = [
  { name: 'New York', sales: 9800 },
  { name: 'London', sales: 4567 },
  { name: 'Hong Kong', sales: 3908 },
  { name: 'San Francisco', sales: 2400 },
  { name: 'Singapore', sales: 1908 },
]

function App() {
  const [code, setCode] = useState<string>(`// Welcome to Monaco Editor + Tremor Playground!
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
`)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vite Playground</h1>
          <p className="text-gray-600">Monaco Editor + Tremor Charts Demo</p>
        </div>

        {/* Monaco Editor Section */}
        <Card>
          <Title>Monaco Code Editor</Title>
          <div className="mt-4 border rounded-lg overflow-hidden">
            <Editor
              height="300px"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </Card>

        {/* Tremor Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Title>Newsletter Revenue</Title>
            <AreaChart
              className="mt-4 h-72"
              data={chartdata}
              index="date"
              categories={['SemiAnalysis', 'The Pragmatic Engineer']}
              colors={['indigo', 'cyan']}
              yAxisWidth={60}
            />
          </Card>

          <Card>
            <Title>Sales by City</Title>
            <BarChart
              className="mt-4 h-72"
              data={cities}
              index="name"
              categories={['sales']}
              colors={['blue']}
              yAxisWidth={48}
            />
          </Card>

          <Card>
            <Title>Sales Distribution</Title>
            <DonutChart
              className="mt-4"
              data={cities}
              category="sales"
              index="name"
              colors={['slate', 'violet', 'indigo', 'rose', 'cyan']}
            />
          </Card>

          <Card>
            <Title>Performance Metrics</Title>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Build Time</span>
                <span className="text-lg font-semibold">1.2s ⚡</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">HMR Update</span>
                <span className="text-lg font-semibold">&lt;50ms 🚀</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bundle Size</span>
                <span className="text-lg font-semibold">45kb 📦</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
