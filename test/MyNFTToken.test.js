const { BigNumber, constants } = require('ethers');
const { AddressZero, EtherSymbol } = constants

const { expect } = require('chai');
const { ethers } = require('hardhat');

require("@nomicfoundation/hardhat-chai-matchers");

let nftToken, creator, other1, other2, newCreator, trasfertEventInterface, event;


describe('TokenNFT test', function (accounts) {

  const name = "My Collection";
  const symbol = "MCZ";
  const baseURI = "ipfs://QmV3JMMswLrumudfAiZRyipuz93KeAxCkefGhBWMG1sJpe/";
  describe('Set up', function () {

    it('token setup', async function () {
      const TokenNFT = await ethers.getContractFactory("MyNFTToken");
      [creator, other1, other2, newCreator] = await ethers.getSigners();

      nftToken = await TokenNFT.deploy(name, symbol);

      expect(nftToken.address).to.be.not.equal(AddressZero);
      expect(nftToken.address).to.be.not.equal(/0x[0-9a-fA-F]{40}/);
    });

    it('token has correct name', async function () {
      expect(await nftToken.name()).to.equal(name);
    });

    it('token has correct symbol', async function () {
      expect(await nftToken.symbol()).to.equal(symbol);
    });
  });

  describe('minting', function () {
    it('users can NOT mint tokens', async function () {
      await expect(nftToken.connect(other1).mint(other1.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('creator can mint 1 token for other account', async function () {
      tx = await nftToken.connect(creator).mint(other1.address);

      const recipt = await ethers.provider.getTransactionReceipt(tx.hash)
      transfertEventInterface = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"])
      const data = recipt.logs[0].data
      const topics = recipt.logs[0].topics

      event = transfertEventInterface.decodeEventLog("Transfer", data, topics)
      expect(event.from).to.be.equal(AddressZero)
      expect(event.to).to.be.equal(other1.address)
      expect(event.tokenId.toString()).to.be.equal("1")

      expect(await nftToken.balanceOf(other1.address)).to.be.equal(BigNumber.from("1"));
      expect(await nftToken.ownerOf(1)).to.be.equal(other1.address);
      expect(await nftToken.tokenURI(1)).to.be.equal(baseURI + "1.json");

    })

    it('creator can mint 1 token for other2 account', async function () {
      await expect(nftToken.connect(creator).mint(other2.address)).to.emit(nftToken, "Transfer").withArgs(AddressZero, other2.address, 2);
      expect(await nftToken.balanceOf(other2.address)).to.be.equal(BigNumber.from("1"));
      expect(await nftToken.totalSupply()).to.be.equal(BigNumber.from("2"));
      expect(await nftToken.ownerOf(2)).to.be.equal(other2.address);
      expect(await nftToken.tokenURI(2)).to.be.equal(baseURI + "2.json");

    });
  });

  describe('transfer', function () {
    it('other2 can transfer their tokens', async function () {
      await nftToken.connect(other2).transferFrom(other2.address,other1.address, 2)

      expect(await nftToken.balanceOf(other2.address)).to.be.equal(BigNumber.from("0"));
      expect(await nftToken.balanceOf(other1.address)).to.be.equal(BigNumber.from("2"));
      expect(await nftToken.totalSupply()).to.be.equal(BigNumber.from("2"));
      expect(await nftToken.ownerOf(1)).to.be.not.equal(other2.address);
      expect(await nftToken.ownerOf(1)).to.be.equal(other1.address);
      expect(await nftToken.ownerOf(2)).to.be.equal(other1.address);
      
      

    })
  })

})
