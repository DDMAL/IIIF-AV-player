# IIIF Audio/Video Player
IIIF A/V Player (WIP)

## Usage
- Clone the repo:
    ```bash
    git clone https://github.com/DDMAL/IIIF-AV-player.git
    ```
- Install node modules with `npm install`.
- Run `gulp` or `npm start` to build and start the server.
- The server will now be running at `localhost:9001`. 

## Making Changes
If you wish to alter any of the `src` code, make sure to rebundle with `gulp develop:build`. 

It might be ideal to keep a server running in the background with `gulp develop:server &`, instead of running `gulp` every time you make a change.

## Integration
To integrate this player with an independent webpage, include the following 3 scripts in your `index.html`:
```javascript
<script src="static/verovio-toolkit.js"></script>
<script src="static/player.js"></script>
<script src="static/main.js"></script>
```
The player and score will be created in a `.main` container div, which will be appended to the `body` once the script is run. If you wish to alter where the player is generated, edit `static/main.js`:
```javascript
// line 41, change body to your target
$('body').append(main);
```