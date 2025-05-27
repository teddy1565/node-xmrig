const fs = require("fs");
const path = require("path");
const os = require("os");

const source_file_dir_path = path.join(__dirname, "..", "./src");
const source_file_dir_scan_result = fs.readdirSync(source_file_dir_path).map((x) => path.join(source_file_dir_path, x));

/**
 *
 * @param { Array<string> } file_path
 * @returns { Array<string | Array<string> | Array<Array<string>>> }
 */
function scan_source_file(file_path) {
    const result = file_path.filter((x) => {
        if (x.match(/(\.cc)$|(\.cpp)$|(\.c)$/) === null) {
            try {
                const file_stat = fs.statSync(path.join(x));
                if (file_stat.isDirectory() === true) {
                    return true;
                }
            } catch (error) {
                console.log(error);
            }
            return false;
        }
        return true;
    }).map((x) => {
        try {
            const file_stat = fs.statSync(path.join(x));
            if (file_stat.isDirectory() === true) {
                const source_file_dir = fs.readdirSync(x).map((m) => path.join(x, m));
                return scan_source_file(source_file_dir);
            }
        } catch (error) {
            console.log(error);
        }
        return x;
    });
    return result;
}

/**
 *
 * @param { Array<string> } file_path
 * @returns { Array<string | Array<string> | Array<Array<string>>> }
 */
function scan_header_file(file_path) {
    const result = file_path.filter((x) => {
        if (x.match(/(\.h)$/) === null) {
            try {
                const file_stat = fs.statSync(path.join(x));
                if (file_stat.isDirectory() === true) {
                    return true;
                }
            } catch (error) {
                console.log(error);
            }
            return false;
        }
        return true;
    }).map((x) => {
        try {
            const file_stat = fs.statSync(path.join(x));
            if (file_stat.isDirectory() === true) {
                const source_file_dir = fs.readdirSync(x).map((m) => path.join(x, m));
                return scan_source_file(source_file_dir);
            }
        } catch (error) {
            console.log(error);
        }
        return x;
    });
    return result;
}



const scan_source_result = scan_source_file(source_file_dir_scan_result).flat(Infinity);
const scan_header_result = scan_header_file(source_file_dir_scan_result).flat(Infinity);

fs.appendFileSync("./source_file_output.txt", JSON.stringify(scan_source_result, null, 4));
fs.appendFileSync("./header_file_output.txt", JSON.stringify(scan_header_result, null, 4));