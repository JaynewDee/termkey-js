#!/user/bin/env node

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
