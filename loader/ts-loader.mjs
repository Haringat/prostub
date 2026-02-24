import {registerHooks} from "node:module";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier[0] === "." && specifier.endsWith(".js")) {
            return nextResolve(specifier.substring(0, specifier.length - 2) + "ts", context);
        }
        return nextResolve(specifier, context);
    }
});
