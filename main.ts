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
    if (url == "https://en.wikipedia.org/wiki/Philosophy") {
        console.log("Got to philosophy in " + (chain.length - 1) + " clicks")
        return
    }
    if (chain.slice(0, chain.length - 1).includes(url)) {
        console.log("Got stuck in a loop that started with " + url)
        return
    }
    try {
        const res = await fetch(url)
        if (res.status == 200) {
            const html = await res.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, "text/html")
            const nextPage =
                "https://en.wikipedia.org" +
                Array(...doc.querySelectorAll('#mw-content-text a[href^="/wiki/"]'))
                    // Sorry for terrible one-liner, Prettier decided it should be this way
                    .filter((x) => !(x.getAttribute("href")?.startsWith("/wiki/File:") || x.getAttribute("href")?.startsWith("/wiki/User:") || x.parentElement?.classList.contains("hatnote") || Array(...doc.querySelectorAll("table.infobox a")).includes(x)))[0]
                    .getAttribute("href")
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
