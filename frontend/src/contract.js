export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const CONTRACT_ABI = [
  'function donate(uint256 campaignId) payable',
  'function campaigns(uint256) view returns (address charity,string title,string description,uint256 target,uint256 collected,uint8 status,uint256 milestoneCount)',
  'function campaignCount() view returns (uint256)'
];
