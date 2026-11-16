const { expect } = require("chai");
const { ethers } = require("hardhat");

// Status enum: 0 = NotFound, 1 = Valid, 2 = Revoked
const NOT_FOUND = 0n, VALID = 1n, REVOKED = 2n;
const hashOf = (text) => ethers.keccak256(ethers.toUtf8Bytes(text));

describe("CertificateRegistry", function () {
  let registry, admin, uni1, uni2, stranger;

  beforeEach(async function () {
    [admin, uni1, uni2, stranger] = await ethers.getSigners(); // test accounts made by Hardhat
    registry = await ethers.deployContract("CertificateRegistry", [admin.address]);
    await registry.registerUniversity(uni1.address);
    await registry.registerUniversity(uni2.address);
  });

  it("1. a registered university can issue a certificate and verify() shows it as valid", async function () {
    const h = hashOf("TEST-DIPLOMA-001");
    await expect(registry.connect(uni1).issue(h)).to.emit(registry, "CertificateIssued");
    const [status, issuer, issuedAt] = await registry.verify(h);
    expect(status).to.equal(VALID);
    expect(issuer).to.equal(uni1.address);
    expect(issuedAt).to.be.greaterThan(0n);
  });

  it("2. an unregistered account cannot issue", async function () {
    await expect(registry.connect(stranger).issue(hashOf("X"))).to.be.revertedWithCustomError(
      registry, "AccessControlUnauthorizedAccount");
  });

  it("3. the admin cannot issue certificates", async function () {
    await expect(registry.connect(admin).issue(hashOf("X"))).to.be.revertedWithCustomError(
      registry, "AccessControlUnauthorizedAccount");
  });

  it("4. the same hash cannot be issued twice", async function () {
    const h = hashOf("TEST-DIPLOMA-002");
    await registry.connect(uni1).issue(h);
    await expect(registry.connect(uni2).issue(h)).to.be.revertedWithCustomError(registry, "AlreadyIssued");
  });

  it("5. only the issuing university can revoke; the status then becomes revoked", async function () {
    const h = hashOf("TEST-DIPLOMA-003");
    await registry.connect(uni1).issue(h);
    await expect(registry.connect(uni2).revoke(h)).to.be.revertedWithCustomError(registry, "NotIssuer");
    await expect(registry.connect(uni1).revoke(h)).to.emit(registry, "CertificateRevoked");
    const [status] = await registry.verify(h);
    expect(status).to.equal(REVOKED);
  });

  it("6. verify() returns not found for an unknown hash", async function () {
    const [status] = await registry.verify(hashOf("UNKNOWN"));
    expect(status).to.equal(NOT_FOUND);
  });

  it("7. issuing stops while the contract is paused and works again after unpause", async function () {
    const h = hashOf("TEST-DIPLOMA-004");
    await registry.pause();
    await expect(registry.connect(uni1).issue(h)).to.be.revertedWithCustomError(registry, "EnforcedPause");
    await registry.unpause();
    await registry.connect(uni1).issue(h);
    const [status] = await registry.verify(h);
    expect(status).to.equal(VALID);
  });

  it("8. only the admin can register universities and pause", async function () {
    await expect(registry.connect(stranger).registerUniversity(stranger.address)).to.be.revertedWithCustomError(
      registry, "AccessControlUnauthorizedAccount");
    await expect(registry.connect(stranger).pause()).to.be.revertedWithCustomError(
      registry, "AccessControlUnauthorizedAccount");
  });
});
