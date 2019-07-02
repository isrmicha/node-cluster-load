const cluster = require("cluster")
const numCPUs = require("os").cpus().length
const performance = require("perf_hooks").performance
if (cluster.isMaster) {
  console.log(`MASTER OF PUPZS`)
  const workers = []
  const loads = Array(1000)
    .fill(0)
    .map(el => (Math.random() * 100).toFixed(0))
  const perfBefore = performance.now()
  var perfAfter
  var all = []
  for (let i = 0; i < numCPUs; i++) {
    workers[i] = cluster.fork()
    workers[i].on("message", payload => {
      const { message, indexThread } = payload
      if (indexThread === i) {
        all.push(parseInt(message))
        loads.shift()
        if (!loads.length) {
          perfAfter = performance.now()
          const time = perfAfter - perfBefore
          console.log(`Finished in => ${time.toFixed(0)} ms`)
          console.log(all.sort((a,b)=>a-b))
          process.exit(0)
        } else {
          workers[indexThread].send({
            message: loads.length,
            indexThread: indexThread
          })
        }
      }
    })
    workers[i].on("exit", worker => {
      console.log(`worker ${worker.process.pid} died`)
    })
    workers[i].send({
      message: loads[0],
      indexThread: i
    })
  }
} else {
  process.on("message", payload => {
    const { message, indexThread } = payload

    process.send({
      message,
      indexThread
    })
  })
}
