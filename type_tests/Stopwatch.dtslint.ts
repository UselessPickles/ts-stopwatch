import { Stopwatch } from "../dist/types";

// Verify that Slices are readonly
declare const slice: Stopwatch.Slice;
// $ExpectError
slice.startTime = 0;
slice.startTime; // will error if Slice definition changes
// $ExpectError
slice.endTime = 0;
slice.endTime; // will error if Slice definition changes
// $ExpectError
slice.duration = 0;
slice.duration; // will error if Slice definition changes
