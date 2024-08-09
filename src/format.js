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
    if (className) element.className = className;
    for (let item of content) {
        if (item?.constructor == Object) {
            Object.assign(element, item);
        } else if (item) {
            element.append(item);
        }
    }
    return element;
}

const { div, span, ol, ul, li, img, a } = new Proxy({}, {
    get(target, name) {
        return (className, ...content) => element(name, className, ...content);
    }
})


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
        let link = target.link;
        let image = target.image ? img('', { src: target.image[0], title: target.image[1], alt: target.image[1] }) : null;

        return div("object",
            span("punctuation", text("{")),
            image,
            ul("object",
                ...Object.entries(target)
                    .filter(([key]) => !["image", "link"].includes(key))
                    .map(([key, value], index, array) =>
                        li(`property type-${typeof value} property-${key}`,
                            span("key",
                                span("inline-punctuation", text('"')),
                                span("key-text", text(key)),
                                span("inline-punctuation", text('": ')),
                            ),
                            key == "name" && link
                                ? a('link', { href: link }, render(value))
                                : render(value),
                            index < array.length - 1 && span("punctuation", text(",")),
                        )
                    ),
            ),
            span("punctuation", text("}")),
        );
    }
    if (typeof target == "string") {
        return span("string", span("inline-punctuation", text('"')), span("string-content", text(target)), span("inline-punctuation", text('"')));
    }
    return span(typeof target, text(JSON.stringify(target.toString())));
}

window.onload = async () => {
    let cv = await (await fetch("./CV.json")).json();
    let version = new Date().toISOString().slice(0, 16).replace("T", " ");
    cv.version = version;
    document.body.appendChild(div("cv", render(cv)));
    [...document.querySelectorAll("script")].forEach(element => element.remove());
};