// function putUpdateImage(req, res, next) {
module.exports = class Member {
  putUpdateImage(req, res, next) {
    const form = new formidable.IncomingForm()

    const token = req.headers['token']
    //確定token是否有輸入
    if (check.checkNull(token) === true) {
      res.json({
        err: '請輸入token',
      })
    } else if (check.checkNull(token) === false) {
      verify(token).then((tokenResult) => {
        if (tokenResult === false) {
          res.json({
            result: {
              status: 'token錯誤。',
              err: '請重新登入。',
            },
          })
        } else {
          form.parse(req, async function (err, fields, files) {
            // 確認檔案大小是否小於1MB
            if (check.checkFileSize(files.file.size) === true) {
              res.json({
                result: {
                  status: '上傳檔案失敗。',
                  err: '請上傳小於1MB的檔案',
                },
              })
              return
            }

            // 確認檔案型態是否為png, jpg, jpeg
            if (check.checkFileType(files.file.type) === true) {
              // 將圖片轉成base64編碼
              const image = await fileToBase64(files.file.path)

              const id = tokenResult

              // 進行加密
              const password = encryption(fields.password)
              const memberUpdateData = {
                img: image,
                name: fields.name,
                password: password,
                update_date: onTime(),
              }

              updateAction(id, memberUpdateData).then(
                (result) => {
                  res.json({
                    result: result,
                  })
                },
                (err) => {
                  res.json({
                    result: err,
                  })
                }
              )
            } else {
              res.json({
                result: {
                  status: '上傳檔案失敗。',
                  err: '請選擇正確的檔案格式。ex:png, jpg, jpeg等。',
                },
              })
              return
            }
          })
        }
      })
    }
  }
}
