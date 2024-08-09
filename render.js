const puppeteer = require('puppeteer')
const server = require("./server");
const {mkdir, readdir, stat, writeFile, copyFile} = require("fs/promises");
const { join } = require('path');


async function copyRecursive(source, destination) {
    let stats = await stat(source);
    if (stats.isDirectory()) {
        await mkdir(destination).catch(e => e.code != "EEXIST" ? Promise.reject(e) : null);
        for (let item of await readdir(source)) {
            await copyRecursive(join(source, item), join(destination, item));
        }
    } else {
        await copyFile(source, destination);
    }
}


async function writePDF(page, pdfFile) {

    const pdf = await page.pdf({
        format: 'A4',
        margin: {
            top: '1cm',
            right: '1cm',
            bottom: '1cm',
            left: '1cm',
        },
        printBackground: true,
    });

    await writeFile(pdfFile, pdf);

    console.log(`Written ${pdfFile}`);
}

async function writeHTML(page, htmlFile) {

    const html = await page.content();

    await writeFile(htmlFile, html);

    console.log(`Written ${htmlFile}`);
}

async function main() {

    let [url, serve] = await server(60166);

    console.log("Copying files")

    let source = join(__dirname, "src");

    let destination = join(__dirname, "build");

    await copyRecursive(source, destination);
    console.log("Starting browser");
    const browser = await puppeteer.launch({headless: true});
    const cvPage = await browser.newPage();
    console.log("Opening source");
    await cvPage.goto(url);
    await cvPage.waitForSelector(".cv");
    console.log("Render PDF");
    await writePDF(cvPage, join(destination, "CV.pdf"));
    console.log("Render HTML");
    await writeHTML(cvPage, join(destination, "index.html"));
    console.log("Render plain HTML");
    const plainPage = await browser.newPage();
    await plainPage.goto(url + "plain.html");
    await plainPage.waitForSelector(".cv");

    await writeHTML(plainPage, join(destination, "plain.html"));

    await browser.close();

    serve.close();
}

main().catch(console.error);