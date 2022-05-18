import React from 'react'
import { ThemeProvider } from 'styled-components'

const theme = {
    primary: '#F28A56',
    primaryHover: '#FF9C7D',
    border: '#F28A56 2px solid',
    background: 'linear-gradient(90deg, #F4E1E4 12.82%, #FFE6DC 91.48%)',
    text: '#232323',
    textLight: '#fff',
    font: `'General Sans', sans-serif`,
}


export default ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>