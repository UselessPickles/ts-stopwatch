import { Stopwatch } from "../dist/types";

// $ExpectType Stopwatch
const stopwatch = new Stopwatch();

// Verify that Slices are readonly
// $ExpectType Slice
const slice = stopwatch.getPendingSlice();
// $ExpectError
slice.startTime = 0;
// $ExpectError
slice.endTime = 0;
// $ExpectError
slice.duration = 0;
