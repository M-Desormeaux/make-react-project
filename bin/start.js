#!/usr/bin/env node

/*
        ENTIRE SCRIPT POSSIBLE THANKS TO   Nikhil Kumaran   !
        His script is the base for this one, and I just hope 
        it helps people get started with their projects even faster.

        Check out his GitHub:   https://github.com/Nikhil-Kumaran
*/

const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const { exec } = require("child_process");

const packageJson = require("../package.json");

const scripts = `"dev": "parcel serve public/index.html --port 8080 --log-level verbose --open",\n\t"build": "parcel build public/index.html  --dist-dir build"`;

const getDeps = (deps) =>
    Object.entries(deps)
        .map((dep) => `${dep[0]}@${dep[1]}`)
        .toString()
        .replace(/,/g, " ")
        .replace(/^/g, "")
        .replace(/fs-extra[^\s]+/g, "");

console.log("Initializing project..");

// create folder and initialize npm
exec(
    `mkdir ${process.argv[2]} && cd ${process.argv[2]} && npm init -f`,
    (initErr, initStdout, initStderr) => {
        if (initErr) {
            console.error(`! Error Detected !:
    ${initErr}`);
            return;
        }
        const packageJSON = `${process.argv[2]}/package.json`;
        // replace the default scripts
        fs.readFile(packageJSON, (err, file) => {
            if (err) throw err;
            const data = file
                .toString()
                .replace(
                    '"test": "echo \\"Error: no test specified\\" && exit 1"',
                    scripts
                );
            // .replace('"keywords": []', babel);
            fs.writeFile(packageJSON, data, (err2) => err2 || true);
        });

        // npm will remove the .gitignore file when the package is installed, therefore it cannot be copied, locally and needs to be downloaded. Use your raw .gitignore once you pushed your code to GitHub.
        https.get(
            "https://raw.githubusercontent.com/M-Desormeaux/make-react-project/core/.gitignore",
            (res) => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", (data) => {
                    body += data;
                });
                res.on("end", () => {
                    fs.writeFile(
                        `${process.argv[2]}/.gitignore`,
                        body,
                        { encoding: "utf-8" },
                        (err) => {
                            if (err) throw err;
                        }
                    );
                });
            }
        );

        console.log("npm init -- done\n");

        // installing dependencies
        console.log("Installing deps -- it might take a few minutes..");
        const devDeps = getDeps(packageJson.devDependencies);
        const deps = getDeps(packageJson.dependencies);
        console.log(devDeps, " ", deps);

        exec(
            `cd ${process.argv[2]} && git init && node -v && yarn add ${deps}`,
            (npmErr, npmStdout, npmStderr) => {
                if (npmErr) {
                    console.error(`Some error while installing dependencies
      ${npmErr}`);
                    return;
                }
                console.log(npmStdout);
                console.log("Dependencies installed");

                console.log("Copying project architecture ... ");
                // copy additional source files
                fs.copy(
                    path.join(__dirname, "../src"),
                    `${process.argv[2]}/src`
                );
                fs.copy(
                    path.join(__dirname, "../public"),
                    `${process.argv[2]}/public`
                )
                    .then(() =>
                        console.log(
                            `All done!\n\nYour project is now ready\n\nUse the below command to run the app.\n\ncd ${process.argv[2]}\nyarn dev`
                        )
                    )
                    .catch((err) => console.error(err));
            }
        );
    }
);
