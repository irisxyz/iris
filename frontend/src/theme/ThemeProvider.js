import React from 'react'
import { ThemeProvider } from 'styled-components'

const theme = {
    primary: '#8247E5',
    background: '#232323',
    text: '#fff',
}


export default ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>