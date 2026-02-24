import { suite, test, todo } from "node:test";
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
        await todo("should not throw if the property was never assigned");
        await todo("should throw if the property was assigned at least once");
    });
    await suite("wasNotRead", async () => {
        await todo("should not throw if the property was never read");
        await todo("should throw if the property was read at least once");
    });
    await suite("wasAssignedNTimes", async () => {
        await todo("should not throw if the property was assigned the expected number of times");
        await todo("should throw if the property was assigned a different number of times");
        await todo("should not throw if the property was expected to be assigned zero times and was never assigned");
    });
    await suite("wasAssigned", async () => {
        await todo("should not throw if the property was assigned at least once");
        await todo("should throw if the property was never assigned");
    });
    await suite("nthAssignment", async () => {
        await todo("should return the correct assignment verification for the given index");
        await todo("should throw if there were fewer assignments than the given index");
    });
    await suite("firstAssignment", async () => {
        await todo("should return the first assignment verification");
        await todo("should throw if there were no assignments");
    });
    await suite("lastAssignment", async () => {
        await todo("should return the last assignment verification");
        await todo("should throw if there were no assignments");
    });
    await suite("firstRead", async () => {
        await todo("should return the first read verification");
        await todo("should throw if there were no reads");
    });
    await suite("lastRead", async () => {
        await todo("should return the last read verification");
        await todo("should throw if there were no reads");
    });
    await suite("nthRead", async () => {
        await todo("should return the correct read verification for the given index");
        await todo("should throw if there were fewer reads than the given index");
    });
});
