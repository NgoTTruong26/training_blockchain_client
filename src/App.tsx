import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { WagmiProvider } from 'wagmi'
import './App.css'
import reactLogo from './assets/react.svg'
import ConnectWallet from './components/ConnectWallet'
import { wagmiConfig } from './configs/wagmi'
import viteLogo from '/vite.svg'


function App() {

  const queryClient = new QueryClient()

  return (
    <NextUIProvider>
      <WagmiProvider config={wagmiConfig}>
         <QueryClientProvider client={queryClient}>
          <div className='flex justify-center'>
            <a target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1 className='text-center'>Vite + React</h1>

          <p className="read-the-docs pb-10 text-center">
            Click on the Vite and React logos to learn more
          </p>
          <ConnectWallet/>
          <Toaster position="bottom-right" richColors />
        </QueryClientProvider>
      </WagmiProvider>
    </NextUIProvider>
  )
}

export default App
