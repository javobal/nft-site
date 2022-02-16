import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [isMetaMaskAvailable, setMetaMaskAvailable] = useState(false);
  const [account, setAccount] = useState('');

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
      setMetaMaskAvailable(true);
    }
  }, []);

  const connectWallet = async () => {
    if (isMetaMaskAvailable) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      console.log("metamask -> account obtained: ", accounts[0]);
    }
  };

  return (
    <div className="h-screen flex flex-grow flex-col items-center justify-center bg-teal-400">
      <div className="flex flex-col w-5/12 items-center justify-center p-12 border shadow-lg border-gray-400 rounded-lg bg-white">
        <img
          height={100}
          width={100}
          alt="nft logo"
          src="https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png"
        ></img>
        <h1 className="font-sans text-3xl text-gray-500 font-bold mt-2">NFT SITE</h1>
        <div className="flex flex-col items-center justify-center p-8 mt-8">
          <button
            onClick={connectWallet}
            disabled={!isMetaMaskAvailable}
            className="bg-green-300 hover:bg-green-400 hover:shadow-lg hover:text-white text-gray-500 font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
          <div className="flex flex-col items-center p-4 mt-4">
            <span className="text-gray-500 font-bold">Connected account</span>
            <span>{account}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
