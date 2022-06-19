import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Check from '../assets/Check'
import Spinner from '../assets/Spinner'

const ToastDiv = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: #fff;
    position: fixed;
    z-index: 10000;
    bottom: ${p => (p.shown ? '40px' : '-100px')};
    opacity: ${p => (p.shown ? '100%' : '0%')};
    transition: all 0.75s ease;
    margin-left: auto;
    margin-right: auto;
    padding: 0.25em 1em 0.25em 0.5em;
    right: 3em;
    border-radius: 6px;
    word-break: break-word;
    ${p => p.type === 'success' && `border-left: #4DD06A 4px solid;`}
    ${p => p.type === 'loading' && `border-left: ${p.theme.primary} 4px solid;`}
    box-shadow: 0px 2px 9px rgba(236, 176, 178, 0.6);
`
const ToastText = styled.p`
    text-align: center;
    color: ${p => p.theme.toastText};
`

export default function Toast({ children, type = 'error' }) {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (children) {
      setShowToast(true)
    } else {
      setShowToast(false)
    }

    if (type !== 'loading') {
        const toastTimeout = setTimeout(() => {
          setShowToast(false)
        }, 4000)
        return () => {
          clearTimeout(toastTimeout)
        }
    }
  }, [children])

  return (
    <ToastDiv shown={showToast} type={type}>
        {type === 'success' && <Check/>}
        {type === 'loading' && <Spinner/>}
        <ToastText>{children}</ToastText>
    </ToastDiv>
  )
}