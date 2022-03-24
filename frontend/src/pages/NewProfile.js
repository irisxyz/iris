import React, { useState, createRef } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
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
`

const Handle = styled.input`
  border: none;
  font-size: 2em;
  outline: none;
  font-family: ${p => p.theme.font};
  font-weight: 600;
`

const Bio = styled.textarea`
  margin: auto;
  border: none;
  font-size: 1em;
  outline: none;
  width: 270px;
  font-family: ${p => p.theme.font};
  resize: none; /*remove the resize handle on the bottom right*/
  border: #E2E4E8 1px solid;
  border-radius: 6px;
  margin-top: 1em;
`


const Stats = styled.div`
  display: flex;
  justify-content: space-evenly;
`

const StyledCard = styled(Card)`
`

function NewProfile({ profile = {} }) {
    const [newProfile, setNewProfile] = useState({...profile})
    const handleRef = createRef()
    const bioRef = createRef()

    const handleHandle = (e) => {
        if (e.target.value[0] !== '@')
        {
            e.target.value = '@' + e.target.value
        }
        if (e.target.value.length === 1) {
            e.target.value = ''
        }
    }


    return (
        <StyledCard>
            <Link to={`user/${profile.handle}`}>
                <Icon/>
            </Link>
            <Handle ref={handleRef} onChange={handleHandle} placeholder={'@handle'}/>
            <Bio ref={bioRef} placeholder={'bio'}/>
            {/* <Stats>
                <p>{profile.stats?.totalFollowers} followers</p>
                <p>{profile.stats?.totalFollowing} following</p>
            </Stats> */}
        </StyledCard>
    );
}

export default NewProfile