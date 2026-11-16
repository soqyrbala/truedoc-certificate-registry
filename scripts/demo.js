// Demo of the main use case on the local Hardhat network (test accounts only).
// Run: npx hardhat run scripts/demo.js
const { ethers } = require("hardhat");

async function main() {
  const [admin, university, , employer] = await ethers.getSigners();
  const names = ["NotFound", "Valid", "Revoked"];
  const show = async (label, h) => {
    const [s, issuer, at] = await registry.connect(employer).verify(h);
    console.log(`   ${label}: status = ${names[Number(s)]}` + (s != 0n ? `, issuer = ${issuer.slice(0, 8)}..., date = ${new Date(Number(at) * 1000).toISOString()}` : ""));
  };

  console.log("1. Deploy CertificateRegistry on the local Hardhat network");
  const registry = await ethers.deployContract("CertificateRegistry", [admin.address]);
  console.log("   contract address:", await registry.getAddress());

  console.log("2. Admin registers a university (test account)");
  await (await registry.registerUniversity(university.address)).wait();

  const hash = ethers.keccak256(ethers.toUtf8Bytes("TEST-DIPLOMA-12345")); // invented test certificate
  console.log("3. University issues a certificate (only the hash goes on-chain)");
  console.log("   hash:", hash);
  await (await registry.connect(university).issue(hash)).wait();

  console.log("4. Employer verifies the certificate");
  await show("verify(hash)", hash);

  console.log("5. Employer verifies a wrong hash");
  await show("verify(wrong hash)", ethers.keccak256(ethers.toUtf8Bytes("FAKE-DIPLOMA")));

  console.log("6. University revokes the certificate");
  await (await registry.connect(university).revoke(hash)).wait();

  console.log("7. Employer verifies again");
  await show("verify(hash)", hash);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
