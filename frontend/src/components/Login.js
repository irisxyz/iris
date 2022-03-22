import { useState, useEffect } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { ZERO_ADDRESS } from '../utils/constants'
import Button from './Button'

export const prettyJSON = (message, obj) => {
    console.log(message, JSON.stringify(obj, null, 2));
  };

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

function Login({ wallet, contract }) {
    const [getChallenge, challengeData] = useLazyQuery(GET_CHALLENGE);
    const [mutateAuth, authData] = useMutation(AUTHENTICATION);
    const [createProfile, createProfileData] = useMutation(CREATE_PROFILE);

    const [authToken, setAuthToken] = useState()

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

      window.authToken = authData.data.authenticate.accessToken
      setAuthToken(true)

    }, [authData.data])

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