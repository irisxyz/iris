import { useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_CHALLENGE, AUTHENTICATION } from '../utils/queries'
import Button from './Button'
import { useWallet } from '../utils/wallet'
import { useAccount, useSigner } from 'wagmi'

function Login({ ...props }) {
    const { authToken, setAuthToken } = useWallet()
    const { data: signer } = useSigner()
    const { address } = useAccount()
    const [getChallenge, challengeData] = useLazyQuery(GET_CHALLENGE)
    const [mutateAuth, authData] = useMutation(AUTHENTICATION)

    const handleClick = async () => {
    
        if (authToken) {
            console.log('login: already logged in');
            return;
        }
        
        console.log('login: address', address);

        getChallenge({ 
          variables: {
            request: {
              address: address,
            },
          },
         })
    }

    useEffect(() => {
      if (!challengeData.data) return

      const handleSign = async () => {
        const signature = await signer.signMessage(challengeData.data.challenge.text);
        window.sessionStorage.setItem('signature', JSON.stringify({
          sig: signature,
          derivedVia: 'ethers.signer.signMessage',
          signedMessage: challengeData.data.challenge.text,
          address: address,
      }))
        mutateAuth({
          variables: {
            request: {
              address: address,
              signature,
            },
          },
        });
      }

      handleSign()
    }, [challengeData.data])

    useEffect(() => {
      if (!authData.data) return

      // window.authToken = authData.data.authenticate.accessToken
      window.sessionStorage.setItem('lensToken', authData.data.authenticate.accessToken)

      setAuthToken(true)

    }, [authData.data])

    useEffect(() => {
      if (window.sessionStorage.getItem('lensToken')) {
        setAuthToken(true)
      }
    }, [])

    if(!address || authToken) return '';
    return <Button onClick={handleClick} {...props}>Login to Lens</Button>;
}

export default Login