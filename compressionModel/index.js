const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const glbToGlb = gltfPipeline.processGlb;
let dirs = fsExtra.readdirSync('./originModels')
let count = 0 , total = dirs.length
dirs.map(dir => {
    fsExtra.readFile(`./originModels/${dir}`).then(glb => {
        glbToGlb(glb, {
            dracoOptions: {
                compressionLevel: 10,
                compressMeshes : true
            },
            stats : true
        }).then(({glb}) => {
            fsExtra.writeFile(`./targetModels/${dir}`, glb).then(() => {
                count++
                console.log(`模型压缩${count}/${total}`)
                if(count == total) {
                    console.log('模型压缩完成')
                }
            })
        })
    })
})