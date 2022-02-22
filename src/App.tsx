import React, { useEffect, useState } from "react";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import RenticContractABI from "./Rentic.json";
import { AbiItem } from "web3-utils";

// Using HTTPS
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_API_URL || "");

declare global {
  interface Window {
    ethereum: any;
  }
}

interface NFTResult {
  tokenId: string;
  tokenUri: string;
  data: NFTMetadata;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

function App() {
  const [isMetaMaskAvailable, setMetaMaskAvailable] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [valid, setValidity] = useState(false);
  const [NFTS, setNFTS] = useState<(NFTResult | undefined)[]>([]);

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
      console.log("window.ethereum.request -> account obtained: ", accounts[0]);
    }
  };

  const web3getAccounts = async () => {
    if (isMetaMaskAvailable) {
      try {
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        console.log("web3 getAccounts -> accounts: ", accounts);
      } catch (error) {
        console.log("web3 getAccounts -> error: ", error);
      }
    }
  };

  const alchemyGetNFTs = async () => {
    const nfts = await web3.alchemy.getNfts({ owner: account });
    console.log("nfts: ", nfts);
  };

  const tokenOfOwnerByIndex = async () => {
    const ABI = RenticContractABI.abi as unknown[] as AbiItem[];

    const renticContract = new web3.eth.Contract(
      ABI,
      process.env.REACT_APP_CONTRACT_ADDRESS,
      { from: process.env.REACT_APP_PUBLIC_KEY }
    );

    const fetchTokenInfo = async (
      account: string,
      idx: number
    ): Promise<NFTResult> => {
      const tokenId = await renticContract.methods
        .tokenOfOwnerByIndex(account, idx)
        .call();
      const tokenUri = await renticContract.methods.tokenURI(tokenId).call();
      const data = await fetch(tokenUri).then((data) => data.json());
      return { tokenId, tokenUri, data };
    };

    const balance = await renticContract.methods.balanceOf(account).call();
    setBalance(balance);

    let tokenPromises: Promise<NFTResult>[] = [];
    for (let i = 0; i < balance; i++) {
      tokenPromises = [...tokenPromises, fetchTokenInfo(account, i)];
    }
    const userNFTSResults = await Promise.allSettled(tokenPromises);

    const userNFTS = userNFTSResults.map((n) =>
      n.status === "fulfilled" ? n.value : undefined
    );

    setNFTS(userNFTS);
    console.log("userNFTs: ", userNFTS);
  };

  const validateOwnership = async () => {
    try {
      // request signed message
      const message = "Hello Rentic Team Member!";
      const signature = await web3.eth.personal.sign(message, account, "");
      // verify signature
      const signer = web3.eth.accounts.recover(message, signature);

      console.log("isValid: ", signer === account);
      setValidity(signer === account);
    } catch (error) {
      console.log("validateOwnership -> error: ", error);
    }
  };

  const renderNFT = (nft?: NFTResult) => {
    if (!nft) return null;
    return (
      <div
        key={nft.tokenId}
        className=" flex flex-col border border-gray-200 items-center rounded-lg shadow-lg p-4"
      >
        <img className="h-24" src={nft.data.image} alt={nft.tokenId} />
        <span className="text-gray-500 font-bold">RNT {nft.tokenId}</span>
        <span className="text-gray-500">{nft.data.name}</span>
      </div>
    );
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
        <h1 className="font-sans text-3xl text-gray-500 font-bold mt-2">
          NFT SITE
        </h1>
        <div className="flex flex-col w-full items-center justify-center p-8 mt-8 space-y-4">
          {!account ? (
            <div className="flex flex-col w-full items-center justify-center space-y-4">
              <button
                onClick={() => connectWallet()}
                disabled={!isMetaMaskAvailable}
                className="bg-green-300 hover:bg-green-400 hover:shadow-lg hover:text-white text-gray-500 font-bold py-2 px-4 rounded"
              >
                Connect Wallet
              </button>
              <button
                onClick={() => web3getAccounts()}
                className="bg-green-300 hover:bg-green-400 hover:shadow-lg hover:text-white text-gray-500 font-bold py-2 px-4 rounded"
              >
                Web3: getAccounts
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-full items-center justify-center space-y-4">
              <button
                onClick={() => alchemyGetNFTs()}
                disabled={!account}
                className="bg-green-300 hover:bg-green-400 hover:shadow-lg hover:text-white text-gray-500 font-bold py-2 px-4 rounded"
              >
                Alchemy's NFT API: Get NFTs
              </button>
              <button
                onClick={() => tokenOfOwnerByIndex()}
                disabled={!account}
                className="bg-green-300 hover:bg-green-400 hover:shadow-lg hover:text-white text-gray-500 font-bold py-2 px-4 rounded disabled:bg-gray-200"
              >
                Web3: tokenOfOwnerByIndex
              </button>
              <button
                onClick={() => validateOwnership()}
                disabled={!account}
                className="bg-green-300 hover:bg-green-400 hover:shadow-lg hover:text-white text-gray-500 font-bold py-2 px-4 rounded disabled:bg-gray-200"
              >
                Web3: validateOwnership
              </button>

              <div className="flex w-full flex-col items-center px-4">
                <span className="text-gray-500 font-bold">
                  Connected account
                </span>
                <p className=" w-full text-gray-600 break-words text-center">
                  {account}
                </p>
                <span className="text-gray-500 font-bold">
                  Validated Ownership ?
                </span>
                <p className=" w-full text-gray-600 break-words text-center">
                  {valid
                    ? "✅ Hi, Rentic member!"
                    : "🔐 Please verify you are the owner of the address"}
                </p>
              </div>
              <div className="flex w-full flex-col items-center px-4 space-y-2">
                <span className="text-gray-500 font-bold">
                  RNT's in your account
                </span>
                {NFTS.length > 0 && (
                  <div className="flex flex-wrap w-full items-center justify-center gap-4">
                    {NFTS.map(renderNFT)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
