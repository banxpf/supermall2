import axios from 'axios'

export function request(config) {
  // return new Promise((resole, reject) => {
  //   const instance = axios.create({
  //     baseURL: 'http://123.207.32.32:8000',
  //     timeout: 5000
  //   })
  
  //   // 发送真正的网络请求
  //   instance(config)
  //     .then(res => {
  //       resole(res)
  //     })
  //     .catch(err => {
  //       reject(err)
  //     })
  // })
  
  const instance = axios.create({
    baseURL: 'http://123.207.32.32:8000',
    timeout: 5000
  })

  instance.interceptors.request.use(config => {
    console.log(config);
    return config
  }, err => {
    console.log(err)
  })
  instance.interceptors.response.use(res => {
    console.log(res)
    return res.data
  },err => {
    console.log(err)
  })

  return instance(config)

}

// function test(a, b) {
//   a('hello world');
// }

// test(() => {}, () => {})