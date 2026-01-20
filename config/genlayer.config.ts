import { defineConfig } from "genlayer";

export default defineConfig({
  // Network configuration
  network: {
    default: "testnet-asimov",
    networks: {
      localnet: {
        rpcUrl: "http://localhost:4000/api",
      },
      studionet: {
        rpcUrl: "https://studio.genlayer.com/api",
      },
      "testnet-asimov": {
        rpcUrl: "https://testnet-asimov.genlayer.com/api",
      },
    },
  },
  // Contract paths
  contracts: {
    path: "./contracts",
  },
});