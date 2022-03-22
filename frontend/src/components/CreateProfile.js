function CreateProfile() {

    const handleClick = () => {
        console.log('clicked')
    }

    return (
        <div>
            <button onClick={handleClick}>Create profile</button>
        </div>
    )
}

export default CreateProfile