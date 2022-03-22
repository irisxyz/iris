import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  body {
    font-family: 'General Sans', sans-serif;
    background: ${p => p.theme.background};
    color: ${p => p.theme.text};
  }
  h1, h2, h3, h4 {
    font-weight: 600;
  }
`