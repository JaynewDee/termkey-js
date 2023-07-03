import { ControlFlow } from "./command"
import { exit } from "process"
main()

async function main() {
  try {
    ControlFlow()
  } catch (err) {
    console.error(err);
    exit(1)
  }
}
