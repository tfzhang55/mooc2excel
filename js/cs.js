function sheet2blob(sheet, sheetName) {// 将一个sheet转成最终的excel文件的blob对象，
                                       //然后利用URL.createObjectURL下载
    sheetName = sheetName || 'sheet1';
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    //SheetNames里面保存了所有的sheet名字
    //Sheets则保存了每个sheet的具体内容（我们称之为Sheet Object)
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'//BinaryString格式(byte n is data.charCodeAt(n))
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    // 字符串转ArrayBuffer
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    return blob;
}

function openDownloadDialog(url, saveName) {
/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
    if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if (window.MouseEvent) event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}
function exportSpecialExcel(aoa) {//将二维数组导入Excel表格
    /*
    var aoa = [
        ['题目：', '正确答案', '题目答案描述'], // 特别注意合并的地方后面预留2个null
        ['张三', '男', 18],
        ['李四', '女', 22]
    ];
    */
   //aoa_to_sheet()这个工具类最强大也最实用了，将一个二维数组转成sheet，会自动处理number、string、boolean、date等类型数据；
    var sheet = XLSX.utils.aoa_to_sheet(aoa);//调用方法将二维数组转换为一个sheet
    var title = document.querySelector(".CyTop .cur").innerText;//获得该题库的标题，作为导出Excel表格的文件名
    /*
    sheet['!merges'] = [
        // 设置A1-C1的单元格合并
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];
    */
    openDownloadDialog(sheet2blob(sheet), title + '.xlsx');//标题+后缀作为导出Excel表格的文件名
}
function getAnswerDesc(answer) {
    //该函数的作用是把对应答案的文本（例如“ABD”）转换为对应的字符串索引序列（例如“013”）
    //方便后面根据答案的文本（例如“ABD”）匹配到上方的选项所对应的内容
    let ret = [];
    if (answer.indexOf('A') != -1) {//匹配到'A'
        ret.push(0)//将对应的序号压入字符串数组中
    }
    if (answer.indexOf('B') != -1) {//匹配到'B'
        ret.push(1)//将对应的序号压入字符串数组中
    }
    if (answer.indexOf('C') != -1) {//匹配到'C'
        ret.push(2)//将对应的序号压入字符串数组中
    }
    if (answer.indexOf('D') != -1) {//匹配到'D'
        ret.push(3)//将对应的序号压入字符串数组中
    }
    if (answer.indexOf('E') != -1) {//匹配到'E'
        ret.push(4)//将对应的序号压入字符串数组中
    }
    if (answer.indexOf('F') != -1) {//匹配到'F'
        ret.push(5)//将对应的序号压入字符串数组中
    }
    if (answer.indexOf('G') != -1) {//匹配到'G'
        ret.push(6)//将对应的序号压入字符串数组中
    }
    return ret;//返回对应的字符串数组
}
let dataList = [//二维数组初始化量，即第一个元素数组
    ["标题", "正确答案", "答案描述"]
]
$(".TiMu").each((index, el) => {//获取里面的每个题目，相当于for，一次获取每一个符合TiMu的对象
    //console.log(e1)
    let title = el.querySelector(".Cy_TItle>div").innerText;//获取每个div里面的文本（即题目内容）
    //console.log(title)
    if ((el.querySelector(".Py_answer>span")) != null) {//不等于null表示类TiMu里面有Py_answer>span的类
        let answer = el.querySelector(".Py_answer>span").innerText;//获取正确答案里面的内容
        //console.log(answer)
        let answerDesc = "";//让答案描述的初始化字符串为空
        let answerDescArray = getAnswerDesc(answer);//执行函数，获得答案文本里面的字母序列，例如ACE就为"024"
        if (answerDescArray.length > 0) {//对应的数字索引序列的长度大于0表示该题为单选或者多选，否则为判断
            for (let i = 0; i < answerDescArray.length; i++) {//对应的数字索引序列一个一个的匹配上方的答案内容
                //获得相应数字索引对应的上方答案内容
                //例如：B对应的数字索引序列是"1",对应标签里面的第1个li的标签
                let t_answer = el.querySelectorAll(".Cy_ulTop>form>li")[answerDescArray[i]].innerText;
                answerDesc += t_answer + "    ";//将答案内容的描述加入answerDesc
            }
            //console.log(answerDesc);
            dataList.push([//将数组[title, answer, answerDesc]压入二维数组中
                title, answer, answerDesc
            ])
        }
        else {//answerDescArray.length <= 0表示找不到匹配到选择题ABCD。。。的文本，所以为判断题，执行以下代码
            if (el.querySelector(".Py_answer>span>i").innerText == "√") {//匹配到√
                answer = "√";//答案为"√"
                answerDesc = "对";//答案的描述为"对"
            }
            if (el.querySelector(".Py_answer>span>i").innerText == "×") {//匹配到错
                answer = "×";//答案为"×"
                answerDesc = "错";//答案的描述为"错"
            }
        }
        //console.log(answerDesc);
        dataList.push([//将数组[title, answer, answerDesc]压入二维数组中
            title, answer, answerDesc
        ])
    }
    else {//等于null表示类TiMu里面没有Py_answer>span的类说明不是单选题和判断题，则进行else代码
    }

})
exportSpecialExcel(dataList)//执行函数exportSpecialExcel，将二维数组导出Excel表格