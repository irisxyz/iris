function Follow({ wallet, contract }) {

    const handleClick = async () => {
        const followed = 2;
        await contract.follow([followed], [[]]);
        
        const followNFTAddr = await contract.getFollowNFT(followed);
        const followNFT = contract.connect(followNFTAddr, wallet);

        const totalSupply = await followNFT.totalSupply();
        const ownerOf = await followNFT.ownerOf(followed);

        console.log(`Follow NFT total supply (should be 1): ${totalSupply}`);
        console.log(`Follow NFT owner of ID 1: ${ownerOf}, user address (should be the same): ${wallet.address}`);
    }

    return (
        <div>
            <button onClick={handleClick}>Follow profile</button>
        </div>
    )
}

export default Follow