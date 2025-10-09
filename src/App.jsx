import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TaxIdLookup from './components/TaxIdLookup'
import FrontendCallbackReceiver from './components/FrontendCallbackReceiver'
import ApiTesterGet from './components/ApiTesterGet'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - Tax ID Lookup */}
          <Route path="/TaxIdLookup" element={<TaxIdLookup />} />
          
          {/* NSW Callback Handler */}
          <Route path="/nsw-callback" element={<FrontendCallbackReceiver  />} />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/getApi" element={<ApiTesterGet />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App