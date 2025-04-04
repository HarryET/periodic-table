import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PeriodicTable from './components/PeriodicTable';
import ElementDetail from './components/ElementDetail';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-full justify-between bg-gray-50">
        <main className="w-full h-full">
          <Routes>
            <Route path="/" element={<PeriodicTable />} />
            <Route path="/element/:atomicNumber" element={<ElementDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
