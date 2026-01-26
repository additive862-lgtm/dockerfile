import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import * as cheerio from 'cheerio';
import juice from 'juice';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { auth } from '@/auth';
import { r2, R2_BUCKET, R2_PUBLIC_DOMAIN } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const execAsync = promisify(exec);

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'hwp-images');
const LOG_FILE = '/tmp/hwp-process.log'; // Use /tmp for more reliable writes

async function debugLog(msg: string) {
    console.log(msg);
    const timestamp = new Date().toISOString();
    try {
        await fs.appendFile(LOG_FILE, `[${timestamp}] ${msg}\n`, 'utf8');
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
}

export async function POST(request: Request) {
    const jobId = uuidv4();
    const tempDir = path.join('/tmp', 'dudol-hwp', jobId); // Use /tmp for conversion tasks

    try {
        await fs.ensureDir(UPLOAD_DIR);
        await fs.ensureDir(tempDir);
        await debugLog(`--- HWP Job Started: ${jobId} ---`);
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            await debugLog('Error: No file in formData');
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        await debugLog(`Job Started: ${jobId} for file: ${file.name}`);
        await fs.ensureDir(tempDir);

        const inputFileName = `input${path.extname(file.name)}`;
        const inputFilePath = path.join(tempDir, inputFileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(inputFilePath, buffer);
        await debugLog(`Input file written: ${inputFilePath}`);

        const outputFolderName = 'result';
        const outputDirPath = path.join(tempDir, outputFolderName);

        const HWP5HTML_EXEC = process.platform === 'win32'
            ? 'C:\\Users\\mugen\\AppData\\Roaming\\Python\\Python314\\Scripts\\hwp5html.exe'
            : 'hwp5html';

        // Check if command exists (Linux only check for now)
        if (process.platform !== 'win32') {
            try {
                await execAsync('which hwp5html');
            } catch (e) {
                await debugLog('Error: hwp5html command not found in PATH');
                return NextResponse.json({
                    error: '변환 도구가 설치되지 않았습니다.',
                    details: 'hwp5html not found in PATH'
                }, { status: 404 });
            }
        }

        // Command construction
        const command = `"${HWP5HTML_EXEC}" --output "${outputFolderName}" "${inputFileName}"`;

        await debugLog(`Executing hwp5html: ${command}`);
        try {
            const { stdout, stderr } = await execAsync(command, { cwd: tempDir, timeout: 60000 }); // 60s timeout
            if (stdout) await debugLog(`hwp5html stdout: ${stdout.substring(0, 500)}...`);
            if (stderr) await debugLog(`hwp5html stderr: ${stderr}`);
            await debugLog('hwp5html completed successfully');
        } catch (error: any) {
            await debugLog(`hwp5html failed: ${error.message}`);
            return NextResponse.json({
                error: 'HWP 변환 실패',
                details: error.message,
                stdout: error.stdout,
                stderr: error.stderr
            }, { status: 500 });
        }

        let htmlFilePath = path.join(outputDirPath, 'index.html');
        if (!await fs.pathExists(htmlFilePath)) {
            const files = await fs.readdir(outputDirPath).catch(() => []);
            const htmlFile = files.find(f => f.endsWith('.html') || f.endsWith('.xhtml'));
            if (htmlFile) {
                htmlFilePath = path.join(outputDirPath, htmlFile);
            } else {
                await debugLog('Error: Converted HTML not found');
                return NextResponse.json({ error: '변환된 HTML 파일을 찾을 수 없습니다.' }, { status: 500 });
            }
        }

        let htmlContent = await fs.readFile(htmlFilePath, 'utf-8');
        await fs.writeFile(path.join(process.cwd(), 'hwp-raw.html'), htmlContent, 'utf8');
        await debugLog('Raw HTML saved');

        const cssFilePath = path.join(outputDirPath, 'styles.css');
        let cssContent = '';
        if (await fs.pathExists(cssFilePath)) {
            cssContent = await fs.readFile(cssFilePath, 'utf8');
            await debugLog(`styles.css found (${cssContent.length} bytes)`);
            await fs.writeFile(path.join(process.cwd(), 'hwp-styles.css'), cssContent, 'utf8');
        } else {
            await debugLog('styles.css NOT found');
        }

        // 5. Juice Inlining
        await debugLog('Starting Juice inlining...');
        let htmlToInliner = htmlContent;
        if (cssContent) {
            const $inliner = cheerio.load(htmlContent);
            $inliner('head').append(`<style>${cssContent}</style>`);
            htmlToInliner = $inliner.html();
        }

        const inlinedHtml = juice(htmlToInliner);
        await debugLog(`Juice completed. Inlined length: ${inlinedHtml.length}`);

        const $ = cheerio.load(inlinedHtml);



        // 6. Image Processing
        const bindataDir = path.join(outputDirPath, 'bindata');
        const images = $('img');
        await debugLog(`Processing ${images.length} images...`);

        const imageElements = images.toArray();
        for (let i = 0; i < imageElements.length; i++) {
            const el = imageElements[i];
            const originalSrc = $(el).attr('src');
            if (originalSrc) {
                const cleanSrc = originalSrc.replace(/\\/g, '/');
                const rawFileName = path.basename(cleanSrc);
                const ext = path.extname(rawFileName);
                const safeExt = ext.toLowerCase() === '.tmp' ? '.jpg' : ext;
                const newFileName = `${jobId}_${i}${safeExt}`;

                // R2 Key
                const r2Key = `uploads/hwp-images/${newFileName}`;

                // Construct Public URL
                const publicUrl = R2_PUBLIC_DOMAIN
                    ? `${R2_PUBLIC_DOMAIN}/${r2Key}`
                    : `/uploads/hwp-images/${newFileName}`; // Fallback if no domain

                let sourcePath = path.join(bindataDir, rawFileName);
                if (!await fs.pathExists(sourcePath)) sourcePath = path.join(outputDirPath, rawFileName);
                if (!await fs.pathExists(sourcePath)) sourcePath = path.join(tempDir, rawFileName);

                if (await fs.pathExists(sourcePath)) {
                    // Read file
                    const fileBuffer = await fs.readFile(sourcePath);

                    // Upload to R2
                    try {
                        await r2.send(new PutObjectCommand({
                            Bucket: R2_BUCKET,
                            Key: r2Key,
                            Body: fileBuffer,
                            ContentType: `image/${safeExt.replace('.', '')}`
                        }));
                        await debugLog(`Image uploaded to R2: ${newFileName}`);

                        // Update Source
                        $(el).attr('src', publicUrl);
                    } catch (uploadErr: any) {
                        await debugLog(`Failed to upload image to R2: ${uploadErr.message}`);
                    }
                } else {
                    await debugLog(`Warning: Image NOT FOUND: ${rawFileName}`);
                }
            }
        }

        // 7. Recursive Style Extraction
        await debugLog('Starting Recursive Style Extraction...');
        $('head').remove();
        $('meta').remove();

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

        await debugLog('Style Extraction completed');

        const finalHtml = $('body').html() || $.html();
        await fs.writeFile(path.join(process.cwd(), 'hwp-debug.html'), finalHtml, 'utf8');
        await debugLog('Final HTML saved to debug file');

        // Cleanup
        await fs.remove(tempDir);
        await debugLog('Temp directory removed');

        return NextResponse.json({ success: true, html: finalHtml });

    } catch (err: any) {
        await debugLog(`FATAL ERROR: ${err.message}\n${err.stack}`);
        return NextResponse.json({
            error: '처리 중 치명적 오류 발생',
            details: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
