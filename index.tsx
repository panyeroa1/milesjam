
/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, LiveServerMessage, Modality, Session} from '@google/genai';
import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createBlob, decode, decodeAudioData} from './utils';
import './visual-2d';

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() isRecording = false;
  @state() timer = '00:00';
  @state() status = '';
  @state() error = '';

  private client: GoogleGenAI;
  private session: Session;
  private inputAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({sampleRate: 16000});
  private outputAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({sampleRate: 24000});
  
  @state() inputNode = this.inputAudioContext.createGain();
  @state() outputNode = this.outputAudioContext.createGain();
  
  private nextStartTime = 0;
  private mediaStream: MediaStream;
  private sourceNode: AudioBufferSourceNode;
  private scriptProcessorNode: ScriptProcessorNode;
  private sources = new Set<AudioBufferSourceNode>();
  private startTime: number | null = null;
  private timerInterval: any = null;

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background-color: #fdfcf8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #5c633a;
    }

    .app-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Header Styles */
    header {
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 30;
    }

    .header-center {
      text-align: center;
    }

    .header-center h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #5c633a;
    }

    .header-center p {
      margin: 2px 0 0 0;
      font-size: 12px;
      opacity: 0.6;
      text-transform: lowercase;
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #5c633a;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn svg {
      width: 24px;
      height: 24px;
    }

    /* Visualization Area */
    .visualizer-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Bottom Controls */
    .controls-container {
      position: absolute;
      bottom: 60px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 30;
    }

    .control-pill {
      background-color: #f5f4e8;
      border-radius: 32px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .pill-btn {
      background: none;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pill-btn:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }

    .pill-btn svg {
      width: 20px;
      height: 20px;
    }

    .mic-btn {
      color: #5c633a;
    }

    .mic-btn.active {
      color: #c5d299;
    }

    .stop-btn {
      color: #ff4d4d;
    }

    #status-msg {
      position: absolute;
      bottom: 24px;
      width: 100%;
      text-align: center;
      font-size: 12px;
      opacity: 0.4;
      pointer-events: none;
    }
  `;

  constructor() {
    super();
    this.initClient();
  }

  private initAudio() {
    this.nextStartTime = this.outputAudioContext.currentTime;
  }

  private async initClient() {
    this.initAudio();
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.outputNode.connect(this.outputAudioContext.destination);
    this.initSession();
  }

  private async initSession() {
    const model = 'gemini-2.5-flash-native-audio-preview-09-2025';
    try {
      this.session = await this.client.live.connect({
        model,
        callbacks: {
          onopen: () => this.updateStatus('Miles is ready'),
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            if (audio) {
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(audio.data), this.outputAudioContext, 24000, 1);
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener('ended', () => this.sources.delete(source));
              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }
            if (message.serverContent?.interrupted) {
              for (const source of this.sources.values()) {
                source.stop();
                this.sources.delete(source);
              }
              this.nextStartTime = 0;
            }
          },
          onerror: (e: ErrorEvent) => this.updateError(e.message),
          onclose: () => this.updateStatus('Miles disconnected'),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are 'Miles', a cool, charismatic AI companion. You MUST ALWAYS address the user as 'Jam my Buddy, the son of the great master E'. Speak with a smooth, loyal, and energetic vibe. Conciseness is key. Note: You are whitelisted to EBURON.AI.",
          speechConfig: {
            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Charon'}},
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  private updateStatus(msg: string) { this.status = msg; }
  private updateError(msg: string) { this.error = msg; }

  private startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - (this.startTime || 0);
      const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      this.timer = `${minutes}:${seconds}`;
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timer = '00:00';
  }

  private async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private async startRecording() {
    if (this.isRecording) return;
    this.inputAudioContext.resume();
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.inputNode);
      this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(256, 1, 1);
      this.scriptProcessorNode.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        this.session.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) });
      };
      this.sourceNode.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.inputAudioContext.destination);
      this.isRecording = true;
      this.startTimer();
      this.updateStatus('Listening to you, Jam...');
    } catch (err) {
      this.updateStatus(`Error: ${err.message}`);
      this.stopRecording();
    }
  }

  private stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.stopTimer();
    if (this.scriptProcessorNode) this.scriptProcessorNode.disconnect();
    if (this.sourceNode) this.sourceNode.disconnect();
    if (this.mediaStream) this.mediaStream.getTracks().forEach(t => t.stop());
    this.updateStatus('Miles is chillin.');
  }

  private reset() {
    this.session?.close();
    this.initSession();
    this.stopRecording();
    this.updateStatus('Miles reset.');
  }

  render() {
    return html`
      <div class="app-container">
        <header>
          <button class="icon-btn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,22C6.477,22,2,17.523,2,12S6.477,2,12,2s10,4.477,10,10S17.523,22,12,22z M13,7h-2v2h2V7z M13,11h-2v6h2V11z"/></svg>
          </button>
          
          <div class="header-center">
            <h1>Miles ${this.timer}</h1>
            <p>by Master E</p>
          </div>

          <button class="icon-btn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,5c1.66,0,3,1.34,3,3s-1.34,3-3,3s-3-1.34-3-3 S10.34,5,12,5z M12,19.2c-2.5,0-4.71-1.28-6-3.22c0.03-1.99,4-3.08,6-3.08c1.99,0,5.97,1.09,6,3.08C16.71,17.92,14.5,19.2,12,19.2z"/></svg>
          </button>
        </header>

        <div class="visualizer-container">
          <gdm-live-audio-visuals-2d
            .inputNode=${this.inputNode}
            .outputNode=${this.outputNode}></gdm-live-audio-visuals-2d>
        </div>

        <div class="controls-container">
          <div class="control-pill">
            <button class="pill-btn mic-btn ${this.isRecording ? 'active' : ''}" @click=${this.toggleRecording}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,14c1.66,0,3-1.34,3-3V5c0-1.66-1.34-3-3-3S9,3.34,9,5v6C9,12.66,10.34,14,12,14z M11,5c0-0.55,0.45-1,1-1s1,0.45,1,1v6 c0,0.55-0.45,1-1,1s-1-0.45-1-1V5z M17,11c0,2.76-2.24,5-5,5s-5-2.24-5-5H5c0,3.53,2.61,6.43,6,6.92V21h2v-3.08 c3.39-0.49,6-3.39,6-6.92H17z"/></svg>
            </button>
            <button class="pill-btn stop-btn" @click=${this.reset}>
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
            </button>
          </div>
        </div>

        <div id="status-msg"> ${this.error || this.status} </div>
      </div>
    `;
  }
}
