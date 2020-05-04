var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/**
 * Records durations of time, with some design inspiration from a physical stopwatch.
 *
 * To begin recording time, create a new instance of Stopwatch and call its
 * {@link Stopwatch#start} method.
 *
 * Pause the stopwatch via {@link Stopwatch#stop}, then resume by calling
 * {@link Stopwatch#start} again.
 *
 * Use {@link Stopwatch#getTime} to get the amount of time that the stopwatch has
 * recorded so far (ignoring durations of time that the Stopwatch was stopped).
 * There's no need to stop the stopwatch before doing this.
 *
 * Similar to advanced physical stopwatches' abilities to record multiple lap times
 * Stopwatch supports recording multiple "slices" of time. See {@link Stopwatch.Slice},
 * {@link Stopwatch#slice}, {@link Stopwatch#getPendingSlice},
 * {@link Stopwatch#getCompletedSlices}, and {@link Stopwatch#getCompletedAndPendingSlices}.
 * NOTE: {@link Stopwatch#stop} supports an optional parameter to simultaneously
 *       record the current pending "slice".
 *
 * Use {@link Stopwatch#reset} to reset the stopwatch to its initial state.
 * NOTE: {@link Stopwatch#start} also supports an optional parameter to force
 *       a reset before (re)starting.
 *
 * See {@link Stopwatch#getState}, {@link Stopwatch#isIdle}, {@link Stopwatch#isRunning},
 * and {@link Stopwatch#isStopped} for testing the current state of the Stopwatch.
 *
 * By default, Stopwatch internally uses {@link Date.now} for tracking the amount of
 * time that has passed. This is the most compatible implementation, but has some limitations:
 * - Maximum precision of 1ms.
 * - Results can be thrown off if the computer's time is adjusted (manually or automatically)
 *   during execution of the code.
 *
 * If your runtime environment supports a more reliable or higher precision method for
 * obtaining system time or program execution time, then you can override this default
 * implementation by either:
 * - Providing a custom "system time getter" function to the Stopwatch constructor.
 * - Or using {@link Stopwatch.setDefaultSystemTimeGetter} to ensure that ALL future instances
 *   of Stopwatch use your custom "system time getter" by default.
 * NOTE: The unit of time/duration reported by Stopwatch is determined by the unit time
 *       returned by the "system time getter" function.
 *
 * Stopwatch is not limited to recording durations of system time. It can record the "duration"
 * (change) of any numeric value that may change over time, but is guaranteed to never decrease
 * over time.
 */
var Stopwatch = /** @class */ (function () {
    /**
     * Creates a new Stopwatch instance.
     * The unit of all durations reported by this instance will match the
     * unit of time returned by the provided `getSystemTime` param.
     *
     * @param getSystemTime - A callback that returns the current system time.
     *        Defaults to the current default system time getter as specified by the most
     *        recent call to {@link Stopwatch.setDefaultSystemTimeGetter}, which in turn
     *        defaults to {@link Date.now}.
     */
    function Stopwatch(getSystemTime) {
        if (getSystemTime === void 0) { getSystemTime = defaultSystemTimeGetter; }
        this.getSystemTime = getSystemTime;
        /**
         * The total amount of system time the stopwatch has been stopped since
         * the last reset.
         */
        this.stopDuration = 0;
        /**
         * Recorded results of all completed slices since the the last reset.
         */
        this.completedSlices = [];
    }
    /**
     * Get the system time at which the stopwatch was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     *
     * @return the system time at which the stopwatch was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     */
    Stopwatch.prototype.getStartTime = function () {
        return this.startSystemTime;
    };
    /**
     * Get the system time at which the stopwatch was stopped.
     * Undefined if the stopwatch is not currently stopped,
     * is not yet started, or has been reset.
     *
     * @return the system time at which the stopwatch was stopped.
     * Undefined if the stopwatch is not currently stopped,
     * is not yet started, or has been reset.
     */
    Stopwatch.prototype.getStopTime = function () {
        return this.stopSystemTime;
    };
    /**
     * Get the current state of this stopwatch.
     *
     * @return the current state of this stopwatch.
     */
    Stopwatch.prototype.getState = function () {
        if (this.startSystemTime === undefined) {
            return Stopwatch.State.IDLE;
        }
        else if (this.stopSystemTime === undefined) {
            return Stopwatch.State.RUNNING;
        }
        else {
            return Stopwatch.State.STOPPED;
        }
    };
    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#IDLE}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#IDLE}.
     */
    Stopwatch.prototype.isIdle = function () {
        return this.getState() === Stopwatch.State.IDLE;
    };
    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#RUNNING}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#RUNNING}.
     */
    Stopwatch.prototype.isRunning = function () {
        return this.getState() === Stopwatch.State.RUNNING;
    };
    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#STOPPED}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#STOPPED}.
     */
    Stopwatch.prototype.isStopped = function () {
        return this.getState() === Stopwatch.State.STOPPED;
    };
    /**
     * Get the current stopwatch time.
     * This is the total amount of system time that this stopwatch has been running since
     * the last reset.
     *
     * Returns zero if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * @return the current stopwatch time.
     */
    Stopwatch.prototype.getTime = function () {
        return this.calculateStopwatchTime();
    };
    /**
     * Get details about the current pending slice for this stopwatch, as of now.
     *
     * Returns a zero-length slice if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * @return details about the current pending slice for this stopwatch, as of now.
     */
    Stopwatch.prototype.getPendingSlice = function () {
        return this.calculatePendingSlice();
    };
    /**
     * Get a list of all completed/recorded slices for this stopwatch since the last reset.
     * @return a list of all completed/recorded slices for this stopwatch since the last reset.
     */
    Stopwatch.prototype.getCompletedSlices = function () {
        return Array.from(this.completedSlices);
    };
    /**
     * Get a list of all completed/recorded slices for this stopwatch since the last reset,
     * plus the current pending slice.
     * @return a list of all completed/recorded slices for this stopwatch since the last reset,
     * plus the current pending slice.
     */
    Stopwatch.prototype.getCompletedAndPendingSlices = function () {
        return __spreadArrays(this.completedSlices, [this.getPendingSlice()]);
    };
    /**
     * Starts (or resumes) running this stopwatch.
     *
     * Does nothing if the state is already {@link Stopwatch.State#RUNNING} and `forceReset`
     * is false.
     *
     * The state is guaranteed to be {@link Stopwatch.State#RUNNING} after
     * calling this method.
     *
     * @param forceReset - If true, then the stopwatch is {@link #reset} before starting.
     */
    Stopwatch.prototype.start = function (forceReset) {
        if (forceReset === void 0) { forceReset = false; }
        if (forceReset) {
            this.reset();
        }
        if (this.stopSystemTime !== undefined) {
            var systemNow = this.getSystemTime();
            var stopDuration = systemNow - this.stopSystemTime;
            // Accumulate duration ot stop
            this.stopDuration += stopDuration;
            // Resume running
            this.stopSystemTime = undefined;
        }
        else if (this.startSystemTime === undefined) {
            var systemNow = this.getSystemTime();
            // Record initial start time
            this.startSystemTime = systemNow;
            this.pendingSliceStartStopwatchTime = 0;
        }
    };
    /**
     * Ends the currently pending slice {@link Stopwatch.Slice}, records it, and
     * starts the next pending slice.
     *
     * Does nothing and returns a zero-length slice if the state is
     * currently {@link Stopwatch.State#IDLE}.
     *
     * If the state is currently {@link Stopwatch.State#STOPPED}, then the slice
     * technically ends (and the next pending slice starts) at the same time
     * the stopwatch was stopped.
     *
     * This method does not change the state of the stopwatch.
     *
     * @returns the recorded slice.
     */
    Stopwatch.prototype.slice = function () {
        return this.recordPendingSlice();
    };
    /**
     * Stops (pauses) this stopwatch and returns the current {@link #getTime}
     * result. Time will not be accumulated to this stopwatch's total running duration
     * or the current pending slice while it is stopped. Call {@link #start} to resume
     * accumulating time.
     *
     * Does nothing and returns zero if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * Stopping a stopwatch that is already {@link Stopwatch.State#STOPPED} will still
     * record another slice if `recordPendingSlice` is true.
     *
     * The state will be {@link Stopwatch.State#STOPPED} after calling this method if
     * the state is not currently {@link Stopwatch.State#IDLE}. otherwise, it will remain
     * {@link Stopwatch.State#IDLE}.
     *
     * @param recordPendingSlice - If true, then also end/record the current pending slice.
     *        This ensures that slice is ended exactly at the same time that the stopwatch
     *        is stopped.
     * @return the current {@link #getTime} result.
     */
    Stopwatch.prototype.stop = function (recordPendingSlice) {
        if (recordPendingSlice === void 0) { recordPendingSlice = false; }
        if (this.startSystemTime === undefined) {
            return 0;
        }
        var systemTimeOfStopwatchTime = this.getSystemTimeOfCurrentStopwatchTime();
        if (recordPendingSlice) {
            this.recordPendingSlice(this.calculateStopwatchTime(systemTimeOfStopwatchTime));
        }
        this.stopSystemTime = systemTimeOfStopwatchTime;
        return this.getTime();
    };
    /**
     * Completely resets this stopwatch to its initial state.
     * Clears out all recorded running duration, slices, etc.
     * The state is guaranteed to be {@link Stopwatch.State#IDLE} after
     * calling this method.
     */
    Stopwatch.prototype.reset = function () {
        this.startSystemTime = this.pendingSliceStartStopwatchTime = this.stopSystemTime = undefined;
        this.stopDuration = 0;
        this.completedSlices = [];
    };
    /**
     * Gets the system time equivalent of the current stopwatch time.
     * If this stopwatch is currently stopped, then the system time at which it was
     * stopped is returned.
     * Otherwise, the current system time according to {@link Stopwatch#getSystemTime} is
     * returned.
     * @return the system time equivalent of the current stopwatch time.
     */
    Stopwatch.prototype.getSystemTimeOfCurrentStopwatchTime = function () {
        return this.stopSystemTime === undefined
            ? this.getSystemTime()
            : this.stopSystemTime;
    };
    /**
     * Calculates the current stopwatch time as of a specified system time.
     * @param endSystemTime - The end system time for the calculation.
     * @return the current stopwatch time as of the specified system time.
     */
    Stopwatch.prototype.calculateStopwatchTime = function (endSystemTime) {
        if (this.startSystemTime === undefined) {
            return 0;
        }
        if (endSystemTime === undefined) {
            endSystemTime = this.getSystemTimeOfCurrentStopwatchTime();
        }
        return endSystemTime - this.startSystemTime - this.stopDuration;
    };
    /**
     * Calculates the current pending slice as of a specified stopwatch time.
     * @param endStopwatchTime - The end stopwatch time for the calculation.
     * @return the current pending slice as of the specified stopwatch time.
     */
    Stopwatch.prototype.calculatePendingSlice = function (endStopwatchTime) {
        if (this.pendingSliceStartStopwatchTime === undefined) {
            return Object.freeze({
                startTime: 0,
                endTime: 0,
                duration: 0
            });
        }
        if (endStopwatchTime === undefined) {
            endStopwatchTime = this.getTime();
        }
        return Object.freeze({
            startTime: this.pendingSliceStartStopwatchTime,
            endTime: endStopwatchTime,
            duration: endStopwatchTime - this.pendingSliceStartStopwatchTime
        });
    };
    /**
     * Private implementation of ending/recording the currently pending slice.
     * See {@link #slice} for more explanation.
     * @param endStopwatchTime - The end stopwatch time of the slice.
     * @return the recorded slice.
     */
    Stopwatch.prototype.recordPendingSlice = function (endStopwatchTime) {
        if (this.pendingSliceStartStopwatchTime !== undefined) {
            if (endStopwatchTime === undefined) {
                endStopwatchTime = this.getTime();
            }
            var slice = this.calculatePendingSlice(endStopwatchTime);
            // Start the next pending slice
            this.pendingSliceStartStopwatchTime = slice.endTime;
            // Record the slice
            this.completedSlices.push(slice);
            return slice;
        }
        else {
            return this.calculatePendingSlice();
        }
    };
    return Stopwatch;
}());
export { Stopwatch };
(function (Stopwatch) {
    /**
     * Possible states of a {@link Stopwatch}.
     */
    var State;
    (function (State) {
        /**
         * The stopwatch has not yet been started, or has been reset.
         */
        State["IDLE"] = "IDLE";
        /**
         * The stopwatch is currently running.
         */
        State["RUNNING"] = "RUNNING";
        /**
         * The stopwatch was previously running, but has been stopped.
         */
        State["STOPPED"] = "STOPPED";
    })(State = Stopwatch.State || (Stopwatch.State = {}));
    /**
     * Sets the default implementation of "getSystemTime" to be used by all future
     * instances of {@link Stopwatch}.
     * @param systemTimeGetter - A default "getSystemTime" implementation for
     *        all future instances of {@link Stopwatch}.
     *        Defaults to {@link Date.now}.
     */
    function setDefaultSystemTimeGetter(systemTimeGetter) {
        if (systemTimeGetter === void 0) { systemTimeGetter = Date.now; }
        defaultSystemTimeGetter = systemTimeGetter;
    }
    Stopwatch.setDefaultSystemTimeGetter = setDefaultSystemTimeGetter;
})(Stopwatch || (Stopwatch = {}));
/**
 * The default "getSystemTime" implementation for all new instances of
 * {@link Stopwatch}.
 * Defaults to {@link Date.now}.
 * Updated via {@link Stopwatch.setDefaultSystemTimeGetter}.
 */
var defaultSystemTimeGetter = Date.now;
//# sourceMappingURL=index.js.map