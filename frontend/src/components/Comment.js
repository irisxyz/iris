import CommentIcon from "../assets/Comment";

function Comment({ publicationId, stats }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px'}}>
            <CommentIcon />
            <p>{ stats.totalAmountOfComments }</p>
        </div>
    );
}

export default Comment;
