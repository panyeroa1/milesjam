


import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Analyser} from './analyser';

@customElement('gdm-live-audio-visuals-2d')
export class GdmLiveAudioVisuals2D extends LitElement {
  private inputAnalyser: Analyser;
  private outputAnalyser: Analyser;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number;

  @property()
  set outputNode(node: AudioNode) {
    this.outputAnalyser = new Analyser(node);
  }

  @property()
  set inputNode(node: AudioNode) {
    this.inputAnalyser = new Analyser(node);
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    canvas {
      width: 100%;
      height: 100%;
    }
  `;

  protected firstUpdated() {
    // Access canvas via renderRoot (standard Lit approach) to resolve the shadowRoot property error.
    this.canvas = (this.renderRoot as HTMLElement).querySelector('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.draw();
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private draw() {
    this.animationId = requestAnimationFrame(() => this.draw());
    if (!this.ctx) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    this.ctx.clearRect(0, 0, width, height);

    let inputLevel = 0;
    let outputLevel = 0;

    if (this.inputAnalyser) {
      this.inputAnalyser.update();
      // Average frequency data normalized 0-1
      inputLevel = this.inputAnalyser.data.reduce((a, b) => a + b, 0) / this.inputAnalyser.data.length / 255;
    }
    if (this.outputAnalyser) {
      this.outputAnalyser.update();
      // Average frequency data normalized 0-1
      outputLevel = this.outputAnalyser.data.reduce((a, b) => a + b, 0) / this.outputAnalyser.data.length / 255;
    }

    const combinedLevel = Math.max(inputLevel, outputLevel);
    const baseRadius = 60;
    const reactiveRadius = baseRadius + (combinedLevel * 30);

    // Draw Expanding/Pulsating Rings
    for (let i = 1; i <= 5; i++) {
      // Radius expands with audio levels + a smooth sine wave "breathing"
      const time = Date.now() * 0.002;
      const breathe = Math.sin(time + i * 0.8) * (5 + inputLevel * 15);
      const ringRadius = reactiveRadius + (i * 35) + (outputLevel * 20) + breathe;
      
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      
      // Opacity reacts to input (mic) levels to give visual feedback to the user speaking
      const baseAlpha = 0.08 / i;
      const reactiveAlpha = inputLevel * 0.4;
      const alpha = Math.min(0.6, baseAlpha + reactiveAlpha);
      
      this.ctx.strokeStyle = `rgba(197, 210, 153, ${alpha})`;
      // Line width grows slightly with output (Miles' voice)
      this.ctx.lineWidth = 1 + (outputLevel * 3);
      this.ctx.stroke();
    }

    // Draw solid secondary rings for structure
    for (let i = 1; i <= 2; i++) {
      const ringRadius = reactiveRadius + (i * 12);
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(197, 210, 153, ${0.03 + outputLevel * 0.05})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Draw Solid Center Circle (The "Core")
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, reactiveRadius, 0, Math.PI * 2);
    // Core gets brighter/warmer based on output
    this.ctx.fillStyle = '#c5d299';
    this.ctx.fill();
    
    // Optional glow effect on the center
    if (combinedLevel > 0.1) {
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, reactiveRadius + 5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(197, 210, 153, ${combinedLevel * 0.2})`;
        this.ctx.fill();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.animationId);
  }

  render() {
    return html`<canvas></canvas>`;
  }
}