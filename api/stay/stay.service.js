const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')
const asyncLocalStorage = require('../../services/als.service')

// query()
// async function query(filterBy = {}) {
//     try {
//         const criteria = _buildCriteria(filterBy)
//         const collection = await dbService.getCollection('stay')
//         // console.log(collection)

//         const stays = await collection.find(criteria).toArray()

//         return stays
//     } catch (err) {
//         logger.error('cannot find stays', err)
//         console.log('cannot find stays', err)
//         throw err
//     }

// }

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = await collection.findOne({
            '_id': ObjectId(stayId)
        })
        return stay;
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const {
            userId,
            isAdmin
        } = store
        const collection = await dbService.getCollection('stay')
        // remove only if user is owner/admin
        const query = {
            _id: ObjectId(stayId)
        }
        if (!isAdmin) query.byUserId = ObjectId(userId)
        await collection.deleteOne(query)
        // return await collection.deleteOne({ _id: ObjectId(stayId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}


async function add(stay) {
    try {
        // peek only updatable fields!
        // const stayToAdd = {
        //     // byUserId: ObjectId(stay.byUserId),
        //     // aboutUserId: ObjectId(stay.aboutUserId),
        //     // txt: stay.txt
        // }
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        // await collection.insertOne(stayToAdd)
        return stay;
        // return stayToAdd;
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    const txtCriteria = { $regex: filterBy.searchTxt, $options: 'i' }
    if (filterBy.searchTxt && filterBy.searchTxt !== '') {
        criteria.city = txtCriteria
    }
    if (filterBy.type && filterBy.type !== 'all') {
        criteria.type = filterBy.type
    }
    return criteria
}


async function query(filterBy = {
    searchTxt: '',
    price: 'all',
    type: 'all',
    sortBy: 'all'
}) {
    const criteria = _buildCriteria({
        ...filterBy
    })
    try {
        const collection = await dbService.getCollection('stay')
        var stays
        if (filterBy.sortBy) {
            switch (filterBy.sortBy) {
                case 'price':
                    stays = await collection.find(criteria).sort({
                        'price': 1
                    }).toArray()
                    break;
                case 'name':
                    stays = await collection.find(criteria).sort({
                        'name': 1
                    }).toArray()
                    break;
                case 'all':
                    stays = await collection.find(criteria).toArray()
                    break;
                default:
                    break;
            }
        }
        stays = stays.map(stays => {
            stays.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            // stays.createdAt = ObjectId(stays._id).getTimestamp()
            // Returning fake fresh data
            return stays
        })
        return stays
    } catch (err) {
        // logger.error('cannot find stays', err)
        throw err
    }
}
module.exports = {
    query,
    getById,
    remove,
    add
}