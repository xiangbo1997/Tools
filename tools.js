
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