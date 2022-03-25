import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_PROFILES, GET_PUBLICATIONS } from '../utils/queries'
import Follow from "../components/Follow"
import Post from "../components/Post"
import Card from "../components/Card"
import avatar from '../assets/avatar.png'
import rainbow from '../assets/rainbow.png'

const Icon = styled.div`
  height: 100px;
  width: 100px;
  border: #fff 4px solid;
  border-radius: 100px;
  &:hover {
    cursor: pointer;
  }
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${avatar});
  background-size: cover;
  margin-bottom: -0.8em;
`

const StyledCard = styled(Card)`
  padding: 0;
  margin-bottom: 2em;
`

const CardContent = styled.div`
  margin-top: -6em;
  padding: 2em;
`

const Cover = styled.div`
  width: 100%;
  height: 200px;
  background: url(${rainbow});
  background-size: cover;
  border-radius: 16px 15px 0 0 ;
`

const Stats = styled.div`
  width: 400px;
  display: flex;
  justify-content: space-between;
`

const Columns = styled.div`
  display: flex;
  justify-content: space-between;
`

const Handle = styled.h1`
  display: inline-block;
`

const Address = styled.code`
  box-shadow: 0px 2px 7px rgba(112, 58, 202, 0.2);
  border-radius: 100px;
  padding: 0.6em;
  background: white;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1em;
`

function User({ wallet, lensHub }) {
    let params = useParams();
    const [notFound, setNotFound] = useState(false)
    const [publications, setPublications] = useState([])
    const [profile, setProfile] = useState('')
    const { data } = useQuery(GET_PROFILES, {
      variables: {
        request: {
          handles: [params.handle],
          limit: 1
        }
      }
    })
    
    const [getPublications, publicationsData] = useLazyQuery(GET_PUBLICATIONS)

    useEffect(() => {
      if (!data) return;

      if (data.profiles.items.length < 1) {
        setNotFound(true)
        return
      }
      
      const ownedBy = data.profiles.items[0].ownedBy
      setProfile({
        ...data.profiles.items[0],
        address: `${ownedBy.substring(0, 6)}...${ownedBy.substring(37, ownedBy.length-1)}`,
      })

      getPublications({
        variables: {
          request: {
            profileId: data.profiles.items[0].id,
            publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          }
        }
      })
    
    }, [data, getPublications])
    
    useEffect(() => {
      if (!publicationsData.data) return;

      setPublications(publicationsData.data.publications.items)

    }, [publicationsData.data])

    if (notFound) {
      return <>
        <h2>No user with handle {params.handle}!</h2>
      </>
    }
    console.log(profile)
    return (
      <>
        <StyledCard>
          <Cover />
        <CardContent>
          <Icon/>
          <Columns>
          <div>            
            <UserInfo>
              <Handle>@{params.handle}</Handle>
              <Address>
                {profile?.address}
              </Address>
            </UserInfo>
            <Stats>
                <p>{profile.stats?.totalFollowers} followers</p>
                <p>{profile.stats?.totalFollowing} following</p>
                <p>{profile.stats?.totalPosts} posts</p>
                <p>{profile.stats?.totalCollects} collects</p>
            </Stats>
          </div>
          <div>
            <Follow wallet={wallet} lensHub={lensHub} profileId={profile.id}/>
          </div>
          </Columns>
        </CardContent>
        </StyledCard>

        {
          publications.map((post) => {
            return <Post key={post.id} post={post} />
          })
        }
      </>
    );
  }

export default User