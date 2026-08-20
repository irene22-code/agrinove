import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    console.log("Starting Puppeteer test...");
    
    // Use an existing user
    const mockUserId = '6890c2ce-f93e-445c-b068-1f1b19cae853';
    const token = jwt.sign({ sub: mockUserId, role: 'farmer', user_metadata: { role: 'farmer' } }, JWT_SECRET);

    // Clean up first just in case
    await supabase.from('ai_conversations').delete().eq('id', '66666666-7777-8888-9999-000000000000');

    // Create a mock conversation directly via service role
    console.log("Seeding mock conversation...");
    const { data: conv, error: convErr } = await supabase.from('ai_conversations').insert({
        id: '66666666-7777-8888-9999-000000000000',
        user_id: mockUserId,
        title: 'Puppeteer Test Conversation'
    }).select().single();

    if (convErr) {
        console.error("Failed to seed conversation:", convErr);
        return;
    }
    console.log("Seeded conversation:", conv.id);

    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
        headless: "new"
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    try {
        console.log("Navigating to app...");
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        await page.evaluate((t, uid) => {
            localStorage.setItem('agromart_token', t);
            localStorage.setItem('agromart_user', JSON.stringify({ id: uid, full_name: 'Test User' }));
        }, token, mockUserId);
        
        console.log("Reloading with mock auth...");
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        // Wait for AI button
        await page.waitForSelector('.fixed.bottom-6.right-6.z-50', { timeout: 10000 });
        console.log("Clicking AI button to open chat...");
        
        // Ensure button is clickable by evaluating click
        await page.evaluate(() => {
            document.querySelector('.fixed.bottom-6.right-6.z-50').click();
        });
        
        // Wait for History button
        await page.waitForSelector('button[title="History"]', { timeout: 5000 });
        console.log("Clicking History button...");
        await page.evaluate(() => {
            document.querySelector('button[title="History"]').click();
        });
        
        // Wait for the mock conversation to appear
        console.log("Waiting for conversation list...");
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Puppeteer Test Conversation');
        }, { timeout: 5000 });
        
        console.log("Conversation found! Clicking Delete button...");
        
        // Auto-accept the confirmation dialog
        page.on('dialog', async dialog => {
            console.log("Dialog intercepted:", dialog.message());
            await dialog.accept();
        });
        
        // Actually execute the click inside the browser context on that specific button
        await page.evaluate((convId) => {
            const buttons = Array.from(document.querySelectorAll('button[title="Delete this conversation"]'));
            // Find the one corresponding to our test conversation
            buttons[0].click();
        }, conv.id);
        
        console.log("Waiting for network activity...");
        await new Promise(r => setTimeout(r, 3000));
        
        // Check if the conversation is still in the DB
        const { data: checkConv, error: checkErr } = await supabase.from('ai_conversations').select('id').eq('id', conv.id).maybeSingle();
        if (checkConv) {
            console.log("❌ FAILURE: Conversation still exists in database:", checkConv);
        } else {
            console.log("✅ SUCCESS: Conversation deleted from database.");
        }
        
    } catch (e) {
        console.log("Puppeteer error:", e);
    } finally {
        await browser.close();
    }
})();
