import { DOMParser } from "jsr:@b-fuze/deno-dom"

const chain: string[] = []

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

async function doPage(url: string) {
    try {
        const res = await fetch(url)
        if (res.status == 200) {
            const html = await res.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, "text/html")
            const nextPage = "https://en.wikipedia.org" + doc.querySelector('#mw-content-text p:not(.hatnote) a[href^="/wiki/"]')?.getAttribute("href")
            console.log(`Going from ${url} -> ${nextPage}`)
            chain.push(nextPage)
            doPage(chain[chain.length - 1])
        } else {
            console.log("Error " + res.status + " " + res.statusText)
        }
    } catch (err) {
        console.log(err)
    }
}

doPage(chain[0])
