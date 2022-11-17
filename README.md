# iris

lens protocol social media implementation

## Getting Started

You will need Metamask installed on Google Chrome, connected to Polygon Mumbai network

`npm install` to install all dependencies

## Frontend

`cd frontend`

`npm install` install deps

`npm start` run react app at http://localhost:3000/

### Gasless

On localhost you must run app on port 4783 to enable gasless tx with Lens API

`/frontend/.env` add `PORT=4783`

### Changing Chain

Default chain on localhost is `mumbai`. If you want to change it change `/frontend/.env` to `VITE_CHAIN="polygon"`


Remember all `.env` changes require an `npm start` restart.

## Deploying

Testnet
- change `.env` to `VITE_CHAIN="mumbai"`
- `npm run build`
- `firebase deploy --only hosting:testnet`

Prod
- change `.env` to `VITE_CHAIN="polygon"` or remove `VITE_CHAIN`
- `npm run build`
- `firebase deploy --only hosting:prod`