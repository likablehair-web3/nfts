// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFTToken is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  constructor(string memory collName, string memory collSym) ERC721 (collName, collSym) {}

  function _baseURI() internal pure override returns (string memory){
    return "ipfs://QmV3JMMswLrumudfAiZRyipuz93KeAxCkefGhBWMG1sJpe/";
  }

  function mint (address to) public onlyOwner {
    _tokenIdCounter.increment();
    uint256 tokenId = _tokenIdCounter.current();
    _safeMint(to, tokenId);
    string memory uri = string.concat(Strings.toString(tokenId), ".json");
    _setTokenURI(tokenId, uri);
  }

  function _beforeTokenTransfer(address from,address  to,uint256 tokenId, uint256 batchSize)
    internal
    override(ERC721, ERC721Enumerable) {
      super._beforeTokenTransfer(from,to,tokenId, batchSize);    
  }


  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage){
    super._burn(tokenId);
  }
  
  function tokenURI(uint256 tokenId) 
  public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }
  function supportsInterface(bytes4 interfaceId) 
  public
  view
  override(ERC721, ERC721Enumerable) 
  returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}