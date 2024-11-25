import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [availableOrdinals, setAvailableOrdinals] = useState([]);
  const [stakedOrdinals, setStakedOrdinals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle address input change
  const handleAddressChange = (e) => {
    setBitcoinAddress(e.target.value);
  };

  // Function to fetch Ordinals from the Blockstream API
  const fetchOrdinals = async () => {
    setLoading(true);
    setError("");
    try {
      // Replace with actual Blockstream API endpoint or any other Bitcoin explorer API
      const response = await axios.get(
        `https://blockstream.info/api/address/${bitcoinAddress}/txs`
      );

      // Process transactions
      const ordinals = response.data
        .map((transaction) => {
          // Here, I assume you want to capture some relevant data from the transaction.
          // Check if vout has any interesting data like OP_RETURN, or just use the scriptpubkey as an example.
          const inscription = transaction.vout.find(
            (output) => output.scriptpubkey_type === "op_return" // Example of looking for OP_RETURN
          );

          if (inscription) {
            return {
              id: inscription.n, // Assuming `n` is the index of the inscription in vout (adjust based on real data)
              content: inscription.scriptpubkey, // Extract the scriptpubkey (or other relevant content)
              timestamp: transaction.status?.block_time, // Assuming block_time is part of the transaction (it might not be)
              txid: transaction.txid,
            };
          }
          return null;
        })
        .filter((ordinal) => ordinal !== null);

      setAvailableOrdinals(ordinals);
      setLoading(false);
    } catch (err) {
      setError(
        "Failed to retrieve Ordinals. Please check the Bitcoin address or try again later."
      );
      setLoading(false);
    }
  };

  // Function to stake an Ordinal
  const stakeOrdinal = (ordinalId) => {
    const ordinalToStake = availableOrdinals.find((o) => o.id === ordinalId);
    setStakedOrdinals([...stakedOrdinals, ordinalToStake]);
    setAvailableOrdinals(availableOrdinals.filter((o) => o.id !== ordinalId));
  };

  return (
    <div className="App">
      <h1>Ordinal Staking Dashboard</h1>

      <div className="address-input">
        <input
          type="text"
          value={bitcoinAddress}
          onChange={handleAddressChange}
          placeholder="Enter Bitcoin Address"
        />
        <button onClick={fetchOrdinals} disabled={loading}>
          {loading ? "Loading..." : "Fetch Ordinals"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="ordinal-section">
        <h2>Available Ordinals</h2>
        {availableOrdinals.length === 0 && !loading && (
          <p>No Ordinals found. Please Search</p>
        )}
        <ul>
          {availableOrdinals.map((ordinal) => (
            <li key={ordinal.id}>
              <div className="ordinal-item">
                <p>
                  <strong>Inscription ID:</strong> {ordinal.id}
                </p>
                <p>
                  <strong>Content:</strong>{" "}
                  {ordinal.content?.slice(0, 20) || "No content available"}
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(ordinal.timestamp * 1000).toLocaleString()}
                </p>
                <p>
                  <strong>Transaction ID:</strong> {ordinal.txid}
                </p>
                <button onClick={() => stakeOrdinal(ordinal.id)}>Stake</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="staked-section">
        <h2>Staked Ordinals</h2>
        {stakedOrdinals.length === 0 && <p>No Ordinals staked yet.</p>}
        <ul>
          {stakedOrdinals.map((ordinal) => (
            <li key={ordinal.id}>
              <div className="ordinal-item">
                <p>
                  <strong>Inscription ID:</strong> {ordinal.id}
                </p>
                <p>
                  <strong>Content:</strong> {ordinal.content.slice(0, 20)}...
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(ordinal.timestamp * 1000).toLocaleString()}
                </p>
                <p>
                  <strong>Transaction ID:</strong> {ordinal.txid}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
