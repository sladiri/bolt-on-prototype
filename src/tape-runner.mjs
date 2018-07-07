// Use .mjs files and babel, adapted from https://github.com/wavded/babel-tape-runner

import "babel-register";
import "babel-polyfill";
import path from "path";
import glob from "glob";

(async () => {
    await process.argv.slice(2).map(group => {
        return new Promise((resolve, reject) => {
            glob(group, (er, files) => {
                if (er) reject(er);
                resolve(
                    Promise.all(
                        files.map(file =>
                            import(path.resolve(process.cwd(), file)),
                        ),
                    ),
                );
            });
        });
    });
})().catch(error => {
    console.error(error);
});
