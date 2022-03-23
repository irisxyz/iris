import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'
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

const Stats = styled.div`
  display: flex;
  justify-content: space-evenly;
`

function Profile({ profile, authToken }) {
  console.log(profile.stats)
  return (
    <Card>
        <Link to={`user/${profile.handle}`}>
            <Icon/>
        </Link>
        <Handle>@{profile.handle}</Handle>
        <Stats>
            <p>{profile.stats?.totalFollowers} followers</p>
            <p>{profile.stats?.totalFollowing} following</p>
        </Stats>
    </Card>
  );
}

export default Profile