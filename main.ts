import { DOMParser } from "jsr:@b-fuze/deno-dom"

const chain: string[] = []
const chainTitles: string[] = []

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
        chainTitles.push("\x1b[1mPhilosophy\x1b[22m")
        console.log("Path: " + chainTitles.join(" -> "))
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
            const title = doc.querySelector("title")?.innerText.split(" - Wikipedia")[0]!
            chainTitles.push(title)
            const nextPage =
                "https://en.wikipedia.org" +
                Array(...doc.querySelectorAll('#mw-content-text a[href^="/wiki/"]'))
                    .filter(
                        (x) =>
                            !(
                                x.getAttribute("href")?.startsWith("/wiki/File:") ||
                                x.getAttribute("href")?.startsWith("/wiki/Wikipedia:") ||
                                x.getAttribute("href")?.startsWith("/wiki/Special:") ||
                                x.getAttribute("href")?.startsWith("/wiki/Talk:") ||
                                x.getAttribute("href")?.startsWith("/wiki/Template:") ||
                                x.getAttribute("href")?.startsWith("/wiki/Help:") ||
                                x.getAttribute("href")?.startsWith("/wiki/Category:") ||
                                x.getAttribute("href")?.startsWith("/wiki/User:") ||
                                x.getAttribute("href")?.endsWith("_(disambiguation)") ||
                                x.parentElement?.classList.contains("hatnote") ||
                                Array(...doc.querySelectorAll("table a")).includes(x) ||
                                Array(...doc.querySelectorAll(".thumbinner a")).includes(x) ||
                                Array(...doc.querySelectorAll("figure a")).includes(x)
                            )
                    )[0]
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
