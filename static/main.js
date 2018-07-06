/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/manifest-object.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/manifest-object.js":
/*!********************************!*\
  !*** ./src/manifest-object.js ***!
  \********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _parse_iiif_manifest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse-iiif-manifest */ \"./src/parse-iiif-manifest.js\");\n\n\nclass ManifestObject \n{\n    constructor (url) \n    {\n        this.manifest;\n        this.url = url;\n    }\n\n    fetchManifest (callback)\n    {\n        fetch(this.url, {\n            headers: {\n                \"Accept\": \"application/json\"\n            }\n        }).then( (response) =>\n        {\n            if (!response.ok)\n            {\n                alert('Could not get manifest! Make sure you provide a proper link.');\n            }\n            return response.json();\n        }).then( (responseData) =>\n        {\n            this.setManifest(responseData, callback);\n        });\n    }\n\n    setManifest (responseData, callback)\n    {\n        this.manifest = Object(_parse_iiif_manifest__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(responseData);\n\n        callback(this.manifest);\n    }\n}\n\n(function (global)\n{\n    global.ManifestObject = global.ManifestObject || ManifestObject;\n}) (window);\n\n//# sourceURL=webpack:///./src/manifest-object.js?");

/***/ }),

/***/ "./src/parse-iiif-manifest.js":
/*!************************************!*\
  !*** ./src/parse-iiif-manifest.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return parseIIIFManifest; });\nconst getMaxZoomLevel = (width, height) =>\n{\n    const largestDimension = Math.max(width, height);\n    return Math.ceil(Math.log((largestDimension + 1) / (256 + 1)) / Math.log(2));\n};\n\nconst incorporateZoom = (imageDimension, zoomDifference) => imageDimension / (Math.pow(2, zoomDifference));\n\nconst getOtherImageData = (otherImages, lowestMaxZoom) =>\n{\n    return otherImages.map( (itm) =>\n    {\n        const w = itm.width;\n        const h = itm.height;\n        const info = parseImageInfo(itm);\n        const url = info.url.slice(-1) !== '/' ? info.url + '/' : info.url;  // append trailing slash to url if it's not there.\n\n        const dims = new Array(lowestMaxZoom + 1);\n        for (let j = 0; j < lowestMaxZoom + 1; j++)\n        {\n            dims[j] = {\n                h: Math.floor(incorporateZoom(h, lowestMaxZoom - j)),\n                w: Math.floor(incorporateZoom(w, lowestMaxZoom - j))\n            };\n        }\n\n        return {\n            f: info.url,\n            url: url,\n            il: itm.label || \"\",\n            d: dims\n        };\n    });\n};\n\n/**\n * Parses an IIIF Presentation API Manifest and converts it into a Diva.js-format object\n * (See https://github.com/DDMAL/diva.js/wiki/Development-notes#data-received-through-ajax-request)\n *\n * @param {Object} manifest - an object that represents a valid IIIF manifest\n * @returns {Object} divaServiceBlock - the data needed by Diva to show a view of a single document\n */\nfunction parseIIIFManifest (manifest)\n{\n    var canvases;\n    var sequence;\n    if (manifest.type === \"Canvas\") {\n        canvases = manifest;\n    } else {\n        sequence = manifest.sequences[0] || manifest.sequences;\n        canvases = sequence.canvases;\n    }\n    const numCanvases = canvases.length;\n\n    const pages = new Array(canvases.length);\n\n    let thisCanvas, thisResource, thisMedia, otherImages, context, url, info, imageAPIVersion, width, height, maxZoom, canvas, label, imageLabel, zoomDimensions, widthAtCurrentZoomLevel, heightAtCurrentZoomLevel;\n\n    let lowestMaxZoom = 100;\n    let maxRatio = 0;\n    let minRatio = 100;\n\n    // quickly determine the lowest possible max zoom level (i.e., the upper bound for images) across all canvases.\n    // while we're here, compute the global ratios as well.\n    for (let z = 0; z < numCanvases; z++)\n    {\n        const c = canvases[z];\n        const w = c.width;\n        const h = c.height;\n        const mz = getMaxZoomLevel(w, h);\n        const ratio = h / w;\n        maxRatio = Math.max(ratio, maxRatio);\n        minRatio = Math.min(ratio, minRatio);\n\n        lowestMaxZoom = Math.min(lowestMaxZoom, mz);\n    }\n\n    /*\n        These arrays need to be pre-initialized since we will do arithmetic and value checking on them\n    */\n    const totalWidths = new Array(lowestMaxZoom + 1).fill(0);\n    const totalHeights = new Array(lowestMaxZoom + 1).fill(0);\n    const maxWidths = new Array(lowestMaxZoom + 1).fill(0);\n    const maxHeights = new Array(lowestMaxZoom + 1).fill(0);\n\n    for (let i = 0; i < numCanvases; i++)\n    {\n        thisCanvas = canvases[i];\n        canvas = thisCanvas['@id'] || thisCanvas.id;\n        label = thisCanvas.label;\n        if (typeof thisCanvas.images !== 'undefined') {\n            thisResource = thisCanvas.images[0].resource;\n        } else {\n            thisResource = thisCanvas.content[0].items[0];\n        }\n\n        /*\n         * If a canvas has multiple images it will be encoded\n         * with a resource type of \"oa:Choice\". The primary image will be available\n         * on the 'default' key, with other images available under 'item.'\n         * */\n        if (thisResource['@type'] === \"oa:Choice\")\n        {\n            thisMedia = thisResource.default;\n        }\n        else\n        {\n            thisMedia = thisResource;\n        }\n\n        // Prioritize the canvas height / width first, since images may not have h/w\n        width = thisCanvas.width || thisMedia.width;\n        height = thisCanvas.height || thisMedia.height;\n        if (width <= 0 || height <= 0)\n        {\n            console.warn('Invalid width or height for canvas ' + label + '. Skipping');\n            continue;\n        }\n\n        maxZoom = getMaxZoomLevel(width, height);\n\n        if (thisResource.item)\n        {\n            otherImages = getOtherImageData(thisResource.item, lowestMaxZoom);\n        }\n        else\n        {\n            otherImages = [];\n        }\n\n        imageLabel = thisMedia.label || null;\n\n        info = parseImageInfo(thisMedia);\n        url = info.url.slice(-1) !== '/' ? info.url + '/' : info.url;  // append trailing slash to url if it's not there.\n\n        if (typeof thisMedia.service !== 'undefined') {\n            context = thisMedia.service['@context']    \n        } else {\n            context = 3;\n        }\n\n        if (context === 3) \n        {\n            imageAPIVersion = 3;    \n        } \n        else if (context === 'http://iiif.io/api/image/2/context.json')\n        {\n            imageAPIVersion = 2;\n        }\n        else if (context === 'http://library.stanford.edu/iiif/image-api/1.1/context.json')\n        {\n            imageAPIVersion = 1.1;\n        }\n        else\n        {\n            imageAPIVersion = 1.0;\n        }\n\n        zoomDimensions = new Array(lowestMaxZoom + 1);\n\n        for (let k = 0; k < lowestMaxZoom + 1; k++)\n        {\n            widthAtCurrentZoomLevel = Math.floor(incorporateZoom(width, lowestMaxZoom - k));\n            heightAtCurrentZoomLevel = Math.floor(incorporateZoom(height, lowestMaxZoom - k));\n            zoomDimensions[k] = {\n                h: heightAtCurrentZoomLevel,\n                w: widthAtCurrentZoomLevel\n            };\n\n            totalWidths[k] += widthAtCurrentZoomLevel;\n            totalHeights[k] += heightAtCurrentZoomLevel;\n            maxWidths[k] = Math.max(widthAtCurrentZoomLevel, maxWidths[k]);\n            maxHeights[k] = Math.max(heightAtCurrentZoomLevel, maxHeights[k]);\n        }\n\n        pages[i] = {\n            d: zoomDimensions,\n            m: maxZoom,\n            l: label,         // canvas label ('page 1, page 2', etc.)\n            il: imageLabel,   // default image label ('primary image', 'UV light', etc.)\n            f: info.url,\n            url: url,\n            api: imageAPIVersion,\n            paged: thisCanvas.viewingHint !== 'non-paged',\n            facingPages: thisCanvas.viewingHint === 'facing-pages',\n            canvas: canvas,\n            otherImages: otherImages,\n            xoffset: info.x || null,\n            yoffset: info.y || null\n        };\n    }\n\n    const averageWidths = new Array(lowestMaxZoom + 1);\n    const averageHeights = new Array(lowestMaxZoom + 1);\n\n    for (let a = 0; a < lowestMaxZoom + 1; a++)\n    {\n        averageWidths[a] = totalWidths[a] / numCanvases;\n        averageHeights[a] = totalHeights[a] / numCanvases;\n    }\n\n    const dims = {\n        a_wid: averageWidths,\n        a_hei: averageHeights,\n        max_w: maxWidths,\n        max_h: maxHeights,\n        max_ratio: maxRatio,\n        min_ratio: minRatio,\n        t_hei: totalHeights,\n        t_wid: totalWidths\n    };\n\n    return {\n        item_title: manifest.label,\n        dims: dims,\n        max_zoom: lowestMaxZoom,\n        pgs: pages,\n        paged: manifest.viewingHint === 'paged' || (typeof sequence !== 'undefined' ? sequence.viewingHint === 'paged' : false)\n    };\n}\n\n/**\n * Takes in a resource block from a canvas and outputs the following information associated with that resource:\n * - Image URL\n * - Image region to be displayed\n *\n * @param {Object} resource - an object representing the resource block of a canvas section in a IIIF manifest\n * @returns {Object} imageInfo - an object containing image URL and region\n */\nfunction parseImageInfo (resource)\n{\n    let url = resource['@id'] || resource.id;\n    const fragmentRegex = /#xywh=([0-9]+,[0-9]+,[0-9]+,[0-9]+)/;\n    let xywh = '';\n    let stripURL = true;\n\n    if (/\\/([0-9]+,[0-9]+,[0-9]+,[0-9]+)\\//.test(url))\n    {\n        // if resource in image API format, extract region x,y,w,h from URL (after 4th slash from last)\n        // matches coordinates in URLs of the form http://www.example.org/iiif/book1-page1/40,50,1200,1800/full/0/default.jpg\n        const urlArray = url.split('/');\n        xywh = urlArray[urlArray.length - 4];\n    }\n    else if (fragmentRegex.test(url))\n    {\n        // matches coordinates of the style http://www.example.org/iiif/book1/canvas/p1#xywh=50,50,320,240\n        const result = fragmentRegex.exec(url);\n        xywh = result[1];\n    }\n    else if (resource.service && resource.service['@id'])\n    {\n        // assume canvas size based on image size\n        url = resource.service['@id'];\n        // this URL excludes region parameters so we don't need to remove them\n        stripURL = false;\n    }\n\n    if (stripURL)\n    {\n        // extract URL up to identifier (we eliminate the last 5 parameters: /region/size/rotation/quality.format)\n        url = url.split('/').slice(0, -4).join('/');\n    }\n\n    const imageInfo = {\n        url: url\n    };\n\n    if (xywh.length)\n    {\n        // parse into separate components\n        const dimensions = xywh.split(',');\n        imageInfo.x = parseInt(dimensions[0], 10);\n        imageInfo.y = parseInt(dimensions[1], 10);\n        imageInfo.w = parseInt(dimensions[2], 10);\n        imageInfo.h = parseInt(dimensions[3], 10);\n    }\n\n    return imageInfo;\n}\n\n\n//# sourceURL=webpack:///./src/parse-iiif-manifest.js?");

/***/ })

/******/ });