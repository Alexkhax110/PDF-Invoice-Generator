import React, { useState, useEffect, useRef, memo, useCallback, useLayoutEffect } from 'react';
import { Plus, Download, FileText, Trash2, Upload, X, Share2, Edit, AlertTriangle, Settings, Sun, Moon, GripVertical, RefreshCcw, ChevronDown, ArrowUp, ArrowDown, Search, Sparkles, ChevronUp, Eye, EyeOff, QrCode } from 'lucide-react';

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

// QR Code Generator (Simple Implementation)
const generateQRCode = (text, size = 200) => {
    // Using QR Server API for QR code generation
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&format=png&margin=10`;
};

// Dark mode theme object with improved contrast
const getTheme = (isDark) => ({
    // Main backgrounds
    mainBg: isDark ? 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)',
    
    // Card backgrounds
    cardBg: isDark ? 'rgba(31, 41, 55, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    cardBorder: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(255, 255, 255, 0.3)',
    
    // Text colors with improved contrast
    textPrimary: isDark ? '#ffffff' : '#0f172a',
    textSecondary: isDark ? '#e5e7eb' : '#374151',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    
    // Input backgrounds with better contrast
    inputBg: isDark ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    inputBorder: isDark ? '#6b7280' : '#d1d5db',
    inputText: isDark ? '#ffffff' : '#111827',
    inputPlaceholder: isDark ? '#9ca3af' : '#6b7280',
    
    // Button backgrounds
    buttonBg: isDark ? '#4b5563' : '#f3f4f6',
    buttonHover: isDark ? '#6b7280' : '#e5e7eb',
    buttonText: isDark ? '#e5e7eb' : '#374151',
    
    // Header
    headerBg: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    headerBorder: isDark ? 'rgba(75, 85, 99, 0.6)' : 'rgba(229, 231, 235, 0.6)',
    
    // Modal backgrounds
    modalBg: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    modalBorder: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(255, 255, 255, 0.3)',
    
    // Status colors
    successBg: isDark ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7',
    successText: isDark ? '#4ade80' : '#15803d',
    warningBg: isDark ? 'rgba(251, 191, 36, 0.25)' : '#fef3c7',
    warningText: isDark ? '#fbbf24' : '#92400e',
    
    // Item backgrounds
    itemBg: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(249, 250, 251, 0.9)',
    
    // Drag and drop
    dragOver: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)',
    dragActive: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)',
});

// --- Reusable Notification Component ---
const Notification = memo(({ message, show, type, onDismiss, theme }) => {
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
            <div className={`backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border max-w-sm ${
                type === 'success'
                    ? 'bg-green-500/90 text-white border-green-400/20'
                    : 'bg-red-500/90 text-white border-red-400/20'
            }`}>
                <div className="flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span className="font-medium">{message}</span>
                </div>
            </div>
        </div>
    );
});

// --- QR Code Modal Component ---
const QRCodeModal = memo(({ isOpen, onClose, paymentInfo, theme }) => {
    if (!isOpen) return null;

    const qrCodeData = `Payment Details:
Company: ${paymentInfo.companyName || 'Company Name'}
Account: ${paymentInfo.accountNumber || 'Account Number'}
Bank: ${paymentInfo.bankName || 'Bank Name'}
IBAN/SWIFT: ${paymentInfo.swiftCode || 'SWIFT/IBAN'}
Amount: ${paymentInfo.amount || '0.00'}`;

    const qrCodeUrl = generateQRCode(qrCodeData, 300);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                style={{
                    backgroundColor: theme.modalBg,
                    borderColor: theme.modalBorder
                }}
                className="backdrop-blur-xl rounded-3xl p-8 w-full max-w-md relative shadow-2xl border"
            >
                <button
                    onClick={onClose}
                    style={{ color: theme.textMuted }}
                    className="absolute top-4 right-4 hover:opacity-70 p-2 rounded-full transition-all duration-200"
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonBg}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <X size={18} />
                </button>
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <QrCode className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>Payment QR Code</h2>
                    <p className="mb-6" style={{ color: theme.textSecondary }}>Scan to view payment details</p>
                    
                    <div className="bg-white p-4 rounded-2xl mb-6 inline-block">
                        <img 
                            src={qrCodeUrl} 
                            alt="Payment QR Code" 
                            className="w-64 h-64 mx-auto"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div style={{display: 'none'}} className="w-64 h-64 flex items-center justify-center text-gray-500">
                            QR Code unavailable
                        </div>
                    </div>
                    
                    <div className="text-left space-y-2" style={{ backgroundColor: theme.itemBg }} className="p-4 rounded-xl">
                        <p className="text-sm"><strong>Company:</strong> {paymentInfo.companyName || 'Not set'}</p>
                        <p className="text-sm"><strong>Amount:</strong> {paymentInfo.amount || '0.00'}</p>
                        <p className="text-sm"><strong>Account:</strong> {paymentInfo.accountNumber || 'Not set'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- Currency Dropdown Component ---
const CurrencyDropdown = ({ selectedCurrency, onCurrencyChange, theme }) => {
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
                style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary
                }}
                className="w-full backdrop-blur-xl border rounded-xl px-4 py-3 text-left flex justify-between items-center hover:opacity-90 transition-all duration-200 shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium">{selectedCurrency.code}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: theme.textMuted }} />
            </button>
            {isOpen && (
                <div 
                    style={{
                        backgroundColor: theme.modalBg,
                        borderColor: theme.cardBorder
                    }}
                    className="absolute z-20 mt-2 w-full backdrop-blur-xl border rounded-xl shadow-2xl max-h-64 overflow-hidden"
                >
                    <div className="p-3" style={{ borderBottomColor: theme.cardBorder, borderBottomWidth: '1px' }}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: theme.textMuted }}/>
                            <input
                                type="text"
                                placeholder="Search currency..."
                                style={{
                                    backgroundColor: theme.itemBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText
                                }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredCurrencies.map(currency => (
                            <button
                                key={currency.code}
                                style={{
                                    color: theme.textPrimary,
                                    ':hover': { backgroundColor: theme.buttonBg }
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50/80 transition-colors duration-150 text-sm"
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonBg}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => {
                                    onCurrencyChange(currency);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                <span className="font-medium">{currency.code}</span>
                                <span className="ml-2" style={{ color: theme.textSecondary }}>({currency.symbol})</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Draggable Item Component ---
const DraggableItem = memo(({ item, index, onItemChange, onRemoveItem, onDragStart, onDragEnd, onDragOver, onDrop, isDragging, isDragOver, theme, currency }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', index.toString());
        onDragStart(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        onDragOver(index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        onDrop(fromIndex, index);
    };

    const handleDragEnd = () => {
        onDragEnd();
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ 
                backgroundColor: isDragOver ? theme.dragOver : theme.itemBg,
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? 'rotate(2deg)' : 'rotate(0deg)',
                borderColor: isDragOver ? '#3b82f6' : 'transparent'
            }} 
            className={`rounded-xl p-4 transition-all duration-200 cursor-move border-2 ${
                isDragOver ? 'shadow-lg scale-105' : 'shadow-sm'
            }`}
        >
            <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-1 flex items-center justify-center" style={{ color: theme.textMuted }}>
                    <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                </div>
                <input
                    name="description"
                    placeholder="Item description"
                    value={item.description}
                    onChange={e => onItemChange(index, e)}
                    style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.inputText
                    }}
                    className="col-span-6 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                />
                <input
                    name="quantity"
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => onItemChange(index, e)}
                    style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.inputText
                    }}
                    className="col-span-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                />
                <input
                    name="price"
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    value={item.price}
                    onChange={e => onItemChange(index, e)}
                    style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.inputText
                    }}
                    className="col-span-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                />
                <button
                    onClick={() => onRemoveItem(index)}
                    className="col-span-1 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ml-2"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    Total: {currency.symbol}{(Number(item.quantity) * Number(item.price)).toFixed(2)}
                </span>
            </div>
        </div>
    );
});

// --- Invoice List Component ---
const InvoiceList = memo(({ invoices, onSelect, onDelete, isExpanded, onToggleExpand, theme }) => (
    <div 
        style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder
        }}
        className="backdrop-blur-xl rounded-2xl shadow-xl border mb-8 overflow-hidden"
    >
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>Recent Invoices</h2>
                <button
                    onClick={onToggleExpand}
                    style={{
                        backgroundColor: theme.buttonBg,
                        color: theme.buttonText
                    }}
                    className="flex items-center space-x-2 px-4 py-2 hover:opacity-90 rounded-xl transition-all duration-200"
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                >
                    {isExpanded ? (
                        <>
                            <EyeOff size={16} />
                            <span className="text-sm font-medium">Hide</span>
                        </>
                    ) : (
                        <>
                            <Eye size={16} />
                            <span className="text-sm font-medium">Show</span>
                        </>
                    )}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {invoices.length > 0 ? invoices.map(inv => (
                        <div 
                            key={inv.id} 
                            style={{
                                backgroundColor: theme.inputBg,
                                borderColor: theme.cardBorder
                            }}
                            className="group backdrop-blur-xl rounded-xl p-4 border hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                            <div onClick={() => onSelect(inv)} className="flex-grow cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-semibold text-base" style={{ color: theme.textPrimary }}>{inv.invoiceNumber}</p>
                                        <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>{inv.billTo.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg" style={{ color: theme.textPrimary }}>
                                            {inv.currency?.symbol || '$'}{(inv.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0) * (1 + Number(inv.tax) / 100) - Number(inv.discount)).toFixed(2)}
                                        </p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                            inv.status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => onSelect(inv)}
                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                >
                                    <Edit size={16}/>
                                </button>
                                <button
                                    onClick={() => onDelete(inv.id)}
                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 mb-4" style={{ color: theme.textMuted }} />
                            <p style={{ color: theme.textSecondary }}>No invoices yet</p>
                            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Create your first invoice to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
));

// --- Download Modal Component ---
const DownloadModal = memo(({ isOpen, onClose, downloadJPG, downloadPDF, setDownloadModalOpen, theme }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                style={{
                    backgroundColor: theme.modalBg,
                    borderColor: theme.modalBorder
                }}
                className="backdrop-blur-xl rounded-3xl p-8 w-full max-w-md relative shadow-2xl border"
            >
                <button
                    onClick={onClose}
                    style={{ color: theme.textMuted }}
                    className="absolute top-4 right-4 hover:opacity-70 p-2 rounded-full transition-all duration-200"
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonBg}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <X size={18} />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Download className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Download Invoice</h2>
                    <p className="mt-2" style={{ color: theme.textSecondary }}>Choose your preferred format</p>
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
const ConfirmationModal = memo(({ isOpen, onClose, onConfirm, title, message, theme }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                style={{
                    backgroundColor: theme.modalBg,
                    borderColor: theme.modalBorder
                }}
                className="backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>{title}</h3>
                    <p style={{ color: theme.textSecondary }}>{message}</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: theme.buttonBg,
                            color: theme.buttonText
                        }}
                        className="flex-1 px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all duration-200"
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
const SettingsModal = memo(({ isOpen, onClose, themeColor, setThemeColor, clearAllData, resetTheme, paymentInfo, setPaymentInfo, theme }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
                style={{
                    backgroundColor: theme.modalBg,
                    borderColor: theme.modalBorder
                }}
                className="backdrop-blur-xl rounded-3xl p-8 w-full max-w-md relative shadow-2xl border max-h-[90vh] overflow-y-auto"
            >
                <button
                    onClick={onClose}
                    style={{ color: theme.textMuted }}
                    className="absolute top-4 right-4 hover:opacity-70 p-2 rounded-full transition-all duration-200"
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonBg}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <X size={18} />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Settings className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Settings</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>Theme Color</label>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl border-2 overflow-hidden" style={{ borderColor: theme.inputBorder }}>
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
                                style={{
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText
                                }}
                                className="flex-1 border rounded-xl px-4 py-3 text-sm font-mono"
                            />
                            <button
                                onClick={resetTheme}
                                style={{
                                    backgroundColor: theme.buttonBg,
                                    color: theme.buttonText
                                }}
                                className="p-3 hover:opacity-90 rounded-xl transition-all duration-200"
                                title="Reset to default"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4" style={{ borderTopColor: theme.cardBorder, borderTopWidth: '1px' }}>
                        <label className="block text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>Payment Information</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Company/Business Name"
                                value={paymentInfo.companyName}
                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, companyName: e.target.value }))}
                                style={{
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText
                                }}
                                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Account Number"
                                value={paymentInfo.accountNumber}
                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                                style={{
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText
                                }}
                                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={paymentInfo.bankName}
                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, bankName: e.target.value }))}
                                style={{
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText
                                }}
                                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <input
                                type="text"
                                placeholder="SWIFT/IBAN Code"
                                value={paymentInfo.swiftCode}
                                onChange={(e) => setPaymentInfo(prev => ({ ...prev, swiftCode: e.target.value }))}
                                style={{
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder,
                                    color: theme.inputText
                                }}
                                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4" style={{ borderTopColor: theme.cardBorder, borderTopWidth: '1px' }}>
                        <label className="block text-lg font-semibold mb-3" style={{ color: theme.textPrimary }}>Data Management</label>
                        <button
                            onClick={clearAllData}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 hover:scale-[1.02] transition-all duration-200 shadow-lg"
                        >
                            <Trash2 size={16} />
                            <span>Clear All Data</span>
                        </button>
                        <p className="text-xs mt-3 text-center" style={{ color: theme.textMuted }}>
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
        // Default to light mode (user's choice to enable dark mode)
        return false;
    };

    const [isLoading, setIsLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [currentInvoice, setCurrentInvoice] = useState(getInitialInvoiceState);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isQRModalOpen, setQRModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', show: false, type: 'success' });
    const [darkMode, setDarkMode] = useState(getInitialDarkMode);
    const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [openSection, setOpenSection] = useState(null);
    const [isInvoiceListExpanded, setIsInvoiceListExpanded] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState({
        companyName: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
        amount: ''
    });

    const invoicePreviewRef = useRef(null);
    const logoInputRef = useRef(null);
    
    // Get current theme
    const theme = getTheme(darkMode);

    // Dark Mode Effect with localStorage persistence
    useEffect(() => {
        // Load saved dark mode preference
        const savedMode = localStorage.getItem('invoice-dark-mode');
        if (savedMode !== null) {
            setDarkMode(savedMode === 'true');
        }
    }, []);

    useEffect(() => {
        // Save preference to localStorage
        localStorage.setItem('invoice-dark-mode', darkMode.toString());
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

    // Drag and Drop handlers
    const handleDragStart = useCallback((index) => {
        setDraggedItem(index);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedItem(null);
        setDragOverIndex(null);
    }, []);

    const handleDragOver = useCallback((index) => {
        setDragOverIndex(index);
    }, []);

    const handleDrop = useCallback((fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        
        setCurrentInvoice(prev => {
            const newItems = [...prev.items];
            const draggedItem = newItems[fromIndex];
            newItems.splice(fromIndex, 1);
            newItems.splice(toIndex, 0, draggedItem);
            return { ...prev, items: newItems };
        });
        
        setDraggedItem(null);
        setDragOverIndex(null);
    }, []);

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
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const pdfWidth = 8.5;
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
            
            const pdf = new jsPDF('p', 'in', [pdfWidth, pdfHeight]);
            pdf.viewerPreferences({'FitWindow': true}, true);
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

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const showQRCode = () => {
        // Update payment info with current total
        const total = subtotal + taxAmount - Number(currentInvoice.discount);
        setPaymentInfo(prev => ({ 
            ...prev, 
            amount: `${currentInvoice.currency.symbol}${total.toFixed(2)}` 
        }));
        setQRModalOpen(true);
    };

    // Calculations
    const subtotal = currentInvoice.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.price), 0);
    const taxAmount = (subtotal * Number(currentInvoice.tax)) / 100;
    const total = subtotal + taxAmount - Number(currentInvoice.discount);

    if (isLoading) {
        return (
            <div 
                style={{ 
                    background: theme.mainBg,
                    color: theme.textPrimary 
                }}
                className="min-h-screen flex items-center justify-center transition-all duration-300"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-pulse mx-auto mb-4"></div>
                    <p className="font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            style={{ 
                background: theme.mainBg,
                color: theme.textPrimary 
            }}
            className="min-h-screen transition-all duration-300"
        >
            <Notification
                message={notification.message}
                show={notification.show}
                type={notification.type}
                onDismiss={() => setNotification({ ...notification, show: false })}
                theme={theme}
            />

            {/* Header */}
            <header 
                style={{
                    backgroundColor: theme.headerBg,
                    borderBottomColor: theme.headerBorder
                }}
                className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300"
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <FileText className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Invoice Generator</h1>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>Create professional invoices instantly</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={showQRCode}
                                style={{
                                    backgroundColor: theme.buttonBg,
                                    color: theme.buttonText
                                }}
                                className="p-3 hover:opacity-90 rounded-xl transition-all duration-200"
                                title="Show QR Code"
                            >
                                <QrCode size={20} />
                            </button>
                            <button
                                onClick={toggleDarkMode}
                                style={{
                                    backgroundColor: theme.buttonBg,
                                    color: theme.buttonText
                                }}
                                className="p-3 hover:opacity-90 rounded-xl transition-all duration-200"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button
                                onClick={() => setSettingsModalOpen(true)}
                                style={{
                                    backgroundColor: theme.buttonBg,
                                    color: theme.buttonText
                                }}
                                className="p-3 hover:opacity-90 rounded-xl transition-all duration-200"
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
                        <InvoiceList 
                            invoices={invoices} 
                            onSelect={selectInvoiceToEdit} 
                            onDelete={confirmDelete}
                            isExpanded={isInvoiceListExpanded}
                            onToggleExpand={() => setIsInvoiceListExpanded(!isInvoiceListExpanded)}
                            theme={theme}
                        />

                        {/* Invoice Form */}
                        <div 
                            style={{
                                backgroundColor: theme.cardBg,
                                borderColor: theme.cardBorder
                            }}
                            className="backdrop-blur-xl rounded-2xl p-6 shadow-xl border transition-all duration-300"
                        >
                            <h2 className="text-xl font-bold mb-6" style={{ color: theme.textPrimary }}>Invoice Details</h2>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div>
                                    <label className="block text-lg font-semibold mb-2" style={{ color: theme.textSecondary }}>Invoice Number</label>
                                    <input
                                        type="text"
                                        value={currentInvoice.invoiceNumber}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, invoiceNumber: e.target.value})}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold mb-2" style={{ color: theme.textSecondary }}>Issue Date</label>
                                    <input
                                        type="date"
                                        value={currentInvoice.issueDate}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, issueDate: e.target.value})}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold mb-2" style={{ color: theme.textSecondary }}>Due Date</label>
                                    <input
                                        type="date"
                                        value={currentInvoice.dueDate}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, dueDate: e.target.value})}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Company & Customer Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg" style={{ color: theme.textPrimary }}>Company Details</h3>
                                    <input
                                        placeholder="Your Company Name"
                                        name="name"
                                        value={currentInvoice.billFrom.name}
                                        onChange={(e) => handleInputChange(e, 'billFrom')}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                                    />
                                    <input
                                        placeholder="your@email.com"
                                        name="email"
                                        value={currentInvoice.billFrom.email}
                                        onChange={(e) => handleInputChange(e, 'billFrom')}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                                    />
                                    <textarea
                                        placeholder="Company Address"
                                        name="address"
                                        value={currentInvoice.billFrom.address}
                                        onChange={(e) => handleInputChange(e, 'billFrom')}
                                        rows="3"
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder-gray-500"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-lg font-medium mb-2" style={{ color: theme.textSecondary }}>Logo</label>
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current.click()}
                                                style={{
                                                    backgroundColor: theme.buttonBg,
                                                    color: theme.buttonText
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 hover:opacity-90 rounded-xl text-sm font-medium transition-all duration-200"
                                            >
                                                <Upload size={16} />
                                                <span>Upload</span>
                                            </button>
                                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium mb-2" style={{ color: theme.textSecondary }}>Currency</label>
                                            <CurrencyDropdown selectedCurrency={currentInvoice.currency} onCurrencyChange={handleCurrencyChange} theme={theme} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg" style={{ color: theme.textPrimary }}>Customer Details</h3>
                                    <input
                                        placeholder="Client Name"
                                        name="name"
                                        value={currentInvoice.billTo.name}
                                        onChange={(e) => handleInputChange(e, 'billTo')}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                                    />
                                    <input
                                        placeholder="Client Email"
                                        name="email"
                                        value={currentInvoice.billTo.email}
                                        onChange={(e) => handleInputChange(e, 'billTo')}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-500"
                                    />
                                    <textarea
                                        placeholder="Client Address"
                                        name="address"
                                        value={currentInvoice.billTo.address}
                                        onChange={(e) => handleInputChange(e, 'billTo')}
                                        rows="3"
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Items with Drag and Drop */}
                            <div className="space-y-4 mb-8">
                                <h3 className="font-semibold text-lg" style={{ color: theme.textPrimary }}>Items</h3>
                                <div className="space-y-3">
                                    {currentInvoice.items.map((item, index) => (
                                        <DraggableItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            onItemChange={handleItemChange}
                                            onRemoveItem={handleRemoveItem}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            isDragging={draggedItem === index}
                                            isDragOver={dragOverIndex === index && draggedItem !== index}
                                            theme={theme}
                                            currency={currentInvoice.currency}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    style={{
                                        borderColor: theme.inputBorder,
                                        color: theme.textSecondary
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                                >
                                    <Plus size={16} />
                                    <span>Add Item</span>
                                </button>
                            </div>

                            {/* Totals & Notes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-lg font-semibold mb-2" style={{ color: theme.textSecondary }}>Notes</label>
                                    <textarea
                                        value={currentInvoice.notes}
                                        onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})}
                                        rows="4"
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            borderColor: theme.inputBorder,
                                            color: theme.inputText
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder-gray-500"
                                        placeholder="Additional notes or payment terms..."
                                    />
                                </div>
                                <div style={{ backgroundColor: theme.itemBg }} className="rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: theme.textSecondary }}>Subtotal</span>
                                        <span className="font-medium" style={{ color: theme.textPrimary }}>{currentInvoice.currency.symbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span style={{ color: theme.textSecondary }}>Tax (%)</span>
                                        <input
                                            type="number"
                                            value={currentInvoice.tax}
                                            onChange={(e) => setCurrentInvoice({...currentInvoice, tax: e.target.value})}
                                            style={{
                                                backgroundColor: theme.inputBg,
                                                borderColor: theme.inputBorder,
                                                color: theme.inputText
                                            }}
                                            className="w-20 border rounded-lg px-2 py-1 text-right text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span style={{ color: theme.textSecondary }}>Discount ({currentInvoice.currency.symbol})</span>
                                        <input
                                            type="number"
                                            value={currentInvoice.discount}
                                            onChange={(e) => setCurrentInvoice({...currentInvoice, discount: e.target.value})}
                                            style={{
                                                backgroundColor: theme.inputBg,
                                                borderColor: theme.inputBorder,
                                                color: theme.inputText
                                            }}
                                            className="w-20 border rounded-lg px-2 py-1 text-right text-sm"
                                        />
                                    </div>
                                    <div className="pt-3" style={{ borderTopColor: theme.cardBorder, borderTopWidth: '1px' }}>
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
                        <div 
                            style={{
                                backgroundColor: theme.cardBg,
                                borderColor: theme.cardBorder
                            }}
                            className="backdrop-blur-xl rounded-2xl p-6 shadow-xl border transition-all duration-300"
                        >
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
                                <span className="text-lg font-medium" style={{ color: theme.textSecondary }}>Status:</span>
                                <button
                                    onClick={() => setCurrentInvoice({...currentInvoice, status: 'paid'})}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        currentInvoice.status === 'paid'
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'hover:opacity-90'
                                    }`}
                                    style={currentInvoice.status !== 'paid' ? {
                                        backgroundColor: theme.buttonBg,
                                        color: theme.buttonText
                                    } : {}}
                                >
                                    Paid
                                </button>
                                <button
                                    onClick={() => setCurrentInvoice({...currentInvoice, status: 'unpaid'})}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        currentInvoice.status === 'unpaid'
                                            ? 'bg-yellow-500 text-white shadow-lg'
                                            : 'hover:opacity-90'
                                    }`}
                                    style={currentInvoice.status !== 'unpaid' ? {
                                        backgroundColor: theme.buttonBg,
                                        color: theme.buttonText
                                    } : {}}
                                >
                                    Unpaid
                                </button>
                            </div>
                        </div>

                        {/* Invoice Preview - Keep light for printing */}
                        <div 
                            style={{ borderColor: theme.cardBorder }}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden"
                        >
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
                    theme={theme}
                />
            )}

            {isQRModalOpen && (
                <QRCodeModal
                    isOpen={isQRModalOpen}
                    onClose={() => setQRModalOpen(false)}
                    paymentInfo={{
                        ...paymentInfo,
                        companyName: currentInvoice.billFrom.name || paymentInfo.companyName,
                        amount: `${currentInvoice.currency.symbol}${total.toFixed(2)}`
                    }}
                    theme={theme}
                />
            )}

            {isConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleDeleteInvoice}
                    title={invoiceToDelete === 'all' ? "Clear All Data" : "Delete Invoice"}
                    message={invoiceToDelete === 'all' ? "Are you sure you want to delete all invoices and settings? This action cannot be undone." : "Are you sure you want to delete this invoice? This action cannot be undone."}
                    theme={theme}
                />
            )}

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                themeColor={themeColor}
                setThemeColor={setThemeColor}
                clearAllData={clearAllData}
                resetTheme={resetTheme}
                paymentInfo={paymentInfo}
                setPaymentInfo={setPaymentInfo}
                theme={theme}
            />
        </div>
    );
}