import { Navigate, Route, Routes } from 'react-router-dom'

import { TaxWizard } from '@/module/tax/TaxWizard'

export default function App() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Navigate to="/tax" replace />} />
        <Route path="/tax" element={<TaxWizard />} />
        <Route path="*" element={<Navigate to="/tax" replace />} />
      </Routes>
    </div>
  )
}
