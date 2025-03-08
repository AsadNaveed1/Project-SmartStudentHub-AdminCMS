const { ethers } = require("hardhat");
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const network = await ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  const EventRegistration = await ethers.getContractFactory("EventRegistration");
  console.log("ContractFactory obtained successfully");
  console.log("Deploying contract...");
  const eventRegistration = await EventRegistration.deploy();
  console.log("Waiting for deployment transaction to be mined...");
  await eventRegistration.waitForDeployment();
  const deployedAddress = await eventRegistration.getAddress();
  console.log("EventRegistration contract deployed to:", deployedAddress);
  console.log("\n-------------------------------------------------------------");
  console.log("IMPORTANT: Update CONTRACT_ADDRESS in BlockchainService.js with this address:");
  console.log(`const CONTRACT_ADDRESS = "${deployedAddress}";`);
  console.log("-------------------------------------------------------------");
  if (network.name === "skale") {
    console.log("\nDeployed to SKALE Network. No gas fees will be charged for transactions.");
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });