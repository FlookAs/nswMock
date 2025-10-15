import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TaxIdLookup from './components/TaxIdLookup'
import FrontendCallbackReceiver from './components/FrontendCallbackReceiver'
import ApiTesterGet from './components/ApiTesterGet'
import ApiTesterPost from './components/ApiTesterPost'
import ApiTesterDelete from './components/ApiTesterDelete'
import './App.css'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="App">
        <Routes>
          <Route path="/TaxIdLookup" element={<TaxIdLookup />} />
          <Route path="/nsw-callback" element={<FrontendCallbackReceiver />} />
          <Route path="/" element={<ApiTesterGet />} />
          <Route path="/test-post" element={<ApiTesterPost />} />
          <Route path="/test-delete" element={<ApiTesterDelete />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App