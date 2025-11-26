import { useState, useEffect, useCallback, useRef } from 'react';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
];

const currencyEmojis = ['💵', '💶', '💷', '💴', '🪙', '💰', '💳', '🏦', '📈', '📊', '💹', '🤑', '💲'];

const FloatingEmoji = ({ emoji, index }) => {
  const style = {
    left: `${(index * 17) % 100}%`,
    top: `${(index * 23) % 100}%`,
    fontSize: `${22 + (index % 4) * 10}px`,
    opacity: 0.12 + (index % 3) * 0.05,
    animationDelay: `${index * 0.7}s`,
    animationDuration: `${18 + (index % 5) * 4}s`,
  };
  
  return (
    <div className="floating-emoji" style={style}>
      {emoji}
    </div>
  );
};

export default function ForexElite() {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [history, setHistory] = useState([]);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${fromCurrency}`
      );
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();
      setRates({ [fromCurrency]: 1, ...data.rates });
      setLastUpdate(new Date());
    } catch (err) {
      setError('Unable to fetch rates. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fromCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrency = (code) => currencies.find(c => c.code === code) || { name: code, flag: '🌐', symbol: '' };
  
  const convertedAmount = rates[toCurrency] 
    ? (parseFloat(amount || 0) * rates[toCurrency]).toFixed(2)
    : '0.00';

  const exchangeRate = rates[toCurrency]?.toFixed(6) || '—';

  const swapCurrencies = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      setIsSwapping(false);
    }, 300);
  };

  const saveConversion = () => {
    if (!amount || !rates[toCurrency]) return;
    const entry = {
      id: Date.now(),
      from: fromCurrency,
      to: toCurrency,
      amount,
      result: convertedAmount,
      rate: exchangeRate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory(prev => [entry, ...prev.slice(0, 4)]);
  };

  const CurrencyDropdown = ({ value, onChange, isOpen, setIsOpen, refEl, label }) => {
    const selected = getCurrency(value);
    return (
      <div className="currency-selector" ref={refEl}>
        <label className="selector-label">{label}</label>
        <button className="selector-button" onClick={() => setIsOpen(!isOpen)}>
          <span className="selector-flag">{selected.flag}</span>
          <div className="selector-info">
            <span className="selector-code">{value}</span>
            <span className="selector-name">{selected.name}</span>
          </div>
          <svg className={`selector-arrow ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {currencies.map((c) => (
              <button
                key={c.code}
                className={`dropdown-item ${value === c.code ? 'active' : ''}`}
                onClick={() => { onChange(c.code); setIsOpen(false); }}
              >
                <span className="dropdown-flag">{c.flag}</span>
                <span className="dropdown-code">{c.code}</span>
                <span className="dropdown-name">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 20px;
        }
        
        .bg-grid {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 158, 11, 0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        
        .bg-glow {
          position: fixed;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.4;
        }
        .bg-glow.one { top: -200px; left: -100px; background: #f59e0b; }
        .bg-glow.two { bottom: -200px; right: -100px; background: #d97706; }
        .bg-glow.three { top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fbbf24; opacity: 0.15; }
        
        .floating-emoji {
          position: fixed;
          pointer-events: none;
          animation: floatAround 20s ease-in-out infinite;
          filter: blur(0.5px);
          z-index: 1;
        }
        
        @keyframes floatAround {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-40px) rotate(10deg) scale(1.1); }
          50% { transform: translateY(-20px) rotate(-5deg) scale(0.95); }
          75% { transform: translateY(-50px) rotate(5deg) scale(1.05); }
        }
        
        .main-content {
          position: relative;
          z-index: 10;
          max-width: 480px;
          margin: 0 auto;
          padding-top: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 12vw, 72px);
          letter-spacing: 2px;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .title-gold {
          background: linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b, #fcd34d);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        
        .title-white { color: white; }
        
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        
        .subtitle {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-weight: 500;
        }
        
        .card {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 20px;
        }
        
        .input-group { margin-bottom: 24px; }
        
        .input-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(245, 158, 11, 0.8);
          margin-bottom: 10px;
        }
        
        .amount-wrapper { position: relative; }
        
        .amount-symbol {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 22px;
          font-weight: 700;
          color: rgba(245, 158, 11, 0.6);
        }
        
        .amount-input {
          width: 100%;
          padding: 18px 18px 18px 50px;
          font-size: 28px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .amount-input:focus {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15), inset 0 0 30px rgba(245, 158, 11, 0.05);
        }
        
        .amount-input::placeholder { color: rgba(255,255,255,0.2); }
        
        .currency-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: flex-end;
          margin-bottom: 28px;
        }
        
        .currency-selector { position: relative; }
        
        .selector-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(245, 158, 11, 0.8);
          margin-bottom: 10px;
        }
        
        .selector-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .selector-button:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }
        
        .selector-flag { font-size: 28px; }
        .selector-info { flex: 1; text-align: left; }
        .selector-code { display: block; color: white; font-weight: 700; font-size: 16px; }
        .selector-name { display: block; color: rgba(255,255,255,0.4); font-size: 11px; }
        
        .selector-arrow {
          width: 18px;
          height: 18px;
          color: rgba(245, 158, 11, 0.6);
          transition: transform 0.3s ease;
        }
        
        .selector-arrow.open { transform: rotate(180deg); }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          max-height: 280px;
          overflow-y: auto;
          z-index: 100;
          animation: slideDown 0.2s ease;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }
        
        .dropdown-item:hover { background: rgba(245, 158, 11, 0.15); }
        .dropdown-item.active { background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; }
        
        .dropdown-flag { font-size: 22px; }
        .dropdown-code { color: white; font-weight: 600; font-size: 14px; }
        .dropdown-name { color: rgba(255,255,255,0.4); font-size: 12px; margin-left: auto; }
        
        .swap-button {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
          margin-bottom: 4px;
        }
        
        .swap-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4);
        }
        
        .swap-button:active { transform: scale(0.95); }
        .swap-button.spinning { animation: spin 0.3s ease; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
        
        .swap-icon { width: 24px; height: 24px; color: #0f172a; }
        
        .result-box {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .result-label {
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 12px;
        }
        
        .result-amount {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .result-flag { font-size: 36px; }
        .result-value { font-size: clamp(32px, 8vw, 48px); font-weight: 800; color: white; }
        .result-code { font-size: 24px; font-weight: 700; color: #f59e0b; }
        
        .loading-dots { display: inline-block; animation: pulse 1s ease-in-out infinite; }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .rate-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          margin-bottom: 20px;
        }
        
        .rate-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 4px;
        }
        
        .rate-value { color: white; font-weight: 600; font-size: 14px; }
        .rate-time { color: rgba(255,255,255,0.5); font-size: 13px; }
        
        .save-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          border-radius: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
        }
        
        .save-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(245, 158, 11, 0.4);
        }
        
        .save-button:active { transform: translateY(0); }
        
        .history-section { margin-top: 8px; }
        
        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(245, 158, 11, 0.8);
          margin-bottom: 14px;
        }
        
        .history-list { display: flex; flex-direction: column; gap: 10px; }
        
        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .history-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(245, 158, 11, 0.2);
        }
        
        .history-flags { display: flex; align-items: center; gap: 4px; font-size: 18px; }
        .history-arrow { color: rgba(255,255,255,0.3); font-size: 12px; }
        .history-amounts { margin-left: 12px; }
        .history-from { color: white; font-weight: 600; font-size: 13px; }
        .history-to { color: #f59e0b; font-weight: 700; font-size: 14px; }
        .history-time { color: rgba(255,255,255,0.3); font-size: 11px; }
        
        .quick-currencies { display: flex; flex-wrap: wrap; gap: 8px; }
        
        .quick-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          font-size: 13px;
        }
        
        .quick-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
        }
        
        .quick-btn.active {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          color: #fbbf24;
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 14px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .footer {
          text-align: center;
          padding: 24px 0;
          color: rgba(255,255,255,0.25);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .refresh-btn {
          background: rgba(245, 158, 11, 0.2);
          border: none;
          color: #f59e0b;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          margin-left: 8px;
          transition: all 0.2s ease;
        }
        
        .refresh-btn:hover { background: rgba(245, 158, 11, 0.3); }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.5); }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow one" />
      <div className="bg-glow two" />
      <div className="bg-glow three" />
      
      {currencyEmojis.concat(currencyEmojis).map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} index={i} />
      ))}

      <div className="main-content">
        <header className="header">
          <h1 className="title">
            <span className="title-gold">FOREX</span>
            <span className="title-white"> ELITE</span>
          </h1>
          <p className="subtitle">Live Currency Exchange</p>
        </header>

        <div className="card">
          {error && (
            <div className="error-message">
              {error}
              <button className="refresh-btn" onClick={fetchRates}>Retry</button>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Amount</label>
            <div className="amount-wrapper">
              <span className="amount-symbol">{getCurrency(fromCurrency).symbol}</span>
              <input
                type="text"
                inputMode="decimal"
                className="amount-input"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  if (val.split('.').length <= 2) setAmount(val);
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="currency-row">
            <CurrencyDropdown
              value={fromCurrency}
              onChange={setFromCurrency}
              isOpen={showFromDropdown}
              setIsOpen={setShowFromDropdown}
              refEl={fromRef}
              label="From"
            />
            
            <button 
              className={`swap-button ${isSwapping ? 'spinning' : ''}`}
              onClick={swapCurrencies}
            >
              <svg className="swap-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            
            <CurrencyDropdown
              value={toCurrency}
              onChange={setToCurrency}
              isOpen={showToDropdown}
              setIsOpen={setShowToDropdown}
              refEl={toRef}
              label="To"
            />
          </div>

          <div className="result-box">
            <p className="result-label">You Get</p>
            <div className="result-amount">
              <span className="result-flag">{getCurrency(toCurrency).flag}</span>
              <span className="result-value">
                {loading ? (
                  <span className="loading-dots">• • •</span>
                ) : (
                  parseFloat(convertedAmount).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })
                )}
              </span>
              <span className="result-code">{toCurrency}</span>
            </div>
          </div>

          <div className="rate-info">
            <div>
              <p className="rate-label">Exchange Rate</p>
              <p className="rate-value">
                1 {fromCurrency} = {loading ? '...' : exchangeRate} {toCurrency}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="rate-label">Updated</p>
              <p className="rate-time">
                {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </p>
            </div>
          </div>

          <button className="save-button" onClick={saveConversion}>
            💾 SAVE CONVERSION
          </button>
        </div>

        {history.length > 0 && (
          <div className="card history-section">
            <h3 className="section-title">Recent Conversions</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="history-flags">
                      <span>{getCurrency(item.from).flag}</span>
                      <span className="history-arrow">→</span>
                      <span>{getCurrency(item.to).flag}</span>
                    </div>
                    <div className="history-amounts">
                      <div className="history-from">{parseFloat(item.amount).toLocaleString()} {item.from}</div>
                      <div className="history-to">{parseFloat(item.result).toLocaleString()} {item.to}</div>
                    </div>
                  </div>
                  <span className="history-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="section-title">Popular Currencies</h3>
          <div className="quick-currencies">
            {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'].map((code) => (
              <button
                key={code}
                className={`quick-btn ${toCurrency === code ? 'active' : ''}`}
                onClick={() => setToCurrency(code)}
              >
                <span>{getCurrency(code).flag}</span>
                <span>{code}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="footer">
          Powered by Frankfurter API • ECB Rates
        </footer>
      </div>
    </div>
  );
}
