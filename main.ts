#!/usr/bin/env node

// @ts-nocheck
import { ControlFlow } from "./command"
import { exit } from "process"

(() => {
  try {
    ControlFlow()
  } catch (err) {
    console.log(`FATAL ERROR reached main control flow.`)
    console.error(err);
    exit(1)
  }
})()
