import { Button, Modal, ModalContent, Snippet, useDisclosure } from '@nextui-org/react';
import BigNumber from 'bignumber.js';
import { parseEther } from 'ethers';
import { toast } from 'sonner';
import { useAccount, useBalance, useDisconnect, useReadContract, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '../configs/wagmi';
import { abi as myContractAbi } from "../contracts/MyContract.json";
import { abi as tokenERC20Abi } from "../contracts/TokenERC20.json";
import { Token as myContractAddress } from "../contracts/myContract-address.json";
import { Token as tokenAddress } from "../contracts/tokenERC20-address.json";
import EnterTokensModal from './EnterTokensModal';
import LoadingIcon from './common/LoadingIcon';

type EthAddress = `0x${string}`;

type Hash = EthAddress

interface BalanceERC721 {
  balance: bigint
  name: string
  symbol:string
}

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const disclosureMintEnterTokens = useDisclosure()
  const disclosureDepositEnterTokens = useDisclosure()

    const { data: balance, refetch:balanceRefetch, isLoading:balanceLoading } = useBalance({
      address: address,
      token: tokenAddress as EthAddress,
    })

      const { data: allowance, refetch: allowanceRefetch, isLoading:allowanceLoading} = useReadContract({
        address: tokenAddress as EthAddress,  
        abi: tokenERC20Abi,         
        functionName: 'allowance',
        args: [address, myContractAddress],
      });      

      const {data:deposit, refetch: depositRefetch, isLoading:depositLoading} = useReadContract({
        abi: myContractAbi,
        address: myContractAddress as EthAddress,
        functionName: 'depositOf',
        args:[address]
      })

      const {data:balanceERC721, refetch: balanceERC721Refetch, isLoading: balanceERC721Loading} = useReadContract({
        abi: myContractAbi,
        address: myContractAddress as EthAddress,
        functionName: 'getBalance',
        args:[address],
      })

    const {writeContractAsync: mintWriteContract, isPending:isPendingMint} = useWriteContract() 

    const {writeContractAsync:approveWriteContract, isPending:isPendingApprove} = useWriteContract() 

    const {writeContractAsync: depositWriteContract, isPending:isPendingDeposit } = useWriteContract()

    async function handleMint(token:number){
        if(address && balance)
            await mintWriteContract({
                address: tokenAddress as EthAddress,
                abi:tokenERC20Abi,
                functionName: 'mint',
                args: [address, parseEther(token.toString())],
            }).then(async (hash: Hash)=>{   
              await waitForTransactionReceipt(wagmiConfig,{
                hash,
                timeout:60*60*1000,
                retryCount:6
              }).then(()=> {
                balanceRefetch()
              })      
          }).catch((err)=> console.log(err))
      }

      
      async function handleDeposit(token:number){
        if(address && balance) {     
                await depositWriteContract({
                    address: myContractAddress as EthAddress,
                    abi:myContractAbi,
                    functionName: 'depositToken',
                    args: [parseEther(token.toString())],
                }).then(async (hash: Hash)=>{   
                  await waitForTransactionReceipt(wagmiConfig,{
                    hash,
                    timeout:60*60*1000,
                    retryCount:6
                  }).then(()=> {
                    Promise.all([depositRefetch(), balanceRefetch(), allowanceRefetch(), balanceERC721Refetch()])
                  })      
              })

                return
        }    
      }

      async function handleApprove(token:number){
        if(address && balance)
          await approveWriteContract({
            address: tokenAddress as EthAddress,  
            abi: tokenERC20Abi,         
            functionName: 'approve',
            args: [myContractAddress, parseEther(token.toString())], 
        }).then(async (hash: Hash)=>{   
          await waitForTransactionReceipt(wagmiConfig,{
            hash,
            timeout:60*60*1000,
            retryCount:6
          }).then(()=> {
            allowanceRefetch()
          })}).catch((err)=> console.log(err))
      }

  if (
    balanceLoading||
    allowanceLoading||
    depositLoading||
    balanceERC721Loading
  ) {
    return <LoadingIcon/>
  }
  
  const userDeposit = (deposit as number) !== undefined && balance 
  ? new BigNumber(deposit as number).dividedBy(new BigNumber(10).pow(balance.decimals)).toString() 
  : undefined;

  const userToken = balance?new BigNumber(balance.value.toString()).dividedBy(new BigNumber(10).pow(balance.decimals)).toString(): undefined

  const allowanceToken = ((allowance as number)!== undefined) && balance? new BigNumber((allowance as number).toString()).dividedBy(new BigNumber(10).pow(balance.decimals)).toString(): undefined

  

  return (
    <div className='w-full'>
        <div className='flex flex-col gap-2 text-xl items-center'>
            <div>Wallet Address:</div>
            <Snippet size='lg' color="primary" hideSymbol>{address}</Snippet>
        </div>
        <div className='flex flex-col items-center justify-center gap-5'>
        <div className='flex flex-col gap-2 pt-5 text-lg'>
          <div>
            My NFT: {Number((balanceERC721 as BalanceERC721).balance)} {(balanceERC721 as BalanceERC721).symbol}
          </div>
          <div className='flex gap-5 items-center'>
            <div className='min-w-48'>
              My Token: {userToken} { balance?.symbol }
            </div>
            <Button color='success' variant='flat' onClick={disclosureMintEnterTokens.onOpen}>Mint</Button>
          </div>
          <div className='flex gap-5 items-center'>
            <div className='min-w-48'>
              My Deposit: {userDeposit} { balance?.symbol }
            </div>
            <Button color='success' variant='flat' onClick={disclosureDepositEnterTokens.onOpen}>Deposit</Button>
          </div>
          
          
          
        </div>
        <Button size='lg' color='danger' variant='flat' onClick={() => disconnect()}>Disconnect</Button>
        </div>
        <Modal
        size="md"
        isOpen={disclosureMintEnterTokens.isOpen}
        onClose={disclosureMintEnterTokens.onClose}
        className="p-4 text-default-900"
        classNames={{
          closeButton:"bg-transparent"
        }}
      >
        <ModalContent>
          {(onClose) => <EnterTokensModal 
          callback={(value)=> toast.promise(handleMint(value).then(() =>onClose()), {
            loading: 'Minting...',
            success: 'Minted successfully',
            error: (err)=> {
              if (err.message.includes("Timed out while waiting for transaction")) {
                return "Timed out while waiting for transaction"
              }
              
              return "Something went wrong"
            }
          })}
          innerHeader='Mint Tokens'
          placeholder='Enter mint tokens'
          isLoading={isPendingMint}
          onClose={onClose} />}
        </ModalContent>
      </Modal>

      <Modal
        size="md"
        isOpen={disclosureDepositEnterTokens.isOpen}
        onClose={disclosureDepositEnterTokens.onClose}
        className="p-4 text-default-900"
        classNames={{
          closeButton:"bg-transparent"
        }}
      >
        <ModalContent>
          {(onClose) => <EnterTokensModal 
          callback={(value)=> {
            
            if (Number(allowanceToken)< value) {
              return toast.promise(handleApprove(value), {
                loading: 'Approving...',
                success: 'Approved successfully',
                error: (err)=> {
                  if (err.message.includes("Timed out while waiting for transaction")) {
                    return "Timed out while waiting for transaction"
                  }
                  
                  return "Something went wrong"
                }
              })
            }
            toast.promise(handleDeposit(value).then(()=> onClose()), {
              loading: 'Depositing...',
              success: 'Deposited successfully',
              error: (err)=> {
                if (err.message.includes("ERC20: insufficient allowance")) {
                  return "ERC20: insufficient allowance"
                }
                
                if (err.message.includes("Timed out while waiting for transaction")) {
                  return "Timed out while waiting for transaction"
                }
                
                return "Something went wrong"
              }
            })
            
          }}
          innerHeader='Deposit Tokens'
          placeholder='Enter deposit tokens'
          isLoading={isPendingDeposit||isPendingApprove}
          onClose={onClose} />}
        </ModalContent>
      </Modal>
    </div>
    )
 
}