import { suite, test } from "node:test";
import { PropertyVerification } from "./property-verification.js";

await suite("PropertyVerification", async () => {
    await suite("wasReadNTimes", async () => {
        await test("should not throw if the property was read the expected number of times", t => {
            t.plan(1);

            const propertyVerification = new PropertyVerification({ assignments: [], reads: [{ time: 0n, value: 0 }] });

            t.assert.doesNotThrow(() => {
                propertyVerification.wasReadNTimes(1);
            });
        });
        await test("should throw if the property was read a different number of times", t => {
            t.plan(1);

            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            t.assert.throws(() => {
                propertyVerification.wasReadNTimes(1);
            });
        });
        await test("should not throw if the property was expected to be read zero times and was never read", t => {
            t.plan(1);

            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            t.assert.doesNotThrow(() => {
                propertyVerification.wasReadNTimes(0);
            });
        });
    });
    await suite("wasRead", async () => {
        await suite("no verifier", async () => {
            await test("should not throw if the property was read at least once", t => {
                t.plan(1);

                const propertyVerification = new PropertyVerification({
                    assignments: [],
                    reads: [{ time: 0n, value: 0 }]
                });

                t.assert.doesNotThrow(() => {
                    propertyVerification.wasRead();
                });
            });
            await test("should throw if the property was never read", t => {
                t.plan(1);

                const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

                t.assert.throws(() => {
                    propertyVerification.wasRead();
                }, { message: "Expected read count to pass predicate. (was read 0 times)" });
            });
        });
        await suite("with verifier", async () => {
            await test("should not throw if read count matches verifier", t => {
                t.plan(1);

                const propertyVerification = new PropertyVerification({
                    assignments: [],
                    reads: [{ time: 0n, value: 0 }, { time: 0n, value: 0 }]
                });

                t.assert.doesNotThrow(() => {
                    propertyVerification.wasRead(it => it === 2);
                });
            });
            await test("should throw if read count does not match verifier", t => {
                t.plan(1);

                const propertyVerification = new PropertyVerification({
                    assignments: [],
                    reads: [{ time: 0n, value: 0 }, { time: 0n, value: 0 }]
                });

                t.assert.throws(() => {
                    propertyVerification.wasRead(it => it === 1);
                });
            });
        });
    });
    await suite("wasNotAssigned", async () => {
        await test("should not throw if the property was never assigned", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                propertyVerification.wasNotAssigned();
            });
        });
        await test("should throw if the property was assigned at least once", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 1 }],
                reads: []
            });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.wasNotAssigned();
            });
        });
    });
    await suite("wasNotRead", async () => {
        await test("should not throw if the property was never read", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                propertyVerification.wasNotRead();
            });
        });
        await test("should throw if the property was read at least once", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [],
                reads: [{ time: 0n, value: 1 }]
            });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.wasNotRead();
            });
        });
    });
    await suite("wasAssignedNTimes", async () => {
        await test("should not throw if the property was assigned the expected number of times", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 1 }],
                reads: []
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                propertyVerification.wasAssignedNTimes(1);
            });
        });
        await test("should throw if the property was assigned a different number of times", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.wasAssignedNTimes(1);
            });
        });
        await test("should not throw if the property was expected to be assigned zero times and was never assigned", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                propertyVerification.wasAssignedNTimes(0);
            });
        });
    });
    await suite("wasAssigned", async () => {
        await test("should not throw if the property was assigned at least once", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 1 }],
                reads: []
            });

            // Then
            t.assert.doesNotThrow(() => {
                // When
                propertyVerification.wasAssigned();
            });
        });
        await test("should throw if the property was never assigned", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.wasAssigned();
            });
        });
    });
    await suite("nthAssignment", async () => {
        await test("should return the correct assignment verification for the given index", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 10 }, { time: 1n, newValue: 20 }],
                reads: []
            });

            // When
            const result = propertyVerification.nthAssignment(1);

            // Then
            t.assert.doesNotThrow(() => result.hasValue(it => it === 20));
        });
        await test("should throw if there were fewer assignments than the given index", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 10 }],
                reads: []
            });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.nthAssignment(5);
            }, { message: "Assignment index 5 is out of bounds. There are only 1 assignments." });
        });
    });
    await suite("firstAssignment", async () => {
        await test("should return the first assignment verification", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 10 }, { time: 1n, newValue: 20 }],
                reads: []
            });

            // When
            const result = propertyVerification.firstAssignment();

            // Then
            t.assert.doesNotThrow(() => result.hasValue(it => it === 10));
        });
        await test("should throw if there were no assignments", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.firstAssignment();
            });
        });
    });
    await suite("lastAssignment", async () => {
        await test("should return the last assignment verification", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [{ time: 0n, newValue: 10 }, { time: 1n, newValue: 20 }],
                reads: []
            });

            // When
            const result = propertyVerification.lastAssignment();

            // Then
            t.assert.doesNotThrow(() => result.hasValue(it => it === 20));
        });
        await test("should throw if there were no assignments", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.lastAssignment();
            });
        });
    });
    await suite("firstRead", async () => {
        await test("should return the first read verification", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [],
                reads: [{ time: 0n, value: 10 }, { time: 1n, value: 20 }]
            });

            // When
            const result = propertyVerification.firstRead();

            // Then
            t.assert.doesNotThrow(() => result.hadValue(it => it === 10));
        });
        await test("should throw if there were no reads", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.firstRead();
            });
        });
    });
    await suite("lastRead", async () => {
        await test("should return the last read verification", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [],
                reads: [{ time: 0n, value: 10 }, { time: 1n, value: 20 }]
            });

            // When
            const result = propertyVerification.lastRead();

            // Then
            t.assert.doesNotThrow(() => result.hadValue(it => it === 20));
        });
        await test("should throw if there were no reads", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({ assignments: [], reads: [] });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.lastRead();
            });
        });
    });
    await suite("nthRead", async () => {
        await test("should return the correct read verification for the given index", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [],
                reads: [{ time: 0n, value: 10 }, { time: 1n, value: 20 }]
            });

            // When
            const result = propertyVerification.nthRead(1);

            // Then
            t.assert.doesNotThrow(() => result.hadValue(it => it === 20));
        });
        await test("should throw if there were fewer reads than the given index", t => {
            t.plan(1);

            // Given
            const propertyVerification = new PropertyVerification({
                assignments: [],
                reads: [{ time: 0n, value: 10 }]
            });

            // Then
            t.assert.throws(() => {
                // When
                propertyVerification.nthRead(5);
            }, { message: "Read index 5 is out of bounds. There are only 1 reads." });
        });
    });
});
