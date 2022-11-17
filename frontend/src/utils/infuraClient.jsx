import { create } from 'ipfs-http-client'

const auth = 'Basic ' + Buffer.from(import.meta.env.VITE_INFURA_PROJECT_ID + ':' + import.meta.env.VITE_INFURA_API_KEY).toString('base64');

export const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});