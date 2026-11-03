#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git', 'node_modules', 'coverage', 'dist', 'build']);
const files = [];

function collect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name.startsWith('.') && entry.name !== '.github') continue;
        if (ignored.has(entry.name)) continue;

        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            collect(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
}

collect(root);
files.sort();

let failed = 0;
for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], {
        cwd: root,
        encoding: 'utf8',
    });

    if (result.status === 0) {
        process.stdout.write(`✓ ${path.relative(root, file)}\\n`);
    } else {
        failed += 1;
        process.stderr.write(`✗ ${path.relative(root, file)}\\n`);
        if (result.stderr) process.stderr.write(result.stderr);
        if (result.error) process.stderr.write(`${result.error.message}\\n`);
    }
}

process.stdout.write(`\\nChecked ${files.length} JavaScript file(s); ${failed} failed.\\n`);
process.exitCode = failed === 0 ? 0 : 1;
