const hre = require("hardhat");
async function main() {
  const Factory = await hre.ethers.getContractFactory("CharityDonation");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  console.log("CharityDonation deployed to:", await contract.getAddress());
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
