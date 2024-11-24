"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";

function TokenInfoCard() {
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nameResponse, supplyResponse] = await Promise.all([
        fetch("http://localhost:3001/token-name"),
        fetch("http://localhost:3001/total-supply"),
      ]);

      if (!nameResponse.ok || !supplyResponse.ok) {
        throw new Error("Failed to fetch token information");
      }

      const nameData = await nameResponse.json();
      const supplyData = await supplyResponse.json();

      setTokenName(nameData.result);
      setTotalSupply(supplyData.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch token information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-96 bg-primary text-primary-content">
      <div className="card-body">
        <h2 className="card-title">Token Information</h2>
        {error && <div className="text-error bg-error-content p-2 rounded">{error}</div>}
        {isLoading ? (
          <div>Loading token information...</div>
        ) : (
          <>
            <div>Name: {tokenName || "Not fetched"}</div>
            <div>Total Supply: {totalSupply || "Not fetched"}</div>
            <button className="btn btn-secondary mt-2" onClick={fetchTokenInfo} disabled={isLoading}>
              Refresh Token Info
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MinterActionsCard() {
  const { address } = useAccount();
  const [checkAddress, setCheckAddress] = useState<string>("");
  const [mintAddress, setMintAddress] = useState<string>("");
  const [isMinter, setIsMinter] = useState<boolean | null>(null);
  const [mintResult, setMintResult] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkMinterRole = async (addressToCheck?: string) => {
    setError(null);
    setIsLoading(true);
    setIsMinter(null);

    try {
      const targetAddress = addressToCheck || checkAddress || address;
      if (!targetAddress || !isAddress(targetAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      const url = new URL("http://localhost:3001/check-minter-role");
      url.searchParams.append("address", targetAddress);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsMinter(data.result);

      if (!checkAddress && !addressToCheck) {
        setCheckAddress(targetAddress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check minter role");
    } finally {
      setIsLoading(false);
    }
  };

  const mintTokens = async () => {
    setError(null);
    setIsLoading(true);
    setMintResult(null);

    try {
      const targetAddress = mintAddress || address;
      if (!targetAddress || !isAddress(targetAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      const response = await fetch("http://localhost:3001/mint-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: targetAddress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMintResult(data.result);

      if (!mintAddress) {
        setMintAddress(targetAddress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-96 bg-primary text-primary-content">
      <div className="card-body">
        <h2 className="card-title">Minter Actions</h2>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text text-primary-content">Check Minter Role</span>
          </label>
          <div className="join w-full">
            <input
              type="text"
              placeholder="Enter address or leave empty for connected wallet"
              className="input input-bordered join-item w-full text-neutral-content"
              value={checkAddress}
              onChange={e => setCheckAddress(e.target.value)}
            />
            <button className="btn btn-secondary join-item" onClick={() => checkMinterRole()} disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Role"}
            </button>
          </div>
          {isMinter !== null && (
            <div className={`mt-2 alert ${isMinter ? "alert-success" : "alert-warning"}`}>
              {checkAddress || address} {isMinter ? "has" : "does not have"} minter role
            </div>
          )}
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text text-primary-content">Mint Tokens</span>
          </label>
          <div className="join w-full">
            <input
              type="text"
              placeholder="Enter address or leave empty for connected wallet"
              className="input input-bordered join-item w-full text-neutral-content"
              value={mintAddress}
              onChange={e => setMintAddress(e.target.value)}
            />
            <button className="btn btn-secondary join-item" onClick={mintTokens} disabled={isLoading}>
              {isLoading ? "Minting..." : "Mint"}
            </button>
          </div>
          {mintResult !== null && (
            <div className={`mt-2 alert ${mintResult ? "alert-success" : "alert-error"}`}>
              Token minting {mintResult ? "successful" : "failed"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const { address, isConnecting, isDisconnected } = useAccount();

  if (isConnecting) return <div className="text-center">Connecting wallet...</div>;
  if (isDisconnected) return <div className="text-center">Please connect your wallet to continue</div>;
  if (!address) return <div className="text-center">Wallet not connected</div>;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm opacity-70">Connected Address: {address}</div>
      <TokenInfoCard />
      <MinterActionsCard />
    </div>
  );
}
