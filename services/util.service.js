import fs from "fs"
import fr from "follow-redirects"

const { http, https } = fr

export const utilService = {
    readJsonFile,
    download,
    httpGet,
    makeId,
    makeLorem,
    getRandomIntInclusive,
    randomPastTime,
    debounce,
    saveToStorage,
    loadFromStorage,
    prettyJSON,
}

function readJsonFile(path) {
    const str = fs.readFileSync(path, "utf8")
    const json = JSON.parse(str)
    return json
}

function download(url, fileName) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(fileName)
        const protocol = url.startsWith("https") ? https : http

        protocol.get(url, (content) => {
            content.pipe(file)
            file.on("error", reject)
            file.on("finish", () => {
                file.close()
                resolve()
            })
        })
    })
}

function httpGet(url) {
    const protocol = url.startsWith("https") ? https : http
    const options = {
        method: "GET",
    }

    return new Promise((resolve, reject) => {
        const req = protocol.request(url, options, (res) => {
            let data = ""
            res.on("data", (chunk) => {
                data += chunk
            })
            res.on("end", () => {
                resolve(data)
            })
        })
        req.on("error", (err) => {
            reject(err)
        })
        req.end()
    })
}

function makeId(length = 5) {
    let text = ""
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

function makeLorem(size = 100) {
    var words = [
        "The sky",
        "above",
        "the port",
        "was",
        "the color of television",
        "tuned",
        "to",
        "a dead channel",
        ".",
        "All",
        "this happened",
        "more or less",
        ".",
        "I",
        "had",
        "the story",
        "bit by bit",
        "from various people",
        "and",
        "as generally",
        "happens",
        "in such cases",
        "each time",
        "it",
        "was",
        "a different story",
        ".",
        "It",
        "was",
        "a pleasure",
        "to",
        "burn",
    ]
    var txt = ""
    while (size > 0) {
        size--
        txt += words[Math.floor(Math.random() * words.length)] + " "
    }
    return txt
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}

function randomPastTime() {
    const HOUR = 1000 * 60 * 60
    const DAY = 1000 * 60 * 60 * 24
    const WEEK = 1000 * 60 * 60 * 24 * 7

    const pastTime = getRandomIntInclusive(HOUR, WEEK)
    return Date.now() - pastTime
}

function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeout)
    }
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : undefined
}

function prettyJSON(obj) {
    function _replacer(match, pIndent, pKey, pVal, pEnd) {
        var key = "<span class=json-key>"
        var val = "<span class=json-value>"
        var str = "<span class=json-string>"
        var r = pIndent || ""
        if (pKey) r = r + key + pKey.replace(/[": ]/g, "") + "</span>: "
        if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + "</span>"
        return r + (pEnd || "")
    }

    const jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm
    return JSON.stringify(obj, null, 3)
        .replace(/&/g, "&amp;")
        .replace(/\\"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(jsonLine, _replacer)
}
