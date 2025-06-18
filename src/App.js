// Add this custom hook at the top of your file (before the main App component)

const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only run on client side
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Use saved preference, or fall back to system preference
        const shouldUseDark = savedMode !== null ? savedMode === 'true' : prefersDark;
        
        setDarkMode(shouldUseDark);
        setIsLoaded(true);
        
        // Apply class immediately to prevent flash
        if (shouldUseDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', newMode.toString());
            
            if (newMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            
            return newMode;
        });
    }, []);

    return { darkMode, toggleDarkMode, isLoaded };
};

// Then update your main App component to use this hook:

export default function App() {
    // Replace the old dark mode state with this:
    const { darkMode, toggleDarkMode, isLoaded: isDarkModeLoaded } = useDarkMode();
    
    // Remove the old getInitialDarkMode function
    // Remove the old darkMode useState
    // Remove the old useLayoutEffect for dark mode
    
    // Update your existing getInitialInvoiceState function (remove the dark mode logic)
    const getInitialInvoiceState = useCallback(() => {
        // Try to get saved data, but handle potential errors
        let savedBillFrom = null;
        let savedLogo = null;
        
        try {
            savedBillFrom = JSON.parse(localStorage.getItem('billFromDetails') || 'null');
            savedLogo = localStorage.getItem('companyLogo');
        } catch (error) {
            console.warn('Error loading saved data:', error);
        }

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
            currency: CURRENCIES[0]
        };
    }, []);

    // Update the loading condition
    if (isLoading || !isDarkModeLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Loading application...</p>
            </div>
        );
    }

    // Update the dark mode toggle button onClick handler
    // Change from: onClick={() => setDarkMode(!darkMode)}
    // To: onClick={toggleDarkMode}

    // Rest of your component remains the same...
}