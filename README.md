[![npm version](https://img.shields.io/npm/v/ts-stopwatch.svg)](https://www.npmjs.com/package/ts-stopwatch)
[![Join the chat at https://gitter.im/ts-stopwatch/Lobby](https://badges.gitter.im/ts-stopwatch/Lobby.svg)](https://gitter.im/ts-stopwatch/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/UselessPickles/ts-stopwatch.svg?branch=master)](https://travis-ci.org/UselessPickles/ts-stopwatch)
[![Coverage Status](https://coveralls.io/repos/github/UselessPickles/ts-stopwatch/badge.svg?branch=master)](https://coveralls.io/github/UselessPickles/ts-stopwatch?branch=master)

# ts-stopwatch

Stopwatch timer utility written in TypeScript

# Contents

<!-- TOC depthFrom:2 -->

-   [What is it?](#what-is-it)
-   [Is TypeScript required?](#is-typescript-required)
-   [Installation](#installation)
-   [Import the Stopwatch class](#import-the-stopwatch-class)
-   [How to use it](#how-to-use-it)
-   [Customize the source of time](#customize-the-source-of-time)
-   [Usage Examples](#usage-examples)
    -   [Basic Usage](#basic-usage)
    -   [Time Slices](#time-slices)
-   [API Reference](#api-reference)

<!-- /TOC -->

## What is it?

`ts-stopwatch` is a convenient stopwatch-inspired timer utility for measuring durations of time between different points of execution in code. It can be paused, resumed, reset, and can record multiple "slices" of time (inspired by a stopwatch's "lap" functionality).

Because `ts-stopwatch` is written in TypeScript, it comes with 100% accurate TypeScript type definitions.

## Is TypeScript required?

No. The `ts-stopwatch` NPM package includes both a standard NPM/CommonJS module and a ES module. The included TypeScript type definitions are just a bonus. Source maps are also included.

## Installation

Install via [NPM](https://www.npmjs.com/package/ts-stopwatch):

```
npm i -s ts-stopwatch
```

## Import the Stopwatch class

JavaScript:

```js
const Stopwatch = require("ts-stopwatch").Stopwatch;
```

TypeScript/ES6:

```ts
import { Stopwatch } from "ts-stopwatch";
```

## How to use it

To begin recording time, create a new instance of `Stopwatch` and call its
`start()` method.

Pause the stopwatch via `stop()`, then resume by calling
`start()` again.

Use `getTime()` to get the amount of time that the stopwatch has
recorded so far (ignoring durations of time that the Stopwatch was stopped).
There's no need to stop the stopwatch before doing this.

Similar to advanced physical stopwatches' abilities to record multiple lap times
Stopwatch supports recording multiple "slices" of time. See `slice()`, `getPendingSlice()`,
`getCompletedSlices()`, and `getCompletedAndPendingSlices()`.

NOTE: Call `stop(true)` to simultaneously record the current pending "slice".

Use `reset()` to reset the stopwatch to its initial state.

NOTE: Call `start(true)` to force a reset before (re)starting.

See `getState()`, `isIdle()`, `isRunning()`,
and `isStopped()` for testing the current state of the Stopwatch.

## Customize the source of time

By default, Stopwatch internally uses `Date.now()` for tracking the amount of
time that has passed. This is the most compatible implementation, but has some limitations:

-   Maximum potential precision of 1ms.
-   Results can be thrown off if the computer's time is adjusted (manually or automatically) during execution of the code.

If your runtime environment supports a more reliable or higher precision method for
obtaining system time or program execution time, then you can override this default
implementation by either:

-   Providing a custom "system time getter" function to the Stopwatch constructor.
-   Or using `Stopwatch.setDefaultSystemTimeGetter()` to ensure that ALL future instances
    of Stopwatch use your custom "system time getter" by default.

NOTE: The unit of time/duration reported by Stopwatch is determined by the unit time
returned by the "system time getter" function.

Stopwatch is not limited to recording durations of system time. It can record the "duration"
(change) of any numeric value that may change over time, but is guaranteed to never decrease
over time.

## Usage Examples

### Basic Usage

```ts
import { Stopwatch } from "ts-stopwatch";

const stopwatch = new Stopwatch();

stopwatch.start();
// imagine 100 ms worth of code execution
stopwatch.stop();
// imagine 100 ms worth of code execution (ignored)
stopwatch.start();
// imagine 100 ms worth of code execution
stopwatch.stop();
// imagine 100 ms worth of code execution (ignored)

stopwatch.getTime();
// returns 200
// (amount of time the stopwatch has been running)
```

### Time Slices

```ts
import { Stopwatch } from "ts-stopwatch";

const stopwatch = new Stopwatch();

stopwatch.start();
// imagine 100 ms worth of code execution
stopwatch.slice();
// imagine 50 ms worth of code execution
stopwatch.stop();
// imagine 100 ms worth of code execution (ignored)
stopwatch.slice();
// imagine 100 ms worth of code execution (ignored)
stopwatch.start();
// imagine 150 ms worth of code execution
stopwatch.slice();

stopwatch.getCompletedSlices();
// returns [
//   {
//     startTime: 0,
//     stopTime: 100,
//     duration: 100
//   },
//   {
//     startTime: 100,
//     stopTime: 150,
//     duration: 50
//   },
//   {
//     startTime: 150,
//     stopTime: 300,
//     duration: 150
//   }
// ]
```

## API Reference

Under construction.

View source code for exact method signatures and complete method/parameter documentation.

The distributed code and type definitions also include full documentation for convenience in IDEs that display documentation.
