import { dictionary, ignoredWords } from "./dictionary";
export function createModal(suggestedWords, wordElement, iframe2Doc) {
  // Create modal container
  const rect = wordElement.getBoundingClientRect();
  const modal = iframe2Doc.createElement('div');
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
  const modalContent = iframe2Doc.createElement('div');
  modalContent.style.cssText = `
      background-color: #f5f6f7;
      padding: 10px;
      border-radius: 5px;
      width: auto;
      position: absolute;
      top:${rect.top + window.scrollY + 20}px;
      left:${rect.left + window.scrollX}px;
  `;

  // Add suggested words list
  const wordList = iframe2Doc.createElement('ul');
  wordList.style.cssText=`
      list-style-type : none;
      margin: 0;
      padding: 0;
  `
  suggestedWords.forEach(word => {
      const listItem = iframe2Doc.createElement('li');
      listItem.style.cssText=`
          margin-right: 20px;
          width: auto;
          display: inline;
          padding : 2px;
          float:left;
      `
      listItem.textContent = word;
      listItem.style.cursor = 'pointer';
      listItem.addEventListener('click', (event) => {
          // Return the selected word and close the modal
          modal.dataset.selectedWord = word;
          iframe2Doc.body.removeChild(modal);
      });
      wordList.appendChild(listItem);
  });
  modalContent.appendChild(wordList);

  // Add close button
  const closeButton = iframe2Doc.createElement('button');
  closeButton.style.cssText=`
       border-radius: 50%;
       position: absolute;
       top: 9px;
       right: 5px;
  `
  closeButton.textContent = 'X';
  closeButton.addEventListener('click', () => {
      iframe2Doc.body.removeChild(modal);
  });
  modalContent.appendChild(closeButton);

  modal.appendChild(modalContent);
  return modal;
}

export function modal(suggestedWords, wordElement, iframe2Doc) {  
  const modalElement = createModal(suggestedWords,wordElement, iframe2Doc);
  iframe2Doc.body.appendChild(modalElement);

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
              iframe2Doc.body.removeChild(modalElement);
              clearInterval(checkForSelection);
              resolve(null);
          }
      });
  });
}

export function highlightedWordListener(text,words, iframe2Doc) {
  //let words = document.getElementsByClassName("highlight-word");

  let suggestedWords = ['Word1', 'Word2', 'Word3', 'Word4'];
  console.log(words)
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
                  const selectedWord = await modal(suggestedWordsForWord ? suggestedWordsForWord : suggestedWords, wordElement,iframe2Doc);
                if(selectedWord == 'IGNORE'){
                      console.log('ignore')
                      //wordElement.outerHTML = wordElement.innerText
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
      
  } else {
      console.log('array is empty');
  }
}

export function traverseAndSetCursorToEnd(contentEditableDiv) {
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

export function resetContent(text){
  const regex = new RegExp('<span class="highlight-word">|<\/span>', 'g');
  const regex2 = new RegExp('<div dir="ltr">', 'g');
  if(text.innerText == ''){
    ignoredWords.length = 0
  }
  if(regex2.test(text.innerHTML)){
    text.innerHTML = text.innerHTML.replace(regex2, '')
    console.log('div ltr exist')
  }
  return text.innerHTML = text.innerHTML.replace(regex, '')
}

export function checkGenderAndHighlight(text) {
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


export function saveCursorPosition(element) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  let preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  let cursorPosition = preCaretRange.toString().length;
  return cursorPosition;
}


export function restoreCursorPosition(element, cursorPosition) {
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

export function setCaretAfterNewline(element, cursorPosition) {
  //let cursorPosition = saveCursorPosition(element);
  let selection = window.getSelection();
  let range = document.createRange();
  
  // Find the last div in the element
  let lastDiv = null;
  for (let i = element.childNodes.length - 1; i >= 0; i--) {
      if (element.childNodes[i].nodeName === 'P') {
          //console.log(element.childNodes[i])
          lastDiv = element.childNodes[i];
          break;
      }
  }
  if (lastDiv) {
      // If the last div is empty or contains only a <br>, set caret inside it
      if (lastDiv.childNodes.length === 0 || (lastDiv.childNodes.length === 1 && lastDiv.firstChild.nodeName === 'BR')) {
          range.setStart(lastDiv, 0);
          range.setEnd(lastDiv, 0);
          //console.log('div with br')
      } else{
          // If the last div has content, set caret after it
          restoreCursorPosition(element, cursorPosition)

          return
      }
  } else {
      // If no div found, set caret at the end of the element
      restoreCursorPosition(element, cursorPosition)

      return
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

