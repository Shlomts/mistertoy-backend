import fs from "fs"
import { utilService } from "./util.service.js"
import { loggerService } from "./logger.service.js"

export const toyService = {
    query,
    getById,
    remove,
    save,
}

const PAGE_SIZE = 5
const toys = utilService.readJsonFile("data/toy.json")

function query(filterBy) {
    console.log("filterBy", filterBy)

    const regex = new RegExp(filterBy.txt, "i")
    var toysToReturn = toys.filter((toy) => regex.test(toy.name))

    if (filterBy.maxPrice) {
        toysToReturn = toysToReturn.filter(
            (toy) => toy.price <= filterBy.maxPrice
        )
    }

    if (filterBy.inStock) {
        if (filterBy.inStock === "true") {
            toysToReturn = toysToReturn.filter((toy) => toy.inStock === true)
        } else if (filterBy.inStock === "false") {
            toysToReturn = toysToReturn.filter((toy) => toy.inStock === false)
        } else toysToReturn
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        toysToReturn = toys.filter((toy) => {
            return Array.isArray(toy.labels) &&
                toy.labels.some((label) => filterBy.labels.includes(label))
        })
    }

    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        toysToReturn = toysToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }
    return Promise.resolve(toysToReturn)
}

function getById(toyId) {
    const toy = toys.find((toy) => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex((toy) => toy._id === toyId)
    if (idx === -1) return Promise.reject("No Such Toy")

    const toy = toys[idx]
    if (!loggedinUser.isAdmin && toy.owner._id !== loggedinUser._id) {
        return Promise.reject("Not your toy")
    }
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy, loggedinUser) {
    console.log(toy)
    if (toy._id) {
        const toyToUpdate = toys.find((currToy) => currToy._id === toy._id)
        if (
            !loggedinUser.isAdmin &&
            toyToUpdate.owner._id !== loggedinUser._id
        ) {
            return Promise.reject("Not your toy")
        }
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.labels = toy.labels
        toyToUpdate.inStock = toy.inStock
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.owner = loggedinUser
        toys.push(toy)
    }
    delete toy.owner.score
    return _saveToysToFile().then(() => toy)
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile("data/toy.json", data, (err) => {
            if (err) {
                loggerService.error("Cannot write to toys file", err)
                return reject(err)
            }
            resolve()
        })
    })
}
