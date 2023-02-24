// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract My1155Token is ERC1155Supply, Ownable {
    uint256 public constant CityLondon = 1;
    uint256 public constant CityBerlin = 2;
    uint256 public constant CityRome = 3;
    uint256 public constant CityMadrid = 4;

    mapping(uint256 => string) private _uris;

    constructor()
        ERC1155(
            "ipfs://QmV3JMMswLrumudfAiZRyipuz93KeAxCkefGhBWMG1sJpe/{id}.json"
        )
    {
        _mint(msg.sender, CityLondon, 10, "");
        _mint(msg.sender, CityBerlin, 20, "");
        _mint(msg.sender, CityRome, 30, "");
        _mint(msg.sender, CityMadrid, 5, "");
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(to, id, amount, data);
    }

    
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function uri(uint256 tokenId) override public view returns (string memory) {
      return (_uris[tokenId]);
    }

    function setTokenUri(uint256 tokenId, string memory tokenUri)  public onlyOwner {
      require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
      _uris[tokenId] = tokenUri;
    }
}
