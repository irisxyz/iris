import { task } from 'hardhat/config';
import { LensHub__factory } from '../typechain-types';
// import { CreateProfileDataStruct } from '../typechain-types/LensHub';
import { waitForTx, initEnv, getAddrs, ZERO_ADDRESS } from './helpers/utils';

task('whitelist', 'whitelists a profile').setAction(async ({}, hre) => {
    const [governance, , user] = await initEnv(hre);
    const addrs = getAddrs();
    const lensHub = LensHub__factory.connect(addrs['lensHub proxy'], governance);

    await waitForTx(lensHub.whitelistProfileCreator(user.address, true));

    console.log(`Whitelisted ${user.address}`)
  });