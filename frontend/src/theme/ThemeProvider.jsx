import React from 'react'
import { ThemeProvider } from 'styled-components'

const theme = {
    primary: '#FF835B',
    primaryHover: '#FF9C7D',
    border: '#F28A56 2px solid',
    background: '#EFEFEF',
    text: '#232323',
    textLight: '#fff',
    greyed: '#747c90',
    error: '#FF3236',
    darken: '#fffaf8',
    darken2: '#FFF3EE',
    font: `'General Sans', sans-serif`,
    hrefUnderline: `
    display: inline-block;
    &:after {
        content: '';
        display: block;
        margin: auto;
        height: 2px;
        width: 0px;
        background: transparent;
        transition: width 150ms ease, background-color 150ms ease;
    }
    &:hover:after {
        width: 100%;
        background: #FF9C7D;
    }
    `,
}


export default ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>