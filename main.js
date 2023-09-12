const Module = require("module");

const originalLoad = Module._load;

Module._load = function (mod, parent) {
    if (parent?.id?.indexOf("betterdiscord") > -1) {
        switch (mod) {
            case "fs": {
                const exports = originalLoad.apply(this, arguments);

                // BD would uninject kernel because it tries to clean up an "old injection method" but it would clean up
                // kernel injection so I just trick it. :clueless:
                return new Proxy(exports, {
                    get(t, k) {
                        if (k === "existsSync") return (...args) => {
                            if (args[0].endsWith("app")) return;

                            return t[k].apply(t, args);
                        }

                        return t[k];
                    }
                });
            };
        }
    }

    return originalLoad.apply(this, arguments);
}

queueMicrotask(() => require("./betterdiscord.asar"));
