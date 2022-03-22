import React from 'react'
import { ThemeProvider } from 'styled-components'

const theme = {
    primary: '#8247E5',
    primaryHover: '#A673EF',
    border: '#8247E5 2px solid',
    background: '#fff',
    text: '#232323',
    textLight: '#fff',
    font: `'General Sans', sans-serif`,
}


export default ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>