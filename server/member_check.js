//判斷檔案大小
function checkFileSize(fileSize) {
        var maxSize = 1 * 1024 * 1024; //1MB
        if (fileSize > maxSize) {
            return true;
        }
        return false;
    }
    //判斷型態是否符合jpg, jpeg, png
    function checkFileType(fileType) {
        if (fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/jpeg') {
            return true;
        }
        return false;
    }

//    const checkFileType = (fileType) => {
//         if (fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/jpeg') {
//             return true;
//         }
//         return false;
//     }