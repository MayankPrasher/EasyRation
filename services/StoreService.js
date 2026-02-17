const Store = require('../models/store')

exports.getStoreDetails = async (fpsId)=>{
    const store = await Store.findOne({
        fps_id:fpsId})
    if(!store) throw new Error("Store not found")
        return store
};

exports.updateStock = async (fpsId, commodityName, newRate, newStock)=>{
    const filter = {fps_id: fpsId, "commodities.item": commodityName}

    const update = {
        $set:{
            "commodities.$.stock":newStock,
            "commodities.$.rate": newRate
        }
    }
    return await Store.updateOne(filter, update);
}