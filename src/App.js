import React, { useState, useEffect, useRef, memo, useCallback, useLayoutEffect } from 'react';
import { Plus, Download, FileText, Trash2, Upload, X, Share2, Edit, AlertTriangle, Settings, Sun, Moon, GripVertical, RefreshCcw, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

// --- Constants ---
const DEFAULT_THEME_COLOR = '#e6e7eb'; // A neutral light gray

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
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    if (!show) return null;

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300";
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const visibilityClass = show ? 'opacity-100' : 'opacity-0';

    return (
        <div className={`${baseClasses} ${typeClasses} ${visibilityClass}`}>
            {message}
        </div>
    );
});

// --- Child Components ---
const InvoiceList = memo(({ invoices, onSelect, onDelete }) => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Invoices</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
            {invoices.length > 0 ? invoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div onClick={() => onSelect(inv)} className="flex-grow cursor-pointer">
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">{inv.invoiceNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{inv.billTo.name}</p>
                    </div>
                    <div className="text-right flex items-center">
                       <div className="mr-4">
                           <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                               {inv.currency?.symbol || '$'}{(inv.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0) * (1 + Number(inv.tax) / 100) - Number(inv.discount)).toFixed(2)}
                           </p>
                           <span className={`px-2 py-1 text-xs rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>{inv.status}</span>
                       </div>
                       <button onClick={() => onSelect(inv)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Edit size={16}/></button>
                       <button onClick={() => onDelete(inv.id)} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                    </div>
                </div>
            )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No invoices yet.</p>}
        </div>
    </div>
));

const DownloadModal = memo(({ isOpen, onClose, downloadJPG, downloadPDF }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><X /></button>
                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Download Invoice</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={downloadPDF} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition">
                        <Download size={18} /> Download PDF
                    </button>
                    <button onClick={downloadJPG} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600 transition">
                        <Download size={18} /> Download JPG
                    </button>
                </div>
            </div>
        </div>
    );
});


const ConfirmationModal = memo(({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-200">{title}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button onClick={onConfirm} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                        Confirm
                    </button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
});

const SettingsModal = memo(({ isOpen, onClose, themeColor, setThemeColor, clearAllData, resetTheme }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><X /></button>
                 <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Settings</h2>
                 
                 <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Theme Color</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md"/>
                            <input type="text" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700"/>
                             <button onClick={resetTheme} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="Reset to default color">
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Management</label>
                        <button onClick={clearAllData} className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition">
                            <Trash2 size={16} /> Clear All Data
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This will permanently delete all invoices and settings. This action cannot be undone.</p>
                    </div>
                 </div>
            </div>
        </div>
    )
})

// --- Main App Component ---
export default function App() {
    
    const getInitialInvoiceState = useCallback(() => {
        const savedBillFrom = JSON.parse(localStorage.getItem('billFromDetails'));
        const savedLogo = localStorage.getItem('companyLogo');

        return {
            id: null,
            logo: savedLogo || null,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            billFrom: savedBillFrom || { name: 'Your Company', email: 'your@company.com', address: '123 Main St, City, Country' },
            billTo: { name: '', email: '', address: '' },
            items: [{ description: '', quantity: 1, price: 0.00, id: crypto.randomUUID() }],
            tax: 0.0,
            discount: 0.00,
            notes: "Grateful for your business, Your timely payment means a lot!",
            status: 'unpaid',
            currency: CURRENCIES[0] // Default to USD
        };
    }, []);
    
    // Function to safely get initial dark mode from localStorage
    const getInitialDarkMode = () => {
        if (typeof window === 'undefined') {
            return false; // Default for server-side rendering
        }
        return localStorage.getItem('darkMode') === 'true';
    };

    const [isLoading, setIsLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(getInitialInvoiceState);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', show: false, type: 'success' });
    const [darkMode, setDarkMode] = useState(getInitialDarkMode); // Initialize state from function
    const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
    const [draggedItem, setDraggedItem] = useState(null);
    const [openSection, setOpenSection] = useState(null);
    
    const invoicePreviewRef = useRef(null);
    const logoInputRef = useRef(null);

    // --- Data Persistence Effects (localStorage) ---
    useEffect(() => {
        try {
            const savedInvoices = JSON.parse(localStorage.getItem('invoices'));
            if (savedInvoices) setInvoices(savedInvoices);
            
            const savedThemeColor = localStorage.getItem('themeColor');
            if(savedThemeColor) setThemeColor(savedThemeColor);

        } catch (error) {
            console.error("Error loading data from localStorage", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if(!isLoading) {
            try {
                localStorage.setItem('invoices', JSON.stringify(invoices));
            } catch (error) {
                console.error("Error saving invoices to localStorage", error);
            }
        }
    }, [invoices, isLoading]);

    useEffect(() => {
        if(!isLoading) {
            try {
                localStorage.setItem('billFromDetails', JSON.stringify(currentInvoice.billFrom));
                if (currentInvoice.logo) {
                    localStorage.setItem('companyLogo', currentInvoice.logo);
                } else {
                    localStorage.removeItem('companyLogo');
                }
            } catch (error) {
                console.error("Error saving billFrom/logo to localStorage", error);
            }
        }
    }, [currentInvoice.billFrom, currentInvoice.logo, isLoading]);
    
    useEffect(() => {
        if(!isLoading){
            localStorage.setItem('themeColor', themeColor);
        }
    }, [themeColor, isLoading]);
    
    // Effect to handle dark mode changes.
    // useLayoutEffect runs synchronously before the browser paints, preventing theme flicker on load.
    useLayoutEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);


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
    
    // --- State Handlers ---
    const handleInputChange = useCallback((e, path) => {
        const { name, value } = e.target;
        setCurrentInvoice(prev => {
            const keys = path.split('.');
            const updatedInvoice = JSON.parse(JSON.stringify(prev)); // Deep copy
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
    
    const handleCurrencyChange = useCallback((e) => {
        const selectedCurrency = CURRENCIES.find(c => c.code === e.target.value);
        setCurrentInvoice(prev => ({...prev, currency: selectedCurrency}));
    }, []);

    const handleRemoveItem = useCallback((index) => {
        setCurrentInvoice(prev => {
            const items = [...prev.items];
            items.splice(index, 1);
            return { ...prev, items };
        });
    }, []);
    
    const handleDragStart = (e, item) => {
        setDraggedItem(item);
    }
    
    const handleDragOver = (e) => {
        e.preventDefault();
    }
    
    const handleDrop = (e, targetItem) => {
        e.preventDefault();
        if(!draggedItem) return;
        
        const currentItems = [...currentInvoice.items];
        const draggedItemIndex = currentItems.findIndex(item => item.id === draggedItem.id);
        const targetItemIndex = currentItems.findIndex(item => item.id === targetItem.id);
        
        currentItems.splice(draggedItemIndex, 1);
        currentItems.splice(targetItemIndex, 0, draggedItem);
        
        setCurrentInvoice(prev => ({...prev, items: currentItems}));
        setDraggedItem(null);
    }
    
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

    // --- Invoice Actions ---
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

        window.html2canvas(input, { scale: 3, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `invoice-${currentInvoice.invoiceNumber}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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

        const html2canvas = window.html2canvas;
        const { jsPDF } = window.jspdf;

        html2canvas(input, { scale: 3, useCORS: true }).then(canvas => {
            // --- PDF Optimization ---
            // 1. Convert canvas to JPEG instead of PNG. JPEG offers lossy compression, which is great for reducing file size.
            //    A quality of 0.95 provides a high-quality image with significant file size reduction.
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const pdf = new jsPDF('p', 'in', 'letter');
            pdf.viewerPreferences({'FitWindow': true}, true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // 2. Add the image as a JPEG and use jsPDF's 'FAST' compression.
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            pdf.save(`invoice-${currentInvoice.invoiceNumber}.pdf`);
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
    
    // --- Calculations ---
    const subtotal = currentInvoice.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0);
    const taxAmount = (subtotal * Number(currentInvoice.tax)) / 100;
    const total = subtotal + taxAmount - Number(currentInvoice.discount);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading application...</p></div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-200">
             <Notification 
                message={notification.message}
                show={notification.show}
                type={notification.type}
                onDismiss={() => setNotification({ ...notification, show: false })}
            />
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                        <FileText style={{color: themeColor}} className="mr-3" size={32} />
                        Invoice Generator
                    </h1>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            {darkMode ? <Sun /> : <Moon />}
                        </button>
                        <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <Settings />
                        </button>
                        <button onClick={createNewInvoice} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition w-full sm:w-auto">
                            <Plus size={18} className="mr-2" /> New Invoice
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Form & Lists */}
                    <div>
                        <InvoiceList invoices={invoices} onSelect={selectInvoiceToEdit} onDelete={confirmDelete} />
                        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                             <h2 className="text-xl font-semibold mb-6">Invoice Details</h2>
                             
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Invoice #</label>
                                    <input type="text" name="invoiceNumber" value={currentInvoice.invoiceNumber} onChange={(e) => setCurrentInvoice({...currentInvoice, invoiceNumber: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</label>
                                    <input type="date" name="issueDate" value={currentInvoice.issueDate} onChange={(e) => setCurrentInvoice({...currentInvoice, issueDate: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-left" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                                    <input type="date" name="dueDate" value={currentInvoice.dueDate} onChange={(e) => setCurrentInvoice({...currentInvoice, dueDate: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-left" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0 mb-6">
                                <div>
                                     <button onClick={() => handleToggleSection('company')} className="w-full flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-t-md border-b dark:border-gray-600 md:hidden">
                                        <h3 className="font-semibold text-gray-600 dark:text-gray-300">Company Details</h3>
                                        <ChevronDown className={`transition-transform duration-300 ${openSection === 'company' ? 'rotate-180' : ''}`} />
                                    </button>
                                     <div className={`space-y-2 md:block ${openSection === 'company' ? 'block p-4 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-md' : 'hidden'}`}>
                                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2 hidden md:block">Company Details</h3>
                                        <input placeholder="Your Company" name="name" value={currentInvoice.billFrom.name} onChange={(e) => handleInputChange(e, 'billFrom')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        <input placeholder="your@email.com" name="email" value={currentInvoice.billFrom.email} onChange={(e) => handleInputChange(e, 'billFrom')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        <textarea placeholder="Company Address" name="address" value={currentInvoice.billFrom.address} onChange={(e) => handleInputChange(e, 'billFrom')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows="2"></textarea>
                                        <div className="mt-2 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Logo</label>
                                                <button type="button" onClick={() => logoInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 mt-1">
                                                    <Upload size={16} /> Upload
                                                </button>
                                                <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Currency</label>
                                                <select value={currentInvoice.currency.code} onChange={handleCurrencyChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700">
                                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                                <div>
                                     <button onClick={() => handleToggleSection('customer')} className="w-full flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-t-md border-b dark:border-gray-600 md:hidden">
                                        <h3 className="font-semibold text-gray-600 dark:text-gray-300">Customer Details</h3>
                                        <ChevronDown className={`transition-transform duration-300 ${openSection === 'customer' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`space-y-2 md:block ${openSection === 'customer' ? 'block p-4 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-md' : 'hidden'}`}>
                                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2 hidden md:block">Customer Details</h3>
                                        <input placeholder="Client Name" name="name" value={currentInvoice.billTo.name} onChange={(e) => handleInputChange(e, 'billTo')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        <input placeholder="Client Email" name="email" value={currentInvoice.billTo.email} onChange={(e) => handleInputChange(e, 'billTo')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                        <textarea placeholder="Client Address" name="address" value={currentInvoice.billTo.address} onChange={(e) => handleInputChange(e, 'billTo')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows="2"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button onClick={() => handleToggleSection('items')} className="w-full flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-t-md border-b dark:border-gray-600 md:hidden">
                                        <h3 className="font-semibold text-gray-600 dark:text-gray-300">Items</h3>
                                        <ChevronDown className={`transition-transform duration-300 ${openSection === 'items' ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`md:block ${openSection === 'items' ? 'block p-4 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-md' : 'hidden'}`}>
                                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2 hidden md:block">Items</h3>
                                    <div className="hidden sm:grid grid-cols-12 gap-2 items-center text-xs font-bold text-gray-500 uppercase mb-1">
                                        <div className="col-span-1"></div>
                                        <div className="col-span-4">Description</div>
                                        <div className="col-span-2">Qty</div>
                                        <div className="col-span-2">Price</div>
                                        <div className="col-span-2 text-right">Total</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="space-y-2">
                                    {currentInvoice.items.map((item, index) => (
                                        <div key={item.id} className={`grid grid-cols-12 gap-2 items-center p-1 rounded-lg ${draggedItem?.id === item.id ? "bg-blue-100 dark:bg-blue-900/50" : ""}`}>
                                            <span className="hidden md:flex col-span-1 items-center justify-center text-gray-400 cursor-grab" draggable onDragStart={(e) => handleDragStart(e, item)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, item)}><GripVertical size={18} /></span>
                                            <div className="md:hidden col-span-1 flex flex-col items-center">
                                                <button onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className="disabled:opacity-20"><ArrowUp size={14}/></button>
                                                <button onClick={() => handleMoveItem(index, 'down')} disabled={index === currentInvoice.items.length-1} className="disabled:opacity-20"><ArrowDown size={14}/></button>
                                            </div>

                                            <input name="description" placeholder="Item description" value={item.description} onChange={e => handleItemChange(index, e)} className="col-span-11 sm:col-span-4 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                            <input name="quantity" type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, e)} className="col-span-4 sm:col-span-2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                            <input name="price" type="number" placeholder="Price" step="0.01" value={item.price} onChange={e => handleItemChange(index, e)} className="col-span-4 sm:col-span-2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                            <span className="col-span-3 sm:col-span-2 text-right p-2">{currentInvoice.currency.symbol}{(Number(item.quantity) * Number(item.price)).toFixed(2)}</span>
                                            <button onClick={() => handleRemoveItem(index)} className="col-span-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 justify-self-center"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    </div>
                                    <button onClick={handleAddItem} className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm font-medium"><Plus size={16} className="mr-1" /> Add Item</button>
                                </div>
                            </div>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                                    <textarea name="notes" value={currentInvoice.notes} onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700" rows="3"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="font-medium">{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Tax (%)</span>
                                        <input type="number" name="tax" value={currentInvoice.tax} onChange={(e) => setCurrentInvoice({...currentInvoice, tax: e.target.value})} className="w-20 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-right" />
                                    </div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Discount ({currentInvoice.currency.symbol})</span>
                                        <input type="number" name="discount" value={currentInvoice.discount} onChange={(e) => setCurrentInvoice({...currentInvoice, discount: e.target.value})} className="w-20 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-right" />
                                    </div>
                                    <div className="border-t pt-2 mt-2 dark:border-gray-700">
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
                    <div className="sticky top-8">
                        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                            <button onClick={saveInvoice} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition">Save</button>
                            <button onClick={() => setDownloadModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg shadow-sm hover:bg-gray-800 transition"><Download size={18} /> Download</button>
                        </div>
                         <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                            <button onClick={() => setCurrentInvoice({...currentInvoice, status: 'paid'})} className={`px-3 py-1 text-sm rounded-full transition ${currentInvoice.status === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Paid</button>
                            <button onClick={() => setCurrentInvoice({...currentInvoice, status: 'unpaid'})} className={`px-3 py-1 text-sm rounded-full transition ${currentInvoice.status === 'unpaid' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Unpaid</button>
                        </div>
                        
                        {/* Preview */}
                        <div ref={invoicePreviewRef} className="bg-white p-8 sm:p-12 rounded-lg shadow-lg border border-gray-200 aspect-[8.5/11] text-[9px] text-gray-900">
                             <div className="flex justify-between items-start mb-10">
                                <div>
                                    {currentInvoice.logo && <img src={currentInvoice.logo} alt="Company Logo" className="w-24 mb-4" />}
                                    <h1 className="text-base font-bold text-gray-900 mb-1">{currentInvoice.billFrom.name}</h1>
                                    <p className="text-gray-500 text-[9px] leading-snug">{currentInvoice.billFrom.address}</p>
                                    <p className="text-gray-500 text-[9px] leading-snug">{currentInvoice.billFrom.email}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-lg font-bold uppercase text-gray-900">Invoice</h2>
                                    <p className="text-gray-500 text-[11px] mt-1"># {currentInvoice.invoiceNumber}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div>
                                    <h3 className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                                    <p className="font-bold text-gray-800 text-[11px]">{currentInvoice.billTo.name || 'Client Name'}</p>
                                    <p className="text-gray-600 text-[9px] leading-snug">{currentInvoice.billTo.address || 'Client Address'}</p>
                                    <p className="text-gray-600 text-[9px] leading-snug">{currentInvoice.billTo.email || 'client@email.com'}</p>
                                </div>
                                <div className="text-right">
                                     <div className="mb-3">
                                        <p className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider">Invoice Date</p>
                                        <p className="text-gray-800 text-[11px]">{currentInvoice.issueDate}</p>
                                     </div>
                                     <div>
                                        <p className="text-[8px] font-semibold text-gray-500 uppercase tracking-wider">Due Date</p>
                                        <p className="text-gray-800 text-[11px]">{currentInvoice.dueDate}</p>
                                     </div>
                                </div>
                            </div>
                            
                            <table className="w-full mb-10 text-[9px]">
                                <thead>
                                    <tr className="border-b-2" style={{borderColor: themeColor}}>
                                        <th className="text-left font-semibold text-gray-800 p-2 uppercase tracking-wider">Item & Description</th>
                                        <th className="text-center font-semibold text-gray-800 p-2 uppercase tracking-wider">Qty</th>
                                        <th className="text-right font-semibold text-gray-800 p-2 uppercase tracking-wider">Rate</th>
                                        <th className="text-right font-semibold text-gray-800 p-2 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {currentInvoice.items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="p-2 py-3">{item.description}</td>
                                        <td className="text-center p-2 py-3">{item.quantity}</td>
                                        <td className="text-right p-2 py-3">{currentInvoice.currency.symbol}{Number(item.price).toFixed(2)}</td>
                                        <td className="text-right p-2 py-3 font-medium">{currentInvoice.currency.symbol}{(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <div className="w-full max-w-[180px] text-[10px]">
                                    <div className="flex justify-between text-gray-600 mb-1"><span>Subtotal</span><span>{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-600 mb-1"><span>Tax ({currentInvoice.tax}%)</span><span>{currentInvoice.currency.symbol}{taxAmount.toFixed(2)}</span></div>
                                     {Number(currentInvoice.discount) > 0 && <div className="flex justify-between text-gray-600 mb-1"><span>Discount</span><span>-{currentInvoice.currency.symbol}{Number(currentInvoice.discount).toFixed(2)}</span></div>}
                                    <div className="border-t-2 border-gray-200 my-2"></div>
                                    <div className="flex justify-between font-bold text-gray-900 text-xs"><span>Total</span><span>{currentInvoice.currency.symbol}{total.toFixed(2)}</span></div>
                                    <div className="mt-2 p-2 rounded-md" style={{backgroundColor: '#e6e7eb', border: `1px solid #e6e7eb`}}>
                                        <div className="flex justify-between font-bold text-base text-gray-800">
                                            <span>Balance Due</span>
                                            <span>{currentInvoice.currency.symbol}{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-12">
                                <h4 className="font-semibold text-gray-600 text-[8px] uppercase tracking-wider mb-1">Notes</h4>
                                <p className="text-gray-500 text-[10px]">{currentInvoice.notes}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {isDownloadModalOpen && <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                downloadJPG={downloadJPG}
                downloadPDF={downloadPDF}
            />}
            {isConfirmModalOpen && <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteInvoice}
                title={invoiceToDelete === 'all' ? "Clear All Data" : "Delete Invoice"}
                message={invoiceToDelete === 'all' ? "Are you sure you want to delete all invoices and settings? This action cannot be undone." : "Are you sure you want to delete this invoice? This action cannot be undone."}
            />}
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
