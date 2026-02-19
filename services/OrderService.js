const Order = require('../models/order')
const Store = require('../models/store')
const User = require('../models/user')

exports.getPendingOrders = async (fpsId) =>{
    return await Order.find({
        store_id:fpsId,
        completed:false
    })
}

exports.getCompletedOrders = async (fpsId)=>{
    return await Order.find({
      store_id:fpsId, completed: true        
    })
}

exports.completeTransactions = async (orderId)=>{

    const order = await Order.findById(orderId)

    if(!order) throw new Error("Order not found")
    if(order.completed) throw new Error("Order already completed")
    
    const {store_id, commodities, unit, aadhar} = order;

    for(let i = 0; i<commodities.length; i++){
        const item = commodities[i]
        const qtyToDeduct = Number(unit[i])

        await Store.updateOne(
            {
                fps_id:store_id,
                "commodities.commodity":item.commodity,
            },
            {
                $inc: {"commodities.$.stock": -qtyToDeduct}
            }
        )
    }
  
    await User.updateOne(
        {aadhar:aadhar},
        {$set:{monthlyQuota:true}}
    )

    order.completed = true;
    await order.save();

    return order;
}