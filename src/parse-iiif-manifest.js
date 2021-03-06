import {Player} from './player';

const getMaxZoomLevel = (width, height) =>
{
    const largestDimension = Math.max(width, height);
    return Math.ceil(Math.log((largestDimension + 1) / (256 + 1)) / Math.log(2));
};

const incorporateZoom = (imageDimension, zoomDifference) => imageDimension / (Math.pow(2, zoomDifference));

const getOtherImageData = (otherImages, lowestMaxZoom) =>
{
    return otherImages.map( (itm) =>
    {
        const w = itm.width;
        const h = itm.height;
        const info = parseImageInfo(itm);
        const url = info.url.slice(-1) !== '/' ? info.url + '/' : info.url;  // append trailing slash to url if it's not there.

        const dims = new Array(lowestMaxZoom + 1);
        for (let j = 0; j < lowestMaxZoom + 1; j++)
        {
            dims[j] = {
                h: Math.floor(incorporateZoom(h, lowestMaxZoom - j)),
                w: Math.floor(incorporateZoom(w, lowestMaxZoom - j))
            };
        }

        return {
            f: info.url,
            url: url,
            il: itm.label || "",
            d: dims
        };
    });
};

/**
 *  Check if manifest is IIIFv3, then send to appropriate parser. IIIFv3 manifests MUST have
 *  the 'items' property, whereas v2 will not.
*/
export default function parseVersionManifest (manifest) 
{
    if (manifest.items) 
    {
        console.log('IIIF v3 Manifest, work in progress');
        return parseIIIF3Manifest(manifest);
    }
    else 
    {
        console.log('IIIF v2 (or lower) Manifest');
        return parseIIIFManifest(manifest);
    }
}

function parseIIIF3Manifest (manifest) 
{
    var canvases = manifest.items,
        numCanvases = canvases.length;

    for (var i = 0; i < numCanvases; i++) 
    {
        let canvas = canvases[i];
        let canvasDims = {
            width: canvas.width,
            height: canvas.height
        };

        let annotationPages = canvas.items,
            numAnnotationPages = annotationPages.length;

        for (var j = 0; j < numAnnotationPages; j++) 
        {   
            let annotations = annotationPages[j].items,
                numAnnotations = annotations.length;

            // iterate over all annotations (media items)
            for (var k = 0; k < numAnnotations; k++) 
            {
                let annotation = annotations[k];
                let body = annotation.body;

                if (annotation.motivation !== "painting") 
                    continue;

                // if choice choose first
                if (body.type === "Choice") 
                {
                    annotation.body = body.items[0];
                } 

                // get the target zones of media onto canvas
                let spatialTarget = /xywh=([^&]+)/g.exec(annotation.target);
                let temporalTarget = /t=([^&]+)/g.exec(annotation.target);
                var xywh;
                var t;
                if (spatialTarget && spatialTarget[1]) 
                {
                    xywh = spatialTarget[1].split(',');
                } 
                else 
                {
                    xywh = [0, 0, canvas.width, canvas.height];
                }
                if(temporalTarget && temporalTarget[1]) 
                {
                    t = temporalTarget[1].split(',');
                } 
                else 
                {
                    t = [0, canvas.duration];
                }

                let percentageLeft = parseInt(xywh[0]) / canvas.width * 100,
                    percentageTop = parseInt(xywh[1]) / canvas.height * 100,
                    percentageWidth = parseInt(xywh[2]) / canvas.width * 100,
                    percentageHeight = parseInt(xywh[3]) / canvas.height * 100;

                // info of media item for rendering
                var info = {
                    'type': annotation.body.type,
                    'source': annotation.body.id,
                    'offsetX': percentageLeft,
                    'offsetY': percentageTop,
                    'width': percentageWidth,
                    'height': percentageHeight,
                    'start': parseInt(t[0]),
                    'end': parseInt(t[1])
                };

                // render media item onto page
                let player = new Player();
                player.render(info);
            }
        }

        canvases[i] = {
            url: canvas.id,
            type: canvas.type,
            label: canvas.label || "Label",
            dims: canvasDims,
            duration: canvas.duration,
            annotationPages: annotationPages
        };
    }

    // parse structures into different timestamps
    // assumes depth-2 structure (range then items)
    let starts = [];
    let ends = [];
    let structures = manifest.structures;
    if (structures)
    {
        for (var m = 0; m < structures.length; m++) 
        {
            let range = structures[m];

            for (var n = 0; n < range.items.length; n++)
            {   

                if (range.items[n].id.includes('#','=',','))
                {
                    // get x from #t=x,y 
                    let time = range.items[n].id.split('#')[1].split('=')[1].split(',');

                    starts.push(time[0]);
                    ends.push(time[1]);
                }
            }
        }
    }

    // parse additional rendering file information
    var rendering;
    let renderings = manifest.rendering;
    if (renderings)
    {
        let numRenderings = renderings.length;

        for (var r = 0; r < numRenderings; r++) 
        {
            rendering = renderings[r];

            if (rendering.id.search(".mei") !== -1) 
                break;
        }
    }

    return {
        item_title: manifest.label,
        url: manifest.id,
        canvases: canvases,
        structures: structures,
        timeStarts: starts,
        timeEnds: ends,
        rendering: rendering
    };
}

/**
 * Parses an IIIF Presentation API Manifest and converts it into a Diva.js-format object
 * (See https://github.com/DDMAL/diva.js/wiki/Development-notes#data-received-through-ajax-request)
 *
 * @param {Object} manifest - an object that represents a valid IIIF manifest
 * @returns {Object} divaServiceBlock - the data needed by Diva to show a view of a single document
 */
function parseIIIFManifest (manifest)
{
    var sequence = manifest.sequences[0];
    var canvases = sequence.canvases; 
    const numCanvases = canvases.length;

    const pages = new Array(canvases.length);

    let thisCanvas, thisResource, thisImage, otherImages, context, url, info, imageAPIVersion, width, height, maxZoom, canvas, label, imageLabel, zoomDimensions, widthAtCurrentZoomLevel, heightAtCurrentZoomLevel;

    let lowestMaxZoom = 100;
    let maxRatio = 0;
    let minRatio = 100;

    // quickly determine the lowest possible max zoom level (i.e., the upper bound for images) across all canvases.
    // while we're here, compute the global ratios as well.
    for (let z = 0; z < numCanvases; z++)
    {
        const c = canvases[z];
        const w = c.width;
        const h = c.height;
        const mz = getMaxZoomLevel(w, h);
        const ratio = h / w;
        maxRatio = Math.max(ratio, maxRatio);
        minRatio = Math.min(ratio, minRatio);

        lowestMaxZoom = Math.min(lowestMaxZoom, mz);
    }

    /*
        These arrays need to be pre-initialized since we will do arithmetic and value checking on them
    */
    const totalWidths = new Array(lowestMaxZoom + 1).fill(0);
    const totalHeights = new Array(lowestMaxZoom + 1).fill(0);
    const maxWidths = new Array(lowestMaxZoom + 1).fill(0);
    const maxHeights = new Array(lowestMaxZoom + 1).fill(0);

    for (let i = 0; i < numCanvases; i++)
    {
        thisCanvas = canvases[i];
        canvas = thisCanvas['@id'];
        label = thisCanvas.label;
        thisResource = thisCanvas.images[0].resource;

        /*
         * If a canvas has multiple images it will be encoded
         * with a resource type of "oa:Choice". The primary image will be available
         * on the 'default' key, with other images available under 'item.'
         * */
        if (thisResource['@type'] === "oa:Choice")
        {
            thisImage = thisResource.default;
        }
        else
        {
            thisImage = thisResource;
        }

        // Prioritize the canvas height / width first, since images may not have h/w
        width = thisCanvas.width || thisImage.width;
        height = thisCanvas.height || thisImage.height;
        if (width <= 0 || height <= 0)
        {
            console.warn('Invalid width or height for canvas ' + label + '. Skipping');
            continue;
        }

        maxZoom = getMaxZoomLevel(width, height);

        if (thisResource.item)
        {
            otherImages = getOtherImageData(thisResource.item, lowestMaxZoom);
        }
        else
        {
            otherImages = [];
        }

        imageLabel = thisImage.label || null;

        info = parseImageInfo(thisImage);
        url = info.url.slice(-1) !== '/' ? info.url + '/' : info.url;  // append trailing slash to url if it's not there.

        context = thisImage.service['@context'];
        if (context === 'http://iiif.io/api/image/2/context.json')
        {
            imageAPIVersion = 2;
        }
        else if (context === 'http://library.stanford.edu/iiif/image-api/1.1/context.json')
        {
            imageAPIVersion = 1.1;
        }
        else
        {
            imageAPIVersion = 1.0;
        }

        zoomDimensions = new Array(lowestMaxZoom + 1);

        for (let k = 0; k < lowestMaxZoom + 1; k++)
        {
            widthAtCurrentZoomLevel = Math.floor(incorporateZoom(width, lowestMaxZoom - k));
            heightAtCurrentZoomLevel = Math.floor(incorporateZoom(height, lowestMaxZoom - k));
            zoomDimensions[k] = {
                h: heightAtCurrentZoomLevel,
                w: widthAtCurrentZoomLevel
            };

            totalWidths[k] += widthAtCurrentZoomLevel;
            totalHeights[k] += heightAtCurrentZoomLevel;
            maxWidths[k] = Math.max(widthAtCurrentZoomLevel, maxWidths[k]);
            maxHeights[k] = Math.max(heightAtCurrentZoomLevel, maxHeights[k]);
        }

        pages[i] = {
            d: zoomDimensions,
            m: maxZoom,
            l: label,         // canvas label ('page 1, page 2', etc.)
            il: imageLabel,   // default image label ('primary image', 'UV light', etc.)
            f: info.url,
            url: url,
            api: imageAPIVersion,
            paged: thisCanvas.viewingHint !== 'non-paged',
            facingPages: thisCanvas.viewingHint === 'facing-pages',
            canvas: canvas,
            otherImages: otherImages,
            xoffset: info.x || null,
            yoffset: info.y || null
        };
    }

    const averageWidths = new Array(lowestMaxZoom + 1);
    const averageHeights = new Array(lowestMaxZoom + 1);

    for (let a = 0; a < lowestMaxZoom + 1; a++)
    {
        averageWidths[a] = totalWidths[a] / numCanvases;
        averageHeights[a] = totalHeights[a] / numCanvases;
    }

    const dims = {
        a_wid: averageWidths,
        a_hei: averageHeights,
        max_w: maxWidths,
        max_h: maxHeights,
        max_ratio: maxRatio,
        min_ratio: minRatio,
        t_hei: totalHeights,
        t_wid: totalWidths
    };

    return {
        item_title: manifest.label,
        dims: dims,
        max_zoom: lowestMaxZoom,
        pgs: pages,
        paged: manifest.viewingHint === 'paged' || sequence.viewingHint === 'paged'
    };
}

/**
 * Takes in a resource block from a canvas and outputs the following information associated with that resource:
 * - Image URL
 * - Image region to be displayed
 *
 * @param {Object} resource - an object representing the resource block of a canvas section in a IIIF manifest
 * @returns {Object} imageInfo - an object containing image URL and region
 */
function parseImageInfo (resource)
{
    let url = resource['@id'] || resource.id;
    const fragmentRegex = /#xywh=([0-9]+,[0-9]+,[0-9]+,[0-9]+)/;
    let xywh = '';
    let stripURL = true;

    if (/\/([0-9]+,[0-9]+,[0-9]+,[0-9]+)\//.test(url))
    {
        // if resource in image API format, extract region x,y,w,h from URL (after 4th slash from last)
        // matches coordinates in URLs of the form http://www.example.org/iiif/book1-page1/40,50,1200,1800/full/0/default.jpg
        const urlArray = url.split('/');
        xywh = urlArray[urlArray.length - 4];
    }
    else if (fragmentRegex.test(url))
    {
        // matches coordinates of the style http://www.example.org/iiif/book1/canvas/p1#xywh=50,50,320,240
        const result = fragmentRegex.exec(url);
        xywh = result[1];
    }
    else if (resource.service && resource.service['@id'])
    {
        // assume canvas size based on image size
        url = resource.service['@id'];
        // this URL excludes region parameters so we don't need to remove them
        stripURL = false;
    }

    if (stripURL)
    {
        // extract URL up to identifier (we eliminate the last 5 parameters: /region/size/rotation/quality.format)
        url = url.split('/').slice(0, -4).join('/');
    }

    const imageInfo = {
        url: url
    };

    if (xywh.length)
    {
        // parse into separate components
        const dimensions = xywh.split(',');
        imageInfo.x = parseInt(dimensions[0], 10);
        imageInfo.y = parseInt(dimensions[1], 10);
        imageInfo.w = parseInt(dimensions[2], 10);
        imageInfo.h = parseInt(dimensions[3], 10);
    }

    return imageInfo;
}
