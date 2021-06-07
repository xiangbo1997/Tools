
// 常用的工具函数

/**
 * settimeout 模拟 setInterval
 */
class ImitateInterval {
    timerId
    startWork(callBack, time) {
      callBack();
      const fn = () => {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
          callBack();
          fn();
        }, time)
      };
      fn();
    }
    endWork() {
      clearTimeout(this.timerId);
    }
}
/**
 * 
 * @param {*} sourceArray 原数组
 *  *一维数组转换成二维数组
 * [1,2,3,4,5,6,7,8]-> [[1,2],[3,4],[5,6],[7,8]];
 */
const OneToTwoArry = (sourceArray) =>{
  const targetArry = [];
  let transfer = [];
  sourceArray.forEach((ele,index)=>{
    transfer[index%2] = Number(ele);
    if(transfer.length === 2){
      targetArry.push(transfer);
      transfer= [];
    }
  })
 return targetArry;
}
 const autoPlay = (() => {
   const dom1 = document.getElementById('ifr').contentWindow.document.querySelector('.qrcodebox');
   setInterval(() => {
    if (dom1 && dom1.style.display === 'block') {
      const dom = document.getElementById('ifr').contentWindow.document.querySelector('.nextlink');
      dom && dom.click();
    }
   }, 10000);
  
})()
