import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Plus, Download, FileText, Trash2, Upload, X, Share2, Edit, AlertTriangle } from 'lucide-react';

// --- Constants ---
const CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CAD', symbol: '$' },
    { code: 'AUD', symbol: '$' },
    { code: 'INR', symbol: '₹' },
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
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Invoices</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
            {invoices.length > 0 ? invoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div onClick={() => onSelect(inv)} className="flex-grow cursor-pointer">
                        <p className="font-medium text-gray-800 text-sm sm:text-base">{inv.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{inv.billTo.name}</p>
                    </div>
                    <div className="text-right flex items-center">
                       <div className="mr-4">
                           <p className="font-semibold text-gray-900 text-sm sm:text-base">
                               {inv.currency?.symbol || '$'}{(inv.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0) * (1 + Number(inv.tax) / 100) - Number(inv.discount)).toFixed(2)}
                           </p>
                           <span className={`px-2 py-1 text-xs rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{inv.status}</span>
                       </div>
                       <button onClick={() => onSelect(inv)} className="p-2 text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                       <button onClick={() => onDelete(inv.id)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                </div>
            )) : <p className="text-gray-500 text-center py-4">No invoices yet.</p>}
        </div>
    </div>
));

const DownloadModal = memo(({ isOpen, onClose, downloadJPG, downloadPDF }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X /></button>
                <h2 className="text-xl font-semibold mb-6">Download Invoice</h2>
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
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button onClick={onConfirm} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                        Confirm
                    </button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- Main App Component ---
export default function App() {
    
    const getInitialInvoiceState = useCallback(() => {
        return {
            id: null,
            logo: null,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            billFrom: { name: 'Your Company', email: 'your@company.com', address: '123 Main St, City, Country' },
            billTo: { name: '', email: '', address: '' },
            items: [{ description: '', quantity: 1, price: 0.00 }],
            tax: 0.0,
            discount: 0.00,
            notes: "Grateful for your business, Your timely payment means a lot!",
            status: 'unpaid',
            currency: CURRENCIES[0] // Default to USD
        };
    }, []);
    
    const [isLoading, setIsLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(getInitialInvoiceState);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', show: false, type: 'success' });
    
    const invoicePreviewRef = useRef(null);
    const logoInputRef = useRef(null);

    // --- Data Persistence Effects (localStorage) ---
    useEffect(() => {
        try {
            const savedInvoices = JSON.parse(localStorage.getItem('invoices'));
            if (savedInvoices) {
                setInvoices(savedInvoices);
            }
        } catch (error) {
            console.error("Error loading invoices from localStorage", error);
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
            items: [...prev.items, { description: '', quantity: 1, price: 0.00 }]
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
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete));
        setNotification({ message: 'Invoice deleted!', show: true, type: 'success' });
        if (currentInvoice.id === invoiceToDelete) {
            createNewInvoice();
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
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size
            pdf.viewerPreferences({'FitWindow': true}, true); // Set default zoom to fit window
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`invoice-${currentInvoice.invoiceNumber}.pdf`);
        }).catch(err => {
            console.error("Error generating PDF:", err);
            setNotification({ message: 'Could not generate PDF.', show: true, type: 'error' });
        });
    }, [currentInvoice.invoiceNumber]);

    const selectInvoiceToEdit = useCallback((invoice) => {
        setCurrentInvoice(invoice);
    }, []);
    
    // --- Calculations ---
    const subtotal = currentInvoice.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0);
    const taxAmount = (subtotal * Number(currentInvoice.tax)) / 100;
    const total = subtotal + taxAmount - Number(currentInvoice.discount);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading application...</p></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
             <Notification 
                message={notification.message}
                show={notification.show}
                type={notification.type}
                onDismiss={() => setNotification({ ...notification, show: false })}
            />
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                        <FileText className="text-blue-600 mr-3" size={32} />
                        Invoice Generator
                    </h1>
                    <button onClick={createNewInvoice} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition w-full sm:w-auto">
                        <Plus size={18} className="mr-2" /> New Invoice
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Form & Lists */}
                    <div>
                        <InvoiceList invoices={invoices} onSelect={selectInvoiceToEdit} onDelete={confirmDelete} />
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                             <h2 className="text-xl font-semibold text-gray-800 mb-6">Invoice Details</h2>
                             
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Invoice #</label>
                                    <input type="text" name="invoiceNumber" value={currentInvoice.invoiceNumber} onChange={(e) => setCurrentInvoice({...currentInvoice, invoiceNumber: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Issue Date</label>
                                    <input type="date" name="issueDate" value={currentInvoice.issueDate} onChange={(e) => setCurrentInvoice({...currentInvoice, issueDate: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Due Date</label>
                                    <input type="date" name="dueDate" value={currentInvoice.dueDate} onChange={(e) => setCurrentInvoice({...currentInvoice, dueDate: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                            </div>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-600 mb-2">Bill From</h3>
                                    <input placeholder="Your Company" name="name" value={currentInvoice.billFrom.name} onChange={(e) => handleInputChange(e, 'billFrom')} className="w-full mb-2 p-2 border rounded-md" />
                                    <input placeholder="your@email.com" name="email" value={currentInvoice.billFrom.email} onChange={(e) => handleInputChange(e, 'billFrom')} className="w-full mb-2 p-2 border rounded-md" />
                                    <textarea placeholder="Company Address" name="address" value={currentInvoice.billFrom.address} onChange={(e) => handleInputChange(e, 'billFrom')} className="w-full p-2 border rounded-md" rows="2"></textarea>
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Logo</label>
                                            <button type="button" onClick={() => logoInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-sm text-gray-700 rounded-md hover:bg-gray-200 mt-1">
                                                <Upload size={16} /> Upload
                                            </button>
                                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Currency</label>
                                            <select value={currentInvoice.currency.code} onChange={handleCurrencyChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white">
                                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-600 mb-2">Bill To</h3>
                                    <input placeholder="Client Name" name="name" value={currentInvoice.billTo.name} onChange={(e) => handleInputChange(e, 'billTo')} className="w-full mb-2 p-2 border rounded-md" />
                                    <input placeholder="Client Email" name="email" value={currentInvoice.billTo.email} onChange={(e) => handleInputChange(e, 'billTo')} className="w-full mb-2 p-2 border rounded-md" />
                                    <textarea placeholder="Client Address" name="address" value={currentInvoice.billTo.address} onChange={(e) => handleInputChange(e, 'billTo')} className="w-full p-2 border rounded-md" rows="2"></textarea>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-600 mb-2">Items</h3>
                                <div className="hidden sm:grid grid-cols-12 gap-2 items-center text-xs font-bold text-gray-500 uppercase mb-1">
                                    <div className="col-span-5">Description</div>
                                    <div className="col-span-2">Qty</div>
                                    <div className="col-span-2">Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-1"></div>
                                </div>
                                <div className="space-y-2">
                                {currentInvoice.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <input name="description" placeholder="Item description" value={item.description} onChange={e => handleItemChange(index, e)} className="col-span-12 sm:col-span-5 p-2 border rounded-md" />
                                        <input name="quantity" type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, e)} className="col-span-4 sm:col-span-2 p-2 border rounded-md" />
                                        <input name="price" type="number" placeholder="Price" step="0.01" value={item.price} onChange={e => handleItemChange(index, e)} className="col-span-4 sm:col-span-2 p-2 border rounded-md" />
                                        <span className="col-span-3 sm:col-span-2 text-right p-2">{currentInvoice.currency.symbol}{(Number(item.quantity) * Number(item.price)).toFixed(2)}</span>
                                        <button onClick={() => handleRemoveItem(index)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-center"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                </div>
                                <button onClick={handleAddItem} className="mt-2 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"><Plus size={16} className="mr-1" /> Add Item</button>
                            </div>
                            
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                                    <textarea name="notes" value={currentInvoice.notes} onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" rows="3"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tax (%)</span>
                                        <input type="number" name="tax" value={currentInvoice.tax} onChange={(e) => setCurrentInvoice({...currentInvoice, tax: e.target.value})} className="w-20 p-1 border rounded-md text-right" />
                                    </div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Discount ({currentInvoice.currency.symbol})</span>
                                        <input type="number" name="discount" value={currentInvoice.discount} onChange={(e) => setCurrentInvoice({...currentInvoice, discount: e.target.value})} className="w-20 p-1 border rounded-md text-right" />
                                    </div>
                                    <div className="border-t pt-2 mt-2">
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
                            <span className="text-sm font-medium text-gray-600">Status:</span>
                            <button onClick={() => setCurrentInvoice({...currentInvoice, status: 'paid'})} className={`px-3 py-1 text-sm rounded-full transition ${currentInvoice.status === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Paid</button>
                            <button onClick={() => setCurrentInvoice({...currentInvoice, status: 'unpaid'})} className={`px-3 py-1 text-sm rounded-full transition ${currentInvoice.status === 'unpaid' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Unpaid</button>
                        </div>
                        
                        {/* Preview */}
                        <div ref={invoicePreviewRef} className="bg-white p-8 sm:p-12 rounded-lg shadow-lg border border-gray-200 aspect-[210/297] text-[10px]">
                             <div className="flex justify-between items-start mb-10">
                                <div>
                                    {currentInvoice.logo && <img src={currentInvoice.logo} alt="Company Logo" className="w-28 mb-4" />}
                                    <h1 className="text-lg font-bold text-gray-900 mb-1">{currentInvoice.billFrom.name}</h1>
                                    <p className="text-gray-500 text-[10px] leading-snug">{currentInvoice.billFrom.address}</p>
                                    <p className="text-gray-500 text-[10px] leading-snug">{currentInvoice.billFrom.email}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold text-gray-800 uppercase">Invoice</h2>
                                    <p className="text-gray-500 text-xs mt-1"># {currentInvoice.invoiceNumber}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div>
                                    <h3 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                                    <p className="font-bold text-gray-800 text-xs">{currentInvoice.billTo.name || 'Client Name'}</p>
                                    <p className="text-gray-600 text-[10px] leading-snug">{currentInvoice.billTo.address || 'Client Address'}</p>
                                    <p className="text-gray-600 text-[10px] leading-snug">{currentInvoice.billTo.email || 'client@email.com'}</p>
                                </div>
                                <div className="text-right">
                                     <div className="mb-3">
                                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Invoice Date</p>
                                        <p className="text-gray-800 text-xs">{currentInvoice.issueDate}</p>
                                     </div>
                                     <div>
                                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Due Date</p>
                                        <p className="text-gray-800 text-xs">{currentInvoice.dueDate}</p>
                                     </div>
                                </div>
                            </div>
                            
                            <table className="w-full mb-10 text-[10px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="text-left font-semibold text-gray-600 p-2 uppercase tracking-wider">Item & Description</th>
                                        <th className="text-center font-semibold text-gray-600 p-2 uppercase tracking-wider">Qty</th>
                                        <th className="text-right font-semibold text-gray-600 p-2 uppercase tracking-wider">Rate</th>
                                        <th className="text-right font-semibold text-gray-600 p-2 uppercase tracking-wider">Amount</th>
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
                                <div className="w-full max-w-[200px] space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Tax ({currentInvoice.tax}%)</span><span>{currentInvoice.currency.symbol}{taxAmount.toFixed(2)}</span></div>
                                     {Number(currentInvoice.discount) > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span>-{currentInvoice.currency.symbol}{Number(currentInvoice.discount).toFixed(2)}</span></div>}
                                    <div className="border-t-2 border-gray-200 my-2"></div>
                                    <div className="flex justify-between font-bold text-gray-900 text-sm"><span>Total</span><span>{currentInvoice.currency.symbol}{total.toFixed(2)}</span></div>
                                    <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-md">
                                        <div className="flex justify-between font-bold text-gray-800 text-base">
                                            <span>Balance Due</span>
                                            <span>{currentInvoice.currency.symbol}{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-12">
                                <h4 className="font-semibold text-gray-600 text-[9px] uppercase tracking-wider mb-1">Notes</h4>
                                <p className="text-gray-500 text-xs">{currentInvoice.notes}</p>
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
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDeleteInvoice}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
            />
        </div>
    );
}
