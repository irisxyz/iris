import {
    LivepeerConfig,
    createReactClient,
    studioProvider,
} from '@livepeer/react';

export const client = createReactClient({
    provider: studioProvider({ 
        apiKey: import.meta.env.VITE_LIVEPEER_API_KEY
    }),
});

function Livepeer({ children }) {
    return <LivepeerConfig client={client}>{ children }</LivepeerConfig>
}

export default Livepeer