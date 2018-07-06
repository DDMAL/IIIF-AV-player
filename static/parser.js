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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/parser.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/manifest-object.js":
/*!********************************!*\
  !*** ./src/manifest-object.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ManifestObject; });\nclass ManifestObject \n{\n    constructor () \n    {\n        this.id;\n        this.type;\n        this.label;\n        this.description;\n        this.canvases;\n    }\n\n    getObject (responseData) \n    {\n        this.parseManifest(responseData);\n        return this;\n    }\n\n    // updates all attributes\n    parseManifest (manifest)  \n    {\n        // parse the manifest and assign to attributes\n        this.id = manifest.id;\n        this.type = manifest.type;\n        this.label = manifest.label;\n        this.description = manifest.description;\n\n        // get canvas stuff\n        this.canvases = [];\n        if (Array.isArray(manifest.sequences)) {\n            this.canvases = manifest.sequences[0].canvases;\n        } else if (manifest.type == 'Canvas') {\n            this.canvases.push(manifest);\n        } else {\n            this.canvases = manifest.sequences.canvases;\n        }\n    }\n}\n\n//# sourceURL=webpack:///./src/manifest-object.js?");

/***/ }),

/***/ "./src/parser.js":
/*!***********************!*\
  !*** ./src/parser.js ***!
  \***********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _manifest_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./manifest-object */ \"./src/manifest-object.js\");\n\n\nclass Parser \n{\n    constructor () \n    {\n        this.manifest = null;\n    }\n\n    fetchManifest (manifestURL, callback)\n    {\n        fetch(manifestURL, {\n            headers: {\n                \"Accept\": \"application/json\"\n            }\n        }).then( (response) =>\n        {\n            if (!response.ok)\n            {\n                alert('Could not get manifest! Make sure you provide a proper link.');\n            }\n            return response.json();\n        }).then( (responseData) =>\n        {\n            this.setManifest(responseData, callback);\n        });\n    }\n\n    setManifest (responseData, callback)\n    {\n        let mo = new _manifest_object__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.manifest = mo.getObject(responseData);\n\n        callback(this.manifest);\n    }\n}\n\n(function (global)\n{\n    global.Parser = global.Parser || Parser;\n}) (window);\n\n//# sourceURL=webpack:///./src/parser.js?");

/***/ })

/******/ });