const chain = []
while (true) {
    let page = prompt("Page:")!
    if (!page) {
        console.log("Please enter a page name or URL.")
        continue
    }
    if (!page?.startsWith("https://en.wikipedia.org/wiki/")) {
        page = "https://en.wikipedia.org/wiki/" + page
    }
    try {
        const res = await fetch(page)
        if (res.status == 200) {
            chain.push(page)
            break
        } else {
            console.log("Error " + res.status + " " + res.statusText)
        }
    } catch (err) {
        console.log(err)
    }
}
console.log("Starting path from " + chain[0])
