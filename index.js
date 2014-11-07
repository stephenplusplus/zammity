var fs = require("fs")
var jsonl = require("jsonl")
var stream = require("stream")

var startstream = fs.createReadStream("./ldjson.json")
var midstream = new stream.PassThrough({objectMode: true})
var endstream = fs.createWriteStream("./ldjson-now.json")

var ended = false
midstream
  .on("data", function (obj) {
    if (obj.id === 1000) this.end()
  })
  // ignore "write after end" error
  .on("error", function () {})

  .on("end", function () {
    // see there are a lot of objects in the buffer
    console.assert(endstream._writableState.length > 10000)

    setTimeout(function () {
      // see that after 100 milliseconds, they've been cleared out
      console.assert(endstream._writableState.length === 0)
    }, 100)
  })

// open a line-delimited JSON file with 2000 objects
startstream

  // convert file to stream in objectmode (emits 2000 objects)
  .pipe(jsonl({objectMode: true, depth: 0}))

  // decide after 1000 objects, we don't want to write any more
  .pipe(midstream)

  // covert objects to buffers
  .pipe(jsonl({toBufferStream:true}))

  // write to a new json file
  .pipe(endstream)
