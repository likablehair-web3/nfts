// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "./MyNFTToken.sol";

contract MyNFTTokenFactory is Ownable {
    address[] public nfTokenContracts;
    uint256 public nftTokenCounter;
    mapping(address => bool) public isNftTokenDeployed;

    constructor() {}

    function deployNewNFTToken(
        string memory collName,
        string memory collSymbol,
        address creator
    ) external onlyOwner returns (address) {
        MyNFTToken newNFTToken = new MyNFTToken(collName, collSymbol);
        newNFTToken.transferOwnership(creator);
        nfTokenContracts.push(address(newNFTToken));
        nftTokenCounter++;
        isNftTokenDeployed[address(newNFTToken)] = true;

        return address(newNFTToken);
    }

    function getNftTokenAddress(uint256 _idx) external view returns (address) {
        require(_idx < nftTokenCounter, "Array index out of bound");
        return nfTokenContracts[_idx];
    }

    function getNftTokenDeployed(address token) public view returns (bool) {
        return isNftTokenDeployed[token];
    }

    function pause(address _nftToBePaused) external onlyOwner{
        require(getNftTokenDeployed(_nftToBePaused), "NFT token not deployed by this factory");
        IMyNFTToken(_nftToBePaused).pause();
    }

     function unpause(address _nftToBeUnPaused) external onlyOwner{
        require(getNftTokenDeployed(_nftToBeUnPaused), "NFT token not deployed by this factory");
        IMyNFTToken(_nftToBeUnPaused).unpause();
    }
}
