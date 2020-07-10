const puppeteer = require('puppeteer')
const server = require("./server");
const {promises: {writeFile}} = require("fs");


async function writePDF(page) {
    let pdfFile = "./CV.pdf";

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

async function writeHTML(page) {
    let htmlFile = "./index.html";

    const html = await page.content();

    await writeFile(htmlFile, html);

    console.log(`Written ${htmlFile}`);
}

async function main() {
    
    let [url, serve] = await server();

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle0'});

    await writePDF(page);

    await writeHTML(page);

    await browser.close();

    serve.close();
}

main().catch(console.error);