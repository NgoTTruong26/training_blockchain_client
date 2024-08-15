import { Button } from "@nextui-org/react";
import { useConnect } from "wagmi";

export default function WalletOptions() {
    const { connectors, connect,isPending } = useConnect()

    console.log(connectors);
    

    return connectors.map((connector, idx) => connector.icon &&(
        <div key={idx} className="flex justify-center">
        
        <Button size="lg" isLoading={isPending} key={connector.uid} onClick={() => {
            connect({ connector })}}
            startContent={<img src={connector.icon}/>}
            className="font-semibold"
            >
          Connect with {connector.name}
        </Button>
        </div>
      ))
}
