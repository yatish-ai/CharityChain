// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CharityDonation {
    enum CampaignStatus { Active, Paused, Completed }
    enum MilestoneStatus { Pending, Approved, Released }

    struct Milestone {
        string title;
        uint256 amount;
        string evidenceRef;
        MilestoneStatus status;
    }

    struct Campaign {
        address charity;
        string title;
        string description;
        uint256 target;
        uint256 collected;
        CampaignStatus status;
        uint256 milestoneCount;
    }

    address public owner;
    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(address => uint256)) public donorAmount;

    event CampaignCreated(uint256 indexed campaignId, address indexed charity, string title, uint256 target);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event EvidenceSubmitted(uint256 indexed campaignId, uint256 indexed milestoneId, string evidenceRef);
    event MilestoneApproved(uint256 indexed campaignId, uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, address indexed charity, uint256 amount);

    modifier onlyOwner() { require(msg.sender == owner, "Only owner"); _; }
    modifier campaignExists(uint256 id) { require(id < campaignCount, "Campaign not found"); _; }

    constructor() { owner = msg.sender; }

    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 target,
        string[] calldata milestoneTitles,
        uint256[] calldata milestoneAmounts
    ) external returns (uint256 id) {
        require(target > 0, "Target must be positive");
        require(milestoneTitles.length == milestoneAmounts.length, "Milestone mismatch");
        id = campaignCount++;
        campaigns[id] = Campaign(msg.sender, title, description, target, 0, CampaignStatus.Active, milestoneTitles.length);
        for (uint256 i = 0; i < milestoneTitles.length; i++) {
            milestones[id][i] = Milestone(milestoneTitles[i], milestoneAmounts[i], "", MilestoneStatus.Pending);
        }
        emit CampaignCreated(id, msg.sender, title, target);
    }

    function donate(uint256 campaignId) external payable campaignExists(campaignId) {
        Campaign storage c = campaigns[campaignId];
        require(c.status == CampaignStatus.Active, "Campaign inactive");
        require(msg.value > 0, "Donation must be positive");
        c.collected += msg.value;
        donorAmount[campaignId][msg.sender] += msg.value;
        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    function submitEvidence(uint256 campaignId, uint256 milestoneId, string calldata evidenceRef) external campaignExists(campaignId) {
        require(msg.sender == campaigns[campaignId].charity, "Only charity");
        require(milestoneId < campaigns[campaignId].milestoneCount, "Milestone not found");
        milestones[campaignId][milestoneId].evidenceRef = evidenceRef;
        emit EvidenceSubmitted(campaignId, milestoneId, evidenceRef);
    }

    function approveMilestone(uint256 campaignId, uint256 milestoneId) external onlyOwner campaignExists(campaignId) {
        require(milestoneId < campaigns[campaignId].milestoneCount, "Milestone not found");
        Milestone storage m = milestones[campaignId][milestoneId];
        require(bytes(m.evidenceRef).length > 0, "Evidence required");
        require(m.status == MilestoneStatus.Pending, "Invalid status");
        m.status = MilestoneStatus.Approved;
        emit MilestoneApproved(campaignId, milestoneId);
    }

    function releaseFunds(uint256 campaignId, uint256 milestoneId) external onlyOwner campaignExists(campaignId) {
        Campaign storage c = campaigns[campaignId];
        Milestone storage m = milestones[campaignId][milestoneId];
        require(m.status == MilestoneStatus.Approved, "Milestone not approved");
        require(address(this).balance >= m.amount, "Insufficient contract balance");
        m.status = MilestoneStatus.Released;
        (bool ok,) = payable(c.charity).call{value: m.amount}("");
        require(ok, "Transfer failed");
        emit FundsReleased(campaignId, milestoneId, c.charity, m.amount);
    }

    function getMilestone(uint256 campaignId, uint256 milestoneId) external view returns (Milestone memory) {
        return milestones[campaignId][milestoneId];
    }

    receive() external payable {}
}
