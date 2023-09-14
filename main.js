const {readFileSync, existsSync} = require("fs");
const Module = require("module");
const path = require("path");

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

const original = Module._extensions[".js"];

Module._extensions[".js"] = function (mod, filename) {
    if (mod.id?.includes?.("betterdiscord.asar") && mod.id.endsWith("injector.js")) {
        let content = readFileSync(filename, "utf8");
        if (existsSync(path.resolve(__dirname, "..", "vencord-loader"))) {
            content = content.replace(`"appSettings"`, "appSettingsUndefined");
        }
        
        content = content.replace("static patchBrowserWindow(){", "static patchBrowserWindow(){return;");
        content = content.replace("Z:()=>BetterDiscord", "Z:()=>(global.BetterDiscordInstance = BetterDiscord)");

        return mod._compile(content, filename);
    }

    return original.apply(this, arguments);
}

require("electron").app.on("browser-window-created", (_, win) => {
    BetterDiscordInstance?.setup(win);
});

queueMicrotask(() => require("./betterdiscord.asar"));

