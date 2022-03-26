//import dotenv from 'dotenv';
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { VideoNFT } = require("@livepeer/video-nft/dist/index.cjs.js");
require("dotenv").config();
const PORT = 3001;

const sdk = new VideoNFT({
  auth: { apiKey: process.env.LIVEPEER_API_KEY },
  endpoint: "https://livepeer.com",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});

const app = express();
app.use(cors());

const upload = multer({ storage });

function printProgress(progress) {
  console.log(` - progress: ${100 * progress}%`);
}

async function maybeTranscode(sdk, asset) {
  const { possible, desiredProfile } = sdk.checkNftNormalize(asset);
  if (!possible || !desiredProfile) {
    if (!possible) {
      console.error(
        `Warning: Asset is larger than OpenSea file limit and can't be transcoded down since it's too large. ` +
          `It will still be stored in IPFS and referenced in the NFT metadata, so a proper application is still able to play it back. ` +
          `For more information check http://bit.ly/opensea-file-limit`
      );
    }
    return asset;
  }

  console.log(
    `File is too big for OpenSea 100MB limit (learn more at http://bit.ly/opensea-file-limit).`
  );

  console.log(
    `Transcoding asset to ${desiredProfile.name} at ${Math.round(
      desiredProfile.bitrate / 1024
    )} kbps bitrate`
  );
  return await sdk.nftNormalize(asset, printProgress);
}

app.post("/upload", upload.array("fileName"), async (req, res) => {
  console.log("Testing");
  console.log(req.files);
  const sdk = new VideoNFT({
    auth: { apiKey: process.env.LIVEPEER_API_KEY },
    endpoint: "https://livepeer.com",
  });

  let file = null;
  let asset;
  try {
    file = fs.createReadStream(req.files[0].path);
    console.log(file);
    console.log("Uploading file...");
    asset = await sdk.createAsset(req.files[0].path, file, printProgress);
  } finally {
    file?.close();
  }

  asset = await maybeTranscode(sdk, asset);

  console.log("Starting export...");
  let ipfs = await sdk.exportToIPFS(
    asset.id ?? "",
    JSON.parse(
      JSON.stringify({
        name: req.files[0].filename,
        description: `Livepeer video from asset ${JSON.stringify(
          req.files[0].filename
        )}`,
        image: `ipfs://bafkreidmlgpjoxgvefhid2xjyqjnpmjjmq47yyrcm6ifvoovclty7sm4wm`,
        properties: {},
      })
    ),
    printProgress
  );
  console.log(`Export successful! Result: \n${JSON.stringify(ipfs, null, 2)}`);

  console.log(
    `Mint your NFT at:\n` +
      `https://livepeer.com/mint-nft?tokenUri=${ipfs?.nftMetadataUrl}`
  );
  return res.send({ status: "OK", data: ipfs?.nftMetadataUrl, ...ipfs });
});

app.listen(PORT, () => {
  console.log(`gm! localhost:${PORT}`);
});
