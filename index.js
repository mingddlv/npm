(function(window,library){
    let document = window.document;
    let documentElement = document.documentElement;
    let metaElement = document.querySelector("meta[name='viewport']")
    let flexibleElement = document.querySelector("meta[name='flexible']")
    let dpr = 0;
    let scale = 0;
    let tid;
    let flexible = library.flexible || (library.flexible = {})

    if(metaElement){
        console.warn("the scale will be depended on the meta existed!!!")
        let match = metaElement.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if(match){
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
    }else if(flexibleElement){
        let content = flexibleElement.getAttribute('content');
        if(content){
            let initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            let maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if(initialDpr){
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1/dpr).toFixed(2));
            }
            if(maximumDpr){
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1/dpr).toFixed(2));
            }
        }
    }

    if (!dpr && !scale) {
        // let isAndroid = window.navigator.appVersion.match(/android/gi);
        let isIPhone = window.navigator.appVersion.match(/iphone/gi);
        let devicePixelRatio = window.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    documentElement.setAttribute('data-dpr',dpr);

    if(!metaElement){
        metaElement = document.createElement("meta");
        metaElement.setAttribute("name","viewport");
        metaElement.setAttribute("content","initial-scale="+scale+",maximum-scale="+scale+",minimum-scale="+scale+",user-scalable=no");
        if(documentElement.firstElementChild){
            documentElement.appendChild(metaElement);
        }else{
            let wrap = document.createElement("div");
            wrap.appendChild(wrap);
            document.write(wrap.innerHTML);
        }
    }

    function refreshRem(){
        let width = documentElement.getBoundingClientRect().width;
        if(width / dpr > 540 ){
            width = width * dpr;
        }
        let rem = width / 10;
        documentElement.style.fontStyle = rem + "px";
        flexible.rem = window.rem = rem;
    }

    window.addEventListener("resize",function(){
        clearTimeout(tid);
        tid = setTimeout(refreshRem,300);
    },false);
    window.addEventListener("pageshow",function(e){
        if(e.persisted){
            clearTimeout(tid);
            tid = setTimeout(refreshRem,300)
        }
    },false);

    if(document.readyState === "complete"){
        document.body.style.fontSize = 12 * dpr + "px";
    }else{
        document.addEventListener("DOMContentLoaded",function(){
            document.body.style.fontSize = 12 * dpr + "px";
        },false)
    }

    refreshRem();

    flexible.dpr = window.dpr = dpr;
    flexible.refreshRem = refreshRem();

    flexible.rem2px = function(d){
        let value = parseFloat(d) * this.rem;
        if(typeof d === "string" && d.match(/rem$/)){
            value += "px";
        }
        return value;
    }

    flexible.px2rem = function(d){
        let value = parseFloat(d) / this.rem;
        if(typeof d === "string" && d.match(/px$/)){
            value += "rem";
        }
        return value;
    }

})(window,window["library"] || (window["library"] = {}));