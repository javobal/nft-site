require('dotenv').config();
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const contract = require("../artifacts/contracts/Rentic.sol/Rentic.json");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

async function mintNFT(tokenURI) {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce

  //the transaction
  const tx = {
    'from': PUBLIC_KEY,
    'to': contractAddress,
    'nonce': nonce,
    'gas': 500000,
    'maxPriorityFeePerGas': 2999999987,
    'data': nftContract.methods.safeMint(PUBLIC_KEY, tokenURI).encodeABI()
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  const transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
  console.log(`Transaction receipt: ${JSON.stringify(transactionReceipt)}`);
}

//mintNFT("https://gateway.pinata.cloud/ipfs/QmeuTvH25KNu7TZYVU2LTtXwWyRkxgZY4R1Jw1x46o8haE");
//mintNFT("https://gateway.pinata.cloud/ipfs/QmQoSjLYocPhAFda6Wuzu6xvLo938vqcXyyCMzSwyP1j6t");
//mintNFT("https://gateway.pinata.cloud/ipfs/QmReVEWFK2cHLvDHmHUwCTBiuDtDc5s32Udph2VqrhJSsS");