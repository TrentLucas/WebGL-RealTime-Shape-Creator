/*
 * File: MyGame.js 
 * This is the logic of our game. For now, this is very simple.
 */
"use strict";  // Operate in Strict mode such that variables must be declared before used!

// Accessing engine internal is not ideal, 
//      this must be resolved! (later)
import * as loop from "../engine/core/loop.js";

// Engine stuff
import engine from "../engine/index.js";

class MyGame  {
    constructor() {
        // variables for the squares
        this.cursor = null;        // these are the Renderable objects

        
        // The camera to view the scene
        this.mCamera = null;
    }

    init() {    
        // Step A: set up the cameras
        this.mCamera = new engine.Camera(
            vec2.fromValues(20, 60),   // position of the camera
            100,                        // width of camera
            [0, 0, 640, 480]         // viewport (orgX, orgY, width, height)
        );
        this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
        // sets the background to gray

        // Step  B: Create the cursor
        this.cursor = new engine.Renderable();
        this.cursor.setColor([1, 0, 0, 1]);

        // square object variables
        this.storedSquares = [];
        this.numSquaresPerSpace = [];

        // delete/time variables
        this.dClickedTime = 0;
        this.deleteTimes = [];
        this.deleteTimesFirstEle = 0;
        this.deleteMode = false;

        // total number of generated squares on screen
        this.totNumObjects = 0;

        // Step  C: Initialize the white Renderable object: centered, 5x5, rotated
        this.cursor.getXform().setPosition(20, 60);
        this.cursor.getXform().setSize(1, 1);
    }


    // This is the draw function, make sure to setup proper drawing environment, and more
    // importantly, make sure to _NOT_ change any state.
    draw() {
        // Step A: clear the canvas
        engine.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

        // Step  B: Activate the drawing Camera
        this.mCamera.setViewAndCameraMatrix();

        // Step C: generated squares from user input
        if (this.numSquaresPerSpace.length > 0) {
            for (let i = 0; i < this.storedSquares.length; i++) {
                this.storedSquares[i].draw(this.mCamera);
            }
        }

        // Step  D: Activate the white shader to draw
        this.cursor.draw(this.mCamera);

        // Step E: object count and deleteMode display call
        gUpdateObject(this.totNumObjects, this.deleteMode);

    }

    // The update function, updates the application state. Make sure to _NOT_ draw
    // anything from this function!
    update() {
        let cursorXform = this.cursor.getXform();
        let deltaX = 0.5;
        let deltaY = 0.5;

        // Step  A: test for cursor movement up
        if (engine.input.isKeyPressed(engine.input.keys.Up)) {
            if (cursorXform.getYPos() < 97.5) { // this is the top-bound of the window
                cursorXform.incYPosBy(deltaY);
            }
            
        }

        // Step  B: test for cursor movement down
        if (engine.input.isKeyPressed(engine.input.keys.Down)) {
            if (cursorXform.getYPos() > 22.5) { // this is the down-bound of the window
                cursorXform.incYPosBy(-deltaY);
            }
        }

        // Step  C: test for cursor movement left
        if (engine.input.isKeyPressed(engine.input.keys.Left)) {
            if (cursorXform.getXPos() > -30) { // this is the left-bound of the window
                cursorXform.incXPosBy(-deltaX);
            }
        }

        // Step  D: test for cursor movement right
        if (engine.input.isKeyPressed(engine.input.keys.Right)) {
            if (cursorXform.getXPos() < 70) { // this is the right-bound of the window
                cursorXform.incXPosBy(deltaX);
            }
        }

        // Step E: test for space key
        if (engine.input.isKeyClicked(engine.input.keys.Space)) {
            let n = 10 + Math.random() * 10;

            // creating n number of random squares
            for (let i = 0; i < n; i++) {
                this.totNumObjects++;

                // creating new random square
                this.newSquare = new engine.Renderable();
                this.newSquare.setColor([Math.random(), Math.random(), Math.random(), 1]);
                this.newSquare.getXform().setPosition(cursorXform.getXPos() + (10 *(Math.random() - 0.5)), cursorXform.getYPos() + (10 *(Math.random() - 0.5)));
                let m = 1 + Math.random() * 5;
                this.newSquare.getXform().setSize(m, m);
                let newXform = this.newSquare.getXform();
                newXform.setRotationInDegree(Math.random() * 360);

                // storing square in array
                this.storedSquares.push(this.newSquare);
            }

            // store the times of each space click
            this.numSquaresPerSpace.push(n);

            if (this.deleteTimes.length > 0) {
                this.deleteTimes.push(loop.mCurrentTime - this.deleteTimesFirstEle);
            }
            if (this.deleteTimes.length == 0) {
                this.deleteTimes.push(0);
                this.deleteTimesFirstEle = loop.mCurrentTime;
            }

        }

        // Step F: test for d key
        if (engine.input.isKeyClicked(engine.input.keys.D)) {
            this.dClickedTime = loop.mCurrentTime;
            this.deleteMode = true;
        }

        // deleteMode: constantly checking
        if (this.deleteMode == true) {

            // exit condition
            if (this.deleteTimes.length == 0) {
                this.deleteTimes = [];
                this.deleteMode = false;
            }

            // interation condition
            if (this.deleteTimes.length > 0) {
                if (loop.mCurrentTime >= this.dClickedTime + this.deleteTimes[0]) {
                    for (let j = 0; j < this.numSquaresPerSpace[0]; j++) {
                        this.storedSquares.splice(0, 1);
                        this.totNumObjects--;
                    }

                    this.numSquaresPerSpace.splice(0,1);
                    this.deleteTimes.splice(0,1);
                }
            }

        }

    }
}

window.onload = function () {
    engine.init("GLCanvas");

    let myGame = new MyGame();    
    
    // new begins the game 
    loop.start(myGame);
}