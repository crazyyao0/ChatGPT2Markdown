// ==UserScript==
// @name         ChatGPT conversation to markdown
// @namespace    https://chat.openai.com/
// @version      0.1
// @description  Export chatgpt conversation to markdown language
// @author       Frank Yao
// @match        https://chat.openai.com/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==



function ElementToMarkdown(e){
    var md = ""
    for (var c of e.childNodes)
    {
        if(c.nodeName == "DIV"){
            md += ElementToMarkdown(c);
        }else if(c.nodeName == "P"){
            md += ElementToMarkdown(c) + "\n\n";
        }else if(c.nodeName == "A"){
            md += "["+ c.innerText +"]("+c.href+")";
        }else if(c.nodeName == "OL"){
		    var index = 1
		    if (c.hasAttribute("start"))
				index = parseInt(c.getAttribute("start"))
            for (var d of c.getElementsByTagName("li")){
                md += index.toString() + ". " + ElementToMarkdown(d) + "\n";
				index += 1
            }
            md += "\n"
        }else if(c.nodeName == "UL"){
            for (var ui of c.getElementsByTagName("li")){
                md += "- " + ElementToMarkdown(ui) + "\n";
				index += 1
            }
            md += "\n"
        }else if(c.nodeName == "#text"){
            md += c.textContent;
        }else if(c.nodeName == "CODE"){
            md += "`"+c.innerText+"`";
        }else if(c.nodeName == "PRE"){
            var codes = c.innerText.split("\n")
			if (codes[0] == "Copy code")
            {
				md += "```\n" + codes.slice(1).join("\n") + "```\n"
            }else{
				md += "```"+codes[0]+"\n" + codes.slice(2).join("\n") + "```\n"
            }
        }else if(c.nodeName == "TABLE"){
		    var headers = Array.from(c.querySelectorAll('th'));
            var rows = Array.from(c.querySelectorAll('tr')).slice(1);
			md += `
${headers.map(h => `| ${h.textContent.trim()} `).join('')}|
${headers.map(() => '| --- ').join('')}|
${rows.map(row => `|${Array.from(row.querySelectorAll('td')).map(d => ` ${d.textContent.trim()} `).join('|')}|`).join('\n')}

`;
        }
    }
    return md;
}

function saveAsMarkdown(){
    var md = document.title + "\n====\n";
    var e = document.getElementsByClassName("text-base");
    for (var s of e){
        var t = s.querySelector(".whitespace-pre-wrap");
        if(!t) continue;
        if (s.querySelector('img')){
            md += "**Human**:\n```\n" + t.innerText + "\n```\n";
        }
        else{
            md += "**ChatGPT**:\n\n" + ElementToMarkdown(t) + "\n---\n";
        }
    }
    //console.log(md)
    navigator.clipboard.writeText(md);
    alert("Copied to the clipboard");
}


function addButton(text, onclick) {
    let s = document.createElement('style')
    s.appendChild(document.createTextNode(`
button#mybutton {
  appearance: none;
  background-color: #10a37f;
  border: 1px solid rgba(27, 31, 35, .15);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, .1) 0 1px 0;
  box-sizing: border-box;
  color: #fff;
  font-family: -apple-system,system-ui,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 16px;
  position: absolute;
  text-align: center;
  text-decoration: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
  top: 10px;
  right: 10px;
  z-index: 3;
}`))
    document.getElementsByTagName('head')[0].appendChild(s)

    let btn = document.createElement('button')
    document.body.appendChild(btn)
    btn.innerHTML = text
    btn.onclick = onclick
    btn.id="mybutton"
    return btn
}


document.body.append(addButton("Export as Markdown", saveAsMarkdown))
