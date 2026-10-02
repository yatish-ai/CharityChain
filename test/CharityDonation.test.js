const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityDonation", function () {
  it("creates a campaign and records a donation", async function () {
    const [owner, charity, donor] = await ethers.getSigners();
    const F = await ethers.getContractFactory("CharityDonation");
    const c = await F.deploy();
    await c.waitForDeployment();
    await c.connect(charity).createCampaign("Education", "School supplies", ethers.parseEther("1"), ["Procurement"], [ethers.parseEther("0.5")]);
    await c.connect(donor).donate(0, { value: ethers.parseEther("0.2") });
    const campaign = await c.campaigns(0);
    expect(campaign.collected).to.equal(ethers.parseEther("0.2"));
  });
});
