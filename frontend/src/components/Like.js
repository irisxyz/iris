import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { ADD_REACTION_MUTATION, REMOVE_REACTION_MUTATION } from '../utils/queries'
import Heart from '../assets/Heart'

function Collect({ wallet, lensHub, profileId, publicationId, liked, stats, setToastMsg }) {
    const [addReaction, addReactionData] = useMutation(ADD_REACTION_MUTATION, {
        onError(error) {
            setLiked(!liked)
            console.warn(error)
        }
    })
    const [removeReaction, removeReactionData] = useMutation(REMOVE_REACTION_MUTATION, {
        onError(error) {
            setLiked(!liked)
            console.warn(error)
        }
    })
    const [stateLiked, setLiked] = useState(liked)
    
    const [apiError, setApiError] = useState('')

    const handleClick = async (e) => {
        setLiked(!liked)

        e.stopPropagation()
        const reactionReq = {
            profileId: profileId,
            reaction: 'UPVOTE',
            publicationId: publicationId,
        };
        try {
            await addReaction({
                variables: {
                    request: reactionReq,
                },
            });
        }
        catch (err) {
            alert(err)
            setApiError(apiError)
        }
    };
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            <Heart onClick={handleClick} filled={stateLiked} />
            <p>{ stats.totalUpvotes }</p>
        </div>
    );
}

export default Collect;
