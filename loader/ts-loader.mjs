import {registerHooks} from "node:module";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier[0] === "." && !specifier.endsWith('.ts')) {
            return nextResolve(specifier + ".ts", context);
        }
        return nextResolve(specifier, context);
    }
});