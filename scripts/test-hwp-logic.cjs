const cheerio = require('cheerio');
const juice = require('juice');

const testHtml = `
<html>
<head>
<style>
    .bold { font-weight: bold; }
    .color-blue { color: blue; }
    .underline { text-decoration: underline; }
    .combined { font-weight: bold; color: red; text-decoration: underline; }
</style>
</head>
<body>
    <p class="color-blue">This should be blue.</p>
    <p class="bold">This should be bold.</p>
    <p class="underline">This should be underlined.</p>
    <div class="combined">This is all three.</div>
    <p style="font-weight: 700; color: #ff00ff;">Inline test with 700.</p>
    <div>
        <span style="color: green">Nested 
            <span style="font-weight: bold">bold</span> 
        green</span>
    </div>
</body>
</html>
`;

console.log('--- Original HTML ---');
console.log(testHtml);

// 1. Juice
const inlined = juice(testHtml);
console.log('\n--- After Juice ---');
const $ = cheerio.load(inlined);

// 2. Logic from route.ts
$('[style]').each((i, el) => {
    const $el = $(el);
    const style = $el.attr('style') || '';

    const isBold = /font-weight\s*:\s*(700|bold)/i.test(style);
    const isUnderline = /text-decoration\s*:\s*underline/i.test(style);
    const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
    const color = colorMatch ? colorMatch[1].trim() : null;

    const contents = $el.contents();
    if (contents.length === 0) return;

    let wrapper = contents;

    if (isBold) wrapper = $('<strong>').append(wrapper);
    if (isUnderline) wrapper = $('<u>').append(wrapper);
    if (color) wrapper = $('<span>').attr('style', `color: ${color}`).append(wrapper);

    $el.empty().append(wrapper);
    $el.removeAttr('style');
});

$('head').remove();
$('meta').remove();

console.log('\n--- Final HTML (Body Contents) ---');
console.log($('body').html());
