import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import { elementColors } from './PeriodicTable';
import AtomViewer from './AtomViewer';

const ElementDetail = () => {
    const { atomicNumber } = useParams();
    const [element, setElement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json')
            .then(response => response.json())
            .then(data => {
                const foundElement = data.elements.find(el => el.number === parseInt(atomicNumber));
                setElement(foundElement);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching element data:', error);
                setLoading(false);
            });
    }, [atomicNumber]);

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!element) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="text-center p-8 bg-white rounded-lg shadow-sm mx-auto max-w-2xl mt-8">
                    <h2 className="text-xl text-gray-700 mb-4">Element not found</h2>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                        Return to Periodic Table
                    </Link>
                </div>
            </div>
        );
    }

    const elementColor = elementColors[element.category.replace(/\s+/g, '-').toLowerCase()] || 'bg-gray-100';

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left side: Element details */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                        {/* Element header */}
                        <div className={`p-6 ${elementColor}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800">
                                        {element.name} <span className="text-xl">({element.symbol})</span>
                                    </h1>
                                    <p className="text-gray-700 mt-1">
                                        {element.category}
                                    </p>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center">
                                    <div className="text-4xl font-bold mr-2 text-gray-800">{element.number}</div>
                                    <div className="text-gray-600 text-sm">Atomic Number</div>
                                </div>
                            </div>
                        </div>

                        {/* Element details */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium text-gray-600">Atomic Mass:</span>
                                        <span>{element.atomic_mass}</span>
                                    </div>

                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium text-gray-600">Phase:</span>
                                        <span>{element.phase}</span>
                                    </div>

                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium text-gray-600">Density:</span>
                                        <span>{element.density} g/cm³</span>
                                    </div>

                                    {element.discovered_by && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-medium text-gray-600">Discovered by:</span>
                                            <span>{element.discovered_by}</span>
                                        </div>
                                    )}

                                    {element.named_by && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-medium text-gray-600">Named by:</span>
                                            <span>{element.named_by}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium text-gray-600">Electron Configuration:</span>
                                        <span className="font-mono text-sm">{element.electron_configuration}</span>
                                    </div>

                                    {element.electron_configuration_semantic && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-medium text-gray-600">Semantic:</span>
                                            <span className="font-mono text-sm">{element.electron_configuration_semantic}</span>
                                        </div>
                                    )}

                                    {element.electronegativity_pauling && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-medium text-gray-600">Electronegativity:</span>
                                            <span>{element.electronegativity_pauling}</span>
                                        </div>
                                    )}

                                    {element.appearance && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-medium text-gray-600">Appearance:</span>
                                            <span>{element.appearance}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Summary</h3>
                                <p className="text-gray-700">{element.summary}</p>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                                <a
                                    href={element.source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    View on Wikipedia
                                </a>
                                <Link
                                    to="/"
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Back to Periodic Table
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: 3D Atom Model - Full height */}
                <div className="relative bg-[#050510] overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
                    <h3 className="absolute text-lg font-medium text-white p-4 z-10 border-b border-gray-700 bg-[#050510] w-full">
                        3D Atom Model
                    </h3>
                    <div className="absolute inset-0 pt-16">
                        <AtomViewer element={element} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElementDetail; 