import { createClient, createAccount } from "genlayer-js";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Get network from environment or default to testnet
  const network = process.env.GENLAYER_NETWORK || "testnet-asimov";
  
  let rpcUrl: string;
  switch (network) {
    case "localnet":
      rpcUrl = "http://localhost:4000/api";
      break;
    case "studionet":
      rpcUrl = "https://studio.genlayer.com/api";
      break;
    case "testnet-asimov":
    default:
      rpcUrl = "https://testnet-asimov.genlayer.com/api";
      break;
  }

  console.log(`\n🎮 Deploying Real Time Royale to ${network}...`);
  console.log(`📡 RPC URL: ${rpcUrl}\n`);

  // Create client
  const client = createClient({
    endpoint: rpcUrl,
  });

  // Create or load account
  const account = createAccount();
  console.log(`📝 Deployer address: ${account.address}\n`);

  // Read contract code
  const contractPath = path.join(__dirname, "..", "contracts", "real_time_royale.py");
  const contractCode = fs.readFileSync(contractPath, "utf-8");

  console.log("📄 Contract loaded successfully");
  console.log(`   Size: ${contractCode.length} bytes\n`);

  try {
    // Deploy contract (no constructor arguments needed)
    console.log("🚀 Deploying contract...");
    
    const deploymentResult = await client.deployContract({
      account,
      code: contractCode,
      args: [], // No constructor arguments
    });

    console.log("\n✅ Contract deployed successfully!");
    console.log(`📍 Contract Address: ${deploymentResult.contractAddress}`);
    console.log(`🔗 Transaction Hash: ${deploymentResult.transactionHash}`);
    
    // Save deployment info
    const deploymentInfo = {
      network,
      contractAddress: deploymentResult.contractAddress,
      transactionHash: deploymentResult.transactionHash,
      deployedAt: new Date().toISOString(),
      deployer: account.address,
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n💾 Deployment info saved to: deployments/${network}.json`);
    
    return deploymentResult;
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🎉 Deployment complete!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });