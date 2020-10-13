chrome.browserAction.onClicked.addListener( function(el) {//监听事件：当点击右上角图片时，开始执行这个函数
    chrome.tabs.executeScript(el.id,{
        file:"js/jquery.min.js"//引入jquery.min.js库
    })
    chrome.tabs.executeScript(el.id,{
        file:"js/xlsx.core.min.js"//xlsx.core.min.js库
    })
    chrome.tabs.executeScript(el.id,{
        file:"js/cs.js"//在页面里面注入cs.js文件
    })
})