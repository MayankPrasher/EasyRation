const Admin = require('../models/central')
const Store = require('../models/store')

exports.getRationDetails = async (aadhar)=>{
    const citizen = await Admin.findOne({'aadhar.aadhar_Id' : aadhar})

    if(!citizen){
        throw new Error("Citizen not found in Central Database")
    }
    const storeId = citizen.store.fps_id
    const store = await Store.findOne({fps_id:storeId})

    if(!store){
        throw new Error("Assigned Ration Shop not found")
    }

    return{
        ration_card_id:citizen.ration_details.user_Id,
        aadhar_name:citizen.aadhar.name,
        aadhar_address:citizen.aadhar.address,
        card_type:citizen.ration_details.card_type,
        members:citizen.ration_details.members,
        members_qty:citizen.ration_details.member_quantity,
        store_id:storeId,
        store_name:store.store_name,
        store_fso:store.FSO_area
    }

}