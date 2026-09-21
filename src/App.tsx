import { useEffect } from 'react'
import Home from './pages/Home'
import { initSmoothScroll } from './lib/scroll'

function App() {
  useEffect(() => initSmoothScroll(), [])

  return <Home />
}

export default App
