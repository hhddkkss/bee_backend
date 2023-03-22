//multer 處理文件上傳到伺服器
const multer = require('multer')

const { v4: uuidv4 } = require('uuid')
//解構拿取:重新命名

const extmap = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
}

//過濾檔案的規則
const fileFilter = (req, file, cb) => {
  cb(null, !!extmap[file.mimetype])
}

//定義storage是存在upload資料夾中
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '/../public/articlePic')
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + extmap[file.mimetype])
  },
})

const articleUpload = multer({ fileFilter, storage })
module.exports = articleUpload
