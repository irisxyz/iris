import { useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_CHALLENGE, AUTHENTICATION, CREATE_PROFILE } from '../utils/queries'
import Button from './Button'
import { useWallet } from '../utils/wallet'

function Login() {
    const { wallet, authToken, setAuthToken } = useWallet()
    const [getChallenge, challengeData] = useLazyQuery(GET_CHALLENGE)
    const [mutateAuth, authData] = useMutation(AUTHENTICATION)
    const [createProfile, createProfileData] = useMutation(CREATE_PROFILE)

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

    const handleCreate = async () => {
      createProfile({
        variables: {
          request: {
            handle: 'isaac'
          }
        }
      })

    }

    if(!wallet.address || authToken) return '';
    return (
        <div style={{ marginTop:'1em'}}>
            <Button onClick={handleClick}>Login to Lens</Button>
        </div>
    )
}

export default Login