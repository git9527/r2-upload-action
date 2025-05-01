import { FileMap } from "./types.js";
import fs from 'fs';
import glob from 'glob'

export const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    if (bytes == 0) {
        return "0 Bytes"
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024))

    if (i == 0) {
        return bytes + " " + sizes[i]
    }

    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]
};

export const getFileList = (globSource: string): FileMap => {
    return glob.sync(globSource, {}).filter(file => fs.statSync(file).isFile());
};

export const getFileSizeMB = (file: string) => {
    return fs.statSync(file).size / (1024 * 1024);
}

export const formatFileSize = (file: string) => {
    return formatBytes(fs.statSync(file).size);
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In R2, fixed size for each chunk is required.
// FYR: https://community.cloudflare.com/t/all-non-trailing-parts-must-have-the-same-length/552190
export async function* readFixedChunkSize(file: string, chunkSize: number): AsyncIterable<Buffer> {
    const stream = fs.createReadStream(file);
    let buffer = Buffer.alloc(0);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);

        while (buffer.length >= chunkSize) {
            yield buffer.subarray(0, chunkSize);
            buffer = buffer.subarray(chunkSize);
        }
    }

    if (buffer.length > 0) {
        yield buffer;
    }
};
