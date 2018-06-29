import { Stopwatch } from "../src";

/**
 * Non-readonly version of a Stopwatch.Lap.
 * Used to typecast a Lap to try mutating its properties at runtime.
 */
type MutableLap = { -readonly [P in keyof Stopwatch.Lap]: Stopwatch.Lap[P] };

describe("Stopwatch", () => {
    test("Uses Date.now by default", (done) => {
        const stopwatch = new Stopwatch();
        stopwatch.start();

        setTimeout(() => {
            const duration = stopwatch.getDuration();
            expect(duration).toBeGreaterThanOrEqual(249);
            done();
        }, 250);
    });

    describe("Laps are read-only", () => {
        test("while IDLE", () => {
            const stopwatch = new Stopwatch();

            const pendingLap = stopwatch.getPendingLap();
            const recordedLap = stopwatch.lap();
            const completeAndPendingLaps = stopwatch.getCompletedAndPendingLaps();

            expect(() => {
                (pendingLap as MutableLap).lapDuration = 42;
            }).toThrow();

            expect(() => {
                (recordedLap as MutableLap).lapDuration = 42;
            }).toThrow();

            expect(() => {
                (completeAndPendingLaps[0] as MutableLap).lapDuration = 42;
            }).toThrow();
        });

        test("while RUNNING", () => {
            const stopwatch = new Stopwatch();
            stopwatch.start();

            const pendingLap = stopwatch.getPendingLap();
            const recordedLap = stopwatch.lap();
            const completeAndPendingLaps = stopwatch.getCompletedAndPendingLaps();

            expect(() => {
                (pendingLap as MutableLap).lapDuration = 42;
            }).toThrow();

            expect(() => {
                (recordedLap as MutableLap).lapDuration = 42;
            }).toThrow();

            expect(() => {
                (completeAndPendingLaps[0] as MutableLap).lapDuration = 42;
            }).toThrow();
        });

        test("while STOPPED", () => {
            const stopwatch = new Stopwatch();
            stopwatch.start();
            stopwatch.stop();

            const pendingLap = stopwatch.getPendingLap();
            const recordedLap = stopwatch.lap();
            const completeAndPendingLaps = stopwatch.getCompletedAndPendingLaps();

            expect(() => {
                (pendingLap as MutableLap).lapDuration = 42;
            }).toThrow();

            expect(() => {
                (recordedLap as MutableLap).lapDuration = 42;
            }).toThrow();

            expect(() => {
                (completeAndPendingLaps[0] as MutableLap).lapDuration = 42;
            }).toThrow();
        });
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
            expect(stopwatch.getDuration()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
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

            expect(stopwatch.getDuration()).toBe(200);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 200,
                lapDuration: 200
            });
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 200,
                    lapDuration: 200
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

            expect(stopwatch.getDuration()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(1);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(1);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(1);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
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

            expect(stopwatch.getDuration()).toBe(200);
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 200,
                lapDuration: 200
            });
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 200,
                    lapDuration: 200
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

            expect(stopwatch.getDuration()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });
    });

    describe("Basic lap usage", () => {
        test("while IDLE", () => {
            const getTime = jest.fn();
            const stopwatch = new Stopwatch(getTime);

            getTime.mockReturnValue(1000);
            expect(stopwatch.lap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
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

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(3);

            expect(stopwatch.lap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(4);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(5);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(6);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 300,
                lapDuration: 200
            });
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 300,
                    lapDuration: 200
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(8);

            expect(stopwatch.lap()).toEqual({
                totalDuration: 300,
                lapDuration: 200
            });
            expect(getTime).toHaveBeenCalledTimes(9);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 300,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(10);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 300,
                    lapDuration: 200
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(10);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 300,
                    lapDuration: 200
                },
                {
                    totalDuration: 300,
                    lapDuration: 0
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

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.lap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);

            getTime.mockReturnValue(1300);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.lap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
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

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 200,
                lapDuration: 200
            });
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 200,
                    lapDuration: 200
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);

            expect(stopwatch.lap()).toEqual({
                totalDuration: 200,
                lapDuration: 200
            });
            expect(getTime).toHaveBeenCalledTimes(4);

            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 200,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 200,
                    lapDuration: 200
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(4);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 200,
                    lapDuration: 200
                },
                {
                    totalDuration: 200,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(3);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
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
            stopwatch.lap();
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(6);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 100
            });
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(7);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
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

            expect(stopwatch.getDuration()).toBe(0);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 0,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedLaps()).toEqual([]);
            expect(getTime).toHaveBeenCalledTimes(0);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 0,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
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

            expect(stopwatch.getDuration()).toBe(100);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getPendingLap()).toEqual({
                totalDuration: 100,
                lapDuration: 0
            });
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
            expect(stopwatch.getCompletedAndPendingLaps()).toEqual([
                {
                    totalDuration: 100,
                    lapDuration: 100
                },
                {
                    totalDuration: 100,
                    lapDuration: 0
                }
            ]);
            expect(getTime).toHaveBeenCalledTimes(2);
        });
    });
});
