
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
 * return 新的二维数组
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


/**
     * 查找指定className的父节点
     * @param {*} element 当前的节点
     * @param {*} className
     * return 目标父节点
     */
 const findNearestComponent = (element, className) =>{
  let target = element;
  while (target) {
    if (target.className === className) {
      return target;
    }
    target = target.parentNode;
  }
  return null;
},

 const autoPlay = (() => {
   const dom1 = document.getElementById('ifr').contentWindow.document.querySelector('.qrcodebox');
   let flag = true;
   setInterval(() => {
    if (dom1 && dom1.style.display === 'block') {
      const dom = document.getElementById('ifr').contentWindow.document.querySelector('.nextlink');
      if(flag) {
        dom && dom.click();
        flag = false;
        setTimeout(() => {
          flag = false
        },10000)
      }
    }
   }, 50000);
})()

/**
     * 自定义ForEach, 使用while循环替代forEach提高性能
     * @param {*} array 当前的节点
     * @param {*} iteratee 要执行迭代的函数
     * return 目标父节点
     */
const forEach = (array,iteratee) => {
  const index = -1;
  const length = array.length;
  while(++index < length){
    if(typeof iteratee === 'function') {
      iteratee(array[index], index)
    } else {
      console.error('iteratee不是一个函数')
    }
  }

}



 /**
     * 自定义eval, 减少eval使用提高性能
     * @param {*} args  传入的行参
     * @param {*} code 执行的代码
     * @param {*} that this
     * @param {*} params 函数参数
     * return 目标父节点
     */
 const $_eval = function $_eval({args, code, that, params}) {
  if(that === undefined) {
      that = this || window || null;
  }
  const fn = new Function(...params, code)
  fn.apply(that, args);
}



const deepCopy = (target, map = new WeakMap()) => {
  if(typeof target === 'object') {
    const isArray = Array.isArray(target);
    let cloneTarget = isArray ? []: {};
    if(map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    const keys = isArray? undefined: Object.keys(target);
    forEach(keys || target, (value, key) => {
      if(keys) {
        key = value
      }
      cloneTarget = deepCopy(target[key], map);
    })
    return cloneTarget;

  } else{
    return target;
  }

}
const isObject = (target) => {
  const type = typeof target;
  return target !== null && (type === 'object' || type === 'function');

}

const getType = (tatget) => {
  return Object.prototype.toString.call(target)
}

const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';

const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const numberTag = '[object Number]';
const regexpTag = '[object RegExp]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';


const getInit = (target) => {
  const Ctot = target.constuctor;
  return new Ctot();
}

const cloneSymbol = () => {
  return Object(Symbol.prototype.valueOf(target))
}
