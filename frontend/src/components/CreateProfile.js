import { ZERO_ADDRESS } from '../utils/constants'

function CreateProfile({ wallet, contract }) {

    const handleClick = async () => {
        // console.log('clicked')
        console.log(contract)

        const profile = {
            to: wallet.address,
            handle: 'test1234',
            imageURI:
              'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
            followModule: ZERO_ADDRESS,
            followModuleData: [],
            followNFTURI:
              'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
          };

        console.log(profile)
        await contract.createProfile(profile)

        console.log(`Total supply: ${await contract.totalSupply()}`);
    }

    return (
        <div>
            <button onClick={handleClick}>Create profile</button>
        </div>
    )
}

export default CreateProfile