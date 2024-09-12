import { LaserPointerOptions } from "@excalidraw/laser-pointer";
import { AnimatedTrail, Trail } from "./animated-trail";
import { AnimationFrameHandler } from "./animation-frame-handler";
import type App from "./components/App";
import { SocketId } from "./types";
import { easeOut } from "./utils";
import { getClientColor } from "./clients";
import {
  importUsernameFromLocalStorage
} from "../../excalidraw-app/data/localStorage";
import socket from "./sockioExport";

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export class LaserTrails implements Trail {
  public localTrail: AnimatedTrail;
  private collabTrails = new Map<SocketId, AnimatedTrail>();
  private container?: SVGSVGElement;
  // trailsData: { [key: number]: TrailPoint[] } = {};
  constructor(
    private animationFrameHandler: AnimationFrameHandler,
    private app: App,
    private frameCounter: number = 0,
    private username = importUsernameFromLocalStorage(),
  ) {
    this.animationFrameHandler.register(this, this.onFrame.bind(this));

    this.localTrail = new AnimatedTrail(animationFrameHandler, app, {
      ...this.getTrailOptions(),
      fill: () => "blue",
    });
  }

  private getTrailOptions() {
    return {
      simplify: 0,
      streamline: 0.4,
      sizeMapping: (c) => {
        const DECAY_TIME = 1000;
        const DECAY_LENGTH = 50;
        const t = Math.max(
          0,
          1 - (performance.now() - c.pressure) / DECAY_TIME,
        );
        const l =
          (DECAY_LENGTH -
            Math.min(DECAY_LENGTH, c.totalLength - c.currentIndex)) /
          DECAY_LENGTH;

        return Math.min(easeOut(l), easeOut(t));
      },
    } as Partial<LaserPointerOptions>;
  }

  startPath(x: number, y: number): void {
    this.localTrail.startPath(x, y);
  }

  addPointToPath(x: number, y: number): void {
    this.localTrail.addPointToPath(x, y);
  }

  endPath(): void {
    this.localTrail.endPath();
  }

  start(container: SVGSVGElement) {
    this.container = container;

    this.animationFrameHandler.start(this);
    this.localTrail.start(container);
  }

  stop() {
    this.animationFrameHandler.stop(this);
    this.localTrail.stop();
  }

  // extractTrailPoints(laserPointer) {
  //   return laserPointer.originalPoints.map(([x, y, timestamp]) => ({ x, y, timestamp }));
  // }
  getCurrentTimeComponents() {
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数

    return [hours, minutes, seconds, milliseconds];
  }
  onFrame() {
    // console.log(this.app.state.collaborators.entries());
    this.updateCollabTrails();
    if (this.localTrail.hasCurrentTrail) {
      if (!this.frameCounter) this.frameCounter = 0;
      this.frameCounter++;
      const currentPoint = this.localTrail.currentTrail?.lastPoint.slice(0,2);
      if (this.frameCounter % 3 === 0) {
          let timeComponents = [0,0,0,0];
          if (this.frameCounter % 3 === 0) { 
            timeComponents = this.getCurrentTimeComponents();
          }
          // Data to be sent
          const data = {
              fileName: this.username + "_Laser",
              timeComponent: timeComponents,
              currentPoint: currentPoint
          };
  
          // Send data to the backend
          socket.emit('trailData', data);
          // console.log(data.currentPoint)
      }
    }
   

    // // 确保当前时间的键存在
    // if (!this.trailsData[currentTime]) {
    //   this.trailsData[currentTime] = [];
    // }
    // if (this.localTrail.hasCurrentTrail) {
    //   console.log(importUsernameFromLocalStorage());

    //   // this.trailsData[currentTime].push(...this.extractTrailPoints(this.localTrail.currentTrail));
    // }
    // this.collabTrails.forEach(trail => {
    //   if (trail.hasCurrentTrail) {
    //     // this.trailsData[currentTime].push(...this.extractTrailPoints(trail.currentTrail));
    //     // console.log(this.app.state.collaborators.entries());
    //   }
    // });

    // console.log(this.localTrail);
    // console.log(this.collabTrails);
    // console.log(this.localTrail.currentTrail);
  }

  private updateCollabTrails() {
    if (!this.container || this.app.state.collaborators.size === 0) {
      return;
    }
    // console.log(this.app.state.collaborators.entries());
    for (const [key, collabolator] of this.app.state.collaborators.entries()) {
      let trail!: AnimatedTrail;
      // console.log(key, collabolator);
      if (!this.collabTrails.has(key)) {
        trail = new AnimatedTrail(this.animationFrameHandler, this.app, {
          ...this.getTrailOptions(),
          fill: () => getClientColor(key),
            // fill: () => "yellow",
        });
        trail.start(this.container);

        this.collabTrails.set(key, trail);
      } else {
        trail = this.collabTrails.get(key)!;
      }

      if (collabolator.pointer && collabolator.pointer.tool === "laser") {
        if (collabolator.button === "down" && !trail.hasCurrentTrail) {
          trail.startPath(collabolator.pointer.x, collabolator.pointer.y);
        }

        if (
          collabolator.button === "down" &&
          trail.hasCurrentTrail &&
          !trail.hasLastPoint(collabolator.pointer.x, collabolator.pointer.y)
        ) {
          trail.addPointToPath(collabolator.pointer.x, collabolator.pointer.y);
        }

        if (collabolator.button === "up" && trail.hasCurrentTrail) {
          trail.addPointToPath(collabolator.pointer.x, collabolator.pointer.y);
          trail.endPath();
        }
      }
    }

    for (const key of this.collabTrails.keys()) {
      if (!this.app.state.collaborators.has(key)) {
        const trail = this.collabTrails.get(key)!;
        trail.stop();
        this.collabTrails.delete(key);
      }
    }
  }
}
