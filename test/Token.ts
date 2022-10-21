const { expect } = require("chai");
const { ethers } = require("hardhat");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token contract", function () {
    async function deployTokenFixture() {
      // Get the ContractFactory and Signers here.
      const Token = await ethers.getContractFactory("Token");
      const [owner, addr1, addr2] = await ethers.getSigners();
  
      // To deploy our contract, we just have to call Token.deploy() and await
      // its deployed() method, which happens onces its transaction has been
      // mined.
      const hardhatToken = await Token.deploy();
  
      await hardhatToken.deployed();
  
      // Fixtures can return anything you consider useful for your tests
      return { Token, hardhatToken, owner, addr1, addr2 };
    }
  
    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
  
        expect(await hardhatToken.owner()).to.equal(owner.address);
      });
  
      it("Should assign the total supply of tokens to the owner", async function () {
        const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
        const ownerBalance = await hardhatToken.balanceOf(owner.address);

        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
      });
    });
  
    describe("Transactions", function () {
      it("Should transfer tokens between accounts", async function () {
        const { hardhatToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        
        // Transfer 50 tokens from owner to addr1
        await expect(
          hardhatToken.transfer(addr1.address, 50)
        ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);
  
        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await expect(
          hardhatToken.connect(addr1).transfer(addr2.address, 50)
        ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
      });
  
      it("should emit Transfer events", async function () {
        const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
          deployTokenFixture
        );
  
        // Transfer 50 tokens from owner to addr1
        await expect(hardhatToken.transfer(addr1.address, 50))
          .to.emit(hardhatToken, "Transfer")
          .withArgs(owner.address, addr1.address, 50);
  
        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
          .to.emit(hardhatToken, "Transfer")
          .withArgs(addr1.address, addr2.address, 50);
      });
  
      it("Should fail if sender doesn't have enough tokens", async function () {
        const { hardhatToken, owner, addr1 } = await loadFixture(
          deployTokenFixture
        );
        const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
  
        // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
        // `require` will evaluate false and revert the transaction.
        await expect(
          hardhatToken.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("Not enough tokens");
  
        // Owner balance shouldn't have changed.
        expect(await hardhatToken.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
        );
      });
    });
  });
  