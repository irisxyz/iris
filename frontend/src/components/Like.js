import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { ADD_REACTION_MUTATION, REMOVE_REACTION_MUTATION } from '../utils/queries'
import Heart from '../assets/Heart'

function Like({ profileId, publicationId, liked, stats, setToastMsg }) {
    const [addReaction] = useMutation(ADD_REACTION_MUTATION, {
        onError(error) {
            setLiked(!stateLiked)
            setCount(count-1)
            console.warn(error)
        }
    })
    const [removeReaction] = useMutation(REMOVE_REACTION_MUTATION, {
        onError(error) {
            setLiked(!stateLiked)
            setCount(count+1)
            console.warn(error)
        }
    })
    const [stateLiked, setLiked] = useState(liked)
    const [count, setCount] = useState(stats.totalUpvotes)

    useEffect(() => {
        setCount(stats.totalUpvotes)
    }, [stats.totalUpvotes])
    
    const [apiError, setApiError] = useState('')

    const handleClick = async (e) => {
        setLiked(!stateLiked)

        e.stopPropagation()

        try {
            if (stateLiked) {
                setCount(count-1)
                await removeReaction({
                    variables: {
                        request: {
                            profileId: profileId,
                            reaction: 'UPVOTE',
                            publicationId: publicationId,
                        },
                    },
                });
            } else {
                setCount(count+1)
                await addReaction({
                    variables: {
                        request: {
                            profileId: profileId,
                            reaction: 'UPVOTE',
                            publicationId: publicationId,
                        },
                    },
                });
            }
        }
        catch (err) {
            alert(err)
            setApiError(apiError)
        }
    };
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            <Heart onClick={handleClick} filled={stateLiked} />
            <p>{ count }</p>
        </div>
    );
}

export default Like;
