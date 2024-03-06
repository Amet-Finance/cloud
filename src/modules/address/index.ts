import connection from "../../db/main";

async function getIssuerScore(address: string) {
    const issuerInfo = await connection.address.findOne({_id: address.toLowerCase() as any})
    return issuerInfo?.score || 0;
}

export {
    getIssuerScore
}
