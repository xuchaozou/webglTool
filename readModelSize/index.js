const fs = require('fs')
let arguments = process.argv.splice(2)
let ext = arguments[0] ?? 'glb', totalSize = 0, json = 'json'

readModelDir().then(files => {
    let modelFileNames = getModelFileNames(files)
    return new Promise((resolve, reject) => {
        readFileStat(modelFileNames).then(() => {
            resolve(files)
        })
    })
}).then((files) => {
    return readFileInfo(getJsonFileName(files))
}).then(({data, file}) => {
    data.totalSize = totalSize
    data.totalSizeMB = sizeToMb(totalSize)
    return {data, file}
}).then(({data, file}) => {
    data = JSON.stringify(data, null , '\t')
    return saveFile(file, data)
}).then(res => {
    console.log(`'文件总大小 ： ${totalSize}\t MB: ${sizeToMb(totalSize)}`)
}).catch(error => {
    console.log(error)
})

function readModelDir () {
    return new Promise((resolve, reject) => {
        fs.readdir('./models', {}, (error, files) => {
            if(error) return reject(error)
            resolve(files)
        })
    })
}

function getModelFileNames (files) {
    return files.filter(file => file.split('.').slice(-1)[0] == ext)
}

function readFileStat (files) {
    let count = 0, length = files.length
    return new Promise((resolve, reject) => {
        files.map(file => {
            fs.stat(`./models/${file}`, (error, data) => {
                if(error) return reject(error)
                totalSize += data.size
                count++
                if(count == length) resolve(totalSize)
            })
        })
    })
}

function readFileInfo (file) {
    return new Promise((resolve , reject) => {
        fs.readFile(`./models/${file}`, (error, data) => {
            if(error){
                return reject(`没有发现json文件，无法注入\t文件总大小:${totalSize} MB : ${sizeToMb(totalSize)}`)
            }
            return resolve({
                file,
                data : JSON.parse(data.toString())
            })
        })
    })
}

function getJsonFileName (files) {
    return files.find(file => file.split('.').slice(-1)[0] == json)
}

function sizeToMb (size) {
    return Number((size / 1024 / 1024).toFixed(2))
}

function saveFile (file, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./models/${file}`, data, {flag : 'w'},(error) => {
            if(error) return reject(error)
            return resolve()
        })
    })
}