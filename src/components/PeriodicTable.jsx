import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

export const elementColors = {
  'alkali metal': 'bg-red-400',
  'alkaline earth metal': 'bg-orange-300',
  'lanthanide': 'bg-purple-300',
  'actinide': 'bg-pink-300',
  'transition metal': 'bg-yellow-300',
  'post-transition metal': 'bg-blue-200',
  'metalloid': 'bg-green-300',
  'polyatomic nonmetal': 'bg-green-400',
  'diatomic nonmetal': 'bg-green-500',
  'noble gas': 'bg-cyan-300',
  'halogen': 'bg-indigo-300',
  'unknown': 'bg-gray-300',
  // Fallbacks for alternative naming formats
  'alkali-metal': 'bg-red-400',
  'alkaline-earth-metal': 'bg-orange-300', 
  'transition-metal': 'bg-yellow-300',
  'post-transition-metal': 'bg-blue-200',
  'nonmetal': 'bg-green-400',
  'noble-gas': 'bg-cyan-300',
}

const PeriodicTable = () => {
  const [elements, setElements] = useState([]);
  const [filteredElements, setFilteredElements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json')
      .then(response => response.json())
      .then(data => {
        // Filter out elements with null xpos/ypos as they are placeholders
        const positionedElements = data.elements.filter(el => el.xpos != null && el.ypos != null);
        
        // Sort elements by atomic number for the list view
        const sortedElements = [...positionedElements].sort((a, b) => a.number - b.number);
        
        setElements(sortedElements);
        setFilteredElements(sortedElements);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching periodic table data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = elements.filter(element => 
        element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.number.toString().includes(searchTerm) ||
        (element.category && element.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredElements(filtered);
    } else {
      setFilteredElements(elements);
    }
  }, [searchTerm, elements]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Determine grid size dynamically based on the original elements (not filtered)
  // to maintain table structure
  const maxRow = elements.length > 0 ? Math.max(...elements.map(el => el.ypos)) : 0;
  const maxCol = elements.length > 0 ? Math.max(...elements.map(el => el.xpos)) : 0;

  // Generate an array with placeholders for the grid
  const gridPlaceholders = [];
  for (let i = 1; i <= maxRow; i++) {
    for (let j = 1; j <= maxCol; j++) {
      const element = elements.find(el => el.ypos === i && el.xpos === j);
      if (element) {
        gridPlaceholders.push(element);
      } else {
        // Empty cell
        gridPlaceholders.push({
          number: `empty-${i}-${j}`,
          ypos: i,
          xpos: j,
          empty: true
        });
      }
    }
  }

  return (
    <div className="flex flex-col w-full h-full flex-grow">
      <Header searchTerm={searchTerm} onSearchChange={handleSearch} />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredElements.length === 0 ? (
            <div className="text-center p-8 text-gray-700">
              No elements found matching "{searchTerm}"
            </div>
          ) : (
            <>
              {/* Grid view for desktop - hidden on mobile */}
              <div className="hidden md:flex overflow-auto p-2 w-full h-full flex-col justify-center items-center">
                <div 
                  className="mx-auto flex justify-center"
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: `repeat(${maxRow}, 70px)`,
                      gridTemplateColumns: `repeat(${maxCol}, 70px)`,
                      gap: '4px',
                      maxWidth: '100%'
                    }}
                  >
                    {gridPlaceholders.map(element => {
                      if (element.empty) {
                        return (
                          <div key={element.number} 
                              style={{ gridRow: element.ypos, gridColumn: element.xpos }}>
                          </div>
                        );
                      }
                      
                      // Only show elements that are in filteredElements
                      const filteredElement = filteredElements.find(el => el.number === element.number);
                      if (!filteredElement) {
                        return (
                          <div key={element.number} 
                              style={{ gridRow: element.ypos, gridColumn: element.xpos }}>
                          </div>
                        );
                      }
                      
                      const elementColor = elementColors[element.category.replace(/\s+/g, '-').toLowerCase()] || 'bg-gray-100';
                      
                      return (
                        <Link 
                          key={element.number}
                          to={`/element/${element.number}`}
                          className={`relative flex flex-col justify-center items-center rounded shadow-sm hover:shadow-md transition-shadow ${elementColor} aspect-square`}
                          style={{ gridRow: element.ypos, gridColumn: element.xpos }}
                          title={`${element.name} (${element.number})`}
                        >
                          <span className="absolute top-1 left-1 text-xs text-gray-700">{element.number}</span>
                          <span className="text-lg font-bold">{element.symbol}</span>
                          <span className="text-[10px] truncate w-full text-center mt-1">{element.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* List view for mobile */}
              <div className="md:hidden p-4">
                <div className="grid grid-cols-1 gap-3">
                  {filteredElements.map(element => {
                    const elementColor = elementColors[element.category.replace(/\s+/g, '-').toLowerCase()] || 'bg-gray-100';
                    
                    return (
                      <Link 
                        key={element.number}
                        to={`/element/${element.number}`}
                        className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3"
                      >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center mr-4 ${elementColor}`}>
                          <span className="text-2xl font-bold">{element.symbol}</span>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{element.name}</h3>
                          <p className="text-sm text-gray-600">
                            #{element.number} · {element.category}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PeriodicTable; 