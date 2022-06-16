export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const CHAIN = () => {
    // so you can override localhost
    if (process.env.REACT_APP_CHAIN) {
        return process.env.REACT_APP_CHAIN
    } else {
        switch(process.env.NODE_ENV) {
            case 'development':
                return 'mumbai';
            case 'production':
                return 'polygon';
            default:
                return 'mumbai';
        } 
    }
}