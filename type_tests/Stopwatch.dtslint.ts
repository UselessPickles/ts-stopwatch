import { Stopwatch } from "../dist/types";

// $ExpectType Stopwatch
const stopwatch = new Stopwatch();

// Verify that Laps are readonly
// $ExpectType Lap
const lap = stopwatch.getPendingLap();
// $ExpectError
lap.lapDuration = 0;
// $ExpectError
lap.totalDuration = 0;
