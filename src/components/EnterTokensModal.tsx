import { Icon } from '@iconify/react';
import { Button, Input, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useRef } from 'react';

interface Props {
    callback: (value: number)=> void,
    onClose: ()=> void,
    innerHeader?:string
    placeholder?:string
    isLoading?:boolean
}

export default function EnterTokensModal({callback, onClose, innerHeader, placeholder, isLoading}:Props) {

    const inputRef = useRef<HTMLInputElement>(null)

      return (
        <>
          {innerHeader&&<ModalHeader className="flex flex-col gap-1">
            {innerHeader}
          </ModalHeader>}
          <ModalBody>
            <Input
                ref={inputRef}
              size="lg"
              type="number"
              variant="bordered"
              color='primary'
              startContent={
                <Icon icon="material-symbols:wallet" className="text-xl" />
              }
              endContent={<Icon icon="healthicons:dollar" className="text-xl" />}
              placeholder={placeholder}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              onPress={()=> {
                if (Number(inputRef.current?.value)) {
                    callback(Number(inputRef.current?.value))
                }
                }}
                isLoading={isLoading}
            >
              Submit
            </Button>
          </ModalFooter>
        </>
      )
}
