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
export declare class Stopwatch {
    private readonly getSystemTime;
    /**
     * The system time at which the stopwatch was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     */
    private startSystemTime;
    /**
     * The system time at which the stopwatch was stopped.
     * Undefined if the stopwatch is not currently stopped,
     * is not yet started, or has been reset.
     */
    private stopSystemTime;
    /**
     * The total amount of system time the stopwatch has been stopped since
     * the last reset.
     */
    private stopDuration;
    /**
     * The stopwatch time at which the current pending slice was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     */
    private pendingSliceStartStopwatchTime;
    /**
     * Recorded results of all completed slices since the the last reset.
     */
    private completedSlices;
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
    constructor(getSystemTime?: Stopwatch.GetTimeFunc);
    /**
     * Get the system time at which the stopwatch was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     *
     * @return the system time at which the stopwatch was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     */
    getStartTime(): number | undefined;
    /**
     * Get the current state of this stopwatch.
     *
     * @return the current state of this stopwatch.
     */
    getState(): Stopwatch.State;
    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#IDLE}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#IDLE}.
     */
    isIdle(): boolean;
    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#RUNNING}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#RUNNING}.
     */
    isRunning(): boolean;
    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#STOPPED}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#STOPPED}.
     */
    isStopped(): boolean;
    /**
     * Get the current stopwatch time.
     * This is the total amount of system time that this stopwatch has been running since
     * the last reset.
     *
     * Returns zero if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * @return the current stopwatch time.
     */
    getTime(): number;
    /**
     * Get details about the current pending slice for this stopwatch, as of now.
     *
     * Returns a zero-length slice if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * @return details about the current pending slice for this stopwatch, as of now.
     */
    getPendingSlice(): Stopwatch.Slice;
    /**
     * Get a list of all completed/recorded slices for this stopwatch since the last reset.
     * @return a list of all completed/recorded slices for this stopwatch since the last reset.
     */
    getCompletedSlices(): Stopwatch.Slice[];
    /**
     * Get a list of all completed/recorded slices for this stopwatch since the last reset,
     * plus the current pending slice.
     * @return a list of all completed/recorded slices for this stopwatch since the last reset,
     * plus the current pending slice.
     */
    getCompletedAndPendingSlices(): Stopwatch.Slice[];
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
    start(forceReset?: boolean): void;
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
    slice(): Stopwatch.Slice;
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
    stop(recordPendingSlice?: boolean): number;
    /**
     * Completely resets this stopwatch to its initial state.
     * Clears out all recorded running duration, slices, etc.
     * The state is guaranteed to be {@link Stopwatch.State#IDLE} after
     * calling this method.
     */
    reset(): void;
    /**
     * Gets the system time equivalent of the current stopwatch time.
     * If this stopwatch is currently stopped, then the system time at which it was
     * stopped is returned.
     * Otherwise, the current system time according to {@link Stopwatch#getSystemTime} is
     * returned.
     * @return the system time equivalent of the current stopwatch time.
     */
    private getSystemTimeOfCurrentStopwatchTime;
    /**
     * Calculates the current stopwatch time as of a specified system time.
     * @param endSystemTime - The end system time for the calculation.
     * @return the current stopwatch time as of the specified system time.
     */
    private calculateStopwatchTime;
    /**
     * Calculates the current pending slice as of a specified stopwatch time.
     * @param endStopwatchTime - The end stopwatch time for the calculation.
     * @return the current pending slice as of the specified stopwatch time.
     */
    private calculatePendingSlice;
    /**
     * Private implementation of ending/recording the currently pending slice.
     * See {@link #slice} for more explanation.
     * @param endStopwatchTime - The end stopwatch time of the slice.
     * @return the recorded slice.
     */
    private recordPendingSlice;
}
export declare namespace Stopwatch {
    /**
     * A function that returns "the current time" of some system.
     * The only requirement is that each call to this function must return a number
     * that is greater than or equal to the previous call to the function.
     */
    type GetTimeFunc = () => number;
    /**
     * Measurements of a single "slice" recorded by a {@link Stopwatch}.
     */
    interface Slice {
        /**
         * The stopwatch time at the start of this slice.
         */
        readonly startTime: number;
        /**
         * The stopwatch time at the end of this slice.
         */
        readonly endTime: number;
        /**
         * The running duration of this slice (a.k.a., "split time").
         */
        readonly duration: number;
    }
    /**
     * Possible states of a {@link Stopwatch}.
     */
    enum State {
        /**
         * The stopwatch has not yet been started, or has been reset.
         */
        IDLE = "IDLE",
        /**
         * The stopwatch is currently running.
         */
        RUNNING = "RUNNING",
        /**
         * The stopwatch was previously running, but has been stopped.
         */
        STOPPED = "STOPPED"
    }
    /**
     * Sets the default implementation of "getSystemTime" to be used by all future
     * instances of {@link Stopwatch}.
     * @param systemTimeGetter - A default "getSystemTime" implementation for
     *        all future instances of {@link Stopwatch}.
     *        Defaults to {@link Date.now}.
     */
    function setDefaultSystemTimeGetter(systemTimeGetter?: GetTimeFunc): void;
}
//# sourceMappingURL=index.d.ts.map