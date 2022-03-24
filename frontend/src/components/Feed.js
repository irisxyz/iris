import React, { useState, useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_TIMELINE, SEARCH } from '../utils/queries'
import Card from '../components/Card'
import Post from '../components/Post'

function Feed({ profile = {} }) {
    const [notFound, setNotFound] = useState(false)
    const [publications, setPublications] = useState([])
    const { loading, error, data } = useQuery(GET_TIMELINE, {
      variables: {
        request: {
          profileId: profile.id,
        }
      }
    })

    useEffect(() => {
      if (!data) return;

      if (data.timeline.items.length < 1) {
        setNotFound(true)
        return
      }
      
      setPublications(data.timeline.items)
    
    }, [data])

    const searchData = useQuery(SEARCH, {
        variables: {
          request: {
            query: 'LFG',
            type: 'PUBLICATION',
          }
        }
      })

    useEffect(() => {
    if (!searchData.data) return;
    console.log('hi')
    if (publications.length > 0) return;

    console.log('hi')

    if (searchData.data.search.items.length < 1) {
        return
    }
    
    setPublications(searchData.data.search.items)
    
    }, [searchData.data])

    
    if (notFound) {
      return <>
        <h2>Feed</h2>
        <h3>No posts, go follow some profiles!</h3>
      </>
    }

    return (
      <>
        <main>
          <h2>Feed</h2>
          {
            publications.map((post) => {
              return <Post key={post.id} post={post} />
            })
          }
        </main>
      </>
    );
  }

export default Feed