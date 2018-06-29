/**
 * TODO
 */
export class Stopwatch {
    /**
     * The time at which the stopwatch was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     */
    private startTime: number | undefined;

    /**
     * The time at which the stopwatch was stopped.
     * Undefined if the stopwatch is not currently stopped,
     * is not yet started, or has been reset.
     */
    private stopTime: number | undefined;

    /**
     * The total amount of time the stopwatch has been stopped since
     * the last reset.
     */
    private stopDuration: number = 0;

    /**
     * The time at wich the current pendign lap was started.
     * Undefined if the stopwatch is not yet started, or has been reset.
     */
    private pendingLapStartTime: number | undefined;

    /**
     * The total amount of time the stopwatch has been stopped since
     * the the current pending lap was started.
     */
    private pendingLapStopDuration: number = 0;

    /**
     * Recorded results of all completed laps sinse the the last reset.
     */
    private completedLaps: Stopwatch.Lap[] = [];

    /**
     * Creates a new Stopwatch instance.
     * The unit of all durations reported by this instance will match the
     * unit of time returned by the provided `getTime` param.
     *
     * @param getTime - A callback that returns "the current time".
     *        Defaults to {@link Date.now}.
     */
    public constructor(
        private readonly getTime: Stopwatch.GetTimeFunc = Date.now
    ) {}

    /**
     * Get the current state of this stopwatch.
     *
     * @return the current state of this stopwatch.
     */
    public getState(): Stopwatch.State {
        if (this.startTime === undefined) {
            return Stopwatch.State.IDLE;
        } else if (this.stopTime === undefined) {
            return Stopwatch.State.RUNNING;
        } else {
            return Stopwatch.State.STOPPED;
        }
    }

    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#IDLE}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#IDLE}.
     */
    public isIdle(): boolean {
        return this.getState() === Stopwatch.State.IDLE;
    }

    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#RUNNING}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#RUNNING}.
     */
    public isRunning(): boolean {
        return this.getState() === Stopwatch.State.RUNNING;
    }

    /**
     * Test if this stopwatch is currently {@link Stopwatch.State#STOPPED}.
     *
     * @return true if this stopwatch is currently {@link Stopwatch.State#STOPPED}.
     */
    public isStopped(): boolean {
        return this.getState() === Stopwatch.State.STOPPED;
    }

    /**
     * Get the total amount of time that this stopwatch has been running since
     * the last reset.
     *
     * Returns zero if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * @return the total amount of time that this stopwatch has been running since
     * the last reset.
     */
    public getDuration(): number {
        return this.calculateDuration();
    }

    /**
     * Get details about the current pending lap for this stopwatch, as of now.
     *
     * Returns a zero-length lap if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * @return details about the current pending lap for this stopwatch, as of now.
     */
    public getPendingLap(): Stopwatch.Lap {
        return this.calculatePendingLap();
    }

    /**
     * Get a list of all completed/recorded laps for this stopwatch since the last reset.
     * @return a list of all completed/recorded laps for this stopwatch since the last reset.
     */
    public getCompletedLaps(): Stopwatch.Lap[] {
        return Array.from(this.completedLaps);
    }

    /**
     * Get a list of all completed/recorded laps for this stopwatch since the last reset,
     * plus the current pending lap.
     * @return a list of all completed/recorded laps for this stopwatch since the last reset,
     * plus the current pending lap.
     */
    public getCompletedAndPendingLaps(): Stopwatch.Lap[] {
        return [...this.completedLaps, this.getPendingLap()];
    }

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
    public start(forceReset: boolean = false): void {
        if (forceReset) {
            this.reset();
        }

        if (this.stopTime !== undefined) {
            const now = this.getTime();
            const stopDuration = now - this.stopTime;

            // Accumulate duration ot stop
            this.stopDuration += stopDuration;
            this.pendingLapStopDuration += stopDuration;
            // Resume running
            this.stopTime = undefined;
        } else if (this.startTime === undefined) {
            const now = this.getTime();
            // Record initial start time
            this.startTime = now;
            this.pendingLapStartTime = now;
        }
    }

    /**
     * Ends the currently pending lap {@link Stopwatch.Lap}, records it, and
     * starts the next pending lap.
     *
     * Does nothing and returns a zero-length lap if the state is
     * currently {@link Stopwatch.State#IDLE}.
     *
     * If the state is currently {@link Stopwatch.State#STOPPED}, then the lap
     * technically ends (and the next pending lap starts) at the same time
     * the stopwatch was stopped.
     *
     * This method does not change the state of the stopwatch.
     *
     * @returns the recorded lap.
     */
    public lap(): Stopwatch.Lap {
        return this.recordPendingLap();
    }

    /**
     * Stops (pauses) this stopwatch and returns the current {@link #getDuration}
     * result. Time will not be accumulated to this stopwatch's total running duration
     * or the current pending lap while it is stopped. Call {@link #start} to resume
     * accumulating time.
     *
     * Does nothing and returns zero if the state is currently {@link Stopwatch.State#IDLE}.
     *
     * Stopping a stopwatch that is already {@link Stopwatch.State#STOPPED} will still
     * record another lap if `recordPendingLap` is true.
     *
     * The state will be {@link Stopwatch.State#STOPPED} after calling this method if
     * the state is not currently {@link Stopwatch.State#IDLE}. otherwise, it will remain
     * {@link Stopwatch.State#IDLE}.
     *
     * @param recordPendingLap - If true, then also end/record the current pending lap.
     *        This ensures that lap is ended exactly at the same time that the stopwatch
     *        is stopped.
     * @return the current {@link #getDuration} result.
     */
    public stop(recordPendingLap: boolean = false): number {
        if (this.startTime === undefined) {
            return 0;
        }

        const now = this.getPossiblyStoppedTime();

        if (recordPendingLap) {
            this.recordPendingLap(now);
        }

        this.stopTime = now;

        return this.getDuration();
    }

    /**
     * Completely resets this stopwatch to its initial state.
     * Clears out all recorded running duration, laps, etc.
     * The state is guaranteed to be {@link Stopwatch.State#IDLE} after
     * calling this method.
     */
    public reset(): void {
        this.startTime = this.pendingLapStartTime = this.stopTime = undefined;
        this.stopDuration = this.pendingLapStopDuration = 0;
        this.completedLaps = [];
    }

    /**
     * Gets the current "potentially stopped" time for this stopwatch.
     * If this stopwatch is currently stopped, then the time at which it was
     * stopped is returned.
     * otherwise, the current time according to {@link Stopwatch#getTime} is
     * returned.
     * @return the "potentially stopped" time for this stopwatch.
     */
    private getPossiblyStoppedTime(): number {
        return this.stopTime === undefined ? this.getTime() : this.stopTime;
    }

    /**
     * Calculates the total running duration of this stopwatch as of a
     * specified end time.
     * @param endTime - The end time for the calculation.
     * @return the total running duration of this stopwatch as of a
     * specified end time.
     */
    private calculateDuration(endTime?: number): number {
        if (this.startTime === undefined) {
            return 0;
        }

        if (endTime === undefined) {
            endTime = this.getPossiblyStoppedTime();
        }

        return endTime - this.startTime - this.stopDuration;
    }

    /**
     * Calculates the current pending lap as of a specified end time.
     * @param lapEndTime - The end time for the calculation.
     * @return the current pending lap as of a specified end time.
     */
    private calculatePendingLap(lapEndTime?: number): Stopwatch.Lap {
        if (this.pendingLapStartTime === undefined) {
            return Object.freeze({
                totalDuration: 0,
                lapDuration: 0
            });
        }

        if (lapEndTime === undefined) {
            lapEndTime = this.getPossiblyStoppedTime();
        }

        return Object.freeze({
            totalDuration: this.calculateDuration(lapEndTime),
            lapDuration:
                lapEndTime -
                this.pendingLapStartTime -
                this.pendingLapStopDuration
        });
    }

    /**
     * Private implementation of ending/recording the currently pending lap.
     * See {@link #lap} for more explanation.
     * @param lapEndTime - The end time of the lap.
     * @return the recorded lap.
     */
    private recordPendingLap(lapEndTime?: number): Stopwatch.Lap {
        if (this.pendingLapStartTime !== undefined) {
            if (lapEndTime === undefined) {
                lapEndTime = this.getPossiblyStoppedTime();
            }

            const lap = this.calculatePendingLap(lapEndTime);

            // Start the next pending lap
            this.pendingLapStartTime = lapEndTime;
            this.pendingLapStopDuration = 0;

            // Record the lap
            this.completedLaps.push(lap);

            return lap;
        } else {
            return this.calculatePendingLap();
        }
    }
}

export namespace Stopwatch {
    /**
     * A function that returns "the current time" of some system.
     * The only requirement is that each call to this function must return a number
     * that is greater than or equal to the previous call to the function.
     */
    export type GetTimeFunc = () => number;

    /**
     * Measurements of a single "lap" recorded by a {@link Stopwatch}.
     */
    export interface Lap {
        /**
         * The total running duration of the stopwatch at the time the lap was ended.
         */
        readonly totalDuration: number;
        /**
         * The running duration of this lap (a.k.a., "split time").
         */
        readonly lapDuration: number;
    }

    /**
     * Possible states of a {@link Stopwatch}.
     */
    export enum State {
        /**
         * The stopwatch has not yet been started, or has been reset.
         */
        IDLE = "IDLE",
        /**
         * The stopwatch is currently running.
         */
        RUNNING = "RUNNING",
        /**
         * The stopwatch was previouslt running, but has been stopped.
         */
        STOPPED = "STOPPED"
    }
}
