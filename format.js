function text(content) {
    if (content.startsWith("http://") || content.startsWith("https://")) {
        let link = document.createElement("a");
        link.href = content;
        link.appendChild(document.createTextNode(content));
        return link;
    }
    return document.createTextNode(content);
}

function element(elementName, className, ...content) {
    let element = document.createElement(elementName);
    element.className = className;
    for (let item of content) {
        if (item) {
            element.appendChild(item);
        }
    }
    return element;
}

const div = (className, ...content) => element("div", className, ...content);
const span = (className, ...content) => element("span", className, ...content);
const ol = (className, ...content) => element("ol", className, ...content);
const ul = (className, ...content) => element("ul", className, ...content);
const li = (className, ...content) => element("li", className, ...content);


function img(src, title) {
    let element = document.createElement("img");
    element.src = src;
    element.alt = title;
    element.title = title;
    return element;
}

function render(target) {
    if (Array.isArray(target)) {
        return div("array",
            span("punctuation", text("[")),
            ol("array",
                ...target.map((item, index) => li("item",
                    render(item),
                    index < target.length - 1 && span("punctuation", text(", ")),
                )),
            ),
            span("punctuation", text("]")),
        ); 
    }
    if (typeof target == "object") {
        let entries = Object.entries(target);
        
        return div("object",
            span("punctuation", text("{")),
            ul("object",
                target.image && img(...target.image),
                ...entries.map(([key, value], index) => li(`property type-${typeof value} property-${key}`, 
                    span("key",
                        text('"'), 
                        span("key-text", text(key)), 
                        text('"'),
                        text(": "),
                    ),
                    render(value),
                    index < entries.length - 1 && span("punctuation", text(",")),
                )),
            ),
            span("punctuation", text("}")), 
        );
    }
    if (typeof target == "string") {
        return span("string", text('"'), span("string-content", text(target)), text('"'));
    }
    return span(typeof target, text(JSON.stringify(target.toString())));
}

window.onload = async () => {
    let cv = await (await fetch("./CV.json")).json();
    document.body.appendChild(render(cv));
}