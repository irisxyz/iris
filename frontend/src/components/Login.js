import { useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_CHALLENGE, AUTHENTICATION } from '../utils/queries'
import Button from './Button'
import { useWallet } from '../utils/wallet'

function Login({ ...props }) {
    const { wallet, authToken, setAuthToken } = useWallet()
    const [getChallenge, challengeData] = useLazyQuery(GET_CHALLENGE)
    const [mutateAuth, authData] = useMutation(AUTHENTICATION)

    const handleClick = async () => {
    
        if (authToken) {
            console.log('login: already logged in');
            return;
        }
        
        console.log('login: address', wallet.address);

        getChallenge({ 
          variables: {
            request: {
              address: wallet.address,
            },
          },
         })
    }

    useEffect(() => {
      if (!challengeData.data) return

      const handleSign = async () => {
        const signature = await wallet.signer.signMessage(challengeData.data.challenge.text);
        window.sessionStorage.setItem('signature', JSON.stringify({
          sig: signature,
          derivedVia: 'ethers.signer.signMessage',
          signedMessage: challengeData.data.challenge.text,
          address: wallet.address,
      }))
        mutateAuth({
          variables: {
            request: {
              address: wallet.address,
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

    if(!wallet.address || authToken) return '';
    return <Button onClick={handleClick} {...props}>Login to Lens</Button>;
}

export default Login