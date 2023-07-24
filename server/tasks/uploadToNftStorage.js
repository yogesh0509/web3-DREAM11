const {task} = require("hardhat/config")
const { NFTStorage, File } = require("nft.storage")
const mime = require("mime")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY

async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type })
}

task("upload-file", "uploads the file to nft.storage")
.addParam("imagespath", "path of the image folder")
.setAction(async (taskArgs) => {

    let imagesPath = taskArgs.imagespath
    const fullImagesPath = path.resolve(imagesPath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    for (fileIndex in files) {
        const image = await fileFromPath(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
        const playerName = files[fileIndex].replace(".png", "");
        const response = await nftstorage.store({
          "name": playerName,
          "description": `This nft is used by the marketplace contract to fetch a player's data`,
          "image": image,
          "attributes": [
            { "trait_type": "country", "value": "ENG" },
            { "trait_type": "role", "value": "batsman" },
            { "trait_type": "id", "value": 8019 }
        ],
        });
        responses.push(response);
        console.log(response)
    }
});
