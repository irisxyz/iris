import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  body {
    margin: 0;
    font-family: ${p => p.theme.font};
    background: ${p => p.theme.background};
    color: ${p => p.theme.text};
    letter-spacing: 0.02em;
  }
  h1, h2, h3, h4 {
    font-weight: 600;
  }
`