import { createConfig, http } from 'wagmi'
import { base, bscTestnet, hardhat, mainnet } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'


export const wagmiConfig = createConfig({
  chains: [mainnet, base, hardhat, bscTestnet],
  connectors: [
    metaMask(),
  ],
  transports: {
    [bscTestnet.id]: http("https://bsc-testnet.infura.io/v3/317b537f510e4a40a6126d2ee0e11b92"),
    [mainnet.id]: http(),
    [base.id]: http(), 
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
})