import { useState } from "react";

export default function Home() {
  const [paid, setPaid] = useState("");
  const [received, setReceived] = useState("");
  const [fromCurrency, setFromCurrency] = useState("GBP");
  const [toCurrency, setToCurrency] = useState("USD");
  const [email, setEmail] = useState("");
  const [fxVolume, setFxVolume] = useState("");
  const [datetime, setDatetime] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currencies = [
    "GBP", "USD", "EUR", "JPY", "CHF", "CNY", "NZD", "SGD",
    "INR", "AUD", "CAD", "HKD", "MYR", "NOK", "ZAR", "SEK",
    "AED", "CZK", "DKK", "HRK", "HUF", "KES", "MXN", "PLN",
    "RON", "SAR", "TRY"
  ];

  const calculateMarkup = async () => {
    setError("");
    setResults(null);

    if (!paid || !received || !email || !fxVolume || !datetime) {
      setError("Please fill in all fields.");
      return;
    }

    const paidVal = parseFloat(paid);
    const receivedVal = parseFloat(received);
    if (isNaN(paidVal) || isNaN(receivedVal) || paidVal <= 0 || receivedVal <= 0) {
      setError("Please enter valid numeric values for Paid and Received.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`);
      const data = await res.json();
      const interbankRate = data?.rates?.[toCurrency];

      if (!interbankRate) {
        setError("Could not fetch exchange rate. Please try again.");
        setLoading(false);
        return;
      }

      const userRate = receivedVal / paidVal;
      const markup = ((interbankRate - userRate) / interbankRate) * 100;
      const hiddenCost = paidVal * (interbankRate - userRate);

      setResults({ interbankRate, userRate, markup, hiddenCost });
    } catch (err) {
      console.error("FX Error:", err);
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <div style={{ border: '1px solid #ccc', borderRadius: 10, padding: 20 }}>
        <h1>FX Markup Calculator</h1>

        <label>I Paid</label><br />
        <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} style={{ width: '100%', padding: 8 }} />
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 8 }}>
          {currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
        </select>

        <label style={{ marginTop: 15, display: 'block' }}>I Received</label>
        <input type="number" value={received} onChange={(e) => setReceived(e.target.value)} style={{ width: '100%', padding: 8 }} />
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 8 }}>
          {currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
        </select>

        <label style={{ marginTop: 15, display: 'block' }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} />

        <label style={{ marginTop: 15, display: 'block' }}>Annual FX Volume (e.g. 500000)</label>
        <input type="number" value={fxVolume} onChange={(e) => setFxVolume(e.target.value)} style={{ width: '100%', padding: 8 }} />

        <label style={{ marginTop: 15, display: 'block' }}>Date and Time (London)</label>
        <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} style={{ width: '100%', padding: 8 }} />

        <button onClick={calculateMarkup} disabled={loading} style={{ marginTop: 15, backgroundColor: '#0070f3', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 5 }}>
          {loading ? "Calculating..." : "Calculate FX Markup"}
        </button>

        {error && (
          <div style={{ marginTop: 15, color: 'red' }}>{error}</div>
        )}

        {results && (
          <div style={{ marginTop: 20 }}>
            <p><strong>Interbank Rate:</strong> {results.interbankRate.toFixed(4)}</p>
            <p><strong>Your Rate:</strong> {results.userRate.toFixed(4)}</p>
            <p><strong>Markup:</strong> {results.markup.toFixed(2)}%</p>
            <p><strong>Hidden Cost:</strong> {results.hiddenCost.toFixed(2)} {fromCurrency}</p>
          </div>
        )}
      </div>
    </main>
  );
}