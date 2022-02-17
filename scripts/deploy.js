async function main() {
    // Grab the contract factory 
    // eslint-disable-next-line no-undef
    const Rentic = await ethers.getContractFactory("Rentic");
 
    // Start deployment, returning a promise that resolves to a contract object
    const rentic = await Rentic.deploy(); // Instance of the contract 
    console.log("Contract deployed to address:", rentic.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });