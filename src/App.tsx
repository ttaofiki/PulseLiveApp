import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { CreatePoll } from './pages/CreatePoll'
import { PollManagement } from './pages/PollManagement'
import { Present } from './pages/Present'
import { Vote } from './pages/Vote'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/poll/:id" element={<PollManagement />} />
        <Route path="/poll/:id/present" element={<Present />} />
        <Route path="/vote/:id" element={<Vote />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
