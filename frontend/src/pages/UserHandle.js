import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_PROFILES, GET_PUBLICATIONS } from '../utils/queries'
import Follow from "../components/Follow"
import Card from "../components/Card"

function User({ wallet, lensHub }) {
    let params = useParams();
    const [notFound, setNotFound] = useState(false)
    const [publications, setPublications] = useState([])
    const { loading, error, data } = useQuery(GET_PROFILES, {
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

      console.log(publicationsData.data.publications.items)
      setPublications(publicationsData.data.publications.items)

    }, [publicationsData.data])

    if (notFound) {
      return <>
        <h2>No user with handle {params.handle}!</h2>
      </>
    }

    return (
      <>
        <main>
          <h2>@{params.handle}</h2>
          <Follow wallet={wallet} lensHub={lensHub}/>

          {
            publications.map((post) => {
              return <Card key={post.id}>
                <h3>{post.metadata.name}</h3>
                {post.metadata.description}
                </Card>
            })
          }
        </main>
      </>
    );
  }

export default User