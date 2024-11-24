"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

export default function BalanceCard() {
  // State for address input and results
  const [checkAddress, setCheckAddress] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read decimals directly from contract
  const { data: decimals } = useReadContract({
    address: "0x37dBD10E7994AAcF6132cac7d33bcA899bd2C660",
    abi: [
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "decimals",
  });

  const checkBalance = async (addressToCheck?: string) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setBalance(null);

    try {
      // Use provided address or input address
      const targetAddress = addressToCheck || checkAddress;

      // Validate address
      if (!isAddress(targetAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Fetch balance from your API
      const response = await fetch(`http://localhost:3001/token-balance/${targetAddress}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Format balance if we have decimals
      if (decimals !== undefined) {
        const formatted = formatUnits(BigInt(data.result), decimals);
        setBalance(formatted);
      } else {
        setBalance(data.result); // Fallback to unformatted
      }

      // Update input if needed
      if (!checkAddress && addressToCheck) {
        setCheckAddress(addressToCheck);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check balance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-96 bg-primary text-primary-content">
      <div className="card-body">
        <h2 className="card-title">Token Balance</h2>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text text-primary-content">Check Balance</span>
          </label>
          <div className="join w-full">
            <input
              type="text"
              placeholder="Enter address to check balance"
              className="input input-bordered join-item w-full text-neutral-content"
              value={checkAddress}
              onChange={e => setCheckAddress(e.target.value)}
            />
            <button className="btn btn-secondary join-item" onClick={() => checkBalance()} disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Balance"}
            </button>
          </div>
          {balance !== null && <div className="mt-2 alert alert-info">Balance: {balance} tokens</div>}
        </div>
      </div>
    </div>
  );
}
