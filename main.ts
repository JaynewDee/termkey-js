#!/usr/bin/env node

// @ts-nocheck
import { ControlFlow } from "./command"
import { exit } from "process"

main()

async function main() {
  try {
    ControlFlow()
  } catch (err) {
    console.log(`FATAL ERROR @ main control flow.`)
    console.error(err);
    exit(1)
  }
}

class Processor {
  gif() { } // process logic
  jpg() { } // process logic
  png() { } // process logic
}

function byExtension(filename, outputAs) {
  const ext = filename.split(".")[1];
  const { gif, jpg, png } = Processor;
  console.log(gif)
  const extensions = {
    gif: processGif,
    jpg: processJpg,
    png: processPng
  }

  return extensions[ext](outputAs)
}

const processGif = (outputType) => { }
const processJpg = (outputType) => { }
const processPng = (outputType) => { }