const { BigNumber, constants } = require('ethers');
const { AddressZero, EtherSymbol } = constants

const { expect } = require('chai');
const { ethers } = require('hardhat');

require("@nomicfoundation/hardhat-chai-matchers");

let nftToken, creator, other1, other2, newCreator, trasfertEventInterface, event;


describe('Token1155 test', function (accounts) {

  const baseURI = "ipfs://QmV3JMMswLrumudfAiZRyipuz93KeAxCkefGhBWMG1sJpe/";
  describe('Set up', function () {

    it('token setup', async function () {
      const Token1155 = await ethers.getContractFactory("My1155Token");
      [creator, other1, other2, newCreator] = await ethers.getSigners();

      erc1155Token = await Token1155.deploy();

      expect(erc1155Token.address).to.be.not.equal(AddressZero);
      expect(erc1155Token.address).to.match(/0x[0-9a-fA-F]{40}/);
    });


    it('token URI setup for ID', async function () {
      await erc1155Token.connect(creator).setTokenUri(1, baseURI + "1.json");
      await erc1155Token.connect(creator).setTokenUri(2, baseURI + "2.json");
      await erc1155Token.connect(creator).setTokenUri(3, baseURI + "3.json");
      await erc1155Token.connect(creator).setTokenUri(4, baseURI + "4.json");

    });
  });

  describe('minting', function () {
    it('users can NOT mint tokens', async function () {
      await expect(erc1155Token.connect(other1).mint(other1.address, 1, 5, 0x11))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('creator can mint 5 token with id=1 for other account', async function () {
      tx = await erc1155Token.connect(creator).mint(other1.address, 1, 5, 0x112233)

      const recipt = await ethers.provider.getTransactionReceipt(tx.hash)
      transfertEventInterface = new ethers.utils.Interface(["event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id,  uint256 value)"])
      const data = recipt.logs[0].data
      const topics = recipt.logs[0].topics

      event = transfertEventInterface.decodeEventLog("TransferSingle", data, topics)
      expect(event.from).to.equal(AddressZero)
      expect(event.to).to.equal(other1.address)
      expect(event.id.toString()).to.equal("1")
      expect(event.value.toString()).to.equal("5")

      expect(await erc1155Token.balanceOf(other1.address, 1)).to.be.equal(BigNumber.from("5"));
      expect(await erc1155Token.uri(1)).to.be.equal(baseURI + "1.json");

    })

    it('creator can mint 15 tokens with id=2 for other2 account', async function () {
      await expect(erc1155Token.connect(creator).mint(other2.address, 2, 15, 0x11))
        .to.emit(erc1155Token, "TransferSingle").withArgs(creator.address, AddressZero, other2.address, 2, 15);

      expect(await erc1155Token.balanceOf(other2.address, 2)).to.be.equal(BigNumber.from("15"));
      expect(await erc1155Token.totalSupply(2)).to.be.equal(BigNumber.from("35"));
      expect(await erc1155Token.uri(2)).to.be.equal(baseURI + "2.json");

    });

    it('creator can batch mint some tokens with different ids for other1 account', async function () {
      await expect(erc1155Token.connect(creator).mintBatch(other1.address, [3, 4], [8, 16], 0x11))
        .to.emit(erc1155Token, "TransferBatch").withArgs(creator.address, AddressZero, other1.address, [3, 4], [8, 16]);

      expect(await erc1155Token.balanceOf(other1.address, 3)).to.be.equal(BigNumber.from("8"));
      expect(await erc1155Token.balanceOf(other1.address, 4)).to.be.equal(BigNumber.from("16"));
      expect(await erc1155Token.totalSupply(3)).to.be.equal(BigNumber.from("38"));
      expect(await erc1155Token.totalSupply(4)).to.be.equal(BigNumber.from("21"));

      expect(await erc1155Token.uri(3)).to.be.equal(baseURI + "3.json");
      expect(await erc1155Token.uri(4)).to.be.equal(baseURI + "4.json");

    });
  });

  describe('transfer', function () {
    it('other2 can transfer their tokens', async function () {
      await erc1155Token.connect(other2).safeTransferFrom(other2.address, other1.address, 2, 3, 0x11)

      expect(await erc1155Token.balanceOf(other1.address, 2)).to.be.equal(BigNumber.from("3"));
      expect(await erc1155Token.balanceOf(other2.address, 2)).to.be.equal(BigNumber.from("12"));
    })

    it('other1 can batch transfer their tokens', async function () {
      await erc1155Token.connect(other1).safeBatchTransferFrom(other1.address, other2.address, [1, 4], [2, 5], 0x11)

      expect(await erc1155Token.balanceOf(other1.address, 1)).to.be.equal(BigNumber.from("3"));
      expect(await erc1155Token.balanceOf(other2.address, 1)).to.be.equal(BigNumber.from("2"));
      expect(await erc1155Token.balanceOf(other1.address, 4)).to.be.equal(BigNumber.from("11"));
      expect(await erc1155Token.balanceOf(other2.address, 4)).to.be.equal(BigNumber.from("5"));
    })
  })
})
