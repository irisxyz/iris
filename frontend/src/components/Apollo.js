import React from 'react'
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { CHAIN } from '../utils/constants'

const httpLink = new HttpLink({
    uri: CHAIN === 'polygon' ? 'https://api.lens.dev/' : 'https://api-mumbai.lens.dev/',
    fetch,
});
  
const authLink = new ApolloLink((operation, forward) => {
    // const token = window.authToken;
    const token = window.sessionStorage.getItem('lensToken')
    // console.log('jwt token:', token);

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
        headers: {
        'x-access-token': token ? `Bearer ${token}` : '',
        },
    });

    // Call the next link in the middleware chain.
    return forward(operation);
});

// Reset state for unauthenticated users TODO: make this less sus, ie setProfile({}) instead of location.reload()
const errorLink = onError(({ operation, graphQLErrors, forward }) => {
  if (graphQLErrors && graphQLErrors[0].extensions.code === 'UNAUTHENTICATED') {
    window.sessionStorage.removeItem('lensToken')
    window.sessionStorage.removeItem('signature')
    // window.location.reload()
    console.log('User token expired or was not authenticated')
  }
  return
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, httpLink]), // authLink.concat(errorLink).concat(httpLink),
  cache: new InMemoryCache(),
});

function Apollo({ children }) {
    return <ApolloProvider client={client}>{ children }</ApolloProvider>
 }

export default Apollo