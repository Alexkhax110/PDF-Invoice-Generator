import React, { useState, useEffect, useRef, memo, useCallback, useLayoutEffect } from 'react';
import { Plus, Download, FileText, Trash2, Upload, X, Share2, Edit, AlertTriangle, Settings, Sun, Moon, GripVertical, RefreshCcw, ChevronDown, ArrowUp, ArrowDown, Search, Sparkles } from 'lucide-react';

// --- Constants ---
const DEFAULT_THEME_COLOR = '#007AFF'; // Apple blue

const CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'CHF', symbol: 'CHF' },
    { code: 'CNY', symbol: '¥' },
    { code: 'HKD', symbol: 'HK$' },
    { code: 'INR', symbol: '₹' },
    { code: 'NZD', symbol: 'NZ$' },
    { code: 'SGD', symbol: 'S$' },
    { code: 'AED', symbol: 'د.إ' },
    { code: 'PKR', symbol: '₨' },
    { code: 'SAR', symbol: '﷼' },
];

// --- Reusable Notification Component ---
const Notification = memo(({ message, show, type, onDismiss }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    if (!show) return null;

    return (
        <div className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out ${
            show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
        }`}>
            <div className={`backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/20 max-w-sm ${
                type === 'success'
                    ? 'bg-green-500/90 text-white'
                    : 'bg-red-500/90 text-white'
            }`}>
                <div className="flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span className="font-medium">{message}</span>
                </div>
            </div>
        </div>
    );
});

// --- Currency Dropdown Component ---
const CurrencyDropdown = ({ selectedCurrency, onCurrencyChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredCurrencies = CURRENCIES.filter(currency =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.includes(searchTerm)
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-4 py-3 text-left flex justify-between items-center hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedCurrency.code}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl max-h-64 overflow-hidden">
                    <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input
                                type="text"
                                placeholder="Search currency..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredCurrencies.map(currency => (
                            <button
                                key={currency.code}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors duration-150 text-sm"
                                onClick={() => {
                                    onCurrencyChange(currency);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                <span className="font-medium text-gray-900 dark:text-gray-100">{currency.code}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">({currency.symbol})</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Invoice List Component ---
const InvoiceList = memo(({ invoices, onSelect, onDelete }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Invoices</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
            {invoices.length > 0 ? invoices.map(inv => (
                <div key={inv.id} className="group bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200/30 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div onClick={() => onSelect(inv)} className="flex-grow cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{inv.invoiceNumber}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{inv.billTo.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    {inv.currency?.symbol || '$'}{(inv.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0) * (1 + Number(inv.tax) / 100) - Number(inv.discount)).toFixed(2)}
                                </p>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                    inv.status === 'paid'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                }`}>
                                    {inv.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => onSelect(inv)}
                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        >
                            <Edit size={16}/>
                        </button>
                        <button
                            onClick={() => onDelete(inv.id)}
                            className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                </div>
            )) : (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No invoices yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first invoice to get started</p>
                </div>
            )}
        </div>
    </div>
));

// --- Download Modal Component ---
const DownloadModal = memo(({ isOpen, onClose, downloadJPG, downloadPDF, setDownloadModalOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md relative shadow-2xl border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
                >
                    <X size={18} />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Download className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Download Invoice</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Choose your preferred format</p>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            downloadPDF();
                            setDownloadModalOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-medium"
                    >
                        <Download size={20} />
                        <span>Download PDF</span>
                    </button>
                    <button
                        onClick={() => {
                            downloadJPG();
                            setDownloadModalOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-medium"
                    >
                        <Download size={20} />
                        <span>Download JPG</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- Confirmation Modal Component ---
const ConfirmationModal = memo(({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{message}</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 hover:scale-[1.02] transition-all duration-200 shadow-lg"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- Settings Modal Component ---
const SettingsModal = memo(({ isOpen, onClose, themeColor, setThemeColor, clearAllData, resetTheme }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md relative shadow-2xl border border-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
                >
                    <X size={18} />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Settings className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Theme Color</label>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
                                <input
                                    type="color"
                                    value={themeColor}
                                    onChange={(e) => setThemeColor(e.target.value)}
                                    className="w-full h-full border-none cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="flex-1 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-mono"
                            />
                            <button
                                onClick={resetTheme}
                                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
                                title="Reset to default"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Data Management</label>
                        <button
                            onClick={clearAllData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 hover:scale-[1.02] transition-all duration-200 shadow-lg"
                        >
                            <Trash2 size={16} />
                            <span>Clear All Data</span>
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                            This will permanently delete all invoices and settings. This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
})

// --- Main App Component ---
export default function App() {

    const getInitialInvoiceState = useCallback(() => {
        return {
            id: null,
            logo: null,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            billFrom: { name: '', email: '', address: '' },
            billTo: { name: '', email: '', address: '' },
            items: [{ description: '', quantity: 1, price: 0.00, id: crypto.randomUUID() }],
            tax: 0.0,
            discount: 0.00,
            notes: "Thank you for your business! We appreciate your prompt payment.",
            status: 'unpaid',
            currency: CURRENCIES[0]
        };
    }, []);

    const getInitialDarkMode = () => {
        if (typeof window === 'undefined') return false;
        // Respect user's system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const [isLoading, setIsLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(getInitialInvoiceState);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', show: false, type: 'success' });
    const [darkMode, setDarkMode] = useState(getInitialDarkMode);
    const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
    const [draggedItem, setDraggedItem] = useState(null);
    const [openSection, setOpenSection] = useState(null);

    const invoicePreviewRef = useRef(null);
    const logoInputRef = useRef(null);
    // Dark Mode Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);


    // Initialize data
    useEffect(() => {
        setIsLoading(false);
    }, []);

    // --- Script Loading Effect ---
    useEffect(() => {
        const loadScript = (src, id) => {
            return new Promise((resolve, reject) => {
                if (document.getElementById(id)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.id = id;
                script.src = src;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Script load error for ${src}`));
                document.body.appendChild(script);
            });
        };

        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf-script")
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas-script"))
            .catch(error => console.error("Error loading external scripts:", error));
    }, []);

    const handleInputChange = useCallback((e, path) => {
        const { name, value } = e.target;
        setCurrentInvoice(prev => {
            const keys = path.split('.');
            const updatedInvoice = JSON.parse(JSON.stringify(prev));
            let current = updatedInvoice;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]][name] = value;
            return updatedInvoice;
        });
    }, []);

    const handleItemChange = useCallback((index, e) => {
        const { name, value } = e.target;
        setCurrentInvoice(prev => {
            const items = [...prev.items];
            items[index] = { ...items[index], [name]: value };
            return { ...prev, items };
        });
    }, []);

    const handleLogoChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentInvoice(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleAddItem = useCallback(() => {
        setCurrentInvoice(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, price: 0.00, id: crypto.randomUUID() }]
        }));
    }, []);

    const handleCurrencyChange = useCallback((currency) => {
        setCurrentInvoice(prev => ({ ...prev, currency }));
    }, []);

    const handleRemoveItem = useCallback((index) => {
        setCurrentInvoice(prev => {
            const items = [...prev.items];
            items.splice(index, 1);
            return { ...prev, items };
        });
    }, []);

    const handleToggleSection = (section) => {
        setOpenSection(prev => prev === section ? null : section);
    }

    const handleMoveItem = useCallback((index, direction) => {
        setCurrentInvoice(prev => {
            const newItems = [...prev.items];
            const item = newItems[index];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= newItems.length) {
                return prev;
            }
            newItems.splice(index, 1);
            newItems.splice(newIndex, 0, item);
            return { ...prev, items: newItems };
        })
    }, [])

    const saveInvoice = useCallback(() => {
        setInvoices(prevInvoices => {
            if(currentInvoice.id) {
                return prevInvoices.map(inv => inv.id === currentInvoice.id ? currentInvoice : inv);
            } else {
                const newInvoice = { ...currentInvoice, id: crypto.randomUUID() };
                setCurrentInvoice(newInvoice);
                return [...prevInvoices, newInvoice];
            }
        });
        setNotification({ message: 'Invoice saved successfully!', show: true, type: 'success' });
    }, [currentInvoice]);

    const createNewInvoice = useCallback(() => {
        setCurrentInvoice(getInitialInvoiceState());
    }, [getInitialInvoiceState]);

    const handleDeleteInvoice = useCallback(async () => {
        if(invoiceToDelete === 'all') {
            setInvoices([]);
            createNewInvoice();
            setNotification({ message: "All data cleared!", show: true, type: "success" });
        } else {
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete));
            setNotification({ message: 'Invoice deleted!', show: true, type: 'success' });
            if (currentInvoice.id === invoiceToDelete) {
                createNewInvoice();
            }
        }
        setConfirmModalOpen(false);
        setInvoiceToDelete(null);
    }, [invoiceToDelete, currentInvoice.id, createNewInvoice]);

    const confirmDelete = (invoiceId) => {
        setInvoiceToDelete(invoiceId);
        setConfirmModalOpen(true);
    };

    const downloadJPG = useCallback(() => {
        const input = invoicePreviewRef.current;
        if (!window.html2canvas) {
            setNotification({ message: 'JPG generation library not found.', show: true, type: 'error' });
            return;
        }

        setNotification({ message: 'Generating JPG...', show: true, type: 'success' });

        // Improved configuration for better quality and handling of content overflow
        window.html2canvas(input, { 
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            height: input.scrollHeight,
            width: input.scrollWidth,
            scrollX: 0,
            scrollY: 0,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `invoice-${currentInvoice.invoiceNumber}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setNotification({ message: 'JPG downloaded successfully!', show: true, type: 'success' });
        }).catch(err => {
             setNotification({ message: 'Could not generate JPG.', show: true, type: 'error' });
        })
    }, [currentInvoice.invoiceNumber]);

    const downloadPDF = useCallback(() => {
        const input = invoicePreviewRef.current;

        if (!window.html2canvas || !window.jspdf) {
            console.error("PDF generation libraries not loaded.");
            setNotification({ message: 'PDF generation library not found.', show: true, type: 'error' });
            return;
        }

        setNotification({ message: 'Generating PDF...', show: true, type: 'success' });

        const html2canvas = window.html2canvas;
        const { jsPDF } = window.jspdf;

        // Improved configuration for better quality and handling of content overflow
        html2canvas(input, { 
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            height: input.scrollHeight,
            width: input.scrollWidth,
            scrollX: 0,
            scrollY: 0,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        }).then(canvas => {
            // Convert canvas to JPEG for better compression
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Calculate PDF dimensions based on content
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // Use A4 proportions but adjust for content
            const pdfWidth = 8.5; // inches
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
            
            const pdf = new jsPDF('p', 'in', [pdfWidth, pdfHeight]);
            pdf.viewerPreferences({'FitWindow': true}, true);

            // Add the image as JPEG with FAST compression
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

            pdf.save(`invoice-${currentInvoice.invoiceNumber}.pdf`);
            setNotification({ message: 'PDF downloaded successfully!', show: true, type: 'success' });
        }).catch(err => {
            console.error("Error generating PDF:", err);
            setNotification({ message: 'Could not generate PDF.', show: true, type: 'error' });
        });
    }, [currentInvoice.invoiceNumber]);

    const selectInvoiceToEdit = useCallback((invoice) => {
        setCurrentInvoice(invoice);
    }, []);

    const clearAllData = () => {
        setConfirmModalOpen(true);
        setInvoiceToDelete('all');
    }

    const resetTheme = () => {
        setThemeColor(DEFAULT_THEME_COLOR);
    }

    // Calculations
    const subtotal = currentInvoice.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0);
    const taxAmount = (subtotal * Number(currentInvoice.tax)) / 100;
    const total = subtotal + taxAmount - Number(currentInvoice.discount);

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-pulse mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
            <Notification
                message={notification.message}
                show={notification.show}
                type={notification.type}
                onDismiss={() => setNotification({ ...notification, show: false })}
            />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <FileText className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Generator</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Create professional invoices instantly</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button
                                onClick={() => setSettingsModalOpen(true)}
                                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={createNewInvoice}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                            >
                                <Plus size={20} />
                                <span>New Invoice</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left Column: Form & Lists */}
                    <div className="space-y-8">
                        <InvoiceList invoices={invoices} onSelect={selectInvoiceToEdit} onDelete={confirmDelete} />

                        {/* Invoice Form */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Invoice Details</h2>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={currentInvoice.invoiceNumber}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, invoiceNumber: e.target.value})}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Issue Date</label>
                                    <input
                                        type="date"
                                        value={currentInvoice.issueDate}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, issueDate: e.target.value})}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={currentInvoice.dueDate}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, dueDate: e.target.value})}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Company & Customer Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Company Details</h3>
                                    <input
                                        placeholder="Your Company Name"
                                        name="name"
                                        value={currentInvoice.billFrom.name}
                                        onChange={(e) => handleInputChange(e, 'billFrom')}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                    <input
                                        placeholder="your@email.com"
                                        name="email"
                                        value={currentInvoice.billFrom.email}
                                        onChange={(e) => handleInputChange(e, 'billFrom')}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                    <textarea
                                        placeholder="Company Address"
                                        name="address"
                                        value={currentInvoice.billFrom.address}
                                        onChange={(e) => handleInputChange(e, 'billFrom')}
                                        rows="3"
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current.click()}
                                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm font-medium transition-all duration-200"
                                            >
                                                <Upload size={16} />
                                                <span>Upload</span>
                                            </button>
                                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                            <CurrencyDropdown selectedCurrency={currentInvoice.currency} onCurrencyChange={handleCurrencyChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Customer Details</h3>
                                    <input
                                        placeholder="Client Name"
                                        name="name"
                                        value={currentInvoice.billTo.name}
                                        onChange={(e) => handleInputChange(e, 'billTo')}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                    <input
                                        placeholder="Client Email"
                                        name="email"
                                        value={currentInvoice.billTo.email}
                                        onChange={(e) => handleInputChange(e, 'billTo')}
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                    <textarea
                                        placeholder="Client Address"
                                        name="address"
                                        value={currentInvoice.billTo.address}
                                        onChange={(e) => handleInputChange(e, 'billTo')}
                                        rows="3"
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4 mb-8">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Items</h3>
                                <div className="space-y-3">
                                    {currentInvoice.items.map((item, index) => (
                                        <div key={item.id} className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-4">
                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                <div className="col-span-1 flex flex-col items-center text-gray-700 dark:text-gray-300">
                                                    <button
                                                        onClick={() => handleMoveItem(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                                                    >
                                                        <ArrowUp size={14}/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveItem(index, 'down')}
                                                        disabled={index === currentInvoice.items.length-1}
                                                        className="p-1 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                                                    >
                                                        <ArrowDown size={14}/>
                                                    </button>
                                                </div>
                                                <input
                                                    name="description"
                                                    placeholder="Item description"
                                                    value={item.description}
                                                    onChange={e => handleItemChange(index, e)}
                                                    className="col-span-7 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                />
                                                <input
                                                    name="quantity"
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, e)}
                                                    className="col-span-2 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                />
                                                <input
                                                    name="price"
                                                    type="number"
                                                    placeholder="Price"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={e => handleItemChange(index, e)}
                                                    className="col-span-2 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Total: {currentInvoice.currency.symbol}{(Number(item.quantity) * Number(item.price)).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all duration-200"
                                >
                                    <Plus size={16} />
                                    <span>Add Item</span>
                                </button>
                            </div>

                            {/* Totals & Notes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                                    <textarea
                                        value={currentInvoice.notes}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})}
                                        rows="4"
                                        className="w-full bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                        placeholder="Additional notes or payment terms..."
                                    />
                                </div>
                                <div className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Tax (%)</span>
                                        <input
                                            type="number"
                                            value={currentInvoice.tax}
                                            onChange={(e) => setCurrentInvoice({...currentInvoice, tax: e.target.value})}
                                            className="w-20 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-right text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Discount ({currentInvoice.currency.symbol})</span>
                                        <input
                                            type="number"
                                            value={currentInvoice.discount}
                                            onChange={(e) => setCurrentInvoice({...currentInvoice, discount: e.target.value})}
                                            className="w-20 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-right text-sm"
                                        />
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>{currentInvoice.currency.symbol}{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview & Actions */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <button
                                    onClick={saveInvoice}
                                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                                >
                                    <span>Save Invoice</span>
                                </button>
                                <button
                                    onClick={() => setDownloadModalOpen(true)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                                >
                                    <Download size={18} />
                                    <span>Download</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-center space-x-4">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                                <button
                                    onClick={() => setCurrentInvoice({...currentInvoice, status: 'paid'})}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        currentInvoice.status === 'paid'
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Paid
                                </button>
                                <button
                                    onClick={() => setCurrentInvoice({...currentInvoice, status: 'unpaid'})}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        currentInvoice.status === 'unpaid'
                                            ? 'bg-yellow-500 text-white shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Unpaid
                                </button>
                            </div>
                        </div>

                        {/* Invoice Preview */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
                            <div ref={invoicePreviewRef} className="bg-white p-8 text-gray-900">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        {currentInvoice.logo && (
                                            <div className="mb-6 w-32 h-24 flex items-center justify-start">
                                                <img 
                                                    src={currentInvoice.logo} 
                                                    alt="Company Logo" 
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{ 
                                                        width: 'auto', 
                                                        height: 'auto',
                                                        maxWidth: '128px',
                                                        maxHeight: '96px'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentInvoice.billFrom.name || 'Your Company'}</h1>
                                        <div className="text-gray-600 space-y-1">
                                            <p>{currentInvoice.billFrom.address || 'Company Address'}</p>
                                            <p>{currentInvoice.billFrom.email || 'your@email.com'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                                        <p className="text-gray-600 text-lg">#{currentInvoice.invoiceNumber}</p>
                                    </div>
                                </div>

                                {/* Bill To & Dates */}
                                <div className="grid grid-cols-2 gap-12 mb-12">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900">{currentInvoice.billTo.name || 'Client Name'}</p>
                                            <p className="text-gray-600">{currentInvoice.billTo.address || 'Client Address'}</p>
                                            <p className="text-gray-600">{currentInvoice.billTo.email || 'client@email.com'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-4">
                                        <div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Invoice Date</p>
                                            <p className="text-gray-900 font-medium">{currentInvoice.issueDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Due Date</p>
                                            <p className="text-gray-900 font-medium">{currentInvoice.dueDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-12">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-900">
                                                <th className="text-left font-bold text-gray-900 py-3 uppercase tracking-wider text-sm">Description</th>
                                                <th className="text-center font-bold text-gray-900 py-3 uppercase tracking-wider text-sm">Qty</th>
                                                <th className="text-right font-bold text-gray-900 py-3 uppercase tracking-wider text-sm">Rate</th>
                                                <th className="text-right font-bold text-gray-900 py-3 uppercase tracking-wider text-sm">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentInvoice.items.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-200">
                                                    <td className="py-4 text-gray-900">{item.description || 'Item description'}</td>
                                                    <td className="text-center py-4 text-gray-900">{item.quantity}</td>
                                                    <td className="text-right py-4 text-gray-900">{currentInvoice.currency.symbol}{Number(item.price).toFixed(2)}</td>
                                                    <td className="text-right py-4 font-medium text-gray-900">{currentInvoice.currency.symbol}{(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end mb-12">
                                    <div className="w-80">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span>{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Tax ({currentInvoice.tax}%)</span>
                                                <span>{currentInvoice.currency.symbol}{taxAmount.toFixed(2)}</span>
                                            </div>
                                            {Number(currentInvoice.discount) > 0 && (
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Discount</span>
                                                    <span>-{currentInvoice.currency.symbol}{Number(currentInvoice.discount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t-2 border-gray-200 my-4"></div>
                                            <div className="flex justify-between font-bold text-xl text-gray-900">
                                                <span>Total</span>
                                                <span>{currentInvoice.currency.symbol}{total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                                            <div className="flex justify-between font-bold text-lg text-gray-900">
                                                <span>Amount Due</span>
                                                <span style={{color: themeColor}}>{currentInvoice.currency.symbol}{total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {currentInvoice.notes && (
                                    <div className="mb-8">
                                        <h4 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-3">Notes</h4>
                                        <p className="text-gray-600 leading-relaxed">{currentInvoice.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {isDownloadModalOpen && (
                <DownloadModal
                    isOpen={isDownloadModalOpen}
                    onClose={() => setDownloadModalOpen(false)}
                    downloadJPG={downloadJPG}
                    downloadPDF={downloadPDF}
                    setDownloadModalOpen={setDownloadModalOpen}
                />
            )}

            {isConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleDeleteInvoice}
                    title={invoiceToDelete === 'all' ? "Clear All Data" : "Delete Invoice"}
                    message={invoiceToDelete === 'all' ? "Are you sure you want to delete all invoices and settings? This action cannot be undone." : "Are you sure you want to delete this invoice? This action cannot be undone."}
                />
            )}

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                themeColor={themeColor}
                setThemeColor={setThemeColor}
                clearAllData={clearAllData}
                resetTheme={resetTheme}
            />
        </div>
    );
}