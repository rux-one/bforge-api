import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { Cookie, CookieJar } from 'tough-cookie';
import { ConfigService } from '@nestjs/config';

interface SessionCookies {
    'connect.sid': string;
    'loginstate': string;
    'indent_type': string;
    'space_units': string;
    'keymap': string;
}

interface DocData {
    str: string;
    revision: number;
}

@Injectable()
export class HedgedocService {
    private server: string;

    constructor(private config: ConfigService) {
        this.server = this.config.get<string>('HEDGEDOC_SERVER', 'localhost:3001');
        console.log('Using HedgeDoc server:', this.server);
    }

    private async getSessionCookie(): Promise<SessionCookies> {
        const url = `https://${this.server}`;
        console.log('Fetching session cookie from:', url);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
            }
            
            const cookies = response.headers.get('set-cookie') || '';
            console.log('Received cookies:', cookies);
            const cookieJar = new CookieJar();
            
            cookies.split(',').forEach(cookie => {
                try {
                    const parsedCookie = Cookie.parse(cookie);
                    if (parsedCookie) {
                        cookieJar.setCookieSync(parsedCookie, url);
                    }
                } catch (e) {
                    console.error('Error parsing cookie:', e);
                }
            });

            const connectSid = cookieJar.getCookiesSync(url)
                .find(cookie => cookie.key === 'connect.sid')?.value || '';

            return {
                'connect.sid': connectSid,
                'loginstate': 'true',
                'indent_type': 'space',
                'space_units': '4',
                'keymap': 'vim'
            };
        } catch (error) {
            console.error('Failed to get session cookie:', error);
            throw error;
        }
    }

    private decodeSocketIoMessage(message: string): [string | null, any[] | null] {
        console.log('Decoding message:', message);
        if (message.startsWith('42')) {
            try {
                const data = JSON.parse(message.slice(2));
                console.log('Parsed message data:', JSON.stringify(data, null, 2));
                return [data[0], data.slice(1)];
            } catch (error) {
                console.error('Error parsing message:', error);
                return [null, null];
            }
        }
        return [null, null];
    }

    private async sendPing(ws: WebSocket, interval: number): Promise<void> {
        const timer = setInterval(() => {
            try {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('2');
                    console.log('Ping sent');
                } else {
                    clearInterval(timer);
                }
            } catch (error) {
                clearInterval(timer);
                if (error instanceof Error && error.message.includes('CLOSED')) {
                    return;
                }
            }
        }, interval);

        return new Promise((resolve) => {
            ws.on('close', () => {
                clearInterval(timer);
                resolve();
            });
        });
    }

    async overrideNote(
        noteId: string,
        newContent: string,
        cookies?: SessionCookies
    ): Promise<void> {
        const websocketUrl = `wss://${this.server}/socket.io/?noteId=${noteId}&EIO=3&transport=websocket`;
        
        if (!cookies) {
            cookies = await this.getSessionCookie();
        }

        console.log('Connecting with cookies:', cookies);

        const headers = {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Origin': `https://${this.server}`,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Cookie': Object.entries(cookies)
                .filter(([_, v]) => v)
                .map(([k, v]) => `${k}=${v}`)
                .join('; '),
        };

        return new Promise((resolve, reject) => {
            console.log('Opening WebSocket connection to:', websocketUrl);
            const ws = new WebSocket(websocketUrl, { 
                headers,
                perMessageDeflate: false
            });

            const startTime = Date.now();
            const TIMEOUT = 15000;
            let operationSent = false;

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });

            ws.on('open', () => {
                console.log('WebSocket connection established');
                console.log('Starting Socket.IO handshake...');
                ws.send('40');
            });

            ws.on('message', async (data: Buffer) => {
                const message = data.toString();
                console.log('Received message:', message);

                if (Date.now() - startTime > TIMEOUT) {
                    console.log('Timeout waiting for operation acknowledgment');
                    ws.close();
                    reject(new Error('Timeout waiting for operation acknowledgment'));
                    return;
                }

                if (message.startsWith('40')) {
                    // Handshake acknowledgment, do nothing
                } else if (message.startsWith('0')) {
                    try {
                        const handshakeData = JSON.parse(message.slice(1));
                        console.log('Handshake data:', handshakeData);

                        console.log('Sending probe message...');
                        ws.send('2probe');

                        if (handshakeData.pingInterval) {
                            console.log('Setting up ping interval...');
                            this.sendPing(ws, handshakeData.pingInterval / 1000);
                        }

                        const joinMessage = `42["join","${noteId}"]`;
                        console.log('Sending join message:', joinMessage);
                        ws.send(joinMessage);
                    } catch (error) {
                        console.error('Error handling handshake:', error);
                        reject(error);
                    }
                } else {
                    const [type, messageData] = this.decodeSocketIoMessage(message);
                    console.log('Decoded message:', { type, messageData });
                    
                    if (type === 'error') {
                        console.log('Received error:', messageData);
                        ws.close();
                        reject(new Error(`Server error: ${messageData}`));
                        return;
                    }

                    if (type === 'doc' && messageData && !operationSent) {
                        operationSent = true;
                        const docData = messageData[0] as DocData;
                        console.log(`Current revision: ${docData.revision}`);
                        console.log(`Current content length: ${docData.str.length}`);
                        console.log(`Current content: "${docData.str}"`);

                        if (docData.str.length > 0) {
                            // First send selection message to select all content
                            const selectionMessage = `42${JSON.stringify(["selection", {"ranges":[{"anchor":0,"head":docData.str.length}]}])}`;
                            console.log('Sending selection message:', selectionMessage);
                            ws.send(selectionMessage);

                            // Send cursor activity message
                            const cursorMessage = `42${JSON.stringify(["cursor activity", {"line":0,"ch":docData.str.length,"sticky":null}])}`;
                            console.log('Sending cursor message:', cursorMessage);
                            ws.send(cursorMessage);

                            // First delete all content, then add new content
                            const deleteOperation = ["operation", docData.revision, [-docData.str.length], {"ranges":[{"anchor":0,"head":0}]}];
                            const deleteMessage = `42${JSON.stringify(deleteOperation)}`;
                            console.log('Sending delete operation:', deleteMessage);
                            ws.send(deleteMessage);

                            // Wait a bit before sending the insert operation
                            await new Promise(resolve => setTimeout(resolve, 100));

                            // Then insert new content
                            const insertOperation = ["operation", docData.revision + 1, [newContent], {"ranges":[{"anchor":newContent.length,"head":newContent.length}]}];
                            const insertMessage = `42${JSON.stringify(insertOperation)}`;
                            console.log('Sending insert operation:', insertMessage);
                            ws.send(insertMessage);
                        } else {
                            // For empty notes, just insert the new content
                            const insertOperation = ["operation", docData.revision, [newContent], {"ranges":[{"anchor":newContent.length,"head":newContent.length}]}];
                            const insertMessage = `42${JSON.stringify(insertOperation)}`;
                            console.log('Sending insert operation:', insertMessage);
                            ws.send(insertMessage);
                        }
                        
                        setTimeout(() => {
                            ws.close();
                            resolve();
                        }, 1000);
                    }
                }
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    }

    async appendNote(
        noteId: string,
        newContent: string,
        cookies?: SessionCookies
    ): Promise<void> {
        const websocketUrl = `wss://${this.server}/socket.io/?noteId=${noteId}&EIO=3&transport=websocket`;
        
        if (!cookies) {
            cookies = await this.getSessionCookie();
        }

        console.log('Connecting with cookies:', cookies);

        const headers = {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Origin': `https://${this.server}`,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Cookie': Object.entries(cookies)
                .filter(([_, v]) => v)
                .map(([k, v]) => `${k}=${v}`)
                .join('; '),
        };

        return new Promise((resolve, reject) => {
            console.log('Opening WebSocket connection to:', websocketUrl);
            const ws = new WebSocket(websocketUrl, { 
                headers,
                perMessageDeflate: false
            });

            const startTime = Date.now();
            const TIMEOUT = 15000;
            let operationSent = false;

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });

            ws.on('open', () => {
                console.log('WebSocket connection established');
                console.log('Starting Socket.IO handshake...');
                ws.send('40');
            });

            ws.on('message', async (data: Buffer) => {
                const message = data.toString();
                console.log('Received message:', message);

                if (Date.now() - startTime > TIMEOUT) {
                    console.log('Timeout waiting for operation acknowledgment');
                    ws.close();
                    reject(new Error('Timeout waiting for operation acknowledgment'));
                    return;
                }

                if (message.startsWith('40')) {
                    // Handshake acknowledgment, do nothing
                } else if (message.startsWith('0')) {
                    try {
                        const handshakeData = JSON.parse(message.slice(1));
                        console.log('Handshake data:', handshakeData);

                        console.log('Sending probe message...');
                        ws.send('2probe');

                        if (handshakeData.pingInterval) {
                            console.log('Setting up ping interval...');
                            this.sendPing(ws, handshakeData.pingInterval / 1000);
                        }

                        const joinMessage = `42["join","${noteId}"]`;
                        console.log('Sending join message:', joinMessage);
                        ws.send(joinMessage);
                    } catch (error) {
                        console.error('Error handling handshake:', error);
                        reject(error);
                    }
                } else {
                    const [type, messageData] = this.decodeSocketIoMessage(message);
                    console.log('Decoded message:', { type, messageData });
                    
                    if (type === 'error') {
                        console.log('Received error:', messageData);
                        ws.close();
                        reject(new Error(`Server error: ${messageData}`));
                        return;
                    }

                    if (type === 'doc' && messageData && !operationSent) {
                        operationSent = true;
                        const docData = messageData[0] as DocData;
                        const retainLength = docData.str.length;
                        console.log(`Current revision: ${docData.revision}`);
                        console.log(`Current content length: ${retainLength}`);
                        console.log(`Current content: "${docData.str}"`);

                        // Send the append operation with the correct format
                        let appendOperation;
                        if (retainLength === 0) {
                            appendOperation = ["operation", docData.revision, [newContent], {"ranges":[{"anchor":newContent.length,"head":newContent.length}]}];
                        } else {
                            appendOperation = ["operation", docData.revision, [retainLength, newContent], {"ranges":[{"anchor":retainLength + newContent.length,"head":retainLength + newContent.length}]}];
                        }
                        const appendMessage = `42${JSON.stringify(appendOperation)}`;
                        console.log('Sending append operation:', appendMessage);
                        ws.send(appendMessage);
                        
                        setTimeout(() => {
                            ws.close();
                            resolve();
                        }, 1000);
                    }
                }
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    }

    getHello(): string {
        return 'Hello, Hedgedoc!';
    }
}