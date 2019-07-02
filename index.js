const cluster = require("cluster")
const numCPUs = require("os").cpus().length

if (cluster.isMaster) {
  console.log(`MASTER OF PUPZS`)
  const workers = []
  const loads = Array(10000)
    .fill(0)
    .map(el => (Math.random() * 100).toFixed(0))
  const initialSize = loads.length
  var perc = 100
  for (let i = 0; i < numCPUs; i++) {
    workers[i] = cluster.fork()
    workers[i].on("message", payload => {
      const { message, index } = payload
      loads.splice(index, 1)
      let oldPerc = perc
      if (perc != ((loads.length / initialSize) * 100).toFixed(0))
        perc = ((loads.length / initialSize) * 100).toFixed(0)
      if (loads.length == 0) console.log(`Carga finalizada com sucesso!`)
      else if (oldPerc != perc)
        console.log(
          `[Thread ${i}][${((loads.length / initialSize) * 100).toFixed(0)}%]`
        )
    })
    workers[i].on("exit", worker => {
      console.log(`worker ${worker.process.pid} died`)
    })
  }
  loads.map((load, index) =>
    setTimeout(
      () =>
        workers[Math.floor((index / (numCPUs + 1)) % numCPUs)].send({
          message: load,
          index: index
        }),
      10000 * Math.random()
    )
  )
} else {
  process.on("message", payload =>
    process.send({
      message: `${payload.message} => recebido em :  ${new Date().toJSON()}`,
      index: payload.index
    })
  )
}
