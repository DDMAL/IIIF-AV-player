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
To integrate this player with a separate webpage, add the following to your `index.html`:
```javascript
<script>
    let url = "URL of manifest you want to display";
    let manifestObject = new ManifestObject(url); 
    manifestObject.fetchManifest(function() {
        // callback once manifest is fetched, do whatever post-fetch actions you want
        // perhaps displaying the manifestObject
    });
</script>
```
The player will target the `.main` class, so it's easiest to setup a `<div class="main">` wherever you want to render the player. This can be changed to whatever you like:
```javascript
// player.js
$('.main').append(container); // line 20
```