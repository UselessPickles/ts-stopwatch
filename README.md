[![npm version](https://img.shields.io/npm/v/ts-stopwatch.svg)](https://www.npmjs.com/package/ts-stopwatch)
[![Join the chat at https://gitter.im/ts-stopwatch/Lobby](https://badges.gitter.im/ts-stopwatch/Lobby.svg)](https://gitter.im/ts-stopwatch/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/UselessPickles/ts-stopwatch.svg?branch=master)](https://travis-ci.org/UselessPickles/ts-stopwatch)
[![Coverage Status](https://coveralls.io/repos/github/UselessPickles/ts-stopwatch/badge.svg?branch=master)](https://coveralls.io/github/UselessPickles/ts-stopwatch?branch=master)

# ts-stopwatch

Stopwatch timer utility written in TypeScript

# Contents

<!-- TOC depthFrom:2 -->

-   [What is it?](#what-is-it)
-   [Installation](#installation)
-   [Usage Examples](#usage-examples)
    -   [Basic Usage](#basic-usage)
    -   [Time Slices](#time-slices)
-   [API Reference](#api-reference)

<!-- /TOC -->

## What is it?

`ts-stopwatch` is a convenient stopwatch-inspired timer utility for measuring durations of time between different points of execution in code. It can be paused, resumed, reset, and can record multiple "slices" of time (inspired by a stopwatch's "lap" functionality).

For maximum compatibility, `ts-stopwatch` uses `Date.now` by default to obtain a system time for its calculations. This can be overridden on a per-instance or global default basis to use any numeric time reporting function of your choosing.

Because `ts-stopwatch` is written in TypeScript, it comes with 100% accurate TypeScript type definitions.

## Installation

Install via [NPM](https://www.npmjs.com/package/ts-stopwatch):

```
npm i -s ts-stopwatch
```

## Usage Examples

### Basic Usage

```ts
import { Stopwatch } from "ts-stopwatch";

const stopwatch = new Stopwatch();

stopwatch.start();
// imagine 100 ms worth of code execution
stopwatch.stop();
// imagine 100 ms worth of code execution
stopwatch.start();
// imagine 100 ms worth of code execution
stopwatch.stop();

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
stopwatch.slice();
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

View source code for method signatures and complete method/parameter documentation.
