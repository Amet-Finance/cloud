import axios from "axios";

const JWT = process.env.PINATA_JWT


type UploadFile = {
    name: string,
    pinataContent: { [key: string]: any }
}

async function uploadFile({name, pinataContent}: UploadFile) {


    const pinataMetadata = {
        name,
        // "keyvalues": {
        //     "name": "name2"
        // },
    }

    const pinataOptions = {
        cidVersion: 2,
    }

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                pinataContent,
                pinataMetadata,
                pinataOptions
            },
            {
                headers: {
                    'Content-Type': `application/json`,
                    'Authorization': `Bearer ${JWT}`,
                    "Accept": "application/json"
                }
            });
        return res.data;
    } catch (error) {
        console.log(error);
    }
}

export {
    uploadFile
}
