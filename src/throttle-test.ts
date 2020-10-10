// // import {throttle1, createThrottle} from './utils/throttle'
// import throttle from './utils/throttle'

// const sendApi = async (number: number) => {
//   log(number)
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   // log(number)
// }

// // const send = throttle1(500, false, sendApi)
// const send = throttle(sendApi, 500)

// async function runTest() {
//   log('start')
//   await send(1)
//   send(2)
//   send(3)
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   send(4)
//   send(5)
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   send(6)
//   send(7)
//   send(8)
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   send(9)
//   send(10)
//   send(11)
//   send(12)
//   send(13)
// }

// runTest().then(async x => {
//   await send.flush()
//   await sendApi('last')
//   console.log('done')
// })

// function log(msg: any) {
//   console.log(`${new Date().toISOString()}: ${msg}`)
// }
