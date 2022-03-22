import { useEffect } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Button from './Button'

const GET_CHALLENGE = gql`
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;

const AUTHENTICATION = gql`
  mutation($request: SignedAuthChallenge!) { 
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
  }
`;

const CREATE_PROFILE = gql`
  mutation($request: CreateProfileRequest!) { 
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
      __typename
    }
}
`;

function Login({ wallet, auth }) {
    const [authToken, setAuthToken] = auth
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
            handle: 'gaia'
          }
        }
      })

    }

    return (
        <div>
            {
              authToken
              ? <div>
                  Logged in.
                  <Button onClick={handleCreate}>Create Profile</Button>
                </div>
              : <Button onClick={handleClick}>Login to Lens</Button>
            }
            {
              JSON.stringify(createProfileData.data)
            }
        </div>
    )
}

export default Login