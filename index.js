import { PdfReader } from 'pdfreader';
import { readdirSync, stat } from 'fs';
import { createArrayCsvWriter } from 'csv-writer';

const dir = process.argv[2];

const reader = new PdfReader();

const fileContents = await Promise.all(readdirSync(dir)
    .filter(f => f.endsWith('.pdf'))
    .map(f => `${dir}/${f}`)
    .map(async file => {
        const lines = [];
        return new Promise((resolve) => {
            reader.parseFileItems(file, (err, item) => {
                if (err) console.error("error:", err);
                else if (!item) resolve(lines);
                else if (item.text) {
                    lines.push(item.text);
                }
            });
        });
    }));

const importantContent = fileContents.map(content => [content[content[13] === 'Kvitto' ? 14 : 15], content[12], content[3], content[5]]);

await createArrayCsvWriter({
    header: ['date', 'tickettype', 'net', 'vat'],
    path: `${dir}/output.csv`,
    fieldDelimiter: ';'
}).writeRecords(importantContent);