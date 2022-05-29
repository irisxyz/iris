export function PublicationsReducer(state, action) {
    switch(action.type) {
        case "ADD":
            return {
                ...state,
                publications: [...action.payload]
            };
        default:
            return state
    }
}