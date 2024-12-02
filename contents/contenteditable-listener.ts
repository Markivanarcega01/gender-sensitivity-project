import type { PlasmoCSConfig } from "plasmo"
import {dictionary, ignoredWords} from "../components/dictionary"

export const config: PlasmoCSConfig = {
  //matches: ["<all_urls>"],
  matches: ["https://mail.google.com/mail/*", "http://127.0.0.1:8000/bias_checker/", "https://markivan01.pythonanywhere.com/bias_checker/"],
  run_at: "document_end",
  //css: ["font.css"]
}

let div = document.createElement('div')
let btn = document.createElement('button')
let timeout = null

document.addEventListener("input", (event) => { // there is a bug wherein the suggested words are messing up the contenteditable
  if(event.target instanceof HTMLElement && event.target.contentEditable === "true"){
    const target = event.target as HTMLElement
    let cursorPosition = saveCursorPosition(target)
    let words = document.getElementsByClassName("highlight-word")
    //setCaretAfterNewline(target, cursorPosition)
    if(timeout){
      btn.style.display = "block"
      //btn.style.opacity= '1'
      clearTimeout(timeout)
    }
    timeout = setTimeout(()=>{
      //btn.style.opacity= '0'
      btn.style.display = "none"
      resetContent(target)
      checkGenderAndHighlight(target)
      highlightedWordListener(target,words, cursorPosition)
      //restoreCursorPosition(target, cursorPosition)
      setCaretAfterNewline(target, cursorPosition)
    },3000)

    // if(target.innerText != ''){
    //   btn.style.opacity= '1'
    // }else{
    //   btn.style.opacity = '0'
    // }
    // if(btn.hasAttribute('listener')){
    //   btn.addEventListener('click',(event)=>{
    //     resetContent(target)
    //     checkGenderAndHighlight(target)
    //     highlightedWordListener(target,words, cursorPosition)
    //   })
    // }else{
    //   console.log('attribute is set')
    //   btn.setAttribute('listener', 'true')
    // }

  }
  
})


function createModal(suggestedWords, wordElement) {
  // Create modal container
  const rect = wordElement.getBoundingClientRect();
  const modal = document.createElement('div');
  modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
      background-color: #f5f6f7;
      padding: 10px;
      border-radius: 5px;
      width: auto;
      position: absolute;
      top:${rect.top + window.scrollY + 30}px;
      left:${rect.left + window.scrollX}px;
  `;

  // Add suggested words list
  const wordList = document.createElement('ul');
  wordList.style.cssText=`
      list-style-type : none;
      margin: 0;
      padding: 0;
  `
  suggestedWords.forEach(word => {
      const listItem = document.createElement('li');
      listItem.style.cssText=`
          margin-right: 20px;
          width: auto;
          display: table;
          padding : 2px;
      `
      listItem.textContent = word;
      listItem.style.cursor = 'pointer';
      listItem.addEventListener('click', (event) => {
          // Return the selected word and close the modal
          modal.dataset.selectedWord = word;
          document.body.removeChild(modal);
      });
      wordList.appendChild(listItem);
  });
  modalContent.appendChild(wordList);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.style.cssText=`
       border-radius: 50%;
       position: absolute;
       top: 9px;
       right: 5px;
  `
  closeButton.textContent = 'X';
  closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
  });
  modalContent.appendChild(closeButton);

  modal.appendChild(modalContent);
  return modal;
}

function modal(suggestedWords, wordElement) {  
  const modalElement = createModal(suggestedWords,wordElement);
  document.body.appendChild(modalElement);

  return new Promise((resolve) => {
      //Setup an interval to check if a word has been selected
      const checkForSelection = setInterval(() => {
          if (modalElement.dataset.selectedWord) {
              //If a word is selected, clear the interval and resolve the Promise with the selected word
              clearInterval(checkForSelection);
              resolve(modalElement.dataset.selectedWord);
          }
      }, 100);

      modalElement.addEventListener('click', (event) => {
          if (event.target === modalElement) {
              document.body.removeChild(modalElement);
              clearInterval(checkForSelection);
              resolve(null);
          }
      });
  });
}

function highlightedWordListener(text, words, cursorPosition) {

  let suggestedWords = ['Word1', 'Word2', 'Word3', 'Word4'];
  //console.log(words)
  if (words.length > 0) {
      for (let i = 0; i < words.length; i++) {
          /**
              * Once magkaroon na ng AI, we can refactor this into mouseover/mouseout event
              * For now, naka click muna siya since naka list/hardcoded pa ang suggested word
              * 
              * Reason: If AI na ang gamit hindi na problem ang indexes since neural network na ang gamit
              *           Kaya naka IIFE(Immediately Invoke Function Expression) kasi DOM is realtime so kada remove sa classList
              *               is nababago yung indexes ng bawat words which change the matching of index and suggested word
           */
          (function (wordElement: any) { // Capture the specific word element
              let suggestedWordsForWord = dictionary[wordElement.innerText];
              
              wordElement.addEventListener('click', async function modalPopUp(event) {
                  const selectedWord = await modal(suggestedWordsForWord ? suggestedWordsForWord : suggestedWords, wordElement);
                  if(selectedWord == 'IGNORE'){
                      console.log('ignore')
                      ignoredWords.push(wordElement.innerText)
                      wordElement.classList.remove('highlight-word')
                      wordElement.classList.add('ignore-word')
                      traverseAndSetCursorToEnd(text);
                  }
                  else if(selectedWord && typeof wordElement.innerText !== 'undefined') {
                      wordElement.outerHTML = selectedWord;
                      traverseAndSetCursorToEnd(text); // Traverse and set cursor to the end
                  } else {
                      console.log('error');
                      traverseAndSetCursorToEnd(text);
                  }
              });
          })(words[i]); // Immediately invoke function with the word element
      }
      let ignoreWords = document.getElementsByClassName("ignore-word");
      console.log(ignoreWords)
  } else {
      console.log('array is empty');
  }
}

function traverseAndSetCursorToEnd(contentEditableDiv) {
  // Focus on the contenteditable div
  contentEditableDiv.focus();

  // Create a range
  const range = document.createRange();
  const selection = window.getSelection();

  // Set the range to the end of the contenteditable div
  range.selectNodeContents(contentEditableDiv);
  range.collapse(false); // false collapses the range to the end

  // Remove any selections and add the new range
  selection.removeAllRanges();
  selection.addRange(range);
}

function resetContent(text){
  const regex = new RegExp('<span class="highlight-word">|<\/span>', 'g');
  const regex2 = new RegExp('<div dir="ltr">', 'g');
  //const regex3 = document.querySelector('.XjviVd.yq')
  if(text.innerText == ''){
    ignoredWords.length = 0
  }
  // if(regex3){
  //   text.innerHTML = text.innerHTML.replace(regex3, '')
  // }
  if(regex2.test(text.innerHTML)){
    text.innerHTML = text.innerHTML.replace(regex2, '')
    console.log('div ltr exist')
  }
  return text.innerHTML = text.innerHTML.replace(regex, '')

}

function checkGenderAndHighlight(text) {
  let textWithHTML = text.innerHTML

  // Bawal ang 2 or more words as dictionary keys ex: man (and) one man show
  Object.keys(dictionary).forEach(word =>{
    if(ignoredWords.includes(word)){
      return
    }
    const regex = new RegExp(`\\b${word}\\b`,'gi')    
    textWithHTML = textWithHTML.replace(regex, `<span class='highlight-word'>${word}<\/span>`)
  })

  text.innerHTML = textWithHTML
  console.log({asd:textWithHTML})
  return text;
}


function saveCursorPosition(element) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  let preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  let cursorPosition = preCaretRange.toString().length;
  return cursorPosition;
}

// // Function to restore the cursor position after modifying content
function restoreCursorPosition(element, cursorPosition) {
  let selection = window.getSelection();
  let range = document.createRange();

  // Traverse the element's text nodes to find the right position to place the cursor
  let node = element;
  let chars = cursorPosition;
  function traverseNodes(node) {
      if (node.nodeType === 3) { // Text node
          if (node.length >= chars) {
              range.setStart(node, chars);
              range.setEnd(node, chars);
              return true;
          } else {
              chars -= node.length;
          }
      } else {
          for (let i = 0; i < node.childNodes.length; i++) {
              if (traverseNodes(node.childNodes[i])) {
                  return true;
              }
          }
      }
      return false;
  }
  
  traverseNodes(node);

  selection.removeAllRanges();
  selection.addRange(range);
}

function setCaretAfterNewline(element, cursorPosition) {
  let selection = window.getSelection();
  let range = document.createRange();
  console.log({caret:cursorPosition})
  // Find the last div in the element
  let lastDiv = null;
  for (let i = element.childNodes.length - 1; i >= 0; i--) {
      if (element.childNodes[i].nodeName === 'DIV') {
          lastDiv = element.childNodes[i];
          break;
      }
  }
  //const skip = element.querySelector('.XjviVd.yq')
  if (lastDiv) {
      // If the last div is empty or contains only a <br>, set caret inside it
      // lastDiv.childNodes.length === 0 || (lastDiv.childNodes.length === 1 && lastDiv.firstChild.nodeName === 'BR')
      if (lastDiv.childNodes.length === 0 || (lastDiv.childNodes.length === 1 && lastDiv.firstChild.nodeName === 'BR')) {
          range.setStart(lastDiv, 0);
          range.setEnd(lastDiv, 0);
          //console.log('div with br')
      } else{
        restoreCursorPosition(element, cursorPosition)
        return
      }
  } else {
      // If no div found, set caret at the end of the element
    console.log('no div found')
    restoreCursorPosition(element, cursorPosition)
    return
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

let style = document.createElement('style');
style.innerHTML = `
    .highlight-word {
        text-decoration: underline;
        text-decoration-color: blue;
        cursor: text;
    }
    @keyframes rotating {
      50% {transform: rotate(360deg);}
    }
`;
document.head.appendChild(style);


div.style.cssText=`
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
`
btn.style.cssText = `
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: #0160C9;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-family: system-ui, -apple-system, sans-serif;
  transition: background-color 0.2s;
  animation: rotating 3s infinite;
  display: none;
`;
btn.textContent = "G"
div.appendChild(btn)

document.body.appendChild(div)
