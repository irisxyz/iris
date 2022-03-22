import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useLazyQuery, useMutation } from '@apollo/client'
import Card from './Card'
import avatar from '../assets/avatar.png'

const Icon = styled.div`
  height: 75px;
  width: 75px;
  border: #E2E4E8 1px solid;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${avatar});
  background-size: cover;
  margin: auto;
`

const Handle = styled.h2`
  text-align: center;
`

function Profile({ profile, authToken }) {
  console.log(profile.stats)
  return (
    <Card>
        <Icon/>
        <Handle>@{profile.handle}</Handle>
    </Card>
  );
}

export default Profile