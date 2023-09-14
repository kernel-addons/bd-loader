const {readFileSync, existsSync} = require("fs");
const path = require("path");

if (existsSync(path.resolve(__dirname, "..", "ultra"))) {
    const Module = require("module");
    const original = Module._extensions[".js"];

    Module._extensions[".js"] = function (mod, filename) {
        if (mod.id?.includes?.("betterdiscord.asar") && mod.id.endsWith("preload.js")) {
            let content = readFileSync(filename, "utf8");
            content = content.replace(`webpackChunkdiscord_app`, "webpackChunkdiscord__app");

            return mod._compile(content, filename);
        }

        return original.apply(this, arguments);
    }
}

queueMicrotask(() => require("./betterdiscord.asar/preload.js"));
