import { Stopwatch } from "../src";

/**
 * Non-readonly version of a Stopwatch.Slice.
 * Used to typecast a Slice to try mutating its properties at runtime.
 */
type MutableSlice = {
    -readonly [P in keyof Stopwatch.Slice]: Stopwatch.Slice[P]
};

describe("Stopwatch", () => {
    test("Uses Date.now by default", (done) => {
        const stopwatch = new Stopwatch();

        expect((stopwatch as any).getSystemTime).toBe(Date.now);

        stopwatch.start();

        setTimeout(() => {
            expect(stopwatch.getTime()).toBeGreaterThanOrEqual(249);
            done();
        }, 250);
    });

    test("Stopwatch.setDefaultSystemTimeGetter", (done) => {
        const getTime = jest.fn();

        // Set a mock implementation as the default system time getter
        Stopwatch.setDefaultSystemTimeGetter(getTime);

        // Ensure that the mock implementation is used by default
        const stopwatch1 = new Stopwatch();
        getTime.mockReturnValue(1000);
        stopwatch1.start();
        getTime.mockReturnValue(1100);
        expect(stopwatch1.getTime()).toBe(100);
        expect(getTime).toHaveBeenCalledTimes(2);

        // Reset the default system time getter back to the default (Date.now)
        Stopwatch.setDefaultSystemTimeGetter();

        // Ensure that Date.now is used by default
        const stopwatch2 = new Stopwatch();
        stopwatch2.start();
        setTimeout(() => {
            // The mock implementation should not have been called any more times
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch2.getTime()).toBeGreaterThanOrEqual(249);
            done();
        }, 250);
    });

    describe("Slices are read-only", () => {
        test("while IDLE", () => {
            const stopwatch = new Stopwatch();

            const pendingSlice = stopwatch.getPendingSlice();
            const recordedSlice = stopwatch.slice();
            const completeAndPendingSlices = stopwatch.getCompletedAndPendingSlices();

            expect(() => {
                (pendingSlice as MutableSlice).endTime = 42;
            }).toThrow();

            expect(() => {
                (recordedSlice as MutableSlice).endTime = 42;
            }).toThrow();

            expect(() => {
                (completeAndPendingSlices[0] as MutableSlice).endTime = 42;
            }).toThrow();
        });

        test("while RUNNING", () => {
            const stopwatch = new Stopwatch();
            stopwatch.start();

            const pendingSlice = stopwatch.getPendingSlice();
            const recordedSlice = stopwatch.slice();
            const completeAndPendingSlices = stopwatch.getCompletedAndPendingSlices();

            expect(() => {
                (pendingSlice as MutableSlice).endTime = 42;
            }).toThrow();

            expect(() => {
                (recordedSlice as MutableSlice).endTime = 42;
            }).toThrow();

            expect(() => {
                (completeAndPendingSlices[0] as MutableSlice).endTime = 42;
            }).toThrow();
        });

        test("while STOPPED", () => {
            const stopwatch = new Stopwatch();
            stopwatch.start();
            stopwatch.stop();

            const pendingSlice = stopwatch.getPendingSlice();
            const recordedSlice = stopwatch.slice();
            const completeAndPendingSlices = stopwatch.getCompletedAndPendingSlices();

            expect(() => {
                (pendingSlice as MutableSlice).endTime = 42;
            }).toThrow();

            expect(() => {
                (recordedSlice as MutableSlice).endTime = 42;
            }).toThrow();

            expect(() => {
                (completeAndPendingSlices[0] as MutableSlice).endTime = 42;
            }).toThrow();
        });
    });

    test("Lists of slices are defensively copied", () => {
        const getTime = jest.fn();
        const stopwatch = new Stopwatch(getTime);

        getTime.mockReturnValue(1000);
        stopwatch.start();
        getTime.mockReturnValue(1100);
        stopwatch.slice();
        getTime.mockReturnValue(1300);
        stopwatch.slice();
        getTime.mockReturnValue(1700);

        const completedSlices = stopwatch.getCompletedSlices();
        const copyOfCompletedSlices = Array.from(completedSlices);

        completedSlices.splice(1, 1);
        expect(completedSlices).not.toEqual(copyOfCompletedSlices);
        expect(stopwatch.getCompletedSlices()).toEqual(copyOfCompletedSlices);

        const completedAndPendingSlices = stopwatch.getCompletedAndPendingSlices();
        const copyOfCompletedAndPendingSlices = Array.from(
            completedAndPendingSlices
        );

        completedAndPendingSlices.splice(1, 1);
        expect(completedAndPendingSlices).not.toEqual(
            copyOfCompletedAndPendingSlices
        );
        expect(stopwatch.getCompletedAndPendingSlices()).toEqual(
            copyOfCompletedAndPendingSlices
        );
    });

    describe("Basic usage", () => {
        test("initial", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);

            expect(stopwatch.getState()).toBe(Stopwatch.State.IDLE);
            expect(stopwatch.isIdle()).toBe(true);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(0);

            getTime.mockReturnValue(1100);
            expect(stopwatch.getTime()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(0);
        });

        test("initial -> stop", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            expect(stopwatch.stop()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);

            getTime.mockReturnValue(1100);

            expect(stopwatch.getState()).toBe(Stopwatch.State.IDLE);
            expect(stopwatch.isIdle()).toBe(true);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(0);

            expect(stopwatch.getTime()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(0);
        });

        test("initial -> reset", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.reset();
            expect(getTime).toHaveBeenCalledTimes(0);

            getTime.mockReturnValue(1100);

            expect(stopwatch.getState()).toBe(Stopwatch.State.IDLE);
            expect(stopwatch.isIdle()).toBe(true);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(0);

            expect(stopwatch.getTime()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(0);
        });

        test("initial -> start", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);

            expect(stopwatch.getState()).toBe(Stopwatch.State.RUNNING);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(true);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(1);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);
        });

        test("initial -> start -> start", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1200);

            expect(stopwatch.getState()).toBe(Stopwatch.State.RUNNING);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(true);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(1);

            expect(stopwatch.getTime()).toBe(200);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 200,
                duration: 200,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 200,
                    duration: 200,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);
        });

        test("initial -> start -> reset", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            stopwatch.reset();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1200);

            expect(stopwatch.getState()).toBe(Stopwatch.State.IDLE);
            expect(stopwatch.isIdle()).toBe(true);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(1);

            expect(stopwatch.getTime()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(1);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(1);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(1);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(1);
        });

        test("initial -> start -> stop", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            expect(stopwatch.stop()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);

            expect(stopwatch.getState()).toBe(Stopwatch.State.STOPPED);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(true);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });

        test("initial -> start -> stop -> stop", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            expect(stopwatch.stop()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);
            expect(stopwatch.stop()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getState()).toBe(Stopwatch.State.STOPPED);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(true);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });

        test("initial -> start -> stop -> start", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            expect(stopwatch.stop()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(3);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getState()).toBe(Stopwatch.State.RUNNING);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(true);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(3);

            expect(stopwatch.getTime()).toBe(200);
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 200,
                duration: 200,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 200,
                    duration: 200,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(6);
        });

        test("initial -> start -> stop -> reset", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            expect(stopwatch.stop()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);
            stopwatch.reset();
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getState()).toBe(Stopwatch.State.IDLE);
            expect(stopwatch.isIdle()).toBe(true);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getTime()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });
    });

    describe("Basic slice usage", () => {
        test("while IDLE", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            expect(stopwatch.slice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(0);
        });

        test("while RUNNING", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);

            expect(stopwatch.getPendingSlice('running')).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: 'running'
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(3);

            expect(stopwatch.slice('foo')).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: 'foo'
            });
            expect(getTime).toHaveBeenCalledTimes(4);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: 'foo'
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: 'foo'
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(6);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 300,
                duration: 200,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: 'foo'
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: 'foo'
                },
                {
                    startTime: 100,
                    endTime: 300,
                    duration: 200,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(8);

            expect(stopwatch.slice()).toEqual({
                startTime: 100,
                endTime: 300,
                duration: 200,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(9);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 300,
                endTime: 300,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(10);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: 'foo'
                },
                {
                    startTime: 100,
                    endTime: 300,
                    duration: 200,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(10);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: 'foo'
                },
                {
                    startTime: 100,
                    endTime: 300,
                    duration: 200,
                    description: ''
                },
                {
                    startTime: 300,
                    endTime: 300,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(11);
        });

        test("while STOPPED", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            stopwatch.stop();
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.slice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.slice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });

        test("STOPPED duration is ignored", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            stopwatch.stop();
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(3);

            getTime.mockReturnValue(1300);
            stopwatch.stop();
            expect(getTime).toHaveBeenCalledTimes(4);

            getTime.mockReturnValue(1400);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 200,
                duration: 200,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 200,
                    duration: 200,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);

            expect(stopwatch.slice()).toEqual({
                startTime: 0,
                endTime: 200,
                duration: 200,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(4);

            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 200,
                endTime: 200,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 200,
                    duration: 200,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 200,
                    duration: 200,
                    description: ''
                },
                {
                    startTime: 200,
                    endTime: 200,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);
        });        
    });

    describe("start(true)", () => {
        test("while IDLE", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start(true);
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);

            expect(stopwatch.getState()).toBe(Stopwatch.State.RUNNING);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(true);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(1);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);
        });

        test("resets all data and continues running", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            stopwatch.stop();
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(3);

            getTime.mockReturnValue(1300);
            stopwatch.slice();
            expect(getTime).toHaveBeenCalledTimes(4);

            getTime.mockReturnValue(1400);
            stopwatch.start(true);
            expect(getTime).toHaveBeenCalledTimes(5);

            getTime.mockReturnValue(1500);

            expect(stopwatch.getState()).toBe(Stopwatch.State.RUNNING);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(true);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(5);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(6);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 100,
                duration: 100,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(8);
        });
    });

    describe("stop(true)", () => {
        test("while IDLE", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            expect(stopwatch.stop(true)).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);

            getTime.mockReturnValue(1100);

            expect(stopwatch.getState()).toBe(Stopwatch.State.IDLE);
            expect(stopwatch.isIdle()).toBe(true);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(false);
            expect(getTime).toHaveBeenCalledTimes(0);

            expect(stopwatch.getTime()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 0,
                endTime: 0,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedSlices()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 0,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(0);
        });

        test("while RUNNING", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            expect(stopwatch.stop(true)).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getState()).toBe(Stopwatch.State.STOPPED);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(true);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,                   
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });

        test("while STOPPED", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            stopwatch.start();
            expect(getTime).toHaveBeenCalledTimes(1);

            getTime.mockReturnValue(1100);
            expect(stopwatch.stop()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1200);
            expect(stopwatch.stop(true)).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getState()).toBe(Stopwatch.State.STOPPED);
            expect(stopwatch.isIdle()).toBe(false);
            expect(stopwatch.isRunning()).toBe(false);
            expect(stopwatch.isStopped()).toBe(true);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getTime()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingSlice()).toEqual({
                startTime: 100,
                endTime: 100,
                duration: 0,
                description: ''
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingSlices()).toEqual([
                {
                    startTime: 0,
                    endTime: 100,
                    duration: 100,
                    description: ''
                },
                {
                    startTime: 100,
                    endTime: 100,
                    duration: 0,
                    description: ''
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });
    });
});
